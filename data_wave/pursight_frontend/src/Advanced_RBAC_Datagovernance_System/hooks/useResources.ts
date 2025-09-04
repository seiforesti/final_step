// useResources Hook - Comprehensive hierarchical resource management with data source integration
// Maps to backend resource service with enterprise-grade functionality

import { useState, useEffect, useCallback, useMemo } from 'react';
import { resourceService } from '../services/resource.service';
import { rbacWebSocketService } from '../services/websocket.service';
import type { Resource, ResourceCreate, ResourceUpdate, ResourceFilters, ResourcePagination, ResourceTree } from '../types/resource.types';
import type { Role } from '../types/role.types';
import type { Permission } from '../types/permission.types';
import type { DataSource } from '../types/datasource.types';

export interface ResourcesState {
  resources: Resource[];
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  selectedResources: Resource[];
  filters: ResourceFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  lastUpdated: Date | null;
  resourceTree: ResourceTree | null;
  dataSourceResources: Record<string, Resource[]>;
}

export interface ResourcesMethods {
  // Data Loading
  loadResources: (page?: number) => Promise<void>;
  refreshResources: () => Promise<void>;
  searchResources: (query: string) => Promise<void>;
  loadResourceTree: () => Promise<ResourceTree>;
  loadDataSourceResources: (dataSourceId?: string) => Promise<Resource[]>;
  
