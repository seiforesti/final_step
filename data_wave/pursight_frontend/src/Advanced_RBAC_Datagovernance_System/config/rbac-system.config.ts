// RBAC System Configuration
// Comprehensive configuration for the enterprise RBAC system

export const RBAC_SYSTEM_CONFIG = {
  // Application Settings
  app: {
    name: 'Advanced RBAC Data Governance System',
    version: '1.0.0',
    environment: (typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) || 'development',
    apiUrl: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || 'http://localhost:3000/proxy',
    websocketUrl: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL) || 'ws://localhost:8000/ws',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    timezone: 'UTC'
  },

  // Security Configuration
  security: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    refreshTokenThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      forbidCommonPasswords: true
    },
    mfa: {
      enabled: true,
      backupCodesCount: 10,
      totpWindow: 1,
      issuer: 'RBAC Data Governance'
    },
    apiSecurity: {
      rateLimitRequests: 100,
      rateLimitWindow: 60 * 1000, // 1 minute
      corsOrigins: ['http://localhost:3000', 'https://yourdomain.com'],
      csrfProtection: true
    }
  },

  // Performance Settings
  performance: {
    pagination: {
      defaultPageSize: 25,
      maxPageSize: 100,
      availableSizes: [10, 25, 50, 100]
    },
    caching: {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      enableServiceWorker: true
    },
    debouncing: {
      searchDelay: 300,
      resizeDelay: 150,
      scrollDelay: 100
    },
    virtualization: {
      enableVirtualScrolling: true,
      itemHeight: 40,
      overscan: 10
    }
  },

  // UI/UX Configuration
  ui: {
    theme: {
      defaultMode: 'system', // 'light', 'dark', 'system'
      persistTheme: true,
      colorPalette: {
        primary: 'blue',
        secondary: 'gray',
        success: 'green',
        warning: 'yellow',
        error: 'red'
      }
    },
    layout: {
      sidebarWidth: 256,
      sidebarCollapsedWidth: 64,
      headerHeight: 64,
      footerHeight: 48,
      borderRadius: 8,
      animation: {
        duration: 200,
        easing: 'ease-in-out'
      }
    },
    accessibility: {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium' // 'small', 'medium', 'large'
    }
  },

  // Notifications Configuration
  notifications: {
    position: 'top-right',
    maxVisible: 5,
    defaultDuration: 4000,
    enableSound: false,
    enableDesktop: true,
    categories: {
      system: { icon: 'bell', color: 'blue' },
      security: { icon: 'shield', color: 'red' },
      user: { icon: 'user', color: 'green' },
      workflow: { icon: 'flow', color: 'purple' }
    }
  },

  // Analytics & Monitoring
  analytics: {
    enabled: true,
    refreshInterval: 30 * 1000, // 30 seconds
    retentionPeriod: 90, // days
    metrics: {
      trackUserActivity: true,
      trackPerformance: true,
      trackErrors: true,
      trackFeatureUsage: true
    },
    dashboardWidgets: [
      'user-overview',
      'role-distribution',
      'permission-usage',
      'security-status',
      'recent-activity',
      'compliance-score',
      'system-health',
      'workflow-status'
    ]
  },

  // Workflow Automation
  workflows: {
    enabled: true,
    maxActiveWorkflows: 50,
    executionTimeout: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 30 * 1000, // 30 seconds
    triggers: {
      userCreated: 'user_created',
      roleAssigned: 'role_assigned',
      permissionChanged: 'permission_changed',
      accessRequested: 'access_requested',
      securityEvent: 'security_event'
    },
    actions: {
      sendEmail: 'send_email',
      sendSlack: 'send_slack',
      createTask: 'create_task',
      assignRole: 'assign_role',
      generateReport: 'generate_report'
    }
  },

  // Audit & Compliance
  audit: {
    enabled: true,
    retentionPeriod: 365, // days
    compressionAfter: 30, // days
    encryptionEnabled: true,
    realTimeMonitoring: true,
    criticalEvents: [
      'user_created',
      'user_deleted',
      'role_created',
      'role_deleted',
      'permission_granted',
      'permission_revoked',
      'security_breach',
      'login_failed',
      'privilege_escalation'
    ],
    complianceFrameworks: {
      gdpr: { enabled: true, reportingRequired: true },
      sox: { enabled: true, reportingRequired: true },
      pci: { enabled: false, reportingRequired: false },
      hipaa: { enabled: false, reportingRequired: false }
    }
  },

  // Data Export & Import
  dataManagement: {
    export: {
      formats: ['csv', 'json', 'xlsx', 'pdf'],
      maxRecords: 10000,
      compression: true,
      encryption: true,
      scheduledExports: true
    },
    import: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      supportedFormats: ['csv', 'json', 'xlsx'],
      validation: true,
      preview: true,
      rollback: true
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 30, // days
      encryption: true,
      offsite: false
    }
  },

  // Integration Settings
  integrations: {
    ldap: {
      enabled: false,
      syncInterval: 60 * 60 * 1000, // 1 hour
      userMapping: {
        email: 'mail',
        firstName: 'givenName',
        lastName: 'sn',
        department: 'department'
      }
    },
    sso: {
      enabled: false,
      providers: ['google', 'microsoft', 'okta', 'auth0'],
      autoProvisioning: false,
      roleMapping: true
    },
    webhooks: {
      enabled: true,
      maxRetries: 3,
      timeout: 30 * 1000, // 30 seconds
      events: [
        'user.created',
        'user.updated',
        'role.assigned',
        'permission.changed'
      ]
    }
  },

  // Development & Debug
  development: {
    enableDevTools: (typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development',
    enableMockData: false,
    enablePerformanceMonitoring: true,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    enableHotReload: true,
    apiDelay: 0 // Simulate network delay in ms
  },

  // Feature Flags
  features: {
    advancedSearch: true,
    bulkOperations: true,
    workflowAutomation: true,
    realTimeUpdates: true,
    mobileSupport: true,
    offlineMode: false,
    aiInsights: false,
    predictiveAnalytics: false,
    customDashboards: true,
    apiDocumentation: true
  },

  // Localization
  localization: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h', // '12h' or '24h'
    numberFormat: 'en-US',
    timezone: 'browser' // 'browser' or specific timezone
  },

  // API Configuration
  api: {
    version: 'v1',
    timeout: 30 * 1000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    endpoints: {
      auth: '/auth',
      users: '/rbac/users',
      roles: '/rbac/roles',
      permissions: '/rbac/permissions',
      resources: '/rbac/resources',
      groups: '/rbac/groups',
      audit: '/rbac/audit-logs',
      workflows: '/rbac/workflows',
      analytics: '/rbac/analytics'
    }
  },

  // Error Handling
  errorHandling: {
    enableGlobalHandler: true,
    enableErrorBoundary: true,
    reportErrors: true,
    showUserFriendlyMessages: true,
    logErrors: true,
    maxErrorsPerSession: 10,
    errorCategories: {
      network: 'Network Error',
      validation: 'Validation Error',
      permission: 'Permission Denied',
      server: 'Server Error',
      client: 'Client Error'
    }
  },

  // Keyboard Shortcuts
  shortcuts: {
    enabled: true,
    global: {
      search: 'ctrl+k',
      help: 'shift+?',
      refresh: 'f5',
      toggleSidebar: 'ctrl+b',
      toggleTheme: 'ctrl+shift+t'
    },
    navigation: {
      dashboard: 'g d',
      users: 'g u',
      roles: 'g r',
      permissions: 'g p',
      audit: 'g a'
    },
    actions: {
      create: 'c',
      edit: 'e',
      delete: 'del',
      save: 'ctrl+s',
      cancel: 'esc'
    }
  },

  // Help & Documentation
  help: {
    enabled: true,
    contextualHelp: true,
    tooltips: true,
    onboarding: true,
    documentation: {
      baseUrl: '/docs',
      searchEnabled: true,
      downloadEnabled: true
    },
    support: {
      email: 'support@yourcompany.com',
      phone: '+1-800-123-4567',
      chat: true,
      ticketSystem: true
    }
  }
};

