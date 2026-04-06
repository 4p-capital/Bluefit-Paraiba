import { LeadWithDetails, LeadStatus } from '../../types/database';
import { User, Phone, Mail, Calendar, MapPin, Star, Award, Pencil, Trash2, MessageCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface LeadsListProps {
  leads: LeadWithDetails[];
  onLeadClick: (lead: LeadWithDetails) => void;
  onDeleteLead?: (lead: LeadWithDetails) => void;
  canDelete?: boolean;
}

// Helper para calcular tempo relativo
function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'há poucos segundos';
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `há ${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 31536000) return `há ${Math.floor(diffInSeconds / 2592000)} meses`;
  return `há ${Math.floor(diffInSeconds / 31536000)} anos`;
}

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  novo: { 
    label: 'Novo', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100' 
  },
  contato_feito: { 
    label: 'Contato Feito', 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-100' 
  },
  visita_agendada: { 
    label: 'Visita Agendada', 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-100' 
  },
  visita_realizada: { 
    label: 'Visita Realizada', 
    color: 'text-cyan-700', 
    bgColor: 'bg-cyan-100' 
  },
  visita_cancelada: { 
    label: 'Visita Cancelada', 
    color: 'text-orange-700', 
    bgColor: 'bg-orange-100' 
  },
  matriculado: { 
    label: 'Matriculado', 
    color: 'text-green-700', 
    bgColor: 'bg-green-100' 
  },
  perdido: { 
    label: 'Perdido', 
    color: 'text-red-700', 
    bgColor: 'bg-red-100' 
  },
};

export function LeadsList({ leads, onLeadClick, onDeleteLead, canDelete = false }: LeadsListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header da tabela */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-600">
        <div className="col-span-3">Nome</div>
        <div className="col-span-2">Telefone</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Atendente</div>
        <div className="col-span-1">Criado</div>
        <div className="col-span-2 text-right">Ações</div>
      </div>

      {/* Linhas da tabela */}
      <div className="divide-y divide-slate-100">
        {leads.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            Nenhum lead encontrado
          </div>
        ) : (
          leads.map((lead) => {
            // Validação: garantir que o status existe no statusConfig
            const config = statusConfig[lead.situacao?.toLowerCase() as LeadStatus] || statusConfig.novo;
            
            return (
              <div
                key={lead.id}
                className="grid grid-cols-12 gap-4 px-6 py-3.5 hover:bg-slate-50/70 transition-colors group"
              >
                {/* Nome */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0028e6] to-[#0066cc] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {lead.nome_completo ? lead.nome_completo.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">
                      {lead.nome_completo}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {lead.email && (
                        <span className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{lead.email}</span>
                        </span>
                      )}
                      {(lead.pontuacao !== null && lead.pontuacao !== undefined) && (
                        <Badge 
                          variant="secondary" 
                          className="bg-amber-100 text-amber-700 text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0"
                        >
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          {lead.pontuacao}
                        </Badge>
                      )}
                      {lead.classificacao && (
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-100 text-purple-700 text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0"
                        >
                          <Award className="w-2.5 h-2.5" />
                          {lead.classificacao}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Telefone */}
                <div className="col-span-2 flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{lead.telefone}</span>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center">
                  <Badge 
                    className={cn(
                      "text-xs font-semibold",
                      config.color,
                      config.bgColor
                    )}
                  >
                    {config.label}
                  </Badge>
                </div>

                {/* Atendente */}
                <div className="col-span-2 flex items-center text-sm text-slate-600">
                  {lead.responsavel ? (
                    <>
                      <User className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {lead.responsavel}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Não atribuído</span>
                  )}
                </div>

                {/* Data de criação */}
                <div className="col-span-1 flex items-center text-xs text-slate-500">
                  {getTimeAgo(lead.created_at)}
                </div>

                {/* Ações */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  {/* Botão Editar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeadClick(lead);
                    }}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] transition-all duration-150 text-xs font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Editar</span>
                  </button>

                  {/* Botão Excluir — apenas para Supervisor+ */}
                  {canDelete && onDeleteLead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLead(lead);
                      }}
                      className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-[#EF4444] hover:border-[#FCA5A5] hover:bg-red-50 active:scale-[0.97] transition-all duration-150"
                      title="Excluir lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Botão Conversa */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Abrir conversa via WhatsApp (link direto com telefone)
                      const phone = lead.telefone?.replace(/\D/g, '');
                      if (phone) {
                        window.open(`https://wa.me/${phone}`, '_blank');
                      }
                    }}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0023D5] text-white hover:bg-[#001AAA] active:scale-[0.97] transition-all duration-150 text-xs font-medium shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Conversa</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
