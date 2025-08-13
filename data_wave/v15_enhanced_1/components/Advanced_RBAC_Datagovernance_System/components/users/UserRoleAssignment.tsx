'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  KeyIcon,
  ShieldCheckIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  StarIcon,
  BoltIcon,
  SparklesIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { roleService } from '../../services/role.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { formatDate, formatRelativeTime, formatUserName } from '../../utils/format.utils';
import { hasPermission, getUserDisplayName, getRoleColor, logRbacAction, generateCorrelationId } from '../../utils/rbac.utils';
import type {
  User,
  Role,
  UserRole,
  RoleAssignmentHistory,
  Permission,
  PaginatedResponse
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UserRoleAssignmentProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onRolesUpdated: (user: User) => void;
}

interface RoleWithAssignment extends Role {
  isAssigned: boolean;
  assignedAt?: Date;
  assignedBy?: string;
  expiresAt?: Date;
  isInherited?: boolean;
  inheritedFrom?: string;
  canRemove?: boolean;
}

interface AssignmentFilters {
  search: string;
  category: string;
  status: 'all' | 'assigned' | 'available' | 'inherited';
  sortBy: 'name' | 'permissions' | 'assignedAt' | 'priority';
  sortOrder: 'asc' | 'desc';
}

interface BulkAssignmentOperation {
  type: 'assign' | 'remove';
  roleIds: number[];
  isProcessing: boolean;
  progress: number;
  errors: string[];
}

// ============================================================================
// ADVANCED USER ROLE ASSIGNMENT COMPONENT
// ============================================================================

