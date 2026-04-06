/**
 * 📨 ENDPOINT: Envio de Mensagem de Texto Simples
 * POST /make-server-844b77a1/api/whatsapp/send-message
 * 
 * Envia uma mensagem de texto livre via WhatsApp Cloud API
 * REQUER AUTENTICAÇÃO
 * REQUER JANELA DE 24H (última mensagem inbound < 24h)
 * 
 * Fluxo:
 * 1. Validar autenticação
 * 2. Verificar janela de 24h
 * 3. Salvar mensagem no banco com status 'queued' (INSERT)
 * 4. Enviar via Meta API
 * 5. Atualizar mensagem com provider_message_id e status 'sent' (UPDATE)
 */

import { Context } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as whatsapp from "./whatsapp.tsx";

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

/**
 * Salva uma mensagem enviada (outbound) no banco de dados
 */
async function saveOutboundMessage(params: {
  conversationId: string;
  type: 'text' | 'template';
  body: string;
  providerMessageId?: string;
  toPhoneE164?: string;
  templateName?: string;
}): Promise<{ success: boolean; dbMessageId?: string; error?: string }> {
  try {
    console.log('\n💾 [SAVE MESSAGE] Salvando mensagem outbound...');
    
    const initialStatus = params.providerMessageId ? 'sent' : 'queued';
    
    // 1️⃣ INSERIR MENSAGEM NA TABELA messages
    const messageData: any = {
      conversation_id: params.conversationId,
      direction: 'outbound', // ✅ Mensagem ENVIADA pela empresa
      type: params.type,
      body: params.body,
      sent_at: new Date().toISOString(),
      status: initialStatus,
      created_at: new Date().toISOString()
    };

    // Se já tiver provider_message_id, adicionar
    if (params.providerMessageId) {
      messageData.provider_message_id = params.providerMessageId;
    }

    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      console.error('❌ [SAVE MESSAGE] Erro:', messageError);
      return { success: false, error: messageError.message };
    }

    console.log('✅ [SAVE MESSAGE] Mensagem salva:', message.id);

    // ✅ Atualizar conversa - APENAS last_message_at, NÃO atualizar preview
    // Preview só deve ser atualizado por mensagens INBOUND (no webhook)
    await supabaseAdmin
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
        // ❌ NÃO atualizar last_message_preview aqui
        // Preview só é atualizado por mensagens inbound no webhook
      })
      .eq('id', params.conversationId);

    return { success: true, dbMessageId: message.id };

  } catch (error) {
    console.error('❌ [SAVE MESSAGE] Exceção:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Atualiza mensagem com resposta da Meta
 */
async function updateMessageWithMetaResponse(
  dbMessageId: string,
  providerMessageId: string,
  status: 'sent' | 'failed' = 'sent'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('\n🔄 [UPDATE MESSAGE] Atualizando com wamid...');
    
    await supabaseAdmin
      .from('messages')
      .update({
        provider_message_id: providerMessageId,
        status: status,
        sent_at: new Date().toISOString()
      })
      .eq('id', dbMessageId);

    // Registrar evento
    await supabaseAdmin
      .from('message_status_events')
      .insert({
        message_id: dbMessageId,
        status: status,
        timestamp: new Date().toISOString()
      });

    console.log('✅ [UPDATE MESSAGE] Atualizado');
    return { success: true };

  } catch (error) {
    console.error('❌ [UPDATE MESSAGE] Erro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Handler do endpoint
 */
export async function handleSendMessage(c: Context) {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  📨 SEND MESSAGE (TEXTO SIMPLES)             ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    // 🔍 LOG DO BODY RAW
    const bodyText = await c.req.text();
    console.log('📦 [DEBUG] Body RAW (texto):', bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText);
      console.log('📦 [DEBUG] Body parseado:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.error('❌ Erro ao parsear JSON:', e);
      return c.json({ success: false, error: 'JSON inválido no body' }, 400);
    }

    const { token, conversationId, to, message } = body;

    console.log('📦 [DEBUG] Dados extraídos:');
    console.log('- token:', token ? `${token.substring(0, 20)}...` : 'AUSENTE');
    console.log('- conversationId:', conversationId || 'AUSENTE');
    console.log('- to:', to || 'AUSENTE');
    console.log('- message:', message || 'AUSENTE');

    // 🔐 Autenticação
    if (!token) {
      return c.json({ success: false, error: 'Token não fornecido' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError);
      return c.json({ success: false, error: 'Token inválido' }, 401);
    }

    console.log(`✅ Usuário autenticado: ${user.email}`);

    // ✅ Validações
    if (!conversationId || !to || !message) {
      return c.json({ 
        error: 'Dados obrigatórios faltando',
        missing: { conversationId: !conversationId, to: !to, message: !message }
      }, 400);
    }

    // Verificar conversa
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, contact_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return c.json({ error: 'Conversa não encontrada' }, 404);
    }

    // 🕐 Verificar janela de 24h
    const { data: lastInbound } = await supabaseAdmin
      .from('messages')
      .select('sent_at')
      .eq('conversation_id', conversationId)
      .eq('direction', 'inbound')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastInbound) {
      const hoursSinceLastMessage = (Date.now() - new Date(lastInbound.sent_at).getTime()) / (1000 * 60 * 60);
      
      console.log(`⏱️ Horas desde última mensagem inbound: ${hoursSinceLastMessage.toFixed(2)}h`);

      if (hoursSinceLastMessage > 24) {
        console.error('❌ Fora da janela de 24h');
        return c.json({
          success: false,
          error: 'Janela de 24h expirada. Use um template aprovado.',
          windowExpired: true,
          hoursSinceLastMessage: hoursSinceLastMessage.toFixed(2)
        }, 403);
      }
    } else {
      console.warn('⚠️ Nenhuma mensagem inbound - cliente nunca respondeu');
      return c.json({
        success: false,
        error: 'Cliente nunca respondeu. Use um template aprovado.',
        noInboundMessages: true
      }, 403);
    }

    console.log('✅ Dentro da janela de 24h');

    // 🔥 ETAPA 1: Salvar mensagem com status 'queued'
    console.log('\n💾 [ETAPA 1] Salvando mensagem com status queued...');
    const preSaveResult = await saveOutboundMessage({
      conversationId,
      type: 'text',
      body: message,
      toPhoneE164: to
    });

    if (!preSaveResult.success) {
      console.error('❌ Erro ao salvar mensagem:', preSaveResult.error);
      return c.json({ success: false, error: 'Erro ao registrar mensagem' }, 500);
    }

    console.log('✅ Mensagem pré-salva:', preSaveResult.dbMessageId);

    // 🔥 ETAPA 2: Enviar via Meta API
    console.log('\n📤 [ETAPA 2] Enviando via Meta API...');
    console.log('- To:', to);
    console.log('- Message:', message);
    
    const result = await whatsapp.sendWhatsAppTextMessage({ to, message });
    
    console.log('📊 Resultado do envio:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('❌ [ERRO META API] Não foi possível enviar:', result.error);
      console.error('📋 Detalhes do erro:', JSON.stringify(result.details, null, 2));
      
      // Atualizar status para 'failed'
      await updateMessageWithMetaResponse(
        preSaveResult.dbMessageId!,
        'meta-error-' + Date.now(),
        'failed'
      );
      
      return c.json({ 
        success: false, 
        error: result.error,
        details: result.details 
      }, 500);
    }

    console.log('✅ Mensagem enviada! wamid:', result.messageId);

    // 🔥 ETAPA 3: Atualizar com provider_message_id
    console.log('\n🔄 [ETAPA 3] Atualizando mensagem com wamid...');
    await updateMessageWithMetaResponse(
      preSaveResult.dbMessageId!,
      result.messageId!,
      'sent'
    );
    
    console.log('✅ Mensagem atualizada com sucesso!');

    return c.json({
      success: true,
      messageId: result.messageId, // wamid da Meta
      dbMessageId: preSaveResult.dbMessageId // UUID do Postgres
    }, 200);

  } catch (error) {
    console.error('❌ Erro crítico:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
}