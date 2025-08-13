// Role Management Types - Maps to backend auth_models.py Role model and role_service.py

export interface Role {
  id: number;
  name: string;
  description?: string;
  
  // Relationships
  users?: User[];
  permissions?: Permission[];
  parents?: Role[];
  children?: Role[];
}

export interface RoleCreate {
  name: string;
  description?: string;
}

export interface RoleUpdate {
  name?: string;
  description?: string;
}

export interface RoleInheritance {
  id: number;
  parent_role_id: number;
  child_role_id: number;
  parent_role?: Role;
  child_role?: Role;
}

export interface RolePermissionAssignment {
  id: number;
  role_id: number;
  permission_id: number;
  assigned_at?: string;
  assigned_by?: string;
}

export interface RoleHierarchy {
  role: Role;
  level: number;
  parents: Role[];
  children: Role[];
  all_ancestors: Role[];
  all_descendants: Role[];
}

export interface EffectivePermissions {
  role_id: number;
  direct_permissions: Permission[];
  inherited_permissions: Permission[];
  effective_permissions: Permission[];
  permission_sources: {
    permission: Permission;
    source: 'direct' | 'inherited';
    source_role?: Role;
  }[];
}

export interface RoleStats {
  total_roles: number;
  roles_with_users: number;
  roles_with_permissions: number;
  roles_with_inheritance: number;
  avg_permissions_per_role: number;
  avg_users_per_role: number;
  most_used_roles: {
    role: Role;
    user_count: number;
  }[];
}

export interface RoleFilters {
  search?: string;
  has_users?: boolean;
  has_permissions?: boolean;
  has_inheritance?: boolean;
  permission_id?: number;
  user_id?: number;
}

export interface RoleBulkAction {
  action: 'assign_permission' | 'remove_permission' | 'assign_to_users' | 'remove_from_users' | 'delete';
  role_ids: number[];
  parameters?: {
    permission_id?: number;
    user_ids?: number[];
  };
}

export interface RolePermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  matrix: {
    role_id: number;
    permission_id: number;
    has_permission: boolean;
    source: 'direct' | 'inherited';
    source_role?: Role;
  }[];
}

export interface RoleComparison {
  role1: Role;
  role2: Role;
  common_permissions: Permission[];
  role1_only_permissions: Permission[];
  role2_only_permissions: Permission[];
  permission_differences: {
    permission: Permission;
    in_role1: boolean;
    in_role2: boolean;
  }[];
}

export interface RoleValidation {
  role: Role;
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface RoleAuditTrail {
  role_id: number;
  changes: {
    id: number;
    action: string;
    field?: string;
    old_value?: any;
    new_value?: any;
    changed_by: string;
    changed_at: string;
    reason?: string;
  }[];
}

export interface RoleTemplate {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  category: string;
  is_builtin: boolean;
}

export interface RoleConflict {
  type: 'circular_inheritance' | 'permission_conflict' | 'naming_conflict';
  description: string;
  affected_roles: Role[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_suggestions: string[];
}

export interface RoleUsage {
  role: Role;
  user_count: number;
  group_count: number;
  resource_assignments: number;
  last_used: string;
  usage_trend: 'increasing' | 'decreasing' | 'stable';
}

// Import related types
import type { User } from './user.types';
import type { Permission } from './permission.types';