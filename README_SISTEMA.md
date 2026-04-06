# 📱 Sistema de Atendimento WhatsApp B2B

Sistema profissional de atendimento via WhatsApp com gestão de conversas, múltiplos atendentes, unidades, tags e métricas.

## 🎯 Funcionalidades Implementadas

### ✅ TELA 1 - Lista de Conversas (Inbox)

Interface estilo WhatsApp Web/Zendesk com:

- **Visualização de Conversas**
  - Nome do contato ou telefone
  - Última mensagem recebida
  - Horário da última interação
  - Indicador visual de status (colorido)
  - Atendente atribuído
  - Tags aplicadas

- **Filtros Inteligentes**
  - Por status (aberto, pendente, aguardando cliente, fechado)
  - Por unidade/departamento
  - Por atendente atribuído
  - Busca por nome, telefone ou conteúdo da mensagem

- **Atualização em Tempo Real**
  - Subscriptions do Supabase para updates automáticos
  - Novas mensagens aparecem instantaneamente

### ✅ TELA 2 - Chat (Conversa)

Interface completa de atendimento com:

- **Header do Chat**
  - Nome e telefone do contato
  - Unidade atual
  - Dropdown para atribuir atendente
  - Dropdown para alterar status
  - Dropdown para adicionar tags
  - Visualização de tags aplicadas

- **Timeline de Mensagens**
  - Mensagens ordenadas cronologicamente
  - Diferenciação visual inbound/outbound
  - Indicadores de status (enviado/entregue/lido/falhou)
  - Horário de cada mensagem
  - Suporte a mensagens de texto e templates

- **Composer (Campo de Envio)**
  - Campo de texto com suporte a múltiplas linhas
  - Envio com Enter (Shift+Enter para nova linha)
  - Botão de enviar mensagem
  - Botão de enviar template

### ✅ REGRA CRÍTICA - Janela de 24 Horas

Implementação completa da regra do WhatsApp:

- **Verificação Automática**
  - Checa última mensagem inbound ao abrir conversa
  - Calcula diferença de tempo automaticamente
  - Atualiza estado do composer

- **Estados Visuais**
  - ✅ **Dentro da janela**: Campo habilitado, mensagens livres permitidas
  - ⚠️ **Próximo ao limite** (< 2h): Alerta amarelo com tempo restante
  - 🔒 **Fora da janela** (> 24h): Campo bloqueado + alerta vermelho
    - Mensagem clara: "Fora da janela de 24h. Envie um template."
    - Input desabilitado
    - Botão "Enviar Template" destacado

### ✅ Envio de Mensagens

**Mensagem Livre (dentro das 24h)**
- Validação de janela antes do envio
- Criação no banco com status `queued`
- Chamada à função placeholder `sendWhatsAppMessage()`
- Atualização de status após envio
- Atualização do preview da conversa
- Registro de evento no histórico

**Templates (fora das 24h)**
- Modal de seleção de templates
- Lista de templates mockados (5 exemplos):
  - `boas_vindas` (utility)
  - `confirmacao_pedido` (utility)
  - `lembrete_pagamento` (utility)
  - `promocao_mensal` (marketing)
  - `codigo_verificacao` (authentication)
- Suporte a variáveis/parâmetros
- Preview antes do envio
- Chamada à função placeholder `sendWhatsAppTemplate()`
- Registro como mensagem tipo `template`

### ✅ Gestão de Atendentes

**Atribuição de Conversas**
- `assignConversation(conversation_id, user_id)`
- Atualiza `conversations.assigned_user_id` e `assigned_at`
- Fecha assignment anterior (`unassigned_at`)
- Cria novo registro em `conversation_assignments`
- Registra evento em `conversation_events`

**UI de Atribuição**
- Dropdown com lista de atendentes disponíveis
- Filtro por unidade
- Visível para gestores
- Atualização em tempo real

### ✅ Tags e Status

**Sistema de Tags**
- Adicionar tags a conversas
- Tags com cores customizáveis
- Persistência em `conversation_tags`
- Visualização na lista e no chat
- Registro de eventos

**Gestão de Status**
- Dropdown de status no header
- 4 estados: `open`, `pending`, `waiting_customer`, `closed`
- Atualização imediata
- Registro de mudanças em `conversation_events`

### ✅ Funções Placeholder (Integração Futura)

```typescript
// Todas as funções estão em /src/app/lib/whatsapp.ts

// Enviar mensagem livre
sendWhatsAppMessage({ 
  conversationId, 
  contactPhone, 
  message 
})

// Enviar template aprovado
sendWhatsAppTemplate({ 
  conversationId, 
  contactPhone, 
  template_name, 
  language, 
  variables 
})

// Buscar templates disponíveis
fetchAvailableTemplates()

// Verificar janela de 24h
checkWhatsAppWindow(conversationId)
```

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
/src/app/
├── types/
│   └── database.ts          # Tipos TypeScript do banco
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   └── whatsapp.ts          # Funções placeholder Meta API
├── components/
│   ├── ConversationList.tsx # Lista de conversas (Inbox)
│   ├── ChatView.tsx         # Visualização do chat
│   ├── TemplateSelector.tsx # Modal de templates
│   └── ui/                  # Componentes shadcn/ui
└── App.tsx                  # Componente principal
```

### Fluxo de Dados

```
1. App.tsx
   ↓
2. ConversationList.tsx → Busca conversas do Supabase
   ↓ (onSelectConversation)
3. ChatView.tsx → Carrega mensagens + verifica janela 24h
   ↓
4. MessageComposer → Envia mensagem ou abre TemplateSelector
   ↓
5. Supabase → Persiste dados
   ↓
6. Placeholder API → Simula envio para WhatsApp
```

## 🔧 Boas Práticas Implementadas

✅ **Sem Hardcoding de IDs**
- Todos os IDs vêm do banco via queries
- UUIDs gerados automaticamente

✅ **Supabase como Source of Truth**
- Toda persistência via Supabase
- Subscriptions em tempo real
- Transações atômicas

✅ **Deduplicação de Mensagens**
- Campo `provider_message_id` único
- Previne duplicatas da API

✅ **Atualização de Preview**
- `last_message_preview` e `last_message_at` sempre atualizados
- Conversa sobe na lista ao receber mensagem

✅ **UI Preparada para Escala**
- Suporte a múltiplas unidades
- Múltiplos atendentes
- Sistema de permissões (roles)
- Base para métricas futuras

✅ **Histórico Completo**
- Tabela `conversation_events` registra tudo
- Auditoria de todas as ações
- Rastreabilidade total

## 🚀 Próximos Passos

### Integração com Meta WhatsApp Cloud API

Quando estiver pronto para conectar à API oficial:

1. **Configurar Credenciais**
   ```typescript
   // Adicionar ao .env
   WHATSAPP_ACCESS_TOKEN=your_token
   WHATSAPP_PHONE_NUMBER_ID=your_id
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
   ```

2. **Implementar Funções Reais**
   - Substituir placeholders em `/src/app/lib/whatsapp.ts`
   - Seguir documentação: https://developers.facebook.com/docs/whatsapp/cloud-api

3. **Configurar Webhooks**
   - Criar endpoint no servidor Supabase Edge Functions
   - Receber mensagens inbound
   - Atualizar status de mensagens

4. **Sincronizar Templates**
   - Buscar templates reais via API
   - Cachear localmente
   - Atualizar lista periodicamente

### Automações e IA

- **Bot de Respostas Automáticas**
  - Detectar intenções comuns
  - Responder FAQ automaticamente
  - Escalar para humano quando necessário

- **Métricas e Dashboards**
  - Tempo médio de resposta
  - Taxa de resolução
  - NPS por atendente
  - Horários de pico

- **Integrações**
  - CRM (Salesforce, HubSpot, etc.)
  - E-commerce (Shopify, WooCommerce)
  - Sistemas internos

## 📊 Modelo de Dados

Consulte `/SETUP_DATABASE.md` para:
- Scripts SQL completos
- Estrutura de tabelas
- Índices recomendados
- Políticas de segurança
- Dados de exemplo

## ⚠️ Notas Importantes

1. **Não Criar Novas Tabelas**
   - Use apenas as tabelas existentes
   - Estrutura foi cuidadosamente planejada

2. **Templates na Meta**
   - Templates devem ser criados e aprovados no Business Manager
   - UI apenas referencia templates existentes
   - Não há criação via interface

3. **Janela de 24h**
   - Regra do WhatsApp para conversas iniciadas pelo cliente
   - Fora da janela, apenas templates aprovados
   - Crucial para compliance

4. **Segurança**
   - Configure RLS (Row Level Security) no Supabase
   - Valide permissões por role
   - Proteja rotas sensíveis

## 🎨 UI/UX

- Design profissional inspirado em WhatsApp Web
- Responsivo (desktop first, adaptável a mobile)
- Feedback visual em todas as ações
- Estados de loading e erro tratados
- Acessibilidade (ARIA labels, keyboard navigation)

## 📝 Licença e Suporte

Sistema desenvolvido para uso interno B2B.
Para dúvidas ou sugestões, consulte a documentação técnica.

---

**Desenvolvido com ❤️ usando React, TypeScript, Tailwind CSS e Supabase**
