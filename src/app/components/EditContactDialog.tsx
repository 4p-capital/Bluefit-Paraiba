import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { User, Phone, Building2, Tag, AlertTriangle, UserCheck, Loader2 } from 'lucide-react';

interface Contact {
  id: string;
  wa_id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  display_name: string;
  situation: string;
  unit_id: string;
  created_at: string;
  updated_at: string;
}

interface Unit {
  id: string;
  name: string;
}

interface UnitAttendant {
  id: string;
  nome: string | null;
  sobrenome: string | null;
  email: string;
  cargo?: { id: number; papeis: string } | null;
}

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  canEditUnit?: boolean; // Apenas Supervisor+ pode alterar unidade
  onSuccess: () => void;
}

export function EditContactDialog({ open, onOpenChange, contact, canEditUnit = true, onSuccess }: EditContactDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [situation, setSituation] = useState('lead');
  const [unitId, setUnitId] = useState('');
  const [originalUnitId, setOriginalUnitId] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  // 🏢 Estado para atendentes da nova unidade
  const [newUnitAttendants, setNewUnitAttendants] = useState<UnitAttendant[]>([]);
  const [selectedAttendantId, setSelectedAttendantId] = useState<string>('none');
  const [loadingAttendants, setLoadingAttendants] = useState(false);

  // Detectar se a unidade foi alterada
  const unitChanged = unitId !== originalUnitId && originalUnitId !== '';

  useEffect(() => {
    if (contact) {
      setFirstName(contact.first_name || '');
      setLastName(contact.last_name || '');
      setPhoneNumber(contact.phone_number || contact.wa_id || '');
      setSituation(contact.situation || 'lead');
      const contactUnitId = contact.unit_id ? String(contact.unit_id) : '';
      setUnitId(contactUnitId);
      setOriginalUnitId(contactUnitId);
      setSelectedAttendantId('none');
      setNewUnitAttendants([]);
    }
  }, [contact]);

  useEffect(() => {
    if (open) {
      loadUnits();
    }
  }, [open]);

  // 🏢 Carregar atendentes quando a unidade muda
  useEffect(() => {
    if (unitChanged && unitId) {
      loadNewUnitAttendants(unitId);
    } else {
      setNewUnitAttendants([]);
      setSelectedAttendantId('none');
    }
  }, [unitId, unitChanged]);

  async function loadUnits() {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Erro ao carregar unidades:', error);
        return;
      }

      setUnits(data || []);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
    }
  }

  async function loadNewUnitAttendants(targetUnitId: string) {
    try {
      setLoadingAttendants(true);
      console.log('👥 [EDIT CONTACT] Carregando atendentes da unidade:', targetUnitId);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, nome, sobrenome, email,
          cargo:cargos!profiles_id_cargo_fkey(id, papeis)
        `)
        .eq('ativo', true)
        .eq('id_unidade', targetUnitId)
        .order('nome');

      if (error) {
        console.error('❌ [EDIT CONTACT] Erro ao buscar atendentes da nova unidade:', error);
        setNewUnitAttendants([]);
        return;
      }

      console.log(`✅ [EDIT CONTACT] ${data?.length || 0} atendente(s) encontrado(s) na unidade ${targetUnitId}`);
      setNewUnitAttendants(data || []);
      setSelectedAttendantId('none');
    } catch (error) {
      console.error('❌ [EDIT CONTACT] Exceção ao buscar atendentes:', error);
      setNewUnitAttendants([]);
    } finally {
      setLoadingAttendants(false);
    }
  }

  function handleUnitChange(newUnitId: string) {
    setUnitId(newUnitId);
  }

  function formatPhoneNumber(value: string): string {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Formata: +55 (11) 99999-9999
    if (numbers.length <= 2) {
      return `+${numbers}`;
    } else if (numbers.length <= 4) {
      return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`;
    } else if (numbers.length <= 9) {
      return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    } else {
      return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
    }
  }

  function handlePhoneChange(value: string) {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }
    
    // Validar formato do telefone (deve ter pelo menos 10 dígitos)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Telefone inválido', {
        description: 'O telefone deve ter no mínimo 10 dígitos (DDD + número)',
      });
      return;
    }
    
    if (cleanPhone.length > 15) {
      toast.error('Telefone muito longo', {
        description: 'O telefone deve ter no máximo 15 dígitos',
      });
      return;
    }

    if (!unitId) {
      toast.error('Unidade é obrigatória');
      return;
    }

    if (!contact) return;

    setLoading(true);

    try {
      // Gerar display_name
      const displayName = `${firstName} ${lastName}`.trim();
      
      // 🔄 Detectar mudança de unidade para desatribuir operador
      const isUnitChange = unitChanged;

      // 🏢 Determinar o novo responsável (se selecionado)
      const newResponsavel = isUnitChange && selectedAttendantId !== 'none' ? selectedAttendantId : null;

      const contactUpdateData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: displayName,
        phone_number: cleanPhone,
        wa_id: cleanPhone, // 📱 Atualizar wa_id junto com phone_number para sincronizar
        situation: situation,
        unit_id: unitId,
        updated_at: new Date().toISOString()
      };

      // 🏢 Se a unidade mudou, atualizar o responsável do contato
      if (isUnitChange) {
        contactUpdateData.id_profile_responsavel = newResponsavel;
        console.log('🔄 [UNIT CHANGE] Unidade alterada de', originalUnitId, 'para', unitId);
        console.log('🔄 [UNIT CHANGE] Novo responsável:', newResponsavel || 'nenhum (sem atribuição)');
      }

      const { error } = await supabase
        .from('contacts')
        .update(contactUpdateData)
        .eq('id', contact.id);

      if (error) {
        console.error('Erro ao atualizar contato:', error);
        toast.error('Erro ao atualizar contato: ' + error.message);
        return;
      }

      // 🔄 Sincronizar unit_id nas conversas vinculadas a este contato
      // Isso garante que a tag de unidade na conversa reflita a unidade atual do contato
      const convUpdateData: any = {
        unit_id: unitId,
        updated_at: new Date().toISOString()
      };

      // 🏢 Se a unidade mudou, atribuir o novo atendente (ou desatribuir)
      if (isUnitChange) {
        convUpdateData.assigned_user_id = newResponsavel;
        convUpdateData.assigned_at = newResponsavel ? new Date().toISOString() : null;
        console.log('🔄 [UNIT CHANGE] Atualizando conversas - novo assigned_user_id:', newResponsavel || 'null');
      }

      const { error: convSyncError } = await supabase
        .from('conversations')
        .update(convUpdateData)
        .eq('contact_id', contact.id);

      if (convSyncError) {
        console.warn('⚠️ Contato atualizado, mas conversas não foram sincronizadas:', convSyncError);
      } else {
        console.log('✅ Conversas sincronizadas com nova unidade do contato');
      }

      if (isUnitChange) {
        const newUnitName = units.find(u => String(u.id) === unitId)?.name || 'nova unidade';
        if (newResponsavel) {
          const attendant = newUnitAttendants.find(a => a.id === newResponsavel);
          const attendantName = [attendant?.nome, attendant?.sobrenome].filter(Boolean).join(' ') || attendant?.email || 'atendente';
          toast.success(`Contato transferido para ${newUnitName}`, {
            description: `Atribuído para ${attendantName}.`,
            duration: 6000,
          });
        } else {
          toast.success(`Contato transferido para ${newUnitName}`, {
            description: 'O contato aparecerá como "sem atendente" na nova unidade.',
            duration: 6000,
          });
        }
      } else {
        toast.success('Contato atualizado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      toast.error('Erro ao atualizar contato');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0023D5] to-[#00e5ff] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Editar Contato
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Atualize as informações do contato.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome e Sobrenome */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0023D5]" />
                Nome *
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Digite o nome"
                required
                className="border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Sobrenome
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Digite o sobrenome"
                className="border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]"
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#0023D5]" />
              Telefone *
            </Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Digite o telefone"
              className="border-gray-300 bg-white focus:border-[#0023D5] focus:ring-[#0023D5] font-mono"
            />
            <p className="text-xs text-gray-500">
              Formato: 5511999999999 (código do país + DDD + número)
            </p>
          </div>

          {/* Unidade */}
          <div className="space-y-2">
            <Label htmlFor="unit" className="text-sm font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#0023D5]" />
              Unidade *
            </Label>
            <Select value={unitId} onValueChange={handleUnitChange} required disabled={!canEditUnit}>
              <SelectTrigger className={`border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5] ${unitChanged ? 'border-amber-400 ring-1 ring-amber-200' : ''} ${!canEditUnit ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={String(unit.id)} value={String(unit.id)}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canEditUnit && (
              <p className="text-xs text-gray-500">
                Apenas supervisores e gerentes podem alterar a unidade
              </p>
            )}
            {unitChanged && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <div className="text-xs">
                  <p className="font-semibold">Transferência de unidade</p>
                  <p className="mt-0.5 text-amber-700">
                    O atendente atual será desatribuído. Selecione abaixo um novo responsável da unidade de destino, ou deixe sem atribuição.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 🏢 Selecionar atendente da nova unidade (aparece só quando unidade muda) */}
          {unitChanged && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Novo responsável ({units.find(u => String(u.id) === unitId)?.name || 'nova unidade'})
              </Label>
              {loadingAttendants ? (
                <div className="flex items-center gap-2 h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0023D5]" />
                  <span className="text-sm text-gray-500">Carregando atendentes...</span>
                </div>
              ) : (
                <Select value={selectedAttendantId} onValueChange={setSelectedAttendantId}>
                  <SelectTrigger className="border-amber-300 focus:border-amber-500 focus:ring-amber-500/20">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-gray-500">Sem atribuição</span>
                      </div>
                    </SelectItem>
                    {newUnitAttendants.length === 0 && !loadingAttendants && (
                      <SelectItem value="no-attendants" disabled>
                        <span className="text-sm text-gray-400 italic">Nenhum atendente nesta unidade</span>
                      </SelectItem>
                    )}
                    {newUnitAttendants.map(attendant => {
                      const nomeCompleto = [attendant.nome, attendant.sobrenome].filter(Boolean).join(' ') || attendant.email || 'Sem nome';
                      const initials = (attendant.nome?.[0] || '') + (attendant.sobrenome?.[0] || '');
                      const cargoLabel = attendant.cargo?.papeis || '';

                      return (
                        <SelectItem key={attendant.id} value={attendant.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#E6EAFF] flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold text-[#0023D5]">{initials.toUpperCase() || '??'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-gray-900">{nomeCompleto}</span>
                              {cargoLabel && (
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{cargoLabel}</span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {selectedAttendantId !== 'none' && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  O contato e todas as conversas serão atribuídos a este atendente
                </p>
              )}
            </div>
          )}

          {/* Situação */}
          <div className="space-y-2">
            <Label htmlFor="situation" className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#0023D5]" />
              Situação *
            </Label>
            <Select value={situation} onValueChange={setSituation} required>
              <SelectTrigger className="border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={unitChanged 
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                : "bg-gradient-to-r from-[#0023D5] to-[#0023D5] hover:from-[#0023D5]/90 hover:to-[#0023D5]/90"
              }
            >
              {loading ? 'Salvando...' : unitChanged ? 'Transferir e Salvar' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}