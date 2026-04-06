# 🔧 Troubleshooting - Autenticação

## ❌ Erro: "Email ou senha incorretos"

### Possíveis Causas:

1. **Conta criada antes das correções**
   - Se você tentou criar uma conta antes de corrigir o bug da tabela `profiles`, o usuário pode ter sido criado no Auth mas com dados incorretos ou incompletos.

2. **Senha incorreta**
   - Verifique se está digitando a senha corretamente (mínimo 6 caracteres).

3. **Email não cadastrado**
   - Certifique-se de que a conta foi criada com sucesso.

### ✅ Soluções:

#### Solução 1: Criar nova conta (Recomendado)
1. Clique em "Cadastre-se"
2. Use um **email diferente** (ex: `teste2@email.com`)
3. Preencha todos os campos
4. Crie a conta
5. Tente fazer login com as novas credenciais

#### Solução 2: Limpar usuários antigos no Supabase
Se você tem acesso ao Dashboard do Supabase:

1. Vá em **Authentication** → **Users**
2. Delete todos os usuários com problemas
3. Vá em **Table Editor** → **profiles**
4. Delete os registros problemáticos
5. Crie uma nova conta no sistema

#### Solução 3: Resetar senha (se implementado)
- Use a função "Esqueci minha senha" (se disponível)

---

## 🔍 Como Verificar o Problema

### No Console do Navegador (F12):
```javascript
// Você deve ver logs como:
// "Tentando fazer login..."
// "Resposta do servidor: {error: '...'}"
```

### Nos Logs do Supabase:
```
Tentando login para: usuario@email.com
Erro ao fazer login: AuthApiError: Invalid login credentials
```

---

## ✅ Teste do Sistema

### 1. Teste de Cadastro
```
✅ Acessar tela de cadastro
✅ Preencher:
   - Nome: João
   - Sobrenome: Silva
   - Email: joao.silva@teste.com
   - CPF: 123.456.789-00
   - Celular: (11) 99999-9999
   - Senha: senha123
✅ Clicar em "Criar conta"
✅ Aguardar mensagem de sucesso
✅ Ser redirecionado para login
```

### 2. Teste de Login
```
✅ Usar o MESMO email e senha do cadastro
✅ Email: joao.silva@teste.com
✅ Senha: senha123
✅ Clicar em "Entrar"
✅ Deve fazer login com sucesso
```

---

## 🗄️ Estrutura de Dados Correta

### Tabela `profiles`:
```sql
SELECT * FROM profiles WHERE email = 'seu@email.com';
```

Deve retornar:
```json
{
  "id": "uuid-do-auth",
  "email": "seu@email.com",
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678900",
  "telefone": "11999999999",
  "role": "atendente",
  "created_at": "2026-01-13T...",
  "updated_at": "2026-01-13T..."
}
```

### Auth Users:
No dashboard do Supabase (Authentication → Users):
```
Email: seu@email.com
Status: ✅ Confirmed
Last Sign In: -
```

---

## 🚨 Erros Comuns e Soluções

### Erro: "Could not find the 'xxx' column"
**Causa:** Coluna não existe na tabela  
**Solução:** Verifique se todas as colunas existem:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles';
```

Colunas necessárias:
- ✅ id
- ✅ email
- ✅ nome
- ✅ sobrenome
- ✅ cpf
- ✅ telefone
- ✅ role
- ✅ created_at
- ✅ updated_at

### Erro: "null value in column violates not-null constraint"
**Causa:** Algum campo obrigatório não está sendo enviado  
**Solução:** Todos os campos do cadastro são obrigatórios

### Erro: "Email not confirmed"
**Causa:** Email não confirmado (não deve acontecer pois usamos `email_confirm: true`)  
**Solução:** Verificar se `email_confirm: true` está no código

---

## 📝 Checklist de Verificação

Antes de tentar fazer login, verifique:

- [ ] A tabela `profiles` tem todas as colunas necessárias
- [ ] Você criou a conta **após** todas as correções
- [ ] O cadastro retornou mensagem de sucesso
- [ ] Você está usando o email e senha corretos
- [ ] A senha tem no mínimo 6 caracteres
- [ ] O console não mostra erros de rede

---

## 🎯 Fluxo Correto de Autenticação

### Cadastro:
1. Frontend envia dados → Servidor
2. Servidor cria usuário no Auth (email_confirm: true)
3. Servidor cria perfil na tabela profiles
4. Se erro no profiles → deleta usuário do Auth (rollback)
5. Retorna sucesso
6. Frontend redireciona para login

### Login:
1. Frontend envia email + senha → Servidor
2. Servidor valida com Supabase Auth
3. Auth retorna access_token
4. Servidor retorna token para frontend
5. Frontend salva token no localStorage
6. Frontend carrega aplicação

### Verificação de Sessão:
1. Frontend verifica se tem token no localStorage
2. Chama /api/auth/me com o token
3. Servidor valida token e busca perfil
4. Retorna dados do usuário
5. Frontend exibe dados

---

## 💡 Dicas

1. **Use emails diferentes para testes**
   - teste1@email.com
   - teste2@email.com
   - teste3@email.com

2. **Não reutilize emails de cadastros com erro**
   - Se deu erro no cadastro, use outro email

3. **Verifique os logs sempre**
   - Console do navegador (F12)
   - Logs do Supabase Edge Functions

4. **Em caso de dúvida, recrie tudo**
   - Delete usuário do Auth
   - Delete registro do profiles
   - Cadastre novamente

---

**Última atualização:** 13/01/2026  
**Status:** Sistema funcionando corretamente ✅
