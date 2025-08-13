// Advanced Permission Management Utilities - Enterprise-grade permission handling
// Maps to: backend role_service.py permission functions, rbac_service.py

import type { 
  Permission, 
  PermissionCreate, 
  PermissionUpdate,
  PermissionWithRoles,
  EffectivePermission,
  PermissionCheck,
  PermissionMatrix,
  PermissionStats,
  PermissionFilters,
  PermissionBulkAction,
  PermissionDiff,
  PermissionConflict,
  PermissionUsage,
  PermissionTemplate,
  PermissionValidation,
  PermissionAuditTrail,
  PermissionGroup,
  PermissionScope,
  User,
  Role,
  Resource
} from '../types';

import { rbacApiService } from '../services/rbac-api.service';
import { 
  validatePermissionAction, 
  validatePermissionResource, 
  parseCondition,
  evaluateCondition,
  buildConditionString,
  logRbacAction,
  generateCorrelationId
} from './rbac.utils';

// ============================================================================
// PERMISSION CRUD OPERATIONS
// ============================================================================

/**
 * Create a new permission with validation
 * Maps to backend: role_service.create_permission()
 */
export async function createPermission(
  permissionData: PermissionCreate,
  performedBy: string
): Promise<Permission> {
  // Validate input
  const actionValidation = validatePermissionAction(permissionData.action);
  const resourceValidation = validatePermissionResource(permissionData.resource);
  
  if (!actionValidation.valid || !resourceValidation.valid) {
    throw new Error([...actionValidation.errors, ...resourceValidation.errors].join(', '));
  }
  
  // Validate conditions if provided
  if (permissionData.conditions) {
    const parsedConditions = parseCondition(permissionData.conditions);
    if (!parsedConditions) {
      throw new Error('Invalid condition format');
    }
  }
  
  try {
    const correlationId = generateCorrelationId();
    
    const response = await rbacApiService.post<Permission>('/rbac/permissions', {
      ...permissionData,
      correlation_id: correlationId
    });
    
    // Log action
    await logRbacAction('create_permission', performedBy, {
      resource_type: 'permission',
      resource_id: response.data.id.toString(),
      status: 'success',
      note: `Created permission ${permissionData.action}:${permissionData.resource}`,
      after_state: response.data,
      correlation_id: correlationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to create permission:', error);
    throw error;
  }
}

/**
 * Update an existing permission
 * Maps to backend: role_service.update_permission()
 */
export async function updatePermission(
  permissionId: number,
  updates: PermissionUpdate,
  performedBy: string
): Promise<Permission> {
  // Validate updates
  if (updates.action) {
    const validation = validatePermissionAction(updates.action);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
  }
  
  if (updates.resource) {
    const validation = validatePermissionResource(updates.resource);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
  }
  
  if (updates.conditions) {
    const parsedConditions = parseCondition(updates.conditions);
    if (!parsedConditions) {
      throw new Error('Invalid condition format');
    }
  }
  
  try {
    // Get current state for audit
    const currentPermission = await getPermissionById(permissionId);
    const correlationId = generateCorrelationId();
    
    const response = await rbacApiService.put<Permission>(`/rbac/permissions/${permissionId}`, {
      ...updates,
      correlation_id: correlationId
    });
    
    // Log action
    await logRbacAction('update_permission', performedBy, {
      resource_type: 'permission',
      resource_id: permissionId.toString(),
      status: 'success',
      note: `Updated permission ${permissionId}`,
      before_state: currentPermission,
      after_state: response.data,
      correlation_id: correlationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to update permission:', error);
    throw error;
  }
}

/**
 * Delete a permission
 * Maps to backend: role_service.delete_permission()
 */
export async function deletePermission(
  permissionId: number,
  performedBy: string
): Promise<boolean> {
  try {
    // Get current state for audit
    const currentPermission = await getPermissionById(permissionId);
    const correlationId = generateCorrelationId();
    
    await rbacApiService.delete(`/rbac/permissions/${permissionId}`, {
      headers: { 'X-Correlation-ID': correlationId }
    });
    
    // Log action
    await logRbacAction('delete_permission', performedBy, {
      resource_type: 'permission',
      resource_id: permissionId.toString(),
      status: 'success',
      note: `Deleted permission ${currentPermission?.action}:${currentPermission?.resource}`,
      before_state: currentPermission,
      correlation_id: correlationId
    });
    
    return true;
  } catch (error) {
    console.error('Failed to delete permission:', error);
    throw error;
  }
}

/**
 * Get permission by ID with roles
 */
export async function getPermissionById(permissionId: number): Promise<PermissionWithRoles | null> {
  try {
    const response = await rbacApiService.get<PermissionWithRoles>(`/rbac/permissions/${permissionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get permission:', error);
    return null;
  }
}

/**
 * List permissions with advanced filtering and pagination
 * Maps to backend: role_service.list_permissions()
 */
export async function listPermissions(
  filters: PermissionFilters = {},
  page: number = 1,
  pageSize: number = 50
): Promise<{ permissions: PermissionWithRoles[]; total: number; hasMore: boolean }> {
  try {
    const queryParams = rbacApiService.buildQueryString({
      ...filters,
      page,
      page_size: pageSize
    });
    
    const response = await rbacApiService.get<{
      items: PermissionWithRoles[];
      total: number;
      page: number;
      page_size: number;
      has_next_page: boolean;
    }>(`/rbac/permissions${queryParams}`);
    
    return {
      permissions: response.data.items,
      total: response.data.total,
      hasMore: response.data.has_next_page
    };
  } catch (error) {
    console.error('Failed to list permissions:', error);
    return { permissions: [], total: 0, hasMore: false };
  }
}

// ============================================================================
// PERMISSION-ROLE RELATIONSHIP MANAGEMENT
// ============================================================================

/**
 * Assign permission to role
 * Maps to backend: role_service.assign_permission_to_role()
 */
export async function assignPermissionToRole(
  permissionId: number,
  roleId: number,
  performedBy: string
): Promise<boolean> {
  try {
    const correlationId = generateCorrelationId();
    
    await rbacApiService.post('/rbac/permissions/assign-to-role', {
      permission_id: permissionId,
      role_id: roleId,
      correlation_id: correlationId
    });
    
    // Log action
    await logRbacAction('assign_permission_to_role', performedBy, {
      resource_type: 'permission',
      resource_id: permissionId.toString(),
      role: roleId.toString(),
      status: 'success',
      note: `Assigned permission ${permissionId} to role ${roleId}`,
      correlation_id: correlationId
    });
    
    return true;
  } catch (error) {
    console.error('Failed to assign permission to role:', error);
    throw error;
  }
}

/**
 * Remove permission from role
 * Maps to backend: role_service.remove_permission_from_role()
 */
export async function removePermissionFromRole(
  permissionId: number,
  roleId: number,
  performedBy: string
): Promise<boolean> {
  try {
    const correlationId = generateCorrelationId();
    
    await rbacApiService.post('/rbac/permissions/remove-from-role', {
      permission_id: permissionId,
      role_id: roleId,
      correlation_id: correlationId
    });
    
    // Log action
    await logRbacAction('remove_permission_from_role', performedBy, {
      resource_type: 'permission',
      resource_id: permissionId.toString(),
      role: roleId.toString(),
      status: 'success',
      note: `Removed permission ${permissionId} from role ${roleId}`,
      correlation_id: correlationId
    });
    
    return true;
  } catch (error) {
    console.error('Failed to remove permission from role:', error);
    throw error;
  }
}

/**
 * Bulk assign permissions to roles
 * Maps to backend: role_service.bulk_assign_permission_to_roles()
 */
export async function bulkAssignPermissionsToRoles(
  permissionIds: number[],
  roleIds: number[],
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    const correlationId = generateCorrelationId();
    
    const response = await rbacApiService.post('/rbac/permissions/bulk-assign-to-roles', {
      permission_ids: permissionIds,
      role_ids: roleIds,
      performed_by: performedBy,
      correlation_id: correlationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Bulk permission assignment failed:', error);
    return {
      success: 0,
      failed: permissionIds.length * roleIds.length,
      errors: ['Bulk permission assignment failed']
    };
  }
}

/**
 * Bulk remove permissions from roles
 * Maps to backend: role_service.bulk_remove_permission_from_roles()
 */
export async function bulkRemovePermissionsFromRoles(
  permissionIds: number[],
  roleIds: number[],
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    const correlationId = generateCorrelationId();
    
    const response = await rbacApiService.post('/rbac/permissions/bulk-remove-from-roles', {
      permission_ids: permissionIds,
      role_ids: roleIds,
      performed_by: performedBy,
      correlation_id: correlationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Bulk permission removal failed:', error);
    return {
      success: 0,
      failed: permissionIds.length * roleIds.length,
      errors: ['Bulk permission removal failed']
    };
  }
}

// ============================================================================
// PERMISSION ANALYSIS AND VALIDATION
// ============================================================================

/**
 * Validate permission with comprehensive checks
 */
export async function validatePermission(permission: Permission): Promise<PermissionValidation> {
  const validation: PermissionValidation = {
    permission,
    is_valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };
  
  // Validate action format
  const actionValidation = validatePermissionAction(permission.action);
  if (!actionValidation.valid) {
    validation.is_valid = false;
    validation.errors.push(...actionValidation.errors);
  }
  
  // Validate resource format
  const resourceValidation = validatePermissionResource(permission.resource);
  if (!resourceValidation.valid) {
    validation.is_valid = false;
    validation.errors.push(...resourceValidation.errors);
  }
  
  // Validate conditions if present
  if (permission.conditions) {
    const conditionValidation = await validatePermissionConditions(permission.conditions);
    validation.condition_validation = conditionValidation;
    
    if (!conditionValidation.is_valid) {
      validation.is_valid = false;
      validation.errors.push(...conditionValidation.syntax_errors);
      validation.errors.push(...conditionValidation.semantic_errors);
    }
  }
  
  // Check for conflicts with existing permissions
  try {
    const conflicts = await checkPermissionConflicts(permission);
    if (conflicts.length > 0) {
      validation.warnings.push(`Found ${conflicts.length} potential conflicts`);
      validation.suggestions.push('Review conflicting permissions and consider consolidation');
    }
  } catch (error) {
    validation.warnings.push('Could not check for permission conflicts');
  }
  
  return validation;
}

/**
 * Validate permission conditions (ABAC)
 */
export async function validatePermissionConditions(
  conditionsStr: string
): Promise<{
  is_valid: boolean;
  syntax_errors: string[];
  semantic_errors: string[];
  test_results?: Array<{
    test_case: Record<string, any>;
    result: boolean;
    explanation: string;
  }>;
}> {
  const validation = {
    is_valid: true,
    syntax_errors: [] as string[],
    semantic_errors: [] as string[],
    test_results: [] as Array<{
      test_case: Record<string, any>;
      result: boolean;
      explanation: string;
    }>
  };
  
  try {
    // Parse JSON syntax
    const conditions = parseCondition(conditionsStr);
    if (!conditions) {
      validation.is_valid = false;
      validation.syntax_errors.push('Invalid JSON format');
      return validation;
    }
    
    // Semantic validation
    for (const [key, value] of Object.entries(conditions)) {
      if (typeof value === 'object' && value !== null && '$op' in value) {
        const { $op: op, value: operand } = value;
        
        // Validate operator
        const validOps = ['eq', 'ne', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'regex', 'user_attr'];
        if (!validOps.includes(op)) {
          validation.is_valid = false;
          validation.semantic_errors.push(`Invalid operator: ${op}`);
        }
        
        // Validate operand based on operator
        if (['in', 'not_in'].includes(op) && !Array.isArray(operand)) {
          validation.is_valid = false;
          validation.semantic_errors.push(`Operator ${op} requires array operand`);
        }
        
        if (['gt', 'gte', 'lt', 'lte'].includes(op) && typeof operand !== 'number') {
          validation.is_valid = false;
          validation.semantic_errors.push(`Operator ${op} requires numeric operand`);
        }
        
        if (op === 'regex') {
          try {
            new RegExp(operand);
          } catch {
            validation.is_valid = false;
            validation.semantic_errors.push(`Invalid regex pattern: ${operand}`);
          }
        }
      }
    }
    
    // Test with sample data
    const testCases = [
      { user_id: 1, department: 'IT', region: 'US' },
      { user_id: 2, department: 'Finance', region: 'EU' },
      { user_id: 3, department: 'HR', region: 'APAC' }
    ];
    
    testCases.forEach(testCase => {
      try {
        const result = evaluateCondition(conditions, testCase);
        validation.test_results!.push({
          test_case: testCase,
          result,
          explanation: result ? 'Condition matched' : 'Condition did not match'
        });
      } catch (error) {
        validation.test_results!.push({
          test_case: testCase,
          result: false,
          explanation: `Evaluation error: ${error}`
        });
      }
    });
    
  } catch (error) {
    validation.is_valid = false;
    validation.syntax_errors.push(`Validation error: ${error}`);
  }
  
  return validation;
}

/**
 * Check for permission conflicts
 */
export async function checkPermissionConflicts(permission: Permission): Promise<PermissionConflict[]> {
  try {
    const response = await rbacApiService.post<PermissionConflict[]>('/rbac/permissions/check-conflicts', {
      permission
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to check permission conflicts:', error);
    return [];
  }
}

/**
 * Get permission usage statistics
 */
export async function getPermissionUsage(permissionId: number): Promise<PermissionUsage | null> {
  try {
    const response = await rbacApiService.get<PermissionUsage>(`/rbac/permissions/${permissionId}/usage`);
    return response.data;
  } catch (error) {
    console.error('Failed to get permission usage:', error);
    return null;
  }
}

/**
 * Get permission statistics
 */
export async function getPermissionStats(): Promise<PermissionStats> {
  try {
    const response = await rbacApiService.get<PermissionStats>('/rbac/permissions/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to get permission stats:', error);
    return {
      total_permissions: 0,
      permissions_with_conditions: 0,
      permissions_by_action: {},
      permissions_by_resource: {},
      most_assigned_permissions: [],
      unused_permissions: []
    };
  }
}

// ============================================================================
// PERMISSION COMPARISON AND DIFF
// ============================================================================

/**
 * Compare permissions between two states
 * Maps to backend: role_service.get_permission_diff()
 */
export async function comparePermissions(
  beforeState: Permission[],
  afterState: Permission[]
): Promise<PermissionDiff> {
  const beforeSet = new Set(beforeState.map(p => `${p.action}:${p.resource}`));
  const afterSet = new Set(afterState.map(p => `${p.action}:${p.resource}`));
  
  const added = afterState
    .filter(p => !beforeSet.has(`${p.action}:${p.resource}`))
    .map(p => ({ action: p.action, resource: p.resource, change: 'added' as const }));
  
  const removed = beforeState
    .filter(p => !afterSet.has(`${p.action}:${p.resource}`))
    .map(p => ({ action: p.action, resource: p.resource, change: 'removed' as const }));
  
  const unchanged = afterState
    .filter(p => beforeSet.has(`${p.action}:${p.resource}`))
    .map(p => ({ action: p.action, resource: p.resource, change: 'unchanged' as const }));
  
  return { added, removed, unchanged };
}

/**
 * Get permission diff for user role changes
 */
export async function getUserPermissionDiff(
  userId: number,
  beforeRoleIds: number[],
  afterRoleIds: number[]
): Promise<PermissionDiff> {
  try {
    const response = await rbacApiService.post<PermissionDiff>('/rbac/permissions/user-diff', {
      user_id: userId,
      before_role_ids: beforeRoleIds,
      after_role_ids: afterRoleIds
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get user permission diff:', error);
    return { added: [], removed: [], unchanged: [] };
  }
}

// ============================================================================
// PERMISSION TEMPLATES AND GROUPS
// ============================================================================

/**
 * Get permission templates
 */
export async function getPermissionTemplates(): Promise<PermissionTemplate[]> {
  try {
    const response = await rbacApiService.get<PermissionTemplate[]>('/rbac/permissions/templates');
    return response.data;
  } catch (error) {
    console.error('Failed to get permission templates:', error);
    return [];
  }
}

/**
 * Apply permission template to role
 */
export async function applyPermissionTemplate(
  templateId: number,
  roleId: number,
  performedBy: string
): Promise<{ applied: number; skipped: number; errors: string[] }> {
  try {
    const correlationId = generateCorrelationId();
    
    const response = await rbacApiService.post('/rbac/permissions/apply-template', {
      template_id: templateId,
      role_id: roleId,
      performed_by: performedBy,
      correlation_id: correlationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to apply permission template:', error);
    return { applied: 0, skipped: 0, errors: ['Failed to apply template'] };
  }
}

/**
 * Group permissions by category
 */
export function groupPermissionsByCategory(permissions: Permission[]): PermissionGroup[] {
  const groups = new Map<string, Permission[]>();
  
  permissions.forEach(permission => {
    const category = permission.action.split('.')[0]; // Extract module from action
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(permission);
  });
  
  return Array.from(groups.entries()).map(([category, perms]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    description: `${category} related permissions`,
    permissions: perms,
    color: getCategoryColor(category),
    icon: getCategoryIcon(category)
  }));
}

/**
 * Get color for permission category
 */
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'scan': '#3b82f6',
    'dashboard': '#10b981',
    'lineage': '#8b5cf6',
    'compliance': '#f59e0b',
    'datasource': '#ef4444',
    'analytics': '#06b6d4',
    'rbac': '#dc2626',
    'audit': '#6b7280',
    'catalog': '#84cc16',
    'classification': '#ec4899'
  };
  
  return colorMap[category.toLowerCase()] || '#6b7280';
}

/**
 * Get icon for permission category
 */
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'scan': 'search',
    'dashboard': 'chart-bar',
    'lineage': 'git-branch',
    'compliance': 'shield-check',
    'datasource': 'database',
    'analytics': 'chart-line',
    'rbac': 'users',
    'audit': 'clipboard-list',
    'catalog': 'folder',
    'classification': 'tag'
  };
  
  return iconMap[category.toLowerCase()] || 'cog';
}

// ============================================================================
// PERMISSION AUDIT TRAIL
// ============================================================================

/**
 * Get permission audit trail
 */
export async function getPermissionAuditTrail(permissionId: number): Promise<PermissionAuditTrail> {
  try {
    const response = await rbacApiService.get<PermissionAuditTrail>(`/rbac/permissions/${permissionId}/audit-trail`);
    return response.data;
  } catch (error) {
    console.error('Failed to get permission audit trail:', error);
    return {
      permission_id: permissionId,
      changes: []
    };
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export permissions to CSV
 */
export function exportPermissionsToCsv(permissions: PermissionWithRoles[]): string {
  const headers = ['ID', 'Action', 'Resource', 'Conditions', 'Roles', 'Created'];
  const rows = [headers.join(',')];
  
  permissions.forEach(permission => {
    const roles = permission.roles.map(r => r.name).join(';');
    const conditions = permission.conditions || '';
    const row = [
      permission.id.toString(),
      permission.action,
      permission.resource,
      `"${conditions.replace(/"/g, '""')}"`,
      `"${roles}"`,
      new Date().toISOString()
    ];
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

/**
 * Export permission matrix to Excel format (CSV with advanced formatting)
 */
export function exportPermissionMatrixToExcel(matrix: PermissionMatrix): string {
  const headers = ['User Email', 'User Name', ...matrix.permissions.map(p => `${p.action}:${p.resource}`)];
  const rows = [headers.join(',')];
  
  matrix.users.forEach(user => {
    const row = [
      user.email || '',
      user.display_name || user.first_name + ' ' + user.last_name || '',
      ...matrix.permissions.map(permission => {
        const entry = matrix.matrix.find(m => 
          m.user_id === user.id && m.permission_id === permission.id
        );
        return entry?.has_permission ? 'YES' : 'NO';
      })
    ];
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

export default {
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionById,
  listPermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  bulkAssignPermissionsToRoles,
  bulkRemovePermissionsFromRoles,
  validatePermission,
  validatePermissionConditions,
  checkPermissionConflicts,
  getPermissionUsage,
  getPermissionStats,
  comparePermissions,
  getUserPermissionDiff,
  getPermissionTemplates,
  applyPermissionTemplate,
  groupPermissionsByCategory,
  getPermissionAuditTrail,
  exportPermissionsToCsv,
  exportPermissionMatrixToExcel
};