import { useState, useEffect } from 'react';
import { X, Plus, User, Phone, Building2, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Unit } from '../types/database';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '@/app/lib/supabase';

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  accessToken: string;
}

interface FormData {
  whatsapp: string;
  nome: string;
  sobrenome: string;
  unit_id: string;
  situacao: string;
  tag_id: string;  // ✅ Mudado de tag_ids para tag_id (seleção única)
}

const situacoes = [
  { value: 'lead', label: '🎯 Lead' },
  { value: 'cliente', label: '💎 Cliente' },
];

export function CreateContactDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  accessToken 
}: CreateContactDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    whatsapp: '',
    nome: '',
    sobrenome: '',
    unit_id: '',
    situacao: 'lead',  // ✅ Mudado de 'ativo' para 'lead' (valor mais comum)
    tag_id: '',  // ✅ Inicializar tag vazia
  });
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [tags, setTags] = useState<any[]>([]);  // ✅ Adicionar estado para tags
  const [loading, setLoading] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);  // ✅ Loading para tags
  const [error, setError] = useState('');
  const [debugResponse, setDebugResponse] = useState<string>('');
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);  // ✅ Modal de duplicação
  const [duplicateInfo, setDuplicateInfo] = useState<{ name: string; phone: string } | null>(null);  // ✅ Info do contato duplicado

  // Buscar unidades ao abrir o dialog
  useEffect(() => {
    if (open) {
      fetchUnits();
      fetchTags();  // ✅ Buscar tags
    }
  }, [open, accessToken]);  // ✅ Adicionar accessToken como dependência

  async function fetchUnits() {
    setLoadingUnits(true);
    setError(''); // Limpar erro anterior
    try {
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/units`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`, // Usar Anon Key pública
          }
        }
      );


      // 🔥 VERIFICAR se a resposta é JSON antes de parsear
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        
        // Ler como texto para debug
        const textResponse = await response.text();
        
        setUnits([]);
        return;
      }

      // 🔥 USAR PARSING MANUAL PARA EVITAR ERRO DE JSON
      const responseText = await response.text();
      let data;
      try {
        // Limpar JSON antes de parsear
        const jsonStart = responseText.search(/[{\[]/);
        const cleanedText = jsonStart >= 0 ? responseText.substring(jsonStart) : responseText;
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        setUnits([]);
        return;
      }
      

      if (!response.ok) {
        
        // Não mostrar erro se não houver unidades, apenas log
        if (response.status !== 404) {
        }
        setUnits([]);
        return;
      }

      
      setUnits(data.units || []);
    } catch (err) {
      // Não bloquear o formulário se houver erro
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  }

  async function fetchTags() {
    setLoadingTags(true);
    setError(''); // Limpar erro anterior
    try {
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/tags`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`, // Usar Anon Key pública
          }
        }
      );


      // 🔥 VERIFICAR se a resposta é JSON antes de parsear
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        
        // Ler como texto para debug
        const textResponse = await response.text();
        
        setTags([]);
        return;
      }

      // 🔥 USAR PARSING MANUAL PARA EVITAR ERRO DE JSON
      const responseText = await response.text();
      let data;
      try {
        // Limpar JSON antes de parsear
        const jsonStart = responseText.search(/[{\[]/);
        const cleanedText = jsonStart >= 0 ? responseText.substring(jsonStart) : responseText;
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        setTags([]);
        return;
      }
      

      if (!response.ok) {
        
        // Não mostrar erro se não houver unidades, apenas log
        if (response.status !== 404) {
        }
        setTags([]);
        return;
      }

      
      setTags(data.tags || []);
    } catch (err) {
      // Não bloquear o formulário se houver erro
      setTags([]);
    } finally {
      setLoadingTags(false);
    }
  }

  function handleInputChange(field: keyof FormData, value: string) {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      return newData;
    });
    setError(''); // Limpar erro ao digitar
  }

  function formatWhatsApp(value: string): string {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + número, sem código do país)
    const limited = numbers.slice(0, 11);
    
    // Formata: (11) 98765-4321
    if (limited.length === 0) {
      return '';
    } else if (limited.length <= 2) {
      return `(${limited}`;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  }

  function handleWhatsAppChange(value: string) {
    const formatted = formatWhatsApp(value);
    handleInputChange('whatsapp', formatted);
  }

  function validateForm(): boolean {
    // Validar WhatsApp (deve ter pelo menos 10 dígitos)
    const numbersOnly = formData.whatsapp.replace(/\D/g, '');
    if (numbersOnly.length < 10) {
      setError('WhatsApp inválido. Digite um número completo com DDD.');
      return false;
    }

    // Validar nome
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    // Validar sobrenome
    if (!formData.sobrenome.trim()) {
      setError('Sobrenome é obrigatório');
      return false;
    }

    // Validar unidade
    if (!formData.unit_id) {
      setError('Selecione uma unidade');
      return false;
    }

    // Validar situação
    if (!formData.situacao) {
      setError('Selecione uma situação');
      return false;
    }

    return true;
  }

  async function handleSubmit(event?: React.FormEvent) {
    // Prevenir comportamento padrão do form
    if (event) {
      event.preventDefault();
    }
    
    if (!formData.whatsapp || !formData.nome || !formData.sobrenome || !formData.unit_id || !formData.situacao || !formData.tag_id) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      
      // ✅ BUSCAR TOKEN FRESCO DA SESSÃO ATUAL ANTES DE ENVIAR
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Sessão expirada. Faça login novamente.');
        return;
      }
      
      const freshToken = session.access_token;
      
      // TESTE: Primeiro chamar endpoint de teste
      
      // Usar fetch com AMBOS os headers (Authorization E apikey) para passar pelo middleware do Supabase
      const testResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/test-no-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
          },
          body: JSON.stringify({ teste: 'valor de teste' })
        }
      );
      
      // 🔥 PARSING MANUAL SEGURO
      const testResponseText = await testResponse.text();
      let testData;
      try {
        const jsonStart = testResponseText.search(/[{\[]/);
        const cleanedTestText = jsonStart >= 0 ? testResponseText.substring(jsonStart) : testResponseText;
        testData = JSON.parse(cleanedTestText);
      } catch (e) {
        setError(`Erro ao parsear resposta do teste: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
      
      
      if (!testResponse.ok) {
        setError(`Erro no endpoint de teste: ${testData.message || testData.error || 'Status ' + testResponse.status}`);
        return;
      }
      
      // 🧪 TESTE 1.5: Chamar endpoint que recebe token no body (evita middleware)
      
      const tokenBodyTestResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/test-token-in-body`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,  // Usar anon key no header
            'apikey': publicAnonKey,
          },
          body: JSON.stringify({ token: freshToken })  // Token do usuário no body
        }
      );
      
      // 🔥 PARSING MANUAL SEGURO
      const tokenBodyTestResponseText = await tokenBodyTestResponse.text();
      let tokenBodyTestData;
      try {
        const jsonStart = tokenBodyTestResponseText.search(/[{\[]/);
        const cleanedTokenBodyText = jsonStart >= 0 ? tokenBodyTestResponseText.substring(jsonStart) : tokenBodyTestResponseText;
        tokenBodyTestData = JSON.parse(cleanedTokenBodyText);
      } catch (e) {
        setError(`Erro ao parsear resposta do teste de token: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
      
      
      if (!tokenBodyTestData.success) {
        
        // Mostrar detalhes do erro
        const errorDetails = tokenBodyTestData.validationResult?.error;
        const errorMsg = errorDetails?.message || tokenBodyTestData.error || 'Token inválido (sem detalhes)';
        
        setError(`Validação de token falhou: ${errorMsg}. Verifique o console para mais detalhes.`);
        return;
      }
      
      
      
      // 🔍 DEBUG: Decodificar token JWT para ver o conteúdo
      try {
        const tokenParts = freshToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
        }
      } catch (e) {
      }
      
      // ✅ MARCO 1: USAR ENDPOINT RELACIONAL /api/contacts
      
      // 🔍 DEBUG: Construir URL e mostrar
      const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/api/contacts`;
      
      // 🧪 TESTE 1: Verificar se backend está acessível (healthcheck)
      
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-844b77a1/health`;
      
      try {
        // Adicionar timeout manual (5 segundos apenas)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 5000);
        
        
        const healthResponse = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
          }
        });
        
        clearTimeout(timeoutId);
        
        
        if (!healthResponse.ok) {
          throw new Error(`Healthcheck failed with status ${healthResponse.status}`);
        }
        
        const healthData = await healthResponse.json();
        
      } catch (healthError) {
        
        // Salvar erro no localStorage
        const healthErrorInfo = {
          timestamp: new Date().toISOString(),
          url: healthUrl,
          errorType: healthError instanceof Error ? healthError.name : typeof healthError,
          message: healthError instanceof Error ? healthError.message : String(healthError),
          stack: healthError instanceof Error ? healthError.stack : undefined,
        };
        
        try {
          localStorage.setItem('LAST_HEALTHCHECK_ERROR', JSON.stringify(healthErrorInfo));
        } catch (e) {
        }
        
        if (healthError instanceof Error && healthError.name === 'AbortError') {
          setError('⏱️ Timeout: O servidor não respondeu em 5 segundos. Verifique se o Edge Function está rodando no Supabase.');
        } else if (healthError instanceof Error && healthError.message.includes('Failed to fetch')) {
          setError('🚫 Falha ao conectar: O backend não está acessível. Possíveis causas:\n' +
                   '1. Edge Function não está deployed no Supabase\n' +
                   '2. Bloqueio de CORS\n' +
                   '3. Bloqueio de rede/proxy\n\n' +
                   'Verifique o console para mais detalhes.');
        } else {
          setError('❌ Servidor offline ou inacessível. Detalhes no console.');
        }
        return;
      }
      
      const requestBody = {
        ...formData,  // whatsapp, nome, sobrenome, unit_id, situacao
        token: freshToken  // Token do usuário no body
      };
      
      const response = await fetch(
        backendUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`, // Usar anon key no header
            'apikey': publicAnonKey,
          },
          body: JSON.stringify(requestBody)
        }
      );

      
      // 🔥 FORÇAR USO DE .text() COM LIMPEZA (PULAR .json() COMPLETAMENTE)
      
      const responseText = await response.text();
      
      
      // 🔬 HEX DUMP COMPLETO
      const maxChars = Math.min(responseText.length, 300);
      for (let i = 0; i < maxChars; i++) {
        const charCode = responseText.charCodeAt(i);
        const hex = charCode.toString(16).padStart(2, '0').toUpperCase();
        const char = charCode >= 32 && charCode <= 126 ? responseText[i] : '.';
        const description = 
          charCode === 10 ? '[LF]' : 
          charCode === 13 ? '[CR]' : 
          charCode === 9 ? '[TAB]' : 
          charCode === 32 ? '[SPACE]' : 
          charCode === 0 ? '[NULL]' : '';
        
      }
      
      // 🧹 LIMPEZA AGRESSIVA
      
      // Encontrar início do JSON
      const jsonStartIndex = responseText.search(/[{\[]/);
      
      if (jsonStartIndex === -1) {
        setError('Resposta do servidor não contém JSON válido');
        setDebugResponse(responseText);
        return;
      }
      
      if (jsonStartIndex > 0) {
        const garbage = responseText.substring(0, jsonStartIndex);
      }
      
      // Remover lixo do início
      let cleanedText = responseText.substring(jsonStartIndex);
      
      // Encontrar fim do JSON (usando parser de chaves balanceadas)
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;
      let jsonEndIndex = -1;
      
      for (let i = 0; i < cleanedText.length; i++) {
        const char = cleanedText[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{' || char === '[') braceCount++;
          if (char === '}' || char === ']') {
            braceCount--;
            if (braceCount === 0) {
              jsonEndIndex = i + 1;
              break;
            }
          }
        }
      }
      
      if (jsonEndIndex === -1) {
        setError('JSON malformado (chaves não balanceadas)');
        setDebugResponse(responseText);
        return;
      }
      
      // Verificar se há lixo no final
      if (jsonEndIndex < cleanedText.length) {
        const garbage = cleanedText.substring(jsonEndIndex);
        
        // Remover lixo do final
        cleanedText = cleanedText.substring(0, jsonEndIndex);
      } else {
      }
      
      
      // Salvar resposta original para debug
      setDebugResponse(responseText);
      
      // Tentar parsear JSON limpo
      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        
        setError('Erro ao processar resposta do servidor. Verifique o console.');
        return;
      }


      if (!response.ok || !data.success) {
        // 🔥 Tratamento especial para contato duplicado (NÃO logar como erro)
        if (data.error === 'DUPLICATE_CONTACT') {
          const existingName = data.existing_contact?.name || 'um contato';
          const existingPhone = data.whatsapp || formData.whatsapp;
          
          setDuplicateInfo({ name: existingName, phone: existingPhone });
          setShowDuplicateAlert(true);
          return;
        }
        
        // Apenas logar outros erros
        
        // 🔥 Tratamento especial para contato duplicado
        if (data.error === 'DUPLICATE_CONTACT') {
          const existingName = data.existing_contact?.name || 'um contato';
          const existingPhone = data.whatsapp || formData.whatsapp;
          
          setDuplicateInfo({ name: existingName, phone: existingPhone });
          setShowDuplicateAlert(true);
          return;
        }
        
        // Outras mensagens de erro específicas
        const errorMessage = data?.message || data?.error || 'Erro ao criar contato';
        
        if (errorMessage.includes('não encontrada')) {
          setError('❌ Unidade selecionada não encontrada');
        } else {
          setError(`❌ ${errorMessage}`);
        }
        return;
      }
      
      
      // Limpar formulário
      setFormData({
        whatsapp: '',
        nome: '',
        sobrenome: '',
        unit_id: '',
        situacao: 'lead',
        tag_id: '',  // ✅ Limpar tag
      });
      
      // Chamar callback de sucesso
      onSuccess();
      
      // Fechar dialog
      onOpenChange(false);
      
    } catch (err) {
      
      // 🚨 SALVAR ERRO NO LOCALSTORAGE ANTES DO CRASH!
      const errorInfo = {
        timestamp: new Date().toISOString(),
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        formData: formData,
      };
      
      try {
        localStorage.setItem('LAST_ERROR_CREATE_CONTACT', JSON.stringify(errorInfo));
      } catch (storageErr) {
      }
      
      setError(err instanceof Error ? err.message : 'Erro ao criar contato');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      setFormData({
        whatsapp: '',
        nome: '',
        sobrenome: '',
        unit_id: '',
        situacao: 'lead',
        tag_id: '',  // ✅ Limpar tag
      });
      setError('');
      onOpenChange(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0023D5] to-[#00e5ff] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              Criar Novo Contato
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Preencha as informações abaixo para adicionar um novo contato ao sistema.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#0023D5]"/>
                  Nome *
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Digite o nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                  className="border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sobrenome" className="text-sm font-medium">
                  Sobrenome *
                </Label>
                <Input
                  id="sobrenome"
                  type="text"
                  placeholder="Digite o sobrenome"
                  value={formData.sobrenome}
                  onChange={(e) => handleInputChange('sobrenome', e.target.value)}
                  required
                  className="border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]"
                />
              </div>
            </div>

            {/* WhatsApp com +55 fixo */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#0023D5]"/>
                WhatsApp *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-700 font-semibold text-sm">+55</span>
                </div>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={formData.whatsapp}
                  onChange={(e) => handleWhatsAppChange(e.target.value)}
                  required
                  className="pl-14 border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5] font-mono"
                />
              </div>
              <p className="text-xs text-gray-500">
                DDD + número do celular
              </p>
            </div>

            {/* Unidade */}
            <div className="space-y-2">
              <Label htmlFor="unit_id" className="text-sm font-medium flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#0023D5]"/>
                Unidade *
              </Label>
              {loadingUnits ? (
                <div className="text-sm text-gray-500 py-2">Carregando unidades...</div>
              ) : units.length > 0 ? (
                <Select
                  value={formData.unit_id}
                  onValueChange={(value) => handleInputChange('unit_id', value)}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={String(unit.id)}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500 py-2">
                  Nenhuma unidade disponível
                </p>
              )}
            </div>

            {/* Situação */}
            <div className="space-y-2">
              <Label htmlFor="situacao" className="text-sm font-medium flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#0023D5]"/>
                Situação *
              </Label>
              <Select
                value={formData.situacao}
                onValueChange={(value) => handleInputChange('situacao', value)}
                required
              >
                <SelectTrigger className="border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {situacoes.map((sit) => (
                    <SelectItem key={sit.value} value={sit.value}>
                      {sit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tag (Obrigatória) */}
            <div className="space-y-2">
              <Label htmlFor="tag_id" className="text-sm font-medium flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#0023D5]"/>
                Tag *
              </Label>
              {loadingTags ? (
                <div className="text-sm text-gray-500 py-2">Carregando tags...</div>
              ) : tags.length > 0 ? (
                <Select
                  value={formData.tag_id}
                  onValueChange={(value) => handleInputChange('tag_id', value)}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#0023D5] focus:ring-[#0023D5]">
                    <SelectValue placeholder="Selecione uma tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={String(tag.id)}>
                        <span 
                          className="inline-block px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500 py-2">
                  Nenhuma tag disponível
                </p>
              )}
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
                className="bg-gradient-to-r from-[#0023D5] to-[#0023D5] hover:from-[#0023D5]/90 hover:to-[#0023D5]/90"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Contato
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🔥 Modal de Alerta de Contato Duplicado */}
      <Dialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[#d10073]">
              <X className="w-5 h-5" />
              Contato Já Existe
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Este número de WhatsApp já está cadastrado no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            {duplicateInfo && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#0023D5]" />
                  <span className="font-mono text-gray-900">{duplicateInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[#0023D5]" />
                  <span className="text-gray-900">{duplicateInfo.name}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowDuplicateAlert(false);
                setDuplicateInfo(null);
              }}
              className="bg-[#0023D5] hover:bg-[#0023D5]/90"
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}