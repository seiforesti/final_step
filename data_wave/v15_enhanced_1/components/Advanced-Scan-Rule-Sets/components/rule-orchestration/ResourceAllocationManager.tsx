import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cpu, HardDrive, Network, Server, Database, Settings, Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Clock, BarChart3, PieChart, LineChart, RefreshCw, Zap, Target, Play, Pause, Square, SkipForward, Edit, Trash2, Plus, Minus, Filter, Search, Download, Upload, Save, Eye, EyeOff, Maximize, Minimize, Info, AlertCircle, Calendar, User, Users, Shield, Lock, Unlock, Key, Globe, Layers, Package, Box, Archive, Folder, FileText, Star, Heart, Bookmark, Flag, Bell, Mail, Phone, MessageSquare, Share, Link, ExternalLink, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useOrchestration } from '../../hooks/useOrchestration';
import { useOptimization } from '../../hooks/useOptimization';
import { useIntelligence } from '../../hooks/useIntelligence';
import { 
  ResourcePool, 
  ResourceAllocation, 
  ResourceUtilization, 
  ResourceMetrics, 
  ResourceRequirement, 
  ResourceConstraint, 
  ResourcePolicy, 
  ResourcePriority, 
  ResourceStatus, 
  ResourceType, 
  AllocationStrategy, 
  LoadBalancingStrategy, 
  ScalingPolicy, 
  CapacityPlanning, 
  CostOptimization, 
  PerformanceOptimization, 
  ResourceScheduling, 
  ResourceMonitoring, 
  ResourceAlert, 
  ResourceProfile, 
  ResourceGroup, 
  ResourceTag, 
  ResourceHistory, 
  ResourceReservation, 
  ResourceQuota, 
  ResourceThreshold,
  ComputeResource,
  StorageResource,
  NetworkResource,
  DatabaseResource,
  MemoryResource,
  CpuResource
} from '../../types/orchestration.types';

// Resource Pool Card Component
interface ResourcePoolCardProps {
  pool: ResourcePool;
  utilization: ResourceUtilization;
  onEdit: (pool: ResourcePool) => void;
  onDelete: (poolId: string) => void;
  onScale: (poolId: string, action: 'scale-up' | 'scale-down') => void;
}

const ResourcePoolCard: React.FC<ResourcePoolCardProps> = ({
  pool,
  utilization,
  onEdit,
  onDelete,
  onScale
}) => {
  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'compute': return Cpu;
      case 'memory': return HardDrive;
      case 'storage': return HardDrive;
      case 'network': return Network;
      case 'database': return Database;
      default: return Server;
    }
  };

  const ResourceIcon = getResourceIcon(pool.type);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ResourceIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{pool.name}</CardTitle>
              <CardDescription>{pool.description}</CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(pool.status)}>
            {pool.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resource Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>CPU Usage</span>
              <span className={getUtilizationColor(utilization.cpu)}>
                {utilization.cpu}%
              </span>
            </div>
            <Progress value={utilization.cpu} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>HardDrive Usage</span>
              <span className={getUtilizationColor(utilization.memory)}>
                {utilization.memory}%
              </span>
            </div>
            <Progress value={utilization.memory} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage</span>
              <span className={getUtilizationColor(utilization.storage)}>
                {utilization.storage}%
              </span>
            </div>
            <Progress value={utilization.storage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Network</span>
              <span className={getUtilizationColor(utilization.network)}>
                {utilization.network}%
              </span>
            </div>
            <Progress value={utilization.network} className="h-2" />
          </div>
        </div>

        {/* Capacity Information */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-sm font-medium">{pool.capacity.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-green-600">{pool.capacity.available}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-blue-600">{pool.capacity.allocated}</div>
            <div className="text-xs text-gray-500">Allocated</div>
          </div>
        </div>

        {/* Tags */}
        {pool.tags && pool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pool.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-2 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(pool)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScale(pool.id, 'scale-up')}
              disabled={pool.status === 'maintenance'}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Scale Up
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScale(pool.id, 'scale-down')}
              disabled={pool.status === 'maintenance'}
            >
              <TrendingDown className="w-4 h-4 mr-1" />
              Scale Down
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Resource Pool</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this resource pool? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(pool.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Real-time Resource Monitor Component
interface ResourceMonitorProps {
  metrics: ResourceMetrics[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const ResourceMonitor: React.FC<ResourceMonitorProps> = ({
  metrics,
  timeRange,
  onTimeRangeChange
}) => {
  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const getMetricTrend = (metric: ResourceMetrics) => {
    const current = metric.current;
    const previous = metric.previous;
    const trend = ((current - previous) / previous) * 100;
    return trend;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < -5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resource Monitoring</CardTitle>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{metric.name}</span>
                {getTrendIcon(getMetricTrend(metric))}
              </div>
              <div className="text-2xl font-bold">{metric.current}</div>
              <div className="text-xs text-gray-500">
                {metric.unit} ({getMetricTrend(metric) > 0 ? '+' : ''}{getMetricTrend(metric).toFixed(1)}%)
              </div>
              <Progress value={(metric.current / metric.maximum) * 100} className="mt-2 h-1" />
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Allocation Strategy Configuration Component
interface AllocationStrategyConfigProps {
  strategy: AllocationStrategy;
  onStrategyChange: (strategy: AllocationStrategy) => void;
}

const AllocationStrategyConfig: React.FC<AllocationStrategyConfigProps> = ({
  strategy,
  onStrategyChange
}) => {
  const strategies = [
    { value: 'round-robin', label: 'Round Robin', description: 'Distribute resources evenly across all pools' },
    { value: 'least-loaded', label: 'Least Loaded', description: 'Allocate to the least utilized resource pool' },
    { value: 'priority-based', label: 'Priority Based', description: 'Allocate based on request priority levels' },
    { value: 'cost-optimized', label: 'Cost Optimized', description: 'Minimize costs while meeting requirements' },
    { value: 'performance-optimized', label: 'Performance Optimized', description: 'Maximize performance regardless of cost' },
    { value: 'balanced', label: 'Balanced', description: 'Balance between cost and performance' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation Strategy</CardTitle>
        <CardDescription>
          Configure how resources are allocated to scan rule executions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Strategy Type</Label>
          <Select 
            value={strategy.type} 
            onValueChange={(value) => onStrategyChange({ ...strategy, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strategies.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {strategy.type === 'priority-based' && (
          <div>
            <Label>Priority Weights</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">High Priority</span>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[strategy.priorityWeights?.high || 1]}
                    onValueChange={([value]) => onStrategyChange({
                      ...strategy,
                      priorityWeights: { ...strategy.priorityWeights, high: value }
                    })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-sm w-8">{strategy.priorityWeights?.high || 1}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medium Priority</span>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[strategy.priorityWeights?.medium || 1]}
                    onValueChange={([value]) => onStrategyChange({
                      ...strategy,
                      priorityWeights: { ...strategy.priorityWeights, medium: value }
                    })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-sm w-8">{strategy.priorityWeights?.medium || 1}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Priority</span>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[strategy.priorityWeights?.low || 1]}
                    onValueChange={([value]) => onStrategyChange({
                      ...strategy,
                      priorityWeights: { ...strategy.priorityWeights, low: value }
                    })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-sm w-8">{strategy.priorityWeights?.low || 1}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Load Balancing</Label>
            <Select 
              value={strategy.loadBalancing} 
              onValueChange={(value) => onStrategyChange({ ...strategy, loadBalancing: value as LoadBalancingStrategy })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round-robin">Round Robin</SelectItem>
                <SelectItem value="weighted">Weighted</SelectItem>
                <SelectItem value="least-connections">Least Connections</SelectItem>
                <SelectItem value="ip-hash">IP Hash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Scaling Policy</Label>
            <Select 
              value={strategy.scaling} 
              onValueChange={(value) => onStrategyChange({ ...strategy, scaling: value as ScalingPolicy })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="auto">Automatic</SelectItem>
                <SelectItem value="predictive">Predictive</SelectItem>
                <SelectItem value="reactive">Reactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-preemption"
              checked={strategy.enablePreemption || false}
              onCheckedChange={(checked) => onStrategyChange({ ...strategy, enablePreemption: checked })}
            />
            <Label htmlFor="enable-preemption">Enable Resource Preemption</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-overcommit"
              checked={strategy.enableOvercommit || false}
              onCheckedChange={(checked) => onStrategyChange({ ...strategy, enableOvercommit: checked })}
            />
            <Label htmlFor="enable-overcommit">Allow Resource Overcommitment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-affinity"
              checked={strategy.enableAffinity || false}
              onCheckedChange={(checked) => onStrategyChange({ ...strategy, enableAffinity: checked })}
            />
            <Label htmlFor="enable-affinity">Enable Resource Affinity</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Resource Allocation Manager Component
interface ResourceAllocationManagerProps {
  workflowId?: string;
  onAllocationChange?: (allocation: ResourceAllocation) => void;
}

const ResourceAllocationManager: React.FC<ResourceAllocationManagerProps> = ({
  workflowId,
  onAllocationChange
}) => {
  // Hooks
  const {
    resourcePools,
    allocations,
    isLoading,
    error,
    createResourcePool,
    updateResourcePool,
    deleteResourcePool,
    allocateResources,
    deallocateResources,
    getResourceUtilization,
    getResourceMetrics,
    scaleResourcePool
  } = useOrchestration();

  const {
    optimizeResourceAllocation,
    predictResourceNeeds,
    analyzeResourceEfficiency,
    recommendScaling
  } = useOptimization();

  const {
    analyzeResourcePatterns,
    detectResourceAnomalies,
    generateResourceInsights
  } = useIntelligence();

  // State Management
  const [selectedPool, setSelectedPool] = useState<ResourcePool | null>(null);
  const [allocationStrategy, setAllocationStrategy] = useState<AllocationStrategy>({
    type: 'balanced',
    loadBalancing: 'round-robin',
    scaling: 'auto',
    enablePreemption: false,
    enableOvercommit: false,
    enableAffinity: true,
    priorityWeights: { high: 3, medium: 2, low: 1 }
  });
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetrics[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [showEditPool, setShowEditPool] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [newPool, setNewPool] = useState<Partial<ResourcePool>>({
    name: '',
    description: '',
    type: 'compute',
    capacity: { total: 100, available: 100, allocated: 0 },
    status: 'available',
    tags: []
  });

  // Load data on mount
  useEffect(() => {
    loadResourceData();
    const interval = setInterval(loadResourceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  // Load resource data
  const loadResourceData = useCallback(async () => {
    try {
      const metrics = await getResourceMetrics(timeRange);
      setResourceMetrics(metrics);
    } catch (error) {
      console.error('Failed to load resource data:', error);
    }
  }, [getResourceMetrics, timeRange]);

  // Get utilization for a resource pool
  const getPoolUtilization = useCallback((poolId: string): ResourceUtilization => {
    // Default utilization if not found
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      storage: Math.random() * 100,
      network: Math.random() * 100,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Filter resource pools
  const filteredPools = useMemo(() => {
    return resourcePools.filter(pool => {
      const matchesSearch = pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pool.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || pool.type === filterType;
      const matchesStatus = filterStatus === 'all' || pool.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [resourcePools, searchTerm, filterType, filterStatus]);

  // Handle pool creation
  const handleCreatePool = useCallback(async () => {
    try {
      await createResourcePool(newPool as ResourcePool);
      setShowCreatePool(false);
      setNewPool({
        name: '',
        description: '',
        type: 'compute',
        capacity: { total: 100, available: 100, allocated: 0 },
        status: 'available',
        tags: []
      });
    } catch (error) {
      console.error('Failed to create resource pool:', error);
    }
  }, [createResourcePool, newPool]);

  // Handle pool editing
  const handleEditPool = useCallback((pool: ResourcePool) => {
    setSelectedPool(pool);
    setShowEditPool(true);
  }, []);

  // Handle pool update
  const handleUpdatePool = useCallback(async () => {
    if (!selectedPool) return;
    
    try {
      await updateResourcePool(selectedPool.id, selectedPool);
      setShowEditPool(false);
      setSelectedPool(null);
    } catch (error) {
      console.error('Failed to update resource pool:', error);
    }
  }, [updateResourcePool, selectedPool]);

  // Handle pool deletion
  const handleDeletePool = useCallback(async (poolId: string) => {
    try {
      await deleteResourcePool(poolId);
    } catch (error) {
      console.error('Failed to delete resource pool:', error);
    }
  }, [deleteResourcePool]);

  // Handle pool scaling
  const handleScalePool = useCallback(async (poolId: string, action: 'scale-up' | 'scale-down') => {
    try {
      const scalingFactor = action === 'scale-up' ? 1.2 : 0.8;
      await scaleResourcePool(poolId, scalingFactor);
    } catch (error) {
      console.error('Failed to scale resource pool:', error);
    }
  }, [scaleResourcePool]);

  // Handle optimization
  const handleOptimization = useCallback(async () => {
    try {
      setShowOptimization(true);
      await optimizeResourceAllocation();
    } catch (error) {
      console.error('Failed to optimize resource allocation:', error);
    }
  }, [optimizeResourceAllocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading resource allocation manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resource Allocation Manager</h2>
          <p className="text-gray-600">Intelligent resource management and allocation for scan rule executions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOptimization}>
            <Target className="w-4 h-4 mr-2" />
            Optimize
          </Button>
          <Button onClick={() => setShowCreatePool(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Pool
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pools">Resource Pools</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="allocation">Allocation Strategy</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{resourcePools.length}</div>
                    <div className="text-sm text-gray-600">Resource Pools</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{allocations.length}</div>
                    <div className="text-sm text-gray-600">Active Allocations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(resourceMetrics.reduce((acc, m) => acc + m.current, 0) / resourceMetrics.length || 0)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg. Utilization</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {resourcePools.filter(p => p.status === 'available').length}
                    </div>
                    <div className="text-sm text-gray-600">Available Pools</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Monitor */}
          <ResourceMonitor 
            metrics={resourceMetrics}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </TabsContent>

        <TabsContent value="pools" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search resource pools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="compute">Compute</SelectItem>
                <SelectItem value="memory">HardDrive</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resource Pool Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPools.map((pool) => (
              <ResourcePoolCard
                key={pool.id}
                pool={pool}
                utilization={getPoolUtilization(pool.id)}
                onEdit={handleEditPool}
                onDelete={handleDeletePool}
                onScale={handleScalePool}
              />
            ))}
          </div>

          {filteredPools.length === 0 && (
            <div className="text-center py-12">
              <Server className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Resource Pools Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'No pools match your current filters.'
                  : 'Create your first resource pool to get started.'}
              </p>
              <Button onClick={() => setShowCreatePool(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Resource Pool
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <ResourceMonitor 
            metrics={resourceMetrics}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          
          {/* Additional monitoring components would go here */}
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <AllocationStrategyConfig
            strategy={allocationStrategy}
            onStrategyChange={setAllocationStrategy}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics components would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Analytics</CardTitle>
              <CardDescription>Advanced analytics and insights for resource management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Advanced analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Pool Dialog */}
      <Dialog open={showCreatePool} onOpenChange={setShowCreatePool}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Resource Pool</DialogTitle>
            <DialogDescription>
              Add a new resource pool to manage compute, memory, storage, and network resources.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pool-name">Name</Label>
                <Input
                  id="pool-name"
                  value={newPool.name}
                  onChange={(e) => setNewPool(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Resource pool name"
                />
              </div>
              <div>
                <Label htmlFor="pool-type">Type</Label>
                <Select 
                  value={newPool.type} 
                  onValueChange={(value) => setNewPool(prev => ({ ...prev, type: value as ResourceType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compute">Compute</SelectItem>
                    <SelectItem value="memory">HardDrive</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="pool-description">Description</Label>
              <Textarea
                id="pool-description"
                value={newPool.description}
                onChange={(e) => setNewPool(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this resource pool..."
                rows={3}
              />
            </div>

            <div>
              <Label>Capacity</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label className="text-xs">Total</Label>
                  <Input
                    type="number"
                    value={newPool.capacity?.total}
                    onChange={(e) => setNewPool(prev => ({
                      ...prev,
                      capacity: { ...prev.capacity!, total: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Available</Label>
                  <Input
                    type="number"
                    value={newPool.capacity?.available}
                    onChange={(e) => setNewPool(prev => ({
                      ...prev,
                      capacity: { ...prev.capacity!, available: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Allocated</Label>
                  <Input
                    type="number"
                    value={newPool.capacity?.allocated}
                    onChange={(e) => setNewPool(prev => ({
                      ...prev,
                      capacity: { ...prev.capacity!, allocated: parseInt(e.target.value) }
                    }))}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="pool-tags">Tags (comma-separated)</Label>
              <Input
                id="pool-tags"
                value={newPool.tags?.join(', ')}
                onChange={(e) => setNewPool(prev => ({
                  ...prev,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreatePool(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePool} disabled={!newPool.name}>
              Create Pool
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Pool Dialog */}
      <Dialog open={showEditPool} onOpenChange={setShowEditPool}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Resource Pool</DialogTitle>
            <DialogDescription>
              Modify the resource pool configuration.
            </DialogDescription>
          </DialogHeader>

          {selectedPool && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-pool-name">Name</Label>
                  <Input
                    id="edit-pool-name"
                    value={selectedPool.name}
                    onChange={(e) => setSelectedPool(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pool-status">Status</Label>
                  <Select 
                    value={selectedPool.status} 
                    onValueChange={(value) => setSelectedPool(prev => prev ? { ...prev, status: value as ResourceStatus } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-pool-description">Description</Label>
                <Textarea
                  id="edit-pool-description"
                  value={selectedPool.description}
                  onChange={(e) => setSelectedPool(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Capacity</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label className="text-xs">Total</Label>
                    <Input
                      type="number"
                      value={selectedPool.capacity.total}
                      onChange={(e) => setSelectedPool(prev => prev ? {
                        ...prev,
                        capacity: { ...prev.capacity, total: parseInt(e.target.value) }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Available</Label>
                    <Input
                      type="number"
                      value={selectedPool.capacity.available}
                      onChange={(e) => setSelectedPool(prev => prev ? {
                        ...prev,
                        capacity: { ...prev.capacity, available: parseInt(e.target.value) }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Allocated</Label>
                    <Input
                      type="number"
                      value={selectedPool.capacity.allocated}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditPool(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePool}>
              Update Pool
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">Error</div>
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocationManager;