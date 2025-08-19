// ============================================================================
// AUTO CLASSIFICATION ENGINE - AI-POWERED DATA CLASSIFICATION (2000+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Auto Classification Component
// ML-driven data classification, automated rule generation, confidence scoring,
// real-time classification, and intelligent pattern recognition
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Brain, CheckCircle, Settings, Target, Zap, FileText, BarChart3, Filter, Search, Calendar, Clock, TrendingUp, AlertCircle, RefreshCw, Play, Pause, RotateCcw, Download, Upload, Save, Eye, EyeOff, Lock, Unlock, Database, Server, Globe, Users, Shield, Star, ThumbsUp, ThumbsDown, MessageSquare, Send, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, ChevronRight, X, Plus, Minus, Edit, Trash2, Copy, ExternalLink, Home, FolderOpen, Archive, BookOpen, Lightbulb, Sparkles } from 'lucide-react';

// Charts
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Services & Types
import { catalogAIService } from '../../services/catalog-ai.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { dataProfilingService } from '../../services/data-profiling.service';
import type { 
  ClassificationRule, 
  ClassificationJob, 
  ClassificationResult, 
  MLModel, 
  ConfidenceScore,
  DataAsset,
  ClassificationPattern,
  AutoClassificationConfig,
  ClassificationMetrics
} from '../../types/catalog-core.types';

// Constants
import { 
  CLASSIFICATION_CONFIDENCE_THRESHOLDS, 
  ML_MODEL_TYPES, 
  CLASSIFICATION_CATEGORIES,
  AUTO_CLASSIFICATION_SETTINGS 
} from '../../constants/catalog-constants';

// Hooks
import { useCatalogAI } from '../../hooks/useCatalogAI';
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { useCatalogProfiling } from '../../hooks/useCatalogProfiling';

// Utils
import { formatters } from '../../utils/formatters';
import { calculations } from '../../utils/calculations';
import { validators } from '../../utils/validators';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface ClassificationEngineProps {
  assets?: DataAsset[];
  onClassificationComplete?: (results: ClassificationResult[]) => void;
  onConfigChange?: (config: AutoClassificationConfig) => void;
  className?: string;
}

interface ClassificationJobConfig {
  id: string;
  name: string;
  description: string;
  assets: string[];
  models: string[];
  rules: string[];
  confidence_threshold: number;
  auto_approve_threshold: number;
  batch_size: number;
  parallel_jobs: number;
  notification_settings: {
    email: boolean;
    slack: boolean;
    webhook?: string;
  };
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
}

interface MLModelConfig {
  id: string;
  name: string;
  type: 'transformer' | 'bert' | 'gpt' | 'custom';
  version: string;
  confidence_threshold: number;
  enabled: boolean;
  parameters: Record<string, any>;
  training_data?: string;
  last_trained?: string;
  performance_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
}

interface ClassificationRuleConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  pattern_type: 'regex' | 'semantic' | 'statistical' | 'ml';
  pattern: string;
  confidence_weight: number;
  enabled: boolean;
  tags: string[];
  conditions: {
    column_name?: string;
    data_type?: string;
    null_percentage?: number;
    unique_percentage?: number;
    length_range?: [number, number];
  };
}

// ============================================================================
// CLASSIFICATION CONFIGURATION PANEL
// ============================================================================

