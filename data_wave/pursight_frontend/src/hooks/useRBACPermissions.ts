import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import {
  fetchCurrentUserFlatPermissions,
  fetchCurrentUserPermissions,
  testABAC,
} from "../api/rbac";
import { Permission } from "../models/User";

/**
 * Advanced hook for handling Role-Based Access Control (RBAC) permissions
 * with Attribute-Based Access Control (ABAC) capabilities.
 *
 * Features:
 * - Fetches and caches current user permissions
 * - Provides methods to check for specific permissions
 * - Supports attribute-based conditions for context-aware permissions
 * - Handles permission inheritance and hierarchies
 * - Provides loading and error states
 */
export function useRBACPermissions() {
  const queryClient = useQueryClient();
  const [abacContext, setAbacContext] = useState<Record<string, any>>({});

  // Fetch current user permissions
  const {
    data: permissions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchCurrentUserPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Test ABAC conditions
  const abacMutation = useMutation({
    mutationFn: testABAC,
    onSuccess: (data) => {
      // Optionally update cache or state based on ABAC result
    },
  });

  /**
   * Check if user has a specific permission
   * @param permissionKey The permission key to check
   * @returns boolean indicating if user has the permission
   */
  const hasPermission = useCallback(
    (permissionKey: string): boolean => {
      if (!permissions) return false;
      return permissions.some((p: Permission) => p.key === permissionKey);
    },
    [permissions]
  );

  /**
   * Check if user has any of the specified permissions
   * @param permissionKeys Array of permission keys to check
   * @returns boolean indicating if user has any of the permissions
   */
  const hasAnyPermission = useCallback(
    (permissionKeys: string[]): boolean => {
      if (!permissions) return false;
      return permissionKeys.some((key) => hasPermission(key));
    },
    [permissions, hasPermission]
  );

  /**
   * Check if user has all of the specified permissions
   * @param permissionKeys Array of permission keys to check
   * @returns boolean indicating if user has all of the permissions
   */
  const hasAllPermissions = useCallback(
    (permissionKeys: string[]): boolean => {
      if (!permissions) return false;
      return permissionKeys.every((key) => hasPermission(key));
    },
    [permissions, hasPermission]
  );

  /**
   * Check if user has permission with attribute-based conditions
   * @param permissionKey The permission key to check
   * @param context The context for ABAC evaluation
   * @returns Promise resolving to boolean indicating if user has the permission
   */
  const hasPermissionWithContext = useCallback(
    async (
      permissionKey: string,
      context: Record<string, any>
    ): Promise<boolean> => {
      if (!hasPermission(permissionKey)) return false;

      try {
        const result = await abacMutation.mutateAsync({
          permission: permissionKey,
          context,
        });
        return result.hasAccess;
      } catch (error) {
        console.error("ABAC check failed:", error);
        return false;
      }
    },
    [hasPermission, abacMutation]
  );

  /**
   * Set global ABAC context for permission checks
   * @param context The context for ABAC evaluation
   */
  const setGlobalAbacContext = useCallback((context: Record<string, any>) => {
    setAbacContext((prevContext) => ({
      ...prevContext,
      ...context,
    }));
  }, []);

  /**
   * Clear global ABAC context
   */
  const clearGlobalAbacContext = useCallback(() => {
    setAbacContext({});
  }, []);

  /**
   * Invalidate permissions cache and refetch
   */
  const refreshPermissions = useCallback(() => {
    queryClient.invalidateQueries(["permissions"]);
  }, [queryClient]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      permissions,
      isLoading,
      isError,
      error,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasPermissionWithContext,
      abacContext,
      setGlobalAbacContext,
      clearGlobalAbacContext,
      refreshPermissions,
      refetch,
    }),
    [
      permissions,
      isLoading,
      isError,
      error,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasPermissionWithContext,
      abacContext,
      setGlobalAbacContext,
      clearGlobalAbacContext,
      refreshPermissions,
      refetch,
    ]
  );
}

/**
 * Hook to fetch and cache the flat permissions array
 * for use in RBACProvider and permission checks.
 */
export function useRBACFlatPermissions() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["flat-permissions"],
    queryFn: fetchCurrentUserFlatPermissions,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}
