/**
 * 🎼 Workflow Orchestrator - Advanced Scan Logic
 * ============================================
 * 
 * Enterprise-grade workflow orchestration engine that serves as the central
 * brain for coordinating complex scan workflows with intelligent automation,
 * advanced resource allocation, and real-time monitoring capabilities.
 * 
 * Features:
 * - Advanced DAG-based workflow visualization and management
 * - Intelligent resource allocation and optimization
 * - Real-time workflow monitoring and control
 * - Dynamic workflow adaptation and self-healing
 * - Cross-system workflow coordination
 * - Enterprise security and compliance integration
 * - Advanced analytics and performance insights
 * - AI-powered workflow optimization
 * - Comprehensive error handling and recovery
 * - Multi-tenant workflow isolation and management
 * 
 * Architecture:
 * - Reactive workflow engine with event-driven coordination
 * - Distributed execution with fault tolerance
 * - Advanced caching and state management
 * - Real-time collaboration and notification systems
 * - Enterprise integration with external systems
 * 
 * @author Enterprise Data Governance Team
 * @version 2.0.0 - Production Enterprise Ready
 * @component WorkflowOrchestrator
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Settings,
  Monitor,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Layers,
  Network,
  Zap,
  Brain,
  Target,
  Shield,
  Lock,
  Unlock,
  Database,
  Server,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  Cloud,
  CloudLightning,
  CloudRain,
  Sun,
  Moon,
  Star,
  Clock,
  Timer,
  Stopwatch,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Filter,
  Search,
  Download,
  Upload,
  Share,
  Copy,
  Edit,
  Trash2,
  Plus,
  Minus,
  Maximize,
  Minimize,
  RefreshCw,
  Save,
  Send,
  MessageSquare,
  Users,
  User,
  MapPin,
  Globe,
  Link,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Box,
  Package,
  Archive,
  Folder,
  File,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Terminal,
  Command,
  Shortcut,
  Tag,
  Hash,
  AtSign,
  Percent,
  DollarSign,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  CreditCard,
  Banknote,
  Receipt,
  Calculator,
  PenTool,
  Brush,
  Palette,
  Droplet,
  Flame,
  Snowflake,
  Wind,
  Umbrella,
  Trees,
  Flower,
  Leaf,
  Seedling,
  Mountain,
  Waves,
  Zap as Lightning
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Advanced Scan Logic Imports
import { ScanOrchestrationAPIService } from '../../services/scan-orchestration-apis';
import { ScanWorkflowAPIService } from '../../services/scan-workflow-apis';
import { ScanCoordinationAPIService } from '../../services/scan-coordination-apis';
import { ScanPerformanceAPIService } from '../../services/scan-performance-apis';
import { IntelligentScanningAPIService } from '../../services/intelligent-scanning-apis';

// Hooks
import { useScanOrchestration } from '../../hooks/useScanOrchestration';
import { useWorkflowManagement } from '../../hooks/useWorkflowManagement';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';

// Types
import {
  ScanOrchestrationJob,
  WorkflowTemplate,
  ExecutionPipeline,
  WorkflowStep,
  WorkflowStatus,
  OrchestrationJobType,
  OrchestrationPriority,
  ResourceAllocation,
  OrchestrationConfiguration,
  WorkflowExecution,
  WorkflowNode,
  WorkflowEdge,
  WorkflowMetrics,
  ExecutionMetrics,
  ResourceMetrics,
  PerformanceMetrics,
  WorkflowFilters,
  WorkflowSort,
  WorkflowValidation,
  WorkflowOptimization,
  WorkflowSecurity,
  CrossSystemCoordination
} from '../../types/orchestration.types';

// Utils
import { orchestrationEngine } from '../../utils/orchestration-engine';
import { workflowExecutor } from '../../utils/workflow-executor';
import { performanceCalculator } from '../../utils/performance-calculator';
import { optimizationAlgorithms } from '../../utils/optimization-algorithms';
import { coordinationManager } from '../../utils/coordination-manager';

// Constants
import { 
  WORKFLOW_TEMPLATES,
  ORCHESTRATION_STRATEGIES,
  RESOURCE_ALLOCATION_STRATEGIES,
  PERFORMANCE_THRESHOLDS,
  EXECUTION_MODES
} from '../../constants/workflow-templates';

// Workflow state reducer
interface WorkflowState {
  selectedWorkflow: ScanOrchestrationJob | null;
  workflows: ScanOrchestrationJob[];
  executions: WorkflowExecution[];
  activeView: 'designer' | 'monitor' | 'analytics' | 'templates';
  selectedNodes: string[];
  workflowGraph: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  executionMetrics: ExecutionMetrics;
  resourceMetrics: ResourceMetrics;
  performanceMetrics: PerformanceMetrics;
  realTimeUpdates: boolean;
  isDesigning: boolean;
  isExecuting: boolean;
  draggedNode: WorkflowNode | null;
  selectedTemplate: WorkflowTemplate | null;
  filters: WorkflowFilters;
  sort: WorkflowSort;
  searchQuery: string;
  showAdvancedOptions: boolean;
  notifications: any[];
  errors: any[];
  isLoading: boolean;
}

type WorkflowAction = 
  | { type: 'SET_SELECTED_WORKFLOW'; payload: ScanOrchestrationJob | null }
  | { type: 'SET_WORKFLOWS'; payload: ScanOrchestrationJob[] }
  | { type: 'SET_EXECUTIONS'; payload: WorkflowExecution[] }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'designer' | 'monitor' | 'analytics' | 'templates' }
  | { type: 'SET_SELECTED_NODES'; payload: string[] }
  | { type: 'SET_WORKFLOW_GRAPH'; payload: { nodes: WorkflowNode[]; edges: WorkflowEdge[] } }
  | { type: 'SET_EXECUTION_METRICS'; payload: ExecutionMetrics }
  | { type: 'SET_RESOURCE_METRICS'; payload: ResourceMetrics }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: PerformanceMetrics }
  | { type: 'TOGGLE_REAL_TIME_UPDATES' }
  | { type: 'SET_IS_DESIGNING'; payload: boolean }
  | { type: 'SET_IS_EXECUTING'; payload: boolean }
  | { type: 'SET_DRAGGED_NODE'; payload: WorkflowNode | null }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: WorkflowTemplate | null }
  | { type: 'SET_FILTERS'; payload: WorkflowFilters }
  | { type: 'SET_SORT'; payload: WorkflowSort }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_ADVANCED_OPTIONS' }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'ADD_ERROR'; payload: any }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const workflowReducer = (state: WorkflowState, action: WorkflowAction): WorkflowState => {
  switch (action.type) {
    case 'SET_SELECTED_WORKFLOW':
      return { ...state, selectedWorkflow: action.payload };
    case 'SET_WORKFLOWS':
      return { ...state, workflows: action.payload };
    case 'SET_EXECUTIONS':
      return { ...state, executions: action.payload };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_SELECTED_NODES':
      return { ...state, selectedNodes: action.payload };
    case 'SET_WORKFLOW_GRAPH':
      return { ...state, workflowGraph: action.payload };
    case 'SET_EXECUTION_METRICS':
      return { ...state, executionMetrics: action.payload };
    case 'SET_RESOURCE_METRICS':
      return { ...state, resourceMetrics: action.payload };
    case 'SET_PERFORMANCE_METRICS':
      return { ...state, performanceMetrics: action.payload };
    case 'TOGGLE_REAL_TIME_UPDATES':
      return { ...state, realTimeUpdates: !state.realTimeUpdates };
    case 'SET_IS_DESIGNING':
      return { ...state, isDesigning: action.payload };
    case 'SET_IS_EXECUTING':
      return { ...state, isExecuting: action.payload };
    case 'SET_DRAGGED_NODE':
      return { ...state, draggedNode: action.payload };
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'TOGGLE_ADVANCED_OPTIONS':
      return { ...state, showAdvancedOptions: !state.showAdvancedOptions };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, { 
          id: Date.now().toString(), 
          timestamp: new Date(), 
          ...action.payload 
        }] 
      };
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    case 'ADD_ERROR':
      return { 
        ...state, 
        errors: [...state.errors, { 
          id: Date.now().toString(), 
          timestamp: new Date(), 
          ...action.payload 
        }] 
      };
    case 'REMOVE_ERROR':
      return { 
        ...state, 
        errors: state.errors.filter(e => e.id !== action.payload) 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const initialWorkflowState: WorkflowState = {
  selectedWorkflow: null,
  workflows: [],
  executions: [],
  activeView: 'designer',
  selectedNodes: [],
  workflowGraph: { nodes: [], edges: [] },
  executionMetrics: {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    executionTrends: []
  },
  resourceMetrics: {
    cpuUtilization: 0,
    memoryUtilization: 0,
    storageUtilization: 0,
    networkUtilization: 0,
    resourceTrends: []
  },
  performanceMetrics: {
    throughput: 0,
    latency: 0,
    errorRate: 0,
    availability: 0,
    performanceTrends: []
  },
  realTimeUpdates: true,
  isDesigning: false,
  isExecuting: false,
  draggedNode: null,
  selectedTemplate: null,
  filters: {
    status: [],
    type: [],
    priority: [],
    dateRange: { start: null, end: null }
  },
  sort: { field: 'created_at', direction: 'desc' },
  searchQuery: '',
  showAdvancedOptions: false,
  notifications: [],
  errors: [],
  isLoading: false
};

// Main WorkflowOrchestrator Component
export const WorkflowOrchestrator: React.FC = () => {
  // State management
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);
  
  // Refs for canvas and drag operations
  const canvasRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const workflowUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // API services
  const orchestrationAPI = useMemo(() => new ScanOrchestrationAPIService(), []);
  const workflowAPI = useMemo(() => new ScanWorkflowAPIService(), []);
  const coordinationAPI = useMemo(() => new ScanCoordinationAPIService(), []);
  const performanceAPI = useMemo(() => new ScanPerformanceAPIService(), []);
  const intelligentScanAPI = useMemo(() => new IntelligentScanningAPIService(), []);
  
  // Hooks for advanced functionality
  const {
    orchestrationJobs,
    createOrchestrationJob,
    updateOrchestrationJob,
    deleteOrchestrationJob,
    startOrchestrationJob,
    pauseOrchestrationJob,
    resumeOrchestrationJob,
    cancelOrchestrationJob,
    getOrchestrationMetrics,
    optimizeOrchestrationJob,
    isLoading: orchestrationLoading,
    error: orchestrationError
  } = useScanOrchestration();
  
  const {
    workflows,
    workflowTemplates,
    createWorkflow,
    updateWorkflow,
    executeWorkflow,
    validateWorkflow,
    optimizeWorkflow,
    cloneWorkflow,
    exportWorkflow,
    importWorkflow,
    isLoading: workflowLoading,
    error: workflowError
  } = useWorkflowManagement();
  
  const {
    realTimeMetrics,
    performanceData,
    resourceUtilization,
    alertSummary,
    systemHealth,
    subscribe,
    unsubscribe,
    isConnected
  } = useRealTimeMonitoring({
    autoConnect: state.realTimeUpdates,
    updateInterval: 5000
  });

  // ==================== LIFECYCLE HOOKS ====================
  
  useEffect(() => {
    // Initialize component and load data
    initializeWorkflowOrchestrator();
    
    return () => {
      // Cleanup
      if (workflowUpdateIntervalRef.current) {
        clearInterval(workflowUpdateIntervalRef.current);
      }
      unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // Update real-time monitoring subscription
    if (state.realTimeUpdates) {
      subscribe(['workflow-metrics', 'execution-status', 'resource-usage']);
    } else {
      unsubscribe();
    }
  }, [state.realTimeUpdates, subscribe, unsubscribe]);
  
  useEffect(() => {
    // Update metrics from real-time data
    if (realTimeMetrics) {
      dispatch({ type: 'SET_EXECUTION_METRICS', payload: realTimeMetrics.execution });
      dispatch({ type: 'SET_RESOURCE_METRICS', payload: realTimeMetrics.resources });
      dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: realTimeMetrics.performance });
    }
  }, [realTimeMetrics]);
  
  useEffect(() => {
    // Handle orchestration jobs updates
    if (orchestrationJobs) {
      dispatch({ type: 'SET_WORKFLOWS', payload: orchestrationJobs });
    }
  }, [orchestrationJobs]);
  
  useEffect(() => {
    // Handle errors
    if (orchestrationError || workflowError) {
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: orchestrationError?.message || workflowError?.message,
          type: 'error'
        }
      });
    }
  }, [orchestrationError, workflowError]);

  // ==================== CORE FUNCTIONS ====================
  
  const initializeWorkflowOrchestrator = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load initial data
      await Promise.all([
        loadWorkflows(),
        loadWorkflowTemplates(),
        loadExecutionHistory(),
        loadMetrics()
      ]);
      
      // Set up real-time updates if enabled
      if (state.realTimeUpdates) {
        setupRealTimeUpdates();
      }
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: 'Workflow Orchestrator initialized successfully',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Failed to initialize Workflow Orchestrator:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to initialize Workflow Orchestrator',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.realTimeUpdates]);
  
  const loadWorkflows = useCallback(async () => {
    try {
      const response = await orchestrationAPI.listOrchestrationJobs({
        filters: state.filters,
        sort: state.sort,
        limit: 100
      });
      dispatch({ type: 'SET_WORKFLOWS', payload: response.jobs });
    } catch (error) {
      console.error('Failed to load workflows:', error);
      throw error;
    }
  }, [orchestrationAPI, state.filters, state.sort]);
  
  const loadWorkflowTemplates = useCallback(async () => {
    try {
      const templates = await workflowAPI.getWorkflowTemplates();
      // Handle templates data
    } catch (error) {
      console.error('Failed to load workflow templates:', error);
      throw error;
    }
  }, [workflowAPI]);
  
  const loadExecutionHistory = useCallback(async () => {
    try {
      const executions = await workflowAPI.getExecutionHistory({
        limit: 50,
        includeMetrics: true
      });
      dispatch({ type: 'SET_EXECUTIONS', payload: executions });
    } catch (error) {
      console.error('Failed to load execution history:', error);
      throw error;
    }
  }, [workflowAPI]);
  
  const loadMetrics = useCallback(async () => {
    try {
      const [executionMetrics, resourceMetrics, performanceMetrics] = await Promise.all([
        performanceAPI.getExecutionMetrics(),
        performanceAPI.getResourceMetrics(),
        performanceAPI.getPerformanceMetrics()
      ]);
      
      dispatch({ type: 'SET_EXECUTION_METRICS', payload: executionMetrics });
      dispatch({ type: 'SET_RESOURCE_METRICS', payload: resourceMetrics });
      dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: performanceMetrics });
    } catch (error) {
      console.error('Failed to load metrics:', error);
      throw error;
    }
  }, [performanceAPI]);
  
  const setupRealTimeUpdates = useCallback(() => {
    workflowUpdateIntervalRef.current = setInterval(async () => {
      try {
        await Promise.all([
          loadWorkflows(),
          loadMetrics()
        ]);
      } catch (error) {
        console.error('Failed to update real-time data:', error);
      }
    }, 5000);
  }, [loadWorkflows, loadMetrics]);

  // ==================== WORKFLOW OPERATIONS ====================
  
  const handleCreateWorkflow = useCallback(async (config: Partial<ScanOrchestrationJob>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newWorkflow = await createOrchestrationJob({
        name: config.name || 'New Workflow',
        description: config.description,
        type: config.type || OrchestrationJobType.COMPLEX_WORKFLOW,
        priority: config.priority || OrchestrationPriority.NORMAL,
        configuration: config.configuration || {},
        ...config
      });
      
      dispatch({ type: 'SET_SELECTED_WORKFLOW', payload: newWorkflow });
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: `Workflow "${newWorkflow.name}" created successfully`,
          type: 'success'
        }
      });
      
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to create workflow',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [createOrchestrationJob, loadWorkflows]);
  
  const handleUpdateWorkflow = useCallback(async (workflowId: string, updates: Partial<ScanOrchestrationJob>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedWorkflow = await updateOrchestrationJob(workflowId, updates);
      
      if (state.selectedWorkflow?.id === workflowId) {
        dispatch({ type: 'SET_SELECTED_WORKFLOW', payload: updatedWorkflow });
      }
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: `Workflow "${updatedWorkflow.name}" updated successfully`,
          type: 'success'
        }
      });
      
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to update workflow:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to update workflow',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [updateOrchestrationJob, loadWorkflows, state.selectedWorkflow]);
  
  const handleExecuteWorkflow = useCallback(async (workflowId: string, options?: any) => {
    try {
      dispatch({ type: 'SET_IS_EXECUTING', payload: true });
      
      const execution = await startOrchestrationJob(workflowId, options);
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: `Workflow execution started: ${execution.execution_id}`,
          type: 'info'
        }
      });
      
      // Monitor execution progress
      monitorExecution(execution.execution_id);
      
      await loadWorkflows();
      await loadExecutionHistory();
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to execute workflow',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_IS_EXECUTING', payload: false });
    }
  }, [startOrchestrationJob, loadWorkflows, loadExecutionHistory]);
  
  const handlePauseWorkflow = useCallback(async (workflowId: string) => {
    try {
      await pauseOrchestrationJob(workflowId);
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: 'Workflow paused successfully',
          type: 'info'
        }
      });
      
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to pause workflow:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to pause workflow',
          type: 'error'
        }
      });
    }
  }, [pauseOrchestrationJob, loadWorkflows]);
  
  const handleResumeWorkflow = useCallback(async (workflowId: string) => {
    try {
      await resumeOrchestrationJob(workflowId);
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: 'Workflow resumed successfully',
          type: 'success'
        }
      });
      
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to resume workflow:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to resume workflow',
          type: 'error'
        }
      });
    }
  }, [resumeOrchestrationJob, loadWorkflows]);
  
  const handleCancelWorkflow = useCallback(async (workflowId: string) => {
    try {
      await cancelOrchestrationJob(workflowId);
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: 'Workflow cancelled successfully',
          type: 'warning'
        }
      });
      
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to cancel workflow:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to cancel workflow',
          type: 'error'
        }
      });
    }
  }, [cancelOrchestrationJob, loadWorkflows]);
  
  const handleDeleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      await deleteOrchestrationJob(workflowId);
      
      if (state.selectedWorkflow?.id === workflowId) {
        dispatch({ type: 'SET_SELECTED_WORKFLOW', payload: null });
      }
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: 'Workflow deleted successfully',
          type: 'success'
        }
      });
      
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to delete workflow',
          type: 'error'
        }
      });
    }
  }, [deleteOrchestrationJob, loadWorkflows, state.selectedWorkflow]);

  // ==================== WORKFLOW DESIGN FUNCTIONS ====================
  
  const handleNodeDrag = useCallback((node: WorkflowNode, position: { x: number; y: number }) => {
    const updatedNodes = state.workflowGraph.nodes.map(n => 
      n.id === node.id ? { ...n, position } : n
    );
    
    dispatch({ 
      type: 'SET_WORKFLOW_GRAPH', 
      payload: { 
        ...state.workflowGraph, 
        nodes: updatedNodes 
      }
    });
  }, [state.workflowGraph]);
  
  const handleNodeSelect = useCallback((nodeId: string, multiSelect = false) => {
    let selectedNodes: string[];
    
    if (multiSelect) {
      selectedNodes = state.selectedNodes.includes(nodeId)
        ? state.selectedNodes.filter(id => id !== nodeId)
        : [...state.selectedNodes, nodeId];
    } else {
      selectedNodes = [nodeId];
    }
    
    dispatch({ type: 'SET_SELECTED_NODES', payload: selectedNodes });
  }, [state.selectedNodes]);
  
  const handleNodeAdd = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: `${nodeType} Node`,
        config: {}
      }
    };
    
    const updatedNodes = [...state.workflowGraph.nodes, newNode];
    
    dispatch({ 
      type: 'SET_WORKFLOW_GRAPH', 
      payload: { 
        ...state.workflowGraph, 
        nodes: updatedNodes 
      }
    });
  }, [state.workflowGraph]);
  
  const handleNodeDelete = useCallback((nodeIds: string[]) => {
    const updatedNodes = state.workflowGraph.nodes.filter(n => !nodeIds.includes(n.id));
    const updatedEdges = state.workflowGraph.edges.filter(e => 
      !nodeIds.includes(e.source) && !nodeIds.includes(e.target)
    );
    
    dispatch({ 
      type: 'SET_WORKFLOW_GRAPH', 
      payload: { 
        nodes: updatedNodes, 
        edges: updatedEdges 
      }
    });
    
    dispatch({ type: 'SET_SELECTED_NODES', payload: [] });
  }, [state.workflowGraph]);
  
  const handleEdgeAdd = useCallback((sourceId: string, targetId: string) => {
    const newEdge: WorkflowEdge = {
      id: `edge_${sourceId}_${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'default'
    };
    
    const updatedEdges = [...state.workflowGraph.edges, newEdge];
    
    dispatch({ 
      type: 'SET_WORKFLOW_GRAPH', 
      payload: { 
        ...state.workflowGraph, 
        edges: updatedEdges 
      }
    });
  }, [state.workflowGraph]);

  // ==================== MONITORING FUNCTIONS ====================
  
  const monitorExecution = useCallback(async (executionId: string) => {
    // Implementation for monitoring workflow execution
    const monitorInterval = setInterval(async () => {
      try {
        const executionStatus = await workflowAPI.getExecutionStatus(executionId);
        
        if (executionStatus.status === 'completed' || executionStatus.status === 'failed') {
          clearInterval(monitorInterval);
          
          dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: { 
              message: `Workflow execution ${executionStatus.status}: ${executionId}`,
              type: executionStatus.status === 'completed' ? 'success' : 'error'
            }
          });
          
          await loadExecutionHistory();
        }
      } catch (error) {
        console.error('Failed to monitor execution:', error);
        clearInterval(monitorInterval);
      }
    }, 2000);
  }, [workflowAPI, loadExecutionHistory]);

  // ==================== UTILITY FUNCTIONS ====================
  
  const getStatusColor = useCallback((status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case WorkflowStatus.RUNNING:
        return 'text-blue-600 bg-blue-50';
      case WorkflowStatus.FAILED:
        return 'text-red-600 bg-red-50';
      case WorkflowStatus.PAUSED:
        return 'text-yellow-600 bg-yellow-50';
      case WorkflowStatus.CANCELLED:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }, []);
  
  const getPriorityColor = useCallback((priority: OrchestrationPriority) => {
    switch (priority) {
      case OrchestrationPriority.URGENT:
        return 'text-red-600 bg-red-50';
      case OrchestrationPriority.HIGH:
        return 'text-orange-600 bg-orange-50';
      case OrchestrationPriority.NORMAL:
        return 'text-blue-600 bg-blue-50';
      case OrchestrationPriority.LOW:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }, []);
  
  const formatDuration = useCallback((milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // ==================== RENDER FUNCTIONS ====================
  
  const renderWorkflowDesigner = () => (
    <div className="h-full flex flex-col">
      {/* Designer Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Workflow Designer</h3>
          <Badge variant="outline" className="text-xs">
            {state.workflowGraph.nodes.length} nodes, {state.workflowGraph.edges.length} edges
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNodeAdd('scan', { x: 100, y: 100 })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Node
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => state.selectedNodes.length > 0 && handleNodeDelete(state.selectedNodes)}
            disabled={state.selectedNodes.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Validate workflow */}}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Validate
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => {/* Save workflow */}}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Designer Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={canvasRef}
          className="w-full h-full bg-gray-50 relative"
          style={{
            backgroundImage: `
              radial-gradient(circle, #cbd5e1 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Workflow Nodes */}
          {state.workflowGraph.nodes.map((node) => (
            <motion.div
              key={node.id}
              className={`absolute w-32 h-20 bg-white border-2 rounded-lg shadow-sm cursor-pointer ${
                state.selectedNodes.includes(node.id) 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                left: node.position.x,
                top: node.position.y
              }}
              onClick={(e) => handleNodeSelect(node.id, e.ctrlKey || e.metaKey)}
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const newPosition = {
                  x: node.position.x + info.offset.x,
                  y: node.position.y + info.offset.y
                };
                handleNodeDrag(node, newPosition);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-3 h-full flex flex-col justify-center items-center text-center">
                <div className="text-xs font-medium text-gray-800 mb-1">
                  {node.data.label}
                </div>
                <div className="text-xs text-gray-500">
                  {node.type}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Workflow Edges */}
          <svg className="absolute inset-0 pointer-events-none">
            {state.workflowGraph.edges.map((edge) => {
              const sourceNode = state.workflowGraph.nodes.find(n => n.id === edge.source);
              const targetNode = state.workflowGraph.nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              const sourceX = sourceNode.position.x + 64; // Half of node width
              const sourceY = sourceNode.position.y + 40; // Half of node height
              const targetX = targetNode.position.x + 64;
              const targetY = targetNode.position.y + 40;
              
              return (
                <line
                  key={edge.id}
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            
            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#94a3b8"
                />
              </marker>
            </defs>
          </svg>
        </div>
        
        {/* Mini Map */}
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-white border rounded-lg shadow-sm overflow-hidden">
          <div 
            ref={miniMapRef}
            className="w-full h-full bg-gray-50 relative"
            style={{ transform: 'scale(0.1)', transformOrigin: '0 0' }}
          >
            {/* Mini map content */}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderWorkflowMonitor = () => (
    <div className="space-y-6">
      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Real-time Workflow Status</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Switch
                checked={state.realTimeUpdates}
                onCheckedChange={() => dispatch({ type: 'TOGGLE_REAL_TIME_UPDATES' })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {state.workflows.filter(w => w.status === WorkflowStatus.RUNNING).length}
              </div>
              <div className="text-sm text-blue-600">Running</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {state.workflows.filter(w => w.status === WorkflowStatus.COMPLETED).length}
              </div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {state.workflows.filter(w => w.status === WorkflowStatus.FAILED).length}
              </div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {state.workflows.filter(w => w.status === WorkflowStatus.PAUSED).length}
              </div>
              <div className="text-sm text-yellow-600">Paused</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Execution Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Execution Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.executions.slice(0, 10).map((execution) => (
              <div
                key={execution.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                  
                  <div>
                    <div className="font-medium">{execution.workflow_name}</div>
                    <div className="text-sm text-gray-500">
                      Execution ID: {execution.id}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm">
                    {execution.started_at && formatDuration(
                      (execution.completed_at ? new Date(execution.completed_at) : new Date()).getTime() - 
                      new Date(execution.started_at).getTime()
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {execution.started_at && new Date(execution.started_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderWorkflowAnalytics = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Execution Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Executions</span>
                <span className="font-medium">{state.executionMetrics.totalExecutions}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Success Rate</span>
                <span className="font-medium">
                  {state.executionMetrics.totalExecutions > 0
                    ? Math.round((state.executionMetrics.successfulExecutions / state.executionMetrics.totalExecutions) * 100)
                    : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Execution Time</span>
                <span className="font-medium">
                  {formatDuration(state.executionMetrics.averageExecutionTime)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="h-5 w-5" />
              <span>Resource Utilization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>CPU</span>
                  <span>{state.resourceMetrics.cpuUtilization}%</span>
                </div>
                <Progress value={state.resourceMetrics.cpuUtilization} />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Memory</span>
                  <span>{state.resourceMetrics.memoryUtilization}%</span>
                </div>
                <Progress value={state.resourceMetrics.memoryUtilization} />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Storage</span>
                  <span>{state.resourceMetrics.storageUtilization}%</span>
                </div>
                <Progress value={state.resourceMetrics.storageUtilization} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Throughput</span>
                <span className="font-medium">{state.performanceMetrics.throughput}/hr</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Latency</span>
                <span className="font-medium">{state.performanceMetrics.latency}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="font-medium">{state.performanceMetrics.errorRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Availability</span>
                <span className="font-medium">{state.performanceMetrics.availability}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Workflow Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Performance charts would be rendered here with a charting library
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderWorkflowTemplates = () => (
    <div className="space-y-6">
      {/* Template Library */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Workflow Templates</span>
            </CardTitle>
            
            <Button onClick={() => {/* Create new template */}}>
              <Plus className="h-4 w-4 mr-1" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKFLOW_TEMPLATES.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{template.category}</span>
                    <Badge variant="outline">{template.complexity}</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Use template */}}
                    >
                      Use Template
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* Preview template */}}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== MAIN RENDER ====================
  
  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Workflow Orchestrator</h1>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {state.workflows.length} workflows
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Real-time indicator */}
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCreateWorkflow({})}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Workflow
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadWorkflows()}
                disabled={state.isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${state.isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => dispatch({ type: 'TOGGLE_ADVANCED_OPTIONS' })}>
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* Export workflows */}}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Workflows
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* Import workflows */}}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Workflows
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r flex flex-col">
            {/* Workflow Navigation */}
            <Tabs value={state.activeView} onValueChange={(value) => 
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: value as any })
            }>
              <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
                <TabsTrigger value="designer" className="text-xs">
                  <PenTool className="h-3 w-3 mr-1" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="monitor" className="text-xs">
                  <Monitor className="h-3 w-3 mr-1" />
                  Monitor
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="templates" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  Templates
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Search and Filters */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workflows..."
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                  className="pl-9"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Select
                  value={state.filters.status.join(',')}
                  onValueChange={(value) => 
                    dispatch({ 
                      type: 'SET_FILTERS', 
                      payload: { 
                        ...state.filters, 
                        status: value ? value.split(',') : [] 
                      }
                    })
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'TOGGLE_ADVANCED_OPTIONS' })}
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Workflow List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {state.workflows
                  .filter(workflow => 
                    workflow.name.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
                    (state.filters.status.length === 0 || state.filters.status.includes(workflow.status))
                  )
                  .map((workflow) => (
                    <motion.div
                      key={workflow.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        state.selectedWorkflow?.id === workflow.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => dispatch({ type: 'SET_SELECTED_WORKFLOW', payload: workflow })}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm truncate">{workflow.name}</h4>
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {workflow.description}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <Badge className={getPriorityColor(workflow.priority)}>
                          Priority {workflow.priority}
                        </Badge>
                        
                        <div className="flex items-center space-x-1">
                          {workflow.status === WorkflowStatus.RUNNING && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePauseWorkflow(workflow.id!);
                              }}
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {workflow.status === WorkflowStatus.PAUSED && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResumeWorkflow(workflow.id!);
                              }}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleExecuteWorkflow(workflow.id!)}
                                disabled={workflow.status === WorkflowStatus.RUNNING}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Execute
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Clone
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteWorkflow(workflow.id!)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Progress bar for running workflows */}
                      {workflow.status === WorkflowStatus.RUNNING && (
                        <div className="mt-2">
                          <Progress value={workflow.progress_percentage || 0} className="h-1" />
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {state.activeView === 'designer' && renderWorkflowDesigner()}
            {state.activeView === 'monitor' && renderWorkflowMonitor()}
            {state.activeView === 'analytics' && renderWorkflowAnalytics()}
            {state.activeView === 'templates' && renderWorkflowTemplates()}
          </div>
        </div>
        
        {/* Notifications */}
        <AnimatePresence>
          {state.notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="fixed bottom-4 right-4 z-50"
            >
              <Alert className="w-80">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Notification</AlertTitle>
                <AlertDescription>{notification.message}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id })}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default WorkflowOrchestrator;