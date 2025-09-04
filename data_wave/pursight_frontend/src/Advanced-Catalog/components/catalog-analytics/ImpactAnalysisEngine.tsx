'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Progress 
} from "@/components/ui/progress";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  cn 
} from "@/lib copie/utils";
import { format, subDays, parseISO } from "date-fns";
import { Download, Filter, MoreHorizontal, RefreshCw, Settings, Share, AlertTriangle, CheckCircle, XCircle, Info, Database, Target, Network, GitBranch, Layers, Activity, Zap, Shield, Eye, Search, Clock, Calendar, Users, FileType, ArrowRight, ArrowDown, ArrowUp, Minus, Plus, ChevronRight, ChevronDown, ExternalLink, Copy, Workflow, TreePine, MapPin, Navigation, Compass, Route, Flag, Bookmark, Star, Heart, ThumbsUp, MessageSquare, Bell, Lock, Unlock, Key, Crown, Award, Sparkles, Brain, Cpu, HardDrive, Monitor, Smartphone, Tablet, Watch, Mic, Speaker, Headphones, Volume2, VolumeX, Play, Pause, Square, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart as RechartsLineChart, 
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
  Sankey,
  Treemap,
  ComposedChart,
  ScatterChart as RechartsScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Import types and services
import { 
  ImpactAnalysis,
  DataLineage,
  DependencyMap,
  ImpactAssessment,
  RiskAnalysis,
  ChangeImpact,
  LineageNode,
  LineageEdge,
  ImpactMetrics,
  CatalogApiResponse
} from '../../types';

import { impactAnalysisService, catalogAnalyticsService } from '../../services';
import { useCatalogAnalytics } from '../../hooks';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface ImpactAnalysisEngineProps {
  className?: string;
  embedded?: boolean;
  assetId?: string;
  analysisType?: 'change' | 'deletion' | 'update' | 'migration';
  onImpactDetected?: (impact: ImpactAssessment) => void;
  onError?: (error: Error) => void;
}

interface ImpactConfiguration {
  analysisDepth: 'immediate' | 'intermediate' | 'comprehensive';
  includeUpstream: boolean;
  includeDownstream: boolean;
  maxDepth: number;
  riskThreshold: 'low' | 'medium' | 'high' | 'critical';
  impactTypes: ('data' | 'schema' | 'logic' | 'performance' | 'security')[];
  timeHorizon: '1d' | '1w' | '1m' | '3m' | '1y';
  weightings: {
    criticality: number;
    usage: number;
    dependencies: number;
    business_value: number;
  };
}

interface ChangeScenario {
  id: string;
  type: 'schema_change' | 'data_migration' | 'asset_removal' | 'logic_update' | 'system_upgrade';
  title: string;
  description: string;
  targetAssets: string[];
  estimatedDuration: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  impacts: ImpactAssessment[];
}

interface ImpactVisualization {
  type: 'graph' | 'tree' | 'sankey' | 'matrix' | 'timeline';
  layout: 'horizontal' | 'vertical' | 'circular' | 'force-directed';
  showLabels: boolean;
  showMetrics: boolean;
  colorBy: 'risk' | 'type' | 'criticality' | 'usage';
  filterBy: string[];
}

interface RiskMetric {
  category: string;
  score: number;
  factors: Array<{
    name: string;
    weight: number;
    value: number;
    impact: string;
  }>;
  recommendations: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ANALYSIS_DEPTHS = [
  { value: 'immediate', label: 'Immediate Dependencies', description: 'Direct connections only' },
  { value: 'intermediate', label: 'Intermediate Analysis', description: '2-3 levels of dependencies' },
  { value: 'comprehensive', label: 'Comprehensive Analysis', description: 'Full dependency tree' }
];

const IMPACT_TYPES = [
  { value: 'data', label: 'Data Impact', icon: Database, color: '#3b82f6' },
  { value: 'schema', label: 'Schema Changes', icon: Layers, color: '#10b981' },
  { value: 'logic', label: 'Business Logic', icon: Brain, color: '#f59e0b' },
  { value: 'performance', label: 'Performance', icon: Zap, color: '#ef4444' },
  { value: 'security', label: 'Security', icon: Shield, color: '#8b5cf6' }
];

const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', color: '#10b981', threshold: 0.3 },
  { value: 'medium', label: 'Medium Risk', color: '#f59e0b', threshold: 0.6 },
  { value: 'high', label: 'High Risk', color: '#ef4444', threshold: 0.8 },
  { value: 'critical', label: 'Critical Risk', color: '#dc2626', threshold: 1.0 }
];

const CHANGE_TYPES = [
  { value: 'schema_change', label: 'Schema Change', icon: Layers },
  { value: 'data_migration', label: 'Data Migration', icon: ArrowRight },
  { value: 'asset_removal', label: 'Asset Removal', icon: XCircle },
  { value: 'logic_update', label: 'Logic Update', icon: Brain },
  { value: 'system_upgrade', label: 'System Upgrade', icon: ArrowUp }
];

const VISUALIZATION_TYPES = [
  { value: 'graph', label: 'Network Graph', description: 'Interactive node-link diagram' },
  { value: 'tree', label: 'Hierarchy Tree', description: 'Tree structure view' },
  { value: 'sankey', label: 'Flow Diagram', description: 'Data flow visualization' },
  { value: 'matrix', label: 'Dependency Matrix', description: 'Tabular dependency view' },
  { value: 'timeline', label: 'Impact Timeline', description: 'Temporal impact analysis' }
];

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ImpactAnalysisEngine: React.FC<ImpactAnalysisEngineProps> = ({
  className,
  embedded = false,
  assetId,
  analysisType = 'change',
  onImpactDetected,
  onError
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<string>('analysis');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assetId || '');
  const [impactConfig, setImpactConfig] = useState<ImpactConfiguration>({
    analysisDepth: 'intermediate',
    includeUpstream: true,
    includeDownstream: true,
    maxDepth: 5,
    riskThreshold: 'medium',
    impactTypes: ['data', 'schema', 'logic'],
    timeHorizon: '1m',
    weightings: {
      criticality: 0.3,
      usage: 0.25,
      dependencies: 0.25,
      business_value: 0.2
    }
  });
  const [visualization, setVisualization] = useState<ImpactVisualization>({
    type: 'graph',
    layout: 'force-directed',
    showLabels: true,
    showMetrics: true,
    colorBy: 'risk',
    filterBy: []
  });
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [showRiskDetails, setShowRiskDetails] = useState<boolean>(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // ============================================================================
  // HOOKS & API INTEGRATION
  // ============================================================================

  const {
    generateReport,
    exportData,
    isLoading: analyticsLoading
  } = useCatalogAnalytics();

  // Fetch impact analysis
  const { 
    data: impactAnalysis, 
    isLoading: analysisLoading,
    refetch: refetchAnalysis 
  } = useQuery({
    queryKey: ['impact-analysis', selectedAssetId, impactConfig],
    queryFn: async () => {
      if (!selectedAssetId) return null;
      
      const response = await impactAnalysisService.getImpactAnalysis({
        assetId: selectedAssetId,
        analysisType,
        depth: impactConfig.analysisDepth,
        includeUpstream: impactConfig.includeUpstream,
        includeDownstream: impactConfig.includeDownstream,
        maxDepth: impactConfig.maxDepth,
        impactTypes: impactConfig.impactTypes,
        timeHorizon: impactConfig.timeHorizon
      });
      return response.data;
    },
    enabled: !!selectedAssetId
  });

  // Fetch dependency map
  const { 
    data: dependencyMap,
    isLoading: dependencyLoading 
  } = useQuery({
    queryKey: ['dependency-map', selectedAssetId, impactConfig.maxDepth],
    queryFn: async () => {
      if (!selectedAssetId) return null;
      
      const response = await impactAnalysisService.getDependencyMap({
        assetId: selectedAssetId,
        maxDepth: impactConfig.maxDepth,
        includeUpstream: impactConfig.includeUpstream,
        includeDownstream: impactConfig.includeDownstream
      });
      return response.data;
    },
    enabled: !!selectedAssetId
  });

  // Fetch risk analysis
  const { 
    data: riskAnalysis,
    isLoading: riskLoading 
  } = useQuery({
    queryKey: ['risk-analysis', selectedAssetId, impactConfig],
    queryFn: async () => {
      if (!selectedAssetId) return null;
      
      const response = await impactAnalysisService.getRiskAnalysis({
        assetId: selectedAssetId,
        analysisType,
        riskThreshold: impactConfig.riskThreshold,
        weightings: impactConfig.weightings
      });
      return response.data;
    },
    enabled: !!selectedAssetId
  });

  // Fetch change scenarios
  const { 
    data: changeScenarios = [],
    isLoading: scenariosLoading 
  } = useQuery({
    queryKey: ['change-scenarios', selectedAssetId],
    queryFn: async () => {
      if (!selectedAssetId) return [];
      
      const response = await impactAnalysisService.getChangeScenarios({
        assetId: selectedAssetId,
        analysisType
      });
      return response.data || [];
    },
    enabled: !!selectedAssetId
  });

  // Fetch impact metrics
  const { 
    data: impactMetrics,
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ['impact-metrics', selectedAssetId],
    queryFn: async () => {
      if (!selectedAssetId) return null;
      
      const response = await impactAnalysisService.getImpactMetrics({
        assetId: selectedAssetId,
        timeHorizon: impactConfig.timeHorizon
      });
      return response.data;
    },
    enabled: !!selectedAssetId
  });

  // Run impact simulation mutation
  const simulationMutation = useMutation({
    mutationFn: async (scenario: ChangeScenario) => {
      const response = await impactAnalysisService.runImpactSimulation({
        assetId: selectedAssetId,
        scenario: scenario.type,
        targetAssets: scenario.targetAssets,
        config: impactConfig
      });
      return response.data;
    },
    onMutate: () => {
      setSimulationRunning(true);
    },
    onSuccess: (data) => {
      toast.success('Impact simulation completed');
      if (onImpactDetected && data.impacts) {
        data.impacts.forEach((impact: ImpactAssessment) => onImpactDetected(impact));
      }
      refetchAnalysis();
    },
    onError: (error) => {
      toast.error('Simulation failed');
      onError?.(error as Error);
    },
    onSettled: () => {
      setSimulationRunning(false);
    }
  });

  // Export analysis mutation
  const exportMutation = useMutation({
    mutationFn: async (format: 'PDF' | 'EXCEL' | 'JSON') => {
      const response = await impactAnalysisService.exportImpactAnalysis({
        assetId: selectedAssetId,
        analysisType,
        format,
        includeVisualization: true,
        includeRecommendations: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Analysis exported successfully');
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error('Export failed');
      onError?.(error as Error);
    }
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const impactSummary = useMemo(() => {
    if (!impactAnalysis) return null;

    const totalImpacts = impactAnalysis.impacts?.length || 0;
    const criticalImpacts = impactAnalysis.impacts?.filter(i => i.riskLevel === 'critical').length || 0;
    const highImpacts = impactAnalysis.impacts?.filter(i => i.riskLevel === 'high').length || 0;
    const affectedAssets = new Set(impactAnalysis.impacts?.map(i => i.targetAssetId)).size;
    const estimatedEffort = impactAnalysis.impacts?.reduce((sum, i) => sum + (i.estimatedEffort || 0), 0) || 0;

    return {
      totalImpacts,
      criticalImpacts,
      highImpacts,
      affectedAssets,
      estimatedEffort: Math.round(estimatedEffort),
      riskScore: impactAnalysis.overallRiskScore || 0
    };
  }, [impactAnalysis]);

  const lineageData = useMemo(() => {
    if (!dependencyMap) return { nodes: [], edges: [] };

    const nodes = dependencyMap.nodes?.map(node => ({
      id: node.id,
      name: node.name,
      type: node.assetType,
      level: node.level || 0,
      riskScore: node.riskScore || 0,
      criticalityScore: node.criticalityScore || 0,
      usageScore: node.usageScore || 0,
      x: node.x || 0,
      y: node.y || 0
    })) || [];

    const edges = dependencyMap.edges?.map(edge => ({
      source: edge.sourceId,
      target: edge.targetId,
      type: edge.relationshipType,
      strength: edge.strength || 1,
      riskLevel: edge.riskLevel || 'low'
    })) || [];

    return { nodes, edges };
  }, [dependencyMap]);

  const riskMetrics = useMemo(() => {
    if (!riskAnalysis) return [];

    return [
      {
        category: 'Data Integrity',
        score: riskAnalysis.dataIntegrityRisk || 0,
        factors: riskAnalysis.dataIntegrityFactors || [],
        recommendations: riskAnalysis.dataIntegrityRecommendations || []
      },
      {
        category: 'Performance Impact',
        score: riskAnalysis.performanceRisk || 0,
        factors: riskAnalysis.performanceFactors || [],
        recommendations: riskAnalysis.performanceRecommendations || []
      },
      {
        category: 'Business Continuity',
        score: riskAnalysis.businessRisk || 0,
        factors: riskAnalysis.businessFactors || [],
        recommendations: riskAnalysis.businessRecommendations || []
      },
      {
        category: 'Security Implications',
        score: riskAnalysis.securityRisk || 0,
        factors: riskAnalysis.securityFactors || [],
        recommendations: riskAnalysis.securityRecommendations || []
      }
    ] as RiskMetric[];
  }, [riskAnalysis]);

  const impactTimelineData = useMemo(() => {
    if (!impactAnalysis?.timeline) return [];

    return impactAnalysis.timeline.map(point => ({
      timestamp: point.timestamp,
      date: format(new Date(point.timestamp), 'MMM dd'),
      impactScore: point.impactScore || 0,
      riskLevel: point.riskLevel || 'low',
      affectedAssets: point.affectedAssets || 0,
      estimatedEffort: point.estimatedEffort || 0
    }));
  }, [impactAnalysis]);

  const isLoading = analysisLoading || dependencyLoading || riskLoading || scenariosLoading || metricsLoading;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAssetSelection = useCallback((assetId: string) => {
    setSelectedAssetId(assetId);
  }, []);

  const handleConfigChange = useCallback((key: keyof ImpactConfiguration, value: any) => {
    setImpactConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleVisualizationChange = useCallback((key: keyof ImpactVisualization, value: any) => {
    setVisualization(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleRunSimulation = useCallback((scenario: ChangeScenario) => {
    simulationMutation.mutate(scenario);
  }, [simulationMutation]);

  const handleExportAnalysis = useCallback((format: 'PDF' | 'EXCEL' | 'JSON') => {
    exportMutation.mutate(format);
  }, [exportMutation]);

  const handleNodeToggle = useCallback((nodeId: string) => {
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

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderImpactSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Impacts</p>
              <p className="text-lg font-bold">{impactSummary?.totalImpacts || 0}</p>
            </div>
            <Target className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Critical</p>
              <p className="text-lg font-bold text-red-600">{impactSummary?.criticalImpacts || 0}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">High Risk</p>
              <p className="text-lg font-bold text-orange-600">{impactSummary?.highImpacts || 0}</p>
            </div>
            <XCircle className="h-6 w-6 text-orange-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Affected Assets</p>
              <p className="text-lg font-bold">{impactSummary?.affectedAssets || 0}</p>
            </div>
            <Database className="h-6 w-6 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Est. Effort (hrs)</p>
              <p className="text-lg font-bold">{impactSummary?.estimatedEffort || 0}</p>
            </div>
            <Clock className="h-6 w-6 text-purple-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Risk Score</p>
              <p className={cn(
                "text-lg font-bold",
                (impactSummary?.riskScore || 0) >= 0.8 ? "text-red-600" :
                (impactSummary?.riskScore || 0) >= 0.6 ? "text-orange-600" :
                (impactSummary?.riskScore || 0) >= 0.3 ? "text-yellow-600" :
                "text-green-600"
              )}>
                {((impactSummary?.riskScore || 0) * 100).toFixed(0)}%
              </p>
            </div>
            <Shield className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderImpactVisualization = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Impact Visualization
            </CardTitle>
            <CardDescription>
              Interactive visualization of dependencies and impact paths
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              value={visualization.type} 
              onValueChange={(value) => handleVisualizationChange('type', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISUALIZATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={visualization.colorBy} 
              onValueChange={(value) => handleVisualizationChange('colorBy', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Risk Level</SelectItem>
                <SelectItem value="type">Asset Type</SelectItem>
                <SelectItem value="criticality">Criticality</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 border rounded-lg bg-muted/10 relative overflow-hidden">
          {visualization.type === 'graph' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Network className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Interactive Network Graph</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {lineageData.nodes.length} nodes, {lineageData.edges.length} connections
                </p>
              </div>
            </div>
          )}
          
          {visualization.type === 'sankey' && impactTimelineData.length > 0 && (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={impactTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="impactScore" 
                    stroke={CHART_COLORS[0]}
                    fill={CHART_COLORS[0]}
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="affectedAssets" 
                    stroke={CHART_COLORS[1]}
                    fill={CHART_COLORS[1]}
                    fillOpacity={0.3}
                  />
                </RechartsAreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderRiskAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Risk Analysis
        </CardTitle>
        <CardDescription>Detailed risk assessment and mitigation recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {riskMetrics.map((metric, index) => (
            <div key={metric.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{metric.category}</h4>
                <Badge variant={
                  metric.score >= 0.8 ? 'destructive' :
                  metric.score >= 0.6 ? 'outline' :
                  metric.score >= 0.3 ? 'secondary' :
                  'default'
                }>
                  {(metric.score * 100).toFixed(0)}% Risk
                </Badge>
              </div>
              
              <Progress value={metric.score * 100} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Key Factors:</Label>
                  <ul className="mt-1 space-y-1">
                    {metric.factors.slice(0, 3).map((factor, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{factor.name}</span>
                        <span className="font-medium">{(factor.value * 100).toFixed(0)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <Label className="font-medium">Recommendations:</Label>
                  <ul className="mt-1 space-y-1">
                    {metric.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx} className="text-muted-foreground text-xs flex items-start space-x-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderScenarios = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Change Scenarios
            </CardTitle>
            <CardDescription>Predefined scenarios for impact simulation</CardDescription>
          </div>
          <Button 
            onClick={() => refetchAnalysis()}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changeScenarios.map((scenario) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                selectedScenario === scenario.id && "ring-2 ring-blue-500 bg-blue-50",
                scenario.riskLevel === 'critical' && "border-red-200",
                scenario.riskLevel === 'high' && "border-orange-200",
                scenario.riskLevel === 'medium' && "border-yellow-200",
                scenario.riskLevel === 'low' && "border-green-200"
              )}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {CHANGE_TYPES.find(t => t.value === scenario.type)?.icon && (
                      React.createElement(
                        CHANGE_TYPES.find(t => t.value === scenario.type)!.icon,
                        { className: "h-4 w-4 text-muted-foreground" }
                      )
                    )}
                    <h4 className="font-medium">{scenario.title}</h4>
                    <Badge variant={
                      scenario.riskLevel === 'critical' ? 'destructive' :
                      scenario.riskLevel === 'high' ? 'destructive' :
                      scenario.riskLevel === 'medium' ? 'outline' :
                      'default'
                    }>
                      {scenario.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Duration: {scenario.estimatedDuration}</span>
                    <span>Assets: {scenario.targetAssets.length}</span>
                    <span>Impacts: {scenario.impacts.length}</span>
                    <span>Confidence: {(scenario.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunSimulation(scenario);
                    }}
                    disabled={simulationRunning}
                  >
                    {simulationRunning ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Progress value={scenario.confidence * 100} className="w-16 h-2" />
                </div>
              </div>
            </motion.div>
          ))}
          
          {changeScenarios.length === 0 && (
            <div className="text-center py-8">
              <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Scenarios Available</h3>
              <p className="text-muted-foreground">
                Select an asset to view available change scenarios
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderImpactDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Impact Details
        </CardTitle>
        <CardDescription>Detailed breakdown of identified impacts</CardDescription>
      </CardHeader>
      <CardContent>
        {impactAnalysis?.impacts && impactAnalysis.impacts.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Impact Type</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Effort (hrs)</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impactAnalysis.impacts.map((impact, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{impact.targetAssetName}</p>
                        <p className="text-sm text-muted-foreground">{impact.targetAssetType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {IMPACT_TYPES.find(t => t.value === impact.impactType)?.icon && (
                          React.createElement(
                            IMPACT_TYPES.find(t => t.value === impact.impactType)!.icon,
                            { 
                              className: "h-4 w-4",
                              style: { color: IMPACT_TYPES.find(t => t.value === impact.impactType)?.color }
                            }
                          )
                        )}
                        <span className="capitalize">{impact.impactType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        impact.riskLevel === 'critical' ? 'destructive' :
                        impact.riskLevel === 'high' ? 'destructive' :
                        impact.riskLevel === 'medium' ? 'outline' :
                        'default'
                      }>
                        {impact.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{impact.estimatedEffort || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={(impact.confidence || 0) * 100} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {((impact.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Asset
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Impact ID
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Impacts Detected</h3>
            <p className="text-muted-foreground">
              The selected analysis shows no significant impacts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderControlPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Configuration</CardTitle>
        <CardDescription>Configure impact analysis parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Asset ID</Label>
          <Input
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            placeholder="Enter asset ID..."
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Analysis Depth</Label>
          <Select 
            value={impactConfig.analysisDepth} 
            onValueChange={(value) => handleConfigChange('analysisDepth', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANALYSIS_DEPTHS.map((depth) => (
                <SelectItem key={depth.value} value={depth.value}>
                  {depth.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Max Depth</Label>
          <Slider
            value={[impactConfig.maxDepth]}
            onValueChange={([value]) => handleConfigChange('maxDepth', value)}
            min={1}
            max={10}
            step={1}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {impactConfig.maxDepth} levels
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium">Risk Threshold</Label>
          <Select 
            value={impactConfig.riskThreshold} 
            onValueChange={(value) => handleConfigChange('riskThreshold', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RISK_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Analysis Direction</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Include Upstream</Label>
              <Switch
                checked={impactConfig.includeUpstream}
                onCheckedChange={(checked) => handleConfigChange('includeUpstream', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Include Downstream</Label>
              <Switch
                checked={impactConfig.includeDownstream}
                onCheckedChange={(checked) => handleConfigChange('includeDownstream', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Impact Types</Label>
          {IMPACT_TYPES.map((type) => (
            <div key={type.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <type.icon className="h-4 w-4" style={{ color: type.color }} />
                <span className="text-sm">{type.label}</span>
              </div>
              <Switch
                checked={impactConfig.impactTypes.includes(type.value as any)}
                onCheckedChange={(checked) => {
                  const newTypes = checked
                    ? [...impactConfig.impactTypes, type.value as any]
                    : impactConfig.impactTypes.filter(t => t !== type.value);
                  handleConfigChange('impactTypes', newTypes);
                }}
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center space-x-2">
          <Button onClick={() => refetchAnalysis()} disabled={isLoading || !selectedAssetId}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Run Analysis
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportAnalysis('PDF')}
            disabled={!impactAnalysis}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={cn("w-full space-y-6", className)}>
        {/* Header */}
        {!embedded && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Impact Analysis Engine</h1>
              <p className="text-muted-foreground">
                Analyze dependencies, assess risks, and predict change impacts
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {impactSummary && (
                <Badge 
                  variant={
                    (impactSummary.riskScore || 0) >= 0.8 ? 'destructive' :
                    (impactSummary.riskScore || 0) >= 0.6 ? 'outline' :
                    'default'
                  }
                  className="px-3 py-1"
                >
                  Risk Score: {((impactSummary.riskScore || 0) * 100).toFixed(0)}%
                </Badge>
              )}
              <Button variant="outline" onClick={() => setShowRiskDetails(!showRiskDetails)}>
                <Shield className="h-4 w-4 mr-2" />
                {showRiskDetails ? 'Hide' : 'Show'} Risk Details
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Analyzing impact and dependencies...</p>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              {/* Impact Summary */}
              {impactSummary && renderImpactSummary()}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {renderImpactDetails()}
                </div>
                <div className="space-y-6">
                  {renderControlPanel()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-6">
              {renderImpactVisualization()}
              
              {impactTimelineData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Impact Timeline</CardTitle>
                    <CardDescription>Projected impact over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={impactTimelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Legend />
                          <Bar 
                            yAxisId="left"
                            dataKey="affectedAssets" 
                            fill={CHART_COLORS[0]}
                            name="Affected Assets"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="impactScore" 
                            stroke={CHART_COLORS[1]} 
                            strokeWidth={2}
                            name="Impact Score"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              {renderScenarios()}
            </TabsContent>

            <TabsContent value="risks" className="space-y-6">
              {renderRiskAnalysis()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ImpactAnalysisEngine;