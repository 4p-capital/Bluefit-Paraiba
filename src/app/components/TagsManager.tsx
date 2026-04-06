import { useState, useEffect } from 'react';
import { Tag, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/app/lib/supabase';

interface TagType {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface TagsManagerProps {
  conversationId: string;
  currentTags: string[];
  onTagsUpdate: (tags: string[]) => void;
}

const PREDEFINED_TAGS: TagType[] = [
  { id: '1', name: 'Vendas', color: '#10b981', description: 'Interessado em produtos/serviços' },
  { id: '2', name: 'Suporte', color: '#3b82f6', description: 'Solicitação de ajuda técnica' },
  { id: '3', name: 'Reclamação', color: '#ef4444', description: 'Cliente insatisfeito' },
  { id: '4', name: 'Cancelamento', color: '#f59e0b', description: 'Solicitação de cancelamento' },
  { id: '5', name: 'Dúvida', color: '#8b5cf6', description: 'Pergunta ou dúvida' },
  { id: '6', name: 'Urgente', color: '#dc2626', description: 'Requer atenção imediata' },
  { id: '7', name: 'Orçamento', color: '#0891b2', description: 'Solicitação de orçamento' },
  { id: '8', name: 'Feedback', color: '#14b8a6', description: 'Opinião ou sugestão' },
];

const TAG_COLORS = [
  '#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', 
  '#dc2626', '#0891b2', '#14b8a6', '#ec4899', '#6366f1'
];

export function TagsManager({ conversationId, currentTags, onTagsUpdate }: TagsManagerProps) {
  const [open, setOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [newTagDescription, setNewTagDescription] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    setSelectedTags(currentTags);
  }, [currentTags]);

  function loadTags() {
    const stored = localStorage.getItem('conversation_tags');
    if (stored) {
      setAvailableTags(JSON.parse(stored));
    } else {
      setAvailableTags(PREDEFINED_TAGS);
      saveTags(PREDEFINED_TAGS);
    }
  }

  function saveTags(tags: TagType[]) {
    localStorage.setItem('conversation_tags', JSON.stringify(tags));
  }

  function handleToggleTag(tagName: string) {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    
    setSelectedTags(newTags);
  }

  async function handleSaveTags() {
    try {
      // Atualizar tags no banco de dados
      const { error } = await supabase
        .from('conversations')
        .update({ tags: selectedTags })
        .eq('id', conversationId);

      if (error) throw error;

      onTagsUpdate(selectedTags);
      setOpen(false);
      toast.success('Tags atualizadas com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar tags:', error);
      toast.error('Erro ao atualizar tags');
    }
  }

  function handleCreateTag() {
    if (!newTagName.trim()) {
      toast.error('Digite um nome para a tag');
      return;
    }

    const newTag: TagType = {
      id: `custom_${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
      description: newTagDescription.trim(),
    };

    const updated = [...availableTags, newTag];
    setAvailableTags(updated);
    saveTags(updated);
    
    setCreateDialogOpen(false);
    setNewTagName('');
    setNewTagColor(TAG_COLORS[0]);
    setNewTagDescription('');
    
    toast.success('Tag criada com sucesso');
  }

  function handleDeleteTag(tagId: string) {
    const updated = availableTags.filter(t => t.id !== tagId);
    setAvailableTags(updated);
    saveTags(updated);
    
    // Remover a tag das selecionadas se estiver presente
    const tagToDelete = availableTags.find(t => t.id === tagId);
    if (tagToDelete) {
      setSelectedTags(selectedTags.filter(t => t !== tagToDelete.name));
    }
    
    toast.success('Tag excluída');
  }

  function getTagColor(tagName: string): string {
    const tag = availableTags.find(t => t.name === tagName);
    return tag?.color || '#64748b';
  }

  return (
    <>
      {/* Tag Display Badges */}
      <div className="flex flex-wrap gap-2">
        {currentTags.map((tagName) => (
          <Badge
            key={tagName}
            className="text-white border-0"
            style={{ backgroundColor: getTagColor(tagName) }}
          >
            {tagName}
          </Badge>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-6 px-2 text-xs border-dashed"
        >
          <Tag className="w-3 h-3 mr-1" />
          {currentTags.length > 0 ? 'Editar' : 'Adicionar tag'}
        </Button>
      </div>

      {/* Tags Management Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#0023D5]" />
              Gerenciar Tags
            </DialogTitle>
            <DialogDescription>
              Adicione tags para categorizar e organizar a conversa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Available Tags */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Tags Disponíveis
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                  className="h-8 text-xs text-[#0023D5]"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Nova Tag
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
                {availableTags.map((tag) => (
                  <div key={tag.id} className="relative group">
                    <Badge
                      className={`cursor-pointer transition-all text-white border-2 ${
                        selectedTags.includes(tag.name)
                          ? 'ring-2 ring-offset-2 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ 
                        backgroundColor: tag.color,
                        borderColor: selectedTags.includes(tag.name) ? tag.color : 'transparent'
                      }}
                      onClick={() => handleToggleTag(tag.name)}
                    >
                      {tag.name}
                      {selectedTags.includes(tag.name) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                    {tag.id.startsWith('custom_') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTag(tag.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Tags Preview */}
            {selectedTags.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Tags Selecionadas ({selectedTags.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tagName) => {
                    const tag = availableTags.find(t => t.name === tagName);
                    return (
                      <Badge
                        key={tagName}
                        className="text-white"
                        style={{ backgroundColor: tag?.color }}
                      >
                        {tagName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveTags}
              className="bg-[#0023D5] hover:bg-[#0023D5]/90"
            >
              Salvar Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tag Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Tag</DialogTitle>
            <DialogDescription>
              Crie uma tag personalizada para suas necessidades
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nome da Tag *
              </label>
              <Input
                placeholder="Ex: VIP, Urgente, Importante..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                maxLength={20}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Cor
              </label>
              <div className="flex gap-2 flex-wrap">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      newTagColor === color ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color, ringColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Descrição (opcional)
              </label>
              <Input
                placeholder="Quando usar esta tag..."
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
              />
            </div>

            {/* Preview */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <Badge
                className="text-white"
                style={{ backgroundColor: newTagColor }}
              >
                {newTagName || 'Nome da tag'}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTag}
              className="bg-[#0023D5] hover:bg-[#0023D5]/90"
            >
              Criar Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}