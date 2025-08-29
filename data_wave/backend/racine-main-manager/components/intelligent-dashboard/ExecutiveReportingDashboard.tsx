'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Activity, Target, Users, Database, Server, Shield, AlertTriangle, CheckCircle, Calendar, Clock, MapPin, Globe, Building, Briefcase, Star, Download, Share2, Filter, Search, RefreshCw, Settings, Eye, ArrowUp, ArrowDown, ArrowRight, MoreVertical, ExternalLink, FileText, Image, Video, Mail, Phone, MessageSquare, Plus, Save, Edit3, Trash2, Copy, Maximize2, Minimize2, Zap, Layers, Grid3X3, Layout, Palette, Code, Book, Home, Navigation, Compass, Map, Flag, Tag, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, LineChart as RechartsLineChart, AreaChart, BarChart as RechartsBarChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  Line, Area, Bar, PieChart as RechartsPieChart, Cell, RadialBarChart, RadialBar,
  ComposedChart, Scatter, ScatterChart, TreeMap, Sankey, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  DashboardState, SystemHealth, CrossGroupMetrics, PerformanceMetrics,
  ExecutiveMetrics, ComplianceMetrics, DataQualityMetrics, UserMetrics,
  BusinessMetrics, OperationalMetrics, FinancialMetrics
} from '../../types/racine-core.types';
import { useDashboardAPIs } from '../../hooks/useDashboardAPIs';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Enhanced interfaces for executive reporting
interface ExecutiveReport {
  id: string;
  title: string;
  description: string;
  type: 'summary' | 'detailed' | 'compliance' | 'performance' | 'strategic';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  stakeholders: string[];
  sections: ReportSection[];
  generatedAt: string;
  scheduledAt?: string;
  nextGeneration?: string;
  status: 'draft' | 'generating' | 'ready' | 'delivered' | 'archived';
  metadata: Record<string, any>;
  attachments: ReportAttachment[];
  insights: ExecutiveInsight[];
  recommendations: ExecutiveRecommendation[];
  kpis: ExecutiveKPI[];
}

interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'metrics' | 'charts' | 'tables' | 'insights' | 'recommendations';
  content: any;
  visualization?: VisualizationConfig;
  priority: number;
  isVisible: boolean;
}

interface ReportAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'powerpoint' | 'csv' | 'image';
  url: string;
  size: number;
  generatedAt: string;
}

interface ExecutiveInsight {
  id: string;
  title: string;
  description: string;
  category: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'achievement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short' | 'medium' | 'long';
  source: string;
  metadata: Record<string, any>;
  relatedMetrics: string[];
  actions?: string[];
}

interface ExecutiveRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'operational' | 'strategic' | 'financial' | 'compliance' | 'technical';
  estimatedImpact: string;
  estimatedEffort: string;
  timeline: string;
  owner?: string;
  status: 'new' | 'in_progress' | 'completed' | 'rejected';
  dependencies: string[];
  risks: string[];
  benefits: string[];
}

interface ExecutiveKPI {
  id: string;
  name: string;
  category: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  formula?: string;
  dataSource: string;
  lastUpdated: string;
}

interface ExecutiveState {
  reports: ExecutiveReport[];
  selectedReport: ExecutiveReport | null;
  currentMetrics: ExecutiveMetrics | null;
  kpis: ExecutiveKPI[];
  insights: ExecutiveInsight[];
  recommendations: ExecutiveRecommendation[];
  timeRange: {
    start: string;
    end: string;
    period: 'week' | 'month' | 'quarter' | 'year';
  };
  filters: {
    reportType: string[];
    stakeholder: string[];
    status: string[];
    priority: string[];
    category: string[];
  };
  viewMode: 'overview' | 'detailed' | 'strategic' | 'operational';
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
  refreshInterval: number;
  autoRefresh: boolean;
  exportFormat: 'pdf' | 'excel' | 'powerpoint';
  scheduledReports: ScheduledReport[];
}

interface ScheduledReport {
  id: string;
  reportTemplate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  nextExecution: string;
  lastExecution?: string;
  isActive: boolean;
}

