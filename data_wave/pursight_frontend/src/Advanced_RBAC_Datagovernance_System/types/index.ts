// Types Index - Export all types for easy importing

export * from './auth.types';
export * from './user.types';
export * from './role.types';
export * from './permission.types';
export * from './group.types';

// Additional types that might be needed
export interface Resource {
  id: number;
  name: string;
  type: string;
  parent_id?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceTree {
  resource: Resource;
  children: ResourceTree[];
  level: number;
}

export interface RBACState {
  user: any;
  permissions: any[];
  roles: any[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RbacAuditLog {
  id: number;
  action: string;
  performed_by: string;
  target_user?: string;
  resource_type?: string;
  resource_id?: string;
  role?: string;
  timestamp: string;
  actor_ip?: string;
  details?: any;
}

export interface AccessRequest {
  id: number;
  user_id: number;
  resource_id: number;
  action: string;
  status: string;
  requested_at: string;
  approved_at?: string;
  approved_by?: number;
  reason?: string;
}

export interface PermissionMatrix {
  users: any[];
  permissions: any[];
  matrix: Array<{
    user_id: number;
    permission_id: number;
    has_permission: boolean;
    source: string;
    source_details?: string;
  }>;
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
    role?: any;
    group?: any;
    inheritance_chain?: any[];
  };
}


