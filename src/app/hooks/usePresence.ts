import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';
export type PresenceMode = 'available' | 'manual'; // available = automático, manual = fixo

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  mode: PresenceMode;
  online_at: string;
  last_activity?: string;
}

interface PresenceState {
  [key: string]: UserPresence[];
}

// 📝 Função para registrar mudanças de status no banco (auditoria)
// Não bloqueia o sistema se houver erro - apenas loga
async function logStatusChange(userId: string, fromStatus: PresenceStatus, toStatus: PresenceStatus, mode: PresenceMode) {
  try {
    // Registrar na tabela profile_events (eventos relacionados ao usuário)
    const { error } = await supabase
      .from('profile_events')
      .insert({
        user_id: userId,
        event_type: 'presence_changed',
        metadata: {
          from_status: fromStatus,
          to_status: toStatus,
          mode: mode,
          changed_at: new Date().toISOString(),
          is_manual: mode === 'manual',
          is_automatic: mode === 'available'
        }
      });

    // Apenas avisar se houver erro, não bloquear
  } catch (error) {
    // Silenciar erros de auditoria para não quebrar o sistema
  }
}

export function usePresence() {
  const [presenceChannel, setPresenceChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());
  const [myStatus, setMyStatus] = useState<PresenceStatus>('offline');
  const [myMode, setMyMode] = useState<PresenceMode>('available');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // 🎯 Usar refs para valores que mudam mas não devem causar re-render
  const modeRef = useRef<PresenceMode>('available');
  const statusRef = useRef<PresenceStatus>('offline');
  const lastActivityRef = useRef<number>(Date.now());

  // 🔥 Inicializar presença
  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let activityTimer: NodeJS.Timeout | null = null;
    let cancelled = false;

    // 🕐 Função para resetar atividade
    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    async function initPresence() {
      try {
        // Obter usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) {
          return;
        }

        setCurrentUserId(user.id);

        // Remover canal existente com mesmo nome para evitar conflito (StrictMode / remount)
        const existingChannel = supabase.getChannels().find(ch => ch.topic === 'realtime:presence-attendants');
        if (existingChannel) {
          await supabase.removeChannel(existingChannel);
        }

        if (cancelled) return;

        // Criar canal de presença
        channel = supabase.channel('presence-attendants', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        // 📡 Monitorar mudanças de presença
        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel!.presenceState() as PresenceState;

            // Converter para Map
            const usersMap = new Map<string, UserPresence>();
            Object.values(state).forEach((presences) => {
              if (presences && presences.length > 0) {
                const presence = presences[0];
                usersMap.set(presence.user_id, presence);
              }
            });
            
            setOnlineUsers(usersMap);
          })
          .on('presence', { event: 'join' }, () => {})
          .on('presence', { event: 'leave' }, () => {});

        // Subscrever ao canal
        await channel.subscribe(async (status) => {
          if (cancelled) return;
          if (status === 'SUBSCRIBED') {
            // Rastrear presença como "online"
            const presence: UserPresence = {
              user_id: user.id,
              status: 'online',
              mode: 'available',
              online_at: new Date().toISOString(),
              last_activity: new Date().toISOString(),
            };

            await channel!.track(presence);
            setMyStatus('online');
            setMyMode('available');
            statusRef.current = 'online';
            modeRef.current = 'available';
            
            // Registrar login no banco (não bloqueia se falhar)
            await logStatusChange(user.id, 'offline', 'online', 'available');
          }
        });

        if (cancelled) {
          channel.untrack();
          supabase.removeChannel(channel);
          return;
        }

        setPresenceChannel(channel);

        // 🕐 Detectar inatividade (5 minutos sem atividade = away)
        const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos

        // Escutar eventos de atividade
        window.addEventListener('mousemove', resetActivity);
        window.addEventListener('keydown', resetActivity);
        window.addEventListener('click', resetActivity);
        window.addEventListener('scroll', resetActivity);

        // Verificar inatividade periodicamente
        activityTimer = setInterval(async () => {
          const now = Date.now();
          const inactive = now - lastActivityRef.current > INACTIVITY_TIMEOUT;

          // ⚠️ IMPORTANTE: Só aplicar lógica automática se estiver em modo "available"
          if (modeRef.current !== 'available') {
            return;
          }

          // Inativo → Mudar para "away"
          if (inactive && statusRef.current === 'online') {
            
            const presence: UserPresence = {
              user_id: user.id,
              status: 'away',
              mode: 'available',
              online_at: new Date().toISOString(),
              last_activity: new Date().toISOString(),
            };

            await channel!.track(presence);
            setMyStatus('away');
            statusRef.current = 'away';

            // Registrar mudança automática (não bloqueia se falhar)
            await logStatusChange(user.id, 'online', 'away', 'available');
          }
          // Ativo novamente → Voltar para "online"
          else if (!inactive && statusRef.current === 'away') {
            
            const presence: UserPresence = {
              user_id: user.id,
              status: 'online',
              mode: 'available',
              online_at: new Date().toISOString(),
              last_activity: new Date().toISOString(),
            };

            await channel!.track(presence);
            setMyStatus('online');
            statusRef.current = 'online';

            // Registrar volta automática (não bloqueia se falhar)
            await logStatusChange(user.id, 'away', 'online', 'available');
          }
        }, 30000); // Verificar a cada 30 segundos

      } catch (error) {
        console.error('[PRESENCE] Failed to initialize:', error);
      }
    }

    initPresence();

    // Cleanup
    return () => {
      cancelled = true;
      
      if (activityTimer) {
        clearInterval(activityTimer);
      }

      // Remover listeners de atividade
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('scroll', resetActivity);

      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // 🔄 Alterar status manualmente (e registrar no banco)
  async function changeStatus(newStatusOrMode: PresenceStatus | 'available') {
    if (!presenceChannel || !currentUserId) {
      return;
    }

    try {
      const oldStatus = statusRef.current;
      
      // Caso especial: "available" → volta ao modo automático
      if (newStatusOrMode === 'available') {
        
        const presence: UserPresence = {
          user_id: currentUserId,
          status: 'online',
          mode: 'available',
          online_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
        };

        await presenceChannel.track(presence);
        setMyStatus('online');
        setMyMode('available');
        statusRef.current = 'online';
        modeRef.current = 'available';
        
        // Registrar volta ao modo automático (não bloqueia se falhar)
        await logStatusChange(currentUserId, oldStatus, 'online', 'available');
        return;
      }

      // Status manual (away ou busy)
      
      const presence: UserPresence = {
        user_id: currentUserId,
        status: newStatusOrMode,
        mode: 'manual',
        online_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      };

      await presenceChannel.track(presence);
      setMyStatus(newStatusOrMode);
      setMyMode('manual');
      statusRef.current = newStatusOrMode;
      modeRef.current = 'manual';
      
      // Registrar mudança manual no banco (não bloqueia se falhar)
      await logStatusChange(currentUserId, oldStatus, newStatusOrMode, 'manual');
    } catch (error) {
      console.error('[PRESENCE] Failed to change status:', error);
    }
  }

  // 🔍 Obter status de um usuário específico
  function getUserStatus(userId: string): PresenceStatus {
    const userPresence = onlineUsers.get(userId);
    const status = userPresence?.status || 'offline';
    return status;
  }

  // 🔍 Obter modo de um usuário específico
  function getUserMode(userId: string): PresenceMode {
    const userPresence = onlineUsers.get(userId);
    return userPresence?.mode || 'available';
  }

  return {
    onlineUsers,
    myStatus,
    myMode,
    changeStatus,
    getUserStatus,
    getUserMode,
    currentUserId,
  };
}