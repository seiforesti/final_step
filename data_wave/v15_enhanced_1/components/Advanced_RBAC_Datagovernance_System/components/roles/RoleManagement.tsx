'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  KeyIcon,
  ShieldCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  StarIcon,
  BoltIcon,
  SparklesIcon,
  TagIcon,
  ClockIcon,
  UsersIcon,
  CogIcon,
  ShareIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CommandLineIcon,
  CalendarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { TreePine } from 'lucide-react';
import { roleService } from '../../services/role.service';
import { userService } from '../../services/user.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useRoles } from '../../hooks/useRoles';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { formatDate, formatRelativeTime, formatUserName } from '../../utils/format.utils';
import { hasPermission, getUserDisplayName, getRoleColor, logRbacAction, generateCorrelationId } from '../../utils/rbac.utils';
import { exportRolesToCsv, exportRolesToExcel } from '../../utils/export.utils';
import { validateRoleName, validateRoleHierarchy } from '../../utils/validation.utils';
import { RoleList } from './RoleList';
import { RoleDetails } from './RoleDetails';
import { RoleCreateEdit } from './RoleCreateEdit';
import { RoleInheritance } from './RoleInheritance';
import { RolePermissionMatrix } from './RolePermissionMatrix';
import type {
  Role,
  RoleWithStats,
  User,
  Permission,
  RoleFilters,
  RoleStats,
  PaginatedResponse,
  BulkOperation
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface RoleManagementProps {
  className?: string;
}

interface RoleAnalytics {
  totalRoles: number;
  activeRoles: number;
  inactiveRoles: number;
  rolesWithInheritance: number;
  averagePermissionsPerRole: number;
  totalUsers: number;
  mostUsedRoles: Array<{
    role: Role;
    userCount: number;
    permissionCount: number;
  }>;
  roleGrowthTrend: Array<{
    date: string;
    count: number;
  }>;
  categoryBreakdown: { [category: string]: number };
  hierarchyDepth: number;
  orphanedRoles: Role[];
}

interface ViewSettings {
  mode: 'list' | 'grid' | 'table' | 'tree';
  density: 'compact' | 'comfortable' | 'spacious';
  showInactive: boolean;
  showHierarchy: boolean;
  groupByCategory: boolean;
}

interface BulkRoleOperation extends BulkOperation {
  type: 'activate' | 'deactivate' | 'delete' | 'assign_users' | 'remove_users' | 'export';
  roleIds: number[];
}

// ============================================================================
// ADVANCED ROLE MANAGEMENT COMPONENT
// ============================================================================

export const RoleManagement: React.FC<RoleManagementProps> = ({
  className = ''
}) => {
  // State Management
  const [roles, setRoles] = useState<RoleWithStats[]>([]);
  const [analytics, setAnalytics] = useState<RoleAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set());
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'details' | 'inheritance' | 'matrix' | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [bulkOperation, setBulkOperation] = useState<BulkRoleOperation | null>(null);
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    mode: 'table',
    density: 'comfortable',
    showInactive: true,
    showHierarchy: false,
    groupByCategory: false
  });
  const [filters, setFilters] = useState<RoleFilters>({
    search: '',
    category: '',
    status: 'all',
    hasUsers: 'all',
    hasPermissions: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 50
  });

  // Hooks
  const { currentUser } = useCurrentUser();
  const { 
    roles: hookRoles, 
    isLoading: hookLoading, 
    error: hookError, 
    refresh: refreshRoles,
    totalCount
  } = useRoles(filters);
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Permission checks
  const canCreateRole = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'roles.create', '*'), [currentUser]);
  const canEditRoles = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'roles.edit', '*'), [currentUser]);
  const canDeleteRoles = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'roles.delete', '*'), [currentUser]);
  const canViewAnalytics = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'analytics.view', 'roles'), [currentUser]);
  const canManageHierarchy = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'roles.hierarchy.manage', '*'), [currentUser]);

  // ============================================================================
  // DATA FETCHING & ANALYTICS
  // ============================================================================

  const fetchAnalytics = useCallback(async () => {
    if (!canViewAnalytics) return;

    try {
      const response = await roleService.getRoleAnalytics();
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Failed to fetch role analytics:', error);
    }
  }, [canViewAnalytics]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        refreshRoles(),
        fetchAnalytics()
      ]);
    } catch (error: any) {
      setError(error.message || 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [refreshRoles, fetchAnalytics]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (hookRoles) {
      setRoles(hookRoles);
    }
    setIsLoading(hookLoading);
    setError(hookError);
  }, [hookRoles, hookLoading, hookError]);

  // WebSocket subscriptions for real-time updates
  useEffect(() => {
    const handleRoleUpdate = (data: any) => {
      if (data.type === 'role_updated' || data.type === 'role_created' || data.type === 'role_deleted') {
        refreshRoles();
        fetchAnalytics();
      }
    };

    subscribe('role_updates', handleRoleUpdate);
    return () => unsubscribe('role_updates', handleRoleUpdate);
  }, [subscribe, unsubscribe, refreshRoles, fetchAnalytics]);

  // ============================================================================
  // ROLE OPERATIONS
  // ============================================================================

  const handleCreateRole = useCallback(async (roleData: any) => {
    if (!canCreateRole) return;

    try {
      const correlationId = generateCorrelationId();
      const response = await roleService.createRole(roleData);
      
      await logRbacAction(
        'role_created',
        currentUser?.email || 'system',
        {
          role: response.data.name,
          correlation_id: correlationId
        }
      );

      await refreshData();
      setActiveModal(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create role');
    }
  }, [canCreateRole, currentUser, refreshData]);

  const handleEditRole = useCallback(async (roleId: number, roleData: any) => {
    if (!canEditRoles) return;

    try {
      const correlationId = generateCorrelationId();
      const response = await roleService.updateRole(roleId, roleData);
      
      await logRbacAction(
        'role_updated',
        currentUser?.email || 'system',
        {
          role: response.data.name,
          correlation_id: correlationId
        }
      );

      await refreshData();
      setActiveModal(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update role');
    }
  }, [canEditRoles, currentUser, refreshData]);

  const handleDeleteRole = useCallback(async (roleId: number) => {
    if (!canDeleteRoles) return;

    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const correlationId = generateCorrelationId();
      await roleService.deleteRole(roleId);
      
      await logRbacAction(
        'role_deleted',
        currentUser?.email || 'system',
        {
          role: role.name,
          correlation_id: correlationId
        }
      );

      await refreshData();
      setSelectedRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(roleId);
        return newSet;
      });
    } catch (error: any) {
      setError(error.message || 'Failed to delete role');
    }
  }, [canDeleteRoles, roles, currentUser, refreshData]);

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const handleBulkOperation = useCallback(async (operation: BulkRoleOperation['type']) => {
    if (selectedRoles.size === 0) return;

    const roleIds = Array.from(selectedRoles);
    setBulkOperation({
      type: operation,
      roleIds,
      isProcessing: true,
      progress: 0,
      errors: []
    });

    try {
      const correlationId = generateCorrelationId();
      let completed = 0;
      const errors: string[] = [];
      const total = roleIds.length;

      for (const roleId of roleIds) {
        try {
          const role = roles.find(r => r.id === roleId);
          if (!role) continue;

          switch (operation) {
            case 'activate':
              if (canEditRoles) {
                await roleService.updateRole(roleId, { is_active: true });
              }
              break;
            case 'deactivate':
              if (canEditRoles) {
                await roleService.updateRole(roleId, { is_active: false });
              }
              break;
            case 'delete':
              if (canDeleteRoles) {
                await roleService.deleteRole(roleId);
              }
              break;
            case 'export':
              // Handle export separately
              break;
          }
          completed++;
        } catch (error: any) {
          const roleName = roles.find(r => r.id === roleId)?.name || `Role ${roleId}`;
          errors.push(`Failed to ${operation} ${roleName}: ${error.message}`);
        }

        setBulkOperation(prev => prev ? {
          ...prev,
          progress: (completed / total) * 100
        } : null);
      }

      // Handle export operation
      if (operation === 'export') {
        const rolesToExport = roles.filter(role => roleIds.includes(role.id));
        await exportRolesToCsv(rolesToExport);
        completed = total;
      }

      // Log bulk action
      await logRbacAction(
        `bulk_roles_${operation}`,
        currentUser?.email || 'system',
        {
          role_count: completed,
          correlation_id: correlationId
        }
      );

      setBulkOperation(prev => prev ? {
        ...prev,
        isProcessing: false,
        errors
      } : null);

      // Clear selection and refresh
      setSelectedRoles(new Set());
      if (operation !== 'export') {
        await refreshData();
      }

      // Clear bulk operation after delay
      setTimeout(() => setBulkOperation(null), 3000);

    } catch (error: any) {
      setBulkOperation(prev => prev ? {
        ...prev,
        isProcessing: false,
        errors: [error.message || `Failed to ${operation} roles`]
      } : null);
    }
  }, [selectedRoles, roles, canEditRoles, canDeleteRoles, currentUser, refreshData]);

  // ============================================================================
  // UI HANDLERS
  // ============================================================================

  const handleRoleSelection = useCallback((roleId: number, selected: boolean) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(roleId);
      } else {
        newSet.delete(roleId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allRoleIds = roles.map(role => role.id);
    setSelectedRoles(new Set(allRoleIds));
  }, [roles]);

  const handleClearSelection = useCallback(() => {
    setSelectedRoles(new Set());
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<RoleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handleViewSettingsChange = useCallback((newSettings: Partial<ViewSettings>) => {
    setViewSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredRoles = useMemo(() => {
    let filtered = roles;

    if (!viewSettings.showInactive) {
      filtered = filtered.filter(role => role.is_active);
    }

    return filtered;
  }, [roles, viewSettings.showInactive]);

  const roleCategories = useMemo(() => {
    const categories = new Set(roles.map(role => role.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [roles]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderAnalyticsDashboard = () => {
    if (!canViewAnalytics || !analytics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Roles */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Roles</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalRoles}</p>
              <p className="text-sm text-gray-600">
                {analytics.activeRoles} active • {analytics.inactiveRoles} inactive
              </p>
            </div>
          </div>
        </div>

        {/* Users Assigned */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Users Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalUsers}</p>
              <p className="text-sm text-gray-600">
                Avg {Math.round(analytics.totalUsers / analytics.totalRoles)} per role
              </p>
            </div>
          </div>
        </div>

        {/* Average Permissions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <KeyIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Permissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(analytics.averagePermissionsPerRole)}
              </p>
              <p className="text-sm text-gray-600">per role</p>
            </div>
          </div>
        </div>

        {/* Hierarchy Depth */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
                              <TreePine className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hierarchy Depth</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.hierarchyDepth}</p>
              <p className="text-sm text-gray-600">
                {analytics.rolesWithInheritance} with inheritance
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderToolbar = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left side - Search and Filters */}
        <div className="flex flex-1 items-center space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {roleCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Advanced Filters Toggle */}
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Right side - Actions and View Controls */}
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleViewSettingsChange({ mode: 'table' })}
              className={`p-2 ${viewSettings.mode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Table view"
            >
              <TableCellsIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewSettingsChange({ mode: 'grid' })}
              className={`p-2 ${viewSettings.mode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewSettingsChange({ mode: 'list' })}
              className={`p-2 ${viewSettings.mode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
            {canManageHierarchy && (
              <button
                onClick={() => handleViewSettingsChange({ mode: 'tree' })}
                className={`p-2 ${viewSettings.mode === 'tree' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Tree view"
              >
                <TreePine className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Create Role */}
          {canCreateRole && (
            <button
              onClick={() => setActiveModal('create')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Role
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRoles.size > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedRoles.size} role{selectedRoles.size !== 1 ? 's' : ''} selected
              </span>
              
              <button
                onClick={handleClearSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {canEditRoles && (
                <>
                  <button
                    onClick={() => handleBulkOperation('activate')}
                    disabled={bulkOperation?.isProcessing}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Activate
                  </button>
                  
                  <button
                    onClick={() => handleBulkOperation('deactivate')}
                    disabled={bulkOperation?.isProcessing}
                    className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Deactivate
                  </button>
                </>
              )}
              
              <button
                onClick={() => handleBulkOperation('export')}
                disabled={bulkOperation?.isProcessing}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                Export
              </button>

              {canDeleteRoles && (
                <button
                  onClick={() => handleBulkOperation('delete')}
                  disabled={bulkOperation?.isProcessing}
                  className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Bulk Operation Progress */}
          {bulkOperation && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-900">
                  {bulkOperation.type === 'activate' ? 'Activating' :
                   bulkOperation.type === 'deactivate' ? 'Deactivating' :
                   bulkOperation.type === 'delete' ? 'Deleting' :
                   bulkOperation.type === 'export' ? 'Exporting' :
                   'Processing'} roles...
                </span>
                <span className="text-blue-600">
                  {Math.round(bulkOperation.progress)}%
                </span>
              </div>
              <div className="mt-1 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${bulkOperation.progress}%` }}
                />
              </div>
              
              {bulkOperation.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  <ul className="list-disc pl-4">
                    {bulkOperation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderRoleActions = (role: Role) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => {
          setSelectedRole(role);
          setActiveModal('details');
        }}
        className="p-1 text-gray-400 hover:text-gray-600"
        title="View details"
      >
        <EyeIcon className="h-4 w-4" />
      </button>

      {canEditRoles && (
        <button
          onClick={() => {
            setSelectedRole(role);
            setActiveModal('edit');
          }}
          className="p-1 text-gray-400 hover:text-blue-600"
          title="Edit role"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      )}

      {canDeleteRoles && (
        <button
          onClick={() => handleDeleteRole(role.id)}
          className="p-1 text-gray-400 hover:text-red-600"
          title="Delete role"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading && !roles.length) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading roles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Dashboard */}
      {renderAnalyticsDashboard()}

      {/* Toolbar */}
      {renderToolbar()}

      {/* Role List */}
      <RoleList
        roles={filteredRoles}
        selectedRoles={selectedRoles}
        viewMode={viewSettings.mode}
        onRoleSelect={handleRoleSelection}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onRoleAction={renderRoleActions}
        isLoading={isLoading}
        totalCount={totalCount}
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'create' && (
          <RoleCreateEdit
            isOpen={true}
            mode="create"
            onClose={() => setActiveModal(null)}
            onSave={handleCreateRole}
          />
        )}

        {activeModal === 'edit' && selectedRole && (
          <RoleCreateEdit
            isOpen={true}
            mode="edit"
            role={selectedRole}
            onClose={() => {
              setActiveModal(null);
              setSelectedRole(null);
            }}
            onSave={(data) => handleEditRole(selectedRole.id, data)}
          />
        )}

        {activeModal === 'details' && selectedRole && (
          <RoleDetails
            role={selectedRole}
            isOpen={true}
            onClose={() => {
              setActiveModal(null);
              setSelectedRole(null);
            }}
            onEdit={() => setActiveModal('edit')}
            onDelete={() => handleDeleteRole(selectedRole.id)}
          />
        )}

        {activeModal === 'inheritance' && (
          <RoleInheritance
            isOpen={true}
            onClose={() => setActiveModal(null)}
            roles={roles}
            onHierarchyChange={refreshData}
          />
        )}

        {activeModal === 'matrix' && (
          <RolePermissionMatrix
            isOpen={true}
            onClose={() => setActiveModal(null)}
            roles={roles}
          />
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        {canManageHierarchy && (
          <button
            onClick={() => setActiveModal('inheritance')}
            className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            title="Manage role hierarchy"
          >
                            <TreePine className="h-6 w-6" />
          </button>
        )}

        <button
          onClick={() => setActiveModal('matrix')}
          className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          title="View permission matrix"
        >
          <TableCellsIcon className="h-6 w-6" />
        </button>

        {canCreateRole && (
          <button
            onClick={() => setActiveModal('create')}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Create new role"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};