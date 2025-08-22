const PALETTE = [
  '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#ec4899', '#14b8a6', '#f43f5e'
];

export function generateColor(key: string | number): string {
  const idx = Math.abs(hash(String(key))) % PALETTE.length;
  return PALETTE[idx];
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'success':
    case 'ready':
    case 'healthy':
      return '#22c55e';
    case 'warning':
    case 'degraded':
      return '#f59e0b';
    case 'error':
    case 'failed':
    case 'critical':
      return '#ef4444';
    case 'pending':
    case 'running':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'low':
      return '#84cc16';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    case 'critical':
      return '#991b1b';
    default:
      return '#6b7280';
  }
}

export function getAnomalyTypeColor(type: string): string {
  return generateColor(`anomaly-${type}`);
}

export function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'low':
      return '#22c55e';
    case 'moderate':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export function getContextTypeColor(type: string): string {
  return generateColor(`context-${type}`);
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export default {
  generateColor,
  getStatusColor,
  getSeverityColor,
  getAnomalyTypeColor,
  getRiskColor,
  getContextTypeColor,
};



