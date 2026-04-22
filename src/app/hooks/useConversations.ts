/**
 * 🚀 HOOK: useConversations
 *
 * Hook customizado para gerenciar conversas com React Query:
 * - Scroll infinito otimizado
 * - Cache inteligente
 * - Invalidação via Realtime
 * - Filtro por tag direto no banco (Supabase)
 * - Busca full-text direto no banco (Supabase)
 */

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { authFetch, API_BASE } from '../lib/api';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/react-query';
import { ConversationWithDetails } from '../types/database';

/**
 * Debounced invalidation - agrupa múltiplos eventos Realtime
 * em uma única invalidação (evita 100+ refetches/min).
 */
function useDebouncedInvalidation(queryClient: ReturnType<typeof useQueryClient>, delayMs = 2000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    }, delayMs);
  }, [queryClient, delayMs]);
}

const CONVERSATIONS_PER_PAGE = 50;

interface UseConversationsOptions {
  enabled?: boolean;
  tagId?: string | null;
  search?: string | null;
}

interface ConversationsPage {
  conversations: ConversationWithDetails[];
  total: number;
  hasMore: boolean;
  offset: number;
}

/**
 * Busca tags em batch para uma lista de conversas
 */
async function fetchTagsBatch(conversationIds: number[]): Promise<Record<number, any[]>> {
  if (conversationIds.length === 0) return {};

  const { data: allTags } = await supabase
    .from('conversation_tags')
    .select('conversation_id, tag:tags(*)')
    .in('conversation_id', conversationIds);

  const tagsByConvId: Record<number, any[]> = {};
  if (allTags) {
    for (const ct of allTags) {
      if (!tagsByConvId[ct.conversation_id]) tagsByConvId[ct.conversation_id] = [];
      if ((ct as any).tag) tagsByConvId[ct.conversation_id].push((ct as any).tag);
    }
  }
  return tagsByConvId;
}

/**
 * 🏷️ Fetch de conversas filtradas por TAG - direto no Supabase
 * Busca conversation_tags → conversations com paginação
 */
async function fetchConversationsByTag(
  { pageParam = 0 },
  tagId: string
): Promise<ConversationsPage> {
  const limit = CONVERSATIONS_PER_PAGE;
  const offset = pageParam;

  // 1. Buscar TODOS os IDs de conversas com essa tag
  const { data: taggedConvs, error: tagError } = await supabase
    .from('conversation_tags')
    .select('conversation_id')
    .eq('tag_id', tagId);

  if (tagError || !taggedConvs) {
    return { conversations: [], total: 0, hasMore: false, offset: 0 };
  }

  const taggedIds = taggedConvs.map(tc => tc.conversation_id);
  const totalCount = taggedIds.length;

  if (taggedIds.length === 0) {
    return { conversations: [], total: 0, hasMore: false, offset: 0 };
  }

  // 2. Buscar conversas paginadas com esses IDs
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      contact:contacts(*),
      assigned_user:profiles(*),
      unit:units(*)
    `)
    .in('id', taggedIds)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (convError || !conversations) {
    return { conversations: [], total: totalCount, hasMore: false, offset: 0 };
  }

  // 3. Buscar tags em batch
  const convIds = conversations.map(c => c.id);
  const tagsByConvId = await fetchTagsBatch(convIds);

  // 4. Montar conversas com tags e preview
  const conversationsWithDetails = conversations
    .filter(conv => conv.contact)
    .map(conv => ({
      ...conv,
      tags: tagsByConvId[conv.id] || [],
      last_message_preview: conv.last_message_preview || 'Sem mensagens',
      pending_messages_count: 0,
    }));

  return {
    conversations: conversationsWithDetails as ConversationWithDetails[],
    total: totalCount,
    hasMore: (offset + conversationsWithDetails.length) < totalCount,
    offset: offset + conversationsWithDetails.length,
  };
}

/**
 * 🔍 Fetch de conversas por BUSCA - direto no Supabase
 * Busca em messages.body + contacts
 */
async function fetchConversationsBySearch(
  { pageParam = 0 },
  searchTerm: string
): Promise<ConversationsPage> {
  const limit = CONVERSATIONS_PER_PAGE;
  const offset = pageParam;
  const term = `%${searchTerm.trim()}%`;

  // 1. Buscar IDs de conversas onde mensagens contêm o termo
  const { data: messageMatches } = await supabase
    .from('messages')
    .select('conversation_id')
    .ilike('body', term);

  // 2. Buscar IDs de contatos que correspondem ao termo
  const { data: contactMatches } = await supabase
    .from('contacts')
    .select('id')
    .or(`display_name.ilike.${term},first_name.ilike.${term},last_name.ilike.${term},phone_number.ilike.${term},wa_id.ilike.${term}`);

  // 3. Combinar IDs únicos
  const matchedConvIds = new Set<number>();
  messageMatches?.forEach(m => matchedConvIds.add(m.conversation_id));

  if (contactMatches && contactMatches.length > 0) {
    const contactIds = contactMatches.map(c => c.id);
    const { data: contactConvs } = await supabase
      .from('conversations')
      .select('id')
      .in('contact_id', contactIds);
    contactConvs?.forEach(cc => matchedConvIds.add(cc.id));
  }

  const allIds = Array.from(matchedConvIds);
  const totalCount = allIds.length;

  if (allIds.length === 0) {
    return { conversations: [], total: 0, hasMore: false, offset: 0 };
  }

  // 4. Buscar conversas paginadas
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      contact:contacts(*),
      assigned_user:profiles(*),
      unit:units(*)
    `)
    .in('id', allIds)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!conversations) {
    return { conversations: [], total: totalCount, hasMore: false, offset: 0 };
  }

  // 5. Tags em batch
  const convIds = conversations.map(c => c.id);
  const tagsByConvId = await fetchTagsBatch(convIds);

  const conversationsWithDetails = conversations
    .filter(conv => conv.contact)
    .map(conv => ({
      ...conv,
      tags: tagsByConvId[conv.id] || [],
      last_message_preview: conv.last_message_preview || 'Sem mensagens',
      pending_messages_count: 0,
    }));

  return {
    conversations: conversationsWithDetails as ConversationWithDetails[],
    total: totalCount,
    hasMore: (offset + conversationsWithDetails.length) < totalCount,
    offset: offset + conversationsWithDetails.length,
  };
}

/**
 * 📋 Fetch padrão de conversas via API (sem filtro especial)
 */
async function fetchConversationsDefault(
  { pageParam = 0 }
): Promise<ConversationsPage> {
  const limit = CONVERSATIONS_PER_PAGE;
  const offset = pageParam;

  const endpoint = `${API_BASE}/api/conversations?limit=${limit}&offset=${offset}`;
  const response = await authFetch(endpoint, { method: 'GET' });

  if (!response.ok) {
    const result = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(result.error || 'Erro ao carregar conversas');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Erro ao carregar conversas');
  }

  const conversations = result.conversations || [];
  const conversationIds = conversations.map((c: any) => c.id);
  const tagsByConvId = await fetchTagsBatch(conversationIds);

  const conversationsWithTags = conversations.map((conv: any) => ({
    ...conv,
    tags: tagsByConvId[conv.id] || []
  }));

  return {
    conversations: conversationsWithTags,
    total: result.total || 0,
    hasMore: result.hasMore || false,
    offset: offset + conversationsWithTags.length,
  };
}

/**
 * Hook principal
 */
export function useConversations(options: UseConversationsOptions = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, tagId = null, search = null } = options;

  // Filtros para a query key (cache separado por filtro)
  const filters = { tagId, search };

  // Escolher a função de fetch baseado nos filtros ativos
  const queryFn = useCallback((ctx: { pageParam?: number }) => {
    if (tagId) {
      return fetchConversationsByTag(ctx as { pageParam: number }, tagId);
    }
    if (search && search.trim().length >= 2) {
      return fetchConversationsBySearch(ctx as { pageParam: number }, search);
    }
    return fetchConversationsDefault(ctx as { pageParam: number });
  }, [tagId, search]);

  const query = useInfiniteQuery({
    queryKey: queryKeys.conversations.infinite(filters),
    queryFn,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.offset;
    },
    enabled,
    placeholderData: (previousData) => previousData,
  });

  const debouncedInvalidate = useDebouncedInvalidation(queryClient);

  // Realtime: invalidar cache (debounced) quando houver mudanças
  useEffect(() => {
    if (!enabled) return;

    function safeSubscribe(channel: ReturnType<typeof supabase.channel>) {
      return channel.subscribe();
    }

    const conversationsChannel = supabase
      .channel('conversations-realtime-cache')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => debouncedInvalidate()
      );
    safeSubscribe(conversationsChannel);

    const messagesChannel = supabase
      .channel('messages-realtime-cache')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => debouncedInvalidate()
      );
    safeSubscribe(messagesChannel);

    const tagsChannel = supabase
      .channel('conversation-tags-realtime-cache')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_tags' },
        () => debouncedInvalidate()
      );
    safeSubscribe(tagsChannel);

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(tagsChannel);
    };
  }, [enabled, queryClient, debouncedInvalidate]);

  const refresh = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
  }, [queryClient]);

  // Combinar todas as páginas em uma lista única
  const conversations = query.data?.pages.flatMap(page => page.conversations) || [];
  const total = query.data?.pages[0]?.total || 0;

  return {
    // Dados
    conversations,
    total,

    // Estados
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,

    // Ações
    fetchNextPage: query.fetchNextPage,
    refresh,
    refetch: query.refetch,
  };
}
