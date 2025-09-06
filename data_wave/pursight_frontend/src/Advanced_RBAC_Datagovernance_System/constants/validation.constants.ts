// Validation Constants - Enterprise-grade validation rules and patterns

export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s\-_]+$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  DOMAIN: /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/,
  PERMISSION_ACTION: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
  PERMISSION_RESOURCE: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*(\*)?$/,
  ROLE_NAME: /^[a-zA-Z][a-zA-Z0-9_\-\s]*$/,
  RESOURCE_NAME: /^[a-zA-Z][a-zA-Z0-9_\-\s]*$/,
  GROUP_NAME: /^[a-zA-Z][a-zA-Z0-9_\-\s]*$/,
  CONDITION_FIELD: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  JSON_STRING: /^[\s\S]*$/,
  BASE64: /^[A-Za-z0-9+/]*={0,2}$/,
  JWT_TOKEN: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_WEAK: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_TOO_LONG: 'Password cannot exceed 128 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  PHONE_INVALID: 'Please enter a valid phone number',
  USERNAME_INVALID: 'Username must be 3-20 characters, letters, numbers, and underscores only',
  ALPHANUMERIC_ONLY: 'Only letters and numbers are allowed',
  NO_SPECIAL_CHARS: 'Special characters are not allowed',
  URL_INVALID: 'Please enter a valid URL',
  UUID_INVALID: 'Please enter a valid UUID',
  HEX_COLOR_INVALID: 'Please enter a valid hex color code',
  IP_ADDRESS_INVALID: 'Please enter a valid IP address',
  DOMAIN_INVALID: 'Please enter a valid domain name',
  PERMISSION_ACTION_INVALID: 'Action must follow format: module.action (e.g., scan.view, data.edit)',
  PERMISSION_RESOURCE_INVALID: 'Resource must follow format: module.resource (e.g., datasource.mysql, scan.*)',
  ROLE_NAME_INVALID: 'Role name can only contain letters, numbers, underscores, hyphens, and spaces',
  RESOURCE_NAME_INVALID: 'Resource name can only contain letters, numbers, underscores, hyphens, and spaces',
  GROUP_NAME_INVALID: 'Group name can only contain letters, numbers, underscores, hyphens, and spaces',
  CONDITION_FIELD_INVALID: 'Field name can only contain letters, numbers, and underscores',
  JSON_INVALID: 'Please enter valid JSON',
  BASE64_INVALID: 'Please enter valid base64 encoded data',
  JWT_TOKEN_INVALID: 'Please enter a valid JWT token',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters long`,
  MAX_LENGTH: (max: number) => `Cannot exceed ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Cannot exceed ${max}`,
  RANGE: (min: number, max: number) => `Must be between ${min} and ${max}`,
  UNIQUE: 'This value must be unique',
  EXISTS: 'This value must exist',
  NOT_EXISTS: 'This value must not exist',
  FUTURE_DATE: 'Date must be in the future',
  PAST_DATE: 'Date must be in the past',
  DATE_RANGE: (start: string, end: string) => `Date must be between ${start} and ${end}`,
  FILE_SIZE: (maxSize: string) => `File size cannot exceed ${maxSize}`,
  FILE_TYPE: (allowedTypes: string[]) => `File type must be one of: ${allowedTypes.join(', ')}`,
  CONFIRMATION_REQUIRED: 'Please confirm this action',
  TERMS_ACCEPTED: 'You must accept the terms and conditions',
  PRIVACY_POLICY_ACCEPTED: 'You must accept the privacy policy'
};

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    FORBID_COMMON_PASSWORDS: true,
    FORBID_USER_INFO: true
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    ALLOW_UNDERSCORES: true,
    ALLOW_HYPHENS: false,
    ALLOW_SPACES: false,
    CASE_SENSITIVE: false
  },
  EMAIL: {
    MAX_LENGTH: 254,
    ALLOW_PLUS_SIGN: true,
    ALLOW_MULTIPLE_DOTS: false,
    STRICT_MODE: false
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    ALLOW_INTERNATIONAL: true,
    ALLOW_EXTENSIONS: false,
    FORMAT: 'international'
  },
  ROLE_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    ALLOW_SPACES: true,
    ALLOW_UNDERSCORES: true,
    ALLOW_HYPHENS: true,
    CASE_SENSITIVE: false
  },
  PERMISSION_ACTION: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    ALLOW_WILDCARDS: false,
    ALLOW_UNDERSCORES: true,
    CASE_SENSITIVE: false
  },
  PERMISSION_RESOURCE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200,
    ALLOW_WILDCARDS: true,
    ALLOW_UNDERSCORES: true,
    CASE_SENSITIVE: false
  },
  RESOURCE_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    ALLOW_SPACES: true,
    ALLOW_UNDERSCORES: true,
    ALLOW_HYPHENS: true,
    CASE_SENSITIVE: false
  },
  GROUP_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    ALLOW_SPACES: true,
    ALLOW_UNDERSCORES: true,
    ALLOW_HYPHENS: true,
    CASE_SENSITIVE: false
  },
  CONDITION_FIELD: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    ALLOW_UNDERSCORES: true,
    ALLOW_DOTS: false,
    CASE_SENSITIVE: false
  }
};

export const VALIDATION_GROUPS = {
  BASIC: ['required', 'minLength', 'maxLength'],
  EMAIL: ['required', 'email', 'maxLength'],
  PASSWORD: ['required', 'minLength', 'maxLength', 'password'],
  PHONE: ['required', 'phone', 'minLength', 'maxLength'],
  USERNAME: ['required', 'username', 'minLength', 'maxLength'],
  URL: ['required', 'url'],
  PERMISSION: ['required', 'permissionAction', 'permissionResource'],
  ROLE: ['required', 'roleName', 'minLength', 'maxLength'],
  RESOURCE: ['required', 'resourceName', 'minLength', 'maxLength'],
  GROUP: ['required', 'groupName', 'minLength', 'maxLength'],
  CONDITION: ['required', 'conditionField', 'minLength', 'maxLength'],
  JSON: ['required', 'json'],
  BASE64: ['required', 'base64'],
  JWT: ['required', 'jwtToken'],
  UUID: ['required', 'uuid'],
  HEX_COLOR: ['required', 'hexColor'],
  IP_ADDRESS: ['required', 'ipAddress'],
  DOMAIN: ['required', 'domain']
};

export const VALIDATION_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

export const VALIDATION_TRIGGERS = {
  ON_CHANGE: 'onChange',
  ON_BLUR: 'onBlur',
  ON_SUBMIT: 'onSubmit',
  ON_FOCUS: 'onFocus',
  ON_MOUNT: 'onMount',
  ON_UNMOUNT: 'onUnmount'
} as const;

export const VALIDATION_MODES = {
  LAZY: 'lazy',
  EAGER: 'eager',
  AGGRESSIVE: 'aggressive',
  PASSIVE: 'passive'
} as const;

export const VALIDATION_STRATEGIES = {
  FIRST_ERROR: 'firstError',
  ALL_ERRORS: 'allErrors',
  CUMULATIVE: 'cumulative',
  STOP_ON_FIRST: 'stopOnFirst'
} as const;

export const VALIDATION_CACHE = {
  ENABLED: true,
  TTL: 300000, // 5 minutes
  MAX_SIZE: 1000,
  CLEANUP_INTERVAL: 60000 // 1 minute
} as const;

export const VALIDATION_DEBOUNCE = {
  ENABLED: true,
  DELAY: 300, // milliseconds
  MAX_DELAY: 1000 // milliseconds
} as const;

export const VALIDATION_ASYNC = {
  ENABLED: true,
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;

export const VALIDATION_LOCALIZATION = {
  DEFAULT_LOCALE: 'en-US',
  SUPPORTED_LOCALES: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN'],
  FALLBACK_LOCALE: 'en-US',
  CACHE_TRANSLATIONS: true
} as const;

export const VALIDATION_ACCESSIBILITY = {
  ARIA_LABELS: true,
  ARIA_DESCRIBEDBY: true,
  ARIA_INVALID: true,
  ARIA_REQUIRED: true,
  SCREEN_READER_SUPPORT: true,
  KEYBOARD_NAVIGATION: true,
  FOCUS_MANAGEMENT: true,
  ERROR_ANNOUNCEMENT: true
} as const;

export const VALIDATION_PERFORMANCE = {
  BATCH_VALIDATION: true,
  PARALLEL_VALIDATION: true,
  CACHE_RESULTS: true,
  DEBOUNCE_INPUT: true,
  LAZY_LOADING: true,
  MEMOIZATION: true,
  OPTIMISTIC_UPDATES: true
} as const;

export const VALIDATION_SECURITY = {
  SANITIZE_INPUT: true,
  ESCAPE_OUTPUT: true,
  PREVENT_XSS: true,
  PREVENT_INJECTION: true,
  VALIDATE_CSRF: true,
  RATE_LIMITING: true,
  CAPTCHA_SUPPORT: true,
  HONEYPOT_FIELDS: true
} as const;

export const VALIDATION_INTEGRATION = {
  BACKEND_VALIDATION: true,
  REAL_TIME_VALIDATION: true,
  OFFLINE_VALIDATION: true,
  SYNC_VALIDATION: true,
  ASYNC_VALIDATION: true,
  CROSS_FIELD_VALIDATION: true,
  CONDITIONAL_VALIDATION: true,
  DYNAMIC_VALIDATION: true
} as const;

export const VALIDATION_ANALYTICS = {
  TRACK_VALIDATION_ERRORS: true,
  TRACK_VALIDATION_SUCCESS: true,
  TRACK_VALIDATION_PERFORMANCE: true,
  TRACK_USER_BEHAVIOR: true,
  TRACK_FIELD_INTERACTIONS: true,
  TRACK_FORM_ABANDONMENT: true,
  TRACK_VALIDATION_ATTEMPTS: true,
  TRACK_ERROR_RESOLUTION: true
} as const;

export const VALIDATION_TESTING = {
  MOCK_VALIDATION: true,
  TEST_MODE: false,
  DEBUG_MODE: false,
  VERBOSE_LOGGING: false,
  PERFORMANCE_MONITORING: true,
  ERROR_BOUNDARIES: true,
  FALLBACK_VALIDATION: true,
  GRACEFUL_DEGRADATION: true
} as const;

export default {
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
  VALIDATION_GROUPS,
  VALIDATION_SEVERITY,
  VALIDATION_TRIGGERS,
  VALIDATION_MODES,
  VALIDATION_STRATEGIES,
  VALIDATION_CACHE,
  VALIDATION_DEBOUNCE,
  VALIDATION_ASYNC,
  VALIDATION_LOCALIZATION,
  VALIDATION_ACCESSIBILITY,
  VALIDATION_PERFORMANCE,
  VALIDATION_SECURITY,
  VALIDATION_INTEGRATION,
  VALIDATION_ANALYTICS,
  VALIDATION_TESTING
};