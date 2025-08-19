'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  Lock,
  Unlock,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Crown,
  Database,
  Server,
  FileText,
  Tag,
  Layers,
  Network,
  Grid,
  List,
  Calendar,
  Clock,
  User,
  Zap,
  Target,
  Globe,
  Cpu,
  HardDrive,
  Folder,
  File,
  Monitor,
  Smartphone,
  Wifi,
  Key,
  ShieldCheck,
  Activity,
  Workflow,
  GitBranch,
  Share2,
  MessageSquare,
  Bell
} from 'lucide-react';

import { usePermissions } from '../../hooks/usePermissions';
import { useRoles } from '../../hooks/useRoles';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import {
  Permission,
  PermissionCreate,
  PermissionUpdate,
  PermissionWithRoles,
  PermissionStats,
  PermissionFilters,
  PermissionBulkAction,
  PermissionGroup,
  PermissionTemplate,
  PermissionValidation,
  PermissionConflict,
  PermissionUsage,
  PermissionScope,
  EffectivePermission
} from '../../types/permission.types';
import { Role } from '../../types/role.types';
import { cn } from '@/lib/utils';
import PermissionList from './PermissionList';
import PermissionDetails from './PermissionDetails';
import PermissionCreateEdit from './PermissionCreateEdit';

interface PermissionManagementProps {
  className?: string;
  initialView?: 'list' | 'grid' | 'chart';
  onPermissionSelect?: (permission: Permission) => void;
  readOnly?: boolean;
}

interface ViewState {
  activeTab: 'permissions' | 'templates' | 'analytics' | 'audit';
  viewMode: 'list' | 'grid' | 'chart';
  layout: 'compact' | 'comfortable' | 'spacious';
  groupBy: 'none' | 'resource' | 'action' | 'category' | 'usage';
  sortBy: 'name' | 'created' | 'usage' | 'roles' | 'priority';
  sortOrder: 'asc' | 'desc';
  showFilters: boolean;
  showSidebar: boolean;
}

interface FilterState {
  search: string;
  resources: string[];
  actions: string[];
  categories: string[];
  hasConditions: boolean | null;
  isEffective: boolean | null;
  assignmentCount: [number, number] | null;
  createdAfter: string;
  createdBefore: string;
  lastUsedAfter: string;
  lastUsedBefore: string;
  tags: string[];
  priority: string[];
  status: ('active' | 'inactive' | 'deprecated')[];
}

interface SelectionState {
  selectedPermissions: Set<number>;
  bulkAction: PermissionBulkAction | null;
  clipboard: Permission[];
}

interface DialogState {
  createEditOpen: boolean;
  detailsOpen: boolean;
  templatesOpen: boolean;
  bulkActionOpen: boolean;
  conflictResolutionOpen: boolean;
  importExportOpen: boolean;
  validationOpen: boolean;
  currentPermission: Permission | null;
  mode: 'create' | 'edit' | 'duplicate' | 'view';
}

