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
  TooltipProvider,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

// Icons
import {
  GitBranch,
  Play,
  Pause,
  Stop,
  Save,
  Copy,
  Edit,
  Trash,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  Settings,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  Share,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Clock,
  Calendar,
  User,
  Users,
  Tag,
  Tags,
  Layers,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Brain,
  Sparkles,
  Target,
  Grid,
  List,
  MapPin,
  Globe,
  Network,
  Shield,
  Database,
  Table,
  FileText,
  Folder,
  FolderOpen,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  LinkIcon,
  Unlink,
  Move,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Square,
  Circle,
  Triangle,
  Diamond,
  Star,
  Heart,
  Bookmark,
  Flag,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Video,
  Image,
  File,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Memory,
  Wifi,
  WifiOff,
  Bluetooth,
  Usb,
  Power,
  Battery,
  BatteryLow,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Thermometer,
  Wind,
  Compass,
  Navigation,
  Map,
  Route,
  Car,
  Plane,
  Train,
  Ship,
  Bike,
  Walk,
  Workflow,
  TreePine,
  FlowChart,
  Boxes,
  Component,
  Timer,
  Gauge,
  Radar,
} from 'lucide-react';

// Import hooks and services
import { usePipelineManager } from '../../../../hooks/usePipelineManager';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';
import { useJobWorkflow } from '../../../../hooks/useJobWorkflow';
import { useAdvancedCatalog } from '../../../../hooks/useAdvancedCatalog';
import { useDataSources } from '../../../../hooks/useDataSources';
import { useScanRuleSets } from '../../../../hooks/useScanRuleSets';
import { useClassifications } from '../../../../hooks/useClassifications';
import { useComplianceRules as useComplianceRule } from '../../../../hooks/useComplianceRules';
import { useScanLogic } from '../../../../hooks/useScanLogic';
import { useRBACSystem as useRBAC } from '../../../../hooks/useRBACSystem';

// Types
interface PipelineStage {
  id: string;
  name: string;
  description: string;
  type: 'data-ingestion' | 'data-discovery' | 'data-governance' | 'data-quality' | 'data-processing' | 'data-output' | 'custom';
  position: { x: number; y: number };
  config: {
    parallelism?: number;
    retryPolicy?: {
      maxRetries: number;
      backoffStrategy: 'linear' | 'exponential' | 'fixed';
      delay: number;
    };
    timeout?: number;
    resources?: {
      cpu: number;
      memory: number;
      storage: number;
    };
    environment?: Record<string, string>;
    conditions?: {
      onSuccess?: string[];
      onFailure?: string[];
      onTimeout?: string[];
    };
  };
  steps: PipelineStep[];
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  metrics?: {
    throughput: number;
    latency: number;
    errorRate: number;
    resourceUtilization: number;
    costEstimate: number;
  };
  logs?: PipelineLog[];
}

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  type: 'data-source' | 'scan-rule' | 'classification' | 'compliance' | 'catalog' | 'scan-logic' | 'rbac' | 'transformation' | 'validation' | 'custom';
  sourceType?: 'existing-spa' | 'custom-code' | 'template' | 'ai-generated';
  spadIntegration?: {
    spaType: 'data-sources' | 'scan-rule-sets' | 'classifications' | 'compliance-rule' | 'advanced-catalog' | 'scan-logic' | 'rbac-system';
    component: string;
    apiEndpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    parameters: Record<string, any>;
  };
  code?: {
    language: 'python' | 'sql' | 'javascript' | 'typescript' | 'scala' | 'java' | 'r';
    content: string;
    dependencies: string[];
    entryPoint: string;
  };
  config: Record<string, any>;
  inputSchema?: any;
  outputSchema?: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  retryCount?: number;
  metrics?: Record<string, any>;
  logs?: string[];
}

interface PipelineConnection {
  id: string;
  sourceStageId: string;
  targetStageId: string;
  sourcePort?: string;
  targetPort?: string;
  condition?: {
    type: 'always' | 'on-success' | 'on-failure' | 'custom';
    expression?: string;
  };
  dataFlow?: {
    schema: any;
    transformation?: string;
    validation?: string;
  };
  label?: string;
}

interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: 'data-governance' | 'compliance' | 'quality-assurance' | 'discovery' | 'monitoring' | 'custom';
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: number;
  stages: PipelineStage[];
  connections: PipelineConnection[];
  variables: Record<string, any>;
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
    retryPolicy: {
      maxRetries: number;
      backoffStrategy: string;
    };
  };
  notifications?: {
    onSuccess: string[];
    onFailure: string[];
    onStart: string[];
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    version: string;
    popularity: number;
    successRate: number;
  };
}

interface PipelineLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  source: string;
  metadata?: Record<string, any>;
}

interface AIOptimization {
  id: string;
  type: 'performance' | 'cost' | 'reliability' | 'security' | 'compliance';
  title: string;
  description: string;
  impact: {
    metric: string;
    improvement: number;
    confidence: number;
  };
  implementation: {
    automated: boolean;
    steps: string[];
    effort: 'low' | 'medium' | 'high';
  };
  category: 'parallelization' | 'resource-optimization' | 'caching' | 'data-partitioning' | 'error-handling' | 'monitoring';
}

interface PipelineMetrics {
  execution: {
    totalRuns: number;
    successRate: number;
    averageDuration: number;
    failureReasons: Record<string, number>;
  };
  performance: {
    throughput: number;
    latency: number;
    resourceUtilization: {
      cpu: number;
      memory: number;
      storage: number;
      network: number;
    };
  };
  cost: {
    totalCost: number;
    costPerRun: number;
    breakdown: Record<string, number>;
    optimization: number;
  };
  quality: {
    dataQualityScore: number;
    complianceScore: number;
    securityScore: number;
    governanceScore: number;
  };
}

interface QuickPipelineCreateProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  initialTemplate?: PipelineTemplate;
}

