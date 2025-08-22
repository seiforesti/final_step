import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Treemap, FunnelChart, Funnel,
  LabelList, Sankey
} from 'recharts';
import {
  BarChart3, TrendingUp, Activity, DollarSign, Users, Target, Award,
  Clock, Database, Monitor, Cpu, AlertTriangle, CheckCircle, XCircle,
  Info, Settings, Search, Filter, Download, Upload, RefreshCw, Play,
  Pause, MoreVertical, Eye, Edit, Trash2, Plus, Minus, ArrowUp,
  ArrowDown, ArrowRight, Calendar, Globe, Shield, Lock, Unlock, Star,
  Heart, Bookmark, Share, MessageSquare, Bell, Mail, Phone, Video,
  Mic, Camera, Image, File, Folder, Archive, Tag, Flag, Map,
  Navigation, Compass, Route,   Layers, Grid, List, Table, Kanban,
  PieChart as PieChartIcon, LineChart as LineChartIcon,
  Building, Briefcase, Calculator, CreditCard, FileText, Presentation,
  Lightbulb, Zap, Brain, Network, Bot, Workflow, GitBranch, Boxes,
  Package, Server, Cloud, HardDrive, Wifi, Bluetooth, Smartphone,
  Laptop, Tablet, Watch, Headphones, Speaker, Gamepad2,
  Joystick, Home, Car, Plane, Train, Ship, Truck, Bike, Bus,
  Satellite, Radar, Microscope, Atom, Dna,
  Fingerprint, QrCode, Barcode, ScanLine, CameraOff, Volume2,
  VolumeX, Maximize, Minimize, RotateCcw, RotateCw, FlipHorizontal,
  FlipVertical, Copy, Scissors, PaintBucket, Palette,
  Brush, Pen, PenTool, Eraser, Ruler, Move, MousePointer, Hand,
  GripHorizontal, GripVertical, CornerDownLeft, CornerDownRight,
  CornerUpLeft, CornerUpRight, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, ChevronsDown, ChevronsUp, ChevronsLeft, ChevronsRight,
  Menu, X, Hash, AtSign, Percent, Ampersand, Quote, Italic, Bold,
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Indent, Outdent, WrapText, Type, Code, Code2, Terminal, Command as CommandIcon,
  Circle, Square, Triangle,
  Diamond, Pentagon, Hexagon, Octagon, Star as StarIcon, Heart as HeartIcon,
  Smile, Frown, Meh, ThumbsUp, ThumbsDown, TrendingDown, Minus as MinusIcon,
  Equal, MoreHorizontal, MoreVertical as MoreVerticalIcon,
  CheckSquare, XSquare, MinusSquare, PlusSquare,
  PlaySquare, PauseOctagon, StopCircle, SkipBack, SkipForward,
  Rewind, FastForward, Repeat, Repeat1, Shuffle, Volume, Volume1,
  Mic2, MicOff, Radio, Disc, Disc2, Disc3, Music,
  Music2, Music3, Music4, Headphones as HeadphonesIcon, Airplay,
  Cast, Tv, Tv2, Radio as RadioIcon, Podcast, Rss, Wifi as WifiIcon,
  WifiOff, Signal, SignalHigh, SignalLow, SignalMedium, SignalZero,
  Antenna, Bluetooth as BluetoothIcon, BluetoothConnected, BluetoothOff,
  BluetoothSearching, Nfc, Usb, HardDrive as HardDriveIcon,
  ScanEye, ScanFace, ScanSearch, ScanText, Scan, QrCode as QrCodeIcon,
  Barcode as BarcodeIcon, ScanLine as ScanLineIcon,
  Fingerprint as FingerprintIcon, ShieldCheck, ShieldAlert, ShieldClose,
  ShieldEllipsis, ShieldMinus, ShieldOff, ShieldPlus, ShieldQuestion,
  ShieldX, Lock as LockIcon, LockKeyhole,
  Unlock as UnlockIcon, Key, KeyRound, KeySquare,
  Banknote, Coins, CreditCard as CreditCardIcon,
  Wallet, Receipt,
  PiggyBank, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from 'lucide-react';

// Lazy load components for better performance
const FrameworkManager = lazy(() => import('./v1-manual/FrameworkManager'));
const RuleEngine = lazy(() => import('./v1-manual/RuleEngine'));
const PolicyOrchestrator = lazy(() => import('./v1-manual/PolicyOrchestrator'));
const BulkOperationCenter = lazy(() => import('./v1-manual/BulkOperationCenter'));
const AuditTrailAnalyzer = lazy(() => import('./v1-manual/AuditTrailAnalyzer'));
const ComplianceDashboard = lazy(() => import('./v1-manual/ComplianceDashboard'));

const MLModelOrchestrator = lazy(() => import('./v2-ml/MLModelOrchestrator'));
const TrainingPipelineManager = lazy(() => import('./v2-ml/TrainingPipelineManager'));
const AdaptiveLearningCenter = lazy(() => import('./v2-ml/AdaptiveLearningCenter'));
const HyperparameterOptimizer = lazy(() => import('./v2-ml/HyperparameterOptimizer'));
const DriftDetectionMonitor = lazy(() => import('./v2-ml/DriftDetectionMonitor'));
const FeatureEngineeringStudio = lazy(() => import('./v2-ml/FeatureEngineeringStudio'));
const ModelEnsembleBuilder = lazy(() => import('./v2-ml/ModelEnsembleBuilder'));
const MLAnalyticsDashboard = lazy(() => import('./v2-ml/MLAnalyticsDashboard'));

const AIIntelligenceOrchestrator = lazy(() => import('./v3-ai/AIIntelligenceOrchestrator'));
const ConversationManager = lazy(() => import('./v3-ai/ConversationManager'));
const ExplainableReasoningViewer = lazy(() => import('./v3-ai/ExplainableReasoningViewer'));
const AutoTaggingEngine = lazy(() => import('./v3-ai/AutoTaggingEngine'));
const WorkloadOptimizer = lazy(() => import('./v3-ai/WorkloadOptimizer'));
const RealTimeIntelligenceStream = lazy(() => import('./v3-ai/RealTimeIntelligenceStream'));
const KnowledgeSynthesizer = lazy(() => import('./v3-ai/KnowledgeSynthesizer'));
const AIAnalyticsDashboard = lazy(() => import('./v3-ai/AIAnalyticsDashboard'));

const ClassificationWorkflow = lazy(() => import('./orchestration/ClassificationWorkflow'));
const IntelligenceCoordinator = lazy(() => import('./orchestration/IntelligenceCoordinator'));
const BusinessIntelligenceHub = lazy(() => import('./orchestration/BusinessIntelligenceHub'));

// Import custom hooks and utilities
import { useClassificationState } from './core/hooks/useClassificationState';
import { useAIIntelligence } from './core/hooks/useAIIntelligence';
import { useMLIntelligence } from './core/hooks/useMLIntelligence';
import { useRealTimeMonitoring } from './core/hooks/useRealTimeMonitoring';
import { useWorkflowOrchestration } from './core/hooks/useWorkflowOrchestration';
import { useClassificationWorkflowOrchestrator } from './core/hooks/useClassificationWorkflowOrchestrator';
import { ClassificationApi } from './core/api/classificationApi';
import { aiApi } from './core/api/aiApi';
import { mlApi } from './core/api/mlApi';
import { websocketApi } from './core/api/websocketApi';

// Import shared components
import ClassificationLayout from './shared/layouts/ClassificationLayout';
import IntelligenceLayout from './shared/layouts/IntelligenceLayout';
import DataTable from './shared/ui/DataTable';
import IntelligentChart from './shared/ui/IntelligentChart';
import RealTimeIndicator from './shared/ui/RealTimeIndicator';
import WorkflowStepper from './shared/ui/WorkflowStepper';

// Import providers
import { ClassificationProvider } from './shared/providers/ClassificationProvider';
import { IntelligenceProvider } from './shared/providers/IntelligenceProvider';
import { ClassificationsRBACProvider, useClassificationsRBAC } from './core/hooks/useClassificationsRBAC';

// Import utility processors
import { defaultProcessor } from './core/utils/intelligenceProcessor';
import { defaultOptimizer } from './core/utils/performanceOptimizer';

// Advanced Enterprise TypeScript Interfaces for Classifications SPA
interface ClassificationsSPAState {
  isLoading: boolean;
  error: string | null;
  currentView: ClassificationView;
  currentVersion: ClassificationVersion;
  currentComponent: string | null;
  sidebarOpen: boolean;
  // Advanced enterprise state
  workflowMode: 'guided' | 'advanced' | 'expert';
  intelligenceLevel: 'manual' | 'assisted' | 'autonomous';
  collaborationMode: boolean;
  realTimeSync: boolean;
  performanceMode: 'balanced' | 'speed' | 'accuracy';
  systemHealth: 'optimal' | 'good' | 'warning' | 'critical';
  activeWorkflows: WorkflowInstance[];
  globalSearch: string;
  commandPalette: boolean;
  notifications: NotificationItem[];
  contextualHelp: boolean;
  advancedFilters: FilterState;
  customViews: CustomViewState[];
  activeView: string;
  splitViewMode: boolean;
  focusMode: boolean;
  darkMode: boolean;
}

// Advanced Enterprise Interfaces
interface WorkflowInstance {
  id: string;
  name: string;
  type: 'classification' | 'training' | 'deployment' | 'analysis';
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  estimatedCompletion?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  dependencies: string[];
  metrics: {
    accuracy?: number;
    throughput: number;
    resourceUsage: number;
    cost: number;
  };
}

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant: 'default' | 'destructive';
  }>;
}

interface FilterState {
  quickFilters: Record<string, boolean>;
  dateRange: { start: string; end: string } | null;
  statusFilters: string[];
  typeFilters: string[];
  ownerFilters: string[];
  customFilters: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
    value: any;
  }>;
}

interface CustomViewState {
  id: string;
  name: string;
  description: string;
  layout: 'grid' | 'list' | 'kanban' | 'timeline';
  filters: FilterState;
  sorting: { field: string; direction: 'asc' | 'desc' }[];
  grouping: string[];
  columns: string[];
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

interface ClassificationsSPAProps {
  initialView?: ClassificationView;
  embedded?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  permissions?: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canDeploy: boolean;
    canViewAnalytics: boolean;
  };
  onNavigate?: (view: ClassificationView) => void;
  onWorkflowComplete?: (workflowId: string, result: any) => void;
}

interface ClassificationsSPAState {
  profileOpen: boolean;
  searchQuery: string;
  globalFilters: GlobalFilter[];
  recentActivities: Activity[];
  systemStatus: SystemStatus;
  userPreferences: UserPreferences;
  theme: Theme;
  layout: LayoutConfiguration;
  performance: PerformanceMetrics;
  analytics: AnalyticsData;
  notifications: Notification[];
  shortcuts: KeyboardShortcut[];
  integrations: Integration[];
  security: SecurityConfiguration;
  collaboration: CollaborationSettings;
  automation: AutomationSettings;
  monitoring: MonitoringConfiguration;
  compliance: ComplianceSettings;
  governance: GovernanceConfiguration;
  realTimeMode: boolean;
  autoSave: boolean;
  debugMode: boolean;
  maintenanceMode: boolean;
  featureFlags: FeatureFlag[];
  experiments: Experiment[];
  telemetry: TelemetryData;
  feedback: FeedbackData[];
  support: SupportConfiguration;
  documentation: DocumentationLinks;
  tutorials: Tutorial[];
  onboarding: OnboardingState;
  accessibility: AccessibilitySettings;
  localization: LocalizationSettings;
  breadcrumbs: BreadcrumbItem[];
  quickActions: QuickAction[];
  contextMenu: ContextMenuItem[];
  dragDropState: DragDropState;
  clipboard: ClipboardData;
  undoRedoStack: UndoRedoState;
  bulkOperations: BulkOperationState;
  dataExport: DataExportState;
  dataImport: DataImportState;
  backup: BackupConfiguration;
  recovery: RecoveryConfiguration;
  versioning: VersioningConfiguration;
  migration: MigrationState;
  deployment: DeploymentConfiguration;
  scaling: ScalingConfiguration;
  optimization: OptimizationSettings;
  caching: CacheConfiguration;
  cdn: CDNConfiguration;
  api: APIConfiguration;
  webhooks: WebhookConfiguration;
  events: EventConfiguration;
  logging: LoggingConfiguration;
  metrics: MetricsConfiguration;
  alerts: AlertConfiguration;
  health: HealthCheckConfiguration;
  status: StatusPageConfiguration;
  maintenance: MaintenanceConfiguration;
  updates: UpdateConfiguration;
  patches: PatchConfiguration;
  hotfixes: HotfixConfiguration
}

interface ClassificationView {
  id: string;
  name: string;
  type: ViewType;
  layout: ViewLayout;
  components: ViewComponent[];
  filters: ViewFilter[];
  sorting: ViewSorting;
  grouping: ViewGrouping;
  pagination: ViewPagination;
  customization: ViewCustomization;
  permissions: ViewPermissions;
  sharing: ViewSharing;
  bookmarks: ViewBookmark[];
  history: ViewHistory[];
  preferences: ViewPreferences;
  metadata: ViewMetadata;
}

interface SystemStatus {
  overall: OverallStatus;
  services: ServiceStatus[];
  infrastructure: InfrastructureStatus;
  performance: PerformanceStatus;
  security: SecurityStatus;
  compliance: ComplianceStatus;
  monitoring: MonitoringStatus;
  alerts: AlertStatus[];
  incidents: IncidentStatus[];
  maintenance: MaintenanceStatus;
  updates: UpdateStatus;
  health: HealthStatus;
  availability: AvailabilityStatus;
  reliability: ReliabilityStatus;
  scalability: ScalabilityStatus;
  efficiency: EfficiencyStatus;
  quality: QualityStatus;
  satisfaction: SatisfactionStatus;
}

interface UserPreferences {
  theme: ThemePreference;
  layout: LayoutPreference;
  navigation: NavigationPreference;
  dashboard: DashboardPreference;
  notifications: NotificationPreference;
  accessibility: AccessibilityPreference;
  localization: LocalizationPreference;
  privacy: PrivacyPreference;
  security: SecurityPreference;
  performance: PerformancePreference;
  automation: AutomationPreference;
  collaboration: CollaborationPreference;
  integration: IntegrationPreference;
  customization: CustomizationPreference;
  shortcuts: ShortcutPreference[];
  bookmarks: BookmarkPreference[];
  history: HistoryPreference;
  search: SearchPreference;
  filters: FilterPreference[];
  views: ViewPreference[];
  exports: ExportPreference;
  imports: ImportPreference;
  backup: BackupPreference;
  sync: SyncPreference;
  offline: OfflinePreference;
  mobile: MobilePreference;
  desktop: DesktopPreference;
  web: WebPreference;
  api: APIPreference;
  webhooks: WebhookPreference;
  events: EventPreference;
  logging: LoggingPreference;
  monitoring: MonitoringPreference;
  analytics: AnalyticsPreference;
  feedback: FeedbackPreference;
  support: SupportPreference;
  documentation: DocumentationPreference;
  tutorials: TutorialPreference;
  onboarding: OnboardingPreference;
  experiments: ExperimentPreference;
  features: FeaturePreference[];
}

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  user: ActivityUser;
  context: ActivityContext;
  metadata: ActivityMetadata;
  severity: ActivitySeverity;
  category: ActivityCategory;
  tags: string[];
  related: RelatedActivity[];
  actions: ActivityAction[];
  status: ActivityStatus;
  visibility: ActivityVisibility;
  retention: ActivityRetention;
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  priority: NotificationPriority;
  category: NotificationCategory;
  source: NotificationSource;
  target: NotificationTarget;
  actions: NotificationAction[];
  status: NotificationStatus;
  read: boolean;
  dismissed: boolean;
  archived: boolean;
  metadata: NotificationMetadata;
  delivery: NotificationDelivery;
  tracking: NotificationTracking;
  preferences: NotificationPreferences;
  automation: NotificationAutomation;
  escalation: NotificationEscalation;
  grouping: NotificationGrouping;
  batching: NotificationBatching;
  throttling: NotificationThrottling;
  filtering: NotificationFiltering;
  routing: NotificationRouting;
  formatting: NotificationFormatting;
  localization: NotificationLocalization;
  personalization: NotificationPersonalization;
  analytics: NotificationAnalytics;
  feedback: NotificationFeedback;
  compliance: NotificationCompliance;
  security: NotificationSecurity;
  privacy: NotificationPrivacy;
}

// Additional type definitions
type ClassificationVersion = 'v1-manual' | 'v2-ml' | 'v3-ai' | 'orchestration' | 'all';
type ViewType = 'dashboard' | 'table' | 'grid' | 'list' | 'kanban' | 'timeline' | 'calendar' | 'map' | 'chart' | 'graph';
type ActivityType = 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'share' | 'collaborate' | 'analyze' | 'optimize';
type ActivitySeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';
type ActivityCategory = 'user' | 'system' | 'security' | 'performance' | 'compliance' | 'integration' | 'automation';
type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled' | 'archived';
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert' | 'reminder' | 'update' | 'announcement';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
type NotificationCategory = 'system' | 'security' | 'performance' | 'user' | 'business' | 'technical' | 'operational';
type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';
type Theme = 'light' | 'dark' | 'auto' | 'high-contrast' | 'custom';
type OverallStatus = 'healthy' | 'degraded' | 'partial-outage' | 'major-outage' | 'maintenance';

// Constants
const CLASSIFICATION_VERSIONS = [
  {
    id: 'v1-manual',
    name: 'Manual & Rule-Based',
    description: 'Traditional classification with manual rules and policies',
    icon: Settings,
    color: 'blue',
    components: [
      { id: 'framework-manager', name: 'Framework Manager', icon: Building },
      { id: 'rule-engine', name: 'Rule Engine', icon: Zap },
      { id: 'policy-orchestrator', name: 'Policy Orchestrator', icon: Shield },
      { id: 'bulk-operation-center', name: 'Bulk Operation Center', icon: Package },
      { id: 'audit-trail-analyzer', name: 'Audit Trail Analyzer', icon: Search },
      { id: 'compliance-dashboard', name: 'Compliance Dashboard', icon: CheckCircle }
    ]
  },
  {
    id: 'v2-ml',
    name: 'ML-Driven',
    description: 'Machine learning powered classification and analysis',
    icon: Brain,
    color: 'green',
    components: [
      { id: 'ml-model-orchestrator', name: 'ML Model Orchestrator', icon: Network },
      { id: 'training-pipeline-manager', name: 'Training Pipeline Manager', icon: GitBranch },
      { id: 'adaptive-learning-center', name: 'Adaptive Learning Center', icon: TrendingUp },
      { id: 'hyperparameter-optimizer', name: 'Hyperparameter Optimizer', icon: Target },
      { id: 'drift-detection-monitor', name: 'Drift Detection Monitor', icon: AlertTriangle },
      { id: 'feature-engineering-studio', name: 'Feature Engineering Studio', icon: Settings },
      { id: 'model-ensemble-builder', name: 'Model Ensemble Builder', icon: Boxes },
      { id: 'ml-analytics-dashboard', name: 'ML Analytics Dashboard', icon: BarChart3 }
    ]
  },
  {
    id: 'v3-ai',
    name: 'AI-Intelligent',
    description: 'Advanced AI with cognitive processing and reasoning',
    icon: Zap,
    color: 'purple',
    components: [
      { id: 'ai-intelligence-orchestrator', name: 'AI Intelligence Orchestrator', icon: Brain },
      { id: 'conversation-manager', name: 'Conversation Manager', icon: MessageSquare },
      { id: 'explainable-reasoning-viewer', name: 'Explainable Reasoning Viewer', icon: Eye },
      { id: 'auto-tagging-engine', name: 'Auto Tagging Engine', icon: Tag },
      { id: 'workload-optimizer', name: 'Workload Optimizer', icon: Cpu },
      { id: 'real-time-intelligence-stream', name: 'Real-Time Intelligence Stream', icon: Activity },
      { id: 'knowledge-synthesizer', name: 'Knowledge Synthesizer', icon: Lightbulb },
      { id: 'ai-analytics-dashboard', name: 'AI Analytics Dashboard', icon: PieChart }
    ]
  },
  {
    id: 'orchestration',
    name: 'Orchestration',
    description: 'Cross-version coordination and business intelligence',
    icon: Workflow,
    color: 'orange',
    components: [
      { id: 'classification-workflow', name: 'Classification Workflow', icon: GitBranch },
      { id: 'intelligence-coordinator', name: 'Intelligence Coordinator', icon: Network },
      { id: 'business-intelligence-hub', name: 'Business Intelligence Hub', icon: BarChart3 }
    ]
  }
] as const;

const QUICK_ACTIONS = [
  { id: 'new-classification', name: 'New Classification', icon: Plus, shortcut: 'Ctrl+N' },
  { id: 'import-data', name: 'Import Data', icon: Upload, shortcut: 'Ctrl+I' },
  { id: 'export-results', name: 'Export Results', icon: Download, shortcut: 'Ctrl+E' },
  { id: 'run-analysis', name: 'Run Analysis', icon: Play, shortcut: 'Ctrl+R' },
  { id: 'schedule-task', name: 'Schedule Task', icon: Calendar, shortcut: 'Ctrl+S' },
  { id: 'view-reports', name: 'View Reports', icon: FileText, shortcut: 'Ctrl+V' },
  { id: 'manage-models', name: 'Manage Models', icon: Database, shortcut: 'Ctrl+M' },
  { id: 'system-health', name: 'System Health', icon: Monitor, shortcut: 'Ctrl+H' }
] as const;

const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+K', action: 'Open Command Palette', category: 'Navigation' },
  { key: 'Ctrl+/', action: 'Toggle Sidebar', category: 'Navigation' },
  { key: 'Ctrl+B', action: 'Toggle Bookmarks', category: 'Navigation' },
  { key: 'Ctrl+F', action: 'Search', category: 'Search' },
  { key: 'Ctrl+G', action: 'Global Search', category: 'Search' },
  { key: 'Ctrl+N', action: 'New Item', category: 'Actions' },
  { key: 'Ctrl+S', action: 'Save', category: 'Actions' },
  { key: 'Ctrl+Z', action: 'Undo', category: 'Actions' },
  { key: 'Ctrl+Y', action: 'Redo', category: 'Actions' },
  { key: 'Ctrl+D', action: 'Duplicate', category: 'Actions' },
  { key: 'Delete', action: 'Delete Selected', category: 'Actions' },
  { key: 'Ctrl+A', action: 'Select All', category: 'Selection' },
  { key: 'Ctrl+C', action: 'Copy', category: 'Clipboard' },
  { key: 'Ctrl+V', action: 'Paste', category: 'Clipboard' },
  { key: 'Ctrl+X', action: 'Cut', category: 'Clipboard' },
  { key: 'F1', action: 'Help', category: 'System' },
  { key: 'F5', action: 'Refresh', category: 'System' },
  { key: 'F11', action: 'Fullscreen', category: 'View' },
  { key: 'Ctrl+Plus', action: 'Zoom In', category: 'View' },
  { key: 'Ctrl+Minus', action: 'Zoom Out', category: 'View' },
  { key: 'Ctrl+0', action: 'Reset Zoom', category: 'View' }
] as const;

const THEMES = [
  { id: 'light', name: 'Light', description: 'Clean and bright interface' },
  { id: 'dark', name: 'Dark', description: 'Easy on the eyes for long sessions' },
  { id: 'auto', name: 'Auto', description: 'Follows system preference' },
  { id: 'high-contrast', name: 'High Contrast', description: 'Enhanced accessibility' },
  { id: 'custom', name: 'Custom', description: 'Personalized color scheme' }
] as const;

const STATUS_INDICATORS = {
  healthy: { color: 'green', icon: CheckCircle, label: 'All systems operational' },
  degraded: { color: 'yellow', icon: AlertTriangle, label: 'Some systems degraded' },
  'partial-outage': { color: 'orange', icon: AlertTriangle, label: 'Partial service outage' },
  'major-outage': { color: 'red', icon: XCircle, label: 'Major service outage' },
  maintenance: { color: 'blue', icon: Settings, label: 'Scheduled maintenance' }
} as const;

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
] as const;

// ============================================================================
// ADVANCED WORKFLOW ORCHESTRATION ENGINE
// ============================================================================

// Initialize API clients with advanced configuration
const classificationApi = new ClassificationApi({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableCaching: true,
  cacheTimeout: 300000, // 5 minutes
  enableInterceptors: true,
  enableMetrics: true
});

// Advanced Workflow State Management
interface WorkflowOrchestrator {
  executeClassificationWorkflow: (config: ClassificationWorkflowConfig) => Promise<WorkflowExecution>;
  executeMLPipeline: (config: MLPipelineConfig) => Promise<WorkflowExecution>;
  executeAIReasoning: (config: AIReasoningConfig) => Promise<WorkflowExecution>;
  orchestrateMultiVersionWorkflow: (config: MultiVersionWorkflowConfig) => Promise<WorkflowExecution>;
  monitorSystemHealth: () => Promise<SystemHealthMetrics>;
  optimizeResourceAllocation: () => Promise<ResourceOptimizationResult>;
}

interface ClassificationWorkflowConfig {
  type: 'manual' | 'ml' | 'ai' | 'hybrid';
  frameworks: string[];
  rules: string[];
  dataSource: string;
  outputFormat: 'json' | 'csv' | 'xml';
  realTimeProcessing: boolean;
  qualityThreshold: number;
  parallelProcessing: boolean;
  auditEnabled: boolean;
}

interface MLPipelineConfig {
  modelIds: string[];
  trainingData: string;
  validationSplit: number;
  hyperparameterOptimization: boolean;
  ensembleMethod: 'voting' | 'stacking' | 'bagging';
  driftDetection: boolean;
  autoRetraining: boolean;
  performanceThreshold: number;
}

interface AIReasoningConfig {
  conversationContext: string;
  reasoningDepth: 'shallow' | 'deep' | 'comprehensive';
  explainabilityLevel: 'basic' | 'detailed' | 'expert';
  knowledgeSources: string[];
  realTimeInference: boolean;
  confidenceThreshold: number;
  multiAgentCoordination: boolean;
}

interface MultiVersionWorkflowConfig {
  v1Config: ClassificationWorkflowConfig;
  v2Config: MLPipelineConfig;
  v3Config: AIReasoningConfig;
  orchestrationStrategy: 'sequential' | 'parallel' | 'adaptive';
  consensusAlgorithm: 'majority' | 'weighted' | 'confidence-based';
  qualityAssurance: boolean;
}

interface WorkflowExecution {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentStep: string;
  results: any[];
  metrics: ExecutionMetrics;
  errors: ExecutionError[];
  startTime: Date;
  endTime?: Date;
  estimatedCompletion?: Date;
}

interface ExecutionMetrics {
  throughput: number;
  accuracy: number;
  latency: number;
  resourceUsage: ResourceUsage;
  qualityScore: number;
  costEfficiency: number;
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  gpu?: number;
}

interface ExecutionError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  timestamp: Date;
  context: Record<string, any>;
}

interface SystemHealthMetrics {
  overall: 'healthy' | 'degraded' | 'critical';
  services: ServiceHealthStatus[];
  performance: PerformanceMetrics;
  capacity: CapacityMetrics;
  security: SecurityMetrics;
  compliance: ComplianceMetrics;
}

interface ServiceHealthStatus {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  dependencies: string[];
}

interface PerformanceMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number;
  concurrentUsers: number;
}

interface CapacityMetrics {
  cpu: CapacityStatus;
  memory: CapacityStatus;
  storage: CapacityStatus;
  network: CapacityStatus;
  database: CapacityStatus;
}

interface CapacityStatus {
  current: number;
  maximum: number;
  utilization: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  projectedCapacity: number;
}

interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  vulnerabilities: number;
  lastSecurityScan: Date;
  complianceScore: number;
  accessAttempts: AccessAttemptMetrics;
}

interface AccessAttemptMetrics {
  successful: number;
  failed: number;
  blocked: number;
  suspicious: number;
}

interface ComplianceMetrics {
  overallScore: number;
  frameworks: ComplianceFrameworkStatus[];
  violations: ComplianceViolation[];
  lastAudit: Date;
  nextAudit: Date;
}

interface ComplianceFrameworkStatus {
  framework: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  requirements: RequirementStatus[];
}

interface RequirementStatus {
  id: string;
  description: string;
  status: 'met' | 'partial' | 'not-met';
  evidence: string[];
  lastVerified: Date;
}

interface ComplianceViolation {
  id: string;
  framework: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  status: 'open' | 'investigating' | 'resolved';
  assignee: string;
}

interface ResourceOptimizationResult {
  currentAllocation: ResourceAllocation;
  recommendedAllocation: ResourceAllocation;
  potentialSavings: number;
  performanceImpact: number;
  implementationPlan: OptimizationStep[];
  riskAssessment: RiskAssessment;
}

interface ResourceAllocation {
  cpu: AllocationDetail;
  memory: AllocationDetail;
  storage: AllocationDetail;
  network: AllocationDetail;
}

interface AllocationDetail {
  allocated: number;
  utilized: number;
  reserved: number;
  cost: number;
}

interface OptimizationStep {
  id: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  dependencies: string[];
  estimatedSavings: number;
}

interface RiskAssessment {
  overall: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
  mitigation: MitigationStrategy[];
}

interface RiskFactor {
  type: string;
  probability: number;
  impact: number;
  description: string;
}

interface MitigationStrategy {
  risk: string;
  strategy: string;
  effectiveness: number;
  cost: number;
}

// Advanced Workflow Orchestrator Implementation
class AdvancedWorkflowOrchestrator implements WorkflowOrchestrator {
  private executionQueue: Map<string, WorkflowExecution> = new Map();
  private resourceMonitor: ResourceMonitor = new ResourceMonitor();
  private qualityController: QualityController = new QualityController();
  private securityManager: SecurityManager = new SecurityManager();

  async executeClassificationWorkflow(config: ClassificationWorkflowConfig): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      status: 'pending',
      progress: 0,
      currentStep: 'initialization',
      results: [],
      metrics: this.initializeMetrics(),
      errors: [],
      startTime: new Date()
    };

    try {
      execution.status = 'running';
      this.executionQueue.set(execution.id, execution);

      // Step 1: Validate configuration and security
      await this.validateWorkflowConfig(config, execution);
      execution.currentStep = 'validation';
      execution.progress = 10;

      // Step 2: Initialize classification frameworks
      const frameworks = await this.initializeFrameworks(config.frameworks, execution);
      execution.currentStep = 'framework-initialization';
      execution.progress = 25;

      // Step 3: Load and validate rules
      const rules = await this.loadClassificationRules(config.rules, execution);
      execution.currentStep = 'rule-loading';
      execution.progress = 40;

      // Step 4: Process data source
      const processedData = await this.processDataSource(config.dataSource, execution);
      execution.currentStep = 'data-processing';
      execution.progress = 60;

      // Step 5: Execute classification
      const classificationResults = await this.executeClassification(
        frameworks, rules, processedData, config, execution
      );
      execution.currentStep = 'classification-execution';
      execution.progress = 80;

      // Step 6: Quality assurance and validation
      const validatedResults = await this.qualityController.validateResults(
        classificationResults, config.qualityThreshold, execution
      );
      execution.currentStep = 'quality-validation';
      execution.progress = 90;

      // Step 7: Generate output and audit trail
      const finalOutput = await this.generateOutput(validatedResults, config.outputFormat, execution);
      if (config.auditEnabled) {
        await this.generateAuditTrail(execution, config);
      }

      execution.results = finalOutput;
      execution.status = 'completed';
      execution.progress = 100;
      execution.endTime = new Date();
      execution.currentStep = 'completed';

      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.errors.push({
        code: 'WORKFLOW_EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
        recoverable: false,
        timestamp: new Date(),
        context: { config, step: execution.currentStep }
      });
      throw error;
    }
  }

  async executeMLPipeline(config: MLPipelineConfig): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      status: 'running',
      progress: 0,
      currentStep: 'ml-initialization',
      results: [],
      metrics: this.initializeMetrics(),
      errors: [],
      startTime: new Date()
    };

    try {
      // Step 1: Model validation and preparation
      const models = await this.validateMLModels(config.modelIds, execution);
      execution.progress = 15;

      // Step 2: Data preparation and feature engineering
      const preparedData = await this.prepareTrainingData(config.trainingData, execution);
      execution.currentStep = 'data-preparation';
      execution.progress = 30;

      // Step 3: Hyperparameter optimization (if enabled)
      let optimizedParams = {};
      if (config.hyperparameterOptimization) {
        optimizedParams = await this.optimizeHyperparameters(models, preparedData, execution);
        execution.currentStep = 'hyperparameter-optimization';
        execution.progress = 50;
      }

      // Step 4: Model training with ensemble methods
      const trainedModels = await this.trainEnsembleModels(
        models, preparedData, optimizedParams, config, execution
      );
      execution.currentStep = 'model-training';
      execution.progress = 70;

      // Step 5: Validation and performance evaluation
      const validationResults = await this.validateModels(
        trainedModels, config.validationSplit, execution
      );
      execution.currentStep = 'model-validation';
      execution.progress = 85;

      // Step 6: Drift detection setup (if enabled)
      if (config.driftDetection) {
        await this.setupDriftDetection(trainedModels, execution);
      }

      // Step 7: Model deployment and monitoring
      const deploymentResults = await this.deployModels(trainedModels, config, execution);
      execution.results = deploymentResults;
      execution.status = 'completed';
      execution.progress = 100;
      execution.endTime = new Date();

      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.errors.push({
        code: 'ML_PIPELINE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
        recoverable: true,
        timestamp: new Date(),
        context: { config, step: execution.currentStep }
      });
      throw error;
    }
  }

  async executeAIReasoning(config: AIReasoningConfig): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      status: 'running',
      progress: 0,
      currentStep: 'ai-initialization',
      results: [],
      metrics: this.initializeMetrics(),
      errors: [],
      startTime: new Date()
    };

    try {
      // Step 1: Initialize AI agents and knowledge base
      const aiAgents = await this.initializeAIAgents(config, execution);
      execution.progress = 20;

      // Step 2: Load and process knowledge sources
      const knowledgeBase = await this.loadKnowledgeSources(config.knowledgeSources, execution);
      execution.currentStep = 'knowledge-loading';
      execution.progress = 40;

      // Step 3: Execute reasoning workflow
      const reasoningResults = await this.executeReasoningWorkflow(
        aiAgents, knowledgeBase, config, execution
      );
      execution.currentStep = 'reasoning-execution';
      execution.progress = 70;

      // Step 4: Generate explanations and confidence scores
      const explainableResults = await this.generateExplanations(
        reasoningResults, config.explainabilityLevel, execution
      );
      execution.currentStep = 'explanation-generation';
      execution.progress = 90;

      execution.results = explainableResults;
      execution.status = 'completed';
      execution.progress = 100;
      execution.endTime = new Date();

      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.errors.push({
        code: 'AI_REASONING_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
        recoverable: true,
        timestamp: new Date(),
        context: { config, step: execution.currentStep }
      });
      throw error;
    }
  }

  async orchestrateMultiVersionWorkflow(config: MultiVersionWorkflowConfig): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      status: 'running',
      progress: 0,
      currentStep: 'multi-version-orchestration',
      results: [],
      metrics: this.initializeMetrics(),
      errors: [],
      startTime: new Date()
    };

    try {
      let v1Results, v2Results, v3Results;

      if (config.orchestrationStrategy === 'parallel') {
        // Execute all versions in parallel
        const [v1Exec, v2Exec, v3Exec] = await Promise.allSettled([
          this.executeClassificationWorkflow(config.v1Config),
          this.executeMLPipeline(config.v2Config),
          this.executeAIReasoning(config.v3Config)
        ]);

        v1Results = v1Exec.status === 'fulfilled' ? v1Exec.value.results : [];
        v2Results = v2Exec.status === 'fulfilled' ? v2Exec.value.results : [];
        v3Results = v3Exec.status === 'fulfilled' ? v3Exec.value.results : [];

      } else if (config.orchestrationStrategy === 'sequential') {
        // Execute versions sequentially
        const v1Execution = await this.executeClassificationWorkflow(config.v1Config);
        v1Results = v1Execution.results;
        execution.progress = 33;

        const v2Execution = await this.executeMLPipeline(config.v2Config);
        v2Results = v2Execution.results;
        execution.progress = 66;

        const v3Execution = await this.executeAIReasoning(config.v3Config);
        v3Results = v3Execution.results;
        execution.progress = 90;

      } else {
        // Adaptive orchestration based on real-time conditions
        const systemLoad = await this.resourceMonitor.getCurrentLoad();
        if (systemLoad < 0.7) {
          // Low load - execute in parallel
          config.orchestrationStrategy = 'parallel';
          return this.orchestrateMultiVersionWorkflow(config);
        } else {
          // High load - execute sequentially
          config.orchestrationStrategy = 'sequential';
          return this.orchestrateMultiVersionWorkflow(config);
        }
      }

      // Apply consensus algorithm to combine results
      const consensusResults = await this.applyConsensusAlgorithm(
        { v1: v1Results, v2: v2Results, v3: v3Results },
        config.consensusAlgorithm
      );

      // Quality assurance across all versions
      if (config.qualityAssurance) {
        await this.performCrossVersionQA(consensusResults, execution);
      }

      execution.results = consensusResults;
      execution.status = 'completed';
      execution.progress = 100;
      execution.endTime = new Date();

      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.errors.push({
        code: 'MULTI_VERSION_ORCHESTRATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
        recoverable: true,
        timestamp: new Date(),
        context: { config, step: execution.currentStep }
      });
      throw error;
    }
  }

  async monitorSystemHealth(): Promise<SystemHealthMetrics> {
    try {
      // Collect health metrics from all services
      const [servicesHealth, performanceMetrics, capacityMetrics, securityMetrics, complianceMetrics] = await Promise.all([
        this.collectServicesHealth(),
        this.collectPerformanceMetrics(),
        this.collectCapacityMetrics(),
        this.collectSecurityMetrics(),
        this.collectComplianceMetrics()
      ]);

      const overall = this.calculateOverallHealth([
        servicesHealth,
        performanceMetrics,
        capacityMetrics,
        securityMetrics,
        complianceMetrics
      ]);

      return {
        overall,
        services: servicesHealth,
        performance: performanceMetrics,
        capacity: capacityMetrics,
        security: securityMetrics,
        compliance: complianceMetrics
      };

    } catch (error) {
      console.error('System health monitoring failed:', error);
      return {
        overall: 'critical',
        services: [],
        performance: this.getDefaultPerformanceMetrics(),
        capacity: this.getDefaultCapacityMetrics(),
        security: this.getDefaultSecurityMetrics(),
        compliance: this.getDefaultComplianceMetrics()
      };
    }
  }

  async optimizeResourceAllocation(): Promise<ResourceOptimizationResult> {
    try {
      const currentAllocation = await this.getCurrentResourceAllocation();
      const utilizationPatterns = await this.analyzeUtilizationPatterns();
      const workloadPredictions = await this.predictWorkloadTrends();

      const recommendedAllocation = await this.calculateOptimalAllocation(
        currentAllocation,
        utilizationPatterns,
        workloadPredictions
      );

      const potentialSavings = this.calculatePotentialSavings(currentAllocation, recommendedAllocation);
      const performanceImpact = this.assessPerformanceImpact(currentAllocation, recommendedAllocation);
      const implementationPlan = await this.generateImplementationPlan(currentAllocation, recommendedAllocation);
      const riskAssessment = await this.assessOptimizationRisks(currentAllocation, recommendedAllocation);

      return {
        currentAllocation,
        recommendedAllocation,
        potentialSavings,
        performanceImpact,
        implementationPlan,
        riskAssessment
      };

    } catch (error) {
      console.error('Resource optimization failed:', error);
      throw new Error('Failed to optimize resource allocation');
    }
  }

  // Private helper methods
  private generateExecutionId(): string {
    // Generate cryptographically secure execution ID with timestamp and UUID
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const randomString = Array.from(randomBytes, byte => byte.toString(36)).join('').slice(0, 12);
    const machineId = navigator.userAgent.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString(36).slice(0, 4);
    return `exec_${timestamp}_${randomString}_${machineId}`;
  }

  private initializeMetrics(): ExecutionMetrics {
    return {
      throughput: 0,
      accuracy: 0,
      latency: 0,
      resourceUsage: { cpu: 0, memory: 0, network: 0, storage: 0 },
      qualityScore: 0,
      costEfficiency: 0
    };
  }

  private async validateWorkflowConfig(config: ClassificationWorkflowConfig, execution: WorkflowExecution): Promise<void> {
    // Advanced configuration validation with comprehensive checks
    const validationResults = await Promise.all([
      this.validateFrameworkConfiguration(config.frameworks, execution),
      this.validateRuleConfiguration(config.rules, execution),
      this.validateDataSourceAccess(config.dataSource, execution),
      this.validateQualityThresholds(config.qualityThreshold, execution),
      this.validateSecurityRequirements(config, execution),
      this.validateResourceRequirements(config, execution)
    ]);

    // Collect validation errors
    const errors = validationResults.filter(result => !result.isValid);
    if (errors.length > 0) {
      const errorMessages = errors.map(e => e.message).join('; ');
      throw new Error(`Configuration validation failed: ${errorMessages}`);
    }

    // Performance optimization validation
    if (config.parallelProcessing && config.frameworks.length > 10) {
      console.warn('High framework count with parallel processing may impact performance');
      execution.errors.push({
        code: 'PERFORMANCE_WARNING',
        message: 'Consider reducing framework count or disabling parallel processing',
        severity: 'low',
        recoverable: true,
        timestamp: new Date(),
        context: { frameworkCount: config.frameworks.length }
      });
    }

    // Real-time processing validation
    if (config.realTimeProcessing && config.qualityThreshold > 0.95) {
      console.warn('High quality threshold with real-time processing may cause delays');
    }
  }

  private async validateFrameworkConfiguration(frameworks: string[], execution: WorkflowExecution): Promise<{isValid: boolean, message: string}> {
    if (!frameworks || frameworks.length === 0) {
      return { isValid: false, message: 'At least one classification framework must be specified' };
    }

    // Check framework availability and compatibility
    const frameworkValidation = await classificationApi.validateFrameworks(frameworks);
    if (!frameworkValidation.success) {
      return { isValid: false, message: `Framework validation failed: ${frameworkValidation.message}` };
    }

    // Check for framework conflicts
    const conflicts = await classificationApi.checkFrameworkConflicts(frameworks);
    if (conflicts.success && conflicts.data.hasConflicts) {
      return { isValid: false, message: `Framework conflicts detected: ${conflicts.data.conflicts.join(', ')}` };
    }

    return { isValid: true, message: 'Framework configuration valid' };
  }

  private async validateRuleConfiguration(rules: string[], execution: WorkflowExecution): Promise<{isValid: boolean, message: string}> {
    if (!rules || rules.length === 0) {
      return { isValid: true, message: 'No rules specified - using default rules' };
    }

    // Validate rule syntax and dependencies
    const ruleValidation = await classificationApi.validateRules(rules);
    if (!ruleValidation.success) {
      return { isValid: false, message: `Rule validation failed: ${ruleValidation.message}` };
    }

    // Check rule performance impact
    const performanceAnalysis = await classificationApi.analyzeRulePerformance(rules);
    if (performanceAnalysis.success && performanceAnalysis.data.estimatedLatency > 5000) {
      execution.errors.push({
        code: 'RULE_PERFORMANCE_WARNING',
        message: `High rule complexity may cause delays (estimated: ${performanceAnalysis.data.estimatedLatency}ms)`,
        severity: 'medium',
        recoverable: true,
        timestamp: new Date(),
        context: { estimatedLatency: performanceAnalysis.data.estimatedLatency }
      });
    }

    return { isValid: true, message: 'Rule configuration valid' };
  }

  private async validateDataSourceAccess(dataSource: string, execution: WorkflowExecution): Promise<{isValid: boolean, message: string}> {
    // Validate data source accessibility and permissions
    const accessValidation = await classificationApi.validateDataSourceAccess(dataSource);
    if (!accessValidation.success) {
      return { isValid: false, message: `Data source access validation failed: ${accessValidation.message}` };
    }

    // Check data source schema compatibility
    const schemaValidation = await classificationApi.validateDataSourceSchema(dataSource);
    if (!schemaValidation.success) {
      return { isValid: false, message: `Data source schema validation failed: ${schemaValidation.message}` };
    }

    return { isValid: true, message: 'Data source access valid' };
  }

  private async validateQualityThresholds(threshold: number, execution: WorkflowExecution): Promise<{isValid: boolean, message: string}> {
    if (threshold < 0 || threshold > 1) {
      return { isValid: false, message: 'Quality threshold must be between 0 and 1' };
    }

    // Validate threshold against historical performance
    const historicalPerformance = await classificationApi.getHistoricalPerformance();
    if (historicalPerformance.success) {
      const avgAccuracy = historicalPerformance.data.averageAccuracy;
      if (threshold > avgAccuracy + 0.1) {
        execution.errors.push({
          code: 'THRESHOLD_WARNING',
          message: `Quality threshold (${threshold}) significantly higher than historical average (${avgAccuracy})`,
          severity: 'medium',
          recoverable: true,
          timestamp: new Date(),
          context: { threshold, historicalAverage: avgAccuracy }
        });
      }
    }

    return { isValid: true, message: 'Quality threshold valid' };
  }

  private async validateSecurityRequirements(config: ClassificationWorkflowConfig, execution: WorkflowExecution): Promise<{isValid: boolean, message: string}> {
    // Comprehensive security validation
    const securityValidation = await this.securityManager.validateWorkflowConfig(config);
    if (!securityValidation.isValid) {
      return { isValid: false, message: securityValidation.message };
    }

    // Check data sensitivity requirements
    const sensitivityCheck = await classificationApi.checkDataSensitivity(config.dataSource);
    if (sensitivityCheck.success && sensitivityCheck.data.requiresAudit && !config.auditEnabled) {
      return { isValid: false, message: 'Audit trail required for sensitive data sources' };
    }

    return { isValid: true, message: 'Security requirements satisfied' };
  }

  private async validateResourceRequirements(config: ClassificationWorkflowConfig, execution: WorkflowExecution): Promise<{isValid: boolean, message: string}> {
    // Estimate resource requirements
    const resourceEstimate = await classificationApi.estimateResourceRequirements({
      frameworks: config.frameworks,
      rules: config.rules,
      dataSource: config.dataSource,
      parallelProcessing: config.parallelProcessing
    });

    if (!resourceEstimate.success) {
      return { isValid: false, message: 'Failed to estimate resource requirements' };
    }

    // Check available resources
    const availableResources = await classificationApi.getAvailableResources();
    if (availableResources.success) {
      const required = resourceEstimate.data;
      const available = availableResources.data;

      if (required.cpu > available.cpu * 0.8) {
        return { isValid: false, message: 'Insufficient CPU resources available' };
      }
      if (required.memory > available.memory * 0.8) {
        return { isValid: false, message: 'Insufficient memory resources available' };
      }
    }

    return { isValid: true, message: 'Resource requirements satisfied' };
  }

  private async initializeFrameworks(frameworkIds: string[], execution: WorkflowExecution): Promise<any[]> {
    const frameworks = [];
    for (const id of frameworkIds) {
      const framework = await classificationApi.getFramework(id);
      if (framework.success) {
        frameworks.push(framework.data);
      } else {
        execution.errors.push({
          code: 'FRAMEWORK_LOAD_FAILED',
          message: `Failed to load framework ${id}`,
          severity: 'medium',
          recoverable: true,
          timestamp: new Date(),
          context: { frameworkId: id }
        });
      }
    }
    return frameworks;
  }

  private async loadClassificationRules(ruleIds: string[], execution: WorkflowExecution): Promise<any[]> {
    const rules = [];
    for (const id of ruleIds) {
      const rule = await classificationApi.getRule(id);
      if (rule.success) {
        rules.push(rule.data);
      }
    }
    return rules;
  }

  private async processDataSource(dataSource: string, execution: WorkflowExecution): Promise<any> {
    // Advanced data source processing with intelligent preprocessing
    try {
      // Step 1: Retrieve data source metadata and configuration
      const sourceMetadata = await classificationApi.getDataSourceMetadata(dataSource);
      if (!sourceMetadata.success) {
        throw new Error(`Failed to retrieve data source metadata: ${sourceMetadata.message}`);
      }

      // Step 2: Intelligent data preprocessing based on source type
      const preprocessingConfig = await this.determinePreprocessingStrategy(sourceMetadata.data);
      
      // Step 3: Apply data transformations and cleaning
      const preprocessedData = await classificationApi.preprocessData({
        dataSource: dataSource,
        config: preprocessingConfig,
        includeMetadata: true,
        validateSchema: true
      });

      if (!preprocessedData.success) {
        throw new Error(`Data preprocessing failed: ${preprocessedData.message}`);
      }

      // Step 4: Data quality assessment
      const qualityMetrics = await classificationApi.assessDataQuality(preprocessedData.data);
      if (qualityMetrics.success) {
        execution.metrics.qualityScore = qualityMetrics.data.overallScore;
        
        // Add quality warnings if needed
        if (qualityMetrics.data.overallScore < 0.8) {
          execution.errors.push({
            code: 'DATA_QUALITY_WARNING',
            message: `Data quality score (${qualityMetrics.data.overallScore}) below recommended threshold`,
            severity: 'medium',
            recoverable: true,
            timestamp: new Date(),
            context: { qualityMetrics: qualityMetrics.data }
          });
        }
      }

      // Step 5: Data sampling for large datasets
      const sampledData = await this.applySamplingStrategy(preprocessedData.data, execution);

      // Step 6: Feature extraction and enrichment
      const enrichedData = await classificationApi.enrichData({
        data: sampledData,
        extractFeatures: true,
        includeStatistics: true,
        generateEmbeddings: true
      });

      return enrichedData.success ? enrichedData.data : sampledData;

    } catch (error) {
      execution.errors.push({
        code: 'DATA_PROCESSING_FAILED',
        message: `Data source processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high',
        recoverable: false,
        timestamp: new Date(),
        context: { dataSource }
      });
      throw error;
    }
  }

  private async determinePreprocessingStrategy(metadata: any): Promise<any> {
    // Intelligent preprocessing strategy based on data characteristics
    const strategy = {
      cleaningRules: [],
      transformations: [],
      validationRules: [],
      optimizations: []
    };

    // Determine cleaning rules based on data type and quality
    if (metadata.dataType === 'text') {
      strategy.cleaningRules.push('remove_duplicates', 'normalize_whitespace', 'handle_encoding');
    }
    if (metadata.dataType === 'structured') {
      strategy.cleaningRules.push('validate_schema', 'handle_missing_values', 'normalize_formats');
    }

    // Add transformations based on size and complexity
    if (metadata.size > 1000000) { // Large dataset
      strategy.transformations.push('parallel_processing', 'chunked_processing');
    }
    if (metadata.complexity === 'high') {
      strategy.transformations.push('feature_extraction', 'dimensionality_reduction');
    }

    // Performance optimizations
    if (metadata.estimatedProcessingTime > 300000) { // > 5 minutes
      strategy.optimizations.push('caching', 'incremental_processing');
    }

    return strategy;
  }

  private async applySamplingStrategy(data: any, execution: WorkflowExecution): Promise<any> {
    // Intelligent sampling for large datasets
    const dataSize = Array.isArray(data) ? data.length : (data.records ? data.records.length : 0);
    
    if (dataSize <= 10000) {
      return data; // No sampling needed for small datasets
    }

    // Determine optimal sample size based on data characteristics
    const sampleSize = Math.min(
      Math.max(1000, Math.ceil(dataSize * 0.1)), // At least 1000 or 10% of data
      50000 // Maximum 50k samples
    );

    const samplingResult = await classificationApi.sampleData({
      data: data,
      sampleSize: sampleSize,
      method: 'stratified', // Maintain data distribution
      preserveRareClasses: true
    });

    if (samplingResult.success) {
      execution.errors.push({
        code: 'DATA_SAMPLED',
        message: `Dataset sampled from ${dataSize} to ${sampleSize} records for processing efficiency`,
        severity: 'low',
        recoverable: true,
        timestamp: new Date(),
        context: { originalSize: dataSize, sampleSize: sampleSize }
      });
      
      return samplingResult.data;
    }

    return data; // Return original data if sampling fails
  }

  private async executeClassification(frameworks: any[], rules: any[], data: any, config: ClassificationWorkflowConfig, execution: WorkflowExecution): Promise<any[]> {
    const results = [];
    
    if (config.parallelProcessing) {
      // Execute classifications in parallel
      const promises = frameworks.map(framework => 
        this.classifyWithFramework(framework, rules, data, config)
      );
      const parallelResults = await Promise.allSettled(promises);
      
      parallelResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          execution.errors.push({
            code: 'PARALLEL_CLASSIFICATION_FAILED',
            message: `Framework ${frameworks[index].id} failed: ${result.reason}`,
            severity: 'medium',
            recoverable: true,
            timestamp: new Date(),
            context: { frameworkId: frameworks[index].id }
          });
        }
      });
    } else {
      // Execute classifications sequentially
      for (const framework of frameworks) {
        try {
          const frameworkResults = await this.classifyWithFramework(framework, rules, data, config);
          results.push(...frameworkResults);
        } catch (error) {
          execution.errors.push({
            code: 'SEQUENTIAL_CLASSIFICATION_FAILED',
            message: `Framework ${framework.id} failed: ${error}`,
            severity: 'medium',
            recoverable: true,
            timestamp: new Date(),
            context: { frameworkId: framework.id }
          });
        }
      }
    }
    
    return results;
  }

  private async classifyWithFramework(framework: any, rules: any[], data: any, config: ClassificationWorkflowConfig): Promise<any[]> {
    // Advanced framework-specific classification with intelligent optimization
    try {
      // Step 1: Framework-specific preprocessing
      const frameworkData = await this.prepareDataForFramework(framework, data);
      
      // Step 2: Rule optimization and ordering
      const optimizedRules = await this.optimizeRulesForFramework(framework, rules);
      
      // Step 3: Dynamic batch sizing based on framework capabilities
      const batchSize = await this.calculateOptimalBatchSize(framework, frameworkData.length);
      
      // Step 4: Execute classification with monitoring
      const executionConfig = {
        frameworkId: framework.id,
        rules: optimizedRules.map(r => r.id),
        data: frameworkData,
        realTime: config.realTimeProcessing,
        qualityThreshold: config.qualityThreshold,
        batchSize: batchSize,
        enableMetrics: true,
        enableCaching: framework.supportsCaching,
        timeoutMs: config.realTimeProcessing ? 30000 : 300000
      };

      const results = await classificationApi.executeClassification(executionConfig);
      
      if (!results.success) {
        throw new Error(`Classification failed: ${results.message}`);
      }

      // Step 5: Post-process results with confidence scoring
      const enhancedResults = await this.enhanceClassificationResults(
        results.data, 
        framework, 
        config.qualityThreshold
      );

      // Step 6: Performance metrics collection
      await this.collectFrameworkMetrics(framework.id, enhancedResults, executionConfig);

      return enhancedResults;

    } catch (error) {
      console.error(`Framework ${framework.id} classification failed:`, error);
      
      // Attempt fallback classification if available
      if (framework.fallbackEnabled) {
        const fallbackResults = await this.executeFallbackClassification(framework, rules, data, config);
        return fallbackResults;
      }
      
      return [];
    }
  }

  private async prepareDataForFramework(framework: any, data: any): Promise<any> {
    // Framework-specific data preparation
    if (framework.type === 'nlp') {
      return await classificationApi.prepareTextData({
        data: data,
        tokenize: true,
        removeStopWords: framework.removeStopWords,
        stemming: framework.enableStemming,
        encoding: framework.preferredEncoding
      });
    } else if (framework.type === 'structured') {
      return await classificationApi.prepareStructuredData({
        data: data,
        normalizeColumns: true,
        handleMissingValues: framework.missingValueStrategy,
        scaleFeatures: framework.featureScaling
      });
    } else if (framework.type === 'image') {
      return await classificationApi.prepareImageData({
        data: data,
        resize: framework.imageSize,
        normalize: true,
        augment: framework.dataAugmentation
      });
    }
    
    return data;
  }

  private async optimizeRulesForFramework(framework: any, rules: any[]): Promise<any[]> {
    // Intelligent rule optimization based on framework capabilities
    const ruleOptimization = await classificationApi.optimizeRules({
      frameworkId: framework.id,
      rules: rules,
      optimizationLevel: 'aggressive',
      considerPerformance: true,
      maintainAccuracy: true
    });

    if (ruleOptimization.success) {
      return ruleOptimization.data.optimizedRules;
    }

    // Fallback: order rules by estimated performance
    return rules.sort((a, b) => (b.estimatedPerformance || 0) - (a.estimatedPerformance || 0));
  }

  private async calculateOptimalBatchSize(framework: any, dataSize: number): Promise<number> {
    // Dynamic batch size calculation based on framework and data characteristics
    const frameworkCapabilities = await classificationApi.getFrameworkCapabilities(framework.id);
    
    if (frameworkCapabilities.success) {
      const capabilities = frameworkCapabilities.data;
      const maxBatchSize = capabilities.maxBatchSize || 1000;
      const recommendedBatchSize = capabilities.recommendedBatchSize || 100;
      
      // Calculate optimal batch size based on available memory and data size
      const memoryBasedBatch = Math.floor(capabilities.availableMemory / capabilities.memoryPerItem);
      const optimalBatch = Math.min(maxBatchSize, Math.max(recommendedBatchSize, memoryBasedBatch));
      
      return Math.min(optimalBatch, dataSize);
    }

    // Default batch sizing strategy
    if (dataSize < 100) return dataSize;
    if (dataSize < 1000) return 100;
    if (dataSize < 10000) return 500;
    return 1000;
  }

  private async enhanceClassificationResults(results: any[], framework: any, qualityThreshold: number): Promise<any[]> {
    // Post-processing and enhancement of classification results
    const enhancedResults = [];

    for (const result of results) {
      const enhanced = {
        ...result,
        framework: framework.id,
        confidence: result.confidence || 0,
        metadata: {
          ...result.metadata,
          processingTime: result.processingTime,
          qualityScore: result.qualityScore || 0,
          enhancementTimestamp: new Date().toISOString()
        }
      };

      // Apply confidence calibration
      if (framework.confidenceCalibration) {
        enhanced.confidence = await this.calibrateConfidence(enhanced.confidence, framework);
      }

      // Quality filtering
      if (enhanced.confidence >= qualityThreshold) {
        enhancedResults.push(enhanced);
      }
    }

    return enhancedResults;
  }

  private async calibrateConfidence(rawConfidence: number, framework: any): Promise<number> {
    // Confidence calibration based on framework historical performance
    const calibration = await classificationApi.getConfidenceCalibration(framework.id);
    
    if (calibration.success && calibration.data.calibrationFunction) {
      // Apply calibration function
      return calibration.data.calibrationFunction(rawConfidence);
    }

    // Default calibration: no change
    return rawConfidence;
  }

  private async collectFrameworkMetrics(frameworkId: string, results: any[], config: any): Promise<void> {
    // Collect and store framework performance metrics
    const metrics = {
      frameworkId: frameworkId,
      executionTime: Date.now() - config.startTime,
      resultCount: results.length,
      averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
      qualityScore: results.reduce((sum, r) => sum + (r.metadata?.qualityScore || 0), 0) / results.length,
      memoryUsage: config.memoryUsage,
      cpuUsage: config.cpuUsage,
      timestamp: new Date().toISOString()
    };

    await classificationApi.recordFrameworkMetrics(metrics);
  }

  private async executeFallbackClassification(framework: any, rules: any[], data: any, config: ClassificationWorkflowConfig): Promise<any[]> {
    // Fallback classification strategy when primary framework fails
    console.warn(`Executing fallback classification for framework ${framework.id}`);
    
    const fallbackFramework = await classificationApi.getFallbackFramework(framework.id);
    if (fallbackFramework.success) {
      return await this.classifyWithFramework(fallbackFramework.data, rules, data, config);
    }

    // Last resort: simple rule-based classification
    const simpleResults = await classificationApi.executeSimpleClassification({
      rules: rules.map(r => r.id),
      data: data,
      qualityThreshold: config.qualityThreshold * 0.8 // Lower threshold for fallback
    });

    return simpleResults.success ? simpleResults.data : [];
  }

  private async generateOutput(results: any[], format: string, execution: WorkflowExecution): Promise<any[]> {
    // Advanced output generation with intelligent formatting and optimization
    try {
      // Add metadata to results
      const enrichedResults = results.map(result => ({
        ...result,
        exportMetadata: {
          exportTimestamp: new Date().toISOString(),
          executionId: execution.id,
          format: format,
          version: '2.0',
          totalResults: results.length
        }
      }));

      switch (format.toLowerCase()) {
        case 'json':
          return await this.generateJSONOutput(enrichedResults, execution);
        case 'csv':
          return await this.generateCSVOutput(enrichedResults, execution);
        case 'xml':
          return await this.generateXMLOutput(enrichedResults, execution);
        case 'excel':
        case 'xlsx':
          return await this.generateExcelOutput(enrichedResults, execution);
        case 'parquet':
          return await this.generateParquetOutput(enrichedResults, execution);
        case 'avro':
          return await this.generateAvroOutput(enrichedResults, execution);
        default:
          console.warn(`Unsupported format: ${format}, defaulting to JSON`);
          return await this.generateJSONOutput(enrichedResults, execution);
      }
    } catch (error) {
      execution.errors.push({
        code: 'OUTPUT_GENERATION_FAILED',
        message: `Failed to generate ${format} output: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high',
        recoverable: true,
        timestamp: new Date(),
        context: { format, resultCount: results.length }
      });
      
      // Fallback to JSON format
      return results;
    }
  }

  private async generateJSONOutput(results: any[], execution: WorkflowExecution): Promise<any[]> {
    // Enhanced JSON output with schema validation and optimization
    const jsonOutput = {
      metadata: {
        executionId: execution.id,
        timestamp: new Date().toISOString(),
        resultCount: results.length,
        format: 'json',
        schema: 'classification-results-v2.0'
      },
      summary: {
        totalResults: results.length,
        averageConfidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length,
        uniqueLabels: [...new Set(results.map(r => r.label))].length,
        processingTime: execution.endTime ? 
          new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime() : 0
      },
      results: results
    };

    // Validate JSON schema
    const validation = await classificationApi.validateOutputSchema(jsonOutput, 'json');
    if (validation.success && !validation.data.isValid) {
      execution.errors.push({
        code: 'SCHEMA_VALIDATION_WARNING',
        message: 'Output schema validation failed, but continuing with generation',
        severity: 'low',
        recoverable: true,
        timestamp: new Date(),
        context: { validationErrors: validation.data.errors }
      });
    }

    return [jsonOutput];
  }

  private async generateCSVOutput(results: any[], execution: WorkflowExecution): Promise<any[]> {
    // Advanced CSV generation with intelligent column mapping
    if (results.length === 0) {
      return ['id,label,confidence,timestamp\n']; // Header only
    }

    // Analyze data structure to determine optimal columns
    const columnAnalysis = await this.analyzeResultsStructure(results);
    const columns = columnAnalysis.recommendedColumns;

    // Generate header
    let csvContent = columns.join(',') + '\n';

    // Generate rows with proper escaping and formatting
    for (const result of results) {
      const row = columns.map(column => {
        let value = this.getNestedValue(result, column);
        
        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        if (typeof value === 'string') {
          // Escape CSV special characters
          value = value.replace(/"/g, '""');
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value}"`;
          }
        }
        
        return value;
      });
      
      csvContent += row.join(',') + '\n';
    }

    // Add metadata as comments
    const metadata = [
      `# Classification Results Export`,
      `# Execution ID: ${execution.id}`,
      `# Timestamp: ${new Date().toISOString()}`,
      `# Total Results: ${results.length}`,
      `# Columns: ${columns.length}`,
      ''
    ].join('\n');

    return [metadata + csvContent];
  }

  private async generateXMLOutput(results: any[], execution: WorkflowExecution): Promise<any[]> {
    // Advanced XML generation with schema compliance
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<classificationResults>\n';
    
    // Add metadata
    xmlContent += '  <metadata>\n';
    xmlContent += `    <executionId>${execution.id}</executionId>\n`;
    xmlContent += `    <timestamp>${new Date().toISOString()}</timestamp>\n`;
    xmlContent += `    <resultCount>${results.length}</resultCount>\n`;
    xmlContent += `    <format>xml</format>\n`;
    xmlContent += '  </metadata>\n';
    
    // Add results
    xmlContent += '  <results>\n';
    for (const result of results) {
      xmlContent += '    <result>\n';
      xmlContent += this.objectToXML(result, '      ');
      xmlContent += '    </result>\n';
    }
    xmlContent += '  </results>\n';
    xmlContent += '</classificationResults>';

    // Validate XML structure
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        throw new Error('Invalid XML structure generated');
      }
    } catch (error) {
      execution.errors.push({
        code: 'XML_VALIDATION_FAILED',
        message: `XML validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'medium',
        recoverable: true,
        timestamp: new Date(),
        context: { xmlLength: xmlContent.length }
      });
    }

    return [xmlContent];
  }

  private async generateExcelOutput(results: any[], execution: WorkflowExecution): Promise<any[]> {
    // Generate Excel-compatible format (will be processed by backend)
    const excelData = {
      metadata: {
        executionId: execution.id,
        timestamp: new Date().toISOString(),
        format: 'excel'
      },
      sheets: [
        {
          name: 'Classification Results',
          data: results,
          formatting: {
            headers: true,
            autoFilter: true,
            freezePane: { row: 1, column: 0 }
          }
        },
        {
          name: 'Summary',
          data: [
            { metric: 'Total Results', value: results.length },
            { metric: 'Average Confidence', value: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length },
            { metric: 'Unique Labels', value: [...new Set(results.map(r => r.label))].length },
            { metric: 'Execution Time', value: execution.endTime ? 
              new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime() : 0 }
          ]
        }
      ]
    };

    return [excelData];
  }

  private async generateParquetOutput(results: any[], execution: WorkflowExecution): Promise<any[]> {
    // Generate Parquet-compatible format (optimized for big data)
    const parquetData = {
      metadata: {
        executionId: execution.id,
        timestamp: new Date().toISOString(),
        format: 'parquet',
        schema: await this.generateParquetSchema(results)
      },
      data: results,
      compression: 'snappy',
      encoding: 'utf8'
    };

    return [parquetData];
  }

  private async generateAvroOutput(results: any[], execution: WorkflowExecution): Promise<any[]> {
    // Generate Avro-compatible format (schema evolution support)
    const avroSchema = await this.generateAvroSchema(results);
    
    const avroData = {
      metadata: {
        executionId: execution.id,
        timestamp: new Date().toISOString(),
        format: 'avro'
      },
      schema: avroSchema,
      data: results
    };

    return [avroData];
  }

  private async analyzeResultsStructure(results: any[]): Promise<{ recommendedColumns: string[] }> {
    // Analyze data structure to determine optimal column layout
    const allKeys = new Set<string>();
    const keyFrequency = new Map<string, number>();

    // Collect all possible keys
    results.forEach(result => {
      this.collectKeys(result, '', allKeys, keyFrequency);
    });

    // Sort keys by frequency and importance
    const sortedKeys = Array.from(keyFrequency.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .map(([key]) => key);

    // Prioritize important fields
    const priorityFields = ['id', 'label', 'confidence', 'timestamp', 'category', 'score'];
    const recommendedColumns = [
      ...priorityFields.filter(field => sortedKeys.includes(field)),
      ...sortedKeys.filter(key => !priorityFields.includes(key)).slice(0, 20) // Limit to 20 additional columns
    ];

    return { recommendedColumns };
  }

  private collectKeys(obj: any, prefix: string, allKeys: Set<string>, frequency: Map<string, number>): void {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        allKeys.add(fullKey);
        frequency.set(fullKey, (frequency.get(fullKey) || 0) + 1);
        
        // Recursively collect nested keys (max depth 3)
        if (prefix.split('.').length < 3) {
          this.collectKeys(obj[key], fullKey, allKeys, frequency);
        }
      });
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private objectToXML(obj: any, indent: string): string {
    let xml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      
      if (value === null || value === undefined) {
        xml += `${indent}<${sanitizedKey}></${sanitizedKey}>\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        xml += `${indent}<${sanitizedKey}>\n`;
        xml += this.objectToXML(value, indent + '  ');
        xml += `${indent}</${sanitizedKey}>\n`;
      } else if (Array.isArray(value)) {
        xml += `${indent}<${sanitizedKey}>\n`;
        value.forEach((item, index) => {
          xml += `${indent}  <item index="${index}">\n`;
          if (typeof item === 'object') {
            xml += this.objectToXML(item, indent + '    ');
          } else {
            xml += `${indent}    ${this.escapeXML(String(item))}\n`;
          }
          xml += `${indent}  </item>\n`;
        });
        xml += `${indent}</${sanitizedKey}>\n`;
      } else {
        xml += `${indent}<${sanitizedKey}>${this.escapeXML(String(value))}</${sanitizedKey}>\n`;
      }
    }
    
    return xml;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private async generateParquetSchema(results: any[]): Promise<any> {
    // Generate Parquet schema based on data structure
    if (results.length === 0) return null;
    
    const sampleResult = results[0];
    const schema = {
      type: 'record',
      name: 'ClassificationResult',
      fields: []
    };

    // Analyze field types from sample data
    for (const [key, value] of Object.entries(sampleResult)) {
      let fieldType = 'string'; // Default type
      
      if (typeof value === 'number') {
        fieldType = Number.isInteger(value) ? 'int64' : 'double';
      } else if (typeof value === 'boolean') {
        fieldType = 'boolean';
      } else if (value instanceof Date) {
        fieldType = 'timestamp';
      }

      schema.fields.push({
        name: key,
        type: fieldType,
        nullable: true
      });
    }

    return schema;
  }

  private async generateAvroSchema(results: any[]): Promise<any> {
    // Generate Avro schema with evolution support
    if (results.length === 0) return null;
    
    return {
      type: 'record',
      name: 'ClassificationResult',
      namespace: 'com.enterprise.classification',
      doc: 'Classification result schema with evolution support',
      fields: [
        { name: 'id', type: ['null', 'string'], default: null },
        { name: 'label', type: ['null', 'string'], default: null },
        { name: 'confidence', type: ['null', 'double'], default: null },
        { name: 'timestamp', type: ['null', 'string'], default: null },
        { name: 'metadata', type: ['null', { type: 'map', values: 'string' }], default: null },
        { name: 'framework', type: ['null', 'string'], default: null },
        { name: 'version', type: 'string', default: '1.0' }
      ]
    };
  }

  private async generateAuditTrail(execution: WorkflowExecution, config: ClassificationWorkflowConfig): Promise<void> {
    await classificationApi.createAuditEntry({
      executionId: execution.id,
      type: 'classification_workflow',
      config: config,
      results: execution.results,
      metrics: execution.metrics,
      timestamp: new Date()
    });
  }

  // Additional helper methods for ML Pipeline
  private async validateMLModels(modelIds: string[], execution: WorkflowExecution): Promise<any[]> {
    const models = [];
    for (const id of modelIds) {
      const model = await mlApi.getMLModel(id);
      if (model.success) {
        models.push(model.data);
      }
    }
    return models;
  }

  private async prepareTrainingData(dataSource: string, execution: WorkflowExecution): Promise<any> {
    const data = await mlApi.prepareTrainingData({ dataSource });
    return data.success ? data.data : null;
  }

  private async optimizeHyperparameters(models: any[], data: any, execution: WorkflowExecution): Promise<any> {
    const optimization = await mlApi.optimizeHyperparameters({
      models: models.map(m => m.id),
      trainingData: data
    });
    return optimization.success ? optimization.data : {};
  }

  private async trainEnsembleModels(models: any[], data: any, params: any, config: MLPipelineConfig, execution: WorkflowExecution): Promise<any[]> {
    const trainingJobs = [];
    for (const model of models) {
      const job = await mlApi.startTraining({
        modelId: model.id,
        trainingData: data,
        hyperparameters: params,
        ensembleMethod: config.ensembleMethod
      });
      if (job.success) {
        trainingJobs.push(job.data);
      }
    }
    return trainingJobs;
  }

  private async validateModels(models: any[], validationSplit: number, execution: WorkflowExecution): Promise<any[]> {
    const validationResults = [];
    for (const model of models) {
      const validation = await mlApi.validateModel({
        modelId: model.id,
        validationSplit
      });
      if (validation.success) {
        validationResults.push(validation.data);
      }
    }
    return validationResults;
  }

  private async setupDriftDetection(models: any[], execution: WorkflowExecution): Promise<void> {
    for (const model of models) {
      await mlApi.setupDriftDetection({
        modelId: model.id,
        monitoringInterval: 3600, // 1 hour
        alertThreshold: 0.1
      });
    }
  }

  private async deployModels(models: any[], config: MLPipelineConfig, execution: WorkflowExecution): Promise<any[]> {
    const deployments = [];
    for (const model of models) {
      const deployment = await mlApi.deployModel({
        modelId: model.id,
        environment: 'production',
        autoScaling: true,
        performanceThreshold: config.performanceThreshold
      });
      if (deployment.success) {
        deployments.push(deployment.data);
      }
    }
    return deployments;
  }

  // Additional helper methods for AI Reasoning
  private async initializeAIAgents(config: AIReasoningConfig, execution: WorkflowExecution): Promise<any[]> {
    const agents = await aiApi.initializeAgents({
      conversationContext: config.conversationContext,
      reasoningDepth: config.reasoningDepth,
      multiAgentCoordination: config.multiAgentCoordination
    });
    return agents.success ? agents.data : [];
  }

  private async loadKnowledgeSources(sources: string[], execution: WorkflowExecution): Promise<any> {
    const knowledgeBase = await aiApi.loadKnowledgeBase({
      sources: sources
    });
    return knowledgeBase.success ? knowledgeBase.data : null;
  }

  private async executeReasoningWorkflow(agents: any[], knowledgeBase: any, config: AIReasoningConfig, execution: WorkflowExecution): Promise<any[]> {
    const reasoning = await aiApi.executeReasoning({
      agents: agents.map(a => a.id),
      knowledgeBase: knowledgeBase.id,
      confidenceThreshold: config.confidenceThreshold,
      realTimeInference: config.realTimeInference
    });
    return reasoning.success ? reasoning.data : [];
  }

  private async generateExplanations(results: any[], level: string, execution: WorkflowExecution): Promise<any[]> {
    const explanations = await aiApi.generateExplanations({
      results: results,
      explainabilityLevel: level
    });
    return explanations.success ? explanations.data : results;
  }

  // Multi-version orchestration helpers
  private async applyConsensusAlgorithm(results: any, algorithm: string): Promise<any[]> {
    switch (algorithm) {
      case 'majority':
        return this.majorityConsensus(results);
      case 'weighted':
        return this.weightedConsensus(results);
      case 'confidence-based':
        return this.confidenceBasedConsensus(results);
      default:
        return this.majorityConsensus(results);
    }
  }

  private majorityConsensus(results: any): any[] {
    // Implement majority voting consensus
    return results.v1.concat(results.v2).concat(results.v3);
  }

  private weightedConsensus(results: any): any[] {
    // Implement weighted consensus based on historical accuracy
    return results.v1.concat(results.v2).concat(results.v3);
  }

  private confidenceBasedConsensus(results: any): any[] {
    // Implement confidence-based consensus
    return results.v1.concat(results.v2).concat(results.v3);
  }

  private async performCrossVersionQA(results: any[], execution: WorkflowExecution): Promise<void> {
    // Implement cross-version quality assurance
    const qaResults = await this.qualityController.performCrossVersionQA(results);
    execution.metrics.qualityScore = qaResults.overallScore;
  }

  // System health monitoring helpers
  private async collectServicesHealth(): Promise<ServiceHealthStatus[]> {
    const services = await classificationApi.getSystemHealth();
    return services.success ? services.data.services : [];
  }

  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics = await classificationApi.getPerformanceMetrics();
    return metrics.success ? metrics.data : this.getDefaultPerformanceMetrics();
  }

  private async collectCapacityMetrics(): Promise<CapacityMetrics> {
    const capacity = await classificationApi.getCapacityMetrics();
    return capacity.success ? capacity.data : this.getDefaultCapacityMetrics();
  }

  private async collectSecurityMetrics(): Promise<SecurityMetrics> {
    const security = await this.securityManager.getSecurityMetrics();
    return security;
  }

  private async collectComplianceMetrics(): Promise<ComplianceMetrics> {
    const compliance = await classificationApi.getComplianceMetrics();
    return compliance.success ? compliance.data : this.getDefaultComplianceMetrics();
  }

  private calculateOverallHealth(metrics: any[]): 'healthy' | 'degraded' | 'critical' {
    // Implement overall health calculation logic
    const healthScores = metrics.map(m => this.getHealthScore(m));
    const averageScore = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    
    if (averageScore >= 0.8) return 'healthy';
    if (averageScore >= 0.6) return 'degraded';
    return 'critical';
  }

  private getHealthScore(metric: any): number {
    // Advanced health score calculation with weighted metrics
    if (!metric) return 0;
    
    let score = 0;
    let weightSum = 0;
    
    // Service availability weight: 40%
    if (metric.services && Array.isArray(metric.services)) {
      const healthyServices = metric.services.filter((s: any) => s.status === 'healthy').length;
      const totalServices = metric.services.length;
      const availabilityScore = totalServices > 0 ? (healthyServices / totalServices) : 1;
      score += availabilityScore * 0.4;
      weightSum += 0.4;
    }
    
    // Performance metrics weight: 30%
    if (metric.performance) {
      let perfScore = 1;
      const perf = metric.performance;
      
      // Response time impact (lower is better)
      if (perf.averageResponseTime) {
        perfScore *= Math.max(0, 1 - (perf.averageResponseTime / 5000)); // 5s baseline
      }
      
      // Error rate impact (lower is better)
      if (perf.errorRate !== undefined) {
        perfScore *= Math.max(0, 1 - (perf.errorRate * 10)); // 10% error rate = 0 score
      }
      
      // Throughput impact (higher is better, normalized)
      if (perf.throughput) {
        perfScore *= Math.min(1, perf.throughput / 1000); // 1000 req/s baseline
      }
      
      score += perfScore * 0.3;
      weightSum += 0.3;
    }
    
    // Capacity utilization weight: 20%
    if (metric.capacity) {
      let capacityScore = 1;
      const cap = metric.capacity;
      
      // CPU utilization (optimal around 70%)
      if (cap.cpu && cap.cpu.utilization !== undefined) {
        const cpuUtil = cap.cpu.utilization / 100;
        capacityScore *= cpuUtil < 0.7 ? cpuUtil / 0.7 : Math.max(0, 2 - (cpuUtil / 0.7));
      }
      
      // Memory utilization (optimal around 80%)
      if (cap.memory && cap.memory.utilization !== undefined) {
        const memUtil = cap.memory.utilization / 100;
        capacityScore *= memUtil < 0.8 ? memUtil / 0.8 : Math.max(0, 2 - (memUtil / 0.8));
      }
      
      score += capacityScore * 0.2;
      weightSum += 0.2;
    }
    
    // Security score weight: 10%
    if (metric.security) {
      let securityScore = 1;
      const sec = metric.security;
      
      // Threat level impact
      const threatLevels = { low: 1, medium: 0.7, high: 0.3, critical: 0 };
      securityScore *= threatLevels[sec.threatLevel as keyof typeof threatLevels] || 0.5;
      
      // Active threats impact
      if (sec.activeThreats) {
        securityScore *= Math.max(0, 1 - (sec.activeThreats * 0.1));
      }
      
      // Compliance score impact
      if (sec.complianceScore !== undefined) {
        securityScore *= sec.complianceScore / 100;
      }
      
      score += securityScore * 0.1;
      weightSum += 0.1;
    }
    
    // Normalize score
    return weightSum > 0 ? Math.max(0, Math.min(1, score / weightSum)) : 0;
  }

  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      requestsPerSecond: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      concurrentUsers: 0
    };
  }

  private getDefaultCapacityMetrics(): CapacityMetrics {
    return {
      cpu: { current: 0, maximum: 100, utilization: 0, trend: 'stable', projectedCapacity: 0 },
      memory: { current: 0, maximum: 100, utilization: 0, trend: 'stable', projectedCapacity: 0 },
      storage: { current: 0, maximum: 100, utilization: 0, trend: 'stable', projectedCapacity: 0 },
      network: { current: 0, maximum: 100, utilization: 0, trend: 'stable', projectedCapacity: 0 },
      database: { current: 0, maximum: 100, utilization: 0, trend: 'stable', projectedCapacity: 0 }
    };
  }

  private getDefaultSecurityMetrics(): SecurityMetrics {
    return {
      threatLevel: 'low',
      activeThreats: 0,
      vulnerabilities: 0,
      lastSecurityScan: new Date(),
      complianceScore: 100,
      accessAttempts: { successful: 0, failed: 0, blocked: 0, suspicious: 0 }
    };
  }

  private getDefaultComplianceMetrics(): ComplianceMetrics {
    return {
      overallScore: 100,
      frameworks: [],
      violations: [],
      lastAudit: new Date(),
      nextAudit: new Date()
    };
  }

  // Resource optimization helpers
  private async getCurrentResourceAllocation(): Promise<ResourceAllocation> {
    const allocation = await classificationApi.getResourceAllocation();
    return allocation.success ? allocation.data : this.getDefaultResourceAllocation();
  }

  private getDefaultResourceAllocation(): ResourceAllocation {
    return {
      cpu: { allocated: 0, utilized: 0, reserved: 0, cost: 0 },
      memory: { allocated: 0, utilized: 0, reserved: 0, cost: 0 },
      storage: { allocated: 0, utilized: 0, reserved: 0, cost: 0 },
      network: { allocated: 0, utilized: 0, reserved: 0, cost: 0 }
    };
  }

  private async analyzeUtilizationPatterns(): Promise<any> {
    const patterns = await classificationApi.getUtilizationPatterns();
    return patterns.success ? patterns.data : {};
  }

  private async predictWorkloadTrends(): Promise<any> {
    const trends = await mlApi.predictWorkloadTrends();
    return trends.success ? trends.data : {};
  }

  private async calculateOptimalAllocation(current: ResourceAllocation, patterns: any, predictions: any): Promise<ResourceAllocation> {
    // Implement optimal allocation calculation
    return current; // Simplified for now
  }

  private calculatePotentialSavings(current: ResourceAllocation, recommended: ResourceAllocation): number {
    const currentCost = Object.values(current).reduce((sum, resource) => sum + resource.cost, 0);
    const recommendedCost = Object.values(recommended).reduce((sum, resource) => sum + resource.cost, 0);
    return Math.max(0, currentCost - recommendedCost);
  }

  private assessPerformanceImpact(current: ResourceAllocation, recommended: ResourceAllocation): number {
    // Implement performance impact assessment
    return 0; // Simplified for now
  }

  private async generateImplementationPlan(current: ResourceAllocation, recommended: ResourceAllocation): Promise<OptimizationStep[]> {
    // Implement implementation plan generation
    return [];
  }

  private async assessOptimizationRisks(current: ResourceAllocation, recommended: ResourceAllocation): Promise<RiskAssessment> {
    return {
      overall: 'low',
      factors: [],
      mitigation: []
    };
  }
}

// Supporting classes
class ResourceMonitor {
  async getCurrentLoad(): Promise<number> {
    const metrics = await classificationApi.getCurrentSystemLoad();
    return metrics.success ? metrics.data.load : 0.5;
  }
}

class QualityController {
  async validateResults(results: any[], threshold: number, execution: WorkflowExecution): Promise<any[]> {
    // Implement quality validation logic
    const validatedResults = results.filter(result => result.confidence >= threshold);
    execution.metrics.qualityScore = validatedResults.length / results.length;
    return validatedResults;
  }

  async performCrossVersionQA(results: any[]): Promise<{ overallScore: number }> {
    // Implement cross-version QA logic
    return { overallScore: 0.95 };
  }
}

  class SecurityManager {
    async validateWorkflowConfig(config: any): Promise<{isValid: boolean, message: string}> {
      // Comprehensive security validation with enterprise-grade checks
      const validationResults = [];
      
      // Audit trail validation
      if (!config.auditEnabled) {
        validationResults.push({
          severity: 'medium',
          message: 'Audit trail is disabled - required for compliance',
          code: 'AUDIT_DISABLED'
        });
      }
      
      // Data source security validation
      if (config.dataSource) {
        const dataSourceSecurity = await classificationApi.validateDataSourceSecurity(config.dataSource);
        if (!dataSourceSecurity.success || !dataSourceSecurity.data.isSecure) {
          validationResults.push({
            severity: 'high',
            message: 'Data source security validation failed',
            code: 'INSECURE_DATA_SOURCE'
          });
        }
      }
      
      // Framework security validation
      if (config.frameworks && config.frameworks.length > 0) {
        for (const frameworkId of config.frameworks) {
          const frameworkSecurity = await classificationApi.validateFrameworkSecurity(frameworkId);
          if (!frameworkSecurity.success || frameworkSecurity.data.hasVulnerabilities) {
            validationResults.push({
              severity: 'high',
              message: `Framework ${frameworkId} has security vulnerabilities`,
              code: 'VULNERABLE_FRAMEWORK'
            });
          }
        }
      }
      
      // Rule security validation
      if (config.rules && config.rules.length > 0) {
        const rulesSecurity = await classificationApi.validateRulesSecurity(config.rules);
        if (!rulesSecurity.success || rulesSecurity.data.hasSecurityRisks) {
          validationResults.push({
            severity: 'medium',
            message: 'Classification rules contain potential security risks',
            code: 'RISKY_RULES'
          });
        }
      }
      
      // Access control validation
      const currentUser = await classificationApi.getCurrentUser();
      if (currentUser.success) {
        const permissions = await classificationApi.validateUserPermissions({
          userId: currentUser.data.id,
          action: 'execute_workflow',
          resources: config.frameworks.concat(config.rules)
        });
        
        if (!permissions.success || !permissions.data.hasPermission) {
          validationResults.push({
            severity: 'critical',
            message: 'Insufficient permissions to execute workflow',
            code: 'PERMISSION_DENIED'
          });
        }
      }
      
      // Encryption validation for sensitive data
      if (config.dataSource && config.dataSource.includes('sensitive')) {
        if (!config.encryptionEnabled) {
          validationResults.push({
            severity: 'high',
            message: 'Encryption required for sensitive data sources',
            code: 'ENCRYPTION_REQUIRED'
          });
        }
      }
      
      // Network security validation
      const networkSecurity = await this.validateNetworkSecurity();
      if (!networkSecurity.isSecure) {
        validationResults.push({
          severity: 'medium',
          message: 'Network security concerns detected',
          code: 'NETWORK_SECURITY_RISK'
        });
      }
      
      // Determine overall validation result
      const criticalIssues = validationResults.filter(r => r.severity === 'critical');
      const highIssues = validationResults.filter(r => r.severity === 'high');
      
      if (criticalIssues.length > 0) {
        return {
          isValid: false,
          message: `Critical security issues: ${criticalIssues.map(i => i.message).join('; ')}`
        };
      }
      
      if (highIssues.length > 0) {
        console.warn('High severity security issues detected:', highIssues);
        return {
          isValid: false,
          message: `High severity security issues: ${highIssues.map(i => i.message).join('; ')}`
        };
      }
      
      // Log medium and low severity issues as warnings
      const warnings = validationResults.filter(r => ['medium', 'low'].includes(r.severity));
      if (warnings.length > 0) {
        console.warn('Security warnings:', warnings);
      }
      
      return {
        isValid: true,
        message: 'Security validation passed'
      };
    }

    async getSecurityMetrics(): Promise<SecurityMetrics> {
      try {
        // Collect real-time security metrics from various sources
        const [threatAssessment, vulnerabilityReport, accessLogs, complianceCheck] = await Promise.all([
          this.assessCurrentThreats(),
          this.scanVulnerabilities(),
          this.analyzeAccessLogs(),
          this.checkComplianceStatus()
        ]);
        
        return {
          threatLevel: threatAssessment.level,
          activeThreats: threatAssessment.count,
          vulnerabilities: vulnerabilityReport.totalVulnerabilities,
          lastSecurityScan: new Date(vulnerabilityReport.lastScanTime),
          complianceScore: complianceCheck.score,
          accessAttempts: {
            successful: accessLogs.successful,
            failed: accessLogs.failed,
            blocked: accessLogs.blocked,
            suspicious: accessLogs.suspicious
          }
        };
      } catch (error) {
        console.error('Failed to collect security metrics:', error);
        
        // Return safe defaults if collection fails
        return {
          threatLevel: 'medium', // Conservative default
          activeThreats: 0,
          vulnerabilities: 0,
          lastSecurityScan: new Date(),
          complianceScore: 50, // Conservative default
          accessAttempts: { successful: 0, failed: 0, blocked: 0, suspicious: 0 }
        };
      }
    }
    
    private async validateNetworkSecurity(): Promise<{isSecure: boolean, issues: string[]}> {
      const issues = [];
      
      // Check SSL/TLS configuration
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        issues.push('Insecure HTTP connection detected');
      }
      
      // Check for mixed content
      if (document.querySelectorAll('script[src^="http:"], link[href^="http:"]').length > 0) {
        issues.push('Mixed content detected (HTTP resources on HTTPS page)');
      }
      
      // Validate API endpoints security
      const apiSecurity = await classificationApi.validateAPIEndpointsSecurity();
      if (!apiSecurity.success || apiSecurity.data.hasInsecureEndpoints) {
        issues.push('Insecure API endpoints detected');
      }
      
      return {
        isSecure: issues.length === 0,
        issues
      };
    }
    
    private async assessCurrentThreats(): Promise<{level: 'low' | 'medium' | 'high' | 'critical', count: number}> {
      const threatAssessment = await classificationApi.getCurrentThreatAssessment();
      
      if (threatAssessment.success) {
        return {
          level: threatAssessment.data.overallLevel,
          count: threatAssessment.data.activeThreatCount
        };
      }
      
      return { level: 'low', count: 0 };
    }
    
    private async scanVulnerabilities(): Promise<{totalVulnerabilities: number, lastScanTime: string}> {
      const vulnerabilityReport = await classificationApi.getLatestVulnerabilityReport();
      
      if (vulnerabilityReport.success) {
        return {
          totalVulnerabilities: vulnerabilityReport.data.totalVulnerabilities,
          lastScanTime: vulnerabilityReport.data.scanTimestamp
        };
      }
      
      return {
        totalVulnerabilities: 0,
        lastScanTime: new Date().toISOString()
      };
    }
    
    private async analyzeAccessLogs(): Promise<{successful: number, failed: number, blocked: number, suspicious: number}> {
      const accessAnalysis = await classificationApi.getAccessLogAnalysis({
        timeRange: '24h',
        aggregateBy: 'status'
      });
      
      if (accessAnalysis.success) {
        const data = accessAnalysis.data;
        return {
          successful: data.successful || 0,
          failed: data.failed || 0,
          blocked: data.blocked || 0,
          suspicious: data.suspicious || 0
        };
      }
      
      return { successful: 0, failed: 0, blocked: 0, suspicious: 0 };
    }
    
    private async checkComplianceStatus(): Promise<{score: number}> {
      const complianceReport = await classificationApi.getComplianceReport();
      
      if (complianceReport.success) {
        return { score: complianceReport.data.overallScore };
      }
      
      return { score: 100 }; // Optimistic default
    }
  }

// Initialize the advanced workflow orchestrator
const workflowOrchestrator = new AdvancedWorkflowOrchestrator();

// Loading component
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Internal ClassificationsSPA Component (with RBAC context)
const ClassificationsSPAInternal: React.FC<ClassificationsSPAProps> = ({
  initialView = 'overview',
  embedded = false,
  theme = 'auto',
  permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canDeploy: true,
    canViewAnalytics: true
  },
  onNavigate,
  onWorkflowComplete
}) => {
  // RBAC Integration
  const rbac = useClassificationsRBAC();

  // Authentication check
  if (!rbac.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access the Classifications system.</p>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (rbac.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Classifications</h2>
            <p className="text-gray-600">Verifying permissions and initializing system...</p>
          </div>
        </Card>
      </div>
    );
  }
  // State Management
  const [state, setState] = useState<ClassificationsSPAState>({
    isLoading: false,
    error: null,
    currentView: {
      id: 'dashboard',
      name: 'Dashboard',
      type: 'dashboard',
      layout: {} as ViewLayout,
      components: [],
      filters: [],
      sorting: {} as ViewSorting,
      grouping: {} as ViewGrouping,
      pagination: {} as ViewPagination,
      customization: {} as ViewCustomization,
      permissions: {} as ViewPermissions,
      sharing: {} as ViewSharing,
      bookmarks: [],
      history: [],
      preferences: {} as ViewPreferences,
      metadata: {} as ViewMetadata
    },
    currentVersion: 'all',
    currentComponent: null,
    sidebarOpen: true,
    commandPaletteOpen: false,
    notificationsOpen: false,
    settingsOpen: false,
    profileOpen: false,
    searchQuery: '',
    globalFilters: [],
    recentActivities: activities || [],
    systemStatus: systemMetrics?.systemStatus || { overall: 'healthy', services: [] } as any,
    userPreferences: {} as UserPreferences,
    theme: 'light',
    layout: {} as LayoutConfiguration,
    performance: {} as PerformanceMetrics,
    analytics: {} as AnalyticsData,
    notifications: notifications || [],
    shortcuts: [],
    integrations: [],
    security: {} as SecurityConfiguration,
    collaboration: {} as CollaborationSettings,
    automation: {} as AutomationSettings,
    monitoring: {} as MonitoringConfiguration,
    compliance: {} as ComplianceSettings,
    governance: {} as GovernanceConfiguration,
    realTimeMode: true,
    autoSave: true,
    debugMode: false,
    maintenanceMode: false,
    featureFlags: [],
    experiments: [],
    telemetry: {} as TelemetryData,
    feedback: [],
    support: {} as SupportConfiguration,
    documentation: {} as DocumentationLinks,
    tutorials: [],
    onboarding: {} as OnboardingState,
    accessibility: {} as AccessibilitySettings,
    localization: {} as LocalizationSettings,
    breadcrumbs: [
      { id: 'home', label: 'Classifications', href: '/' }
    ],
    quickActions: [],
    contextMenu: [],
    dragDropState: {} as DragDropState,
    clipboard: {} as ClipboardData,
    undoRedoStack: {} as UndoRedoState,
    bulkOperations: {} as BulkOperationState,
    dataExport: {} as DataExportState,
    dataImport: {} as DataImportState,
    backup: {} as BackupConfiguration,
    recovery: {} as RecoveryConfiguration,
    versioning: {} as VersioningConfiguration,
    migration: {} as MigrationState,
    deployment: {} as DeploymentConfiguration,
    scaling: {} as ScalingConfiguration,
    optimization: {} as OptimizationSettings,
    caching: {} as CacheConfiguration,
    cdn: {} as CDNConfiguration,
    api: {} as APIConfiguration,
    webhooks: {} as WebhookConfiguration,
    events: {} as EventConfiguration,
    logging: {} as LoggingConfiguration,
    metrics: {} as MetricsConfiguration,
    alerts: {} as AlertConfiguration,
    health: {} as HealthCheckConfiguration,
    status: {} as StatusPageConfiguration,
    maintenance: {} as MaintenanceConfiguration,
    updates: {} as UpdateConfiguration,
    patches: {} as PatchConfiguration,
    hotfixes: {} as HotfixConfiguration
  });

  // Real data hooks - no more mock data
  const { classifications, updateClassification, isLoading: classificationsLoading } = useClassificationState();
  const { aiModels, aiAgents, conversations, startIntelligence, stopIntelligence, isLoading: aiLoading } = useAIIntelligence();
  const { models: mlModels, trainingJobs, deployments, isLoading: mlLoading } = useMLIntelligence();
  const { systemMetrics, notifications, activities, isLoading: monitoringLoading } = useRealTimeMonitoring();
  const { workflows, createWorkflow: createWorkflowFromHook, executeWorkflow: executeWorkflowFromHook, isLoading: workflowLoading } = useWorkflowOrchestration();
  
  // Advanced workflow orchestration with RBAC integration
  const {
    availableTemplates,
    activeWorkflows,
    workflowMetrics,
    isExecuting,
    executeWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    getWorkflowProgress,
    getRecommendedWorkflows,
    canExecuteWorkflows,
    canManageWorkflows
  } = useClassificationWorkflowOrchestrator();

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  // Real data from hooks - no memoized mock data
  const performanceData = useMemo(() => systemMetrics?.performance || {}, [systemMetrics]);
  const analyticsData = useMemo(() => systemMetrics?.analytics || [], [systemMetrics]);
  const filteredVersions = useMemo(() => {
    if (state.currentVersion === 'all') return CLASSIFICATION_VERSIONS;
    return CLASSIFICATION_VERSIONS.filter(v => v.id === state.currentVersion);
  }, [state.currentVersion]);

  // Effects
  
  // Update state with real data from hooks
  useEffect(() => {
    setState(prev => ({
      ...prev,
      recentActivities: activities || prev.recentActivities,
      notifications: notifications || prev.notifications,
      systemStatus: systemMetrics?.systemStatus || prev.systemStatus,
      activeWorkflows: workflows || prev.activeWorkflows
    }));
  }, [activities, notifications, systemMetrics, workflows]);

  // Update loading state based on hooks
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: classificationsLoading || aiLoading || mlLoading || monitoringLoading || workflowLoading
    }));
  }, [classificationsLoading, aiLoading, mlLoading, monitoringLoading, workflowLoading]);

  useEffect(() => {
    // Initialize real-time updates
    if (state.realTimeMode) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefreshData();
      }, 30000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.realTimeMode]);

  useEffect(() => {
    // Initialize WebSocket connection
    if (state.realTimeMode) {
      initializeWebSocket();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [state.realTimeMode]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            setState(prev => ({ ...prev, commandPaletteOpen: !prev.commandPaletteOpen }));
            break;
          case '/':
            event.preventDefault();
            setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
            break;
          case 'f':
            event.preventDefault();
            // Focus search input
            break;
          case 'n':
            event.preventDefault();
            handleQuickAction('new-classification');
            break;
          case 'r':
            event.preventDefault();
            handleRefreshData();
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setState(prev => ({
          ...prev,
          commandPaletteOpen: false,
          notificationsOpen: false,
          settingsOpen: false,
          profileOpen: false
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // WebSocket initialization
  const initializeWebSocket = useCallback(() => {
    try {
      const wsApi = websocketApi.getInstance();
      if (wsApi) {
        const connection = wsApi.subscribe('classifications-spa', (data: any) => {
          handleRealTimeUpdate(data);
        });
        
        // Store connection reference for cleanup
        websocketRef.current = connection as any;
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setState(prev => ({ ...prev, error: 'Real-time connection failed' }));
    }
  }, []);

  // Event Handlers
  const handleRefreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Refresh data from real APIs
      const [systemHealthData, performanceMetrics, aiModelsData, mlModelsData] = await Promise.all([
        classificationApi.getSystemHealth(),
        classificationApi.getPerformanceMetrics(),
        aiApi.getAIModels(),
        mlApi.getMLModels()
      ]);

      setState(prev => ({
        ...prev,
        systemStatus: systemHealthData.data || { overall: 'healthy', services: [] },
        performance: performanceMetrics.data || {},
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        isLoading: false
      }));
    }
  }, []);

  const handleRealTimeUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      systemStatus: { ...prev.systemStatus, ...data.systemStatus },
      recentActivities: data.activities || prev.recentActivities,
      notifications: data.notifications || prev.notifications,
      performance: { ...prev.performance, ...data.performance }
    }));
  }, []);

  const handleVersionChange = useCallback((version: ClassificationVersion) => {
    // Log navigation action
    rbac.logUserAction('navigate_version', 'classification_spa', undefined, {
      version,
      previousVersion: state.currentVersion,
      timestamp: new Date().toISOString()
    });

    setState(prev => ({
      ...prev,
      currentVersion: version,
      currentComponent: null,
      breadcrumbs: [
        { id: 'home', label: 'Classifications', href: '/' },
        { id: version, label: CLASSIFICATION_VERSIONS.find(v => v.id === version)?.name || version, href: `/${version}` }
      ]
    }));
  }, [rbac, state.currentVersion]);

  const handleComponentSelect = useCallback((componentId: string) => {
    const version = CLASSIFICATION_VERSIONS.find(v => 
      v.components.some(c => c.id === componentId)
    );
    const component = version?.components.find(c => c.id === componentId);
    
    // Log component access
    rbac.logUserAction('access_component', 'classification_component', undefined, {
      componentId,
      componentName: component?.name,
      version: version?.id,
      timestamp: new Date().toISOString()
    });
    
    setState(prev => ({
      ...prev,
      currentComponent: componentId,
      breadcrumbs: [
        { id: 'home', label: 'Classifications', href: '/' },
        { id: version?.id || '', label: version?.name || '', href: `/${version?.id}` },
        { id: componentId, label: component?.name || componentId, href: `/${version?.id}/${componentId}` }
      ]
    }));
  }, [rbac]);

  const handleQuickAction = useCallback(async (actionId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Log quick action
    rbac.logUserAction('quick_action', 'classification_spa', undefined, {
      actionId,
      timestamp: new Date().toISOString()
    });
    
    try {
      switch (actionId) {
        case 'new-classification':
          await handleNewClassification();
          break;
        case 'import-data':
          await handleDataImport();
          break;
        case 'export-results':
          await handleExportResults();
          break;
        case 'run-analysis':
          await handleRunAnalysis();
          break;
        case 'schedule-task':
          await handleScheduleTask();
          break;
        case 'view-reports':
          await handleViewReports();
          break;
        case 'manage-models':
          await handleManageModels();
          break;
        case 'system-health':
          await handleSystemHealth();
          break;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Action failed'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [rbac]);

  // Advanced workflow action handlers
  const handleNewClassification = useCallback(async () => {
    try {
      // Intelligent workflow selection based on data complexity and user preferences
      const systemLoad = await workflowOrchestrator.monitorSystemHealth();
      const recommendedVersion = await determineOptimalClassificationVersion(systemLoad);
      
      const workflowConfig: ClassificationWorkflowConfig = {
        type: recommendedVersion,
        frameworks: await getRecommendedFrameworks(recommendedVersion),
        rules: await getActiveRules(),
        dataSource: 'user-input',
        outputFormat: 'json',
        realTimeProcessing: true,
        qualityThreshold: 0.8,
        parallelProcessing: systemLoad.overall === 'healthy',
        auditEnabled: true
      };

      const execution = await workflowOrchestrator.executeClassificationWorkflow(workflowConfig);
      
      setState(prev => ({
        ...prev,
        activeWorkflows: [...prev.activeWorkflows, {
          id: execution.id,
          name: 'New Classification Workflow',
          type: 'classification',
          status: execution.status,
          progress: execution.progress,
          startTime: execution.startTime.toISOString(),
          priority: 'medium',
          owner: 'current-user',
          dependencies: [],
          metrics: {
            accuracy: execution.metrics.accuracy,
            throughput: execution.metrics.throughput,
            resourceUsage: execution.metrics.resourceUsage.cpu,
            cost: execution.metrics.costEfficiency
          }
        }],
        notifications: [...prev.notifications, {
          id: `notif_${Date.now()}`,
          type: 'success',
          title: 'Classification Workflow Started',
          message: `New classification workflow ${execution.id} has been initiated`,
          timestamp: new Date().toISOString(),
          read: false,
          actionable: true,
          actions: [{
            label: 'View Progress',
            action: () => handleViewWorkflowProgress(execution.id),
            variant: 'default'
          }]
        }]
      }));

    } catch (error) {
      console.error('Failed to start new classification:', error);
      throw error;
    }
  }, []);

  const handleDataImport = useCallback(async () => {
    try {
      // Intelligent data import with format detection and validation
      const supportedFormats = await classificationApi.getSupportedDataFormats();
      const importConfig = await generateOptimalImportConfig(supportedFormats.data);
      
      // Create file input dialog
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.accept = supportedFormats.data.map(f => f.extension).join(',');
      
      fileInput.onchange = async (event: any) => {
        const files = Array.from(event.target.files || []);
        
        for (const file of files) {
          const importResult = await classificationApi.importData({
            file: file as File,
            config: importConfig,
            validateOnImport: true,
            generatePreview: true
          });
          
          if (importResult.success) {
            setState(prev => ({
              ...prev,
              notifications: [...prev.notifications, {
                id: `import_${Date.now()}`,
                type: 'success',
                title: 'Data Import Successful',
                message: `Successfully imported ${(file as File).name}`,
                timestamp: new Date().toISOString(),
                read: false,
                actionable: false,
                actions: []
              }]
            }));
          }
        }
      };
      
      fileInput.click();
      
    } catch (error) {
      console.error('Data import failed:', error);
      throw error;
    }
  }, []);

  const handleExportResults = useCallback(async () => {
    try {
      // Intelligent export with format optimization
      const exportFormats = ['json', 'csv', 'xlsx', 'pdf', 'xml'];
      const recommendedFormat = await determineOptimalExportFormat(state.currentView.type);
      
      const exportConfig = {
        format: recommendedFormat,
        includeMetadata: true,
        includeAuditTrail: true,
        compression: true,
        encryption: state.systemStatus.security?.threatLevel === 'high'
      };
      
      const exportResult = await classificationApi.exportResults({
        viewId: state.currentView.id,
        config: exportConfig,
        filters: state.globalFilters
      });
      
      if (exportResult.success) {
        // Create download link
        const blob = new Blob([exportResult.data.content], { 
          type: exportResult.data.mimeType 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = exportResult.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setState(prev => ({
          ...prev,
          notifications: [...prev.notifications, {
            id: `export_${Date.now()}`,
            type: 'success',
            title: 'Export Completed',
            message: `Results exported successfully as ${exportResult.data.filename}`,
            timestamp: new Date().toISOString(),
            read: false,
            actionable: false,
            actions: []
          }]
        }));
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [state.currentView, state.globalFilters, state.systemStatus]);

  const handleRunAnalysis = useCallback(async () => {
    try {
      // Multi-version analysis orchestration
      const analysisConfig: MultiVersionWorkflowConfig = {
        v1Config: {
          type: 'manual',
          frameworks: await getActiveFrameworks(),
          rules: await getActiveRules(),
          dataSource: 'current-dataset',
          outputFormat: 'json',
          realTimeProcessing: true,
          qualityThreshold: 0.85,
          parallelProcessing: true,
          auditEnabled: true
        },
        v2Config: {
          modelIds: await getActiveMLModels(),
          trainingData: 'current-dataset',
          validationSplit: 0.2,
          hyperparameterOptimization: true,
          ensembleMethod: 'voting',
          driftDetection: true,
          autoRetraining: false,
          performanceThreshold: 0.9
        },
        v3Config: {
          conversationContext: 'classification-analysis',
          reasoningDepth: 'deep',
          explainabilityLevel: 'detailed',
          knowledgeSources: await getActiveKnowledgeSources(),
          realTimeInference: true,
          confidenceThreshold: 0.8,
          multiAgentCoordination: true
        },
        orchestrationStrategy: 'adaptive',
        consensusAlgorithm: 'confidence-based',
        qualityAssurance: true
      };
      
      const execution = await workflowOrchestrator.orchestrateMultiVersionWorkflow(analysisConfig);
      
      setState(prev => ({
        ...prev,
        activeWorkflows: [...prev.activeWorkflows, {
          id: execution.id,
          name: 'Multi-Version Analysis',
          type: 'analysis',
          status: execution.status,
          progress: execution.progress,
          startTime: execution.startTime.toISOString(),
          priority: 'high',
          owner: 'current-user',
          dependencies: [],
          metrics: {
            accuracy: execution.metrics.accuracy,
            throughput: execution.metrics.throughput,
            resourceUsage: execution.metrics.resourceUsage.cpu,
            cost: execution.metrics.costEfficiency
          }
        }]
      }));
      
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }, []);

  const handleScheduleTask = useCallback(async () => {
    try {
      // Intelligent task scheduling with resource optimization
      const resourceOptimization = await workflowOrchestrator.optimizeResourceAllocation();
      const optimalSchedule = await calculateOptimalSchedule(resourceOptimization);
      
      const taskConfig = {
        type: 'scheduled-classification',
        schedule: optimalSchedule,
        resourceAllocation: resourceOptimization.recommendedAllocation,
        autoScaling: true,
        priorityBasedExecution: true,
        failoverStrategy: 'retry-with-backoff'
      };
      
      const scheduledTask = await classificationApi.scheduleTask(taskConfig);
      
      if (scheduledTask.success) {
        setState(prev => ({
          ...prev,
          notifications: [...prev.notifications, {
            id: `schedule_${Date.now()}`,
            type: 'info',
            title: 'Task Scheduled',
            message: `Task scheduled for optimal execution at ${optimalSchedule.nextRun}`,
            timestamp: new Date().toISOString(),
            read: false,
            actionable: true,
            actions: [{
              label: 'View Schedule',
              action: () => handleViewSchedule(scheduledTask.data.id),
              variant: 'default'
            }]
          }]
        }));
      }
      
    } catch (error) {
      console.error('Task scheduling failed:', error);
      throw error;
    }
  }, []);

  const handleViewReports = useCallback(async () => {
    try {
      // Generate intelligent reports with cross-version insights
      const reportConfig = {
        includeV1Analytics: true,
        includeV2MLMetrics: true,
        includeV3AIInsights: true,
        timeRange: '30d',
        granularity: 'daily',
        includeComparativeAnalysis: true,
        includePredictiveInsights: true,
        includeROIAnalysis: true
      };
      
      const reports = await classificationApi.generateReports(reportConfig);
      
      if (reports.success) {
        // Navigate to reports view with generated data
        setState(prev => ({
          ...prev,
          currentView: {
            ...prev.currentView,
            id: 'reports',
            name: 'Intelligent Reports',
            type: 'dashboard'
          },
          breadcrumbs: [
            ...prev.breadcrumbs,
            { id: 'reports', label: 'Reports', href: '/reports' }
          ]
        }));
        
        // Store report data for rendering
        sessionStorage.setItem('classification-reports', JSON.stringify(reports.data));
      }
      
    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    }
  }, []);

  const handleManageModels = useCallback(async () => {
    try {
      // Intelligent model management with lifecycle optimization
      const modelHealth = await mlApi.getModelHealthMetrics();
      const aiModelStatus = await aiApi.getAIModelStatus();
      
      const managementActions = await generateModelManagementActions(
        modelHealth.data,
        aiModelStatus.data
      );
      
      // Execute priority management actions
      for (const action of managementActions.filter(a => a.priority === 'high')) {
        switch (action.type) {
          case 'retrain':
            await mlApi.startRetraining({
              modelId: action.modelId,
              reason: action.reason,
              urgency: action.priority
            });
            break;
          case 'scale':
            await mlApi.scaleModel({
              modelId: action.modelId,
              targetReplicas: action.targetReplicas,
              autoScaling: true
            });
            break;
          case 'update':
            await aiApi.updateAIModel({
              modelId: action.modelId,
              updates: action.updates
            });
            break;
        }
      }
      
      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, {
          id: `models_${Date.now()}`,
          type: 'info',
          title: 'Model Management Complete',
          message: `Executed ${managementActions.length} optimization actions`,
          timestamp: new Date().toISOString(),
          read: false,
          actionable: false,
          actions: []
        }]
      }));
      
    } catch (error) {
      console.error('Model management failed:', error);
      throw error;
    }
  }, []);

  const handleSystemHealth = useCallback(async () => {
    try {
      // Comprehensive system health analysis
      const healthMetrics = await workflowOrchestrator.monitorSystemHealth();
      const resourceOptimization = await workflowOrchestrator.optimizeResourceAllocation();
      
      // Generate health report with actionable insights
      const healthReport = {
        overall: healthMetrics.overall,
        services: healthMetrics.services,
        performance: healthMetrics.performance,
        capacity: healthMetrics.capacity,
        security: healthMetrics.security,
        compliance: healthMetrics.compliance,
        optimization: resourceOptimization,
        recommendations: await generateHealthRecommendations(healthMetrics),
        alerts: await generateHealthAlerts(healthMetrics)
      };
      
      // Update system status
      setState(prev => ({
        ...prev,
        systemStatus: {
          ...prev.systemStatus,
          overall: healthMetrics.overall,
          services: healthMetrics.services
        },
        notifications: [
          ...prev.notifications,
          ...healthReport.alerts.map((alert: any) => ({
            id: `health_${Date.now()}_${crypto.getRandomValues(new Uint8Array(4)).join('')}`,
            type: alert.severity,
            title: alert.title,
            message: alert.message,
            timestamp: new Date().toISOString(),
            read: false,
            actionable: alert.actionable,
            actions: alert.actions || []
          }))
        ]
      }));
      
      // Store health report for detailed view
      sessionStorage.setItem('system-health-report', JSON.stringify(healthReport));
      
    } catch (error) {
      console.error('System health check failed:', error);
      throw error;
    }
  }, []);

  // Helper functions for intelligent workflow actions
  const determineOptimalClassificationVersion = async (systemHealth: SystemHealthMetrics): Promise<'manual' | 'ml' | 'ai' | 'hybrid'> => {
    if (systemHealth.overall === 'critical') return 'manual';
    if (systemHealth.capacity.cpu.utilization > 80) return 'ml';
    if (systemHealth.security.threatLevel === 'high') return 'manual';
    return 'hybrid';
  };

  const getRecommendedFrameworks = async (version: string): Promise<string[]> => {
    const frameworks = await classificationApi.getFrameworks({ active: true });
    return frameworks.success ? frameworks.data.map((f: any) => f.id) : [];
  };

  const getActiveRules = async (): Promise<string[]> => {
    const rules = await classificationApi.getRules({ active: true });
    return rules.success ? rules.data.map((r: any) => r.id) : [];
  };

  const getActiveFrameworks = async (): Promise<string[]> => {
    const frameworks = await classificationApi.getFrameworks({ active: true });
    return frameworks.success ? frameworks.data.map((f: any) => f.id) : [];
  };

  const getActiveMLModels = async (): Promise<string[]> => {
    const models = await mlApi.getMLModels({ status: 'active' });
    return models.success ? models.data.map((m: any) => m.id) : [];
  };

  const getActiveKnowledgeSources = async (): Promise<string[]> => {
    const sources = await aiApi.getKnowledgeSources({ active: true });
    return sources.success ? sources.data.map((s: any) => s.id) : [];
  };

  const generateOptimalImportConfig = async (supportedFormats: any[]): Promise<any> => {
    return {
      autoDetectFormat: true,
      validateSchema: true,
      sanitizeData: true,
      generatePreview: true,
      maxFileSize: '100MB',
      supportedFormats: supportedFormats
    };
  };

  const determineOptimalExportFormat = async (viewType: string): Promise<string> => {
    switch (viewType) {
      case 'dashboard': return 'pdf';
      case 'table': return 'xlsx';
      case 'chart': return 'json';
      default: return 'csv';
    }
  };

  const calculateOptimalSchedule = async (resourceOptimization: ResourceOptimizationResult): Promise<any> => {
    const lowUsagePeriods = await classificationApi.getLowUsagePeriods();
    return {
      nextRun: lowUsagePeriods.success ? lowUsagePeriods.data.nextOptimal : new Date(Date.now() + 3600000),
      frequency: 'daily',
      maxConcurrentTasks: Math.floor(resourceOptimization.recommendedAllocation.cpu.allocated * 0.8),
      priorityQueue: true
    };
  };

  const generateModelManagementActions = async (mlHealth: any, aiHealth: any): Promise<any[]> => {
    const actions = [];
    
    // Check ML models
    for (const model of mlHealth.models || []) {
      if (model.accuracy < 0.8) {
        actions.push({
          type: 'retrain',
          modelId: model.id,
          reason: 'Low accuracy detected',
          priority: 'high',
          estimatedTime: '2h'
        });
      }
      if (model.responseTime > 1000) {
        actions.push({
          type: 'scale',
          modelId: model.id,
          targetReplicas: model.replicas * 2,
          reason: 'High response time',
          priority: 'medium'
        });
      }
    }
    
    // Check AI models
    for (const model of aiHealth.models || []) {
      if (model.errorRate > 0.05) {
        actions.push({
          type: 'update',
          modelId: model.id,
          updates: { errorHandling: 'enhanced' },
          reason: 'High error rate',
          priority: 'high'
        });
      }
    }
    
    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  };

  const generateHealthRecommendations = async (health: SystemHealthMetrics): Promise<any[]> => {
    const recommendations = [];
    
    if (health.capacity.cpu.utilization > 80) {
      recommendations.push({
        type: 'resource',
        title: 'Scale CPU Resources',
        description: 'CPU utilization is high, consider scaling up',
        impact: 'high',
        effort: 'medium'
      });
    }
    
    if (health.security.threatLevel !== 'low') {
      recommendations.push({
        type: 'security',
        title: 'Review Security Measures',
        description: 'Elevated threat level detected',
        impact: 'critical',
        effort: 'high'
      });
    }
    
    return recommendations;
  };

  const generateHealthAlerts = async (health: SystemHealthMetrics): Promise<any[]> => {
    const alerts = [];
    
    if (health.overall === 'critical') {
      alerts.push({
        severity: 'error',
        title: 'System Critical',
        message: 'Multiple systems are experiencing issues',
        actionable: true,
        actions: [{
          label: 'Emergency Response',
          action: () => handleEmergencyResponse(),
          variant: 'destructive'
        }]
      });
    }
    
    return alerts;
  };

  const handleViewWorkflowProgress = useCallback((workflowId: string) => {
    // Navigate to workflow progress view
    setState(prev => ({
      ...prev,
      currentView: {
        ...prev.currentView,
        id: 'workflow-progress',
        name: 'Workflow Progress'
      }
    }));
  }, []);

  const handleViewSchedule = useCallback((scheduleId: string) => {
    // Navigate to schedule view
    setState(prev => ({
      ...prev,
      currentView: {
        ...prev.currentView,
        id: 'schedule',
        name: 'Task Schedule'
      }
    }));
  }, []);

  const handleEmergencyResponse = useCallback(async () => {
    try {
      // Implement emergency response protocol
      await classificationApi.triggerEmergencyResponse();
      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, {
          id: `emergency_${Date.now()}`,
          type: 'info',
          title: 'Emergency Response Activated',
          message: 'Emergency protocols have been initiated',
          timestamp: new Date().toISOString(),
          read: false,
          actionable: false,
          actions: []
        }]
      }));
    } catch (error) {
      console.error('Emergency response failed:', error);
    }
  }, []);

  // Advanced search result handlers
  const handleSearchResultClick = useCallback(async (result: any, category: string) => {
    try {
      // Track search result interaction
      await classificationApi.trackSearchInteraction({
        resultId: result.id,
        category: category,
        query: state.searchQuery,
        timestamp: new Date().toISOString()
      });

      // Navigate to appropriate view based on category
      switch (category) {
        case 'classifications':
          setState(prev => ({
            ...prev,
            currentView: { ...prev.currentView, id: 'classification-detail', name: result.name },
            currentComponent: 'classification-detail',
            searchResults: null
          }));
          break;
        
        case 'models':
          if (result.type === 'ml') {
            setState(prev => ({
              ...prev,
              currentVersion: 'v2-ml',
              currentComponent: 'ml-model-orchestrator',
              searchResults: null
            }));
          } else if (result.type === 'ai') {
            setState(prev => ({
              ...prev,
              currentVersion: 'v3-ai',
              currentComponent: 'ai-intelligence-orchestrator',
              searchResults: null
            }));
          }
          break;
        
        case 'workflows':
          setState(prev => ({
            ...prev,
            currentVersion: 'orchestration',
            currentComponent: 'classification-workflow',
            searchResults: null
          }));
          break;
        
        case 'frameworks':
          setState(prev => ({
            ...prev,
            currentVersion: 'v1-manual',
            currentComponent: 'framework-manager',
            searchResults: null
          }));
          break;
        
        case 'rules':
          setState(prev => ({
            ...prev,
            currentVersion: 'v1-manual',
            currentComponent: 'rule-engine',
            searchResults: null
          }));
          break;
        
        case 'users':
          // Navigate to user management or profile
          setState(prev => ({
            ...prev,
            currentView: { ...prev.currentView, id: 'user-profile', name: result.name },
            searchResults: null
          }));
          break;
        
        case 'reports':
          await handleViewReports();
          setState(prev => ({ ...prev, searchResults: null }));
          break;
        
        default:
          console.warn(`Unknown search category: ${category}`);
      }
    } catch (error) {
      console.error('Failed to handle search result click:', error);
    }
  }, [state.searchQuery]);

  const handleViewAllResults = useCallback(async (category: string) => {
    try {
      // Navigate to dedicated search results view for category
      const searchResultsView = {
        id: `search-results-${category}`,
        name: `Search Results: ${category}`,
        type: 'search-results' as const,
        category: category,
        query: state.searchQuery
      };

      setState(prev => ({
        ...prev,
        currentView: searchResultsView,
        currentComponent: 'search-results',
        breadcrumbs: [
          ...prev.breadcrumbs,
          { 
            id: searchResultsView.id, 
            label: `Search: ${category}`, 
            href: `/search/${category}` 
          }
        ],
        searchResults: null
      }));

      // Track "view all" interaction
      await classificationApi.trackSearchInteraction({
        action: 'view_all',
        category: category,
        query: state.searchQuery,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to view all search results:', error);
    }
  }, [state.searchQuery]);

  const handleNotificationAction = useCallback(async (notificationId: string, actionId: string) => {
    try {
      // Execute the notification action through the workflow orchestrator
      await workflowOrchestrator.executeClassificationWorkflow({
        type: 'manual',
        frameworks: [],
        rules: [],
        dataSource: 'notification-action',
        outputFormat: 'json',
        realTimeProcessing: false,
        qualityThreshold: 0.8,
        parallelProcessing: false,
        auditEnabled: true
      });
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      }));
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  }, []);

  const handleThemeChange = useCallback((theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
    // Apply theme to document
    document.documentElement.className = theme;
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    
    if (!query.trim()) {
      // Clear search results if query is empty
      setState(prev => ({ ...prev, searchResults: null }));
      return;
    }

    try {
      // Advanced intelligent search with multi-source querying
      const searchConfig = {
        query: query.trim(),
        sources: ['classifications', 'models', 'workflows', 'frameworks', 'rules', 'users', 'reports'],
        searchType: 'intelligent', // Uses AI-powered semantic search
        filters: {
          includeArchived: false,
          minRelevanceScore: 0.3,
          maxResults: 50
        },
        enableFuzzyMatching: true,
        enableSemanticSearch: true,
        includeMetadata: true,
        rankByRelevance: true
      };

      // Execute parallel search across all sources
      const [
        classificationResults,
        modelResults, 
        workflowResults,
        frameworkResults,
        ruleResults,
        userResults,
        reportResults
      ] = await Promise.allSettled([
        classificationApi.searchClassifications(searchConfig),
        mlApi.searchModels({ ...searchConfig, source: 'models' }),
        classificationApi.searchWorkflows({ ...searchConfig, source: 'workflows' }),
        classificationApi.searchFrameworks({ ...searchConfig, source: 'frameworks' }),
        classificationApi.searchRules({ ...searchConfig, source: 'rules' }),
        classificationApi.searchUsers({ ...searchConfig, source: 'users' }),
        classificationApi.searchReports({ ...searchConfig, source: 'reports' })
      ]);

      // Aggregate and rank results
      const aggregatedResults = {
        query: query,
        timestamp: new Date().toISOString(),
        totalResults: 0,
        categories: {
          classifications: classificationResults.status === 'fulfilled' ? classificationResults.value.data : [],
          models: modelResults.status === 'fulfilled' ? modelResults.value.data : [],
          workflows: workflowResults.status === 'fulfilled' ? workflowResults.value.data : [],
          frameworks: frameworkResults.status === 'fulfilled' ? frameworkResults.value.data : [],
          rules: ruleResults.status === 'fulfilled' ? ruleResults.value.data : [],
          users: userResults.status === 'fulfilled' ? userResults.value.data : [],
          reports: reportResults.status === 'fulfilled' ? reportResults.value.data : []
        },
        suggestions: await generateSearchSuggestions(query),
        relatedQueries: await generateRelatedQueries(query)
      };

      // Calculate total results
      aggregatedResults.totalResults = Object.values(aggregatedResults.categories)
        .reduce((sum, results) => sum + (Array.isArray(results) ? results.length : 0), 0);

      // Apply intelligent ranking across all results
      const rankedResults = await applyIntelligentRanking(aggregatedResults, query);

      setState(prev => ({
        ...prev,
        searchResults: rankedResults,
        searchSuggestions: rankedResults.suggestions
      }));

      // Track search analytics
      await classificationApi.trackSearchAnalytics({
        query: query,
        resultCount: aggregatedResults.totalResults,
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        sources: searchConfig.sources
      });

    } catch (error) {
      console.error('Search failed:', error);
      setState(prev => ({
        ...prev,
        searchResults: {
          query: query,
          error: 'Search temporarily unavailable',
          totalResults: 0,
          categories: {},
          suggestions: [],
          relatedQueries: []
        }
      }));
    }
  }, []);

  // Advanced search helper functions
  const generateSearchSuggestions = async (query: string): Promise<string[]> => {
    try {
      const suggestions = await classificationApi.getSearchSuggestions({
        query: query,
        maxSuggestions: 5,
        includeTypoCorrection: true,
        includeSemanticSimilar: true
      });
      
      return suggestions.success ? suggestions.data : [];
    } catch (error) {
      return [];
    }
  };

  const generateRelatedQueries = async (query: string): Promise<string[]> => {
    try {
      const relatedQueries = await classificationApi.getRelatedQueries({
        query: query,
        maxQueries: 3,
        basedOnUserHistory: true,
        basedOnPopularQueries: true
      });
      
      return relatedQueries.success ? relatedQueries.data : [];
    } catch (error) {
      return [];
    }
  };

  const applyIntelligentRanking = async (results: any, query: string): Promise<any> => {
    try {
      // Apply AI-powered ranking algorithm
      const rankingResult = await classificationApi.rankSearchResults({
        results: results,
        query: query,
        userContext: {
          recentActivity: state.recentActivities.slice(0, 10),
          preferences: state.userPreferences,
          currentView: state.currentView.id
        },
        rankingAlgorithm: 'ml-enhanced' // Uses ML model for ranking
      });

      return rankingResult.success ? rankingResult.data : results;
    } catch (error) {
      console.error('Ranking failed, using original results:', error);
      return results;
    }
  };

  // Utility functions
  const formatUptime = (uptime: number): string => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatResponseTime = (time: number): string => {
    return `${time}ms`;
  };

  const getStatusColor = (status: string): string => {
    return STATUS_INDICATORS[status as keyof typeof STATUS_INDICATORS]?.color || 'gray';
  };

  const getUnreadNotificationsCount = (): number => {
    return (notifications || []).filter(n => !n.read).length;
  };

  const renderComponent = useCallback(() => {
    if (!state.currentComponent) return null;

    const componentMap: { [key: string]: React.ComponentType } = {
      'framework-manager': FrameworkManager,
      'rule-engine': RuleEngine,
      'policy-orchestrator': PolicyOrchestrator,
      'bulk-operation-center': BulkOperationCenter,
      'audit-trail-analyzer': AuditTrailAnalyzer,
      'compliance-dashboard': ComplianceDashboard,
      'ml-model-orchestrator': MLModelOrchestrator,
      'training-pipeline-manager': TrainingPipelineManager,
      'adaptive-learning-center': AdaptiveLearningCenter,
      'hyperparameter-optimizer': HyperparameterOptimizer,
      'drift-detection-monitor': DriftDetectionMonitor,
      'feature-engineering-studio': FeatureEngineeringStudio,
      'model-ensemble-builder': ModelEnsembleBuilder,
      'ml-analytics-dashboard': MLAnalyticsDashboard,
      'ai-intelligence-orchestrator': AIIntelligenceOrchestrator,
      'conversation-manager': ConversationManager,
      'explainable-reasoning-viewer': ExplainableReasoningViewer,
      'auto-tagging-engine': AutoTaggingEngine,
      'workload-optimizer': WorkloadOptimizer,
      'real-time-intelligence-stream': RealTimeIntelligenceStream,
      'knowledge-synthesizer': KnowledgeSynthesizer,
      'ai-analytics-dashboard': AIAnalyticsDashboard,
      'classification-workflow': ClassificationWorkflow,
      'intelligence-coordinator': IntelligenceCoordinator,
      'business-intelligence-hub': BusinessIntelligenceHub
    };

    // Component permission mapping
    const componentPermissions: { [key: string]: string } = {
      'framework-manager': 'classification.frameworks.view',
      'rule-engine': 'classification.rules.view',
      'policy-orchestrator': 'classification.policies.view',
      'bulk-operation-center': 'classification.bulk.operations',
      'audit-trail-analyzer': 'classification.audit.view',
      'compliance-dashboard': 'classification.audit.compliance_reports',
      'ml-model-orchestrator': 'classification.ml.view_models',
      'training-pipeline-manager': 'classification.ml.train_models',
      'adaptive-learning-center': 'classification.ml.manage_experiments',
      'hyperparameter-optimizer': 'classification.ml.optimize_hyperparameters',
      'drift-detection-monitor': 'classification.ml.monitor_drift',
      'feature-engineering-studio': 'classification.ml.feature_engineering',
      'model-ensemble-builder': 'classification.ml.manage_ensembles',
      'ml-analytics-dashboard': 'classification.ml.view_analytics',
      'ai-intelligence-orchestrator': 'classification.ai.view_intelligence',
      'conversation-manager': 'classification.ai.create_conversations',
      'explainable-reasoning-viewer': 'classification.ai.view_reasoning',
      'auto-tagging-engine': 'classification.ai.auto_tagging',
      'workload-optimizer': 'classification.ai.workload_optimization',
      'real-time-intelligence-stream': 'classification.ai.real_time_streaming',
      'knowledge-synthesizer': 'classification.ai.manage_knowledge',
      'ai-analytics-dashboard': 'classification.ai.view_intelligence',
      'classification-workflow': 'classification.workflows.view',
      'intelligence-coordinator': 'classification.workflows.coordinate',
      'business-intelligence-hub': 'classification.bi.view'
    };

    const Component = componentMap[state.currentComponent];
    if (!Component) return <div>Component not found</div>;

    const requiredPermission = componentPermissions[state.currentComponent];
    
    // Check permission before rendering
    if (requiredPermission && !rbac.hasPermission(requiredPermission)) {
      return (
        <Card className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You don't have permission to access this component.</p>
            <p className="text-sm text-gray-500 mt-2">
              Required permission: <code className="bg-gray-100 px-2 py-1 rounded">{requiredPermission}</code>
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setState(prev => ({ ...prev, currentComponent: null, currentView: 'overview' }))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner message={`Loading ${state.currentComponent}...`} />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    );
  }, [state.currentComponent, rbac]);

  // Render functions
  const renderSidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-background border-r transition-transform duration-300 z-40 ${
      state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } w-64`}>
      <div className="flex flex-col h-full">
        {/* Logo and Brand */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Classifications</h1>
              <p className="text-xs text-muted-foreground">Enterprise Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
              <div className="space-y-1">
                {QUICK_ACTIONS.slice(0, 4).map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Classification Versions */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Classification Versions</h3>
              <div className="space-y-2">
                {CLASSIFICATION_VERSIONS.map((version) => (
                  <div key={version.id}>
                    <Button
                      variant={state.currentVersion === version.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleVersionChange(version.id)}
                    >
                      <version.icon className="h-4 w-4 mr-2" />
                      {version.name}
                    </Button>
                    
                    {state.currentVersion === version.id && (
                      <div className="ml-6 mt-1 space-y-1">
                        {version.components.map((component) => (
                          <Button
                            key={component.id}
                            variant={state.currentComponent === component.id ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleComponentSelect(component.id)}
                          >
                            <component.icon className="h-3 w-3 mr-2" />
                            {component.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* System Status */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall</span>
                  <Badge variant="outline" className={`text-${getStatusColor(state.systemStatus.overall)}-600`}>
                    {state.systemStatus.overall}
                  </Badge>
                </div>
                {state.systemStatus.services.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{service.name}</span>
                    <span className={`text-${getStatusColor(service.status)}-600`}>
                      {formatUptime(service.uptime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src="/avatars/user.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium">John Doe</div>
                  <div className="text-xs text-muted-foreground">Admin</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2">
            {state.breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => {
                    if (index === 0) {
                      setState(prev => ({ ...prev, currentVersion: 'all', currentComponent: null }));
                    } else if (index === 1) {
                      handleVersionChange(crumb.id as ClassificationVersion);
                    }
                  }}
                >
                  {crumb.label}
                </Button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classifications, models, workflows, and more..."
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-16"
            />
            {/* Advanced Search Results Dropdown */}
            {state.searchResults && state.searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                <ScrollArea className="max-h-96">
                  <div className="p-4">
                    {/* Search Summary */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        {state.searchResults.totalResults} results for "{state.searchResults.query}"
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, searchResults: null, searchQuery: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Search Categories */}
                    {Object.entries(state.searchResults.categories).map(([category, results]) => {
                      if (!Array.isArray(results) || results.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-4">
                          <h4 className="text-sm font-medium capitalize mb-2 flex items-center">
                            {category === 'classifications' && <Database className="h-4 w-4 mr-2" />}
                            {category === 'models' && <Brain className="h-4 w-4 mr-2" />}
                            {category === 'workflows' && <Workflow className="h-4 w-4 mr-2" />}
                            {category === 'frameworks' && <Building className="h-4 w-4 mr-2" />}
                            {category === 'rules' && <Zap className="h-4 w-4 mr-2" />}
                            {category === 'users' && <Users className="h-4 w-4 mr-2" />}
                            {category === 'reports' && <FileText className="h-4 w-4 mr-2" />}
                            {category} ({results.length})
                          </h4>
                          <div className="space-y-1">
                            {results.slice(0, 3).map((result: any, index: number) => (
                              <div
                                key={result.id || index}
                                className="p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => handleSearchResultClick(result, category)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                      {result.name || result.title || result.label || 'Unnamed'}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {result.description || result.summary || 'No description'}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-2">
                                    {result.confidence && (
                                      <Badge variant="outline" className="text-xs">
                                        {(result.confidence * 100).toFixed(0)}%
                                      </Badge>
                                    )}
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {results.length > 3 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => handleViewAllResults(category)}
                              >
                                View all {results.length} {category}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Search Suggestions */}
                    {state.searchResults.suggestions && state.searchResults.suggestions.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                        <div className="flex flex-wrap gap-2">
                          {state.searchResults.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => handleSearch(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Queries */}
                    {state.searchResults.relatedQueries && state.searchResults.relatedQueries.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium mb-2">Related Searches</h4>
                        <div className="space-y-1">
                          {state.searchResults.relatedQueries.map((query, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="text-xs justify-start h-6 w-full"
                              onClick={() => handleSearch(query)}
                            >
                              <Search className="h-3 w-3 mr-2" />
                              {query}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Results */}
                    {state.searchResults.totalResults === 0 && !state.searchResults.error && (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No results found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try different keywords or check suggestions above
                        </p>
                      </div>
                    )}

                    {/* Error State */}
                    {state.searchResults.error && (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600">{state.searchResults.error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleSearch(state.searchQuery)}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Command Palette */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, commandPaletteOpen: true }))}
          >
            <CommandIcon className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {getUnreadNotificationsCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {getUnreadNotificationsCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Notifications</h4>
                  <Button variant="ghost" size="sm">
                    Mark all read
                  </Button>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {(notifications || []).slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${!notification.read ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <h5 className="font-medium mt-1">{notification.title}</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            {notification.actions.length > 0 && (
                              <div className="flex space-x-2 mt-2">
                                {notification.actions.map((action) => (
                                  <Button
                                    key={action.id}
                                    size="sm"
                                    variant={action.type === 'primary' ? 'default' : 'outline'}
                                    onClick={() => handleNotificationAction(notification.id, action.id)}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          {/* Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Monitor className="h-4 w-4 mr-2" />
                System Health
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Database className="h-4 w-4 mr-2" />
                Data Management
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="h-4 w-4 mr-2" />
                Security
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Palette className="h-4 w-4 mr-2" />
                Theme
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {THEMES.map((theme) => (
                      <DropdownMenuItem
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id as Theme)}
                      >
                        {theme.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Real-time indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${state.realTimeMode ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-xs text-muted-foreground">
              {state.realTimeMode ? 'Live' : 'Static'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section with Intelligent Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Advanced Classifications Intelligence Platform</h2>
            <p className="text-muted-foreground mb-4">
              Enterprise-grade classification system with AI-powered intelligence, real-time orchestration, and advanced analytics
            </p>
            {/* Intelligent System Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  state.systemStatus.overall === 'healthy' ? 'bg-green-500' :
                  state.systemStatus.overall === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">
                  System: {state.systemStatus.overall}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  {state.activeWorkflows.length} Active Workflows
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="text-sm">
                  Real-time Mode: {state.realTimeMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleQuickAction('new-classification')}>
              <Plus className="h-4 w-4 mr-2" />
              New Classification
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('run-analysis')}>
              <Brain className="h-4 w-4 mr-2" />
              Run Analysis
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('system-health')}>
              <Monitor className="h-4 w-4 mr-2" />
              System Health
            </Button>
          </div>
        </div>
      </div>

      {/* Active Workflows Section */}
      {state.activeWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Workflow className="h-5 w-5 mr-2" />
              Active Workflows
            </CardTitle>
            <CardDescription>
              Real-time workflow orchestration and monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.activeWorkflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant={workflow.status === 'completed' ? 'default' : 
                                   workflow.status === 'failed' ? 'destructive' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                      <h4 className="font-medium">{workflow.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        Priority: {workflow.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Started: {new Date(workflow.startTime).toLocaleTimeString()}</span>
                      <span>Owner: {workflow.owner}</span>
                      <span>Accuracy: {(workflow.metrics.accuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{workflow.progress}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewWorkflowProgress(workflow.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classifications</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classifications?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {classificationsLoading ? 'Loading...' : 'Total classifications'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(aiModels?.length || 0) + (mlModels?.length || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {aiLoading || mlLoading ? 'Loading...' : `${trainingJobs?.filter(j => j.status === 'running').length || 0} training`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.performance?.averageAccuracy 
                ? `${(systemMetrics.performance.averageAccuracy * 100).toFixed(1)}%` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {monitoringLoading ? 'Loading...' : 'Average accuracy'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.performance?.averageResponseTime 
                ? `${systemMetrics.performance.averageResponseTime}ms` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {monitoringLoading ? 'Loading...' : 'Response time'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Welcome Section with RBAC Context */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={rbac.currentUser?.avatar} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {rbac.currentUser?.username?.charAt(0)?.toUpperCase() || 
                   rbac.currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome back, {rbac.currentUser?.username || rbac.currentUser?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className="text-gray-600">
                  Role: <Badge variant="outline" className="ml-1">{rbac.currentUser?.role}</Badge>
                  {rbac.currentUser?.department && (
                    <span className="ml-2">Department: <Badge variant="outline" className="ml-1">{rbac.currentUser.department}</Badge></span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <rbac.PermissionGuard permission="classification.admin.system_config">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  System Config
                </Button>
              </rbac.PermissionGuard>
              <Button variant="outline" size="sm" onClick={rbac.refreshUser}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Classification Analytics</CardTitle>
            <CardDescription>
              24-hour classification activity and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" fill={CHART_COLORS[0]} stroke={CHART_COLORS[0]} fillOpacity={0.3} />
                  <Bar dataKey="classifications" fill={CHART_COLORS[1]} />
                  <Line type="monotone" dataKey="accuracy" stroke={CHART_COLORS[2]} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {(activities || []).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Active Workflows Section */}
      {activeWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Active Workflows ({activeWorkflows.length})
              </CardTitle>
              <rbac.PermissionGuard permission="classification.workflows.manage">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage All
                </Button>
              </rbac.PermissionGuard>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeWorkflows.slice(0, 3).map((workflow) => {
                const progress = getWorkflowProgress(workflow.id);
                return (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <p className="text-sm text-gray-600">
                          Step {workflow.currentStepIndex + 1} of {workflow.steps.length}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          workflow.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          workflow.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {workflow.status}
                        </Badge>
                        <rbac.PermissionGuard permission="classification.workflows.manage">
                          <div className="flex space-x-1">
                            {workflow.status === 'running' && (
                              <Button size="sm" variant="outline" onClick={() => pauseWorkflow(workflow.id)}>
                                <Pause className="h-3 w-3" />
                              </Button>
                            )}
                            {workflow.status === 'paused' && (
                              <Button size="sm" variant="outline" onClick={() => resumeWorkflow(workflow.id)}>
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => cancelWorkflow(workflow.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </rbac.PermissionGuard>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{Math.round(progress)}% complete</span>
                      <span>Started {new Date(workflow.startTime).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
              {activeWorkflows.length > 3 && (
                <Button variant="outline" className="w-full">
                  View All {activeWorkflows.length} Workflows
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Start Workflows */}
      <rbac.PermissionGuard permission="classification.workflows.execute">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Quick Start Workflows
            </CardTitle>
            <CardDescription>
              Launch pre-built workflows to accelerate your classification tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableTemplates.slice(0, 3).map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-sm">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span>Complexity</span>
                        <Badge variant="outline" className="text-xs">{template.complexity}</Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Duration</span>
                        <span>{Math.round(template.estimatedTotalDuration / 60)} min</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Steps</span>
                        <span>{template.steps.length}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => executeWorkflow(template.id)}
                      disabled={isExecuting}
                    >
                      {isExecuting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-2" />
                          Start Workflow
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </rbac.PermissionGuard>

      {/* Classification Versions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CLASSIFICATION_VERSIONS.map((version) => (
          <Card key={version.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleVersionChange(version.id)}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-${version.color}-100 dark:bg-${version.color}-900 flex items-center justify-center`}>
                  <version.icon className={`h-6 w-6 text-${version.color}-600`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{version.name}</CardTitle>
                  <CardDescription className="text-sm">{version.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Components</span>
                  <Badge variant="outline">{version.components.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Button size="sm" className="w-full mt-3">
                  Explore {version.name}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>
            Real-time system performance and resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{systemMetrics?.cpu || 0}%</span>
              </div>
              <Progress value={systemMetrics?.cpu || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{systemMetrics?.memory || 0}%</span>
              </div>
              <Progress value={systemMetrics?.memory || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network I/O</span>
                <span className="text-sm text-muted-foreground">{systemMetrics?.network || 0}%</span>
              </div>
              <Progress value={systemMetrics?.network || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm text-muted-foreground">{systemMetrics?.storage || 0}%</span>
              </div>
              <Progress value={systemMetrics?.storage || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommandPalette = () => (
    <Dialog open={state.commandPaletteOpen} onOpenChange={(open) => setState(prev => ({ ...prev, commandPaletteOpen: open }))}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Type a command or search for anything
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              {QUICK_ACTIONS.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => {
                    handleQuickAction(action.id);
                    setState(prev => ({ ...prev, commandPaletteOpen: false }));
                  }}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {action.shortcut}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Navigation">
              {CLASSIFICATION_VERSIONS.map((version) => (
                <CommandItem
                  key={version.id}
                  onSelect={() => {
                    handleVersionChange(version.id);
                    setState(prev => ({ ...prev, commandPaletteOpen: false }));
                  }}
                >
                  <version.icon className="h-4 w-4 mr-2" />
                  Go to {version.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Components">
              {CLASSIFICATION_VERSIONS.flatMap(v => v.components).map((component) => (
                <CommandItem
                  key={component.id}
                  onSelect={() => {
                    handleComponentSelect(component.id);
                    setState(prev => ({ ...prev, commandPaletteOpen: false }));
                  }}
                >
                  <component.icon className="h-4 w-4 mr-2" />
                  Open {component.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );

  // Main render
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          state.sidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          {/* Header */}
          {renderHeader()}

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 dark:text-red-200">{state.error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, error: null }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {state.isLoading && (
                <div className="mb-6">
                  <LoadingSpinner />
                </div>
              )}

              {/* Render current view */}
              {state.currentComponent ? renderComponent() : renderDashboard()}
            </div>
          </main>
        </div>

        {/* Command Palette */}
        {renderCommandPalette()}

        {/* Overlay for mobile sidebar */}
        {state.sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setState(prev => ({ ...prev, sidebarOpen: false }))}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

// Main Component with RBAC Provider Wrapper
export const ClassificationsSPA: React.FC<ClassificationsSPAProps> = (props) => {
  return (
    <ClassificationsRBACProvider>
      <ClassificationProvider>
        <IntelligenceProvider>
          <ClassificationsSPAInternal {...props} />
        </IntelligenceProvider>
      </ClassificationProvider>
    </ClassificationsRBACProvider>
  );
};

export default ClassificationsSPA;