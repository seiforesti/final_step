/**
 * 📊 Security Reporting - Executive Security Dashboards & Analytics
 * ================================================================
 * 
 * Enterprise-grade security reporting platform that provides executive dashboards,
 * compliance reporting, security metrics, and advanced analytics for strategic
 * decision-making and regulatory compliance.
 * 
 * Features:
 * - Executive security dashboards and KPIs
 * - Comprehensive compliance reporting
 * - Advanced security metrics and analytics
 * - Automated report generation and distribution
 * - Real-time security posture monitoring
 * - Risk assessment and trend analysis
 * - Regulatory compliance tracking
 * - Custom report builder and templates
 * 
 * Backend Integration:
 * - SecurityReportingService for comprehensive reporting operations
 * - ComplianceReportingService for regulatory reporting
 * - SecurityMetricsService for KPI calculation and tracking
 * - ReportGenerationService for automated report creation
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
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Download,
  Upload,
  Calendar,
  Clock,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Mail,
  Bell,
  BellOff,
  MoreHorizontal,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Star,
  Bookmark,
  Flag,
  MessageSquare,
  Archive,
  Folder,
  FolderOpen,
  History,
  Timer,
  Gauge,
  Target,
  Award,
  Crown,
  Zap,
  Bug,
  Skull,
  Lock,
  Unlock,
  Key,
  KeyRound,
  Database,
  Server,
  Network,
  Cloud,
  Globe,
  Wifi,
  WifiOff,
  Layers,
  Workflow,
  Play,
  Pause,
  Square,
  ClipboardCheck,
  BookOpen,
  AlertCircle,
  Info,
  HelpCircle,
  Crosshair,
  Radar,
  Brain,
  Microscope,
  TestTube,
  Beaker,
  FlaskConical
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useSecurityCompliance } from '../../hooks/useSecurityCompliance';

// ==================== Types and Interfaces ====================

interface SecurityReport {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  category: ReportCategory;
  
  // Configuration
  template: ReportTemplate;
  parameters: ReportParameters;
  filters: ReportFilter[];
  
  // Scheduling
  schedule: ReportSchedule;
  
  // Recipients
  recipients: ReportRecipient[];
  
  // Status
  status: ReportStatus;
  lastGenerated?: string;
  nextGeneration?: string;
  
  // Content
  sections: ReportSection[];
  charts: ChartConfiguration[];
  metrics: SecurityMetric[];
  
  // Access Control
  visibility: ReportVisibility;
  permissions: ReportPermission[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  tags: string[];
  
  // Analytics
  viewCount: number;
  downloadCount: number;
  lastViewed?: string;
  
  // Export
  formats: ExportFormat[];
  retentionPeriod: number; // days
}

enum ReportType {
  EXECUTIVE_DASHBOARD = 'executive_dashboard',
  COMPLIANCE_REPORT = 'compliance_report',
  SECURITY_METRICS = 'security_metrics',
  THREAT_INTELLIGENCE = 'threat_intelligence',
  VULNERABILITY_REPORT = 'vulnerability_report',
  INCIDENT_REPORT = 'incident_report',
  AUDIT_REPORT = 'audit_report',
  RISK_ASSESSMENT = 'risk_assessment',
  CUSTOM_REPORT = 'custom_report'
}

enum ReportCategory {
  STRATEGIC = 'strategic',
  OPERATIONAL = 'operational',
  TACTICAL = 'tactical',
  COMPLIANCE = 'compliance',
  TECHNICAL = 'technical'
}

enum ReportStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

enum ReportVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential'
}

enum ExportFormat {
  PDF = 'pdf',
  HTML = 'html',
  DOCX = 'docx',
  XLSX = 'xlsx',
  CSV = 'csv',
  JSON = 'json',
  PPTX = 'pptx'
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  layout: TemplateLayout;
  styling: TemplateStyling;
  sections: TemplateSectionConfig[];
  
  // Metadata
  version: string;
  author: string;
  createdAt: string;
  category: string;
  tags: string[];
  
  // Usage
  usageCount: number;
  rating: number;
  featured: boolean;
}

interface TemplateLayout {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  margins: PageMargins;
  header: HeaderConfig;
  footer: FooterConfig;
  columns: number;
}

interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface HeaderConfig {
  enabled: boolean;
  height: number;
  content: HeaderContent;
  styling: HeaderStyling;
}

interface FooterConfig {
  enabled: boolean;
  height: number;
  content: FooterContent;
  styling: FooterStyling;
}

interface HeaderContent {
  logo?: string;
  title?: string;
  subtitle?: string;
  date?: boolean;
  pageNumbers?: boolean;
}

interface FooterContent {
  copyright?: string;
  confidentiality?: string;
  pageNumbers?: boolean;
  timestamp?: boolean;
}

interface HeaderStyling {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
}

interface FooterStyling {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
}

interface TemplateStyling {
  colorScheme: ColorScheme;
  typography: Typography;
  branding: BrandingConfig;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface Typography {
  headingFont: string;
  bodyFont: string;
  codeFont: string;
  baseFontSize: number;
  lineHeight: number;
}

interface BrandingConfig {
  logo: string;
  companyName: string;
  colors: string[];
  watermark?: string;
}

interface TemplateSectionConfig {
  id: string;
  name: string;
  type: SectionType;
  order: number;
  required: boolean;
  configurable: boolean;
  defaultConfig: Record<string, any>;
}

enum SectionType {
  EXECUTIVE_SUMMARY = 'executive_summary',
  METRICS_OVERVIEW = 'metrics_overview',
  THREAT_LANDSCAPE = 'threat_landscape',
  VULNERABILITY_STATUS = 'vulnerability_status',
  COMPLIANCE_STATUS = 'compliance_status',
  INCIDENT_SUMMARY = 'incident_summary',
  RISK_ASSESSMENT = 'risk_assessment',
  RECOMMENDATIONS = 'recommendations',
  APPENDIX = 'appendix',
  CUSTOM_SECTION = 'custom_section'
}

interface ReportParameters {
  timeRange: TimeRange;
  dataScope: DataScope;
  aggregationLevel: AggregationLevel;
  includeDetails: boolean;
  includeCharts: boolean;
  includeTrends: boolean;
  customParameters: Record<string, any>;
}

interface TimeRange {
  type: 'relative' | 'absolute';
  start?: string;
  end?: string;
  relative?: RelativeTimeRange;
}

interface RelativeTimeRange {
  amount: number;
  unit: 'hours' | 'days' | 'weeks' | 'months' | 'quarters' | 'years';
}

interface DataScope {
  organizations: string[];
  departments: string[];
  systems: string[];
  applications: string[];
  environments: string[];
  dataTypes: string[];
}

enum AggregationLevel {
  DETAILED = 'detailed',
  SUMMARY = 'summary',
  EXECUTIVE = 'executive'
}

interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  condition: 'AND' | 'OR';
}

enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between'
}

interface ReportSchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  time: string;
  timezone: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  
  // Advanced Scheduling
  conditions: ScheduleCondition[];
  notifications: ScheduleNotification[];
  
  // Execution
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  failureCount: number;
}

enum ScheduleFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  CUSTOM = 'custom'
}

interface ScheduleCondition {
  type: 'data_availability' | 'threshold' | 'event';
  configuration: Record<string, any>;
}

interface ScheduleNotification {
  type: 'email' | 'webhook' | 'slack' | 'teams';
  recipients: string[];
  template: string;
  conditions: NotificationCondition[];
}

interface NotificationCondition {
  event: 'success' | 'failure' | 'warning';
  enabled: boolean;
}

interface ReportRecipient {
  id: string;
  type: 'user' | 'group' | 'role' | 'email';
  identifier: string;
  name: string;
  
  // Delivery
  deliveryMethod: DeliveryMethod;
  format: ExportFormat;
  
  // Permissions
  permissions: RecipientPermission[];
  
  // Preferences
  preferences: RecipientPreferences;
}

enum DeliveryMethod {
  EMAIL = 'email',
  PORTAL = 'portal',
  API = 'api',
  WEBHOOK = 'webhook',
  FTP = 'ftp',
  SFTP = 'sftp'
}

interface RecipientPermission {
  action: 'view' | 'download' | 'share' | 'modify';
  granted: boolean;
}

interface RecipientPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  customizations: Record<string, any>;
}

interface ReportSection {
  id: string;
  name: string;
  type: SectionType;
  order: number;
  
  // Content
  title: string;
  description?: string;
  content: SectionContent;
  
  // Configuration
  visible: boolean;
  pageBreak: boolean;
  styling: SectionStyling;
  
  // Data
  dataSource: string;
  query?: string;
  filters: ReportFilter[];
  
  // Visualization
  charts: string[];
  tables: string[];
  metrics: string[];
}

interface SectionContent {
  text?: string;
  html?: string;
  markdown?: string;
  data?: any;
  charts?: ChartData[];
  tables?: TableData[];
  metrics?: MetricData[];
}

interface SectionStyling {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
  margin?: number;
  border?: BorderConfig;
}

interface BorderConfig {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

interface ChartConfiguration {
  id: string;
  name: string;
  type: ChartType;
  
  // Data
  dataSource: string;
  query: string;
  
  // Configuration
  config: ChartConfig;
  styling: ChartStyling;
  
  // Interactivity
  interactive: boolean;
  exportable: boolean;
  
  // Metadata
  description?: string;
  tags: string[];
}

enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DONUT = 'donut',
  AREA = 'area',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
  TREEMAP = 'treemap',
  RADAR = 'radar',
  SANKEY = 'sankey',
  FUNNEL = 'funnel'
}

interface ChartConfig {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  series: SeriesConfig[];
  legend: LegendConfig;
  tooltip: TooltipConfig;
  animation: AnimationConfig;
}

interface AxisConfig {
  title: string;
  type: 'category' | 'value' | 'time' | 'log';
  min?: number;
  max?: number;
  format?: string;
  rotation?: number;
}

interface SeriesConfig {
  name: string;
  type: string;
  data: string;
  color?: string;
  stack?: string;
}

interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  orientation: 'horizontal' | 'vertical';
}

interface TooltipConfig {
  show: boolean;
  format: string;
  backgroundColor: string;
  textColor: string;
}

interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
}

interface ChartStyling {
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

interface TableData {
  headers: string[];
  rows: any[][];
  formatting?: TableFormatting;
}

interface TableFormatting {
  headerStyle?: CellStyle;
  rowStyle?: CellStyle;
  alternateRowStyle?: CellStyle;
  columnStyles?: Record<string, CellStyle>;
}

interface CellStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

interface MetricData {
  name: string;
  value: number | string;
  unit?: string;
  trend?: TrendData;
  target?: number;
  status?: MetricStatus;
}

enum MetricStatus {
  GOOD = 'good',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

interface SecurityMetric {
  id: string;
  name: string;
  description: string;
  category: MetricCategory;
  
  // Value
  value: number | string;
  unit: string;
  dataType: 'number' | 'percentage' | 'currency' | 'duration' | 'count';
  
  // Target
  target?: number;
  threshold: MetricThreshold;
  
  // Trend
  trend: TrendAnalysis;
  historical: HistoricalData[];
  
  // Status
  status: MetricStatus;
  lastUpdated: string;
  
  // Configuration
  calculation: CalculationConfig;
  aggregation: AggregationConfig;
  
  // Visualization
  chartType: ChartType;
  displayFormat: string;
  
  // Metadata
  owner: string;
  tags: string[];
  references: string[];
}

enum MetricCategory {
  SECURITY_POSTURE = 'security_posture',
  THREAT_LANDSCAPE = 'threat_landscape',
  VULNERABILITY_MANAGEMENT = 'vulnerability_management',
  INCIDENT_RESPONSE = 'incident_response',
  COMPLIANCE = 'compliance',
  RISK_MANAGEMENT = 'risk_management',
  OPERATIONAL = 'operational',
  FINANCIAL = 'financial'
}

interface MetricThreshold {
  good: ThresholdRange;
  warning: ThresholdRange;
  critical: ThresholdRange;
}

interface ThresholdRange {
  min?: number;
  max?: number;
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'ne' | 'between';
}

interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: 'weak' | 'moderate' | 'strong';
  confidence: number;
  
  // Statistical Analysis
  correlation: number;
  seasonality: boolean;
  forecast: ForecastData[];
  
  // Change Analysis
  changePoints: ChangePoint[];
  anomalies: AnomalyPoint[];
}

interface ForecastData {
  date: string;
  value: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

interface ChangePoint {
  date: string;
  magnitude: number;
  significance: number;
  reason?: string;
}

interface AnomalyPoint {
  date: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

interface HistoricalData {
  date: string;
  value: number;
  context?: Record<string, any>;
}

interface CalculationConfig {
  formula: string;
  dataSources: string[];
  filters: ReportFilter[];
  aggregationPeriod: string;
  
  // Advanced Configuration
  normalization: NormalizationConfig;
  weighting: WeightingConfig;
}

interface NormalizationConfig {
  enabled: boolean;
  method: 'z-score' | 'min-max' | 'decimal-scaling';
  baseline: number;
}

interface WeightingConfig {
  enabled: boolean;
  weights: Record<string, number>;
  method: 'linear' | 'exponential' | 'logarithmic';
}

interface AggregationConfig {
  method: 'sum' | 'average' | 'median' | 'min' | 'max' | 'count' | 'distinct';
  groupBy: string[];
  timeWindow: string;
  
  // Advanced Aggregation
  percentiles: number[];
  outlierHandling: OutlierHandling;
}

interface OutlierHandling {
  enabled: boolean;
  method: 'iqr' | 'z-score' | 'isolation-forest';
  threshold: number;
  action: 'remove' | 'cap' | 'flag';
}

interface ReportPermission {
  userId: string;
  role: string;
  permissions: Permission[];
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

interface Permission {
  action: 'view' | 'edit' | 'delete' | 'share' | 'export' | 'schedule';
  granted: boolean;
  conditions?: PermissionCondition[];
}

interface PermissionCondition {
  type: 'time' | 'location' | 'device' | 'network';
  configuration: Record<string, any>;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: DashboardType;
  
  // Layout
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  
  // Configuration
  refreshInterval: number;
  autoRefresh: boolean;
  
  // Access Control
  visibility: ReportVisibility;
  permissions: ReportPermission[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastViewed?: string;
  viewCount: number;
  
  // Customization
  theme: DashboardTheme;
  filters: GlobalFilter[];
}

enum DashboardType {
  EXECUTIVE = 'executive',
  OPERATIONAL = 'operational',
  ANALYTICAL = 'analytical',
  COMPLIANCE = 'compliance',
  CUSTOM = 'custom'
}

interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number;
  responsive: boolean;
  
  // Styling
  backgroundColor: string;
  padding: number;
  margin: number;
}

interface DashboardWidget {
  id: string;
  name: string;
  type: WidgetType;
  
  // Position
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Configuration
  config: WidgetConfig;
  dataSource: string;
  
  // Styling
  styling: WidgetStyling;
  
  // Interactivity
  interactive: boolean;
  drillDown: boolean;
  
  // Refresh
  refreshInterval?: number;
  lastRefresh?: string;
}

enum WidgetType {
  METRIC = 'metric',
  CHART = 'chart',
  TABLE = 'table',
  TEXT = 'text',
  IMAGE = 'image',
  MAP = 'map',
  GAUGE = 'gauge',
  PROGRESS = 'progress',
  LIST = 'list',
  CALENDAR = 'calendar'
}

interface WidgetConfig {
  title: string;
  subtitle?: string;
  showTitle: boolean;
  showBorder: boolean;
  
  // Data Configuration
  query: string;
  filters: ReportFilter[];
  aggregation: string;
  
  // Display Configuration
  format: string;
  precision: number;
  showTrend: boolean;
  showTarget: boolean;
  
  // Interaction
  clickAction?: ClickAction;
  hoverAction?: HoverAction;
}

interface ClickAction {
  type: 'drill_down' | 'navigate' | 'filter' | 'export';
  configuration: Record<string, any>;
}

interface HoverAction {
  type: 'tooltip' | 'highlight' | 'popup';
  configuration: Record<string, any>;
}

interface WidgetStyling {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  textColor: string;
  fontSize: number;
  fontWeight: string;
  textAlign: string;
}

interface DashboardTheme {
  name: string;
  colors: ColorScheme;
  typography: Typography;
  spacing: SpacingConfig;
}

interface SpacingConfig {
  small: number;
  medium: number;
  large: number;
  extraLarge: number;
}

interface GlobalFilter {
  id: string;
  name: string;
  type: 'dropdown' | 'date_range' | 'text' | 'multi_select';
  field: string;
  defaultValue?: any;
  options?: FilterOption[];
  
  // Configuration
  required: boolean;
  visible: boolean;
  position: FilterPosition;
}

interface FilterOption {
  label: string;
  value: any;
  group?: string;
}

enum FilterPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

// ==================== Security Reporting Component ====================

export const SecurityReporting: React.FC = () => {
  const { toast } = useToast();
  const {
    securityThreats,
    detectThreats,
    loading,
    error,
    refreshSecurityData
  } = useSecurityCompliance({
    autoRefresh: true,
    refreshInterval: 30000,
    enableRealTimeAlerts: true,
    securityLevel: 'enterprise'
  });

  // ==================== State Management ====================

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);

  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [reportingMetrics, setReportingMetrics] = useState<any>(null);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastGenerated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showCreateReportDialog, setShowCreateReportDialog] = useState(false);
  const [showCreateDashboardDialog, setShowCreateDashboardDialog] = useState(false);
  const [showReportDetailsDialog, setShowReportDetailsDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);

  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== Backend Integration Functions ====================

  const fetchSecurityReports = useCallback(async () => {
    try {
      const response = await fetch('/api/security-reporting/reports', {
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
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch security reports:', error);
      // Fallback to mock data for development
      initializeMockData();
    }
  }, []);

  const fetchDashboards = useCallback(async () => {
    try {
      const response = await fetch('/api/security-reporting/dashboards', {
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
      setDashboards(data.dashboards || []);
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
    }
  }, []);

  const fetchSecurityMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/security-reporting/metrics', {
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
      setMetrics(data.metrics || []);
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
    }
  }, []);

  const generateReport = useCallback(async (reportId: string) => {
    setActionInProgress(prev => ({ ...prev, [`generate-${reportId}`]: true }));
    
    try {
      const response = await fetch(`/api/security-reporting/reports/${reportId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update report status
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { 
                ...report, 
                status: ReportStatus.COMPLETED,
                lastGenerated: new Date().toISOString()
              }
            : report
        )
      );
      
      toast({
        title: "Report Generated",
        description: "Security report has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, [`generate-${reportId}`]: false }));
    }
  }, [toast]);

  const exportReport = useCallback(async (reportId: string, format: ExportFormat) => {
    setActionInProgress(prev => ({ ...prev, [`export-${reportId}`]: true }));
    
    try {
      const response = await fetch(`/api/security-reporting/reports/${reportId}/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${reportId}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: `Report exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, [`export-${reportId}`]: false }));
    }
  }, [toast]);

  // ==================== Mock Data Initialization ====================

  const initializeMockData = useCallback(() => {
    const mockMetrics: SecurityMetric[] = [
      {
        id: 'metric-001',
        name: 'Security Posture Score',
        description: 'Overall security posture based on multiple security controls and metrics',
        category: MetricCategory.SECURITY_POSTURE,
        value: 87,
        unit: '%',
        dataType: 'percentage',
        target: 90,
        threshold: {
          good: { min: 85, operator: 'gte' },
          warning: { min: 70, max: 84, operator: 'between' },
          critical: { max: 69, operator: 'lte' }
        },
        trend: {
          direction: 'increasing',
          strength: 'moderate',
          confidence: 0.85,
          correlation: 0.72,
          seasonality: false,
          forecast: [],
          changePoints: [],
          anomalies: []
        },
        historical: [
          { date: '2024-01-01', value: 82 },
          { date: '2024-01-15', value: 84 },
          { date: '2024-02-01', value: 87 }
        ],
        status: MetricStatus.WARNING,
        lastUpdated: new Date().toISOString(),
        calculation: {
          formula: 'weighted_average(vulnerability_score, compliance_score, incident_score)',
          dataSources: ['vulnerability_data', 'compliance_data', 'incident_data'],
          filters: [],
          aggregationPeriod: 'daily',
          normalization: {
            enabled: true,
            method: 'min-max',
            baseline: 100
          },
          weighting: {
            enabled: true,
            weights: {
              'vulnerability_score': 0.4,
              'compliance_score': 0.3,
              'incident_score': 0.3
            },
            method: 'linear'
          }
        },
        aggregation: {
          method: 'average',
          groupBy: ['date'],
          timeWindow: '1d',
          percentiles: [50, 90, 95],
          outlierHandling: {
            enabled: true,
            method: 'iqr',
            threshold: 1.5,
            action: 'flag'
          }
        },
        chartType: ChartType.GAUGE,
        displayFormat: '{value}%',
        owner: 'security-team@company.com',
        tags: ['security', 'posture', 'kpi'],
        references: ['NIST Cybersecurity Framework', 'CIS Controls']
      }
    ];

    const mockReports: SecurityReport[] = [
      {
        id: 'report-001',
        name: 'Executive Security Dashboard',
        description: 'High-level security metrics and KPIs for executive leadership',
        type: ReportType.EXECUTIVE_DASHBOARD,
        category: ReportCategory.STRATEGIC,
        
        template: {
          id: 'template-001',
          name: 'Executive Template',
          description: 'Professional executive report template',
          layout: {
            orientation: 'portrait',
            pageSize: 'A4',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            header: {
              enabled: true,
              height: 80,
              content: {
                logo: '/assets/logo.png',
                title: 'Security Report',
                date: true
              },
              styling: {
                backgroundColor: '#ffffff',
                textColor: '#333333',
                fontSize: 14,
                alignment: 'center'
              }
            },
            footer: {
              enabled: true,
              height: 40,
              content: {
                copyright: '© 2024 Company Name',
                confidentiality: 'Confidential',
                pageNumbers: true
              },
              styling: {
                backgroundColor: '#f8f9fa',
                textColor: '#666666',
                fontSize: 10,
                alignment: 'center'
              }
            },
            columns: 1
          },
          styling: {
            colorScheme: {
              primary: '#007bff',
              secondary: '#6c757d',
              accent: '#28a745',
              background: '#ffffff',
              text: '#333333',
              success: '#28a745',
              warning: '#ffc107',
              error: '#dc3545',
              info: '#17a2b8'
            },
            typography: {
              headingFont: 'Inter',
              bodyFont: 'Inter',
              codeFont: 'Monaco',
              baseFontSize: 12,
              lineHeight: 1.5
            },
            branding: {
              logo: '/assets/logo.png',
              companyName: 'Company Name',
              colors: ['#007bff', '#28a745', '#ffc107']
            }
          },
          sections: [
            {
              id: 'exec-summary',
              name: 'Executive Summary',
              type: SectionType.EXECUTIVE_SUMMARY,
              order: 1,
              required: true,
              configurable: false,
              defaultConfig: {}
            }
          ],
          version: '1.0',
          author: 'Security Team',
          createdAt: new Date().toISOString(),
          category: 'executive',
          tags: ['executive', 'dashboard'],
          usageCount: 156,
          rating: 4.8,
          featured: true
        },
        
        parameters: {
          timeRange: {
            type: 'relative',
            relative: { amount: 30, unit: 'days' }
          },
          dataScope: {
            organizations: ['all'],
            departments: ['all'],
            systems: ['all'],
            applications: ['all'],
            environments: ['production', 'staging'],
            dataTypes: ['security', 'compliance', 'incidents']
          },
          aggregationLevel: AggregationLevel.EXECUTIVE,
          includeDetails: false,
          includeCharts: true,
          includeTrends: true,
          customParameters: {}
        },
        
        filters: [],
        
        schedule: {
          enabled: true,
          frequency: ScheduleFrequency.WEEKLY,
          time: '09:00',
          timezone: 'UTC',
          dayOfWeek: 1, // Monday
          conditions: [],
          notifications: [
            {
              type: 'email',
              recipients: ['executives@company.com'],
              template: 'executive_report_notification',
              conditions: [
                { event: 'success', enabled: true },
                { event: 'failure', enabled: true }
              ]
            }
          ],
          lastRun: new Date(Date.now() - 86400000 * 7).toISOString(),
          nextRun: new Date(Date.now() + 86400000).toISOString(),
          runCount: 52,
          failureCount: 2
        },
        
        recipients: [
          {
            id: 'recipient-001',
            type: 'group',
            identifier: 'executives',
            name: 'Executive Team',
            deliveryMethod: DeliveryMethod.EMAIL,
            format: ExportFormat.PDF,
            permissions: [
              { action: 'view', granted: true },
              { action: 'download', granted: true },
              { action: 'share', granted: false }
            ],
            preferences: {
              language: 'en',
              timezone: 'UTC',
              dateFormat: 'YYYY-MM-DD',
              numberFormat: 'en-US',
              customizations: {}
            }
          }
        ],
        
        status: ReportStatus.ACTIVE,
        lastGenerated: new Date(Date.now() - 86400000).toISOString(),
        nextGeneration: new Date(Date.now() + 86400000).toISOString(),
        
        sections: [
          {
            id: 'section-001',
            name: 'Executive Summary',
            type: SectionType.EXECUTIVE_SUMMARY,
            order: 1,
            title: 'Security Posture Overview',
            description: 'High-level summary of organizational security posture',
            content: {
              text: 'Our security posture remains strong with a score of 87%, showing steady improvement over the past quarter.',
              metrics: [
                {
                  name: 'Security Posture Score',
                  value: '87%',
                  trend: { direction: 'up', percentage: 5, period: '30 days' },
                  status: MetricStatus.WARNING
                }
              ]
            },
            visible: true,
            pageBreak: false,
            styling: {
              backgroundColor: '#ffffff',
              textColor: '#333333',
              fontSize: 14,
              padding: 20,
              margin: 10
            },
            dataSource: 'security_metrics',
            charts: ['chart-001'],
            tables: [],
            metrics: ['metric-001']
          }
        ],
        
        charts: [
          {
            id: 'chart-001',
            name: 'Security Posture Trend',
            type: ChartType.LINE,
            dataSource: 'security_metrics',
            query: 'SELECT date, security_score FROM metrics WHERE date >= NOW() - INTERVAL 30 DAY',
            config: {
              xAxis: { title: 'Date', type: 'time', format: 'MMM DD' },
              yAxis: { title: 'Score (%)', type: 'value', min: 0, max: 100 },
              series: [
                { name: 'Security Score', type: 'line', data: 'security_score', color: '#007bff' }
              ],
              legend: { show: true, position: 'top', orientation: 'horizontal' },
              tooltip: { show: true, format: '{value}%', backgroundColor: '#333', textColor: '#fff' },
              animation: { enabled: true, duration: 1000, easing: 'ease-in-out' }
            },
            styling: {
              width: 600,
              height: 300,
              backgroundColor: '#ffffff',
              borderColor: '#dee2e6',
              borderWidth: 1,
              borderRadius: 4
            },
            interactive: true,
            exportable: true,
            description: 'Trend analysis of security posture over time',
            tags: ['security', 'trend', 'kpi']
          }
        ],
        
        metrics: mockMetrics,
        
        visibility: ReportVisibility.RESTRICTED,
        permissions: [
          {
            userId: 'exec-001',
            role: 'executive',
            permissions: [
              { action: 'view', granted: true },
              { action: 'export', granted: true },
              { action: 'share', granted: true }
            ],
            grantedAt: new Date().toISOString(),
            grantedBy: 'admin'
          }
        ],
        
        createdBy: 'security-admin@company.com',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString(),
        version: '2.1',
        tags: ['executive', 'security', 'dashboard'],
        
        viewCount: 234,
        downloadCount: 89,
        lastViewed: new Date(Date.now() - 3600000).toISOString(),
        
        formats: [ExportFormat.PDF, ExportFormat.HTML, ExportFormat.PPTX],
        retentionPeriod: 365
      }
    ];

    const mockDashboards: Dashboard[] = [
      {
        id: 'dashboard-001',
        name: 'Security Operations Center',
        description: 'Real-time security monitoring and operations dashboard',
        type: DashboardType.OPERATIONAL,
        
        layout: {
          columns: 12,
          rows: 8,
          gridSize: 20,
          responsive: true,
          backgroundColor: '#f8f9fa',
          padding: 16,
          margin: 8
        },
        
        widgets: [
          {
            id: 'widget-001',
            name: 'Active Threats',
            type: WidgetType.METRIC,
            x: 0,
            y: 0,
            width: 3,
            height: 2,
            config: {
              title: 'Active Threats',
              showTitle: true,
              showBorder: true,
              query: 'SELECT COUNT(*) FROM threats WHERE status = "active"',
              filters: [],
              aggregation: 'count',
              format: 'number',
              precision: 0,
              showTrend: true,
              showTarget: false
            },
            dataSource: 'threat_intelligence',
            styling: {
              backgroundColor: '#ffffff',
              borderColor: '#dee2e6',
              borderWidth: 1,
              borderRadius: 8,
              textColor: '#333333',
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center'
            },
            interactive: true,
            drillDown: true,
            refreshInterval: 30000,
            lastRefresh: new Date().toISOString()
          }
        ],
        
        refreshInterval: 30000,
        autoRefresh: true,
        
        visibility: ReportVisibility.RESTRICTED,
        permissions: [
          {
            userId: 'soc-team',
            role: 'security_analyst',
            permissions: [
              { action: 'view', granted: true },
              { action: 'edit', granted: false }
            ],
            grantedAt: new Date().toISOString(),
            grantedBy: 'admin'
          }
        ],
        
        createdBy: 'soc-admin@company.com',
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        updatedAt: new Date().toISOString(),
        lastViewed: new Date().toISOString(),
        viewCount: 1247,
        
        theme: {
          name: 'Security Theme',
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745',
            background: '#f8f9fa',
            text: '#333333',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#17a2b8'
          },
          typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            codeFont: 'Monaco',
            baseFontSize: 14,
            lineHeight: 1.5
          },
          spacing: {
            small: 8,
            medium: 16,
            large: 24,
            extraLarge: 32
          }
        },
        
        filters: [
          {
            id: 'time-range',
            name: 'Time Range',
            type: 'date_range',
            field: 'date',
            defaultValue: { start: '2024-01-01', end: '2024-01-31' },
            required: false,
            visible: true,
            position: FilterPosition.TOP
          }
        ]
      }
    ];

    setReports(mockReports);
    setDashboards(mockDashboards);
    setMetrics(mockMetrics);
    setTemplates([mockReports[0].template]);
  }, []);

  // ==================== Utility Functions ====================

  const getStatusColor = (status: ReportStatus): string => {
    switch (status) {
      case ReportStatus.ACTIVE:
        return 'text-green-600';
      case ReportStatus.GENERATING:
        return 'text-blue-600';
      case ReportStatus.FAILED:
        return 'text-red-600';
      case ReportStatus.DRAFT:
        return 'text-yellow-600';
      case ReportStatus.ARCHIVED:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.ACTIVE:
        return 'default';
      case ReportStatus.GENERATING:
        return 'default';
      case ReportStatus.FAILED:
        return 'destructive';
      case ReportStatus.DRAFT:
        return 'outline';
      case ReportStatus.ARCHIVED:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMetricStatusColor = (status: MetricStatus): string => {
    switch (status) {
      case MetricStatus.GOOD:
        return 'text-green-600';
      case MetricStatus.WARNING:
        return 'text-yellow-600';
      case MetricStatus.CRITICAL:
        return 'text-red-600';
      case MetricStatus.UNKNOWN:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDateTime = (dateTime: string): string => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
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

  const handleGenerateReport = useCallback(async (reportId: string) => {
    await generateReport(reportId);
  }, [generateReport]);

  const handleExportReport = useCallback(async (reportId: string, format: ExportFormat) => {
    await exportReport(reportId, format);
  }, [exportReport]);

  const handleCreateReport = useCallback(async (reportData: any) => {
    try {
      const newReport: SecurityReport = {
        id: `report-${Date.now()}`,
        name: reportData.name,
        description: reportData.description,
        type: reportData.type,
        category: reportData.category,
        template: templates[0], // Use first template as default
        parameters: reportData.parameters,
        filters: reportData.filters || [],
        schedule: reportData.schedule,
        recipients: reportData.recipients || [],
        status: ReportStatus.DRAFT,
        sections: [],
        charts: [],
        metrics: [],
        visibility: ReportVisibility.PRIVATE,
        permissions: [],
        createdBy: 'current-user@company.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        tags: reportData.tags || [],
        viewCount: 0,
        downloadCount: 0,
        formats: [ExportFormat.PDF, ExportFormat.HTML],
        retentionPeriod: 365
      };
      
      setReports(prev => [newReport, ...prev]);
      setShowCreateReportDialog(false);
      
      toast({
        title: "Report Created",
        description: "New security report has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create report. Please try again.",
        variant: "destructive",
      });
    }
  }, [templates, toast]);

  // ==================== Effects ====================

  useEffect(() => {
    // Initialize data
    fetchSecurityReports();
    fetchDashboards();
    fetchSecurityMetrics();
  }, [fetchSecurityReports, fetchDashboards, fetchSecurityMetrics]);

  useEffect(() => {
    // Calculate reporting metrics
    const activeReports = reports.filter(r => r.status === ReportStatus.ACTIVE).length;
    const scheduledReports = reports.filter(r => r.schedule.enabled).length;
    const failedReports = reports.filter(r => r.status === ReportStatus.FAILED).length;
    const totalViews = reports.reduce((sum, r) => sum + r.viewCount, 0);
    const totalDownloads = reports.reduce((sum, r) => sum + r.downloadCount, 0);

    setReportingMetrics({
      totalReports: reports.length,
      activeReports,
      scheduledReports,
      failedReports,
      totalDashboards: dashboards.length,
      totalMetrics: metrics.length,
      totalViews,
      totalDownloads,
      avgViewsPerReport: totalViews / reports.length || 0,
      lastUpdated: new Date().toISOString()
    });
  }, [reports, dashboards, metrics]);

  // ==================== Filtered Data ====================

  const filteredReports = useMemo(() => {
    let filtered = reports;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(report => report.category === filterCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof SecurityReport] as string;
      const bValue = b[sortBy as keyof SecurityReport] as string;
      
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortOrder === 'asc' ? -1 : 1;
      if (!bValue) return sortOrder === 'asc' ? 1 : -1;
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [reports, filterType, filterStatus, filterCategory, searchQuery, sortBy, sortOrder]);

  const recentReports = useMemo(() => {
    return reports
      .filter(r => r.lastGenerated)
      .sort((a, b) => new Date(b.lastGenerated!).getTime() - new Date(a.lastGenerated!).getTime())
      .slice(0, 5);
  }, [reports]);

  // ==================== Dashboard Component ====================

  const SecurityReportingDashboard = () => (
    <div className="space-y-6">
      {/* Reporting Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportingMetrics?.totalReports || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {reportingMetrics?.activeReports || 0} Active
              </Badge>
              <Badge variant="outline" className="text-xs">
                {reportingMetrics?.scheduledReports || 0} Scheduled
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {reportingMetrics?.failedReports || 0} failed generation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportingMetrics?.totalDashboards || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                Real-time
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Interactive dashboards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportingMetrics?.totalViews || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {Math.round(reportingMetrics?.avgViewsPerReport || 0)} Avg/Report
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {reportingMetrics?.totalDownloads || 0} downloads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Metrics</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportingMetrics?.totalMetrics || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default">
                KPIs Tracked
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Real-time monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Latest generated security reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusBadgeVariant(report.status) as any}>
                      {report.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.category} • {report.viewCount} views
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(report.status) as any}>
                      {report.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(report.lastGenerated!)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Security Metrics</CardTitle>
            <CardDescription>
              Current security KPIs and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.slice(0, 3).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      metric.status === MetricStatus.GOOD ? 'bg-green-500' :
                      metric.status === MetricStatus.WARNING ? 'bg-yellow-500' :
                      metric.status === MetricStatus.CRITICAL ? 'bg-red-500' : 'bg-gray-500'
                    )} />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{metric.displayFormat.replace('{value}', metric.value.toString())}</span>
                    {metric.trend.direction === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : metric.trend.direction === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-600" />
                    )}
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
            Common reporting and dashboard tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreateReportDialog(true)}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Create Report</span>
            </Button>

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
              onClick={() => setShowTemplateDialog(true)}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Templates</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={refreshSecurityData}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading security reporting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load security reporting data: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Security Reporting</h1>
            <p className="text-muted-foreground">
              Executive dashboards and comprehensive security analytics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{reportingMetrics?.totalReports || 0} Reports</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3" />
              <span>{reportingMetrics?.totalDashboards || 0} Dashboards</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshSecurityData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Dashboards</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center space-x-2">
              <Gauge className="h-4 w-4" />
              <span>Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <SecurityReportingDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Report Management</h3>
              <p className="text-muted-foreground">
                Detailed report management interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="dashboards">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Dashboard Management</h3>
              <p className="text-muted-foreground">
                Interactive dashboard builder coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="text-center py-12">
              <Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Security Metrics</h3>
              <p className="text-muted-foreground">
                KPI management and analytics interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Report Templates</h3>
              <p className="text-muted-foreground">
                Template library and customization interface coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default SecurityReporting;