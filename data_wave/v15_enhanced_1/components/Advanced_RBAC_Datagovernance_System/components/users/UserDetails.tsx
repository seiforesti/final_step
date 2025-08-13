'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  BoltIcon,
  StarIcon,
  FlagIcon,
  LockClosedIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PhotoIcon,
  LinkIcon,
  HashtagIcon,
  IdentificationIcon,
  WifiIcon,
  SignalIcon,
  CpuChipIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { formatDate, formatRelativeTime, formatUserName, formatUserEmail, formatDuration } from '../../utils/format.utils';
import { getUserDisplayName, getRoleColor, hasPermission } from '../../utils/rbac.utils';
import { generateSecureRandom } from '../../utils/security.utils';
import type {
  User,
  UserActivity,
  UserSession,
  UserSecurityInfo,
  UserStats,
  UserAuditLog,
  Permission,
  Role
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UserDetailsProps {
  user: User;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssignRoles?: () => void;
  onViewPermissions?: () => void;
}

interface UserDetailedInfo {
  user: User;
  activities: UserActivity[];
  sessions: UserSession[];
  securityInfo: UserSecurityInfo;
  stats: UserStats;
  auditLogs: UserAuditLog[];
  effectivePermissions: Permission[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}

interface ActivityTimelineItem {
  id: string;
  type: 'login' | 'logout' | 'role_assigned' | 'role_removed' | 'permission_granted' | 'permission_revoked' | 'profile_updated' | 'security_event' | 'mfa_enabled' | 'mfa_disabled';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface SecurityMetrics {
  securityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastSecurityCheck: Date;
  securityIssues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendation: string;
  }>;
  complianceStatus: {
    gdpr: boolean;
    sox: boolean;
    hipaa: boolean;
    pci: boolean;
  };
}

// ============================================================================
// ADVANCED USER DETAILS COMPONENT
// ============================================================================

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  onClose,
  onEdit,
  onDelete,
  onAssignRoles,
  onViewPermissions
}) => {
  // State Management
  const [detailedInfo, setDetailedInfo] = useState<UserDetailedInfo>({
    user,
    activities: [],
    sessions: [],
    securityInfo: {} as UserSecurityInfo,
    stats: {} as UserStats,
    auditLogs: [],
    effectivePermissions: [],
    roles: [],
    isLoading: true,
    error: null
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'security' | 'permissions' | 'audit'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile', 'roles']));
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const { currentUser, permissions } = useCurrentUser();

  // Permission checks
  const canEdit = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.edit', user.id.toString()), [currentUser, user.id]);
  const canDelete = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.delete', user.id.toString()), [currentUser, user.id]);
  const canViewSecurity = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'users.security.view', user.id.toString()), [currentUser, user.id]);
  const canViewAudit = useMemo(() => 
    hasPermission(currentUser?.id || 0, 'audit.view', user.id.toString()), [currentUser, user.id]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchUserDetails = useCallback(async () => {
    try {
      setDetailedInfo(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch comprehensive user data
      const [
        userResponse,
        activitiesResponse,
        sessionsResponse,
        securityResponse,
        statsResponse,
        auditResponse,
        permissionsResponse,
        rolesResponse
      ] = await Promise.all([
        userService.getUserById(user.id),
        userService.getUserActivities(user.id, { limit: 50 }),
        userService.getUserSessions(user.id),
        canViewSecurity ? userService.getUserSecurityInfo(user.id) : Promise.resolve({ data: {} }),
        userService.getUserStats(user.id),
        canViewAudit ? userService.getUserAuditLogs(user.id, { limit: 100 }) : Promise.resolve({ data: [] }),
        userService.getUserEffectivePermissions(user.id),
        userService.getUserRoles(user.id)
      ]);

      setDetailedInfo(prev => ({
        ...prev,
        user: userResponse.data,
        activities: activitiesResponse.data,
        sessions: sessionsResponse.data,
        securityInfo: securityResponse.data,
        stats: statsResponse.data,
        auditLogs: auditResponse.data,
        effectivePermissions: permissionsResponse.data,
        roles: rolesResponse.data,
        isLoading: false
      }));

      // Fetch security metrics if allowed
      if (canViewSecurity) {
        const securityMetricsResponse = await userService.getUserSecurityMetrics(user.id);
        setSecurityMetrics(securityMetricsResponse.data);
      }

    } catch (error: any) {
      setDetailedInfo(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch user details',
        isLoading: false
      }));
    }
  }, [user.id, canViewSecurity, canViewAudit]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchUserDetails();
    setRefreshing(false);
  }, [fetchUserDetails]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

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

  const getUserStatus = useCallback(() => {
    if (!detailedInfo.user.is_active) {
      return { text: 'Inactive', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    }
    if (!detailedInfo.user.is_verified) {
      return { text: 'Unverified', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    }
    return { text: 'Active', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' };
  }, [detailedInfo.user]);

  const getActivityTimeline = useCallback((): ActivityTimelineItem[] => {
    const timeline: ActivityTimelineItem[] = [];

    // Add activities
    detailedInfo.activities.forEach(activity => {
      timeline.push({
        id: `activity-${activity.id}`,
        type: activity.type as any,
        title: activity.title,
        description: activity.description,
        timestamp: new Date(activity.timestamp),
        severity: activity.severity as any,
        metadata: activity.metadata
      });
    });

    // Add audit logs
    detailedInfo.auditLogs.forEach(log => {
      timeline.push({
        id: `audit-${log.id}`,
        type: 'security_event',
        title: log.action,
        description: log.details || log.action,
        timestamp: new Date(log.timestamp),
        severity: log.severity as any || 'low',
        metadata: log.metadata
      });
    });

    // Sort by timestamp (newest first)
    return timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [detailedInfo.activities, detailedInfo.auditLogs]);

  const getSecurityRiskLevel = useCallback(() => {
    if (!securityMetrics) return 'medium';
    return securityMetrics.riskLevel;
  }, [securityMetrics]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-6">
          {/* User Avatar */}
          <div className="relative">
            {detailedInfo.user.profile_picture ? (
              <img
                src={detailedInfo.user.profile_picture}
                alt={getUserDisplayName(detailedInfo.user)}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {getUserDisplayName(detailedInfo.user).charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${
              detailedInfo.user.is_active ? 'bg-green-500' : 'bg-red-500'
            }`} />
            
            {/* MFA Indicator */}
            {detailedInfo.user.mfa_enabled && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {getUserDisplayName(detailedInfo.user)}
            </h1>
            
            <div className="flex items-center space-x-4 text-blue-100">
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4" />
                <span>{detailedInfo.user.email}</span>
              </div>
              
              {detailedInfo.user.phone_number && (
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{detailedInfo.user.phone_number}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Status Badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getUserStatus().bgColor
              } ${getUserStatus().textColor}`}>
                {getUserStatus().text}
              </span>

              {/* Security Score */}
              {securityMetrics && (
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Security: {securityMetrics.securityScore}%
                  </span>
                </div>
              )}

              {/* Role Count */}
              {detailedInfo.roles.length > 0 && (
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <UserGroupIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {detailedInfo.roles.length} role{detailedInfo.roles.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
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

          {onAssignRoles && (
            <button
              onClick={onAssignRoles}
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Roles
            </button>
          )}

          {onViewPermissions && (
            <button
              onClick={onViewPermissions}
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              Permissions
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
          { id: 'overview', name: 'Overview', icon: UserIcon },
          { id: 'activity', name: 'Activity', icon: ClockIcon },
          { id: 'security', name: 'Security', icon: ShieldCheckIcon, requiresPermission: canViewSecurity },
          { id: 'permissions', name: 'Permissions', icon: KeyIcon },
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
      {/* Profile Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => toggleSection('profile')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            {expandedSections.has('profile') ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.has('profile') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {detailedInfo.user.first_name && detailedInfo.user.last_name
                        ? `${detailedInfo.user.first_name} ${detailedInfo.user.last_name}`
                        : getUserDisplayName(detailedInfo.user)
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{detailedInfo.user.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {detailedInfo.user.phone_number || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {detailedInfo.user.department || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Region</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {detailedInfo.user.region || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">User ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">#{detailedInfo.user.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(detailedInfo.user.created_at, { format: 'full' })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(detailedInfo.user.updated_at, { format: 'full' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Roles */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => toggleSection('roles')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Roles ({detailedInfo.roles.length})
            </h3>
            {expandedSections.has('roles') ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.has('roles') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-4"
            >
              {detailedInfo.roles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailedInfo.roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRoleColor(role.name) }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{role.name}</p>
                          <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {role.permissions?.length || 0} permissions
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No roles assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This user has not been assigned any roles yet.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Statistics */}
      {detailedInfo.stats && Object.keys(detailedInfo.stats).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {detailedInfo.stats.login_count || 0}
              </div>
              <div className="text-sm text-gray-500">Total Logins</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {detailedInfo.stats.active_sessions || 0}
              </div>
              <div className="text-sm text-gray-500">Active Sessions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {detailedInfo.stats.permissions_count || 0}
              </div>
              <div className="text-sm text-gray-500">Total Permissions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderActivityTab = () => {
    const timeline = getActivityTimeline();

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
          
          {timeline.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {timeline.slice(0, 20).map((item, index) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {index !== timeline.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            item.severity === 'critical' ? 'bg-red-500' :
                            item.severity === 'high' ? 'bg-orange-500' :
                            item.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}>
                            {item.type === 'login' && <ComputerDesktopIcon className="h-4 w-4 text-white" />}
                            {item.type === 'logout' && <PowerIcon className="h-4 w-4 text-white" />}
                            {item.type === 'role_assigned' && <UserGroupIcon className="h-4 w-4 text-white" />}
                            {item.type === 'permission_granted' && <KeyIcon className="h-4 w-4 text-white" />}
                            {item.type === 'security_event' && <ShieldCheckIcon className="h-4 w-4 text-white" />}
                            {!['login', 'logout', 'role_assigned', 'permission_granted', 'security_event'].includes(item.type) && (
                              <InformationCircleIcon className="h-4 w-4 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatRelativeTime(item.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                No recent activity found for this user.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSecurityTab = () => {
    if (!canViewSecurity) {
      return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view security information.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Security Overview */}
        {securityMetrics && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  securityMetrics.securityScore >= 80 ? 'text-green-600' :
                  securityMetrics.securityScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {securityMetrics.securityScore}%
                </div>
                <div className="text-sm text-gray-500">Security Score</div>
              </div>
              
              <div className="text-center">
                <div className={`text-xl font-semibold capitalize ${
                  securityMetrics.riskLevel === 'low' ? 'text-green-600' :
                  securityMetrics.riskLevel === 'medium' ? 'text-yellow-600' :
                  securityMetrics.riskLevel === 'high' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {securityMetrics.riskLevel}
                </div>
                <div className="text-sm text-gray-500">Risk Level</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">
                  {securityMetrics.securityIssues.length}
                </div>
                <div className="text-sm text-gray-500">Security Issues</div>
              </div>
            </div>

            {/* Security Issues */}
            {securityMetrics.securityIssues.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Security Issues</h4>
                <div className="space-y-3">
                  {securityMetrics.securityIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        issue.severity === 'critical' ? 'border-red-200 bg-red-50' :
                        issue.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                        issue.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className={`h-5 w-5 mt-0.5 ${
                          issue.severity === 'critical' ? 'text-red-500' :
                          issue.severity === 'high' ? 'text-orange-500' :
                          issue.severity === 'medium' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{issue.message}</p>
                          <p className="text-sm text-gray-600 mt-1">{issue.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Sessions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
          
          {detailedInfo.sessions.length > 0 ? (
            <div className="space-y-4">
              {detailedInfo.sessions.filter(session => session.is_active).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {session.device_type === 'mobile' ? (
                        <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" />
                      ) : (
                        <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.device_type || 'Unknown Device'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.ip_address} • {session.location || 'Unknown location'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {formatRelativeTime(session.last_activity_at)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Started {formatRelativeTime(session.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
              <p className="mt-1 text-sm text-gray-500">
                This user has no active sessions.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Effective Permissions ({detailedInfo.effectivePermissions.length})
        </h3>
        
        {detailedInfo.effectivePermissions.length > 0 ? (
          <div className="space-y-4">
            {detailedInfo.effectivePermissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {permission.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    Resource: {permission.resource}
                  </p>
                  {permission.conditions && (
                    <p className="text-xs text-gray-400 mt-1">
                      Conditions: {permission.conditions}
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Via: {permission.source || 'Direct'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions</h3>
            <p className="mt-1 text-sm text-gray-500">
              This user has no effective permissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );

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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Logs</h3>
          
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
                No audit logs found for this user.
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

  if (detailedInfo.isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Loading user details...</span>
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
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        {renderHeader()}

        {/* Tabs */}
        {renderTabs()}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'activity' && renderActivityTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'permissions' && renderPermissionsTab()}
          {activeTab === 'audit' && renderAuditTab()}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {formatRelativeTime(detailedInfo.user.updated_at)}
          </div>
          
          <div className="flex items-center space-x-3">
            {onDelete && canDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete User
              </button>
            )}
            
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};