# 🔥 MARCO 2: KV STORE - ESTRUTURA COMPLETA

## 📋 VISÃO GERAL

O **Marco 2** migra TODA a funcionalidade de contatos, conversas e mensagens do sistema relacional (PostgreSQL) para o **KV Store**.

---

## 🎯 MOTIVO DA MUDANÇA

✅ **Simplicidade**: KV Store é mais direto e não depende de schema SQL  
✅ **Performance**: Acesso mais rápido para protótipos  
✅ **Portabilidade**: Funciona em qualquer ambiente com KV Store  
✅ **Debugging**: Mais fácil de inspecionar e debug

ar  
✅ **Evita problemas**: Não depende de Edge Functions estarem deployed  

---

## 🔑 ESTRUTURA DE CHAVES

### **📞 CONTATOS**
```typescript
contact:{whatsapp}              // Dados do contato
contact:list                    // Array de todos os WhatsApps
contact:by-unit:{unitId}       // Array de WhatsApps por unidade
```

**Exemplo:**
```typescript
// Chave: contact:5561986562744
{
  id: "uuid-123",
  whatsapp: "5561986562744",
  phone_e164: "+5561986562744",
  first_name: "Yago",
  last_name: "Teste",
  full_name: "Yago Teste",
  unit_id: "5",
  situation: "Lead",
  created_at: "2026-01-23T15:30:00.000Z",
  updated_at: "2026-01-23T15:30:00.000Z"
}
```

---

### **💬 CONVERSAS**
```typescript
conversation:{id}                      // Dados da conversa
conversation:by-contact:{whatsapp}    // ID da conversa de um contato
conversation:list                      // Array de todos os IDs
conversation:by-user:{userId}         // Array de IDs por usuário
```

**Exemplo:**
```typescript
// Chave: conversation:uuid-456
{
  id: "uuid-456",
  contact_id: "5561986562744",
  contact_whatsapp: "5561986562744",
  unit_id: "5",
  assigned_user_id: "user-uuid-789",
  status: "open",
  last_message_at: "2026-01-23T15:35:00.000Z",
  last_message_preview: "Olá, tudo bem?",
  created_at: "2026-01-23T15:30:00.000Z",
  updated_at: "2026-01-23T15:35:00.000Z"
}

// Chave: conversation:by-contact:5561986562744
"uuid-456"
```

---

### **📩 MENSAGENS**
```typescript
messages:{conversationId}    // Array de todas as mensagens
message:{messageId}          // Dados de uma mensagem específica (opcional)
```

**Exemplo:**
```typescript
// Chave: messages:uuid-456
[
  {
    id: "msg-1",
    conversation_id: "uuid-456",
    direction: "outbound",
    type: "template",
    body: "Olá! Bem-vindo à Bluefit!",
    media_url: null,
    provider_message_id: "wamid.xxx",
    status: "sent",
    sent_at: "2026-01-23T15:35:00.000Z",
    created_at: "2026-01-23T15:35:00.000Z"
  },
  {
    id: "msg-2",
    conversation_id: "uuid-456",
    direction: "inbound",
    type: "text",
    body: "Olá! Gostaria de saber mais sobre os planos",
    status: "read",
    sent_at: "2026-01-23T15:36:00.000Z",
    created_at: "2026-01-23T15:36:00.000Z"
  }
]
```

---

## 🔧 FUNÇÕES IMPLEMENTADAS

### **📂 Arquivo: `/supabase/functions/server/kv_contacts.tsx`**

#### **📞 CONTATOS:**
- ✅ `createContact()` - Criar novo contato
- ✅ `getContactByWhatsApp()` - Buscar contato por WhatsApp
- ✅ `listContacts()` - Listar todos os contatos
- ✅ `listContactsByUnit()` - Listar contatos por unidade

#### **💬 CONVERSAS:**
- ✅ `createConversation()` - Criar nova conversa
- ✅ `getConversationById()` - Buscar conversa por ID
- ✅ `getConversationByContactWhatsApp()` - Buscar conversa por contato
- ✅ `listConversationsByUser()` - Listar conversas de um usuário
- ✅ `updateConversationLastMessage()` - Atualizar última mensagem

#### **📩 MENSAGENS:**
- ✅ `addMessage()` - Adicionar mensagem
- ✅ `listMessages()` - Listar mensagens de uma conversa
- ✅ `updateMessageStatus()` - Atualizar status de mensagem

---

## 🌐 ENDPOINTS API

### **📂 Arquivo: `/supabase/functions/server/index.tsx`**

#### **1️⃣ Criar Contato**
```
POST /make-server-844b77a1/api/kv/contacts
```

**Body:**
```json
{
  "whatsapp": "5561986562744",
  "nome": "Yago",
  "sobrenome": "Teste",
  "unit_id": "5",
  "situacao": "lead",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (201):**
```json
{
  "success": true,
  "contact": {
    "id": "uuid-123",
    "whatsapp": "5561986562744",
    ...
  },
  "conversation": {
    "id": "uuid-456",
    ...
  }
}
```

---

#### **2️⃣ Listar Conversas**
```
GET /make-server-844b77a1/api/kv/conversations
```

**Headers:**
```
Authorization: Bearer {user_token}
```

**Response (200):**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "uuid-456",
      "contact_whatsapp": "5561986562744",
      "status": "open",
      "contact": {
        "id": "uuid-123",
        "first_name": "Yago",
        ...
      },
      ...
    }
  ]
}
```

---

#### **3️⃣ Listar Mensagens**
```
GET /make-server-844b77a1/api/kv/messages/:conversationId
```

**Headers:**
```
Authorization: Bearer {user_token}
```

**Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-1",
      "direction": "outbound",
      "type": "template",
      "body": "Olá! Bem-vindo à Bluefit!",
      ...
    },
    {
      "id": "msg-2",
      "direction": "inbound",
      "type": "text",
      "body": "Olá! Gostaria de saber mais",
      ...
    }
  ]
}
```

---

#### **4️⃣ Enviar Mensagem**
```
POST /make-server-844b77a1/api/kv/messages
```

**Body:**
```json
{
  "conversation_id": "uuid-456",
  "type": "text",
  "body": "Olá! Como posso ajudar?",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": {
    "id": "msg-3",
    "conversation_id": "uuid-456",
    "direction": "outbound",
    "type": "text",
    "body": "Olá! Como posso ajudar?",
    ...
  }
}
```

---

## 🔄 FLUXO COMPLETO

### **1️⃣ CRIAR CONTATO**
```
Frontend → POST /api/kv/contacts
  ↓
Backend valida token
  ↓
createContact() → Salva no KV
  ↓
createConversation() → Cria conversa automaticamente
  ↓
Retorna contato + conversa
```

### **2️⃣ ENVIAR TEMPLATE**
```
Frontend → POST /api/kv/messages
  ↓
Backend valida token
  ↓
addMessage() → Salva mensagem no KV
  ↓
Chama API da Meta → Envia WhatsApp
  ↓
updateMessageStatus() → Atualiza com wamid da Meta
```

### **3️⃣ RECEBER MENSAGEM (WEBHOOK)**
```
Meta → POST /webhook/whatsapp
  ↓
Backend processa webhook
  ↓
Identifica conversa por WhatsApp
  ↓
addMessage() → Salva mensagem inbound
```

---

## ✅ VANTAGENS DO MARCO 2

| Aspecto | Marco 1 (Relacional) | Marco 2 (KV Store) |
|---------|---------------------|---------------------|
| **Setup** | Precisa migrations SQL | Sem setup |
| **Velocidade** | JOIN queries podem ser lentas | Acesso direto por chave |
| **Debugging** | Precisa SQL client | Basta chamar `kv.get()` |
| **Portabilidade** | Depende de Postgres | Funciona em qualquer KV |
| **Prototipagem** | Mais trabalhoso | Extremamente rápido |

---

## 🚀 PRÓXIMOS PASSOS

### **✅ IMPLEMENTADO:**
- [x] Estrutura de chaves KV
- [x] Funções de CRUD (contatos, conversas, mensagens)
- [x] Endpoints API
- [x] Frontend atualizado para usar `/api/kv/contacts`

### **⏳ FALTA IMPLEMENTAR:**
- [ ] Atualizar ConversationList para buscar de `/api/kv/conversations`
- [ ] Atualizar ChatArea para buscar de `/api/kv/messages/:id`
- [ ] Integrar webhook para salvar mensagens inbound no KV
- [ ] Integrar envio de templates para salvar no KV

---

## 📝 MIGRAÇÃO

Para migrar dados existentes do Postgres para KV Store:

```typescript
// Buscar contatos do Postgres
const { data: contacts } = await supabase.from('contacts').select('*');

// Salvar no KV
for (const contact of contacts) {
  await kv.set(`contact:${contact.wa_id}`, {
    id: contact.id,
    whatsapp: contact.wa_id,
    phone_e164: contact.phone_number,
    first_name: contact.first_name,
    last_name: contact.last_name,
    full_name: `${contact.first_name} ${contact.last_name}`,
    unit_id: contact.unit_id,
    situation: contact.situation,
    created_at: contact.created_at,
    updated_at: contact.updated_at
  });
}
```

---

**🎉 Marco 2 está pronto para uso! Agora podemos criar contatos, conversas e mensagens sem depender do PostgreSQL!**
