/**
 * Quick Rule Test Component
 * =========================
 * 
 * Enterprise-grade quick access component for testing scan rules.
 * Provides real-time rule validation, performance testing, and results analysis.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Square, RotateCcw, CheckCircle, AlertTriangle, Clock, BarChart3, Target, Zap, FileText, Search, RefreshCw, Download, TrendingUp, Activity, Database, Timer, TestTube, GitBranch, Eye, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Import types and services
import type { 
  ScanRule, 
  ScanRuleTestResult,
  ScanRuleTestConfig,
  TestMetrics,
  DataSample,
  ValidationError
} from '../../../types/racine-core.types';

import { useScanRuleSets } from '../../../../hooks/useScanRuleSets';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useDataSources } from '../../../../hooks/useDataSources';

interface QuickRuleTestProps {
  isVisible?: boolean;
  onClose?: () => void;
  ruleId?: string;
  rule?: ScanRule;
  className?: string;
}

interface TestState {
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
  stage: 'preparation' | 'validation' | 'execution' | 'analysis' | 'completed' | 'error';
  startTime?: Date;
  estimatedCompletion?: Date;
}

export const QuickRuleTest: React.FC<QuickRuleTestProps> = ({
  isVisible = true,
  onClose,
  ruleId,
  rule,
  className = ''
}) => {
  // Hooks
  const {
    testRule,
    getRuleById,
    validateRuleLogic,
    getTestMetrics,
    isLoading,
    error,
    testResults,
    validationErrors
  } = useScanRuleSets();

  const { currentWorkspace } = useWorkspaceManagement();
  const { getDataSources, getSampleData } = useDataSources();

  // State
  const [selectedRule, setSelectedRule] = useState<ScanRule | null>(rule || null);
  const [testConfig, setTestConfig] = useState<ScanRuleTestConfig>({
    sampleSize: 1000,
    targetDataSources: [],
    includePerformanceTest: true,
    detailedAnalysis: true,
    parallelExecution: false
  });
  const [testState, setTestState] = useState<TestState>({
    isRunning: false,
    isPaused: false,
    progress: 0,
    stage: 'preparation'
  });
  const [activeTab, setActiveTab] = useState('config');
  const [testHistory, setTestHistory] = useState<ScanRuleTestResult[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<TestMetrics | null>(null);

  // Load rule if ruleId provided
  useEffect(() => {
    if (ruleId && !rule) {
      getRuleById(ruleId).then(setSelectedRule);
    }
  }, [ruleId, rule, getRuleById]);

  // Start test execution
  const handleStartTest = useCallback(async () => {
    if (!selectedRule) return;

    setTestState({
      isRunning: true,
      isPaused: false,
      progress: 0,
      stage: 'preparation',
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 60000) // Estimate 1 minute
    });

    try {
      // Stage 1: Preparation
      setTestState(prev => ({ ...prev, stage: 'preparation', progress: 10 }));
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Validation
      setTestState(prev => ({ ...prev, stage: 'validation', progress: 25 }));
      await validateRuleLogic(selectedRule.id);

      // Stage 3: Execution
      setTestState(prev => ({ ...prev, stage: 'execution', progress: 50 }));
      const result = await testRule(selectedRule.id, testConfig);

      // Stage 4: Analysis
      setTestState(prev => ({ ...prev, stage: 'analysis', progress: 80 }));
      const metrics = await getTestMetrics(result.id);
      setLiveMetrics(metrics);

      // Stage 5: Completed
      setTestState(prev => ({ ...prev, stage: 'completed', progress: 100 }));
      setTestHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 tests
      
      toast.success('Rule test completed successfully');
    } catch (error) {
      setTestState(prev => ({ ...prev, stage: 'error', progress: 0 }));
      toast.error('Rule test failed');
      console.error('Test error:', error);
    }
  }, [selectedRule, testConfig, testRule, validateRuleLogic, getTestMetrics]);

  // Pause/Resume test
  const handlePauseResume = useCallback(() => {
    setTestState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // Stop test
  const handleStopTest = useCallback(() => {
    setTestState({
      isRunning: false,
      isPaused: false,
      progress: 0,
      stage: 'preparation'
    });
  }, []);

  // Reset test
  const handleResetTest = useCallback(() => {
    setTestState({
      isRunning: false,
      isPaused: false,
      progress: 0,
      stage: 'preparation'
    });
    setLiveMetrics(null);
  }, []);

  // Format duration
  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }, []);

  // Get stage color
  const getStageColor = useCallback((stage: string) => {
    switch (stage) {
      case 'preparation': return 'text-blue-600';
      case 'validation': return 'text-yellow-600';
      case 'execution': return 'text-purple-600';
      case 'analysis': return 'text-indigo-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`quick-rule-test ${className}`}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-green-50/50 to-emerald-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TestTube className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Rule Test
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Test scan rules with real-time metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testState.isRunning && (
                <Badge variant="outline" className={`text-xs ${getStageColor(testState.stage)}`}>
                  {testState.stage}
                </Badge>
              )}
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>

          {/* Test Progress */}
          {testState.isRunning && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${getStageColor(testState.stage)}`}>
                  {testState.stage.charAt(0).toUpperCase() + testState.stage.slice(1)}
                </span>
                <span className="text-gray-500">
                  {testState.progress}%
                </span>
              </div>
              <Progress value={testState.progress} className="h-2" />
              {testState.estimatedCompletion && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Started: {testState.startTime?.toLocaleTimeString()}</span>
                  <span>ETA: {testState.estimatedCompletion.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              
              {/* Error display */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Rule Selection */}
              {!selectedRule && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Rule to Test</Label>
                  <Select onValueChange={(ruleId) => getRuleById(ruleId).then(setSelectedRule)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a scan rule..." />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Rule options would be populated here */}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Selected Rule Info */}
              {selectedRule && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{selectedRule.name}</h3>
                    <Badge variant="secondary">{selectedRule.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{selectedRule.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Targets: {selectedRule.targets?.length || 0}</span>
                    <span>Conditions: {selectedRule.conditions?.length || 0}</span>
                    <span>Priority: {selectedRule.priority}</span>
                  </div>
                </div>
              )}

              {/* Test Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
                  <TabsTrigger value="results" className="text-xs">Results</TabsTrigger>
                  <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
                </TabsList>

                {/* Configuration Tab */}
                <TabsContent value="config" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Sample Size</Label>
                      <Select
                        value={testConfig.sampleSize.toString()}
                        onValueChange={(value) => setTestConfig(prev => ({ 
                          ...prev, 
                          sampleSize: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 records</SelectItem>
                          <SelectItem value="1000">1,000 records</SelectItem>
                          <SelectItem value="10000">10,000 records</SelectItem>
                          <SelectItem value="100000">100,000 records</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Test Options</Label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={testConfig.includePerformanceTest}
                            onChange={(e) => setTestConfig(prev => ({
                              ...prev,
                              includePerformanceTest: e.target.checked
                            }))}
                            className="rounded"
                          />
                          <span>Include performance testing</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={testConfig.detailedAnalysis}
                            onChange={(e) => setTestConfig(prev => ({
                              ...prev,
                              detailedAnalysis: e.target.checked
                            }))}
                            className="rounded"
                          />
                          <span>Detailed result analysis</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={testConfig.parallelExecution}
                            onChange={(e) => setTestConfig(prev => ({
                              ...prev,
                              parallelExecution: e.target.checked
                            }))}
                            className="rounded"
                          />
                          <span>Parallel execution</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Results Tab */}
                <TabsContent value="results" className="space-y-4 mt-4">
                  {testHistory.length > 0 ? (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Recent Test Results</Label>
                      {testHistory.map((result, index) => (
                        <div key={result.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Test #{testHistory.length - index}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={result.status === 'passed' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {result.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(result.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Records Tested:</span>
                              <span>{result.recordsTested?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Matches Found:</span>
                              <span>{result.matchesFound?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Execution Time:</span>
                              <span>{formatDuration(result.executionTime)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Accuracy:</span>
                              <span>{result.accuracy?.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No test results yet</p>
                      <p className="text-xs">Run a test to see results here</p>
                    </div>
                  )}
                </TabsContent>

                {/* Metrics Tab */}
                <TabsContent value="metrics" className="space-y-4 mt-4">
                  {liveMetrics ? (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Performance Metrics</Label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Timer className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-900">Avg Response</span>
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            {liveMetrics.averageResponseTime}ms
                          </div>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-900">Throughput</span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {liveMetrics.throughput}/sec
                          </div>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-900">Accuracy</span>
                          </div>
                          <div className="text-lg font-bold text-purple-600">
                            {liveMetrics.accuracy}%
                          </div>
                        </div>

                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-medium text-orange-900">CPU Usage</span>
                          </div>
                          <div className="text-lg font-bold text-orange-600">
                            {liveMetrics.resourceUsage?.cpu}%
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Error Analysis</h4>
                        {liveMetrics.errors && liveMetrics.errors.length > 0 ? (
                          <div className="space-y-1">
                            {liveMetrics.errors.slice(0, 3).map((error, index) => (
                              <div key={index} className="text-xs text-red-600">
                                {error.message}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-green-600">No errors detected</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No metrics available</p>
                      <p className="text-xs">Run a test to see performance data</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Test Controls */}
              <div className="space-y-3 pt-4 border-t">
                {!testState.isRunning ? (
                  <Button
                    onClick={handleStartTest}
                    disabled={!selectedRule || isLoading}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start Test
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePauseResume}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      {testState.isPaused ? (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleStopTest}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  </div>
                )}

                {(testHistory.length > 0 || liveMetrics) && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleResetTest}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                )}
              </div>

              {/* Validation Errors */}
              {validationErrors && validationErrors.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      Validation Issues
                    </span>
                  </div>
                  <div className="space-y-1">
                    {validationErrors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-xs text-red-700">
                        {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickRuleTest;
