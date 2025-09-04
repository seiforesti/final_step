// Advanced RBAC Formatting Utilities - Enterprise-grade data formatting and display
// Provides consistent formatting across the RBAC system for dates, numbers, text, and complex data structures

import type { 
  User, 
  Role, 
  Permission, 
  Resource, 
  Group,
  RbacAuditLog,
  PermissionMatrix,
  AccessRequest,
  EffectivePermission
} from '../types';

// ============================================================================
// DATE AND TIME FORMATTING
// ============================================================================

/**
 * Format date for display with timezone support
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full' | 'relative' | 'iso';
    timezone?: string;
    locale?: string;
  } = {}
): string {
  if (!date) return 'Never';
  
  const {
    format = 'medium',
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale = 'en-US'
  } = options;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: timezone
      }).format(dateObj);
      
    case 'medium':
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
      }).format(dateObj);
      
    case 'long':
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone
      }).format(dateObj);
      
    case 'full':
      return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        timeZone: timezone
      }).format(dateObj);
      
    case 'relative':
      return formatRelativeTime(dateObj);
      
    case 'iso':
      return dateObj.toISOString();
      
    default:
      return dateObj.toLocaleDateString(locale, { timeZone: timezone });
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 5 minutes")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (Math.abs(diffMinutes) < 1) {
    return 'Just now';
  } else if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''}`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''}`;
  } else if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (Math.abs(diffWeeks) < 4) {
    return diffWeeks > 0 ? `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffWeeks)} week${Math.abs(diffWeeks) !== 1 ? 's' : ''}`;
  } else if (Math.abs(diffMonths) < 12) {
    return diffMonths > 0 ? `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffMonths)} month${Math.abs(diffMonths) !== 1 ? 's' : ''}`;
  } else {
    return diffYears > 0 ? `${diffYears} year${diffYears !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffYears)} year${Math.abs(diffYears) !== 1 ? 's' : ''}`;
  }
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// ============================================================================
// USER FORMATTING
// ============================================================================

/**
 * Format user display name with fallbacks
 */
export function formatUserName(user: User | null | undefined): string {
  if (!user) return 'Unknown User';
  
  if (user.display_name && user.display_name.trim()) {
    return user.display_name.trim();
  }
  
  if (user.first_name && user.last_name) {
    return `${user.first_name.trim()} ${user.last_name.trim()}`;
  }
  
  if (user.first_name) {
    return user.first_name.trim();
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return `User ${user.id}`;
}

/**
 * Format user email with privacy options
 */
export function formatUserEmail(
  email: string | null | undefined,
  options: {
    privacy?: 'none' | 'partial' | 'full';
    maxLength?: number;
  } = {}
): string {
  if (!email) return 'No email';
  
  const { privacy = 'none', maxLength } = options;
  
  let formattedEmail = email;
  
  // Apply privacy masking
  switch (privacy) {
    case 'partial':
      const [localPart, domain] = email.split('@');
      if (localPart && domain) {
        const maskedLocal = localPart.length > 2 
          ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
          : localPart;
        formattedEmail = `${maskedLocal}@${domain}`;
      }
      break;
    case 'full':
      formattedEmail = '*'.repeat(email.length);
      break;
  }
  
  // Apply length truncation
  if (maxLength && formattedEmail.length > maxLength) {
    formattedEmail = formattedEmail.substring(0, maxLength - 3) + '...';
  }
  
  return formattedEmail;
}

/**
 * Format user status with color coding
 */
export function formatUserStatus(user: User): {
  text: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
  icon: string;
} {
  if (!user.is_active) {
    return {
      text: 'Inactive',
      color: 'red',
      icon: 'user-slash'
    };
  }
  
  if (!user.is_verified) {
    return {
      text: 'Unverified',
      color: 'yellow',
      icon: 'user-clock'
    };
  }
  
  if (user.mfa_enabled) {
    return {
      text: 'Active (MFA)',
      color: 'green',
      icon: 'user-shield'
    };
  }
  
  return {
    text: 'Active',
    color: 'green',
    icon: 'user-check'
  };
}

// ============================================================================
// ROLE AND PERMISSION FORMATTING
// ============================================================================

/**
 * Format role name with hierarchy indication
 */
export function formatRoleName(
  role: Role,
  options: {
    showHierarchy?: boolean;
    hierarchyLevel?: number;
    maxLength?: number;
  } = {}
): string {
  const { showHierarchy = false, hierarchyLevel = 0, maxLength } = options;
  
  let formattedName = role.name;
  
  if (showHierarchy && hierarchyLevel > 0) {
    const indent = '  '.repeat(hierarchyLevel);
    formattedName = `${indent}└─ ${formattedName}`;
  }
  
  if (maxLength && formattedName.length > maxLength) {
    formattedName = formattedName.substring(0, maxLength - 3) + '...';
  }
  
  return formattedName;
}

/**
 * Format permission action and resource for display
 */
export function formatPermission(permission: Permission): {
  action: string;
  resource: string;
  display: string;
  category: string;
} {
  const actionParts = permission.action.split('.');
  const resourceParts = permission.resource.split('.');
  
  const category = actionParts[0] || 'general';
  const actionName = actionParts[actionParts.length - 1] || permission.action;
  const resourceName = resourceParts[resourceParts.length - 1] || permission.resource;
  
  return {
    action: actionName,
    resource: resourceName,
    display: `${capitalizeFirst(actionName)} ${resourceName}`,
    category: capitalizeFirst(category)
  };
}

/**
 * Format permission conditions for display
 */
export function formatPermissionConditions(conditions: string | null | undefined): string {
  if (!conditions) return 'No conditions';
  
  try {
    const parsed = JSON.parse(conditions);
    const conditionParts: string[] = [];
    
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'object' && value !== null && '$op' in value) {
        const { $op: op, value: operand } = value as any;
        conditionParts.push(formatConditionOperator(key, op, operand));
      } else if (Array.isArray(value)) {
        conditionParts.push(`${key} in [${value.join(', ')}]`);
      } else {
        conditionParts.push(`${key} = ${value}`);
      }
    }
    
    return conditionParts.join(' AND ');
  } catch {
    return 'Invalid conditions';
  }
}

/**
 * Format condition operator for display
 */
function formatConditionOperator(key: string, operator: string, operand: any): string {
  switch (operator) {
    case 'eq':
      return `${key} = ${operand}`;
    case 'ne':
      return `${key} ≠ ${operand}`;
    case 'in':
      return `${key} in [${Array.isArray(operand) ? operand.join(', ') : operand}]`;
    case 'not_in':
      return `${key} not in [${Array.isArray(operand) ? operand.join(', ') : operand}]`;
    case 'gt':
      return `${key} > ${operand}`;
    case 'gte':
      return `${key} ≥ ${operand}`;
    case 'lt':
      return `${key} < ${operand}`;
    case 'lte':
      return `${key} ≤ ${operand}`;
    case 'regex':
      return `${key} matches /${operand}/`;
    case 'user_attr':
      return `${key} = user.${operand}`;
    default:
      return `${key} ${operator} ${operand}`;
  }
}

// ============================================================================
// RESOURCE FORMATTING
// ============================================================================

/**
 * Format resource hierarchy path
 */
