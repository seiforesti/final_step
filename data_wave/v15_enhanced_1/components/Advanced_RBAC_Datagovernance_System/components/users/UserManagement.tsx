'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { UserIcon, UsersIcon, PlusIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, EllipsisHorizontalIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, ChartBarIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, Cog6ToothIcon, ShieldCheckIcon, ClockIcon, MapPinIcon, DevicePhoneMobileIcon, EnvelopeIcon, CalendarIcon, EyeIcon, PencilIcon, TrashIcon, UserPlusIcon, UserMinusIcon, KeyIcon, BoltIcon, StarIcon, ExclamationCircleIcon, ChevronDownIcon, ChevronRightIcon, ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useUsers } from '../../hooks/useUsers';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { formatDate, formatRelativeTime, formatUserName, formatUserEmail } from '../../utils/format.utils';
import { exportUsersToCSV, exportUsersToJSON, exportUsersToExcel } from '../../utils/export.utils';
import { validateUserEmail, validateUserProfile } from '../../utils/validation.utils';
import { hasPermission, logRbacAction } from '../../utils/rbac.utils';
import { UserList } from './UserList';
import { UserDetails } from './UserDetails';
import { UserCreateEdit } from './UserCreateEdit';
import { UserRoleAssignment } from './UserRoleAssignment';
import { UserPermissionView } from './UserPermissionView';
import type {
  User,
  UserFilters,
  UserBulkAction,
  UserStats,
  UserActivity,
  UserExportOptions,
  PaginationState
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UserManagementState {
  users: User[];
  filteredUsers: User[];
  selectedUsers: Set<number>;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: UserFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'list' | 'grid' | 'table';
  pagination: PaginationState;
  showFilters: boolean;
  showBulkActions: boolean;
  activeModal: 'create' | 'edit' | 'details' | 'roles' | 'permissions' | 'import' | 'export' | null;
  selectedUser: User | null;
  bulkActionInProgress: string | null;
}

interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersWithMFA: number;
  newUsersThisMonth: number;
  usersByDepartment: Record<string, number>;
  usersByRegion: Record<string, number>;
  usersByRole: Record<string, number>;
  recentActivity: UserActivity[];
  growthTrend: Array<{ date: string; count: number }>;
}

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
  processed: number;
}

// ============================================================================
// ADVANCED USER MANAGEMENT COMPONENT
// ============================================================================

export const UserManagement: React.FC = () => {
  // State Management
  const [state, setState] = useState<UserManagementState>({
    users: [],
    filteredUsers: [],
    selectedUsers: new Set(),
    isLoading: true,
    error: null,
    searchQuery: '',
    filters: {},
    sortBy: 'created_at',
    sortOrder: 'desc',
    viewMode: 'table',
    pagination: {
      page: 1,
      pageSize: 25,
      total: 0,
      hasNextPage: false,
      hasPreviousPage: false
    },
    showFilters: false,
    showBulkActions: false,
    activeModal: null,
    selectedUser: null,
    bulkActionInProgress: null
  });

  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Hooks & Refs
  const { currentUser, permissions } = useCurrentUser();
  const { connected: wsConnected, lastMessage } = useRBACWebSocket();
  const controls = useAnimation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Permission checks
  const canViewUsers = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.view', '*'), [currentUser]);
  const canCreateUsers = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.create', '*'), [currentUser]);
  const canEditUsers = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.edit', '*'), [currentUser]);
  const canDeleteUsers = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.delete', '*'), [currentUser]);
  const canManageRoles = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'roles.assign', '*'), [currentUser]);

  // ============================================================================
  // DATA FETCHING & MANAGEMENT
  // ============================================================================

  const fetchUsers = useCallback(async (options: {
    page?: number;
    pageSize?: number;
    search?: string;
    filters?: UserFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await userService.getUsers({
        page: options.page || state.pagination.page,
        page_size: options.pageSize || state.pagination.pageSize,
        search: options.search || state.searchQuery,
        ...options.filters || state.filters,
        sort_by: options.sortBy || state.sortBy,
        sort_order: options.sortOrder || state.sortOrder
      });

      setState(prev => ({
        ...prev,
        users: response.data.items,
        filteredUsers: response.data.items,
        pagination: {
          page: response.data.page,
          pageSize: response.data.page_size,
          total: response.data.total,
          hasNextPage: response.data.has_next_page,
          hasPreviousPage: response.data.page > 1
        },
        isLoading: false
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch users',
        isLoading: false
      }));
    }
  }, [state.pagination.page, state.pagination.pageSize, state.searchQuery, state.filters, state.sortBy, state.sortOrder]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await userService.getUserAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchUsers(),
      fetchAnalytics()
    ]);
  }, [fetchUsers, fetchAnalytics]);

  // ============================================================================
  // SEARCH & FILTERING
  // ============================================================================

  const handleSearch = useCallback(async (query: string) => {
    setState(prev => ({ 
      ...prev, 
      searchQuery: query,
      pagination: { ...prev.pagination, page: 1 }
    }));
    
    await fetchUsers({ 
      search: query, 
      page: 1 
    });
  }, [fetchUsers]);

  const handleFilterChange = useCallback(async (newFilters: UserFilters) => {
    setState(prev => ({ 
      ...prev, 
      filters: newFilters,
      pagination: { ...prev.pagination, page: 1 }
    }));
    
    await fetchUsers({ 
      filters: newFilters, 
      page: 1 
    });
  }, [fetchUsers]);

  const handleSort = useCallback(async (sortBy: string) => {
    const sortOrder = state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc';
    
    setState(prev => ({ 
      ...prev, 
      sortBy, 
      sortOrder 
    }));
    
    await fetchUsers({ sortBy, sortOrder });
  }, [state.sortBy, state.sortOrder, fetchUsers]);

  const clearFilters = useCallback(async () => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      filters: {},
      pagination: { ...prev.pagination, page: 1 }
    }));
    
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    
    await fetchUsers({ search: '', filters: {}, page: 1 });
  }, [fetchUsers]);

  // ============================================================================
  // USER SELECTION & BULK ACTIONS
  // ============================================================================

  const handleUserSelection = useCallback((userId: number, selected: boolean) => {
    setState(prev => {
      const newSelectedUsers = new Set(prev.selectedUsers);
      if (selected) {
        newSelectedUsers.add(userId);
      } else {
        newSelectedUsers.delete(userId);
      }
      return {
        ...prev,
        selectedUsers: newSelectedUsers,
        showBulkActions: newSelectedUsers.size > 0
      };
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedUsers: selected ? new Set(prev.filteredUsers.map(u => u.id)) : new Set(),
      showBulkActions: selected && prev.filteredUsers.length > 0
    }));
  }, []);

  const executeBulkAction = useCallback(async (
    action: UserBulkAction,
    userIds: number[]
  ): Promise<BulkOperationResult> => {
    if (!currentUser) throw new Error('No current user');

    setState(prev => ({ ...prev, bulkActionInProgress: action.type }));

    try {
      let result: BulkOperationResult;

      switch (action.type) {
        case 'activate':
          result = await userService.bulkActivateUsers(userIds, currentUser.email);
          break;
        case 'deactivate':
          result = await userService.bulkDeactivateUsers(userIds, currentUser.email);
          break;
        case 'delete':
          result = await userService.bulkDeleteUsers(userIds, currentUser.email);
          break;
        case 'assign_role':
          if (!action.roleId) throw new Error('Role ID required');
          result = await userService.bulkAssignRole(userIds, action.roleId, currentUser.email);
          break;
        case 'remove_role':
          if (!action.roleId) throw new Error('Role ID required');
          result = await userService.bulkRemoveRole(userIds, action.roleId, currentUser.email);
          break;
        case 'send_verification':
          result = await userService.bulkSendVerification(userIds, currentUser.email);
          break;
        case 'reset_password':
          result = await userService.bulkResetPassword(userIds, currentUser.email);
          break;
        default:
          throw new Error(`Unknown bulk action: ${action.type}`);
      }

      // Log bulk action
      await logRbacAction(`bulk_${action.type}`, currentUser.email, {
        resource_type: 'user',
        status: 'success',
        note: `Bulk ${action.type} performed on ${userIds.length} users`,
        after_state: { result, user_ids: userIds }
      });

      // Refresh data after bulk action
      await refreshData();

      // Clear selection
      setState(prev => ({
        ...prev,
        selectedUsers: new Set(),
        showBulkActions: false
      }));

      return result;

    } catch (error: any) {
      console.error('Bulk action failed:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, bulkActionInProgress: null }));
    }
  }, [currentUser, refreshData]);

  // ============================================================================
  // MODAL MANAGEMENT
  // ============================================================================

  const openModal = useCallback((modal: UserManagementState['activeModal'], user?: User) => {
    setState(prev => ({
      ...prev,
      activeModal: modal,
      selectedUser: user || null
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeModal: null,
      selectedUser: null
    }));
  }, []);

  const handleUserCreated = useCallback(async (user: User) => {
    await refreshData();
    closeModal();
  }, [refreshData, closeModal]);

  const handleUserUpdated = useCallback(async (user: User) => {
    await refreshData();
    closeModal();
  }, [refreshData, closeModal]);

  const handleUserDeleted = useCallback(async (userId: number) => {
    await refreshData();
    closeModal();
  }, [refreshData, closeModal]);

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'excel', options?: UserExportOptions) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const usersToExport = state.selectedUsers.size > 0 
        ? state.filteredUsers.filter(u => state.selectedUsers.has(u.id))
        : state.filteredUsers;

      let exportData: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'csv':
          exportData = exportUsersToCSV(usersToExport, options);
          filename = `users-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          exportData = exportUsersToJSON(usersToExport, options);
          filename = `users-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'excel':
          exportData = exportUsersToExcel(usersToExport, options);
          filename = `users-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Download file
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log export action
      if (currentUser) {
        await logRbacAction('export_users', currentUser.email, {
          resource_type: 'user',
          status: 'success',
          note: `Exported ${usersToExport.length} users in ${format} format`
        });
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Export failed'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedUsers, state.filteredUsers, currentUser]);

  // ============================================================================
  // EFFECTS & LIFECYCLE
  // ============================================================================

  useEffect(() => {
    if (canViewUsers) {
      refreshData();
    }
  }, [canViewUsers, refreshData]);

  useEffect(() => {
    if (autoRefresh && !state.isLoading) {
      intervalRef.current = setInterval(refreshData, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshData, state.isLoading]);

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage && currentUser) {
      const message = JSON.parse(lastMessage.data);
      
      if (message.type === 'user_updated' || 
          message.type === 'user_created' || 
          message.type === 'user_deleted') {
        refreshData();
      }
    }
  }, [lastMessage, currentUser, refreshData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'f':
            event.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'n':
            if (canCreateUsers) {
              event.preventDefault();
              openModal('create');
            }
            break;
          case 'r':
            event.preventDefault();
            refreshData();
            break;
        }
      }

      if (event.key === 'Escape') {
        if (state.activeModal) {
          closeModal();
        } else if (state.showFilters) {
          setState(prev => ({ ...prev, showFilters: false }));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canCreateUsers, openModal, refreshData, state.activeModal, state.showFilters, closeModal]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getViewModeIcon = (mode: string) => {
    switch (mode) {
      case 'list': return <ListBulletIcon className="h-4 w-4" />;
      case 'grid': return <Squares2X2Icon className="h-4 w-4" />;
      case 'table': return <ChartBarIcon className="h-4 w-4" />;
      default: return <ListBulletIcon className="h-4 w-4" />;
    }
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              +{analytics.newUsersThisMonth}
            </span>
            <span className="text-gray-500 ml-2">this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.activeUsers}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% of total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.verifiedUsers}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              {Math.round((analytics.verifiedUsers / analytics.totalUsers) * 100)}% verified
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With MFA</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.usersWithMFA}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <KeyIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              {Math.round((analytics.usersWithMFA / analytics.totalUsers) * 100)}% secured
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderToolbar = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6"
    >
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
            />
          </div>

          <button
            onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            className={`inline-flex items-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              state.showFilters || Object.keys(state.filters).length > 0
                ? 'border-blue-300 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
            {Object.keys(state.filters).length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {Object.keys(state.filters).length}
              </span>
            )}
          </button>

          {(state.searchQuery || Object.keys(state.filters).length > 0) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Clear
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {(['table', 'list', 'grid'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setState(prev => ({ ...prev, viewMode: mode }))}
                className={`p-2 rounded-md transition-colors ${
                  state.viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {getViewModeIcon(mode)}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={refreshData}
            disabled={state.isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => openModal('export')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>

          {/* Create User */}
          {canCreateUsers && (
            <button
              onClick={() => openModal('create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Auto Refresh Toggle */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-600">Auto-refresh</span>
          </label>
          
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value={15000}>15s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
            </select>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>
            Showing {state.filteredUsers.length} of {state.pagination.total} users
          </span>
          {wsConnected && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Live updates</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderBulkActions = () => {
    if (!state.showBulkActions || state.selectedUsers.size === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {state.selectedUsers.size} user{state.selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {canEditUsers && (
              <>
                <button
                  onClick={() => executeBulkAction({ type: 'activate' }, Array.from(state.selectedUsers))}
                  disabled={state.bulkActionInProgress === 'activate'}
                  className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Activate
                </button>
                
                <button
                  onClick={() => executeBulkAction({ type: 'deactivate' }, Array.from(state.selectedUsers))}
                  disabled={state.bulkActionInProgress === 'deactivate'}
                  className="inline-flex items-center px-3 py-1.5 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Deactivate
                </button>
              </>
            )}

            {canDeleteUsers && (
              <button
                onClick={() => executeBulkAction({ type: 'delete' }, Array.from(state.selectedUsers))}
                disabled={state.bulkActionInProgress === 'delete'}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            )}

            <button
              onClick={() => setState(prev => ({ ...prev, selectedUsers: new Set(), showBulkActions: false }))}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view users.
          </p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{state.error}</p>
          <button
            onClick={refreshData}
            className="ml-auto text-sm text-red-600 hover:text-red-500 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage users, roles, and permissions across your organization
          </p>
        </div>
      </div>

      {/* Analytics */}
      {renderAnalytics()}

      {/* Toolbar */}
      {renderToolbar()}

      {/* Bulk Actions */}
      <AnimatePresence>
        {renderBulkActions()}
      </AnimatePresence>

      {/* User List */}
      <UserList
        users={state.filteredUsers}
        selectedUsers={state.selectedUsers}
        viewMode={state.viewMode}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        isLoading={state.isLoading}
        pagination={state.pagination}
        onUserSelect={handleUserSelection}
        onSelectAll={handleSelectAll}
        onSort={handleSort}
        onPageChange={(page) => fetchUsers({ page })}
        onPageSizeChange={(pageSize) => fetchUsers({ pageSize, page: 1 })}
        onUserClick={(user) => openModal('details', user)}
        onEditUser={canEditUsers ? (user) => openModal('edit', user) : undefined}
        onDeleteUser={canDeleteUsers ? handleUserDeleted : undefined}
        onAssignRoles={canManageRoles ? (user) => openModal('roles', user) : undefined}
        onViewPermissions={(user) => openModal('permissions', user)}
      />

      {/* Modals */}
      <AnimatePresence>
        {state.activeModal === 'create' && (
          <UserCreateEdit
            mode="create"
            onClose={closeModal}
            onSave={handleUserCreated}
          />
        )}
        
        {state.activeModal === 'edit' && state.selectedUser && (
          <UserCreateEdit
            mode="edit"
            user={state.selectedUser}
            onClose={closeModal}
            onSave={handleUserUpdated}
          />
        )}
        
        {state.activeModal === 'details' && state.selectedUser && (
          <UserDetails
            user={state.selectedUser}
            onClose={closeModal}
            onEdit={canEditUsers ? () => openModal('edit', state.selectedUser) : undefined}
            onDelete={canDeleteUsers ? () => handleUserDeleted(state.selectedUser!.id) : undefined}
            onAssignRoles={canManageRoles ? () => openModal('roles', state.selectedUser) : undefined}
            onViewPermissions={() => openModal('permissions', state.selectedUser)}
          />
        )}
        
        {state.activeModal === 'roles' && state.selectedUser && (
          <UserRoleAssignment
            user={state.selectedUser}
            onClose={closeModal}
            onSave={handleUserUpdated}
          />
        )}
        
        {state.activeModal === 'permissions' && state.selectedUser && (
          <UserPermissionView
            user={state.selectedUser}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};