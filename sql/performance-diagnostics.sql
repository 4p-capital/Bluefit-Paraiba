-- ═══════════════════════════════════════════════════════════════════════
-- 🔍 QUERIES DE DIAGNÓSTICO DE PERFORMANCE - BLUE DESK
-- ═══════════════════════════════════════════════════════════════════════
-- Use estas queries para investigar problemas de performance
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- 1️⃣ VOLUME DE DADOS - Entender a escala do sistema
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  'conversations' as tabela, 
  COUNT(*) as total_registros,
  pg_size_pretty(pg_total_relation_size('conversations')) as tamanho_total
FROM conversations
UNION ALL
SELECT 
  'messages', 
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('messages'))
FROM messages
UNION ALL
SELECT 
  'contacts', 
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('contacts'))
FROM contacts
UNION ALL
SELECT 
  'leads', 
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('leads'))
FROM leads
UNION ALL
SELECT 
  'conversation_tags', 
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('conversation_tags'))
FROM conversation_tags
UNION ALL
SELECT 
  'profiles', 
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('profiles'))
FROM profiles
ORDER BY total_registros DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- 2️⃣ VERIFICAR ÍNDICES CRIADOS
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as tamanho_indice
FROM pg_indexes
JOIN pg_stat_user_indexes USING (schemaname, tablename, indexname)
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ═══════════════════════════════════════════════════════════════════════
-- 3️⃣ USO DOS ÍNDICES (execute após 1-2 dias de uso)
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as vezes_usado,
  idx_tup_read as tuplas_lidas,
  idx_tup_fetch as tuplas_retornadas,
  pg_size_pretty(pg_relation_size(indexrelid)) as tamanho
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- 4️⃣ ÍNDICES NÃO UTILIZADOS (candidatos a remoção)
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as tamanho,
  'DROP INDEX IF EXISTS ' || indexname || ';' as comando_para_remover
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND idx_scan = 0  -- Nunca foi usado
ORDER BY pg_relation_size(indexrelid) DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- 5️⃣ TAMANHO TOTAL DOS ÍNDICES POR TABELA
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  tablename,
  COUNT(*) as total_indices,
  pg_size_pretty(SUM(pg_relation_size(indexrelid))) as tamanho_total_indices,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as tamanho_tabela
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
GROUP BY tablename
ORDER BY SUM(pg_relation_size(indexrelid)) DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- 6️⃣ QUERIES MAIS LENTAS (requer pg_stat_statements ativo)
-- ═══════════════════════════════════════════════════════════════════════

-- Verificar se pg_stat_statements está ativo
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ pg_stat_statements está ativo'
    ELSE '❌ pg_stat_statements NÃO está ativo - habilite no Dashboard'
  END as status
FROM pg_extension
WHERE extname = 'pg_stat_statements';

-- Queries mais lentas (TOP 10)
SELECT 
  substring(query, 1, 100) as query_resumida,
  calls as vezes_executada,
  round(total_exec_time::numeric, 2) as tempo_total_ms,
  round(mean_exec_time::numeric, 2) as tempo_medio_ms,
  round(max_exec_time::numeric, 2) as tempo_maximo_ms,
  round((total_exec_time / sum(total_exec_time) OVER ()) * 100, 2) as pct_tempo_total
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_indexes%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- ═══════════════════════════════════════════════════════════════════════
-- 7️⃣ CACHE HIT RATIO - Quanto está em memória vs disco
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  heap_blks_read as blocos_lidos_disco,
  heap_blks_hit as blocos_lidos_cache,
  CASE 
    WHEN heap_blks_read + heap_blks_hit = 0 THEN 0
    ELSE round((heap_blks_hit::numeric / (heap_blks_read + heap_blks_hit)) * 100, 2)
  END as cache_hit_ratio_pct
FROM pg_statio_user_tables
WHERE schemaname = 'public'
  AND (heap_blks_read + heap_blks_hit) > 0
ORDER BY cache_hit_ratio_pct ASC;

-- ✅ Cache Hit Ratio > 90% = BOM
-- ⚠️ Cache Hit Ratio < 80% = Considere aumentar shared_buffers

-- ═══════════════════════════════════════════════════════════════════════
-- 8️⃣ TABELAS QUE PRECISAM DE VACUUM/ANALYZE
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  n_tup_ins as insercoes,
  n_tup_upd as atualizacoes,
  n_tup_del as delecoes,
  n_dead_tup as tuplas_mortas,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  CASE 
    WHEN n_dead_tup > 1000 THEN '⚠️ EXECUTE VACUUM'
    ELSE '✅ OK'
  END as recomendacao
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- 9️⃣ BLOAT - Espaço desperdiçado em tabelas e índices
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho_total,
  round(100 * pg_total_relation_size(schemaname||'.'||tablename)::numeric / 
    NULLIF(pg_database_size(current_database()), 0), 2) as pct_do_banco
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- ═══════════════════════════════════════════════════════════════════════
-- 🔟 DISTRIBUIÇÃO DE DADOS POR PERÍODO (últimos 90 dias)
-- ═══════════════════════════════════════════════════════════════════════

-- Conversas por dia (últimos 30 dias)
SELECT 
  DATE(created_at) as dia,
  COUNT(*) as total_conversas,
  COUNT(DISTINCT contact_id) as contatos_unicos,
  COUNT(*) FILTER (WHERE status = 'open') as abertas,
  COUNT(*) FILTER (WHERE status = 'closed') as fechadas
FROM conversations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY dia DESC;

-- Mensagens por dia (últimos 30 dias)
SELECT 
  DATE(created_at) as dia,
  COUNT(*) as total_mensagens,
  COUNT(*) FILTER (WHERE direction = 'inbound') as recebidas,
  COUNT(*) FILTER (WHERE direction = 'outbound') as enviadas,
  COUNT(DISTINCT conversation_id) as conversas_ativas
FROM messages
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY dia DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- 🔟➕1️⃣ CONVERSAS COM MAIS MENSAGENS (possíveis gargalos)
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  c.id as conversation_id,
  ct.display_name as contato,
  ct.phone_number,
  COUNT(m.id) as total_mensagens,
  MAX(m.created_at) as ultima_mensagem,
  c.status
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id, ct.display_name, ct.phone_number, c.status
ORDER BY COUNT(m.id) DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════════════════
-- 🔟➕2️⃣ CONTATOS COM MÚLTIPLAS CONVERSAS (duplicatas?)
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  ct.id as contact_id,
  ct.display_name,
  ct.phone_number,
  ct.wa_id,
  COUNT(c.id) as total_conversas,
  ARRAY_AGG(c.id ORDER BY c.created_at DESC) as conversation_ids
FROM contacts ct
LEFT JOIN conversations c ON c.contact_id = ct.id
GROUP BY ct.id, ct.display_name, ct.phone_number, ct.wa_id
HAVING COUNT(c.id) > 1
ORDER BY COUNT(c.id) DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════════════════
-- 🔟➕3️⃣ ANÁLISE DE PERFORMANCE DE QUERIES (EXPLAIN ANALYZE)
-- ═══════════════════════════════════════════════════════════════════════

-- Exemplo: Analisar performance da query de conversas com tags
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT 
  c.*,
  ct.display_name,
  ARRAY_AGG(t.name) FILTER (WHERE t.id IS NOT NULL) as tag_names
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
LEFT JOIN conversation_tags ctags ON c.id = ctags.conversation_id
LEFT JOIN tags t ON ctags.tag_id = t.id
WHERE c.created_at >= NOW() - INTERVAL '7 days'
GROUP BY c.id, ct.display_name
ORDER BY c.last_message_at DESC NULLS LAST
LIMIT 100;

-- ℹ️ Como ler o EXPLAIN ANALYZE:
-- - Procure por "Seq Scan" → Indica full table scan (RUIM se tabela grande)
-- - Procure por "Index Scan" ou "Index Only Scan" → Bom sinal
-- - "cost=" → Estimativa (menor = melhor)
-- - "rows=" → Quantidade de linhas processadas
-- - "actual time=" → Tempo real de execução (IMPORTANTE)
-- - "Buffers: shared hit=" → Dados lidos do cache (BOM)
-- - "Buffers: shared read=" → Dados lidos do disco (RUIM se muito alto)

-- ═══════════════════════════════════════════════════════════════════════
-- 🔟➕4️⃣ LIMPEZA MANUAL (se necessário)
-- ═══════════════════════════════════════════════════════════════════════

-- Atualizar estatísticas do PostgreSQL (execute após criar índices)
ANALYZE conversations;
ANALYZE messages;
ANALYZE contacts;
ANALYZE leads;
ANALYZE conversation_tags;
ANALYZE profiles;
ANALYZE templates;

-- Vacuum para recuperar espaço
VACUUM ANALYZE conversations;
VACUUM ANALYZE messages;
VACUUM ANALYZE contacts;
VACUUM ANALYZE leads;

-- ═══════════════════════════════════════════════════════════════════════
-- 📋 CHECKLIST DE DIAGNÓSTICO
-- ═══════════════════════════════════════════════════════════════════════
-- 
-- EXECUTE ESTAS QUERIES NA ORDEM:
-- 
-- [ ] 1. Volume de Dados - Entender escala
-- [ ] 2. Verificar Índices - Confirmar que foram criados
-- [ ] 3. Uso dos Índices - Ver quais estão sendo usados
-- [ ] 4. Índices Não Utilizados - Remover se houver
-- [ ] 5. Cache Hit Ratio - Verificar eficiência da memória
-- [ ] 6. Queries Lentas - Identificar gargalos
-- [ ] 7. VACUUM/ANALYZE - Executar se necessário
-- [ ] 8. Distribuição de Dados - Entender padrão de uso
-- 
-- ✅ Se todos os itens estão OK, o sistema está otimizado!
-- 
-- ═══════════════════════════════════════════════════════════════════════
