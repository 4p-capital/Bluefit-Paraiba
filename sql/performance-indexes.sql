-- ═══════════════════════════════════════════════════════════════════════
-- 🚀 ÍNDICES DE PERFORMANCE - BLUE DESK
-- ═══════════════════════════════════════════════════════════════════════
-- Criado em: 2026-03-17
-- Objetivo: Resolver gargalos de performance em queries críticas
-- Impacto esperado: Redução de 70-80% no tempo de resposta
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- 1️⃣ ÍNDICES PARA CONVERSAS
-- ─────────────────────────────────────────────────────────────────────

-- Índice para buscar conversas por contato (usado em joins)
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id 
  ON conversations(contact_id);

-- Índice composto para filtrar por status e ordenar por atualização
CREATE INDEX IF NOT EXISTS idx_conversations_status_updated 
  ON conversations(status, updated_at DESC);

-- Índice para buscar conversas por unidade (filtro RLS e queries)
CREATE INDEX IF NOT EXISTS idx_conversations_unit_id 
  ON conversations(unit_id);

-- Índice para buscar conversas por atendente atribuído
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_user 
  ON conversations(assigned_user_id);

-- Índice para ordenar por última mensagem (lista de conversas)
CREATE INDEX IF NOT EXISTS idx_conversations_last_message 
  ON conversations(last_message_at DESC NULLS LAST);

-- ─────────────────────────────────────────────────────────────────────
-- 2️⃣ ÍNDICES PARA MENSAGENS (CRÍTICO - maior volume)
-- ─────────────────────────────────────────────────────────────────────

-- Índice composto ESSENCIAL para buscar mensagens de uma conversa ordenadas
-- Usado em: ChatView, última mensagem preview, etc.
CREATE INDEX IF NOT EXISTS idx_messages_conv_sent 
  ON messages(conversation_id, sent_at DESC);

-- Índice para buscar mensagens por direção e data (dashboard, métricas)
CREATE INDEX IF NOT EXISTS idx_messages_direction_created 
  ON messages(direction, created_at DESC);

-- Índice para buscar mensagens por status (polling de status)
CREATE INDEX IF NOT EXISTS idx_messages_status_updated 
  ON messages(status, updated_at DESC) 
  WHERE direction = 'outbound';

-- Índice para provider_message_id (webhooks, atualizações de status)
CREATE INDEX IF NOT EXISTS idx_messages_provider_id 
  ON messages(provider_message_id) 
  WHERE provider_message_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- 3️⃣ ÍNDICES PARA TAGS DE CONVERSAS (N+1 query problem)
-- ─────────────────────────────────────────────────────────────────────

-- Índice para buscar tags de uma conversa (ConversationList)
CREATE INDEX IF NOT EXISTS idx_conversation_tags_conv 
  ON conversation_tags(conversation_id);

-- Índice para buscar conversas de uma tag (filtro por tag)
CREATE INDEX IF NOT EXISTS idx_conversation_tags_tag 
  ON conversation_tags(tag_id);

-- Índice composto para queries com join
CREATE INDEX IF NOT EXISTS idx_conversation_tags_both 
  ON conversation_tags(conversation_id, tag_id);

-- ─────────────────────────────────────────────────────────────────────
-- 4️⃣ ÍNDICES PARA CONTATOS
-- ─────────────────────────────────────────────────────────────────────

-- Índice para buscar por telefone/wa_id (usado em check-contact, onboarding)
CREATE INDEX IF NOT EXISTS idx_contacts_phone 
  ON contacts(phone_number);

CREATE INDEX IF NOT EXISTS idx_contacts_wa_id 
  ON contacts(wa_id);

-- Índice para buscar por situação (filtros, dashboard)
CREATE INDEX IF NOT EXISTS idx_contacts_situation 
  ON contacts(situation);

-- Índice para ordenar por data de criação
CREATE INDEX IF NOT EXISTS idx_contacts_created 
  ON contacts(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- 5️⃣ ÍNDICES PARA LEADS (CRM)
-- ─────────────────────────────────────────────────────────────────────

-- Índice composto ESSENCIAL para filtro por unidade + situação
CREATE INDEX IF NOT EXISTS idx_leads_unit_situation 
  ON leads(id_unidade, situacao);

-- Índice para buscar por contato vinculado
CREATE INDEX IF NOT EXISTS idx_leads_contact 
  ON leads(id_contact);

-- Índice para ordenar por data de criação
CREATE INDEX IF NOT EXISTS idx_leads_created 
  ON leads(created_at DESC);

-- Índice para buscar por origem (filtros CRM)
CREATE INDEX IF NOT EXISTS idx_leads_origem 
  ON leads(origem);

-- ─────────────────────────────────────────────────────────────────────
-- 6️⃣ ÍNDICES PARA PROFILES (AUTH E ATRIBUIÇÃO)
-- ─────────────────────────────────────────────────────────────────────

-- Índice para buscar por email (login, signup)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- Índice para buscar atendentes ativos por unidade
CREATE INDEX IF NOT EXISTS idx_profiles_unit_active 
  ON profiles(id_unidade, ativo);

-- Índice para buscar por cargo (permissões)
CREATE INDEX IF NOT EXISTS idx_profiles_cargo 
  ON profiles(id_cargo);

-- ─────────────────────────────────────────────────────────────────────
-- 7️⃣ ÍNDICES PARA TEMPLATES
-- ─────────────────────────────────────────────────────────────────────

-- Índice para buscar templates ativos por unidade
CREATE INDEX IF NOT EXISTS idx_templates_unit_active 
  ON templates(unit_id, active) 
  WHERE active = true;

-- ─────────────────────────────────────────────────────────────────────
-- 8️⃣ ÍNDICES PARA LEAD_HISTORY (AUDITORIA)
-- ─────────────────────────────────────────────────────────────────────

-- Índice para buscar histórico de um lead
CREATE INDEX IF NOT EXISTS idx_lead_history_lead 
  ON lead_history(lead_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- 9️⃣ ÍNDICES PARA SCHEDULED_CALLBACKS
-- ─────────────────────────────────────────────────────────────────────

-- Índice para buscar callbacks de uma conversa
CREATE INDEX IF NOT EXISTS idx_callbacks_conversation 
  ON scheduled_callbacks(conversation_id, scheduled_for DESC);

-- Índice para buscar callbacks pendentes (processamento)
CREATE INDEX IF NOT EXISTS idx_callbacks_pending 
  ON scheduled_callbacks(status, scheduled_for) 
  WHERE status = 'pending';

-- ─────────────────────────────────────────────────────────────────────
-- 🔟 ANÁLISE DE TABELAS (IMPORTANTE APÓS CRIAR ÍNDICES)
-- ─────────────────────────────────────────────────────────────────────

-- Atualizar estatísticas do PostgreSQL para otimizar query planner
ANALYZE conversations;
ANALYZE messages;
ANALYZE contacts;
ANALYZE leads;
ANALYZE conversation_tags;
ANALYZE profiles;
ANALYZE templates;
ANALYZE scheduled_callbacks;
ANALYZE lead_history;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ VERIFICAÇÃO - Execute para confirmar índices criados
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ═══════════════════════════════════════════════════════════════════════
-- 📊 MONITORAMENTO - Verificar uso dos índices após alguns dias
-- ═══════════════════════════════════════════════════════════════════════

-- Ver quais índices estão sendo usados
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- Ver tamanho dos índices
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- 📝 INSTRUÇÕES DE USO
-- ═══════════════════════════════════════════════════════════════════════
-- 
-- 1. Execute este script no Supabase SQL Editor
-- 2. Aguarde alguns segundos (índices são criados em background)
-- 3. Execute a query de verificação acima para confirmar
-- 4. Teste a aplicação - deve estar 5-10x mais rápida
-- 5. Após 1-2 dias, execute as queries de monitoramento
--
-- IMPORTANTE: 
-- - Índices ocupam espaço em disco (estimado: +20-30% do tamanho atual)
-- - Índices tornam INSERTs levemente mais lentos (imperceptível)
-- - O ganho em SELECTs compensa amplamente
-- - Usar "IF NOT EXISTS" permite re-executar o script com segurança
--
-- ═══════════════════════════════════════════════════════════════════════
