'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';

// Core UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Lucide Icons
import { // Navigation & Layout
  Layout, Sidebar as SidebarIcon,
  Search, Filter, Settings, Database, FileText, Tag, Bookmark, Star, Heart, Eye, // Core Features
  BarChart3, TrendingUp, Activity, Target, Brain, Sparkles, Lightbulb, Bot, // Analytics
  Users, User, UserPlus, MessageSquare, Bell, // User & Collaboration 
  Play, Pause, RefreshCw, Plus, // Actions
  AlertCircle, CheckCircle, AlertTriangle, // Status
  Workflow, Network, Layers, Globe, Map, // Advanced Features
  Shield, Lock, GitBranch, // Security
  Gauge, BarChart2, LineChart, // Data & Charts
  BookOpen, 
  ArrowRight,
  Calculator,
  Cog,
  CommandIcon,
  Scan,
  Sheet} from 'lucide-react';

// Hooks and Services
import { useCatalogAnalytics } from '../hooks/useCatalogAnalytics';
import { useCatalogDiscovery } from '../hooks/useCatalogDiscovery';
import { useCatalogLineage } from '../hooks/useCatalogLineage';
import { useCatalogCollaboration } from '../hooks/useCatalogCollaboration';
import { useCatalogRecommendations } from '../hooks/useCatalogRecommendations';
import { useCatalogProfiling } from '../hooks/useCatalogProfiling';
import { useCatalogAI } from '../hooks/useCatalogAI';

// RBAC Integration
import { useCatalogRBAC } from '../hooks/useCatalogRBAC';

// Workflow Orchestration
import { useCatalogWorkflowOrchestrator } from '../hooks/useCatalogWorkflowOrchestrator';

// Services
import { catalogAnalyticsService } from '../services/catalog-analytics.service';
import { enterpriseCatalogService } from '../services/enterprise-catalog.service';
import { semanticSearchService } from '../services/semantic-search.service';
import { intelligentDiscoveryService } from '../services/intelligent-discovery.service';
import { catalogAIService } from '../services/catalog-ai.service';
import { catalogQualityService } from '../services/catalog-quality.service';
import { advancedLineageService } from '../services/advanced-lineage.service';
import { catalogRecommendationService } from '../services/catalog-recommendation.service';
import { collaborationService } from '../services/collaboration.service';
import { dataProfilingService } from '../services/data-profiling.service';

// Types
import {
  IntelligentDataAsset,
  SearchRequest,
  SearchResponse,
  SearchFilter,
  CatalogAnalyticsDashboard,
  DataLineageGraph,
  DataQualityMetrics,
  SearchHistoryItem,
  CollaborationSession,
  DataProfileSummary,
  AssetRecommendation
} from '../types';
import { LoadBalancingConfig } from '@/components/Advanced-Scan-Logic/types/coordination.types';
import { WorkflowOptimization } from '@/components/Advanced-Scan-Rule-Sets/types/collaboration.types';
import { OrchestrationMetrics, MessageQueue } from '@/components/Advanced-Scan-Rule-Sets/types/orchestration.types';
import { DataMapping } from '@/components/Compliance-Rule/types';
import { ComponentStatus } from '@/components/data-sources/core';
import { RollbackStrategy } from '@/components/data-sources/workflows/bulk-operations';
import { DataSchema, DataTransformation, RetryPolicy, ConflictResolutionStrategy, EventSubscription, OptimizationGoal } from '@/components/racine-main-manager';
import { BreadcrumbItem } from '@/components/racine-main-manager/components/routing';
import { StepCondition, PerformanceOptimization } from '@/components/racine-main-manager/types';
import { CommandShortcut, SheetContent, SheetHeader, SheetTitle, SheetDescription, DialogHeader, DialogFooter } from '@/components/ui';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { Switch } from '@radix-ui/react-switch';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { SharedState } from '@react-three/drei';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from 'cmdk';
import { Input } from 'postcss';
import { Label } from 'recharts';

// ============================================================================
// LAZY LOADED COMPONENTS (FOR PERFORMANCE)
// ============================================================================

// Catalog Analytics Components
const UsageAnalyticsDashboard = lazy(() => import('../components/catalog-analytics/UsageAnalyticsDashboard'));
const DataProfiler = lazy(() => import('../components/catalog-analytics/DataProfiler'));
const PredictiveInsights = lazy(() => import('../components/catalog-analytics/PredictiveInsights'));
const BusinessGlossaryManager = lazy(() => import('../components/catalog-analytics/BusinessGlossaryManager'));
const CatalogMetricsCenter = lazy(() => import('../components/catalog-analytics/CatalogMetricsCenter'));
const ImpactAnalysisEngine = lazy(() => import('../components/catalog-analytics/ImpactAnalysisEngine'));
const PopularityAnalyzer = lazy(() => import('../components/catalog-analytics/PopularityAnalyzer'));
const TrendAnalysisDashboard = lazy(() => import('../components/catalog-analytics/TrendAnalysisDashboard'));

// Search Discovery Components
const SearchPersonalization = lazy(() => import('../components/search-discovery/SearchPersonalization'));
const SearchRecommendations = lazy(() => import('../components/search-discovery/SearchRecommendations'));
const AdvancedFiltering = lazy(() => import('../components/search-discovery/AdvancedFiltering'));
const SavedSearches = lazy(() => import('../components/search-discovery/SavedSearches'));
const SearchAnalytics = lazy(() => import('../components/search-discovery/SearchAnalytics'));
const NaturalLanguageQuery = lazy(() => import('../components/search-discovery/NaturalLanguageQuery'));
const SearchResultsAnalyzer = lazy(() => import('../components/search-discovery/SearchResultsAnalyzer'));
const UnifiedSearchInterface = lazy(() => import('../components/search-discovery/UnifiedSearchInterface'));

// Data Lineage Components (7 components)
const ChangeImpactAnalyzer = lazy(() => import('../components/data-lineage/ChangeImpactAnalyzer'));
const DependencyResolver = lazy(() => import('../components/data-lineage/DependencyResolver'));
const ImpactAnalysisViewer = lazy(() => import('../components/data-lineage/ImpactAnalysisViewer'));
const LineageGovernance = lazy(() => import('../components/data-lineage/LineageGovernance'));
const LineageReporting = lazy(() => import('../components/data-lineage/LineageReporting'));
const LineageTrackingSystem = lazy(() => import('../components/data-lineage/LineageTrackingSystem'));
const LineageVisualizationEngine = lazy(() => import('../components/data-lineage/LineageVisualizationEngine'));

// Intelligent Discovery Components (8 components)
const AIDiscoveryEngine = lazy(() => import('../components/intelligent-discovery/AIDiscoveryEngine'));
const AutoClassificationEngine = lazy(() => import('../components/intelligent-discovery/AutoClassificationEngine'));
const DataProfilingEngine = lazy(() => import('../components/intelligent-discovery/DataProfilingEngine'));
const DataSourceIntegrator = lazy(() => import('../components/intelligent-discovery/DataSourceIntegrator'));
const IncrementalDiscovery = lazy(() => import('../components/intelligent-discovery/IncrementalDiscovery'));
const MetadataEnrichmentEngine = lazy(() => import('../components/intelligent-discovery/MetadataEnrichmentEngine'));
const SchemaEvolutionTracker = lazy(() => import('../components/intelligent-discovery/SchemaEvolutionTracker'));
const SemanticSchemaAnalyzer = lazy(() => import('../components/intelligent-discovery/SemanticSchemaAnalyzer'));

// Quality Management Components (8 components)
const AnomalyDetector = lazy(() => import('../components/quality-management/AnomalyDetector'));
const DataHealthMonitor = lazy(() => import('../components/quality-management/DataHealthMonitor'));
const DataQualityDashboard = lazy(() => import('../components/quality-management/DataQualityDashboard'));
const DataValidationFramework = lazy(() => import('../components/quality-management/DataValidationFramework'));
const QualityMetricsCalculator = lazy(() => import('../components/quality-management/QualityMetricsCalculator'));
const QualityReportGenerator = lazy(() => import('../components/quality-management/QualityReportGenerator'));
const QualityRulesEngine = lazy(() => import('../components/quality-management/QualityRulesEngine'));
const QualityTrendsAnalyzer = lazy(() => import('../components/quality-management/QualityTrendsAnalyzer'));

// Collaboration Components (8 components)
const AnnotationManager = lazy(() => import('../components/collaboration/AnnotationManager'));
const CatalogCollaborationHub = lazy(() => import('../components/collaboration/CatalogCollaborationHub'));
const CommunityForum = lazy(() => import('../components/collaboration/CommunityForum'));
const CrowdsourcingPlatform = lazy(() => import('../components/collaboration/CrowdsourcingPlatform'));
const DataStewardshipCenter = lazy(() => import('../components/collaboration/DataStewardshipCenter'));
const ExpertNetworking = lazy(() => import('../components/collaboration/ExpertNetworking'));
const KnowledgeBase = lazy(() => import('../components/collaboration/KnowledgeBase'));
const ReviewWorkflowEngine = lazy(() => import('../components/collaboration/ReviewWorkflowEngine'));

// Catalog Intelligence Components (8 components)
const ContextualRecommendations = lazy(() => import('../components/catalog-intelligence/ContextualRecommendations'));
const DataLineageVisualizer = lazy(() => import('../components/catalog-intelligence/DataLineageVisualizer'));
const IntelligentCatalogViewer = lazy(() => import('../components/catalog-intelligence/IntelligentCatalogViewer'));
const RelationshipMapper = lazy(() => import('../components/catalog-intelligence/RelationshipMapper'));
const SemanticSearchEngine = lazy(() => import('../components/catalog-intelligence/SemanticSearchEngine'));
const SimilarityAnalyzer = lazy(() => import('../components/catalog-intelligence/SimilarityAnalyzer'));
const SmartTaggingEngine = lazy(() => import('../components/catalog-intelligence/SmartTaggingEngine'));
const UsagePatternAnalyzer = lazy(() => import('../components/catalog-intelligence/UsagePatternAnalyzer'));

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface AdvancedCatalogSPAProps {
  userId?: string;
  organizationId?: string;
  theme?: 'light' | 'dark' | 'system';
  onNavigate?: (route: string, context?: any) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: CatalogState) => void;
}

interface CatalogState {
  currentRoute: string;
  activeComponent: string;
  breadcrumbs: BreadcrumbItem[];
  searchContext: SearchContext;
  userPreferences: UserPreferences;
  workflowState: WorkflowState;
  collaborationState: CollaborationState;
  systemHealth: SystemHealth;
  notifications: Notification[];
  recentActivity: ActivityItem[];
  orchestrationState: OrchestrationState;
  componentInteractions: ComponentInteractionMap;
  intelligentWorkflows: IntelligentWorkflow[];
  crossComponentData: CrossComponentData;
}

interface OrchestrationState {
  activeOrchestrations: ComponentOrchestration[];
  componentDependencies: ComponentDependencyGraph;
  dataFlows: DataFlow[];
  workflowChains: WorkflowChain[];
  intelligentRouting: IntelligentRouting;
  realTimeSync: RealTimeSyncState;
  performanceMetrics: OrchestrationMetrics;
}

interface ComponentOrchestration {
  id: string;
  name: string;
  description: string;
  components: string[];
  orchestrationType: 'SEQUENTIAL' | 'PARALLEL' | 'CONDITIONAL' | 'EVENT_DRIVEN';
  triggerConditions: OrchestrationTrigger[];
  dataMapping: DataMapping[];
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  results: OrchestrationResult[];
}

interface ComponentDependencyGraph {
  nodes: ComponentNode[];
  edges: ComponentEdge[];
  clusters: ComponentCluster[];
}

interface ComponentNode {
  id: string;
  componentId: string;
  title: string;
  category: string;
  dependencies: string[];
  dependents: string[];
  status: ComponentStatus;
  dataOutputs: DataOutput[];
  dataInputs: DataInput[];
}

interface ComponentEdge {
  id: string;
  source: string;
  target: string;
  type: 'DATA_FLOW' | 'CONTROL_FLOW' | 'EVENT_FLOW';
  weight: number;
  conditions?: EdgeCondition[];
}

