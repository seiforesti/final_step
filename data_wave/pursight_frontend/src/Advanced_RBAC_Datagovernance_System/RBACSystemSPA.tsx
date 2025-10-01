'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast, Toaster } from 'react-hot-toast';
import { Shield, Users, UserCheck, Key, Lock, Database, Activity, FileText, Settings, Bell, Search, Filter, Download, Upload, RefreshCw, TrendingUp, BarChart3, PieChart, AlertTriangle, CheckCircle, Clock, Zap, Globe, Monitor, Smartphone, Cloud, Server, Cpu, HardDrive, Network, Eye, EyeOff, Maximize, Minimize, Grid, List, Layout, Sidebar, Menu, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus, Minus, Edit, Trash, Copy, Share, Star, Bookmark, Flag, Tag, Calendar, Timer, MapPin, Mail, Phone, User as UserIcon, UserPlus, UserMinus, UserX, Crown, Award, Target, Layers, GitBranch, Command as CommandIcon, Terminal, Code, Bug, Wrench, Gauge, Compass, Navigation, Map, Route, Waypoints } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// RBAC Hooks and Services
import { useCurrentUser } from './hooks/useCurrentUser';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './hooks/useAuth';
import { useUsers } from './hooks/useUsers';
import { useRoles } from './hooks/useRoles';
import { usePermissions } from './hooks/usePermissions';
import { useResources } from './hooks/useResources';
import { useGroups } from './hooks/useGroups';
import { useConditions } from './hooks/useConditions';
import { useAccessRequests } from './hooks/useAccessRequests';
import { useAuditLogs } from './hooks/useAuditLogs';
import { useRBACWebSocket } from './hooks/useRBACWebSocket';
import { usePermissionCheck } from './hooks/usePermissionCheck';
import { useRBACState } from './hooks/useRBACState';
import { RBACStateProvider } from './hooks/useRBACState';

// RBAC Components
import { RBACLayout } from './components/layout/RBACLayout';
import { RBACHeader } from './components/layout/RBACHeader';
import { RBACNavigation } from './components/layout/RBACNavigation';
import { RBACBreadcrumb } from './components/layout/RBACBreadcrumb';

// User Management Components
import { UserManagement } from './components/users/UserManagement';
import { UserList } from './components/users/UserList';
import { UserDetails } from './components/users/UserDetails';
import { UserCreateEdit } from './components/users/UserCreateEdit';
import { UserRoleAssignment } from './components/users/UserRoleAssignment';
import { UserPermissionView } from './components/users/UserPermissionView';

// Role Management Components
import { RoleManagement } from './components/roles/RoleManagement';
import { RoleList } from './components/roles/RoleList';
import { RoleDetails } from './components/roles/RoleDetails';
import { RoleCreateEdit } from './components/roles/RoleCreateEdit';
import { RoleInheritance } from './components/roles/RoleInheritance';
import { RolePermissionMatrix } from './components/roles/RolePermissionMatrix';

// Permission Management Components
import { PermissionManagement } from './components/permissions/PermissionManagement';
import { PermissionList } from './components/permissions/PermissionList';
import { PermissionDetails } from './components/permissions/PermissionDetails';
import { PermissionCreateEdit } from './components/permissions/PermissionCreateEdit';
import { PermissionMatrix } from './components/permissions/PermissionMatrix';

// Resource Management Components
import { ResourceManagement } from './components/resources/ResourceManagement';
import { ResourceTree } from './components/resources/ResourceTree';
import { ResourceDetails } from './components/resources/ResourceDetails';
import { ResourceCreateEdit } from './components/resources/ResourceCreateEdit';
import { ResourceRoleAssignment } from './components/resources/ResourceRoleAssignment';

// Group Management Components
import { GroupManagement } from './components/groups/GroupManagement';
import { GroupList } from './components/groups/GroupList';
import { GroupDetails } from './components/groups/GroupDetails';
import { GroupCreateEdit } from './components/groups/GroupCreateEdit';
import { GroupMemberManagement } from './components/groups/GroupMemberManagement';

// Condition Management Components
import { ConditionManagement } from './components/conditions/ConditionManagement';
import { ConditionBuilder } from './components/conditions/ConditionBuilder';
import { ConditionTemplates } from './components/conditions/ConditionTemplates';
import { ConditionValidator } from './components/conditions/ConditionValidator';

