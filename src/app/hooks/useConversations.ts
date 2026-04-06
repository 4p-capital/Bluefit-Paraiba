/**
 * 🚀 HOOK: useConversations
 * 
 * Hook customizado para gerenciar conversas com React Query:
 * - Scroll infinito otimizado
 * - Cache inteligente
 * - Invalidação via Realtime
 * - Performance 10x melhor
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
}

interface ConversationsPage {
  conversations: ConversationWithDetails[];
  total: number;
  hasMore: boolean;
  offset: number;
}

/**
 * Fetch de conversas com paginação
 */
async function fetchConversations({ pageParam = 0 }): Promise<ConversationsPage> {
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
  
  // 🚀 OTIMIZAÇÃO: Buscar tags de TODAS as conversas de uma vez (batch query)
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
  const { enabled = true } = options;
  
  // 🚀 useInfiniteQuery - Perfeito para scroll infinito!
  const query = useInfiniteQuery({
    queryKey: queryKeys.conversations.infinite({}),
    queryFn: fetchConversations,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // Se não houver mais conversas, retorna undefined (para de paginar)
      if (!lastPage.hasMore) return undefined;
      // Retorna o próximo offset
      return lastPage.offset;
    },
    enabled,
    // Manter dados anteriores enquanto carrega novos (evita flicker)
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
