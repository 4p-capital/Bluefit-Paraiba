-- 🔍 SQL Queries para Debug e Teste do Dashboard Blue Desk

-- ══════════════════════════���════════════════════════════
-- 📊 VERIFICAR DADOS EXISTENTES
-- ═══════════════════════════════════════════════════════

-- Total de registros em cada tabela
SELECT 
  'contacts' as tabela,
  COUNT(*) as total
FROM contacts
UNION ALL
SELECT 
  'conversations' as tabela,
  COUNT(*) as total
FROM conversations
UNION ALL
SELECT 
  'messages' as tabela,
  COUNT(*) as total
FROM messages
UNION ALL
SELECT 
  'profiles' as tabela,
  COUNT(*) as total
FROM profiles;

-- ═══════════════════════════════════════════════════════
-- 📅 VERIFICAR DADOS POR PERÍODO
-- ═══════════════════════════════════════════════════════

-- Conversas dos últimos 7 dias
SELECT 
  DATE(created_at) as data,
  COUNT(*) as total_conversas,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as abertas,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as fechadas
FROM conversations
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- Mensagens dos últimos 7 dias
SELECT 
  DATE(created_at) as data,
  COUNT(*) as total_mensagens,
  COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as recebidas,
  COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as enviadas
FROM messages
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- ═══════════════════════════════════════════════════════
-- 👥 ANÁLISE DE ATENDENTES
-- ═══════════════════════════════════════════════════════

-- Top 10 atendentes com mais conversas
SELECT 
  p.nome || ' ' || p.sobrenome as atendente,
  p.email,
  COUNT(c.id) as total_conversas,
  COUNT(CASE WHEN c.status = 'closed' THEN 1 END) as resolvidas,
  ROUND(
    COUNT(CASE WHEN c.status = 'closed' THEN 1 END)::numeric / 
    NULLIF(COUNT(c.id), 0) * 100, 
    2
  ) as taxa_resolucao
FROM conversations c
LEFT JOIN profiles p ON c.assigned_user_id = p.id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
  AND p.id IS NOT NULL
GROUP BY p.id, p.nome, p.sobrenome, p.email
ORDER BY total_conversas DESC
LIMIT 10;

-- ═══════════════════════════════════════════════════════
-- ⏱️ TEMPO DE RESPOSTA
-- ═══════════════════════════════════════════════════════

-- Calcular tempo médio de resposta por conversa
WITH response_times AS (
  SELECT 
    m1.conversation_id,
    m1.created_at as cliente_mensagem,
    (
      SELECT MIN(m2.created_at)
      FROM messages m2
      WHERE m2.conversation_id = m1.conversation_id
        AND m2.direction = 'outbound'
        AND m2.created_at > m1.created_at
    ) as atendente_resposta,
    EXTRACT(EPOCH FROM (
      (
        SELECT MIN(m2.created_at)
        FROM messages m2
        WHERE m2.conversation_id = m1.conversation_id
          AND m2.direction = 'outbound'
          AND m2.created_at > m1.created_at
      ) - m1.created_at
    )) / 60 as minutos_resposta
  FROM messages m1
  WHERE m1.direction = 'inbound'
    AND m1.created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  COUNT(*) as total_interacoes,
  ROUND(AVG(minutos_resposta)::numeric, 2) as tempo_medio_minutos,
  ROUND(MIN(minutos_resposta)::numeric, 2) as tempo_minimo,
  ROUND(MAX(minutos_resposta)::numeric, 2) as tempo_maximo
FROM response_times
WHERE minutos_resposta IS NOT NULL
  AND minutos_resposta > 0
  AND minutos_resposta < 1440; -- Máximo 24h

-- ═══════════════════════════════════════════════════════
-- 📊 DISTRIBUIÇÃO POR STATUS
-- ═══════════════════════════════════════════════════════

SELECT 
  status,
  COUNT(*) as quantidade,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM conversations WHERE created_at >= NOW() - INTERVAL '30 days') * 100, 2) as percentual
