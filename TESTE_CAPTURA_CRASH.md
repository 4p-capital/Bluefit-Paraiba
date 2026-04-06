# 🚨 TESTE DE CAPTURA DE CRASH

## ✅ O QUE FOI IMPLEMENTADO:

Agora temos um **sistema que sobrevive ao crash**! 

Quando o erro acontecer, ele será:
1. ✅ Salvo no `localStorage` ANTES do crash
2. ✅ Recuperado DEPOIS que o app reiniciar
3. ✅ Exibido no console com destaque

---

## 🧪 COMO TESTAR:

### **1️⃣ LIMPAR CONSOLE**
- Pressione **F12**
- Vá para **Console**
- Clique no ícone 🚫 para limpar

### **2️⃣ IR PARA CONVERSAS**
- Clique em **"Conversas"** no menu do topo (botão azul)
- Aguarde a tela carregar

### **3️⃣ CRIAR CONTATO**
- Clique em **"Novo"** (botão com ícone de pessoa +)
- Preencha:
  - **WhatsApp**: `(55) 11 98765-4321`
  - **Nome**: `João`
  - **Sobrenome**: `Silva`
  - **Unidade**: Selecione qualquer uma
  - **Situação**: Lead

### **4️⃣ CLICAR EM "CRIAR CONTATO"**
- O sistema vai crashar (como antes)
- Vai voltar para a home

### **5️⃣ OLHAR O CONSOLE**
Procure por este bloco:

```
═══════════════════════════════════════════════
🚨 ERRO RECUPERADO DO ÚLTIMO CRASH:
═══════════════════════════════════════════════
Timestamp: [data/hora]
Message: [MENSAGEM DO ERRO AQUI]
Stack: [STACK TRACE COMPLETO]
FormData: {...}
═══════════════════════════════════════════════
```

---

## 📸 O QUE ME ENVIAR:

### **1️⃣ PRINT DO CONSOLE COMPLETO**
- Especialmente o bloco `🚨 ERRO RECUPERADO DO ÚLTIMO CRASH`
- Role até o topo para pegar tudo

### **2️⃣ SE NÃO APARECER O ERRO:**
Isso significaria que o erro está sendo capturado antes do try-catch, então me envie:
- Print do console mostrando TODOS os logs
- Print da aba **Network** mostrando a requisição `/api/contacts-v2`

---

## 💡 O QUE ESPERAR:

### **Cenário A: Erro no Frontend**
```
Message: "Cannot read property 'x' of undefined"
Stack: at CreateContactDialog.tsx:xxx
```
→ Erro no código React

### **Cenário B: Erro no Fetch**
```
Message: "Failed to fetch"
```
→ Problema de rede ou CORS

### **Cenário C: Erro no Backend**
```
Message: "Erro ao criar contato: [detalhes]"
```
→ Resposta de erro do servidor

---

## 🎯 VANTAGENS:

Agora **MESMO QUE O APP CRASH**, vamos descobrir:
- ✅ **Qual foi o erro exato**
- ✅ **Onde aconteceu** (stack trace)
- ✅ **Quando aconteceu** (timestamp)
- ✅ **Quais dados** estavam sendo enviados

---

**🚀 Faça o teste e me envie o print do console!** 📊

**ATENÇÃO:** Procure especialmente pelo bloco com as linhas `═══════` no console!
