# Setup do Banco de Dados - WhatsApp Atendimento

Este documento contém instruções e scripts para configurar o banco de dados Supabase.

## ⚠️ IMPORTANTE: ESTRUTURA DE TABELAS

**NÃO CRIE NOVAS TABELAS**. Use exclusivamente as tabelas existentes:

### Tabelas Principais
- `contacts` - Contatos/clientes
- `conversations` - Conversas
- `messages` - Mensagens
- `message_status_events` - Eventos de status de mensagens

### Tabelas de Atendimento
- `profiles` - Perfis de atendentes/gestores
- `units` - Unidades/departamentos
- `unit_memberships` - Membros de cada unidade
- `conversation_assignments` - Atribuições de conversas
- `conversation_events` - Eventos da conversa (histórico)

### Tabelas de Organização
- `tags` - Tags/etiquetas
- `contact_tags` - Tags aplicadas a contatos
- `conversation_tags` - Tags aplicadas a conversas

## Scripts SQL de Exemplo (Para Popular Dados de Teste)

### 1. Criar Unidades

```sql
-- Inserir unidades de exemplo
INSERT INTO units (id, name, description) VALUES
  (gen_random_uuid(), 'Comercial', 'Equipe de vendas e prospecção'),
  (gen_random_uuid(), 'Suporte', 'Atendimento e suporte técnico'),
  (gen_random_uuid(), 'Financeiro', 'Cobranças e pagamentos')
ON CONFLICT DO NOTHING;
```

### 2. Criar Perfis de Atendentes

```sql
-- Inserir perfis de exemplo
INSERT INTO profiles (id, email, full_name, role) VALUES
  (gen_random_uuid(), 'joao.silva@empresa.com', 'João Silva', 'atendente'),
  (gen_random_uuid(), 'maria.santos@empresa.com', 'Maria Santos', 'atendente'),
  (gen_random_uuid(), 'carlos.souza@empresa.com', 'Carlos Souza', 'gestor')
ON CONFLICT DO NOTHING;
```

### 3. Criar Tags

```sql
-- Inserir tags de exemplo
INSERT INTO tags (id, name, color) VALUES
  (gen_random_uuid(), 'Urgente', '#ef4444'),
  (gen_random_uuid(), 'VIP', '#8b5cf6'),
  (gen_random_uuid(), 'Novo Cliente', '#3b82f6'),
  (gen_random_uuid(), 'Reclamação', '#f59e0b'),
  (gen_random_uuid(), 'Dúvida', '#10b981')
ON CONFLICT DO NOTHING;
```

### 4. Criar Contatos de Exemplo

```sql
-- Inserir contatos de exemplo
INSERT INTO contacts (id, phone_number, display_name) VALUES
  (gen_random_uuid(), '+5511999999001', 'Ana Paula'),
  (gen_random_uuid(), '+5511999999002', 'Bruno Costa'),
  (gen_random_uuid(), '+5511999999003', 'Carla Mendes'),
  (gen_random_uuid(), '+5511999999004', 'Diego Alves'),
  (gen_random_uuid(), '+5511999999005', 'Eduarda Lima')
ON CONFLICT DO NOTHING;
```

### 5. Criar Conversas de Exemplo

```sql
-- Primeiro, capturar IDs de contatos e unidades
WITH contact_ids AS (
  SELECT id, row_number() OVER (ORDER BY created_at) as rn FROM contacts LIMIT 5
),
unit_ids AS (
  SELECT id, row_number() OVER (ORDER BY created_at) as rn FROM units LIMIT 3
)
-- Inserir conversas
INSERT INTO conversations (
  id, 
  contact_id, 
  unit_id, 
  status, 
  last_message_preview, 
  last_message_at
)
SELECT 
  gen_random_uuid(),
  c.id,
  u.id,
  CASE WHEN c.rn % 4 = 0 THEN 'closed'
       WHEN c.rn % 3 = 0 THEN 'pending'
       WHEN c.rn % 2 = 0 THEN 'waiting_customer'
       ELSE 'open' END,
  'Olá, preciso de ajuda com...',
  NOW() - (c.rn || ' hours')::INTERVAL
FROM contact_ids c
CROSS JOIN LATERAL (
  SELECT id FROM unit_ids WHERE rn = (c.rn % 3) + 1
) u;
```

### 6. Criar Mensagens de Exemplo

```sql
-- Inserir mensagens de exemplo para cada conversa
WITH conv AS (
  SELECT id, contact_id FROM conversations LIMIT 5
)
INSERT INTO messages (
  id,
  conversation_id,
  direction,
  type,
  body,
  sent_at,
  status
)
SELECT 
  gen_random_uuid(),
  conv.id,
  'inbound',
  'text',
  'Olá, tudo bem? Preciso de ajuda com meu pedido.',
  NOW() - '2 hours'::INTERVAL,
  'delivered'
FROM conv
UNION ALL
SELECT 
  gen_random_uuid(),
  conv.id,
  'outbound',
  'text',
  'Olá! Claro, estou aqui para ajudar. Qual é o número do seu pedido?',
  NOW() - '1 hour 50 minutes'::INTERVAL,
  'read'
FROM conv;
```

## Estrutura Mínima de Tabelas (Para Referência)

### contacts
```sql
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### conversations
```sql
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
```

### messages
```sql
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
```

## Indexes Recomendados

```sql
-- Indexes para melhor performance
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_unit_id ON conversations(unit_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
CREATE INDEX IF NOT EXISTS idx_conversation_tags_conversation_id ON conversation_tags(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_tags_tag_id ON conversation_tags(tag_id);
```

## Políticas de Segurança (RLS)

⚠️ **ATENÇÃO**: Configure as políticas de RLS (Row Level Security) no Supabase de acordo com suas regras de negócio.

Exemplo básico (ajuste conforme necessário):

```sql
-- Habilitar RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos usuários autenticados
CREATE POLICY "Allow read for authenticated users" ON conversations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read for authenticated users" ON messages
  FOR SELECT TO authenticated USING (true);

-- Permitir insert para atendentes
CREATE POLICY "Allow insert for attendants" ON messages
  FOR INSERT TO authenticated WITH CHECK (true);
```

## Próximos Passos

1. Execute os scripts SQL no Editor SQL do Supabase
2. Verifique se os dados foram inseridos corretamente
3. Configure as políticas de RLS conforme sua necessidade
4. Teste a aplicação com os dados de exemplo

## Notas Importantes

- ✅ Use sempre `gen_random_uuid()` para gerar IDs
- ✅ Mantenha `created_at` e `updated_at` em todas as tabelas
- ✅ Use CHECK constraints para validar valores de enums
- ✅ Crie índices nas colunas frequentemente consultadas
- ❌ **NUNCA** crie tabelas fora da estrutura definida
- ❌ **NÃO** modifique o esquema sem documentar
