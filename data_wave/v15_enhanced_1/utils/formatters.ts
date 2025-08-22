import { format as formatDateFns, parseISO } from 'date-fns';

export function formatDate(value: string | Date, pattern: string = 'yyyy-MM-dd HH:mm:ss'): string {
  try {
    const date = typeof value === 'string' ? parseISO(value) : value;
    return formatDateFns(date, pattern);
  } catch {
    return String(value ?? '');
  }
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms)) return '-';
  const sec = Math.floor(ms / 1000);
  const parts = [
    Math.floor(sec / 3600),
    Math.floor((sec % 3600) / 60),
    sec % 60,
  ];
  const [h, m, s] = parts;
  if (h) return `${h}h ${m}m ${s}s`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '-';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);
}

export function formatPercentage(value: number, maximumFractionDigits = 1): string {
  if (!Number.isFinite(value)) return '-';
  return `${(value * 100).toFixed(maximumFractionDigits)}%`;
}

export default {
  formatDate,
  formatDuration,
  formatBytes,
  formatNumber,
  formatPercentage,
};



