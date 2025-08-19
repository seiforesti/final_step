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

export const purviewDarkTheme: PurviewTheme = {
  bg: '#121212',
  card: '#1e1e1e',
  border: '#333333',
  accent: '#3a86ff',
  accentText: '#61a0ff',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  stepActive: '#3a86ff',
  stepDone: '#10b981',
  stepPending: '#6b7280',
  shadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};