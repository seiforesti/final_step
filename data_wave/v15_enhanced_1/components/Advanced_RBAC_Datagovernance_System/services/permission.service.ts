// Permission Service - Maps to backend permission management
// Provides comprehensive permission management with ABAC conditions, bulk operations, and enterprise features

import { rbacApiService, ApiResponse, PaginatedResponse } from './rbac-api.service';
import { RBAC_ENDPOINTS } from '../constants/api.constants';
import type {
  Permission,
  PermissionCreate,
  PermissionUpdate,
  PermissionWithRoles,
  PermissionScope,
  PermissionCondition,
  PermissionTemplate,
  PermissionMatrix,
  PermissionAnalytics,
  BulkPermissionOperation,
  PermissionImportExport,
  EffectivePermission,
  PermissionConflict,
  PermissionAuditTrail
} from '../types/permission.types';
import type { Role } from '../types/role.types';
import type { Resource } from '../types/resource.types';
import type { User } from '../types/user.types';

export interface PermissionFilters {
  search?: string;
  action?: string;
  resource?: string;
  resourceType?: string;
  hasConditions?: boolean;
  isActive?: boolean;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  createdBy?: number;
  createdAfter?: string;
  createdBefore?: string;
  tags?: string[];
}

export interface PermissionPagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PermissionTestCase {
  userId: number;
  action: string;
  resource: string;
  resourceId?: string;
  context?: Record<string, any>;
  expectedResult: boolean;
}

export class PermissionService {
  // === Core CRUD Operations ===

  /**
   * Get all permissions with advanced filtering and pagination
   */
  async getPermissions(
    filters: PermissionFilters = {},
    pagination: PermissionPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<Permission>>> {
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
    const url = queryString ? `${RBAC_ENDPOINTS.PERMISSIONS}?${queryString}` : RBAC_ENDPOINTS.PERMISSIONS;
    
    return rbacApiService.get<PaginatedResponse<Permission>>(url);
  }

  /**
   * Get permission by ID with optional includes
   */
  async getPermission(
    permissionId: number,
    includes: {
      roles?: boolean;
      users?: boolean;
      analytics?: boolean;
      auditTrail?: boolean;
    } = {}
  ): Promise<ApiResponse<Permission>> {
    const params = new URLSearchParams();
    Object.entries(includes).forEach(([key, value]) => {
      if (value) params.append(`include_${key}`, 'true');
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.PERMISSION(permissionId)}?${queryString}` 
      : RBAC_ENDPOINTS.PERMISSION(permissionId);
    
    return rbacApiService.get<Permission>(url);
  }

  /**
   * Create new permission with validation
   */
  async createPermission(permissionData: PermissionCreate): Promise<ApiResponse<Permission>> {
    return rbacApiService.post<Permission>(RBAC_ENDPOINTS.PERMISSIONS, permissionData);
  }

  /**
   * Update existing permission
   */
  async updatePermission(permissionId: number, updates: PermissionUpdate): Promise<ApiResponse<Permission>> {
    return rbacApiService.put<Permission>(RBAC_ENDPOINTS.PERMISSION(permissionId), updates);
  }

  /**
   * Delete permission with cascade options
   */
  async deletePermission(
    permissionId: number,
    options: {
      cascade?: boolean;
      transferToPermission?: number;
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
      ? `${RBAC_ENDPOINTS.PERMISSION(permissionId)}?${queryString}`
      : RBAC_ENDPOINTS.PERMISSION(permissionId);
    
    return rbacApiService.delete<void>(url);
  }

  // === Permission Checking and Validation ===

  /**
   * Check if user has specific permission
   */
  async checkUserPermission(
    userId: number,
    action: string,
    resource: string,
    resourceId?: string,
    context?: Record<string, any>
  ): Promise<ApiResponse<{
    hasPermission: boolean;
    source: 'direct' | 'role' | 'group' | 'inherited';
    sourceDetails: string;
    conditions?: Record<string, any>;
    denyReason?: string;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/check`, {
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      context: context || {}
    });
  }

  /**
   * Batch check multiple permissions for a user
   */
  async batchCheckUserPermissions(
    userId: number,
    checks: Array<{
      action: string;
      resource: string;
      resourceId?: string;
      context?: Record<string, any>;
    }>
  ): Promise<ApiResponse<Array<{
    check: any;
    hasPermission: boolean;
    source: string;
    sourceDetails: string;
    denyReason?: string;
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/batch-check`, {
      user_id: userId,
      checks
    });
  }

  /**
   * Get user's effective permissions with inheritance and conditions
   */
  async getUserEffectivePermissions(
    userId: number,
    resourceType?: string,
    resourceId?: string,
    includeInherited = true,
    includeConditions = true
  ): Promise<ApiResponse<EffectivePermission[]>> {
    const params = new URLSearchParams({
      include_inherited: includeInherited.toString(),
      include_conditions: includeConditions.toString()
    });
    
    if (resourceType) params.append('resource_type', resourceType);
    if (resourceId) params.append('resource_id', resourceId);
    
    return rbacApiService.get<EffectivePermission[]>(
      `${RBAC_ENDPOINTS.USERS}/${userId}/effective-permissions?${params.toString()}`
    );
  }

  // === ABAC Condition Management ===

  /**
   * Validate permission condition syntax
   */
  async validateCondition(condition: Record<string, any>): Promise<ApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    supportedAttributes: string[];
  }>> {
    return rbacApiService.post(RBAC_ENDPOINTS.VALIDATE_CONDITION, { condition });
  }

  /**
   * Test ABAC condition against user context
   */
  async testCondition(
    condition: Record<string, any>,
    userContext: Record<string, any>,
    resourceContext?: Record<string, any>
  ): Promise<ApiResponse<{
    result: boolean;
    evaluationSteps: Array<{
      step: string;
      condition: any;
      userValue: any;
      result: boolean;
    }>;
    executionTime: number;
  }>> {
    return rbacApiService.post(RBAC_ENDPOINTS.TEST_ABAC, {
      condition,
      user_context: userContext,
      resource_context: resourceContext || {}
    });
  }

  /**
   * Get condition template helpers
   */
  async getConditionHelpers(): Promise<ApiResponse<{
    operators: Array<{
      name: string;
      description: string;
      example: any;
    }>;
    attributes: Array<{
      name: string;
      type: string;
      description: string;
      examples: any[];
    }>;
    templates: Array<{
      name: string;
      description: string;
      condition: any;
      useCase: string;
    }>;
  }>> {
    return rbacApiService.get(RBAC_ENDPOINTS.CONDITION_TEMPLATES_HELPERS);
  }

  // === Bulk Operations ===

  /**
   * Bulk create permissions
   */
  async bulkCreatePermissions(permissions: PermissionCreate[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
    created: Permission[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/bulk-create`, { permissions });
  }

  /**
   * Bulk update permissions
   */
  async bulkUpdatePermissions(updates: Array<{
    id: number;
    updates: PermissionUpdate;
  }>): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
    updated: Permission[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/bulk-update`, { updates });
  }

  /**
   * Bulk delete permissions
   */
  async bulkDeletePermissions(
    permissionIds: number[],
    options: {
      cascade?: boolean;
      forceDelete?: boolean;
    } = {}
  ): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/bulk-delete`, {
      permission_ids: permissionIds,
      options
    });
  }

  // === Permission Matrix and Visualization ===

  /**
   * Get permission matrix for roles and resources
   */
  async getPermissionMatrix(
    roleIds?: number[],
    resourceTypes?: string[],
    actions?: string[]
  ): Promise<ApiResponse<PermissionMatrix>> {
    const params = new URLSearchParams();
    if (roleIds?.length) {
      roleIds.forEach(id => params.append('role_ids', id.toString()));
    }
    if (resourceTypes?.length) {
      resourceTypes.forEach(type => params.append('resource_types', type));
    }
    if (actions?.length) {
      actions.forEach(action => params.append('actions', action));
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.PERMISSIONS}/matrix?${queryString}`
      : `${RBAC_ENDPOINTS.PERMISSIONS}/matrix`;
    
    return rbacApiService.get<PermissionMatrix>(url);
  }

  /**
   * Get permission scope analysis
   */
  async getPermissionScope(permissionId: number): Promise<ApiResponse<PermissionScope>> {
    return rbacApiService.get<PermissionScope>(`${RBAC_ENDPOINTS.PERMISSION(permissionId)}/scope`);
  }

  /**
   * Analyze permission conflicts and overlaps
   */
  async analyzePermissionConflicts(
    userId?: number,
    roleId?: number,
    resourceType?: string
  ): Promise<ApiResponse<PermissionConflict[]>> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());
    if (roleId) params.append('role_id', roleId.toString());
    if (resourceType) params.append('resource_type', resourceType);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.PERMISSIONS}/conflicts?${queryString}`
      : `${RBAC_ENDPOINTS.PERMISSIONS}/conflicts`;
    
    return rbacApiService.get<PermissionConflict[]>(url);
  }

  // === Templates and Presets ===

  /**
   * Get permission templates
   */
  async getPermissionTemplates(category?: string): Promise<ApiResponse<PermissionTemplate[]>> {
    const params = category ? `?category=${category}` : '';
    return rbacApiService.get<PermissionTemplate[]>(`${RBAC_ENDPOINTS.PERMISSIONS}/templates${params}`);
  }

  /**
   * Create permission template
   */
  async createPermissionTemplate(template: PermissionTemplate): Promise<ApiResponse<PermissionTemplate>> {
    return rbacApiService.post<PermissionTemplate>(`${RBAC_ENDPOINTS.PERMISSIONS}/templates`, template);
  }

  /**
   * Apply permission template
   */
  async applyPermissionTemplate(
    templateId: number,
    targetRoles: number[],
    customizations?: Record<string, any>
  ): Promise<ApiResponse<{
    applied: number;
    skipped: number;
    errors: string[];
    permissions: Permission[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/templates/${templateId}/apply`, {
      target_roles: targetRoles,
      customizations: customizations || {}
    });
  }

  // === Analytics and Reporting ===

  /**
   * Get permission analytics
   */
  async getPermissionAnalytics(
    permissionId?: number,
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<PermissionAnalytics>> {
    const params = new URLSearchParams();
    if (permissionId) params.append('permission_id', permissionId.toString());
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.PERMISSIONS}/analytics?${queryString}`
      : `${RBAC_ENDPOINTS.PERMISSIONS}/analytics`;
    
    return rbacApiService.get<PermissionAnalytics>(url);
  }

  /**
   * Get permission usage statistics
   */
  async getPermissionUsageStats(
    permissionIds?: number[],
    groupBy: 'action' | 'resource' | 'user' | 'role' = 'action'
  ): Promise<ApiResponse<{
    totalUsage: number;
    uniqueUsers: number;
    mostUsedPermissions: Array<{
      permission: Permission;
      usageCount: number;
      uniqueUsers: number;
      lastUsed: string;
    }>;
    usageByGroup: Record<string, number>;
  }>> {
    const params = new URLSearchParams({ group_by: groupBy });
    if (permissionIds?.length) {
      permissionIds.forEach(id => params.append('permission_ids', id.toString()));
    }
    
    return rbacApiService.get(`${RBAC_ENDPOINTS.PERMISSIONS}/usage-stats?${params.toString()}`);
  }

  /**
   * Get permission audit trail
   */
  async getPermissionAuditTrail(
    permissionId: number,
    pagination: PermissionPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<PermissionAuditTrail>>> {
    const params = new URLSearchParams();
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.PERMISSION(permissionId)}/audit-trail?${queryString}`
      : `${RBAC_ENDPOINTS.PERMISSION(permissionId)}/audit-trail`;
    
    return rbacApiService.get<PaginatedResponse<PermissionAuditTrail>>(url);
  }

  // === Import/Export ===

  /**
   * Export permissions configuration
   */
  async exportPermissions(
    permissionIds?: number[],
    format: 'json' | 'csv' | 'xlsx' = 'json',
    includeConditions = true,
    includeRoles = false
  ): Promise<ApiResponse<PermissionImportExport>> {
    const params = new URLSearchParams({
      format,
      include_conditions: includeConditions.toString(),
      include_roles: includeRoles.toString()
    });
    
    if (permissionIds?.length) {
      permissionIds.forEach(id => params.append('permission_ids', id.toString()));
    }
    
    return rbacApiService.get<PermissionImportExport>(
      `${RBAC_ENDPOINTS.PERMISSIONS}/export?${params.toString()}`
    );
  }

  /**
   * Import permissions configuration
   */
  async importPermissions(
    importData: PermissionImportExport,
    options: {
      overwriteExisting?: boolean;
      dryRun?: boolean;
      skipValidation?: boolean;
      mergeConditions?: boolean;
    } = {}
  ): Promise<ApiResponse<{
    imported: number;
    skipped: number;
    errors: string[];
    preview?: Permission[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/import`, {
      data: importData,
      options
    });
  }

  // === Testing and Validation ===

  /**
   * Test permission configuration
   */
  async testPermissionConfiguration(testCases: PermissionTestCase[]): Promise<ApiResponse<Array<{
    testCase: PermissionTestCase;
    result: boolean;
    expected: boolean;
    passed: boolean;
    details: string;
    executionTime: number;
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/test-configuration`, { test_cases: testCases });
  }

  /**
   * Validate permission consistency
   */
  async validatePermissionConsistency(): Promise<ApiResponse<{
    valid: boolean;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      affectedPermissions: number[];
      suggestedAction: string;
    }>;
    summary: {
      totalPermissions: number;
      validPermissions: number;
      issueCount: number;
    };
  }>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.PERMISSIONS}/validate-consistency`);
  }

  // === Advanced Search and Discovery ===

  /**
   * Search permissions with advanced filters
   */
  async searchPermissions(query: {
    text?: string;
    actions?: string[];
    resources?: string[];
    hasConditions?: boolean;
    isAssigned?: boolean;
    assignedToRoles?: number[];
    lastUsed?: {
      start?: string;
      end?: string;
    };
  }): Promise<ApiResponse<Permission[]>> {
    return rbacApiService.post<Permission[]>(`${RBAC_ENDPOINTS.PERMISSIONS}/search`, query);
  }

  /**
   * Discover unused permissions
   */
  async discoverUnusedPermissions(
    timeThreshold = 90 // days
  ): Promise<ApiResponse<Array<{
    permission: Permission;
    lastUsed: string | null;
    daysSinceLastUse: number;
    assignedRoles: Role[];
    recommendation: 'remove' | 'review' | 'keep';
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.PERMISSIONS}/unused?threshold_days=${timeThreshold}`);
  }

  /**
   * Get permission recommendations
   */
  async getPermissionRecommendations(
    userId?: number,
    roleId?: number,
    context?: {
      department?: string;
      jobTitle?: string;
      resourceAccess?: string[];
    }
  ): Promise<ApiResponse<Array<{
    permission: Permission;
    confidence: number;
    reasoning: string[];
    requiredApprovals: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/recommendations`, {
      user_id: userId,
      role_id: roleId,
      context: context || {}
    });
  }

  // === Permission Categories and Organization ===

  /**
   * Get permission categories
   */
  async getPermissionCategories(): Promise<ApiResponse<Array<{
    name: string;
    description: string;
    permissionCount: number;
    subCategories: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.PERMISSIONS}/categories`);
  }

  /**
   * Organize permissions by category
   */
  async organizePermissionsByCategory(
    permissionIds: number[],
    targetCategory: string
  ): Promise<ApiResponse<{
    moved: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.PERMISSIONS}/organize`, {
      permission_ids: permissionIds,
      target_category: targetCategory
    });
  }
}

// Export singleton instance
export const permissionService = new PermissionService();
export default permissionService;