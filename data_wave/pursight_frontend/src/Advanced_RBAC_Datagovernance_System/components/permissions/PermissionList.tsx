'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Lock,
  Unlock,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Crown,
  Database,
  Server,
  FileText,
  Tag,
  Search,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  Target,
  Zap,
  Network,
  ChevronDown,
  ChevronRight,
  Filter,
  ExternalLink,
  BookOpen,
  Key,
  Settings,
  Globe,
  Layers,
  GitBranch,
  Workflow,
  Plus,
  X
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import {
  Permission,
  PermissionUsage,
  PermissionValidation
} from '../../types/permission.types';
import { cn } from '@/lib copie/utils';

interface PermissionListProps {
  permissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  viewState: {
    groupBy: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    layout: string;
  };
  selectionState: {
    selectedPermissions: Set<number>;
  };
  onPermissionSelect: (permissionId: number, selected: boolean) => void;
  onViewPermission: (permission: Permission) => void;
  onEditPermission: (permission: Permission) => void;
  onDeletePermission: (permission: Permission) => void;
  onDuplicatePermission: (permission: Permission) => void;
  permissionUsage: Record<number, PermissionUsage>;
  expandedGroups: Set<string>;
  onToggleGroup: (group: string) => void;
  className?: string;
}

interface ColumnDefinition {
  key: string;
  label: string;
  width?: string;
  sortable: boolean;
  render: (permission: Permission) => React.ReactNode;
}

const getResourceIcon = (resource: string) => {
  const resourceType = resource.split('.')[0];
  
  const iconMap: Record<string, any> = {
    datasource: Database,
    catalog: BookOpen,
    scan: Search,
    compliance: Shield,
    classification: Tag,
    workflow: Workflow,
    user: Users,
    role: Crown,
    system: Server,
    analytics: Activity,
    security: Lock,
    network: Network,
    file: FileText
  };
  
  return iconMap[resourceType] || Target;
};

const getActionIcon = (action: string) => {
  const iconMap: Record<string, any> = {
    create: Plus,
    read: Eye,
    update: Edit,
    delete: Trash2,
    execute: Zap,
    manage: Settings,
    view: Eye,
    export: ExternalLink,
    import: ExternalLink,
    approve: CheckCircle,
    reject: X,
    assign: Users,
    revoke: Minus
  };
  
  return iconMap[action.toLowerCase()] || Activity;
};

const getActionColor = (action: string) => {
  const colorMap: Record<string, string> = {
    create: 'text-green-600',
    read: 'text-blue-600',
    update: 'text-yellow-600',
    delete: 'text-red-600',
    execute: 'text-purple-600',
    manage: 'text-gray-600',
    view: 'text-blue-600',
    export: 'text-orange-600',
    import: 'text-orange-600',
    approve: 'text-green-600',
    reject: 'text-red-600',
    assign: 'text-indigo-600',
    revoke: 'text-red-600'
  };
  
  return colorMap[action.toLowerCase()] || 'text-gray-600';
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
};

