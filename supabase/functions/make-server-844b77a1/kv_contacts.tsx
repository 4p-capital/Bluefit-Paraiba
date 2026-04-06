/**
 * 📦 KV CONTACTS - Marco 2
 * 
 * Sistema de gerenciamento de contatos usando KV Store
 * Substitui a abordagem relacional (Marco 1)
 */

import * as kv from "./kv_store.tsx";

// ========================================
// 📊 TIPOS
// ========================================

export interface Contact {
  id: string;              // UUID gerado
  whatsapp: string;        // Número limpo (só números): "5561986562744"
  phone_e164: string;      // Formato E.164: "+5561986562744"
  first_name: string;
  last_name: string;
  full_name: string;       // first_name + last_name
  unit_id: string;
  situation: 'Lead' | 'Prospecto' | 'Cliente' | 'Ativo' | 'Inativo';
  created_at: string;      // ISO timestamp
  updated_at: string;
}

export interface Conversation {
  id: string;              // UUID gerado
  contact_id: string;      // ID do contato (whatsapp)
  contact_whatsapp: string; // WhatsApp do contato (para facilitar busca)
  unit_id: string;
  assigned_user_id: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  last_message_at: string;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;              // UUID gerado
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'template' | 'image' | 'video' | 'document' | 'audio';
  body: string;
  media_url?: string;
  provider_message_id?: string; // wamid da Meta
  status?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  created_at: string;
}

// ========================================
// 🔧 HELPERS
// ========================================

function generateUUID(): string {
  return crypto.randomUUID();
}

function formatE164(whatsapp: string): string {
  // Remove tudo que não é número
  const clean = whatsapp.replace(/\D/g, '');
  // Adiciona +
  return `+${clean}`;
}

// ========================================
// 📞 CONTATOS
// ========================================

/**
 * Criar novo contato no KV Store
 */
export async function createContact(params: {
  whatsapp: string;
  first_name: string;
  last_name: string;
  unit_id: string;
  situation: string;
}): Promise<{ success: boolean; contact?: Contact; error?: string }> {
  try {
    console.log('\n📦 [KV CONTACTS] Criando contato...');
    console.log('- WhatsApp:', params.whatsapp);
    console.log('- Nome:', params.first_name, params.last_name);
    console.log('- Unidade:', params.unit_id);
    console.log('- Situação:', params.situation);

    // Limpar WhatsApp
    const whatsappClean = params.whatsapp.replace(/\D/g, '');
    console.log('- WhatsApp limpo:', whatsappClean);

    // Verificar se já existe
    const existingKey = `contact:${whatsappClean}`;
    const existing = await kv.get(existingKey);

    if (existing) {
      console.log('❌ [KV CONTACTS] Contato já existe:', whatsappClean);
      return {
        success: false,
        error: 'Já existe um contato com este número de WhatsApp'
      };
    }

    // Criar contato
    const contact: Contact = {
      id: generateUUID(),
      whatsapp: whatsappClean,
      phone_e164: formatE164(whatsappClean),
      first_name: params.first_name,
      last_name: params.last_name,
      full_name: `${params.first_name} ${params.last_name}`,
      unit_id: params.unit_id,
      situation: params.situation as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Salvar contato
    await kv.set(existingKey, contact);
    console.log('✅ [KV CONTACTS] Contato salvo:', contact.id);

    // Adicionar à lista geral
    const contactList = await kv.get('contact:list') || [];
    contactList.push(whatsappClean);
    await kv.set('contact:list', contactList);
    console.log('✅ [KV CONTACTS] Adicionado à lista geral');

    // Adicionar à lista por unidade
    const unitListKey = `contact:by-unit:${params.unit_id}`;
    const unitList = await kv.get(unitListKey) || [];
    unitList.push(whatsappClean);
    await kv.set(unitListKey, unitList);
    console.log('✅ [KV CONTACTS] Adicionado à lista da unidade');

    return {
      success: true,
      contact: contact
    };

  } catch (error) {
    console.error('❌ [KV CONTACTS] Erro ao criar contato:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Buscar contato por WhatsApp
 */
export async function getContactByWhatsApp(whatsapp: string): Promise<Contact | null> {
  try {
    const whatsappClean = whatsapp.replace(/\D/g, '');
    const key = `contact:${whatsappClean}`;
    const contact = await kv.get(key);
    return contact as Contact | null;
  } catch (error) {
    console.error('❌ [KV CONTACTS] Erro ao buscar contato:', error);
    return null;
  }
}

/**
 * Listar todos os contatos
 */
export async function listContacts(): Promise<Contact[]> {
  try {
    const contactList = await kv.get('contact:list') || [];
    const contacts: Contact[] = [];

    for (const whatsapp of contactList) {
      const contact = await getContactByWhatsApp(whatsapp);
      if (contact) {
        contacts.push(contact);
      }
    }

    return contacts;
  } catch (error) {
    console.error('❌ [KV CONTACTS] Erro ao listar contatos:', error);
    return [];
  }
}

/**
 * Listar contatos por unidade
 */
export async function listContactsByUnit(unitId: string): Promise<Contact[]> {
  try {
    const unitListKey = `contact:by-unit:${unitId}`;
    const unitList = await kv.get(unitListKey) || [];
    const contacts: Contact[] = [];

    for (const whatsapp of unitList) {
      const contact = await getContactByWhatsApp(whatsapp);
      if (contact) {
        contacts.push(contact);
      }
    }

    return contacts;
  } catch (error) {
    console.error('❌ [KV CONTACTS] Erro ao listar contatos por unidade:', error);
    return [];
  }
}

// ========================================
// 💬 CONVERSAS
// ========================================

/**
 * Criar nova conversa no KV Store
 */
export async function createConversation(params: {
  contact_whatsapp: string;
  unit_id: string;
  assigned_user_id: string;
}): Promise<{ success: boolean; conversation?: Conversation; error?: string }> {
  try {
    console.log('\n💬 [KV CONVERSATIONS] Criando conversa...');
    console.log('- WhatsApp:', params.contact_whatsapp);
    console.log('- Unidade:', params.unit_id);
    console.log('- Usuário:', params.assigned_user_id);

    const whatsappClean = params.contact_whatsapp.replace(/\D/g, '');

    // Verificar se já existe conversa para este contato
    const existingConvKey = `conversation:by-contact:${whatsappClean}`;
    const existingConvId = await kv.get(existingConvKey);

    if (existingConvId) {
      console.log('⚠️ [KV CONVERSATIONS] Conversa já existe para este contato');
      const existingConv = await kv.get(`conversation:${existingConvId}`);
      return {
        success: true,
        conversation: existingConv as Conversation
      };
    }

    // Criar nova conversa
    const conversation: Conversation = {
      id: generateUUID(),
      contact_id: whatsappClean,
      contact_whatsapp: whatsappClean,
      unit_id: params.unit_id,
      assigned_user_id: params.assigned_user_id,
      status: 'open',
      last_message_at: new Date().toISOString(),
      last_message_preview: 'Conversa iniciada',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Salvar conversa
    await kv.set(`conversation:${conversation.id}`, conversation);
    console.log('✅ [KV CONVERSATIONS] Conversa salva:', conversation.id);

    // Mapear contato → conversa
    await kv.set(existingConvKey, conversation.id);
    console.log('✅ [KV CONVERSATIONS] Mapeamento contato→conversa criado');

    // Adicionar à lista geral
    const convList = await kv.get('conversation:list') || [];
    convList.push(conversation.id);
    await kv.set('conversation:list', convList);
    console.log('✅ [KV CONVERSATIONS] Adicionado à lista geral');

    // Adicionar à lista do usuário
    const userConvKey = `conversation:by-user:${params.assigned_user_id}`;
    const userConvList = await kv.get(userConvKey) || [];
    userConvList.push(conversation.id);
    await kv.set(userConvKey, userConvList);
    console.log('✅ [KV CONVERSATIONS] Adicionado à lista do usuário');

    return {
      success: true,
      conversation: conversation
    };

  } catch (error) {
    console.error('❌ [KV CONVERSATIONS] Erro ao criar conversa:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Buscar conversa por ID
 */
export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  try {
    const key = `conversation:${conversationId}`;
    const conversation = await kv.get(key);
    return conversation as Conversation | null;
  } catch (error) {
    console.error('❌ [KV CONVERSATIONS] Erro ao buscar conversa:', error);
    return null;
  }
}

/**
 * Buscar conversa por WhatsApp do contato
 */
export async function getConversationByContactWhatsApp(whatsapp: string): Promise<Conversation | null> {
  try {
    const whatsappClean = whatsapp.replace(/\D/g, '');
    const key = `conversation:by-contact:${whatsappClean}`;
    const conversationId = await kv.get(key);
    
    if (!conversationId) {
      return null;
    }

    return await getConversationById(conversationId as string);
  } catch (error) {
    console.error('❌ [KV CONVERSATIONS] Erro ao buscar conversa por contato:', error);
    return null;
  }
}

/**
 * Listar conversas de um usuário
 */
export async function listConversationsByUser(userId: string): Promise<Conversation[]> {
  try {
    const userConvKey = `conversation:by-user:${userId}`;
    const userConvList = await kv.get(userConvKey) || [];
    const conversations: Conversation[] = [];

    for (const convId of userConvList) {
      const conv = await getConversationById(convId as string);
      if (conv) {
        conversations.push(conv);
      }
    }

    // Ordenar por última mensagem (mais recente primeiro)
    conversations.sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    return conversations;
  } catch (error) {
    console.error('❌ [KV CONVERSATIONS] Erro ao listar conversas:', error);
    return [];
  }
}

/**
 * Atualizar última mensagem da conversa
 */
export async function updateConversationLastMessage(
  conversationId: string,
  preview: string
): Promise<void> {
  try {
    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      console.error('❌ [KV CONVERSATIONS] Conversa não encontrada:', conversationId);
      return;
    }

    conversation.last_message_at = new Date().toISOString();
    conversation.last_message_preview = preview;
    conversation.updated_at = new Date().toISOString();

    await kv.set(`conversation:${conversationId}`, conversation);
    console.log('✅ [KV CONVERSATIONS] Última mensagem atualizada');
  } catch (error) {
    console.error('❌ [KV CONVERSATIONS] Erro ao atualizar conversa:', error);
  }
}

// ========================================
// 💬 MENSAGENS
// ========================================

/**
 * Adicionar mensagem a uma conversa
 */
export async function addMessage(params: {
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'template' | 'image' | 'video' | 'document' | 'audio';
  body: string;
  media_url?: string;
  provider_message_id?: string;
  status?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
}): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    console.log('\n📩 [KV MESSAGES] Adicionando mensagem...');
    console.log('- Conversa:', params.conversation_id);
    console.log('- Direção:', params.direction);
    console.log('- Tipo:', params.type);
    console.log('- Body (preview):', params.body.substring(0, 50));

    const message: Message = {
      id: generateUUID(),
      conversation_id: params.conversation_id,
      direction: params.direction,
      type: params.type,
      body: params.body,
      media_url: params.media_url,
      provider_message_id: params.provider_message_id,
      status: params.status || 'sent',
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Buscar mensagens existentes
    const messagesKey = `messages:${params.conversation_id}`;
    const messages = await kv.get(messagesKey) || [];
    
    // Adicionar nova mensagem
    messages.push(message);
    
    // Salvar
    await kv.set(messagesKey, messages);
    console.log('✅ [KV MESSAGES] Mensagem salva:', message.id);

    // Atualizar conversa
    const preview = params.type === 'template' 
      ? 'Template enviado'
      : params.body.substring(0, 100);
    await updateConversationLastMessage(params.conversation_id, preview);

    return {
      success: true,
      message: message
    };

  } catch (error) {
    console.error('❌ [KV MESSAGES] Erro ao adicionar mensagem:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Listar mensagens de uma conversa
 */
export async function listMessages(conversationId: string): Promise<Message[]> {
  try {
    const messagesKey = `messages:${conversationId}`;
    const messages = await kv.get(messagesKey) || [];
    
    // Ordenar por data (mais antiga primeiro)
    const sortedMessages = (messages as Message[]).sort((a, b) => 
      new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
    );

    return sortedMessages;
  } catch (error) {
    console.error('❌ [KV MESSAGES] Erro ao listar mensagens:', error);
    return [];
  }
}

/**
 * Atualizar status de uma mensagem
 */
export async function updateMessageStatus(
  conversationId: string,
  messageId: string,
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed',
  providerMessageId?: string
): Promise<void> {
  try {
    const messagesKey = `messages:${conversationId}`;
    const messages = await kv.get(messagesKey) || [];

    const messageIndex = (messages as Message[]).findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
      console.error('❌ [KV MESSAGES] Mensagem não encontrada:', messageId);
      return;
    }

    // Atualizar status
    (messages as Message[])[messageIndex].status = status;
    if (providerMessageId) {
      (messages as Message[])[messageIndex].provider_message_id = providerMessageId;
    }

    await kv.set(messagesKey, messages);
    console.log('✅ [KV MESSAGES] Status da mensagem atualizado:', status);
  } catch (error) {
    console.error('❌ [KV MESSAGES] Erro ao atualizar status:', error);
  }
}
