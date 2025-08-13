// usePermissions Hook - Comprehensive permission management with ABAC conditions and advanced operations
// Maps to backend permission service with enterprise-grade functionality

import { useState, useEffect, useCallback, useMemo } from 'react';
import { permissionService } from '../services/permission.service';
import { rbacWebSocketService } from '../services/websocket.service';
import type { Permission, PermissionCreate, PermissionUpdate, PermissionFilters, PermissionPagination } from '../types/permission.types';
import type { ConditionTemplate } from '../types/condition.types';
import type { User } from '../types/user.types';
import type { Role } from '../types/role.types';

export interface PermissionsState {
  permissions: Permission[];
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  selectedPermissions: Permission[];
  filters: PermissionFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  lastUpdated: Date | null;
  categories: string[];
  permissionMatrix: any;
}

export interface PermissionsMethods {
  // Data Loading
  loadPermissions: (page?: number) => Promise<void>;
  refreshPermissions: () => Promise<void>;
  searchPermissions: (query: string) => Promise<void>;
  loadPermissionCategories: () => Promise<string[]>;
  loadPermissionMatrix: (resourceType?: string) => Promise<any>;
  
  // Filtering & Sorting
  setFilters: (filters: Partial<PermissionFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  setPagination: (page: number, pageSize?: number) => void;
  
  // Permission Operations
  createPermission: (permissionData: PermissionCreate) => Promise<Permission>;
  updatePermission: (permissionId: number, updates: PermissionUpdate) => Promise<Permission>;
  deletePermission: (permissionId: number, options?: { transferAssignments?: boolean; targetPermissionId?: number }) => Promise<void>;
  
  // Permission Checking
  checkUserPermission: (userId: number, action: string, resource?: string, resourceId?: string) => Promise<boolean>;
  batchCheckUserPermissions: (userId: number, checks: Array<{ action: string; resource?: string; resourceId?: string }>) => Promise<Record<string, boolean>>;
  getUserEffectivePermissions: (userId: number, resourceType?: string, resourceId?: string) => Promise<Permission[]>;
  
  // Condition Management
  validateCondition: (condition: string, context?: Record<string, any>) => Promise<{ valid: boolean; errors: string[] }>;
  testCondition: (condition: string, context: Record<string, any>) => Promise<boolean>;
  getConditionHelpers: () => Promise<{ operators: string[]; attributes: string[]; functions: string[] }>;
  
  // Bulk Operations
  bulkCreatePermissions: (permissionsData: PermissionCreate[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkUpdatePermissions: (updates: Array<{ id: number; updates: PermissionUpdate }>) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkDeletePermissions: (permissionIds: number[], options?: { transferAssignments?: boolean; targetPermissionId?: number }) => Promise<{ successful: number; failed: number; errors: string[] }>;
  
  // Permission Analysis
  analyzePermissionConflicts: (permissionIds?: number[]) => Promise<any>;
  getPermissionScope: (permissionId: number) => Promise<any>;
  getPermissionUsageStats: (permissionId: number) => Promise<any>;
  
  // Templates & Presets
  getPermissionTemplates: () => Promise<any[]>;
  createPermissionTemplate: (name: string, permissionIds: number[]) => Promise<any>;
  applyPermissionTemplate: (templateId: string, targetType: 'user' | 'role', targetId: number) => Promise<void>;
  
  // Selection Management
  selectPermission: (permission: Permission) => void;
  deselectPermission: (permissionId: number) => void;
  selectAllPermissions: () => void;
  clearSelection: () => void;
  togglePermissionSelection: (permission: Permission) => void;
  
  // Advanced Features
  exportPermissions: (format: 'csv' | 'xlsx' | 'json', selectedOnly?: boolean) => Promise<void>;
  importPermissions: (file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  getPermissionAnalytics: (timeRange?: { start: string; end: string }) => Promise<any>;
  
  // Discovery & Recommendations
  discoverUnusedPermissions: (days?: number) => Promise<Permission[]>;
  getPermissionRecommendations: (userId: number) => Promise<Permission[]>;
  organizePermissionsByCategory: () => Record<string, Permission[]>;
  
  // Validation & Testing
  testPermissionConfiguration: (configuration: any) => Promise<{ valid: boolean; errors: string[]; warnings: string[] }>;
  validatePermissionConsistency: () => Promise<{ consistent: boolean; issues: string[] }>;
  
  // Utility
  clearCache: () => void;
  resetPagination: () => void;
}

export interface UsePermissionsReturn extends PermissionsState, PermissionsMethods {}

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_FILTERS: PermissionFilters = {};

export function usePermissions(initialFilters: PermissionFilters = {}, autoLoad = true): UsePermissionsReturn {
  const [state, setState] = useState<PermissionsState>({
    permissions: [],
    totalCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
    selectedPermissions: [],
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sortBy: 'action',
    sortOrder: 'asc',
    lastUpdated: null,
    categories: [],
    permissionMatrix: null
  });

  // Auto-load permissions on mount
  useEffect(() => {
    if (autoLoad) {
      Promise.all([
        loadPermissions(1),
        loadPermissionCategories()
      ]).catch(console.error);
    }
  }, [autoLoad]);

  // Set up real-time updates
  useEffect(() => {
    // Subscribe to permission changes
    const permissionSubscription = rbacWebSocketService.onPermissionChanged(
      (event) => {
        // Update permission in real-time
        setState(prev => ({
          ...prev,
          permissions: prev.permissions.map(permission => 
            permission.id === event.permissionId 
              ? { ...permission, lastUpdated: new Date() }
              : permission
          )
        }));
      }
    );

    return () => {
      rbacWebSocketService.unsubscribe(permissionSubscription);
    };
  }, []);

  // === Data Loading ===

  const loadPermissions = useCallback(async (page: number = state.currentPage): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const pagination: PermissionPagination = {
        page,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      };

      const response = await permissionService.getPermissions(state.filters, pagination);
      
      setState(prev => ({
        ...prev,
        permissions: response.data.items,
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
        error: error instanceof Error ? error.message : 'Failed to load permissions'
      }));
    }
  }, [state.currentPage, state.pageSize, state.sortBy, state.sortOrder, state.filters]);

  const refreshPermissions = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      await loadPermissions(state.currentPage);
      setState(prev => ({ ...prev, isRefreshing: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [loadPermissions, state.currentPage]);

  const searchPermissions = useCallback(async (query: string): Promise<void> => {
    const searchFilters: PermissionFilters = {
      ...state.filters,
      search: query
    };
    
    setState(prev => ({ ...prev, filters: searchFilters, currentPage: 1 }));
    await loadPermissions(1);
  }, [state.filters, loadPermissions]);

  const loadPermissionCategories = useCallback(async (): Promise<string[]> => {
    try {
      const response = await permissionService.getPermissionCategories();
      const categories = response.data;
      
      setState(prev => ({
        ...prev,
        categories
      }));
      
      return categories;
    } catch (error) {
      console.error('Failed to load permission categories:', error);
      return [];
    }
  }, []);

  const loadPermissionMatrix = useCallback(async (resourceType?: string): Promise<any> => {
    try {
      const response = await permissionService.getPermissionMatrix(resourceType);
      const matrix = response.data;
      
      setState(prev => ({
        ...prev,
        permissionMatrix: matrix
      }));
      
      return matrix;
    } catch (error) {
      console.error('Failed to load permission matrix:', error);
      return null;
    }
  }, []);

  // === Filtering & Sorting ===

  const setFilters = useCallback((newFilters: Partial<PermissionFilters>): void => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters, currentPage: 1 }));
    loadPermissions(1);
  }, [state.filters, loadPermissions]);

