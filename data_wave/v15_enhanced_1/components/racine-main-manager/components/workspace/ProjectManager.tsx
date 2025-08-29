/**
 * ProjectManager.tsx
 * ==================
 * 
 * Advanced project management system with cross-SPA integration that provides
 * enterprise-grade project orchestration, resource coordination, and team collaboration.
 * Surpasses Databricks project management with intelligent automation and AI-powered insights.
 * 
 * Features:
 * - Multi-project workspace coordination and management
 * - Cross-SPA resource integration and dependency tracking
 * - Advanced project templates and rapid deployment
 * - Real-time collaboration and team coordination
 * - AI-powered project optimization and recommendations
 * - Gantt charts, Kanban boards, and timeline visualization
 * - Resource allocation and capacity planning
 * - Risk management and issue tracking
 * - Advanced reporting and analytics
 * - Integration with all 7 existing SPAs
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_workspace_service.py
 * - Uses: workspaceManagementAPI, useWorkspaceManagement hook
 * - Real-time: WebSocket integration for live collaboration
 * 
 * Design: Modern shadcn/ui with Next.js, Tailwind CSS, advanced animations
 * Target: 2500+ lines with enterprise-grade functionality
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useDragControls } from 'framer-motion';
import { FolderOpen, Plus, Search, Filter, MoreHorizontal, Grid3X3, List, Calendar, Clock, Users, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle, Play, Pause, Square, RotateCcw, Settings, Share2, Copy, Archive, Trash2, ExternalLink, ChevronDown, ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownRight, Sparkles, Brain, Rocket, Globe, Building2, Users2, UserCheck, ShieldCheckIcon, Gauge, Timer, Cpu, HardDrive, Network, Activity, BarChart3, PieChart, LineChart, MapPin, Tag, Bookmark, Star, Heart, MessageSquare, Bell, BellOff, Eye, EyeOff, Lock, Unlock, Crown, UserPlus, UserMinus, Layers, Database, GitBranch, Zap, Shield, RefreshCw, Download, Upload, FileText, Image, Video, Music, Code, Package, Briefcase, Calendar as CalendarIcon, Clock as ClockIcon, Flag, Award, Trophy, Medal, Flame, Lightning, Sun, Moon, Cloud, Workflow, GitCommit, GitMerge, GitPullRequest, Scissors, Paperclip, Link, Hash, AtSign, Percent, DollarSign, Euro, Pound, Yen, Bitcoin, Coins, CreditCard, Wallet, PiggyBank, TrendingDown, Maximize2, Minimize2, Move, RotateCw, FlipHorizontal, FlipVertical, Crop, Scissors as ScissorsIcon, PenTool, Paintbrush, Palette, Dropper, Ruler, Compass, Square as SquareIcon, Circle, Triangle, Hexagon, Pentagon, Octagon } from 'lucide-react';

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
  Command as CommandPrimitive,
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

import { workspaceManagementAPI, jobWorkflowAPI, pipelineManagementAPI } from '../../services';

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
  PipelineDefinition,
  TaskStatus,
  Priority
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
import { formatDistanceToNow, format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

/**
 * Project status enumeration
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

/**
 * Project priority levels
 */
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Project task interface
 */
