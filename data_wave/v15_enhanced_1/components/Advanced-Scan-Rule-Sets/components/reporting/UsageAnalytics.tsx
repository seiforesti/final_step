import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadialBarChart,
  RadialBar,
  Funnel,
  FunnelChart
} from 'recharts';
import { 
  Users,
  User,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Calendar,
  Eye,
  Mouse,
  Smartphone,
  Monitor,
  Globe,
  MapPin,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  Bookmark,
  Star,
  Flag,
  Bell,
  Mail,
  Target,
  Zap,
  Database,
  Network,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Timer,
  Hourglass,
  Hash,
  Percent,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  StopCircle,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  Fingerprint,
  Shield,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  FileText,
  Image,
  Video,
  Code,
  Link,
  Layers,
  GitBranch,
  History,
  Archive,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Maximize,
  Minimize,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReporting } from '../../hooks/useReporting';
import { reportingApi } from '../../services/reporting-apis';

interface UsageAnalyticsProps {
  className?: string;
  onUsageUpdate?: (analytics: UsageAnalytics) => void;
  onAnomalyDetected?: (anomaly: UsageAnomaly) => void;
}

interface UsageAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    sessionCount: number;
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    retentionRate: number;
    churnRate: number;
    engagementScore: number;
  };
  timeRange: {
    start: Date;
    end: Date;
    timezone: string;
  };
  userMetrics: {
    demographics: UserDemographics;
    behavior: UserBehavior;
    engagement: UserEngagement;
    retention: UserRetention;
    segmentation: UserSegmentation[];
  };
  featureUsage: FeatureUsage[];
  contentAnalytics: ContentAnalytics;
  performanceMetrics: PerformanceMetrics;
  deviceAnalytics: DeviceAnalytics;
  geographicData: GeographicData;
  realtimeData: RealtimeData;
  conversionFunnels: ConversionFunnel[];
  cohortAnalysis: CohortAnalysis;
  pathAnalysis: PathAnalysis;
  experimentResults: ExperimentResult[];
}

interface UserDemographics {
  ageDistribution: Array<{ ageGroup: string; count: number; percentage: number }>;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  locationDistribution: Array<{ country: string; count: number; percentage: number }>;
  organizationTypes: Array<{ type: string; count: number; percentage: number }>;
  roles: Array<{ role: string; count: number; percentage: number }>;
  experienceLevel: Array<{ level: string; count: number; percentage: number }>;
}

interface UserBehavior {
  activityPatterns: Array<{
    hour: number;
    day: string;
    activity: number;
    engagement: number;
  }>;
  sessionPatterns: Array<{
    duration: string;
    count: number;
    percentage: number;
  }>;
  navigationPatterns: Array<{
    fromPage: string;
    toPage: string;
    count: number;
    conversionRate: number;
  }>;
  interactionHeatmap: Array<{
    element: string;
    clicks: number;
    hovers: number;
    dwellTime: number;
  }>;
  scrollBehavior: Array<{
    page: string;
    averageDepth: number;
    maxDepth: number;
    exitPoints: number[];
  }>;
}

interface UserEngagement {
  engagementLevels: Array<{
    level: 'low' | 'medium' | 'high' | 'very_high';
    count: number;
    percentage: number;
    characteristics: string[];
  }>;
  actionsPerSession: Array<{
    actionCount: number;
    sessionCount: number;
    percentage: number;
  }>;
  timeSpentDistribution: Array<{
    timeRange: string;
    userCount: number;
    percentage: number;
  }>;
  featureAdoption: Array<{
    feature: string;
    adoptionRate: number;
    timeToAdopt: number;
    powerUsers: number;
  }>;
  contentEngagement: Array<{
    contentType: string;
    viewTime: number;
    interactionRate: number;
    completionRate: number;
  }>;
}

interface UserRetention {
  cohorts: Array<{
    cohortMonth: string;
    userCount: number;
    retentionRates: number[];
  }>;
  retentionCurve: Array<{
    period: number;
    retentionRate: number;
    userCount: number;
  }>;
  churnAnalysis: Array<{
    segment: string;
    churnRate: number;
    reasonsForChurn: Array<{
      reason: string;
      percentage: number;
    }>;
  }>;
}

