# 🎯 GUIA FINAL - Filtro de Leads por Unidade

## ✅ Estrutura Identificada

Sua tabela `profiles` tem:
- ✅ `id_cargo` (número) - Cargo do usuário (2, 3, 4, 5...)
- ✅ `id_unidade` (número) - Unidade do usuário (já existe!)
- ✅ Não precisa de tabela `unit_memberships` separada

---

## 🚀 EXECUTE APENAS 2 PASSOS:

### 📋 PASSO 1: Descobrir qual `id_cargo` é ADMIN

Execute esta query no Supabase SQL Editor:

```sql
-- Ver todos os cargos disponíveis
SELECT * FROM cargos ORDER BY id;
```

**Resultado esperado:**
```
id | nome             | descricao
---|------------------|----------
1  | Administrador    | Acesso total
2  | Gerente          | Gerencia unidade
3  | Atendente        | Atendimento básico
4  | Vendedor         | Vendas
5  | Supervisor       | Supervisão
```

**📌 ANOTE qual número representa o ADMIN** (exemplo: se admin é `id = 1`)

---

### ⚙️ PASSO 2: Executar o Script RLS

1. **Abra o arquivo**: `/sql/add_lead_unit_filtering_rls_CORRETO.sql`

2. **Edite o arquivo** e substitua o número em **TODAS** as linhas que têm:
   ```sql
   AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
   ```
   
   Por exemplo, se admin é `id_cargo = 1`, mude para:
   ```sql
   AND id_cargo = 1  -- Admin
   ```

3. **Execute o arquivo completo** no Supabase SQL Editor

4. **Verifique o resultado**:
   ```sql
   -- Deve mostrar RLS ativo
   SELECT tablename, rowsecurity
   FROM pg_tables 
   WHERE tablename = 'leads';
   ```

---

## ✅ Resultado Final

Após executar:

### Para Usuários Normais (não admin):
- ✅ Vê apenas leads onde `leads.id_unidade = profiles.id_unidade`
- ✅ Vê leads com `id_unidade = NULL`
- ❌ NÃO vê leads de outras unidades

### Para Administradores (id_cargo = X):
- ✅ Vê **TODOS** os leads (qualquer unidade)
- ✅ Pode criar/editar/deletar em qualquer unidade

---

## 🧪 Como Testar

### Teste 1: Ver seus leads
```sql
SELECT * FROM leads;
-- Deve mostrar apenas leads da sua unidade + NULL
```

### Teste 2: Ver seu perfil
```sql
SELECT 
  nome,
  sobrenome,
  id_cargo,
  id_unidade
FROM profiles
WHERE id = auth.uid();
```

### Teste 3: Usar a função de verificação
```sql
-- Substitua pelo UUID de um lead real
SELECT can_access_lead('uuid-do-lead-aqui');
-- Retorna TRUE se você pode acessar, FALSE se não
```

---

## 📊 Código da Aplicação

✅ **JÁ ATUALIZADO!** Os seguintes arquivos foram corrigidos:

1. `/src/app/types/database.ts`
   - `Profile.role` → `Profile.id_cargo: number`
   - `Profile.id_unidade: number | null`

2. `/src/app/components/CRMView.tsx`
   - Removida dependência de `unit_memberships`
   - Usa `profiles.id_unidade` diretamente
   - Verifica admin via `id_cargo === 5` ⚠️ **AJUSTE ESTE NÚMERO NO CÓDIGO TAMBÉM**

3. `/src/app/components/crm/LeadFormDialog.tsx`
   - Já usa `id_unidade` corretamente

---

## ⚠️ IMPORTANTE: Ajustar o Frontend

Após descobrir qual `id_cargo` é admin, você precisa atualizar **1 linha** no código:

**Arquivo**: `/src/app/components/CRMView.tsx`

**Linha 67**:
```typescript
const isAdmin = profileData?.id_cargo === 5; // ⚠️ AJUSTAR CONFORME SUA TABELA CARGOS
```

**Mude o número `5` para o id_cargo correto de admin** que você descobriu no PASSO 1.

Exemplo: Se admin é `id_cargo = 1`, mude para:
```typescript
const isAdmin = profileData?.id_cargo === 1; // Admin
```

---

## 🎉 Checklist Final

Execute na ordem:

- [ ] 1. Executei `SELECT * FROM cargos` e anotei o id do admin
- [ ] 2. Editei `/sql/add_lead_unit_filtering_rls_CORRETO.sql` (substitui todos os `id_cargo = 5`)
- [ ] 3. Executei o script SQL completo
- [ ] 4. Verifiquei que RLS está ativo (`rowsecurity = t`)
- [ ] 5. Editei `/src/app/components/CRMView.tsx` linha 67
- [ ] 6. Testei: `SELECT * FROM leads` mostra apenas minha unidade
- [ ] 7. Sistema protegido! 🔐

---

## ❓ Problemas?

### "Não sei qual é o id_cargo do admin"
```sql
-- Ver todos os cargos
SELECT * FROM cargos;

-- Se não existir tabela cargos, ver quais valores existem
SELECT DISTINCT id_cargo FROM profiles ORDER BY id_cargo;
```

### "Usuário não vê nenhum lead"
Verifique se o usuário tem `id_unidade` definido:
```sql
SELECT id_unidade FROM profiles WHERE id = auth.uid();
-- Se retornar NULL, o usuário não está em nenhuma unidade!
```

### "Quero que todos vejam tudo (sem filtro)"
Execute:
```sql
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
```

---

## 🔐 Pronto!

Seu sistema Blue Desk agora tem segurança por unidade! 🎉
