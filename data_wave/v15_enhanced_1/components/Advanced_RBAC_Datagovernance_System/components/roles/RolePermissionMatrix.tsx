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
  Crown,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Target,
  Grid,
  List,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Equal,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Edit,
  Copy,
  Trash2,
  Save,
  RotateCcw,
  Check,
  X,
  Database,
  Server,
  FileText,
  Users,
  Tag,
  Layers
} from 'lucide-react';

import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import {
  Role,
  RolePermissionMatrix as RolePermissionMatrixType,
  RoleBulkAction,
  RoleComparison
} from '../../types/role.types';
import {
  Permission,
  PermissionBulkAction,
  PermissionMatrix,
  PermissionGroup
} from '../../types/permission.types';
import { cn } from '@/lib/utils';

interface RolePermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  onRefresh?: () => void;
  className?: string;
}

interface MatrixCell {
  roleId: number;
  permissionId: number;
  hasPermission: boolean;
  source: 'direct' | 'inherited' | 'none';
  sourceRole?: Role;
  isModified: boolean;
  isConflicting: boolean;
  canModify: boolean;
}

interface ViewSettings {
  showInherited: boolean;
  showEmpty: boolean;
  groupByResource: boolean;
  colorCode: boolean;
  compactView: boolean;
  autoSave: boolean;
}

interface FilterSettings {
  roleSearch: string;
  permissionSearch: string;
  resourceFilter: string[];
  actionFilter: string[];
  sourceFilter: ('direct' | 'inherited')[];
  conflictsOnly: boolean;
  modifiedOnly: boolean;
}

interface BulkOperation {
  type: 'assign' | 'revoke' | 'copy' | 'clear';
  selectedRoles: Set<number>;
  selectedPermissions: Set<number>;
  sourceRole?: number;
}

export default function RolePermissionMatrix({
  roles,
  permissions,
  onRefresh,
  className
}: RolePermissionMatrixProps) {
  const { user, hasPermission } = useAuth();
  const {
    updateRolePermissions,
    bulkUpdateRolePermissions,
    compareRoles,
    validateRolePermissions,
    getPermissionMatrix
  } = useRoles();
  const {
    bulkUpdatePermissions,
    getPermissionsByGroup,
    validatePermissionAssignment
  } = usePermissions();
  const { toast } = useToast();

  // State management
  const [matrixData, setMatrixData] = useState<MatrixCell[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // View and filter settings
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    showInherited: true,
    showEmpty: false,
    groupByResource: true,
    colorCode: true,
    compactView: false,
    autoSave: false
  });
  
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    roleSearch: '',
    permissionSearch: '',
    resourceFilter: [],
    actionFilter: [],
    sourceFilter: ['direct', 'inherited'],
    conflictsOnly: false,
    modifiedOnly: false
  });

  // Selection and bulk operations
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null);
  
  // UI state
  const [viewMode, setViewMode] = useState<'matrix' | 'list' | 'chart'>('matrix');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [compareRoleIds, setCompareRoleIds] = useState<[number, number] | null>(null);
  const [roleComparison, setRoleComparison] = useState<RoleComparison | null>(null);

  // Initialize matrix data
  useEffect(() => {
    buildMatrixData();
  }, [roles, permissions]);

  const buildMatrixData = useCallback(async () => {
    if (roles.length === 0 || permissions.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const matrix = await getPermissionMatrix();
      
      const matrixCells: MatrixCell[] = [];
      
      for (const role of roles) {
        for (const permission of permissions) {
          const matrixEntry = matrix.matrix.find(
            entry => entry.role_id === role.id && entry.permission_id === permission.id
          );
          
          matrixCells.push({
            roleId: role.id,
            permissionId: permission.id,
            hasPermission: matrixEntry?.has_permission || false,
            source: matrixEntry?.source || 'none',
            sourceRole: matrixEntry?.source_role,
            isModified: false,
            isConflicting: false,
            canModify: hasPermission('rbac.role.edit') && matrixEntry?.source === 'direct'
          });
        }
      }
      
      setMatrixData(matrixCells);
    } catch (error) {
      console.error('Failed to build matrix data:', error);
      toast({
        title: 'Matrix Load Failed',
        description: 'Failed to load permission matrix data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [roles, permissions, getPermissionMatrix, hasPermission, toast]);

  // Filter and group permissions by resource
  const groupedPermissions = useMemo(() => {
    const filtered = permissions.filter(permission => {
      const matchesSearch = !filterSettings.permissionSearch ||
        permission.action.toLowerCase().includes(filterSettings.permissionSearch.toLowerCase()) ||
        permission.resource.toLowerCase().includes(filterSettings.permissionSearch.toLowerCase());
      
      const matchesResource = filterSettings.resourceFilter.length === 0 ||
        filterSettings.resourceFilter.includes(permission.resource.split('.')[0]);
      
      const matchesAction = filterSettings.actionFilter.length === 0 ||
        filterSettings.actionFilter.includes(permission.action);
      
      return matchesSearch && matchesResource && matchesAction;
    });

    if (!viewSettings.groupByResource) {
      return { 'All Permissions': filtered };
    }

    return filtered.reduce((groups, permission) => {
      const resource = permission.resource.split('.')[0] || 'Other';
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  }, [permissions, filterSettings, viewSettings.groupByResource]);

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = !filterSettings.roleSearch ||
        role.name.toLowerCase().includes(filterSettings.roleSearch.toLowerCase()) ||
        role.description?.toLowerCase().includes(filterSettings.roleSearch.toLowerCase());
      
      return matchesSearch;
    });
  }, [roles, filterSettings.roleSearch]);

  // Handle cell value change
  const handleCellChange = useCallback((roleId: number, permissionId: number, value: boolean) => {
    setMatrixData(prev => prev.map(cell => {
      if (cell.roleId === roleId && cell.permissionId === permissionId) {
        return {
          ...cell,
          hasPermission: value,
          isModified: true
        };
      }
      return cell;
    }));
    
    setHasChanges(true);
    
    if (viewSettings.autoSave) {
      handleSaveChanges();
    }
  }, [viewSettings.autoSave]);

  // Handle role selection
  const handleRoleSelect = useCallback((roleId: number, selected: boolean) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(roleId);
      } else {
        newSet.delete(roleId);
      }
      return newSet;
    });
  }, []);

  // Handle permission selection
  const handlePermissionSelect = useCallback((permissionId: number, selected: boolean) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(permissionId);
      } else {
        newSet.delete(permissionId);
      }
      return newSet;
    });
  }, []);

  // Handle bulk operations
  const handleBulkAssign = useCallback(() => {
    if (selectedRoles.size === 0 || selectedPermissions.size === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select roles and permissions for bulk assignment.',
        variant: 'destructive'
      });
      return;
    }

    setBulkOperation({
      type: 'assign',
      selectedRoles,
      selectedPermissions
    });
    setShowBulkDialog(true);
  }, [selectedRoles, selectedPermissions, toast]);

  const handleBulkRevoke = useCallback(() => {
    if (selectedRoles.size === 0 || selectedPermissions.size === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select roles and permissions for bulk revocation.',
        variant: 'destructive'
      });
      return;
    }

    setBulkOperation({
      type: 'revoke',
      selectedRoles,
      selectedPermissions
    });
    setShowBulkDialog(true);
  }, [selectedRoles, selectedPermissions, toast]);

  const executeBulkOperation = async () => {
    if (!bulkOperation) return;
    
    setIsLoading(true);
    
    try {
      const operations = Array.from(bulkOperation.selectedRoles).flatMap(roleId =>
        Array.from(bulkOperation.selectedPermissions).map(permissionId => ({
          roleId,
          permissionId,
          action: bulkOperation.type as 'assign' | 'revoke'
        }))
      );

      await bulkUpdateRolePermissions(operations);
      
      toast({
        title: 'Bulk Operation Complete',
        description: `Successfully ${bulkOperation.type}ed permissions for ${bulkOperation.selectedRoles.size} roles.`,
      });
      
      await buildMatrixData();
      onRefresh?.();
      setShowBulkDialog(false);
      setBulkOperation(null);
    } catch (error) {
      toast({
        title: 'Bulk Operation Failed',
        description: error instanceof Error ? error.message : 'Failed to execute bulk operation.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    const changes = matrixData.filter(cell => cell.isModified);
    
    if (changes.length === 0) {
      toast({
        title: 'No Changes',
        description: 'No changes to save.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const operations = changes.map(cell => ({
        roleId: cell.roleId,
        permissionId: cell.permissionId,
        action: cell.hasPermission ? 'assign' : 'revoke' as 'assign' | 'revoke'
      }));

      await bulkUpdateRolePermissions(operations);
      
      // Reset modified flags
      setMatrixData(prev => prev.map(cell => ({ ...cell, isModified: false })));
      setHasChanges(false);
      
      toast({
        title: 'Changes Saved',
        description: `Successfully saved ${changes.length} permission changes.`,
      });
      
      onRefresh?.();
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save changes.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setMatrixData(prev => prev.map(cell => ({
      ...cell,
      isModified: false,
      hasPermission: cell.isModified ? !cell.hasPermission : cell.hasPermission
    })));
    setHasChanges(false);
    
    toast({
      title: 'Changes Discarded',
      description: 'All unsaved changes have been discarded.',
    });
  };

  // Handle role comparison
  const handleCompareRoles = async () => {
    if (!compareRoleIds) return;
    
    try {
      const comparison = await compareRoles(compareRoleIds[0], compareRoleIds[1]);
      setRoleComparison(comparison);
    } catch (error) {
      toast({
        title: 'Comparison Failed',
        description: 'Failed to compare roles.',
        variant: 'destructive'
      });
    }
  };

  // Get cell data
  const getCellData = useCallback((roleId: number, permissionId: number): MatrixCell | undefined => {
    return matrixData.find(cell => cell.roleId === roleId && cell.permissionId === permissionId);
  }, [matrixData]);

  // Render matrix cell
  const renderMatrixCell = (roleId: number, permissionId: number) => {
    const cellData = getCellData(roleId, permissionId);
    
    if (!cellData) {
      return <div className="w-8 h-8 border rounded" />;
    }

    const showCell = 
      viewSettings.showEmpty ||
      cellData.hasPermission ||
      filterSettings.sourceFilter.includes(cellData.source as 'direct' | 'inherited');

    if (!showCell) return null;

    const isModified = cellData.isModified;
    const hasPermission = cellData.hasPermission;
    const source = cellData.source;
    const canModify = cellData.canModify;

    return (
      <TooltipProvider key={`${roleId}-${permissionId}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-8 h-8 border rounded cursor-pointer transition-all duration-200 flex items-center justify-center",
                hasPermission ? "bg-green-100 border-green-300" : "bg-gray-50 border-gray-200",
                isModified && "ring-2 ring-blue-500",
                source === 'inherited' && "border-dashed",
                !canModify && "cursor-not-allowed opacity-50",
                viewSettings.compactView && "w-6 h-6"
              )}
              onClick={() => {
                if (canModify) {
                  handleCellChange(roleId, permissionId, !hasPermission);
                }
              }}
            >
              {hasPermission ? (
                <Check className={cn("text-green-600", viewSettings.compactView ? "h-3 w-3" : "h-4 w-4")} />
              ) : (
                <X className={cn("text-gray-400", viewSettings.compactView ? "h-3 w-3" : "h-4 w-4")} />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">
                {roles.find(r => r.id === roleId)?.name} - {permissions.find(p => p.id === permissionId)?.action}
              </p>
              <p className="text-xs">
                Source: {source}
                {cellData.sourceRole && ` (${cellData.sourceRole.name})`}
              </p>
              {isModified && <p className="text-xs text-blue-600">Modified</p>}
              {!canModify && <p className="text-xs text-red-600">Read-only</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render matrix view
  const renderMatrixView = () => (
    <div className="space-y-4">
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
              
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={groupPermissions.every(p => selectedPermissions.has(p.id))}
                  onCheckedChange={(checked) => {
                    groupPermissions.forEach(permission => {
                      handlePermissionSelect(permission.id, checked === true);
                    });
                  }}
                />
                <Label className="text-xs text-muted-foreground">Select All</Label>
              </div>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {(expandedGroups.has(groupName) || !viewSettings.groupByResource) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={groupPermissions.every(p => selectedPermissions.has(p.id))}
                              onCheckedChange={(checked) => {
                                groupPermissions.forEach(permission => {
                                  handlePermissionSelect(permission.id, checked === true);
                                });
                              }}
                            />
                          </TableHead>
                          <TableHead className="min-w-[200px]">Permission</TableHead>
                          {filteredRoles.map(role => (
                            <TableHead key={role.id} className="text-center">
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-1">
                                  <Checkbox
                                    checked={selectedRoles.has(role.id)}
                                    onCheckedChange={(checked) => handleRoleSelect(role.id, checked === true)}
                                  />
                                  <Crown className="h-3 w-3" />
                                </div>
                                <div className="text-xs font-medium truncate max-w-[100px]">
                                  {role.name}
                                </div>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupPermissions.map(permission => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedPermissions.has(permission.id)}
                                onCheckedChange={(checked) => handlePermissionSelect(permission.id, checked === true)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{permission.action}</p>
                                <p className="text-xs text-muted-foreground">{permission.resource}</p>
                                {permission.conditions && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Conditional
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            {filteredRoles.map(role => (
                              <TableCell key={role.id} className="text-center">
                                {renderMatrixCell(role.id, permission.id)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
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

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalCells = matrixData.length;
    const assignedCells = matrixData.filter(cell => cell.hasPermission).length;
    const directCells = matrixData.filter(cell => cell.source === 'direct').length;
    const inheritedCells = matrixData.filter(cell => cell.source === 'inherited').length;
    const modifiedCells = matrixData.filter(cell => cell.isModified).length;
    const conflictingCells = matrixData.filter(cell => cell.isConflicting).length;

    return {
      totalCells,
      assignedCells,
      directCells,
      inheritedCells,
      modifiedCells,
      conflictingCells,
      assignmentRate: totalCells > 0 ? (assignedCells / totalCells) * 100 : 0
    };
  }, [matrixData]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Grid className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">Role Permission Matrix</h2>
            <p className="text-sm text-muted-foreground">
              Manage role-permission assignments with matrix view and bulk operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompareDialog(true)}
            disabled={filteredRoles.length < 2}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    value={filterSettings.roleSearch}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, roleSearch: e.target.value }))}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={filterSettings.permissionSearch}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, permissionSearch: e.target.value }))}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflicts-only"
                  checked={filterSettings.conflictsOnly}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({ ...prev, conflictsOnly: checked === true }))}
                />
                <Label htmlFor="conflicts-only" className="text-sm">Conflicts Only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="modified-only"
                  checked={filterSettings.modifiedOnly}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({ ...prev, modifiedOnly: checked === true }))}
                />
                <Label htmlFor="modified-only" className="text-sm">Modified Only</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">View Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-inherited"
                  checked={viewSettings.showInherited}
                  onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, showInherited: checked }))}
                />
                <Label htmlFor="show-inherited" className="text-sm">Show Inherited</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-empty"
                  checked={viewSettings.showEmpty}
                  onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, showEmpty: checked }))}
                />
                <Label htmlFor="show-empty" className="text-sm">Show Empty</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="group-by-resource"
                  checked={viewSettings.groupByResource}
                  onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, groupByResource: checked }))}
                />
                <Label htmlFor="group-by-resource" className="text-sm">Group by Resource</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="compact-view"
                  checked={viewSettings.compactView}
                  onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, compactView: checked }))}
                />
                <Label htmlFor="compact-view" className="text-sm">Compact View</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-save"
                  checked={viewSettings.autoSave}
                  onCheckedChange={(checked) => setViewSettings(prev => ({ ...prev, autoSave: checked }))}
                />
                <Label htmlFor="auto-save" className="text-sm">Auto Save</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Operations */}
      {(selectedRoles.size > 0 || selectedPermissions.size > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {selectedRoles.size} roles selected
                </Badge>
                <Badge variant="outline">
                  {selectedPermissions.size} permissions selected
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkAssign}
                  disabled={selectedRoles.size === 0 || selectedPermissions.size === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Bulk Assign
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRevoke}
                  disabled={selectedRoles.size === 0 || selectedPermissions.size === 0}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Bulk Revoke
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRoles(new Set());
                    setSelectedPermissions(new Set());
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Grid className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Assignments</p>
                <p className="text-2xl font-bold">{statistics.assignedCells}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Direct</p>
                <p className="text-2xl font-bold">{statistics.directCells}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Inherited</p>
                <p className="text-2xl font-bold">{statistics.inheritedCells}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Modified</p>
                <p className="text-2xl font-bold">{statistics.modifiedCells}</p>
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
                <p className="text-2xl font-bold">{statistics.conflictingCells}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Coverage</p>
                <p className="text-2xl font-bold">{statistics.assignmentRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matrix Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permission Matrix
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={viewMode === 'matrix'}
                    onCheckedChange={() => setViewMode('matrix')}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Matrix
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={viewMode === 'list'}
                    onCheckedChange={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={viewMode === 'chart'}
                    onCheckedChange={() => setViewMode('chart')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Chart
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>
            Click cells to assign/revoke permissions. Select multiple roles and permissions for bulk operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            {renderMatrixView()}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Bulk Operation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bulk {bulkOperation?.type === 'assign' ? 'Assign' : 'Revoke'} Permissions
            </DialogTitle>
            <DialogDescription>
              This will {bulkOperation?.type} {selectedPermissions.size} permission(s) 
              {bulkOperation?.type === 'assign' ? ' to ' : ' from '} {selectedRoles.size} role(s).
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Bulk Operation</AlertTitle>
              <AlertDescription>
                This action will affect {selectedRoles.size * selectedPermissions.size} permission assignments.
                Make sure you have reviewed the selection carefully.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={executeBulkOperation}
              disabled={isLoading}
              variant={bulkOperation?.type === 'revoke' ? 'destructive' : 'default'}
            >
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {bulkOperation?.type === 'assign' ? 'Assign' : 'Revoke'} Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Comparison Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare Roles</DialogTitle>
            <DialogDescription>
              Select two roles to compare their permission assignments
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>First Role</Label>
              <Select value={compareRoleIds?.[0]?.toString() || ''} onValueChange={(value) => setCompareRoleIds(prev => [Number(value), prev?.[1] || 0])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first role" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Second Role</Label>
              <Select value={compareRoleIds?.[1]?.toString() || ''} onValueChange={(value) => setCompareRoleIds(prev => [prev?.[0] || 0, Number(value)])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second role" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoles.filter(role => role.id !== compareRoleIds?.[0]).map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {roleComparison && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Common Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {roleComparison.common_permissions.length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{roleComparison.role1.name} Only</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {roleComparison.role1_only_permissions.length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{roleComparison.role2.name} Only</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-600">
                      {roleComparison.role2_only_permissions.length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompareDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleCompareRoles}
              disabled={!compareRoleIds || compareRoleIds[0] === compareRoleIds[1]}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Compare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}