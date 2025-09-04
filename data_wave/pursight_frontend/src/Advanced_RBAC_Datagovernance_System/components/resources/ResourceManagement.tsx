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
  Folder,
  FolderOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
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
  Activity,
  Network,
  Globe,
  Layers,
  Target,
  BookOpen,
  Zap,
  Calendar,
  Clock,
  User,
  Shield,
  Lock,
  Unlock,
  Key,
  Grid,
  List,
  TreePine,
  Workflow,
  GitBranch,
  Share2,
  MessageSquare,
  Bell,
  Save,
  Archive,
  Building,
  Home,
  Map,
  MapPin,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Wifi,
  Router,
  Cable
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useResources } from '../../hooks/useResources';
import { useRoles } from '../../hooks/useRoles';
import { useToast } from '@/components/ui/use-toast';
import {
  Resource,
  ResourceCreate,
  ResourceUpdate,
  ResourceTree,
  ResourcePermission,
  ResourceRole,
  ResourceStats,
  ResourceFilters
} from '../../types/resource.types';
import { Role } from '../../types/role.types';
import { Permission } from '../../types/permission.types';
import { cn } from '@/lib copie/utils';
import { ResourceTree as ResourceTreeComponent } from './ResourceTree';
import { ResourceDetails } from './ResourceDetails';
import { ResourceCreateEdit } from './ResourceCreateEdit';
import { ResourceRoleAssignment } from './ResourceRoleAssignment';

interface ResourceManagementProps {
  className?: string;
  initialView?: 'tree' | 'list' | 'grid';
  onResourceSelect?: (resource: Resource) => void;
  readOnly?: boolean;
}

interface ViewState {
  activeTab: 'hierarchy' | 'permissions' | 'roles' | 'analytics' | 'audit';
  viewMode: 'tree' | 'list' | 'grid';
  layout: 'compact' | 'comfortable' | 'spacious';
  groupBy: 'none' | 'type' | 'location' | 'owner' | 'status';
  sortBy: 'name' | 'created' | 'modified' | 'type' | 'size';
  sortOrder: 'asc' | 'desc';
  showFilters: boolean;
  showSidebar: boolean;
  expandAll: boolean;
}

interface FilterState {
  search: string;
  types: string[];
  locations: string[];
  owners: string[];
  status: ('active' | 'inactive' | 'archived')[];
  hasPermissions: boolean | null;
  hasRoles: boolean | null;
  createdAfter: string;
  createdBefore: string;
  modifiedAfter: string;
  modifiedBefore: string;
  tags: string[];
}

interface SelectionState {
  selectedResources: Set<number>;
  selectedItems: Resource[];
  bulkAction: 'delete' | 'archive' | 'activate' | 'assign_roles' | 'set_permissions' | null;
}

interface DialogState {
  createEditOpen: boolean;
  detailsOpen: boolean;
  roleAssignmentOpen: boolean;
  bulkActionOpen: boolean;
  permissionMappingOpen: boolean;
  currentResource: Resource | null;
  mode: 'create' | 'edit' | 'duplicate' | 'view';
}

const resourceTypes = [
  { value: 'server', label: 'Server', icon: Server, color: 'bg-blue-500', description: 'Physical or virtual servers' },
  { value: 'database', label: 'Database', icon: Database, color: 'bg-green-500', description: 'Database instances and schemas' },
  { value: 'application', label: 'Application', icon: Monitor, color: 'bg-purple-500', description: 'Software applications and services' },
  { value: 'storage', label: 'Storage', icon: HardDrive, color: 'bg-orange-500', description: 'Storage systems and volumes' },
  { value: 'network', label: 'Network', icon: Network, color: 'bg-teal-500', description: 'Network devices and segments' },
  { value: 'file', label: 'File System', icon: FileText, color: 'bg-yellow-500', description: 'Files and directories' },
  { value: 'api', label: 'API Endpoint', icon: Globe, color: 'bg-indigo-500', description: 'API endpoints and services' },
  { value: 'workflow', label: 'Workflow', icon: Workflow, color: 'bg-pink-500', description: 'Business workflows and processes' },
  { value: 'dataset', label: 'Dataset', icon: BookOpen, color: 'bg-red-500', description: 'Data collections and tables' },
  { value: 'environment', label: 'Environment', icon: Building, color: 'bg-gray-500', description: 'Deployment environments' }
];

