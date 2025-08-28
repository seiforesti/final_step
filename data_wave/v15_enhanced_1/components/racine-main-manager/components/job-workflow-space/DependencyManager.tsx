'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Network, AlertTriangle, CheckCircle, Play, Pause, Settings, Zap, Target, RefreshCw, Download, Upload, Save, Eye, EyeOff, ArrowRight, ArrowDown, MoreHorizontal, X, Plus, Minus, Search, Filter, Clock, Activity, BarChart3, TrendingUp, Layers, Route, Workflow, Brain, Shield, Users, Database, Package, Code, Terminal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// D3.js for advanced graph visualization
import * as d3 from 'd3';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types
import { 
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  CircularDependency,
  ExecutionPlan,
  ParallelExecutionGroup,
  ResourceDependency,
  ConditionalDependency,
  DynamicDependency,
  DependencyAnalysis,
  OptimizationSuggestion,
  ExecutionMetrics,
  DependencyValidation,
  WorkflowDefinition
} from '../../types/racine-core.types';

const DEPENDENCY_NODE_TYPES = {
  TASK: { type: 'task', color: '#3b82f6', icon: 'circle' },
  RESOURCE: { type: 'resource', color: '#10b981', icon: 'square' },
  CONDITION: { type: 'condition', color: '#f59e0b', icon: 'diamond' },
  PARALLEL_GROUP: { type: 'parallel_group', color: '#8b5cf6', icon: 'hexagon' },
  CROSS_SPA: { type: 'cross_spa', color: '#ef4444', icon: 'triangle' },
  AI_DECISION: { type: 'ai_decision', color: '#ec4899', icon: 'star' }
};

const DEPENDENCY_EDGE_TYPES = {
  SEQUENTIAL: { type: 'sequential', color: '#6b7280', style: 'solid' },
  CONDITIONAL: { type: 'conditional', color: '#f59e0b', style: 'dashed' },
  RESOURCE: { type: 'resource', color: '#10b981', style: 'dotted' },
  PARALLEL: { type: 'parallel', color: '#8b5cf6', style: 'double' },
  CROSS_SPA: { type: 'cross_spa', color: '#ef4444', style: 'thick' }
};

interface DependencyManagerProps {
  workflowId?: string;
  initialDependencies?: DependencyGraph;
  onDependenciesChange?: (dependencies: DependencyGraph) => void;
  onExecutionPlanGenerated?: (plan: ExecutionPlan) => void;
  readonly?: boolean;
  className?: string;
}

const DependencyManager: React.FC<DependencyManagerProps> = ({
  workflowId,
  initialDependencies,
  onDependenciesChange,
  onExecutionPlanGenerated,
  readonly = false,
  className = ''
}) => {
  // Hooks for Backend Integration
  const { 
    analyzeDependencies,
    optimizeExecution,
    validateDependencies,
    generateExecutionPlan,
    detectCircularDependencies,
    getExecutionMetrics
  } = useJobWorkflow();
  
  const { 
    orchestrateDependencies,
    getSystemResources,
    validateCrossGroupDependencies
  } = useRacineOrchestration();
  
  const { 
    getCrossSPADependencies,
    validateCrossGroupDeps,
    getResourceAvailability
  } = useCrossGroupIntegration();
  
  const { getCurrentUser } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    optimizeDependencyGraph,
    suggestParallelization,
    detectBottlenecks
  } = useAIAssistant();

  // State Management
  const [dependencyGraph, setDependencyGraph] = useState<DependencyGraph>(initialDependencies || {
    id: workflowId || '',
    nodes: [],
    edges: [],
    execution_plan: null,
    analysis: null,
    optimization_suggestions: [],
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: '1.0.0'
    }
  });

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [circularDependencies, setCircularDependencies] = useState<CircularDependency[]>([]);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [executionMetrics, setExecutionMetrics] = useState<ExecutionMetrics | null>(null);

  // Visualization States
  const [graphLayout, setGraphLayout] = useState<'hierarchical' | 'force' | 'circular'>('hierarchical');
  const [showResourceDeps, setShowResourceDeps] = useState(true);
  const [showConditionalDeps, setShowConditionalDeps] = useState(true);
  const [showCrossSPADeps, setShowCrossSPADeps] = useState(true);
  const [highlightCriticalPath, setHighlightCriticalPath] = useState(false);
  const [animateExecution, setAnimateExecution] = useState(false);

  // Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // UI States
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(true);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('graph');

  // Refs
  const graphRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<DependencyNode, DependencyEdge> | null>(null);

  // Dependency Analysis with Full Backend Integration
  const analyzeDependencyGraph = useCallback(async () => {
    if (!dependencyGraph.nodes.length) return;

    setIsAnalyzing(true);

    try {
      // Analyze dependencies through backend
      const analysis = await analyzeDependencies(dependencyGraph);
      
      // Detect circular dependencies
      const circular = await detectCircularDependencies(dependencyGraph);
      
      // Validate cross-SPA dependencies
      const crossSpaValidation = await validateCrossGroupDependencies(dependencyGraph);
      
      // Get AI optimization suggestions
      const aiOptimizations = await optimizeDependencyGraph(dependencyGraph);
      
      setCircularDependencies(circular);
      setOptimizationSuggestions(aiOptimizations);
      
      setDependencyGraph(prev => ({
        ...prev,
        analysis: {
          ...analysis,
          circular_dependencies: circular,
          cross_spa_validation: crossSpaValidation,
          ai_suggestions: aiOptimizations
        },
        metadata: {
          ...prev.metadata,
          last_analyzed: new Date().toISOString(),
          analysis_score: analysis.complexity_score,
          has_circular_deps: circular.length > 0
        }
      }));

      // Track analysis activity
      trackActivity({
        action: 'dependency_analysis_completed',
        resource_type: 'dependency_graph',
        resource_id: dependencyGraph.id,
        details: {
          node_count: dependencyGraph.nodes.length,
          edge_count: dependencyGraph.edges.length,
          circular_dependencies: circular.length,
          optimization_suggestions: aiOptimizations.length,
          complexity_score: analysis.complexity_score
        }
      });
    } catch (error) {
      console.error('Dependency analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [dependencyGraph, analyzeDependencies, detectCircularDependencies, validateCrossGroupDependencies, optimizeDependencyGraph, trackActivity]);

  // Execution Plan Generation with Parallel Optimization
  const generateOptimizedExecutionPlan = useCallback(async () => {
    if (!dependencyGraph.nodes.length) return;

    setIsGeneratingPlan(true);

    try {
      // Generate execution plan through backend
      const plan = await generateExecutionPlan(dependencyGraph);
      
      // Get parallel execution suggestions from AI
      const parallelSuggestions = await suggestParallelization(dependencyGraph);
      
      // Optimize execution order
      const optimizedPlan = await optimizeExecution(plan);
      
      setExecutionPlan(optimizedPlan);
      
      setDependencyGraph(prev => ({
        ...prev,
        execution_plan: optimizedPlan,
        metadata: {
          ...prev.metadata,
          last_plan_generated: new Date().toISOString(),
          parallel_groups: optimizedPlan.parallel_groups?.length || 0,
          estimated_duration: optimizedPlan.estimated_duration
        }
      }));

      // Track plan generation
      trackActivity({
        action: 'execution_plan_generated',
        resource_type: 'dependency_graph',
        resource_id: dependencyGraph.id,
        details: {
          total_steps: optimizedPlan.steps?.length || 0,
          parallel_groups: optimizedPlan.parallel_groups?.length || 0,
          estimated_duration: optimizedPlan.estimated_duration,
          optimization_level: optimizedPlan.optimization_level
        }
      });

      onExecutionPlanGenerated?.(optimizedPlan);
    } catch (error) {
      console.error('Execution plan generation failed:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [dependencyGraph, generateExecutionPlan, suggestParallelization, optimizeExecution, trackActivity, onExecutionPlanGenerated]);

  // D3.js Graph Visualization
  const renderDependencyGraph = useCallback(() => {
    if (!graphRef.current || !dependencyGraph.nodes.length) return;

    const svg = d3.select(graphRef.current);
    const width = 800;
    const height = 600;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create simulation based on layout type
    let simulation: d3.Simulation<DependencyNode, DependencyEdge>;

    switch (graphLayout) {
      case 'force':
        simulation = d3.forceSimulation<DependencyNode>(dependencyGraph.nodes)
          .force('link', d3.forceLink<DependencyNode, DependencyEdge>(dependencyGraph.edges)
            .id(d => d.id)
            .distance(100))
          .force('charge', d3.forceManyBody().strength(-300))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(30));
        break;
      
      case 'hierarchical':
        simulation = d3.forceSimulation<DependencyNode>(dependencyGraph.nodes)
          .force('link', d3.forceLink<DependencyNode, DependencyEdge>(dependencyGraph.edges)
            .id(d => d.id)
            .distance(150))
          .force('charge', d3.forceManyBody().strength(-200))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('y', d3.forceY().y(d => (d as any).level * 100).strength(0.5));
        break;
      
      case 'circular':
        simulation = d3.forceSimulation<DependencyNode>(dependencyGraph.nodes)
          .force('link', d3.forceLink<DependencyNode, DependencyEdge>(dependencyGraph.edges)
            .id(d => d.id)
            .distance(80))
          .force('charge', d3.forceManyBody().strength(-100))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('radial', d3.forceRadial(200, width / 2, height / 2).strength(0.3));
        break;
    }

    simulationRef.current = simulation;

    // Create edges
    const edges = g.append('g')
      .attr('class', 'edges')
      .selectAll('path')
      .data(dependencyGraph.edges)
      .enter()
      .append('path')
      .attr('class', 'edge')
      .attr('fill', 'none')
      .attr('stroke', d => {
        const edgeType = DEPENDENCY_EDGE_TYPES[d.type as keyof typeof DEPENDENCY_EDGE_TYPES];
        return edgeType?.color || '#6b7280';
      })
      .attr('stroke-width', d => {
        if (highlightCriticalPath && d.is_critical_path) return 4;
        return d.weight || 2;
      })
      .attr('stroke-dasharray', d => {
        const edgeType = DEPENDENCY_EDGE_TYPES[d.type as keyof typeof DEPENDENCY_EDGE_TYPES];
        switch (edgeType?.style) {
          case 'dashed': return '5,5';
          case 'dotted': return '2,2';
          case 'double': return '0'; // Handle with multiple paths
          default: return '0';
        }
      })
      .attr('marker-end', 'url(#arrowhead)')
      .style('opacity', d => {
        if (!showResourceDeps && d.type === 'resource') return 0.2;
        if (!showConditionalDeps && d.type === 'conditional') return 0.2;
        if (!showCrossSPADeps && d.type === 'cross_spa') return 0.2;
        return 1;
      })
      .on('click', function(event, d) {
        if (!readonly) {
          setSelectedEdges([d.id]);
        }
      });

    // Add arrow markers
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('xoverflow', 'visible')
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#6b7280')
      .style('stroke', 'none');

    // Create nodes
    const nodes = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(dependencyGraph.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, DependencyNode>()
        .on('start', function(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', function(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', function(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }))
      .on('click', function(event, d) {
        if (!readonly) {
          setSelectedNodes([d.id]);
        }
      })
      .on('dblclick', function(event, d) {
        // Center view on node
        const transform = d3.zoomIdentity
          .translate(width / 2 - (d.x || 0), height / 2 - (d.y || 0))
          .scale(1.5);
        svg.transition().duration(750).call(zoom.transform, transform);
      });

    // Add node shapes based on type
    nodes.each(function(d) {
      const node = d3.select(this);
      const nodeType = DEPENDENCY_NODE_TYPES[d.type as keyof typeof DEPENDENCY_NODE_TYPES];
      const isSelected = selectedNodes.includes(d.id);
      const hasError = d.validation_errors && d.validation_errors.length > 0;
      
      const color = hasError ? '#ef4444' : (nodeType?.color || '#6b7280');
      const strokeColor = isSelected ? '#3b82f6' : (hasError ? '#dc2626' : '#d1d5db');
      const strokeWidth = isSelected ? 3 : (hasError ? 2 : 1);

      switch (nodeType?.icon) {
        case 'circle':
          node.append('circle')
            .attr('r', d.size || 20)
            .attr('fill', color)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth);
          break;
        
        case 'square':
          node.append('rect')
            .attr('x', -(d.size || 20))
            .attr('y', -(d.size || 20))
            .attr('width', (d.size || 20) * 2)
            .attr('height', (d.size || 20) * 2)
            .attr('fill', color)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth);
          break;
        
        case 'diamond':
          const size = d.size || 20;
          node.append('polygon')
            .attr('points', `0,${-size} ${size},0 0,${size} ${-size},0`)
            .attr('fill', color)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth);
          break;
        
        case 'hexagon':
          const hexSize = d.size || 20;
          const hexPoints = [];
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            hexPoints.push(`${hexSize * Math.cos(angle)},${hexSize * Math.sin(angle)}`);
          }
          node.append('polygon')
            .attr('points', hexPoints.join(' '))
            .attr('fill', color)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth);
          break;
        
        case 'triangle':
          const triSize = d.size || 20;
          node.append('polygon')
            .attr('points', `0,${-triSize} ${triSize * 0.866},${triSize * 0.5} ${-triSize * 0.866},${triSize * 0.5}`)
            .attr('fill', color)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth);
          break;
        
        case 'star':
          const starSize = d.size || 20;
          const starPoints = [];
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? starSize : starSize * 0.5;
            starPoints.push(`${radius * Math.cos(angle - Math.PI / 2)},${radius * Math.sin(angle - Math.PI / 2)}`);
          }
          node.append('polygon')
            .attr('points', starPoints.join(' '))
            .attr('fill', color)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth);
          break;
        
        default:
          node.append('circle')
            .attr('r', d.size || 20)
            .attr('fill', color)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth);
      }

      // Add node label
      node.append('text')
        .attr('dy', d.size ? d.size + 15 : 35)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#374151')
        .text(d.label || d.id);

      // Add status indicators
      if (d.status) {
        const statusColor = {
          'pending': '#6b7280',
          'running': '#3b82f6',
          'completed': '#10b981',
          'failed': '#ef4444',
          'blocked': '#f59e0b'
        }[d.status] || '#6b7280';

        node.append('circle')
          .attr('cx', (d.size || 20) - 5)
          .attr('cy', -(d.size || 20) + 5)
          .attr('r', 4)
          .attr('fill', statusColor)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1);
      }

      // Add execution progress indicator
      if (d.execution_progress !== undefined && d.execution_progress > 0) {
        const progressRadius = (d.size || 20) + 3;
        const progressArc = d3.arc<any>()
          .innerRadius(progressRadius - 2)
          .outerRadius(progressRadius)
          .startAngle(0)
          .endAngle((d.execution_progress / 100) * 2 * Math.PI);

        node.append('path')
          .attr('d', progressArc)
          .attr('fill', '#10b981')
          .attr('opacity', 0.8);
      }
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      edges.attr('d', d => {
        const source = d.source as DependencyNode;
        const target = d.target as DependencyNode;
        return `M${source.x},${source.y} L${target.x},${target.y}`;
      });

      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  }, [dependencyGraph, graphLayout, selectedNodes, selectedEdges, showResourceDeps, showConditionalDeps, showCrossSPADeps, highlightCriticalPath, readonly]);

  // Analysis Panel Render
  const renderAnalysisPanel = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Dependency Analysis</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowAnalysisPanel(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {/* Analysis Actions */}
            <div className="space-y-2">
              <Button
                onClick={analyzeDependencyGraph}
                disabled={isAnalyzing}
                className="w-full"
                size="sm"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                Analyze Dependencies
              </Button>
              
              <Button
                onClick={generateOptimizedExecutionPlan}
                disabled={isGeneratingPlan}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {isGeneratingPlan ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Generate Plan
              </Button>
            </div>

            <Separator />

            {/* Graph Statistics */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Graph Statistics</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nodes:</span>
                  <Badge variant="outline">{dependencyGraph.nodes.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Edges:</span>
                  <Badge variant="outline">{dependencyGraph.edges.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Circular:</span>
                  <Badge variant={circularDependencies.length > 0 ? "destructive" : "outline"}>
                    {circularDependencies.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parallel:</span>
                  <Badge variant="outline">
                    {executionPlan?.parallel_groups?.length || 0}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Circular Dependencies */}
            {circularDependencies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">Circular Dependencies</h4>
                <div className="space-y-1">
                  {circularDependencies.map((circular, index) => (
                    <Alert key={index} className="p-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {circular.cycle.join(' → ')} → {circular.cycle[0]}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {dependencyGraph.analysis && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Analysis Results</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Complexity Score:</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={dependencyGraph.analysis.complexity_score || 0} 
                        className="w-16 h-2" 
                      />
                      <span className="text-xs font-mono">
                        {dependencyGraph.analysis.complexity_score || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Parallelization:</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={dependencyGraph.analysis.parallelization_potential || 0} 
                        className="w-16 h-2" 
                      />
                      <span className="text-xs font-mono">
                        {dependencyGraph.analysis.parallelization_potential || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Critical Path:</span>
                    <Badge variant="outline" className="text-xs">
                      {dependencyGraph.analysis.critical_path_length || 0} steps
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Optimization Suggestions */}
            {optimizationSuggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">AI Suggestions</h4>
                <div className="space-y-1">
                  {optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-xs">
                      <div className="font-medium">{suggestion.title}</div>
                      <div className="text-gray-600 mt-1">{suggestion.description}</div>
                      {suggestion.impact && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Impact: {suggestion.impact}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Effects
  useEffect(() => {
    if (initialDependencies) {
      setDependencyGraph(initialDependencies);
    }
  }, [initialDependencies]);

  useEffect(() => {
    renderDependencyGraph();
  }, [renderDependencyGraph]);

  useEffect(() => {
    // Auto-analyze when graph changes
    const debounceTimeout = setTimeout(() => {
      if (dependencyGraph.nodes.length > 0) {
        analyzeDependencyGraph();
      }
    }, 2000);

    return () => clearTimeout(debounceTimeout);
  }, [dependencyGraph.nodes, dependencyGraph.edges, analyzeDependencyGraph]);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  // Main Render
  return (
    <div className={`flex h-full bg-white ${className}`}>
      <TooltipProvider>
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Analysis Panel */}
          {showAnalysisPanel && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                {renderAnalysisPanel()}
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Main Graph Visualization Panel */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Network className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">Dependency Manager</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{dependencyGraph.nodes.length} nodes</Badge>
                    <Badge variant="outline">{dependencyGraph.edges.length} edges</Badge>
                    {circularDependencies.length > 0 && (
                      <Badge variant="destructive">{circularDependencies.length} circular</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Layout Controls */}
                  <Select value={graphLayout} onValueChange={(value: any) => setGraphLayout(value)}>
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hierarchical">Hierarchical</SelectItem>
                      <SelectItem value="force">Force</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Display Options */}
                  <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={showResourceDeps ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setShowResourceDeps(!showResourceDeps)}
                          >
                            <Database className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle Resource Dependencies</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={showConditionalDeps ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setShowConditionalDeps(!showConditionalDeps)}
                          >
                            <GitBranch className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle Conditional Dependencies</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={showCrossSPADeps ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setShowCrossSPADeps(!showCrossSPADeps)}
                          >
                            <Network className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle Cross-SPA Dependencies</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Graph Visualization */}
              <div className="flex-1 relative overflow-hidden bg-gray-50">
                <svg
                  ref={graphRef}
                  className="w-full h-full"
                  style={{ background: 'radial-gradient(circle, #f9fafb 0%, #f3f4f6 100%)' }}
                />
                
                {/* No Data State */}
                {dependencyGraph.nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Dependencies</h3>
                      <p className="text-sm">Add nodes and edges to visualize dependencies</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
};

export default DependencyManager;