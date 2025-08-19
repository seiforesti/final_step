// ============================================================================
// UTILS INDEX - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized export for all Advanced Catalog utilities
// ============================================================================

// Export all formatter functions
export * from './formatters';
export { default as formatters } from './formatters';

// Export all validator functions
export * from './validators';
export { default as validators } from './validators';

// Export collaboration utilities
export * from './collaboration-utils';
export { default as collaborationUtils } from './collaboration-utils';

// Export all helper functions
export * from './helpers';
export { default as helpers } from './helpers';

// Export all calculation functions
export * from './calculations';
export { default as calculations } from './calculations';

// ============================================================================
// UTILITY COLLECTIONS
// ============================================================================

import formatters from './formatters';
import validators from './validators';
import helpers from './helpers';
import calculations from './calculations';

/**
 * Complete collection of all Advanced Catalog utilities
 */
export const catalogUtils = {
  formatters,
  validators,
  helpers,
  calculations
};

/**
 * Utility categories for organized access
 */
export const UTILITY_CATEGORIES = {
  FORMATTERS: 'formatters',
  VALIDATORS: 'validators',
  HELPERS: 'helpers',
  CALCULATIONS: 'calculations'
} as const;

export type UtilityCategory = keyof typeof UTILITY_CATEGORIES;

/**
 * Get utility by category
 */
export function getUtilityByCategory(category: UtilityCategory) {
  return catalogUtils[category];
}

/**
 * Get all available utilities
 */
export function getAllUtilities() {
  return catalogUtils;
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Most commonly used utilities for easy access
export { cn, generateId, generateUUID } from './helpers';
export { formatDate, formatNumber, formatFileSize, formatStatus } from './formatters';
export { validateRequired, validateEmail, validateUrl } from './validators';
export { mean, median, calculateDataQualityScore } from './calculations';

export default catalogUtils;