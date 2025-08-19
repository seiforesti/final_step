// hooks/useRBAC.ts
import { createContext, useContext, useCallback } from "react";
import { User } from "../models/User";

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface RBACContextType {
  user: User | null;
  can: (
    action: string,
    resource: string,
    conditions?: Record<string, any>
  ) => boolean;
  canManageLabels: () => boolean;
  canApproveLabels: () => boolean;
  canReviewLabels: () => boolean;
  canViewLabels: () => boolean;
  canManageRBAC: () => boolean;
  canManageUsers: () => boolean;
  canManageRoles: () => boolean;
  canManagePermissions: () => boolean;
  canAssignRoles: () => boolean;
  canAssignPermissions: () => boolean;
  canViewAuditLogs: () => boolean;
  // Add loading states for AuthRoute
  isLoading: boolean;
  flatLoading: boolean;
}

const DEFAULT_CONTEXT: RBACContextType = {
  user: null,
  can: () => false,
  canManageLabels: () => false,
  canApproveLabels: () => false,
  canReviewLabels: () => false,
  canViewLabels: () => false,
  canManageRBAC: () => false,
  canManageUsers: () => false,
  canManageRoles: () => false,
  canManagePermissions: () => false,
  canAssignRoles: () => false,
  canAssignPermissions: () => false,
  canViewAuditLogs: () => false,
  isLoading: false,
  flatLoading: false,
};

export const RBACContext = createContext<RBACContextType>(DEFAULT_CONTEXT);

export function useRBAC() {
  const context = useContext(RBACContext);

  const canManageLabels = useCallback(() => {
    return context.can("manage", "sensitivity_labels");
  }, [context]);

  const canApproveLabels = useCallback(() => {
    return context.can("approve", "sensitivity_labels");
  }, [context]);

  const canReviewLabels = useCallback(() => {
    return context.can("review", "sensitivity_labels");
  }, [context]);

  const canViewLabels = useCallback(() => {
    return context.can("view", "sensitivity_labels");
  }, [context]);

  const canManageRBAC = useCallback(() => {
    return context.can("manage", "rbac");
  }, [context]);

  const canManageUsers = useCallback(() => {
    return context.can("manage", "users");
  }, [context]);

  const canManageRoles = useCallback(() => {
    return context.can("manage", "roles");
  }, [context]);

  const canManagePermissions = useCallback(() => {
    return context.can("manage", "permissions");
  }, [context]);

  const canAssignRoles = useCallback(() => {
    return context.can("assign", "roles");
  }, [context]);

  const canAssignPermissions = useCallback(() => {
    return context.can("assign", "permissions");
  }, [context]);

  const canViewAuditLogs = useCallback(() => {
    return context.can("view", "audit_logs");
  }, [context]);

  return {
    ...context,
    canManageLabels,
    canApproveLabels,
    canReviewLabels,
    canViewLabels,
    canManageRBAC,
    canManageUsers,
    canManageRoles,
    canManagePermissions,
    canAssignRoles,
    canAssignPermissions,
    canViewAuditLogs,
  };
}

export function hasRole(user: User | null, roles: string[]): boolean {
  if (!user || !user.roles) return false;
  // Support both array of strings and array of objects
  return user.roles.some((role: any) => {
    if (typeof role === "string") return roles.includes(role);
    if (role && typeof role === "object" && "name" in role)
      return roles.includes((role as { name: string }).name);
    return false;
  });
}

export function hasPermission(
  user: User | null,
  permission: Permission
): boolean {
  if (!user || !user.permissions) return false;

  return user.permissions.some((userPermission) => {
    // Defensive: unwrap if userPermission is a tuple or object
    if (Array.isArray(userPermission) && userPermission.length > 0) {
      userPermission = userPermission[0];
    }
    const actionMatch = userPermission.action === permission.action;
    const resourceMatch = userPermission.resource === permission.resource;

    if (!actionMatch || !resourceMatch) return false;

    if (permission.conditions && userPermission.conditions) {
      return Object.entries(permission.conditions).every(
        ([key, value]) =>
          userPermission.conditions && userPermission.conditions[key] === value
      );
    }

    return true;
  });
}
