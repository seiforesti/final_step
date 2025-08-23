import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Info, Zap, Activity, BarChart3, PieChart, LineChart, GitBranch, Network, Layers, Eye, Settings, RefreshCw, Play, Pause, Square, Clock, Search, Filter, Plus, Edit, Trash2, Download, Upload, Save, Copy, MoreHorizontal, ArrowRight, ArrowDown, ArrowUp, Minus, ExternalLink, FileText, Database, Users, Shield, Gauge } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// API Services
import { intelligenceAPI } from '../../services/intelligence-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';
import { reportingAPI } from '../../services/reporting-apis';

// Types
import type { 
  ImpactAnalysis,
  ImpactAssessment,
  ImpactMetrics,
  ImpactPrediction,
  DependencyGraph,
  ChangeImpact,
  RiskAssessment,
  ImpactScore,
  ImpactCategory,
  BusinessImpact,
  TechnicalImpact,
  SecurityImpact,
  PerformanceImpact,
  ComplianceImpact,
  ImpactVisualization,
  ImpactReport,
  ImpactSeverity,
  ImpactScope,
  ImpactTimeline
} from '../../types/intelligence.types';

import type { 
  ScanRule,
  RuleSet,
  RulePattern
} from '../../types/scan-rules.types';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { performanceCalculator } from '../../utils/performance-calculator';

interface RuleImpactAnalyzerProps {
  className?: string;
  onImpactAnalyzed?: (impact: ImpactAnalysis) => void;
  onRiskDetected?: (risk: RiskAssessment) => void;
  onPredictionGenerated?: (prediction: ImpactPrediction) => void;
}

interface ImpactAnalyzerState {
  analyses: ImpactAnalysis[];
  rules: ScanRule[];
  assessments: ImpactAssessment[];
  predictions: ImpactPrediction[];
  metrics: ImpactMetrics;
  dependencyGraph: DependencyGraph;
  risks: RiskAssessment[];
  reports: ImpactReport[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalAnalyses: number;
  highRiskChanges: number;
  averageImpactScore: number;
  businessImpacts: number;
  technicalImpacts: number;
  securityImpacts: number;
  performanceImpacts: number;
  complianceImpacts: number;
  dependenciesAnalyzed: number;
  predictionsGenerated: number;
}

interface ImpactViewState {
  currentView: 'overview' | 'analysis' | 'dependencies' | 'predictions' | 'risks' | 'reports';
  selectedRule?: ScanRule;
  selectedAnalysis?: ImpactAnalysis;
  selectedAssessment?: ImpactAssessment;
  impactCategory: ImpactCategory;
  severityFilter: string;
  scopeFilter: string;
  autoAnalysis: boolean;
  realTimeMode: boolean;
  showPredictions: boolean;
  includeHistorical: boolean;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTimeRange: 'hour' | 'day' | 'week' | 'month';
  confidenceThreshold: number;
}

const DEFAULT_VIEW_STATE: ImpactViewState = {
  currentView: 'overview',
  impactCategory: 'all',
  severityFilter: 'all',
  scopeFilter: 'all',
  autoAnalysis: true,
  realTimeMode: true,
  showPredictions: true,
  includeHistorical: false,
  searchQuery: '',
  sortBy: 'impact_score',
  sortOrder: 'desc',
  selectedTimeRange: 'day',
  confidenceThreshold: 0.7
};

const IMPACT_CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: Target },
  { value: 'business', label: 'Business Impact', icon: TrendingUp },
  { value: 'technical', label: 'Technical Impact', icon: Database },
  { value: 'security', label: 'Security Impact', icon: Shield },
  { value: 'performance', label: 'Performance Impact', icon: Gauge },
  { value: 'compliance', label: 'Compliance Impact', icon: FileText }
];

const IMPACT_SEVERITIES = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' }
];

const IMPACT_SCOPES = [
  { value: 'local', label: 'Local', description: 'Limited to specific components' },
  { value: 'module', label: 'Module', description: 'Affects entire module or service' },
  { value: 'system', label: 'System', description: 'System-wide impact' },
  { value: 'enterprise', label: 'Enterprise', description: 'Organization-wide impact' }
];

export const RuleImpactAnalyzer: React.FC<RuleImpactAnalyzerProps> = ({
  className,
  onImpactAnalyzed,
  onRiskDetected,
  onPredictionGenerated
}) => {
  // State Management
  const [viewState, setViewState] = useState<ImpactViewState>(DEFAULT_VIEW_STATE);
  const [analyzerState, setAnalyzerState] = useState<ImpactAnalyzerState>({
    analyses: [],
    rules: [],
    assessments: [],
    predictions: [],
    metrics: {} as ImpactMetrics,
    dependencyGraph: {} as DependencyGraph,
    risks: [],
    reports: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalAnalyses: 0,
    highRiskChanges: 0,
    averageImpactScore: 0,
    businessImpacts: 0,
    technicalImpacts: 0,
    securityImpacts: 0,
    performanceImpacts: 0,
    complianceImpacts: 0,
    dependenciesAnalyzed: 0,
    predictionsGenerated: 0
  });

  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Form States
  const [analysisForm, setAnalysisForm] = useState({
    ruleId: '',
    changeType: 'modify',
    impactCategories: ['business', 'technical', 'security'] as ImpactCategory[],
    analysisDepth: 'comprehensive',
    includeDownstream: true,
    includePredictions: true,
    timeHorizon: '30' // days
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout>();

  // Custom Hooks
  const {
    getInsights,
    analyzePerformance,
    generatePredictions,
    loading: intelligenceLoading
  } = useIntelligence();

  const {
    scanRules,
    ruleSets,
    getRules,
    loading: rulesLoading
  } = useScanRules();

  const {
    generateReport,
    getAnalytics,
    loading: reportingLoading
  } = useReporting();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeMode) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/impact-analysis`);
      
      wsRef.current.onopen = () => {
        console.log('Impact Analysis WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Impact Analysis WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Impact Analysis WebSocket disconnected');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewState.realTimeMode]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'impact_analyzed':
        setAnalyzerState(prev => ({
          ...prev,
          analyses: [...prev.analyses, data.analysis],
          totalAnalyses: prev.totalAnalyses + 1
        }));
        if (onImpactAnalyzed) onImpactAnalyzed(data.analysis);
        break;
      case 'risk_detected':
        setAnalyzerState(prev => ({
          ...prev,
          risks: [...prev.risks, data.risk],
          highRiskChanges: data.risk.severity === 'high' || data.risk.severity === 'critical' 
            ? prev.highRiskChanges + 1 
            : prev.highRiskChanges
        }));
        if (onRiskDetected) onRiskDetected(data.risk);
        break;
      case 'prediction_generated':
        setAnalyzerState(prev => ({
          ...prev,
          predictions: [...prev.predictions, data.prediction],
          predictionsGenerated: prev.predictionsGenerated + 1
        }));
        if (onPredictionGenerated) onPredictionGenerated(data.prediction);
        break;
      case 'dependency_updated':
        setAnalyzerState(prev => ({
          ...prev,
          dependencyGraph: data.graph,
          dependenciesAnalyzed: data.graph.nodes?.length || 0
        }));
        break;
      case 'metrics_updated':
        setAnalyzerState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [onImpactAnalyzed, onRiskDetected, onPredictionGenerated]);

  // Auto-analysis for rule changes
  useEffect(() => {
    if (viewState.autoAnalysis) {
      analysisIntervalRef.current = setInterval(() => {
        checkForRuleChanges();
      }, 60000); // Every minute
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [viewState.autoAnalysis]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setAnalyzerState(prev => ({ ...prev, loading: true, error: null }));

      const [analysesData, rulesData, assessmentsData, metricsData] = await Promise.all([
        intelligenceAPI.getImpactAnalyses({ 
          category: viewState.impactCategory !== 'all' ? viewState.impactCategory : undefined,
          severity: viewState.severityFilter !== 'all' ? viewState.severityFilter : undefined,
          timeRange: viewState.selectedTimeRange
        }),
        scanRulesAPI.getRules({ includeMetadata: true }),
        intelligenceAPI.getImpactAssessments(),
        intelligenceAPI.getImpactMetrics()
      ]);

      setAnalyzerState(prev => ({
        ...prev,
        analyses: analysesData.analyses,
        rules: rulesData.rules,
        assessments: assessmentsData.assessments,
        metrics: metricsData,
        totalAnalyses: analysesData.total,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate derived metrics
      const highRisk = analysesData.analyses.filter(a => 
        a.severity === 'high' || a.severity === 'critical'
      ).length;

      const avgScore = analysesData.analyses.length > 0
        ? analysesData.analyses.reduce((sum, a) => sum + (a.impactScore || 0), 0) / analysesData.analyses.length
        : 0;

      const businessCount = analysesData.analyses.filter(a => a.category === 'business').length;
      const technicalCount = analysesData.analyses.filter(a => a.category === 'technical').length;
      const securityCount = analysesData.analyses.filter(a => a.category === 'security').length;
      const performanceCount = analysesData.analyses.filter(a => a.category === 'performance').length;
      const complianceCount = analysesData.analyses.filter(a => a.category === 'compliance').length;

      setAnalyzerState(prev => ({
        ...prev,
        highRiskChanges: highRisk,
        averageImpactScore: avgScore,
        businessImpacts: businessCount,
        technicalImpacts: technicalCount,
        securityImpacts: securityCount,
        performanceImpacts: performanceCount,
        complianceImpacts: complianceCount
      }));

    } catch (error) {
      console.error('Failed to refresh impact analysis data:', error);
      setAnalyzerState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.impactCategory, viewState.severityFilter, viewState.selectedTimeRange]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Analysis Functions
  const checkForRuleChanges = useCallback(async () => {
    try {
      const recentChanges = await scanRulesAPI.getRecentChanges();
      if (recentChanges.length > 0) {
        for (const change of recentChanges) {
          await performImpactAnalysis(change.ruleId, change.changeType);
        }
      }
    } catch (error) {
      console.error('Failed to check for rule changes:', error);
    }
  }, []);

  const performImpactAnalysis = useCallback(async (ruleId: string, changeType: string = 'modify') => {
    try {
      const analysis = await intelligenceAPI.performImpactAnalysis({
        ruleId: ruleId,
        changeType: changeType,
        categories: viewState.impactCategory !== 'all' ? [viewState.impactCategory] : ['business', 'technical', 'security', 'performance', 'compliance'],
        analysisDepth: 'comprehensive',
        includeDownstream: true,
        includePredictions: viewState.showPredictions,
        timeHorizon: 30,
        confidenceThreshold: viewState.confidenceThreshold
      });

      setAnalyzerState(prev => ({
        ...prev,
        analyses: [...prev.analyses, analysis],
        totalAnalyses: prev.totalAnalyses + 1
      }));

      if (onImpactAnalyzed) onImpactAnalyzed(analysis);
      
      // Generate predictions if enabled
      if (viewState.showPredictions) {
        await generateImpactPredictions(analysis.id);
      }

      return analysis;
    } catch (error) {
      console.error('Failed to perform impact analysis:', error);
      return null;
    }
  }, [viewState.impactCategory, viewState.showPredictions, viewState.confidenceThreshold, onImpactAnalyzed]);

  const generateImpactPredictions = useCallback(async (analysisId: string) => {
    try {
      const predictions = await intelligenceAPI.generateImpactPredictions({
        analysisId: analysisId,
        timeHorizon: parseInt(analysisForm.timeHorizon),
        scenarios: ['optimistic', 'realistic', 'pessimistic'],
        includeBusinessMetrics: true,
        includeTechnicalMetrics: true
      });

      setAnalyzerState(prev => ({
        ...prev,
        predictions: [...prev.predictions, ...predictions],
        predictionsGenerated: prev.predictionsGenerated + predictions.length
      }));

      predictions.forEach(prediction => {
        if (onPredictionGenerated) onPredictionGenerated(prediction);
      });
    } catch (error) {
      console.error('Failed to generate impact predictions:', error);
    }
  }, [analysisForm.timeHorizon, onPredictionGenerated]);

  const assessRisk = useCallback(async (analysisId: string) => {
    try {
      const riskAssessment = await intelligenceAPI.assessImpactRisk({
        analysisId: analysisId,
        factors: ['probability', 'severity', 'scope', 'timeline'],
        includeBusinessRisk: true,
        includeTechnicalRisk: true,
        includeSecurityRisk: true
      });

      setAnalyzerState(prev => ({
        ...prev,
        risks: [...prev.risks, riskAssessment]
      }));

      if (onRiskDetected) onRiskDetected(riskAssessment);
    } catch (error) {
      console.error('Failed to assess risk:', error);
    }
  }, [onRiskDetected]);

  const buildDependencyGraph = useCallback(async (ruleIds: string[]) => {
    try {
      const graph = await intelligenceAPI.buildDependencyGraph({
        ruleIds: ruleIds,
        includeUpstream: true,
        includeDownstream: true,
        maxDepth: 5,
        includeExternalDependencies: true
      });

      setAnalyzerState(prev => ({
        ...prev,
        dependencyGraph: graph,
        dependenciesAnalyzed: graph.nodes?.length || 0
      }));

      return graph;
    } catch (error) {
      console.error('Failed to build dependency graph:', error);
      return null;
    }
  }, []);

  // Utility Functions
  const getSeverityColor = useCallback((severity: ImpactSeverity) => {
    const sev = IMPACT_SEVERITIES.find(s => s.value === severity);
    return sev ? sev.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getImpactScoreColor = useCallback((score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  }, []);

  const getImpactIcon = useCallback((category: ImpactCategory) => {
    const cat = IMPACT_CATEGORIES.find(c => c.value === category);
    if (cat) {
      const IconComponent = cat.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Target className="h-4 w-4" />;
  }, []);

  const getTrendIcon = useCallback((trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  // Filter and Search Functions
  const filteredAnalyses = useMemo(() => {
    let filtered = analyzerState.analyses;

    if (viewState.searchQuery) {
      filtered = filtered.filter(analysis => 
        analysis.ruleName?.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        analysis.description?.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.severityFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.severity === viewState.severityFilter);
    }

    if (viewState.scopeFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.scope === viewState.scopeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'impact_score':
          aValue = a.impactScore || 0;
          bValue = b.impactScore || 0;
          break;
        case 'severity':
          aValue = IMPACT_SEVERITIES.findIndex(s => s.value === a.severity);
          bValue = IMPACT_SEVERITIES.findIndex(s => s.value === b.severity);
          break;
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        default:
          aValue = a.impactScore || 0;
          bValue = b.impactScore || 0;
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [analyzerState.analyses, viewState.searchQuery, viewState.severityFilter, viewState.scopeFilter, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzerState.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              impact assessments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Changes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analyzerState.highRiskChanges}</div>
            <p className="text-xs text-muted-foreground">
              requiring attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Impact Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getImpactScoreColor(analyzerState.averageImpactScore)}`}>
              {(analyzerState.averageImpactScore * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              average impact
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dependencies</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzerState.dependenciesAnalyzed}</div>
            <p className="text-xs text-muted-foreground">
              analyzed relationships
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Impact Distribution by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Impact Distribution by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analyzerState.businessImpacts}</div>
              <div className="text-sm text-gray-500">Business</div>
              <Progress value={(analyzerState.businessImpacts / analyzerState.totalAnalyses) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analyzerState.technicalImpacts}</div>
              <div className="text-sm text-gray-500">Technical</div>
              <Progress value={(analyzerState.technicalImpacts / analyzerState.totalAnalyses) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analyzerState.securityImpacts}</div>
              <div className="text-sm text-gray-500">Security</div>
              <Progress value={(analyzerState.securityImpacts / analyzerState.totalAnalyses) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{analyzerState.performanceImpacts}</div>
              <div className="text-sm text-gray-500">Performance</div>
              <Progress value={(analyzerState.performanceImpacts / analyzerState.totalAnalyses) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analyzerState.complianceImpacts}</div>
              <div className="text-sm text-gray-500">Compliance</div>
              <Progress value={(analyzerState.complianceImpacts / analyzerState.totalAnalyses) * 100} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent High-Impact Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent High-Impact Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAnalyses
              .filter(analysis => analysis.impactScore && analysis.impactScore > 0.6)
              .slice(0, 5)
              .map(analysis => (
              <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getImpactIcon(analysis.category)}
                  <div>
                    <div className="font-medium">{analysis.ruleName || 'Unknown Rule'}</div>
                    <div className="text-sm text-gray-500">
                      {analysis.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getImpactScoreColor(analysis.impactScore || 0)}`}>
                    Impact: {((analysis.impactScore || 0) * 100).toFixed(1)}%
                  </div>
                  <Badge className={getSeverityColor(analysis.severity)}>
                    {analysis.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {analyzerState.risks.slice(0, 10).map((risk, index) => (
                <div key={index} className="flex items-start gap-3 p-2 text-sm border-l-2 border-l-red-300">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{risk.title}</div>
                    <div className="text-gray-500">{risk.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Probability: {(risk.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(risk.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Rule Impact Analyzer</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  analyzerState.averageImpactScore < 0.4 ? 'bg-green-500' :
                  analyzerState.averageImpactScore < 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  Avg Impact: {(analyzerState.averageImpactScore * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.impactCategory}
                onValueChange={(value) => setViewState(prev => ({ ...prev, impactCategory: value as ImpactCategory }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPACT_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnalysisDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Analyze
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={analyzerState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${analyzerState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Switch
                checked={viewState.autoAnalysis}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, autoAnalysis: checked }))}
              />
              <span className="text-sm text-gray-600">Auto-analyze</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="dependencies" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Dependencies
                </TabsTrigger>
                <TabsTrigger value="predictions" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Predictions
                </TabsTrigger>
                <TabsTrigger value="risks" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risks
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reports
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="analysis">
                <div>Impact Analysis Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="dependencies">
                <div>Dependency Graph Visualization (To be implemented)</div>
              </TabsContent>
              <TabsContent value="predictions">
                <div>Impact Predictions Dashboard (To be implemented)</div>
              </TabsContent>
              <TabsContent value="risks">
                <div>Risk Assessment Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="reports">
                <div>Impact Reports Generation (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Analysis Dialog */}
        <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Perform Impact Analysis</DialogTitle>
              <DialogDescription>
                Analyze the potential impact of rule changes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="analysis-rule">Select Rule</Label>
                <Select 
                  value={analysisForm.ruleId}
                  onValueChange={(value) => setAnalysisForm(prev => ({ ...prev, ruleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rule to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyzerState.rules.map(rule => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="change-type">Change Type</Label>
                <Select 
                  value={analysisForm.changeType}
                  onValueChange={(value) => setAnalysisForm(prev => ({ ...prev, changeType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modify">Modify Rule</SelectItem>
                    <SelectItem value="disable">Disable Rule</SelectItem>
                    <SelectItem value="delete">Delete Rule</SelectItem>
                    <SelectItem value="add">Add New Rule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAnalysisDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (analysisForm.ruleId) {
                      performImpactAnalysis(analysisForm.ruleId, analysisForm.changeType);
                      setAnalysisDialogOpen(false);
                    }
                  }}
                  disabled={!analysisForm.ruleId}
                >
                  Analyze Impact
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RuleImpactAnalyzer;