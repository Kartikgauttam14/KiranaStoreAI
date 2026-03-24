import { formatDistanceToNow, format } from 'date-fns';
import { hi } from 'date-fns/locale';

export function formatDate(date: string | Date, locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const l = locale === 'hi' ? hi : undefined;
  return format(d, 'dd MMM yyyy', { locale: l });
}

export function formatDateTime(date: string | Date, locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const l = locale === 'hi' ? hi : undefined;
  return format(d, 'dd MMM yyyy HH:mm', { locale: l });
}

export function formatTimeAgo(date: string | Date, locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const l = locale === 'hi' ? hi : undefined;
  return formatDistanceToNow(d, { addSuffix: true, locale: l });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm');
}
