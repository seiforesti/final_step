/**
 * System Constants - Advanced Configuration and Defaults
 * =====================================================
 *
 * This file contains comprehensive system constants including performance thresholds,
 * animation configurations, theme settings, and workspace defaults used throughout
 * the Racine Main Manager SPA.
 */

// =============================================================================
// SYSTEM CONSTANTS
// =============================================================================

export const SYSTEM_CONSTANTS = {
  // Application metadata
  APP_NAME: 'Racine Data Governance Platform',
  APP_VERSION: '1.0.0',
  API_VERSION: 'v1',
  
  // Timing constants
  DEBOUNCE_DELAY: 300,
  THROTTLE_LIMIT: 100,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  
  // Data refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    REAL_TIME: 5000,        // 5 seconds
    FAST: 15000,           // 15 seconds
    NORMAL: 30000,         // 30 seconds
    SLOW: 60000,           // 1 minute
    ANALYTICS: 120000,     // 2 minutes
    REPORTS: 300000,       // 5 minutes
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    LARGE_PAGE_SIZE: 50,
  },
  
  // Search configuration
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_RESULTS: 50,
    DEBOUNCE_DELAY: 500,
  },
  
  // File upload limits
  FILE_UPLOAD: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_TYPES: [
      'application/json',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  
  // Component limits
  LIMITS: {
    MAX_DASHBOARD_WIDGETS: 20,
    MAX_WORKFLOW_STEPS: 50,
    MAX_PIPELINE_STAGES: 20,
    MAX_COLLABORATION_MEMBERS: 100,
    MAX_NOTIFICATION_QUEUE: 500,
  },
} as const;

// =============================================================================
// PERFORMANCE THRESHOLDS
// =============================================================================

export const PERFORMANCE_THRESHOLDS = {
  // Response time thresholds (in milliseconds)
  RESPONSE_TIME: {
    EXCELLENT: 100,
    GOOD: 250,
    ACCEPTABLE: 500,
    SLOW: 1000,
    CRITICAL: 2000,
  },
  
  // System health thresholds (percentages)
  HEALTH: {
    EXCELLENT: 95,
    GOOD: 85,
    ACCEPTABLE: 70,
    DEGRADED: 50,
    CRITICAL: 30,
  },
  
  // Resource usage thresholds (percentages)
  RESOURCE_USAGE: {
    CPU: {
      LOW: 30,
      MEDIUM: 60,
      HIGH: 80,
      CRITICAL: 90,
    },
    MEMORY: {
      LOW: 40,
      MEDIUM: 70,
      HIGH: 85,
      CRITICAL: 95,
    },
    DISK: {
      LOW: 50,
      MEDIUM: 70,
      HIGH: 85,
      CRITICAL: 95,
    },
  },
  
  // Error rate thresholds (percentages)
  ERROR_RATE: {
    EXCELLENT: 0.1,
    GOOD: 0.5,
    ACCEPTABLE: 1.0,
    CONCERNING: 2.0,
    CRITICAL: 5.0,
  },
  
  // Throughput thresholds (requests per second)
  THROUGHPUT: {
    HIGH: 1000,
    MEDIUM: 500,
    LOW: 100,
    VERY_LOW: 50,
  },
} as const;

// =============================================================================
// ANIMATION CONFIGURATIONS
// =============================================================================

export const ANIMATION_CONFIGS = {
  // Default animation durations
  DURATION: {
    FAST: 0.15,
    NORMAL: 0.3,
    SLOW: 0.5,
    EXTRA_SLOW: 1.0,
  },
  
  // Easing functions
  EASING: {
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in',
    EASE_IN_OUT: 'ease-in-out',
    SPRING: 'spring',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Spring configurations
  SPRING: {
    GENTLE: { type: 'spring', stiffness: 120, damping: 14 },
    WOBBLY: { type: 'spring', stiffness: 180, damping: 12 },
    STIFF: { type: 'spring', stiffness: 400, damping: 30 },
  },
  
  // Transition variants
  VARIANTS: {
    FADE_IN: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    SLIDE_UP: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    SLIDE_LEFT: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    SCALE: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
    BOUNCE: {
      initial: { opacity: 0, scale: 0.3 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.3 },
      transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
  },
  
  // Schema animation settings
  SCHEMA: {
    ROTATION_DURATION: 60, // seconds for full rotation
    PULSE_DURATION: 2,     // seconds for pulse cycle
    CONNECTION_DELAY: 2,   // seconds for connection animation
  },
} as const;

// =============================================================================
// THEME CONFIGURATIONS
// =============================================================================

export const THEME_CONFIGS = {
  // Color palette
  COLORS: {
    PRIMARY: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    SECONDARY: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#8b5cf6',
      600: '#7c3aed',
      900: '#581c87',
    },
    SUCCESS: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      900: '#14532d',
    },
    WARNING: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      900: '#92400e',
    },
    ERROR: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#991b1b',
    },
  },
  
  // Typography scales
  TYPOGRAPHY: {
    FONT_SIZES: {
      XS: '0.75rem',    // 12px
      SM: '0.875rem',   // 14px
      BASE: '1rem',     // 16px
      LG: '1.125rem',   // 18px
      XL: '1.25rem',    // 20px
      '2XL': '1.5rem',  // 24px
      '3XL': '1.875rem', // 30px
      '4XL': '2.25rem', // 36px
    },
    LINE_HEIGHTS: {
      TIGHT: '1.25',
      NORMAL: '1.5',
      RELAXED: '1.75',
    },
    FONT_WEIGHTS: {
      NORMAL: '400',
      MEDIUM: '500',
      SEMIBOLD: '600',
      BOLD: '700',
    },
  },
  
  // Spacing scale
  SPACING: {
    XS: '0.25rem',    // 4px
    SM: '0.5rem',     // 8px
    BASE: '1rem',     // 16px
    LG: '1.5rem',     // 24px
    XL: '2rem',       // 32px
    '2XL': '3rem',    // 48px
    '3XL': '4rem',    // 64px
  },
  
  // Border radius
  RADIUS: {
    NONE: '0',
    SM: '0.125rem',   // 2px
    BASE: '0.25rem',  // 4px
    MD: '0.375rem',   // 6px
    LG: '0.5rem',     // 8px
    XL: '0.75rem',    // 12px
    FULL: '9999px',
  },
  
  // Shadow configurations
  SHADOWS: {
    SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    BASE: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const;

// =============================================================================
// WORKSPACE DEFAULTS
// =============================================================================

export const WORKSPACE_DEFAULTS = {
  // Default workspace settings
  SETTINGS: {
    AUTO_SAVE: true,
    AUTO_SYNC: true,
    NOTIFICATIONS_ENABLED: true,
    REAL_TIME_UPDATES: true,
    COLLABORATION_ENABLED: true,
    VERSION_CONTROL: true,
  },
  
  // Layout configurations
  LAYOUT: {
    SIDEBAR_WIDTH: 256,      // pixels
    SIDEBAR_COLLAPSED_WIDTH: 64, // pixels
    HEADER_HEIGHT: 64,       // pixels
    FOOTER_HEIGHT: 40,       // pixels
    CONTENT_MAX_WIDTH: 1200, // pixels
  },
  
  // Default dashboard configuration
  DASHBOARD: {
    GRID_COLUMNS: 12,
    GRID_ROWS: 20,
    WIDGET_MIN_HEIGHT: 2,
    WIDGET_MIN_WIDTH: 2,
    WIDGET_MARGIN: 8,
    AUTO_REFRESH: true,
    REFRESH_INTERVAL: 30000, // 30 seconds
  },
  
  // Performance settings
  PERFORMANCE: {
    VIRTUALIZATION_THRESHOLD: 100,  // items
    LAZY_LOADING_ENABLED: true,
    DEBOUNCE_SEARCH: true,
    THROTTLE_SCROLL: true,
    CACHE_ENABLED: true,
    CACHE_TTL: 300000, // 5 minutes
  },
  
  // Security defaults
  SECURITY: {
    SESSION_TIMEOUT: 3600000,     // 1 hour
    IDLE_TIMEOUT: 1800000,        // 30 minutes
    MAX_LOGIN_ATTEMPTS: 3,
    PASSWORD_MIN_LENGTH: 8,
    REQUIRE_MFA: false,
    AUDIT_LOGGING: true,
  },
  
  // Collaboration settings
  COLLABORATION: {
    MAX_CONCURRENT_EDITORS: 10,
    CONFLICT_RESOLUTION: 'merge',
    REAL_TIME_CURSORS: true,
    COMMENT_NOTIFICATIONS: true,
    ACTIVITY_TRACKING: true,
  },
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  
  // Racine endpoints
  RACINE: {
    ORCHESTRATION: '/proxy/racine/orchestration',
    ANALYTICS: '/proxy/racine/analytics',
    INTELLIGENCE: '/proxy/racine/intelligence',
    AUTOMATION: '/racine/automation',
    MONITORING: '/racine/monitoring',
    SECURITY: '/racine/security',
    COST: '/racine/cost',
    COLLABORATION: '/racine/collaboration',
    REPORTING: '/racine/reporting',
    STREAMING: '/racine/streaming',
    INTEGRATION: '/racine/integration',
  },
  
  // Group-specific endpoints
  GROUPS: {
    DATA_SOURCES: '/proxy/data-sources',
    SCAN_RULE_SETS: '/proxy/scan-rule-sets',
    CLASSIFICATIONS: '/proxy/classifications',
    COMPLIANCE_RULE: '/proxy/compliance-rule',
    ADVANCED_CATALOG: '/proxy/advanced-catalog',
    SCAN_LOGIC: '/proxy/scan-logic',
    RBAC_SYSTEM: '/proxy/rbac-system',
  },
} as const;

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

export const KEYBOARD_SHORTCUTS = {
  GLOBAL: {
    COMMAND_PALETTE: 'ctrl+k',
    QUICK_ACTIONS: 'ctrl+.',
    AI_ASSISTANT: 'ctrl+shift+i',
    TOGGLE_SIDEBAR: 'ctrl+b',
    FULLSCREEN: 'f11',
    SETTINGS: 'ctrl+,',
    HELP: 'ctrl+/',
  },
  
  NAVIGATION: {
    DASHBOARD: 'ctrl+1',
    WORKFLOWS: 'ctrl+2',
    PIPELINES: 'ctrl+3',
    ANALYTICS: 'ctrl+4',
    SETTINGS: 'ctrl+9',
  },
  
  ACTIONS: {
    NEW: 'ctrl+n',
    SAVE: 'ctrl+s',
    DUPLICATE: 'ctrl+d',
    DELETE: 'delete',
    REFRESH: 'ctrl+r',
    SEARCH: 'ctrl+f',
  },
  
  WORKFLOW: {
    RUN: 'ctrl+enter',
    PAUSE: 'ctrl+p',
    STOP: 'ctrl+shift+p',
    STEP: 'f10',
    DEBUG: 'f9',
  },
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURE_FLAGS = {
  // Core features
  ADVANCED_ANALYTICS: true,
  SYSTEM_INTELLIGENCE: true,
  AUTOMATION_ENGINE: true,
  COST_OPTIMIZATION: true,
  ENTERPRISE_SECURITY: true,
  
  // UI/UX features
  GLASSMORPHISM_UI: true,
  ADVANCED_ANIMATIONS: true,
  REAL_TIME_COLLABORATION: true,
  VOICE_COMMANDS: false,
  MOBILE_APP: false,
  
  // Experimental features
  AI_CODE_GENERATION: false,
  PREDICTIVE_SCALING: false,
  QUANTUM_ENCRYPTION: false,
  BLOCKCHAIN_AUDIT: false,
} as const;