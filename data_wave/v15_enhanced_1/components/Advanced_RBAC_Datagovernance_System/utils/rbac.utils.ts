// Advanced RBAC Utilities - Production-grade utilities mapped to backend implementations
// Maps to: backend auth_service.py, rbac_service.py, role_service.py, resource_service.py

import type { 
  User, 
  Role, 
  Permission, 
  Resource, 
  Group, 
  EffectivePermission, 
  PermissionCheck,
  PermissionMatrix,
  RBACState,
  ResourceTree
} from '../types';

import { rbacApiService } from '../services/rbac-api.service';

// ============================================================================
// PERMISSION CHECKING UTILITIES
// ============================================================================

/**
 * Check if a user has a specific permission with advanced condition evaluation
 * Maps to backend: rbac_service.get_user_effective_permissions_rbac()
 */
export async function hasPermission(
  userId: number,
  action: string,
  resource: string,
  conditions?: Record<string, any>
): Promise<PermissionCheck> {
  try {
    const response = await rbacApiService.post<PermissionCheck>('/rbac/permissions/check', {
      user_id: userId,
      action,
      resource,
      conditions
    });
    
    return response.data;
  } catch (error) {
    console.error('Permission check failed:', error);
    return {
      user_id: userId,
      action,
      resource,
      conditions,
      allowed: false,
      reason: 'Permission check failed'
    };
  }
}

/**
 * Batch permission check for multiple permissions
 * Optimized for performance with single API call
 */
export async function hasPermissions(
  userId: number,
  permissions: Array<{ action: string; resource: string; conditions?: Record<string, any> }>
): Promise<PermissionCheck[]> {
  try {
    const response = await rbacApiService.post<PermissionCheck[]>('/rbac/permissions/check-batch', {
      user_id: userId,
      permissions
    });
    
    return response.data;
  } catch (error) {
    console.error('Batch permission check failed:', error);
    return permissions.map(perm => ({
      user_id: userId,
      action: perm.action,
      resource: perm.resource,
      conditions: perm.conditions,
      allowed: false,
      reason: 'Batch permission check failed'
    }));
  }
}

/**
 * Get all effective permissions for a user with inheritance chain
 * Maps to backend: rbac_service.get_user_effective_permissions_rbac()
 */
export async function getUserEffectivePermissions(userId: number): Promise<EffectivePermission[]> {
  try {
    const response = await rbacApiService.get<EffectivePermission[]>(`/rbac/users/${userId}/effective-permissions`);
    return response.data;
  } catch (error) {
    console.error('Failed to get effective permissions:', error);
    return [];
  }
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: number, roleNames: string[]): Promise<boolean> {
  try {
    const response = await rbacApiService.post<{ has_role: boolean }>('/rbac/users/check-roles', {
      user_id: userId,
      role_names: roleNames
    });
    
    return response.data.has_role;
  } catch (error) {
    console.error('Role check failed:', error);
    return false;
  }
}

/**
 * Check if user has all of the specified roles
 */
export async function hasAllRoles(userId: number, roleNames: string[]): Promise<boolean> {
  try {
    const response = await rbacApiService.post<{ has_all_roles: boolean }>('/rbac/users/check-all-roles', {
      user_id: userId,
      role_names: roleNames,
      require_all: true
    });
    
    return response.data.has_all_roles;
  } catch (error) {
    console.error('All roles check failed:', error);
    return false;
  }
}

// ============================================================================
// RESOURCE HIERARCHY UTILITIES
// ============================================================================

/**
 * Build resource hierarchy tree from flat resource list
 * Maps to backend: resource_service.get_resource_ancestors/descendants
 */
export function buildResourceTree(resources: Resource[]): ResourceTree[] {
  const resourceMap = new Map<number, Resource>();
  const childrenMap = new Map<number, Resource[]>();
  
  // Build maps for efficient lookup
  resources.forEach(resource => {
    resourceMap.set(resource.id, resource);
    if (!childrenMap.has(resource.parent_id || 0)) {
      childrenMap.set(resource.parent_id || 0, []);
    }
    childrenMap.get(resource.parent_id || 0)!.push(resource);
  });
  
  // Build tree recursively
  function buildNode(resource: Resource, level: number = 0): ResourceTree {
    const children = childrenMap.get(resource.id) || [];
    return {
      resource,
      children: children.map(child => buildNode(child, level + 1)),
      level
    };
  }
  
  // Get root resources (no parent)
  const rootResources = resources.filter(r => !r.parent_id);
  return rootResources.map(root => buildNode(root));
}