interface ExecutiveReportingDashboardProps {
  currentDashboard?: DashboardState | null;
  systemHealth?: SystemHealth | null;
  crossGroupMetrics?: CrossGroupMetrics | null;
  performanceMetrics?: PerformanceMetrics | null;
  isLoading?: boolean;
  onReportGenerate?: (report: ExecutiveReport) => void;
  onReportSchedule?: (schedule: ScheduledReport) => void;
  onInsightAction?: (insight: ExecutiveInsight, action: string) => void;
}

// Animation variants
const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  card: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  slideIn: {
    initial: { x: -300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 }
  }
};

// Color schemes for charts
const CHART_COLORS = {
  primary: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
  secondary: ['#60A5FA', '#A78BFA', '#34D399', '#FBBF24', '#F87171'],
  gradient: ['#3B82F6', '#8B5CF6', '#10B981'],
  status: {
    excellent: '#10B981',
    good: '#3B82F6',
    warning: '#F59E0B',
    critical: '#EF4444'
  }
};

// Sample executive metrics data
const SAMPLE_EXECUTIVE_METRICS = {
  dataGovernanceScore: 85,
  complianceRate: 92,
  dataQualityIndex: 78,
  securityScore: 94,
  userAdoption: 76,
  systemAvailability: 99.2,
  costOptimization: 15,
  riskScore: 23
};

