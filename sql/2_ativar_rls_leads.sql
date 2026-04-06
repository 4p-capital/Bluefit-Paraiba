-- ============================================
-- PASSO 2: Ativar RLS nos Leads
-- ============================================
-- ⚠️ ANTES DE EXECUTAR:
-- 1. Execute o arquivo: 1_descobrir_admin.sql
-- 2. Substitua TODOS os "id_cargo = 5" pelo número correto
-- 3. Exemplo: Se admin é id_cargo = 1, mude para "id_cargo = 1"
-- ============================================

-- ============================================
-- 1. Habilitar RLS na tabela leads
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Política de SELECT (leitura)
-- ============================================
DROP POLICY IF EXISTS "users_read_own_unit_leads" ON leads;

CREATE POLICY "users_read_own_unit_leads"
ON leads
FOR SELECT
USING (
  -- Permitir se o id_unidade do lead corresponde ao id_unidade do usuário logado
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Permitir leads sem unidade definida (NULL) para todos
  id_unidade IS NULL
  OR
  -- ADMIN: ⚠️ AJUSTE O NÚMERO ABAIXO
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  )
);

-- ============================================
-- 3. Política de INSERT (criação)
-- ============================================
DROP POLICY IF EXISTS "users_insert_own_unit_leads" ON leads;

CREATE POLICY "users_insert_own_unit_leads"
ON leads
FOR INSERT
WITH CHECK (
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  id_unidade IS NULL
  OR
  -- ADMIN: ⚠️ AJUSTE O NÚMERO ABAIXO
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  )
);

-- ============================================
-- 4. Política de UPDATE (atualização)
-- ============================================
DROP POLICY IF EXISTS "users_update_own_unit_leads" ON leads;

CREATE POLICY "users_update_own_unit_leads"
ON leads
FOR UPDATE
USING (
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  id_unidade IS NULL
  OR
  -- ADMIN: ⚠️ AJUSTE O NÚMERO ABAIXO
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  )
)
WITH CHECK (
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  id_unidade IS NULL
  OR
  -- ADMIN: ⚠️ AJUSTE O NÚMERO ABAIXO
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  )
);

-- ============================================
-- 5. Política de DELETE (exclusão)
-- ============================================
DROP POLICY IF EXISTS "users_delete_own_unit_leads" ON leads;

CREATE POLICY "users_delete_own_unit_leads"
ON leads
FOR DELETE
USING (
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  id_unidade IS NULL
  OR
  -- ADMIN: ⚠️ AJUSTE O NÚMERO ABAIXO
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  )
);

-- ============================================
-- 6. Habilitar RLS na tabela lead_history
-- ============================================
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_unit_lead_history" ON lead_history;

CREATE POLICY "users_read_own_unit_lead_history"
ON lead_history
FOR SELECT
USING (
  lead_id IN (
    SELECT id 
    FROM leads 
    WHERE id_unidade IN (
      SELECT id_unidade 
      FROM profiles 
      WHERE id = auth.uid()
    )
    OR id_unidade IS NULL
  )
  OR
  -- ADMIN: ⚠️ AJUSTE O NÚMERO ABAIXO
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  )
);

DROP POLICY IF EXISTS "users_insert_lead_history" ON lead_history;

CREATE POLICY "users_insert_lead_history"
ON lead_history
FOR INSERT
WITH CHECK (
  lead_id IN (
    SELECT id 
    FROM leads 
    WHERE id_unidade IN (
      SELECT id_unidade 
      FROM profiles 
      WHERE id = auth.uid()
    )
    OR id_unidade IS NULL
  )
  OR
  -- ADMIN: ⚠️ AJUSTE O NÚMERO ABAIXO
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  )
);

-- ============================================
-- 7. View auxiliar
-- ============================================
CREATE OR REPLACE VIEW user_accessible_leads AS
SELECT 
  l.*,
  u.name as unit_name,
  p.nome as assigned_user_nome,
  p.sobrenome as assigned_user_sobrenome
FROM leads l
LEFT JOIN units u ON l.id_unidade = u.id
LEFT JOIN profiles p ON l.assigned_user_id = p.id
WHERE 
  l.id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  l.id_unidade IS NULL
  OR
  -- ADMIN: ⚠️ AJUSTE O NÚMERO ABAIXO
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  );

-- ============================================
-- 8. Função de verificação
-- ============================================
CREATE OR REPLACE FUNCTION can_access_lead(lead_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  lead_unit_id INT;
  user_unit_id INT;
  user_is_admin BOOLEAN;
BEGIN
  SELECT id_unidade INTO lead_unit_id
  FROM leads
  WHERE id = lead_id_param;

  SELECT id_unidade INTO user_unit_id
  FROM profiles
  WHERE id = auth.uid();

  -- ⚠️ AJUSTE O NÚMERO ABAIXO
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ SUBSTITUIR PELO ID_CARGO CORRETO DO ADMIN
  ) INTO user_is_admin;

  RETURN (
    lead_unit_id IS NULL OR
    user_is_admin OR
    lead_unit_id = user_unit_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Verificação Final
-- ============================================

-- Ver políticas criadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('leads', 'lead_history')
ORDER BY tablename, policyname;

-- Ver RLS habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('leads', 'lead_history');

-- Ver seu perfil
SELECT 
  nome,
  sobrenome,
  id_cargo,
  id_unidade,
  email
FROM profiles
WHERE id = auth.uid();

-- ============================================
-- ✅ SUCESSO!
-- ============================================
-- Se você viu as políticas e rowsecurity = t,
-- o RLS está ativo e funcionando! 🎉
-- ============================================