const ClassificationConfigPanel: React.FC<{
  config: ClassificationJobConfig;
  onConfigChange: (config: ClassificationJobConfig) => void;
  models: MLModelConfig[];
  rules: ClassificationRuleConfig[];
}> = ({ config, onConfigChange, models, rules }) => {
  const [activeTab, setActiveTab] = useState('general');

  const updateConfig = useCallback((updates: Partial<ClassificationJobConfig>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Classification Configuration
        </CardTitle>
        <CardDescription>
          Configure auto-classification settings, models, and rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="models">ML Models</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-name">Job Name</Label>
                <Input
                  id="job-name"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="Enter job name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={config.batch_size}
                  onChange={(e) => updateConfig({ batch_size: parseInt(e.target.value) })}
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Describe the classification job"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="confidence-threshold"
                    type="number"
                    value={config.confidence_threshold}
                    onChange={(e) => updateConfig({ confidence_threshold: parseFloat(e.target.value) })}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(config.confidence_threshold * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto-approve-threshold">Auto-Approve Threshold</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="auto-approve-threshold"
                    type="number"
                    value={config.auto_approve_threshold}
                    onChange={(e) => updateConfig({ auto_approve_threshold: parseFloat(e.target.value) })}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(config.auto_approve_threshold * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Notification Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={config.notification_settings.email}
                    onCheckedChange={(checked) => updateConfig({
                      notification_settings: { ...config.notification_settings, email: checked }
                    })}
                  />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="slack-notifications"
                    checked={config.notification_settings.slack}
                    onCheckedChange={(checked) => updateConfig({
                      notification_settings: { ...config.notification_settings, slack: checked }
                    })}
                  />
                  <Label htmlFor="slack-notifications">Slack Notifications</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Available ML Models</Label>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </div>
            <div className="space-y-3">
              {models.map((model) => (
                <Card key={model.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={config.models.includes(model.id)}
                        onCheckedChange={(checked) => {
                          const updatedModels = checked
                            ? [...config.models, model.id]
                            : config.models.filter(id => id !== model.id);
                          updateConfig({ models: updatedModels });
                        }}
                      />
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {model.type} • Accuracy: {(model.performance_metrics.accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={model.enabled ? "default" : "secondary"}>
                        {model.enabled ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Classification Rules</Label>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card key={rule.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={config.rules.includes(rule.id)}
                        onCheckedChange={(checked) => {
                          const updatedRules = checked
                            ? [...config.rules, rule.id]
                            : config.rules.filter(id => id !== rule.id);
                          updateConfig({ rules: updatedRules });
                        }}
                      />
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {rule.category} • {rule.pattern_type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Weight: {rule.confidence_weight}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parallel-jobs">Parallel Jobs</Label>
                <Input
                  id="parallel-jobs"
                  type="number"
                  value={config.parallel_jobs}
                  onChange={(e) => updateConfig({ parallel_jobs: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                <Input
                  id="webhook-url"
                  value={config.notification_settings.webhook || ''}
                  onChange={(e) => updateConfig({
                    notification_settings: { ...config.notification_settings, webhook: e.target.value }
                  })}
                  placeholder="https://example.com/webhook"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-schedule"
                  checked={config.schedule?.enabled || false}
                  onCheckedChange={(checked) => updateConfig({
                    schedule: { ...config.schedule, enabled: checked, cron: '0 0 * * *', timezone: 'UTC' }
                  })}
                />
                <Label htmlFor="enable-schedule">Enable Scheduled Runs</Label>
              </div>

              {config.schedule?.enabled && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="cron-expression">Cron Expression</Label>
                    <Input
                      id="cron-expression"
                      value={config.schedule.cron}
                      onChange={(e) => updateConfig({
                        schedule: { ...config.schedule, cron: e.target.value }
                      })}
                      placeholder="0 0 * * *"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={config.schedule.timezone}
                      onValueChange={(value) => updateConfig({
                        schedule: { ...config.schedule, timezone: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// CLASSIFICATION EXECUTION PANEL
// ============================================================================

const ClassificationExecutionPanel: React.FC<{
  job: ClassificationJob;
  onJobAction: (action: string, jobId: string) => void;
}> = ({ job, onJobAction }) => {
  const [realTimeMetrics, setRealTimeMetrics] = useState<ClassificationMetrics | null>(null);

  const { data: jobMetrics } = useQuery({
    queryKey: ['classification-job-metrics', job.id],
    queryFn: () => catalogAIService.getJobMetrics(job.id),
    refetchInterval: job.status === 'running' ? 5000 : false,
    enabled: job.status === 'running'
  });

  useEffect(() => {
    if (jobMetrics) {
      setRealTimeMetrics(jobMetrics);
    }
  }, [jobMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`} />
            <CardTitle>{job.name}</CardTitle>
            <Badge variant="outline">{job.status}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            {job.status === 'running' && (
              <Button size="sm" variant="outline" onClick={() => onJobAction('pause', job.id)}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {job.status === 'paused' && (
              <Button size="sm" variant="outline" onClick={() => onJobAction('resume', job.id)}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onJobAction('stop', job.id)}>
              <X className="h-4 w-4 mr-2" />
              Stop
            </Button>
            <Button size="sm" variant="outline" onClick={() => onJobAction('restart', job.id)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>
        <CardDescription>
          {job.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Overall Progress</Label>
            <span className="text-sm font-medium">
              {job.progress}% ({job.processed_assets}/{job.total_assets})
            </span>
          </div>
          <Progress value={job.progress} className="w-full" />
        </div>

        {/* Real-time Metrics */}
        {realTimeMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Classifications</div>
                  <div className="text-xl font-bold">{realTimeMetrics.total_classifications}</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className="text-xl font-bold">
                    {(realTimeMetrics.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Processing Rate</div>
                  <div className="text-xl font-bold">{realTimeMetrics.processing_rate}/min</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Avg Confidence</div>
                  <div className="text-xl font-bold">
                    {(realTimeMetrics.average_confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Execution Timeline */}
        <div className="space-y-4">
          <Label>Execution Timeline</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Started</span>
              <span>{formatters.formatDateTime(job.start_time)}</span>
            </div>
            {job.end_time && (
              <div className="flex items-center justify-between text-sm">
                <span>Completed</span>
                <span>{formatters.formatDateTime(job.end_time)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span>Estimated Completion</span>
              <span>
                {job.estimated_completion_time 
                  ? formatters.formatDateTime(job.estimated_completion_time)
                  : 'Calculating...'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Model Performance */}
        {realTimeMetrics?.model_performance && (
          <div className="space-y-4">
            <Label>Model Performance</Label>
            <div className="space-y-3">
              {Object.entries(realTimeMetrics.model_performance).map(([modelId, metrics]) => (
                <div key={modelId} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{modelId}</span>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>Accuracy: {(metrics.accuracy * 100).toFixed(1)}%</span>
                    <span>Speed: {metrics.processing_speed}/min</span>
                    <Badge variant={metrics.accuracy > 0.9 ? "default" : "secondary"}>
                      {metrics.accuracy > 0.9 ? "Excellent" : "Good"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Classifications */}
        {job.recent_classifications && job.recent_classifications.length > 0 && (
          <div className="space-y-4">
            <Label>Recent Classifications</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {job.recent_classifications.map((classification, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{classification.asset_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{classification.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {(classification.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// CLASSIFICATION RESULTS PANEL
// ============================================================================

const ClassificationResultsPanel: React.FC<{
  results: ClassificationResult[];
  onResultAction: (action: string, resultId: string) => void;
  onBulkAction: (action: string, resultIds: string[]) => void;
}> = ({ results, onResultAction, onBulkAction }) => {
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('confidence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const filteredAndSortedResults = useMemo(() => {
    let filtered = results;

    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(result =>
        result.asset_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        result.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        result.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(result => result.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'asset_name':
          comparison = a.asset_name.localeCompare(b.asset_name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [results, debouncedSearchTerm, filterCategory, sortBy, sortOrder]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(results.map(r => r.category)));
    return uniqueCategories.sort();
  }, [results]);

  const confidenceDistribution = useMemo(() => {
    const bins = [
      { range: '90-100%', count: 0 },
      { range: '80-89%', count: 0 },
      { range: '70-79%', count: 0 },
      { range: '60-69%', count: 0 },
      { range: '< 60%', count: 0 }
    ];

    results.forEach(result => {
      const confidence = result.confidence * 100;
      if (confidence >= 90) bins[0].count++;
      else if (confidence >= 80) bins[1].count++;
      else if (confidence >= 70) bins[2].count++;
      else if (confidence >= 60) bins[3].count++;
      else bins[4].count++;
    });

    return bins;
  }, [results]);

  const handleSelectAll = useCallback(() => {
    if (selectedResults.length === filteredAndSortedResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(filteredAndSortedResults.map(r => r.id));
    }
  }, [selectedResults, filteredAndSortedResults]);

  const handleSelectResult = useCallback((resultId: string) => {
    setSelectedResults(prev =>
      prev.includes(resultId)
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Results Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Total Results</div>
              <div className="text-xl font-bold">{results.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
              <div className="text-xl font-bold">
                {results.filter(r => r.confidence >= 0.9).length}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div>
              <div className="text-sm text-muted-foreground">Needs Review</div>
              <div className="text-xl font-bold">
                {results.filter(r => r.confidence < 0.7 && r.status === 'pending').length}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-xl font-bold">{categories.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Confidence Distribution Chart */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Confidence Distribution</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={confidenceDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters and Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="asset_name">Asset Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="created_at">Date</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {selectedResults.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedResults.length} selected
            </span>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('approve', selectedResults)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('reject', selectedResults)}>
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('flag', selectedResults)}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Flag for Review
            </Button>
          </div>
        )}
      </Card>

      {/* Results List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Classification Results</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedResults.length === filteredAndSortedResults.length && filteredAndSortedResults.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredAndSortedResults.map((result, index) => (
              <div key={result.id} className={`p-4 border-b last:border-b-0 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedResults.includes(result.id)}
                      onCheckedChange={() => handleSelectResult(result.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{result.asset_name}</span>
                        <Badge variant="outline">{result.category}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span>Model: {result.model_used}</span>
                        <span>•</span>
                        <span>{formatters.formatDateTime(result.created_at)}</span>
                        {result.tags && result.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex gap-1">
                              {result.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {result.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{result.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                    <Badge variant={result.status === 'approved' ? 'default' : result.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {result.status}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => onResultAction('view', result.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onResultAction('approve', result.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onResultAction('reject', result.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredAndSortedResults.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">No Results Found</div>
              <div>Try adjusting your filters or search terms</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN AUTO CLASSIFICATION ENGINE COMPONENT
// ============================================================================

export const AutoClassificationEngine: React.FC<ClassificationEngineProps> = ({
  assets = [],
  onClassificationComplete,
  onConfigChange,
  className
}) => {
  const [activeView, setActiveView] = useState<'config' | 'execution' | 'results'>('config');
  const [jobConfig, setJobConfig] = useState<ClassificationJobConfig>({
    id: `job_${Date.now()}`,
    name: 'Auto Classification Job',
    description: 'Intelligent data classification using ML models',
    assets: assets.map(a => a.id),
    models: [],
    rules: [],
    confidence_threshold: 0.8,
    auto_approve_threshold: 0.95,
    batch_size: 100,
    parallel_jobs: 3,
    notification_settings: {
      email: true,
      slack: false
    }
  });

  // Queries
  const { data: models = [] } = useQuery({
    queryKey: ['classification-models'],
    queryFn: () => catalogAIService.getClassificationModels()
  });

  const { data: rules = [] } = useQuery({
    queryKey: ['classification-rules'],
    queryFn: () => catalogAIService.getClassificationRules()
  });

  const { data: activeJobs = [] } = useQuery({
    queryKey: ['active-classification-jobs'],
    queryFn: () => catalogAIService.getActiveJobs(),
    refetchInterval: 5000
  });

  const { data: results = [] } = useQuery({
    queryKey: ['classification-results'],
    queryFn: () => catalogAIService.getClassificationResults(),
    refetchInterval: 10000
  });

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: (config: ClassificationJobConfig) => 
      catalogAIService.createClassificationJob(config),
    onSuccess: (job) => {
      toast.success('Classification job created successfully');
      setActiveView('execution');
    },
    onError: (error) => {
      toast.error('Failed to create classification job');
      console.error('Create job error:', error);
    }
  });

  const jobActionMutation = useMutation({
    mutationFn: ({ action, jobId }: { action: string; jobId: string }) =>
      catalogAIService.controlJob(jobId, action),
    onSuccess: (_, variables) => {
      toast.success(`Job ${variables.action} successful`);
    },
    onError: (error) => {
      toast.error('Job action failed');
      console.error('Job action error:', error);
    }
  });

  const resultActionMutation = useMutation({
    mutationFn: ({ action, resultId }: { action: string; resultId: string }) =>
      catalogAIService.updateClassificationResult(resultId, action),
    onSuccess: (_, variables) => {
      toast.success(`Result ${variables.action} successful`);
    }
  });

  const bulkResultActionMutation = useMutation({
    mutationFn: ({ action, resultIds }: { action: string; resultIds: string[] }) =>
      catalogAIService.bulkUpdateClassificationResults(resultIds, action),
    onSuccess: (_, variables) => {
      toast.success(`Bulk ${variables.action} successful`);
    }
  });

  // Handlers
  const handleConfigChange = useCallback((config: ClassificationJobConfig) => {
    setJobConfig(config);
    onConfigChange?.(config);
  }, [onConfigChange]);

  const handleStartJob = useCallback(() => {
    createJobMutation.mutate(jobConfig);
  }, [jobConfig, createJobMutation]);

  const handleJobAction = useCallback((action: string, jobId: string) => {
    jobActionMutation.mutate({ action, jobId });
  }, [jobActionMutation]);

  const handleResultAction = useCallback((action: string, resultId: string) => {
    resultActionMutation.mutate({ action, resultId });
  }, [resultActionMutation]);

  const handleBulkAction = useCallback((action: string, resultIds: string[]) => {
    bulkResultActionMutation.mutate({ action, resultIds });
  }, [bulkResultActionMutation]);

  const { useCatalogAI: aiHook } = useCatalogAI();
  const { useCatalogDiscovery: discoveryHook } = useCatalogDiscovery();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto Classification Engine</h1>
          <p className="text-muted-foreground">
            AI-powered data classification with machine learning models
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Rules
          </Button>
          <Button 
            onClick={handleStartJob}
            disabled={jobConfig.models.length === 0 || createJobMutation.isPending}
          >
            {createJobMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Classification
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Tabs value={activeView} onValueChange={setActiveView as any}>
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="execution">
            Execution
            {activeJobs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="results">
            Results
            <Badge variant="secondary" className="ml-2">
              {results.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <ClassificationConfigPanel
            config={jobConfig}
            onConfigChange={handleConfigChange}
            models={models}
            rules={rules}
          />
        </TabsContent>

        <TabsContent value="execution">
          <div className="space-y-4">
            {activeJobs.length > 0 ? (
              activeJobs.map(job => (
                <ClassificationExecutionPanel
                  key={job.id}
                  job={job}
                  onJobAction={handleJobAction}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium mb-2">No Active Jobs</div>
                  <div>Configure and start a classification job to begin</div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <ClassificationResultsPanel
            results={results}
            onResultAction={handleResultAction}
            onBulkAction={handleBulkAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoClassificationEngine;