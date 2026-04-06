import { X, MessageSquare } from 'lucide-react';
import { ConversationWithDetails } from '../../types/database';
import { ChatView } from '../ChatView';

interface CrmChatModalProps {
  conversation: ConversationWithDetails;
  leadName: string;
  onClose: () => void;
  onConversationUpdate: () => void;
}

export function CrmChatModal({ conversation, leadName, onClose, onConversationUpdate }: CrmChatModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-[95vw] h-[90vh] max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] bg-gradient-to-r from-[#0023D5]/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0023D5]/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#0023D5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1B1B1B]">
                Chat com {leadName}
              </h3>
              <p className="text-xs text-[#6B7280]">
                Conversa via CRM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#1B1B1B] hover:bg-[#F3F3F3] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area - renderiza o ChatView completo */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatView
            conversation={conversation}
            onConversationUpdate={onConversationUpdate}
          />
        </div>
      </div>
    </div>
  );
}
