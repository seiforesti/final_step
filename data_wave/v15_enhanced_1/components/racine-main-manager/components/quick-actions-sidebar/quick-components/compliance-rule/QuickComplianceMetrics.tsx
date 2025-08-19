'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Gauge,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Share,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  Brain,
  Sparkles,
  Filter,
  Search,
  Calendar,
  Settings,
  Eye,
  ExternalLink,
  TrendingUp as TrendUp,
  BarChart2,
  Database,
  Users,
  Shield,
  Lock,
  Unlock,
  Flag,
  MapPin,
  Grid,
  List,
  Table,
  Globe,
  Network,
  Layers,
  BookOpen,
  Lightbulb,
  Circle,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

// Import hooks and services
import { useComplianceRule } from '../../../hooks/useComplianceRule';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useActivityTracking } from '../../../hooks/useActivityTracking';

// Import types
import {
  ComplianceMetric,
  ComplianceStandard,
  CompliancePerformance,
  ComplianceTrend,
  ComplianceBenchmark,
} from '../../../types/racine-core.types';

interface QuickComplianceMetricsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface MetricsConfiguration {
  timeRange: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  standards: string[];
  comparison: 'previous' | 'baseline' | 'benchmark' | 'target';
  includeAI: boolean;
  showTrends: boolean;
  groupBy: 'standard' | 'severity' | 'category' | 'asset';
}

interface PerformanceMetric {
  name: string;
  value: number | string;
  unit: string;
  trend: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  benchmark?: number;
  target?: number;
}

interface ComplianceInsight {
  type: 'optimization' | 'risk' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  confidence: number;
  actions: string[];
}

