/**
 * useResourceRoles Hook
 * 
 * This hook provides utilities for managing resource-scoped role assignments.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ResourceNode, ResourceRole, Permission } from '../api/models';
import { resourceRolesApi } from '../api/resourceRolesApi';

/**
 * Interface for the useResourceRoles hook return value
 */
interface UseResourceRolesReturn {
  // Resource tree data and loading state
  resourceTree: ResourceNode[] | undefined;
  isLoadingTree: boolean;
  treeError: Error | null;
  
  // Resource role operations
  getResourceRoles: (resourceId: number) => Promise<ResourceRole[]>;
  assignResourceRole: (userId: number, roleId: number, resourceId: number, expiresAt?: string) => Promise<any>;
  removeResourceRole: (assignmentId: number, resourceId: number) => Promise<any>;
  getEffectivePermissions: (resourceId: number, userId?: number) => Promise<Permission[]>;
  
  // Resource utility functions
  getResourceById: (resourceId: number) => ResourceNode | undefined;
  getResourcePath: (resourceId: number) => string;
  getResourceChildren: (resourceId: number) => ResourceNode[];
  getResourcesByType: (resourceType: string) => ResourceNode[];
  findResourceByPath: (path: string) => ResourceNode | undefined;
}

/**
 * Hook for managing resource-scoped role assignments
 */
export const useResourceRoles = (): UseResourceRolesReturn => {
  // Fetch resource tree
  const { data: resourceTree, isLoading: isLoadingTree, error: treeError } = useResourceTree();
  
  // Resource role mutations
  const assignResourceRoleMutation = useAssignResourceRole();
  const removeResourceRoleMutation = useRemoveResourceRole();

  return useMemo(() => {
    // Resource role operations
    const getResourceRoles = async (resourceId: number) => {
      const { data } = await useResourceRoles(resourceId);
      return data || [];
    };

    const assignResourceRole = async (userId: number, roleId: number, resourceId: number, expiresAt?: string) => {
      return assignResourceRoleMutation.mutateAsync({
        user_id: userId,
        role_id: roleId,
        resource_id: resourceId,
        expires_at: expiresAt,
      });
    };

    const removeResourceRole = async (assignmentId: number, resourceId: number) => {
      return removeResourceRoleMutation.mutateAsync({
        assignmentId,
        resourceId,
      });
    };

    const getEffectivePermissions = async (resourceId: number, userId?: number) => {
      const { data } = await useEffectiveUserPermissions(resourceId, userId);
      return data || [];
    };

    // Resource utility functions
    const getResourceById = (resourceId: number): ResourceNode | undefined => {
      if (!resourceTree) return undefined;

      // Helper function to recursively search for a resource by ID
      const findResource = (nodes: ResourceNode[]): ResourceNode | undefined => {
        for (const node of nodes) {
          if (node.id === resourceId) return node;
          if (node.children) {
            const found = findResource(node.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      return findResource(resourceTree);
    };

    const getResourcePath = (resourceId: number): string => {
      const resource = getResourceById(resourceId);
      return resource?.path || '';
    };

    const getResourceChildren = (resourceId: number): ResourceNode[] => {
      const resource = getResourceById(resourceId);
      return resource?.children || [];
    };

    const getResourcesByType = (resourceType: string): ResourceNode[] => {
      if (!resourceTree) return [];

      // Helper function to recursively collect resources of a specific type
      const collectResourcesByType = (nodes: ResourceNode[], results: ResourceNode[] = []): ResourceNode[] => {
        for (const node of nodes) {
          if (node.type === resourceType) {
            results.push(node);
          }
          if (node.children) {
            collectResourcesByType(node.children, results);
          }
        }
        return results;
      };

      return collectResourcesByType(resourceTree);
    };

    const findResourceByPath = (path: string): ResourceNode | undefined => {
      if (!resourceTree) return undefined;

      // Helper function to recursively search for a resource by path
      const findResource = (nodes: ResourceNode[]): ResourceNode | undefined => {
        for (const node of nodes) {
          if (node.path === path) return node;
          if (node.children) {
            const found = findResource(node.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      return findResource(resourceTree);
    };

    return {
      resourceTree,
      isLoadingTree,
      treeError,
      getResourceRoles,
      assignResourceRole,
      removeResourceRole,
      getEffectivePermissions,
      getResourceById,
      getResourcePath,
      getResourceChildren,
      getResourcesByType,
      findResourceByPath,
    };
  }, [resourceTree, isLoadingTree, treeError, assignResourceRoleMutation, removeResourceRoleMutation]);
};