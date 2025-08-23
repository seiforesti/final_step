// Advanced RBAC Export/Import Utilities - Enterprise-grade data export and import
// Supports multiple formats: CSV, JSON, Excel, PDF with advanced features

import type { 
  User, 
  Role, 
  Permission, 
  Resource, 
  Group,
  RbacAuditLog,
  PermissionMatrix,
  AccessRequest,
  EffectivePermission,
  PermissionWithRoles
} from '../types';

import { rbacApiService } from '../services/rbac-api.service';
import { 
  formatDate, 
  formatUserName, 
  formatUserEmail,
  formatPermission,
  formatPermissionConditions,
  formatAuditAction,
  formatAuditTarget,
  formatAccessRequestStatus
} from './format.utils';

// ============================================================================
// EXPORT INTERFACES AND TYPES
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf' | 'xml';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: 'iso' | 'local' | 'relative';
  privacy?: 'none' | 'partial' | 'full';
  compression?: boolean;
  password?: string;
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    organization?: string;
  };
}

export interface ImportOptions {
  format: ExportFormat;
  skipValidation?: boolean;
  updateExisting?: boolean;
  dryRun?: boolean;
  batchSize?: number;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  recordCount: number;
  fileSize: number;
  downloadUrl?: string;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  warnings: string[];
}

// ============================================================================
// CSV EXPORT UTILITIES
// ============================================================================

/**
 * Export users to CSV format
 */
export function exportUsersToCSV(
  users: User[],
  options: Partial<ExportOptions> = {}
): string {
  const { 
    includeHeaders = true, 
    dateFormat = 'local',
    privacy = 'none'
  } = options;
  
  const headers = [
    'ID',
    'Email',
    'First Name',
    'Last Name',
    'Display Name',
    'Role',
    'Department',
    'Region',
    'Status',
    'Verified',
    'MFA Enabled',
    'Created At',
    'Last Login'
  ];
  
  const rows: string[] = [];
  
  if (includeHeaders) {
    rows.push(headers.join(','));
  }
  
  users.forEach(user => {
    const row = [
      user.id.toString(),
      formatUserEmail(user.email, { privacy }),
      user.first_name || '',
      user.last_name || '',
      user.display_name || '',
      user.role || '',
      user.department || '',
      user.region || '',
      user.is_active ? 'Active' : 'Inactive',
      user.is_verified ? 'Yes' : 'No',
      user.mfa_enabled ? 'Yes' : 'No',
      formatDate(user.created_at, { format: dateFormat === 'iso' ? 'iso' : 'medium' }),
      formatDate(user.last_login, { format: dateFormat === 'iso' ? 'iso' : 'medium' })
    ];
    
    rows.push(row.map(field => `"${field.replace(/"/g, '""')}"`).join(','));
  });
  
  return rows.join('\n');
}

/**
 * Export roles to CSV format
 */
export function exportRolesToCSV(
  roles: Role[],
  options: Partial<ExportOptions> = {}
): string {
  const { includeHeaders = true } = options;
  
  const headers = [
    'ID',
    'Name',
    'Description',
    'Permission Count',
    'User Count',
    'Parent Roles',
    'Child Roles'
  ];
  
  const rows: string[] = [];
  
  if (includeHeaders) {
    rows.push(headers.join(','));
  }
  
  roles.forEach(role => {
    const row = [
      role.id.toString(),
      role.name,
      role.description || '',
      (role.permissions?.length || 0).toString(),
      (role.users?.length || 0).toString(),
      role.parents?.map(p => p.name).join('; ') || '',
      role.children?.map(c => c.name).join('; ') || ''
    ];
    
    rows.push(row.map(field => `"${field.replace(/"/g, '""')}"`).join(','));
  });
  
  return rows.join('\n');
}

/**
 * Export permissions to CSV format
 */
export function exportPermissionsToCSV(
  permissions: PermissionWithRoles[],
  options: Partial<ExportOptions> = {}
): string {
  const { includeHeaders = true } = options;
  
  const headers = [
    'ID',
    'Action',
    'Resource',
    'Category',
    'Conditions',
    'Assigned Roles',
    'Role Count'
  ];
  
  const rows: string[] = [];
  
  if (includeHeaders) {
    rows.push(headers.join(','));
  }
  
  permissions.forEach(permission => {
    const formatted = formatPermission(permission);
    const row = [
      permission.id.toString(),
      permission.action,
      permission.resource,
      formatted.category,
      formatPermissionConditions(permission.conditions),
      permission.roles.map(r => r.name).join('; '),
      permission.roles.length.toString()
    ];
    
    rows.push(row.map(field => `"${field.replace(/"/g, '""')}"`).join(','));
  });
  
  return rows.join('\n');
}

/**
 * Export audit logs to CSV format
 */
export function exportAuditLogsToCSV(
  logs: RbacAuditLog[],
  options: Partial<ExportOptions> = {}
): string {
  const { 
    includeHeaders = true, 
    dateFormat = 'local'
  } = options;
  
  const headers = [
    'ID',
    'Action',
    'Description',
    'Performed By',
    'Target',
    'Status',
    'Note',
    'Timestamp',
    'IP Address',
    'User Agent'
  ];
  
  const rows: string[] = [];
  
  if (includeHeaders) {
    rows.push(headers.join(','));
  }
  
  logs.forEach(log => {
    const action = formatAuditAction(log);
    const target = formatAuditTarget(log);
    
    const row = [
      log.id?.toString() || '',
      log.action,
      action.description,
      log.performed_by,
      target,
      log.status || '',
      log.note || '',
      formatDate(log.timestamp, { format: dateFormat === 'iso' ? 'iso' : 'medium' }),
      log.actor_ip || '',
      log.actor_device || ''
    ];
    
    rows.push(row.map(field => `"${field.replace(/"/g, '""')}"`).join(','));
  });
  
  return rows.join('\n');
}

/**
 * Export access requests to CSV format
 */
export function exportAccessRequestsToCSV(
  requests: AccessRequest[],
  options: Partial<ExportOptions> = {}
): string {
  const { 
    includeHeaders = true, 
    dateFormat = 'local'
  } = options;
  
  const headers = [
    'ID',
    'User ID',
    'Resource Type',
    'Resource ID',
    'Requested Role',
    'Status',
    'Justification',
    'Review Note',
    'Reviewed By',
    'Created At',
    'Reviewed At'
  ];
  
  const rows: string[] = [];
  
  if (includeHeaders) {
    rows.push(headers.join(','));
  }
  
  requests.forEach(request => {
    const status = formatAccessRequestStatus(request.status);
    
    const row = [
      request.id?.toString() || '',
      request.user_id.toString(),
      request.resource_type,
      request.resource_id,
      request.requested_role,
      status.text,
      request.justification,
      request.review_note || '',
      request.reviewed_by || '',
      formatDate(request.created_at, { format: dateFormat === 'iso' ? 'iso' : 'medium' }),
      formatDate(request.reviewed_at, { format: dateFormat === 'iso' ? 'iso' : 'medium' })
    ];
    
    rows.push(row.map(field => `"${field.replace(/"/g, '""')}"`).join(','));
  });
  
  return rows.join('\n');
}

// ============================================================================
// JSON EXPORT UTILITIES
// ============================================================================

/**
 * Export data to JSON format with metadata
 */
export function exportToJSON<T>(
  data: T[],
  entityType: string,
  options: Partial<ExportOptions> = {}
): string {
  const { metadata, dateFormat = 'iso' } = options;
  
  const exportData = {
    metadata: {
      exportType: entityType,
      exportDate: new Date().toISOString(),
      recordCount: data.length,
      version: '1.0',
      ...metadata
    },
    data: data.map(item => {
      // Convert dates to specified format
      if (typeof item === 'object' && item !== null) {
        const processed = { ...item };
        Object.keys(processed).forEach(key => {
          const value = (processed as any)[key];
          if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value))) {
            (processed as any)[key] = dateFormat === 'iso' 
              ? new Date(value).toISOString()
              : formatDate(value, { format: 'medium' });
          }
        });
        return processed;
      }
      return item;
    })
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export permission matrix to JSON
 */
export function exportPermissionMatrixToJSON(
  matrix: PermissionMatrix,
  options: Partial<ExportOptions> = {}
): string {
  const processedMatrix = {
    users: matrix.users.map(user => ({
      id: user.id,
      email: options.privacy === 'full' ? '***@***.***' : user.email,
      name: formatUserName(user),
      department: user.department,
      region: user.region
    })),
    permissions: matrix.permissions.map(perm => ({
      id: perm.id,
      action: perm.action,
      resource: perm.resource,
      display: formatPermission(perm).display,
      category: formatPermission(perm).category
    })),
    matrix: matrix.matrix.map(entry => ({
      userId: entry.user_id,
      permissionId: entry.permission_id,
      hasPermission: entry.has_permission,
      source: entry.source,
      sourceDetails: entry.source_details
    }))
  };
  
  return exportToJSON([processedMatrix], 'permission_matrix', options);
}

// ============================================================================
// EXCEL EXPORT UTILITIES
// ============================================================================

/**
 * Generate Excel-compatible CSV with advanced formatting
 */
export function exportToExcelCSV<T>(
  data: T[],
  columns: Array<{
    key: string;
    title: string;
    width?: number;
    format?: 'text' | 'number' | 'date' | 'currency' | 'percentage';
    transform?: (value: any) => string;
  }>,
  options: Partial<ExportOptions> = {}
): string {
  const { includeHeaders = true } = options;
  
  const rows: string[] = [];
  
  // Add BOM for proper UTF-8 encoding in Excel
  let csvContent = '\uFEFF';
  
  if (includeHeaders) {
    const headers = columns.map(col => col.title);
    rows.push(headers.join(','));
  }
  
  data.forEach(item => {
    const row = columns.map(col => {
      let value = (item as any)[col.key];
      
      // Apply transformation if provided
      if (col.transform) {
        value = col.transform(value);
      } else {
        // Default formatting based on type
        switch (col.format) {
          case 'date':
            value = formatDate(value, { format: 'medium' });
            break;
          case 'number':
            value = typeof value === 'number' ? value.toString() : '';
            break;
          case 'currency':
            value = typeof value === 'number' ? `$${value.toFixed(2)}` : '';
            break;
          case 'percentage':
            value = typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '';
            break;
          default:
            value = value?.toString() || '';
        }
      }
      
      // Escape and quote the value
      return `"${value.replace(/"/g, '""')}"`;
    });
    
    rows.push(row.join(','));
  });
  
  return csvContent + rows.join('\n');
}

// ============================================================================
// XML EXPORT UTILITIES
// ============================================================================

/**
 * Export data to XML format
 */
export function exportToXML<T>(
  data: T[],
  rootElement: string,
  itemElement: string,
  options: Partial<ExportOptions> = {}
): string {
  const { metadata } = options;
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<${rootElement}>\n`;
  
  // Add metadata if provided
  if (metadata) {
    xml += '  <metadata>\n';
    Object.entries(metadata).forEach(([key, value]) => {
      xml += `    <${key}>${escapeXml(value?.toString() || '')}</${key}>\n`;
    });
    xml += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
    xml += `    <recordCount>${data.length}</recordCount>\n`;
    xml += '  </metadata>\n';
  }
  
  xml += '  <data>\n';
  
  data.forEach(item => {
    xml += `    <${itemElement}>\n`;
    
    if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          xml += `      <${key}>${escapeXml(value.toString())}</${key}>\n`;
        }
      });
    }
    
    xml += `    </${itemElement}>\n`;
  });
  
  xml += '  </data>\n';
  xml += `</${rootElement}>`;
  
  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// FILE DOWNLOAD UTILITIES
// ============================================================================

/**
 * Download data as file in browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  if (typeof window === 'undefined') {
    throw new Error('File download is only available in browser environment');
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  window.URL.revokeObjectURL(url);
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    csv: 'text/csv;charset=utf-8',
    json: 'application/json;charset=utf-8',
    excel: 'application/vnd.ms-excel;charset=utf-8',
    pdf: 'application/pdf',
    xml: 'application/xml;charset=utf-8'
  };
  
  return mimeTypes[format] || 'text/plain;charset=utf-8';
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  entityType: string,
  format: ExportFormat,
  customName?: string
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseName = customName || `${entityType}_export_${timestamp}`;
  
  const extensions: Record<ExportFormat, string> = {
    csv: 'csv',
    json: 'json',
    excel: 'xlsx',
    pdf: 'pdf',
    xml: 'xml'
  };
  
  return `${baseName}.${extensions[format]}`;
}

// ============================================================================
// BATCH EXPORT UTILITIES
// ============================================================================

/**
 * Export multiple entity types in a single archive
 */
export async function exportBatchData(
  entities: Array<{
    type: string;
    data: any[];
    format: ExportFormat;
  }>,
  options: Partial<ExportOptions> = {}
): Promise<ExportResult[]> {
  const results: ExportResult[] = [];
  
  for (const entity of entities) {
    try {
      let content: string;
      let filename: string;
      
      switch (entity.format) {
        case 'csv':
          content = await exportEntityToCSV(entity.type, entity.data, options);
          break;
        case 'json':
          content = exportToJSON(entity.data, entity.type, options);
          break;
        case 'xml':
          content = exportToXML(entity.data, `${entity.type}_export`, entity.type, options);
          break;
        default:
          throw new Error(`Unsupported format: ${entity.format}`);
      }
      
      filename = generateFilename(entity.type, entity.format);
      
      results.push({
        success: true,
        filename,
        format: entity.format,
        recordCount: entity.data.length,
        fileSize: new Blob([content]).size
      });
      
    } catch (error) {
      results.push({
        success: false,
        filename: generateFilename(entity.type, entity.format),
        format: entity.format,
        recordCount: 0,
        fileSize: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

/**
 * Export entity to CSV based on type
 */
async function exportEntityToCSV(
  entityType: string,
  data: any[],
  options: Partial<ExportOptions>
): Promise<string> {
  switch (entityType) {
    case 'users':
      return exportUsersToCSV(data, options);
    case 'roles':
      return exportRolesToCSV(data, options);
    case 'permissions':
      return exportPermissionsToCSV(data, options);
    case 'audit_logs':
      return exportAuditLogsToCSV(data, options);
    case 'access_requests':
      return exportAccessRequestsToCSV(data, options);
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
}

// ============================================================================
// IMPORT UTILITIES
// ============================================================================

/**
 * Parse CSV content to objects
 */
export function parseCSV(
  csvContent: string,
  options: {
    hasHeaders?: boolean;
    delimiter?: string;
    quote?: string;
  } = {}
): any[] {
  const { hasHeaders = true, delimiter = ',', quote = '"' } = options;
  
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const parseRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === quote) {
        if (inQuotes && row[i + 1] === quote) {
          current += quote;
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };
  
  const headers = hasHeaders ? parseRow(lines[0]) : [];
  const dataStartIndex = hasHeaders ? 1 : 0;
  
  return lines.slice(dataStartIndex).map((line, index) => {
    const values = parseRow(line);
    
    if (hasHeaders) {
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    } else {
      return values;
    }
  });
}

/**
 * Import users from CSV
 */
export async function importUsersFromCSV(
  csvContent: string,
  options: Partial<ImportOptions> = {}
): Promise<ImportResult> {
  const { skipValidation = false, updateExisting = false, dryRun = false } = options;
  
  try {
    const data = parseCSV(csvContent);
    const result: ImportResult = {
      success: true,
      recordsProcessed: data.length,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      warnings: []
    };
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Account for header row
      
      try {
        // Validate required fields
        if (!skipValidation) {
          if (!row.email) {
            result.errors.push({
              row: rowNumber,
              field: 'email',
              message: 'Email is required'
            });
            continue;
          }
        }
        
        if (!dryRun) {
          // Call backend API to create/update user
          const response = await rbacApiService.post('/rbac/users/import', {
            email: row.email,
            first_name: row['First Name'],
            last_name: row['Last Name'],
            role: row.Role,
            department: row.Department,
            region: row.Region,
            update_existing: updateExisting
          });
          
          if (response.data.created) {
            result.recordsCreated++;
          } else if (response.data.updated) {
            result.recordsUpdated++;
          } else {
            result.recordsSkipped++;
          }
        }
        
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
    
  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Failed to parse CSV'
      }],
      warnings: []
    };
  }
}

/**
 * Import data from JSON
 */
export async function importFromJSON<T>(
  jsonContent: string,
  entityType: string,
  options: Partial<ImportOptions> = {}
): Promise<ImportResult> {
  try {
    const parsed = JSON.parse(jsonContent);
    const data = parsed.data || parsed; // Handle both wrapped and direct formats
    
    const result: ImportResult = {
      success: true,
      recordsProcessed: Array.isArray(data) ? data.length : 1,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      warnings: []
    };
    
    if (!options.dryRun) {
      // Call backend API for import
      const response = await rbacApiService.post(`/rbac/${entityType}/import`, {
        data,
        options
      });
      
      Object.assign(result, response.data);
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Failed to parse JSON'
      }],
      warnings: []
    };
  }
}

// ============================================================================
// EXPORT/IMPORT ORCHESTRATION
// ============================================================================

/**
 * Complete export workflow with backend integration
 */
export async function exportRBACData(
  entityTypes: string[],
  format: ExportFormat,
  options: Partial<ExportOptions> = {}
): Promise<ExportResult> {
  try {
    const response = await rbacApiService.post<{
      success: boolean;
      filename: string;
      downloadUrl: string;
      recordCount: number;
      fileSize: number;
    }>('/rbac/export', {
      entity_types: entityTypes,
      format,
      options
    });
    
    return {
      success: response.data.success,
      filename: response.data.filename,
      format,
      recordCount: response.data.recordCount,
      fileSize: response.data.fileSize,
      downloadUrl: response.data.downloadUrl
    };
    
  } catch (error) {
    return {
      success: false,
      filename: '',
      format,
      recordCount: 0,
      fileSize: 0,
      error: error instanceof Error ? error.message : 'Export failed'
    };
  }
}

/**
 * Complete import workflow with backend integration
 */
export async function importRBACData(
  file: File,
  entityType: string,
  options: Partial<ImportOptions> = {}
): Promise<ImportResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('options', JSON.stringify(options));
    
    const response = await rbacApiService.post<ImportResult>('/rbac/import', formData);
    
    return response.data;
    
  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Import failed'
      }],
      warnings: []
    };
  }
}

/**
 * Export users to JSON format
 */
export function exportUsersToJSON(
  users: User[],
  options: Partial<ExportOptions> = {}
): string {
  const { 
    dateFormat = 'iso',
    privacy = 'none'
  } = options;
  
  const exportData = users.map(user => {
    const userData: any = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name,
      status: user.status,
      created_at: formatDate(user.created_at, { format: dateFormat }),
      updated_at: formatDate(user.updated_at, { format: dateFormat })
    };
    
    if (privacy === 'none') {
      userData.username = user.username;
      userData.last_login = formatDate(user.last_login, { format: dateFormat });
      userData.is_active = user.is_active;
      userData.is_verified = user.is_verified;
    }
    
    return userData;
  });
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export users to Excel format (CSV with advanced formatting)
 */
export function exportUsersToExcel(
  users: User[],
  options: Partial<ExportOptions> = {}
): string {
  const { 
    includeHeaders = true, 
    dateFormat = 'local',
    privacy = 'none'
  } = options;
  
  const headers = [
    'ID',
    'Email',
    'First Name',
    'Last Name',
    'Display Name',
    'Status',
    'Created At',
    'Updated At'
  ];
  
  if (privacy === 'none') {
    headers.push('Username', 'Last Login', 'Is Active', 'Is Verified');
  }
  
  const rows = includeHeaders ? [headers.join(',')] : [];
  
  users.forEach(user => {
    const row = [
      user.id.toString(),
      `"${user.email || ''}"`,
      `"${user.first_name || ''}"`,
      `"${user.last_name || ''}"`,
      `"${user.display_name || ''}"`,
      user.status,
      formatDate(user.created_at, { format: dateFormat }),
      formatDate(user.updated_at, { format: dateFormat })
    ];
    
    if (privacy === 'none') {
      row.push(
        `"${user.username || ''}"`,
        formatDate(user.last_login, { format: dateFormat }),
        user.is_active ? 'Yes' : 'No',
        user.is_verified ? 'Yes' : 'No'
      );
    }
    
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// Add lowercase alias for compatibility
export const exportRolesToCsv = exportRolesToCSV;

export default {
  exportUsersToCSV,
  exportUsersToJSON,
  exportUsersToExcel,
  exportRolesToCSV,
  exportRolesToCsv,
  exportPermissionsToCSV,
  exportAuditLogsToCSV,
  exportAccessRequestsToCSV,
  exportToJSON,
  exportPermissionMatrixToJSON,
  exportToExcelCSV,
  exportToXML,
  downloadFile,
  getMimeType,
  generateFilename,
  exportBatchData,
  parseCSV,
  importUsersFromCSV,
  importFromJSON,
  exportRBACData,
  importRBACData
};