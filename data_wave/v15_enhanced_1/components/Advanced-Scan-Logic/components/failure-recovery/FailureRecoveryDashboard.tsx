"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Play, Pause, Settings, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';

interface FailureRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  failureType: 'timeout' | 'error' | 'resource' | 'dependency' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'mitigated' | 'investigating';
  timestamp: Date;
  lastAttempt: Date;
  attempts: number;
  maxAttempts: number;
  recoveryStrategy: 'retry' | 'fallback' | 'manual' | 'auto';
  description: string;
  metadata?: Record<string, any>;
}

interface RecoveryMetrics {
  totalFailures: number;
  resolvedFailures: number;
  activeFailures: number;
  recoveryRate: number;
  averageRecoveryTime: number;
  criticalFailures: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface FailureRecoveryDashboardProps {
  failures?: FailureRecord[];
  metrics?: RecoveryMetrics;
  onFailureSelect?: (failureId: string) => void;
  onRecoveryAction?: (failureId: string, action: string) => void;
  enableAutoRecovery?: boolean;
  refreshInterval?: number;
}

export const FailureRecoveryDashboard: React.FC<FailureRecoveryDashboardProps> = ({
  failures = [],
  metrics,
  onFailureSelect,
  onRecoveryAction,
  enableAutoRecovery = true,
  refreshInterval = 30000
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRecoveryEnabled, setAutoRecoveryEnabled] = useState(enableAutoRecovery);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();
  const { hasPermission } = usePermissionCheck();

  const canViewFailures = hasPermission({ action: 'read', resource: 'failure' });
  const canManageFailures = hasPermission({ action: 'manage', resource: 'failure' });
  const canExecuteRecovery = hasPermission({ action: 'execute', resource: 'recovery' });

  // Filter failures based on current filters
  const filteredFailures = useMemo(() => {
    return failures.filter(failure => {
      if (selectedSeverity !== 'all' && failure.severity !== selectedSeverity) return false;
      if (selectedStatus !== 'all' && failure.status !== selectedStatus) return false;
      return true;
    });
  }, [failures, selectedSeverity, selectedStatus]);

  // Group failures by severity
  const failuresBySeverity = useMemo(() => {
    const groups = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    failures.forEach(failure => {
      groups[failure.severity as keyof typeof groups]++;
    });
    
    return groups;
  }, [failures]);

  // Group failures by status
  const failuresByStatus = useMemo(() => {
    const groups = {
      active: 0,
      investigating: 0,
      mitigated: 0,
      resolved: 0
    };
    
    failures.forEach(failure => {
      groups[failure.status as keyof typeof groups]++;
    });
    
    return groups;
  }, [failures]);

  // Calculate recovery progress
  const recoveryProgress = useMemo(() => {
    if (!metrics) return 0;
    return metrics.totalFailures > 0 ? (metrics.resolvedFailures / metrics.totalFailures) * 100 : 0;
  }, [metrics]);

  // Get severity color
  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
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

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mitigated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Handle recovery action
  const handleRecoveryAction = useCallback((failureId: string, action: string) => {
    if (!canExecuteRecovery) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to execute recovery actions.",
        variant: "destructive"
      });
      return;
    }

    onRecoveryAction?.(failureId, action);
    
    toast({
      title: "Recovery Action Executed",
      description: `Action '${action}' has been executed for failure ${failureId}.`,
      variant: "default"
    });
  }, [canExecuteRecovery, onRecoveryAction, toast]);

  // Toggle auto recovery
  const toggleAutoRecovery = useCallback(() => {
    if (!canManageFailures) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage auto recovery settings.",
        variant: "destructive"
      });
      return;
    }

    setAutoRecoveryEnabled(prev => !prev);
    
    toast({
      title: "Auto Recovery Updated",
      description: `Auto recovery has been ${!autoRecoveryEnabled ? 'enabled' : 'disabled'}.`,
      variant: "default"
    });
  }, [canManageFailures, autoRecoveryEnabled, toast]);

  // Refresh data
  const refreshData = useCallback(() => {
    setLastRefresh(new Date());
    toast({
      title: "Data Refreshed",
      description: "Failure recovery data has been refreshed.",
      variant: "default"
    });
  }, [toast]);

  // Export failures data
  const exportFailures = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalFailures: failures.length,
      filteredCount: filteredFailures.length,
      filters: {
        severity: selectedSeverity,
        status: selectedStatus
      },
      failures: filteredFailures
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failures-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Failures Exported",
      description: "Failure recovery data has been exported successfully.",
      variant: "default"
    });
  }, [failures, filteredFailures, selectedSeverity, selectedStatus, toast]);

  // Auto-refresh effect
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refreshData]);

  if (!canViewFailures) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to view failure recovery data.</p>
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
          <h2 className="text-2xl font-bold">Failure Recovery Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage workflow failures and recovery processes
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
          
          <Button
            variant={autoRecoveryEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={toggleAutoRecovery}
            disabled={!canManageFailures}
          >
            {autoRecoveryEnabled ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            Auto Recovery {autoRecoveryEnabled ? 'ON' : 'OFF'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportFailures}>
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
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Failures</p>
                <p className="text-2xl font-bold">{failures.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Failures</p>
                <p className="text-2xl font-bold">{failuresByStatus.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recovery Rate</p>
                <p className="text-2xl font-bold">{metrics?.recoveryRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{failuresBySeverity.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Progress */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Recovery Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Recovery Progress</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.resolvedFailures} of {metrics.totalFailures} resolved
                </span>
              </div>
              <Progress value={recoveryProgress} className="w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{metrics.resolvedFailures}</div>
                  <div className="text-muted-foreground">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">{metrics.activeFailures}</div>
                  <div className="text-muted-foreground">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {Math.round(metrics.averageRecoveryTime)}min
                  </div>
                  <div className="text-muted-foreground">Avg Recovery Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{metrics.criticalFailures}</div>
                  <div className="text-muted-foreground">Critical</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Severity</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="investigating">Investigating</option>
                  <option value="mitigated">Mitigated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground">
                  Last refresh: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Failures by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(failuresBySeverity).map(([severity, count]) => (
                  <div key={severity} className="text-center">
                    <div className={`text-2xl font-bold ${getSeverityColor(severity).split(' ')[1]}`}>
                      {count}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">{severity}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Failures by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(failuresByStatus).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className={`text-2xl font-bold ${getStatusColor(status).split(' ')[1]}`}>
                      {count}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">{status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failure List</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFailures.length > 0 ? (
                <div className="space-y-3">
                  {filteredFailures.map((failure) => (
                    <div
                      key={failure.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                      onClick={() => onFailureSelect?.(failure.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{failure.workflowName}</h4>
                            <Badge className={`border ${getSeverityColor(failure.severity)}`}>
                              {failure.severity}
                            </Badge>
                            <Badge className={`border ${getStatusColor(failure.status)}`}>
                              {failure.status}
                            </Badge>
                            <Badge variant="outline">
                              {failure.failureType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {failure.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Attempts: {failure.attempts}/{failure.maxAttempts}</span>
                            <span>Strategy: {failure.recoveryStrategy}</span>
                            <span>Last: {failure.lastAttempt.toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        {canExecuteRecovery && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecoveryAction(failure.id, 'retry');
                              }}
                            >
                              Retry
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecoveryAction(failure.id, 'investigate');
                              }}
                            >
                              Investigate
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p className="text-lg mb-2">No failures found</p>
                  <p className="text-sm">
                    {selectedSeverity !== 'all' || selectedStatus !== 'all'
                      ? 'Try adjusting your filters'
                      : 'All systems are running smoothly'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">Recovery Management</p>
                <p className="text-sm">Advanced recovery controls and strategies will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">Failure Analytics</p>
                <p className="text-sm">Detailed failure analysis and trend reporting will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Health Alert */}
      {metrics && metrics.systemHealth !== 'healthy' && (
        <Alert className={metrics.systemHealth === 'critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>System Health Alert:</strong> The system is currently experiencing{' '}
            {metrics.systemHealth === 'critical' ? 'critical issues' : 'warning conditions'}.{' '}
            Please review active failures and take appropriate action.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

