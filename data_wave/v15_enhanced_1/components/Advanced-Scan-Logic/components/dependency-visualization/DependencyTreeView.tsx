"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronDown, Search, Filter, Eye, EyeOff, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';

interface DependencyTreeNode {
  id: string;
  name: string;
  type: 'workflow' | 'task' | 'resource' | 'service';
  status: 'active' | 'inactive' | 'pending' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  depth: number;
  children: DependencyTreeNode[];
  dependencies: string[];
  dependents: string[];
  metadata?: Record<string, any>;
}

interface DependencyTreeViewProps {
  dependencies: DependencyTreeNode[];
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
  maxDepth?: number;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  showMetadata?: boolean;
}

export const DependencyTreeView: React.FC<DependencyTreeViewProps> = ({
  dependencies,
  onNodeSelect,
  selectedNodeId,
  maxDepth = 10,
  enableSearch = true,
  enableFiltering = true,
  showMetadata = false
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = usePermissionCheck();

  const canViewDependencies = hasPermission({ action: 'read', resource: 'dependency' });
  const canManageDependencies = hasPermission({ action: 'manage', resource: 'dependency' });

  // Filter and search dependencies
  const filteredDependencies = useMemo(() => {
    let filtered = dependencies;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(node => node.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(node => node.status === filterStatus);
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(searchLower) ||
        node.type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [dependencies, filterType, filterStatus, searchTerm]);

  // Toggle node expansion
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

  // Expand all nodes
  const expandAllNodes = useCallback(() => {
    const getAllNodeIds = (nodes: DependencyTreeNode[]): string[] => {
      const ids: string[] = [];
      nodes.forEach(node => {
        ids.push(node.id);
        if (node.children && node.children.length > 0) {
          ids.push(...getAllNodeIds(node.children));
        }
      });
      return ids;
    };
    
    const allIds = getAllNodeIds(filteredDependencies);
    setExpandedNodes(new Set(allIds));
  }, [filteredDependencies]);

  // Collapse all nodes
  const collapseAllNodes = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // Get node icon based on type
  const getNodeIcon = useCallback((node: DependencyTreeNode) => {
    switch (node.type) {
      case 'workflow':
        return '🔄';
      case 'task':
        return '📋';
      case 'resource':
        return '💾';
      case 'service':
        return '⚙️';
      default:
        return '📄';
    }
  }, []);

  // Get node color based on status
  const getNodeColor = useCallback((node: DependencyTreeNode) => {
    if (!node.status) return 'text-muted-foreground';
    
    switch (node.status) {
      case 'active':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'inactive':
        return 'text-gray-600';
      default:
        return 'text-foreground';
    }
  }, []);

  // Get priority color
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Render a single tree node
  const renderTreeNode = useCallback((node: DependencyTreeNode, depth: number = 0) => {
    if (depth > maxDepth) return null;

    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const canExpand = hasChildren;
    const isSelected = selectedNodeId === node.id;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`
            flex items-center space-x-2 p-2 rounded-lg border transition-all cursor-pointer
            ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}
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
                <ChevronRight className="h-4 h-4" />
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
                {node.name}
              </span>
              
              <Badge variant="outline" className="text-xs">
                {node.type}
              </Badge>
              
              <Badge className={`text-xs border ${getPriorityColor(node.priority)}`}>
                {node.priority}
              </Badge>
              
              {node.status && (
                <Badge 
                  variant={node.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {node.status}
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

            {/* Dependency Counts */}
            <div className="text-xs text-muted-foreground mt-1">
              {node.dependencies.length > 0 && (
                <span className="mr-2">📥 {node.dependencies.length} deps</span>
              )}
              {node.dependents.length > 0 && (
                <span>📤 {node.dependents.length} dependents</span>
              )}
            </div>
          </div>
        </div>

        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [
    expandedNodes,
    maxDepth,
    selectedNodeId,
    onNodeSelect,
    toggleNodeExpansion,
    getNodeIcon,
    getNodeColor,
    getPriorityColor,
    showMetadata
  ]);

  // Export tree data
  const exportTreeData = useCallback(() => {
    const treeData = {
      exportDate: new Date().toISOString(),
      totalNodes: dependencies.length,
      filters: {
        type: filterType,
        status: filterStatus,
        searchTerm
      },
      dependencies: filteredDependencies
    };

    const blob = new Blob([JSON.stringify(treeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dependency-tree-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Tree Data Exported",
      description: "Dependency tree data has been exported successfully.",
      variant: "default"
    });
  }, [dependencies, filteredDependencies, filterType, filterStatus, searchTerm, toast]);

  if (!canViewDependencies) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to view dependencies.</p>
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
          <h3 className="text-lg font-semibold">Dependency Tree View</h3>
          <p className="text-sm text-muted-foreground">
            Hierarchical tree representation of workflow dependencies
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
          
          <Button variant="outline" size="sm" onClick={expandAllNodes}>
            <ChevronDown className="w-4 h-4 mr-1" />
            Expand All
          </Button>
          
          <Button variant="outline" size="sm" onClick={collapseAllNodes}>
            <ChevronRight className="w-4 h-4 mr-1" />
            Collapse All
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportTreeData}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              {enableSearch && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search dependencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Type Filter */}
              {enableFiltering && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter by Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="workflow">Workflows</option>
                    <option value="task">Tasks</option>
                    <option value="resource">Resources</option>
                    <option value="service">Services</option>
                  </select>
                </div>
              )}

              {/* Status Filter */}
              {enableFiltering && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tree Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dependency Tree</span>
            <div className="text-sm text-muted-foreground">
              {filteredDependencies.length} of {dependencies.length} nodes
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDependencies.length > 0 ? (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredDependencies.map(node => renderTreeNode(node))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <p className="text-lg mb-2">No dependencies found</p>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create some workflow dependencies to see them here'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tree Statistics */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Tree Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dependencies.length}</div>
                <div className="text-muted-foreground">Total Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dependencies.filter(n => n.status === 'active').length}
                </div>
                <div className="text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {dependencies.filter(n => n.status === 'pending').length}
                </div>
                <div className="text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {dependencies.filter(n => n.status === 'failed').length}
                </div>
                <div className="text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
