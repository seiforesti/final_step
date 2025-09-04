// Validation Constants - Form validation rules and patterns

// Regular expressions for validation
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  ROLE_NAME: /^[a-zA-Z0-9_\s-]+$/,
  PERMISSION_ACTION: /^[a-z_]+$/,
  PERMISSION_RESOURCE: /^[a-z_.]+$/,
  RESOURCE_NAME: /^[a-zA-Z0-9_\-\s]+$/,
  GROUP_NAME: /^[a-zA-Z0-9_\s-]+$/,
  CONDITION_LABEL: /^[a-zA-Z0-9_\s-]+$/,
  JSON: /^[\],:{}\s]*$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  PORT: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
};

// Field length constraints
export const FIELD_LENGTHS = {
  EMAIL: { min: 5, max: 254 },
  PASSWORD: { min: 8, max: 128 },
  FIRST_NAME: { min: 1, max: 50 },
  LAST_NAME: { min: 1, max: 50 },
  DISPLAY_NAME: { min: 1, max: 100 },
  PHONE_NUMBER: { min: 10, max: 20 },
  ROLE_NAME: { min: 2, max: 50 },
  ROLE_DESCRIPTION: { min: 0, max: 500 },
  PERMISSION_ACTION: { min: 2, max: 50 },
  PERMISSION_RESOURCE: { min: 2, max: 100 },
  RESOURCE_NAME: { min: 2, max: 100 },
  GROUP_NAME: { min: 2, max: 50 },
  GROUP_DESCRIPTION: { min: 0, max: 500 },
  CONDITION_LABEL: { min: 2, max: 100 },
  CONDITION_DESCRIPTION: { min: 0, max: 500 },
  JUSTIFICATION: { min: 10, max: 1000 },
  REVIEW_NOTE: { min: 0, max: 500 },
  SEARCH_QUERY: { min: 2, max: 100 }
};

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_USERNAME: 'Username can only contain letters, numbers, underscores and hyphens',
  INVALID_ROLE_NAME: 'Role name can only contain letters, numbers, spaces, underscores and hyphens',
  INVALID_PERMISSION_ACTION: 'Action must be lowercase letters and underscores only',
  INVALID_PERMISSION_RESOURCE: 'Resource must be lowercase letters, dots and underscores only',
  INVALID_RESOURCE_NAME: 'Resource name can only contain letters, numbers, spaces, underscores and hyphens',
  INVALID_GROUP_NAME: 'Group name can only contain letters, numbers, spaces, underscores and hyphens',
  INVALID_CONDITION_LABEL: 'Label can only contain letters, numbers, spaces, underscores and hyphens',
  INVALID_JSON: 'Please enter valid JSON',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_IP: 'Please enter a valid IP address',
  INVALID_PORT: 'Please enter a valid port number (1-65535)',
  TOO_SHORT: (min: number) => `Must be at least ${min} characters`,
  TOO_LONG: (max: number) => `Must be no more than ${max} characters`,
  PASSWORD_MISMATCH: 'Passwords do not match',
  DUPLICATE_VALUE: 'This value already exists',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_DATE_RANGE: 'End date must be after start date',
  FILE_TOO_LARGE: (maxSize: string) => `File size must be less than ${maxSize}`,
  INVALID_FILE_TYPE: (allowedTypes: string) => `File type must be one of: ${allowedTypes}`,
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  SERVER_ERROR: 'Server error. Please try again later',
  VALIDATION_FAILED: 'Please fix the errors below',
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?'
};

// Validation rules for specific fields
export const VALIDATION_RULES = {
  user: {
    email: {
      required: true,
      pattern: VALIDATION_PATTERNS.EMAIL,
      maxLength: FIELD_LENGTHS.EMAIL.max,
      message: VALIDATION_MESSAGES.INVALID_EMAIL
    },
    first_name: {
      required: false,
      minLength: FIELD_LENGTHS.FIRST_NAME.min,
      maxLength: FIELD_LENGTHS.FIRST_NAME.max,
      message: 'First name must be between 1-50 characters'
    },
    last_name: {
      required: false,
      minLength: FIELD_LENGTHS.LAST_NAME.min,
      maxLength: FIELD_LENGTHS.LAST_NAME.max,
      message: 'Last name must be between 1-50 characters'
    },
    phone_number: {
      required: false,
      pattern: VALIDATION_PATTERNS.PHONE,
      minLength: FIELD_LENGTHS.PHONE_NUMBER.min,
      maxLength: FIELD_LENGTHS.PHONE_NUMBER.max,
      message: VALIDATION_MESSAGES.INVALID_PHONE
    }
  },
  
  role: {
    name: {
      required: true,
      pattern: VALIDATION_PATTERNS.ROLE_NAME,
      minLength: FIELD_LENGTHS.ROLE_NAME.min,
      maxLength: FIELD_LENGTHS.ROLE_NAME.max,
      message: VALIDATION_MESSAGES.INVALID_ROLE_NAME
    },
    description: {
      required: false,
      maxLength: FIELD_LENGTHS.ROLE_DESCRIPTION.max,
      message: `Description cannot exceed ${FIELD_LENGTHS.ROLE_DESCRIPTION.max} characters`
    }
  },
  
  permission: {
    action: {
      required: true,
      pattern: VALIDATION_PATTERNS.PERMISSION_ACTION,
      minLength: FIELD_LENGTHS.PERMISSION_ACTION.min,
      maxLength: FIELD_LENGTHS.PERMISSION_ACTION.max,
      message: VALIDATION_MESSAGES.INVALID_PERMISSION_ACTION
    },
    resource: {
      required: true,
      pattern: VALIDATION_PATTERNS.PERMISSION_RESOURCE,
      minLength: FIELD_LENGTHS.PERMISSION_RESOURCE.min,
      maxLength: FIELD_LENGTHS.PERMISSION_RESOURCE.max,
      message: VALIDATION_MESSAGES.INVALID_PERMISSION_RESOURCE
    },
    conditions: {
      required: false,
      pattern: VALIDATION_PATTERNS.JSON,
      message: VALIDATION_MESSAGES.INVALID_JSON
    }
  },
  
  resource: {
    name: {
      required: true,
      pattern: VALIDATION_PATTERNS.RESOURCE_NAME,
      minLength: FIELD_LENGTHS.RESOURCE_NAME.min,
      maxLength: FIELD_LENGTHS.RESOURCE_NAME.max,
      message: VALIDATION_MESSAGES.INVALID_RESOURCE_NAME
    },
    type: {
      required: true,
      enum: ['data_source', 'database', 'schema', 'table', 'collection'],
      message: 'Resource type must be one of: data_source, database, schema, table, collection'
    }
  },
  
  group: {
    name: {
      required: true,
      pattern: VALIDATION_PATTERNS.GROUP_NAME,
      minLength: FIELD_LENGTHS.GROUP_NAME.min,
      maxLength: FIELD_LENGTHS.GROUP_NAME.max,
      message: VALIDATION_MESSAGES.INVALID_GROUP_NAME
    },
    description: {
      required: false,
      maxLength: FIELD_LENGTHS.GROUP_DESCRIPTION.max,
      message: `Description cannot exceed ${FIELD_LENGTHS.GROUP_DESCRIPTION.max} characters`
    }
  },
  
  condition: {
    label: {
      required: true,
      pattern: VALIDATION_PATTERNS.CONDITION_LABEL,
      minLength: FIELD_LENGTHS.CONDITION_LABEL.min,
      maxLength: FIELD_LENGTHS.CONDITION_LABEL.max,
      message: VALIDATION_MESSAGES.INVALID_CONDITION_LABEL
    },
    value: {
      required: true,
      pattern: VALIDATION_PATTERNS.JSON,
      message: VALIDATION_MESSAGES.INVALID_JSON
    },
    description: {
      required: false,
      maxLength: FIELD_LENGTHS.CONDITION_DESCRIPTION.max,
      message: `Description cannot exceed ${FIELD_LENGTHS.CONDITION_DESCRIPTION.max} characters`
    }
  },
  
  accessRequest: {
    justification: {
      required: true,
      minLength: FIELD_LENGTHS.JUSTIFICATION.min,
      maxLength: FIELD_LENGTHS.JUSTIFICATION.max,
      message: `Justification must be between ${FIELD_LENGTHS.JUSTIFICATION.min}-${FIELD_LENGTHS.JUSTIFICATION.max} characters`
    },
    review_note: {
      required: false,
      maxLength: FIELD_LENGTHS.REVIEW_NOTE.max,
      message: `Review note cannot exceed ${FIELD_LENGTHS.REVIEW_NOTE.max} characters`
    }
  }
};

// File upload validation
export const FILE_VALIDATION = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/csv', 'application/json'],
  MAX_FILES: 5
};

// Password strength requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  SPECIAL_CHARS: '@$!%*?&',
  MAX_LENGTH: 128,
  NO_COMMON_PASSWORDS: true,
  NO_PERSONAL_INFO: true
};

// Search validation
export const SEARCH_VALIDATION = {
  MIN_LENGTH: FIELD_LENGTHS.SEARCH_QUERY.min,
  MAX_LENGTH: FIELD_LENGTHS.SEARCH_QUERY.max,
  ALLOWED_SPECIAL_CHARS: ['-', '_', '.', ' ', '*', '?'],
  FORBIDDEN_CHARS: ['<', '>', '"', "'", '&', ';', '(', ')', '|', '`']
};

// Date validation
export const DATE_VALIDATION = {
  MIN_DATE: new Date('1900-01-01'),
  MAX_DATE: new Date('2100-12-31'),
  REQUIRED_FORMAT: 'YYYY-MM-DD',
  ALLOWED_FORMATS: ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY']
};

// Bulk operation limits
export const BULK_OPERATION_LIMITS = {
  MAX_USERS: 1000,
  MAX_ROLES: 100,
  MAX_PERMISSIONS: 500,
  MAX_RESOURCES: 1000,
  MAX_GROUPS: 100,
  WARNING_THRESHOLD: 50
};

// Rate limiting
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  API_REQUESTS: { max: 100, window: 60 * 1000 }, // 100 requests per minute
  SEARCH_REQUESTS: { max: 30, window: 60 * 1000 }, // 30 searches per minute
  EXPORT_REQUESTS: { max: 10, window: 60 * 1000 } // 10 exports per minute
};