'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Racine System Hooks
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import {
  optimizePipelinePerformance,
  analyzeResourceUtilization,
  generateOptimizationRecommendations,
  predictPipelineBottlenecks,
  optimizeResourceAllocation,
  analyzeCostEfficiency,
  generatePerformanceBaseline,
  optimizeDataFlow,
  analyzeStageEfficiency,
  recommendArchitecturalChanges,
  optimizeParallelExecution,
  analyzeExecutionPattern
} from '../../utils/pipeline-backend-integration';

// Types from racine-core.types
import {
  Pipeline,
  PipelineOptimization,
  OptimizationRecommendation,
  PerformanceMetrics,
  ResourceAnalysis,
  BottleneckPrediction,
  CostAnalysis,
  EfficiencyReport,
  OptimizationStrategy,
  PerformanceBaseline,
  ResourceOptimization,
  DataFlowOptimization,
  ArchitecturalRecommendation,
  ParallelExecutionPlan,
  ExecutionPattern,
  OptimizationProfile,
  AIRecommendation,
  PerformanceTrend,
  ResourceAllocation,
  OptimizationResult,
  PipelineInsight,
  BenchmarkComparison,
  OptimizationGoal,
  PerformanceTarget,
  ResourceConstraint,
  OptimizationMetric
} from '../../types/racine-core.types';

// Icons
import { Zap, TrendingUp, Target, BarChart3, Activity, Settings, Brain, Lightbulb, CheckCircle2, AlertTriangle, Clock, DollarSign, Cpu, MemoryStick, HardDrive, Network, Filter, ArrowUpDown, RefreshCw, Play, Pause, Download, Upload, Maximize2, Minimize2, MoreHorizontal, Plus, Minus, X, Search, Save, Share2, BookOpen, Star, ThumbsUp, ThumbsDown, Eye, EyeOff, Lock, Unlock, GitBranch, Workflow, Database, Server, Cloud, Gauge, ChevronDown } from 'lucide-react';

// Advanced Chart Components
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';

// D3.js for Advanced Visualizations
import * as d3 from 'd3';

interface IntelligentPipelineOptimizerProps {
  pipelineId: string;
  className?: string;
  onOptimizationComplete?: (optimization: PipelineOptimization) => void;
  onRecommendationApplied?: (recommendation: OptimizationRecommendation) => void;
}

export default function IntelligentPipelineOptimizer({
  pipelineId,
  className,
  onOptimizationComplete,
  onRecommendationApplied
}: IntelligentPipelineOptimizerProps) {
  // Racine System Hooks
  const {
    pipelines,
    optimizations,
    recommendations,
    metrics,
    loading: pipelineLoading,
    error: pipelineError,
    optimizePipeline,
    getOptimizationHistory,
    applyOptimization,
    getPerformanceMetrics,
    generateRecommendations
  } = usePipelineManagement();

  const {
    orchestrateOptimization,
    getCrossGroupMetrics,
    optimizeResourceDistribution,
    coordinateOptimizationStrategy
  } = useRacineOrchestration();

  const {
    getSPAOptimizationData,
    validateCrossGroupOptimization,
    getResourceConstraints
  } = useCrossGroupIntegration();

  const { currentUser, permissions } = useUserManagement();
  const { currentWorkspace, getWorkspaceResources } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { getAIRecommendations, analyzeWithAI } = useAIAssistant();

  // Component State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOptimization, setSelectedOptimization] = useState<PipelineOptimization | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<PipelineOptimization[]>([]);
  const [currentRecommendations, setCurrentRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [resourceAnalysis, setResourceAnalysis] = useState<ResourceAnalysis | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [bottleneckPredictions, setBottleneckPredictions] = useState<BottleneckPrediction[]>([]);
  const [optimizationProfile, setOptimizationProfile] = useState<OptimizationProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [optimizationGoals, setOptimizationGoals] = useState<OptimizationGoal[]>([]);
  const [performanceTargets, setPerformanceTargets] = useState<PerformanceTarget[]>([]);
  const [resourceConstraints, setResourceConstraints] = useState<ResourceConstraint[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkComparison[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<PerformanceMetrics[]>([]);
  const [optimizationStrategy, setOptimizationStrategy] = useState<OptimizationStrategy>('balanced');
  const [aiInsights, setAiInsights] = useState<AIRecommendation[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['performance', 'cost', 'resource']);
  const [filterCriteria, setFilterCriteria] = useState<{
    priority: string;
    category: string;
    impact: string;
    difficulty: string;
  }>({
    priority: 'all',
    category: 'all',
    impact: 'all',
    difficulty: 'all'
  });

  // Refs for D3 visualizations
  const performanceChartRef = useRef<SVGSVGElement>(null);
  const resourceMapRef = useRef<SVGSVGElement>(null);
  const optimizationTimelineRef = useRef<SVGSVGElement>(null);
  const bottleneckHeatmapRef = useRef<SVGSVGElement>(null);

  // Load Optimization Data
  useEffect(() => {
    if (pipelineId) {
      loadOptimizationData();
    }
  }, [pipelineId]);

  const loadOptimizationData = async () => {
    try {
      setIsAnalyzing(true);

      // Load performance metrics
      const metrics = await getPerformanceMetrics(pipelineId);
      setPerformanceMetrics(metrics);

      // Load optimization history
      const history = await getOptimizationHistory(pipelineId);
      setOptimizationHistory(history);

      // Generate recommendations
      const recommendations = await generateRecommendations(pipelineId);
      setCurrentRecommendations(recommendations);

      // Analyze resource utilization
      const resourceData = await analyzeResourceUtilization(pipelineId);
      setResourceAnalysis(resourceData);

      // Analyze cost efficiency
      const costData = await analyzeCostEfficiency(pipelineId);
      setCostAnalysis(costData);

      // Predict bottlenecks
      const bottlenecks = await predictPipelineBottlenecks(pipelineId);
      setBottleneckPredictions(bottlenecks);

      // Get AI insights
      const insights = await getAIRecommendations('pipeline-optimization', { pipelineId });
      setAiInsights(insights);

      // Track activity
      await trackActivity('pipeline_optimization_viewed', {
        pipelineId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading optimization data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real-time Metrics Updates
  useEffect(() => {
    const interval = setInterval(async () => {
      if (pipelineId && activeTab === 'realtime') {
        try {
          const metrics = await getPerformanceMetrics(pipelineId);
          setRealTimeMetrics(prev => [...prev.slice(-49), metrics]);
        } catch (error) {
          console.error('Error fetching real-time metrics:', error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pipelineId, activeTab]);

  // Performance Chart Visualization
  useEffect(() => {
    if (performanceMetrics && performanceChartRef.current) {
      renderPerformanceChart();
    }
  }, [performanceMetrics]);

  // Resource Map Visualization
  useEffect(() => {
    if (resourceAnalysis && resourceMapRef.current) {
      renderResourceMap();
    }
  }, [resourceAnalysis]);

  // Optimization Timeline Visualization
  useEffect(() => {
    if (optimizationHistory && optimizationTimelineRef.current) {
      renderOptimizationTimeline();
    }
  }, [optimizationHistory]);

  // Bottleneck Heatmap Visualization
  useEffect(() => {
    if (bottleneckPredictions && bottleneckHeatmapRef.current) {
      renderBottleneckHeatmap();
    }
  }, [bottleneckPredictions]);

  const renderPerformanceChart = () => {
    if (!performanceChartRef.current || !performanceMetrics) return;

    const svg = d3.select(performanceChartRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sample performance data
    const data = performanceMetrics.timeline || [];

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.timestamp)))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));

    // Add line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(new Date(d.timestamp)))
      .attr("cy", d => y(d.value))
      .attr("r", 4)
      .attr("fill", "#3b82f6");
  };

  const renderResourceMap = () => {
    if (!resourceMapRef.current || !resourceAnalysis) return;

    const svg = d3.select(resourceMapRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Resource utilization treemap
    const hierarchy = d3.hierarchy(resourceAnalysis.resourceTree)
      .sum(d => d.utilization)
      .sort((a, b) => b.utilization - a.utilization);

    const treemap = d3.treemap()
      .size([width, height])
      .padding(2);

    treemap(hierarchy);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const cell = svg.selectAll("g")
      .data(hierarchy.leaves())
      .enter().append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", (d, i) => color(i))
      .attr("opacity", 0.7);

    cell.append("text")
      .attr("x", 4)
      .attr("y", 20)
      .text(d => d.data.name)
      .attr("font-size", "12px")
      .attr("fill", "white");
  };

  const renderOptimizationTimeline = () => {
    if (!optimizationTimelineRef.current || !optimizationHistory.length) return;

    const svg = d3.select(optimizationTimelineRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 200 - margin.bottom - margin.top;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(optimizationHistory, d => new Date(d.timestamp)))
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(optimizationHistory.map(d => d.type))
      .range([0, height])
      .padding(0.1);

    // Add timeline bars
    g.selectAll(".timeline-bar")
      .data(optimizationHistory)
      .enter().append("rect")
      .attr("class", "timeline-bar")
      .attr("x", d => x(new Date(d.timestamp)))
      .attr("y", d => y(d.type))
      .attr("width", 4)
      .attr("height", y.bandwidth())
      .attr("fill", d => d.success ? "#10b981" : "#ef4444");

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));
  };

  const renderBottleneckHeatmap = () => {
    if (!bottleneckHeatmapRef.current || !bottleneckPredictions.length) return;

    const svg = d3.select(bottleneckHeatmapRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;
    const cellSize = 20;

    const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0, d3.max(bottleneckPredictions, d => d.severity)]);

    const rows = Math.ceil(height / cellSize);
    const cols = Math.ceil(width / cellSize);

    svg.selectAll("rect")
      .data(bottleneckPredictions)
      .enter().append("rect")
      .attr("x", (d, i) => (i % cols) * cellSize)
      .attr("y", (d, i) => Math.floor(i / cols) * cellSize)
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .attr("fill", d => colorScale(d.severity))
      .append("title")
      .text(d => `${d.stage}: ${d.description} (Severity: ${d.severity})`);
  };

  const handleOptimizePipeline = async () => {
    if (!pipelineId) return;

    try {
      setIsOptimizing(true);

      const optimizationConfig = {
        strategy: optimizationStrategy,
        goals: optimizationGoals,
        targets: performanceTargets,
        constraints: resourceConstraints
      };

      const result = await optimizePipelinePerformance(pipelineId, optimizationConfig);
      
      if (result.success) {
        setSelectedOptimization(result.optimization);
        await loadOptimizationData(); // Refresh data

        if (onOptimizationComplete) {
          onOptimizationComplete(result.optimization);
        }

        await trackActivity('pipeline_optimized', {
          pipelineId,
          optimizationType: optimizationStrategy,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error optimizing pipeline:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyRecommendation = async (recommendation: OptimizationRecommendation) => {
    try {
      const result = await applyOptimization(pipelineId, recommendation.id);
      
      if (result.success) {
        await loadOptimizationData(); // Refresh data

        if (onRecommendationApplied) {
          onRecommendationApplied(recommendation);
        }

        await trackActivity('optimization_recommendation_applied', {
          pipelineId,
          recommendationId: recommendation.id,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error applying recommendation:', error);
    }
  };

  const filteredRecommendations = useMemo(() => {
    return currentRecommendations.filter(rec => {
      if (filterCriteria.priority !== 'all' && rec.priority !== filterCriteria.priority) return false;
      if (filterCriteria.category !== 'all' && rec.category !== filterCriteria.category) return false;
      if (filterCriteria.impact !== 'all' && rec.impact !== filterCriteria.impact) return false;
      if (filterCriteria.difficulty !== 'all' && rec.difficulty !== filterCriteria.difficulty) return false;
      return true;
    });
  }, [currentRecommendations, filterCriteria]);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'resource': return <Cpu className="h-4 w-4" />;
      case 'architecture': return <GitBranch className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (pipelineLoading || isAnalyzing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Analyzing Pipeline Performance...</p>
          <p className="text-sm text-muted-foreground">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`intelligent-pipeline-optimizer h-full ${className}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Intelligent Pipeline Optimizer</h2>
              <p className="text-muted-foreground">AI-powered optimization and performance analysis</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
              <Button
                onClick={handleOptimizePipeline}
                disabled={isOptimizing}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize Pipeline
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics?.overallScore || 85}%
                    </div>
                    <Progress value={performanceMetrics?.overallScore || 85} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resource Efficiency</CardTitle>
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {resourceAnalysis?.efficiency || 72}%
                    </div>
                    <Progress value={resourceAnalysis?.efficiency || 72} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cost Optimization</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${costAnalysis?.potentialSavings || 1250}/mo
                    </div>
                    <p className="text-xs text-muted-foreground">Potential savings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Recommendations</CardTitle>
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentRecommendations.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentRecommendations.filter(r => r.priority === 'critical').length} critical
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Timeline</CardTitle>
                  <CardDescription>Pipeline performance metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <svg ref={performanceChartRef} width="800" height="400" />
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                          <Badge variant={insight.confidence > 0.8 ? 'default' : 'secondary'}>
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={filterCriteria.priority}
                        onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Select
                        value={filterCriteria.category}
                        onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="cost">Cost</SelectItem>
                          <SelectItem value="resource">Resource</SelectItem>
                          <SelectItem value="architecture">Architecture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Impact</Label>
                      <Select
                        value={filterCriteria.impact}
                        onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, impact: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={filterCriteria.difficulty}
                        onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations List */}
              <div className="space-y-4">
                {filteredRecommendations.map((recommendation, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getRecommendationIcon(recommendation.type)}
                            <h3 className="font-semibold">{recommendation.title}</h3>
                            <Badge variant={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">
                            {recommendation.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label className="text-xs">Expected Impact</Label>
                              <p className="font-medium">{recommendation.expectedImpact}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Implementation Time</Label>
                              <p className="font-medium">{recommendation.estimatedTime}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Cost Savings</Label>
                              <p className="font-medium">${recommendation.costSavings}/mo</p>
                            </div>
                          </div>

                          {recommendation.steps && (
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  View Implementation Steps
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2">
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                  {recommendation.steps.map((step, stepIndex) => (
                                    <li key={stepIndex}>{step}</li>
                                  ))}
                                </ol>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApplyRecommendation(recommendation)}
                            className="bg-gradient-to-r from-green-600 to-blue-600"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Apply
                          </Button>
                          <Button variant="outline" size="sm">
                            <BookOpen className="h-4 w-4 mr-1" />
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceMetrics?.timeline || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="throughput" stroke="#3b82f6" />
                        <Line type="monotone" dataKey="latency" stroke="#ef4444" />
                        <Line type="monotone" dataKey="errorRate" stroke="#f59e0b" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stage Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceMetrics?.stageMetrics || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="duration" fill="#3b82f6" />
                        <Bar dataKey="memory" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Baseline Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Baseline Comparison</CardTitle>
                  <CardDescription>Current performance vs. historical baseline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={benchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="current" fill="#3b82f6" name="Current" />
                      <Bar dataKey="baseline" fill="#64748b" name="Baseline" />
                      <Line type="monotone" dataKey="improvement" stroke="#10b981" name="Improvement %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              {/* Resource Utilization Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization Map</CardTitle>
                  <CardDescription>Visual representation of resource allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <svg ref={resourceMapRef} width="600" height="400" />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CPU & Memory Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>CPU & Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={resourceAnalysis?.usage || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                        <Area type="monotone" dataKey="memory" stackId="1" stroke="#10b981" fill="#10b981" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Storage & Network */}
                <Card>
                  <CardHeader>
                    <CardTitle>Storage & Network</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={resourceAnalysis?.networkStorage || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="storage" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                        <Area type="monotone" dataKey="network" stackId="1" stroke="#ef4444" fill="#ef4444" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Resource Optimization Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Optimization Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resourceAnalysis?.optimizationSuggestions?.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Server className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{suggestion.resource}</h4>
                            <p className="text-sm text-muted-foreground">{suggestion.recommendation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            {suggestion.potentialSavings}% savings
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.difficulty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cost Analysis Tab */}
            <TabsContent value="cost" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={costAnalysis?.breakdown || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: $${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(costAnalysis?.breakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={d3.schemeCategory10[index % 10]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Cost Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={costAnalysis?.trends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="actual" stroke="#3b82f6" />
                        <Line type="monotone" dataKey="projected" stroke="#f59e0b" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Optimization Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Optimization Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costAnalysis?.optimizationOpportunities?.map((opportunity, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{opportunity.title}</h4>
                          <Badge variant="outline">
                            ${opportunity.potentialSavings}/mo
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {opportunity.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs">Impact: {opportunity.impact}</span>
                            <span className="text-xs">Effort: {opportunity.effort}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Apply Optimization
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-6">
              {/* Bottleneck Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle>Bottleneck Prediction Heatmap</CardTitle>
                  <CardDescription>Predicted bottlenecks across pipeline stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <svg ref={bottleneckHeatmapRef} width="600" height="400" />
                </CardContent>
              </Card>

              {/* Bottleneck List */}
              <Card>
                <CardHeader>
                  <CardTitle>Predicted Bottlenecks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bottleneckPredictions.map((bottleneck, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className={`h-5 w-5 ${
                              bottleneck.severity >= 8 ? 'text-red-600' :
                              bottleneck.severity >= 5 ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                            <h4 className="font-medium">{bottleneck.stage}</h4>
                          </div>
                          <Badge variant={
                            bottleneck.severity >= 8 ? 'destructive' :
                            bottleneck.severity >= 5 ? 'default' :
                            'secondary'
                          }>
                            Severity: {bottleneck.severity}/10
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {bottleneck.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">
                            Predicted in: {bottleneck.timeframe}
                          </span>
                          <Button size="sm" variant="outline">
                            View Mitigation
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Real-time Tab */}
            <TabsContent value="realtime" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Performance Monitoring</CardTitle>
                  <CardDescription>Live performance metrics updated every 5 seconds</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={realTimeMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="errorRate" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Real-time Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Current Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {realTimeMetrics[realTimeMetrics.length - 1]?.throughput || 0} req/s
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Latency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {realTimeMetrics[realTimeMetrics.length - 1]?.latency || 0}ms
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {realTimeMetrics[realTimeMetrics.length - 1]?.errorRate || 0}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active Connections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {realTimeMetrics[realTimeMetrics.length - 1]?.connections || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}