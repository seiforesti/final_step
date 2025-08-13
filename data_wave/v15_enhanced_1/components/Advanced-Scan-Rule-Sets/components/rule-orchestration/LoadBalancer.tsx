import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Server, 
  Activity,
  Gauge,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Database,
  Monitor,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Layers,
  Grid,
  List,
  PieChart,
  LineChart,
  Maximize2,
  Minimize2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useOrchestration } from '../../hooks/useOrchestration';
import { useIntelligence } from '../../hooks/useIntelligence';

// API Services
import { orchestrationAPI } from '../../services/orchestration-apis';
import { intelligenceAPI } from '../../services/intelligence-apis';

// Types
import type { 
  LoadBalancerConfig,
  NodeMetrics,
  LoadBalancingStrategy,
  ResourceNode,
  LoadDistribution,
  BalancingRule,
  TrafficMetrics,
  HealthCheck,
  LoadBalancerMetrics,
  ResourcePool,
  CapacityPlanning,
  AutoScalingConfig,
  LoadPattern,
  NodeStatus,
  LoadThreshold
} from '../../types/orchestration.types';

// Utilities
import { performanceCalculator } from '../../utils/performance-calculator';
import { aiHelpers } from '../../utils/ai-helpers';

interface LoadBalancerProps {
  className?: string;
  onNodeAdded?: (node: ResourceNode) => void;
  onLoadRebalanced?: (distribution: LoadDistribution) => void;
  onThresholdExceeded?: (threshold: LoadThreshold) => void;
}

interface LoadBalancerState {
  nodes: ResourceNode[];
  activeNodes: ResourceNode[];
  metrics: LoadBalancerMetrics;
  distribution: LoadDistribution;
  rules: BalancingRule[];
  pools: ResourcePool[];
  trafficMetrics: TrafficMetrics;
  healthChecks: HealthCheck[];
  patterns: LoadPattern[];
  config: LoadBalancerConfig;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalNodes: number;
  healthyNodes: number;
  totalRequests: number;
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  cpuUtilization: number;
  memoryUtilization: number;
  networkUtilization: number;
  diskUtilization: number;
}

interface LoadBalancerViewState {
  currentView: 'overview' | 'nodes' | 'distribution' | 'rules' | 'monitoring' | 'configuration';
  selectedNode?: ResourceNode;
  selectedPool?: ResourcePool;
  strategy: LoadBalancingStrategy;
  autoScaling: boolean;
  intelligentRouting: boolean;
  healthChecksEnabled: boolean;
  realTimeMode: boolean;
  filterStatus: string;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  selectedTimeRange: 'minute' | 'hour' | 'day' | 'week';
}

const DEFAULT_VIEW_STATE: LoadBalancerViewState = {
  currentView: 'overview',
  strategy: 'round_robin',
  autoScaling: true,
  intelligentRouting: true,
  healthChecksEnabled: true,
  realTimeMode: true,
  filterStatus: 'all',
  searchQuery: '',
  sortBy: 'cpu',
  sortOrder: 'desc',
  viewMode: 'grid',
  selectedTimeRange: 'hour'
};

const LOAD_BALANCING_STRATEGIES = [
  { value: 'round_robin', label: 'Round Robin', description: 'Distribute requests sequentially' },
  { value: 'least_connections', label: 'Least Connections', description: 'Route to node with fewest connections' },
  { value: 'weighted_round_robin', label: 'Weighted Round Robin', description: 'Route based on node weights' },
  { value: 'resource_based', label: 'Resource Based', description: 'Route based on resource utilization' },
  { value: 'response_time', label: 'Response Time', description: 'Route to fastest responding node' },
  { value: 'intelligent', label: 'AI-Powered', description: 'Machine learning based routing' }
];

const NODE_STATUS_COLORS = {
  healthy: 'text-green-600 bg-green-100',
  warning: 'text-yellow-600 bg-yellow-100',
  critical: 'text-red-600 bg-red-100',
  offline: 'text-gray-600 bg-gray-100'
};

