'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Activity, BarChart3, TrendingUp, TrendingDown, Zap, Clock, Cpu, Database, Network, HardDrive, AlertTriangle, CheckCircle, XCircle, Timer, Gauge, Target, Filter, Search, RefreshCw, Download, Upload, Settings, Eye, EyeOff, Play, Pause, RotateCcw, Calendar, MapPin, Layers, GitBranch, Users, Share, FileText, MoreHorizontal, ChevronDown, ChevronRight, ChevronUp, Info, Lightbulb, Sparkles, LineChart, PieChart, BarChart2, Radar, Flame, Snowflake, Wind, Sun, CloudRain, Award, ShieldCheckIcon, Rocket, Bell, Hash, Percent,  } from 'lucide-react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  ComposedChart,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
} from 'recharts';
import { useOptimization } from '../../hooks/useOptimization';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// Types
interface PerformanceMetric {
  id: string;
  name: string;
  category: 'execution' | 'resource' | 'throughput' | 'latency' | 'error';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'healthy' | 'warning' | 'critical';
  description: string;
  lastUpdated: Date;
}

interface PerformanceProfile {
  ruleId: string;
  ruleName: string;
  category: string;
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  metrics: {
    executionTime: {
      avg: number;
      min: number;
      max: number;
      p95: number;
      p99: number;
    };
    resourceUsage: {
      cpu: number;
      memory: number;
      io: number;
      network: number;
    };
    throughput: {
      recordsPerSecond: number;
      rulesPerMinute: number;
      dataVolumePerHour: number;
    };
    errors: {
      rate: number;
      count: number;
      types: Record<string, number>;
    };
    accuracy: {
      precision: number;
      recall: number;
      f1Score: number;
    };
  };
  bottlenecks: BottleneckAnalysis[];
  optimizationOpportunities: OptimizationOpportunity[];
  historicalData: HistoricalPerformanceData[];
}

interface BottleneckAnalysis {
  id: string;
  type: 'cpu' | 'memory' | 'io' | 'network' | 'algorithm' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  impact: number;
  frequency: number;
  suggestedActions: string[];
  estimatedImprovement: number;
  effort: number;
}

interface OptimizationOpportunity {
  id: string;
  type: 'caching' | 'indexing' | 'parallelization' | 'algorithm' | 'resource' | 'pattern';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedGain: number;
  implementationCost: number;
  riskLevel: 'low' | 'medium' | 'high';
  prerequisites: string[];
  timeline: string;
}

interface HistoricalPerformanceData {
  timestamp: Date;
  metrics: Record<string, number>;
  events: PerformanceEvent[];
  annotations: string[];
}

interface PerformanceEvent {
  id: string;
  type: 'optimization' | 'deployment' | 'incident' | 'maintenance';
  severity: 'info' | 'warning' | 'error';
  title: string;
  description: string;
  timestamp: Date;
  impact: number;
}

interface ResourceUtilization {
  resourceType: 'cpu' | 'memory' | 'storage' | 'network';
  current: number;
  peak: number;
  average: number;
  trend: number[];
  capacity: number;
  utilization: number;
  efficiency: number;
  cost: number;
}

interface PerformanceBenchmark {
  category: string;
  baseline: number;
  current: number;
  target: number;
  industry: number;
  percentile: number;
  improvement: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export const PerformanceAnalytics: React.FC = () => {
  // Hooks
  const {
    getPerformanceMetrics,
    getPerformanceProfiles,
    getBottleneckAnalysis,
    getOptimizationOpportunities,
    getResourceUtilization,
    getBenchmarks,
    generatePerformanceReport,
    optimizePerformance,
  } = useOptimization();

  const {
    analyzePerformancePatterns,
    predictPerformanceIssues,
    suggestOptimizations,
    detectAnomalies,
  } = useIntelligence();

  const { rules, getRulePerformance } = useScanRules();
  const { generateReport, exportData } = useReporting();

  // State
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [profiles, setProfiles] = useState<PerformanceProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<PerformanceProfile | null>(null);
  const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([]);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['execution_time', 'cpu_usage', 'memory_usage']);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterComplexity, setFilterComplexity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [selectedBottleneck, setSelectedBottleneck] = useState<BottleneckAnalysis | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [aggregationLevel, setAggregationLevel] = useState<'raw' | 'minute' | 'hour' | 'day'>('minute');

