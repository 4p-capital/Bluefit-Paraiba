import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, X, Check, MessageSquare, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';

/**
 * Painel popup de notificações na Sidebar.
 * Agora consome do NotificationContext compartilhado — estado sincronizado
 * com a NotificationsPage.
 */
export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  function handleNotificationClick(id: string, conversationId?: string) {
    markAsRead(id);
    setOpen(false);
    if (conversationId) {
      navigate(`/conversations/${conversationId}`);
    }
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

  return (
    <div className="relative">
      {/* Notification Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 bottom-full mb-2 w-80 md:w-96 max-h-[calc(100vh-80px)] bg-white rounded-lg shadow-xl border border-[#E5E7EB] z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] flex-shrink-0">
                <div>
                  <h3 className="font-semibold text-[#1B1B1B]">Notificações</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-[#6B7280]">
                      {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-[#0023D5] hover:text-[#001AAA]"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Marcar todas
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearAll}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="flex-1 min-h-0 max-h-96">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                    <Bell className="w-12 h-12 text-[#E5E7EB] mb-3" />
                    <p className="text-[#4B5563] font-medium">Nenhuma notificação</p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Você está em dia com todas as atualizações
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F3F3F3]">
                    {notifications.slice(0, 10).map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-[#F9FAFB] cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() =>
                          handleNotificationClick(notification.id, notification.conversation_id)
                        }
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm text-[#1B1B1B]">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-[#0023D5] flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-[#4B5563] mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[#9CA3AF] mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Badge especial para atribuições direcionadas ao usuário */}
                        {notification.type === 'assignment' && notification.metadata?.isForMe && (
                          <div className="mt-2 ml-13">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Atribuída a você
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer - Ver todas */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-[#E5E7EB] flex-shrink-0">
                  <Button
                    variant="ghost"
                    className="w-full text-sm text-[#0023D5] hover:bg-[#E6EAFF]"
                    onClick={() => {
                      setOpen(false);
                      navigate('/notifications');
                    }}
                  >
                    Ver todas as notificações
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}