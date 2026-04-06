-- ============================================
-- 📊 CRIAR TABELA message_status_events
-- ============================================
-- Data: 21/01/2026
-- Descrição: Tabela para registrar histórico de mudanças
--            de status das mensagens (sent → delivered → read)
-- ============================================

-- 1️⃣ CRIAR TABELA message_status_events
CREATE TABLE IF NOT EXISTS message_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2️⃣ CRIAR ÍNDICES
CREATE INDEX idx_message_status_events_message_id ON message_status_events(message_id);
CREATE INDEX idx_message_status_events_timestamp ON message_status_events(timestamp DESC);

-- 3️⃣ ADICIONAR COMENTÁRIOS
COMMENT ON TABLE message_status_events IS 'Histórico de mudanças de status das mensagens enviadas';
COMMENT ON COLUMN message_status_events.message_id IS 'FK para messages (CASCADE delete)';
COMMENT ON COLUMN message_status_events.status IS 'Status recebido da Meta: sent, delivered, read, failed';

-- 4️⃣ RECARREGAR SCHEMA
NOTIFY pgrst, 'reload schema';

-- 5️⃣ VERIFICAR ESTRUTURA
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'message_status_events'
ORDER BY ordinal_position;