export const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({
  user,
  isOpen,
  onClose,
  onRolesUpdated
}) => {
  // State Management
  const [roles, setRoles] = useState<RoleWithAssignment[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<RoleAssignmentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<AssignmentFilters>({
    search: '',
    category: '',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['available', 'assigned']));
  const [bulkOperation, setBulkOperation] = useState<BulkAssignmentOperation | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [roleDetails, setRoleDetails] = useState<{ [key: number]: Role & { permissions: Permission[] } }>({});

  // Hooks
  const { currentUser } = useCurrentUser();

  // Permission checks
  const canAssignRoles = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.roles.assign', user.id.toString()), [currentUser, user.id]);
  const canRemoveRoles = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.roles.remove', user.id.toString()), [currentUser, user.id]);
  const canViewHistory = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'audit.view', user.id.toString()), [currentUser, user.id]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all available roles and user's current roles
      const [allRolesResponse, userRolesResponse] = await Promise.all([
        roleService.listRoles({ page: 1, limit: 1000 }),
        userService.getUserRoles(user.id)
      ]);

      const allRoles = allRolesResponse.data.items || [];
      const userRoles = userRolesResponse.data || [];

      // Create role map for quick lookup
      const userRoleMap = new Map(userRoles.map(ur => [ur.role_id, ur]));

      // Combine roles with assignment status
      const rolesWithAssignment: RoleWithAssignment[] = allRoles.map(role => {
        const userRole = userRoleMap.get(role.id);
        return {
          ...role,
          isAssigned: !!userRole,
          assignedAt: userRole?.assigned_at ? new Date(userRole.assigned_at) : undefined,
          assignedBy: userRole?.assigned_by,
          expiresAt: userRole?.expires_at ? new Date(userRole.expires_at) : undefined,
          isInherited: userRole?.is_inherited || false,
          inheritedFrom: userRole?.inherited_from,
          canRemove: !!userRole && !userRole.is_inherited && canRemoveRoles
        };
      });

      setRoles(rolesWithAssignment);

      // Fetch assignment history if allowed
      if (canViewHistory) {
        const historyResponse = await userService.getUserRoleAssignmentHistory(user.id);
        setAssignmentHistory(historyResponse.data || []);
      }

    } catch (error: any) {
      setError(error.message || 'Failed to fetch roles');
    } finally {
      setIsLoading(false);
    }
  }, [user.id, canRemoveRoles, canViewHistory]);

  const fetchRoleDetails = useCallback(async (roleId: number) => {
    if (roleDetails[roleId]) return;

    try {
      const response = await roleService.getRoleById(roleId);
      setRoleDetails(prev => ({
        ...prev,
        [roleId]: response.data
      }));
    } catch (error) {
      console.error('Failed to fetch role details:', error);
    }
  }, [roleDetails]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen, fetchRoles]);

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const filteredAndSortedRoles = useMemo(() => {
    let filtered = roles.filter(role => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          role.name.toLowerCase().includes(searchLower) ||
          role.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && role.category !== filters.category) {
        return false;
      }

      // Status filter
      switch (filters.status) {
        case 'assigned':
          return role.isAssigned && !role.isInherited;
        case 'available':
          return !role.isAssigned;
        case 'inherited':
          return role.isInherited;
        case 'all':
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'permissions':
          comparison = (a.permissions?.length || 0) - (b.permissions?.length || 0);
          break;
        case 'assignedAt':
          if (!a.assignedAt && !b.assignedAt) comparison = 0;
          else if (!a.assignedAt) comparison = 1;
          else if (!b.assignedAt) comparison = -1;
          else comparison = a.assignedAt.getTime() - b.assignedAt.getTime();
          break;
        case 'priority':
          comparison = (a.priority || 0) - (b.priority || 0);
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [roles, filters]);

  const roleCategories = useMemo(() => {
    const categories = new Set(roles.map(role => role.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [roles]);

  const assignedRoles = useMemo(() => 
    filteredAndSortedRoles.filter(role => role.isAssigned), [filteredAndSortedRoles]);
  
  const availableRoles = useMemo(() => 
    filteredAndSortedRoles.filter(role => !role.isAssigned), [filteredAndSortedRoles]);

  // ============================================================================
  // ROLE ASSIGNMENT OPERATIONS
  // ============================================================================

  const assignRole = useCallback(async (roleId: number) => {
    if (!canAssignRoles) return;

    try {
      const correlationId = generateCorrelationId();
      
      await userService.assignRoleToUser(user.id, roleId);
      
      // Log the action
      await logRbacAction(
        'role_assigned',
        currentUser?.email || 'system',
        {
          target_user: user.email,
          role: roles.find(r => r.id === roleId)?.name,
          correlation_id: correlationId
        }
      );

      // Refresh roles
      await fetchRoles();
      
      // Update parent component
      const updatedUser = await userService.getUserById(user.id);
      onRolesUpdated(updatedUser.data);

    } catch (error: any) {
      setError(error.message || 'Failed to assign role');
    }
  }, [user.id, user.email, canAssignRoles, currentUser, roles, fetchRoles, onRolesUpdated]);

  const removeRole = useCallback(async (roleId: number) => {
    if (!canRemoveRoles) return;

    try {
      const correlationId = generateCorrelationId();
      
      await userService.removeRoleFromUser(user.id, roleId);
      
      // Log the action
      await logRbacAction(
        'role_removed',
        currentUser?.email || 'system',
        {
          target_user: user.email,
          role: roles.find(r => r.id === roleId)?.name,
          correlation_id: correlationId
        }
      );

      // Refresh roles
      await fetchRoles();
      
      // Update parent component
      const updatedUser = await userService.getUserById(user.id);
      onRolesUpdated(updatedUser.data);

    } catch (error: any) {
      setError(error.message || 'Failed to remove role');
    }
  }, [user.id, user.email, canRemoveRoles, currentUser, roles, fetchRoles, onRolesUpdated]);

  const handleBulkAssignment = useCallback(async (operation: 'assign' | 'remove') => {
    if (selectedRoles.size === 0) return;
    if ((operation === 'assign' && !canAssignRoles) || (operation === 'remove' && !canRemoveRoles)) return;

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
      const total = roleIds.length;
      let completed = 0;
      const errors: string[] = [];

      for (const roleId of roleIds) {
        try {
          if (operation === 'assign') {
            await userService.assignRoleToUser(user.id, roleId);
          } else {
            await userService.removeRoleFromUser(user.id, roleId);
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

      // Log bulk action
      await logRbacAction(
        `bulk_roles_${operation}ed`,
        currentUser?.email || 'system',
        {
          target_user: user.email,
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
      await fetchRoles();
      
      // Update parent component
      const updatedUser = await userService.getUserById(user.id);
      onRolesUpdated(updatedUser.data);

      // Clear bulk operation after a delay
      setTimeout(() => setBulkOperation(null), 3000);

    } catch (error: any) {
      setBulkOperation(prev => prev ? {
        ...prev,
        isProcessing: false,
        errors: [error.message || `Failed to ${operation} roles`]
      } : null);
    }
  }, [selectedRoles, canAssignRoles, canRemoveRoles, user.id, user.email, currentUser, roles, fetchRoles, onRolesUpdated]);

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

  const selectAllVisible = useCallback((assigned: boolean) => {
    const visibleRoles = assigned ? assignedRoles : availableRoles;
    const newSelected = new Set(selectedRoles);
    
    visibleRoles.forEach(role => {
      if (assigned ? role.canRemove : canAssignRoles) {
        newSelected.add(role.id);
      }
    });
    
    setSelectedRoles(newSelected);
  }, [assignedRoles, availableRoles, selectedRoles, canAssignRoles]);

  const clearSelection = useCallback(() => {
    setSelectedRoles(new Set());
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
              placeholder="Search roles..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
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
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="assigned">Assigned</option>
          <option value="available">Available</option>
          <option value="inherited">Inherited</option>
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
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="permissions-desc">Most Permissions</option>
          <option value="permissions-asc">Least Permissions</option>
          <option value="assignedAt-desc">Recently Assigned</option>
          <option value="assignedAt-asc">Oldest Assigned</option>
        </select>

        {/* History Toggle */}
        {canViewHistory && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showHistory
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            History
          </button>
        )}
      </div>
    </div>
  );

  const renderBulkActions = () => {
    if (selectedRoles.size === 0) return null;

    return (
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedRoles.size} role{selectedRoles.size !== 1 ? 's' : ''} selected
            </span>
            
            <button
              onClick={clearSelection}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {canAssignRoles && (
              <button
                onClick={() => handleBulkAssignment('assign')}
                disabled={bulkOperation?.isProcessing}
                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Assign
              </button>
            )}
            
            {canRemoveRoles && (
              <button
                onClick={() => handleBulkAssignment('remove')}
                disabled={bulkOperation?.isProcessing}
                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <MinusIcon className="h-4 w-4 mr-1" />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Bulk Operation Progress */}
        {bulkOperation && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-900">
                {bulkOperation.type === 'assign' ? 'Assigning' : 'Removing'} roles...
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
    );
  };

  const renderRoleCard = (role: RoleWithAssignment) => (
    <div
      key={role.id}
      className={`p-4 border rounded-lg transition-all ${
        selectedRoles.has(role.id)
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={selectedRoles.has(role.id)}
            onChange={(e) => handleRoleSelection(role.id, e.target.checked)}
            disabled={role.isAssigned ? !role.canRemove : !canAssignRoles}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />

          {/* Role Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getRoleColor(role.name) }}
              />
              <h4 className="text-sm font-medium text-gray-900">{role.name}</h4>
              
              {role.isInherited && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  <StarIcon className="h-3 w-3 mr-1" />
                  Inherited
                </span>
              )}
              
              {role.priority && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Priority: {role.priority}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-2">{role.description}</p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <KeyIcon className="h-3 w-3 mr-1" />
                {role.permissions?.length || 0} permissions
              </span>
              
              {role.category && (
                <span className="flex items-center">
                  <TagIcon className="h-3 w-3 mr-1" />
                  {role.category}
                </span>
              )}
              
              {role.assignedAt && (
                <span className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Assigned {formatRelativeTime(role.assignedAt)}
                </span>
              )}
            </div>

            {role.assignedBy && (
              <p className="text-xs text-gray-500 mt-1">
                Assigned by {role.assignedBy}
              </p>
            )}

            {role.expiresAt && (
              <p className="text-xs text-orange-600 mt-1">
                Expires {formatRelativeTime(role.expiresAt)}
              </p>
            )}

            {role.inheritedFrom && (
              <p className="text-xs text-purple-600 mt-1">
                Inherited from {role.inheritedFrom}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => fetchRoleDetails(role.id)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="View details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>

          {role.isAssigned ? (
            role.canRemove && (
              <button
                onClick={() => removeRole(role.id)}
                className="p-1 text-red-400 hover:text-red-600"
                title="Remove role"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
            )
          ) : (
            canAssignRoles && (
              <button
                onClick={() => assignRole(role.id)}
                className="p-1 text-green-400 hover:text-green-600"
                title="Assign role"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Role Details */}
      {roleDetails[role.id] && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-2">
              {roleDetails[role.id].permissions?.slice(0, 6).map((permission, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <span>{permission.action}</span>
                </div>
              ))}
            </div>
            {roleDetails[role.id].permissions?.length > 6 && (
              <p className="mt-1 text-gray-500">
                +{roleDetails[role.id].permissions.length - 6} more permissions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderRoleSection = (title: string, roles: RoleWithAssignment[], sectionKey: string) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {roles.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {roles.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectAllVisible(sectionKey === 'assigned');
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
            )}
            
            {expandedSections.has(sectionKey) ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </button>
      </div>
      
      <AnimatePresence>
        {expandedSections.has(sectionKey) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4"
          >
            {roles.length > 0 ? (
              <div className="space-y-3">
                {roles.map(renderRoleCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserGroupIcon className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No {title.toLowerCase()} found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderAssignmentHistory = () => {
    if (!showHistory || !canViewHistory) return null;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Assignment History</h3>
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
          {assignmentHistory.length > 0 ? (
            <div className="space-y-3">
              {assignmentHistory.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3 text-sm">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    entry.action === 'assigned' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {entry.action === 'assigned' ? (
                      <PlusIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <MinusIcon className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-medium">{entry.role_name}</span>
                      {' '}was {entry.action} {entry.action === 'assigned' ? 'to' : 'from'} user
                    </p>
                    <p className="text-gray-500 text-xs">
                      by {entry.performed_by} • {formatRelativeTime(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <ClockIcon className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">No assignment history available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!isOpen) return null;

  if (!canAssignRoles && !canRemoveRoles) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 text-red-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
            <div>
              <h3 className="font-medium">Access Denied</h3>
              <p className="text-sm text-gray-600">
                You don't have permission to manage user roles.
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
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Role Assignment</h2>
              <p className="text-blue-100 text-sm">
                Managing roles for {getUserDisplayName(user)}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchRoles}
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

        {/* Filters */}
        {renderFilters()}

        {/* Bulk Actions */}
        {renderBulkActions()}

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading roles...</span>
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
            <div className="p-6 space-y-6">
              {/* Assignment History */}
              {renderAssignmentHistory()}

              {/* Assigned Roles */}
              {renderRoleSection('Assigned Roles', assignedRoles, 'assigned')}

              {/* Available Roles */}
              {renderRoleSection('Available Roles', availableRoles, 'available')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {assignedRoles.length} role{assignedRoles.length !== 1 ? 's' : ''} assigned • 
            {availableRoles.length} available
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