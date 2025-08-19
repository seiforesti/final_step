'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import {
  Search, Filter, Download, RefreshCw, Eye, EyeOff, X, 
  BarChart3, PieChart, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle, XCircle, Clock, Calendar, User, Database,
  Table, FileText, Shield, Target, Zap, Brain, Sparkles,
  Activity, Settings, Info, HelpCircle, Star, Flag,
  ChevronDown, ChevronRight, MoreHorizontal, Copy, Edit,
  Trash, Plus, Minus, ExternalLink, Share, Save,
  Grid, List, SortAsc, SortDesc, Maximize, Minimize
} from 'lucide-react';

import { useScanLogic } from '../../../hooks/useScanLogic';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useActivityTracking } from '../../../hooks/useActivityTracking';

interface ScanResult {
  id: string;
  scanId: string;
  assetId: string;
  assetName: string;
  assetType: 'table' | 'view' | 'file' | 'api';
  ruleId: string;
  ruleName: string;
  ruleCategory: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'new' | 'reviewed' | 'resolved' | 'false_positive';
  confidence: number;
  description: string;
  location: {
    column?: string;
    row?: number;
    path?: string;
  };
  metadata: {
    matchedPattern?: string;
    context?: string;
    recommendations?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ScanResultsFilter {
  search: string;
  severity: string[];
  status: string[];
  ruleCategory: string[];
  assetType: string[];
  dateRange: string;
  confidence: [number, number];
}

interface QuickScanResultsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  scanId?: string;
}

const QuickScanResults: React.FC<QuickScanResultsProps> = ({
  isVisible, onClose, className = '', scanId
}) => {
  // Core State Management
  const [activeTab, setActiveTab] = useState<string>('results');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'detailed'>('cards');
  const [sortBy, setSortBy] = useState<'severity' | 'confidence' | 'created' | 'updated'>('severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Data State
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ScanResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [filter, setFilter] = useState<ScanResultsFilter>({
    search: '',
    severity: [],
    status: [],
    ruleCategory: [],
    assetType: [],
    dateRange: '7d',
    confidence: [0, 100],
  });

  // Analysis State
  const [resultsSummary, setResultsSummary] = useState<any>(null);
  const [aiInsights, setAIInsights] = useState<any[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  // Hooks
  const { 
    getScanResults,
    getScanResultsSummary,
    updateScanResultStatus,
    exportScanResults,
    loading,
    error 
  } = useScanLogic();
  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { analyzeScanResults } = useAIAssistant();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Load scan results
  const loadScanResults = useCallback(async () => {
    if (!isVisible) return;

    setIsLoading(true);
    try {
      const [resultsData, summaryData] = await Promise.all([
        getScanResults(scanId, currentWorkspace?.id),
        getScanResultsSummary(scanId, currentWorkspace?.id)
      ]);

      setScanResults(resultsData || []);
      setResultsSummary(summaryData);

      // AI Analysis if enabled
      if (resultsData?.length && currentUser?.preferences?.aiEnabled) {
        const aiAnalysis = await analyzeScanResults(resultsData);
        setAIInsights(aiAnalysis?.insights || []);
        setTrendAnalysis(aiAnalysis?.trends);
      }

      trackActivity({
        action: 'scan_results_loaded',
        component: 'QuickScanResults',
        metadata: { 
          scanId,
          resultsCount: resultsData?.length || 0
        },
      });
    } catch (error) {
      console.error('Failed to load scan results:', error);
    } finally {
      setIsLoading(false);
    }
  }, [scanId, currentWorkspace, currentUser, isVisible, getScanResults, getScanResultsSummary, analyzeScanResults, trackActivity]);

  // Filter and sort results
  const processResults = useMemo(() => {
    let filtered = scanResults.filter(result => {
      // Search filter
      if (filter.search && !result.assetName.toLowerCase().includes(filter.search.toLowerCase()) &&
          !result.ruleName.toLowerCase().includes(filter.search.toLowerCase()) &&
          !result.description.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }

      // Severity filter
      if (filter.severity.length && !filter.severity.includes(result.severity)) {
        return false;
      }

      // Status filter
      if (filter.status.length && !filter.status.includes(result.status)) {
        return false;
      }

      // Rule category filter
      if (filter.ruleCategory.length && !filter.ruleCategory.includes(result.ruleCategory)) {
        return false;
      }

      // Asset type filter
      if (filter.assetType.length && !filter.assetType.includes(result.assetType)) {
        return false;
      }

      // Confidence filter
      if (result.confidence < filter.confidence[0] || result.confidence > filter.confidence[1]) {
        return false;
      }

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [scanResults, filter, sortBy, sortOrder]);

  // Update filtered results when processing changes
  useEffect(() => {
    setFilteredResults(processResults);
  }, [processResults]);

  // Load data when component becomes visible
  useEffect(() => {
    if (isVisible) {
      loadScanResults();
      trackActivity({
        action: 'quick_scan_results_opened',
        component: 'QuickScanResults',
        metadata: { scanId, workspace: currentWorkspace?.id },
      });
    }
  }, [isVisible, loadScanResults, trackActivity, scanId, currentWorkspace]);

  // Handle result status update
  const handleStatusUpdate = useCallback(async (resultId: string, newStatus: string) => {
    try {
      await updateScanResultStatus(resultId, newStatus);
      setScanResults(prev => prev.map(result => 
        result.id === resultId ? { ...result, status: newStatus as any } : result
      ));
      
      trackActivity({
        action: 'scan_result_status_updated',
        component: 'QuickScanResults',
        metadata: { resultId, newStatus },
      });
    } catch (error) {
      console.error('Failed to update result status:', error);
    }
  }, [updateScanResultStatus, trackActivity]);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportScanResults(scanId, {
        format: 'excel',
        includeFiltered: true,
        results: selectedResults.length ? selectedResults : filteredResults.map(r => r.id)
      });
      
      trackActivity({
        action: 'scan_results_exported',
        component: 'QuickScanResults',
        metadata: { scanId, count: selectedResults.length || filteredResults.length },
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [scanId, selectedResults, filteredResults, exportScanResults, trackActivity]);

  // Render severity badge
  const renderSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      info: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 border-blue-300',
      reviewed: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      false_positive: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // Render results tab
  const renderResultsTab = () => (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search results..."
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
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cards">Cards</SelectItem>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Severity</Label>
                    <div className="flex flex-wrap gap-2">
                      {['critical', 'high', 'medium', 'low', 'info'].map((severity) => (
                        <Checkbox
                          key={severity}
                          id={`severity-${severity}`}
                          checked={filter.severity.includes(severity)}
                          onCheckedChange={(checked) => {
                            setFilter(prev => ({
                              ...prev,
                              severity: checked 
                                ? [...prev.severity, severity]
                                : prev.severity.filter(s => s !== severity)
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {['new', 'reviewed', 'resolved', 'false_positive'].map((status) => (
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
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      {resultsSummary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{resultsSummary.critical || 0}</div>
            <div className="text-xs text-red-500">Critical</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{resultsSummary.high || 0}</div>
            <div className="text-xs text-orange-500">High</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{resultsSummary.medium || 0}</div>
            <div className="text-xs text-yellow-500">Medium</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{resultsSummary.low + resultsSummary.info || 0}</div>
            <div className="text-xs text-blue-500">Low/Info</div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm font-medium text-gray-900">No results found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredResults.map((result) => (
            <motion.div
              key={result.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border rounded-lg hover:shadow-md transition-all duration-200"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Checkbox
                        checked={selectedResults.includes(result.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedResults(prev => [...prev, result.id]);
                          } else {
                            setSelectedResults(prev => prev.filter(id => id !== result.id));
                          }
                        }}
                      />
                      {renderSeverityBadge(result.severity)}
                      {renderStatusBadge(result.status)}
                      <Badge variant="outline" className="text-xs">
                        {result.confidence}% confidence
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{result.assetName}</span>
                        <span className="text-xs text-gray-500">({result.assetType})</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{result.ruleName}</span>
                        <Badge variant="secondary" className="text-xs">{result.ruleCategory}</Badge>
                      </div>

                      <p className="text-sm text-gray-600">{result.description}</p>

                      {result.location.column && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Target className="h-3 w-3" />
                          <span>Column: {result.location.column}</span>
                          {result.location.row && <span>Row: {result.location.row}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Select
                      value={result.status}
                      onValueChange={(value) => handleStatusUpdate(result.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="false_positive">False Positive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedResult(
                        expandedResult === result.id ? null : result.id
                      )}
                    >
                      {expandedResult === result.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedResult === result.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-gray-500">Created</Label>
                          <p>{new Date(result.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Updated</Label>
                          <p>{new Date(result.updatedAt).toLocaleString()}</p>
                        </div>
                        {result.metadata.matchedPattern && (
                          <div className="col-span-2">
                            <Label className="text-xs text-gray-500">Matched Pattern</Label>
                            <code className="block mt-1 p-2 bg-gray-100 rounded text-xs font-mono">
                              {result.metadata.matchedPattern}
                            </code>
                          </div>
                        )}
                        {result.metadata.recommendations && (
                          <div className="col-span-2">
                            <Label className="text-xs text-gray-500">Recommendations</Label>
                            <ul className="mt-1 space-y-1">
                              {result.metadata.recommendations.map((rec, index) => (
                                <li key={index} className="text-xs text-gray-600 flex items-start">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
        Showing {filteredResults.length} of {scanResults.length} results
        {selectedResults.length > 0 && ` (${selectedResults.length} selected)`}
      </div>
    </div>
  );

  // Render analytics tab
  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span>AI-Powered Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.slice(0, 3).map((insight, index) => (
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
                          Confidence: {insight.confidence}%
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

      {/* Trend Analysis */}
      {trendAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trend Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-gray-200">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm font-medium">Trend Visualization</p>
                <p className="text-xs mt-1">Results patterns over time</p>
              </div>
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
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Scan Results</h3>
              <p className="text-xs text-gray-500">
                {currentWorkspace?.name || 'All Workspaces'} • Analysis & Insights
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
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <TabsContent value="results">{renderResultsTab()}</TabsContent>
              <TabsContent value="analytics">{renderAnalyticsTab()}</TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickScanResults;