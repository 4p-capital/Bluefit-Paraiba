import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Capturar hash e search ANTES do createClient processar e limpar os tokens da URL.
// Isso permite que AuthCallbackPage e AuthContext detectem tokens mesmo após cleanup.
export const initialUrlHash = typeof window !== 'undefined' ? window.location.hash : '';
export const initialUrlSearch = typeof window !== 'undefined' ? window.location.search : '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // detectSessionInUrl: true (padrão) — permite que o Supabase JS processe
    // automaticamente tokens da URL (hash fragments e ?code= PKCE).
    // O AuthCallbackPage NÃO faz exchange manual; apenas espera a sessão aparecer.
    detectSessionInUrl: true,
  },
});
