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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TreePine,
  Plus,
  Minus,
  Search,
  Filter,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  GitBranch,
  Network,
  Layers,
  Crown,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Edit,
  Trash2,
  Copy,
  Eye,
  Lock,
  Unlock,
  Zap,
  Target,
  Link,
  Unlink,
  Workflow,
  Gauge
} from 'lucide-react';

import { useRoles } from '../../hooks/useRoles';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import {
  Role,
  RoleHierarchy,
  RoleInheritance as RoleInheritanceType,
  RoleConflict,
  EffectivePermissions
} from '../../types/role.types';
import { Permission } from '../../types/permission.types';
import { cn } from '@/lib/utils';

interface RoleInheritanceProps {
  roles: Role[];
  onRefresh?: () => void;
  selectedRole?: Role | null;
  onRoleSelect?: (role: Role) => void;
  className?: string;
}

interface InheritanceNode {
  role: Role;
  level: number;
  children: InheritanceNode[];
  parent?: InheritanceNode;
  effectivePermissions: Permission[];
  inheritedPermissions: Permission[];
  conflicts: RoleConflict[];
  isExpanded: boolean;
  isSelected: boolean;
}

interface InheritanceConnection {
  parentId: number;
  childId: number;
  isTemporary?: boolean;
  isProposed?: boolean;
}

export default function RoleInheritance({
  roles,
  onRefresh,
  selectedRole,
  onRoleSelect,
  className
}: RoleInheritanceProps) {
  const { user, hasPermission } = useAuth();
  const {
    getRoleHierarchy,
    addRoleInheritance,
    removeRoleInheritance,
    validateInheritance,
    getEffectivePermissions,
    detectInheritanceConflicts,
    optimizeInheritanceTree,
    exportHierarchy,
    importHierarchy
  } = useRoles();
  const { toast } = useToast();

  // State management
  const [hierarchyData, setHierarchyData] = useState<InheritanceNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Set<number>>(new Set());
  const [draggedNode, setDraggedNode] = useState<InheritanceNode | null>(null);
  const [dropTarget, setDropTarget] = useState<InheritanceNode | null>(null);
  const [showConflicts, setShowConflicts] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'matrix' | 'graph'>('tree');
  const [proposedConnections, setProposedConnections] = useState<InheritanceConnection[]>([]);
  
  // Dialog states
  const [showAddInheritanceDialog, setShowAddInheritanceDialog] = useState(false);
  const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState(false);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [parentRoleId, setParentRoleId] = useState<number | null>(null);
  const [childRoleId, setChildRoleId] = useState<number | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<{ parentId: number; childId: number } | null>(null);

  // Build hierarchy tree from roles
  const buildHierarchyTree = useCallback((roles: Role[]): InheritanceNode[] => {
    const nodeMap = new Map<number, InheritanceNode>();
    const rootNodes: InheritanceNode[] = [];

    // Create nodes for all roles
    roles.forEach(role => {
      nodeMap.set(role.id, {
        role,
        level: 0,
        children: [],
        effectivePermissions: role.permissions || [],
        inheritedPermissions: [],
        conflicts: [],
        isExpanded: true,
        isSelected: selectedRole?.id === role.id
      });
    });

    // Build parent-child relationships
    roles.forEach(role => {
      const node = nodeMap.get(role.id);
      if (!node) return;

      if (role.parents && role.parents.length > 0) {
        role.parents.forEach(parent => {
          const parentNode = nodeMap.get(parent.id);
          if (parentNode) {
            parentNode.children.push(node);
            node.parent = parentNode;
            node.level = parentNode.level + 1;
          }
        });
      } else {
        rootNodes.push(node);
      }
    });

    // Calculate levels and effective permissions
    const calculateLevelsAndPermissions = (node: InheritanceNode, level: number = 0) => {
      node.level = level;
      
      // Calculate inherited permissions
      const inherited = new Set<Permission>();
      if (node.parent) {
        node.parent.effectivePermissions.forEach(p => inherited.add(p));
        node.parent.inheritedPermissions.forEach(p => inherited.add(p));
      }
      node.inheritedPermissions = Array.from(inherited);
      
      // Calculate effective permissions (direct + inherited)
      const effective = new Set([...node.role.permissions || [], ...node.inheritedPermissions]);
      node.effectivePermissions = Array.from(effective);

      node.children.forEach(child => calculateLevelsAndPermissions(child, level + 1));
    };

    rootNodes.forEach(node => calculateLevelsAndPermissions(node));

    return rootNodes;
  }, [selectedRole]);

  // Initialize hierarchy data
  useEffect(() => {
    if (roles.length > 0) {
      const hierarchy = buildHierarchyTree(roles);
      setHierarchyData(hierarchy);
    }
  }, [roles, buildHierarchyTree]);

  // Detect and set conflicts
  useEffect(() => {
    const detectConflicts = async () => {
      if (hierarchyData.length === 0) return;
      
      try {
        const allConflicts = await detectInheritanceConflicts();
        
        // Map conflicts to nodes
        setHierarchyData(prev => 
          prev.map(node => updateNodeConflicts(node, allConflicts))
        );
      } catch (error) {
        console.error('Failed to detect conflicts:', error);
      }
    };

    detectConflicts();
  }, [hierarchyData.length, detectInheritanceConflicts]);

  const updateNodeConflicts = (node: InheritanceNode, allConflicts: RoleConflict[]): InheritanceNode => {
    const nodeConflicts = allConflicts.filter(conflict => 
      conflict.affected_roles.some(role => role.id === node.role.id)
    );
    
    return {
      ...node,
      conflicts: nodeConflicts,
      children: node.children.map(child => updateNodeConflicts(child, allConflicts))
    };
  };

  // Filter and search functionality
  const filteredHierarchy = useMemo(() => {
    if (!searchTerm && filterLevel === null) return hierarchyData;

    const filterNode = (node: InheritanceNode): InheritanceNode | null => {
      const matchesSearch = searchTerm === '' || 
        node.role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.role.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = filterLevel === null || node.level === filterLevel;
      
      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(child => child !== null) as InheritanceNode[];

      if (matchesSearch && matchesLevel) {
        return { ...node, children: filteredChildren };
      } else if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }

      return null;
    };

    return hierarchyData
      .map(node => filterNode(node))
      .filter(node => node !== null) as InheritanceNode[];
  }, [hierarchyData, searchTerm, filterLevel]);

  // Handle node selection
  const handleNodeSelect = useCallback((node: InheritanceNode) => {
    if (selectedNodes.has(node.role.id)) {
      setSelectedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(node.role.id);
        return newSet;
      });
    } else {
      setSelectedNodes(prev => new Set([...prev, node.role.id]));
    }
    
    onRoleSelect?.(node.role);
  }, [selectedNodes, onRoleSelect]);

  // Handle node expansion
  const handleNodeToggle = useCallback((nodeId: number) => {
    setHierarchyData(prev => 
      prev.map(node => toggleNodeExpansion(node, nodeId))
    );
  }, []);

  const toggleNodeExpansion = (node: InheritanceNode, targetId: number): InheritanceNode => {
    if (node.role.id === targetId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    
    return {
      ...node,
      children: node.children.map(child => toggleNodeExpansion(child, targetId))
    };
  };

  // Handle drag and drop
  const handleDragStart = useCallback((node: InheritanceNode) => {
    if (!hasPermission('rbac.role.manage')) return;
    setDraggedNode(node);
  }, [hasPermission]);

  const handleDragOver = useCallback((e: React.DragEvent, node: InheritanceNode) => {
    e.preventDefault();
    if (draggedNode && draggedNode.role.id !== node.role.id) {
      setDropTarget(node);
    }
  }, [draggedNode]);

  const handleDrop = useCallback((e: React.DragEvent, targetNode: InheritanceNode) => {
    e.preventDefault();
    
    if (!draggedNode || !hasPermission('rbac.role.manage')) return;
    
    // Validate the inheritance relationship
    if (draggedNode.role.id === targetNode.role.id) return;
    
    // Check for circular dependency
    if (wouldCreateCircularDependency(draggedNode.role.id, targetNode.role.id)) {
      toast({
        title: 'Invalid Operation',
        description: 'This would create a circular dependency.',
        variant: 'destructive'
      });
      return;
    }

    // Add proposed connection
    setProposedConnections(prev => [
      ...prev,
      { parentId: targetNode.role.id, childId: draggedNode.role.id, isProposed: true }
    ]);

    setDraggedNode(null);
    setDropTarget(null);
  }, [draggedNode, hasPermission, toast]);

  const wouldCreateCircularDependency = (childId: number, parentId: number): boolean => {
    // Check if making parentId a parent of childId would create a circle
    const checkPath = (currentId: number, targetId: number, visited: Set<number>): boolean => {
      if (visited.has(currentId)) return true;
      if (currentId === targetId) return true;
      
      visited.add(currentId);
      
      const currentRole = roles.find(r => r.id === currentId);
      if (currentRole?.children) {
        return currentRole.children.some(child => 
          checkPath(child.id, targetId, new Set(visited))
        );
      }
      
      return false;
    };

    return checkPath(parentId, childId, new Set());
  };

  // Handle inheritance operations
  const handleAddInheritance = async () => {
    if (!parentRoleId || !childRoleId) return;
    
    if (!hasPermission('rbac.role.manage')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to modify role inheritance.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Validate the inheritance first
      const validation = await validateInheritance(parentRoleId, childRoleId);
      
      if (!validation.is_valid) {
        toast({
          title: 'Invalid Inheritance',
          description: validation.errors.join(', '),
          variant: 'destructive'
        });
        return;
      }

      await addRoleInheritance(parentRoleId, childRoleId);
      
      toast({
        title: 'Inheritance Added',
        description: 'Role inheritance relationship has been created successfully.',
      });
      
      onRefresh?.();
      setShowAddInheritanceDialog(false);
      setParentRoleId(null);
      setChildRoleId(null);
    } catch (error) {
      toast({
        title: 'Operation Failed',
        description: error instanceof Error ? error.message : 'Failed to add inheritance.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveInheritance = async () => {
    if (!pendingRemoval) return;
    
    if (!hasPermission('rbac.role.manage')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to modify role inheritance.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await removeRoleInheritance(pendingRemoval.parentId, pendingRemoval.childId);
      
      toast({
        title: 'Inheritance Removed',
        description: 'Role inheritance relationship has been removed successfully.',
      });
      
      onRefresh?.();
      setShowRemoveConfirmDialog(false);
      setPendingRemoval(null);
    } catch (error) {
      toast({
        title: 'Operation Failed',
        description: error instanceof Error ? error.message : 'Failed to remove inheritance.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeHierarchy = async () => {
    if (!hasPermission('rbac.role.manage')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to optimize role hierarchy.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const optimization = await optimizeInheritanceTree();
      
      toast({
        title: 'Hierarchy Optimized',
        description: `Optimization complete. ${optimization.changes_made} changes applied.`,
      });
      
      onRefresh?.();
      setShowOptimizeDialog(false);
    } catch (error) {
      toast({
        title: 'Optimization Failed',
        description: error instanceof Error ? error.message : 'Failed to optimize hierarchy.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export/Import functionality
  const handleExportHierarchy = async () => {
    try {
      const exportData = await exportHierarchy();
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `role-hierarchy-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: 'Role hierarchy has been exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export role hierarchy.',
        variant: 'destructive'
      });
    }
  };

  // Render individual node
  const renderNode = (node: InheritanceNode) => {
    const hasConflicts = node.conflicts.length > 0;
    const isSelected = selectedNodes.has(node.role.id);
    const isDropTarget = dropTarget?.role.id === node.role.id;

    return (
      <div key={node.role.id} className="space-y-2">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "group relative border rounded-lg p-3 cursor-pointer transition-all duration-200",
            isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white",
            isDropTarget && "border-green-500 bg-green-50",
            hasConflicts && "border-red-500 bg-red-50",
            "hover:shadow-md"
          )}
          draggable={hasPermission('rbac.role.manage')}
          onDragStart={() => handleDragStart(node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDrop={(e) => handleDrop(e, node)}
          onClick={() => handleNodeSelect(node)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {node.children.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeToggle(node.role.id);
                  }}
                  className="p-1 h-6 w-6"
                >
                  {node.isExpanded ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">{node.role.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {node.role.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Permission counts */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">
                      {node.effectivePermissions.length}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Effective Permissions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {node.inheritedPermissions.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary" className="text-xs">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        {node.inheritedPermissions.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Inherited Permissions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Conflict indicator */}
              {hasConflicts && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{node.conflicts.length} conflict(s) detected</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Level indicator */}
              <Badge variant="outline" className="text-xs">
                L{node.level}
              </Badge>

              {/* Actions menu */}
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
                  <DropdownMenuItem onClick={() => onRoleSelect?.(node.role)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {hasPermission('rbac.role.edit') && (
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                  )}
                  {hasPermission('rbac.role.manage') && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setChildRoleId(node.role.id);
                          setShowAddInheritanceDialog(true);
                        }}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Add Parent
                      </DropdownMenuItem>
                      {node.parent && (
                        <DropdownMenuItem
                          onClick={() => {
                            setPendingRemoval({
                              parentId: node.parent!.role.id,
                              childId: node.role.id
                            });
                            setShowRemoveConfirmDialog(true);
                          }}
                        >
                          <Unlink className="h-4 w-4 mr-2" />
                          Remove Parent
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Conflict details */}
          {hasConflicts && showConflicts && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <p className="text-xs font-medium text-red-600 mb-1">Conflicts:</p>
              {node.conflicts.map((conflict, idx) => (
                <Alert key={idx} variant="destructive" className="text-xs p-2">
                  <AlertTriangle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    {conflict.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Inheritance indicator */}
          {node.parent && (
            <div className="absolute -top-2 left-4 w-px h-4 bg-gray-300"></div>
          )}
        </motion.div>

        {/* Child nodes */}
        <AnimatePresence>
          {node.isExpanded && node.children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-6 border-l-2 border-gray-200 pl-4 space-y-2"
            >
              {node.children.map(child => renderNode(child))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TreePine className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold">Role Inheritance Hierarchy</h2>
            <p className="text-sm text-muted-foreground">
              Manage role inheritance relationships and view the hierarchy tree
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportHierarchy}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {hasPermission('rbac.role.manage') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOptimizeDialog(true)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Optimize
              </Button>

              <Button
                size="sm"
                onClick={() => setShowAddInheritanceDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Inheritance
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={filterLevel?.toString() || 'all'} onValueChange={(value) => setFilterLevel(value === 'all' ? null : parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {Array.from(new Set(hierarchyData.flatMap(node => getAllLevels(node)))).sort().map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConflicts(!showConflicts)}
              className={showConflicts ? "bg-red-50 border-red-200" : ""}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Conflicts
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
        </CardContent>
      </Card>

      {/* Hierarchy Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Inheritance Tree
          </CardTitle>
          <CardDescription>
            Drag and drop roles to create inheritance relationships. 
            {selectedNodes.size > 0 && ` ${selectedNodes.size} role(s) selected.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <div className="space-y-4">
              {filteredHierarchy.length > 0 ? (
                filteredHierarchy.map(node => renderNode(node))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No roles found matching your criteria</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Max Depth</p>
                <p className="text-2xl font-bold">
                  {Math.max(...hierarchyData.flatMap(node => getAllLevels(node)), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Root Roles</p>
                <p className="text-2xl font-bold">{hierarchyData.length}</p>
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
                <p className="text-2xl font-bold">
                  {hierarchyData.reduce((sum, node) => sum + countConflicts(node), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Inheritance Dialog */}
      <Dialog open={showAddInheritanceDialog} onOpenChange={setShowAddInheritanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role Inheritance</DialogTitle>
            <DialogDescription>
              Create a parent-child relationship between roles
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parent-role">Parent Role</Label>
              <Select value={parentRoleId?.toString() || ''} onValueChange={(value) => setParentRoleId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(role => role.id !== childRoleId).map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="child-role">Child Role</Label>
              <Select value={childRoleId?.toString() || ''} onValueChange={(value) => setChildRoleId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select child role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(role => role.id !== parentRoleId).map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddInheritanceDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddInheritance}
              disabled={!parentRoleId || !childRoleId || isLoading}
            >
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Add Inheritance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Inheritance Confirmation Dialog */}
      <Dialog open={showRemoveConfirmDialog} onOpenChange={setShowRemoveConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Role Inheritance</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this inheritance relationship?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveInheritance}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Optimize Hierarchy Dialog */}
      <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimize Role Hierarchy</DialogTitle>
            <DialogDescription>
              This will analyze and optimize the role hierarchy by removing redundant
              inheritance relationships and resolving conflicts.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Optimization Process</AlertTitle>
              <AlertDescription>
                The system will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Remove redundant inheritance relationships</li>
                  <li>Resolve permission conflicts</li>
                  <li>Optimize the hierarchy depth</li>
                  <li>Preserve all effective permissions</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOptimizeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOptimizeHierarchy}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Optimize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function getAllLevels(node: InheritanceNode): number[] {
  return [node.level, ...node.children.flatMap(child => getAllLevels(child))];
}

function countConflicts(node: InheritanceNode): number {
  return node.conflicts.length + node.children.reduce((sum, child) => sum + countConflicts(child), 0);
}