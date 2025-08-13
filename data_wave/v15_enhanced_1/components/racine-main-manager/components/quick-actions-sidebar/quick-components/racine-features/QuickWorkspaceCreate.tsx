'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

// Icons
import {
  Layers,
  Plus,
  Settings,
  Users,
  FolderPlus,
  Copy,
  Download,
  Upload,
  Share,
  Edit,
  Trash2,
  Star,
  Clock,
  Calendar,
  Globe,
  Lock,
  Shield,
  Database,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  X,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Eye,
  EyeOff,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Save,
  FileText,
  Folder,
  Tag,
  MapPin,
  Briefcase,
  Building,
  Code,
  Workflow,
  GitBranch,
  Package,
  Boxes,
  Layers3,
  ComponentIcon,
  Palette,
  Wrench,
  Gauge,
  MonitorIcon,
  TabletIcon,
  SmartphoneIcon,
  LaptopIcon,
  TvIcon,
  WatchIcon,
  MouseIcon,
  KeyboardIcon,
  HeadphonesIcon,
  SpeakerIcon,
  CameraIcon,
  MicIcon,
  VideoIcon,
  ImageIcon,
  FileIcon,
  ArchiveIcon,
  LinkIcon,
  ExternalLinkIcon,
  BookIcon,
  BookOpenIcon,
  LibraryIcon,
  GraduationCapIcon,
  AwardIcon,
  TrophyIcon,
  MedalIcon,
  CrownIcon,
  ShieldCheckIcon,
  KeyIcon,
  UnlockIcon,
  SecurityIcon,
  PrivacyIcon,
  AdminIcon,
  UserIcon,
  UserCheckIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserXIcon,
  UsersIcon,
  TeamIcon,
  GroupIcon,
  OrganizationIcon,
  CompanyIcon,
  DepartmentIcon,
  RoleIcon,
  PermissionIcon,
  AccessIcon,
  AuthenticationIcon,
  AuthorizationIcon,
  IdentityIcon,
  ProfileIcon,
  SettingsIcon,
  PreferencesIcon,
  ConfigurationIcon,
  OptionsIcon,
  ControlsIcon,
  ParametersIcon,
  VariablesIcon,
  ConstantsIcon,
  FunctionsIcon,
  MethodsIcon,
  ApiIcon,
  EndpointIcon,
  RouteIcon,
  PathIcon,
  UrlIcon,
  DomainIcon,
  SubdomainIcon,
  PortIcon,
  ProtocolIcon,
  HttpIcon,
  HttpsIcon,
  SslIcon,
  TlsIcon,
  CertificateIcon,
  EncryptionIcon,
  DecryptionIcon,
  HashIcon,
  TokenIcon,
  SessionIcon,
  CookieIcon,
  CacheIcon,
  StorageIcon,
  MemoryIcon,
  ProcessorIcon,
  PerformanceIcon,
  OptimizationIcon,
  EfficiencyIcon,
  SpeedIcon,
  ThroughputIcon,
  LatencyIcon,
  BandwidthIcon,
  CapacityIcon,
  ScalabilityIcon,
  ReliabilityIcon,
  AvailabilityIcon,
  DurabilityIcon,
  ConsistencyIcon,
  IntegrityIcon,
  QualityIcon,
  AccuracyIcon,
  PrecisionIcon,
  ValidityIcon,
  CorrectnessIcon,
  CompletenessIcon,
  TimelinessIcon,
  FreshnessIcon,
  RelevanceIcon,
  UsabilityIcon,
  AccessibilityIcon,
  CompatibilityIcon,
  InteroperabilityIcon,
  PortabilityIcon,
  MaintainabilityIcon,
  ExtensibilityIcon,
  FlexibilityIcon,
  AdaptabilityIcon,
  ModularityIcon,
  ReusabilityIcon,
  TestabilityIcon,
  DeployabilityIcon,
  MonitorabilityIcon,
  ObservabilityIcon,
  TraceabilityIcon,
  AuditabilityIcon,
  ComplianceIcon,
  GovernanceIcon,
  PolicyIcon,
  RuleIcon,
  RegulationIcon,
  StandardIcon,
  GuidelineIcon,
  BestPracticeIcon,
  RecommendationIcon,
  SuggestionIcon,
  AdviceIcon,
  TipIcon,
  HintIcon,
  WarningIcon,
  CautionIcon,
  NoticeIcon,
  AlertIcon,
  NotificationIcon,
  MessageIcon,
  CommunicationIcon,
  ConversationIcon,
  DialogIcon,
  ChatIcon,
  CommentIcon,
  FeedbackIcon,
  ReviewIcon,
  RatingIcon,
  EvaluationIcon,
  AssessmentIcon,
  AnalysisIcon,
  InspectionIcon,
  ExaminationIcon,
  InvestigationIcon,
  ResearchIcon,
  StudyIcon,
  SurveyIcon,
  ReportIcon,
  DocumentIcon,
  PaperIcon,
  ArticleIcon,
  PostIcon,
  PublicationIcon,
  ReleaseIcon,
  VersionIcon,
  UpdateIcon,
  UpgradeIcon,
  MigrationIcon,
  TransformationIcon,
  ConversionIcon,
  TranslationIcon,
  AdaptationIcon,
  CustomizationIcon,
  PersonalizationIcon,
  IndividualizationIcon,
  SpecializationIcon,
  OptimizationIcon2,
  EnhancementIcon,
  ImprovementIcon,
  RefinementIcon,
  PolishIcon,
  FinishIcon,
  CompletionIcon,
  SuccessIcon,
  AchievementIcon,
  AccomplishmentIcon,
  VictoryIcon,
  WinIcon,
  ChampionIcon,
  LeaderIcon,
  ExpertIcon,
  SpecialistIcon,
  ProfessionalIcon,
  MasterIcon,
  GuruIcon,
  AuthorityIcon,
  InfluencerIcon,
  MentorIcon,
  CoachIcon,
  TrainerIcon,
  TeacherIcon,
  InstructorIcon,
  EducatorIcon,
  LearnerIcon,
  StudentIcon,
  ApprenticeIcon,
  BeginnerIcon,
  NoviceIcon,
  IntermediateIcon,
  AdvancedIcon,
  ExperiencedIcon,
  SeniorIcon,
  JuniorIcon,
  EntryLevelIcon,
  MidLevelIcon,
  HighLevelIcon,
  TopLevelIcon,
  ExecutiveIcon,
  ManagerIcon,
  SupervisorIcon,
  CoordinatorIcon,
  DirectorIcon,
  PresidentIcon,
  CeoIcon,
  CtoIcon,
  CfoIcon,
  CooIcon,
  CmoIcon,
  ChrIcon,
  CsoIcon,
  CpoIcon,
  CdoIcon,
  CisoIcon,
  CroIcon,
  CcooIcon,
  CloIcon,
  CkosIcon
} from 'lucide-react';

