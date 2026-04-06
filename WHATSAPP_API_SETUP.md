# 🔑 Configuração da API do WhatsApp (Meta)

## Problema Atual

❌ **Erro:** `Invalid JWT - Token da Meta inválido ou expirado`

O sistema está configurado para buscar templates reais da API da Meta WhatsApp, mas o token de acesso (`META_WHATSAPP_ACCESS_TOKEN`) está inválido ou expirado.

---

## ✅ Solução: Como Gerar um Novo Token

### 1️⃣ Acesse o Facebook Developers

Vá para: **https://developers.facebook.com/apps**

### 2️⃣ Selecione seu App WhatsApp

- Clique no seu aplicativo WhatsApp Business
- Se não tiver um app, você precisa criar um primeiro

### 3️⃣ Navegue até API Setup

No menu lateral:
- Clique em **"WhatsApp"**
- Depois em **"API Setup"**

### 4️⃣ Gere um Access Token

Na seção **"Access Token"**:

#### Opção A: Token Temporário (24 horas)
- Clique em **"Generate Token"**
- ⚠️ Esse token expira em 24 horas

#### Opção B: Token Permanente (Recomendado)
1. Clique em **"Generate Token"**
2. Siga o fluxo para criar um **System User**
3. Atribua as permissões necessárias:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
4. Gere um token permanente
5. ⚠️ **IMPORTANTE:** Copie e salve o token imediatamente, ele só aparece uma vez!

### 5️⃣ Configure as Variáveis de Ambiente

No **Supabase Dashboard**:

1. Vá em **Edge Functions > make-server-844b77a1 > Settings**
2. Atualize as seguintes variáveis:

```
META_WHATSAPP_ACCESS_TOKEN=seu_novo_token_aqui
META_WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
META_WHATSAPP_WABA_ID=seu_waba_id
```

### 6️⃣ Onde Encontrar os IDs

#### META_WHATSAPP_PHONE_NUMBER_ID
- No painel **WhatsApp > API Setup**
- Procure por **"Phone number ID"**
- Exemplo: `123456789012345`

#### META_WHATSAPP_WABA_ID
- No painel **WhatsApp > API Setup**
- Procure por **"WhatsApp Business Account ID"** ou **"WABA ID"**
- Exemplo: `987654321098765`

---

## 🧪 Como Testar

Depois de configurar:

1. Recarregue a aplicação
2. Abra uma conversa
3. Clique em **"Enviar Template"**
4. Os templates reais da sua conta devem aparecer

### ✅ Se funcionar:
```
✅ X templates carregados da API da Meta
```

### ❌ Se continuar com erro:
- Verifique se copiou o token completo (sem espaços)
- Verifique se os IDs estão corretos
- Verifique os logs no Supabase Edge Functions

---

## 🔄 Sistema de Fallback

**Enquanto o token não for configurado**, o sistema usa **templates mockados** automaticamente:

- ✅ O sistema continua funcionando
- ⚠️ Templates são apenas demonstração
- ⚠️ Envio real não funciona

---

## 📚 Documentação Oficial

- **WhatsApp Cloud API:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Tokens Permanentes:** https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#system-users
- **Message Templates:** https://developers.facebook.com/docs/whatsapp/api/messages/message-templates

---

## 🆘 Problemas Comuns

### Token expira muito rápido
➡️ Use um token permanente (System User)

### Erro "Invalid WABA ID"
➡️ Verifique se o `META_WHATSAPP_WABA_ID` está correto

### Erro "Phone number not found"
➡️ Verifique se o `META_WHATSAPP_PHONE_NUMBER_ID` está correto

### Templates não aparecem
➡️ Certifique-se de que você tem templates APROVADOS na sua conta

---

## 📊 Status Atual

```
✅ Backend configurado e funcionando
✅ Endpoint de busca de templates criado
✅ Integração com API da Meta implementada
✅ Sistema de fallback funcionando
⚠️ Aguardando token válido da Meta
```

**Próximo passo:** Configure o `META_WHATSAPP_ACCESS_TOKEN` válido! 🚀
