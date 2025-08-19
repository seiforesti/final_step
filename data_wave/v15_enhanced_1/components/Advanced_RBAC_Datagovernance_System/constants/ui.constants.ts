// UI Configuration Constants - Design system and interface settings

// Theme colors (Azure-inspired)
export const THEME_COLORS = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // RBAC specific colors
  rbac: {
    user: '#8b5cf6',
    role: '#06b6d4',
    permission: '#10b981',
    resource: '#f59e0b',
    group: '#ec4899',
    audit: '#6b7280'
  }
};

// Layout constants
export const LAYOUT = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  HEADER_HEIGHT: 64,
  BREADCRUMB_HEIGHT: 48,
  FOOTER_HEIGHT: 40,
  CONTENT_PADDING: 24,
  CARD_BORDER_RADIUS: 12,
  BUTTON_BORDER_RADIUS: 8
};

// Animation durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SIDEBAR_TOGGLE: 200,
  MODAL_FADE: 250,
  TOOLTIP_DELAY: 500
};

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
};

// Breakpoints (matches Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Table configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 500,
  VIRTUAL_SCROLL_THRESHOLD: 100,
  STICKY_HEADER: true,
  SORTABLE_COLUMNS: true,
  FILTERABLE_COLUMNS: true,
  RESIZABLE_COLUMNS: true
};

// Form configuration
export const FORM_CONFIG = {
  VALIDATION_DEBOUNCE: 300,
  AUTO_SAVE_DELAY: 2000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Search configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_RESULTS: 50,
  HIGHLIGHT_MATCHES: true,
  FUZZY_SEARCH_THRESHOLD: 0.6
};

// Notification configuration
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000,
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 8000,
  WARNING_DURATION: 6000,
  MAX_NOTIFICATIONS: 5,
  POSITION: 'top-right' as const
};

// Modal sizes
export const MODAL_SIZES = {
  SM: 'max-w-md',
  MD: 'max-w-lg',
  LG: 'max-w-2xl',
  XL: 'max-w-4xl',
  '2XL': 'max-w-6xl',
  FULL: 'max-w-full'
};

// Icon sizes
export const ICON_SIZES = {
  XS: 12,
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 32,
  '2XL': 48
};

// Avatar sizes
export const AVATAR_SIZES = {
  XS: 24,
  SM: 32,
  MD: 40,
  LG: 48,
  XL: 64,
  '2XL': 96
};

// Badge variants
export const BADGE_VARIANTS = {
  DEFAULT: 'bg-gray-100 text-gray-800',
  PRIMARY: 'bg-blue-100 text-blue-800',
  SUCCESS: 'bg-green-100 text-green-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  INFO: 'bg-cyan-100 text-cyan-800'
};

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white',
  SECONDARY: 'bg-gray-600 hover:bg-gray-700 text-white',  
  SUCCESS: 'bg-green-600 hover:bg-green-700 text-white',
  WARNING: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  ERROR: 'bg-red-600 hover:bg-red-700 text-white',
  OUTLINE: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  GHOST: 'hover:bg-gray-100 text-gray-700',
  LINK: 'text-blue-600 hover:text-blue-800 underline'
};

// Loading states
export const LOADING_STATES = {
  SPINNER: 'spinner',
  SKELETON: 'skeleton',
  PULSE: 'pulse',
  DOTS: 'dots'
};

// Data visualization colors
export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6', '#f43f5e'
];

// Export formats
export const EXPORT_FORMATS = {
  CSV: { label: 'CSV', extension: '.csv', mimeType: 'text/csv' },
  JSON: { label: 'JSON', extension: '.json', mimeType: 'application/json' },
  PDF: { label: 'PDF', extension: '.pdf', mimeType: 'application/pdf' },
  EXCEL: { label: 'Excel', extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
};

// Date/time formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  RELATIVE: 'relative' // e.g., "2 hours ago"
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH: 'cmd+k',
  NEW_USER: 'cmd+n',
  SAVE: 'cmd+s',
  CANCEL: 'escape',
  REFRESH: 'cmd+r',
  HELP: '?'
};

// Feature flags for progressive enhancement
export const FEATURE_FLAGS = {
  VIRTUAL_SCROLLING: true,
  REAL_TIME_UPDATES: true,
  ADVANCED_FILTERING: true,
  BULK_OPERATIONS: true,
  KEYBOARD_NAVIGATION: true,
  ACCESSIBILITY_MODE: true,
  DARK_MODE: true,
  ANALYTICS_TRACKING: false
};

// Accessibility settings
export const A11Y_CONFIG = {
  FOCUS_VISIBLE: true,
  HIGH_CONTRAST: false,
  REDUCED_MOTION: false,
  SCREEN_READER_ANNOUNCEMENTS: true,
  KEYBOARD_NAVIGATION: true,
  ARIA_LIVE_REGIONS: true
};

// Performance settings
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_SEARCH: 300,
  THROTTLE_SCROLL: 100,
  LAZY_LOAD_THRESHOLD: 100,
  VIRTUAL_LIST_ITEM_HEIGHT: 48,
  IMAGE_LAZY_LOAD: true,
  PREFETCH_PAGES: 1
};

// Module navigation configuration
export const MODULE_CONFIG = {
  users: {
    icon: 'Users',
    label: 'Users',
    color: THEME_COLORS.rbac.user,
    order: 1
  },
  roles: {
    icon: 'Shield',
    label: 'Roles',
    color: THEME_COLORS.rbac.role,
    order: 2
  },
  permissions: {
    icon: 'Key',
    label: 'Permissions', 
    color: THEME_COLORS.rbac.permission,
    order: 3
  },
  resources: {
    icon: 'Database',
    label: 'Resources',
    color: THEME_COLORS.rbac.resource,
    order: 4
  },
  groups: {
    icon: 'UserGroup',
    label: 'Groups',
    color: THEME_COLORS.rbac.group,
    order: 5
  },
  conditions: {
    icon: 'Cog',
    label: 'Conditions',
    color: THEME_COLORS.primary[600],
    order: 6
  },
  'access-requests': {
    icon: 'DocumentText',
    label: 'Access Requests',
    color: THEME_COLORS.warning,
    order: 7
  },
  audit: {
    icon: 'ClipboardList',
    label: 'Audit Logs',
    color: THEME_COLORS.rbac.audit,
    order: 8
  }
};