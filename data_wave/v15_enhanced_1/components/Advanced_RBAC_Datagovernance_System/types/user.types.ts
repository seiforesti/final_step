// User Management Types - Maps to backend auth_models.py User model

export interface User {
  id: number;
  email: string;
  hashed_password?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  mfa_enabled: boolean;
  mfa_secret?: string;
  role: string;
  
  // Enhanced profile fields
  first_name?: string;
  last_name?: string;
  display_name?: string;
  profile_picture_url?: string;
  birthday?: string;
  phone_number?: string;
  department?: string;
  region?: string;
  oauth_provider?: 'google' | 'microsoft' | 'email';
  oauth_id?: string;
  last_login?: string;
  timezone?: string;
  
  // Relationships
  roles?: Role[];
  groups?: Group[];
  sessions?: Session[];
  effective_roles?: Role[];
  permissions?: Permission[];
  flatPermissions?: string[];
}

export interface UserCreate {
  email: string;
  password?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  profile_picture_url?: string;
  birthday?: string;
  phone_number?: string;
  department?: string;
  region?: string;
  timezone?: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  profile_picture_url?: string;
  birthday?: string;
  phone_number?: string;
  department?: string;
  region?: string;
  timezone?: string;
  is_active?: boolean;
  mfa_enabled?: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  profile_picture_url?: string;
  birthday?: string;
  phone_number?: string;
  department?: string;
  region?: string;
  timezone?: string;
  oauth_provider?: string;
  last_login?: string;
  created_at: string;
}

export interface UserRoleAssignment {
  user_id: number;
  role_id: number;
  assigned_at: string;
  assigned_by: string;
}

export interface UserGroupMembership {
  user_id: number;
  group_id: number;
  joined_at: string;
  added_by: string;
}

export interface UserPermissionView {
  user_id: number;
  direct_permissions: Permission[];
  inherited_permissions: Permission[];
  effective_permissions: Permission[];
  role_permissions: {
    role: Role;
    permissions: Permission[];
  }[];
  group_permissions: {
    group: Group;
    permissions: Permission[];
  }[];
}

export interface UserActivity {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  mfa_enabled_users: number;
  oauth_users: number;
  recent_logins: number;
  users_by_role: Record<string, number>;
  users_by_department: Record<string, number>;
  users_by_region: Record<string, number>;
}

export interface UserFilters {
  search?: string;
  role?: string;
  department?: string;
  region?: string;
  is_active?: boolean;
  is_verified?: boolean;
  mfa_enabled?: boolean;
  oauth_provider?: string;
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  last_login_before?: string;
}

export interface UserBulkAction {
  action: 'activate' | 'deactivate' | 'assign_role' | 'remove_role' | 'add_to_group' | 'remove_from_group' | 'delete';
  user_ids: number[];
  parameters?: {
    role_id?: number;
    group_id?: number;
  };
}

export interface UserInvite {
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  token: string;
  message?: string;
}

// Import related types to avoid circular dependencies
import type { Role } from './role.types';
import type { Group } from './group.types';
import type { Permission } from './permission.types';
import type { Session } from './auth.types';