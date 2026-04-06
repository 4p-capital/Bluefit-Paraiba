# 🟢 Sistema de Presença em Tempo Real - Blue Desk

## 📋 Visão Geral

Implementação completa de **Supabase Realtime Presence** para rastrear status de atendentes (online/ausente/ocupado/offline) em tempo real, com **lógica inteligente de modo automático vs manual** e **auditoria completa no banco de dados**.

---

## 🏗️ Arquitetura

### **1. Hook `usePresence`** (`/src/app/hooks/usePresence.ts`)

Hook centralizado que gerencia toda a lógica de presença:

#### Funcionalidades:
- ✅ **Conexão automática** ao canal `presence-attendants` no login
- ✅ **Rastreamento em tempo real** de todos os usuários conectados
- ✅ **Detecção de inatividade** (5 minutos sem atividade → status "away")
- ✅ **Lógica inteligente** - diferencia mudanças manuais vs automáticas
- ✅ **Auditoria completa** - registra todas as mudanças na tabela `conversation_events`
- ✅ **Desconexão automática** ao fechar o navegador
- ✅ **API simples** para consultar e alterar status

#### Estados de Presença:
```typescript
type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';
type PresenceMode = 'available' | 'manual';
```

**Status:**
- 🟢 **Online** - Ativo e disponível
- 🟡 **Ausente** - Inativo há 5+ minutos ou manualmente
- 🔴 **Ocupado** - Definido manualmente
- ⚪ **Offline** - Desconectado

**Modos:**
- 🔓 **Available (Disponível)** - Modo automático: alterna entre online/ausente baseado em atividade
- 🔒 **Manual** - Status fixo: não muda automaticamente, apenas por escolha do usuário

---

## 🎯 Lógica Inteligente de Status

### **🔓 Modo "Disponível" (Automático)**

Quando o usuário está em modo "Disponível":
1. ✅ **Ativo** → Status = "Online"
2. ✅ **Inativo 5+ min** → Status = "Ausente" (automático)
3. ✅ **Ativo novamente** → Status = "Online" (automático)
4. ✅ Mudanças **não bloqueiam** a automação

**Exemplo:**
```
Login → Online (automático)
↓
5 min sem atividade → Ausente (automático)
↓
Mexe o mouse → Online (automático)
```

---

### **🔒 Modo "Manual"**

Quando o usuário escolhe "Ocupado" ou "Ausente" manualmente:
1. ❌ **Detecção de inatividade DESATIVADA**
2. ❌ **Atividade NÃO muda o status**
3. ✅ **Status mantido até** o usuário escolher "Disponível"

**Exemplo:**
```
Online → Usuário escolhe "Ocupado" (manual)
↓
Mexe o mouse → Ocupado (mantém)
↓
5 min inativo → Ocupado (mantém)
↓
Usuário escolhe "Disponível" → Online (volta ao automático)
```

---

## 📝 Auditoria no Banco de Dados

Todas as mudanças de status são registradas na tabela **`conversation_events`**:

### **Estrutura do Evento:**
```typescript
{
  event_type: 'user_status_changed',
  actor_user_id: 'uuid-do-usuario',
  details: {
    from_status: 'online',
    to_status: 'busy',
    mode: 'manual',
    changed_at: '2025-01-27T10:30:00Z',
    is_manual: true
  }
}
```

### **Tipos de Registro:**
1. ✅ **Login** → `offline` → `online` (available)
2. ✅ **Inatividade** → `online` → `away` (available)
3. ✅ **Volta automática** → `away` → `online` (available)
4. ✅ **Mudança manual** → `online` → `busy` (manual)
5. ✅ **Volta ao automático** → `busy` → `online` (available)

---

## 🎨 Componentes UI

### **1. PresenceIndicator** (`/src/app/components/PresenceIndicator.tsx`)

Bolinha colorida que indica o status de presença.

**Props:**
```typescript
interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}
```

**Exemplo:**
```tsx
<PresenceIndicator status="online" size="sm" />
```

---

### **2. StatusSelector** (`/src/app/components/StatusSelector.tsx`)

Dropdown para o usuário controlar seu próprio status.

**Opções:**
- 🟢 **Disponível** - Modo automático (online quando ativo, ausente quando inativo)
- 🔴 **Ocupado** - Modo manual (não receberá atribuições)
- 🟡 **Ausente** - Modo manual (temporariamente fora)

**Funcionalidades:**
- ✅ Mostra status atual com indicador visual
- ✅ Permite trocar entre Disponível/Ocupado/Ausente
- ✅ Estilizado para fundo azul do navigation
- ✅ Exibe descrição de cada modo

**Localização:** Barra de navegação superior (ao lado do menu de usuário)

---

## 🔧 Implementação

### **1. Navigation Bar** (`/src/app/components/Navigation.tsx`)

```tsx
import { StatusSelector } from './StatusSelector';

// Dentro do component:
<div className="hidden lg:flex items-center gap-3">
  <StatusSelector />
  {/* ... menu de usuário ... */}
</div>
```

---

### **2. ChatView** (`/src/app/components/ChatView.tsx`)

Mostra indicadores de presença no dropdown de atendentes:

```tsx
import { usePresence } from '../hooks/usePresence';
import { PresenceIndicator } from './PresenceIndicator';

const { getUserStatus, getUserMode } = usePresence();

// No dropdown de atendentes:
{availableAttendants.map(attendant => {
  const presenceStatus = getUserStatus(attendant.id);
  const userMode = getUserMode(attendant.id);
  
  return (
    <SelectItem key={attendant.id} value={attendant.id}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <div className="absolute -bottom-0.5 -right-0.5">
            <PresenceIndicator status={presenceStatus} size="sm" />
          </div>
        </div>
        {/* ... resto do item ... */}
      </div>
    </SelectItem>
  );
})}
```

---

## 📡 Funcionamento Técnico

### **Inicialização (Login)**

1. Usuário faz login
2. `usePresence` cria canal Supabase: `presence-attendants`
3. Usuário é rastreado com status `online` e modo `available`
4. Listeners de atividade são ativados (mouse, teclado, scroll)
5. **📝 Registro no banco:** `offline` → `online` (available)

### **Sincronização em Tempo Real**

```typescript
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    // Atualiza mapa de usuários online
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('✅ Usuário entrou:', key);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('❌ Usuário saiu:', key);
  });
```

### **Detecção de Inatividade (Modo Available)**

```typescript
// Verificação a cada 30 segundos
setInterval(() => {
  // ⚠️ IMPORTANTE: Só aplicar se estiver em modo "available"
  if (modeRef.current !== 'available') {
    console.log('🔒 Modo manual ativo, ignorando automação');
    return;
  }

  const inactive = now - lastActivity > 5 * 60 * 1000; // 5 minutos
  
  if (inactive && statusRef.current === 'online') {
    updateStatus('away'); // 📝 Registra no banco
  } else if (!inactive && statusRef.current === 'away') {
    updateStatus('online'); // 📝 Registra no banco
  }
}, 30000);
```

### **Mudança Manual de Status**

```typescript
async function changeStatus(newStatusOrMode: PresenceStatus | 'available') {
  const oldStatus = statusRef.current;
  
  // 🟢 Caso especial: "available" → volta ao modo automático
  if (newStatusOrMode === 'available') {
    await presenceChannel.track({
      status: 'online',
      mode: 'available'
    });
    
    // 📝 Registrar volta ao modo automático
    await logStatusChange(userId, oldStatus, 'online', 'available');
    return;
  }

  // 🔒 Status manual (away ou busy)
  await presenceChannel.track({
    status: newStatusOrMode,
    mode: 'manual'
  });
  
  // 📝 Registrar mudança manual no banco
  await logStatusChange(userId, oldStatus, newStatusOrMode, 'manual');
}
```

### **Função de Auditoria**

```typescript
async function logStatusChange(
  userId: string, 
  fromStatus: PresenceStatus, 
  toStatus: PresenceStatus, 
  mode: PresenceMode
) {
  await supabase
    .from('conversation_events')
    .insert({
      event_type: 'user_status_changed',
      actor_user_id: userId,
      details: {
        from_status: fromStatus,
        to_status: toStatus,
        mode: mode,
        changed_at: new Date().toISOString(),
        is_manual: mode === 'manual'
      }
    });
}
```

### **Desconexão (Logout/Fechar Navegador)**

```typescript
// Cleanup automático
return () => {
  channel.untrack(); // Remove presença
  supabase.removeChannel(channel);
};
```

---

## 🎯 API do Hook

### **Retornos:**

```typescript
const {
  onlineUsers,      // Map<userId, UserPresence>
  myStatus,         // PresenceStatus do usuário atual
  myMode,           // PresenceMode do usuário atual
  changeStatus,     // (newStatusOrMode) => Promise<void>
  getUserStatus,    // (userId) => PresenceStatus
  getUserMode,      // (userId) => PresenceMode
  currentUserId,    // string | null
} = usePresence();
```

### **Exemplos de Uso:**

```typescript
// Obter status de um usuário específico
const status = getUserStatus('user-123'); // 'online' | 'away' | 'busy' | 'offline'
const mode = getUserMode('user-123'); // 'available' | 'manual'

// Alterar status manualmente
await changeStatus('busy'); // Modo manual

// Voltar ao modo automático
await changeStatus('available'); // Modo available

// Listar todos os usuários online
onlineUsers.forEach((presence, userId) => {
  console.log(`${userId}: ${presence.status} (${presence.mode})`);
});
```

---

## 🚀 Benefícios

1. ✅ **Sem polling** - Conexão WebSocket permanente
2. ✅ **Escalável** - Supabase gerencia a infraestrutura
3. ✅ **Sem tabelas extras** - Não ocupa espaço no banco (apenas auditoria)
4. ✅ **Automático** - Detecta desconexões sem código extra
5. ✅ **Performático** - Apenas dados em memória
6. ✅ **Confiável** - Tecnologia nativa do Supabase
7. ✅ **Inteligente** - Respeita escolhas manuais do usuário
8. ✅ **Auditável** - Histórico completo de mudanças

---

## 🔍 Monitoramento

Logs detalhados no console:

```
🟢 [PRESENCE] Inicializando presença para: abc123
✅ [PRESENCE] Conectado ao canal de presença
🔄 [PRESENCE] Sync recebido: {...}
👥 [PRESENCE] Usuários online: 3
🟡 [PRESENCE] Usuário inativo há 5+ minutos, mudando para AWAY
📝 [PRESENCE] Registrando mudança de status no banco
🔒 [PRESENCE] Mudando status MANUALMENTE para: BUSY
🔓 [PRESENCE] Voltando ao modo AUTOMÁTICO (disponível)
✅ [PRESENCE] Usuário entrou: def456
❌ [PRESENCE] Usuário saiu: ghi789
```

---

## 🎨 Indicadores Visuais

### **Cores:**
- 🟢 Verde (`bg-green-500`) → Online
- 🟡 Amarelo (`bg-yellow-500`) → Ausente
- 🔴 Vermelho (`bg-red-500`) → Ocupado
- ⚪ Cinza (`bg-gray-400`) → Offline

### **Locais Exibidos:**
1. **Navigation Bar** - StatusSelector (controle do próprio status)
2. **ChatView** - Dropdown de atendentes (ver status dos outros)
3. **Futuro** - Lista de atendentes online, dashboard de presença

---

## 📊 Exemplos de Fluxos

### **Fluxo 1: Modo Automático (Normal)**
```
1. Login → Online (auto) 📝
2. Trabalha 3h → Online (auto)
3. Vai ao banheiro (5+ min) → Ausente (auto) 📝
4. Volta e mexe o mouse → Online (auto) 📝
5. Logout → Offline 📝
```

### **Fluxo 2: Modo Manual (Reunião)**
```
1. Login → Online (auto) 📝
2. Antes da reunião, escolhe "Ocupado" → Ocupado (manual) 📝
3. Durante reunião, mexe o mouse → Ocupado (mantém)
4. Reunião acaba, escolhe "Disponível" → Online (auto) 📝
5. Inativo 5+ min → Ausente (auto) 📝
```

### **Fluxo 3: Modo Manual (Pausa Almoço)**
```
1. Trabalha normalmente → Online (auto)
2. Vai almoçar, escolhe "Ausente" → Ausente (manual) 📝
3. 30 min depois → Ausente (mantém)
4. Volta do almoço, escolhe "Disponível" → Online (auto) 📝
```

---

## 🔮 Próximas Melhorias

- [ ] Histórico de presença (tempo total online por dia)
- [ ] Notificações quando atendentes específicos ficam online
- [ ] Dashboard com métricas de disponibilidade
- [ ] Integração com sistema de pausas/breaks
- [ ] Status customizados ("Em reunião", "Almoço", etc)
- [ ] Relatórios de produtividade baseados em presença
- [ ] Sincronização com calendário (reuniões → ocupado)

---

## 📚 Referências

- [Supabase Realtime Presence Docs](https://supabase.com/docs/guides/realtime/presence)
- [Supabase Channels API](https://supabase.com/docs/reference/javascript/subscribe)

---

## 🎯 Conclusão

Sistema completo, escalável e em tempo real para rastreamento de presença de atendentes, com **lógica inteligente que respeita escolhas manuais** e **auditoria completa no banco de dados**. Totalmente integrado com a interface Blue Desk! 🚀