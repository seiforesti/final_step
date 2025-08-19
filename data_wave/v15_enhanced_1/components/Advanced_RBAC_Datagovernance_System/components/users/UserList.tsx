'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  UsersIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CalendarIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  BoltIcon,
  CogIcon,
  UserGroupIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatRelativeTime, formatUserName, formatUserEmail } from '../../utils/format.utils';
import { getUserDisplayName, getRoleColor } from '../../utils/rbac.utils';
import type {
  User,
  PaginationState
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UserListProps {
  users: User[];
  selectedUsers: Set<number>;
  viewMode: 'list' | 'grid' | 'table';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  pagination: PaginationState;
  onUserSelect: (userId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onSort: (sortBy: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onUserClick: (user: User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: number) => void;
  onAssignRoles?: (user: User) => void;
  onViewPermissions?: (user: User) => void;
}

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssignRoles?: () => void;
  onViewPermissions?: () => void;
}

interface UserRowProps extends UserCardProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (sortBy: string) => void;
}

// ============================================================================
// USER CARD COMPONENT (GRID VIEW)
// ============================================================================

const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected,
  onSelect,
  onClick,
  onEdit,
  onDelete,
  onAssignRoles,
  onViewPermissions
}) => {
  const [showActions, setShowActions] = useState(false);

  const userStatus = useMemo(() => {
    if (!user.is_active) return { text: 'Inactive', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    if (!user.is_verified) return { text: 'Unverified', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    return { text: 'Active', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' };
  }, [user.is_active, user.is_verified]);

  const primaryRole = useMemo(() => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0];
    }
    return null;
  }, [user.roles]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-xl border-2 p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer relative ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      {/* Actions Menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-4 right-4 flex items-center space-x-1"
          >
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Edit User"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            
            {onAssignRoles && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignRoles();
                }}
                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                title="Assign Roles"
              >
                <UserGroupIcon className="h-4 w-4" />
              </button>
            )}

            {onViewPermissions && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewPermissions();
                }}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="View Permissions"
              >
                <KeyIcon className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete User"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Avatar */}
      <div className="flex justify-center mb-4 mt-6">
        <div className="relative">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={getUserDisplayName(user)}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {getUserDisplayName(user).charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Status Indicator */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
            user.is_active ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          
          {/* MFA Indicator */}
          {user.mfa_enabled && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-gray-900 text-lg">
          {getUserDisplayName(user)}
        </h3>
        
        <p className="text-sm text-gray-600 truncate">
          {formatUserEmail(user.email, { maxLength: 30 })}
        </p>

        {/* Status Badge */}
        <div className="flex justify-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userStatus.bgColor} ${userStatus.textColor}`}>
            {userStatus.text}
          </span>
        </div>

        {/* Primary Role */}
        {primaryRole && (
          <div className="flex justify-center">
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getRoleColor(primaryRole.name) }}
            >
              {primaryRole.name}
            </span>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-4">
          {user.department && (
            <div className="flex items-center justify-center">
              <span className="truncate">{user.department}</span>
            </div>
          )}
          
          {user.region && (
            <div className="flex items-center justify-center">
              <MapPinIcon className="h-3 w-3 mr-1" />
              <span className="truncate">{user.region}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center col-span-2">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>Joined {formatRelativeTime(user.created_at)}</span>
          </div>
        </div>

        {/* Last Activity */}
        {user.last_login_at && (
          <div className="text-xs text-gray-500 mt-2">
            <ClockIcon className="h-3 w-3 inline mr-1" />
            Active {formatRelativeTime(user.last_login_at)}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// USER ROW COMPONENT (TABLE VIEW)
// ============================================================================

const UserRow: React.FC<UserRowProps> = ({
  user,
  isSelected,
  onSelect,
  onClick,
  onEdit,
  onDelete,
  onAssignRoles,
  onViewPermissions
}) => {
  const [showActions, setShowActions] = useState(false);

  const userStatus = useMemo(() => {
    if (!user.is_active) return { text: 'Inactive', color: 'red' };
    if (!user.is_verified) return { text: 'Unverified', color: 'yellow' };
    return { text: 'Active', color: 'green' };
  }, [user.is_active, user.is_verified]);

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection */}
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </td>

      {/* User */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center cursor-pointer" onClick={onClick}>
          <div className="relative flex-shrink-0 h-10 w-10">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={getUserDisplayName(user)}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserDisplayName(user).charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Status Indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              user.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <div className="ml-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-900">
                {getUserDisplayName(user)}
              </div>
              {user.mfa_enabled && (
                <ShieldCheckIcon className="h-4 w-4 text-blue-500" title="MFA Enabled" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              {formatUserEmail(user.email, { maxLength: 40 })}
            </div>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          userStatus.color === 'green' ? 'bg-green-100 text-green-800' :
          userStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {userStatus.text}
        </span>
      </td>

      {/* Roles */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.slice(0, 2).map((role) => (
              <span
                key={role.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: getRoleColor(role.name) }}
              >
                {role.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No roles</span>
          )}
          {user.roles && user.roles.length > 2 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              +{user.roles.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Department */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.department || '-'}
      </td>

      {/* Last Login */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.last_login_at ? formatRelativeTime(user.last_login_at) : 'Never'}
      </td>

      {/* Created */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(user.created_at, { format: 'short' })}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-end space-x-1"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="View Details"
              >
                <EyeIcon className="h-4 w-4" />
              </button>

              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit User"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}

              {onAssignRoles && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignRoles();
                  }}
                  className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Assign Roles"
                >
                  <UserGroupIcon className="h-4 w-4" />
                </button>
              )}

              {onViewPermissions && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPermissions();
                  }}
                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="View Permissions"
                >
                  <KeyIcon className="h-4 w-4" />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete User"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </motion.tr>
  );
};

// ============================================================================
// USER LIST ITEM COMPONENT (LIST VIEW)
// ============================================================================

const UserListItem: React.FC<UserCardProps> = ({
  user,
  isSelected,
  onSelect,
  onClick,
  onEdit,
  onDelete,
  onAssignRoles,
  onViewPermissions
}) => {
  const [showActions, setShowActions] = useState(false);

  const userStatus = useMemo(() => {
    if (!user.is_active) return { text: 'Inactive', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    if (!user.is_verified) return { text: 'Unverified', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    return { text: 'Active', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' };
  }, [user.is_active, user.is_verified]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center space-x-4">
        {/* Selection */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={getUserDisplayName(user)}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getUserDisplayName(user).charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Status Indicator */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
            user.is_active ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {getUserDisplayName(user)}
            </h3>
            {user.mfa_enabled && (
              <ShieldCheckIcon className="h-4 w-4 text-blue-500 flex-shrink-0" title="MFA Enabled" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 truncate">
            {formatUserEmail(user.email, { maxLength: 50 })}
          </p>
          
          <div className="flex items-center space-x-4 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${userStatus.bgColor} ${userStatus.textColor}`}>
              {userStatus.text}
            </span>
            
            {user.department && (
              <span className="text-xs text-gray-500">
                {user.department}
              </span>
            )}
            
            {user.last_login_at && (
              <span className="text-xs text-gray-500">
                <ClockIcon className="h-3 w-3 inline mr-1" />
                {formatRelativeTime(user.last_login_at)}
              </span>
            )}
          </div>
        </div>

        {/* Roles */}
        <div className="flex-shrink-0">
          <div className="flex flex-wrap gap-1 justify-end">
            {user.roles && user.roles.length > 0 ? (
              user.roles.slice(0, 2).map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getRoleColor(role.name) }}
                >
                  {role.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No roles</span>
            )}
            {user.roles && user.roles.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{user.roles.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center space-x-1"
              >
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}

                {onAssignRoles && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignRoles();
                    }}
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    title="Assign Roles"
                  >
                    <UserGroupIcon className="h-4 w-4" />
                  </button>
                )}

                {onViewPermissions && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewPermissions();
                    }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="View Permissions"
                  >
                    <KeyIcon className="h-4 w-4" />
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

const Pagination: React.FC<{
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}> = ({ pagination, onPageChange, onPageSizeChange }) => {
  const { page, pageSize, total, hasNextPage, hasPreviousPage } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> users
          </p>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPreviousPage}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pageNum === page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNextPage}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN USER LIST COMPONENT
// ============================================================================

export const UserList: React.FC<UserListProps> = ({
  users,
  selectedUsers,
  viewMode,
  sortBy,
  sortOrder,
  isLoading,
  pagination,
  onUserSelect,
  onSelectAll,
  onSort,
  onPageChange,
  onPageSizeChange,
  onUserClick,
  onEditUser,
  onDeleteUser,
  onAssignRoles,
  onViewPermissions
}) => {
  const allSelected = users.length > 0 && users.every(user => selectedUsers.has(user.id));
  const someSelected = users.some(user => selectedUsers.has(user.id));

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const renderTableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="px-6 py-3 text-left">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected && !allSelected;
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </th>
        
        <th 
          scope="col" 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('email')}
        >
          <div className="flex items-center space-x-1">
            <span>User</span>
            {getSortIcon('email')}
          </div>
        </th>
        
        <th 
          scope="col" 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('is_active')}
        >
          <div className="flex items-center space-x-1">
            <span>Status</span>
            {getSortIcon('is_active')}
          </div>
        </th>
        
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Roles
        </th>
        
        <th 
          scope="col" 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('department')}
        >
          <div className="flex items-center space-x-1">
            <span>Department</span>
            {getSortIcon('department')}
          </div>
        </th>
        
        <th 
          scope="col" 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('last_login_at')}
        >
          <div className="flex items-center space-x-1">
            <span>Last Login</span>
            {getSortIcon('last_login_at')}
          </div>
        </th>
        
        <th 
          scope="col" 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('created_at')}
        >
          <div className="flex items-center space-x-1">
            <span>Created</span>
            {getSortIcon('created_at')}
          </div>
        </th>
        
        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {users.length === 0 ? 'Get started by creating a new user.' : 'Try adjusting your search or filter criteria.'}
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-sm text-gray-600">Loading users...</span>
    </div>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  if (users.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {renderTableHeader()}
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.has(user.id)}
                    onSelect={(selected) => onUserSelect(user.id, selected)}
                    onClick={() => onUserClick(user)}
                    onEdit={onEditUser ? () => onEditUser(user) : undefined}
                    onDelete={onDeleteUser ? () => onDeleteUser(user.id) : undefined}
                    onAssignRoles={onAssignRoles ? () => onAssignRoles(user) : undefined}
                    onViewPermissions={onViewPermissions ? () => onViewPermissions(user) : undefined}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.has(user.id)}
                  onSelect={(selected) => onUserSelect(user.id, selected)}
                  onClick={() => onUserClick(user)}
                  onEdit={onEditUser ? () => onEditUser(user) : undefined}
                  onDelete={onDeleteUser ? () => onDeleteUser(user.id) : undefined}
                  onAssignRoles={onAssignRoles ? () => onAssignRoles(user) : undefined}
                  onViewPermissions={onViewPermissions ? () => onViewPermissions(user) : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-6 space-y-4">
          <AnimatePresence>
            {users.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                isSelected={selectedUsers.has(user.id)}
                onSelect={(selected) => onUserSelect(user.id, selected)}
                onClick={() => onUserClick(user)}
                onEdit={onEditUser ? () => onEditUser(user) : undefined}
                onDelete={onDeleteUser ? () => onDeleteUser(user.id) : undefined}
                onAssignRoles={onAssignRoles ? () => onAssignRoles(user) : undefined}
                onViewPermissions={onViewPermissions ? () => onViewPermissions(user) : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};