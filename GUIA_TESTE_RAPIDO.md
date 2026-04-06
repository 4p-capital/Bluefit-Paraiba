# 🧪 Guia de Teste Rápido - Blue Desk

## ✅ Checklist de Testes

### 1. 📊 Dashboard (PRIORIDADE ALTA)

#### Teste Básico
```
1. Login no sistema
2. Clique em "Dashboard" na navegação
3. Aguarde carregamento (5-10 segundos)
```

#### O que deve aparecer:
- ✅ 4 cards de métricas no topo
- ✅ 6 gráficos modernos
- ✅ Dados reais (não zeros)
- ✅ Loading state durante carregamento
- ✅ Botões de período (7d, 30d, 90d)

#### Testes Interativos:
```
1. Clique em "30 dias" → Dados devem atualizar
2. Clique em "90 dias" → Dados devem atualizar
3. Passe o mouse nos gráficos → Tooltip deve aparecer
4. Verifique se os números fazem sentido
```

#### Console (F12):
```javascript
// Deve aparecer:
"📊 Carregando dados do dashboard..."
"✅ Conversas carregadas: X"
"✅ Mensagens carregadas: X"
"✅ Contatos novos: X"
```

#### Possíveis Erros:
```
❌ "Erro ao carregar dados do dashboard"
→ Verificar conexão com Supabase
→ Verificar permissões das tabelas
→ Verificar se há dados nas tabelas
```

---

### 2. 🔔 Notificações (TESTE REALTIME)

#### Teste Manual:
```
1. Abra o sistema em 2 abas diferentes
2. Na aba 2: Envie uma mensagem
3. Na aba 1: Deve aparecer notificação
```

#### O que verificar:
- ✅ Ícone de sino na navegação
- ✅ Badge com contador
- ✅ Toast notification aparece
- ✅ Som (se configurado)
- ✅ Centro de notificações funciona

#### Console:
```javascript
"🔔 Nova mensagem recebida: [objeto]"
"🔔 Nova conversa criada: [objeto]"
```

---

### 3. ⚡ Respostas Rápidas

#### Teste:
```
1. Abra uma conversa
2. Clique no ícone ⚡ (raio)
3. Dialog deve abrir com respostas
4. Busque por "saudação"
5. Clique em uma resposta
6. Mensagem deve ser inserida no campo
```

#### Criar Nova:
```
1. No dialog, clique em "+ Nova"
2. Preencha título e mensagem
3. Salve
4. Deve aparecer na lista
```

---

### 4. 🏷️ Tags

#### Teste:
```
1. Abra uma conversa
2. Clique em "Adicionar tag"
3. Selecione "Vendas"
4. Salve
5. Badge verde "Vendas" deve aparecer
```

#### Criar Tag:
```
1. No dialog de tags, clique "+ Nova Tag"
2. Digite nome e escolha cor
3. Salve
4. Deve aparecer na lista
```

---

### 5. 🕐 Horário de Atendimento

#### Teste:
```
1. Configurações → Horário de Atendimento
2. Veja status atual (Aberto/Fechado)
3. Altere horário de segunda-feira
4. Salve
5. Mensagem "Salvo com sucesso"
```

#### Validar Cálculo:
```
- Se for 10h e você configurou 8h-18h
  → Status deve ser "🟢 Aberto"
  
- Se for 20h e você configurou 8h-18h
  → Status deve ser "🔴 Fechado"
```

---

### 6. 🔍 Filtros de Conversas

#### Teste:
```
1. Módulo Conversas
2. Digite na busca: nome de um contato
3. Lista deve filtrar em tempo real
4. Clique em "Filtros"
5. Selecione "Abertas"
6. Clique em "Não lidas"
7. Deve mostrar apenas conversas abertas e não lidas
```

---

### 7. 🎙️ Gravador de Áudio

#### Teste Permissão:
```
1. Clique no botão de microfone
2. Navegador pede permissão
3. Clique "Permitir"
4. Gravação inicia automaticamente
```

#### Teste Gravação:
```
1. Fale algo
2. Timer deve contar
3. Clique "Pausar"
4. Timer para
5. Clique "Retomar"
6. Continue falando
7. Clique "Parar"
8. Player de preview aparece
9. Clique play para ouvir
10. Clique "Enviar"
11. Áudio deve ser enviado
```

---

## 🐛 Troubleshooting

### Dashboard não carrega dados

**Sintoma**: Gráficos vazios ou zeros

**Soluções**:
```sql
-- 1. Verificar se há dados
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM messages;
SELECT COUNT(*) FROM contacts;

-- 2. Verificar datas
SELECT created_at FROM conversations ORDER BY created_at DESC LIMIT 5;

-- 3. Testar query manual
SELECT * FROM conversations 
WHERE created_at >= NOW() - INTERVAL '7 days';
```

**Console**:
```javascript
// Abra F12 e veja os erros
// Procure por:
"❌ Erro ao carregar dados"
"error:"
"Failed to fetch"
```

---

### Notificações não aparecem

**Possíveis causas**:
1. Realtime não configurado no Supabase
2. Permissões RLS bloqueando
3. Navegador bloqueou notificações

**Teste**:
```javascript
// No console:
if ('Notification' in window) {
  console.log('Permissão:', Notification.permission);
  // Deve retornar: "granted", "denied", ou "default"
}
```

---

### Respostas Rápidas não salvam

**Verificar**:
```javascript
// Console F12:
localStorage.getItem('quick_replies_[USER_ID]')
// Deve retornar JSON com as respostas
```

**Limpar cache**:
```javascript
// No console:
localStorage.clear();
// Depois recarregue a página
```

---

### Tags não aparecem

**Verificar tabela**:
```sql
-- Verificar se coluna tags existe
SELECT tags FROM conversations LIMIT 1;

-- Se não existir, criar:
ALTER TABLE conversations ADD COLUMN tags TEXT[];
```

---

## ✅ Checklist Final

Antes de considerar completo, teste:

- [ ] Dashboard carrega com dados reais
- [ ] Gráficos são interativos (tooltip funciona)
- [ ] Filtros de período funcionam (7d, 30d, 90d)
- [ ] Notificações aparecem em tempo real
- [ ] Toast notifications funcionam
- [ ] Respostas rápidas podem ser criadas
- [ ] Respostas rápidas podem ser editadas
- [ ] Busca de respostas funciona
- [ ] Tags podem ser adicionadas
- [ ] Tags podem ser removidas
- [ ] Tags customizadas podem ser criadas
- [ ] Horário de atendimento pode ser configurado
- [ ] Status aberto/fechado é calculado corretamente
- [ ] Resposta automática pode ser ativada
- [ ] Filtros de conversas funcionam
- [ ] Combinação de filtros funciona
- [ ] Badges de filtros são removíveis
- [ ] Gravador de áudio pede permissão
- [ ] Gravação funciona
- [ ] Pause/Resume funcionam
- [ ] Preview de áudio funciona
- [ ] Envio de áudio funciona

---

## 📊 Dados de Teste

Se não houver dados suficientes no banco:

### SQL para criar dados de teste:
```sql
-- Criar contatos de teste
INSERT INTO contacts (wa_id, phone_number, display_name, first_name, last_name)
VALUES 
  ('5511999999999', '+5511999999999', 'João Silva', 'João', 'Silva'),
  ('5511888888888', '+5511888888888', 'Maria Santos', 'Maria', 'Santos'),
  ('5511777777777', '+5511777777777', 'Pedro Oliveira', 'Pedro', 'Oliveira');

-- Criar conversas de teste
INSERT INTO conversations (contact_id, status, created_at)
SELECT id, 'open', NOW() - INTERVAL '1 day'
FROM contacts LIMIT 3;

-- Criar mensagens de teste
INSERT INTO messages (conversation_id, direction, type, body, created_at)
SELECT 
  c.id, 
  'inbound', 
  'text', 
  'Mensagem de teste',
  NOW() - INTERVAL '1 hour'
FROM conversations c LIMIT 10;
```

---

## 🎯 Performance Esperada

### Tempos de Carregamento:

| Ação | Tempo Esperado |
|------|----------------|
| Dashboard (7 dias) | 500-800ms |
| Dashboard (30 dias) | 1-2s |
| Dashboard (90 dias) | 2-4s |
| Abrir notificações | <100ms |
| Filtrar conversas | <200ms |
| Criar resposta rápida | <100ms |
| Adicionar tag | <500ms |

---

## 📱 Teste em Dispositivos

### Desktop
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Mobile
- ✅ Chrome Android
- ✅ Safari iOS

### Resoluções
- ✅ 1920x1080 (Desktop)
- ✅ 1366x768 (Laptop)
- ✅ 768x1024 (Tablet)
- ✅ 375x667 (Mobile)

---

## 🎨 Validação Visual

### Cores devem estar corretas:
- Azul Bluefit: `#0028e6`
- Ciano Bluefit: `#00e5ff`
- Magenta Bluefit: `#d10073`

### Fontes devem estar legíveis:
- Títulos: Bold
- Corpo: Regular
- Tamanhos responsivos

### Ícones devem estar alinhados:
- Centrados verticalmente
- Tamanho consistente
- Cor apropriada

---

## 🚀 Go Live Checklist

Antes de mostrar para o cliente:

- [ ] Todos os testes acima passaram
- [ ] Sem erros no console
- [ ] Performance aceitável
- [ ] Responsivo em mobile
- [ ] Dados reais carregando
- [ ] Notificações funcionando
- [ ] Screenshots/vídeo preparados
- [ ] Documentação atualizada

---

**Boa sorte nos testes! 🎉**

Se encontrar algum problema, verifique:
1. Console do navegador (F12)
2. Logs do Supabase
3. Permissões RLS
4. Dados nas tabelas
