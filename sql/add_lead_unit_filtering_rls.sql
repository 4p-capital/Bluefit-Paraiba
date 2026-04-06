-- ============================================
-- Blue Desk CRM - Filtro de Visualização por Unidade
-- ============================================
-- Implementa Row Level Security (RLS) para que usuários
-- só visualizem leads da mesma unidade (id_unidade)
-- ============================================

-- ============================================
-- 1. Habilitar RLS na tabela leads
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Política de SELECT (leitura)
-- Usuários só podem VER leads da sua unidade
-- ============================================
DROP POLICY IF EXISTS "users_read_own_unit_leads" ON leads;

CREATE POLICY "users_read_own_unit_leads"
ON leads
FOR SELECT
USING (
  -- Permitir se o id_unidade do lead corresponde a alguma unidade do usuário
  id_unidade IN (
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  -- Permitir leads sem unidade definida (NULL) para todos
  id_unidade IS NULL
);

-- ============================================
-- 3. Política de INSERT (criação)
-- Usuários só podem CRIAR leads com id_unidade das suas unidades
-- ============================================
DROP POLICY IF EXISTS "users_insert_own_unit_leads" ON leads;

CREATE POLICY "users_insert_own_unit_leads"
ON leads
FOR INSERT
WITH CHECK (
  -- Permitir se o id_unidade pertence ao usuário
  id_unidade IN (
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  -- Permitir leads sem unidade definida (NULL)
  id_unidade IS NULL
);

-- ============================================
-- 4. Política de UPDATE (atualização)
-- Usuários só podem ATUALIZAR leads da sua unidade
-- ============================================
DROP POLICY IF EXISTS "users_update_own_unit_leads" ON leads;

CREATE POLICY "users_update_own_unit_leads"
ON leads
FOR UPDATE
USING (
  -- Permitir se o id_unidade atual pertence ao usuário
  id_unidade IN (
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  -- Permitir leads sem unidade definida (NULL)
  id_unidade IS NULL
)
WITH CHECK (
  -- O NOVO id_unidade também deve pertencer ao usuário
  id_unidade IN (
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  -- Permitir atualizar para NULL
  id_unidade IS NULL
);

-- ============================================
-- 5. Política de DELETE (exclusão)
-- Usuários só podem DELETAR leads da sua unidade
-- ============================================
DROP POLICY IF EXISTS "users_delete_own_unit_leads" ON leads;

CREATE POLICY "users_delete_own_unit_leads"
ON leads
FOR DELETE
USING (
  -- Permitir se o id_unidade pertence ao usuário
  id_unidade IN (
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  -- Permitir deletar leads sem unidade definida (NULL)
  id_unidade IS NULL
);

-- ============================================
-- 6. Habilitar RLS na tabela lead_history
-- (Para garantir que o histórico também seja filtrado)
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
      SELECT unit_id 
      FROM unit_memberships 
      WHERE user_id = auth.uid()
    )
    OR id_unidade IS NULL
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
      SELECT unit_id 
      FROM unit_memberships 
      WHERE user_id = auth.uid()
    )
    OR id_unidade IS NULL
  )
);

-- ============================================
-- 7. View auxiliar para facilitar consultas
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
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  -- Leads sem unidade
  l.id_unidade IS NULL;

COMMENT ON VIEW user_accessible_leads IS 'View com leads filtrados por unidade do usuário logado';

-- ============================================
-- 8. Função para verificar permissão de lead
-- ============================================
CREATE OR REPLACE FUNCTION can_access_lead(lead_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  lead_unit_id INT;
BEGIN
  -- Buscar id_unidade do lead
  SELECT id_unidade INTO lead_unit_id
  FROM leads
  WHERE id = lead_id_param;

  -- Retornar true se:
  -- 1. Lead não tem unidade (NULL)
  -- 2. Lead pertence à unidade do usuário
  RETURN (
    lead_unit_id IS NULL OR
    lead_unit_id IN (
      SELECT unit_id 
      FROM unit_memberships 
      WHERE user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_access_lead IS 'Verifica se o usuário logado pode acessar um lead específico';

-- ============================================
-- 9. Verificação e Testes
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
