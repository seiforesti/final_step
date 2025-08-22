"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronDown, Plus, Minus, Settings, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';

interface ConditionNode {
  id: string;
  type: 'condition' | 'group' | 'operator';
  value: string;
  field?: string;
  operator?: string;
  targetValue?: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
  children?: ConditionNode[];
  isExpanded?: boolean;
  isActive?: boolean;
  priority?: number;
  metadata?: Record<string, any>;
}

interface ConditionTreeViewProps {
  conditions: ConditionNode[];
  onConditionChange: (conditions: ConditionNode[]) => void;
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
  maxDepth?: number;
  enableEditing?: boolean;
  showMetadata?: boolean;
}

export const ConditionTreeView: React.FC<ConditionTreeViewProps> = ({
  conditions,
  onConditionChange,
  onNodeSelect,
  selectedNodeId,
  maxDepth = 10,
  enableEditing = true,
  showMetadata = false
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = usePermissionCheck();

  const canManageConditions = hasPermission({ action: 'manage', resource: 'condition' });
  const canEditConditions = hasPermission({ action: 'edit', resource: 'condition' });

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const expandAllNodes = useCallback(() => {
    const getAllNodeIds = (nodes: ConditionNode[]): string[] => {
      const ids: string[] = [];
      nodes.forEach(node => {
        ids.push(node.id);
        if (node.children && node.children.length > 0) {
          ids.push(...getAllNodeIds(node.children));
        }
      });
      return ids;
    };
    
    const allIds = getAllNodeIds(conditions);
    setExpandedNodes(new Set(allIds));
  }, [conditions]);

  const collapseAllNodes = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const getNodeIcon = useCallback((node: ConditionNode) => {
    switch (node.type) {
      case 'condition':
        return '🔍';
      case 'group':
        return '📁';
      case 'operator':
        return '⚡';
      default:
        return '📄';
    }
  }, []);

  const getNodeColor = useCallback((node: ConditionNode) => {
    if (!node.isActive) return 'text-muted-foreground';
    
    switch (node.type) {
      case 'condition':
        return 'text-blue-600';
      case 'group':
        return 'text-green-600';
      case 'operator':
        return 'text-purple-600';
      default:
        return 'text-foreground';
    }
  }, []);

  const getNodeBackground = useCallback((node: ConditionNode) => {
    if (selectedNodeId === node.id) {
      return 'bg-primary/10 border-primary/20';
    }
    
    if (!node.isActive) {
      return 'bg-muted/50';
    }
    
    return 'bg-background hover:bg-muted/30';
  }, [selectedNodeId]);

  const renderNode = useCallback((node: ConditionNode, depth: number = 0) => {
    if (depth > maxDepth) return null;

    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const canExpand = hasChildren;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`
            flex items-center space-x-2 p-2 rounded-lg border transition-all cursor-pointer
            ${getNodeBackground(node)}
            ${depth > 0 ? 'ml-6' : ''}
          `}
          onClick={() => onNodeSelect?.(node.id)}
        >
          {/* Expand/Collapse Button */}
          {canExpand ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          {/* Node Icon */}
          <span className="text-lg">{getNodeIcon(node)}</span>

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${getNodeColor(node)}`}>
                {node.type === 'condition' ? (
                  `${node.field} ${node.operator} ${node.targetValue}`
                ) : (
                  node.value
                )}
              </span>
              
              {node.logicalOperator && (
                <Badge variant="outline" className="text-xs">
                  {node.logicalOperator}
                </Badge>
              )}
              
              {node.priority && (
                <Badge variant="secondary" className="text-xs">
                  P{node.priority}
                </Badge>
              )}
              
              {!node.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>

            {/* Metadata Display */}
            {showMetadata && node.metadata && Object.keys(node.metadata).length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <span key={key} className="mr-2">
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Node Actions */}
          {enableEditing && canEditConditions && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle node active state
                  const updateNode = (nodes: ConditionNode[]): ConditionNode[] => {
                    return nodes.map(n => {
                      if (n.id === node.id) {
                        return { ...n, isActive: !n.isActive };
                      }
                      if (n.children) {
                        return { ...n, children: updateNode(n.children) };
                      }
                      return n;
                    });
                  };
                  
                  const updatedConditions = updateNode(conditions);
                  onConditionChange(updatedConditions);
                  
                  toast({
                    title: "Node Updated",
                    description: `Node ${node.isActive ? 'deactivated' : 'activated'} successfully.`,
                    variant: "default"
                  });
                }}
              >
                {node.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open node settings
                  toast({
                    title: "Settings",
                    description: "Node settings functionality would open here.",
                    variant: "default"
                  });
                }}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [
    expandedNodes,
    maxDepth,
    onNodeSelect,
    selectedNodeId,
    enableEditing,
    canEditConditions,
    showMetadata,
    toggleNodeExpansion,
    getNodeIcon,
    getNodeColor,
    getNodeBackground,
    conditions,
    onConditionChange,
    toast
  ]);

  const getTreeStats = useMemo(() => {
    let totalNodes = 0;
    let activeNodes = 0;
    let maxDepthFound = 0;
    let conditionNodes = 0;
    let groupNodes = 0;
    let operatorNodes = 0;

    const traverse = (nodes: ConditionNode[], depth: number) => {
      maxDepthFound = Math.max(maxDepthFound, depth);
      
      nodes.forEach(node => {
        totalNodes++;
        
        if (node.isActive) activeNodes++;
        
        switch (node.type) {
          case 'condition':
            conditionNodes++;
            break;
          case 'group':
            groupNodes++;
            break;
          case 'operator':
            operatorNodes++;
            break;
        }
        
        if (node.children && node.children.length > 0) {
          traverse(node.children, depth + 1);
        }
      });
    };

    traverse(conditions, 0);

    return {
      totalNodes,
      activeNodes,
      inactiveNodes: totalNodes - activeNodes,
      maxDepth: maxDepthFound,
      conditionNodes,
      groupNodes,
      operatorNodes
    };
  }, [conditions]);

  if (!canManageConditions) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to view conditions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Condition Tree View</h3>
          <p className="text-sm text-muted-foreground">
            Visual representation of conditional logic structure
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={expandAllNodes}
          >
            <Plus className="w-4 h-4 mr-1" />
            Expand All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAllNodes}
          >
            <Minus className="w-4 h-4 mr-1" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree Statistics */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{getTreeStats.totalNodes}</div>
                <div className="text-muted-foreground">Total Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getTreeStats.activeNodes}</div>
                <div className="text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{getTreeStats.maxDepth}</div>
                <div className="text-muted-foreground">Max Depth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{getTreeStats.conditionNodes}</div>
                <div className="text-muted-foreground">Conditions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tree Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Condition Tree</span>
            {conditions.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No conditions defined
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conditions.length > 0 ? (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {conditions.map(node => renderNode(node))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <p className="text-lg mb-2">No conditions available</p>
              <p className="text-sm">Start by creating some conditional logic rules</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

