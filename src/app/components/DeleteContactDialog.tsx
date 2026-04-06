import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Trash2, Loader2, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Contact {
  id: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  phone_number: string;
  wa_id?: string;
  situation?: string;
  unit_id?: string;
}

interface DeleteContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onSuccess: () => void;
}

export function DeleteContactDialog({ open, onOpenChange, contact, onSuccess }: DeleteContactDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const displayName = contact.first_name
    ? contact.last_name
      ? `${contact.first_name} ${contact.last_name}`
      : contact.first_name
    : contact.display_name;

  function formatPhone(phone: string): string {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 13) {
      return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9)}`;
    } else if (numbers.length === 12) {
      return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 8)}-${numbers.slice(8)}`;
    }
    return phone;
  }

  async function handleDelete() {
    setDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessao expirada. Faca login novamente.');
        return;
      }

      console.log('🗑️ [DELETE CONTACT] Excluindo contato:', {
        contactId: contact.id,
        nome: displayName,
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/contacts/${contact.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': session.access_token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('❌ [DELETE CONTACT] Erro:', data);
        toast.error(data.error || 'Erro ao excluir contato');
        return;
      }

      console.log('✅ [DELETE CONTACT] Sucesso:', data);

      const convCount = data.deleted?.conversations || 0;
      toast.success(`Contato "${displayName}" excluido`, {
        description: convCount > 0
          ? `${convCount} conversa${convCount > 1 ? 's' : ''} e todas as mensagens foram removidas.`
          : 'Nenhuma conversa vinculada.',
        duration: 5000,
      });

      onOpenChange(false);
      onSuccess();

    } catch (error) {
      console.error('❌ [DELETE CONTACT] Excecao:', error);
      toast.error('Erro inesperado ao excluir contato');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 bg-white border border-[#E5E7EB] overflow-hidden rounded-xl">
        {/* Barra vermelha decorativa */}
        <div className="h-1 w-full bg-gradient-to-r from-[#EF4444] to-[#F87171]" />

        <div className="px-6 pt-5 pb-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <DialogTitle className="text-[16px] font-semibold text-[#1B1B1B] leading-tight">
                  Excluir contato?
                </DialogTitle>
                <DialogDescription className="text-[13px] text-[#6B7280] leading-relaxed">
                  Esta acao e permanente e nao pode ser desfeita.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Card com dados do contato */}
          <div className="mt-5 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {displayName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1B1B1B] truncate">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-[#9CA3AF] flex-shrink-0" />
                  <p className="text-[12px] text-[#6B7280] truncate font-mono">
                    {formatPhone(contact.phone_number || contact.wa_id || '')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Aviso detalhado */}
          <div className="mt-4 flex items-start gap-2.5 text-[12px] text-[#92400E] bg-[#FEF3C7] rounded-lg px-3 py-2.5 border border-[#FDE68A]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed space-y-1">
              <p className="font-medium">Serao excluidos permanentemente:</p>
              <ul className="list-disc list-inside text-[#92400E]/90 space-y-0.5 ml-0.5">
                <li>Todas as conversas e mensagens</li>
                <li>Anotacoes e agendamentos</li>
                <li>Tags vinculadas</li>
              </ul>
            </div>
          </div>

          {/* Botoes */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
              className="flex-1 h-10 text-[13px] font-medium text-[#4B5563] hover:bg-[#F3F3F3] rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 h-10 text-[13px] font-medium bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg shadow-sm disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir contato
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
