# 📤 Instruções para Upload de Mídia do WhatsApp via n8n

## Endpoint
```
POST https://{projectId}.supabase.co/functions/v1/make-server-844b77a1/api/whatsapp/upload-media
```

## Headers Necessários
```
Content-Type: application/json
```

⚠️ **IMPORTANTE:** NÃO envie header `Authorization`. Este endpoint é público e não requer autenticação.

## Body da Requisição (JSON)
```json
{
  "mediaUrl": "https://lookaside.fbsbx.com/whatsapp_business/attachments/...",
  "mimeType": "image/jpeg",
  "filename": "photo.jpg",
  "conversationId": "uuid-da-conversa",
  "messageId": "uuid-da-mensagem-opcional"
}
```

### Parâmetros:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `mediaUrl` | string | ✅ Sim | URL temporária da mídia fornecida pela Meta |
| `mimeType` | string | ⚠️ Recomendado | Tipo MIME do arquivo (ex: image/jpeg, video/mp4) |
| `filename` | string | ⚠️ Recomendado | Nome do arquivo com extensão |
| `conversationId` | string | ✅ Sim | UUID da conversa no banco de dados |
| `messageId` | string | ❌ Opcional | UUID da mensagem (se fornecido, atualiza o campo media_url automaticamente) |

## Resposta de Sucesso
```json
{
  "success": true,
  "storagePath": "uuid-conversa/1234567890-photo.jpg",
  "publicUrl": "https://...supabase.co/storage/v1/object/sign/make-844b77a1-whatsapp-media/...",
  "size": 524288
}
```

## Resposta de Erro
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

## Exemplo de Configuração no n8n

### Nó HTTP Request
```
Method: POST
URL: https://{projectId}.supabase.co/functions/v1/make-server-844b77a1/api/whatsapp/upload-media

Headers:
  Content-Type: application/json

Body (JSON):
{
  "mediaUrl": "{{ $json.entry[0].changes[0].value.messages[0].image.url }}",
  "mimeType": "{{ $json.entry[0].changes[0].value.messages[0].image.mime_type }}",
  "filename": "whatsapp-{{ $json.entry[0].changes[0].value.messages[0].id }}.jpg",
  "conversationId": "{{ $json.conversationId }}",
  "messageId": "{{ $json.messageId }}"
}
```

## Fluxo Recomendado no n8n

```
1️⃣ Webhook Meta
   └─> Recebe mensagem com mídia

2️⃣ Buscar/Criar Conversa
   └─> Obtém conversationId

3️⃣ HTTP Request - Upload Mídia
   └─> Envia mediaUrl para nosso endpoint
   └─> Retorna publicUrl (URL assinada válida por 7 dias)

4️⃣ Insert Message
   └─> Insere mensagem no banco com media_url
   └─> Se messageId foi fornecido no passo 3, campo já foi atualizado automaticamente
```

## Tipos de Mídia Suportados

### Imagens
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

### Vídeos
- `video/mp4`
- `video/3gpp`

### Áudios
- `audio/ogg`
- `audio/mpeg`
- `audio/amr`

### Documentos
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `application/vnd.ms-powerpoint`
- `application/vnd.openxmlformats-officedocument.presentationml.presentation`

## Limites
- **Tamanho máximo:** 10MB por arquivo
- **Validade da URL:** 7 dias (604.800 segundos)

## Renovação de URL Assinada

Se precisar renovar a URL assinada após 7 dias:

```
POST https://{projectId}.supabase.co/functions/v1/make-server-844b77a1/api/storage/signed-url

Body:
{
  "storagePath": "uuid-conversa/1234567890-photo.jpg",
  "expiresIn": 604800
}
```

## Troubleshooting

### ❌ Erro: "Invalid JWT"
**Causa:** Você está enviando um header `Authorization` inválido.
**Solução:** Remova completamente o header `Authorization` da requisição. Este endpoint não requer autenticação.

### ❌ Erro: "mediaUrl e conversationId são obrigatórios"
**Causa:** Parâmetros obrigatórios não foram fornecidos.
**Solução:** Certifique-se de enviar tanto `mediaUrl` quanto `conversationId` no body.

### ❌ Erro: "Erro ao baixar arquivo"
**Causa:** A URL da Meta expirou ou é inválida.
**Solução:** As URLs da Meta expiram rapidamente. Certifique-se de fazer o upload imediatamente após receber o webhook.

### ⚠️ Aviso: "Erro ao atualizar mensagem"
**Causa:** O messageId fornecido não existe no banco.
**Solução:** Não impede o upload. A URL pública ainda será retornada. Use-a para inserir/atualizar manualmente a mensagem.