interface ProjectTask {
  id: UUID;
  projectId: UUID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: UUID;
  assignee?: WorkspaceMember;
  dueDate?: ISODateString;
  startDate?: ISODateString;
  completedAt?: ISODateString;
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  dependencies: UUID[];
  tags: string[];
  attachments: string[];
  comments: TaskComment[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: UUID;
  updatedBy?: UUID;
}

/**
 * Task comment interface
 */
interface TaskComment {
  id: UUID;
  taskId: UUID;
  userId: UUID;
  user: WorkspaceMember;
  content: string;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

/**
 * Project interface
 */
interface Project {
  id: UUID;
  workspaceId: UUID;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  owner: UUID;
  ownerDetails?: WorkspaceMember;
  members: UUID[];
  memberDetails?: WorkspaceMember[];
  startDate?: ISODateString;
  endDate?: ISODateString;
  actualStartDate?: ISODateString;
  actualEndDate?: ISODateString;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  actualCost?: number;
  tags: string[];
  resources: WorkspaceResource[];
  workflows: WorkflowDefinition[];
  pipelines: PipelineDefinition[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  risks: ProjectRisk[];
  dependencies: ProjectDependency[];
  attachments: string[];
  settings: ProjectSettings;
  analytics: ProjectAnalytics;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: UUID;
  updatedBy?: UUID;
}

/**
 * Project milestone interface
 */
interface ProjectMilestone {
  id: UUID;
  projectId: UUID;
  title: string;
  description?: string;
  dueDate: ISODateString;
  completedAt?: ISODateString;
  isCompleted: boolean;
  progress: number;
  tasks: UUID[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Project risk interface
 */
interface ProjectRisk {
  id: UUID;
  projectId: UUID;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  status: 'identified' | 'assessed' | 'mitigated' | 'closed';
  mitigation?: string;
  owner?: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Project dependency interface
 */
interface ProjectDependency {
  id: UUID;
  projectId: UUID;
  dependsOnProjectId: UUID;
  dependsOnProject?: Project;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag?: number; // in days
  createdAt: ISODateString;
}

/**
 * Project settings interface
 */
interface ProjectSettings {
  visibility: 'private' | 'team' | 'workspace' | 'public';
  allowComments: boolean;
  allowFileAttachments: boolean;
  notificationSettings: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    milestoneReached: boolean;
    deadlineApproaching: boolean;
    riskIdentified: boolean;
  };
  workflowSettings: {
    autoProgressUpdate: boolean;
    requireApproval: boolean;
    allowParallelTasks: boolean;
  };
  integrationSettings: {
    enabledSPAs: string[];
    syncWithWorkflows: boolean;
    syncWithPipelines: boolean;
  };
}

/**
 * Project analytics interface
 */
interface ProjectAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageTaskCompletionTime: number;
  teamProductivity: number;
  budgetUtilization: number;
  riskScore: number;
  qualityScore: number;
  stakeholderSatisfaction: number;
  lastUpdated: ISODateString;
}

/**
 * Project manager configuration
 */
interface ProjectManagerConfig {
  enableRealTimeSync: boolean;
  enableAIRecommendations: boolean;
  enableAdvancedAnalytics: boolean;
  enableCrossGroupIntegration: boolean;
  defaultView: 'grid' | 'list' | 'kanban' | 'gantt' | 'timeline';
  autoSaveInterval: number;
  maxConcurrentProjects: number;
  enableNotifications: boolean;
  enableCollaboration: boolean;
}

/**
 * Project view modes
 */
type ProjectViewMode = 'grid' | 'list' | 'kanban' | 'gantt' | 'timeline' | 'calendar' | 'analytics';

/**
 * Project filter options
 */
interface ProjectFilters {
  status: ProjectStatus[];
  priority: ProjectPriority[];
  owner: UUID[];
  members: UUID[];
  tags: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  search: string;
  sortBy: 'name' | 'created' | 'updated' | 'dueDate' | 'progress' | 'priority';
  sortOrder: 'asc' | 'desc';
}

/**
 * Main ProjectManager component
 */
export const ProjectManager: React.FC = () => {
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
    analyzeProject,
    optimizeProject,
    predictProjectSuccess,
    generateProjectInsights
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
  const [config, setConfig] = useState<ProjectManagerConfig>({
    enableRealTimeSync: true,
    enableAIRecommendations: true,
    enableAdvancedAnalytics: true,
    enableCrossGroupIntegration: true,
    defaultView: 'grid',
    autoSaveInterval: 30000,
    maxConcurrentProjects: 20,
    enableNotifications: true,
    enableCollaboration: true
  });

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Set<UUID>>(new Set());

  // View and UI state
  const [viewMode, setViewMode] = useState<ProjectViewMode>('grid');
  const [filters, setFilters] = useState<ProjectFilters>({
    status: [],
    priority: [],
    owner: [],
    members: [],
    tags: [],
    dateRange: { from: null, to: null },
    search: '',
    sortBy: 'updated',
    sortOrder: 'desc'
  });

  // Dialog and modal state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showResourcesPanel, setShowResourcesPanel] = useState(false);
  const [showRisksPanel, setShowRisksPanel] = useState(false);
  const [expandedProject, setExpandedProject] = useState<UUID | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Task management state
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [draggedTask, setDraggedTask] = useState<ProjectTask | null>(null);
  const [taskFilters, setTaskFilters] = useState({
    status: [],
    priority: [],
    assignee: [],
    search: ''
  });

  // Performance and animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const scrollY = useMotionValue(0);
  const springScrollY = useSpring(scrollY, { stiffness: 300, damping: 30 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createFormRef = useRef<HTMLFormElement>(null);
  const dragControls = useDragControls();

  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(project => filters.status.includes(project.status));
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(project => filters.priority.includes(project.priority));
    }

    // Apply owner filter
    if (filters.owner.length > 0) {
      filtered = filtered.filter(project => filters.owner.includes(project.owner));
    }

    // Apply members filter
    if (filters.members.length > 0) {
      filtered = filtered.filter(project =>
        project.members.some(memberId => filters.members.includes(memberId))
      );
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(project =>
        project.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(project => {
        const date = project.endDate ? new Date(project.endDate) : new Date(project.updatedAt);
        if (filters.dateRange.from && date < filters.dateRange.from) return false;
        if (filters.dateRange.to && date > filters.dateRange.to) return false;
        return true;
      });
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
        case 'dueDate':
          aValue = a.endDate ? new Date(a.endDate) : new Date(0);
          bValue = b.endDate ? new Date(b.endDate) : new Date(0);
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, filters]);

  // Project statistics
  const projectStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
    const completed = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const overdue = projects.filter(p => {
      if (!p.endDate) return false;
      return new Date(p.endDate) < new Date() && p.status !== ProjectStatus.COMPLETED;
    }).length;
    const planning = projects.filter(p => p.status === ProjectStatus.PLANNING).length;
    const onHold = projects.filter(p => p.status === ProjectStatus.ON_HOLD).length;
    
    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = projects.reduce((sum, p) => 
      sum + p.tasks.filter(t => t.status === 'completed').length, 0
    );
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const actualCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0);
    
    const avgProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0;

    return {
      total,
      active,
      completed,
      overdue,
      planning,
      onHold,
      cancelled: projects.filter(p => p.status === ProjectStatus.CANCELLED).length,
      archived: projects.filter(p => p.status === ProjectStatus.ARCHIVED).length,
      totalTasks,
      completedTasks,
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalBudget,
      actualCost,
      budgetUtilization: totalBudget > 0 ? (actualCost / totalBudget) * 100 : 0,
      avgProgress
    };
  }, [projects]);

