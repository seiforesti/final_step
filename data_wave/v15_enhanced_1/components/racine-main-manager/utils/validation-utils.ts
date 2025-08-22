// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

import type { ValidationResult, ValidationRule, ValidationSchema } from '../types/racine-core.types';

/**
 * Format date to human-readable string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time to human-readable string
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj);
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    errors: isValid ? [] : ['Invalid email format'],
    warnings: []
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    warnings.push('Consider adding special characters for better security');
  }

  if (password.length < 12) {
    warnings.push('Consider using a longer password for better security');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate username format
 */
export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 30) {
    errors.push('Username must be no more than 30 characters long');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  if (/^[0-9]/.test(username)) {
    warnings.push('Username should not start with a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  const errors: string[] = [];
  const warnings: string[] = [];

  if (digitsOnly.length < 10) {
    errors.push('Phone number must have at least 10 digits');
  }

  if (digitsOnly.length > 15) {
    errors.push('Phone number must have no more than 15 digits');
  }

  if (!/^\+?[1-9]\d{1,14}$/.test(digitsOnly)) {
    errors.push('Invalid phone number format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate URL format
 */
export const validateURL = (url: string): ValidationResult => {
  try {
    new URL(url);
    return { isValid: true, errors: [], warnings: [] };
  } catch {
    return { isValid: false, errors: ['Invalid URL format'], warnings: [] };
  }
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const isValid = value !== null && value !== undefined && value !== '';
  
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} is required`],
    warnings: []
  };
};

/**
 * Validate string length
 */
export const validateStringLength = (
  value: string, 
  minLength: number, 
  maxLength: number, 
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }

  if (value.length > maxLength) {
    errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate numeric range
 */
export const validateNumericRange = (
  value: number, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }

  if (value > max) {
    errors.push(`${fieldName} must be no more than ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate against custom regex pattern
 */
export const validatePattern = (
  value: string, 
  pattern: RegExp, 
  fieldName: string,
  errorMessage?: string
): ValidationResult => {
  const isValid = pattern.test(value);
  
  return {
    isValid,
    errors: isValid ? [] : [errorMessage || `${fieldName} format is invalid`],
    warnings: []
  };
};

/**
 * Validate object against schema
 */
export const validateObject = (
  obj: Record<string, any>, 
  schema: ValidationSchema
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = obj[fieldName];
    
    for (const rule of rules) {
      const result = validateField(value, rule, fieldName);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate single field against rule
 */
export const validateField = (
  value: any, 
  rule: ValidationRule, 
  fieldName: string
): ValidationResult => {
  switch (rule.type) {
    case 'required':
      return validateRequired(value, fieldName);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'username':
      return validateUsername(value);
    case 'phone':
      return validatePhoneNumber(value);
    case 'url':
      return validateURL(value);
    case 'length':
      return validateStringLength(value, rule.min, rule.max, fieldName);
    case 'range':
      return validateNumericRange(value, rule.min, rule.max, fieldName);
    case 'pattern':
      return validatePattern(value, rule.pattern, fieldName, rule.errorMessage);
    default:
      return { isValid: true, errors: [], warnings: [] };
  }
};

/**
 * Generate secure random ID
 */
export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Sanitize input string
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File, 
  allowedTypes: string[], 
  maxSize: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    errors.push(`File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes`);
  }

  if (file.size > maxSize * 0.8) {
    warnings.push('File size is approaching the limit');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Named exports are declared above; avoid duplicate re-export block