// Import hooks and services
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../hooks/useActivityTracking';
import { usePipelineManager } from '../../../hooks/usePipelineManager';
import { useJobWorkflow } from '../../../hooks/useJobWorkflow';
import { useDataSources } from '../../../hooks/useDataSources';
import { useScanRuleSets } from '../../../hooks/useScanRuleSets';
import { useClassifications } from '../../../hooks/useClassifications';
import { useComplianceRule } from '../../../hooks/useComplianceRule';
import { useAdvancedCatalog } from '../../../hooks/useAdvancedCatalog';
import { useScanLogic } from '../../../hooks/useScanLogic';
import { useRBAC } from '../../../hooks/useRBAC';

// Types
interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'data-science' | 'analytics' | 'governance' | 'compliance' | 'engineering' | 'custom';
  version: string;
  tags: string[];
  thumbnail?: string;
  features: string[];
  requirements: {
    minResources: ResourceRequirements;
    maxResources: ResourceRequirements;
    dependencies: string[];
    permissions: string[];
  };
  configuration: {
    preInstalledComponents: ComponentConfig[];
    defaultSettings: Record<string, any>;
    customizations: Record<string, any>;
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    popularity: number;
    rating: number;
    downloads: number;
    size: number;
  };
}

interface ResourceRequirements {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu?: number;
}

interface ComponentConfig {
  id: string;
  name: string;
  version: string;
  type: 'spa' | 'service' | 'database' | 'cache' | 'queue' | 'storage' | 'compute';
  configuration: Record<string, any>;
  dependencies: string[];
}

