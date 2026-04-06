# 🎤 Debug - Envio de Áudio para WhatsApp

## 🔍 Como Verificar se o Áudio está Sendo Enviado

### 1. **Abrir Console do Navegador (F12)**

Quando você gravar e enviar um áudio, procure pelos seguintes logs:

#### No Frontend (ChatView.tsx):
```
🎤 Áudio gravado recebido:
- size: XX.XX KB
- type: audio/webm ou audio/ogg

📁 Arquivo criado:
- name: gravacao-TIMESTAMP.webm
- type: audio/webm
- size: XX KB

📤 [SEND FILE] Enviando arquivo...
- Tipo: audio
- Nome: gravacao-TIMESTAMP.webm
- Tamanho: X.XX MB
```

#### Se houver erro no frontend:
```
❌ Erro do backend: [mensagem de erro]
```

---

### 2. **Verificar Logs do Supabase Edge Function**

Acesse: https://supabase.com/dashboard/project/manvezhphopngpnaiyjv/functions/make-server-844b77a1/logs

Procure pelos logs:

#### Upload do arquivo:
```
📤 [SEND MEDIA] Recebendo requisição...
📦 Dados recebidos:
- Para: +5511XXXXXXXXX
- Tipo: audio
- Legenda: 
- Arquivo: gravacao-TIMESTAMP.webm
- Tamanho: X.XXMB

📤 [SEND MEDIA] Fazendo upload para Supabase Storage...
📝 Nome do arquivo original: gravacao-TIMESTAMP.webm
📝 Nome do arquivo sanitizado: [nome_sanitizado]
📝 Caminho completo: audios/[timestamp]-[nome]

✅ Upload concluído: audios/[timestamp]-[nome]
🔗 URL gerada: [signed_url]
```

#### Envio para WhatsApp:
```
🎤 [SEND MEDIA] Tipo detectado: ÁUDIO
🎤 [SEND MEDIA] URL do áudio: [signed_url]
🎤 [SEND MEDIA] Destinatário: +5511XXXXXXXXX

📤 [META API] Enviando áudio via WhatsApp...
- To: +5511XXXXXXXXX
- Audio URL: [signed_url]

📊 [META API] Status da resposta: 200 OK
✅ [META API] Áudio enviado com sucesso!
🆔 [META API] Message ID (wamid): wamid.XXXXXX
```

#### Salvamento no banco:
```
💾 [SEND MEDIA] Salvando mensagem no banco...
  - Conversation ID: [uuid]
  - Type: audio
  - Media URL: [signed_url]
  - Provider Message ID: wamid.XXXXXX

✅ [SEND MEDIA] Mensagem salva com sucesso no banco!
```

---

### 3. **Possíveis Erros e Soluções**

#### ❌ Erro: "Arquivo não fornecido"
**Causa**: O FormData não está sendo enviado corretamente  
**Solução**: 
1. Verificar se o `audioFile` está sendo criado no ChatView
2. Verificar se o FormData.append('file', audioFile) está correto

#### ❌ Erro: "Erro ao fazer upload: [mensagem]"
**Causa**: Problema no Supabase Storage  
**Solução**:
1. Verificar se o bucket existe: `make-844b77a1-whatsapp-media`
2. Verificar permissões do bucket
3. Verificar se há espaço disponível

**Como criar o bucket manualmente:**
```sql
-- No SQL Editor do Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('make-844b77a1-whatsapp-media', 'make-844b77a1-whatsapp-media', false);
```

#### ❌ Erro na API da Meta: "Invalid parameter"
**Causa**: URL do áudio não está acessível ou formato inválido  
**Solução**:
1. Verificar se a URL é uma SignedURL válida
2. Verificar se o formato do áudio é suportado pelo WhatsApp
3. Formatos aceitos: OGG, M4A, AMR, MP3, AAC, OPUS

#### ❌ Erro: "WhatsApp não configurado"
**Causa**: Variáveis de ambiente ausentes  
**Solução**: Verificar se estão configuradas:
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`

---

### 4. **Testar Manualmente com cURL**

Se o envio não funcionar, teste diretamente a API do WhatsApp:

```bash
# 1. Fazer upload de um arquivo de teste
curl -X POST \
  'https://graph.facebook.com/v19.0/PHONE_NUMBER_ID/media' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -F 'file=@test-audio.ogg' \
  -F 'messaging_product=whatsapp'

# Resposta esperada:
# { "id": "MEDIA_ID" }

# 2. Enviar o áudio
curl -X POST \
  'https://graph.facebook.com/v19.0/PHONE_NUMBER_ID/messages' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5511XXXXXXXXX",
    "type": "audio",
    "audio": {
      "id": "MEDIA_ID"
    }
  }'
```

---

### 5. **Verificar se o Áudio chegou no WhatsApp**

1. Abra o WhatsApp do destinatário
2. Verifique se há uma mensagem de áudio
3. Tente reproduzir o áudio

**Se o áudio não chegar:**
- Verifique se o número está correto (+5511XXXXXXXXX)
- Verifique se há conexão no WhatsApp
- Aguarde até 30 segundos (pode ter delay)

---

### 6. **Verificar no Banco de Dados**

```sql
-- Buscar últimas mensagens de áudio
SELECT 
  id,
  conversation_id,
  direction,
  type,
  body,
  media_url,
  status,
  created_at,
  provider_message_id
FROM messages
WHERE type = 'audio'
  AND direction = 'outbound'
ORDER BY created_at DESC
LIMIT 10;
```

**O que verificar:**
- ✅ `type` = 'audio'
- ✅ `direction` = 'outbound'
- ✅ `media_url` está preenchida
- ✅ `provider_message_id` existe (wamid.XXX)
- ✅ `status` = 'sent' ou 'delivered'

---

### 7. **Checklist Completo**

- [ ] Permissão de microfone concedida
- [ ] Áudio gravado com sucesso (preview funciona)
- [ ] Arquivo criado (File object)
- [ ] FormData montado corretamente
- [ ] Requisição enviada ao backend
- [ ] Upload para Supabase Storage bem-sucedido
- [ ] SignedURL gerada
- [ ] Chamada à API da Meta retornou 200
- [ ] Message ID (wamid) recebido
- [ ] Mensagem salva no banco
- [ ] Áudio chegou no WhatsApp do destinatário

---

### 8. **Formatos de Áudio Suportados**

| Formato | Extensão | MIME Type | Suportado pelo WhatsApp |
|---------|----------|-----------|-------------------------|
| OGG Opus | .ogg | audio/ogg;codecs=opus | ✅ Sim (preferencial) |
| WebM Opus | .webm | audio/webm;codecs=opus | ✅ Sim |
| M4A | .m4a | audio/mp4 | ✅ Sim |
| AMR | .amr | audio/amr | ✅ Sim |
| MP3 | .mp3 | audio/mpeg | ✅ Sim |
| AAC | .aac | audio/aac | ✅ Sim |

**Atualmente estamos usando:**
- Primeira escolha: `audio/webm;codecs=opus`
- Segunda escolha: `audio/ogg;codecs=opus`
- Fallback: `audio/webm`

---

### 9. **Tamanhos Máximos**

- **Navegador → Backend**: 16MB (validado no ChatView)
- **Backend → Supabase Storage**: Sem limite prático
- **Backend → WhatsApp API**: 16MB (limite da Meta)

---

### 10. **Tempo de Gravação**

- **Mínimo**: 1 segundo (validado)
- **Máximo**: 5 minutos (300 segundos) - parada automática

---

## 🔧 Como Adicionar Mais Logs

Se precisar de mais informações, adicione logs no ChatView:

```typescript
// Em handleAudioRecordingComplete
console.log('🎤 DEBUG - AudioBlob completo:', {
  size: audioBlob.size,
  type: audioBlob.type,
  constructor: audioBlob.constructor.name
});

// Antes de handleFileSend
console.log('🎤 DEBUG - Arquivo antes de enviar:', {
  name: audioFile.name,
  type: audioFile.type,
  size: audioFile.size,
  lastModified: audioFile.lastModified
});
```

---

## 📞 Suporte

Se o problema persistir:
1. Copie TODOS os logs do console (frontend + backend)
2. Anote o timestamp exato do envio
3. Verifique se há erros não listados neste guia
4. Verifique os logs no Supabase Dashboard

---

**Última atualização**: 30/01/2026  
**Versão**: 1.0
