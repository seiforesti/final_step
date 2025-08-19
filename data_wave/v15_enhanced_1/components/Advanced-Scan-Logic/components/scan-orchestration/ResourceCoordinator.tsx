/**
 * 🎯 ResourceCoordinator.tsx - Advanced Resource Management & Coordination Engine
 * ==============================================================================
 * 
 * Enterprise-grade resource coordination system for intelligent allocation,
 * monitoring, and optimization of computational resources across scanning
 * operations. Features predictive scaling, conflict resolution, and automated
 * load balancing with real-time performance optimization.
 * 
 * Features:
 * - Intelligent resource allocation and scheduling
 * - Real-time resource monitoring and optimization
 * - Predictive capacity planning and auto-scaling
 * - Resource conflict detection and resolution
 * - Multi-tenant resource isolation and security
 * - Performance-based resource reallocation
 * - Cost optimization and efficiency metrics
 * - Advanced analytics and reporting
 * 
 * @author Enterprise Resource Management Team
 * @version 2.0.0 - Production Ready
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Zap,
  TrendingUp,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Stop,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Minus,
  X,
  Eye,
  MoreVertical,
  BarChart3,
  LineChart,
  PieChart,
  Users,
  User,
  Building,
  Globe,
  Map,
  Route,
  Navigation,
  Layers,
  Grid,
  List,
  Maximize,
  Minimize,
  Info,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

import { useScanOrchestration } from '../../hooks/useScanOrchestration';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { useOptimization } from '../../hooks/useOptimization';
import { scanOrchestrationAPI } from '../../services/scan-orchestration-apis';
import { scanCoordinationAPI } from '../../services/scan-coordination-apis';
import { scanPerformanceAPI } from '../../services/scan-performance-apis';

import {
  ResourcePool,
  ResourceAllocation,
  ResourceMetrics,
  ResourceConstraint,
  ResourceOptimization,
  ResourceConflict,
  CapacityPlan,
  ResourcePolicy,
  AllocationStrategy,
  ResourceUsagePattern,
  PerformanceThreshold,
  CostOptimization,
  ResourceAlert,
  ResourceReservation
} from '../../types/orchestration.types';

import { 
  RESOURCE_CONFIGS,
  ALLOCATION_STRATEGIES,
  PERFORMANCE_THRESHOLDS
} from '../../constants/orchestration-configs';

import { 
  resourceAllocator,
  capacityPlanner,
  performanceOptimizer,
  costCalculator
} from '../../utils/optimization-algorithms';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const resourceVariants = {
  idle: { scale: 1, opacity: 0.8 },
  active: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  overloaded: {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    color: ['#ef4444', '#f97316', '#ef4444'],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  }
};

// Reducer for resource state management
interface ResourceState {
  pools: ResourcePool[];
  allocations: ResourceAllocation[];
  metrics: ResourceMetrics;
  conflicts: ResourceConflict[];
  alerts: ResourceAlert[];
  reservations: ResourceReservation[];
  isLoading: boolean;
  error: string | null;
}

type ResourceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_POOLS'; payload: ResourcePool[] }
  | { type: 'UPDATE_POOL'; payload: { id: string; updates: Partial<ResourcePool> } }
  | { type: 'SET_ALLOCATIONS'; payload: ResourceAllocation[] }
  | { type: 'ADD_ALLOCATION'; payload: ResourceAllocation }
  | { type: 'UPDATE_ALLOCATION'; payload: { id: string; updates: Partial<ResourceAllocation> } }
  | { type: 'REMOVE_ALLOCATION'; payload: string }
  | { type: 'SET_METRICS'; payload: ResourceMetrics }
  | { type: 'ADD_CONFLICT'; payload: ResourceConflict }
  | { type: 'RESOLVE_CONFLICT'; payload: string }
  | { type: 'ADD_ALERT'; payload: ResourceAlert }
  | { type: 'CLEAR_ALERTS'; payload: void };

const resourceReducer = (state: ResourceState, action: ResourceAction): ResourceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_POOLS':
      return { ...state, pools: action.payload };
    case 'UPDATE_POOL':
      return {
        ...state,
        pools: state.pools.map(pool =>
          pool.id === action.payload.id ? { ...pool, ...action.payload.updates } : pool
        )
      };
    case 'SET_ALLOCATIONS':
      return { ...state, allocations: action.payload };
    case 'ADD_ALLOCATION':
      return { ...state, allocations: [...state.allocations, action.payload] };
    case 'UPDATE_ALLOCATION':
      return {
        ...state,
        allocations: state.allocations.map(allocation =>
          allocation.id === action.payload.id ? { ...allocation, ...action.payload.updates } : allocation
        )
      };
    case 'REMOVE_ALLOCATION':
      return {
        ...state,
        allocations: state.allocations.filter(allocation => allocation.id !== action.payload)
      };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'ADD_CONFLICT':
      return { ...state, conflicts: [...state.conflicts, action.payload] };
    case 'RESOLVE_CONFLICT':
      return {
        ...state,
        conflicts: state.conflicts.filter(conflict => conflict.id !== action.payload)
      };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    default:
      return state;
  }
};

// Component interfaces
interface ResourceCoordinatorState {
  viewMode: 'overview' | 'pools' | 'allocations' | 'analytics' | 'optimization';
  selectedPool: ResourcePool | null;
  selectedAllocation: ResourceAllocation | null;
  filters: ResourceFilters;
  autoOptimization: boolean;
  realTimeMonitoring: boolean;
  allocationStrategy: AllocationStrategy;
  optimizationLevel: number;
}

interface ResourceFilters {
  poolTypes: string[];
  allocationTypes: string[];
  status: string[];
  priorities: string[];
  searchQuery: string;
  showConflicts: boolean;
  showAlerts: boolean;
}

interface AllocationRequest {
  name: string;
  description: string;
  resourceType: string;
  requirements: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  constraints: ResourceConstraint[];
  scheduledStart?: string;
  autoScale: boolean;
}

// Main Component
export const ResourceCoordinator: React.FC = () => {
  // State Management
  const [state, dispatch] = useReducer(resourceReducer, {
    pools: [],
    allocations: [],
    metrics: {
      totalResources: 0,
      allocatedResources: 0,
      utilizationRate: 0,
      efficiency: 0,
      costPerHour: 0,
      availableCapacity: 0,
      conflictCount: 0,
      averageResponseTime: 0
    },
    conflicts: [],
    alerts: [],
    reservations: [],
    isLoading: false,
    error: null
  });

  const [coordinatorState, setCoordinatorState] = useState<ResourceCoordinatorState>({
    viewMode: 'overview',
    selectedPool: null,
    selectedAllocation: null,
    filters: {
      poolTypes: [],
      allocationTypes: [],
      status: [],
      priorities: [],
      searchQuery: '',
      showConflicts: true,
      showAlerts: true
    },
    autoOptimization: true,
    realTimeMonitoring: true,
    allocationStrategy: 'balanced',
    optimizationLevel: 85
  });

  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [isOptimizationDialogOpen, setIsOptimizationDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newAllocationRequest, setNewAllocationRequest] = useState<AllocationRequest>({
    name: '',
    description: '',
    resourceType: '',
    requirements: { cpu: 0, memory: 0, storage: 0, network: 0 },
    priority: 'medium',
    duration: 60,
    constraints: [],
    autoScale: true
  });

  // Refs
  const optimizationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const {
    orchestrationJobs,
    resources: orchestrationResources,
    allocateResources,
    deallocateResources,
    optimizeResourceAllocation,
    loading: orchestrationLoading,
    error: orchestrationError
  } = useScanOrchestration({
    autoRefresh: coordinatorState.realTimeMonitoring,
    refreshInterval: 30000,
    onResourceChange: handleResourceChange,
    onConflictDetected: handleConflictDetected
  });

  const {
    isMonitoring,
    metrics: monitoringMetrics,
    startMonitoring,
    stopMonitoring
  } = useRealTimeMonitoring({
    onMetricsUpdate: handleMetricsUpdate,
    onAlert: handleResourceAlert
  });

  const {
    optimizationRecommendations,
    performOptimization,
    loading: optimizationLoading
  } = useOptimization({
    onOptimizationComplete: handleOptimizationComplete
  });

  // Callbacks
  const handleResourceChange = useCallback((resources: any) => {
    if (Array.isArray(resources)) {
      dispatch({ type: 'SET_POOLS', payload: resources });
    }
  }, []);

  const handleConflictDetected = useCallback((conflict: ResourceConflict) => {
    dispatch({ type: 'ADD_CONFLICT', payload: conflict });
  }, []);

  const handleMetricsUpdate = useCallback((metrics: any) => {
    dispatch({ type: 'SET_METRICS', payload: metrics });
  }, []);

  const handleResourceAlert = useCallback((alert: ResourceAlert) => {
    dispatch({ type: 'ADD_ALERT', payload: alert });
  }, []);

  const handleOptimizationComplete = useCallback((result: any) => {
    console.log('Resource optimization completed:', result);
  }, []);

  const createAllocation = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const allocation = await allocateResources({
        name: newAllocationRequest.name,
        description: newAllocationRequest.description,
        resourceType: newAllocationRequest.resourceType,
        requirements: newAllocationRequest.requirements,
        priority: newAllocationRequest.priority,
        duration: newAllocationRequest.duration,
        constraints: newAllocationRequest.constraints,
        strategy: coordinatorState.allocationStrategy,
        autoScale: newAllocationRequest.autoScale
      });

      dispatch({ type: 'ADD_ALLOCATION', payload: allocation });
      setIsAllocationDialogOpen(false);
      
      setNewAllocationRequest({
        name: '',
        description: '',
        resourceType: '',
        requirements: { cpu: 0, memory: 0, storage: 0, network: 0 },
        priority: 'medium',
        duration: 60,
        constraints: [],
        autoScale: true
      });

    } catch (error) {
      console.error('Failed to create allocation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create allocation' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [newAllocationRequest, coordinatorState.allocationStrategy, allocateResources]);

  const optimizeResources = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const optimization = await performOptimization({
        type: 'resource_allocation',
        scope: 'all_resources',
        level: coordinatorState.optimizationLevel,
        strategy: coordinatorState.allocationStrategy,
        constraints: {
          preserveActiveAllocations: true,
          minimizeConflicts: true,
          optimizeCosts: true
        }
      });

      if (optimization.resourceOptimizations) {
        for (const opt of optimization.resourceOptimizations) {
          if (opt.type === 'reallocation') {
            dispatch({
              type: 'UPDATE_ALLOCATION',
              payload: { id: opt.allocationId, updates: opt.newAllocation }
            });
          }
        }
      }

    } catch (error) {
      console.error('Failed to optimize resources:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to optimize resources' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [coordinatorState.optimizationLevel, coordinatorState.allocationStrategy, performOptimization]);

  const handleAllocationAction = useCallback(async (allocationId: string, action: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      switch (action) {
        case 'deallocate':
          await deallocateResources(allocationId);
          dispatch({ type: 'REMOVE_ALLOCATION', payload: allocationId });
          break;
        case 'scale_up':
          const allocation = state.allocations.find(a => a.id === allocationId);
          if (allocation) {
            const scaledRequirements = {
              ...allocation.requirements,
              cpu: allocation.requirements.cpu * 1.5,
              memory: allocation.requirements.memory * 1.5
            };
            dispatch({
              type: 'UPDATE_ALLOCATION',
              payload: { id: allocationId, updates: { requirements: scaledRequirements } }
            });
          }
          break;
        case 'scale_down':
          const allocationDown = state.allocations.find(a => a.id === allocationId);
          if (allocationDown) {
            const scaledRequirements = {
              ...allocationDown.requirements,
              cpu: allocationDown.requirements.cpu * 0.75,
              memory: allocationDown.requirements.memory * 0.75
            };
            dispatch({
              type: 'UPDATE_ALLOCATION',
              payload: { id: allocationId, updates: { requirements: scaledRequirements } }
            });
          }
          break;
      }

    } catch (error) {
      console.error(`Failed to ${action} allocation:`, error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to ${action} allocation` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.allocations, deallocateResources]);

  const resolveConflict = useCallback(async (conflictId: string, resolution: string) => {
    try {
      const conflict = state.conflicts.find(c => c.id === conflictId);
      if (!conflict) return;

      await scanCoordinationAPI.resolveResourceConflict(conflictId, {
        strategy: resolution,
        priority: 'high'
      });

      dispatch({ type: 'RESOLVE_CONFLICT', payload: conflictId });

    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  }, [state.conflicts]);

  // Computed Values
  const filteredPools = useMemo(() => {
    return state.pools.filter(pool => {
      if (coordinatorState.filters.poolTypes.length > 0 && 
          !coordinatorState.filters.poolTypes.includes(pool.type)) return false;
      if (coordinatorState.filters.status.length > 0 && 
          !coordinatorState.filters.status.includes(pool.status)) return false;
      if (coordinatorState.filters.searchQuery) {
        const query = coordinatorState.filters.searchQuery.toLowerCase();
        return pool.name.toLowerCase().includes(query) ||
               pool.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [state.pools, coordinatorState.filters]);

  const filteredAllocations = useMemo(() => {
    return state.allocations.filter(allocation => {
      if (coordinatorState.filters.allocationTypes.length > 0 && 
          !coordinatorState.filters.allocationTypes.includes(allocation.type)) return false;
      if (coordinatorState.filters.priorities.length > 0 && 
          !coordinatorState.filters.priorities.includes(allocation.priority)) return false;
      if (coordinatorState.filters.searchQuery) {
        const query = coordinatorState.filters.searchQuery.toLowerCase();
        return allocation.name.toLowerCase().includes(query) ||
               allocation.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [state.allocations, coordinatorState.filters]);

  const resourceUtilization = useMemo(() => {
    const totalCapacity = state.pools.reduce((acc, pool) => acc + pool.capacity.total, 0);
    const usedCapacity = state.pools.reduce((acc, pool) => acc + pool.capacity.used, 0);
    return totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  }, [state.pools]);

  const costAnalysis = useMemo(() => {
    const totalCost = state.allocations.reduce((acc, allocation) => acc + allocation.cost.hourly, 0);
    const projectedDailyCost = totalCost * 24;
    const projectedMonthlyCost = projectedDailyCost * 30;
    
    return {
      hourly: totalCost,
      daily: projectedDailyCost,
      monthly: projectedMonthlyCost,
      efficiency: state.metrics.efficiency || 0
    };
  }, [state.allocations, state.metrics.efficiency]);

  // Effects
  useEffect(() => {
    const initializeResourceCoordinator = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Load resource pools
        const pools = await scanCoordinationAPI.getResourcePools();
        dispatch({ type: 'SET_POOLS', payload: pools });

        // Load allocations
        const allocations = await scanCoordinationAPI.getResourceAllocations();
        dispatch({ type: 'SET_ALLOCATIONS', payload: allocations });

        // Load metrics
        const metrics = await scanPerformanceAPI.getResourceMetrics();
        dispatch({ type: 'SET_METRICS', payload: metrics });

        // Start monitoring if enabled
        if (coordinatorState.realTimeMonitoring && !isMonitoring) {
          await startMonitoring({
            components: ['resources', 'allocations', 'performance'],
            interval: 30000
          });
        }

      } catch (error) {
        console.error('Failed to initialize resource coordinator:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize resource coordinator' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeResourceCoordinator();
  }, []);

  useEffect(() => {
    if (coordinatorState.autoOptimization) {
      optimizationIntervalRef.current = setInterval(() => {
        optimizeResources();
      }, 300000); // Optimize every 5 minutes
    } else if (optimizationIntervalRef.current) {
      clearInterval(optimizationIntervalRef.current);
      optimizationIntervalRef.current = null;
    }

    return () => {
      if (optimizationIntervalRef.current) {
        clearInterval(optimizationIntervalRef.current);
      }
    };
  }, [coordinatorState.autoOptimization, optimizeResources]);

  // Render Helper Functions
  const renderResourceStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: 'success', icon: CheckCircle },
      allocated: { color: 'default', icon: Activity },
      overloaded: { color: 'destructive', icon: AlertTriangle },
      maintenance: { color: 'warning', icon: Settings },
      offline: { color: 'secondary', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderResourceTypeIcon = (type: string) => {
    const typeIcons = {
      cpu: Cpu,
      memory: MemoryStick,
      storage: HardDrive,
      network: Network,
      compute: Server,
      gpu: Zap
    };
    
    const Icon = typeIcons[type as keyof typeof typeIcons] || Server;
    return <Icon className="h-4 w-4" />;
  };

  const renderPoolCard = (pool: ResourcePool) => (
    <motion.div
      key={pool.id}
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className={`hover:shadow-lg transition-all duration-200 ${
        pool.utilization > 90 ? 'border-l-4 border-l-red-500' :
        pool.utilization > 70 ? 'border-l-4 border-l-orange-500' :
        'border-l-4 border-l-green-500'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                variants={resourceVariants}
                animate={
                  pool.utilization > 90 ? 'overloaded' :
                  pool.utilization > 50 ? 'active' : 'idle'
                }
              >
                {renderResourceTypeIcon(pool.type)}
              </motion.div>
              <div>
                <CardTitle className="text-sm font-medium">{pool.name}</CardTitle>
                <CardDescription className="text-xs">{pool.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderResourceStatusBadge(pool.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCoordinatorState(prev => ({ ...prev, selectedPool: pool }))}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAllocationAction(pool.id, 'scale_up')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Scale Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAllocationAction(pool.id, 'scale_down')}>
                    <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
                    Scale Down
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Utilization</span>
                <span>{Math.round(pool.utilization)}%</span>
              </div>
              <Progress 
                value={pool.utilization} 
                className={`h-2 ${
                  pool.utilization > 90 ? 'text-red-500' :
                  pool.utilization > 70 ? 'text-orange-500' :
                  'text-green-500'
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Capacity:</span>
                <span className="ml-1 font-medium">
                  {pool.capacity.used}/{pool.capacity.total}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Cost/Hour:</span>
                <span className="ml-1 font-medium">${pool.cost.hourly}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Location: {pool.location}</span>
              <span>Provider: {pool.provider}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAllocationCard = (allocation: ResourceAllocation) => (
    <motion.div
      key={allocation.id}
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-sm font-medium">{allocation.name}</CardTitle>
                <CardDescription className="text-xs">{allocation.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{allocation.priority}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCoordinatorState(prev => ({ ...prev, selectedAllocation: allocation }))}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAllocationAction(allocation.id, 'scale_up')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Scale Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAllocationAction(allocation.id, 'scale_down')}>
                    <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
                    Scale Down
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleAllocationAction(allocation.id, 'deallocate')}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Deallocate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">CPU:</span>
                <span className="ml-1 font-medium">{allocation.requirements.cpu} cores</span>
              </div>
              <div>
                <span className="text-muted-foreground">Memory:</span>
                <span className="ml-1 font-medium">{allocation.requirements.memory} GB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Storage:</span>
                <span className="ml-1 font-medium">{allocation.requirements.storage} GB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Network:</span>
                <span className="ml-1 font-medium">{allocation.requirements.network} Mbps</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Duration: {allocation.duration}min</span>
              <span>Cost: ${allocation.cost.hourly}/hr</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.metrics.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              Across all pools
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{Math.round(resourceUtilization)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across pools
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{state.metrics.efficiency}%</div>
            <p className="text-xs text-muted-foreground">
              Resource efficiency
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost/Hour</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">${costAnalysis.hourly}</div>
            <p className="text-xs text-muted-foreground">
              Current spend rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Pools Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resource Pools</CardTitle>
              <CardDescription>Current status of all resource pools</CardDescription>
            </div>
            <Button onClick={() => setIsAllocationDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Allocation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPools.map(renderPoolCard)}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Active Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Allocations</CardTitle>
          <CardDescription>{filteredAllocations.length} active resource allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {filteredAllocations.slice(0, 5).map(renderAllocationCard)}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Conflicts and Alerts */}
      {(state.conflicts.length > 0 || state.alerts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {state.conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resource Conflicts</CardTitle>
                <CardDescription>{state.conflicts.length} conflicts require resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {state.conflicts.map((conflict) => (
                    <Alert key={conflict.id} className="border-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Resource Conflict</AlertTitle>
                      <AlertDescription>
                        {conflict.description}
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" onClick={() => resolveConflict(conflict.id, 'reallocate')}>
                            Reallocate
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => resolveConflict(conflict.id, 'queue')}>
                            Queue
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {state.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resource Alerts</CardTitle>
                <CardDescription>{state.alerts.length} active alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {state.alerts.slice(0, 3).map((alert) => (
                    <Alert key={alert.id} className={`${
                      alert.severity === 'high' ? 'border-red-500' :
                      alert.severity === 'medium' ? 'border-orange-500' :
                      'border-yellow-500'
                    }`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription>
                        {alert.message}
                        <span className="block text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderPoolsView = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Pools</Label>
              <Input
                id="search"
                placeholder="Search by name, type..."
                value={coordinatorState.filters.searchQuery}
                onChange={(e) => setCoordinatorState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, searchQuery: e.target.value }
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="poolType">Pool Type</Label>
              <Select onValueChange={(value) => setCoordinatorState(prev => ({
                ...prev,
                filters: { ...prev.filters, poolTypes: [value] }
              }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="compute">Compute</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="gpu">GPU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setCoordinatorState(prev => ({
                ...prev,
                filters: { ...prev.filters, status: [value] }
              }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="overloaded">Overloaded</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="showConflicts"
                checked={coordinatorState.filters.showConflicts}
                onCheckedChange={(checked) => setCoordinatorState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, showConflicts: checked }
                }))}
              />
              <Label htmlFor="showConflicts">Show conflicts</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pools Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resource Pools</CardTitle>
              <CardDescription>{filteredPools.length} pools found</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={optimizeResources}>
                <Zap className="h-4 w-4 mr-2" />
                Optimize
              </Button>
              <Button onClick={() => setIsAllocationDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Allocation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPools.map(renderPoolCard)}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <motion.div
        className="p-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Server className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Resource Coordinator
                </h1>
                <p className="text-muted-foreground">
                  Advanced resource management and optimization engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {state.conflicts.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Button variant="destructive" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {state.conflicts.length} Conflicts
                  </Button>
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfigDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs 
            value={coordinatorState.viewMode} 
            onValueChange={(value) => setCoordinatorState(prev => ({ ...prev, viewMode: value as any }))}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="pools" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Pools
              </TabsTrigger>
              <TabsTrigger value="allocations" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Allocations
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Optimization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {renderOverviewDashboard()}
            </TabsContent>

            <TabsContent value="pools" className="mt-6">
              {renderPoolsView()}
            </TabsContent>

            <TabsContent value="allocations" className="mt-6">
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Resource Allocations</h3>
                <p className="text-muted-foreground">
                  Detailed allocation management and monitoring
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Resource Analytics</h3>
                <p className="text-muted-foreground">
                  Advanced analytics and performance insights
                </p>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="mt-6">
              <div className="text-center py-12">
                <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Resource Optimization</h3>
                <p className="text-muted-foreground">
                  AI-powered resource optimization and recommendations
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Allocation Dialog */}
        <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Resource Allocation</DialogTitle>
              <DialogDescription>
                Allocate resources for scanning operations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allocationName">Allocation Name</Label>
                  <Input
                    id="allocationName"
                    value={newAllocationRequest.name}
                    onChange={(e) => setNewAllocationRequest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter allocation name"
                  />
                </div>
                <div>
                  <Label htmlFor="resourceType">Resource Type</Label>
                  <Select 
                    value={newAllocationRequest.resourceType} 
                    onValueChange={(value) => setNewAllocationRequest(prev => ({ ...prev, resourceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compute">Compute</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="gpu">GPU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAllocationRequest.description}
                  onChange={(e) => setNewAllocationRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter allocation description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newAllocationRequest.priority} 
                    onValueChange={(value) => setNewAllocationRequest(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newAllocationRequest.duration}
                    onChange={(e) => setNewAllocationRequest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min={1}
                    max={1440}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Resource Requirements</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpu">CPU Cores</Label>
                    <Input
                      id="cpu"
                      type="number"
                      value={newAllocationRequest.requirements.cpu}
                      onChange={(e) => setNewAllocationRequest(prev => ({
                        ...prev,
                        requirements: { ...prev.requirements, cpu: parseInt(e.target.value) }
                      }))}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory">Memory (GB)</Label>
                    <Input
                      id="memory"
                      type="number"
                      value={newAllocationRequest.requirements.memory}
                      onChange={(e) => setNewAllocationRequest(prev => ({
                        ...prev,
                        requirements: { ...prev.requirements, memory: parseInt(e.target.value) }
                      }))}
                      min={0}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoScale"
                  checked={newAllocationRequest.autoScale}
                  onCheckedChange={(checked) => setNewAllocationRequest(prev => ({ ...prev, autoScale: checked }))}
                />
                <Label htmlFor="autoScale">Enable auto-scaling</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createAllocation} 
                disabled={!newAllocationRequest.name || !newAllocationRequest.resourceType || state.isLoading}
              >
                {state.isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Allocation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configuration Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Resource Coordinator Configuration</DialogTitle>
              <DialogDescription>
                Configure resource management settings and optimization parameters
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allocationStrategy">Allocation Strategy</Label>
                  <Select 
                    value={coordinatorState.allocationStrategy} 
                    onValueChange={(value) => setCoordinatorState(prev => ({ 
                      ...prev, 
                      allocationStrategy: value as AllocationStrategy 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="cost">Cost Optimized</SelectItem>
                      <SelectItem value="availability">High Availability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="optimizationLevel">Optimization Level: {coordinatorState.optimizationLevel}%</Label>
                  <Slider
                    value={[coordinatorState.optimizationLevel]}
                    onValueChange={([value]) => setCoordinatorState(prev => ({ ...prev, optimizationLevel: value }))}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoOptimization"
                    checked={coordinatorState.autoOptimization}
                    onCheckedChange={(checked) => setCoordinatorState(prev => ({ ...prev, autoOptimization: checked }))}
                  />
                  <Label htmlFor="autoOptimization">Auto-optimization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="realTimeMonitoring"
                    checked={coordinatorState.realTimeMonitoring}
                    onCheckedChange={(checked) => setCoordinatorState(prev => ({ ...prev, realTimeMonitoring: checked }))}
                  />
                  <Label htmlFor="realTimeMonitoring">Real-time monitoring</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsConfigDialogOpen(false)}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default ResourceCoordinator;