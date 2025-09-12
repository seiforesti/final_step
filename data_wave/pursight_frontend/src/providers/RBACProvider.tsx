import React, { useEffect, useMemo } from "react";
import { RBACContext } from "../hooks/useRBAC";
import { useRbacMe } from "../rbac/useRbacMe";
import { useRBACFlatPermissions } from "../hooks/useRBACPermissions";
import { useLocation, useNavigate } from "react-router-dom";

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Session-scoped cache keys
  const RBAC_ME_KEY = "rbac:me";
  const RBAC_FLAT_KEY = "rbac:flat";
  const RBAC_SESSION_ID_KEY = "rbac:session-id";
  
  const getSessionId = () => {
    try {
      if (typeof window === "undefined") return "default-session";
      // Prefer stable auth token (persists across backend restarts)
      const token = (window.localStorage.getItem("authToken") || window.localStorage.getItem("auth_token") || "").trim();
      if (token) return `auth:${token.slice(0,16)}`; // avoid storing full token
      // Fallback to session token if present
      const sessionToken = (window.sessionStorage.getItem("sessionToken") || "").trim();
      return sessionToken ? `session:${sessionToken.slice(0,16)}` : "default-session";
    } catch {
      return "default-session";
    }
  };
  
  const readCached = <T,>(key: string): T | null => {
    try {
      if (typeof window === "undefined") return null;
      const raw = window.sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };
  
  const persist = (key: string, value: any) => {
    try {
      if (typeof window === "undefined") return;
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  };
  
  const cachedMe = readCached<any>(RBAC_ME_KEY);
  const cachedFlat = readCached<string[]>(RBAC_FLAT_KEY) || [];
  const cachedSessionId = typeof window !== "undefined" ? window.sessionStorage.getItem(RBAC_SESSION_ID_KEY) : null;
  const currentSessionId = getSessionId();
  
  // Only fetch RBAC data if not on signin page.
  // Consider cache usable if we have any cached user AND session id matches current auth context.
  // If session id changed but we still have cached user, we will still render using cache while fetching in background.
  const hasFreshCache = Boolean(cachedMe) && cachedSessionId === currentSessionId;
  // const hasAnyCache = Boolean(cachedMe) || (Array.isArray(cachedFlat) && cachedFlat.length > 0);
  const shouldFetchRBAC = location.pathname !== "/signin" && (!hasFreshCache);
  
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

  // Persist on success
  useEffect(() => {
    if (data) {
      persist(RBAC_ME_KEY, data);
      try { if (typeof window !== "undefined") window.sessionStorage.setItem(RBAC_SESSION_ID_KEY, currentSessionId); } catch {}
    }
  }, [data, currentSessionId]);
  
  useEffect(() => {
    if (flatPermissions && Array.isArray(flatPermissions)) {
      persist(RBAC_FLAT_KEY, flatPermissions);
    }
  }, [flatPermissions]);

  // Convert RbacMe to User shape expected by context
  // Always prefer live data; otherwise, fall back to any cached values to avoid false Access Denied during backend restarts
  const effectiveMe = data ?? cachedMe ?? null;
  const effectiveFlat = (flatPermissions && Array.isArray(flatPermissions)) ? flatPermissions : cachedFlat;
  
  const user = effectiveMe
    ? {
        id: String(effectiveMe.id),
        username: effectiveMe.username || effectiveMe.email || String(effectiveMe.id),
        email: effectiveMe.email,
        displayName: effectiveMe.email,
        roles: Array.isArray(effectiveMe.roles)
          ? (effectiveMe.roles as unknown[]).map((r: unknown): {
              id: string;
              name: string;
              description?: string | undefined;
              isBuiltIn: boolean;
              permissions: any[];
              createdAt: string;
              updatedAt: string;
            } =>
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
                    id: (r as any).id || (r as any).name,
                    name: (r as any).name,
                    description: (r as any).description,
                    isBuiltIn: false,
                    permissions: [],
                    createdAt: "",
                    updatedAt: "",
                  }
                : {
                    id: String(r as any),
                    name: String(r as any),
                    description: undefined,
                    isBuiltIn: false,
                    permissions: [],
                    createdAt: "",
                    updatedAt: "",
                  }
            )
          : [],
        permissions: Array.isArray(effectiveMe.permissions)
          ? effectiveMe.permissions
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
        flatPermissions: Array.isArray(effectiveFlat) ? effectiveFlat : [],
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
    _conditions?: Record<string, any>
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
  // Do not block rendering if we have any cache; render with cache and refresh in background
  if (!effectiveMe && (isLoading || flatLoading)) {
    // No cache and still loading -> minimal placeholder
    return <div>Loading RBAC context...</div>;
  }
  // If backend errored but we have cache, continue rendering with cache
  // Only hard-stop if unauthorized and no cache
  if (!effectiveMe && (error || flatError)) {
    return <div>Failed to load RBAC context</div>;
  }

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}
