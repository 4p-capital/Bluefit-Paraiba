/**
 * 🔍 ENDPOINT DE DEBUG DA META API
 * GET /make-server-844b77a1/api/whatsapp/debug
 * 
 * Testa a conexão com a Meta API e retorna informações detalhadas
 */

import { Context } from "npm:hono";

const META_API_VERSION = 'v21.0'; // Atualizar para versão mais recente
const META_API_BASE_URL = 'https://graph.facebook.com';

export async function debugMetaConnection(c: Context) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔍 DEBUG DA META WHATSAPP API                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const results: any = {
    timestamp: new Date().toISOString(),
    environment_variables: {},
    api_tests: {},
    errors: []
  };

  try {
    // ============================================
    // 1️⃣ VERIFICAR VARIÁVEIS DE AMBIENTE
    // ============================================
    console.log('📋 1. Verificando variáveis de ambiente...\n');

    const accessToken = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN')?.trim();
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID')?.trim();
    const wabaId = Deno.env.get('META_WHATSAPP_WABA_ID')?.trim();

    results.environment_variables = {
      META_WHATSAPP_ACCESS_TOKEN: {
        exists: !!accessToken,
        length: accessToken?.length || 0,
        preview: accessToken ? accessToken.substring(0, 30) + '...' : 'NÃO CONFIGURADO',
        startsWithBearer: accessToken?.startsWith('Bearer '),
        hasSpaces: accessToken ? accessToken !== accessToken.trim() : false
      },
      META_WHATSAPP_PHONE_NUMBER_ID: {
        exists: !!phoneNumberId,
        value: phoneNumberId || 'NÃO CONFIGURADO'
      },
      META_WHATSAPP_WABA_ID: {
        exists: !!wabaId,
        value: wabaId || 'NÃO CONFIGURADO'
      }
    };

    console.log('Environment Variables:', JSON.stringify(results.environment_variables, null, 2));

    // Validações básicas
    if (!accessToken) {
      results.errors.push('❌ META_WHATSAPP_ACCESS_TOKEN não configurado');
    } else if (accessToken.startsWith('Bearer ')) {
      results.errors.push('❌ ACCESS_TOKEN contém "Bearer " - remova este prefixo!');
    }

    if (!phoneNumberId) {
      results.errors.push('❌ META_WHATSAPP_PHONE_NUMBER_ID não configurado');
    }

    if (!wabaId) {
      results.errors.push('❌ META_WHATSAPP_WABA_ID não configurado');
    }

    if (results.errors.length > 0) {
      console.log('\n❌ ERROS CRÍTICOS ENCONTRADOS:');
      results.errors.forEach((err: string) => console.log(err));
      return c.json(results, 400);
    }

    // ============================================
    // 2️⃣ TESTAR TOKEN COM /ME (Debug Token)
    // ============================================
    console.log('\n📋 2. Testando token com /debug_token...\n');

    try {
      const debugTokenUrl = `${META_API_BASE_URL}/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
      
      const debugResponse = await fetch(debugTokenUrl, {
        method: 'GET'
      });

      const debugData = await debugResponse.json();
      
      results.api_tests.debug_token = {
        status: debugResponse.status,
        ok: debugResponse.ok,
        response: debugData
      };

      console.log('Debug Token Response:', JSON.stringify(debugData, null, 2));

      if (!debugResponse.ok) {
        results.errors.push(`❌ Token inválido: ${debugData.error?.message || 'Unknown error'}`);
      } else {
        // Verificar se o token tem as permissões necessárias
        const tokenData = debugData.data;
        results.api_tests.debug_token.details = {
          app_id: tokenData?.app_id,
          is_valid: tokenData?.is_valid,
          expires_at: tokenData?.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : 'Permanente',
          scopes: tokenData?.scopes || []
        };

        const requiredScopes = ['whatsapp_business_messaging', 'whatsapp_business_management'];
        const hasRequiredScopes = requiredScopes.every(scope => tokenData?.scopes?.includes(scope));
        
        if (!hasRequiredScopes) {
          results.errors.push(`⚠️ Token não tem todas as permissões necessárias. Requerido: ${requiredScopes.join(', ')}`);
        }
      }
    } catch (err) {
      results.api_tests.debug_token = {
        error: err instanceof Error ? err.message : 'Unknown error'
      };
      results.errors.push(`❌ Erro ao testar token: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    // ============================================
    // 3️⃣ TESTAR PHONE NUMBER ID
    // ============================================
    console.log('\n📋 3. Testando Phone Number ID...\n');

    try {
      const phoneUrl = `${META_API_BASE_URL}/${META_API_VERSION}/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating`;
      
      const phoneResponse = await fetch(phoneUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const phoneData = await phoneResponse.json();
      
      results.api_tests.phone_number = {
        status: phoneResponse.status,
        ok: phoneResponse.ok,
        response: phoneData
      };

      console.log('Phone Number Response:', JSON.stringify(phoneData, null, 2));

      if (!phoneResponse.ok) {
        results.errors.push(`❌ Phone Number ID inválido: ${phoneData.error?.message || 'Unknown error'}`);
      }
    } catch (err) {
      results.api_tests.phone_number = {
        error: err instanceof Error ? err.message : 'Unknown error'
      };
      results.errors.push(`❌ Erro ao testar Phone Number: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    // ============================================
    // 4️⃣ BUSCAR TEMPLATES (ENDPOINT PRINCIPAL)
    // ============================================
    console.log('\n📋 4. Buscando templates...\n');

    try {
      const templatesUrl = `${META_API_BASE_URL}/${META_API_VERSION}/${wabaId}/message_templates?limit=50`;
      
      console.log('Templates URL:', templatesUrl);
      
      const templatesResponse = await fetch(templatesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const templatesData = await templatesResponse.json();
      
      results.api_tests.templates = {
        status: templatesResponse.status,
        ok: templatesResponse.ok,
        response: templatesData
      };

      console.log('Templates Response:', JSON.stringify(templatesData, null, 2));

      if (!templatesResponse.ok) {
        results.errors.push(`❌ Erro ao buscar templates: ${templatesData.error?.message || 'Unknown error'}`);
        
        // Detalhes adicionais do erro
        if (templatesData.error) {
          results.api_tests.templates.error_details = {
            code: templatesData.error.code,
            type: templatesData.error.type,
            message: templatesData.error.message,
            fbtrace_id: templatesData.error.fbtrace_id
          };
        }
      } else {
        const templates = templatesData.data || [];
        const approvedTemplates = templates.filter((t: any) => t.status === 'APPROVED');
        
        results.api_tests.templates.summary = {
          total: templates.length,
          approved: approvedTemplates.length,
          templates: approvedTemplates.map((t: any) => ({
            name: t.name,
            language: t.language,
            category: t.category,
            status: t.status
          }))
        };

        if (approvedTemplates.length === 0) {
          results.errors.push('⚠️ Nenhum template APROVADO encontrado na conta. Crie e aprove templates no Meta Business Manager.');
        }
      }
    } catch (err) {
      results.api_tests.templates = {
        error: err instanceof Error ? err.message : 'Unknown error'
      };
      results.errors.push(`❌ Erro ao buscar templates: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    // ============================================
    // 5️⃣ TESTAR WABA_ID (Se fornecido)
    // ============================================
    if (wabaId) {
      console.log('\n📋 5. Testando WABA ID...\n');

      try {
        const wabaUrl = `${META_API_BASE_URL}/${META_API_VERSION}/${wabaId}?fields=id,name,timezone_id,message_template_namespace`;
        
        const wabaResponse = await fetch(wabaUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const wabaData = await wabaResponse.json();
        
        results.api_tests.waba = {
          status: wabaResponse.status,
          ok: wabaResponse.ok,
          response: wabaData
        };

        console.log('WABA Response:', JSON.stringify(wabaData, null, 2));

        if (!wabaResponse.ok) {
          results.errors.push(`❌ WABA ID inválido: ${wabaData.error?.message || 'Unknown error'}`);
        }
      } catch (err) {
        results.api_tests.waba = {
          error: err instanceof Error ? err.message : 'Unknown error'
        };
        results.errors.push(`❌ Erro ao testar WABA: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    // ============================================
    // RESULTADO FINAL
    // ============================================
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ DIAGNÓSTICO COMPLETO                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    results.summary = {
      total_errors: results.errors.length,
      is_configured: results.errors.length === 0,
      next_steps: results.errors.length > 0 
        ? results.errors 
        : ['✅ Tudo configurado corretamente! Os templates devem aparecer na interface.']
    };

    const statusCode = results.errors.length > 0 ? 500 : 200;
    return c.json(results, statusCode);

  } catch (error) {
    console.error('❌ ERRO CRÍTICO no diagnóstico:', error);
    
    return c.json({
      error: 'Erro crítico no diagnóstico',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
}
