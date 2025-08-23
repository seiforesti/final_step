import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Cpu, HardDrive, Zap, TrendingUp, TrendingDown, Settings, Activity, BarChart3, PieChart, LineChart, AlertTriangle, CheckCircle, Clock, Target, Layers, Database, Server, Monitor, Gauge, RefreshCw, Play, Pause, Square, Download, Upload, Save, Eye, EyeOff, Maximize, Minimize, RotateCcw, Calendar, Filter, Search, MoreHorizontal } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, ComposedChart, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';
import { useOptimization } from '../../hooks/useOptimization';
import { optimizationApi } from '../../services/optimization-apis';
import { ResourceAllocationStrategy, ResourceMetric, OptimizationRule, OptimizationResult } from '../../types/optimization.types';

interface ResourceOptimizerProps {
  className?: string;
  onOptimizationComplete?: (results: OptimizationResult[]) => void;
  onResourceUpdate?: (metrics: ResourceMetric[]) => void;
}

interface ResourcePool {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'memory' | 'network';
  totalCapacity: number;
  usedCapacity: number;
  reservedCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  efficiency: number;
  cost: number;
  status: 'optimal' | 'warning' | 'critical';
  location: string;
  provider: string;
  tags: string[];
  lastUpdated: Date;
  metrics: {
    cpu?: number;
    memory?: number;
    storage?: number;
    network?: number;
    latency?: number;
    throughput?: number;
  };
  allocations: ResourceAllocation[];
}

interface ResourceAllocation {
  id: string;
  resourceId: string;
  ruleSetId: string;
  ruleSetName: string;
  allocatedCapacity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'active' | 'completed' | 'failed';
  performance: {
    throughput: number;
    latency: number;
    errorRate: number;
    successRate: number;
  };
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  type: 'automatic' | 'semi-automatic' | 'manual';
  parameters: {
    cpuThreshold: number;
    memoryThreshold: number;
    storageThreshold: number;
    loadBalancing: boolean;
    autoScaling: boolean;
    costOptimization: boolean;
    performanceOptimization: boolean;
  };
  rules: OptimizationRule[];
  enabled: boolean;
  lastRun: Date;
  nextRun: Date;
  results: OptimizationResult[];
}

