import { useState, useEffect } from 'react';
import { Zap, Plus, Edit2, Trash2, Search, Star, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface QuickReply {
  id: string;
  title: string;
  message: string;
  category: string;
  favorite: boolean;
  usage_count: number;
}

interface QuickRepliesProps {
  open: boolean;
  onClose: () => void;
  onSelectReply: (message: string) => void;
  userId: string;
}

const DEFAULT_REPLIES: QuickReply[] = [
  {
    id: '1',
    title: 'Saudação',
    message: 'Olá! Seja bem-vindo(a) à Bluefit! Como posso ajudá-lo(a) hoje?',
    category: 'Saudações',
    favorite: true,
    usage_count: 0,
  },
  {
    id: '2',
    title: 'Horário de Funcionamento',
    message: 'Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Nos finais de semana e feriados não há expediente.',
    category: 'Informações',
    favorite: false,
    usage_count: 0,
  },
  {
    id: '3',
    title: 'Aguarde',
    message: 'Por favor, aguarde um momento enquanto verifico essas informações para você.',
    category: 'Atendimento',
    favorite: true,
    usage_count: 0,
  },
  {
    id: '4',
    title: 'Encerramento',
    message: 'Foi um prazer atendê-lo(a)! Se precisar de mais alguma coisa, estamos à disposição. Tenha um ótimo dia!',
    category: 'Encerramento',
    favorite: true,
    usage_count: 0,
  },
  {
    id: '5',
    title: 'Informações Incompletas',
    message: 'Para melhor atendê-lo(a), preciso de algumas informações adicionais. Poderia me fornecer mais detalhes?',
    category: 'Atendimento',
    favorite: false,
    usage_count: 0,
  },
];

export function QuickReplies({ open, onClose, onSelectReply, userId }: QuickRepliesProps) {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<QuickReply | null>(null);
  const [formData, setFormData] = useState({ title: '', message: '', category: '' });

  useEffect(() => {
    loadReplies();
  }, [userId]);

  function loadReplies() {
    const stored = localStorage.getItem(`quick_replies_${userId}`);
    if (stored) {
      setReplies(JSON.parse(stored));
    } else {
      setReplies(DEFAULT_REPLIES);
      saveReplies(DEFAULT_REPLIES);
    }
  }

  function saveReplies(repliesToSave: QuickReply[]) {
    localStorage.setItem(`quick_replies_${userId}`, JSON.stringify(repliesToSave));
  }

  function handleSelectReply(reply: QuickReply) {
    // Incrementar contador de uso
    const updated = replies.map(r => 
      r.id === reply.id ? { ...r, usage_count: r.usage_count + 1 } : r
    );
    setReplies(updated);
    saveReplies(updated);
    
    onSelectReply(reply.message);
    onClose();
    
    toast.success('Resposta rápida inserida', {
      description: reply.title,
    });
  }

  function handleCreateReply() {
    setEditingReply(null);
    setFormData({ title: '', message: '', category: 'Geral' });
    setEditDialogOpen(true);
  }

  function handleEditReply(reply: QuickReply) {
    setEditingReply(reply);
    setFormData({
      title: reply.title,
      message: reply.message,
      category: reply.category,
    });
    setEditDialogOpen(true);
  }

  function handleSaveReply() {
    if (!formData.title || !formData.message) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingReply) {
      // Editar existente
      const updated = replies.map(r =>
        r.id === editingReply.id
          ? { ...r, title: formData.title, message: formData.message, category: formData.category }
          : r
      );
      setReplies(updated);
      saveReplies(updated);
      toast.success('Resposta rápida atualizada');
    } else {
      // Criar nova
      const newReply: QuickReply = {
        id: `custom_${Date.now()}`,
        title: formData.title,
        message: formData.message,
        category: formData.category,
        favorite: false,
        usage_count: 0,
      };
      const updated = [...replies, newReply];
      setReplies(updated);
      saveReplies(updated);
      toast.success('Resposta rápida criada');
    }

    setEditDialogOpen(false);
    setFormData({ title: '', message: '', category: '' });
  }

  function handleDeleteReply(replyId: string) {
    const updated = replies.filter(r => r.id !== replyId);
    setReplies(updated);
    saveReplies(updated);
    toast.success('Resposta rápida excluída');
  }

  function toggleFavorite(replyId: string) {
    const updated = replies.map(r =>
      r.id === replyId ? { ...r, favorite: !r.favorite } : r
    );
    setReplies(updated);
    saveReplies(updated);
  }

  const filteredReplies = replies.filter(reply =>
    reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(replies.map(r => r.category))];

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#0023D5]" />
              Respostas Rápidas
            </DialogTitle>
            <DialogDescription>
              Selecione uma resposta pronta ou crie suas próprias
            </DialogDescription>
          </DialogHeader>

          {/* Search and Actions */}
          <div className="px-6 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input
                  placeholder="Buscar respostas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleCreateReply}
                size="sm"
                className="bg-[#0023D5] hover:bg-[#0023D5]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova
              </Button>
            </div>
          </div>

          {/* Replies List */}
          <ScrollArea className="h-96 px-6">
            {categories.map(category => {
              const categoryReplies = filteredReplies.filter(r => r.category === category);
              if (categoryReplies.length === 0) return null;

              return (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold text-[#4B5563] mb-3 flex items-center gap-2">
                    {category}
                    <Badge variant="secondary" className="text-xs">
                      {categoryReplies.length}
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {categoryReplies.map((reply) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group p-4 rounded-lg border border-[#E5E7EB] hover:border-[#0023D5] hover:bg-[#E6EAFF]/50 transition-all cursor-pointer"
                        onClick={() => handleSelectReply(reply)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-[#1B1B1B]">{reply.title}</h4>
                              {reply.favorite && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                              {reply.usage_count > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {reply.usage_count} usos
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#4B5563] line-clamp-2">
                              {reply.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(reply.id);
                              }}
                            >
                              <Star className={`w-4 h-4 ${reply.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditReply(reply);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReply(reply.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredReplies.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Zap className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">Nenhuma resposta encontrada</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tente outro termo de busca ou crie uma nova
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReply ? 'Editar Resposta Rápida' : 'Nova Resposta Rápida'}
            </DialogTitle>
            <DialogDescription>
              Crie respostas prontas para agilizar seu atendimento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Título *
              </label>
              <Input
                placeholder="Ex: Saudação Inicial"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Categoria *
              </label>
              <Input
                placeholder="Ex: Saudações, Atendimento, Encerramento"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Mensagem *
              </label>
              <Textarea
                placeholder="Digite a mensagem que será enviada..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.message.length} caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveReply}
              className="bg-[#0023D5] hover:bg-[#0023D5]/90"
            >
              {editingReply ? 'Salvar Alterações' : 'Criar Resposta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}