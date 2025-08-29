// Authentication and authorization types aligned with backend models

export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
  organization?: Organization;
  profile?: UserProfile;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  settings?: OrganizationSettings;
}

export interface OrganizationSettings {
  id: string;
  organization_id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  department?: string;
  job_title?: string;
  phone_number?: string;
  timezone?: string;
  language?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role: Role;
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  parent_group_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
  permissions?: Permission[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user: User;
  role: MemberRole;
  joined_at: string;
  is_active: boolean;
}

export enum GroupType {
  DEPARTMENT = 'department',
  PROJECT = 'project',
  TEAM = 'team',
  CUSTOM = 'custom',
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: string;
  last_activity_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  roles: Role[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
  expires_in: number;
  permissions: string[];
  roles: Role[];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirm_password: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface MFASetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface MFAVerification {
  token: string;
  code: string;
}

// RBAC specific types
export interface AccessRequest {
  id: string;
  requester_id: string;
  requester: User;
  resource_type: string;
  resource_id: string;
  permission_requested: string;
  justification: string;
  status: AccessRequestStatus;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer?: User;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export enum AccessRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user?: User;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  status: AuditStatus;
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
}

export interface SecurityControl {
  id: string;
  name: string;
  description?: string;
  type: SecurityControlType;
  configuration: Record<string, any>;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export enum SecurityControlType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  ENCRYPTION = 'encryption',
  MONITORING = 'monitoring',
  COMPLIANCE = 'compliance',
}

// Permission checking utilities
export interface PermissionCheck {
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface RoleAssignment {
  role_id: string;
  user_id: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface GroupAssignment {
  group_id: string;
  user_id: string;
  role: MemberRole;
}

// Context for permission evaluation
export interface PermissionContext {
  user_id: string;
  organization_id?: string;
  resource_owner_id?: string;
  resource_metadata?: Record<string, any>;
  request_metadata?: Record<string, any>;
}