FROM conversations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status
ORDER BY quantidade DESC;

-- ═══════════════════════════════════════════════════════
-- 🕐 MENSAGENS POR HORA DO DIA
-- ═══════════════════════════════════════════════════════

SELECT 
  EXTRACT(HOUR FROM created_at) as hora,
  COUNT(*) as total_mensagens,
  COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as recebidas,
  COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as enviadas
FROM messages
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hora;

-- ═══════════════════════════════════════════════════════
-- 📎 TIPOS DE MENSAGENS
-- ═══════════════════════════════════════════════════════

SELECT 
  type as tipo,
  COUNT(*) as quantidade,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM messages WHERE created_at >= NOW() - INTERVAL '30 days') * 100, 2) as percentual
FROM messages
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY type
ORDER BY quantidade DESC;

-- ═══════════════════════════════════════════════════════
-- 🔍 VERIFICAR CONVERSAS SEM ATENDENTE
-- ═══════════════════════════════════════════════════════

SELECT 
  c.id,
  c.created_at,
  c.status,
  ct.display_name as contato,
  ct.phone_number
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
WHERE c.assigned_user_id IS NULL
  AND c.created_at >= NOW() - INTERVAL '7 days'
ORDER BY c.created_at DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════
-- 📈 CRESCIMENTO DIÁRIO
-- ═══════════════════════════════════════════════════════

WITH daily_stats AS (
  SELECT 
    DATE(created_at) as data,
    COUNT(*) as total
  FROM conversations
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
)
SELECT 
  data,
  total,
  LAG(total) OVER (ORDER BY data) as dia_anterior,
  total - LAG(total) OVER (ORDER BY data) as diferenca,
  ROUND(
    (total - LAG(total) OVER (ORDER BY data))::numeric / 
    NULLIF(LAG(total) OVER (ORDER BY data), 0) * 100,
    2
  ) as percentual_crescimento
FROM daily_stats
ORDER BY data DESC;

-- ═══════════════════════════════════════════════════════
-- 🎯 CONVERSAS MAIS ATIVAS
-- ═══════════════════════════════════════════════════════

SELECT 
  c.id,
  ct.display_name as contato,
  COUNT(m.id) as total_mensagens,
  MAX(m.created_at) as ultima_mensagem,
  c.status
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.created_at >= NOW() - INTERVAL '7 days'
GROUP BY c.id, ct.display_name, c.status
ORDER BY total_mensagens DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════
-- 🚨 CRIAR DADOS DE TESTE (SE NECESSÁRIO)
-- ═══════════════════════════════════════════════════════

-- ATENÇÃO: Execute apenas em ambiente de desenvolvimento!

-- Criar 10 contatos de teste
INSERT INTO contacts (wa_id, phone_number, display_name, first_name, last_name, created_at)
SELECT 
  '5511' || LPAD((900000000 + i)::text, 9, '0'),
  '+5511' || LPAD((900000000 + i)::text, 9, '0'),
  'Contato Teste ' || i,
  'Nome' || i,
  'Sobrenome' || i,
  NOW() - (i || ' days')::interval
FROM generate_series(1, 10) i
ON CONFLICT DO NOTHING;

-- Criar conversas para os últimos 7 dias
WITH contact_ids AS (
  SELECT id FROM contacts ORDER BY created_at DESC LIMIT 10
)
INSERT INTO conversations (contact_id, status, created_at, updated_at)
SELECT 
  id,
  CASE 
    WHEN random() < 0.3 THEN 'open'
    WHEN random() < 0.6 THEN 'closed'
    ELSE 'pending'
  END,
  NOW() - (floor(random() * 7) || ' days')::interval,
  NOW()
FROM contact_ids;

