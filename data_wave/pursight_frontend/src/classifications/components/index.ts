// Export all classification components for easy importing
export { default as ClassificationHeader } from './ClassificationHeader';
export { default as ClassificationSidebar } from './ClassificationSidebar';
export { default as ClassificationMain } from './ClassificationMain';
export { default as ClassificationDashboard } from './ClassificationDashboard';
export { default as ClassificationCommandPalette } from './ClassificationCommandPalette';
export { default as ClassificationNotifications } from './ClassificationNotifications';
export { default as ClassificationSettings } from './ClassificationSettings';
export { default as ClassificationAuth } from './ClassificationAuth';

// Re-export types that might be needed
export type {
  ClassificationVersion,
  QuickAction,
  SystemService,
  Notification,
  UserPreferences,
  AuthState
} from './types';
