-- Verificar estrutura de dados para diagnóstico do erro "Invalid JWT"

-- 1. Verificar se há usuários na tabela profiles
SELECT 
  id,
  email,
  nome,
  sobrenome,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar se há contatos
SELECT 
  id,
  wa_id,
  phone_number,
  first_name,
  last_name,
  situation,
  created_at
FROM contacts
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar se há conversas
SELECT 
  c.id,
  c.contact_id,
  c.assigned_user_id,
  c.status,
  c.created_at,
  ct.first_name,
  ct.last_name,
  ct.phone_number,
  p.email as assigned_user_email
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
LEFT JOIN profiles p ON c.assigned_user_id = p.id
ORDER BY c.created_at DESC
LIMIT 5;

-- 4. Verificar se há mensagens
SELECT 
  m.id,
  m.conversation_id,
  m.direction,
  m.type,
  m.body,
  m.status,
  m.sent_at,
  c.assigned_user_id
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
ORDER BY m.sent_at DESC
LIMIT 5;

-- 5. Verificar se há conversas atribuídas a um usuário específico
-- Substitua 'SEU_USER_ID' pelo ID do usuário que você está testando
SELECT 
  COUNT(*) as total_conversations,
  assigned_user_id
FROM conversations
GROUP BY assigned_user_id;
