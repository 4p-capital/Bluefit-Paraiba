import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1`;

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface BusinessHoursConfig {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  autoReply: {
    enabled: boolean;
    message: string;
  };
}

const DAYS_PT: { [key: string]: string } = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const DEFAULT_CONFIG: BusinessHoursConfig = {
  monday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
  tuesday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
  wednesday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
  thursday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
  friday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
  saturday: { enabled: false, slots: [{ start: '09:00', end: '13:00' }] },
  sunday: { enabled: false, slots: [{ start: '09:00', end: '13:00' }] },
  autoReply: {
    enabled: true,
    message: 'Olá! No momento estamos fora do horário de atendimento. Nosso expediente é de segunda a sexta, das 8h às 18h. Retornaremos o seu contato assim que possível. Obrigado!',
  },
};

export function BusinessHours() {
  const [config, setConfig] = useState<BusinessHoursConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [liveStatus, setLiveStatus] = useState<{ isOpen: boolean; currentTime: string; currentDay: string } | null>(null);
  const [isDefault, setIsDefault] = useState(true);

  useEffect(() => {
    loadConfig();
    checkLiveStatus();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/business-hours`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.config) {
        setConfig(data.config);
        setIsDefault(data.isDefault ?? false);

        // Migrar localStorage para o banco se houver dados antigos
        if (data.isDefault) {
          const stored = localStorage.getItem('business_hours_config');
          if (stored) {
            const localConfig = JSON.parse(stored);
            setConfig(localConfig);
            setHasChanges(true); // Marcar para salvar
            toast.info('Configuração local encontrada. Clique em "Salvar" para migrar para o servidor.');
          }
        }
      }
    } catch (error) {
      // Fallback: tentar carregar do localStorage
      const stored = localStorage.getItem('business_hours_config');
      if (stored) {
        setConfig(JSON.parse(stored));
        toast.warning('Não foi possível carregar do servidor. Usando configuração local.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/business-hours`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setHasChanges(false);
        setIsDefault(false);
        // Limpar localStorage antigo (migração concluída)
        localStorage.removeItem('business_hours_config');
        toast.success('Configurações salvas com sucesso!');
        // Atualizar status ao vivo
        checkLiveStatus();
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function checkLiveStatus() {
    setChecking(true);
    try {
      const response = await fetch(`${API_BASE}/api/business-hours/check`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLiveStatus({
            isOpen: data.isOpen,
            currentTime: data.debug?.currentTime || '',
            currentDay: data.debug?.currentDay || '',
          });
        }
      }
    } catch (error) {
      // Status check failed silently
    } finally {
      setChecking(false);
    }
  }

  function handleDayToggle(day: keyof BusinessHoursConfig) {
    if (day === 'autoReply') return;
    
    setConfig({
      ...config,
      [day]: {
        ...config[day],
        enabled: !config[day].enabled,
      },
    });
    setHasChanges(true);
  }

  function handleTimeChange(day: keyof BusinessHoursConfig, slotIndex: number, field: 'start' | 'end', value: string) {
    if (day === 'autoReply') return;
    
    const daySchedule = config[day] as DaySchedule;
    const updatedSlots = [...daySchedule.slots];
    updatedSlots[slotIndex][field] = value;

    setConfig({
      ...config,
      [day]: {
        ...daySchedule,
        slots: updatedSlots,
      },
    });
    setHasChanges(true);
  }

  function handleAddSlot(day: keyof BusinessHoursConfig) {
    if (day === 'autoReply') return;
    
    const daySchedule = config[day] as DaySchedule;
    setConfig({
      ...config,
      [day]: {
        ...daySchedule,
        slots: [...daySchedule.slots, { start: '08:00', end: '18:00' }],
      },
    });
    setHasChanges(true);
  }

  function handleRemoveSlot(day: keyof BusinessHoursConfig, slotIndex: number) {
    if (day === 'autoReply') return;
    
    const daySchedule = config[day] as DaySchedule;
    if (daySchedule.slots.length <= 1) {
      toast.error('Cada dia deve ter pelo menos um horário');
      return;
    }

    const updatedSlots = daySchedule.slots.filter((_, index) => index !== slotIndex);
    setConfig({
      ...config,
      [day]: {
        ...daySchedule,
        slots: updatedSlots,
      },
    });
    setHasChanges(true);
  }

  function handleAutoReplyToggle() {
    setConfig({
      ...config,
      autoReply: {
        ...config.autoReply,
        enabled: !config.autoReply.enabled,
      },
    });
    setHasChanges(true);
  }

  function handleAutoReplyMessageChange(message: string) {
    setConfig({
      ...config,
      autoReply: {
        ...config.autoReply,
        message,
      },
    });
    setHasChanges(true);
  }

  // Calcular status local (para exibição imediata)
  function isCurrentlyOpen(): boolean {
    const now = new Date();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const daySchedule = config[dayOfWeek as keyof BusinessHoursConfig] as DaySchedule;
    
    if (!daySchedule.enabled) return false;
    
    return daySchedule.slots.some(slot => {
      return currentTime >= slot.start && currentTime < slot.end;
    });
  }

  // Usar status do servidor (se disponível) ou cálculo local
  const serverIsOpen = liveStatus?.isOpen;
  const currentlyOpen = serverIsOpen !== undefined ? serverIsOpen : isCurrentlyOpen();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0023D5] mb-3" />
        <span className="text-sm text-[#6B7280]">Carregando configuração de horários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="border border-[#E5E7EB]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#1B1B1B]">
                <Clock className="w-5 h-5 text-[#0023D5]" />
                Status Atual
                {liveStatus && (
                  <span className="text-xs font-normal text-[#9CA3AF]">
                    (servidor: {liveStatus.currentTime} - {DAYS_PT[liveStatus.currentDay] || liveStatus.currentDay})
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-[#6B7280]">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={checkLiveStatus}
                disabled={checking}
                className="text-[#6B7280] hover:text-[#0023D5]"
                title="Verificar status no servidor"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              </Button>
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                currentlyOpen 
                  ? 'bg-[#D1FAE5] text-[#065F46]' 
                  : 'bg-[#FEE2E2] text-[#991B1B]'
              }`}>
                {currentlyOpen ? 'Aberto' : 'Fechado'}
              </div>
            </div>
          </div>
        </CardHeader>
        {isDefault && (
          <CardContent>
            <div className="flex items-start gap-2 p-3 bg-[#FEF3C7] rounded-lg border border-[#FDE68A]">
              <AlertCircle className="w-4 h-4 text-[#D97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#92400E]">Configuração padrão ativa</p>
                <p className="text-xs text-[#B45309] mt-0.5">
                  Os horários ainda não foram salvos no servidor. Ajuste conforme necessário e clique em "Salvar" para que o auto-reply funcione corretamente via n8n.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* n8n Integration Info */}
      <Card className="border border-[#C7D2FE] bg-[#EEF2FF]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#0023D5] rounded-lg flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E3A8A]">Integração n8n</p>
              <p className="text-xs text-[#3B82F6] mt-1">
                O n8n deve chamar o endpoint <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#1E3A8A] font-mono">POST /api/business-hours/auto-reply</code> ao receber uma mensagem inbound, enviando <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#1E3A8A] font-mono">{`{ "phone": "5511..." }`}</code>. O servidor verifica o horário e envia a resposta automática se estiver fora do expediente.
              </p>
              <p className="text-xs text-[#3B82F6] mt-1">
                Endpoint de consulta: <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#1E3A8A] font-mono">GET /api/business-hours/check</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Days Configuration */}
      <Card className="border border-[#E5E7EB]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <CardHeader>
          <CardTitle className="text-[#1B1B1B]">Horários de Atendimento</CardTitle>
          <CardDescription className="text-[#6B7280]">
            Configure os dias e horários de funcionamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(DAYS_PT).map((day) => {
            const daySchedule = config[day as keyof BusinessHoursConfig] as DaySchedule;
            
            return (
              <div key={day} className="p-4 border border-[#E5E7EB] rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={daySchedule.enabled}
                      onCheckedChange={() => handleDayToggle(day as keyof BusinessHoursConfig)}
                      className="data-[state=checked]:bg-[#0023D5]"
                    />
                    <span className="font-medium text-[#1B1B1B]">
                      {DAYS_PT[day]}
                    </span>
                  </div>
                  {daySchedule.enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSlot(day as keyof BusinessHoursConfig)}
                      className="text-xs border-[#E5E7EB] text-[#0023D5] hover:bg-[#E6EAFF]"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar Horário
                    </Button>
                  )}
                </div>

                {daySchedule.enabled && (
                  <div className="space-y-2 ml-11">
                    {daySchedule.slots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => handleTimeChange(day as keyof BusinessHoursConfig, index, 'start', e.target.value)}
                          className="w-32 border-[#E5E7EB] focus:border-[#0023D5]"
                        />
                        <span className="text-[#6B7280]">até</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => handleTimeChange(day as keyof BusinessHoursConfig, index, 'end', e.target.value)}
                          className="w-32 border-[#E5E7EB] focus:border-[#0023D5]"
                        />
                        {daySchedule.slots.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSlot(day as keyof BusinessHoursConfig, index)}
                            className="text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEE2E2]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!daySchedule.enabled && (
                  <p className="text-sm text-[#9CA3AF] ml-11">
                    Fechado neste dia
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Auto Reply Configuration */}
      <Card className="border border-[#E5E7EB]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#1B1B1B]">Resposta Automática</CardTitle>
              <CardDescription className="text-[#6B7280]">
                Mensagem enviada automaticamente fora do horário de atendimento
              </CardDescription>
            </div>
            <Switch
              checked={config.autoReply.enabled}
              onCheckedChange={handleAutoReplyToggle}
              className="data-[state=checked]:bg-[#0023D5]"
            />
          </div>
        </CardHeader>
        {config.autoReply.enabled && (
          <CardContent>
            <Textarea
              value={config.autoReply.message}
              onChange={(e) => handleAutoReplyMessageChange(e.target.value)}
              rows={5}
              placeholder="Digite a mensagem que será enviada automaticamente..."
              className="resize-none border-[#E5E7EB] focus:border-[#0023D5]"
            />
            <p className="text-xs text-[#9CA3AF] mt-2">
              {config.autoReply.message.length} caracteres
            </p>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button
            onClick={saveConfig}
            size="lg"
            disabled={saving}
            className="text-white shadow-lg"
            style={{ backgroundColor: '#0023D5' }}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
