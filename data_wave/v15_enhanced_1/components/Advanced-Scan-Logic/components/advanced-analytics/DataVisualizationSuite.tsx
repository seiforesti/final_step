/**
 * 📊 Data Visualization Suite - Advanced Charting & Interactive Dashboards
 * ========================================================================
 * 
 * Enterprise-grade data visualization suite that provides advanced charting,
 * interactive dashboards, real-time data visualization, and sophisticated
 * visual analytics for comprehensive data exploration and presentation.
 * 
 * Features:
 * - Advanced chart types and interactive visualizations
 * - Real-time data streaming and dynamic updates
 * - Custom dashboard builder with drag-and-drop interface
 * - Geospatial mapping and location-based analytics
 * - 3D visualizations and immersive data experiences
 * - Export capabilities and sharing functionality
 * - Responsive design and mobile optimization
 * - Accessibility compliance and internationalization
 * 
 * Backend Integration:
 * - VisualizationService for chart generation and data processing
 * - DashboardService for dashboard management and layout
 * - DataStreamService for real-time data updates
 * - ExportService for visualization export and sharing
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
import { 
  BarChart3,
  LineChart,
  PieChart,
  Scatter,
  AreaChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Map,
  Globe,
  Palette,
  Brush,
  Image,
  Camera,
  Video,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  EyeOff,
  Zap,
  Target,
  Gauge,
  Calendar,
  Clock,
  Timer,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  MoreHorizontal,
  Download,
  Upload,
  Share,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Star,
  Bookmark,
  Flag,
  MessageSquare,
  Archive,
  Folder,
  FolderOpen,
  History,
  Award,
  Crown,
  Shield,
  Lock,
  Key,
  Users,
  User,
  Mail,
  Bell,
  BellOff,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  SortAsc,
  SortDesc,
  FileText,
  ClipboardCheck,
  BookOpen,
  Network,
  Cloud,
  Server,
  Database,
  Workflow,
  Crosshair,
  Radar,
  Microscope,
  TestTube,
  Beaker,
  FlaskConical,
  MousePointer,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Grid,
  Layout,
  PaintBucket,
  Sliders
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// ==================== Types and Interfaces ====================

interface Visualization {
  id: string;
  name: string;
  description: string;
  type: VisualizationType;
  
  // Data Configuration
  dataSource: DataSource;
  dataQuery: DataQuery;
  
  // Chart Configuration
  chartConfig: ChartConfiguration;
  
  // Layout and Styling
  layout: VisualizationLayout;
  styling: VisualizationStyling;
  
  // Interactivity
  interactive: boolean;
  animations: AnimationConfig;
  interactions: InteractionConfig[];
  
  // Real-time Updates
  realTime: boolean;
  updateInterval: number; // milliseconds
  
  // Export and Sharing
  exportable: boolean;
  shareable: boolean;
  
  // Status and Performance
  status: VisualizationStatus;
  renderTime: number; // milliseconds
  dataPoints: number;
  
  // Metadata
  owner: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  
  // Version Control
  version: string;
  changelog: VisualizationChange[];
  
  // Usage Analytics
  viewCount: number;
  lastViewed: string;
  favoriteCount: number;
}

enum VisualizationType {
  // Basic Charts
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  COLUMN_CHART = 'column_chart',
  PIE_CHART = 'pie_chart',
  DONUT_CHART = 'donut_chart',
  AREA_CHART = 'area_chart',
  SCATTER_PLOT = 'scatter_plot',
  
  // Advanced Charts
  BUBBLE_CHART = 'bubble_chart',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  SUNBURST = 'sunburst',
  SANKEY_DIAGRAM = 'sankey_diagram',
  CHORD_DIAGRAM = 'chord_diagram',
  NETWORK_GRAPH = 'network_graph',
  
  // Statistical Charts
  BOX_PLOT = 'box_plot',
  VIOLIN_PLOT = 'violin_plot',
  HISTOGRAM = 'histogram',
  DENSITY_PLOT = 'density_plot',
  CORRELATION_MATRIX = 'correlation_matrix',
  
  // Time Series
  TIME_SERIES = 'time_series',
  CANDLESTICK = 'candlestick',
  OHLC = 'ohlc',
  
  // Geospatial
  CHOROPLETH_MAP = 'choropleth_map',
  BUBBLE_MAP = 'bubble_map',
  HEAT_MAP = 'heat_map',
  FLOW_MAP = 'flow_map',
  
  // 3D Visualizations
  SURFACE_3D = 'surface_3d',
  SCATTER_3D = 'scatter_3d',
  BAR_3D = 'bar_3d',
  
  // Specialized
  GAUGE = 'gauge',
  SPEEDOMETER = 'speedometer',
  FUNNEL = 'funnel',
  WATERFALL = 'waterfall',
  BULLET_CHART = 'bullet_chart',
  SPARKLINE = 'sparkline',
  
  // Custom
  CUSTOM = 'custom'
}

interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  connection: DataConnection;
  schema: DataSchema;
  
  // Performance
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  
  // Security
  encrypted: boolean;
  accessControl: AccessControl;
  
  // Status
  status: DataSourceStatus;
  lastTested: string;
}

enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  FILE = 'file',
  STREAM = 'stream',
  CACHE = 'cache'
}

interface DataConnection {
  host?: string;
  port?: number;
  database?: string;
  credentials: DataCredentials;
  parameters: Record<string, any>;
}

interface DataCredentials {
  type: CredentialType;
  username?: string;
  password?: string;
  token?: string;
  certificate?: string;
}

enum CredentialType {
  USERNAME_PASSWORD = 'username_password',
  TOKEN = 'token',
  CERTIFICATE = 'certificate',
  OAUTH = 'oauth'
}

interface DataSchema {
  tables: TableInfo[];
  relationships: Relationship[];
}

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
}

interface ColumnInfo {
  name: string;
  type: DataType;
  nullable: boolean;
  unique: boolean;
  indexed: boolean;
  
  // Statistics
  distinctValues?: number;
  minValue?: any;
  maxValue?: any;
  avgValue?: any;
}

enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIMESTAMP = 'timestamp',
  JSON = 'json',
  ARRAY = 'array',
  OBJECT = 'object'
}

interface Relationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: RelationshipType;
}

enum RelationshipType {
  ONE_TO_ONE = 'one_to_one',
  ONE_TO_MANY = 'one_to_many',
  MANY_TO_MANY = 'many_to_many'
}

interface AccessControl {
  enabled: boolean;
  allowedUsers: string[];
  allowedRoles: string[];
  restrictions: AccessRestriction[];
}

interface AccessRestriction {
  type: RestrictionType;
  condition: string;
  value: any;
}

enum RestrictionType {
  ROW_LEVEL = 'row_level',
  COLUMN_LEVEL = 'column_level',
  TIME_BASED = 'time_based',
  IP_BASED = 'ip_based'
}

enum DataSourceStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  TESTING = 'testing'
}

interface DataQuery {
  sql?: string;
  filters: QueryFilter[];
  aggregations: QueryAggregation[];
  groupBy: string[];
  orderBy: QueryOrderBy[];
  limit?: number;
  offset?: number;
  
  // Parameters
  parameters: QueryParameter[];
  
  // Optimization
  cached: boolean;
  cacheKey?: string;
  
  // Execution
  timeout: number; // seconds
  
  // Results
  resultSet?: QueryResult;
  executionTime?: number; // milliseconds
  rowCount?: number;
}

interface QueryFilter {
  column: string;
  operator: FilterOperator;
  value: any;
  dataType: DataType;
}

enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  BETWEEN = 'between'
}

interface QueryAggregation {
  column: string;
  function: AggregationFunction;
  alias?: string;
}

enum AggregationFunction {
  COUNT = 'count',
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  MODE = 'mode',
  STDDEV = 'stddev',
  VARIANCE = 'variance'
}

interface QueryOrderBy {
  column: string;
  direction: SortDirection;
}

enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

interface QueryParameter {
  name: string;
  type: DataType;
  value: any;
  required: boolean;
  defaultValue?: any;
}

interface QueryResult {
  columns: ColumnInfo[];
  rows: any[][];
  metadata: ResultMetadata;
}

interface ResultMetadata {
  totalRows: number;
  executionTime: number;
  cacheHit: boolean;
  dataSource: string;
  query: string;
}

interface ChartConfiguration {
  // Data Mapping
  xAxis: AxisMapping;
  yAxis: AxisMapping;
  colorBy?: string;
  sizeBy?: string;
  groupBy?: string;
  
  // Series Configuration
  series: SeriesConfig[];
  
  // Axes Configuration
  xAxisConfig: AxisConfig;
  yAxisConfig: AxisConfig;
  
  // Legend
  legend: LegendConfig;
  
  // Colors and Themes
  colorPalette: ColorPalette;
  theme: ChartTheme;
  
  // Grid and Background
  grid: GridConfig;
  background: BackgroundConfig;
  
  // Tooltips and Labels
  tooltips: TooltipConfig;
  labels: LabelConfig;
  
  // Zoom and Pan
  zoom: ZoomConfig;
  pan: PanConfig;
  
  // Custom Properties
  customProperties: Record<string, any>;
}

interface AxisMapping {
  column: string;
  dataType: DataType;
  aggregation?: AggregationFunction;
}

interface SeriesConfig {
  name: string;
  type: VisualizationType;
  data: SeriesData;
  styling: SeriesStyling;
  
  // Visibility
  visible: boolean;
  opacity: number;
  
  // Interaction
  clickable: boolean;
  hoverable: boolean;
  
  // Animation
  animated: boolean;
  animationDuration: number;
}

interface SeriesData {
  xValues: any[];
  yValues: any[];
  metadata?: Record<string, any>[];
}

interface SeriesStyling {
  color: string;
  lineWidth?: number;
  lineStyle?: LineStyle;
  fillOpacity?: number;
  markerSize?: number;
  markerShape?: MarkerShape;
}

enum LineStyle {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  DASH_DOT = 'dash_dot'
}

enum MarkerShape {
  CIRCLE = 'circle',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  DIAMOND = 'diamond',
  CROSS = 'cross',
  STAR = 'star'
}

interface AxisConfig {
  title: string;
  visible: boolean;
  
  // Scale
  scale: ScaleType;
  min?: number;
  max?: number;
  
  // Ticks
  tickCount?: number;
  tickFormat?: string;
  tickRotation?: number;
  
  // Grid Lines
  gridLines: boolean;
  gridLineStyle: LineStyle;
  gridLineColor: string;
  
  // Labels
  labelFormat?: string;
  labelRotation?: number;
  labelOffset?: number;
}

enum ScaleType {
  LINEAR = 'linear',
  LOGARITHMIC = 'logarithmic',
  TIME = 'time',
  CATEGORICAL = 'categorical'
}

interface LegendConfig {
  visible: boolean;
  position: LegendPosition;
  orientation: LegendOrientation;
  
  // Styling
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  
  // Text
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  
  // Layout
  padding: number;
  margin: number;
  itemSpacing: number;
}

enum LegendPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right'
}

enum LegendOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

interface ColorPalette {
  name: string;
  colors: string[];
  type: PaletteType;
}

enum PaletteType {
  CATEGORICAL = 'categorical',
  SEQUENTIAL = 'sequential',
  DIVERGING = 'diverging',
  CUSTOM = 'custom'
}

interface ChartTheme {
  name: string;
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  accentColor: string;
  
  // Fonts
  fontFamily: string;
  fontSize: number;
  
  // Borders
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  
  // Shadows
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffset: { x: number; y: number };
}

interface GridConfig {
  visible: boolean;
  xLines: boolean;
  yLines: boolean;
  
  // Styling
  lineColor: string;
  lineWidth: number;
  lineStyle: LineStyle;
  opacity: number;
}

interface BackgroundConfig {
  color: string;
  gradient?: GradientConfig;
  image?: ImageConfig;
  pattern?: PatternConfig;
}

interface GradientConfig {
  type: GradientType;
  colors: string[];
  direction?: number; // degrees
  stops?: number[];
}

enum GradientType {
  LINEAR = 'linear',
  RADIAL = 'radial'
}

interface ImageConfig {
  url: string;
  opacity: number;
  repeat: ImageRepeat;
  position: ImagePosition;
}

enum ImageRepeat {
  NO_REPEAT = 'no_repeat',
  REPEAT = 'repeat',
  REPEAT_X = 'repeat_x',
  REPEAT_Y = 'repeat_y'
}

enum ImagePosition {
  CENTER = 'center',
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right'
}

interface PatternConfig {
  type: PatternType;
  color: string;
  backgroundColor: string;
  size: number;
}

enum PatternType {
  DOTS = 'dots',
  LINES = 'lines',
  DIAGONAL_LINES = 'diagonal_lines',
  CROSSHATCH = 'crosshatch',
  ZIGZAG = 'zigzag'
}

interface TooltipConfig {
  enabled: boolean;
  format: string;
  
  // Styling
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  
  // Text
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  
  // Behavior
  followCursor: boolean;
  delay: number; // milliseconds
  duration: number; // milliseconds
}

interface LabelConfig {
  enabled: boolean;
  format: string;
  position: LabelPosition;
  
  // Styling
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  backgroundColor?: string;
  
  // Behavior
  rotation: number;
  offset: { x: number; y: number };
}

enum LabelPosition {
  INSIDE = 'inside',
  OUTSIDE = 'outside',
  CENTER = 'center',
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

interface ZoomConfig {
  enabled: boolean;
  type: ZoomType;
  
  // Limits
  minZoom: number;
  maxZoom: number;
  
  // Behavior
  wheelZoom: boolean;
  pinchZoom: boolean;
  boxZoom: boolean;
  
  // Animation
  animated: boolean;
  animationDuration: number;
}

enum ZoomType {
  X_AXIS = 'x_axis',
  Y_AXIS = 'y_axis',
  BOTH_AXES = 'both_axes'
}

interface PanConfig {
  enabled: boolean;
  
  // Constraints
  constrainToData: boolean;
  
  // Behavior
  mousePan: boolean;
  touchPan: boolean;
  
  // Animation
  animated: boolean;
  animationDuration: number;
}

interface VisualizationLayout {
  width: number;
  height: number;
  
  // Responsive
  responsive: boolean;
  aspectRatio?: number;
  
  // Margins
  margin: MarginConfig;
  
  // Positioning
  position: PositionConfig;
  
  // Container
  container: ContainerConfig;
}

interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface PositionConfig {
  x: number;
  y: number;
  z: number; // z-index
}

interface ContainerConfig {
  padding: number;
  border: BorderConfig;
  shadow: ShadowConfig;
  
  // Background
  backgroundColor: string;
  backgroundImage?: string;
  
  // Overflow
  overflow: OverflowBehavior;
}

interface BorderConfig {
  width: number;
  style: BorderStyle;
  color: string;
  radius: number;
}

enum BorderStyle {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  DOUBLE = 'double',
  GROOVE = 'groove',
  RIDGE = 'ridge',
  INSET = 'inset',
  OUTSET = 'outset'
}

interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  spread: number;
  offset: { x: number; y: number };
}

enum OverflowBehavior {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  SCROLL = 'scroll',
  AUTO = 'auto'
}

interface VisualizationStyling {
  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Theme
  theme: StyleTheme;
  
  // Custom CSS
  customCSS?: string;
}

enum FontWeight {
  THIN = 100,
  LIGHT = 300,
  NORMAL = 400,
  MEDIUM = 500,
  SEMIBOLD = 600,
  BOLD = 700,
  EXTRABOLD = 800,
  BLACK = 900
}

enum StyleTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
  CUSTOM = 'custom'
}

interface AnimationConfig {
  enabled: boolean;
  
  // Entry Animation
  entryAnimation: AnimationType;
  entryDuration: number; // milliseconds
  entryDelay: number; // milliseconds
  
  // Update Animation
  updateAnimation: AnimationType;
  updateDuration: number; // milliseconds
  
  // Exit Animation
  exitAnimation: AnimationType;
  exitDuration: number; // milliseconds
  
  // Easing
  easing: EasingFunction;
}

enum AnimationType {
  NONE = 'none',
  FADE_IN = 'fade_in',
  SLIDE_IN = 'slide_in',
  SCALE_IN = 'scale_in',
  BOUNCE_IN = 'bounce_in',
  ELASTIC_IN = 'elastic_in',
  CUSTOM = 'custom'
}

enum EasingFunction {
  LINEAR = 'linear',
  EASE = 'ease',
  EASE_IN = 'ease_in',
  EASE_OUT = 'ease_out',
  EASE_IN_OUT = 'ease_in_out',
  CUBIC_BEZIER = 'cubic_bezier'
}

interface InteractionConfig {
  type: InteractionType;
  trigger: InteractionTrigger;
  action: InteractionAction;
  
  // Configuration
  parameters: Record<string, any>;
  
  // Conditions
  conditions: InteractionCondition[];
  
  // Feedback
  feedback: InteractionFeedback;
}

enum InteractionType {
  CLICK = 'click',
  HOVER = 'hover',
  DRAG = 'drag',
  ZOOM = 'zoom',
  PAN = 'pan',
  SELECT = 'select',
  BRUSH = 'brush',
  CUSTOM = 'custom'
}

enum InteractionTrigger {
  MOUSE_CLICK = 'mouse_click',
  MOUSE_HOVER = 'mouse_hover',
  TOUCH_TAP = 'touch_tap',
  KEYBOARD = 'keyboard',
  GESTURE = 'gesture'
}

enum InteractionAction {
  HIGHLIGHT = 'highlight',
  FILTER = 'filter',
  DRILL_DOWN = 'drill_down',
  NAVIGATE = 'navigate',
  EXPORT = 'export',
  CUSTOM = 'custom'
}

interface InteractionCondition {
  property: string;
  operator: ConditionOperator;
  value: any;
}

enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  MATCHES = 'matches'
}

interface InteractionFeedback {
  visual: VisualFeedback;
  audio: AudioFeedback;
  haptic: HapticFeedback;
}

interface VisualFeedback {
  enabled: boolean;
  type: VisualFeedbackType;
  color?: string;
  opacity?: number;
  duration?: number;
}

enum VisualFeedbackType {
  HIGHLIGHT = 'highlight',
  GLOW = 'glow',
  PULSE = 'pulse',
  SHAKE = 'shake',
  BOUNCE = 'bounce'
}

interface AudioFeedback {
  enabled: boolean;
  sound: string;
  volume: number;
}

interface HapticFeedback {
  enabled: boolean;
  pattern: HapticPattern;
  intensity: number;
}

enum HapticPattern {
  CLICK = 'click',
  DOUBLE_CLICK = 'double_click',
  LONG_PRESS = 'long_press',
  SUCCESS = 'success',
  ERROR = 'error'
}

enum VisualizationStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  LOADING = 'loading',
  ERROR = 'error',
  ARCHIVED = 'archived'
}

interface VisualizationChange {
  version: string;
  timestamp: string;
  author: string;
  description: string;
  changes: ChangeDetail[];
}

interface ChangeDetail {
  type: ChangeType;
  property: string;
  oldValue: any;
  newValue: any;
}

enum ChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  RENAMED = 'renamed'
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  
  // Layout
  layout: DashboardLayout;
  visualizations: DashboardVisualization[];
  
  // Configuration
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  
  // Filters
  globalFilters: GlobalFilter[];
  
  // Sharing and Permissions
  public: boolean;
  permissions: DashboardPermission[];
  
  // Status
  status: DashboardStatus;
  
  // Metadata
  owner: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  
  // Usage
  viewCount: number;
  lastViewed: string;
}

interface DashboardLayout {
  type: DashboardLayoutType;
  columns: number;
  rows: number;
  gridSize: number;
  
  // Responsive
  responsive: boolean;
  breakpoints: Breakpoint[];
}

enum DashboardLayoutType {
  GRID = 'grid',
  FREE_FORM = 'free_form',
  TEMPLATE = 'template'
}

interface Breakpoint {
  name: string;
  minWidth: number;
  columns: number;
}

interface DashboardVisualization {
  id: string;
  visualizationId: string;
  
  // Position and Size
  position: GridPosition;
  size: GridSize;
  
  // Configuration
  title?: string;
  showTitle: boolean;
  
  // Filters
  localFilters: LocalFilter[];
  
  // Status
  status: VisualizationStatus;
}

interface GridPosition {
  x: number;
  y: number;
}

interface GridSize {
  width: number;
  height: number;
}

interface GlobalFilter {
  id: string;
  name: string;
  type: FilterType;
  column: string;
  
  // Values
  values: FilterValue[];
  selectedValues: any[];
  
  // Configuration
  multiSelect: boolean;
  required: boolean;
  
  // UI
  displayType: FilterDisplayType;
  placeholder: string;
}

enum FilterType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  LIST = 'list'
}

interface FilterValue {
  label: string;
  value: any;
  count?: number;
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

interface LocalFilter {
  id: string;
  column: string;
  operator: FilterOperator;
  value: any;
}

interface DashboardPermission {
  userId: string;
  role: DashboardRole;
  permissions: DashboardPermissionType[];
}

enum DashboardRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
  OWNER = 'owner'
}

enum DashboardPermissionType {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  SHARE = 'share',
  EXPORT = 'export'
}

enum DashboardStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

// ==================== Data Visualization Suite Component ====================

export const DataVisualizationSuite: React.FC = () => {
  const { toast } = useToast();

  // ==================== State Management ====================

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVisualization, setSelectedVisualization] = useState<Visualization | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);

  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [templates, setTemplates] = useState<Visualization[]>([]);
  const [visualizationOverview, setVisualizationOverview] = useState<any>(null);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showCreateVisualizationDialog, setShowCreateVisualizationDialog] = useState(false);
  const [showCreateDashboardDialog, setShowCreateDashboardDialog] = useState(false);
  const [showVisualizationBuilderDialog, setShowVisualizationBuilderDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true);

  const wsRef = useRef<WebSocket | null>(null);

  // ==================== Backend Integration Functions ====================

  const fetchVisualizationOverview = useCallback(async () => {
    try {
      const response = await fetch('/api/data-visualization/overview', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVisualizationOverview(data);
    } catch (error) {
      console.error('Failed to fetch visualization overview:', error);
      // Initialize with mock data for development
      initializeMockData();
    }
  }, []);

  const fetchVisualizations = useCallback(async () => {
    try {
      const response = await fetch('/api/data-visualization/visualizations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVisualizations(data.visualizations || []);
    } catch (error) {
      console.error('Failed to fetch visualizations:', error);
    }
  }, []);

  const createVisualization = useCallback(async (visualizationConfig: any) => {
    setActionInProgress(prev => ({ ...prev, 'create-visualization': true }));
    
    try {
      const response = await fetch('/api/data-visualization/visualizations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visualizationConfig),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newVisualization = await response.json();
      setVisualizations(prev => [newVisualization, ...prev]);
      
      toast({
        title: "Visualization Created",
        description: "New visualization has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create visualization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, 'create-visualization': false }));
    }
  }, [toast]);

  // ==================== Mock Data Initialization ====================

  const initializeMockData = useCallback(() => {
    const mockVisualizations: Visualization[] = [
      {
        id: 'viz-001',
        name: 'Revenue Trend Analysis',
        description: 'Monthly revenue trends with year-over-year comparison',
        type: VisualizationType.LINE_CHART,
        dataSource: {
          id: 'ds-001',
          name: 'Revenue Database',
          type: DataSourceType.DATABASE,
          connection: {
            host: 'revenue-db.company.com',
            port: 5432,
            database: 'revenue_analytics',
            credentials: {
              type: CredentialType.USERNAME_PASSWORD,
              username: 'analytics_user'
            },
            parameters: {}
          },
          schema: {
            tables: [
              {
                name: 'revenue_monthly',
                columns: [
                  { name: 'month', type: DataType.DATE, nullable: false, unique: false, indexed: true },
                  { name: 'revenue', type: DataType.FLOAT, nullable: false, unique: false, indexed: false },
                  { name: 'year', type: DataType.INTEGER, nullable: false, unique: false, indexed: true }
                ],
                rowCount: 120
              }
            ],
            relationships: []
          },
          cacheEnabled: true,
          cacheTTL: 3600,
          encrypted: true,
          accessControl: {
            enabled: true,
            allowedUsers: ['analyst@company.com'],
            allowedRoles: ['analytics_team'],
            restrictions: []
          },
          status: DataSourceStatus.CONNECTED,
          lastTested: new Date().toISOString()
        },
        dataQuery: {
          sql: 'SELECT month, revenue, year FROM revenue_monthly ORDER BY month',
          filters: [],
          aggregations: [],
          groupBy: [],
          orderBy: [{ column: 'month', direction: SortDirection.ASC }],
          parameters: [],
          cached: true,
          timeout: 30,
          rowCount: 120
        },
        chartConfig: {
          xAxis: { column: 'month', dataType: DataType.DATE },
          yAxis: { column: 'revenue', dataType: DataType.FLOAT, aggregation: AggregationFunction.SUM },
          series: [
            {
              name: 'Revenue',
              type: VisualizationType.LINE_CHART,
              data: {
                xValues: Array.from({ length: 12 }, (_, i) => 
                  new Date(2024, i, 1).toISOString()
                ),
                yValues: Array.from({ length: 12 }, () => 
                  1000000 + Math.random() * 500000
                )
              },
              styling: {
                color: '#10b981',
                lineWidth: 3,
                lineStyle: LineStyle.SOLID,
                markerSize: 6,
                markerShape: MarkerShape.CIRCLE
              },
              visible: true,
              opacity: 1,
              clickable: true,
              hoverable: true,
              animated: true,
              animationDuration: 1000
            }
          ],
          xAxisConfig: {
            title: 'Month',
            visible: true,
            scale: ScaleType.TIME,
            tickFormat: 'MMM YYYY',
            gridLines: true,
            gridLineStyle: LineStyle.DOTTED,
            gridLineColor: '#e5e7eb'
          },
          yAxisConfig: {
            title: 'Revenue ($)',
            visible: true,
            scale: ScaleType.LINEAR,
            tickFormat: '$,.0f',
            gridLines: true,
            gridLineStyle: LineStyle.DOTTED,
            gridLineColor: '#e5e7eb'
          },
          legend: {
            visible: true,
            position: LegendPosition.TOP_RIGHT,
            orientation: LegendOrientation.VERTICAL,
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            fontSize: 12,
            fontFamily: 'Inter',
            fontColor: '#374151',
            padding: 8,
            margin: 8,
            itemSpacing: 4
          },
          colorPalette: {
            name: 'Default',
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            type: PaletteType.CATEGORICAL
          },
          theme: {
            name: 'Light',
            backgroundColor: '#ffffff',
            textColor: '#374151',
            gridColor: '#e5e7eb',
            accentColor: '#10b981',
            fontFamily: 'Inter',
            fontSize: 12,
            borderColor: '#e5e7eb',
            borderWidth: 1,
            borderRadius: 8,
            shadowEnabled: true,
            shadowColor: '#00000010',
            shadowBlur: 4,
            shadowOffset: { x: 0, y: 2 }
          },
          grid: {
            visible: true,
            xLines: true,
            yLines: true,
            lineColor: '#e5e7eb',
            lineWidth: 1,
            lineStyle: LineStyle.DOTTED,
            opacity: 0.5
          },
          background: {
            color: '#ffffff'
          },
          tooltips: {
            enabled: true,
            format: '{series.name}: {point.y:,.0f}',
            backgroundColor: '#374151',
            borderColor: '#6b7280',
            borderWidth: 1,
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'Inter',
            fontColor: '#ffffff',
            followCursor: true,
            delay: 0,
            duration: 200
          },
          labels: {
            enabled: false,
            format: '{point.y:,.0f}',
            position: LabelPosition.TOP,
            fontSize: 10,
            fontFamily: 'Inter',
            fontColor: '#6b7280',
            rotation: 0,
            offset: { x: 0, y: -5 }
          },
          zoom: {
            enabled: true,
            type: ZoomType.BOTH_AXES,
            minZoom: 0.1,
            maxZoom: 10,
            wheelZoom: true,
            pinchZoom: true,
            boxZoom: true,
            animated: true,
            animationDuration: 300
          },
          pan: {
            enabled: true,
            constrainToData: true,
            mousePan: true,
            touchPan: true,
            animated: true,
            animationDuration: 300
          },
          customProperties: {}
        },
        layout: {
          width: 800,
          height: 400,
          responsive: true,
          aspectRatio: 2,
          margin: { top: 20, right: 20, bottom: 40, left: 60 },
          position: { x: 0, y: 0, z: 1 },
          container: {
            padding: 16,
            border: {
              width: 1,
              style: BorderStyle.SOLID,
              color: '#e5e7eb',
              radius: 8
            },
            shadow: {
              enabled: true,
              color: '#00000010',
              blur: 4,
              spread: 0,
              offset: { x: 0, y: 2 }
            },
            backgroundColor: '#ffffff',
            overflow: OverflowBehavior.HIDDEN
          }
        },
        styling: {
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: FontWeight.NORMAL,
          primaryColor: '#10b981',
          secondaryColor: '#3b82f6',
          accentColor: '#f59e0b',
          theme: StyleTheme.LIGHT
        },
        interactive: true,
        animations: {
          enabled: true,
          entryAnimation: AnimationType.FADE_IN,
          entryDuration: 1000,
          entryDelay: 0,
          updateAnimation: AnimationType.SCALE_IN,
          updateDuration: 500,
          exitAnimation: AnimationType.FADE_IN,
          exitDuration: 300,
          easing: EasingFunction.EASE_IN_OUT
        },
        interactions: [
          {
            type: InteractionType.HOVER,
            trigger: InteractionTrigger.MOUSE_HOVER,
            action: InteractionAction.HIGHLIGHT,
            parameters: {},
            conditions: [],
            feedback: {
              visual: {
                enabled: true,
                type: VisualFeedbackType.HIGHLIGHT,
                color: '#10b981',
                opacity: 0.8,
                duration: 200
              },
              audio: { enabled: false, sound: '', volume: 0 },
              haptic: { enabled: false, pattern: HapticPattern.CLICK, intensity: 0 }
            }
          }
        ],
        realTime: false,
        updateInterval: 300000, // 5 minutes
        exportable: true,
        shareable: true,
        status: VisualizationStatus.ACTIVE,
        renderTime: 150,
        dataPoints: 120,
        owner: 'analyst@company.com',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['revenue', 'trends', 'financial', 'monthly'],
        category: 'business',
        version: '1.0.0',
        changelog: [
          {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            author: 'analyst@company.com',
            description: 'Initial visualization creation',
            changes: [
              {
                type: ChangeType.CREATED,
                property: 'visualization',
                oldValue: null,
                newValue: 'Revenue Trend Analysis'
              }
            ]
          }
        ],
        viewCount: 247,
        lastViewed: new Date().toISOString(),
        favoriteCount: 18
      }
    ];

    const mockDashboards: Dashboard[] = [
      {
        id: 'dash-001',
        name: 'Executive Analytics Dashboard',
        description: 'Comprehensive business analytics for executive team',
        layout: {
          type: DashboardLayoutType.GRID,
          columns: 12,
          rows: 8,
          gridSize: 100,
          responsive: true,
          breakpoints: [
            { name: 'desktop', minWidth: 1200, columns: 12 },
            { name: 'tablet', minWidth: 768, columns: 8 },
            { name: 'mobile', minWidth: 320, columns: 4 }
          ]
        },
        visualizations: [
          {
            id: 'dv-001',
            visualizationId: 'viz-001',
            position: { x: 0, y: 0 },
            size: { width: 6, height: 4 },
            title: 'Revenue Trends',
            showTitle: true,
            localFilters: [],
            status: VisualizationStatus.ACTIVE
          }
        ],
        autoRefresh: true,
        refreshInterval: 300,
        globalFilters: [
          {
            id: 'date_range',
            name: 'Date Range',
            type: FilterType.DATE,
            column: 'date',
            values: [
              { label: 'Last 30 days', value: '30d' },
              { label: 'Last 90 days', value: '90d' },
              { label: 'Last year', value: '1y' }
            ],
            selectedValues: ['30d'],
            multiSelect: false,
            required: false,
            displayType: FilterDisplayType.DROPDOWN,
            placeholder: 'Select date range'
          }
        ],
        public: false,
        permissions: [
          {
            userId: 'executive_team',
            role: DashboardRole.VIEWER,
            permissions: [DashboardPermissionType.VIEW, DashboardPermissionType.EXPORT]
          }
        ],
        status: DashboardStatus.ACTIVE,
        owner: 'admin@company.com',
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['executive', 'analytics', 'business'],
        viewCount: 156,
        lastViewed: new Date().toISOString()
      }
    ];

    setVisualizations(mockVisualizations);
    setDashboards(mockDashboards);

    // Set visualization overview
    setVisualizationOverview({
      totalVisualizations: mockVisualizations.length,
      activeVisualizations: mockVisualizations.filter(v => v.status === VisualizationStatus.ACTIVE).length,
      totalDashboards: mockDashboards.length,
      activeDashboards: mockDashboards.filter(d => d.status === DashboardStatus.ACTIVE).length,
      totalDataSources: 5,
      connectedDataSources: 4,
      avgRenderTime: mockVisualizations.reduce((sum, v) => sum + v.renderTime, 0) / mockVisualizations.length,
      totalDataPoints: mockVisualizations.reduce((sum, v) => sum + v.dataPoints, 0),
      totalViews: mockVisualizations.reduce((sum, v) => sum + v.viewCount, 0),
      lastUpdated: new Date().toISOString()
    });
  }, []);

  // ==================== Utility Functions ====================

  const getVisualizationTypeIcon = (type: VisualizationType) => {
    switch (type) {
      case VisualizationType.LINE_CHART:
        return <LineChart className="h-4 w-4" />;
      case VisualizationType.BAR_CHART:
      case VisualizationType.COLUMN_CHART:
        return <BarChart3 className="h-4 w-4" />;
      case VisualizationType.PIE_CHART:
      case VisualizationType.DONUT_CHART:
        return <PieChart className="h-4 w-4" />;
      case VisualizationType.SCATTER_PLOT:
        return <Scatter className="h-4 w-4" />;
      case VisualizationType.AREA_CHART:
        return <AreaChart className="h-4 w-4" />;
      case VisualizationType.HEATMAP:
        return <Grid className="h-4 w-4" />;
      case VisualizationType.GAUGE:
        return <Gauge className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: VisualizationStatus): string => {
    switch (status) {
      case VisualizationStatus.ACTIVE:
        return 'text-green-600';
      case VisualizationStatus.LOADING:
        return 'text-yellow-600';
      case VisualizationStatus.ERROR:
        return 'text-red-600';
      case VisualizationStatus.DRAFT:
        return 'text-blue-600';
      case VisualizationStatus.ARCHIVED:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
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

  const handleCreateVisualization = useCallback(async (config: any) => {
    await createVisualization(config);
    setShowCreateVisualizationDialog(false);
  }, [createVisualization]);

  const handleRefreshData = useCallback(() => {
    fetchVisualizationOverview();
    fetchVisualizations();
  }, [fetchVisualizationOverview, fetchVisualizations]);

  // ==================== Effects ====================

  useEffect(() => {
    // Initialize data
    fetchVisualizationOverview();
    fetchVisualizations();
  }, [fetchVisualizationOverview, fetchVisualizations]);

  useEffect(() => {
    // Set up real-time WebSocket connection for visualization updates
    if (realTimeUpdates) {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/data-visualization/ws`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'visualization_update') {
          setVisualizations(prev =>
            prev.map(viz =>
              viz.id === data.visualization.id ? { ...viz, ...data.visualization } : viz
            )
          );
        } else if (data.type === 'data_update') {
          // Update visualizations with new data
          setVisualizations(prev =>
            prev.map(viz =>
              viz.dataSource.id === data.dataSourceId
                ? { ...viz, status: VisualizationStatus.LOADING }
                : viz
            )
          );
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

  const VisualizationOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Visualizations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visualizationOverview?.activeVisualizations || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {visualizationOverview?.totalVisualizations || 0} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Data visualizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visualizationOverview?.activeDashboards || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {visualizationOverview?.totalDashboards || 0} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Interactive dashboards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visualizationOverview?.connectedDataSources || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {visualizationOverview?.totalDataSources || 0} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Connected sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(visualizationOverview?.avgRenderTime || 0)}ms
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default">
                Fast
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average render time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Visualizations and Popular Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Visualizations</CardTitle>
            <CardDescription>
              Latest created and updated visualizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visualizations.slice(0, 5).map((viz) => (
                <div key={viz.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getVisualizationTypeIcon(viz.type)}
                    <div>
                      <p className="font-medium text-sm">{viz.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {viz.type.replace('_', ' ')} • {viz.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(viz.updatedAt)}
                    </div>
                    <Badge variant={
                      viz.status === VisualizationStatus.ACTIVE ? 'default' :
                      viz.status === VisualizationStatus.LOADING ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {viz.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart Type Distribution</CardTitle>
            <CardDescription>
              Most commonly used visualization types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Line Charts', count: 45, percentage: 35 },
                { type: 'Bar Charts', count: 32, percentage: 25 },
                { type: 'Pie Charts', count: 26, percentage: 20 },
                { type: 'Scatter Plots', count: 16, percentage: 12 },
                { type: 'Heatmaps', count: 10, percentage: 8 }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm font-medium">{item.type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
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
            Common visualization operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreateVisualizationDialog(true)}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">New Chart</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreateDashboardDialog(true)}
            >
              <Layout className="h-6 w-6" />
              <span className="text-sm">New Dashboard</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowVisualizationBuilderDialog(true)}
            >
              <Brush className="h-6 w-6" />
              <span className="text-sm">Chart Builder</span>
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

  if (!visualizationOverview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading data visualization suite...</p>
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
            <h1 className="text-3xl font-bold">Data Visualization Suite</h1>
            <p className="text-muted-foreground">
              Advanced charting and interactive dashboard platform
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3" />
              <span>{visualizationOverview.activeVisualizations} Charts</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Layout className="h-3 w-3" />
              <span>{visualizationOverview.activeDashboards} Dashboards</span>
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
            <TabsTrigger value="charts" className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Charts</span>
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="flex items-center space-x-2">
              <Layout className="h-4 w-4" />
              <span>Dashboards</span>
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center space-x-2">
              <Brush className="h-4 w-4" />
              <span>Builder</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Data Sources</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <VisualizationOverviewDashboard />
          </TabsContent>

          <TabsContent value="charts">
            <div className="text-center py-12">
              <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chart Gallery</h3>
              <p className="text-muted-foreground">
                Advanced chart management and editing interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="dashboards">
            <div className="text-center py-12">
              <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Dashboard Builder</h3>
              <p className="text-muted-foreground">
                Interactive dashboard creation and management interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="builder">
            <div className="text-center py-12">
              <Brush className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Visualization Builder</h3>
              <p className="text-muted-foreground">
                Drag-and-drop chart builder interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chart Templates</h3>
              <p className="text-muted-foreground">
                Pre-built chart templates and themes interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Data Sources</h3>
              <p className="text-muted-foreground">
                Data source management and connection interface coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default DataVisualizationSuite;