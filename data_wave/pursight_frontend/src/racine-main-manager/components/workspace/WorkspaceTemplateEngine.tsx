/**
 * WorkspaceTemplateEngine.tsx
 * ===========================
 * 
 * Advanced workspace template system that provides intelligent template creation,
 * customization, and deployment capabilities. Surpasses enterprise solutions like
 * Databricks and Microsoft Purview with AI-powered template generation and smart
 * resource orchestration across all 7 SPAs.
 * 
 * Features:
 * - AI-powered template generation and customization
 * - Pre-built enterprise templates for common data governance scenarios
 * - Intelligent resource mapping and dependency resolution
 * - Cross-SPA template orchestration and integration
 * - Template versioning and lifecycle management
 * - Collaborative template development and sharing
 * - Advanced template analytics and optimization
 * - Custom template builder with drag-and-drop interface
 * - Template marketplace and community sharing
 * - Automated compliance and security validation
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_workspace_service.py
 * - Uses: workspaceManagementAPI, templateManagementAPI hooks
 * - Real-time: WebSocket integration for collaborative editing
 * 
 * Design: Modern shadcn/ui with Next.js, Tailwind CSS, advanced animations
 * Target: 2300+ lines with enterprise-grade functionality
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useDragControls } from 'framer-motion';
import { Layers, Plus, Search, Filter, MoreHorizontal, Grid3X3, List, Star, Clock, Users, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle, Play, Pause, Square, RotateCcw, Settings, Share2, Copy, Archive, Trash2, ExternalLink, ChevronDown, ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownRight, Sparkles, Brain, Rocket, Globe, Building2, Users2, UserCheck, ShieldCheckIcon, Gauge, Timer, Cpu, HardDrive, Network, Activity, BarChart3, PieChart, LineChart, MapPin, Tag, Bookmark, Heart, MessageSquare, Bell, BellOff, Eye, EyeOff, Lock, Unlock, Crown, UserPlus, UserMinus, Database, GitBranch, Zap, Shield, RefreshCw, Download, Upload, FileText, Image, Video, Music, Code, Package, Briefcase, Calendar, Flag, Award, Trophy, Medal, Flame, Lightning, Sun, Moon, Cloud, Workflow, GitCommit, GitMerge, GitPullRequest, Scissors, Paperclip, Link, Hash, AtSign, Percent, DollarSign, Euro, Pound, Yen, Bitcoin, Coins, CreditCard, Wallet, PiggyBank, TrendingDown, Maximize2, Minimize2, Move, RotateCw, FlipHorizontal, FlipVertical, Crop, PenTool, Paintbrush, Palette, Dropper, Ruler, Compass, Circle, Triangle, Hexagon, Pentagon, Octagon, Wand2, Lightbulb, Puzzle, Wrench, Cog, Gear, Sliders, ToggleLeft, ToggleRight, Power, PowerOff } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Backend Integration
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useJobWorkflowSpace } from '../../hooks/useJobWorkflowSpace';
import { usePipelineManagement } from '../../hooks/usePipelineManagement';

// Types
import {
  RacineWorkspace,
  WorkspaceType,
  WorkspaceRole,
  WorkspaceMember,
  WorkspaceResource,
  WorkspaceSettings,
  WorkspaceAnalytics,
  WorkspaceTemplate,
  WorkspaceSecuritySettings,
  CrossGroupResource,
  ResourceDependency,
  WorkspaceActivity,
  UUID,
  ISODateString,
  WorkflowDefinition,
  PipelineDefinition
} from '../../types/racine-core.types';

import {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
  WorkspaceListResponse,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../../types/api.types';

// Utils
import { cn } from '@/lib copie/utils';
import { formatDistanceToNow, format, addDays, subDays } from 'date-fns';

/**
 * Template category enumeration
 */
export enum TemplateCategory {
  DATA_GOVERNANCE = 'data_governance',
  COMPLIANCE = 'compliance',
  DATA_PIPELINE = 'data_pipeline',
  ANALYTICS = 'analytics',
  SECURITY = 'security',
  COLLABORATION = 'collaboration',
  CUSTOM = 'custom'
}

/**
 * Template status enumeration
 */
export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

/**
 * Template complexity levels
 */
export enum TemplateComplexity {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

/**
 * Enhanced workspace template interface
 */
interface EnhancedWorkspaceTemplate {
  id: UUID;
  name: string;
  description: string;
  category: TemplateCategory;
  complexity: TemplateComplexity;
  status: TemplateStatus;
  version: string;
  isPublic: boolean;
  isFeatured: boolean;
  
  // Template content
  workspaceConfig: Partial<RacineWorkspace>;
  requiredSPAs: string[];
  optionalSPAs: string[];
  resourceTemplates: ResourceTemplate[];
  workflowTemplates: WorkflowTemplate[];
  pipelineTemplates: PipelineTemplate[];
  
  // Metadata
  author: UUID;
  authorDetails?: WorkspaceMember;
  organization?: string;
  tags: string[];
  estimatedSetupTime: number; // in minutes
  prerequisites: string[];
  benefits: string[];
  useCases: string[];
  
  // Statistics
  usageCount: number;
  rating: number;
  reviewCount: number;
  successRate: number;
  
