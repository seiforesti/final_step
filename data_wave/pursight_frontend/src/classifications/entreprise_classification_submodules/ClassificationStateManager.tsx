import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

// Advanced Enterprise State Types
export interface ClassificationState {
  // Core State
  isLoading: boolean;
  error: string | null;
  currentView: ClassificationView;
  currentVersion: ClassificationVersion;
  currentComponent: string | null;
  sidebarOpen: boolean;
  
  // Advanced Enterprise State
  workflowMode: 'guided' | 'advanced' | 'expert';
  intelligenceLevel: 'manual' | 'assisted' | 'autonomous';
  collaborationMode: boolean;
  realTimeSync: boolean;
  performanceMode: 'balanced' | 'speed' | 'accuracy';
  systemHealth: 'optimal' | 'good' | 'warning' | 'critical';
  
  // Workflow Management
  activeWorkflows: WorkflowInstance[];
  workflowHistory: WorkflowExecution[];
  
  // UI State
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
  
  // System State
  systemMetrics: SystemMetrics;
  performanceData: PerformanceData[];
  recentActivities: Activity[];
  userPreferences: UserPreferences;
  
  // Security & Access
  userRole: string;
  userPermissions: string[];
  securityContext: SecurityContext;
  
  // Real-time State
  realTimeData: RealTimeData;
  connectionStatus: ConnectionStatus;
  
  // Analytics & Monitoring
  analyticsData: AnalyticsData;
  monitoringAlerts: MonitoringAlert[];
}

