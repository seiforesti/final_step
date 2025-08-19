// Group Management Types - Maps to backend auth_models.py Group model

export interface Group {
  id: number;
  name: string;
  description?: string;
  users?: User[];
  roles?: GroupRole[];
}

export interface GroupRole {
  id: number;
  group_id: number;
  role_id: number;
  resource_type?: string;
  resource_id?: string;
  assigned_at: string;
  role?: Role;
}

export interface GroupCreate {
  name: string;
  description?: string;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
}

export interface GroupMember {
  user: User;
  joined_at: string;
  added_by: string;
}

export interface GroupStats {
  total_groups: number;
  groups_with_users: number;
  groups_with_roles: number;
  avg_users_per_group: number;
  avg_roles_per_group: number;
}

export interface GroupFilters {
  search?: string;
  has_users?: boolean;
  has_roles?: boolean;
  user_id?: number;
  role_id?: number;
}

// Import related types
import type { User } from './user.types';
import type { Role } from './role.types';