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

// Missing security functions referenced by components
export function generateThreatId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `threat_${timestamp}_${random}`.toUpperCase();
}

export function calculateThreatScore(indicators: any[]): number {
  if (!indicators || indicators.length === 0) return 0;
  
  let score = 0;
  let weight = 0;
  
  for (const indicator of indicators) {
    const severity = indicator.severity || 'low';
    const confidence = indicator.confidence || 0.5;
    
    let severityScore = 0;
    switch (severity.toLowerCase()) {
      case 'critical': severityScore = 10; break;
      case 'high': severityScore = 8; break;
      case 'medium': severityScore = 5; break;
      case 'low': severityScore = 2; break;
      default: severityScore = 1; break;
    }
    
    const indicatorScore = severityScore * confidence;
    score += indicatorScore;
    weight += confidence;
  }
  
  return weight > 0 ? Math.min(10, score / weight) : 0;
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"&]/g, '');
}



