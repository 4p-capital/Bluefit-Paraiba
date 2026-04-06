# 🔐 Guia de Autenticação - Bluefit Atendimento

## 📋 Visão Geral

O sistema de autenticação do Bluefit Atendimento foi implementado usando **Supabase Auth** integrado com a tabela `profiles` do banco de dados.

## 🏗️ Arquitetura

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Supabase Auth  │
│  Edge Function  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  Auth  │ │ Profiles │
│ Users  │ │  Table   │
└────────┘ └──────────┘
```

## 🚀 Configuração Inicial

### 1. Executar Script SQL

Execute o script para atualizar a tabela `profiles`:

```bash
# No SQL Editor do Supabase, execute:
/database-update-profiles.sql
```

Este script:
- ✅ Adiciona coluna `user_id` (se não existir)
- ✅ Cria índices de performance
- ✅ Configura RLS (Row Level Security)

### 2. Verificar Variáveis de Ambiente

Certifique-se de que o Supabase possui as seguintes variáveis:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📝 Funcionalidades Implementadas

### 🔹 Cadastro (Signup)

**Endpoint:** `POST /make-server-844b77a1/api/auth/signup`

**Campos do formulário:**
- Nome (obrigatório)
- Sobrenome (obrigatório)
- CPF (obrigatório, formato: 000.000.000-00)
- Celular (obrigatório, formato: (00) 00000-0000)
- E-mail (obrigatório)
- Senha (obrigatório, mínimo 6 caracteres)

**Fluxo de cadastro:**
1. Frontend valida dados do formulário
2. Envia requisição para o servidor
3. Servidor cria usuário no **Supabase Auth**
4. Servidor insere dados na tabela **profiles** com o mesmo UUID
5. Servidor salva dados adicionais (CPF, telefone) no **KV Store**
6. Retorna sucesso ao frontend
7. Frontend redireciona para tela de login

**Dados armazenados:**

| Localização | Dados |
|------------|-------|
| **Supabase Auth** | email, password (hash), user_metadata |
| **Tabela profiles** | id (UUID), user_id, email, full_name, role |
| **KV Store** | cpf, telefone, nome, sobrenome |

### 🔹 Login

**Endpoint:** `POST /make-server-844b77a1/api/auth/login`

**Campos:**
- E-mail
- Senha

**Fluxo de login:**
1. Frontend envia credenciais
2. Servidor autentica com Supabase Auth
3. Retorna `accessToken` se sucesso
4. Frontend armazena token e carrega aplicação

### 🔹 Verificação de Sessão

**Função:** `checkSession()`

**Comportamento:**
- Verifica se existe sessão ativa no Supabase
- Retorna dados do usuário ou null
- Executado automaticamente ao carregar a aplicação

### 🔹 Logout

**Função:** `logout()`

**Comportamento:**
- Faz signOut no Supabase Auth
- Limpa token do localStorage
- Redireciona para tela de login

## 🎨 Componentes de UI

### LoginForm.tsx
- Tela de login moderna com tema azul Bluefit
- Validação de campos
- Mensagens de erro amigáveis
- Link para cadastro

### SignupForm.tsx
- Formulário de cadastro responsivo
- Máscara automática para CPF e telefone
- Validação em tempo real
- Tela de sucesso animada
- Link para login

## 🔒 Segurança

### Row Level Security (RLS)

**Tabela profiles:**
- ✅ **SELECT**: Permitido para usuários autenticados
- ✅ **INSERT**: Apenas service role (servidor)
- ✅ **UPDATE**: Apenas próprio perfil (auth.uid() = user_id)

### Proteção de Dados

- ✅ Senhas criptografadas pelo Supabase Auth
- ✅ Tokens JWT para autenticação
- ✅ CORS configurado
- ✅ Validação server-side
- ✅ Service Role Key nunca exposta ao frontend

## 📊 Estrutura da Tabela Profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('atendente', 'gestor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Testando o Sistema

### 1. Criar Conta de Teste

```
Nome: João
Sobrenome: Silva
CPF: 123.456.789-00
Celular: (11) 99999-9999
E-mail: joao.silva@teste.com
Senha: teste123
```

### 2. Fazer Login

Use o e-mail e senha criados.

### 3. Verificar Dados

No SQL Editor do Supabase:

```sql
-- Ver usuário no Auth
SELECT * FROM auth.users WHERE email = 'joao.silva@teste.com';

-- Ver perfil
SELECT * FROM profiles WHERE email = 'joao.silva@teste.com';
```

## 🔧 Troubleshooting

### Erro: "Todos os campos são obrigatórios"
- Verifique se todos os campos do formulário estão preenchidos

### Erro: "Email ou senha incorretos"
- Confirme as credenciais
- Verifique se o usuário foi criado corretamente

### Erro: "Erro ao criar perfil de usuário"
- Execute o script `database-update-profiles.sql`
- Verifique as permissões RLS
- Confira se o Service Role Key está configurado

### Erro: "Token inválido"
- Faça logout e login novamente
- Limpe o localStorage do navegador

## 📱 Fluxo Completo da Aplicação

```
1. Usuário acessa aplicação
   ↓
2. Sistema verifica sessão ativa
   ↓
3. Se tem sessão → Carrega App
   Se não → Mostra Login
   ↓
4. Usuário faz login/cadastro
   ↓
5. Token armazenado
   ↓
6. App principal carregado
   ↓
7. Header mostra email do usuário
   ↓
8. Botão "Sair" disponível
```

## 🎯 Próximos Passos

Para melhorias futuras:

- [ ] Recuperação de senha
- [ ] Verificação de e-mail
- [ ] Autenticação 2FA
- [ ] Login social (Google, Facebook)
- [ ] Atualização de perfil
- [ ] Upload de foto de perfil
- [ ] Histórico de acessos

## 💡 Dicas

1. **Role padrão**: Novos usuários são criados como `'atendente'`
2. **CPF único**: Implementar validação de CPF duplicado
3. **Email confirmado**: Atualmente auto-confirmado (sem servidor de email)
4. **Sessões**: Expiram em 24h (padrão Supabase)

---

**Desenvolvido para Bluefit Atendimento** 💙