const permissionCategories = [
  { value: 'data', label: 'Data Access', icon: Database, color: 'bg-blue-500' },
  { value: 'system', label: 'System Admin', icon: Settings, color: 'bg-red-500' },
  { value: 'workflow', label: 'Workflow', icon: Workflow, color: 'bg-green-500' },
  { value: 'security', label: 'Security', icon: Shield, color: 'bg-yellow-500' },
  { value: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-purple-500' },
  { value: 'collaboration', label: 'Collaboration', icon: Users, color: 'bg-orange-500' },
  { value: 'governance', label: 'Governance', icon: Crown, color: 'bg-indigo-500' },
  { value: 'integration', label: 'Integration', icon: Network, color: 'bg-teal-500' }
];

const actionTypes = [
  { value: 'create', label: 'Create', icon: Plus, color: 'text-green-600' },
  { value: 'read', label: 'Read', icon: Eye, color: 'text-blue-600' },
  { value: 'update', label: 'Update', icon: Edit, color: 'text-yellow-600' },
  { value: 'delete', label: 'Delete', icon: Trash2, color: 'text-red-600' },
  { value: 'execute', label: 'Execute', icon: Zap, color: 'text-purple-600' },
  { value: 'approve', label: 'Approve', icon: CheckCircle, color: 'text-green-600' },
  { value: 'manage', label: 'Manage', icon: Settings, color: 'text-gray-600' },
  { value: 'export', label: 'Export', icon: Download, color: 'text-orange-600' }
];

const resourceTypes = [
  { value: 'datasource', label: 'Data Sources', icon: Database, count: 0 },
  { value: 'catalog', label: 'Data Catalog', icon: Folder, count: 0 },
  { value: 'scan', label: 'Scan Operations', icon: Search, count: 0 },
  { value: 'compliance', label: 'Compliance', icon: Shield, count: 0 },
  { value: 'classification', label: 'Classifications', icon: Tag, count: 0 },
  { value: 'workflow', label: 'Workflows', icon: Workflow, count: 0 },
  { value: 'user', label: 'User Management', icon: Users, count: 0 },
  { value: 'role', label: 'Role Management', icon: Crown, count: 0 },
  { value: 'system', label: 'System', icon: Server, count: 0 },
  { value: 'analytics', label: 'Analytics', icon: BarChart3, count: 0 }
];

export default function PermissionManagement({
  className,
  initialView = 'list',
  onPermissionSelect,
  readOnly = false
}: PermissionManagementProps) {
  const { user, hasPermission } = useAuth();
  const {
    permissions,
    permissionStats,
    permissionTemplates,
    permissionConflicts,
    isLoading,
    error,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    bulkUpdatePermissions,
    validatePermission,
    resolveConflicts,
    getPermissionUsage,
    getPermissionsByGroup,
    exportPermissions,
    importPermissions,
    getPermissionTemplates,
    applyTemplate,
    analyzePermissionUsage,
    getPermissionDependencies
  } = usePermissions();
  
  const { roles } = useRoles();
  const { toast } = useToast();

  // State management
  const [viewState, setViewState] = useState<ViewState>({
    activeTab: 'permissions',
    viewMode: initialView,
    layout: 'comfortable',
    groupBy: 'resource',
    sortBy: 'name',
    sortOrder: 'asc',
    showFilters: true,
    showSidebar: true
  });

  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    resources: [],
    actions: [],
    categories: [],
    hasConditions: null,
    isEffective: null,
    assignmentCount: null,
    createdAfter: '',
    createdBefore: '',
    lastUsedAfter: '',
    lastUsedBefore: '',
    tags: [],
    priority: [],
    status: ['active']
  });

  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedPermissions: new Set(),
    bulkAction: null,
    clipboard: []
  });

  const [dialogState, setDialogState] = useState<DialogState>({
    createEditOpen: false,
    detailsOpen: false,
    templatesOpen: false,
    bulkActionOpen: false,
    conflictResolutionOpen: false,
    importExportOpen: false,
    validationOpen: false,
    currentPermission: null,
    mode: 'create'
  });

  // Derived state
  const [permissionUsage, setPermissionUsage] = useState<Record<number, PermissionUsage>>({});
  const [permissionValidations, setPermissionValidations] = useState<Record<number, PermissionValidation>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['data', 'system']));

  // Initialize data
  useEffect(() => {
    loadPermissionData();
  }, []);

  const loadPermissionData = async () => {
    try {
      await Promise.all([
        fetchPermissions(),
        loadPermissionUsage(),
        loadPermissionTemplates()
      ]);
    } catch (error) {
      console.error('Failed to load permission data:', error);
      toast({
        title: 'Load Failed',
        description: 'Failed to load permission data. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  const loadPermissionUsage = async () => {
    try {
      const usageData: Record<number, PermissionUsage> = {};
      
      for (const permission of permissions) {
        const usage = await getPermissionUsage(permission.id);
        usageData[permission.id] = usage;
      }
      
      setPermissionUsage(usageData);
    } catch (error) {
      console.error('Failed to load permission usage:', error);
    }
  };

  const loadPermissionTemplates = async () => {
    try {
      await getPermissionTemplates();
    } catch (error) {
      console.error('Failed to load permission templates:', error);
    }
  };

  // Filter and sort permissions
  const filteredPermissions = useMemo(() => {
    let filtered = permissions.filter(permission => {
      // Search filter
      if (filterState.search && !permission.action.toLowerCase().includes(filterState.search.toLowerCase()) &&
          !permission.resource.toLowerCase().includes(filterState.search.toLowerCase())) {
        return false;
      }

      // Resource filter
      if (filterState.resources.length > 0) {
        const resourceType = permission.resource.split('.')[0];
        if (!filterState.resources.includes(resourceType)) {
          return false;
        }
      }

      // Action filter
      if (filterState.actions.length > 0 && !filterState.actions.includes(permission.action)) {
        return false;
      }

      // Conditions filter
      if (filterState.hasConditions !== null) {
        const hasConditions = !!permission.conditions;
        if (hasConditions !== filterState.hasConditions) {
          return false;
        }
      }

      // Status filter (would need to be added to permission model)
      if (filterState.status.length > 0) {
        // This would check against permission status if implemented
        // For now, we'll assume all permissions are active
      }

      return true;
    });

    // Sort permissions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (viewState.sortBy) {
        case 'name':
          aValue = a.action.toLowerCase();
          bValue = b.action.toLowerCase();
          break;
        case 'usage':
          aValue = permissionUsage[a.id]?.usage_frequency || 0;
          bValue = permissionUsage[b.id]?.usage_frequency || 0;
          break;
        case 'roles':
          aValue = permissionUsage[a.id]?.role_count || 0;
          bValue = permissionUsage[b.id]?.role_count || 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) return viewState.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return viewState.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [permissions, filterState, viewState.sortBy, viewState.sortOrder, permissionUsage]);

  // Group permissions
  const groupedPermissions = useMemo(() => {
    if (viewState.groupBy === 'none') {
      return { 'All Permissions': filteredPermissions };
    }

    return filteredPermissions.reduce((groups, permission) => {
      let groupKey: string;

      switch (viewState.groupBy) {
        case 'resource':
          groupKey = permission.resource.split('.')[0] || 'Other';
          break;
        case 'action':
          groupKey = permission.action;
          break;
        case 'category':
          // This would need to be added to the permission model
          groupKey = 'General';
          break;
        case 'usage':
          const usage = permissionUsage[permission.id];
          if (!usage || usage.usage_frequency === 0) {
            groupKey = 'Unused';
          } else if (usage.usage_frequency < 10) {
            groupKey = 'Low Usage';
          } else if (usage.usage_frequency < 50) {
            groupKey = 'Medium Usage';
          } else {
            groupKey = 'High Usage';
          }
          break;
        default:
          groupKey = 'Other';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  }, [filteredPermissions, viewState.groupBy, permissionUsage]);

  // Handle permission selection
  const handlePermissionSelect = useCallback((permissionId: number, selected: boolean) => {
    setSelectionState(prev => {
      const newSelected = new Set(prev.selectedPermissions);
      if (selected) {
        newSelected.add(permissionId);
      } else {
        newSelected.delete(permissionId);
      }
      return { ...prev, selectedPermissions: newSelected };
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectionState(prev => ({
      ...prev,
      selectedPermissions: selected ? new Set(filteredPermissions.map(p => p.id)) : new Set()
    }));
  }, [filteredPermissions]);

  // Handle permission operations
  const handleCreatePermission = useCallback(() => {
    if (!hasPermission('rbac.permission.create')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to create permissions.',
        variant: 'destructive'
      });
      return;
    }

    setDialogState(prev => ({
      ...prev,
      createEditOpen: true,
      mode: 'create',
      currentPermission: null
    }));
  }, [hasPermission, toast]);

  const handleEditPermission = useCallback((permission: Permission) => {
    if (!hasPermission('rbac.permission.edit')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to edit permissions.',
        variant: 'destructive'
      });
      return;
    }

    setDialogState(prev => ({
      ...prev,
      createEditOpen: true,
      mode: 'edit',
      currentPermission: permission
    }));
  }, [hasPermission, toast]);

  const handleDuplicatePermission = useCallback((permission: Permission) => {
    if (!hasPermission('rbac.permission.create')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to create permissions.',
        variant: 'destructive'
      });
      return;
    }

    setDialogState(prev => ({
      ...prev,
      createEditOpen: true,
      mode: 'duplicate',
      currentPermission: permission
    }));
  }, [hasPermission, toast]);

  const handleViewPermission = useCallback((permission: Permission) => {
    setDialogState(prev => ({
      ...prev,
      detailsOpen: true,
      currentPermission: permission
    }));
    onPermissionSelect?.(permission);
  }, [onPermissionSelect]);

  const handleDeletePermission = useCallback(async (permission: Permission) => {
    if (!hasPermission('rbac.permission.delete')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to delete permissions.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await deletePermission(permission.id);
      toast({
        title: 'Permission Deleted',
        description: `Permission "${permission.action}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete permission.',
        variant: 'destructive'
      });
    }
  }, [hasPermission, deletePermission, toast]);

  // Handle bulk operations
  const handleBulkDelete = useCallback(async () => {
    if (!hasPermission('rbac.permission.delete')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to delete permissions.',
        variant: 'destructive'
      });
      return;
    }

    if (selectionState.selectedPermissions.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select permissions to delete.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const bulkAction: PermissionBulkAction = {
        action: 'delete',
        permission_ids: Array.from(selectionState.selectedPermissions)
      };

      await bulkUpdatePermissions(bulkAction);
      
      setSelectionState(prev => ({ ...prev, selectedPermissions: new Set() }));
      
      toast({
        title: 'Bulk Delete Complete',
        description: `Successfully deleted ${selectionState.selectedPermissions.size} permissions.`,
      });
    } catch (error) {
      toast({
        title: 'Bulk Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete permissions.',
        variant: 'destructive'
      });
    }
  }, [hasPermission, selectionState.selectedPermissions, bulkUpdatePermissions, toast]);

  const handleBulkAssignToRoles = useCallback(async (roleIds: number[]) => {
    if (!hasPermission('rbac.permission.assign')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to assign permissions.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const bulkAction: PermissionBulkAction = {
        action: 'assign_to_roles',
        permission_ids: Array.from(selectionState.selectedPermissions),
        parameters: { role_ids: roleIds }
      };

      await bulkUpdatePermissions(bulkAction);
      
      toast({
        title: 'Bulk Assignment Complete',
        description: `Successfully assigned ${selectionState.selectedPermissions.size} permissions to ${roleIds.length} roles.`,
      });
    } catch (error) {
      toast({
        title: 'Bulk Assignment Failed',
        description: error instanceof Error ? error.message : 'Failed to assign permissions.',
        variant: 'destructive'
      });
    }
  }, [hasPermission, selectionState.selectedPermissions, bulkUpdatePermissions, toast]);

  // Handle export/import
  const handleExportPermissions = useCallback(async () => {
    try {
      const exportData = await exportPermissions(Array.from(selectionState.selectedPermissions));
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `permissions-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: `Exported ${selectionState.selectedPermissions.size || permissions.length} permissions.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export permissions.',
        variant: 'destructive'
      });
    }
  }, [selectionState.selectedPermissions, permissions.length, exportPermissions, toast]);

  // Render permission card for grid view
  const renderPermissionCard = useCallback((permission: Permission) => {
    const usage = permissionUsage[permission.id];
    const validation = permissionValidations[permission.id];
    const isSelected = selectionState.selectedPermissions.has(permission.id);

    return (
      <motion.div
        key={permission.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "group relative border rounded-lg p-4 cursor-pointer transition-all duration-200",
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        )}
        onClick={() => handleViewPermission(permission)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handlePermissionSelect(permission.id, checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <h3 className="font-medium text-sm truncate">{permission.action}</h3>
              </div>
              
              {permission.conditions && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lock className="h-3 w-3 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Has conditions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-3 truncate">
              {permission.resource}
            </p>

            {usage && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-xs font-medium">{usage.role_count}</p>
                  <p className="text-xs text-muted-foreground">Roles</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{usage.user_count}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{usage.usage_frequency}</p>
                  <p className="text-xs text-muted-foreground">Usage</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {permission.resource.split('.')[0]}
              </Badge>
              
              {usage?.usage_trend && (
                <Badge variant={usage.usage_trend === 'increasing' ? 'default' : 'secondary'} className="text-xs">
                  {usage.usage_trend === 'increasing' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : usage.usage_trend === 'decreasing' ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowRight className="h-3 w-3 mr-1" />
                  )}
                  {usage.usage_trend}
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewPermission(permission)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {hasPermission('rbac.permission.edit') && (
                <DropdownMenuItem onClick={() => handleEditPermission(permission)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {hasPermission('rbac.permission.create') && (
                <DropdownMenuItem onClick={() => handleDuplicatePermission(permission)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {hasPermission('rbac.permission.delete') && (
                <DropdownMenuItem
                  onClick={() => handleDeletePermission(permission)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {validation && !validation.is_valid && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <p className="text-xs text-red-600">Validation issues</p>
            </div>
          </div>
        )}
      </motion.div>
    );
  }, [
    permissionUsage,
    permissionValidations,
    selectionState.selectedPermissions,
    handleViewPermission,
    handlePermissionSelect,
    handleEditPermission,
    handleDuplicatePermission,
    handleDeletePermission,
    hasPermission
  ]);

  // Render analytics view
  const renderAnalyticsView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Permissions</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Assigned</p>
                <p className="text-2xl font-bold">
                  {Object.values(permissionUsage).filter(u => u.role_count > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">With Conditions</p>
                <p className="text-2xl font-bold">
                  {permissions.filter(p => p.conditions).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Conflicts</p>
                <p className="text-2xl font-bold">{permissionConflicts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Permission Distribution by Resource Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {resourceTypes.map(resourceType => {
              const count = permissions.filter(p => 
                p.resource.startsWith(resourceType.value)
              ).length;
              
              return (
                <div key={resourceType.value} className="text-center">
                  <div className="flex flex-col items-center gap-2">
                    <resourceType.icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{resourceType.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(permissionUsage).filter(u => u.usage_trend === 'increasing').length}
                </p>
                <p className="text-sm text-muted-foreground">Increasing Usage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {Object.values(permissionUsage).filter(u => u.usage_trend === 'stable').length}
                </p>
                <p className="text-sm text-muted-foreground">Stable Usage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(permissionUsage).filter(u => u.usage_trend === 'decreasing').length}
                </p>
                <p className="text-sm text-muted-foreground">Decreasing Usage</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-semibold">Permission Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage system permissions, access controls, and authorization policies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPermissions}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {hasPermission('rbac.permission.create') && !readOnly && (
            <Button
              size="sm"
              onClick={handleCreatePermission}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Permission
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={viewState.activeTab} onValueChange={(value) => setViewState(prev => ({ ...prev, activeTab: value as any }))}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit
          </TabsTrigger>
        </TabsList>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={filterState.search}
                      onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>

                  <Select
                    value={viewState.groupBy}
                    onValueChange={(value) => setViewState(prev => ({ ...prev, groupBy: value as any }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Grouping</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="usage">Usage</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={`${viewState.sortBy}-${viewState.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split('-');
                      setViewState(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Name Z-A</SelectItem>
                      <SelectItem value="usage-desc">Usage High-Low</SelectItem>
                      <SelectItem value="usage-asc">Usage Low-High</SelectItem>
                      <SelectItem value="roles-desc">Roles High-Low</SelectItem>
                      <SelectItem value="roles-asc">Roles Low-High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Grid className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuCheckboxItem
                        checked={viewState.viewMode === 'list'}
                        onCheckedChange={() => setViewState(prev => ({ ...prev, viewMode: 'list' }))}
                      >
                        <List className="h-4 w-4 mr-2" />
                        List View
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={viewState.viewMode === 'grid'}
                        onCheckedChange={() => setViewState(prev => ({ ...prev, viewMode: 'grid' }))}
                      >
                        <Grid className="h-4 w-4 mr-2" />
                        Grid View
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPermissionData}
                    disabled={isLoading}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          <AnimatePresence>
            {viewState.showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Advanced Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Resource Types</Label>
                        <div className="flex flex-wrap gap-2">
                          {resourceTypes.slice(0, 5).map(type => (
                            <Badge
                              key={type.value}
                              variant={filterState.resources.includes(type.value) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                setFilterState(prev => ({
                                  ...prev,
                                  resources: prev.resources.includes(type.value)
                                    ? prev.resources.filter(r => r !== type.value)
                                    : [...prev.resources, type.value]
                                }));
                              }}
                            >
                              <type.icon className="h-3 w-3 mr-1" />
                              {type.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Action Types</Label>
                        <div className="flex flex-wrap gap-2">
                          {actionTypes.slice(0, 4).map(action => (
                            <Badge
                              key={action.value}
                              variant={filterState.actions.includes(action.value) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                setFilterState(prev => ({
                                  ...prev,
                                  actions: prev.actions.includes(action.value)
                                    ? prev.actions.filter(a => a !== action.value)
                                    : [...prev.actions, action.value]
                                }));
                              }}
                            >
                              <action.icon className="h-3 w-3 mr-1" />
                              {action.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Filters</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has-conditions"
                              checked={filterState.hasConditions === true}
                              onCheckedChange={(checked) => setFilterState(prev => ({ 
                                ...prev, 
                                hasConditions: checked ? true : null 
                              }))}
                            />
                            <Label htmlFor="has-conditions" className="text-sm">Has Conditions</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredPermissions.length} of {permissions.length} permissions
                      </p>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterState({
                          search: '',
                          resources: [],
                          actions: [],
                          categories: [],
                          hasConditions: null,
                          isEffective: null,
                          assignmentCount: null,
                          createdAfter: '',
                          createdBefore: '',
                          lastUsedAfter: '',
                          lastUsedBefore: '',
                          tags: [],
                          priority: [],
                          status: ['active']
                        })}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk Actions */}
          {selectionState.selectedPermissions.size > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {selectionState.selectedPermissions.size} selected
                    </Badge>
                    <Checkbox
                      checked={selectionState.selectedPermissions.size === filteredPermissions.length}
                      indeterminate={selectionState.selectedPermissions.size > 0 && selectionState.selectedPermissions.size < filteredPermissions.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label>Select All</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasPermission('rbac.permission.delete') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPermissions}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectionState(prev => ({ ...prev, selectedPermissions: new Set() }))}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permissions Content */}
          {viewState.viewMode === 'list' ? (
            <PermissionList
              permissions={filteredPermissions}
              groupedPermissions={groupedPermissions}
              viewState={viewState}
              selectionState={selectionState}
              onPermissionSelect={handlePermissionSelect}
              onViewPermission={handleViewPermission}
              onEditPermission={handleEditPermission}
              onDeletePermission={handleDeletePermission}
              onDuplicatePermission={handleDuplicatePermission}
              permissionUsage={permissionUsage}
              expandedGroups={expandedGroups}
              onToggleGroup={(group) => {
                setExpandedGroups(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(group)) {
                    newSet.delete(group);
                  } else {
                    newSet.add(group);
                  }
                  return newSet;
                });
              }}
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                <Card key={groupName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setExpandedGroups(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(groupName)) {
                                newSet.delete(groupName);
                              } else {
                                newSet.add(groupName);
                              }
                              return newSet;
                            });
                          }}
                          className="p-1 h-6 w-6"
                        >
                          {expandedGroups.has(groupName) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                        <Database className="h-4 w-4" />
                        {groupName}
                        <Badge variant="outline">{groupPermissions.length}</Badge>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  
                  <AnimatePresence>
                    {expandedGroups.has(groupName) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupPermissions.map(permission => renderPermissionCard(permission))}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Templates</CardTitle>
              <CardDescription>
                Pre-defined permission sets for common roles and scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissionTemplates?.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <CardDescription className="text-xs">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Permissions</span>
                          <Badge variant="outline">{template.permissions.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Category</span>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Built-in</span>
                          {template.is_builtin ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {renderAnalyticsView()}
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Audit Trail</CardTitle>
              <CardDescription>
                Track all permission-related changes and access attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Audit trail functionality</p>
                <p className="text-xs">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PermissionCreateEdit
        isOpen={dialogState.createEditOpen}
        onClose={() => setDialogState(prev => ({ ...prev, createEditOpen: false }))}
        permission={dialogState.currentPermission}
        mode={dialogState.mode}
        onSuccess={() => {
          loadPermissionData();
          setDialogState(prev => ({ ...prev, createEditOpen: false }));
        }}
      />

      <PermissionDetails
        isOpen={dialogState.detailsOpen}
        onClose={() => setDialogState(prev => ({ ...prev, detailsOpen: false }))}
        permission={dialogState.currentPermission}
        usage={dialogState.currentPermission ? permissionUsage[dialogState.currentPermission.id] : undefined}
        onEdit={(permission) => {
          setDialogState(prev => ({
            ...prev,
            detailsOpen: false,
            createEditOpen: true,
            mode: 'edit',
            currentPermission: permission
          }));
        }}
        onDuplicate={(permission) => {
          setDialogState(prev => ({
            ...prev,
            detailsOpen: false,
            createEditOpen: true,
            mode: 'duplicate',
            currentPermission: permission
          }));
        }}
      />
    </div>
  );
}