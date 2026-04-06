# 📱 Guia de Testes Mobile - Blue Desk

## 🎯 Como Testar no Navegador

### Método 1: Chrome DevTools (Recomendado)

```
1. Abrir o Blue Desk no Chrome
2. Pressionar F12 (ou Ctrl+Shift+I)
3. Pressionar Ctrl+Shift+M (ou clicar no ícone 📱)
4. Selecionar dispositivo no dropdown
```

**Dispositivos para Testar:**
- **iPhone SE** (375 x 667) - Tela pequena
- **iPhone 12 Pro** (390 x 844) - Tela média
- **iPhone 14 Pro Max** (430 x 932) - Tela grande
- **Pixel 5** (393 x 851) - Android padrão
- **iPad Air** (820 x 1180) - Tablet

---

## ✅ Checklist de Testes

### 📧 Módulo de Conversas

#### Tela de Lista (Mobile)
```
✅ Teste 1: Visualização da Lista
- [ ] Header com gradiente azul visível
- [ ] Título "Conversas" legível
- [ ] Botão "Novo" (+) visível e tocável
- [ ] Lista de conversas ocupa toda largura
- [ ] Scroll vertical funciona suavemente
- [ ] Cards de conversa são tocáveis
```

#### Tela de Chat (Mobile)
```
✅ Teste 2: Abertura do Chat
- [ ] Clicar em uma conversa abre o chat
- [ ] Lista de conversas desaparece
- [ ] Chat ocupa tela inteira
- [ ] Botão voltar (←) aparece no topo
- [ ] Nome do contato visível
- [ ] Telefone visível abaixo do nome
```

```
✅ Teste 3: Navegação
- [ ] Clicar em "←" volta para lista
- [ ] Transição é suave
- [ ] Nenhum conteúdo fica cortado
- [ ] Scroll mantém posição na lista
```

#### Header do Chat (Mobile)
```
✅ Teste 4: Controles Compactos
- [ ] Avatar do contato menor (36px)
- [ ] Nome do contato legível
- [ ] Seletor de atendente visível
- [ ] Botões mostram apenas ícones
- [ ] Não há overflow horizontal
- [ ] Botões são tocáveis (min 32px)
```

#### Área de Mensagem (Mobile)
```
✅ Teste 5: Input de Mensagem
- [ ] Textarea ocupa largura adequada
- [ ] Botões de emoji/template visíveis
- [ ] Ícones não muito pequenos
- [ ] Botão enviar (avião) visível
- [ ] Teclado virtual não sobrepõe input
- [ ] Enter envia mensagem
```

---

### 👥 Módulo de Contatos

#### Header e Filtros (Mobile)
```
✅ Teste 6: Header Responsivo
- [ ] Título "Contatos" visível
- [ ] Botão "Novo Contato" em largura total
- [ ] Campo de busca em largura total
- [ ] Dropdown "Unidade" empilhado
- [ ] Dropdown "Situação" empilhado
- [ ] Todos inputs com altura uniforme
```

#### Visualização Cards (Mobile)
```
✅ Teste 7: Cards de Contatos
- [ ] Contatos aparecem como cards
- [ ] Avatar circular visível (48px)
- [ ] Nome em negrito e legível
- [ ] Badge de situação colorido
- [ ] Telefone formatado corretamente
- [ ] Unidade visível com ícone
- [ ] 3 botões em grid (largura igual)
```

```
✅ Teste 8: Ações nos Cards
- [ ] Botão "Editar" (magenta) tocável
- [ ] Botão "Excluir" (vermelho) tocável
- [ ] Botão "Chat" (azul) tocável
- [ ] Ícones visíveis em cada botão
- [ ] Feedback visual ao tocar
- [ ] Nenhum botão cortado
```

#### Tabela Desktop (Verificar que NÃO aparece)
```
✅ Teste 9: Tabela Hidden em Mobile
- [ ] Tabela não aparece em mobile
- [ ] Apenas cards visíveis
- [ ] Nenhum elemento de tabela vazando
```

---

### 💬 Chat View Detalhado

#### Botões de Ação (Mobile)
```
✅ Teste 10: Barra de Ferramentas
- [ ] Botão emoji (😊) amarelo visível
- [ ] Botão template (📄) magenta visível
- [ ] Botão imagem (🖼️) ciano visível
- [ ] Botão arquivo (📎) marrom visível
- [ ] Espaçamento adequado entre ícones
- [ ] Todos botões tocáveis (32px min)
```

```
✅ Teste 11: Emoji Picker
- [ ] Clicar em 😊 abre picker
- [ ] Picker aparece acima do botão
- [ ] Picker responsivo (280x350)
- [ ] Busca de emoji funciona
- [ ] Clicar em emoji adiciona ao texto
- [ ] Fechar picker funciona
```

#### Mensagens (Mobile)
```
✅ Teste 12: Bolhas de Mensagem
- [ ] Mensagens recebidas à esquerda
- [ ] Mensagens enviadas à direita
- [ ] Texto legível (min 12px)
- [ ] Hora visível abaixo
- [ ] Status de envio visível (✓✓)
- [ ] Imagens responsivas
- [ ] Vídeos com controles
- [ ] Áudios reproduzem
```

---

## 🎨 Testes Visuais

### Cores Bluefit
```
✅ Teste 13: Paleta de Cores
- [ ] Azul Bluefit #0028e6 no header
- [ ] Ciano #00e5ff em badges
- [ ] Magenta #d10073 em destaque
- [ ] Dark #600021 em elementos secundários
- [ ] Branco #ffffff em backgrounds
```

### Tipografia
```
✅ Teste 14: Fontes e Tamanhos
- [ ] Títulos em 14-16px (mobile)
- [ ] Corpo em 12-14px (mobile)
- [ ] Labels em 10-12px (mobile)
- [ ] Todas fontes legíveis
- [ ] Hierarquia visual clara
```

### Espaçamento
```
✅ Teste 15: Grid de 8pt
- [ ] Padding de 8px, 16px ou 24px
- [ ] Gaps de 4px, 8px ou 12px
- [ ] Margens consistentes
- [ ] Alinhamento preciso
```

---

## 🔄 Testes de Interação

### Toque e Gestos
```
✅ Teste 16: Áreas Tocáveis
- [ ] Botões min 44x44px (iOS)
- [ ] Botões min 48x48px (Android)
- [ ] Espaçamento entre botões (8px+)
- [ ] Feedback visual ao tocar
- [ ] Sem toques acidentais
```

### Scroll
```
✅ Teste 17: Comportamento de Scroll
- [ ] Scroll suave e natural
- [ ] Momentum scrolling funciona
- [ ] Scroll não trava
- [ ] Headers fixos quando aplicável
- [ ] Pull-to-refresh desabilitado
```

### Formulários
```
✅ Teste 18: Inputs e Teclado
- [ ] Teclado não sobrepõe input
- [ ] Auto-scroll ao focar input
- [ ] Teclado numérico para telefone
- [ ] Teclado email para email
- [ ] Enter envia formulário
- [ ] ESC fecha modals
```

---

## 📊 Testes de Performance

### Carregamento
```
✅ Teste 19: Tempo de Carregamento
- [ ] Página carrega em < 2s
- [ ] Imagens lazy-load
- [ ] Skeleton loaders visíveis
- [ ] Sem layout shift (CLS baixo)
```

### Animações
```
✅ Teste 20: Transições
- [ ] Transições suaves (< 300ms)
- [ ] Sem jank ou travamento
- [ ] Animations otimizadas
- [ ] Sem flicker
```

---

## 🌐 Testes de Navegador

### Navegadores Mobile
```
✅ Teste 21: Compatibilidade
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Firefox Android
- [ ] Samsung Internet
- [ ] Edge Mobile
```

### Recursos Específicos
```
✅ Teste 22: APIs Web
- [ ] Geolocation (se usado)
- [ ] Camera API (para imagens)
- [ ] Notifications (se habilitado)
- [ ] Service Workers (PWA)
- [ ] LocalStorage/IndexedDB
```

---

## 🐛 Testes de Edge Cases

### Conteúdo Extremo
```
✅ Teste 23: Textos Longos
- [ ] Nome muito longo trunca (...)
- [ ] Telefone longo não quebra layout
- [ ] Mensagem longa quebra corretamente
- [ ] Sem overflow horizontal
```

### Estados Vazios
```
✅ Teste 24: Estados Empty
- [ ] "Nenhuma conversa" aparece bem
- [ ] "Nenhum contato" centralizado
- [ ] Ícones e mensagens alinhadas
- [ ] Call-to-action visível
```

### Erros
```
✅ Teste 25: Tratamento de Erros
- [ ] Mensagem de erro legível
- [ ] Toast não sobrepõe conteúdo
- [ ] Retry funcional
- [ ] Erro não quebra layout
```

---

## 📱 Testes em Dispositivo Real

### Como Testar no Celular Real

**Opção 1: Network Local**
```bash
# No terminal do projeto:
npm run dev -- --host

# Acesse no celular:
http://SEU_IP:5173
```

**Opção 2: ngrok (Recomendado)**
```bash
# Instalar ngrok
npm install -g ngrok

# Iniciar túnel
ngrok http 5173

# Acessar URL fornecida no celular
```

**Opção 3: Chrome Remote Debugging**
```
1. Conectar celular via USB
2. Habilitar "Depuração USB" no Android
3. Abrir chrome://inspect no desktop
4. Selecionar dispositivo conectado
```

---

## ✅ Checklist Final

### Antes de Aprovar
```
- [ ] Todos testes acima passaram
- [ ] Testado em 3+ dispositivos
- [ ] Testado em 2+ navegadores
- [ ] Sem erros no console
- [ ] Performance aceitável (< 2s)
- [ ] Acessibilidade básica OK
- [ ] Nenhum overflow horizontal
- [ ] Todos botões funcionais
- [ ] Textos legíveis
- [ ] Cores conforme brand
```

---

## 🎯 Comandos Rápidos

### Abrir DevTools Mobile
```
Windows/Linux: Ctrl + Shift + M
Mac: Cmd + Shift + M
```

### Simular Toque
```
DevTools → ⋮ → More tools → Sensors
Alterar "Touch" para "Force touch"
```

### Visualizar Diferentes DPIs
```
DevTools → Device toolbar → DPR dropdown
Testar 1x, 2x, 3x
```

### Network Throttling
```
DevTools → Network → Throttling
Testar: Fast 3G, Slow 3G, Offline
```

---

## 📝 Template de Reporte de Bug

```markdown
### Bug Mobile - [Título]

**Dispositivo:** iPhone 12 Pro / Chrome 120
**Viewport:** 390 x 844
**Módulo:** Conversas / Contatos / Chat

**Passos para Reproduzir:**
1. Abrir módulo X
2. Clicar em Y
3. Observar Z

**Comportamento Esperado:**
[Descrever o que deveria acontecer]

**Comportamento Atual:**
[Descrever o que está acontecendo]

**Screenshot:**
[Anexar se possível]

**Console Errors:**
[Copiar erros se houver]

**Prioridade:** Alta / Média / Baixa
```

---

**Data**: 04/02/2026  
**Versão**: 2.0.0  
**Status**: ✅ Guia Completo de Testes Mobile
