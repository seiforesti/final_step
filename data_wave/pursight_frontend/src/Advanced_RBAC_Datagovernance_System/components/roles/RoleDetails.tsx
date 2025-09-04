'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  KeyIcon,
  UsersIcon,
  ShieldCheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon,
  TagIcon,
  CalendarIcon,
  ClockIcon,
  ShareIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BoltIcon,
  SparklesIcon,
  FireIcon,
  CogIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { TreePine } from 'lucide-react';
import { roleService } from '../../services/role.service';
import { userService } from '../../services/user.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { formatDate, formatRelativeTime, formatUserName } from '../../utils/format.utils';
import { hasPermission, getUserDisplayName, getRoleColor } from '../../utils/rbac.utils';
import type {
  Role,
  RoleWithStats,
  User,
  Permission,
  RoleAuditLog,
  RoleUsageStats,
  RolePermissionAnalysis
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface RoleDetailsProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface RoleDetailedInfo {
  role: RoleWithStats;
  users: User[];
  permissions: Permission[];
  childRoles: Role[];
  parentRoles: Role[];
  auditLogs: RoleAuditLog[];
  usageStats: RoleUsageStats;
  permissionAnalysis: RolePermissionAnalysis;
  isLoading: boolean;
  error: string | null;
}

interface PermissionsByCategory {
  [category: string]: Permission[];
}

// ============================================================================
// ADVANCED ROLE DETAILS COMPONENT
// ============================================================================

export const RoleDetails: React.FC<RoleDetailsProps> = ({
  role,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  // State Management
  const [detailedInfo, setDetailedInfo] = useState<RoleDetailedInfo>({
    role: role as RoleWithStats,
    users: [],
    permissions: [],
    childRoles: [],
    parentRoles: [],
    auditLogs: [],
    usageStats: {} as RoleUsageStats,
    permissionAnalysis: {} as RolePermissionAnalysis,
    isLoading: true,
    error: null
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'users' | 'hierarchy' | 'analytics' | 'audit'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'stats']));
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const { currentUser } = useCurrentUser();

  // Permission checks
  const canEdit = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'roles.edit', role.id.toString()), [currentUser, role.id]);
  const canDelete = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'roles.delete', role.id.toString()), [currentUser, role.id]);
  const canViewUsers = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'roles.users.view', role.id.toString()), [currentUser, role.id]);
  const canViewAudit = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'audit.view', role.id.toString()), [currentUser, role.id]);
  const canViewAnalytics = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'analytics.view', 'roles'), [currentUser]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchRoleDetails = useCallback(async () => {
    try {
      setDetailedInfo(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch comprehensive role data
      const promises = [
        roleService.getRoleById(role.id),
        roleService.getRolePermissions(role.id),
        roleService.getRoleHierarchy(role.id)
      ];

      // Add conditional fetches based on permissions
      if (canViewUsers) {
        promises.push(roleService.getRoleUsers(role.id));
      }
      
      if (canViewAudit) {
        promises.push(roleService.getRoleAuditLogs(role.id, { limit: 50 }));
      }
      
      if (canViewAnalytics) {
        promises.push(
          roleService.getRoleUsageStats(role.id),
          roleService.getRolePermissionAnalysis(role.id)
        );
      }

      const responses = await Promise.all(promises);
      
      let responseIndex = 0;
      const roleResponse = responses[responseIndex++];
      const permissionsResponse = responses[responseIndex++];
      const hierarchyResponse = responses[responseIndex++];
      
      const usersResponse = canViewUsers ? responses[responseIndex++] : { data: [] };
      const auditResponse = canViewAudit ? responses[responseIndex++] : { data: [] };
      const statsResponse = canViewAnalytics ? responses[responseIndex++] : { data: {} };
      const analysisResponse = canViewAnalytics ? responses[responseIndex++] : { data: {} };

      setDetailedInfo(prev => ({
        ...prev,
        role: roleResponse.data,
        permissions: permissionsResponse.data,
        childRoles: hierarchyResponse.data.children || [],
        parentRoles: hierarchyResponse.data.parents || [],
        users: usersResponse.data,
        auditLogs: auditResponse.data,
        usageStats: statsResponse.data,
        permissionAnalysis: analysisResponse.data,
        isLoading: false
      }));

    } catch (error: any) {
      setDetailedInfo(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch role details',
        isLoading: false
      }));
    }
  }, [role.id, canViewUsers, canViewAudit, canViewAnalytics]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchRoleDetails();
    setRefreshing(false);
  }, [fetchRoleDetails]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      fetchRoleDetails();
    }
  }, [isOpen, fetchRoleDetails]);

  // ============================================================================
  // UTILITY FUNCTIONS
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

  const getRoleStatus = useCallback(() => {
    if (!detailedInfo.role.is_active) {
      return { text: 'Inactive', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    }
    if (detailedInfo.users.length === 0) {
      return { text: 'Unused', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    }
    return { text: 'Active', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' };
  }, [detailedInfo.role.is_active, detailedInfo.users.length]);

  const groupPermissionsByCategory = useCallback((): PermissionsByCategory => {
    const grouped: PermissionsByCategory = {};
    
    detailedInfo.permissions.forEach(permission => {
      const category = permission.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });

    return grouped;
  }, [detailedInfo.permissions]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-6">
          {/* Role Color Indicator */}
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center"
              style={{ backgroundColor: getRoleColor(detailedInfo.role.name) }}
            >
              <UserGroupIcon className="h-8 w-8 text-white" />
            </div>
            
            {/* Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${
              detailedInfo.role.is_active ? 'bg-green-500' : 'bg-red-500'
            }`} />
            
            {/* System Role Indicator */}
            {detailedInfo.role.is_system && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Role Info */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {detailedInfo.role.name}
            </h1>
            
            {detailedInfo.role.description && (
              <p className="text-blue-100 text-lg max-w-2xl">
                {detailedInfo.role.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-blue-100">
              {detailedInfo.role.category && (
                <div className="flex items-center space-x-2">
                  <TagIcon className="h-4 w-4" />
                  <span>{detailedInfo.role.category}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Created {formatRelativeTime(detailedInfo.role.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Status Badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getRoleStatus().bgColor
              } ${getRoleStatus().textColor}`}>
                {getRoleStatus().text}
              </span>

              {/* System Badge */}
              {detailedInfo.role.is_system && (
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">System Role</span>
                </div>
              )}

              {/* Users Count */}
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <UsersIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {detailedInfo.users.length} user{detailedInfo.users.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Permissions Count */}
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <KeyIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {detailedInfo.permissions.length} permission{detailedInfo.permissions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {onEdit && canEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}

          {onDelete && canDelete && !detailedInfo.role.is_system && (
            <button
              onClick={onDelete}
              className="inline-flex items-center px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="border-b border-gray-200 bg-white px-6">
      <nav className="-mb-px flex space-x-8">
        {[
          { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
          { id: 'permissions', name: 'Permissions', icon: KeyIcon },
          { id: 'users', name: 'Users', icon: UsersIcon, requiresPermission: canViewUsers },
          { id: 'hierarchy', name: 'Hierarchy', icon: TreePine },
          { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, requiresPermission: canViewAnalytics },
          { id: 'audit', name: 'Audit', icon: DocumentTextIcon, requiresPermission: canViewAudit }
        ].filter(tab => tab.requiresPermission !== false).map((tab) => {
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
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => toggleSection('basic')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            {expandedSections.has('basic') ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.has('basic') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role Name</label>
                    <p className="mt-1 text-sm text-gray-900">{detailedInfo.role.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {detailedInfo.role.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {detailedInfo.role.category || 'Uncategorized'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {detailedInfo.role.priority || 'Normal'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">#{detailedInfo.role.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        getRoleStatus().bgColor
                      } ${getRoleStatus().textColor}`}>
                        {getRoleStatus().text}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(detailedInfo.role.created_at, { format: 'full' })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(detailedInfo.role.updated_at, { format: 'full' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => toggleSection('stats')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
            {expandedSections.has('stats') ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.has('stats') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {detailedInfo.users.length}
                  </div>
                  <div className="text-sm text-gray-500">Assigned Users</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {detailedInfo.permissions.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Permissions</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {detailedInfo.childRoles.length}
                  </div>
                  <div className="text-sm text-gray-500">Child Roles</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {detailedInfo.parentRoles.length}
                  </div>
                  <div className="text-sm text-gray-500">Parent Roles</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role Hierarchy */}
      {(detailedInfo.parentRoles.length > 0 || detailedInfo.childRoles.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Hierarchy</h3>
          
          {detailedInfo.parentRoles.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Inherits from:</h4>
              <div className="flex flex-wrap gap-2">
                {detailedInfo.parentRoles.map((parentRole) => (
                  <span
                    key={parentRole.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: getRoleColor(parentRole.name) }}
                    />
                    {parentRole.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {detailedInfo.childRoles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Parent to:</h4>
              <div className="flex flex-wrap gap-2">
                {detailedInfo.childRoles.map((childRole) => (
                  <span
                    key={childRole.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: getRoleColor(childRole.name) }}
                    />
                    {childRole.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPermissionsTab = () => {
    const permissionsByCategory = groupPermissionsByCategory();
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Permissions ({detailedInfo.permissions.length})
          </h3>
          
          {Object.keys(permissionsByCategory).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">{category} ({permissions.length})</h4>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {permission.action}
                            </p>
                            <p className="text-sm text-gray-500">
                              Resource: {permission.resource}
                            </p>
                            {permission.conditions && (
                              <p className="text-xs text-gray-400 mt-1">
                                Conditional
                              </p>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {permission.created_at && formatRelativeTime(permission.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions</h3>
              <p className="mt-1 text-sm text-gray-500">
                This role has no permissions assigned.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    if (!canViewUsers) {
      return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view role users.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Assigned Users ({detailedInfo.users.length})
          </h3>
          
          {detailedInfo.users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detailedInfo.users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={getUserDisplayName(user)}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {getUserDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getUserDisplayName(user)}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                This role has not been assigned to any users yet.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHierarchyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Hierarchy</h3>
        
        <div className="space-y-6">
          {/* Parent Roles */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Parent Roles ({detailedInfo.parentRoles.length})
            </h4>
            
            {detailedInfo.parentRoles.length > 0 ? (
              <div className="space-y-3">
                {detailedInfo.parentRoles.map((parentRole) => (
                  <div key={parentRole.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getRoleColor(parentRole.name) }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{parentRole.name}</p>
                        <p className="text-sm text-gray-500">{parentRole.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Inherits permissions
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <TreePine className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No parent roles</p>
              </div>
            )}
          </div>

          {/* Child Roles */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Child Roles ({detailedInfo.childRoles.length})
            </h4>
            
            {detailedInfo.childRoles.length > 0 ? (
              <div className="space-y-3">
                {detailedInfo.childRoles.map((childRole) => (
                  <div key={childRole.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getRoleColor(childRole.name) }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{childRole.name}</p>
                        <p className="text-sm text-gray-500">{childRole.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Inherits from this role
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <TreePine className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No child roles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => {
    if (!canViewAnalytics) {
      return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view analytics.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Analytics</h3>
          
          {detailedInfo.usageStats && Object.keys(detailedInfo.usageStats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {detailedInfo.usageStats.total_assignments || 0}
                </div>
                <div className="text-sm text-gray-500">Total Assignments</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {detailedInfo.usageStats.active_users || 0}
                </div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {detailedInfo.usageStats.permission_usage || 0}%
                </div>
                <div className="text-sm text-gray-500">Permission Usage</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Analytics data is not available for this role.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAuditTab = () => {
    if (!canViewAudit) {
      return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view audit logs.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
          
          {detailedInfo.auditLogs.length > 0 ? (
            <div className="space-y-4">
              {detailedInfo.auditLogs.map((log) => (
                <div key={log.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      {log.metadata && (
                        <div className="mt-2">
                          <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer">Metadata</summary>
                            <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-900">
                        {formatDate(log.timestamp, { format: 'short' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {log.performed_by}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs</h3>
              <p className="mt-1 text-sm text-gray-500">
                No audit logs found for this role.
              </p>
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

  if (detailedInfo.isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Loading role details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (detailedInfo.error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 text-red-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="text-sm text-gray-600">{detailedInfo.error}</p>
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
        {renderHeader()}

        {/* Tabs */}
        {renderTabs()}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'permissions' && renderPermissionsTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'hierarchy' && renderHierarchyTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'audit' && renderAuditTab()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {formatRelativeTime(detailedInfo.role.updated_at)}
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