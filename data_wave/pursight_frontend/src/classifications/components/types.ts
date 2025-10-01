// Shared types for classification components
export interface ClassificationVersion {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  components: {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
  }[];
  stats?: {
    total: number;
    active: number;
    accuracy: number;
    performance: number;
  };
}

export interface QuickAction {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  shortcut: string;
  category: 'action' | 'navigation' | 'component';
}

export interface SystemService {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read: boolean;
  category: 'system' | 'classification' | 'ml' | 'ai' | 'workflow';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  dashboard: {
    refreshInterval: number;
    defaultView: string;
    showMetrics: boolean;
    compactMode: boolean;
  };
  performance: {
    animationsEnabled: boolean;
    autoRefresh: boolean;
    cacheEnabled: boolean;
    maxConcurrentRequests: number;
  };
  security: {
    sessionTimeout: number;
    requireMFA: boolean;
    auditLogging: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    name: string;
    email: string;
    role: string;
    permissions: string[];
  } | null;
}

export interface SystemMetrics {
  totalClassifications: number;
  activeFrameworks: number;
  averageAccuracy: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  processingSpeed: number;
  costEfficiency: number;
}

export interface RecentActivity {
  id: string;
  type: 'classification' | 'training' | 'deployment' | 'analysis';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'pending';
}
