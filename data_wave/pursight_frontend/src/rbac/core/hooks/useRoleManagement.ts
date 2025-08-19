/**
 * useRoleManagement Hook
 * 
 * This hook provides utilities for managing roles.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Role, Permission } from '../api/models';
import { roleManagementApi } from '../api/roleManagementApi';

/**
 * Interface for the useRoleManagement hook return value
 */
interface UseRoleManagementReturn {
  // Roles data and loading state
  roles: Role[] | undefined;
  isLoading: boolean;
  error: Error | null;
  
  // Role CRUD operations
  createRole: (name: string, description?: string) => Promise<any>;
  updateRole: (roleId: number, name: string, description?: string) => Promise<any>;
  deleteRole: (roleId: number) => Promise<any>;
  
  // Role hierarchy operations
  getRoleParents: (roleId: number) => Promise<Role[]>;
  getRoleChildren: (roleId: number) => Promise<Role[]>;
  addRoleParent: (roleId: number, parentId: number) => Promise<any>;
  removeRoleParent: (roleId: number, parentId: number) => Promise<any>;
  
  // Role permission operations
  getRoleEffectivePermissions: (roleId: number) => Promise<Permission[]>;
  assignPermissionToRole: (roleId: number, permissionId: number) => Promise<any>;
  removePermissionFromRole: (roleId: number, permissionId: number) => Promise<any>;
  
  // Role utility functions
  getRoleById: (roleId: number) => Role | undefined;
  getRoleByName: (roleName: string) => Role | undefined;
  getBuiltInRoles: () => Role[];
  getCustomRoles: () => Role[];
}

/**
 * Hook for managing roles
 */
export const useRoleManagement = (): UseRoleManagementReturn => {
  // Fetch roles
  const { data: roles, isLoading, error } = useRoles();
  
  // Role CRUD mutations
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  
  // Role hierarchy mutations
  const addRoleParentMutation = useAddRoleParent();
  const removeRoleParentMutation = useRemoveRoleParent();
  
  // Role permission mutations
  const assignPermissionToRoleMutation = useAssignPermissionToRole();
  const removePermissionFromRoleMutation = useRemovePermissionFromRole();

  return useMemo(() => {
    // Role CRUD operations
    const createRole = async (name: string, description?: string) => {
      return createRoleMutation.mutateAsync({ name, description });
    };

    const updateRole = async (roleId: number, name: string, description?: string) => {
      return updateRoleMutation.mutateAsync({ roleId, name, description });
    };

    const deleteRole = async (roleId: number) => {
      return deleteRoleMutation.mutateAsync(roleId);
    };

    // Role hierarchy operations
    const getRoleParents = async (roleId: number) => {
      const { data } = await useRoleParents(roleId);
      return data || [];
    };

    const getRoleChildren = async (roleId: number) => {
      const { data } = await useRoleChildren(roleId);
      return data || [];
    };

    const addRoleParent = async (roleId: number, parentId: number) => {
      return addRoleParentMutation.mutateAsync({ roleId, parentId });
    };

    const removeRoleParent = async (roleId: number, parentId: number) => {
      return removeRoleParentMutation.mutateAsync({ roleId, parentId });
    };

    // Role permission operations
    const getRoleEffectivePermissions = async (roleId: number) => {
      const { data } = await useRoleEffectivePermissions(roleId);
      return data || [];
    };

    const assignPermissionToRole = async (roleId: number, permissionId: number) => {
      return assignPermissionToRoleMutation.mutateAsync({ roleId, permissionId });
    };

    const removePermissionFromRole = async (roleId: number, permissionId: number) => {
      return removePermissionFromRoleMutation.mutateAsync({ roleId, permissionId });
    };

    // Role utility functions
    const getRoleById = (roleId: number) => {
      return roles?.find((role) => role.id === roleId);
    };

    const getRoleByName = (roleName: string) => {
      return roles?.find((role) => role.name === roleName);
    };

    const getBuiltInRoles = () => {
      return roles?.filter((role) => role.isBuiltIn) || [];
    };

    const getCustomRoles = () => {
      return roles?.filter((role) => !role.isBuiltIn) || [];
    };

    return {
      roles,
      isLoading,
      error,
      createRole,
      updateRole,
      deleteRole,
      getRoleParents,
      getRoleChildren,
      addRoleParent,
      removeRoleParent,
      getRoleEffectivePermissions,
      assignPermissionToRole,
      removePermissionFromRole,
      getRoleById,
      getRoleByName,
      getBuiltInRoles,
      getCustomRoles,
    };
  }, [roles, isLoading, error, createRoleMutation, updateRoleMutation, deleteRoleMutation, addRoleParentMutation, removeRoleParentMutation, assignPermissionToRoleMutation, removePermissionFromRoleMutation]);
};