  // Computed values
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const matchesSearch = profile.ruleName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || profile.category === filterCategory;
      const matchesComplexity = filterComplexity === 'all' || profile.complexity === filterComplexity;
      const hasIssues = showOnlyIssues ? profile.bottlenecks.length > 0 : true;
      return matchesSearch && matchesCategory && matchesComplexity && hasIssues;
    });
  }, [profiles, searchTerm, filterCategory, filterComplexity, showOnlyIssues]);

  const criticalMetrics = useMemo(() => {
    return metrics.filter(metric => metric.status === 'critical');
  }, [metrics]);

  const warningMetrics = useMemo(() => {
    return metrics.filter(metric => metric.status === 'warning');
  }, [metrics]);

  const performanceTrends = useMemo(() => {
    if (!selectedProfile?.historicalData) return [];
    return selectedProfile.historicalData.map(data => ({
      time: data.timestamp.toLocaleTimeString(),
      ...data.metrics,
    }));
  }, [selectedProfile]);

  const resourceEfficiency = useMemo(() => {
    return resourceUtilization.map(resource => ({
      name: resource.resourceType,
      efficiency: resource.efficiency,
      utilization: resource.utilization,
      cost: resource.cost,
    }));
  }, [resourceUtilization]);

  const bottleneckSeverityDistribution = useMemo(() => {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    profiles.forEach(profile => {
      profile.bottlenecks.forEach(bottleneck => {
        distribution[bottleneck.severity]++;
      });
    });
    return Object.entries(distribution).map(([severity, count]) => ({
      name: severity,
      value: count,
    }));
  }, [profiles]);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsData, profilesData, utilizationData, benchmarkData] = await Promise.all([
          getPerformanceMetrics(),
          getPerformanceProfiles(),
          getResourceUtilization(),
          getBenchmarks(),
        ]);
        
        setMetrics(metricsData);
        setProfiles(profilesData);
        setResourceUtilization(utilizationData);
        setBenchmarks(benchmarkData);
        
        if (profilesData.length > 0 && !selectedProfile) {
          setSelectedProfile(profilesData[0]);
        }
      } catch (error) {
        console.error('Failed to load performance data:', error);
      }
    };

    loadData();
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      getPerformanceMetrics().then(setMetrics);
      getResourceUtilization().then(setResourceUtilization);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Handlers
  const handleOptimizeRule = useCallback(async (ruleId: string) => {
    try {
      await optimizePerformance(ruleId);
      // Refresh data after optimization
      const updatedProfiles = await getPerformanceProfiles();
      setProfiles(updatedProfiles);
    } catch (error) {
      console.error('Failed to optimize rule:', error);
    }
  }, [optimizePerformance, getPerformanceProfiles]);

  const handleExportReport = useCallback(async () => {
    try {
      const report = await generatePerformanceReport({
        timeRange,
        includeMetrics: true,
        includeBottlenecks: true,
        includeBenchmarks: true,
        format: 'pdf',
      });
      
      const url = URL.createObjectURL(new Blob([report], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  }, [generatePerformanceReport, timeRange]);

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'execution':
        return Timer;
      case 'resource':
        return Cpu;
      case 'throughput':
        return Zap;
      case 'latency':
        return Clock;
      case 'error':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return activity;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'extreme':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Performance Analytics
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Deep insights into rule execution performance and optimization opportunities
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {criticalMetrics.length > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {criticalMetrics.length} Critical
                  </Badge>
                )}
                {warningMetrics.length > 0 && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {warningMetrics.length} Warning
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  id="auto-refresh"
                />
                <Label htmlFor="auto-refresh" className="text-sm">
                  Auto-refresh ({refreshInterval}s)
                </Label>
              </div>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="6h">6h</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="7d">7d</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportReport}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Options
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>View Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}>
                    <Eye className="h-4 w-4 mr-2" />
                    {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowOnlyIssues(!showOnlyIssues)}>
                    <Filter className="h-4 w-4 mr-2" />
                    {showOnlyIssues ? 'Show All' : 'Issues Only'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center space-x-2">
                <Gauge className="h-4 w-4" />
                <span>Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="profiles" className="flex items-center space-x-2">
                <LineChart className="h-4 w-4" />
                <span>Profiles</span>
              </TabsTrigger>
              <TabsTrigger value="bottlenecks" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Bottlenecks</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center space-x-2">
                <Cpu className="h-4 w-4" />
                <span>Resources</span>
              </TabsTrigger>
              <TabsTrigger value="benchmarks" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Benchmarks</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.slice(0, 4).map((metric) => {
                  const IconComponent = getMetricIcon(metric.category);
                  const TrendIcon = getTrendIcon(metric.trend);
                  return (
                    <Card key={metric.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {metric.name}
                        </CardTitle>
                        <IconComponent className={`h-4 w-4 ${getMetricColor(metric.status)}`} />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getMetricColor(metric.status)}`}>
                          {metric.value.toLocaleString()}{metric.unit}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <TrendIcon className={`h-3 w-3 mr-1 ${
                            metric.trend === 'up' ? 'text-green-600' : 
                            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                          <span>{metric.trendPercentage.toFixed(1)}% vs last period</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {metric.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Performance Overview Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <LineChart className="h-5 w-5" />
                        <span>Performance Trends</span>
                      </CardTitle>
                      <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Line</SelectItem>
                          <SelectItem value="area">Area</SelectItem>
                          <SelectItem value="bar">Bar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      {chartType === 'line' ? (
                        <LineChart data={performanceTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          {selectedMetrics.map((metric, index) => (
                            <Line
                              key={metric}
                              type="monotone"
                              dataKey={metric}
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                            />
                          ))}
                        </LineChart>
                      ) : chartType === 'area' ? (
                        <AreaChart data={performanceTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          {selectedMetrics.map((metric, index) => (
                            <Area
                              key={metric}
                              type="monotone"
                              dataKey={metric}
                              stackId="1"
                              stroke={COLORS[index % COLORS.length]}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </AreaChart>
                      ) : (
                        <BarChart data={performanceTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          {selectedMetrics.map((metric, index) => (
                            <Bar
                              key={metric}
                              dataKey={metric}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Bottleneck Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={bottleneckSeverityDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {bottleneckSeverityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Flame className="h-5 w-5 text-red-500" />
                      <span>Performance Hotspots</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profiles.slice(0, 5).filter(p => p.bottlenecks.length > 0).map((profile) => (
                        <div key={profile.ruleId} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{profile.ruleName}</div>
                            <div className="text-xs text-gray-500">
                              {profile.bottlenecks.length} bottleneck(s)
                            </div>
                          </div>
                          <Badge className={getComplexityColor(profile.complexity)}>
                            {profile.complexity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Rocket className="h-5 w-5 text-green-500" />
                      <span>Top Performers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profiles
                        .filter(p => p.bottlenecks.length === 0)
                        .slice(0, 5)
                        .map((profile) => (
                          <div key={profile.ruleId} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">{profile.ruleName}</div>
                              <div className="text-xs text-gray-500">
                                {profile.metrics.executionTime.avg.toFixed(2)}ms avg
                              </div>
                            </div>
                            <div className="text-green-600 font-semibold">
                              {(profile.metrics.accuracy.f1Score * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <span>Optimization Opportunities</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profiles
                        .flatMap(p => p.optimizationOpportunities)
                        .sort((a, b) => b.estimatedGain - a.estimatedGain)
                        .slice(0, 5)
                        .map((opportunity) => (
                          <div key={opportunity.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">{opportunity.title}</div>
                              <div className="text-xs text-gray-500">
                                {opportunity.type} • {opportunity.timeline}
                              </div>
                            </div>
                            <div className="text-yellow-600 font-semibold">
                              +{opportunity.estimatedGain}%
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Health Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>System Health Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {resourceUtilization.map((resource) => (
                      <div key={resource.resourceType} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {resource.resourceType}
                          </span>
                          <span className="text-sm text-gray-500">
                            {resource.utilization.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={resource.utilization} className="h-2" />
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>Efficiency: {resource.efficiency.toFixed(1)}%</div>
                          <div>Cost: ${resource.cost.toFixed(0)}/mo</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              {/* Metric Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search metrics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="execution">Execution</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="throughput">Throughput</SelectItem>
                    <SelectItem value="latency">Latency</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={aggregationLevel} onValueChange={(value: any) => setAggregationLevel(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw">Raw</SelectItem>
                    <SelectItem value="minute">Minute</SelectItem>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics
                  .filter(metric => 
                    metric.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (filterCategory === 'all' || metric.category === filterCategory)
                  )
                  .map((metric) => {
                    const IconComponent = getMetricIcon(metric.category);
                    const TrendIcon = getTrendIcon(metric.trend);
                    return (
                      <Card key={metric.id} className="relative">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <IconComponent className={`h-5 w-5 ${getMetricColor(metric.status)}`} />
                              <span>{metric.name}</span>
                            </CardTitle>
                            <Badge variant="outline" className={getMetricColor(metric.status)}>
                              {metric.status}
                            </Badge>
                          </div>
                          <CardDescription>{metric.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${getMetricColor(metric.status)}`}>
                              {metric.value.toLocaleString()}{metric.unit}
                            </div>
                            <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
                              <TrendIcon className={`h-4 w-4 mr-1 ${
                                metric.trend === 'up' ? 'text-green-600' : 
                                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`} />
                              <span>{metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Warning Threshold:</span>
                              <span className="font-medium">{metric.threshold.warning}{metric.unit}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Critical Threshold:</span>
                              <span className="font-medium">{metric.threshold.critical}{metric.unit}</span>
                            </div>
                          </div>

                          {metric.status !== 'healthy' && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                {metric.status === 'critical' 
                                  ? 'Immediate attention required' 
                                  : 'Monitor closely for improvements'
                                }
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="text-xs text-gray-500">
                            Last updated: {metric.lastUpdated.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>

            {/* Profiles Tab */}
            <TabsContent value="profiles" className="space-y-6">
              {/* Profile Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search rules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterComplexity} onValueChange={setFilterComplexity}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Complexity</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showOnlyIssues}
                    onCheckedChange={setShowOnlyIssues}
                    id="issues-only"
                  />
                  <Label htmlFor="issues-only" className="text-sm">
                    Issues only
                  </Label>
                </div>
              </div>

              {/* Profiles List */}
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <Card 
                    key={profile.ruleId}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedProfile?.ruleId === profile.ruleId ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg">{profile.ruleName}</CardTitle>
                          <Badge className={getComplexityColor(profile.complexity)}>
                            {profile.complexity}
                          </Badge>
                          {profile.bottlenecks.length > 0 && (
                            <Badge variant="destructive">
                              {profile.bottlenecks.length} issue(s)
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOptimizeRule(profile.ruleId);
                          }}
                          className="flex items-center space-x-2"
                        >
                          <Zap className="h-4 w-4" />
                          <span>Optimize</span>
                        </Button>
                      </div>
                      <CardDescription>Category: {profile.category}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Avg Execution</div>
                          <div className="text-lg font-semibold">
                            {profile.metrics.executionTime.avg.toFixed(2)}ms
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Throughput</div>
                          <div className="text-lg font-semibold">
                            {profile.metrics.throughput.recordsPerSecond.toFixed(0)}/s
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Error Rate</div>
                          <div className="text-lg font-semibold">
                            {(profile.metrics.errors.rate * 100).toFixed(2)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">F1 Score</div>
                          <div className="text-lg font-semibold">
                            {(profile.metrics.accuracy.f1Score * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Resource Usage */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Resource Usage</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>CPU</span>
                              <span>{profile.metrics.resourceUsage.cpu.toFixed(1)}%</span>
                            </div>
                            <Progress value={profile.metrics.resourceUsage.cpu} className="h-1" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>HardDrive</span>
                              <span>{profile.metrics.resourceUsage.memory.toFixed(1)}%</span>
                            </div>
                            <Progress value={profile.metrics.resourceUsage.memory} className="h-1" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>I/O</span>
                              <span>{profile.metrics.resourceUsage.io.toFixed(1)}%</span>
                            </div>
                            <Progress value={profile.metrics.resourceUsage.io} className="h-1" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Network</span>
                              <span>{profile.metrics.resourceUsage.network.toFixed(1)}%</span>
                            </div>
                            <Progress value={profile.metrics.resourceUsage.network} className="h-1" />
                          </div>
                        </div>
                      </div>

                      {/* Bottlenecks */}
                      {profile.bottlenecks.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Detected Bottlenecks</div>
                          <div className="space-y-2">
                            {profile.bottlenecks.slice(0, 3).map((bottleneck) => (
                              <div key={bottleneck.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                  <div className="text-sm font-medium">{bottleneck.location}</div>
                                  <div className="text-xs text-gray-500">{bottleneck.description}</div>
                                </div>
                                <Badge className={getSeverityColor(bottleneck.severity)}>
                                  {bottleneck.severity}
                                </Badge>
                              </div>
                            ))}
                            {profile.bottlenecks.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{profile.bottlenecks.length - 3} more bottlenecks
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Optimization Opportunities */}
                      {profile.optimizationOpportunities.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Optimization Opportunities</div>
                          <div className="space-y-2">
                            {profile.optimizationOpportunities.slice(0, 2).map((opportunity) => (
                              <div key={opportunity.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div>
                                  <div className="text-sm font-medium">{opportunity.title}</div>
                                  <div className="text-xs text-gray-500">{opportunity.description}</div>
                                </div>
                                <div className="text-green-600 font-semibold">
                                  +{opportunity.estimatedGain}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Profile Details */}
              {selectedProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Performance Analysis: {selectedProfile.ruleName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="execution_time" fill="#8884d8" />
                        <Line type="monotone" dataKey="cpu_usage" stroke="#82ca9d" strokeWidth={2} />
                        <Line type="monotone" dataKey="memory_usage" stroke="#ffc658" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Bottlenecks Tab */}
            <TabsContent value="bottlenecks" className="space-y-6">
              {/* Bottleneck Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {profiles
                  .flatMap(profile => profile.bottlenecks)
                  .sort((a, b) => b.impact - a.impact)
                  .map((bottleneck) => (
                    <Card 
                      key={bottleneck.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedBottleneck?.id === bottleneck.id ? 'ring-2 ring-orange-500' : ''
                      }`}
                      onClick={() => setSelectedBottleneck(bottleneck)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{bottleneck.type}</CardTitle>
                          <Badge className={getSeverityColor(bottleneck.severity)}>
                            {bottleneck.severity}
                          </Badge>
                        </div>
                        <CardDescription>{bottleneck.location}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {bottleneck.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Impact</div>
                            <div className="text-lg font-bold text-red-600">
                              {bottleneck.impact.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Frequency</div>
                            <div className="text-lg font-bold text-orange-600">
                              {bottleneck.frequency.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Suggested Actions</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {bottleneck.suggestedActions.slice(0, 3).map((action, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-xs">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>Estimated Improvement:</span>
                          <span className="font-semibold text-green-600">
                            +{bottleneck.estimatedImprovement.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>Implementation Effort:</span>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < bottleneck.effort ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Detailed Bottleneck Analysis */}
              {selectedBottleneck && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis: {selectedBottleneck.type} Bottleneck</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {selectedBottleneck.impact.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Performance Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {selectedBottleneck.frequency.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Occurrence Frequency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          +{selectedBottleneck.estimatedImprovement.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Potential Improvement</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Complete Action Plan</div>
                        <div className="space-y-2">
                          {selectedBottleneck.suggestedActions.map((action, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="text-sm">{action}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              {/* Resource Efficiency Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="h-5 w-5" />
                    <span>Resource Efficiency Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={resourceEfficiency}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <RechartsRadar
                        name="Efficiency"
                        dataKey="efficiency"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <RechartsRadar
                        name="Utilization"
                        dataKey="utilization"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Resource Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resourceUtilization.map((resource) => (
                  <Card key={resource.resourceType}>
                    <CardHeader>
                      <CardTitle className="capitalize">{resource.resourceType} Usage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Usage</span>
                          <span>{resource.current.toFixed(1)}%</span>
                        </div>
                        <Progress value={resource.current} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-500">Peak</div>
                          <div className="text-lg font-bold">{resource.peak.toFixed(1)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-500">Average</div>
                          <div className="text-lg font-bold">{resource.average.toFixed(1)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-500">Efficiency</div>
                          <div className="text-lg font-bold">{resource.efficiency.toFixed(1)}%</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Capacity</span>
                          <span>{resource.capacity.toLocaleString()} units</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Monthly Cost</span>
                          <span>${resource.cost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={resource.trend.map((value, index) => ({ index, value }))}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Benchmarks Tab */}
            <TabsContent value="benchmarks" className="space-y-6">
              {/* Benchmark Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {benchmarks.map((benchmark) => (
                  <Card key={benchmark.category}>
                    <CardHeader>
                      <CardTitle>{benchmark.category} Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Baseline</span>
                          <span className="font-medium">{benchmark.baseline.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Current</span>
                          <span className="font-medium text-blue-600">{benchmark.current.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Target</span>
                          <span className="font-medium text-green-600">{benchmark.target.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Industry Average</span>
                          <span className="font-medium text-gray-600">{benchmark.industry.toFixed(2)}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to Target</span>
                          <span>{((benchmark.current / benchmark.target) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(benchmark.current / benchmark.target) * 100} className="h-2" />
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-500">Industry Percentile</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {benchmark.percentile.toFixed(0)}th
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span>Improvement vs Baseline:</span>
                        <span className={`font-semibold ${
                          benchmark.improvement > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {benchmark.improvement > 0 ? '+' : ''}{benchmark.improvement.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Overall Benchmark Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Benchmark Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={benchmarks}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" />
                      <Bar dataKey="current" fill="#3b82f6" name="Current" />
                      <Bar dataKey="target" fill="#10b981" name="Target" />
                      <Bar dataKey="industry" fill="#64748b" name="Industry" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
};