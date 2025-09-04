// Resource Service - Maps to backend resource_service.py
// Provides comprehensive resource management with hierarchical structure, data source integration, and enterprise features

import { rbacApiService, ApiResponse, PaginatedResponse } from './rbac-api.service';
import { RBAC_ENDPOINTS } from '../constants/api.constants';
import type {
  Resource,
  ResourceCreate,
  ResourceUpdate,
  ResourceWithRoles,
  ResourceTree,
  ResourceHierarchy,
  ResourcePermissions,
  ResourceAnalytics,
  ResourceSync,
  ResourceImportExport,
  DataSourceResource,
  SchemaResource,
  TableResource,
  ColumnResource,
  ResourceAccessPattern,
  ResourceUsageStats
} from '../types/resource.types';
import type { Role } from '../types/role.types';
import type { Permission } from '../types/permission.types';
import type { User } from '../types/user.types';

export interface ResourceFilters {
  search?: string;
  type?: string;
  engine?: string;
  hasChildren?: boolean;
  hasRoles?: boolean;
  parentId?: number;
  dataSourceId?: number;
  isActive?: boolean;
  tags?: string[];
  createdAfter?: string;
  createdBefore?: string;
  lastAccessedAfter?: string;
  lastAccessedBefore?: string;
}

export interface ResourcePagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ResourceRoleAssignment {
  roleId: number;
  resourceId: number;
  resourceType?: string;
  permissions?: string[];
  conditions?: Record<string, any>;
  expiresAt?: string;
}

export class ResourceService {
  // === Core CRUD Operations ===

  /**
   * Get all resources with advanced filtering and pagination
   */
  async getResources(
    filters: ResourceFilters = {},
    pagination: ResourcePagination = {}
  ): Promise<ApiResponse<PaginatedResponse<Resource>>> {
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
    const url = queryString ? `${RBAC_ENDPOINTS.RESOURCES}?${queryString}` : RBAC_ENDPOINTS.RESOURCES;
    
    return rbacApiService.get<PaginatedResponse<Resource>>(url);
  }

  /**
   * Get resource by ID with optional includes
   */
  async getResource(
    resourceId: number,
    includes: {
      roles?: boolean;
      permissions?: boolean;
      children?: boolean;
      ancestors?: boolean;
      analytics?: boolean;
      dataSource?: boolean;
    } = {}
  ): Promise<ApiResponse<Resource>> {
    const params = new URLSearchParams();
    Object.entries(includes).forEach(([key, value]) => {
      if (value) params.append(`include_${key}`, 'true');
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.RESOURCE(resourceId)}?${queryString}` 
      : RBAC_ENDPOINTS.RESOURCE(resourceId);
    
    return rbacApiService.get<Resource>(url);
  }

  /**
   * Create new resource with validation
   */
  async createResource(resourceData: ResourceCreate): Promise<ApiResponse<Resource>> {
    return rbacApiService.post<Resource>(RBAC_ENDPOINTS.RESOURCES, resourceData);
  }

  /**
   * Update existing resource
   */
  async updateResource(resourceId: number, updates: ResourceUpdate): Promise<ApiResponse<Resource>> {
    return rbacApiService.put<Resource>(RBAC_ENDPOINTS.RESOURCE(resourceId), updates);
  }

  /**
   * Delete resource with cascade options
   */
  async deleteResource(
    resourceId: number,
    options: {
      cascade?: boolean;
      moveChildrenToParent?: boolean;
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
      ? `${RBAC_ENDPOINTS.RESOURCE(resourceId)}?${queryString}`
      : RBAC_ENDPOINTS.RESOURCE(resourceId);
    
    return rbacApiService.delete<void>(url);
  }

  // === Hierarchical Resource Management ===

  /**
   * Get resource tree structure
   */
  async getResourceTree(
    rootResourceId?: number,
    maxDepth?: number,
    includeRoles = false
  ): Promise<ApiResponse<ResourceTree[]>> {
    const params = new URLSearchParams();
    if (rootResourceId) params.append('root_resource_id', rootResourceId.toString());
    if (maxDepth) params.append('max_depth', maxDepth.toString());
    if (includeRoles) params.append('include_roles', 'true');
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.RESOURCE_TREE}?${queryString}`
      : RBAC_ENDPOINTS.RESOURCE_TREE;
    
    return rbacApiService.get<ResourceTree[]>(url);
  }

  /**
   * Get resource ancestors (parent chain)
   */
  async getResourceAncestors(resourceId: number): Promise<ApiResponse<Resource[]>> {
    return rbacApiService.get<Resource[]>(RBAC_ENDPOINTS.RESOURCE_ANCESTORS(resourceId));
  }

  /**
   * Get resource descendants (all children)
   */
  async getResourceDescendants(
    resourceId: number,
    maxDepth?: number,
    includeInactive = false
  ): Promise<ApiResponse<Resource[]>> {
    const params = new URLSearchParams();
    if (maxDepth) params.append('max_depth', maxDepth.toString());
    if (includeInactive) params.append('include_inactive', 'true');
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.RESOURCE_DESCENDANTS(resourceId)}?${queryString}`
      : RBAC_ENDPOINTS.RESOURCE_DESCENDANTS(resourceId);
    
    return rbacApiService.get<Resource[]>(url);
  }

  /**
   * Move resource to new parent
   */
  async moveResource(
    resourceId: number,
    newParentId: number | null,
    options: {
      validateHierarchy?: boolean;
      preserveRoles?: boolean;
    } = {}
  ): Promise<ApiResponse<Resource>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCE(resourceId)}/move`, {
      new_parent_id: newParentId,
      options
    });
  }

  // === Role and Permission Management ===

  /**
   * Get resource roles
   */
  async getResourceRoles(
    resourceId: number,
    includeInherited = true
  ): Promise<ApiResponse<ResourceWithRoles>> {
    const params = includeInherited ? '?include_inherited=true' : '';
    return rbacApiService.get<ResourceWithRoles>(`${RBAC_ENDPOINTS.RESOURCE_ROLES(resourceId)}${params}`);
  }

  /**
   * Assign role to resource
   */
  async assignRoleToResource(assignment: ResourceRoleAssignment): Promise<ApiResponse<void>> {
    return rbacApiService.post(RBAC_ENDPOINTS.RESOURCE_ASSIGN_ROLE(assignment.resourceId), {
      role_id: assignment.roleId,
      resource_type: assignment.resourceType,
      permissions: assignment.permissions || [],
      conditions: assignment.conditions || null,
      expires_at: assignment.expiresAt || null
    });
  }

  /**
   * Remove role from resource
   */
  async removeRoleFromResource(
    resourceId: number,
    roleId: number,
    resourceType?: string
  ): Promise<ApiResponse<void>> {
    const params = resourceType ? `?resource_type=${resourceType}` : '';
    return rbacApiService.delete(`${RBAC_ENDPOINTS.RESOURCE(resourceId)}/roles/${roleId}${params}`);
  }

  /**
   * Get effective permissions for resource
   */
  async getResourceEffectivePermissions(
    resourceId: number,
    userId?: number,
    includeInherited = true
  ): Promise<ApiResponse<ResourcePermissions>> {
    const params = new URLSearchParams({
      include_inherited: includeInherited.toString()
    });
    if (userId) params.append('user_id', userId.toString());
    
    return rbacApiService.get<ResourcePermissions>(
      `${RBAC_ENDPOINTS.RESOURCE_EFFECTIVE_PERMISSIONS(resourceId)}?${params.toString()}`
    );
  }

  /**
   * Get user's effective permissions on resource
   */
  async getUserEffectivePermissionsOnResource(
    resourceId: number,
    userId: number,
    includeConditions = true
  ): Promise<ApiResponse<{
    permissions: Permission[];
    source: Record<string, 'direct' | 'role' | 'group' | 'inherited'>;
    conditions: Record<string, any>;
    denyAssignments: Array<{
      action: string;
      reason: string;
      source: string;
    }>;
  }>> {
    const params = includeConditions ? '?include_conditions=true' : '';
    return rbacApiService.get(
      `${RBAC_ENDPOINTS.RESOURCE_EFFECTIVE_USER_PERMISSIONS(resourceId)}?user_id=${userId}${params}`
    );
  }

  // === Data Source Integration ===

  /**
   * Sync data sources to resources
   */
  async syncDataSourcesToResources(
    dataSourceIds?: number[],
    options: {
      createMissing?: boolean;
      updateExisting?: boolean;
      removeOrphaned?: boolean;
      preserveCustomizations?: boolean;
    } = {}
  ): Promise<ApiResponse<ResourceSync>> {
    return rbacApiService.post(RBAC_ENDPOINTS.RESOURCES_SYNC_DATA_SOURCES, {
      data_source_ids: dataSourceIds || [],
      options
    });
  }

  /**
   * Get resource for data source
   */
  async getDataSourceResource(dataSourceId: number): Promise<ApiResponse<DataSourceResource>> {
    return rbacApiService.get<DataSourceResource>(RBAC_ENDPOINTS.RESOURCES_DATA_SOURCE(dataSourceId));
  }

  /**
   * Get data source hierarchy
   */
  async getDataSourceHierarchy(
    dataSourceId: number,
    includePermissions = false
  ): Promise<ApiResponse<ResourceHierarchy>> {
    const params = includePermissions ? '?include_permissions=true' : '';
    return rbacApiService.get<ResourceHierarchy>(
      `${RBAC_ENDPOINTS.RESOURCES_DATA_SOURCE_HIERARCHY(dataSourceId)}${params}`
    );
  }

  /**
   * Get schemas for data source
   */
  async getDataSourceSchemas(
    dataSourceId: number,
    includeInactive = false
  ): Promise<ApiResponse<SchemaResource[]>> {
    const params = includeInactive ? '?include_inactive=true' : '';
    return rbacApiService.get<SchemaResource[]>(
      `${RBAC_ENDPOINTS.RESOURCES_DATA_SOURCE_SCHEMAS(dataSourceId)}${params}`
    );
  }

  /**
   * Get tables for schema resource
   */
  async getSchemaTablesResources(
    schemaResourceId: number,
    includeColumns = false
  ): Promise<ApiResponse<TableResource[]>> {
    const params = includeColumns ? '?include_columns=true' : '';
    return rbacApiService.get<TableResource[]>(
      `${RBAC_ENDPOINTS.RESOURCES_SCHEMA_TABLES(schemaResourceId)}${params}`
    );
  }

  /**
   * Create data source resource hierarchy
   */
  async createDataSourceHierarchy(
    dataSourceId: number,
    hierarchyConfig: {
      includeSchemas?: boolean;
      includeTables?: boolean;
      includeColumns?: boolean;
      defaultPermissions?: string[];
      inheritanceRules?: Record<string, any>;
    }
  ): Promise<ApiResponse<{
    created: number;
    updated: number;
    hierarchy: ResourceHierarchy;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/create-hierarchy`, {
      data_source_id: dataSourceId,
      config: hierarchyConfig
    });
  }

  // === Resource Discovery and Search ===

  /**
   * Search resources with advanced filters
   */
  async searchResources(query: {
    text?: string;
    types?: string[];
    engines?: string[];
    hasRoles?: boolean;
    hasPermissions?: boolean;
    tags?: string[];
    lastAccessed?: {
      start?: string;
      end?: string;
    };
    createdBy?: number;
  }): Promise<ApiResponse<Resource[]>> {
    return rbacApiService.post<Resource[]>(`${RBAC_ENDPOINTS.RESOURCES}/search`, query);
  }

  /**
   * Discover orphaned resources
   */
  async discoverOrphanedResources(): Promise<ApiResponse<Array<{
    resource: Resource;
    reason: string;
    suggestedAction: 'delete' | 'assign_parent' | 'review';
    recommendations: string[];
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.RESOURCES}/orphaned`);
  }

  /**
   * Get resource recommendations
   */
  async getResourceRecommendations(
    userId: number,
    context?: {
      department?: string;
      jobTitle?: string;
      currentAccess?: string[];
    }
  ): Promise<ApiResponse<Array<{
    resource: Resource;
    confidence: number;
    reasoning: string[];
    suggestedPermissions: Permission[];
    riskLevel: 'low' | 'medium' | 'high';
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/recommendations`, {
      user_id: userId,
      context: context || {}
    });
  }

  // === Analytics and Monitoring ===

  /**
   * Get resource analytics
   */
  async getResourceAnalytics(
    resourceId: number,
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<ResourceAnalytics>> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.RESOURCE(resourceId)}/analytics?${queryString}`
      : `${RBAC_ENDPOINTS.RESOURCE(resourceId)}/analytics`;
    
    return rbacApiService.get<ResourceAnalytics>(url);
  }

  /**
   * Get resource usage statistics
   */
  async getResourceUsageStats(
    resourceIds?: number[],
    groupBy: 'type' | 'engine' | 'user' | 'department' = 'type',
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<ResourceUsageStats>> {
    const params = new URLSearchParams({ group_by: groupBy });
    if (resourceIds?.length) {
      resourceIds.forEach(id => params.append('resource_ids', id.toString()));
    }
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    return rbacApiService.get<ResourceUsageStats>(`${RBAC_ENDPOINTS.RESOURCES}/usage-stats?${params.toString()}`);
  }

  /**
   * Get resource access patterns
   */
  async getResourceAccessPatterns(
    resourceId: number,
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<ResourceAccessPattern[]>> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.RESOURCE(resourceId)}/access-patterns?${queryString}`
      : `${RBAC_ENDPOINTS.RESOURCE(resourceId)}/access-patterns`;
    
    return rbacApiService.get<ResourceAccessPattern[]>(url);
  }

  // === Bulk Operations ===

  /**
   * Bulk create resources
   */
  async bulkCreateResources(resources: ResourceCreate[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
    created: Resource[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/bulk-create`, { resources });
  }

  /**
   * Bulk update resources
   */
  async bulkUpdateResources(updates: Array<{
    id: number;
    updates: ResourceUpdate;
  }>): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
    updated: Resource[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/bulk-update`, { updates });
  }

  /**
   * Bulk assign roles to resources
   */
  async bulkAssignRoles(assignments: ResourceRoleAssignment[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/bulk-assign-roles`, { assignments });
  }

  /**
   * Bulk remove roles from resources
   */
  async bulkRemoveRoles(removals: Array<{
    resourceId: number;
    roleId: number;
    resourceType?: string;
  }>): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/bulk-remove-roles`, { removals });
  }

  // === Import/Export ===

  /**
   * Export resources configuration
   */
  async exportResources(
    resourceIds?: number[],
    format: 'json' | 'csv' | 'xlsx' = 'json',
    includeHierarchy = true,
    includeRoles = false,
    includePermissions = false
  ): Promise<ApiResponse<ResourceImportExport>> {
    const params = new URLSearchParams({
      format,
      include_hierarchy: includeHierarchy.toString(),
      include_roles: includeRoles.toString(),
      include_permissions: includePermissions.toString()
    });
    
    if (resourceIds?.length) {
      resourceIds.forEach(id => params.append('resource_ids', id.toString()));
    }
    
    return rbacApiService.get<ResourceImportExport>(`${RBAC_ENDPOINTS.RESOURCES}/export?${params.toString()}`);
  }

  /**
   * Import resources configuration
   */
  async importResources(
    importData: ResourceImportExport,
    options: {
      overwriteExisting?: boolean;
      dryRun?: boolean;
      skipValidation?: boolean;
      preserveHierarchy?: boolean;
      syncDataSources?: boolean;
    } = {}
  ): Promise<ApiResponse<{
    imported: number;
    skipped: number;
    errors: string[];
    preview?: Resource[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/import`, {
      data: importData,
      options
    });
  }

  // === Validation and Testing ===

  /**
   * Validate resource hierarchy
   */
  async validateResourceHierarchy(resourceId?: number): Promise<ApiResponse<{
    valid: boolean;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      resourceId: number;
      message: string;
      suggestedAction: string;
    }>;
    summary: {
      totalResources: number;
      validResources: number;
      issueCount: number;
    };
  }>> {
    const params = resourceId ? `?resource_id=${resourceId}` : '';
    return rbacApiService.get(`${RBAC_ENDPOINTS.RESOURCES}/validate-hierarchy${params}`);
  }

  /**
   * Test resource access for user
   */
  async testResourceAccess(
    resourceId: number,
    userId: number,
    actions: string[],
    context?: Record<string, any>
  ): Promise<ApiResponse<Array<{
    action: string;
    allowed: boolean;
    source: string;
    conditions: any;
    denyReason?: string;
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCE(resourceId)}/test-access`, {
      user_id: userId,
      actions,
      context: context || {}
    });
  }

  // === Resource Templates ===

  /**
   * Get resource templates
   */
  async getResourceTemplates(type?: string): Promise<ApiResponse<Array<{
    id: number;
    name: string;
    description: string;
    type: string;
    template: ResourceCreate;
    category: string;
    isBuiltIn: boolean;
  }>>> {
    const params = type ? `?type=${type}` : '';
    return rbacApiService.get(`${RBAC_ENDPOINTS.RESOURCES}/templates${params}`);
  }

  /**
   * Create resource from template
   */
  async createResourceFromTemplate(
    templateId: number,
    customizations: Partial<ResourceCreate>
  ): Promise<ApiResponse<Resource>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/templates/${templateId}/create`, {
      customizations
    });
  }

  /**
   * Apply template to existing resources
   */
  async applyTemplateToResources(
    templateId: number,
    resourceIds: number[],
    options: {
      overwriteExisting?: boolean;
      preserveCustomizations?: boolean;
    } = {}
  ): Promise<ApiResponse<{
    applied: number;
    skipped: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.RESOURCES}/templates/${templateId}/apply`, {
      resource_ids: resourceIds,
      options
    });
  }
}

// Export singleton instance
export const resourceService = new ResourceService();
export default resourceService;