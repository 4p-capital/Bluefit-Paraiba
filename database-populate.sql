-- ========================================
-- SCRIPT PARA POPULAR TABELAS COM DADOS DE EXEMPLO
-- Sistema de Atendimento WhatsApp
-- ========================================

-- IMPORTANTE: Este script apenas INSERE dados de exemplo
-- As tabelas já devem existir no banco

-- ========================================
-- 1. LIMPAR DADOS EXISTENTES (OPCIONAL)
-- ========================================
-- Descomente as linhas abaixo se quiser LIMPAR os dados antes de popular

-- TRUNCATE TABLE conversation_tags CASCADE;
-- TRUNCATE TABLE contact_tags CASCADE;
-- TRUNCATE TABLE message_status_events CASCADE;
-- TRUNCATE TABLE messages CASCADE;
-- TRUNCATE TABLE conversation_events CASCADE;
-- TRUNCATE TABLE conversation_assignments CASCADE;
-- TRUNCATE TABLE unit_memberships CASCADE;
-- TRUNCATE TABLE conversations CASCADE;
-- TRUNCATE TABLE contacts CASCADE;
-- TRUNCATE TABLE tags CASCADE;
-- TRUNCATE TABLE profiles CASCADE;
-- TRUNCATE TABLE units CASCADE;

-- ========================================
-- 2. INSERIR DADOS DE EXEMPLO
-- ========================================

-- Inserir Unidades
INSERT INTO units (id, name, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Comercial', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Suporte', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Financeiro', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Atualizar description se a coluna existir
UPDATE units SET updated_at = NOW() WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003'
);

-- Inserir Perfis de Atendentes
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'joao.silva@empresa.com', 'João Silva', 'atendente', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440002', 'maria.santos@empresa.com', 'Maria Santos', 'atendente', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440003', 'carlos.souza@empresa.com', 'Carlos Souza', 'gestor', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir Tags
INSERT INTO tags (id, name, color, created_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Urgente', '#ef4444', NOW()),
  ('750e8400-e29b-41d4-a716-446655440002', 'VIP', '#8b5cf6', NOW()),
  ('750e8400-e29b-41d4-a716-446655440003', 'Novo Cliente', '#3b82f6', NOW()),
  ('750e8400-e29b-41d4-a716-446655440004', 'Reclamação', '#f59e0b', NOW()),
  ('750e8400-e29b-41d4-a716-446655440005', 'Dúvida', '#10b981', NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir Contatos
INSERT INTO contacts (id, phone_number, display_name, created_at, updated_at) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', '+5511999999001', 'Ana Paula Silva', NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440002', '+5511999999002', 'Bruno Costa', NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440003', '+5511999999003', 'Carla Mendes', NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440004', '+5511999999004', 'Diego Alves', NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440005', '+5511999999005', 'Eduarda Lima', NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440006', '+5511999999006', 'Fernando Santos', NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440007', '+5511999999007', 'Gabriela Rocha', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir Conversas
INSERT INTO conversations (id, contact_id, unit_id, status, assigned_user_id, assigned_at, last_message_preview, last_message_at, created_at, updated_at) VALUES
  (
    '950e8400-e29b-41d4-a716-446655440001',
    '850e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'open',
    '650e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '2 hours',
    'Olá! Gostaria de saber mais sobre os produtos.',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '3 hours',
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
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '5 hours',
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
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours',
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
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '1 day',
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
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440006',
    '850e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    'open',
    '650e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '10 minutes',
    'Boa tarde! Quero fazer um orçamento.',
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '5 minutes'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440007',
    '850e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440002',
    'pending',
    NULL,
    NULL,
    'O sistema está apresentando erros!',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir Mensagens
INSERT INTO messages (id, conversation_id, direction, type, body, sent_at, status, created_at, provider_message_id) VALUES
  -- Conversa 1 (Ana Paula) - Dentro da janela de 24h
  (
    'a50e8400-e29b-41d4-a716-446655440001',
    '950e8400-e29b-41d4-a716-446655440001',
    'inbound',
    'text',
    'Olá! Gostaria de saber mais sobre os produtos.',
    NOW() - INTERVAL '35 minutes',
    'delivered',
    NOW() - INTERVAL '35 minutes',
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
    NOW() - INTERVAL '34 minutes',
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
    NOW() - INTERVAL '30 minutes',
    'wamid_003'
  ),
  
  -- Conversa 2 (Bruno) - Dentro da janela
  (
    'a50e8400-e29b-41d4-a716-446655440011',
    '950e8400-e29b-41d4-a716-446655440002',
    'inbound',
    'text',
    'Olá, estou com um problema no sistema.',
    NOW() - INTERVAL '2 hours',
    'delivered',
    NOW() - INTERVAL '2 hours',
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
    NOW() - INTERVAL '1 hour 59 minutes',
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
    NOW() - INTERVAL '1 hour 58 minutes',
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
    NOW() - INTERVAL '1 hour 50 minutes',
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
    NOW() - INTERVAL '1 hour',
    'wamid_015'
  ),
  
  -- Conversa 3 (Carla) - Urgente, sem atendente
  (
    'a50e8400-e29b-41d4-a716-446655440021',
    '950e8400-e29b-41d4-a716-446655440003',
    'inbound',
    'text',
    'Preciso resolver uma pendência de pagamento urgente!',
    NOW() - INTERVAL '2 hours',
    'delivered',
    NOW() - INTERVAL '2 hours',
    'wamid_021'
  ),
  
  -- Conversa 4 (Diego - VIP) - FORA da janela de 24h (última mensagem há 26h)
  (
    'a50e8400-e29b-41d4-a716-446655440031',
    '950e8400-e29b-41d4-a716-446655440004',
    'inbound',
    'text',
    'Olá, sou cliente VIP.',
    NOW() - INTERVAL '26 hours',
    'delivered',
    NOW() - INTERVAL '26 hours',
    'wamid_031'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440032',
    '950e8400-e29b-41d4-a716-446655440004',
    'outbound',
    'text',
    'Olá Diego! Bem-vindo. Como posso ajudá-lo?',
    NOW() - INTERVAL '25 hours 50 minutes',
    'read',
    NOW() - INTERVAL '25 hours 50 minutes',
    'wamid_032'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440033',
    '950e8400-e29b-41d4-a716-446655440004',
    'inbound',
    'text',
    'Sou cliente VIP e gostaria de um atendimento especial.',
    NOW() - INTERVAL '4 hours',
    'delivered',
    NOW() - INTERVAL '4 hours',
    'wamid_033'
  ),
  
  -- Conversa 5 (Eduarda) - Fechada
  (
    'a50e8400-e29b-41d4-a716-446655440041',
    '950e8400-e29b-41d4-a716-446655440005',
    'inbound',
    'text',
    'Oi, preciso de ajuda com meu pedido.',
    NOW() - INTERVAL '2 days',
    'delivered',
    NOW() - INTERVAL '2 days',
    'wamid_041'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440042',
    '950e8400-e29b-41d4-a716-446655440005',
    'outbound',
    'text',
    'Oi Eduarda! Claro, vou verificar seu pedido.',
    NOW() - INTERVAL '2 days' + INTERVAL '5 minutes',
    'read',
    NOW() - INTERVAL '2 days' + INTERVAL '5 minutes',
    'wamid_042'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440043',
    '950e8400-e29b-41d4-a716-446655440005',
    'inbound',
    'text',
    'Tudo resolvido! Muito obrigada!',
    NOW() - INTERVAL '1 day',
    'delivered',
    NOW() - INTERVAL '1 day',
    'wamid_043'
  ),
  
  -- Conversa 6 (Fernando) - Nova, dentro da janela
  (
    'a50e8400-e29b-41d4-a716-446655440051',
    '950e8400-e29b-41d4-a716-446655440006',
    'inbound',
    'text',
    'Boa tarde!',
    NOW() - INTERVAL '10 minutes',
    'delivered',
    NOW() - INTERVAL '10 minutes',
    'wamid_051'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440052',
    '950e8400-e29b-41d4-a716-446655440006',
    'outbound',
    'text',
    'Boa tarde Fernando! Como posso ajudá-lo?',
    NOW() - INTERVAL '9 minutes',
    'read',
    NOW() - INTERVAL '9 minutes',
    'wamid_052'
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440053',
    '950e8400-e29b-41d4-a716-446655440006',
    'inbound',
    'text',
    'Quero fazer um orçamento.',
    NOW() - INTERVAL '5 minutes',
    'delivered',
    NOW() - INTERVAL '5 minutes',
    'wamid_053'
  ),
  
  -- Conversa 7 (Gabriela) - Pendente sem atendente
  (
    'a50e8400-e29b-41d4-a716-446655440061',
    '950e8400-e29b-41d4-a716-446655440007',
    'inbound',
    'text',
    'O sistema está apresentando erros!',
    NOW() - INTERVAL '3 hours',
    'delivered',
    NOW() - INTERVAL '3 hours',
    'wamid_061'
  )
ON CONFLICT (provider_message_id) DO NOTHING;

-- Inserir Tags nas Conversas
INSERT INTO conversation_tags (conversation_id, tag_id, created_at) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003', NOW()), -- Ana Paula: Novo Cliente
  ('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440005', NOW()), -- Ana Paula: Dúvida
  ('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', NOW()), -- Carla: Urgente
  ('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440004', NOW()), -- Carla: Reclamação
  ('950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', NOW()), -- Diego: VIP
  ('950e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440001', NOW())  -- Gabriela: Urgente
ON CONFLICT DO NOTHING;

-- Inserir Eventos de Status de Mensagens (exemplos)
INSERT INTO message_status_events (message_id, status, timestamp, created_at) VALUES
  ('a50e8400-e29b-41d4-a716-446655440001', 'sent', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '35 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440001', 'delivered', NOW() - INTERVAL '35 minutes' + INTERVAL '2 seconds', NOW() - INTERVAL '35 minutes' + INTERVAL '2 seconds'),
  ('a50e8400-e29b-41d4-a716-446655440002', 'sent', NOW() - INTERVAL '34 minutes', NOW() - INTERVAL '34 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440002', 'delivered', NOW() - INTERVAL '34 minutes' + INTERVAL '2 seconds', NOW() - INTERVAL '34 minutes' + INTERVAL '2 seconds'),
  ('a50e8400-e29b-41d4-a716-446655440002', 'read', NOW() - INTERVAL '33 minutes', NOW() - INTERVAL '33 minutes')
ON CONFLICT DO NOTHING;

-- Inserir Atribuições de Conversas
INSERT INTO conversation_assignments (conversation_id, user_id, assigned_at, created_at) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  ('950e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('950e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('950e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes')
ON CONFLICT DO NOTHING;

-- Inserir Eventos de Conversas
INSERT INTO conversation_events (conversation_id, event_type, user_id, metadata, created_at) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', 'created', NULL, '{"source": "whatsapp"}', NOW() - INTERVAL '3 hours'),
  ('950e8400-e29b-41d4-a716-446655440001', 'assigned', '650e8400-e29b-41d4-a716-446655440001', '{"assigned_to": "João Silva"}', NOW() - INTERVAL '2 hours'),
  ('950e8400-e29b-41d4-a716-446655440001', 'tagged', '650e8400-e29b-41d4-a716-446655440001', '{"tag": "Novo Cliente"}', NOW() - INTERVAL '2 hours'),
  ('950e8400-e29b-41d4-a716-446655440003', 'created', NULL, '{"source": "whatsapp"}', NOW() - INTERVAL '2 hours'),
  ('950e8400-e29b-41d4-a716-446655440003', 'tagged', NULL, '{"tag": "Urgente"}', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Inserir Membros de Unidades
INSERT INTO unit_memberships (unit_id, user_id, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NOW()), -- João -> Comercial
  ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', NOW()), -- João -> Suporte
  ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', NOW()), -- Maria -> Suporte
  ('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', NOW()), -- Maria -> Financeiro
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', NOW()), -- Carlos -> Comercial (Gestor)
  ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', NOW()), -- Carlos -> Suporte (Gestor)
  ('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', NOW())  -- Carlos -> Financeiro (Gestor)
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. VERIFICAR DADOS INSERIDOS
-- ========================================

SELECT '✅ Dados populados com sucesso!' as status;
SELECT '';
SELECT '📊 RESUMO DOS DADOS INSERIDOS:' as titulo;
SELECT '';

SELECT 'Unidades' as tabela, COUNT(*) as total FROM units
UNION ALL
SELECT 'Perfis', COUNT(*) FROM profiles
UNION ALL
SELECT 'Tags', COUNT(*) FROM tags
UNION ALL
SELECT 'Contatos', COUNT(*) FROM contacts
UNION ALL
SELECT 'Conversas', COUNT(*) FROM conversations
UNION ALL
SELECT 'Mensagens', COUNT(*) FROM messages
UNION ALL
SELECT 'Tags de Conversas', COUNT(*) FROM conversation_tags
UNION ALL
SELECT 'Eventos de Status', COUNT(*) FROM message_status_events
UNION ALL
SELECT 'Atribuições', COUNT(*) FROM conversation_assignments
UNION ALL
SELECT 'Eventos de Conversas', COUNT(*) FROM conversation_events
UNION ALL
SELECT 'Membros de Unidades', COUNT(*) FROM unit_memberships;

SELECT '';
SELECT '📋 CONVERSAS POR STATUS:' as titulo;
SELECT status, COUNT(*) as total 
FROM conversations 
GROUP BY status
ORDER BY total DESC;

SELECT '';
SELECT '👥 CONVERSAS POR ATENDENTE:' as titulo;
SELECT 
  COALESCE(p.full_name, 'Não Atribuído') as atendente,
  COUNT(*) as total
FROM conversations c
LEFT JOIN profiles p ON c.assigned_user_id = p.id
GROUP BY p.full_name
ORDER BY total DESC;

SELECT '';
SELECT '🏷️ TAGS MAIS USADAS:' as titulo;
SELECT 
  t.name as tag,
  t.color,
  COUNT(ct.id) as total_usos
FROM tags t
LEFT JOIN conversation_tags ct ON t.id = ct.tag_id
GROUP BY t.id, t.name, t.color
ORDER BY total_usos DESC;