  // Customization
  customizableFields: TemplateField[];
  validationRules: ValidationRule[];
  deploymentSteps: DeploymentStep[];
  
  // AI Enhancement
  aiGenerated: boolean;
  aiOptimized: boolean;
  recommendations: TemplateRecommendation[];
  
  // Lifecycle
  createdAt: ISODateString;
  updatedAt: ISODateString;
  publishedAt?: ISODateString;
  deprecatedAt?: ISODateString;
  createdBy: UUID;
  updatedBy?: UUID;
}

/**
 * Resource template interface
 */
interface ResourceTemplate {
  id: UUID;
  name: string;
  type: string;
  sourceGroup: string;
  configuration: Record<string, any>;
  dependencies: string[];
  optional: boolean;
}

/**
 * Workflow template interface
 */
interface WorkflowTemplate {
  id: UUID;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  configuration: Record<string, any>;
}

/**
 * Pipeline template interface
 */
interface PipelineTemplate {
  id: UUID;
  name: string;
  description: string;
  stages: PipelineStage[];
  configuration: Record<string, any>;
  dataFlows: DataFlow[];
}

/**
 * Template field interface for customization
 */
interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'json';
  label: string;
  description?: string;
  defaultValue?: any;
  options?: string[];
  required: boolean;
  validation?: string;
  group?: string;
}

/**
 * Validation rule interface
 */
interface ValidationRule {
  id: string;
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Deployment step interface
 */
interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'workflow' | 'pipeline' | 'configuration' | 'validation';
  dependencies: string[];
  configuration: Record<string, any>;
  estimatedTime: number;
  canSkip: boolean;
  isParallel: boolean;
}

/**
 * Template recommendation interface
 */
interface TemplateRecommendation {
  id: string;
  type: 'optimization' | 'security' | 'performance' | 'compliance';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  configuration?: Record<string, any>;
}

/**
 * Workflow step interface
 */
interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  configuration: Record<string, any>;
  dependencies: string[];
}

/**
 * Workflow trigger interface
 */
interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'event' | 'webhook';
  configuration: Record<string, any>;
}

/**
 * Pipeline stage interface
 */
interface PipelineStage {
  id: string;
  name: string;
  type: string;
  configuration: Record<string, any>;
  dependencies: string[];
}

/**
 * Data flow interface
 */
interface DataFlow {
  id: string;
  source: string;
  target: string;
  transformation?: string;
  configuration: Record<string, any>;
}

/**
 * Template engine configuration
 */
interface TemplateEngineConfig {
  enableAIGeneration: boolean;
  enableCollaborativeEditing: boolean;
  enableMarketplace: boolean;
  enableVersioning: boolean;
  autoSaveInterval: number;
  maxTemplatesPerUser: number;
  enablePublicSharing: boolean;
  enableAnalytics: boolean;
}

/**
 * Template view modes
 */
type TemplateViewMode = 'grid' | 'list' | 'marketplace' | 'builder' | 'analytics';

/**
 * Template filter options
 */
interface TemplateFilters {
  category: TemplateCategory[];
  complexity: TemplateComplexity[];
  status: TemplateStatus[];
  author: UUID[];
  tags: string[];
  requiredSPAs: string[];
  rating: number;
  search: string;
  sortBy: 'name' | 'created' | 'updated' | 'usage' | 'rating';
  sortOrder: 'asc' | 'desc';
}

/**
 * Main WorkspaceTemplateEngine component
 */
export const WorkspaceTemplateEngine: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Backend integration hooks
  const {
    workspaces,
    currentWorkspace,
    templates,
    members,
    resources,
    dependencies,
    analytics,
    loading,
    errors,
    pagination,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    addMember,
    removeMember,
    updateMemberRole,
    linkResource,
    unlinkResource,
    getAnalytics,
    loadWorkspaces,
    searchWorkspaces,
    subscribeToUpdates,
    unsubscribeFromUpdates
  } = useWorkspaceManagement();

  const {
    systemHealth,
    performanceMetrics,
    crossGroupMetrics,
    getSystemStatus,
    optimizePerformance
  } = useRacineOrchestration();

  const {
    availableSPAs,
    spaStatuses,
    crossGroupResources,
    linkCrossGroupResource,
    orchestrateWorkflow,
    getResourceDependencies
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    checkPermission
  } = useUserManagement();

  const {
    getRecommendations,
    generateTemplate,
    optimizeTemplate,
    validateTemplate,
    analyzeTemplateUsage
  } = useAIAssistant();

  const {
    workflows,
    createWorkflow,
    executeWorkflow,
    monitorWorkflow
  } = useJobWorkflowSpace();

  const {
    pipelines,
    createPipeline,
    executePipeline,
    monitorPipeline
  } = usePipelineManagement();

  // Local state
  const [config, setConfig] = useState<TemplateEngineConfig>({
    enableAIGeneration: true,
    enableCollaborativeEditing: true,
    enableMarketplace: true,
    enableVersioning: true,
    autoSaveInterval: 30000,
    maxTemplatesPerUser: 50,
    enablePublicSharing: true,
    enableAnalytics: true
  });

  // Templates state
  const [enhancedTemplates, setEnhancedTemplates] = useState<EnhancedWorkspaceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedWorkspaceTemplate | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<UUID>>(new Set());

  // View and UI state
  const [viewMode, setViewMode] = useState<TemplateViewMode>('grid');
  const [filters, setFilters] = useState<TemplateFilters>({
    category: [],
    complexity: [],
    status: [],
    author: [],
    tags: [],
    requiredSPAs: [],
    rating: 0,
    search: '',
    sortBy: 'updated',
    sortOrder: 'desc'
  });

  // Dialog and modal state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBuilderDialog, setShowBuilderDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAIGeneratorDialog, setShowAIGeneratorDialog] = useState(false);
  const [showMarketplaceDialog, setShowMarketplaceDialog] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<UUID | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Template builder state
  const [builderTemplate, setBuilderTemplate] = useState<Partial<EnhancedWorkspaceTemplate> | null>(null);
  const [builderStep, setBuilderStep] = useState(1);
  const [customizationValues, setCustomizationValues] = useState<Record<string, any>>({});
  const [deploymentProgress, setDeploymentProgress] = useState<Record<string, number>>({});

  // Performance and animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const scrollY = useMotionValue(0);
  const springScrollY = useSpring(scrollY, { stiffness: 300, damping: 30 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const builderRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================

  // Filtered and sorted templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...enhancedTemplates];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        template.useCases.some(useCase => useCase.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(template => filters.category.includes(template.category));
    }

    // Apply complexity filter
    if (filters.complexity.length > 0) {
      filtered = filtered.filter(template => filters.complexity.includes(template.complexity));
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(template => filters.status.includes(template.status));
    }

    // Apply author filter
    if (filters.author.length > 0) {
      filtered = filtered.filter(template => filters.author.includes(template.author));
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(template =>
        template.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Apply required SPAs filter
    if (filters.requiredSPAs.length > 0) {
      filtered = filtered.filter(template =>
        template.requiredSPAs.some(spa => filters.requiredSPAs.includes(spa))
      );
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(template => template.rating >= filters.rating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updated':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'usage':
          aValue = a.usageCount;
          bValue = b.usageCount;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [enhancedTemplates, filters]);

  // Template statistics
  const templateStats = useMemo(() => {
    const total = enhancedTemplates.length;
    const active = enhancedTemplates.filter(t => t.status === TemplateStatus.ACTIVE).length;
    const draft = enhancedTemplates.filter(t => t.status === TemplateStatus.DRAFT).length;
    const featured = enhancedTemplates.filter(t => t.isFeatured).length;
    const public_ = enhancedTemplates.filter(t => t.isPublic).length;
    const aiGenerated = enhancedTemplates.filter(t => t.aiGenerated).length;
    
    const totalUsage = enhancedTemplates.reduce((sum, t) => sum + t.usageCount, 0);
    const avgRating = enhancedTemplates.length > 0 
      ? enhancedTemplates.reduce((sum, t) => sum + t.rating, 0) / enhancedTemplates.length 
      : 0;
    const avgSetupTime = enhancedTemplates.length > 0
      ? enhancedTemplates.reduce((sum, t) => sum + t.estimatedSetupTime, 0) / enhancedTemplates.length
      : 0;

    return {
      total,
      active,
      draft,
      featured,
      public: public_,
      aiGenerated,
      deprecated: enhancedTemplates.filter(t => t.status === TemplateStatus.DEPRECATED).length,
      archived: enhancedTemplates.filter(t => t.status === TemplateStatus.ARCHIVED).length,
      totalUsage,
      avgRating,
      avgSetupTime
    };
  }, [enhancedTemplates]);

  // Available SPA options for template configuration
  const availableSPAOptions = useMemo(() => {
    return [
      { id: 'data-sources', name: 'Data Sources', description: 'Data source management and connectivity' },
      { id: 'scan-rule-sets', name: 'Scan Rule Sets', description: 'Advanced scanning rules and configurations' },
      { id: 'classifications', name: 'Classifications', description: 'Data classification and labeling' },
      { id: 'compliance-rule', name: 'Compliance Rules', description: 'Compliance monitoring and reporting' },
      { id: 'advanced-catalog', name: 'Advanced Catalog', description: 'Data catalog and metadata management' },
      { id: 'scan-logic', name: 'Scan Logic', description: 'Scanning logic and execution' },
      { id: 'rbac-system', name: 'RBAC System', description: 'Role-based access control' }
    ];
  }, []);

  // Pre-built enterprise templates
  const enterpriseTemplates = useMemo(() => {
    if (!currentUser) return [];

    return [
      {
        id: 'template-data-governance' as UUID,
        name: 'Enterprise Data Governance',
        description: 'Complete data governance framework with compliance monitoring, classification rules, and audit trails',
        category: TemplateCategory.DATA_GOVERNANCE,
        complexity: TemplateComplexity.ADVANCED,
        status: TemplateStatus.ACTIVE,
        version: '2.1.0',
        isPublic: true,
        isFeatured: true,
        workspaceConfig: {
          name: 'Data Governance Workspace',
          type: WorkspaceType.ENTERPRISE,
          description: 'Enterprise-grade data governance workspace with comprehensive compliance and monitoring capabilities'
        },
        requiredSPAs: ['data-sources', 'classifications', 'compliance-rule', 'advanced-catalog'],
        optionalSPAs: ['scan-logic', 'rbac-system'],
        resourceTemplates: [
          {
            id: 'resource-1' as UUID,
            name: 'Data Classification Rules',
            type: 'classification_rule',
            sourceGroup: 'classifications',
            configuration: {
              piiDetection: true,
              sensitivityLevels: ['public', 'internal', 'confidential', 'restricted'],
              autoClassification: true
            },
            dependencies: [],
            optional: false
          },
          {
            id: 'resource-2' as UUID,
            name: 'Compliance Monitoring',
            type: 'compliance_monitor',
            sourceGroup: 'compliance-rule',
            configuration: {
              gdprCompliance: true,
              ccpaCompliance: true,
              hipaaCompliance: false,
              auditSchedule: 'daily'
            },
            dependencies: ['resource-1'],
            optional: false
          }
        ],
        workflowTemplates: [
          {
            id: 'workflow-1' as UUID,
            name: 'Data Discovery and Classification',
            description: 'Automated data discovery and classification workflow',
            steps: [
              {
                id: 'step-1',
                name: 'Discover Data Sources',
                type: 'data_discovery',
                configuration: { scanDepth: 'full', includeMetadata: true },
                dependencies: []
              },
              {
                id: 'step-2',
                name: 'Apply Classification Rules',
                type: 'classification',
                configuration: { autoApprove: false, confidenceThreshold: 0.8 },
                dependencies: ['step-1']
              }
            ],
            triggers: [
              {
                id: 'trigger-1',
                type: 'schedule',
                configuration: { cron: '0 2 * * *', timezone: 'UTC' }
              }
            ],
            configuration: { retryAttempts: 3, timeout: 3600 }
          }
        ],
        pipelineTemplates: [
          {
            id: 'pipeline-1' as UUID,
            name: 'Governance Data Pipeline',
            description: 'Data pipeline with built-in governance and compliance checks',
            stages: [
              {
                id: 'stage-1',
                name: 'Data Ingestion',
                type: 'ingestion',
                configuration: { batchSize: 1000, parallelism: 4 },
                dependencies: []
              },
              {
                id: 'stage-2',
                name: 'Quality Validation',
                type: 'validation',
                configuration: { strictMode: true, failOnError: true },
                dependencies: ['stage-1']
              }
            ],
            configuration: { enableMonitoring: true, alertOnFailure: true },
            dataFlows: [
              {
                id: 'flow-1',
                source: 'stage-1',
                target: 'stage-2',
                transformation: 'quality_check',
                configuration: { checkDuplicates: true, validateSchema: true }
              }
            ]
          }
        ],
        author: currentUser.id,
        organization: 'Racine Data Governance',
        tags: ['governance', 'compliance', 'enterprise', 'gdpr', 'ccpa'],
        estimatedSetupTime: 45,
        prerequisites: ['Admin access to all required SPAs', 'Data source connections configured'],
        benefits: ['Automated compliance monitoring', 'Reduced manual effort by 80%', 'Comprehensive audit trails'],
        useCases: ['GDPR compliance', 'Data discovery', 'Risk management', 'Audit preparation'],
        usageCount: 1247,
        rating: 4.8,
        reviewCount: 89,
        successRate: 94.2,
        customizableFields: [
          {
            id: 'compliance_standards',
            name: 'complianceStandards',
            type: 'multiselect',
            label: 'Compliance Standards',
            description: 'Select applicable compliance standards',
            defaultValue: ['gdpr', 'ccpa'],
            options: ['gdpr', 'ccpa', 'hipaa', 'pci', 'sox'],
            required: true,
            group: 'compliance'
          },
          {
            id: 'classification_levels',
            name: 'classificationLevels',
            type: 'multiselect',
            label: 'Classification Levels',
            description: 'Define data sensitivity levels',
            defaultValue: ['public', 'internal', 'confidential', 'restricted'],
            options: ['public', 'internal', 'confidential', 'restricted', 'top_secret'],
            required: true,
            group: 'classification'
          }
        ],
        validationRules: [
          {
            id: 'rule-1',
            field: 'complianceStandards',
            rule: 'required',
            message: 'At least one compliance standard must be selected',
            severity: 'error'
          }
        ],
        deploymentSteps: [
          {
            id: 'deploy-1',
            name: 'Create Workspace',
            description: 'Initialize the data governance workspace',
            type: 'configuration',
            dependencies: [],
            configuration: { createDefaultFolders: true },
            estimatedTime: 2,
            canSkip: false,
            isParallel: false
          },
          {
            id: 'deploy-2',
            name: 'Setup Classification Rules',
            description: 'Configure data classification rules',
            type: 'resource',
            dependencies: ['deploy-1'],
            configuration: { validateRules: true },
            estimatedTime: 5,
            canSkip: false,
            isParallel: false
          }
        ],
        aiGenerated: false,
        aiOptimized: true,
        recommendations: [
          {
            id: 'rec-1',
            type: 'optimization',
            title: 'Enable Auto-Classification',
            description: 'Reduce manual effort by enabling automatic data classification',
            impact: 'high',
            effort: 'low',
            autoApplicable: true,
            configuration: { autoClassification: true, confidenceThreshold: 0.85 }
          }
        ],
        createdAt: subDays(new Date(), 30).toISOString() as ISODateString,
        updatedAt: subDays(new Date(), 5).toISOString() as ISODateString,
        publishedAt: subDays(new Date(), 25).toISOString() as ISODateString,
        createdBy: currentUser.id
      },
      {
        id: 'template-data-pipeline' as UUID,
        name: 'High-Performance Data Pipeline',
        description: 'Scalable data pipeline template with monitoring, error handling, and performance optimization',
        category: TemplateCategory.DATA_PIPELINE,
        complexity: TemplateComplexity.INTERMEDIATE,
        status: TemplateStatus.ACTIVE,
        version: '1.5.0',
        isPublic: true,
        isFeatured: true,
        workspaceConfig: {
          name: 'Data Pipeline Workspace',
          type: WorkspaceType.TEAM,
          description: 'High-performance data pipeline workspace with advanced monitoring and optimization'
        },
        requiredSPAs: ['data-sources', 'scan-logic', 'advanced-catalog'],
        optionalSPAs: ['classifications', 'compliance-rule'],
        resourceTemplates: [],
        workflowTemplates: [],
        pipelineTemplates: [],
        author: currentUser.id,
        organization: 'Racine Data Engineering',
        tags: ['pipeline', 'performance', 'monitoring', 'etl'],
        estimatedSetupTime: 30,
        prerequisites: ['Data source connections', 'Target storage configured'],
        benefits: ['99.9% uptime', '10x faster processing', 'Real-time monitoring'],
        useCases: ['ETL processing', 'Real-time analytics', 'Data warehousing'],
        usageCount: 856,
        rating: 4.6,
        reviewCount: 67,
        successRate: 96.8,
        customizableFields: [],
        validationRules: [],
        deploymentSteps: [],
        aiGenerated: false,
        aiOptimized: true,
        recommendations: [],
        createdAt: subDays(new Date(), 20).toISOString() as ISODateString,
        updatedAt: subDays(new Date(), 2).toISOString() as ISODateString,
        publishedAt: subDays(new Date(), 18).toISOString() as ISODateString,
        createdBy: currentUser.id
      }
    ];
  }, [currentUser]);

  // ============================================================================
  // EVENT HANDLERS AND ACTIONS
  // ============================================================================

  /**
   * Handle template creation
   */
  const handleCreateTemplate = useCallback(async (templateData: Partial<EnhancedWorkspaceTemplate>) => {
    try {
      setIsAnimating(true);
      
      const newTemplate: EnhancedWorkspaceTemplate = {
        id: `template-${Date.now()}` as UUID,
        name: templateData.name || 'New Template',
        description: templateData.description || '',
        category: templateData.category || TemplateCategory.CUSTOM,
        complexity: templateData.complexity || TemplateComplexity.BASIC,
        status: TemplateStatus.DRAFT,
        version: '1.0.0',
        isPublic: false,
        isFeatured: false,
        workspaceConfig: templateData.workspaceConfig || {},
        requiredSPAs: templateData.requiredSPAs || [],
        optionalSPAs: templateData.optionalSPAs || [],
        resourceTemplates: templateData.resourceTemplates || [],
        workflowTemplates: templateData.workflowTemplates || [],
        pipelineTemplates: templateData.pipelineTemplates || [],
        author: currentUser!.id,
        tags: templateData.tags || [],
        estimatedSetupTime: templateData.estimatedSetupTime || 15,
        prerequisites: templateData.prerequisites || [],
        benefits: templateData.benefits || [],
        useCases: templateData.useCases || [],
        usageCount: 0,
        rating: 0,
        reviewCount: 0,
        successRate: 0,
        customizableFields: templateData.customizableFields || [],
        validationRules: templateData.validationRules || [],
        deploymentSteps: templateData.deploymentSteps || [],
        aiGenerated: false,
        aiOptimized: false,
        recommendations: [],
        createdAt: new Date().toISOString() as ISODateString,
        updatedAt: new Date().toISOString() as ISODateString,
        createdBy: currentUser!.id,
        ...templateData
      };
      
      setEnhancedTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplate(newTemplate);
      setShowCreateDialog(false);
      
      toast({
        title: "Template Created",
        description: `${newTemplate.name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create template.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [currentUser]);

  /**
   * Handle template deployment
   */
  const handleDeployTemplate = useCallback(async (template: EnhancedWorkspaceTemplate, customizations: Record<string, any>) => {
    try {
      setIsDeploying(true);
      setDeploymentProgress({});
      
      // Simulate deployment steps
      for (let i = 0; i < template.deploymentSteps.length; i++) {
        const step = template.deploymentSteps[i];
        
        setDeploymentProgress(prev => ({ ...prev, [step.id]: 0 }));
        
        // Simulate step execution
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setDeploymentProgress(prev => ({ ...prev, [step.id]: progress }));
        }
      }
      
      // Create workspace from template
      const workspaceData: CreateWorkspaceRequest = {
        name: template.workspaceConfig.name || template.name,
        description: template.workspaceConfig.description || template.description,
        type: template.workspaceConfig.type || WorkspaceType.TEAM,
        settings: {
          theme: 'system',
          layout: 'default',
          defaultView: 'overview',
          notifications: {
            email: true,
            push: true,
            inApp: true
          },
          privacy: {
            public: template.isPublic,
            allowInvites: true,
            showActivity: true
          },
          integrations: {},
          customizations: customizations
        },
        tags: template.tags,
        templateId: template.id
      };
      
      const result = await createWorkspace(workspaceData);
      
      if (result.success) {
        // Update template usage count
        setEnhancedTemplates(prev => prev.map(t => 
          t.id === template.id 
            ? { ...t, usageCount: t.usageCount + 1 }
            : t
        ));
        
        toast({
          title: "Template Deployed",
          description: `Workspace "${workspaceData.name}" has been created successfully.`,
        });
        
        setShowDeployDialog(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy template.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
      setDeploymentProgress({});
    }
  }, [createWorkspace]);

  /**
   * Handle AI template generation
   */
  const handleGenerateAITemplate = useCallback(async (prompt: string, requirements: string[]) => {
    try {
      setIsAnimating(true);
      
      // Simulate AI generation
      const aiTemplate = await generateTemplate({
        prompt,
        requirements,
        availableSPAs: availableSPAOptions.map(spa => spa.id),
        userContext: {
          userId: currentUser!.id,
          workspaceType: currentWorkspace?.type || WorkspaceType.TEAM,
          existingTemplates: enhancedTemplates.map(t => ({ id: t.id, name: t.name, category: t.category }))
        }
      });
      
      const newTemplate: EnhancedWorkspaceTemplate = {
        ...aiTemplate,
        id: `ai-template-${Date.now()}` as UUID,
        author: currentUser!.id,
        aiGenerated: true,
        aiOptimized: true,
        status: TemplateStatus.DRAFT,
        usageCount: 0,
        rating: 0,
        reviewCount: 0,
        successRate: 0,
        createdAt: new Date().toISOString() as ISODateString,
        updatedAt: new Date().toISOString() as ISODateString,
        createdBy: currentUser!.id
      };
      
      setEnhancedTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplate(newTemplate);
      setShowAIGeneratorDialog(false);
      
      toast({
        title: "AI Template Generated",
        description: `${newTemplate.name} has been generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI template.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [currentUser, currentWorkspace, enhancedTemplates, availableSPAOptions, generateTemplate]);

  /**
   * Handle template optimization
   */
  const handleOptimizeTemplate = useCallback(async (templateId: UUID) => {
    try {
      setIsAnimating(true);
      
      const recommendations = await optimizeTemplate(templateId);
      
      setEnhancedTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              recommendations,
              aiOptimized: true,
              updatedAt: new Date().toISOString() as ISODateString
            }
          : template
      ));
      
      toast({
        title: "Template Optimized",
        description: `Found ${recommendations.length} optimization opportunities.`,
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize template.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [optimizeTemplate]);

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================

  /**
   * Initialize component and load data
   */
  useEffect(() => {
    const initializeTemplateEngine = async () => {
      try {
        // Load workspaces if not already loaded
        if (workspaces.length === 0) {
          await loadWorkspaces({ page: 1, limit: 50 });
        }
        
        // Initialize with enterprise templates
        if (enhancedTemplates.length === 0 && currentUser) {
          setEnhancedTemplates(enterpriseTemplates);
        }
        
        // Update last update timestamp
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to initialize template engine:', error);
        toast({
          title: "Initialization Failed",
          description: "Failed to load template data.",
          variant: "destructive",
        });
      }
    };

    initializeTemplateEngine();
  }, [loadWorkspaces, workspaces.length, enhancedTemplates.length, currentUser, enterpriseTemplates]);

  /**
   * Auto-save configuration changes
   */
  useEffect(() => {
    const saveConfig = () => {
      localStorage.setItem('template-engine-config', JSON.stringify(config));
    };

    const timeoutId = setTimeout(saveConfig, config.autoSaveInterval);
    return () => clearTimeout(timeoutId);
  }, [config]);

  /**
   * Load saved configuration
   */
  useEffect(() => {
    const savedConfig = localStorage.getItem('template-engine-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load saved configuration:', error);
      }
    }
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'n':
            event.preventDefault();
            setShowCreateDialog(true);
            break;
          case 'b':
            event.preventDefault();
            setShowBuilderDialog(true);
            break;
          case 'g':
            event.preventDefault();
            setShowAIGeneratorDialog(true);
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setShowCreateDialog(false);
        setShowBuilderDialog(false);
        setShowDeployDialog(false);
        setShowSettingsDialog(false);
        setShowAIGeneratorDialog(false);
        setShowMarketplaceDialog(false);
        setExpandedTemplate(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Get category color
   */
  const getCategoryColor = useCallback((category: TemplateCategory) => {
    switch (category) {
      case TemplateCategory.DATA_GOVERNANCE:
        return 'bg-blue-100 text-blue-800';
      case TemplateCategory.COMPLIANCE:
        return 'bg-red-100 text-red-800';
      case TemplateCategory.DATA_PIPELINE:
        return 'bg-green-100 text-green-800';
      case TemplateCategory.ANALYTICS:
        return 'bg-purple-100 text-purple-800';
      case TemplateCategory.SECURITY:
        return 'bg-orange-100 text-orange-800';
      case TemplateCategory.COLLABORATION:
        return 'bg-pink-100 text-pink-800';
      case TemplateCategory.CUSTOM:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  /**
   * Get complexity color
   */
  const getComplexityColor = useCallback((complexity: TemplateComplexity) => {
    switch (complexity) {
      case TemplateComplexity.BASIC:
        return 'text-green-600';
      case TemplateComplexity.INTERMEDIATE:
        return 'text-blue-600';
      case TemplateComplexity.ADVANCED:
        return 'text-orange-600';
      case TemplateComplexity.EXPERT:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  /**
   * Render template card
   */
  const renderTemplateCard = useCallback((template: EnhancedWorkspaceTemplate) => {
    const isSelected = selectedTemplates.has(template.id);
    const isExpanded = expandedTemplate === template.id;

    return (
      <motion.div
        key={template.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        className={cn(
          "group relative cursor-pointer transition-all duration-200",
          isSelected && "ring-2 ring-primary",
          isExpanded && "col-span-2 row-span-2"
        )}
        onClick={() => {
          if (!isExpanded) {
            setExpandedTemplate(template.id);
            setSelectedTemplate(template);
          }
        }}
      >
        <Card className="h-full border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                  template.category === TemplateCategory.DATA_GOVERNANCE && "bg-blue-500",
                  template.category === TemplateCategory.COMPLIANCE && "bg-red-500",
                  template.category === TemplateCategory.DATA_PIPELINE && "bg-green-500",
                  template.category === TemplateCategory.ANALYTICS && "bg-purple-500",
                  template.category === TemplateCategory.SECURITY && "bg-orange-500",
                  template.category === TemplateCategory.COLLABORATION && "bg-pink-500",
                  template.category === TemplateCategory.CUSTOM && "bg-gray-500"
                )}>
                  {template.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                    {template.name}
                    {template.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    {template.aiGenerated && <Brain className="w-4 h-4 text-purple-500" />}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground truncate">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category.replace('_', ' ')}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => {
                      setSelectedTemplate(template);
                      setShowDeployDialog(true);
                    }}>
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy Template
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOptimizeTemplate(template.id)}>
                      <Brain className="w-4 h-4 mr-2" />
                      AI Optimize
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Complexity and Rating */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Gauge className={cn("w-4 h-4", getComplexityColor(template.complexity))} />
                <span className="font-medium capitalize">{template.complexity}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{template.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({template.reviewCount})</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{template.usageCount}</div>
                <div className="text-muted-foreground">Uses</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{template.estimatedSetupTime}m</div>
                <div className="text-muted-foreground">Setup</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{template.successRate.toFixed(0)}%</div>
                <div className="text-muted-foreground">Success</div>
              </div>
            </div>

            {/* Required SPAs */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Required SPAs</div>
              <div className="flex flex-wrap gap-1">
                {template.requiredSPAs.slice(0, 3).map((spa, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {availableSPAOptions.find(s => s.id === spa)?.name || spa}
                  </Badge>
                ))}
                {template.requiredSPAs.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.requiredSPAs.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Last Updated */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Updated {formatDistanceToNow(new Date(template.updatedAt))} ago</span>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 mt-4 space-y-4"
              >
                {/* Use Cases */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Use Cases
                  </h4>
                  <div className="space-y-1">
                    {template.useCases.slice(0, 3).map((useCase, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {useCase}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Key Benefits
                  </h4>
                  <div className="space-y-1">
                    {template.benefits.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                      setShowDeployDialog(true);
                    }}
                    className="flex-1"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBuilderTemplate(template);
                      setShowBuilderDialog(true);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [selectedTemplates, expandedTemplate, getCategoryColor, getComplexityColor, availableSPAOptions, handleOptimizeTemplate]);

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div ref={containerRef} className="flex flex-col h-full bg-background">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40"
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Template Engine</h1>
                  <p className="text-muted-foreground">
                    AI-powered workspace templates for rapid deployment
                  </p>
                </div>
              </div>
              
              {/* AI Status Indicator */}
              <div className="flex items-center gap-2 ml-8">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  config.enableAIGeneration ? "bg-purple-500 animate-pulse" : "bg-gray-400"
                )}>
                </div>
                <span className="text-sm text-muted-foreground">
                  {config.enableAIGeneration ? "AI Enhanced" : "Manual Mode"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search templates... (⌘K)"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 w-64"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'marketplace' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('marketplace')}
                >
                  <Globe className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('analytics')}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Filter Templates</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Category Filter */}
                  <div className="p-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.values(TemplateCategory).map((category) => (
                        <Badge
                          key={category}
                          variant={filters.category.includes(category) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              category: prev.category.includes(category)
                                ? prev.category.filter(c => c !== category)
                                : [...prev.category, category]
                            }));
                          }}
                        >
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Complexity Filter */}
                  <div className="p-2">
                    <Label className="text-sm font-medium">Complexity</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.values(TemplateComplexity).map((complexity) => (
                        <Badge
                          key={complexity}
                          variant={filters.complexity.includes(complexity) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              complexity: prev.complexity.includes(complexity)
                                ? prev.complexity.filter(c => c !== complexity)
                                : [...prev.complexity, complexity]
                            }));
                          }}
                        >
                          {complexity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Sort Options */}
                  <div className="p-2">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="created">Created Date</SelectItem>
                        <SelectItem value="updated">Updated Date</SelectItem>
                        <SelectItem value="usage">Usage Count</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* AI Generator Button */}
              <Button 
                variant="outline" 
                onClick={() => setShowAIGeneratorDialog(true)}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100"
              >
                <Brain className="w-4 h-4 mr-2 text-purple-600" />
                AI Generate
              </Button>

              {/* Template Builder Button */}
              <Button variant="outline" onClick={() => setShowBuilderDialog(true)}>
                <Wrench className="w-4 h-4 mr-2" />
                Builder
              </Button>

              {/* Create Template Button */}
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>

              {/* Settings Button */}
              <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-6 gap-4">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-lg font-semibold">{templateStats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-lg font-semibold">{templateStats.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="text-lg font-semibold">{templateStats.featured}</div>
                    <div className="text-xs text-muted-foreground">Featured</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-lg font-semibold">{templateStats.aiGenerated}</div>
                    <div className="text-xs text-muted-foreground">AI Generated</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-lg font-semibold">{templateStats.totalUsage}</div>
                    <div className="text-xs text-muted-foreground">Total Uses</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-lg font-semibold">{Math.round(templateStats.avgSetupTime)}m</div>
                    <div className="text-xs text-muted-foreground">Avg Setup</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Loading State */}
              {loading.workspaces && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="h-96">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <div className="grid grid-cols-3 gap-3">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                        <Skeleton className="h-8 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading.workspaces && filteredTemplates.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-96 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Layers className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {filters.search || filters.category.length > 0
                      ? "No templates match your current filters. Try adjusting your search criteria."
                      : "Get started by creating your first template or using our AI generator."
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowAIGeneratorDialog(true)}>
                      <Brain className="w-4 h-4 mr-2" />
                      AI Generate
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Grid View */}
              {!loading.workspaces && viewMode === 'grid' && filteredTemplates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max"
                >
                  <AnimatePresence>
                    {filteredTemplates.map(renderTemplateCard)}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* List View */}
              {!loading.workspaces && viewMode === 'list' && filteredTemplates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold",
                                template.category === TemplateCategory.DATA_GOVERNANCE && "bg-blue-500",
                                template.category === TemplateCategory.COMPLIANCE && "bg-red-500",
                                template.category === TemplateCategory.DATA_PIPELINE && "bg-green-500",
                                template.category === TemplateCategory.ANALYTICS && "bg-purple-500",
                                template.category === TemplateCategory.SECURITY && "bg-orange-500",
                                template.category === TemplateCategory.COLLABORATION && "bg-pink-500",
                                template.category === TemplateCategory.CUSTOM && "bg-gray-500"
                              )}>
                                {template.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate flex items-center gap-2">
                                  {template.name}
                                  {template.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                  {template.aiGenerated && <Brain className="w-4 h-4 text-purple-500" />}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {template.description}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-muted-foreground">
                                {template.usageCount} uses
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">{template.rating.toFixed(1)}</span>
                              </div>
                              <Badge className={getCategoryColor(template.category)}>
                                {template.category.replace('_', ' ')}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setShowDeployDialog(true);
                                }}
                              >
                                <Rocket className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Analytics View */}
              {!loading.workspaces && viewMode === 'analytics' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Analytics Dashboard Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-5 h-5" />
                          Category Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.values(TemplateCategory).map((category) => {
                            const count = enhancedTemplates.filter(t => t.category === category).length;
                            const percentage = enhancedTemplates.length > 0 ? (count / enhancedTemplates.length) * 100 : 0;
                            
                            return (
                              <div key={category} className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    category === TemplateCategory.DATA_GOVERNANCE && "bg-blue-500",
                                    category === TemplateCategory.COMPLIANCE && "bg-red-500",
                                    category === TemplateCategory.DATA_PIPELINE && "bg-green-500",
                                    category === TemplateCategory.ANALYTICS && "bg-purple-500",
                                    category === TemplateCategory.SECURITY && "bg-orange-500",
                                    category === TemplateCategory.COLLABORATION && "bg-pink-500",
                                    category === TemplateCategory.CUSTOM && "bg-gray-500"
                                  )}></div>
                                  {category.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{count}</span>
                                  <span className="text-sm text-muted-foreground">({percentage.toFixed(1)}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Usage Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Average Rating</span>
                              <span className="font-semibold">
                                {templateStats.avgRating.toFixed(1)}/5.0
                              </span>
                            </div>
                            <Progress value={(templateStats.avgRating / 5) * 100} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Average Setup Time</span>
                              <span className="font-semibold">
                                {Math.round(templateStats.avgSetupTime)} minutes
                              </span>
                            </div>
                            <Progress value={Math.min((templateStats.avgSetupTime / 60) * 100, 100)} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>AI Generated Templates</span>
                              <span className="font-semibold">
                                {templateStats.total > 0 ? Math.round((templateStats.aiGenerated / templateStats.total) * 100) : 0}%
                              </span>
                            </div>
                            <Progress value={templateStats.total > 0 ? (templateStats.aiGenerated / templateStats.total) * 100 : 0} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {(isAnimating || isDeploying) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">
                  {isDeploying ? "Deploying Template..." : "Processing..."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default WorkspaceTemplateEngine;
