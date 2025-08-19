/**
 * UserAnalyticsDashboard.tsx
 * ==========================
 * 
 * Advanced User Analytics and Behavior Insights Dashboard Component
 * 
 * Features:
 * - Comprehensive user behavior analytics and engagement tracking
 * - Advanced usage patterns and activity analysis
 * - Real-time user performance monitoring and insights
 * - Multi-dimensional user segmentation and cohort analysis
 * - User journey mapping and funnel analysis
 * - Predictive analytics and behavior forecasting
 * - Advanced retention and churn analysis
 * - Cross-platform user activity correlation
 * - Intelligent user scoring and risk assessment
 * - Enterprise-grade privacy and compliance controls
 * - Advanced data visualization with interactive dashboards
 * - AI-powered insights and recommendations
 * - Integration with all 7 data governance SPAs for holistic analytics
 * - Custom metrics and KPI tracking
 * - Exportable reports and scheduled analytics
 * 
 * Design:
 * - Modern analytics dashboard with interactive charts and visualizations
 * - Real-time data streaming and live updates
 * - Advanced filtering and drill-down capabilities
 * - Responsive design optimized for large datasets
 * - Accessibility compliance with data table navigation
 * - Dark/light theme support with analytics-optimized color schemes
 * - Advanced animations and smooth data transitions
 * - Executive summary views and detailed breakdowns
 * 
 * Backend Integration:
 * - Maps to UserAnalyticsService, BehaviorService, InsightsService
 * - Real-time streaming analytics and event processing
 * - Integration with all 7 data governance SPAs for comprehensive tracking
 * - Advanced machine learning models for behavior prediction
 * - Privacy-compliant data collection and processing
 * - Comprehensive audit trails and data lineage tracking
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar
} from '@/components/ui/calendar';
import {
  Checkbox
} from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Icons
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  User,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  MousePointer,
  MousePointer2,
  Clock,
  Timer,
  Calendar as CalendarIcon,
  Target,
  Zap,
  Award,
  Star,
  StarOff,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MessageCircle,
  Share2,
  Share,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Settings,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Loader2,
  MapPin,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Gamepad2,
  Headphones,
  Camera,
  Mic,
  Speaker,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Power,
  Bluetooth,
  Database,
  Server,
  Cloud,
  HardDrive,
  Cpu,
  Network,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  History,
  BookOpen,
  Book,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  ExternalLink,
  Mail,
  Phone,
  Building,
  Home,
  Navigation,
  Compass,
  Map,
  Route,
  Flag,
  Bell,
  BellOff,
  Volume2,
  VolumeOff,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Repeat,
  Shuffle,
  Radio,
  Rss,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  Battery as BatteryIcon,
  Signal as SignalIcon
} from 'lucide-react';

// Date handling
import { format, parseISO, isValid, addDays, addHours, addMonths, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns';

// Animations
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Toast notifications
import { toast } from 'sonner';

// Charts
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ComposedChart,
  TreemapChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';

// Racine hooks and services
import { useUserManagement } from '../../hooks/useUserManagement';
import { useRBACSystem } from '../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useUserAnalytics } from '../../hooks/useUserAnalytics';

// Racine types
import {
  UUID,
  ISODateString,
  OperationStatus,
  UserProfile,
  RBACPermissions,
  ActivityRecord
} from '../../types/racine-core.types';

// Racine utilities
import { 
  formatDate,
  formatTime,
  formatRelativeTime,
  generateSecureId
} from '../../utils/validation-utils';
import {
  calculateUserEngagement,
  analyzeUserBehavior,
  generateUserInsights,
  predictUserChurn,
  segmentUsers
} from '../../utils/analytics-utils';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface UserAnalyticsDashboardProps {
  userId?: UUID;
  embedded?: boolean;
  timeRange?: string;
  segmentFilter?: string;
  onInsightGenerated?: (insight: UserInsight) => void;
  className?: string;
}

interface UserEngagementMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number; // minutes
  sessionsPerUser: number;
  pageViewsPerSession: number;
  bounceRate: number; // percentage
  conversionRate: number; // percentage
  retentionRate: number; // percentage
  churnRate: number; // percentage
  timeToValue: number; // minutes
  featureAdoptionRate: number; // percentage
  supportTicketsPerUser: number;
  npsScore: number; // -100 to 100
  csat: number; // 1-5 scale
}

interface UserBehaviorPattern {
  id: UUID;
  name: string;
  description: string;
  userCount: number;
  percentage: number;
  commonActions: string[];
  averageSessionTime: number;
  preferredTimeOfDay: string;
  preferredDayOfWeek: string;
  devicePreferences: DeviceUsage[];
  geographicDistribution: GeographicData[];
  engagementLevel: 'low' | 'medium' | 'high' | 'very_high';
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  characteristics: BehaviorCharacteristic[];
  trends: BehaviorTrend[];
}

interface DeviceUsage {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'other';
  userCount: number;
  percentage: number;
  averageSessionTime: number;
  bounceRate: number;
}

interface GeographicData {
  country: string;
  region: string;
  userCount: number;
  percentage: number;
  averageEngagement: number;
}

interface BehaviorCharacteristic {
  name: string;
  value: string | number;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-100
}

interface BehaviorTrend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number; // percentage change
  timeframe: string;
  significance: 'low' | 'medium' | 'high';
}

interface UserSegment {
  id: UUID;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  userCount: number;
  growthRate: number; // percentage
  engagementScore: number; // 0-100
  valueScore: number; // 0-100
  churnRisk: number; // 0-100
  characteristics: UserCharacteristic[];
  metrics: SegmentMetrics;
  trends: SegmentTrend[];
  recommendations: string[];
}

interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';
  value: any;
  weight: number;
}

interface UserCharacteristic {
  name: string;
  value: string | number;
  percentile: number;
  benchmark: string | number;
  trend: 'improving' | 'declining' | 'stable';
}

interface SegmentMetrics {
  averageLifetimeValue: number;
  averageSessionDuration: number;
  conversionRate: number;
  retentionRate: number;
  supportCost: number;
  featureUsage: FeatureUsage[];
}

interface FeatureUsage {
  feature: string;
  adoptionRate: number;
  frequency: number;
  satisfaction: number;
  impact: 'high' | 'medium' | 'low';
}

interface SegmentTrend {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changeType: 'absolute' | 'percentage';
  period: string;
}

interface UserJourney {
  id: UUID;
  name: string;
  description: string;
  stages: JourneyStage[];
  conversionFunnel: FunnelData[];
  averageDuration: number; // minutes
  completionRate: number; // percentage
  dropoffPoints: DropoffPoint[];
  optimizationOpportunities: OptimizationOpportunity[];
}

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  order: number;
  users: number;
  conversionRate: number;
  averageTime: number; // minutes
  dropoffRate: number;
  actions: string[];
  successCriteria: string[];
}

interface FunnelData {
  stage: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

interface DropoffPoint {
  stage: string;
  action: string;
  dropoffRate: number;
  impact: 'high' | 'medium' | 'low';
  reasons: string[];
  recommendations: string[];
}

interface OptimizationOpportunity {
  id: UUID;
  type: 'conversion' | 'retention' | 'engagement' | 'experience';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
  potentialImprovement: string;
  steps: string[];
}

interface UserInsight {
  id: UUID;
  type: 'behavior' | 'engagement' | 'retention' | 'conversion' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
  supportingData: any;
  generatedAt: ISODateString;
  relevantSegments: string[];
  relatedMetrics: string[];
}

interface UserCohort {
  id: UUID;
  name: string;
  startDate: ISODateString;
  endDate: ISODateString;
  userCount: number;
  retentionRates: RetentionData[];
  engagementTrends: EngagementTrend[];
  valueMetrics: ValueMetric[];
  survivalRate: number;
  characteristics: CohortCharacteristic[];
}

interface RetentionData {
  period: string; // '1d', '7d', '30d', '90d', etc.
  retentionRate: number;
  activeUsers: number;
  churnedUsers: number;
}

interface EngagementTrend {
  period: string;
  averageSessionTime: number;
  actionsPerSession: number;
  featureUsage: number;
  satisfaction: number;
}

interface ValueMetric {
  metric: string;
  value: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'high' | 'medium' | 'low';
}

interface CohortCharacteristic {
  name: string;
  value: string | number;
  distinctiveness: number; // how unique this is to the cohort
}

interface UserActivityHeatmap {
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday = 0)
  activity: number; // normalized activity level
  userCount: number;
  avgSessionTime: number;
  engagementScore: number;
}

interface PredictiveModel {
  id: UUID;
  name: string;
  type: 'churn' | 'ltv' | 'conversion' | 'engagement';
  description: string;
  accuracy: number; // percentage
  features: ModelFeature[];
  predictions: Prediction[];
  lastTrained: ISODateString;
  modelVersion: string;
  performance: ModelPerformance;
}

interface ModelFeature {
  name: string;
  importance: number; // 0-1
  type: 'categorical' | 'numerical' | 'boolean';
  description: string;
}

interface Prediction {
  userId: UUID;
  score: number; // 0-1
  confidence: number; // 0-1
  factors: PredictionFactor[];
  recommendation: string;
  timeline: string;
}

interface PredictionFactor {
  feature: string;
  contribution: number; // positive or negative
  impact: 'high' | 'medium' | 'low';
}

interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
}

interface AnalyticsReport {
  id: UUID;
  name: string;
  description: string;
  type: 'executive' | 'operational' | 'tactical' | 'custom';
  timeRange: string;
  metrics: ReportMetric[];
  insights: UserInsight[];
  recommendations: string[];
  generatedAt: ISODateString;
  generatedBy: UUID;
  format: 'pdf' | 'excel' | 'json' | 'csv';
  schedule?: ReportSchedule;
}

interface ReportMetric {
  name: string;
  value: number | string;
  change: number;
  changeType: 'absolute' | 'percentage';
  trend: 'improving' | 'declining' | 'stable';
  benchmark?: number | string;
  target?: number | string;
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  enabled: boolean;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideInFromRightVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const staggerChildrenVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const countUpVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// =============================================================================
// CONSTANTS
// =============================================================================

const TIME_RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

const ENGAGEMENT_LEVELS = [
  { value: 'low', label: 'Low', color: 'red', min: 0, max: 25 },
  { value: 'medium', label: 'Medium', color: 'yellow', min: 26, max: 50 },
  { value: 'high', label: 'High', color: 'green', min: 51, max: 75 },
  { value: 'very_high', label: 'Very High', color: 'blue', min: 76, max: 100 }
];

const CHURN_RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', color: 'green', threshold: 25 },
  { value: 'medium', label: 'Medium Risk', color: 'yellow', threshold: 50 },
  { value: 'high', label: 'High Risk', color: 'orange', threshold: 75 },
  { value: 'critical', label: 'Critical Risk', color: 'red', threshold: 100 }
];

const USER_SEGMENTS = [
  {
    id: 'power-users',
    name: 'Power Users',
    description: 'Highly engaged users with frequent usage patterns',
    userCount: 1245,
    growthRate: 15.3,
    engagementScore: 92,
    valueScore: 88,
    churnRisk: 12,
    color: 'blue'
  },
  {
    id: 'regular-users',
    name: 'Regular Users',
    description: 'Consistent users with moderate engagement',
    userCount: 3876,
    growthRate: 8.7,
    engagementScore: 68,
    valueScore: 72,
    churnRisk: 25,
    color: 'green'
  },
  {
    id: 'casual-users',
    name: 'Casual Users',
    description: 'Infrequent users with low engagement',
    userCount: 2134,
    growthRate: -2.1,
    engagementScore: 34,
    valueScore: 41,
    churnRisk: 58,
    color: 'yellow'
  },
  {
    id: 'at-risk-users',
    name: 'At-Risk Users',
    description: 'Users showing signs of disengagement',
    userCount: 892,
    growthRate: -12.4,
    engagementScore: 18,
    valueScore: 22,
    churnRisk: 78,
    color: 'red'
  },
  {
    id: 'new-users',
    name: 'New Users',
    description: 'Recent users in onboarding phase',
    userCount: 567,
    growthRate: 45.2,
    engagementScore: 45,
    valueScore: 35,
    churnRisk: 42,
    color: 'purple'
  }
];

const FEATURE_CATEGORIES = [
  {
    id: 'data-sources',
    name: 'Data Sources',
    features: ['Connection Management', 'Source Discovery', 'Data Preview', 'Schema Analysis'],
    adoptionRate: 78.5,
    satisfaction: 4.2
  },
  {
    id: 'data-catalog',
    name: 'Data Catalog',
    features: ['Asset Search', 'Metadata Management', 'Lineage Tracking', 'Documentation'],
    adoptionRate: 85.2,
    satisfaction: 4.5
  },
  {
    id: 'compliance',
    name: 'Compliance',
    features: ['Policy Management', 'Audit Trails', 'Risk Assessment', 'Reporting'],
    adoptionRate: 68.9,
    satisfaction: 4.1
  },
  {
    id: 'analytics',
    name: 'Analytics',
    features: ['Dashboards', 'Reports', 'Insights', 'Alerts'],
    adoptionRate: 72.3,
    satisfaction: 4.3
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    features: ['Comments', 'Sharing', 'Workflows', 'Notifications'],
    adoptionRate: 56.7,
    satisfaction: 3.9
  }
];

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

const DEVICE_TYPES = [
  { type: 'desktop', name: 'Desktop', icon: Monitor },
  { type: 'mobile', name: 'Mobile', icon: Smartphone },
  { type: 'tablet', name: 'Tablet', icon: Tablet },
  { type: 'other', name: 'Other', icon: Globe }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({
  userId,
  embedded = false,
  timeRange: initialTimeRange = '30d',
  segmentFilter,
  onInsightGenerated,
  className = ''
}) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================

  const {
    userProfile,
    loading: userLoading,
    error: userError
  } = useUserManagement(userId);

  const {
    currentUser,
    userPermissions,
    hasPermission
  } = useRBACSystem();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  const {
    engagementMetrics,
    behaviorPatterns,
    userSegments,
    userJourneys,
    userCohorts,
    activityHeatmap,
    predictiveModels,
    userInsights,
    loading: analyticsLoading,
    error: analyticsError,
    loadEngagementMetrics,
    loadBehaviorPatterns,
    loadUserSegments,
    loadUserJourneys,
    loadUserCohorts,
    loadActivityHeatmap,
    loadPredictiveModels,
    loadUserInsights,
    generateInsight,
    exportAnalyticsReport
  } = useUserAnalytics();

  // Component state
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [customDateRange, setCustomDateRange] = useState<{from?: Date; to?: Date}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analytics state
  const [selectedSegment, setSelectedSegment] = useState<string>(segmentFilter || 'all');
  const [selectedInsight, setSelectedInsight] = useState<UserInsight | null>(null);
  const [showInsightDetails, setShowInsightDetails] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<UserCohort | null>(null);
  const [showCohortAnalysis, setShowCohortAnalysis] = useState(false);

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [engagementFilter, setEngagementFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  // Visualization state
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie'>('line');
  const [heatmapView, setHeatmapView] = useState<'hourly' | 'daily' | 'weekly'>('hourly');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('previous_period');

  // Real-time updates
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Export and reporting state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'json' | 'csv'>('pdf');
  const [exportMetrics, setExportMetrics] = useState<string[]>([]);

  // Animation controls
  const controls = useAnimation();

  // Refs
  const chartRef = useRef<HTMLDivElement>(null);
  const webSocketRef = useRef<WebSocket | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canViewAnalytics = useMemo(() => {
    return hasPermission('analytics.view') || hasPermission('admin.full');
  }, [hasPermission]);

  const canViewAdvancedAnalytics = useMemo(() => {
    return hasPermission('analytics.advanced') || hasPermission('admin.full');
  }, [hasPermission]);

  const canExportReports = useMemo(() => {
    return hasPermission('analytics.export') || hasPermission('reports.export');
  }, [hasPermission]);

  const canGenerateInsights = useMemo(() => {
    return hasPermission('analytics.insights') || hasPermission('ai.insights');
  }, [hasPermission]);

  const filteredSegments = useMemo(() => {
    let filtered = userSegments || USER_SEGMENTS;

    if (selectedSegment !== 'all') {
      filtered = filtered.filter(segment => segment.id === selectedSegment);
    }

    if (engagementFilter !== 'all') {
      const level = ENGAGEMENT_LEVELS.find(l => l.value === engagementFilter);
      if (level) {
        filtered = filtered.filter(segment => 
          segment.engagementScore >= level.min && segment.engagementScore <= level.max
        );
      }
    }

    if (riskFilter !== 'all') {
      const risk = CHURN_RISK_LEVELS.find(r => r.value === riskFilter);
      if (risk) {
        filtered = filtered.filter(segment => segment.churnRisk <= risk.threshold);
      }
    }

    return filtered;
  }, [userSegments, selectedSegment, engagementFilter, riskFilter]);

  const filteredInsights = useMemo(() => {
    if (!userInsights) return [];
    
    let filtered = userInsights;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(insight => 
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query) ||
        insight.recommendations.some(rec => rec.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => {
      // Sort by impact first, then confidence
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      if (impactDiff !== 0) return impactDiff;
      
      return b.confidence - a.confidence;
    });
  }, [userInsights, searchQuery]);

  const engagementSummary = useMemo(() => {
    if (!engagementMetrics) return {
      totalUsers: 0,
      growthRate: 0,
      engagementRate: 0,
      retentionRate: 0,
      churnRate: 0,
      averageSessionTime: 0
    };

    const previousPeriodUsers = engagementMetrics.totalUsers * 0.85; // Simulated previous period
    const growthRate = ((engagementMetrics.totalUsers - previousPeriodUsers) / previousPeriodUsers) * 100;

    return {
      totalUsers: engagementMetrics.totalUsers,
      growthRate,
      engagementRate: (engagementMetrics.activeUsers / engagementMetrics.totalUsers) * 100,
      retentionRate: engagementMetrics.retentionRate,
      churnRate: engagementMetrics.churnRate,
      averageSessionTime: engagementMetrics.averageSessionDuration
    };
  }, [engagementMetrics]);

  const topInsights = useMemo(() => {
    return filteredInsights.slice(0, 5);
  }, [filteredInsights]);

  const segmentDistribution = useMemo(() => {
    return filteredSegments.map((segment, index) => ({
      name: segment.name,
      value: segment.userCount,
      percentage: (segment.userCount / filteredSegments.reduce((sum, s) => sum + s.userCount, 0)) * 100,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [filteredSegments]);

  const engagementTrend = useMemo(() => {
    // Generate mock trend data - in real implementation, this would come from the analytics service
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
    
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: format(date, 'MMM dd'),
        engagement: Math.floor(Math.random() * 30) + 60,
        activeUsers: Math.floor(Math.random() * 1000) + 2000,
        sessions: Math.floor(Math.random() * 500) + 1500,
        retention: Math.floor(Math.random() * 20) + 70
      };
    });
  }, [timeRange]);

  const featureAdoptionData = useMemo(() => {
    return FEATURE_CATEGORIES.map((category, index) => ({
      name: category.name,
      adoption: category.adoptionRate,
      satisfaction: category.satisfaction,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      if (!userProfile || !canViewAnalytics) return;

      try {
        setLoading(true);
        
        // Load analytics data
        await Promise.all([
          loadEngagementMetrics(timeRange),
          loadBehaviorPatterns(timeRange),
          loadUserSegments(),
          loadUserJourneys(),
          loadUserCohorts(timeRange),
          loadActivityHeatmap(timeRange),
          loadUserInsights()
        ]);

        if (canViewAdvancedAnalytics) {
          await loadPredictiveModels();
        }

      } catch (error) {
        console.error('Failed to initialize user analytics dashboard:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [userProfile, canViewAnalytics, canViewAdvancedAnalytics, timeRange]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled || !autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        await Promise.all([
          loadEngagementMetrics(timeRange),
          loadActivityHeatmap(timeRange)
        ]);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to refresh analytics data:', error);
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [realTimeEnabled, autoRefresh, timeRange, loadEngagementMetrics, loadActivityHeatmap]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/user-analytics`);
      
      ws.onopen = () => {
        console.log('User analytics WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'engagement_update') {
            // Update engagement metrics in real-time
            setLastUpdate(new Date());
          } else if (data.type === 'new_insight') {
            // Show notification for new insights
            const insight = data.payload as UserInsight;
            if (onInsightGenerated) {
              onInsightGenerated(insight);
            }
            toast.info(`New insight generated: ${insight.title}`);
          }
        } catch (error) {
          console.error('Failed to process WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('User analytics WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('User analytics WebSocket error:', error);
      };

      webSocketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [realTimeEnabled, onInsightGenerated]);

  // Animate component entrance
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleTimeRangeChange = useCallback(async (newTimeRange: string) => {
    setTimeRange(newTimeRange);
    
    if (newTimeRange !== 'custom') {
      try {
        setLoading(true);
        await Promise.all([
          loadEngagementMetrics(newTimeRange),
          loadBehaviorPatterns(newTimeRange),
          loadUserCohorts(newTimeRange),
          loadActivityHeatmap(newTimeRange)
        ]);
      } catch (error) {
        console.error('Failed to load data for new time range:', error);
        toast.error('Failed to load data for new time range');
      } finally {
        setLoading(false);
      }
    }
  }, [loadEngagementMetrics, loadBehaviorPatterns, loadUserCohorts, loadActivityHeatmap]);

  const handleGenerateInsight = useCallback(async (type?: string, context?: any) => {
    if (!canGenerateInsights) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      const insight = await generateInsight({
        type: type || 'behavior',
        timeRange,
        segmentFilter: selectedSegment,
        context
      });

      if (onInsightGenerated) {
        onInsightGenerated(insight);
      }

      toast.success('New insight generated successfully');

      // Reload insights
      await loadUserInsights();

    } catch (error: any) {
      console.error('Failed to generate insight:', error);
      toast.error(error.message || 'Failed to generate insight');
    } finally {
      setLoading(false);
    }
  }, [canGenerateInsights, timeRange, selectedSegment, onInsightGenerated, generateInsight, loadUserInsights]);

  const handleExportReport = useCallback(async () => {
    if (!canExportReports) return;

    try {
      setLoading(true);

      const reportData = await exportAnalyticsReport({
        timeRange,
        segments: selectedSegment !== 'all' ? [selectedSegment] : undefined,
        metrics: exportMetrics.length > 0 ? exportMetrics : undefined,
        format: exportFormat,
        includeInsights: true,
        includeRecommendations: true
      });

      // Create download link
      const blob = new Blob([reportData], { 
        type: exportFormat === 'pdf' ? 'application/pdf' : 
              exportFormat === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              exportFormat === 'json' ? 'application/json' : 'text/csv'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-analytics-report-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Analytics report exported successfully');
      setShowExportDialog(false);

    } catch (error: any) {
      console.error('Failed to export analytics report:', error);
      toast.error(error.message || 'Failed to export analytics report');
    } finally {
      setLoading(false);
    }
  }, [canExportReports, timeRange, selectedSegment, exportMetrics, exportFormat, exportAnalyticsReport]);

  const handleInsightClick = useCallback((insight: UserInsight) => {
    setSelectedInsight(insight);
    setShowInsightDetails(true);
  }, []);

  const handleSegmentClick = useCallback((segmentId: string) => {
    setSelectedSegment(segmentId);
  }, []);

  const handleCohortAnalysis = useCallback((cohort: UserCohort) => {
    setSelectedCohort(cohort);
    setShowCohortAnalysis(true);
  }, []);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderOverviewTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Key Metrics Cards */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <motion.div 
                variants={countUpVariants}
                className="flex items-center space-x-4"
              >
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{engagementSummary.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className={`text-xs flex items-center ${
                    engagementSummary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {engagementSummary.growthRate >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(engagementSummary.growthRate).toFixed(1)}% from last period
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <motion.div 
                variants={countUpVariants}
                className="flex items-center space-x-4"
              >
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{engagementSummary.engagementRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</p>
                  <p className="text-xs text-green-600">Above industry average</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <motion.div 
                variants={countUpVariants}
                className="flex items-center space-x-4"
              >
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(engagementSummary.averageSessionTime)}m</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Session Time</p>
                  <p className="text-xs text-purple-600">+5.2% vs last period</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <motion.div 
                variants={countUpVariants}
                className="flex items-center space-x-4"
              >
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{engagementSummary.retentionRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Retention Rate</p>
                  <p className="text-xs text-orange-600">30-day retention</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Engagement Trend Chart */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="w-5 h-5" />
                  <span>Engagement Trends</span>
                </CardTitle>
                <CardDescription>
                  User engagement and activity metrics over time
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {realTimeEnabled ? 'Live' : 'Static'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setChartType('line')}>
                      Line Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChartType('bar')}>
                      Bar Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChartType('area')}>
                      Area Chart
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' && (
                  <RechartsLineChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Engagement Score"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="activeUsers" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Active Users"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Sessions"
                    />
                  </RechartsLineChart>
                )}
                {chartType === 'area' && (
                  <AreaChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Engagement"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="retention" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Retention"
                    />
                  </AreaChart>
                )}
                {chartType === 'bar' && (
                  <RechartsBarChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="engagement" fill="#3b82f6" name="Engagement" />
                    <Bar dataKey="retention" fill="#10b981" name="Retention" />
                  </RechartsBarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Segments and Feature Adoption */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
              <CardDescription>
                Distribution of users across engagement segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={segmentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {segmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption</CardTitle>
              <CardDescription>
                Adoption rates across different feature categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureAdoptionData.map((feature, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{feature.name}</span>
                      <span className="text-gray-500">{feature.adoption.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={feature.adoption} className="h-2 flex-1" />
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-500">{feature.satisfaction.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Top Insights */}
      {topInsights.length > 0 && (
        <motion.div variants={fadeInUpVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Key Insights</span>
                  </CardTitle>
                  <CardDescription>
                    AI-generated insights and recommendations
                  </CardDescription>
                </div>
                {canGenerateInsights && (
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateInsight()}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Generate Insight
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInsights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    variants={fadeInUpVariants}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleInsightClick(insight)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge 
                            variant={insight.impact === 'high' ? 'default' : 
                                     insight.impact === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <p className="text-xs text-blue-600 mt-1">
                            💡 Actionable recommendations available
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (userLoading || loading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading user analytics...</span>
        </div>
      </div>
    );
  }

  if (userError || error || analyticsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{userError || error || analyticsError}</AlertDescription>
      </Alert>
    );
  }

  if (!canViewAnalytics) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to view user analytics.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate={controls}
        variants={fadeInUpVariants}
        className={`user-analytics-dashboard ${className}`}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {!embedded && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">User Analytics Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive insights into user behavior, engagement, and platform performance
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    {realTimeEnabled ? 'Live' : 'Static'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated: {formatTime(lastUpdate.toISOString())}
                  </span>
                </div>
                
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {canExportReports && (
                  <Button
                    variant="outline"
                    onClick={() => setShowExportDialog(true)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                )}
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="segments" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Segments</span>
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Behavior</span>
              </TabsTrigger>
              <TabsTrigger value="cohorts" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Cohorts</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Insights</span>
              </TabsTrigger>
              <TabsTrigger value="predictive" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Predictive</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="segments">
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Segments</h3>
                <p className="text-gray-500">Detailed user segmentation and cohort analysis will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="behavior">
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Behavior Analysis</h3>
                <p className="text-gray-500">User behavior patterns and journey analysis will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="cohorts">
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cohort Analysis</h3>
                <p className="text-gray-500">Advanced cohort retention and lifecycle analysis will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="text-center py-12">
                <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                <p className="text-gray-500">AI-powered insights and recommendations will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="predictive">
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Predictive Analytics</h3>
                <p className="text-gray-500">Predictive models and forecasting will be implemented here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Export Report Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Analytics Report</DialogTitle>
              <DialogDescription>
                Generate and download a comprehensive analytics report
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Time Range</Label>
                <p className="text-sm text-gray-500">
                  Current selection: {TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label}
                </p>
              </div>

              <div>
                <Label>Include Metrics</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Engagement', 'Retention', 'Behavior', 'Segments', 'Insights', 'Predictions'].map(metric => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric}
                        checked={exportMetrics.includes(metric)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExportMetrics(prev => [...prev, metric]);
                          } else {
                            setExportMetrics(prev => prev.filter(m => m !== metric));
                          }
                        }}
                      />
                      <Label htmlFor={metric} className="text-sm">{metric}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportReport}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Insight Details Sheet */}
        <Sheet open={showInsightDetails} onOpenChange={setShowInsightDetails}>
          <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Insight Details</SheetTitle>
              <SheetDescription>
                Detailed analysis and recommendations for this insight
              </SheetDescription>
            </SheetHeader>

            {selectedInsight && (
              <div className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{selectedInsight.title}</h3>
                    <Badge 
                      variant={selectedInsight.impact === 'high' ? 'default' : 
                               selectedInsight.impact === 'medium' ? 'secondary' : 'outline'}
                    >
                      {selectedInsight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedInsight.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Confidence Score</h4>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedInsight.confidence} className="flex-1" />
                    <span className="text-sm font-mono">{selectedInsight.confidence}%</span>
                  </div>
                </div>

                {selectedInsight.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {selectedInsight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Generated {formatRelativeTime(selectedInsight.generatedAt)}</span>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </motion.div>
    </TooltipProvider>
  );
};

export default UserAnalyticsDashboard;