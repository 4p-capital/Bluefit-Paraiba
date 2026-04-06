# 🔍 Instruções para Debug do Erro "Invalid JWT"

## Passo 1: Verificar Logs no Console

Recarregue a página e abra o Console do Navegador (F12). Procure por:

### ✅ Verificar Sessão:
- `session existe?` → Deve ser `true`
- `session.access_token existe?` → Deve ser `true`
- `Token expirado?` → Deve ser `false`

### ✅ Verificar Endpoint:
- `Chamando endpoint relacional:` → A URL deve ser algo como:
  `https://seu-projeto.supabase.co/functions/v1/make-server-844b77a1/api/conversations`
- `projectId:` → Não deve ser undefined

### ✅ Verificar Response:
- `Response status:` → Se for 401, o token está sendo rejeitado
- `Response data:` → Vai mostrar o erro exato do backend

---

## Passo 2: Verificar Logs do Backend

Abra os **Logs do Supabase Edge Function** (no Supabase Dashboard → Edge Functions → make-server-844b77a1 → Logs).

Procure por:
```
╔════════════════════════════════════════╗
║   GET /api/conversations - MARCO 1    ║
║   (Usando tabelas relacionais)         ║
╚════════════════════════════════════════╝
```

E veja o que aparece depois. Deve mostrar:
- Authorization header presente?
- Token extraído (presente?): true
- Resultado da validação

---

## Passo 3: Possíveis Causas e Soluções

### Causa 1: Token Realmente Expirado
**Solução:** Faça logout e login novamente
```bash
1. Clique em "Sair" no sistema
2. Faça login novamente
3. Tente carregar conversas
```

### Causa 2: Problema com projectId ou endpoint
**Solução:** Verifique o arquivo `/utils/supabase/info.tsx`
```typescript
// Deve ter valores válidos:
export const projectId = "seu-projeto-id";
export const publicAnonKey = "eyJ...";
```

### Causa 3: Backend não está validando corretamente
**Solução:** Vamos criar uma rota de teste

---

## Passo 4: Teste com Rota Diagnóstica

Vou adicionar uma rota especial de teste. Cole este código NO BACKEND (`/supabase/functions/server/index.tsx`), LOGO APÓS os imports (linha ~40):

```typescript
// 🧪 ROTA DE DIAGNÓSTICO TEMPORÁRIA
app.get("/make-server-844b77a1/api/diagnose-auth", async (c) => {
  console.log('\\n🧪 [DIAGNOSE] Diagnóstico de Autenticação');
  
  const authHeader = c.req.header('Authorization');
  console.log('📨 Auth header:', authHeader ? 'PRESENTE' : 'AUSENTE');
  
  if (!authHeader) {
    return c.json({
      success: false,
      error: 'No Authorization header',
      step: 'header_missing'
    }, 401);
  }
  
  const token = authHeader.split(' ')[1];
  console.log('🔑 Token extraído:', !!token);
  
  if (!token) {
    return c.json({
      success: false,
      error: 'No token in header',
      step: 'token_missing',
      authHeader
    }, 401);
  }
  
  // Decodificar token JWT
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      const isExpired = payload.exp < now;
      
      console.log('🔍 Token decoded:');
      console.log('- exp:', payload.exp, '(', new Date(payload.exp * 1000).toISOString(), ')');
      console.log('- now:', now, '(', new Date(now * 1000).toISOString(), ')');
      console.log('- expired?', isExpired);
      
      if (isExpired) {
        return c.json({
          success: false,
          error: 'Token expired',
          step: 'token_expired',
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          now: new Date().toISOString()
        }, 401);
      }
    }
  } catch (e) {
    console.error('❌ Erro ao decodificar:', e);
  }
  
  // Validar com Supabase
  console.log('🔐 Validando com Supabase...');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    console.error('❌ Supabase rejeitou:', authError);
    return c.json({
      success: false,
      error: 'Supabase validation failed',
      step: 'supabase_validation_failed',
      supabaseError: authError ? {
        message: authError.message,
        status: authError.status
      } : null
    }, 401);
  }
  
  console.log('✅ Token válido! User:', user.email);
  return c.json({
    success: true,
    message: 'Authentication successful!',
    user: {
      id: user.id,
      email: user.email
    }
  });
});
```

Depois teste chamando este endpoint no frontend:

```typescript
// No console do navegador:
const { data: { session } } = await supabase.auth.getSession();
const response = await fetch(
  'https://SEU-PROJETO.supabase.co/functions/v1/make-server-844b77a1/api/diagnose-auth',
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': 'SUA-ANON-KEY'
    }
  }
);
const data = await response.json();
console.log(data);
```

---

## Passo 5: Me Envie os Logs

Copie e me envie:

1. **Todos os logs do console do navegador** (começando com 🔄 ConversationList)
2. **O erro completo** (Response data)
3. **Os logs do backend** (se conseguir acessar)
4. **Resultado do teste diagnóstico** (Passo 4)

Com essas informações, vou conseguir identificar exatamente onde está o problema!

---

## 🚨 Fix Rápido (Se Token Expirado)

Se o problema for apenas token expirado, faça logout e login:

```typescript
// No console do navegador:
await supabase.auth.signOut();
// Depois faça login novamente pela interface
```

---

## ⚡ Fix Alternativo: Usar Supabase Client Diretamente

Se você quiser contornar o problema temporariamente, pode usar queries diretas do Supabase no frontend (sem passar pelo backend):

```typescript
// Em ConversationList.tsx
const { data: conversations } = await supabase
  .from('conversations')
  .select(`
    *,
    contacts (*),
    units (*),
    profiles (*)
  `)
  .eq('assigned_user_id', user.id)
  .order('last_message_at', { ascending: false });
```

Isso funciona porque o Supabase já tem RLS (Row Level Security) configurado.
