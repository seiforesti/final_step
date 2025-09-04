// Permission System Types - Maps to backend auth_models.py Permission model

export interface Permission {
  id: number;
  action: string;
  resource: string;
  conditions?: string; // JSON string for ABAC conditions
  
  // Relationships
  roles?: Role[];
}

export interface PermissionCreate {
  action: string;
  resource: string;
  conditions?: string;
}

export interface PermissionUpdate {
  action?: string;
  resource?: string;
  conditions?: string;
}

export interface PermissionWithRoles {
  id: number;
  action: string;
  resource: string;
  conditions?: string;
  roles: {
    id: number;
    name: string;
    description?: string;
  }[];
}

export interface EffectivePermission {
  id: number;
  action: string;
  resource: string;
  conditions?: string;
  is_effective: boolean;
  note?: string;
  source: 'direct' | 'role' | 'group' | 'inherited';
  source_details?: {
    role?: Role;
    group?: Group;
    inheritance_chain?: Role[];
  };
}

export interface PermissionCheck {
  user_id: number;
  action: string;
  resource: string;
  conditions?: Record<string, any>;
  allowed: boolean;
  reason?: string;
  evaluated_conditions?: {
    condition: string;
    result: boolean;
    details?: string;
  }[];
}

export interface PermissionMatrix {
  users: User[];
  permissions: Permission[];
  matrix: {
    user_id: number;
    permission_id: number;
    has_permission: boolean;
    source: 'direct' | 'role' | 'group' | 'inherited';
    source_details?: string;
  }[];
}

export interface PermissionStats {
  total_permissions: number;
  permissions_with_conditions: number;
  permissions_by_action: Record<string, number>;
  permissions_by_resource: Record<string, number>;
  most_assigned_permissions: {
    permission: Permission;
    assignment_count: number;
  }[];
  unused_permissions: Permission[];
}

export interface PermissionFilters {
  search?: string;
  action?: string;
  resource?: string;
  has_conditions?: boolean;
  role_id?: number;
  user_id?: number;
  is_effective?: boolean;
}

export interface PermissionBulkAction {
  action: 'assign_to_roles' | 'remove_from_roles' | 'update_conditions' | 'delete';
  permission_ids: number[];
  parameters?: {
    role_ids?: number[];
    conditions?: string;
  };
}

export interface PermissionDiff {
  added: {
    action: string;
    resource: string;
    change: 'added';
  }[];
  removed: {
    action: string;
    resource: string;
    change: 'removed';
  }[];
  unchanged: {
    action: string;
    resource: string;
    change: 'unchanged';
  }[];
}

export interface PermissionConflict {
  type: 'duplicate' | 'contradictory' | 'overlapping';
  description: string;
  permissions: Permission[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_suggestions: string[];
}

export interface PermissionUsage {
  permission: Permission;
  role_count: number;
  user_count: number;
  group_count: number;
  last_used: string;
  usage_frequency: number;
  usage_trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PermissionTemplate {
  id: number;
  name: string;
  description: string;
  permissions: PermissionCreate[];
  category: string;
  is_builtin: boolean;
}

export interface PermissionValidation {
  permission: Permission;
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  condition_validation?: {
    is_valid: boolean;
    syntax_errors: string[];
    semantic_errors: string[];
    test_results?: {
      test_case: Record<string, any>;
      result: boolean;
      explanation: string;
    }[];
  };
}

export interface PermissionAuditTrail {
  permission_id: number;
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

export interface PermissionGroup {
  name: string;
  description: string;
  permissions: Permission[];
  color?: string;
  icon?: string;
}

export interface PermissionScope {
  resource_type: string;
  resource_id?: string;
  actions: string[];
  conditions?: Record<string, any>;
  inherited: boolean;
  source?: string;
}

// Import related types
import type { Role } from './role.types';
import type { User } from './user.types';
import type { Group } from './group.types';