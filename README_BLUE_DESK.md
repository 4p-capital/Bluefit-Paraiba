# 🌊 Blue Desk - Sistema de Atendimento WhatsApp

Sistema completo de atendimento via WhatsApp desenvolvido para a **Bluefit**, com dashboard analítico, notificações em tempo real, respostas rápidas e muito mais.

## ✨ Funcionalidades Principais

### 📊 Dashboard Analítico
- Métricas em tempo real com dados reais do banco
- 6 gráficos interativos modernos (Recharts)
- Análise de performance por atendente
- Tempo médio de resposta calculado
- Filtros de período (7, 30, 90 dias)

### 🔔 Notificações em Tempo Real
- WebSockets via Supabase Realtime
- Toast notifications
- Browser notifications
- Centro de notificações completo
- Marcação de lidas

### ⚡ Respostas Rápidas
- Biblioteca de respostas predefinidas
- Criar respostas personalizadas
- Sistema de favoritos
- Busca inteligente
- Contador de uso

### 🏷️ Sistema de Tags
- Tags predefinidas coloridas
- Criar tags customizadas
- Múltiplas tags por conversa
- 10 opções de cores

### 🕐 Horário de Atendimento
- Configuração por dia da semana
- Múltiplos períodos por dia
- Status em tempo real
- Resposta automática

### 🔍 Filtros Avançados
- Busca em tempo real
- Filtros por status, tags, atendente
- Combinação de múltiplos filtros
- Período personalizável

### 🎙️ Gravação de Áudio
- Gravaç��o em tempo real
- Pausar/Retomar
- Preview com player
- Upload automático

## 🚀 Tecnologias

- **Frontend**: React 18.3.1 + TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **Charts**: Recharts 2.15.2
- **Animations**: Motion (Framer Motion) 12.23.24
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Icons**: Lucide React
- **Dates**: date-fns 3.6.0
- **Notifications**: Sonner 2.0.3

## 📁 Estrutura do Projeto

```
/src/app/
├── components/
│   ├── AudioRecorder.tsx           # Gravador de áudio
│   ├── BusinessHours.tsx           # Horário de atendimento
│   ├── ChatView.tsx                # Visualização de chat
│   ├── ConversationFilters.tsx     # Filtros avançados
│   ├── ConversationList.tsx        # Lista de conversas
│   ├── NotificationCenter.tsx      # Central de notificações
│   ├── QuickReplies.tsx            # Respostas rápidas
│   ├── TagsManager.tsx             # Gerenciador de tags
│   └── ui/                         # Componentes Shadcn
├── pages/
│   ├── DashboardModule.tsx         # Dashboard analítico
│   ├── ConversationsModule.tsx     # Módulo de conversas
│   ├── ContactsModule.tsx          # Módulo de contatos
│   ├── ConfigModule.tsx            # Configurações
│   └── HomePage.tsx                # Página inicial
└── lib/
    ├── auth.ts                     # Autenticação
    ├── supabase.ts                 # Cliente Supabase
    └── whatsapp.ts                 # Integração WhatsApp
```

## 🎨 Cores da Bluefit

```css
--azul-bluefit: #0028e6;
--ciano-bluefit: #00e5ff;
--magenta-bluefit: #d10073;
--dark-bluefit: #600021;
```

## 📊 Banco de Dados

### Tabelas Principais
- `contacts` - Contatos do WhatsApp
- `conversations` - Conversas ativas
- `messages` - Mensagens enviadas/recebidas
- `profiles` - Usuários do sistema
- `units` - Unidades da Bluefit
- `cargos` - Cargos dos usuários

## 🧪 Como Testar

### Requisitos
1. Node.js 18+
2. Conta Supabase configurada
3. Tokens da Meta WhatsApp API

### Instalação
```bash
# Já está tudo instalado no Figma Make
# Sem necessidade de comandos adicionais
```

### Teste Rápido
1. Faça login no sistema
2. Acesse "Dashboard" na navegação
3. Verifique se os gráficos carregam com dados reais
4. Teste as notificações
5. Experimente as respostas rápidas
6. Configure horários de atendimento

Veja o arquivo `/GUIA_TESTE_RAPIDO.md` para checklist completo.

## 📖 Documentação

- 📄 **[RESUMO_COMPLETO_MELHORIAS.md](/RESUMO_COMPLETO_MELHORIAS.md)** - Visão geral completa
- 📊 **[DASHBOARD_MELHORIAS.md](/DASHBOARD_MELHORIAS.md)** - Detalhes do dashboard
- ✨ **[NOVAS_FUNCIONALIDADES.md](/NOVAS_FUNCIONALIDADES.md)** - Todas as funcionalidades
- 🧪 **[GUIA_TESTE_RAPIDO.md](/GUIA_TESTE_RAPIDO.md)** - Como testar tudo
- 🔍 **[SQL_QUERIES_DEBUG.sql](/SQL_QUERIES_DEBUG.sql)** - Queries úteis para debug

## 🎯 Roadmap

### Implementado ✅
- [x] Dashboard com dados reais
- [x] Notificações em tempo real
- [x] Respostas rápidas
- [x] Sistema de tags
- [x] Horário de atendimento
- [x] Filtros avançados
- [x] Gravação de áudio

### Próximos Passos 🚧
- [ ] Exportar relatórios PDF/Excel
- [ ] Chatbot com IA
- [ ] Análise de sentimento
- [ ] Integração Instagram/Facebook
- [ ] Sistema de metas
- [ ] NPS/CSAT

## 🐛 Troubleshooting

### Dashboard não carrega
```sql
-- Verificar se há dados
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM messages;
```

### Notificações não funcionam
```javascript
// Console F12
console.log(Notification.permission);
```

### Performance lenta
```sql
-- Criar índices necessários
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

Veja `/SQL_QUERIES_DEBUG.sql` para mais queries.

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação em `/docs`
2. Consulte os arquivos de troubleshooting
3. Entre em contato com o time de desenvolvimento

## 📄 Licença

© 2025 Bluefit - Todos os direitos reservados

---

**Desenvolvido com ❤️ para a Bluefit**

*Blue Desk v2.0 - Sistema Completo de Atendimento WhatsApp*
