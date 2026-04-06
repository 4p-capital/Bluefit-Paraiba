-- ============================================
-- Blue Desk CRM - Filtro de Visualização por Unidade
-- ============================================
-- VERSÃO CORRETA para estrutura com profiles.id_unidade
-- ============================================

-- ============================================
-- 1. Verificar qual id_cargo é ADMIN
-- ============================================
-- Execute esta query primeiro para descobrir os cargos:
SELECT * FROM cargos ORDER BY id;

-- Depois, substitua o número correto na linha abaixo:
-- Se id_cargo = 1 é admin, use: AND id_cargo = 1
-- Se id_cargo = 5 é admin, use: AND id_cargo = 5
-- etc.

-- ============================================
-- 2. Habilitar RLS na tabela leads
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Política de SELECT (leitura)
-- Usuários veem leads da sua unidade OU são admin
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
  -- ADMIN: Ajuste o número do id_cargo conforme seu banco
  -- Exemplo: se admin é id_cargo = 1, use: AND id_cargo = 1
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO CONFORME SUA TABELA CARGOS
  )
);

-- ============================================
-- 4. Política de INSERT (criação)
-- ============================================
DROP POLICY IF EXISTS "users_insert_own_unit_leads" ON leads;

CREATE POLICY "users_insert_own_unit_leads"
ON leads
FOR INSERT
WITH CHECK (
  -- Permitir se o id_unidade pertence ao usuário
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Permitir leads sem unidade definida (NULL)
  id_unidade IS NULL
  OR
  -- ADMIN pode criar em qualquer unidade
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
  )
);

-- ============================================
-- 5. Política de UPDATE (atualização)
-- ============================================
DROP POLICY IF EXISTS "users_update_own_unit_leads" ON leads;

CREATE POLICY "users_update_own_unit_leads"
ON leads
FOR UPDATE
USING (
  -- Permitir se o id_unidade atual pertence ao usuário
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Permitir leads sem unidade definida (NULL)
  id_unidade IS NULL
  OR
  -- ADMIN pode atualizar qualquer lead
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
  )
)
WITH CHECK (
  -- O NOVO id_unidade também deve pertencer ao usuário
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Permitir atualizar para NULL
  id_unidade IS NULL
  OR
  -- ADMIN pode mudar para qualquer unidade
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
  )
);

-- ============================================
-- 6. Política de DELETE (exclusão)
-- ============================================
DROP POLICY IF EXISTS "users_delete_own_unit_leads" ON leads;

CREATE POLICY "users_delete_own_unit_leads"
ON leads
FOR DELETE
USING (
  -- Permitir se o id_unidade pertence ao usuário
  id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Permitir deletar leads sem unidade definida (NULL)
  id_unidade IS NULL
  OR
  -- ADMIN pode deletar qualquer lead
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
  )
);

-- ============================================
-- 7. Habilitar RLS na tabela lead_history
-- ============================================
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_unit_lead_history" ON lead_history;

CREATE POLICY "users_read_own_unit_lead_history"
ON lead_history
FOR SELECT
USING (
  -- Permitir se o lead associado pertence à unidade do usuário
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
  -- ADMIN pode ver todo histórico
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
  )
);

DROP POLICY IF EXISTS "users_insert_lead_history" ON lead_history;

CREATE POLICY "users_insert_lead_history"
ON lead_history
FOR INSERT
WITH CHECK (
  -- Permitir inserir histórico de leads da própria unidade
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
  -- ADMIN pode inserir histórico de qualquer lead
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
  )
);

-- ============================================
-- 8. View auxiliar para facilitar consultas
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
  -- Leads da unidade do usuário
  l.id_unidade IN (
    SELECT id_unidade 
    FROM profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Leads sem unidade
  l.id_unidade IS NULL
  OR
  -- Usuário é admin
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
  );

COMMENT ON VIEW user_accessible_leads IS 'View com leads filtrados por unidade do usuário logado';

-- ============================================
-- 9. Função para verificar permissão de lead
-- ============================================
CREATE OR REPLACE FUNCTION can_access_lead(lead_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  lead_unit_id INT;
  user_unit_id INT;
  user_is_admin BOOLEAN;
BEGIN
  -- Buscar id_unidade do lead
  SELECT id_unidade INTO lead_unit_id
  FROM leads
  WHERE id = lead_id_param;

  -- Buscar id_unidade do usuário
  SELECT id_unidade INTO user_unit_id
  FROM profiles
  WHERE id = auth.uid();

  -- Verificar se usuário é admin
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND id_cargo = 5  -- ⚠️ AJUSTAR ESTE NÚMERO
  ) INTO user_is_admin;

  -- Retornar true se:
  -- 1. Lead não tem unidade (NULL)
  -- 2. Usuário é admin
  -- 3. Lead pertence à mesma unidade do usuário
  RETURN (
    lead_unit_id IS NULL OR
    user_is_admin OR
    lead_unit_id = user_unit_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_access_lead IS 'Verifica se o usuário logado pode acessar um lead específico';

-- ============================================
-- 10. Verificação e Testes
-- ============================================

-- Verificar políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('leads', 'lead_history')
ORDER BY tablename, policyname;

-- Verificar RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('leads', 'lead_history');

-- Ver meu perfil (para verificar meu id_unidade e id_cargo)
SELECT 
  id,
  nome,
  sobrenome,
  id_cargo,
  id_unidade,
  email
FROM profiles
WHERE id = auth.uid();
