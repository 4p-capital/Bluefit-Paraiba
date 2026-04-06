# 🔐 Instruções: Filtro de Visualização por Unidade

## ⚠️ ERRO: Coluna "role" não existe

Se você recebeu o erro `column "role" does not exist`, siga os passos abaixo.

---

## 🔍 PASSO 1: Descobrir a Estrutura da Tabela Profiles

### Execute este script PRIMEIRO:

```sql
-- Listar TODAS as colunas da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

**OU** execute o arquivo: `/sql/check_profiles_structure.sql`

### 📋 Anote o nome da coluna que identifica o tipo de usuário:
- `role`? ✅
- `papel`? 
- `tipo_usuario`?
- `perfil`?
- `nivel_acesso`?
- **NÃO EXISTE?** ⚠️

---

## 🚀 PASSO 2: Escolher o Script Correto

### ✅ Opção A: SEM Diferenciação de Admin
**Use este se:**
- NÃO existe coluna de "role/papel/tipo"
- Você quer que TODOS os usuários vejam apenas seus leads

**Arquivo**: `/sql/add_lead_unit_filtering_rls.sql`

```bash
# Este arquivo JÁ está pronto! Basta executar.
```

### ✅ Opção B: COM Admin (coluna existe)
**Use este se:**
- Existe uma coluna de role/papel/tipo
- Você quer que admins vejam TODOS os leads

**Arquivo**: `/sql/add_lead_unit_filtering_rls_with_admin.sql`

⚠️ **ANTES de executar:**
1. Abra o arquivo
2. Substitua `NOME_DA_COLUNA_ROLE` pelo nome real (ex: `papel`, `tipo_usuario`)
3. Verifique o valor correto (ex: `'admin'`, `'administrador'`, `'gestor'`)

---

## 📝 PASSO 3: Executar o Script

### No Supabase SQL Editor:

1. Copie o conteúdo do arquivo escolhido
2. Cole no SQL Editor
3. Clique em **Run** ou pressione `Ctrl + Enter`

### ✅ Resultado Esperado:

Você verá 2 tabelas no final:

#### Tabela 1: Políticas Criadas
```
tablename     | policyname
--------------+----------------------------------
leads         | users_read_own_unit_leads
leads         | users_insert_own_unit_leads
leads         | users_update_own_unit_leads
leads         | users_delete_own_unit_leads
lead_history  | users_read_own_unit_lead_history
lead_history  | users_insert_lead_history
```

#### Tabela 2: RLS Habilitado
```
tablename     | rowsecurity
--------------+-------------
leads         | t (true)
lead_history  | t (true)
```

---

## 🎯 Como Funciona Cada Opção

### Opção A (Sem Admin):
| Usuário | Ver Leads | Criar | Editar | Deletar |
|---------|-----------|-------|--------|---------|
| **Qualquer usuário** | Apenas sua unidade + NULL | Apenas sua unidade | Apenas sua unidade | Apenas sua unidade |

### Opção B (Com Admin):
| Usuário | Ver Leads | Criar | Editar | Deletar |
|---------|-----------|-------|--------|---------|
| **Atendente/Gestor** | Apenas sua unidade + NULL | Apenas sua unidade | Apenas sua unidade | Apenas sua unidade |
| **Admin** | TODOS | Qualquer unidade | Qualquer lead | Qualquer lead |

---

## 🧪 Como Testar

### Teste 1: Verificar RLS Ativo
```sql
SELECT tablename, rowsecurity
FROM pg_tables 
WHERE tablename IN ('leads', 'lead_history');
```

**Esperado**: `rowsecurity = t` (true)

### Teste 2: Ver Leads Acessíveis
```sql
SELECT * FROM leads;
-- Deve mostrar apenas leads da sua unidade
```

### Teste 3: Usar a Função de Verificação
```sql
-- Substitua 'uuid-do-lead' por um ID real
SELECT can_access_lead('uuid-do-lead-aqui');
```

### Teste 4: Usar a View Auxiliar
```sql
SELECT * FROM user_accessible_leads;
```

---

## 🔧 Solução de Problemas

### Erro: "column role does not exist"
✅ **Solução**: Use a **Opção A** (arquivo sem admin)

### Erro: "column id_unidade does not exist"
❌ **Problema**: Campo `id_unidade` não existe em `leads`
- Verifique o nome correto da coluna no banco
- Substitua `id_unidade` pelo nome correto em TODO o script

### Erro: "table unit_memberships does not exist"
❌ **Problema**: Tabela de relacionamento usuário-unidade não existe
- Você precisa criar esta tabela primeiro
- Estrutura mínima:
```sql
CREATE TABLE unit_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  unit_id UUID REFERENCES units(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 Reverter RLS (Se necessário)

```sql
-- Desabilitar RLS
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history DISABLE ROW LEVEL SECURITY;

-- Remover políticas
DROP POLICY IF EXISTS "users_read_own_unit_leads" ON leads;
DROP POLICY IF EXISTS "users_insert_own_unit_leads" ON leads;
DROP POLICY IF EXISTS "users_update_own_unit_leads" ON leads;
DROP POLICY IF EXISTS "users_delete_own_unit_leads" ON leads;
DROP POLICY IF EXISTS "users_read_own_unit_lead_history" ON lead_history;
DROP POLICY IF EXISTS "users_insert_lead_history" ON lead_history;

-- Remover view e função
DROP VIEW IF EXISTS user_accessible_leads;
DROP FUNCTION IF EXISTS can_access_lead;
```

---

## 📞 Checklist de Requisitos

Antes de executar, verifique:

- [ ] Tabela `leads` existe?
- [ ] Campo `id_unidade` existe em `leads`?
- [ ] Tabela `unit_memberships` existe?
- [ ] Campos `user_id` e `unit_id` existem em `unit_memberships`?
- [ ] Tabela `lead_history` existe?
- [ ] Tabela `profiles` existe?

---

## 🎉 Resultado Final

Após executar o script correto:

✅ RLS habilitado em `leads` e `lead_history`
✅ Usuários só veem leads da sua unidade
✅ Leads sem unidade (NULL) visíveis para todos
✅ View auxiliar criada
✅ Função de verificação disponível

**Seu sistema está protegido por unidade! 🔐**