export function PermissionList({
  permissions,
  groupedPermissions,
  viewState,
  selectionState,
  onPermissionSelect,
  onViewPermission,
  onEditPermission,
  onDeletePermission,
  onDuplicatePermission,
  permissionUsage,
  expandedGroups,
  onToggleGroup,
  className
}: PermissionListProps) {
  const { hasPermission } = useAuth();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Define table columns
  const columns: ColumnDefinition[] = useMemo(() => [
    {
      key: 'select',
      label: '',
      width: 'w-12',
      sortable: false,
      render: (permission) => (
        <Checkbox
          checked={selectionState.selectedPermissions.has(permission.id)}
          onCheckedChange={(checked) => onPermissionSelect(permission.id, checked === true)}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      key: 'action',
      label: 'Action',
      width: 'min-w-[180px]',
      sortable: true,
      render: (permission) => {
        const ActionIcon = getActionIcon(permission.action);
        const actionColor = getActionColor(permission.action);
        
        return (
          <div className="flex items-center gap-3">
            <ActionIcon className={cn("h-4 w-4", actionColor)} />
            <div>
              <p className="font-medium text-sm">{permission.action}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {permission.action.replace(/[._-]/g, ' ')}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'resource',
      label: 'Resource',
      width: 'min-w-[200px]',
      sortable: true,
      render: (permission) => {
        const ResourceIcon = getResourceIcon(permission.resource);
        const resourceParts = permission.resource.split('.');
        
        return (
          <div className="flex items-center gap-3">
            <ResourceIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{resourceParts[0]}</p>
              {resourceParts.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {resourceParts.slice(1).join('.')}
                </p>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'conditions',
      label: 'Conditions',
      width: 'w-24',
      sortable: false,
      render: (permission) => (
        <div className="flex justify-center">
          {permission.conditions ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-4 w-4 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-medium mb-1">ABAC Conditions</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(JSON.parse(permission.conditions), null, 2)}
                    </pre>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Unlock className="h-4 w-4 text-gray-300" />
          )}
        </div>
      )
    },
    {
      key: 'usage',
      label: 'Usage',
      width: 'min-w-[120px]',
      sortable: true,
      render: (permission) => {
        const usage = permissionUsage[permission.id];
        
        if (!usage) {
          return (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No data</p>
            </div>
          );
        }
        
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Roles:</span>
              <span className="font-medium">{usage.role_count}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Users:</span>
              <span className="font-medium">{usage.user_count}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Freq:</span>
              <span className="font-medium">{usage.usage_frequency}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'trend',
      label: 'Trend',
      width: 'w-20',
      sortable: true,
      render: (permission) => {
        const usage = permissionUsage[permission.id];
        
        if (!usage?.usage_trend) {
          return <div className="text-center">-</div>;
        }
        
        const trendConfig = {
          increasing: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
          decreasing: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          stable: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-50' }
        };
        
        const config = trendConfig[usage.usage_trend];
        const TrendIcon = config.icon;
        
        return (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn("p-1 rounded", config.bg)}>
                    <TrendIcon className={cn("h-3 w-3", config.color)} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Usage trend: {usage.usage_trend}</p>
                  <p className="text-xs">
                    Last used: {usage.last_used ? formatRelativeTime(usage.last_used) : 'Never'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-24',
      sortable: false,
      render: (permission) => {
        // This would be based on permission status if implemented
        const isActive = true; // Placeholder
        const hasConflicts = false; // Placeholder
        
        if (hasConflicts) {
          return (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Conflict
            </Badge>
          );
        }
        
        return (
          <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: '',
      width: 'w-12',
      sortable: false,
      render: (permission) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewPermission(permission)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {hasPermission('rbac.permission.edit') && (
              <DropdownMenuItem onClick={() => onEditPermission(permission)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {hasPermission('rbac.permission.create') && (
              <DropdownMenuItem onClick={() => onDuplicatePermission(permission)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
            )}
            {hasPermission('rbac.permission.delete') && (
              <DropdownMenuItem
                onClick={() => onDeletePermission(permission)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [
    selectionState.selectedPermissions,
    onPermissionSelect,
    permissionUsage,
    onViewPermission,
    onEditPermission,
    onDuplicatePermission,
    onDeletePermission,
    hasPermission
  ]);

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  }, [sortConfig]);

  // Sort permissions based on current sort config
  const sortedPermissions = useMemo(() => {
    if (!sortConfig) return permissions;
    
    return [...permissions].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortConfig.key) {
        case 'action':
          aValue = a.action.toLowerCase();
          bValue = b.action.toLowerCase();
          break;
        case 'resource':
          aValue = a.resource.toLowerCase();
          bValue = b.resource.toLowerCase();
          break;
        case 'usage':
          aValue = permissionUsage[a.id]?.usage_frequency || 0;
          bValue = permissionUsage[b.id]?.usage_frequency || 0;
          break;
        case 'trend':
          const trendOrder = { increasing: 3, stable: 2, decreasing: 1 };
          aValue = trendOrder[permissionUsage[a.id]?.usage_trend as keyof typeof trendOrder] || 0;
          bValue = trendOrder[permissionUsage[b.id]?.usage_trend as keyof typeof trendOrder] || 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [permissions, sortConfig, permissionUsage]);

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-blue-500" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-500" />
    );
  };

  // Render table header
  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={column.key}
            className={cn(
              column.width,
              column.sortable && "cursor-pointer hover:bg-muted/50 transition-colors",
              "select-none"
            )}
            onClick={column.sortable ? () => handleSort(column.key) : undefined}
          >
            <div className="flex items-center gap-2">
              {column.label}
              {column.sortable && renderSortIcon(column.key)}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  // Render table row
  const renderTableRow = (permission: Permission) => {
    const isSelected = selectionState.selectedPermissions.has(permission.id);
    const isHovered = hoveredRow === permission.id;
    
    return (
      <TableRow
        key={permission.id}
        className={cn(
          "group cursor-pointer transition-colors",
          isSelected && "bg-blue-50 border-blue-200",
          isHovered && !isSelected && "bg-muted/50"
        )}
        onMouseEnter={() => setHoveredRow(permission.id)}
        onMouseLeave={() => setHoveredRow(null)}
        onClick={() => onViewPermission(permission)}
      >
        {columns.map((column) => (
          <TableCell
            key={column.key}
            className={cn(
              column.width,
              "py-3"
            )}
            onClick={column.key === 'select' ? (e) => e.stopPropagation() : undefined}
          >
            {column.render(permission)}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  // Render grouped table
  const renderGroupedTable = () => (
    <div className="space-y-4">
      {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
        <Card key={groupName} className="overflow-hidden">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleGroup(groupName)}
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
                <Badge variant="outline" className="text-xs">
                  {groupPermissions.length}
                </Badge>
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={groupPermissions.every(p => selectionState.selectedPermissions.has(p.id))}
                  indeterminate={
                    groupPermissions.some(p => selectionState.selectedPermissions.has(p.id)) &&
                    !groupPermissions.every(p => selectionState.selectedPermissions.has(p.id))
                  }
                  onCheckedChange={(checked) => {
                    groupPermissions.forEach(permission => {
                      onPermissionSelect(permission.id, checked === true);
                    });
                  }}
                />
                <span className="text-xs text-muted-foreground">Select All</span>
              </div>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {expandedGroups.has(groupName) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="border rounded-none">
                    <Table>
                      {renderTableHeader()}
                      <TableBody>
                        {groupPermissions.map(permission => renderTableRow(permission))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );

  // Render flat table
  const renderFlatTable = () => (
    <Card>
      <CardContent className="p-0">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            {renderTableHeader()}
            <TableBody>
              {sortedPermissions.map(permission => renderTableRow(permission))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Card>
      <CardContent className="p-12">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Permissions Found</h3>
          <p className="text-muted-foreground mb-4">
            {permissions.length === 0 
              ? "No permissions have been created yet."
              : "No permissions match your current filters."
            }
          </p>
          {permissions.length === 0 && hasPermission('rbac.permission.create') && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Permission
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Main render
  if (permissions.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
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
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">In Use</p>
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
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Growing</p>
                <p className="text-2xl font-bold">
                  {Object.values(permissionUsage).filter(u => u.usage_trend === 'increasing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table content */}
      <ScrollArea className="h-[600px]">
        {viewState.groupBy !== 'none' ? renderGroupedTable() : renderFlatTable()}
      </ScrollArea>

      {/* Footer info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Showing {sortedPermissions.length} permission{sortedPermissions.length !== 1 ? 's' : ''}
          </span>
          {selectionState.selectedPermissions.size > 0 && (
            <span>
              {selectionState.selectedPermissions.size} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-yellow-500" />
            <span className="text-xs">Has Conditions</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs">Increasing Usage</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-3 w-3 text-red-500" />
            <span className="text-xs">Decreasing Usage</span>
          </div>
        </div>
      </div>
    </div>
  );
}