'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
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
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import {
  Folder,
  FolderOpen,
  FolderPlus,
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
  Cable,
  Move,
  GripVertical,
  Maximize2,
  Minimize2,
  RotateCcw,
  FastForward,
  Rewind,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Loader2,
  Expand,
  Shrink
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useResources } from '../../hooks/useResources';
import { useToast } from '@/components/ui/use-toast';
import {
  Resource,
  ResourceTree as ResourceTreeType,
  ResourceNode,
  ResourceHierarchy
} from '../../types/resource.types';
import { cn } from '@/lib copie/utils';

interface ResourceTreeProps {
  resources: Resource[];
  expandedNodes: Set<number>;
  onToggleExpand: (nodeId: number) => void;
  onResourceSelect: (resource: Resource) => void;
  selectedResources: Set<number>;
  onResourceCheck: (resourceId: number, selected: boolean) => void;
  className?: string;
  readOnly?: boolean;
  showCheckboxes?: boolean;
  showActions?: boolean;
  dragEnabled?: boolean;
  onResourceMove?: (resourceId: number, newParentId: number | null) => void;
  onResourceDrop?: (draggedId: number, droppedOnId: number, position: 'before' | 'after' | 'inside') => void;
}

interface TreeNode {
  id: number;
  resource: Resource;
  children: TreeNode[];
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isVisible: boolean;
  hasChildren: boolean;
  parent?: TreeNode;
}

interface TreeState {
  filter: string;
  showOnlyWithChildren: boolean;
  showOnlySelected: boolean;
  autoExpand: boolean;
  compactMode: boolean;
  showIcons: boolean;
  showStats: boolean;
  sortBy: 'name' | 'type' | 'created' | 'modified';
  sortOrder: 'asc' | 'desc';
  groupByType: boolean;
  virtualScrolling: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedNode: TreeNode | null;
  dropTarget: TreeNode | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
  ghostPosition: { x: number; y: number } | null;
}

interface TreeStats {
  totalNodes: number;
  expandedNodes: number;
  selectedNodes: number;
  visibleNodes: number;
  maxDepth: number;
  typeDistribution: Record<string, number>;
}

const resourceTypes = [
  { value: 'server', label: 'Server', icon: Server, color: 'bg-blue-500' },
  { value: 'database', label: 'Database', icon: Database, color: 'bg-green-500' },
  { value: 'application', label: 'Application', icon: Monitor, color: 'bg-purple-500' },
  { value: 'storage', label: 'Storage', icon: HardDrive, color: 'bg-orange-500' },
  { value: 'network', label: 'Network', icon: Network, color: 'bg-teal-500' },
  { value: 'file', label: 'File System', icon: FileText, color: 'bg-yellow-500' },
  { value: 'api', label: 'API Endpoint', icon: Globe, color: 'bg-indigo-500' },
  { value: 'workflow', label: 'Workflow', icon: Workflow, color: 'bg-pink-500' },
  { value: 'dataset', label: 'Dataset', icon: BookOpen, color: 'bg-red-500' },
  { value: 'environment', label: 'Environment', icon: Building, color: 'bg-gray-500' }
];

const getResourceIcon = (type: string) => {
  const typeConfig = resourceTypes.find(t => t.value === type);
  return typeConfig?.icon || Folder;
};

const getResourceColor = (type: string) => {
  const typeConfig = resourceTypes.find(t => t.value === type);
  return typeConfig?.color || 'bg-gray-500';
};

export function ResourceTree({
  resources,
  expandedNodes,
  onToggleExpand,
  onResourceSelect,
  selectedResources,
  onResourceCheck,
  className,
  readOnly = false,
  showCheckboxes = true,
  showActions = true,
  dragEnabled = true,
  onResourceMove,
  onResourceDrop
}: ResourceTreeProps) {
  const { user, hasPermission } = useAuth();
  const { 
    moveResource, 
    updateResourceHierarchy,
    getResourceChildren,
    getResourceAncestors
  } = useResources();
  const { toast } = useToast();

  // State management
  const [treeState, setTreeState] = useState<TreeState>({
    filter: '',
    showOnlyWithChildren: false,
    showOnlySelected: false,
    autoExpand: false,
    compactMode: false,
    showIcons: true,
    showStats: true,
    sortBy: 'name',
    sortOrder: 'asc',
    groupByType: false,
    virtualScrolling: false
  });

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNode: null,
    dropTarget: null,
    dropPosition: null,
    ghostPosition: null
  });

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    resource: Resource | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    resource: null
  });

  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [focusedNode, setFocusedNode] = useState<number | null>(null);
  const [animationQueue, setAnimationQueue] = useState<Set<number>>(new Set());

  const treeContainerRef = useRef<HTMLDivElement>(null);
  const virtualScrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Build tree structure from flat resource list
  const treeNodes = useMemo(() => {
    const nodeMap = new Map<number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create all nodes first
    resources.forEach(resource => {
      const node: TreeNode = {
        id: resource.id,
        resource,
        children: [],
        level: 0,
        isExpanded: expandedNodes.has(resource.id),
        isSelected: selectedResources.has(resource.id),
        isVisible: true,
        hasChildren: false,
        parent: undefined
      };
      nodeMap.set(resource.id, node);
    });

    // Build hierarchy
    resources.forEach(resource => {
      const node = nodeMap.get(resource.id)!;
      
      if (resource.parent_id && nodeMap.has(resource.parent_id)) {
        const parent = nodeMap.get(resource.parent_id)!;
        parent.children.push(node);
        node.parent = parent;
        node.level = parent.level + 1;
        parent.hasChildren = true;
      } else {
        rootNodes.push(node);
      }
    });

    // Sort nodes
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (treeState.sortBy) {
          case 'name':
            aValue = a.resource.name.toLowerCase();
            bValue = b.resource.name.toLowerCase();
            break;
          case 'type':
            aValue = a.resource.type;
            bValue = b.resource.type;
            break;
          case 'created':
            aValue = new Date(a.resource.created_at);
            bValue = new Date(b.resource.created_at);
            break;
          case 'modified':
            aValue = new Date(a.resource.updated_at);
            bValue = new Date(b.resource.updated_at);
            break;
          default:
            aValue = a.resource.id;
            bValue = b.resource.id;
        }

        if (aValue < bValue) return treeState.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return treeState.sortOrder === 'asc' ? 1 : -1;
        return 0;
      }).map(node => ({
        ...node,
        children: sortNodes(node.children)
      }));
    };

    return sortNodes(rootNodes);
  }, [resources, expandedNodes, selectedResources, treeState.sortBy, treeState.sortOrder]);

  // Calculate tree statistics
  const treeStats: TreeStats = useMemo(() => {
    const stats: TreeStats = {
      totalNodes: resources.length,
      expandedNodes: expandedNodes.size,
      selectedNodes: selectedResources.size,
      visibleNodes: 0,
      maxDepth: 0,
      typeDistribution: {}
    };

    const calculateStats = (nodes: TreeNode[], depth = 0) => {
      nodes.forEach(node => {
        if (node.isVisible) {
          stats.visibleNodes++;
        }
        
        stats.maxDepth = Math.max(stats.maxDepth, depth);
        
        const type = node.resource.type;
        stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1;
        
        if (node.isExpanded && node.children.length > 0) {
          calculateStats(node.children, depth + 1);
        }
      });
    };

    calculateStats(treeNodes);
    return stats;
  }, [treeNodes, resources.length, expandedNodes.size, selectedResources.size]);

  // Filter tree nodes based on current filter
  const filteredTreeNodes = useMemo(() => {
    if (!treeState.filter && !treeState.showOnlyWithChildren && !treeState.showOnlySelected) {
      return treeNodes;
    }

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matchesFilter = !treeState.filter || 
        node.resource.name.toLowerCase().includes(treeState.filter.toLowerCase()) ||
        node.resource.description?.toLowerCase().includes(treeState.filter.toLowerCase()) ||
        node.resource.type.toLowerCase().includes(treeState.filter.toLowerCase());

      const matchesChildrenFilter = !treeState.showOnlyWithChildren || node.hasChildren;
      const matchesSelectedFilter = !treeState.showOnlySelected || node.isSelected;

      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(Boolean) as TreeNode[];

      const hasMatchingChildren = filteredChildren.length > 0;
      const shouldInclude = (matchesFilter && matchesChildrenFilter && matchesSelectedFilter) || hasMatchingChildren;

      if (shouldInclude) {
        return {
          ...node,
          children: filteredChildren,
          isVisible: matchesFilter && matchesChildrenFilter && matchesSelectedFilter
        };
      }

      return null;
    };

    return treeNodes
      .map(node => filterNode(node))
      .filter(Boolean) as TreeNode[];
  }, [treeNodes, treeState.filter, treeState.showOnlyWithChildren, treeState.showOnlySelected]);

  // Handle node expansion
  const handleToggleExpand = useCallback((nodeId: number) => {
    setAnimationQueue(prev => new Set([...prev, nodeId]));
    onToggleExpand(nodeId);
    
    // Remove from animation queue after animation completes
    setTimeout(() => {
      setAnimationQueue(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
    }, 300);
  }, [onToggleExpand]);

  // Handle expand all/collapse all
  const handleExpandAll = useCallback(() => {
    const getAllNodeIds = (nodes: TreeNode[]): number[] => {
      const ids: number[] = [];
      nodes.forEach(node => {
        if (node.hasChildren) {
          ids.push(node.id);
          ids.push(...getAllNodeIds(node.children));
        }
      });
      return ids;
    };

    const allIds = getAllNodeIds(treeNodes);
    allIds.forEach(id => onToggleExpand(id));
  }, [treeNodes, onToggleExpand]);

  const handleCollapseAll = useCallback(() => {
    Array.from(expandedNodes).forEach(id => onToggleExpand(id));
  }, [expandedNodes, onToggleExpand]);

  // Handle drag and drop
  const handleDragStart = useCallback((node: TreeNode, event: React.MouseEvent) => {
    if (!dragEnabled || readOnly || !hasPermission('rbac.resource.edit')) {
      return;
    }

    setDragState({
      isDragging: true,
      draggedNode: node,
      dropTarget: null,
      dropPosition: null,
      ghostPosition: { x: event.clientX, y: event.clientY }
    });

    event.preventDefault();
  }, [dragEnabled, readOnly, hasPermission]);

  const handleDragOver = useCallback((node: TreeNode, event: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedNode) {
      return;
    }

    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const height = rect.height;

    let position: 'before' | 'after' | 'inside';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }

    setDragState(prev => ({
      ...prev,
      dropTarget: node,
      dropPosition: position,
      ghostPosition: { x: event.clientX, y: event.clientY }
    }));
  }, [dragState.isDragging, dragState.draggedNode]);

  const handleDrop = useCallback(async (event: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedNode || !dragState.dropTarget) {
      return;
    }

    event.preventDefault();

    const { draggedNode, dropTarget, dropPosition } = dragState;

    // Prevent dropping on self or descendants
    const isDescendant = (node: TreeNode, ancestor: TreeNode): boolean => {
      if (node.id === ancestor.id) return true;
      return ancestor.children.some(child => isDescendant(node, child));
    };

    if (isDescendant(dropTarget, draggedNode)) {
      toast({
        title: 'Invalid Move',
        description: 'Cannot move a resource into its own descendant.',
        variant: 'destructive'
      });
      setDragState({
        isDragging: false,
        draggedNode: null,
        dropTarget: null,
        dropPosition: null,
        ghostPosition: null
      });
      return;
    }

    try {
      let newParentId: number | null = null;

      if (dropPosition === 'inside') {
        newParentId = dropTarget.id;
      } else {
        newParentId = dropTarget.parent?.id || null;
      }

      if (onResourceMove) {
        await onResourceMove(draggedNode.id, newParentId);
      } else if (onResourceDrop) {
        await onResourceDrop(draggedNode.id, dropTarget.id, dropPosition);
      } else {
        await moveResource(draggedNode.id, newParentId);
      }

      toast({
        title: 'Resource Moved',
        description: `Successfully moved "${draggedNode.resource.name}".`,
      });
    } catch (error) {
      toast({
        title: 'Move Failed',
        description: error instanceof Error ? error.message : 'Failed to move resource.',
        variant: 'destructive'
      });
    }

    setDragState({
      isDragging: false,
      draggedNode: null,
      dropTarget: null,
      dropPosition: null,
      ghostPosition: null
    });
  }, [dragState, onResourceMove, onResourceDrop, moveResource, toast]);

  // Handle context menu
  const handleContextMenu = useCallback((resource: Resource, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      resource
    });
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusedNode) return;

    const findNode = (nodes: TreeNode[], id: number): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNode(node.children, id);
        if (found) return found;
      }
      return null;
    };

    const getVisibleNodes = (nodes: TreeNode[]): TreeNode[] => {
      const visible: TreeNode[] = [];
      nodes.forEach(node => {
        if (node.isVisible) {
          visible.push(node);
          if (node.isExpanded) {
            visible.push(...getVisibleNodes(node.children));
          }
        }
      });
      return visible;
    };

    const visibleNodes = getVisibleNodes(filteredTreeNodes);
    const currentIndex = visibleNodes.findIndex(node => node.id === focusedNode);

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          setFocusedNode(visibleNodes[currentIndex - 1].id);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < visibleNodes.length - 1) {
          setFocusedNode(visibleNodes[currentIndex + 1].id);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        const currentNode = findNode(filteredTreeNodes, focusedNode);
        if (currentNode && currentNode.hasChildren && !currentNode.isExpanded) {
          handleToggleExpand(focusedNode);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        const focusedNodeData = findNode(filteredTreeNodes, focusedNode);
        if (focusedNodeData && focusedNodeData.isExpanded) {
          handleToggleExpand(focusedNode);
        } else if (focusedNodeData?.parent) {
          setFocusedNode(focusedNodeData.parent.id);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const selectedNode = findNode(filteredTreeNodes, focusedNode);
        if (selectedNode) {
          onResourceSelect(selectedNode.resource);
        }
        break;
    }
  }, [focusedNode, filteredTreeNodes, handleToggleExpand, onResourceSelect]);

  // Render tree node
  const renderTreeNode = useCallback((node: TreeNode, index: number) => {
    const ResourceIcon = getResourceIcon(node.resource.type);
    const isHovered = hoveredNode === node.id;
    const isFocused = focusedNode === node.id;
    const isAnimating = animationQueue.has(node.id);
    const isDragTarget = dragState.dropTarget?.id === node.id;
    const isDragged = dragState.draggedNode?.id === node.id;

    const nodeClasses = cn(
      "group relative flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200",
      "hover:bg-muted/50 focus:bg-muted focus:outline-none",
      {
        "bg-blue-50 border border-blue-200": node.isSelected,
        "bg-muted/50": isHovered,
        "ring-2 ring-blue-500": isFocused,
        "bg-green-50 border border-green-200": isDragTarget && dragState.dropPosition === 'inside',
        "opacity-50": isDragged,
        "scale-105": isAnimating
      }
    );

    const indentSize = treeState.compactMode ? 12 : 16;
    const paddingLeft = node.level * indentSize;

    return (
      <motion.div
        key={node.id}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, delay: index * 0.01 }}
        className="relative"
        style={{ paddingLeft }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        onFocus={() => setFocusedNode(node.id)}
        onContextMenu={(e) => handleContextMenu(node.resource, e)}
      >
        {/* Drop indicators */}
        {isDragTarget && dragState.dropPosition === 'before' && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
        )}
        {isDragTarget && dragState.dropPosition === 'after' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
        )}

        <div
          className={nodeClasses}
          onClick={() => onResourceSelect(node.resource)}
          onMouseDown={(e) => dragEnabled && handleDragStart(node, e)}
          onMouseOver={(e) => dragState.isDragging && handleDragOver(node, e)}
          onMouseUp={dragState.isDragging ? handleDrop : undefined}
          tabIndex={0}
        >
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {node.hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-4 w-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpand(node.id);
                }}
              >
                {node.isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : (
              <div className="w-3 h-3" />
            )}
          </div>

          {/* Checkbox */}
          {showCheckboxes && (
            <Checkbox
              checked={node.isSelected}
              onCheckedChange={(checked) => onResourceCheck(node.id, checked === true)}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            />
          )}

          {/* Drag Handle */}
          {dragEnabled && !readOnly && (
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-3 w-3 text-muted-foreground cursor-move" />
            </div>
          )}

          {/* Resource Icon */}
          {treeState.showIcons && (
            <div className={cn("flex-shrink-0 p-1 rounded", getResourceColor(node.resource.type))}>
              <ResourceIcon className="h-3 w-3 text-white" />
            </div>
          )}

          {/* Resource Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{node.resource.name}</span>
              
              {!treeState.compactMode && (
                <>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {node.resource.type}
                  </Badge>
                  
                  {node.resource.status === 'archived' && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      Archived
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            {!treeState.compactMode && node.resource.description && (
              <p className="text-xs text-muted-foreground truncate">
                {node.resource.description}
              </p>
            )}
          </div>

          {/* Stats */}
          {treeState.showStats && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
              {node.resource.roles && node.resource.roles.length > 0 && (
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  <span>{node.resource.roles.length}</span>
                </div>
              )}
              
              {node.resource.permissions && node.resource.permissions.length > 0 && (
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>{node.resource.permissions.length}</span>
                </div>
              )}
              
              {node.hasChildren && (
                <div className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  <span>{node.children.length}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && !readOnly && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onResourceSelect(node.resource)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {hasPermission('rbac.resource.edit') && (
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {hasPermission('rbac.resource.create') && (
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Crown className="h-4 w-4 mr-2" />
                    Manage Roles
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Children */}
        <AnimatePresence>
          {node.isExpanded && node.children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 mt-1">
                {node.children.map((child, childIndex) => renderTreeNode(child, childIndex))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [
    hoveredNode,
    focusedNode,
    animationQueue,
    dragState,
    treeState,
    showCheckboxes,
    showActions,
    dragEnabled,
    readOnly,
    onResourceSelect,
    onResourceCheck,
    handleToggleExpand,
    handleContextMenu,
    handleDragStart,
    handleDragOver,
    handleDrop,
    hasPermission
  ]);

  // Render tree controls
  const renderTreeControls = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter resources..."
                value={treeState.filter}
                onChange={(e) => setTreeState(prev => ({ ...prev, filter: e.target.value }))}
                className="pl-8 w-64"
              />
            </div>

            <Select
              value={`${treeState.sortBy}-${treeState.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                setTreeState(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
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
              onClick={handleExpandAll}
              disabled={expandedNodes.size === treeStats.totalNodes}
            >
              <Expand className="h-4 w-4 mr-2" />
              Expand All
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCollapseAll}
              disabled={expandedNodes.size === 0}
            >
              <Shrink className="h-4 w-4 mr-2" />
              Collapse All
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={treeState.compactMode}
                  onCheckedChange={(checked) => setTreeState(prev => ({ ...prev, compactMode: checked }))}
                >
                  Compact Mode
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={treeState.showIcons}
                  onCheckedChange={(checked) => setTreeState(prev => ({ ...prev, showIcons: checked }))}
                >
                  Show Icons
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={treeState.showStats}
                  onCheckedChange={(checked) => setTreeState(prev => ({ ...prev, showStats: checked }))}
                >
                  Show Statistics
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={treeState.showOnlyWithChildren}
                  onCheckedChange={(checked) => setTreeState(prev => ({ ...prev, showOnlyWithChildren: checked }))}
                >
                  Only With Children
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={treeState.showOnlySelected}
                  onCheckedChange={(checked) => setTreeState(prev => ({ ...prev, showOnlySelected: checked }))}
                >
                  Only Selected
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={treeState.autoExpand}
                  onCheckedChange={(checked) => setTreeState(prev => ({ ...prev, autoExpand: checked }))}
                >
                  Auto Expand
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render tree statistics
  const renderTreeStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tree Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{treeStats.totalNodes}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{treeStats.visibleNodes}</p>
            <p className="text-xs text-muted-foreground">Visible</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">{treeStats.expandedNodes}</p>
            <p className="text-xs text-muted-foreground">Expanded</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600">{treeStats.selectedNodes}</p>
            <p className="text-xs text-muted-foreground">Selected</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-600">{treeStats.maxDepth}</p>
            <p className="text-xs text-muted-foreground">Max Depth</p>
          </div>
        </div>

        {Object.keys(treeStats.typeDistribution).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Type Distribution</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(treeStats.typeDistribution).map(([type, count]) => {
                const typeConfig = resourceTypes.find(t => t.value === type);
                const Icon = typeConfig?.icon || Folder;
                return (
                  <Badge key={type} variant="outline" className="text-xs">
                    <Icon className="h-3 w-3 mr-1" />
                    {typeConfig?.label || type}: {count}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tree Controls */}
      {renderTreeControls()}

      {/* Tree Statistics */}
      {treeState.showStats && renderTreeStats()}

      {/* Main Tree */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={treeContainerRef}
            className="relative"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <ScrollArea className="h-[600px] p-4">
              <div className="space-y-1">
                {filteredTreeNodes.length > 0 ? (
                  filteredTreeNodes.map((node, index) => renderTreeNode(node, index))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No Resources Found</h3>
                    <p className="text-sm">
                      {treeState.filter ? 'No resources match your filter criteria.' : 'No resources available to display.'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Drag Ghost */}
            {dragState.isDragging && dragState.ghostPosition && dragState.draggedNode && (
              <div
                className="fixed pointer-events-none z-50 bg-white shadow-lg border rounded p-2 text-sm"
                style={{
                  left: dragState.ghostPosition.x + 10,
                  top: dragState.ghostPosition.y - 10
                }}
              >
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  Moving: {dragState.draggedNode.resource.name}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Resource Actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </ContextMenuItem>
          {hasPermission('rbac.resource.edit') && (
            <ContextMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Resource
            </ContextMenuItem>
          )}
          {hasPermission('rbac.resource.create') && (
            <>
              <ContextMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {resourceTypes.map(type => (
                    <ContextMenuItem key={type.value}>
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </ContextMenuItem>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Crown className="h-4 w-4 mr-2" />
            Manage Roles
          </ContextMenuItem>
          <ContextMenuItem>
            <Shield className="h-4 w-4 mr-2" />
            Manage Permissions
          </ContextMenuItem>
          <ContextMenuSeparator />
          {hasPermission('rbac.resource.delete') && (
            <ContextMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Resource
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}