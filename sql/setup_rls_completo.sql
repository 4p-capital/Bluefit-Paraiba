-- ================================================================
-- BLUE DESK - Setup RLS Completo para Leads
-- ================================================================
-- COMO EXECUTAR:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Selecione seu projeto (manvezhphopngpnaiyjv)
-- 3. Vá em "SQL Editor" (menu lateral esquerdo)
-- 4. Cole TODO este script e clique em "Run"
-- ================================================================

-- ================================================================
-- PASSO 0: Diagnóstico - Descubra seus cargos
-- ================================================================
-- Este SELECT mostra todos os id_cargo existentes no seu banco.
-- Anote qual é o cargo de ADMIN antes de continuar.
-- Execute esta linha SOZINHA primeiro para ver os resultados:

SELECT 
  p.id_cargo,
  COUNT(*) as total_usuarios,
  string_agg(DISTINCT (p.nome || ' ' || COALESCE(p.sobrenome, '')), ', ' ORDER BY (p.nome || ' ' || COALESCE(p.sobrenome, ''))) as exemplos
FROM profiles p
GROUP BY p.id_cargo
ORDER BY p.id_cargo;

-- ================================================================
-- PASSO 1: Criar função auxiliar para verificar admin
-- ================================================================
-- AJUSTE AQUI: Substitua {1, 5} pelos id_cargo que são admin
-- Exemplo: Se admin é id_cargo=1, use ARRAY[1]
-- Se admin é id_cargo=1 E id_cargo=5, use ARRAY[1, 5]

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = ANY(ARRAY[1, 5])  -- ⚠️ AJUSTE: IDs de cargo admin
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Função para pegar o id_unidade do usuário logado
CREATE OR REPLACE FUNCTION get_user_unit_id()
RETURNS INT8 AS $$
DECLARE
  unit_id INT8;
BEGIN
  SELECT id_unidade INTO unit_id
  FROM profiles
  WHERE id = auth.uid();
  RETURN unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ================================================================
-- PASSO 2: Habilitar RLS na tabela leads
-- ================================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PASSO 3: Remover políticas antigas (se existirem)
-- ================================================================
DROP POLICY IF EXISTS "users_read_own_unit_leads" ON leads;
DROP POLICY IF EXISTS "users_insert_own_unit_leads" ON leads;
DROP POLICY IF EXISTS "users_update_own_unit_leads" ON leads;
DROP POLICY IF EXISTS "users_delete_own_unit_leads" ON leads;
DROP POLICY IF EXISTS "leads_select_policy" ON leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON leads;
DROP POLICY IF EXISTS "leads_update_policy" ON leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON leads;

-- ================================================================
-- PASSO 4: Criar políticas RLS para leads
-- ================================================================

-- SELECT: Usuário vê leads da sua unidade, leads sem unidade, ou tudo se admin
CREATE POLICY "leads_select_policy"
ON leads FOR SELECT
USING (
  is_admin_user()
  OR id_unidade IS NULL
  OR id_unidade = get_user_unit_id()
);

-- INSERT: Usuário cria leads na sua unidade, sem unidade, ou qualquer se admin
CREATE POLICY "leads_insert_policy"
ON leads FOR INSERT
WITH CHECK (
  is_admin_user()
  OR id_unidade IS NULL
  OR id_unidade = get_user_unit_id()
);

-- UPDATE: Usuário edita leads da sua unidade, sem unidade, ou qualquer se admin
CREATE POLICY "leads_update_policy"
ON leads FOR UPDATE
USING (
  is_admin_user()
  OR id_unidade IS NULL
  OR id_unidade = get_user_unit_id()
)
WITH CHECK (
  is_admin_user()
  OR id_unidade IS NULL
  OR id_unidade = get_user_unit_id()
);

-- DELETE: Usuário deleta leads da sua unidade, sem unidade, ou qualquer se admin
CREATE POLICY "leads_delete_policy"
ON leads FOR DELETE
USING (
  is_admin_user()
  OR id_unidade IS NULL
  OR id_unidade = get_user_unit_id()
);

-- ================================================================
-- PASSO 5: RLS para lead_history
-- ================================================================
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_history_select_policy" ON lead_history;
DROP POLICY IF EXISTS "lead_history_insert_policy" ON lead_history;
DROP POLICY IF EXISTS "users_read_own_unit_lead_history" ON lead_history;
DROP POLICY IF EXISTS "users_insert_lead_history" ON lead_history;

-- SELECT: Ver histórico de leads acessíveis
CREATE POLICY "lead_history_select_policy"
ON lead_history FOR SELECT
USING (
  is_admin_user()
  OR lead_id IN (
    SELECT id FROM leads
    WHERE id_unidade IS NULL
    OR id_unidade = get_user_unit_id()
  )
);

-- INSERT: Inserir histórico de leads acessíveis
CREATE POLICY "lead_history_insert_policy"
ON lead_history FOR INSERT
WITH CHECK (
  is_admin_user()
  OR lead_id IN (
    SELECT id FROM leads
    WHERE id_unidade IS NULL
    OR id_unidade = get_user_unit_id()
  )
);

-- ================================================================
-- PASSO 6: Verificação Final
-- ================================================================

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('leads', 'lead_history')
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('leads', 'lead_history')
ORDER BY tablename, policyname;

-- Verificar seu perfil atual
SELECT 
  id,
  nome,
  sobrenome,
  email,
  id_cargo,
  id_unidade,
  is_admin_user() as eh_admin,
  get_user_unit_id() as minha_unidade
FROM profiles
WHERE id = auth.uid();

-- ================================================================
-- ✅ RESULTADO ESPERADO:
-- ================================================================
-- 1. rowsecurity = true para leads e lead_history
-- 2. 4 políticas para leads (select, insert, update, delete)
-- 3. 2 políticas para lead_history (select, insert)
-- 4. Seu perfil mostrando id_cargo e id_unidade corretos
-- 5. eh_admin = true se seu cargo é admin
-- ================================================================
