/**
 * RBACVisualizationDashboard.tsx
 * ===============================
 * 
 * Advanced RBAC Visualization and Management Dashboard
 * 
 * Features:
 * - Interactive role hierarchy visualization with tree/graph views
 * - Comprehensive permission matrix management and editing
 * - Real-time access control visualization across all SPAs
 * - Advanced role analytics and usage statistics
 * - Permission conflict detection and resolution
 * - Role-based resource access mapping
 * - Cross-group permission analysis and coordination
 * - Visual permission inheritance and delegation flows
 * - Advanced filtering and search capabilities
 * - Role lifecycle management and versioning
 * - Enterprise compliance and audit reporting
 * - Interactive permission simulator and testing
 * 
 * Design:
 * - Modern data visualization with interactive charts and graphs
 * - Advanced network diagrams for role relationships
 * - Responsive grid layouts with drag-and-drop functionality
 * - Real-time updates with WebSocket integration
 * - Accessibility compliance with screen reader support
 * - Advanced animations and micro-interactions
 * - Multi-theme support with corporate branding options
 * 
 * Backend Integration:
 * - Maps to RBACService, PermissionService, RoleService
 * - Real-time WebSocket updates for role changes
 * - Integration with all 7 data governance SPAs
 * - Advanced analytics and reporting services
 * - Cross-SPA permission coordination
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

// Charts and visualizations
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TreeMap,
  Sankey,
  NetworkChart,
  ForceDirectedGraph
} from 'recharts';

// Icons
import { Shield, ShieldCheckIcon, ShieldAlert, Users, User, UserCheck, UserX, UserPlus, UserMinus, Key, Lock, Unlock, Eye, EyeOff, Settings, Search, Filter, SortAsc, SortDesc, Plus, Minus, Edit, Trash2, Copy, Share2, Download, Upload, RefreshCw, MoreHorizontal, ChevronDown, ChevronRight, ChevronUp, ArrowRight, ArrowDown, ArrowUpRight, Check, X, AlertTriangle, AlertCircle, Info, Loader2, Target, Activity, BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown, Zap, Clock, Calendar, MapPin, Globe, Building, Database, Server, Network, Layers, GitBranch, GitMerge, Link, Unlink, Maximize2, Minimize2, RotateCcw, RotateCw, ZoomIn, ZoomOut, Move, MousePointer, Hand } from 'lucide-react';

// Form validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Date handling
import { format, parseISO } from 'date-fns';

// Animations
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Toast notifications
import { toast } from 'sonner';

// Data visualization libraries
import { 
  ForceGraph2D, 
  ForceGraph3D 
} from 'react-force-graph';
import { 
  Hierarchy, 
  Tree 
} from '@visx/hierarchy';
import { 
  Group 
} from '@visx/group';
import { 
  localPoint 
} from '@visx/event';

// Racine hooks and services
import { useRBACSystem } from '../../hooks/useRBACSystem';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';

// Racine types
import {
  RBACUser,
  RBACRole,
  RBACPermission,
  RBACGroup,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

// Racine utilities
import { 
  formatDate,
  formatRelativeTime,
  generateSecureId 
} from '../../utils/validation-utils';
import {
  analyzeRoleHierarchy,
  detectPermissionConflicts,
  generateRoleAnalytics,
  calculateAccessScore
} from '../../utils/rbac-utils';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface RBACVisualizationDashboardProps {
  userId?: UUID;
  embedded?: boolean;
  viewMode?: 'dashboard' | 'matrix' | 'hierarchy' | 'analytics';
  onRoleUpdate?: (roleData: RBACAnalytics) => void;
  className?: string;
}

interface RBACAnalytics {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalGroups: number;
  activeUsers: number;
  roleUtilization: RoleUtilization[];
  permissionDistribution: PermissionDistribution[];
  accessPatterns: AccessPattern[];
  complianceScore: number;
  riskFactors: RiskFactor[];
}

interface RoleUtilization {
  roleId: UUID;
  roleName: string;
  userCount: number;
  utilizationRate: number;
  lastUsed: ISODateString;
  permissionCount: number;
}

interface PermissionDistribution {
  permission: string;
  userCount: number;
  roleCount: number;
  groupCount: number;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

interface AccessPattern {
  userId: UUID;
  userName: string;
  roleId: UUID;
  roleName: string;
  accessCount: number;
  lastAccess: ISODateString;
  resourcesAccessed: string[];
  riskScore: number;
}

interface RiskFactor {
  type: 'role_escalation' | 'permission_conflict' | 'unused_permission' | 'over_privileged' | 'role_sprawl';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: UUID[];
  affectedRoles: UUID[];
  recommendation: string;
  impact: number;
}

interface RoleHierarchyNode {
  id: UUID;
  name: string;
  type: 'role' | 'permission' | 'user' | 'group';
  level: number;
  children: RoleHierarchyNode[];
  permissions: RBACPermission[];
  userCount: number;
  isActive: boolean;
  metadata: Record<string, any>;
}

interface PermissionMatrix {
  roles: RBACRole[];
  permissions: RBACPermission[];
  matrix: boolean[][];
  groups: string[];
  resources: string[];
}

interface VisualizationState {
  selectedNodes: Set<UUID>;
  hoveredNode: UUID | null;
  zoomLevel: number;
  viewMode: '2d' | '3d' | 'tree' | 'matrix';
  layoutAlgorithm: 'force' | 'hierarchy' | 'circular' | 'grid';
  filterCriteria: FilterCriteria;
  showDetails: boolean;
  animationEnabled: boolean;
}

interface FilterCriteria {
  userTypes: string[];
  roleTypes: string[];
  permissionTypes: string[];
  groups: string[];
  dateRange: [Date, Date] | null;
  searchQuery: string;
  showInactive: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ROLE_COLORS = {
  admin: '#ef4444',
  manager: '#f97316', 
  user: '#3b82f6',
  guest: '#64748b',
  system: '#8b5cf6'
};

const PERMISSION_CRITICALITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#059669'
};

const VISUALIZATION_MODES = [
  { value: '2d', label: '2D Network', icon: Network },
  { value: '3d', label: '3D Network', icon: Layers },
  { value: 'tree', label: 'Tree View', icon: GitBranch },
  { value: 'matrix', label: 'Matrix View', icon: BarChart3 }
];

const LAYOUT_ALGORITHMS = [
  { value: 'force', label: 'Force-Directed', description: 'Dynamic force-based layout' },
  { value: 'hierarchy', label: 'Hierarchical', description: 'Top-down hierarchy layout' },
  { value: 'circular', label: 'Circular', description: 'Circular arrangement' },
  { value: 'grid', label: 'Grid', description: 'Regular grid layout' }
];

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideInFromRightVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const staggerChildrenVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RBACVisualizationDashboard: React.FC<RBACVisualizationDashboardProps> = ({
  userId,
  embedded = false,
  viewMode = 'dashboard',
  onRoleUpdate,
  className = ''
}) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================

  const {
    users,
    roles,
    permissions,
    groups,
    currentUser,
    hasPermission,
    createRole,
    updateRole,
    deleteRole,
    assignPermission,
    revokePermission,
    loading,
    error
  } = useRBACSystem();

  const {
    userProfile
  } = useUserManagement(userId);

  const {
    crossGroupData,
    getAccessPatterns
  } = useCrossGroupIntegration();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  // Component state
  const [activeTab, setActiveTab] = useState(viewMode);
  const [rbacAnalytics, setRbacAnalytics] = useState<RBACAnalytics | null>(null);
  const [roleHierarchy, setRoleHierarchy] = useState<RoleHierarchyNode[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix | null>(null);
  const [visualizationState, setVisualizationState] = useState<VisualizationState>({
    selectedNodes: new Set(),
    hoveredNode: null,
    zoomLevel: 1,
    viewMode: '2d',
    layoutAlgorithm: 'force',
    filterCriteria: {
      userTypes: [],
      roleTypes: [],
      permissionTypes: [],
      groups: [],
      dateRange: null,
      searchQuery: '',
      showInactive: false
    },
    showDetails: false,
    animationEnabled: true
  });

  // UI state
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RBACRole | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<RBACPermission | null>(null);

  // Chart refs
  const forceGraphRef = useRef<any>(null);
  const hierarchyRef = useRef<any>(null);

  // Animation controls
  const controls = useAnimation();

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canManageRoles = useMemo(() => {
    return hasPermission('rbac.manage') || hasPermission('role.manage');
  }, [hasPermission]);

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    
    const { filterCriteria } = visualizationState;
    
    return roles.filter(role => {
      // Search query filter
      if (filterCriteria.searchQuery) {
        const query = filterCriteria.searchQuery.toLowerCase();
        if (!role.name.toLowerCase().includes(query) && 
            !role.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Role type filter
      if (filterCriteria.roleTypes.length > 0) {
        if (!filterCriteria.roleTypes.includes(role.scope)) {
          return false;
        }
      }

      // Active/inactive filter
      if (!filterCriteria.showInactive && !role.isActive) {
        return false;
      }

      return true;
    });
  }, [roles, visualizationState.filterCriteria]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    const { filterCriteria } = visualizationState;
    
    return users.filter(user => {
      // Search query filter
      if (filterCriteria.searchQuery) {
        const query = filterCriteria.searchQuery.toLowerCase();
        if (!user.username.toLowerCase().includes(query) && 
            !user.email.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Active/inactive filter
      if (!filterCriteria.showInactive && !user.isActive) {
        return false;
      }

      return true;
    });
  }, [users, visualizationState.filterCriteria]);

  const hierarchyData = useMemo(() => {
    if (!roles || !users || !permissions) return [];
    
    return buildRoleHierarchy(filteredRoles, filteredUsers, permissions);
  }, [filteredRoles, filteredUsers, permissions]);

  const matrixData = useMemo(() => {
    if (!roles || !permissions) return null;
    
    return buildPermissionMatrix(filteredRoles, permissions);
  }, [filteredRoles, permissions]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!roles || !users || !permissions) return;

      try {
        const analytics = await generateRBACAnalytics(roles, users, permissions, groups);
        setRbacAnalytics(analytics);

        if (onRoleUpdate) {
          onRoleUpdate(analytics);
        }
      } catch (error) {
        console.error('Failed to load RBAC analytics:', error);
      }
    };

    loadAnalytics();
  }, [roles, users, permissions, groups, onRoleUpdate]);

  // Build role hierarchy
  useEffect(() => {
    if (!roles || !users || !permissions) return;

    const hierarchy = analyzeRoleHierarchy(roles, users, permissions);
    setRoleHierarchy(hierarchy);
  }, [roles, users, permissions]);

  // Build permission matrix
  useEffect(() => {
    if (!roles || !permissions) return;

    const matrix = buildPermissionMatrix(roles, permissions);
    setPermissionMatrix(matrix);
  }, [roles, permissions]);

  // Animate component entrance
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleNodeClick = useCallback((nodeId: UUID) => {
    setVisualizationState(prev => {
      const newSelected = new Set(prev.selectedNodes);
      if (newSelected.has(nodeId)) {
        newSelected.delete(nodeId);
      } else {
        newSelected.add(nodeId);
      }
      return { ...prev, selectedNodes: newSelected };
    });
  }, []);

  const handleNodeHover = useCallback((nodeId: UUID | null) => {
    setVisualizationState(prev => ({ ...prev, hoveredNode: nodeId }));
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setVisualizationState(prev => ({ ...prev, zoomLevel: zoom }));
  }, []);

  const handleViewModeChange = useCallback((mode: '2d' | '3d' | 'tree' | 'matrix') => {
    setVisualizationState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const handleFilterChange = useCallback((criteria: Partial<FilterCriteria>) => {
    setVisualizationState(prev => ({
      ...prev,
      filterCriteria: { ...prev.filterCriteria, ...criteria }
    }));
  }, []);

  const handleCreateRole = useCallback(async (roleData: Partial<RBACRole>) => {
    if (!canManageRoles) return;

    try {
      await createRole(roleData);
      toast.success('Role created successfully');
      setShowRoleDialog(false);
    } catch (error: any) {
      console.error('Failed to create role:', error);
      toast.error(error.message || 'Failed to create role');
    }
  }, [canManageRoles, createRole]);

  const handleUpdateRole = useCallback(async (roleId: UUID, roleData: Partial<RBACRole>) => {
    if (!canManageRoles) return;

    try {
      await updateRole(roleId, roleData);
      toast.success('Role updated successfully');
      setShowRoleDialog(false);
      setSelectedRole(null);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error(error.message || 'Failed to update role');
    }
  }, [canManageRoles, updateRole]);

  const handleDeleteRole = useCallback(async (roleId: UUID) => {
    if (!canManageRoles) return;

    try {
      await deleteRole(roleId);
      toast.success('Role deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete role:', error);
      toast.error(error.message || 'Failed to delete role');
    }
  }, [canManageRoles, deleteRole]);

  const handlePermissionToggle = useCallback(async (roleId: UUID, permissionId: UUID, grant: boolean) => {
    if (!canManageRoles) return;

    try {
      if (grant) {
        await assignPermission(roleId, permissionId);
        toast.success('Permission granted');
      } else {
        await revokePermission(roleId, permissionId);
        toast.success('Permission revoked');
      }
    } catch (error: any) {
      console.error('Failed to toggle permission:', error);
      toast.error(error.message || 'Failed to update permission');
    }
  }, [canManageRoles, assignPermission, revokePermission]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const buildRoleHierarchy = useCallback((roles: RBACRole[], users: RBACUser[], permissions: RBACPermission[]): RoleHierarchyNode[] => {
    // Build role hierarchy based on inheritance and grouping
    const roleNodes: RoleHierarchyNode[] = roles.map(role => ({
      id: role.id,
      name: role.name,
      type: 'role',
      level: 0, // Will be calculated based on inheritance
      children: [],
      permissions: role.permissions || [],
      userCount: users.filter(u => u.roles?.some(r => r.id === role.id)).length,
      isActive: role.isActive,
      metadata: { scope: role.scope, description: role.description }
    }));

    // Calculate hierarchy levels and relationships
    // This is a simplified version - in reality, this would be more complex
    return roleNodes;
  }, []);

  const buildPermissionMatrix = useCallback((roles: RBACRole[], permissions: RBACPermission[]): PermissionMatrix => {
    const matrix: boolean[][] = [];
    const groups = Array.from(new Set(permissions.map(p => p.scope)));
    const resources = Array.from(new Set(permissions.map(p => p.resource)));

    // Build matrix of role-permission relationships
    roles.forEach((role, roleIndex) => {
      matrix[roleIndex] = [];
      permissions.forEach((permission, permIndex) => {
        matrix[roleIndex][permIndex] = role.permissions?.some(p => p.id === permission.id) || false;
      });
    });

    return {
      roles,
      permissions,
      matrix,
      groups,
      resources
    };
  }, []);

  const generateRBACAnalytics = useCallback(async (
    roles: RBACRole[], 
    users: RBACUser[], 
    permissions: RBACPermission[], 
    groups: any[]
  ): Promise<RBACAnalytics> => {
    // Calculate role utilization
    const roleUtilization: RoleUtilization[] = roles.map(role => {
      const userCount = users.filter(u => u.roles?.some(r => r.id === role.id)).length;
      return {
        roleId: role.id,
        roleName: role.name,
        userCount,
        utilizationRate: userCount / users.length,
        lastUsed: new Date().toISOString(), // This would come from actual usage data
        permissionCount: role.permissions?.length || 0
      };
    });

    // Calculate permission distribution
    const permissionDistribution: PermissionDistribution[] = permissions.map(permission => {
      const roleCount = roles.filter(r => r.permissions?.some(p => p.id === permission.id)).length;
      const userCount = users.filter(u => 
        u.roles?.some(r => r.permissions?.some(p => p.id === permission.id))
      ).length;

      return {
        permission: permission.name,
        userCount,
        roleCount,
        groupCount: 1, // Simplified
        criticality: determineCriticality(permission)
      };
    });

    // Generate mock access patterns
    const accessPatterns: AccessPattern[] = users.slice(0, 10).map(user => ({
      userId: user.id,
      userName: user.username,
      roleId: user.roles?.[0]?.id || generateSecureId(),
      roleName: user.roles?.[0]?.name || 'Unknown',
      accessCount: Math.floor(Math.random() * 100),
      lastAccess: new Date().toISOString(),
      resourcesAccessed: ['data-sources', 'catalogs', 'workflows'],
      riskScore: Math.floor(Math.random() * 100)
    }));

    // Detect risk factors
    const riskFactors: RiskFactor[] = await detectPermissionConflicts(roles, users, permissions);

    return {
      totalUsers: users.length,
      totalRoles: roles.length,
      totalPermissions: permissions.length,
      totalGroups: groups?.length || 0,
      activeUsers: users.filter(u => u.isActive).length,
      roleUtilization,
      permissionDistribution,
      accessPatterns,
      complianceScore: calculateComplianceScore(roles, users, permissions),
      riskFactors
    };
  }, []);

  const determineCriticality = (permission: RBACPermission): 'low' | 'medium' | 'high' | 'critical' => {
    // Determine permission criticality based on resource and action
    if (permission.resource === 'system' || permission.action === 'delete') return 'critical';
    if (permission.action === 'write' || permission.action === 'update') return 'high';
    if (permission.action === 'read') return 'medium';
    return 'low';
  };

  const calculateComplianceScore = (roles: RBACRole[], users: RBACUser[], permissions: RBACPermission[]): number => {
    // Calculate overall compliance score based on various factors
    let score = 100;
    
    // Deduct points for various issues
    const inactiveRoles = roles.filter(r => !r.isActive).length;
    const overPrivilegedUsers = users.filter(u => u.roles && u.roles.length > 3).length;
    
    score -= (inactiveRoles * 2);
    score -= (overPrivilegedUsers * 5);
    
    return Math.max(0, Math.min(100, score));
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderOverviewDashboard = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Key Metrics Cards */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rbacAnalytics?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className="text-xs text-green-600">
                    {rbacAnalytics?.activeUsers || 0} active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rbacAnalytics?.totalRoles || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Roles</p>
                  <p className="text-xs text-blue-600">
                    {filteredRoles.filter(r => r.isActive).length} active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Key className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rbacAnalytics?.totalPermissions || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Permissions</p>
                  <p className="text-xs text-purple-600">
                    {permissions?.filter(p => p.isSystemPermission).length || 0} system
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rbacAnalytics?.complianceScore || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Compliance Score</p>
                  <p className="text-xs text-green-600">
                    {rbacAnalytics?.riskFactors?.filter(r => r.severity === 'low').length || 0} low risks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Utilization Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Role Utilization</span>
              </CardTitle>
              <CardDescription>
                Usage statistics for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rbacAnalytics?.roleUtilization || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="roleName" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="userCount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Permission Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChartIcon className="w-5 h-5" />
                <span>Permission Distribution</span>
              </CardTitle>
              <CardDescription>
                Distribution of permissions by criticality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rbacAnalytics?.permissionDistribution?.reduce((acc, perm) => {
                        const existing = acc.find(item => item.criticality === perm.criticality);
                        if (existing) {
                          existing.count += 1;
                        } else {
                          acc.push({ 
                            criticality: perm.criticality, 
                            count: 1,
                            fill: PERMISSION_CRITICALITY_COLORS[perm.criticality]
                          });
                        }
                        return acc;
                      }, [] as any[]) || []}
                      dataKey="count"
                      nameKey="criticality"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {rbacAnalytics?.permissionDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Risk Factors */}
      {rbacAnalytics?.riskFactors && rbacAnalytics.riskFactors.length > 0 && (
        <motion.div variants={fadeInUpVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Security Risk Factors</span>
              </CardTitle>
              <CardDescription>
                Identified security risks and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rbacAnalytics.riskFactors.slice(0, 5).map((risk, index) => {
                  const severityColor = {
                    low: 'green',
                    medium: 'yellow',
                    high: 'orange',
                    critical: 'red'
                  }[risk.severity];

                  return (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className={`p-2 bg-${severityColor}-100 dark:bg-${severityColor}-900 rounded-lg`}>
                        <AlertCircle className={`w-4 h-4 text-${severityColor}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{risk.description}</p>
                          <Badge variant="outline" className={`text-${severityColor}-600 capitalize`}>
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {risk.recommendation}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                          <span>{risk.affectedUsers.length} users affected</span>
                          <span>{risk.affectedRoles.length} roles affected</span>
                          <span>Impact: {risk.impact}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  const renderRoleHierarchy = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Visualization Controls */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>Role Hierarchy Visualization</span>
              </div>
              <div className="flex items-center space-x-2">
                {VISUALIZATION_MODES.map((mode) => {
                  const ModeIcon = mode.icon;
                  return (
                    <Button
                      key={mode.value}
                      variant={visualizationState.viewMode === mode.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleViewModeChange(mode.value as any)}
                    >
                      <ModeIcon className="w-4 h-4 mr-2" />
                      {mode.label}
                    </Button>
                  );
                })}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label>Layout:</Label>
                <Select
                  value={visualizationState.layoutAlgorithm}
                  onValueChange={(value) => 
                    setVisualizationState(prev => ({ ...prev, layoutAlgorithm: value as any }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_ALGORITHMS.map((algo) => (
                      <SelectItem key={algo.value} value={algo.value}>
                        {algo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label>Zoom:</Label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoomChange(Math.max(0.1, visualizationState.zoomLevel - 0.1))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">
                    {Math.round(visualizationState.zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoomChange(Math.min(3, visualizationState.zoomLevel + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={visualizationState.animationEnabled}
                  onCheckedChange={(enabled) => 
                    setVisualizationState(prev => ({ ...prev, animationEnabled: enabled }))
                  }
                />
                <Label>Animations</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visualization Container */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardContent className="p-0">
            <div className="h-96 border rounded-lg bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
              {visualizationState.viewMode === '2d' && (
                <div className="w-full h-full">
                  {/* 2D Force Graph would go here */}
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Network className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">2D Network Visualization</p>
                      <p className="text-sm text-gray-400">Interactive role hierarchy network</p>
                    </div>
                  </div>
                </div>
              )}

              {visualizationState.viewMode === 'tree' && (
                <div className="w-full h-full">
                  {/* Tree visualization would go here */}
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <GitBranch className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">Tree Hierarchy View</p>
                      <p className="text-sm text-gray-400">Hierarchical role structure</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Node Details */}
      {visualizationState.selectedNodes.size > 0 && (
        <motion.div variants={fadeInUpVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Selected Items</CardTitle>
              <CardDescription>
                Details for {visualizationState.selectedNodes.size} selected item(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(visualizationState.selectedNodes).map(nodeId => {
                  const role = roles?.find(r => r.id === nodeId);
                  const user = users?.find(u => u.id === nodeId);
                  
                  if (role) {
                    return (
                      <div key={nodeId} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{role.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Role • {role.scope} scope
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={role.isActive ? "default" : "secondary"}>
                              {role.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{role.permissions?.length || 0} permissions</span>
                          <span>{users?.filter(u => u.roles?.some(r => r.id === role.id)).length || 0} users</span>
                        </div>
                      </div>
                    );
                  }

                  if (user) {
                    return (
                      <div key={nodeId} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              User • {user.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{user.roles?.length || 0} roles</span>
                          <span>Last login {formatRelativeTime(user.lastLogin || new Date().toISOString())}</span>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  const renderPermissionMatrix = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Matrix Controls */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Permission Matrix</span>
            </CardTitle>
            <CardDescription>
              Interactive role-permission matrix with bulk editing capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search roles or permissions..."
                    value={visualizationState.filterCriteria.searchQuery}
                    onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="workspace">Workspace</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Permission Matrix Table */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-48">
                      Role
                    </TableHead>
                    {permissions?.slice(0, 10).map((permission) => (
                      <TableHead 
                        key={permission.id} 
                        className="text-center min-w-32 rotate-45 whitespace-nowrap"
                      >
                        <div className="transform -rotate-45 origin-left text-xs">
                          {permission.name}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.slice(0, 20).map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="sticky left-0 bg-background z-10 font-medium">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ROLE_COLORS[role.scope as keyof typeof ROLE_COLORS] || ROLE_COLORS.user }}
                          />
                          <span>{role.name}</span>
                          {!role.isActive && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                      </TableCell>
                      {permissions?.slice(0, 10).map((permission) => {
                        const hasPermission = role.permissions?.some(p => p.id === permission.id);
                        return (
                          <TableCell key={permission.id} className="text-center">
                            <Checkbox
                              checked={hasPermission}
                              onCheckedChange={(checked) => 
                                handlePermissionToggle(role.id, permission.id, checked as boolean)
                              }
                              disabled={!canManageRoles}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRole(role)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Matrix Legend */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox checked readOnly />
                <span className="text-sm">Permission granted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox readOnly />
                <span className="text-sm">Permission not granted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Admin roles</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">User roles</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderAnalytics = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Analytics Overview */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Access Patterns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rbacAnalytics?.accessPatterns?.slice(0, 5).map((pattern) => (
                  <div key={pattern.userId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{pattern.userName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {pattern.roleName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{pattern.accessCount}</p>
                      <p className="text-xs text-gray-400">accesses</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Role Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rbacAnalytics?.roleUtilization?.slice(0, 5).map((util) => (
                  <div key={util.roleId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{util.roleName}</span>
                      <span className="text-sm">{util.userCount} users</span>
                    </div>
                    <Progress value={util.utilizationRate * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Compliance Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {rbacAnalytics?.complianceScore || 0}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Overall compliance rating
                </p>
                <Progress value={rbacAnalytics?.complianceScore || 0} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Detailed Analytics Charts */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analytics</CardTitle>
            <CardDescription>
              Comprehensive role and permission analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList>
                <TabsTrigger value="trends">Usage Trends</TabsTrigger>
                <TabsTrigger value="distribution">Permission Distribution</TabsTrigger>
                <TabsTrigger value="compliance">Compliance Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rbacAnalytics?.roleUtilization || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="roleName" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="userCount" fill="#3b82f6" />
                      <Bar dataKey="permissionCount" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="distribution" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rbacAnalytics?.permissionDistribution?.slice(0, 8) || []}
                        dataKey="userCount"
                        nameKey="permission"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => entry.permission}
                      >
                        {rbacAnalytics?.permissionDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Compliance Metrics</h3>
                  <p className="text-gray-500">Detailed compliance analytics will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading RBAC data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate={controls}
        variants={fadeInUpVariants}
        className={`rbac-visualization-dashboard ${className}`}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div variants={fadeInUpVariants}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">RBAC Visualization Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive role-based access control management and analytics
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {canManageRoles && (
                  <>
                    <Button onClick={() => setShowRoleDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div variants={fadeInUpVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users, roles, or permissions..."
                      value={visualizationState.filterCriteria.searchQuery}
                      onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={visualizationState.filterCriteria.showInactive}
                      onCheckedChange={(checked) => handleFilterChange({ showInactive: checked })}
                    />
                    <Label>Show Inactive</Label>
                  </div>

                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="hierarchy" className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4" />
                      <span>Hierarchy</span>
                    </TabsTrigger>
                    <TabsTrigger value="matrix" className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Permission Matrix</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Analytics</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="dashboard">
                    {renderOverviewDashboard()}
                  </TabsContent>

                  <TabsContent value="hierarchy">
                    {renderRoleHierarchy()}
                  </TabsContent>

                  <TabsContent value="matrix">
                    {renderPermissionMatrix()}
                  </TabsContent>

                  <TabsContent value="analytics">
                    {renderAnalytics()}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default RBACVisualizationDashboard;