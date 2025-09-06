import React, { useMemo } from "react";
import { RBACContext } from "../hooks/useRBAC";
import { useRbacMe } from "../rbac/useRbacMe";
import { useRBACFlatPermissions } from "../hooks/useRBACPermissions";
import { useLocation, useNavigate } from "react-router-dom";

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Only fetch RBAC data if not on signin page
  const shouldFetchRBAC = location.pathname !== "/signin";
  
  const { data, isLoading, error } = useRbacMe(shouldFetchRBAC);
  const {
    data: flatPermissions,
    isLoading: flatLoading,
    error: flatError,
  } = useRBACFlatPermissions(shouldFetchRBAC);

  // Debug logging
  console.log("RBACProvider:", {
    location: location.pathname,
    data,
    isLoading,
    error,
    flatPermissions,
    flatLoading,
    flatError,
  });

  // Convert RbacMe to User shape expected by context
  const user = data
    ? {
        id: String(data.id),
        username: data.username || data.email || String(data.id),
        email: data.email,
        displayName: data.email,
        roles: Array.isArray(data.roles)
          ? data.roles.map((r: any) =>
              typeof r === "string"
                ? {
                    id: r,
                    name: r,
                    description: undefined,
                    isBuiltIn: false,
                    permissions: [],
                    createdAt: "",
                    updatedAt: "",
                  }
                : typeof r === "object" && r !== null && "name" in r
                ? {
                    id: r.id || r.name,
                    name: r.name,
                    description: r.description,
                    isBuiltIn: false,
                    permissions: [],
                    createdAt: "",
                    updatedAt: "",
                  }
                : {
                    id: String(r),
                    name: String(r),
                    description: undefined,
                    isBuiltIn: false,
                    permissions: [],
                    createdAt: "",
                    updatedAt: "",
                  }
            )
          : [],
        permissions: Array.isArray(data.permissions)
          ? data.permissions
              .map((p: any) =>
                p && typeof p === "object" && "action" in p && "resource" in p
                  ? {
                      id: p.id || `${p.resource}.${p.action}`,
                      action: p.action,
                      resource: p.resource,
                      key: p.key || `${p.resource}.${p.action}`,
                      name: p.name || `${p.resource}.${p.action}`,
                      category: p.category || "",
                      isBuiltIn: false,
                      description: p.description || "",
                      createdAt: p.createdAt || "",
                      updatedAt: p.updatedAt || "",
                    }
                  : undefined
              )
              .filter(
                (
                  p: any
                ): p is {
                  id: string;
                  action: string;
                  resource: string;
                  key: string;
                  name: string;
                  category: string;
                  isBuiltIn: boolean;
                  description: string;
                  createdAt: string;
                  updatedAt: string;
                } => !!p
              )
          : [],
        flatPermissions: Array.isArray(flatPermissions) ? flatPermissions : [],
        isActive: true,
        createdAt: "",
        updatedAt: "",
      }
    : null;

  // Helper to check if user has a role by name
  const hasRole = (roleName: string) =>
    user?.roles?.some((r) => r.name === roleName);

  // The core permission check (flat array)
  const hasFlatPermission = (perm: string) => {
    if (!user) return false;
    if (hasRole("admin")) return true;
    return (
      Array.isArray(user.flatPermissions) && user.flatPermissions.includes(perm)
    );
  };

  // The core permission check (old style)
  const can = (
    action: string,
    resource: string,
    conditions?: Record<string, any>
  ) => {
    if (!user) return false;
    if (hasRole("admin")) return true;
    if (!Array.isArray(user.permissions)) return false;
    return user.permissions.some(
      (p) => p && p.action === action && p.resource === resource
    );
  };

  // Memoize context value for performance
  const value = useMemo(
    () => ({
      user,
      can,
      hasFlatPermission,
      canManageLabels: () => can("manage", "sensitivity_labels"),
      canApproveLabels: () => can("approve", "sensitivity_labels"),
      canReviewLabels: () => can("review", "sensitivity_labels"),
      canViewLabels: () => can("view", "sensitivity_labels"),
      canManageRBAC: () => can("manage", "rbac"),
      canManageUsers: () => can("manage", "users"),
      canManageRoles: () => can("manage", "roles"),
      canManagePermissions: () => can("manage", "permissions"),
      canAssignRoles: () => can("assign", "roles"),
      canAssignPermissions: () => can("assign", "permissions"),
      canViewAuditLogs: () => can("view", "audit_logs"),
      isLoading,
      flatLoading,
    }),
    [user, isLoading, flatLoading]
  );

  // Now do conditional rendering
  if (location.pathname === "/signin") {
    return <>{children}</>;
  }
  
  // If RBAC is disabled (on signin page), just render children
  if (!shouldFetchRBAC) {
    return <>{children}</>;
  }
  
  if (
    error &&
    (error as any).response &&
    (error as any).response.status === 401
  ) {
    navigate("/signin", { replace: true });
    return null;
  }
  if (isLoading || flatLoading) return <div>Loading RBAC context...</div>;
  if (error || flatError) return <div>Failed to load RBAC context</div>;

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}