interface WorkspaceConfig {
  general: {
    name: string;
    description: string;
    visibility: 'public' | 'private' | 'internal';
    category: string;
    tags: string[];
    icon?: string;
    color?: string;
  };
  resources: {
    allocation: ResourceRequirements;
    limits: ResourceRequirements;
    autoScaling: boolean;
    scaleRules: ScaleRule[];
  };
  security: {
    encryption: boolean;
    accessControl: AccessControlConfig;
    compliance: ComplianceConfig;
    audit: AuditConfig;
  };
  integrations: {
    enabledSPAs: string[];
    apiKeys: Record<string, string>;
    webhooks: WebhookConfig[];
    notifications: NotificationConfig;
  };
  collaboration: {
    members: WorkspaceMember[];
    roles: WorkspaceRole[];
    permissions: PermissionSet[];
    sharing: SharingConfig;
  };
  environment: {
    variables: Record<string, string>;
    secrets: Record<string, string>;
    configuration: Record<string, any>;
    deployment: DeploymentConfig;
  };
}

interface ScaleRule {
  metric: string;
  threshold: number;
  action: 'scale-up' | 'scale-down';
  factor: number;
}

interface AccessControlConfig {
  mfa: boolean;
  ipWhitelist: string[];
  timeRestrictions: TimeRestriction[];
  sessionTimeout: number;
}

interface TimeRestriction {
  days: number[];
  startTime: string;
  endTime: string;
  timezone: string;
}

interface ComplianceConfig {
  frameworks: string[];
  policies: string[];
  certifications: string[];
  dataClassification: string;
}

interface AuditConfig {
  enabled: boolean;
  retention: number;
  events: string[];
  destinations: string[];
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  enabled: boolean;
}

interface NotificationConfig {
  channels: string[];
  events: string[];
  preferences: Record<string, boolean>;
}

interface WorkspaceMember {
  userId: string;
  role: string;
  permissions: string[];
  invitedAt: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

interface WorkspaceRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inherits: string[];
}

interface PermissionSet {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  scope: 'global' | 'workspace' | 'resource';
}

interface SharingConfig {
  public: boolean;
  discoverable: boolean;
  linkSharing: boolean;
  linkExpiry?: string;
  allowInvites: boolean;
}

interface DeploymentConfig {
  strategy: 'rolling' | 'blue-green' | 'canary';
  healthChecks: HealthCheck[];
  rollback: RollbackConfig;
  monitoring: MonitoringConfig;
}

interface HealthCheck {
  path: string;
  interval: number;
  timeout: number;
  retries: number;
}

interface RollbackConfig {
  enabled: boolean;
  automatic: boolean;
  triggers: string[];
  maxVersions: number;
}

interface MonitoringConfig {
  metrics: string[];
  alerts: AlertConfig[];
  dashboards: string[];
}

interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
}

interface WorkspaceAnalytics {
  usage: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
  collaboration: {
    activeUsers: number;
    totalUsers: number;
    sessionsToday: number;
    averageSessionDuration: number;
  };
  resources: {
    utilization: number;
    cost: number;
    efficiency: number;
    optimization: number;
  };
}

interface QuickWorkspaceCreateProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  initialTemplate?: string;
  fromClone?: {
    workspaceId: string;
    name: string;
  };
}

const QuickWorkspaceCreate: React.FC<QuickWorkspaceCreateProps> = ({
  isVisible,
  onClose,
  className = '',
  initialTemplate,
  fromClone,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null);
  const [workspaceConfig, setWorkspaceConfig] = useState<WorkspaceConfig>({
    general: {
      name: '',
      description: '',
      visibility: 'private',
      category: 'analytics',
      tags: [],
      icon: 'Layers',
      color: '#3B82F6'
    },
    resources: {
      allocation: { cpu: 2, memory: 4, storage: 10, network: 1 },
      limits: { cpu: 8, memory: 16, storage: 100, network: 10 },
      autoScaling: false,
      scaleRules: []
    },
    security: {
      encryption: true,
      accessControl: {
        mfa: false,
        ipWhitelist: [],
        timeRestrictions: [],
        sessionTimeout: 3600
      },
      compliance: {
        frameworks: [],
        policies: [],
        certifications: [],
        dataClassification: 'internal'
      },
      audit: {
        enabled: true,
        retention: 90,
        events: ['access', 'modification', 'deletion'],
        destinations: ['local']
      }
    },
    integrations: {
      enabledSPAs: [],
      apiKeys: {},
      webhooks: [],
      notifications: {
        channels: ['email'],
        events: ['workspace.created', 'workspace.updated'],
        preferences: {}
      }
    },
    collaboration: {
      members: [],
      roles: [],
      permissions: [],
      sharing: {
        public: false,
        discoverable: false,
        linkSharing: false,
        allowInvites: true
      }
    },
    environment: {
      variables: {},
      secrets: {},
      configuration: {},
      deployment: {
        strategy: 'rolling',
        healthChecks: [],
        rollback: {
          enabled: true,
          automatic: false,
          triggers: ['health_check_failed'],
          maxVersions: 5
        },
        monitoring: {
          metrics: ['cpu', 'memory', 'response_time'],
          alerts: [],
          dashboards: []
        }
      }
    }
  });
  
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [creationProgress, setCreationProgress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'rating' | 'created'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [analytics, setAnalytics] = useState<WorkspaceAnalytics | null>(null);

  // Refs
  const configFormRef = useRef<HTMLDivElement>(null);

  // Hooks
  const {
    getAIRecommendations,
    suggestWorkspaceConfiguration,
    validateConfiguration,
    optimizeResources,
    generateCode
  } = useAIAssistant();

  const {
    workspaces,
    currentWorkspace,
    createWorkspace,
    cloneWorkspace,
    getWorkspaceTemplates,
    getWorkspaceAnalytics,
    validateWorkspaceName
  } = useWorkspaceManagement();

  const {
    currentUser,
    getTeamMembers,
    checkPermission
  } = useUserManagement();

  const {
    getSPAList,
    getIntegrationOptions,
    validateIntegration
  } = useCrossGroupIntegration();

  const {
    trackActivity,
    getUsageMetrics
  } = useActivityTracking();

  // Template categories
  const templateCategories = [
    { id: 'all', name: 'All Templates', icon: Grid },
    { id: 'data-science', name: 'Data Science', icon: BarChart3 },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'governance', name: 'Governance', icon: Shield },
    { id: 'compliance', name: 'Compliance', icon: CheckCircle },
    { id: 'engineering', name: 'Engineering', icon: Code },
    { id: 'custom', name: 'Custom', icon: Wrench }
  ];

  // Available SPAs for integration
  const availableSPAs = [
    { id: 'data-sources', name: 'Data Sources', icon: Database },
    { id: 'scan-rule-sets', name: 'Scan Rule Sets', icon: Search },
    { id: 'classifications', name: 'Classifications', icon: Tag },
    { id: 'compliance-rule', name: 'Compliance Rules', icon: Shield },
    { id: 'advanced-catalog', name: 'Advanced Catalog', icon: Library },
    { id: 'scan-logic', name: 'Scan Logic', icon: Scan },
    { id: 'rbac-system', name: 'RBAC System', icon: Lock }
  ];

  // Workspace colors and icons
  const workspaceColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const workspaceIcons = [
    'Layers', 'Database', 'BarChart3', 'Shield', 'Code',
    'Globe', 'Users', 'Settings', 'Activity', 'Target'
  ];

  // Initialize component
  useEffect(() => {
    loadTemplates();
    loadAnalytics();
    
    if (initialTemplate) {
      selectTemplateById(initialTemplate);
    }
    
    if (fromClone) {
      handleCloneSetup(fromClone);
    }
    
    trackActivity('workspace-create-opened', { component: 'QuickWorkspaceCreate' });
  }, []);

  // Validate configuration changes
  useEffect(() => {
    validateCurrentConfiguration();
    calculateEstimatedCost();
  }, [workspaceConfig]);

  // Load workspace templates
  const loadTemplates = useCallback(async () => {
    try {
      const templateList = await getWorkspaceTemplates();
      
      // Default templates if none exist
      const defaultTemplates: WorkspaceTemplate[] = [
        {
          id: 'data-science-standard',
          name: 'Data Science Standard',
          description: 'Complete data science workspace with ML tools and notebooks',
          category: 'data-science',
          version: '1.0.0',
          tags: ['jupyter', 'python', 'ml', 'analytics'],
          features: ['Jupyter Notebooks', 'Python Environment', 'ML Libraries', 'Data Visualization'],
          requirements: {
            minResources: { cpu: 2, memory: 4, storage: 20, network: 1 },
            maxResources: { cpu: 16, memory: 64, storage: 500, network: 10 },
            dependencies: ['python', 'jupyter', 'pandas', 'scikit-learn'],
            permissions: ['workspace.create', 'data.read', 'model.create']
          },
          configuration: {
            preInstalledComponents: [
              {
                id: 'jupyter',
                name: 'Jupyter Lab',
                version: '3.4.0',
                type: 'service',
                configuration: { port: 8888 },
                dependencies: []
              }
            ],
            defaultSettings: {
              python_version: '3.9',
              auto_save: true,
              collaborative_editing: false
            },
            customizations: {}
          },
          metadata: {
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            popularity: 95,
            rating: 4.8,
            downloads: 1250,
            size: 2.5
          }
        },
        {
          id: 'governance-enterprise',
          name: 'Data Governance Enterprise',
          description: 'Enterprise-grade data governance with full compliance suite',
          category: 'governance',
          version: '2.1.0',
          tags: ['governance', 'compliance', 'enterprise', 'audit'],
          features: ['Policy Management', 'Compliance Monitoring', 'Audit Trails', 'Data Lineage'],
          requirements: {
            minResources: { cpu: 4, memory: 8, storage: 50, network: 2 },
            maxResources: { cpu: 32, memory: 128, storage: 1000, network: 20 },
            dependencies: ['postgres', 'elasticsearch', 'kafka'],
            permissions: ['governance.manage', 'audit.view', 'compliance.enforce']
          },
          configuration: {
            preInstalledComponents: [
              {
                id: 'governance-suite',
                name: 'Governance Suite',
                version: '2.1.0',
                type: 'spa',
                configuration: { compliance_level: 'enterprise' },
                dependencies: ['database', 'search']
              }
            ],
            defaultSettings: {
              audit_retention: 2555, // 7 years
              compliance_framework: 'GDPR',
              encryption_level: 'AES-256'
            },
            customizations: {}
          },
          metadata: {
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            popularity: 88,
            rating: 4.9,
            downloads: 890,
            size: 4.2
          }
        }
      ];

      setTemplates(templateList?.length ? templateList : defaultTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    }
  }, [getWorkspaceTemplates]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await getWorkspaceAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [getWorkspaceAnalytics]);

  // Select template by ID
  const selectTemplateById = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      applyTemplateToConfig(template);
    }
  }, [templates]);

  // Handle clone setup
  const handleCloneSetup = useCallback((cloneInfo: { workspaceId: string; name: string }) => {
    setWorkspaceConfig(prev => ({
      ...prev,
      general: {
        ...prev.general,
        name: `${cloneInfo.name} (Clone)`,
        description: `Cloned from ${cloneInfo.name}`
      }
    }));
    setActiveTab('configuration');
  }, []);

  // Apply template configuration
  const applyTemplateToConfig = useCallback((template: WorkspaceTemplate) => {
    setWorkspaceConfig(prev => ({
      ...prev,
      general: {
        ...prev.general,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: [...template.tags]
      },
      resources: {
        ...prev.resources,
        allocation: { ...template.requirements.minResources },
        limits: { ...template.requirements.maxResources }
      },
      integrations: {
        ...prev.integrations,
        enabledSPAs: template.configuration.preInstalledComponents
          .filter(c => c.type === 'spa')
          .map(c => c.id)
      },
      environment: {
        ...prev.environment,
        configuration: { ...template.configuration.defaultSettings }
      }
    }));
  }, []);

  // Validate current configuration
  const validateCurrentConfiguration = useCallback(() => {
    const errors: Record<string, string> = {};

    // Validate general settings
    if (!workspaceConfig.general.name.trim()) {
      errors.name = 'Workspace name is required';
    } else if (workspaceConfig.general.name.length < 3) {
      errors.name = 'Workspace name must be at least 3 characters';
    }

    // Validate resources
    if (workspaceConfig.resources.allocation.cpu > workspaceConfig.resources.limits.cpu) {
      errors.cpu = 'CPU allocation cannot exceed limits';
    }

    if (workspaceConfig.resources.allocation.memory > workspaceConfig.resources.limits.memory) {
      errors.memory = 'Memory allocation cannot exceed limits';
    }

    if (workspaceConfig.resources.allocation.storage > workspaceConfig.resources.limits.storage) {
      errors.storage = 'Storage allocation cannot exceed limits';
    }

    // Validate integrations
    if (workspaceConfig.integrations.enabledSPAs.length === 0) {
      errors.spas = 'At least one SPA must be enabled';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [workspaceConfig]);

  // Calculate estimated cost
  const calculateEstimatedCost = useCallback(() => {
    const { cpu, memory, storage, network } = workspaceConfig.resources.allocation;
    
    // Simple cost calculation (in a real app, this would use actual pricing)
    const cpuCost = cpu * 0.05; // $0.05 per CPU per hour
    const memoryCost = memory * 0.01; // $0.01 per GB RAM per hour
    const storageCost = storage * 0.001; // $0.001 per GB storage per hour
    const networkCost = network * 0.02; // $0.02 per Gbps per hour
    
    const hourlyRate = cpuCost + memoryCost + storageCost + networkCost;
    const monthlyCost = hourlyRate * 24 * 30;
    
    setEstimatedCost(monthlyCost);
  }, [workspaceConfig.resources.allocation]);

  // Handle workspace creation
  const handleCreateWorkspace = useCallback(async () => {
    if (!validateCurrentConfiguration()) {
      return;
    }

    try {
      setIsCreating(true);
      setCreationProgress(0);

      // Simulate creation progress
      const progressSteps = [
        { step: 'Validating configuration', progress: 10 },
        { step: 'Allocating resources', progress: 25 },
        { step: 'Setting up security', progress: 40 },
        { step: 'Installing components', progress: 60 },
        { step: 'Configuring integrations', progress: 80 },
        { step: 'Finalizing setup', progress: 95 },
        { step: 'Workspace ready', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        setCreationProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Create workspace
      const newWorkspace = await createWorkspace(workspaceConfig);
      
      // Track activity
      trackActivity('workspace-created', {
        workspaceId: newWorkspace.id,
        template: selectedTemplate?.id,
        resources: workspaceConfig.resources.allocation
      });

      onClose();
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setIsCreating(false);
      setCreationProgress(0);
    }
  }, [workspaceConfig, selectedTemplate, validateCurrentConfiguration, createWorkspace, trackActivity, onClose]);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    return templates
      .filter(template => {
        const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
        const matchesSearch = !searchQuery || 
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const key = sortBy === 'created' ? 'createdAt' : 
                   sortBy === 'rating' ? 'rating' :
                   sortBy === 'popularity' ? 'popularity' : 'name';
        
        const aVal = sortBy === 'name' ? a[key] : a.metadata[key];
        const bVal = sortBy === 'name' ? b[key] : b.metadata[key];
        
        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
  }, [templates, categoryFilter, searchQuery, sortBy, sortOrder]);

  // Render template card
  const renderTemplateCard = useCallback((template: WorkspaceTemplate) => {
    const isSelected = selectedTemplate?.id === template.id;
    
    return (
      <motion.div
        key={template.id}
        layoutId={template.id}
        className={`cursor-pointer border rounded-lg p-4 transition-all ${
          isSelected 
            ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
            : 'border-border hover:border-muted-foreground hover:bg-muted/50'
        }`}
        onClick={() => {
          setSelectedTemplate(template);
          applyTemplateToConfig(template);
          setActiveTab('configuration');
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
            <span className="text-xs text-muted-foreground">v{template.version}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{template.metadata.rating}</span>
          </div>
        </div>
        
        <h3 className="font-medium text-sm mb-2">{template.name}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {template.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{template.metadata.downloads} downloads</span>
            <span>{template.metadata.size}GB</span>
          </div>
        </div>
      </motion.div>
    );
  }, [selectedTemplate, applyTemplateToConfig]);

  // Main render
  if (!isVisible) return null;

  return (
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
            <FolderPlus className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Create Workspace</h2>
              <p className="text-sm text-muted-foreground">
                Comprehensive workspace manager with templates and orchestration
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateWorkspace}
              disabled={isCreating || Object.keys(validationErrors).length > 0}
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Create
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Creation Progress */}
        {isCreating && (
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Creating workspace...</span>
              <span className="text-sm text-muted-foreground">{creationProgress}%</span>
            </div>
            <Progress value={creationProgress} className="h-2" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                <TabsTrigger value="template">Templates</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                {/* Templates Tab */}
                <TabsContent value="template" className="h-full m-0 p-4 space-y-4">
                  {/* Filters */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templateCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popularity">Popular</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="created">Created</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      >
                        {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Templates Grid */}
                  <ScrollArea className="h-full">
                    <div className={`${
                      viewMode === 'grid' 
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                        : 'space-y-2'
                    }`}>
                      {filteredTemplates.map(renderTemplateCard)}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Configuration Tab */}
                <TabsContent value="configuration" className="h-full m-0 p-4">
                  <ScrollArea className="h-full">
                    <div ref={configFormRef} className="space-y-6 max-w-2xl">
                      {/* General Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">General Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="workspace-name">Workspace Name</Label>
                            <Input
                              id="workspace-name"
                              value={workspaceConfig.general.name}
                              onChange={(e) => setWorkspaceConfig(prev => ({
                                ...prev,
                                general: { ...prev.general, name: e.target.value }
                              }))}
                              placeholder="Enter workspace name"
                              className={validationErrors.name ? 'border-destructive' : ''}
                            />
                            {validationErrors.name && (
                              <p className="text-xs text-destructive mt-1">{validationErrors.name}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="workspace-description">Description</Label>
                            <Textarea
                              id="workspace-description"
                              value={workspaceConfig.general.description}
                              onChange={(e) => setWorkspaceConfig(prev => ({
                                ...prev,
                                general: { ...prev.general, description: e.target.value }
                              }))}
                              placeholder="Describe your workspace"
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Visibility</Label>
                              <Select 
                                value={workspaceConfig.general.visibility} 
                                onValueChange={(value) => setWorkspaceConfig(prev => ({
                                  ...prev,
                                  general: { ...prev.general, visibility: value as any }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="private">Private</SelectItem>
                                  <SelectItem value="internal">Internal</SelectItem>
                                  <SelectItem value="public">Public</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Category</Label>
                              <Select 
                                value={workspaceConfig.general.category} 
                                onValueChange={(value) => setWorkspaceConfig(prev => ({
                                  ...prev,
                                  general: { ...prev.general, category: value }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {templateCategories.slice(1).map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* SPA Integrations */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">SPA Integrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-3">
                            {availableSPAs.map(spa => {
                              const isEnabled = workspaceConfig.integrations.enabledSPAs.includes(spa.id);
                              const SpaIcon = spa.icon;
                              
                              return (
                                <div key={spa.id} className="flex items-center justify-between p-3 border rounded">
                                  <div className="flex items-center gap-3">
                                    <SpaIcon className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{spa.name}</span>
                                  </div>
                                  <Switch
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => {
                                      setWorkspaceConfig(prev => ({
                                        ...prev,
                                        integrations: {
                                          ...prev.integrations,
                                          enabledSPAs: checked
                                            ? [...prev.integrations.enabledSPAs, spa.id]
                                            : prev.integrations.enabledSPAs.filter(id => id !== spa.id)
                                        }
                                      }));
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          {validationErrors.spas && (
                            <p className="text-xs text-destructive mt-2">{validationErrors.spas}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="h-full m-0 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-6 max-w-2xl">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Resource Allocation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* CPU */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>CPU Cores</Label>
                              <span className="text-sm text-muted-foreground">
                                {workspaceConfig.resources.allocation.cpu} / {workspaceConfig.resources.limits.cpu}
                              </span>
                            </div>
                            <Slider
                              value={[workspaceConfig.resources.allocation.cpu]}
                              onValueChange={([value]) => setWorkspaceConfig(prev => ({
                                ...prev,
                                resources: {
                                  ...prev.resources,
                                  allocation: { ...prev.resources.allocation, cpu: value }
                                }
                              }))}
                              max={workspaceConfig.resources.limits.cpu}
                              min={1}
                              step={1}
                              className="mt-2"
                            />
                            {validationErrors.cpu && (
                              <p className="text-xs text-destructive mt-1">{validationErrors.cpu}</p>
                            )}
                          </div>

                          {/* Memory */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Memory (GB)</Label>
                              <span className="text-sm text-muted-foreground">
                                {workspaceConfig.resources.allocation.memory} / {workspaceConfig.resources.limits.memory}
                              </span>
                            </div>
                            <Slider
                              value={[workspaceConfig.resources.allocation.memory]}
                              onValueChange={([value]) => setWorkspaceConfig(prev => ({
                                ...prev,
                                resources: {
                                  ...prev.resources,
                                  allocation: { ...prev.resources.allocation, memory: value }
                                }
                              }))}
                              max={workspaceConfig.resources.limits.memory}
                              min={1}
                              step={1}
                              className="mt-2"
                            />
                            {validationErrors.memory && (
                              <p className="text-xs text-destructive mt-1">{validationErrors.memory}</p>
                            )}
                          </div>

                          {/* Storage */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Storage (GB)</Label>
                              <span className="text-sm text-muted-foreground">
                                {workspaceConfig.resources.allocation.storage} / {workspaceConfig.resources.limits.storage}
                              </span>
                            </div>
                            <Slider
                              value={[workspaceConfig.resources.allocation.storage]}
                              onValueChange={([value]) => setWorkspaceConfig(prev => ({
                                ...prev,
                                resources: {
                                  ...prev.resources,
                                  allocation: { ...prev.resources.allocation, storage: value }
                                }
                              }))}
                              max={workspaceConfig.resources.limits.storage}
                              min={1}
                              step={1}
                              className="mt-2"
                            />
                            {validationErrors.storage && (
                              <p className="text-xs text-destructive mt-1">{validationErrors.storage}</p>
                            )}
                          </div>

                          {/* Auto Scaling */}
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Auto Scaling</Label>
                              <p className="text-xs text-muted-foreground">
                                Automatically scale resources based on demand
                              </p>
                            </div>
                            <Switch
                              checked={workspaceConfig.resources.autoScaling}
                              onCheckedChange={(checked) => setWorkspaceConfig(prev => ({
                                ...prev,
                                resources: { ...prev.resources, autoScaling: checked }
                              }))}
                            />
                          </div>

                          {/* Cost Estimation */}
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Estimated Monthly Cost</span>
                              <span className="text-lg font-bold text-primary">
                                ${estimatedCost.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Based on current resource allocation
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Review Tab */}
                <TabsContent value="review" className="h-full m-0 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-6 max-w-2xl">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Workspace Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Name</Label>
                              <p className="font-medium">{workspaceConfig.general.name}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Category</Label>
                              <p className="font-medium capitalize">{workspaceConfig.general.category}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Visibility</Label>
                              <p className="font-medium capitalize">{workspaceConfig.general.visibility}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Template</Label>
                              <p className="font-medium">{selectedTemplate?.name || 'Custom'}</p>
                            </div>
                          </div>
                          
                          {workspaceConfig.general.description && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Description</Label>
                              <p className="text-sm">{workspaceConfig.general.description}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Resource Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">CPU</span>
                                <span className="text-sm font-medium">
                                  {workspaceConfig.resources.allocation.cpu} cores
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Memory</span>
                                <span className="text-sm font-medium">
                                  {workspaceConfig.resources.allocation.memory} GB
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Storage</span>
                                <span className="text-sm font-medium">
                                  {workspaceConfig.resources.allocation.storage} GB
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Auto Scaling</span>
                                <span className="text-sm font-medium">
                                  {workspaceConfig.resources.autoScaling ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Enabled SPAs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {workspaceConfig.integrations.enabledSPAs.map(spaId => {
                              const spa = availableSPAs.find(s => s.id === spaId);
                              return spa ? (
                                <Badge key={spaId} variant="secondary">
                                  {spa.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Cost Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Estimated Monthly Cost</span>
                            <span className="text-xl font-bold text-primary">
                              ${estimatedCost.toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {selectedTemplate && (
              <span>Template: {selectedTemplate.name}</span>
            )}
            <span>Resources: {workspaceConfig.resources.allocation.cpu}C/{workspaceConfig.resources.allocation.memory}GB</span>
            <span>Cost: ${estimatedCost.toFixed(2)}/month</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                if (activeTab === 'template') return;
                const tabs = ['template', 'configuration', 'resources', 'review'];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1]);
                }
              }}
              disabled={activeTab === 'template'}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <Button
              onClick={() => {
                if (activeTab === 'review') {
                  handleCreateWorkspace();
                } else {
                  const tabs = ['template', 'configuration', 'resources', 'review'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }
              }}
              disabled={isCreating || (activeTab !== 'review' && Object.keys(validationErrors).length > 0)}
            >
              {activeTab === 'review' ? (
                isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Create Workspace
                  </>
                )
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickWorkspaceCreate;