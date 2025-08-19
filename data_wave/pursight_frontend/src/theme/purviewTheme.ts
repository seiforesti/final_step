export interface PurviewTheme {
  bg: string;
  card: string;
  border: string;
  accent: string;
  accentText: string;
  text: string;
  textSecondary: string;
  stepActive: string;
  stepDone: string;
  stepPending: string;
  shadow: string;
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

export const purviewTheme: PurviewTheme = {
  bg: '#FFFFFF',
  card: '#F8F9FB',
  border: '#E6E8EA',
  accent: '#3a86ff',
  accentText: '#2563eb',
  text: '#1B1B1B',
  textSecondary: '#6B7280',
  stepActive: '#3a86ff',
  stepDone: '#10b981',
  stepPending: '#94969A',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};