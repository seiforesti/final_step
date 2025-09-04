'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import { Search, Scan, Activity, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Target, Zap, Brain, Sparkles, Shield, AlertCircle, CheckCircle, XCircle, Clock, Calendar, User, Database, Table, FileText, Settings, RefreshCw, Download, Upload, Play, Pause, StopCircle, RotateCw, Eye, EyeOff, Filter, SortAsc, SortDesc, Grid, List, Maximize, Minimize, X, Plus, Minus, Edit, Trash, Copy, Share, ExternalLink, Info, HelpCircle, Star, Heart, Bookmark, Flag, Tag, Globe, Lock, Unlock, Key, Fingerprint, Radar, Crosshair, Focus, Layers, Network, GitBranch, Route, Workflow, Component } from 'lucide-react';

import { useScanLogic } from '../../../../hooks/useScanLogic';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';
import { useDataSources } from '../../../../hooks/useDataSources';

interface ScanMetrics {
  totalScans: number;
  activeScans: number;
  completedScans: number;
  failedScans: number;
  successRate: number;
  avgScanTime: number;
  dataProcessed: number;
  issuesFound: number;
  criticalIssues: number;
  performanceScore: number;
  complianceScore: number;
  qualityScore: number;
}

interface ScanTrend {
  date: string;
  scans: number;
  issues: number;
  performance: number;
  quality: number;
}

interface ScanInsight {
  id: string;
  type: 'optimization' | 'alert' | 'recommendation' | 'warning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionable: boolean;
}

interface QuickScanMetricsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickScanMetrics: React.FC<QuickScanMetricsProps> = ({
  isVisible, onClose, className = '',
}) => {
  // Core State Management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['scans', 'issues', 'performance', 'quality']);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'cards'>('chart');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);

  // Advanced State
  const [scanMetrics, setScanMetrics] = useState<ScanMetrics | null>(null);
  const [scanTrends, setScanTrends] = useState<ScanTrend[]>([]);
  const [scanInsights, setScanInsights] = useState<ScanInsight[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [complianceMetrics, setComplianceMetrics] = useState<any>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { 
    getScanMetrics,
    getScanTrends,
    getScanInsights,
    getActiveScanAlerts,
    getPerformanceMetrics,
    getComplianceMetrics,
    loading,
    error 
  } = useScanLogic();
  const { currentWorkspace, workspaceMetrics } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { getAISuggestions, analyzeScanPerformance } = useAIAssistant();
  const { getCrossGroupScanMetrics } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();
  const { getDataSourceScanMetrics } = useDataSources();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    hover: { scale: 1.02, opacity: 1 },
  };

  // Core Logic Functions
  const loadScanMetrics = useCallback(async () => {
    if (!isVisible) return;

    setIsLoading(true);
    try {
      // Parallel data fetching for comprehensive metrics
      const [
        metricsData,
        trendsData,
        insightsData,
        alertsData,
        performanceData,
        complianceData,
        crossGroupData
      ] = await Promise.all([
        getScanMetrics(timeRange, currentWorkspace?.id),
        getScanTrends(timeRange, currentWorkspace?.id),
        getScanInsights(currentWorkspace?.id),
        getActiveScanAlerts(currentWorkspace?.id),
        getPerformanceMetrics(timeRange),
        getComplianceMetrics(timeRange),
        getCrossGroupScanMetrics(timeRange)
      ]);

      setScanMetrics(metricsData);
      setScanTrends(trendsData || []);
      setScanInsights(insightsData?.insights || []);
      setActiveAlerts(alertsData || []);
      setPerformanceMetrics(performanceData);
      setComplianceMetrics(complianceData);

      // AI Analysis if enabled
      if (metricsData && currentUser?.preferences?.aiEnabled) {
        const aiAnalysis = await analyzeScanPerformance({
          metrics: metricsData,
          trends: trendsData,
          timeRange
        });
        setAIRecommendations(aiAnalysis?.recommendations || []);
      }

      trackActivity({
        action: 'scan_metrics_loaded',
        component: 'QuickScanMetrics',
        metadata: { 
          timeRange,
          workspaceId: currentWorkspace?.id,
          metricsCount: selectedMetrics.length
        },
      });
    } catch (error) {
      console.error('Failed to load scan metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, currentWorkspace, selectedMetrics, currentUser, isVisible, getScanMetrics, getScanTrends, getScanInsights, getActiveScanAlerts, getPerformanceMetrics, getComplianceMetrics, getCrossGroupScanMetrics, analyzeScanPerformance, trackActivity]);

  const handleExport = useCallback(async () => {
    if (!scanMetrics) return;

    setIsExporting(true);
    try {
      // Export logic would be implemented here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate export
      
      trackActivity({
        action: 'scan_metrics_exported',
        component: 'QuickScanMetrics',
        metadata: { format: exportFormat, timeRange },
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [scanMetrics, exportFormat, timeRange, trackActivity]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && isVisible) {
      loadScanMetrics(); // Initial load
      refreshIntervalRef.current = setInterval(loadScanMetrics, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, isVisible, refreshInterval, loadScanMetrics]);

  // Load data when time range changes
  useEffect(() => {
    if (isVisible) {
      loadScanMetrics();
    }
  }, [timeRange, loadScanMetrics, isVisible]);

  // Track component visibility
  useEffect(() => {
    if (isVisible) {
      trackActivity({
        action: 'quick_scan_metrics_opened',
        component: 'QuickScanMetrics',
        metadata: { workspace: currentWorkspace?.id },
      });
    }
  }, [isVisible, currentWorkspace, trackActivity]);

  // Render Functions
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">Active Scan Alerts ({activeAlerts.length})</span>
          </div>
          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700">{alert.message}</span>
                <Badge variant="outline" className="text-red-600 border-red-300">
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scan className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Total Scans</p>
                <p className="text-2xl font-bold text-blue-700">
                  {scanMetrics?.totalScans?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-blue-600">
                {scanTrends.length > 1 && scanTrends[scanTrends.length - 1].scans > scanTrends[scanTrends.length - 2].scans ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {Math.abs(((scanTrends[scanTrends.length - 1]?.scans || 0) - (scanTrends[scanTrends.length - 2]?.scans || 0)) / (scanTrends[scanTrends.length - 2]?.scans || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-blue-500">vs last period</p>
            </div>
          </div>
          <Progress value={scanMetrics?.successRate || 0} className="h-2" />
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Success Rate</p>
                <p className="text-2xl font-bold text-green-700">
                  {scanMetrics?.successRate || '0'}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+2.3%</span>
              </div>
              <p className="text-xs text-green-500">improvement</p>
            </div>
          </div>
          <Progress value={scanMetrics?.successRate || 0} className="h-2" />
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">Performance</p>
                <p className="text-2xl font-bold text-purple-700">
                  {scanMetrics?.performanceScore || '0'}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-purple-600">
                <TrendingUp className="h-4 w-4" />
                <span>+5.1%</span>
              </div>
              <p className="text-xs text-purple-500">faster scans</p>
            </div>
          </div>
          <Progress value={scanMetrics?.performanceScore || 0} className="h-2" />
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">Issues Found</p>
                <p className="text-2xl font-bold text-orange-700">
                  {scanMetrics?.issuesFound?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-orange-600">
                <TrendingDown className="h-4 w-4" />
                <span>-12%</span>
              </div>
              <p className="text-xs text-orange-500">fewer issues</p>
            </div>
          </div>
          <Progress value={Math.max(0, 100 - (scanMetrics?.issuesFound || 0) / 10)} className="h-2" />
        </motion.div>
      </div>

      {/* Advanced Insights Section */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-900">AI-Powered Insights</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIInsights(true)}
            disabled={aiRecommendations.length === 0}
          >
            View All ({aiRecommendations.length})
          </Button>
        </div>
        
        <div className="space-y-3">
          {scanInsights.slice(0, 3).map((insight) => (
            <div key={insight.id} className="p-4 bg-white rounded-lg border border-gray-100">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-indigo-100 rounded">
                  <Sparkles className="h-3 w-3 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900">{insight.title}</p>
                  <p className="text-xs text-indigo-600 mt-1">{insight.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={`text-xs ${
                      insight.impact === 'critical' ? 'text-red-600 border-red-300' :
                      insight.impact === 'high' ? 'text-orange-600 border-orange-300' :
                      insight.impact === 'medium' ? 'text-yellow-600 border-yellow-300' :
                      'text-green-600 border-green-300'
                    }`}>
                      {insight.impact} impact
                    </Badge>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="justify-start">
            <Play className="h-4 w-4 mr-2" />
            Start New Scan
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Eye className="h-4 w-4 mr-2" />
            View Active Scans
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <LineChart className="h-4 w-4" />
            <span>Scan Trends Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-gray-200">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm font-medium">Interactive Trends Chart</p>
              <p className="text-xs mt-1">Scan performance over time</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">+15%</div>
              <div className="text-xs text-gray-500">Scan Volume</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">-8%</div>
              <div className="text-xs text-gray-500">Avg Duration</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">+23%</div>
              <div className="text-xs text-gray-500">Quality Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">-12%</div>
              <div className="text-xs text-gray-500">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Scan Throughput</p>
                  <p className="text-sm text-green-600">Optimized processing speed</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                +35% faster
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Detection Accuracy</p>
                  <p className="text-sm text-blue-600">Improved pattern recognition</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                97.8% accurate
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Auto-Refresh Metrics</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">View Mode</Label>
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chart">Chart View</SelectItem>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="cards">Card View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !scanMetrics}
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Export Metrics'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Visible Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'scans', label: 'Scan Volume' },
              { id: 'issues', label: 'Issues Found' },
              { id: 'performance', label: 'Performance Score' },
              { id: 'quality', label: 'Quality Score' },
            ].map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMetrics(prev => [...prev, metric.id]);
                    } else {
                      setSelectedMetrics(prev => prev.filter(m => m !== metric.id));
                    }
                  }}
                />
                <Label htmlFor={metric.id} className="text-sm">{metric.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
              <Scan className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Scan Logic Metrics</h3>
              <p className="text-xs text-gray-500">
                {currentWorkspace?.name || 'All Workspaces'} • Advanced Analytics
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh && isLoading ? 'animate-spin' : ''}`} />
              Auto
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Export
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
              <TabsContent value="trends">{renderTrendsTab()}</TabsContent>
              <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickScanMetrics;