interface ComponentCluster {
  id: string;
  name: string;
  components: string[];
  type: 'FUNCTIONAL' | 'PERFORMANCE' | 'SECURITY' | 'DATA_DOMAIN';
  optimization: ClusterOptimization;
}

interface DataFlow {
  id: string;
  name: string;
  sourceComponent: string;
  targetComponent: string;
  dataType: string;
  schema: DataSchema;
  transformation?: DataTransformation;
  validation: DataValidation;
  monitoring: FlowMonitoring;
}

interface WorkflowChain {
  id: string;
  name: string;
  description: string;
  steps: WorkflowChainStep[];
  branchingLogic: BranchingLogic[];
  errorHandling: ErrorHandling;
  optimization: WorkflowOptimization;
  performance: WorkflowPerformance;
}

interface WorkflowChainStep {
  id: string;
  componentId: string;
  operation: string;
  parameters: Record<string, any>;
  conditions: StepCondition[];
  timeout: number;
  retryPolicy: RetryPolicy;
  rollbackStrategy: RollbackStrategy;
}

interface IntelligentRouting {
  routingRules: RoutingRule[];
  adaptiveRouting: AdaptiveRoutingConfig;
  loadBalancing: LoadBalancingConfig;
  failoverStrategies: FailoverStrategy[];
  performanceOptimization: PerformanceOptimization;
}

interface RoutingRule {
  id: string;
  condition: string;
  targetComponent: string;
  priority: number;
  weight: number;
  metadata: Record<string, any>;
}

interface RealTimeSyncState {
  syncedComponents: SyncedComponent[];
  syncFrequency: number;
  conflictResolution: ConflictResolutionStrategy;
  eventBus: EventBusState;
  stateConsistency: StateConsistencyCheck;
}

interface SyncedComponent {
  componentId: string;
  lastSyncTime: Date;
  syncStatus: 'IN_SYNC' | 'OUT_OF_SYNC' | 'SYNCING' | 'ERROR';
  dataVersion: string;
  conflicts: DataConflict[];
}

interface ComponentInteractionMap {
  interactions: ComponentInteraction[];
  communicationProtocols: CommunicationProtocol[];
  messageQueues: MessageQueue[];
  eventSubscriptions: EventSubscription[];
  sharedStates: SharedState[];
}

interface ComponentInteraction {
  id: string;
  sourceComponent: string;
  targetComponent: string;
  interactionType: 'SYNCHRONOUS' | 'ASYNCHRONOUS' | 'EVENT_DRIVEN' | 'STREAMING';
  protocol: string;
  frequency: number;
  dataVolume: number;
  latency: number;
  reliability: number;
}

interface IntelligentWorkflow {
  id: string;
  name: string;
  description: string;
  aiModel: string;
  learningCapabilities: LearningCapability[];
  adaptiveParameters: AdaptiveParameter[];
  optimizationGoals: OptimizationGoal[];
  performanceHistory: PerformanceHistory[];
  recommendations: WorkflowRecommendation[];
}

interface LearningCapability {
  type: 'PATTERN_RECOGNITION' | 'PERFORMANCE_OPTIMIZATION' | 'ANOMALY_DETECTION' | 'PREDICTIVE_SCALING';
  accuracy: number;
  confidence: number;
  trainingData: TrainingDataSet;
  lastTrainingTime: Date;
}

interface CrossComponentData {
  sharedDatasets: SharedDataset[];
  crossReferences: CrossReference[];
  globalFilters: GlobalFilter[];
  unifiedSearch: UnifiedSearchState;
  masterCatalog: MasterCatalogState;
}

interface SharedDataset {
  id: string;
  name: string;
  description: string;
  schema: DataSchema;
  consumers: ComponentConsumer[];
  producers: ComponentProducer[];
  accessControl: AccessControlPolicy;
  versionControl: VersionControl;
  synchronization: SynchronizationPolicy;
}

interface ComponentConsumer {
  componentId: string;
  accessLevel: 'READ' | 'WRITE' | 'READ_WRITE';
  usagePattern: UsagePattern;
  lastAccessed: Date;
  accessCount: number;
}

interface MasterCatalogState {
  unifiedView: UnifiedCatalogView;
  crossComponentSearch: CrossComponentSearchState;
  globalMetadata: GlobalMetadata;
  federatedQueries: FederatedQuery[];
  masterDataModel: MasterDataModel;
}

interface SearchContext {
  query: string;
  filters: SearchFilter[];
  results: IntelligentDataAsset[];
  totalResults: number;
  facets: SearchFacet[];
  suggestions: string[];
  isLoading: boolean;
  lastSearchTime: Date;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dashboardLayout: DashboardLayout;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  accessibilitySettings: AccessibilitySettings;
}

interface DashboardLayout {
  layout: 'grid' | 'list' | 'masonry';
  columns: number;
  density: 'compact' | 'comfortable' | 'spacious';
  widgets: DashboardWidget[];
}

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
  permissions: string[];
}

interface NotificationSettings {
  enablePush: boolean;
  enableEmail: boolean;
  enableInApp: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  categories: string[];
}

interface PrivacySettings {
  showActivity: boolean;
  allowAnalytics: boolean;
  shareUsageData: boolean;
  publicProfile: boolean;
}

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

interface WorkflowState {
  activeWorkflows: WorkflowInstance[];
  completedTasks: number;
  pendingTasks: number;
  workflowTemplates: WorkflowTemplate[];
  automationRules: AutomationRule[];
}

interface WorkflowInstance {
  id: string;
  templateId: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  config: Record<string, any>;
  dependencies: string[];
  outputs: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStepTemplate[];
  triggers: WorkflowTrigger[];
  isPublic: boolean;
  usageCount: number;
}

interface WorkflowStepTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  config: Record<string, any>;
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
}

interface WorkflowInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
}

interface WorkflowOutput {
  name: string;
  type: string;
  description: string;
}

interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'webhook';
  config: Record<string, any>;
  isEnabled: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  actions: AutomationAction[];
  isEnabled: boolean;
  executionCount: number;
  lastExecuted: Date;
}

interface AutomationAction {
  type: string;
  config: Record<string, any>;
  order: number;
}