const QuickPipelineCreate: React.FC<QuickPipelineCreateProps> = ({
  isVisible,
  onClose,
  className = '',
  initialTemplate,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('design');
  const [pipelineName, setPipelineName] = useState<string>('');
  const [pipelineDescription, setPipelineDescription] = useState<string>('');
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [connections, setConnections] = useState<PipelineConnection[]>([]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [executionLogs, setExecutionLogs] = useState<PipelineLog[]>([]);
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'json' | 'yaml'>('visual');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);
  const [showVariablesDialog, setShowVariablesDialog] = useState<boolean>(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState<boolean>(false);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState<boolean>(false);
  const [currentOptimization, setCurrentOptimization] = useState<any>(null);
  const [pipelineVariables, setPipelineVariables] = useState<Record<string, any>>({});
  const [scheduleConfig, setScheduleConfig] = useState<any>({});
  const [templates, setTemplates] = useState<PipelineTemplate[]>([]);
  const [aiOptimizations, setAIOptimizations] = useState<AIOptimization[]>([]);
  const [showAIOptimizations, setShowAIOptimizations] = useState<boolean>(false);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');
  const [searchTemplateQuery, setSearchTemplateQuery] = useState<string>('');
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);
  const [parallelismLevel, setParallelismLevel] = useState<number>(4);
  const [autoOptimization, setAutoOptimization] = useState<boolean>(true);
  const [enableMonitoring, setEnableMonitoring] = useState<boolean>(true);
  const [enableCaching, setEnableCaching] = useState<boolean>(true);
  const [enableRetry, setEnableRetry] = useState<boolean>(true);
  const [resourceLimits, setResourceLimits] = useState<{cpu: number; memory: number; storage: number}>({
    cpu: 4,
    memory: 8,
    storage: 100
  });

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Hooks
  const { 
    pipelines,
    currentPipeline,
    loading: pipelineLoading,
    error: pipelineError,
    createPipeline,
    updatePipeline,
    deletePipeline,
    executePipeline,
    monitorExecution,
    optimizePipeline,
    getPipelineTemplates,
    getPipelineMetrics,
    validatePipeline,
    exportPipeline,
    importPipeline,
    clonePipeline,
    schedulePipeline,
    cancelPipelineExecution,
    getPipelineHistory,
    getExecutionLogs,
    getPerformanceMetrics,
    getCostAnalysis,
    getQualityMetrics,
    getComplianceReport,
    getOptimizationRecommendations
  } = usePipelineManager();

  const {
    currentWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    getWorkspaceContext,
    getWorkspaceResources,
    linkResourceToWorkspace
  } = useWorkspaceManagement();

  const {
    currentUser,
    userPermissions,
    checkPermission,
    getUserPreferences,
    updateUserPreferences
  } = useUserManagement();

  const {
    aiContext,
    getAIRecommendations,
    analyzePerformance,
    optimizeWorkflow,
    generateCode,
    validateConfiguration,
    predictIssues,
    suggestImprovements,
    autoComplete,
    explainConcept,
    troubleshootError
  } = useAIAssistant();

  const {
    crossGroupContext,
    coordinateExecution,
    linkResources,
    getIntegrationStatus,
    executeCrossGroupWorkflow,
    monitorCrossGroupExecution,
    getSPAStatus,
    executeSPAAction,
    getAvailableSPAActions,
    getCrossGroupMetrics
  } = useCrossGroupIntegration();

  const {
    trackActivity,
    getActivityHistory,
    getPerformanceData,
    getUserBehavior,
    getSystemMetrics,
    generateReport,
    exportActivity,
    getAuditTrail
  } = useActivityTracking();

  // SPA Integration Hooks
  const { dataSources, createDataSource, testConnection } = useDataSources();
  const { scanRuleSets, createScanRule, applyScanRule } = useScanRuleSets();
  const { classifications, createClassification, applyClassification } = useClassifications();
  const { complianceRules, checkCompliance, generateAuditReport } = useComplianceRule();
  const { catalogItems, createCatalogItem, generateLineage } = useAdvancedCatalog();
  const { scanJobs, executeScan, getScanResults } = useScanLogic();
  const { users, roles, permissions, assignRole, checkUserPermission } = useRBAC();

  // Pipeline Stage Types with SPA Integration
  const stageTypes = useMemo(() => [
    {
      type: 'data-ingestion',
      name: 'Data Ingestion',
      description: 'Ingest data from various sources',
      icon: Database,
      color: 'bg-blue-500',
      availableSteps: [
        { type: 'data-source', name: 'Connect Data Source', spa: 'data-sources' },
        { type: 'validation', name: 'Validate Connection', spa: 'data-sources' },
        { type: 'transformation', name: 'Transform Data', spa: 'custom' },
        { type: 'catalog', name: 'Catalog Assets', spa: 'advanced-catalog' }
      ]
    },
    {
      type: 'data-discovery',
      name: 'Data Discovery',
      description: 'Discover and classify data assets',
      icon: Search,
      color: 'bg-green-500',
      availableSteps: [
        { type: 'scan-logic', name: 'Scan Data', spa: 'scan-logic' },
        { type: 'classification', name: 'Classify Data', spa: 'classifications' },
        { type: 'catalog', name: 'Update Catalog', spa: 'advanced-catalog' },
        { type: 'scan-rule', name: 'Apply Rules', spa: 'scan-rule-sets' }
      ]
    },
    {
      type: 'data-governance',
      name: 'Data Governance',
      description: 'Apply governance policies and rules',
      icon: Shield,
      color: 'bg-purple-500',
      availableSteps: [
        { type: 'compliance', name: 'Check Compliance', spa: 'compliance-rule' },
        { type: 'scan-rule', name: 'Apply Governance Rules', spa: 'scan-rule-sets' },
        { type: 'rbac', name: 'Manage Access', spa: 'rbac-system' },
        { type: 'validation', name: 'Validate Policies', spa: 'custom' }
      ]
    },
    {
      type: 'data-quality',
      name: 'Data Quality',
      description: 'Assess and improve data quality',
      icon: Target,
      color: 'bg-orange-500',
      availableSteps: [
        { type: 'validation', name: 'Quality Checks', spa: 'custom' },
        { type: 'scan-logic', name: 'Quality Scans', spa: 'scan-logic' },
        { type: 'classification', name: 'Quality Classification', spa: 'classifications' },
        { type: 'compliance', name: 'Quality Compliance', spa: 'compliance-rule' }
      ]
    },
    {
      type: 'data-processing',
      name: 'Data Processing',
      description: 'Process and transform data',
      icon: Cpu,
      color: 'bg-red-500',
      availableSteps: [
        { type: 'transformation', name: 'Transform Data', spa: 'custom' },
        { type: 'validation', name: 'Validate Results', spa: 'custom' },
        { type: 'catalog', name: 'Update Lineage', spa: 'advanced-catalog' },
        { type: 'scan-logic', name: 'Process Scan', spa: 'scan-logic' }
      ]
    },
    {
      type: 'data-output',
      name: 'Data Output',
      description: 'Output processed data',
      icon: Upload,
      color: 'bg-teal-500',
      availableSteps: [
        { type: 'data-source', name: 'Write to Target', spa: 'data-sources' },
        { type: 'catalog', name: 'Catalog Output', spa: 'advanced-catalog' },
        { type: 'validation', name: 'Validate Output', spa: 'custom' },
        { type: 'compliance', name: 'Compliance Check', spa: 'compliance-rule' }
      ]
    }
  ], []);

  // Pipeline Templates with AI-Generated Options
  const defaultTemplates = useMemo(() => [
    {
      id: 'data-governance-pipeline',
      name: 'Complete Data Governance Pipeline',
      description: 'End-to-end data governance pipeline with discovery, classification, and compliance',
      category: 'data-governance' as const,
      tags: ['governance', 'compliance', 'discovery', 'classification'],
      complexity: 'intermediate' as const,
      estimatedDuration: 240,
      stages: [
        {
          id: 'ingestion-stage',
          name: 'Data Ingestion',
          description: 'Ingest data from multiple sources',
          type: 'data-ingestion' as const,
          position: { x: 100, y: 100 },
          config: { parallelism: 4 },
          steps: [
            {
              id: 'connect-sources',
              name: 'Connect Data Sources',
              description: 'Connect to configured data sources',
              type: 'data-source' as const,
              sourceType: 'existing-spa' as const,
              spadIntegration: {
                spaType: 'data-sources' as const,
                component: 'DataSourceConnector',
                apiEndpoint: '/api/data-sources/connect',
                method: 'POST' as const,
                parameters: {}
              },
              config: {},
              status: 'pending' as const
            }
          ],
          dependencies: [],
          status: 'pending' as const
        },
        {
          id: 'discovery-stage',
          name: 'Data Discovery',
          description: 'Discover and scan data assets',
          type: 'data-discovery' as const,
          position: { x: 300, y: 100 },
          config: { parallelism: 2 },
          steps: [
            {
              id: 'scan-data',
              name: 'Scan Data Assets',
              description: 'Execute comprehensive data scan',
              type: 'scan-logic' as const,
              sourceType: 'existing-spa' as const,
              spadIntegration: {
                spaType: 'scan-logic' as const,
                component: 'DataScanner',
                apiEndpoint: '/api/scan-logic/execute',
                method: 'POST' as const,
                parameters: { deep_scan: true }
              },
              config: {},
              status: 'pending' as const
            }
          ],
          dependencies: ['ingestion-stage'],
          status: 'pending' as const
        },
        {
          id: 'governance-stage',
          name: 'Data Governance',
          description: 'Apply governance policies',
          type: 'data-governance' as const,
          position: { x: 500, y: 100 },
          config: { parallelism: 3 },
          steps: [
            {
              id: 'check-compliance',
              name: 'Check Compliance',
              description: 'Validate compliance with policies',
              type: 'compliance' as const,
              sourceType: 'existing-spa' as const,
              spadIntegration: {
                spaType: 'compliance-rule' as const,
                component: 'ComplianceChecker',
                apiEndpoint: '/api/compliance-rules/check',
                method: 'POST' as const,
                parameters: { full_compliance_check: true }
              },
              config: {},
              status: 'pending' as const
            }
          ],
          dependencies: ['discovery-stage'],
          status: 'pending' as const
        }
      ],
      connections: [
        {
          id: 'ingestion-to-discovery',
          sourceStageId: 'ingestion-stage',
          targetStageId: 'discovery-stage',
          condition: { type: 'on-success' as const }
        },
        {
          id: 'discovery-to-governance',
          sourceStageId: 'discovery-stage',
          targetStageId: 'governance-stage',
          condition: { type: 'on-success' as const }
        }
      ],
      variables: {
        source_systems: ['database', 'file_system', 'api'],
        scan_depth: 'comprehensive',
        compliance_level: 'strict'
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        popularity: 95,
        successRate: 92
      }
    },
    {
      id: 'quality-assurance-pipeline',
      name: 'Data Quality Assurance Pipeline',
      description: 'Comprehensive data quality assessment and improvement pipeline',
      category: 'quality-assurance' as const,
      tags: ['quality', 'validation', 'improvement', 'monitoring'],
      complexity: 'advanced' as const,
      estimatedDuration: 180,
      stages: [
        {
          id: 'quality-assessment',
          name: 'Quality Assessment',
          description: 'Assess current data quality',
          type: 'data-quality' as const,
          position: { x: 100, y: 100 },
          config: { parallelism: 6 },
          steps: [
            {
              id: 'quality-scan',
              name: 'Quality Scan',
              description: 'Comprehensive quality assessment',
              type: 'scan-logic' as const,
              sourceType: 'existing-spa' as const,
              spadIntegration: {
                spaType: 'scan-logic' as const,
                component: 'QualityScanner',
                apiEndpoint: '/api/scan-logic/quality-scan',
                method: 'POST' as const,
                parameters: { include_profiling: true }
              },
              config: {},
              status: 'pending' as const
            }
          ],
          dependencies: [],
          status: 'pending' as const
        }
      ],
      connections: [],
      variables: {
        quality_threshold: 85,
        profiling_depth: 'deep',
        remediation_mode: 'automatic'
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        popularity: 88,
        successRate: 94
      }
    }
  ], []);

  // Initialize component
  useEffect(() => {
    if (initialTemplate) {
      loadTemplate(initialTemplate);
    }
    loadTemplates();
    loadAIOptimizations();
    trackActivity('pipeline-create-opened', { component: 'QuickPipelineCreate' });
  }, [initialTemplate]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty && pipelineName) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoSave, isDirty, pipelineName, stages, connections]);

  // Pipeline validation
  useEffect(() => {
    validateCurrentPipeline();
  }, [stages, connections, pipelineName]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const fetchedTemplates = await getPipelineTemplates();
      setTemplates([...defaultTemplates, ...fetchedTemplates]);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates(defaultTemplates);
    }
  }, [defaultTemplates, getPipelineTemplates]);

  // Load AI optimizations
  const loadAIOptimizations = useCallback(async () => {
    try {
      const optimizations = await getOptimizationRecommendations();
      setAIOptimizations(optimizations);
    } catch (error) {
      console.error('Failed to load AI optimizations:', error);
    }
  }, [getOptimizationRecommendations]);

  // Load template
  const loadTemplate = useCallback((template: PipelineTemplate) => {
    setPipelineName(template.name);
    setPipelineDescription(template.description);
    setStages(template.stages);
    setConnections(template.connections);
    setPipelineVariables(template.variables);
    setScheduleConfig(template.schedule || {});
    setIsDirty(false);
    trackActivity('pipeline-template-loaded', { templateId: template.id });
  }, [trackActivity]);

  // Validate pipeline
  const validateCurrentPipeline = useCallback(async () => {
    if (!pipelineName || stages.length === 0) {
      setValidationErrors({});
      return;
    }

    try {
      const errors = await validatePipeline({
        name: pipelineName,
        description: pipelineDescription,
        stages,
        connections,
        variables: pipelineVariables
      });
      setValidationErrors(errors || {});
    } catch (error) {
      console.error('Pipeline validation failed:', error);
    }
  }, [pipelineName, pipelineDescription, stages, connections, pipelineVariables, validatePipeline]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!pipelineName) return;

    try {
      const pipelineData = {
        name: pipelineName,
        description: pipelineDescription,
        stages,
        connections,
        variables: pipelineVariables,
        schedule: scheduleConfig,
        config: {
          parallelism: parallelismLevel,
          autoOptimization,
          enableMonitoring,
          enableCaching,
          enableRetry,
          resourceLimits
        }
      };

      if (currentPipeline?.id) {
        await updatePipeline(currentPipeline.id, pipelineData);
      } else {
        await createPipeline(pipelineData);
      }

      setIsDirty(false);
      setLastSaved(new Date().toLocaleTimeString());
      trackActivity('pipeline-saved', { pipelineName });
    } catch (error) {
      console.error('Failed to save pipeline:', error);
    }
  }, [
    pipelineName,
    pipelineDescription,
    stages,
    connections,
    pipelineVariables,
    scheduleConfig,
    parallelismLevel,
    autoOptimization,
    enableMonitoring,
    enableCaching,
    enableRetry,
    resourceLimits,
    currentPipeline,
    updatePipeline,
    createPipeline,
    trackActivity
  ]);

  // Handle execute
  const handleExecute = useCallback(async () => {
    if (!pipelineName || stages.length === 0) return;

    try {
      setIsExecuting(true);
      setExecutionProgress(0);
      setExecutionLogs([]);

      const pipelineData = {
        name: pipelineName,
        description: pipelineDescription,
        stages,
        connections,
        variables: pipelineVariables
      };

      const executionId = await executePipeline(pipelineData);
      
      // Monitor execution
      const interval = setInterval(async () => {
        try {
          const status = await monitorExecution(executionId);
          setExecutionProgress(status.progress || 0);
          
          if (status.logs) {
            setExecutionLogs(prev => [...prev, ...status.logs]);
          }

          if (status.status === 'completed' || status.status === 'failed') {
            setIsExecuting(false);
            clearInterval(interval);
            
            if (status.status === 'completed') {
              setExecutionProgress(100);
              loadPipelineMetrics();
            }
          }
        } catch (error) {
          console.error('Failed to monitor execution:', error);
          setIsExecuting(false);
          clearInterval(interval);
        }
      }, 1000);

      trackActivity('pipeline-executed', { pipelineName, executionId });
    } catch (error) {
      console.error('Failed to execute pipeline:', error);
      setIsExecuting(false);
    }
  }, [
    pipelineName,
    pipelineDescription,
    stages,
    connections,
    pipelineVariables,
    executePipeline,
    monitorExecution,
    trackActivity
  ]);

  // Load pipeline metrics
  const loadPipelineMetrics = useCallback(async () => {
    if (!currentPipeline?.id) return;

    try {
      const metrics = await getPipelineMetrics(currentPipeline.id);
      setPipelineMetrics(metrics);
    } catch (error) {
      console.error('Failed to load pipeline metrics:', error);
    }
  }, [currentPipeline, getPipelineMetrics]);

  // Handle stage creation
  const handleCreateStage = useCallback((stageType: string, position: { x: number; y: number }) => {
    const stageTypeInfo = stageTypes.find(t => t.type === stageType);
    if (!stageTypeInfo) return;

    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      name: `${stageTypeInfo.name} Stage`,
      description: stageTypeInfo.description,
      type: stageType as any,
      position,
      config: {
        parallelism: parallelismLevel,
        retryPolicy: {
          maxRetries: enableRetry ? 3 : 0,
          backoffStrategy: 'exponential' as const,
          delay: 1000
        },
        timeout: 3600,
        resources: resourceLimits
      },
      steps: [],
      dependencies: [],
      status: 'pending' as const
    };

    setStages(prev => [...prev, newStage]);
    setSelectedStage(newStage.id);
    setIsDirty(true);
    trackActivity('pipeline-stage-created', { stageType, stageName: newStage.name });
  }, [stageTypes, parallelismLevel, enableRetry, resourceLimits, trackActivity]);

  // Handle stage update
  const handleUpdateStage = useCallback((stageId: string, updates: Partial<PipelineStage>) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId ? { ...stage, ...updates } : stage
    ));
    setIsDirty(true);
  }, []);

  // Handle stage deletion
  const handleDeleteStage = useCallback((stageId: string) => {
    setStages(prev => prev.filter(stage => stage.id !== stageId));
    setConnections(prev => prev.filter(conn => 
      conn.sourceStageId !== stageId && conn.targetStageId !== stageId
    ));
    setSelectedStage(null);
    setIsDirty(true);
  }, []);

  // Handle connection creation
  const handleCreateConnection = useCallback((
    sourceStageId: string,
    targetStageId: string,
    condition: any = { type: 'on-success' }
  ) => {
    const newConnection: PipelineConnection = {
      id: `connection-${Date.now()}`,
      sourceStageId,
      targetStageId,
      condition
    };

    setConnections(prev => [...prev, newConnection]);
    setIsDirty(true);
    trackActivity('pipeline-connection-created', { sourceStageId, targetStageId });
  }, [trackActivity]);

  // Handle AI optimization application
  const handleApplyAIOptimization = useCallback(async (optimization: AIOptimization) => {
    try {
      if (optimization.implementation.automated) {
        // Apply automated optimization
        const optimizedPipeline = await optimizePipeline({
          name: pipelineName,
          stages,
          connections,
          optimizationType: optimization.type
        });
        
        setStages(optimizedPipeline.stages);
        setConnections(optimizedPipeline.connections);
        setIsDirty(true);
        
        trackActivity('ai-optimization-applied', { 
          optimizationType: optimization.type,
          optimizationId: optimization.id 
        });
      } else {
        // Show manual implementation steps in dialog
        setCurrentOptimization(optimization);
        setShowOptimizationDialog(true);
      }
    } catch (error) {
      console.error('Failed to apply AI optimization:', error);
    }
  }, [pipelineName, stages, connections, optimizePipeline, trackActivity]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = selectedTemplateCategory === 'all' || template.category === selectedTemplateCategory;
      const matchesSearch = !searchTemplateQuery || 
        template.name.toLowerCase().includes(searchTemplateQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTemplateQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTemplateQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedTemplateCategory, searchTemplateQuery]);

  // Render stage
  const renderStage = useCallback((stage: PipelineStage) => {
    const stageTypeInfo = stageTypes.find(t => t.type === stage.type);
    const StageIcon = stageTypeInfo?.icon || Circle;
    const isSelected = selectedStage === stage.id;
    const hasErrors = validationErrors[stage.id]?.length > 0;

    return (
      <motion.div
        key={stage.id}
        className={`absolute cursor-pointer select-none ${
          isSelected ? 'z-20' : 'z-10'
        }`}
        style={{
          left: stage.position.x * zoomLevel + canvasOffset.x,
          top: stage.position.y * zoomLevel + canvasOffset.y,
          transform: `scale(${zoomLevel})`
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSelectedStage(stage.id)}
        drag
        dragControls={dragControls}
        onDragEnd={(_, info) => {
          handleUpdateStage(stage.id, {
            position: {
              x: (stage.position.x * zoomLevel + info.offset.x - canvasOffset.x) / zoomLevel,
              y: (stage.position.y * zoomLevel + info.offset.y - canvasOffset.y) / zoomLevel
            }
          });
        }}
      >
        <Card className={`w-48 ${isSelected ? 'ring-2 ring-primary' : ''} ${hasErrors ? 'border-red-500' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded ${stageTypeInfo?.color || 'bg-gray-500'}`}>
                  <StageIcon className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
              </div>
              <Badge variant={stage.status === 'completed' ? 'default' : 'secondary'}>
                {stage.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-2">{stage.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span>{stage.steps.length} steps</span>
              {stage.duration && (
                <span>{Math.round(stage.duration / 1000)}s</span>
              )}
            </div>
            {hasErrors && (
              <div className="mt-2 p-1 bg-red-50 rounded text-xs text-red-700">
                {validationErrors[stage.id].join(', ')}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [
    stageTypes,
    selectedStage,
    validationErrors,
    zoomLevel,
    canvasOffset,
    dragControls,
    handleUpdateStage
  ]);

  // Render connection
  const renderConnection = useCallback((connection: PipelineConnection) => {
    const sourceStage = stages.find(s => s.id === connection.sourceStageId);
    const targetStage = stages.find(s => s.id === connection.targetStageId);
    
    if (!sourceStage || !targetStage) return null;

    const sourceX = (sourceStage.position.x + 96) * zoomLevel + canvasOffset.x; // 96 = half card width
    const sourceY = (sourceStage.position.y + 40) * zoomLevel + canvasOffset.y; // 40 = approx card center
    const targetX = (targetStage.position.x + 96) * zoomLevel + canvasOffset.x;
    const targetY = (targetStage.position.y + 40) * zoomLevel + canvasOffset.y;

    const isSelected = selectedConnection === connection.id;

    return (
      <motion.g
        key={connection.id}
        className={`cursor-pointer ${isSelected ? 'z-10' : 'z-0'}`}
        onClick={() => setSelectedConnection(connection.id)}
        whileHover={{ scale: 1.02 }}
      >
        <line
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
          stroke={isSelected ? '#3B82F6' : '#9CA3AF'}
          strokeWidth={isSelected ? 3 : 2}
          markerEnd="url(#arrowhead)"
        />
        {connection.label && (
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 10}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {connection.label}
          </text>
        )}
      </motion.g>
    );
  }, [stages, zoomLevel, canvasOffset, selectedConnection]);

  // Main render
  if (!isVisible) return null;

  return (
    <TooltipProvider>
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
              <GitBranch className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Quick Pipeline Create</h2>
                <p className="text-sm text-muted-foreground">
                  Intelligent pipeline creation with cross-SPA orchestration
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!pipelineName || pipelineLoading}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleExecute}
                disabled={!pipelineName || stages.length === 0 || isExecuting}
              >
                <Play className="h-4 w-4 mr-1" />
                {isExecuting ? 'Executing...' : 'Execute'}
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

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Toolbox */}
            <div className="w-80 border-r bg-muted/30 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-4 m-2">
                  <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">AI</TabsTrigger>
                  <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  {/* Design Tab */}
                  <TabsContent value="design" className="h-full m-0 p-2 space-y-3">
                    <ScrollArea className="h-full">
                      {/* Pipeline Info */}
                      <Card className="mb-3">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Pipeline Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label htmlFor="pipeline-name" className="text-xs">Name</Label>
                            <Input
                              id="pipeline-name"
                              value={pipelineName}
                              onChange={(e) => {
                                setPipelineName(e.target.value);
                                setIsDirty(true);
                              }}
                              placeholder="Enter pipeline name"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label htmlFor="pipeline-description" className="text-xs">Description</Label>
                            <Textarea
                              id="pipeline-description"
                              value={pipelineDescription}
                              onChange={(e) => {
                                setPipelineDescription(e.target.value);
                                setIsDirty(true);
                              }}
                              placeholder="Enter pipeline description"
                              className="text-xs"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Stage Types */}
                      <Card className="mb-3">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Stage Types</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {stageTypes.map((stageType) => {
                            const StageIcon = stageType.icon;
                            return (
                              <div
                                key={stageType.type}
                                className="flex items-center space-x-2 p-2 rounded border cursor-pointer hover:bg-muted/50"
                                onClick={() => handleCreateStage(stageType.type, { x: 200, y: 200 })}
                              >
                                <div className={`p-1 rounded ${stageType.color}`}>
                                  <StageIcon className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium">{stageType.name}</p>
                                  <p className="text-xs text-muted-foreground">{stageType.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>

                      {/* Selected Stage Details */}
                      {selectedStage && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Stage Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {(() => {
                              const stage = stages.find(s => s.id === selectedStage);
                              if (!stage) return null;

                              return (
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-xs">Name</Label>
                                    <Input
                                      value={stage.name}
                                      onChange={(e) => handleUpdateStage(stage.id, { name: e.target.value })}
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Description</Label>
                                    <Textarea
                                      value={stage.description}
                                      onChange={(e) => handleUpdateStage(stage.id, { description: e.target.value })}
                                      className="text-xs"
                                      rows={2}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Parallelism</Label>
                                    <Slider
                                      value={[stage.config.parallelism || 1]}
                                      onValueChange={([value]) => handleUpdateStage(stage.id, {
                                        config: { ...stage.config, parallelism: value }
                                      })}
                                      max={10}
                                      min={1}
                                      step={1}
                                      className="mt-2"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {stage.config.parallelism || 1} parallel executions
                                    </span>
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteStage(stage.id)}
                                    className="w-full"
                                  >
                                    <Trash className="h-3 w-3 mr-1" />
                                    Delete Stage
                                  </Button>
                                </div>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  {/* Templates Tab */}
                  <TabsContent value="templates" className="h-full m-0 p-2">
                    <div className="space-y-3 h-full flex flex-col">
                      {/* Template Filters */}
                      <div className="space-y-2">
                        <Input
                          placeholder="Search templates..."
                          value={searchTemplateQuery}
                          onChange={(e) => setSearchTemplateQuery(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Select value={selectedTemplateCategory} onValueChange={setSelectedTemplateCategory}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="data-governance">Data Governance</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="quality-assurance">Quality Assurance</SelectItem>
                            <SelectItem value="discovery">Discovery</SelectItem>
                            <SelectItem value="monitoring">Monitoring</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
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
                                    {template.complexity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {template.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{template.stages.length} stages</span>
                                  <span>{template.estimatedDuration}min</span>
                                </div>
                                <div className="flex items-center mt-2 space-x-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{template.metadata.popularity}%</span>
                                  <span className="text-xs text-muted-foreground">success rate</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  {/* AI Tab */}
                  <TabsContent value="ai" className="h-full m-0 p-2">
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        {/* AI Optimizations */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                              <Brain className="h-4 w-4 mr-2" />
                              AI Optimizations
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {aiOptimizations.map((optimization) => (
                              <div key={optimization.id} className="p-2 border rounded">
                                <div className="flex items-start justify-between mb-1">
                                  <h5 className="text-xs font-medium">{optimization.title}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    {optimization.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {optimization.description}
                                </p>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-green-600">
                                    +{optimization.impact.improvement}% {optimization.impact.metric}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApplyAIOptimization(optimization)}
                                    className="h-6 text-xs"
                                  >
                                    Apply
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* AI Assistant */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                              <Sparkles className="h-4 w-4 mr-2" />
                              AI Assistant
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <Textarea
                              placeholder="Ask AI to help optimize your pipeline..."
                              className="text-xs"
                              rows={3}
                            />
                            <Button size="sm" className="w-full">
                              <Brain className="h-3 w-3 mr-1" />
                              Get AI Recommendations
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Config Tab */}
                  <TabsContent value="config" className="h-full m-0 p-2">
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        {/* Execution Settings */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Execution Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs">Default Parallelism</Label>
                              <Slider
                                value={[parallelismLevel]}
                                onValueChange={([value]) => setParallelismLevel(value)}
                                max={16}
                                min={1}
                                step={1}
                                className="mt-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {parallelismLevel} parallel executions
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Auto Optimization</Label>
                              <Switch
                                checked={autoOptimization}
                                onCheckedChange={setAutoOptimization}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Enable Monitoring</Label>
                              <Switch
                                checked={enableMonitoring}
                                onCheckedChange={setEnableMonitoring}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Enable Caching</Label>
                              <Switch
                                checked={enableCaching}
                                onCheckedChange={setEnableCaching}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Enable Retry</Label>
                              <Switch
                                checked={enableRetry}
                                onCheckedChange={setEnableRetry}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Resource Limits */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Resource Limits</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs">CPU Cores</Label>
                              <Slider
                                value={[resourceLimits.cpu]}
                                onValueChange={([value]) => setResourceLimits(prev => ({ ...prev, cpu: value }))}
                                max={32}
                                min={1}
                                step={1}
                                className="mt-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {resourceLimits.cpu} cores
                              </span>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Memory (GB)</Label>
                              <Slider
                                value={[resourceLimits.memory]}
                                onValueChange={([value]) => setResourceLimits(prev => ({ ...prev, memory: value }))}
                                max={128}
                                min={1}
                                step={1}
                                className="mt-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {resourceLimits.memory} GB
                              </span>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Storage (GB)</Label>
                              <Slider
                                value={[resourceLimits.storage]}
                                onValueChange={([value]) => setResourceLimits(prev => ({ ...prev, storage: value }))}
                                max={1000}
                                min={1}
                                step={10}
                                className="mt-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {resourceLimits.storage} GB
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Schedule Settings */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Schedule</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowScheduleDialog(true)}
                              className="w-full"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Configure Schedule
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col">
              {/* Canvas Toolbar */}
              <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'visual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('visual')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Visual
                  </Button>
                  <Button
                    variant={viewMode === 'code' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('code')}
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Code
                  </Button>
                  <Button
                    variant={viewMode === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('json')}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    JSON
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.1))}
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <span className="text-xs px-2">{Math.round(zoomLevel * 100)}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
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
                  
                  <Button
                    variant={showMinimap ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowMinimap(!showMinimap)}
                  >
                    <Map className="h-3 w-3 mr-1" />
                    Minimap
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 relative overflow-hidden bg-background">
                {viewMode === 'visual' && (
                  <div
                    ref={canvasRef}
                    className="w-full h-full relative cursor-move"
                    style={{
                      backgroundImage: showGrid 
                        ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
                        : undefined,
                      backgroundSize: showGrid ? '20px 20px' : undefined,
                    }}
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget) {
                        setIsDragging(true);
                        setDragStartPos({ x: e.clientX, y: e.clientY });
                      }
                    }}
                    onMouseMove={(e) => {
                      if (isDragging) {
                        const deltaX = e.clientX - dragStartPos.x;
                        const deltaY = e.clientY - dragStartPos.y;
                        setCanvasOffset(prev => ({
                          x: prev.x + deltaX,
                          y: prev.y + deltaY
                        }));
                        setDragStartPos({ x: e.clientX, y: e.clientY });
                      }
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    {/* SVG for connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
                        </marker>
                      </defs>
                      {connections.map(renderConnection)}
                    </svg>

                    {/* Render stages */}
                    {stages.map(renderStage)}

                    {/* Empty state */}
                    {stages.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Create Your First Pipeline</h3>
                          <p className="text-muted-foreground mb-4">
                            Start by adding stages from the toolbox or selecting a template
                          </p>
                          <Button onClick={() => setShowTemplateDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Choose Template
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {viewMode === 'code' && (
                  <div className="p-4 h-full overflow-auto">
                    <pre className="text-xs bg-muted p-4 rounded font-mono">
                      {JSON.stringify({ stages, connections }, null, 2)}
                    </pre>
                  </div>
                )}

                {viewMode === 'json' && (
                  <div className="p-4 h-full overflow-auto">
                    <pre className="text-xs bg-muted p-4 rounded font-mono">
                      {JSON.stringify({
                        name: pipelineName,
                        description: pipelineDescription,
                        stages,
                        connections,
                        variables: pipelineVariables
                      }, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Minimap */}
                {showMinimap && viewMode === 'visual' && (
                  <div className="absolute bottom-4 right-4 w-48 h-32 bg-background border rounded shadow-lg p-2">
                    <div className="text-xs font-medium mb-2">Pipeline Overview</div>
                    <div className="relative w-full h-full bg-muted/30 rounded">
                      {stages.map((stage) => (
                        <div
                          key={stage.id}
                          className="absolute w-3 h-3 bg-primary rounded"
                          style={{
                            left: `${(stage.position.x / 1000) * 100}%`,
                            top: `${(stage.position.y / 1000) * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Monitor */}
              {isExecuting && (
                <div className="border-t p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Pipeline Execution</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Running</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelPipelineExecution(currentPipeline?.id || '')}
                      >
                        <Stop className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                  <Progress value={executionProgress} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {executionProgress.toFixed(1)}% complete
                  </p>
                  
                  {executionLogs.length > 0 && (
                    <ScrollArea className="h-24 mt-2">
                      <div className="space-y-1">
                        {executionLogs.slice(-10).map((log) => (
                          <div key={log.id} className="text-xs font-mono">
                            <span className="text-muted-foreground">{log.timestamp}</span>
                            <span className={`ml-2 ${
                              log.level === 'error' ? 'text-red-500' :
                              log.level === 'warn' ? 'text-yellow-500' :
                              log.level === 'info' ? 'text-blue-500' :
                              'text-muted-foreground'
                            }`}>
                              [{log.level.toUpperCase()}]
                            </span>
                            <span className="ml-2">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar - Properties */}
            {(selectedStage || selectedConnection) && (
              <div className="w-80 border-l bg-muted/30 p-4">
                <ScrollArea className="h-full">
                  {selectedStage && (() => {
                    const stage = stages.find(s => s.id === selectedStage);
                    if (!stage) return null;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Stage Properties</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStage(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={stage.name}
                              onChange={(e) => handleUpdateStage(stage.id, { name: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={stage.description}
                              onChange={(e) => handleUpdateStage(stage.id, { description: e.target.value })}
                              className="text-xs"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Steps ({stage.steps.length})</Label>
                            <div className="mt-2 space-y-2">
                              {stage.steps.map((step) => (
                                <div key={step.id} className="p-2 border rounded text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{step.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {step.type}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground mt-1">{step.description}</p>
                                  {step.spadIntegration && (
                                    <div className="mt-1 text-muted-foreground">
                                      SPA: {step.spadIntegration.spaType}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  // Add step to stage
                                  const newStep: PipelineStep = {
                                    id: `step-${Date.now()}`,
                                    name: 'New Step',
                                    description: 'Step description',
                                    type: 'custom',
                                    config: {},
                                    status: 'pending'
                                  };
                                  handleUpdateStage(stage.id, {
                                    steps: [...stage.steps, newStep]
                                  });
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Step
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Configuration</Label>
                            <div className="mt-2 space-y-2">
                              <div>
                                <Label className="text-xs">Parallelism</Label>
                                <Slider
                                  value={[stage.config.parallelism || 1]}
                                  onValueChange={([value]) => handleUpdateStage(stage.id, {
                                    config: { ...stage.config, parallelism: value }
                                  })}
                                  max={10}
                                  min={1}
                                  step={1}
                                  className="mt-1"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {stage.config.parallelism || 1} parallel executions
                                </span>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Timeout (seconds)</Label>
                                <Input
                                  type="number"
                                  value={stage.config.timeout || 3600}
                                  onChange={(e) => handleUpdateStage(stage.id, {
                                    config: { ...stage.config, timeout: parseInt(e.target.value) }
                                  })}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {stage.metrics && (
                            <div>
                              <Label className="text-xs">Metrics</Label>
                              <div className="mt-2 space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>Throughput:</span>
                                  <span>{stage.metrics.throughput} req/s</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Latency:</span>
                                  <span>{stage.metrics.latency}ms</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Error Rate:</span>
                                  <span>{stage.metrics.errorRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Cost:</span>
                                  <span>${stage.metrics.costEstimate}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {selectedConnection && (() => {
                    const connection = connections.find(c => c.id === selectedConnection);
                    if (!connection) return null;

                    const sourceStage = stages.find(s => s.id === connection.sourceStageId);
                    const targetStage = stages.find(s => s.id === connection.targetStageId);

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Connection Properties</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConnection(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Source Stage</Label>
                            <Input
                              value={sourceStage?.name || ''}
                              disabled
                              className="h-8 text-xs"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Target Stage</Label>
                            <Input
                              value={targetStage?.name || ''}
                              disabled
                              className="h-8 text-xs"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Condition</Label>
                            <Select
                              value={connection.condition?.type || 'on-success'}
                              onValueChange={(value) => {
                                const updatedConnections = connections.map(c =>
                                  c.id === connection.id
                                    ? { ...c, condition: { ...c.condition, type: value as any } }
                                    : c
                                );
                                setConnections(updatedConnections);
                                setIsDirty(true);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="always">Always</SelectItem>
                                <SelectItem value="on-success">On Success</SelectItem>
                                <SelectItem value="on-failure">On Failure</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs">Label</Label>
                            <Input
                              value={connection.label || ''}
                              onChange={(e) => {
                                const updatedConnections = connections.map(c =>
                                  c.id === connection.id
                                    ? { ...c, label: e.target.value }
                                    : c
                                );
                                setConnections(updatedConnections);
                                setIsDirty(true);
                              }}
                              placeholder="Connection label"
                              className="h-8 text-xs"
                            />
                          </div>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setConnections(prev => prev.filter(c => c.id !== connection.id));
                              setSelectedConnection(null);
                              setIsDirty(true);
                            }}
                            className="w-full"
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            Delete Connection
                          </Button>
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
              <span>{stages.length} stages</span>
              <span>{connections.length} connections</span>
              {Object.keys(validationErrors).length > 0 && (
                <span className="text-red-500">
                  {Object.values(validationErrors).flat().length} validation errors
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {currentWorkspace && (
                <span>Workspace: {currentWorkspace.name}</span>
              )}
              <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Dialogs */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Choose Pipeline Template</DialogTitle>
              <DialogDescription>
                Select a template to get started quickly with a pre-configured pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-2 gap-4 p-4">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        loadTemplate(template);
                        setShowTemplateDialog(false);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline">
                            {template.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>{template.stages.length} stages</span>
                          <span>{template.estimatedDuration} min</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{template.metadata.popularity}%</span>
                          <span className="text-sm text-muted-foreground">success</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
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
          </DialogContent>
        </Dialog>

        <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Pipeline Metrics & Analytics</DialogTitle>
              <DialogDescription>
                Comprehensive metrics and performance analytics for your pipeline
              </DialogDescription>
            </DialogHeader>
            {pipelineMetrics && (
              <div className="grid grid-cols-2 gap-4 p-4">
                {/* Execution Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Execution Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Runs:</span>
                      <span>{pipelineMetrics.execution.totalRuns}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate:</span>
                      <span>{pipelineMetrics.execution.successRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Duration:</span>
                      <span>{Math.round(pipelineMetrics.execution.averageDuration / 1000)}s</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Throughput:</span>
                      <span>{pipelineMetrics.performance.throughput} req/s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Latency:</span>
                      <span>{pipelineMetrics.performance.latency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage:</span>
                      <span>{pipelineMetrics.performance.resourceUtilization.cpu}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span>${pipelineMetrics.cost.totalCost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cost per Run:</span>
                      <span>${pipelineMetrics.cost.costPerRun}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Optimization:</span>
                      <span>{pipelineMetrics.cost.optimization}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quality Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Data Quality:</span>
                      <span>{pipelineMetrics.quality.dataQualityScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Compliance:</span>
                      <span>{pipelineMetrics.quality.complianceScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Security:</span>
                      <span>{pipelineMetrics.quality.securityScore}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* AI Optimization Manual Steps Dialog */}
        <Dialog open={showOptimizationDialog} onOpenChange={setShowOptimizationDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>AI Optimization Manual Steps</DialogTitle>
              <DialogDescription>
                {currentOptimization?.name && `${currentOptimization.name} - `}
                Follow these manual steps to apply the optimization
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              {currentOptimization?.implementation?.steps && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Estimated Impact
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      {currentOptimization.impact}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Implementation Steps:</h4>
                    <ol className="space-y-3">
                      {currentOptimization.implementation.steps.map((step: string, index: number) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {currentOptimization?.complexity && (
                    <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Complexity Level
                      </h4>
                      <Badge variant={
                        currentOptimization.complexity === 'low' ? 'default' :
                        currentOptimization.complexity === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {currentOptimization.complexity.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default QuickPipelineCreate;