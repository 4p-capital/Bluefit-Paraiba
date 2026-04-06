-- ============================================
-- Blue Desk CRM - Filtro de Visualização por Unidade COM ADMIN
-- ============================================
-- ATENÇÃO: Use este arquivo apenas se sua tabela profiles
-- tiver uma coluna para identificar administradores
-- Substitua 'NOME_DA_COLUNA_ROLE' pelo nome correto
-- ============================================

-- IMPORTANTE: Antes de executar, substitua todos os casos de:
-- profiles.NOME_DA_COLUNA_ROLE = 'admin'
-- Pelo nome real da coluna e valor correto na sua tabela

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
  OR
  -- ADMIN: Substitua 'NOME_DA_COLUNA_ROLE' pelo nome real
  -- Exemplo: papel = 'admin' ou role = 'admin' ou tipo_usuario = 'administrador'
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND NOME_DA_COLUNA_ROLE = 'admin'  -- ⚠️ SUBSTITUIR AQUI
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
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  id_unidade IS NULL
  OR
  -- ADMIN: Substitua 'NOME_DA_COLUNA_ROLE' pelo nome real
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND NOME_DA_COLUNA_ROLE = 'admin'  -- ⚠️ SUBSTITUIR AQUI
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
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  id_unidade IS NULL
  OR
  -- ADMIN: Substitua 'NOME_DA_COLUNA_ROLE' pelo nome real
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND NOME_DA_COLUNA_ROLE = 'admin'  -- ⚠️ SUBSTITUIR AQUI
  )
)
WITH CHECK (
  id_unidade IN (
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  id_unidade IS NULL
  OR
  -- ADMIN: Substitua 'NOME_DA_COLUNA_ROLE' pelo nome real
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND NOME_DA_COLUNA_ROLE = 'admin'  -- ⚠️ SUBSTITUIR AQUI
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
    SELECT unit_id 
    FROM unit_memberships 
    WHERE user_id = auth.uid()
  )
  OR
  id_unidade IS NULL
  OR
  -- ADMIN: Substitua 'NOME_DA_COLUNA_ROLE' pelo nome real
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND NOME_DA_COLUNA_ROLE = 'admin'  -- ⚠️ SUBSTITUIR AQUI
  )
);

-- ============================================
-- Histórico e demais configurações...
-- (igual ao arquivo anterior)
-- ============================================