interface CollaborationState {
  activeSessions: CollaborationSession[];
  sharedAssets: IntelligentDataAsset[];
  teamMembers: TeamMember[];
  discussions: Discussion[];
  announcements: Announcement[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  isOnline: boolean;
  lastSeen: Date;
  permissions: string[];
}

interface Discussion {
  id: string;
  title: string;
  assetId?: string;
  participants: string[];
  messages: DiscussionMessage[];
  tags: string[];
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DiscussionMessage {
  id: string;
  userId: string;
  content: string;
  attachments: Attachment[];
  reactions: Reaction[];
  createdAt: Date;
  isEdited: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: string[];
  isSticky: boolean;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  services: ServiceHealth[];
  alerts: SystemAlert[];
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  service: string;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: NotificationAction;
  isRead: boolean;
  isPersistent: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

interface ActivityItem {
  id: string;
  type: 'search' | 'view' | 'edit' | 'share' | 'collaborate' | 'workflow';
  description: string;
  assetId?: string;
  userId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

interface SearchFacet {
  name: string;
  values: FacetValue[];
  type: 'checkbox' | 'radio' | 'range' | 'date';
}

interface FacetValue {
  value: string;
  count: number;
  isSelected: boolean;
}

interface ComponentRegistry {
  [key: string]: {
    component: React.ComponentType<any>;
    title: string;
    description: string;
    category: string;
    icon: React.ComponentType;
    permissions: string[];
    dependencies: string[];
    config: Record<string, any>;
  };
}

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType;
  route: string;
  component: string;
  children?: NavigationItem[];
  permissions: string[];
  badge?: string | number;
  isNew?: boolean;
  isDeprecated?: boolean;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COMPONENT_REGISTRY: ComponentRegistry = {
  // Catalog Analytics
  'usage-analytics-dashboard': {
    component: UsageAnalyticsDashboard,
    title: 'Usage Analytics Dashboard',
    description: 'Comprehensive usage analytics and metrics visualization',
    category: 'Analytics',
    icon: BarChart3,
    permissions: ['analytics:read'],
    dependencies: ['catalog-analytics-service'],
    config: { refreshInterval: 30000 }
  },
  'data-profiler': {
    component: DataProfiler,
    title: 'Data Profiler',
    description: 'Advanced data profiling and quality assessment',
    category: 'Analytics',
    icon: Gauge,
    permissions: ['profiling:read'],
    dependencies: ['data-profiling-service'],
    config: { autoProfile: true }
  },
  'predictive-insights': {
    component: PredictiveInsights,
    title: 'Predictive Insights',
    description: 'AI-powered predictive analytics and machine learning insights',
    category: 'AI/ML',
    icon: Brain,
    permissions: ['insights:read'],
    dependencies: ['catalog-ai-service'],
    config: { enablePredictions: true }
  },
  'business-glossary-manager': {
    component: BusinessGlossaryManager,
    title: 'Business Glossary Manager',
    description: 'Manage business terms and definitions',
    category: 'Management',
    icon: BookOpen,
    permissions: ['glossary:read', 'glossary:write'],
    dependencies: ['enterprise-catalog-service'],
    config: {}
  },
  'catalog-metrics-center': {
    component: CatalogMetricsCenter,
    title: 'Catalog Metrics Center',
    description: 'Central hub for catalog metrics and KPIs',
    category: 'Analytics',
    icon: Target,
    permissions: ['metrics:read'],
    dependencies: ['catalog-analytics-service'],
    config: {}
  },
  'impact-analysis-engine': {
    component: ImpactAnalysisEngine,
    title: 'Impact Analysis Engine',
    description: 'Analyze impact of changes across the data ecosystem',
    category: 'Analysis',
    icon: Network,
    permissions: ['analysis:read'],
    dependencies: ['advanced-lineage-service'],
    config: {}
  },
  'popularity-analyzer': {
    component: PopularityAnalyzer,
    title: 'Popularity Analyzer',
    description: 'Analyze and track asset popularity and usage patterns',
    category: 'Analytics',
    icon: TrendingUp,
    permissions: ['analytics:read'],
    dependencies: ['catalog-analytics-service'],
    config: {}
  },
  'trend-analysis-dashboard': {
    component: TrendAnalysisDashboard,
    title: 'Trend Analysis Dashboard',
    description: 'Comprehensive trend analysis and forecasting',
    category: 'Analytics',
    icon: LineChart,
    permissions: ['trends:read'],
    dependencies: ['catalog-analytics-service'],
    config: {}
  },

  // Search Discovery
  'search-personalization': {
    component: SearchPersonalization,
    title: 'Search Personalization',
    description: 'AI-powered personalized search experiences',
    category: 'Search',
    icon: User,
    permissions: ['search:read'],
    dependencies: ['semantic-search-service'],
    config: { enablePersonalization: true }
  },
  'search-recommendations': {
    component: SearchRecommendations,
    title: 'Search Recommendations',
    description: 'Intelligent search suggestions and recommendations',
    category: 'Search',
    icon: Lightbulb,
    permissions: ['search:read'],
    dependencies: ['catalog-recommendation-service'],
    config: {}
  },
  'advanced-filtering': {
    component: AdvancedFiltering,
    title: 'Advanced Filtering',
    description: 'Powerful search filtering with complex logic',
    category: 'Search',
    icon: Filter,
    permissions: ['search:read'],
    dependencies: ['semantic-search-service'],
    config: {}
  },
  'saved-searches': {
    component: SavedSearches,
    title: 'Saved Searches',
    description: 'Manage and organize saved search queries',
    category: 'Search',
    icon: Bookmark,
    permissions: ['search:read', 'search:write'],
    dependencies: ['semantic-search-service'],
    config: {}
  },
  'search-analytics': {
    component: SearchAnalytics,
    title: 'Search Analytics',
    description: 'Search performance analytics and insights',
    category: 'Analytics',
    icon: Activity,
    permissions: ['analytics:read'],
    dependencies: ['catalog-analytics-service'],
    config: {}
  },
  'natural-language-query': {
    component: NaturalLanguageQuery,
    title: 'Natural Language Query',
    description: 'Query data using natural language',
    category: 'Search',
    icon: MessageSquare,
    permissions: ['search:read'],
    dependencies: ['catalog-ai-service'],
    config: {}
  },
  'search-results-analyzer': {
    component: SearchResultsAnalyzer,
    title: 'Search Results Analyzer',
    description: 'Analyze and optimize search results',
    category: 'Analysis',
    icon: Search,
    permissions: ['analysis:read'],
    dependencies: ['semantic-search-service'],
    config: {}
  },
  'unified-search-interface': {
    component: UnifiedSearchInterface,
    title: 'Unified Search Interface',
    description: 'Unified interface for all search capabilities',
    category: 'Search',
    icon: Search,
    permissions: ['search:read'],
    dependencies: ['semantic-search-service'],
    config: {}
  },

  // Data Lineage Components (7 components)
  'change-impact-analyzer': {
    component: ChangeImpactAnalyzer,
    title: 'Change Impact Analyzer',
    description: 'Analyze the impact of data changes across systems',
    category: 'Lineage',
    icon: Target,
    permissions: ['lineage:read', 'analysis:read'],
    dependencies: ['advanced-lineage-service'],
    config: { enableRealTimeAnalysis: true }
  },
  'dependency-resolver': {
    component: DependencyResolver,
    title: 'Dependency Resolver',
    description: 'Resolve complex data dependencies and relationships',
    category: 'Lineage',
    icon: GitBranch,
    permissions: ['lineage:read'],
    dependencies: ['advanced-lineage-service'],
    config: { maxDepth: 10 }
  },
  'impact-analysis-viewer': {
    component: ImpactAnalysisViewer,
    title: 'Impact Analysis Viewer',
    description: 'Visualize impact analysis results and recommendations',
    category: 'Lineage',
    icon: Eye,
    permissions: ['analysis:read'],
    dependencies: ['advanced-lineage-service'],
    config: { enableInteractiveVisualization: true }
  },
  'lineage-governance': {
    component: LineageGovernance,
    title: 'Lineage Governance',
    description: 'Govern and control data lineage policies',
    category: 'Governance',
    icon: Shield,
    permissions: ['governance:read', 'governance:write'],
    dependencies: ['advanced-lineage-service'],
    config: { enablePolicyEnforcement: true }
  },
  'lineage-reporting': {
    component: LineageReporting,
    title: 'Lineage Reporting',
    description: 'Generate comprehensive lineage reports and documentation',
    category: 'Reporting',
    icon: FileText,
    permissions: ['reporting:read'],
    dependencies: ['advanced-lineage-service'],
    config: { supportedFormats: ['PDF', 'HTML', 'JSON'] }
  },
  'lineage-tracking-system': {
    component: LineageTrackingSystem,
    title: 'Lineage Tracking System',
    description: 'Track and monitor data lineage in real-time',
    category: 'Tracking',
    icon: Activity,
    permissions: ['lineage:read'],
    dependencies: ['advanced-lineage-service'],
    config: { enableRealTimeTracking: true }
  },
  'lineage-visualization-engine': {
    component: LineageVisualizationEngine,
    title: 'Lineage Visualization Engine',
    description: 'Advanced visualization engine for data lineage',
    category: 'Visualization',
    icon: Network,
    permissions: ['lineage:read'],
    dependencies: ['advanced-lineage-service'],
    config: { renderEngine: '3D', maxNodes: 1000 }
  },

  // Intelligent Discovery Components (8 components)
  'ai-discovery-engine': {
    component: AIDiscoveryEngine,
    title: 'AI Discovery Engine',
    description: 'AI-powered automatic data asset discovery',
    category: 'AI Discovery',
    icon: Bot,
    permissions: ['discovery:read'],
    dependencies: ['intelligent-discovery-service', 'catalog-ai-service'],
    config: { enableDeepLearning: true, confidenceThreshold: 0.8 }
  },
  'auto-classification-engine': {
    component: AutoClassificationEngine,
    title: 'Auto Classification Engine',
    description: 'Automatically classify data assets using machine learning',
    category: 'AI Classification',
    icon: Tag,
    permissions: ['classification:read'],
    dependencies: ['intelligent-discovery-service'],
    config: { enableMLClassification: true }
  },
  'data-profiling-engine': {
    component: DataProfilingEngine,
    title: 'Data Profiling Engine',
    description: 'Advanced automated data profiling and analysis',
    category: 'Profiling',
    icon: Scan,
    permissions: ['profiling:read'],
    dependencies: ['data-profiling-service'],
    config: { enableParallelProcessing: true }
  },
  'data-source-integrator': {
    component: DataSourceIntegrator,
    title: 'Data Source Integrator',
    description: 'Integrate and discover data from multiple sources',
    category: 'Integration',
    icon: Database,
    permissions: ['integration:read'],
    dependencies: ['intelligent-discovery-service'],
    config: { supportedSources: ['SQL', 'NoSQL', 'API', 'Files'] }
  },
  'incremental-discovery': {
    component: IncrementalDiscovery,
    title: 'Incremental Discovery',
    description: 'Discover data changes incrementally and efficiently',
    category: 'Discovery',
    icon: RefreshCw,
    permissions: ['discovery:read'],
    dependencies: ['intelligent-discovery-service'],
    config: { scanInterval: 3600000 }
  },
  'metadata-enrichment-engine': {
    component: MetadataEnrichmentEngine,
    title: 'Metadata Enrichment Engine',
    description: 'Automatically enrich metadata with AI insights',
    category: 'Enrichment',
    icon: Sparkles,
    permissions: ['metadata:write'],
    dependencies: ['intelligent-discovery-service', 'catalog-ai-service'],
    config: { enableSemanticEnrichment: true }
  },
  'schema-evolution-tracker': {
    component: SchemaEvolutionTracker,
    title: 'Schema Evolution Tracker',
    description: 'Track and analyze schema changes over time',
    category: 'Schema Management',
    icon: GitBranch,
    permissions: ['schema:read'],
    dependencies: ['intelligent-discovery-service'],
    config: { enableVersionControl: true }
  },
  'semantic-schema-analyzer': {
    component: SemanticSchemaAnalyzer,
    title: 'Semantic Schema Analyzer',
    description: 'Analyze schemas using semantic understanding',
    category: 'Schema Analysis',
    icon: Brain,
    permissions: ['analysis:read'],
    dependencies: ['catalog-ai-service'],
    config: { enableSemanticAnalysis: true }
  },

  // Quality Management Components (8 components)
  'anomaly-detector': {
    component: AnomalyDetector,
    title: 'Anomaly Detector',
    description: 'Detect data anomalies using machine learning',
    category: 'Quality Monitoring',
    icon: AlertTriangle,
    permissions: ['quality:read'],
    dependencies: ['catalog-quality-service'],
    config: { enableMLDetection: true, sensitivity: 0.7 }
  },
  'data-health-monitor': {
    component: DataHealthMonitor,
    title: 'Data Health Monitor',
    description: 'Monitor overall data health and quality metrics',
    category: 'Health Monitoring',
    icon: Heart,
    permissions: ['quality:read'],
    dependencies: ['catalog-quality-service'],
    config: { enableRealTimeMonitoring: true }
  },
  'data-quality-dashboard': {
    component: DataQualityDashboard,
    title: 'Data Quality Dashboard',
    description: 'Comprehensive data quality metrics and insights',
    category: 'Quality Dashboard',
    icon: Gauge,
    permissions: ['quality:read'],
    dependencies: ['catalog-quality-service'],
    config: { refreshInterval: 30000 }
  },
  'data-validation-framework': {
    component: DataValidationFramework,
    title: 'Data Validation Framework',
    description: 'Comprehensive data validation and testing framework',
    category: 'Validation',
    icon: CheckCircle,
    permissions: ['validation:read', 'validation:write'],
    dependencies: ['catalog-quality-service'],
    config: { enableCustomRules: true }
  },
  'quality-metrics-calculator': {
    component: QualityMetricsCalculator,
    title: 'Quality Metrics Calculator',
    description: 'Calculate and analyze data quality metrics',
    category: 'Metrics',
    icon: Calculator,
    permissions: ['metrics:read'],
    dependencies: ['catalog-quality-service'],
    config: { enableAdvancedMetrics: true }
  },
  'quality-report-generator': {
    component: QualityReportGenerator,
    title: 'Quality Report Generator',
    description: 'Generate comprehensive data quality reports',
    category: 'Reporting',
    icon: FileText,
    permissions: ['reporting:read'],
    dependencies: ['catalog-quality-service'],
    config: { supportedFormats: ['PDF', 'Excel', 'HTML'] }
  },
  'quality-rules-engine': {
    component: QualityRulesEngine,
    title: 'Quality Rules Engine',
    description: 'Manage and execute data quality rules',
    category: 'Rules Management',
    icon: Cog,
    permissions: ['rules:read', 'rules:write'],
    dependencies: ['catalog-quality-service'],
    config: { enableCustomRules: true }
  },
  'quality-trends-analyzer': {
    component: QualityTrendsAnalyzer,
    title: 'Quality Trends Analyzer',
    description: 'Analyze data quality trends and patterns',
    category: 'Trend Analysis',
    icon: TrendingUp,
    permissions: ['analysis:read'],
    dependencies: ['catalog-quality-service'],
    config: { enablePredictiveTrends: true }
  },

  // Collaboration Components (8 components)
  'annotation-manager': {
    component: AnnotationManager,
    title: 'Annotation Manager',
    description: 'Manage data asset annotations and comments',
    category: 'Annotations',
    icon: MessageSquare,
    permissions: ['collaboration:read', 'collaboration:write'],
    dependencies: ['collaboration-service'],
    config: { enableRichText: true }
  },
  'catalog-collaboration-hub': {
    component: CatalogCollaborationHub,
    title: 'Catalog Collaboration Hub',
    description: 'Central hub for catalog collaboration activities',
    category: 'Collaboration Hub',
    icon: Users,
    permissions: ['collaboration:read'],
    dependencies: ['collaboration-service'],
    config: { enableRealTimeCollaboration: true }
  },
  'community-forum': {
    component: CommunityForum,
    title: 'Community Forum',
    description: 'Community discussion forum for data governance',
    category: 'Community',
    icon: MessageSquare,
    permissions: ['forum:read', 'forum:write'],
    dependencies: ['collaboration-service'],
    config: { enableModeration: true }
  },
  'crowdsourcing-platform': {
    component: CrowdsourcingPlatform,
    title: 'Crowdsourcing Platform',
    description: 'Crowdsource data governance tasks and insights',
    category: 'Crowdsourcing',
    icon: Users,
    permissions: ['crowdsourcing:read'],
    dependencies: ['collaboration-service'],
    config: { enableRewards: true }
  },
  'data-stewardship-center': {
    component: DataStewardshipCenter,
    title: 'Data Stewardship Center',
    description: 'Manage data stewardship activities and responsibilities',
    category: 'Stewardship',
    icon: Shield,
    permissions: ['stewardship:read'],
    dependencies: ['collaboration-service'],
    config: { enableWorkflowAssignment: true }
  },
  'expert-networking': {
    component: ExpertNetworking,
    title: 'Expert Networking',
    description: 'Connect with data domain experts and specialists',
    category: 'Networking',
    icon: UserPlus,
    permissions: ['networking:read'],
    dependencies: ['collaboration-service'],
    config: { enableExpertMatching: true }
  },
  'knowledge-base': {
    component: KnowledgeBase,
    title: 'Knowledge Base',
    description: 'Comprehensive knowledge base for data governance',
    category: 'Knowledge',
    icon: BookOpen,
    permissions: ['knowledge:read'],
    dependencies: ['collaboration-service'],
    config: { enableSearch: true, enableVersioning: true }
  },
  'review-workflow-engine': {
    component: ReviewWorkflowEngine,
    title: 'Review Workflow Engine',
    description: 'Manage data asset review and approval workflows',
    category: 'Workflow',
    icon: Workflow,
    permissions: ['workflow:read', 'workflow:write'],
    dependencies: ['collaboration-service'],
    config: { enableParallelReviews: true }
  },

  // Catalog Intelligence Components (8 components)
  'contextual-recommendations': {
    component: ContextualRecommendations,
    title: 'Contextual Recommendations',
    description: 'AI-powered contextual data asset recommendations',
    category: 'AI Recommendations',
    icon: Lightbulb,
    permissions: ['recommendations:read'],
    dependencies: ['catalog-recommendation-service', 'catalog-ai-service'],
    config: { enableContextualAI: true }
  },
  'data-lineage-visualizer': {
    component: DataLineageVisualizer,
    title: 'Data Lineage Visualizer',
    description: 'Advanced interactive data lineage visualization',
    category: 'Lineage Visualization',
    icon: Network,
    permissions: ['lineage:read'],
    dependencies: ['advanced-lineage-service'],
    config: { enableInteractiveVisualization: true, renderEngine: '3D' }
  },
  'intelligent-catalog-viewer': {
    component: IntelligentCatalogViewer,
    title: 'Intelligent Catalog Viewer',
    description: 'AI-enhanced catalog viewer with intelligent insights',
    category: 'Intelligent Viewing',
    icon: Eye,
    permissions: ['catalog:read'],
    dependencies: ['enterprise-catalog-service', 'catalog-ai-service'],
    config: { enableAIInsights: true }
  },
  'relationship-mapper': {
    component: RelationshipMapper,
    title: 'Relationship Mapper',
    description: 'Map and analyze relationships between data assets',
    category: 'Relationship Analysis',
    icon: Map,
    permissions: ['analysis:read'],
    dependencies: ['catalog-ai-service'],
    config: { enableSemanticMapping: true }
  },
  'semantic-search-engine': {
    component: SemanticSearchEngine,
    title: 'Semantic Search Engine',
    description: 'Advanced semantic search with AI understanding',
    category: 'Semantic Search',
    icon: Search,
    permissions: ['search:read'],
    dependencies: ['semantic-search-service', 'catalog-ai-service'],
    config: { enableSemanticUnderstanding: true }
  },
  'similarity-analyzer': {
    component: SimilarityAnalyzer,
    title: 'Similarity Analyzer',
    description: 'Analyze similarities between data assets using AI',
    category: 'Similarity Analysis',
    icon: GitBranch,
    permissions: ['analysis:read'],
    dependencies: ['catalog-ai-service'],
    config: { enableDeepSimilarity: true }
  },
  'smart-tagging-engine': {
    component: SmartTaggingEngine,
    title: 'Smart Tagging Engine',
    description: 'Automatically tag data assets using machine learning',
    category: 'Smart Tagging',
    icon: Tag,
    permissions: ['tagging:read', 'tagging:write'],
    dependencies: ['catalog-ai-service'],
    config: { enableMLTagging: true, confidenceThreshold: 0.75 }
  },
  'usage-pattern-analyzer': {
    component: UsagePatternAnalyzer,
    title: 'Usage Pattern Analyzer',
    description: 'Analyze data usage patterns and behaviors',
    category: 'Usage Analysis',
    icon: Activity,
    permissions: ['analytics:read'],
    dependencies: ['catalog-analytics-service'],
    config: { enablePatternPrediction: true }
  }
};

const NAVIGATION_STRUCTURE: NavigationItem[] = [
  {
    id: 'home',
    title: 'Home',
    icon: Layout,
    route: '/catalog',
    component: 'dashboard',
    permissions: ['catalog:read']
  },
  {
    id: 'search',
    title: 'Search & Discovery',
    icon: Search,
    route: '/catalog/search',
    component: 'unified-search-interface',
    permissions: ['search:read'],
    children: [
      {
        id: 'unified-search',
        title: 'Unified Search',
        icon: Search,
        route: '/catalog/search/unified',
        component: 'unified-search-interface',
        permissions: ['search:read']
      },
      {
        id: 'natural-language',
        title: 'Natural Language Query',
        icon: MessageSquare,
        route: '/catalog/search/natural-language',
        component: 'natural-language-query',
        permissions: ['search:read'],
        isNew: true
      },
      {
        id: 'advanced-filtering',
        title: 'Advanced Filtering',
        icon: Filter,
        route: '/catalog/search/filtering',
        component: 'advanced-filtering',
        permissions: ['search:read']
      },
      {
        id: 'saved-searches',
        title: 'Saved Searches',
        icon: Bookmark,
        route: '/catalog/search/saved',
        component: 'saved-searches',
        permissions: ['search:read']
      },
      {
        id: 'search-personalization',
        title: 'Personalization',
        icon: User,
        route: '/catalog/search/personalization',
        component: 'search-personalization',
        permissions: ['search:read']
      },
      {
        id: 'search-recommendations',
        title: 'Recommendations',
        icon: Lightbulb,
        route: '/catalog/search/recommendations',
        component: 'search-recommendations',
        permissions: ['search:read']
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    icon: BarChart3,
    route: '/catalog/analytics',
    component: 'usage-analytics-dashboard',
    permissions: ['analytics:read'],
    children: [
      {
        id: 'usage-analytics',
        title: 'Usage Analytics',
        icon: BarChart3,
        route: '/catalog/analytics/usage',
        component: 'usage-analytics-dashboard',
        permissions: ['analytics:read']
      },
      {
        id: 'predictive-insights',
        title: 'Predictive Insights',
        icon: Brain,
        route: '/catalog/analytics/predictive',
        component: 'predictive-insights',
        permissions: ['insights:read'],
        isNew: true
      },
      {
        id: 'trend-analysis',
        title: 'Trend Analysis',
        icon: TrendingUp,
        route: '/catalog/analytics/trends',
        component: 'trend-analysis-dashboard',
        permissions: ['trends:read']
      },
      {
        id: 'catalog-metrics',
        title: 'Catalog Metrics',
        icon: Target,
        route: '/catalog/analytics/metrics',
        component: 'catalog-metrics-center',
        permissions: ['metrics:read']
      },
      {
        id: 'popularity-analysis',
        title: 'Popularity Analysis',
        icon: Star,
        route: '/catalog/analytics/popularity',
        component: 'popularity-analyzer',
        permissions: ['analytics:read']
      },
      {
        id: 'search-analytics',
        title: 'Search Analytics',
        icon: Activity,
        route: '/catalog/analytics/search',
        component: 'search-analytics',
        permissions: ['analytics:read']
      }
    ]
  },
  {
    id: 'quality',
    title: 'Data Quality',
    icon: Gauge,
    route: '/catalog/quality',
    component: 'data-quality-dashboard',
    permissions: ['quality:read'],
    children: [
      {
        id: 'data-quality-dashboard',
        title: 'Quality Dashboard',
        icon: Gauge,
        route: '/catalog/quality/dashboard',
        component: 'data-quality-dashboard',
        permissions: ['quality:read']
      },
      {
        id: 'data-profiler',
        title: 'Data Profiler',
        icon: Scan,
        route: '/catalog/quality/profiler',
        component: 'data-profiler',
        permissions: ['profiling:read']
      },
      {
        id: 'anomaly-detector',
        title: 'Anomaly Detector',
        icon: AlertTriangle,
        route: '/catalog/quality/anomaly',
        component: 'anomaly-detector',
        permissions: ['quality:read'],
        isNew: true
      },
      {
        id: 'data-health-monitor',
        title: 'Health Monitor',
        icon: Heart,
        route: '/catalog/quality/health',
        component: 'data-health-monitor',
        permissions: ['quality:read']
      },
      {
        id: 'quality-rules-engine',
        title: 'Quality Rules',
        icon: Cog,
        route: '/catalog/quality/rules',
        component: 'quality-rules-engine',
        permissions: ['rules:read', 'rules:write']
      },
      {
        id: 'data-validation-framework',
        title: 'Validation Framework',
        icon: CheckCircle,
        route: '/catalog/quality/validation',
        component: 'data-validation-framework',
        permissions: ['validation:read']
      },
      {
        id: 'quality-metrics-calculator',
        title: 'Metrics Calculator',
        icon: Calculator,
        route: '/catalog/quality/metrics',
        component: 'quality-metrics-calculator',
        permissions: ['metrics:read']
      },
      {
        id: 'quality-report-generator',
        title: 'Report Generator',
        icon: FileText,
        route: '/catalog/quality/reports',
        component: 'quality-report-generator',
        permissions: ['reporting:read']
      },
      {
        id: 'quality-trends-analyzer',
        title: 'Trends Analyzer',
        icon: TrendingUp,
        route: '/catalog/quality/trends',
        component: 'quality-trends-analyzer',
        permissions: ['analysis:read']
      }
    ]
  },
  {
    id: 'lineage',
    title: 'Data Lineage',
    icon: Network,
    route: '/catalog/lineage',
    component: 'lineage-visualization-engine',
    permissions: ['lineage:read'],
    children: [
      {
        id: 'lineage-visualization-engine',
        title: 'Lineage Visualization',
        icon: Network,
        route: '/catalog/lineage/visualization',
        component: 'lineage-visualization-engine',
        permissions: ['lineage:read']
      },
      {
        id: 'change-impact-analyzer',
        title: 'Change Impact Analyzer',
        icon: Target,
        route: '/catalog/lineage/impact',
        component: 'change-impact-analyzer',
        permissions: ['analysis:read']
      },
      {
        id: 'dependency-resolver',
        title: 'Dependency Resolver',
        icon: GitBranch,
        route: '/catalog/lineage/dependencies',
        component: 'dependency-resolver',
        permissions: ['lineage:read']
      },
      {
        id: 'impact-analysis-viewer',
        title: 'Impact Analysis Viewer',
        icon: Eye,
        route: '/catalog/lineage/analysis',
        component: 'impact-analysis-viewer',
        permissions: ['analysis:read']
      },
      {
        id: 'lineage-governance',
        title: 'Lineage Governance',
        icon: Shield,
        route: '/catalog/lineage/governance',
        component: 'lineage-governance',
        permissions: ['governance:read']
      },
      {
        id: 'lineage-reporting',
        title: 'Lineage Reporting',
        icon: FileText,
        route: '/catalog/lineage/reporting',
        component: 'lineage-reporting',
        permissions: ['reporting:read']
      },
      {
        id: 'lineage-tracking-system',
        title: 'Tracking System',
        icon: Activity,
        route: '/catalog/lineage/tracking',
        component: 'lineage-tracking-system',
        permissions: ['lineage:read']
      }
    ]
  },
  {
    id: 'discovery',
    title: 'Intelligent Discovery',
    icon: Brain,
    route: '/catalog/discovery',
    component: 'ai-discovery-engine',
    permissions: ['discovery:read'],
    isNew: true,
    children: [
      {
        id: 'ai-discovery-engine',
        title: 'AI Discovery Engine',
        icon: Bot,
        route: '/catalog/discovery/ai',
        component: 'ai-discovery-engine',
        permissions: ['discovery:read'],
        isNew: true
      },
      {
        id: 'auto-classification-engine',
        title: 'Auto Classification',
        icon: Tag,
        route: '/catalog/discovery/classification',
        component: 'auto-classification-engine',
        permissions: ['classification:read']
      },
      {
        id: 'data-profiling-engine',
        title: 'Profiling Engine',
        icon: Scan,
        route: '/catalog/discovery/profiling',
        component: 'data-profiling-engine',
        permissions: ['profiling:read']
      },
      {
        id: 'data-source-integrator',
        title: 'Source Integrator',
        icon: Database,
        route: '/catalog/discovery/integration',
        component: 'data-source-integrator',
        permissions: ['integration:read']
      },
      {
        id: 'incremental-discovery',
        title: 'Incremental Discovery',
        icon: RefreshCw,
        route: '/catalog/discovery/incremental',
        component: 'incremental-discovery',
        permissions: ['discovery:read']
      },
      {
        id: 'metadata-enrichment-engine',
        title: 'Metadata Enrichment',
        icon: Sparkles,
        route: '/catalog/discovery/enrichment',
        component: 'metadata-enrichment-engine',
        permissions: ['metadata:write']
      },
      {
        id: 'schema-evolution-tracker',
        title: 'Schema Evolution',
        icon: GitBranch,
        route: '/catalog/discovery/schema',
        component: 'schema-evolution-tracker',
        permissions: ['schema:read']
      },
      {
        id: 'semantic-schema-analyzer',
        title: 'Schema Analyzer',
        icon: Brain,
        route: '/catalog/discovery/semantic',
        component: 'semantic-schema-analyzer',
        permissions: ['analysis:read']
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Users,
    route: '/catalog/collaboration',
    component: 'catalog-collaboration-hub',
    permissions: ['collaboration:read'],
    children: [
      {
        id: 'catalog-collaboration-hub',
        title: 'Collaboration Hub',
        icon: Users,
        route: '/catalog/collaboration/hub',
        component: 'catalog-collaboration-hub',
        permissions: ['collaboration:read']
      },
      {
        id: 'annotation-manager',
        title: 'Annotation Manager',
        icon: MessageSquare,
        route: '/catalog/collaboration/annotations',
        component: 'annotation-manager',
        permissions: ['collaboration:read']
      },
      {
        id: 'community-forum',
        title: 'Community Forum',
        icon: MessageSquare,
        route: '/catalog/collaboration/forum',
        component: 'community-forum',
        permissions: ['forum:read']
      },
      {
        id: 'crowdsourcing-platform',
        title: 'Crowdsourcing',
        icon: Users,
        route: '/catalog/collaboration/crowdsourcing',
        component: 'crowdsourcing-platform',
        permissions: ['crowdsourcing:read']
      },
      {
        id: 'data-stewardship-center',
        title: 'Stewardship Center',
        icon: Shield,
        route: '/catalog/collaboration/stewardship',
        component: 'data-stewardship-center',
        permissions: ['stewardship:read']
      },
      {
        id: 'expert-networking',
        title: 'Expert Networking',
        icon: UserPlus,
        route: '/catalog/collaboration/experts',
        component: 'expert-networking',
        permissions: ['networking:read']
      },
      {
        id: 'knowledge-base',
        title: 'Knowledge Base',
        icon: BookOpen,
        route: '/catalog/collaboration/knowledge',
        component: 'knowledge-base',
        permissions: ['knowledge:read']
      },
      {
        id: 'review-workflow-engine',
        title: 'Review Workflow',
        icon: Workflow,
        route: '/catalog/collaboration/workflow',
        component: 'review-workflow-engine',
        permissions: ['workflow:read']
      }
    ]
  },
  {
    id: 'intelligence',
    title: 'Catalog Intelligence',
    icon: Lightbulb,
    route: '/catalog/intelligence',
    component: 'intelligent-catalog-viewer',
    permissions: ['intelligence:read'],
    isNew: true,
    children: [
      {
        id: 'intelligent-catalog-viewer',
        title: 'Intelligent Viewer',
        icon: Eye,
        route: '/catalog/intelligence/viewer',
        component: 'intelligent-catalog-viewer',
        permissions: ['catalog:read']
      },
      {
        id: 'contextual-recommendations',
        title: 'Contextual Recommendations',
        icon: Lightbulb,
        route: '/catalog/intelligence/recommendations',
        component: 'contextual-recommendations',
        permissions: ['recommendations:read']
      },
      {
        id: 'data-lineage-visualizer',
        title: 'Lineage Visualizer',
        icon: Network,
        route: '/catalog/intelligence/lineage',
        component: 'data-lineage-visualizer',
        permissions: ['lineage:read']
      },
      {
        id: 'relationship-mapper',
        title: 'Relationship Mapper',
        icon: Map,
        route: '/catalog/intelligence/relationships',
        component: 'relationship-mapper',
        permissions: ['analysis:read']
      },
      {
        id: 'semantic-search-engine',
        title: 'Semantic Search',
        icon: Search,
        route: '/catalog/intelligence/semantic',
        component: 'semantic-search-engine',
        permissions: ['search:read']
      },
      {
        id: 'similarity-analyzer',
        title: 'Similarity Analyzer',
        icon: GitBranch,
        route: '/catalog/intelligence/similarity',
        component: 'similarity-analyzer',
        permissions: ['analysis:read']
      },
      {
        id: 'smart-tagging-engine',
        title: 'Smart Tagging',
        icon: Tag,
        route: '/catalog/intelligence/tagging',
        component: 'smart-tagging-engine',
        permissions: ['tagging:read']
      },
      {
        id: 'usage-pattern-analyzer',
        title: 'Usage Patterns',
        icon: Activity,
        route: '/catalog/intelligence/patterns',
        component: 'usage-pattern-analyzer',
        permissions: ['analytics:read']
      }
    ]
  },
  {
    id: 'management',
    title: 'Management',
    icon: Settings,
    route: '/catalog/management',
    component: 'business-glossary-manager',
    permissions: ['management:read'],
    children: [
      {
        id: 'business-glossary',
        title: 'Business Glossary',
        icon: BookOpen,
        route: '/catalog/management/glossary',
        component: 'business-glossary-manager',
        permissions: ['glossary:read']
      },
      {
        id: 'data-governance',
        title: 'Data Governance',
        icon: Shield,
        route: '/catalog/management/governance',
        component: 'data-governance-center',
        permissions: ['governance:read']
      },
      {
        id: 'access-control',
        title: 'Access Control',
        icon: Lock,
        route: '/catalog/management/access',
        component: 'access-control-manager',
        permissions: ['access:admin']
      }
    ]
  }
];

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Something went wrong</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            An error occurred while loading this component. Please try again.
          </p>
          <details className="text-xs">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SPA COMPONENT
// ============================================================================

const AdvancedCatalogSPA: React.FC<AdvancedCatalogSPAProps> = ({
  userId = 'current_user',
  organizationId = 'default_org',
  theme = 'system',
  onNavigate,
  onError,
  onStateChange
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  // RBAC Integration - Enterprise Security & Access Control
  const rbac = useCatalogRBAC();
  
  // Workflow Orchestration - Enterprise Workflow Management
  const workflowOrchestrator = useCatalogWorkflowOrchestrator();

  // Core Hooks with RBAC integration
  const analyticsHook = useCatalogAnalytics({
    userId,
    enableRealTimeUpdates: true && rbac.canViewAnalyticsDashboards()
  });

  const discoveryHook = useCatalogDiscovery({
    userId,
    enableRealTimeUpdates: true && rbac.canViewDiscoveryResults()
  });

  const lineageHook = useCatalogLineage({
    userId,
    enableRealTimeUpdates: true && rbac.canViewLineage()
  });

  const collaborationHook = useCatalogCollaboration({
    userId,
    enableRealTimeUpdates: true && rbac.canComment()
  });

  const recommendationsHook = useCatalogRecommendations({
    userId,
    enableRealTimeUpdates: true && rbac.canPerformAISearch()
  });

  const profilingHook = useCatalogProfiling({
    userId,
    enableRealTimeUpdates: true && rbac.canViewQualityMetrics()
  });

  const aiHook = useCatalogAI({
    userId,
    enableRealTimeUpdates: true && rbac.canPerformAISearch()
  });

  // Authentication Check
  if (!rbac.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96 p-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please log in to access the Advanced Catalog System
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main State
  const [catalogState, setCatalogState] = useState<CatalogState>({
    currentRoute: '/catalog',
    activeComponent: 'dashboard',
    breadcrumbs: [
      { title: 'Catalog', href: '/catalog' }
    ],
    searchContext: {
      query: '',
      filters: [],
      results: [],
      totalResults: 0,
      facets: [],
      suggestions: [],
      isLoading: false,
      lastSearchTime: new Date()
    },
    userPreferences: {
      theme: theme,
      language: 'en',
      timezone: 'UTC',
      dashboardLayout: {
        layout: 'grid',
        columns: 3,
        density: 'comfortable',
        widgets: []
      },
      notificationSettings: {
        enablePush: true,
        enableEmail: true,
        enableInApp: true,
        frequency: 'realtime',
        categories: ['system', 'collaboration', 'quality']
      },
      privacySettings: {
        showActivity: true,
        allowAnalytics: true,
        shareUsageData: false,
        publicProfile: false
      },
      accessibilitySettings: {
        highContrast: false,
        reducedMotion: false,
        fontSize: 'medium',
        screenReader: false,
        keyboardNavigation: true
      }
    },
    workflowState: {
      activeWorkflows: workflowOrchestrator.activeWorkflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        steps: workflow.steps.map(step => ({
          id: step.id,
          name: step.name,
          status: step.status,
          component: step.type,
          startTime: step.startTime,
          endTime: step.endTime,
          duration: step.duration,
          dependencies: step.dependencies || [],
          outputs: []
        })),
        progress: workflow.overallProgress,
        startTime: workflow.startTime,
        endTime: workflow.endTime,
        createdBy: workflow.createdBy,
        assignedTo: workflow.assignedTo,
        metadata: workflow.context
      })),
      completedTasks: workflowOrchestrator.workflows.reduce((acc, w) => 
        acc + w.steps.filter(s => s.status === 'completed').length, 0),
      pendingTasks: workflowOrchestrator.workflows.reduce((acc, w) => 
        acc + w.steps.filter(s => s.status === 'pending').length, 0),
      workflowTemplates: workflowOrchestrator.workflowTemplates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        steps: template.steps.map(step => ({
          id: step.name,
          name: step.name,
          type: step.type,
          description: '',
          config: step.metadata || {},
          inputs: [],
          outputs: []
        })),
        triggers: [{
          type: 'manual',
          config: {},
          isEnabled: true
        }],
        isPublic: true,
        isVerified: true,
        version: '1.0',
        tags: template.tags,
        author: 'System',
        usageCount: 0
      })),
      automationRules: []
    },
    collaborationState: {
      activeSessions: [],
      sharedAssets: [],
      teamMembers: [],
      discussions: [],
      announcements: []
    },
    systemHealth: {
      status: 'healthy',
      uptime: 99.9,
      responseTime: 120,
      errorRate: 0.01,
      throughput: 1250,
      services: [],
      alerts: []
    },
    notifications: [],
    recentActivity: [],
    orchestrationState: {
      activeOrchestrations: workflowOrchestrator.activeWorkflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        components: workflow.steps.map(step => step.name),
        orchestrationType: 'SEQUENTIAL' as const,
        triggerConditions: [],
        dataMapping: [],
        status: workflow.status === 'active' ? 'RUNNING' as const : 
               workflow.status === 'completed' ? 'COMPLETED' as const :
               workflow.status === 'failed' ? 'FAILED' as const :
               workflow.status === 'paused' ? 'PAUSED' as const : 'IDLE' as const,
        progress: workflow.overallProgress,
        startTime: workflow.startTime,
        endTime: workflow.endTime,
        results: []
      })),
      componentDependencies: {
        nodes: Object.keys(COMPONENT_REGISTRY)
          .filter(componentId => COMPONENT_REGISTRY[componentId].permissions.every(permission => 
            rbac.userPermissions.includes(permission)
          ))
          .map(componentId => ({
            id: componentId,
            componentId,
            title: COMPONENT_REGISTRY[componentId].title,
            category: COMPONENT_REGISTRY[componentId].category,
          dependencies: COMPONENT_REGISTRY[componentId].dependencies,
          dependents: [],
          status: 'IDLE' as ComponentStatus,
          dataOutputs: [],
          dataInputs: []
        })),
        edges: [],
        clusters: [
          {
            id: 'analytics-cluster',
            name: 'Analytics Components',
            components: Object.keys(COMPONENT_REGISTRY).filter(id => COMPONENT_REGISTRY[id].category === 'Analytics'),
            type: 'FUNCTIONAL',
            optimization: { strategy: 'PERFORMANCE', priority: 'HIGH' }
          },
          {
            id: 'search-cluster',
            name: 'Search Components',
            components: Object.keys(COMPONENT_REGISTRY).filter(id => COMPONENT_REGISTRY[id].category === 'Search'),
            type: 'FUNCTIONAL',
            optimization: { strategy: 'LATENCY', priority: 'HIGH' }
          },
          {
            id: 'quality-cluster',
            name: 'Quality Components',
            components: Object.keys(COMPONENT_REGISTRY).filter(id => COMPONENT_REGISTRY[id].category.includes('Quality')),
            type: 'FUNCTIONAL',
            optimization: { strategy: 'ACCURACY', priority: 'MEDIUM' }
          },
          {
            id: 'lineage-cluster',
            name: 'Lineage Components',
            components: Object.keys(COMPONENT_REGISTRY).filter(id => COMPONENT_REGISTRY[id].category === 'Lineage'),
            type: 'FUNCTIONAL',
            optimization: { strategy: 'CONSISTENCY', priority: 'HIGH' }
          },
          {
            id: 'intelligence-cluster',
            name: 'AI Intelligence Components',
            components: Object.keys(COMPONENT_REGISTRY).filter(id => COMPONENT_REGISTRY[id].category.includes('AI') || COMPONENT_REGISTRY[id].category.includes('Intelligence')),
            type: 'FUNCTIONAL',
            optimization: { strategy: 'AI_OPTIMIZATION', priority: 'HIGH' }
          },
          {
            id: 'collaboration-cluster',
            name: 'Collaboration Components',
            components: Object.keys(COMPONENT_REGISTRY).filter(id => COMPONENT_REGISTRY[id].category.includes('Collaboration')),
            type: 'FUNCTIONAL',
            optimization: { strategy: 'REAL_TIME', priority: 'MEDIUM' }
          }
        ]
      },
      dataFlows: [],
      workflowChains: [
        {
          id: 'data-discovery-chain',
          name: 'Complete Data Discovery Workflow',
          description: 'End-to-end data discovery, profiling, and cataloging',
          steps: [
            { id: 'step1', componentId: 'ai-discovery-engine', operation: 'discover', parameters: {}, conditions: [], timeout: 30000, retryPolicy: { maxRetries: 3 }, rollbackStrategy: { type: 'COMPENSATE' } },
            { id: 'step2', componentId: 'data-profiling-engine', operation: 'profile', parameters: {}, conditions: [], timeout: 60000, retryPolicy: { maxRetries: 2 }, rollbackStrategy: { type: 'ROLLBACK' } },
            { id: 'step3', componentId: 'auto-classification-engine', operation: 'classify', parameters: {}, conditions: [], timeout: 45000, retryPolicy: { maxRetries: 3 }, rollbackStrategy: { type: 'COMPENSATE' } },
            { id: 'step4', componentId: 'metadata-enrichment-engine', operation: 'enrich', parameters: {}, conditions: [], timeout: 30000, retryPolicy: { maxRetries: 2 }, rollbackStrategy: { type: 'ROLLBACK' } }
          ],
          branchingLogic: [],
          errorHandling: { strategy: 'GRACEFUL_DEGRADATION', fallbackActions: [] },
          optimization: { type: 'PERFORMANCE', parameters: {} },
          performance: { averageExecutionTime: 0, successRate: 0 }
        },
        {
          id: 'quality-assessment-chain',
          name: 'Data Quality Assessment Workflow',
          description: 'Comprehensive data quality analysis and reporting',
          steps: [
            { id: 'step1', componentId: 'data-quality-dashboard', operation: 'analyze', parameters: {}, conditions: [], timeout: 30000, retryPolicy: { maxRetries: 2 }, rollbackStrategy: { type: 'COMPENSATE' } },
            { id: 'step2', componentId: 'anomaly-detector', operation: 'detect', parameters: {}, conditions: [], timeout: 45000, retryPolicy: { maxRetries: 3 }, rollbackStrategy: { type: 'ROLLBACK' } },
            { id: 'step3', componentId: 'quality-metrics-calculator', operation: 'calculate', parameters: {}, conditions: [], timeout: 30000, retryPolicy: { maxRetries: 2 }, rollbackStrategy: { type: 'COMPENSATE' } },
            { id: 'step4', componentId: 'quality-report-generator', operation: 'generate', parameters: {}, conditions: [], timeout: 60000, retryPolicy: { maxRetries: 2 }, rollbackStrategy: { type: 'ROLLBACK' } }
          ],
          branchingLogic: [],
          errorHandling: { strategy: 'FAIL_FAST', fallbackActions: [] },
          optimization: { type: 'ACCURACY', parameters: {} },
          performance: { averageExecutionTime: 0, successRate: 0 }
        }
      ],
      intelligentRouting: {
        routingRules: [
          { id: 'search-rule', condition: 'route.startsWith("/catalog/search")', targetComponent: 'unified-search-interface', priority: 100, weight: 1.0, metadata: {} },
          { id: 'analytics-rule', condition: 'route.startsWith("/catalog/analytics")', targetComponent: 'usage-analytics-dashboard', priority: 90, weight: 1.0, metadata: {} },
          { id: 'quality-rule', condition: 'route.startsWith("/catalog/quality")', targetComponent: 'data-quality-dashboard', priority: 90, weight: 1.0, metadata: {} }
        ],
        adaptiveRouting: { enabled: true, learningRate: 0.1, adaptationThreshold: 0.8 },
        loadBalancing: { strategy: 'PERFORMANCE_BASED', weights: {} },
        failoverStrategies: [
          { componentId: 'any', fallbackComponent: 'dashboard', condition: 'error_rate > 0.5', priority: 1 }
        ],
        performanceOptimization: { enabled: true, autoTuning: true, optimizationGoals: ['LATENCY', 'THROUGHPUT'] }
      },
      realTimeSync: {
        syncedComponents: [],
        syncFrequency: 5000,
        conflictResolution: { strategy: 'LAST_WRITE_WINS', customRules: [] },
        eventBus: { isActive: true, eventQueue: [], subscribers: [] },
        stateConsistency: { enabled: true, checkInterval: 10000, lastCheck: new Date() }
      },
      performanceMetrics: {
        totalOrchestrations: 0,
        successfulOrchestrations: 0,
        failedOrchestrations: 0,
        averageExecutionTime: 0,
        throughput: 0,
        componentUtilization: {},
        resourceUsage: { cpu: 0, memory: 0, network: 0 }
      }
    },
    componentInteractions: {
      interactions: [],
      communicationProtocols: [
        { id: 'http-rest', name: 'HTTP REST API', type: 'SYNCHRONOUS', latency: 100, reliability: 0.99 },
        { id: 'websocket', name: 'WebSocket', type: 'REAL_TIME', latency: 10, reliability: 0.95 },
        { id: 'event-stream', name: 'Server-Sent Events', type: 'STREAMING', latency: 50, reliability: 0.97 }
      ],
      messageQueues: [],
      eventSubscriptions: [],
      sharedStates: []
    },
    intelligentWorkflows: [
      {
        id: 'adaptive-search-workflow',
        name: 'Adaptive Search Optimization',
        description: 'AI-powered search result optimization based on user behavior',
        aiModel: 'search-optimization-model-v2',
        learningCapabilities: [
          {
            type: 'PATTERN_RECOGNITION',
            accuracy: 0.87,
            confidence: 0.92,
            trainingData: { size: 100000, quality: 'HIGH', lastUpdated: new Date() },
            lastTrainingTime: new Date()
          }
        ],
        adaptiveParameters: [],
        optimizationGoals: [
          { metric: 'search_relevance', target: 0.95, weight: 0.6 },
          { metric: 'response_time', target: 200, weight: 0.4 }
        ],
        performanceHistory: [],
        recommendations: []
      }
    ],
    crossComponentData: {
      sharedDatasets: [],
      crossReferences: [],
      globalFilters: [],
      unifiedSearch: {
        indexedComponents: Object.keys(COMPONENT_REGISTRY),
        searchableFields: ['title', 'description', 'category', 'permissions'],
        lastIndexUpdate: new Date(),
        searchStatistics: { totalQueries: 0, averageResponseTime: 0 }
      },
      masterCatalog: {
        unifiedView: {
          totalAssets: 0,
          categorizedAssets: {},
          lastSync: new Date(),
          consistency: 'STRONG'
        },
        crossComponentSearch: {
          enabled: true,
          federatedResults: true,
          resultAggregation: 'RELEVANCE_BASED'
        },
        globalMetadata: {
          schemas: [],
          taxonomies: [],
          classifications: [],
          lastUpdate: new Date()
        },
        federatedQueries: [],
        masterDataModel: {
          entities: [],
          relationships: [],
          constraints: [],
          version: '1.0.0'
        }
      }
    }
  });

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkflowPanelOpen, setIsWorkflowPanelOpen] = useState(false);
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] = useState(false);
  const [isOrchestrationPanelOpen, setIsOrchestrationPanelOpen] = useState(false);
  const [activeOrchestration, setActiveOrchestration] = useState<string | null>(null);

  // Component State
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set());
  const [errorComponents, setErrorComponents] = useState<Set<string>>(new Set());
  
  // Workflow orchestration state
  const [currentWorkflow, setCurrentWorkflow] = useState<typeof workflowOrchestrator.currentWorkflow>(null);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeNavigationItem = useMemo(() => {
    return findNavigationItemByRoute(NAVIGATION_STRUCTURE, catalogState.currentRoute);
  }, [catalogState.currentRoute]);

  const currentComponent = useMemo(() => {
    return COMPONENT_REGISTRY[catalogState.activeComponent];
  }, [catalogState.activeComponent]);

  const unreadNotificationsCount = useMemo(() => {
    return catalogState.notifications.filter(n => !n.isRead).length;
  }, [catalogState.notifications]);

  const systemHealthColor = useMemo(() => {
    switch (catalogState.systemHealth.status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'maintenance': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }, [catalogState.systemHealth.status]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function findNavigationItemByRoute(items: NavigationItem[], route: string): NavigationItem | null {
    for (const item of items) {
      if (item.route === route) return item;
      if (item.children) {
        const found = findNavigationItemByRoute(item.children, route);
        if (found) return found;
      }
    }
    return null;
  }

  function generateBreadcrumbs(route: string): BreadcrumbItem[] {
    const parts = route.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    for (const part of parts) {
      currentPath += `/${part}`;
      const item = findNavigationItemByRoute(NAVIGATION_STRUCTURE, currentPath);
      if (item) {
        breadcrumbs.push({
          title: item.title,
          href: currentPath
        });
      }
    }

    return breadcrumbs;
  }

  function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}`,
      createdAt: new Date()
    };

    setCatalogState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications]
    }));

    // Show toast for immediate notifications
    if (!notification.isPersistent) {
      toast[notification.type](notification.title, {
        description: notification.message,
        action: notification.action ? {
          label: notification.action.label,
          onClick: notification.action.action
        } : undefined
      });
    }

    // Auto-remove non-persistent notifications
    if (!notification.isPersistent && notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    if (!notification.isPersistent) {
      notificationTimeoutRef.current = setTimeout(() => {
        setCatalogState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== newNotification.id)
        }));
      }, 5000);
    }
  }

  function addActivityItem(activity: Omit<ActivityItem, 'id' | 'timestamp'>) {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity_${Date.now()}`,
      timestamp: new Date()
    };

    setCatalogState(prev => ({
      ...prev,
      recentActivity: [newActivity, ...prev.recentActivity.slice(0, 99)] // Keep last 100 items
    }));
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNavigate = useCallback((route: string, component?: string, context?: any) => {
    const targetComponent = component || findNavigationItemByRoute(NAVIGATION_STRUCTURE, route)?.component || 'dashboard';
    
    setCatalogState(prev => ({
      ...prev,
      currentRoute: route,
      activeComponent: targetComponent,
      breadcrumbs: generateBreadcrumbs(route)
    }));

    addActivityItem({
      type: 'view',
      description: `Navigated to ${route}`,
      userId,
      metadata: { route, component: targetComponent, context }
    });

    onNavigate?.(route, context);
  }, [userId, onNavigate]);

  const handleSearch = useCallback(async (query: string, filters: SearchFilter[] = []) => {
    setCatalogState(prev => ({
      ...prev,
      searchContext: {
        ...prev.searchContext,
        query,
        filters,
        isLoading: true
      }
    }));

    try {
      const searchRequest: SearchRequest = {
        query,
        filters,
        facets: ['type', 'department', 'tags', 'qualityScore'],
        limit: 50,
        offset: 0
      };

      const response = await semanticSearchService.performSemanticSearch(searchRequest);

      setCatalogState(prev => ({
        ...prev,
        searchContext: {
          ...prev.searchContext,
          results: response.results,
          totalResults: response.total,
          facets: response.facets || [],
          suggestions: response.suggestions || [],
          isLoading: false,
          lastSearchTime: new Date()
        }
      }));

      addActivityItem({
        type: 'search',
        description: `Searched for "${query}"`,
        userId,
        metadata: { query, filters, resultCount: response.total }
      });

    } catch (error) {
      console.error('Search error:', error);
      onError?.(error as Error);
      
      setCatalogState(prev => ({
        ...prev,
        searchContext: {
          ...prev.searchContext,
          isLoading: false
        }
      }));

      addNotification({
        type: 'error',
        title: 'Search Error',
        message: 'Failed to perform search. Please try again.',
        isRead: false,
        isPersistent: false
      });
    }
  }, [userId, onError]);

  const handleComponentLoad = useCallback((componentId: string) => {
    setLoadingComponents(prev => new Set(prev).add(componentId));
  }, []);

  const handleComponentReady = useCallback((componentId: string) => {
    setLoadingComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });
    
    setErrorComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });
  }, []);

  const handleComponentError = useCallback((componentId: string, error: Error) => {
    setErrorComponents(prev => new Set(prev).add(componentId));
    setLoadingComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });

    console.error(`Component ${componentId} error:`, error);
    onError?.(error);

    addNotification({
      type: 'error',
      title: 'Component Error',
      message: `Failed to load ${componentId}. Please refresh and try again.`,
      isRead: false,
      isPersistent: true,
      action: {
        label: 'Retry',
        action: () => window.location.reload(),
        type: 'primary'
      }
    });
  }, [onError]);

  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    // Command palette (Cmd/Ctrl + K)
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      setIsCommandPaletteOpen(true);
    }

    // Search focus (Cmd/Ctrl + /)
    if ((event.metaKey || event.ctrlKey) && event.key === '/') {
      event.preventDefault();
      searchInputRef.current?.focus();
    }

    // Sidebar toggle (Cmd/Ctrl + B)
    if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
      event.preventDefault();
      setIsSidebarOpen(prev => !prev);
    }

    // Settings (Cmd/Ctrl + ,)
    if ((event.metaKey || event.ctrlKey) && event.key === ',') {
      event.preventDefault();
      setIsSettingsOpen(true);
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  useEffect(() => {
    onStateChange?.(catalogState);
  }, [catalogState, onStateChange]);

  useEffect(() => {
    // Initialize system health monitoring
    const healthCheckInterval = setInterval(async () => {
      try {
        // Simulate health check
        const healthData = {
          status: 'healthy' as const,
          uptime: 99.9,
          responseTime: Math.random() * 200 + 50,
          errorRate: Math.random() * 0.1,
          throughput: Math.random() * 500 + 1000,
          services: [
            { name: 'Search Service', status: 'healthy' as const, responseTime: 120, errorRate: 0.01, lastCheck: new Date() },
            { name: 'Analytics Service', status: 'healthy' as const, responseTime: 95, errorRate: 0.005, lastCheck: new Date() },
            { name: 'Lineage Service', status: 'healthy' as const, responseTime: 180, errorRate: 0.02, lastCheck: new Date() }
          ],
          alerts: []
        };

        setCatalogState(prev => ({
          ...prev,
          systemHealth: healthData
        }));
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => (
    <SidebarMenuItem key={item.id}>
      <SidebarMenuButton
        onClick={() => handleNavigate(item.route, item.component)}
        isActive={catalogState.currentRoute === item.route}
        className={`w-full justify-start ${level > 0 ? 'pl-6' : ''}`}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto h-5 text-xs">
            {item.badge}
          </Badge>
        )}
        {item.isNew && (
          <Badge variant="default" className="ml-auto h-5 text-xs">
            New
          </Badge>
        )}
      </SidebarMenuButton>
      {item.children && (
        <SidebarMenuSub>
          {item.children.map(child => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton
                onClick={() => handleNavigate(child.route, child.component)}
                isActive={catalogState.currentRoute === child.route}
              >
                <child.icon className="h-4 w-4" />
                <span>{child.title}</span>
                {child.isNew && (
                  <Badge variant="default" className="ml-auto h-4 text-xs">
                    New
                  </Badge>
                )}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );

  const renderCurrentComponent = () => {
    const componentConfig = COMPONENT_REGISTRY[catalogState.activeComponent];
    
    if (!componentConfig) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span>Component Not Found</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                The requested component "{catalogState.activeComponent}" could not be found.
              </p>
              <Button 
                onClick={() => handleNavigate('/catalog', 'dashboard')} 
                className="w-full mt-4"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const Component = componentConfig.component;
    const isLoading = loadingComponents.has(catalogState.activeComponent);
    const hasError = errorComponents.has(catalogState.activeComponent);

    if (hasError) {
      return (
        <ErrorFallback 
          error={new Error(`Failed to load ${componentConfig.title}`)}
          resetErrorBoundary={() => {
            setErrorComponents(prev => {
              const newSet = new Set(prev);
              newSet.delete(catalogState.activeComponent);
              return newSet;
            });
          }}
        />
      );
    }

    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => handleComponentError(catalogState.activeComponent, error)}
        resetKeys={[catalogState.activeComponent]}
      >
        <Suspense fallback={<LoadingSpinner message={`Loading ${componentConfig.title}...`} />}>
          <div className="w-full h-full">
            <Component
              userId={userId}
              organizationId={organizationId}
              searchContext={catalogState.searchContext}
              onSearch={handleSearch}
              onNavigate={handleNavigate}
              onError={onError}
              analyticsData={analyticsHook.data}
              discoveryData={discoveryHook.data}
              lineageData={lineageHook.data}
              collaborationData={collaborationHook.data}
              recommendationsData={recommendationsHook.data}
              profilingData={profilingHook.data}
              aiData={aiHook.data}
              // RBAC Integration - All components now have access to RBAC
              rbac={rbac}
              // Workflow Orchestration - All components can trigger workflows
              workflowOrchestrator={workflowOrchestrator}
              currentWorkflow={currentWorkflow}
              onWorkflowChange={setCurrentWorkflow}
              {...componentConfig.config}
            />
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* User Info and Quick Actions with RBAC */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {rbac.currentUser?.name || 'User'}
          </h2>
          <p className="text-gray-600">
            Role: {rbac.userRoles.length > 0 ? rbac.userRoles.join(', ') : 'No roles assigned'}
          </p>
          <div className="flex gap-2 mt-2">
            {rbac.userRoles.map(role => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role.replace('catalog_', '').replace('_', ' ').toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {rbac.canCreateAsset() && (
            <Button 
              onClick={() => workflowOrchestrator.onboardAsset('new-asset', { quickStart: true })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Asset Onboarding
            </Button>
          )}
          {rbac.canCreateDiscoveryJob() && (
            <Button 
              variant="outline"
              onClick={() => workflowOrchestrator.executeDiscoveryWorkflow(['auto-detect'], { quickScan: true })}
            >
              <Search className="h-4 w-4 mr-2" />
              Quick Discovery
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Orchestration Status */}
      {workflowOrchestrator.activeWorkflows.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Workflow className="h-5 w-5" />
              Active Workflows ({workflowOrchestrator.activeWorkflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowOrchestrator.activeWorkflows.slice(0, 3).map(workflow => (
                <div key={workflow.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{workflow.name}</h4>
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <Progress value={workflow.overallProgress} className="mb-2" />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{workflow.steps.filter(s => s.status === 'completed').length}/{workflow.steps.length} steps</span>
                    <span>{Math.round(workflow.overallProgress)}%</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setCurrentWorkflow(workflow)}
                      className="text-xs"
                    >
                      View Details
                    </Button>
                    {workflow.status === 'active' && rbac.canManageCatalog() && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => workflowOrchestrator.pauseWorkflow(workflow.id)}
                        className="text-xs"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {workflowOrchestrator.activeWorkflows.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View All {workflowOrchestrator.activeWorkflows.length} Workflows
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {analyticsHook.data?.totalAssets?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Search Queries</CardTitle>
            <Search className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {analyticsHook.data?.totalSearches?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-green-600 mt-1">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {collaborationHook.data?.activeUsers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Data Quality</CardTitle>
            <Gauge className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {Math.round(profilingHook.data?.overallQualityScore || 0)}%
            </div>
            <Progress value={profilingHook.data?.overallQualityScore || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleNavigate('/catalog/search/unified', 'unified-search-interface')}
            >
              <Search className="h-6 w-6" />
              <span className="text-sm">Search Assets</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleNavigate('/catalog/analytics/usage', 'usage-analytics-dashboard')}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleNavigate('/catalog/quality/profiler', 'data-profiler')}
            >
              <Gauge className="h-6 w-6" />
              <span className="text-sm">Data Quality</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleNavigate('/catalog/lineage/viewer', 'advanced-lineage-viewer')}
            >
              <Network className="h-6 w-6" />
              <span className="text-sm">Data Lineage</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {catalogState.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="flex-1">{activity.description}</span>
                  <span className="text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {catalogState.recentActivity.length === 0 && (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={isSidebarOpen}>
        <div className="min-h-screen flex w-full bg-gray-50">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Advanced Catalog</h2>
                  <p className="text-xs text-gray-600">Data Governance Platform</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {NAVIGATION_STRUCTURE.map(item => renderNavigationItem(item))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>System Status</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Health</span>
                      <Badge variant={catalogState.systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                        {catalogState.systemHealth.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Response Time</span>
                      <span className="text-gray-600">
                        {Math.round(catalogState.systemHealth.responseTime)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Uptime</span>
                      <span className="text-gray-600">
                        {catalogState.systemHealth.uptime.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.png" />
                    <AvatarFallback>
                      {userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userId}</p>
                    <p className="text-xs text-gray-600">Administrator</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center px-4">
                <div className="flex items-center space-x-4 flex-1">
                  <SidebarTrigger />
                  
                  {/* Breadcrumbs */}
                  <Separator orientation="vertical" className="h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      {catalogState.breadcrumbs.map((item, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            {index === catalogState.breadcrumbs.length - 1 ? (
                              <BreadcrumbPage>{item.title}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink href={item.href}>
                                {item.title}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {index < catalogState.breadcrumbs.length - 1 && (
                            <BreadcrumbSeparator />
                          )}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                  {/* Global Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search assets..."
                      className="w-64 pl-10"
                      value={catalogState.searchContext.query}
                      onChange={(e) => {
                        setCatalogState(prev => ({
                          ...prev,
                          searchContext: {
                            ...prev.searchContext,
                            query: e.target.value
                          }
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(catalogState.searchContext.query);
                        }
                      }}
                    />
                  </div>

                  {/* Command Palette */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="hidden md:flex"
                  >
                    <CommandIcon className="h-4 w-4 mr-2" />
                    <span className="text-xs">⌘K</span>
                  </Button>

                  {/* Notifications */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadNotificationsCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0">
                        {unreadNotificationsCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Workflow Panel */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWorkflowPanelOpen(true)}
                  >
                    <Workflow className="h-4 w-4" />
                  </Button>

                  {/* Collaboration Panel */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCollaborationPanelOpen(true)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>

                  {/* Orchestration Panel */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOrchestrationPanelOpen(true)}
                    className="relative"
                  >
                    <Network className="h-4 w-4" />
                    {catalogState.orchestrationState.activeOrchestrations.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0">
                        {catalogState.orchestrationState.activeOrchestrations.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-6">
                {catalogState.activeComponent === 'dashboard' ? 
                  renderDashboard() : 
                  renderCurrentComponent()
                }
              </div>
            </main>
          </SidebarInset>
        </div>

        {/* Command Palette */}
        <CommandDialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {NAVIGATION_STRUCTURE.map(item => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    handleNavigate(item.route, item.component);
                    setIsCommandPaletteOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Open Settings</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setIsSidebarOpen(prev => !prev)}>
                <SidebarIcon className="mr-2 h-4 w-4" />
                <span>Toggle Sidebar</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Notifications Panel */}
        <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                Stay updated with system alerts and activities
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-full mt-6">
              <div className="space-y-4">
                {catalogState.notifications.map((notification) => (
                  <Card key={notification.id} className={`${!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{notification.title}</CardTitle>
                        <Badge variant={
                          notification.type === 'error' ? 'destructive' :
                          notification.type === 'warning' ? 'secondary' :
                          notification.type === 'success' ? 'default' :
                          'outline'
                        }>
                          {notification.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.createdAt.toLocaleString()}
                      </p>
                      {notification.action && (
                        <Button 
                          size="sm" 
                          className="mt-2"
                          variant={notification.action.type === 'primary' ? 'default' : 'outline'}
                          onClick={notification.action.action}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {catalogState.notifications.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No notifications</p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Configure your catalog preferences and system settings
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="general" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={catalogState.userPreferences.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={catalogState.userPreferences.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={catalogState.userPreferences.theme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select value={catalogState.userPreferences.accessibilitySettings.fontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="high-contrast"
                    checked={catalogState.userPreferences.accessibilitySettings.highContrast}
                  />
                  <Label htmlFor="high-contrast">High Contrast</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="reduced-motion"
                    checked={catalogState.userPreferences.accessibilitySettings.reducedMotion}
                  />
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="push-notifications"
                    checked={catalogState.userPreferences.notificationSettings.enablePush}
                  />
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="email-notifications"
                    checked={catalogState.userPreferences.notificationSettings.enableEmail}
                  />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={catalogState.userPreferences.notificationSettings.frequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-activity"
                    checked={catalogState.userPreferences.privacySettings.showActivity}
                  />
                  <Label htmlFor="show-activity">Show Activity Status</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="allow-analytics"
                    checked={catalogState.userPreferences.privacySettings.allowAnalytics}
                  />
                  <Label htmlFor="allow-analytics">Allow Analytics Collection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="share-usage-data"
                    checked={catalogState.userPreferences.privacySettings.shareUsageData}
                  />
                  <Label htmlFor="share-usage-data">Share Usage Data</Label>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsSettingsOpen(false)}>
                Save Changes
              </Button>
            </DialogFooter>
                     </DialogContent>
         </Dialog>

         {/* Advanced Orchestration Panel */}
         <Sheet open={isOrchestrationPanelOpen} onOpenChange={setIsOrchestrationPanelOpen}>
           <SheetContent className="w-[800px] sm:w-[900px]">
             <SheetHeader>
               <SheetTitle className="flex items-center space-x-2">
                 <Network className="h-5 w-5" />
                 <span>Advanced Component Orchestration</span>
               </SheetTitle>
               <SheetDescription>
                 Intelligent workflow orchestration and component management for all 55 catalog components
               </SheetDescription>
             </SheetHeader>
             
             <Tabs defaultValue="overview" className="mt-6">
               <TabsList className="grid w-full grid-cols-5">
                 <TabsTrigger value="overview">Overview</TabsTrigger>
                 <TabsTrigger value="workflows">Workflows</TabsTrigger>
                 <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                 <TabsTrigger value="performance">Performance</TabsTrigger>
                 <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
               </TabsList>

               {/* Overview Tab */}
               <TabsContent value="overview" className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm">Total Components</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold">{Object.keys(COMPONENT_REGISTRY).length}</div>
                       <p className="text-xs text-gray-500">Across 6 functional clusters</p>
                     </CardContent>
                   </Card>
                   
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm">Active Orchestrations</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold">{catalogState.orchestrationState.activeOrchestrations.length}</div>
                       <p className="text-xs text-gray-500">Running workflows</p>
                     </CardContent>
                   </Card>
                   
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm">System Health</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold text-green-600">{catalogState.systemHealth.uptime.toFixed(1)}%</div>
                       <p className="text-xs text-gray-500">Uptime</p>
                     </CardContent>
                   </Card>
                 </div>

                 <Card>
                   <CardHeader>
                     <CardTitle>Component Clusters</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       {catalogState.orchestrationState.componentDependencies.clusters.map((cluster) => (
                         <div key={cluster.id} className="flex items-center justify-between p-3 border rounded-lg">
                           <div>
                             <h4 className="font-medium">{cluster.name}</h4>
                             <p className="text-sm text-gray-600">{cluster.components.length} components</p>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Badge variant="outline" className="text-xs">{cluster.type}</Badge>
                             <Badge variant={cluster.optimization.priority === 'HIGH' ? 'default' : 'secondary'} className="text-xs">
                               {cluster.optimization.priority}
                             </Badge>
                           </div>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>
               </TabsContent>

               {/* Workflows Tab */}
               <TabsContent value="workflows" className="space-y-4">
                 <div className="flex justify-between items-center">
                   <h3 className="text-lg font-semibold">Intelligent Workflow Chains</h3>
                   <Button size="sm">
                     <Plus className="h-4 w-4 mr-2" />
                     Create Workflow
                   </Button>
                 </div>

                 <div className="space-y-4">
                   {catalogState.orchestrationState.workflowChains.map((workflow) => (
                     <Card key={workflow.id}>
                       <CardHeader>
                         <div className="flex items-center justify-between">
                           <div>
                             <CardTitle className="text-lg">{workflow.name}</CardTitle>
                             <CardDescription>{workflow.description}</CardDescription>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Badge variant="outline">{workflow.steps.length} steps</Badge>
                             <Button size="sm" variant="outline">
                               <Play className="h-4 w-4 mr-2" />
                               Execute
                             </Button>
                           </div>
                         </div>
                       </CardHeader>
                       <CardContent>
                         <div className="space-y-3">
                           <div className="flex items-center space-x-2">
                             {workflow.steps.map((step, index) => (
                               <React.Fragment key={step.id}>
                                 <div className="flex flex-col items-center">
                                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                                     {index + 1}
                                   </div>
                                   <span className="text-xs mt-1 text-center max-w-20 truncate">
                                     {COMPONENT_REGISTRY[step.componentId]?.title || step.componentId}
                                   </span>
                                 </div>
                                 {index < workflow.steps.length - 1 && (
                                   <ArrowRight className="h-4 w-4 text-gray-400" />
                                 )}
                               </React.Fragment>
                             ))}
                           </div>
                           
                           <div className="grid grid-cols-3 gap-4 text-sm">
                             <div>
                               <span className="text-gray-600">Optimization:</span>
                               <p className="font-medium">{workflow.optimization.type}</p>
                             </div>
                             <div>
                               <span className="text-gray-600">Error Handling:</span>
                               <p className="font-medium">{workflow.errorHandling.strategy}</p>
                             </div>
                             <div>
                               <span className="text-gray-600">Avg. Time:</span>
                               <p className="font-medium">{workflow.performance.averageExecutionTime || 'N/A'}</p>
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </TabsContent>

               {/* Dependencies Tab */}
               <TabsContent value="dependencies" className="space-y-4">
                 <Card>
                   <CardHeader>
                     <CardTitle>Component Dependency Graph</CardTitle>
                     <CardDescription>
                       Visualize dependencies and relationships between all {Object.keys(COMPONENT_REGISTRY).length} components
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                       <div className="text-center">
                         <Network className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                         <p className="text-gray-600">Interactive dependency visualization</p>
                         <p className="text-sm text-gray-500">Showing {catalogState.orchestrationState.componentDependencies.nodes.length} nodes</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Card>
                     <CardHeader>
                       <CardTitle className="text-base">Critical Dependencies</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-2">
                         {Object.entries(COMPONENT_REGISTRY).slice(0, 5).map(([id, component]) => (
                           <div key={id} className="flex items-center justify-between text-sm">
                             <span className="truncate">{component.title}</span>
                             <Badge variant="outline" className="text-xs">
                               {component.dependencies.length} deps
                             </Badge>
                           </div>
                         ))}
                       </div>
                     </CardContent>
                   </Card>

                   <Card>
                     <CardHeader>
                       <CardTitle className="text-base">Data Flows</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-center py-4">
                         <Activity className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                         <p className="text-sm text-gray-600">Real-time data flow monitoring</p>
                         <p className="text-xs text-gray-500">{catalogState.orchestrationState.dataFlows.length} active flows</p>
                       </div>
                     </CardContent>
                   </Card>
                 </div>
               </TabsContent>

               {/* Performance Tab */}
               <TabsContent value="performance" className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm">Avg Response Time</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold">{Math.round(catalogState.systemHealth.responseTime)}ms</div>
                       <Progress value={75} className="mt-2" />
                     </CardContent>
                   </Card>
                   
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm">Throughput</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold">{catalogState.systemHealth.throughput.toLocaleString()}/s</div>
                       <p className="text-xs text-gray-500">Requests per second</p>
                     </CardContent>
                   </Card>
                   
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm">Error Rate</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold text-green-600">{(catalogState.systemHealth.errorRate * 100).toFixed(2)}%</div>
                       <p className="text-xs text-gray-500">Last 24 hours</p>
                     </CardContent>
                   </Card>
                 </div>

                 <Card>
                   <CardHeader>
                     <CardTitle>Performance Trends</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                       <div className="text-center">
                         <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                         <p className="text-gray-600">Real-time performance charts</p>
                         <p className="text-sm text-gray-500">Component utilization & metrics</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </TabsContent>

               {/* AI Intelligence Tab */}
               <TabsContent value="intelligence" className="space-y-4">
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2">
                       <Brain className="h-5 w-5" />
                       <span>Intelligent Workflow Optimization</span>
                     </CardTitle>
                     <CardDescription>
                       AI-powered orchestration and adaptive workflow management
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {catalogState.intelligentWorkflows.map((workflow) => (
                         <div key={workflow.id} className="p-4 border rounded-lg">
                           <div className="flex items-center justify-between mb-3">
                             <h4 className="font-medium">{workflow.name}</h4>
                             <Badge variant="outline" className="text-xs">
                               {workflow.aiModel}
                             </Badge>
                           </div>
                           <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                           
                           <div className="grid grid-cols-2 gap-4">
                             {workflow.learningCapabilities.map((capability, index) => (
                               <div key={index} className="text-sm">
                                 <div className="flex justify-between">
                                   <span className="text-gray-600">{capability.type.replace('_', ' ')}:</span>
                                   <span className="font-medium">{Math.round(capability.accuracy * 100)}%</span>
                                 </div>
                                 <Progress value={capability.accuracy * 100} className="mt-1" />
                               </div>
                             ))}
                           </div>
                           
                           <div className="mt-3 grid grid-cols-2 gap-4">
                             {workflow.optimizationGoals.map((goal, index) => (
                               <div key={index} className="text-sm">
                                 <span className="text-gray-600">{goal.metric}: </span>
                                 <span className="font-medium">{goal.target} (weight: {goal.weight})</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>

                 <Card>
                   <CardHeader>
                     <CardTitle>Adaptive Routing Intelligence</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       <div className="flex items-center justify-between">
                         <span className="text-sm">Adaptive Routing</span>
                         <Badge variant={catalogState.orchestrationState.intelligentRouting.adaptiveRouting.enabled ? 'default' : 'secondary'}>
                           {catalogState.orchestrationState.intelligentRouting.adaptiveRouting.enabled ? 'Enabled' : 'Disabled'}
                         </Badge>
                       </div>
                       
                       <div className="flex items-center justify-between">
                         <span className="text-sm">Learning Rate</span>
                         <span className="text-sm font-medium">
                           {catalogState.orchestrationState.intelligentRouting.adaptiveRouting.learningRate}
                         </span>
                       </div>
                       
                       <div className="flex items-center justify-between">
                         <span className="text-sm">Auto-tuning</span>
                         <Badge variant={catalogState.orchestrationState.intelligentRouting.performanceOptimization.autoTuning ? 'default' : 'secondary'}>
                           {catalogState.orchestrationState.intelligentRouting.performanceOptimization.autoTuning ? 'Active' : 'Inactive'}
                         </Badge>
                       </div>
                       
                       <div className="mt-4">
                         <h5 className="text-sm font-medium mb-2">Optimization Goals</h5>
                         <div className="flex flex-wrap gap-2">
                           {catalogState.orchestrationState.intelligentRouting.performanceOptimization.optimizationGoals.map((goal) => (
                             <Badge key={goal} variant="outline" className="text-xs">
                               {goal}
                             </Badge>
                           ))}
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </TabsContent>
             </Tabs>
           </SheetContent>
         </Sheet>
       </SidebarProvider>
     </TooltipProvider>
   );
 };
 
 export default AdvancedCatalogSPA;
