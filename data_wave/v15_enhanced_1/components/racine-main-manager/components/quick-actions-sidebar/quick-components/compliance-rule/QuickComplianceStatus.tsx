'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown, Activity, RefreshCw, Play, Pause, Filter, Search, Calendar, Clock, BarChart3, Settings, Eye, AlertCircle, Info, ArrowUpRight, ArrowDownRight, Target, Database, Users, Flag, Zap, Star, Circle, X } from 'lucide-react';

// Import hooks and services
import { useComplianceRules as useComplianceRule } from '../../../../hooks/useComplianceRules';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

// Import types
import {
  ComplianceStatus,
  ComplianceMetric,
  ComplianceStandard,
  ComplianceViolation,
  ComplianceAlert,
} from '../../../../types/racine-core.types';

interface QuickComplianceStatusProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface StatusFilter {
  timeRange: '1h' | '24h' | '7d' | '30d';
  standards: string[];
  severity: 'all' | 'low' | 'medium' | 'high' | 'critical';
  status: 'all' | 'compliant' | 'non-compliant' | 'warning';
}

const QuickComplianceStatus: React.FC<QuickComplianceStatusProps> = ({
  isVisible,
  onClose,
  className = '',
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filters, setFilters] = useState<StatusFilter>({
    timeRange: '24h',
    standards: [],
    severity: 'all',
    status: 'all',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('');

  // Hooks
  const {
    complianceStatus,
    complianceMetrics,
    complianceStandards,
    complianceAlerts,
    getComplianceStatus,
    refreshComplianceData,
    loading: complianceLoading,
  } = useComplianceRule();

  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Computed values
  const overallComplianceScore = useMemo(() => {
    if (!complianceMetrics) return 0;
    return complianceMetrics.overallScore || 0;
  }, [complianceMetrics]);

  const filteredAlerts = useMemo(() => {
    if (!complianceAlerts) return [];
    return complianceAlerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = filters.severity === 'all' || alert.severity === filters.severity;
      const matchesStandard = !selectedStandard || alert.standardId === selectedStandard;
      return matchesSearch && matchesSeverity && matchesStandard;
    });
  }, [complianceAlerts, searchTerm, filters.severity, selectedStandard]);

  const statusSummary = useMemo(() => {
    if (!complianceStatus) return { compliant: 0, nonCompliant: 0, warning: 0, total: 0 };
    
    return complianceStatus.reduce((acc, status) => {
      acc.total += 1;
      if (status.status === 'compliant') acc.compliant += 1;
      else if (status.status === 'non-compliant') acc.nonCompliant += 1;
      else if (status.status === 'warning') acc.warning += 1;
      return acc;
    }, { compliant: 0, nonCompliant: 0, warning: 0, total: 0 });
  }, [complianceStatus]);

  // Effects
  useEffect(() => {
    if (isVisible && currentUser) {
      trackActivity({
        action: 'quick_compliance_status_opened',
        component: 'QuickComplianceStatus',
        metadata: { workspace: currentWorkspace?.id },
      });
      refreshData();
    }
  }, [isVisible, currentUser, trackActivity, currentWorkspace]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isVisible) {
      interval = setInterval(() => {
        refreshData();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isVisible]);

  // Handlers
  const refreshData = useCallback(async () => {
    try {
      await refreshComplianceData();
    } catch (error) {
      console.error('Failed to refresh compliance data:', error);
    }
  }, [refreshComplianceData]);

  const handleFilterChange = useCallback((key: keyof StatusFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const renderOverviewTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Overall Score */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Overall Compliance</h3>
              <p className="text-sm text-blue-600">Current workspace status</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">{overallComplianceScore}%</div>
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              {overallComplianceScore >= 90 ? (
                <TrendingUp className="h-4 w-4" />
              ) : overallComplianceScore >= 70 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span>
                {overallComplianceScore >= 90 ? 'Excellent' : 
                 overallComplianceScore >= 70 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </div>
        </div>
        <Progress value={overallComplianceScore} className="h-3" />
      </motion.div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {statusSummary.compliant}
                </div>
                <div className="text-sm text-green-600">Compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-700">
                  {statusSummary.nonCompliant}
                </div>
                <div className="text-sm text-red-600">Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {filteredAlerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                      <span className="font-medium text-orange-900 text-sm">
                        {alert.title}
                      </span>
                    </div>
                    <div className="text-xs text-orange-600">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    {alert.description}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStatusTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Time Range</Label>
              <Select
                value={filters.timeRange}
                onValueChange={(value: '1h' | '24h' | '7d' | '30d') =>
                  handleFilterChange('timeRange', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Severity</Label>
              <Select
                value={filters.severity}
                onValueChange={(value: 'all' | 'low' | 'medium' | 'high' | 'critical') =>
                  handleFilterChange('severity', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Search</Label>
            <Input
              placeholder="Search compliance items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Compliance Status by Standard</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {complianceStandards?.map((standard) => {
                const statusForStandard = complianceStatus?.find(s => s.standardId === standard.id);
                const score = statusForStandard?.score || 0;
                
                return (
                  <div
                    key={standard.id}
                    className="p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{standard.name}</span>
                        <Badge
                          variant={score >= 90 ? 'default' : score >= 70 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {score >= 90 ? 'Compliant' : score >= 70 ? 'Warning' : 'Non-Compliant'}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">{score}%</div>
                    </div>
                    <Progress value={score} className="h-2" />
                    <div className="mt-2 text-xs text-gray-500">
                      Last checked: {statusForStandard?.lastChecked ? 
                        new Date(statusForStandard.lastChecked).toLocaleString() : 
                        'Never'
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAlertsTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Alert Summary */}
      <div className="grid grid-cols-4 gap-2">
        {['critical', 'high', 'medium', 'low'].map((severity) => {
          const count = filteredAlerts.filter(a => a.severity === severity).length;
          return (
            <Card key={severity} className="p-3">
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  severity === 'critical' ? 'text-red-600' :
                  severity === 'high' ? 'text-orange-600' :
                  severity === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  {count}
                </div>
                <div className="text-xs text-gray-500 capitalize">{severity}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-56">
            <div className="space-y-2">
              {filteredAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                      <span className="font-medium text-sm">{alert.title}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                  {alert.recommendation && (
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>Recommendation:</strong> {alert.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
        style={{ width: '420px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Compliance Status
              </h2>
              <p className="text-sm text-gray-500">
                Real-time compliance monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  disabled={complianceLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${complianceLoading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={autoRefresh ? 'text-green-600' : 'text-gray-400'}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              {renderStatusTab()}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              {renderAlertsTab()}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickComplianceStatus;

// Named export for backward compatibility
export { QuickComplianceStatus };