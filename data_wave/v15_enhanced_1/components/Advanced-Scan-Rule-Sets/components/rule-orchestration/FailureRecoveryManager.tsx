import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Shield, 
  Activity,
  Target,
  Clock,
  Play,
  Pause,
  Square,
  Settings,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Gauge,
  Brain,
  Robot,
  Lightbulb,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Eye,
  Plus,
  Download,
  Upload,
  Save
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useOrchestration } from '../../hooks/useOrchestration';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useReporting } from '../../hooks/useReporting';

// API Services
import { orchestrationAPI } from '../../services/orchestration-apis';
import { intelligenceAPI } from '../../services/intelligence-apis';

// Types
import type { 
  FailureEvent,
  RecoveryStrategy,
  RecoveryPolicy,
  RecoveryAttempt,
  FailurePattern,
  RecoveryMetrics,
  RecoveryAction,
  FailureAnalysis,
  RecoveryConfiguration,
  FailureThreshold,
  RecoveryState,
  FailureCategory,
  RecoveryMethod,
  FailureSeverity,
  RecoveryStatus
} from '../../types/orchestration.types';

// Utilities
import { workflowEngine } from '../../utils/workflow-engine';
import { aiHelpers } from '../../utils/ai-helpers';
import { performanceCalculator } from '../../utils/performance-calculator';

interface FailureRecoveryManagerProps {
  className?: string;
  onRecoveryInitiated?: (attempt: RecoveryAttempt) => void;
  onRecoveryCompleted?: (attempt: RecoveryAttempt) => void;
  onFailureDetected?: (failure: FailureEvent) => void;
}

interface RecoveryManagerState {
  failureEvents: FailureEvent[];
  recoveryAttempts: RecoveryAttempt[];
  activeRecoveries: RecoveryAttempt[];
  failurePatterns: FailurePattern[];
  recoveryPolicies: RecoveryPolicy[];
  metrics: RecoveryMetrics;
  configuration: RecoveryConfiguration;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalFailures: number;
  totalRecoveries: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRecoveryTime: number;
  recoverySuccessRate: number;
  criticalFailures: number;
  automaticRecoveries: number;
  manualRecoveries: number;
  systemReliability: number;
}

interface RecoveryViewState {
  currentView: 'dashboard' | 'failures' | 'policies' | 'patterns' | 'configuration' | 'analytics';
  selectedFailure?: FailureEvent;
  selectedRecovery?: RecoveryAttempt;
  selectedPattern?: FailurePattern;
  showActiveOnly: boolean;
  filterSeverity: string;
  filterCategory: string;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  autoRecovery: boolean;
  intelligentRecovery: boolean;
  realTimeMode: boolean;
  expertMode: boolean;
  selectedTimeRange: 'hour' | 'day' | 'week' | 'month';
}

const DEFAULT_VIEW_STATE: RecoveryViewState = {
  currentView: 'dashboard',
  showActiveOnly: false,
  filterSeverity: 'all',
  filterCategory: 'all',
  searchQuery: '',
  sortBy: 'timestamp',
  sortOrder: 'desc',
  autoRecovery: true,
  intelligentRecovery: true,
  realTimeMode: true,
  expertMode: false,
  selectedTimeRange: 'day'
};

const RECOVERY_STRATEGIES = [
  { id: 'retry', label: 'Retry with Backoff', description: 'Retry failed operation with exponential backoff' },
  { id: 'fallback', label: 'Fallback to Alternative', description: 'Switch to alternative resource or method' },
  { id: 'rollback', label: 'Rollback Changes', description: 'Revert to previous known good state' },
  { id: 'escalate', label: 'Escalate to Human', description: 'Notify operators for manual intervention' },
  { id: 'bypass', label: 'Bypass Failed Component', description: 'Continue execution without failed component' },
  { id: 'restart', label: 'Restart Service', description: 'Restart the failed service or component' },
  { id: 'scale', label: 'Scale Resources', description: 'Allocate additional resources to handle load' },
  { id: 'circuit_breaker', label: 'Circuit Breaker', description: 'Temporarily disable failed component' }
];

