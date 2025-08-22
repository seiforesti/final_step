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
import {
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  Trophy,
  Medal,
  Crown,
  Star,
  ChevronUp,
  ChevronDown,
  Activity,
  Zap,
  Clock,
  Cpu,
  Database,
  Network,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Gauge,
  Filter,
  Search,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  MapPin,
  Layers,
  GitBranch,
  Users,
  Share,
  FileText,
  MoreHorizontal,
  ChevronRight,
  Info,
  Lightbulb,
  Sparkles,
  LineChart,
  PieChart,
  BarChart2,
  Radar,
  Flame,
  Snowflake,
  Wind,
  Sun,
  CloudRain,
  ShieldCheck,
  Rocket,
  Bell,
  Hash,
  Percent,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Globe,
  Building,
  Briefcase,
} from 'lucide-react';
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
  FunnelChart,
  Funnel,
} from 'recharts';
import { useOptimization } from '../../hooks/useOptimization';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// Types
interface BenchmarkCategory {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  weight: number;
  industry: string;
  enabled: boolean;
}

interface BenchmarkMetric {
  id: string;
  name: string;
  category: string;
  unit: string;
  description: string;
  current: number;
  baseline: number;
  target: number;
  industry: number;
  competitor: number;
  best: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  confidence: number;
  lastUpdated: Date;
}

interface CompetitorProfile {
  id: string;
  name: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  region: string;
  metrics: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  marketShare: number;
  overallScore: number;
  lastUpdated: Date;
}

interface IndustryStandard {
  id: string;
  industry: string;
  metric: string;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  sampleSize: number;
  geography: string;
  methodology: string;
  validUntil: Date;
}

interface BenchmarkReport {
  id: string;
  name: string;
  generated: Date;
  categories: string[];
  metrics: string[];
  overallScore: number;
  industryRank: number;
  totalParticipants: number;
  improvements: BenchmarkImprovement[];
  recommendations: BenchmarkRecommendation[];
  executiveSummary: string;
}

interface BenchmarkImprovement {
  id: string;
  metric: string;
  fromValue: number;
  toValue: number;
  improvement: number;
  period: string;
  impact: 'high' | 'medium' | 'low';
}

interface BenchmarkRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: number;
  effort: number;
  timeline: string;
  requirements: string[];
  expectedOutcome: string;
}

interface CustomBenchmark {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  comparisonType: 'internal' | 'industry' | 'competitor' | 'custom';
  targets: Record<string, number>;
  weightings: Record<string, number>;
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  lastRun: Date;
  results: BenchmarkResult[];
}

interface BenchmarkResult {
  timestamp: Date;
  overallScore: number;
  metricScores: Record<string, number>;
  ranking: number;
  participants: number;
  insights: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const INDUSTRY_SEGMENTS = [
  'Financial Services',
  'Healthcare',
  'Technology',
  'Manufacturing',
  'Retail',
  'Government',
  'Education',
  'Telecommunications',
  'Energy',
  'Other'
];

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-50)' },
  { value: 'small', label: 'Small (51-200)' },
  { value: 'medium', label: 'Medium (201-1000)' },
  { value: 'large', label: 'Large (1001-5000)' },
  { value: 'enterprise', label: 'Enterprise (5000+)' }
];

export const BenchmarkingDashboard: React.FC = () => {
  // Hooks
  const {
    getBenchmarkMetrics,
    getCompetitorProfiles,
    getIndustryStandards,
    getBenchmarkReports,
    getCustomBenchmarks,
    createCustomBenchmark,
    runBenchmark,
    updateBenchmarkTargets,
    exportBenchmarkReport,
  } = useOptimization();

  const {
    generateBenchmarkInsights,
    predictBenchmarkTrends,
    suggestBenchmarkImprovements,
    analyzeBenchmarkGaps,
  } = useIntelligence();

  const { rules } = useScanRules();
  const { generateReport } = useReporting();

  // State
  const [metrics, setMetrics] = useState<BenchmarkMetric[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([]);
  const [industryStandards, setIndustryStandards] = useState<IndustryStandard[]>([]);
  const [reports, setReports] = useState<BenchmarkReport[]>([]);
  const [customBenchmarks, setCustomBenchmarks] = useState<CustomBenchmark[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorProfile | null>(null);
  const [selectedReport, setSelectedReport] = useState<BenchmarkReport | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'metrics' | 'categories' | 'competitors'>('metrics');
  const [selectedIndustry, setSelectedIndustry] = useState('Technology');
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyPoor, setShowOnlyPoor] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300);
  const [showCreateBenchmark, setShowCreateBenchmark] = useState(false);
  const [newBenchmark, setNewBenchmark] = useState<Partial<CustomBenchmark>>({
    name: '',
    description: '',
    metrics: [],
    comparisonType: 'industry',
    targets: {},
    weightings: {},
    schedule: 'weekly',
    enabled: true,
  });

  // Computed values
  const filteredMetrics = useMemo(() => {
    return metrics.filter(metric => {
      const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || metric.category === filterCategory;
      const isPoor = showOnlyPoor ? ['poor', 'critical'].includes(metric.status) : true;
      return matchesSearch && matchesCategory && isPoor;
    });
  }, [metrics, searchTerm, filterCategory, showOnlyPoor]);

  const overallBenchmarkScore = useMemo(() => {
    if (metrics.length === 0) return 0;
    const totalWeight = metrics.reduce((sum, metric) => sum + 1, 0);
    const weightedScore = metrics.reduce((sum, metric) => {
      const score = (metric.current / metric.target) * 100;
      return sum + Math.min(score, 100);
    }, 0);
    return weightedScore / totalWeight;
  }, [metrics]);

  const industryRanking = useMemo(() => {
    if (metrics.length === 0) return { rank: 0, total: 0 };
    const averagePercentile = metrics.reduce((sum, metric) => sum + metric.percentile, 0) / metrics.length;
    const rank = Math.max(1, Math.round((100 - averagePercentile) / 100 * 1000));
    return { rank, total: 1000 };
  }, [metrics]);

  const topCompetitors = useMemo(() => {
    return competitors
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);
  }, [competitors]);

  const benchmarkCategories = useMemo(() => {
    const categories = Array.from(new Set(metrics.map(m => m.category)));
    return categories.map(category => {
      const categoryMetrics = metrics.filter(m => m.category === category);
      const averageScore = categoryMetrics.reduce((sum, m) => sum + (m.current / m.target) * 100, 0) / categoryMetrics.length;
      const status = averageScore >= 90 ? 'excellent' : averageScore >= 75 ? 'good' : averageScore >= 60 ? 'average' : averageScore >= 40 ? 'poor' : 'critical';
      return {
        name: category,
        score: averageScore,
        status,
        metrics: categoryMetrics.length,
        improvement: categoryMetrics.reduce((sum, m) => sum + m.trendPercentage, 0) / categoryMetrics.length,
      };
    });
  }, [metrics]);

  const performanceTrends = useMemo(() => {
    // Generate trend data based on metric trends
    const timePoints = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    return timePoints.map((month, index) => {
      const baseScore = overallBenchmarkScore;
      const trend = metrics.reduce((sum, m) => sum + m.trendPercentage, 0) / metrics.length;
      const variation = (Math.random() - 0.5) * 10;
      const score = Math.max(0, Math.min(100, baseScore + (trend * index / 12) + variation));
      
      return {
        month,
        score: Number(score.toFixed(1)),
        industry: Number((baseScore * 0.9 + variation * 0.5).toFixed(1)),
        target: 85,
      };
    });
  }, [overallBenchmarkScore, metrics]);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsData, competitorsData, standardsData, reportsData, customData] = await Promise.all([
          getBenchmarkMetrics(),
          getCompetitorProfiles(),
          getIndustryStandards(),
          getBenchmarkReports(),
          getCustomBenchmarks(),
        ]);
        
        setMetrics(metricsData);
        setCompetitors(competitorsData);
        setIndustryStandards(standardsData);
        setReports(reportsData);
        setCustomBenchmarks(customData);
      } catch (error) {
        console.error('Failed to load benchmark data:', error);
      }
    };

    loadData();
  }, [selectedIndustry, selectedSize, selectedRegion]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      getBenchmarkMetrics().then(setMetrics);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Handlers
  const handleRunBenchmark = useCallback(async (benchmarkId?: string) => {
    try {
      if (benchmarkId) {
        await runBenchmark(benchmarkId);
      } else {
        // Run all enabled benchmarks
        const enabled = customBenchmarks.filter(b => b.enabled);
        await Promise.all(enabled.map(b => runBenchmark(b.id)));
      }
      
      // Refresh data
      const [metricsData, reportsData] = await Promise.all([
        getBenchmarkMetrics(),
        getBenchmarkReports(),
      ]);
      setMetrics(metricsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to run benchmark:', error);
    }
  }, [customBenchmarks, runBenchmark, getBenchmarkMetrics, getBenchmarkReports]);

  const handleCreateBenchmark = useCallback(async () => {
    try {
      if (!newBenchmark.name || !newBenchmark.metrics?.length) return;
      
      const benchmark = await createCustomBenchmark(newBenchmark as CustomBenchmark);
      setCustomBenchmarks(prev => [...prev, benchmark]);
      setShowCreateBenchmark(false);
      setNewBenchmark({
        name: '',
        description: '',
        metrics: [],
        comparisonType: 'industry',
        targets: {},
        weightings: {},
        schedule: 'weekly',
        enabled: true,
      });
    } catch (error) {
      console.error('Failed to create benchmark:', error);
    }
  }, [newBenchmark, createCustomBenchmark]);

  const handleExportReport = useCallback(async (reportId?: string) => {
    try {
      const report = await exportBenchmarkReport(reportId || selectedReport?.id);
      
      // Download report
      const url = URL.createObjectURL(new Blob([report], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `benchmark-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  }, [selectedReport, exportBenchmarkReport]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'average':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'poor':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return Crown;
      case 'good':
        return Trophy;
      case 'average':
        return Medal;
      case 'poor':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return Activity;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Activity;
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600';
    if (percentile >= 75) return 'text-blue-600';
    if (percentile >= 50) return 'text-yellow-600';
    if (percentile >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Benchmarking Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Performance comparisons, industry standards, and competitive analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  <Award className="h-3 w-3 mr-1" />
                  Score: {overallBenchmarkScore.toFixed(1)}%
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Trophy className="h-3 w-3 mr-1" />
                  Rank: #{industryRanking.rank} / {industryRanking.total}
                </Badge>
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
                  Auto-refresh ({refreshInterval / 60}m)
                </Label>
              </div>

              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_SEGMENTS.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRunBenchmark()}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Run Benchmark</span>
              </Button>

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
                  <DropdownMenuLabel>Benchmark Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowCreateBenchmark(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Benchmark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowOnlyPoor(!showOnlyPoor)}>
                    <Filter className="h-4 w-4 mr-2" />
                    {showOnlyPoor ? 'Show All' : 'Issues Only'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Globe className="h-4 w-4 mr-2" />
                    Industry Settings
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
              <TabsTrigger value="competitors" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Competitors</span>
              </TabsTrigger>
              <TabsTrigger value="industry" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Industry</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Custom</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overall Score
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {overallBenchmarkScore.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      vs industry average
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Industry Rank
                    </CardTitle>
                    <Medal className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      #{industryRanking.rank}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      out of {industryRanking.total} companies
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Top Quartile Metrics
                    </CardTitle>
                    <Star className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.filter(m => m.percentile >= 75).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {metrics.length} total metrics
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Improvement Areas
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics.filter(m => m.status === 'poor' || m.status === 'critical').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      need immediate attention
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <LineChart className="h-5 w-5" />
                      <span>Performance Trends</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          name="Our Score"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="industry" 
                          stroke="#64748b" 
                          strokeDasharray="5 5"
                          name="Industry Average"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#10b981" 
                          strokeDasharray="3 3"
                          name="Target"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Category Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={benchmarkCategories}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="score"
                          label={({ name, score }) => `${name}: ${score.toFixed(1)}%`}
                        >
                          {benchmarkCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Category Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="h-5 w-5" />
                    <span>Performance by Category</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {benchmarkCategories.map((category) => {
                      const StatusIcon = getStatusIcon(category.status);
                      return (
                        <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <StatusIcon className={`h-5 w-5 ${getStatusColor(category.status).split(' ')[0]}`} />
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-gray-500">
                                {category.metrics} metrics • {category.improvement > 0 ? '+' : ''}{category.improvement.toFixed(1)}% trend
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-bold">{category.score.toFixed(1)}%</div>
                              <Badge className={getStatusColor(category.status)}>
                                {category.status}
                              </Badge>
                            </div>
                            <div className="w-24">
                              <Progress value={category.score} className="h-2" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Top Competitors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Top Competitors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topCompetitors.map((competitor, index) => (
                      <div key={competitor.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{competitor.name}</div>
                            <div className="text-sm text-gray-500">
                              {competitor.industry} • {competitor.size} • {competitor.region}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold">{competitor.overallScore.toFixed(1)}%</div>
                            <div className="text-sm text-gray-500">
                              {competitor.marketShare.toFixed(1)}% market share
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCompetitor(competitor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              {/* Filters */}
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
                    {Array.from(new Set(metrics.map(m => m.category))).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metrics">Individual Metrics</SelectItem>
                    <SelectItem value="categories">By Category</SelectItem>
                    <SelectItem value="competitors">vs Competitors</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showOnlyPoor}
                    onCheckedChange={setShowOnlyPoor}
                    id="poor-only"
                  />
                  <Label htmlFor="poor-only" className="text-sm">
                    Issues only
                  </Label>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMetrics.map((metric) => {
                  const StatusIcon = getStatusIcon(metric.status);
                  const TrendIcon = getTrendIcon(metric.trend);
                  return (
                    <Card key={metric.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <StatusIcon className={`h-5 w-5 ${getStatusColor(metric.status).split(' ')[0]}`} />
                            <span>{metric.name}</span>
                          </CardTitle>
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status}
                          </Badge>
                        </div>
                        <CardDescription>{metric.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {metric.current.toLocaleString()}{metric.unit}
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

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Target:</span>
                            <span className="font-medium text-green-600">{metric.target.toLocaleString()}{metric.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Industry:</span>
                            <span className="font-medium text-blue-600">{metric.industry.toLocaleString()}{metric.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Best in Class:</span>
                            <span className="font-medium text-purple-600">{metric.best.toLocaleString()}{metric.unit}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Progress to Target</span>
                            <span className="text-sm font-medium">
                              {((metric.current / metric.target) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={(metric.current / metric.target) * 100} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Industry Percentile:</span>
                          <span className={`font-semibold ${getPercentileColor(metric.percentile)}`}>
                            {metric.percentile.toFixed(0)}th
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Confidence: {(metric.confidence * 100).toFixed(0)}%</span>
                          <span>Updated: {metric.lastUpdated.toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Competitors Tab */}
            <TabsContent value="competitors" className="space-y-6">
              {/* Competitor Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Competitive Landscape</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="marketShare" 
                        name="Market Share" 
                        unit="%" 
                        domain={[0, 'dataMax + 5']}
                      />
                      <YAxis 
                        dataKey="overallScore" 
                        name="Performance Score" 
                        unit="%" 
                        domain={[0, 100]}
                      />
                      <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter 
                        name="Competitors" 
                        data={competitors} 
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Competitor List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {competitors.map((competitor) => (
                  <Card 
                    key={competitor.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCompetitor?.id === competitor.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedCompetitor(competitor)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{competitor.name}</CardTitle>
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          {competitor.overallScore.toFixed(1)}%
                        </Badge>
                      </div>
                      <CardDescription>
                        {competitor.industry} • {competitor.size} • {competitor.region}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Market Share</div>
                          <div className="text-lg font-semibold">{competitor.marketShare.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Overall Score</div>
                          <div className="text-lg font-semibold">{competitor.overallScore.toFixed(1)}%</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Key Strengths</div>
                        <div className="flex flex-wrap gap-1">
                          {competitor.strengths.slice(0, 3).map((strength, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Weaknesses</div>
                        <div className="flex flex-wrap gap-1">
                          {competitor.weaknesses.slice(0, 3).map((weakness, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Last updated: {competitor.lastUpdated.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Competitor Details */}
              {selectedCompetitor && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis: {selectedCompetitor.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="text-sm font-medium">Performance Comparison</div>
                        {Object.entries(selectedCompetitor.metrics).map(([metric, value]) => {
                          const ourMetric = metrics.find(m => m.name.toLowerCase().includes(metric.toLowerCase()));
                          const ourValue = ourMetric?.current || 0;
                          const isWinning = ourValue > value;
                          
                          return (
                            <div key={metric} className="flex items-center justify-between">
                              <span className="text-sm">{metric}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${isWinning ? 'text-green-600' : 'text-red-600'}`}>
                                  {ourValue.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">vs</span>
                                <span className="text-sm font-medium">{value.toFixed(1)}</span>
                                {isWinning ? (
                                  <ChevronUp className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-sm font-medium">Strategic Insights</div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">All Strengths</div>
                            <div className="flex flex-wrap gap-1">
                              {selectedCompetitor.strengths.map((strength, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-500 mb-1">All Weaknesses</div>
                            <div className="flex flex-wrap gap-1">
                              {selectedCompetitor.weaknesses.map((weakness, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {weakness}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Industry Tab */}
            <TabsContent value="industry" className="space-y-6">
              {/* Industry Standards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Industry Standards: {selectedIndustry}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {industryStandards
                      .filter(std => std.industry === selectedIndustry)
                      .map((standard) => (
                        <div key={standard.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{standard.metric}</h4>
                            <Badge variant="outline">
                              Sample: {standard.sampleSize.toLocaleString()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {Object.entries(standard.percentiles).map(([percentile, value]) => (
                              <div key={percentile} className="text-center">
                                <div className="text-xs text-gray-500">{percentile.toUpperCase()}</div>
                                <div className="text-sm font-medium">{value.toFixed(1)}</div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Geography: {standard.geography} • 
                            Valid until: {standard.validUntil.toLocaleDateString()} • 
                            Methodology: {standard.methodology}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={industryStandards.slice(0, 5).map(std => ({
                      metric: std.metric.substring(0, 15),
                      p25: std.percentiles.p25,
                      p50: std.percentiles.p50,
                      p75: std.percentiles.p75,
                      p90: std.percentiles.p90,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="p25" fill="#fca5a5" name="25th Percentile" />
                      <Bar dataKey="p50" fill="#fbbf24" name="50th Percentile" />
                      <Bar dataKey="p75" fill="#60a5fa" name="75th Percentile" />
                      <Bar dataKey="p90" fill="#34d399" name="90th Percentile" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Tab */}
            <TabsContent value="custom" className="space-y-6">
              {/* Custom Benchmarks */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Custom Benchmarks</h3>
                <Button onClick={() => setShowCreateBenchmark(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Benchmark
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {customBenchmarks.map((benchmark) => (
                  <Card key={benchmark.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{benchmark.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Switch checked={benchmark.enabled} />
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{benchmark.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Type</div>
                          <div className="font-medium capitalize">{benchmark.comparisonType}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Schedule</div>
                          <div className="font-medium capitalize">{benchmark.schedule}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Metrics ({benchmark.metrics.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {benchmark.metrics.slice(0, 5).map((metric, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                          {benchmark.metrics.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{benchmark.metrics.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {benchmark.results.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Latest Result</div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-bold text-purple-600">
                                {benchmark.results[0].overallScore.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                Rank #{benchmark.results[0].ranking} of {benchmark.results[0].participants}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {benchmark.results[0].timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Created: {benchmark.createdAt.toLocaleDateString()} • 
                        Last run: {benchmark.lastRun?.toLocaleDateString() || 'Never'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              {/* Reports List */}
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card 
                    key={report.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedReport?.id === report.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            Score: {report.overallScore.toFixed(1)}%
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => handleExportReport(report.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Generated: {report.generated.toLocaleDateString()} • 
                        Rank: #{report.industryRank} of {report.totalParticipants}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Categories</div>
                          <div className="font-medium">{report.categories.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Metrics</div>
                          <div className="font-medium">{report.metrics.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Improvements</div>
                          <div className="font-medium">{report.improvements.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Recommendations</div>
                          <div className="font-medium">{report.recommendations.length}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Executive Summary</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.executiveSummary.substring(0, 200)}...
                        </p>
                      </div>

                      {report.improvements.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Key Improvements</div>
                          <div className="space-y-1">
                            {report.improvements.slice(0, 3).map((improvement) => (
                              <div key={improvement.id} className="flex items-center justify-between text-sm">
                                <span>{improvement.metric}</span>
                                <span className="text-green-600 font-medium">
                                  +{improvement.improvement.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Benchmark Dialog */}
        <Dialog open={showCreateBenchmark} onOpenChange={setShowCreateBenchmark}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Benchmark</DialogTitle>
              <DialogDescription>
                Define a custom benchmark to compare your performance against specific targets
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Benchmark Name</Label>
                  <Input
                    value={newBenchmark.name || ''}
                    onChange={(e) => setNewBenchmark(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Q4 Performance Review"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Comparison Type</Label>
                  <Select 
                    value={newBenchmark.comparisonType || 'industry'} 
                    onValueChange={(value: any) => setNewBenchmark(prev => ({ ...prev, comparisonType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Baseline</SelectItem>
                      <SelectItem value="industry">Industry Standard</SelectItem>
                      <SelectItem value="competitor">Competitor</SelectItem>
                      <SelectItem value="custom">Custom Targets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newBenchmark.description || ''}
                  onChange={(e) => setNewBenchmark(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this benchmark's purpose"
                />
              </div>

              <div className="space-y-2">
                <Label>Schedule</Label>
                <Select 
                  value={newBenchmark.schedule || 'weekly'} 
                  onValueChange={(value: any) => setNewBenchmark(prev => ({ ...prev, schedule: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Metrics to Include</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Switch
                        checked={newBenchmark.metrics?.includes(metric.name) || false}
                        onCheckedChange={(checked) => {
                          const currentMetrics = newBenchmark.metrics || [];
                          if (checked) {
                            setNewBenchmark(prev => ({
                              ...prev,
                              metrics: [...currentMetrics, metric.name]
                            }));
                          } else {
                            setNewBenchmark(prev => ({
                              ...prev,
                              metrics: currentMetrics.filter(m => m !== metric.name)
                            }));
                          }
                        }}
                      />
                      <span className="text-sm">{metric.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateBenchmark(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBenchmark}>
                Create Benchmark
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};