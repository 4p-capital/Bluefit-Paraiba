# 🔧 Correção Rápida - n8n Upload Media

## ❌ Problema Atual
Você está recebendo erro "Invalid JWT" porque o n8n está enviando um header Authorization incorreto.

## ✅ Solução

### No nó HTTP Request do n8n:

1. **Parameters**: None (deixe como None)

2. **Send Headers**: 
   - ❌ **DESLIGUE** ou **REMOVA** o toggle de "Send Headers"
   - OU se precisar de headers, adicione APENAS:
     - Name: `Content-Type`
     - Value: `application/json`

3. **Send Body**: ✅ ATIVADO

4. **Body Content Type**: `JSON`

5. **Specify Headers**: `Using Fields Below`

6. **NÃO ADICIONE** nenhum header "Authorization"

## Configuração Correta no n8n

```
┌─────────────────────────────────────┐
│ HTTP Request                        │
├─────────────────────────────────────┤
│ Method: POST                        │
│ URL: https://{projectId}.supabase.co/functions/v1/make-server-844b77a1/api/whatsapp/upload-media
│                                     │
│ ✅ Send Query Parameters: OFF       │
│ ❌ Send Headers: OFF ou apenas     │
│    Content-Type se necessário      │
│ ✅ Send Body: ON                    │
│                                     │
│ Body Content Type: JSON             │
│                                     │
│ JSON Body:                          │
│ {                                   │
│   "mediaUrl": "...",                │
│   "mimeType": "...",                │
│   "filename": "...",                │
│   "conversationId": "...",          │
│   "messageId": "..."                │
│ }                                   │
└─────────────────────────────────────┘
```

## Se ainda der erro

Vá em **Options** do nó HTTP Request e:
- **Response Format**: JSON
- **Ignore SSL Issues**: OFF
- **Timeout**: 30000

## Testando

Após configurar, clique em "Execute node" no n8n. Você deve ver:

✅ **Sucesso (200):**
```json
{
  "success": true,
  "storagePath": "...",
  "publicUrl": "https://...",
  "size": 123456
}
```

❌ **Se ainda der erro 401 "Invalid JWT":**
1. Verifique se você realmente REMOVEU o header Authorization
2. Tente adicionar explicitamente o header vazio: `Authorization: ` (deixar vazio)
3. Ou use uma requisição Postman/Insomnia primeiro para testar

## Exemplo de Body JSON

```json
{
  "mediaUrl": "https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=123&ext=456",
  "mimeType": "image/jpeg",
  "filename": "photo-12345.jpg",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "messageId": "660e8400-e29b-41d4-a716-446655440001"
}
```

## 🚨 IMPORTANTE

Este endpoint **NÃO REQUER AUTENTICAÇÃO**. É um endpoint público usado pelo n8n para fazer upload de arquivos. O n8n está tentando enviar um token JWT que não é necessário nem válido.

**REMOVA O HEADER AUTHORIZATION COMPLETAMENTE.**