const getResourceIcon = (type: string) => {
  const typeConfig = resourceTypes.find(t => t.value === type);
  return typeConfig?.icon || Folder;
};

const getResourceColor = (type: string) => {
  const typeConfig = resourceTypes.find(t => t.value === type);
  return typeConfig?.color || 'bg-gray-500';
};

export function ResourceManagement({
  className,
  initialView = 'tree',
  onResourceSelect,
  readOnly = false
}: ResourceManagementProps) {
  const { user, hasPermission } = useAuth();
  const {
    resources,
    resourceTree,
    resourceStats,
    isLoading,
    error,
    fetchResources,
    fetchResourceTree,
    createResource,
    updateResource,
    deleteResource,
    bulkUpdateResources,
    getResourcePermissions,
    setResourcePermissions,
    getResourceRoles,
    assignResourceRoles,
    revokeResourceRoles,
    getResourceHierarchy,
    moveResource,
    duplicateResource,
    archiveResource,
    restoreResource
  } = useResources();
  
  const { roles } = useRoles();
  const { toast } = useToast();

  // State management
  const [viewState, setViewState] = useState<ViewState>({
    activeTab: 'hierarchy',
    viewMode: initialView,
    layout: 'comfortable',
    groupBy: 'type',
    sortBy: 'name',
    sortOrder: 'asc',
    showFilters: true,
    showSidebar: true,
    expandAll: false
  });

  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    types: [],
    locations: [],
    owners: [],
    status: ['active'],
    hasPermissions: null,
    hasRoles: null,
    createdAfter: '',
    createdBefore: '',
    modifiedAfter: '',
    modifiedBefore: '',
    tags: []
  });

  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedResources: new Set(),
    selectedItems: [],
    bulkAction: null
  });

  const [dialogState, setDialogState] = useState<DialogState>({
    createEditOpen: false,
    detailsOpen: false,
    roleAssignmentOpen: false,
    bulkActionOpen: false,
    permissionMappingOpen: false,
    currentResource: null,
    mode: 'create'
  });

  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Initialize data
  useEffect(() => {
    loadResourceData();
  }, []);

  const loadResourceData = async () => {
    try {
      await Promise.all([
        fetchResources(),
        fetchResourceTree()
      ]);
    } catch (error) {
      console.error('Failed to load resource data:', error);
      toast({
        title: 'Load Failed',
        description: 'Failed to load resource data. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let filtered = resources.filter(resource => {
      // Search filter
      if (filterState.search && 
          !resource.name.toLowerCase().includes(filterState.search.toLowerCase()) &&
          !resource.description?.toLowerCase().includes(filterState.search.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterState.types.length > 0 && !filterState.types.includes(resource.type)) {
        return false;
      }

      // Status filter
      if (filterState.status.length > 0 && !filterState.status.includes(resource.status as any)) {
        return false;
      }

      // Location filter
      if (filterState.locations.length > 0 && resource.location && 
          !filterState.locations.some(loc => resource.location?.includes(loc))) {
        return false;
      }

      // Permissions filter
      if (filterState.hasPermissions !== null) {
        const hasPerms = resource.permissions && resource.permissions.length > 0;
        if (hasPerms !== filterState.hasPermissions) {
          return false;
        }
      }

      // Roles filter
      if (filterState.hasRoles !== null) {
        const hasRoles = resource.roles && resource.roles.length > 0;
        if (hasRoles !== filterState.hasRoles) {
          return false;
        }
      }

      return true;
    });

    // Sort resources
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (viewState.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'modified':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
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
  }, [resources, filterState, viewState.sortBy, viewState.sortOrder]);

  // Group resources
  const groupedResources = useMemo(() => {
    if (viewState.groupBy === 'none') {
      return { 'All Resources': filteredResources };
    }

    return filteredResources.reduce((groups, resource) => {
      let groupKey: string;

      switch (viewState.groupBy) {
        case 'type':
          groupKey = resourceTypes.find(t => t.value === resource.type)?.label || 'Other';
          break;
        case 'location':
          groupKey = resource.location || 'No Location';
          break;
        case 'owner':
          groupKey = resource.owner || 'No Owner';
          break;
        case 'status':
          groupKey = resource.status.charAt(0).toUpperCase() + resource.status.slice(1);
          break;
        default:
          groupKey = 'Other';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(resource);
      return groups;
    }, {} as Record<string, Resource[]>);
  }, [filteredResources, viewState.groupBy]);

  // Handle resource selection
  const handleResourceSelect = useCallback((resourceId: number, selected: boolean) => {
    setSelectionState(prev => {
      const newSelected = new Set(prev.selectedResources);
      let newItems = [...prev.selectedItems];

      if (selected) {
        newSelected.add(resourceId);
        const resource = resources.find(r => r.id === resourceId);
        if (resource && !prev.selectedItems.find(r => r.id === resourceId)) {
          newItems.push(resource);
        }
      } else {
        newSelected.delete(resourceId);
        newItems = newItems.filter(r => r.id !== resourceId);
      }

      return { ...prev, selectedResources: newSelected, selectedItems: newItems };
    });
  }, [resources]);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectionState(prev => ({
      ...prev,
      selectedResources: selected ? new Set(filteredResources.map(r => r.id)) : new Set(),
      selectedItems: selected ? [...filteredResources] : []
    }));
  }, [filteredResources]);

  // Handle resource operations
  const handleCreateResource = useCallback(() => {
    if (!hasPermission('rbac.resource.create')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to create resources.',
        variant: 'destructive'
      });
      return;
    }

    setDialogState(prev => ({
      ...prev,
      createEditOpen: true,
      mode: 'create',
      currentResource: null
    }));
  }, [hasPermission, toast]);

  const handleEditResource = useCallback((resource: Resource) => {
    if (!hasPermission('rbac.resource.edit')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to edit resources.',
        variant: 'destructive'
      });
      return;
    }

    setDialogState(prev => ({
      ...prev,
      createEditOpen: true,
      mode: 'edit',
      currentResource: resource
    }));
  }, [hasPermission, toast]);

  const handleDuplicateResource = useCallback(async (resource: Resource) => {
    if (!hasPermission('rbac.resource.create')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to create resources.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const duplicatedResource = await duplicateResource(resource.id);
      await loadResourceData();
      
      toast({
        title: 'Resource Duplicated',
        description: `Resource "${duplicatedResource.name}" has been created.`,
      });
    } catch (error) {
      toast({
        title: 'Duplicate Failed',
        description: error instanceof Error ? error.message : 'Failed to duplicate resource.',
        variant: 'destructive'
      });
    }
  }, [hasPermission, duplicateResource, toast]);

  const handleViewResource = useCallback((resource: Resource) => {
    setDialogState(prev => ({
      ...prev,
      detailsOpen: true,
      currentResource: resource
    }));
    setSelectedResource(resource);
    onResourceSelect?.(resource);
  }, [onResourceSelect]);

  const handleDeleteResource = useCallback(async (resource: Resource) => {
    if (!hasPermission('rbac.resource.delete')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to delete resources.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await deleteResource(resource.id);
      await loadResourceData();
      
      toast({
        title: 'Resource Deleted',
        description: `Resource "${resource.name}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete resource.',
        variant: 'destructive'
      });
    }
  }, [hasPermission, deleteResource, toast]);

  const handleArchiveResource = useCallback(async (resource: Resource) => {
    if (!hasPermission('rbac.resource.edit')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to archive resources.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await archiveResource(resource.id);
      await loadResourceData();
      
      toast({
        title: 'Resource Archived',
        description: `Resource "${resource.name}" has been archived.`,
      });
    } catch (error) {
      toast({
        title: 'Archive Failed',
        description: error instanceof Error ? error.message : 'Failed to archive resource.',
        variant: 'destructive'
      });
    }
  }, [hasPermission, archiveResource, toast]);

  // Handle bulk operations
  const handleBulkDelete = useCallback(async () => {
    if (!hasPermission('rbac.resource.delete')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to delete resources.',
        variant: 'destructive'
      });
      return;
    }

    if (selectionState.selectedResources.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select resources to delete.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const resourceIds = Array.from(selectionState.selectedResources);
      await bulkUpdateResources({
        action: 'delete',
        resource_ids: resourceIds
      });
      
      setSelectionState(prev => ({ ...prev, selectedResources: new Set(), selectedItems: [] }));
      await loadResourceData();
      
      toast({
        title: 'Bulk Delete Complete',
        description: `Successfully deleted ${resourceIds.length} resources.`,
      });
    } catch (error) {
      toast({
        title: 'Bulk Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete resources.',
        variant: 'destructive'
      });
    }
  }, [hasPermission, selectionState.selectedResources, bulkUpdateResources, toast]);

  const handleBulkArchive = useCallback(async () => {
    if (!hasPermission('rbac.resource.edit')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to archive resources.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const resourceIds = Array.from(selectionState.selectedResources);
      await bulkUpdateResources({
        action: 'archive',
        resource_ids: resourceIds
      });
      
      setSelectionState(prev => ({ ...prev, selectedResources: new Set(), selectedItems: [] }));
      await loadResourceData();
      
      toast({
        title: 'Bulk Archive Complete',
        description: `Successfully archived ${resourceIds.length} resources.`,
      });
    } catch (error) {
      toast({
        title: 'Bulk Archive Failed',
        description: error instanceof Error ? error.message : 'Failed to archive resources.',
        variant: 'destructive'
      });
    }
  }, [hasPermission, selectionState.selectedResources, bulkUpdateResources, toast]);

  // Handle role assignments
  const handleManageRoles = useCallback((resource: Resource) => {
    setDialogState(prev => ({
      ...prev,
      roleAssignmentOpen: true,
      currentResource: resource
    }));
  }, []);

  // Render resource card for grid view
  const renderResourceCard = useCallback((resource: Resource) => {
    const ResourceIcon = getResourceIcon(resource.type);
    const isSelected = selectionState.selectedResources.has(resource.id);
    const resourceColor = getResourceColor(resource.type);

    return (
      <motion.div
        key={resource.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "group relative border rounded-lg p-4 cursor-pointer transition-all duration-200",
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md",
          resource.status === 'archived' && "opacity-60"
        )}
        onClick={() => handleViewResource(resource)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleResourceSelect(resource.id, checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="flex items-center gap-2">
                <div className={cn("p-1 rounded", resourceColor)}>
                  <ResourceIcon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-medium text-sm truncate">{resource.name}</h3>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {resource.type}
              </Badge>
            </div>

            {resource.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {resource.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              {resource.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{resource.location}</span>
                </div>
              )}
              
              {resource.owner && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{resource.owner}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{resource.roles?.length || 0} roles</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{resource.permissions?.length || 0} perms</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge
                variant={resource.status === 'active' ? 'default' : resource.status === 'inactive' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {resource.status}
              </Badge>
              
              <div className="flex items-center gap-1">
                {resource.tags?.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(resource.tags?.length || 0) > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{(resource.tags?.length || 0) - 2}
                  </Badge>
                )}
              </div>
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
              <DropdownMenuItem onClick={() => handleViewResource(resource)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {hasPermission('rbac.resource.edit') && (
                <DropdownMenuItem onClick={() => handleEditResource(resource)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {hasPermission('rbac.resource.create') && (
                <DropdownMenuItem onClick={() => handleDuplicateResource(resource)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleManageRoles(resource)}>
                <Crown className="h-4 w-4 mr-2" />
                Manage Roles
              </DropdownMenuItem>
              {hasPermission('rbac.resource.edit') && resource.status !== 'archived' && (
                <DropdownMenuItem onClick={() => handleArchiveResource(resource)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              {hasPermission('rbac.resource.delete') && (
                <DropdownMenuItem
                  onClick={() => handleDeleteResource(resource)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }, [
    selectionState.selectedResources,
    handleViewResource,
    handleResourceSelect,
    handleEditResource,
    handleDuplicateResource,
    handleDeleteResource,
    handleArchiveResource,
    handleManageRoles,
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
              <Folder className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Resources</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">
                  {resources.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">With Roles</p>
                <p className="text-2xl font-bold">
                  {resources.filter(r => r.roles && r.roles.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Archived</p>
                <p className="text-2xl font-bold">
                  {resources.filter(r => r.status === 'archived').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resource Distribution by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {resourceTypes.map(type => {
              const count = resources.filter(r => r.type === type.value).length;
              const percentage = resources.length > 0 ? (count / resources.length) * 100 : 0;
              
              return (
                <div key={type.value} className="text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("p-2 rounded-lg", type.color)}>
                      <type.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
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
          <TreePine className="h-6 w-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-semibold">Resource Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage system resources, hierarchies, and access control assignments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Handle export */}}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {hasPermission('rbac.resource.create') && !readOnly && (
            <Button
              size="sm"
              onClick={handleCreateResource}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Resource
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={viewState.activeTab} onValueChange={(value) => setViewState(prev => ({ ...prev, activeTab: value as any }))}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hierarchy" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Roles
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

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search resources..."
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
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
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
                      <SelectItem value="type-asc">Type A-Z</SelectItem>
                      <SelectItem value="created-desc">Newest First</SelectItem>
                      <SelectItem value="created-asc">Oldest First</SelectItem>
                      <SelectItem value="modified-desc">Recently Modified</SelectItem>
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
                        checked={viewState.viewMode === 'tree'}
                        onCheckedChange={() => setViewState(prev => ({ ...prev, viewMode: 'tree' }))}
                      >
                        <TreePine className="h-4 w-4 mr-2" />
                        Tree View
                      </DropdownMenuCheckboxItem>
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
                    onClick={loadResourceData}
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
                              variant={filterState.types.includes(type.value) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                setFilterState(prev => ({
                                  ...prev,
                                  types: prev.types.includes(type.value)
                                    ? prev.types.filter(t => t !== type.value)
                                    : [...prev.types, type.value]
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
                        <Label>Status</Label>
                        <div className="flex flex-wrap gap-2">
                          {['active', 'inactive', 'archived'].map(status => (
                            <Badge
                              key={status}
                              variant={filterState.status.includes(status as any) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                setFilterState(prev => ({
                                  ...prev,
                                  status: prev.status.includes(status as any)
                                    ? prev.status.filter(s => s !== status)
                                    : [...prev.status, status as any]
                                }));
                              }}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Additional Filters</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has-permissions"
                              checked={filterState.hasPermissions === true}
                              onCheckedChange={(checked) => setFilterState(prev => ({ 
                                ...prev, 
                                hasPermissions: checked ? true : null 
                              }))}
                            />
                            <Label htmlFor="has-permissions" className="text-sm">Has Permissions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has-roles"
                              checked={filterState.hasRoles === true}
                              onCheckedChange={(checked) => setFilterState(prev => ({ 
                                ...prev, 
                                hasRoles: checked ? true : null 
                              }))}
                            />
                            <Label htmlFor="has-roles" className="text-sm">Has Roles</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredResources.length} of {resources.length} resources
                      </p>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterState({
                          search: '',
                          types: [],
                          locations: [],
                          owners: [],
                          status: ['active'],
                          hasPermissions: null,
                          hasRoles: null,
                          createdAfter: '',
                          createdBefore: '',
                          modifiedAfter: '',
                          modifiedBefore: '',
                          tags: []
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
          {selectionState.selectedResources.size > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {selectionState.selectedResources.size} selected
                    </Badge>
                    <Checkbox
                      checked={selectionState.selectedResources.size === filteredResources.length}
                      indeterminate={selectionState.selectedResources.size > 0 && selectionState.selectedResources.size < filteredResources.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label>Select All</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasPermission('rbac.resource.edit') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkArchive}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Selected
                      </Button>
                    )}

                    {hasPermission('rbac.resource.delete') && (
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
                      onClick={() => setSelectionState(prev => ({ ...prev, selectedResources: new Set(), selectedItems: [] }))}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resource Content */}
          {viewState.viewMode === 'tree' ? (
            <ResourceTreeComponent
              resources={filteredResources}
              expandedNodes={expandedNodes}
              onToggleExpand={(nodeId) => {
                setExpandedNodes(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(nodeId)) {
                    newSet.delete(nodeId);
                  } else {
                    newSet.add(nodeId);
                  }
                  return newSet;
                });
              }}
              onResourceSelect={handleViewResource}
              selectedResources={selectionState.selectedResources}
              onResourceCheck={handleResourceSelect}
            />
          ) : viewState.viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredResources.map(resource => renderResourceCard(resource))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectionState.selectedResources.size === filteredResources.length}
                          indeterminate={selectionState.selectedResources.size > 0 && selectionState.selectedResources.size < filteredResources.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map(resource => {
                      const ResourceIcon = getResourceIcon(resource.type);
                      const isSelected = selectionState.selectedResources.has(resource.id);
                      
                      return (
                        <TableRow
                          key={resource.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewResource(resource)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleResourceSelect(resource.id, checked === true)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ResourceIcon className="h-4 w-4" />
                              <span className="font-medium">{resource.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{resource.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {resource.location || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {resource.owner || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={resource.status === 'active' ? 'default' : 'secondary'}
                            >
                              {resource.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{resource.roles?.length || 0}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{resource.permissions?.length || 0}</span>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewResource(resource)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {hasPermission('rbac.resource.edit') && (
                                  <DropdownMenuItem onClick={() => handleEditResource(resource)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleManageRoles(resource)}>
                                  <Crown className="h-4 w-4 mr-2" />
                                  Manage Roles
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {renderAnalyticsView()}
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Permissions</CardTitle>
              <CardDescription>
                Manage permission mappings and access control for resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Resource permission management</p>
                <p className="text-xs">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Roles</CardTitle>
              <CardDescription>
                Manage role assignments and scoped access for resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Resource role management</p>
                <p className="text-xs">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Audit Trail</CardTitle>
              <CardDescription>
                Track all resource-related changes and access attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Resource audit trail</p>
                <p className="text-xs">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ResourceCreateEdit
        isOpen={dialogState.createEditOpen}
        onClose={() => setDialogState(prev => ({ ...prev, createEditOpen: false }))}
        resource={dialogState.currentResource}
        mode={dialogState.mode}
        onSuccess={() => {
          loadResourceData();
          setDialogState(prev => ({ ...prev, createEditOpen: false }));
        }}
      />

      <ResourceDetails
        isOpen={dialogState.detailsOpen}
        onClose={() => setDialogState(prev => ({ ...prev, detailsOpen: false }))}
        resource={dialogState.currentResource}
        onEdit={(resource) => {
          setDialogState(prev => ({
            ...prev,
            detailsOpen: false,
            createEditOpen: true,
            mode: 'edit',
            currentResource: resource
          }));
        }}
        onDuplicate={(resource) => {
          setDialogState(prev => ({
            ...prev,
            detailsOpen: false,
            createEditOpen: true,
            mode: 'duplicate',
            currentResource: resource
          }));
        }}
      />

      <ResourceRoleAssignment
        isOpen={dialogState.roleAssignmentOpen}
        onClose={() => setDialogState(prev => ({ ...prev, roleAssignmentOpen: false }))}
        resource={dialogState.currentResource}
        onSuccess={() => {
          loadResourceData();
        }}
      />
    </div>
  );
}