export interface ClassificationView {
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

export interface WorkflowInstance {
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

export interface WorkflowExecution {
  id: string;
  workflowId: string;
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

export interface NotificationItem {
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

export interface FilterState {
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

export interface CustomViewState {
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

export interface SystemMetrics {
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

export interface PerformanceData {
  timestamp: Date;
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

export interface Activity {
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

export interface UserPreferences {
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

export interface SecurityContext {
  userRole: string;
  permissions: string[];
  sessionId: string;
  lastActivity: Date;
  securityLevel: 'basic' | 'enhanced' | 'enterprise' | 'government';
  mfaEnabled: boolean;
  ipWhitelist: string[];
  deviceTrust: DeviceTrust[];
}

export interface RealTimeData {
  activeConnections: number;
  dataStreams: DataStream[];
  liveMetrics: LiveMetrics;
  realTimeEvents: RealTimeEvent[];
}

export interface ConnectionStatus {
  websocket: 'connected' | 'disconnected' | 'reconnecting';
  api: 'healthy' | 'degraded' | 'down';
  database: 'connected' | 'disconnected' | 'slow';
  lastSync: Date;
  latency: number;
}

export interface AnalyticsData {
  userEngagement: UserEngagementMetrics;
  systemUsage: SystemUsageMetrics;
  performanceAnalytics: PerformanceAnalytics;
  businessMetrics: BusinessMetrics;
  predictiveAnalytics: PredictiveAnalytics;
}

export interface MonitoringAlert {
  id: string;
  type: 'performance' | 'security' | 'compliance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  actions: AlertAction[];
}

// Action Types
export type ClassificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_VIEW'; payload: ClassificationView }
  | { type: 'SET_CURRENT_VERSION'; payload: ClassificationVersion }
  | { type: 'SET_CURRENT_COMPONENT'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_WORKFLOW_MODE'; payload: 'guided' | 'advanced' | 'expert' }
  | { type: 'SET_INTELLIGENCE_LEVEL'; payload: 'manual' | 'assisted' | 'autonomous' }
  | { type: 'TOGGLE_COLLABORATION_MODE' }
  | { type: 'TOGGLE_REAL_TIME_SYNC' }
  | { type: 'SET_PERFORMANCE_MODE'; payload: 'balanced' | 'speed' | 'accuracy' }
  | { type: 'SET_SYSTEM_HEALTH'; payload: 'optimal' | 'good' | 'warning' | 'critical' }
  | { type: 'ADD_WORKFLOW'; payload: WorkflowInstance }
  | { type: 'UPDATE_WORKFLOW'; payload: { id: string; updates: Partial<WorkflowInstance> } }
  | { type: 'REMOVE_WORKFLOW'; payload: string }
  | { type: 'SET_GLOBAL_SEARCH'; payload: string }
  | { type: 'TOGGLE_COMMAND_PALETTE' }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationItem }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<NotificationItem> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'TOGGLE_CONTEXTUAL_HELP' }
  | { type: 'UPDATE_FILTERS'; payload: Partial<FilterState> }
  | { type: 'ADD_CUSTOM_VIEW'; payload: CustomViewState }
  | { type: 'UPDATE_CUSTOM_VIEW'; payload: { id: string; updates: Partial<CustomViewState> } }
  | { type: 'REMOVE_CUSTOM_VIEW'; payload: string }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'TOGGLE_SPLIT_VIEW' }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'UPDATE_SYSTEM_METRICS'; payload: SystemMetrics }
  | { type: 'UPDATE_PERFORMANCE_DATA'; payload: PerformanceData[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_USER_ROLE'; payload: string }
  | { type: 'SET_USER_PERMISSIONS'; payload: string[] }
  | { type: 'UPDATE_SECURITY_CONTEXT'; payload: Partial<SecurityContext> }
  | { type: 'UPDATE_REAL_TIME_DATA'; payload: RealTimeData }
  | { type: 'UPDATE_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'UPDATE_ANALYTICS_DATA'; payload: AnalyticsData }
  | { type: 'ADD_MONITORING_ALERT'; payload: MonitoringAlert }
  | { type: 'RESOLVE_MONITORING_ALERT'; payload: string }
  | { type: 'RESET_STATE' }
  | { type: 'HYDRATE_STATE'; payload: Partial<ClassificationState> };

// Additional type definitions
export type ClassificationVersion = 'v1-manual' | 'v2-ml' | 'v3-ai' | 'orchestration' | 'all';
export type ViewType = 'dashboard' | 'table' | 'grid' | 'list' | 'kanban' | 'timeline' | 'calendar' | 'map' | 'chart' | 'graph';
export type ActivityType = 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'share' | 'collaborate' | 'analyze' | 'optimize';
export type ActivitySeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';
export type ActivityCategory = 'user' | 'system' | 'security' | 'performance' | 'compliance' | 'integration' | 'automation';
export type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled' | 'archived';
export type OverallStatus = 'healthy' | 'degraded' | 'partial-outage' | 'major-outage' | 'maintenance';

// Extended interfaces for comprehensive state management
interface ViewLayout {
  type: 'grid' | 'list' | 'kanban' | 'timeline' | 'calendar' | 'map' | 'chart' | 'graph';
  columns: number;
  rows: number;
  spacing: number;
  responsive: boolean;
  breakpoints: Record<string, any>;
}

interface ViewComponent {
  id: string;
  type: string;
  position: { x: number; y: number; width: number; height: number };
  props: Record<string, any>;
  visible: boolean;
  locked: boolean;
}

interface ViewFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
  active: boolean;
}

interface ViewSorting {
  field: string;
  direction: 'asc' | 'desc';
  multiSort: boolean;
  sortOrder: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

interface ViewGrouping {
  enabled: boolean;
  fields: string[];
  collapsed: boolean;
  showCounts: boolean;
}

interface ViewPagination {
  enabled: boolean;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
}

interface ViewCustomization {
  theme: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, number>;
  animations: Record<string, boolean>;
}

interface ViewPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExport: boolean;
  canImport: boolean;
}

interface ViewSharing {
  public: boolean;
  sharedWith: Array<{ userId: string; permissions: string[] }>;
  linkSharing: boolean;
  expirationDate?: Date;
}

interface ViewBookmark {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  tags: string[];
}

interface ViewHistory {
  id: string;
  action: string;
  timestamp: Date;
  user: string;
  changes: Record<string, any>;
}

interface ViewPreferences {
  autoSave: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: boolean;
  sound: boolean;
}

interface ViewMetadata {
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  tags: string[];
  description: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  dependencies: string[];
}

interface InfrastructureStatus {
  servers: ServerStatus[];
  databases: DatabaseStatus[];
  networks: NetworkStatus[];
  storage: StorageStatus[];
  loadBalancers: LoadBalancerStatus[];
}

interface PerformanceStatus {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

interface SecurityStatus {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  vulnerabilities: number;
  lastScan: Date;
  complianceScore: number;
}

interface ComplianceStatus {
  frameworks: ComplianceFramework[];
  violations: ComplianceViolation[];
  lastAudit: Date;
  nextAudit: Date;
  overallScore: number;
}

interface MonitoringStatus {
  activeMonitors: number;
  alerts: number;
  incidents: number;
  lastUpdate: Date;
  coverage: number;
}

interface AlertStatus {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface IncidentStatus {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  startTime: Date;
  endTime?: Date;
  affectedServices: string[];
}

interface MaintenanceStatus {
  scheduled: MaintenanceWindow[];
  inProgress: boolean;
  nextWindow: Date;
  estimatedDuration: number;
}

interface UpdateStatus {
  available: boolean;
  version: string;
  releaseNotes: string;
  critical: boolean;
  autoUpdate: boolean;
}

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  services: ServiceHealth[];
  lastCheck: Date;
  trends: HealthTrend[];
}

interface AvailabilityStatus {
  uptime: number;
  downtime: number;
  incidents: number;
  mttr: number;
  mtbf: number;
}

interface ReliabilityStatus {
  errorRate: number;
  successRate: number;
  consistency: number;
  predictability: number;
}

interface ScalabilityStatus {
  currentLoad: number;
  maxCapacity: number;
  scalingTrend: 'increasing' | 'decreasing' | 'stable';
  bottlenecks: string[];
}

interface EfficiencyStatus {
  resourceUtilization: number;
  costEfficiency: number;
  performancePerDollar: number;
  optimizationOpportunities: string[];
}

interface QualityStatus {
  defectRate: number;
  customerSatisfaction: number;
  codeQuality: number;
  testCoverage: number;
}

interface SatisfactionStatus {
  userSatisfaction: number;
  nps: number;
  feedback: Feedback[];
  improvements: string[];
}

// Additional interfaces for comprehensive state
interface ActivityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface ActivityContext {
  component: string;
  action: string;
  resource: string;
  metadata: Record<string, any>;
}

interface ActivityMetadata {
  ip: string;
  userAgent: string;
  sessionId: string;
  timestamp: Date;
  duration?: number;
}

interface RelatedActivity {
  id: string;
  type: string;
  relationship: 'parent' | 'child' | 'sibling' | 'related';
}

interface ActivityAction {
  id: string;
  label: string;
  action: () => void;
  enabled: boolean;
}

interface ActivityVisibility {
  public: boolean;
  roles: string[];
  users: string[];
}

interface ActivityRetention {
  duration: number;
  autoDelete: boolean;
  archive: boolean;
}

interface ThemePreference {
  mode: 'light' | 'dark' | 'auto';
  primary: string;
  secondary: string;
  accent: string;
  custom: Record<string, string>;
}

interface LayoutPreference {
  sidebar: 'collapsed' | 'expanded' | 'auto';
  density: 'compact' | 'comfortable' | 'spacious';
  grid: boolean;
  animations: boolean;
}

interface NavigationPreference {
  style: 'sidebar' | 'top' | 'breadcrumb';
  showLabels: boolean;
  groupBy: 'category' | 'frequency' | 'alphabetical';
}

interface DashboardPreference {
  layout: 'grid' | 'list' | 'kanban';
  widgets: string[];
  refreshInterval: number;
  autoSave: boolean;
}

interface NotificationPreference {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
}

interface AccessibilityPreference {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
}

interface LocalizationPreference {
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

interface PrivacyPreference {
  dataCollection: boolean;
  analytics: boolean;
  personalization: boolean;
  sharing: boolean;
}

interface SecurityPreference {
  mfa: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  deviceTrust: boolean;
}

interface PerformancePreference {
  cache: boolean;
  compression: boolean;
  lazyLoading: boolean;
  prefetch: boolean;
}

interface AutomationPreference {
  autoSave: boolean;
  autoRefresh: boolean;
  smartSuggestions: boolean;
  workflowAutomation: boolean;
}

interface CollaborationPreference {
  realTime: boolean;
  notifications: boolean;
  sharing: boolean;
  comments: boolean;
}

interface IntegrationPreference {
  apis: boolean;
  webhooks: boolean;
  sso: boolean;
  thirdParty: boolean;
}

interface CustomizationPreference {
  themes: boolean;
  layouts: boolean;
  widgets: boolean;
  shortcuts: boolean;
}

interface ShortcutPreference {
  key: string;
  action: string;
  enabled: boolean;
}

interface BookmarkPreference {
  autoSave: boolean;
  sync: boolean;
  categories: string[];
}

interface HistoryPreference {
  retention: number;
  autoCleanup: boolean;
  searchable: boolean;
}

interface SearchPreference {
  engine: 'local' | 'global' | 'hybrid';
  suggestions: boolean;
  history: boolean;
  filters: boolean;
}

interface FilterPreference {
  name: string;
  criteria: Record<string, any>;
  saved: boolean;
}

interface ViewPreference {
  name: string;
  layout: string;
  filters: FilterState;
  saved: boolean;
}

interface ExportPreference {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  compression: boolean;
  includeMetadata: boolean;
}

interface ImportPreference {
  validation: boolean;
  autoMapping: boolean;
  conflictResolution: 'skip' | 'overwrite' | 'merge';
}

interface BackupPreference {
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
  encryption: boolean;
}

interface SyncPreference {
  realTime: boolean;
  conflictResolution: 'server' | 'client' | 'manual';
  compression: boolean;
}

interface OfflinePreference {
  enabled: boolean;
  cacheSize: number;
  syncOnReconnect: boolean;
}

interface MobilePreference {
  responsive: boolean;
  touchOptimized: boolean;
  gestures: boolean;
}

interface DesktopPreference {
  native: boolean;
  shortcuts: boolean;
  notifications: boolean;
}

interface WebPreference {
  pwa: boolean;
  offline: boolean;
  pushNotifications: boolean;
}

interface APIPreference {
  rateLimit: number;
  authentication: 'token' | 'oauth' | 'basic';
  versioning: boolean;
}

interface WebhookPreference {
  enabled: boolean;
  retryPolicy: 'none' | 'exponential' | 'linear';
  timeout: number;
}

interface EventPreference {
  realTime: boolean;
  batching: boolean;
  compression: boolean;
}

interface LoggingPreference {
  level: 'debug' | 'info' | 'warn' | 'error';
  retention: number;
  encryption: boolean;
}

interface MonitoringPreference {
  metrics: boolean;
  alerts: boolean;
  dashboards: boolean;
}

interface AnalyticsPreference {
  usage: boolean;
  performance: boolean;
  errors: boolean;
}

interface FeedbackPreference {
  enabled: boolean;
  anonymous: boolean;
  categories: string[];
}

interface SupportPreference {
  chat: boolean;
  email: boolean;
  phone: boolean;
  documentation: boolean;
}

interface DocumentationPreference {
  inline: boolean;
  external: boolean;
  searchable: boolean;
}

interface TutorialPreference {
  enabled: boolean;
  interactive: boolean;
  progress: boolean;
}

interface OnboardingPreference {
  guided: boolean;
  skip: boolean;
  progress: boolean;
}

interface ExperimentPreference {
  enabled: boolean;
  consent: boolean;
  categories: string[];
}

interface FeaturePreference {
  name: string;
  enabled: boolean;
  beta: boolean;
}

interface DeviceTrust {
  deviceId: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  trusted: boolean;
  lastSeen: Date;
}

interface DataStream {
  id: string;
  name: string;
  type: 'classification' | 'training' | 'monitoring' | 'analytics';
  status: 'active' | 'paused' | 'stopped';
  throughput: number;
  latency: number;
}

interface LiveMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  network: number;
  activeUsers: number;
  requestsPerSecond: number;
}

interface RealTimeEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

interface UserEngagementMetrics {
  activeUsers: number;
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  retention: number;
}

interface SystemUsageMetrics {
  apiCalls: number;
  dataProcessed: number;
  storageUsed: number;
  bandwidthUsed: number;
  computeHours: number;
}

interface PerformanceAnalytics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  scalability: number;
}

interface BusinessMetrics {
  revenue: number;
  cost: number;
  roi: number;
  customerSatisfaction: number;
  marketShare: number;
}

interface PredictiveAnalytics {
  trends: Trend[];
  forecasts: Forecast[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
}

interface AlertAction {
  id: string;
  label: string;
  action: () => void;
  type: 'primary' | 'secondary' | 'destructive';
}

interface ComplianceFramework {
  name: string;
  version: string;
  compliance: number;
  requirements: Requirement[];
}

interface ComplianceViolation {
  id: string;
  framework: string;
  requirement: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'mitigated';
  dueDate: Date;
}

interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
}

interface DatabaseStatus {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'slow';
  connections: number;
  queries: number;
  size: number;
}

interface NetworkStatus {
  id: string;
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency: number;
  bandwidth: number;
  packetLoss: number;
}

interface StorageStatus {
  id: string;
  name: string;
  status: 'available' | 'full' | 'error';
  used: number;
  total: number;
  iops: number;
}

interface LoadBalancerStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  connections: number;
  healthChecks: number;
  distribution: string;
}

interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
}

interface HealthTrend {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  services: string[];
  description: string;
}

interface Requirement {
  id: string;
  description: string;
  status: 'met' | 'partial' | 'not-met';
  evidence: string[];
  lastVerified: Date;
}

interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  confidence: number;
  period: string;
}

interface Forecast {
  metric: string;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolved: boolean;
}

interface Recommendation {
  id: string;
  type: 'performance' | 'security' | 'cost' | 'user-experience';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'complaint';
  rating: number;
  comment: string;
  timestamp: Date;
  resolved: boolean;
}

interface ExecutionMetrics {
  throughput: number;
  accuracy: number;
  latency: number;
  resourceUsage: ResourceUsage;
  qualityScore: number;
  costEfficiency: number;
}

interface ExecutionError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  timestamp: Date;
  context: Record<string, any>;
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  gpu?: number;
}

// Initial State
const initialState: ClassificationState = {
  // Core State
  isLoading: false,
  error: null,
  currentView: {
    id: 'dashboard',
    name: 'Dashboard',
    type: 'dashboard',
    layout: { type: 'grid', columns: 3, rows: 2, spacing: 16, responsive: true, breakpoints: {} },
    components: [],
    filters: [],
    sorting: { field: 'timestamp', direction: 'desc', multiSort: false, sortOrder: [] },
    grouping: { enabled: false, fields: [], collapsed: false, showCounts: true },
    pagination: { enabled: true, pageSize: 20, currentPage: 1, totalPages: 1, showSizeChanger: true, showQuickJumper: true },
    customization: { theme: 'default', colors: {}, fonts: {}, spacing: {}, animations: {} },
    permissions: { canView: true, canEdit: true, canDelete: false, canShare: true, canExport: true, canImport: false },
    sharing: { public: false, sharedWith: [], linkSharing: false },
    bookmarks: [],
    history: [],
    preferences: { autoSave: true, autoRefresh: false, refreshInterval: 30000, notifications: true, sound: false },
    metadata: { version: '1.0.0', createdBy: 'system', createdAt: new Date(), updatedBy: 'system', updatedAt: new Date(), tags: [], description: 'Main dashboard view' }
  },
  currentVersion: 'all',
  currentComponent: null,
  sidebarOpen: true,
  
  // Advanced Enterprise State
  workflowMode: 'guided',
  intelligenceLevel: 'assisted',
  collaborationMode: false,
  realTimeSync: true,
  performanceMode: 'balanced',
  systemHealth: 'optimal',
  
  // Workflow Management
  activeWorkflows: [],
  workflowHistory: [],
  
  // UI State
  globalSearch: '',
  commandPalette: false,
  notifications: [],
  contextualHelp: false,
  advancedFilters: {
    quickFilters: {},
    dateRange: null,
    statusFilters: [],
    typeFilters: [],
    ownerFilters: [],
    customFilters: []
  },
  customViews: [],
  activeView: 'default',
  splitViewMode: false,
  focusMode: false,
  darkMode: false,
  
  // System State
  systemMetrics: {
    overall: 'healthy',
    services: [],
    infrastructure: { servers: [], databases: [], networks: [], storage: [], loadBalancers: [] },
    performance: { cpu: 0, memory: 0, disk: 0, network: 0, responseTime: 0, throughput: 0, errorRate: 0 },
    security: { threatLevel: 'low', activeThreats: 0, vulnerabilities: 0, lastScan: new Date(), complianceScore: 100 },
    compliance: { frameworks: [], violations: [], lastAudit: new Date(), nextAudit: new Date(), overallScore: 100 },
    monitoring: { activeMonitors: 0, alerts: 0, incidents: 0, lastUpdate: new Date(), coverage: 100 },
    alerts: [],
    incidents: [],
    maintenance: { scheduled: [], inProgress: false, nextWindow: new Date(), estimatedDuration: 0 },
    updates: { available: false, version: '', releaseNotes: '', critical: false, autoUpdate: false },
    health: { overall: 'healthy', services: [], lastCheck: new Date(), trends: [] },
    availability: { uptime: 100, downtime: 0, incidents: 0, mttr: 0, mtbf: 0 },
    reliability: { errorRate: 0, successRate: 100, consistency: 100, predictability: 100 },
    scalability: { currentLoad: 0, maxCapacity: 100, scalingTrend: 'stable', bottlenecks: [] },
    efficiency: { resourceUtilization: 0, costEfficiency: 100, performancePerDollar: 100, optimizationOpportunities: [] },
    quality: { defectRate: 0, customerSatisfaction: 100, codeQuality: 100, testCoverage: 100 },
    satisfaction: { userSatisfaction: 100, nps: 100, feedback: [], improvements: [] }
  },
  performanceData: [],
  recentActivities: [],
  userPreferences: {
    theme: { mode: 'auto', primary: '#3b82f6', secondary: '#64748b', accent: '#f59e0b', custom: {} },
    layout: { sidebar: 'auto', density: 'comfortable', grid: true, animations: true },
    navigation: { style: 'sidebar', showLabels: true, groupBy: 'category' },
    dashboard: { layout: 'grid', widgets: [], refreshInterval: 30000, autoSave: true },
    notifications: { email: true, push: true, inApp: true, sound: false, frequency: 'immediate' },
    accessibility: { highContrast: false, largeText: false, screenReader: false, keyboardNavigation: true, reducedMotion: false },
    localization: { language: 'en', region: 'US', timezone: 'UTC', dateFormat: 'MM/DD/YYYY', numberFormat: 'en-US' },
    privacy: { dataCollection: true, analytics: true, personalization: true, sharing: false },
    security: { mfa: false, sessionTimeout: 30, ipWhitelist: [], deviceTrust: false },
    performance: { cache: true, compression: true, lazyLoading: true, prefetch: true },
    automation: { autoSave: true, autoRefresh: false, smartSuggestions: true, workflowAutomation: true },
    collaboration: { realTime: true, notifications: true, sharing: true, comments: true },
    integration: { apis: true, webhooks: true, sso: false, thirdParty: true },
    customization: { themes: true, layouts: true, widgets: true, shortcuts: true },
    shortcuts: [],
    bookmarks: { autoSave: true, sync: true, categories: [] },
    history: { retention: 30, autoCleanup: true, searchable: true },
    search: { engine: 'hybrid', suggestions: true, history: true, filters: true },
    filters: [],
    views: [],
    exports: { format: 'json', compression: true, includeMetadata: true },
    imports: { validation: true, autoMapping: true, conflictResolution: 'merge' },
    backup: { frequency: 'daily', retention: 30, encryption: true },
    sync: { realTime: true, conflictResolution: 'server', compression: true },
    offline: { enabled: false, cacheSize: 100, syncOnReconnect: true },
    mobile: { responsive: true, touchOptimized: true, gestures: true },
    desktop: { native: false, shortcuts: true, notifications: true },
    web: { pwa: true, offline: true, pushNotifications: true },
    api: { rateLimit: 1000, authentication: 'token', versioning: true },
    webhooks: { enabled: true, retryPolicy: 'exponential', timeout: 30 },
    events: { realTime: true, batching: true, compression: true },
    logging: { level: 'info', retention: 30, encryption: false },
    monitoring: { metrics: true, alerts: true, dashboards: true },
    analytics: { usage: true, performance: true, errors: true },
    feedback: { enabled: true, anonymous: true, categories: [] },
    support: { chat: true, email: true, phone: false, documentation: true },
    documentation: { inline: true, external: true, searchable: true },
    tutorials: { enabled: true, interactive: true, progress: true },
    onboarding: { guided: true, skip: false, progress: true },
    experiments: { enabled: false, consent: true, categories: [] },
    features: []
  },
  
  // Security & Access
  userRole: 'user',
  userPermissions: [],
  securityContext: {
    userRole: 'user',
    permissions: [],
    sessionId: '',
    lastActivity: new Date(),
    securityLevel: 'basic',
    mfaEnabled: false,
    ipWhitelist: [],
    deviceTrust: []
  },
  
  // Real-time State
  realTimeData: {
    activeConnections: 0,
    dataStreams: [],
    liveMetrics: { timestamp: new Date(), cpu: 0, memory: 0, network: 0, activeUsers: 0, requestsPerSecond: 0 },
    realTimeEvents: []
  },
  connectionStatus: {
    websocket: 'disconnected',
    api: 'healthy',
    database: 'connected',
    lastSync: new Date(),
    latency: 0
  },
  
  // Analytics & Monitoring
  analyticsData: {
    userEngagement: { activeUsers: 0, sessionDuration: 0, pageViews: 0, bounceRate: 0, retention: 0 },
    systemUsage: { apiCalls: 0, dataProcessed: 0, storageUsed: 0, bandwidthUsed: 0, computeHours: 0 },
    performanceAnalytics: { responseTime: 0, throughput: 0, errorRate: 0, availability: 100, scalability: 100 },
    businessMetrics: { revenue: 0, cost: 0, roi: 0, customerSatisfaction: 100, marketShare: 0 },
    predictiveAnalytics: { trends: [], forecasts: [], anomalies: [], recommendations: [] }
  },
  monitoringAlerts: []
};

// Reducer
const classificationReducer = (state: ClassificationState, action: ClassificationAction): ClassificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'SET_CURRENT_VERSION':
      return { ...state, currentVersion: action.payload };
    
    case 'SET_CURRENT_COMPONENT':
      return { ...state, currentComponent: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    
    case 'SET_WORKFLOW_MODE':
      return { ...state, workflowMode: action.payload };
    
    case 'SET_INTELLIGENCE_LEVEL':
      return { ...state, intelligenceLevel: action.payload };
    
    case 'TOGGLE_COLLABORATION_MODE':
      return { ...state, collaborationMode: !state.collaborationMode };
    
    case 'TOGGLE_REAL_TIME_SYNC':
      return { ...state, realTimeSync: !state.realTimeSync };
    
    case 'SET_PERFORMANCE_MODE':
      return { ...state, performanceMode: action.payload };
    
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
    
    case 'ADD_WORKFLOW':
      return { ...state, activeWorkflows: [...state.activeWorkflows, action.payload] };
    
    case 'UPDATE_WORKFLOW':
      return {
        ...state,
        activeWorkflows: state.activeWorkflows.map(workflow =>
          workflow.id === action.payload.id
            ? { ...workflow, ...action.payload.updates }
            : workflow
        )
      };
    
case 'REMOVE_WORKFLOW':
            return {
              ...state,
              activeWorkflows: state.activeWorkflows.filter(workflow => workflow.id !== action.payload)
            };
          
          case 'SET_GLOBAL_SEARCH':
            return { ...state, globalSearch: action.payload };
          
          case 'TOGGLE_COMMAND_PALETTE':
            return { ...state, commandPalette: !state.commandPalette };
          
          case 'ADD_NOTIFICATION':
            return { ...state, notifications: [...state.notifications, action.payload] };
          
          case 'UPDATE_NOTIFICATION':
            return {
              ...state,
              notifications: state.notifications.map(notification =>
                notification.id === action.payload.id
                  ? { ...notification, ...action.payload.updates }
                  : notification
              )
            };
          
          case 'REMOVE_NOTIFICATION':
            return {
              ...state,
              notifications: state.notifications.filter(notification => notification.id !== action.payload)
            };
          
          case 'TOGGLE_CONTEXTUAL_HELP':
            return { ...state, contextualHelp: !state.contextualHelp };
          
          case 'UPDATE_FILTERS':
            return { ...state, advancedFilters: { ...state.advancedFilters, ...action.payload } };
          
          case 'ADD_CUSTOM_VIEW':
            return { ...state, customViews: [...state.customViews, action.payload] };
          
          case 'UPDATE_CUSTOM_VIEW':
            return {
              ...state,
              customViews: state.customViews.map(view =>
                view.id === action.payload.id
                  ? { ...view, ...action.payload.updates }
                  : view
              )
            };
          
          case 'REMOVE_CUSTOM_VIEW':
            return {
              ...state,
              customViews: state.customViews.filter(view => view.id !== action.payload)
            };
          
          case 'SET_ACTIVE_VIEW':
            return { ...state, activeView: action.payload };
          
          case 'TOGGLE_SPLIT_VIEW':
            return { ...state, splitViewMode: !state.splitViewMode };
          
          case 'TOGGLE_FOCUS_MODE':
            return { ...state, focusMode: !state.focusMode };
          
          case 'TOGGLE_DARK_MODE':
            return { ...state, darkMode: !state.darkMode };
          
          case 'UPDATE_SYSTEM_METRICS':
            return { ...state, systemMetrics: action.payload };
          
          case 'UPDATE_PERFORMANCE_DATA':
            return { ...state, performanceData: action.payload };
          
          case 'ADD_ACTIVITY':
            return { ...state, recentActivities: [action.payload, ...state.recentActivities.slice(0, 99)] };
          
          case 'UPDATE_USER_PREFERENCES':
            return { ...state, userPreferences: { ...state.userPreferences, ...action.payload } };
          
          case 'SET_USER_ROLE':
            return { ...state, userRole: action.payload };
          
          case 'SET_USER_PERMISSIONS':
            return { ...state, userPermissions: action.payload };
          
          case 'UPDATE_SECURITY_CONTEXT':
            return { ...state, securityContext: { ...state.securityContext, ...action.payload } };
          
          case 'UPDATE_REAL_TIME_DATA':
            return { ...state, realTimeData: action.payload };
          
          case 'UPDATE_CONNECTION_STATUS':
            return { ...state, connectionStatus: action.payload };
          
          case 'UPDATE_ANALYTICS_DATA':
            return { ...state, analyticsData: action.payload };
          
          case 'ADD_MONITORING_ALERT':
            return { ...state, monitoringAlerts: [...state.monitoringAlerts, action.payload] };
          
          case 'RESOLVE_MONITORING_ALERT':
            return {
              ...state,
              monitoringAlerts: state.monitoringAlerts.map(alert =>
                alert.id === action.payload
                  ? { ...alert, resolved: true }
                  : alert
              )
            };
          
          case 'RESET_STATE':
            return initialState;
          
          case 'HYDRATE_STATE':
            return { ...state, ...action.payload };
          
          default:
            return state;
        }
      };
      
      // Context
      const ClassificationStateContext = createContext<{
        state: ClassificationState;
        dispatch: React.Dispatch<ClassificationAction>;
        actions: ClassificationStateActions;
      } | null>(null);
      
      // Actions Interface
      export interface ClassificationStateActions {
        // Core Actions
        setLoading: (loading: boolean) => void;
        setError: (error: string | null) => void;
        setCurrentView: (view: ClassificationView) => void;
        setCurrentVersion: (version: ClassificationVersion) => void;
        setCurrentComponent: (component: string | null) => void;
        toggleSidebar: () => void;
        
        // Workflow Actions
        setWorkflowMode: (mode: 'guided' | 'advanced' | 'expert') => void;
        setIntelligenceLevel: (level: 'manual' | 'assisted' | 'autonomous') => void;
        toggleCollaborationMode: () => void;
        toggleRealTimeSync: () => void;
        setPerformanceMode: (mode: 'balanced' | 'speed' | 'accuracy') => void;
        setSystemHealth: (health: 'optimal' | 'good' | 'warning' | 'critical') => void;
        
        // Workflow Management
        addWorkflow: (workflow: WorkflowInstance) => void;
        updateWorkflow: (id: string, updates: Partial<WorkflowInstance>) => void;
        removeWorkflow: (id: string) => void;
        
        // UI Actions
        setGlobalSearch: (search: string) => void;
        toggleCommandPalette: () => void;
        addNotification: (notification: NotificationItem) => void;
        updateNotification: (id: string, updates: Partial<NotificationItem>) => void;
        removeNotification: (id: string) => void;
        toggleContextualHelp: () => void;
        updateFilters: (filters: Partial<FilterState>) => void;
        
        // View Management
        addCustomView: (view: CustomViewState) => void;
        updateCustomView: (id: string, updates: Partial<CustomViewState>) => void;
        removeCustomView: (id: string) => void;
        setActiveView: (viewId: string) => void;
        toggleSplitView: () => void;
        toggleFocusMode: () => void;
        toggleDarkMode: () => void;
        
        // System Actions
        updateSystemMetrics: (metrics: SystemMetrics) => void;
        updatePerformanceData: (data: PerformanceData[]) => void;
        addActivity: (activity: Activity) => void;
        updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
        
        // Security Actions
        setUserRole: (role: string) => void;
        setUserPermissions: (permissions: string[]) => void;
        updateSecurityContext: (context: Partial<SecurityContext>) => void;
        
        // Real-time Actions
        updateRealTimeData: (data: RealTimeData) => void;
        updateConnectionStatus: (status: ConnectionStatus) => void;
        
        // Analytics Actions
        updateAnalyticsData: (data: AnalyticsData) => void;
        addMonitoringAlert: (alert: MonitoringAlert) => void;
        resolveMonitoringAlert: (alertId: string) => void;
        
        // Utility Actions
        resetState: () => void;
        hydrateState: (state: Partial<ClassificationState>) => void;
      }
      
      // Provider Component
      export const ClassificationStateProvider: React.FC<{
        children: React.ReactNode;
        initialState?: Partial<ClassificationState>;
      }> = ({ children, initialState: customInitialState }) => {
        const [state, dispatch] = useReducer(
          classificationReducer,
          { ...initialState, ...customInitialState }
        );
      
        // Memoized actions to prevent unnecessary re-renders
        const actions = useMemo<ClassificationStateActions>(() => ({
          // Core Actions
          setLoading: useCallback((loading: boolean) => {
            dispatch({ type: 'SET_LOADING', payload: loading });
          }, []),
          
          setError: useCallback((error: string | null) => {
            dispatch({ type: 'SET_ERROR', payload: error });
          }, []),
          
          setCurrentView: useCallback((view: ClassificationView) => {
            dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
          }, []),
          
          setCurrentVersion: useCallback((version: ClassificationVersion) => {
            dispatch({ type: 'SET_CURRENT_VERSION', payload: version });
          }, []),
          
          setCurrentComponent: useCallback((component: string | null) => {
            dispatch({ type: 'SET_CURRENT_COMPONENT', payload: component });
          }, []),
          
          toggleSidebar: useCallback(() => {
            dispatch({ type: 'TOGGLE_SIDEBAR' });
          }, []),
          
          // Workflow Actions
          setWorkflowMode: useCallback((mode: 'guided' | 'advanced' | 'expert') => {
            dispatch({ type: 'SET_WORKFLOW_MODE', payload: mode });
          }, []),
          
          setIntelligenceLevel: useCallback((level: 'manual' | 'assisted' | 'autonomous') => {
            dispatch({ type: 'SET_INTELLIGENCE_LEVEL', payload: level });
          }, []),
          
          toggleCollaborationMode: useCallback(() => {
            dispatch({ type: 'TOGGLE_COLLABORATION_MODE' });
          }, []),
          
          toggleRealTimeSync: useCallback(() => {
            dispatch({ type: 'TOGGLE_REAL_TIME_SYNC' });
          }, []),
          
          setPerformanceMode: useCallback((mode: 'balanced' | 'speed' | 'accuracy') => {
            dispatch({ type: 'SET_PERFORMANCE_MODE', payload: mode });
          }, []),
          
          setSystemHealth: useCallback((health: 'optimal' | 'good' | 'warning' | 'critical') => {
            dispatch({ type: 'SET_SYSTEM_HEALTH', payload: health });
          }, []),
          
          // Workflow Management
          addWorkflow: useCallback((workflow: WorkflowInstance) => {
            dispatch({ type: 'ADD_WORKFLOW', payload: workflow });
          }, []),
          
          updateWorkflow: useCallback((id: string, updates: Partial<WorkflowInstance>) => {
            dispatch({ type: 'UPDATE_WORKFLOW', payload: { id, updates } });
          }, []),
          
          removeWorkflow: useCallback((id: string) => {
            dispatch({ type: 'REMOVE_WORKFLOW', payload: id });
          }, []),
          
          // UI Actions
          setGlobalSearch: useCallback((search: string) => {
            dispatch({ type: 'SET_GLOBAL_SEARCH', payload: search });
          }, []),
          
          toggleCommandPalette: useCallback(() => {
            dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
          }, []),
          
          addNotification: useCallback((notification: NotificationItem) => {
            dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
          }, []),
          
          updateNotification: useCallback((id: string, updates: Partial<NotificationItem>) => {
            dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates } });
          }, []),
          
          removeNotification: useCallback((id: string) => {
            dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
          }, []),
          
          toggleContextualHelp: useCallback(() => {
            dispatch({ type: 'TOGGLE_CONTEXTUAL_HELP' });
          }, []),
          
          updateFilters: useCallback((filters: Partial<FilterState>) => {
            dispatch({ type: 'UPDATE_FILTERS', payload: filters });
          }, []),
          
          // View Management
          addCustomView: useCallback((view: CustomViewState) => {
            dispatch({ type: 'ADD_CUSTOM_VIEW', payload: view });
          }, []),
          
          updateCustomView: useCallback((id: string, updates: Partial<CustomViewState>) => {
            dispatch({ type: 'UPDATE_CUSTOM_VIEW', payload: { id, updates } });
          }, []),
          
          removeCustomView: useCallback((id: string) => {
            dispatch({ type: 'REMOVE_CUSTOM_VIEW', payload: id });
          }, []),
          
          setActiveView: useCallback((viewId: string) => {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: viewId });
          }, []),
          
