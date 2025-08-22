/**
 * WorkspaceOrchestrator.tsx
 * =========================
 * 
 * Main workspace controller that orchestrates all workspace operations with
 * Databricks-style capabilities. Provides advanced workspace management,
 * multi-workspace coordination, and seamless integration with all 7 existing SPAs.
 * 
 * Features:
 * - Advanced multi-workspace management (personal, team, enterprise)
 * - Databricks-style workspace navigation and organization
 * - Real-time collaboration and synchronization
 * - Cross-SPA resource integration and orchestration
 * - AI-powered workspace optimization and recommendations
 * - Advanced security and access control
 * - Template-based workspace creation and management
 * - Comprehensive analytics and monitoring
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_workspace_service.py
 * - Uses: workspaceManagementAPI, useWorkspaceManagement hook
 * - Real-time: WebSocket integration for live updates
 * 
 * Design: Modern shadcn/ui with Next.js, Tailwind CSS, advanced animations
 * Target: 2700+ lines with enterprise-grade functionality
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Grid3X3,
  List,
  Star,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Database,
  GitBranch,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Share2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Bell,
  BellOff,
  Lock,
  Unlock,
  Crown,
  UserPlus,
  UserMinus,
  Layers,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  MapPin,
  Tag,
  Bookmark,
  Archive,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Brain,
  Target,
  Rocket,
  Globe,
  Users2,
  UserCheck,
  ShieldCheck,
  Gauge,
  Timer,
  Cpu,
  HardDrive,
  Network,
  Wifi,
  WifiOff,
  Server,
  Cloud,
  CloudOff
} from 'lucide-react';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

// Backend Integration
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useAIAssistant } from '../../hooks/useAIAssistant';

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
  ISODateString
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
import { formatDistanceToNow, format } from 'date-fns';

/**
 * Workspace orchestrator configuration
 */
interface WorkspaceOrchestratorConfig {
  enableRealTimeSync: boolean;
  enableAIRecommendations: boolean;
  enableAdvancedAnalytics: boolean;
  enableCrossGroupIntegration: boolean;
  defaultView: 'grid' | 'list' | 'kanban';
  autoSaveInterval: number;
  maxConcurrentWorkspaces: number;
  enableNotifications: boolean;
}

/**
 * Workspace view modes
 */
type WorkspaceViewMode = 'grid' | 'list' | 'kanban' | 'timeline' | 'analytics';

/**
 * Workspace filter options
 */
interface WorkspaceFilters {
  type: WorkspaceType[];
  role: WorkspaceRole[];
  status: string[];
  tags: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  search: string;
  sortBy: 'name' | 'created' | 'updated' | 'activity' | 'members';
  sortOrder: 'asc' | 'desc';
}

/**
 * Workspace action types
 */
type WorkspaceAction = 
  | 'create'
  | 'edit'
  | 'delete'
  | 'clone'
  | 'archive'
  | 'share'
  | 'export'
  | 'import'
  | 'template'
  | 'analyze'
  | 'optimize';

/**
 * Main WorkspaceOrchestrator component
 */
export const WorkspaceOrchestrator: React.FC = () => {
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
    cloneWorkspace,
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
    analyzeWorkspace,
    optimizeWorkspace,
    predictUsage
  } = useAIAssistant();

  // Local state
  const [config, setConfig] = useState<WorkspaceOrchestratorConfig>({
    enableRealTimeSync: true,
    enableAIRecommendations: true,
    enableAdvancedAnalytics: true,
    enableCrossGroupIntegration: true,
    defaultView: 'grid',
    autoSaveInterval: 30000,
    maxConcurrentWorkspaces: 10,
    enableNotifications: true
  });

  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('grid');
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<Set<UUID>>(new Set());
  const [filters, setFilters] = useState<WorkspaceFilters>({
    type: [],
    role: [],
    status: [],
    tags: [],
    dateRange: { from: null, to: null },
    search: '',
    sortBy: 'updated',
    sortOrder: 'desc'
  });

  // UI state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showResourcesPanel, setShowResourcesPanel] = useState(false);
  const [expandedWorkspace, setExpandedWorkspace] = useState<UUID | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Performance and animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const scrollY = useMotionValue(0);
  const springScrollY = useSpring(scrollY, { stiffness: 300, damping: 30 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createFormRef = useRef<HTMLFormElement>(null);

  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================

  // Filtered and sorted workspaces
  const filteredWorkspaces = useMemo(() => {
    let filtered = [...workspaces];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(workspace =>
        workspace.name.toLowerCase().includes(searchLower) ||
        workspace.description?.toLowerCase().includes(searchLower) ||
        workspace.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(workspace => filters.type.includes(workspace.type));
    }

    // Apply role filter (based on current user's role in workspace)
    if (filters.role.length > 0) {
      filtered = filtered.filter(workspace => {
        const userMember = workspace.members?.find(m => m.userId === currentUser?.id);
        return userMember && filters.role.includes(userMember.role);
      });
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(workspace => {
        const status = workspace.isActive ? 'active' : 'inactive';
        return filters.status.includes(status);
      });
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(workspace =>
        workspace.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(workspace => {
        const date = new Date(workspace.updatedAt);
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
        case 'activity':
          aValue = new Date(a.lastAccessed);
          bValue = new Date(b.lastAccessed);
          break;
        case 'members':
          aValue = a.members?.length || 0;
          bValue = b.members?.length || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [workspaces, filters, currentUser]);

  // Workspace statistics
  const workspaceStats = useMemo(() => {
    const total = workspaces.length;
    const active = workspaces.filter(w => w.isActive).length;
    const personal = workspaces.filter(w => w.type === WorkspaceType.PERSONAL).length;
    const team = workspaces.filter(w => w.type === WorkspaceType.TEAM).length;
    const enterprise = workspaces.filter(w => w.type === WorkspaceType.ENTERPRISE).length;
    const totalMembers = workspaces.reduce((sum, w) => sum + (w.members?.length || 0), 0);
    const totalResources = workspaces.reduce((sum, w) => sum + (w.resources?.length || 0), 0);

    return {
      total,
      active,
      inactive: total - active,
      personal,
      team,
      enterprise,
      totalMembers,
      totalResources,
      averageMembers: totalMembers / total || 0,
      averageResources: totalResources / total || 0
    };
  }, [workspaces]);

  // Available workspace templates
  const availableTemplates = useMemo(() => {
    return templates.filter(template => template.isActive);
  }, [templates]);

  // Current user's workspace permissions
  const currentWorkspacePermissions = useMemo(() => {
    if (!currentWorkspace || !currentUser) return null;
    
    const member = currentWorkspace.members?.find(m => m.userId === currentUser.id);
    return member ? {
      role: member.role,
      permissions: member.permissions,
      canManage: member.role === WorkspaceRole.OWNER || member.role === WorkspaceRole.ADMIN,
      canEdit: member.role !== WorkspaceRole.VIEWER && member.role !== WorkspaceRole.GUEST,
      canInvite: member.permissions?.includes('invite_members'),
      canDelete: member.role === WorkspaceRole.OWNER
    } : null;
  }, [currentWorkspace, currentUser]);

  // ============================================================================
  // EVENT HANDLERS AND ACTIONS
  // ============================================================================

  /**
   * Handle workspace creation
   */
  const handleCreateWorkspace = useCallback(async (data: CreateWorkspaceRequest) => {
    try {
      setIsAnimating(true);
      const result = await createWorkspace(data);
      
      if (result.success) {
        toast({
          title: "Workspace Created",
          description: `${data.name} has been created successfully.`,
        });
        setShowCreateDialog(false);
        
        // Auto-switch to new workspace if it's the user's first workspace
        if (workspaces.length === 0) {
          await switchWorkspace(result.data!.id);
        }
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Failed to create workspace.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [createWorkspace, switchWorkspace, workspaces.length]);

  /**
   * Handle workspace selection
   */
  const handleSelectWorkspace = useCallback(async (workspaceId: UUID) => {
    try {
      setIsAnimating(true);
      const result = await switchWorkspace(workspaceId);
      
      if (result.success) {
        toast({
          title: "Workspace Switched",
          description: "Successfully switched to the selected workspace.",
        });
      } else {
        toast({
          title: "Switch Failed",
          description: result.error || "Failed to switch workspace.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [switchWorkspace]);

  /**
   * Handle workspace deletion
   */
  const handleDeleteWorkspace = useCallback(async (workspaceId: UUID) => {
    try {
      setIsAnimating(true);
      const result = await deleteWorkspace(workspaceId);
      
      if (result.success) {
        toast({
          title: "Workspace Deleted",
          description: "Workspace has been permanently deleted.",
        });
        
        // If deleted workspace was current, switch to another
        if (currentWorkspace?.id === workspaceId && workspaces.length > 1) {
          const otherWorkspace = workspaces.find(w => w.id !== workspaceId);
          if (otherWorkspace) {
            await switchWorkspace(otherWorkspace.id);
          }
        }
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete workspace.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [deleteWorkspace, currentWorkspace, workspaces, switchWorkspace]);

  /**
   * Handle workspace cloning
   */
  const handleCloneWorkspace = useCallback(async (workspaceId: UUID, newName: string) => {
    try {
      setIsAnimating(true);
      const result = await cloneWorkspace(workspaceId, { name: newName });
      
      if (result.success) {
        toast({
          title: "Workspace Cloned",
          description: `${newName} has been created as a copy.`,
        });
      } else {
        toast({
          title: "Cloning Failed",
          description: result.error || "Failed to clone workspace.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [cloneWorkspace]);

  /**
   * Handle member management
   */
  const handleAddMember = useCallback(async (email: string, role: WorkspaceRole) => {
    if (!currentWorkspace) return;

    try {
      const result = await addMember(currentWorkspace.id, { email, role });
      
      if (result.success) {
        toast({
          title: "Member Added",
          description: `${email} has been added to the workspace.`,
        });
      } else {
        toast({
          title: "Failed to Add Member",
          description: result.error || "Failed to add member.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [currentWorkspace, addMember]);

  /**
   * Handle resource linking
   */
  const handleLinkResource = useCallback(async (resourceId: UUID, resourceType: string, sourceGroup: string) => {
    if (!currentWorkspace) return;

    try {
      const result = await linkResource(currentWorkspace.id, {
        resourceId,
        resourceType,
        sourceGroup,
        permissions: ['read', 'write']
      });
      
      if (result.success) {
        toast({
          title: "Resource Linked",
          description: "Resource has been linked to the workspace.",
        });
      } else {
        toast({
          title: "Linking Failed",
          description: result.error || "Failed to link resource.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [currentWorkspace, linkResource]);

  /**
   * Handle AI optimization
   */
  const handleOptimizeWorkspace = useCallback(async () => {
    if (!currentWorkspace) return;

    try {
      setIsAnimating(true);
      const recommendations = await optimizeWorkspace(currentWorkspace.id);
      
      if (recommendations.length > 0) {
        toast({
          title: "Optimization Complete",
          description: `Found ${recommendations.length} optimization opportunities.`,
        });
      } else {
        toast({
          title: "No Optimizations Found",
          description: "Your workspace is already optimized!",
        });
      }
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to analyze workspace for optimizations.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  }, [currentWorkspace, optimizeWorkspace]);

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================

  /**
   * Initialize component and load data
   */
  useEffect(() => {
    const initializeOrchestrator = async () => {
      try {
        // Load workspaces
        await loadWorkspaces({ page: 1, limit: 50 });
        
        // Subscribe to real-time updates if enabled
        if (config.enableRealTimeSync) {
          subscribeToUpdates();
        }
        
        // Update last update timestamp
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to initialize workspace orchestrator:', error);
        toast({
          title: "Initialization Failed",
          description: "Failed to load workspace data.",
          variant: "destructive",
        });
      }
    };

    initializeOrchestrator();

    // Cleanup on unmount
    return () => {
      if (config.enableRealTimeSync) {
        unsubscribeFromUpdates();
      }
    };
  }, [config.enableRealTimeSync, loadWorkspaces, subscribeToUpdates, unsubscribeFromUpdates]);

  /**
   * Auto-save configuration changes
   */
  useEffect(() => {
    const saveConfig = () => {
      localStorage.setItem('workspace-orchestrator-config', JSON.stringify(config));
    };

    const timeoutId = setTimeout(saveConfig, config.autoSaveInterval);
    return () => clearTimeout(timeoutId);
  }, [config]);

  /**
   * Load saved configuration
   */
  useEffect(() => {
    const savedConfig = localStorage.getItem('workspace-orchestrator-config');
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
        setShowSettingsDialog(false);
        setExpandedWorkspace(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render workspace card in grid view
   */
  const renderWorkspaceCard = useCallback((workspace: RacineWorkspace) => {
    const isSelected = selectedWorkspaces.has(workspace.id);
    const isExpanded = expandedWorkspace === workspace.id;
    const userMember = workspace.members?.find(m => m.userId === currentUser?.id);
    const canManage = userMember?.role === WorkspaceRole.OWNER || userMember?.role === WorkspaceRole.ADMIN;

    return (
      <motion.div
        key={workspace.id}
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
        onClick={() => !isExpanded && setExpandedWorkspace(workspace.id)}
      >
        <Card className="h-full border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                  workspace.type === WorkspaceType.PERSONAL && "bg-blue-500",
                  workspace.type === WorkspaceType.TEAM && "bg-green-500",
                  workspace.type === WorkspaceType.ENTERPRISE && "bg-purple-500"
                )}>
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate">
                    {workspace.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground truncate">
                    {workspace.description || "No description"}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {workspace.isActive ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactive
                  </Badge>
                )}
                
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
                    <DropdownMenuItem onClick={() => handleSelectWorkspace(workspace.id)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Workspace
                    </DropdownMenuItem>
                    {canManage && (
                      <>
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCloneWorkspace(workspace.id, `${workspace.name} Copy`)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Clone Workspace
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteWorkspace(workspace.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Workspace Type and Role */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {workspace.type === WorkspaceType.PERSONAL && <Users className="w-4 h-4 text-blue-500" />}
                {workspace.type === WorkspaceType.TEAM && <Users2 className="w-4 h-4 text-green-500" />}
                {workspace.type === WorkspaceType.ENTERPRISE && <Building2 className="w-4 h-4 text-purple-500" />}
                <span className="font-medium capitalize">{workspace.type}</span>
              </div>
              {userMember && (
                <Badge variant="outline" className="text-xs">
                  {userMember.role === WorkspaceRole.OWNER && <Crown className="w-3 h-3 mr-1" />}
                  {userMember.role}
                </Badge>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{workspace.members?.length || 0}</div>
                <div className="text-muted-foreground">Members</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{workspace.resources?.length || 0}</div>
                <div className="text-muted-foreground">Resources</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {workspace.analytics?.activityLevel ? Math.round(workspace.analytics.activityLevel * 100) : 0}%
                </div>
                <div className="text-muted-foreground">Activity</div>
              </div>
            </div>

            {/* Activity Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Activity Level</span>
                <span>{workspace.analytics?.activityLevel ? Math.round(workspace.analytics.activityLevel * 100) : 0}%</span>
              </div>
              <Progress 
                value={workspace.analytics?.activityLevel ? workspace.analytics.activityLevel * 100 : 0} 
                className="h-2"
              />
            </div>

            {/* Tags */}
            {workspace.tags && workspace.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {workspace.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {workspace.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{workspace.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Last Activity */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Updated {formatDistanceToNow(new Date(workspace.updatedAt))} ago</span>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 mt-4 space-y-4"
              >
                {/* Members Preview */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Members ({workspace.members?.length || 0})
                  </h4>
                  <div className="flex -space-x-2">
                    {workspace.members?.slice(0, 5).map((member) => (
                      <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={member.user?.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.user?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {(workspace.members?.length || 0) > 5 && (
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                        +{(workspace.members?.length || 0) - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Resources Preview */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Resources ({workspace.resources?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {workspace.resources?.slice(0, 3).map((resource) => (
                      <div key={resource.id} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="truncate">{resource.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {resource.sourceGroup}
                        </Badge>
                      </div>
                    ))}
                    {(workspace.resources?.length || 0) > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{(workspace.resources?.length || 0) - 3} more resources
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleSelectWorkspace(workspace.id)}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  {canManage && (
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [selectedWorkspaces, expandedWorkspace, currentUser, handleSelectWorkspace, handleCloneWorkspace, handleDeleteWorkspace]);

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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Workspace className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Workspace Orchestrator</h1>
                  <p className="text-muted-foreground">
                    Manage and orchestrate your data governance workspaces
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
                  placeholder="Search workspaces... (⌘K)"
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
                  <DropdownMenuLabel>Filter Workspaces</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Type Filter */}
                  <div className="p-2">
                    <Label className="text-sm font-medium">Workspace Type</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.values(WorkspaceType).map((type) => (
                        <Badge
                          key={type}
                          variant={filters.type.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              type: prev.type.includes(type)
                                ? prev.type.filter(t => t !== type)
                                : [...prev.type, type]
                            }));
                          }}
                        >
                          {type}
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
                        <SelectItem value="activity">Activity</SelectItem>
                        <SelectItem value="members">Members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Create Workspace Button */}
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
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
                  <Workspace className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-lg font-semibold">{workspaceStats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-lg font-semibold">{workspaceStats.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-lg font-semibold">{workspaceStats.totalMembers}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-lg font-semibold">{workspaceStats.totalResources}</div>
                    <div className="text-xs text-muted-foreground">Resources</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="text-lg font-semibold">{workspaceStats.enterprise}</div>
                    <div className="text-xs text-muted-foreground">Enterprise</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-lg font-semibold">
                      {Math.round(workspaceStats.averageMembers * 10) / 10}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Members</div>
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
                    <Card key={index} className="h-80">
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
                        <Skeleton className="h-2 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading.workspaces && filteredWorkspaces.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-96 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Workspace className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Workspaces Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {filters.search || filters.type.length > 0
                      ? "No workspaces match your current filters. Try adjusting your search criteria."
                      : "Get started by creating your first workspace to organize your data governance resources."
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Workspace
                    </Button>
                    {(filters.search || filters.type.length > 0) && (
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({
                          type: [],
                          role: [],
                          status: [],
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
              {!loading.workspaces && viewMode === 'grid' && filteredWorkspaces.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max"
                >
                  <AnimatePresence>
                    {filteredWorkspaces.map(renderWorkspaceCard)}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* List View */}
              {!loading.workspaces && viewMode === 'list' && filteredWorkspaces.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {filteredWorkspaces.map((workspace) => (
                    <motion.div
                      key={workspace.id}
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
                                workspace.type === WorkspaceType.PERSONAL && "bg-blue-500",
                                workspace.type === WorkspaceType.TEAM && "bg-green-500",
                                workspace.type === WorkspaceType.ENTERPRISE && "bg-purple-500"
                              )}>
                                {workspace.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{workspace.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {workspace.description || "No description"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-muted-foreground">
                                {workspace.members?.length || 0} members
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {workspace.resources?.length || 0} resources
                              </div>
                              <Badge variant={workspace.isActive ? "default" : "secondary"}>
                                {workspace.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectWorkspace(workspace.id)}
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
                          Workspace Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              Personal
                            </span>
                            <span className="font-semibold">{workspaceStats.personal}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              Team
                            </span>
                            <span className="font-semibold">{workspaceStats.team}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              Enterprise
                            </span>
                            <span className="font-semibold">{workspaceStats.enterprise}</span>
                          </div>
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
                              <span>Average Members per Workspace</span>
                              <span className="font-semibold">
                                {Math.round(workspaceStats.averageMembers * 10) / 10}
                              </span>
                            </div>
                            <Progress value={(workspaceStats.averageMembers / 10) * 100} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Average Resources per Workspace</span>
                              <span className="font-semibold">
                                {Math.round(workspaceStats.averageResources * 10) / 10}
                              </span>
                            </div>
                            <Progress value={(workspaceStats.averageResources / 20) * 100} />
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

        {/* Create Workspace Dialog */}
        <CreateWorkspaceDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateWorkspace}
          templates={availableTemplates}
          isLoading={isAnimating}
        />

        {/* Settings Dialog */}
        <SettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          config={config}
          onConfigChange={setConfig}
        />

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

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Create Workspace Dialog Component
 */
interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWorkspaceRequest) => Promise<void>;
  templates: WorkspaceTemplate[];
  isLoading: boolean;
}

const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  templates,
  isLoading
}) => {
  const [formData, setFormData] = useState<CreateWorkspaceRequest>({
    name: '',
    description: '',
    type: WorkspaceType.PERSONAL,
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
        public: false,
        allowInvites: true,
        showActivity: true
      },
      integrations: {},
      customizations: {}
    },
    tags: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState<UUID | null>(null);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = selectedTemplate
      ? { ...formData, templateId: selectedTemplate }
      : formData;
    
    await onSubmit(submitData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      type: WorkspaceType.PERSONAL,
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
          public: false,
          allowInvites: true,
          showActivity: true
        },
        integrations: {},
        customizations: {}
      },
      tags: []
    });
    setSelectedTemplate(null);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Workspace
          </DialogTitle>
          <DialogDescription>
            Set up a new workspace to organize your data governance resources and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Workspace Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workspace name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Workspace Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as WorkspaceType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={WorkspaceType.PERSONAL}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          Personal
                        </div>
                      </SelectItem>
                      <SelectItem value={WorkspaceType.TEAM}>
                        <div className="flex items-center gap-2">
                          <Users2 className="w-4 h-4 text-green-500" />
                          Team
                        </div>
                      </SelectItem>
                      <SelectItem value={WorkspaceType.ENTERPRISE}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-500" />
                          Enterprise
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and scope of this workspace"
                  rows={3}
                />
              </div>

              {templates.length > 0 && (
                <div>
                  <Label>Choose a Template (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Card 
                      className={cn(
                        "cursor-pointer transition-colors",
                        !selectedTemplate && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedTemplate(null)}
                    >
                      <CardContent className="p-4 text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <h4 className="font-medium">Blank Workspace</h4>
                        <p className="text-sm text-muted-foreground">Start from scratch</p>
                      </CardContent>
                    </Card>
                    
                    {templates.slice(0, 3).map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedTemplate === template.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <Layers className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Settings Dialog Component
 */
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: WorkspaceOrchestratorConfig;
  onConfigChange: (config: WorkspaceOrchestratorConfig) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  config,
  onConfigChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Orchestrator Settings
          </DialogTitle>
          <DialogDescription>
            Configure workspace orchestrator behavior and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Real-time Synchronization</Label>
                <p className="text-sm text-muted-foreground">
                  Enable live updates via WebSocket
                </p>
              </div>
              <Switch
                checked={config.enableRealTimeSync}
                onCheckedChange={(checked) => 
                  onConfigChange({ ...config, enableRealTimeSync: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>AI Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  Show AI-powered workspace suggestions
                </p>
              </div>
              <Switch
                checked={config.enableAIRecommendations}
                onCheckedChange={(checked) => 
                  onConfigChange({ ...config, enableAIRecommendations: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Advanced Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Enable detailed workspace analytics
                </p>
              </div>
              <Switch
                checked={config.enableAdvancedAnalytics}
                onCheckedChange={(checked) => 
                  onConfigChange({ ...config, enableAdvancedAnalytics: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Cross-group Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Enable integration with all SPA groups
                </p>
              </div>
              <Switch
                checked={config.enableCrossGroupIntegration}
                onCheckedChange={(checked) => 
                  onConfigChange({ ...config, enableCrossGroupIntegration: checked })
                }
              />
            </div>

            <div>
              <Label>Default View Mode</Label>
              <Select
                value={config.defaultView}
                onValueChange={(value) => 
                  onConfigChange({ ...config, defaultView: value as any })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="kanban">Kanban View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Max Concurrent Workspaces</Label>
              <div className="mt-2">
                <Slider
                  value={[config.maxConcurrentWorkspaces]}
                  onValueChange={([value]) => 
                    onConfigChange({ ...config, maxConcurrentWorkspaces: value })
                  }
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>1</span>
                  <span>{config.maxConcurrentWorkspaces}</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceOrchestrator;