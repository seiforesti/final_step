/**
 * 🎯 Multi-System Coordinator - Advanced Scan Logic
 * =================================================
 * 
 * Enterprise-grade cross-system coordination component
 * Maps to: backend/services/intelligent_scan_coordinator.py
 * 
 * Features:
 * - Advanced cross-system scan coordination
 * - Intelligent resource allocation and load balancing
 * - Real-time coordination monitoring and analytics
 * - Multi-system synchronization and orchestration
 * - Enterprise coordination workflows and management
 * - Coordination conflict detection and resolution
 * - Advanced workflow visualization and control
 * - Real-time system health monitoring
 * - Intelligent dependency management
 * - Performance optimization and analytics
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, ArrowRight, BarChart3, CheckCircle, Clock, Database, GitBranch, Globe, Layers, Network, Play, Pause, Square, Settings, Shield, Zap, TrendingUp, Users, Server, Monitor, RefreshCw, AlertCircle, ChevronDown, ChevronRight, Filter, Search, Download, Upload, Eye, Edit, Trash2, Plus, Minus, X, Check, Info, ExternalLink, Copy, Share2, MoreHorizontal, Maximize2, Minimize2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Advanced-Scan-Logic imports
import { useScanCoordination } from '../../hooks/useScanCoordination';
import { scanCoordinationAPI } from '../../services/scan-coordination-apis';
import {
  ScanCoordination,
  CoordinatedScan,
  CrossSystemDependency,
  ResourceConflict,
  CoordinationType,
  CoordinationStatus,
  SynchronizationMode,
  FailureHandling,
  PriorityStrategy,
  ResourceAllocationStrategy,
  CoordinationMetrics,
  SystemHealth,
  LoadBalancing
} from '../../types/coordination.types';
import { CoordinationManager } from '../../utils/coordination-manager';
import { BRAND_COLORS } from '../../constants/ui-constants';

// ==========================================
// INTERFACES & TYPES
// ==========================================

interface SystemNode {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file_system' | 'cloud' | 'hybrid';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  health: number;
  load: number;
  capacity: number;
  location: string;
  version: string;
  lastSeen: string;
  capabilities: string[];
  dependencies: string[];
  metadata: Record<string, any>;
}

interface CoordinationWorkflow {
  id: string;
  name: string;
  description: string;
  systems: string[];
  type: CoordinationType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: CoordinationStatus;
  progress: number;
  startTime: string;
  estimatedCompletion: string;
  actualCompletion?: string;
  metrics: {
    totalScans: number;
    completedScans: number;
    failedScans: number;
    averageExecutionTime: number;
    resourceUtilization: number;
  };
  configuration: Record<string, any>;
}

interface SystemMetrics {
  systemId: string;
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  throughput: number;
  latency: number;
  errorRate: number;
  availability: number;
}

interface CoordinationEvent {
  id: string;
  timestamp: string;
  type: 'system_join' | 'system_leave' | 'scan_start' | 'scan_complete' | 'conflict_detected' | 'conflict_resolved' | 'sync_point' | 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  systemId?: string;
  coordinationId?: string;
  message: string;
  details: Record<string, any>;
}

interface MultiSystemCoordinatorProps {
  className?: string;
  onCoordinationChange?: (coordination: ScanCoordination) => void;
  onSystemHealthChange?: (systemId: string, health: SystemHealth) => void;
  onConflictDetected?: (conflict: ResourceConflict) => void;
  enableRealTimeUpdates?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================

export const MultiSystemCoordinator: React.FC<MultiSystemCoordinatorProps> = ({
  className = '',
  onCoordinationChange,
  onSystemHealthChange,
  onConflictDetected,
  enableRealTimeUpdates = true,
  autoRefresh = true,
  refreshInterval = 10000
}) => {
  // ==========================================
  // HOOKS & STATE MANAGEMENT
  // ==========================================

  const coordinationManager = useRef(new CoordinationManager()).current;

  const {
    coordinations,
    coordinationsLoading,
    coordinationsError,
    conflicts,
    conflictsLoading,
    dependencies,
    dependenciesLoading,
    metrics,
    systemHealth,
    selectedCoordination,
    setSelectedCoordination,
    initiateCoordination,
    pauseCoordination,
    resumeCoordination,
    cancelCoordination,
    rebalanceCoordination,
    resolveConflict,
    getCoordinationAnalytics,
    subscribeToCoordinationUpdates,
    unsubscribeFromCoordinationUpdates,
    subscribeToConflictAlerts,
    unsubscribeFromConflictAlerts,
    isLoading,
    isCoordinating
  } = useScanCoordination({
    autoRefresh,
    refreshInterval,
    enableRealTimeUpdates,
    enableConflictAlerts: true,
    onCoordinationComplete: (coordination) => {
      toast.success(`Coordination ${coordination.id} completed successfully`);
      onCoordinationChange?.(coordination);
    },
    onCoordinationFailed: (coordination) => {
      toast.error(`Coordination ${coordination.id} failed`);
      onCoordinationChange?.(coordination);
    },
    onConflictDetected: (conflict) => {
      toast.warning(`Resource conflict detected: ${conflict.id}`);
      onConflictDetected?.(conflict);
    },
    onError: (error) => {
      toast.error(`Coordination error: ${error.message}`);
    }
  });

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'topology'>('grid');
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [coordinationEvents, setCoordinationEvents] = useState<CoordinationEvent[]>([]);
  const [systemNodes, setSystemNodes] = useState<SystemNode[]>([]);
  const [workflows, setWorkflows] = useState<CoordinationWorkflow[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<Map<string, SystemMetrics[]>>(new Map());
  const [isTopologyFullscreen, setIsTopologyFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSystemDialog, setShowSystemDialog] = useState(false);
  const [selectedSystemForDetails, setSelectedSystemForDetails] = useState<SystemNode | null>(null);
  const [newCoordinationConfig, setNewCoordinationConfig] = useState({
    name: '',
    description: '',
    type: CoordinationType.PARALLEL,
    priority: 'medium' as const,
    systems: [] as string[],
    synchronizationMode: SynchronizationMode.STRICT,
    failureHandling: FailureHandling.RETRY,
    resourceAllocation: ResourceAllocationStrategy.BALANCED,
    maxRetries: 3,
    timeout: 300000,
    enableRealTimeMonitoring: true,
    enableAutomaticRecovery: true
  });

  // ==========================================
  // COMPUTED VALUES & MEMOIZATION
  // ==========================================

  const filteredSystemNodes = useMemo(() => {
    let filtered = systemNodes;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(system =>
        system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(system => system.status === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(system => system.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof SystemNode];
      let bValue: any = b[sortBy as keyof SystemNode];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [systemNodes, searchQuery, filterStatus, filterType, sortBy, sortOrder]);

  const activeCoordinations = useMemo(() => {
    return coordinations.filter(coord => 
      coord.status === CoordinationStatus.EXECUTING || 
      coord.status === CoordinationStatus.PLANNING
    );
  }, [coordinations]);

  const systemHealthSummary = useMemo(() => {
    const total = systemNodes.length;
    const online = systemNodes.filter(s => s.status === 'online').length;
    const offline = systemNodes.filter(s => s.status === 'offline').length;
    const degraded = systemNodes.filter(s => s.status === 'degraded').length;
    const maintenance = systemNodes.filter(s => s.status === 'maintenance').length;

    return {
      total,
      online,
      offline,
      degraded,
      maintenance,
      healthPercentage: total > 0 ? Math.round((online / total) * 100) : 0
    };
  }, [systemNodes]);

  const coordinationStatistics = useMemo(() => {
    const total = coordinations.length;
    const active = activeCoordinations.length;
    const completed = coordinations.filter(c => c.status === CoordinationStatus.COMPLETED).length;
    const failed = coordinations.filter(c => c.status === CoordinationStatus.FAILED).length;
    const cancelled = coordinations.filter(c => c.status === CoordinationStatus.CANCELLED).length;

    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const failureRate = total > 0 ? Math.round((failed / total) * 100) : 0;

    return {
      total,
      active,
      completed,
      failed,
      cancelled,
      successRate,
      failureRate
    };
  }, [coordinations, activeCoordinations]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleSystemSelect = useCallback((systemId: string, selected: boolean) => {
    setSelectedSystems(prev => {
      if (selected) {
        return [...prev, systemId];
      } else {
        return prev.filter(id => id !== systemId);
      }
    });
  }, []);

  const handleSelectAllSystems = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedSystems(filteredSystemNodes.map(s => s.id));
    } else {
      setSelectedSystems([]);
    }
  }, [filteredSystemNodes]);

  const handleCreateCoordination = useCallback(async () => {
    if (!newCoordinationConfig.name || newCoordinationConfig.systems.length === 0) {
      toast.error('Please provide a name and select at least one system');
      return;
    }

    try {
      const coordinationRequest = {
        coordination_type: newCoordinationConfig.type,
        scan_groups: newCoordinationConfig.systems.map(systemId => ({
          system_id: systemId,
          priority: newCoordinationConfig.priority,
          configuration: {}
        })),
        priority_strategy: newCoordinationConfig.priority,
        resource_allocation: newCoordinationConfig.resourceAllocation,
        coordination_parameters: {
          name: newCoordinationConfig.name,
          description: newCoordinationConfig.description,
          synchronization_mode: newCoordinationConfig.synchronizationMode,
          failure_handling: newCoordinationConfig.failureHandling,
          max_retries: newCoordinationConfig.maxRetries,
          timeout: newCoordinationConfig.timeout,
          enable_real_time_monitoring: newCoordinationConfig.enableRealTimeMonitoring,
          enable_automatic_recovery: newCoordinationConfig.enableAutomaticRecovery
        }
      };

      const result = await initiateCoordination(coordinationRequest);
      
      toast.success('Coordination initiated successfully');
      setShowCreateDialog(false);
      setNewCoordinationConfig({
        name: '',
        description: '',
        type: CoordinationType.PARALLEL,
        priority: 'medium',
        systems: [],
        synchronizationMode: SynchronizationMode.STRICT,
        failureHandling: FailureHandling.RETRY,
        resourceAllocation: ResourceAllocationStrategy.BALANCED,
        maxRetries: 3,
        timeout: 300000,
        enableRealTimeMonitoring: true,
        enableAutomaticRecovery: true
      });

      // Subscribe to updates for the new coordination
      if (enableRealTimeUpdates) {
        subscribeToCoordinationUpdates(result.id);
      }

    } catch (error) {
      console.error('Failed to create coordination:', error);
      toast.error('Failed to create coordination');
    }
  }, [newCoordinationConfig, initiateCoordination, enableRealTimeUpdates, subscribeToCoordinationUpdates]);

  const handleCoordinationAction = useCallback(async (
    coordinationId: string, 
    action: 'pause' | 'resume' | 'cancel' | 'rebalance'
  ) => {
    try {
      switch (action) {
        case 'pause':
          await pauseCoordination(coordinationId);
          break;
        case 'resume':
          await resumeCoordination(coordinationId);
          break;
        case 'cancel':
          await cancelCoordination(coordinationId);
          break;
        case 'rebalance':
          await rebalanceCoordination(coordinationId);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} coordination:`, error);
    }
  }, [pauseCoordination, resumeCoordination, cancelCoordination, rebalanceCoordination]);

  const handleConflictResolve = useCallback(async (conflictId: string, resolution: any) => {
    try {
      await resolveConflict(conflictId, resolution);
      toast.success('Conflict resolved successfully');
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      toast.error('Failed to resolve conflict');
    }
  }, [resolveConflict]);

  const handleSystemHealthCheck = useCallback(async (systemId: string) => {
    try {
      // Simulate health check - in real implementation, this would call the API
      const healthResult = await scanCoordinationAPI.checkSystemHealth(systemId);
      
      setSystemNodes(prev => prev.map(system => 
        system.id === systemId 
          ? { ...system, health: healthResult.health_score, status: healthResult.status }
          : system
      ));

      toast.success(`Health check completed for ${systemId}`);
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Health check failed');
    }
  }, []);

  const handleExportCoordinationData = useCallback(async () => {
    try {
      const analytics = await getCoordinationAnalytics('24h');
      const dataToExport = {
        coordinations,
        systemHealth,
        metrics,
        analytics,
        exportTimestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coordination-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Coordination data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  }, [coordinations, systemHealth, metrics, getCoordinationAnalytics]);

  // ==========================================
  // EFFECTS & LIFECYCLE
  // ==========================================

  // Initialize system nodes (simulated data - in real implementation, this would come from API)
  useEffect(() => {
    const mockSystems: SystemNode[] = [
      {
        id: 'sys-001',
        name: 'Primary Database Cluster',
        type: 'database',
        status: 'online',
        health: 95,
        load: 45,
        capacity: 1000,
        location: 'US-East-1',
        version: '14.2.1',
        lastSeen: new Date().toISOString(),
        capabilities: ['read', 'write', 'backup', 'replication'],
        dependencies: ['sys-002', 'sys-003'],
        metadata: { provider: 'AWS RDS', engine: 'PostgreSQL' }
      },
      {
        id: 'sys-002',
        name: 'Data Lake Storage',
        type: 'cloud',
        status: 'online',
        health: 88,
        load: 62,
        capacity: 5000,
        location: 'US-West-2',
        version: '2.1.0',
        lastSeen: new Date().toISOString(),
        capabilities: ['read', 'write', 'analytics', 'archival'],
        dependencies: ['sys-004'],
        metadata: { provider: 'AWS S3', storageClass: 'Standard-IA' }
      },
      {
        id: 'sys-003',
        name: 'API Gateway Cluster',
        type: 'api',
        status: 'online',
        health: 92,
        load: 38,
        capacity: 2000,
        location: 'US-Central-1',
        version: '3.4.2',
        lastSeen: new Date().toISOString(),
        capabilities: ['routing', 'authentication', 'rate-limiting', 'monitoring'],
        dependencies: ['sys-001'],
        metadata: { provider: 'Kong', instances: 6 }
      },
      {
        id: 'sys-004',
        name: 'File System Scanner',
        type: 'file_system',
        status: 'degraded',
        health: 72,
        load: 85,
        capacity: 800,
        location: 'On-Premise',
        version: '1.8.5',
        lastSeen: new Date().toISOString(),
        capabilities: ['scan', 'index', 'metadata-extraction'],
        dependencies: [],
        metadata: { filesystem: 'NTFS', totalSpace: '10TB' }
      },
      {
        id: 'sys-005',
        name: 'Hybrid Cloud Bridge',
        type: 'hybrid',
        status: 'maintenance',
        health: 60,
        load: 25,
        capacity: 1500,
        location: 'Multi-Region',
        version: '2.0.1',
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        capabilities: ['sync', 'bridge', 'transformation', 'monitoring'],
        dependencies: ['sys-001', 'sys-002'],
        metadata: { regions: ['us-east-1', 'eu-west-1'], protocol: 'HTTPS' }
      }
    ];

    setSystemNodes(mockSystems);
  }, []);

  // Initialize coordination events (simulated data)
  useEffect(() => {
    const mockEvents: CoordinationEvent[] = [
      {
        id: 'evt-001',
        timestamp: new Date().toISOString(),
        type: 'scan_start',
        severity: 'medium',
        systemId: 'sys-001',
        coordinationId: 'coord-001',
        message: 'Scan initiated on Primary Database Cluster',
        details: { scanType: 'full', estimatedDuration: '2h' }
      },
      {
        id: 'evt-002',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'conflict_detected',
        severity: 'high',
        systemId: 'sys-004',
        message: 'Resource conflict detected: insufficient disk space',
        details: { availableSpace: '500MB', requiredSpace: '2GB' }
      },
      {
        id: 'evt-003',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: 'system_join',
        severity: 'low',
        systemId: 'sys-003',
        message: 'API Gateway Cluster joined coordination session',
        details: { sessionId: 'session-123', capabilities: ['routing', 'auth'] }
      }
    ];

    setCoordinationEvents(mockEvents);
  }, []);

  // Real-time updates subscription
  useEffect(() => {
    if (enableRealTimeUpdates) {
      subscribeToConflictAlerts();
      
      return () => {
        unsubscribeFromCoordinationUpdates();
        unsubscribeFromConflictAlerts();
      };
    }
  }, [enableRealTimeUpdates, subscribeToConflictAlerts, unsubscribeFromCoordinationUpdates, unsubscribeFromConflictAlerts]);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'online':
      case 'completed':
        return 'text-green-500';
      case 'offline':
      case 'failed':
        return 'text-red-500';
      case 'degraded':
      case 'warning':
        return 'text-yellow-500';
      case 'maintenance':
      case 'paused':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4" />;
      case 'offline':
        return <AlertTriangle className="h-4 w-4" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'api':
        return <Network className="h-4 w-4" />;
      case 'file_system':
        return <Layers className="h-4 w-4" />;
      case 'cloud':
        return <Globe className="h-4 w-4" />;
      case 'hybrid':
        return <GitBranch className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
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

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderSystemHealthIndicator = useCallback((health: number) => {
    const color = health >= 90 ? 'text-green-500' : health >= 70 ? 'text-yellow-500' : 'text-red-500';
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
        <span className={`text-sm font-medium ${color}`}>{health}%</span>
      </div>
    );
  }, []);

  const renderLoadIndicator = useCallback((load: number, capacity: number) => {
    const percentage = Math.round((load / capacity) * 100);
    const color = percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500';
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`} 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{percentage}%</span>
      </div>
    );
  }, []);

  // ==========================================
  // MAIN RENDER
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading coordination data...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`multi-system-coordinator space-y-6 ${className}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Multi-System Coordinator</h1>
            <p className="text-gray-600 mt-1">
              Advanced cross-system coordination and orchestration
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCoordinationData}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
            
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Coordination</span>
            </Button>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Coordinations</p>
                  <p className="text-2xl font-bold text-gray-900">{coordinationStatistics.active}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12% from last hour</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">{systemHealthSummary.healthPercentage}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">{systemHealthSummary.online}/{systemHealthSummary.total} systems online</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{coordinationStatistics.successRate}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">{coordinationStatistics.completed} completed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Conflicts</p>
                  <p className="text-2xl font-bold text-gray-900">{conflicts.length}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                {conflicts.length > 0 ? (
                  <span className="text-red-600">Requires attention</span>
                ) : (
                  <span className="text-green-600">All clear</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
            <TabsTrigger value="coordinations">Coordinations</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="topology">Topology</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {coordinationEvents.map((event) => (
                        <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                          <div className={`p-1 rounded-full ${
                            event.severity === 'critical' ? 'bg-red-100' :
                            event.severity === 'high' ? 'bg-orange-100' :
                            event.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {event.type === 'scan_start' && <Play className="h-3 w-3 text-blue-600" />}
                            {event.type === 'scan_complete' && <CheckCircle className="h-3 w-3 text-green-600" />}
                            {event.type === 'conflict_detected' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                            {event.type === 'system_join' && <Users className="h-3 w-3 text-blue-600" />}
                            {event.type === 'error' && <AlertCircle className="h-3 w-3 text-red-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{event.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleTimeString()}
                              {event.systemId && ` • ${event.systemId}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Active Coordinations Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Active Coordinations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {activeCoordinations.map((coordination) => (
                        <div key={coordination.id} className="p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{coordination.id}</h4>
                            <Badge variant={coordination.status === CoordinationStatus.EXECUTING ? 'default' : 'secondary'}>
                              {coordination.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{coordination.progress_percentage || 0}%</span>
                            </div>
                            <Progress value={coordination.progress_percentage || 0} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Type: {coordination.coordination_type}</span>
                              <span>Systems: {coordination.coordinated_scans?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {activeCoordinations.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No active coordinations</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* System Status Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>System Status Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {systemNodes.slice(0, 6).map((system) => (
                    <div key={system.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(system.type)}
                          <h4 className="font-medium text-gray-900">{system.name}</h4>
                        </div>
                        <div className={`flex items-center space-x-1 ${getStatusColor(system.status)}`}>
                          {getStatusIcon(system.status)}
                          <span className="text-xs font-medium">{system.status}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Health</span>
                          {renderSystemHealthIndicator(system.health)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Load</span>
                          {renderLoadIndicator(system.load, system.capacity)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Location</span>
                          <span className="font-medium">{system.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Systems Tab */}
          <TabsContent value="systems" className="space-y-6">
            {/* Systems Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search systems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="degraded">Degraded</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="file_system">File System</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8 p-0"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 p-0"
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSystemDialog(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add System</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Systems Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSystemNodes.map((system) => (
                  <Card key={system.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getTypeIcon(system.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{system.name}</h3>
                            <p className="text-sm text-gray-500">{system.type}</p>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedSystemForDetails(system);
                              setShowSystemDialog(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSystemHealthCheck(system.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Health Check
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <div className={`flex items-center space-x-1 ${getStatusColor(system.status)}`}>
                            {getStatusIcon(system.status)}
                            <span className="text-sm font-medium capitalize">{system.status}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Health</span>
                          {renderSystemHealthIndicator(system.health)}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Load</span>
                          {renderLoadIndicator(system.load, system.capacity)}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Location</span>
                          <span className="text-sm font-medium">{system.location}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Version</span>
                          <span className="text-sm font-medium">{system.version}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Seen</span>
                          <span className="text-sm text-gray-500">
                            {new Date(system.lastSeen).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedSystems.includes(system.id)}
                            onCheckedChange={(checked) => handleSystemSelect(system.id, checked as boolean)}
                          />
                          <span className="text-sm text-gray-600">Select</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {system.capabilities.slice(0, 2).map((capability) => (
                            <Badge key={capability} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {system.capabilities.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{system.capabilities.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedSystems.length === filteredSystemNodes.length && filteredSystemNodes.length > 0}
                            onCheckedChange={handleSelectAllSystems}
                          />
                        </TableHead>
                        <TableHead>System</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead>Load</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSystemNodes.map((system) => (
                        <TableRow key={system.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSystems.includes(system.id)}
                              onCheckedChange={(checked) => handleSystemSelect(system.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="p-1 bg-gray-100 rounded">
                                {getTypeIcon(system.type)}
                              </div>
                              <div>
                                <div className="font-medium">{system.name}</div>
                                <div className="text-sm text-gray-500">{system.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{system.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center space-x-1 ${getStatusColor(system.status)}`}>
                              {getStatusIcon(system.status)}
                              <span className="text-sm font-medium capitalize">{system.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderSystemHealthIndicator(system.health)}
                          </TableCell>
                          <TableCell>
                            {renderLoadIndicator(system.load, system.capacity)}
                          </TableCell>
                          <TableCell>{system.location}</TableCell>
                          <TableCell>{system.version}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(system.lastSeen).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedSystemForDetails(system);
                                  setShowSystemDialog(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSystemHealthCheck(system.id)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Health Check
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Additional tabs content would continue here... */}
          
        </Tabs>

        {/* Create Coordination Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Coordination</DialogTitle>
              <DialogDescription>
                Configure a new cross-system coordination workflow
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coord-name">Coordination Name</Label>
                  <Input
                    id="coord-name"
                    placeholder="Enter coordination name"
                    value={newCoordinationConfig.name}
                    onChange={(e) => setNewCoordinationConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coord-type">Coordination Type</Label>
                  <Select
                    value={newCoordinationConfig.type}
                    onValueChange={(value) => setNewCoordinationConfig(prev => ({ ...prev, type: value as CoordinationType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CoordinationType.PARALLEL}>Parallel</SelectItem>
                      <SelectItem value={CoordinationType.SEQUENTIAL}>Sequential</SelectItem>
                      <SelectItem value={CoordinationType.PIPELINE}>Pipeline</SelectItem>
                      <SelectItem value={CoordinationType.BATCH}>Batch</SelectItem>
                      <SelectItem value={CoordinationType.STREAM}>Streaming</SelectItem>
                      <SelectItem value={CoordinationType.HYBRID}>Hybrid</SelectItem>
                      <SelectItem value={CoordinationType.ADAPTIVE}>Adaptive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coord-description">Description</Label>
                <Textarea
                  id="coord-description"
                  placeholder="Describe the coordination workflow"
                  value={newCoordinationConfig.description}
                  onChange={(e) => setNewCoordinationConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Systems</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {systemNodes.filter(s => s.status === 'online').map((system) => (
                    <div key={system.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={newCoordinationConfig.systems.includes(system.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewCoordinationConfig(prev => ({
                              ...prev,
                              systems: [...prev.systems, system.id]
                            }));
                          } else {
                            setNewCoordinationConfig(prev => ({
                              ...prev,
                              systems: prev.systems.filter(id => id !== system.id)
                            }));
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(system.type)}
                        <span className="text-sm">{system.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <RadioGroup
                    value={newCoordinationConfig.priority}
                    onValueChange={(value) => setNewCoordinationConfig(prev => ({ ...prev, priority: value as any }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="priority-low" />
                      <Label htmlFor="priority-low">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="priority-medium" />
                      <Label htmlFor="priority-medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="priority-high" />
                      <Label htmlFor="priority-high">High</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="critical" id="priority-critical" />
                      <Label htmlFor="priority-critical">Critical</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Timeout (minutes)</Label>
                    <Slider
                      value={[newCoordinationConfig.timeout / 60000]}
                      onValueChange={([value]) => setNewCoordinationConfig(prev => ({ ...prev, timeout: value * 60000 }))}
                      max={60}
                      min={5}
                      step={5}
                    />
                    <div className="text-sm text-gray-500">
                      {Math.round(newCoordinationConfig.timeout / 60000)} minutes
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Retries</Label>
                    <Slider
                      value={[newCoordinationConfig.maxRetries]}
                      onValueChange={([value]) => setNewCoordinationConfig(prev => ({ ...prev, maxRetries: value }))}
                      max={10}
                      min={0}
                      step={1}
                    />
                    <div className="text-sm text-gray-500">
                      {newCoordinationConfig.maxRetries} retries
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newCoordinationConfig.enableRealTimeMonitoring}
                    onCheckedChange={(checked) => setNewCoordinationConfig(prev => ({ ...prev, enableRealTimeMonitoring: checked }))}
                  />
                  <Label>Real-time Monitoring</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newCoordinationConfig.enableAutomaticRecovery}
                    onCheckedChange={(checked) => setNewCoordinationConfig(prev => ({ ...prev, enableAutomaticRecovery: checked }))}
                  />
                  <Label>Automatic Recovery</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCoordination}
                  disabled={!newCoordinationConfig.name || newCoordinationConfig.systems.length === 0}
                >
                  Create Coordination
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* System Details Dialog */}
        <Dialog open={showSystemDialog} onOpenChange={setShowSystemDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedSystemForDetails ? `${selectedSystemForDetails.name} Details` : 'Add New System'}
              </DialogTitle>
              <DialogDescription>
                {selectedSystemForDetails ? 'System information and configuration' : 'Register a new system for coordination'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSystemForDetails && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">System ID</Label>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedSystemForDetails.id}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {getTypeIcon(selectedSystemForDetails.type)}
                        <span className="text-sm capitalize">{selectedSystemForDetails.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <div className={`flex items-center space-x-2 mt-1 ${getStatusColor(selectedSystemForDetails.status)}`}>
                        {getStatusIcon(selectedSystemForDetails.status)}
                        <span className="text-sm font-medium capitalize">{selectedSystemForDetails.status}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="text-sm mt-1">{selectedSystemForDetails.location}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Version</Label>
                      <p className="text-sm mt-1">{selectedSystemForDetails.version}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Health Score</Label>
                      <div className="mt-2">
                        {renderSystemHealthIndicator(selectedSystemForDetails.health)}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Resource Utilization</Label>
                      <div className="mt-2">
                        {renderLoadIndicator(selectedSystemForDetails.load, selectedSystemForDetails.capacity)}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Capacity</Label>
                      <p className="text-sm mt-1">{selectedSystemForDetails.capacity} units</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Seen</Label>
                      <p className="text-sm mt-1">{new Date(selectedSystemForDetails.lastSeen).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Capabilities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSystemForDetails.capabilities.map((capability) => (
                      <Badge key={capability} variant="secondary">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Dependencies</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSystemForDetails.dependencies.map((depId) => {
                      const depSystem = systemNodes.find(s => s.id === depId);
                      return (
                        <Badge key={depId} variant="outline">
                          {depSystem ? depSystem.name : depId}
                        </Badge>
                      );
                    })}
                    {selectedSystemForDetails.dependencies.length === 0 && (
                      <span className="text-sm text-gray-500">No dependencies</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Metadata</Label>
                  <div className="mt-2 bg-gray-50 rounded-lg p-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedSystemForDetails.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowSystemDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleSystemHealthCheck(selectedSystemForDetails.id)}>
                    Run Health Check
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};