export function formatResourcePath(
  resource: Resource,
  ancestors: Resource[] = [],
  options: {
    separator?: string;
    maxLength?: number;
    showTypes?: boolean;
  } = {}
): string {
  const { separator = ' > ', maxLength, showTypes = false } = options;
  
  const path = [...ancestors, resource];
  const pathParts = path.map(r => 
    showTypes ? `${r.name} (${r.type})` : r.name
  );
  
  let formattedPath = pathParts.join(separator);
  
  if (maxLength && formattedPath.length > maxLength) {
    // Truncate from the beginning, keeping the resource name
    const resourcePart = pathParts[pathParts.length - 1];
    const availableLength = maxLength - resourcePart.length - 3; // 3 for "..."
    
    if (availableLength > 0) {
      let truncatedPath = '...';
      for (let i = pathParts.length - 2; i >= 0; i--) {
        const part = separator + pathParts[i];
        if (truncatedPath.length + part.length <= availableLength) {
          truncatedPath = part + truncatedPath;
        } else {
          break;
        }
      }
      formattedPath = truncatedPath + separator + resourcePart;
    } else {
      formattedPath = '...' + separator + resourcePart;
    }
  }
  
  return formattedPath;
}

/**
 * Format resource type with icon
 */
export function formatResourceType(type: string): {
  text: string;
  icon: string;
  color: string;
} {
  const typeMap: Record<string, { icon: string; color: string }> = {
    'server': { icon: 'server', color: '#3b82f6' },
    'database': { icon: 'database', color: '#10b981' },
    'schema': { icon: 'folder', color: '#f59e0b' },
    'table': { icon: 'table', color: '#8b5cf6' },
    'collection': { icon: 'folder-open', color: '#ef4444' },
    'data_source': { icon: 'plug', color: '#06b6d4' },
    'file': { icon: 'file', color: '#6b7280' },
    'api': { icon: 'code', color: '#ec4899' }
  };
  
  const config = typeMap[type.toLowerCase()] || { icon: 'cube', color: '#6b7280' };
  
  return {
    text: capitalizeFirst(type.replace('_', ' ')),
    icon: config.icon,
    color: config.color
  };
}

// ============================================================================
// AUDIT LOG FORMATTING
// ============================================================================

/**
 * Format audit log action for display
 */
export function formatAuditAction(log: RbacAuditLog): {
  action: string;
  description: string;
  icon: string;
  color: string;
} {
  const actionMap: Record<string, { description: string; icon: string; color: string }> = {
    'create_user': { description: 'User created', icon: 'user-plus', color: '#10b981' },
    'update_user': { description: 'User updated', icon: 'user-edit', color: '#3b82f6' },
    'delete_user': { description: 'User deleted', icon: 'user-minus', color: '#ef4444' },
    'create_role': { description: 'Role created', icon: 'shield-plus', color: '#10b981' },
    'update_role': { description: 'Role updated', icon: 'shield-edit', color: '#3b82f6' },
    'delete_role': { description: 'Role deleted', icon: 'shield-minus', color: '#ef4444' },
    'assign_role': { description: 'Role assigned', icon: 'user-tag', color: '#8b5cf6' },
    'revoke_role': { description: 'Role revoked', icon: 'user-x', color: '#f59e0b' },
    'create_permission': { description: 'Permission created', icon: 'key-plus', color: '#10b981' },
    'update_permission': { description: 'Permission updated', icon: 'key-edit', color: '#3b82f6' },
    'delete_permission': { description: 'Permission deleted', icon: 'key-minus', color: '#ef4444' },
    'login': { description: 'User login', icon: 'login', color: '#10b981' },
    'logout': { description: 'User logout', icon: 'logout', color: '#6b7280' },
    'failed_login': { description: 'Failed login attempt', icon: 'alert-triangle', color: '#ef4444' }
  };
  
  const config = actionMap[log.action] || {
    description: capitalizeFirst(log.action.replace('_', ' ')),
    icon: 'activity',
    color: '#6b7280'
  };
  
  return {
    action: log.action,
    description: config.description,
    icon: config.icon,
    color: config.color
  };
}

/**
 * Format audit log target for display
 */
export function formatAuditTarget(log: RbacAuditLog): string {
  if (log.target_user) {
    return `User: ${log.target_user}`;
  }
  
  if (log.resource_type && log.resource_id) {
    return `${capitalizeFirst(log.resource_type)}: ${log.resource_id}`;
  }
  
  if (log.role) {
    return `Role: ${log.role}`;
  }
  
  return 'System';
}

// ============================================================================
// ACCESS REQUEST FORMATTING
// ============================================================================

/**
 * Format access request status
 */
export function formatAccessRequestStatus(status: string): {
  text: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  icon: string;
} {
  const statusMap: Record<string, { text: string; color: 'green' | 'yellow' | 'red' | 'blue' | 'gray'; icon: string }> = {
    'pending': { text: 'Pending Review', color: 'yellow', icon: 'clock' },
    'approved': { text: 'Approved', color: 'green', icon: 'check-circle' },
    'rejected': { text: 'Rejected', color: 'red', icon: 'x-circle' },
    'expired': { text: 'Expired', color: 'gray', icon: 'calendar-x' },
    'withdrawn': { text: 'Withdrawn', color: 'gray', icon: 'arrow-left' }
  };
  
  return statusMap[status.toLowerCase()] || { text: status, color: 'gray', icon: 'help-circle' };
}

// ============================================================================
// NUMERIC FORMATTING
// ============================================================================

/**
 * Format numbers with locale support
 */
export function formatNumber(
  value: number | null | undefined,
  options: {
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  const {
    style = 'decimal',
    currency = 'USD',
    locale = 'en-US',
    ...formatOptions
  } = options;
  
  return new Intl.NumberFormat(locale, {
    style,
    currency: style === 'currency' ? currency : undefined,
    ...formatOptions
  }).format(value);
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format percentage with precision
 */
export function formatPercentage(
  value: number,
  options: {
    precision?: number;
    showSign?: boolean;
  } = {}
): string {
  const { precision = 1, showSign = false } = options;
  
  const formatted = (value * 100).toFixed(precision) + '%';
  
  if (showSign && value > 0) {
    return '+' + formatted;
  }
  
  return formatted;
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Capitalize first letter of a string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert camelCase or snake_case to Title Case
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string,
  maxLength: number,
  options: {
    ellipsis?: string;
    preserveWords?: boolean;
  } = {}
): string {
  if (!text || text.length <= maxLength) return text;
  
  const { ellipsis = '...', preserveWords = true } = options;
  
  if (preserveWords) {
    const words = text.split(' ');
    let truncated = '';
    
    for (const word of words) {
      if ((truncated + word + ellipsis).length > maxLength) {
        break;
      }
      truncated += (truncated ? ' ' : '') + word;
    }
    
    return truncated + ellipsis;
  }
  
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(
  text: string,
  searchTerms: string[],
  options: {
    caseSensitive?: boolean;
    highlightClass?: string;
  } = {}
): string {
  if (!text || !searchTerms.length) return text;
  
  const { caseSensitive = false, highlightClass = 'highlight' } = options;
  
  let highlightedText = text;
  
  searchTerms.forEach(term => {
    if (!term.trim()) return;
    
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${escapeRegExp(term)})`, flags);
    
    highlightedText = highlightedText.replace(
      regex,
      `<span class="${highlightClass}">$1</span>`
    );
  });
  
  return highlightedText;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// COMPLEX DATA FORMATTING
// ============================================================================

/**
 * Format permission matrix for display
 */
export function formatPermissionMatrix(matrix: PermissionMatrix): {
  headers: string[];
  rows: Array<{
    user: string;
    permissions: Array<{
      permission: string;
      hasAccess: boolean;
      source?: string;
    }>;
  }>;
} {
  const headers = ['User', ...matrix.permissions.map(p => 
    `${formatPermission(p).display}`
  )];
  
  const rows = matrix.users.map(user => ({
    user: formatUserName(user),
    permissions: matrix.permissions.map(permission => {
      const entry = matrix.matrix.find(m => 
        m.user_id === user.id && m.permission_id === permission.id
      );
      
      return {
        permission: `${permission.action}:${permission.resource}`,
        hasAccess: entry?.has_permission || false,
        source: entry?.source_details
      };
    })
  }));
  
  return { headers, rows };
}

/**
 * Format effective permissions for display
 */
export function formatEffectivePermissions(
  permissions: EffectivePermission[]
): Array<{
  category: string;
  permissions: Array<{
    display: string;
    action: string;
    resource: string;
    isEffective: boolean;
    source: string;
    note?: string;
  }>;
}> {
  const grouped = new Map<string, EffectivePermission[]>();
  
  permissions.forEach(perm => {
    const category = perm.action.split('.')[0] || 'general';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(perm);
  });
  
  return Array.from(grouped.entries()).map(([category, perms]) => ({
    category: capitalizeFirst(category),
    permissions: perms.map(perm => ({
      display: formatPermission(perm).display,
      action: perm.action,
      resource: perm.resource,
      isEffective: perm.is_effective,
      source: perm.source,
      note: perm.note
    }))
  }));
}

/**
 * Format JSON data for display
 */
export function formatJsonForDisplay(
  data: any,
  options: {
    indent?: number;
    maxDepth?: number;
    sortKeys?: boolean;
  } = {}
): string {
  const { indent = 2, maxDepth = 10, sortKeys = true } = options;
  
  try {
    const processData = (obj: any, depth: number = 0): any => {
      if (depth >= maxDepth) {
        return '[Max depth reached]';
      }
      
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => processData(item, depth + 1));
      }
      
      const processed: any = {};
      const keys = sortKeys ? Object.keys(obj).sort() : Object.keys(obj);
      
      keys.forEach(key => {
        processed[key] = processData(obj[key], depth + 1);
      });
      
      return processed;
    };
    
    return JSON.stringify(processData(data), null, indent);
  } catch (error) {
    return 'Invalid JSON data';
  }
}

/**
 * Format date and time for display
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full';
    timezone?: string;
    locale?: string;
    showTime?: boolean;
  } = {}
): string {
  if (!date) return 'Never';
  
  const {
    format = 'medium',
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale = 'en-US',
    showTime = true
  } = options;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone
  };
  
  switch (format) {
    case 'short':
      dateOptions.year = 'numeric';
      dateOptions.month = '2-digit';
      dateOptions.day = '2-digit';
      if (showTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
      }
      break;
      
    case 'medium':
      dateOptions.year = 'numeric';
      dateOptions.month = 'short';
      dateOptions.day = 'numeric';
      if (showTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
      }
      break;
      
    case 'long':
      dateOptions.year = 'numeric';
      dateOptions.month = 'long';
      dateOptions.day = 'numeric';
      if (showTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
        dateOptions.second = '2-digit';
      }
      break;
      
    case 'full':
      dateOptions.weekday = 'long';
      dateOptions.year = 'numeric';
      dateOptions.month = 'long';
      dateOptions.day = 'numeric';
      if (showTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
        dateOptions.second = '2-digit';
        dateOptions.timeZoneName = 'short';
      }
      break;
  }
  
  return new Intl.DateTimeFormat(locale, dateOptions).format(dateObj);
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(
  bytes: number,
  options: {
    decimals?: number;
    binary?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { decimals = 2, binary = false, compact = false } = options;
  
  if (bytes === 0) return '0 Bytes';
  
  const k = binary ? 1024 : 1000;
  const sizes = binary 
    ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (compact && i === 0) {
    return `${bytes}${sizes[i]}`;
  }
  
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
  const size = sizes[i];
  
  return `${value} ${size}`;
}

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatUserName,
  formatUserEmail,
  formatUserStatus,
  formatRoleName,
  formatPermission,
  formatPermissionConditions,
  formatResourcePath,
  formatResourceType,
  formatAuditAction,
  formatAuditTarget,
  formatAccessRequestStatus,
  formatNumber,
  formatFileSize,
  formatBytes,
  formatPercentage,
  capitalizeFirst,
  toTitleCase,
  truncateText,
  highlightSearchTerms,
  formatPermissionMatrix,
  formatEffectivePermissions,
  formatJsonForDisplay
};