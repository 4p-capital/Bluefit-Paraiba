import { PresenceStatus } from '../hooks/usePresence';

interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<PresenceStatus, { color: string; label: string; bgColor: string }> = {
  online: { 
    color: 'bg-green-500', 
    label: 'Online',
    bgColor: 'bg-green-50'
  },
  away: { 
    color: 'bg-yellow-500', 
    label: 'Ausente',
    bgColor: 'bg-yellow-50'
  },
  busy: { 
    color: 'bg-red-500', 
    label: 'Ocupado',
    bgColor: 'bg-red-50'
  },
  offline: { 
    color: 'bg-gray-400', 
    label: 'Offline',
    bgColor: 'bg-gray-50'
  },
};

const sizeConfig = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function PresenceIndicator({ status, size = 'md', showLabel = false, className = '' }: PresenceIndicatorProps) {
  const config = statusConfig[status];
  
  if (showLabel) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className={`${sizeConfig[size]} ${config.color} rounded-full ring-2 ring-white shadow-sm`} />
        <span className="text-xs text-gray-600">{config.label}</span>
      </div>
    );
  }
  
  return (
    <div 
      className={`${sizeConfig[size]} ${config.color} rounded-full ring-2 ring-white shadow-sm ${className}`}
      title={config.label}
    />
  );
}