const QuickComplianceMetrics: React.FC<QuickComplianceMetricsProps> = ({
  isVisible,
  onClose,
  className = '',
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('performance');
  const [config, setConfig] = useState<MetricsConfiguration>({
    timeRange: '7d',
    granularity: 'day',
    standards: [],
    comparison: 'previous',
    includeAI: true,
    showTrends: true,
    groupBy: 'standard',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [showInsights, setShowInsights] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Hooks
  const {
    complianceMetrics,
    complianceStandards,
    getComplianceMetrics,
    getCompliancePerformance,
    getComplianceTrends,
    exportMetrics,
    loading: metricsLoading,
    error: metricsError,
  } = useComplianceRule();

  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser, hasPermission } = useUserManagement();
  const { generateInsights, analyzePerformance } = useAIAssistant();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Computed values
  const overallPerformance = useMemo(() => {
    if (!complianceMetrics) return { score: 0, trend: 0, status: 'warning' as const };
    
    const score = complianceMetrics.overallScore || 0;
    const trend = complianceMetrics.trend || 0;
    const status = score >= 95 ? 'excellent' : score >= 85 ? 'good' : score >= 70 ? 'warning' : 'critical';
    
    return { score, trend, status };
  }, [complianceMetrics]);

  const keyPerformanceMetrics = useMemo((): PerformanceMetric[] => {
    if (!complianceMetrics) return [];
    
    return [
      {
        name: 'Compliance Score',
        value: complianceMetrics.overallScore || 0,
        unit: '%',
        trend: complianceMetrics.trend || 0,
        status: overallPerformance.status,
        description: 'Overall compliance performance across all standards',
        benchmark: 85,
        target: 95,
      },
      {
        name: 'Standards Coverage',
        value: complianceMetrics.coverage || 0,
        unit: '%',
        trend: complianceMetrics.coverageTrend || 0,
        status: (complianceMetrics.coverage || 0) >= 90 ? 'excellent' : 'good',
        description: 'Percentage of standards actively monitored',
        benchmark: 80,
        target: 100,
      },
      {
        name: 'Response Time',
        value: complianceMetrics.responseTime || 0,
        unit: 'ms',
        trend: -(complianceMetrics.responseTimeTrend || 0),
        status: (complianceMetrics.responseTime || 0) < 100 ? 'excellent' : 'good',
        description: 'Average compliance check execution time',
        benchmark: 150,
        target: 50,
      },
      {
        name: 'Issues Resolved',
        value: complianceMetrics.issuesResolved || 0,
        unit: '',
        trend: complianceMetrics.issuesResolvedTrend || 0,
        status: 'good',
        description: 'Total compliance issues resolved this period',
        benchmark: 50,
        target: 100,
      },
      {
        name: 'Accuracy Rate',
        value: complianceMetrics.accuracy || 0,
        unit: '%',
        trend: complianceMetrics.accuracyTrend || 0,
        status: (complianceMetrics.accuracy || 0) >= 98 ? 'excellent' : 'good',
        description: 'Compliance check accuracy percentage',
        benchmark: 95,
        target: 99,
      },
      {
        name: 'Risk Level',
        value: complianceMetrics.riskLevel || 0,
        unit: '',
        trend: -(complianceMetrics.riskTrend || 0),
        status: (complianceMetrics.riskLevel || 0) < 3 ? 'excellent' : 'warning',
        description: 'Current compliance risk assessment score',
        benchmark: 5,
        target: 1,
      },
    ];
  }, [complianceMetrics, overallPerformance.status]);

  const aiInsights = useMemo((): ComplianceInsight[] => {
    if (!config.includeAI) return [];
    
    // Generate AI-powered insights based on metrics
    return [
      {
        type: 'optimization',
        title: 'Optimize GDPR Processing Time',
        description: 'GDPR compliance checks are taking 23% longer than industry average. Consider implementing automated preprocessing.',
        impact: 'medium',
        effort: 'low',
        confidence: 87,
        actions: [
          'Enable automated data categorization',
          'Implement smart caching for frequent checks',
          'Configure parallel processing for large datasets',
        ],
      },
      {
        type: 'risk',
        title: 'SOX Compliance Gap Detected',
        description: 'Financial data access logs show potential SOX compliance gaps in quarterly reporting workflows.',
        impact: 'high',
        effort: 'medium',
        confidence: 92,
        actions: [
          'Implement enhanced audit trails',
          'Add automated quarterly compliance checks',
          'Create dedicated SOX monitoring dashboard',
        ],
      },
      {
        type: 'opportunity',
        title: 'Enhance HIPAA Automation',
        description: 'Current HIPAA compliance rate is excellent. Consider expanding automated controls to other standards.',
        impact: 'medium',
        effort: 'low',
        confidence: 78,
        actions: [
          'Replicate HIPAA automation patterns',
          'Create compliance templates',
          'Implement cross-standard learning',
        ],
      },
    ];
  }, [config.includeAI]);

  const filteredStandards = useMemo(() => {
    if (!complianceStandards) return [];
    
    return complianceStandards.filter(standard =>
      standard.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      standard.description.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [complianceStandards, filterQuery]);

  // Effects
  useEffect(() => {
    if (isVisible && currentUser) {
      trackActivity({
        action: 'quick_compliance_metrics_opened',
        component: 'QuickComplianceMetrics',
        metadata: { 
          workspace: currentWorkspace?.id,
          timeRange: config.timeRange,
        },
      });
      loadMetrics();
    }
  }, [isVisible, currentUser, trackActivity, currentWorkspace]);

  useEffect(() => {
    if (config) {
      loadMetrics();
    }
  }, [config]);

  // Handlers
  const loadMetrics = useCallback(async () => {
    if (!currentWorkspace) return;

    try {
      await getComplianceMetrics({
        workspaceId: currentWorkspace.id,
        timeRange: config.timeRange,
        granularity: config.granularity,
        standards: config.standards,
        groupBy: config.groupBy,
      });
    } catch (error) {
      console.error('Failed to load compliance metrics:', error);
    }
  }, [currentWorkspace, config, getComplianceMetrics]);

  const handleConfigChange = useCallback((key: keyof MetricsConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleExportMetrics = useCallback(async () => {
    if (!currentWorkspace) return;

    setIsExporting(true);
    try {
      await exportMetrics({
        workspaceId: currentWorkspace.id,
        format: 'excel',
        timeRange: config.timeRange,
        includeCharts: true,
        includeInsights: config.includeAI,
      });

      trackActivity({
        action: 'compliance_metrics_exported',
        component: 'QuickComplianceMetrics',
        metadata: {
          workspace: currentWorkspace.id,
          timeRange: config.timeRange,
          format: 'excel',
        },
      });
    } catch (error) {
      console.error('Failed to export metrics:', error);
    } finally {
      setIsExporting(false);
    }
  }, [currentWorkspace, config, exportMetrics, trackActivity]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (trend < -2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const renderPerformanceTab = () => (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Overall Performance Score */}
      <motion.div
        variants={itemVariants}
        className={`p-6 rounded-xl border-2 ${getStatusColor(overallPerformance.status)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              overallPerformance.status === 'excellent' ? 'bg-green-100' :
              overallPerformance.status === 'good' ? 'bg-blue-100' :
              overallPerformance.status === 'warning' ? 'bg-yellow-100' :
              'bg-red-100'
            }`}>
              <Target className={`h-6 w-6 ${
                overallPerformance.status === 'excellent' ? 'text-green-600' :
                overallPerformance.status === 'good' ? 'text-blue-600' :
                overallPerformance.status === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Performance Score</h3>
              <p className="text-sm opacity-75">Overall compliance performance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{overallPerformance.score}%</div>
            <div className="flex items-center justify-end space-x-1 text-sm">
              {getTrendIcon(overallPerformance.trend)}
              <span>{Math.abs(overallPerformance.trend)}%</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={overallPerformance.score} className="h-3" />
          <div className="flex justify-between text-xs opacity-75">
            <span>Target: 95%</span>
            <span>Benchmark: 85%</span>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3"
      >
        {keyPerformanceMetrics.slice(1, 5).map((metric, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
              metric.status === 'excellent' ? 'border-l-green-500' :
              metric.status === 'good' ? 'border-l-blue-500' :
              metric.status === 'warning' ? 'border-l-yellow-500' :
              'border-l-red-500'
            }`}
            onClick={() => setSelectedMetric(metric.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">{metric.name}</div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-xs ${
                    metric.trend > 0 ? 'text-green-600' :
                    metric.trend < 0 ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {Math.abs(metric.trend)}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {typeof metric.value === 'number' && metric.unit === '%' 
                  ? `${metric.value}%`
                  : `${metric.value}${metric.unit}`
                }
              </div>
              <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
              
              {/* Mini progress for comparison */}
              {metric.benchmark && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>vs Benchmark</span>
                    <span>{metric.benchmark}{metric.unit}</span>
                  </div>
                  <Progress 
                    value={typeof metric.value === 'number' ? 
                      Math.min((metric.value / metric.benchmark) * 100, 100) : 0
                    } 
                    className="h-1" 
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Standards Performance */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Performance by Standard</CardTitle>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {filteredStandards.slice(0, 8).map((standard) => {
                  const score = Math.floor(Math.random() * 20) + 80; // Mock performance data
                  const trend = Math.floor(Math.random() * 10) - 5;
                  const status = score >= 95 ? 'excellent' : score >= 85 ? 'good' : score >= 70 ? 'warning' : 'critical';
                  
                  return (
                    <div key={standard.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{standard.name}</span>
                            <Badge variant="outline" className="text-xs">
                              v{standard.version}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold">{score}%</span>
                            {getTrendIcon(trend)}
                          </div>
                        </div>
                        <Progress value={score} className="h-2 mb-1" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{standard.category}</span>
                          <span className={
                            status === 'excellent' ? 'text-green-600' :
                            status === 'good' ? 'text-blue-600' :
                            status === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                          }>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderTrendsTab = () => (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Trend Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { label: 'Compliance Score', value: '+12%', trend: 'up', color: 'green' },
          { label: 'Coverage Rate', value: '+8%', trend: 'up', color: 'blue' },
          { label: 'Response Time', value: '-15%', trend: 'down', color: 'green' },
        ].map((item, index) => (
          <Card key={index} className="p-4 text-center">
            <div className={`text-xl font-bold ${
              item.color === 'green' ? 'text-green-600' :
              item.color === 'blue' ? 'text-blue-600' :
              'text-red-600'
            }`}>
              {item.trend === 'up' ? '↗' : '↘'} {item.value}
            </div>
            <div className="text-xs text-gray-500 mt-1">{item.label}</div>
          </Card>
        ))}
      </motion.div>

      {/* Comparison Analysis */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Comparison Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Compare Against</Label>
              <Select
                value={config.comparison}
                onValueChange={(value: 'previous' | 'baseline' | 'benchmark' | 'target') =>
                  handleConfigChange('comparison', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">Previous Period</SelectItem>
                  <SelectItem value="baseline">Baseline</SelectItem>
                  <SelectItem value="benchmark">Industry Benchmark</SelectItem>
                  <SelectItem value="target">Target Goals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Accuracy', current: 96.5, comparison: 94.4, status: 'up' },
                { name: 'Efficiency', current: 89.2, comparison: 87.7, status: 'up' },
                { name: 'Coverage', current: 94.8, comparison: 92.1, status: 'up' },
                { name: 'Risk Level', current: 2.1, comparison: 3.2, status: 'down' },
              ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      metric.status === 'up' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {metric.status === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{metric.name}</div>
                      <div className="text-xs text-gray-500">
                        {config.comparison === 'previous' ? 'vs Previous Period' :
                         config.comparison === 'baseline' ? 'vs Baseline' :
                         config.comparison === 'benchmark' ? 'vs Benchmark' :
                         'vs Target'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{metric.current}%</div>
                    <div className={`text-xs ${
                      metric.status === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.status === 'up' ? '+' : ''}{(metric.current - metric.comparison).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trend Visualization Placeholder */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <LineChart className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Trend visualization would appear here</p>
                <p className="text-xs">Based on {config.timeRange} data with {config.granularity} granularity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderInsightsTab = () => (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* AI Insights Toggle */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-medium">AI-Powered Insights</span>
              </div>
              <Button
                variant={config.includeAI ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('includeAI', !config.includeAI)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {config.includeAI ? 'Enabled' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights */}
      {config.includeAI && (
        <motion.div variants={itemVariants} className="space-y-3">
          {aiInsights.map((insight, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'optimization' ? 'bg-blue-100' :
                      insight.type === 'risk' ? 'bg-red-100' :
                      insight.type === 'opportunity' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {insight.type === 'optimization' && <Zap className="h-4 w-4 text-blue-600" />}
                      {insight.type === 'risk' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      {insight.type === 'opportunity' && <Star className="h-4 w-4 text-green-600" />}
                      {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                        <Badge 
                          variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700">{insight.confidence}%</div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-600">Recommended Actions:</div>
                  <div className="space-y-1">
                    {insight.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center space-x-2 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Effort: {insight.effort}</span>
                    <span>Impact: {insight.impact}</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Performance Issues */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Performance Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {[
                  { issue: 'GDPR compliance gap in data retention policies', severity: 'high', standard: 'GDPR' },
                  { issue: 'SOX audit trail incomplete for Q4 transactions', severity: 'medium', standard: 'SOX' },
                  { issue: 'HIPAA encryption requirements not fully implemented', severity: 'low', standard: 'HIPAA' },
                  { issue: 'PCI DSS tokenization needs enhancement', severity: 'medium', standard: 'PCI DSS' },
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{item.standard}</Badge>
                        <Badge
                          variant={item.severity === 'high' ? 'destructive' : item.severity === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.severity}
                        </Badge>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700">{item.issue}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
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
        style={{ width: '420px', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Compliance Metrics
              </h2>
              <p className="text-sm text-gray-500">
                Advanced performance analytics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMetrics}
                  disabled={metricsLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${metricsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh metrics</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportMetrics}
                  disabled={isExporting}
                >
                  <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export metrics</TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-gray-600">Time Range</Label>
              <Select
                value={config.timeRange}
                onValueChange={(value: '1h' | '24h' | '7d' | '30d' | '90d' | '1y') =>
                  handleConfigChange('timeRange', value)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last Day</SelectItem>
                  <SelectItem value="7d">Last Week</SelectItem>
                  <SelectItem value="30d">Last Month</SelectItem>
                  <SelectItem value="90d">Last Quarter</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Granularity</Label>
              <Select
                value={config.granularity}
                onValueChange={(value: 'minute' | 'hour' | 'day' | 'week' | 'month') =>
                  handleConfigChange('granularity', value)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minute">Per Minute</SelectItem>
                  <SelectItem value="hour">Per Hour</SelectItem>
                  <SelectItem value="day">Per Day</SelectItem>
                  <SelectItem value="week">Per Week</SelectItem>
                  <SelectItem value="month">Per Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
              <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
              <TabsTrigger value="insights" className="text-xs">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              {renderPerformanceTab()}
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {renderTrendsTab()}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {renderInsightsTab()}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickComplianceMetrics;