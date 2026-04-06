-- ============================================
-- Blue Desk CRM - Campos de Temporização de Leads
-- ============================================
-- Adiciona campos para rastrear:
-- 1. Tempo do primeiro contato (primeira mudança de situação)
-- 2. Tempo na situação atual (última mudança de situação)
-- ============================================

-- Adicionar campo para registrar quando houve o primeiro contato
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS primeiro_contato_at TIMESTAMPTZ DEFAULT NULL;

-- Adicionar campo para registrar quando a situação foi alterada pela última vez
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS situacao_alterada_em TIMESTAMPTZ DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN leads.primeiro_contato_at IS 'Data/hora do primeiro contato (primeira mudança de situação após "novo")';
COMMENT ON COLUMN leads.situacao_alterada_em IS 'Data/hora da última alteração de situação';

-- Atualizar leads existentes para definir situacao_alterada_em como created_at
-- (para leads que já existem mas nunca foram movidos)
UPDATE leads 
SET situacao_alterada_em = created_at 
WHERE situacao_alterada_em IS NULL;

-- ============================================
-- Índices para melhorar performance de consultas
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_primeiro_contato_at ON leads(primeiro_contato_at);
CREATE INDEX IF NOT EXISTS idx_leads_situacao_alterada_em ON leads(situacao_alterada_em);

-- ============================================
-- Função para atualizar automaticamente situacao_alterada_em
-- ============================================

CREATE OR REPLACE FUNCTION update_lead_situation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a situação mudou
  IF NEW.situacao IS DISTINCT FROM OLD.situacao THEN
    -- Atualizar o timestamp da última alteração
    NEW.situacao_alterada_em = NOW();
    
    -- Se é a primeira mudança de situação (saindo de 'novo')
    IF OLD.situacao = 'novo' AND NEW.situacao != 'novo' AND OLD.primeiro_contato_at IS NULL THEN
      NEW.primeiro_contato_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar automaticamente os timestamps
DROP TRIGGER IF EXISTS trigger_update_lead_situation_timestamp ON leads;

CREATE TRIGGER trigger_update_lead_situation_timestamp
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_situation_timestamp();

-- ============================================
-- View para facilitar consultas com tempos calculados
-- ============================================

CREATE OR REPLACE VIEW leads_with_timing AS
SELECT 
  l.*,
  -- Tempo desde a criação até o primeiro contato (em horas)
  CASE 
    WHEN l.primeiro_contato_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (l.primeiro_contato_at - l.created_at)) / 3600
    ELSE NULL
  END AS tempo_ate_primeiro_contato_horas,
  
  -- Tempo na situação atual (em horas)
  CASE 
    WHEN l.situacao_alterada_em IS NOT NULL THEN
      EXTRACT(EPOCH FROM (NOW() - l.situacao_alterada_em)) / 3600
    ELSE
      EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 3600
  END AS tempo_situacao_atual_horas,
  
  -- Tempo desde a criação (em horas)
  EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 3600 AS tempo_desde_criacao_horas
FROM leads l;

COMMENT ON VIEW leads_with_timing IS 'View com cálculos de temporização dos leads';

-- ============================================
-- Verificação
-- ============================================

-- Mostrar estrutura atualizada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND column_name IN ('primeiro_contato_at', 'situacao_alterada_em', 'created_at', 'situacao')
ORDER BY ordinal_position;