// Access Request Components
import { AccessRequestManagement } from './components/access-requests/AccessRequestManagement';
import { AccessRequestList } from './components/access-requests/AccessRequestList';
import { AccessRequestDetails } from './components/access-requests/AccessRequestDetails';
import { AccessRequestCreate } from './components/access-requests/AccessRequestCreate';
import { AccessReviewInterface } from './components/access-requests/AccessReviewInterface';

// Audit Components
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { AuditFilters } from './components/audit/AuditFilters';
import { AuditExport } from './components/audit/AuditExport';
import { AuditDashboard } from './components/audit/AuditDashboard';

// Shared Components
import { PermissionGuard } from './components/shared/PermissionGuard';
import { LoadingStates, LoadingSpinner, WebSocketConnectionLoading } from './components/shared/LoadingStates';
import { ErrorBoundary as RBACErrorBoundary } from './components/shared/ErrorBoundary';
import { DataTable } from './components/shared/DataTable';
import { SearchFilters } from './components/shared/SearchFilters';
import { BulkActions } from './components/shared/BulkActions';
import { ExportDialog } from './components/shared/ExportDialog';

// Types and Utilities
import type { User } from './types/user.types';
import type { Role } from './types/role.types';
import type { Permission } from './types/permission.types';
import type { Resource } from './types/resource.types';
import type { Group } from './types/group.types';
import type { AccessRequest } from './types/access-request.types';
import type { AuditLog } from './types/audit.types';
import { cn } from '@/lib copie/utils';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export type RBACModule = 
  | 'dashboard'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'resources'
  | 'groups'
  | 'conditions'
  | 'access-requests'
  | 'audit'
  | 'analytics'
  | 'settings';

export type RBACView = 
  | 'management'
  | 'list'
  | 'details'
  | 'create'
  | 'edit'
  | 'assign'
  | 'matrix'
  | 'tree'
  | 'builder'
  | 'validator'
  | 'review'
  | 'export'
  | 'import'
  | 'dashboard';

export interface RBACModuleConfig {
  id: RBACModule;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  permission?: string;
  badge?: {
    content: string | number;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  views: Array<{
    id: RBACView;
    title: string;
    component: React.ComponentType<any>;
    permission?: string;
  }>;
  quickActions?: Array<{
    id: string;
    title: string;
    icon: React.ReactNode;
    action: () => void;
    permission?: string;
  }>;
}

export interface RBACAnalytics {
  users: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    trend: number;
  };
  roles: {
    total: number;
    custom: number;
    builtin: number;
    mostUsed: Array<{ name: string; count: number }>;
  };
  permissions: {
    total: number;
    assigned: number;
    unused: number;
    mostRequested: Array<{ name: string; count: number }>;
  };
  resources: {
    total: number;
    secured: number;
    public: number;
    hierarchy: number;
  };
  groups: {
    total: number;
    active: number;
    avgMembers: number;
    largestGroup: { name: string; members: number };
  };
  accessRequests: {
    pending: number;
    approved: number;
    denied: number;
    avgProcessingTime: number;
  };
  auditLogs: {
    totalEvents: number;
    criticalEvents: number;
    todayEvents: number;
    recentActivity: Array<{
      action: string;
      user: string;
      timestamp: Date;
      resource?: string;
    }>;
  };
  security: {
    mfaEnabled: number;
    sessionCount: number;
    suspiciousActivity: number;
    complianceScore: number;
  };
}

export interface RBACWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'automation' | 'notification' | 'review';
  trigger: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  isActive: boolean;
  lastTriggered?: Date;
  executionCount: number;
}

export interface RBACNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  metadata?: Record<string, any>;
}

export interface RBACPreferences {
  theme: 'light' | 'dark' | 'system';
  layout: 'compact' | 'comfortable' | 'spacious';
  defaultModule: RBACModule;
  notifications: {
    desktop: boolean;
    email: boolean;
    accessRequests: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
  };
  dashboard: {
    widgets: string[];
    layout: 'grid' | 'list';
    autoRefresh: boolean;
    refreshInterval: number;
  };
  table: {
    pageSize: number;
    density: 'compact' | 'standard' | 'comfortable';
    showFilters: boolean;
  };
}