          toggleSplitView: useCallback(() => {
            dispatch({ type: 'TOGGLE_SPLIT_VIEW' });
          }, []),
          
          toggleFocusMode: useCallback(() => {
            dispatch({ type: 'TOGGLE_FOCUS_MODE' });
          }, []),
          
          toggleDarkMode: useCallback(() => {
            dispatch({ type: 'TOGGLE_DARK_MODE' });
          }, []),
          
          // System Actions
          updateSystemMetrics: useCallback((metrics: SystemMetrics) => {
            dispatch({ type: 'UPDATE_SYSTEM_METRICS', payload: metrics });
          }, []),
          
          updatePerformanceData: useCallback((data: PerformanceData[]) => {
            dispatch({ type: 'UPDATE_PERFORMANCE_DATA', payload: data });
          }, []),
          
          addActivity: useCallback((activity: Activity) => {
            dispatch({ type: 'ADD_ACTIVITY', payload: activity });
          }, []),
          
          updateUserPreferences: useCallback((preferences: Partial<UserPreferences>) => {
            dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences });
          }, []),
          
          // Security Actions
          setUserRole: useCallback((role: string) => {
            dispatch({ type: 'SET_USER_ROLE', payload: role });
          }, []),
          
          setUserPermissions: useCallback((permissions: string[]) => {
            dispatch({ type: 'SET_USER_PERMISSIONS', payload: permissions });
          }, []),
          
          updateSecurityContext: useCallback((context: Partial<SecurityContext>) => {
            dispatch({ type: 'UPDATE_SECURITY_CONTEXT', payload: context });
          }, []),
          
          // Real-time Actions
          updateRealTimeData: useCallback((data: RealTimeData) => {
            dispatch({ type: 'UPDATE_REAL_TIME_DATA', payload: data });
          }, []),
          
          updateConnectionStatus: useCallback((status: ConnectionStatus) => {
            dispatch({ type: 'UPDATE_CONNECTION_STATUS', payload: status });
          }, []),
          
          // Analytics Actions
          updateAnalyticsData: useCallback((data: AnalyticsData) => {
            dispatch({ type: 'UPDATE_ANALYTICS_DATA', payload: data });
          }, []),
          
          addMonitoringAlert: useCallback((alert: MonitoringAlert) => {
            dispatch({ type: 'ADD_MONITORING_ALERT', payload: alert });
          }, []),
          
          resolveMonitoringAlert: useCallback((alertId: string) => {
            dispatch({ type: 'RESOLVE_MONITORING_ALERT', payload: alertId });
          }, []),
          
          // Utility Actions
          resetState: useCallback(() => {
            dispatch({ type: 'RESET_STATE' });
          }, []),
          
          hydrateState: useCallback((state: Partial<ClassificationState>) => {
            dispatch({ type: 'HYDRATE_STATE', payload: state });
          }, [])
        }), []);
      
        // Auto-save functionality
        useEffect(() => {
          if (state.userPreferences.automation.autoSave) {
            const autoSaveInterval = setInterval(() => {
              try {
                localStorage.setItem('classification-state', JSON.stringify({
                  userPreferences: state.userPreferences,
                  customViews: state.customViews,
                  advancedFilters: state.advancedFilters,
                  activeView: state.activeView,
                  darkMode: state.darkMode,
                  sidebarOpen: state.sidebarOpen
                }));
              } catch (error) {
                console.warn('Failed to auto-save state:', error);
              }
            }, 30000); // Auto-save every 30 seconds
      
            return () => clearInterval(autoSaveInterval);
          }
        }, [state.userPreferences.automation.autoSave, state.userPreferences, state.customViews, state.advancedFilters, state.activeView, state.darkMode, state.sidebarOpen]);
      
        // Load saved state on mount
        useEffect(() => {
          try {
            const savedState = localStorage.getItem('classification-state');
            if (savedState) {
              const parsedState = JSON.parse(savedState);
              actions.hydrateState(parsedState);
            }
          } catch (error) {
            console.warn('Failed to load saved state:', error);
          }
        }, [actions]);
      
        // Real-time sync functionality
        useEffect(() => {
          if (state.realTimeSync && state.connectionStatus.websocket === 'connected') {
            // Implement real-time sync logic here
            const syncInterval = setInterval(() => {
              // Sync state with server
              console.log('Syncing state with server...');
            }, 5000);
      
            return () => clearInterval(syncInterval);
          }
        }, [state.realTimeSync, state.connectionStatus.websocket]);
      
        // Performance monitoring
        useEffect(() => {
          if (state.userPreferences.monitoring.metrics) {
            const performanceObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const performanceMetrics = entries.map(entry => ({
                timestamp: new Date(),
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime
              }));
              
              // Update performance data
              actions.updatePerformanceData([
                ...state.performanceData.slice(-99), // Keep last 100 entries
                ...performanceMetrics.map(metric => ({
                  timestamp: metric.timestamp,
                  cpu: 0, // Would be populated by actual metrics
                  memory: 0,
                  network: 0,
                  storage: 0,
                  responseTime: metric.duration,
                  throughput: 0,
                  errorRate: 0
                }))
              ]);
            });
      
            performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      
            return () => performanceObserver.disconnect();
          }
        }, [state.userPreferences.monitoring.metrics, actions, state.performanceData]);
      
        const contextValue = useMemo(() => ({
          state,
          dispatch,
          actions
        }), [state, dispatch, actions]);
      
        return (
          <ClassificationStateContext.Provider value={contextValue}>
            {children}
          </ClassificationStateContext.Provider>
        );
      };
      
      // Custom Hook
      export const useClassificationState = () => {
        const context = useContext(ClassificationStateContext);
        if (!context) {
          throw new Error('useClassificationState must be used within a ClassificationStateProvider');
        }
        return context;
      };
      
      // Selector Hooks for Performance Optimization
      export const useClassificationSelector = <T>(
        selector: (state: ClassificationState) => T
      ): T => {
        const { state } = useClassificationState();
        return useMemo(() => selector(state), [state, selector]);
      };
      
      // Specific Selector Hooks
      export const useCurrentView = () => useClassificationSelector(state => state.currentView);
      export const useCurrentVersion = () => useClassificationSelector(state => state.currentVersion);
      export const useCurrentComponent = () => useClassificationSelector(state => state.currentComponent);
      export const useSidebarOpen = () => useClassificationSelector(state => state.sidebarOpen);
      export const useWorkflowMode = () => useClassificationSelector(state => state.workflowMode);
      export const useIntelligenceLevel = () => useClassificationSelector(state => state.intelligenceLevel);
      export const useSystemHealth = () => useClassificationSelector(state => state.systemHealth);
      export const useActiveWorkflows = () => useClassificationSelector(state => state.activeWorkflows);
      export const useNotifications = () => useClassificationSelector(state => state.notifications);
      export const useGlobalSearch = () => useClassificationSelector(state => state.globalSearch);
      export const useCommandPalette = () => useClassificationSelector(state => state.commandPalette);
      export const useUserRole = () => useClassificationSelector(state => state.userRole);
      export const useUserPermissions = () => useClassificationSelector(state => state.userPermissions);
      export const useSystemMetrics = () => useClassificationSelector(state => state.systemMetrics);
      export const usePerformanceData = () => useClassificationSelector(state => state.performanceData);
      export const useRecentActivities = () => useClassificationSelector(state => state.recentActivities);
      export const useUserPreferences = () => useClassificationSelector(state => state.userPreferences);
      export const useConnectionStatus = () => useClassificationSelector(state => state.connectionStatus);
      export const useRealTimeData = () => useClassificationSelector(state => state.realTimeData);
      export const useAnalyticsData = () => useClassificationSelector(state => state.analyticsData);
      export const useMonitoringAlerts = () => useClassificationSelector(state => state.monitoringAlerts);
      
      // Advanced State Utilities
      export const useClassificationStateUtils = () => {
        const { state, actions } = useClassificationState();
      
        const utils = useMemo(() => ({
          // Workflow utilities
          getWorkflowById: (id: string) => state.activeWorkflows.find(w => w.id === id),
          getWorkflowsByType: (type: WorkflowInstance['type']) => 
            state.activeWorkflows.filter(w => w.type === type),
          getWorkflowsByStatus: (status: WorkflowInstance['status']) => 
            state.activeWorkflows.filter(w => w.status === status),
          
          // Notification utilities
          getUnreadNotifications: () => state.notifications.filter(n => !n.read),
          getNotificationsByType: (type: NotificationItem['type']) => 
            state.notifications.filter(n => n.type === type),
          
          // Filter utilities
          hasActiveFilters: () => {
            const { advancedFilters } = state;
            return (
              Object.keys(advancedFilters.quickFilters).length > 0 ||
              advancedFilters.dateRange !== null ||
              advancedFilters.statusFilters.length > 0 ||
              advancedFilters.typeFilters.length > 0 ||
              advancedFilters.ownerFilters.length > 0 ||
              advancedFilters.customFilters.length > 0
            );
          },
          
          // View utilities
          getCustomViewById: (id: string) => state.customViews.find(v => v.id === id),
          getDefaultView: () => state.customViews.find(v => v.isDefault),
          
          // System utilities
          isSystemHealthy: () => state.systemHealth === 'optimal' || state.systemHealth === 'good',
          getSystemHealthColor: () => {
            switch (state.systemHealth) {
              case 'optimal': return 'green';
              case 'good': return 'blue';
              case 'warning': return 'yellow';
              case 'critical': return 'red';
              default: return 'gray';
            }
          },
          
          // Performance utilities
          getAverageResponseTime: () => {
            if (state.performanceData.length === 0) return 0;
            const total = state.performanceData.reduce((sum, data) => sum + data.responseTime, 0);
            return total / state.performanceData.length;
          },
          
          // Activity utilities
          getRecentActivitiesByType: (type: ActivityType) => 
            state.recentActivities.filter(a => a.type === type),
          getActivitiesByUser: (userId: string) => 
            state.recentActivities.filter(a => a.user.id === userId),
          
          // Permission utilities
          hasPermission: (permission: string) => state.userPermissions.includes(permission),
          hasAnyPermission: (permissions: string[]) => 
            permissions.some(p => state.userPermissions.includes(p)),
          hasAllPermissions: (permissions: string[]) => 
            permissions.every(p => state.userPermissions.includes(p)),
          
          // Connection utilities
          isConnected: () => state.connectionStatus.websocket === 'connected',
          isApiHealthy: () => state.connectionStatus.api === 'healthy',
          isDatabaseConnected: () => state.connectionStatus.database === 'connected',
          
          // Analytics utilities
          getEngagementScore: () => {
            const { userEngagement } = state.analyticsData;
            return (userEngagement.activeUsers * 0.3 + 
                    userEngagement.sessionDuration * 0.3 + 
                    userEngagement.retention * 0.4);
          },
          
          // Alert utilities
          getCriticalAlerts: () => state.monitoringAlerts.filter(a => a.severity === 'critical'),
          getUnresolvedAlerts: () => state.monitoringAlerts.filter(a => !a.resolved),
          
          // Bulk operations
          clearAllNotifications: () => {
            state.notifications.forEach(notification => {
              actions.removeNotification(notification.id);
            });
          },
          
          markAllNotificationsAsRead: () => {
            state.notifications.forEach(notification => {
              if (!notification.read) {
                actions.updateNotification(notification.id, { read: true });
              }
            });
          },
          
          // State persistence
          exportState: () => {
            const exportData = {
              userPreferences: state.userPreferences,
              customViews: state.customViews,
              advancedFilters: state.advancedFilters,
              activeView: state.activeView,
              darkMode: state.darkMode,
              sidebarOpen: state.sidebarOpen,
              exportedAt: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `classification-state-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          },
          
          importState: (importData: any) => {
            try {
              actions.hydrateState(importData);
              actions.addNotification({
                id: `import-${Date.now()}`,
                type: 'success',
                title: 'State Imported',
                message: 'Classification state has been successfully imported.',
                timestamp: new Date().toISOString(),
                read: false,
                actionable: false
              });
            } catch (error) {
              actions.addNotification({
                id: `import-error-${Date.now()}`,
                type: 'error',
                title: 'Import Failed',
                message: 'Failed to import classification state. Please check the file format.',
                timestamp: new Date().toISOString(),
                read: false,
          