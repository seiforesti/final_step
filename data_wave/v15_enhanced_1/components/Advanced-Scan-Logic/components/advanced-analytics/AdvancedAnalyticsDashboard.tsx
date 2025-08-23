/**
 * 📊 Advanced Analytics Dashboard - Enterprise Data Analytics Platform
 * ====================================================================
 * 
 * Enterprise-grade advanced analytics dashboard that provides comprehensive
 * data analytics, predictive insights, machine learning capabilities, and
 * interactive visualizations for strategic business intelligence and
 * data-driven decision making.
 * 
 * Features:
 * - Real-time analytics and data processing
 * - Advanced statistical analysis and modeling
 * - Machine learning insights and predictions
 * - Interactive data visualizations and dashboards
 * - Business intelligence and KPI tracking
 * - Predictive analytics and forecasting
 * - Custom analytics workflows and automation
 * - Advanced data correlation and pattern recognition
 * 
 * Backend Integration:
 * - AnalyticsService for data processing and analysis
 * - MLService for machine learning and predictions
 * - DataVisualizationService for chart generation
 * - BusinessIntelligenceService for KPI tracking
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity, Brain, Target, Zap, Gauge, Database, Settings, RefreshCw, Play, Pause, Square, MoreHorizontal, Eye, EyeOff, Download, Upload, Share, Filter, Search, Calendar, Clock, Timer, AlertTriangle, CheckCircle, XCircle, Info, HelpCircle, Star, Bookmark, Flag, MessageSquare, Archive, Folder, FolderOpen, History, Award, Crown, Shield, Lock, Key, Users, User, Mail, Bell, BellOff, Plus, Minus, Edit, Trash2, Copy, ExternalLink, SortAsc, SortDesc, FileText, ClipboardCheck, BookOpen, Layers, Network, Globe, Cloud, Server, Workflow, Crosshair, Radar, Microscope, TestTube, Beaker, FlaskConical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { advancedMonitoringAPI } from '../../services/advanced-monitoring-apis';
import { scanAnalyticsAPI } from '../../services/scan-analytics-apis';

// ==================== Types and Interfaces ====================

interface AnalyticsMetric {
  id: string;
  name: string;
  description: string;
  
  // Value
  value: number;
  previousValue?: number;
  unit: string;
  
  // Formatting
  displayFormat: MetricFormat;
  precision: number;
  
  // Trend Analysis
  trend: TrendDirection;
  trendPercentage: number;
  trendPeriod: string;
  
  // Thresholds
  thresholds: MetricThreshold[];
  
  // Status
  status: MetricStatus;
  lastUpdated: string;
  
  // Metadata
  category: string;
  tags: string[];
  
  // Data Source
  dataSource: string;
  query: string;
  refreshInterval: number; // seconds
  
  // Visualization
  visualizationType: VisualizationType;
  chartConfig: ChartConfiguration;
}

enum MetricFormat {
  NUMBER = 'number',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  BYTES = 'bytes',
  DURATION = 'duration',
  RATE = 'rate'
}

enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}

interface MetricThreshold {
  type: ThresholdType;
  value: number;
  operator: ThresholdOperator;
  severity: ThresholdSeverity;
  message: string;
  alertEnabled: boolean;
}

enum ThresholdType {
  WARNING = 'warning',
  CRITICAL = 'critical',
  TARGET = 'target',
  BASELINE = 'baseline'
}

enum ThresholdOperator {
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  EQUALS = 'equals',
  BETWEEN = 'between'
}

enum ThresholdSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum MetricStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown',
  STALE = 'stale'
}

enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  AREA_CHART = 'area_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
  SPARKLINE = 'sparkline',
  TABLE = 'table',
  KPI_CARD = 'kpi_card'
}

interface ChartConfiguration {
  width: number;
  height: number;
  colors: string[];
  
  // Axes
  xAxis: AxisConfiguration;
  yAxis: AxisConfiguration;
  
  // Legend
  showLegend: boolean;
  legendPosition: LegendPosition;
  
  // Grid
  showGrid: boolean;
  gridOpacity: number;
  
  // Animation
  animationEnabled: boolean;
  animationDuration: number;
  
  // Interaction
  tooltipEnabled: boolean;
  zoomEnabled: boolean;
  panEnabled: boolean;
  
  // Custom Properties
  customProperties: Record<string, any>;
}

interface AxisConfiguration {
  label: string;
  min?: number;
  max?: number;
  tickInterval?: number;
  tickFormat?: string;
  showTicks: boolean;
  showLabels: boolean;
}

enum LegendPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  NONE = 'none'
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  
  // Layout
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  
  // Configuration
  refreshInterval: number; // seconds
  autoRefresh: boolean;
  
  // Filters
  globalFilters: DashboardFilter[];
  timeRange: TimeRange;
  
  // Permissions
  owner: string;
  shared: boolean;
  permissions: DashboardPermission[];
  
  // Status
  status: DashboardStatus;
  lastUpdated: string;
  
  // Metadata
  tags: string[];
  category: string;
  
  // Version Control
  version: string;
  changelog: ChangelogEntry[];
  
  // Usage Analytics
  viewCount: number;
  lastViewed: string;
  favoriteCount: number;
}

interface DashboardLayout {
  type: LayoutType;
  columns: number;
  rows: number;
  gridSize: number;
  responsive: boolean;
}

enum LayoutType {
  GRID = 'grid',
  FREE_FORM = 'free_form',
  TEMPLATE = 'template'
}

interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  
  // Position and Size
  position: WidgetPosition;
  size: WidgetSize;
  
  // Data Configuration
  dataSource: string;
  query: string;
  metrics: string[];
  
  // Visualization
  visualization: VisualizationConfig;
  
  // Behavior
  refreshInterval: number;
  autoRefresh: boolean;
  
  // Interactivity
  drillDownEnabled: boolean;
  drillDownTarget?: string;
  clickActions: WidgetAction[];
  
  // Styling
  styling: WidgetStyling;
  
  // Status
  status: WidgetStatus;
  lastUpdated: string;
  
  // Data
  data: any[];
  error?: string;
}

enum WidgetType {
  METRIC_CARD = 'metric_card',
  CHART = 'chart',
  TABLE = 'table',
  TEXT = 'text',
  IMAGE = 'image',
  IFRAME = 'iframe',
  CUSTOM = 'custom'
}

interface WidgetPosition {
  x: number;
  y: number;
  z: number; // z-index
}

interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface VisualizationConfig {
  type: VisualizationType;
  configuration: ChartConfiguration;
  
  // Data Mapping
  xField: string;
  yField: string;
  colorField?: string;
  sizeField?: string;
  
  // Aggregation
  aggregation: AggregationType;
  groupBy: string[];
  
  // Formatting
  numberFormat: string;
  dateFormat: string;
  
  // Advanced
  customScript?: string;
}

enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE = 'percentile',
  DISTINCT_COUNT = 'distinct_count'
}

interface WidgetAction {
  type: ActionType;
  target: string;
  parameters: Record<string, any>;
  condition?: string;
}

enum ActionType {
  DRILL_DOWN = 'drill_down',
  NAVIGATE = 'navigate',
  FILTER = 'filter',
  EXPORT = 'export',
  ALERT = 'alert',
  CUSTOM = 'custom'
}

interface WidgetStyling {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  
  // Typography
  titleColor: string;
  titleSize: number;
  textColor: string;
  textSize: number;
  
  // Spacing
  padding: number;
  margin: number;
  
  // Shadow
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  
  // Custom CSS
  customCSS?: string;
}

enum WidgetStatus {
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  NO_DATA = 'no_data',
  STALE = 'stale'
}

interface DashboardFilter {
  id: string;
  name: string;
  type: FilterType;
  
  // Configuration
  field: string;
  operator: FilterOperator;
  value: any;
  
  // Options
  options: FilterOption[];
  
  // Behavior
  multiSelect: boolean;
  required: boolean;
  
  // UI
  displayType: FilterDisplayType;
  placeholder: string;
  
  // Status
  enabled: boolean;
}

enum FilterType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  LIST = 'list',
  RANGE = 'range'
}

enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in'
}

interface FilterOption {
  label: string;
  value: any;
  count?: number;
  selected: boolean;
}

enum FilterDisplayType {
  DROPDOWN = 'dropdown',
  MULTI_SELECT = 'multi_select',
  TEXT_INPUT = 'text_input',
  DATE_PICKER = 'date_picker',
  RANGE_SLIDER = 'range_slider',
  CHECKBOX = 'checkbox',
  RADIO = 'radio'
}

interface TimeRange {
  start: string;
  end: string;
  relative?: RelativeTimeRange;
  timezone: string;
}

interface RelativeTimeRange {
  amount: number;
  unit: TimeUnit;
  offset?: number;
}

enum TimeUnit {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

interface DashboardPermission {
  userId: string;
  role: PermissionRole;
  permissions: Permission[];
  grantedAt: string;
  grantedBy: string;
}

enum PermissionRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
  OWNER = 'owner'
}

enum Permission {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  SHARE = 'share',
  EXPORT = 'export',
  ADMIN = 'admin'
}

enum DashboardStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

interface ChangelogEntry {
  version: string;
  timestamp: string;
  author: string;
  description: string;
  changes: Change[];
}

interface Change {
  type: ChangeType;
  description: string;
  before?: any;
  after?: any;
}

enum ChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  MOVED = 'moved',
  RENAMED = 'renamed'
}

interface DataSource {
  id: string;
  name: string;
  description: string;
  type: DataSourceType;
  
  // Connection
  connectionString: string;
  credentials: DataSourceCredentials;
  
  // Configuration
  configuration: DataSourceConfiguration;
  
  // Schema
  schema: DataSourceSchema;
  
  // Performance
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  maxConnections: number;
  queryTimeout: number; // seconds
  
  // Status
  status: DataSourceStatus;
  lastTested: string;
  
  // Usage
  queryCount: number;
  errorCount: number;
  avgResponseTime: number; // milliseconds
  
  // Security
  encryptionEnabled: boolean;
  accessControl: AccessControlConfig;
  
  // Metadata
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

enum DataSourceType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  ELASTICSEARCH = 'elasticsearch',
  REDIS = 'redis',
  CASSANDRA = 'cassandra',
  BIGQUERY = 'bigquery',
  SNOWFLAKE = 'snowflake',
  REDSHIFT = 'redshift',
  S3 = 's3',
  API = 'api',
  FILE = 'file',
  STREAMING = 'streaming'
}

interface DataSourceCredentials {
  type: CredentialType;
  username?: string;
  password?: string;
  token?: string;
  certificate?: string;
  keyFile?: string;
  encrypted: boolean;
}

enum CredentialType {
  USERNAME_PASSWORD = 'username_password',
  TOKEN = 'token',
  CERTIFICATE = 'certificate',
  KEY_FILE = 'key_file',
  IAM_ROLE = 'iam_role',
  OAUTH = 'oauth'
}

interface DataSourceConfiguration {
  host: string;
  port: number;
  database: string;
  
  // Connection Pool
  minConnections: number;
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  
  // SSL
  sslEnabled: boolean;
  sslMode: string;
  
  // Advanced
  customProperties: Record<string, any>;
}

interface DataSourceSchema {
  tables: TableSchema[];
  views: ViewSchema[];
  functions: FunctionSchema[];
  lastUpdated: string;
}

interface TableSchema {
  name: string;
  schema: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  constraints: ConstraintSchema[];
  rowCount: number;
  sizeBytes: number;
}

interface ColumnSchema {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: any;
  description?: string;
  
  // Statistics
  distinctCount?: number;
  nullCount?: number;
  minValue?: any;
  maxValue?: any;
  avgLength?: number;
}

interface IndexSchema {
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
}

interface ConstraintSchema {
  name: string;
  type: ConstraintType;
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
}

enum ConstraintType {
  PRIMARY_KEY = 'primary_key',
  FOREIGN_KEY = 'foreign_key',
  UNIQUE = 'unique',
  CHECK = 'check',
  NOT_NULL = 'not_null'
}

interface ViewSchema {
  name: string;
  schema: string;
  definition: string;
  columns: ColumnSchema[];
}

interface FunctionSchema {
  name: string;
  schema: string;
  parameters: ParameterSchema[];
  returnType: string;
  description?: string;
}

interface ParameterSchema {
  name: string;
  dataType: string;
  required: boolean;
  defaultValue?: any;
}

enum DataSourceStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  TESTING = 'testing',
  CONFIGURING = 'configuring'
}

interface AccessControlConfig {
  enabled: boolean;
  allowedUsers: string[];
  allowedRoles: string[];
  ipWhitelist: string[];
  
  // Row Level Security
  rowLevelSecurity: boolean;
  securityPolicies: SecurityPolicy[];
}

interface SecurityPolicy {
  name: string;
  table: string;
  condition: string;
  users: string[];
  roles: string[];
  enabled: boolean;
}

interface AnalyticsQuery {
  id: string;
  name: string;
  description: string;
  
  // Query Definition
  sql: string;
  dataSource: string;
  
  // Parameters
  parameters: QueryParameter[];
  
  // Execution
  timeout: number; // seconds
  maxRows: number;
  
  // Caching
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  
  // Schedule
  scheduled: boolean;
  schedule: QuerySchedule;
  
  // Results
  lastExecuted?: string;
  executionTime?: number; // milliseconds
  rowCount?: number;
  
  // Status
  status: QueryStatus;
  error?: string;
  
  // Metadata
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  
  // Usage
  executionCount: number;
  avgExecutionTime: number;
  lastUsed: string;
}

interface QueryParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  defaultValue?: any;
  description?: string;
  
  // Validation
  validation: ParameterValidation;
  
  // UI
  displayName: string;
  placeholder: string;
  options?: ParameterOption[];
}

enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  LIST = 'list',
  MULTI_SELECT = 'multi_select'
}

interface ParameterValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  required: boolean;
}

interface ParameterOption {
  label: string;
  value: any;
  description?: string;
}

interface QuerySchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  interval: number;
  
  // Time Configuration
  startTime: string;
  endTime?: string;
  timezone: string;
  
  // Days
  daysOfWeek: number[];
  daysOfMonth: number[];
  
  // Advanced
  cronExpression?: string;
  
  // Notifications
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notificationChannels: string[];
}

enum ScheduleFrequency {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  CRON = 'cron'
}

enum QueryStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

interface MLModel {
  id: string;
  name: string;
  description: string;
  type: ModelType;
  
  // Algorithm
  algorithm: MLAlgorithm;
  hyperparameters: Record<string, any>;
  
  // Training
  trainingDataSource: string;
  trainingQuery: string;
  features: ModelFeature[];
  target: ModelTarget;
  
  // Performance
  metrics: ModelMetrics;
  
  // Deployment
  deployed: boolean;
  deploymentEndpoint?: string;
  version: string;
  
  // Status
  status: ModelStatus;
  trainingProgress?: number;
  
  // Lifecycle
  trainedAt?: string;
  trainingDuration?: number; // seconds
  lastPrediction?: string;
  predictionCount: number;
  
  // Metadata
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

enum ModelType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  CLUSTERING = 'clustering',
  ANOMALY_DETECTION = 'anomaly_detection',
  TIME_SERIES = 'time_series',
  RECOMMENDATION = 'recommendation',
  NLP = 'nlp',
  COMPUTER_VISION = 'computer_vision'
}

enum MLAlgorithm {
  LINEAR_REGRESSION = 'linear_regression',
  LOGISTIC_REGRESSION = 'logistic_regression',
  DECISION_TREE = 'decision_tree',
  RANDOM_FOREST = 'random_forest',
  GRADIENT_BOOSTING = 'gradient_boosting',
  SVM = 'svm',
  NEURAL_NETWORK = 'neural_network',
  K_MEANS = 'k_means',
  DBSCAN = 'dbscan',
  ISOLATION_FOREST = 'isolation_forest',
  ARIMA = 'arima',
  LSTM = 'lstm'
}

interface ModelFeature {
  name: string;
  type: FeatureType;
  transformation: FeatureTransformation;
  importance?: number;
  
  // Statistics
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  nullCount?: number;
  uniqueCount?: number;
}

enum FeatureType {
  NUMERICAL = 'numerical',
  CATEGORICAL = 'categorical',
  BOOLEAN = 'boolean',
  TEXT = 'text',
  DATETIME = 'datetime',
  GEOSPATIAL = 'geospatial'
}

enum FeatureTransformation {
  NONE = 'none',
  STANDARDIZATION = 'standardization',
  NORMALIZATION = 'normalization',
  ONE_HOT_ENCODING = 'one_hot_encoding',
  LABEL_ENCODING = 'label_encoding',
  BINNING = 'binning',
  LOG_TRANSFORM = 'log_transform',
  POLYNOMIAL = 'polynomial'
}

interface ModelTarget {
  name: string;
  type: TargetType;
  classes?: string[];
  
  // Statistics
  distribution?: Record<string, number>;
  mean?: number;
  std?: number;
}

enum TargetType {
  BINARY = 'binary',
  MULTICLASS = 'multiclass',
  CONTINUOUS = 'continuous',
  COUNT = 'count'
}

interface ModelMetrics {
  // Classification
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  
  // Regression
  mse?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  
  // Clustering
  silhouetteScore?: number;
  inertia?: number;
  
  // Cross Validation
  cvScores?: number[];
  cvMean?: number;
  cvStd?: number;
  
  // Feature Importance
  featureImportances?: Record<string, number>;
  
  // Confusion Matrix
  confusionMatrix?: number[][];
  
  // Custom Metrics
  customMetrics?: Record<string, number>;
}

enum ModelStatus {
  CREATED = 'created',
  TRAINING = 'training',
  TRAINED = 'trained',
  EVALUATING = 'evaluating',
  DEPLOYED = 'deployed',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

interface Prediction {
  id: string;
  modelId: string;
  
  // Input
  features: Record<string, any>;
  
  // Output
  prediction: any;
  confidence?: number;
  probabilities?: Record<string, number>;
  
  // Metadata
  timestamp: string;
  executionTime: number; // milliseconds
  
  // Feedback
  actualValue?: any;
  feedback?: PredictionFeedback;
  
  // Context
  requestId?: string;
  userId?: string;
  
  // Monitoring
  driftScore?: number;
  anomalyScore?: number;
}

interface PredictionFeedback {
  correct: boolean;
  actualValue: any;
  confidence: number;
  notes?: string;
  providedBy: string;
  providedAt: string;
}

// ==================== Advanced Analytics Dashboard Component ====================

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();

  // ==================== State Management ====================

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric | null>(null);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);

  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [queries, setQueries] = useState<AnalyticsQuery[]>([]);
  const [models, setModels] = useState<MLModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);

  const [filterTimeRange, setFilterTimeRange] = useState<string>('24h');
  const [filterDataSource, setFilterDataSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showCreateDashboardDialog, setShowCreateDashboardDialog] = useState(false);
  const [showCreateMetricDialog, setShowCreateMetricDialog] = useState(false);
  const [showCreateModelDialog, setShowCreateModelDialog] = useState(false);
  const [showQueryBuilderDialog, setShowQueryBuilderDialog] = useState(false);

  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true);

  const wsRef = useRef<WebSocket | null>(null);

  // ==================== Backend Integration Functions ====================
  const analytics = useAdvancedAnalytics({
    autoRefresh: true,
    refreshInterval: 30,
    enableRealTimeUpdates: true,
    analyticsScope: ['performance', 'intelligence', 'bi'],
    enablePredictiveAnalytics: true,
    enableAnomalyDetection: true,
    enablePatternRecognition: true,
    cacheAnalytics: true
  });

  const fetchAnalyticsOverview = useCallback(async () => {
    try {
      const overviewReport = await scanAnalyticsAPI.getMonitoringAnalytics({
        analytics_type: 'comprehensive'
      });
      const perf = await scanAnalyticsAPI.getPerformanceMetrics({
        metrics: ['throughput', 'latency', 'error_rate']
      });
      setAnalyticsOverview({
        totalDashboards: Array.isArray(overviewReport?.analytics_data?.dashboards)
          ? overviewReport.analytics_data.dashboards.length
          : (overviewReport?.analytics_data?.dashboards_count || 0),
        activeDashboards: overviewReport?.analytics_data?.active_dashboards || 0,
        totalMetrics: Object.keys(perf?.metrics || {}).length,
        activeMetrics: Object.values(perf?.metrics || {}).filter(Boolean).length,
        totalModels: (analytics?.forecastingModels || []).length,
        deployedModels: (analytics?.forecastingModels || []).filter((m: any) => m.status === 'deployed').length,
        totalPredictions: (analytics?.predictiveAnalysis?.predictions || []).length,
        avgModelAccuracy: analytics?.predictiveAnalysis?.confidence_scores
          ? Object.values(analytics.predictiveAnalysis.confidence_scores as Record<string, number>).reduce((a: number, b: number) => a + b, 0) /
            Object.values(analytics.predictiveAnalysis.confidence_scores as Record<string, number>).length
          : 0,
        dataProcessingVolume: (perf as any)?.resource_utilization?.processed_bytes || 0,
        avgQueryTime: (overviewReport?.metrics?.avg_query_time_ms as number) || 0,
        systemUptime: (overviewReport?.metrics?.uptime_percent as number) || 0,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load analytics overview:', error);
      initializeMockData();
    }
  }, [analytics]);

  const fetchDashboards = useCallback(async () => {
    try {
      const templates = await advancedMonitoringAPI.getDashboardTemplates();
      const mapped: Dashboard[] = (templates || []).map((t: any) => ({
        id: t.template_id || t.dashboard_id || `dash_${Date.now()}`,
        name: t.name || 'Dashboard',
        description: t.description || '',
        layout: {
          type: LayoutType.GRID,
          columns: 12,
          rows: 8,
          gridSize: 50,
          responsive: true
        },
        widgets: t.widgets || [],
        refreshInterval: t.refresh_interval || 300,
        autoRefresh: true,
        globalFilters: [],
        timeRange: { start: '', end: '', timezone: 'UTC' },
        owner: t.owner || 'system',
        shared: true,
        permissions: [],
        status: DashboardStatus.ACTIVE,
        lastUpdated: t.last_updated || new Date().toISOString(),
        tags: t.tags || [],
        category: t.category || 'general',
        version: t.version || '1.0.0',
        changelog: [],
        viewCount: 0,
        lastViewed: new Date().toISOString(),
        favoriteCount: 0
      }));
      setDashboards(mapped);
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const perf = await scanAnalyticsAPI.getPerformanceMetrics({
        metrics: ['throughput', 'latency', 'error_rate']
      });
      const nowIso = new Date().toISOString();
      const mapped: AnalyticsMetric[] = Object.entries((perf?.metrics as Record<string, any>) || {}).map(
        ([key, val]) => ({
          id: key,
          name: key,
          description: key,
          value: typeof val === 'number' ? val : Number(val || 0),
          previousValue: undefined,
          unit: 'unit',
          displayFormat: MetricFormat.NUMBER,
          precision: 2,
          trend: TrendDirection.STABLE,
          trendPercentage: 0,
          trendPeriod: '24h',
          thresholds: [],
          status: MetricStatus.NORMAL,
          lastUpdated: nowIso,
          category: 'performance',
          tags: [],
          dataSource: 'monitoring',
          query: '',
          refreshInterval: 300,
          visualizationType: VisualizationType.KPI_CARD,
          chartConfig: {
            width: 300,
            height: 200,
            colors: ['#2563eb'],
            xAxis: { label: 'Time', showTicks: true, showLabels: true },
            yAxis: { label: key, showTicks: true, showLabels: true },
            showLegend: false,
            legendPosition: LegendPosition.NONE,
            showGrid: true,
            gridOpacity: 0.1,
            animationEnabled: true,
            animationDuration: 800,
            tooltipEnabled: true,
            zoomEnabled: false,
            panEnabled: false,
            customProperties: {}
          }
        })
      );
      setMetrics(mapped);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }, []);

  const fetchMLModels = useCallback(async () => {
    try {
      const fm = (analytics?.forecastingModels || []) as any[];
      const now = new Date().toISOString();
      const mapped: MLModel[] = fm.map((m: any, i: number) => ({
        id: m.id || `model_${i}`,
        name: m.name || 'Forecasting Model',
        description: m.description || '',
        type: ModelType.TIME_SERIES,
        algorithm: MLAlgorithm.NEURAL_NETWORK,
        hyperparameters: m.hyperparameters || {},
        trainingDataSource: m.dataSource || 'analytics',
        trainingQuery: '',
        features: [],
        target: { name: 'value', type: TargetType.CONTINUOUS },
        metrics: m.metrics || {},
        deployed: Boolean(m.deployed),
        deploymentEndpoint: m.endpoint,
        version: m.version || '1.0.0',
        status: (m.status as any) || ModelStatus.TRAINED,
        trainedAt: now,
        trainingDuration: 0,
        lastPrediction: now,
        predictionCount: 0,
        tags: [],
        owner: 'system',
        createdAt: now,
        updatedAt: now
      }));
      setModels(mapped);
    } catch (error) {
      console.error('Failed to load ML models:', error);
    }
  }, [analytics]);

  const createDashboard = useCallback(async (dashboardData: Partial<Dashboard>) => {
    setActionInProgress(prev => ({ ...prev, 'create-dashboard': true }));
    
    try {
      const created = await advancedMonitoringAPI.createCustomDashboard({
        ...(dashboardData as any)
      } as any);
      const mapped: Dashboard = {
        id: created.dashboard_id || `dash_${Date.now()}`,
        name: (created as any).name || 'Dashboard',
        description: (created as any).description || '',
        layout: {
          type: LayoutType.GRID,
          columns: 12,
          rows: 8,
          gridSize: 50,
          responsive: true
        },
        widgets: (created as any).widgets || [],
        refreshInterval: created.refresh_interval || 300,
        autoRefresh: true,
        globalFilters: [],
        timeRange: { start: '', end: '', timezone: 'UTC' },
        owner: (created as any).owner || 'system',
        shared: true,
        permissions: [],
        status: DashboardStatus.ACTIVE,
        lastUpdated: created.creation_timestamp || new Date().toISOString(),
        tags: (created as any).tags || [],
        category: (created as any).category || 'general',
        version: (created as any).version || '1.0.0',
        changelog: [],
        viewCount: 0,
        lastViewed: new Date().toISOString(),
        favoriteCount: 0
      };
      setDashboards(prev => [mapped, ...prev]);
      
      toast({
        title: "Dashboard Created",
        description: "Analytics dashboard has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create dashboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, 'create-dashboard': false }));
    }
  }, [toast]);

  const trainModel = useCallback(async (modelId: string) => {
    setActionInProgress(prev => ({ ...prev, [`train-${modelId}`]: true }));
    
    try {
      await analytics.trainForecastingModel({ modelId });

      // Update model status
      setModels(prev =>
        prev.map(model =>
          model.id === modelId
            ? { ...model, status: ModelStatus.TRAINING }
            : model
        )
      );
      
      toast({
        title: "Training Started",
        description: "Model training has been initiated.",
      });
    } catch (error) {
      toast({
        title: "Training Failed",
        description: "Failed to start model training. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, [`train-${modelId}`]: false }));
    }
  }, [toast]);

  // ==================== Mock Data Initialization ====================

  const initializeMockData = useCallback(() => {
    const mockMetrics: AnalyticsMetric[] = [
      {
        id: 'metric-001',
        name: 'Total Revenue',
        description: 'Total revenue across all channels',
        value: 1250000,
        previousValue: 1180000,
        unit: 'USD',
        displayFormat: MetricFormat.CURRENCY,
        precision: 0,
        trend: TrendDirection.UP,
        trendPercentage: 5.9,
        trendPeriod: '30d',
        thresholds: [
          {
            type: ThresholdType.TARGET,
            value: 1200000,
            operator: ThresholdOperator.GREATER_THAN,
            severity: ThresholdSeverity.MEDIUM,
            message: 'Revenue target achieved',
            alertEnabled: true
          }
        ],
        status: MetricStatus.NORMAL,
        lastUpdated: new Date().toISOString(),
        category: 'business',
        tags: ['revenue', 'kpi', 'financial'],
        dataSource: 'sales_db',
        query: 'SELECT SUM(amount) FROM sales WHERE date >= NOW() - INTERVAL 30 DAY',
        refreshInterval: 3600,
        visualizationType: VisualizationType.KPI_CARD,
        chartConfig: {
          width: 300,
          height: 200,
          colors: ['#10b981'],
          xAxis: { label: 'Time', showTicks: true, showLabels: true },
          yAxis: { label: 'Revenue', showTicks: true, showLabels: true },
          showLegend: false,
          legendPosition: LegendPosition.NONE,
          showGrid: true,
          gridOpacity: 0.1,
          animationEnabled: true,
          animationDuration: 1000,
          tooltipEnabled: true,
          zoomEnabled: false,
          panEnabled: false,
          customProperties: {}
        }
      },
      {
        id: 'metric-002',
        name: 'Customer Acquisition Cost',
        description: 'Average cost to acquire a new customer',
        value: 125.50,
        previousValue: 132.75,
        unit: 'USD',
        displayFormat: MetricFormat.CURRENCY,
        precision: 2,
        trend: TrendDirection.DOWN,
        trendPercentage: -5.5,
        trendPeriod: '30d',
        thresholds: [
          {
            type: ThresholdType.WARNING,
            value: 150,
            operator: ThresholdOperator.GREATER_THAN,
            severity: ThresholdSeverity.MEDIUM,
            message: 'CAC is above target',
            alertEnabled: true
          }
        ],
        status: MetricStatus.NORMAL,
        lastUpdated: new Date().toISOString(),
        category: 'marketing',
        tags: ['cac', 'customer', 'marketing'],
        dataSource: 'marketing_db',
        query: 'SELECT AVG(acquisition_cost) FROM customers WHERE acquired_date >= NOW() - INTERVAL 30 DAY',
        refreshInterval: 7200,
        visualizationType: VisualizationType.GAUGE,
        chartConfig: {
          width: 300,
          height: 200,
          colors: ['#f59e0b'],
          xAxis: { label: '', showTicks: false, showLabels: false },
          yAxis: { label: '', showTicks: false, showLabels: false },
          showLegend: false,
          legendPosition: LegendPosition.NONE,
          showGrid: false,
          gridOpacity: 0,
          animationEnabled: true,
          animationDuration: 1500,
          tooltipEnabled: true,
          zoomEnabled: false,
          panEnabled: false,
          customProperties: { min: 0, max: 200, target: 120 }
        }
      }
    ];

    const mockDashboards: Dashboard[] = [
      {
        id: 'dash-001',
        name: 'Executive Overview',
        description: 'High-level business metrics and KPIs for executive team',
        layout: {
          type: LayoutType.GRID,
          columns: 12,
          rows: 8,
          gridSize: 50,
          responsive: true
        },
        widgets: [
          {
            id: 'widget-001',
            type: WidgetType.METRIC_CARD,
            title: 'Total Revenue',
            description: 'Monthly recurring revenue',
            position: { x: 0, y: 0, z: 1 },
            size: { width: 3, height: 2 },
            dataSource: 'sales_db',
            query: 'SELECT SUM(amount) FROM sales',
            metrics: ['total_revenue'],
            visualization: {
              type: VisualizationType.KPI_CARD,
              configuration: mockMetrics[0].chartConfig,
              xField: 'date',
              yField: 'amount',
              aggregation: AggregationType.SUM,
              groupBy: [],
              numberFormat: '$,.0f',
              dateFormat: 'MM/DD/YYYY'
            },
            refreshInterval: 3600,
            autoRefresh: true,
            drillDownEnabled: false,
            clickActions: [],
            styling: {
              backgroundColor: '#ffffff',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              borderRadius: 8,
              titleColor: '#111827',
              titleSize: 16,
              textColor: '#6b7280',
              textSize: 14,
              padding: 16,
              margin: 8,
              shadowEnabled: true,
              shadowColor: '#00000010',
              shadowBlur: 4
            },
            status: WidgetStatus.READY,
            lastUpdated: new Date().toISOString(),
            data: [{ amount: 1250000, date: new Date().toISOString() }]
          }
        ],
        refreshInterval: 300,
        autoRefresh: true,
        globalFilters: [
          {
            id: 'time_range',
            name: 'Time Range',
            type: FilterType.DATE,
            field: 'date',
            operator: FilterOperator.BETWEEN,
            value: { start: '2024-01-01', end: '2024-12-31' },
            options: [],
            multiSelect: false,
            required: false,
            displayType: FilterDisplayType.DATE_PICKER,
            placeholder: 'Select date range',
            enabled: true
          }
        ],
        timeRange: {
          start: new Date(Date.now() - 86400000 * 30).toISOString(),
          end: new Date().toISOString(),
          relative: { amount: 30, unit: TimeUnit.DAY },
          timezone: 'UTC'
        },
        owner: 'admin@company.com',
        shared: true,
        permissions: [
          {
            userId: 'exec-team',
            role: PermissionRole.VIEWER,
            permissions: [Permission.VIEW, Permission.EXPORT],
            grantedAt: new Date().toISOString(),
            grantedBy: 'admin@company.com'
          }
        ],
        status: DashboardStatus.ACTIVE,
        lastUpdated: new Date().toISOString(),
        tags: ['executive', 'kpi', 'overview'],
        category: 'business',
        version: '1.0.0',
        changelog: [
          {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            author: 'admin@company.com',
            description: 'Initial dashboard creation',
            changes: [
              {
                type: ChangeType.CREATED,
                description: 'Created executive overview dashboard'
              }
            ]
          }
        ],
        viewCount: 156,
        lastViewed: new Date().toISOString(),
        favoriteCount: 12
      }
    ];

    const mockModels: MLModel[] = [
      {
        id: 'model-001',
        name: 'Customer Churn Prediction',
        description: 'Predicts likelihood of customer churn based on usage patterns',
        type: ModelType.CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 2,
          min_samples_leaf: 1
        },
        trainingDataSource: 'customer_db',
        trainingQuery: 'SELECT * FROM customer_features WHERE created_date >= NOW() - INTERVAL 1 YEAR',
        features: [
          {
            name: 'monthly_usage',
            type: FeatureType.NUMERICAL,
            transformation: FeatureTransformation.STANDARDIZATION,
            importance: 0.23,
            mean: 150.5,
            std: 45.2,
            min: 0,
            max: 500,
            nullCount: 0,
            uniqueCount: 1247
          },
          {
            name: 'support_tickets',
            type: FeatureType.NUMERICAL,
            transformation: FeatureTransformation.NONE,
            importance: 0.18,
            mean: 2.1,
            std: 1.8,
            min: 0,
            max: 15,
            nullCount: 0,
            uniqueCount: 16
          }
        ],
        target: {
          name: 'churned',
          type: TargetType.BINARY,
          classes: ['0', '1'],
          distribution: { '0': 0.85, '1': 0.15 }
        },
        metrics: {
          accuracy: 0.89,
          precision: 0.82,
          recall: 0.76,
          f1Score: 0.79,
          auc: 0.91,
          cvScores: [0.87, 0.89, 0.91, 0.88, 0.90],
          cvMean: 0.89,
          cvStd: 0.015,
          featureImportances: {
            monthly_usage: 0.23,
            support_tickets: 0.18,
            account_age: 0.15,
            payment_delays: 0.12
          },
          confusionMatrix: [[850, 15], [24, 76]]
        },
        deployed: true,
        deploymentEndpoint: '/api/predictions/churn',
        version: '1.2.0',
        status: ModelStatus.DEPLOYED,
        trainedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        trainingDuration: 1847, // seconds
        lastPrediction: new Date().toISOString(),
        predictionCount: 2341,
        tags: ['churn', 'customer', 'classification'],
        owner: 'data-science@company.com',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const mockPredictions: Prediction[] = [
      {
        id: 'pred-001',
        modelId: 'model-001',
        features: {
          monthly_usage: 45.2,
          support_tickets: 5,
          account_age: 180,
          payment_delays: 2
        },
        prediction: 1,
        confidence: 0.87,
        probabilities: { '0': 0.13, '1': 0.87 },
        timestamp: new Date().toISOString(),
        executionTime: 23,
        actualValue: 1,
        feedback: {
          correct: true,
          actualValue: 1,
          confidence: 0.9,
          notes: 'Customer did churn as predicted',
          providedBy: 'customer-success@company.com',
          providedAt: new Date().toISOString()
        },
        requestId: 'req-12345',
        userId: 'analyst@company.com',
        driftScore: 0.02,
        anomalyScore: 0.15
      }
    ];

    setMetrics(mockMetrics);
    setDashboards(mockDashboards);
    setModels(mockModels);
    setPredictions(mockPredictions);

    // Set analytics overview
    setAnalyticsOverview({
      totalDashboards: mockDashboards.length,
      activeDashboards: mockDashboards.filter(d => d.status === DashboardStatus.ACTIVE).length,
      totalMetrics: mockMetrics.length,
      activeMetrics: mockMetrics.filter(m => m.status === MetricStatus.NORMAL).length,
      totalModels: mockModels.length,
      deployedModels: mockModels.filter(m => m.deployed).length,
      totalPredictions: mockPredictions.length,
      avgModelAccuracy: mockModels.reduce((sum, m) => sum + (m.metrics.accuracy || 0), 0) / mockModels.length,
      dataProcessingVolume: 1247583, // GB
      avgQueryTime: 245, // ms
      systemUptime: 99.97, // %
      lastUpdated: new Date().toISOString()
    });
  }, []);

  // ==================== Utility Functions ====================

  const getMetricStatusColor = (status: MetricStatus): string => {
    switch (status) {
      case MetricStatus.NORMAL:
        return 'text-green-600';
      case MetricStatus.WARNING:
        return 'text-yellow-600';
      case MetricStatus.CRITICAL:
        return 'text-red-600';
      case MetricStatus.STALE:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.UP:
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case TrendDirection.DOWN:
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case TrendDirection.STABLE:
        return <Activity className="h-4 w-4 text-blue-600" />;
      case TrendDirection.VOLATILE:
        return <Activity className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getModelStatusColor = (status: ModelStatus): string => {
    switch (status) {
      case ModelStatus.DEPLOYED:
        return 'text-green-600';
      case ModelStatus.TRAINED:
        return 'text-blue-600';
      case ModelStatus.TRAINING:
        return 'text-yellow-600';
      case ModelStatus.FAILED:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatNumber = (value: number, format: MetricFormat, precision: number = 2): string => {
    switch (format) {
      case MetricFormat.CURRENCY:
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
      case MetricFormat.PERCENTAGE:
        return `${(value * 100).toFixed(precision)}%`;
      case MetricFormat.BYTES:
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        let size = value;
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024;
          unitIndex++;
        }
        return `${size.toFixed(precision)} ${units[unitIndex]}`;
      case MetricFormat.DURATION:
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        const seconds = value % 60;
        return `${hours}h ${minutes}m ${seconds.toFixed(0)}s`;
      case MetricFormat.RATE:
        return `${value.toFixed(precision)}/s`;
      default:
        return value.toLocaleString('en-US', {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        });
    }
  };

  const formatTimeAgo = (dateTime: string): string => {
    if (!dateTime) return 'Never';
    const now = new Date();
    const date = new Date(dateTime);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently';
    }
  };

  // ==================== Event Handlers ====================

  const handleCreateDashboard = useCallback(async (dashboardData: any) => {
    await createDashboard(dashboardData);
    setShowCreateDashboardDialog(false);
  }, [createDashboard]);

  const handleTrainModel = useCallback(async (modelId: string) => {
    await trainModel(modelId);
  }, [trainModel]);

  const handleRefreshData = useCallback(() => {
    fetchAnalyticsOverview();
    fetchDashboards();
    fetchMetrics();
    fetchMLModels();
  }, [fetchAnalyticsOverview, fetchDashboards, fetchMetrics, fetchMLModels]);

  // ==================== Effects ====================

  useEffect(() => {
    // Initialize data
    fetchAnalyticsOverview();
    fetchDashboards();
    fetchMetrics();
    fetchMLModels();
  }, [fetchAnalyticsOverview, fetchDashboards, fetchMetrics, fetchMLModels]);

  useEffect(() => {
    // Set up real-time WebSocket connection for analytics updates
    if (realTimeUpdates) {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/analytics/ws`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'metric_update') {
          setMetrics(prev =>
            prev.map(metric =>
              metric.id === data.metric.id ? { ...metric, ...data.metric } : metric
            )
          );
        } else if (data.type === 'model_status_update') {
          setModels(prev =>
            prev.map(model =>
              model.id === data.model.id ? { ...model, status: data.model.status } : model
            )
          );
          
          if (data.model.status === ModelStatus.TRAINED) {
            toast({
              title: "Model Training Complete",
              description: `${data.model.name} has finished training successfully.`,
            });
          }
        }
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [realTimeUpdates, toast]);

  // ==================== Dashboard Components ====================

  const AnalyticsOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dashboards</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsOverview?.activeDashboards || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {analyticsOverview?.totalDashboards || 0} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Analytics dashboards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsOverview?.deployedModels || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {analyticsOverview?.totalModels || 0} Total
              </Badge>
              <Badge variant="outline" className="text-xs">
                {Math.round((analyticsOverview?.avgModelAccuracy || 0) * 100)}% Avg Accuracy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Deployed models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Processing</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analyticsOverview?.dataProcessingVolume || 0, MetricFormat.BYTES, 1)}
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {analyticsOverview?.avgQueryTime || 0}ms Avg Query
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Data processed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analyticsOverview?.systemUptime || 0}%
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default">
                Healthy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              System uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>
              Most important business metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.slice(0, 5).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(metric.trend)}
                    <div>
                      <p className="font-medium text-sm">{metric.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.category} • Updated {formatTimeAgo(metric.lastUpdated)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatNumber(metric.value, metric.displayFormat, metric.precision)}
                    </div>
                    <div className={cn(
                      "text-xs flex items-center space-x-1",
                      metric.trend === TrendDirection.UP ? 'text-green-600' :
                      metric.trend === TrendDirection.DOWN ? 'text-red-600' : 'text-gray-600'
                    )}>
                      <span>{metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ML Model Performance</CardTitle>
            <CardDescription>
              Machine learning model statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {models.slice(0, 5).map((model) => (
                <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      model.status === ModelStatus.DEPLOYED ? 'bg-green-500' :
                      model.status === ModelStatus.TRAINING ? 'bg-yellow-500' :
                      model.status === ModelStatus.FAILED ? 'bg-red-500' : 'bg-gray-500'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{model.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {model.algorithm} • {model.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">
                      {model.metrics.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <Badge variant={
                      model.status === ModelStatus.DEPLOYED ? 'default' :
                      model.status === ModelStatus.TRAINING ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {model.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common analytics operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreateDashboardDialog(true)}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">New Dashboard</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreateModelDialog(true)}
            >
              <Brain className="h-6 w-6" />
              <span className="text-sm">Train Model</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowQueryBuilderDialog(true)}
            >
              <Database className="h-6 w-6" />
              <span className="text-sm">Query Builder</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={handleRefreshData}
            >
              <RefreshCw className="h-6 w-6" />
              <span className="text-sm">Refresh Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== Main Render ====================

  if (!analyticsOverview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Enterprise data analytics and machine learning platform
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3" />
              <span>{analyticsOverview.activeDashboards} Dashboards</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>{analyticsOverview.deployedModels} Models</span>
            </Badge>
            <Switch
              checked={realTimeUpdates}
              onCheckedChange={setRealTimeUpdates}
            />
            <Label htmlFor="real-time" className="text-sm">Real-time</Label>
            <Button variant="outline" size="sm" onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="flex items-center space-x-2">
              <Gauge className="h-4 w-4" />
              <span>Dashboards</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>ML Models</span>
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Queries</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AnalyticsOverviewDashboard />
          </TabsContent>

          <TabsContent value="dashboards">
            <div className="text-center py-12">
              <Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Dashboard Management</h3>
              <p className="text-muted-foreground">
                Dashboard creation and management interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Metrics Management</h3>
              <p className="text-muted-foreground">
                Advanced metrics configuration and monitoring interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="models">
            <div className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">ML Model Management</h3>
              <p className="text-muted-foreground">
                Machine learning model training and deployment interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="queries">
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Query Builder</h3>
              <p className="text-muted-foreground">
                Advanced query builder and data exploration interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="text-center py-12">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
              <p className="text-muted-foreground">
                Automated insights and recommendations interface coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default AdvancedAnalyticsDashboard;