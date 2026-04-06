-- ========================================
-- SCRIPT DE SETUP SIMPLIFICADO
-- Sistema de Atendimento WhatsApp
-- ========================================

-- PASSO 1: Execute primeiro o script database-fix-columns.sql
-- PASSO 2: Execute este script

-- ========================================
-- 1. CRIAR TABELAS PRINCIPAIS
-- ========================================

-- Tabela de Contatos
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Conversas
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  unit_id UUID REFERENCES units(id),
  status TEXT CHECK (status IN ('open', 'pending', 'waiting_customer', 'closed')),
  assigned_user_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  type TEXT CHECK (type IN ('text', 'template', 'image', 'document', 'audio', 'video')),
  body TEXT,
  media_url TEXT,
  provider_message_id TEXT UNIQUE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Eventos de Status de Mensagens
CREATE TABLE IF NOT EXISTS message_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id),
  status TEXT CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Membros de Unidades
CREATE TABLE IF NOT EXISTS unit_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Atribuições de Conversas
CREATE TABLE IF NOT EXISTS conversation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  unassigned_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Eventos de Conversas
CREATE TABLE IF NOT EXISTS conversation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  event_type TEXT CHECK (event_type IN ('created', 'assigned', 'status_changed', 'note_added', 'tagged', 'untagged')),
  user_id UUID REFERENCES profiles(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tags de Contatos
CREATE TABLE IF NOT EXISTS contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  tag_id UUID REFERENCES tags(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, tag_id)
);

-- Tabela de Tags de Conversas
CREATE TABLE IF NOT EXISTS conversation_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  tag_id UUID REFERENCES tags(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, tag_id)
);

-- ========================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_unit_id ON conversations(unit_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_user_id ON conversations(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
CREATE INDEX IF NOT EXISTS idx_messages_provider_message_id ON messages(provider_message_id);

CREATE INDEX IF NOT EXISTS idx_conversation_tags_conversation_id ON conversation_tags(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_tags_tag_id ON conversation_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag_id ON contact_tags(tag_id);

-- ========================================
-- 3. INSERIR DADOS DE EXEMPLO
-- ========================================

-- Inserir Unidades (apenas se ainda não existirem)
INSERT INTO units (id, name)
SELECT '550e8400-e29b-41d4-a716-446655440001', 'Comercial'
WHERE NOT EXISTS (SELECT 1 FROM units WHERE id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO units (id, name)
SELECT '550e8400-e29b-41d4-a716-446655440002', 'Suporte'
WHERE NOT EXISTS (SELECT 1 FROM units WHERE id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO units (id, name)
SELECT '550e8400-e29b-41d4-a716-446655440003', 'Financeiro'
WHERE NOT EXISTS (SELECT 1 FROM units WHERE id = '550e8400-e29b-41d4-a716-446655440003');

-- Atualizar descrições se a coluna existir
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'description'
  ) THEN
    UPDATE units SET description = 'Equipe de vendas e prospecção' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
    UPDATE units SET description = 'Atendimento e suporte técnico' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
    UPDATE units SET description = 'Cobranças e pagamentos' WHERE id = '550e8400-e29b-41d4-a716-446655440003';
  END IF;
END $$;

-- Inserir Perfis (verificando estrutura existente)
INSERT INTO profiles (id, email, full_name, role)
SELECT '650e8400-e29b-41d4-a716-446655440001', 'joao.silva@empresa.com', 'João Silva', 'atendente'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = '650e8400-e29b-41d4-a716-446655440001');

INSERT INTO profiles (id, email, full_name, role)
SELECT '650e8400-e29b-41d4-a716-446655440002', 'maria.santos@empresa.com', 'Maria Santos', 'atendente'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = '650e8400-e29b-41d4-a716-446655440002');

INSERT INTO profiles (id, email, full_name, role)
SELECT '650e8400-e29b-41d4-a716-446655440003', 'carlos.souza@empresa.com', 'Carlos Souza', 'gestor'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = '650e8400-e29b-41d4-a716-446655440003');

-- Inserir Tags
INSERT INTO tags (id, name, color) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Urgente', '#ef4444'),
  ('750e8400-e29b-41d4-a716-446655440002', 'VIP', '#8b5cf6'),
  ('750e8400-e29b-41d4-a716-446655440003', 'Novo Cliente', '#3b82f6'),
  ('750e8400-e29b-41d4-a716-446655440004', 'Reclamação', '#f59e0b'),
  ('750e8400-e29b-41d4-a716-446655440005', 'Dúvida', '#10b981')
ON CONFLICT (id) DO NOTHING;

-- Inserir Contatos
INSERT INTO contacts (id, phone_number, display_name) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', '+5511999999001', 'Ana Paula Silva'),
  ('850e8400-e29b-41d4-a716-446655440002', '+5511999999002', 'Bruno Costa'),
  ('850e8400-e29b-41d4-a716-446655440003', '+5511999999003', 'Carla Mendes'),
  ('850e8400-e29b-41d4-a716-446655440004', '+5511999999004', 'Diego Alves'),
  ('850e8400-e29b-41d4-a716-446655440005', '+5511999999005', 'Eduarda Lima')
ON CONFLICT (id) DO NOTHING;

-- Inserir Conversas
INSERT INTO conversations (id, contact_id, unit_id, status, assigned_user_id, assigned_at, last_message_preview, last_message_at) VALUES
  (
    '950e8400-e29b-41d4-a716-446655440001',
    '850e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'open',
    '650e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '2 hours',
    'Olá! Gostaria de saber mais sobre os produtos.',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'waiting_customer',
    '650e8400-e29b-41d4-a716-446655440002',
    NOW() - INTERVAL '3 hours',
    'Perfeito! Obrigado pela ajuda. Vou verificar aqui.',
    NOW() - INTERVAL '1 hour'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440003',
    '850e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'pending',
    NULL,
    NULL,
    'Preciso resolver uma pendência de pagamento urgente!',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440004',
    '850e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'open',
    '650e8400-e29b-41d4-a716-446655440003',
    NOW() - INTERVAL '1 day',
    'Sou cliente VIP e gostaria de um atendimento especial.',
    NOW() - INTERVAL '4 hours'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440005',
    '850e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'closed',
    '650e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '2 days',
    'Tudo resolvido! Muito obrigada!',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir Mensagens para as conversas
INSERT INTO messages (id, conversation_id, direction, type, body, sent_at, status, provider_message_id) VALUES
  -- Conversa 1 (Ana Paula)
  (
    'a50e8400-e29b-41d4-a716-446655440001',
    '950e8400-e29b-41d4-a716-446655440001',
    'inbound',
    'text',
    'Olá! Gostaria de saber mais sobre os produtos.',
    NOW() - INTERVAL '35 minutes',
    'delivered',
    'wamid_001'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440002',
    '950e8400-e29b-41d4-a716-446655440001',
    'outbound',
    'text',
    'Olá Ana! Claro, será um prazer ajudá-la. Temos diversos produtos disponíveis. Qual categoria te interessa?',
    NOW() - INTERVAL '34 minutes',
    'read',
    'wamid_002'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440003',
    '950e8400-e29b-41d4-a716-446655440001',
    'inbound',
    'text',
    'Estou procurando soluções para automação de atendimento.',
    NOW() - INTERVAL '30 minutes',
    'delivered',
    'wamid_003'
  ),
  
  -- Conversa 2 (Bruno)
  (
    'a50e8400-e29b-41d4-a716-446655440011',
    '950e8400-e29b-41d4-a716-446655440002',
    'inbound',
    'text',
    'Olá, estou com um problema no sistema.',
    NOW() - INTERVAL '2 hours',
    'delivered',
    'wamid_011'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440012',
    '950e8400-e29b-41d4-a716-446655440002',
    'outbound',
    'text',
    'Olá Bruno! Pode me descrever qual é o problema que está enfrentando?',
    NOW() - INTERVAL '1 hour 59 minutes',
    'read',
    'wamid_012'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440013',
    '950e8400-e29b-41d4-a716-446655440002',
    'inbound',
    'text',
    'O sistema não está carregando os relatórios.',
    NOW() - INTERVAL '1 hour 58 minutes',
    'delivered',
    'wamid_013'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440014',
    '950e8400-e29b-41d4-a716-446655440002',
    'outbound',
    'text',
    'Entendo. Vou verificar isso para você. Pode me informar qual relatório especificamente?',
    NOW() - INTERVAL '1 hour 50 minutes',
    'read',
    'wamid_014'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440015',
    '950e8400-e29b-41d4-a716-446655440002',
    'inbound',
    'text',
    'Perfeito! Obrigado pela ajuda. Vou verificar aqui.',
    NOW() - INTERVAL '1 hour',
    'delivered',
    'wamid_015'
  ),
  
  -- Conversa 3 (Carla)
  (
    'a50e8400-e29b-41d4-a716-446655440021',
    '950e8400-e29b-41d4-a716-446655440003',
    'inbound',
    'text',
    'Preciso resolver uma pendência de pagamento urgente!',
    NOW() - INTERVAL '2 hours',
    'delivered',
    'wamid_021'
  )
ON CONFLICT (provider_message_id) DO NOTHING;

-- Inserir Tags nas Conversas
INSERT INTO conversation_tags (conversation_id, tag_id) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003'), -- Ana Paula: Novo Cliente
  ('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440005'), -- Ana Paula: Dúvida
  ('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001'), -- Carla: Urgente
  ('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440004'), -- Carla: Reclamação
  ('950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002')  -- Diego: VIP
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. HABILITAR RLS (Row Level Security)
-- ========================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON contacts;

-- Criar políticas básicas (permitir tudo para usuários autenticados)
CREATE POLICY "Enable read access for all authenticated users" ON conversations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON conversations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON conversations
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON messages
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for all authenticated users" ON contacts
  FOR SELECT TO authenticated USING (true);

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- Verificar dados inseridos
SELECT 'Unidades:' as tabela, COUNT(*) as total FROM units
UNION ALL
SELECT 'Perfis:', COUNT(*) FROM profiles
UNION ALL
SELECT 'Tags:', COUNT(*) FROM tags
UNION ALL
SELECT 'Contatos:', COUNT(*) FROM contacts
UNION ALL
SELECT 'Conversas:', COUNT(*) FROM conversations
UNION ALL
SELECT 'Mensagens:', COUNT(*) FROM messages;
