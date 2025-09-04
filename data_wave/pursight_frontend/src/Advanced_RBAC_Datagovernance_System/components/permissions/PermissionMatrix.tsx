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
  Minus,
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
  Grid,
  List,
  Maximize2,
  Minimize2,
  GitCompare,
  GitBranch,
  Share2,
  MessageSquare,
  Bell,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  MinusSquare
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoles } from '../../hooks/useRoles';
import { useToast } from '@/components/ui/use-toast';
import {
  Permission,
  PermissionMatrix as PermissionMatrixType,
  PermissionBulkAction
} from '../../types/permission.types';
import { Role } from '../../types/role.types';
import { cn } from '@/lib copie/utils';

interface PermissionMatrixProps {
  className?: string;
  readOnly?: boolean;
  onSelectionChange?: (selectedItems: { roles: number[], permissions: number[] }) => void;
}

interface MatrixCell {
  roleId: number;
  permissionId: number;
  hasPermission: boolean;
  source: 'direct' | 'inherited' | 'conflicting';
  inheritedFrom?: string;
  isModified: boolean;
  isConflicting: boolean;
}

interface ViewSettings {
  showInherited: boolean;
  showEmpty: boolean;
  groupByResource: boolean;
  colorCode: boolean;
  compactView: boolean;
  autoSave: boolean;
}

interface FilterState {
  roleSearch: string;
  permissionSearch: string;
  resourceTypes: string[];
  sources: ('direct' | 'inherited' | 'conflicting')[];
  modified: boolean | null;
  conflicts: boolean | null;
}

interface SelectionState {
  selectedRoles: Set<number>;
  selectedPermissions: Set<number>;
  selectedCells: Set<string>;
  bulkAction: 'assign' | 'revoke' | 'toggle' | null;
}

interface ComparisonState {
  isOpen: boolean;
  roleA: Role | null;
  roleB: Role | null;
}

interface MatrixStats {
  totalAssignments: number;
  directAssignments: number;
  inheritedAssignments: number;
  modifiedCells: number;
  conflicts: number;
  coverage: number;
}

const getCellKey = (roleId: number, permissionId: number) => `${roleId}-${permissionId}`;

const getResourceIcon = (resource: string) => {
  const resourceType = resource.split('.')[0];
  
  const iconMap: Record<string, any> = {
    datasource: Database,
    catalog: BookOpen,
    scan: Search,
    compliance: Shield,
    classification: Tag,
    workflow: Activity,
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

export function PermissionMatrix({
  className,
  readOnly = false,
  onSelectionChange
}: PermissionMatrixProps) {
  const { user, hasPermission } = useAuth();
  const {
    permissions,
    getPermissionMatrix,
    bulkUpdatePermissions,
    validatePermissionAssignment,
    isLoading,
    error
  } = usePermissions();
  
  const {
    roles,
    updateRolePermissions,
    bulkUpdateRolePermissions,
    compareRoles,
    validateRolePermissions,
    getRoleEffectivePermissions
  } = useRoles();
  
  const { toast } = useToast();

  // State management
  const [matrix, setMatrix] = useState<PermissionMatrixType | null>(null);
  const [matrixCells, setMatrixCells] = useState<Map<string, MatrixCell>>(new Map());
  const [modifiedCells, setModifiedCells] = useState<Map<string, MatrixCell>>(new Map());
  
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    showInherited: true,
    showEmpty: false,
    groupByResource: true,
    colorCode: true,
    compactView: false,
    autoSave: false
  });

  const [filterState, setFilterState] = useState<FilterState>({
    roleSearch: '',
    permissionSearch: '',
    resourceTypes: [],
    sources: ['direct', 'inherited'],
    modified: null,
    conflicts: null
  });

  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedRoles: new Set(),
    selectedPermissions: new Set(),
    selectedCells: new Set(),
    bulkAction: null
  });

  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    isOpen: false,
    roleA: null,
    roleB: null
  });

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load matrix data
  useEffect(() => {
    loadMatrixData();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (viewSettings.autoSave && modifiedCells.size > 0) {
      const autoSaveTimer = setTimeout(() => {
        handleSaveChanges();
      }, 2000);
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [modifiedCells, viewSettings.autoSave]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        roles: Array.from(selectionState.selectedRoles),
        permissions: Array.from(selectionState.selectedPermissions)
      });
    }
  }, [selectionState.selectedRoles, selectionState.selectedPermissions, onSelectionChange]);

  const loadMatrixData = async () => {
    try {
      const matrixData = await getPermissionMatrix();
      setMatrix(matrixData);
      
      // Build matrix cells map
      const cellsMap = new Map<string, MatrixCell>();
      
      matrixData.assignments.forEach(assignment => {
        const key = getCellKey(assignment.role_id, assignment.permission_id);
        cellsMap.set(key, {
          roleId: assignment.role_id,
          permissionId: assignment.permission_id,
          hasPermission: assignment.has_permission,
          source: assignment.source as 'direct' | 'inherited' | 'conflicting',
          inheritedFrom: assignment.inherited_from,
          isModified: false,
          isConflicting: assignment.is_conflicting || false
        });
      });
      
      setMatrixCells(cellsMap);
    } catch (error) {
      console.error('Failed to load matrix data:', error);
      toast({
        title: 'Load Failed',
        description: 'Failed to load permission matrix data.',
        variant: 'destructive'
      });
    }
  };

  // Filter roles and permissions
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (filterState.roleSearch && !role.name.toLowerCase().includes(filterState.roleSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [roles, filterState.roleSearch]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      if (filterState.permissionSearch && 
          !permission.action.toLowerCase().includes(filterState.permissionSearch.toLowerCase()) &&
          !permission.resource.toLowerCase().includes(filterState.permissionSearch.toLowerCase())) {
        return false;
      }

      if (filterState.resourceTypes.length > 0) {
        const resourceType = permission.resource.split('.')[0];
        if (!filterState.resourceTypes.includes(resourceType)) {
          return false;
        }
      }

      return true;
    });
  }, [permissions, filterState.permissionSearch, filterState.resourceTypes]);

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    if (!viewSettings.groupByResource) {
      return { 'All Permissions': filteredPermissions };
    }

    return filteredPermissions.reduce((groups, permission) => {
      const resourceType = permission.resource.split('.')[0] || 'Other';
      if (!groups[resourceType]) {
        groups[resourceType] = [];
      }
      groups[resourceType].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  }, [filteredPermissions, viewSettings.groupByResource]);

  // Calculate matrix statistics
  const matrixStats: MatrixStats = useMemo(() => {
    const stats = {
      totalAssignments: 0,
      directAssignments: 0,
      inheritedAssignments: 0,
      modifiedCells: modifiedCells.size,
      conflicts: 0,
      coverage: 0
    };

    matrixCells.forEach(cell => {
      if (cell.hasPermission) {
        stats.totalAssignments++;
        if (cell.source === 'direct') stats.directAssignments++;
        if (cell.source === 'inherited') stats.inheritedAssignments++;
      }
      if (cell.isConflicting) stats.conflicts++;
    });

    const totalPossible = filteredRoles.length * filteredPermissions.length;
    stats.coverage = totalPossible > 0 ? (stats.totalAssignments / totalPossible) * 100 : 0;

    return stats;
  }, [matrixCells, modifiedCells, filteredRoles.length, filteredPermissions.length]);

  // Handle cell click
  const handleCellClick = useCallback((roleId: number, permissionId: number) => {
    if (readOnly || !hasPermission('rbac.permission.assign')) {
      return;
    }

    const key = getCellKey(roleId, permissionId);
    const currentCell = matrixCells.get(key);
    const currentModified = modifiedCells.get(key);

    // Determine the new state
    const originalHasPermission = currentCell?.hasPermission || false;
    const currentHasPermission = currentModified?.hasPermission ?? originalHasPermission;
    const newHasPermission = !currentHasPermission;

    // Create or update modified cell
    const newCell: MatrixCell = {
      roleId,
      permissionId,
      hasPermission: newHasPermission,
      source: newHasPermission ? 'direct' : currentCell?.source || 'direct',
      isModified: newHasPermission !== originalHasPermission,
      isConflicting: false
    };

    if (newCell.isModified) {
      setModifiedCells(prev => new Map(prev.set(key, newCell)));
    } else {
      setModifiedCells(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }

    // Update visual state immediately
    setMatrixCells(prev => new Map(prev.set(key, {
      ...currentCell,
      hasPermission: newHasPermission,
      isModified: newCell.isModified
    } as MatrixCell)));

  }, [readOnly, hasPermission, matrixCells, modifiedCells]);

  // Handle bulk operations
  const handleBulkAssign = useCallback(async () => {
    if (!hasPermission('rbac.permission.assign') || selectionState.selectedCells.size === 0) {
      return;
    }

    const updates: Array<{ roleId: number; permissionId: number; hasPermission: boolean }> = [];
    
    selectionState.selectedCells.forEach(cellKey => {
      const [roleId, permissionId] = cellKey.split('-').map(Number);
      updates.push({ roleId, permissionId, hasPermission: true });
    });

    await applyBulkUpdates(updates);
  }, [hasPermission, selectionState.selectedCells]);

  const handleBulkRevoke = useCallback(async () => {
    if (!hasPermission('rbac.permission.assign') || selectionState.selectedCells.size === 0) {
      return;
    }

    const updates: Array<{ roleId: number; permissionId: number; hasPermission: boolean }> = [];
    
    selectionState.selectedCells.forEach(cellKey => {
      const [roleId, permissionId] = cellKey.split('-').map(Number);
      updates.push({ roleId, permissionId, hasPermission: false });
    });

    await applyBulkUpdates(updates);
  }, [hasPermission, selectionState.selectedCells]);

  const applyBulkUpdates = async (updates: Array<{ roleId: number; permissionId: number; hasPermission: boolean }>) => {
    try {
      // Apply updates to modified cells
      const newModifiedCells = new Map(modifiedCells);
      
      updates.forEach(({ roleId, permissionId, hasPermission }) => {
        const key = getCellKey(roleId, permissionId);
        const originalCell = matrixCells.get(key);
        const originalHasPermission = originalCell?.hasPermission || false;
        
        if (hasPermission !== originalHasPermission) {
          newModifiedCells.set(key, {
            roleId,
            permissionId,
            hasPermission,
            source: 'direct',
            isModified: true,
            isConflicting: false
          });
        } else {
          newModifiedCells.delete(key);
        }
      });
      
      setModifiedCells(newModifiedCells);
      
      toast({
        title: 'Bulk Update Applied',
        description: `Updated ${updates.length} permission assignments.`,
      });
    } catch (error) {
      toast({
        title: 'Bulk Update Failed',
        description: 'Failed to apply bulk updates.',
        variant: 'destructive'
      });
    }
  };

  // Handle save changes
  const handleSaveChanges = useCallback(async () => {
    if (modifiedCells.size === 0) {
      return;
    }

    try {
      const bulkActions: PermissionBulkAction[] = [];
      
      // Group changes by role
      const roleUpdates = new Map<number, Array<{ permissionId: number; hasPermission: boolean }>>();
      
      modifiedCells.forEach(cell => {
        if (!roleUpdates.has(cell.roleId)) {
          roleUpdates.set(cell.roleId, []);
        }
        roleUpdates.get(cell.roleId)!.push({
          permissionId: cell.permissionId,
          hasPermission: cell.hasPermission
        });
      });

      // Create bulk actions for each role
      for (const [roleId, updates] of roleUpdates.entries()) {
        const assignPermissions = updates.filter(u => u.hasPermission).map(u => u.permissionId);
        const revokePermissions = updates.filter(u => !u.hasPermission).map(u => u.permissionId);
        
        if (assignPermissions.length > 0) {
          bulkActions.push({
            action: 'assign_to_roles',
            permission_ids: assignPermissions,
            parameters: { role_ids: [roleId] }
          });
        }
        
        if (revokePermissions.length > 0) {
          bulkActions.push({
            action: 'revoke_from_roles',
            permission_ids: revokePermissions,
            parameters: { role_ids: [roleId] }
          });
        }
      }

      // Execute bulk actions
      for (const action of bulkActions) {
        await bulkUpdatePermissions(action);
      }

      // Clear modified cells and reload matrix
      setModifiedCells(new Map());
      await loadMatrixData();
      
      toast({
        title: 'Changes Saved',
        description: `Successfully saved ${modifiedCells.size} permission changes.`,
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save permission changes.',
        variant: 'destructive'
      });
    }
  }, [modifiedCells, bulkUpdatePermissions]);

  // Handle discard changes
  const handleDiscardChanges = useCallback(() => {
    setModifiedCells(new Map());
    loadMatrixData();
    
    toast({
      title: 'Changes Discarded',
      description: 'All unsaved changes have been discarded.',
    });
  }, []);

  // Handle role selection
  const handleRoleSelect = useCallback((roleId: number, selected: boolean) => {
    setSelectionState(prev => {
      const newSelected = new Set(prev.selectedRoles);
      if (selected) {
        newSelected.add(roleId);
      } else {
        newSelected.delete(roleId);
      }
      return { ...prev, selectedRoles: newSelected };
    });
  }, []);

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

  // Handle cell selection
  const handleCellSelect = useCallback((roleId: number, permissionId: number, selected: boolean) => {
    const key = getCellKey(roleId, permissionId);
    setSelectionState(prev => {
      const newSelected = new Set(prev.selectedCells);
      if (selected) {
        newSelected.add(key);
      } else {
        newSelected.delete(key);
      }
      return { ...prev, selectedCells: newSelected };
    });
  }, []);

  // Render matrix cell
  const renderMatrixCell = useCallback((role: Role, permission: Permission) => {
    const key = getCellKey(role.id, permission.id);
    const originalCell = matrixCells.get(key);
    const modifiedCell = modifiedCells.get(key);
    const currentCell = modifiedCell || originalCell;
    
    const hasPermission = currentCell?.hasPermission || false;
    const isModified = currentCell?.isModified || false;
    const isConflicting = currentCell?.isConflicting || false;
    const source = currentCell?.source || 'direct';
    const isSelected = selectionState.selectedCells.has(key);

    let cellColor = '';
    let cellIcon = null;

    if (viewSettings.colorCode) {
      if (hasPermission) {
        if (source === 'direct') {
          cellColor = 'bg-green-100 text-green-800 border-green-200';
        } else if (source === 'inherited') {
          cellColor = 'bg-blue-100 text-blue-800 border-blue-200';
        }
      } else {
        cellColor = 'bg-gray-50 text-gray-400 border-gray-200';
      }
      
      if (isConflicting) {
        cellColor = 'bg-red-100 text-red-800 border-red-200';
      }
      
      if (isModified) {
        cellColor += ' ring-2 ring-yellow-300';
      }
      
      if (isSelected) {
        cellColor += ' ring-2 ring-blue-500';
      }
    }

    if (hasPermission) {
      cellIcon = source === 'inherited' ? <Lock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />;
    }

    return (
      <TooltipProvider key={key}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "relative w-8 h-8 border cursor-pointer flex items-center justify-center transition-all",
                cellColor,
                viewSettings.compactView ? "w-6 h-6" : "w-8 h-8"
              )}
              onClick={() => handleCellClick(role.id, permission.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleCellSelect(role.id, permission.id, !isSelected);
              }}
            >
              {cellIcon}
              {isModified && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
              )}
              {isConflicting && (
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-400 rounded-full" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p className="font-medium">{role.name} → {permission.action}</p>
              <p>Resource: {permission.resource}</p>
              <p>Status: {hasPermission ? 'Granted' : 'Denied'}</p>
              <p>Source: {source}</p>
              {currentCell?.inheritedFrom && (
                <p>Inherited from: {currentCell.inheritedFrom}</p>
              )}
              {isModified && <p className="text-yellow-600">Modified</p>}
              {isConflicting && <p className="text-red-600">Conflicting</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }, [matrixCells, modifiedCells, selectionState.selectedCells, viewSettings, handleCellClick, handleCellSelect]);

  // Render role comparison dialog
  const renderRoleComparison = () => (
    <Dialog open={comparisonState.isOpen} onOpenChange={(open) => setComparisonState(prev => ({ ...prev, isOpen: open }))}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Role Permission Comparison</DialogTitle>
          <DialogDescription>
            Compare permissions between two roles to identify differences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Role A</Label>
              <Select
                value={comparisonState.roleA?.id.toString() || ''}
                onValueChange={(value) => {
                  const role = roles.find(r => r.id === parseInt(value));
                  setComparisonState(prev => ({ ...prev, roleA: role || null }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select first role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Role B</Label>
              <Select
                value={comparisonState.roleB?.id.toString() || ''}
                onValueChange={(value) => {
                  const role = roles.find(r => r.id === parseInt(value));
                  setComparisonState(prev => ({ ...prev, roleB: role || null }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select second role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {comparisonState.roleA && comparisonState.roleB && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Permission Comparison</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-600">Only in {comparisonState.roleA.name}</p>
                  <div className="space-y-1">
                    {/* Comparison logic would go here */}
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-blue-600">Common Permissions</p>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-red-600">Only in {comparisonState.roleB.name}</p>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setComparisonState(prev => ({ ...prev, isOpen: false }))}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={cn("space-y-6", className, isFullscreen && "fixed inset-0 z-50 bg-background p-6")}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Grid className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-semibold">Permission Matrix</h1>
            <p className="text-sm text-muted-foreground">
              Manage role-permission assignments with interactive matrix view
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setComparisonState(prev => ({ ...prev, isOpen: true }))}
          >
             <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadMatrixData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-xl font-bold">{matrixStats.totalAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Direct</p>
                <p className="text-xl font-bold">{matrixStats.directAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Inherited</p>
                <p className="text-xl font-bold">{matrixStats.inheritedAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Modified</p>
                <p className="text-xl font-bold">{matrixStats.modifiedCells}</p>
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
                <p className="text-xl font-bold">{matrixStats.conflicts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Coverage</p>
                <p className="text-xl font-bold">{matrixStats.coverage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={filterState.roleSearch}
                  onChange={(e) => setFilterState(prev => ({ ...prev, roleSearch: e.target.value }))}
                  className="pl-8 w-48"
                />
              </div>
              
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={filterState.permissionSearch}
                  onChange={(e) => setFilterState(prev => ({ ...prev, permissionSearch: e.target.value }))}
                  className="pl-8 w-48"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuCheckboxItem
                    checked={viewSettings.showInherited}
                    onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, showInherited: checked }))}
                  >
                    Show Inherited
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={viewSettings.groupByResource}
                    onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, groupByResource: checked }))}
                  >
                    Group by Resource
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={viewSettings.colorCode}
                    onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, colorCode: checked }))}
                  >
                    Color Coding
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={viewSettings.compactView}
                    onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, compactView: checked }))}
                  >
                    Compact View
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={viewSettings.autoSave}
                    onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, autoSave: checked }))}
                  >
                    Auto Save
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {modifiedCells.size > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleDiscardChanges}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Discard
                  </Button>
                  <Button size="sm" onClick={handleSaveChanges}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes ({modifiedCells.size})
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectionState.selectedCells.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {selectionState.selectedCells.size} cells selected
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkAssign}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Assign All
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkRevoke}>
                  <Square className="h-4 w-4 mr-2" />
                  Revoke All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectionState(prev => ({ ...prev, selectedCells: new Set() }))}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matrix */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <div className="min-w-max">
              {/* Header */}
              <div className="sticky top-0 bg-background z-10 border-b">
                <div className="flex">
                  {/* Corner cell */}
                  <div className="w-48 p-2 border-r bg-muted">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Roles \ Permissions</span>
                    </div>
                  </div>
                  
                  {/* Permission headers */}
                  <div className="flex">
                    {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                      <div key={groupName} className="border-r">
                        <div className="p-2 bg-muted border-b">
                          <div className="flex items-center gap-2">
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
                              className="p-0 h-4 w-4"
                            >
                              {expandedGroups.has(groupName) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                            
                            {React.createElement(getResourceIcon(groupName), { className: "h-4 w-4" })}
                            
                            <span className="text-xs font-medium">{groupName}</span>
                            <Badge variant="outline" className="text-xs">
                              {groupPermissions.length}
                            </Badge>
                          </div>
                        </div>
                        
                        {expandedGroups.has(groupName) && (
                          <div className="flex">
                            {groupPermissions.map(permission => (
                              <div
                                key={permission.id}
                                className="w-8 p-1 border-r border-b bg-muted/50"
                                style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
                              >
                                <div className="text-xs truncate">
                                  {permission.action}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matrix body */}
              <div>
                {filteredRoles.map(role => (
                  <div key={role.id} className="flex border-b">
                    {/* Role header */}
                    <div className="w-48 p-2 border-r bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectionState.selectedRoles.has(role.id)}
                          onCheckedChange={(checked) => handleRoleSelect(role.id, checked === true)}
                        />
                        <Crown className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium truncate">{role.name}</span>
                      </div>
                    </div>
                    
                    {/* Permission cells */}
                    <div className="flex">
                      {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                        <div key={groupName} className="border-r">
                          {expandedGroups.has(groupName) && (
                            <div className="flex">
                              {groupPermissions.map(permission => (
                                <div key={permission.id} className="border-r">
                                  {renderMatrixCell(role, permission)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <span>Direct Permission</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                <Lock className="h-3 w-3 text-blue-600" />
              </div>
              <span>Inherited Permission</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-red-600" />
              </div>
              <span>Conflicting Permission</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-300 rounded" />
              <span>Modified (Unsaved)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Comparison Dialog */}
      {renderRoleComparison()}
    </div>
  );
}