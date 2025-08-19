// Table Permissions model
export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserPermission {
  userId: string;
  userName: string;
  email: string;
  avatarUrl?: string;
  roles: UserRole[];
  directPermissions: string[];
  inheritedFrom?: {
    resourceType: string;
    resourceName: string;
    resourceId: string;
  }[];
  lastModified: string;
  modifiedBy: string;
}

export interface GroupPermission {
  groupId: string;
  groupName: string;
  members: number;
  roles: UserRole[];
  directPermissions: string[];
  inheritedFrom?: {
    resourceType: string;
    resourceName: string;
    resourceId: string;
  }[];
  lastModified: string;
  modifiedBy: string;
}

export interface PermissionSummary {
  resourceType: string;
  resourceId: string;
  resourceName: string;
  ownerType: 'user' | 'group';
  ownerId: string;
  ownerName: string;
  inheritanceEnabled: boolean;
  lastModified: string;
  modifiedBy: string;
}

export interface TablePermissionsData {
  summary: PermissionSummary;
  users: UserPermission[];
  groups: GroupPermission[];
  availableRoles: UserRole[];
  availablePermissions: string[];
}