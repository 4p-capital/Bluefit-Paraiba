-- ============================================
-- 🔍 VERIFICAR ESTRUTURA DAS TABELAS
-- ============================================
-- Execute este SQL para ver as colunas de cada tabela
-- e comparar com o que o código está tentando usar
-- ============================================

-- 1️⃣ ESTRUTURA DA TABELA contacts
SELECT 
  '=== TABELA: contacts ===' AS info,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- 2️⃣ ESTRUTURA DA TABELA conversations
SELECT 
  '=== TABELA: conversations ===' AS info,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 3️⃣ ESTRUTURA DA TABELA messages
SELECT 
  '=== TABELA: messages ===' AS info,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 4️⃣ VER TODOS OS ENUMS
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('message_type', 'message_direction', 'contact_situation', 'conversation_status')
ORDER BY t.typname, e.enumsortorder;