interface UserSegmentation {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  userCount: number;
  growthRate: number;
  engagementScore: number;
  conversionRate: number;
  averageValue: number;
  characteristics: string[];
  trends: Array<{
    date: string;
    userCount: number;
    engagement: number;
  }>;
}

interface SegmentCriteria {
  demographics: any;
  behavior: any;
  geography: any;
  technology: any;
  engagement: any;
}

interface FeatureUsage {
  featureId: string;
  featureName: string;
  category: string;
  usageStats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalUsage: number;
    averageUsagePerUser: number;
    usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  };
  adoption: {
    adoptionRate: number;
    timeToFirstUse: number;
    timeToRegularUse: number;
    abandonmentRate: number;
  };
  performance: {
    loadTime: number;
    errorRate: number;
    completionRate: number;
    userSatisfaction: number;
  };
  trends: Array<{
    date: string;
    usage: number;
    users: number;
    satisfaction: number;
  }>;
  feedback: {
    ratings: Array<{ rating: number; count: number }>;
    comments: FeatureFeedback[];
  };
}

interface FeatureFeedback {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  category: 'bug' | 'improvement' | 'praise' | 'question';
  submittedAt: Date;
  status: 'new' | 'reviewed' | 'addressed' | 'closed';
}

interface ContentAnalytics {
  pageViews: Array<{
    page: string;
    views: number;
    uniqueViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
  }>;
  contentPerformance: Array<{
    contentId: string;
    title: string;
    type: string;
    views: number;
    engagement: number;
    completionRate: number;
    shareCount: number;
    conversionRate: number;
  }>;
  searchAnalytics: {
    totalSearches: number;
    uniqueQueries: number;
    noResultsRate: number;
    topQueries: Array<{
      query: string;
      count: number;
      clickThroughRate: number;
    }>;
    searchPatterns: Array<{
      pattern: string;
      frequency: number;
      intent: string;
    }>;
  };
  downloadAnalytics: Array<{
    resourceId: string;
    name: string;
    type: string;
    downloads: number;
    uniqueDownloaders: number;
    completionRate: number;
  }>;
}

interface PerformanceMetrics {
  pageLoad: {
    averageLoadTime: number;
    medianLoadTime: number;
    p95LoadTime: number;
    loadTimeDistribution: Array<{
      timeRange: string;
      pageCount: number;
      percentage: number;
    }>;
  };
  networkMetrics: {
    averageLatency: number;
    packetLoss: number;
    bandwidth: number;
    connectionTypes: Array<{
      type: string;
      percentage: number;
      averageSpeed: number;
    }>;
  };
  errorAnalytics: {
    totalErrors: number;
    errorRate: number;
    errorTypes: Array<{
      type: string;
      count: number;
      affectedUsers: number;
    }>;
    topErrors: Array<{
      error: string;
      count: number;
      firstSeen: Date;
      lastSeen: Date;
    }>;
  };
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkUsage: number;
  };
}

interface DeviceAnalytics {
  deviceTypes: Array<{
    type: 'desktop' | 'tablet' | 'mobile';
    count: number;
    percentage: number;
    averageSessionDuration: number;
    bounceRate: number;
  }>;
  operatingSystems: Array<{
    os: string;
    version: string;
    count: number;
    percentage: number;
  }>;
  browsers: Array<{
    browser: string;
    version: string;
    count: number;
    percentage: number;
    performance: number;
  }>;
  screenResolutions: Array<{
    resolution: string;
    count: number;
    percentage: number;
  }>;
  capabilities: {
    javascriptEnabled: number;
    cookiesEnabled: number;
    flashEnabled: number;
    javaEnabled: number;
  };
}

interface GeographicData {
  countries: Array<{
    country: string;
    code: string;
    userCount: number;
    sessions: number;
    averageSessionDuration: number;
    conversionRate: number;
  }>;
  cities: Array<{
    city: string;
    country: string;
    userCount: number;
    timezone: string;
    localTime: string;
  }>;
  heatmap: Array<{
    latitude: number;
    longitude: number;
    intensity: number;
    userCount: number;
  }>;
}

interface RealtimeData {
  currentUsers: number;
  activePages: Array<{
    page: string;
    activeUsers: number;
    avgTimeOnPage: number;
  }>;
  liveEvents: Array<{
    timestamp: Date;
    event: string;
    userId: string;
    page: string;
    data: any;
  }>;
  currentSessions: number;
  newSessionsRate: number;
  conversionEvents: number;
}

interface ConversionFunnel {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    stepId: string;
    name: string;
    userCount: number;
    conversionRate: number;
    dropoffRate: number;
    averageTimeToNext: number;
  }>;
  overallConversionRate: number;
  totalUsers: number;
  completedUsers: number;
  abandonmentPoints: Array<{
    step: string;
    reason: string;
    percentage: number;
  }>;
}

interface CohortAnalysis {
  timeframe: 'daily' | 'weekly' | 'monthly';
  cohorts: Array<{
    cohortId: string;
    startDate: Date;
    size: number;
    retentionRates: number[];
    averageValue: number;
    characteristics: string[];
  }>;
  retentionHeatmap: Array<{
    cohort: string;
    periods: number[];
  }>;
}

interface PathAnalysis {
  topPaths: Array<{
    path: string[];
    userCount: number;
    conversionRate: number;
    averageDuration: number;
  }>;
  entryPoints: Array<{
    page: string;
    userCount: number;
    nextActions: Array<{
      action: string;
      count: number;
      percentage: number;
    }>;
  }>;
  exitPoints: Array<{
    page: string;
    exitCount: number;
    exitRate: number;
    previousActions: string[];
  }>;
}

interface ExperimentResult {
  experimentId: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: Array<{
    variantId: string;
    name: string;
    traffic: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
  }>;
  metrics: Array<{
    metric: string;
    baseline: number;
    results: Array<{
      variant: string;
      value: number;
      lift: number;
      significance: number;
    }>;
  }>;
  startDate: Date;
  endDate?: Date;
  duration: number;
  participants: number;
}

interface UsageAnomaly {
  id: string;
  type: 'spike' | 'drop' | 'unusual_pattern' | 'performance_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  description: string;
  detectedAt: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  expectedValue: number;
  actualValue: number;
  deviation: number;
  affectedUsers: number;
  possibleCauses: string[];
  recommendedActions: string[];
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
}

const TIME_RANGES = [
  { value: 'last_hour', label: 'Last Hour' },
  { value: 'last_24h', label: 'Last 24 Hours' },
  { value: 'last_7d', label: 'Last 7 Days' },
  { value: 'last_30d', label: 'Last 30 Days' },
  { value: 'last_90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

const METRIC_CATEGORIES = [
  { value: 'overview', label: 'Overview', metrics: ['users', 'sessions', 'pageviews', 'engagement'] },
  { value: 'acquisition', label: 'Acquisition', metrics: ['new_users', 'sources', 'campaigns', 'referrals'] },
  { value: 'behavior', label: 'Behavior', metrics: ['pages', 'events', 'goals', 'site_search'] },
  { value: 'conversion', label: 'Conversion', metrics: ['goals', 'ecommerce', 'attribution', 'funnels'] },
  { value: 'retention', label: 'Retention', metrics: ['cohorts', 'lifetime_value', 'churn', 'engagement'] }
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

export const UsageAnalytics: React.FC<UsageAnalyticsProps> = ({
  className,
  onUsageUpdate,
  onAnomalyDetected
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'features' | 'content' | 'performance' | 'realtime'>('overview');
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [anomalies, setAnomalies] = useState<UsageAnomaly[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('last_7d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['users', 'sessions', 'pageviews']);
  
  // UI states
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie'>('line');
  const [showFilters, setShowFilters] = useState(false);
  const [showRealtime, setShowRealtime] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  
  // Dialog states
  const [showAnomalyDetails, setShowAnomalyDetails] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  
  // Form states
  const [exportForm, setExportForm] = useState({
    format: 'csv' as 'csv' | 'excel' | 'pdf',
    metrics: [] as string[],
    dateRange: { start: '', end: '' },
    includeSegments: true,
    includeFilters: true
  });
  
  // Hooks
  const {
    getUsageAnalytics,
    getUsageAnomalies,
    exportUsageData,
    createUserSegment,
    getUserSegments,
    getRealtimeData,
    loading: reportingLoading,
    error: reportingError
  } = useReporting();

  // Initialize data
  useEffect(() => {
    loadAnalytics();
    loadAnomalies();
  }, [selectedTimeRange]);

  // Real-time data updates
  useEffect(() => {
    if (showRealtime) {
      const interval = setInterval(() => {
        loadRealtimeData();
      }, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [showRealtime]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalytics();
      loadAnomalies();
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Data loading functions
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const analyticsData = await getUsageAnalytics({
        timeRange: selectedTimeRange,
        metrics: selectedMetrics,
        segment: selectedSegment,
        device: selectedDevice,
        location: selectedLocation
      });
      
      setAnalytics(analyticsData);
      
      if (onUsageUpdate) {
        onUsageUpdate(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange, selectedMetrics, selectedSegment, selectedDevice, selectedLocation, getUsageAnalytics, onUsageUpdate]);

  const loadAnomalies = useCallback(async () => {
    try {
      const anomaliesData = await getUsageAnomalies();
      setAnomalies(anomaliesData);
      
      // Notify about new critical anomalies
      const criticalAnomalies = anomaliesData.filter(a => a.severity === 'critical' && a.status === 'new');
      criticalAnomalies.forEach(anomaly => {
        if (onAnomalyDetected) {
          onAnomalyDetected(anomaly);
        }
      });
    } catch (error) {
      console.error('Failed to load anomalies:', error);
    }
  }, [getUsageAnomalies, onAnomalyDetected]);

  const loadRealtimeData = useCallback(async () => {
    try {
      const realtimeData = await getRealtimeData();
      if (analytics) {
        setAnalytics(prev => prev ? { ...prev, realtimeData } : null);
      }
    } catch (error) {
      console.error('Failed to load realtime data:', error);
    }
  }, [analytics, getRealtimeData]);

  // Export functionality
  const handleExportData = useCallback(async () => {
    try {
      setLoading(true);
      await exportUsageData({
        format: exportForm.format,
        metrics: exportForm.metrics,
        dateRange: {
          start: new Date(exportForm.dateRange.start),
          end: new Date(exportForm.dateRange.end)
        },
        includeSegments: exportForm.includeSegments,
        includeFilters: exportForm.includeFilters
      });
      
      setShowExportDialog(false);
      setExportForm({
        format: 'csv',
        metrics: [],
        dateRange: { start: '', end: '' },
        includeSegments: true,
        includeFilters: true
      });
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setLoading(false);
    }
  }, [exportForm, exportUsageData]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!analytics) return [];
    
    const data = [];
    const now = new Date();
    const days = selectedTimeRange === 'last_7d' ? 7 : selectedTimeRange === 'last_30d' ? 30 : 24;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toLocaleDateString(),
        users: Math.floor(Math.random() * 1000) + 500,
        sessions: Math.floor(Math.random() * 1500) + 800,
        pageviews: Math.floor(Math.random() * 5000) + 2000,
        engagement: Math.random() * 100,
        conversion: Math.random() * 10
      });
    }
    return data;
  }, [analytics, selectedTimeRange]);

  const deviceData = useMemo(() => {
    if (!analytics?.deviceAnalytics) return [];
    return analytics.deviceAnalytics.deviceTypes.map((device, index) => ({
      name: device.type,
      value: device.count,
      percentage: device.percentage,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [analytics]);

  const geographicData = useMemo(() => {
    if (!analytics?.geographicData) return [];
    return analytics.geographicData.countries.slice(0, 10).map(country => ({
      name: country.country,
      users: country.userCount,
      sessions: country.sessions,
      conversion: country.conversionRate
    }));
  }, [analytics]);

  // Utility functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const getAnomalySeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-600' };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-600' };
    return { icon: Minus, color: 'text-gray-600' };
  };

  // Render functions
  const renderMetricCard = (title: string, value: number, previousValue: number, format: 'number' | 'percentage' | 'duration' = 'number', icon?: React.ElementType) => {
    const Icon = icon || Activity;
    const trend = getTrendIcon(value, previousValue);
    const TrendIcon = trend.icon;
    const change = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;
    
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">
                {format === 'number' && formatNumber(value)}
                {format === 'percentage' && formatPercentage(value)}
                {format === 'duration' && formatDuration(value)}
              </p>
              <div className={cn("flex items-center text-sm", trend.color)}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {Math.abs(change).toFixed(1)}%
              </div>
            </div>
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="sessions" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="users" fill="#3b82f6" />
              <Bar dataKey="sessions" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="pageviews" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usage Analytics</h2>
          <p className="text-muted-foreground">
            Track user behavior and platform usage patterns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowRealtime(!showRealtime)}
            className={showRealtime ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            {showRealtime ? 'Live' : 'Realtime'}
          </Button>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range and Filters */}
      <div className="flex items-center space-x-4">
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedSegment} onValueChange={setSelectedSegment}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="new">New Users</SelectItem>
            <SelectItem value="returning">Returning Users</SelectItem>
            <SelectItem value="power">Power Users</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="realtime">
            Realtime
            {showRealtime && (
              <div className="ml-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderMetricCard('Total Users', analytics.overview.totalUsers, analytics.overview.totalUsers * 0.9, 'number', Users)}
              {renderMetricCard('Active Users', analytics.overview.activeUsers, analytics.overview.activeUsers * 0.95, 'number', User)}
              {renderMetricCard('Sessions', analytics.overview.sessionCount, analytics.overview.sessionCount * 0.88, 'number', Clock)}
              {renderMetricCard('Avg Session Duration', analytics.overview.averageSessionDuration, analytics.overview.averageSessionDuration * 1.1, 'duration', Timer)}
            </div>
          )}

          {/* Usage Trends Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usage Trends</CardTitle>
                  <CardDescription>User activity and engagement over time</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>

          {/* Additional Metrics */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bounce Rate</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={analytics.overview.bounceRate} className="w-20" />
                        <span className="text-sm font-medium">{formatPercentage(analytics.overview.bounceRate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={analytics.overview.conversionRate} className="w-20" />
                        <span className="text-sm font-medium">{formatPercentage(analytics.overview.conversionRate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Retention Rate</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={analytics.overview.retentionRate} className="w-20" />
                        <span className="text-sm font-medium">{formatPercentage(analytics.overview.retentionRate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engagement Score</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={analytics.overview.engagementScore} className="w-20" />
                        <span className="text-sm font-medium">{analytics.overview.engagementScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {deviceData.map((device, index) => (
                      <div key={device.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: device.fill }} />
                          <span className="capitalize">{device.name}</span>
                        </div>
                        <span className="font-medium">{formatPercentage(device.percentage)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {geographicData.slice(0, 5).map((location, index) => (
                      <div key={location.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium">{location.name}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{formatNumber(location.users)} users</div>
                          <div className="text-muted-foreground">{formatNumber(location.sessions)} sessions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Anomalies */}
          {anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Usage Anomalies</CardTitle>
                <CardDescription>Unusual patterns detected in usage data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies.slice(0, 3).map(anomaly => (
                    <div key={anomaly.id} className={cn("p-3 rounded-lg border", getAnomalySeverityColor(anomaly.severity))}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{anomaly.description}</h4>
                          <p className="text-sm mt-1">
                            {anomaly.metric}: Expected {anomaly.expectedValue}, Got {anomaly.actualValue}
                          </p>
                        </div>
                        <Badge className={getAnomalySeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          {analytics && (
            <>
              {/* User Demographics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Demographics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Age Distribution</h4>
                        {analytics.userMetrics.demographics.ageDistribution.map(age => (
                          <div key={age.ageGroup} className="flex items-center justify-between mb-2">
                            <span className="text-sm">{age.ageGroup}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={age.percentage} className="w-20" />
                              <span className="text-sm font-medium">{formatPercentage(age.percentage)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.userMetrics.engagement.engagementLevels.map(level => (
                        <div key={level.level} className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium capitalize">{level.level.replace('_', ' ')}</span>
                            <p className="text-xs text-muted-foreground">{level.characteristics.join(', ')}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatNumber(level.count)}</div>
                            <div className="text-xs text-muted-foreground">{formatPercentage(level.percentage)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Behavior Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Patterns</CardTitle>
                  <CardDescription>User activity by hour and day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {/* Heatmap visualization would go here */}
                    <p>Activity heatmap visualization</p>
                  </div>
                </CardContent>
              </Card>

              {/* User Segmentation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>User Segments</CardTitle>
                    <Button onClick={() => setShowSegmentBuilder(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Segment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.userMetrics.segmentation.map(segment => (
                      <Card key={segment.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{segment.name}</CardTitle>
                          <CardDescription>{segment.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Users:</span>
                              <span className="font-medium">{formatNumber(segment.userCount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Growth:</span>
                              <span className={cn("font-medium", segment.growthRate > 0 ? 'text-green-600' : 'text-red-600')}>
                                {segment.growthRate > 0 ? '+' : ''}{formatPercentage(segment.growthRate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Engagement:</span>
                              <span className="font-medium">{segment.engagementScore.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Conversion:</span>
                              <span className="font-medium">{formatPercentage(segment.conversionRate)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="features" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {analytics.featureUsage.map(feature => (
                <Card key={feature.featureId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{feature.featureName}</CardTitle>
                        <CardDescription>{feature.category}</CardDescription>
                      </div>
                      <Badge variant={feature.usageStats.usageFrequency === 'daily' ? 'default' : 'outline'}>
                        {feature.usageStats.usageFrequency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Users:</span>
                          <span className="ml-2 font-medium">{formatNumber(feature.usageStats.totalUsers)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Active Users:</span>
                          <span className="ml-2 font-medium">{formatNumber(feature.usageStats.activeUsers)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Adoption Rate:</span>
                          <span className="ml-2 font-medium">{formatPercentage(feature.adoption.adoptionRate)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Satisfaction:</span>
                          <span className="ml-2 font-medium">{feature.performance.userSatisfaction.toFixed(1)}/5</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Adoption Progress</span>
                          <span>{formatPercentage(feature.adoption.adoptionRate)}</span>
                        </div>
                        <Progress value={feature.adoption.adoptionRate} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Error Rate: {formatPercentage(feature.performance.errorRate)}
                        </span>
                        <span className="text-muted-foreground">
                          Load Time: {feature.performance.loadTime}ms
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          {analytics && (
            <>
              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most viewed pages and their performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Unique Views</TableHead>
                        <TableHead>Avg Time</TableHead>
                        <TableHead>Bounce Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.contentAnalytics.pageViews.slice(0, 10).map((page, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{page.page}</TableCell>
                          <TableCell>{formatNumber(page.views)}</TableCell>
                          <TableCell>{formatNumber(page.uniqueViews)}</TableCell>
                          <TableCell>{formatDuration(page.averageTimeOnPage)}</TableCell>
                          <TableCell>{formatPercentage(page.bounceRate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Search Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Search Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Searches:</span>
                          <span className="ml-2 font-medium">{formatNumber(analytics.contentAnalytics.searchAnalytics.totalSearches)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Unique Queries:</span>
                          <span className="ml-2 font-medium">{formatNumber(analytics.contentAnalytics.searchAnalytics.uniqueQueries)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Search Queries</h4>
                        {analytics.contentAnalytics.searchAnalytics.topQueries.slice(0, 5).map((query, index) => (
                          <div key={index} className="flex items-center justify-between mb-2">
                            <span className="text-sm">{query.query}</span>
                            <div className="text-sm text-muted-foreground">
                              {query.count} searches
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Download Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.contentAnalytics.downloadAnalytics.slice(0, 5).map((download, index) => (
                        <div key={download.resourceId} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{download.name}</div>
                            <div className="text-xs text-muted-foreground">{download.type}</div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">{formatNumber(download.downloads)}</div>
                            <div className="text-muted-foreground">{formatPercentage(download.completionRate)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          {analytics && (
            <>
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderMetricCard('Avg Load Time', analytics.performanceMetrics.pageLoad.averageLoadTime, analytics.performanceMetrics.pageLoad.averageLoadTime * 1.1, 'duration', Clock)}
                {renderMetricCard('Error Rate', analytics.performanceMetrics.errorAnalytics.errorRate, analytics.performanceMetrics.errorAnalytics.errorRate * 0.9, 'percentage', AlertTriangle)}
                {renderMetricCard('CPU Usage', analytics.performanceMetrics.resourceUsage.cpuUsage, analytics.performanceMetrics.resourceUsage.cpuUsage * 0.95, 'percentage', Cpu)}
                {renderMetricCard('Memory Usage', analytics.performanceMetrics.resourceUsage.memoryUsage, analytics.performanceMetrics.resourceUsage.memoryUsage * 1.05, 'percentage', MemoryStick)}
              </div>

              {/* Error Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Error Analysis</CardTitle>
                  <CardDescription>Most common errors and their impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Error Type</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Affected Users</TableHead>
                        <TableHead>First Seen</TableHead>
                        <TableHead>Last Seen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.performanceMetrics.errorAnalytics.topErrors.slice(0, 10).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{error.error}</TableCell>
                          <TableCell>{formatNumber(error.count)}</TableCell>
                          <TableCell>{formatNumber(error.count * 0.7)}</TableCell>
                          <TableCell>{error.firstSeen.toLocaleDateString()}</TableCell>
                          <TableCell>{error.lastSeen.toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="realtime" className="space-y-6">
          {analytics?.realtimeData && (
            <>
              {/* Realtime Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Users</p>
                        <p className="text-3xl font-bold text-green-600">{analytics.realtimeData.currentUsers}</p>
                        <div className="flex items-center text-sm text-green-600">
                          <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                          Live
                        </div>
                      </div>
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                        <p className="text-3xl font-bold">{analytics.realtimeData.currentSessions}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(analytics.realtimeData.newSessionsRate)} new
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversion Events</p>
                        <p className="text-3xl font-bold">{analytics.realtimeData.conversionEvents}</p>
                        <p className="text-sm text-muted-foreground">
                          Last 5 minutes
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Page Views/min</p>
                        <p className="text-3xl font-bold">{Math.floor(Math.random() * 100) + 50}</p>
                        <p className="text-sm text-muted-foreground">
                          Current rate
                        </p>
                      </div>
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Pages</CardTitle>
                  <CardDescription>Pages with current user activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Active Users</TableHead>
                        <TableHead>Avg Time on Page</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.realtimeData.activePages.map((page, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{page.page}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                              <span>{page.activeUsers}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDuration(page.avgTimeOnPage)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Live Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Events</CardTitle>
                  <CardDescription>Real-time user actions and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {analytics.realtimeData.liveEvents.slice(0, 20).map((event, index) => (
                        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div>
                            <span className="text-sm font-medium">{event.event}</span>
                            <span className="text-xs text-muted-foreground ml-2">on {event.page}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Usage Data</DialogTitle>
            <DialogDescription>
              Export analytics data in your preferred format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-format">Format</Label>
              <Select value={exportForm.format} onValueChange={(value) => setExportForm(prev => ({ ...prev, format: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Metrics to Include</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {METRIC_CATEGORIES.map(category => (
                  <div key={category.value}>
                    <h4 className="font-medium text-sm mb-1">{category.label}</h4>
                    {category.metrics.map(metric => (
                      <div key={metric} className="flex items-center space-x-2 mb-1">
                        <Checkbox
                          checked={exportForm.metrics.includes(metric)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setExportForm(prev => ({ ...prev, metrics: [...prev.metrics, metric] }));
                            } else {
                              setExportForm(prev => ({ ...prev, metrics: prev.metrics.filter(m => m !== metric) }));
                            }
                          }}
                        />
                        <Label className="text-xs">{metric.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="export-start">Start Date</Label>
                <Input
                  id="export-start"
                  type="date"
                  value={exportForm.dateRange.start}
                  onChange={(e) => setExportForm(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                />
              </div>
              <div>
                <Label htmlFor="export-end">End Date</Label>
                <Input
                  id="export-end"
                  type="date"
                  value={exportForm.dateRange.end}
                  onChange={(e) => setExportForm(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={exportForm.includeSegments}
                  onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeSegments: !!checked }))}
                />
                <Label className="text-sm">Include user segments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={exportForm.includeFilters}
                  onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeFilters: !!checked }))}
                />
                <Label className="text-sm">Include applied filters</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData} disabled={loading || exportForm.metrics.length === 0}>
              Export Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsageAnalytics;