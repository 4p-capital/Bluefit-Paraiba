# Supabase Edge Functions Configuration

## Webhook Routes (Public - No Authentication)

The following routes MUST be publicly accessible without authentication:
- GET  /webhook/whatsapp
- POST /webhook/whatsapp

These routes are used by Meta's WhatsApp Cloud API to:
1. Verify webhook configuration (GET request with hub.mode, hub.challenge, hub.verify_token)
2. Receive webhook events (POST request with message and status updates)

⚠️ **IMPORTANT:** Meta cannot send Authorization headers, so these routes must bypass JWT verification.

## Configuration Required

### Option 1: Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase Project Dashboard
2. Navigate to: **Settings** → **API** → **Edge Functions**
3. Add custom authorization rules to allow public access to webhook routes

### Option 2: Environment Variable

Set the following environment variable in your Supabase project:

```bash
SUPABASE_ANON_KEY_REQUIRED=false
```

### Option 3: Custom Middleware (ALREADY IMPLEMENTED)

The server code already:
- Returns 200 OK for webhook routes without checking Authorization header
- Uses CORS with `origin: "*"` to allow all origins
- Validates webhook requests using Meta's verify_token instead

## Testing the Webhook

### Direct URL (without authentication):
```
https://{PROJECT_ID}.supabase.co/functions/v1/server/webhook/whatsapp?hub.mode=subscribe&hub.challenge=TEST123&hub.verify_token=bluedesk123
```

**Expected response:** `TEST123` (as plain text)

If you get 401 Unauthorized, the Supabase Edge Function security layer is blocking the request.

## Workaround Solution

If you cannot configure Supabase to allow public webhook access:

1. **Use a different hosting provider for the webhook endpoint only** (e.g., Vercel, Netlify, AWS Lambda)
2. **Use Supabase as a proxy** - Create a simple proxy function that forwards requests
3. **Contact Supabase Support** - They can help configure your project for public webhooks

## Security Notes

The webhook is secured through:
1. **Verify Token Validation** - Meta sends `hub.verify_token` which must match server token
2. **Signature Validation** - POST requests are validated using `X-Hub-Signature-256` header
3. **Origin Checking** - Only WhatsApp Business API events are processed

This provides adequate security without requiring JWT authentication.
