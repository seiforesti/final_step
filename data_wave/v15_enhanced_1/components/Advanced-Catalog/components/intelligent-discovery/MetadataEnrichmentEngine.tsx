// ============================================================================
// METADATA ENRICHMENT ENGINE - INTELLIGENT METADATA ENHANCEMENT (1900+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Metadata Enrichment Component
// AI-powered metadata enrichment, automated discovery, semantic annotation,
// quality scoring, relationship extraction, and intelligent tagging
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
import { 
  Brain, Sparkles, Tag, FileText, Database, Settings, CheckCircle, 
  AlertTriangle, RefreshCw, Play, Pause, Stop, Upload, Download, 
  Eye, EyeOff, Lock, Unlock, Plus, Minus, Edit, Trash2, Copy, 
  Search, Filter, BarChart3, Calendar, Clock, TrendingUp, 
  AlertCircle, Zap, Target, Shield, Users, MessageSquare, Send, 
  ArrowRight, ArrowLeft, ChevronDown, ChevronUp, X, Save, Home, 
  FolderOpen, Archive, BookOpen, Lightbulb, Activity, Network, 
  Layers, Box, Map, GitBranch, Sync, Workflow, Monitor, Bell, 
  Key, Hash, Grid, Star, ThumbsUp, ThumbsDown, Award, Bookmark
} from 'lucide-react';

// Charts
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Services & Types
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { catalogAIService } from '../../services/catalog-ai.service';
import { dataProfilingService } from '../../services/data-profiling.service';
import type { 
  MetadataEnrichment, 
  EnrichmentJob, 
  EnrichmentRule, 
  DataAsset, 
  MetadataField,
  EnrichmentSuggestion,
  EnrichmentMetrics,
  SemanticAnnotation,
  QualityScore
} from '../../types/catalog-core.types';

// Constants
import { 
  ENRICHMENT_STRATEGIES, 
  METADATA_CATEGORIES, 
  QUALITY_THRESHOLDS,
  ENRICHMENT_SETTINGS 
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

interface MetadataEnrichmentEngineProps {
  assets?: DataAsset[];
  onEnrichmentComplete?: (results: EnrichmentMetrics) => void;
  onSuggestionApplied?: (suggestion: EnrichmentSuggestion) => void;
  className?: string;
}

interface EnrichmentConfig {
  id: string;
  name: string;
  description: string;
  strategies: string[];
  target_assets: string[];
  rules: EnrichmentRule[];
  ai_settings: {
    use_nlp: boolean;
    use_ml_classification: boolean;
    use_semantic_analysis: boolean;
    confidence_threshold: number;
    auto_apply_threshold: number;
  };
  quality_settings: {
    enable_quality_scoring: boolean;
    quality_thresholds: Record<string, number>;
    flag_low_quality: boolean;
  };
  automation_settings: {
    auto_enrich: boolean;
    batch_size: number;
    schedule: string;
    retry_failed: boolean;
  };
}

interface EnrichmentSuggestionDetail {
  id: string;
  asset_id: string;
  field: string;
  current_value?: string;
  suggested_value: string;
  confidence: number;
  source: string;
  reasoning: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  auto_applicable: boolean;
  user_feedback?: 'accepted' | 'rejected' | 'modified';
}

interface MetadataQualityAssessment {
  asset_id: string;
  overall_score: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  issues: Array<{
    field: string;
    issue_type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion?: string;
  }>;
  improvement_recommendations: string[];
}

// ============================================================================
// ENRICHMENT CONFIGURATION PANEL
// ============================================================================

const EnrichmentConfigPanel: React.FC<{
  config: EnrichmentConfig;
  onConfigChange: (config: EnrichmentConfig) => void;
  assets: DataAsset[];
  rules: EnrichmentRule[];
}> = ({ config, onConfigChange, assets, rules }) => {
  const [activeTab, setActiveTab] = useState('general');

  const updateConfig = useCallback((updates: Partial<EnrichmentConfig>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Enrichment Configuration
        </CardTitle>
        <CardDescription>
          Configure AI-powered metadata enrichment settings and rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="config-name">Configuration Name</Label>
                <Input
                  id="config-name"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="Enter configuration name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strategies">Enrichment Strategies</Label>
                <Select 
                  value={config.strategies[0] || ''} 
                  onValueChange={(value) => updateConfig({ strategies: [value] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENRICHMENT_STRATEGIES.map(strategy => (
                      <SelectItem key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Describe the enrichment configuration"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Target Assets</Label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={config.target_assets.includes(asset.id)}
                      onCheckedChange={(checked) => {
                        const updatedAssets = checked
                          ? [...config.target_assets, asset.id]
                          : config.target_assets.filter(id => id !== asset.id);
                        updateConfig({ target_assets: updatedAssets });
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">{asset.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Enrichment Rules</Label>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={config.rules.some(r => r.id === rule.id)}
                        onCheckedChange={(checked) => {
                          const updatedRules = checked
                            ? [...config.rules, rule]
                            : config.rules.filter(r => r.id !== rule.id);
                          updateConfig({ rules: updatedRules });
                        }}
                      />
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">{rule.description}</div>
                      </div>
                    </div>
                    <Badge variant="outline">{rule.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="space-y-4">
              <Label>AI Enhancement Features</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-nlp"
                    checked={config.ai_settings.use_nlp}
                    onCheckedChange={(checked) => updateConfig({
                      ai_settings: { ...config.ai_settings, use_nlp: checked }
                    })}
                  />
                  <Label htmlFor="use-nlp">Natural Language Processing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-ml"
                    checked={config.ai_settings.use_ml_classification}
                    onCheckedChange={(checked) => updateConfig({
                      ai_settings: { ...config.ai_settings, use_ml_classification: checked }
                    })}
                  />
                  <Label htmlFor="use-ml">ML Classification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-semantic"
                    checked={config.ai_settings.use_semantic_analysis}
                    onCheckedChange={(checked) => updateConfig({
                      ai_settings: { ...config.ai_settings, use_semantic_analysis: checked }
                    })}
                  />
                  <Label htmlFor="use-semantic">Semantic Analysis</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="confidence-threshold"
                    type="number"
                    value={config.ai_settings.confidence_threshold}
                    onChange={(e) => updateConfig({
                      ai_settings: { ...config.ai_settings, confidence_threshold: parseFloat(e.target.value) }
                    })}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(config.ai_settings.confidence_threshold * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto-apply-threshold">Auto-Apply Threshold</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="auto-apply-threshold"
                    type="number"
                    value={config.ai_settings.auto_apply_threshold}
                    onChange={(e) => updateConfig({
                      ai_settings: { ...config.ai_settings, auto_apply_threshold: parseFloat(e.target.value) }
                    })}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(config.ai_settings.auto_apply_threshold * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-quality"
                checked={config.quality_settings.enable_quality_scoring}
                onCheckedChange={(checked) => updateConfig({
                  quality_settings: { ...config.quality_settings, enable_quality_scoring: checked }
                })}
              />
              <Label htmlFor="enable-quality">Enable Quality Scoring</Label>
            </div>

            {config.quality_settings.enable_quality_scoring && (
              <>
                <div className="space-y-4">
                  <Label>Quality Thresholds</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Completeness</Label>
                      <Input
                        type="number"
                        value={config.quality_settings.quality_thresholds.completeness || 0.8}
                        onChange={(e) => updateConfig({
                          quality_settings: {
                            ...config.quality_settings,
                            quality_thresholds: {
                              ...config.quality_settings.quality_thresholds,
                              completeness: parseFloat(e.target.value)
                            }
                          }
                        })}
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Accuracy</Label>
                      <Input
                        type="number"
                        value={config.quality_settings.quality_thresholds.accuracy || 0.9}
                        onChange={(e) => updateConfig({
                          quality_settings: {
                            ...config.quality_settings,
                            quality_thresholds: {
                              ...config.quality_settings.quality_thresholds,
                              accuracy: parseFloat(e.target.value)
                            }
                          }
                        })}
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="flag-low-quality"
                    checked={config.quality_settings.flag_low_quality}
                    onCheckedChange={(checked) => updateConfig({
                      quality_settings: { ...config.quality_settings, flag_low_quality: checked }
                    })}
                  />
                  <Label htmlFor="flag-low-quality">Flag Low Quality Metadata</Label>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-enrich"
                checked={config.automation_settings.auto_enrich}
                onCheckedChange={(checked) => updateConfig({
                  automation_settings: { ...config.automation_settings, auto_enrich: checked }
                })}
              />
              <Label htmlFor="auto-enrich">Enable Auto-Enrichment</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={config.automation_settings.batch_size}
                  onChange={(e) => updateConfig({
                    automation_settings: { ...config.automation_settings, batch_size: parseInt(e.target.value) }
                  })}
                  min="1"
                  max="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select 
                  value={config.automation_settings.schedule}
                  onValueChange={(value) => updateConfig({
                    automation_settings: { ...config.automation_settings, schedule: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="retry-failed"
                checked={config.automation_settings.retry_failed}
                onCheckedChange={(checked) => updateConfig({
                  automation_settings: { ...config.automation_settings, retry_failed: checked }
                })}
              />
              <Label htmlFor="retry-failed">Retry Failed Enrichments</Label>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// ENRICHMENT SUGGESTIONS PANEL
// ============================================================================

const EnrichmentSuggestionsPanel: React.FC<{
  suggestions: EnrichmentSuggestionDetail[];
  onSuggestionAction: (action: string, suggestionId: string, value?: string) => void;
  onBulkAction: (action: string, suggestionIds: string[]) => void;
}> = ({ suggestions, onSuggestionAction, onBulkAction }) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const filteredSuggestions = useMemo(() => {
    let filtered = suggestions;

    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(suggestion =>
        suggestion.field.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        suggestion.suggested_value.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        suggestion.reasoning.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.category === filterCategory);
    }

    // Apply impact filter
    if (filterImpact !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.impact === filterImpact);
    }

    return filtered.sort((a, b) => b.confidence - a.confidence);
  }, [suggestions, debouncedSearchTerm, filterCategory, filterImpact]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(suggestions.map(s => s.category)));
    return uniqueCategories.sort();
  }, [suggestions]);

  const handleSelectAll = useCallback(() => {
    if (selectedSuggestions.length === filteredSuggestions.length) {
      setSelectedSuggestions([]);
    } else {
      setSelectedSuggestions(filteredSuggestions.map(s => s.id));
    }
  }, [selectedSuggestions, filteredSuggestions]);

  const handleSelectSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Suggestions Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Total Suggestions</div>
              <div className="text-xl font-bold">{suggestions.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
              <div className="text-xl font-bold">
                {suggestions.filter(s => s.confidence >= 0.9).length}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <div>
              <div className="text-sm text-muted-foreground">Auto-Applicable</div>
              <div className="text-xl font-bold">
                {suggestions.filter(s => s.auto_applicable).length}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">High Impact</div>
              <div className="text-xl font-bold">
                {suggestions.filter(s => s.impact === 'high').length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suggestions..."
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
            <Select value={filterImpact} onValueChange={setFilterImpact}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impact</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedSuggestions.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedSuggestions.length} selected
            </span>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('accept', selectedSuggestions)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('reject', selectedSuggestions)}>
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('defer', selectedSuggestions)}>
              <Clock className="h-4 w-4 mr-2" />
              Defer
            </Button>
          </div>
        )}
      </Card>

      {/* Suggestions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Enrichment Suggestions</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedSuggestions.length === filteredSuggestions.length && filteredSuggestions.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredSuggestions.map((suggestion, index) => (
              <div key={suggestion.id} className={`p-4 border-b last:border-b-0 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedSuggestions.includes(suggestion.id)}
                      onCheckedChange={() => handleSelectSuggestion(suggestion.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{suggestion.field}</span>
                        <Badge variant="outline">{suggestion.category}</Badge>
                        <Badge className={getImpactColor(suggestion.impact)}>
                          {suggestion.impact} impact
                        </Badge>
                        {suggestion.auto_applicable && (
                          <Badge variant="secondary">Auto-applicable</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current: </span>
                            <span className="font-mono">{suggestion.current_value || 'None'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Suggested: </span>
                            <span className="font-mono font-medium">{suggestion.suggested_value}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Reasoning: </span>
                          {suggestion.reasoning}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Source: {suggestion.source}</span>
                          <span>•</span>
                          <span>Asset: {suggestion.asset_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {(suggestion.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onSuggestionAction('accept', suggestion.id)}
                        title="Accept suggestion"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onSuggestionAction('reject', suggestion.id)}
                        title="Reject suggestion"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onSuggestionAction('edit', suggestion.id)}
                        title="Edit suggestion"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredSuggestions.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">No Suggestions Found</div>
              <div>Try adjusting your filters or run enrichment analysis</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// QUALITY ASSESSMENT PANEL
// ============================================================================

const QualityAssessmentPanel: React.FC<{
  assessments: MetadataQualityAssessment[];
  onImprovementAction: (assetId: string, action: string) => void;
}> = ({ assessments, onImprovementAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const filteredAssessments = useMemo(() => {
    let filtered = assessments;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(assessment =>
        assessment.asset_id.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => a.overall_score - b.overall_score);
  }, [assessments, debouncedSearchTerm]);

  const overallStats = useMemo(() => {
    if (assessments.length === 0) return { avgScore: 0, highQuality: 0, lowQuality: 0 };
    
    const avgScore = assessments.reduce((sum, a) => sum + a.overall_score, 0) / assessments.length;
    const highQuality = assessments.filter(a => a.overall_score >= 0.8).length;
    const lowQuality = assessments.filter(a => a.overall_score < 0.6).length;
    
    return { avgScore, highQuality, lowQuality };
  }, [assessments]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return 'bg-green-50';
    if (score >= 0.6) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Average Score</div>
              <div className="text-xl font-bold">{(overallStats.avgScore * 100).toFixed(1)}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">High Quality</div>
              <div className="text-xl font-bold">{overallStats.highQuality}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Low Quality</div>
              <div className="text-xl font-bold">{overallStats.lowQuality}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
              <div className="text-xl font-bold">{assessments.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Quality Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata Quality Assessments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.asset_id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">{assessment.asset_id}</div>
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.overall_score)}`}>
                    {(assessment.overall_score * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onImprovementAction(assessment.asset_id, 'improve')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Improve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onImprovementAction(assessment.asset_id, 'details')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>

              {/* Quality Dimensions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Completeness</div>
                  <div className={`font-bold ${getScoreColor(assessment.completeness)}`}>
                    {(assessment.completeness * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className={`font-bold ${getScoreColor(assessment.accuracy)}`}>
                    {(assessment.accuracy * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Consistency</div>
                  <div className={`font-bold ${getScoreColor(assessment.consistency)}`}>
                    {(assessment.consistency * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Timeliness</div>
                  <div className={`font-bold ${getScoreColor(assessment.timeliness)}`}>
                    {(assessment.timeliness * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Issues */}
              {assessment.issues.length > 0 && (
                <div className="space-y-2">
                  <Label>Quality Issues</Label>
                  <div className="space-y-1">
                    {assessment.issues.slice(0, 3).map((issue, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className={`h-3 w-3 ${
                            issue.severity === 'high' ? 'text-red-500' : 
                            issue.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <span>{issue.field}: {issue.description}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {issue.severity}
                        </Badge>
                      </div>
                    ))}
                    {assessment.issues.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{assessment.issues.length - 3} more issues
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {assessment.improvement_recommendations.length > 0 && (
                <div className="space-y-2">
                  <Label>Improvement Recommendations</Label>
                  <div className="space-y-1">
                    {assessment.improvement_recommendations.slice(0, 2).map((rec, index) => (
                      <div key={index} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded">
                        <Lightbulb className="h-3 w-3 inline mr-2 text-blue-500" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
          
          {filteredAssessments.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">No Quality Assessments</div>
              <div>Run quality analysis to see metadata quality scores</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN METADATA ENRICHMENT ENGINE COMPONENT
// ============================================================================

export const MetadataEnrichmentEngine: React.FC<MetadataEnrichmentEngineProps> = ({
  assets = [],
  onEnrichmentComplete,
  onSuggestionApplied,
  className
}) => {
  const [activeView, setActiveView] = useState<'config' | 'suggestions' | 'quality'>('suggestions');
  const [enrichmentConfig, setEnrichmentConfig] = useState<EnrichmentConfig>({
    id: `enrichment_${Date.now()}`,
    name: 'Default Enrichment Configuration',
    description: 'AI-powered metadata enrichment with quality assessment',
    strategies: ['ai_nlp'],
    target_assets: assets.map(a => a.id),
    rules: [],
    ai_settings: {
      use_nlp: true,
      use_ml_classification: true,
      use_semantic_analysis: true,
      confidence_threshold: 0.7,
      auto_apply_threshold: 0.9
    },
    quality_settings: {
      enable_quality_scoring: true,
      quality_thresholds: {
        completeness: 0.8,
        accuracy: 0.9,
        consistency: 0.85,
        timeliness: 0.7
      },
      flag_low_quality: true
    },
    automation_settings: {
      auto_enrich: false,
      batch_size: 50,
      schedule: 'daily',
      retry_failed: true
    }
  });

  // Queries
  const { data: enrichmentSuggestions = [] } = useQuery({
    queryKey: ['enrichment-suggestions', enrichmentConfig.target_assets],
    queryFn: () => intelligentDiscoveryService.getEnrichmentSuggestions(enrichmentConfig.target_assets),
    enabled: enrichmentConfig.target_assets.length > 0
  });

  const { data: qualityAssessments = [] } = useQuery({
    queryKey: ['quality-assessments', enrichmentConfig.target_assets],
    queryFn: () => intelligentDiscoveryService.getQualityAssessments(enrichmentConfig.target_assets),
    enabled: enrichmentConfig.target_assets.length > 0 && enrichmentConfig.quality_settings.enable_quality_scoring
  });

  const { data: enrichmentRules = [] } = useQuery({
    queryKey: ['enrichment-rules'],
    queryFn: () => intelligentDiscoveryService.getEnrichmentRules()
  });

  const { data: enrichmentJobs = [] } = useQuery({
    queryKey: ['enrichment-jobs'],
    queryFn: () => intelligentDiscoveryService.getEnrichmentJobs(),
    refetchInterval: 5000
  });

  // Mutations
  const startEnrichmentMutation = useMutation({
    mutationFn: (config: EnrichmentConfig) => 
      intelligentDiscoveryService.startEnrichment(config),
    onSuccess: (results) => {
      toast.success('Enrichment process started successfully');
      onEnrichmentComplete?.(results);
    },
    onError: (error) => {
      toast.error('Failed to start enrichment process');
      console.error('Enrichment error:', error);
    }
  });

  const suggestionActionMutation = useMutation({
    mutationFn: ({ action, suggestionId, value }: { action: string; suggestionId: string; value?: string }) =>
      intelligentDiscoveryService.handleSuggestionAction(suggestionId, action, value),
    onSuccess: (result, variables) => {
      if (variables.action === 'accept') {
        toast.success('Suggestion applied successfully');
        onSuggestionApplied?.(result);
      } else {
        toast.success(`Suggestion ${variables.action} successful`);
      }
    }
  });

  const bulkSuggestionMutation = useMutation({
    mutationFn: ({ action, suggestionIds }: { action: string; suggestionIds: string[] }) =>
      intelligentDiscoveryService.handleBulkSuggestionAction(suggestionIds, action),
    onSuccess: (_, variables) => {
      toast.success(`Bulk ${variables.action} completed successfully`);
    }
  });

  const qualityImprovementMutation = useMutation({
    mutationFn: ({ assetId, action }: { assetId: string; action: string }) =>
      intelligentDiscoveryService.performQualityImprovement(assetId, action),
    onSuccess: (_, variables) => {
      toast.success(`Quality improvement for ${variables.assetId} successful`);
    }
  });

  // Handlers
  const handleStartEnrichment = useCallback(() => {
    startEnrichmentMutation.mutate(enrichmentConfig);
  }, [enrichmentConfig, startEnrichmentMutation]);

  const handleSuggestionAction = useCallback((action: string, suggestionId: string, value?: string) => {
    suggestionActionMutation.mutate({ action, suggestionId, value });
  }, [suggestionActionMutation]);

  const handleBulkAction = useCallback((action: string, suggestionIds: string[]) => {
    bulkSuggestionMutation.mutate({ action, suggestionIds });
  }, [bulkSuggestionMutation]);

  const handleQualityImprovement = useCallback((assetId: string, action: string) => {
    qualityImprovementMutation.mutate({ assetId, action });
  }, [qualityImprovementMutation]);

  const { useCatalogAI: aiHook } = useCatalogAI();
  const { useCatalogDiscovery: discoveryHook } = useCatalogDiscovery();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metadata Enrichment Engine</h1>
          <p className="text-muted-foreground">
            AI-powered metadata enhancement with quality assessment and intelligent suggestions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button 
            onClick={handleStartEnrichment}
            disabled={enrichmentConfig.target_assets.length === 0 || startEnrichmentMutation.isPending}
          >
            {startEnrichmentMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Enrichment
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Tabs value={activeView} onValueChange={setActiveView as any}>
        <TabsList>
          <TabsTrigger value="suggestions">
            Suggestions
            <Badge variant="secondary" className="ml-2">
              {enrichmentSuggestions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="quality">
            Quality Assessment
            <Badge variant="secondary" className="ml-2">
              {qualityAssessments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          <EnrichmentSuggestionsPanel
            suggestions={enrichmentSuggestions}
            onSuggestionAction={handleSuggestionAction}
            onBulkAction={handleBulkAction}
          />
        </TabsContent>

        <TabsContent value="quality">
          <QualityAssessmentPanel
            assessments={qualityAssessments}
            onImprovementAction={handleQualityImprovement}
          />
        </TabsContent>

        <TabsContent value="config">
          <EnrichmentConfigPanel
            config={enrichmentConfig}
            onConfigChange={setEnrichmentConfig}
            assets={assets}
            rules={enrichmentRules}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetadataEnrichmentEngine;