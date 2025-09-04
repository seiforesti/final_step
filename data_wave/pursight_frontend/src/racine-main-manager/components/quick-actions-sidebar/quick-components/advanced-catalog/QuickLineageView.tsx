'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import { GitBranch, Database, Table, BarChart3, FileText, Network, Layers, ArrowRight, ArrowLeft, Target, Search, Filter, RefreshCw, Download, Share, Eye, Settings, X, Maximize, Minimize, ZoomIn, ZoomOut, RotateCw, Play, Pause, AlertTriangle, Info, CheckCircle, Loader2, Clock, User, Tag, Zap, Brain, Sparkles, Activity, TrendingUp, Globe, Shield, Lock, Unlock, ExternalLink, Copy, Edit, Trash, Plus, Minus, MoreHorizontal, ChevronDown, ChevronRight, ChevronUp, MousePointer, Move, Square, Circle, Triangle, Star, Heart, Bookmark, Flag, Calendar, MapPin, Workflow, LinkIcon, Route, TreePine, Boxes, Component, Layers3, Binary, Code, Terminal } from 'lucide-react';

import { useAdvancedCatalog } from '../../../../hooks/useAdvancedCatalog';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';
import { usePipelineManagement } from '../../../../hooks/usePipelineManagement';

interface LineageNode {
  id: string;
  name: string;
  type: 'table' | 'view' | 'pipeline' | 'dashboard' | 'report' | 'api' | 'file';
  status: 'active' | 'deprecated' | 'error' | 'warning';
  metadata: {
    owner: string;
    created: string;
    lastModified: string;
    description?: string;
    tags: string[];
    sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  metrics: {
    usage: number;
    quality: number;
    performance: number;
  };
  position: { x: number; y: number };
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'data_flow' | 'dependency' | 'transformation' | 'reference';
  metadata: {
    transformationType?: string;
    confidence: number;
    lastUpdated: string;
  };
}

interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata: {
    depth: number;
    totalNodes: number;
    totalEdges: number;
    lastUpdated: string;
  };
}

