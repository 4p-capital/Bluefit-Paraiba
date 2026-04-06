# 🚀 Guia de Otimização de Performance - Blue Desk

## 📊 Contexto

Este guia implementa **otimizações críticas** para resolver problemas de lentidão e travamentos com alto volume de dados (conversas, mensagens, contatos e leads).

## ✅ O Que Foi Otimizado (FASE 1)

### 1️⃣ **Índices no Banco de Dados**
- ✅ Criados **30+ índices otimizados** nas tabelas principais
- ✅ Índices compostos para queries complexas (status + data, conversation_id + sent_at, etc.)
- ✅ Índices parciais para filtros específicos (WHERE direction = 'outbound', WHERE active = true)
- **Ganho esperado:** 5-10x mais rápido em queries de leitura

### 2️⃣ **ConversationList.tsx - Eliminado N+1 Query**
- ❌ **ANTES:** 100 conversas = 100 queries individuais para buscar tags
- ✅ **AGORA:** 1 query batch única usando `.in()`
- **Ganho esperado:** Carregamento 50-100x mais rápido

### 3️⃣ **CRMView.tsx - Batch Query de Mensagens**
- ❌ **ANTES:** 50 leads = 50 queries individuais para última mensagem
- ✅ **AGORA:** 1 query batch para todas as conversas
- **Ganho esperado:** Carregamento 30-50x mais rápido

### 4️⃣ **ChatView.tsx - Redução de Polling**
- ❌ **ANTES:** Polling a cada 8 segundos = 450 queries/hora
- ✅ **AGORA:** Polling a cada 30 segundos = 120 queries/hora
- **Ganho esperado:** 75% menos queries (Realtime já cobre maioria dos casos)

### 5️⃣ **DashboardModule.tsx - Limits de Proteção**
- ❌ **ANTES:** Carregava TODOS os registros sem limit
- ✅ **AGORA:** Limits inteligentes (2000 conversas, 5000 mensagens, etc.)
- **Ganho esperado:** Dashboard carrega em segundos mesmo com milhares de registros

---

## 📝 INSTRUÇÕES DE EXECUÇÃO

### **PASSO 1: Criar Índices no Banco de Dados** ⏱️ 2-3 minutos

1. Abra o **Supabase Dashboard** → **SQL Editor**
2. Copie TODO o conteúdo do arquivo `/sql/performance-indexes.sql`
3. Cole no editor SQL
4. Clique em **RUN** (Execute)
5. Aguarde a mensagem de sucesso (pode levar 30-60 segundos)

**Verificação:**
Execute esta query para confirmar que os índices foram criados:
```sql
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Você deve ver ~30 índices começando com `idx_`.

---

### **PASSO 2: Testar a Aplicação** ⏱️ 5 minutos

1. **Recarregue a aplicação** (Ctrl+R / Cmd+R)
2. Navegue para **Conversas** → Deve carregar MUITO mais rápido
3. Abra um **Chat** → Mensagens devem aparecer instantaneamente
4. Acesse o **CRM** → Kanban deve renderizar sem travamentos
5. Veja o **Dashboard** → Gráficos devem carregar em 2-3 segundos

**Antes vs Depois (Estimativa):**
| Tela | Antes | Depois | Melhoria |
|------|-------|--------|----------|
| Lista de Conversas | 10-15s | 1-2s | **5-10x** |
| CRM Kanban | 20-30s | 2-3s | **10x** |
| Dashboard | 15-20s | 3-4s | **5x** |
| Chat (mensagens) | 3-5s | <1s | **5x** |

---

## 🔍 MONITORAMENTO PÓS-OTIMIZAÇÃO

### **Após 1-2 dias de uso, execute estas queries para análise:**

#### 1. **Verificar Uso dos Índices**
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as vezes_usado,
  idx_tup_read as linhas_lidas
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

**O que observar:**
- Índices com `vezes_usado` > 0 estão sendo utilizados ✅
- Índices com `vezes_usado` = 0 podem ser removidos (raridade)

#### 2. **Verificar Tamanho dos Índices**
```sql
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as tamanho
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**O que observar:**
- Tamanho total dos índices deve ser ~20-30% do tamanho das tabelas
- Se um índice estiver muito grande (>100MB) e pouco usado, considere removê-lo