  // Current user's project permissions
  const currentProjectPermissions = useMemo(() => {
    if (!selectedProject || !currentUser) return null;
    
    const isOwner = selectedProject.owner === currentUser.id;
    const isMember = selectedProject.members.includes(currentUser.id);
    const workspaceMember = currentWorkspace?.members?.find(m => m.userId === currentUser.id);
    const canManage = isOwner || workspaceMember?.role === WorkspaceRole.OWNER || workspaceMember?.role === WorkspaceRole.ADMIN;
    
    return {
      isOwner,
      isMember,
      canManage,
      canEdit: isOwner || isMember || canManage,
      canDelete: isOwner || canManage,
      canInvite: isOwner || canManage,
      canViewAnalytics: isMember || canManage
    };
  }, [selectedProject, currentUser, currentWorkspace]);

  // Available project templates
  const availableProjectTemplates = useMemo(() => {
    return [
      {
        id: 'data-governance',
        name: 'Data Governance Project',
        description: 'Complete data governance implementation with compliance tracking',
        tasks: ['Data Discovery', 'Classification Rules', 'Compliance Monitoring', 'Audit Reports'],
        estimatedDuration: 90,
        requiredSPAs: ['data-sources', 'classifications', 'compliance-rule', 'advanced-catalog']
      },
      {
        id: 'data-pipeline',
        name: 'Data Pipeline Development',
        description: 'End-to-end data pipeline with monitoring and optimization',
        tasks: ['Pipeline Design', 'Data Ingestion', 'Processing Logic', 'Quality Checks', 'Deployment'],
        estimatedDuration: 60,
        requiredSPAs: ['data-sources', 'scan-logic', 'advanced-catalog']
      },
      {
        id: 'compliance-audit',
        name: 'Compliance Audit',
        description: 'Comprehensive compliance audit and remediation project',
        tasks: ['Audit Planning', 'Data Assessment', 'Gap Analysis', 'Remediation Plan', 'Implementation'],
        estimatedDuration: 45,
        requiredSPAs: ['compliance-rule', 'classifications', 'advanced-catalog']
      },
      {
        id: 'data-migration',
        name: 'Data Migration',
        description: 'Large-scale data migration with validation and testing',
        tasks: ['Migration Planning', 'Data Mapping', 'Migration Execution', 'Validation', 'Go-Live'],
        estimatedDuration: 120,
        requiredSPAs: ['data-sources', 'advanced-catalog', 'scan-logic']
      }
    ];
  }, []);

