"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ZoomIn, ZoomOut, RotateCcw, Download, Eye, EyeOff, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';

interface DependencyNode {
  id: string;
  name: string;
  type: 'workflow' | 'task' | 'resource' | 'service';
  status: 'active' | 'inactive' | 'pending' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  dependents: string[];
  metadata?: Record<string, any>;
  position?: { x: number; y: number };
}

interface DependencyEdge {
  source: string;
  target: string;
  type: 'required' | 'optional' | 'conditional';
  strength: number;
  metadata?: Record<string, any>;
}

interface DependencyGraphVisualizationProps {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  onNodeSelect?: (nodeId: string) => void;
  onEdgeSelect?: (edgeId: string) => void;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  enableInteractions?: boolean;
  showLabels?: boolean;
  layout?: 'force' | 'hierarchical' | 'circular';
}

export const DependencyGraphVisualization: React.FC<DependencyGraphVisualizationProps> = ({
  nodes,
  edges,
  onNodeSelect,
  onEdgeSelect,
  selectedNodeId,
  selectedEdgeId,
  enableInteractions = true,
  showLabels = true,
  layout = 'force'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showDependents, setShowDependents] = useState(true);
  const { toast } = useToast();
  const { hasPermission } = usePermissionCheck();

  const canViewDependencies = hasPermission({ action: 'read', resource: 'dependency' });
  const canManageDependencies = hasPermission({ action: 'manage', resource: 'dependency' });

  // Filter nodes based on current filters
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (filterType !== 'all' && node.type !== filterType) return false;
      if (filterStatus !== 'all' && node.status !== filterStatus) return false;
      return true;
    });
  }, [nodes, filterType, filterStatus]);

  // Filter edges based on filtered nodes
  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(edge => {
      if (!showDependencies && edge.target === selectedNodeId) return false;
      if (!showDependents && edge.source === selectedNodeId) return false;
      return nodeIds.has(edge.source) && nodeIds.has(edge.target);
    });
  }, [edges, filteredNodes, selectedNodeId, showDependencies, showDependents]);

  // Calculate node positions based on layout
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    
    if (layout === 'circular') {
      const centerX = 400;
      const centerY = 300;
      const radius = 200;
      const angleStep = (2 * Math.PI) / filteredNodes.length;
      
      filteredNodes.forEach((node, index) => {
        const angle = index * angleStep;
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });
    } else if (layout === 'hierarchical') {
      // Simple hierarchical layout
      const levels: Record<string, number> = {};
      const visited = new Set<string>();
      
      // Calculate levels based on dependencies
      const calculateLevel = (nodeId: string, level: number = 0): number => {
        if (visited.has(nodeId)) return levels[nodeId] || 0;
        visited.add(nodeId);
        
        const node = filteredNodes.find(n => n.id === nodeId);
        if (!node) return level;
        
        let maxLevel = level;
        node.dependencies.forEach(depId => {
          maxLevel = Math.max(maxLevel, calculateLevel(depId, level + 1));
        });
        
        levels[nodeId] = maxLevel;
        return maxLevel;
      };
      
      filteredNodes.forEach(node => {
        calculateLevel(node.id);
      });
      
      // Position nodes by level
      const levelGroups: Record<number, string[]> = {};
      Object.entries(levels).forEach(([nodeId, level]) => {
        if (!levelGroups[level]) levelGroups[level] = [];
        levelGroups[level].push(nodeId);
      });
      
      Object.entries(levelGroups).forEach(([levelStr, nodeIds]) => {
        const level = parseInt(levelStr);
        const y = 100 + level * 120;
        const xStep = 600 / (nodeIds.length + 1);
        
        nodeIds.forEach((nodeId, index) => {
          positions[nodeId] = {
            x: 100 + (index + 1) * xStep,
            y
          };
        });
      });
    } else {
      // Force layout - use existing positions or generate random ones
      filteredNodes.forEach((node, index) => {
        if (node.position) {
          positions[node.id] = node.position;
        } else {
          positions[node.id] = {
            x: 100 + (index % 10) * 80,
            y: 100 + Math.floor(index / 10) * 80
          };
        }
      });
    }
    
    return positions;
  }, [filteredNodes, layout]);

  // Draw the graph on canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Draw edges
    filteredEdges.forEach(edge => {
      const sourcePos = nodePositions[edge.source];
      const targetPos = nodePositions[edge.target];
      
      if (!sourcePos || !targetPos) return;
      
      // Edge color based on type
      let edgeColor = '#94a3b8';
      let edgeWidth = 1;
      
      if (edge.type === 'required') {
        edgeColor = '#ef4444';
        edgeWidth = 2;
      } else if (edge.type === 'conditional') {
        edgeColor = '#f59e0b';
        edgeWidth = 1.5;
      }
      
      // Highlight selected edge
      if (selectedEdgeId === `${edge.source}-${edge.target}`) {
        edgeColor = '#3b82f6';
        edgeWidth = 3;
      }
      
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = edgeWidth;
      ctx.beginPath();
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      
      // Draw arrow
      const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
      const arrowLength = 10;
      const arrowAngle = Math.PI / 6;
      
      ctx.beginPath();
      ctx.moveTo(targetPos.x, targetPos.y);
      ctx.lineTo(
        targetPos.x - arrowLength * Math.cos(angle - arrowAngle),
        targetPos.y - arrowLength * Math.sin(angle - arrowAngle)
      );
      ctx.moveTo(targetPos.x, targetPos.y);
      ctx.lineTo(
        targetPos.x - arrowLength * Math.cos(angle + arrowAngle),
        targetPos.y - arrowLength * Math.sin(angle + arrowAngle)
      );
      ctx.stroke();
    });
    
    // Draw nodes
    filteredNodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      
      // Node color based on status
      let nodeColor = '#6b7280';
      let borderColor = '#374151';
      
      switch (node.status) {
        case 'active':
          nodeColor = '#10b981';
          borderColor = '#059669';
          break;
        case 'pending':
          nodeColor = '#f59e0b';
          borderColor = '#d97706';
          break;
        case 'failed':
          nodeColor = '#ef4444';
          borderColor = '#dc2626';
          break;
      }
      
      // Highlight selected node
      if (selectedNodeId === node.id) {
        borderColor = '#3b82f6';
        ctx.lineWidth = 3;
      } else {
        ctx.lineWidth = 2;
      }
      
      // Draw node circle
      ctx.fillStyle = nodeColor;
      ctx.strokeStyle = borderColor;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Draw node label
      if (showLabels) {
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, pos.x, pos.y + 35);
        
        // Draw type badge
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Arial';
        ctx.fillText(node.type, pos.x, pos.y + 50);
      }
    });
    
    ctx.restore();
  }, [filteredNodes, filteredEdges, nodePositions, selectedNodeId, selectedEdgeId, showLabels, zoom, pan]);

  // Handle canvas interactions
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enableInteractions) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [enableInteractions, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!enableInteractions) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
  }, [enableInteractions, zoom]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(3, prev * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.1, prev / 1.2));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Export graph
  const exportGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'dependency-graph.png';
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Graph Exported",
      description: "Dependency graph has been exported successfully.",
      variant: "default"
    });
  }, [toast]);

  // Redraw graph when dependencies change
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

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
          <h3 className="text-lg font-semibold">Dependency Graph Visualization</h3>
          <p className="text-sm text-muted-foreground">
            Interactive visualization of workflow dependencies and relationships
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
          
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportGraph}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filter-type">Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="workflow">Workflows</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                    <SelectItem value="resource">Resources</SelectItem>
                    <SelectItem value="service">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-status">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-dependencies"
                  checked={showDependencies}
                  onCheckedChange={setShowDependencies}
                />
                <Label htmlFor="show-dependencies">Show Dependencies</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-dependents"
                  checked={showDependents}
                  onCheckedChange={setShowDependents}
                />
                <Label htmlFor="show-dependents">Show Dependents</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graph Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dependency Graph</span>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{filteredNodes.length} nodes</span>
              <span>•</span>
              <span>{filteredEdges.length} edges</span>
              <span>•</span>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border rounded-lg cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
            />
            
            {filteredNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">No dependencies to visualize</p>
                  <p className="text-sm">Create some workflow dependencies to see them here</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Failed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span>Inactive</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t">
            <h5 className="font-medium mb-2">Edge Types</h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-red-500"></div>
                <span>Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-yellow-500"></div>
                <span>Conditional</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-gray-500"></div>
                <span>Optional</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

