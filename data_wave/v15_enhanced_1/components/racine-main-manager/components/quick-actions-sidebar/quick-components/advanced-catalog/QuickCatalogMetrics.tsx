'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, TrendingUp, TrendingDown, Target, Award, Clock, ArrowUpRight, ArrowDownRight, Activity, Gauge, PieChart, RefreshCw, Download, X, Database, Eye, Search, Users, Heart } from 'lucide-react';

import { useAdvancedCatalog } from '../../../../hooks/useAdvancedCatalog';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';

interface QuickCatalogMetricsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickCatalogMetrics: React.FC<QuickCatalogMetricsProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['assets', 'usage', 'quality']);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'cards'>('chart');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);
  const [alertThresholds, setAlertThresholds] = useState<Record<string, number>>({});
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  const { 
    getCatalogMetrics, 
    getCatalogInsights,
    getAssetTrends,
    getUsagePatterns,
    getQualityMetrics,
    getLineageMetrics,
    getComplianceMetrics,
    loading,
    error
  } = useAdvancedCatalog();
  const { currentWorkspace, workspaceMetrics } = useWorkspaceManagement();

  // Advanced state management
  const [metrics, setMetrics] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        fetchMetrics();
      }, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  // Fetch comprehensive metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const [metricsData, insightsData, trendsData] = await Promise.all([
        getCatalogMetrics({ timeRange, workspace: currentWorkspace?.id }),
        getCatalogInsights({ timeRange, workspace: currentWorkspace?.id }),
        getAssetTrends({ timeRange, workspace: currentWorkspace?.id })
      ]);
      
      setMetrics(metricsData);
      setInsights(insightsData);
      setTrends(trendsData);
      
      // Check for alerts based on thresholds
      checkAlertThresholds(metricsData);
    } catch (error) {
      console.error('Failed to fetch catalog metrics:', error);
    }
  }, [timeRange, currentWorkspace?.id, alertThresholds]);

  // Check alert thresholds
  const checkAlertThresholds = useCallback((metricsData: any) => {
    const newAlerts: any[] = [];
    
    Object.entries(alertThresholds).forEach(([metric, threshold]) => {
      const value = metricsData?.[metric]?.current;
      if (value && value < threshold) {
        newAlerts.push({
          id: `${metric}_${Date.now()}`,
          type: 'warning',
          metric,
          value,
          threshold,
          message: `${metric} is below threshold (${value} < ${threshold})`
        });
      }
    });
    
    setAlerts(newAlerts);
  }, [alertThresholds]);

  // Export functionality
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Implement export logic based on format
      const exportData = {
        metrics,
        insights,
        trends,
        workspace: currentWorkspace?.name,
        timeRange,
        exportedAt: new Date().toISOString()
      };
      
      // Here you would integrate with your export service
      console.log('Exporting catalog metrics:', exportData);
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [metrics, insights, trends, currentWorkspace, timeRange, exportFormat]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (isVisible) {
      fetchMetrics();
    }
  }, [isVisible, fetchMetrics]);

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Advanced rendering functions
  const renderAdvancedOverviewTab = () => (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Active Alerts ({alerts.length})</span>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-700">{alert.message}</span>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  {alert.type}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Total Assets</p>
                <p className="text-2xl font-bold text-blue-700">
                  {metrics?.totalAssets?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-blue-600">
                {trends?.assetsGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {Math.abs(trends?.assetsGrowth || 0)}%
                </span>
              </div>
              <p className="text-xs text-blue-500">vs last period</p>
            </div>
          </div>
          <Progress value={metrics?.assetGrowthPercentage || 0} className="h-2" />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Data Quality</p>
                <p className="text-2xl font-bold text-green-700">
                  {metrics?.qualityScore || '0'}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                {trends?.qualityImprovement > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {Math.abs(trends?.qualityImprovement || 0)}%
                </span>
              </div>
              <p className="text-xs text-green-500">quality improvement</p>
            </div>
          </div>
          <Progress value={metrics?.qualityScore || 0} className="h-2" />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">Usage Score</p>
                <p className="text-2xl font-bold text-purple-700">
                  {metrics?.usageScore || '0'}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-purple-600">
                {trends?.usageGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {Math.abs(trends?.usageGrowth || 0)}%
                </span>
              </div>
              <p className="text-xs text-purple-500">usage increase</p>
            </div>
          </div>
          <Progress value={metrics?.usageScore || 0} className="h-2" />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">Compliance</p>
                <p className="text-2xl font-bold text-orange-700">
                  {metrics?.complianceScore || '0'}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-orange-600">
                {trends?.complianceImprovement > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {Math.abs(trends?.complianceImprovement || 0)}%
                </span>
              </div>
              <p className="text-xs text-orange-500">compliance rate</p>
            </div>
          </div>
          <Progress value={metrics?.complianceScore || 0} className="h-2" />
        </motion.div>
      </div>

      {/* Advanced Insights Section */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Insights
          </Badge>
        </div>
        
        <div className="space-y-4">
          {insights?.recommendations?.map((recommendation: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  recommendation.priority === 'high' ? 'bg-red-100' :
                  recommendation.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <Target className={`h-4 w-4 ${
                    recommendation.priority === 'high' ? 'text-red-600' :
                    recommendation.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {recommendation.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          recommendation.priority === 'high' ? 'border-red-200 text-red-600' :
                          recommendation.priority === 'medium' ? 'border-yellow-200 text-yellow-600' : 
                          'border-green-200 text-green-600'
                        }`}
                      >
                        {recommendation.priority} priority
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Impact: {recommendation.impact}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="h-7">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {(!insights?.recommendations || insights.recommendations.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>AI insights will appear here once data is analyzed</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="justify-start">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );

  // Advanced trends tab
  const renderTrendsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Asset Growth Trends</h3>
          </div>
          <Select value={viewMode} onValueChange={(value: 'chart' | 'table' | 'cards') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chart">Chart View</SelectItem>
              <SelectItem value="table">Table View</SelectItem>
              <SelectItem value="cards">Cards View</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {viewMode === 'chart' && (
          <div className="h-64 bg-white rounded-lg border border-blue-100 p-4">
            <div className="flex items-center justify-center h-full text-blue-600">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Interactive chart visualization would be here</p>
                <p className="text-xs text-blue-500">Showing asset growth over {timeRange}</p>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg border border-blue-100">
            <div className="p-4 border-b border-blue-100">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-blue-900">
                <span>Period</span>
                <span>Assets Added</span>
                <span>Growth Rate</span>
                <span>Quality Score</span>
              </div>
            </div>
            <div className="divide-y divide-blue-50">
              {trends?.periodData?.map((period: any, index: number) => (
                <div key={index} className="p-4 grid grid-cols-4 gap-4 text-sm">
                  <span className="text-gray-900">{period.period}</span>
                  <span className="text-blue-600 font-medium">{period.assetsAdded}</span>
                  <span className={`font-medium ${period.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {period.growthRate}%
                  </span>
                  <span className="text-purple-600 font-medium">{period.qualityScore}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Quality Trends */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900">Data Quality Trends</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">
              {trends?.qualityTrends?.completeness || '0'}%
            </p>
            <p className="text-sm text-green-600">Completeness</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">
              {trends?.qualityTrends?.accuracy || '0'}%
            </p>
            <p className="text-sm text-green-600">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">
              {trends?.qualityTrends?.consistency || '0'}%
            </p>
            <p className="text-sm text-green-600">Consistency</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-700">Completeness</span>
              <span className="text-green-600">{trends?.qualityTrends?.completeness || 0}%</span>
            </div>
            <Progress value={trends?.qualityTrends?.completeness || 0} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-700">Accuracy</span>
              <span className="text-green-600">{trends?.qualityTrends?.accuracy || 0}%</span>
            </div>
            <Progress value={trends?.qualityTrends?.accuracy || 0} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-700">Consistency</span>
              <span className="text-green-600">{trends?.qualityTrends?.consistency || 0}%</span>
            </div>
            <Progress value={trends?.qualityTrends?.consistency || 0} className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );

  // Advanced settings tab
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="refresh-toggle" className="text-sm font-medium text-gray-700">
              Auto Refresh
            </Label>
            <div className="flex items-center space-x-3 mt-2">
              <Checkbox
                id="refresh-toggle"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <span className="text-sm text-gray-600">
                Automatically refresh metrics every {refreshInterval / 1000} seconds
              </span>
            </div>
          </div>
          
          {autoRefresh && (
            <div>
              <Label htmlFor="refresh-interval" className="text-sm font-medium text-gray-700">
                Refresh Interval
              </Label>
              <Select 
                value={refreshInterval.toString()} 
                onValueChange={(value) => setRefreshInterval(parseInt(value))}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000">10 seconds</SelectItem>
                  <SelectItem value="30000">30 seconds</SelectItem>
                  <SelectItem value="60000">1 minute</SelectItem>
                  <SelectItem value="300000">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label htmlFor="metrics-selection" className="text-sm font-medium text-gray-700">
              Visible Metrics
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {['assets', 'usage', 'quality', 'compliance', 'lineage', 'governance'].map((metric) => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={`metric-${metric}`}
                    checked={selectedMetrics.includes(metric)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMetrics([...selectedMetrics, metric]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                      }
                    }}
                  />
                  <Label htmlFor={`metric-${metric}`} className="text-sm capitalize">
                    {metric}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="export-format" className="text-sm font-medium text-gray-700">
              Export Format
            </Label>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setExportFormat(value)}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h3>
        
        <div className="space-y-4">
          {['totalAssets', 'qualityScore', 'usageScore', 'complianceScore'].map((metric) => (
            <div key={metric}>
              <Label htmlFor={`threshold-${metric}`} className="text-sm font-medium text-gray-700 capitalize">
                {metric.replace(/([A-Z])/g, ' $1').toLowerCase()} Threshold
              </Label>
              <Input
                id={`threshold-${metric}`}
                type="number"
                value={alertThresholds[metric] || ''}
                onChange={(e) => setAlertThresholds({
                  ...alertThresholds,
                  [metric]: parseFloat(e.target.value)
                })}
                placeholder="Enter threshold value"
                className="mt-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  const renderUsageTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Usage analytics chart</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {[
                { name: 'customer_analytics', views: 1247, type: 'dashboard' },
                { name: 'sales_pipeline', views: 892, type: 'report' },
                { name: 'user_events', views: 756, type: 'table' },
                { name: 'revenue_forecast', views: 634, type: 'model' },
              ].map((asset, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{asset.name}</div>
                    <div className="text-xs text-gray-500">{asset.type}</div>
                  </div>
                  <div className="text-sm font-bold">{asset.views} views</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
         </div>
   );

  // Insights tab
  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Brain className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-indigo-900">Advanced Analytics</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-700">Asset Discovery Rate</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-900">
              {insights?.discoveryRate || '0'}%
            </p>
            <p className="text-xs text-indigo-600">New assets per day</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-700">Classification Coverage</span>
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-900">
              {insights?.classificationCoverage || '0'}%
            </p>
            <p className="text-xs text-indigo-600">Assets classified</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-indigo-900">Key Insights</h4>
          {insights?.keyInsights?.map((insight: any, index: number) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-indigo-100 rounded">
                  <Sparkles className="h-3 w-3 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">{insight.title}</p>
                  <p className="text-xs text-indigo-600 mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Optimization</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">Query Performance</p>
                <p className="text-sm text-green-600">Optimized search indexing</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              +25% faster
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Storage Efficiency</p>
                <p className="text-sm text-blue-600">Metadata compression</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              -15% storage
            </Badge>
          </div>
        </div>
      </div>
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
        style={{ width: '420px', maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Catalog Metrics</h2>
              <p className="text-sm text-gray-500">Performance & usage analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1d</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Enhanced Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="h-8"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="h-8"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Export
              </Button>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              {currentWorkspace?.name || 'All Workspaces'}
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <TabsContent value="overview">{renderAdvancedOverviewTab()}</TabsContent>
              <TabsContent value="trends">{renderTrendsTab()}</TabsContent>
              <TabsContent value="insights">{renderInsightsTab()}</TabsContent>
              <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickCatalogMetrics;