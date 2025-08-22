export function formatTimestamp(ts: string | number | Date): string {
  const d = new Date(ts);
  return d.toISOString();
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms)) return '-';
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr) return `${hr}h ${min % 60}m ${sec % 60}s`;
  if (min) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
  return `${bytes.toFixed(1)} ${units[i]}`;
}



