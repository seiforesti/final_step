/**
 * API Configuration for Racine Frontend
 * =====================================
 * 
 * Centralized configuration for all API communications with the
 * backend scripts_automation service. Ensures proper alignment
 * with FastAPI backend endpoints.
 */

// Environment-based configuration
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

// Backend base URLs
export const API_CONFIG = {
  // Main backend API (scripts_automation FastAPI)
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  
  // WebSocket URLs
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  
  // Timeout configurations
  TIMEOUT: {
    DEFAULT: 30000, // 30 seconds
    UPLOAD: 120000, // 2 minutes
    WEBSOCKET: 5000, // 5 seconds
  },
  
  // Retry configurations
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000, // 1 second
    MAX_DELAY: 10000, // 10 seconds
    EXPONENTIAL_BASE: 2,
  },
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  
  // CORS settings
  CORS: {
    CREDENTIALS: true,
    ORIGINS: ['http://localhost:3000', 'http://localhost:8000'],
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_WEBSOCKET: true,
    ENABLE_CACHING: true,
    ENABLE_RETRY: true,
    ENABLE_COMPRESSION: true,
    VERBOSE_LOGGING: isDev,
  },
  
  // Health check
  HEALTH_CHECK: {
    ENDPOINT: '/health',
    INTERVAL: 30000, // 30 seconds
    TIMEOUT: 5000, // 5 seconds
  }
} as const

// API endpoint paths aligned with backend FastAPI routes
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    USER: '/auth/user',
    REGISTER: '/auth/register',
  },
  
  // Core Racine orchestration
  RACINE: {
    ORCHESTRATION: '/api/racine/orchestration',
    WORKFLOWS: '/api/racine/workflows',
    PIPELINES: '/api/racine/pipelines',
    ACTIVITY: '/api/racine/activity',
    DASHBOARD: '/api/racine/dashboard',
    AI_ASSISTANT: '/api/racine/ai',
    COLLABORATION: '/api/racine/collaboration',
    WORKSPACE: '/api/racine/workspace',
    PERFORMANCE: '/api/racine/performance',
    USER_MANAGEMENT: '/api/rbac',
  },
  
  // Data Governance Groups
  DATA_SOURCES: {
    BASE: '/api/data-sources',
    CONNECTIONS: '/api/data-sources/connections',
    MONITORING: '/api/data-sources/monitoring',
    VALIDATION: '/api/data-sources/validation',
  },
  
  SCAN_RULE_SETS: {
    BASE: '/api/scan-rule-sets',
    RULES: '/api/scan-rule-sets/rules',
    EXECUTION: '/api/scan-rule-sets/execution',
    VALIDATION: '/api/scan-rule-sets/validation',
  },
  
  CLASSIFICATIONS: {
    BASE: '/api/classifications',
    LABELS: '/api/classifications/labels',
    TAXONOMIES: '/api/classifications/taxonomies',
    AUTO_CLASSIFY: '/api/classifications/auto-classify',
  },
  
  COMPLIANCE_RULE: {
    BASE: '/api/compliance',
    RULES: '/api/compliance/rules',
    FRAMEWORKS: '/api/compliance/frameworks',
    REPORTS: '/api/compliance/reports',
    AUDIT: '/api/compliance/audit',
  },
  
  ADVANCED_CATALOG: {
    BASE: '/api/catalog',
    SEARCH: '/api/catalog/search',
    LINEAGE: '/api/catalog/lineage',
    QUALITY: '/api/catalog/quality',
    ANALYTICS: '/api/catalog/analytics',
  },
  
  SCAN_LOGIC: {
    BASE: '/api/scan-logic',
    WORKFLOWS: '/api/scan-logic/workflows',
    EXECUTION: '/api/scan-logic/execution',
    RESULTS: '/api/scan-logic/results',
  },
  
  RBAC_SYSTEM: {
    BASE: '/api/rbac',
    USERS: '/api/rbac/users',
    ROLES: '/api/rbac/roles',
    PERMISSIONS: '/api/rbac/permissions',
  },
  
  // Quick Actions
  QUICK_ACTIONS: {
    BASE: '/api/quick-actions',
    EXECUTE: '/api/quick-actions/execute',
    HISTORY: '/api/quick-actions/history',
  },
  
  // WebSocket endpoints
  WS: {
    GENERAL: '/ws',
    NOTIFICATIONS: '/ws/notifications',
    ACTIVITY: '/ws/activity',
    SYSTEM_HEALTH: '/ws/health',
    COLLABORATION: '/ws/collaboration',
  },
  
  // System endpoints
  SYSTEM: {
    HEALTH: '/health',
    METRICS: '/metrics',
    STATUS: '/status',
  }
} as const

// Build full URL for API calls
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    url += `?${searchParams.toString()}`
  }
  
  return url
}

// Build WebSocket URL
export const buildWsUrl = (endpoint: string) => {
  return `${API_CONFIG.WS_URL}${endpoint}`
}

// Get auth headers
export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('racine_auth_token') || sessionStorage.getItem('racine_auth_token')
    : null
    
  return token ? {
    ...API_CONFIG.HEADERS,
    'Authorization': `Bearer ${token}`
  } : API_CONFIG.HEADERS
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  requestId?: string
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

export default API_CONFIG