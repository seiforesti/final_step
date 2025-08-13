// useGroups Hook - Comprehensive group management with user assignments, role inheritance, and enterprise features
// Maps to backend group service with enterprise-grade functionality

import { useState, useEffect, useCallback, useMemo } from 'react';
import { groupService } from '../services/group.service';
import { rbacWebSocketService } from '../services/websocket.service';
import type { Group, GroupCreate, GroupUpdate, GroupFilters, GroupPagination } from '../types/group.types';
import type { User } from '../types/user.types';
import type { Role } from '../types/role.types';
import type { Permission } from '../types/permission.types';

export interface GroupsState {
  groups: Group[];
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  selectedGroups: Group[];
  filters: GroupFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  lastUpdated: Date | null;
  groupHierarchy: any;
}

export interface GroupsMethods {
  // Data Loading
  loadGroups: (page?: number) => Promise<void>;
  refreshGroups: () => Promise<void>;
  searchGroups: (query: string) => Promise<void>;
  loadGroupHierarchy: () => Promise<any>;
  
  // Filtering & Sorting
  setFilters: (filters: Partial<GroupFilters>) => void;
  clearFilters: () => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  setPagination: (page: number, pageSize?: number) => void;
  
  // Group Operations
  createGroup: (groupData: GroupCreate) => Promise<Group>;
  updateGroup: (groupId: number, updates: GroupUpdate) => Promise<Group>;
  deleteGroup: (groupId: number, options?: { transferMembers?: boolean; targetGroupId?: number }) => Promise<void>;
  
  // Member Management
  getGroupMembers: (groupId: number) => Promise<User[]>;
  addUserToGroup: (groupId: number, userId: number, role?: string) => Promise<void>;
  removeUserFromGroup: (groupId: number, userId: number) => Promise<void>;
  updateGroupMembership: (groupId: number, userId: number, updates: any) => Promise<void>;
  getUserGroups: (userId: number) => Promise<Group[]>;
  
  // Role Management
  getGroupRoles: (groupId: number) => Promise<Role[]>;
  assignRoleToGroup: (groupId: number, roleId: number, resourceType?: string, resourceId?: string) => Promise<void>;
  removeRoleFromGroup: (groupId: number, roleId: number, resourceType?: string, resourceId?: string) => Promise<void>;
  getGroupEffectivePermissions: (groupId: number, resourceType?: string, resourceId?: string) => Promise<Permission[]>;
  
  // Hierarchy Management
  addParentGroup: (groupId: number, parentGroupId: number) => Promise<void>;
  removeParentGroup: (groupId: number, parentGroupId: number) => Promise<void>;
  getGroupParents: (groupId: number) => Promise<Group[]>;
  getGroupChildren: (groupId: number) => Promise<Group[]>;
  
  // Bulk Operations
  bulkCreateGroups: (groupsData: GroupCreate[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkUpdateGroups: (updates: Array<{ id: number; updates: GroupUpdate }>) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkAddUsersToGroups: (groupIds: number[], userIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkRemoveUsersFromGroups: (groupIds: number[], userIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkAssignRolesToGroups: (groupIds: number[], roleIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  bulkRemoveRolesFromGroups: (groupIds: number[], roleIds: number[]) => Promise<{ successful: number; failed: number; errors: string[] }>;
  
  // Analytics & Reporting
  getGroupAnalytics: (timeRange?: { start: string; end: string }) => Promise<any>;
  getGroupUsageStats: (groupId: number) => Promise<any>;
  getGroupAccessPatterns: (groupId: number, days?: number) => Promise<any>;
  
  // Selection Management
  selectGroup: (group: Group) => void;
  deselectGroup: (groupId: number) => void;
  selectAllGroups: () => void;
  clearSelection: () => void;
  toggleGroupSelection: (group: Group) => void;
  
  // Advanced Features
  exportGroups: (format: 'csv' | 'xlsx' | 'json', selectedOnly?: boolean) => Promise<void>;
  importGroups: (file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  discoverSimilarGroups: (groupId: number) => Promise<Group[]>;
  getGroupRecommendations: (userId: number) => Promise<Group[]>;
  
  // Templates & Configuration
  getGroupTemplates: () => Promise<any[]>;
  createGroupTemplate: (name: string, groupId: number) => Promise<any>;
  applyGroupTemplate: (templateId: string, customizations?: any) => Promise<Group>;
  
  // Invitations & Access Requests
  sendGroupInvitation: (groupId: number, email: string, role?: string) => Promise<void>;
  acceptGroupInvitation: (invitationId: string) => Promise<void>;
  declineGroupInvitation: (invitationId: string) => Promise<void>;
  getGroupInvitations: (groupId: number) => Promise<any[]>;
  
  // Validation & Testing
  validateGroup: (groupData: Partial<Group>) => Promise<{ valid: boolean; errors: string[] }>;
  testGroupPermissions: (groupId: number, action: string, resource?: string, resourceId?: string) => Promise<{ hasAccess: boolean; reason?: string }>;
  
  // Utility
  clearCache: () => void;
  resetPagination: () => void;
}

export interface UseGroupsReturn extends GroupsState, GroupsMethods {}

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_FILTERS: GroupFilters = {};

export function useGroups(initialFilters: GroupFilters = {}, autoLoad = true): UseGroupsReturn {
  const [state, setState] = useState<GroupsState>({
    groups: [],
    totalCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
    selectedGroups: [],
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sortBy: 'name',
    sortOrder: 'asc',
    lastUpdated: null,
    groupHierarchy: null
  });

  // Auto-load groups on mount
  useEffect(() => {
    if (autoLoad) {
      Promise.all([
        loadGroups(1),
        loadGroupHierarchy()
      ]).catch(console.error);
    }
  }, [autoLoad]);

  // Set up real-time updates
  useEffect(() => {
    // Subscribe to group membership changes
    const membershipSubscription = rbacWebSocketService.subscribe('group_membership_changed', (event) => {
      setState(prev => ({
        ...prev,
        groups: prev.groups.map(group => 
          group.id === event.groupId 
            ? { ...group, memberCount: event.memberCount, lastUpdated: new Date() }
            : group
        )
      }));
    });

    // Subscribe to role assignments to groups
    const roleSubscription = rbacWebSocketService.onRoleAssigned(
      (event) => {
        if (event.groupId) {
          setState(prev => ({
            ...prev,
            groups: prev.groups.map(group => 
              group.id === event.groupId 
                ? { ...group, lastUpdated: new Date() }
                : group
            )
          }));
        }
      }
    );

    return () => {
      rbacWebSocketService.unsubscribe(membershipSubscription);
      rbacWebSocketService.unsubscribe(roleSubscription);
    };
  }, []);

  // === Data Loading ===

  const loadGroups = useCallback(async (page: number = state.currentPage): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const pagination: GroupPagination = {
        page,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      };

      const response = await groupService.getGroups(state.filters, pagination);
      
      setState(prev => ({
        ...prev,
        groups: response.data.items,
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
        error: error instanceof Error ? error.message : 'Failed to load groups'
      }));
    }
  }, [state.currentPage, state.pageSize, state.sortBy, state.sortOrder, state.filters]);

  const refreshGroups = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      await loadGroups(state.currentPage);
      setState(prev => ({ ...prev, isRefreshing: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [loadGroups, state.currentPage]);

  const searchGroups = useCallback(async (query: string): Promise<void> => {
    const searchFilters: GroupFilters = {
      ...state.filters,
      search: query
    };
    
    setState(prev => ({ ...prev, filters: searchFilters, currentPage: 1 }));
    await loadGroups(1);
  }, [state.filters, loadGroups]);

  const loadGroupHierarchy = useCallback(async (): Promise<any> => {
    try {
      const response = await groupService.getGroupHierarchy();
      const hierarchy = response.data;
      
      setState(prev => ({
        ...prev,
        groupHierarchy: hierarchy
      }));
      
      return hierarchy;
    } catch (error) {
      console.error('Failed to load group hierarchy:', error);
      throw error;
    }
  }, []);

  // === Filtering & Sorting ===

  const setFilters = useCallback((newFilters: Partial<GroupFilters>): void => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters, currentPage: 1 }));
    loadGroups(1);
  }, [state.filters, loadGroups]);

  const clearFilters = useCallback((): void => {
    setState(prev => ({ ...prev, filters: DEFAULT_FILTERS, currentPage: 1 }));
    loadGroups(1);
  }, [loadGroups]);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): void => {
    setState(prev => ({ ...prev, sortBy, sortOrder, currentPage: 1 }));
    loadGroups(1);
  }, [loadGroups]);