-- Criar mensagens para as últimas conversas
WITH recent_conversations AS (
  SELECT id FROM conversations ORDER BY created_at DESC LIMIT 20
)
INSERT INTO messages (conversation_id, direction, type, body, created_at, status)
SELECT 
  id,
  CASE 
    WHEN random() < 0.5 THEN 'inbound'
    ELSE 'outbound'
  END,
  CASE 
    WHEN random() < 0.7 THEN 'text'
    WHEN random() < 0.85 THEN 'image'
    WHEN random() < 0.95 THEN 'audio'
    ELSE 'video'
  END,
  'Mensagem de teste ' || floor(random() * 1000),
  NOW() - (floor(random() * 168) || ' hours')::interval, -- Últimas 7 dias em horas
  'delivered'
FROM recent_conversations,
     generate_series(1, 5); -- 5 mensagens por conversa

-- ═══════════════════════════════════════════════════════
-- 🧹 LIMPAR DADOS DE TESTE
-- ═══════════════════════════════════════════════════════

-- ATENÇÃO: Cuidado ao executar em produção!

-- Deletar mensagens de teste
DELETE FROM messages WHERE body LIKE 'Mensagem de teste%';

-- Deletar conversas de teste
DELETE FROM conversations WHERE contact_id IN (
  SELECT id FROM contacts WHERE display_name LIKE 'Contato Teste%'
);

-- Deletar contatos de teste
DELETE FROM contacts WHERE display_name LIKE 'Contato Teste%';

-- ═══════════════════════════════════════════════════════
-- 📊 QUERY COMPLEXA: DASHBOARD COMPLETO
-- ═══════════════════════════════════════════════════════

-- Esta query retorna tudo que o dashboard precisa em uma única chamada
WITH periodo AS (
  SELECT NOW() - INTERVAL '7 days' as inicio
),
metricas AS (
  SELECT 
    COUNT(DISTINCT c.id) as total_conversas,
    COUNT(DISTINCT CASE WHEN c.status = 'open' THEN c.id END) as conversas_abertas,
    COUNT(DISTINCT m.id) as total_mensagens,
    COUNT(DISTINCT CASE WHEN m.direction = 'outbound' THEN m.id END) as mensagens_enviadas,
    COUNT(DISTINCT ct.id) as novos_contatos
  FROM conversations c
  CROSS JOIN periodo p
  LEFT JOIN messages m ON m.conversation_id = c.id AND m.created_at >= p.inicio
  LEFT JOIN contacts ct ON ct.id = c.contact_id AND ct.created_at >= p.inicio
  WHERE c.created_at >= p.inicio
)
SELECT * FROM metricas;

-- ═══════════════════════════════════════════════════════
-- 🔧 VERIFICAR ESTRUTURA DAS TABELAS
-- ═══════════════════════════════════════════════════════

-- Verificar colunas da tabela conversations
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- Verificar colunas da tabela messages
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Verificar colunas da tabela contacts
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- ═══════════════════════════════════════════════════════
-- 🔍 VERIFICAR ÍNDICES (PERFORMANCE)
-- ═══════════════════════════════════════════════════════

-- Ver todos os índices das tabelas principais
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('conversations', 'messages', 'contacts', 'profiles')
ORDER BY tablename, indexname;

-- ═══════════════════════════════════════════════════════
-- 📈 SUGESTÕES DE ÍNDICES PARA PERFORMANCE
-- ═══════════════════════════════════════════════════════

-- Índice para filtrar conversas por data
CREATE INDEX IF NOT EXISTS idx_conversations_created_at 
ON conversations(created_at DESC);

-- Índice para filtrar mensagens por data
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- Índice composto para queries de mensagens por conversa
CREATE INDEX IF NOT EXISTS idx_messages_conversation_direction 
ON messages(conversation_id, direction, created_at);

-- Índice para busca de atendentes
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_user 
ON conversations(assigned_user_id) 
WHERE assigned_user_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════
-- 🎯 FIM DAS QUERIES DE DEBUG
-- ═══════════════════════════════════════════════════════

-- Como usar este arquivo:
-- 1. Copie a query que você precisa
-- 2. Cole no SQL Editor do Supabase
-- 3. Execute e analise os resultados
-- 4. Use os dados para debug do Dashboard