export interface RBACSystemState {
  activeModule: RBACModule;
  activeView: RBACView;
  selectedItems: Set<string>;
  isLoading: boolean;
  error: string | null;
  preferences: RBACPreferences;
  notifications: RBACNotification[];
  workflows: RBACWorkflow[];
  analytics: RBACAnalytics | null;
  searchQuery: string;
  globalFilters: Record<string, any>;
  breadcrumbs: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  lastActivity: Date;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_PREFERENCES: RBACPreferences = {
  theme: 'system',
  layout: 'comfortable',
  defaultModule: 'dashboard',
  notifications: {
    desktop: true,
    email: true,
    accessRequests: true,
    securityAlerts: true,
    systemUpdates: false
  },
  dashboard: {
    widgets: ['overview', 'recent-activity', 'pending-requests', 'security-alerts'],
    layout: 'grid',
    autoRefresh: true,
    refreshInterval: 30000
  },
  table: {
    pageSize: 25,
    density: 'standard',
    showFilters: true
  }
};

const RBAC_MODULES: RBACModuleConfig[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'RBAC system overview and analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'bg-blue-500',
    views: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        component: () => <RBACDashboard />
      }
    ]
  },
  {
    id: 'users',
    title: 'Users',
    description: 'User management and role assignments',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-green-500',
    permission: 'rbac.users.view',
    views: [
      {
        id: 'management',
        title: 'User Management',
        component: UserManagement,
        permission: 'rbac.users.view'
      },
      {
        id: 'list',
        title: 'User List',
        component: UserList,
        permission: 'rbac.users.view'
      },
      {
        id: 'details',
        title: 'User Details',
        component: UserDetails,
        permission: 'rbac.users.view'
      },
      {
        id: 'create',
        title: 'Create User',
        component: UserCreateEdit,
        permission: 'rbac.users.create'
      },
      {
        id: 'assign',
        title: 'Role Assignment',
        component: UserRoleAssignment,
        permission: 'rbac.users.assign_roles'
      }
    ],
    quickActions: [
      {
        id: 'create-user',
        title: 'Create User',
        icon: <UserPlus className="h-4 w-4" />,
        action: () => {}, // Will be set dynamically
        permission: 'rbac.users.create'
      },
      {
        id: 'bulk-assign-roles',
        title: 'Bulk Assign Roles',
        icon: <Users className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.users.assign_roles'
      }
    ]
  },
  {
    id: 'roles',
    title: 'Roles',
    description: 'Role hierarchy and permission management',
    icon: <Crown className="h-5 w-5" />,
    color: 'bg-purple-500',
    permission: 'rbac.roles.view',
    views: [
      {
        id: 'management',
        title: 'Role Management',
        component: RoleManagement,
        permission: 'rbac.roles.view'
      },
      {
        id: 'list',
        title: 'Role List',
        component: RoleList,
        permission: 'rbac.roles.view'
      },
      {
        id: 'details',
        title: 'Role Details',
        component: RoleDetails,
        permission: 'rbac.roles.view'
      },
      {
        id: 'create',
        title: 'Create Role',
        component: RoleCreateEdit,
        permission: 'rbac.roles.create'
      },
      {
        id: 'tree',
        title: 'Role Hierarchy',
        component: RoleInheritance,
        permission: 'rbac.roles.view'
      },
      {
        id: 'matrix',
        title: 'Permission Matrix',
        component: RolePermissionMatrix,
        permission: 'rbac.roles.view'
      }
    ],
    quickActions: [
      {
        id: 'create-role',
        title: 'Create Role',
        icon: <Plus className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.roles.create'
      },
      {
        id: 'role-inheritance',
        title: 'Manage Inheritance',
        icon: <GitBranch className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.roles.manage'
      }
    ]
  },
  {
    id: 'permissions',
    title: 'Permissions',
    description: 'Permission definitions and assignments',
    icon: <Key className="h-5 w-5" />,
    color: 'bg-yellow-500',
    permission: 'rbac.permissions.view',
    views: [
      {
        id: 'management',
        title: 'Permission Management',
        component: PermissionManagement,
        permission: 'rbac.permissions.view'
      },
      {
        id: 'list',
        title: 'Permission List',
        component: PermissionList,
        permission: 'rbac.permissions.view'
      },
      {
        id: 'details',
        title: 'Permission Details',
        component: PermissionDetails,
        permission: 'rbac.permissions.view'
      },
      {
        id: 'create',
        title: 'Create Permission',
        component: PermissionCreateEdit,
        permission: 'rbac.permissions.create'
      },
      {
        id: 'matrix',
        title: 'Permission Matrix',
        component: PermissionMatrix,
        permission: 'rbac.permissions.view'
      }
    ],
    quickActions: [
      {
        id: 'create-permission',
        title: 'Create Permission',
        icon: <Plus className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.permissions.create'
      },
      {
        id: 'permission-matrix',
        title: 'View Matrix',
        icon: <Grid className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.permissions.view'
      }
    ]
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Resource hierarchy and access control',
    icon: <Database className="h-5 w-5" />,
    color: 'bg-indigo-500',
    permission: 'rbac.resources.view',
    views: [
      {
        id: 'management',
        title: 'Resource Management',
        component: ResourceManagement,
        permission: 'rbac.resources.view'
      },
      {
        id: 'tree',
        title: 'Resource Tree',
        component: ResourceTree,
        permission: 'rbac.resources.view'
      },
      {
        id: 'details',
        title: 'Resource Details',
        component: ResourceDetails,
        permission: 'rbac.resources.view'
      },
      {
        id: 'create',
        title: 'Create Resource',
        component: ResourceCreateEdit,
        permission: 'rbac.resources.create'
      },
      {
        id: 'assign',
        title: 'Role Assignment',
        component: ResourceRoleAssignment,
        permission: 'rbac.resources.assign_roles'
      }
    ],
    quickActions: [
      {
        id: 'create-resource',
        title: 'Create Resource',
        icon: <Plus className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.resources.create'
      },
      {
        id: 'sync-datasources',
        title: 'Sync Data Sources',
        icon: <RefreshCw className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.resources.sync'
      }
    ]
  },
  {
    id: 'groups',
    title: 'Groups',
    description: 'Group management and membership',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-teal-500',
    permission: 'rbac.groups.view',
    views: [
      {
        id: 'management',
        title: 'Group Management',
        component: GroupManagement,
        permission: 'rbac.groups.view'
      },
      {
        id: 'list',
        title: 'Group List',
        component: GroupList,
        permission: 'rbac.groups.view'
      },
      {
        id: 'details',
        title: 'Group Details',
        component: GroupDetails,
        permission: 'rbac.groups.view'
      },
      {
        id: 'create',
        title: 'Create Group',
        component: GroupCreateEdit,
        permission: 'rbac.groups.create'
      },
      {
        id: 'management',
        title: 'Member Management',
        component: GroupMemberManagement,
        permission: 'rbac.groups.manage_members'
      }
    ],
    quickActions: [
      {
        id: 'create-group',
        title: 'Create Group',
        icon: <Plus className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.groups.create'
      },
      {
        id: 'bulk-membership',
        title: 'Bulk Membership',
        icon: <Users className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.groups.manage_members'
      }
    ]
  },
  {
    id: 'conditions',
    title: 'Conditions',
    description: 'ABAC condition templates and validation',
    icon: <Filter className="h-5 w-5" />,
    color: 'bg-orange-500',
    permission: 'rbac.conditions.view',
    views: [
      {
        id: 'management',
        title: 'Condition Management',
        component: ConditionManagement,
        permission: 'rbac.conditions.view'
      },
      {
        id: 'builder',
        title: 'Condition Builder',
        component: ConditionBuilder,
        permission: 'rbac.conditions.create'
      },
      {
        id: 'list',
        title: 'Template Library',
        component: ConditionTemplates,
        permission: 'rbac.conditions.view'
      },
      {
        id: 'validator',
        title: 'Condition Validator',
        component: ConditionValidator,
        permission: 'rbac.conditions.validate'
      }
    ],
    quickActions: [
      {
        id: 'create-condition',
        title: 'Create Condition',
        icon: <Plus className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.conditions.create'
      },
      {
        id: 'validate-conditions',
        title: 'Validate All',
        icon: <CheckCircle className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.conditions.validate'
      }
    ]
  },
  {
    id: 'access-requests',
    title: 'Access Requests',
    description: 'Access request workflow and reviews',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-red-500',
    permission: 'rbac.access_requests.view',
    views: [
      {
        id: 'management',
        title: 'Request Management',
        component: AccessRequestManagement,
        permission: 'rbac.access_requests.view'
      },
      {
        id: 'list',
        title: 'Request List',
        component: AccessRequestList,
        permission: 'rbac.access_requests.view'
      },
      {
        id: 'details',
        title: 'Request Details',
        component: AccessRequestDetails,
        permission: 'rbac.access_requests.view'
      },
      {
        id: 'create',
        title: 'Create Request',
        component: AccessRequestCreate,
        permission: 'rbac.access_requests.create'
      },
      {
        id: 'review',
        title: 'Review Interface',
        component: AccessReviewInterface,
        permission: 'rbac.access_requests.review'
      }
    ],
    quickActions: [
      {
        id: 'create-request',
        title: 'New Request',
        icon: <Plus className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.access_requests.create'
      },
      {
        id: 'review-pending',
        title: 'Review Pending',
        icon: <Eye className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.access_requests.review'
      }
    ]
  },
  {
    id: 'audit',
    title: 'Audit',
    description: 'Audit logs and compliance reporting',
    icon: <Activity className="h-5 w-5" />,
    color: 'bg-slate-500',
    permission: 'rbac.audit.view',
    views: [
      {
        id: 'dashboard',
        title: 'Audit Dashboard',
        component: AuditDashboard,
        permission: 'rbac.audit.view'
      },
      {
        id: 'list',
        title: 'Audit Logs',
        component: AuditLogViewer,
        permission: 'rbac.audit.view'
      },
      {
        id: 'export',
        title: 'Export Logs',
        component: AuditExport,
        permission: 'rbac.audit.export'
      }
    ],
    quickActions: [
      {
        id: 'export-logs',
        title: 'Export Logs',
        icon: <Download className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.audit.export'
      },
      {
        id: 'compliance-report',
        title: 'Compliance Report',
        icon: <FileText className="h-4 w-4" />,
        action: () => {},
        permission: 'rbac.audit.report'
      }
    ]
  }
];

