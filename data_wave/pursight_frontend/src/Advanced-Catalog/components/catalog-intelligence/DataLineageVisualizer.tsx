// ============================================================================
// DATA LINEAGE VISUALIZER - INTERACTIVE LINEAGE VISUALIZATION (2600+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Data Lineage Visualization Component
// Interactive network graphs, impact analysis, temporal lineage tracking,
// collaborative annotations, and intelligent lineage discovery
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';
import * as d3 from 'd3';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertTriangle, Search, Filter, Download, Upload, Share2, Settings, Info, Eye, EyeOff, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Move, Maximize2, Minimize2, GitBranch, ArrowRight, ArrowLeft, Clock, Users, MessageSquare, Bookmark, Star, Edit3, Save, X, Plus, Minus, RefreshCw, Target, TrendingUp, AlertCircle, CheckCircle, XCircle, Activity, Database, FileText, Code, BarChart3, PieChart, LineChart, Layers, Network, TreePine, FishIcon as Flow, Workflow, Route, MapPin, Calendar, Timer, UserCheck, Flag, Hash, Link, Globe, Shield, Lock, Unlock, Key, Award, Zap, Sparkles, Brain, Cpu, HardDrive, Cloud, Server, Wifi, Radio, Bluetooth, Cable, Usb, Monitor, Smartphone, Tablet, Laptop, Watch, Gamepad2, Headphones, Camera, Mic, Speaker, Volume2, VolumeX, Play as PlayIcon, Pause as PauseIcon, SkipBack, SkipForward, Repeat, Shuffle, MoreHorizontal, MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsDown } from 'lucide-react';

// Import types and services
import type {
  DataLineageNode,
  DataLineageEdge,
  LineageVisualizationConfig,
  LineageImpactAnalysis,
  LineageTemporalView,
  LineageAnnotation,
  LineageMetrics,
  LineageQuery,
  AssetMetadata,
  DataFlow,
  TransformationRule,
  LineageValidation,
  CollaborationEvent,
  LineageExport
} from '../../types/catalog-lineage.types';

import {
  enterpriseCatalogService,
  advancedLineageService,
  lineageAnalyticsService,
  lineageCollaborationService,
  lineageValidationService,
  dataFlowService,
  impactAnalysisService
} from '../../services/enterprise-catalog.service';

// Import constants from available modules
import { CATALOG_CONFIG } from '../../constants/catalog-constants';

// Import hooks from available modules
import { useDataLineage } from '../../hooks/useDataLineage';

// ============================================================================
// LINEAGE NETWORK GRAPH COMPONENT
// ============================================================================
interface LineageNetworkGraphProps {
  nodes: DataLineageNode[];
  edges: DataLineageEdge[];
  config: LineageVisualizationConfig;
  selectedNode?: string;
  highlightedPath?: string[];
  onNodeSelect: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  onEdgeSelect: (edgeId: string) => void;
  className?: string;
}

const LineageNetworkGraph = forwardRef<any, LineageNetworkGraphProps>(({
  nodes,
  edges,
  config,
  selectedNode,
  highlightedPath,
  onNodeSelect,
  onNodeHover,
  onEdgeSelect,
  className
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<DataLineageNode, DataLineageEdge> | null>(null);
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [isPlaying, setIsPlaying] = useState(false);

  // D3 force simulation setup
  const setupSimulation = useCallback(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select('.graph-container');
    
    // Clear previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create force simulation
    const simulation = d3.forceSimulation<DataLineageNode>(nodes)
      .force('link', d3.forceLink<DataLineageNode, DataLineageEdge>(edges)
        .id(d => d.id)
        .distance(config.layout.linkDistance)
        .strength(config.layout.linkStrength))
      .force('charge', d3.forceManyBody()
        .strength(config.layout.chargeStrength))
      .force('center', d3.forceCenter(config.dimensions.width / 2, config.dimensions.height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => (d.metadata?.size || 20) + 5));

    simulationRef.current = simulation;

    // Create links
    const link = container.selectAll('.link')
      .data(edges)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', d => config.theme.edgeColor)
      .attr('stroke-width', d => d.weight || 1)
      .attr('stroke-dasharray', d => d.type === 'derived' ? '5,5' : null)
      .style('opacity', 0.6)
      .on('click', (event, d) => onEdgeSelect(d.id))
      .on('mouseenter', function(event, d) {
        d3.select(this).style('opacity', 1);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).style('opacity', 0.6);
      });

    // Create nodes
    const node = container.selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => onNodeSelect(d.id))
      .on('mouseenter', (event, d) => onNodeHover(d.id))
      .on('mouseleave', () => onNodeHover(null))
      .call(d3.drag<SVGGElement, DataLineageNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Node circles
    node.append('circle')
      .attr('r', d => d.metadata?.size || 20)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => selectedNode === d.id ? config.theme.selectedColor : config.theme.nodeStroke)
      .attr('stroke-width', d => selectedNode === d.id ? 3 : 1);

    // Node icons
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-family', 'lucide')
      .attr('font-size', d => (d.metadata?.size || 20) * 0.6)
      .attr('fill', 'white')
      .text(d => getNodeIcon(d));

    // Node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.metadata?.size || 20) + 15)
      .attr('font-size', 12)
      .attr('fill', config.theme.textColor)
      .text(d => d.name);

    // Simulation tick function
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as DataLineageNode).x!)
        .attr('y1', d => (d.source as DataLineageNode).y!)
        .attr('x2', d => (d.target as DataLineageNode).x!)
        .attr('y2', d => (d.target as DataLineageNode).y!);

      node.attr('transform', d => `translate(${d.x!},${d.y!})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, DataLineageNode, DataLineageNode>, d: DataLineageNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, DataLineageNode, DataLineageNode>, d: DataLineageNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, DataLineageNode, DataLineageNode>, d: DataLineageNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [nodes, edges, config, selectedNode, onNodeSelect, onNodeHover, onEdgeSelect]);

  // Node color mapping
  const getNodeColor = useCallback((node: DataLineageNode) => {
    const colorMap = {
      'table': '#3b82f6',
      'view': '#10b981',
      'transformation': '#f59e0b',
      'report': '#ef4444',
      'api': '#8b5cf6',
      'file': '#6b7280',
      'external': '#ec4899'
    };
    return colorMap[node.type as keyof typeof colorMap] || '#6b7280';
  }, []);

  // Node icon mapping
  const getNodeIcon = useCallback((node: DataLineageNode) => {
    const iconMap = {
      'table': '🗂️',
      'view': '👁️',
      'transformation': '⚙️',
      'report': '📊',
      'api': '🔌',
      'file': '📄',
      'external': '🌐'
    };
    return iconMap[node.type as keyof typeof iconMap] || '📦';
  }, []);

  // Setup zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select('.graph-container');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { transform } = event;
        setTransform(transform);
        container.attr('transform', transform);
      });

    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  // Initialize simulation
  useEffect(() => {
    setupSimulation();
  }, [setupSimulation]);

  // Highlight path effect
  useEffect(() => {
    if (!svgRef.current || !highlightedPath?.length) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select('.graph-container');

    // Reset all highlights
    container.selectAll('.node circle').attr('stroke-width', 1);
    container.selectAll('.link').style('opacity', 0.6);

    // Highlight path nodes
    container.selectAll('.node')
      .filter((d: any) => highlightedPath.includes(d.id))
      .select('circle')
      .attr('stroke-width', 3)
      .attr('stroke', config.theme.highlightColor);

    // Highlight path edges
    container.selectAll('.link')
      .filter((d: any) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        return highlightedPath.includes(sourceId) && highlightedPath.includes(targetId);
      })
      .style('opacity', 1)
      .attr('stroke', config.theme.highlightColor);

  }, [highlightedPath, config.theme]);

  // Animation controls
  const playAnimation = useCallback(() => {
    setIsPlaying(true);
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
    }
  }, []);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0);
    }
  }, []);

  const resetView = useCallback(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(750)
      .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    playAnimation,
    pauseAnimation,
    resetView,
    zoomToFit: () => {
      if (!svgRef.current || !nodes.length) return;
      
      const svg = d3.select(svgRef.current);
      const bounds = svg.select('.graph-container').node()?.getBBox();
      
      if (bounds) {
        const fullWidth = config.dimensions.width;
        const fullHeight = config.dimensions.height;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;
        
        const scale = Math.min(fullWidth / width, fullHeight / height) * 0.9;
        const translate = [fullWidth / 2 - midX * scale, fullHeight / 2 - midY * scale];
        
        svg.transition()
          .duration(750)
          .call(d3.zoom<SVGSVGElement, unknown>().transform, 
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
      }
    },
    focusNode: (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node || !svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const scale = 2;
      const translate = [
        config.dimensions.width / 2 - (node.x || 0) * scale,
        config.dimensions.height / 2 - (node.y || 0) * scale
      ];
      
      svg.transition()
        .duration(750)
        .call(d3.zoom<SVGSVGElement, unknown>().transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }
  }), [nodes, config, playAnimation, pauseAnimation, resetView]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <svg
        ref={svgRef}
        width={config.dimensions.width}
        height={config.dimensions.height}
        className="border border-border rounded-lg bg-background"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3" />
          </pattern>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={config.theme.edgeColor} />
          </marker>
        </defs>
        
        {config.layout.showGrid && (
          <rect width="100%" height="100%" fill="url(#grid)" />
        )}
        
        <g className="graph-container" />
      </svg>
      
      {/* Zoom Info */}
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground">
        Zoom: {Math.round(transform.k * 100)}%
      </div>
      
      {/* Animation Status */}
      {isPlaying && (
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 text-xs">
          <Activity className="h-3 w-3 animate-pulse text-green-500" />
          <span>Simulation Running</span>
        </div>
      )}
    </div>
  );
});

LineageNetworkGraph.displayName = 'LineageNetworkGraph';

// ============================================================================
// LINEAGE CONTROL PANEL COMPONENT
// ============================================================================
interface LineageControlPanelProps {
  config: LineageVisualizationConfig;
  onConfigChange: (config: Partial<LineageVisualizationConfig>) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onZoomToFit: () => void;
  className?: string;
}

const LineageControlPanel: React.FC<LineageControlPanelProps> = ({
  config,
  onConfigChange,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onZoomToFit,
  className
}) => {
  const [activeTab, setActiveTab] = useState('layout');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Visualization Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "secondary" : "default"}
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="outline" onClick={onReset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onZoomToFit}>
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>

        <Separator />

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="filter">Filter</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Link Distance</Label>
              <Slider
                value={[config.layout.linkDistance]}
                onValueChange={([value]) => onConfigChange({
                  layout: { ...config.layout, linkDistance: value }
                })}
                min={50}
                max={300}
                step={10}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                {config.layout.linkDistance}px
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Charge Strength</Label>
              <Slider
                value={[Math.abs(config.layout.chargeStrength)]}
                onValueChange={([value]) => onConfigChange({
                  layout: { ...config.layout, chargeStrength: -value }
                })}
                min={100}
                max={1000}
                step={50}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                -{Math.abs(config.layout.chargeStrength)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-grid"
                checked={config.layout.showGrid}
                onCheckedChange={(checked) => onConfigChange({
                  layout: { ...config.layout, showGrid: checked }
                })}
              />
              <Label htmlFor="show-grid" className="text-xs">Show Grid</Label>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Theme</Label>
              <Select
                value={config.theme.mode}
                onValueChange={(mode) => onConfigChange({
                  theme: { ...config.theme, mode: mode as 'light' | 'dark' }
                })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Node Size Scale</Label>
              <Slider
                value={[config.style.nodeSize]}
                onValueChange={([value]) => onConfigChange({
                  style: { ...config.style, nodeSize: value }
                })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                {config.style.nodeSize}x
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-labels"
                checked={config.style.showLabels}
                onCheckedChange={(checked) => onConfigChange({
                  style: { ...config.style, showLabels: checked }
                })}
              />
              <Label htmlFor="show-labels" className="text-xs">Show Labels</Label>
            </div>
          </TabsContent>

          <TabsContent value="filter" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Node Types</Label>
              <div className="space-y-1">
                {LINEAGE_NODE_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={config.filters.nodeTypes.includes(type.id)}
                      onCheckedChange={(checked) => {
                        const nodeTypes = checked
                          ? [...config.filters.nodeTypes, type.id]
                          : config.filters.nodeTypes.filter(t => t !== type.id);
                        onConfigChange({
                          filters: { ...config.filters, nodeTypes }
                        });
                      }}
                    />
                    <Label htmlFor={type.id} className="text-xs">{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Edge Types</Label>
              <div className="space-y-1">
                {LINEAGE_EDGE_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={config.filters.edgeTypes.includes(type.id)}
                      onCheckedChange={(checked) => {
                        const edgeTypes = checked
                          ? [...config.filters.edgeTypes, type.id]
                          : config.filters.edgeTypes.filter(t => t !== type.id);
                        onConfigChange({
                          filters: { ...config.filters, edgeTypes }
                        });
                      }}
                    />
                    <Label htmlFor={type.id} className="text-xs">{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// IMPACT ANALYSIS PANEL COMPONENT
// ============================================================================
interface ImpactAnalysisPanelProps {
  selectedNode: string | null;
  impactAnalysis: LineageImpactAnalysis | null;
  onAnalysisTypeChange: (type: string) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
  className?: string;
}

const ImpactAnalysisPanel: React.FC<ImpactAnalysisPanelProps> = ({
  selectedNode,
  impactAnalysis,
  onAnalysisTypeChange,
  onRunAnalysis,
  isLoading,
  className
}) => {
  const [analysisType, setAnalysisType] = useState('downstream');
  const [analysisDepth, setAnalysisDepth] = useState(3);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Impact Analysis
        </CardTitle>
        <CardDescription className="text-xs">
          Analyze the impact of changes to selected assets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedNode ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a node to perform impact analysis</p>
          </div>
        ) : (
          <>
            {/* Analysis Configuration */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Analysis Type</Label>
                <RadioGroup
                  value={analysisType}
                  onValueChange={(value) => {
                    setAnalysisType(value);
                    onAnalysisTypeChange(value);
                  }}
                >
                  {IMPACT_ANALYSIS_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id} className="text-xs">{type.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Analysis Depth</Label>
                <Slider
                  value={[analysisDepth]}
                  onValueChange={([value]) => setAnalysisDepth(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {analysisDepth} levels
                </div>
              </div>

              <Button
                onClick={onRunAnalysis}
                disabled={isLoading}
                className="w-full"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-2" />
                )}
                Run Analysis
              </Button>
            </div>

            {/* Analysis Results */}
            {impactAnalysis && (
              <div className="space-y-3">
                <Separator />
                
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted rounded p-2">
                    <div className="font-medium">Affected Assets</div>
                    <div className="text-lg font-bold">{impactAnalysis.affectedAssets.length}</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="font-medium">Risk Level</div>
                    <Badge
                      variant={
                        impactAnalysis.riskLevel === 'high' ? 'destructive' :
                        impactAnalysis.riskLevel === 'medium' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {impactAnalysis.riskLevel}
                    </Badge>
                  </div>
                </div>

                {/* Affected Assets List */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Affected Assets</Label>
                  <ScrollArea className="h-32">
                    <div className="space-y-1">
                      {impactAnalysis.affectedAssets.map((asset, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Database className="h-3 w-3" />
                            <span className="font-medium">{asset.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {asset.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Change Recommendations */}
                {impactAnalysis.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Recommendations</Label>
                    <ScrollArea className="h-24">
                      <div className="space-y-1">
                        {impactAnalysis.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="p-2 bg-muted rounded text-xs"
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5" />
                              <span>{rec}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// TEMPORAL LINEAGE VIEWER COMPONENT
// ============================================================================
interface TemporalLineageViewerProps {
  temporalData: LineageTemporalView[];
  selectedTimestamp: string | null;
  onTimestampSelect: (timestamp: string) => void;
  onPlayTimeline: () => void;
  isPlaying: boolean;
  className?: string;
}

const TemporalLineageViewer: React.FC<TemporalLineageViewerProps> = ({
  temporalData,
  selectedTimestamp,
  onTimestampSelect,
  onPlayTimeline,
  isPlaying,
  className
}) => {
  const [viewMode, setViewMode] = useState('timeline');
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sort temporal data by timestamp
  const sortedData = useMemo(() => {
    return [...temporalData].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [temporalData]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Temporal Lineage
        </CardTitle>
        <CardDescription className="text-xs">
          Track lineage changes over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode Selection */}
        <div className="flex items-center justify-between">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
              <TabsTrigger value="changes" className="text-xs">Changes</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            variant="outline"
            onClick={onPlayTimeline}
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
        </div>

        {viewMode === 'timeline' ? (
          // Timeline View
          <div className="space-y-3">
            <div ref={timelineRef} className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <ScrollArea className="h-48">
                <div className="space-y-3 pb-4">
                  {sortedData.map((item, index) => (
                    <motion.div
                      key={item.timestamp}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
                        selectedTimestamp === item.timestamp 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => onTimestampSelect(item.timestamp)}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        selectedTimestamp === item.timestamp ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.changes.length} changes
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.changes.slice(0, 3).map((change, changeIndex) => (
                            <Badge key={changeIndex} variant="outline" className="text-xs">
                              {change.type}
                            </Badge>
                          ))}
                          {item.changes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.changes.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          // Changes View
          <div className="space-y-3">
            {selectedTimestamp ? (
              (() => {
                const selectedData = sortedData.find(d => d.timestamp === selectedTimestamp);
                return selectedData ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {selectedData.changes.map((change, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-2 bg-muted rounded text-xs"
                        >
                          <div className={`w-2 h-2 rounded-full mt-1 ${
                            change.type === 'added' ? 'bg-green-500' :
                            change.type === 'removed' ? 'bg-red-500' :
                            change.type === 'modified' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="font-medium">{change.description}</div>
                            <div className="text-muted-foreground">
                              {change.assetName} ({change.assetType})
                            </div>
                          </div>
                          <Badge
                            variant={
                              change.type === 'added' ? 'default' :
                              change.type === 'removed' ? 'destructive' :
                              change.type === 'modified' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {change.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : null;
              })()
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a timestamp to view changes</p>
              </div>
            )}
          </div>
        )}

        {/* Timeline Playback Progress */}
        {isPlaying && sortedData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Timeline Playback</span>
              <span>{Math.round((sortedData.findIndex(d => d.timestamp === selectedTimestamp) + 1) / sortedData.length * 100)}%</span>
            </div>
            <Progress 
              value={(sortedData.findIndex(d => d.timestamp === selectedTimestamp) + 1) / sortedData.length * 100} 
              className="h-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// LINEAGE ANNOTATIONS PANEL COMPONENT
// ============================================================================
interface LineageAnnotationsPanelProps {
  annotations: LineageAnnotation[];
  selectedNode: string | null;
  onAddAnnotation: (annotation: Omit<LineageAnnotation, 'id' | 'timestamp'>) => void;
  onUpdateAnnotation: (id: string, annotation: Partial<LineageAnnotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  currentUser: string;
  className?: string;
}

const LineageAnnotationsPanel: React.FC<LineageAnnotationsPanelProps> = ({
  annotations,
  selectedNode,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  currentUser,
  className
}) => {
  const [newAnnotation, setNewAnnotation] = useState('');
  const [annotationType, setAnnotationType] = useState('note');
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);

  // Filter annotations for selected node
  const nodeAnnotations = useMemo(() => {
    return annotations.filter(annotation => 
      selectedNode && (annotation.nodeId === selectedNode || annotation.edgeId === selectedNode)
    );
  }, [annotations, selectedNode]);

  const handleAddAnnotation = () => {
    if (!newAnnotation.trim() || !selectedNode) return;

    onAddAnnotation({
      nodeId: selectedNode,
      type: annotationType as 'note' | 'warning' | 'issue' | 'improvement',
      content: newAnnotation.trim(),
      author: currentUser
    });

    setNewAnnotation('');
    setIsAddingAnnotation(false);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Annotations
        </CardTitle>
        <CardDescription className="text-xs">
          Collaborative notes and comments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedNode ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a node to view annotations</p>
          </div>
        ) : (
          <>
            {/* Add New Annotation */}
            <div className="space-y-3">
              {!isAddingAnnotation ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingAnnotation(true)}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Annotation
                </Button>
              ) : (
                <div className="space-y-2 p-2 border rounded">
                  <Select value={annotationType} onValueChange={setAnnotationType}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="issue">Issue</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Textarea
                    placeholder="Enter your annotation..."
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                    className="min-h-[60px] text-xs"
                  />
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddAnnotation}>
                      <Save className="h-3 w-3 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingAnnotation(false);
                        setNewAnnotation('');
                      }}
                    >
                      <X className="h-3 w-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Existing Annotations */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Annotations ({nodeAnnotations.length})
              </Label>
              
              {nodeAnnotations.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No annotations yet</p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {nodeAnnotations.map((annotation) => (
                      <motion.div
                        key={annotation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 border rounded bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                annotation.type === 'warning' ? 'destructive' :
                                annotation.type === 'issue' ? 'destructive' :
                                annotation.type === 'improvement' ? 'default' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {annotation.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {annotation.author}
                            </span>
                          </div>
                          
                          {annotation.author === currentUser && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onDeleteAnnotation(annotation.id)}
                                  className="text-red-600"
                                >
                                  <X className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {annotation.content}
                        </p>
                        
                        <div className="text-xs text-muted-foreground">
                          {new Date(annotation.timestamp).toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN DATA LINEAGE VISUALIZER COMPONENT
// ============================================================================
export interface DataLineageVisualizerProps {
  initialAssetId?: string;
  className?: string;
}

export const DataLineageVisualizer: React.FC<DataLineageVisualizerProps> = ({
  initialAssetId,
  className
}) => {
  // State management
  const [selectedAsset, setSelectedAsset] = useState<string | null>(initialAssetId || null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [lineageQuery, setLineageQuery] = useState<LineageQuery>({
    assetId: initialAssetId || '',
    depth: 3,
    direction: 'both',
    includeMetadata: true,
    filters: {
      nodeTypes: ['table', 'view', 'transformation', 'report'],
      edgeTypes: ['direct', 'derived', 'aggregated'],
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    }
  });

  // Visualization configuration
  const [visualizationConfig, setVisualizationConfig] = useState<LineageVisualizationConfig>({
    ...LINEAGE_VISUALIZATION_CONFIG,
    dimensions: { width: 800, height: 600 },
    layout: {
      type: 'force',
      linkDistance: 150,
      linkStrength: 0.5,
      chargeStrength: -500,
      showGrid: false
    },
    theme: {
      mode: 'light',
      nodeColor: '#3b82f6',
      edgeColor: '#6b7280',
      selectedColor: '#ef4444',
      highlightColor: '#10b981',
      textColor: '#374151',
      nodeStroke: '#e5e7eb'
    },
    style: {
      nodeSize: 1,
      edgeWidth: 1,
      showLabels: true,
      showArrows: true
    },
    filters: {
      nodeTypes: ['table', 'view', 'transformation', 'report'],
      edgeTypes: ['direct', 'derived', 'aggregated'],
      minWeight: 0,
      maxDepth: 10
    }
  });

  // Animation state
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(null);

  // UI state
  const [activeView, setActiveView] = useState('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Refs
  const graphRef = useRef<any>(null);
  const queryClient = useQueryClient();

  // Custom hooks for data management
  const {
    data: lineageData,
    isLoading: isLineageLoading,
    error: lineageError,
    refetch: refetchLineage
  } = useLineageDiscovery(lineageQuery);

  const {
    data: visualizationData,
    isLoading: isVisualizationLoading
  } = useLineageVisualization(lineageData?.nodes || [], lineageData?.edges || [], visualizationConfig);

  const {
    data: impactAnalysis,
    isLoading: isImpactLoading,
    mutate: runImpactAnalysis
  } = useImpactAnalysis();

  const {
    data: temporalData,
    isLoading: isTemporalLoading
  } = useLineageHistory(selectedAsset);

  const {
    data: annotations,
    mutate: addAnnotation,
    updateAnnotation,
    deleteAnnotation
  } = useLineageCollaboration(selectedAsset);

  const {
    data: lineageMetrics,
    isLoading: isMetricsLoading
  } = useLineageMetrics(selectedAsset);

  const {
    mutate: exportLineage
  } = useLineageExport();

  // Debounced search
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Search results
  const {
    data: searchResults,
    isLoading: isSearchLoading
  } = useLineageSearch(debouncedSearchQuery);

  // Event handlers
  const handleAssetSelect = useCallback((assetId: string) => {
    setSelectedAsset(assetId);
    setLineageQuery(prev => ({ ...prev, assetId }));
    setSelectedNode(null);
    setHighlightedPath([]);
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    
    // Find path from root asset to selected node
    if (lineageData?.nodes && lineageData?.edges) {
      const path = findShortestPath(
        lineageData.nodes,
        lineageData.edges,
        selectedAsset || '',
        nodeId
      );
      setHighlightedPath(path);
    }
  }, [lineageData, selectedAsset]);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    // Handle node hover effects
    if (nodeId && lineageData?.nodes) {
      const connectedNodes = findConnectedNodes(
        lineageData.nodes,
        lineageData.edges || [],
        nodeId
      );
      // Could highlight connected nodes
    }
  }, [lineageData]);

  const handleEdgeSelect = useCallback((edgeId: string) => {
    setSelectedEdge(edgeId);
  }, []);

  const handleConfigChange = useCallback((config: Partial<LineageVisualizationConfig>) => {
    setVisualizationConfig(prev => ({
      ...prev,
      ...config,
      layout: { ...prev.layout, ...(config.layout || {}) },
      theme: { ...prev.theme, ...(config.theme || {}) },
      style: { ...prev.style, ...(config.style || {}) },
      filters: { ...prev.filters, ...(config.filters || {}) }
    }));
  }, []);

  const handleImpactAnalysis = useCallback(() => {
    if (!selectedNode) return;
    
    runImpactAnalysis({
      nodeId: selectedNode,
      analysisType: 'downstream',
      depth: 5,
      includeMetrics: true
    });
  }, [selectedNode, runImpactAnalysis]);

  const handleExport = useCallback((format: string) => {
    if (!lineageData) return;
    
    setIsExporting(true);
    exportLineage({
      data: lineageData,
      format: format as 'png' | 'svg' | 'json' | 'csv',
      config: visualizationConfig
    }, {
      onSuccess: () => {
        toast.success('Lineage exported successfully');
        setIsExporting(false);
      },
      onError: (error) => {
        toast.error('Export failed: ' + error.message);
        setIsExporting(false);
      }
    });
  }, [lineageData, visualizationConfig, exportLineage]);

  const handleAddAnnotation = useCallback((annotation: Omit<LineageAnnotation, 'id' | 'timestamp'>) => {
    addAnnotation({
      ...annotation,
      assetId: selectedAsset || ''
    });
  }, [selectedAsset, addAnnotation]);

  // Timeline playback
  const handleTimelinePlay = useCallback(() => {
    if (!temporalData?.length) return;
    
    setIsTimelinePlaying(!isTimelinePlaying);
    
    if (!isTimelinePlaying && temporalData.length > 0) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < temporalData.length) {
          setSelectedTimestamp(temporalData[currentIndex].timestamp);
          currentIndex++;
        } else {
          setIsTimelinePlaying(false);
          clearInterval(interval);
        }
      }, 1000);
    }
  }, [temporalData, isTimelinePlaying]);

  // Graph control methods
  const handlePlayAnimation = useCallback(() => {
    setIsAnimationPlaying(true);
    graphRef.current?.playAnimation();
  }, []);

  const handlePauseAnimation = useCallback(() => {
    setIsAnimationPlaying(false);
    graphRef.current?.pauseAnimation();
  }, []);

  const handleResetView = useCallback(() => {
    graphRef.current?.resetView();
  }, []);

  const handleZoomToFit = useCallback(() => {
    graphRef.current?.zoomToFit();
  }, []);

  // Helper functions
  const findShortestPath = (
    nodes: DataLineageNode[],
    edges: DataLineageEdge[],
    sourceId: string,
    targetId: string
  ): string[] => {
    // Simple BFS implementation for finding shortest path
    const queue = [{ nodeId: sourceId, path: [sourceId] }];
    const visited = new Set([sourceId]);
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === targetId) {
        return path;
      }
      
      const connectedEdges = edges.filter(edge => 
        (typeof edge.source === 'string' ? edge.source : edge.source.id) === nodeId ||
        (typeof edge.target === 'string' ? edge.target : edge.target.id) === nodeId
      );
      
      for (const edge of connectedEdges) {
        const connectedNodeId = (typeof edge.source === 'string' ? edge.source : edge.source.id) === nodeId
          ? (typeof edge.target === 'string' ? edge.target : edge.target.id)
          : (typeof edge.source === 'string' ? edge.source : edge.source.id);
        
        if (!visited.has(connectedNodeId)) {
          visited.add(connectedNodeId);
          queue.push({ nodeId: connectedNodeId, path: [...path, connectedNodeId] });
        }
      }
    }
    
    return [];
  };

  const findConnectedNodes = (
    nodes: DataLineageNode[],
    edges: DataLineageEdge[],
    nodeId: string
  ): string[] => {
    return edges
      .filter(edge => 
        (typeof edge.source === 'string' ? edge.source : edge.source.id) === nodeId ||
        (typeof edge.target === 'string' ? edge.target : edge.target.id) === nodeId
      )
      .map(edge => 
        (typeof edge.source === 'string' ? edge.source : edge.source.id) === nodeId
          ? (typeof edge.target === 'string' ? edge.target : edge.target.id)
          : (typeof edge.source === 'string' ? edge.source : edge.source.id)
      );
  };

  // Loading state
  if (isLineageLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lineage data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (lineageError) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load lineage data</p>
          <Button size="sm" variant="outline" onClick={() => refetchLineage()} className="mt-2">
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList>
              <TabsTrigger value="graph">Graph</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EXPORT_FORMATS.map((format) => (
                <DropdownMenuItem
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                >
                  {format.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Results */}
      {debouncedSearchQuery && searchResults && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 border rounded cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleAssetSelect(result.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4" />
                    <span className="font-medium text-sm">{result.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{result.description}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {result.type}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Visualization */}
        <div className="lg:col-span-3 space-y-4">
          {activeView === 'graph' && lineageData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Data Lineage Graph
                  {selectedAsset && (
                    <Badge variant="outline" className="text-xs">
                      {lineageData.nodes.find(n => n.id === selectedAsset)?.name || selectedAsset}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineageNetworkGraph
                  ref={graphRef}
                  nodes={lineageData.nodes}
                  edges={lineageData.edges}
                  config={visualizationConfig}
                  selectedNode={selectedNode}
                  highlightedPath={highlightedPath}
                  onNodeSelect={handleNodeSelect}
                  onNodeHover={handleNodeHover}
                  onEdgeSelect={handleEdgeSelect}
                />
              </CardContent>
            </Card>
          )}

          {activeView === 'timeline' && (
            <TemporalLineageViewer
              temporalData={temporalData || []}
              selectedTimestamp={selectedTimestamp}
              onTimestampSelect={setSelectedTimestamp}
              onPlayTimeline={handleTimelinePlay}
              isPlaying={isTimelinePlaying}
            />
          )}

          {activeView === 'metrics' && lineageMetrics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Lineage Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">{lineageMetrics.totalAssets}</div>
                    <div className="text-xs text-muted-foreground">Total Assets</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">{lineageMetrics.totalConnections}</div>
                    <div className="text-xs text-muted-foreground">Connections</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">{lineageMetrics.maxDepth}</div>
                    <div className="text-xs text-muted-foreground">Max Depth</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">{lineageMetrics.cyclicalPaths}</div>
                    <div className="text-xs text-muted-foreground">Cycles</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          {/* Visualization Controls */}
          {activeView === 'graph' && (
            <LineageControlPanel
              config={visualizationConfig}
              onConfigChange={handleConfigChange}
              isPlaying={isAnimationPlaying}
              onPlay={handlePlayAnimation}
              onPause={handlePauseAnimation}
              onReset={handleResetView}
              onZoomToFit={handleZoomToFit}
            />
          )}

          {/* Impact Analysis */}
          <ImpactAnalysisPanel
            selectedNode={selectedNode}
            impactAnalysis={impactAnalysis}
            onAnalysisTypeChange={() => {}}
            onRunAnalysis={handleImpactAnalysis}
            isLoading={isImpactLoading}
          />

          {/* Annotations */}
          <LineageAnnotationsPanel
            annotations={annotations || []}
            selectedNode={selectedNode}
            onAddAnnotation={handleAddAnnotation}
            onUpdateAnnotation={updateAnnotation}
            onDeleteAnnotation={deleteAnnotation}
            currentUser="current-user" // Replace with actual user
          />
        </div>
      </div>
    </div>
  );
};

export default DataLineageVisualizer;
