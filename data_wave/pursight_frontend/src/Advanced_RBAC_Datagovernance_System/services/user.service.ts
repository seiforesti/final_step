// User Management Service - Maps to backend rbac_routes.py user endpoints

import { rbacApiService, ApiResponse, PaginatedResponse } from './rbac-api.service';
import { RBAC_ENDPOINTS } from '../constants/api.constants';
import type {
  User,
  UserCreate,
  UserUpdate,
  UserFilters,
  UserBulkAction,
  UserStats,
  UserPermissionView,
  UserActivity
} from '../types/user.types';

export class UserService {
  // User CRUD operations
  async getUsers(filters?: UserFilters): Promise<ApiResponse<PaginatedResponse<User>>> {
    const queryString = filters ? rbacApiService.buildQueryString(filters) : '';
    return rbacApiService.get<PaginatedResponse<User>>(`${RBAC_ENDPOINTS.USERS}${queryString}`);
  }

  async getUser(userId: number): Promise<ApiResponse<User>> {
    return rbacApiService.get<User>(`${RBAC_ENDPOINTS.USERS}/${userId}`);
  }

  async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
    return rbacApiService.post<User>(RBAC_ENDPOINTS.USERS, userData);
  }

  async updateUser(userId: number, userData: UserUpdate): Promise<ApiResponse<User>> {
    return rbacApiService.patch<User>(`${RBAC_ENDPOINTS.USERS}/${userId}`, userData);
  }

  async deleteUser(userId: number): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.delete<{ success: boolean }>(`${RBAC_ENDPOINTS.USERS}/${userId}`);
  }

  // User activation/deactivation
  async activateUser(userId: number): Promise<ApiResponse<User>> {
    return rbacApiService.post<User>(RBAC_ENDPOINTS.USER_ACTIVATE(userId));
  }

  async deactivateUser(userId: number): Promise<ApiResponse<User>> {
    return rbacApiService.post<User>(RBAC_ENDPOINTS.USER_DEACTIVATE(userId));
  }

  async reactivateUser(userId: number): Promise<ApiResponse<User>> {
    return rbacApiService.post<User>(RBAC_ENDPOINTS.USER_REACTIVATE(userId));
  }

  // Role management
  async assignRoleToUser(userId: number, roleId: number): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>(`${RBAC_ENDPOINTS.USERS}/${userId}/assign-role`, {
      role_id: roleId
    });
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>(RBAC_ENDPOINTS.USER_REMOVE_ROLE(userId), {
      role_id: roleId
    });
  }

  async getUserRoles(userId: number): Promise<ApiResponse<any[]>> {
    return rbacApiService.get<any[]>(`${RBAC_ENDPOINTS.USERS}/${userId}/roles`);
  }

  // Permission management
  async getUserPermissions(userId: number): Promise<ApiResponse<UserPermissionView>> {
    return rbacApiService.get<UserPermissionView>(`${RBAC_ENDPOINTS.USERS}/${userId}/permissions`);
  }

  async getUserEffectivePermissions(userId: number): Promise<ApiResponse<string[]>> {
    return rbacApiService.get<string[]>(RBAC_ENDPOINTS.USER_EFFECTIVE_PERMISSIONS_V2(userId));
  }

  // Bulk operations
  async bulkAssignRoles(userIds: number[], roleIds: number[]): Promise<ApiResponse<{ success: boolean; updated_count: number }>> {
    return rbacApiService.post<{ success: boolean; updated_count: number }>(
      RBAC_ENDPOINTS.USERS_BULK_ASSIGN_ROLES_EFFICIENT,
      { user_ids: userIds, role_ids: roleIds }
    );
  }

  async bulkRemoveRoles(userIds: number[], roleIds: number[]): Promise<ApiResponse<{ success: boolean; updated_count: number }>> {
    return rbacApiService.post<{ success: boolean; updated_count: number }>(
      RBAC_ENDPOINTS.USERS_BULK_REMOVE_ROLES_EFFICIENT,
      { user_ids: userIds, role_ids: roleIds }
    );
  }

  async bulkAction(action: UserBulkAction): Promise<ApiResponse<{ success: boolean; affected_count: number }>> {
    const endpoint = action.action === 'assign_role' || action.action === 'remove_role' 
      ? '/rbac/users/bulk-role-action'
      : '/rbac/users/bulk-action';
    
    return rbacApiService.post<{ success: boolean; affected_count: number }>(endpoint, action);
  }

  // User statistics
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return rbacApiService.get<UserStats>('/rbac/users/stats');
  }

  // User activity
  async getUserActivity(userId: number, limit?: number): Promise<ApiResponse<UserActivity[]>> {
    const queryString = limit ? rbacApiService.buildQueryString({ limit }) : '';
    return rbacApiService.get<UserActivity[]>(`${RBAC_ENDPOINTS.USERS}/${userId}/activity${queryString}`);
  }

  // User invitations
  async inviteUser(email: string, roleId: number, message?: string): Promise<ApiResponse<{ success: boolean; invite_token: string }>> {
    return rbacApiService.post<{ success: boolean; invite_token: string }>('/rbac/users/invite', {
      email,
      role_id: roleId,
      message
    });
  }

  async resendInvite(inviteToken: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>('/rbac/users/resend-invite', {
      invite_token: inviteToken
    });
  }

  async cancelInvite(inviteToken: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.delete<{ success: boolean }>(`/rbac/users/invites/${inviteToken}`);
  }

  // User search
  async searchUsers(query: string, filters?: Partial<UserFilters>): Promise<ApiResponse<User[]>> {
    const searchParams = { search: query, ...filters };
    const queryString = rbacApiService.buildQueryString(searchParams);
    return rbacApiService.get<User[]>(`/rbac/users/search${queryString}`);
  }

  // User export
  async exportUsers(filters?: UserFilters, format: 'csv' | 'json' | 'excel' = 'csv'): Promise<void> {
    const queryString = rbacApiService.buildQueryString({ ...filters, format });
    await rbacApiService.download(`/rbac/users/export${queryString}`, `users.${format}`);
  }

  // User groups
  async getUserGroups(userId: number): Promise<ApiResponse<any[]>> {
    return rbacApiService.get<any[]>(`${RBAC_ENDPOINTS.USERS}/${userId}/groups`);
  }

  async addUserToGroup(userId: number, groupId: number): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>(`${RBAC_ENDPOINTS.USERS}/${userId}/groups`, {
      group_id: groupId
    });
  }

  async removeUserFromGroup(userId: number, groupId: number): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.delete<{ success: boolean }>(`${RBAC_ENDPOINTS.USERS}/${userId}/groups/${groupId}`);
  }

  // User preferences
  async getUserPreferences(userId: number): Promise<ApiResponse<Record<string, any>>> {
    return rbacApiService.get<Record<string, any>>(`${RBAC_ENDPOINTS.USERS}/${userId}/preferences`);
  }

  async updateUserPreferences(userId: number, preferences: Record<string, any>): Promise<ApiResponse<Record<string, any>>> {
    return rbacApiService.patch<Record<string, any>>(`${RBAC_ENDPOINTS.USERS}/${userId}/preferences`, preferences);
  }

  // User sessions
  async getUserSessions(userId: number): Promise<ApiResponse<any[]>> {
    return rbacApiService.get<any[]>(`${RBAC_ENDPOINTS.USERS}/${userId}/sessions`);
  }

  async revokeUserSession(userId: number, sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.delete<{ success: boolean }>(`${RBAC_ENDPOINTS.USERS}/${userId}/sessions/${sessionId}`);
  }

  async revokeAllUserSessions(userId: number): Promise<ApiResponse<{ revoked_count: number }>> {
    return rbacApiService.post<{ revoked_count: number }>(`${RBAC_ENDPOINTS.USERS}/${userId}/revoke-all-sessions`);
  }

  // User validation
  async validateUserEmail(email: string): Promise<ApiResponse<{ available: boolean; suggestions?: string[] }>> {
    return rbacApiService.post<{ available: boolean; suggestions?: string[] }>('/rbac/users/validate-email', {
      email
    });
  }

  async checkUserExists(email: string): Promise<ApiResponse<{ exists: boolean; user_id?: number }>> {
    return rbacApiService.post<{ exists: boolean; user_id?: number }>('/rbac/users/check-exists', {
      email
    });
  }

  // User impersonation (admin only)
  async impersonateUser(userId: number): Promise<ApiResponse<{ impersonation_token: string }>> {
    return rbacApiService.post<{ impersonation_token: string }>(`${RBAC_ENDPOINTS.USERS}/${userId}/impersonate`);
  }

  async stopImpersonation(): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>('/rbac/users/stop-impersonation');
  }
}

// Create singleton instance
export const userService = new UserService();