export const LoadBalancer: React.FC<LoadBalancerProps> = ({
  className,
  onNodeAdded,
  onLoadRebalanced,
  onThresholdExceeded
}) => {
  // State Management
  const [viewState, setViewState] = useState<LoadBalancerViewState>(DEFAULT_VIEW_STATE);
  const [loadBalancerState, setLoadBalancerState] = useState<LoadBalancerState>({
    nodes: [],
    activeNodes: [],
    metrics: {} as LoadBalancerMetrics,
    distribution: {} as LoadDistribution,
    rules: [],
    pools: [],
    trafficMetrics: {} as TrafficMetrics,
    healthChecks: [],
    patterns: [],
    config: {} as LoadBalancerConfig,
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalNodes: 0,
    healthyNodes: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    throughput: 0,
    errorRate: 0,
    cpuUtilization: 0,
    memoryUtilization: 0,
    networkUtilization: 0,
    diskUtilization: 0
  });

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [nodeDetailsDialogOpen, setNodeDetailsDialogOpen] = useState(false);
  const [addNodeDialogOpen, setAddNodeDialogOpen] = useState(false);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout>();

  // Custom Hooks
  const {
    orchestrationJobs,
    resourceAllocations,
    getMetrics,
    loading: orchestrationLoading
  } = useOrchestration();

  const {
    getInsights,
    analyzePerformance,
    loading: intelligenceLoading
  } = useIntelligence();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeMode) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/load-balancer`);
      
      wsRef.current.onopen = () => {
        console.log('Load Balancer WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Load Balancer WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Load Balancer WebSocket disconnected');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewState.realTimeMode]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'node_metrics_updated':
        setLoadBalancerState(prev => ({
          ...prev,
          nodes: prev.nodes.map(node => 
            node.id === data.nodeId 
              ? { ...node, metrics: data.metrics, lastUpdated: new Date() }
              : node
          )
        }));
        break;
      case 'load_rebalanced':
        setLoadBalancerState(prev => ({
          ...prev,
          distribution: data.distribution
        }));
        if (onLoadRebalanced) onLoadRebalanced(data.distribution);
        break;
      case 'threshold_exceeded':
        if (onThresholdExceeded) onThresholdExceeded(data.threshold);
        break;
      case 'node_status_changed':
        setLoadBalancerState(prev => ({
          ...prev,
          nodes: prev.nodes.map(node => 
            node.id === data.nodeId 
              ? { ...node, status: data.status }
              : node
          ),
          healthyNodes: data.status === 'healthy' 
            ? prev.healthyNodes + 1 
            : prev.healthyNodes - 1
        }));
        break;
      case 'metrics_updated':
        setLoadBalancerState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [onLoadRebalanced, onThresholdExceeded]);

  // Metrics Collection
  useEffect(() => {
    if (viewState.realTimeMode) {
      metricsIntervalRef.current = setInterval(() => {
        collectMetrics();
      }, 5000); // Every 5 seconds
    }

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [viewState.realTimeMode]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setLoadBalancerState(prev => ({ ...prev, loading: true, error: null }));

      const [nodesData, metricsData, distributionData, rulesData] = await Promise.all([
        orchestrationAPI.getResourceNodes(),
        orchestrationAPI.getLoadBalancerMetrics(),
        orchestrationAPI.getLoadDistribution(),
        orchestrationAPI.getBalancingRules()
      ]);

      setLoadBalancerState(prev => ({
        ...prev,
        nodes: nodesData.nodes,
        activeNodes: nodesData.nodes.filter(node => node.status === 'healthy'),
        metrics: metricsData,
        distribution: distributionData,
        rules: rulesData.rules,
        totalNodes: nodesData.total,
        healthyNodes: nodesData.nodes.filter(node => node.status === 'healthy').length,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate aggregate metrics
      const avgCpu = nodesData.nodes.reduce((sum, node) => sum + (node.metrics?.cpu || 0), 0) / nodesData.nodes.length;
      const avgMemory = nodesData.nodes.reduce((sum, node) => sum + (node.metrics?.memory || 0), 0) / nodesData.nodes.length;
      const avgNetwork = nodesData.nodes.reduce((sum, node) => sum + (node.metrics?.network || 0), 0) / nodesData.nodes.length;
      const avgDisk = nodesData.nodes.reduce((sum, node) => sum + (node.metrics?.disk || 0), 0) / nodesData.nodes.length;

      setLoadBalancerState(prev => ({
        ...prev,
        cpuUtilization: avgCpu,
        memoryUtilization: avgMemory,
        networkUtilization: avgNetwork,
        diskUtilization: avgDisk
      }));

    } catch (error) {
      console.error('Failed to refresh load balancer data:', error);
      setLoadBalancerState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Load Balancing Functions
  const collectMetrics = useCallback(async () => {
    try {
      const metrics = await orchestrationAPI.collectRealTimeMetrics();
      setLoadBalancerState(prev => ({
        ...prev,
        totalRequests: metrics.totalRequests,
        averageResponseTime: metrics.averageResponseTime,
        throughput: metrics.throughput,
        errorRate: metrics.errorRate
      }));
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }, []);

  const rebalanceLoad = useCallback(async () => {
    try {
      const result = await orchestrationAPI.rebalanceLoad({
        strategy: viewState.strategy,
        nodes: loadBalancerState.activeNodes
      });
      
      setLoadBalancerState(prev => ({
        ...prev,
        distribution: result.distribution
      }));

      if (onLoadRebalanced) onLoadRebalanced(result.distribution);
    } catch (error) {
      console.error('Failed to rebalance load:', error);
    }
  }, [viewState.strategy, loadBalancerState.activeNodes, onLoadRebalanced]);

  const addNode = useCallback(async (nodeConfig: Partial<ResourceNode>) => {
    try {
      const newNode = await orchestrationAPI.addResourceNode(nodeConfig);
      setLoadBalancerState(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
        totalNodes: prev.totalNodes + 1,
        healthyNodes: newNode.status === 'healthy' ? prev.healthyNodes + 1 : prev.healthyNodes
      }));
      if (onNodeAdded) onNodeAdded(newNode);
    } catch (error) {
      console.error('Failed to add node:', error);
    }
  }, [onNodeAdded]);

  const removeNode = useCallback(async (nodeId: string) => {
    try {
      await orchestrationAPI.removeResourceNode(nodeId);
      setLoadBalancerState(prev => ({
        ...prev,
        nodes: prev.nodes.filter(node => node.id !== nodeId),
        totalNodes: prev.totalNodes - 1
      }));
    } catch (error) {
      console.error('Failed to remove node:', error);
    }
  }, []);

  const performHealthCheck = useCallback(async (nodeId?: string) => {
    try {
      const healthCheck = await orchestrationAPI.performHealthCheck(nodeId);
      setLoadBalancerState(prev => ({
        ...prev,
        healthChecks: nodeId 
          ? [...prev.healthChecks.filter(hc => hc.nodeId !== nodeId), healthCheck]
          : [...prev.healthChecks, ...healthCheck]
      }));
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }, []);

  // Utility Functions
  const getNodeStatusIcon = useCallback((status: NodeStatus) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'offline': return <Square className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  }, []);

  const getUtilizationColor = useCallback((utilization: number) => {
    if (utilization < 50) return 'text-green-600';
    if (utilization < 80) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  // Filter and Search Functions
  const filteredNodes = useMemo(() => {
    let filtered = loadBalancerState.nodes;

    if (viewState.searchQuery) {
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        node.hostname.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.filterStatus !== 'all') {
      filtered = filtered.filter(node => node.status === viewState.filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'cpu':
          aValue = a.metrics?.cpu || 0;
          bValue = b.metrics?.cpu || 0;
          break;
        case 'memory':
          aValue = a.metrics?.memory || 0;
          bValue = b.metrics?.memory || 0;
          break;
        case 'connections':
          aValue = a.metrics?.connections || 0;
          bValue = b.metrics?.connections || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [loadBalancerState.nodes, viewState.searchQuery, viewState.filterStatus, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadBalancerState.totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              {loadBalancerState.healthyNodes} healthy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadBalancerState.throughput.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              requests/sec
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadBalancerState.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loadBalancerState.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              of total requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Resource Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU</span>
                <span className={`text-sm ${getUtilizationColor(loadBalancerState.cpuUtilization)}`}>
                  {loadBalancerState.cpuUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress value={loadBalancerState.cpuUtilization} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory</span>
                <span className={`text-sm ${getUtilizationColor(loadBalancerState.memoryUtilization)}`}>
                  {loadBalancerState.memoryUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress value={loadBalancerState.memoryUtilization} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <span className={`text-sm ${getUtilizationColor(loadBalancerState.networkUtilization)}`}>
                  {loadBalancerState.networkUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress value={loadBalancerState.networkUtilization} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk</span>
                <span className={`text-sm ${getUtilizationColor(loadBalancerState.diskUtilization)}`}>
                  {loadBalancerState.diskUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress value={loadBalancerState.diskUtilization} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Nodes Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Active Nodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loadBalancerState.activeNodes.slice(0, 5).map(node => (
              <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getNodeStatusIcon(node.status)}
                  <div>
                    <div className="font-medium">{node.name}</div>
                    <div className="text-sm text-gray-500">{node.hostname}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {node.metrics?.connections || 0} connections
                  </div>
                  <div className="text-xs text-gray-500">
                    CPU: {node.metrics?.cpu || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNodes = () => (
    <div className="space-y-6">
      {/* Node Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Node Management</h2>
          <p className="text-gray-600">Monitor and manage resource nodes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => performHealthCheck()}
          >
            <Activity className="h-4 w-4 mr-2" />
            Health Check
          </Button>
          <Button
            size="sm"
            onClick={() => setAddNodeDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Node
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search nodes..."
              value={viewState.searchQuery}
              onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={viewState.filterStatus}
          onValueChange={(value) => setViewState(prev => ({ ...prev, filterStatus: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={viewState.sortBy}
          onValueChange={(value) => setViewState(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="cpu">CPU Usage</SelectItem>
            <SelectItem value="memory">Memory Usage</SelectItem>
            <SelectItem value="connections">Connections</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewState(prev => ({ 
            ...prev, 
            viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' 
          }))}
        >
          {viewState.viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nodes Display */}
      {viewState.viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.map(node => (
            <Card key={node.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getNodeStatusIcon(node.status)}
                    <CardTitle className="text-lg">{node.name}</CardTitle>
                  </div>
                  <Badge className={NODE_STATUS_COLORS[node.status]}>
                    {node.status}
                  </Badge>
                </div>
                <CardDescription>{node.hostname}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU:</span>
                      <span className={getUtilizationColor(node.metrics?.cpu || 0)}>
                        {node.metrics?.cpu || 0}%
                      </span>
                    </div>
                    <Progress value={node.metrics?.cpu || 0} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory:</span>
                      <span className={getUtilizationColor(node.metrics?.memory || 0)}>
                        {node.metrics?.memory || 0}%
                      </span>
                    </div>
                    <Progress value={node.metrics?.memory || 0} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connections:</span>
                    <span>{node.metrics?.connections || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewState(prev => ({ ...prev, selectedNode: node }));
                            setNodeDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => performHealthCheck(node.id)}
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Health Check</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Connections</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNodes.map(node => (
                <TableRow key={node.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getNodeStatusIcon(node.status)}
                      <div>
                        <div className="font-medium">{node.name}</div>
                        <div className="text-sm text-gray-500">{node.hostname}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={NODE_STATUS_COLORS[node.status]}>
                      {node.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={getUtilizationColor(node.metrics?.cpu || 0)}>
                      {node.metrics?.cpu || 0}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getUtilizationColor(node.metrics?.memory || 0)}>
                      {node.metrics?.memory || 0}%
                    </span>
                  </TableCell>
                  <TableCell>{node.metrics?.connections || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Node</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Load Balancer</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  loadBalancerState.healthyNodes === loadBalancerState.totalNodes ? 'bg-green-500' :
                  loadBalancerState.healthyNodes > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {loadBalancerState.healthyNodes}/{loadBalancerState.totalNodes} healthy
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.strategy}
                onValueChange={(value) => setViewState(prev => ({ ...prev, strategy: value as LoadBalancingStrategy }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAD_BALANCING_STRATEGIES.map(strategy => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={rebalanceLoad}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Rebalance
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loadBalancerState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadBalancerState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="nodes" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Nodes
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Distribution
                </TabsTrigger>
                <TabsTrigger value="rules" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Rules
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Monitoring
                </TabsTrigger>
                <TabsTrigger value="configuration" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="nodes">
                {renderNodes()}
              </TabsContent>
              <TabsContent value="distribution">
                <div>Load Distribution Visualization (To be implemented)</div>
              </TabsContent>
              <TabsContent value="rules">
                <div>Balancing Rules Configuration (To be implemented)</div>
              </TabsContent>
              <TabsContent value="monitoring">
                <div>Real-time Monitoring Dashboard (To be implemented)</div>
              </TabsContent>
              <TabsContent value="configuration">
                <div>Load Balancer Configuration (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LoadBalancer;