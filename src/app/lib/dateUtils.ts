import { format as dateFnsFormat } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

/**
 * Utilitários para formatação de datas
 * Centraliza configurações de locale e formatos
 */

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'HH:mm', { locale: ptBR });
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatDateLabel(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return dateFnsFormat(dateObj, "EEEE", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase());
  return dateFnsFormat(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatRelative(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 0.0167) { // menos de 1 minuto
    return 'Agora';
  } else if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes} min`;
  } else if (diffInHours < 24) {
    return formatTime(dateObj);
  } else if (diffInHours < 48) {
    return 'Ontem';
  } else if (diffInHours < 168) { // menos de 7 dias
    const days = Math.floor(diffInHours / 24);
    return `${days}d atrás`;
  } else {
    return formatDate(dateObj);
  }
}