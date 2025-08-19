// Group Service - Maps to backend group management
// Provides comprehensive group management with user assignments, role inheritance, and enterprise features

import { rbacApiService, ApiResponse, PaginatedResponse } from './rbac-api.service';
import { RBAC_ENDPOINTS } from '../constants/api.constants';
import type {
  Group,
  GroupCreate,
  GroupUpdate,
  GroupWithUsers,
  GroupWithRoles,
  GroupMembership,
  GroupAnalytics,
  GroupHierarchy,
  GroupImportExport,
  BulkGroupOperation,
  GroupTemplate,
  GroupAccessPattern
} from '../types/group.types';
import type { User } from '../types/user.types';
import type { Role } from '../types/role.types';
import type { Permission } from '../types/permission.types';
import type { Resource } from '../types/resource.types';

export interface GroupFilters {
  search?: string;
  hasUsers?: boolean;
  hasRoles?: boolean;
  isActive?: boolean;
  type?: string;
  department?: string;
  parentGroupId?: number;
  createdBy?: number;
  createdAfter?: string;
  createdBefore?: string;
  tags?: string[];
}

export interface GroupPagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GroupRoleAssignment {
  groupId: number;
  roleId: number;
  resourceType?: string;
  resourceId?: string;
  conditions?: Record<string, any>;
  expiresAt?: string;
}

export interface GroupUserAssignment {
  groupId: number;
  userId: number;
  isOwner?: boolean;
  canInvite?: boolean;
  expiresAt?: string;
}

export class GroupService {
  // === Core CRUD Operations ===

  /**
   * Get all groups with advanced filtering and pagination
   */
  async getGroups(
    filters: GroupFilters = {},
    pagination: GroupPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<Group>>> {
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
    const url = queryString ? `${RBAC_ENDPOINTS.GROUPS}?${queryString}` : RBAC_ENDPOINTS.GROUPS;
    
    return rbacApiService.get<PaginatedResponse<Group>>(url);
  }

  /**
   * Get group by ID with optional includes
   */
  async getGroup(
    groupId: number,
    includes: {
      users?: boolean;
      roles?: boolean;
      permissions?: boolean;
      analytics?: boolean;
      parentGroups?: boolean;
      childGroups?: boolean;
    } = {}
  ): Promise<ApiResponse<Group>> {
    const params = new URLSearchParams();
    Object.entries(includes).forEach(([key, value]) => {
      if (value) params.append(`include_${key}`, 'true');
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.GROUP(groupId)}?${queryString}` 
      : RBAC_ENDPOINTS.GROUP(groupId);
    
    return rbacApiService.get<Group>(url);
  }

  /**
   * Create new group with validation
   */
  async createGroup(groupData: GroupCreate): Promise<ApiResponse<Group>> {
    return rbacApiService.post<Group>(RBAC_ENDPOINTS.GROUPS, groupData);
  }

  /**
   * Update existing group
   */
  async updateGroup(groupId: number, updates: GroupUpdate): Promise<ApiResponse<Group>> {
    return rbacApiService.put<Group>(RBAC_ENDPOINTS.GROUP(groupId), updates);
  }

  /**
   * Delete group with options
   */
  async deleteGroup(
    groupId: number,
    options: {
      transferUsersToGroup?: number;
      removeAllUsers?: boolean;
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
      ? `${RBAC_ENDPOINTS.GROUP(groupId)}?${queryString}`
      : RBAC_ENDPOINTS.GROUP(groupId);
    
    return rbacApiService.delete<void>(url);
  }

  // === User Management ===

  /**
   * Get group members
   */
  async getGroupMembers(
    groupId: number,
    pagination: GroupPagination = {},
    includeRoles = false
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams();
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    if (includeRoles) params.append('include_roles', 'true');
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.GROUP_MEMBERS(groupId)}?${queryString}`
      : RBAC_ENDPOINTS.GROUP_MEMBERS(groupId);
    
    return rbacApiService.get<PaginatedResponse<User>>(url);
  }

  /**
   * Add user to group
   */
  async addUserToGroup(assignment: GroupUserAssignment): Promise<ApiResponse<GroupMembership>> {
    return rbacApiService.post<GroupMembership>(
      RBAC_ENDPOINTS.GROUP_ADD_USER(assignment.groupId),
      {
        user_id: assignment.userId,
        is_owner: assignment.isOwner || false,
        can_invite: assignment.canInvite || false,
        expires_at: assignment.expiresAt || null
      }
    );
  }

  /**
   * Remove user from group
   */
  async removeUserFromGroup(groupId: number, userId: number): Promise<ApiResponse<void>> {
    return rbacApiService.post(RBAC_ENDPOINTS.GROUP_REMOVE_USER(groupId), {
      user_id: userId
    });
  }

  /**
   * Update user membership in group
   */
  async updateGroupMembership(
    groupId: number,
    userId: number,
    updates: {
      isOwner?: boolean;
      canInvite?: boolean;
      expiresAt?: string | null;
    }
  ): Promise<ApiResponse<GroupMembership>> {
    return rbacApiService.put(`${RBAC_ENDPOINTS.GROUP(groupId)}/members/${userId}`, {
      is_owner: updates.isOwner,
      can_invite: updates.canInvite,
      expires_at: updates.expiresAt
    });
  }

  /**
   * Get user's groups
   */
  async getUserGroups(
    userId: number,
    includeRoles = false,
    includeInherited = true
  ): Promise<ApiResponse<Group[]>> {
    const params = new URLSearchParams();
    if (includeRoles) params.append('include_roles', 'true');
    if (includeInherited) params.append('include_inherited', 'true');
    
    const queryString = params.toString();
    const url = queryString 
      ? `/rbac/users/${userId}/groups?${queryString}`
      : `/rbac/users/${userId}/groups`;
    
    return rbacApiService.get<Group[]>(url);
  }

  // === Role Management ===

  /**
   * Get group roles
   */
  async getGroupRoles(
    groupId: number,
    includeInherited = true,
    resourceType?: string,
    resourceId?: string
  ): Promise<ApiResponse<GroupWithRoles>> {
    const params = new URLSearchParams({
      include_inherited: includeInherited.toString()
    });
    if (resourceType) params.append('resource_type', resourceType);
    if (resourceId) params.append('resource_id', resourceId);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.GROUP_ROLES(groupId)}?${queryString}`
      : RBAC_ENDPOINTS.GROUP_ROLES(groupId);
    
    return rbacApiService.get<GroupWithRoles>(url);
  }

  /**
   * Assign role to group
   */
  async assignRoleToGroup(assignment: GroupRoleAssignment): Promise<ApiResponse<void>> {
    return rbacApiService.post(RBAC_ENDPOINTS.GROUP_ASSIGN_ROLE(assignment.groupId), {
      role_id: assignment.roleId,
      resource_type: assignment.resourceType || null,
      resource_id: assignment.resourceId || null,
      conditions: assignment.conditions || null,
      expires_at: assignment.expiresAt || null
    });
  }

  /**
   * Remove role from group
   */
  async removeRoleFromGroup(
    groupId: number,
    roleId: number,
    resourceType?: string,
    resourceId?: string
  ): Promise<ApiResponse<void>> {
    const params = new URLSearchParams();
    if (resourceType) params.append('resource_type', resourceType);
    if (resourceId) params.append('resource_id', resourceId);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.GROUP_REMOVE_ROLE(groupId)}?${queryString}`
      : RBAC_ENDPOINTS.GROUP_REMOVE_ROLE(groupId);
    
    return rbacApiService.post(url, { role_id: roleId });
  }

  /**
   * Get group's effective permissions
   */
  async getGroupEffectivePermissions(
    groupId: number,
    resourceType?: string,
    resourceId?: string,
    includeInherited = true
  ): Promise<ApiResponse<{
    permissions: Permission[];
    source: Record<string, 'direct' | 'inherited'>;
    conditions: Record<string, any>;
  }>> {
    const params = new URLSearchParams({
      include_inherited: includeInherited.toString()
    });
    if (resourceType) params.append('resource_type', resourceType);
    if (resourceId) params.append('resource_id', resourceId);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.GROUP(groupId)}/effective-permissions?${queryString}`
      : `${RBAC_ENDPOINTS.GROUP(groupId)}/effective-permissions`;
    
    return rbacApiService.get(url);
  }

  // === Group Hierarchy Management ===

  /**
   * Get group hierarchy
   */
  async getGroupHierarchy(rootGroupId?: number): Promise<ApiResponse<GroupHierarchy[]>> {
    const params = rootGroupId ? `?root_group_id=${rootGroupId}` : '';
    return rbacApiService.get<GroupHierarchy[]>(`${RBAC_ENDPOINTS.GROUPS}/hierarchy${params}`);
  }

  /**
   * Get parent groups
   */
  async getParentGroups(groupId: number): Promise<ApiResponse<Group[]>> {
    return rbacApiService.get<Group[]>(`${RBAC_ENDPOINTS.GROUP(groupId)}/parents`);
  }

  /**
   * Get child groups
   */
  async getChildGroups(groupId: number, includeDescendants = false): Promise<ApiResponse<Group[]>> {
    const params = includeDescendants ? '?include_descendants=true' : '';
    return rbacApiService.get<Group[]>(`${RBAC_ENDPOINTS.GROUP(groupId)}/children${params}`);
  }

  /**
   * Add parent group
   */
  async addParentGroup(childGroupId: number, parentGroupId: number): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUP(childGroupId)}/parents`, {
      parent_group_id: parentGroupId
    });
  }

  /**
   * Remove parent group
   */
  async removeParentGroup(childGroupId: number, parentGroupId: number): Promise<ApiResponse<void>> {
    return rbacApiService.delete(`${RBAC_ENDPOINTS.GROUP(childGroupId)}/parents/${parentGroupId}`);
  }

  // === Bulk Operations ===

  /**
   * Bulk create groups
   */
  async bulkCreateGroups(groups: GroupCreate[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
    created: Group[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/bulk-create`, { groups });
  }

  /**
   * Bulk update groups
   */
  async bulkUpdateGroups(updates: Array<{
    id: number;
    updates: GroupUpdate;
  }>): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
    updated: Group[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/bulk-update`, { updates });
  }

  /**
   * Bulk add users to groups
   */
  async bulkAddUsersToGroups(assignments: GroupUserAssignment[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/bulk-add-users`, { assignments });
  }

  /**
   * Bulk remove users from groups
   */
  async bulkRemoveUsersFromGroups(removals: Array<{
    groupId: number;
    userId: number;
  }>): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/bulk-remove-users`, { removals });
  }

  /**
   * Bulk assign roles to groups
   */
  async bulkAssignRolesToGroups(assignments: GroupRoleAssignment[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/bulk-assign-roles`, { assignments });
  }

  /**
   * Bulk remove roles from groups
   */
  async bulkRemoveRolesFromGroups(removals: Array<{
    groupId: number;
    roleId: number;
    resourceType?: string;
    resourceId?: string;
  }>): Promise<ApiResponse<{
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/bulk-remove-roles`, { removals });
  }

  // === Analytics and Reporting ===

  /**
   * Get group analytics
   */
  async getGroupAnalytics(
    groupId: number,
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<GroupAnalytics>> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.GROUP(groupId)}/analytics?${queryString}`
      : `${RBAC_ENDPOINTS.GROUP(groupId)}/analytics`;
    
    return rbacApiService.get<GroupAnalytics>(url);
  }

  /**
   * Get group usage statistics
   */
  async getGroupUsageStats(
    groupIds?: number[],
    groupBy: 'type' | 'department' | 'size' | 'activity' = 'type',
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<{
    totalGroups: number;
    activeGroups: number;
    totalMembers: number;
    avgGroupSize: number;
    groupStats: Array<{
      group: Group;
      memberCount: number;
      roleCount: number;
      activityScore: number;
      lastActivity: string;
    }>;
    distribution: Record<string, number>;
  }>> {
    const params = new URLSearchParams({ group_by: groupBy });
    if (groupIds?.length) {
      groupIds.forEach(id => params.append('group_ids', id.toString()));
    }
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    return rbacApiService.get(`${RBAC_ENDPOINTS.GROUPS}/usage-stats?${params.toString()}`);
  }

  /**
   * Get group access patterns
   */
  async getGroupAccessPatterns(
    groupId: number,
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<GroupAccessPattern[]>> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.GROUP(groupId)}/access-patterns?${queryString}`
      : `${RBAC_ENDPOINTS.GROUP(groupId)}/access-patterns`;
    
    return rbacApiService.get<GroupAccessPattern[]>(url);
  }

  // === Search and Discovery ===

  /**
   * Search groups with advanced filters
   */
  async searchGroups(query: {
    text?: string;
    types?: string[];
    departments?: string[];
    hasUsers?: boolean;
    hasRoles?: boolean;
    minMemberCount?: number;
    maxMemberCount?: number;
    createdBy?: number;
    lastActivity?: {
      start?: string;
      end?: string;
    };
  }): Promise<ApiResponse<Group[]>> {
    return rbacApiService.post<Group[]>(`${RBAC_ENDPOINTS.GROUPS}/search`, query);
  }

  /**
   * Discover similar groups
   */
  async discoverSimilarGroups(
    groupId: number,
    threshold = 0.8
  ): Promise<ApiResponse<Array<{
    group: Group;
    similarity: number;
    commonUsers: User[];
    commonRoles: Role[];
    differences: string[];
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.GROUP(groupId)}/similar?threshold=${threshold}`);
  }

  /**
   * Get group recommendations for user
   */
  async getGroupRecommendations(
    userId: number,
    context?: {
      department?: string;
      jobTitle?: string;
      currentGroups?: number[];
    }
  ): Promise<ApiResponse<Array<{
    group: Group;
    confidence: number;
    reasoning: string[];
    benefits: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/recommendations`, {
      user_id: userId,
      context: context || {}
    });
  }

  // === Templates and Presets ===

  /**
   * Get group templates
   */
  async getGroupTemplates(category?: string): Promise<ApiResponse<GroupTemplate[]>> {
    const params = category ? `?category=${category}` : '';
    return rbacApiService.get<GroupTemplate[]>(`${RBAC_ENDPOINTS.GROUPS}/templates${params}`);
  }

  /**
   * Create group template
   */
  async createGroupTemplate(template: GroupTemplate): Promise<ApiResponse<GroupTemplate>> {
    return rbacApiService.post<GroupTemplate>(`${RBAC_ENDPOINTS.GROUPS}/templates`, template);
  }

  /**
   * Apply group template
   */
  async applyGroupTemplate(
    templateId: number,
    targetName: string,
    customizations?: Partial<GroupCreate>
  ): Promise<ApiResponse<Group>> {
    return rbacApiService.post<Group>(`${RBAC_ENDPOINTS.GROUPS}/templates/${templateId}/apply`, {
      target_name: targetName,
      customizations: customizations || {}
    });
  }

  // === Import/Export ===

  /**
   * Export groups configuration
   */
  async exportGroups(
    groupIds?: number[],
    format: 'json' | 'csv' | 'xlsx' = 'json',
    includeUsers = false,
    includeRoles = false,
    includeHierarchy = true
  ): Promise<ApiResponse<GroupImportExport>> {
    const params = new URLSearchParams({
      format,
      include_users: includeUsers.toString(),
      include_roles: includeRoles.toString(),
      include_hierarchy: includeHierarchy.toString()
    });
    
    if (groupIds?.length) {
      groupIds.forEach(id => params.append('group_ids', id.toString()));
    }
    
    return rbacApiService.get<GroupImportExport>(`${RBAC_ENDPOINTS.GROUPS}/export?${params.toString()}`);
  }

  /**
   * Import groups configuration
   */
  async importGroups(
    importData: GroupImportExport,
    options: {
      overwriteExisting?: boolean;
      dryRun?: boolean;
      skipValidation?: boolean;
      preserveHierarchy?: boolean;
      autoAssignUsers?: boolean;
    } = {}
  ): Promise<ApiResponse<{
    imported: number;
    skipped: number;
    errors: string[];
    preview?: Group[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/import`, {
      data: importData,
      options
    });
  }

  // === Validation and Testing ===

  /**
   * Validate group configuration
   */
  async validateGroup(groupData: GroupCreate | GroupUpdate): Promise<ApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/validate`, groupData);
  }

  /**
   * Test group permissions
   */
  async testGroupPermissions(
    groupId: number,
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
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUP(groupId)}/test-permissions`, { test_cases: testCases });
  }

  // === Membership Management ===

  /**
   * Send group invitation
   */
  async sendGroupInvitation(
    groupId: number,
    invitations: Array<{
      email: string;
      message?: string;
      expiresAt?: string;
      isOwner?: boolean;
      canInvite?: boolean;
    }>
  ): Promise<ApiResponse<{
    sent: number;
    failed: number;
    errors: string[];
    invitations: Array<{
      email: string;
      invitationId: string;
      expiresAt: string;
    }>;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUP(groupId)}/invite`, { invitations });
  }

  /**
   * Accept group invitation
   */
  async acceptGroupInvitation(invitationId: string): Promise<ApiResponse<GroupMembership>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/invitations/${invitationId}/accept`, {});
  }

  /**
   * Decline group invitation
   */
  async declineGroupInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.GROUPS}/invitations/${invitationId}/decline`, {});
  }

  /**
   * Get pending invitations for group
   */
  async getGroupInvitations(groupId: number): Promise<ApiResponse<Array<{
    id: string;
    email: string;
    invitedBy: User;
    invitedAt: string;
    expiresAt: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.GROUP(groupId)}/invitations`);
  }
}

// Export singleton instance
export const groupService = new GroupService();
export default groupService;