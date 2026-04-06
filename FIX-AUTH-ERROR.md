# 🔧 Guia de Correção - Erro "Could not find column"

## ❌ Erro Atual

```
Erro ao criar perfil: {
  code: "PGRST204",
  message: "Could not find the 'email' column of 'profiles' in the schema cache"
}
```

Este erro indica que a tabela `profiles` não possui as colunas necessárias para autenticação.

## ✅ Solução em 3 Passos

### **PASSO 1: Verificar Estrutura Atual**

Execute este script no **SQL Editor** do Supabase:

```sql
-- Copie e cole o conteúdo de: /database-check-profiles.sql
```

Isso mostrará:
- Quais colunas existem atualmente
- Quais colunas estão faltando
- Dados existentes na tabela

### **PASSO 2: Adicionar Colunas Faltantes**

Execute este script no **SQL Editor** do Supabase:

```sql
-- Copie e cole o conteúdo de: /database-update-profiles.sql
```

Este script:
- ✅ Adiciona coluna `user_id` (UUID para vincular ao Auth)
- ✅ Adiciona coluna `email` (se não existir)
- ✅ Adiciona coluna `full_name` (se não existir)
- ✅ Adiciona coluna `role` (se não existir)
- ✅ Cria índices de performance
- ✅ Configura políticas RLS (segurança)

### **PASSO 3: Testar Cadastro Novamente**

1. Recarregue a aplicação
2. Tente criar uma nova conta
3. O cadastro deve funcionar agora! 🎉

## 📊 Estrutura Esperada da Tabela `profiles`

Após executar os scripts, a tabela deve ter:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único do perfil |
| `user_id` | UUID | Referência ao auth.users |
| `email` | TEXT | Email do usuário |
| `full_name` | TEXT | Nome completo |
| `role` | TEXT | atendente/gestor/admin |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

## 🔍 Verificação Final

Execute no SQL Editor:

```sql
-- Ver estrutura completa
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Ver políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## ⚠️ Erros Comuns

### Erro: "relation profiles does not exist"
**Solução:** Execute primeiro o script `/database-setup-simple.sql` para criar todas as tabelas.

### Erro: "permission denied"
**Solução:** Certifique-se de estar usando uma conta com permissões de admin no Supabase.

### Erro: "duplicate key value violates unique constraint"
**Solução:** O perfil já existe. Delete registros antigos:
```sql
DELETE FROM profiles WHERE email = 'seu@email.com';
```

## 🚀 Scripts Disponíveis

1. **`/database-check-profiles.sql`** - Diagnóstico
2. **`/database-update-profiles.sql`** - Correção
3. **`/database-populate.sql`** - Dados de teste (opcional)

## 💡 Dica Pro

Se você está começando do zero, execute nesta ordem:

1. `/database-setup-simple.sql` (cria todas as tabelas)
2. `/database-update-profiles.sql` (adiciona colunas de auth)
3. `/database-populate.sql` (adiciona dados de teste)

---

**Precisa de ajuda?** Verifique os logs do servidor em:
```
Supabase Dashboard → Edge Functions → Logs
```