#### 3. **Verificar Queries Lentas**
```sql
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%conversations%' OR query LIKE '%messages%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**O que observar:**
- `mean_exec_time` deve estar abaixo de 100ms para queries comuns
- Se houver queries >500ms, investigar com `EXPLAIN ANALYZE`

---

## 📈 FASE 2 - OTIMIZAÇÕES FUTURAS (Opcional)

Se ainda houver lentidão após a Fase 1, implemente estas melhorias:

### **Opção A: Endpoint Otimizado no Servidor**
Criar um endpoint `/api/conversations/optimized` que retorna conversas + tags + contatos em uma única query com JOINs.

**Benefício:** Elimina múltiplas roundtrips entre cliente e servidor.

### **Opção B: Materialized Views**
Criar views materializadas para o Dashboard com agregações pré-calculadas.

**Benefício:** Dashboard carrega instantaneamente sem processar milhares de registros.

### **Opção C: Cache com Redis/KV**
Implementar cache para queries frequentes (lista de conversas, tags, atendentes).

**Benefício:** Reduz carga no banco em 70-80%.

### **Opção D: Paginação na ConversationList**
Implementar scroll infinito ou paginação para carregar apenas 50 conversas iniciais.

**Benefício:** Carregamento inicial instantâneo mesmo com milhares de conversas.

---

## ⚠️ TROUBLESHOOTING

### **Problema: "Índices não foram criados"**
**Solução:**
1. Verifique se você tem permissões de admin no Supabase
2. Execute o SQL em partes menores (copie 10 índices por vez)
3. Se algum índice já existir, ignore o erro (IF NOT EXISTS garante segurança)

### **Problema: "Aplicação ainda está lenta"**
**Solução:**
1. Verifique se os índices foram realmente criados (query de verificação acima)
2. Execute `ANALYZE` nas tabelas principais:
   ```sql
   ANALYZE conversations;
   ANALYZE messages;
   ANALYZE contacts;
   ANALYZE leads;
   ```
3. Verifique o console do navegador (F12) → Aba Network → Procure por requests lentos
4. Se houver muitos dados (>10k conversas), considere implementar Fase 2

### **Problema: "Banco de dados cresceu muito"**
**Solução:**
Índices ocupam espaço, mas o ganho em performance compensa. Para liberar espaço:
```sql
-- Remover índices não utilizados (execute APÓS monitoramento de 7 dias)
DROP INDEX IF EXISTS idx_nome_do_indice_nao_usado;

-- Vacuum para recuperar espaço
VACUUM ANALYZE;
```

---

## 📊 MÉTRICAS DE SUCESSO

Após implementar as otimizações, você deve observar:

✅ **Performance:**
- Lista de conversas carrega em <2 segundos
- Dashboard carrega em <5 segundos
- Chat abre instantaneamente (<1s)
- CRM Kanban renderiza sem travamentos

✅ **Banco de Dados:**
- Queries de conversas: <100ms
- Queries de mensagens: <50ms
- Uso de CPU do banco: <30%

✅ **Experiência do Usuário:**
- Sem travamentos ao navegar
- Scroll suave em listas longas
- Realtime funcionando sem delays
- Dashboard responsivo

---

## 📞 SUPORTE

Se após executar TODAS as etapas ainda houver lentidão:

1. **Capture logs:**
   - Console do navegador (F12 → Console)
   - Network tab (requests lentos)
   - Supabase Dashboard → Database → Logs

2. **Informações importantes:**
   - Quantos registros você tem? (conversas, mensagens, contatos, leads)
   - Qual tela está mais lenta?
   - O problema ocorre em horários específicos?

3. **Próximos passos:**
   - Implemente otimizações da Fase 2
   - Considere upgrade de plano do Supabase (se estiver no Free tier)
   - Analise queries lentas com `pg_stat_statements`

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Executei o script SQL `/sql/performance-indexes.sql` no Supabase
- [ ] Verifiquei que ~30 índices foram criados com sucesso
- [ ] Executei `ANALYZE` nas tabelas principais
- [ ] Recarreguei a aplicação e testei todas as telas
- [ ] Performance melhorou significativamente (5-10x mais rápido)
- [ ] Configurei monitoramento para verificar uso dos índices após 1-2 dias
- [ ] Sistema está estável e sem travamentos

---

**Versão:** 1.0  
**Data:** 17/03/2026  
**Impacto Esperado:** 70-80% de melhoria em performance geral