interface RecommendationItem {
  id: string;
  type: 'scale_up' | 'scale_down' | 'migrate' | 'optimize' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: {
    performance: number;
    cost: number;
    efficiency: number;
  };
  estimatedSavings: number;
  implementationTime: number;
  resources: string[];
  actions: Array<{
    type: string;
    description: string;
    automated: boolean;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ResourceOptimizer: React.FC<ResourceOptimizerProps> = ({
  className,
  onOptimizationComplete,
  onResourceUpdate
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'pools' | 'allocations' | 'strategies' | 'recommendations' | 'analytics'>('overview');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  
  // Resource pools and allocations
  const [resourcePools, setResourcePools] = useState<ResourcePool[]>([]);
  const [optimizationStrategies, setOptimizationStrategies] = useState<OptimizationStrategy[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [allocationHistory, setAllocationHistory] = useState<ResourceAllocation[]>([]);
  
  // Dialog and modal states
  const [showCreateStrategy, setShowCreateStrategy] = useState(false);
  const [showResourceDetails, setShowResourceDetails] = useState(false);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationStrategy | null>(null);
  
  // Form states
  const [strategyForm, setStrategyForm] = useState({
    name: '',
    description: '',
    type: 'automatic' as 'automatic' | 'semi-automatic' | 'manual',
    cpuThreshold: 80,
    memoryThreshold: 85,
    storageThreshold: 90,
    loadBalancing: true,
    autoScaling: true,
    costOptimization: true,
    performanceOptimization: true
  });

  // Hooks
  const {
    optimizeResources,
    getResourceMetrics,
    createOptimizationStrategy,
    analyzeResourceUsage,
    generateRecommendations,
    loading: optimizationLoading,
    error: optimizationError
  } = useOptimization();

  // Initialize data
  useEffect(() => {
    loadResourceData();
    loadOptimizationStrategies();
    loadRecommendations();
  }, []);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshResourceMetrics();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Data loading functions
  const loadResourceData = useCallback(async () => {
    try {
      setLoading(true);
      const [poolsData, allocationsData] = await Promise.all([
        optimizationApi.getResourcePools(),
        optimizationApi.getAllocations()
      ]);
      
      setResourcePools(poolsData);
      setAllocationHistory(allocationsData);
      
      if (onResourceUpdate) {
        const metrics = poolsData.map(pool => ({
          resourceId: pool.id,
          type: pool.type,
          utilization: pool.utilizationRate,
          efficiency: pool.efficiency,
          cost: pool.cost,
          timestamp: new Date()
        }));
        onResourceUpdate(metrics);
      }
    } catch (error) {
      console.error('Failed to load resource data:', error);
    } finally {
      setLoading(false);
    }
  }, [onResourceUpdate]);

  const loadOptimizationStrategies = useCallback(async () => {
    try {
      const strategies = await optimizationApi.getOptimizationStrategies();
      setOptimizationStrategies(strategies);
    } catch (error) {
      console.error('Failed to load optimization strategies:', error);
    }
  }, []);

  const loadRecommendations = useCallback(async () => {
    try {
      const recs = await generateRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  }, [generateRecommendations]);

  const refreshResourceMetrics = useCallback(async () => {
    try {
      const metrics = await getResourceMetrics(selectedTimeRange);
      // Update resource pools with latest metrics
      setResourcePools(prev => prev.map(pool => {
        const metric = metrics.find(m => m.resourceId === pool.id);
        if (metric) {
          return {
            ...pool,
            utilizationRate: metric.utilization,
            efficiency: metric.efficiency,
            lastUpdated: new Date()
          };
        }
        return pool;
      }));
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  }, [getResourceMetrics, selectedTimeRange]);

  // Optimization functions
  const handleOptimizeResources = useCallback(async () => {
    try {
      setLoading(true);
      const results = await optimizeResources({
        resourceIds: selectedResource ? [selectedResource] : resourcePools.map(p => p.id),
        strategy: selectedStrategy?.id,
        options: {
          autoApply: false,
          dryRun: true
        }
      });
      
      if (onOptimizationComplete) {
        onOptimizationComplete(results);
      }
      
      // Refresh recommendations after optimization
      await loadRecommendations();
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setLoading(false);
    }
  }, [optimizeResources, selectedResource, resourcePools, selectedStrategy, onOptimizationComplete, loadRecommendations]);

  const handleCreateStrategy = useCallback(async () => {
    try {
      setLoading(true);
      const strategy = await createOptimizationStrategy({
        name: strategyForm.name,
        description: strategyForm.description,
        type: strategyForm.type,
        parameters: {
          cpuThreshold: strategyForm.cpuThreshold,
          memoryThreshold: strategyForm.memoryThreshold,
          storageThreshold: strategyForm.storageThreshold,
          loadBalancing: strategyForm.loadBalancing,
          autoScaling: strategyForm.autoScaling,
          costOptimization: strategyForm.costOptimization,
          performanceOptimization: strategyForm.performanceOptimization
        }
      });
      
      setOptimizationStrategies(prev => [...prev, strategy]);
      setShowCreateStrategy(false);
      setStrategyForm({
        name: '',
        description: '',
        type: 'automatic',
        cpuThreshold: 80,
        memoryThreshold: 85,
        storageThreshold: 90,
        loadBalancing: true,
        autoScaling: true,
        costOptimization: true,
        performanceOptimization: true
      });
    } catch (error) {
      console.error('Failed to create strategy:', error);
    } finally {
      setLoading(false);
    }
  }, [createOptimizationStrategy, strategyForm]);

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    if (!resourcePools.length) return null;
    
    const totalCapacity = resourcePools.reduce((sum, pool) => sum + pool.totalCapacity, 0);
    const totalUsed = resourcePools.reduce((sum, pool) => sum + pool.usedCapacity, 0);
    const totalCost = resourcePools.reduce((sum, pool) => sum + pool.cost, 0);
    const avgUtilization = resourcePools.reduce((sum, pool) => sum + pool.utilizationRate, 0) / resourcePools.length;
    const avgEfficiency = resourcePools.reduce((sum, pool) => sum + pool.efficiency, 0) / resourcePools.length;
    
    const criticalResources = resourcePools.filter(pool => pool.status === 'critical').length;
    const warningResources = resourcePools.filter(pool => pool.status === 'warning').length;
    const optimalResources = resourcePools.filter(pool => pool.status === 'optimal').length;
    
    return {
      totalCapacity,
      totalUsed,
      totalAvailable: totalCapacity - totalUsed,
      utilizationRate: (totalUsed / totalCapacity) * 100,
      totalCost,
      avgUtilization,
      avgEfficiency,
      resourceHealth: {
        critical: criticalResources,
        warning: warningResources,
        optimal: optimalResources
      }
    };
  }, [resourcePools]);

  // Render functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourcePools.length}</div>
            <p className="text-xs text-muted-foreground">
              Active resource pools
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateMetrics?.avgUtilization.toFixed(1)}%</div>
            <Progress value={aggregateMetrics?.avgUtilization} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateMetrics?.avgEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              System-wide efficiency
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${aggregateMetrics?.totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Monthly operational cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Health Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Health Distribution</CardTitle>
          <CardDescription>Current status of all resource pools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Optimal', value: aggregateMetrics?.resourceHealth.optimal || 0, color: '#10B981' },
                    { name: 'Warning', value: aggregateMetrics?.resourceHealth.warning || 0, color: '#F59E0B' },
                    { name: 'Critical', value: aggregateMetrics?.resourceHealth.critical || 0, color: '#EF4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {[
                    { name: 'Optimal', value: aggregateMetrics?.resourceHealth.optimal || 0, color: '#10B981' },
                    { name: 'Warning', value: aggregateMetrics?.resourceHealth.warning || 0, color: '#F59E0B' },
                    { name: 'Critical', value: aggregateMetrics?.resourceHealth.critical || 0, color: '#EF4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Optimization Recommendations</CardTitle>
          <CardDescription>Latest AI-generated optimization suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((rec) => (
              <div key={rec.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className={cn(
                  "rounded-full p-1",
                  rec.severity === 'critical' && "bg-red-100 text-red-600",
                  rec.severity === 'high' && "bg-orange-100 text-orange-600",
                  rec.severity === 'medium' && "bg-yellow-100 text-yellow-600",
                  rec.severity === 'low' && "bg-blue-100 text-blue-600"
                )}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">
                      {rec.estimatedSavings > 0 ? `$${rec.estimatedSavings}` : 'Cost neutral'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {rec.implementationTime}min implementation
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResourcePools = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Resource Pools</h3>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all resource pools
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshResourceMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Pool
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {resourcePools.map((pool) => (
          <Card key={pool.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    pool.type === 'compute' && "bg-blue-100 text-blue-600",
                    pool.type === 'storage' && "bg-green-100 text-green-600",
                    pool.type === 'memory' && "bg-purple-100 text-purple-600",
                    pool.type === 'network' && "bg-orange-100 text-orange-600"
                  )}>
                    {pool.type === 'compute' && <Cpu className="h-4 w-4" />}
                    {pool.type === 'storage' && <HardDrive className="h-4 w-4" />}
                    {pool.type === 'memory' && <Database className="h-4 w-4" />}
                    {pool.type === 'network' && <Activity className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-base">{pool.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {pool.location} • {pool.provider}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={
                  pool.status === 'optimal' ? 'default' :
                  pool.status === 'warning' ? 'secondary' : 'destructive'
                }>
                  {pool.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Utilization</span>
                    <span className="font-medium">{pool.utilizationRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={pool.utilizationRate} className="mt-1" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Efficiency</span>
                    <span className="font-medium">{pool.efficiency.toFixed(1)}%</span>
                  </div>
                  <Progress value={pool.efficiency} className="mt-1" />
                </div>
                
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span>Monthly Cost</span>
                  <span className="font-medium">${pool.cost.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Active Allocations</span>
                  <span className="font-medium">{pool.allocations.length}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedResource(pool.id);
                    setShowResourceDetails(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedResource(pool.id);
                    handleOptimizeResources();
                  }}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Optimize
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderOptimizationStrategies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Optimization Strategies</h3>
          <p className="text-sm text-muted-foreground">
            Configure automated resource optimization strategies
          </p>
        </div>
        <Button onClick={() => setShowCreateStrategy(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Strategy
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {optimizationStrategies.map((strategy) => (
          <Card key={strategy.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{strategy.name}</CardTitle>
                  <CardDescription>{strategy.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={strategy.type === 'automatic' ? 'default' : 'secondary'}>
                    {strategy.type}
                  </Badge>
                  <Switch 
                    checked={strategy.enabled}
                    onCheckedChange={(checked) => {
                      setOptimizationStrategies(prev => 
                        prev.map(s => s.id === strategy.id ? { ...s, enabled: checked } : s)
                      );
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">CPU Threshold</Label>
                    <div className="text-sm font-medium">{strategy.parameters.cpuThreshold}%</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Memory Threshold</Label>
                    <div className="text-sm font-medium">{strategy.parameters.memoryThreshold}%</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Storage Threshold</Label>
                    <div className="text-sm font-medium">{strategy.parameters.storageThreshold}%</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Run</Label>
                    <div className="text-sm font-medium">
                      {new Date(strategy.lastRun).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {strategy.parameters.loadBalancing && (
                    <Badge variant="outline">Load Balancing</Badge>
                  )}
                  {strategy.parameters.autoScaling && (
                    <Badge variant="outline">Auto Scaling</Badge>
                  )}
                  {strategy.parameters.costOptimization && (
                    <Badge variant="outline">Cost Optimization</Badge>
                  )}
                  {strategy.parameters.performanceOptimization && (
                    <Badge variant="outline">Performance Optimization</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedStrategy(strategy);
                      setShowOptimizationDialog(true);
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Run Now
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">AI Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            Intelligent optimization suggestions based on historical data
          </p>
        </div>
        <Button onClick={loadRecommendations} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "rounded-full p-2 mt-1",
                    rec.severity === 'critical' && "bg-red-100 text-red-600",
                    rec.severity === 'high' && "bg-orange-100 text-orange-600",
                    rec.severity === 'medium' && "bg-yellow-100 text-yellow-600",
                    rec.severity === 'low' && "bg-blue-100 text-blue-600"
                  )}>
                    {rec.type === 'scale_up' && <TrendingUp className="h-4 w-4" />}
                    {rec.type === 'scale_down' && <TrendingDown className="h-4 w-4" />}
                    {rec.type === 'migrate' && <RefreshCw className="h-4 w-4" />}
                    {rec.type === 'optimize' && <Target className="h-4 w-4" />}
                    {rec.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <CardDescription className="mt-1">{rec.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    rec.severity === 'critical' ? 'destructive' :
                    rec.severity === 'high' ? 'secondary' : 'outline'
                  }>
                    {rec.severity}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      +{rec.expectedImpact.performance}%
                    </div>
                    <div className="text-xs text-muted-foreground">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {rec.expectedImpact.cost > 0 ? '-' : '+'}{Math.abs(rec.expectedImpact.cost)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      +{rec.expectedImpact.efficiency}%
                    </div>
                    <div className="text-xs text-muted-foreground">Efficiency</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Affected Resources</Label>
                    <span className="text-xs text-muted-foreground">
                      {rec.implementationTime}min to implement
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rec.resources.map((resource, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Required Actions</Label>
                  <div className="space-y-2">
                    {rec.actions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{action.description}</span>
                        <Badge variant={action.automated ? "default" : "secondary"}>
                          {action.automated ? "Automated" : "Manual"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button className="flex-1">
                    Apply Recommendation
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resource Optimizer</h2>
          <p className="text-muted-foreground">
            Intelligent resource optimization and allocation management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleOptimizeResources} disabled={loading}>
            <Target className="h-4 w-4 mr-2" />
            Optimize All
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pools">Resource Pools</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="pools" className="space-y-6">
          {renderResourcePools()}
        </TabsContent>
        
        <TabsContent value="allocations" className="space-y-6">
          {/* Resource allocations content */}
          <div>Resource Allocations (Implementation continues...)</div>
        </TabsContent>
        
        <TabsContent value="strategies" className="space-y-6">
          {renderOptimizationStrategies()}
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          {renderRecommendations()}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics content */}
          <div>Resource Analytics (Implementation continues...)</div>
        </TabsContent>
      </Tabs>

      {/* Create Strategy Dialog */}
      <Dialog open={showCreateStrategy} onOpenChange={setShowCreateStrategy}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Optimization Strategy</DialogTitle>
            <DialogDescription>
              Configure a new automated resource optimization strategy
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Strategy Name</Label>
                <Input
                  id="name"
                  value={strategyForm.name}
                  onChange={(e) => setStrategyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter strategy name"
                />
              </div>
              <div>
                <Label htmlFor="type">Strategy Type</Label>
                <Select value={strategyForm.type} onValueChange={(value) => setStrategyForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={strategyForm.description}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the optimization strategy"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Threshold Settings</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>CPU Threshold: {strategyForm.cpuThreshold}%</Label>
                  <Slider
                    value={[strategyForm.cpuThreshold]}
                    onValueChange={([value]) => setStrategyForm(prev => ({ ...prev, cpuThreshold: value }))}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Memory Threshold: {strategyForm.memoryThreshold}%</Label>
                  <Slider
                    value={[strategyForm.memoryThreshold]}
                    onValueChange={([value]) => setStrategyForm(prev => ({ ...prev, memoryThreshold: value }))}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Storage Threshold: {strategyForm.storageThreshold}%</Label>
                  <Slider
                    value={[strategyForm.storageThreshold]}
                    onValueChange={([value]) => setStrategyForm(prev => ({ ...prev, storageThreshold: value }))}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Optimization Features</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={strategyForm.loadBalancing}
                    onCheckedChange={(checked) => setStrategyForm(prev => ({ ...prev, loadBalancing: checked }))}
                  />
                  <Label>Load Balancing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={strategyForm.autoScaling}
                    onCheckedChange={(checked) => setStrategyForm(prev => ({ ...prev, autoScaling: checked }))}
                  />
                  <Label>Auto Scaling</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={strategyForm.costOptimization}
                    onCheckedChange={(checked) => setStrategyForm(prev => ({ ...prev, costOptimization: checked }))}
                  />
                  <Label>Cost Optimization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={strategyForm.performanceOptimization}
                    onCheckedChange={(checked) => setStrategyForm(prev => ({ ...prev, performanceOptimization: checked }))}
                  />
                  <Label>Performance Optimization</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateStrategy(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStrategy} disabled={loading}>
              Create Strategy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Run Optimization Dialog */}
      <AlertDialog open={showOptimizationDialog} onOpenChange={setShowOptimizationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Run Optimization Strategy</AlertDialogTitle>
            <AlertDialogDescription>
              This will execute the "{selectedStrategy?.name}" optimization strategy. 
              This may affect resource allocations and system performance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOptimizeResources}>
              Run Optimization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourceOptimizer;