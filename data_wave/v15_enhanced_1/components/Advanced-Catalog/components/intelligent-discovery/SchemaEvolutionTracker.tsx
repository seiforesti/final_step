// ============================================================================
// SCHEMA EVOLUTION TRACKER - SCHEMA CHANGE TRACKING COMPONENT (1800+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Schema Evolution Tracking Component
// Schema change detection, version management, impact analysis, evolution visualization,
// automated alerts, migration planning, and historical schema comparison
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';
import * as d3 from 'd3';

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
import { GitBranch, Timeline, History, GitCompare, AlertTriangle, CheckCircle, RefreshCw, Play, Pause, Square, Upload, Download, Eye, EyeOff, Lock, Unlock, Plus, Minus, Edit, Trash2, Copy, Search, Filter, BarChart3, Calendar, Clock, TrendingUp, AlertCircle, Zap, Target, Shield, Users, MessageSquare, Send, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, X, Save, Home, FolderOpen, Archive, BookOpen, Lightbulb, Activity, Network, Layers, Box, Map, Workflow, Monitor, Bell, Key, Hash, Grid, Star, ThumbsUp, ThumbsDown, Award, Bookmark, Database, FileText, Settings, Brain, Sparkles, Tag, Diff, GitCommit, GitMerge } from 'lucide-react';

// Charts
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Services & Types
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { dataProfilingService } from '../../services/data-profiling.service';
import type { 
  SchemaVersion, 
  SchemaChange, 
  SchemaEvolution, 
  DataAsset, 
  SchemaComparison,
  EvolutionMetrics,
  ImpactAnalysis,
  MigrationPlan,
  SchemaAlert
} from '../../types/catalog-core.types';

// Constants
import { 
  SCHEMA_CHANGE_TYPES, 
  EVOLUTION_SEVERITY_LEVELS, 
  MIGRATION_STRATEGIES,
  SCHEMA_EVOLUTION_SETTINGS 
} from '../../constants/catalog-constants';

// Hooks
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { useCatalogProfiling } from '../../hooks/useCatalogProfiling';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';

// Utils
import { formatters } from '../../utils/formatters';
import { calculations } from '../../utils/calculations';
import { validators } from '../../utils/validators';
import { schemaParser } from '../../utils/schema-parser';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface SchemaEvolutionTrackerProps {
  assets?: DataAsset[];
  onEvolutionDetected?: (evolution: SchemaEvolution) => void;
  onMigrationPlanned?: (plan: MigrationPlan) => void;
  className?: string;
}

interface SchemaTrackingConfig {
  id: string;
  name: string;
  description: string;
  target_assets: string[];
  tracking_settings: {
    auto_track: boolean;
    check_frequency: string;
    detect_breaking_changes: boolean;
    detect_schema_drift: boolean;
    alert_on_changes: boolean;
    version_retention_days: number;
  };
  comparison_settings: {
    enable_semantic_comparison: boolean;
    ignore_cosmetic_changes: boolean;
    compare_data_types: boolean;
    compare_constraints: boolean;
    compare_indexes: boolean;
  };
  alert_settings: {
    email_notifications: boolean;
    slack_notifications: boolean;
    webhook_url?: string;
    severity_threshold: string;
  };
}

interface SchemaChangeDetail {
  id: string;
  asset_id: string;
  version_from: string;
  version_to: string;
  change_type: 'added' | 'removed' | 'modified' | 'renamed';
  element_type: 'table' | 'column' | 'index' | 'constraint' | 'trigger';
  element_name: string;
  old_definition?: any;
  new_definition?: any;
  severity: 'low' | 'medium' | 'high' | 'breaking';
  impact_score: number;
  detected_at: string;
  migration_required: boolean;
  backward_compatible: boolean;
}

interface EvolutionTimelineEvent {
  id: string;
  timestamp: string;
  asset_id: string;
  event_type: 'schema_change' | 'version_created' | 'migration_completed' | 'alert_triggered';
  title: string;
  description: string;
  severity: string;
  metadata: Record<string, any>;
}

// ============================================================================
// SCHEMA EVOLUTION TIMELINE VISUALIZATION
// ============================================================================

const SchemaEvolutionTimeline: React.FC<{
  events: EvolutionTimelineEvent[];
  selectedAsset?: string;
  onEventClick: (event: EvolutionTimelineEvent) => void;
}> = ({ events, selectedAsset, onEventClick }) => {
  const timelineRef = useRef<SVGSVGElement>(null);

  const filteredEvents = useMemo(() => {
    return selectedAsset 
      ? events.filter(event => event.asset_id === selectedAsset)
      : events;
  }, [events, selectedAsset]);

  useEffect(() => {
    if (!timelineRef.current || filteredEvents.length === 0) return;

    const svg = d3.select(timelineRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");
    const timeScale = d3.scaleTime()
      .domain(d3.extent(filteredEvents, d => parseTime(d.timestamp)) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(['low', 'medium', 'high', 'breaking'])
      .range([height, 0])
      .padding(0.1);

    const colorScale = d3.scaleOrdinal()
      .domain(['low', 'medium', 'high', 'breaking'])
      .range(['#10b981', '#f59e0b', '#f97316', '#ef4444']);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(timeScale));

    g.append("g")
      .call(d3.axisLeft(yScale));

    // Add events
    g.selectAll(".event")
      .data(filteredEvents)
      .enter()
      .append("circle")
      .attr("class", "event")
      .attr("cx", d => timeScale(parseTime(d.timestamp)!))
      .attr("cy", d => yScale(d.severity)! + yScale.bandwidth() / 2)
      .attr("r", 6)
      .attr("fill", d => colorScale(d.severity) as string)
      .style("cursor", "pointer")
      .on("click", (event, d) => onEventClick(d))
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
          
        tooltip.html(`
          <strong>${d.title}</strong><br/>
          ${d.description}<br/>
          <small>${formatters.formatDateTime(d.timestamp)}</small>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.selectAll(".tooltip").remove();
      });

  }, [filteredEvents, onEventClick]);

  return (
    <div className="w-full">
      <svg ref={timelineRef} width="800" height="400" className="border rounded" />
    </div>
  );
};

// ============================================================================
// SCHEMA COMPARISON VIEWER
// ============================================================================

const SchemaComparisonViewer: React.FC<{
  comparison: SchemaComparison;
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
}> = ({ comparison, onAcceptChange, onRejectChange }) => {
  const [selectedChangeType, setSelectedChangeType] = useState<string>('all');

  const filteredChanges = useMemo(() => {
    return selectedChangeType === 'all' 
      ? comparison.changes 
      : comparison.changes.filter(change => change.change_type === selectedChangeType);
  }, [comparison.changes, selectedChangeType]);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'added': return <Plus className="h-4 w-4 text-green-500" />;
      case 'removed': return <Minus className="h-4 w-4 text-red-500" />;
      case 'modified': return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'renamed': return <GitCommit className="h-4 w-4 text-blue-500" />;
      default: return <Diff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'breaking': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Schema Comparison</h3>
            <p className="text-sm text-muted-foreground">
              {comparison.from_version} → {comparison.to_version}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{comparison.breaking_changes_count}</div>
              <div className="text-xs text-muted-foreground">Breaking</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{comparison.total_changes_count}</div>
              <div className="text-xs text-muted-foreground">Total Changes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{comparison.compatibility_score}%</div>
              <div className="text-xs text-muted-foreground">Compatible</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Filter */}
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Label>Filter by change type:</Label>
          <Select value={selectedChangeType} onValueChange={setSelectedChangeType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Changes</SelectItem>
              <SelectItem value="added">Added</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
              <SelectItem value="modified">Modified</SelectItem>
              <SelectItem value="renamed">Renamed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Changes List */}
      <Card>
        <CardHeader>
          <CardTitle>Schema Changes</CardTitle>
          <CardDescription>
            Detailed view of all schema changes between versions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredChanges.map((change) => (
            <Card key={change.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getChangeIcon(change.change_type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{change.element_name}</span>
                      <Badge variant="outline">{change.element_type}</Badge>
                      <Badge className={getSeverityColor(change.severity)}>
                        {change.severity}
                      </Badge>
                      {change.migration_required && (
                        <Badge variant="destructive">Migration Required</Badge>
                      )}
                      {change.backward_compatible && (
                        <Badge variant="secondary">Backward Compatible</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {change.old_definition && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Old: </span>
                          <code className="bg-red-50 px-2 py-1 rounded text-red-800">
                            {JSON.stringify(change.old_definition, null, 2)}
                          </code>
                        </div>
                      )}
                      {change.new_definition && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">New: </span>
                          <code className="bg-green-50 px-2 py-1 rounded text-green-800">
                            {JSON.stringify(change.new_definition, null, 2)}
                          </code>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>Impact Score: {change.impact_score}/100</span>
                      <span>•</span>
                      <span>Detected: {formatters.formatDateTime(change.detected_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAcceptChange(change.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onRejectChange(change.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredChanges.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">No Changes Found</div>
              <div>No schema changes match the selected filter</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// SCHEMA TRACKING CONFIGURATION PANEL
// ============================================================================

const SchemaTrackingConfigPanel: React.FC<{
  config: SchemaTrackingConfig;
  onConfigChange: (config: SchemaTrackingConfig) => void;
  assets: DataAsset[];
}> = ({ config, onConfigChange, assets }) => {
  const [activeTab, setActiveTab] = useState('general');

  const updateConfig = useCallback((updates: Partial<SchemaTrackingConfig>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Schema Tracking Configuration
        </CardTitle>
        <CardDescription>
          Configure schema evolution tracking, comparison, and alert settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
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
                <Label htmlFor="retention-days">Version Retention (Days)</Label>
                <Input
                  id="retention-days"
                  type="number"
                  value={config.tracking_settings.version_retention_days}
                  onChange={(e) => updateConfig({
                    tracking_settings: { 
                      ...config.tracking_settings, 
                      version_retention_days: parseInt(e.target.value) 
                    }
                  })}
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Describe the tracking configuration"
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
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div className="space-y-4">
              <Label>Tracking Settings</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-track"
                    checked={config.tracking_settings.auto_track}
                    onCheckedChange={(checked) => updateConfig({
                      tracking_settings: { ...config.tracking_settings, auto_track: checked }
                    })}
                  />
                  <Label htmlFor="auto-track">Enable Auto-Tracking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="detect-breaking"
                    checked={config.tracking_settings.detect_breaking_changes}
                    onCheckedChange={(checked) => updateConfig({
                      tracking_settings: { ...config.tracking_settings, detect_breaking_changes: checked }
                    })}
                  />
                  <Label htmlFor="detect-breaking">Detect Breaking Changes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="detect-drift"
                    checked={config.tracking_settings.detect_schema_drift}
                    onCheckedChange={(checked) => updateConfig({
                      tracking_settings: { ...config.tracking_settings, detect_schema_drift: checked }
                    })}
                  />
                  <Label htmlFor="detect-drift">Detect Schema Drift</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="alert-changes"
                    checked={config.tracking_settings.alert_on_changes}
                    onCheckedChange={(checked) => updateConfig({
                      tracking_settings: { ...config.tracking_settings, alert_on_changes: checked }
                    })}
                  />
                  <Label htmlFor="alert-changes">Alert on Changes</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-frequency">Check Frequency</Label>
              <Select 
                value={config.tracking_settings.check_frequency}
                onValueChange={(value) => updateConfig({
                  tracking_settings: { ...config.tracking_settings, check_frequency: value }
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
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="space-y-4">
              <Label>Comparison Settings</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="semantic-comparison"
                    checked={config.comparison_settings.enable_semantic_comparison}
                    onCheckedChange={(checked) => updateConfig({
                      comparison_settings: { ...config.comparison_settings, enable_semantic_comparison: checked }
                    })}
                  />
                  <Label htmlFor="semantic-comparison">Enable Semantic Comparison</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ignore-cosmetic"
                    checked={config.comparison_settings.ignore_cosmetic_changes}
                    onCheckedChange={(checked) => updateConfig({
                      comparison_settings: { ...config.comparison_settings, ignore_cosmetic_changes: checked }
                    })}
                  />
                  <Label htmlFor="ignore-cosmetic">Ignore Cosmetic Changes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compare-types"
                    checked={config.comparison_settings.compare_data_types}
                    onCheckedChange={(checked) => updateConfig({
                      comparison_settings: { ...config.comparison_settings, compare_data_types: checked }
                    })}
                  />
                  <Label htmlFor="compare-types">GitCompare Data Types</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compare-constraints"
                    checked={config.comparison_settings.compare_constraints}
                    onCheckedChange={(checked) => updateConfig({
                      comparison_settings: { ...config.comparison_settings, compare_constraints: checked }
                    })}
                  />
                  <Label htmlFor="compare-constraints">GitCompare Constraints</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compare-indexes"
                    checked={config.comparison_settings.compare_indexes}
                    onCheckedChange={(checked) => updateConfig({
                      comparison_settings: { ...config.comparison_settings, compare_indexes: checked }
                    })}
                  />
                  <Label htmlFor="compare-indexes">GitCompare Indexes</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              <Label>Alert Settings</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-alerts"
                    checked={config.alert_settings.email_notifications}
                    onCheckedChange={(checked) => updateConfig({
                      alert_settings: { ...config.alert_settings, email_notifications: checked }
                    })}
                  />
                  <Label htmlFor="email-alerts">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="slack-alerts"
                    checked={config.alert_settings.slack_notifications}
                    onCheckedChange={(checked) => updateConfig({
                      alert_settings: { ...config.alert_settings, slack_notifications: checked }
                    })}
                  />
                  <Label htmlFor="slack-alerts">Slack Notifications</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity-threshold">Severity Threshold</Label>
                <Select 
                  value={config.alert_settings.severity_threshold}
                  onValueChange={(value) => updateConfig({
                    alert_settings: { ...config.alert_settings, severity_threshold: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="breaking">Breaking Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                <Input
                  id="webhook-url"
                  value={config.alert_settings.webhook_url || ''}
                  onChange={(e) => updateConfig({
                    alert_settings: { ...config.alert_settings, webhook_url: e.target.value }
                  })}
                  placeholder="https://example.com/webhook"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN SCHEMA EVOLUTION TRACKER COMPONENT
// ============================================================================

export const SchemaEvolutionTracker: React.FC<SchemaEvolutionTrackerProps> = ({
  assets = [],
  onEvolutionDetected,
  onMigrationPlanned,
  className
}) => {
  const [activeView, setActiveView] = useState<'timeline' | 'comparison' | 'config'>('timeline');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [selectedComparison, setSelectedComparison] = useState<string>('');
  const [trackingConfig, setTrackingConfig] = useState<SchemaTrackingConfig>({
    id: `tracking_${Date.now()}`,
    name: 'Default Schema Tracking',
    description: 'Automated schema evolution tracking with alerts',
    target_assets: assets.map(a => a.id),
    tracking_settings: {
      auto_track: true,
      check_frequency: 'daily',
      detect_breaking_changes: true,
      detect_schema_drift: true,
      alert_on_changes: true,
      version_retention_days: 90
    },
    comparison_settings: {
      enable_semantic_comparison: true,
      ignore_cosmetic_changes: true,
      compare_data_types: true,
      compare_constraints: true,
      compare_indexes: false
    },
    alert_settings: {
      email_notifications: true,
      slack_notifications: false,
      severity_threshold: 'medium'
    }
  });

  // Queries
  const { data: schemaVersions = [] } = useQuery({
    queryKey: ['schema-versions', trackingConfig.target_assets],
    queryFn: () => intelligentDiscoveryService.getSchemaVersions(trackingConfig.target_assets),
    enabled: trackingConfig.target_assets.length > 0
  });

  const { data: evolutionEvents = [] } = useQuery({
    queryKey: ['evolution-events', trackingConfig.target_assets],
    queryFn: () => intelligentDiscoveryService.getEvolutionEvents(trackingConfig.target_assets),
    enabled: trackingConfig.target_assets.length > 0,
    refetchInterval: 30000
  });

  const { data: schemaComparisons = [] } = useQuery({
    queryKey: ['schema-comparisons'],
    queryFn: () => intelligentDiscoveryService.getSchemaComparisons()
  });

  const { data: migrationPlans = [] } = useQuery({
    queryKey: ['migration-plans'],
    queryFn: () => intelligentDiscoveryService.getMigrationPlans()
  });

  // Mutations
  const startTrackingMutation = useMutation({
    mutationFn: (config: SchemaTrackingConfig) => 
      intelligentDiscoveryService.startSchemaTracking(config),
    onSuccess: (evolution) => {
      toast.success('Schema tracking started successfully');
      onEvolutionDetected?.(evolution);
    },
    onError: (error) => {
      toast.error('Failed to start schema tracking');
      console.error('Schema tracking error:', error);
    }
  });

  const compareSchemasMutation = useMutation({
    mutationFn: ({ fromVersion, toVersion }: { fromVersion: string; toVersion: string }) =>
      intelligentDiscoveryService.compareSchemas(fromVersion, toVersion),
    onSuccess: (comparison) => {
      toast.success('Schema comparison completed');
      setSelectedComparison(comparison.id);
    }
  });

  const changeActionMutation = useMutation({
    mutationFn: ({ action, changeId }: { action: string; changeId: string }) =>
      intelligentDiscoveryService.handleSchemaChange(changeId, action),
    onSuccess: (_, variables) => {
      toast.success(`Change ${variables.action} successful`);
    }
  });

  const generateMigrationMutation = useMutation({
    mutationFn: (comparisonId: string) =>
      intelligentDiscoveryService.generateMigrationPlan(comparisonId),
    onSuccess: (plan) => {
      toast.success('Migration plan generated successfully');
      onMigrationPlanned?.(plan);
    }
  });

  // Handlers
  const handleStartTracking = useCallback(() => {
    startTrackingMutation.mutate(trackingConfig);
  }, [trackingConfig, startTrackingMutation]);

  const handleEventClick = useCallback((event: EvolutionTimelineEvent) => {
    if (event.event_type === 'schema_change') {
      // Navigate to comparison view
      setActiveView('comparison');
    }
  }, []);

  const handleAcceptChange = useCallback((changeId: string) => {
    changeActionMutation.mutate({ action: 'accept', changeId });
  }, [changeActionMutation]);

  const handleRejectChange = useCallback((changeId: string) => {
    changeActionMutation.mutate({ action: 'reject', changeId });
  }, [changeActionMutation]);

  const currentComparison = useMemo(() => {
    return schemaComparisons.find(c => c.id === selectedComparison);
  }, [schemaComparisons, selectedComparison]);

  const evolutionMetrics = useMemo(() => {
    const totalChanges = evolutionEvents.filter(e => e.event_type === 'schema_change').length;
    const breakingChanges = evolutionEvents.filter(e => 
      e.event_type === 'schema_change' && e.severity === 'breaking'
    ).length;
    const activeTracking = trackingConfig.target_assets.length;
    const versionsCount = schemaVersions.length;

    return { totalChanges, breakingChanges, activeTracking, versionsCount };
  }, [evolutionEvents, trackingConfig.target_assets.length, schemaVersions.length]);

  const { useCatalogDiscovery: discoveryHook } = useCatalogDiscovery();
  const { useCatalogAnalytics: analyticsHook } = useCatalogAnalytics();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schema Evolution Tracker</h1>
          <p className="text-muted-foreground">
            Track schema changes, analyze evolution patterns, and manage migrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Timeline
          </Button>
          <Button 
            onClick={handleStartTracking}
            disabled={trackingConfig.target_assets.length === 0 || startTrackingMutation.isPending}
          >
            {startTrackingMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Total Changes</div>
              <div className="text-xl font-bold">{evolutionMetrics.totalChanges}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Breaking Changes</div>
              <div className="text-xl font-bold">{evolutionMetrics.breakingChanges}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Monitor className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">Active Tracking</div>
              <div className="text-xl font-bold">{evolutionMetrics.activeTracking}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <History className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm text-muted-foreground">Schema Versions</div>
              <div className="text-xl font-bold">{evolutionMetrics.versionsCount}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <Tabs value={activeView} onValueChange={setActiveView as any}>
        <TabsList>
          <TabsTrigger value="timeline">
            Evolution Timeline
            <Badge variant="secondary" className="ml-2">
              {evolutionEvents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="comparison">
            Schema Comparison
            <Badge variant="secondary" className="ml-2">
              {schemaComparisons.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          {/* Asset Filter */}
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Label>Filter by asset:</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="All assets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Assets</SelectItem>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Timeline Visualization */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Schema Evolution Timeline</CardTitle>
              <CardDescription>
                Visual timeline of schema changes and evolution events
              </CardDescription>
            </CardHeader>
            <SchemaEvolutionTimeline
              events={evolutionEvents}
              selectedAsset={selectedAsset}
              onEventClick={handleEventClick}
            />
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Comparison Selector */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Select comparison:</Label>
                <Select value={selectedComparison} onValueChange={setSelectedComparison}>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="Select comparison" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemaComparisons.map(comparison => (
                      <SelectItem key={comparison.id} value={comparison.id}>
                        {comparison.from_version} → {comparison.to_version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedComparison && (
                <Button 
                  onClick={() => generateMigrationMutation.mutate(selectedComparison)}
                  disabled={generateMigrationMutation.isPending}
                >
                  <GitMerge className="h-4 w-4 mr-2" />
                  Generate Migration Plan
                </Button>
              )}
            </div>
          </Card>

          {/* Schema Comparison */}
          {currentComparison ? (
            <SchemaComparisonViewer
              comparison={currentComparison}
              onAcceptChange={handleAcceptChange}
              onRejectChange={handleRejectChange}
            />
          ) : (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">No Comparison Selected</div>
                <div>Select a schema comparison to view details</div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config">
          <SchemaTrackingConfigPanel
            config={trackingConfig}
            onConfigChange={setTrackingConfig}
            assets={assets}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchemaEvolutionTracker;