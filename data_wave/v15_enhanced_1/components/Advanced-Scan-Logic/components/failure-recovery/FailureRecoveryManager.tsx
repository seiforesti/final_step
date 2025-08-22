"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Play, 
  Pause, 
  Settings, 
  Download,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Shield,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';

interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  type: 'automatic' | 'semi-automatic' | 'manual';
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  conditions: RecoveryCondition[];
  actions: RecoveryAction[];
  timeout: number; // in seconds
  maxRetries: number;
  fallbackStrategy?: string;
  metadata?: Record<string, any>;
}

interface RecoveryCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: string | number | boolean;
  logicalOperator?: 'AND' | 'OR';
}

interface RecoveryAction {
  id: string;
  type: 'retry' | 'restart' | 'fallback' | 'notify' | 'escalate' | 'custom';
  parameters: Record<string, any>;
  order: number;
  enabled: boolean;
}

interface RecoveryWorkflow {
  id: string;
  name: string;
  description: string;
  strategyId: string;
  status: 'active' | 'paused' | 'disabled';
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  estimatedCompletion: Date;
  progress: number;
  lastActivity: Date;
  metadata?: Record<string, any>;
}

interface RecoveryMetrics {
  totalRecoveries: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRecoveryTime: number;
  recoverySuccessRate: number;
  activeWorkflows: number;
  pendingActions: number;
}

interface FailureRecoveryManagerProps {
  strategies?: RecoveryStrategy[];
  workflows?: RecoveryWorkflow[];
  metrics?: RecoveryMetrics;
  onStrategyCreate?: (strategy: Omit<RecoveryStrategy, 'id'>) => void;
  onStrategyUpdate?: (id: string, updates: Partial<RecoveryStrategy>) => void;
  onStrategyDelete?: (id: string) => void;
  onWorkflowStart?: (strategyId: string, parameters?: Record<string, any>) => void;
  onWorkflowPause?: (workflowId: string) => void;
  onWorkflowResume?: (workflowId: string) => void;
  onWorkflowCancel?: (workflowId: string) => void;
  enableAdvancedFeatures?: boolean;
}

export const FailureRecoveryManager: React.FC<FailureRecoveryManagerProps> = ({
  strategies = [],
  workflows = [],
  metrics,
  onStrategyCreate,
  onStrategyUpdate,
  onStrategyDelete,
  onWorkflowStart,
  onWorkflowPause,
  onWorkflowResume,
  onWorkflowCancel,
  enableAdvancedFeatures = true
}) => {
  const [activeTab, setActiveTab] = useState('strategies');
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();
  const { hasPermission } = usePermissionCheck();

  const canViewRecovery = hasPermission({ action: 'read', resource: 'recovery' });
  const canManageRecovery = hasPermission({ action: 'manage', resource: 'recovery' });
  const canExecuteRecovery = hasPermission({ action: 'execute', resource: 'recovery' });
  const canCreateStrategies = hasPermission({ action: 'create', resource: 'strategy' });

  // Filter strategies based on current filters
  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy => {
      if (searchTerm && !strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !strategy.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterType !== 'all' && strategy.type !== filterType) return false;
      if (filterPriority !== 'all' && strategy.priority !== filterPriority) return false;
      return true;
    });
  }, [strategies, searchTerm, filterType, filterPriority]);

  // Filter workflows based on current filters
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      if (filterStatus !== 'all' && workflow.status !== filterStatus) return false;
      return true;
    });
  }, [workflows, filterStatus]);

  // Group strategies by type
  const strategiesByType = useMemo(() => {
    const groups = {
      automatic: 0,
      'semi-automatic': 0,
      manual: 0
    };
    
    strategies.forEach(strategy => {
      groups[strategy.type as keyof typeof groups]++;
    });
    
    return groups;
  }, [strategies]);

  // Group strategies by priority
  const strategiesByPriority = useMemo(() => {
    const groups = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    strategies.forEach(strategy => {
      groups[strategy.priority as keyof typeof groups]++;
    });
    
    return groups;
  }, [strategies]);

  // Get priority color
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Get type color
  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'automatic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'semi-automatic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manual':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disabled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Handle strategy creation
  const handleStrategyCreate = useCallback((strategyData: Omit<RecoveryStrategy, 'id'>) => {
    if (!canCreateStrategies) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create recovery strategies.",
        variant: "destructive"
      });
      return;
    }

    onStrategyCreate?.(strategyData);
    setShowCreateForm(false);
    
    toast({
      title: "Strategy Created",
      description: "Recovery strategy has been created successfully.",
      variant: "default"
    });
  }, [canCreateStrategies, onStrategyCreate, toast]);

  // Handle strategy update
  const handleStrategyUpdate = useCallback((id: string, updates: Partial<RecoveryStrategy>) => {
    if (!canManageRecovery) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update recovery strategies.",
        variant: "destructive"
      });
      return;
    }

    onStrategyUpdate?.(id, updates);
    
    toast({
      title: "Strategy Updated",
      description: "Recovery strategy has been updated successfully.",
      variant: "default"
    });
  }, [canManageRecovery, onStrategyUpdate, toast]);

  // Handle strategy deletion
  const handleStrategyDelete = useCallback((id: string) => {
    if (!canManageRecovery) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete recovery strategies.",
        variant: "destructive"
      });
      return;
    }

    onStrategyDelete?.(id);
    
    toast({
      title: "Strategy Deleted",
      description: "Recovery strategy has been deleted successfully.",
      variant: "default"
    });
  }, [canManageRecovery, onStrategyDelete, toast]);

  // Handle workflow start
  const handleWorkflowStart = useCallback((strategyId: string) => {
    if (!canExecuteRecovery) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to execute recovery workflows.",
        variant: "destructive"
      });
      return;
    }

    onWorkflowStart?.(strategyId);
    
    toast({
      title: "Workflow Started",
      description: "Recovery workflow has been started successfully.",
      variant: "default"
    });
  }, [canExecuteRecovery, onWorkflowStart, toast]);

  // Handle workflow pause/resume
  const handleWorkflowToggle = useCallback((workflowId: string, currentStatus: string) => {
    if (!canExecuteRecovery) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to control recovery workflows.",
        variant: "destructive"
      });
      return;
    }

    if (currentStatus === 'active') {
      onWorkflowPause?.(workflowId);
      toast({
        title: "Workflow Paused",
        description: "Recovery workflow has been paused.",
        variant: "default"
      });
    } else {
      onWorkflowResume?.(workflowId);
      toast({
        title: "Workflow Resumed",
        description: "Recovery workflow has been resumed.",
        variant: "default"
      });
    }
  }, [canExecuteRecovery, onWorkflowPause, onWorkflowResume, toast]);

  // Handle workflow cancellation
  const handleWorkflowCancel = useCallback((workflowId: string) => {
    if (!canExecuteRecovery) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to cancel recovery workflows.",
        variant: "destructive"
      });
      return;
    }

    onWorkflowCancel?.(workflowId);
    
    toast({
      title: "Workflow Cancelled",
      description: "Recovery workflow has been cancelled.",
      variant: "default"
    });
  }, [canExecuteRecovery, onWorkflowCancel, toast]);

  // Refresh data
  const refreshData = useCallback(() => {
    setLastRefresh(new Date());
    toast({
      title: "Data Refreshed",
      description: "Recovery data has been refreshed.",
      variant: "default"
    });
  }, [toast]);

  // Export data
  const exportData = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      strategies: strategies.length,
      workflows: workflows.length,
      filters: {
        type: filterType,
        priority: filterPriority,
        status: filterStatus
      },
      strategiesData: filteredStrategies,
      workflowsData: filteredWorkflows
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Recovery data has been exported successfully.",
      variant: "default"
    });
  }, [strategies, workflows, filteredStrategies, filteredWorkflows, filterType, filterPriority, filterStatus, toast]);

  if (!canViewRecovery) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to view failure recovery management.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Failure Recovery Manager</h2>
          <p className="text-muted-foreground">
            Manage recovery strategies and monitor recovery workflows
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="w-4 h-4 mr-1" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          
          {canCreateStrategies && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Strategy
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Strategies</p>
                <p className="text-2xl font-bold">{strategies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{metrics?.activeWorkflows || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{metrics?.recoverySuccessRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Recovery Time</p>
                <p className="text-2xl font-bold">{Math.round((metrics?.averageRecoveryTime || 0) / 60)}min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search strategies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="type-filter">Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority-filter">Filter by Priority</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status-filter">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-4">
          {/* Strategy Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Strategies by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(strategiesByType).map(([type, count]) => (
                    <div key={type} className="text-center">
                      <div className={`text-2xl font-bold ${getTypeColor(type).split(' ')[1]}`}>
                        {count}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">{type}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategies by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(strategiesByPriority).map(([priority, count]) => (
                    <div key={priority} className="text-center">
                      <div className={`text-2xl font-bold ${getPriorityColor(priority).split(' ')[1]}`}>
                        {count}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">{priority}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strategy List */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStrategies.length > 0 ? (
                <div className="space-y-3">
                  {filteredStrategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{strategy.name}</h4>
                            <Badge className={`border ${getTypeColor(strategy.type)}`}>
                              {strategy.type}
                            </Badge>
                            <Badge className={`border ${getPriorityColor(strategy.priority)}`}>
                              {strategy.priority}
                            </Badge>
                            <Badge variant={strategy.enabled ? "default" : "secondary"}>
                              {strategy.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {strategy.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Timeout: {strategy.timeout}s</span>
                            <span>Max Retries: {strategy.maxRetries}</span>
                            <span>Actions: {strategy.actions.length}</span>
                            <span>Conditions: {strategy.conditions.length}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {canExecuteRecovery && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWorkflowStart(strategy.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </Button>
                          )}
                          
                          {canManageRecovery && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStrategyUpdate(strategy.id, { enabled: !strategy.enabled })}
                              >
                                {strategy.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStrategy(strategy.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStrategyDelete(strategy.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p className="text-lg mb-2">No strategies found</p>
                  <p className="text-sm">
                    {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create your first recovery strategy'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredWorkflows.length > 0 ? (
                <div className="space-y-3">
                  {filteredWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{workflow.name}</h4>
                            <Badge className={`border ${getStatusColor(workflow.status)}`}>
                              {workflow.status}
                            </Badge>
                            <Badge variant="outline">
                              Step {workflow.currentStep}/{workflow.totalSteps}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {workflow.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Started: {workflow.startedAt.toLocaleTimeString()}</span>
                            <span>Progress: {workflow.progress}%</span>
                            <span>Last Activity: {workflow.lastActivity.toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        {canExecuteRecovery && (
                          <div className="flex items-center space-x-2">
                            {workflow.status === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWorkflowToggle(workflow.id, workflow.status)}
                              >
                                <Pause className="w-4 h-4 mr-1" />
                                Pause
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWorkflowToggle(workflow.id, workflow.status)}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Resume
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWorkflowCancel(workflow.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p className="text-lg mb-2">No workflows found</p>
                  <p className="text-sm">
                    {filterStatus !== 'all'
                      ? 'Try adjusting your status filter'
                      : 'Start a recovery workflow to see it here'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">Recovery Analytics</p>
                <p className="text-sm">Detailed recovery analytics and trend reporting will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Strategy Details Modal Placeholder */}
      {selectedStrategy && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Strategy Details</p>
              <p className="text-sm">Detailed strategy view and editing will be implemented here</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStrategy(null)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Strategy Form Placeholder */}
      {showCreateForm && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Create New Strategy</p>
              <p className="text-sm">Strategy creation form will be implemented here</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(false)}
                className="mt-4"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

