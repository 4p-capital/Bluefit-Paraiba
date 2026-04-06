# 📱 Sistema de Atendimento WhatsApp B2B

> Sistema profissional de gestão de atendimento via WhatsApp com suporte a múltiplas unidades, atendentes, tags e métricas. Pronto para integração com WhatsApp Cloud API da Meta.

![Status](https://img.shields.io/badge/status-ready-success)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue)
![React](https://img.shields.io/badge/react-18.3.1-61dafb)
![Supabase](https://img.shields.io/badge/supabase-integrated-green)

---

## 🚀 Início Rápido

```bash
# Sistema já está configurado e pronto para uso
# Basta executar os scripts SQL e começar a usar!
```

## 📚 Documentação

- **[GUIA_RAPIDO.md](./GUIA_RAPIDO.md)** - Comece por aqui! Guia rápido e visual
- **[README_SISTEMA.md](./README_SISTEMA.md)** - Documentação técnica completa
- **[SETUP_DATABASE.md](./SETUP_DATABASE.md)** - Scripts SQL e configuração do banco
- **[RESUMO_IMPLEMENTACAO.md](./RESUMO_IMPLEMENTACAO.md)** - Resumo da implementação

---

## ✨ Funcionalidades Principais

### 📬 **Inbox Inteligente**
- Lista de conversas estilo WhatsApp Web
- Filtros por status, unidade e atendente
- Busca em tempo real
- Atualização automática via Supabase Realtime

### 💬 **Chat Completo**
- Timeline de mensagens com histórico completo
- Status de entrega (enviado/entregue/lido)
- Suporte a templates do WhatsApp
- Interface intuitiva e responsiva

### ⏰ **Janela de 24 Horas**
- **Implementação 100% conforme regras do WhatsApp**
- Bloqueio automático após 24h da última mensagem do cliente
- Alertas visuais quando próximo ao limite
- Integração com sistema de templates

### 📋 **Templates do WhatsApp**
- Seletor profissional de templates
- Suporte a variáveis/parâmetros
- Preview antes do envio
- Categorização (Marketing, Utilidade, Autenticação)

### 👥 **Gestão de Atendimento**
- Atribuição de conversas a atendentes
- Sistema de múltiplas unidades/departamentos
- Tags coloridas e customizáveis
- Controle de status (aberto, pendente, aguardando, fechado)
- Histórico completo de eventos

---

## 🏗️ Arquitetura

```
React + TypeScript + Tailwind CSS
         ↓
    Supabase (Backend)
    • PostgreSQL
    • Realtime subscriptions
    • Row Level Security
         ↓
   WhatsApp Cloud API
   (Integração futura)
```

---

## 📊 Tecnologias

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Componentes:** Shadcn/UI (Radix UI)
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Formatação:** date-fns
- **Ícones:** Lucide React
- **Futuro:** WhatsApp Cloud API (Meta)

---

## 🎯 Status do Projeto

| Funcionalidade | Status |
|---------------|--------|
| Lista de Conversas | ✅ Completo |
| Chat/Timeline | ✅ Completo |
| Janela de 24h | ✅ Completo |
| Templates | ✅ Completo |
| Atribuição de Atendentes | ✅ Completo |
| Tags | ✅ Completo |
| Histórico de Eventos | ✅ Completo |
| Integração WhatsApp | 🔄 Pendente (placeholders prontos) |
| Métricas/Dashboards | 📋 Planejado |
| Automações/IA | 📋 Planejado |

---

## 🔧 Setup Inicial

### 1. Configure o Banco de Dados

```bash
# 1. Acesse seu projeto no Supabase
# 2. Vá em SQL Editor
# 3. Execute os scripts de SETUP_DATABASE.md
# 4. Configure RLS (Row Level Security)
```

### 2. Dados de Exemplo (Opcional)

```bash
# Execute os scripts de inserção de dados
# mockados para testar o sistema
```

### 3. Inicie o Desenvolvimento

```bash
# O sistema já está pronto!
# Abra no navegador e explore
```

---

## 🌟 Destaques Técnicos

### ✅ TypeScript 100%
- Tipos completos para todas as entidades
- Type-safe em todo o código
- Autocompletar e verificação de tipos

### ✅ Real-time
- Supabase Subscriptions
- Mensagens aparecem instantaneamente
- Sincronização automática entre dispositivos

### ✅ Clean Code
- Componentização adequada
- Separação de responsabilidades
- Código legível e manutenível

### ✅ Pronto para Escalar
- Suporte a múltiplas unidades
- Sistema de permissões (roles)
- Base para métricas e analytics

---

## 📋 Modelo de Dados

### Tabelas Principais
```
conversations ─┬─► contacts
               ├─► units
               ├─► profiles (assigned_user)
               └─► conversation_tags ─► tags

messages ──► conversations

conversation_events ──► conversations
```

**Veja [SETUP_DATABASE.md](./SETUP_DATABASE.md) para detalhes completos**

---

## 🔌 Integração com WhatsApp

### Funções Placeholder (Prontas para Substituir)

```typescript
// /src/app/lib/whatsapp.ts

✅ sendWhatsAppMessage() - Enviar mensagem livre
✅ sendWhatsAppTemplate() - Enviar template aprovado
✅ fetchAvailableTemplates() - Listar templates
✅ checkWhatsAppWindow() - Verificar janela 24h
```

### Próximos Passos

1. **Criar conta no Meta Business Manager**
2. **Configurar WhatsApp Business Account**
3. **Obter Access Token e Phone Number ID**
4. **Substituir placeholders com chamadas reais**
5. **Configurar webhooks para receber mensagens**

**Documentação:** https://developers.facebook.com/docs/whatsapp/cloud-api

---

## 📱 Screenshots (Conceituais)

### Inbox - Lista de Conversas
```
┌─────────────────────────────────────┐
│ 🔍 Buscar...                        │
│ [Status ▼] [Unidade ▼]              │
├─────────────────────────────────────┤
│ 🟢 Ana Paula        14:30           │
│    Olá! Gostaria de...              │
│    [Aberto] [@João] [#VIP]          │
├─────────────────────────────────────┤
│ 🔵 Bruno Costa      13:15           │
│    Perfeito! Obrigado...            │
│    [Aguardando] [@Maria]            │
├─────────────────────────────────────┤
│ 🟡 Carla Mendes     12:00           │
│    Preciso resolver...              │
│    [Pendente] [#Urgente]            │
└─────────────────────────────────────┘
```

### Chat - Conversa
```
┌─────────────────────────────────────┐
│ Ana Paula (+5511999999001)          │
│ [Atribuir ▼] [Status ▼] [Tags ▼]   │
├─────────────────────────────────────┤
│                                     │
│  ┌─ Olá! Gostaria de saber    14:25│
│  └─ mais sobre os produtos.        │
│                                     │
│              Olá Ana! Claro, ─┐14:26│
│              será um prazer...─┘ ✓✓ │
│                                     │
├─────────────────────────────────────┤
│ ⏰ Janela expira em 23h 35min       │
│ [Digite sua mensagem...        ] 📤 │
└─────────────────────────────────────┘
```

---

## 🎨 Personalização

### Cores
Edite `/src/styles/theme.css`:

```css
:root {
  --primary: #25D366; /* Verde WhatsApp */
  --secondary: #128C7E;
}
```

### Novos Status
Adicione em `/src/app/types/database.ts`

### Novos Campos
Estenda interfaces conforme necessidade

---

## 🔐 Segurança

- ✅ Row Level Security (RLS) configurável
- ✅ Validação de permissões por role
- ✅ Sanitização de inputs
- ✅ HTTPS obrigatório
- ✅ Tokens seguros (Supabase)

---

## 📈 Roadmap

### Fase 1 (Atual) ✅
- [x] Interface de atendimento
- [x] Gestão de conversas
- [x] Sistema de tags
- [x] Histórico de eventos

### Fase 2 (Próximo)
- [ ] Integração WhatsApp Cloud API
- [ ] Webhooks para receber mensagens
- [ ] Sincronização de templates reais

### Fase 3 (Futuro)
- [ ] Dashboard de métricas
- [ ] Relatórios e analytics
- [ ] Automações e respostas rápidas
- [ ] Integração com IA

### Fase 4 (Planejado)
- [ ] App mobile (React Native)
- [ ] Integrações CRM
- [ ] API pública
- [ ] Chatbots inteligentes

---

## 🤝 Contribuindo

Este é um projeto privado B2B. Para sugestões e melhorias, consulte a documentação técnica.

---

## 📞 Suporte

- 📖 Documentação: Veja arquivos `.md` na raiz
- 🔧 Issues técnicos: Consulte logs do Supabase
- 💬 WhatsApp API: https://developers.facebook.com/docs/whatsapp

---

## 📄 Licença

Sistema proprietário para uso interno B2B.

---

## 🎉 Agradecimentos

Desenvolvido com as melhores práticas e tecnologias modernas:
- React Team
- Supabase Team
- Shadcn/UI
- Radix UI
- Lucide Icons
- Meta WhatsApp Team

---

**Sistema desenvolvido com ❤️ usando React, TypeScript, Tailwind CSS e Supabase**

*Pronto para conectar com a WhatsApp Cloud API da Meta e escalar para múltiplas equipes!* 🚀
