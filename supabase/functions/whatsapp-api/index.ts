/**
 * POST /send-template
 * Envia um template aprovado via WhatsApp
 * REQUER AUTENTICAÇÃO
 */
async function handleSendTemplate(req: Request): Promise<Response> {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  📨 POST /send-template - Enviando template               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Validar autenticação
    const authHeader = req.headers.get('Authorization');
    const authResult = await validateAuth(authHeader);

    if (!authResult.valid) {
      console.error('❌ Autenticação falhou:', authResult.error);
      return jsonResponse({ success: false, error: authResult.error }, 401);
    }

    console.log('✅ Usuário autenticado:', authResult.userId);

    // Parse do body
    const body: SendTemplateRequest = await req.json();
    
    console.log('📋 Dados da requisição:');
    console.log('   - To:', body.to);
    console.log('   - Template:', body.templateName);
    console.log('   - Language:', body.languageCode);
    console.log('   - Components:', body.components);

    if (!body.to || !body.templateName || !body.languageCode) {
      return jsonResponse({
        success: false,
        error: 'Parâmetros obrigatórios: to, templateName, languageCode'
      }, 400);
    }

    // Obter credenciais da Meta
    const accessToken = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');

    console.log('🔑 Credenciais:');
    console.log('   - Access Token:', accessToken ? `${accessToken.substring(0, 30)}...` : '❌ NÃO CONFIGURADO');
    console.log('   - Phone Number ID:', phoneNumberId || '❌ NÃO CONFIGURADO');

    if (!accessToken || !phoneNumberId) {
      console.error('❌ WhatsApp não configurado no servidor');
      return jsonResponse({
        success: false,
        error: 'WhatsApp não configurado no servidor. Verifique META_WHATSAPP_ACCESS_TOKEN e META_WHATSAPP_PHONE_NUMBER_ID'
      }, 500);
    }

    // Preparar número no formato correto (sem + e sem espaços)
    const toNumber = body.to.replace(/[\+\s\-\(\)]/g, '');
    
    console.log('📱 Número formatado:', toNumber);

    // Preparar payload conforme cURL oficial da Meta
    const payload: any = {
      messaging_product: 'whatsapp',
      to: toNumber,
      type: 'template',
      template: {
        name: body.templateName,
        language: {
          code: body.languageCode
        }
      }
    };

    // Adicionar componentes se existirem
    if (body.components && body.components.length > 0) {
      payload.template.components = body.components;
      console.log('📝 Componentes adicionados:', body.components.length);
    }

    console.log('');
    console.log('📤 PAYLOAD COMPLETO:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');

    // URL da API da Meta (EXATAMENTE como no cURL oficial)
    const url = `${META_API_BASE_URL}/${META_API_VERSION}/${phoneNumberId}/messages`;
    
    console.log('🌐 URL da requisição:', url);
    console.log('');

    // Enviar para a API da Meta
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    console.log('📊 Resposta da Meta API:');
    console.log('   - Status:', response.status);
    console.log('   - OK:', response.ok);
    console.log('   - Data:', JSON.stringify(responseData, null, 2));
    console.log('');

    if (!response.ok) {
      console.error('❌ Erro na API da Meta:', responseData);
      
      // Log detalhado do erro
      if (responseData.error) {
        console.error('🔴 Detalhes do erro:');
        console.error('   - Message:', responseData.error.message);
        console.error('   - Type:', responseData.error.type);
        console.error('   - Code:', responseData.error.code);
        console.error('   - Error Subcode:', responseData.error.error_subcode);
        console.error('   - Fbtrace ID:', responseData.error.fbtrace_id);
      }
      
      return jsonResponse({
        success: false,
        error: responseData.error?.message || 'Erro ao enviar template',
        details: responseData
      }, response.status);
    }

    console.log('✅ Template enviado com sucesso!');
    console.log('');
    
    const messageId = responseData.messages?.[0]?.id;
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ SUCESSO! Template enviado                             ║');
    console.log(`║  📨 Message ID: ${messageId?.substring(0, 30) || 'N/A'}...${' '.repeat(Math.max(0, 20 - (messageId?.substring(0, 30)?.length || 0)))}║`);
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    return jsonResponse({
      success: true,
      messageId
    });

  } catch (error) {
    console.error('');
    console.error('❌❌❌ EXCEÇÃO NÃO TRATADA ❌❌❌');
    console.error('Erro ao enviar template:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('');
    
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
}