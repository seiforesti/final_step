'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  KeyIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TagIcon,
  CalendarIcon,
  ClockIcon,
  TreePineIcon,
  ShareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BoltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  FireIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatRelativeTime } from '../../utils/format.utils';
import { getRoleColor, buildResourceTree } from '../../utils/rbac.utils';
import type {
  Role,
  RoleWithStats,
  RoleFilters,
  Permission
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface RoleListProps {
  roles: RoleWithStats[];
  selectedRoles: Set<number>;
  viewMode: 'list' | 'grid' | 'table' | 'tree';
  onRoleSelect: (roleId: number, selected: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRoleAction: (role: Role) => React.ReactNode;
  isLoading: boolean;
  totalCount: number;
  filters: RoleFilters;
  onFiltersChange: (filters: Partial<RoleFilters>) => void;
}

interface RoleCardProps {
  role: RoleWithStats;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: (role: Role) => React.ReactNode;
  viewMode: 'card' | 'compact' | 'detailed';
}

interface RoleTreeNode {
  role: RoleWithStats;
  children: RoleTreeNode[];
  level: number;
  isExpanded: boolean;
}

// ============================================================================
// ROLE CARD COMPONENT
// ============================================================================

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  isSelected,
  onSelect,
  onAction,
  viewMode
}) => {
  const getRoleStatusColor = useCallback(() => {
    if (!role.is_active) return 'text-red-600 bg-red-100';
    if (role.user_count === 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  }, [role.is_active, role.user_count]);

  const getRoleStatusText = useCallback(() => {
    if (!role.is_active) return 'Inactive';
    if (role.user_count === 0) return 'Unused';
    return 'Active';
  }, [role.is_active, role.user_count]);

  if (viewMode === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 border rounded-lg transition-all hover:shadow-md ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getRoleColor(role.name) }}
            />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{role.name}</p>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <UsersIcon className="h-3 w-3 mr-1" />
                  {role.user_count || 0}
                </span>
                <span className="flex items-center">
                  <KeyIcon className="h-3 w-3 mr-1" />
                  {role.permission_count || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleStatusColor()}`}>
              {getRoleStatusText()}
            </span>
            {onAction(role)}
          </div>
        </div>
      </motion.div>
    );
  }

  if (viewMode === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 border rounded-lg transition-all hover:shadow-lg ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getRoleColor(role.name) }}
                />
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                
                {role.is_system && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    System
                  </span>
                )}
                
                {role.parent_roles && role.parent_roles.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    <StarIcon className="h-3 w-3 mr-1" />
                    Inherited
                  </span>
                )}
              </div>

              {role.description && (
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{role.user_count || 0}</div>
                  <div className="text-xs text-gray-500">Users</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{role.permission_count || 0}</div>
                  <div className="text-xs text-gray-500">Permissions</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{role.child_roles?.length || 0}</div>
                  <div className="text-xs text-gray-500">Child Roles</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-xl font-bold ${role.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {role.is_active ? '✓' : '✗'}
                  </div>
                  <div className="text-xs text-gray-500">Status</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {role.category && (
                  <span className="flex items-center">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {role.category}
                  </span>
                )}
                
                <span className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Created {formatRelativeTime(role.created_at)}
                </span>
                
                <span className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Updated {formatRelativeTime(role.updated_at)}
                </span>
              </div>

              {/* Parent Roles */}
              {role.parent_roles && role.parent_roles.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Inherits from:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.parent_roles.map((parentRole, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        {parentRole.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Permissions */}
              {role.recent_permissions && role.recent_permissions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Recent permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.recent_permissions.slice(0, 5).map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
                      >
                        {permission.action}
                      </span>
                    ))}
                    {role.recent_permissions.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{role.recent_permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleStatusColor()}`}>
              {getRoleStatusText()}
            </span>
            {onAction(role)}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border rounded-lg transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getRoleColor(role.name) }}
              />
              <h4 className="text-sm font-medium text-gray-900">{role.name}</h4>
              
              {role.is_system && (
                <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  System
                </span>
              )}
            </div>

            {role.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{role.description}</p>
            )}

            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
              <span className="flex items-center">
                <UsersIcon className="h-3 w-3 mr-1" />
                {role.user_count || 0} users
              </span>
              
              <span className="flex items-center">
                <KeyIcon className="h-3 w-3 mr-1" />
                {role.permission_count || 0} permissions
              </span>
              
              {role.category && (
                <span className="flex items-center">
                  <TagIcon className="h-3 w-3 mr-1" />
                  {role.category}
                </span>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Updated {formatRelativeTime(role.updated_at)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleStatusColor()}`}>
            {getRoleStatusText()}
          </span>
          {onAction(role)}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ROLE TREE COMPONENT
// ============================================================================

const RoleTreeView: React.FC<{
  roles: RoleWithStats[];
  selectedRoles: Set<number>;
  onRoleSelect: (roleId: number, selected: boolean) => void;
  onRoleAction: (role: Role) => React.ReactNode;
}> = ({ roles, selectedRoles, onRoleSelect, onRoleAction }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const buildRoleTree = useCallback((): RoleTreeNode[] => {
    const roleMap = new Map<number, RoleWithStats>();
    const childrenMap = new Map<number, RoleWithStats[]>();

    // Build maps for efficient lookup
    roles.forEach(role => {
      roleMap.set(role.id, role);
      const parentIds = role.parent_roles?.map(p => p.id) || [];
      
      if (parentIds.length === 0) {
        // Root role
        if (!childrenMap.has(0)) {
          childrenMap.set(0, []);
        }
        childrenMap.get(0)!.push(role);
      } else {
        // Child role
        parentIds.forEach(parentId => {
          if (!childrenMap.has(parentId)) {
            childrenMap.set(parentId, []);
          }
          childrenMap.get(parentId)!.push(role);
        });
      }
    });

    // Build tree recursively
    function buildNode(role: RoleWithStats, level: number = 0): RoleTreeNode {
      const children = childrenMap.get(role.id) || [];
      return {
        role,
        children: children.map(child => buildNode(child, level + 1)),
        level,
        isExpanded: expandedNodes.has(role.id)
      };
    }

    // Get root roles (no parents)
    const rootRoles = childrenMap.get(0) || [];
    return rootRoles.map(root => buildNode(root));
  }, [roles, expandedNodes]);

  const toggleNode = useCallback((roleId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  }, []);

  const renderTreeNode = useCallback((node: RoleTreeNode): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    
    return (
      <div key={node.role.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg ${
            selectedRoles.has(node.role.id) ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${node.level * 24 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleNode(node.role.id)}
            className={`mr-2 p-1 rounded hover:bg-gray-200 ${
              hasChildren ? '' : 'invisible'
            }`}
          >
            {hasChildren && node.isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={selectedRoles.has(node.role.id)}
            onChange={(e) => onRoleSelect(node.role.id, e.target.checked)}
            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />

          {/* Role Color */}
          <div
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: getRoleColor(node.role.name) }}
          />

          {/* Role Info */}
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-medium text-gray-900">{node.role.name}</span>
              
              {node.role.is_system && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  System
                </span>
              )}
              
              {!node.role.is_active && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Inactive
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-1" />
                {node.role.user_count || 0}
              </span>
              
              <span className="flex items-center">
                <KeyIcon className="h-4 w-4 mr-1" />
                {node.role.permission_count || 0}
              </span>

              {onRoleAction(node.role)}
            </div>
          </div>
        </div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && node.isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {node.children.map(renderTreeNode)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }, [selectedRoles, onRoleSelect, onRoleAction, toggleNode]);

  const tree = buildRoleTree();

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Role Hierarchy</h3>
      </div>
      
      <div className="p-4 space-y-1">
        {tree.length > 0 ? (
          tree.map(renderTreeNode)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TreePineIcon className="mx-auto h-12 w-12 mb-2" />
            <p className="text-sm">No role hierarchy found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN ROLE LIST COMPONENT
// ============================================================================

export const RoleList: React.FC<RoleListProps> = ({
  roles,
  selectedRoles,
  viewMode,
  onRoleSelect,
  onSelectAll,
  onClearSelection,
  onRoleAction,
  isLoading,
  totalCount,
  filters,
  onFiltersChange
}) => {
  const [sortColumn, setSortColumn] = useState<string>(filters.sortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.sortOrder);

  const handleSort = useCallback((column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onFiltersChange({ sortBy: column as any, sortOrder: newDirection });
  }, [sortColumn, sortDirection, onFiltersChange]);

  const renderTableView = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRoles.size === roles.length && roles.length > 0}
                  onChange={(e) => e.target.checked ? onSelectAll() : onClearSelection()}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Role</span>
                  {sortColumn === 'name' && (
                    <span className={`text-blue-500 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>↑</span>
                  )}
                </div>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('user_count')}
              >
                <div className="flex items-center space-x-1">
                  <span>Users</span>
                  {sortColumn === 'user_count' && (
                    <span className={`text-blue-500 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>↑</span>
                  )}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('permission_count')}
              >
                <div className="flex items-center space-x-1">
                  <span>Permissions</span>
                  {sortColumn === 'permission_count' && (
                    <span className={`text-blue-500 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>↑</span>
                  )}
                </div>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('updated_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Updated</span>
                  {sortColumn === 'updated_at' && (
                    <span className={`text-blue-500 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>↑</span>
                  )}
                </div>
              </th>
              
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <motion.tr
                key={role.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`hover:bg-gray-50 ${
                  selectedRoles.has(role.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRoles.has(role.id)}
                    onChange={(e) => onRoleSelect(role.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: getRoleColor(role.name) }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {role.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {role.category ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {role.category}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {role.user_count || 0}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="flex items-center">
                    <KeyIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {role.permission_count || 0}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      role.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {role.is_active ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      )}
                      {role.is_active ? 'Active' : 'Inactive'}
                    </span>
                    
                    {role.is_system && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <ShieldCheckIcon className="h-3 w-3 mr-1" />
                        System
                      </span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatRelativeTime(role.updated_at)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {onRoleAction(role)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {roles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          isSelected={selectedRoles.has(role.id)}
          onSelect={(selected) => onRoleSelect(role.id, selected)}
          onAction={onRoleAction}
          viewMode="card"
        />
      ))}
      
      {roles.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          isSelected={selectedRoles.has(role.id)}
          onSelect={(selected) => onRoleSelect(role.id, selected)}
          onAction={onRoleAction}
          viewMode="detailed"
        />
      ))}
      
      {roles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading roles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {roles.length} of {totalCount} roles
          {selectedRoles.size > 0 && (
            <span className="ml-2 text-blue-600">
              ({selectedRoles.size} selected)
            </span>
          )}
        </span>
        
        {selectedRoles.size > 0 && (
          <button
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Role List */}
      {viewMode === 'table' && renderTableView()}
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'tree' && (
        <RoleTreeView
          roles={roles}
          selectedRoles={selectedRoles}
          onRoleSelect={onRoleSelect}
          onRoleAction={onRoleAction}
        />
      )}
    </div>
  );
};