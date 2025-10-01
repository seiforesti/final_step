'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from 'react';
import { Shield, Lock, Unlock, Eye, EyeOff, AlertTriangle, Info, CheckCircle2, XCircle, Key, Users, User as UserIcon, Settings, Database, FileText, Folder, Globe, MapPin, Building, Smartphone, Monitor, Server, Network, Wifi, Clock, Calendar, Target, Flag, Tag, Star, Bookmark, Bell, Mail, Activity, BarChart3, PieChart, TrendingUp, TrendingDown, Brain, Zap, Lightbulb, HelpCircle, ExternalLink, Link, Copy, Edit, Trash2, Save, Upload, Download, Share, RefreshCw, MoreHorizontal, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib copie/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useNotifications } from '../../hooks/useNotifications';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { User } from '../../types/user.types';
import type { Permission, Role } from '../../types/role.types';

// ===================== INTERFACES & TYPES =====================

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string | string[];
  resource?: string;
  resourceType?: string;
  action?: string;
  context?: PermissionContext;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  showUnauthorized?: boolean;
  showPermissionInfo?: boolean;
  enableAuditLogging?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  onPermissionCheck?: (result: PermissionResult) => void;
  onUnauthorized?: (context: UnauthorizedContext) => void;
  strict?: boolean;
  requireAll?: boolean;
  allowSuperuser?: boolean;
  enableHierarchy?: boolean;
  enableDynamicEvaluation?: boolean;
  showDebugInfo?: boolean;
  className?: string;
}

interface PermissionContext {
  resourceId?: string | number;
  resourceOwnerId?: string | number;
  organizationId?: string | number;
  projectId?: string | number;
  environmentType?: 'development' | 'staging' | 'production';
  timeRestrictions?: {
    allowedHours?: { start: number; end: number };
    allowedDays?: number[];
    timezone?: string;
  };
  locationRestrictions?: {
    allowedCountries?: string[];
    allowedRegions?: string[];
    blockedIPs?: string[];
  };
  conditions?: Record<string, any>;
  metadata?: Record<string, any>;
  inheritanceRules?: {
    inheritFromParent?: boolean;
    inheritFromOwner?: boolean;
    inheritFromOrganization?: boolean;
  };
}

interface PermissionResult {
  hasPermission: boolean;
  reason?: string;
  matchedPermissions: Permission[];
  failedConditions: string[];
  evaluationTime: number;
  cacheHit: boolean;
  evaluationPath: string[];
  riskScore?: number;
  additionalContext?: Record<string, any>;
}

interface UnauthorizedContext {
  user: User;
  requestedPermission: string | string[];
  resource?: string;
  resourceType?: string;
  action?: string;
  context?: PermissionContext;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

interface PermissionCache {
  key: string;
  result: PermissionResult;
  timestamp: number;
  ttl: number;
  userId: number;
  context: string;
}

interface PermissionPolicy {
  id: string;
  name: string;
  description: string;
  type: 'allow' | 'deny' | 'conditional';
  priority: number;
  conditions: PolicyCondition[];
  effect: 'grant' | 'deny' | 'audit';
  scope: {
    resources?: string[];
    actions?: string[];
    users?: string[];
    roles?: string[];
    timeRange?: { start: string; end: string };
  };
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy: User;
}

interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains' | 'regex' | 'custom';
  value: any;
  negate?: boolean;
  caseSensitive?: boolean;
  customEvaluator?: (context: PermissionContext, value: any) => boolean;
}

interface PermissionHierarchy {
  permission: string;
  inherits: string[];
  implies: string[];
  excludes: string[];
  level: number;
  category: string;
  description: string;
}

interface PermissionAuditEvent {
  id: string;
  userId: number;
  user: User;
  permission: string | string[];
  resource?: string;
  resourceType?: string;
  action?: string;
  result: 'granted' | 'denied' | 'error';
  reason?: string;
  context?: PermissionContext;
  evaluationTime: number;
  riskScore?: number;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AccessPattern {
  userId: number;
  permission: string;
  resource?: string;
  frequency: number;
  lastAccessed: string;
  averageInterval: number;
  riskFlags: string[];
  anomalyScore: number;
  baseline: {
    normalHours: number[];
    commonResources: string[];
    typicalFrequency: number;
  };
}

interface PermissionInsight {
  type: 'usage_pattern' | 'risk_alert' | 'optimization' | 'compliance' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  affectedUsers: number;
  affectedPermissions: string[];
  impact: 'security' | 'performance' | 'usability' | 'compliance';
  timestamp: string;
  metadata: Record<string, any>;
}

// ===================== CONTEXT =====================

interface PermissionContextValue {
  user: User | null;
  permissions: Permission[];
  roles: Role[];
  checkPermission: (permission: string | string[], context?: PermissionContext) => Promise<PermissionResult>;
  isLoading: boolean;
  error: string | null;
  cache: Map<string, PermissionCache>;
  policies: PermissionPolicy[];
  hierarchy: PermissionHierarchy[];
  auditEvents: PermissionAuditEvent[];
  insights: PermissionInsight[];
  accessPatterns: AccessPattern[];
  refreshPermissions: () => Promise<void>;
  clearCache: () => void;
  evaluatePolicy: (policy: PermissionPolicy, context: PermissionContext) => boolean;
  getPermissionHierarchy: (permission: string) => PermissionHierarchy | null;
  recordAuditEvent: (event: Omit<PermissionAuditEvent, 'id' | 'timestamp'>) => void;
  analyzeAccessPatterns: (userId: number) => AccessPattern[];
  getPermissionInsights: () => PermissionInsight[];
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

// ===================== CONSTANTS =====================

const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const PERMISSION_HIERARCHIES: PermissionHierarchy[] = [
  {
    permission: 'admin',
    inherits: [],
    implies: ['read', 'write', 'delete', 'manage'],
    excludes: [],
    level: 0,
    category: 'administrative',
    description: 'Full administrative access'
  },
  {
    permission: 'manage',
    inherits: ['admin'],
    implies: ['read', 'write', 'configure'],
    excludes: ['delete'],
    level: 1,
    category: 'management',
    description: 'Management level access'
  },
  {
    permission: 'write',
    inherits: ['manage', 'admin'],
    implies: ['read'],
    excludes: [],
    level: 2,
    category: 'modification',
    description: 'Write and modify access'
  },
  {
    permission: 'read',
    inherits: ['write', 'manage', 'admin'],
    implies: [],
    excludes: [],
    level: 3,
    category: 'viewing',
    description: 'Read-only access'
  },
  {
    permission: 'audit.view',
    inherits: [],
    implies: ['read'],
    excludes: [],
    level: 2,
    category: 'audit',
    description: 'View audit logs'
  },
  {
    permission: 'audit.export',
    inherits: ['audit.view'],
    implies: ['audit.view'],
    excludes: [],
    level: 1,
    category: 'audit',
    description: 'Export audit data'
  },
  {
    permission: 'user.manage',
    inherits: ['admin'],
    implies: ['user.view', 'user.edit'],
    excludes: [],
    level: 1,
    category: 'user_management',
    description: 'Manage user accounts'
  },
  {
    permission: 'user.view',
    inherits: ['user.manage', 'admin'],
    implies: [],
    excludes: [],
    level: 2,
    category: 'user_management',
    description: 'View user information'
  }
];

const SYSTEM_POLICIES: PermissionPolicy[] = [
  {
    id: 'emergency_access',
    name: 'Emergency Access Override',
    description: 'Allow emergency access during critical incidents',
    type: 'conditional',
    priority: 1,
    conditions: [
      {
        field: 'emergency_mode',
        operator: 'equals',
        value: true
      }
    ],
    effect: 'grant',
    scope: {
      actions: ['read', 'write', 'emergency_action']
    },
    metadata: {
      requires_approval: true,
      audit_level: 'high',
      time_limit: 3600
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: { id: 0, email: 'system@company.com', name: 'System' } as User
  },
  {
    id: 'business_hours_only',
    name: 'Business Hours Restriction',
    description: 'Restrict access to business hours only',
    type: 'conditional',
    priority: 2,
    conditions: [
      {
        field: 'current_hour',
        operator: 'greater_than',
        value: 8
      },
      {
        field: 'current_hour',
        operator: 'less_than',
        value: 18
      }
    ],
    effect: 'deny',
    scope: {
      actions: ['sensitive_operation'],
      resources: ['production_db', 'financial_data']
    },
    metadata: {
      timezone: 'UTC',
      exceptions: ['emergency_user']
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: { id: 0, email: 'system@company.com', name: 'System' } as User
  }
];

// ===================== HOOKS =====================

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
};

// ===================== PROVIDER COMPONENT =====================

interface PermissionProviderProps {
  children: React.ReactNode;
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableAuditLogging?: boolean;
  enableInsights?: boolean;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
  enableCaching = true,
  cacheTimeout = DEFAULT_CACHE_TIMEOUT,
  enableAuditLogging = true,
  enableInsights = true
}) => {
  const { currentUser } = useCurrentUser();
  const { checkPermission: baseCheckPermission } = usePermissionCheck();
  const { createAuditLog } = useAuditLogs({}, false);
  const { sendNotification } = useNotifications();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Map<string, PermissionCache>>(new Map());
  const [policies] = useState<PermissionPolicy[]>(SYSTEM_POLICIES);
  const [hierarchy] = useState<PermissionHierarchy[]>(PERMISSION_HIERARCHIES);
  const [auditEvents, setAuditEvents] = useState<PermissionAuditEvent[]>([]);
  const [insights, setInsights] = useState<PermissionInsight[]>([]);
  const [accessPatterns, setAccessPatterns] = useState<AccessPattern[]>([]);

  // Refs
  const cacheCleanupRef = useRef<NodeJS.Timeout | null>(null);

  // Computed values
  const permissions = useMemo(() => {
    return currentUser?.roles?.flatMap(role => role.permissions || []) || [];
  }, [currentUser]);

  const roles = useMemo(() => {
    return currentUser?.roles || [];
  }, [currentUser]);

  // Cache management
  const generateCacheKey = useCallback((permission: string | string[], context?: PermissionContext) => {
    const permissionStr = Array.isArray(permission) ? permission.sort().join(',') : permission;
    const contextStr = context ? JSON.stringify(context) : '';
    return `${currentUser?.id || 'anonymous'}:${permissionStr}:${contextStr}`;
  }, [currentUser]);

  const getCachedResult = useCallback((key: string): PermissionResult | null => {
    if (!enableCaching) return null;

    const cached = cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      cache.delete(key);
      setCache(new Map(cache));
      return null;
    }

    return { ...cached.result, cacheHit: true };
  }, [cache, enableCaching]);

  const setCachedResult = useCallback((key: string, result: PermissionResult) => {
    if (!enableCaching) return;

    const cacheEntry: PermissionCache = {
      key,
      result: { ...result, cacheHit: false },
      timestamp: Date.now(),
      ttl: cacheTimeout,
      userId: currentUser?.id || 0,
      context: key
    };

    setCache(prev => new Map(prev).set(key, cacheEntry));
  }, [enableCaching, cacheTimeout, currentUser]);

  // Permission hierarchy evaluation
  const getPermissionHierarchy = useCallback((permission: string): PermissionHierarchy | null => {
    return hierarchy.find(h => h.permission === permission) || null;
  }, [hierarchy]);

  const evaluateHierarchy = useCallback((permission: string, userPermissions: string[]): boolean => {
    const hierarchy = getPermissionHierarchy(permission);
    if (!hierarchy) return userPermissions.includes(permission);

    // Check direct permission
    if (userPermissions.includes(permission)) return true;

    // Check inherited permissions
    for (const inheritedPerm of hierarchy.inherits) {
      if (userPermissions.includes(inheritedPerm)) return true;
    }

    // Check implied permissions
    for (const userPerm of userPermissions) {
      const userHierarchy = getPermissionHierarchy(userPerm);
      if (userHierarchy?.implies.includes(permission)) return true;
    }

    return false;
  }, [getPermissionHierarchy]);

  // Policy evaluation
  const evaluateCondition = useCallback((condition: PolicyCondition, context: PermissionContext): boolean => {
    if (condition.customEvaluator) {
      return condition.customEvaluator(context, condition.value);
    }

    const fieldValue = context.conditions?.[condition.field] || context.metadata?.[condition.field];
    
    let result = false;
    switch (condition.operator) {
      case 'equals':
        result = fieldValue === condition.value;
        break;
      case 'not_equals':
        result = fieldValue !== condition.value;
        break;
      case 'in':
        result = Array.isArray(condition.value) && condition.value.includes(fieldValue);
        break;
      case 'not_in':
        result = Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        break;
      case 'greater_than':
        result = Number(fieldValue) > Number(condition.value);
        break;
      case 'less_than':
        result = Number(fieldValue) < Number(condition.value);
        break;
      case 'contains':
        result = String(fieldValue).includes(String(condition.value));
        break;
      case 'regex':
        result = new RegExp(condition.value, condition.caseSensitive ? 'g' : 'gi').test(String(fieldValue));
        break;
    }

    return condition.negate ? !result : result;
  }, []);

  const evaluatePolicy = useCallback((policy: PermissionPolicy, context: PermissionContext): boolean => {
    if (!policy.isActive) return false;

    return policy.conditions.every(condition => evaluateCondition(condition, context));
  }, [evaluateCondition]);

  // Main permission check function
  const checkPermission = useCallback(async (permission: string | string[], context?: PermissionContext): Promise<PermissionResult> => {
    const startTime = Date.now();
    const evaluationPath: string[] = [];
    
    try {
      // Generate cache key
      const cacheKey = generateCacheKey(permission, context);
      
      // Check cache first
      const cachedResult = getCachedResult(cacheKey);
      if (cachedResult) {
        evaluationPath.push('cache_hit');
        return cachedResult;
      }

      evaluationPath.push('cache_miss');
      setIsLoading(true);

      if (!currentUser) {
        evaluationPath.push('no_user');
        const result: PermissionResult = {
          hasPermission: false,
          reason: 'User not authenticated',
          matchedPermissions: [],
          failedConditions: ['authentication_required'],
          evaluationTime: Date.now() - startTime,
          cacheHit: false,
          evaluationPath
        };
        setCachedResult(cacheKey, result);
        return result;
      }

      evaluationPath.push('user_authenticated');

      const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
      const userPermissionStrings = permissions.map(p => p.name || p.resource_type + ':' + p.action);
      
      evaluationPath.push('permissions_extracted');

      // Evaluate policies first
      const applicablePolicies = policies.filter(policy => {
        if (!context) return false;
        
        // Check scope matching
        const scopeMatch = (!policy.scope.actions || policy.scope.actions.some(action => 
          permissionsToCheck.some(p => p.includes(action))
        )) && (!policy.scope.users || policy.scope.users.includes(currentUser.email));

        return scopeMatch && evaluatePolicy(policy, context);
      });

      evaluationPath.push('policies_evaluated');

      // Sort policies by priority
      applicablePolicies.sort((a, b) => a.priority - b.priority);

      // Check for deny policies first
      const denyPolicy = applicablePolicies.find(p => p.effect === 'deny');
      if (denyPolicy) {
        evaluationPath.push('deny_policy_matched');
        const result: PermissionResult = {
          hasPermission: false,
          reason: `Denied by policy: ${denyPolicy.name}`,
          matchedPermissions: [],
          failedConditions: [`policy_${denyPolicy.id}`],
          evaluationTime: Date.now() - startTime,
          cacheHit: false,
          evaluationPath
        };
        setCachedResult(cacheKey, result);
        return result;
      }

      // Check for allow policies
      const allowPolicy = applicablePolicies.find(p => p.effect === 'grant');
      if (allowPolicy) {
        evaluationPath.push('allow_policy_matched');
        const result: PermissionResult = {
          hasPermission: true,
          reason: `Granted by policy: ${allowPolicy.name}`,
          matchedPermissions: permissions,
          failedConditions: [],
          evaluationTime: Date.now() - startTime,
          cacheHit: false,
          evaluationPath
        };
        setCachedResult(cacheKey, result);
        return result;
      }

      evaluationPath.push('checking_user_permissions');

      // Check user permissions with hierarchy
      const hasPermission = permissionsToCheck.every(perm => 
        evaluateHierarchy(perm, userPermissionStrings)
      );

      evaluationPath.push(hasPermission ? 'permission_granted' : 'permission_denied');

      const matchedPermissions = permissions.filter(p => {
        const permString = p.name || p.resource_type + ':' + p.action;
        return permissionsToCheck.some(reqPerm => 
          evaluateHierarchy(reqPerm, [permString])
        );
      });

      const result: PermissionResult = {
        hasPermission,
        reason: hasPermission ? 'Permission granted' : 'Insufficient permissions',
        matchedPermissions,
        failedConditions: hasPermission ? [] : ['insufficient_permissions'],
        evaluationTime: Date.now() - startTime,
        cacheHit: false,
        evaluationPath
      };

      // Cache the result
      setCachedResult(cacheKey, result);

      // Record audit event if enabled
      if (enableAuditLogging) {
        recordAuditEvent({
          userId: currentUser.id,
          user: currentUser,
          permission,
          result: hasPermission ? 'granted' : 'denied',
          reason: result.reason,
          context,
          evaluationTime: result.evaluationTime
        });
      }

      return result;

    } catch (err) {
      evaluationPath.push('error');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      const result: PermissionResult = {
        hasPermission: false,
        reason: `Error evaluating permission: ${errorMessage}`,
        matchedPermissions: [],
        failedConditions: ['evaluation_error'],
        evaluationTime: Date.now() - startTime,
        cacheHit: false,
        evaluationPath
      };

      return result;
    } finally {
      setIsLoading(false);
    }
  }, [
    currentUser,
    permissions,
    policies,
    generateCacheKey,
    getCachedResult,
    setCachedResult,
    evaluateHierarchy,
    evaluatePolicy,
    enableAuditLogging
  ]);

  // Audit logging
  const recordAuditEvent = useCallback((event: Omit<PermissionAuditEvent, 'id' | 'timestamp'>) => {
    if (!enableAuditLogging) return;

    const auditEvent: PermissionAuditEvent = {
      ...event,
      id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    setAuditEvents(prev => [auditEvent, ...prev.slice(0, 999)]); // Keep last 1000 events

    // Create system audit log
    createAuditLog({
      eventType: 'authorization',
      category: 'security',
      action: 'permission_check',
      resourceType: 'permission',
      resourceId: Array.isArray(event.permission) ? event.permission.join(',') : event.permission,
      success: event.result === 'granted',
      details: `Permission ${event.result}: ${event.reason}`,
      metadata: {
        userId: event.userId,
        permission: event.permission,
        context: event.context,
        evaluationTime: event.evaluationTime
      }
    });
  }, [enableAuditLogging, createAuditLog]);

  // Access pattern analysis
  const analyzeAccessPatterns = useCallback((userId: number): AccessPattern[] => {
    if (!enableInsights) return [];

    const userEvents = auditEvents.filter(event => event.userId === userId);
    const patterns: Map<string, AccessPattern> = new Map();

    userEvents.forEach(event => {
      const permKey = Array.isArray(event.permission) ? event.permission.join(',') : event.permission;
      const key = `${permKey}:${event.resource || 'global'}`;
      
      const existing = patterns.get(key);
      if (existing) {
        existing.frequency++;
        existing.lastAccessed = event.timestamp;
      } else {
        patterns.set(key, {
          userId,
          permission: permKey,
          resource: event.resource,
          frequency: 1,
          lastAccessed: event.timestamp,
          averageInterval: 0,
          riskFlags: [],
          anomalyScore: 0,
          baseline: {
            normalHours: [],
            commonResources: [],
            typicalFrequency: 0
          }
        });
      }
    });

    return Array.from(patterns.values());
  }, [auditEvents, enableInsights]);

  // Permission insights
  const getPermissionInsights = useCallback((): PermissionInsight[] => {
    if (!enableInsights) return [];

    const insights: PermissionInsight[] = [];

    // Analyze unused permissions
    const allPermissions = new Set(permissions.map(p => p.name || p.resource_type + ':' + p.action));
    const usedPermissions = new Set(auditEvents.map(e => 
      Array.isArray(e.permission) ? e.permission.join(',') : e.permission
    ));

    const unusedCount = allPermissions.size - usedPermissions.size;
    if (unusedCount > 0) {
      insights.push({
        type: 'optimization',
        severity: 'medium',
        title: 'Unused Permissions Detected',
        description: `${unusedCount} permissions have not been used recently`,
        recommendation: 'Review and remove unused permissions to improve security',
        affectedUsers: 1,
        affectedPermissions: Array.from(allPermissions).filter(p => !usedPermissions.has(p)),
        impact: 'security',
        timestamp: new Date().toISOString(),
        metadata: { unusedCount }
      });
    }

    // Analyze high-frequency access
    const frequentAccess = auditEvents.reduce((acc, event) => {
      const key = `${event.userId}:${Array.isArray(event.permission) ? event.permission.join(',') : event.permission}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const highFrequencyThreshold = 100;
    Object.entries(frequentAccess).forEach(([key, count]) => {
      if (count > highFrequencyThreshold) {
        const [userId, permission] = key.split(':');
        insights.push({
          type: 'usage_pattern',
          severity: 'low',
          title: 'High Permission Usage',
          description: `User ${userId} has accessed ${permission} ${count} times`,
          recommendation: 'Monitor for potential automation or consider caching',
          affectedUsers: 1,
          affectedPermissions: [permission],
          impact: 'performance',
          timestamp: new Date().toISOString(),
          metadata: { userId, permission, count }
        });
      }
    });

    return insights;
  }, [auditEvents, permissions, enableInsights]);

  // Refresh permissions
  const refreshPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      // This would typically refetch user data
      setError(null);
      clearCache();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh permissions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Cache cleanup effect
  useEffect(() => {
    if (enableCaching) {
      cacheCleanupRef.current = setInterval(() => {
        const now = Date.now();
        setCache(prev => {
          const newCache = new Map();
          prev.forEach((value, key) => {
            if (now - value.timestamp < value.ttl) {
              newCache.set(key, value);
            }
          });
          return newCache;
        });
      }, 60000); // Cleanup every minute

      return () => {
        if (cacheCleanupRef.current) {
          clearInterval(cacheCleanupRef.current);
        }
      };
    }
  }, [enableCaching]);

  // Update insights periodically
  useEffect(() => {
    if (enableInsights) {
      const interval = setInterval(() => {
        setInsights(getPermissionInsights());
        if (currentUser) {
          setAccessPatterns(analyzeAccessPatterns(currentUser.id));
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [enableInsights, getPermissionInsights, analyzeAccessPatterns, currentUser]);

  const contextValue: PermissionContextValue = {
    user: currentUser,
    permissions,
    roles,
    checkPermission,
    isLoading,
    error,
    cache,
    policies,
    hierarchy,
    auditEvents,
    insights,
    accessPatterns,
    refreshPermissions,
    clearCache,
    evaluatePolicy,
    getPermissionHierarchy,
    recordAuditEvent,
    analyzeAccessPatterns,
    getPermissionInsights
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

// ===================== MAIN GUARD COMPONENT =====================

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  resource,
  resourceType,
  action,
  context,
  fallback,
  loading,
  showUnauthorized = true,
  showPermissionInfo = false,
  enableAuditLogging = true,
  enableCaching = true,
  cacheTimeout = DEFAULT_CACHE_TIMEOUT,
  onPermissionCheck,
  onUnauthorized,
  strict = false,
  requireAll = true,
  allowSuperuser = true,
  enableHierarchy = true,
  enableDynamicEvaluation = true,
  showDebugInfo = false,
  className
}) => {
  const { currentUser } = useCurrentUser();
  const permissionContext = usePermissionContext();

  // State
  const [permissionResult, setPermissionResult] = useState<PermissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Refs
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check permission effect
  useEffect(() => {
    const performPermissionCheck = async () => {
      if (!permission) {
        setPermissionResult({
          hasPermission: true,
          reason: 'No permission required',
          matchedPermissions: [],
          failedConditions: [],
          evaluationTime: 0,
          cacheHit: false,
          evaluationPath: ['no_permission_required']
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const fullContext: PermissionContext = {
          ...context,
          resourceId: resource,
          metadata: {
            ...context?.metadata,
            resourceType,
            action,
            strict,
            requireAll,
            allowSuperuser,
            enableHierarchy,
            enableDynamicEvaluation
          }
        };

        const result = await permissionContext.checkPermission(permission, fullContext);
        setPermissionResult(result);

        // Call callback
        onPermissionCheck?.(result);

        // Handle unauthorized access
        if (!result.hasPermission && onUnauthorized) {
          const unauthorizedContext: UnauthorizedContext = {
            user: currentUser!,
            requestedPermission: permission,
            resource,
            resourceType,
            action,
            context: fullContext,
            timestamp: new Date().toISOString(),
            sessionId: 'current_session' // This would come from session management
          };
          onUnauthorized(unauthorizedContext);
        }

      } catch (error) {
        console.error('Permission check failed:', error);
        setPermissionResult({
          hasPermission: false,
          reason: 'Permission check failed',
          matchedPermissions: [],
          failedConditions: ['check_failed'],
          evaluationTime: 0,
          cacheHit: false,
          evaluationPath: ['error']
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce permission checks
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(performPermissionCheck, 100);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [
    permission,
    resource,
    resourceType,
    action,
    context,
    strict,
    requireAll,
    allowSuperuser,
    enableHierarchy,
    enableDynamicEvaluation,
    permissionContext,
    currentUser,
    onPermissionCheck,
    onUnauthorized
  ]);

  // Render loading state
  if (isLoading) {
    if (loading) {
      return <>{loading}</>;
    }

    return (
      <div className={cn("flex items-center space-x-2 p-4", className)}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
        <span className="text-sm text-muted-foreground">Checking permissions...</span>
      </div>
    );
  }

  // Render unauthorized state
  if (!permissionResult?.hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showUnauthorized) {
      return null;
    }

    return (
      <div className={cn("p-6", className)}>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>You don't have permission to access this resource.</p>
            
            {showPermissionInfo && (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Required permission:</strong> {Array.isArray(permission) ? permission.join(', ') : permission}
                </p>
                {resource && (
                  <p className="text-sm">
                    <strong>Resource:</strong> {resource}
                  </p>
                )}
                {permissionResult?.reason && (
                  <p className="text-sm">
                    <strong>Reason:</strong> {permissionResult.reason}
                  </p>
                )}
              </div>
            )}

            {showDebugInfo && permissionResult && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} Debug Info
                </Button>
                
                {showDetails && (
                  <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
                    <pre>{JSON.stringify(permissionResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => permissionContext.refreshPermissions()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Permissions
              </Button>
              
              {permissionContext.insights.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // This could open a dialog with permission insights
                    console.log('Permission insights:', permissionContext.insights);
                  }}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  View Insights
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render children with permission context
  return (
    <div className={className}>
      {children}
      
      {showDebugInfo && permissionResult && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <div className="flex items-center space-x-1 text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            <span>Permission granted</span>
            {permissionResult.cacheHit && (
              <Badge variant="outline" className="text-xs">cached</Badge>
            )}
            <span>({permissionResult.evaluationTime}ms)</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== UTILITY COMPONENTS =====================

interface PermissionBadgeProps {
  permission: string | string[];
  context?: PermissionContext;
  showResult?: boolean;
  className?: string;
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({
  permission,
  context,
  showResult = true,
  className
}) => {
  const permissionContext = usePermissionContext();
  const [result, setResult] = useState<PermissionResult | null>(null);

  useEffect(() => {
    permissionContext.checkPermission(permission, context).then(setResult);
  }, [permission, context, permissionContext]);

  if (!showResult || !result) {
    return (
      <Badge variant="outline" className={className}>
        {Array.isArray(permission) ? permission.join(', ') : permission}
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant={result.hasPermission ? "default" : "destructive"}
            className={className}
          >
            {result.hasPermission ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {Array.isArray(permission) ? permission.join(', ') : permission}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p><strong>Status:</strong> {result.hasPermission ? 'Granted' : 'Denied'}</p>
            <p><strong>Reason:</strong> {result.reason}</p>
            <p><strong>Evaluation time:</strong> {result.evaluationTime}ms</p>
            {result.cacheHit && <p><strong>Source:</strong> Cache</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ===================== UTILITY HOOKS =====================

export const usePermissionGuard = (permission: string | string[], context?: PermissionContext) => {
  const permissionContext = usePermissionContext();
  const [result, setResult] = useState<PermissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    permissionContext.checkPermission(permission, context)
      .then(setResult)
      .finally(() => setIsLoading(false));
  }, [permission, context, permissionContext]);

  return {
    hasPermission: result?.hasPermission ?? false,
    result,
    isLoading,
    refresh: () => {
      setIsLoading(true);
      return permissionContext.checkPermission(permission, context)
        .then(setResult)
        .finally(() => setIsLoading(false));
    }
  };
};

export default PermissionGuard;