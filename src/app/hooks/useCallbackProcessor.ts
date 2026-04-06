import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

/**
 * Hook para processar agendamentos de retorno automaticamente
 * Verifica a cada 2 minutos se há agendamentos pendentes para enviar
 * Inclui delay inicial para evitar cold start timeout
 */
export function useCallbackProcessor() {
  const intervalRef = useRef<number | null>(null);
  const initialDelayRef = useRef<number | null>(null);

  useEffect(() => {
    // Aguardar 15 segundos antes do primeiro processamento
    // para evitar timeout durante cold start da Edge Function
    initialDelayRef.current = window.setTimeout(() => {
      processCallbacks();

      // Configurar polling a cada 2 minutos (120 segundos)
      intervalRef.current = window.setInterval(() => {
        processCallbacks();
      }, 120000);
    }, 15000);

    // Limpar timers ao desmontar
    return () => {
      if (initialDelayRef.current) {
        clearTimeout(initialDelayRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  async function processCallbacks() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Só processar se houver sessão ativa
      if (!session) {
        return;
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/callbacks/process`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': session.access_token
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Verificar se a resposta é válida
        if (!response.ok) {
          // Silenciar erros 404 e 5xx - endpoint pode não estar deployado
          if (response.status === 404 || response.status >= 500) {
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Silenciar erros de abort/timeout e rede - são esperados em dev
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return; // Timeout silencioso
        }
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          return; // Erro de rede silencioso
        }
      }
    } catch (error) {
      // Erro ao obter sessão - silenciar
    }
  }

  return null;
}