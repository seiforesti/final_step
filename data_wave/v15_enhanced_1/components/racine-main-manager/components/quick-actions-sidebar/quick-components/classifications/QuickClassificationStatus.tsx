/**
 * Quick Classification Status Component
 * ====================================
 * 
 * Enterprise-grade quick access component for monitoring classification status.
 * Provides real-time status updates and classification coverage insights.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tag, Activity, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Clock, Target, Database, FileText, RefreshCw, Eye, BarChart3, PieChart, Users, Shield, Star, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Import types and services
import type { 
  Classification, 
  ClassificationStatus,
  ClassificationCoverage,
  ClassificationInsight
} from '../../../../types/racine-core.types';

import { useClassifications } from '../../../../hooks/useClassifications';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';

interface QuickClassificationStatusProps {
  isVisible?: boolean;
  onClose?: () => void;
  classificationId?: string;
  className?: string;
}

interface StatusFilter {
  timeRange: '1h' | '24h' | '7d' | '30d';
  type: 'all' | 'pii' | 'financial' | 'health' | 'intellectual_property';
  status: 'all' | 'active' | 'inactive' | 'pending';
}

export const QuickClassificationStatus: React.FC<QuickClassificationStatusProps> = ({
  isVisible = true,
  onClose,
  classificationId,
  className = ''
}) => {
  // Hooks
  const {
    getClassifications,
    getClassificationStatus,
    getClassificationCoverage,
    getClassificationInsights,
    isLoading,
    error,
    classifications
  } = useClassifications();

  const { currentWorkspace } = useWorkspaceManagement();

  // State
  const [filter, setFilter] = useState<StatusFilter>({
    timeRange: '24h',
    type: 'all',
    status: 'all'
  });
  const [statusData, setStatusData] = useState<ClassificationStatus[]>([]);
  const [coverage, setCoverage] = useState<ClassificationCoverage | null>(null);
  const [insights, setInsights] = useState<ClassificationInsight[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load data
  useEffect(() => {
    if (isVisible) {
      loadStatusData();
    }
  }, [isVisible, filter]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !isVisible) return;

    const interval = setInterval(() => {
      loadStatusData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isVisible]);

  const loadStatusData = useCallback(async () => {
    try {
      const [status, coverageData, insightsData] = await Promise.all([
        getClassificationStatus(filter),
        getClassificationCoverage(currentWorkspace?.id),
        getClassificationInsights(filter.timeRange)
      ]);

      setStatusData(status);
      setCoverage(coverageData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load status data:', error);
      toast.error('Failed to load classification status');
    }
  }, [filter, currentWorkspace, getClassificationStatus, getClassificationCoverage, getClassificationInsights]);

  // Filter classifications
  const filteredClassifications = useMemo(() => {
    if (!classifications) return [];
    
    return classifications.filter(classification => {
      if (filter.type !== 'all' && classification.type !== filter.type) return false;
      if (filter.status !== 'all' && classification.status !== filter.status) return false;
      return true;
    });
  }, [classifications, filter]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!statusData.length) return { total: 0, active: 0, coverage: 0, issues: 0 };
    
    return {
      total: statusData.length,
      active: statusData.filter(s => s.status === 'active').length,
      coverage: coverage?.overallCoverage || 0,
      issues: statusData.filter(s => s.issues && s.issues.length > 0).length
    };
  }, [statusData, coverage]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Get trend color
  const getTrendColor = useCallback((trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`quick-classification-status ${className}`}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-cyan-50/50 to-blue-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Classification Status
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Monitor classification coverage and health
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

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{summaryStats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{summaryStats.active}</div>
              <div className="text-xs text-green-700">Active</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{summaryStats.coverage}%</div>
              <div className="text-xs text-blue-700">Coverage</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{summaryStats.issues}</div>
              <div className="text-xs text-orange-700">Issues</div>
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
                    value={filter.type}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pii">PII</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="intellectual_property">IP</SelectItem>
                    </SelectContent>
                  </Select>

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
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Coverage Overview */}
              {coverage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Classification Coverage
                  </h3>
                  
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Overall Coverage</span>
                      <span className="text-lg font-bold text-blue-600">
                        {coverage.overallCoverage}%
                      </span>
                    </div>
                    <Progress value={coverage.overallCoverage} className="h-2 mb-2" />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Classified Assets:</span>
                        <span className="font-medium">{coverage.classifiedAssets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Assets:</span>
                        <span className="font-medium">{coverage.totalAssets}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {coverage.byType && Object.entries(coverage.byType).map(([type, data]) => (
                      <div key={type} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {data.coverage}%
                          </span>
                        </div>
                        <Progress value={data.coverage} className="h-1" />
                        <div className="text-xs text-gray-500 mt-1">
                          {data.count} classifications
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Classification Status List */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Classifications Status
                </h3>

                {filteredClassifications.length > 0 ? (
                  <div className="space-y-2">
                    {filteredClassifications.map((classification) => {
                      const status = statusData.find(s => s.classificationId === classification.id);
                      
                      return (
                        <motion.div
                          key={classification.id}
                          layout
                          className="p-3 border rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-gray-900">
                                {classification.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {classification.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={`text-xs ${getStatusColor(classification.status)}`}
                              >
                                {classification.status}
                              </Badge>
                              {status?.trend && (
                                <div className={`flex items-center gap-1 ${getTrendColor(status.trend)}`}>
                                  {status.trend > 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : status.trend < 0 ? (
                                    <TrendingDown className="h-3 w-3" />
                                  ) : null}
                                  <span className="text-xs">
                                    {Math.abs(status.trend).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Level:</span>
                              <span className="font-medium">{classification.level}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Applied:</span>
                              <span className="font-medium">
                                {status?.appliedCount || 0} assets
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Accuracy:</span>
                              <span className="font-medium">
                                {status?.accuracy ? `${status.accuracy}%` : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {status?.issues && status.issues.length > 0 && (
                            <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                              <div className="flex items-center gap-1 mb-1">
                                <AlertTriangle className="h-3 w-3 text-orange-600" />
                                <span className="text-xs font-medium text-orange-900">
                                  {status.issues.length} Issue{status.issues.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="text-xs text-orange-700">
                                {status.issues[0]?.message}
                                {status.issues.length > 1 && ` (+${status.issues.length - 1} more)`}
                              </div>
                            </div>
                          )}

                          {status?.lastUpdate && (
                            <div className="mt-2 text-xs text-gray-500">
                              Last updated: {new Date(status.lastUpdate).toLocaleString()}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No classifications found</p>
                    <p className="text-xs">Try adjusting your filters</p>
                  </div>
                )}
              </div>

              {/* Insights */}
              {insights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Key Insights
                  </h3>
                  
                  <div className="space-y-2">
                    {insights.slice(0, 3).map((insight, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {insight.title}
                          </span>
                          <Badge 
                            variant={insight.severity === 'high' ? 'destructive' : 
                                   insight.severity === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {insight.description}
                        </p>
                        {insight.recommendation && (
                          <div className="text-xs text-blue-600">
                            💡 {insight.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Target className="h-3 w-3 mr-1" />
                  Optimize
                </Button>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickClassificationStatus;
