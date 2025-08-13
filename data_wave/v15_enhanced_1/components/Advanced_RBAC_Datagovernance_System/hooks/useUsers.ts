// useUsers Hook - Comprehensive user management with advanced filtering and operations
// Maps to backend user service with enterprise-grade functionality

import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService } from '../services/user.service';
import { rbacWebSocketService } from '../services/websocket.service';
import type { User, UserCreate, UserUpdate, UserFilters, UserPagination } from '../types/user.types';
import type { Role } from '../types/role.types';
import type { Group } from '../types/group.types';
import type { Permission } from '../types/permission.types';

export interface UsersState {
  users: User[];
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  selectedUsers: User[];
  filters: UserFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  lastUpdated: Date | null;
}

export interface UsersMethods {
  // Data Loading
  loadUsers: (page?: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  
  // Filtering & Sorting
  setFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  setPagination: (page: number, pageSize?: number) => void;
  
  // User Operations
  createUser: (userData: UserCreate) => Promise<User>;
  updateUser: (userId: number, updates: UserUpdate) => Promise<User>;
  deleteUser: (userId: number, options?: { transferData?: boolean; anonymize?: boolean }) => Promise<void>;
  activateUser: (userId: number) => Promise<void>;
  deactivateUser: (userId: number, reason?: string) => Promise<void>;
  
  // Bulk Operations
  bulkUpdateUsers: (userIds: number[], updates: Partial<UserUpdate>) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkActivateUsers: (userIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkDeactivateUsers: (userIds: number[], reason?: string) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkDeleteUsers: (userIds: number[], options?: { transferData?: boolean; anonymize?: boolean }) => Promise<{ successful: number; failed: number; errors: string[] }>;
  
  // Role Management
  assignRoleToUser: (userId: number, roleId: number, resourceType?: string, resourceId?: string) => Promise<void>;
  removeRoleFromUser: (userId: number, roleId: number, resourceType?: string, resourceId?: string) => Promise<void>;
  getUserRoles: (userId: number) => Promise<Role[]>;
  bulkAssignRoles: (userIds: number[], roleIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkRemoveRoles: (userIds: number[], roleIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  
  // Group Management
  addUserToGroup: (userId: number, groupId: number) => Promise<void>;
  removeUserFromGroup: (userId: number, groupId: number) => Promise<void>;
  getUserGroups: (userId: number) => Promise<Group[]>;
  
  // Permission Management
  getUserPermissions: (userId: number, resourceType?: string, resourceId?: string) => Promise<Permission[]>;
  checkUserPermission: (userId: number, action: string, resource?: string, resourceId?: string) => Promise<boolean>;
  
  // Selection Management
  selectUser: (user: User) => void;
  deselectUser: (userId: number) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;
  toggleUserSelection: (user: User) => void;
  
  // Advanced Features
  exportUsers: (format: 'csv' | 'xlsx' | 'json', selectedOnly?: boolean) => Promise<void>;
  importUsers: (file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  generateUserReport: (userIds?: number[], includePermissions?: boolean) => Promise<any>;
  
  // User Analytics
  getUserAnalytics: (timeRange?: { start: string; end: string }) => Promise<any>;
  getUserActivitySummary: (userId: number, days?: number) => Promise<any>;
  
  // Utility
  clearCache: () => void;
  resetPagination: () => void;
}

export interface UseUsersReturn extends UsersState, UsersMethods {}

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_FILTERS: UserFilters = {};

export function useUsers(initialFilters: UserFilters = {}, autoLoad = true): UseUsersReturn {
  const [state, setState] = useState<UsersState>({
    users: [],
    totalCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
    selectedUsers: [],
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sortBy: 'firstName',
    sortOrder: 'asc',
    lastUpdated: null
  });

  // Auto-load users on mount
  useEffect(() => {
    if (autoLoad) {
      loadUsers(1);
    }
  }, [autoLoad]);

  // Set up real-time updates
  useEffect(() => {
    // Subscribe to user activity changes
    const userActivitySubscription = rbacWebSocketService.onUserActivity(
      (event) => {
        // Update user status in real-time
        setState(prev => ({
          ...prev,
          users: prev.users.map(user => 
            user.id === event.userId 
              ? { ...user, lastActivity: new Date(event.timestamp) }
              : user
          )
        }));
      }
    );

    // Subscribe to role assignments
    const roleSubscription = rbacWebSocketService.onRoleAssigned(
      (event) => {
        // Refresh user data when roles change
        setState(prev => ({
          ...prev,
          users: prev.users.map(user => 
            user.id === event.userId 
              ? { ...user, lastUpdated: new Date() }
              : user
          )
        }));
      }
    );

    return () => {
      rbacWebSocketService.unsubscribe(userActivitySubscription);
      rbacWebSocketService.unsubscribe(roleSubscription);
    };
  }, []);

  // === Data Loading ===

  const loadUsers = useCallback(async (page: number = state.currentPage): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const pagination: UserPagination = {
        page,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      };

      const response = await userService.getUsers(state.filters, pagination);
      
      setState(prev => ({
        ...prev,
        users: response.data.items,
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
        error: error instanceof Error ? error.message : 'Failed to load users'
      }));
    }
  }, [state.currentPage, state.pageSize, state.sortBy, state.sortOrder, state.filters]);

  const refreshUsers = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      await loadUsers(state.currentPage);
      setState(prev => ({ ...prev, isRefreshing: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [loadUsers, state.currentPage]);

  const searchUsers = useCallback(async (query: string): Promise<void> => {
    const searchFilters: UserFilters = {
      ...state.filters,
      search: query
    };
    
    setState(prev => ({ ...prev, filters: searchFilters, currentPage: 1 }));
    await loadUsers(1);
  }, [state.filters, loadUsers]);

  // === Filtering & Sorting ===

  const setFilters = useCallback((newFilters: Partial<UserFilters>): void => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters, currentPage: 1 }));
    loadUsers(1);
  }, [state.filters, loadUsers]);

  const clearFilters = useCallback((): void => {
    setState(prev => ({ ...prev, filters: DEFAULT_FILTERS, currentPage: 1 }));
    loadUsers(1);
  }, [loadUsers]);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): void => {
    setState(prev => ({ ...prev, sortBy, sortOrder, currentPage: 1 }));
    loadUsers(1);
  }, [loadUsers]);

  const setPagination = useCallback((page: number, pageSize: number = state.pageSize): void => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }));
    loadUsers(page);
  }, [state.pageSize, loadUsers]);

  // === User Operations ===

  const createUser = useCallback(async (userData: UserCreate): Promise<User> => {
    try {
      const response = await userService.createUser(userData);
      const newUser = response.data;
      
      setState(prev => ({
        ...prev,
        users: [newUser, ...prev.users],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      return newUser;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create user'
      }));
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (userId: number, updates: UserUpdate): Promise<User> => {
    try {
      const response = await userService.updateUser(userId, updates);
      const updatedUser = response.data;
      
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => user.id === userId ? updatedUser : user),
        selectedUsers: prev.selectedUsers.map(user => user.id === userId ? updatedUser : user),
        lastUpdated: new Date()
      }));
      
      return updatedUser;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update user'
      }));
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (
    userId: number, 
    options: { transferData?: boolean; anonymize?: boolean } = {}
  ): Promise<void> => {
    try {
      await userService.deleteUser(userId, options);
      
      setState(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId),
        selectedUsers: prev.selectedUsers.filter(user => user.id !== userId),
        totalCount: prev.totalCount - 1,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      }));
      throw error;
    }
  }, []);

  const activateUser = useCallback(async (userId: number): Promise<void> => {
    try {
      await userService.activateUser(userId);
      
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, isActive: true } : user
        ),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to activate user'
      }));
      throw error;
    }
  }, []);

  const deactivateUser = useCallback(async (userId: number, reason?: string): Promise<void> => {
    try {
      await userService.deactivateUser(userId, reason);
      
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, isActive: false } : user
        ),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to deactivate user'
      }));
      throw error;
    }
  }, []);

  // === Bulk Operations ===

  const bulkUpdateUsers = useCallback(async (
    userIds: number[], 
    updates: Partial<UserUpdate>
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await userService.bulkUpdateUsers(
        userIds.map(id => ({ id, updates }))
      );
      
      // Refresh the current page to show updated data
      await refreshUsers();
      
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk update users'
      }));
      throw error;
    }
  }, [refreshUsers]);

  const bulkActivateUsers = useCallback(async (userIds: number[]): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await userService.bulkActivateUsers(userIds);
      await refreshUsers();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk activate users'
      }));
      throw error;
    }
  }, [refreshUsers]);

  const bulkDeactivateUsers = useCallback(async (userIds: number[], reason?: string): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await userService.bulkDeactivateUsers(userIds, reason);
      await refreshUsers();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk deactivate users'
      }));
      throw error;
    }
  }, [refreshUsers]);

  const bulkDeleteUsers = useCallback(async (
    userIds: number[], 
    options: { transferData?: boolean; anonymize?: boolean } = {}
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await userService.bulkDeleteUsers(userIds, options);
      await refreshUsers();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk delete users'
      }));
      throw error;
    }
  }, [refreshUsers]);

  // === Role Management ===

  const assignRoleToUser = useCallback(async (
    userId: number, 
    roleId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<void> => {
    try {
      await userService.assignRoleToUser(userId, roleId, resourceType, resourceId);
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
    userId: number, 
    roleId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<void> => {
    try {
      await userService.removeRoleFromUser(userId, roleId, resourceType, resourceId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove role from user'
      }));
      throw error;
    }
  }, []);

  const getUserRoles = useCallback(async (userId: number): Promise<Role[]> => {
    try {
      const response = await userService.getUserRoles(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get user roles:', error);
      return [];
    }
  }, []);

  const bulkAssignRoles = useCallback(async (
    userIds: number[], 
    roleIds: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await userService.bulkAssignRoles(userIds, roleIds);
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

  const bulkRemoveRoles = useCallback(async (
    userIds: number[], 
    roleIds: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await userService.bulkRemoveRoles(userIds, roleIds);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk remove roles'
      }));
      throw error;
    }
  }, []);

  // === Group Management ===

  const addUserToGroup = useCallback(async (userId: number, groupId: number): Promise<void> => {
    try {
      await userService.addUserToGroup(userId, groupId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add user to group'
      }));
      throw error;
    }
  }, []);

  const removeUserFromGroup = useCallback(async (userId: number, groupId: number): Promise<void> => {
    try {
      await userService.removeUserFromGroup(userId, groupId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove user from group'
      }));
      throw error;
    }
  }, []);

  const getUserGroups = useCallback(async (userId: number): Promise<Group[]> => {
    try {
      const response = await userService.getUserGroups(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get user groups:', error);
      return [];
    }
  }, []);

  // === Permission Management ===

  const getUserPermissions = useCallback(async (
    userId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<Permission[]> => {
    try {
      const response = await userService.getUserEffectivePermissions(userId, resourceType, resourceId);
      return response.data.effective || [];
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }, []);

  const checkUserPermission = useCallback(async (
    userId: number, 
    action: string, 
    resource?: string, 
    resourceId?: string
  ): Promise<boolean> => {
    try {
      const response = await userService.checkUserPermission(userId, action, resource, resourceId);
      return response.data.hasPermission;
    } catch (error) {
      console.error('Failed to check user permission:', error);
      return false;
    }
  }, []);

  // === Selection Management ===

  const selectUser = useCallback((user: User): void => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.find(u => u.id === user.id) 
        ? prev.selectedUsers 
        : [...prev.selectedUsers, user]
    }));
  }, []);

  const deselectUser = useCallback((userId: number): void => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.filter(user => user.id !== userId)
    }));
  }, []);

  const selectAllUsers = useCallback((): void => {
    setState(prev => ({ ...prev, selectedUsers: [...prev.users] }));
  }, []);

  const clearSelection = useCallback((): void => {
    setState(prev => ({ ...prev, selectedUsers: [] }));
  }, []);

  const toggleUserSelection = useCallback((user: User): void => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.find(u => u.id === user.id)
        ? prev.selectedUsers.filter(u => u.id !== user.id)
        : [...prev.selectedUsers, user]
    }));
  }, []);

  // === Advanced Features ===

  const exportUsers = useCallback(async (
    format: 'csv' | 'xlsx' | 'json', 
    selectedOnly: boolean = false
  ): Promise<void> => {
    try {
      const userIds = selectedOnly 
        ? state.selectedUsers.map(user => user.id)
        : undefined;
      
      await userService.exportUsers(userIds, format);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export users'
      }));
      throw error;
    }
  }, [state.selectedUsers]);

  const importUsers = useCallback(async (
    file: File, 
    options: { skipDuplicates?: boolean; updateExisting?: boolean } = {}
  ): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    try {
      const response = await userService.importUsers(file, options);
      await refreshUsers();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import users'
      }));
      throw error;
    }
  }, [refreshUsers]);

  const generateUserReport = useCallback(async (
    userIds?: number[], 
    includePermissions: boolean = false
  ): Promise<any> => {
    try {
      const response = await userService.generateUserReport(userIds, includePermissions);
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate user report'
      }));
      throw error;
    }
  }, []);

  // === User Analytics ===

  const getUserAnalytics = useCallback(async (
    timeRange?: { start: string; end: string }
  ): Promise<any> => {
    try {
      const response = await userService.getUserAnalytics(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return null;
    }
  }, []);

  const getUserActivitySummary = useCallback(async (userId: number, days: number = 30): Promise<any> => {
    try {
      const response = await userService.getUserActivitySummary(userId, days);
      return response.data;
    } catch (error) {
      console.error('Failed to get user activity summary:', error);
      return null;
    }
  }, []);

  // === Utility ===

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      users: [],
      totalCount: 0,
      selectedUsers: [],
      lastUpdated: null,
      error: null
    }));
  }, []);

  const resetPagination = useCallback((): void => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Computed values
  const computedValues = useMemo(() => ({
    activeUsers: state.users.filter(user => user.isActive),
    inactiveUsers: state.users.filter(user => !user.isActive),
    totalPages: Math.ceil(state.totalCount / state.pageSize),
    isAllSelected: state.selectedUsers.length === state.users.length && state.users.length > 0,
    isPartiallySelected: state.selectedUsers.length > 0 && state.selectedUsers.length < state.users.length,
    selectedUserIds: state.selectedUsers.map(user => user.id),
    hasData: state.users.length > 0,
    isEmpty: !state.isLoading && state.users.length === 0,
    canLoadMore: state.hasNextPage
  }), [state]);

  return {
    ...state,
    ...computedValues,
    
    // Data Loading
    loadUsers,
    refreshUsers,
    searchUsers,
    
    // Filtering & Sorting
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    
    // User Operations
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    
    // Bulk Operations
    bulkUpdateUsers,
    bulkActivateUsers,
    bulkDeactivateUsers,
    bulkDeleteUsers,
    
    // Role Management
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    bulkAssignRoles,
    bulkRemoveRoles,
    
    // Group Management
    addUserToGroup,
    removeUserFromGroup,
    getUserGroups,
    
    // Permission Management
    getUserPermissions,
    checkUserPermission,
    
    // Selection Management
    selectUser,
    deselectUser,
    selectAllUsers,
    clearSelection,
    toggleUserSelection,
    
    // Advanced Features
    exportUsers,
    importUsers,
    generateUserReport,
    
    // User Analytics
    getUserAnalytics,
    getUserActivitySummary,
    
    // Utility
    clearCache,
    resetPagination
  };
}

export default useUsers;