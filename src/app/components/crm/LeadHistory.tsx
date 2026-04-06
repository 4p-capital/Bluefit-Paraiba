import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface LeadHistoryItem {
  id: string;
  lead_id: string;
  user_id: string | null;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  user?: {
    nome: string;
    sobrenome: string;
    email: string;
  } | null;
}

interface LeadHistoryProps {
  leadId: string;
}

const statusLabels: Record<string, string> = {
  novo: 'Novo',
  contato_feito: 'Contato Feito',
  visita_agendada: 'Visita Agendada',
  visita_realizada: 'Visita Realizada',
  visita_cancelada: 'Visita Cancelada',
  matriculado: 'Matriculado',
  perdido: 'Perdido',
};

const statusColors: Record<string, string> = {
  novo: 'bg-blue-100 text-blue-700',
  contato_feito: 'bg-purple-100 text-purple-700',
  visita_agendada: 'bg-amber-100 text-amber-700',
  visita_realizada: 'bg-cyan-100 text-cyan-700',
  visita_cancelada: 'bg-orange-100 text-orange-700',
  matriculado: 'bg-green-100 text-green-700',
  perdido: 'bg-red-100 text-red-700',
};

export function LeadHistory({ leadId }: LeadHistoryProps) {
  const [history, setHistory] = useState<LeadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [leadId]);

  async function loadHistory() {
    try {
      setLoading(true);

      // Buscar histórico
      const { data: historyData, error: historyError } = await supabase
        .from('lead_history')
        .select('*')
        .eq('lead_id', leadId)
        .order('changed_at', { ascending: false });

      if (historyError) throw historyError;

      if (!historyData || historyData.length === 0) {
        setHistory([]);
        return;
      }

      // Buscar informações dos usuários
      const userIds = [...new Set(historyData.filter(h => h.user_id).map(h => h.user_id))];
      
      let usersMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, nome, sobrenome, email')
          .in('id', userIds);

        if (usersData) {
          usersMap = Object.fromEntries(usersData.map(u => [u.id, u]));
        }
      }

      // Combinar dados
      const enrichedHistory = historyData.map(item => ({
        ...item,
        user: item.user_id ? usersMap[item.user_id] : null,
      }));

      setHistory(enrichedHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 172800) return 'ontem';
    
    // Formato completo
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      situacao: 'Status',
      responsavel: 'Responsável',
      id_unidade: 'Unidade',
      nome_completo: 'Nome',
      telefone: 'Telefone',
      email: 'Email',
      origem: 'Origem',
      campanha: 'Campanha',
      midia: 'Mídia',
      pontuacao: 'Pontuação',
      classificacao: 'Classificação',
      ja_treina: 'Já treina',
      objetivo_principal: 'Objetivo',
      mora_ou_trabalha_perto: 'Mora/trabalha perto',
      quando_quer_comecar: 'Quando quer começar',
      motivo_cancelamento: 'Motivo cancelamento',
    };
    return labels[field] || field;
  }

  function renderValue(field: string, value: string | null): React.ReactNode {
    if (!value) return <span className="text-slate-400 italic">vazio</span>;

    if (field === 'situacao') {
      const label = statusLabels[value] || value;
      const colorClass = statusColors[value] || 'bg-slate-100 text-slate-700';
      return (
        <Badge variant="secondary" className={colorClass}>
          {label}
        </Badge>
      );
    }

    return <span className="font-medium text-slate-900">{value}</span>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#0028e6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma alteração registrada ainda</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-colors"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                {item.user ? (
                  <span className="font-medium text-slate-900">
                    {item.user.nome} {item.user.sobrenome}
                  </span>
                ) : (
                  <span className="italic">Usuário desconhecido</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(item.changed_at)}
              </div>
            </div>

            {/* Mudança */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">
                  {getFieldLabel(item.field_changed)}
                </p>
                <div className="flex items-center gap-2">
                  {renderValue(item.field_changed, item.old_value)}
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  {renderValue(item.field_changed, item.new_value)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}