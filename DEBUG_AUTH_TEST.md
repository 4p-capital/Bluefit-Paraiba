// Teste temporário para debug de autenticação
// Este arquivo pode ser deletado após resolver o problema

// Cole este código ANTES da rota GET /api/conversations no index.tsx:

/**
 * GET /make-server-844b77a1/api/test-conversations-auth
 * Endpoint de teste para validar autenticação nas rotas de conversas
 */
app.get("/make-server-844b77a1/api/test-conversations-auth", async (c) => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  TEST CONVERSATIONS AUTH              ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Pegar todos os headers
    const headers: Record<string, string> = {};
    c.req.raw.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    console.log('📨 TODOS OS HEADERS:', JSON.stringify(headers, null, 2));
    
    const authHeader = c.req.header('Authorization');
    console.log('📨 Authorization header:', authHeader);
    
    if (!authHeader) {
      return c.json({
        success: false,
        error: 'No Authorization header',
        headers: headers
      }, 401);
    }
    
    const token = authHeader?.split(' ')[1];
    console.log('🔑 Token extraído?', !!token);
    console.log('🔑 Token (primeiros 50):', token?.substring(0, 50));
    console.log('🔑 Token (tamanho):', token?.length);
    
    if (!token) {
      return c.json({
        success: false,
        error: 'No token in Authorization header',
        authHeader: authHeader,
        headers: headers
      }, 401);
    }
    
    // Decodificar token
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🔍 TOKEN PAYLOAD:');
        console.log(JSON.stringify(payload, null, 2));
        
        const now = Date.now();
        const exp = payload.exp * 1000;
        const isExpired = exp < now;
        
        console.log('⏰ Token expira em:', new Date(exp).toISOString());
        console.log('⏰ Agora:', new Date(now).toISOString());
        console.log('⏰ Expirado?', isExpired);
        
        if (isExpired) {
          return c.json({
            success: false,
            error: 'Token expired',
            payload: payload,
            expired: true,
            expiresAt: new Date(exp).toISOString(),
            now: new Date(now).toISOString()
          }, 401);
        }
      }
    } catch (e) {
      console.error('❌ Erro ao decodificar token:', e);
    }
    
    // Validar com Supabase
    console.log('🔐 Validando com supabaseAdmin.auth.getUser()...');
    console.log('🔐 SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    console.log('🔐 SERVICE_ROLE_KEY presente?:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    console.log('📊 RESULTADO:');
    console.log('- user:', user ? { id: user.id, email: user.email } : null);
    console.log('- authError:', authError ? JSON.stringify(authError, null, 2) : null);
    
    if (authError || !user) {
      return c.json({
        success: false,
        error: 'Token validation failed',
        authError: authError ? {
          message: authError.message,
          status: authError.status,
          name: authError.name
        } : null,
        user: null
      }, 401);
    }
    
    return c.json({
      success: true,
      message: 'Authentication successful!',
      user: {
        id: user.id,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});
