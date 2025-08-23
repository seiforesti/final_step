'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Card,
  CardContent,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';

// Icons
import {
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Gauge,
  Target,
  Zap,
  Database,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Minus,
  X,
  Copy,
  Share,
  Download,
  Upload,
  Save,
  Edit,
  Eye,
  EyeOff,
  Settings,
  MoreHorizontal,
  Grid,
  Layout,
  Maximize,
  Minimize,
  RotateCcw,
  RefreshCw,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  Resize,
  Square,
  Circle,
  Triangle,
  Diamond,
  Heart,
  Star,
  Hexagon,
  Octagon,
  Pentagon,
  Sparkles,
  Wand2,
  Brain,
  Cpu,
  HardDrive,
  Network,
  Shield,
  Lock,
  Unlock,
  Key,
  Globe,
  Map,
  MapPin,
  Navigation,
  Radar,
  Scan,
  Monitor,
  Tablet,
  Smartphone,
  Laptop,
  Server,
  Cloud,
  CloudRain,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Wind,
  Snowflake,
  Droplets,
  Thermometer,
  Battery,
  Wifi,
  Bluetooth,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Video,
  FileText as FileTextIcon,
  File as FileIcon,
  Image as ImageIcon,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Layers,
  Component,
  Boxes,
  Building,
  Home,
  Factory,
  Store,
  Briefcase,
  Wallet,
  CreditCard,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  TrendingUpDown,
  BarChart,
  BarChart2,
  BarChart4,
  ScatterChart,
  Table,
  Table2,
  Columns,
  Rows,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  LayoutList,
  LayoutDashboard,
  PanelLeftOpen,
  PanelRightOpen,
  PanelTopOpen,
  PanelBottomOpen,
  SplitSquareHorizontal,
  SplitSquareVertical,
  MousePointer,
  MousePointer2,
  Hand,
  Grab,
  GrabIcon,
  Crosshair,
  Focus,
  Aperture,
  Disc,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Repeat,
  Shuffle,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Minimize2,
  Maximize2,
  PictureInPicture,
  PictureInPicture2,
  ScreenShare,
  ScreenShareOff,
  CastIcon,
  AirplayIcon,
  BluetoothConnected,
  Radio,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Antenna,
  Broadcast,
  Podcast,
  Rss,
  Satellite,
  SatelliteDish,
  Router,
  Ethernet,
  Cable,
  Usb,
  UsbIcon,
  HardDriveDownload,
  HardDriveUpload,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Import,
  Export,
  Send,
  SendHorizonal,
  Mail,
  MailOpen,
  MessageSquare,
  MessageCircle,
  PhoneCall,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Contact,
  Contact2,
  UserCheck,
  UserPlus,
  UserMinus,
  UserX,
  UserCog,
  UserSearch,
  UsersRound,
  UserRound,
  UserRoundCheck,
  UserRoundCog,
  UserRoundMinus,
  UserRoundPlus,
  UserRoundSearch,
  UserRoundX,
  Crown,
  Award,
  Trophy,
  Medal,
  Ribbon,
  Gift,
  PartyPopper,
  Cake,
  Coffee,
  Pizza,
  Apple,
  Beef,
  Carrot,
  Cherry,
  Cookie,
  Croissant,
  Egg,
  Fish as FishIcon,
  Grape,
  IceCream,
  Lemon,
  Milk,
  Nut,
  Sandwich,
  Soup,
  Wheat,
  Wine,
  Utensils,
  UtensilsCrossed,
  ChefHat,
  CookingPot,
  Refrigerator,
  Microwave,
  Oven,
  Blender,
  Scale,
  Timer,
  Hourglass,
  Stopwatch,
  Watch,
  AlarmClock,
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarHeart,
  CalendarMinus,
  CalendarPlus,
  CalendarRange,
  CalendarSearch,
  CalendarX,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
} from 'lucide-react';

// Import hooks and services
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';
import { usePipelineManager } from '../../../../hooks/usePipelineManager';
import { useJobWorkflow } from '../../../../hooks/useJobWorkflow';
import { useDataSources } from '../../../../hooks/useDataSources';
import { useScanRuleSets } from '../../../../hooks/useScanRuleSets';
import { useClassifications } from '../../../../hooks/useClassifications';
import { useComplianceRules as useComplianceRule } from '../../../../hooks/useComplianceRules';
import { useAdvancedCatalog } from '../../../../hooks/useAdvancedCatalog';
import { useScanLogic } from '../../../../hooks/useScanLogic';
import { useRBACSystem as useRBAC } from '../../../../hooks/useRBACSystem';

// Types
interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'gauge' | 'heatmap' | 'timeline' | 'map' | 'custom';
  title: string;
  description: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: {
    dataSource: string;
    refreshInterval: number;
    autoRefresh: boolean;
    showTitle: boolean;
    showLegend: boolean;
    showGrid: boolean;
    theme: 'light' | 'dark' | 'auto';
    colors: string[];
    filters: DashboardFilter[];
  };
  data: any;
  status: 'loading' | 'ready' | 'error' | 'no-data';
  lastUpdated: string;
  visualization: DashboardVisualization;
  interactions: DashboardInteraction[];
  alerts: DashboardAlert[];
}

interface DashboardVisualization {
  chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter' | 'area' | 'radar' | 'polar' | 'bubble' | 'heatmap' | 'treemap' | 'sankey' | 'funnel' | 'gauge' | 'table';
  xAxis?: {
    field: string;
    label: string;
    type: 'category' | 'number' | 'time';
    format?: string;
  };
  yAxis?: {
    field: string;
    label: string;
    type: 'category' | 'number' | 'time';
    format?: string;
    scale?: 'linear' | 'log' | 'sqrt';
  };
  series: {
    field: string;
    label: string;
    type: 'line' | 'bar' | 'area';
    color?: string;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  }[];
  groupBy?: string[];
  aggregation?: Record<string, string>;
  formatting?: {
    numberFormat?: string;
    dateFormat?: string;
    colorScale?: string;
    customFormat?: string;
  };
}

interface DashboardFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'range';
}

interface DashboardInteraction {
  type: 'click' | 'hover' | 'zoom' | 'brush' | 'drill-down' | 'cross-filter';
  action: 'highlight' | 'filter' | 'navigate' | 'popup' | 'update';
  target?: string;
  parameters?: Record<string, any>;
}

interface DashboardAlert {
  id: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  actions: string[];
  enabled: boolean;
}

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'overview' | 'performance' | 'quality' | 'compliance' | 'security' | 'operations' | 'custom';
  tags: string[];
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  variables: Record<string, any>;
  permissions: {
    view: string[];
    edit: string[];
    share: string[];
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    version: string;
    popularity: number;
    usage: number;
  };
}

interface DashboardLayout {
  type: 'grid' | 'flex' | 'absolute';
  columns: number;
  rows: number;
  gap: number;
  padding: number;
  responsive: boolean;
  breakpoints: Record<string, any>;
}

interface DataSource {
  id: string;
  name: string;
  type: 'spa' | 'api' | 'database' | 'file' | 'real-time' | 'custom';
  connection: {
    endpoint?: string;
    authentication?: any;
    parameters?: Record<string, any>;
    headers?: Record<string, string>;
  };
  schema: {
    fields: DataField[];
    primaryKey?: string;
    indexes?: string[];
  };
  capabilities: {
    realTime: boolean;
    historical: boolean;
    aggregation: boolean;
    filtering: boolean;
    sorting: boolean;
  };
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  metrics: {
    recordCount: number;
    updateFrequency: number;
    latency: number;
    reliability: number;
  };
}

interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  nullable: boolean;
  description?: string;
  format?: string;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

interface DashboardAnalytics {
  views: number;
  interactions: number;
  averageTimeSpent: number;
  popularWidgets: string[];
  userEngagement: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
  };
  performance: {
    loadTime: number;
    renderTime: number;
    dataFetchTime: number;
    errorRate: number;
  };
  insights: {
    trends: any[];
    anomalies: any[];
    recommendations: any[];
  };
}

interface QuickDashboardCreateProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  initialTemplate?: DashboardTemplate;
}

const QuickDashboardCreate: React.FC<QuickDashboardCreateProps> = ({
  isVisible,
  onClose,
  className = '',
  initialTemplate,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('design');
  const [dashboardName, setDashboardName] = useState<string>('');
  const [dashboardDescription, setDashboardDescription] = useState<string>('');
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [layout, setLayout] = useState<DashboardLayout>({
    type: 'grid',
    columns: 12,
    rows: 8,
    gap: 16,
    padding: 16,
    responsive: true,
    breakpoints: {}
  });
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilter[]>([]);
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isDragMode, setIsDragMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [gridSize, setGridSize] = useState<number>(10);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [colorScheme, setColorScheme] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [realTimeMode, setRealTimeMode] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [showToolbar, setShowToolbar] = useState<boolean>(true);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'popularity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Hooks
  const {
    getAIRecommendations,
    analyzePerformance,
    generateInsights,
    optimizeLayout,
    suggestWidgets,
    predictTrends,
    validateConfiguration
  } = useAIAssistant();

  const {
    currentWorkspace,
    getWorkspaceMetrics,
    getWorkspaceResources
  } = useWorkspaceManagement();

  const {
    currentUser,
    userPermissions,
    checkPermission,
    getUserPreferences
  } = useUserManagement();

  const {
    getCrossGroupMetrics,
    getSPAStatus,
    getAvailableSPAActions,
    getIntegrationStatus
  } = useCrossGroupIntegration();

  const {
    trackActivity,
    getActivityHistory,
    getPerformanceData,
    getSystemMetrics
  } = useActivityTracking();

  // SPA Integration Hooks
  const { dataSources: dataSourcesList, getDataSourceMetrics } = useDataSources();
  const { scanRuleSets, getScanRuleMetrics } = useScanRuleSets();
  const { classifications, getClassificationMetrics } = useClassifications();
  const { complianceRules, getComplianceMetrics } = useComplianceRule();
  const { catalogItems, getCatalogMetrics } = useAdvancedCatalog();
  const { scanJobs, getScanMetrics } = useScanLogic();
  const { users, roles, getRBACMetrics } = useRBAC();
  const { pipelines, getPipelineMetrics } = usePipelineManager();
  const { workflows, getWorkflowMetrics } = useJobWorkflow();

  // Widget Types Configuration
  const widgetTypes = useMemo(() => [
    {
      type: 'metric',
      name: 'Metric Card',
      description: 'Display single KPI or metric value',
      icon: Target,
      category: 'basic',
      defaultSize: { width: 3, height: 2 },
      dataRequirements: ['numeric_field'],
      features: ['alerts', 'comparison', 'trend']
    },
    {
      type: 'chart',
      name: 'Chart Widget',
      description: 'Various chart types for data visualization',
      icon: BarChart3,
      category: 'visualization',
      defaultSize: { width: 6, height: 4 },
      dataRequirements: ['x_axis', 'y_axis'],
      features: ['multiple_series', 'interactive', 'export']
    },
    {
      type: 'table',
      name: 'Data Table',
      description: 'Tabular data display with sorting and filtering',
      icon: Table,
      category: 'data',
      defaultSize: { width: 8, height: 6 },
      dataRequirements: ['multiple_fields'],
      features: ['sorting', 'filtering', 'pagination', 'export']
    },
    {
      type: 'gauge',
      name: 'Gauge Chart',
      description: 'Circular gauge for progress and performance metrics',
      icon: Gauge,
      category: 'visualization',
      defaultSize: { width: 4, height: 4 },
      dataRequirements: ['numeric_field', 'target_value'],
      features: ['thresholds', 'colors', 'animation']
    },
    {
      type: 'heatmap',
      name: 'Heat Map',
      description: 'Color-coded matrix for pattern visualization',
      icon: Grid,
      category: 'advanced',
      defaultSize: { width: 6, height: 4 },
      dataRequirements: ['x_axis', 'y_axis', 'value_field'],
      features: ['color_scales', 'clustering', 'zoom']
    },
    {
      type: 'timeline',
      name: 'Timeline',
      description: 'Time-based data visualization',
      icon: Activity,
      category: 'temporal',
      defaultSize: { width: 8, height: 3 },
      dataRequirements: ['time_field', 'event_field'],
      features: ['zoom', 'brush', 'annotations']
    }
  ], []);

  // Chart Types Configuration
  const chartTypes = useMemo(() => [
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'bar', label: 'Bar Chart', icon: BarChart },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'doughnut', label: 'Doughnut Chart', icon: Circle },
    { value: 'scatter', label: 'Scatter Plot', icon: CircleIcon },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
    { value: 'radar', label: 'Radar Chart', icon: Radar },
    { value: 'bubble', label: 'Bubble Chart', icon: CircleIcon },
    { value: 'heatmap', label: 'Heat Map', icon: Grid },
    { value: 'treemap', label: 'Tree Map', icon: Boxes },
    { value: 'funnel', label: 'Funnel Chart', icon: Triangle },
    { value: 'gauge', label: 'Gauge Chart', icon: Gauge }
  ], []);

  // Color Schemes
  const colorSchemes = useMemo(() => [
    { id: 'default', name: 'Default', colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] },
    { id: 'professional', name: 'Professional', colors: ['#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'] },
    { id: 'vibrant', name: 'Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'] },
    { id: 'ocean', name: 'Ocean', colors: ['#0077BE', '#00A8CC', '#00BCD4', '#009688', '#4CAF50'] },
    { id: 'sunset', name: 'Sunset', colors: ['#FF5722', '#FF9800', '#FFC107', '#FFEB3B', '#CDDC39'] },
    { id: 'nature', name: 'Nature', colors: ['#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A'] }
  ], []);

  // Dashboard Templates
  const defaultTemplates = useMemo(() => [
    {
      id: 'data-governance-overview',
      name: 'Data Governance Overview',
      description: 'Comprehensive dashboard for data governance KPIs and metrics',
      category: 'overview' as const,
      tags: ['governance', 'kpi', 'overview', 'executive'],
      widgets: [
        {
          id: 'total-assets',
          type: 'metric' as const,
          title: 'Total Data Assets',
          description: 'Total number of cataloged data assets',
          position: { x: 0, y: 0 },
          size: { width: 3, height: 2 },
          config: {
            dataSource: 'advanced-catalog',
            refreshInterval: 300,
            autoRefresh: true,
            showTitle: true,
            showLegend: false,
            showGrid: false,
            theme: 'auto' as const,
            colors: ['#3B82F6'],
            filters: []
          },
          data: null,
          status: 'loading' as const,
          lastUpdated: new Date().toISOString(),
          visualization: {
            chartType: 'table' as const,
            series: [{
              field: 'count',
              label: 'Assets',
              type: 'bar' as const,
              aggregation: 'count' as const
            }]
          },
          interactions: [],
          alerts: []
        }
      ],
      layout: {
        type: 'grid' as const,
        columns: 12,
        rows: 8,
        gap: 16,
        padding: 16,
        responsive: true,
        breakpoints: {}
      },
      filters: [],
      variables: {},
      permissions: {
        view: ['all'],
        edit: ['admin', 'data_steward'],
        share: ['admin', 'data_steward', 'analyst']
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        popularity: 95,
        usage: 1250
      }
    },
    {
      id: 'compliance-monitoring',
      name: 'Compliance Monitoring',
      description: 'Real-time compliance status and risk assessment dashboard',
      category: 'compliance' as const,
      tags: ['compliance', 'risk', 'monitoring', 'alerts'],
      widgets: [],
      layout: {
        type: 'grid' as const,
        columns: 12,
        rows: 8,
        gap: 16,
        padding: 16,
        responsive: true,
        breakpoints: {}
      },
      filters: [],
      variables: {},
      permissions: {
        view: ['all'],
        edit: ['admin', 'compliance_officer'],
        share: ['admin', 'compliance_officer']
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        popularity: 88,
        usage: 890
      }
    },
    {
      id: 'performance-analytics',
      name: 'Performance Analytics',
      description: 'System performance metrics and optimization insights',
      category: 'performance' as const,
      tags: ['performance', 'optimization', 'metrics', 'analytics'],
      widgets: [],
      layout: {
        type: 'grid' as const,
        columns: 12,
        rows: 8,
        gap: 16,
        padding: 16,
        responsive: true,
        breakpoints: {}
      },
      filters: [],
      variables: {},
      permissions: {
        view: ['all'],
        edit: ['admin', 'system_admin'],
        share: ['admin', 'system_admin', 'analyst']
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        popularity: 92,
        usage: 750
      }
    }
  ], []);

  // Initialize component
  useEffect(() => {
    if (initialTemplate) {
      loadTemplate(initialTemplate);
    }
    loadTemplates();
    loadDataSources();
    loadAIRecommendations();
    trackActivity('dashboard-create-opened', { component: 'QuickDashboardCreate' });
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty && dashboardName) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoSave, isDirty, dashboardName, widgets]);

  // Real-time updates
  useEffect(() => {
    if (realTimeMode && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshWidgetData();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [realTimeMode, refreshInterval]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from an API
      setTemplates(defaultTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates(defaultTemplates);
    }
  }, [defaultTemplates]);

  // Load data sources
  const loadDataSources = useCallback(async () => {
    try {
      const sources: DataSource[] = [
        {
          id: 'data-sources-spa',
          name: 'Data Sources SPA',
          type: 'spa',
          connection: { endpoint: '/api/data-sources' },
          schema: {
            fields: [
              { name: 'id', type: 'string', nullable: false },
              { name: 'name', type: 'string', nullable: false },
              { name: 'type', type: 'string', nullable: false },
              { name: 'status', type: 'string', nullable: false },
              { name: 'lastUpdated', type: 'date', nullable: false },
              { name: 'recordCount', type: 'number', nullable: false }
            ]
          },
          capabilities: {
            realTime: true,
            historical: true,
            aggregation: true,
            filtering: true,
            sorting: true
          },
          status: 'connected',
          lastSync: new Date().toISOString(),
          metrics: {
            recordCount: 1250,
            updateFrequency: 300,
            latency: 45,
            reliability: 99.5
          }
        },
        {
          id: 'scan-logic-spa',
          name: 'Scan Logic SPA',
          type: 'spa',
          connection: { endpoint: '/api/scan-logic' },
          schema: {
            fields: [
              { name: 'id', type: 'string', nullable: false },
              { name: 'scanType', type: 'string', nullable: false },
              { name: 'status', type: 'string', nullable: false },
              { name: 'startTime', type: 'date', nullable: false },
              { name: 'endTime', type: 'date', nullable: true },
              { name: 'itemsScanned', type: 'number', nullable: false },
              { name: 'issuesFound', type: 'number', nullable: false }
            ]
          },
          capabilities: {
            realTime: true,
            historical: true,
            aggregation: true,
            filtering: true,
            sorting: true
          },
          status: 'connected',
          lastSync: new Date().toISOString(),
          metrics: {
            recordCount: 2890,
            updateFrequency: 60,
            latency: 32,
            reliability: 98.8
          }
        },
        {
          id: 'compliance-rule-spa',
          name: 'Compliance Rule SPA',
          type: 'spa',
          connection: { endpoint: '/api/compliance-rules' },
          schema: {
            fields: [
              { name: 'id', type: 'string', nullable: false },
              { name: 'ruleName', type: 'string', nullable: false },
              { name: 'category', type: 'string', nullable: false },
              { name: 'severity', type: 'string', nullable: false },
              { name: 'status', type: 'string', nullable: false },
              { name: 'lastEvaluated', type: 'date', nullable: false },
              { name: 'complianceScore', type: 'number', nullable: false }
            ]
          },
          capabilities: {
            realTime: true,
            historical: true,
            aggregation: true,
            filtering: true,
            sorting: true
          },
          status: 'connected',
          lastSync: new Date().toISOString(),
          metrics: {
            recordCount: 456,
            updateFrequency: 900,
            latency: 28,
            reliability: 99.2
          }
        }
      ];
      
      setDataSources(sources);
    } catch (error) {
      console.error('Failed to load data sources:', error);
    }
  }, []);

  // Load AI recommendations
  const loadAIRecommendations = useCallback(async () => {
    try {
      const recommendations = await getAIRecommendations();
      setAIRecommendations(recommendations || []);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
    }
  }, [getAIRecommendations]);

  // Load template
  const loadTemplate = useCallback((template: DashboardTemplate) => {
    setDashboardName(template.name);
    setDashboardDescription(template.description);
    setWidgets(template.widgets);
    setLayout(template.layout);
    setDashboardFilters(template.filters);
    setSelectedTemplate(template);
    setIsDirty(false);
    trackActivity('dashboard-template-loaded', { templateId: template.id });
  }, [trackActivity]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!dashboardName) return;

    try {
      setIsLoading(true);
      
      const dashboardData = {
        name: dashboardName,
        description: dashboardDescription,
        widgets,
        layout,
        filters: dashboardFilters,
        theme,
        colorScheme,
        config: {
          autoSave,
          realTimeMode,
          refreshInterval,
          showFilters,
          showToolbar
        }
      };

      // In a real implementation, this would save to an API
      console.log('Saving dashboard:', dashboardData);
      
      setIsDirty(false);
      setLastSaved(new Date().toLocaleTimeString());
      trackActivity('dashboard-saved', { dashboardName });
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    dashboardName,
    dashboardDescription,
    widgets,
    layout,
    dashboardFilters,
    theme,
    colorScheme,
    autoSave,
    realTimeMode,
    refreshInterval,
    showFilters,
    showToolbar,
    trackActivity
  ]);

  // Handle widget creation
  const handleCreateWidget = useCallback((widgetType: string, position: { x: number; y: number }) => {
    const widgetTypeConfig = widgetTypes.find(t => t.type === widgetType);
    if (!widgetTypeConfig) return;

    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType as any,
      title: widgetTypeConfig.name,
      description: widgetTypeConfig.description,
      position,
      size: widgetTypeConfig.defaultSize,
      config: {
        dataSource: selectedDataSource || dataSources[0]?.id || '',
        refreshInterval: 60,
        autoRefresh: realTimeMode,
        showTitle: true,
        showLegend: true,
        showGrid: false,
        theme: 'auto',
        colors: colorSchemes.find(c => c.id === colorScheme)?.colors || colorSchemes[0].colors,
        filters: []
      },
      data: null,
      status: 'loading',
      lastUpdated: new Date().toISOString(),
      visualization: {
        chartType: widgetType === 'chart' ? 'bar' : 'table',
        series: [{
          field: 'value',
          label: 'Value',
          type: 'bar',
          aggregation: 'sum'
        }]
      },
      interactions: [],
      alerts: []
    };

    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidget(newWidget.id);
    setIsDirty(true);
    trackActivity('widget-created', { widgetType, widgetId: newWidget.id });
  }, [widgetTypes, selectedDataSource, dataSources, realTimeMode, colorScheme, colorSchemes, trackActivity]);

  // Handle widget update
  const handleUpdateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId ? { ...widget, ...updates } : widget
    ));
    setIsDirty(true);
  }, []);

  // Handle widget deletion
  const handleDeleteWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    setSelectedWidget(null);
    setIsDirty(true);
  }, []);

  // Refresh widget data
  const refreshWidgetData = useCallback(async () => {
    for (const widget of widgets) {
      if (widget.config.autoRefresh) {
        try {
          // In a real implementation, this would fetch fresh data
          const updatedWidget = {
            ...widget,
            lastUpdated: new Date().toISOString(),
            status: 'ready' as const
          };
          handleUpdateWidget(widget.id, updatedWidget);
        } catch (error) {
          console.error(`Failed to refresh widget ${widget.id}:`, error);
          handleUpdateWidget(widget.id, { status: 'error' });
        }
      }
    }
  }, [widgets, handleUpdateWidget]);

  // Handle export
  const handleExport = useCallback(async (format: 'json' | 'pdf' | 'png' | 'svg') => {
    try {
      const exportData = {
        dashboard: {
          name: dashboardName,
          description: dashboardDescription,
          widgets,
          layout,
          filters: dashboardFilters
        },
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: currentUser?.id,
          format
        }
      };

      switch (format) {
        case 'json':
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${dashboardName}.json`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        case 'pdf':
          // Export dashboard as PDF using html2canvas and jsPDF
          const { default: html2canvas } = await import('html2canvas');
          const { jsPDF } = await import('jspdf');
          
          const dashboardElement = document.querySelector('[data-dashboard-container]');
          if (dashboardElement) {
            const canvas = await html2canvas(dashboardElement as HTMLElement);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }
            
            pdf.save(`${dashboardName || 'dashboard'}.pdf`);
          }
          break;
          
        case 'png':
          // Export dashboard as PNG using html2canvas
          const { default: html2canvasPng } = await import('html2canvas');
          
          const dashboardElementPng = document.querySelector('[data-dashboard-container]');
          if (dashboardElementPng) {
            const canvasPng = await html2canvasPng(dashboardElementPng as HTMLElement);
            const link = document.createElement('a');
            link.download = `${dashboardName || 'dashboard'}.png`;
            link.href = canvasPng.toDataURL();
            link.click();
          }
          break;
          
        case 'svg':
          // Export dashboard as SVG by serializing the DOM
          const dashboardElementSvg = document.querySelector('[data-dashboard-container]');
          if (dashboardElementSvg) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(dashboardElementSvg);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const link = document.createElement('a');
            link.href = svgUrl;
            link.download = `${dashboardName || 'dashboard'}.svg`;
            link.click();
            URL.revokeObjectURL(svgUrl);
          }
          break;
      }

      trackActivity('dashboard-exported', { format, dashboardName });
    } catch (error) {
      console.error('Failed to export dashboard:', error);
    }
  }, [dashboardName, dashboardDescription, widgets, layout, dashboardFilters, currentUser, trackActivity]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      const matchesSearch = !searchQuery || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      const key = sortBy === 'created' ? 'createdAt' : 
                  sortBy === 'updated' ? 'updatedAt' :
                  sortBy === 'popularity' ? 'popularity' : 'name';
      
      const aVal = sortBy === 'name' ? a[key] : a.metadata[key];
      const bVal = sortBy === 'name' ? b[key] : b.metadata[key];
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [templates, filterCategory, searchQuery, sortBy, sortOrder]);

  // Render widget
  const renderWidget = useCallback((widget: DashboardWidget) => {
    const isSelected = selectedWidget === widget.id;
    const WidgetIcon = widgetTypes.find(t => t.type === widget.type)?.icon || Square;

    return (
      <motion.div
        key={widget.id}
        className={`absolute cursor-pointer border-2 rounded-lg bg-background shadow-sm ${
          isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground'
        }`}
        style={{
          left: widget.position.x * (100 / layout.columns) + '%',
          top: widget.position.y * (100 / layout.rows) + '%',
          width: widget.size.width * (100 / layout.columns) + '%',
          height: widget.size.height * (100 / layout.rows) + '%',
        }}
        onClick={() => setSelectedWidget(widget.id)}
        drag={isDragMode}
        dragControls={dragControls}
        onDragEnd={(_, info) => {
          const newX = Math.round((widget.position.x * (100 / layout.columns) + info.offset.x / canvasRef.current!.offsetWidth * 100) / (100 / layout.columns));
          const newY = Math.round((widget.position.y * (100 / layout.rows) + info.offset.y / canvasRef.current!.offsetHeight * 100) / (100 / layout.rows));
          
          handleUpdateWidget(widget.id, {
            position: {
              x: Math.max(0, Math.min(layout.columns - widget.size.width, newX)),
              y: Math.max(0, Math.min(layout.rows - widget.size.height, newY))
            }
          });
        }}
        whileHover={{ scale: isSelected ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WidgetIcon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium truncate">{widget.title}</CardTitle>
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant={
                  widget.status === 'ready' ? 'default' :
                  widget.status === 'loading' ? 'secondary' :
                  widget.status === 'error' ? 'destructive' : 'outline'
                } className="text-xs">
                  {widget.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedWidget(widget.id)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteWidget(widget.id)}>
                      <X className="h-3 w-3 mr-1" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 h-full">
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {widget.status === 'loading' && (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}
              {widget.status === 'error' && (
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Error loading data</span>
                </div>
              )}
              {widget.status === 'ready' && (
                <div className="text-center">
                  <WidgetIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">{widget.type} visualization</p>
                </div>
              )}
              {widget.status === 'no-data' && (
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span className="text-sm">No data available</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [
    selectedWidget,
    widgetTypes,
    layout,
    isDragMode,
    dragControls,
    handleUpdateWidget,
    handleDeleteWidget
  ]);

  // Main render
  if (!isVisible) return null;

  return (
    <div>
      <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 bg-background border rounded-lg shadow-lg flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Quick Dashboard Create</h2>
                <p className="text-sm text-muted-foreground">
                  Dynamic dashboard builder with cross-SPA analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {autoSave && lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Saved {lastSaved}
                </span>
              )}
              {isDirty && (
                <Badge variant="outline" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
              
              {/* Preview Toggle */}
              <Button
                variant={isPreviewMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>

              {/* Save */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!dashboardName || isLoading}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileTextIcon className="h-3 w-3 mr-1" />
                    JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileIcon className="h-3 w-3 mr-1" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('png')}>
                    <ImageIcon className="h-3 w-3 mr-1" />
                    PNG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Widgets & Templates */}
            {showSidebar && (
              <div className="w-80 border-r bg-muted/30 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-4 m-2">
                    <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                    <TabsTrigger value="widgets" className="text-xs">Widgets</TabsTrigger>
                    <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
                    <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden">
                    {/* Design Tab */}
                    <TabsContent value="design" className="h-full m-0 p-2 space-y-3">
                      <ScrollArea className="h-full">
                        {/* Dashboard Info */}
                        <Card className="mb-3">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Dashboard Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label htmlFor="dashboard-name" className="text-xs">Name</Label>
                              <Input
                                id="dashboard-name"
                                value={dashboardName}
                                onChange={(e) => {
                                  setDashboardName(e.target.value);
                                  setIsDirty(true);
                                }}
                                placeholder="Enter dashboard name"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label htmlFor="dashboard-description" className="text-xs">Description</Label>
                              <Textarea
                                id="dashboard-description"
                                value={dashboardDescription}
                                onChange={(e) => {
                                  setDashboardDescription(e.target.value);
                                  setIsDirty(true);
                                }}
                                placeholder="Enter dashboard description"
                                className="text-xs"
                                rows={2}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Layout Settings */}
                        <Card className="mb-3">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Layout Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs">Grid Columns</Label>
                              <Slider
                                value={[layout.columns]}
                                onValueChange={([value]) => {
                                  setLayout(prev => ({ ...prev, columns: value }));
                                  setIsDirty(true);
                                }}
                                max={24}
                                min={6}
                                step={1}
                                className="mt-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {layout.columns} columns
                              </span>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Grid Rows</Label>
                              <Slider
                                value={[layout.rows]}
                                onValueChange={([value]) => {
                                  setLayout(prev => ({ ...prev, rows: value }));
                                  setIsDirty(true);
                                }}
                                max={20}
                                min={4}
                                step={1}
                                className="mt-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {layout.rows} rows
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Show Grid</Label>
                              <Switch
                                checked={showGrid}
                                onCheckedChange={setShowGrid}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Snap to Grid</Label>
                              <Switch
                                checked={snapToGrid}
                                onCheckedChange={setSnapToGrid}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Theme Settings */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Theme & Colors</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs">Theme</Label>
                              <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
                                <SelectTrigger className="h-8 text-xs mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="auto">Auto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">Color Scheme</Label>
                              <Select value={colorScheme} onValueChange={setColorScheme}>
                                <SelectTrigger className="h-8 text-xs mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {colorSchemes.map((scheme) => (
                                    <SelectItem key={scheme.id} value={scheme.id}>
                                      {scheme.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Real-time Updates</Label>
                              <Switch
                                checked={realTimeMode}
                                onCheckedChange={setRealTimeMode}
                              />
                            </div>

                            {realTimeMode && (
                              <div>
                                <Label className="text-xs">Refresh Interval (seconds)</Label>
                                <Slider
                                  value={[refreshInterval]}
                                  onValueChange={([value]) => setRefreshInterval(value)}
                                  max={300}
                                  min={5}
                                  step={5}
                                  className="mt-2"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {refreshInterval}s
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </ScrollArea>
                    </TabsContent>

                    {/* Widgets Tab */}
                    <TabsContent value="widgets" className="h-full m-0 p-2">
                      <ScrollArea className="h-full">
                        <div className="space-y-3">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Widget Types</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {widgetTypes.map((widgetType) => {
                                const WidgetIcon = widgetType.icon;
                                return (
                                  <div
                                    key={widgetType.type}
                                    className="flex items-center space-x-2 p-2 rounded border cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleCreateWidget(widgetType.type, { x: 0, y: 0 })}
                                  >
                                    <WidgetIcon className="h-4 w-4 text-primary" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium">{widgetType.name}</p>
                                      <p className="text-xs text-muted-foreground">{widgetType.description}</p>
                                    </div>
                                    <Plus className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                );
                              })}
                            </CardContent>
                          </Card>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Templates Tab */}
                    <TabsContent value="templates" className="h-full m-0 p-2">
                      <div className="space-y-3 h-full flex flex-col">
                        {/* Template Filters */}
                        <div className="space-y-2">
                          <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <div className="flex space-x-2">
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                              <SelectTrigger className="h-8 text-xs flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="overview">Overview</SelectItem>
                                <SelectItem value="performance">Performance</SelectItem>
                                <SelectItem value="quality">Quality</SelectItem>
                                <SelectItem value="compliance">Compliance</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="operations">Operations</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                              <SelectTrigger className="h-8 text-xs w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="popularity">Popular</SelectItem>
                                <SelectItem value="created">Created</SelectItem>
                                <SelectItem value="updated">Updated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Template List */}
                        <ScrollArea className="flex-1">
                          <div className="space-y-2">
                            {filteredTemplates.map((template) => (
                              <Card 
                                key={template.id} 
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => loadTemplate(template)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-xs font-medium">{template.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {template.category}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {template.description}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{template.widgets.length} widgets</span>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span>{template.metadata.popularity}%</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {template.tags.slice(0, 3).map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    {/* Data Tab */}
                    <TabsContent value="data" className="h-full m-0 p-2">
                      <ScrollArea className="h-full">
                        <div className="space-y-3">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Data Sources</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {dataSources.map((source) => (
                                <div
                                  key={source.id}
                                  className={`p-2 rounded border cursor-pointer transition-colors ${
                                    selectedDataSource === source.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                  }`}
                                  onClick={() => setSelectedDataSource(source.id)}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-medium">{source.name}</p>
                                    <Badge variant={
                                      source.status === 'connected' ? 'default' :
                                      source.status === 'disconnected' ? 'secondary' : 'destructive'
                                    } className="text-xs">
                                      {source.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">{source.type}</p>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{source.metrics.recordCount} records</span>
                                    <span>{source.metrics.reliability}% reliability</span>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          {/* AI Recommendations */}
                          {aiRecommendations.length > 0 && (
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center">
                                  <Brain className="h-4 w-4 mr-2" />
                                  AI Recommendations
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                {aiRecommendations.slice(0, 3).map((rec, index) => (
                                  <div key={index} className="p-2 border rounded text-xs">
                                    <p className="font-medium">{rec.title}</p>
                                    <p className="text-muted-foreground mt-1">{rec.description}</p>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col">
              {/* Canvas Toolbar */}
              {showToolbar && (
                <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isDragMode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsDragMode(!isDragMode)}
                    >
                      <Move className="h-3 w-3 mr-1" />
                      {isDragMode ? 'Stop Drag' : 'Drag Mode'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWidget(null)}
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Deselect
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshWidgetData}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                      >
                        <ZoomOut className="h-3 w-3" />
                      </Button>
                      <span className="text-xs px-2 w-12 text-center">{zoomLevel}%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                      >
                        <ZoomIn className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* View Options */}
                    <Button
                      variant={showGrid ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Grid className="h-3 w-3 mr-1" />
                      Grid
                    </Button>
                  </div>
                </div>
              )}

              {/* Canvas */}
              <div className="flex-1 relative overflow-auto bg-background">
                <div
                  ref={canvasRef}
                  className="w-full h-full relative min-h-[600px]"
                  data-dashboard-container
                  style={{
                    backgroundImage: showGrid 
                      ? `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`
                      : undefined,
                    backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : undefined,
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top left'
                  }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setSelectedWidget(null);
                    }
                  }}
                >
                  {/* Render widgets */}
                  {widgets.map(renderWidget)}

                  {/* Empty state */}
                  {widgets.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Create Your First Dashboard</h3>
                        <p className="text-muted-foreground mb-4">
                          Add widgets from the sidebar or choose a template to get started
                        </p>
                        <div className="flex space-x-2 justify-center">
                          <Button onClick={() => setActiveTab('widgets')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Widget
                          </Button>
                          <Button variant="outline" onClick={() => setActiveTab('templates')}>
                            <Layout className="h-4 w-4 mr-2" />
                            Choose Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Widget Properties */}
            {selectedWidget && (
              <div className="w-80 border-l bg-muted/30 p-4">
                <ScrollArea className="h-full">
                  {(() => {
                    const widget = widgets.find(w => w.id === selectedWidget);
                    if (!widget) return null;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Widget Properties</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWidget(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={widget.title}
                              onChange={(e) => handleUpdateWidget(widget.id, { title: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={widget.description}
                              onChange={(e) => handleUpdateWidget(widget.id, { description: e.target.value })}
                              className="text-xs"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Data Source</Label>
                            <Select 
                              value={widget.config.dataSource} 
                              onValueChange={(value) => handleUpdateWidget(widget.id, {
                                config: { ...widget.config, dataSource: value }
                              })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {dataSources.map((source) => (
                                  <SelectItem key={source.id} value={source.id}>
                                    {source.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {widget.type === 'chart' && (
                            <div>
                              <Label className="text-xs">Chart Type</Label>
                              <Select 
                                value={widget.visualization.chartType} 
                                onValueChange={(value) => handleUpdateWidget(widget.id, {
                                  visualization: { ...widget.visualization, chartType: value as any }
                                })}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {chartTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div>
                            <Label className="text-xs">Size</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div>
                                <Label className="text-xs">Width</Label>
                                <Input
                                  type="number"
                                  value={widget.size.width}
                                  onChange={(e) => handleUpdateWidget(widget.id, {
                                    size: { ...widget.size, width: parseInt(e.target.value) || 1 }
                                  })}
                                  min={1}
                                  max={layout.columns}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Height</Label>
                                <Input
                                  type="number"
                                  value={widget.size.height}
                                  onChange={(e) => handleUpdateWidget(widget.id, {
                                    size: { ...widget.size, height: parseInt(e.target.value) || 1 }
                                  })}
                                  min={1}
                                  max={layout.rows}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Position</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div>
                                <Label className="text-xs">X</Label>
                                <Input
                                  type="number"
                                  value={widget.position.x}
                                  onChange={(e) => handleUpdateWidget(widget.id, {
                                    position: { ...widget.position, x: parseInt(e.target.value) || 0 }
                                  })}
                                  min={0}
                                  max={layout.columns - widget.size.width}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Y</Label>
                                <Input
                                  type="number"
                                  value={widget.position.y}
                                  onChange={(e) => handleUpdateWidget(widget.id, {
                                    position: { ...widget.position, y: parseInt(e.target.value) || 0 }
                                  })}
                                  min={0}
                                  max={layout.rows - widget.size.height}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Show Title</Label>
                              <Switch
                                checked={widget.config.showTitle}
                                onCheckedChange={(checked) => handleUpdateWidget(widget.id, {
                                  config: { ...widget.config, showTitle: checked }
                                })}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Show Legend</Label>
                              <Switch
                                checked={widget.config.showLegend}
                                onCheckedChange={(checked) => handleUpdateWidget(widget.id, {
                                  config: { ...widget.config, showLegend: checked }
                                })}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Auto Refresh</Label>
                              <Switch
                                checked={widget.config.autoRefresh}
                                onCheckedChange={(checked) => handleUpdateWidget(widget.id, {
                                  config: { ...widget.config, autoRefresh: checked }
                                })}
                              />
                            </div>
                          </div>

                          {widget.config.autoRefresh && (
                            <div>
                              <Label className="text-xs">Refresh Interval (seconds)</Label>
                              <Slider
                                value={[widget.config.refreshInterval]}
                                onValueChange={([value]) => handleUpdateWidget(widget.id, {
                                  config: { ...widget.config, refreshInterval: value }
                                })}
                                max={300}
                                min={5}
                                step={5}
                                className="mt-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {widget.config.refreshInterval}s
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Bottom Status Bar */}
          <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>{widgets.length} widgets</span>
              <span>Grid: {layout.columns}x{layout.rows}</span>
              {selectedWidget && (
                <span>Selected: {widgets.find(w => w.id === selectedWidget)?.title}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {currentWorkspace && (
                <span>Workspace: {currentWorkspace.name}</span>
              )}
              <span>Zoom: {zoomLevel}%</span>
              {realTimeMode && (
                <span className="text-green-600">Real-time: ON</span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickDashboardCreate;