// Role Service - Maps to backend role_service.py
// Provides comprehensive role management with inheritance, bulk operations, and enterprise features

import { rbacApiService, ApiResponse, PaginatedResponse } from './rbac-api.service';
import { RBAC_ENDPOINTS } from '../constants/api.constants';
import type {
  Role,
  RoleCreate,
  RoleUpdate,
  RoleWithUsers,
  RoleWithPermissions,
  RoleInheritance,
  RoleAssignment,
  RoleHierarchy,
  RoleEffectivePermissions,
  RoleAnalytics,
  BulkRoleAssignment,
  BulkRolePermission,
  RoleTemplate,
  RoleImportExport
} from '../types/role.types';
import type { User } from '../types/user.types';
import type { Permission } from '../types/permission.types';
import type { Resource } from '../types/resource.types';

export interface RoleFilters {
  search?: string;
  isBuiltIn?: boolean;
  hasPermissions?: boolean;
  isActive?: boolean;
  hasUsers?: boolean;
  parentRoleId?: number;
  createdBy?: number;
  createdAfter?: string;
  createdBefore?: string;
  tags?: string[];
}

export interface RolePagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RolePermissionDiff {
  added: Permission[];
  removed: Permission[];
  unchanged: Permission[];
  sourceType: 'direct' | 'inherited' | 'group';
  source: string;
}

export class RoleService {
  // === Core CRUD Operations ===
  
  /**
   * Get all roles with advanced filtering and pagination
   */
  async getRoles(
    filters: RoleFilters = {},
    pagination: RolePagination = {}
  ): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const params = new URLSearchParams();
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    // Apply pagination
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `${RBAC_ENDPOINTS.ROLES}?${queryString}` : RBAC_ENDPOINTS.ROLES;
    
    return rbacApiService.get<PaginatedResponse<Role>>(url);
  }

  /**
   * Get role by ID with optional includes
   */
  async getRole(
    roleId: number,
    includes: {
      users?: boolean;
      permissions?: boolean;
      parent?: boolean;
      children?: boolean;
      analytics?: boolean;
    } = {}
  ): Promise<ApiResponse<Role>> {
    const params = new URLSearchParams();
    Object.entries(includes).forEach(([key, value]) => {
      if (value) params.append(`include_${key}`, 'true');
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.ROLE(roleId)}?${queryString}` 
      : RBAC_ENDPOINTS.ROLE(roleId);
    
    return rbacApiService.get<Role>(url);
  }

  /**
   * Create new role with validation
   */
  async createRole(roleData: RoleCreate): Promise<ApiResponse<Role>> {
    return rbacApiService.post<Role>(RBAC_ENDPOINTS.ROLES, roleData);
  }

  /**
   * Update existing role
   */
  async updateRole(roleId: number, updates: RoleUpdate): Promise<ApiResponse<Role>> {
    return rbacApiService.put<Role>(RBAC_ENDPOINTS.ROLE(roleId), updates);
  }

  /**
   * Delete role with cascade options
   */
  async deleteRole(
    roleId: number, 
    options: {
      cascade?: boolean;
      transferUsersToRole?: number;
      forceDelete?: boolean;
    } = {}
  ): Promise<ApiResponse<void>> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.ROLE(roleId)}?${queryString}`
      : RBAC_ENDPOINTS.ROLE(roleId);
    
    return rbacApiService.delete<void>(url);
  }

  // === Role Hierarchy Management ===

  /**
   * Get role hierarchy tree
   */
  async getRoleHierarchy(rootRoleId?: number): Promise<ApiResponse<RoleHierarchy[]>> {
    const params = rootRoleId ? `?root_role_id=${rootRoleId}` : '';
    return rbacApiService.get<RoleHierarchy[]>(`${RBAC_ENDPOINTS.ROLES}/hierarchy${params}`);
  }

  /**
   * Get role parents
   */
  async getRoleParents(roleId: number): Promise<ApiResponse<Role[]>> {
    return rbacApiService.get<Role[]>(RBAC_ENDPOINTS.ROLE_PARENTS(roleId));
  }

  /**
   * Get role children
   */
  async getRoleChildren(roleId: number): Promise<ApiResponse<Role[]>> {
    return rbacApiService.get<Role[]>(RBAC_ENDPOINTS.ROLE_CHILDREN(roleId));
  }

  /**
   * Add parent role (inheritance)
   */
  async addParentRole(childRoleId: number, parentRoleId: number): Promise<ApiResponse<RoleInheritance>> {
    return rbacApiService.post<RoleInheritance>(
      RBAC_ENDPOINTS.ROLE_PARENTS(childRoleId),
      { parent_role_id: parentRoleId }
    );
  }

  /**
   * Remove parent role
   */
  async removeParentRole(childRoleId: number, parentRoleId: number): Promise<ApiResponse<void>> {
    return rbacApiService.delete<void>(RBAC_ENDPOINTS.ROLE_REMOVE_PARENT(childRoleId, parentRoleId));
  }

  // === Permission Management ===

  /**
   * Get role's effective permissions (including inherited)
   */
  async getRoleEffectivePermissions(
    roleId: number,
    resourceType?: string,
    resourceId?: string
  ): Promise<ApiResponse<RoleEffectivePermissions>> {
    const params = new URLSearchParams();
    if (resourceType) params.append('resource_type', resourceType);
    if (resourceId) params.append('resource_id', resourceId);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.ROLE_EFFECTIVE_PERMISSIONS(roleId)}?${queryString}`
      : RBAC_ENDPOINTS.ROLE_EFFECTIVE_PERMISSIONS(roleId);
    
    return rbacApiService.get<RoleEffectivePermissions>(url);
  }

  /**
   * Get permissions for selected roles
   */
  async getSelectedRolesPermissions(roleIds: number[]): Promise<ApiResponse<RoleWithPermissions[]>> {
    return rbacApiService.post<RoleWithPermissions[]>(
      RBAC_ENDPOINTS.ROLES_SELECTED_PERMISSIONS,
      { role_ids: roleIds }
    );
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
    conditions?: Record<string, any>
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post<void>(
      `${RBAC_ENDPOINTS.ROLE(roleId)}/permissions`,
      { 
        permission_id: permissionId,
        conditions: conditions || null
      }
    );
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<ApiResponse<void>> {
    return rbacApiService.delete<void>(`${RBAC_ENDPOINTS.ROLE(roleId)}/permissions/${permissionId}`);
  }

  // === Bulk Operations ===

  /**
   * Bulk assign permissions to roles
   */
  async bulkAssignPermissions(assignments: BulkRolePermission[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(RBAC_ENDPOINTS.ROLES_BULK_ASSIGN_PERMISSIONS, { assignments });
  }

  /**
   * Bulk remove permissions from roles
   */
  async bulkRemovePermissions(removals: BulkRolePermission[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(RBAC_ENDPOINTS.ROLES_BULK_REMOVE_PERMISSIONS, { removals });
  }

  /**
   * Efficient bulk permission operations
   */
  async bulkAssignPermissionsEfficient(
    roleIds: number[],
    permissionIds: number[],
    conditions?: Record<string, any>
  ): Promise<ApiResponse<{ successful: number; failed: number }>> {
    return rbacApiService.post(RBAC_ENDPOINTS.ROLES_BULK_ASSIGN_PERMISSIONS_EFFICIENT, {
      role_ids: roleIds,
      permission_ids: permissionIds,
      conditions: conditions || null
    });
  }

  /**
   * Efficient bulk permission removals
   */
  async bulkRemovePermissionsEfficient(
    roleIds: number[],
    permissionIds: number[]
  ): Promise<ApiResponse<{ successful: number; failed: number }>> {
    return rbacApiService.post(RBAC_ENDPOINTS.ROLES_BULK_REMOVE_PERMISSIONS_EFFICIENT, {
      role_ids: roleIds,
      permission_ids: permissionIds
    });
  }

  // === User Management ===

  /**
   * Get users assigned to role
   */
  async getRoleUsers(
    roleId: number,
    pagination: RolePagination = {}
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams();
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.ROLE(roleId)}/users?${queryString}`
      : `${RBAC_ENDPOINTS.ROLE(roleId)}/users`;
    
    return rbacApiService.get<PaginatedResponse<User>>(url);
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    roleId: number,
    userId: number,
    resourceType?: string,
    resourceId?: string,
    expiresAt?: string
  ): Promise<ApiResponse<RoleAssignment>> {
    return rbacApiService.post<RoleAssignment>(
      `${RBAC_ENDPOINTS.ROLE(roleId)}/users`,
      {
        user_id: userId,
        resource_type: resourceType || null,
        resource_id: resourceId || null,
        expires_at: expiresAt || null
      }
    );
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    roleId: number,
    userId: number,
    resourceType?: string,
    resourceId?: string
  ): Promise<ApiResponse<void>> {
    const params = new URLSearchParams();
    if (resourceType) params.append('resource_type', resourceType);
    if (resourceId) params.append('resource_id', resourceId);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.ROLE(roleId)}/users/${userId}?${queryString}`
      : `${RBAC_ENDPOINTS.ROLE(roleId)}/users/${userId}`;
    
    return rbacApiService.delete<void>(url);
  }

  // === Built-in Roles ===

  /**
   * Get built-in system roles
   */
  async getBuiltinRoles(): Promise<ApiResponse<Role[]>> {
    return rbacApiService.get<Role[]>(RBAC_ENDPOINTS.BUILTIN_ROLES);
  }

  /**
   * Sync built-in roles with system defaults
   */
  async syncBuiltinRoles(): Promise<ApiResponse<{
    created: number;
    updated: number;
    synchronized: Role[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.BUILTIN_ROLES}/sync`, {});
  }

  // === Analytics and Reporting ===

  /**
   * Get role analytics
   */
  async getRoleAnalytics(roleId: number): Promise<ApiResponse<RoleAnalytics>> {
    return rbacApiService.get<RoleAnalytics>(`${RBAC_ENDPOINTS.ROLE(roleId)}/analytics`);
  }

  /**
   * Get role usage statistics
   */
  async getRoleUsageStats(
    roleIds?: number[],
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    roleUsage: Array<{
      roleId: number;
      roleName: string;
      userCount: number;
      activeUserCount: number;
      lastUsed: string;
    }>;
  }>> {
    const params = new URLSearchParams();
    if (roleIds?.length) {
      roleIds.forEach(id => params.append('role_ids', id.toString()));
    }
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.ROLES}/usage-stats?${queryString}`
      : `${RBAC_ENDPOINTS.ROLES}/usage-stats`;
    
    return rbacApiService.get(url);
  }

  // === Permission Diff Service ===

  /**
   * Get permission differences for role changes
   */
  async getPermissionDiff(
    roleId: number,
    beforeState?: any,
    afterState?: any,
    resourceType?: string,
    resourceId?: string
  ): Promise<ApiResponse<RolePermissionDiff>> {
    return rbacApiService.post<RolePermissionDiff>(RBAC_ENDPOINTS.PERMISSION_DIFF, {
      role_id: roleId,
      before_state: beforeState,
      after_state: afterState,
      resource_type: resourceType,
      resource_id: resourceId
    });
  }

  // === Templates and Import/Export ===

  /**
   * Create role template
   */
  async createRoleTemplate(template: RoleTemplate): Promise<ApiResponse<RoleTemplate>> {
    return rbacApiService.post<RoleTemplate>(`${RBAC_ENDPOINTS.ROLES}/templates`, template);
  }

  /**
   * Apply role template
   */
  async applyRoleTemplate(
    templateId: number,
    targetName: string,
    customizations?: Partial<RoleCreate>
  ): Promise<ApiResponse<Role>> {
    return rbacApiService.post<Role>(`${RBAC_ENDPOINTS.ROLES}/templates/${templateId}/apply`, {
      target_name: targetName,
      customizations: customizations || {}
    });
  }

  /**
   * Export roles configuration
   */
  async exportRoles(
    roleIds?: number[],
    format: 'json' | 'csv' | 'xlsx' = 'json',
    includePermissions = true,
    includeUsers = false
  ): Promise<ApiResponse<RoleImportExport>> {
    const params = new URLSearchParams({
      format,
      include_permissions: includePermissions.toString(),
      include_users: includeUsers.toString()
    });
    
    if (roleIds?.length) {
      roleIds.forEach(id => params.append('role_ids', id.toString()));
    }
    
    return rbacApiService.get<RoleImportExport>(`${RBAC_ENDPOINTS.ROLES}/export?${params.toString()}`);
  }

  /**
   * Import roles configuration
   */
  async importRoles(
    importData: RoleImportExport,
    options: {
      overwriteExisting?: boolean;
      dryRun?: boolean;
      skipValidation?: boolean;
    } = {}
  ): Promise<ApiResponse<{
    imported: number;
    skipped: number;
    errors: string[];
    preview?: Role[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ROLES}/import`, {
      data: importData,
      options
    });
  }

  // === Validation and Testing ===

  /**
   * Validate role configuration
   */
  async validateRole(roleData: RoleCreate | RoleUpdate): Promise<ApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ROLES}/validate`, roleData);
  }

  /**
   * Test role access patterns
   */
  async testRoleAccess(
    roleId: number,
    testCases: Array<{
      action: string;
      resource: string;
      resourceId?: string;
      expectedResult: boolean;
    }>
  ): Promise<ApiResponse<Array<{
    testCase: any;
    actualResult: boolean;
    passed: boolean;
    details: string;
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ROLE(roleId)}/test-access`, { test_cases: testCases });
  }

  // === Advanced Search and Discovery ===

  /**
   * Search roles with advanced filters
   */
  async searchRoles(query: {
    text?: string;
    permissions?: string[];
    hasUsers?: boolean;
    isInherited?: boolean;
    tags?: string[];
    createdBy?: number;
    lastModified?: {
      start?: string;
      end?: string;
    };
  }): Promise<ApiResponse<Role[]>> {
    return rbacApiService.post<Role[]>(`${RBAC_ENDPOINTS.ROLES}/search`, query);
  }

  /**
   * Discover similar roles
   */
  async discoverSimilarRoles(
    roleId: number,
    threshold = 0.8
  ): Promise<ApiResponse<Array<{
    role: Role;
    similarity: number;
    commonPermissions: Permission[];
    differences: Permission[];
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.ROLE(roleId)}/similar?threshold=${threshold}`);
  }

  /**
   * Get role recommendations for user
   */
  async getRoleRecommendations(
    userId: number,
    context?: {
      department?: string;
      jobTitle?: string;
      teamId?: number;
    }
  ): Promise<ApiResponse<Array<{
    role: Role;
    confidence: number;
    reasoning: string[];
    requiredApprovals: string[];
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ROLES}/recommendations`, {
      user_id: userId,
      context: context || {}
    });
  }
}

// Export singleton instance
export const roleService = new RoleService();
export default roleService;