  // Filtering & Sorting
  setFilters: (filters: Partial<ResourceFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  setPagination: (page: number, pageSize?: number) => void;
  
  // Resource Operations
  createResource: (resourceData: ResourceCreate) => Promise<Resource>;
  updateResource: (resourceId: number, updates: ResourceUpdate) => Promise<Resource>;
  deleteResource: (resourceId: number, options?: { deleteChildren?: boolean; moveChildren?: boolean; targetParentId?: number }) => Promise<void>;
  moveResource: (resourceId: number, newParentId: number | null, position?: number) => Promise<void>;
  
  // Hierarchy Management
  getResourceAncestors: (resourceId: number) => Promise<Resource[]>;
  getResourceDescendants: (resourceId: number, depth?: number) => Promise<Resource[]>;
  getResourceChildren: (resourceId: number) => Promise<Resource[]>;
  getResourceParent: (resourceId: number) => Promise<Resource | null>;
  
  // Role Management
  getResourceRoles: (resourceId: number) => Promise<Role[]>;
  assignRoleToResource: (resourceId: number, roleId: number, userId?: number) => Promise<void>;
  removeRoleFromResource: (resourceId: number, roleId: number, userId?: number) => Promise<void>;
  getResourceEffectivePermissions: (resourceId: number, userId?: number) => Promise<Permission[]>;
  getUserEffectivePermissionsOnResource: (resourceId: number, userId: number) => Promise<Permission[]>;
  
  // Data Source Integration
  syncDataSourcesToResources: () => Promise<{ created: number; updated: number; errors: string[] }>;
  getDataSourceResource: (dataSourceId: string) => Promise<Resource | null>;
  getDataSourceHierarchy: (dataSourceId: string) => Promise<ResourceTree>;
  getDataSourceSchemas: (dataSourceId: string) => Promise<Resource[]>;
  getSchemaTablesResources: (schemaResourceId: number) => Promise<Resource[]>;
  createDataSourceHierarchy: (dataSource: DataSource) => Promise<Resource>;
  
  // Bulk Operations
  bulkCreateResources: (resourcesData: ResourceCreate[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkUpdateResources: (updates: Array<{ id: number; updates: ResourceUpdate }>) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkAssignRoles: (resourceIds: number[], roleId: number, userIds?: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkRemoveRoles: (resourceIds: number[], roleId: number, userIds?: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  
  // Selection Management
  selectResource: (resource: Resource) => void;
  deselectResource: (resourceId: number) => void;
  selectAllResources: () => void;
  clearSelection: () => void;
  toggleResourceSelection: (resource: Resource) => void;
  selectResourceSubtree: (resourceId: number) => Promise<void>;
  
  // Advanced Features
  exportResources: (format: 'csv' | 'xlsx' | 'json', selectedOnly?: boolean, includeHierarchy?: boolean) => Promise<void>;
  importResources: (file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean; preserveHierarchy?: boolean }) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  getResourceAnalytics: (timeRange?: { start: string; end: string }) => Promise<any>;
  getResourceUsageStats: (resourceId: number) => Promise<any>;
  getResourceAccessPatterns: (resourceId: number, days?: number) => Promise<any>;
  
  // Discovery & Recommendations
  discoverOrphanedResources: () => Promise<Resource[]>;
  getResourceRecommendations: (userId: number) => Promise<Resource[]>;
  findSimilarResources: (resourceId: number) => Promise<Resource[]>;
  
  // Templates & Configuration
  getResourceTemplates: () => Promise<any[]>;
  createResourceFromTemplate: (templateId: string, customizations?: any) => Promise<Resource>;
  applyTemplateToResources: (templateId: string, resourceIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  
  // Validation & Testing
  validateResourceHierarchy: () => Promise<{ valid: boolean; issues: string[] }>;
  testResourceAccess: (resourceId: number, userId: number, action: string) => Promise<{ hasAccess: boolean; reason?: string }>;
  
  // Utility
  clearCache: () => void;
  resetPagination: () => void;
}

export interface UseResourcesReturn extends ResourcesState, ResourcesMethods {}

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_FILTERS: ResourceFilters = {};

export function useResources(initialFilters: ResourceFilters = {}, autoLoad = true): UseResourcesReturn {
  const [state, setState] = useState<ResourcesState>({
    resources: [],
    totalCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
    selectedResources: [],
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sortBy: 'name',
    sortOrder: 'asc',
    lastUpdated: null,
    resourceTree: null,
    dataSourceResources: {}
  });

  // Auto-load resources on mount
  useEffect(() => {
    if (autoLoad) {
      Promise.all([
        loadResources(1),
        loadResourceTree()
      ]).catch(console.error);
    }
  }, [autoLoad]);

  // Set up real-time updates
  useEffect(() => {
    // Subscribe to resource changes
    const resourceSubscription = rbacWebSocketService.subscribe('resource_changed', (event) => {
      setState(prev => ({
        ...prev,
        resources: prev.resources.map(resource => 
          resource.id === event.resourceId 
            ? { ...resource, lastUpdated: new Date() }
            : resource
        )
      }));
    });

    return () => {
      rbacWebSocketService.unsubscribe(resourceSubscription);
    };
  }, []);

  // === Data Loading ===

  const loadResources = useCallback(async (page: number = state.currentPage): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const pagination: ResourcePagination = {
        page,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      };

      const response = await resourceService.getResources(state.filters, pagination);
      
      setState(prev => ({
        ...prev,
        resources: response.data.items,
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
        error: error instanceof Error ? error.message : 'Failed to load resources'
      }));
    }
  }, [state.currentPage, state.pageSize, state.sortBy, state.sortOrder, state.filters]);

  const refreshResources = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      await loadResources(state.currentPage);
      setState(prev => ({ ...prev, isRefreshing: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [loadResources, state.currentPage]);

  const searchResources = useCallback(async (query: string): Promise<void> => {
    const searchFilters: ResourceFilters = {
      ...state.filters,
      search: query
    };
    
    setState(prev => ({ ...prev, filters: searchFilters, currentPage: 1 }));
    await loadResources(1);
  }, [state.filters, loadResources]);

  const loadResourceTree = useCallback(async (): Promise<ResourceTree> => {
    try {
      const response = await resourceService.getResourceTree();
      const tree = response.data;
      
      setState(prev => ({
        ...prev,
        resourceTree: tree
      }));
      
      return tree;
    } catch (error) {
      console.error('Failed to load resource tree:', error);
      throw error;
    }
  }, []);

  const loadDataSourceResources = useCallback(async (dataSourceId?: string): Promise<Resource[]> => {
    try {
      const response = dataSourceId 
        ? await resourceService.getDataSourceHierarchy(dataSourceId)
        : await resourceService.getResources({ type: 'data_source' });
      
      const resources = response.data;
      
      if (dataSourceId) {
        setState(prev => ({
          ...prev,
          dataSourceResources: {
            ...prev.dataSourceResources,
            [dataSourceId]: resources
          }
        }));
      }
      
      return resources;
    } catch (error) {
      console.error('Failed to load data source resources:', error);
      return [];
    }
  }, []);

  // === Filtering & Sorting ===

  const setFilters = useCallback((newFilters: Partial<ResourceFilters>): void => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters, currentPage: 1 }));
    loadResources(1);
  }, [state.filters, loadResources]);

  const clearFilters = useCallback((): void => {
    setState(prev => ({ ...prev, filters: DEFAULT_FILTERS, currentPage: 1 }));
    loadResources(1);
  }, [loadResources]);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): void => {
    setState(prev => ({ ...prev, sortBy, sortOrder, currentPage: 1 }));
    loadResources(1);
  }, [loadResources]);

  const setPagination = useCallback((page: number, pageSize: number = state.pageSize): void => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }));
    loadResources(page);
  }, [state.pageSize, loadResources]);

  // === Resource Operations ===

  const createResource = useCallback(async (resourceData: ResourceCreate): Promise<Resource> => {
    try {
      const response = await resourceService.createResource(resourceData);
      const newResource = response.data;
      
      setState(prev => ({
        ...prev,
        resources: [newResource, ...prev.resources],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      // Refresh tree if resource has parent/children
      if (resourceData.parentId || resourceData.children?.length) {
        loadResourceTree();
      }
      
      return newResource;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create resource'
      }));
      throw error;
    }
  }, [loadResourceTree]);

  const updateResource = useCallback(async (resourceId: number, updates: ResourceUpdate): Promise<Resource> => {
    try {
      const response = await resourceService.updateResource(resourceId, updates);
      const updatedResource = response.data;
      
      setState(prev => ({
        ...prev,
        resources: prev.resources.map(resource => 
          resource.id === resourceId ? updatedResource : resource
        ),
        selectedResources: prev.selectedResources.map(resource => 
          resource.id === resourceId ? updatedResource : resource
        ),
        lastUpdated: new Date()
      }));
      
      return updatedResource;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update resource'
      }));
      throw error;
    }
  }, []);

  const deleteResource = useCallback(async (
    resourceId: number, 
    options: { deleteChildren?: boolean; moveChildren?: boolean; targetParentId?: number } = {}
  ): Promise<void> => {
    try {
      await resourceService.deleteResource(resourceId, options);
      
      setState(prev => ({
        ...prev,
        resources: prev.resources.filter(resource => resource.id !== resourceId),
        selectedResources: prev.selectedResources.filter(resource => resource.id !== resourceId),
        totalCount: prev.totalCount - 1,
        lastUpdated: new Date()
      }));
      
      // Refresh tree
      loadResourceTree();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete resource'
      }));
      throw error;
    }
  }, [loadResourceTree]);

  const moveResource = useCallback(async (
    resourceId: number, 
    newParentId: number | null, 
    position?: number
  ): Promise<void> => {
    try {
      await resourceService.moveResource(resourceId, newParentId, position);
      
      // Refresh both resources and tree
      await Promise.all([
        refreshResources(),
        loadResourceTree()
      ]);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to move resource'
      }));
      throw error;
    }
  }, [refreshResources, loadResourceTree]);

  // === Hierarchy Management ===

  const getResourceAncestors = useCallback(async (resourceId: number): Promise<Resource[]> => {
    try {
      const response = await resourceService.getResourceAncestors(resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource ancestors:', error);
      return [];
    }
  }, []);

  const getResourceDescendants = useCallback(async (resourceId: number, depth?: number): Promise<Resource[]> => {
    try {
      const response = await resourceService.getResourceDescendants(resourceId, depth);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource descendants:', error);
      return [];
    }
  }, []);

  const getResourceChildren = useCallback(async (resourceId: number): Promise<Resource[]> => {
    try {
      const response = await resourceService.getResourceChildren(resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource children:', error);
      return [];
    }
  }, []);

  const getResourceParent = useCallback(async (resourceId: number): Promise<Resource | null> => {
    try {
      const response = await resourceService.getResourceParent(resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource parent:', error);
      return null;
    }
  }, []);

  // === Role Management ===

  const getResourceRoles = useCallback(async (resourceId: number): Promise<Role[]> => {
    try {
      const response = await resourceService.getResourceRoles(resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource roles:', error);
      return [];
    }
  }, []);

  const assignRoleToResource = useCallback(async (
    resourceId: number, 
    roleId: number, 
    userId?: number
  ): Promise<void> => {
    try {
      await resourceService.assignRoleToResource(resourceId, roleId, userId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to assign role to resource'
      }));
      throw error;
    }
  }, []);

  const removeRoleFromResource = useCallback(async (
    resourceId: number, 
    roleId: number, 
    userId?: number
  ): Promise<void> => {
    try {
      await resourceService.removeRoleFromResource(resourceId, roleId, userId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove role from resource'
      }));
      throw error;
    }
  }, []);

  const getResourceEffectivePermissions = useCallback(async (
    resourceId: number, 
    userId?: number
  ): Promise<Permission[]> => {
    try {
      const response = await resourceService.getResourceEffectivePermissions(resourceId, userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource effective permissions:', error);
      return [];
    }
  }, []);

  const getUserEffectivePermissionsOnResource = useCallback(async (
    resourceId: number, 
    userId: number
  ): Promise<Permission[]> => {
    try {
      const response = await resourceService.getUserEffectivePermissionsOnResource(resourceId, userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get user effective permissions on resource:', error);
      return [];
    }
  }, []);

  // === Data Source Integration ===

  const syncDataSourcesToResources = useCallback(async (): Promise<{ created: number; updated: number; errors: string[] }> => {
    try {
      const response = await resourceService.syncDataSourcesToResources();
      
      // Refresh resources and tree after sync
      await Promise.all([
        refreshResources(),
        loadResourceTree()
      ]);
      
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to sync data sources to resources'
      }));
      throw error;
    }
  }, [refreshResources, loadResourceTree]);

  const getDataSourceResource = useCallback(async (dataSourceId: string): Promise<Resource | null> => {
    try {
      const response = await resourceService.getDataSourceResource(dataSourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get data source resource:', error);
      return null;
    }
  }, []);

  const getDataSourceHierarchy = useCallback(async (dataSourceId: string): Promise<ResourceTree> => {
    try {
      const response = await resourceService.getDataSourceHierarchy(dataSourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get data source hierarchy:', error);
      throw error;
    }
  }, []);

  const getDataSourceSchemas = useCallback(async (dataSourceId: string): Promise<Resource[]> => {
    try {
      const response = await resourceService.getDataSourceSchemas(dataSourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get data source schemas:', error);
      return [];
    }
  }, []);

  const getSchemaTablesResources = useCallback(async (schemaResourceId: number): Promise<Resource[]> => {
    try {
      const response = await resourceService.getSchemaTablesResources(schemaResourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get schema tables resources:', error);
      return [];
    }
  }, []);

  const createDataSourceHierarchy = useCallback(async (dataSource: DataSource): Promise<Resource> => {
    try {
      const response = await resourceService.createDataSourceHierarchy(dataSource);
      const newResource = response.data;
      
      // Refresh resources and tree
      await Promise.all([
        refreshResources(),
        loadResourceTree()
      ]);
      
      return newResource;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create data source hierarchy'
      }));
      throw error;
    }
  }, [refreshResources, loadResourceTree]);

  // === Bulk Operations ===

  const bulkCreateResources = useCallback(async (
    resourcesData: ResourceCreate[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await resourceService.bulkCreateResources(resourcesData);
      await Promise.all([
        refreshResources(),
        loadResourceTree()
      ]);
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk create resources'
      }));
      throw error;
    }
  }, [refreshResources, loadResourceTree]);

  const bulkUpdateResources = useCallback(async (
    updates: Array<{ id: number; updates: ResourceUpdate }>
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await resourceService.bulkUpdateResources(updates);
      await refreshResources();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk update resources'
      }));
      throw error;
    }
  }, [refreshResources]);

  const bulkAssignRoles = useCallback(async (
    resourceIds: number[], 
    roleId: number, 
    userIds?: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await resourceService.bulkAssignRoles(resourceIds, roleId, userIds);
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
    resourceIds: number[], 
    roleId: number, 
    userIds?: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await resourceService.bulkRemoveRoles(resourceIds, roleId, userIds);
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

  // === Selection Management ===

  const selectResource = useCallback((resource: Resource): void => {
    setState(prev => ({
      ...prev,
      selectedResources: prev.selectedResources.find(r => r.id === resource.id) 
        ? prev.selectedResources 
        : [...prev.selectedResources, resource]
    }));
  }, []);

  const deselectResource = useCallback((resourceId: number): void => {
    setState(prev => ({
      ...prev,
      selectedResources: prev.selectedResources.filter(resource => resource.id !== resourceId)
    }));
  }, []);

  const selectAllResources = useCallback((): void => {
    setState(prev => ({ ...prev, selectedResources: [...prev.resources] }));
  }, []);

  const clearSelection = useCallback((): void => {
    setState(prev => ({ ...prev, selectedResources: [] }));
  }, []);

  const toggleResourceSelection = useCallback((resource: Resource): void => {
    setState(prev => ({
      ...prev,
      selectedResources: prev.selectedResources.find(r => r.id === resource.id)
        ? prev.selectedResources.filter(r => r.id !== resource.id)
        : [...prev.selectedResources, resource]
    }));
  }, []);

  const selectResourceSubtree = useCallback(async (resourceId: number): Promise<void> => {
    try {
      const descendants = await getResourceDescendants(resourceId);
      const resource = state.resources.find(r => r.id === resourceId);
      
      const subtreeResources = resource ? [resource, ...descendants] : descendants;
      
      setState(prev => ({
        ...prev,
        selectedResources: [
          ...prev.selectedResources.filter(r => !subtreeResources.find(sr => sr.id === r.id)),
          ...subtreeResources
        ]
      }));
    } catch (error) {
      console.error('Failed to select resource subtree:', error);
    }
  }, [getResourceDescendants, state.resources]);

  // === Advanced Features ===

  const exportResources = useCallback(async (
    format: 'csv' | 'xlsx' | 'json', 
    selectedOnly: boolean = false,
    includeHierarchy: boolean = false
  ): Promise<void> => {
    try {
      const resourceIds = selectedOnly 
        ? state.selectedResources.map(resource => resource.id)
        : undefined;
      
      await resourceService.exportResources(resourceIds, format, includeHierarchy);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export resources'
      }));
      throw error;
    }
  }, [state.selectedResources]);

  const importResources = useCallback(async (
    file: File, 
    options: { skipDuplicates?: boolean; updateExisting?: boolean; preserveHierarchy?: boolean } = {}
  ): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    try {
      const response = await resourceService.importResources(file, options);
      await Promise.all([
        refreshResources(),
        loadResourceTree()
      ]);
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import resources'
      }));
      throw error;
    }
  }, [refreshResources, loadResourceTree]);

  const getResourceAnalytics = useCallback(async (
    timeRange?: { start: string; end: string }
  ): Promise<any> => {
    try {
      const response = await resourceService.getResourceAnalytics(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource analytics:', error);
      return null;
    }
  }, []);

  const getResourceUsageStats = useCallback(async (resourceId: number): Promise<any> => {
    try {
      const response = await resourceService.getResourceUsageStats(resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource usage stats:', error);
      return null;
    }
  }, []);

  const getResourceAccessPatterns = useCallback(async (resourceId: number, days: number = 30): Promise<any> => {
    try {
      const response = await resourceService.getResourceAccessPatterns(resourceId, days);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource access patterns:', error);
      return null;
    }
  }, []);

  // === Discovery & Recommendations ===

  const discoverOrphanedResources = useCallback(async (): Promise<Resource[]> => {
    try {
      const response = await resourceService.discoverOrphanedResources();
      return response.data;
    } catch (error) {
      console.error('Failed to discover orphaned resources:', error);
      return [];
    }
  }, []);

  const getResourceRecommendations = useCallback(async (userId: number): Promise<Resource[]> => {
    try {
      const response = await resourceService.getResourceRecommendations(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource recommendations:', error);
      return [];
    }
  }, []);

  const findSimilarResources = useCallback(async (resourceId: number): Promise<Resource[]> => {
    try {
      const response = await resourceService.findSimilarResources(resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to find similar resources:', error);
      return [];
    }
  }, []);

  // === Templates & Configuration ===

  const getResourceTemplates = useCallback(async (): Promise<any[]> => {
    try {
      const response = await resourceService.getResourceTemplates();
      return response.data;
    } catch (error) {
      console.error('Failed to get resource templates:', error);
      return [];
    }
  }, []);

  const createResourceFromTemplate = useCallback(async (templateId: string, customizations?: any): Promise<Resource> => {
    try {
      const response = await resourceService.createResourceFromTemplate(templateId, customizations);
      const newResource = response.data;
      
      setState(prev => ({
        ...prev,
        resources: [newResource, ...prev.resources],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      return newResource;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create resource from template'
      }));
      throw error;
    }
  }, []);

  const applyTemplateToResources = useCallback(async (
    templateId: string, 
    resourceIds: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await resourceService.applyTemplateToResources(templateId, resourceIds);
      await refreshResources();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply template to resources'
      }));
      throw error;
    }
  }, [refreshResources]);

  // === Validation & Testing ===

  const validateResourceHierarchy = useCallback(async (): Promise<{ valid: boolean; issues: string[] }> => {
    try {
      const response = await resourceService.validateResourceHierarchy();
      return response.data;
    } catch (error) {
      console.error('Failed to validate resource hierarchy:', error);
      return { valid: false, issues: ['Validation failed'] };
    }
  }, []);

  const testResourceAccess = useCallback(async (
    resourceId: number, 
    userId: number, 
    action: string
  ): Promise<{ hasAccess: boolean; reason?: string }> => {
    try {
      const response = await resourceService.testResourceAccess(resourceId, userId, action);
      return response.data;
    } catch (error) {
      console.error('Failed to test resource access:', error);
      return { hasAccess: false, reason: 'Test failed' };
    }
  }, []);

  // === Utility ===

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      resources: [],
      totalCount: 0,
      selectedResources: [],
      resourceTree: null,
      dataSourceResources: {},
      lastUpdated: null,
      error: null
    }));
  }, []);

  const resetPagination = useCallback((): void => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Computed values
  const computedValues = useMemo(() => ({
    dataSourceResources: state.resources.filter(resource => resource.type === 'data_source'),
    schemaResources: state.resources.filter(resource => resource.type === 'schema'),
    tableResources: state.resources.filter(resource => resource.type === 'table'),
    totalPages: Math.ceil(state.totalCount / state.pageSize),
    isAllSelected: state.selectedResources.length === state.resources.length && state.resources.length > 0,
    isPartiallySelected: state.selectedResources.length > 0 && state.selectedResources.length < state.resources.length,
    selectedResourceIds: state.selectedResources.map(resource => resource.id),
    hasData: state.resources.length > 0,
    isEmpty: !state.isLoading && state.resources.length === 0,
    canLoadMore: state.hasNextPage,
    treeDepth: state.resourceTree ? Math.max(...Object.values(state.resourceTree).map(node => node.depth || 0)) : 0
  }), [state]);

  return {
    ...state,
    ...computedValues,
    
    // Data Loading
    loadResources,
    refreshResources,
    searchResources,
    loadResourceTree,
    loadDataSourceResources,
    
    // Filtering & Sorting
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    
    // Resource Operations
    createResource,
    updateResource,
    deleteResource,
    moveResource,
    
    // Hierarchy Management
    getResourceAncestors,
    getResourceDescendants,
    getResourceChildren,
    getResourceParent,
    
    // Role Management
    getResourceRoles,
    assignRoleToResource,
    removeRoleFromResource,
    getResourceEffectivePermissions,
    getUserEffectivePermissionsOnResource,
    
    // Data Source Integration
    syncDataSourcesToResources,
    getDataSourceResource,
    getDataSourceHierarchy,
    getDataSourceSchemas,
    getSchemaTablesResources,
    createDataSourceHierarchy,
    
    // Bulk Operations
    bulkCreateResources,
    bulkUpdateResources,
    bulkAssignRoles,
    bulkRemoveRoles,
    
    // Selection Management
    selectResource,
    deselectResource,
    selectAllResources,
    clearSelection,
    toggleResourceSelection,
    selectResourceSubtree,
    
    // Advanced Features
    exportResources,
    importResources,
    getResourceAnalytics,
    getResourceUsageStats,
    getResourceAccessPatterns,
    
    // Discovery & Recommendations
    discoverOrphanedResources,
    getResourceRecommendations,
    findSimilarResources,
    
    // Templates & Configuration
    getResourceTemplates,
    createResourceFromTemplate,
    applyTemplateToResources,
    
    // Validation & Testing
    validateResourceHierarchy,
    testResourceAccess,
    
    // Utility
    clearCache,
    resetPagination
  };
}

export default useResources;