// Environment-specific overrides
const environmentOverrides = {
  development: {
    security: {
      sessionTimeout: 60 * 60 * 1000, // 1 hour for dev
    },
    development: {
      enableDevTools: true,
      logLevel: 'debug',
      apiDelay: 500
    }
  },
  staging: {
    analytics: {
      enabled: false
    },
    development: {
      enableDevTools: false,
      logLevel: 'warn'
    }
  },
  production: {
    security: {
      sessionTimeout: 20 * 60 * 1000, // 20 minutes for prod
    },
    development: {
      enableDevTools: false,
      logLevel: 'error',
      enableMockData: false
    },
    performance: {
      caching: {
        defaultTTL: 10 * 60 * 1000 // 10 minutes for prod
      }
    }
  }
};

// Merge configuration with environment overrides
export const getConfig = () => {
  const env = (typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) || 'development';
  const overrides = environmentOverrides[env as keyof typeof environmentOverrides] || {};
  
  return {
    ...RBAC_SYSTEM_CONFIG,
    ...overrides
  };
};

// Configuration validation
export const validateConfig = (config: typeof RBAC_SYSTEM_CONFIG) => {
  const errors: string[] = [];

  // Validate required fields
  if (!config.app.name) errors.push('App name is required');
  if (!config.app.apiUrl) errors.push('API URL is required');
  
  // Validate security settings
  if (config.security.sessionTimeout < 5 * 60 * 1000) {
    errors.push('Session timeout should be at least 5 minutes');
  }
  
  // Validate performance settings
  if (config.performance.pagination.defaultPageSize > config.performance.pagination.maxPageSize) {
    errors.push('Default page size cannot exceed max page size');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export default configured instance
export default getConfig();