import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Bell, Check, Trash2, MessageSquare, UserPlus, AlertCircle, CheckCircle, ArrowLeft,
  Filter,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';

type FilterType = 'all' | 'unread' | 'new_message' | 'new_conversation' | 'status_change' | 'assignment';

/**
 * Página completa de notificações (/notifications).
 * Consome do NotificationContext compartilhado — estado sincronizado
 * com o NotificationCenter (popup da Sidebar).
 */
export function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  function handleNotificationClick(id: string, conversationId?: string) {
    markAsRead(id);
    if (conversationId) {
      navigate(`/conversations/${conversationId}`);
    }
  }

  function handleMarkAllAsRead() {
    markAllAsRead();
    toast.success('Todas as notificações marcadas como lidas');
  }

  function handleClearAll() {
    clearAll();
    toast.success('Todas as notificações removidas');
  }

  function getNotificationIcon(type: NotificationType) {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-[#0023D5]" />;
      case 'new_conversation':
        return <UserPlus className="w-5 h-5 text-[#00e5ff]" />;
      case 'status_change':
        return <AlertCircle className="w-5 h-5 text-[#f59e0b]" />;
      case 'assignment':
        return <CheckCircle className="w-5 h-5 text-[#10b981]" />;
      default:
        return <Bell className="w-5 h-5 text-[#6B7280]" />;
    }
  }

  function getTypeLabel(type: string): string {
    switch (type) {
      case 'new_message': return 'Mensagem';
      case 'new_conversation': return 'Conversa';
      case 'status_change': return 'Status';
      case 'assignment': return 'Atribuição';
      default: return type;
    }
  }

  // Filtragem
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  return (
    <div className="h-full bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <div
        className="bg-white border-b border-[#E5E7EB] px-4 md:px-6 py-4 flex-shrink-0"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#F3F3F3] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#4B5563]" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-[#1B1B1B]">Notificações</h1>
                {unreadCount > 0 && (
                  <Badge className="bg-[#0023D5] text-white text-xs">
                    {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[#6B7280]">Acompanhe todas as atividades do sistema</p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#9CA3AF]" />
              <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                <SelectTrigger className="w-48 h-9 bg-[#F3F3F3] border-[#E5E7EB] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="new_message">Mensagens</SelectItem>
                  <SelectItem value="new_conversation">Conversas</SelectItem>
                  <SelectItem value="status_change">Mudanças de status</SelectItem>
                  <SelectItem value="assignment">Atribuições</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs border-[#E5E7EB] text-[#0023D5] hover:bg-[#E6EAFF]"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs border-[#E5E7EB] text-[#EF4444] hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Limpar tudo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F3F3F3] flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-[#9CA3AF]" />
              </div>
              <p className="text-[#4B5563] font-medium text-lg">
                {filter === 'all'
                  ? 'Nenhuma notificação'
                  : 'Nenhuma notificação com esse filtro'}
              </p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                {filter === 'all'
                  ? 'Você está em dia com todas as atualizações'
                  : 'Tente ajustar o filtro para ver mais resultados'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`
                      bg-white rounded-lg border border-[#E5E7EB] p-4
                      hover:shadow-md cursor-pointer transition-all duration-150
                      ${!notification.read ? 'border-l-4 border-l-[#0023D5] bg-blue-50/30' : ''}
                    `}
                    onClick={() =>
                      handleNotificationClick(notification.id, notification.conversation_id)
                    }
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-[#1B1B1B]">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-[#0023D5] flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-[#4B5563] mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Badge "Atribuída a você" */}
                            {notification.type === 'assignment' &&
                              notification.metadata?.isForMe && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  Você
                                </span>
                              )}

                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-[#F3F3F3] text-[#6B7280]"
                            >
                              {getTypeLabel(notification.type)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-[#9CA3AF]">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>

                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-7 px-2 text-xs text-[#0023D5] hover:bg-[#E6EAFF]"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Lida
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-7 px-2 text-xs text-[#EF4444] hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Footer stats */}
          {notifications.length > 0 && (
            <div className="mt-6 text-center text-xs text-[#9CA3AF]">
              {filteredNotifications.length} de {notifications.length} notificação(ões)
              {unreadCount > 0 && ` · ${unreadCount} não lida(s)`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}