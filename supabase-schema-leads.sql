-- ========================================
-- TABELA DE LEADS - CRM (VERSÃO SIMPLIFICADA)
-- ========================================
-- Execute este script primeiro para criar a tabela básica

-- Criar tabela de leads SEM foreign keys (para evitar erros de relacionamento)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'novo' 
    CHECK (status IN ('novo', 'contato_feito', 'visita_agendada', 'visita_realizada', 'visita_cancelada', 'matriculado', 'perdido')),
  origem TEXT,
  interesse TEXT,
  observacoes TEXT,
  unit_id UUID,
  assigned_user_id UUID,
  data_contato TIMESTAMP WITH TIME ZONE,
  data_visita TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_user_id ON public.leads(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_unit_id ON public.leads(unit_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON public.leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON public.leads;

CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- RLS (Row Level Security) Policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar leads" ON public.leads;
DROP POLICY IF EXISTS "Usuários autenticados podem criar leads" ON public.leads;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar leads" ON public.leads;
DROP POLICY IF EXISTS "Apenas admins podem deletar leads" ON public.leads;

-- Policy: Todos os usuários autenticados podem visualizar leads
CREATE POLICY "Usuários autenticados podem visualizar leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Todos os usuários autenticados podem criar leads
CREATE POLICY "Usuários autenticados podem criar leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Todos os usuários autenticados podem atualizar leads
CREATE POLICY "Usuários autenticados podem atualizar leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Apenas admins podem deletar leads
CREATE POLICY "Apenas admins podem deletar leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- ADICIONAR FOREIGN KEYS (OPCIONAL)
-- ========================================
-- Descomente as linhas abaixo SE as tabelas units e profiles existirem:

/*
-- Adicionar FK para units
ALTER TABLE public.leads 
  ADD CONSTRAINT fk_leads_unit_id 
  FOREIGN KEY (unit_id) 
  REFERENCES public.units(id) 
  ON DELETE SET NULL;

-- Adicionar FK para profiles
ALTER TABLE public.leads 
  ADD CONSTRAINT fk_leads_assigned_user_id 
  FOREIGN KEY (assigned_user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;
*/

-- ========================================
-- MENSAGEM DE SUCESSO
-- ========================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Tabela leads criada com sucesso!';
  RAISE NOTICE '📊 Agora você pode executar o arquivo supabase-leads-sample-data.sql para adicionar dados de exemplo.';
END $$;

COMMENT ON TABLE public.leads IS 'Tabela de leads do CRM para controle do funil de vendas';
COMMENT ON COLUMN public.leads.status IS 'Status do lead no funil: novo, contato_feito, visita_agendada, visita_realizada, visita_cancelada, matriculado, perdido';
COMMENT ON COLUMN public.leads.origem IS 'Origem do lead (ex: Instagram, Google, Indicação)';
COMMENT ON COLUMN public.leads.interesse IS 'Interesse do lead (ex: Musculação, Natação, Yoga)';
