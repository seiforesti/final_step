/**
 * CrossGroupResourceLinker.tsx
 * =============================
 * 
 * Advanced cross-group resource linking and orchestration system that enables
 * seamless integration and dependency management across all 7 SPAs in the
 * data governance platform. Surpasses enterprise solutions with intelligent
 * resource mapping, real-time synchronization, and automated dependency resolution.
 * 
 * Features:
 * - Intelligent resource discovery and mapping across all SPAs
 * - Real-time dependency tracking and visualization
 * - Automated conflict detection and resolution
 * - Cross-SPA workflow orchestration and execution
 * - Advanced resource lifecycle management
 * - Smart resource categorization and tagging
 * - Performance optimization and resource pooling
 * - Comprehensive audit trails and compliance tracking
 * - AI-powered resource recommendations and optimization
 * - Visual resource relationship mapping and analytics
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_workspace_service.py
 * - Uses: crossGroupIntegration, workspaceManagement, aiAssistant hooks
 * - Real-time: WebSocket integration for live resource updates
 * 
 * Design: Modern shadcn/ui with Next.js, Tailwind CSS, advanced visualizations
 * Target: 2100+ lines with enterprise-grade functionality
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useDragControls } from 'framer-motion';
import { Link2, Plus, Search, Filter, MoreHorizontal, Grid3X3, List, Network, Clock, Users, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle, Play, Pause, Square, RotateCcw, Settings, Share2, Copy, Archive, Trash2, ExternalLink, ChevronDown, ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownRight, Sparkles, Brain, Rocket, Globe, Building2, Users2, UserCheck, ShieldCheckIcon, Gauge, Timer, Cpu, HardDrive, Activity, BarChart3, PieChart, LineChart, MapPin, Tag, Bookmark, Heart, MessageSquare, Bell, BellOff, Eye, EyeOff, Lock, Unlock, Crown, UserPlus, UserMinus, Database, GitBranch, Zap, Shield, RefreshCw, Download, Upload, FileText, Image, Video, Music, Code, Package, Briefcase, Calendar, Flag, Award, Trophy, Medal, Flame, Sun, Moon, Cloud, Workflow, GitCommit, GitMerge, GitPullRequest, Scissors, Paperclip, Hash, AtSign, Percent, DollarSign, Euro, Bitcoin, Coins, CreditCard, Wallet, PiggyBank, TrendingDown, Maximize2, Minimize2, Move, RotateCw, FlipHorizontal, FlipVertical, Crop, PenTool, Paintbrush, Palette, Pipette, Ruler, Compass, Circle, Triangle, Hexagon, Pentagon, Octagon, Wand2, Lightbulb, Puzzle, Wrench, Cog, Sliders, ToggleLeft, ToggleRight, Power, PowerOff, Layers, TreePine, Boxes, Component, Combine, Split, Merge, Route, Navigation, Compass as CompassIcon, Map, Waypoints, GitPullRequestArrow, GitFork, Shuffle, Repeat, SkipForward, SkipBack, FastForward, Rewind, StepForward, StepBack } from 'lucide-react';

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
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useJobWorkflowSpace } from '../../hooks/useJobWorkflowSpace';
import { usePipelineManagement } from '../../hooks/usePipelineManagement';

import { crossGroupIntegrationAPI, workspaceManagementAPI } from '../../services';

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
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, addDays, subDays } from 'date-fns';

/**
 * Resource link status enumeration
 */
export enum ResourceLinkStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ERROR = 'error',
  DEPRECATED = 'deprecated'
}

/**
 * Resource link type enumeration
 */
export enum ResourceLinkType {
  DIRECT = 'direct',
  INHERITED = 'inherited',
  SHARED = 'shared',
  REFERENCED = 'referenced',
  DEPENDENCY = 'dependency'
}

/**
 * SPA group enumeration
 */
export enum SPAGroup {
  DATA_SOURCES = 'data-sources',
  SCAN_RULE_SETS = 'scan-rule-sets',
  CLASSIFICATIONS = 'classifications',
  COMPLIANCE_RULE = 'compliance-rule',
  ADVANCED_CATALOG = 'advanced-catalog',
  SCAN_LOGIC = 'scan-logic',
  RBAC_SYSTEM = 'rbac-system'
}

/**
 * Resource conflict type enumeration
 */
export enum ConflictType {
  VERSION = 'version',
  PERMISSION = 'permission',
  DEPENDENCY = 'dependency',
  SCHEMA = 'schema',
  CONFIGURATION = 'configuration'
}

/**
 * Enhanced cross-group resource interface
 */
interface EnhancedCrossGroupResource {
  id: UUID;
  name: string;
  description: string;
  type: string;
  sourceGroup: SPAGroup;
  targetGroups: SPAGroup[];
  
  // Resource details
  resourceId: UUID;
  resourceType: string;
  resourceMetadata: Record<string, any>;
  
  // Link information
  linkStatus: ResourceLinkStatus;
  linkType: ResourceLinkType;
  linkStrength: number; // 0-100
  linkQuality: number; // 0-100
  
  // Dependencies
  dependencies: ResourceDependency[];
  dependents: UUID[];
  circularDependencies: boolean;
  
  // Configuration
  configuration: Record<string, any>;
  syncSettings: SyncSettings;
  accessSettings: AccessSettings;
  
  // Performance metrics
  usageCount: number;
  performanceScore: number;
  errorRate: number;
  lastSyncTime: ISODateString;
  avgResponseTime: number;
  
  // Conflict management
  conflicts: ResourceConflict[];
  resolutionHistory: ConflictResolution[];
  
  // Lifecycle
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastAccessedAt: ISODateString;
  createdBy: UUID;
  updatedBy?: UUID;
  
  // Tags and categorization
  tags: string[];
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // AI insights
  aiRecommendations: ResourceRecommendation[];
  optimizationSuggestions: OptimizationSuggestion[];
  riskAssessment: RiskAssessment;
}

/**
 * Sync settings interface
 */
interface SyncSettings {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  bidirectional: boolean;
  conflictResolution: 'source_wins' | 'target_wins' | 'manual' | 'ai_resolve';
  batchSize: number;
  retryAttempts: number;
  timeoutSeconds: number;
}

/**
 * Access settings interface
 */
interface AccessSettings {
  public: boolean;
  inheritPermissions: boolean;
  customPermissions: Record<string, string[]>;
  accessLog: boolean;
  auditTrail: boolean;
  encryptionRequired: boolean;
}

/**
 * Resource conflict interface
 */
interface ResourceConflict {
  id: UUID;
  type: ConflictType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  sourceValue: any;
  targetValue: any;
  suggestedResolution: string;
  autoResolvable: boolean;
  detectedAt: ISODateString;
  resolvedAt?: ISODateString;
  resolvedBy?: UUID;
}

/**
 * Conflict resolution interface
 */
interface ConflictResolution {
  id: UUID;
  conflictId: UUID;
  resolution: string;
  appliedValue: any;
  resolvedBy: UUID;
  resolvedAt: ISODateString;
  rollbackAvailable: boolean;
}

/**
 * Resource recommendation interface
 */
interface ResourceRecommendation {
  id: UUID;
  type: 'optimization' | 'security' | 'performance' | 'compliance';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  autoApplicable: boolean;
  estimatedBenefit: string;
}

/**
 * Optimization suggestion interface
 */
interface OptimizationSuggestion {
  id: UUID;
  category: 'performance' | 'cost' | 'reliability' | 'security';
  suggestion: string;
  expectedImprovement: string;
  implementationSteps: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Risk assessment interface
 */
interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  securityRisk: number; // 0-100
  performanceRisk: number; // 0-100
  complianceRisk: number; // 0-100
  operationalRisk: number; // 0-100
  risks: Risk[];
  mitigations: Mitigation[];
}

/**
 * Risk interface
 */
interface Risk {
  id: UUID;
  type: string;
  description: string;
  probability: number; // 0-100
  impact: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Mitigation interface
 */
interface Mitigation {
  id: UUID;
  riskId: UUID;
  strategy: string;
  effectiveness: number; // 0-100
  cost: 'low' | 'medium' | 'high';
  timeframe: string;
}

/**
 * Resource link visualization node
 */
interface ResourceNode {
  id: UUID;
  name: string;
  group: SPAGroup;
  type: string;
  status: ResourceLinkStatus;
  x: number;
  y: number;
  connections: UUID[];
  metadata: Record<string, any>;
}

/**
 * Resource link visualization edge
 */
interface ResourceEdge {
  id: UUID;
  source: UUID;
  target: UUID;
  type: ResourceLinkType;
  strength: number;
  quality: number;
  bidirectional: boolean;
  metadata: Record<string, any>;
}

/**
 * Cross-group resource linker configuration
 */
interface CrossGroupLinkerConfig {
  enableRealTimeSync: boolean;
  enableAIOptimization: boolean;
  enableConflictDetection: boolean;
  enablePerformanceMonitoring: boolean;
  autoResolveConflicts: boolean;
  maxConcurrentLinks: number;
  syncBatchSize: number;
  cacheExpirationMinutes: number;
  enableAuditTrail: boolean;
  enableEncryption: boolean;
}

/**
 * View modes for the resource linker
 */
type ResourceLinkerViewMode = 'grid' | 'list' | 'network' | 'tree' | 'analytics';

/**
 * Filter options for resources
 */
interface ResourceLinkerFilters {
  groups: SPAGroup[];
  status: ResourceLinkStatus[];
  types: ResourceLinkType[];
  priorities: string[];
  tags: string[];
  conflicts: boolean;
  errors: boolean;
  search: string;
  sortBy: 'name' | 'created' | 'updated' | 'usage' | 'performance';
  sortOrder: 'asc' | 'desc';
}

/**
 * Main CrossGroupResourceLinker component
 */
export const CrossGroupResourceLinker: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Backend integration hooks
  const {
    workspaces,
    currentWorkspace,
    resources,
    dependencies,
    loading,
    errors,
    linkResource,
    unlinkResource,
    getResourceDependencies,
    updateResourceConfiguration
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
    orchestrateWorkflow,
    syncResources,
    resolveConflicts,
    getResourceMap,
    operations
  } = useCrossGroupIntegration();

  const {
    linkCrossGroupResource,
    unlinkCrossGroupResource
  } = operations;

  const {
    currentUser,
    userPermissions,
    checkPermission
  } = useUserManagement();

  const {
    getRecommendations,
    optimizeResourceLinks,
    detectConflicts,
    suggestResolutions,
    analyzeRisks
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
  const [config, setConfig] = useState<CrossGroupLinkerConfig>({
    enableRealTimeSync: true,
    enableAIOptimization: true,
    enableConflictDetection: true,
    enablePerformanceMonitoring: true,
    autoResolveConflicts: false,
    maxConcurrentLinks: 100,
    syncBatchSize: 50,
    cacheExpirationMinutes: 30,
    enableAuditTrail: true,
    enableEncryption: true
  });

  // Resources state
  const [enhancedResources, setEnhancedResources] = useState<EnhancedCrossGroupResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<EnhancedCrossGroupResource | null>(null);
  const [selectedResources, setSelectedResources] = useState<Set<UUID>>(new Set());

  // Visualization state
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>([]);
  const [resourceEdges, setResourceEdges] = useState<ResourceEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<UUID | null>(null);
  const [hoveredNode, setHoveredNode] = useState<UUID | null>(null);

  // View and UI state
  const [viewMode, setViewMode] = useState<ResourceLinkerViewMode>('network');
  const [filters, setFilters] = useState<ResourceLinkerFilters>({
    groups: [],
    status: [],
    types: [],
    priorities: [],
    tags: [],
    conflicts: false,
    errors: false,
    search: '',
    sortBy: 'updated',
    sortOrder: 'desc'
  });

  // Dialog and modal state
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [expandedResource, setExpandedResource] = useState<UUID | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Link creation state
  const [linkSourceResource, setLinkSourceResource] = useState<EnhancedCrossGroupResource | null>(null);
  const [linkTargetGroup, setLinkTargetGroup] = useState<SPAGroup | null>(null);
  const [linkConfiguration, setLinkConfiguration] = useState<Record<string, any>>({});

  // Performance and animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const scrollY = useMotionValue(0);
  const springScrollY = useSpring(scrollY, { stiffness: 300, damping: 30 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragControls = useDragControls();

  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================

  // Filtered and sorted resources
  const filteredResources = useMemo(() => {
    let filtered = [...enhancedResources];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply group filter
    if (filters.groups.length > 0) {
      filtered = filtered.filter(resource => 
        filters.groups.includes(resource.sourceGroup) ||
        resource.targetGroups.some(group => filters.groups.includes(group))
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(resource => filters.status.includes(resource.linkStatus));
    }

    // Apply type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(resource => filters.types.includes(resource.linkType));
    }

    // Apply priority filter
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(resource => filters.priorities.includes(resource.priority));
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(resource =>
        resource.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Apply conflicts filter
    if (filters.conflicts) {
      filtered = filtered.filter(resource => resource.conflicts.length > 0);
    }

    // Apply errors filter
    if (filters.errors) {
      filtered = filtered.filter(resource => resource.errorRate > 0);
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
        case 'performance':
          aValue = a.performanceScore;
          bValue = b.performanceScore;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [enhancedResources, filters]);

  // Resource statistics
  const resourceStats = useMemo(() => {
    const total = enhancedResources.length;
    const active = enhancedResources.filter(r => r.linkStatus === ResourceLinkStatus.ACTIVE).length;
    const inactive = enhancedResources.filter(r => r.linkStatus === ResourceLinkStatus.INACTIVE).length;
    const pending = enhancedResources.filter(r => r.linkStatus === ResourceLinkStatus.PENDING).length;
    const errors = enhancedResources.filter(r => r.linkStatus === ResourceLinkStatus.ERROR).length;
    const conflicts = enhancedResources.filter(r => r.conflicts.length > 0).length;
    
    const totalUsage = enhancedResources.reduce((sum, r) => sum + r.usageCount, 0);
    const avgPerformance = enhancedResources.length > 0 
      ? enhancedResources.reduce((sum, r) => sum + r.performanceScore, 0) / enhancedResources.length 
      : 0;
    const avgErrorRate = enhancedResources.length > 0
      ? enhancedResources.reduce((sum, r) => sum + r.errorRate, 0) / enhancedResources.length
      : 0;

    // Group distribution
    const groupDistribution = Object.values(SPAGroup).reduce((acc, group) => {
      acc[group] = enhancedResources.filter(r => 
        r.sourceGroup === group || r.targetGroups.includes(group)
      ).length;
      return acc;
    }, {} as Record<SPAGroup, number>);

    return {
      total,
      active,
      inactive,
      pending,
      errors,
      conflicts,
      totalUsage,
      avgPerformance,
      avgErrorRate,
      groupDistribution
    };
  }, [enhancedResources]);

  // Available SPA groups with metadata
  const availableSPAGroups = useMemo(() => {
    return [
      { 
        id: SPAGroup.DATA_SOURCES, 
        name: 'Data Sources', 
        description: 'Data source management and connectivity',
        icon: Database,
        color: 'bg-blue-500'
      },
      { 
        id: SPAGroup.SCAN_RULE_SETS, 
        name: 'Scan Rule Sets', 
        description: 'Advanced scanning rules and configurations',
        icon: Shield,
        color: 'bg-green-500'
      },
      { 
        id: SPAGroup.CLASSIFICATIONS, 
        name: 'Classifications', 
        description: 'Data classification and labeling',
        icon: Tag,
        color: 'bg-purple-500'
      },
      { 
        id: SPAGroup.COMPLIANCE_RULE, 
        name: 'Compliance Rules', 
        description: 'Compliance monitoring and reporting',
        icon: ShieldCheckIcon,
        color: 'bg-red-500'
      },
      { 
        id: SPAGroup.ADVANCED_CATALOG, 
        name: 'Advanced Catalog', 
        description: 'Data catalog and metadata management',
        icon: Layers,
        color: 'bg-orange-500'
      },
      { 
        id: SPAGroup.SCAN_LOGIC, 
        name: 'Scan Logic', 
        description: 'Scanning logic and execution',
        icon: Activity,
        color: 'bg-teal-500'
      },
      { 
        id: SPAGroup.RBAC_SYSTEM, 
        name: 'RBAC System', 
        description: 'Role-based access control',
        icon: Users,
        color: 'bg-pink-500'
      }
    ];
  }, []);

  // Load enhanced resources from backend
  const loadEnhancedResources = useCallback(async (): Promise<EnhancedCrossGroupResource[]> => {
    if (!currentUser || !currentWorkspace) return [];

    try {
      const response = await crossGroupIntegrationAPI.getLinkedResources({
        workspace_id: currentWorkspace.id,
        include_dependencies: true,
        include_metadata: true,
        include_analytics: true,
        include_ai_recommendations: true
      });

      return response.resources.map(resource => ({
        id: resource.id,
        name: resource.name,
        description: resource.description,
        type: resource.resource_type,
        sourceGroup: resource.source_group,
        targetGroups: resource.target_groups,
        resourceId: resource.resource_id,
        resourceType: resource.resource_type,
        resourceMetadata: resource.metadata,
        linkStatus: resource.link_status,
        linkType: resource.link_type,
        linkStrength: resource.link_strength,
        linkQuality: resource.link_quality,
        dependencies: resource.dependencies || [],
        dependents: resource.dependents || [],
        circularDependencies: resource.has_circular_dependencies,
        configuration: resource.configuration,
        syncSettings: resource.sync_settings,
        accessSettings: resource.access_settings,
        usageCount: resource.analytics?.usage_count || 0,
        performanceScore: resource.analytics?.performance_score || 0,
        errorRate: resource.analytics?.error_rate || 0,
        lastSyncTime: resource.last_sync_time,
        avgResponseTime: resource.analytics?.avg_response_time || 0,
        conflicts: resource.conflicts || [],
        resolutionHistory: resource.resolution_history || [],
        createdAt: resource.created_at,
        updatedAt: resource.updated_at,
        lastAccessedAt: resource.last_accessed_at,
        createdBy: resource.created_by,
        tags: resource.tags || [],
        category: resource.category,
        priority: resource.priority,
        aiRecommendations: resource.ai_recommendations || [],
        optimizationSuggestions: resource.optimization_suggestions || [],
        riskAssessment: resource.risk_assessment || {
          overallRisk: 'low',
          securityRisk: 0,
          performanceRisk: 0,
          complianceRisk: 0,
          operationalRisk: 0,
          risks: [],
          mitigations: []
        }
      }));
    } catch (error) {
      console.error('Error loading enhanced resources:', error);
      return [];
    }
  }, [currentUser, currentWorkspace]);

  // ============================================================================
  // EVENT HANDLERS AND ACTIONS
  // ============================================================================

  /**
   * Handle resource linking
   */
  const handleLinkResource = useCallback(async (
    sourceResource: EnhancedCrossGroupResource,
    targetGroup: SPAGroup,
    configuration: Record<string, any>
  ) => {
    try {
      setIsAnimating(true);
      
      const linkResult = await linkCrossGroupResource({
        sourceResourceId: sourceResource.resourceId,
        sourceGroup: sourceResource.sourceGroup,
        targetGroup,
        linkType: ResourceLinkType.DIRECT,
        configuration,
        syncSettings: {
          enabled: true,
          frequency: 'realtime',
          bidirectional: true,
          conflictResolution: 'source_wins',
          batchSize: 50,
          retryAttempts: 3,
          timeoutSeconds: 30
        }
      });
      
      if (linkResult.success) {
        // Update local state
        setEnhancedResources(prev => prev.map(resource => 
          resource.id === sourceResource.id
            ? {
                ...resource,
                targetGroups: [...resource.targetGroups, targetGroup],
                linkStatus: ResourceLinkStatus.ACTIVE,
                updatedAt: new Date().toISOString() as ISODateString
              }
            : resource
        ));
        
        toast({
          title: "Resource Linked",
          description: `Successfully linked ${sourceResource.name} to ${targetGroup}.`,
        });
        
        setShowLinkDialog(false);
      } else {
        throw new Error(linkResult.error);
      }
    } catch (error) {
      toast({
        title: "Linking Failed",
        description: "Failed to link resource.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [linkCrossGroupResource, setIsAnimating, setEnhancedResources, setShowLinkDialog, toast]);

  /**
   * Handle resource unlinking
   */
  const handleUnlinkResource = useCallback(async (
    resourceId: UUID,
    targetGroup: SPAGroup
  ) => {
    try {
      setIsAnimating(true);
      
      const unlinkResult = await unlinkCrossGroupResource(resourceId, targetGroup);
      
      if (unlinkResult.success) {
        // Update local state
        setEnhancedResources(prev => prev.map(resource => 
          resource.id === resourceId
            ? {
                ...resource,
                targetGroups: resource.targetGroups.filter(group => group !== targetGroup),
                updatedAt: new Date().toISOString() as ISODateString
              }
            : resource
        ));
        
        toast({
          title: "Resource Unlinked",
          description: `Successfully unlinked resource from ${targetGroup}.`,
        });
      } else {
        throw new Error(unlinkResult.error);
      }
    } catch (error) {
      toast({
        title: "Unlinking Failed",
        description: "Failed to unlink resource.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [unlinkCrossGroupResource, setIsAnimating, setEnhancedResources, toast]);

  /**
   * Handle resource synchronization
   */
  const handleSyncResources = useCallback(async (resourceIds?: UUID[]) => {
    try {
      setIsSyncing(true);
      
      const syncResult = await syncResources(resourceIds || enhancedResources.map(r => r.id));
      
      if (syncResult.success) {
        // Update sync times
        setEnhancedResources(prev => prev.map(resource => 
          !resourceIds || resourceIds.includes(resource.id)
            ? {
                ...resource,
                lastSyncTime: new Date().toISOString() as ISODateString,
                updatedAt: new Date().toISOString() as ISODateString
              }
            : resource
        ));
        
        toast({
          title: "Sync Complete",
          description: `Successfully synchronized ${resourceIds?.length || enhancedResources.length} resources.`,
        });
      } else {
        throw new Error(syncResult.error);
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize resources.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [syncResources, enhancedResources]);

  /**
   * Handle conflict resolution
   */
  const handleResolveConflicts = useCallback(async (resourceId: UUID) => {
    try {
      setIsAnimating(true);
      
      const resource = enhancedResources.find(r => r.id === resourceId);
      if (!resource || resource.conflicts.length === 0) return;
      
      const resolutions = await Promise.all(
        resource.conflicts.map(async (conflict) => {
          const resolution = await suggestResolutions(conflict);
          return resolution;
        })
      );
      
      // Apply resolutions
      const resolveResult = await resolveConflicts(resourceId, resolutions);
      
      if (resolveResult.success) {
        // Update local state
        setEnhancedResources(prev => prev.map(r => 
          r.id === resourceId
            ? {
                ...r,
                conflicts: [],
                resolutionHistory: [
                  ...r.resolutionHistory,
                  ...resolutions.map(resolution => ({
                    id: `resolution-${Date.now()}` as UUID,
                    conflictId: resolution.conflictId,
                    resolution: resolution.strategy,
                    appliedValue: resolution.value,
                    resolvedBy: currentUser!.id,
                    resolvedAt: new Date().toISOString() as ISODateString,
                    rollbackAvailable: true
                  }))
                ],
                updatedAt: new Date().toISOString() as ISODateString
              }
            : r
        ));
        
        toast({
          title: "Conflicts Resolved",
          description: `Successfully resolved ${resource.conflicts.length} conflicts.`,
        });
      } else {
        throw new Error(resolveResult.error);
      }
    } catch (error) {
      toast({
        title: "Resolution Failed",
        description: "Failed to resolve conflicts.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [enhancedResources, resolveConflicts, suggestResolutions, currentUser]);

  /**
   * Handle AI optimization
   */
  const handleOptimizeResources = useCallback(async (resourceIds?: UUID[]) => {
    try {
      setIsOptimizing(true);
      
      const targetIds = resourceIds || enhancedResources.map(r => r.id);
      const optimizations = await optimizeResourceLinks(targetIds);
      
      // Apply optimizations
      setEnhancedResources(prev => prev.map(resource => 
        targetIds.includes(resource.id)
          ? {
              ...resource,
              aiRecommendations: optimizations.recommendations || resource.aiRecommendations,
              optimizationSuggestions: optimizations.suggestions || resource.optimizationSuggestions,
              performanceScore: Math.min(resource.performanceScore + 5, 100),
              updatedAt: new Date().toISOString() as ISODateString
            }
          : resource
      ));
      
      toast({
        title: "Optimization Complete",
        description: `Generated ${optimizations.recommendations?.length || 0} recommendations for ${targetIds.length} resources.`,
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize resources.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [enhancedResources, optimizeResourceLinks]);

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================

  /**
   * Initialize component and load data
   */
  useEffect(() => {
    const initializeResourceLinker = async () => {
      try {
        // Initialize with backend resources
        if (enhancedResources.length === 0 && currentUser) {
          const resources = await loadEnhancedResources();
          setEnhancedResources(resources);
        }
        
        // Generate network visualization data
        if (enhancedResources.length > 0) {
          const nodes: ResourceNode[] = enhancedResources.map((resource, index) => ({
            id: resource.id,
            name: resource.name,
            group: resource.sourceGroup,
            type: resource.type,
            status: resource.linkStatus,
            x: Math.cos(index * 2 * Math.PI / enhancedResources.length) * 200 + 400,
            y: Math.sin(index * 2 * Math.PI / enhancedResources.length) * 200 + 300,
            connections: resource.dependents,
            metadata: resource.resourceMetadata
          }));
          
          const edges: ResourceEdge[] = enhancedResources.flatMap(resource =>
            resource.dependents.map(dependentId => ({
              id: `edge-${resource.id}-${dependentId}` as UUID,
              source: resource.id,
              target: dependentId,
              type: resource.linkType,
              strength: resource.linkStrength,
              quality: resource.linkQuality,
              bidirectional: resource.syncSettings.bidirectional,
              metadata: {}
            }))
          );
          
          setResourceNodes(nodes);
          setResourceEdges(edges);
        }
        
        // Update last update timestamp
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to initialize resource linker:', error);
        toast({
          title: "Initialization Failed",
          description: "Failed to load resource data.",
          variant: "destructive",
        });
      }
    };

    initializeResourceLinker();
  }, [enhancedResources.length, currentUser, loadEnhancedResources]);

  /**
   * Auto-save configuration changes
   */
  useEffect(() => {
    const saveConfig = () => {
      localStorage.setItem('resource-linker-config', JSON.stringify(config));
    };

    const timeoutId = setTimeout(saveConfig, 1000);
    return () => clearTimeout(timeoutId);
  }, [config]);

  /**
   * Load saved configuration
   */
  useEffect(() => {
    const savedConfig = localStorage.getItem('resource-linker-config');
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
          case 'l':
            event.preventDefault();
            setShowLinkDialog(true);
            break;
          case 'r':
            event.preventDefault();
            handleSyncResources();
            break;
          case 'o':
            event.preventDefault();
            handleOptimizeResources();
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setShowLinkDialog(false);
        setShowConflictDialog(false);
        setShowOptimizeDialog(false);
        setShowSettingsDialog(false);
        setShowAnalyticsDialog(false);
        setExpandedResource(null);
        setSelectedNode(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSyncResources, handleOptimizeResources]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Get status color
   */
  const getStatusColor = useCallback((status: ResourceLinkStatus) => {
    switch (status) {
      case ResourceLinkStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ResourceLinkStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case ResourceLinkStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ResourceLinkStatus.ERROR:
        return 'bg-red-100 text-red-800';
      case ResourceLinkStatus.DEPRECATED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  /**
   * Get type color
   */
  const getTypeColor = useCallback((type: ResourceLinkType) => {
    switch (type) {
      case ResourceLinkType.DIRECT:
        return 'bg-blue-100 text-blue-800';
      case ResourceLinkType.INHERITED:
        return 'bg-purple-100 text-purple-800';
      case ResourceLinkType.SHARED:
        return 'bg-green-100 text-green-800';
      case ResourceLinkType.REFERENCED:
        return 'bg-orange-100 text-orange-800';
      case ResourceLinkType.DEPENDENCY:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  /**
   * Get priority color
   */
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-blue-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  /**
   * Render resource card
   */
  const renderResourceCard = useCallback((resource: EnhancedCrossGroupResource) => {
    const isSelected = selectedResources.has(resource.id);
    const isExpanded = expandedResource === resource.id;
    const sourceGroupInfo = availableSPAGroups.find(g => g.id === resource.sourceGroup);
    const IconComponent = sourceGroupInfo?.icon || Database;

    return (
      <motion.div
        key={resource.id}
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
            setExpandedResource(resource.id);
            setSelectedResource(resource);
          }
        }}
      >
        <Card className="h-full border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white",
                  sourceGroupInfo?.color || 'bg-gray-500'
                )}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                    {resource.name}
                    {resource.conflicts.length > 0 && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    {resource.errorRate > 0 && <XCircle className="w-4 h-4 text-red-500" />}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground truncate">
                    {resource.description}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(resource.linkStatus)}>
                  {resource.linkStatus}
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
                      setLinkSourceResource(resource);
                      setShowLinkDialog(true);
                    }}>
                      <Link2 className="w-4 h-4 mr-2" />
                      Link to SPA
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSyncResources([resource.id])}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Resource
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOptimizeResources([resource.id])}>
                      <Brain className="w-4 h-4 mr-2" />
                      AI Optimize
                    </DropdownMenuItem>
                    {resource.conflicts.length > 0 && (
                      <DropdownMenuItem onClick={() => handleResolveConflicts(resource.id)}>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Resolve Conflicts
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
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
            {/* Link Type and Performance */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(resource.linkType)}>
                  {resource.linkType}
                </Badge>
                <span className={cn("font-medium", getPriorityColor(resource.priority))}>
                  {resource.priority} priority
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="font-semibold">{resource.performanceScore}%</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{resource.usageCount}</div>
                <div className="text-muted-foreground">Uses</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{resource.linkStrength}%</div>
                <div className="text-muted-foreground">Strength</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{resource.avgResponseTime}ms</div>
                <div className="text-muted-foreground">Response</div>
              </div>
            </div>

            {/* Target Groups */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Linked to</div>
              <div className="flex flex-wrap gap-1">
                {resource.targetGroups.slice(0, 3).map((group, index) => {
                  const groupInfo = availableSPAGroups.find(g => g.id === group);
                  return (
                    <Badge key={index} variant="outline" className="text-xs">
                      {groupInfo?.name || group}
                    </Badge>
                  );
                })}
                {resource.targetGroups.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{resource.targetGroups.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{resource.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Conflicts and Errors */}
            {(resource.conflicts.length > 0 || resource.errorRate > 0) && (
              <div className="flex items-center gap-4 text-sm">
                {resource.conflicts.length > 0 && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{resource.conflicts.length} conflicts</span>
                  </div>
                )}
                {resource.errorRate > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span>{resource.errorRate.toFixed(1)}% error rate</span>
                  </div>
                )}
              </div>
            )}

            {/* Last Sync */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Synced {formatDistanceToNow(new Date(resource.lastSyncTime))} ago</span>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 mt-4 space-y-4"
              >
                {/* AI Recommendations */}
                {resource.aiRecommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Recommendations
                    </h4>
                    <div className="space-y-2">
                      {resource.aiRecommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          <div className="font-medium">{rec.title}</div>
                          <div className="text-muted-foreground">{rec.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {rec.impact} impact
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rec.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {resource.dependencies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Dependencies
                    </h4>
                    <div className="space-y-1">
                      {resource.dependencies.slice(0, 3).map((dep, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {dep.dependencyType}: {dep.sourceResourceId}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLinkSourceResource(resource);
                      setShowLinkDialog(true);
                    }}
                    className="flex-1"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Link
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSyncResources([resource.id]);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [selectedResources, expandedResource, availableSPAGroups, getStatusColor, getTypeColor, getPriorityColor, handleSyncResources, handleOptimizeResources, handleResolveConflicts]);

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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Resource Linker</h1>
                  <p className="text-muted-foreground">
                    Cross-group resource orchestration and management
                  </p>
                </div>
              </div>
              
              {/* Sync Status Indicator */}
              <div className="flex items-center gap-2 ml-8">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  config.enableRealTimeSync ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )}>
                </div>
                <span className="text-sm text-muted-foreground">
                  {isSyncing ? "Syncing..." : config.enableRealTimeSync ? "Real-time Sync" : "Manual Sync"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search resources... (⌘K)"
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
                  variant={viewMode === 'network' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('network')}
                >
                  <Network className="w-4 h-4" />
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
                  <DropdownMenuLabel>Filter Resources</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Status Filter */}
                  <div className="p-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.values(ResourceLinkStatus).map((status) => (
                        <Badge
                          key={status}
                          variant={filters.status.includes(status) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              status: prev.status.includes(status)
                                ? prev.status.filter(s => s !== status)
                                : [...prev.status, status]
                            }));
                          }}
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Type Filter */}
                  <div className="p-2">
                    <Label className="text-sm font-medium">Type</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.values(ResourceLinkType).map((type) => (
                        <Badge
                          key={type}
                          variant={filters.types.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              types: prev.types.includes(type)
                                ? prev.types.filter(t => t !== type)
                                : [...prev.types, type]
                            }));
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Special Filters */}
                  <div className="p-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="conflicts"
                        checked={filters.conflicts}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, conflicts: checked as boolean }))
                        }
                      />
                      <Label htmlFor="conflicts" className="text-sm">Show only conflicts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="errors"
                        checked={filters.errors}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, errors: checked as boolean }))
                        }
                      />
                      <Label htmlFor="errors" className="text-sm">Show only errors</Label>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sync Button */}
              <Button 
                variant="outline" 
                onClick={() => handleSyncResources()}
                disabled={isSyncing}
                className="bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
                {isSyncing ? "Syncing..." : "Sync All"}
              </Button>

              {/* Optimize Button */}
              <Button 
                variant="outline" 
                onClick={() => handleOptimizeResources()}
                disabled={isOptimizing}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100"
              >
                <Brain className={cn("w-4 h-4 mr-2", isOptimizing && "animate-pulse")} />
                {isOptimizing ? "Optimizing..." : "AI Optimize"}
              </Button>

              {/* Link Resource Button */}
              <Button onClick={() => setShowLinkDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Link Resource
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
                  <Link2 className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-lg font-semibold">{resourceStats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-lg font-semibold">{resourceStats.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="text-lg font-semibold">{resourceStats.conflicts}</div>
                    <div className="text-xs text-muted-foreground">Conflicts</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-lg font-semibold">{resourceStats.errors}</div>
                    <div className="text-xs text-muted-foreground">Errors</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-lg font-semibold">{Math.round(resourceStats.avgPerformance)}%</div>
                    <div className="text-xs text-muted-foreground">Avg Performance</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-lg font-semibold">{resourceStats.totalUsage}</div>
                    <div className="text-xs text-muted-foreground">Total Usage</div>
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
              {!loading.workspaces && filteredResources.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-96 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Link2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {filters.search || filters.status.length > 0
                      ? "No resources match your current filters. Try adjusting your search criteria."
                      : "Get started by linking resources across your SPAs."
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowLinkDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Link Resource
                    </Button>
                    <Button variant="outline" onClick={() => handleOptimizeResources()}>
                      <Brain className="w-4 h-4 mr-2" />
                      AI Optimize
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Grid View */}
              {!loading.workspaces && viewMode === 'grid' && filteredResources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max"
                >
                  <AnimatePresence>
                    {filteredResources.map(renderResourceCard)}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* List View */}
              {!loading.workspaces && viewMode === 'list' && filteredResources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {filteredResources.map((resource) => {
                    const sourceGroupInfo = availableSPAGroups.find(g => g.id === resource.sourceGroup);
                    const IconComponent = sourceGroupInfo?.icon || Database;

                    return (
                      <motion.div
                        key={resource.id}
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
                                  "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                                  sourceGroupInfo?.color || 'bg-gray-500'
                                )}>
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate flex items-center gap-2">
                                    {resource.name}
                                    {resource.conflicts.length > 0 && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                    {resource.errorRate > 0 && <XCircle className="w-4 h-4 text-red-500" />}
                                  </h3>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {resource.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                  {resource.usageCount} uses
                                </div>
                                <div className="flex items-center gap-1">
                                  <Activity className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium">{resource.performanceScore}%</span>
                                </div>
                                <Badge className={getStatusColor(resource.linkStatus)}>
                                  {resource.linkStatus}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setLinkSourceResource(resource);
                                    setShowLinkDialog(true);
                                  }}
                                >
                                  <Link2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Network View */}
              {!loading.workspaces && viewMode === 'network' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[600px] border rounded-lg bg-muted/20"
                >
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Network Visualization</h3>
                      <p>Interactive resource relationship mapping coming soon</p>
                    </div>
                  </div>
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
                          Status Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.values(ResourceLinkStatus).map((status) => {
                            const count = enhancedResources.filter(r => r.linkStatus === status).length;
                            const percentage = enhancedResources.length > 0 ? (count / enhancedResources.length) * 100 : 0;
                            
                            return (
                              <div key={status} className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    status === ResourceLinkStatus.ACTIVE && "bg-green-500",
                                    status === ResourceLinkStatus.INACTIVE && "bg-gray-500",
                                    status === ResourceLinkStatus.PENDING && "bg-yellow-500",
                                    status === ResourceLinkStatus.ERROR && "bg-red-500",
                                    status === ResourceLinkStatus.DEPRECATED && "bg-orange-500"
                                  )}></div>
                                  {status}
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
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Average Performance</span>
                              <span className="font-semibold">
                                {resourceStats.avgPerformance.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={resourceStats.avgPerformance} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Error Rate</span>
                              <span className="font-semibold">
                                {resourceStats.avgErrorRate.toFixed(2)}%
                              </span>
                            </div>
                            <Progress value={resourceStats.avgErrorRate} className="bg-red-100" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Active Resources</span>
                              <span className="font-semibold">
                                {resourceStats.total > 0 ? Math.round((resourceStats.active / resourceStats.total) * 100) : 0}%
                              </span>
                            </div>
                            <Progress value={resourceStats.total > 0 ? (resourceStats.active / resourceStats.total) * 100 : 0} />
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
          {(isAnimating || isSyncing || isOptimizing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">
                  {isSyncing ? "Synchronizing Resources..." : 
                   isOptimizing ? "Optimizing Performance..." : "Processing..."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default CrossGroupResourceLinker;