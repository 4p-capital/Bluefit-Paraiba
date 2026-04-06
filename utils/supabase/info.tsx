/**
 * Configuração Supabase - lê de variáveis de ambiente (Vite).
 * Credenciais ficam no .env (não commitado) em vez de hardcoded.
 */

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!projectId || !publicAnonKey) {
  console.error(
    '❌ Variáveis de ambiente VITE_SUPABASE_PROJECT_ID e VITE_SUPABASE_ANON_KEY são obrigatórias. ' +
    'Copie .env.example para .env e preencha os valores.'
  );
}
