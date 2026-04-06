import { useEffect, useState } from 'react';
import { Calendar, Clock, X, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface ScheduledCallback {
  id: string;
  conversation_id: number;
  scheduled_at: string;
  template_id: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  created_at: string;
  sent_at?: string;
  notes?: string;
  created_by_profile?: {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
  };
}

interface ScheduledCallbacksListProps {
  conversationId: number;
  refreshTrigger?: number;
}

export function ScheduledCallbacksList({ conversationId, refreshTrigger }: ScheduledCallbacksListProps) {
  const [callbacks, setCallbacks] = useState<ScheduledCallback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCallbacks();
  }, [conversationId, refreshTrigger]);

  async function loadCallbacks() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ Sem sessão ativa');
        setLoading(false);
        return;
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/callbacks/conversation/${conversationId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': session.access_token
        },
        signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setCallbacks(result.callbacks || []);
      } else {
        console.error('❌ Erro ao buscar agendamentos:', result.error);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('⚠️ Backend não disponível - agendamentos não carregados');
      } else if (error instanceof DOMException && error.name === 'TimeoutError') {
        console.warn('⚠️ Timeout ao buscar agendamentos');
      } else {
        console.error('❌ Erro ao buscar agendamentos:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(callbackId: string) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/callbacks/cancel/${callbackId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': session.access_token
        },
        signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao cancelar agendamento');
      }

      toast.success('Agendamento cancelado com sucesso');
      loadCallbacks();

    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Backend não disponível. Tente novamente mais tarde.');
      } else if (error instanceof DOMException && error.name === 'TimeoutError') {
        toast.error('Timeout ao cancelar agendamento. Tente novamente.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Erro ao cancelar agendamento');
      }
    }
  }

  function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enviado</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelado</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0023D5]"></div>
      </div>
    );
  }

  if (callbacks.length === 0) {
    return null;
  }

  // Filtrar apenas agendamentos pendentes
  const pendingCallbacks = callbacks.filter(cb => cb.status === 'pending');

  if (pendingCallbacks.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0023D5]">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0023D5]/10">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          Retornos Agendados ({pendingCallbacks.length})
        </div>

        {pendingCallbacks.map((callback) => (
          <div
            key={callback.id}
            className="bg-white border border-blue-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Clock className="w-4 h-4 text-[#0023D5]" />
                    <span>{formatDateTime(callback.scheduled_at)}</span>
                  </div>
                  {getStatusBadge(callback.status)}
                </div>

                {callback.notes && (
                  <div className="flex items-start gap-2 pl-6">
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded px-2 py-1">
                      {callback.notes}
                    </p>
                  </div>
                )}

                {callback.created_by_profile && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 pl-6">
                    <User className="w-3 h-3" />
                    <span>
                      Agendado por <span className="font-medium text-gray-700">
                        {callback.created_by_profile.nome} {callback.created_by_profile.sobrenome}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {callback.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(callback.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Cancelar agendamento"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}