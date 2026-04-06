import { memo, useRef, useState } from 'react';
import { Clock, Check, CheckCheck, AlertCircle, Play, Pause, FileIcon, Download } from 'lucide-react';
import { Message, MessageStatus } from '../types/database';
import { formatTime } from '../lib/dateUtils';
import { cn } from './ui/utils';

// --- Status icons ---

const statusIcons: Record<MessageStatus, JSX.Element> = {
  sending: <Clock className="w-3 h-3 text-[#9CA3AF] animate-pulse" />,
  queued: <Clock className="w-3 h-3 text-[#9CA3AF]" />,
  sent: <Check className="w-3 h-3 text-[#9CA3AF]" />,
  delivered: <CheckCheck className="w-3 h-3 text-[#9CA3AF]" />,
  read: <CheckCheck className="w-3 h-3 text-[#0023D5]" />,
  failed: <AlertCircle className="w-3 h-3 text-[#EF4444]" />,
};

export function normalizeStatus(raw: string | undefined | null): MessageStatus {
  if (!raw) return 'queued';
  const s = raw.trim().toLowerCase();
  if (s === 'deliver' || s === 'delivered') return 'delivered';
  if (s === 'send' || s === 'sent') return 'sent';
  if (s === 'read') return 'read';
  if (s === 'failed' || s === 'error') return 'failed';
  if (s === 'queued' || s === 'accepted') return 'queued';
  if (s === 'sending') return 'sending';
  return 'queued';
}

export function getStatusIcon(status: string | undefined | null): JSX.Element {
  const normalized = normalizeStatus(status);
  return statusIcons[normalized] || statusIcons.queued;
}

// --- AudioPlayer ---

function AudioPlayer({ url, isOutbound }: { url: string; isOutbound: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatAudioTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const WAVEFORM_BARS = [4, 8, 3, 9, 5, 7, 2, 6, 8, 4, 9, 3, 7, 5, 8, 4, 6, 3, 7, 5];

  return (
    <div className={cn(
      "flex items-center gap-2 md:gap-3 min-w-0 w-full max-w-full",
      isOutbound ? "text-white" : "text-[#1B1B1B]"
    )}>
      <button
        onClick={togglePlay}
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
          isOutbound
            ? "bg-white/20 hover:bg-white/30 active:scale-95"
            : "bg-[#E5E7EB] hover:bg-[#E5E7EB]/80 active:scale-95"
        )}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" fill="currentColor" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1 md:gap-1.5 h-8 overflow-hidden">
          {WAVEFORM_BARS.map((height, i) => {
            const progress = duration > 0 ? currentTime / duration : 0;
            const isActive = i < progress * 20;
            return (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-all",
                  isOutbound
                    ? isActive ? "bg-white" : "bg-white/30"
                    : isActive ? "bg-[#0023D5]" : "bg-[#E5E7EB]"
                )}
                style={{ height: `${height * 3}px` }}
              />
            );
          })}
        </div>
        <div className={cn(
          "text-xs font-medium",
          isOutbound ? "text-white/80" : "text-[#6B7280]"
        )}>
          {currentTime > 0 ? formatAudioTime(currentTime) : formatAudioTime(duration)}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
      />
    </div>
  );
}

// --- DocumentCard ---

function DocumentCard({ url, fileName, isOutbound }: { url: string; fileName?: string; isOutbound: boolean }) {
  const extractFilenameFromUrl = (url: string): string => {
    try {
      const urlWithoutParams = url.split('?')[0];
      const segments = urlWithoutParams.split('/');
      const lastSegment = segments[segments.length - 1];
      const supabaseMatch = lastSegment.match(/^\d+-(.+)$/);
      if (supabaseMatch && supabaseMatch[1]) return decodeURIComponent(supabaseMatch[1]);
      if (lastSegment && lastSegment.length > 0) return decodeURIComponent(lastSegment);
      return 'Documento';
    } catch {
      return 'Documento';
    }
  };

  const isFileNameAUrl = fileName?.startsWith('http://') || fileName?.startsWith('https://');
  const displayName = (fileName && !isFileNameAUrl) ? fileName : extractFilenameFromUrl(url);
  const extension = displayName.split('.').pop()?.toUpperCase() || 'FILE';

  const getFileColor = () => {
    if (['PDF'].includes(extension)) return 'text-red-600 bg-red-100';
    if (['DOC', 'DOCX'].includes(extension)) return 'text-blue-600 bg-blue-100';
    if (['XLS', 'XLSX'].includes(extension)) return 'text-green-600 bg-green-100';
    if (['PPT', 'PPTX'].includes(extension)) return 'text-orange-600 bg-orange-100';
    return 'text-[#4B5563] bg-[#F3F3F3]';
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 md:gap-3 px-3 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] min-w-0 w-full max-w-full",
        isOutbound
          ? "bg-white/15 hover:bg-white/25 backdrop-blur-sm"
          : "bg-[#F9FAFB] hover:bg-[#F3F3F3] border border-[#E5E7EB]"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold",
        isOutbound ? "bg-white/20 text-white" : getFileColor()
      )}>
        <FileIcon className="w-5 h-5 mb-0.5" />
        <span className="text-[9px]">{extension}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isOutbound ? "text-white" : "text-[#1B1B1B]")}>
          {displayName}
        </p>
        <p className={cn("text-xs mt-0.5", isOutbound ? "text-white/70" : "text-[#6B7280]")}>
          Toque para abrir
        </p>
      </div>
      <Download className={cn("w-4 h-4 flex-shrink-0", isOutbound ? "text-white/80" : "text-[#9CA3AF]")} />
    </a>
  );
}

// --- Message content renderer ---

function renderMessageContent(message: Message) {
  const isOutbound = message.direction === 'outbound';
  const isSupabaseUrl = message.body?.includes('supabase.co/storage');
  const hasMediaUrl = message.media_url || (isSupabaseUrl && message.body);

  let inferredType = message.type;
  if (isSupabaseUrl && message.type === 'text' && message.body) {
    if (/image|\.(?:jpg|jpeg|png|gif|webp)/i.test(message.body)) inferredType = 'image';
    else if (/video|\.(?:mp4|mov|avi|webm)/i.test(message.body)) inferredType = 'video';
    else if (/audio|\.(?:mp3|ogg|wav|m4a)/i.test(message.body)) inferredType = 'audio';
    else if (/document|\.(?:pdf|doc|docx|xls|xlsx)/i.test(message.body)) inferredType = 'document';
    else inferredType = 'image';
  }

  const mediaUrl = message.media_url || (isSupabaseUrl ? message.body : null);

  if (inferredType === 'image' && mediaUrl) {
    return (
      <div className="space-y-2">
        <img
          src={mediaUrl}
          alt="Imagem"
          loading="lazy"
          className="max-w-full max-h-[280px] w-auto h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
          onClick={() => window.open(mediaUrl!, '_blank')}
        />
        {message.body && !isSupabaseUrl && (
          <p className="text-xs md:text-sm whitespace-pre-wrap break-words break-all leading-relaxed max-w-full overflow-hidden">
            {message.body}
          </p>
        )}
      </div>
    );
  }

  if (inferredType === 'video' && mediaUrl) {
    return (
      <div className="space-y-2">
        <video src={mediaUrl} controls className="max-w-full rounded-lg" style={{ maxHeight: '400px' }} />
        {message.body && !isSupabaseUrl && (
          <p className="text-xs md:text-sm whitespace-pre-wrap break-words break-all leading-relaxed max-w-full overflow-hidden">
            {message.body}
          </p>
        )}
      </div>
    );
  }

  if (inferredType === 'audio' && mediaUrl) {
    return (
      <div className="space-y-2">
        <AudioPlayer url={mediaUrl} isOutbound={isOutbound} />
        {message.body && !isSupabaseUrl && (
          <p className="text-xs md:text-sm whitespace-pre-wrap break-words break-all leading-relaxed max-w-full overflow-hidden">
            {message.body}
          </p>
        )}
      </div>
    );
  }

  if (inferredType === 'document' && mediaUrl) {
    return (
      <div className="space-y-2">
        <DocumentCard url={mediaUrl} fileName={message.body} isOutbound={isOutbound} />
      </div>
    );
  }

  return (
    <p className="text-xs md:text-sm whitespace-pre-wrap break-words break-all leading-relaxed max-w-full overflow-hidden">
      {message.body || `[${message.type}]`}
    </p>
  );
}

// --- MessageBubble (memoized) ---

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={cn("flex w-full", isOutbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[80%] md:max-w-[70%] px-4 py-3 overflow-hidden min-w-0 w-auto",
          isOutbound ? 'bg-[#0023D5] text-white' : 'bg-white text-[#1B1B1B]'
        )}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          hyphens: 'auto',
          borderRadius: isOutbound ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          boxShadow: isOutbound ? '0 1px 2px rgba(0,35,213,0.1)' : '0 1px 3px rgba(0,0,0,0.08)',
          fontSize: '15px',
          lineHeight: '1.5',
        }}
      >
        <div className="break-words break-all min-w-0 max-w-full overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {renderMessageContent(message)}
        </div>
        <div className="flex items-center justify-end gap-1 mt-1 min-w-0">
          <span className={cn(
            "text-[11px] flex-shrink-0 whitespace-nowrap",
            isOutbound ? 'text-white/80' : 'text-[#9CA3AF]'
          )}>
            {formatTime(new Date(message.sent_at))}
          </span>
          {isOutbound && <span className="flex-shrink-0">{getStatusIcon(message.status)}</span>}
        </div>
      </div>
    </div>
  );
});
