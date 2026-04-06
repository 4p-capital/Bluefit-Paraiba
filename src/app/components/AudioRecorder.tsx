import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, X, Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 🎤 Inicializar gravação ao montar o componente
  useEffect(() => {
    initializeRecording();
    
    return () => {
      // Cleanup ao desmontar
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  async function initializeRecording() {
    try {
      console.log('🎤 Solicitando permissão de microfone...');
      
      // Verificar se está em ambiente seguro (HTTPS ou localhost)
      if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        setPermissionError('O acesso ao microfone requer conexão segura (HTTPS). Este site não está usando HTTPS.');
        setIsInitializing(false);
        return;
      }

      // Verificar se a API de mídia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Seu navegador não suporta gravação de áudio. Por favor, use um navegador moderno como Chrome, Firefox ou Edge.');
        setIsInitializing(false);
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('✅ Permissão concedida. Iniciando gravação...');
      
      // Configurar MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : 'audio/webm';
      
      console.log('🎵 Usando formato:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Coletar chunks de áudio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Quando a gravação parar
      mediaRecorder.onstop = () => {
        console.log('⏹️ Gravação finalizada. Processando áudio...');
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        
        // Criar URL para preview
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop());
        
        console.log('✅ Áudio processado:', {
          size: (blob.size / 1024).toFixed(2) + ' KB',
          type: blob.type,
          duration: recordingTime + 's'
        });
      };

      // Iniciar gravação automaticamente
      mediaRecorder.start();
      setIsRecording(true);
      setIsInitializing(false);
      setPermissionError(null); // Limpar erro anterior
      
      // Iniciar timer
      startTimer();
      
    } catch (error) {
      console.error('❌ Erro ao acessar microfone:', error);
      
      let errorMessage = 'Erro desconhecido ao acessar o microfone.';
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Você negou o acesso ao microfone. Para gravar áudio, é necessário permitir o acesso.';
            break;
          case 'NotFoundError':
            errorMessage = 'Nenhum microfone foi encontrado no seu dispositivo. Verifique se há um microfone conectado.';
            break;
          case 'NotReadableError':
            errorMessage = 'O microfone está sendo usado por outro aplicativo. Feche outros programas que possam estar usando o microfone.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'As configurações de áudio solicitadas não são suportadas pelo seu microfone.';
            break;
          case 'SecurityError':
            errorMessage = 'Erro de segurança ao acessar o microfone. Verifique as permissões do navegador.';
            break;
          default:
            errorMessage = `Erro ao acessar o microfone: ${error.message}`;
        }
      }
      
      setPermissionError(errorMessage);
      setIsInitializing(false);
    }
  }

  function startTimer() {
    timerIntervalRef.current = window.setInterval(() => {
      setRecordingTime((prev) => {
        const newTime = prev + 1;
        
        // Parar automaticamente após 5 minutos (300 segundos)
        if (newTime >= 300) {
          handleStopRecording();
        }
        
        return newTime;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function handleStopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  }

  function handlePauseResume() {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  }

  function handlePlayPause() {
    if (!audioPlayerRef.current) return;
    
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  }

  function handleSend() {
    if (audioBlob) {
      // Validar duração mínima (pelo menos 1 segundo)
      if (recordingTime < 1) {
        alert('O áudio deve ter pelo menos 1 segundo de duração');
        return;
      }
      onRecordingComplete(audioBlob);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // 🚨 Erro de permissão
  if (permissionError) {
    const isPermissionDenied = permissionError.includes('negou') || permissionError.includes('Permission denied');
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Não foi possível acessar o microfone
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                {permissionError}
              </p>
              
              {isPermissionDenied && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    📌 Como permitir o acesso ao microfone:
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Clique no ícone <strong className="font-semibold">🔒</strong> ou <strong className="font-semibold">ⓘ</strong> na barra de endereço do navegador</li>
                    <li>Procure por "Microfone" ou "Permissões"</li>
                    <li>Altere a permissão para <strong className="font-semibold">"Permitir"</strong></li>
                    <li>Clique em "Tentar novamente" abaixo</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={() => {
                setPermissionError(null);
                setIsInitializing(true);
                initializeRecording();
              }}
              className="flex-1 bg-[#0023D5] hover:bg-[#001AAA] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 🔄 Inicializando
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-xl text-center">
          <Loader2 className="w-12 h-12 text-[#0023D5] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Inicializando microfone...</p>
          <p className="text-sm text-gray-500 mt-2">
            Por favor, permita o acesso ao microfone
          </p>
        </div>
      </div>
    );
  }

  // 🎙️ Gravando
  if (isRecording) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {isPaused ? 'Gravação pausada' : 'Gravando áudio...'}
            </h3>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Visualização de gravação */}
          <div className="flex flex-col items-center gap-6 mb-6">
            {/* Ícone de microfone animado */}
            <div className={`relative ${!isPaused ? 'animate-pulse' : ''}`}>
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                <Mic className="w-12 h-12 text-red-600" />
              </div>
              {!isPaused && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20"></div>
              )}
            </div>

            {/* Timer */}
            <div className={`text-4xl font-mono font-bold ${recordingTime >= 270 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(recordingTime)}
            </div>

            {/* Mensagem de ajuda */}
            {!isPaused && recordingTime < 270 && (
              <p className="text-sm text-gray-500 text-center">
                Fale claramente perto do microfone
              </p>
            )}
            {!isPaused && recordingTime >= 270 && (
              <p className="text-sm text-red-600 text-center font-medium animate-pulse">
                ⚠️ Tempo máximo quase atingido (5 min)
              </p>
            )}
            {isPaused && (
              <p className="text-sm text-amber-600 text-center font-medium">
                Gravação pausada
              </p>
            )}
          </div>

          {/* Controles */}
          <div className="flex gap-3">
            <Button
              onClick={handlePauseResume}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Retomar
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              )}
            </Button>
            
            <Button
              onClick={handleStopRecording}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4 mr-2" />
              Parar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 🎵 Preview do áudio gravado
  if (audioBlob && audioUrl) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Áudio gravado
            </h3>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Player */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePlayPause}
                size="icon"
                className="w-12 h-12 rounded-full bg-[#0023D5] hover:bg-[#001AAA] text-white flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Duração: {formatTime(recordingTime)}</span>
                  <span>{(audioBlob.size / 1024).toFixed(0)} KB</span>
                </div>
                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0023D5] rounded-full w-0 transition-all"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Audio element (oculto) */}
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Ações */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleSend}
              className="flex-1 bg-[#0023D5] hover:bg-[#001AAA] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}