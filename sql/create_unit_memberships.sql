-- ============================================
-- Criar Tabela unit_memberships (Se não existir)
-- ============================================
-- Esta tabela relaciona usuários com suas unidades
-- Um usuário pode pertencer a múltiplas unidades
-- ============================================

-- Verificar se a tabela já existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'unit_memberships'
  ) THEN
    
    -- Criar tabela
    CREATE TABLE unit_memberships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Garantir que um usuário não seja adicionado duas vezes na mesma unidade
      UNIQUE(user_id, unit_id)
    );

    -- Criar índices para melhor performance
    CREATE INDEX idx_unit_memberships_user_id ON unit_memberships(user_id);
    CREATE INDEX idx_unit_memberships_unit_id ON unit_memberships(unit_id);

    -- Comentário na tabela
    COMMENT ON TABLE unit_memberships IS 'Relacionamento entre usuários e unidades - permite multi-tenancy';

    RAISE NOTICE 'Tabela unit_memberships criada com sucesso!';
    
  ELSE
    RAISE NOTICE 'Tabela unit_memberships já existe. Nada foi alterado.';
  END IF;
END $$;

-- ============================================
-- Habilitar RLS na tabela (opcional)
-- ============================================
ALTER TABLE unit_memberships ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver suas próprias memberships
DROP POLICY IF EXISTS "users_read_own_memberships" ON unit_memberships;

CREATE POLICY "users_read_own_memberships"
ON unit_memberships
FOR SELECT
USING (user_id = auth.uid());

-- ============================================
-- Exemplo de Inserção (para teste)
-- ============================================
-- Descomente as linhas abaixo e substitua os UUIDs
-- para adicionar um usuário a uma unidade

/*
INSERT INTO unit_memberships (user_id, unit_id)
VALUES 
  ('uuid-do-usuario-aqui', 'uuid-da-unidade-aqui')
ON CONFLICT (user_id, unit_id) DO NOTHING;
*/

-- ============================================
-- Consultas Úteis
-- ============================================

-- Ver todas as memberships
SELECT 
  um.id,
  p.nome || ' ' || p.sobrenome as usuario,
  u.name as unidade,
  um.created_at
FROM unit_memberships um
LEFT JOIN profiles p ON um.user_id = p.id
LEFT JOIN units u ON um.unit_id = u.id
ORDER BY um.created_at DESC;

-- Contar quantos usuários por unidade
SELECT 
  u.name as unidade,
  COUNT(um.user_id) as total_usuarios
FROM units u
LEFT JOIN unit_memberships um ON u.id = um.unit_id
GROUP BY u.id, u.name
ORDER BY total_usuarios DESC;

-- Ver unidades de um usuário específico
-- Substitua 'uuid-do-usuario' pelo ID real
/*
SELECT 
  u.id,
  u.name as unidade,
  um.created_at as membro_desde
FROM unit_memberships um
JOIN units u ON um.unit_id = u.id
WHERE um.user_id = 'uuid-do-usuario-aqui';
*/
