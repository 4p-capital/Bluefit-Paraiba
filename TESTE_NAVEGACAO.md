# 🧪 TESTE DE NAVEGAÇÃO - PASSO A PASSO

## 🎯 OBJETIVO:

Descobrir **exatamente** quando e por quê o app volta para home.

---

## 📋 INSTRUÇÕES DETALHADAS:

### **PASSO 1: Preparar**
1. Pressione **F12** para abrir DevTools
2. Vá para aba **Console**
3. Clique no ícone 🚫 para **limpar console**

### **PASSO 2: Verificar Estado Inicial**
Olhe no console. Você deve ver algo como:
```
🏗️ App.tsx RENDERIZANDO - currentModule: home currentView: app
```

Confirme que está em `home`.

### **PASSO 3: Navegar para Conversas**
1. Clique no botão **"Conversas"** no menu do topo
2. **ESPERE** aparecer a tela de conversas
3. **OLHE NO CONSOLE** - deve aparecer:
   ```
   🔘 Navigation: handleNavigate chamado
   - De: home
   - Para: conversations
   ✅ Navigation: onNavigate() executado
   
   🔄 App: handleModuleChange chamado
   - Módulo anterior: home
   - Novo módulo: conversations
   ✅ App: setCurrentModule() executado
   
   🏗️ App.tsx RENDERIZANDO - currentModule: conversations
   ```

### **PASSO 4: Verificar Tela de Conversas**
- ✅ Você deve ver a lista de conversas à esquerda
- ✅ Botão **"Novo"** no canto superior direito
- ✅ Mensagem no centro: "Selecione uma conversa..."

**SE NÃO APARECER ISSO, PARE E ME AVISE!**

### **PASSO 5: Clicar em "Novo"**
1. Clique no botão **"Novo"** (com ícone de pessoa +)
2. **OLHE NO CONSOLE** - deve aparecer:
   ```
   === DIALOG CRIAR CONTATO ABERTO ===
   Buscando unidades...
   ```

### **PASSO 6: Preencher Formulário**
1. WhatsApp: `(61) 98765-4321`
2. Nome: `João`
3. Sobrenome: `Silva`
4. Selecione uma unidade
5. Situação: Lead

### **PASSO 7: Criar Contato**
1. Clique em **"Criar"**
2. **OBSERVE O CONSOLE COM ATENÇÃO**

---

## 📊 O QUE OBSERVAR:

### **✅ CENÁRIO SUCESSO:**

Console mostrará:
```
=== DEBUG CRIAR CONTATO (FRONTEND) ===
🔄 Buscando token fresco...
✅ Token fresco obtido
🧪 TESTE 1: Chamando endpoint de teste...
✅ Resposta do endpoint de teste
📞 TESTE 2: Chamando endpoint real...
✅ Contato criado com sucesso!
📞 Chamando callback onSuccess()...
✅ Callback onSuccess() executado
🚪 Fechando dialog...
✅ Dialog fechado

🔄 ConversationList: Carregando conversas...
✅ Conversas carregadas: X registros
```

**E você continua em Conversas!**

---

### **❌ CENÁRIO PROBLEMA:**

Se aparecer:
```
🔥 App.tsx DESMONTADO (cleanup)
🎬 App.tsx MONTADO (useEffect inicial rodando)
🏗️ App.tsx RENDERIZANDO - currentModule: home
```

**Isso significa que o App foi remontado!** 

Tire print de **TODO** o console e me envie.

---

### **⚠️ CENÁRIO NAVEGAÇÃO FALHOU:**

Se após clicar em "Conversas" no PASSO 3 você **NÃO** ver:
```
🔄 App: handleModuleChange chamado
```

Significa que a navegação não está funcionando. Tire print e me envie.

---

## 📸 PRINTS NECESSÁRIOS:

1. **Console COMPLETO** após PASSO 7
2. **Tela atual** mostrando em qual página você está
3. **Network Tab** (se der erro):
   - Aba Network
   - Procure `/api/contacts-v2`
   - Clique → Response
   - Tire print

---

## 💡 DICA EXTRA:

Se voltar para home, procure por **QUALQUER** log entre o "Dialog fechado" e o "App DESMONTADO". Pode haver pistas importantes!

---

**🚀 Faça o teste PASSO A PASSO e me envie os resultados!**
