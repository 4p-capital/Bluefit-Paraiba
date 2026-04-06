-- ========================================
-- VERIFICAÇÃO E CORREÇÃO DA TABELA PROFILES
-- Execute este script primeiro para diagnosticar
-- ========================================

-- 1. Verificar estrutura ATUAL da tabela profiles
SELECT 
  '📊 ESTRUTURA ATUAL DA TABELA PROFILES:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar se as colunas necessárias existem
SELECT 
  '🔍 VERIFICAÇÃO DE COLUNAS:' as info;

SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id'
  ) THEN '✅ id existe' ELSE '❌ id não existe' END as status_id,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN '✅ user_id existe' ELSE '❌ user_id não existe' END as status_user_id,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN '✅ email existe' ELSE '❌ email não existe' END as status_email,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN '✅ full_name existe' ELSE '❌ full_name não existe' END as status_full_name,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN '✅ role existe' ELSE '❌ role não existe' END as status_role;

-- 3. Ver dados existentes
SELECT 
  '📝 DADOS EXISTENTES:' as info;

SELECT COUNT(*) as total_registros FROM profiles;

SELECT * FROM profiles LIMIT 5;
