-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  TABELA DE HISTÓRICO DE ALTERAÇÕES DE LEADS                  ║
-- ║  Blue Desk - Sistema de Atendimento WhatsApp                 ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Tabela de histórico de alterações de leads
CREATE TABLE IF NOT EXISTS lead_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lead_history_lead_id ON lead_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_history_user_id ON lead_history(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_history_changed_at ON lead_history(changed_at DESC);

-- RLS (Row Level Security)
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler o histórico
CREATE POLICY "Permitir leitura do histórico de leads"
  ON lead_history FOR SELECT
  USING (true);

-- Política: Usuários autenticados podem inserir no histórico
CREATE POLICY "Permitir inserção no histórico de leads"
  ON lead_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Comentários
COMMENT ON TABLE lead_history IS 'Histórico de alterações dos leads';
COMMENT ON COLUMN lead_history.field_changed IS 'Nome do campo que foi alterado (ex: situacao, assigned_user_id)';
COMMENT ON COLUMN lead_history.old_value IS 'Valor anterior do campo';
COMMENT ON COLUMN lead_history.new_value IS 'Novo valor do campo';
COMMENT ON COLUMN lead_history.changed_at IS 'Data e hora da alteração';

-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SUCESSO!                                                     ║
-- ║  Tabela lead_history criada com sucesso.                     ║
-- ║                                                               ║
-- ║  Execute este SQL no Supabase SQL Editor:                    ║
-- ║  https://supabase.com/dashboard/project/YOUR_PROJECT/editor  ║
-- ╚═══════════════════════════════════════════════════════════════╝
