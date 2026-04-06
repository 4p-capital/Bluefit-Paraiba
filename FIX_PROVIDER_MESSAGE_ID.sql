-- ============================================
-- 🔧 FIX: Permitir NULL em provider_message_id
-- ============================================
-- Execução: Copie e cole no Supabase SQL Editor
-- Data: 21/01/2026
-- Problema: Coluna provider_message_id tem constraint NOT NULL,
--           mas precisamos inserir mensagens ANTES de enviar para Meta
-- Solução: Tornar a coluna NULLABLE
-- ============================================

-- PASSO 1: Remover constraint NOT NULL da coluna provider_message_id
ALTER TABLE messages 
ALTER COLUMN provider_message_id DROP NOT NULL;

-- PASSO 2: Verificar estrutura da coluna
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND column_name IN ('provider_message_id', 'status', 'type');

-- PASSO 3: Recarregar schema do PostgREST
NOTIFY pgrst, 'reload schema';

-- PASSO 4: Testar INSERT sem provider_message_id (deve funcionar)
INSERT INTO messages (
  conversation_id,
  direction,
  type,
  body,
  sent_at,
  status,
  created_at
) VALUES (
  2, -- Substitua pelo ID de uma conversa real
  'outbound',
  'template'::message_type,
  'Template: teste_nullable',
  NOW(),
  'queued',
  NOW()
) RETURNING id, type, status, provider_message_id;

-- ============================================
-- ✅ RESULTADO ESPERADO DO PASSO 2:
-- ============================================
-- column_name          | data_type    | is_nullable | column_default
-- ---------------------|--------------|-------------|---------------
-- provider_message_id  | text         | YES         | NULL
-- status               | text         | YES         | NULL
-- type                 | USER-DEFINED | NO          | NULL
--
-- ✅ RESULTADO ESPERADO DO PASSO 4:
-- Deve retornar um registro com provider_message_id = NULL
-- ============================================

-- ============================================
-- 📋 APÓS EXECUTAR ESTE SQL:
-- ============================================
-- 1. ✅ Vá em Settings → API → "Reload Schema"
-- 2. ✅ Aguarde 10-15 segundos
-- 3. ✅ Recarregue a página do Blue Desk (Ctrl+F5)
-- 4. ✅ Tente enviar um template novamente
-- ============================================
