-- ============================================
-- PASSO 1: Descobrir qual id_cargo é ADMIN
-- ============================================
-- Execute este script PRIMEIRO
-- ============================================

-- 1️⃣ Ver todos os cargos disponíveis
SELECT 
  id,
  nome,
  descricao,
  nivel_acesso
FROM cargos 
ORDER BY id;

-- 2️⃣ Se a tabela 'cargos' não existir, use isto:
-- Ver quais id_cargo existem na tabela profiles
SELECT 
  id_cargo,
  COUNT(*) as total_usuarios
FROM profiles
GROUP BY id_cargo
ORDER BY id_cargo;

-- 3️⃣ Ver exemplos de usuários de cada cargo
SELECT 
  id_cargo,
  nome,
  sobrenome,
  email,
  id_unidade
FROM profiles
ORDER BY id_cargo, nome
LIMIT 20;

-- ============================================
-- 📌 ANOTE O RESULTADO
-- ============================================
-- Depois de executar, anote qual número é o admin
-- Exemplo: se o admin tem id_cargo = 1, anote: 1
-- ============================================