  const clearFilters = useCallback((): void => {
    setState(prev => ({ ...prev, filters: DEFAULT_FILTERS, currentPage: 1 }));
    loadPermissions(1);
  }, [loadPermissions]);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): void => {
    setState(prev => ({ ...prev, sortBy, sortOrder, currentPage: 1 }));
    loadPermissions(1);
  }, [loadPermissions]);

  const setPagination = useCallback((page: number, pageSize: number = state.pageSize): void => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }));
    loadPermissions(page);
  }, [state.pageSize, loadPermissions]);

  // === Permission Operations ===

  const createPermission = useCallback(async (permissionData: PermissionCreate): Promise<Permission> => {
    try {
      const response = await permissionService.createPermission(permissionData);
      const newPermission = response.data;
      
      setState(prev => ({
        ...prev,
        permissions: [newPermission, ...prev.permissions],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      return newPermission;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create permission'
      }));
      throw error;
    }
  }, []);

  const updatePermission = useCallback(async (permissionId: number, updates: PermissionUpdate): Promise<Permission> => {
    try {
      const response = await permissionService.updatePermission(permissionId, updates);
      const updatedPermission = response.data;
      
      setState(prev => ({
        ...prev,
        permissions: prev.permissions.map(permission => 
          permission.id === permissionId ? updatedPermission : permission
        ),
        selectedPermissions: prev.selectedPermissions.map(permission => 
          permission.id === permissionId ? updatedPermission : permission
        ),
        lastUpdated: new Date()
      }));
      
      return updatedPermission;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update permission'
      }));
      throw error;
    }
  }, []);

  const deletePermission = useCallback(async (
    permissionId: number, 
    options: { transferAssignments?: boolean; targetPermissionId?: number } = {}
  ): Promise<void> => {
    try {
      await permissionService.deletePermission(permissionId, options);
      
      setState(prev => ({
        ...prev,
        permissions: prev.permissions.filter(permission => permission.id !== permissionId),
        selectedPermissions: prev.selectedPermissions.filter(permission => permission.id !== permissionId),
        totalCount: prev.totalCount - 1,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete permission'
      }));
      throw error;
    }
  }, []);

  // === Permission Checking ===

  const checkUserPermission = useCallback(async (
    userId: number, 
    action: string, 
    resource?: string, 
    resourceId?: string
  ): Promise<boolean> => {
    try {
      const response = await permissionService.checkUserPermission(userId, action, resource, resourceId);
      return response.data.hasPermission;
    } catch (error) {
      console.error('Failed to check user permission:', error);
      return false;
    }
  }, []);

  const batchCheckUserPermissions = useCallback(async (
    userId: number, 
    checks: Array<{ action: string; resource?: string; resourceId?: string }>
  ): Promise<Record<string, boolean>> => {
    try {
      const response = await permissionService.batchCheckUserPermissions(userId, checks);
      return response.data;
    } catch (error) {
      console.error('Failed to batch check user permissions:', error);
      return {};
    }
  }, []);

  const getUserEffectivePermissions = useCallback(async (
    userId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<Permission[]> => {
    try {
      const response = await permissionService.getUserEffectivePermissions(userId, resourceType, resourceId);
      return response.data.effective || [];
    } catch (error) {
      console.error('Failed to get user effective permissions:', error);
      return [];
    }
  }, []);

  // === Condition Management ===

  const validateCondition = useCallback(async (
    condition: string, 
    context?: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const response = await permissionService.validateCondition(condition, context);
      return response.data;
    } catch (error) {
      console.error('Failed to validate condition:', error);
      return { valid: false, errors: ['Validation failed'] };
    }
  }, []);

  const testCondition = useCallback(async (condition: string, context: Record<string, any>): Promise<boolean> => {
    try {
      const response = await permissionService.testCondition(condition, context);
      return response.data.result;
    } catch (error) {
      console.error('Failed to test condition:', error);
      return false;
    }
  }, []);

  const getConditionHelpers = useCallback(async (): Promise<{ operators: string[]; attributes: string[]; functions: string[] }> => {
    try {
      const response = await permissionService.getConditionHelpers();
      return response.data;
    } catch (error) {
      console.error('Failed to get condition helpers:', error);
      return { operators: [], attributes: [], functions: [] };
    }
  }, []);

  // === Bulk Operations ===

  const bulkCreatePermissions = useCallback(async (
    permissionsData: PermissionCreate[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await permissionService.bulkCreatePermissions(permissionsData);
      await refreshPermissions();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk create permissions'
      }));
      throw error;
    }
  }, [refreshPermissions]);

  const bulkUpdatePermissions = useCallback(async (
    updates: Array<{ id: number; updates: PermissionUpdate }>
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await permissionService.bulkUpdatePermissions(updates);
      await refreshPermissions();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk update permissions'
      }));
      throw error;
    }
  }, [refreshPermissions]);

  const bulkDeletePermissions = useCallback(async (
    permissionIds: number[], 
    options: { transferAssignments?: boolean; targetPermissionId?: number } = {}
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await permissionService.bulkDeletePermissions(permissionIds, options);
      await refreshPermissions();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk delete permissions'
      }));
      throw error;
    }
  }, [refreshPermissions]);

  // === Permission Analysis ===

  const analyzePermissionConflicts = useCallback(async (permissionIds?: number[]): Promise<any> => {
    try {
      const response = await permissionService.analyzePermissionConflicts(permissionIds);
      return response.data;
    } catch (error) {
      console.error('Failed to analyze permission conflicts:', error);
      return null;
    }
  }, []);

  const getPermissionScope = useCallback(async (permissionId: number): Promise<any> => {
    try {
      const response = await permissionService.getPermissionScope(permissionId);
      return response.data;
    } catch (error) {
      console.error('Failed to get permission scope:', error);
      return null;
    }
  }, []);

  const getPermissionUsageStats = useCallback(async (permissionId: number): Promise<any> => {
    try {
      const response = await permissionService.getPermissionUsageStats(permissionId);
      return response.data;
    } catch (error) {
      console.error('Failed to get permission usage stats:', error);
      return null;
    }
  }, []);

  // === Templates & Presets ===

  const getPermissionTemplates = useCallback(async (): Promise<any[]> => {
    try {
      const response = await permissionService.getPermissionTemplates();
      return response.data;
    } catch (error) {
      console.error('Failed to get permission templates:', error);
      return [];
    }
  }, []);

  const createPermissionTemplate = useCallback(async (name: string, permissionIds: number[]): Promise<any> => {
    try {
      const response = await permissionService.createPermissionTemplate({ name, permissionIds });
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create permission template'
      }));
      throw error;
    }
  }, []);

  const applyPermissionTemplate = useCallback(async (
    templateId: string, 
    targetType: 'user' | 'role', 
    targetId: number
  ): Promise<void> => {
    try {
      await permissionService.applyPermissionTemplate(templateId, targetType, targetId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply permission template'
      }));
      throw error;
    }
  }, []);

  // === Selection Management ===

  const selectPermission = useCallback((permission: Permission): void => {
    setState(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.find(p => p.id === permission.id) 
        ? prev.selectedPermissions 
        : [...prev.selectedPermissions, permission]
    }));
  }, []);

  const deselectPermission = useCallback((permissionId: number): void => {
    setState(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.filter(permission => permission.id !== permissionId)
    }));
  }, []);

  const selectAllPermissions = useCallback((): void => {
    setState(prev => ({ ...prev, selectedPermissions: [...prev.permissions] }));
  }, []);

  const clearSelection = useCallback((): void => {
    setState(prev => ({ ...prev, selectedPermissions: [] }));
  }, []);

  const togglePermissionSelection = useCallback((permission: Permission): void => {
    setState(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.find(p => p.id === permission.id)
        ? prev.selectedPermissions.filter(p => p.id !== permission.id)
        : [...prev.selectedPermissions, permission]
    }));
  }, []);

  // === Advanced Features ===

  const exportPermissions = useCallback(async (
    format: 'csv' | 'xlsx' | 'json', 
    selectedOnly: boolean = false
  ): Promise<void> => {
    try {
      const permissionIds = selectedOnly 
        ? state.selectedPermissions.map(permission => permission.id)
        : undefined;
      
      await permissionService.exportPermissions(permissionIds, format);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export permissions'
      }));
      throw error;
    }
  }, [state.selectedPermissions]);

  const importPermissions = useCallback(async (
    file: File, 
    options: { skipDuplicates?: boolean; updateExisting?: boolean } = {}
  ): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    try {
      const response = await permissionService.importPermissions(file, options);
      await refreshPermissions();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import permissions'
      }));
      throw error;
    }
  }, [refreshPermissions]);

  const getPermissionAnalytics = useCallback(async (
    timeRange?: { start: string; end: string }
  ): Promise<any> => {
    try {
      const response = await permissionService.getPermissionAnalytics(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get permission analytics:', error);
      return null;
    }
  }, []);

  // === Discovery & Recommendations ===

  const discoverUnusedPermissions = useCallback(async (days: number = 30): Promise<Permission[]> => {
    try {
      const response = await permissionService.discoverUnusedPermissions(days);
      return response.data;
    } catch (error) {
      console.error('Failed to discover unused permissions:', error);
      return [];
    }
  }, []);

  const getPermissionRecommendations = useCallback(async (userId: number): Promise<Permission[]> => {
    try {
      const response = await permissionService.getPermissionRecommendations(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get permission recommendations:', error);
      return [];
    }
  }, []);

  const organizePermissionsByCategory = useCallback((): Record<string, Permission[]> => {
    const organized = permissionService.organizePermissionsByCategory(state.permissions);
    return organized;
  }, [state.permissions]);

  // === Validation & Testing ===

  const testPermissionConfiguration = useCallback(async (
    configuration: any
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> => {
    try {
      const response = await permissionService.testPermissionConfiguration(configuration);
      return response.data;
    } catch (error) {
      console.error('Failed to test permission configuration:', error);
      return { valid: false, errors: ['Test failed'], warnings: [] };
    }
  }, []);

  const validatePermissionConsistency = useCallback(async (): Promise<{ consistent: boolean; issues: string[] }> => {
    try {
      const response = await permissionService.validatePermissionConsistency();
      return response.data;
    } catch (error) {
      console.error('Failed to validate permission consistency:', error);
      return { consistent: false, issues: ['Validation failed'] };
    }
  }, []);

  // === Utility ===

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      permissions: [],
      totalCount: 0,
      selectedPermissions: [],
      categories: [],
      permissionMatrix: null,
      lastUpdated: null,
      error: null
    }));
  }, []);

  const resetPagination = useCallback((): void => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Computed values
  const computedValues = useMemo(() => ({
    systemPermissions: state.permissions.filter(permission => permission.isSystem),
    customPermissions: state.permissions.filter(permission => !permission.isSystem),
    conditionalPermissions: state.permissions.filter(permission => permission.condition),
    totalPages: Math.ceil(state.totalCount / state.pageSize),
    isAllSelected: state.selectedPermissions.length === state.permissions.length && state.permissions.length > 0,
    isPartiallySelected: state.selectedPermissions.length > 0 && state.selectedPermissions.length < state.permissions.length,
    selectedPermissionIds: state.selectedPermissions.map(permission => permission.id),
    hasData: state.permissions.length > 0,
    isEmpty: !state.isLoading && state.permissions.length === 0,
    canLoadMore: state.hasNextPage,
    categorizedPermissions: organizePermissionsByCategory()
  }), [state, organizePermissionsByCategory]);

  return {
    ...state,
    ...computedValues,
    
    // Data Loading
    loadPermissions,
    refreshPermissions,
    searchPermissions,
    loadPermissionCategories,
    loadPermissionMatrix,
    
    // Filtering & Sorting
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    
    // Permission Operations
    createPermission,
    updatePermission,
    deletePermission,
    
    // Permission Checking
    checkUserPermission,
    batchCheckUserPermissions,
    getUserEffectivePermissions,
    
    // Condition Management
    validateCondition,
    testCondition,
    getConditionHelpers,
    
    // Bulk Operations
    bulkCreatePermissions,
    bulkUpdatePermissions,
    bulkDeletePermissions,
    
    // Permission Analysis
    analyzePermissionConflicts,
    getPermissionScope,
    getPermissionUsageStats,
    
    // Templates & Presets
    getPermissionTemplates,
    createPermissionTemplate,
    applyPermissionTemplate,
    
    // Selection Management
    selectPermission,
    deselectPermission,
    selectAllPermissions,
    clearSelection,
    togglePermissionSelection,
    
    // Advanced Features
    exportPermissions,
    importPermissions,
    getPermissionAnalytics,
    
    // Discovery & Recommendations
    discoverUnusedPermissions,
    getPermissionRecommendations,
    organizePermissionsByCategory,
    
    // Validation & Testing
    testPermissionConfiguration,
    validatePermissionConsistency,
    
    // Utility
    clearCache,
    resetPagination
  };
}

export default usePermissions;