/**
 * Get all ancestor resources for a given resource
 */
export async function getResourceAncestors(resourceId: number): Promise<Resource[]> {
  try {
    const response = await rbacApiService.get<Resource[]>(`/rbac/resources/${resourceId}/ancestors`);
    return response.data;
  } catch (error) {
    console.error('Failed to get resource ancestors:', error);
    return [];
  }
}

/**
 * Get all descendant resources for a given resource
 */
export async function getResourceDescendants(resourceId: number): Promise<Resource[]> {
  try {
    const response = await rbacApiService.get<Resource[]>(`/rbac/resources/${resourceId}/descendants`);
    return response.data;
  } catch (error) {
    console.error('Failed to get resource descendants:', error);
    return [];
  }
}

/**
 * Check if user has permission on resource or any of its ancestors (inheritance)
 */
export async function hasPermissionWithInheritance(
  userId: number,
  action: string,
  resourceId: number,
  conditions?: Record<string, any>
): Promise<PermissionCheck> {
  try {
    const response = await rbacApiService.post<PermissionCheck>('/rbac/permissions/check-with-inheritance', {
      user_id: userId,
      action,
      resource_id: resourceId,
      conditions
    });
    
    return response.data;
  } catch (error) {
    console.error('Permission check with inheritance failed:', error);
    return {
      user_id: userId,
      action,
      resource: resourceId.toString(),
      conditions,
      allowed: false,
      reason: 'Permission check with inheritance failed'
    };
  }
}

// ============================================================================
// ROLE HIERARCHY UTILITIES
// ============================================================================

/**
 * Get effective permissions for a role including inherited permissions
 * Maps to backend: role_service.get_effective_permissions_for_role()
 */
export async function getRoleEffectivePermissions(roleId: number): Promise<Permission[]> {
  try {
    const response = await rbacApiService.get<Permission[]>(`/rbac/roles/${roleId}/effective-permissions`);
    return response.data;
  } catch (error) {
    console.error('Failed to get role effective permissions:', error);
    return [];
  }
}

/**
 * Check if role inheritance would create a cycle
 * Maps to backend: role_service.can_assign_parent_role()
 */
export async function canAssignParentRole(childRoleId: number, parentRoleId: number): Promise<boolean> {
  try {
    const response = await rbacApiService.post<{ can_assign: boolean }>('/rbac/roles/check-inheritance', {
      child_role_id: childRoleId,
      parent_role_id: parentRoleId
    });
    
    return response.data.can_assign;
  } catch (error) {
    console.error('Role inheritance check failed:', error);
    return false;
  }
}

/**
 * Get role inheritance chain for a role
 */
export async function getRoleInheritanceChain(roleId: number): Promise<Role[]> {
  try {
    const response = await rbacApiService.get<Role[]>(`/rbac/roles/${roleId}/inheritance-chain`);
    return response.data;
  } catch (error) {
    console.error('Failed to get role inheritance chain:', error);
    return [];
  }
}

// ============================================================================
// PERMISSION MATRIX UTILITIES
// ============================================================================

/**
 * Generate permission matrix for users and permissions
 * Maps to backend permission evaluation logic
 */
export async function generatePermissionMatrix(
  userIds: number[],
  permissionIds: number[]
): Promise<PermissionMatrix> {
  try {
    const response = await rbacApiService.post<PermissionMatrix>('/rbac/matrix/generate', {
      user_ids: userIds,
      permission_ids: permissionIds
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to generate permission matrix:', error);
    return {
      users: [],
      permissions: [],
      matrix: []
    };
  }
}

/**
 * Export permission matrix to CSV format
 */
export function exportPermissionMatrixToCsv(matrix: PermissionMatrix): string {
  const headers = ['User', ...matrix.permissions.map(p => `${p.action}:${p.resource}`)];
  const rows = [headers.join(',')];
  
  matrix.users.forEach(user => {
    const row = [user.email || user.display_name || `User ${user.id}`];
    
    matrix.permissions.forEach(permission => {
      const entry = matrix.matrix.find(m => 
        m.user_id === user.id && m.permission_id === permission.id
      );
      row.push(entry?.has_permission ? 'Yes' : 'No');
    });
    
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// ============================================================================
// CONDITION EVALUATION UTILITIES
// ============================================================================

/**
 * Parse and validate ABAC condition string
 */
export function parseCondition(conditionStr: string): Record<string, any> | null {
  try {
    return JSON.parse(conditionStr);
  } catch (error) {
    console.error('Failed to parse condition:', error);
    return null;
  }
}

/**
 * Evaluate condition against context (client-side evaluation for UI)
 * Note: Server-side evaluation is always authoritative
 */
export function evaluateCondition(
  condition: Record<string, any>,
  context: Record<string, any>
): boolean {
  try {
    // Basic evaluation - extend as needed
    for (const [key, value] of Object.entries(condition)) {
      const contextValue = context[key];
      
      if (typeof value === 'object' && value !== null && '$op' in value) {
        // Custom operator evaluation
        const { $op: op, value: operand } = value;
        
        switch (op) {
          case 'eq':
            if (contextValue !== operand) return false;
            break;
          case 'ne':
            if (contextValue === operand) return false;
            break;
          case 'in':
            if (!Array.isArray(operand) || !operand.includes(contextValue)) return false;
            break;
          case 'not_in':
            if (Array.isArray(operand) && operand.includes(contextValue)) return false;
            break;
          case 'gt':
            if (typeof contextValue !== 'number' || contextValue <= operand) return false;
            break;
          case 'gte':
            if (typeof contextValue !== 'number' || contextValue < operand) return false;
            break;
          case 'lt':
            if (typeof contextValue !== 'number' || contextValue >= operand) return false;
            break;
          case 'lte':
            if (typeof contextValue !== 'number' || contextValue > operand) return false;
            break;
          case 'regex':
            if (typeof contextValue !== 'string' || !new RegExp(operand).test(contextValue)) return false;
            break;
          default:
            return false;
        }
      } else if (Array.isArray(value)) {
        // Array contains check
        if (!value.includes(contextValue)) return false;
      } else {
        // Direct equality check
        if (contextValue !== value) return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Condition evaluation failed:', error);
    return false;
  }
}

/**
 * Build condition string from UI components
 */
export function buildConditionString(conditions: Array<{
  field: string;
  operator: string;
  value: any;
}>): string {
  const conditionObj: Record<string, any> = {};
  
  conditions.forEach(({ field, operator, value }) => {
    if (operator === 'eq') {
      conditionObj[field] = value;
    } else {
      conditionObj[field] = { $op: operator, value };
    }
  });
  
  return JSON.stringify(conditionObj);
}

// ============================================================================
// AUDIT AND LOGGING UTILITIES
// ============================================================================

/**
 * Log RBAC action for audit trail
 * Maps to backend: role_service.log_rbac_action()
 */
export async function logRbacAction(
  action: string,
  performedBy: string,
  details: {
    target_user?: string;
    resource_type?: string;
    resource_id?: string;
    role?: string;
    status?: string;
    note?: string;
    before_state?: any;
    after_state?: any;
    correlation_id?: string;
  }
): Promise<void> {
  try {
    await rbacApiService.post('/rbac/audit/log', {
      action,
      performed_by: performedBy,
      ...details,
      before_state: details.before_state ? JSON.stringify(details.before_state) : undefined,
      after_state: details.after_state ? JSON.stringify(details.after_state) : undefined
    });
  } catch (error) {
    console.error('Failed to log RBAC action:', error);
  }
}

/**
 * Generate correlation ID for tracking related actions
 */
export function generateCorrelationId(): string {
  return `rbac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// BULK OPERATIONS UTILITIES
// ============================================================================

/**
 * Bulk assign role to multiple users
 * Maps to backend: role_service.bulk_assign_role_to_users()
 */
export async function bulkAssignRoleToUsers(
  userIds: number[],
  roleId: number,
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    const correlationId = generateCorrelationId();
    
    const response = await rbacApiService.post('/rbac/roles/bulk-assign-users', {
      user_ids: userIds,
      role_id: roleId,
      performed_by: performedBy,
      correlation_id: correlationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Bulk role assignment failed:', error);
    return {
      success: 0,
      failed: userIds.length,
      errors: ['Bulk role assignment failed']
    };
  }
}

/**
 * Bulk remove role from multiple users
 * Maps to backend: role_service.bulk_remove_role_from_users()
 */
export async function bulkRemoveRoleFromUsers(
  userIds: number[],
  roleId: number,
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    const correlationId = generateCorrelationId();
    
    const response = await rbacApiService.post('/rbac/roles/bulk-remove-users', {
      user_ids: userIds,
      role_id: roleId,
      performed_by: performedBy,
      correlation_id: correlationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Bulk role removal failed:', error);
    return {
      success: 0,
      failed: userIds.length,
      errors: ['Bulk role removal failed']
    };
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate permission action format
 */
export function validatePermissionAction(action: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!action || action.trim().length === 0) {
    errors.push('Action cannot be empty');
  }
  
  if (action.length > 100) {
    errors.push('Action cannot exceed 100 characters');
  }
  
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/.test(action)) {
    errors.push('Action must follow format: module.action (e.g., scan.view, data.edit)');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate permission resource format
 */
export function validatePermissionResource(resource: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!resource || resource.trim().length === 0) {
    errors.push('Resource cannot be empty');
  }
  
  if (resource.length > 200) {
    errors.push('Resource cannot exceed 200 characters');
  }
  
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*(\*)?$/.test(resource)) {
    errors.push('Resource must follow format: module.resource (e.g., datasource.mysql, scan.*)');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate role name format
 */
export function validateRoleName(name: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Role name cannot be empty');
  }
  
  if (name.length < 3) {
    errors.push('Role name must be at least 3 characters');
  }
  
  if (name.length > 50) {
    errors.push('Role name cannot exceed 50 characters');
  }
  
  if (!/^[a-zA-Z][a-zA-Z0-9_\-\s]*$/.test(name)) {
    errors.push('Role name can only contain letters, numbers, underscores, hyphens, and spaces');
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// CACHING UTILITIES
// ============================================================================

const permissionCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Cache permission check result with TTL
 */
export function cachePermissionResult(
  key: string,
  data: any,
  ttlSeconds: number = 300
): void {
  permissionCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds * 1000
  });
}

/**
 * Get cached permission result if not expired
 */
export function getCachedPermissionResult(key: string): any | null {
  const cached = permissionCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    permissionCache.delete(key);
    return null;
  }
  
  return cached.data;
}

/**
 * Generate cache key for permission check
 */
export function generatePermissionCacheKey(
  userId: number,
  action: string,
  resource: string,
  conditions?: Record<string, any>
): string {
  const conditionsStr = conditions ? JSON.stringify(conditions) : '';
  return `perm_${userId}_${action}_${resource}_${btoa(conditionsStr)}`;
}

/**
 * Clear permission cache for user
 */
export function clearUserPermissionCache(userId: number): void {
  for (const [key] of permissionCache) {
    if (key.startsWith(`perm_${userId}_`)) {
      permissionCache.delete(key);
    }
  }
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Deep clone object (for state management)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
}

/**
 * Check if current user is system admin
 */
export function isSystemAdmin(user: User): boolean {
  return user.role === 'admin' || user.roles?.some(role => role.name === 'system_admin') || false;
}

/**
 * Check if current user can manage RBAC
 */
export function canManageRBAC(user: User): boolean {
  return isSystemAdmin(user) || user.roles?.some(role => 
    role.permissions?.some(perm => perm.action === 'rbac.manage')
  ) || false;
}

/**
 * Get user display name with fallback
 */
export function getUserDisplayName(user: User): string {
  return user.display_name || 
         (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '') ||
         user.email ||
         `User ${user.id}`;
}

/**
 * Get role color based on role type
 */
export function getRoleColor(roleName: string): string {
  const colorMap: Record<string, string> = {
    'admin': '#ef4444',
    'system_admin': '#dc2626',
    'data_steward': '#3b82f6',
    'analyst': '#10b981',
    'viewer': '#6b7280',
    'editor': '#f59e0b',
    'manager': '#8b5cf6'
  };
  
  return colorMap[roleName.toLowerCase()] || '#6b7280';
}

export default {
  hasPermission,
  hasPermissions,
  getUserEffectivePermissions,
  hasAnyRole,
  hasAllRoles,
  buildResourceTree,
  getResourceAncestors,
  getResourceDescendants,
  hasPermissionWithInheritance,
  getRoleEffectivePermissions,
  canAssignParentRole,
  getRoleInheritanceChain,
  generatePermissionMatrix,
  exportPermissionMatrixToCsv,
  parseCondition,
  evaluateCondition,
  buildConditionString,
  logRbacAction,
  generateCorrelationId,
  bulkAssignRoleToUsers,
  bulkRemoveRoleFromUsers,
  validatePermissionAction,
  validatePermissionResource,
  validateRoleName,
  cachePermissionResult,
  getCachedPermissionResult,
  generatePermissionCacheKey,
  clearUserPermissionCache,
  deepClone,
  debounce,
  formatErrorMessage,
  isSystemAdmin,
  canManageRBAC,
  getUserDisplayName,
  getRoleColor
};