import { useState, useEffect, useRef } from 'react';
import { X, Loader2, StickyNote, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'sonner';

interface Note {
  id: number;
  contact_id: number;
  user_id: string;
  note_text: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: number;
  contactName: string;
}

export function NotesDialog({
  open,
  onOpenChange,
  contactId,
  contactName
}: NotesDialogProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const notesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && contactId) {
      fetchNotes();
    }
  }, [open, contactId]);

  // Auto-scroll para a nota mais recente
  useEffect(() => {
    if (notes.length > 0 && notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes]);

  async function fetchNotes() {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/contacts/${contactId}/notes`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao buscar anotações');
      }

      setNotes(data.notes || []);
      
    } catch (err) {
      console.error('Erro ao buscar anotações:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar anotações');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newNote.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/contacts/${contactId}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            note_text: newNote.trim(),
            token: session.access_token
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao criar anotação');
      }

      setNewNote('');
      await fetchNotes();
      toast.success('Nota adicionada');
      
    } catch (err) {
      console.error('Erro ao criar anotação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar anotação');
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  function getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || 'U';
  }

  // Paleta de cores para avatares (8 tons de azul do DS)
  const avatarColors = [
    '#0023D5', '#1E40AF', '#1D4ED8', '#2563EB',
    '#3B82F6', '#0284C7', '#0369A1', '#1E3A8A'
  ];

  function getAvatarColor(name?: string): string {
    if (!name) return avatarColors[0];
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] flex flex-col p-0 gap-0 bg-white border border-[#E5E7EB] overflow-hidden rounded-xl">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex-shrink-0">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-[15px] font-semibold text-[#1B1B1B] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0023D5] flex items-center justify-center flex-shrink-0">
                <StickyNote className="w-4 h-4 text-white" />
              </div>
              Notas
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#6B7280] pl-[42px]">
              {contactName}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <span className="text-[12px] text-red-700 flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors duration-150">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto min-h-[240px] max-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#0023D5]" />
              <span className="text-[13px] text-[#9CA3AF]">Carregando notas...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] flex items-center justify-center mb-1">
                <StickyNote className="w-6 h-6 text-[#E5E7EB]" />
              </div>
              <p className="text-[13px] font-medium text-[#9CA3AF]">Nenhuma nota ainda</p>
              <p className="text-[12px] text-[#D1D5DB]">Adicione a primeira nota abaixo</p>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-0">
              {notes.map((note, index) => (
                <div key={note.id} className="group">
                  {/* Separator between notes */}
                  {index > 0 && (
                    <div className="border-t border-[#F3F3F3] my-4" />
                  )}
                  
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: getAvatarColor(note.user_name) }}
                    >
                      <span className="text-[10px] font-semibold text-white leading-none">
                        {getInitials(note.user_name)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium text-[#1B1B1B] truncate">
                          {note.user_name || 'Usuário'}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">
                          {formatDate(note.created_at)}
                        </span>
                      </div>

                      {/* Note text */}
                      <p className="text-[13px] text-[#4B5563] leading-relaxed whitespace-pre-wrap break-words">
                        {note.note_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={notesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva uma nota..."
              rows={2}
              className="resize-none bg-white border-[#E5E7EB] focus:border-[#0023D5] focus:ring-1 focus:ring-[#0023D5]/20 text-[13px] text-[#1B1B1B] placeholder:text-[#9CA3AF] rounded-lg transition-all duration-150"
              disabled={submitting}
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#D1D5DB]">
                Ctrl+Enter para enviar
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                  className="text-[12px] text-[#6B7280] hover:text-[#1B1B1B] hover:bg-[#F3F3F3] h-8 px-3 rounded-lg transition-colors duration-150"
                >
                  Fechar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !newNote.trim()}
                  className="bg-[#0023D5] hover:bg-[#001AAA] text-white text-[12px] h-8 px-4 rounded-lg transition-colors duration-150 disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}