const FAILURE_CATEGORIES = [
  'network', 'resource', 'timeout', 'authentication', 'validation', 
  'dependency', 'configuration', 'data', 'system', 'external'
];

const FAILURE_SEVERITIES = [
  'low', 'medium', 'high', 'critical'
];

export const FailureRecoveryManager: React.FC<FailureRecoveryManagerProps> = ({
  className,
  onRecoveryInitiated,
  onRecoveryCompleted,
  onFailureDetected
}) => {
  // State Management
  const [viewState, setViewState] = useState<RecoveryViewState>(DEFAULT_VIEW_STATE);
  const [recoveryState, setRecoveryState] = useState<RecoveryManagerState>({
    failureEvents: [],
    recoveryAttempts: [],
    activeRecoveries: [],
    failurePatterns: [],
    recoveryPolicies: [],
    metrics: {} as RecoveryMetrics,
    configuration: {} as RecoveryConfiguration,
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalFailures: 0,
    totalRecoveries: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
    averageRecoveryTime: 0,
    recoverySuccessRate: 0,
    criticalFailures: 0,
    automaticRecoveries: 0,
    manualRecoveries: 0,
    systemReliability: 0
  });

  const [newPolicyDialogOpen, setNewPolicyDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [failureDetailsDialogOpen, setFailureDetailsDialogOpen] = useState(false);
  const [recoveryActionDialogOpen, setRecoveryActionDialogOpen] = useState(false);

  // Form States
  const [newPolicyForm, setNewPolicyForm] = useState({
    name: '',
    description: '',
    category: '',
    severity: 'medium' as FailureSeverity,
    strategy: 'retry' as RecoveryMethod,
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    timeout: 30000,
    enabled: true,
    conditions: [] as string[],
    actions: [] as RecoveryAction[]
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const recoveryIntervalRef = useRef<NodeJS.Timeout>();

  // Custom Hooks
  const {
    orchestrationJobs,
    executions,
    getMetrics,
    loading: orchestrationLoading
  } = useOrchestration();

  const {
    getInsights,
    analyzePerformance,
    predictOptimizations,
    loading: intelligenceLoading
  } = useIntelligence();

  const {
    generateReport,
    getAnalytics,
    loading: reportingLoading
  } = useReporting();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeMode) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/recovery`);
      
      wsRef.current.onopen = () => {
        console.log('Recovery WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Recovery WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Recovery WebSocket disconnected');
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
      case 'failure_detected':
        setRecoveryState(prev => ({
          ...prev,
          failureEvents: [...prev.failureEvents, data.failure],
          totalFailures: prev.totalFailures + 1,
          criticalFailures: data.failure.severity === 'critical' 
            ? prev.criticalFailures + 1 
            : prev.criticalFailures
        }));
        if (onFailureDetected) onFailureDetected(data.failure);
        
        // Auto-initiate recovery if enabled
        if (viewState.autoRecovery) {
          initiateRecovery(data.failure);
        }
        break;
        
      case 'recovery_initiated':
        setRecoveryState(prev => ({
          ...prev,
          recoveryAttempts: [...prev.recoveryAttempts, data.attempt],
          activeRecoveries: [...prev.activeRecoveries, data.attempt],
          totalRecoveries: prev.totalRecoveries + 1
        }));
        if (onRecoveryInitiated) onRecoveryInitiated(data.attempt);
        break;
        
      case 'recovery_completed':
        setRecoveryState(prev => ({
          ...prev,
          recoveryAttempts: prev.recoveryAttempts.map(attempt => 
            attempt.id === data.attempt.id ? data.attempt : attempt
          ),
          activeRecoveries: prev.activeRecoveries.filter(recovery => 
            recovery.id !== data.attempt.id
          ),
          successfulRecoveries: data.attempt.status === 'success' 
            ? prev.successfulRecoveries + 1 
            : prev.successfulRecoveries,
          failedRecoveries: data.attempt.status === 'failed' 
            ? prev.failedRecoveries + 1 
            : prev.failedRecoveries
        }));
        if (onRecoveryCompleted) onRecoveryCompleted(data.attempt);
        break;
        
      case 'pattern_detected':
        setRecoveryState(prev => ({
          ...prev,
          failurePatterns: [...prev.failurePatterns, data.pattern]
        }));
        break;
        
      case 'metrics_updated':
        setRecoveryState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [viewState.autoRecovery, onFailureDetected, onRecoveryInitiated, onRecoveryCompleted]);

  // Auto-recovery monitoring
  useEffect(() => {
    if (viewState.autoRecovery) {
      recoveryIntervalRef.current = setInterval(() => {
        monitorForFailures();
      }, 5000); // Every 5 seconds
    }

    return () => {
      if (recoveryIntervalRef.current) {
        clearInterval(recoveryIntervalRef.current);
      }
    };
  }, [viewState.autoRecovery]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setRecoveryState(prev => ({ ...prev, loading: true, error: null }));

      const [failuresData, recoveryData, patternsData, metricsData] = await Promise.all([
        orchestrationAPI.getFailureEvents({ 
          severity: viewState.filterSeverity !== 'all' ? viewState.filterSeverity : undefined,
          category: viewState.filterCategory !== 'all' ? viewState.filterCategory : undefined,
          timeRange: viewState.selectedTimeRange
        }),
        orchestrationAPI.getRecoveryAttempts({ limit: 100 }),
        intelligenceAPI.getFailurePatterns(),
        orchestrationAPI.getRecoveryMetrics()
      ]);

      setRecoveryState(prev => ({
        ...prev,
        failureEvents: failuresData.failures,
        recoveryAttempts: recoveryData.attempts,
        activeRecoveries: recoveryData.attempts.filter(attempt => attempt.status === 'in_progress'),
        failurePatterns: patternsData.patterns,
        metrics: metricsData,
        totalFailures: failuresData.total,
        totalRecoveries: recoveryData.total,
        successfulRecoveries: recoveryData.attempts.filter(a => a.status === 'success').length,
        failedRecoveries: recoveryData.attempts.filter(a => a.status === 'failed').length,
        criticalFailures: failuresData.failures.filter(f => f.severity === 'critical').length,
        automaticRecoveries: recoveryData.attempts.filter(a => a.type === 'automatic').length,
        manualRecoveries: recoveryData.attempts.filter(a => a.type === 'manual').length,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate derived metrics
      const successRate = recoveryData.total > 0 
        ? (recoveryData.attempts.filter(a => a.status === 'success').length / recoveryData.total) * 100
        : 0;
      
      const avgRecoveryTime = recoveryData.attempts.length > 0
        ? recoveryData.attempts.reduce((sum, attempt) => sum + (attempt.duration || 0), 0) / recoveryData.attempts.length
        : 0;

      setRecoveryState(prev => ({
        ...prev,
        recoverySuccessRate: successRate,
        averageRecoveryTime: avgRecoveryTime,
        systemReliability: Math.max(0, 100 - (failuresData.failures.length / 100) * 10)
      }));

    } catch (error) {
      console.error('Failed to refresh recovery data:', error);
      setRecoveryState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.filterSeverity, viewState.filterCategory, viewState.selectedTimeRange]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Recovery Functions
  const initiateRecovery = useCallback(async (failure: FailureEvent) => {
    try {
      const recoveryPolicy = findApplicablePolicy(failure);
      if (!recoveryPolicy) {
        console.warn('No applicable recovery policy found for failure:', failure);
        return;
      }

      const recoveryAttempt = await orchestrationAPI.initiateRecovery({
        failureId: failure.id,
        policyId: recoveryPolicy.id,
        strategy: recoveryPolicy.strategy,
        automatic: viewState.autoRecovery
      });

      setRecoveryState(prev => ({
        ...prev,
        recoveryAttempts: [...prev.recoveryAttempts, recoveryAttempt],
        activeRecoveries: [...prev.activeRecoveries, recoveryAttempt]
      }));

      if (onRecoveryInitiated) onRecoveryInitiated(recoveryAttempt);
    } catch (error) {
      console.error('Failed to initiate recovery:', error);
    }
  }, [viewState.autoRecovery, onRecoveryInitiated]);

  const findApplicablePolicy = useCallback((failure: FailureEvent): RecoveryPolicy | null => {
    return recoveryState.recoveryPolicies.find(policy => 
      policy.enabled &&
      policy.category === failure.category &&
      policy.severity === failure.severity
    ) || null;
  }, [recoveryState.recoveryPolicies]);

  const monitorForFailures = useCallback(async () => {
    try {
      const healthCheck = await orchestrationAPI.performHealthCheck();
      if (healthCheck.failures && healthCheck.failures.length > 0) {
        healthCheck.failures.forEach((failure: FailureEvent) => {
          if (viewState.autoRecovery) {
            initiateRecovery(failure);
          }
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }, [viewState.autoRecovery, initiateRecovery]);

  const handleCreatePolicy = useCallback(async () => {
    try {
      const newPolicy = await orchestrationAPI.createRecoveryPolicy(newPolicyForm);
      setRecoveryState(prev => ({
        ...prev,
        recoveryPolicies: [...prev.recoveryPolicies, newPolicy]
      }));
      setNewPolicyDialogOpen(false);
      resetNewPolicyForm();
    } catch (error) {
      console.error('Failed to create recovery policy:', error);
    }
  }, [newPolicyForm]);

  const handleManualRecovery = useCallback(async (failure: FailureEvent, strategy: RecoveryMethod) => {
    try {
      const recoveryAttempt = await orchestrationAPI.initiateRecovery({
        failureId: failure.id,
        strategy: strategy,
        automatic: false
      });

      setRecoveryState(prev => ({
        ...prev,
        recoveryAttempts: [...prev.recoveryAttempts, recoveryAttempt],
        activeRecoveries: [...prev.activeRecoveries, recoveryAttempt],
        manualRecoveries: prev.manualRecoveries + 1
      }));

      if (onRecoveryInitiated) onRecoveryInitiated(recoveryAttempt);
    } catch (error) {
      console.error('Failed to initiate manual recovery:', error);
    }
  }, [onRecoveryInitiated]);

  // Utility Functions
  const resetNewPolicyForm = useCallback(() => {
    setNewPolicyForm({
      name: '',
      description: '',
      category: '',
      severity: 'medium',
      strategy: 'retry',
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      timeout: 30000,
      enabled: true,
      conditions: [],
      actions: []
    });
  }, []);

  const getSeverityColor = useCallback((severity: FailureSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getStatusColor = useCallback((status: RecoveryStatus) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-blue-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  }, []);

  const getStatusIcon = useCallback((status: RecoveryStatus) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'cancelled': return <Square className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  }, []);

  // Filter and Search Functions
  const filteredFailures = useMemo(() => {
    let filtered = recoveryState.failureEvents;

    if (viewState.searchQuery) {
      filtered = filtered.filter(failure => 
        failure.message.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        failure.category.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.filterSeverity !== 'all') {
      filtered = filtered.filter(failure => failure.severity === viewState.filterSeverity);
    }

    if (viewState.filterCategory !== 'all') {
      filtered = filtered.filter(failure => failure.category === viewState.filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = viewState.sortBy === 'timestamp' ? new Date(a.timestamp).getTime() : a[viewState.sortBy as keyof FailureEvent];
      const bValue = viewState.sortBy === 'timestamp' ? new Date(b.timestamp).getTime() : b[viewState.sortBy as keyof FailureEvent];
      
      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [recoveryState.failureEvents, viewState.searchQuery, viewState.filterSeverity, viewState.filterCategory, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* System Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Reliability</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recoveryState.systemReliability.toFixed(1)}%</div>
            <Progress value={recoveryState.systemReliability} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Recoveries</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{recoveryState.activeRecoveries.length}</div>
            <p className="text-xs text-muted-foreground">
              {recoveryState.totalRecoveries} total attempts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {recoveryState.recoverySuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {recoveryState.successfulRecoveries}/{recoveryState.totalRecoveries} successful
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Failures</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{recoveryState.criticalFailures}</div>
            <p className="text-xs text-muted-foreground">
              {recoveryState.totalFailures} total failures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {recoveryState.criticalFailures > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Failures Detected</AlertTitle>
          <AlertDescription>
            {recoveryState.criticalFailures} critical failures requiring immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Recoveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Recovery Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recoveryState.activeRecoveries.slice(0, 5).map(recovery => (
              <div key={recovery.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(recovery.status)}
                  <div>
                    <div className="font-medium">{recovery.strategy}</div>
                    <div className="text-sm text-gray-500">
                      {recovery.failureMessage}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Attempt {recovery.attemptNumber}/{recovery.maxRetries}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.floor((Date.now() - new Date(recovery.startedAt).getTime()) / 1000)}s elapsed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Failures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Failures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredFailures.slice(0, 10).map(failure => (
                <div key={failure.id} className="flex items-center gap-3 p-2 text-sm border-l-2 border-l-red-300">
                  <Badge className={getSeverityColor(failure.severity)}>
                    {failure.severity}
                  </Badge>
                  <div className="flex-1">{failure.message}</div>
                  <div className="text-gray-500">
                    {new Date(failure.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
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
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Failure Recovery Manager</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  recoveryState.systemReliability > 95 ? 'bg-green-500' :
                  recoveryState.systemReliability > 85 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  Reliability: {recoveryState.systemReliability.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={recoveryState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${recoveryState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Switch
                checked={viewState.autoRecovery}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, autoRecovery: checked }))}
              />
              <span className="text-sm text-gray-600">Auto-recovery</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="failures" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Failures
                </TabsTrigger>
                <TabsTrigger value="policies" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Recovery Policies
                </TabsTrigger>
                <TabsTrigger value="patterns" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Failure Patterns
                </TabsTrigger>
                <TabsTrigger value="configuration" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="dashboard">
                {renderDashboard()}
              </TabsContent>
              <TabsContent value="failures">
                <div>Failure Management (Implementation continues...)</div>
              </TabsContent>
              <TabsContent value="policies">
                <div>Recovery Policies Management (Implementation continues...)</div>
              </TabsContent>
              <TabsContent value="patterns">
                <div>Failure Pattern Analysis (Implementation continues...)</div>
              </TabsContent>
              <TabsContent value="configuration">
                <div>Recovery Configuration (Implementation continues...)</div>
              </TabsContent>
              <TabsContent value="analytics">
                <div>Recovery Analytics (Implementation continues...)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Dialogs */}
        <Dialog open={newPolicyDialogOpen} onOpenChange={setNewPolicyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Recovery Policy</DialogTitle>
              <DialogDescription>
                Define automated recovery procedures for specific failure types
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policy-name">Policy Name</Label>
                  <Input 
                    id="policy-name" 
                    value={newPolicyForm.name}
                    onChange={(e) => setNewPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter policy name" 
                  />
                </div>
                <div>
                  <Label htmlFor="policy-strategy">Recovery Strategy</Label>
                  <Select 
                    value={newPolicyForm.strategy} 
                    onValueChange={(value) => setNewPolicyForm(prev => ({ ...prev, strategy: value as RecoveryMethod }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECOVERY_STRATEGIES.map(strategy => (
                        <SelectItem key={strategy.id} value={strategy.id}>
                          {strategy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewPolicyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePolicy}>
                  Create Policy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default FailureRecoveryManager;