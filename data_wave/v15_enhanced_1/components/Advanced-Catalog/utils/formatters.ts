// ============================================================================
// FORMATTERS UTILITY - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Data formatting utilities for the Advanced Catalog components
// ============================================================================

import { format, formatDistance, parseISO, isValid } from 'date-fns';

// ============================================================================
// DATE & TIME FORMATTERS
// ============================================================================

/**
 * Format date to human readable string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    
    return format(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format datetime to human readable string
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    
    return format(dateObj, 'MMM dd, yyyy HH:mm:ss');
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(durationMs: number | null | undefined): string {
  if (durationMs === null || durationMs === undefined || durationMs < 0) return 'N/A';
  
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ============================================================================
// NUMBER FORMATTERS
// ============================================================================

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 */
export function formatNumber(num: number | null | undefined, decimals: number = 1): string {
  if (num === null || num === undefined) return 'N/A';
  if (num === 0) return '0';
  
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(decimals)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
  
  return num.toLocaleString();
}

/**
 * Format percentage with appropriate precision
 */
export function formatPercentage(
  value: number | null | undefined, 
  decimals: number = 1,
  includeSymbol: boolean = true
): string {
  if (value === null || value === undefined) return 'N/A';
  
  const formatted = (value * 100).toFixed(decimals);
  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes < 0) return 'N/A';
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const base = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(base));
  
  return `${(bytes / Math.pow(base, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (amount === null || amount === undefined) return 'N/A';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// ============================================================================
// STRING FORMATTERS
// ============================================================================

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | null | undefined, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format camelCase to Title Case
 */
export function camelToTitle(camelCase: string): string {
  if (!camelCase) return '';
  
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Format snake_case to Title Case
 */
export function snakeToTitle(snakeCase: string): string {
  if (!snakeCase) return '';
  
  return snakeCase
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format kebab-case to Title Case
 */
export function kebabToTitle(kebabCase: string): string {
  if (!kebabCase) return '';
  
  return kebabCase
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format text to be URL-friendly
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  if (!text) return '';
  
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// ============================================================================
// ARRAY & OBJECT FORMATTERS
// ============================================================================

/**
 * Format array to comma-separated string
 */
export function formatArray(
  arr: any[] | null | undefined,
  formatter?: (item: any) => string,
  separator: string = ', '
): string {
  if (!arr || arr.length === 0) return 'None';
  
  const formattedItems = formatter ? arr.map(formatter) : arr.map(String);
  return formattedItems.join(separator);
}

/**
 * Format object keys to human readable labels
 */
export function formatObjectKeys(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {};
  
  const formatted: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const formattedKey = camelToTitle(key);
    formatted[formattedKey] = value;
  });
  
  return formatted;
}

// ============================================================================
// STATUS & BADGE FORMATTERS
// ============================================================================

/**
 * Format status to display-friendly text
 */
export function formatStatus(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  
  // Common status mappings
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'PENDING': 'Pending',
    'COMPLETED': 'Completed',
    'FAILED': 'Failed',
    'RUNNING': 'Running',
    'CANCELLED': 'Cancelled',
    'IN_PROGRESS': 'In Progress',
    'NOT_STARTED': 'Not Started',
    'SCHEDULED': 'Scheduled',
    'PAUSED': 'Paused',
    'SUCCESS': 'Success',
    'ERROR': 'Error',
    'WARNING': 'Warning'
  };
  
  return statusMap[status.toUpperCase()] || titleCase(status.replace(/_/g, ' '));
}

/**
 * Format priority levels
 */
export function formatPriority(priority: string | number | null | undefined): string {
  if (priority === null || priority === undefined) return 'Normal';
  
  if (typeof priority === 'number') {
    if (priority >= 8) return 'Critical';
    if (priority >= 6) return 'High';
    if (priority >= 4) return 'Medium';
    if (priority >= 2) return 'Low';
    return 'Lowest';
  }
  
  const priorityMap: Record<string, string> = {
    'CRITICAL': 'Critical',
    'HIGH': 'High',
    'MEDIUM': 'Medium',
    'NORMAL': 'Normal',
    'LOW': 'Low',
    'LOWEST': 'Lowest'
  };
  
  return priorityMap[priority.toUpperCase()] || titleCase(priority);
}

// ============================================================================
// DATA TYPE FORMATTERS
// ============================================================================

/**
 * Format data type to display-friendly format
 */
export function formatDataType(dataType: string | null | undefined): string {
  if (!dataType) return 'Unknown';
  
  const typeMap: Record<string, string> = {
    'STRING': 'Text',
    'VARCHAR': 'Text',
    'CHAR': 'Character',
    'TEXT': 'Text',
    'INTEGER': 'Integer',
    'INT': 'Integer',
    'BIGINT': 'Big Integer',
    'SMALLINT': 'Small Integer',
    'DECIMAL': 'Decimal',
    'NUMERIC': 'Numeric',
    'FLOAT': 'Float',
    'DOUBLE': 'Double',
    'BOOLEAN': 'Boolean',
    'BOOL': 'Boolean',
    'DATE': 'Date',
    'DATETIME': 'Date & Time',
    'TIMESTAMP': 'Timestamp',
    'TIME': 'Time',
    'JSON': 'JSON',
    'ARRAY': 'Array',
    'OBJECT': 'Object'
  };
  
  return typeMap[dataType.toUpperCase()] || titleCase(dataType);
}

/**
 * Format schema information
 */
export function formatSchema(schema: any): string {
  if (!schema) return 'No schema';
  
  if (typeof schema === 'string') return schema;
  
  if (Array.isArray(schema)) {
    return `${schema.length} columns`;
  }
  
  if (typeof schema === 'object' && schema.columns) {
    return `${schema.columns.length} columns`;
  }
  
  return 'Complex schema';
}

// ============================================================================
// METRIC FORMATTERS
// ============================================================================

/**
 * Format quality score (0-1) to percentage with color coding
 */
export function formatQualityScore(score: number | null | undefined): {
  formatted: string;
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
} {
  if (score === null || score === undefined) {
    return { formatted: 'N/A', level: 'unknown' };
  }
  
  const percentage = Math.round(score * 100);
  const formatted = `${percentage}%`;
  
  let level: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
  if (percentage >= 90) level = 'excellent';
  else if (percentage >= 75) level = 'good';
  else if (percentage >= 60) level = 'fair';
  
  return { formatted, level };
}

/**
 * Format confidence score
 */
export function formatConfidence(confidence: number | null | undefined): string {
  if (confidence === null || confidence === undefined) return 'N/A';
  
  const percentage = Math.round(confidence * 100);
  
  if (percentage >= 95) return `${percentage}% (Very High)`;
  if (percentage >= 80) return `${percentage}% (High)`;
  if (percentage >= 60) return `${percentage}% (Medium)`;
  if (percentage >= 40) return `${percentage}% (Low)`;
  return `${percentage}% (Very Low)`;
}

// ============================================================================
// EXPORT DEFAULT FORMATTER COLLECTION
// ============================================================================

export const formatters = {
  // Date & Time
  date: formatDate,
  dateTime: formatDateTime,
  relativeTime: formatRelativeTime,
  duration: formatDuration,
  
  // Numbers
  number: formatNumber,
  percentage: formatPercentage,
  fileSize: formatFileSize,
  currency: formatCurrency,
  
  // Strings
  truncate: truncateText,
  camelToTitle,
  snakeToTitle,
  kebabToTitle,
  slugify,
  titleCase,
  
  // Arrays & Objects
  array: formatArray,
  objectKeys: formatObjectKeys,
  
  // Status & Badges
  status: formatStatus,
  priority: formatPriority,
  
  // Data Types
  dataType: formatDataType,
  schema: formatSchema,
  
  // Metrics
  qualityScore: formatQualityScore,
  confidence: formatConfidence
};

export default formatters;