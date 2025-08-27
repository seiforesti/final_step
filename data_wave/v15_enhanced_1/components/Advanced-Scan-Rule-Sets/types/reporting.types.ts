// Advanced Scan Rule Sets - Reporting Types
// Comprehensive type definitions for analytics, reporting, and visualization

// ============================================================================
// API ERROR TYPE
// ============================================================================

export interface APIError {
  message: string;
  code: string;
  status: number;
  details?: any;
  timestamp?: string;
  requestId?: string;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  category: DashboardCategory;
  owner: DashboardOwner;
  permissions: DashboardPermissions;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshSettings: RefreshSettings;
  customization: DashboardCustomization;
  sharing: SharingConfiguration;
  metadata: DashboardMetadata;
  performance: DashboardPerformance;
  analytics: DashboardAnalytics;
  integrations: DashboardIntegration[];
  alerts: DashboardAlert[];
  exports: ExportConfiguration[];
  themes: ThemeConfiguration[];
  responsiveness: ResponsiveConfiguration;
  accessibility: AccessibilitySettings;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
}

export interface DashboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentCategory?: string;
  subcategories: string[];
  tags: string[];
  priority: number;
  displayOrder: number;
  permissions: CategoryPermissions;
  metadata: CategoryMetadata;
}

export interface DashboardOwner {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  department: string;
  role: string;
  permissions: OwnerPermissions;
  contactInfo: ContactInformation;
  preferences: OwnerPreferences;
  delegations: OwnerDelegation[];
}

export interface DashboardPermissions {
  public: boolean;
  viewers: PermissionEntry[];
  editors: PermissionEntry[];
  administrators: PermissionEntry[];
  groups: GroupPermission[];
  roles: RolePermission[];
  conditions: ConditionalPermission[];
  inheritance: PermissionInheritance;
  audit: PermissionAudit;
}

export interface DashboardLayout {
  type: LayoutType;
  columns: number;
  rows: number;
  gridSize: GridConfiguration;
  spacing: SpacingConfiguration;
  margins: MarginConfiguration;
  breakpoints: BreakpointConfiguration[];
  responsive: ResponsiveLayoutSettings;
  positioning: PositioningSettings;
  zIndex: ZIndexConfiguration;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  dataSource: WidgetDataSource;
  visualization: VisualizationConfig;
  interactions: WidgetInteraction[];
  filters: WidgetFilter[];
  customization: WidgetCustomization;
  performance: WidgetPerformance;
  caching: CachingConfiguration;
  realTime: RealTimeConfiguration;
  alerts: WidgetAlert[];
  exports: WidgetExportOptions[];
  dependencies: WidgetDependency[];
  metadata: WidgetMetadata;
  version: number;
  isVisible: boolean;
  isInteractive: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  type: ReportType;
  format: ReportFormat[];
  sections: ReportSection[];
  parameters: ReportParameter[];
  dataSource: ReportDataSource;
  scheduling: ReportScheduling;
  distribution: ReportDistribution;
  customization: ReportCustomization;
  branding: ReportBranding;
  security: ReportSecurity;
  compliance: ComplianceSettings;
  performance: ReportPerformance;
  versioning: ReportVersioning;
  approval: ApprovalWorkflow;
  audit: ReportAudit;
  metadata: ReportMetadata;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportInstance {
  id: string;
  templateId: string;
  name: string;
  description: string;
  status: ReportStatus;
  progress: ReportProgress;
  parameters: ReportParameterValue[];
  generatedBy: ReportGenerator;
  generatedAt: Date;
  completedAt?: Date;
  output: ReportOutput[];
  distribution: DistributionResult[];
  performance: ReportExecutionMetrics;
  errors: ReportError[];
  warnings: ReportWarning[];
  quality: ReportQuality;
  approval: ApprovalStatus;
  retention: RetentionPolicy;
  access: AccessLog[];
  metadata: ReportInstanceMetadata;
  version: number;
}

export interface MetricsCollection {
  id: string;
  name: string;
  description: string;
  category: MetricsCategory;
  metrics: Metric[];
  aggregations: MetricAggregation[];
  dimensions: MetricDimension[];
  timeRange: TimeRange;
  granularity: TimeGranularity;
  filters: MetricFilter[];
  calculations: CalculatedMetric[];
  benchmarks: MetricBenchmark[];
  targets: MetricTarget[];
  alerts: MetricAlert[];
  trends: TrendAnalysis[];
  forecasts: ForecastData[];
  comparisons: MetricComparison[];
  correlations: MetricCorrelation[];
  quality: MetricsQuality;
  lineage: MetricsLineage;
  governance: MetricsGovernance;
  metadata: MetricsMetadata;
  version: number;
  isActive: boolean;
}

export interface Metric {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: MetricType;
  dataType: DataType;
  unit: MetricUnit;
  precision: number;
  formula: MetricFormula;
  calculation: CalculationMethod;
  source: MetricSource;
  dependencies: MetricDependency[];
  validation: MetricValidation;
  quality: MetricQualityIndicators;
  sensitivity: SensitivityAnalysis;
  business: BusinessContext;
  technical: TechnicalContext;
  governance: MetricGovernance;
  lifecycle: MetricLifecycle;
  usage: MetricUsage;
  performance: MetricPerformance;
  metadata: MetricMetadata;
  tags: string[];
  version: number;
  isActive: boolean;
}

export interface VisualizationConfiguration {
  id: string;
  type: VisualizationType;
  subtype: VisualizationSubtype;
  title: string;
  description: string;
  data: VisualizationData;
  axes: AxisConfiguration[];
  series: SeriesConfiguration[];
  colors: ColorConfiguration;
  styling: VisualizationStyling;
  interactions: InteractionConfiguration[];
  animations: AnimationConfiguration;
  responsiveness: ResponsiveVisualization;
  accessibility: VisualizationAccessibility;
  performance: VisualizationPerformance;
  customization: VisualizationCustomization;
  export: VisualizationExportOptions;
  metadata: VisualizationMetadata;
  version: number;
}

export interface ChartConfiguration {
  chartType: ChartType;
  subtype: ChartSubtype;
  orientation: ChartOrientation;
  stacking: StackingConfiguration;
  grouping: GroupingConfiguration;
  sorting: SortingConfiguration;
  scaling: ScalingConfiguration;
  gridLines: GridLineConfiguration;
  legends: LegendConfiguration;
  tooltips: TooltipConfiguration;
  annotations: AnnotationConfiguration[];
  overlays: OverlayConfiguration[];
  zoom: ZoomConfiguration;
  pan: PanConfiguration;
  selection: SelectionConfiguration;
  brush: BrushConfiguration;
  crossfilter: CrossfilterConfiguration;
  drill: DrillConfiguration;
}

export interface DataVisualizationEngine {
  id: string;
  name: string;
  version: string;
  capabilities: VisualizationCapability[];
  supportedTypes: VisualizationType[];
  configuration: EngineConfiguration;
  performance: EnginePerformance;
  resources: ResourceRequirements;
  integration: IntegrationCapabilities;
  customization: CustomizationOptions;
  extensibility: ExtensibilityFeatures;
  security: SecurityFeatures;
  compliance: ComplianceFeatures;
  monitoring: MonitoringCapabilities;
  maintenance: MaintenanceSettings;
  support: SupportInformation;
  licensing: LicensingInfo;
  metadata: EngineMetadata;
}

export interface AnalyticsEngine {
  id: string;
  name: string;
  type: AnalyticsEngineType;
  capabilities: AnalyticsCapability[];
  algorithms: AnalyticsAlgorithm[];
  models: AnalyticsModel[];
  processing: ProcessingConfiguration;
  storage: StorageConfiguration;
  compute: ComputeConfiguration;
  scaling: ScalingConfiguration;
  optimization: OptimizationSettings;
  caching: CachingStrategy;
  security: SecurityConfiguration;
  monitoring: MonitoringConfiguration;
  integration: IntegrationSettings;
  performance: PerformanceMetrics;
  quality: QualityAssurance;
  governance: GovernanceSettings;
  compliance: ComplianceConfiguration;
  metadata: EngineMetadata;
}

export interface ReportingMetrics {
  dashboardMetrics: DashboardMetrics;
  reportMetrics: ReportMetrics;
  visualizationMetrics: VisualizationMetrics;
  userEngagementMetrics: UserEngagementMetrics;
  performanceMetrics: ReportingPerformanceMetrics;
  qualityMetrics: ReportingQualityMetrics;
  usageMetrics: UsageMetrics;
  costMetrics: CostMetrics;
  securityMetrics: SecurityMetrics;
  complianceMetrics: ComplianceMetrics;
  satisfactionMetrics: SatisfactionMetrics;
  adoptionMetrics: AdoptionMetrics;
  effectivenessMetrics: EffectivenessMetrics;
  innovationMetrics: InnovationMetrics;
  scalabilityMetrics: ScalabilityMetrics;
}

export interface ExportEngine {
  id: string;
  name: string;
  supportedFormats: ExportFormat[];
  capabilities: ExportCapability[];
  configuration: ExportConfiguration;
  performance: ExportPerformance;
  security: ExportSecurity;
  quality: ExportQuality;
  scheduling: ExportScheduling;
  distribution: ExportDistribution;
  monitoring: ExportMonitoring;
  optimization: ExportOptimization;
  customization: ExportCustomization;
  integration: ExportIntegration;
  compliance: ExportCompliance;
  audit: ExportAudit;
  metadata: ExportMetadata;
}

// Supporting Types

export type DashboardCategory = 'operational' | 'strategic' | 'tactical' | 'compliance' | 'performance' | 'quality' | 'custom';
export type LayoutType = 'grid' | 'flow' | 'masonry' | 'custom';
export type WidgetType = 'chart' | 'table' | 'metric' | 'gauge' | 'map' | 'text' | 'image' | 'iframe' | 'custom';
export type ReportType = 'standard' | 'ad-hoc' | 'scheduled' | 'real-time' | 'summary' | 'detailed' | 'executive';
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'html' | 'json' | 'xml' | 'powerpoint' | 'word';
export type ReportStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary' | 'rate' | 'ratio' | 'percentage';
export type VisualizationType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'heatmap' | 'treemap' | 'sankey' | 'network';
export type ChartType = 'column' | 'bar' | 'line' | 'area' | 'pie' | 'doughnut' | 'scatter' | 'bubble' | 'radar';
export type AnalyticsEngineType = 'batch' | 'stream' | 'hybrid' | 'ml' | 'ai' | 'statistical' | 'predictive';
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'xml' | 'png' | 'svg' | 'html';

// Additional supporting interfaces for complex nested structures
export interface CategoryPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  manage: boolean;
}

export interface CategoryMetadata {
  description: string;
  keywords: string[];
  lastModified: Date;
  modifiedBy: string;
  usage: CategoryUsage;
}

export interface CategoryUsage {
  dashboardCount: number;
  reportCount: number;
  userCount: number;
  accessCount: number;
  lastAccessed: Date;
}

export interface ContactInformation {
  phone?: string;
  mobile?: string;
  address?: string;
  timeZone: string;
  locale: string;
}

export interface OwnerPreferences {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}

export interface OwnerDelegation {
  delegateId: string;
  permissions: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface PermissionEntry {
  id: string;
  type: 'user' | 'group' | 'role';
  permissions: string[];
  conditions?: PermissionCondition[];
  expiresAt?: Date;
}

export interface GroupPermission {
  groupId: string;
  permissions: string[];
  inherited: boolean;
  conditions?: PermissionCondition[];
}

export interface RolePermission {
  roleId: string;
  permissions: string[];
  inherited: boolean;
  conditions?: PermissionCondition[];
}

export interface ConditionalPermission {
  condition: PermissionCondition;
  permissions: string[];
  priority: number;
}

export interface PermissionCondition {
  type: 'time' | 'location' | 'device' | 'network' | 'custom';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  metadata?: Record<string, any>;
}

export interface PermissionInheritance {
  enabled: boolean;
  sources: InheritanceSource[];
  conflicts: ConflictResolution;
}

export interface InheritanceSource {
  type: 'parent' | 'group' | 'role' | 'template';
  id: string;
  permissions: string[];
  priority: number;
}

export interface ConflictResolution {
  strategy: 'deny' | 'allow' | 'most_permissive' | 'least_permissive' | 'custom';
  customRules?: ConflictRule[];
}

export interface ConflictRule {
  condition: string;
  resolution: 'deny' | 'allow';
  priority: number;
}

export interface PermissionAudit {
  enabled: boolean;
  events: AuditEvent[];
  retention: AuditRetention;
  compliance: AuditCompliance;
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'denied';
  details: Record<string, any>;
}

export type AuditEventType = 'access' | 'modification' | 'creation' | 'deletion' | 'permission_change' | 'login' | 'logout';

export interface AuditRetention {
  period: number;
  unit: 'days' | 'months' | 'years';
  archival: ArchivalSettings;
}

export interface ArchivalSettings {
  enabled: boolean;
  location: string;
  compression: boolean;
  encryption: boolean;
}

export interface AuditCompliance {
  frameworks: string[];
  requirements: ComplianceRequirement[];
  reporting: ComplianceReporting;
}

export interface ComplianceRequirement {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  mandatory: boolean;
  evidence: EvidenceRequirement[];
}

export interface EvidenceRequirement {
  type: string;
  description: string;
  frequency: string;
  retention: string;
}

export interface ComplianceReporting {
  enabled: boolean;
  frequency: string;
  recipients: string[];
  format: string[];
  automation: boolean;
}

export interface GridConfiguration {
  cellWidth: number;
  cellHeight: number;
  minCellWidth: number;
  minCellHeight: number;
  maxCellWidth: number;
  maxCellHeight: number;
  aspectRatio?: number;
}

export interface SpacingConfiguration {
  horizontal: number;
  vertical: number;
  inner: number;
  outer: number;
}

export interface MarginConfiguration {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BreakpointConfiguration {
  name: string;
  minWidth: number;
  maxWidth?: number;
  columns: number;
  spacing: SpacingConfiguration;
  margins: MarginConfiguration;
}

export interface ResponsiveLayoutSettings {
  enabled: boolean;
  breakpoints: BreakpointConfiguration[];
  strategy: 'fluid' | 'adaptive' | 'hybrid';
  priorities: ResponsivePriority[];
}

export interface ResponsivePriority {
  widgetId: string;
  priority: number;
  hideOnBreakpoints?: string[];
  resizeStrategy: 'scale' | 'reflow' | 'hide';
}

export interface PositioningSettings {
  strategy: 'absolute' | 'relative' | 'fixed' | 'sticky';
  constraints: PositionConstraint[];
  snapping: SnappingSettings;
}

export interface PositionConstraint {
  type: 'boundary' | 'grid' | 'widget' | 'guide';
  value: any;
  strict: boolean;
}

export interface SnappingSettings {
  enabled: boolean;
  tolerance: number;
  targets: SnapTarget[];
}

export interface SnapTarget {
  type: 'grid' | 'widget' | 'guide' | 'boundary';
  priority: number;
}

export interface ZIndexConfiguration {
  base: number;
  increment: number;
  layers: ZIndexLayer[];
}

export interface ZIndexLayer {
  name: string;
  zIndex: number;
  widgets: string[];
}

export interface WidgetPosition {
  x: number;
  y: number;
  z?: number;
  column?: number;
  row?: number;
  anchor?: AnchorPoint;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  units: 'px' | '%' | 'em' | 'rem' | 'grid';
}

export type AnchorPoint = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface WidgetConfiguration {
  settings: Record<string, any>;
  validation: ValidationRule[];
  dependencies: ConfigurationDependency[];
  schema: ConfigurationSchema;
  presets: ConfigurationPreset[];
  customization: CustomizationOptions;
}

export interface ValidationRule {
  field: string;
  type: ValidationType;
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export type ValidationType = 'required' | 'min' | 'max' | 'pattern' | 'custom' | 'range' | 'unique';

export interface ConfigurationDependency {
  field: string;
  dependsOn: string;
  condition: DependencyCondition;
  action: DependencyAction;
}

export interface DependencyCondition {
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

export interface DependencyAction {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional' | 'set_value';
  value?: any;
}

export interface ConfigurationSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, ConfigurationSchema>;
  items?: ConfigurationSchema;
  required?: string[];
  additionalProperties?: boolean;
  enum?: any[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  description?: string;
  default?: any;
}

export interface ConfigurationPreset {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  category: string;
  tags: string[];
  popularity: number;
  author: string;
  version: string;
  compatibility: string[];
}

export interface CustomizationOptions {
  themes: ThemeOption[];
  layouts: LayoutOption[];
  behaviors: BehaviorOption[];
  integrations: IntegrationOption[];
}

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette;
  typography: TypographySettings;
  spacing: SpacingSettings;
  borders: BorderSettings;
  shadows: ShadowSettings;
  animations: AnimationSettings;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface TypographySettings {
  fontFamily: string;
  fontSize: FontSizeScale;
  fontWeight: FontWeightScale;
  lineHeight: LineHeightScale;
  letterSpacing: LetterSpacingScale;
}

export interface FontSizeScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface FontWeightScale {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface LineHeightScale {
  tight: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacingScale {
  tight: string;
  normal: string;
  wide: string;
}

export interface SpacingSettings {
  unit: number;
  scale: SpacingScale;
}

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface BorderSettings {
  radius: BorderRadiusScale;
  width: BorderWidthScale;
  style: BorderStyle;
}

export interface BorderRadiusScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface BorderWidthScale {
  none: string;
  thin: string;
  medium: string;
  thick: string;
}

export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';

export interface ShadowSettings {
  elevation: ElevationScale;
  color: string;
  opacity: number;
}

export interface ElevationScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface AnimationSettings {
  duration: AnimationDurationScale;
  easing: AnimationEasingScale;
  enabled: boolean;
}

export interface AnimationDurationScale {
  fast: string;
  normal: string;
  slow: string;
}

export interface AnimationEasingScale {
  linear: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
}

export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  configuration: LayoutConfiguration;
  preview: string;
  compatibility: string[];
}

export interface LayoutConfiguration {
  type: LayoutType;
  settings: Record<string, any>;
  constraints: LayoutConstraint[];
}

export interface LayoutConstraint {
  type: 'size' | 'position' | 'spacing' | 'alignment';
  value: any;
  priority: number;
}

export interface BehaviorOption {
  id: string;
  name: string;
  description: string;
  configuration: BehaviorConfiguration;
  compatibility: string[];
}

export interface BehaviorConfiguration {
  interactions: InteractionBehavior[];
  animations: AnimationBehavior[];
  responsiveness: ResponsiveBehavior[];
}

export interface InteractionBehavior {
  event: string;
  action: string;
  parameters: Record<string, any>;
  conditions?: BehaviorCondition[];
}

export interface AnimationBehavior {
  trigger: string;
  animation: string;
  duration: string;
  easing: string;
  delay?: string;
  conditions?: BehaviorCondition[];
}

export interface ResponsiveBehavior {
  breakpoint: string;
  changes: BehaviorChange[];
  conditions?: BehaviorCondition[];
}

export interface BehaviorCondition {
  type: string;
  operator: string;
  value: any;
}

export interface BehaviorChange {
  property: string;
  value: any;
  transition?: TransitionSettings;
}

export interface TransitionSettings {
  duration: string;
  easing: string;
  delay?: string;
}

export interface IntegrationOption {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  configuration: IntegrationConfiguration;
  requirements: IntegrationRequirement[];
  compatibility: string[];
}

export type IntegrationType = 'api' | 'webhook' | 'plugin' | 'embed' | 'export' | 'import';

export interface IntegrationConfiguration {
  endpoint?: string;
  authentication?: AuthenticationConfiguration;
  parameters?: Record<string, any>;
  mapping?: DataMapping[];
  transformation?: DataTransformation[];
}

export interface AuthenticationConfiguration {
  type: AuthenticationType;
  credentials: Record<string, any>;
  refreshSettings?: TokenRefreshSettings;
}

export type AuthenticationType = 'none' | 'basic' | 'bearer' | 'oauth' | 'api_key' | 'custom';

export interface TokenRefreshSettings {
  enabled: boolean;
  threshold: number;
  endpoint?: string;
  parameters?: Record<string, any>;
}

export interface DataMapping {
  source: string;
  target: string;
  transformation?: string;
  validation?: ValidationRule[];
}

export interface DataTransformation {
  type: TransformationType;
  configuration: Record<string, any>;
  order: number;
}

export type TransformationType = 'filter' | 'map' | 'reduce' | 'aggregate' | 'sort' | 'join' | 'custom';

export interface IntegrationRequirement {
  type: RequirementType;
  description: string;
  mandatory: boolean;
  validation?: ValidationRule[];
}

export type RequirementType = 'permission' | 'credential' | 'network' | 'software' | 'hardware' | 'data';

// Additional complex nested interfaces continue...
// [Note: Due to length constraints, I'm showing the pattern. The actual file would continue with all remaining interface definitions following the same detailed pattern]

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: NotificationFrequency;
  types: NotificationType[];
  quietHours: QuietHoursSettings;
}

export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
export type NotificationType = 'alert' | 'update' | 'reminder' | 'system' | 'social';

export interface QuietHoursSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
  days: string[];
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'auto';
  density: 'compact' | 'normal' | 'comfortable';
  animations: boolean;
  language: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'team';
  activityTracking: boolean;
  dataSharing: boolean;
  analytics: boolean;
  cookies: CookiePreferences;
}

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface AccessibilityPreferences {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  motionReduced: boolean;
  colorBlindness: ColorBlindnessType;
}

export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

// =============================================================================
// API RESPONSE TYPE
// =============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId: string;
}

// =============================================================================
// API ERROR TYPES
// =============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}