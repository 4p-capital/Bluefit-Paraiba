/**
 * 🚀 CONVERSATION LIST V2 - Com React Query
 * 
 * Versão otimizada com cache inteligente:
 * - useInfiniteQuery para scroll infinito
 * - Cache automático
 * - Invalidação via Realtime
 * - Performance 10x melhor
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  User,
  X,
  MessagesSquare,
  UserCircle,
  Tag as TagIcon,
  Users,
} from 'lucide-react';
import { ConversationWithDetails, ConversationStatus, Tag } from '../types/database';
import { supabase } from '../lib/supabase';
import { getAvatarColorByName } from './ModernDesignSystem';
import { useUserProfile } from '../hooks/useUserProfile';
import { useConversations } from '../hooks/useConversations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { cn } from './ui/utils';
import { formatRelative } from '../lib/dateUtils';

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationWithDetails) => void;
  selectedConversationId?: string;
  refreshTrigger?: number;
}

function getInitials(conversation: ConversationWithDetails): string {
  const contact = conversation.contact;
  if (contact?.first_name && contact?.last_name) {
    return `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();
  }
  if (contact?.display_name) {
    const parts = contact.display_name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return contact.display_name.substring(0, 2).toUpperCase();
  }
  if (contact?.phone_number || contact?.wa_id) {
    const phone = contact.phone_number || contact.wa_id || '';
    return phone.slice(-2);
  }
  return '??';
}

function getContactName(conversation: ConversationWithDetails): string {
  const contact = conversation.contact;
  if (contact?.first_name && contact?.last_name) {
    return `${contact.first_name} ${contact.last_name}`;
  }
  return contact?.display_name || contact?.phone_number || contact?.wa_id || 'Desconhecido';
}

function formatMessagePreview(preview: string | null | undefined, type?: string): string {
  if (!preview) return '';
  
  const isUrl = preview.startsWith('http://') || preview.startsWith('https://');
  
  if (isUrl || preview.includes('supabase.co/storage')) {
    if (type === 'audio' || /\.(ogg|mp3|wav|m4a|webm)/i.test(preview)) return '🎤 Áudio';
    if (type === 'image' || /\.(jpg|jpeg|png|gif|webp)/i.test(preview)) return '📷 Imagem';
    if (type === 'video' || /\.(mp4|mov|avi)/i.test(preview)) return '🎥 Vídeo';
    if (type === 'document' || /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)/i.test(preview)) return '📄 Documento';
    return '📎 Mídia';
  }
  
  return preview;
}

const statusConfig: Record<ConversationStatus, { label: string; dotColor: string }> = {
  open: {
    label: 'Aberto',
    dotColor: 'bg-[#10B981]',
  },
  pending: {
    label: 'Pendente',
    dotColor: 'bg-[#F59E0B]',
  },
  waiting_customer: {
    label: 'Aguardando',
    dotColor: 'bg-[#3B82F6]',
  },
  closed: {
    label: 'Fechado',
    dotColor: 'bg-[#9CA3AF]',
  },
};

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-[#E5E7EB] flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3.5 bg-[#E5E7EB] rounded-md w-28" />
          <div className="h-3 bg-[#F3F3F3] rounded-md w-10" />
        </div>
        <div className="h-3 bg-[#F3F3F3] rounded-md w-full max-w-[200px]" />
      </div>
    </div>
  );
}

export function ConversationListV2({ onSelectConversation, selectedConversationId, refreshTrigger }: ConversationListProps) {
  // 🚀 React Query - Hook customizado com scroll infinito
  const {
    conversations,
    total,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refresh,
  } = useConversations();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [situationFilter, setSituationFilter] = useState<string>('all');
  const [unitAgents, setUnitAgents] = useState<{ id: string; nome: string; sobrenome: string }[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Perfil do usuário
  const { profile: userProfile } = useUserProfile();
  const isManager = userProfile.isLoaded && userProfile.isAdmin;

  // Scroll infinito
  const [scrollViewport, setScrollViewport] = useState<HTMLElement | null>(null);
  const canFetchRef = useRef(true);

  // 🏷️ Carregar tags disponíveis
  useEffect(() => {
    async function loadTags() {
      const { data } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (data) setAvailableTags(data);
    }
    
    loadTags();
  }, []);

  // 👥 Carregar atendentes da unidade (apenas para supervisores/gerentes)
  useEffect(() => {
    if (!isManager) return;
    
    async function loadUnitAgents() {
      const unitIds = userProfile.unitIds;
      if (unitIds.length === 0 && !userProfile.id_unidade) return;

      let query = supabase
        .from('profiles')
        .select('id, nome, sobrenome')
        .eq('ativo', true)
        .order('nome');

      if (unitIds.length > 0) {
        query = query.in('id_unidade', unitIds);
      } else if (userProfile.id_unidade) {
        query = query.eq('id_unidade', userProfile.id_unidade);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao carregar atendentes da unidade:', error);
        return;
      }

      if (data) {
        console.log(`👥 [AGENTS] ${data.length} atendentes carregados`);
        setUnitAgents(data);
      }
    }
    
    loadUnitAgents();
  }, [isManager, userProfile.unitIds, userProfile.id_unidade]);

  // Refresh quando o trigger externo mudar
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('🔄 [ConversationList] Refresh trigger detectado');
      refresh();
    }
  }, [refreshTrigger, refresh]);

  // Liberar fetch após cooldown quando termina de carregar
  useEffect(() => {
    if (!isFetching) {
      const timer = setTimeout(() => { canFetchRef.current = true; }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFetching]);

  // 🚀 SCROLL INFINITO: Scroll listener no viewport do ScrollArea
  const handleScroll = useCallback(() => {
    if (!scrollViewport || !hasNextPage || isFetching || !canFetchRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollViewport;
    // Usuário precisa ter rolado E estar perto do final
    if (scrollTop > 50 && scrollHeight - scrollTop - clientHeight < 300) {
      canFetchRef.current = false;
      fetchNextPage();
    }
  }, [scrollViewport, hasNextPage, isFetching, fetchNextPage]);

  useEffect(() => {
    if (!scrollViewport) return;
    scrollViewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollViewport.removeEventListener('scroll', handleScroll);
  }, [scrollViewport, handleScroll]);

  // Filtrar conversas
  const filteredConversations = useMemo(() => {
    const filtered = conversations.filter(conv => {
      if (!conv.contact) return false;

      // Filtro por status
      if (statusFilter !== 'all' && conv.status !== statusFilter) return false;

      // Filtro por atendente
      if (agentFilter !== 'all') {
        if (agentFilter === '__unassigned__') {
          if (conv.assigned_user_id) return false;
        } else {
          if (conv.assigned_user_id !== agentFilter) return false;
        }
      }

      // Filtro por tag
      if (tagFilter !== 'all') {
        const hasThatTag = conv.tags?.some((tag: Tag) => tag.id === tagFilter);
        if (!hasThatTag) return false;
      }

      // Filtro por situação do contato
      if (situationFilter !== 'all') {
        if ((conv.contact?.situation || 'lead') !== situationFilter) return false;
      }

      // Filtro por busca
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const fullName = conv.contact?.first_name && conv.contact?.last_name 
          ? `${conv.contact.first_name} ${conv.contact.last_name}`.toLowerCase()
          : '';
        const matchesName = conv.contact?.display_name?.toLowerCase().includes(search);
        const matchesFullName = fullName.includes(search);
        const matchesPhone = conv.contact?.wa_id?.includes(search) || conv.contact?.phone_number?.includes(search);
        const matchesMessage = conv.last_message_preview?.toLowerCase().includes(search) ||
          formatMessagePreview(conv.last_message_preview, conv.last_message_type)?.toLowerCase().includes(search);
        
        return matchesName || matchesFullName || matchesPhone || matchesMessage;
      }
      return true;
    });

    // Ordenar: não lidas primeiro, depois por data
    filtered.sort((a, b) => {
      const aUnread = (a.pending_messages_count ?? 0) > 0 ? 1 : 0;
      const bUnread = (b.pending_messages_count ?? 0) > 0 ? 1 : 0;

      if (aUnread !== bUnread) return bUnread - aUnread;

      if (aUnread && bUnread) {
        const countDiff = (b.pending_messages_count ?? 0) - (a.pending_messages_count ?? 0);
        if (countDiff !== 0) return countDiff;
      }

      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });

    return filtered;
  }, [conversations, searchTerm, statusFilter, agentFilter, tagFilter, situationFilter]);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (agentFilter !== 'all') count++;
    if (tagFilter !== 'all') count++;
    if (situationFilter !== 'all') count++;
    return count;
  }, [statusFilter, agentFilter, tagFilter, situationFilter]);

  function clearAllFilters() {
    setStatusFilter('all');
    setAgentFilter('all');
    setTagFilter('all');
    setSituationFilter('all');
    setSearchTerm('');
  }

  const hasUnread = (conv: ConversationWithDetails) => {
    return (conv.pending_messages_count ?? 0) > 0;
  };

  return (
    <div className="flex flex-col h-full border-r border-[#E5E7EB] bg-white w-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-[#E5E7EB] bg-white w-full">
        {/* Search */}
        <div className="relative mb-3 w-full group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4 transition-colors duration-150 group-focus-within:text-[#0023D5]" />
          <input
            type="text"
            placeholder="Buscar contato ou mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 h-10 text-sm bg-[#F3F3F3] border border-[#E5E7EB] rounded-lg text-[#1B1B1B] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#0023D5] focus:ring-2 focus:ring-[#0023D5]/10 focus:outline-none transition-all duration-150"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] p-0.5 rounded-full hover:bg-[#E5E7EB] transition-colors duration-150"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Row 1: Status + Situação */}
        <div className="flex gap-2 w-full">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ConversationStatus | 'all')}>
            <SelectTrigger className="flex-1 h-9 text-xs border-[#E5E7EB] bg-[#F3F3F3] rounded-md min-w-0 hover:border-[#0023D5] transition-colors duration-150 text-[#1B1B1B]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                  Todos os status
                </span>
              </SelectItem>
              <SelectItem value="open">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Aberto
                </span>
              </SelectItem>
              <SelectItem value="closed">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                  Fechado
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={situationFilter} onValueChange={setSituationFilter}>
            <SelectTrigger className="flex-1 h-9 text-xs border-[#E5E7EB] bg-[#F3F3F3] rounded-md min-w-0 hover:border-[#0023D5] transition-colors duration-150 text-[#1B1B1B]">
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas situações</SelectItem>
              <SelectItem value="lead">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs">🎯</span>
                  Lead
                </span>
              </SelectItem>
              <SelectItem value="cliente">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs">💎</span>
                  Cliente
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters Row 2: Atendente (admin) + Tag */}
        <div className="flex gap-2 w-full mt-2">
          {isManager && (
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="flex-1 h-9 text-xs border-[#E5E7EB] bg-[#F3F3F3] rounded-md min-w-0 hover:border-[#0023D5] transition-colors duration-150 text-[#1B1B1B]">
                <div className="flex items-center gap-1.5 truncate">
                  <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#9CA3AF]" />
                  <SelectValue placeholder="Atendente" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos atendentes</SelectItem>
                <SelectItem value="__unassigned__">
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <UserCircle className="w-3.5 h-3.5" />
                    Sem atendente
                  </span>
                </SelectItem>
                {unitAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      {agent.nome} {agent.sobrenome}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="flex-1 h-9 text-xs border-[#E5E7EB] bg-[#F3F3F3] rounded-md min-w-0 hover:border-[#0023D5] transition-colors duration-150 text-[#1B1B1B]">
              <div className="flex items-center gap-1.5 truncate">
                <TagIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#9CA3AF]" />
                <SelectValue placeholder="Tag" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas tags</SelectItem>
              {availableTags.map(tag => (
                <SelectItem key={tag.id} value={tag.id}>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color || '#9CA3AF' }}
                    />
                    {tag.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-[#9CA3AF]">
              {filteredConversations.length} conversa{filteredConversations.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-[#0023D5] hover:text-[#001AAA] font-medium flex items-center gap-1 hover:underline"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 min-h-0 w-full overflow-hidden" ref={(node) => {
        if (node) {
          const viewport = node.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
          setScrollViewport((prev) => prev === viewport ? prev : viewport);
        }
      }}>
        {isLoading ? (
          <div className="w-full">
            {[...Array(6)].map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F3F3F3] flex items-center justify-center mb-4">
              <MessagesSquare className="w-7 h-7 text-[#9CA3AF]" />
            </div>
            <p className="text-sm font-medium text-[#4B5563] mb-1">Nenhuma conversa encontrada</p>
            <p className="text-xs text-[#9CA3AF]">
              {searchTerm || activeFiltersCount > 0
                ? 'Tente ajustar sua busca ou filtros'
                : 'Novas conversas aparecerão aqui'}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-3 text-xs text-[#0023D5] hover:text-[#001AAA] font-medium hover:underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        ) : (
          <div className="w-full">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              const unread = hasUnread(conversation);
              const contactName = getContactName(conversation);
              const initials = getInitials(conversation);
              const avatarColor = getAvatarColorByName(contactName);
              const status = statusConfig[conversation.status];

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "w-full flex items-start gap-3 px-5 py-3.5 text-left transition-all duration-150 relative border-l-[3px] border-l-transparent border-b border-b-[#F3F3F3]",
                    isSelected
                      ? "bg-[#F3F3F3] border-l-[#0023D5]"
                      : "hover:bg-[#F9FAFB]",
                    unread && !isSelected && "bg-[#EFF6FF] border-l-[#3B82F6]"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-semibold text-white transition-transform duration-150"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                    {/* Status dot */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                            status.dotColor
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-[11px]">
                        {status.label}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Line 1: Name + Unread badge + Time */}
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className={cn(
                          "truncate leading-tight",
                          unread
                            ? "font-bold text-[#1B1B1B] text-[14px]"
                            : "font-semibold text-[#1B1B1B] text-[14px]"
                        )}
                      >
                        {contactName}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {unread && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-[5px] bg-[#0023D5] text-white rounded-full text-[11px] font-bold leading-none">
                            {conversation.pending_messages_count || 1}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[11px] whitespace-nowrap",
                            unread
                              ? "font-semibold text-[#3B82F6]"
                              : "font-normal text-[#9CA3AF]"
                          )}
                        >
                          {conversation.last_message_at && formatRelative(new Date(conversation.last_message_at))}
                        </span>
                      </div>
                    </div>

                    {/* Line 2: Última mensagem preview */}
                    {conversation.last_message_preview && (
                      <p
                        className={cn(
                          "text-[12px] leading-snug truncate mt-0.5",
                          unread
                            ? "text-[#1B1B1B] font-medium"
                            : "text-[#9CA3AF] font-normal"
                        )}
                      >
                        {formatMessagePreview(conversation.last_message_preview, conversation.last_message_type)}
                      </p>
                    )}

                    {/* Line 3: Tags + Assigned */}
                    {((conversation.tags && conversation.tags.length > 0) || conversation.assigned_user) && (
                    <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
                      {/* Assigned user */}
                      {conversation.assigned_user && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <div className="w-4 h-4 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                                <User className="w-2.5 h-2.5 text-[#4B5563]" />
                              </div>
                              <span className="text-[11px] text-[#9CA3AF] font-medium truncate max-w-[60px]">
                                {conversation.assigned_user.nome || conversation.assigned_user.email?.split('@')[0]}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-[11px]">
                            {conversation.assigned_user.nome && conversation.assigned_user.sobrenome
                              ? `${conversation.assigned_user.nome} ${conversation.assigned_user.sobrenome}`
                              : conversation.assigned_user.email}
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Separator */}
                      {conversation.assigned_user && conversation.tags && conversation.tags.length > 0 && (
                        <span className="text-[#E5E7EB] text-[10px]">·</span>
                      )}

                      {/* Tags */}
                      {conversation.tags && conversation.tags.length > 0 && (
                        <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                          {conversation.tags.slice(0, 2).map((tag: Tag) => (
                            <Tooltip key={tag.id}>
                              <TooltipTrigger asChild>
                                <span
                                  className="inline-flex items-center gap-0.5 text-[11px] px-2 py-[1px] rounded font-medium truncate max-w-[80px]"
                                  style={{
                                    backgroundColor: '#E5E7EB',
                                    color: tag.color || '#4B5563',
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: tag.color || '#9CA3AF' }}
                                  />
                                  <span className="truncate">{tag.name}</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="text-[11px]">
                                {tag.name}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {conversation.tags.length > 2 && (
                            <span className="text-[11px] text-[#9CA3AF] font-medium flex-shrink-0">
                              +{conversation.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                </button>
              );
            })}
            
            {/* Scroll infinito: Indicador de loading */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4 w-full">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#0023D5] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#9CA3AF]">Carregando mais conversas...</span>
                </div>
              </div>
            )}
            
            {/* Indicador de fim da lista */}
            {!hasNextPage && filteredConversations.length > 0 && (
              <div className="flex items-center justify-center py-4 w-full">
                <span className="text-xs text-[#9CA3AF]">
                  {filteredConversations.length} de {total} conversas carregadas
                </span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
