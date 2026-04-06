import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface ScheduleCallbackDialogProps {
  conversationId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScheduleCallbackDialog({
  conversationId,
  open,
  onOpenChange,
  onSuccess
}: ScheduleCallbackDialogProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Preencher automaticamente data/hora quando abrir a modal
  useEffect(() => {
    if (open) {
      // Pegar data/hora atual + 1 hora
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0); // Arredondar para hora cheia
      
      // Formatar data (YYYY-MM-DD para input type="date")
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      
      // Formatar hora (HH:mm para input type="time")
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
      
      // Limpar observações
      setNotes('');
    }
  }, [open]);

  async function handleSchedule() {
    if (!date || !time) {
      toast.error('Por favor, preencha a data e hora do retorno');
      return;
    }

    // Validar se a data/hora é no futuro
    const scheduledDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (scheduledDateTime <= now) {
      toast.error('A data/hora do retorno deve ser no futuro');
      return;
    }

    setIsScheduling(true);

    try {
      // Buscar token da sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/callbacks/schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': session.access_token
          },
          body: JSON.stringify({
            conversationId,
            scheduledAt: scheduledDateTime.toISOString(),
            notes: notes.trim() || null
          })
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao agendar retorno');
      }

      console.log('✅ Retorno agendado com sucesso:', result.callback);

      toast.success(`Retorno agendado para ${formatDateTime(scheduledDateTime)}`);
      
      // Limpar campos
      setDate('');
      setTime('');
      setNotes('');
      
      // Fechar modal
      onOpenChange(false);
      
      // Callback de sucesso
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('❌ Erro ao agendar retorno:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao agendar retorno');
    } finally {
      setIsScheduling(false);
    }
  }

  function formatDateTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0023D5]/10">
              <Calendar className="w-5 h-5 text-[#0023D5]" />
            </div>
            Agendar Retorno de Contato
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Agende um horário para retornar o contato automaticamente com o template do WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Data do Retorno */}
          <div className="space-y-2.5">
            <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
              Data do Retorno
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-11 h-12 text-base border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]"
                required
              />
            </div>
          </div>

          {/* Horário do Retorno */}
          <div className="space-y-2.5">
            <Label htmlFor="time" className="text-sm font-semibold text-gray-700">
              Horário do Retorno
            </Label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-11 h-12 text-base border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]"
                required
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2.5">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o agendamento..."
              className="min-h-[90px] resize-none text-base border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]"
            />
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#0023D5] rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0023D5]">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">
                  O template <span className="font-semibold text-[#0023D5]">"retornar_contato"</span> será enviado automaticamente no horário agendado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isScheduling}
            className="flex-1 h-11 text-base border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSchedule}
            disabled={isScheduling || !date || !time}
            className="flex-1 h-11 text-base bg-[#0023D5] hover:bg-[#0023D5]/90 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {isScheduling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Agendando...
              </>
            ) : (
              'Agendar Retorno'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}