-- ========================================
-- ATUALIZAR TODOS OS LEADS PARA STATUS "NOVO"
-- ========================================
-- Este script atualiza todos os leads existentes para o status "novo"
-- e define a data de criação como hoje

-- Atualizar todos os leads para status "novo" com data de hoje
UPDATE public.leads 
SET 
  status = 'novo',
  created_at = TIMEZONE('utc', NOW()),
  updated_at = TIMEZONE('utc', NOW())
WHERE 
  id IS NOT NULL;

-- ========================================
-- VERIFICAR RESULTADOS
-- ========================================
-- Contar quantos leads foram atualizados
SELECT 
  COUNT(*) as total_leads_atualizados,
  'Todos os leads foram definidos como NOVO' as mensagem
FROM public.leads 
WHERE status = 'novo';

-- Mostrar todos os leads atualizados
SELECT 
  id,
  nome,
  telefone,
  status,
  created_at,
  updated_at
FROM public.leads
ORDER BY created_at DESC;

-- ========================================
-- MENSAGEM DE SUCESSO
-- ========================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Todos os leads foram atualizados para status NOVO!';
  RAISE NOTICE '📅 Data de criação definida como hoje: %', NOW();
END $$;
