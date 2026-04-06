# 🔐 Filtro de Leads por Unidade - Blue Desk

## 🎯 O que este sistema faz?

Implementa **Row Level Security (RLS)** para que cada usuário veja apenas os leads da sua própria unidade, com exceção de administradores que veem tudo.

---

## 🚀 Execução Rápida (2 passos)

### 📋 PASSO 1: Descobrir o ID do Admin
```bash
Execute no Supabase SQL Editor: /sql/1_descobrir_admin.sql
```

Esse script mostra todos os cargos disponíveis. **Anote** qual número representa o admin.

Exemplo de resultado:
```
id | nome          | descricao
---|---------------|----------
1  | Admin         | Administrador
2  | Gerente       | Gerente de unidade
3  | Atendente     | Atendente
```

📌 **Anote o número**: Se admin é `id = 1`, anote **1**

---

### ⚙️ PASSO 2: Ativar RLS

1. **Abra o arquivo**: `/sql/2_ativar_rls_leads.sql`

2. **Edite**: Procure por **`id_cargo = 5`** e substitua pelo número do admin que você anotou

   Exemplo: Se admin é `1`, mude todas as linhas:
   ```sql
   AND id_cargo = 5  -- ⚠️ Era assim
   ```
   Para:
   ```sql
   AND id_cargo = 1  -- ✅ Agora é admin
   ```

3. **Execute o arquivo completo** no Supabase SQL Editor

---

## ✅ Verificar se Funcionou

Execute isto no SQL Editor:

```sql
-- 1. RLS está ativo?
SELECT tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'leads';
-- Esperado: rowsecurity = t (true)

-- 2. Quais políticas foram criadas?
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'leads';
-- Esperado: 4 políticas (read, insert, update, delete)

-- 3. Você vê seus leads?
SELECT COUNT(*) FROM leads;
-- Deve mostrar apenas leads da sua unidade
```

---

## 📝 IMPORTANTE: Atualizar o Código

Após descobrir o `id_cargo` do admin, edite **1 linha** no código:

**Arquivo**: `/src/app/components/CRMView.tsx`  
**Linha 67**:

```typescript
// ❌ ANTES (linha 67)
const isAdmin = profileData?.id_cargo === 5;

// ✅ DEPOIS (substitua 5 pelo número correto)
const isAdmin = profileData?.id_cargo === 1; // Exemplo se admin é 1
```

---

## 🎯 Como Funciona

| Tipo de Usuário | Ver Leads | Criar | Editar | Deletar |
|-----------------|-----------|-------|--------|---------|
| **Atendente/Gestor** | Apenas sua unidade | Apenas sua unidade | Apenas sua unidade | Apenas sua unidade |
| **Admin** | TODOS | Qualquer unidade | Qualquer unidade | Qualquer unidade |

**Exceção**: Leads com `id_unidade = NULL` são visíveis para **todos**.

---

## 🧪 Testes Úteis

```sql
-- Ver seu perfil
SELECT nome, id_cargo, id_unidade 
FROM profiles 
WHERE id = auth.uid();

-- Verificar acesso a um lead específico
SELECT can_access_lead('uuid-do-lead-aqui');

-- Ver leads acessíveis com detalhes
SELECT * FROM user_accessible_leads;
```

---

## ❓ Problemas Comuns

### "Não sei qual é o id_cargo do admin"
Execute: `/sql/1_descobrir_admin.sql`

### "Usuário não vê nenhum lead"
```sql
-- Verificar se tem unidade
SELECT id_unidade FROM profiles WHERE id = auth.uid();
-- Se retornar NULL, o usuário não tem unidade atribuída!
```

### "Quero desabilitar o filtro"
```sql
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
```

---

## 📁 Arquivos Disponíveis

| Arquivo | Descrição |
|---------|-----------|
| `1_descobrir_admin.sql` | ✅ **Execute PRIMEIRO** - Descobre id_cargo do admin |
| `2_ativar_rls_leads.sql` | ✅ **Execute DEPOIS** - Ativa RLS (requer edição) |
| `README.md` | 📖 Este arquivo - Guia simplificado |
| `GUIA_FINAL_EXECUTAR.md` | 📚 Guia detalhado com troubleshooting |
| `add_lead_unit_filtering_rls_CORRETO.sql` | 📄 Versão completa documentada |

---

## 🎉 Checklist Final

- [ ] Executei `1_descobrir_admin.sql`
- [ ] Anotei o número do `id_cargo` do admin
- [ ] Editei `2_ativar_rls_leads.sql` (substitui todos `id_cargo = 5`)
- [ ] Executei `2_ativar_rls_leads.sql` completo
- [ ] Verifiquei que `rowsecurity = t`
- [ ] Editei `/src/app/components/CRMView.tsx` linha 67
- [ ] Testei: `SELECT * FROM leads` mostra apenas minha unidade
- [ ] Sistema protegido! 🔐

---

## 🔐 Pronto!

Seu sistema Blue Desk agora está protegido com filtro por unidade! 🎉

Para mais detalhes, consulte: `/sql/GUIA_FINAL_EXECUTAR.md`
