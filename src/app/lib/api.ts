/**
 * Utilitário para chamadas API autenticadas.
 * Intercepta respostas 401 e limpa sessões stale automaticamente.
 */
import { supabase } from './supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1`;

/**
 * Decodifica o payload de um JWT para verificar expiração.
 * Retorna o campo `exp` (unix timestamp) ou null se inválido.
 */
function getJwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * Verifica se um JWT está expirado ou prestes a expirar (dentro de marginSeconds).
 */
function isTokenExpired(token: string, marginSeconds = 60): boolean {
  const exp = getJwtExp(token);
  if (exp === null) return true; // Token inválido = tratar como expirado
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= exp - marginSeconds;
}

/**
 * Obtém um access token fresco da sessão Supabase.
 * Se o token em cache estiver expirado ou prestes a expirar,
 * faz refresh proativo antes de retornar.
 * Retorna null se não há sessão válida.
 */
export async function getFreshToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    // Se o token está válido e não está prestes a expirar, usar diretamente
    if (!isTokenExpired(session.access_token)) {
      return session.access_token;
    }

    // Token expirado ou prestes a expirar — refresh proativo
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !refreshData.session) {
      // Retornar o token antigo mesmo — o servidor vai rejeitar e o authFetch vai tratar o 401
      return session.access_token;
    }

    return refreshData.session.access_token;
  } catch {
    return null;
  }
}

/**
 * Faz uma chamada API autenticada ao backend.
 * - Automaticamente obtém o token fresco da sessão
 * - Envia como X-User-Token header
 * - Se receber 401, tenta refresh da sessão e retry uma vez
 * - Se o retry também falhar com 401, faz signOut local
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
  retried = false
): Promise<Response> {
  const token = await getFreshToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    'apikey': publicAnonKey,
    ...(token ? { 'X-User-Token': token } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Interceptar 401 - sessão stale
  if (response.status === 401 && !retried) {
    // Tentar refresh
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !refreshData.session) {
      console.error('[API] Session refresh failed after 401. Signing out.');
      await supabase.auth.signOut({ scope: 'local' });
      // Redirecionar para login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/reset-password') {
        window.location.replace('/login');
      }
      return response;
    }

    return authFetch(url, options, true);
  }

  return response;
}