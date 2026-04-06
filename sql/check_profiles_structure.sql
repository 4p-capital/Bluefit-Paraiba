-- ============================================
-- Script para Verificar Estrutura da Tabela Profiles
-- ============================================
-- Execute este script PRIMEIRO para descobrir
-- quais colunas existem na tabela profiles
-- ============================================

-- 1. Listar TODAS as colunas da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Ver dados de exemplo (primeiras 5 linhas)
-- Isso ajuda a identificar qual coluna é o "role"
SELECT * FROM profiles LIMIT 5;

-- 3. Verificar se existe alguma coluna com nome parecido com "role"
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
AND (
  column_name ILIKE '%role%' OR
  column_name ILIKE '%papel%' OR
  column_name ILIKE '%tipo%' OR
  column_name ILIKE '%perfil%' OR
  column_name ILIKE '%nivel%' OR
  column_name ILIKE '%permiss%'
);
