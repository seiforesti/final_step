/**
 * Quick Rule Status Component
 * ===========================
 * 
 * Enterprise-grade quick access component for monitoring scan rule status.
 * Provides real-time status updates, health monitoring, and performance insights.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertTriangle, Clock, Activity, Play, Pause, Square, RefreshCw, Eye, Settings, BarChart3, TrendingUp, TrendingDown, Zap, AlertCircle, Info, Search, Filter, Calendar, Timer, Database, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Import types and services
import type { 
  ScanRule, 
  ScanRuleStatus,
  ScanRuleExecution,
  RulePerformanceMetrics,
  RuleHealthMetrics
} from '../../../types/racine-core.types';

import { useScanRuleSets } from '../../../../hooks/useScanRuleSets';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';

interface QuickRuleStatusProps {
  isVisible?: boolean;
  onClose?: () => void;
  ruleId?: string;
  showAllRules?: boolean;
  className?: string;
}

interface StatusFilter {
  status: 'all' | 'active' | 'inactive' | 'error' | 'pending';
  timeRange: '1h' | '24h' | '7d' | '30d';
  category: 'all' | 'pii' | 'quality' | 'compliance' | 'security';
}

export const QuickRuleStatus: React.FC<QuickRuleStatusProps> = ({
  isVisible = true,
  onClose,
  ruleId,
  showAllRules = false,
  className = ''
}) => {
  // Hooks
  const {
    getRules,
    getRuleStatus,
    getRuleExecutions,
    getPerformanceMetrics,
    toggleRuleStatus,
    isLoading,
    error,
    rules,
    ruleStatuses
  } = useScanRuleSets();

  const { currentWorkspace } = useWorkspaceManagement();

  // State
  const [selectedRule, setSelectedRule] = useState<ScanRule | null>(null);
  const [filter, setFilter] = useState<StatusFilter>({
    status: 'all',
    timeRange: '24h',
    category: 'all'
  });
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [recentExecutions, setRecentExecutions] = useState<ScanRuleExecution[]>([]);
  const [performanceData, setPerformanceData] = useState<RulePerformanceMetrics | null>(null);

  // Load data
  useEffect(() => {
    if (isVisible) {
      loadRulesData();
      if (ruleId) {
        loadSpecificRule(ruleId);
      }
    }
  }, [isVisible, ruleId]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !isVisible) return;

    const interval = setInterval(() => {
      loadRulesData();
      if (selectedRule) {
        loadRuleDetails(selectedRule.id);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isVisible, selectedRule]);

  const loadRulesData = useCallback(async () => {
    try {
      await getRules({
        workspaceId: currentWorkspace?.id,
        includeStatus: true,
        ...filter
      });
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  }, [getRules, currentWorkspace, filter]);

  const loadSpecificRule = useCallback(async (id: string) => {
    try {
      const rule = rules?.find(r => r.id === id);
      if (rule) {
        setSelectedRule(rule);
        await loadRuleDetails(id);
      }
    } catch (error) {
      console.error('Failed to load specific rule:', error);
    }
  }, [rules]);

  const loadRuleDetails = useCallback(async (id: string) => {
    try {
      const [executions, metrics] = await Promise.all([
        getRuleExecutions(id, { limit: 10 }),
        getPerformanceMetrics(id, filter.timeRange)
      ]);
      setRecentExecutions(executions);
      setPerformanceData(metrics);
    } catch (error) {
      console.error('Failed to load rule details:', error);
    }
  }, [getRuleExecutions, getPerformanceMetrics, filter.timeRange]);

  // Handle rule action
  const handleRuleAction = useCallback(async (ruleId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      await toggleRuleStatus(ruleId, action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'inactive');
      toast.success(`Rule ${action}ed successfully`);
      loadRulesData();
    } catch (error) {
      toast.error(`Failed to ${action} rule`);
    }
  }, [toggleRuleStatus, loadRulesData]);

  // Get status color
  const getStatusColor = useCallback((status: ScanRuleStatus) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: ScanRuleStatus) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return Pause;
      case 'inactive': return Square;
      case 'error': return AlertTriangle;
      case 'pending': return Clock;
      default: return AlertCircle;
    }
  }, []);

  // Format metrics
  const formatMetric = useCallback((value: number, type: 'percentage' | 'duration' | 'count') => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return value > 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`;
      case 'count':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  }, []);

  // Filter rules
  const filteredRules = useMemo(() => {
    if (!rules) return [];
    
    return rules.filter(rule => {
      if (filter.status !== 'all' && rule.status !== filter.status) return false;
      if (filter.category !== 'all' && rule.type !== filter.category) return false;
      return true;
    });
  }, [rules, filter]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!rules) return { total: 0, active: 0, errors: 0, performance: 0 };
    
    return {
      total: rules.length,
      active: rules.filter(r => r.status === 'active').length,
      errors: rules.filter(r => r.status === 'error').length,
      performance: rules.reduce((acc, r) => acc + (r.lastExecutionTime || 0), 0) / rules.length
    };
  }, [rules]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`quick-rule-status ${className}`}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Rule Status
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Monitor scan rule performance and health
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'text-green-600' : 'text-gray-400'}
              >
                <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{summaryStats.total}</div>
              <div className="text-xs text-gray-600">Total Rules</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{summaryStats.active}</div>
              <div className="text-xs text-green-700">Active</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">{summaryStats.errors}</div>
              <div className="text-xs text-red-700">Errors</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {formatMetric(summaryStats.performance, 'duration')}
              </div>
              <div className="text-xs text-blue-700">Avg Time</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              
              {/* Filters */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={filter.status}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.timeRange}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, timeRange: value as any }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.category}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pii">PII Detection</SelectItem>
                      <SelectItem value="quality">Data Quality</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                {filteredRules.length > 0 ? (
                  filteredRules.map((rule) => {
                    const StatusIcon = getStatusIcon(rule.status);
                    const isSelected = selectedRule?.id === rule.id;
                    
                    return (
                      <motion.div
                        key={rule.id}
                        layout
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedRule(rule);
                          loadRuleDetails(rule.id);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(rule.status).split(' ')[0]}`} />
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {rule.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(rule.status)}`}
                            >
                              {rule.status}
                            </Badge>
                            <div className="flex gap-1">
                              {rule.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRuleAction(rule.id, 'pause');
                                  }}
                                >
                                  <Pause className="h-3 w-3" />
                                </Button>
                              )}
                              {(rule.status === 'inactive' || rule.status === 'paused') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRuleAction(rule.id, 'start');
                                  }}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="font-medium">{rule.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Priority:</span>
                            <span className="font-medium">{rule.priority}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Run:</span>
                            <span className="font-medium">
                              {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleTimeString() : 'Never'}
                            </span>
                          </div>
                        </div>
                        
                        {rule.lastExecutionTime && (
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-gray-600">Execution Time:</span>
                            <span className={`font-medium ${
                              rule.lastExecutionTime > 5000 ? 'text-red-600' : 
                              rule.lastExecutionTime > 2000 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {formatMetric(rule.lastExecutionTime, 'duration')}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No rules found</p>
                    <p className="text-xs">Try adjusting your filters</p>
                  </div>
                )}
              </div>

              {/* Selected Rule Details */}
              {selectedRule && recentExecutions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t"
                >
                  <h3 className="font-medium text-gray-900">Recent Executions</h3>
                  
                  <div className="space-y-2">
                    {recentExecutions.slice(0, 5).map((execution) => (
                      <div key={execution.id} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {new Date(execution.startTime).toLocaleString()}
                          </span>
                          <Badge 
                            variant={execution.status === 'completed' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {execution.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-gray-600">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{formatMetric(execution.duration, 'duration')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Records:</span>
                            <span>{formatMetric(execution.recordsProcessed, 'count')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Performance Metrics */}
              {selectedRule && performanceData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t"
                >
                  <h3 className="font-medium text-gray-900">Performance Metrics</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-700">Avg Response</span>
                        <Timer className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="text-sm font-bold text-blue-600 mt-1">
                        {formatMetric(performanceData.averageResponseTime, 'duration')}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700">Success Rate</span>
                        <Target className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="text-sm font-bold text-green-600 mt-1">
                        {formatMetric(performanceData.successRate, 'percentage')}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-700">Throughput</span>
                        <TrendingUp className="h-3 w-3 text-purple-600" />
                      </div>
                      <div className="text-sm font-bold text-purple-600 mt-1">
                        {formatMetric(performanceData.throughput, 'count')}/min
                      </div>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-orange-700">Error Rate</span>
                        <AlertTriangle className="h-3 w-3 text-orange-600" />
                      </div>
                      <div className="text-sm font-bold text-orange-600 mt-1">
                        {formatMetric(performanceData.errorRate, 'percentage')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickRuleStatus;