export const ExecutiveReportingDashboard: React.FC<ExecutiveReportingDashboardProps> = ({
  currentDashboard,
  systemHealth,
  crossGroupMetrics,
  performanceMetrics,
  isLoading = false,
  onReportGenerate,
  onReportSchedule,
  onInsightAction
}) => {
  // Refs
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<Record<string, any>>({});

  // Custom hooks for backend integration
  const { 
    executiveReports,
    executiveMetrics,
    generateExecutiveReport,
    scheduleExecutiveReport,
    getExecutiveInsights,
    getExecutiveRecommendations,
    exportExecutiveReport,
    shareExecutiveReport,
    getExecutiveKPIs,
    updateExecutiveKPI
  } = useDashboardAPIs();

  const { subscribe, unsubscribe } = useRealtimeUpdates();
  const { orchestrateWorkflow, getWorkflowStatus } = useRacineOrchestration();
  const { integrateCrossGroupData, getCrossGroupInsights } = useCrossGroupIntegration();
  const { generateInsights, predictTrends, generateRecommendations } = useAIAssistant();

  // Component state
  const [state, setState] = useState<ExecutiveState>({
    reports: [],
    selectedReport: null,
    currentMetrics: null,
    kpis: [],
    insights: [],
    recommendations: [],
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      period: 'month'
    },
    filters: {
      reportType: [],
      stakeholder: [],
      status: [],
      priority: [],
      category: []
    },
    viewMode: 'overview',
    isGenerating: false,
    isLoading: false,
    error: null,
    refreshInterval: 300000, // 5 minutes
    autoRefresh: true,
    exportFormat: 'pdf',
    scheduledReports: []
  });

  // Dialog states
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showInsightDialog, setShowInsightDialog] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<ExecutiveInsight | null>(null);

  // Form states
  const [reportForm, setReportForm] = useState({
    title: '',
    type: 'summary',
    period: 'monthly',
    stakeholders: [],
    sections: []
  });

  // Computed values
  const executiveKPIs = useMemo(() => {
    return [
      {
        id: 'governance_score',
        name: 'Data Governance Score',
        category: 'governance',
        value: SAMPLE_EXECUTIVE_METRICS.dataGovernanceScore,
        target: 90,
        unit: '%',
        trend: 'up' as const,
        change: 5,
        changePercent: 6.2,
        status: 'good' as const,
        description: 'Overall data governance maturity score',
        dataSource: 'governance_engine',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'compliance_rate',
        name: 'Compliance Rate',
        category: 'compliance',
        value: SAMPLE_EXECUTIVE_METRICS.complianceRate,
        target: 95,
        unit: '%',
        trend: 'up' as const,
        change: 3,
        changePercent: 3.4,
        status: 'good' as const,
        description: 'Regulatory compliance adherence rate',
        dataSource: 'compliance_engine',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'data_quality',
        name: 'Data Quality Index',
        category: 'quality',
        value: SAMPLE_EXECUTIVE_METRICS.dataQualityIndex,
        target: 85,
        unit: '%',
        trend: 'down' as const,
        change: -2,
        changePercent: -2.5,
        status: 'warning' as const,
        description: 'Overall data quality assessment score',
        dataSource: 'quality_engine',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'security_score',
        name: 'Security Score',
        category: 'security',
        value: SAMPLE_EXECUTIVE_METRICS.securityScore,
        target: 95,
        unit: '%',
        trend: 'stable' as const,
        change: 0,
        changePercent: 0,
        status: 'excellent' as const,
        description: 'Data security and protection score',
        dataSource: 'security_engine',
        lastUpdated: new Date().toISOString()
      }
    ];
  }, []);

  const filteredReports = useMemo(() => {
    return state.reports.filter(report => {
      const matchesType = state.filters.reportType.length === 0 || 
        state.filters.reportType.includes(report.type);
      const matchesStatus = state.filters.status.length === 0 || 
        state.filters.status.includes(report.status);
      
      return matchesType && matchesStatus;
    });
  }, [state.reports, state.filters]);

  const prioritizedInsights = useMemo(() => {
    return [...state.insights].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.severity] - priorityOrder[a.severity];
    });
  }, [state.insights]);

  // Initialize component
  useEffect(() => {
    initializeExecutiveDashboard();
    return () => cleanup();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (state.autoRefresh) {
      const interval = setInterval(() => {
        refreshExecutiveData();
      }, state.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [state.autoRefresh, state.refreshInterval]);

  // Real-time updates effect
  useEffect(() => {
    if (state.autoRefresh) {
      const unsubscribe = subscribe('executive_metrics', handleRealtimeUpdate);
      return () => unsubscribe();
    }
  }, [state.autoRefresh]);

  // Initialize executive dashboard
  const initializeExecutiveDashboard = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load executive data
      const [reportsData, metricsData, insightsData, recommendationsData, kpisData] = await Promise.all([
        executiveReports || [],
        executiveMetrics || SAMPLE_EXECUTIVE_METRICS,
        getExecutiveInsights?.() || [],
        getExecutiveRecommendations?.() || [],
        getExecutiveKPIs?.() || executiveKPIs
      ]);

      setState(prev => ({
        ...prev,
        reports: reportsData,
        currentMetrics: metricsData,
        insights: insightsData,
        recommendations: recommendationsData,
        kpis: kpisData,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to initialize executive dashboard:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to initialize executive dashboard' 
      }));
    }
  }, [executiveReports, executiveMetrics, getExecutiveInsights, getExecutiveRecommendations, getExecutiveKPIs, executiveKPIs]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      currentMetrics: { ...prev.currentMetrics, ...data.metrics },
      kpis: data.kpis || prev.kpis,
      insights: data.insights || prev.insights
    }));
  }, []);

  // Refresh executive data
  const refreshExecutiveData = useCallback(async () => {
    try {
      const [metricsData, insightsData, kpisData] = await Promise.all([
        executiveMetrics || SAMPLE_EXECUTIVE_METRICS,
        getExecutiveInsights?.() || [],
        getExecutiveKPIs?.() || executiveKPIs
      ]);

      setState(prev => ({
        ...prev,
        currentMetrics: metricsData,
        insights: insightsData,
        kpis: kpisData
      }));

    } catch (error) {
      console.error('Failed to refresh executive data:', error);
    }
  }, [executiveMetrics, getExecutiveInsights, getExecutiveKPIs, executiveKPIs]);

  // Generate executive report
  const handleGenerateReport = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }));
      
      const reportConfig = {
        ...reportForm,
        timeRange: state.timeRange,
        includeInsights: true,
        includeRecommendations: true,
        includeKPIs: true
      };

      const newReport = await generateExecutiveReport(reportConfig);
      
      setState(prev => ({
        ...prev,
        reports: [newReport, ...prev.reports],
        selectedReport: newReport,
        isGenerating: false
      }));
      
      setShowReportDialog(false);
      
      if (onReportGenerate) {
        onReportGenerate(newReport);
      }

    } catch (error) {
      console.error('Failed to generate report:', error);
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: 'Failed to generate report' 
      }));
    }
  }, [reportForm, state.timeRange, generateExecutiveReport, onReportGenerate]);

  // Schedule executive report
  const handleScheduleReport = useCallback(async (scheduleConfig: any) => {
    try {
      const scheduledReport = await scheduleExecutiveReport(scheduleConfig);
      
      setState(prev => ({
        ...prev,
        scheduledReports: [...prev.scheduledReports, scheduledReport]
      }));
      
      setShowScheduleDialog(false);
      
      if (onReportSchedule) {
        onReportSchedule(scheduledReport);
      }

    } catch (error) {
      console.error('Failed to schedule report:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to schedule report' 
      }));
    }
  }, [scheduleExecutiveReport, onReportSchedule]);

  // Export report
  const handleExportReport = useCallback(async (report: ExecutiveReport, format: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const exportData = await exportExecutiveReport(report.id, { format });
      
      // Trigger download
      const blob = new Blob([exportData], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `executive_report_${report.title}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      setState(prev => ({ ...prev, isLoading: false }));
      setShowExportDialog(false);

    } catch (error) {
      console.error('Failed to export report:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to export report' 
      }));
    }
  }, [exportExecutiveReport]);

  // Handle insight action
  const handleInsightAction = useCallback(async (insight: ExecutiveInsight, action: string) => {
    try {
      // Implement insight action logic here
      if (onInsightAction) {
        onInsightAction(insight, action);
      }
    } catch (error) {
      console.error('Failed to handle insight action:', error);
    }
  }, [onInsightAction]);

  // Time range handler
  const handleTimeRangeChange = useCallback((period: string) => {
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    setState(prev => ({
      ...prev,
      timeRange: {
        start: start.toISOString(),
        end: now.toISOString(),
        period: period as any
      }
    }));
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    // Clean up any resources, subscriptions, etc.
  }, []);

  // Render KPI card
  const renderKPICard = (kpi: ExecutiveKPI) => {
    const statusColor = CHART_COLORS.status[kpi.status];
    const trendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : ArrowRight;
    const TrendIcon = trendIcon;
    
    return (
      <motion.div
        key={kpi.id}
        variants={animationVariants.card}
        initial="initial"
        animate="animate"
      >
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.name}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  kpi.status === 'excellent' && "bg-green-50 text-green-700 border-green-200",
                  kpi.status === 'good' && "bg-blue-50 text-blue-700 border-blue-200",
                  kpi.status === 'warning' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                  kpi.status === 'critical' && "bg-red-50 text-red-700 border-red-200"
                )}
              >
                {kpi.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold" style={{ color: statusColor }}>
                  {kpi.value}
                </span>
                <span className="text-sm text-gray-500">{kpi.unit}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <TrendIcon 
                    className={cn(
                      "h-4 w-4",
                      kpi.trend === 'up' && "text-green-500",
                      kpi.trend === 'down' && "text-red-500",
                      kpi.trend === 'stable' && "text-gray-500"
                    )} 
                  />
                  <span className={cn(
                    "font-medium",
                    kpi.trend === 'up' && "text-green-600",
                    kpi.trend === 'down' && "text-red-600",
                    kpi.trend === 'stable' && "text-gray-600"
                  )}>
                    {kpi.changePercent > 0 ? '+' : ''}{kpi.changePercent}%
                  </span>
                </div>
                <span className="text-gray-500">
                  Target: {kpi.target}{kpi.unit}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%`,
                    backgroundColor: statusColor
                  }}
                />
              </div>
              
              <p className="text-xs text-gray-600">{kpi.description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render executive insight card
  const renderInsightCard = (insight: ExecutiveInsight) => {
    const severityColors = {
      low: 'border-l-blue-500 bg-blue-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      high: 'border-l-orange-500 bg-orange-50',
      critical: 'border-l-red-500 bg-red-50'
    };
    
    const severityIcons = {
      low: Activity,
      medium: AlertTriangle,
      high: AlertTriangle,
      critical: AlertTriangle
    };
    
    const SeverityIcon = severityIcons[insight.severity];
    
    return (
      <motion.div
        key={insight.id}
        variants={animationVariants.card}
        initial="initial"
        animate="animate"
      >
        <Card className={cn("border-l-4", severityColors[insight.severity])}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <SeverityIcon className="h-5 w-5 mt-0.5 text-gray-600" />
                <div className="flex-1">
                  <CardTitle className="text-base mb-1">{insight.title}</CardTitle>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSelectedInsight(insight);
                    setShowInsightDialog(true);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInsightAction(insight, 'acknowledge')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Acknowledge
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInsightAction(insight, 'create_task')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="capitalize">{insight.category}</span>
                <span>Confidence: {insight.confidence}%</span>
                <span className="capitalize">{insight.impact} impact</span>
              </div>
              <span>{insight.source}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render trend chart
  const renderTrendChart = () => {
    const trendData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      governance: Math.floor(Math.random() * 20) + 75,
      compliance: Math.floor(Math.random() * 15) + 85,
      quality: Math.floor(Math.random() * 25) + 65,
      security: Math.floor(Math.random() * 10) + 90
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            Executive KPI Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[50, 100]} />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="governance" 
                stroke={CHART_COLORS.primary[0]} 
                strokeWidth={2}
                name="Governance Score"
              />
              <Line 
                type="monotone" 
                dataKey="compliance" 
                stroke={CHART_COLORS.primary[1]} 
                strokeWidth={2}
                name="Compliance Rate"
              />
              <Line 
                type="monotone" 
                dataKey="quality" 
                stroke={CHART_COLORS.primary[2]} 
                strokeWidth={2}
                name="Data Quality"
              />
              <Line 
                type="monotone" 
                dataKey="security" 
                stroke={CHART_COLORS.primary[3]} 
                strokeWidth={2}
                name="Security Score"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Render compliance summary
  const renderComplianceSummary = () => {
    const complianceData = [
      { name: 'GDPR', value: 95, color: CHART_COLORS.status.excellent },
      { name: 'CCPA', value: 88, color: CHART_COLORS.status.good },
      { name: 'SOX', value: 92, color: CHART_COLORS.status.excellent },
      { name: 'HIPAA', value: 75, color: CHART_COLORS.status.warning },
      { name: 'PCI DSS', value: 98, color: CHART_COLORS.status.excellent }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Compliance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render reports list
  const renderReportsList = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Reports
          </CardTitle>
          <Button onClick={() => setShowReportDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredReports.slice(0, 5).map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setState(prev => ({ ...prev, selectedReport: report }))}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{report.title}</p>
                  <p className="text-xs text-gray-500">{report.type} • {report.period}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={cn(
                  "text-xs",
                  report.status === 'ready' && "bg-green-50 text-green-700 border-green-200",
                  report.status === 'generating' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                  report.status === 'draft' && "bg-gray-50 text-gray-700 border-gray-200"
                )}>
                  {report.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(report.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <motion.div
        ref={dashboardRef}
        className="p-6 space-y-6"
        variants={animationVariants.container}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Briefcase className="h-8 w-8 mr-3" />
              Executive Reporting Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Strategic insights and executive reporting for data governance
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={state.timeRange.period}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">1 Week</SelectItem>
                <SelectItem value="month">1 Month</SelectItem>
                <SelectItem value="quarter">1 Quarter</SelectItem>
                <SelectItem value="year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshExecutiveData}
              disabled={state.isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", state.isLoading && "animate-spin")} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScheduleDialog(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            
            <Button
              onClick={() => setShowReportDialog(true)}
              disabled={state.isGenerating}
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Executive KPIs */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Executive KPIs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {executiveKPIs.map(renderKPICard)}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2">
            {renderTrendChart()}
          </div>
          
          {/* Compliance Summary */}
          <div>
            {renderComplianceSummary()}
          </div>
        </div>

        {/* Insights and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Executive Insights */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Executive Insights</h2>
            <div className="space-y-4">
              {prioritizedInsights.slice(0, 3).map(renderInsightCard)}
              {prioritizedInsights.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
                    <p className="text-gray-600">Insights will appear here as they are generated</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Reports List */}
          <div>
            {renderReportsList()}
          </div>
        </div>

        {/* Generate Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Executive Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Report Title</Label>
                <Input
                  value={reportForm.title}
                  onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter report title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report Type</Label>
                  <Select
                    value={reportForm.type}
                    onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Executive Summary</SelectItem>
                      <SelectItem value="detailed">Detailed Report</SelectItem>
                      <SelectItem value="compliance">Compliance Report</SelectItem>
                      <SelectItem value="performance">Performance Report</SelectItem>
                      <SelectItem value="strategic">Strategic Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Period</Label>
                  <Select
                    value={reportForm.period}
                    onValueChange={(value) => setReportForm(prev => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={state.isGenerating || !reportForm.title}
                >
                  {state.isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading overlay */}
        {(state.isLoading || isLoading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading executive data...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {state.error && (
          <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
              >
                ×
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};