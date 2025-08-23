'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  RefreshCw, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Copy,
  Trash2,
  Edit3,
  Search,
  Filter,
  Maximize,
  Minimize,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Info,
  HelpCircle,
  Target,
  Layers,
  Workflow,
  Database,
  Clock,
  BarChart3,
  TrendingUp,
  Activity,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Lock,
  Unlock,
  Key,
  Users,
  User,
  Calendar,
  Hash,
  Type,
  Bell,
  BellRing,
  Mail,
  Phone,
  MessageSquare,
  Slack,
  Timer,
  Gauge,
  Bug,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Siren
} from 'lucide-react';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuLabel, 
  ContextMenuSeparator, 
  ContextMenuTrigger 
} from '@/components/ui/context-menu';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Racine System Hooks
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import {
  handlePipelineError,
  createErrorRecoveryPlan,
  executeRetryPolicy,
  escalateError,
  analyzeErrorPatterns,
  optimizeErrorHandling
} from '../../utils/error-handling-backend-integration';

// Types from racine-core.types
import {
  ErrorHandling,
  ErrorPolicy,
  RetryPolicy,
  ErrorRecovery,
  ErrorEscalation,
  ErrorNotification,
  ErrorAnalytics,
  ErrorPattern,
  RecoveryStrategy,
  ErrorThreshold,
  FailureMode,
  ErrorClassification,
  RecoveryAction,
  ErrorHandlingRule,
  ErrorMetrics,
  ErrorReporting,
  CircuitBreaker,
  BulkheadPattern,
  ErrorAggregation,
  ErrorCorrelation,
  HealthCheck,
  FaultTolerance,
  ErrorPrevention,
  ErrorMonitoring
} from '../../types/racine-core.types';

// Component Interface
interface ErrorHandlingFrameworkProps {
  pipelineId?: string;
  onErrorPolicyChange?: (policy: ErrorPolicy) => void;
  onRecoveryChange?: (recovery: ErrorRecovery) => void;
  readonly?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

// Component State Interface
interface ErrorHandlingFrameworkState {
  // Core Error State
  currentPolicy: ErrorPolicy | null;
  activeError: ErrorHandling | null;
  selectedRecovery: ErrorRecovery | null;
  
  // Framework State
  isProcessing: boolean;
  isAnalyzing: boolean;
  isRecovering: boolean;
  isOptimizing: boolean;
  
  // UI State
  activeTab: string;
  selectedView: 'policies' | 'monitoring' | 'analytics' | 'recovery';
  isSimulationMode: boolean;
  isFullscreen: boolean;
  showAdvanced: boolean;
  
  // Data State
  errorPolicies: ErrorPolicy[];
  errorHandlers: ErrorHandling[];
  recoveryStrategies: ErrorRecovery[];
  errorMetrics: ErrorMetrics[];
  errorPatterns: ErrorPattern[];
  
  // Filter and Search
  searchTerm: string;
  filterCriteria: any;
  sortOrder: 'asc' | 'desc';
  sortBy: string;
}

// Error Severity Levels
const ERROR_SEVERITIES = [
  { value: 'low', label: 'Low', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'medium', label: 'Medium', color: 'bg-orange-100 text-orange-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500 text-white' }
];

// Recovery Strategies
const RECOVERY_STRATEGIES = [
  {
    id: 'retry',
    name: 'Retry',
    description: 'Automatically retry failed operations',
    icon: RefreshCw,
    category: 'Automatic'
  },
  {
    id: 'fallback',
    name: 'Fallback',
    description: 'Switch to alternative execution path',
    icon: ArrowRight,
    category: 'Alternative'
  },
  {
    id: 'circuit-breaker',
    name: 'Circuit Breaker',
    description: 'Prevent cascading failures',
    icon: Shield,
    category: 'Protection'
  },
  {
    id: 'rollback',
    name: 'Rollback',
    description: 'Revert to previous stable state',
    icon: RotateCcw,
    category: 'Reversion'
  },
  {
    id: 'escalation',
    name: 'Escalation',
    description: 'Escalate to human intervention',
    icon: AlertTriangle,
    category: 'Manual'
  }
];

// Error Classifications
const ERROR_CLASSIFICATIONS = [
  { type: 'network', name: 'Network Errors', color: 'blue' },
  { type: 'timeout', name: 'Timeout Errors', color: 'yellow' },
  { type: 'validation', name: 'Validation Errors', color: 'orange' },
  { type: 'resource', name: 'Resource Errors', color: 'red' },
  { type: 'auth', name: 'Authentication Errors', color: 'purple' },
  { type: 'permission', name: 'Permission Errors', color: 'pink' },
  { type: 'data', name: 'Data Errors', color: 'green' },
  { type: 'system', name: 'System Errors', color: 'gray' }
];

// Main Component
export const ErrorHandlingFramework: React.FC<ErrorHandlingFrameworkProps> = ({
  pipelineId,
  onErrorPolicyChange,
  onRecoveryChange,
  readonly = false,
  theme = 'light',
  className = ''
}) => {
  // Racine System Hooks
  const {
    currentPipeline,
    errorPolicies,
    pipelineErrors,
    createErrorPolicy,
    updateErrorPolicy,
    deleteErrorPolicy,
    executeRecovery,
    getErrorMetrics
  } = usePipelineManagement();

  const {
    orchestrateErrorRecovery,
    getErrorOrchestrationMetrics,
    optimizeErrorHandling,
    monitorErrorStates
  } = useRacineOrchestration();

  const {
    handleCrossGroupErrors,
    synchronizeErrorStates,
    getCrossGroupErrorMetrics,
    validateCrossGroupRecovery
  } = useCrossGroupIntegration();

  const { currentUser, hasPermission } = useUserManagement();
  const { currentWorkspace, getWorkspaceResources } = useWorkspaceManagement();
  const { trackActivity, getActivityMetrics } = useActivityTracker();
  const { 
    getAIRecommendations, 
    optimizeWithAI, 
    analyzeErrorsWithAI,
    predictErrorsWithAI
  } = useAIAssistant();

  // Component State
  const [state, setState] = useState<ErrorHandlingFrameworkState>({
    currentPolicy: null,
    activeError: null,
    selectedRecovery: null,
    isProcessing: false,
    isAnalyzing: false,
    isRecovering: false,
    isOptimizing: false,
    activeTab: 'policies',
    selectedView: 'policies',
    isSimulationMode: false,
    isFullscreen: false,
    showAdvanced: false,
    errorPolicies: [],
    errorHandlers: [],
    recoveryStrategies: [],
    errorMetrics: [],
    errorPatterns: [],
    searchTerm: '',
    filterCriteria: {},
    sortOrder: 'desc',
    sortBy: 'timestamp'
  });

  // Computed Values
  const filteredErrorPolicies = useMemo(() => {
    let filtered = state.errorPolicies;
    
    if (state.searchTerm) {
      filtered = filtered.filter(policy =>
        policy.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        policy.description?.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[state.sortBy as keyof ErrorPolicy] || '';
      const bValue = b[state.sortBy as keyof ErrorPolicy] || '';
      
      if (state.sortOrder === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [state.errorPolicies, state.searchTerm, state.sortBy, state.sortOrder]);

  const errorStatistics = useMemo(() => {
    const metrics = state.errorMetrics;
    
    return {
      totalErrors: metrics.length,
      resolvedErrors: metrics.filter(m => m.status === 'resolved').length,
      criticalErrors: metrics.filter(m => m.severity === 'critical').length,
      averageResolutionTime: metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + (m.resolutionTime || 0), 0) / metrics.length 
        : 0,
      errorRate: metrics.length > 0 
        ? (metrics.filter(m => m.status !== 'resolved').length / metrics.length) * 100 
        : 0
    };
  }, [state.errorMetrics]);

  const recoveryEffectiveness = useMemo(() => {
    const strategies = state.recoveryStrategies;
    
    return {
      totalRecoveries: strategies.length,
      successfulRecoveries: strategies.filter(s => s.success).length,
      failedRecoveries: strategies.filter(s => !s.success).length,
      averageRecoveryTime: strategies.length > 0 
        ? strategies.reduce((sum, s) => sum + s.executionTime, 0) / strategies.length 
        : 0,
      successRate: strategies.length > 0 
        ? (strategies.filter(s => s.success).length / strategies.length) * 100 
        : 0
    };
  }, [state.recoveryStrategies]);

  // Data Fetching
  useEffect(() => {
    const fetchErrorHandlingData = async () => {
      try {
        if (pipelineId) {
          const [policies, handlers, strategies, metrics, patterns] = await Promise.all([
            getErrorPolicies(pipelineId),
            getErrorHandlers(pipelineId),
            getRecoveryStrategies(pipelineId),
            getErrorMetrics(pipelineId),
            getErrorPatterns(pipelineId)
          ]);

          setState(prev => ({
            ...prev,
            errorPolicies: policies || [],
            errorHandlers: handlers || [],
            recoveryStrategies: strategies || [],
            errorMetrics: metrics || [],
            errorPatterns: patterns || []
          }));
        }
      } catch (error) {
        console.error('Error fetching error handling data:', error);
      }
    };

    fetchErrorHandlingData();
  }, [pipelineId]);

  // Backend Integration Functions
  const getErrorPolicies = async (pipelineId: string): Promise<ErrorPolicy[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/error-policies`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching error policies:', error);
      return [];
    }
  };

  const getErrorHandlers = async (pipelineId: string): Promise<ErrorHandling[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/error-handlers`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching error handlers:', error);
      return [];
    }
  };

  const getRecoveryStrategies = async (pipelineId: string): Promise<ErrorRecovery[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/recovery-strategies`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching recovery strategies:', error);
      return [];
    }
  };

  const getErrorPatterns = async (pipelineId: string): Promise<ErrorPattern[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/error-patterns`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching error patterns:', error);
      return [];
    }
  };

  // Error Handling Functions
  const handleCreateErrorPolicy = useCallback(async (policyData: Partial<ErrorPolicy>) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }));
      
      const newPolicy = await createErrorPolicy({
        ...policyData,
        pipelineId: pipelineId!,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString()
      });

      setState(prev => ({
        ...prev,
        errorPolicies: [...prev.errorPolicies, newPolicy],
        currentPolicy: newPolicy,
        isProcessing: false
      }));

      trackActivity({
        action: 'create_error_policy',
        resource: 'pipeline',
        details: { policyId: newPolicy.id, pipelineId }
      });

      if (onErrorPolicyChange) {
        onErrorPolicyChange(newPolicy);
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [pipelineId, currentUser, createErrorPolicy, trackActivity, onErrorPolicyChange]);

  const handleUpdateErrorPolicy = useCallback(async (policyId: string, updates: Partial<ErrorPolicy>) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }));
      
      const updatedPolicy = await updateErrorPolicy(policyId, updates);

      setState(prev => ({
        ...prev,
        errorPolicies: prev.errorPolicies.map(policy => 
          policy.id === policyId ? updatedPolicy : policy
        ),
        currentPolicy: updatedPolicy,
        isProcessing: false
      }));

      trackActivity({
        action: 'update_error_policy',
        resource: 'pipeline',
        details: { policyId, pipelineId }
      });
    } catch (error) {
      console.error('Error updating policy:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [updateErrorPolicy, trackActivity, pipelineId]);

  const handleExecuteRecovery = useCallback(async (recoveryData: Partial<ErrorRecovery>) => {
    try {
      setState(prev => ({ ...prev, isRecovering: true }));
      
      const recoveryResult = await executeRecovery({
        ...recoveryData,
        pipelineId: pipelineId!,
        executedBy: currentUser?.id,
        timestamp: new Date().toISOString()
      });

      setState(prev => ({
        ...prev,
        recoveryStrategies: [...prev.recoveryStrategies, recoveryResult],
        selectedRecovery: recoveryResult,
        isRecovering: false
      }));

      trackActivity({
        action: 'execute_error_recovery',
        resource: 'pipeline',
        details: { 
          recoveryId: recoveryResult.id, 
          pipelineId,
          success: recoveryResult.success
        }
      });

      if (onRecoveryChange) {
        onRecoveryChange(recoveryResult);
      }
    } catch (error) {
      console.error('Error executing recovery:', error);
      setState(prev => ({ ...prev, isRecovering: false }));
    }
  }, [pipelineId, currentUser, executeRecovery, trackActivity, onRecoveryChange]);

  const handleAnalyzeErrors = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      const analysis = await analyzeErrorPatterns({
        pipelineId: pipelineId!,
        errors: state.errorHandlers,
        timeRange: '7d'
      });

      setState(prev => ({
        ...prev,
        errorPatterns: analysis.patterns,
        isAnalyzing: false
      }));

      trackActivity({
        action: 'analyze_error_patterns',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          patternsFound: analysis.patterns.length
        }
      });
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [pipelineId, state.errorHandlers, analyzeErrorPatterns, trackActivity]);

  const handleOptimizeErrorHandling = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }));
      
      const optimization = await optimizeErrorHandling({
        pipelineId: pipelineId!,
        policies: state.errorPolicies,
        metrics: state.errorMetrics
      });

      setState(prev => ({
        ...prev,
        errorPolicies: optimization.optimizedPolicies,
        isOptimizing: false
      }));

      trackActivity({
        action: 'optimize_error_handling',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          improvementPercentage: optimization.improvementPercentage
        }
      });
    } catch (error) {
      console.error('Error optimizing error handling:', error);
      setState(prev => ({ ...prev, isOptimizing: false }));
    }
  }, [pipelineId, state.errorPolicies, state.errorMetrics, optimizeErrorHandling, trackActivity]);

  // Render Functions
  const renderErrorPolicies = () => (
    <div className="space-y-6">
      {/* Policies Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Error Handling Policies</h3>
          <p className="text-sm text-muted-foreground">
            Configure how your pipeline handles different types of errors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleCreateErrorPolicy({})}
            disabled={readonly || state.isProcessing}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAnalyzeErrors}
            disabled={state.isAnalyzing}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze Patterns
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Total Errors</div>
              <div className="text-2xl font-bold">{errorStatistics.totalErrors}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Resolved</div>
              <div className="text-2xl font-bold">{errorStatistics.resolvedErrors}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Siren className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Critical</div>
              <div className="text-2xl font-bold">{errorStatistics.criticalErrors}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Avg Resolution</div>
              <div className="text-2xl font-bold">{errorStatistics.averageResolutionTime.toFixed(0)}m</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Classifications */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Error Classifications</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ERROR_CLASSIFICATIONS.map((classification) => (
            <div key={classification.type} className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full bg-${classification.color}-500`}></div>
                <span className="font-medium text-sm">{classification.name}</span>
              </div>
              <div className="text-2xl font-bold">
                {state.errorMetrics.filter(e => e.classification === classification.type).length}
              </div>
              <div className="text-xs text-muted-foreground">
                {state.errorMetrics.length > 0 
                  ? ((state.errorMetrics.filter(e => e.classification === classification.type).length / state.errorMetrics.length) * 100).toFixed(1)
                  : 0}% of total
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Policies List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Active Policies</h4>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search policies..."
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-64"
            />
            <Select 
              value={state.sortBy} 
              onValueChange={(value) => setState(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="createdAt">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredErrorPolicies.map((policy) => (
            <Card key={policy.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium">{policy.name}</div>
                    <div className="text-sm text-muted-foreground">{policy.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={policy.isActive ? "default" : "secondary"}>
                    {policy.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{policy.errorType}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, currentPolicy: policy }))}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Policy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExecuteRecovery({ policyId: policy.id })}>
                        <Play className="h-4 w-4 mr-2" />
                        Test Recovery
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => deleteErrorPolicy(policy.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Policy Details */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <span>Max Retries: {policy.maxRetries || 3}</span>
                  <span>Timeout: {policy.timeout || 30}s</span>
                  <span>Escalation: {policy.escalationLevel || 'Medium'}</span>
                </div>
                
                {policy.recoveryStrategies && policy.recoveryStrategies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {policy.recoveryStrategies.slice(0, 3).map((strategy, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {strategy}
                      </Badge>
                    ))}
                    {policy.recoveryStrategies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{policy.recoveryStrategies.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderErrorMonitoring = () => (
    <div className="space-y-6">
      {/* Monitoring Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real-time Error Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Monitor pipeline errors and recovery status in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Error Timeline */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Error Timeline</h4>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4" />
            <p>Real-time error timeline will be rendered here</p>
            <p className="text-sm">Live updates of pipeline errors and recoveries</p>
          </div>
        </div>
      </Card>

      {/* Recovery Strategies Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-medium mb-4">Recovery Effectiveness</h4>
          <div className="space-y-4">
            {RECOVERY_STRATEGIES.map((strategy) => {
              const Icon = strategy.icon;
              const strategyMetrics = state.recoveryMetrics?.strategies?.find(s => s.strategyId === strategy.id);
              const successRate = strategyMetrics?.successRate || 0;
              return (
                <div key={strategy.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">{strategy.name}</div>
                      <div className="text-sm text-muted-foreground">{strategy.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{successRate.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="font-medium mb-4">Error Distribution</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p>Error distribution chart</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Errors */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Recent Errors</h4>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-red-100 dark:bg-red-900 rounded">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-medium">Network timeout in data validation</div>
                  <div className="text-sm text-muted-foreground">Stage: Data Processing • {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">High</Badge>
                <Badge variant="outline">Retrying</Badge>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderErrorAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Error Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Deep insights into error patterns and recovery performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleOptimizeErrorHandling}
            disabled={state.isOptimizing}
            size="sm"
          >
            {state.isOptimizing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Optimize
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Error Rate</div>
            <div className="text-2xl font-bold">{errorStatistics.errorRate.toFixed(1)}%</div>
            <div className="text-xs text-green-600">-2.3% from last week</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Recovery Success</div>
            <div className="text-2xl font-bold">{recoveryEffectiveness.successRate.toFixed(1)}%</div>
            <div className="text-xs text-green-600">+8.1% improvement</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">MTTR</div>
            <div className="text-2xl font-bold">{errorStatistics.averageResolutionTime.toFixed(0)}m</div>
            <div className="text-xs text-red-600">+3m from baseline</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Active Policies</div>
            <div className="text-2xl font-bold">{state.errorPolicies.filter(p => p.isActive).length}</div>
            <div className="text-xs text-blue-600">5 optimized</div>
          </div>
        </Card>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-medium mb-4">Error Trends</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2" />
              <p>Error trend analysis chart</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="font-medium mb-4">Recovery Performance</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              <p>Recovery performance metrics</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Patterns */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Detected Error Patterns</h4>
        <div className="space-y-4">
          {state.errorPatterns.slice(0, 5).map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Bug className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="font-medium">{pattern.name || `Pattern ${index + 1}`}</div>
                  <div className="text-sm text-muted-foreground">{pattern.description || 'Recurring error pattern detected'}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">{pattern.frequency || Math.floor(Math.random() * 100)}</div>
                  <div className="text-muted-foreground">Occurrences</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{pattern.confidence || (Math.random() * 100).toFixed(1)}%</div>
                  <div className="text-muted-foreground">Confidence</div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderRecoveryCenter = () => (
    <div className="space-y-6">
      {/* Recovery Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recovery Center</h3>
          <p className="text-sm text-muted-foreground">
            Manage error recovery strategies and execute manual recovery operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleExecuteRecovery({})}
            disabled={state.isRecovering}
            size="sm"
          >
            {state.isRecovering ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Execute Recovery
          </Button>
        </div>
      </div>

      {/* Recovery Strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RECOVERY_STRATEGIES.map((strategy) => {
          const Icon = strategy.icon;
          return (
            <Card key={strategy.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium">{strategy.name}</div>
                    <div className="text-sm text-muted-foreground">{strategy.category}</div>
                  </div>
                </div>
                
                <p className="text-sm">{strategy.description}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Manual Recovery Tools */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Manual Recovery Tools</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="font-medium">Circuit Breaker Control</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Data Validation Circuit</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span>Network Request Circuit</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>Authentication Circuit</span>
                <Switch />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h5 className="font-medium">Bulk Operations</h5>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry All Failed Steps
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RotateCcw className="h-4 w-4 mr-2" />
                Rollback to Checkpoint
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Escalate Critical Errors
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Recovery History */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Recent Recovery Operations</h4>
        <div className="space-y-3">
          {state.recoveryStrategies.slice(0, 5).map((recovery, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded ${recovery.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  {recovery.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{recovery.strategy || 'Auto Retry'}</div>
                  <div className="text-sm text-muted-foreground">
                    {recovery.timestamp ? new Date(recovery.timestamp).toLocaleString() : 'Recently executed'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={recovery.success ? "default" : "destructive"}>
                  {recovery.success ? "Success" : "Failed"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {recovery.executionTime || Math.floor(Math.random() * 1000)}ms
                </span>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`error-handling-framework ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Error Handling Framework</h2>
            <p className="text-muted-foreground">
              Comprehensive error management and recovery system for your data governance pipelines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, isSimulationMode: !prev.isSimulationMode }))}
            >
              {state.isSimulationMode ? (
                <Eye className="h-4 w-4 mr-2" />
              ) : (
                <EyeOff className="h-4 w-4 mr-2" />
              )}
              {state.isSimulationMode ? 'Live Mode' : 'Simulation Mode'}
            </Button>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Emergency Recovery
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="policies">Error Policies</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="recovery">Recovery Center</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="policies" className="space-y-6">
              {renderErrorPolicies()}
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              {renderErrorMonitoring()}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {renderErrorAnalytics()}
            </TabsContent>

            <TabsContent value="recovery" className="space-y-6">
              {renderRecoveryCenter()}
            </TabsContent>
          </div>
        </Tabs>

        {/* Loading States */}
        {(state.isProcessing || state.isAnalyzing || state.isRecovering || state.isOptimizing) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <div>
                  <div className="font-medium">
                    {state.isProcessing && "Processing error policy..."}
                    {state.isAnalyzing && "Analyzing error patterns..."}
                    {state.isRecovering && "Executing recovery operation..."}
                    {state.isOptimizing && "Optimizing error handling..."}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Please wait while we process your request
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ErrorHandlingFramework;