// ============================================================================
// RBAC DASHBOARD COMPONENT
// ============================================================================

const RBACDashboard: React.FC = () => {
  const { user, checkPermission } = useCurrentUser();
  const { analytics, isLoading } = useRBACState();
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  const timeRanges = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  const renderAnalyticsCard = (
    title: string,
    value: number | string,
    change: number,
    icon: React.ReactNode,
    color: string
  ) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", color)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <ChevronDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          {Math.abs(change)}% from last period
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RBAC Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your RBAC system status and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderAnalyticsCard(
          "Total Users",
          analytics?.users.total || 0,
          analytics?.users.trend || 0,
          <Users className="h-4 w-4 text-white" />,
          "bg-blue-500"
        )}
        {renderAnalyticsCard(
          "Active Roles",
          analytics?.roles.total || 0,
          5.2,
          <Crown className="h-4 w-4 text-white" />,
          "bg-purple-500"
        )}
        {renderAnalyticsCard(
          "Permissions",
          analytics?.permissions.total || 0,
          2.1,
          <Key className="h-4 w-4 text-white" />,
          "bg-yellow-500"
        )}
        {renderAnalyticsCard(
          "Pending Requests",
          analytics?.accessRequests.pending || 0,
          -8.3,
          <FileText className="h-4 w-4 text-white" />,
          "bg-red-500"
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest RBAC actions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {analytics?.auditLogs.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{activity.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.user} • {activity.resource}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
            <CardDescription>System security overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compliance Score</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {analytics?.security.complianceScore || 0}%
                </Badge>
              </div>
              <Progress value={analytics?.security.complianceScore || 0} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics?.security.mfaEnabled || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">MFA Enabled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics?.security.sessionCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Sessions</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Most commonly assigned roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.roles.mostUsed?.map((role, index) => (
                <div key={role.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      index === 0 ? "bg-blue-500" :
                      index === 1 ? "bg-green-500" :
                      index === 2 ? "bg-yellow-500" : "bg-gray-400"
                    )} />
                    <span className="text-sm font-medium">{role.name}</span>
                  </div>
                  <Badge variant="secondary">{role.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common RBAC management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
                <UserPlus className="h-5 w-5" />
                <span className="text-xs">Add User</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
                <Crown className="h-5 w-5" />
                <span className="text-xs">Create Role</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
                <FileText className="h-5 w-5" />
                <span className="text-xs">Review Requests</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
                <Download className="h-5 w-5" />
                <span className="text-xs">Export Audit</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN RBAC SYSTEM SPA COMPONENT
// ============================================================================

export const RBACSystemSPA: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, checkPermission } = useCurrentUser();
  const { connected, isConnecting, connectionError } = useRBACWebSocket();
  const rbacState = useRBACState();
  
  // Component state
  const [state, setState] = useState<RBACSystemState>({
    activeModule: 'dashboard',
    activeView: 'dashboard',
    selectedItems: new Set(),
    isLoading: false,
    error: null,
    preferences: DEFAULT_PREFERENCES,
    notifications: [],
    workflows: [],
    analytics: null,
    searchQuery: '',
    globalFilters: {},
    breadcrumbs: [{ label: 'Dashboard', current: true }],
    lastActivity: new Date(),
    connectionStatus: connected ? 'connected' : isConnecting ? 'connecting' : 'disconnected'
  });

  // Refs for performance optimization
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const analyticsIntervalRef = useRef<NodeJS.Timeout>();
  const notificationTimeoutRef = useRef<NodeJS.Timeout>();

  // Animation controls
  const mainContentAnimation = useAnimation();
  const sidebarAnimation = useAnimation();

  // React Query client for caching
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 2
      }
    }
  }), []);

  // Initialize component
  useEffect(() => {
    if (isAuthenticated && user) {
      // Load user preferences
      loadUserPreferences();
      
      // Start analytics refresh
      startAnalyticsRefresh();
      
      // Initialize notifications
      initializeNotifications();
      
      // Set default module based on preferences
      if (state.preferences.defaultModule !== 'dashboard') {
        handleModuleChange(state.preferences.defaultModule);
      }
    }

    return () => {
      // Cleanup intervals
      if (analyticsIntervalRef.current) {
        clearInterval(analyticsIntervalRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user]);

  // Connection status monitoring
  useEffect(() => {
    setState(prev => ({
      ...prev,
      connectionStatus: connected ? 'connected' : isConnecting ? 'connecting' : 'disconnected'
    }));

    if (connectionError) {
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Real-time updates are currently unavailable',
        timestamp: new Date()
      });
    }
  }, [connected, isConnecting, connectionError]);

  // Global search handling
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (state.searchQuery) {
        performGlobalSearch(state.searchQuery);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [state.searchQuery]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const loadUserPreferences = useCallback(async () => {
    try {
      // This would typically load from backend or localStorage
      const savedPreferences = localStorage.getItem('rbac-preferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setState(prev => ({
          ...prev,
          preferences: { ...DEFAULT_PREFERENCES, ...parsed }
        }));
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }, []);

  const saveUserPreferences = useCallback(async (preferences: Partial<RBACPreferences>) => {
    try {
      const newPreferences = { ...state.preferences, ...preferences };
      setState(prev => ({ ...prev, preferences: newPreferences }));
      localStorage.setItem('rbac-preferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save your preferences',
        timestamp: new Date()
      });
    }
  }, [state.preferences]);

  const startAnalyticsRefresh = useCallback(() => {
    const refreshInterval = state.preferences.dashboard.autoRefresh ? 
      state.preferences.dashboard.refreshInterval : 0;
    
    if (refreshInterval > 0) {
      analyticsIntervalRef.current = setInterval(() => {
        // Refresh analytics data
        rbacState.refreshAnalytics();
      }, refreshInterval);
    }
  }, [state.preferences.dashboard, rbacState]);

  const initializeNotifications = useCallback(() => {
    // Initialize notification system
    if (state.preferences.notifications.desktop && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [state.preferences.notifications]);

  const addNotification = useCallback((notification: Omit<RBACNotification, 'id' | 'read'>) => {
    const newNotification: RBACNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      read: false
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications.slice(0, 99)] // Keep max 100 notifications
    }));

    // Show desktop notification if enabled
    if (state.preferences.notifications.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }

    // Show toast notification
    const toastType = notification.type === 'error' ? 'error' : 
                     notification.type === 'success' ? 'success' : 'default';
    
    toast[toastType](notification.message, {
      duration: notification.type === 'error' ? 6000 : 4000
    });
  }, [state.preferences.notifications]);

  const performGlobalSearch = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // This would perform a global search across all RBAC entities
      // For now, just simulate the search
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update search results (would come from backend)
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Search failed'
      }));
    }
  }, []);

  const handleModuleChange = useCallback((module: RBACModule) => {
    const moduleConfig = RBAC_MODULES.find(m => m.id === module);
    if (!moduleConfig) return;

    // Check permissions
    if (moduleConfig.permission && !checkPermission(moduleConfig.permission)) {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: `You don't have permission to access ${moduleConfig.title}`,
        timestamp: new Date()
      });
      return;
    }

    setState(prev => ({
      ...prev,
      activeModule: module,
      activeView: moduleConfig.views[0]?.id || 'list',
      breadcrumbs: [
        { label: 'Dashboard', href: '/' },
        { label: moduleConfig.title, current: true }
      ]
    }));

    // Animate module transition
    mainContentAnimation.start({
      opacity: [0, 1],
      y: [20, 0],
      transition: { duration: 0.3 }
    });
  }, [checkPermission, addNotification, mainContentAnimation]);

  const handleViewChange = useCallback((view: RBACView) => {
    const moduleConfig = RBAC_MODULES.find(m => m.id === state.activeModule);
    const viewConfig = moduleConfig?.views.find(v => v.id === view);
    
    if (!viewConfig) return;

    // Check permissions
    if (viewConfig.permission && !checkPermission(viewConfig.permission)) {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: `You don't have permission to access ${viewConfig.title}`,
        timestamp: new Date()
      });
      return;
    }

    setState(prev => ({
      ...prev,
      activeView: view,
      breadcrumbs: [
        { label: 'Dashboard', href: '/' },
        { label: moduleConfig?.title || '', href: `/${state.activeModule}` },
        { label: viewConfig.title, current: true }
      ]
    }));
  }, [state.activeModule, checkPermission, addNotification]);

  const renderActiveComponent = useCallback(() => {
    const moduleConfig = RBAC_MODULES.find(m => m.id === state.activeModule);
    const viewConfig = moduleConfig?.views.find(v => v.id === state.activeView);
    
    if (!viewConfig?.component) {
      return <div className="p-6 text-center text-muted-foreground">Component not found</div>;
    }

    const Component = viewConfig.component;
    return <Component />;
  }, [state.activeModule, state.activeView]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notifications: [] }));
  }, []);

  // ============================================================================
  // LOADING AND ERROR STATES
  // ============================================================================

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-lg font-medium">Loading RBAC System...</div>
          <div className="text-sm text-muted-foreground">
            Initializing user permissions and system state
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the RBAC management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/signin'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RBACErrorBoundary>
          <div className="flex h-screen bg-background">
            {/* Sidebar Navigation */}
            <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-muted/10">
              <div className="flex h-16 items-center px-4 border-b">
                <Shield className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-lg font-semibold">RBAC System</span>
              </div>
              
              <nav className="flex-1 p-4 space-y-2">
                {RBAC_MODULES.map((module) => {
                  const hasPermission = !module.permission || checkPermission(module.permission);
                  
                  return (
                    <TooltipProvider key={module.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={state.activeModule === module.id ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start",
                              !hasPermission && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!hasPermission}
                            onClick={() => handleModuleChange(module.id)}
                          >
                            {module.icon}
                            <span className="ml-2">{module.title}</span>
                            {module.badge && (
                              <Badge 
                                variant={module.badge.variant} 
                                className="ml-auto"
                              >
                                {module.badge.content}
                              </Badge>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{module.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </nav>

              {/* Connection Status */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    state.connectionStatus === 'connected' ? "bg-green-500" :
                    state.connectionStatus === 'connecting' ? "bg-yellow-500" :
                    "bg-red-500"
                  )} />
                  <span className="text-muted-foreground">
                    {state.connectionStatus === 'connected' ? 'Connected' :
                     state.connectionStatus === 'connecting' ? 'Connecting...' :
                     'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Header */}
              <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4">
                  {/* Mobile menu and breadcrumbs */}
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="lg:hidden">
                      <Menu className="h-4 w-4" />
                    </Button>
                    
                    <RBACBreadcrumb 
                      items={state.breadcrumbs}
                      onNavigate={(href) => {
                        // Handle navigation
                      }}
                    />
                  </div>

                  {/* Search and actions */}
                  <div className="flex items-center space-x-4">
                    {/* Global Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search RBAC entities..."
                        className="pl-10 w-64"
                        value={state.searchQuery}
                        onChange={(e) => setState(prev => ({ 
                          ...prev, 
                          searchQuery: e.target.value 
                        }))}
                      />
                    </div>

                    {/* Notifications */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative">
                          <Bell className="h-4 w-4" />
                          {state.notifications.filter(n => !n.read).length > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                            >
                              {state.notifications.filter(n => !n.read).length}
                            </Badge>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Notifications</h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={clearAllNotifications}
                            >
                              Clear all
                            </Button>
                          </div>
                          
                          <ScrollArea className="h-64">
                            <div className="space-y-2">
                              {state.notifications.length === 0 ? (
                                <div className="text-center text-muted-foreground py-4">
                                  No notifications
                                </div>
                              ) : (
                                state.notifications.map((notification) => (
                                  <div
                                    key={notification.id}
                                    className={cn(
                                      "p-3 rounded-lg border cursor-pointer transition-colors",
                                      notification.read ? "bg-muted/50" : "bg-background",
                                      "hover:bg-muted"
                                    )}
                                    onClick={() => markNotificationAsRead(notification.id)}
                                  >
                                    <div className="flex items-start space-x-2">
                                      <div className={cn(
                                        "h-2 w-2 rounded-full mt-2",
                                        notification.type === 'error' ? "bg-red-500" :
                                        notification.type === 'success' ? "bg-green-500" :
                                        notification.type === 'warning' ? "bg-yellow-500" :
                                        "bg-blue-500"
                                      )} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                          {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {new Date(notification.timestamp).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.profilePictureUrl} alt={user?.email} />
                            <AvatarFallback>
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </header>

              {/* Module Navigation Tabs */}
              <div className="border-b bg-muted/20">
                <div className="px-4">
                  <Tabs value={state.activeView} onValueChange={handleViewChange}>
                    <TabsList className="h-12 bg-transparent">
                      {RBAC_MODULES.find(m => m.id === state.activeModule)?.views.map((view) => {
                        const hasPermission = !view.permission || checkPermission(view.permission);
                        
                        return (
                          <TabsTrigger
                            key={view.id}
                            value={view.id}
                            disabled={!hasPermission}
                            className="data-[state=active]:bg-background"
                          >
                            {view.title}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto">
                <motion.div
                  animate={mainContentAnimation}
                  className="h-full"
                >
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-64">
                      <LoadingSpinner />
                    </div>
                  }>
                    <PermissionGuard
                      permission={RBAC_MODULES.find(m => m.id === state.activeModule)?.permission}
                      fallback={
                        <div className="p-6 text-center">
                          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                          <p className="text-muted-foreground">
                            You don't have permission to access this module.
                          </p>
                        </div>
                      }
                    >
                      {renderActiveComponent()}
                    </PermissionGuard>
                  </Suspense>
                </motion.div>
              </main>
            </div>
          </div>

          {/* Loading Overlay */}
          <AnimatePresence>
            {state.isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <div className="mt-4 text-lg font-medium">Processing...</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))'
              }
            }}
          />

          {/* React Query DevTools (development only) */}
          {(typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </RBACErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const RBACSystemSPAWithProviders: React.FC = () => (
  <AuthProvider>
    <RBACStateProvider>
      <RBACSystemSPA />
    </RBACStateProvider>
  </AuthProvider>
);

export default RBACSystemSPAWithProviders;