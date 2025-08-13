// ============================================================================
// HELPERS UTILITY - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// General helper functions for the Advanced Catalog components
// ============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get color for status
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'ACTIVE': 'text-green-600 bg-green-50',
    'INACTIVE': 'text-gray-600 bg-gray-50',
    'PENDING': 'text-yellow-600 bg-yellow-50',
    'COMPLETED': 'text-green-600 bg-green-50',
    'FAILED': 'text-red-600 bg-red-50',
    'RUNNING': 'text-blue-600 bg-blue-50',
    'CANCELLED': 'text-gray-600 bg-gray-50',
    'SUCCESS': 'text-green-600 bg-green-50',
    'ERROR': 'text-red-600 bg-red-50',
    'WARNING': 'text-yellow-600 bg-yellow-50'
  };
  
  return colorMap[status?.toUpperCase()] || 'text-gray-600 bg-gray-50';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string | number): string {
  if (typeof priority === 'number') {
    if (priority >= 8) return 'text-red-600 bg-red-50';
    if (priority >= 6) return 'text-orange-600 bg-orange-50';
    if (priority >= 4) return 'text-yellow-600 bg-yellow-50';
    if (priority >= 2) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  }
  
  const colorMap: Record<string, string> = {
    'CRITICAL': 'text-red-600 bg-red-50',
    'HIGH': 'text-orange-600 bg-orange-50',
    'MEDIUM': 'text-yellow-600 bg-yellow-50',
    'NORMAL': 'text-blue-600 bg-blue-50',
    'LOW': 'text-gray-600 bg-gray-50',
    'LOWEST': 'text-gray-400 bg-gray-25'
  };
  
  return colorMap[priority?.toUpperCase()] || 'text-gray-600 bg-gray-50';
}

/**
 * Get quality score color
 */
export function getQualityScoreColor(score: number): string {
  if (score >= 0.9) return 'text-green-600 bg-green-50';
  if (score >= 0.75) return 'text-blue-600 bg-blue-50';
  if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by multiple keys
 */
export function sortByKeys<T>(
  array: T[],
  keys: Array<{ key: keyof T; direction: 'asc' | 'desc' }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { key, direction } of keys) {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Find items in array by multiple criteria
 */
export function findByMultipleCriteria<T>(
  array: T[],
  criteria: Partial<T>
): T[] {
  return array.filter(item =>
    Object.entries(criteria).every(([key, value]) =>
      item[key as keyof T] === value
    )
  );
}

// ============================================================================
// OBJECT HELPERS
// ============================================================================

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj: any = {};
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone((obj as any)[key]);
    });
    return clonedObj;
  }
  return obj;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get nested property value
 */
export function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested property value
 */
export function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  
  if (lastKey) {
    target[lastKey] = value;
  }
}

/**
 * Omit properties from object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Pick properties from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// ============================================================================
// STRING HELPERS
// ============================================================================

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Escape HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generate initials from name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxLength)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return initials;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, searchTerms: string[]): string {
  if (!searchTerms.length) return text;
  
  let highlightedText = text;
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
}

// ============================================================================
// ASYNC HELPERS
// ============================================================================

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retry async function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError!;
}

/**
 * Run promises with concurrency limit
 */
export async function promiseAllWithConcurrency<T>(
  promises: (() => Promise<T>)[],
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (let i = 0; i < promises.length; i++) {
    const promise = promises[i]().then(result => {
      results[i] = result;
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for checking if value is array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

// ============================================================================
// ERROR HELPERS
// ============================================================================

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Extract error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

/**
 * Safe function execution
 */
export function safe<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn();
  } catch {
    return defaultValue;
  }
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Create range of numbers
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Convert bytes to human readable format
 */
export function humanFileSize(bytes: number, si: boolean = false, dp: number = 1): string {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}

// ============================================================================
// EXPORT DEFAULT HELPERS COLLECTION
// ============================================================================

export const helpers = {
  // UI Helpers
  cn,
  generateId,
  generateUUID,
  getStatusColor,
  getPriorityColor,
  getQualityScoreColor,
  
  // Array Helpers
  removeDuplicates,
  groupBy,
  sortByKeys,
  chunk,
  findByMultipleCriteria,
  
  // Object Helpers
  deepClone,
  deepMerge,
  getNestedProperty,
  setNestedProperty,
  omit,
  pick,
  
  // String Helpers
  randomString,
  escapeHtml,
  getInitials,
  highlightSearchTerms,
  
  // Async Helpers
  sleep,
  debounce,
  throttle,
  retry,
  promiseAllWithConcurrency,
  
  // Type Helpers
  isDefined,
  isString,
  isNumber,
  isBoolean,
  isArray,
  
  // Error Helpers
  safeJsonParse,
  getErrorMessage,
  safe,
  
  // Utility Helpers
  range,
  clamp,
  isEmpty,
  getFileExtension,
  humanFileSize
};

export default helpers;