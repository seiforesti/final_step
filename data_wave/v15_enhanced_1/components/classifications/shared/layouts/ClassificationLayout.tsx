import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BarChart3, TrendingUp, Activity, Database, Monitor, Cpu, AlertTriangle, CheckCircle, XCircle, Settings, Search, Filter, Download, Upload, RefreshCw, Play, Pause, Square, MoreVertical, Eye, Edit, Trash2, Plus, Bell, Shield, Lock, Star, Brain, Network, Bot, Workflow, GitBranch, Boxes, Package, Server, Cloud, HardDrive, Zap, Lightbulb, Target, Users, Calendar, Globe, Menu, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Home, Building, Briefcase, Calculator, CreditCard, FileText, Presentation, MessageSquare, Mail, Phone, Video, Mic, Camera, Image, File, Folder, Archive, Tag, Flag, Map, Navigation, Compass, Route, Layers, Grid, List, Table, Timeline, Chart, PieChart, LineChart, Radar, Microscope, Atom, Fingerprint, QrCode, Barcode, ScanLine, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Copy, Cut, Paste, Scissors, PaintBucket, Palette, Brush, Pen, PenTool, Eraser, Ruler, Move, MousePointer, Hand, GripHorizontal, GripVertical, CornerDownLeft, CornerDownRight, CornerUpLeft, CornerUpRight, ChevronsDown, ChevronsUp, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { toast } from 'sonner';

// Import custom hooks and APIs
import { useClassificationState } from '../../core/hooks/useClassificationState';
import { useRealTimeMonitoring } from '../../core/hooks/useRealTimeMonitoring';
import { useWorkflowOrchestration } from '../../core/hooks/useWorkflowOrchestration';
import { classificationApi } from '../../core/api/classificationApi';
import { websocketApi } from '../../core/api/websocketApi';
import { useClassification } from '../providers/ClassificationProvider';
import { intelligenceProcessor } from '../../core/utils/intelligenceProcessor';
import { performanceOptimizer } from '../../core/utils/performanceOptimizer';

// Advanced TypeScript interfaces for enterprise-grade layout
interface ClassificationLayoutProps {
  children: React.ReactNode;
  version: 'v1-manual' | 'v2-ml' | 'v3-ai';
  component: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  contextualHelp?: ContextualHelp;
  permissions?: string[];
  auditEnabled?: boolean;
  realTimeEnabled?: boolean;
  collaborationEnabled?: boolean;
  workflowEnabled?: boolean;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
}

interface ContextualHelp {
  title: string;
  content: string;
  actions?: HelpAction[];
  videos?: HelpVideo[];
  documentation?: HelpDocument[];
}

interface HelpAction {
  label: string;
  action: () => void;
  icon?: React.ComponentType<any>;
}

interface HelpVideo {
  title: string;
  url: string;
  duration: string;
  thumbnail: string;
}

interface HelpDocument {
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'html';
  size: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: string[];
  version?: string[];
}

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  threshold?: number;
}

interface WorkflowStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error' | 'skipped';
  progress?: number;
  estimatedTime?: string;
  dependencies?: string[];
}

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  shortcut?: string;
  permissions?: string[];
  version?: string[];
}

interface UserActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// Advanced navigation configuration
const navigationConfig: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    href: '/classifications/overview',
    version: ['v1-manual', 'v2-ml', 'v3-ai']
  },
  {
    id: 'v1-manual',
    label: 'Manual & Rule-Based',
    icon: Settings,
    href: '/classifications/v1-manual',
    version: ['v1-manual'],
    children: [
      { id: 'frameworks', label: 'Framework Manager', icon: Building, href: '/classifications/v1-manual/frameworks' },
      { id: 'rules', label: 'Rule Engine', icon: GitBranch, href: '/classifications/v1-manual/rules' },
      { id: 'policies', label: 'Policy Orchestrator', icon: Shield, href: '/classifications/v1-manual/policies' },
      { id: 'bulk-ops', label: 'Bulk Operations', icon: Package, href: '/classifications/v1-manual/bulk-operations' },
      { id: 'audit', label: 'Audit Trail', icon: Eye, href: '/classifications/v1-manual/audit' },
      { id: 'compliance', label: 'Compliance Dashboard', icon: CheckCircle, href: '/classifications/v1-manual/compliance' }
    ]
  },
  {
    id: 'v2-ml',
    label: 'ML-Driven',
    icon: Brain,
    href: '/classifications/v2-ml',
    version: ['v2-ml'],
    children: [
      { id: 'ml-models', label: 'Model Orchestrator', icon: Network, href: '/classifications/v2-ml/models' },
      { id: 'training', label: 'Training Pipeline', icon: Play, href: '/classifications/v2-ml/training' },
      { id: 'adaptive', label: 'Adaptive Learning', icon: Target, href: '/classifications/v2-ml/adaptive' },
      { id: 'hyperparams', label: 'Hyperparameter Optimizer', icon: Zap, href: '/classifications/v2-ml/hyperparams' },
      { id: 'drift', label: 'Drift Detection', icon: AlertTriangle, href: '/classifications/v2-ml/drift' },
      { id: 'features', label: 'Feature Engineering', icon: Boxes, href: '/classifications/v2-ml/features' },
      { id: 'ensemble', label: 'Model Ensemble', icon: Layers, href: '/classifications/v2-ml/ensemble' },
      { id: 'ml-analytics', label: 'ML Analytics', icon: Chart, href: '/classifications/v2-ml/analytics' }
    ]
  },
  {
    id: 'v3-ai',
    label: 'AI-Intelligent',
    icon: Bot,
    href: '/classifications/v3-ai',
    version: ['v3-ai'],
    children: [
      { id: 'ai-orchestrator', label: 'AI Intelligence', icon: Lightbulb, href: '/classifications/v3-ai/orchestrator' },
      { id: 'conversations', label: 'Conversation Manager', icon: MessageSquare, href: '/classifications/v3-ai/conversations' },
      { id: 'reasoning', label: 'Explainable Reasoning', icon: Microscope, href: '/classifications/v3-ai/reasoning' },
      { id: 'auto-tagging', label: 'Auto Tagging', icon: Tag, href: '/classifications/v3-ai/auto-tagging' },
      { id: 'workload-optimizer', label: 'Workload Optimizer', icon: Cpu, href: '/classifications/v3-ai/workload' },
      { id: 'real-time', label: 'Real-time Intelligence', icon: Activity, href: '/classifications/v3-ai/real-time' },
      { id: 'knowledge', label: 'Knowledge Synthesizer', icon: Database, href: '/classifications/v3-ai/knowledge' },
      { id: 'ai-analytics', label: 'AI Analytics', icon: PieChart, href: '/classifications/v3-ai/analytics' }
    ]
  },
  {
    id: 'orchestration',
    label: 'Orchestration',
    icon: Workflow,
    href: '/classifications/orchestration',
    version: ['v1-manual', 'v2-ml', 'v3-ai'],
    children: [
      { id: 'workflow', label: 'Classification Workflow', icon: GitBranch, href: '/classifications/orchestration/workflow' },
      { id: 'intelligence', label: 'Intelligence Coordinator', icon: Network, href: '/classifications/orchestration/intelligence' },
      { id: 'business-intelligence', label: 'Business Intelligence', icon: TrendingUp, href: '/classifications/orchestration/bi' }
    ]
  }
];

// Quick actions configuration
const quickActionsConfig: QuickAction[] = [
  {
    id: 'create-framework',
    label: 'Create Framework',
    icon: Plus,
    action: () => {},
    shortcut: 'Ctrl+N',
    version: ['v1-manual']
  },
  {
    id: 'train-model',
    label: 'Train Model',
    icon: Play,
    action: () => {},
    shortcut: 'Ctrl+T',
    version: ['v2-ml']
  },
  {
    id: 'start-ai-session',
    label: 'Start AI Session',
    icon: Bot,
    action: () => {},
    shortcut: 'Ctrl+A',
    version: ['v3-ai']
  },
  {
    id: 'bulk-classify',
    label: 'Bulk Classify',
    icon: Package,
    action: () => {},
    shortcut: 'Ctrl+B'
  },
  {
    id: 'export-results',
    label: 'Export Results',
    icon: ArrowDownTrayIcon,
    action: () => {},
    shortcut: 'Ctrl+E'
  },
  {
    id: 'view-audit',
    label: 'View Audit Trail',
    icon: Eye,
    action: () => {},
    shortcut: 'Ctrl+L'
  }
];

