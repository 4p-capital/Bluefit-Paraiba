# 🔐 Fluxo de Autenticação - Sistema Bluefit

## 📋 Visão Geral

O sistema implementa autenticação completa com validação de sessão, login persistente e redirecionamento automático para o chat.

---

## 🔄 Fluxo Completo de Autenticação

### 1️⃣ **Inicialização do App**

```
Usuário abre o app
    ↓
App.tsx (useEffect)
    ↓
checkExistingSession()
    ↓
checkSession() (auth.ts)
    ↓
┌─────────────────────────────┐
│ Tem token no localStorage?  │
└─────────────────────────────┘
    │
    ├── NÃO → Mostra tela de LOGIN
    │
    └── SIM → Valida com backend
                ↓
        ┌──────────────────────┐
        │ Token válido?        │
        └──────────────────────┘
            │
            ├── SIM → Redireciona para CHAT
            │
            └── NÃO → Limpa localStorage
                      Mostra tela de LOGIN
```

### 2️⃣ **Processo de Cadastro**

```
Usuário preenche formulário
    ↓
SignupForm.tsx
    ↓
POST /api/auth/signup
    ↓
Servidor cria:
  1. Usuário no Auth (Supabase)
  2. Perfil na tabela profiles
    ↓
┌────────────────────┐
│ Sucesso?           │
└────────────────────┘
    │
    ├── SIM → Mensagem de sucesso (2s)
    │         Redireciona para LOGIN
    │
    └── NÃO → Rollback automático
              Mostra erro
```

### 3️⃣ **Processo de Login**

```
Usuário digita email/senha
    ↓
LoginForm.tsx
    ↓
POST /api/auth/login
    ↓
Servidor valida com Supabase Auth
    ↓
┌────────────────────┐
│ Credenciais OK?    │
└────────────────────┘
    │
    ├── SIM → Retorna accessToken
    │         ↓
    │         Salva no localStorage
    │         ↓
    │         Chama checkExistingSession()
    │         ↓
    │         Valida token com backend
    │         ↓
    │         Redireciona para CHAT ✅
    │
    └── NÃO → Mostra erro específico
```

### 4️⃣ **Validação de Token**

```
validateToken(token)
    ↓
GET /api/auth/me
Headers: Authorization: Bearer {token}
    ↓
Servidor:
  1. Verifica token com Supabase Auth
  2. Busca perfil na tabela profiles
    ↓
┌────────────────────┐
│ Token válido?      │
└────────────────────┘
    │
    ├── SIM → Retorna dados do usuário
    │         { id, email, profile }
    │
    └── NÃO → Retorna 401 Unauthorized
```

### 5️⃣ **Logout**

```
Usuário clica em "Sair"
    ↓
handleLogout()
    ↓
1. logout() - Supabase Auth
2. clearStoredAccessToken() - Remove do localStorage
3. setAuthUser(null) - Limpa estado
4. setCurrentView('login') - Volta para login
    ↓
Tela de LOGIN exibida
```

---

## 🗂️ Arquivos Principais

### `/src/app/App.tsx`
**Responsabilidade:** Gerencia o estado de autenticação e visualizações

```typescript
const [currentView, setCurrentView] = useState<AuthView>('login');
const [authUser, setAuthUser] = useState<AuthUser | null>(null);
const [checkingAuth, setCheckingAuth] = useState(true);

useEffect(() => {
  checkExistingSession(); // Valida ao iniciar
}, []);
```

### `/src/app/lib/auth.ts`
**Responsabilidade:** Funções de autenticação

```typescript
// Valida token com o backend
validateToken(token: string): Promise<AuthUser | null>

// Verifica sessão existente
checkSession(): Promise<AuthUser | null>

// Faz logout
logout(): Promise<void>

// Gerencia localStorage
storeAccessToken(token: string): void
getStoredAccessToken(): string | null
clearStoredAccessToken(): void
```

### `/src/app/components/LoginForm.tsx`
**Responsabilidade:** Interface de login

```typescript
async function handleLogin(e: React.FormEvent) {
  // 1. Envia credenciais para o servidor
  // 2. Recebe accessToken
  // 3. Salva no localStorage
  // 4. Chama onLoginSuccess(accessToken)
}
```

### `/src/app/components/SignupForm.tsx`
**Responsabilidade:** Interface de cadastro

```typescript
async function handleSignup(e: React.FormEvent) {
  // 1. Envia dados para o servidor
  // 2. Servidor cria usuário + perfil
  // 3. Mostra mensagem de sucesso
  // 4. Redireciona para login
}
```

### `/supabase/functions/server/index.tsx`
**Responsabilidade:** API do servidor

```typescript
// Rota de cadastro
POST /make-server-844b77a1/api/auth/signup

// Rota de login
POST /make-server-844b77a1/api/auth/login

// Rota de validação (protegida)
GET /make-server-844b77a1/api/auth/me
```

---

## 🔒 Segurança

### Tokens
- **Access Token:** JWT gerado pelo Supabase Auth
- **Armazenamento:** localStorage (client-side)
- **Validação:** Toda requisição protegida valida o token
- **Expiração:** Gerenciada pelo Supabase

### Proteção de Rotas
```typescript
// Servidor verifica o token em rotas protegidas
const accessToken = c.req.header('Authorization')?.split(' ')[1];
const { data: { user }, error } = await supabase.auth.getUser(accessToken);

if (error || !user) {
  return c.json({ error: 'Token inválido' }, 401);
}
```

### CORS
```typescript
// Servidor configurado com CORS aberto
app.use('*', cors());
```

---

## 🎯 Estados da Aplicação

### `currentView`
- **'login'** → Tela de login
- **'signup'** → Tela de cadastro
- **'app'** → Aplicação principal (chat)

### `checkingAuth`
- **true** → Mostra tela de loading
- **false** → Mostra tela apropriada

### `authUser`
- **null** → Usuário não autenticado
- **AuthUser** → Usuário autenticado
  ```typescript
  {
    id: string;
    email: string;
    accessToken: string;
    profile?: any;
  }
  ```

---

## 📊 Logs no Console

### Ao Abrir o App:
```
Verificando sessão existente...
```

**Se tem token:**
```
Validando token com o backend...
Token válido! Usuário autenticado: usuario@email.com
Sessão válida encontrada! Redirecionando para o chat...
```

**Se não tem token:**
```
Nenhum token encontrado no localStorage
Nenhuma sessão válida. Mostrando tela de login.
```

### No Login:
```
Tentando fazer login...
Resposta do servidor: { success: true, accessToken: "...", user: {...} }
Login bem-sucedido!
Login bem-sucedido! Salvando token e redirecionando...
Verificando sessão existente...
Validando token com o backend...
Token válido! Usuário autenticado: usuario@email.com
Sessão válida encontrada! Redirecionando para o chat...
```

### No Logout:
```
// Volta para tela de login
// localStorage limpo
```

---

## ✅ Checklist de Funcionamento

- [x] ✅ Ao abrir o app, verifica se há sessão ativa
- [x] ✅ Se tem sessão válida, vai direto para o chat
- [x] ✅ Se não tem sessão, mostra tela de login
- [x] ✅ Ao fazer login com sucesso, redireciona para o chat
- [x] ✅ Token é validado com o backend
- [x] ✅ Token inválido/expirado limpa localStorage e volta para login
- [x] ✅ Ao fazer logout, limpa tudo e volta para login
- [x] ✅ Ao cadastrar, volta para login
- [x] ✅ Mensagens de erro específicas e claras
- [x] ✅ Loading states em todas as transições

---

## 🚀 Como Testar

### Teste 1: Primeiro Acesso
1. Abra o app pela primeira vez
2. **Esperado:** Tela de login
3. **Console:** "Nenhum token encontrado no localStorage"

### Teste 2: Cadastro
1. Clique em "Cadastre-se"
2. Preencha o formulário
3. Clique em "Criar conta"
4. **Esperado:** Mensagem de sucesso → Redireciona para login

### Teste 3: Login
1. Digite email e senha
2. Clique em "Entrar"
3. **Esperado:** Redireciona para o chat
4. **Console:** Ver logs de validação

### Teste 4: Sessão Persistente
1. Faça login
2. Recarregue a página (F5)
3. **Esperado:** Continua no chat (não volta para login)
4. **Console:** "Token válido! Usuário autenticado..."

### Teste 5: Logout
1. No chat, clique em "Sair"
2. **Esperado:** Volta para tela de login
3. **Console:** localStorage limpo

### Teste 6: Token Inválido
1. Faça login
2. Abra DevTools → Application → Local Storage
3. Modifique o `access_token` para um valor inválido
4. Recarregue a página
5. **Esperado:** Volta para login (token inválido)

---

**Status:** Sistema de autenticação 100% funcional! 🎉💙  
**Última atualização:** 13/01/2026
