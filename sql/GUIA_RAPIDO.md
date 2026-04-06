# 🚀 Guia Rápido: Filtro de Leads por Unidade

## 📋 Execute nesta ordem:

### ✅ PASSO 1: Verificar Estrutura
```bash
Execute: /sql/check_profiles_structure.sql
```
**Objetivo**: Descobrir se existe coluna de "role" na tabela profiles

---

### ✅ PASSO 2: Criar Tabela unit_memberships (se necessário)
```bash
Execute: /sql/create_unit_memberships.sql
```
**Objetivo**: Criar tabela que relaciona usuários com unidades

⚠️ **Após criar, você precisa adicionar usuários às unidades:**
```sql
-- Exemplo: Adicionar usuário à unidade
INSERT INTO unit_memberships (user_id, unit_id)
VALUES ('uuid-do-usuario', 'uuid-da-unidade');
```

---

### ✅ PASSO 3: Ativar RLS nos Leads

**OPÇÃO A** - Se NÃO existe coluna "role" OU todos têm mesmo acesso:
```bash
Execute: /sql/add_lead_unit_filtering_rls.sql
```

**OPÇÃO B** - Se existe coluna "role" e quer que admins vejam tudo:
```bash
1. Abra: /sql/add_lead_unit_filtering_rls_with_admin.sql
2. Substitua 'NOME_DA_COLUNA_ROLE' pelo nome real
3. Execute
```

---

### ✅ PASSO 4: Testar
```sql
-- 1. Verificar RLS ativo
SELECT tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'leads';
-- Esperado: rowsecurity = t

-- 2. Ver apenas seus leads
SELECT * FROM leads;

-- 3. Usar view auxiliar
SELECT * FROM user_accessible_leads;
```

---

## 🎯 Resultado Final

✅ Usuários só veem leads da sua unidade
✅ Leads sem unidade (NULL) são visíveis para todos
✅ RLS protege contra acesso não autorizado
✅ Aplicação frontend já está preparada

---

## ❓ Problemas Comuns

### "column role does not exist"
→ Use OPÇÃO A (arquivo sem admin)

### "table unit_memberships does not exist"
→ Execute PASSO 2 primeiro

### "column id_unidade does not exist"
→ Verifique o nome correto da coluna em `leads`
→ Substitua no script SQL

### Usuário não vê nenhum lead
→ Verifique se ele está em `unit_memberships`:
```sql
SELECT * FROM unit_memberships WHERE user_id = 'uuid-do-usuario';
```
→ Se não estiver, adicione:
```sql
INSERT INTO unit_memberships (user_id, unit_id)
VALUES ('uuid-do-usuario', 'uuid-da-unidade');
```

---

## 📞 Checklist Completo

- [ ] Executei `check_profiles_structure.sql`
- [ ] Criei/verifiquei tabela `unit_memberships`
- [ ] Adicionei usuários às unidades
- [ ] Executei script RLS correto (A ou B)
- [ ] Verifiquei que RLS está ativo (`rowsecurity = t`)
- [ ] Testei query `SELECT * FROM leads`
- [ ] Usuário vê apenas leads da sua unidade ✅

---

## 🎉 Pronto!

Seu sistema está protegido com filtro por unidade! 🔐
