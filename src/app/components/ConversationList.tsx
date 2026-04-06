import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAvatarColorByName } from './ModernDesignSystem';
import { useUserProfile } from '../hooks/useUserProfile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { cn } from './ui/utils';
import { formatRelative } from '../lib/dateUtils';
import { authFetch, API_BASE } from '../lib/api';

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

/**
 * Formata o preview da última mensagem para exibição na lista.
 * Se for uma URL de mídia (Supabase storage), exibe um label amigável.
 */
function formatMessagePreview(preview: string | null | undefined, type?: string): string {
  if (!preview) return '';
  
  // Detectar URLs de mídia (Supabase storage ou qualquer URL longa)
  const isUrl = preview.startsWith('http://') || preview.startsWith('https://');
  
  if (isUrl || preview.includes('supabase.co/storage')) {
    // Inferir tipo pelo conteúdo da URL ou pelo type da mensagem
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

// Skeleton loader
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

export function ConversationList({ onSelectConversation, selectedConversationId, refreshTrigger }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [situationFilter, setSituationFilter] = useState<string>('all');
  const [unitAgents, setUnitAgents] = useState<{ id: string; nome: string; sobrenome: string }[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // 👤 Perfil do usuário logado (para detectar supervisor/gerente)
  const { profile: userProfile } = useUserProfile();
  const isManager = userProfile.isLoaded && userProfile.isAdmin;

  // Flag para saber se já carregou pelo menos uma vez (evita skeleton no refresh silencioso)
  const [initialLoaded, setInitialLoaded] = useState(false);

  // 🚀 PAGINAÇÃO - Scroll Infinito
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalConversations, setTotalConversations] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // 🔥 Ref para o container de scroll
  const offsetRef = useRef(0); // 🔥 FIX: Usar ref para evitar stale closure

  const loadConversations = useCallback(async (silent = false, loadMore = false) => {
    try {
      // Controle de loading
      if (loadMore) {
        setLoadingMore(true);
      } else if (!silent) {
        setLoading(true);
      }
      
      // 🔥 FIX: Usar offsetRef.current para pegar valor sempre atualizado
      const currentOffset = loadMore ? offsetRef.current : 0;
      const limit = 30; // 🚀 Carregar 30 conversas por vez
      
      
      const endpoint = `${API_BASE}/api/conversations?limit=${limit}&offset=${currentOffset}`;
      
      const response = await authFetch(endpoint, { method: 'GET' });

      // authFetch já trata 401 com refresh + retry + signOut automático
      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        // Em refresh silencioso, NÃO limpa a lista — mantém dados anteriores
        if (!silent) {
          setConversations([]);
          setLoading(false);
        }
        return;
      }

      const result = await response.json();
      
      if (!result.success) {
        if (!silent) {
          setConversations([]);
          setLoading(false);
        }
        return;
      }
      
      // 🚀 OTIMIZAÇÃO: Buscar tags de TODAS as conversas de uma vez (batch query)
      // Antes: N queries (1 por conversa) → Agora: 1 query total
      const conversations = result.conversations || [];
      const conversationIds = conversations.map((c: any) => c.id);
      
      let tagsByConvId: Record<string, any[]> = {};
      
      if (conversationIds.length > 0) {
        const { data: allTags } = await supabase
          .from('conversation_tags')
          .select('conversation_id, tag:tags(*)')
          .in('conversation_id', conversationIds);
        
        // Agrupar tags por conversation_id
        if (allTags) {
          tagsByConvId = allTags.reduce((acc: Record<string, any[]>, ct: any) => {
            if (!acc[ct.conversation_id]) acc[ct.conversation_id] = [];
            if (ct.tag) acc[ct.conversation_id].push(ct.tag);
            return acc;
          }, {});
        }
      }
      
      // Mapear conversas com suas tags
      const conversationsWithTags = conversations.map((conv: any) => ({
        ...conv,
        tags: tagsByConvId[conv.id] || []
      }));
      
      
      // 🚀 PAGINAÇÃO: Atualizar estado
      setTotalConversations(result.total || 0);
      setHasMore(result.hasMore || false);
      
      if (loadMore) {
        // Append às conversas existentes
        setConversations(prev => [...prev, ...(conversationsWithTags as ConversationWithDetails[])]);
        const newOffset = currentOffset + conversationsWithTags.length;
        setOffset(newOffset);
        offsetRef.current = newOffset; // 🔥 FIX: Atualizar ref
      } else {
        // Substituir conversas (refresh ou primeira carga)
        setConversations(conversationsWithTags as ConversationWithDetails[]);
        const newOffset = conversationsWithTags.length;
        setOffset(newOffset);
        offsetRef.current = newOffset; // 🔥 FIX: Atualizar ref
      }
      
      setInitialLoaded(true);
      
    } catch (error) {
      // Em refresh silencioso, NÃO limpa a lista
      if (!silent && !loadMore) {
        setConversations([]);
        setOffset(0);
        offsetRef.current = 0; // 🔥 FIX: Resetar ref
        setHasMore(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); // 🔥 FIX: Remover dependência de offset

  // 🏷️ Carregar tags disponíveis
  const loadTags = useCallback(async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (data) setAvailableTags(data);
  }, []);

  // 👥 Carregar atendentes da unidade (apenas para supervisores/gerentes)
  const loadUnitAgents = useCallback(async () => {
    if (!isManager) return;
    
    const unitIds = userProfile.unitIds;
    // Fallback para id_unidade se unitIds vazio
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
      return;
    }

    if (data) {
      setUnitAgents(data);
    }
  }, [isManager, userProfile.unitIds, userProfile.id_unidade]);

  useEffect(() => {
    loadTags();
    loadConversations(false); // Carregamento inicial com skeleton
    
    // Helper: subscribe com retry para evitar "send was called before connect"
    function safeSubscribe(channel: ReturnType<typeof supabase.channel>) {
      return channel.subscribe((status, err) => {
        if (err) {
        }
      });
    }

    const conversationsChannel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' }, 
        (payload) => {
          loadConversations(true); // ✅ Refresh silencioso
        }
      );
    safeSubscribe(conversationsChannel);

    const messagesChannel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          loadConversations(true); // ✅ Refresh silencioso
        }
      );
    safeSubscribe(messagesChannel);

    const tagsChannel = supabase
      .channel('conversation-tags-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_tags' },
        (payload) => {
          loadConversations(true); // ✅ Refresh silencioso
        }
      );
    safeSubscribe(tagsChannel);

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(tagsChannel);
    };
  }, [loadConversations, loadTags]);

  // Carregar atendentes quando o perfil estiver pronto
  useEffect(() => {
    loadUnitAgents();
  }, [loadUnitAgents]);

  // ℹ️ NOTA: Filtros (status, agent, tag, situation, search) são aplicados CLIENT-SIDE
  // no useMemo filteredConversations. Não precisamos recarregar do servidor quando mudam.
  // A paginação carrega todas as conversas do usuário progressivamente, e os filtros
  // atuam sobre a lista já carregada.

  // Recarregar quando o trigger externo mudar
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      // Reset paginação no refresh
      setOffset(0);
      offsetRef.current = 0; // 🔥 FIX: Resetar ref também
      setHasMore(true);
      loadConversations(true, false); // ✅ Refresh silencioso também via trigger externo
    }
  }, [refreshTrigger, loadConversations]);

  // 🚀 SCROLL INFINITO: IntersectionObserver para detectar fim da lista
  useEffect(() => {
    const currentTarget = observerTarget.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        
        // Se o elemento sentinela estiver visível E houver mais conversas E não está carregando
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadConversations(false, true); // loadMore = true
        }
      },
      {
        root: null, // viewport
        rootMargin: '100px', // Carregar 100px antes de chegar ao final
        threshold: 0.1
      }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    } else {
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, loadConversations]);

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

      // Filtro por situação do contato (lead/cliente)
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

    // 🔥 Sort: conversas com mensagens não lidas primeiro, depois por data da última mensagem
    filtered.sort((a, b) => {
      const aUnread = (a.pending_messages_count ?? 0) > 0 ? 1 : 0;
      const bUnread = (b.pending_messages_count ?? 0) > 0 ? 1 : 0;

      // Primeiro critério: não lidas no topo
      if (aUnread !== bUnread) return bUnread - aUnread;

      // Segundo critério (dentro do mesmo grupo): por pending_messages_count desc
      if (aUnread && bUnread) {
        const countDiff = (b.pending_messages_count ?? 0) - (a.pending_messages_count ?? 0);
        if (countDiff !== 0) return countDiff;
      }

      // Terceiro critério: data da última mensagem (mais recente primeiro)
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

  const hasUnread = useCallback((conv: ConversationWithDetails) => {
    return (conv.pending_messages_count ?? 0) > 0;
  }, []);

  return (
    <div className="flex flex-col h-full border-r border-[#E5E7EB] bg-white w-full overflow-hidden">
      {/* ── Header ── */}
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

      {/* ── Conversation List ── */}
      <ScrollArea className="flex-1 min-h-0 w-full overflow-hidden" ref={scrollAreaRef}>
        {loading ? (
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
            
            {/* 🚀 SCROLL INFINITO: Elemento sentinela para detectar fim da lista */}
            {!loading && hasMore && (
              <div 
                ref={observerTarget} 
                className="flex items-center justify-center py-4 w-full"
              >
                {loadingMore ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#0023D5] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[#9CA3AF]">Carregando mais conversas...</span>
                  </div>
                ) : (
                  <div className="h-4"></div>
                )}
              </div>
            )}
            
            {/* 🎯 Indicador de fim da lista */}
            {!loading && !hasMore && filteredConversations.length > 0 && (
              <div className="flex items-center justify-center py-4 w-full">
                <span className="text-xs text-[#9CA3AF]">
                  {filteredConversations.length} de {totalConversations} conversas carregadas
                </span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}