export const ClassificationLayout: React.FC<ClassificationLayoutProps> = ({
  children,
  version,
  component,
  title,
  description,
  actions,
  sidebar,
  breadcrumbs = [],
  contextualHelp,
  permissions = [],
  auditEnabled = true,
  realTimeEnabled = true,
  collaborationEnabled = true,
  workflowEnabled = true,
  className
}) => {
  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<string | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

  // Enhanced Custom hooks with real API integration
  const {
    state: classificationState,
    actions: classificationActions
  } = useClassification();

  const {
    state: workflowState,
    actions: workflowActions,
    realTimeData,
    performance
  } = useClassificationState({
    apiEndpoint: process.env.NEXT_PUBLIC_API_URL,
    enableRealTime: realTimeEnabled,
    enableCache: true,
    cacheStrategy: 'intelligent',
    performanceTracking: true
  });

  const {
    monitoringData,
    systemHealth,
    alerts,
    startMonitoring,
    stopMonitoring
  } = useRealTimeMonitoring({
    enabled: realTimeEnabled,
    interval: 5000,
    metrics: ['cpu', 'memory', 'network', 'database', 'queue']
  });

  const {
    workflowState: orchestrationState,
    currentStep,
    progress,
    executeStep,
    pauseWorkflow,
    resumeWorkflow,
    resetWorkflow,
    optimizeWorkflow,
    predictNextStep,
    validateStepDependencies
  } = useWorkflowOrchestration({
    enabled: workflowEnabled,
    autoProgress: true,
    stepTimeout: 30000,
    intelligentRouting: true,
    performanceOptimization: true,
    predictiveAnalytics: true,
    contextualAssistance: true,
    apiIntegration: {
      endpoint: `${process.env.NEXT_PUBLIC_API_URL}/workflows`,
      realTimeUpdates: realTimeEnabled,
      batchOperations: true
    }
  });

  // Animation controls
  const sidebarAnimation = useAnimation();
  const contentAnimation = useAnimation();

  // Refs
  const layoutRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Computed values
  const filteredNavigation = useMemo(() => {
    return navigationConfig.filter(item => 
      !item.version || item.version.includes(version)
    );
  }, [version]);

  const availableQuickActions = useMemo(() => {
    return quickActionsConfig.filter(action => 
      !action.version || action.version.includes(version)
    );
  }, [version]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const currentNavItem = useMemo(() => {
    const findNavItem = (items: NavigationItem[], target: string): NavigationItem | null => {
      for (const item of items) {
        if (item.id === target) return item;
        if (item.children) {
          const found = findNavItem(item.children, target);
          if (found) return found;
        }
      }
      return null;
    };
    return findNavItem(filteredNavigation, component);
  }, [filteredNavigation, component]);

  // Effects
  useEffect(() => {
    if (realTimeEnabled) {
      startMonitoring();
      return () => stopMonitoring();
    }
  }, [realTimeEnabled, startMonitoring, stopMonitoring]);

  useEffect(() => {
    // Initialize WebSocket connections
    if (realTimeEnabled) {
      websocketApi.connect();
      websocketApi.subscribe('classification-updates', handleRealTimeUpdate);
      websocketApi.subscribe('system-metrics', handleSystemMetrics);
      websocketApi.subscribe('notifications', handleNotifications);
      
      return () => {
        websocketApi.unsubscribe('classification-updates');
        websocketApi.unsubscribe('system-metrics');
        websocketApi.unsubscribe('notifications');
        websocketApi.disconnect();
      };
    }
  }, [realTimeEnabled]);

  useEffect(() => {
    // Animate sidebar state changes
    sidebarAnimation.start({
      width: sidebarCollapsed ? '64px' : '280px',
      transition: { duration: 0.3, ease: 'easeInOut' }
    });

    contentAnimation.start({
      marginLeft: sidebarCollapsed ? '64px' : '280px',
      transition: { duration: 0.3, ease: 'easeInOut' }
    });
  }, [sidebarCollapsed, sidebarAnimation, contentAnimation]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            setCommandPaletteOpen(true);
            break;
          case '/':
            event.preventDefault();
            setSearchQuery('');
            document.getElementById('global-search')?.focus();
            break;
          case 'b':
            event.preventDefault();
            setSidebarCollapsed(!sidebarCollapsed);
            break;
          case 'h':
            event.preventDefault();
            setHelpOpen(true);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [sidebarCollapsed]);

  // Event handlers
  const handleRealTimeUpdate = useCallback((data: any) => {
    // Handle real-time classification updates
    classificationActions.updateRealTimeData(data);
    
    // Show toast notification for important updates
    if (data.type === 'classification-completed') {
      toast.success(`Classification completed: ${data.name}`, {
        description: `Processed ${data.itemCount} items with ${data.accuracy}% accuracy`
      });
    }
  }, [classificationActions]);

  const handleSystemMetrics = useCallback((metrics: SystemMetric[]) => {
    setSystemMetrics(metrics);
    
    // Check for critical alerts
    const criticalMetrics = metrics.filter(m => m.status === 'critical');
    if (criticalMetrics.length > 0) {
      toast.error('System Alert', {
        description: `${criticalMetrics.length} critical metrics detected`
      });
    }
  }, []);

  const handleNotifications = useCallback((notification: NotificationItem) => {
    setNotifications(prev => [notification, ...prev.slice(0, 99)]);
    
    // Show toast for high-priority notifications
    if (notification.type === 'error') {
      toast.error(notification.title, {
        description: notification.message
      });
    }
  }, []);

  const handleNavigationClick = useCallback((item: NavigationItem) => {
    // Handle navigation with analytics tracking
    classificationActions.trackNavigation(item.id, item.href);
    
    // Update workflow state if applicable
    if (workflowEnabled && workflowState.active) {
      executeStep(item.id);
    }
  }, [classificationActions, workflowEnabled, workflowState, executeStep]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    // Execute quick action with audit logging
    if (auditEnabled) {
      classificationActions.logAuditEvent({
        action: 'quick-action',
        target: action.id,
        details: { label: action.label }
      });
    }
    
    action.action();
  }, [auditEnabled, classificationActions]);

  const handleSearchSubmit = useCallback((query: string) => {
    // Perform global search across all classification data
    classificationActions.performGlobalSearch(query);
  }, [classificationActions]);

  // Render helpers
  const renderBreadcrumbs = () => {
    if (!breadcrumbs.length) return null;

    return (
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <div className={cn(
              "flex items-center space-x-1",
              item.current ? "text-foreground font-medium" : "hover:text-foreground cursor-pointer"
            )}>
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.label}</span>
            </div>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  const renderSystemMetrics = () => {
    if (!systemMetrics.length) return null;

    return (
      <div className="flex items-center space-x-4 px-4 py-2 bg-muted/50 rounded-lg">
        {systemMetrics.slice(0, 4).map(metric => (
          <div key={metric.id} className="flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              metric.status === 'healthy' && "bg-green-500",
              metric.status === 'warning' && "bg-yellow-500",
              metric.status === 'critical' && "bg-red-500"
            )} />
            <span className="text-sm font-medium">{metric.label}</span>
            <span className="text-sm text-muted-foreground">
              {metric.value}{metric.unit}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderWorkflowProgress = () => {
    if (!workflowEnabled || !workflowState.active) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Workflow Progress</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => workflowState.paused ? resumeWorkflow() : pauseWorkflow()}
              >
                {workflowState.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={resetWorkflow}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step {currentStep + 1} of {workflowSteps.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {workflowSteps[currentStep] && (
              <p className="text-sm text-muted-foreground">
                {workflowSteps[currentStep].label}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSidebar = () => (
    <motion.div
      ref={sidebarRef}
      animate={sidebarAnimation}
      className="fixed left-0 top-0 h-full bg-background border-r border-border z-30"
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Classifications</h2>
                <p className="text-xs text-muted-foreground capitalize">{version.replace('-', ' ')}</p>
              </div>
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-2">
            {filteredNavigation.map(item => (
              <div key={item.id}>
                <Button
                  variant={currentNavItem?.id === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    sidebarCollapsed && "px-2"
                  )}
                  onClick={() => handleNavigationClick(item)}
                >
                  <item.icon className="h-4 w-4" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="ml-2">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
                
                {!sidebarCollapsed && item.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map(child => (
                      <Button
                        key={child.id}
                        variant={component === child.id ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-sm"
                        onClick={() => handleNavigationClick(child)}
                      >
                        <child.icon className="h-3 w-3" />
                        <span className="ml-2">{child.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="space-y-3">
              {renderSystemMetrics()}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">System Status</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">Healthy</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderHeader = () => (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold">{title || currentNavItem?.label}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Global Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="global-search"
              placeholder="Search classifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
              className="pl-10 w-64"
            />
          </div>

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Quick Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableQuickActions.map(action => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <action.icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </div>
                  {action.shortcut && (
                    <span className="text-xs text-muted-foreground">
                      {action.shortcut}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-64">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map(notification => (
                    <div key={notification.id} className="p-3 border-b border-border last:border-0">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          notification.type === 'info' && "bg-blue-500",
                          notification.type === 'success' && "bg-green-500",
                          notification.type === 'warning' && "bg-yellow-500",
                          notification.type === 'error' && "bg-red-500"
                        )} />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setHelpOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          {/* Settings */}
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Actions */}
          {actions}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 pb-3">
        {renderBreadcrumbs()}
      </div>
    </header>
  );

  const renderCommandPalette = () => (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Search for commands, navigate to pages, or perform quick actions
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {filteredNavigation.map(item => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    handleNavigationClick(item);
                    setCommandPaletteOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Quick Actions">
              {availableQuickActions.map(action => (
                <CommandItem
                  key={action.id}
                  onSelect={() => {
                    handleQuickAction(action);
                    setCommandPaletteOpen(false);
                  }}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span>{action.label}</span>
                  {action.shortcut && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {action.shortcut}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );

  const renderContextualHelp = () => (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{contextualHelp?.title || 'Help & Documentation'}</DialogTitle>
          <DialogDescription>
            Get help with the current component and learn about advanced features
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="space-y-6">
            {contextualHelp?.content && (
              <div className="prose prose-sm max-w-none">
                <p>{contextualHelp.content}</p>
              </div>
            )}
            
            {contextualHelp?.videos && contextualHelp.videos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Video Tutorials</h3>
                <div className="grid grid-cols-2 gap-4">
                  {contextualHelp.videos.map((video, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-medium text-sm">{video.title}</h4>
                        <p className="text-xs text-muted-foreground">{video.duration}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {contextualHelp?.documentation && contextualHelp.documentation.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Documentation</h3>
                <div className="space-y-2">
                  {contextualHelp.documentation.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium text-sm">{doc.title}</h4>
                          <p className="text-xs text-muted-foreground">{doc.type.toUpperCase()} • {doc.size}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contextualHelp?.actions && contextualHelp.actions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {contextualHelp.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={action.action}
                      className="justify-start"
                    >
                      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider>
      <div ref={layoutRef} className={cn("min-h-screen bg-background", className)}>
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content */}
        <motion.div
          ref={contentRef}
          animate={contentAnimation}
          className="min-h-screen"
        >
          {/* Header */}
          {renderHeader()}

          {/* Workflow Progress */}
          <div className="px-6 py-4">
            {renderWorkflowProgress()}
          </div>

          {/* Main Content Area */}
          <main className="px-6 pb-6">
            <div className="flex gap-6">
              {/* Primary Content */}
              <div className="flex-1">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">Loading component...</p>
                      </div>
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </div>

              {/* Sidebar Content */}
              {sidebar && (
                <div className="w-80 space-y-4">
                  {sidebar}
                </div>
              )}
            </div>
          </main>
        </motion.div>

        {/* Command Palette */}
        {renderCommandPalette()}

        {/* Contextual Help */}
        {renderContextualHelp()}
      </div>
    </TooltipProvider>
  );
};

export default ClassificationLayout;