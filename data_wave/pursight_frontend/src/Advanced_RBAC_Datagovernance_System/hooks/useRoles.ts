// useRoles Hook - Comprehensive role management with hierarchy, inheritance, and advanced operations
// Maps to backend role service with enterprise-grade functionality

import { useState, useEffect, useCallback, useMemo } from 'react';
import { roleService } from '../services/role.service';
import { rbacWebSocketService } from '../services/websocket.service';
import type { Role, RoleCreate, RoleUpdate, RoleFilters, RolePagination, RoleHierarchy } from '../types/role.types';
import type { Permission } from '../types/permission.types';
import type { User } from '../types/user.types';

export interface RolesState {
  roles: Role[];
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  selectedRoles: Role[];
  filters: RoleFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  lastUpdated: Date | null;
  roleHierarchy: RoleHierarchy | null;
  builtinRoles: Role[];
}

export interface RolesMethods {
  // Data Loading
  loadRoles: (page?: number) => Promise<void>;
  refreshRoles: () => Promise<void>;
  searchRoles: (query: string) => Promise<void>;
  loadRoleHierarchy: () => Promise<RoleHierarchy>;
  loadBuiltinRoles: () => Promise<Role[]>;
  
  // Filtering & Sorting
  setFilters: (filters: Partial<RoleFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  setPagination: (page: number, pageSize?: number) => void;
  
  // Role Operations
  createRole: (roleData: RoleCreate) => Promise<Role>;
  updateRole: (roleId: number, updates: RoleUpdate) => Promise<Role>;
  deleteRole: (roleId: number, options?: { transferAssignments?: boolean; targetRoleId?: number }) => Promise<void>;
  
  // Hierarchy Management
  addParentRole: (roleId: number, parentRoleId: number) => Promise<void>;
  removeParentRole: (roleId: number, parentRoleId: number) => Promise<void>;
  getRoleParents: (roleId: number) => Promise<Role[]>;
  getRoleChildren: (roleId: number) => Promise<Role[]>;
  
  // Permission Management
  getRolePermissions: (roleId: number) => Promise<Permission[]>;
  getRoleEffectivePermissions: (roleId: number) => Promise<Permission[]>;
  assignPermissionToRole: (roleId: number, permissionId: number) => Promise<void>;
  removePermissionFromRole: (roleId: number, permissionId: number) => Promise<void>;
  bulkAssignPermissions: (roleId: number, permissionIds: number[]) => Promise<void>;
  bulkRemovePermissions: (roleId: number, permissionIds: number[]) => Promise<void>;
  
  // User Management
  getRoleUsers: (roleId: number) => Promise<User[]>;
  assignRoleToUser: (roleId: number, userId: number, resourceType?: string, resourceId?: string) => Promise<void>;
  removeRoleFromUser: (roleId: number, userId: number, resourceType?: string, resourceId?: string) => Promise<void>;
  
  // Bulk Operations
  bulkCreateRoles: (rolesData: RoleCreate[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkUpdateRoles: (updates: Array<{ id: number; updates: RoleUpdate }>) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkDeleteRoles: (roleIds: number[], options?: { transferAssignments?: boolean; targetRoleId?: number }) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkAssignRoles: (roleIds: number[], userIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  
  // Selection Management
  selectRole: (role: Role) => void;
  deselectRole: (roleId: number) => void;
  selectAllRoles: () => void;
  clearSelection: () => void;
  toggleRoleSelection: (role: Role) => void;
  
  // Advanced Features
  exportRoles: (format: 'csv' | 'xlsx' | 'json', selectedOnly?: boolean) => Promise<void>;
  importRoles: (file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  getRoleAnalytics: (timeRange?: { start: string; end: string }) => Promise<any>;
  getRoleTemplates: () => Promise<any[]>;
  createRoleFromTemplate: (templateId: string, customizations?: any) => Promise<Role>;
  
  // Discovery & Recommendations
  discoverSimilarRoles: (roleId: number) => Promise<Role[]>;
  getRoleRecommendations: (userId: number) => Promise<Role[]>;
  getPermissionDiff: (sourceRoleId: number, targetRoleId: number) => Promise<any>;
  
  // Validation & Testing
  validateRole: (roleData: Partial<Role>) => Promise<{ valid: boolean; errors: string[] }>;
  testRoleAccess: (roleId: number, resourceType?: string, resourceId?: string) => Promise<any>;
  
  // Utility
  clearCache: () => void;
  resetPagination: () => void;
}

export interface UseRolesReturn extends RolesState, RolesMethods {}

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_FILTERS: RoleFilters = {};

export function useRoles(initialFilters: RoleFilters = {}, autoLoad = true): UseRolesReturn {
  const [state, setState] = useState<RolesState>({
    roles: [],
    totalCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
    selectedRoles: [],
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sortBy: 'name',
    sortOrder: 'asc',
    lastUpdated: null,
    roleHierarchy: null,
    builtinRoles: []
  });

  // Auto-load roles on mount
  useEffect(() => {
    if (autoLoad) {
      Promise.all([
        loadRoles(1),
        loadRoleHierarchy(),
        loadBuiltinRoles()
      ]).catch(console.error);
    }
  }, [autoLoad]);

  // Set up real-time updates
  useEffect(() => {
    // Subscribe to role assignments
    const roleSubscription = rbacWebSocketService.onRoleAssigned(
      (event) => {
        // Update role assignment counts in real-time
        setState(prev => ({
          ...prev,
          roles: prev.roles.map(role => 
            role.id === event.roleId 
              ? { ...role, userCount: (role.userCount || 0) + 1 }
              : role
          )
        }));
      }
    );

    // Subscribe to permission changes
    const permissionSubscription = rbacWebSocketService.onPermissionChanged(
      (event) => {
        // Refresh roles when permissions change
        if (event.roleId) {
          setState(prev => ({
            ...prev,
            roles: prev.roles.map(role => 
              role.id === event.roleId 
                ? { ...role, lastUpdated: new Date() }
                : role
            )
          }));
        }
      }
    );

    return () => {
      rbacWebSocketService.unsubscribe(roleSubscription);
      rbacWebSocketService.unsubscribe(permissionSubscription);
    };
  }, []);

  // === Data Loading ===

  const loadRoles = useCallback(async (page: number = state.currentPage): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const pagination: RolePagination = {
        page,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      };

      const response = await roleService.getRoles(state.filters, pagination);
      
      setState(prev => ({
        ...prev,
        roles: response.data.items,
        totalCount: response.data.total,
        currentPage: response.data.page,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load roles'
      }));
    }
  }, [state.currentPage, state.pageSize, state.sortBy, state.sortOrder, state.filters]);

  const refreshRoles = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      await loadRoles(state.currentPage);
      setState(prev => ({ ...prev, isRefreshing: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [loadRoles, state.currentPage]);

  const searchRoles = useCallback(async (query: string): Promise<void> => {
    const searchFilters: RoleFilters = {
      ...state.filters,
      search: query
    };
    
    setState(prev => ({ ...prev, filters: searchFilters, currentPage: 1 }));
    await loadRoles(1);
  }, [state.filters, loadRoles]);

  const loadRoleHierarchy = useCallback(async (): Promise<RoleHierarchy> => {
    try {
      const response = await roleService.getRoleHierarchy();
      const hierarchy = response.data;
      
      setState(prev => ({
        ...prev,
        roleHierarchy: hierarchy
      }));
      
      return hierarchy;
    } catch (error) {
      console.error('Failed to load role hierarchy:', error);
      throw error;
    }
  }, []);

  const loadBuiltinRoles = useCallback(async (): Promise<Role[]> => {
    try {
      const response = await roleService.getBuiltinRoles();
      const builtinRoles = response.data;
      
      setState(prev => ({
        ...prev,
        builtinRoles
      }));
      
      return builtinRoles;
    } catch (error) {
      console.error('Failed to load builtin roles:', error);
      return [];
    }
  }, []);

  // === Filtering & Sorting ===

  const setFilters = useCallback((newFilters: Partial<RoleFilters>): void => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters, currentPage: 1 }));
    loadRoles(1);
  }, [state.filters, loadRoles]);

  const clearFilters = useCallback((): void => {
    setState(prev => ({ ...prev, filters: DEFAULT_FILTERS, currentPage: 1 }));
    loadRoles(1);
  }, [loadRoles]);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): void => {
    setState(prev => ({ ...prev, sortBy, sortOrder, currentPage: 1 }));
    loadRoles(1);
  }, [loadRoles]);

  const setPagination = useCallback((page: number, pageSize: number = state.pageSize): void => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }));
    loadRoles(page);
  }, [state.pageSize, loadRoles]);

  // === Role Operations ===

  const createRole = useCallback(async (roleData: RoleCreate): Promise<Role> => {
    try {
      const response = await roleService.createRole(roleData);
      const newRole = response.data;
      
      setState(prev => ({
        ...prev,
        roles: [newRole, ...prev.roles],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      // Refresh hierarchy if needed
      if (roleData.parentRoleIds?.length) {
        loadRoleHierarchy();
      }
      
      return newRole;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create role'
      }));
      throw error;
    }
  }, [loadRoleHierarchy]);

  const updateRole = useCallback(async (roleId: number, updates: RoleUpdate): Promise<Role> => {
    try {
      const response = await roleService.updateRole(roleId, updates);
      const updatedRole = response.data;
      
      setState(prev => ({
        ...prev,
        roles: prev.roles.map(role => role.id === roleId ? updatedRole : role),
        selectedRoles: prev.selectedRoles.map(role => role.id === roleId ? updatedRole : role),
        lastUpdated: new Date()
      }));
      
      return updatedRole;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update role'
      }));
      throw error;
    }
  }, []);

  const deleteRole = useCallback(async (
    roleId: number, 
    options: { transferAssignments?: boolean; targetRoleId?: number } = {}
  ): Promise<void> => {
    try {
      await roleService.deleteRole(roleId, options);
      
      setState(prev => ({
        ...prev,
        roles: prev.roles.filter(role => role.id !== roleId),
        selectedRoles: prev.selectedRoles.filter(role => role.id !== roleId),
        totalCount: prev.totalCount - 1,
        lastUpdated: new Date()
      }));
      
      // Refresh hierarchy
      loadRoleHierarchy();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete role'
      }));
      throw error;
    }
  }, [loadRoleHierarchy]);

  // === Hierarchy Management ===

  const addParentRole = useCallback(async (roleId: number, parentRoleId: number): Promise<void> => {
    try {
      await roleService.addParentRole(roleId, parentRoleId);
      
      // Refresh hierarchy and role data
      await Promise.all([
        loadRoleHierarchy(),
        refreshRoles()
      ]);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add parent role'
      }));
      throw error;
    }
  }, [loadRoleHierarchy, refreshRoles]);

  const removeParentRole = useCallback(async (roleId: number, parentRoleId: number): Promise<void> => {
    try {
      await roleService.removeParentRole(roleId, parentRoleId);
      
      // Refresh hierarchy and role data
      await Promise.all([
        loadRoleHierarchy(),
        refreshRoles()
      ]);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove parent role'
      }));
      throw error;
    }
  }, [loadRoleHierarchy, refreshRoles]);

  const getRoleParents = useCallback(async (roleId: number): Promise<Role[]> => {
    try {
      const response = await roleService.getRoleHierarchy(roleId);
      return response.data.parents || [];
    } catch (error) {
      console.error('Failed to get role parents:', error);
      return [];
    }
  }, []);

  const getRoleChildren = useCallback(async (roleId: number): Promise<Role[]> => {
    try {
      const response = await roleService.getRoleHierarchy(roleId);
      return response.data.children || [];
    } catch (error) {
      console.error('Failed to get role children:', error);
      return [];
    }
  }, []);

  // === Permission Management ===

  const getRolePermissions = useCallback(async (roleId: number): Promise<Permission[]> => {
    try {
      const response = await roleService.getRolePermissions(roleId);
      return response.data;
    } catch (error) {
      console.error('Failed to get role permissions:', error);
      return [];
    }
  }, []);

  const getRoleEffectivePermissions = useCallback(async (roleId: number): Promise<Permission[]> => {
    try {
      const response = await roleService.getRoleEffectivePermissions(roleId);
      return response.data;
    } catch (error) {
      console.error('Failed to get role effective permissions:', error);
      return [];
    }
  }, []);

  const assignPermissionToRole = useCallback(async (roleId: number, permissionId: number): Promise<void> => {
    try {
      await roleService.assignPermissionToRole(roleId, permissionId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to assign permission to role'
      }));
      throw error;
    }
  }, []);

  const removePermissionFromRole = useCallback(async (roleId: number, permissionId: number): Promise<void> => {
    try {
      await roleService.removePermissionFromRole(roleId, permissionId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove permission from role'
      }));
      throw error;
    }
  }, []);

  const bulkAssignPermissions = useCallback(async (roleId: number, permissionIds: number[]): Promise<void> => {
    try {
      await roleService.bulkAssignPermissions(roleId, permissionIds);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk assign permissions'
      }));
      throw error;
    }
  }, []);

  const bulkRemovePermissions = useCallback(async (roleId: number, permissionIds: number[]): Promise<void> => {
    try {
      await roleService.bulkRemovePermissions(roleId, permissionIds);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk remove permissions'
      }));
      throw error;
    }
  }, []);

  // === User Management ===

  const getRoleUsers = useCallback(async (roleId: number): Promise<User[]> => {
    try {
      const response = await roleService.getRoleUsers(roleId);
      return response.data;
    } catch (error) {
      console.error('Failed to get role users:', error);
      return [];
    }
  }, []);

  const assignRoleToUser = useCallback(async (
    roleId: number, 
    userId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<void> => {
    try {
      await roleService.assignRoleToUser(roleId, userId, resourceType, resourceId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to assign role to user'
      }));
      throw error;
    }
  }, []);

  const removeRoleFromUser = useCallback(async (
    roleId: number, 
    userId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<void> => {
    try {
      await roleService.removeRoleFromUser(roleId, userId, resourceType, resourceId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove role from user'
      }));
      throw error;
    }
  }, []);

  // === Bulk Operations ===

  const bulkCreateRoles = useCallback(async (rolesData: RoleCreate[]): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await roleService.bulkCreateRoles(rolesData);
      await refreshRoles();
      await loadRoleHierarchy();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk create roles'
      }));
      throw error;
    }
  }, [refreshRoles, loadRoleHierarchy]);

  const bulkUpdateRoles = useCallback(async (
    updates: Array<{ id: number; updates: RoleUpdate }>
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await roleService.bulkUpdateRoles(updates);
      await refreshRoles();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk update roles'
      }));
      throw error;
    }
  }, [refreshRoles]);

  const bulkDeleteRoles = useCallback(async (
    roleIds: number[], 
    options: { transferAssignments?: boolean; targetRoleId?: number } = {}
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await roleService.bulkDeleteRoles(roleIds, options);
      await refreshRoles();
      await loadRoleHierarchy();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk delete roles'
      }));
      throw error;
    }
  }, [refreshRoles, loadRoleHierarchy]);

  const bulkAssignRoles = useCallback(async (
    roleIds: number[], 
    userIds: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await roleService.bulkAssignRoles(roleIds, userIds);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk assign roles'
      }));
      throw error;
    }
  }, []);

  // === Selection Management ===

  const selectRole = useCallback((role: Role): void => {
    setState(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.find(r => r.id === role.id) 
        ? prev.selectedRoles 
        : [...prev.selectedRoles, role]
    }));
  }, []);

  const deselectRole = useCallback((roleId: number): void => {
    setState(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.filter(role => role.id !== roleId)
    }));
  }, []);

  const selectAllRoles = useCallback((): void => {
    setState(prev => ({ ...prev, selectedRoles: [...prev.roles] }));
  }, []);

  const clearSelection = useCallback((): void => {
    setState(prev => ({ ...prev, selectedRoles: [] }));
  }, []);

  const toggleRoleSelection = useCallback((role: Role): void => {
    setState(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.find(r => r.id === role.id)
        ? prev.selectedRoles.filter(r => r.id !== role.id)
        : [...prev.selectedRoles, role]
    }));
  }, []);

  // === Advanced Features ===

  const exportRoles = useCallback(async (
    format: 'csv' | 'xlsx' | 'json', 
    selectedOnly: boolean = false
  ): Promise<void> => {
    try {
      const roleIds = selectedOnly 
        ? state.selectedRoles.map(role => role.id)
        : undefined;
      
      await roleService.exportRoles(roleIds, format);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export roles'
      }));
      throw error;
    }
  }, [state.selectedRoles]);

  const importRoles = useCallback(async (
    file: File, 
    options: { skipDuplicates?: boolean; updateExisting?: boolean } = {}
  ): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    try {
      const response = await roleService.importRoles(file, options);
      await Promise.all([
        refreshRoles(),
        loadRoleHierarchy()
      ]);
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import roles'
      }));
      throw error;
    }
  }, [refreshRoles, loadRoleHierarchy]);

  const getRoleAnalytics = useCallback(async (
    timeRange?: { start: string; end: string }
  ): Promise<any> => {
    try {
      const response = await roleService.getRoleAnalytics(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get role analytics:', error);
      return null;
    }
  }, []);

  const getRoleTemplates = useCallback(async (): Promise<any[]> => {
    try {
      const response = await roleService.getRoleTemplates();
      return response.data;
    } catch (error) {
      console.error('Failed to get role templates:', error);
      return [];
    }
  }, []);

  const createRoleFromTemplate = useCallback(async (templateId: string, customizations?: any): Promise<Role> => {
    try {
      const response = await roleService.createRoleFromTemplate(templateId, customizations);
      const newRole = response.data;
      
      setState(prev => ({
        ...prev,
        roles: [newRole, ...prev.roles],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      return newRole;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create role from template'
      }));
      throw error;
    }
  }, []);

  // === Discovery & Recommendations ===

  const discoverSimilarRoles = useCallback(async (roleId: number): Promise<Role[]> => {
    try {
      const response = await roleService.discoverSimilarRoles(roleId);
      return response.data;
    } catch (error) {
      console.error('Failed to discover similar roles:', error);
      return [];
    }
  }, []);

  const getRoleRecommendations = useCallback(async (userId: number): Promise<Role[]> => {
    try {
      const response = await roleService.getRoleRecommendations(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get role recommendations:', error);
      return [];
    }
  }, []);

  const getPermissionDiff = useCallback(async (sourceRoleId: number, targetRoleId: number): Promise<any> => {
    try {
      const response = await roleService.getPermissionDiff(sourceRoleId, targetRoleId);
      return response.data;
    } catch (error) {
      console.error('Failed to get permission diff:', error);
      return null;
    }
  }, []);

  // === Validation & Testing ===

  const validateRole = useCallback(async (roleData: Partial<Role>): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const response = await roleService.validateRole(roleData);
      return response.data;
    } catch (error) {
      console.error('Failed to validate role:', error);
      return { valid: false, errors: ['Validation failed'] };
    }
  }, []);

  const testRoleAccess = useCallback(async (
    roleId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<any> => {
    try {
      const response = await roleService.testRoleAccess(roleId, resourceType, resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to test role access:', error);
      return null;
    }
  }, []);

  // === Utility ===

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      roles: [],
      totalCount: 0,
      selectedRoles: [],
      roleHierarchy: null,
      builtinRoles: [],
      lastUpdated: null,
      error: null
    }));
  }, []);

  const resetPagination = useCallback((): void => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Computed values
  const computedValues = useMemo(() => ({
    systemRoles: state.roles.filter(role => role.isSystem),
    customRoles: state.roles.filter(role => !role.isSystem),
    totalPages: Math.ceil(state.totalCount / state.pageSize),
    isAllSelected: state.selectedRoles.length === state.roles.length && state.roles.length > 0,
    isPartiallySelected: state.selectedRoles.length > 0 && state.selectedRoles.length < state.roles.length,
    selectedRoleIds: state.selectedRoles.map(role => role.id),
    hasData: state.roles.length > 0,
    isEmpty: !state.isLoading && state.roles.length === 0,
    canLoadMore: state.hasNextPage,
    hierarchyDepth: state.roleHierarchy ? Math.max(...Object.values(state.roleHierarchy).map(node => node.depth || 0)) : 0
  }), [state]);

  return {
    ...state,
    ...computedValues,
    
    // Data Loading
    loadRoles,
    refreshRoles,
    searchRoles,
    loadRoleHierarchy,
    loadBuiltinRoles,
    
    // Filtering & Sorting
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    
    // Role Operations
    createRole,
    updateRole,
    deleteRole,
    
    // Hierarchy Management
    addParentRole,
    removeParentRole,
    getRoleParents,
    getRoleChildren,
    
    // Permission Management
    getRolePermissions,
    getRoleEffectivePermissions,
    assignPermissionToRole,
    removePermissionFromRole,
    bulkAssignPermissions,
    bulkRemovePermissions,
    
    // User Management
    getRoleUsers,
    assignRoleToUser,
    removeRoleFromUser,
    
    // Bulk Operations
    bulkCreateRoles,
    bulkUpdateRoles,
    bulkDeleteRoles,
    bulkAssignRoles,
    
    // Selection Management
    selectRole,
    deselectRole,
    selectAllRoles,
    clearSelection,
    toggleRoleSelection,
    
    // Advanced Features
    exportRoles,
    importRoles,
    getRoleAnalytics,
    getRoleTemplates,
    createRoleFromTemplate,
    
    // Discovery & Recommendations
    discoverSimilarRoles,
    getRoleRecommendations,
    getPermissionDiff,
    
    // Validation & Testing
    validateRole,
    testRoleAccess,
    
    // Utility
    clearCache,
    resetPagination
  };
}

export default useRoles;