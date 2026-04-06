# 🚨 DEBUG: Áudio não está sendo enviado para o WhatsApp

## ✅ O que está funcionando:
1. Preview aparece no chat ✅
2. Upload para Supabase Storage ✅
3. Salvamento no banco ✅

## ❌ O que NÃO está funcionando:
- Áudio não chega no WhatsApp do destinatário ❌

---

## 🔍 PASSOS PARA DESCOBRIR O ERRO:

### 1️⃣ **Verificar Logs do Supabase Functions**

Acesse: https://supabase.com/dashboard/project/manvezhphopngpnaiyjv/functions/make-server-844b77a1/logs

**Procure pela última execução que aconteceu quando você enviou o áudio.**

### 📋 **O que procurar:**

#### ✅ **Se deu certo, você DEVE ver:**

```
📤 [SEND MEDIA] Recebendo requisição...
📦 Dados recebidos:
- Para: 5511999999999
- Tipo: audio
- Arquivo: audio-1234567890.webm
✅ Upload concluído: audios/1234567890-audio.webm
🔗 URL gerada: https://xxx.supabase.co/storage/v1/object/sign/...
🎤 [SEND MEDIA] Tipo detectado: ÁUDIO
📤 [META API] Enviando áudio via WhatsApp...
🎤 - To: 5511999999999
🎤 - Audio URL: https://xxx.supabase.co/...
📊 [META API] Status da resposta: 200 OK
✅ [META API] Áudio enviado com sucesso!
🆔 [META API] Message ID: wamid.XXXXXXXXX
💾 [SEND MEDIA] Salvando mensagem no banco...
✅ [SEND MEDIA] Mensagem salva com sucesso no banco!
```

#### ❌ **Se deu erro, você pode ver:**

**Erro 1: URL não acessível pela Meta**
```
❌ [META API] Erro ao enviar áudio: {
  "error": {
    "message": "Media download error",
    "type": "OAuthException",
    "code": 131051
  }
}
```
**Causa:** A URL do Supabase Storage não é acessível pela API da Meta.
**Solução:** Bucket precisa ter política pública para leitura.

---

**Erro 2: Formato de áudio não suportado**
```
❌ [META API] Erro ao enviar áudio: {
  "error": {
    "message": "Unsupported media type",
    "type": "OAuthException",
    "code": 131051
  }
}
```
**Causa:** WhatsApp não aceita o formato `audio/webm;codecs=opus`.
**Solução:** Converter para OGG ou M4A.

---

**Erro 3: Credenciais inválidas**
```
❌ [META API] Erro ao enviar áudio: {
  "error": {
    "message": "Invalid OAuth access token",
    "type": "OAuthException",
    "code": 190
  }
}
```
**Causa:** Token de acesso expirado ou inválido.
**Solução:** Verificar `META_WHATSAPP_ACCESS_TOKEN` no Supabase.

---

**Erro 4: Número de telefone inválido**
```
❌ [META API] Erro ao enviar áudio: {
  "error": {
    "message": "Unsupported phone number",
    "code": 131026
  }
}
```
**Causa:** Número não está no formato E.164 correto.
**Solução:** Validar formato do número.

---

**Erro 5: Timeout ou rede**
```
❌ [META API] Exceção ao enviar áudio: TypeError: fetch failed
```
**Causa:** Erro de conexão com a API da Meta.
**Solução:** Verificar conectividade de rede.

---

### 2️⃣ **Verificar Bucket do Supabase Storage**

Acesse: https://supabase.com/dashboard/project/manvezhphopngpnaiyjv/storage/buckets

**Verifique:**

1. Bucket `make-844b77a1-whatsapp-media` existe? ✅
2. Dentro do bucket, há uma pasta `audios/`? ✅
3. Os arquivos de áudio estão lá? ✅
4. **CRÍTICO:** O bucket tem política pública de leitura? ⚠️

#### ✅ **Como verificar política:**

1. Clique no bucket `make-844b77a1-whatsapp-media`
2. Clique em "Policies"
3. Deve ter uma policy como:

```sql
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'make-844b77a1-whatsapp-media');
```

#### ⚠️ **Se NÃO tiver policy pública:**

A API da Meta NÃO consegue baixar o áudio do Supabase!

**SOLUÇÃO:**

Execute no SQL Editor do Supabase:

```sql
-- Permitir leitura pública nos arquivos do bucket
CREATE POLICY "Public read access for WhatsApp media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'make-844b77a1-whatsapp-media');

-- Confirmar
SELECT * FROM storage.policies 
WHERE bucket_id = 'make-844b77a1-whatsapp-media';
```

---

### 3️⃣ **Testar URL Manualmente**

1. Vá para: https://supabase.com/dashboard/project/manvezhphopngpnaiyjv/storage/buckets/make-844b77a1-whatsapp-media
2. Abra a pasta `audios/`
3. Clique em um arquivo de áudio recente
4. Copie a "Public URL" ou "Signed URL"
5. **Abra em uma aba anônima do navegador**
6. Tente reproduzir o áudio

#### ✅ **Se funcionar:**
O problema NÃO é a URL do Supabase.

#### ❌ **Se der erro 403 ou 404:**
O problema É a URL do Supabase! Bucket não está público.

---

### 4️⃣ **Verificar Formato do Áudio**

O WhatsApp aceita:
- ✅ `audio/ogg` (OGG Vorbis)
- ✅ `audio/mpeg` (MP3)
- ✅ `audio/mp4` (M4A)
- ⚠️ `audio/webm` (pode não funcionar em alguns casos)

**Seu sistema está gravando:**
- `audio/webm;codecs=opus` (primeira escolha)
- `audio/ogg;codecs=opus` (segunda escolha)

**Problema potencial:**
A API da Meta pode rejeitar `audio/webm` mesmo que o WhatsApp Web aceite.

**SOLUÇÃO:**
Converter áudio para OGG puro antes de enviar.

---

### 5️⃣ **Console do Navegador (Frontend)**

Abra o console (F12) e procure por:

```javascript
❌ Erro do backend: ...
```

Copie a mensagem de erro completa e me envie.

---

## 🎯 AÇÃO IMEDIATA:

### Execute AGORA:

1. **Abra os logs do Supabase Functions** e copie TODA a saída da última execução
2. **Teste a URL do áudio** manualmente no navegador
3. **Verifique se o bucket tem policy pública**

---

## 📋 CHECKLIST RÁPIDO:

- [ ] Logs do Supabase Functions verificados
- [ ] Erro específico da Meta identificado
- [ ] URL do áudio testada manualmente
- [ ] Bucket tem política pública
- [ ] Número de telefone está correto (formato E.164)
- [ ] Token `META_WHATSAPP_ACCESS_TOKEN` válido

---

## 🚀 PRÓXIMOS PASSOS:

**Me envie:**

1. **Log completo** do Supabase Functions (última execução)
2. **Mensagem de erro** do console (F12)
3. **Resultado do teste** da URL do áudio no navegador
4. **Política do bucket** (se existe ou não)

Com essas informações, vou conseguir identificar EXATAMENTE o problema! 🎯