  const setPagination = useCallback((page: number, pageSize: number = state.pageSize): void => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }));
    loadGroups(page);
  }, [state.pageSize, loadGroups]);

  // === Group Operations ===

  const createGroup = useCallback(async (groupData: GroupCreate): Promise<Group> => {
    try {
      const response = await groupService.createGroup(groupData);
      const newGroup = response.data;
      
      setState(prev => ({
        ...prev,
        groups: [newGroup, ...prev.groups],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      // Refresh hierarchy if group has parent
      if (groupData.parentGroupId) {
        loadGroupHierarchy();
      }
      
      return newGroup;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create group'
      }));
      throw error;
    }
  }, [loadGroupHierarchy]);

  const updateGroup = useCallback(async (groupId: number, updates: GroupUpdate): Promise<Group> => {
    try {
      const response = await groupService.updateGroup(groupId, updates);
      const updatedGroup = response.data;
      
      setState(prev => ({
        ...prev,
        groups: prev.groups.map(group => group.id === groupId ? updatedGroup : group),
        selectedGroups: prev.selectedGroups.map(group => group.id === groupId ? updatedGroup : group),
        lastUpdated: new Date()
      }));
      
      return updatedGroup;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update group'
      }));
      throw error;
    }
  }, []);

  const deleteGroup = useCallback(async (
    groupId: number, 
    options: { transferMembers?: boolean; targetGroupId?: number } = {}
  ): Promise<void> => {
    try {
      await groupService.deleteGroup(groupId, options);
      
      setState(prev => ({
        ...prev,
        groups: prev.groups.filter(group => group.id !== groupId),
        selectedGroups: prev.selectedGroups.filter(group => group.id !== groupId),
        totalCount: prev.totalCount - 1,
        lastUpdated: new Date()
      }));
      
      // Refresh hierarchy
      loadGroupHierarchy();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete group'
      }));
      throw error;
    }
  }, [loadGroupHierarchy]);

  // === Member Management ===

  const getGroupMembers = useCallback(async (groupId: number): Promise<User[]> => {
    try {
      const response = await groupService.getGroupMembers(groupId);
      return response.data;
    } catch (error) {
      console.error('Failed to get group members:', error);
      return [];
    }
  }, []);

  const addUserToGroup = useCallback(async (groupId: number, userId: number, role?: string): Promise<void> => {
    try {
      await groupService.addUserToGroup(groupId, userId, role);
      
      // Update member count in local state
      setState(prev => ({
        ...prev,
        groups: prev.groups.map(group => 
          group.id === groupId 
            ? { ...group, memberCount: (group.memberCount || 0) + 1 }
            : group
        ),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add user to group'
      }));
      throw error;
    }
  }, []);

  const removeUserFromGroup = useCallback(async (groupId: number, userId: number): Promise<void> => {
    try {
      await groupService.removeUserFromGroup(groupId, userId);
      
      // Update member count in local state
      setState(prev => ({
        ...prev,
        groups: prev.groups.map(group => 
          group.id === groupId 
            ? { ...group, memberCount: Math.max((group.memberCount || 1) - 1, 0) }
            : group
        ),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove user from group'
      }));
      throw error;
    }
  }, []);

  const updateGroupMembership = useCallback(async (groupId: number, userId: number, updates: any): Promise<void> => {
    try {
      await groupService.updateGroupMembership(groupId, userId, updates);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update group membership'
      }));
      throw error;
    }
  }, []);

  const getUserGroups = useCallback(async (userId: number): Promise<Group[]> => {
    try {
      const response = await groupService.getUserGroups(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get user groups:', error);
      return [];
    }
  }, []);

  // === Role Management ===

  const getGroupRoles = useCallback(async (groupId: number): Promise<Role[]> => {
    try {
      const response = await groupService.getGroupRoles(groupId);
      return response.data;
    } catch (error) {
      console.error('Failed to get group roles:', error);
      return [];
    }
  }, []);

  const assignRoleToGroup = useCallback(async (
    groupId: number, 
    roleId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<void> => {
    try {
      await groupService.assignRoleToGroup(groupId, roleId, resourceType, resourceId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to assign role to group'
      }));
      throw error;
    }
  }, []);

  const removeRoleFromGroup = useCallback(async (
    groupId: number, 
    roleId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<void> => {
    try {
      await groupService.removeRoleFromGroup(groupId, roleId, resourceType, resourceId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove role from group'
      }));
      throw error;
    }
  }, []);

  const getGroupEffectivePermissions = useCallback(async (
    groupId: number, 
    resourceType?: string, 
    resourceId?: string
  ): Promise<Permission[]> => {
    try {
      const response = await groupService.getGroupEffectivePermissions(groupId, resourceType, resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to get group effective permissions:', error);
      return [];
    }
  }, []);

  // === Hierarchy Management ===

  const addParentGroup = useCallback(async (groupId: number, parentGroupId: number): Promise<void> => {
    try {
      await groupService.addParentGroup(groupId, parentGroupId);
      
      // Refresh hierarchy and groups
      await Promise.all([
        loadGroupHierarchy(),
        refreshGroups()
      ]);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add parent group'
      }));
      throw error;
    }
  }, [loadGroupHierarchy, refreshGroups]);

  const removeParentGroup = useCallback(async (groupId: number, parentGroupId: number): Promise<void> => {
    try {
      await groupService.removeParentGroup(groupId, parentGroupId);
      
      // Refresh hierarchy and groups
      await Promise.all([
        loadGroupHierarchy(),
        refreshGroups()
      ]);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove parent group'
      }));
      throw error;
    }
  }, [loadGroupHierarchy, refreshGroups]);

  const getGroupParents = useCallback(async (groupId: number): Promise<Group[]> => {
    try {
      const response = await groupService.getGroupParents(groupId);
      return response.data;
    } catch (error) {
      console.error('Failed to get group parents:', error);
      return [];
    }
  }, []);

  const getGroupChildren = useCallback(async (groupId: number): Promise<Group[]> => {
    try {
      const response = await groupService.getGroupChildren(groupId);
      return response.data;
    } catch (error) {
      console.error('Failed to get group children:', error);
      return [];
    }
  }, []);

  // === Bulk Operations ===

  const bulkCreateGroups = useCallback(async (groupsData: GroupCreate[]): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await groupService.bulkCreateGroups(groupsData);
      await Promise.all([
        refreshGroups(),
        loadGroupHierarchy()
      ]);
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk create groups'
      }));
      throw error;
    }
  }, [refreshGroups, loadGroupHierarchy]);

  const bulkUpdateGroups = useCallback(async (
    updates: Array<{ id: number; updates: GroupUpdate }>
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await groupService.bulkUpdateGroups(updates);
      await refreshGroups();
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk update groups'
      }));
      throw error;
    }
  }, [refreshGroups]);

  const bulkAddUsersToGroups = useCallback(async (
    groupIds: number[], 
    userIds: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await groupService.bulkAddUsersToGroups(groupIds, userIds);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk add users to groups'
      }));
      throw error;
    }
  }, []);

  const bulkRemoveUsersFromGroups = useCallback(async (
    groupIds: number[], 
    userIds: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await groupService.bulkRemoveUsersFromGroups(groupIds, userIds);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk remove users from groups'
      }));
      throw error;
    }
  }, []);

  const bulkAssignRolesToGroups = useCallback(async (
    groupIds: number[], 
    roleIds: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await groupService.bulkAssignRolesToGroups(groupIds, roleIds);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk assign roles to groups'
      }));
      throw error;
    }
  }, []);

  const bulkRemoveRolesFromGroups = useCallback(async (
    groupIds: number[], 
    roleIds: number[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await groupService.bulkRemoveRolesFromGroups(groupIds, roleIds);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to bulk remove roles from groups'
      }));
      throw error;
    }
  }, []);

  // === Analytics & Reporting ===

  const getGroupAnalytics = useCallback(async (
    timeRange?: { start: string; end: string }
  ): Promise<any> => {
    try {
      const response = await groupService.getGroupAnalytics(timeRange);
      return response.data;
    } catch (error) {
      console.error('Failed to get group analytics:', error);
      return null;
    }
  }, []);

  const getGroupUsageStats = useCallback(async (groupId: number): Promise<any> => {
    try {
      const response = await groupService.getGroupUsageStats(groupId);
      return response.data;
    } catch (error) {
      console.error('Failed to get group usage stats:', error);
      return null;
    }
  }, []);

  const getGroupAccessPatterns = useCallback(async (groupId: number, days: number = 30): Promise<any> => {
    try {
      const response = await groupService.getGroupAccessPatterns(groupId, days);
      return response.data;
    } catch (error) {
      console.error('Failed to get group access patterns:', error);
      return null;
    }
  }, []);

  // === Selection Management ===

  const selectGroup = useCallback((group: Group): void => {
    setState(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.find(g => g.id === group.id) 
        ? prev.selectedGroups 
        : [...prev.selectedGroups, group]
    }));
  }, []);

  const deselectGroup = useCallback((groupId: number): void => {
    setState(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.filter(group => group.id !== groupId)
    }));
  }, []);

  const selectAllGroups = useCallback((): void => {
    setState(prev => ({ ...prev, selectedGroups: [...prev.groups] }));
  }, []);

  const clearSelection = useCallback((): void => {
    setState(prev => ({ ...prev, selectedGroups: [] }));
  }, []);

  const toggleGroupSelection = useCallback((group: Group): void => {
    setState(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.find(g => g.id === group.id)
        ? prev.selectedGroups.filter(g => g.id !== group.id)
        : [...prev.selectedGroups, group]
    }));
  }, []);

  // === Advanced Features ===

  const exportGroups = useCallback(async (
    format: 'csv' | 'xlsx' | 'json', 
    selectedOnly: boolean = false
  ): Promise<void> => {
    try {
      const groupIds = selectedOnly 
        ? state.selectedGroups.map(group => group.id)
        : undefined;
      
      await groupService.exportGroups(groupIds, format);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export groups'
      }));
      throw error;
    }
  }, [state.selectedGroups]);

  const importGroups = useCallback(async (
    file: File, 
    options: { skipDuplicates?: boolean; updateExisting?: boolean } = {}
  ): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    try {
      const response = await groupService.importGroups(file, options);
      await Promise.all([
        refreshGroups(),
        loadGroupHierarchy()
      ]);
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import groups'
      }));
      throw error;
    }
  }, [refreshGroups, loadGroupHierarchy]);

  const discoverSimilarGroups = useCallback(async (groupId: number): Promise<Group[]> => {
    try {
      const response = await groupService.discoverSimilarGroups(groupId);
      return response.data;
    } catch (error) {
      console.error('Failed to discover similar groups:', error);
      return [];
    }
  }, []);

  const getGroupRecommendations = useCallback(async (userId: number): Promise<Group[]> => {
    try {
      const response = await groupService.getGroupRecommendations(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to get group recommendations:', error);
      return [];
    }
  }, []);

  // === Templates & Configuration ===

  const getGroupTemplates = useCallback(async (): Promise<any[]> => {
    try {
      const response = await groupService.getGroupTemplates();
      return response.data;
    } catch (error) {
      console.error('Failed to get group templates:', error);
      return [];
    }
  }, []);

  const createGroupTemplate = useCallback(async (name: string, groupId: number): Promise<any> => {
    try {
      const response = await groupService.createGroupTemplate({ name, groupId });
      return response.data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create group template'
      }));
      throw error;
    }
  }, []);

  const applyGroupTemplate = useCallback(async (templateId: string, customizations?: any): Promise<Group> => {
    try {
      const response = await groupService.applyGroupTemplate(templateId, customizations);
      const newGroup = response.data;
      
      setState(prev => ({
        ...prev,
        groups: [newGroup, ...prev.groups],
        totalCount: prev.totalCount + 1,
        lastUpdated: new Date()
      }));
      
      return newGroup;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply group template'
      }));
      throw error;
    }
  }, []);

  // === Invitations & Access Requests ===

  const sendGroupInvitation = useCallback(async (groupId: number, email: string, role?: string): Promise<void> => {
    try {
      await groupService.sendGroupInvitation(groupId, email, role);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send group invitation'
      }));
      throw error;
    }
  }, []);

  const acceptGroupInvitation = useCallback(async (invitationId: string): Promise<void> => {
    try {
      await groupService.acceptGroupInvitation(invitationId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to accept group invitation'
      }));
      throw error;
    }
  }, []);

  const declineGroupInvitation = useCallback(async (invitationId: string): Promise<void> => {
    try {
      await groupService.declineGroupInvitation(invitationId);
      setState(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to decline group invitation'
      }));
      throw error;
    }
  }, []);

  const getGroupInvitations = useCallback(async (groupId: number): Promise<any[]> => {
    try {
      const response = await groupService.getGroupInvitations(groupId);
      return response.data;
    } catch (error) {
      console.error('Failed to get group invitations:', error);
      return [];
    }
  }, []);

  // === Validation & Testing ===

  const validateGroup = useCallback(async (groupData: Partial<Group>): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const response = await groupService.validateGroup(groupData);
      return response.data;
    } catch (error) {
      console.error('Failed to validate group:', error);
      return { valid: false, errors: ['Validation failed'] };
    }
  }, []);

  const testGroupPermissions = useCallback(async (
    groupId: number, 
    action: string, 
    resource?: string, 
    resourceId?: string
  ): Promise<{ hasAccess: boolean; reason?: string }> => {
    try {
      const response = await groupService.testGroupPermissions(groupId, action, resource, resourceId);
      return response.data;
    } catch (error) {
      console.error('Failed to test group permissions:', error);
      return { hasAccess: false, reason: 'Test failed' };
    }
  }, []);

  // === Utility ===

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      groups: [],
      totalCount: 0,
      selectedGroups: [],
      groupHierarchy: null,
      lastUpdated: null,
      error: null
    }));
  }, []);

  const resetPagination = useCallback((): void => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Computed values
  const computedValues = useMemo(() => ({
    systemGroups: state.groups.filter(group => group.isSystem),
    customGroups: state.groups.filter(group => !group.isSystem),
    totalPages: Math.ceil(state.totalCount / state.pageSize),
    isAllSelected: state.selectedGroups.length === state.groups.length && state.groups.length > 0,
    isPartiallySelected: state.selectedGroups.length > 0 && state.selectedGroups.length < state.groups.length,
    selectedGroupIds: state.selectedGroups.map(group => group.id),
    hasData: state.groups.length > 0,
    isEmpty: !state.isLoading && state.groups.length === 0,
    canLoadMore: state.hasNextPage,
    totalMembers: state.groups.reduce((sum, group) => sum + (group.memberCount || 0), 0)
  }), [state]);

  return {
    ...state,
    ...computedValues,
    
    // Data Loading
    loadGroups,
    refreshGroups,
    searchGroups,
    loadGroupHierarchy,
    
    // Filtering & Sorting
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    
    // Group Operations
    createGroup,
    updateGroup,
    deleteGroup,
    
    // Member Management
    getGroupMembers,
    addUserToGroup,
    removeUserFromGroup,
    updateGroupMembership,
    getUserGroups,
    
    // Role Management
    getGroupRoles,
    assignRoleToGroup,
    removeRoleFromGroup,
    getGroupEffectivePermissions,
    
    // Hierarchy Management
    addParentGroup,
    removeParentGroup,
    getGroupParents,
    getGroupChildren,
    
    // Bulk Operations
    bulkCreateGroups,
    bulkUpdateGroups,
    bulkAddUsersToGroups,
    bulkRemoveUsersFromGroups,
    bulkAssignRolesToGroups,
    bulkRemoveRolesFromGroups,
    
    // Analytics & Reporting
    getGroupAnalytics,
    getGroupUsageStats,
    getGroupAccessPatterns,
    
    // Selection Management
    selectGroup,
    deselectGroup,
    selectAllGroups,
    clearSelection,
    toggleGroupSelection,
    
    // Advanced Features
    exportGroups,
    importGroups,
    discoverSimilarGroups,
    getGroupRecommendations,
    
    // Templates & Configuration
    getGroupTemplates,
    createGroupTemplate,
    applyGroupTemplate,
    
    // Invitations & Access Requests
    sendGroupInvitation,
    acceptGroupInvitation,
    declineGroupInvitation,
    getGroupInvitations,
    
    // Validation & Testing
    validateGroup,
    testGroupPermissions,
    
    // Utility
    clearCache,
    resetPagination
  };
}

export default useGroups;