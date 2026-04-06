-- ========================================
-- ATUALIZAÇÃO DA TABELA PROFILES
-- Adiciona suporte para autenticação
-- ========================================

-- Verificar e adicionar coluna user_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_id UUID;
    COMMENT ON COLUMN profiles.user_id IS 'UUID do usuário no Supabase Auth';
  END IF;
END $$;

-- Verificar e adicionar coluna email se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
    COMMENT ON COLUMN profiles.email IS 'Email do usuário';
  END IF;
END $$;

-- Verificar e adicionar coluna full_name se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    COMMENT ON COLUMN profiles.full_name IS 'Nome completo do usuário';
  END IF;
END $$;

-- Verificar e adicionar coluna role se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'atendente';
    COMMENT ON COLUMN profiles.role IS 'Papel do usuário: atendente, gestor, admin';
  END IF;
END $$;

-- Adicionar constraint para role se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('atendente', 'gestor', 'admin'));
  END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Atualizar políticas RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all for service role" ON profiles;

-- Criar novas políticas
-- Permitir leitura para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

-- Permitir todas operações para service role
CREATE POLICY "Enable all for service role" ON profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Permitir update apenas do próprio perfil para usuários autenticados
CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verificar estrutura atualizada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

SELECT '✅ Tabela profiles atualizada com sucesso!' as status;