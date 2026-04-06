# 📱 Guia Rápido - Sistema de Atendimento WhatsApp

## 🚀 O que foi criado?

Um sistema profissional e completo de atendimento via WhatsApp para empresas B2B, pronto para conectar com a **API oficial da Meta (WhatsApp Cloud API)**.

## ✨ Principais Recursos

### 1️⃣ **Inbox Inteligente** (Lista de Conversas)
- ✅ Visualização estilo WhatsApp Web
- ✅ Filtros por status, unidade e atendente
- ✅ Busca por nome, telefone ou mensagem
- ✅ Indicadores visuais de status
- ✅ Atualização em tempo real

### 2️⃣ **Chat Completo**
- ✅ Timeline de mensagens com histórico
- ✅ Diferenciação visual de mensagens (recebidas/enviadas)
- ✅ Status de entrega (enviado/entregue/lido)
- ✅ Suporte a templates do WhatsApp

### 3️⃣ **Regra da Janela de 24 Horas** ⏰
Implementação **100% conforme regras do WhatsApp**:

| Situação | O que acontece |
|----------|---------------|
| **Cliente enviou msg há < 24h** | ✅ Pode enviar mensagens livres |
| **Falta < 2h para expirar** | ⚠️ Alerta amarelo mostrando tempo restante |
| **Passou das 24h** | 🔒 Campo bloqueado + botão "Enviar Template" |

### 4️⃣ **Sistema de Templates**
- ✅ Modal de seleção profissional
- ✅ 5 templates de exemplo mockados
- ✅ Suporte a variáveis/parâmetros
- ✅ Categorias: Marketing, Utilidade, Autenticação

### 5️⃣ **Gestão de Atendimento**
- ✅ Atribuir conversas a atendentes
- ✅ Múltiplas unidades/departamentos
- ✅ Sistema de tags coloridas
- ✅ Controle de status (aberto, pendente, aguardando, fechado)
- ✅ Histórico completo de eventos

## 🔧 Como Funciona?

### Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  React + TypeScript + Tailwind + Shadcn/UI          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ├─► Supabase (Banco de Dados)
                  │   • Conversas, Mensagens, Contatos
                  │   • Atendentes, Unidades, Tags
                  │   • Real-time subscriptions
                  │
                  └─► WhatsApp Cloud API (Futuro)
                      • Envio de mensagens
                      • Recebimento via webhooks
                      • Gestão de templates
```

### Fluxo de uma Mensagem

```
1. Atendente digita mensagem
   ↓
2. Sistema verifica janela de 24h
   ↓
3. Se OK → Salva no Supabase com status "queued"
   ↓
4. Chama função placeholder sendWhatsAppMessage()
   ↓
5. Atualiza status para "sent" → "delivered" → "read"
   ↓
6. Registra evento no histórico
   ↓
7. Atualiza preview da conversa
```

## 📋 Estrutura do Banco de Dados

### Tabelas Principais
- **`conversations`** - Cada conversa com um cliente
- **`messages`** - Todas as mensagens (inbound/outbound)
- **`contacts`** - Dados dos clientes
- **`message_status_events`** - Rastreamento de status

### Tabelas de Gestão
- **`profiles`** - Atendentes e gestores
- **`units`** - Unidades/departamentos
- **`conversation_assignments`** - Quem está atendendo o quê
- **`conversation_events`** - Histórico de todas as ações

### Tabelas de Organização
- **`tags`** - Tags/etiquetas
- **`conversation_tags`** - Tags aplicadas a conversas
- **`contact_tags`** - Tags aplicadas a contatos

## 🎯 Próximos Passos para Produção

### 1. **Configurar Banco de Dados**
```sql
-- Execute os scripts em SETUP_DATABASE.md
-- Crie as tabelas necessárias
-- Insira dados de exemplo
-- Configure RLS (Row Level Security)
```

### 2. **Conectar WhatsApp Cloud API**

**Você precisará:**
- Conta no Meta Business Manager
- WhatsApp Business Account
- Número de telefone verificado
- Access Token da API

**Onde configurar:**
Arquivo `/src/app/lib/whatsapp.ts` - Substituir funções placeholder:

```typescript
// ANTES (Placeholder)
export async function sendWhatsAppMessage(params) {
  console.log('📤 [PLACEHOLDER] Enviando...');
  return { success: true, messageId: 'mock_id' };
}

// DEPOIS (Real)
export async function sendWhatsAppMessage(params) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: params.contactPhone,
      text: { body: params.message }
    })
  });
  return await response.json();
}
```

### 3. **Configurar Webhooks**

Crie endpoint para receber mensagens:

```typescript
// /supabase/functions/server/whatsapp-webhook.ts
export async function handleWhatsAppWebhook(req: Request) {
  const { entry } = await req.json();
  
  // Processar mensagem recebida
  for (const change of entry[0].changes) {
    const message = change.value.messages[0];
    
    // Salvar no banco
    await supabase.from('messages').insert({
      conversation_id: ...,
      direction: 'inbound',
      body: message.text.body,
      ...
    });
  }
}
```

### 4. **Criar Templates no Meta**

1. Acesse Meta Business Manager
2. Vá em "WhatsApp Manager" → "Message Templates"
3. Crie templates seguindo as diretrizes
4. Aguarde aprovação (24-48h)
5. Atualize `fetchAvailableTemplates()` para buscar da API

## 🔐 Segurança

### Configurar RLS no Supabase

```sql
-- Exemplo: Atendentes só veem conversas da sua unidade
CREATE POLICY "attendants_see_own_unit" ON conversations
  FOR SELECT TO authenticated
  USING (
    unit_id IN (
      SELECT unit_id FROM unit_memberships 
      WHERE user_id = auth.uid()
    )
  );
```

## 📊 Métricas Disponíveis (Futuras)

Com a estrutura atual, você pode facilmente criar:

- **Tempo Médio de Resposta** - Diferença entre mensagens inbound/outbound
- **Taxa de Resolução** - % de conversas fechadas vs abertas
- **Performance por Atendente** - Quantas conversas atendeu, tempo médio
- **Horários de Pico** - Quando há mais mensagens
- **Tags Mais Usadas** - Principais problemas/temas
- **NPS por Conversa** - Satisfação do cliente

## 🎨 Personalização

### Cores e Branding

Edite `/src/styles/theme.css`:

```css
:root {
  --primary: #25D366; /* Verde WhatsApp */
  --secondary: #128C7E;
  --accent: #075E54;
}
```

### Adicionar Novo Status

1. Edite tipo em `/src/app/types/database.ts`:
```typescript
export type ConversationStatus = 
  'open' | 'pending' | 'waiting_customer' | 'closed' | 'seu_novo_status';
```

2. Adicione label e cor nos componentes

3. Atualize CHECK constraint no banco

## ⚠️ Notas Importantes

### ❌ NÃO FAZER
- ❌ Criar tabelas fora da estrutura definida
- ❌ Enviar mensagens fora da janela de 24h sem template
- ❌ Hardcodar IDs de usuários ou unidades
- ❌ Ignorar eventos de histórico

### ✅ SEMPRE FAZER
- ✅ Registrar eventos em `conversation_events`
- ✅ Atualizar `last_message_preview` e `last_message_at`
- ✅ Validar janela de 24h antes de enviar
- ✅ Usar UUIDs para IDs
- ✅ Tratar erros e mostrar feedback ao usuário

## 📱 Templates de Exemplo

O sistema já vem com 5 templates mockados:

1. **boas_vindas** (Utilidade)
   - "Olá {{nome}}, seja bem-vindo!"
   
2. **confirmacao_pedido** (Utilidade)
   - "Seu pedido #{{numero}} foi confirmado"
   
3. **lembrete_pagamento** (Utilidade)
   - "Lembrete: Fatura vencendo em breve"
   
4. **promocao_mensal** (Marketing)
   - "Aproveite nossa promoção especial!"
   
5. **codigo_verificacao** (Autenticação)
   - "Seu código de verificação: {{codigo}}"

## 🚀 Deploy

### Vercel / Netlify
```bash
npm run build
# Deploy pasta dist/
```

### Configurar Variáveis de Ambiente
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_WHATSAPP_ACCESS_TOKEN=EAA... (quando integrar)
```

## 📞 Suporte

- **Documentação Técnica**: Veja README_SISTEMA.md
- **Setup do Banco**: Veja SETUP_DATABASE.md
- **API do WhatsApp**: https://developers.facebook.com/docs/whatsapp/cloud-api

---

**Sistema desenvolvido seguindo as melhores práticas e pronto para escalar! 🚀**