interface QuickLineageViewProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickLineageView: React.FC<QuickLineageViewProps> = ({
  isVisible, onClose, className = '',
}) => {
  // Core State Management
  const [activeTab, setActiveTab] = useState<string>('visual');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [lineageDepth, setLineageDepth] = useState<number>(3);
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);

  // Advanced State
  const [lineageGraph, setLineageGraph] = useState<LineageGraph | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'graph' | 'timeline'>('graph');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showNodeDetails, setShowNodeDetails] = useState(true);
  const [filterCriteria, setFilterCriteria] = useState({
    nodeTypes: ['table', 'view', 'pipeline', 'dashboard'],
    statusTypes: ['active', 'deprecated', 'error', 'warning'],
    sensitivity: ['public', 'internal', 'confidential'],
    dateRange: '7d'
  });

  // Analysis State
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [lineageInsights, setLineageInsights] = useState<any[]>([]);
  const [criticalPaths, setCriticalPaths] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // UI State
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf' | 'json'>('png');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { 
    getDataLineage, 
    getLineageImpactAnalysis,
    getLineageInsights,
    catalogAssets, 
    loading,
    error 
  } = useAdvancedCatalog();
  const { currentWorkspace, workspaceMetrics } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { getAISuggestions, analyzeDataFlow } = useAIAssistant();
  const { getIntegratedLineage } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();
  const { getPipelineLineage } = usePipelineManagement();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    hover: { scale: 1.05, opacity: 1 },
  };

  // Core Logic Functions
  const loadLineageData = useCallback(async () => {
    if (!selectedAsset) return;

    try {
      setIsAnalyzing(true);
      
      // Parallel data fetching
      const [lineageData, impactData, insightsData, integratedData] = await Promise.all([
        getDataLineage(selectedAsset, lineageDepth),
        getLineageImpactAnalysis(selectedAsset),
        getLineageInsights(selectedAsset),
        getIntegratedLineage(selectedAsset, { includeAllGroups: true })
      ]);

      setLineageGraph(lineageData);
      setImpactAnalysis(impactData);
      setLineageInsights(insightsData?.insights || []);
      setCriticalPaths(insightsData?.criticalPaths || []);
      setAnomalies(insightsData?.anomalies || []);

      // AI Analysis
      if (lineageData && currentUser?.preferences?.aiEnabled) {
        const aiAnalysis = await analyzeDataFlow(lineageData);
        setAISuggestions(aiAnalysis?.suggestions || []);
      }

      trackActivity({
        action: 'lineage_data_loaded',
        component: 'QuickLineageView',
        metadata: { 
          assetId: selectedAsset, 
          depth: lineageDepth,
          nodeCount: lineageData?.nodes?.length || 0
        },
      });
    } catch (error) {
      console.error('Failed to load lineage data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedAsset, lineageDepth, currentUser, getDataLineage, getLineageImpactAnalysis, getLineageInsights, getIntegratedLineage, analyzeDataFlow, trackActivity]);

  const handleExport = useCallback(async () => {
    if (!lineageGraph) return;

    setIsExporting(true);
    try {
      // Export logic would be implemented here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate export
      
      trackActivity({
        action: 'lineage_exported',
        component: 'QuickLineageView',
        metadata: { format: exportFormat, nodeCount: lineageGraph.nodes.length },
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [lineageGraph, exportFormat, trackActivity]);

  const handleNodeSelect = useCallback((nodeId: string, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      setSelectedNodes(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    } else {
      setSelectedNodes([nodeId]);
    }
  }, []);

  const findShortestPath = useCallback((sourceId: string, targetId: string) => {
    if (!lineageGraph) return [];
    
    // Simplified path finding logic
    const visited = new Set<string>();
    const queue = [{ nodeId: sourceId, path: [sourceId] }];
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === targetId) {
        setHighlightedPath(path);
        return path;
      }
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      const connectedEdges = lineageGraph.edges.filter(edge => edge.source === nodeId);
      for (const edge of connectedEdges) {
        if (!visited.has(edge.target)) {
          queue.push({ nodeId: edge.target, path: [...path, edge.target] });
        }
      }
    }
    
    return [];
  }, [lineageGraph]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && selectedAsset && isVisible) {
      refreshIntervalRef.current = setInterval(loadLineageData, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, selectedAsset, isVisible, refreshInterval, loadLineageData]);

  // Load data when asset or depth changes
  useEffect(() => {
    if (selectedAsset) {
      loadLineageData();
    }
  }, [selectedAsset, lineageDepth, loadLineageData]);

  // Track component visibility
  useEffect(() => {
    if (isVisible) {
      trackActivity({
        action: 'quick_lineage_view_opened',
        component: 'QuickLineageView',
        metadata: { workspace: currentWorkspace?.id },
      });
    }
  }, [isVisible, currentWorkspace, trackActivity]);

  // Render Functions
  const renderNodeIcon = (type: string, status: string) => {
    const iconProps = { className: "h-4 w-4" };
    const statusColor = status === 'active' ? 'text-green-600' : 
                       status === 'error' ? 'text-red-600' : 
                       status === 'warning' ? 'text-yellow-600' : 'text-gray-400';

    switch (type) {
      case 'table': return <Table {...iconProps} className={`${iconProps.className} ${statusColor}`} />;
      case 'view': return <Eye {...iconProps} className={`${iconProps.className} ${statusColor}`} />;
      case 'pipeline': return <Workflow {...iconProps} className={`${iconProps.className} ${statusColor}`} />;
      case 'dashboard': return <BarChart3 {...iconProps} className={`${iconProps.className} ${statusColor}`} />;
      case 'report': return <FileText {...iconProps} className={`${iconProps.className} ${statusColor}`} />;
      case 'api': return <Globe {...iconProps} className={`${iconProps.className} ${statusColor}`} />;
      case 'file': return <FileText {...iconProps} className={`${iconProps.className} ${statusColor}`} />;
      default: return <Database {...iconProps} className={`${iconProps.className} ${statusColor}`} />;
    }
  };

  const renderVisualTab = () => (
    <div className="space-y-4">
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select asset to trace" />
            </SelectTrigger>
            <SelectContent>
              {catalogAssets?.slice(0, 20).map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  <div className="flex items-center space-x-2">
                    {renderNodeIcon(asset.type, asset.status)}
                    <span>{asset.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh && isAnalyzing ? 'animate-spin' : ''}`} />
                  Auto
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Auto-refresh lineage data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={loadLineageData}
            disabled={isAnalyzing || !selectedAsset}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAISuggestions(true)}
            disabled={!lineageGraph || aiSuggestions.length === 0}
          >
            <Brain className="h-4 w-4 mr-1" />
            AI Insights ({aiSuggestions.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || !lineageGraph}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Export
          </Button>
        </div>
      </div>

      {/* Advanced Canvas */}
      <Card className="border-2 border-dashed border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-sm">Lineage Visualization</CardTitle>
              {lineageGraph && (
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{lineageGraph.nodes.length} nodes</span>
                  <span>{lineageGraph.edges.length} edges</span>
                  <span>Depth: {lineageGraph.metadata.depth}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Selector */}
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graph">Graph</SelectItem>
                  <SelectItem value="tree">Tree</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                </SelectContent>
              </Select>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                  disabled={zoomLevel <= 25}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-xs px-2">{zoomLevel}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  disabled={zoomLevel >= 200}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div 
            ref={canvasRef}
            className="relative h-96 bg-gradient-to-br from-slate-50 to-gray-50 overflow-hidden"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {!selectedAsset ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <GitBranch className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm font-medium">Select an asset to view lineage</p>
                  <p className="text-xs mt-1">Interactive lineage visualization will appear here</p>
                </div>
              </div>
            ) : isAnalyzing ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
                  <p className="text-sm font-medium text-gray-700">Analyzing lineage...</p>
                  <p className="text-xs text-gray-500 mt-1">Tracing data dependencies</p>
                </div>
              </div>
            ) : lineageGraph ? (
              <div className="relative w-full h-full">
                {/* Render Edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {lineageGraph.edges.map((edge) => {
                    const sourceNode = lineageGraph.nodes.find(n => n.id === edge.source);
                    const targetNode = lineageGraph.nodes.find(n => n.id === edge.target);
                    
                    if (!sourceNode || !targetNode) return null;
                    
                    const isHighlighted = highlightedPath.includes(edge.source) && highlightedPath.includes(edge.target);
                    
                    return (
                      <line
                        key={edge.id}
                        x1={sourceNode.position.x + 50}
                        y1={sourceNode.position.y + 25}
                        x2={targetNode.position.x + 50}
                        y2={targetNode.position.y + 25}
                        stroke={isHighlighted ? '#3b82f6' : '#d1d5db'}
                        strokeWidth={isHighlighted ? 3 : 1}
                        markerEnd="url(#arrowhead)"
                        className="transition-all duration-200"
                      />
                    );
                  })}
                  
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#d1d5db"
                      />
                    </marker>
                  </defs>
                </svg>

                {/* Render Nodes */}
                {lineageGraph.nodes.map((node) => {
                  const isSelected = selectedNodes.includes(node.id);
                  const isHighlighted = highlightedPath.includes(node.id);
                  
                  return (
                    <motion.div
                      key={node.id}
                      variants={nodeVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      className={`absolute cursor-pointer ${isSelected ? 'z-20' : 'z-10'}`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                      }}
                      onClick={(e) => handleNodeSelect(node.id, e.ctrlKey || e.metaKey)}
                    >
                      <Card className={`w-24 transition-all duration-200 ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 
                        isHighlighted ? 'ring-2 ring-purple-400' : 'hover:shadow-md'
                      }`}>
                        <CardContent className="p-2">
                          <div className="flex flex-col items-center space-y-1">
                            {renderNodeIcon(node.type, node.status)}
                            <span className="text-xs font-medium text-center truncate w-full">
                              {node.name}
                            </span>
                            <Badge variant="outline" className="text-xs px-1">
                              {node.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No lineage data available</p>
                  <p className="text-xs mt-1">Try selecting a different asset</p>
                </div>
              </div>
            )}

            {/* Minimap */}
            {showMinimap && lineageGraph && (
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">Minimap</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Controls Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lineage Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Slider
                value={[lineageDepth]}
                onValueChange={(value) => setLineageDepth(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span className="font-medium">{lineageDepth} levels</span>
                <span>10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Display Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-impact" className="text-xs">Impact Analysis</Label>
              <Switch
                id="show-impact"
                checked={showImpactAnalysis}
                onCheckedChange={setShowImpactAnalysis}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-minimap" className="text-xs">Minimap</Label>
              <Switch
                id="show-minimap"
                checked={showMinimap}
                onCheckedChange={setShowMinimap}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-details" className="text-xs">Node Details</Label>
              <Switch
                id="show-details"
                checked={showNodeDetails}
                onCheckedChange={setShowNodeDetails}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {lineageGraph ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Assets:</span>
                  <span className="font-medium">{lineageGraph.nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connections:</span>
                  <span className="font-medium">{lineageGraph.edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Depth:</span>
                  <span className="font-medium">{lineageGraph.metadata.depth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(lineageGraph.metadata.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Select an asset to view statistics
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-4">
      {/* Impact Analysis */}
      {impactAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Impact Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Downstream Impact</Label>
                <div className="text-2xl font-bold text-red-600">
                  {impactAnalysis.downstreamCount || 0}
                </div>
                <p className="text-xs text-gray-500">Assets affected</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Upstream Dependencies</Label>
                <div className="text-2xl font-bold text-blue-600">
                  {impactAnalysis.upstreamCount || 0}
                </div>
                <p className="text-xs text-gray-500">Source dependencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Paths */}
      {criticalPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Critical Paths ({criticalPaths.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalPaths.slice(0, 3).map((path, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-900">
                      Path {index + 1}
                    </span>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {path.riskLevel || 'Medium'}
                    </Badge>
                  </div>
                  <p className="text-xs text-orange-700">
                    {path.description || `Critical data flow path with ${path.nodeCount || 0} dependencies`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-6 text-xs"
                    onClick={() => setHighlightedPath(path.nodeIds || [])}
                  >
                    Highlight Path
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span>Detected Anomalies ({anomalies.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.slice(0, 3).map((anomaly, index) => (
                <Alert key={index} className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-sm text-yellow-800">
                    {anomaly.type || 'Data Anomaly'}
                  </AlertTitle>
                  <AlertDescription className="text-xs text-yellow-700">
                    {anomaly.description || 'Unusual pattern detected in data lineage'}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {lineageInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span>AI-Powered Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lineageInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-purple-100 rounded">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900">
                        {insight.title || 'Optimization Opportunity'}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        {insight.description || 'AI detected potential improvements in your data lineage'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          Confidence: {insight.confidence || 85}%
                        </Badge>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-purple-600">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Auto-Refresh Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Enable Auto-Refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          
          {autoRefresh && (
            <div className="space-y-2">
              <Label className="text-xs">Refresh Interval</Label>
              <Select 
                value={refreshInterval.toString()} 
                onValueChange={(value) => setRefreshInterval(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15000">15 seconds</SelectItem>
                  <SelectItem value="30000">30 seconds</SelectItem>
                  <SelectItem value="60000">1 minute</SelectItem>
                  <SelectItem value="300000">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG Image</SelectItem>
                <SelectItem value="svg">SVG Vector</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filter Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Node Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {['table', 'view', 'pipeline', 'dashboard'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={filterCriteria.nodeTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilterCriteria(prev => ({
                          ...prev,
                          nodeTypes: [...prev.nodeTypes, type]
                        }));
                      } else {
                        setFilterCriteria(prev => ({
                          ...prev,
                          nodeTypes: prev.nodeTypes.filter(t => t !== type)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={type} className="text-xs capitalize">{type}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // AI Suggestions Dialog
  const renderAISuggestionsDialog = () => (
    <Dialog open={showAISuggestions} onOpenChange={setShowAISuggestions}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI-Powered Lineage Insights</span>
          </DialogTitle>
          <DialogDescription>
            Intelligent recommendations for optimizing your data lineage
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <Card key={index} className="border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-900 mb-1">
                        {suggestion.title || 'Optimization Suggestion'}
                      </h4>
                      <p className="text-sm text-purple-700 mb-2">
                        {suggestion.description || 'AI-powered recommendation for your lineage'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          Impact: {suggestion.impact || 'Medium'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Apply Suggestion
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
              <GitBranch className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Lineage Explorer</h3>
              <p className="text-xs text-gray-500">
                {currentWorkspace?.name || 'All Workspaces'} • Advanced Lineage Analysis
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <TabsContent value="visual">{renderVisualTab()}</TabsContent>
              <TabsContent value="analysis">{renderAnalysisTab()}</TabsContent>
              <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {renderAISuggestionsDialog()}
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickLineageView;
