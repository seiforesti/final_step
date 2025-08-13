/**
 * ⚡ Resource Optimizer - Advanced Scan Logic
 * ==========================================
 * 
 * Enterprise-grade intelligent resource optimization system that maximizes
 * scan performance while minimizing costs through AI-powered resource allocation,
 * predictive scaling, and advanced optimization algorithms.
 * 
 * Features:
 * - AI-powered resource allocation and optimization
 * - Predictive scaling based on workload patterns
 * - Multi-dimensional resource optimization (CPU, Memory, Storage, Network)
 * - Cost optimization with intelligent budgeting
 * - Real-time resource monitoring and adjustment
 * - Advanced performance analysis and bottleneck detection
 * - Dynamic load balancing and resource distribution
 * - Enterprise compliance and resource governance
 * - Machine learning-based optimization recommendations
 * - Cross-system resource coordination
 * 
 * Architecture:
 * - Reactive optimization engine with ML models
 * - Real-time resource telemetry and analytics
 * - Advanced caching and state optimization
 * - Distributed resource management
 * - Enterprise security and audit compliance
 * 
 * @author Enterprise Data Governance Team
 * @version 2.0.0 - Production Enterprise Ready
 * @component ResourceOptimizer
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Cpu, 
  Memory, 
  HardDrive, 
  Network, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Settings,
  Layers,
  Cloud,
  CloudLightning,
  Server,
  Database,
  Monitor,
  Gauge,
  Timer,
  Battery,
  Thermometer,
  Wifi,
  Bluetooth,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Calendar,
  Bell,
  BellOff,
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
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind
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
import { ScanPerformanceAPIService } from '../../services/scan-performance-apis';
import { ScanCoordinationAPIService } from '../../services/scan-coordination-apis';
import { IntelligentScanningAPIService } from '../../services/intelligent-scanning-apis';

// Hooks
import { useOptimization } from '../../hooks/useOptimization';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';

// Types
import {
  ResourceAllocation,
  ResourcePool,
  ResourceMetrics,
  ResourceOptimizationStrategy,
  ResourceConstraints,
  ResourceRecommendation,
  ResourceUsage,
  CostOptimization,
  PerformanceMetrics,
  ScalingPolicy,
  LoadBalancingStrategy,
  OptimizationGoal,
  ResourceType,
  ResourcePriority,
  ResourceLimit,
  ResourceQuota,
  ResourceAlert,
  ResourceForecast,
  MLOptimizationModel,
  OptimizationProfile,
  ResourceTier,
  ResourceHealthStatus,
  ResourceEfficiencyMetrics
} from '../../types/orchestration.types';

// Utils
import { optimizationAlgorithms } from '../../utils/optimization-algorithms';
import { performanceCalculator } from '../../utils/performance-calculator';
import { coordinationManager } from '../../utils/coordination-manager';

// Constants
import { 
  OPTIMIZATION_STRATEGIES,
  RESOURCE_ALLOCATION_STRATEGIES,
  PERFORMANCE_THRESHOLDS,
  COST_OPTIMIZATION_TARGETS
} from '../../constants/orchestration-configs';

// Resource Optimizer state management
interface ResourceOptimizerState {
  selectedProfile: OptimizationProfile | null;
  optimizationProfiles: OptimizationProfile[];
  resourcePools: ResourcePool[];
  resourceMetrics: ResourceMetrics;
  resourceAllocations: ResourceAllocation[];
  recommendations: ResourceRecommendation[];
  alerts: ResourceAlert[];
  forecastData: ResourceForecast[];
  activeView: 'overview' | 'optimization' | 'monitoring' | 'analytics' | 'costs';
  optimizationGoal: OptimizationGoal;
  isOptimizing: boolean;
  isAutoOptimizationEnabled: boolean;
  realTimeUpdates: boolean;
  selectedTimeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  showAdvancedSettings: boolean;
  filters: {
    resourceType: ResourceType[];
    priority: ResourcePriority[];
    healthStatus: ResourceHealthStatus[];
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  searchQuery: string;
  notifications: any[];
  errors: any[];
  isLoading: boolean;
}

type ResourceOptimizerAction = 
  | { type: 'SET_SELECTED_PROFILE'; payload: OptimizationProfile | null }
  | { type: 'SET_OPTIMIZATION_PROFILES'; payload: OptimizationProfile[] }
  | { type: 'SET_RESOURCE_POOLS'; payload: ResourcePool[] }
  | { type: 'SET_RESOURCE_METRICS'; payload: ResourceMetrics }
  | { type: 'SET_RESOURCE_ALLOCATIONS'; payload: ResourceAllocation[] }
  | { type: 'SET_RECOMMENDATIONS'; payload: ResourceRecommendation[] }
  | { type: 'SET_ALERTS'; payload: ResourceAlert[] }
  | { type: 'SET_FORECAST_DATA'; payload: ResourceForecast[] }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'overview' | 'optimization' | 'monitoring' | 'analytics' | 'costs' }
  | { type: 'SET_OPTIMIZATION_GOAL'; payload: OptimizationGoal }
  | { type: 'SET_IS_OPTIMIZING'; payload: boolean }
  | { type: 'TOGGLE_AUTO_OPTIMIZATION' }
  | { type: 'TOGGLE_REAL_TIME_UPDATES' }
  | { type: 'SET_TIME_RANGE'; payload: '1h' | '6h' | '24h' | '7d' | '30d' }
  | { type: 'TOGGLE_ADVANCED_SETTINGS' }
  | { type: 'SET_FILTERS'; payload: any }
  | { type: 'SET_SORT'; payload: { field: string; direction: 'asc' | 'desc' } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'ADD_ERROR'; payload: any }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const resourceOptimizerReducer = (state: ResourceOptimizerState, action: ResourceOptimizerAction): ResourceOptimizerState => {
  switch (action.type) {
    case 'SET_SELECTED_PROFILE':
      return { ...state, selectedProfile: action.payload };
    case 'SET_OPTIMIZATION_PROFILES':
      return { ...state, optimizationProfiles: action.payload };
    case 'SET_RESOURCE_POOLS':
      return { ...state, resourcePools: action.payload };
    case 'SET_RESOURCE_METRICS':
      return { ...state, resourceMetrics: action.payload };
    case 'SET_RESOURCE_ALLOCATIONS':
      return { ...state, resourceAllocations: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_FORECAST_DATA':
      return { ...state, forecastData: action.payload };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_OPTIMIZATION_GOAL':
      return { ...state, optimizationGoal: action.payload };
    case 'SET_IS_OPTIMIZING':
      return { ...state, isOptimizing: action.payload };
    case 'TOGGLE_AUTO_OPTIMIZATION':
      return { ...state, isAutoOptimizationEnabled: !state.isAutoOptimizationEnabled };
    case 'TOGGLE_REAL_TIME_UPDATES':
      return { ...state, realTimeUpdates: !state.realTimeUpdates };
    case 'SET_TIME_RANGE':
      return { ...state, selectedTimeRange: action.payload };
    case 'TOGGLE_ADVANCED_SETTINGS':
      return { ...state, showAdvancedSettings: !state.showAdvancedSettings };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
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

const initialResourceOptimizerState: ResourceOptimizerState = {
  selectedProfile: null,
  optimizationProfiles: [],
  resourcePools: [],
  resourceMetrics: {
    cpuUtilization: 0,
    memoryUtilization: 0,
    storageUtilization: 0,
    networkUtilization: 0,
    resourceTrends: []
  },
  resourceAllocations: [],
  recommendations: [],
  alerts: [],
  forecastData: [],
  activeView: 'overview',
  optimizationGoal: OptimizationGoal.BALANCED,
  isOptimizing: false,
  isAutoOptimizationEnabled: false,
  realTimeUpdates: true,
  selectedTimeRange: '24h',
  showAdvancedSettings: false,
  filters: {
    resourceType: [],
    priority: [],
    healthStatus: []
  },
  sort: { field: 'priority', direction: 'desc' },
  searchQuery: '',
  notifications: [],
  errors: [],
  isLoading: false
};

// Main ResourceOptimizer Component
export const ResourceOptimizer: React.FC = () => {
  // State management
  const [state, dispatch] = useReducer(resourceOptimizerReducer, initialResourceOptimizerState);
  
  // Refs for monitoring and optimization
  const optimizationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // API services
  const orchestrationAPI = useMemo(() => new ScanOrchestrationAPIService(), []);
  const performanceAPI = useMemo(() => new ScanPerformanceAPIService(), []);
  const coordinationAPI = useMemo(() => new ScanCoordinationAPIService(), []);
  const intelligentScanAPI = useMemo(() => new IntelligentScanningAPIService(), []);
  
  // Hooks for advanced functionality
  const {
    optimizationStrategies,
    optimizationHistory,
    createOptimizationProfile,
    updateOptimizationProfile,
    deleteOptimizationProfile,
    applyOptimization,
    simulateOptimization,
    getOptimizationRecommendations,
    analyzeResourceUsage,
    isLoading: optimizationLoading,
    error: optimizationError
  } = useOptimization();
  
  const {
    performanceMetrics,
    bottleneckAnalysis,
    optimizePerformance,
    predictPerformance,
    analyzePerformanceTrends,
    generatePerformanceReport,
    isLoading: performanceLoading,
    error: performanceError
  } = usePerformanceOptimization();
  
  const {
    realTimeMetrics,
    resourceUtilization,
    systemHealth,
    alertSummary,
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
    initializeResourceOptimizer();
    
    return () => {
      // Cleanup
      if (optimizationIntervalRef.current) {
        clearInterval(optimizationIntervalRef.current);
      }
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
      unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // Update real-time monitoring subscription
    if (state.realTimeUpdates) {
      subscribe(['resource-metrics', 'optimization-status', 'performance-data']);
      setupMonitoring();
    } else {
      unsubscribe();
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    }
  }, [state.realTimeUpdates, subscribe, unsubscribe]);
  
  useEffect(() => {
    // Update metrics from real-time data
    if (realTimeMetrics) {
      dispatch({ type: 'SET_RESOURCE_METRICS', payload: realTimeMetrics.resources });
    }
  }, [realTimeMetrics]);
  
  useEffect(() => {
    // Setup auto-optimization if enabled
    if (state.isAutoOptimizationEnabled) {
      setupAutoOptimization();
    } else {
      if (optimizationIntervalRef.current) {
        clearInterval(optimizationIntervalRef.current);
      }
    }
  }, [state.isAutoOptimizationEnabled]);
  
  useEffect(() => {
    // Handle errors
    if (optimizationError || performanceError) {
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: optimizationError?.message || performanceError?.message,
          type: 'error'
        }
      });
    }
  }, [optimizationError, performanceError]);

  // ==================== CORE FUNCTIONS ====================
  
  const initializeResourceOptimizer = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load initial data
      await Promise.all([
        loadOptimizationProfiles(),
        loadResourcePools(),
        loadResourceMetrics(),
        loadResourceAllocations(),
        loadRecommendations(),
        loadAlerts(),
        loadForecastData()
      ]);
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: 'Resource Optimizer initialized successfully',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Failed to initialize Resource Optimizer:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to initialize Resource Optimizer',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const loadOptimizationProfiles = useCallback(async () => {
    try {
      const profiles = await optimizationAPI.getOptimizationProfiles();
      dispatch({ type: 'SET_OPTIMIZATION_PROFILES', payload: profiles });
    } catch (error) {
      console.error('Failed to load optimization profiles:', error);
      throw error;
    }
  }, []);
  
  const loadResourcePools = useCallback(async () => {
    try {
      const pools = await orchestrationAPI.getResourcePools();
      dispatch({ type: 'SET_RESOURCE_POOLS', payload: pools });
    } catch (error) {
      console.error('Failed to load resource pools:', error);
      throw error;
    }
  }, [orchestrationAPI]);
  
  const loadResourceMetrics = useCallback(async () => {
    try {
      const metrics = await performanceAPI.getResourceMetrics({
        timeRange: state.selectedTimeRange,
        includeForecasts: true
      });
      dispatch({ type: 'SET_RESOURCE_METRICS', payload: metrics });
    } catch (error) {
      console.error('Failed to load resource metrics:', error);
      throw error;
    }
  }, [performanceAPI, state.selectedTimeRange]);
  
  const loadResourceAllocations = useCallback(async () => {
    try {
      const allocations = await orchestrationAPI.getResourceAllocations({
        includeActive: true,
        includeHistory: false
      });
      dispatch({ type: 'SET_RESOURCE_ALLOCATIONS', payload: allocations });
    } catch (error) {
      console.error('Failed to load resource allocations:', error);
      throw error;
    }
  }, [orchestrationAPI]);
  
  const loadRecommendations = useCallback(async () => {
    try {
      const recommendations = await getOptimizationRecommendations({
        goal: state.optimizationGoal,
        includeAIInsights: true
      });
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      throw error;
    }
  }, [getOptimizationRecommendations, state.optimizationGoal]);
  
  const loadAlerts = useCallback(async () => {
    try {
      const alerts = await performanceAPI.getResourceAlerts({
        activeOnly: true,
        includePredictive: true
      });
      dispatch({ type: 'SET_ALERTS', payload: alerts });
    } catch (error) {
      console.error('Failed to load alerts:', error);
      throw error;
    }
  }, [performanceAPI]);
  
  const loadForecastData = useCallback(async () => {
    try {
      const forecasts = await performanceAPI.getResourceForecasts({
        timeRange: state.selectedTimeRange,
        includePredictions: true
      });
      dispatch({ type: 'SET_FORECAST_DATA', payload: forecasts });
    } catch (error) {
      console.error('Failed to load forecast data:', error);
      throw error;
    }
  }, [performanceAPI, state.selectedTimeRange]);
  
  const setupMonitoring = useCallback(() => {
    monitoringIntervalRef.current = setInterval(async () => {
      try {
        await Promise.all([
          loadResourceMetrics(),
          loadResourceAllocations(),
          loadAlerts()
        ]);
      } catch (error) {
        console.error('Failed to update monitoring data:', error);
      }
    }, 10000); // Update every 10 seconds
  }, [loadResourceMetrics, loadResourceAllocations, loadAlerts]);
  
  const setupAutoOptimization = useCallback(() => {
    optimizationIntervalRef.current = setInterval(async () => {
      try {
        // Check if optimization is needed
        const analysis = await analyzeResourceUsage();
        
        if (analysis.optimizationNeeded) {
          await handleAutoOptimization();
        }
      } catch (error) {
        console.error('Auto-optimization check failed:', error);
      }
    }, 300000); // Check every 5 minutes
  }, [analyzeResourceUsage]);

  // ==================== OPTIMIZATION FUNCTIONS ====================
  
  const handleCreateOptimizationProfile = useCallback(async (profile: Partial<OptimizationProfile>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newProfile = await createOptimizationProfile({
        name: profile.name || 'New Profile',
        description: profile.description,
        strategy: profile.strategy || ResourceOptimizationStrategy.BALANCED,
        goals: profile.goals || [OptimizationGoal.BALANCED],
        constraints: profile.constraints || {},
        ...profile
      });
      
      dispatch({ type: 'SET_SELECTED_PROFILE', payload: newProfile });
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: `Optimization profile "${newProfile.name}" created successfully`,
          type: 'success'
        }
      });
      
      await loadOptimizationProfiles();
    } catch (error) {
      console.error('Failed to create optimization profile:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to create optimization profile',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [createOptimizationProfile, loadOptimizationProfiles]);
  
  const handleApplyOptimization = useCallback(async (profileId?: string, options?: any) => {
    try {
      dispatch({ type: 'SET_IS_OPTIMIZING', payload: true });
      
      const optimization = await applyOptimization({
        profileId: profileId || state.selectedProfile?.id,
        goal: state.optimizationGoal,
        dryRun: false,
        ...options
      });
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: `Optimization applied successfully: ${optimization.id}`,
          type: 'success'
        }
      });
      
      // Refresh data to show optimization results
      await Promise.all([
        loadResourceMetrics(),
        loadResourceAllocations(),
        loadRecommendations()
      ]);
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to apply optimization',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_IS_OPTIMIZING', payload: false });
    }
  }, [applyOptimization, state.selectedProfile, state.optimizationGoal, loadResourceMetrics, loadResourceAllocations, loadRecommendations]);
  
  const handleSimulateOptimization = useCallback(async (profileId?: string) => {
    try {
      dispatch({ type: 'SET_IS_OPTIMIZING', payload: true });
      
      const simulation = await simulateOptimization({
        profileId: profileId || state.selectedProfile?.id,
        goal: state.optimizationGoal,
        timeHorizon: '24h'
      });
      
      // Show simulation results
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: `Simulation completed. Predicted savings: ${simulation.costSavings}%`,
          type: 'info'
        }
      });
      
      return simulation;
    } catch (error) {
      console.error('Failed to simulate optimization:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to simulate optimization',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_IS_OPTIMIZING', payload: false });
    }
  }, [simulateOptimization, state.selectedProfile, state.optimizationGoal]);
  
  const handleAutoOptimization = useCallback(async () => {
    try {
      // Get current system state and recommendations
      const recommendations = await getOptimizationRecommendations({
        goal: state.optimizationGoal,
        autoApprove: true
      });
      
      // Apply high-confidence recommendations automatically
      const autoApprovedRecommendations = recommendations.filter(
        rec => rec.confidence > 0.85 && rec.risk === 'low'
      );
      
      for (const recommendation of autoApprovedRecommendations) {
        await applyOptimization({
          recommendationId: recommendation.id,
          autoApproved: true
        });
      }
      
      if (autoApprovedRecommendations.length > 0) {
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { 
            message: `Auto-optimization applied ${autoApprovedRecommendations.length} recommendations`,
            type: 'info'
          }
        });
      }
    } catch (error) {
      console.error('Auto-optimization failed:', error);
    }
  }, [getOptimizationRecommendations, applyOptimization, state.optimizationGoal]);

  // ==================== UTILITY FUNCTIONS ====================
  
  const getResourceTypeIcon = useCallback((type: ResourceType) => {
    switch (type) {
      case ResourceType.CPU:
        return Cpu;
      case ResourceType.MEMORY:
        return Memory;
      case ResourceType.STORAGE:
        return HardDrive;
      case ResourceType.NETWORK:
        return Network;
      case ResourceType.GPU:
        return Zap;
      default:
        return Server;
    }
  }, []);
  
  const getHealthStatusColor = useCallback((status: ResourceHealthStatus) => {
    switch (status) {
      case ResourceHealthStatus.HEALTHY:
        return 'text-green-600 bg-green-50';
      case ResourceHealthStatus.WARNING:
        return 'text-yellow-600 bg-yellow-50';
      case ResourceHealthStatus.CRITICAL:
        return 'text-red-600 bg-red-50';
      case ResourceHealthStatus.DEGRADED:
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }, []);
  
  const formatBytes = useCallback((bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, []);
  
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);
  
  const calculateEfficiencyScore = useCallback((allocation: ResourceAllocation) => {
    const utilization = allocation.actual_usage.cpu_cores / allocation.allocated_cpu_cores;
    const memoryUtilization = allocation.actual_usage.memory_mb / allocation.allocated_memory_mb;
    const storageUtilization = allocation.actual_usage.storage_gb / allocation.allocated_storage_gb;
    
    const avgUtilization = (utilization + memoryUtilization + storageUtilization) / 3;
    
    // Efficiency is higher when utilization is closer to optimal range (70-90%)
    const optimal = avgUtilization >= 0.7 && avgUtilization <= 0.9;
    const good = avgUtilization >= 0.5 && avgUtilization < 0.95;
    
    if (optimal) return { score: 90 + (avgUtilization - 0.7) * 50, rating: 'excellent' };
    if (good) return { score: 70 + avgUtilization * 20, rating: 'good' };
    return { score: avgUtilization * 70, rating: 'poor' };
  }, []);

  // ==================== RENDER FUNCTIONS ====================
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Resource Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Utilization</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.resourceMetrics.cpuUtilization}%</div>
            <Progress value={state.resourceMetrics.cpuUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {state.resourceMetrics.cpuUtilization < 70 ? 'Optimal' : 
               state.resourceMetrics.cpuUtilization < 90 ? 'High' : 'Critical'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.resourceMetrics.memoryUtilization}%</div>
            <Progress value={state.resourceMetrics.memoryUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(state.resourceMetrics.memoryUsage?.used || 0)} / {formatBytes(state.resourceMetrics.memoryUsage?.total || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.resourceMetrics.storageUtilization}%</div>
            <Progress value={state.resourceMetrics.storageUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(state.resourceMetrics.storageUsage?.used || 0)} / {formatBytes(state.resourceMetrics.storageUsage?.total || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.resourceMetrics.networkUtilization}%</div>
            <Progress value={state.resourceMetrics.networkUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(state.resourceMetrics.networkUsage?.throughput || 0)}/s
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Alerts */}
      {state.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Active Alerts</span>
              <Badge variant="destructive">{state.alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    
                    <div>
                      <div className="font-medium text-sm">{alert.title}</div>
                      <div className="text-xs text-gray-500">{alert.description}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getHealthStatusColor(alert.severity as any)}>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Optimization Recommendations</span>
            </CardTitle>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadRecommendations()}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.recommendations.slice(0, 3).map((recommendation) => (
              <div key={recommendation.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">{recommendation.title}</div>
                  <div className="text-xs text-gray-600 mb-2">{recommendation.description}</div>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Savings: {formatCurrency(recommendation.estimatedSavings)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Performance: +{recommendation.performanceImpact}%</span>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {Math.round(recommendation.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSimulateOptimization(recommendation.profileId)}
                  >
                    Simulate
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApplyOptimization(recommendation.profileId)}
                    disabled={state.isOptimizing}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderOptimization = () => (
    <div className="space-y-6">
      {/* Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Optimization Engine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Optimization Goal */}
            <div className="space-y-2">
              <Label>Optimization Goal</Label>
              <Select
                value={state.optimizationGoal}
                onValueChange={(value) => 
                  dispatch({ type: 'SET_OPTIMIZATION_GOAL', payload: value as OptimizationGoal })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OptimizationGoal.PERFORMANCE}>Performance</SelectItem>
                  <SelectItem value={OptimizationGoal.COST}>Cost</SelectItem>
                  <SelectItem value={OptimizationGoal.BALANCED}>Balanced</SelectItem>
                  <SelectItem value={OptimizationGoal.SUSTAINABILITY}>Sustainability</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Auto-Optimization Toggle */}
            <div className="space-y-2">
              <Label>Auto-Optimization</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={state.isAutoOptimizationEnabled}
                  onCheckedChange={() => dispatch({ type: 'TOGGLE_AUTO_OPTIMIZATION' })}
                />
                <span className="text-sm text-gray-600">
                  {state.isAutoOptimizationEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            {/* Optimization Profile */}
            <div className="space-y-2">
              <Label>Optimization Profile</Label>
              <Select
                value={state.selectedProfile?.id || ''}
                onValueChange={(value) => {
                  const profile = state.optimizationProfiles.find(p => p.id === value);
                  dispatch({ type: 'SET_SELECTED_PROFILE', payload: profile || null });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select profile..." />
                </SelectTrigger>
                <SelectContent>
                  {state.optimizationProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => handleSimulateOptimization()}
              disabled={state.isOptimizing || !state.selectedProfile}
            >
              <Eye className="h-4 w-4 mr-1" />
              Simulate
            </Button>
            
            <Button
              variant="default"
              onClick={() => handleApplyOptimization()}
              disabled={state.isOptimizing || !state.selectedProfile}
            >
              <Play className="h-4 w-4 mr-1" />
              Apply Optimization
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleCreateOptimizationProfile({})}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Profile
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Resource Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.resourceAllocations.map((allocation) => {
              const efficiency = calculateEfficiencyScore(allocation);
              
              return (
                <div key={allocation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{allocation.resource_pool_id}</Badge>
                      <span className="font-medium">{allocation.orchestration_job_id}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={efficiency.rating === 'excellent' ? 'bg-green-100 text-green-800' :
                                      efficiency.rating === 'good' ? 'bg-blue-100 text-blue-800' :
                                      'bg-orange-100 text-orange-800'}>
                        {efficiency.score.toFixed(0)}% efficient
                      </Badge>
                      
                      <Badge className={getHealthStatusColor(allocation.health_status)}>
                        {allocation.health_status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">CPU</div>
                      <div className="text-sm font-medium">
                        {allocation.actual_usage.cpu_cores} / {allocation.allocated_cpu_cores} cores
                      </div>
                      <Progress 
                        value={(allocation.actual_usage.cpu_cores / allocation.allocated_cpu_cores) * 100} 
                        className="h-2 mt-1"
                      />
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Memory</div>
                      <div className="text-sm font-medium">
                        {formatBytes(allocation.actual_usage.memory_mb * 1024 * 1024)} / {formatBytes(allocation.allocated_memory_mb * 1024 * 1024)}
                      </div>
                      <Progress 
                        value={(allocation.actual_usage.memory_mb / allocation.allocated_memory_mb) * 100} 
                        className="h-2 mt-1"
                      />
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Storage</div>
                      <div className="text-sm font-medium">
                        {formatBytes(allocation.actual_usage.storage_gb * 1024 * 1024 * 1024)} / {formatBytes(allocation.allocated_storage_gb * 1024 * 1024 * 1024)}
                      </div>
                      <Progress 
                        value={(allocation.actual_usage.storage_gb / allocation.allocated_storage_gb) * 100} 
                        className="h-2 mt-1"
                      />
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Cost</div>
                      <div className="text-sm font-medium">
                        {formatCurrency(allocation.cost_estimation.estimated_hourly_cost)} /hr
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: {formatCurrency(allocation.cost_estimation.total_cost)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderMonitoring = () => (
    <div className="space-y-6">
      {/* Real-time Monitoring Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Real-time Resource Monitoring</span>
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
            {/* Live metrics display */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {state.resourcePools.length}
              </div>
              <div className="text-sm text-blue-600">Active Pools</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {state.resourceAllocations.filter(a => a.health_status === ResourceHealthStatus.HEALTHY).length}
              </div>
              <div className="text-sm text-green-600">Healthy</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">
                {state.alerts.filter(a => a.severity === 'warning').length}
              </div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">
                {state.alerts.filter(a => a.severity === 'critical').length}
              </div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resource Pool Status */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Pool Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.resourcePools.map((pool) => (
              <div key={pool.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{pool.name}</span>
                    <Badge variant="outline">{pool.location}</Badge>
                  </div>
                  
                  <Badge className={getHealthStatusColor(pool.health_status)}>
                    {pool.health_status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Capacity</div>
                    <div className="text-sm">
                      {pool.available_resources.cpu_cores} cores, {formatBytes(pool.available_resources.memory_mb * 1024 * 1024)} RAM
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Utilization</div>
                    <div className="text-sm">
                      {Math.round((pool.utilized_resources.cpu_cores / pool.available_resources.cpu_cores) * 100)}% CPU
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Cost</div>
                    <div className="text-sm">
                      {formatCurrency(pool.cost_per_hour)} /hr
                    </div>
                  </div>
                </div>
              </div>
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
                <Zap className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Resource Optimizer</h1>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {state.resourceAllocations.length} allocations
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
              
              {/* Time Range Selector */}
              <Select
                value={state.selectedTimeRange}
                onValueChange={(value) => 
                  dispatch({ type: 'SET_TIME_RANGE', payload: value as any })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1H</SelectItem>
                  <SelectItem value="6h">6H</SelectItem>
                  <SelectItem value="24h">24H</SelectItem>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyOptimization()}
                disabled={state.isOptimizing}
              >
                <Zap className={`h-4 w-4 mr-1 ${state.isOptimizing ? 'animate-spin' : ''}`} />
                Optimize
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => initializeResourceOptimizer()}
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
                  <DropdownMenuItem onClick={() => dispatch({ type: 'TOGGLE_ADVANCED_SETTINGS' })}>
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Navigation Tabs */}
          <Tabs value={state.activeView} onValueChange={(value) => 
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: value as any })
          }>
            <div className="border-b bg-white px-6">
              <TabsList className="h-12">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="optimization" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Optimization</span>
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Monitoring</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="costs" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Costs</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6 overflow-auto">
              <TabsContent value="overview" className="m-0">
                {renderOverview()}
              </TabsContent>
              
              <TabsContent value="optimization" className="m-0">
                {renderOptimization()}
              </TabsContent>
              
              <TabsContent value="monitoring" className="m-0">
                {renderMonitoring()}
              </TabsContent>
              
              <TabsContent value="analytics" className="m-0">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Advanced analytics dashboard would be rendered here
                </div>
              </TabsContent>
              
              <TabsContent value="costs" className="m-0">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Cost optimization dashboard would be rendered here
                </div>
              </TabsContent>
            </div>
          </Tabs>
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

export default ResourceOptimizer;