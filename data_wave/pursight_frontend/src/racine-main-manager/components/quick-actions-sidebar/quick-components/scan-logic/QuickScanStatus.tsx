'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import { Activity, Play, Pause, StopCircle, Clock, CheckCircle, AlertTriangle, X, RefreshCw, Database, Shield, Target, Eye, BarChart3, Zap, Brain, Sparkles, Search, Filter, Download, Settings, Info, TrendingUp, TrendingDown, Calendar, User, Users, Globe, FileText, Table, Network, Layers, GitBranch, Route, Workflow, Component, Fingerprint, Radar, Focus, Scan, Plus, Minus, Edit, Trash, Copy, Share, ExternalLink, MoreHorizontal, ChevronDown, ChevronRight, Maximize, Minimize } from 'lucide-react';

import { useScanLogic } from '../../../../hooks/useScanLogic';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

interface ScanExecution {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'targeted' | 'compliance' | 'security';
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  duration: number;
  scannedAssets: number;
  totalAssets: number;
  issuesFound: number;
  criticalIssues: number;
  owner: string;
  workspace: string;
  ruleSetIds: string[];
  targets: string[];
  metadata: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    triggeredBy: 'manual' | 'scheduled' | 'api' | 'event';
    resourceUsage: {
      cpu: number;
      memory: number;
      storage: number;
    };
    performance: {
      throughput: number;
      avgResponseTime: number;
      errorRate: number;
    };
  };
  logs: ScanLogEntry[];
}

interface ScanLogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  context?: any;
}

interface ScanStatusFilter {
  search: string;
  status: string[];
  type: string[];
  priority: string[];
  owner: string[];
  dateRange: string;
}

interface QuickScanStatusProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickScanStatus: React.FC<QuickScanStatusProps> = ({
  isVisible, onClose, className = '',
}) => {
  // Core State Management
  const [activeTab, setActiveTab] = useState<string>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list');
  const [selectedScan, setSelectedScan] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<string | null>(null);
  
  // Data State
  const [scanExecutions, setScanExecutions] = useState<ScanExecution[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanExecution[]>([]);
  const [scanSummary, setScanSummary] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [filter, setFilter] = useState<ScanStatusFilter>({
    search: '',
    status: [],
    type: [],
    priority: [],
    owner: [],
    dateRange: '7d',
  });

  // Analysis State
  const [performanceInsights, setPerformanceInsights] = useState<any[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [resourceAlerts, setResourceAlerts] = useState<any[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedScan, setExpandedScan] = useState<string | null>(null);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { 
    getActiveScanExecutions,
    getScanExecutionHistory,
    getScanSystemMetrics,
    controlScanExecution,
    getScanLogs,
    loading,
    error 
  } = useScanLogic();
  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { analyzeScanPerformance, getScanOptimizations } = useAIAssistant();
  const { getCrossGroupScanStatus } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const scanCardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    hover: { scale: 1.02, opacity: 1 },
  };

  // Core Logic Functions
  const loadScanStatus = useCallback(async () => {
    if (!isVisible) return;

    setIsLoading(true);
    try {
      const [activeScans, scanHistory, metrics, crossGroupStatus] = await Promise.all([
        getActiveScanExecutions(currentWorkspace?.id),
        getScanExecutionHistory(currentWorkspace?.id, { limit: 50 }),
        getScanSystemMetrics(currentWorkspace?.id),
        getCrossGroupScanStatus(currentWorkspace?.id)
      ]);

      const allScans = [...(activeScans || []), ...(scanHistory || [])];
      setScanExecutions(allScans);
      setSystemMetrics(metrics);

      // Calculate summary
      const summary = {
        active: allScans.filter(s => s.status === 'running' || s.status === 'queued').length,
        completed: allScans.filter(s => s.status === 'completed').length,
        failed: allScans.filter(s => s.status === 'failed').length,
        totalIssues: allScans.reduce((acc, s) => acc + s.issuesFound, 0),
        criticalIssues: allScans.reduce((acc, s) => acc + s.criticalIssues, 0),
        avgDuration: allScans.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.duration, 0) / allScans.filter(s => s.status === 'completed').length || 0
      };
      setScanSummary(summary);

      // AI Analysis if enabled
      if (allScans.length && currentUser?.preferences?.aiEnabled) {
        const [insights, recommendations] = await Promise.all([
          analyzeScanPerformance(allScans),
          getScanOptimizations(metrics)
        ]);
        setPerformanceInsights(insights?.insights || []);
        setAIRecommendations(recommendations?.recommendations || []);
      }

      trackActivity({
        action: 'scan_status_loaded',
        component: 'QuickScanStatus',
        metadata: { 
          scansCount: allScans.length,
          activeScans: summary.active
        },
      });
    } catch (error) {
      console.error('Failed to load scan status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace, currentUser, isVisible, getActiveScanExecutions, getScanExecutionHistory, getScanSystemMetrics, getCrossGroupScanStatus, analyzeScanPerformance, getScanOptimizations, trackActivity]);

  // Filter scans based on criteria
  const processScans = useCallback(() => {
    let filtered = scanExecutions.filter(scan => {
      // Search filter
      if (filter.search && !scan.name.toLowerCase().includes(filter.search.toLowerCase()) &&
          !scan.owner.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filter.status.length && !filter.status.includes(scan.status)) {
        return false;
      }

      // Type filter
      if (filter.type.length && !filter.type.includes(scan.type)) {
        return false;
      }

      // Priority filter
      if (filter.priority.length && !filter.priority.includes(scan.metadata.priority)) {
        return false;
      }

      return true;
    });

    // Sort by status priority and start time
    filtered.sort((a, b) => {
      const statusPriority = { running: 4, queued: 3, paused: 2, failed: 1, completed: 0, cancelled: 0 };
      const aPriority = statusPriority[a.status];
      const bPriority = statusPriority[b.status];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });

    setFilteredScans(filtered);
  }, [scanExecutions, filter]);

  // Handle scan control actions
  const handleScanControl = useCallback(async (scanId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      await controlScanExecution(scanId, action);
      
      // Update local state optimistically
      setScanExecutions(prev => prev.map(scan => 
        scan.id === scanId 
          ? { ...scan, status: action === 'pause' ? 'paused' : action === 'resume' ? 'running' : 'cancelled' }
          : scan
      ));

      trackActivity({
        action: `scan_${action}`,
        component: 'QuickScanStatus',
        metadata: { scanId, action },
      });
    } catch (error) {
      console.error(`Failed to ${action} scan:`, error);
    }
  }, [controlScanExecution, trackActivity]);

  // Load logs for a specific scan
  const loadScanLogs = useCallback(async (scanId: string) => {
    try {
      const logs = await getScanLogs(scanId);
      setScanExecutions(prev => prev.map(scan => 
        scan.id === scanId ? { ...scan, logs: logs || [] } : scan
      ));
    } catch (error) {
      console.error('Failed to load scan logs:', error);
    }
  }, [getScanLogs]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && isVisible) {
      loadScanStatus(); // Initial load
      refreshIntervalRef.current = setInterval(loadScanStatus, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, isVisible, refreshInterval, loadScanStatus]);

  // Process scans when data or filters change
  useEffect(() => {
    processScans();
  }, [processScans]);

  // Track component visibility
  useEffect(() => {
    if (isVisible) {
      trackActivity({
        action: 'quick_scan_status_opened',
        component: 'QuickScanStatus',
        metadata: { workspace: currentWorkspace?.id },
      });
    }
  }, [isVisible, currentWorkspace, trackActivity]);

  // Render Functions
  const renderStatusIcon = (status: string) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (status) {
      case 'running':
        return <Activity {...iconProps} className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'queued':
        return <Clock {...iconProps} className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <Pause {...iconProps} className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle {...iconProps} className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle {...iconProps} className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <X {...iconProps} className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock {...iconProps} className="h-4 w-4 text-gray-400" />;
    }
  };

  const renderStatusBadge = (status: string) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800 border-blue-300',
      queued: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paused: 'bg-orange-100 text-orange-800 border-orange-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const renderPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const renderActiveTab = () => (
    <div className="space-y-4">
      {/* Summary Cards */}
      {scanSummary && (
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            variants={scanCardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700">{scanSummary.active}</div>
                <div className="text-xs text-blue-600">Active Scans</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={scanCardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">{scanSummary.completed}</div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={scanCardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-700">{scanSummary.criticalIssues}</div>
                <div className="text-xs text-orange-600">Critical Issues</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={scanCardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-700">{Math.round(scanSummary.avgDuration / 60)}m</div>
                <div className="text-xs text-purple-600">Avg Duration</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search scans..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 w-64"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auto-refresh"
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
          />
          <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>

          <Button
            variant="outline"
            size="sm"
            onClick={loadScanStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Status</Label>
                    <div className="flex flex-wrap gap-1">
                      {['running', 'queued', 'paused', 'completed', 'failed'].map((status) => (
                        <Checkbox
                          key={status}
                          id={`status-${status}`}
                          checked={filter.status.includes(status)}
                          onCheckedChange={(checked) => {
                            setFilter(prev => ({
                              ...prev,
                              status: checked 
                                ? [...prev.status, status]
                                : prev.status.filter(s => s !== status)
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Type</Label>
                    <div className="flex flex-wrap gap-1">
                      {['full', 'incremental', 'targeted', 'compliance'].map((type) => (
                        <Checkbox
                          key={type}
                          id={`type-${type}`}
                          checked={filter.type.includes(type)}
                          onCheckedChange={(checked) => {
                            setFilter(prev => ({
                              ...prev,
                              type: checked 
                                ? [...prev.type, type]
                                : prev.type.filter(t => t !== type)
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Priority</Label>
                    <div className="flex flex-wrap gap-1">
                      {['critical', 'high', 'medium', 'low'].map((priority) => (
                        <Checkbox
                          key={priority}
                          id={`priority-${priority}`}
                          checked={filter.priority.includes(priority)}
                          onCheckedChange={(checked) => {
                            setFilter(prev => ({
                              ...prev,
                              priority: checked 
                                ? [...prev.priority, priority]
                                : prev.priority.filter(p => p !== priority)
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Executions List */}
      <div className="space-y-3">
        {filteredScans.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm font-medium text-gray-900">No scan executions found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredScans.map((scan) => (
            <motion.div
              key={scan.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border rounded-lg hover:shadow-md transition-all duration-200"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {renderStatusIcon(scan.status)}
                      <div>
                        <h4 className="font-medium text-sm">{scan.name}</h4>
                        <p className="text-xs text-gray-500">
                          Started by {scan.owner} • {new Date(scan.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      {renderStatusBadge(scan.status)}
                      {renderPriorityBadge(scan.metadata.priority)}
                      <Badge variant="secondary" className="text-xs">{scan.type}</Badge>
                      <span className="text-xs text-gray-500">
                        {scan.scannedAssets}/{scan.totalAssets} assets
                      </span>
                    </div>

                    {(scan.status === 'running' || scan.status === 'queued') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progress: {scan.progress}%</span>
                          {scan.estimatedCompletion && (
                            <span>ETA: {new Date(scan.estimatedCompletion).toLocaleTimeString()}</span>
                          )}
                        </div>
                        <Progress value={scan.progress} className="h-2" />
                      </div>
                    )}

                    {scan.issuesFound > 0 && (
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span className="text-orange-600">
                          {scan.issuesFound} issues found
                        </span>
                        {scan.criticalIssues > 0 && (
                          <span className="text-red-600">
                            {scan.criticalIssues} critical
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {scan.status === 'running' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScanControl(scan.id, 'pause')}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScanControl(scan.id, 'cancel')}
                        >
                          <StopCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {scan.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScanControl(scan.id, 'resume')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (showLogs === scan.id) {
                          setShowLogs(null);
                        } else {
                          setShowLogs(scan.id);
                          loadScanLogs(scan.id);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedScan(
                        expandedScan === scan.id ? null : scan.id
                      )}
                    >
                      {expandedScan === scan.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedScan === scan.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-gray-500">Duration</Label>
                          <p>{Math.round(scan.duration / 60)} minutes</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">CPU Usage</Label>
                          <p>{scan.metadata.resourceUsage.cpu}%</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Throughput</Label>
                          <p>{scan.metadata.performance.throughput} assets/min</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Targets</Label>
                          <p>{scan.targets.length} selected</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Rule Sets</Label>
                          <p>{scan.ruleSetIds.length} active</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Error Rate</Label>
                          <p>{scan.metadata.performance.errorRate}%</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Logs Section */}
                <AnimatePresence>
                  {showLogs === scan.id && scan.logs && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Scan Logs</Label>
                          <Badge variant="outline">{scan.logs.length} entries</Badge>
                        </div>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {scan.logs.slice(-10).map((log) => (
                              <div key={log.id} className="text-xs font-mono">
                                <span className="text-gray-500">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={`ml-2 ${
                                  log.level === 'error' ? 'text-red-600' :
                                  log.level === 'warning' ? 'text-yellow-600' :
                                  log.level === 'info' ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                  [{log.level.toUpperCase()}]
                                </span>
                                <span className="ml-2">{log.message}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-gray-500">
        Showing {filteredScans.length} of {scanExecutions.length} scan executions
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-4">
      {/* System Performance */}
      {systemMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>System Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-900">{systemMetrics.avgThroughput}</div>
                <div className="text-xs text-blue-600">Avg Throughput (assets/min)</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-900">{systemMetrics.successRate}%</div>
                <div className="text-xs text-green-600">Success Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-900">{systemMetrics.avgResponseTime}ms</div>
                <div className="text-xs text-purple-600">Avg Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {performanceInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span>Performance Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-purple-100 rounded">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900">{insight.title}</p>
                      <p className="text-xs text-purple-700 mt-1">{insight.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          Impact: {insight.impact}
                        </Badge>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-purple-600">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Alerts */}
      {resourceAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span>Resource Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resourceAlerts.map((alert, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-sm text-orange-800">{alert.title}</AlertTitle>
                  <AlertDescription className="text-xs text-orange-700">
                    {alert.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Scan Status Monitor</h3>
              <p className="text-xs text-gray-500">
                {currentWorkspace?.name || 'All Workspaces'} • Real-time Execution Tracking
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Scans</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <TabsContent value="active">{renderActiveTab()}</TabsContent>
              <TabsContent value="insights">{renderInsightsTab()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickScanStatus;
