'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  BoltIcon,
  SparklesIcon,
  DocumentTextIcon,
  CogIcon,
  TagIcon,
  ClockIcon,
  GlobeAltIcon,
  LockClosedIcon,
  TreePineIcon,
  ShareIcon,
  AdjustmentsHorizontalIcon,
  TableCellsIcon,
  ListBulletIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { permissionService } from '../../services/permission.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { formatDate, formatRelativeTime, formatPermission } from '../../utils/format.utils';
import { hasPermission, getUserDisplayName, getRoleColor } from '../../utils/rbac.utils';
import type {
  User,
  Permission,
  EffectivePermission,
  PermissionMatrix,
  Role,
  Resource
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UserPermissionViewProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

interface PermissionWithSource extends Permission {
  source: 'direct' | 'role' | 'group' | 'inherited';
  sourceDetails: {
    roleName?: string;
    groupName?: string;
    inheritedFrom?: string;
    assignedAt?: Date;
  };
  isEffective: boolean;
  isDenied?: boolean;
  conflicts?: PermissionConflict[];
}

interface PermissionConflict {
  type: 'allow_deny' | 'multiple_sources' | 'condition_mismatch';
  description: string;
  severity: 'low' | 'medium' | 'high';
  sources: string[];
}

interface PermissionFilters {
  search: string;
  source: 'all' | 'direct' | 'role' | 'group' | 'inherited';
  resource: string;
  action: string;
  status: 'all' | 'effective' | 'denied' | 'conflicted';
  sortBy: 'action' | 'resource' | 'source' | 'assignedAt';
  sortOrder: 'asc' | 'desc';
}

interface PermissionAnalysis {
  totalPermissions: number;
  effectivePermissions: number;
  deniedPermissions: number;
  conflictedPermissions: number;
  sourceBreakdown: {
    direct: number;
    role: number;
    group: number;
    inherited: number;
  };
  resourceCoverage: { [resource: string]: number };
  actionCoverage: { [action: string]: number };
}

// ============================================================================
// ADVANCED USER PERMISSION VIEW COMPONENT
// ============================================================================

export const UserPermissionView: React.FC<UserPermissionViewProps> = ({
  user,
  isOpen,
  onClose
}) => {
  // State Management
  const [permissions, setPermissions] = useState<PermissionWithSource[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix | null>(null);
  const [analysis, setAnalysis] = useState<PermissionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'matrix' | 'tree' | 'analysis'>('list');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'tree'>('table');
  const [filters, setFilters] = useState<PermissionFilters>({
    search: '',
    source: 'all',
    resource: '',
    action: '',
    status: 'all',
    sortBy: 'action',
    sortOrder: 'asc'
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['effective', 'roles']));
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());

  // Hooks
  const { currentUser } = useCurrentUser();

  // Permission checks
  const canViewPermissions = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.permissions.view', user.id.toString()), [currentUser, user.id]);
  const canViewDetails = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'permissions.view', '*'), [currentUser]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchPermissions = useCallback(async () => {
    if (!canViewPermissions) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user's effective permissions with source information
      const [effectiveResponse, matrixResponse] = await Promise.all([
        userService.getUserEffectivePermissions(user.id),
        userService.getUserPermissionMatrix(user.id)
      ]);

      const effectivePermissions = effectiveResponse.data || [];
      const matrix = matrixResponse.data;

      // Transform permissions with source information
      const permissionsWithSource: PermissionWithSource[] = effectivePermissions.map(perm => ({
        ...perm,
        source: perm.source as any || 'direct',
        sourceDetails: {
          roleName: perm.source_role_name,
          groupName: perm.source_group_name,
          inheritedFrom: perm.inherited_from,
          assignedAt: perm.assigned_at ? new Date(perm.assigned_at) : undefined
        },
        isEffective: !perm.is_denied,
        isDenied: perm.is_denied,
        conflicts: perm.conflicts || []
      }));

      setPermissions(permissionsWithSource);
      setPermissionMatrix(matrix);

      // Generate analysis
      const analysisData = generatePermissionAnalysis(permissionsWithSource);
      setAnalysis(analysisData);

    } catch (error: any) {
      setError(error.message || 'Failed to fetch permissions');
    } finally {
      setIsLoading(false);
    }
  }, [user.id, canViewPermissions]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      fetchPermissions();
    }
  }, [isOpen, fetchPermissions]);

  // ============================================================================
  // ANALYSIS & FILTERING
  // ============================================================================

  const generatePermissionAnalysis = useCallback((perms: PermissionWithSource[]): PermissionAnalysis => {
    const analysis: PermissionAnalysis = {
      totalPermissions: perms.length,
      effectivePermissions: perms.filter(p => p.isEffective).length,
      deniedPermissions: perms.filter(p => p.isDenied).length,
      conflictedPermissions: perms.filter(p => p.conflicts && p.conflicts.length > 0).length,
      sourceBreakdown: {
        direct: perms.filter(p => p.source === 'direct').length,
        role: perms.filter(p => p.source === 'role').length,
        group: perms.filter(p => p.source === 'group').length,
        inherited: perms.filter(p => p.source === 'inherited').length
      },
      resourceCoverage: {},
      actionCoverage: {}
    };

    // Calculate resource and action coverage
    perms.forEach(perm => {
      if (perm.isEffective) {
        analysis.resourceCoverage[perm.resource] = (analysis.resourceCoverage[perm.resource] || 0) + 1;
        analysis.actionCoverage[perm.action] = (analysis.actionCoverage[perm.action] || 0) + 1;
      }
    });

    return analysis;
  }, []);

  const filteredAndSortedPermissions = useMemo(() => {
    let filtered = permissions.filter(permission => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          permission.action.toLowerCase().includes(searchLower) ||
          permission.resource.toLowerCase().includes(searchLower) ||
          permission.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Source filter
      if (filters.source !== 'all' && permission.source !== filters.source) {
        return false;
      }

      // Resource filter
      if (filters.resource && permission.resource !== filters.resource) {
        return false;
      }

      // Action filter
      if (filters.action && !permission.action.includes(filters.action)) {
        return false;
      }

      // Status filter
      switch (filters.status) {
        case 'effective':
          return permission.isEffective;
        case 'denied':
          return permission.isDenied;
        case 'conflicted':
          return permission.conflicts && permission.conflicts.length > 0;
        case 'all':
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'action':
          comparison = a.action.localeCompare(b.action);
          break;
        case 'resource':
          comparison = a.resource.localeCompare(b.resource);
          break;
        case 'source':
          comparison = a.source.localeCompare(b.source);
          break;
        case 'assignedAt':
          const aDate = a.sourceDetails.assignedAt?.getTime() || 0;
          const bDate = b.sourceDetails.assignedAt?.getTime() || 0;
          comparison = aDate - bDate;
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [permissions, filters]);

  const uniqueResources = useMemo(() => {
    const resources = new Set(permissions.map(p => p.resource));
    return Array.from(resources).sort();
  }, [permissions]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(permissions.map(p => p.action.split('.')[0]));
    return Array.from(actions).sort();
  }, [permissions]);

  // ============================================================================
  // UI HANDLERS
  // ============================================================================

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const handlePermissionSelection = useCallback((permissionId: number, selected: boolean) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(permissionId);
      } else {
        newSet.delete(permissionId);
      }
      return newSet;
    });
  }, []);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderFilters = () => (
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Source Filter */}
        <select
          value={filters.source}
          onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value as any }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Sources</option>
          <option value="direct">Direct</option>
          <option value="role">Role</option>
          <option value="group">Group</option>
          <option value="inherited">Inherited</option>
        </select>

        {/* Resource Filter */}
        <select
          value={filters.resource}
          onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Resources</option>
          {uniqueResources.map(resource => (
            <option key={resource} value={resource}>
              {resource}
            </option>
          ))}
        </select>

        {/* Action Filter */}
        <select
          value={filters.action}
          onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Actions</option>
          {uniqueActions.map(action => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="effective">Effective</option>
          <option value="denied">Denied</option>
          <option value="conflicted">Conflicted</option>
        </select>

        {/* Sort */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="action-asc">Action A-Z</option>
          <option value="action-desc">Action Z-A</option>
          <option value="resource-asc">Resource A-Z</option>
          <option value="resource-desc">Resource Z-A</option>
          <option value="source-asc">Source A-Z</option>
          <option value="source-desc">Source Z-A</option>
          <option value="assignedAt-desc">Recently Assigned</option>
          <option value="assignedAt-asc">Oldest Assigned</option>
        </select>

        {/* View Mode */}
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Table view"
          >
            <TableCellsIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Card view"
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`p-2 ${viewMode === 'tree' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Tree view"
          >
            <TreePineIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPermissionCard = (permission: PermissionWithSource) => (
    <div
      key={permission.id}
      className={`p-4 border rounded-lg transition-all ${
        selectedPermissions.has(permission.id)
          ? 'border-blue-500 bg-blue-50'
          : permission.isDenied
          ? 'border-red-200 bg-red-50'
          : permission.conflicts?.length
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Status Indicator */}
          <div className="flex-shrink-0 mt-1">
            {permission.isDenied ? (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            ) : permission.conflicts?.length ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            )}
          </div>

          {/* Permission Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-sm font-medium text-gray-900">
                {formatPermission(permission.action, permission.resource)}
              </h4>
              
              {/* Source Badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                permission.source === 'direct' ? 'bg-blue-100 text-blue-800' :
                permission.source === 'role' ? 'bg-green-100 text-green-800' :
                permission.source === 'group' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {permission.source === 'direct' && <KeyIcon className="h-3 w-3 mr-1" />}
                {permission.source === 'role' && <UserGroupIcon className="h-3 w-3 mr-1" />}
                {permission.source === 'group' && <ShareIcon className="h-3 w-3 mr-1" />}
                {permission.source === 'inherited' && <StarIcon className="h-3 w-3 mr-1" />}
                {permission.source}
              </span>
            </div>

            {permission.description && (
              <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
            )}

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <GlobeAltIcon className="h-3 w-3 mr-1" />
                {permission.resource}
              </span>
              
              {permission.conditions && (
                <span className="flex items-center">
                  <AdjustmentsHorizontalIcon className="h-3 w-3 mr-1" />
                  Conditional
                </span>
              )}
              
              {permission.sourceDetails.assignedAt && (
                <span className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {formatRelativeTime(permission.sourceDetails.assignedAt)}
                </span>
              )}
            </div>

            {/* Source Details */}
            {permission.sourceDetails.roleName && (
              <p className="text-xs text-gray-500 mt-1">
                Via role: {permission.sourceDetails.roleName}
              </p>
            )}

            {permission.sourceDetails.groupName && (
              <p className="text-xs text-gray-500 mt-1">
                Via group: {permission.sourceDetails.groupName}
              </p>
            )}

            {permission.sourceDetails.inheritedFrom && (
              <p className="text-xs text-purple-600 mt-1">
                Inherited from: {permission.sourceDetails.inheritedFrom}
              </p>
            )}

            {/* Conflicts */}
            {permission.conflicts && permission.conflicts.length > 0 && (
              <div className="mt-2 space-y-1">
                {permission.conflicts.map((conflict, index) => (
                  <div key={index} className={`text-xs p-2 rounded ${
                    conflict.severity === 'high' ? 'bg-red-100 text-red-700' :
                    conflict.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <p className="font-medium">{conflict.type.replace('_', ' ')}</p>
                    <p>{conflict.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Conditions */}
            {permission.conditions && (
              <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                <p className="font-medium text-gray-700 mb-1">Conditions:</p>
                <pre className="text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(permission.conditions), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {canViewDetails && (
            <button
              className="p-1 text-gray-400 hover:text-gray-600"
              title="View details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderPermissionTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permission
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resource
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAndSortedPermissions.map((permission) => (
            <tr key={permission.id} className={
              permission.isDenied ? 'bg-red-50' :
              permission.conflicts?.length ? 'bg-yellow-50' :
              'hover:bg-gray-50'
            }>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {permission.isDenied ? (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    ) : permission.conflicts?.length ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {permission.action}
                    </div>
                    {permission.description && (
                      <div className="text-sm text-gray-500">
                        {permission.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {permission.resource}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  permission.source === 'direct' ? 'bg-blue-100 text-blue-800' :
                  permission.source === 'role' ? 'bg-green-100 text-green-800' :
                  permission.source === 'group' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {permission.source}
                </span>
                {permission.sourceDetails.roleName && (
                  <div className="text-xs text-gray-500 mt-1">
                    {permission.sourceDetails.roleName}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  permission.isDenied ? 'bg-red-100 text-red-800' :
                  permission.conflicts?.length ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {permission.isDenied ? 'Denied' :
                   permission.conflicts?.length ? 'Conflicted' :
                   'Effective'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {permission.sourceDetails.assignedAt 
                  ? formatRelativeTime(permission.sourceDetails.assignedAt)
                  : '-'
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {canViewDetails && (
                  <button className="text-blue-600 hover:text-blue-900">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnalysisTab = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <KeyIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Permissions</p>
                <p className="text-2xl font-semibold text-gray-900">{analysis.totalPermissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Effective</p>
                <p className="text-2xl font-semibold text-gray-900">{analysis.effectivePermissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Denied</p>
                <p className="text-2xl font-semibold text-gray-900">{analysis.deniedPermissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Conflicted</p>
                <p className="text-2xl font-semibold text-gray-900">{analysis.conflictedPermissions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Permission Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(analysis.sourceBreakdown).map(([source, count]) => (
              <div key={source} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-500 capitalize">{source}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Coverage */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Coverage</h3>
          <div className="space-y-3">
            {Object.entries(analysis.resourceCoverage)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([resource, count]) => (
                <div key={resource} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{resource}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(analysis.resourceCoverage))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Action Coverage */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Action Coverage</h3>
          <div className="space-y-3">
            {Object.entries(analysis.actionCoverage)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{action}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(analysis.actionCoverage))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!isOpen) return null;

  if (!canViewPermissions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 text-red-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
            <div>
              <h3 className="font-medium">Access Denied</h3>
              <p className="text-sm text-gray-600">
                You don't have permission to view user permissions.
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Permission Overview</h2>
              <p className="text-blue-100 text-sm">
                Viewing permissions for {getUserDisplayName(user)}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchPermissions}
                disabled={isLoading}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'list', name: 'Permissions', icon: ListBulletIcon },
              { id: 'matrix', name: 'Matrix', icon: TableCellsIcon },
              { id: 'tree', name: 'Hierarchy', icon: TreePineIcon },
              { id: 'analysis', name: 'Analysis', icon: ChartBarIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters */}
        {activeTab === 'list' && renderFilters()}

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading permissions...</span>
            </div>
          ) : error ? (
            <div className="p-6">
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
          ) : (
            <div className="p-6">
              {activeTab === 'list' && (
                <div className="space-y-4">
                  {viewMode === 'table' ? (
                    renderPermissionTable()
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredAndSortedPermissions.map(renderPermissionCard)}
                    </div>
                  )}
                  
                  {filteredAndSortedPermissions.length === 0 && (
                    <div className="text-center py-12">
                      <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'analysis' && renderAnalysisTab()}
              
              {activeTab === 'matrix' && (
                <div className="text-center py-12">
                  <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Permission Matrix</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Interactive permission matrix view coming soon.
                  </p>
                </div>
              )}
              
              {activeTab === 'tree' && (
                <div className="text-center py-12">
                  <TreePineIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Permission Hierarchy</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Hierarchical permission view coming soon.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {analysis && (
              <>
                {analysis.effectivePermissions} effective • 
                {analysis.deniedPermissions} denied • 
                {analysis.conflictedPermissions} conflicted
              </>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};