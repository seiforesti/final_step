// Resource Hierarchy Types - Maps to backend auth_models.py Resource model and resource_service.py

export interface Resource {
  id: number;
  name: string;
  type: string; // 'data_source', 'database', 'schema', 'table', 'collection', etc.
  parent_id?: number;
  engine?: string;
  details?: Record<string, any>;
  
  // Relationships
  parent?: Resource;
  children?: Resource[];
}

export interface ResourceCreate {
  name: string;
  type: string;
  parent_id?: number;
  engine?: string;
  details?: Record<string, any>;
}

export interface ResourceUpdate {
  name?: string;
  engine?: string;
  details?: Record<string, any>;
}

export interface ResourceTree {
  resource: Resource;
  level: number;
  children: ResourceTree[];
  path: string[];
  ancestors: Resource[];
}

export interface ResourceHierarchy {
  data_source: Resource[];
  databases: Resource[];
  schemas: Resource[];
  tables: Resource[];
}

export interface ResourceRole {
  id: number;
  user_id: number;
  role_id: number;
  resource_type: string;
  resource_id: number;
  assigned_at: string;
  assigned_by?: string;
  
  // Populated relationships
  user?: User;
  role?: Role;
  resource?: Resource;
}

export interface ResourceRoleAssignment {
  user_id: number;
  role_id: number;
  resource_id: number;
  resource_type?: string;
}

export interface ResourcePermission {
  resource: Resource;
  permissions: Permission[];
  inherited_permissions: Permission[];
  effective_permissions: Permission[];
  user_permissions: {
    user: User;
    permissions: Permission[];
    source: 'direct' | 'role' | 'group' | 'inherited';
  }[];
}

export interface ResourceStats {
  total_resources: number;
  resources_by_type: Record<string, number>;
  resources_with_roles: number;
  resources_with_permissions: number;
  max_depth: number;
  avg_children_per_resource: number;
  orphaned_resources: number;
}

export interface ResourceFilters {
  search?: string;
  type?: string;
  engine?: string;
  parent_id?: number;
  has_children?: boolean;
  has_roles?: boolean;
  has_permissions?: boolean;
  data_source_id?: number;
}

export interface ResourceBulkAction {
  action: 'assign_role' | 'remove_role' | 'move' | 'delete' | 'update_details';
  resource_ids: number[];
  parameters?: {
    user_id?: number;
    role_id?: number;
    new_parent_id?: number;
    details?: Record<string, any>;
  };
}

export interface ResourceValidation {
  resource: Resource;
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  hierarchy_issues?: {
    circular_references: boolean;
    orphaned_children: Resource[];
    invalid_parent_type: boolean;
  };
}

export interface ResourceUsage {
  resource: Resource;
  role_assignments: number;
  permission_grants: number;
  user_access_count: number;
  last_accessed: string;
  access_frequency: number;
  usage_trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ResourceAuditTrail {
  resource_id: number;
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

// Data Source Integration Types
export interface DataSourceResource {
  resource: Resource;
  data_source_id: number;
  data_source_name: string;
  host: string;
  port: number;
  database_name?: string;
  environment?: string;
  criticality?: string;
  owner?: string;
  team?: string;
  tags?: string[];
  cloud_provider?: string;
  last_synced: string;
}

export interface DataSourceSync {
  status: 'success' | 'error' | 'partial';
  synced_count: number;
  updated_count: number;
  total_data_sources: number;
  synced_resources: {
    id: number;
    name: string;
    type: string;
  }[];
  updated_resources: {
    id: number;
    name: string;
    type: string;
  }[];
  errors?: string[];
}

export interface SchemaResourceRequest {
  schemas: string[];
}

export interface TableResourceRequest {
  tables: string[];
}

export interface ResourceDiscovery {
  data_source_id: number;
  discovered_schemas: string[];
  discovered_tables: {
    schema: string;
    tables: string[];
  }[];
  discovery_timestamp: string;
  discovery_method: 'manual' | 'automatic' | 'scheduled';
}

export interface ResourceAccess {
  resource: Resource;
  user: User;
  access_type: 'read' | 'write' | 'admin';
  granted_via: 'direct' | 'role' | 'group' | 'inherited';
  granted_by?: string;
  granted_at: string;
  conditions?: Record<string, any>;
  is_active: boolean;
}

export interface ResourcePath {
  resource_id: number;
  path: Resource[];
  full_path: string;
  depth: number;
}

export interface ResourceConflict {
  type: 'naming_conflict' | 'hierarchy_conflict' | 'permission_conflict';
  description: string;
  resources: Resource[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_suggestions: string[];
}

export interface ResourceTemplate {
  id: number;
  name: string;
  description: string;
  resource_type: string;
  template_structure: {
    name: string;
    type: string;
    children?: ResourceTemplate[];
  };
  default_permissions: Permission[];
  category: string;
  is_builtin: boolean;
}

export interface ResourceMetadata {
  resource_id: number;
  metadata: {
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    source: 'manual' | 'discovered' | 'inherited';
    last_updated: string;
  }[];
}

// Import related types
import type { User } from './user.types';
import type { Role } from './role.types';
import type { Permission } from './permission.types';