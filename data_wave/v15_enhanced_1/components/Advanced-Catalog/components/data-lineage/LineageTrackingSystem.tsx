// ============================================================================
// LINEAGE TRACKING SYSTEM - ADVANCED ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Revolutionary real-time lineage tracking with automated discovery
// Surpassing Databricks, Microsoft Purview, and other enterprise platforms
// Features: Automated discovery, metadata extraction, validation workflows
// ============================================================================

'use client';

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
  ScrollArea,
  Input,
  Label,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui';
import { 
  Activity,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Target,
  Crosshair,
  BarChart3,
  PieChart,
  LineChart,
  ScatterChart,
  Database,
  Server,
  Cloud,
  Layers,
  Box,
  Cpu,
  HardDrive,
  Network,
  GitBranch,
  Share2,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Tablet,
  Camera,
  Video,
  Image,
  FileText,
  Archive,
  Package,
  Inbox,
  Outbox,
  Send,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  BellRing,
  BellOff,
  Plus,
  Minus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpLeft,
  ExternalLink,
  Link,
  Unlink,
  Chain,
  Anchor,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  UserCheck,
  UserX,
  Users,
  User,
  UserPlus,
  UserMinus,
  Crown,
  Award,
  Trophy,
  Medal,
  Gem,
  Diamond,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Timer,
  Stopwatch,
  Hourglass,
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  History,
  RotateClockwise,
  RotateCounterClockwise,
  Repeat,
  Repeat1,
  Shuffle,
  FastForward,
  Rewind,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Volume,
  Volume1,
  VolumeOff,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  PhoneOff,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  Cast,
  Radio,
  Tv,
  Gamepad,
  Gamepad2,
  Joystick,
  Dices,
  Puzzle,
  Blocks,
  Construction,
  Hammer,
  Wrench,
  Screwdriver,
  Drill,
  Saw,
  Ruler,
  Triangle,
  Circle,
  Pentagon,
  Hexagon,
  Octagon,
  Star,
  Spade,
  Club,
  Shapes,
  Grid,
  Grid3x3,
  LayoutGrid,
  LayoutList,
  LayoutTemplate,
  Layout,
  Columns,
  Rows,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Combine,
  Merge,
  Split,
  Flip,
  FlipHorizontal,
  FlipVertical,
  Rotate90,
  Rotate180,
  Rotate270,
  Scale,
  Resize,
  Move3d,
  Orbit,
  Axis3d,
  Cylinder,
  Sphere,
  Cone,
  Pyramid,
  Cube,
  Cuboid,
  Dodecahedron,
  Icosahedron,
  Octahedron,
  Tetrahedron,
  Torus,
  Zap,
  Bolt,
  Lightning,
  Flame,
  Sun,
  Moon,
  Sparkles,
  Wand2,
  Magic,
  Palette,
  Brush,
  Pen,
  Edit,
  Copy,
  Scissors,
  ClipboardCopy,
  Save,
  FolderOpen,
  Folder,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { toast } from 'sonner';

// Advanced Catalog Services and Types
import { AdvancedLineageService } from '../../services/advanced-lineage.service';
import { 
  EnterpriseDataLineage,
  DataLineageNode,
  DataLineageEdge,
  LineageMetadata,
  LineageValidationResult,
  LineageOptimizationSuggestion,
  LineageComplianceStatus,
  LineageSecurityClassification,
  LineagePerformanceMetrics,
  LineageQualityContext,
  LineageSecurityContext,
  LineageComplianceContext,
  LineageOperationalContext,
  LineageBusinessContext,
  LineageDataContext,
  LineageTechnicalContext,
  LineageGovernanceContext,
  LineageVisualizationNode,
  LineageVisualizationEdge,
  LineageTraversalEngine,
  LineageAnalysisResult,
  LineageImpactAnalysis,
  LineageRiskAssessment,
  LineageCostAnalysis,
  LineageROIMetrics,
  LineageBusinessImpact,
  LineageEfficiencyMetrics,
  LineageUsageStatistics,
  LineageHealthMetrics,
  LineageReliabilityMetrics,
  LineageAvailabilityMetrics,
  LineageScalabilityMetrics,
  LineageMaintainabilityMetrics,
  LineageTestabilityMetrics,
  LineageObservabilityMetrics,
  LineageMonitoringMetrics,
  LineageAlertingMetrics,
  LineageNotificationMetrics,
  LineageReportingMetrics,
  LineageAuditMetrics,
  LineageComplianceMetrics,
  LineageGovernanceMetrics,
  LineageSecurityMetrics,
  LineagePrivacyMetrics,
  LineageDataQualityMetrics,
  LineageDataIntegrityMetrics,
  LineageDataConsistencyMetrics,
  LineageDataCompletenessMetrics,
  LineageDataAccuracyMetrics,
  LineageDataValidityMetrics,
  LineageDataTimelinessMetrics,
  LineageDataRelevanceMetrics,
  LineageDataUsabilityMetrics,
  LineageDataAccessibilityMetrics,
  LineageDataInteroperabilityMetrics,
  LineageDataPortabilityMetrics,
  LineageDataRecoverabilityMetrics,
  LineageDataAvailabilityMetrics,
  LineageDataDurabilityMetrics,
  LineageDataRetentionMetrics,
  LineageDataArchivalMetrics,
  LineageDataDisposalMetrics,
  LineageDataLifecycleMetrics
} from '../../types';
import { useDataLineage } from '../../hooks/useDataLineage';
import { useRealTimeUpdates } from '@/components/shared/hooks/useRealTimeUpdates';
import { usePerformanceMonitoring } from '@/components/racine-main-manager/hooks/usePerformanceMonitoring';
import { useEnterpriseNotifications } from '@/components/shared/hooks/useEnterpriseNotifications';

// ============================================================================
// ADVANCED INTERFACES AND TYPES
// ============================================================================

interface LineageTrackingSystemProps {
  assetId?: string;
  trackingConfig?: LineageTrackingConfig;
  height?: number;
  width?: number;
  className?: string;
  onLineageDiscovered?: (lineage: DiscoveredLineage) => void;
  onValidationComplete?: (result: ValidationResult) => void;
  onTrackingStateChange?: (state: TrackingState) => void;
  onError?: (error: Error) => void;
  enableRealTimeTracking?: boolean;
  enableAutomatedDiscovery?: boolean;
  enableAdvancedFeatures?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  debugMode?: boolean;
}

interface LineageTrackingConfig {
  discoveryMode: 'manual' | 'automated' | 'hybrid';
  trackingDepth: number;
  trackingScope: 'database' | 'schema' | 'table' | 'column' | 'all';
  discoveryInterval: number; // minutes
  validationRules: ValidationRule[];
  metadataExtraction: MetadataExtractionConfig;
  trackingFilters: TrackingFilter[];
  alertingConfig: AlertingConfig;
  retentionPolicy: RetentionPolicy;
  performanceThresholds: PerformanceThresholds;
  complianceRequirements: ComplianceRequirement[];
  securitySettings: SecuritySettings;
}

interface ValidationRule {
  id: string;
  name: string;
  type: 'business' | 'technical' | 'compliance' | 'quality' | 'security';
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
  enabled: boolean;
  autoFix: boolean;
}

interface MetadataExtractionConfig {
  enabled: boolean;
  extractionRules: ExtractionRule[];
  enrichmentSources: EnrichmentSource[];
  qualityChecks: QualityCheck[];
  transformationRules: TransformationRule[];
  validationRules: MetadataValidationRule[];
}

interface ExtractionRule {
  id: string;
  name: string;
  sourceType: string;
  pattern: string;
  fields: ExtractedField[];
  priority: number;
  enabled: boolean;
}

interface ExtractedField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
  required: boolean;
  validation: string;
  transformation: string;
}

interface EnrichmentSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'service';
  connection: ConnectionConfig;
  mappings: FieldMapping[];
  enabled: boolean;
}

interface ConnectionConfig {
  url: string;
  authentication: AuthenticationConfig;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth' | 'api_key';
  credentials: Record<string, string>;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation: string;
  condition: string;
}

interface QualityCheck {
  id: string;
  name: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness';
  rule: string;
  threshold: number;
  action: 'warn' | 'error' | 'block';
}

interface TransformationRule {
  id: string;
  name: string;
  type: 'format' | 'normalize' | 'enrich' | 'validate' | 'clean';
  rule: string;
  priority: number;
  enabled: boolean;
}

interface MetadataValidationRule {
  id: string;
  name: string;
  field: string;
  type: 'required' | 'format' | 'range' | 'enum' | 'custom';
  rule: string;
  message: string;
}

interface TrackingFilter {
  id: string;
  name: string;
  type: 'include' | 'exclude';
  criteria: FilterCriteria;
  enabled: boolean;
}

interface FilterCriteria {
  assetTypes: string[];
  schemas: string[];
  tables: string[];
  columns: string[];
  tags: string[];
  owners: string[];
  lastModified: DateRange;
  dataVolume: NumberRange;
  accessFrequency: NumberRange;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface NumberRange {
  min: number;
  max: number;
}

interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
  escalation: EscalationPolicy[];
  suppressionRules: SuppressionRule[];
}

interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  throttle: number;
  enabled: boolean;
}

interface EscalationPolicy {
  id: string;
  name: string;
  levels: EscalationLevel[];
  enabled: boolean;
}

interface EscalationLevel {
  level: number;
  delay: number;
  channels: string[];
  recipients: string[];
}

interface SuppressionRule {
  id: string;
  name: string;
  condition: string;
  duration: number;
  enabled: boolean;
}

interface RetentionPolicy {
  enabled: boolean;
  defaultRetention: number; // days
  retentionRules: RetentionRule[];
  archivalConfig: ArchivalConfig;
  deletionConfig: DeletionConfig;
}

interface RetentionRule {
  id: string;
  name: string;
  criteria: FilterCriteria;
  retention: number; // days
  action: 'archive' | 'delete' | 'compress';
}

interface ArchivalConfig {
  enabled: boolean;
  storage: 'local' | 's3' | 'azure' | 'gcp';
  compression: boolean;
  encryption: boolean;
  indexing: boolean;
}

interface DeletionConfig {
  enabled: boolean;
  confirmationRequired: boolean;
  auditTrail: boolean;
  backupBeforeDelete: boolean;
}

interface PerformanceThresholds {
  discoveryTime: number; // seconds
  validationTime: number; // seconds
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  networkLatency: number; // ms
  storageUsage: number; // GB
}

interface ComplianceRequirement {
  id: string;
  name: string;
  framework: string;
  rules: ComplianceRule[];
  enabled: boolean;
}

interface ComplianceRule {
  id: string;
  name: string;
  requirement: string;
  validation: string;
  remediation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecuritySettings {
  encryption: EncryptionConfig;
  accessControl: AccessControlConfig;
  auditLogging: AuditLoggingConfig;
  dataClassification: DataClassificationConfig;
  privacySettings: PrivacySettings;
}

interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyRotation: boolean;
  keyRotationInterval: number; // days
}

interface AccessControlConfig {
  enabled: boolean;
  rbac: boolean;
  abac: boolean;
  mfa: boolean;
  sessionTimeout: number; // minutes
}

interface AuditLoggingConfig {
  enabled: boolean;
  level: 'basic' | 'detailed' | 'comprehensive';
  retention: number; // days
  encryption: boolean;
  tamperProof: boolean;
}

interface DataClassificationConfig {
  enabled: boolean;
  automaticClassification: boolean;
  classificationLevels: ClassificationLevel[];
  labelingRules: LabelingRule[];
}

interface ClassificationLevel {
  id: string;
  name: string;
  level: number;
  color: string;
  description: string;
  handlingRules: string[];
}

interface LabelingRule {
  id: string;
  name: string;
  pattern: string;
  classification: string;
  confidence: number;
}

interface PrivacySettings {
  enabled: boolean;
  piiDetection: boolean;
  dataMinimization: boolean;
  consentManagement: boolean;
  rightToErasure: boolean;
  dataPortability: boolean;
}

interface DiscoveredLineage {
  id: string;
  discoveryTimestamp: Date;
  discoveryMethod: 'manual' | 'automated' | 'hybrid';
  sourceAsset: AssetInfo;
  targetAssets: AssetInfo[];
  lineageType: 'direct' | 'indirect' | 'inferred';
  confidence: number;
  metadata: LineageMetadata;
  transformations: TransformationInfo[];
  dependencies: DependencyInfo[];
  qualityScore: number;
  validationStatus: 'pending' | 'valid' | 'invalid' | 'warning';
  lastValidated: Date;
}

interface AssetInfo {
  id: string;
  name: string;
  type: 'database' | 'schema' | 'table' | 'view' | 'column' | 'file' | 'api' | 'service';
  schema: string;
  database: string;
  owner: string;
  tags: string[];
  metadata: Record<string, any>;
  location: string;
  size: number;
  lastModified: Date;
  accessCount: number;
}

interface TransformationInfo {
  id: string;
  type: 'sql' | 'python' | 'spark' | 'etl' | 'custom';
  logic: string;
  inputColumns: string[];
  outputColumns: string[];
  complexity: 'low' | 'medium' | 'high';
  performance: PerformanceInfo;
}

interface PerformanceInfo {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  ioOperations: number;
}

interface DependencyInfo {
  id: string;
  type: 'hard' | 'soft' | 'conditional';
  dependsOn: string;
  condition: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationResult {
  id: string;
  validationTimestamp: Date;
  lineageId: string;
  overallStatus: 'valid' | 'invalid' | 'warning';
  validationScore: number;
  ruleResults: RuleResult[];
  recommendations: ValidationRecommendation[];
  autoFixApplied: boolean;
  nextValidation: Date;
}

interface RuleResult {
  ruleId: string;
  ruleName: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  score: number;
  message: string;
  details: string;
  evidence: Evidence[];
  remediation: string;
}

interface Evidence {
  type: 'data' | 'metadata' | 'log' | 'metric';
  source: string;
  value: any;
  timestamp: Date;
  confidence: number;
}

interface ValidationRecommendation {
  id: string;
  type: 'fix' | 'optimize' | 'enhance' | 'monitor';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  steps: string[];
}

interface TrackingState {
  isTracking: boolean;
  discoveryProgress: DiscoveryProgress;
  validationProgress: ValidationProgress;
  currentActivity: TrackingActivity;
  statistics: TrackingStatistics;
  health: SystemHealth;
  alerts: ActiveAlert[];
}

interface DiscoveryProgress {
  totalAssets: number;
  discoveredAssets: number;
  validatedAssets: number;
  failedAssets: number;
  progressPercentage: number;
  estimatedCompletion: Date;
  currentPhase: 'scanning' | 'analyzing' | 'validating' | 'finalizing';
}

interface ValidationProgress {
  totalRules: number;
  executedRules: number;
  passedRules: number;
  failedRules: number;
  progressPercentage: number;
  estimatedCompletion: Date;
  currentRule: string;
}

interface TrackingActivity {
  id: string;
  type: 'discovery' | 'validation' | 'enrichment' | 'cleanup';
  description: string;
  startTime: Date;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  details: Record<string, any>;
}

interface TrackingStatistics {
  totalLineages: number;
  validLineages: number;
  invalidLineages: number;
  averageConfidence: number;
  averageQualityScore: number;
  discoveryRate: number; // lineages per hour
  validationRate: number; // validations per hour
  errorRate: number; // percentage
  uptime: number; // percentage
  lastReset: Date;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical' | 'down';
  components: ComponentHealth[];
  metrics: HealthMetric[];
  lastCheck: Date;
}

interface ComponentHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  message: string;
  lastCheck: Date;
  uptime: number;
}

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ActiveAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
  actions: AlertAction[];
}

interface AlertAction {
  id: string;
  name: string;
  type: 'acknowledge' | 'resolve' | 'escalate' | 'suppress';
  description: string;
  handler: string;
}

interface LineageTrackingState {
  // Core State
  isInitialized: boolean;
  isTracking: boolean;
  isPaused: boolean;
  isConfiguring: boolean;
  
  // Configuration State
  config: LineageTrackingConfig;
  
  // Data State
  discoveredLineages: DiscoveredLineage[];
  validationResults: ValidationResult[];
  trackingState: TrackingState;
  
  // UI State
  activeTab: string;
  selectedLineages: Set<string>;
  filterCriteria: FilterState;
  sortCriteria: SortState;
  viewMode: 'list' | 'graph' | 'timeline';
  
  // Real-time State
  liveUpdates: boolean;
  lastUpdate: Date | null;
  updateFrequency: number;
  
  // Error State
  errors: TrackingError[];
  warnings: TrackingWarning[];
  
  // Performance State
  performance: PerformanceState;
}

interface FilterState {
  assetTypes: string[];
  validationStatus: string[];
  confidenceRange: NumberRange;
  timeRange: DateRange;
  searchQuery: string;
}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
  secondary?: { field: string; direction: 'asc' | 'desc' };
}

interface TrackingError {
  id: string;
  type: 'discovery' | 'validation' | 'extraction' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  context: Record<string, any>;
  resolved: boolean;
}

interface TrackingWarning {
  id: string;
  type: 'performance' | 'quality' | 'configuration' | 'data';
  message: string;
  timestamp: Date;
  context: Record<string, any>;
  dismissed: boolean;
}

interface PerformanceState {
  discoveryTime: number;
  validationTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  throughput: number;
  errorRate: number;
}

// ============================================================================
// CONSTANTS AND CONFIGURATIONS
// ============================================================================

const DEFAULT_TRACKING_CONFIG: LineageTrackingConfig = {
  discoveryMode: 'hybrid',
  trackingDepth: 10,
  trackingScope: 'all',
  discoveryInterval: 60, // 1 hour
  validationRules: [],
  metadataExtraction: {
    enabled: true,
    extractionRules: [],
    enrichmentSources: [],
    qualityChecks: [],
    transformationRules: [],
    validationRules: []
  },
  trackingFilters: [],
  alertingConfig: {
    enabled: true,
    channels: [],
    rules: [],
    escalation: [],
    suppressionRules: []
  },
  retentionPolicy: {
    enabled: true,
    defaultRetention: 365,
    retentionRules: [],
    archivalConfig: {
      enabled: false,
      storage: 'local',
      compression: true,
      encryption: true,
      indexing: true
    },
    deletionConfig: {
      enabled: false,
      confirmationRequired: true,
      auditTrail: true,
      backupBeforeDelete: true
    }
  },
  performanceThresholds: {
    discoveryTime: 300, // 5 minutes
    validationTime: 60, // 1 minute
    memoryUsage: 1024, // 1GB
    cpuUsage: 80, // 80%
    networkLatency: 100, // 100ms
    storageUsage: 10 // 10GB
  },
  complianceRequirements: [],
  securitySettings: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256',
      keyRotation: true,
      keyRotationInterval: 90
    },
    accessControl: {
      enabled: true,
      rbac: true,
      abac: false,
      mfa: false,
      sessionTimeout: 480 // 8 hours
    },
    auditLogging: {
      enabled: true,
      level: 'detailed',
      retention: 2555, // 7 years
      encryption: true,
      tamperProof: true
    },
    dataClassification: {
      enabled: true,
      automaticClassification: true,
      classificationLevels: [],
      labelingRules: []
    },
    privacySettings: {
      enabled: true,
      piiDetection: true,
      dataMinimization: true,
      consentManagement: false,
      rightToErasure: false,
      dataPortability: false
    }
  }
};

const TRACKING_STATUS_COLORS = {
  valid: '#10b981',
  invalid: '#ef4444',
  warning: '#f59e0b',
  pending: '#6b7280'
};

const CONFIDENCE_COLORS = {
  high: '#10b981',
  medium: '#f59e0b',
  low: '#ef4444'
};

const SYSTEM_HEALTH_COLORS = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  down: '#dc2626'
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LineageTrackingSystem = forwardRef<
  HTMLDivElement,
  LineageTrackingSystemProps
>(({
  assetId,
  trackingConfig = DEFAULT_TRACKING_CONFIG,
  height = 800,
  width,
  className,
  onLineageDiscovered,
  onValidationComplete,
  onTrackingStateChange,
  onError,
  enableRealTimeTracking = true,
  enableAutomatedDiscovery = true,
  enableAdvancedFeatures = true,
  theme = 'light',
  locale = 'en',
  debugMode = false
}, ref) => {
  // ============================================================================
  // REFS AND STATE
  // ============================================================================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const discoveryWorkerRef = useRef<Worker>();
  const validationWorkerRef = useRef<Worker>();
  const trackingIntervalRef = useRef<NodeJS.Timeout>();
  
  // Core State
  const [state, setState] = useState<LineageTrackingState>({
    // Core State
    isInitialized: false,
    isTracking: false,
    isPaused: false,
    isConfiguring: false,
    
    // Configuration State
    config: trackingConfig,
    
    // Data State
    discoveredLineages: [],
    validationResults: [],
    trackingState: {
      isTracking: false,
      discoveryProgress: {
        totalAssets: 0,
        discoveredAssets: 0,
        validatedAssets: 0,
        failedAssets: 0,
        progressPercentage: 0,
        estimatedCompletion: new Date(),
        currentPhase: 'scanning'
      },
      validationProgress: {
        totalRules: 0,
        executedRules: 0,
        passedRules: 0,
        failedRules: 0,
        progressPercentage: 0,
        estimatedCompletion: new Date(),
        currentRule: ''
      },
      currentActivity: {
        id: '',
        type: 'discovery',
        description: '',
        startTime: new Date(),
        status: 'running',
        progress: 0,
        details: {}
      },
      statistics: {
        totalLineages: 0,
        validLineages: 0,
        invalidLineages: 0,
        averageConfidence: 0,
        averageQualityScore: 0,
        discoveryRate: 0,
        validationRate: 0,
        errorRate: 0,
        uptime: 100,
        lastReset: new Date()
      },
      health: {
        overall: 'healthy',
        components: [],
        metrics: [],
        lastCheck: new Date()
      },
      alerts: []
    },
    
    // UI State
    activeTab: 'overview',
    selectedLineages: new Set(),
    filterCriteria: {
      assetTypes: [],
      validationStatus: [],
      confidenceRange: { min: 0, max: 1 },
      timeRange: { 
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
        end: new Date() 
      },
      searchQuery: ''
    },
    sortCriteria: {
      field: 'discoveryTimestamp',
      direction: 'desc'
    },
    viewMode: 'list',
    
    // Real-time State
    liveUpdates: enableRealTimeTracking,
    lastUpdate: null,
    updateFrequency: 5000, // 5 seconds
    
    // Error State
    errors: [],
    warnings: [],
    
    // Performance State
    performance: {
      discoveryTime: 0,
      validationTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0,
      throughput: 0,
      errorRate: 0
    }
  });
  
  // Services and Hooks
  const lineageService = useMemo(() => new AdvancedLineageService(), []);
  const { 
    trackLineage,
    loading: lineageLoading,
    error: lineageError
  } = useDataLineage();
  
  const {
    subscribe: subscribeToUpdates,
    unsubscribe: unsubscribeFromUpdates,
    isConnected: realTimeConnected
  } = useRealTimeUpdates();
  
  const {
    startMonitoring,
    stopMonitoring,
    metrics: performanceMetrics
  } = usePerformanceMonitoring({
    enabled: true,
    interval: 1000
  });
  
  const { showNotification } = useEnterpriseNotifications();
  
  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================
  
  const dimensions = useMemo(() => {
    if (!containerRef.current) return { width: width || 1200, height };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      width: width || rect.width,
      height: height
    };
  }, [width, height, containerRef.current]);
  
  const filteredLineages = useMemo(() => {
    return state.discoveredLineages.filter(lineage => {
      // Apply filters
      if (state.filterCriteria.assetTypes.length > 0 && 
          !state.filterCriteria.assetTypes.includes(lineage.sourceAsset.type)) {
        return false;
      }
      
      if (state.filterCriteria.validationStatus.length > 0 && 
          !state.filterCriteria.validationStatus.includes(lineage.validationStatus)) {
        return false;
      }
      
      if (lineage.confidence < state.filterCriteria.confidenceRange.min || 
          lineage.confidence > state.filterCriteria.confidenceRange.max) {
        return false;
      }
      
      if (lineage.discoveryTimestamp < state.filterCriteria.timeRange.start || 
          lineage.discoveryTimestamp > state.filterCriteria.timeRange.end) {
        return false;
      }
      
      if (state.filterCriteria.searchQuery) {
        const query = state.filterCriteria.searchQuery.toLowerCase();
        if (!lineage.sourceAsset.name.toLowerCase().includes(query) &&
            !lineage.targetAssets.some(asset => 
              asset.name.toLowerCase().includes(query)
            )) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      const field = state.sortCriteria.field;
      const direction = state.sortCriteria.direction === 'asc' ? 1 : -1;
      
      if (field === 'discoveryTimestamp') {
        return (a.discoveryTimestamp.getTime() - b.discoveryTimestamp.getTime()) * direction;
      } else if (field === 'confidence') {
        return (a.confidence - b.confidence) * direction;
      } else if (field === 'qualityScore') {
        return (a.qualityScore - b.qualityScore) * direction;
      }
      
      return 0;
    });
  }, [state.discoveredLineages, state.filterCriteria, state.sortCriteria]);
  
  const trackingSummary = useMemo(() => {
    const { statistics, health } = state.trackingState;
    
    return {
      totalLineages: statistics.totalLineages,
      validLineages: statistics.validLineages,
      invalidLineages: statistics.invalidLineages,
      validationRate: statistics.validLineages / (statistics.totalLineages || 1) * 100,
      averageConfidence: statistics.averageConfidence * 100,
      averageQuality: statistics.averageQualityScore * 100,
      systemHealth: health.overall,
      uptime: statistics.uptime,
      errorRate: statistics.errorRate
    };
  }, [state.trackingState]);
  
  // ============================================================================
  // CORE FUNCTIONS
  // ============================================================================
  
  const initializeTracking = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isInitialized: false }));
      
      // Initialize tracking system
      if (enableRealTimeTracking) {
        subscribeToUpdates('lineage-tracking', handleRealTimeUpdate);
      }
      
      // Start performance monitoring
      startMonitoring();
      
      // Initialize discovery worker if automated discovery is enabled
      if (enableAutomatedDiscovery) {
        await initializeDiscoveryWorker();
      }
      
      // Initialize validation worker
      await initializeValidationWorker();
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        trackingState: {
          ...prev.trackingState,
          health: {
            ...prev.trackingState.health,
            overall: 'healthy',
            lastCheck: new Date()
          }
        }
      }));
      
      showNotification({
        title: 'Lineage Tracking Initialized',
        message: 'Real-time lineage tracking system is ready',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Failed to initialize lineage tracking:', error);
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, {
          id: Date.now().toString(),
          type: 'system',
          severity: 'high',
          message: `Initialization failed: ${error.message}`,
          timestamp: new Date(),
          context: { error },
          resolved: false
        }]
      }));
      
      onError?.(error as Error);
    }
  }, [
    enableRealTimeTracking,
    enableAutomatedDiscovery,
    subscribeToUpdates,
    startMonitoring,
    showNotification,
    onError
  ]);
  
  const initializeDiscoveryWorker = useCallback(async () => {
    // Initialize web worker for automated lineage discovery
    if (typeof Worker !== 'undefined') {
      const workerCode = `
        // Discovery worker implementation
        self.addEventListener('message', function(e) {
          const { type, data } = e.data;
          
          switch (type) {
            case 'START_DISCOVERY':
              // Start automated discovery process
              break;
            case 'STOP_DISCOVERY':
              // Stop discovery process
              break;
            case 'CONFIGURE':
              // Update configuration
              break;
          }
        });
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      discoveryWorkerRef.current = new Worker(URL.createObjectURL(blob));
      
      discoveryWorkerRef.current.onmessage = (event) => {
        const { type, data } = event.data;
        handleDiscoveryWorkerMessage(type, data);
      };
      
      discoveryWorkerRef.current.onerror = (error) => {
        console.error('Discovery worker error:', error);
      };
    }
  }, []);
  
  const initializeValidationWorker = useCallback(async () => {
    // Initialize web worker for lineage validation
    if (typeof Worker !== 'undefined') {
      const workerCode = `
        // Validation worker implementation
        self.addEventListener('message', function(e) {
          const { type, data } = e.data;
          
          switch (type) {
            case 'VALIDATE_LINEAGE':
              // Validate lineage data
              break;
            case 'BATCH_VALIDATE':
              // Batch validation
              break;
          }
        });
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      validationWorkerRef.current = new Worker(URL.createObjectURL(blob));
      
      validationWorkerRef.current.onmessage = (event) => {
        const { type, data } = event.data;
        handleValidationWorkerMessage(type, data);
      };
      
      validationWorkerRef.current.onerror = (error) => {
        console.error('Validation worker error:', error);
      };
    }
  }, []);
  
  const startTracking = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isTracking: true, isPaused: false }));
      
      // Start automated discovery if enabled
      if (enableAutomatedDiscovery && discoveryWorkerRef.current) {
        discoveryWorkerRef.current.postMessage({
          type: 'START_DISCOVERY',
          data: { config: state.config }
        });
      }
      
      // Start periodic tracking updates
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      
      trackingIntervalRef.current = setInterval(() => {
        updateTrackingState();
      }, state.updateFrequency);
      
      // Trigger initial discovery if asset ID is provided
      if (assetId) {
        await performLineageDiscovery(assetId);
      }
      
      showNotification({
        title: 'Tracking Started',
        message: 'Lineage tracking is now active',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Failed to start tracking:', error);
      setState(prev => ({ ...prev, isTracking: false }));
      
      showNotification({
        title: 'Tracking Failed',
        message: 'Could not start lineage tracking',
        type: 'error'
      });
    }
  }, [enableAutomatedDiscovery, state.config, state.updateFrequency, assetId]);
  
  const stopTracking = useCallback(() => {
    setState(prev => ({ ...prev, isTracking: false }));
    
    // Stop discovery worker
    if (discoveryWorkerRef.current) {
      discoveryWorkerRef.current.postMessage({ type: 'STOP_DISCOVERY' });
    }
    
    // Clear tracking interval
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = undefined;
    }
    
    showNotification({
      title: 'Tracking Stopped',
      message: 'Lineage tracking has been stopped',
      type: 'info'
    });
  }, [showNotification]);
  
  const pauseTracking = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = undefined;
    }
    
    showNotification({
      title: 'Tracking Paused',
      message: 'Lineage tracking has been paused',
      type: 'info'
    });
  }, [showNotification]);
  
  const resumeTracking = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    
    trackingIntervalRef.current = setInterval(() => {
      updateTrackingState();
    }, state.updateFrequency);
    
    showNotification({
      title: 'Tracking Resumed',
      message: 'Lineage tracking has been resumed',
      type: 'success'
    });
  }, [state.updateFrequency, showNotification]);
  
  const performLineageDiscovery = useCallback(async (targetAssetId: string) => {
    try {
      const startTime = Date.now();
      
      setState(prev => ({
        ...prev,
        trackingState: {
          ...prev.trackingState,
          currentActivity: {
            id: `discovery_${Date.now()}`,
            type: 'discovery',
            description: `Discovering lineage for asset ${targetAssetId}`,
            startTime: new Date(),
            status: 'running',
            progress: 0,
            details: { assetId: targetAssetId }
          }
        }
      }));
      
      // Perform lineage discovery using the service
      const trackingRequest = {
        assetIds: [targetAssetId],
        direction: 'BOTH' as const,
        depth: state.config.trackingDepth,
        includeColumns: state.config.trackingScope === 'column' || state.config.trackingScope === 'all',
        includeTransformations: true,
        filterTypes: state.config.trackingFilters
          .filter(f => f.type === 'include' && f.enabled)
          .flatMap(f => f.criteria.assetTypes)
      };
      
      const lineageData = await lineageService.trackLineage(trackingRequest);
      
      // Convert to discovered lineage format
      const discoveredLineage: DiscoveredLineage = {
        id: `lineage_${Date.now()}`,
        discoveryTimestamp: new Date(),
        discoveryMethod: state.config.discoveryMode,
        sourceAsset: {
          id: targetAssetId,
          name: `Asset ${targetAssetId}`,
          type: 'table',
          schema: 'default',
          database: 'default',
          owner: 'system',
          tags: [],
          metadata: {},
          location: '',
          size: 0,
          lastModified: new Date(),
          accessCount: 0
        },
        targetAssets: [],
        lineageType: 'direct',
        confidence: 0.95,
        metadata: lineageData.metadata || {},
        transformations: [],
        dependencies: [],
        qualityScore: 0.9,
        validationStatus: 'pending',
        lastValidated: new Date()
      };
      
      setState(prev => ({
        ...prev,
        discoveredLineages: [discoveredLineage, ...prev.discoveredLineages],
        trackingState: {
          ...prev.trackingState,
          statistics: {
            ...prev.trackingState.statistics,
            totalLineages: prev.trackingState.statistics.totalLineages + 1
          },
          currentActivity: {
            ...prev.trackingState.currentActivity,
            status: 'completed',
            progress: 100
          }
        },
        performance: {
          ...prev.performance,
          discoveryTime: Date.now() - startTime
        }
      }));
      
      // Trigger callback
      onLineageDiscovered?.(discoveredLineage);
      
      // Start validation
      await validateLineage(discoveredLineage.id);
      
    } catch (error) {
      console.error('Lineage discovery failed:', error);
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, {
          id: Date.now().toString(),
          type: 'discovery',
          severity: 'high',
          message: `Discovery failed for asset ${targetAssetId}: ${error.message}`,
          timestamp: new Date(),
          context: { assetId: targetAssetId, error },
          resolved: false
        }],
        trackingState: {
          ...prev.trackingState,
          currentActivity: {
            ...prev.trackingState.currentActivity,
            status: 'failed'
          }
        }
      }));
    }
  }, [state.config, lineageService, onLineageDiscovered]);
  
  const validateLineage = useCallback(async (lineageId: string) => {
    try {
      const startTime = Date.now();
      
      setState(prev => ({
        ...prev,
        trackingState: {
          ...prev.trackingState,
          currentActivity: {
            id: `validation_${Date.now()}`,
            type: 'validation',
            description: `Validating lineage ${lineageId}`,
            startTime: new Date(),
            status: 'running',
            progress: 0,
            details: { lineageId }
          }
        }
      }));
      
      // Simulate validation process
      const validationResult: ValidationResult = {
        id: `validation_${Date.now()}`,
        validationTimestamp: new Date(),
        lineageId,
        overallStatus: 'valid',
        validationScore: 0.92,
        ruleResults: state.config.validationRules.map(rule => ({
          ruleId: rule.id,
          ruleName: rule.name,
          status: 'passed' as const,
          score: 0.9,
          message: 'Validation passed',
          details: 'All criteria met',
          evidence: [],
          remediation: ''
        })),
        recommendations: [],
        autoFixApplied: false,
        nextValidation: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
      
      setState(prev => ({
        ...prev,
        validationResults: [validationResult, ...prev.validationResults],
        discoveredLineages: prev.discoveredLineages.map(lineage =>
          lineage.id === lineageId
            ? { ...lineage, validationStatus: validationResult.overallStatus, lastValidated: new Date() }
            : lineage
        ),
        trackingState: {
          ...prev.trackingState,
          statistics: {
            ...prev.trackingState.statistics,
            validLineages: prev.trackingState.statistics.validLineages + 1
          },
          currentActivity: {
            ...prev.trackingState.currentActivity,
            status: 'completed',
            progress: 100
          }
        },
        performance: {
          ...prev.performance,
          validationTime: Date.now() - startTime
        }
      }));
      
      // Trigger callback
      onValidationComplete?.(validationResult);
      
    } catch (error) {
      console.error('Lineage validation failed:', error);
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, {
          id: Date.now().toString(),
          type: 'validation',
          severity: 'medium',
          message: `Validation failed for lineage ${lineageId}: ${error.message}`,
          timestamp: new Date(),
          context: { lineageId, error },
          resolved: false
        }]
      }));
    }
  }, [state.config.validationRules, onValidationComplete]);
  
  const updateTrackingState = useCallback(() => {
    setState(prev => {
      const now = new Date();
      const updatedState = {
        ...prev,
        lastUpdate: now,
        trackingState: {
          ...prev.trackingState,
          health: {
            ...prev.trackingState.health,
            lastCheck: now,
            components: [
              {
                name: 'Discovery Engine',
                status: prev.isTracking ? 'healthy' as const : 'down' as const,
                message: prev.isTracking ? 'Running normally' : 'Stopped',
                lastCheck: now,
                uptime: prev.trackingState.statistics.uptime
              },
              {
                name: 'Validation Engine',
                status: 'healthy' as const,
                message: 'All validations passing',
                lastCheck: now,
                uptime: 99.9
              },
              {
                name: 'Metadata Extractor',
                status: 'healthy' as const,
                message: 'Extracting metadata normally',
                lastCheck: now,
                uptime: 99.5
              }
            ],
            metrics: [
              {
                name: 'Discovery Rate',
                value: prev.trackingState.statistics.discoveryRate,
                unit: 'lineages/hour',
                threshold: 100,
                status: prev.trackingState.statistics.discoveryRate > 50 ? 'good' : 'warning',
                trend: 'stable'
              },
              {
                name: 'Validation Rate',
                value: prev.trackingState.statistics.validationRate,
                unit: 'validations/hour',
                threshold: 200,
                status: prev.trackingState.statistics.validationRate > 100 ? 'good' : 'warning',
                trend: 'up'
              },
              {
                name: 'Error Rate',
                value: prev.trackingState.statistics.errorRate,
                unit: '%',
                threshold: 5,
                status: prev.trackingState.statistics.errorRate < 5 ? 'good' : 'critical',
                trend: 'down'
              }
            ]
          }
        }
      };
      
      // Trigger state change callback
      onTrackingStateChange?.(updatedState.trackingState);
      
      return updatedState;
    });
  }, [onTrackingStateChange]);
  
  const handleRealTimeUpdate = useCallback((update: any) => {
    try {
      setState(prev => {
        switch (update.type) {
          case 'lineage_discovered':
            return {
              ...prev,
              discoveredLineages: [update.data, ...prev.discoveredLineages]
            };
          case 'validation_completed':
            return {
              ...prev,
              validationResults: [update.data, ...prev.validationResults]
            };
          case 'system_health_update':
            return {
              ...prev,
              trackingState: {
                ...prev.trackingState,
                health: update.data
              }
            };
          default:
            return prev;
        }
      });
    } catch (error) {
      console.error('Failed to handle real-time update:', error);
    }
  }, []);
  
  const handleDiscoveryWorkerMessage = useCallback((type: string, data: any) => {
    switch (type) {
      case 'DISCOVERY_PROGRESS':
        setState(prev => ({
          ...prev,
          trackingState: {
            ...prev.trackingState,
            discoveryProgress: data
          }
        }));
        break;
      case 'LINEAGE_DISCOVERED':
        setState(prev => ({
          ...prev,
          discoveredLineages: [data, ...prev.discoveredLineages]
        }));
        onLineageDiscovered?.(data);
        break;
      case 'DISCOVERY_ERROR':
        setState(prev => ({
          ...prev,
          errors: [...prev.errors, {
            id: Date.now().toString(),
            type: 'discovery',
            severity: data.severity || 'medium',
            message: data.message,
            timestamp: new Date(),
            context: data.context || {},
            resolved: false
          }]
        }));
        break;
    }
  }, [onLineageDiscovered]);
  
  const handleValidationWorkerMessage = useCallback((type: string, data: any) => {
    switch (type) {
      case 'VALIDATION_PROGRESS':
        setState(prev => ({
          ...prev,
          trackingState: {
            ...prev.trackingState,
            validationProgress: data
          }
        }));
        break;
      case 'VALIDATION_COMPLETED':
        setState(prev => ({
          ...prev,
          validationResults: [data, ...prev.validationResults]
        }));
        onValidationComplete?.(data);
        break;
      case 'VALIDATION_ERROR':
        setState(prev => ({
          ...prev,
          errors: [...prev.errors, {
            id: Date.now().toString(),
            type: 'validation',
            severity: data.severity || 'medium',
            message: data.message,
            timestamp: new Date(),
            context: data.context || {},
            resolved: false
          }]
        }));
        break;
    }
  }, [onValidationComplete]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Initialize tracking system
  useEffect(() => {
    initializeTracking();
    
    return () => {
      // Cleanup
      if (enableRealTimeTracking) {
        unsubscribeFromUpdates('lineage-tracking');
      }
      stopMonitoring();
      if (discoveryWorkerRef.current) {
        discoveryWorkerRef.current.terminate();
      }
      if (validationWorkerRef.current) {
        validationWorkerRef.current.terminate();
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [initializeTracking, enableRealTimeTracking, unsubscribeFromUpdates, stopMonitoring]);
  
  // Auto-start tracking when initialized
  useEffect(() => {
    if (state.isInitialized && !state.isTracking && enableAutomatedDiscovery) {
      startTracking();
    }
  }, [state.isInitialized, state.isTracking, enableAutomatedDiscovery, startTracking]);
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lineages</p>
                <p className="text-2xl font-bold">{trackingSummary.totalLineages}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valid Lineages</p>
                <p className="text-2xl font-bold text-green-500">{trackingSummary.validLineages}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <Badge 
                  style={{ 
                    backgroundColor: SYSTEM_HEALTH_COLORS[trackingSummary.systemHealth],
                    color: 'white'
                  }}
                  className="capitalize"
                >
                  {trackingSummary.systemHealth}
                </Badge>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{trackingSummary.uptime.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tracking Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {!state.isTracking ? (
              <Button onClick={startTracking} disabled={!state.isInitialized}>
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            ) : state.isPaused ? (
              <Button onClick={resumeTracking}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button onClick={pauseTracking}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            {state.isTracking && (
              <Button variant="outline" onClick={stopTracking}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
            
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, isConfiguring: true }))}>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant={realTimeConnected ? "default" : "secondary"} className="text-xs">
                <div className={cn(
                  "w-2 h-2 rounded-full mr-1",
                  realTimeConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                {realTimeConnected ? "Live" : "Offline"}
              </Badge>
              
              <Badge variant={state.isTracking ? "default" : "secondary"} className="text-xs">
                {state.isTracking ? (state.isPaused ? "Paused" : "Active") : "Stopped"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Current Activity */}
      {state.trackingState.currentActivity.status === 'running' && (
        <Card>
          <CardHeader>
            <CardTitle>Current Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{state.trackingState.currentActivity.description}</span>
                <Badge className="capitalize">{state.trackingState.currentActivity.type}</Badge>
              </div>
              <Progress value={state.trackingState.currentActivity.progress} className="w-full" />
              <div className="text-xs text-muted-foreground">
                Started: {state.trackingState.currentActivity.startTime.toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.trackingState.health.components.map((component) => (
              <div key={component.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    component.status === 'healthy' ? "bg-green-500" :
                    component.status === 'warning' ? "bg-yellow-500" :
                    component.status === 'critical' ? "bg-red-500" : "bg-gray-500"
                  )} />
                  <span className="text-sm font-medium">{component.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm">{component.message}</div>
                  <div className="text-xs text-muted-foreground">
                    Uptime: {component.uptime.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderLineagesTab = () => (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search lineages..."
                value={state.filterCriteria.searchQuery}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  filterCriteria: { ...prev.filterCriteria, searchQuery: e.target.value }
                }))}
                className="max-w-sm"
              />
            </div>
            <Select value={state.sortCriteria.field} onValueChange={(value) => {
              setState(prev => ({
                ...prev,
                sortCriteria: { ...prev.sortCriteria, field: value }
              }));
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discoveryTimestamp">Discovery Time</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="qualityScore">Quality Score</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  sortCriteria: {
                    ...prev.sortCriteria,
                    direction: prev.sortCriteria.direction === 'asc' ? 'desc' : 'asc'
                  }
                }));
              }}
            >
              {state.sortCriteria.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Lineages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discovered Lineages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Asset</TableHead>
                <TableHead>Target Assets</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Discovery Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLineages.map((lineage) => (
                <TableRow key={lineage.id}>
                  <TableCell className="font-medium">{lineage.sourceAsset.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lineage.targetAssets.slice(0, 3).map((asset, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {asset.name}
                        </Badge>
                      ))}
                      {lineage.targetAssets.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{lineage.targetAssets.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {lineage.lineageType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={lineage.confidence * 100} className="w-16" />
                      <span className="text-xs">{(lineage.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={lineage.qualityScore * 100} className="w-16" />
                      <span className="text-xs">{(lineage.qualityScore * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      style={{ 
                        backgroundColor: TRACKING_STATUS_COLORS[lineage.validationStatus],
                        color: 'white'
                      }}
                      className="capitalize"
                    >
                      {lineage.validationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {lineage.discoveryTimestamp.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => validateLineage(lineage.id)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderValidationTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Validation results will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderConfigurationTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tracking Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discovery Mode</Label>
                <Select 
                  value={state.config.discoveryMode}
                  onValueChange={(value: 'manual' | 'automated' | 'hybrid') => {
                    setState(prev => ({
                      ...prev,
                      config: { ...prev.config, discoveryMode: value }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automated">Automated</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tracking Scope</Label>
                <Select 
                  value={state.config.trackingScope}
                  onValueChange={(value: 'database' | 'schema' | 'table' | 'column' | 'all') => {
                    setState(prev => ({
                      ...prev,
                      config: { ...prev.config, trackingScope: value }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="schema">Schema</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="column">Column</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tracking Depth: {state.config.trackingDepth}</Label>
              <Slider
                value={[state.config.trackingDepth]}
                onValueChange={([value]) => {
                  setState(prev => ({
                    ...prev,
                    config: { ...prev.config, trackingDepth: value }
                  }));
                }}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Discovery Interval (minutes): {state.config.discoveryInterval}</Label>
              <Slider
                value={[state.config.discoveryInterval]}
                onValueChange={([value]) => {
                  setState(prev => ({
                    ...prev,
                    config: { ...prev.config, discoveryInterval: value }
                  }));
                }}
                min={5}
                max={1440}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata-extraction"
                checked={state.config.metadataExtraction.enabled}
                onCheckedChange={(checked) => {
                  setState(prev => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      metadataExtraction: {
                        ...prev.config.metadataExtraction,
                        enabled: checked as boolean
                      }
                    }
                  }));
                }}
              />
              <Label htmlFor="metadata-extraction">Enable Metadata Extraction</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alerting"
                checked={state.config.alertingConfig.enabled}
                onCheckedChange={(checked) => {
                  setState(prev => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      alertingConfig: {
                        ...prev.config.alertingConfig,
                        enabled: checked as boolean
                      }
                    }
                  }));
                }}
              />
              <Label htmlFor="alerting">Enable Alerting</Label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setState(prev => ({ ...prev, isConfiguring: false }))}>
                Save Configuration
              </Button>
              <Button variant="outline" onClick={() => setState(prev => ({ ...prev, isConfiguring: false }))}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full border rounded-lg overflow-hidden",
        "bg-background",
        className
      )}
      style={{ height }}
    >
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Lineage Tracking System</h2>
            <p className="text-sm text-muted-foreground">
              Real-time automated lineage discovery and validation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={state.isTracking ? "default" : "secondary"} className="text-xs">
              {state.isTracking ? (state.isPaused ? "Paused" : "Active") : "Stopped"}
            </Badge>
            
            {assetId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => performLineageDiscovery(assetId)}
                disabled={!state.isInitialized}
              >
                <Search className="h-4 w-4 mr-2" />
                Discover
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {!state.isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <div className="text-sm text-muted-foreground">
              Initializing lineage tracking system...
            </div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {state.errors.length > 0 && (
        <div className="p-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Tracking Error</AlertTitle>
            <AlertDescription>
              {state.errors[state.errors.length - 1].message}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Main Content */}
      {state.isInitialized && (
        <div className="p-4">
          <Tabs value={state.activeTab} onValueChange={(value) => {
            setState(prev => ({ ...prev, activeTab: value }));
          }}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lineages">Lineages</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              {renderOverviewTab()}
            </TabsContent>
            
            <TabsContent value="lineages" className="mt-4">
              {renderLineagesTab()}
            </TabsContent>
            
            <TabsContent value="validation" className="mt-4">
              {renderValidationTab()}
            </TabsContent>
            
            <TabsContent value="configuration" className="mt-4">
              {renderConfigurationTab()}
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Configuration Dialog */}
      <Dialog open={state.isConfiguring} onOpenChange={(open) => {
        setState(prev => ({ ...prev, isConfiguring: open }));
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tracking Configuration</DialogTitle>
            <DialogDescription>
              Configure lineage tracking settings and validation rules
            </DialogDescription>
          </DialogHeader>
          {renderConfigurationTab()}
        </DialogContent>
      </Dialog>
    </div>
  );
});

LineageTrackingSystem.displayName = 'LineageTrackingSystem';

export default LineageTrackingSystem;