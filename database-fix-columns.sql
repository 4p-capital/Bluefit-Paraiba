-- ========================================
-- SCRIPT PARA ADICIONAR COLUNAS FALTANTES
-- ========================================

-- Adicionar coluna description na tabela units (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'description'
  ) THEN
    ALTER TABLE units ADD COLUMN description TEXT;
  END IF;
END $$;

-- Adicionar coluna user_id na tabela profiles (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Verificar estrutura das tabelas
SELECT 'Colunas da tabela units:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'units'
ORDER BY ordinal_position;

SELECT 'Colunas da tabela profiles:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