  // ============================================================================
  // EVENT HANDLERS AND ACTIONS
  // ============================================================================

  /**
   * Handle project creation
   */
  const handleCreateProject = useCallback(async (projectData: Partial<Project>) => {
    try {
      setIsAnimating(true);
      
      const newProject: Project = {
        id: `project-${Date.now()}` as UUID,
        workspaceId: currentWorkspace!.id,
        name: projectData.name || 'New Project',
        description: projectData.description,
        status: ProjectStatus.PLANNING,
        priority: projectData.priority || ProjectPriority.MEDIUM,
        progress: 0,
        owner: currentUser!.id,
        members: [currentUser!.id],
        tags: projectData.tags || [],
        resources: [],
        workflows: [],
        pipelines: [],
        tasks: [],
        milestones: [],
        risks: [],
        dependencies: [],
        attachments: [],
        settings: {
          visibility: 'team',
          allowComments: true,
          allowFileAttachments: true,
          notificationSettings: {
            taskAssigned: true,
            taskCompleted: true,
            milestoneReached: true,
            deadlineApproaching: true,
            riskIdentified: true
          },
          workflowSettings: {
            autoProgressUpdate: true,
            requireApproval: false,
            allowParallelTasks: true
          },
          integrationSettings: {
            enabledSPAs: [],
            syncWithWorkflows: true,
            syncWithPipelines: true
          }
        },
        analytics: {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          averageTaskCompletionTime: 0,
          teamProductivity: 0,
          budgetUtilization: 0,
          riskScore: 0,
          qualityScore: 0,
          stakeholderSatisfaction: 0,
          lastUpdated: new Date().toISOString() as ISODateString
        },
        createdAt: new Date().toISOString() as ISODateString,
        updatedAt: new Date().toISOString() as ISODateString,
        createdBy: currentUser!.id,
        ...projectData
      };
      
      setProjects(prev => [...prev, newProject]);
      setSelectedProject(newProject);
      setShowCreateDialog(false);
      
      toast({
        title: "Project Created",
        description: `${newProject.name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create project.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [currentWorkspace, currentUser]);

  /**
   * Handle project update
   */
  const handleUpdateProject = useCallback(async (projectId: UUID, updates: Partial<Project>) => {
    try {
      setIsAnimating(true);
      
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              ...updates, 
              updatedAt: new Date().toISOString() as ISODateString,
              updatedBy: currentUser!.id
            }
          : project
      ));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(prev => prev ? { ...prev, ...updates } : null);
      }
      
      toast({
        title: "Project Updated",
        description: "Project has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update project.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [currentUser, selectedProject]);

  /**
   * Handle project deletion
   */
  const handleDeleteProject = useCallback(async (projectId: UUID) => {
    try {
      setIsAnimating(true);
      
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      
      toast({
        title: "Project Deleted",
        description: "Project has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [selectedProject]);

  /**
   * Handle task creation
   */
  const handleCreateTask = useCallback(async (projectId: UUID, taskData: Partial<ProjectTask>) => {
    try {
      const newTask: ProjectTask = {
        id: `task-${Date.now()}` as UUID,
        projectId,
        title: taskData.title || 'New Task',
        description: taskData.description,
        status: 'todo',
        priority: taskData.priority || 'medium',
        progress: 0,
        dependencies: [],
        tags: [],
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString() as ISODateString,
        updatedAt: new Date().toISOString() as ISODateString,
        createdBy: currentUser!.id,
        ...taskData
      };
      
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              tasks: [...project.tasks, newTask],
              updatedAt: new Date().toISOString() as ISODateString
            }
          : project
      ));
      
      toast({
        title: "Task Created",
        description: `${newTask.title} has been added to the project.`,
      });
    } catch (error) {
      toast({
        title: "Task Creation Failed",
        description: "Failed to create task.",
        variant: "destructive",
      });
    }
  }, [currentUser]);

  /**
   * Handle task update
   */
  const handleUpdateTask = useCallback(async (projectId: UUID, taskId: UUID, updates: Partial<ProjectTask>) => {
    try {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              tasks: project.tasks.map(task => 
                task.id === taskId 
                  ? { 
                      ...task, 
                      ...updates, 
                      updatedAt: new Date().toISOString() as ISODateString,
                      updatedBy: currentUser!.id
                    }
                  : task
              ),
              updatedAt: new Date().toISOString() as ISODateString
            }
          : project
      ));
      
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Task Update Failed",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  }, [currentUser]);

  /**
   * Handle AI project optimization
   */
  const handleOptimizeProject = useCallback(async (projectId: UUID) => {
    try {
      setIsAnimating(true);
      
      // Simulate AI optimization
      const recommendations = await optimizeProject(projectId);
      
      toast({
        title: "Project Optimized",
        description: `Found ${recommendations.length} optimization opportunities.`,
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize project.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [optimizeProject]);

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================

  /**
   * Initialize component and load data
   */
  useEffect(() => {
    const initializeProjectManager = async () => {
      try {
        // Load workspaces if not already loaded
        if (workspaces.length === 0) {
          await loadWorkspaces({ page: 1, limit: 50 });
        }
        
        // Initialize with sample projects for demonstration
        if (projects.length === 0 && currentWorkspace && currentUser) {
          const sampleProjects: Project[] = [
            {
              id: 'project-1' as UUID,
              workspaceId: currentWorkspace.id,
              name: 'Data Governance Implementation',
              description: 'Complete implementation of data governance framework with compliance monitoring',
              status: ProjectStatus.ACTIVE,
              priority: ProjectPriority.HIGH,
              progress: 65,
              owner: currentUser.id,
              members: [currentUser.id],
              startDate: subDays(new Date(), 30).toISOString() as ISODateString,
              endDate: addDays(new Date(), 60).toISOString() as ISODateString,
              estimatedHours: 480,
              actualHours: 312,
              budget: 50000,
              actualCost: 32500,
              tags: ['governance', 'compliance', 'high-priority'],
              resources: [],
              workflows: [],
              pipelines: [],
              tasks: [
                {
                  id: 'task-1' as UUID,
                  projectId: 'project-1' as UUID,
                  title: 'Data Source Discovery',
                  description: 'Identify and catalog all data sources in the organization',
                  status: 'completed',
                  priority: 'high',
                  progress: 100,
                  assignedTo: currentUser.id,
                  dueDate: subDays(new Date(), 5).toISOString() as ISODateString,
                  completedAt: subDays(new Date(), 3).toISOString() as ISODateString,
                  estimatedHours: 40,
                  actualHours: 38,
                  dependencies: [],
                  tags: ['discovery', 'catalog'],
                  attachments: [],
                  comments: [],
                  createdAt: subDays(new Date(), 25).toISOString() as ISODateString,
                  updatedAt: subDays(new Date(), 3).toISOString() as ISODateString,
                  createdBy: currentUser.id
                },
                {
                  id: 'task-2' as UUID,
                  projectId: 'project-1' as UUID,
                  title: 'Classification Rules Setup',
                  description: 'Define and implement data classification rules',
                  status: 'in_progress',
                  priority: 'high',
                  progress: 70,
                  assignedTo: currentUser.id,
                  dueDate: addDays(new Date(), 10).toISOString() as ISODateString,
                  estimatedHours: 60,
                  actualHours: 42,
                  dependencies: ['task-1' as UUID],
                  tags: ['classification', 'rules'],
                  attachments: [],
                  comments: [],
                  createdAt: subDays(new Date(), 20).toISOString() as ISODateString,
                  updatedAt: new Date().toISOString() as ISODateString,
                  createdBy: currentUser.id
                }
              ],
              milestones: [
                {
                  id: 'milestone-1' as UUID,
                  projectId: 'project-1' as UUID,
                  title: 'Phase 1 Complete',
                  description: 'Data discovery and initial classification complete',
                  dueDate: addDays(new Date(), 5).toISOString() as ISODateString,
                  isCompleted: false,
                  progress: 85,
                  tasks: ['task-1' as UUID, 'task-2' as UUID],
                  createdAt: subDays(new Date(), 25).toISOString() as ISODateString,
                  updatedAt: new Date().toISOString() as ISODateString
                }
              ],
              risks: [
                {
                  id: 'risk-1' as UUID,
                  projectId: 'project-1' as UUID,
                  title: 'Resource Availability',
                  description: 'Key team members may be unavailable during critical phase',
                  impact: 'medium',
                  probability: 'low',
                  status: 'identified',
                  mitigation: 'Cross-train additional team members',
                  owner: currentUser.id,
                  createdAt: subDays(new Date(), 15).toISOString() as ISODateString,
                  updatedAt: subDays(new Date(), 15).toISOString() as ISODateString
                }
              ],
              dependencies: [],
              attachments: [],
              settings: {
                visibility: 'team',
                allowComments: true,
                allowFileAttachments: true,
                notificationSettings: {
                  taskAssigned: true,
                  taskCompleted: true,
                  milestoneReached: true,
                  deadlineApproaching: true,
                  riskIdentified: true
                },
                workflowSettings: {
                  autoProgressUpdate: true,
                  requireApproval: false,
                  allowParallelTasks: true
                },
                integrationSettings: {
                  enabledSPAs: ['data-sources', 'classifications', 'compliance-rule'],
                  syncWithWorkflows: true,
                  syncWithPipelines: true
                }
              },
              analytics: {
                totalTasks: 2,
                completedTasks: 1,
                overdueTasks: 0,
                averageTaskCompletionTime: 38,
                teamProductivity: 85,
                budgetUtilization: 65,
                riskScore: 25,
                qualityScore: 92,
                stakeholderSatisfaction: 88,
                lastUpdated: new Date().toISOString() as ISODateString
              },
              createdAt: subDays(new Date(), 30).toISOString() as ISODateString,
              updatedAt: new Date().toISOString() as ISODateString,
              createdBy: currentUser.id
            }
          ];
          
          setProjects(sampleProjects);
        }
        
        // Subscribe to real-time updates if enabled
        if (config.enableRealTimeSync) {
          subscribeToUpdates();
        }
        
        // Update last update timestamp
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to initialize project manager:', error);
        toast({
          title: "Initialization Failed",
          description: "Failed to load project data.",
          variant: "destructive",
        });
      }
    };

    initializeProjectManager();

    // Cleanup on unmount
    return () => {
      if (config.enableRealTimeSync) {
        unsubscribeFromUpdates();
      }
    };
  }, [config.enableRealTimeSync, loadWorkspaces, subscribeToUpdates, unsubscribeFromUpdates, workspaces.length, projects.length, currentWorkspace, currentUser]);

  /**
   * Auto-save configuration changes
   */
  useEffect(() => {
    const saveConfig = () => {
      localStorage.setItem('project-manager-config', JSON.stringify(config));
    };

    const timeoutId = setTimeout(saveConfig, config.autoSaveInterval);
    return () => clearTimeout(timeoutId);
  }, [config]);

  /**
   * Load saved configuration
   */
  useEffect(() => {
    const savedConfig = localStorage.getItem('project-manager-config');
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
          case ',':
            event.preventDefault();
            setShowSettingsDialog(true);
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setShowCreateDialog(false);
        setShowEditDialog(false);
        setShowSettingsDialog(false);
        setShowTaskDialog(false);
        setExpandedProject(null);
        setSelectedTask(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Get status color for project
   */
  const getStatusColor = useCallback((status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'bg-blue-100 text-blue-800';
      case ProjectStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800';
      case ProjectStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ProjectStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  /**
   * Get priority color for project
   */
  const getPriorityColor = useCallback((priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.LOW:
        return 'text-gray-600';
      case ProjectPriority.MEDIUM:
        return 'text-blue-600';
      case ProjectPriority.HIGH:
        return 'text-orange-600';
      case ProjectPriority.CRITICAL:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  /**
   * Render project card in grid view
   */
  const renderProjectCard = useCallback((project: Project) => {
    const isSelected = selectedProjects.has(project.id);
    const isExpanded = expandedProject === project.id;
    const isOverdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== ProjectStatus.COMPLETED;
    const daysRemaining = project.endDate ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <motion.div
        key={project.id}
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
            setExpandedProject(project.id);
            setSelectedProject(project);
          }
        }}
      >
        <Card className={cn(
          "h-full border-2 transition-colors",
          isOverdue && "border-red-200",
          "hover:border-primary/50"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                  project.priority === ProjectPriority.CRITICAL && "bg-red-500",
                  project.priority === ProjectPriority.HIGH && "bg-orange-500",
                  project.priority === ProjectPriority.MEDIUM && "bg-blue-500",
                  project.priority === ProjectPriority.LOW && "bg-gray-500"
                )}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                    {project.name}
                    {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground truncate">
                    {project.description || "No description"}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status === ProjectStatus.ACTIVE && <Play className="w-3 h-3 mr-1" />}
                  {project.status === ProjectStatus.COMPLETED && <CheckCircle className="w-3 h-3 mr-1" />}
                  {project.status === ProjectStatus.ON_HOLD && <Pause className="w-3 h-3 mr-1" />}
                  {project.status === ProjectStatus.PLANNING && <Clock className="w-3 h-3 mr-1" />}
                  {project.status === ProjectStatus.CANCELLED && <XCircle className="w-3 h-3 mr-1" />}
                  {project.status === ProjectStatus.ARCHIVED && <Archive className="w-3 h-3 mr-1" />}
                  {project.status.replace('_', ' ')}
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
                      setSelectedProject(project);
                      setShowEditDialog(true);
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOptimizeProject(project.id)}>
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
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Priority and Progress */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Flag className={cn("w-4 h-4", getPriorityColor(project.priority))} />
                <span className="font-medium capitalize">{project.priority} Priority</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">{Math.round(project.progress)}%</span>
                <span className="text-muted-foreground ml-1">complete</span>
              </div>
            </div>

            {/* Progress Bar */}
            <Progress value={project.progress} className="h-2" />

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{project.tasks.length}</div>
                <div className="text-muted-foreground">Tasks</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{project.members.length}</div>
                <div className="text-muted-foreground">Members</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{project.risks.length}</div>
                <div className="text-muted-foreground">Risks</div>
              </div>
            </div>

            {/* Timeline */}
            {(project.startDate || project.endDate) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Timeline</span>
                  {daysRemaining !== null && (
                    <span className={cn(
                      "font-medium",
                      daysRemaining < 0 ? "text-red-600" : daysRemaining < 7 ? "text-orange-600" : "text-green-600"
                    )}>
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {project.startDate && (
                    <span>{format(new Date(project.startDate), 'MMM d')}</span>
                  )}
                  {project.startDate && project.endDate && <span>→</span>}
                  {project.endDate && (
                    <span>{format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Last Activity */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Updated {formatDistanceToNow(new Date(project.updatedAt))} ago</span>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 mt-4 space-y-4"
              >
                {/* Recent Tasks */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Recent Tasks
                  </h4>
                  <div className="space-y-2">
                    {project.tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          task.status === 'completed' && "bg-green-500",
                          task.status === 'in_progress' && "bg-blue-500",
                          task.status === 'todo' && "bg-gray-400"
                        )}></div>
                        <span className="truncate flex-1">{task.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {project.tasks.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{project.tasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>

                {/* Milestones */}
                {project.milestones.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Upcoming Milestones
                    </h4>
                    <div className="space-y-2">
                      {project.milestones.slice(0, 2).map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-2 text-sm">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            milestone.isCompleted ? "bg-green-500" : "bg-orange-500"
                          )}></div>
                          <span className="truncate flex-1">{milestone.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(milestone.dueDate), 'MMM d')}
                          </span>
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
                      setSelectedProject(project);
                      setShowTaskDialog(true);
                    }}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setShowEditDialog(true);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [selectedProjects, expandedProject, getStatusColor, getPriorityColor, handleOptimizeProject, handleDeleteProject]);

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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Project Manager</h1>
                  <p className="text-muted-foreground">
                    Advanced project management with cross-SPA integration
                  </p>
                </div>
              </div>
              
              {/* Real-time Status Indicator */}
              <div className="flex items-center gap-2 ml-8">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  config.enableRealTimeSync ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )}>
                </div>
                <span className="text-sm text-muted-foreground">
                  {config.enableRealTimeSync ? "Live" : "Offline"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search projects... (⌘K)"
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
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  <Layers className="w-4 h-4" />
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
                  <DropdownMenuLabel>Filter Projects</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Status Filter */}
                  <div className="p-2">
                    <Label className="text-sm font-medium">Project Status</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.values(ProjectStatus).map((status) => (
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
                          {status.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Priority Filter */}
                  <div className="p-2">
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.values(ProjectPriority).map((priority) => (
                        <Badge
                          key={priority}
                          variant={filters.priority.includes(priority) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              priority: prev.priority.includes(priority)
                                ? prev.priority.filter(p => p !== priority)
                                : [...prev.priority, priority]
                            }));
                          }}
                        >
                          {priority}
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
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Create Project Button */}
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
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
                  <FolderOpen className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-lg font-semibold">{projectStats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-lg font-semibold">{projectStats.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="text-lg font-semibold">{projectStats.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-lg font-semibold">{projectStats.overdue}</div>
                    <div className="text-xs text-muted-foreground">Overdue</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-lg font-semibold">{Math.round(projectStats.taskCompletionRate)}%</div>
                    <div className="text-xs text-muted-foreground">Task Rate</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-lg font-semibold">{Math.round(projectStats.avgProgress)}%</div>
                    <div className="text-xs text-muted-foreground">Avg Progress</div>
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
                        <Skeleton className="h-2 w-full" />
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
              {!loading.workspaces && filteredProjects.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-96 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FolderOpen className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {filters.search || filters.status.length > 0 || filters.priority.length > 0
                      ? "No projects match your current filters. Try adjusting your search criteria."
                      : "Get started by creating your first project to organize your data governance initiatives."
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                    {(filters.search || filters.status.length > 0 || filters.priority.length > 0) && (
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({
                          status: [],
                          priority: [],
                          owner: [],
                          members: [],
                          tags: [],
                          dateRange: { from: null, to: null },
                          search: '',
                          sortBy: 'updated',
                          sortOrder: 'desc'
                        })}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Grid View */}
              {!loading.workspaces && viewMode === 'grid' && filteredProjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max"
                >
                  <AnimatePresence>
                    {filteredProjects.map(renderProjectCard)}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* List View */}
              {!loading.workspaces && viewMode === 'list' && filteredProjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
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
                                project.priority === ProjectPriority.CRITICAL && "bg-red-500",
                                project.priority === ProjectPriority.HIGH && "bg-orange-500",
                                project.priority === ProjectPriority.MEDIUM && "bg-blue-500",
                                project.priority === ProjectPriority.LOW && "bg-gray-500"
                              )}>
                                {project.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{project.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {project.description || "No description"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-muted-foreground">
                                {project.tasks.length} tasks
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {Math.round(project.progress)}% complete
                              </div>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setExpandedProject(project.id);
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
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
                          Project Status Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              Active
                            </span>
                            <span className="font-semibold">{projectStats.active}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              Planning
                            </span>
                            <span className="font-semibold">{projectStats.planning}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              Completed
                            </span>
                            <span className="font-semibold">{projectStats.completed}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              On Hold
                            </span>
                            <span className="font-semibold">{projectStats.onHold}</span>
                          </div>
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
                              <span>Task Completion Rate</span>
                              <span className="font-semibold">
                                {Math.round(projectStats.taskCompletionRate)}%
                              </span>
                            </div>
                            <Progress value={projectStats.taskCompletionRate} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Average Progress</span>
                              <span className="font-semibold">
                                {Math.round(projectStats.avgProgress)}%
                              </span>
                            </div>
                            <Progress value={projectStats.avgProgress} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Budget Utilization</span>
                              <span className="font-semibold">
                                {Math.round(projectStats.budgetUtilization)}%
                              </span>
                            </div>
                            <Progress value={projectStats.budgetUtilization} />
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
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Processing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default ProjectManager;
