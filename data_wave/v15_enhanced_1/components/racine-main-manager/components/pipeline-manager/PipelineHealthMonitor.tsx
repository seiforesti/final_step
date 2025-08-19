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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

// Advanced Chart Libraries
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Sankey, ComposedChart } from 'recharts';
import * as d3 from 'd3';

// Icons
import { 
  Activity, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, 
  Zap, Heart, Shield, Eye, Settings, Refresh, Play, Pause, Stop, Download, 
  Upload, Filter, Search, MoreVertical, MoreHorizontal, Bell, BellOff,
  Target, Gauge, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Monitor, Server, Database, Cpu, MemoryStick, HardDrive, Network, Wifi,
  AlertCircle, Info, Warning, CheckCircle2, X, Plus, Minus, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, RotateCcw, RotateCw, Maximize, Minimize, Expand,
  Calendar as CalendarIcon, Clock as ClockIcon, Timer, Stopwatch, 
  Users, User, UserCheck, UserX, Crown, Lock, Unlock, Key,
  FileText, File, Folder, FolderOpen, Archive, Trash2, Edit3, Copy,
  Share, ExternalLink, Link, Unlink, Globe, MapPin, Compass, Navigation
} from 'lucide-react';

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
  monitorPipelineHealth,
  getPipelineHealthMetrics,
  generateHealthAlerts,
  diagnosePipelineIssues,
  getHealthTrends,
  validatePipelineIntegrity,
  getSystemHealthStatus,
  monitorResourceHealth,
  analyzeHealthPatterns,
  predictHealthIssues,
  getComplianceHealthStatus,
  validateCrossGroupHealth,
  performHealthDiagnostics,
  getHealthRecommendations,
  analyzePerformanceBottlenecks,
  generateHealthReport,
  optimizeHealthConfiguration,
  validateHealthThresholds,
  getHealthCorrelationAnalysis,
  predictSystemFailures,
  generateHealthInsights,
  analyzeHealthTrends,
  getHealthAnomalies,
  validateSystemIntegrity,
  getHealthForecasting,
  analyzeResourceUtilization,
  getHealthOptimizationSuggestions
} from '../../utils/pipeline-backend-integration';

// Types from racine-core.types
import {
  Pipeline,
  PipelineHealth,
  HealthMetrics,
  HealthAlert,
  HealthTrend,
  SystemHealth,
  ResourceHealth,
  HealthDiagnostic,
  HealthPattern,
  HealthThreshold,
  ComplianceHealth,
  CrossGroupHealth,
  HealthAnomaly,
  HealthInsight,
  HealthReport,
  HealthConfiguration,
  HealthCorrelation,
  HealthForecasting,
  ResourceUtilization,
  PerformanceMetrics,
  SystemIntegrity,
  HealthOptimization,
  AlertConfiguration,
  MonitoringRule,
  HealthDashboard,
  HealthVisualization,
  DiagnosticResult,
  HealthRecommendation,
  HealthAnalytics,
  ThresholdConfig,
  NotificationConfig,
  HealthStatus,
  SystemStatus,
  ComponentHealth,
  ServiceHealth,
  NetworkHealth,
  SecurityHealth,
  DataHealth
} from '../../types/racine-core.types';

// Health Status Colors and Icons
const HEALTH_STATUS_CONFIG = {
  excellent: { color: '#10B981', icon: CheckCircle2, label: 'Excellent' },
  good: { color: '#059669', icon: CheckCircle, label: 'Good' },
  warning: { color: '#F59E0B', icon: AlertTriangle, label: 'Warning' },
  critical: { color: '#EF4444', icon: AlertCircle, label: 'Critical' },
  error: { color: '#DC2626', icon: XCircle, label: 'Error' },
  unknown: { color: '#6B7280', icon: Clock, label: 'Unknown' },
  maintenance: { color: '#8B5CF6', icon: Settings, label: 'Maintenance' },
  degraded: { color: '#F97316', icon: TrendingDown, label: 'Degraded' }
};

// Health Monitoring Strategies
const MONITORING_STRATEGIES = {
  realtime: { interval: 1000, label: 'Real-time', icon: Activity },
  frequent: { interval: 5000, label: 'Frequent (5s)', icon: Refresh },
  normal: { interval: 30000, label: 'Normal (30s)', icon: Clock },
  moderate: { interval: 60000, label: 'Moderate (1m)', icon: Timer },
  conservative: { interval: 300000, label: 'Conservative (5m)', icon: Stopwatch }
};

// Health Visualization Types
const VISUALIZATION_TYPES = {
  timeline: { label: 'Timeline View', icon: LineChartIcon },
  dashboard: { label: 'Dashboard View', icon: Monitor },
  heatmap: { label: 'Heatmap View', icon: BarChart3 },
  network: { label: 'Network View', icon: Network },
  treemap: { label: 'Treemap View', icon: PieChartIcon },
  sankey: { label: 'Flow View', icon: Zap }
};

// Component Health Categories
const HEALTH_CATEGORIES = {
  system: { label: 'System Health', icon: Server, color: '#3B82F6' },
  performance: { label: 'Performance', icon: Gauge, color: '#10B981' },
  resources: { label: 'Resources', icon: Cpu, color: '#F59E0B' },
  network: { label: 'Network', icon: Wifi, color: '#8B5CF6' },
  security: { label: 'Security', icon: Shield, color: '#EF4444' },
  compliance: { label: 'Compliance', icon: CheckCircle, color: '#059669' },
  data: { label: 'Data Quality', icon: Database, color: '#06B6D4' },
  integration: { label: 'Integration', icon: Link, color: '#EC4899' }
};

/**
 * PipelineHealthMonitor - Enterprise-Grade Health Monitoring System
 * 
 * Advanced health monitoring system that provides real-time visibility into
 * pipeline health, system performance, resource utilization, and predictive
 * analytics for proactive issue resolution.
 * 
 * Key Features:
 * - Real-time health monitoring with configurable intervals
 * - Predictive analytics and anomaly detection
 * - Cross-group health correlation analysis
 * - Advanced alerting and notification system
 * - Comprehensive health reporting and analytics
 * - Resource utilization and performance optimization
 * - Compliance and security health tracking
 * - Intelligent diagnostic and recommendation engine
 */
const PipelineHealthMonitor: React.FC = () => {
  // Racine System Hooks
  const {
    pipelines,
    healthMetrics,
    monitoringConfig,
    updateMonitoringSettings,
    getHealthStatus,
    generateHealthReport: generateReport
  } = usePipelineManagement();

  const {
    orchestrationHealth,
    systemStatus,
    getOrchestrationMetrics,
    validateSystemIntegrity: validateIntegrity
  } = useRacineOrchestration();

  const {
    crossGroupHealth,
    integrationStatus,
    getCrossGroupMetrics,
    validateCrossGroupConnections
  } = useCrossGroupIntegration();

  const { currentUser, userPermissions } = useUserManagement();
  const { currentWorkspace, workspaceResources } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { getHealthInsights, predictIssues, getRecommendations } = useAIAssistant();

  // Core State Management
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [healthData, setHealthData] = useState<PipelineHealth[]>([]);
  const [systemHealthData, setSystemHealthData] = useState<SystemHealth | null>(null);
  const [resourceHealthData, setResourceHealthData] = useState<ResourceHealth[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [diagnostics, setDiagnostics] = useState<HealthDiagnostic[]>([]);
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [healthAnomalies, setHealthAnomalies] = useState<HealthAnomaly[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVisualization, setSelectedVisualization] = useState('dashboard');
  const [monitoringStrategy, setMonitoringStrategy] = useState('normal');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedCategory, setSelectedCategory] = useState('system');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [filterCriteria, setFilterCriteria] = useState({
    status: 'all',
    category: 'all',
    severity: 'all',
    group: 'all'
  });

  // Configuration State
  const [healthThresholds, setHealthThresholds] = useState<HealthThreshold[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfiguration | null>(null);
  const [monitoringRules, setMonitoringRules] = useState<MonitoringRule[]>([]);
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig | null>(null);

  // Advanced Features State
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<HealthForecasting | null>(null);
  const [correlationAnalysis, setCorrelationAnalysis] = useState<HealthCorrelation[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<HealthOptimization[]>([]);
  const [complianceHealth, setComplianceHealth] = useState<ComplianceHealth | null>(null);

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for D3 visualizations
  const timelineRef = useRef<SVGSVGElement>(null);
  const heatmapRef = useRef<SVGSVGElement>(null);
  const networkRef = useRef<SVGSVGElement>(null);
  const treemapRef = useRef<SVGSVGElement>(null);

  // Real-time Monitoring Effect
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = MONITORING_STRATEGIES[monitoringStrategy as keyof typeof MONITORING_STRATEGIES].interval;
    
    const monitoringTimer = setInterval(async () => {
      try {
        // Fetch real-time health data
        const [
          pipelineHealthData,
          systemHealth,
          resourceHealth,
          alerts,
          trends,
          anomalies,
          insights
        ] = await Promise.all([
          getPipelineHealthMetrics(),
          getSystemHealthStatus(),
          monitorResourceHealth(),
          generateHealthAlerts(),
          getHealthTrends(),
          getHealthAnomalies(),
          getHealthInsights()
        ]);

        setHealthData(pipelineHealthData);
        setSystemHealthData(systemHealth);
        setResourceHealthData(resourceHealth);
        setHealthAlerts(alerts);
        setHealthTrends(trends);
        setHealthAnomalies(anomalies);
        setHealthInsights(insights);

        // Track monitoring activity
        trackActivity({
          action: 'health_monitoring_update',
          details: {
            strategy: monitoringStrategy,
            pipelines: pipelineHealthData.length,
            alerts: alerts.length,
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        console.error('Health monitoring error:', error);
        setError('Failed to fetch health data');
      }
    }, interval);

    return () => clearInterval(monitoringTimer);
  }, [isMonitoring, monitoringStrategy, trackActivity]);

  // Predictive Analytics Effect
  useEffect(() => {
    const generatePredictiveAnalytics = async () => {
      try {
        const [
          forecasting,
          correlations,
          optimizations,
          compliance
        ] = await Promise.all([
          getHealthForecasting(),
          getHealthCorrelationAnalysis(),
          getHealthOptimizationSuggestions(),
          getComplianceHealthStatus()
        ]);

        setPredictiveAnalytics(forecasting);
        setCorrelationAnalysis(correlations);
        setOptimizationSuggestions(optimizations);
        setComplianceHealth(compliance);
      } catch (error) {
        console.error('Predictive analytics error:', error);
      }
    };

    generatePredictiveAnalytics();
  }, [healthData]);

  // Configuration Loading Effect
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        // Load health monitoring configuration
        // This would come from backend configuration service
        const defaultThresholds: HealthThreshold[] = [
          { metric: 'cpu_usage', warning: 70, critical: 90 },
          { metric: 'memory_usage', warning: 80, critical: 95 },
          { metric: 'response_time', warning: 1000, critical: 5000 },
          { metric: 'error_rate', warning: 5, critical: 10 },
          { metric: 'throughput', warning: 100, critical: 50 }
        ];

        setHealthThresholds(defaultThresholds);
      } catch (error) {
        console.error('Configuration loading error:', error);
      }
    };

    loadConfiguration();
  }, []);

  // Performance Diagnostics
  const runDiagnostics = useCallback(async (pipelineId?: string) => {
    setIsLoading(true);
    try {
      const diagnosticResults = await performHealthDiagnostics(pipelineId);
      setDiagnostics(diagnosticResults);
      
      trackActivity({
        action: 'health_diagnostics_run',
        details: {
          pipelineId,
          resultsCount: diagnosticResults.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Diagnostics error:', error);
      setError('Failed to run diagnostics');
    } finally {
      setIsLoading(false);
    }
  }, [trackActivity]);

  // Generate Health Report
  const generateHealthReport = useCallback(async (timeRange: string) => {
    setIsGeneratingReport(true);
    try {
      const report = await generateHealthReport(timeRange);
      
      // Trigger download or display report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      trackActivity({
        action: 'health_report_generated',
        details: { timeRange, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Report generation error:', error);
      setError('Failed to generate health report');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [trackActivity]);

  // Toggle Section Expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);

  // Filter Health Data
  const filteredHealthData = useMemo(() => {
    return healthData.filter(health => {
      if (filterCriteria.status !== 'all' && health.status !== filterCriteria.status) return false;
      if (filterCriteria.category !== 'all' && health.category !== filterCriteria.category) return false;
      if (filterCriteria.severity !== 'all' && health.severity !== filterCriteria.severity) return false;
      return true;
    });
  }, [healthData, filterCriteria]);

  // Calculate Overall Health Score
  const overallHealthScore = useMemo(() => {
    if (healthData.length === 0) return 0;
    
    const totalScore = healthData.reduce((sum, health) => sum + health.score, 0);
    return Math.round(totalScore / healthData.length);
  }, [healthData]);

  // Get Health Status Color
  const getHealthStatusColor = useCallback((status: string) => {
    return HEALTH_STATUS_CONFIG[status as keyof typeof HEALTH_STATUS_CONFIG]?.color || '#6B7280';
  }, []);

  // Get Health Status Icon
  const getHealthStatusIcon = useCallback((status: string) => {
    return HEALTH_STATUS_CONFIG[status as keyof typeof HEALTH_STATUS_CONFIG]?.icon || Clock;
  }, []);

  // D3 Timeline Visualization
  useEffect(() => {
    if (!timelineRef.current || healthTrends.length === 0) return;

    const svg = d3.select(timelineRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
      .domain(d3.extent(healthTrends, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    const line = d3.line<HealthTrend>()
      .x(d => xScale(new Date(d.timestamp)))
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale));

    // Add line
    g.append("path")
      .datum(healthTrends)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots
    g.selectAll(".dot")
      .data(healthTrends)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(new Date(d.timestamp)))
      .attr("cy", d => yScale(d.score))
      .attr("r", 4)
      .attr("fill", d => getHealthStatusColor(d.status));

  }, [healthTrends, getHealthStatusColor]);

  // D3 Heatmap Visualization
  useEffect(() => {
    if (!heatmapRef.current || resourceHealthData.length === 0) return;

    const svg = d3.select(heatmapRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const resources = Array.from(new Set(resourceHealthData.map(d => d.resource)));
    const metrics = Array.from(new Set(resourceHealthData.map(d => d.metric)));

    const xScale = d3.scaleBand()
      .domain(metrics)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(resources)
      .range([0, height])
      .padding(0.1);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([0, 100]);

    // Add heatmap rectangles
    g.selectAll(".cell")
      .data(resourceHealthData)
      .enter().append("rect")
      .attr("class", "cell")
      .attr("x", d => xScale(d.metric) || 0)
      .attr("y", d => yScale(d.resource) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.value))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale));

  }, [resourceHealthData]);

  // Render Health Overview Dashboard
  const renderHealthOverview = () => (
    <div className="space-y-6">
      {/* Health Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{overallHealthScore}%</div>
              <Badge 
                variant={overallHealthScore >= 80 ? "default" : overallHealthScore >= 60 ? "secondary" : "destructive"}
              >
                {overallHealthScore >= 80 ? 'Excellent' : overallHealthScore >= 60 ? 'Good' : 'Critical'}
              </Badge>
            </div>
            <Progress value={overallHealthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="text-2xl font-bold">{healthAlerts.length}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {healthAlerts.filter(a => a.severity === 'critical').length} Critical
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipelines Monitored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold">{healthData.length}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {healthData.filter(h => h.status === 'healthy').length} Healthy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div className="text-2xl font-bold">{healthAnomalies.length}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {healthAnomalies.filter(a => a.severity === 'high').length} High Priority
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Health Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChartIcon className="h-5 w-5" />
            <span>Health Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg ref={timelineRef} width={800} height={300} />
        </CardContent>
      </Card>

      {/* Resource Health Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Resource Health Heatmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg ref={heatmapRef} width={600} height={400} />
        </CardContent>
      </Card>
    </div>
  );

  // Render Active Alerts Section
  const renderActiveAlerts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Active Health Alerts</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            {showAlerts ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {showAlerts ? 'Mute' : 'Unmute'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {healthAlerts.map((alert, index) => {
          const StatusIcon = getHealthStatusIcon(alert.severity);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Alert className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'warning' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <StatusIcon className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.title}</span>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  {alert.description}
                  <div className="mt-2 text-xs text-gray-500">
                    Pipeline: {alert.pipelineId} • {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // Render Diagnostics Section
  const renderDiagnostics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Health Diagnostics</h3>
        <Button onClick={() => runDiagnostics()} disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <RotateCw className="h-4 w-4 animate-spin" />
              <span>Running...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Run Diagnostics</span>
            </div>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Bottlenecks</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {diagnostics
                .filter(d => d.category === 'performance')
                .map((diagnostic, index) => (
                  <div key={index} className="p-3 border rounded-lg mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{diagnostic.issue}</span>
                      <Badge variant={diagnostic.severity === 'high' ? 'destructive' : 'secondary'}>
                        {diagnostic.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{diagnostic.description}</p>
                    {diagnostic.recommendation && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <strong>Recommendation:</strong> {diagnostic.recommendation}
                      </div>
                    )}
                  </div>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {diagnostics
                .filter(d => d.category === 'resources')
                .map((diagnostic, index) => (
                  <div key={index} className="p-3 border rounded-lg mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{diagnostic.issue}</span>
                      <Badge variant={diagnostic.severity === 'high' ? 'destructive' : 'secondary'}>
                        {diagnostic.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{diagnostic.description}</p>
                    {diagnostic.recommendation && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                        <strong>Recommendation:</strong> {diagnostic.recommendation}
                      </div>
                    )}
                  </div>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render Predictive Analytics Section
  const renderPredictiveAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Predictive Health Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Health Forecasting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictiveAnalytics && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Predicted Health Score (24h)</span>
                  <span className="font-bold">{predictiveAnalytics.predicted_score}%</span>
                </div>
                <Progress value={predictiveAnalytics.predicted_score} />
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Predicted Issues:</div>
                  {predictiveAnalytics.predicted_issues.map((issue, index) => (
                    <Alert key={index} className="py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {issue.description} - Probability: {issue.probability}%
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Network className="h-5 w-5" />
              <span>Health Correlations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {correlationAnalysis.map((correlation, index) => (
                <div key={index} className="p-3 border rounded-lg mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{correlation.metric_1} ↔ {correlation.metric_2}</span>
                    <Badge variant={correlation.strength > 0.7 ? 'default' : 'secondary'}>
                      {(correlation.strength * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{correlation.description}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Optimization Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{suggestion.title}</span>
                  <Badge variant="outline">
                    Impact: {suggestion.impact}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                <div className="text-sm">
                  <strong>Expected Benefit:</strong> {suggestion.expected_benefit}
                </div>
                <Button size="sm" className="mt-2" onClick={() => {
                  // Implement optimization suggestion
                  trackActivity({
                    action: 'optimization_applied',
                    details: { suggestion: suggestion.title }
                  });
                }}>
                  Apply Optimization
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Configuration Section
  const renderConfiguration = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Health Monitoring Configuration</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monitoring Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Monitoring Strategy</Label>
              <Select value={monitoringStrategy} onValueChange={setMonitoringStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MONITORING_STRATEGIES).map(([key, strategy]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <strategy.icon className="h-4 w-4" />
                        <span>{strategy.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={isMonitoring} 
                onCheckedChange={setIsMonitoring}
                id="monitoring-toggle"
              />
              <Label htmlFor="monitoring-toggle">Enable Real-time Monitoring</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={showAlerts} 
                onCheckedChange={setShowAlerts}
                id="alerts-toggle"
              />
              <Label htmlFor="alerts-toggle">Show Health Alerts</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {healthThresholds.map((threshold, index) => (
                <div key={index} className="space-y-2 mb-4 p-3 border rounded-lg">
                  <div className="font-medium">{threshold.metric}</div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Warning Threshold</Label>
                      <Slider
                        value={[threshold.warning]}
                        onValueChange={(value) => {
                          const newThresholds = [...healthThresholds];
                          newThresholds[index].warning = value[0];
                          setHealthThresholds(newThresholds);
                        }}
                        max={100}
                        step={1}
                        className="mt-1"
                      />
                      <div className="text-xs text-gray-500">{threshold.warning}%</div>
                    </div>
                    <div>
                      <Label className="text-xs">Critical Threshold</Label>
                      <Slider
                        value={[threshold.critical]}
                        onValueChange={(value) => {
                          const newThresholds = [...healthThresholds];
                          newThresholds[index].critical = value[0];
                          setHealthThresholds(newThresholds);
                        }}
                        max={100}
                        step={1}
                        className="mt-1"
                      />
                      <div className="text-xs text-gray-500">{threshold.critical}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Main Component Render
  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500" />
                <h1 className="text-2xl font-bold">Pipeline Health Monitor</h1>
              </div>
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? 'Live' : 'Paused'}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => generateHealthReport('1h')}>
                    Last Hour Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateHealthReport('24h')}>
                    Daily Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateHealthReport('7d')}>
                    Weekly Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={() => runDiagnostics()}
                disabled={isLoading}
              >
                <Activity className="h-4 w-4 mr-2" />
                Diagnose
              </Button>

              <Button
                variant={isMonitoring ? "secondary" : "default"}
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={75}>
              <div className="h-full p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="h-full mt-4">
                    <ScrollArea className="h-full">
                      {renderHealthOverview()}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="alerts" className="h-full mt-4">
                    <ScrollArea className="h-full">
                      {renderActiveAlerts()}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="diagnostics" className="h-full mt-4">
                    <ScrollArea className="h-full">
                      {renderDiagnostics()}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="analytics" className="h-full mt-4">
                    <ScrollArea className="h-full">
                      {renderPredictiveAnalytics()}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="config" className="h-full mt-4">
                    <ScrollArea className="h-full">
                      {renderConfiguration()}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full p-4 bg-white border-l">
                <h3 className="font-semibold mb-4">Health Insights</h3>
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {healthInsights.map((insight, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{insight.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{insight.description}</div>
                            <div className="text-xs text-gray-400 mt-2">
                              {new Date(insight.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 max-w-sm"
            >
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Health Monitor Error</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setError(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default PipelineHealthMonitor;