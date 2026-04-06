# 📊 Estrutura da Tabela PROFILES - Referência Rápida

## ✅ Estrutura Atual (Confirmada)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,                    -- UUID do usuário (mesmo do Auth)
  email TEXT,                              -- Email do usuário
  nome TEXT,                               -- Nome
  sobrenome TEXT,                          -- Sobrenome
  cpf TEXT,                                -- CPF (sem formatação)
  telefone TEXT,                           -- Telefone (sem formatação)
  role TEXT CHECK (role IN ('atendente', 'gestor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE,     -- Data de criação
  updated_at TIMESTAMP WITH TIME ZONE      -- Última atualização
);
```

## 📝 Campos Utilizados

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| **id** | UUID | ✅ Sim | Chave primária (mesmo UUID do Auth.users) |
| **email** | TEXT | ✅ Sim | Email do usuário |
| **nome** | TEXT | ✅ Sim | Nome |
| **sobrenome** | TEXT | ✅ Sim | Sobrenome |
| **cpf** | TEXT | ✅ Sim | CPF (apenas números) |
| **telefone** | TEXT | ✅ Sim | Telefone (apenas números) |
| **role** | TEXT | ✅ Sim | Papel: 'atendente', 'gestor' ou 'admin' |
| **created_at** | TIMESTAMP | ✅ Sim | Data/hora de criação |
| **updated_at** | TIMESTAMP | ✅ Sim | Data/hora da última atualização |

## 🔄 Mapeamento: Input → Coluna

| Campo do Formulário | Coluna no Banco |
|---------------------|-----------------|
| Nome | `nome` |
| Sobrenome | `sobrenome` |
| CPF | `cpf` |
| Celular | `telefone` |
| Email | `email` |

## 🔄 Dados Armazenados no Cadastro

### Na tabela `profiles`:
```json
{
  "id": "uuid-do-auth-user",
  "email": "usuario@email.com",
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678900",
  "telefone": "11999999999",
  "role": "atendente",
  "created_at": "2026-01-13T10:00:00Z",
  "updated_at": "2026-01-13T10:00:00Z"
}
```

### No Auth (Supabase Authentication):
```json
{
  "id": "uuid",
  "email": "usuario@email.com",
  "email_confirmed_at": "2026-01-13T10:00:00Z",
  "user_metadata": {
    "nome": "João",
    "sobrenome": "Silva",
    "cpf": "12345678900",
    "telefone": "11999999999"
  }
}
```

## ⚙️ Código de Insert Atual

```typescript
await supabaseAdmin
  .from('profiles')
  .insert({
    id: userId,                           // UUID do Auth
    email: email,                         // Email do usuário
    nome: nome,                           // Nome
    sobrenome: sobrenome,                 // Sobrenome
    cpf: cpf.replace(/\D/g, ''),         // CPF sem formatação
    telefone: telefone.replace(/\D/g, ''), // Telefone sem formatação
    role: 'atendente',                    // Role padrão
    created_at: new Date().toISOString(), // Timestamp atual
    updated_at: new Date().toISOString()  // Timestamp atual
  });
```

## 🚫 Campos Removidos

Estes campos **NÃO** existem na tabela atual:

- ❌ `user_id` - Use apenas `id`
- ❌ `full_name` - Deletado, use `nome` e `sobrenome` separados
- ❌ `name` - Use `nome`
- ❌ `first_name` - Use `nome`
- ❌ `last_name` - Use `sobrenome`
- ❌ `phone` - Use `telefone`

## 📋 SQL de Verificação

```sql
-- Ver estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Ver registros
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;

-- Ver usuário específico
SELECT * FROM profiles WHERE email = 'seu@email.com';
```

## 🔧 Troubleshooting

### Erro: "Could not find the 'user_id' column"
✅ **Resolvido!** O campo `user_id` foi removido do insert.

### Erro: "Could not find the 'email' column"
❌ Adicione a coluna email:
```sql
ALTER TABLE profiles ADD COLUMN email TEXT;
```

### Erro: "null value in column violates not-null constraint"
Certifique-se que todos os campos obrigatórios estão sendo enviados.

## 🎯 Status do Sistema

- ✅ Cadastro funcional
- ✅ Login funcional
- ✅ Sessão persistente
- ✅ Logout funcional
- ✅ Dados salvos em 3 locais (Auth + Profiles + KV)
- ✅ Rollback automático em caso de erro

---

**Última atualização:** 13/01/2026
**Estrutura validada e funcionando** 💙