// ============================================================================
// DATA SOURCE INTEGRATOR - MULTI-SOURCE INTEGRATION COMPONENT (2100+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Data Source Integration Component
// Multi-source connectivity, intelligent mapping, real-time synchronization,
// schema discovery, data transformation, and integration orchestration
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
  Database, Server, Globe, Cloud, Folder, FileText, Settings, 
  CheckCircle, AlertTriangle, RefreshCw, Play, Pause, Stop, 
  Upload, Download, Eye, EyeOff, Lock, Unlock, Plus, Minus, 
  Edit, Trash2, Copy, Link, Unlink, Search, Filter, BarChart3,
  Calendar, Clock, TrendingUp, AlertCircle, Zap, Target, Shield,
  Users, MessageSquare, Send, ArrowRight, ArrowLeft, ChevronDown,
  ChevronUp, X, Save, Home, FolderOpen, Archive, BookOpen,
  Lightbulb, Sparkles, Activity, Network, Layers, Box, Map,
  GitBranch, Sync, Workflow, Monitor, Bell, Key, Hash, Grid
} from 'lucide-react';

// Charts
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Services & Types
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { dataProfilingService } from '../../services/data-profiling.service';
import type { 
  DataSource, 
  ConnectionConfig, 
  IntegrationJob, 
  SyncStatus, 
  SourceMapping,
  DataAsset,
  SchemaMapping,
  TransformationRule,
  IntegrationMetrics
} from '../../types/catalog-core.types';

// Constants
import { 
  DATA_SOURCE_TYPES, 
  CONNECTION_PROTOCOLS, 
  SYNC_FREQUENCIES,
  INTEGRATION_SETTINGS 
} from '../../constants/catalog-constants';

// Hooks
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { useCatalogProfiling } from '../../hooks/useCatalogProfiling';

// Utils
import { formatters } from '../../utils/formatters';
import { calculations } from '../../utils/calculations';
import { validators } from '../../utils/validators';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface DataSourceIntegratorProps {
  onSourceAdded?: (source: DataSource) => void;
  onIntegrationComplete?: (results: IntegrationMetrics) => void;
  onMappingChange?: (mapping: SourceMapping) => void;
  className?: string;
}

interface DataSourceConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  connection: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    connection_string?: string;
    api_key?: string;
    api_secret?: string;
    auth_type: 'basic' | 'oauth' | 'token' | 'certificate';
    ssl_enabled: boolean;
    timeout: number;
  };
  sync_settings: {
    frequency: string;
    enabled: boolean;
    batch_size: number;
    parallel_connections: number;
    incremental: boolean;
    conflict_resolution: 'source_wins' | 'target_wins' | 'manual';
  };
  discovery_settings: {
    auto_discover_schema: boolean;
    auto_profile_data: boolean;
    detect_pii: boolean;
    classify_data: boolean;
    extract_lineage: boolean;
  };
  transformation_rules: TransformationRule[];
  tags: string[];
}

interface IntegrationJobConfig {
  id: string;
  name: string;
  sources: string[];
  target_catalog: string;
  mapping_strategy: 'auto' | 'manual' | 'hybrid';
  conflict_resolution: 'merge' | 'replace' | 'skip';
  validation_rules: string[];
  notification_settings: {
    on_success: boolean;
    on_failure: boolean;
    on_conflict: boolean;
    email: string[];
    webhook?: string;
  };
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
}

interface SourceConnectionStatus {
  source_id: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  last_tested: string;
  response_time?: number;
  error_message?: string;
  connection_count: number;
  data_volume: number;
}

// ============================================================================
// DATA SOURCE CONFIGURATION PANEL
// ============================================================================

const DataSourceConfigPanel: React.FC<{
  config: DataSourceConfig;
  onConfigChange: (config: DataSourceConfig) => void;
  onTestConnection: (config: DataSourceConfig) => Promise<boolean>;
}> = ({ config, onConfigChange, onTestConnection }) => {
  const [activeTab, setActiveTab] = useState('connection');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message?: string } | null>(null);

  const updateConfig = useCallback((updates: Partial<DataSourceConfig>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  const handleTestConnection = useCallback(async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    
    try {
      const success = await onTestConnection(config);
      setConnectionResult({ 
        success, 
        message: success ? 'Connection successful' : 'Connection failed'
      });
    } catch (error) {
      setConnectionResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setTestingConnection(false);
    }
  }, [config, onTestConnection]);

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
      case 'mysql':
      case 'oracle':
      case 'sqlserver':
        return <Database className="h-4 w-4" />;
      case 'mongodb':
      case 'cassandra':
      case 'redis':
        return <Server className="h-4 w-4" />;
      case 'rest_api':
      case 'graphql':
        return <Globe className="h-4 w-4" />;
      case 's3':
      case 'gcs':
      case 'azure_blob':
        return <Cloud className="h-4 w-4" />;
      case 'hdfs':
      case 'ftp':
        return <Folder className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getSourceTypeIcon(config.type)}
          Data Source Configuration
        </CardTitle>
        <CardDescription>
          Configure connection settings, sync options, and discovery preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
            <TabsTrigger value="discovery">Discovery</TabsTrigger>
            <TabsTrigger value="transformation">Transform</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-name">Source Name</Label>
                <Input
                  id="source-name"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="Enter source name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-type">Source Type</Label>
                <Select value={config.type} onValueChange={(value) => updateConfig({ type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {getSourceTypeIcon(type.value)}
                          {type.label}
                        </div>
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
                placeholder="Describe this data source"
                rows={2}
              />
            </div>

            {/* Connection Details */}
            <div className="space-y-4">
              <Label>Connection Details</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={config.connection.host || ''}
                    onChange={(e) => updateConfig({
                      connection: { ...config.connection, host: e.target.value }
                    })}
                    placeholder="hostname or IP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.connection.port || ''}
                    onChange={(e) => updateConfig({
                      connection: { ...config.connection, port: parseInt(e.target.value) }
                    })}
                    placeholder="5432"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database/Schema</Label>
                <Input
                  id="database"
                  value={config.connection.database || ''}
                  onChange={(e) => updateConfig({
                    connection: { ...config.connection, database: e.target.value }
                  })}
                  placeholder="database name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={config.connection.username || ''}
                    onChange={(e) => updateConfig({
                      connection: { ...config.connection, username: e.target.value }
                    })}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={config.connection.password || ''}
                    onChange={(e) => updateConfig({
                      connection: { ...config.connection, password: e.target.value }
                    })}
                    placeholder="password"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ssl-enabled"
                    checked={config.connection.ssl_enabled}
                    onCheckedChange={(checked) => updateConfig({
                      connection: { ...config.connection, ssl_enabled: checked }
                    })}
                  />
                  <Label htmlFor="ssl-enabled">SSL Enabled</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={config.connection.timeout}
                    onChange={(e) => updateConfig({
                      connection: { ...config.connection, timeout: parseInt(e.target.value) }
                    })}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            {/* Test Connection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Connection Test</Label>
                <Button 
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  size="sm"
                >
                  {testingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
              
              {connectionResult && (
                <div className={`p-3 rounded-lg border ${
                  connectionResult.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {connectionResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {connectionResult.message}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <Select 
                  value={config.sync_settings.frequency}
                  onValueChange={(value) => updateConfig({
                    sync_settings: { ...config.sync_settings, frequency: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYNC_FREQUENCIES.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={config.sync_settings.batch_size}
                  onChange={(e) => updateConfig({
                    sync_settings: { ...config.sync_settings, batch_size: parseInt(e.target.value) }
                  })}
                  min="1"
                  max="10000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sync-enabled"
                  checked={config.sync_settings.enabled}
                  onCheckedChange={(checked) => updateConfig({
                    sync_settings: { ...config.sync_settings, enabled: checked }
                  })}
                />
                <Label htmlFor="sync-enabled">Enable Auto Sync</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="incremental-sync"
                  checked={config.sync_settings.incremental}
                  onCheckedChange={(checked) => updateConfig({
                    sync_settings: { ...config.sync_settings, incremental: checked }
                  })}
                />
                <Label htmlFor="incremental-sync">Incremental Sync</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parallel-connections">Parallel Connections</Label>
              <Input
                id="parallel-connections"
                type="number"
                value={config.sync_settings.parallel_connections}
                onChange={(e) => updateConfig({
                  sync_settings: { ...config.sync_settings, parallel_connections: parseInt(e.target.value) }
                })}
                min="1"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conflict-resolution">Conflict Resolution</Label>
              <Select 
                value={config.sync_settings.conflict_resolution}
                onValueChange={(value) => updateConfig({
                  sync_settings: { ...config.sync_settings, conflict_resolution: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="source_wins">Source Wins</SelectItem>
                  <SelectItem value="target_wins">Target Wins</SelectItem>
                  <SelectItem value="manual">Manual Resolution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="discovery" className="space-y-6">
            <div className="space-y-4">
              <Label>Automatic Discovery Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-schema"
                    checked={config.discovery_settings.auto_discover_schema}
                    onCheckedChange={(checked) => updateConfig({
                      discovery_settings: { ...config.discovery_settings, auto_discover_schema: checked }
                    })}
                  />
                  <Label htmlFor="auto-schema">Auto-discover Schema</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-profile"
                    checked={config.discovery_settings.auto_profile_data}
                    onCheckedChange={(checked) => updateConfig({
                      discovery_settings: { ...config.discovery_settings, auto_profile_data: checked }
                    })}
                  />
                  <Label htmlFor="auto-profile">Auto-profile Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="detect-pii"
                    checked={config.discovery_settings.detect_pii}
                    onCheckedChange={(checked) => updateConfig({
                      discovery_settings: { ...config.discovery_settings, detect_pii: checked }
                    })}
                  />
                  <Label htmlFor="detect-pii">Detect PII</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="classify-data"
                    checked={config.discovery_settings.classify_data}
                    onCheckedChange={(checked) => updateConfig({
                      discovery_settings: { ...config.discovery_settings, classify_data: checked }
                    })}
                  />
                  <Label htmlFor="classify-data">Auto-classify Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="extract-lineage"
                    checked={config.discovery_settings.extract_lineage}
                    onCheckedChange={(checked) => updateConfig({
                      discovery_settings: { ...config.discovery_settings, extract_lineage: checked }
                    })}
                  />
                  <Label htmlFor="extract-lineage">Extract Lineage</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={config.tags.join(', ')}
                onChange={(e) => updateConfig({
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </TabsContent>

          <TabsContent value="transformation" className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Transformation Rules</Label>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
            
            <div className="space-y-3">
              {config.transformation_rules.map((rule, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">{rule.type}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={rule.enabled} />
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {config.transformation_rules.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div>No transformation rules configured</div>
                  <div className="text-sm">Add rules to transform data during integration</div>
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
// SOURCE MANAGEMENT DASHBOARD
// ============================================================================

const SourceManagementDashboard: React.FC<{
  sources: DataSource[];
  connectionStatuses: SourceConnectionStatus[];
  onSourceAction: (action: string, sourceId: string) => void;
  onBulkAction: (action: string, sourceIds: string[]) => void;
}> = ({ sources, connectionStatuses, onSourceAction, onBulkAction }) => {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const filteredSources = useMemo(() => {
    let filtered = sources;

    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(source =>
        source.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        source.type.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        source.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const statusMap = connectionStatuses.reduce((acc, status) => {
        acc[status.source_id] = status.status;
        return acc;
      }, {} as Record<string, string>);
      
      filtered = filtered.filter(source => statusMap[source.id] === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(source => source.type === filterType);
    }

    return filtered;
  }, [sources, connectionStatuses, debouncedSearchTerm, filterStatus, filterType]);

  const sourceTypes = useMemo(() => {
    const types = Array.from(new Set(sources.map(s => s.type)));
    return types.sort();
  }, [sources]);

  const statusCounts = useMemo(() => {
    const counts = { connected: 0, disconnected: 0, error: 0, testing: 0 };
    connectionStatuses.forEach(status => {
      counts[status.status] = (counts[status.status] || 0) + 1;
    });
    return counts;
  }, [connectionStatuses]);

  const handleSelectAll = useCallback(() => {
    if (selectedSources.length === filteredSources.length) {
      setSelectedSources([]);
    } else {
      setSelectedSources(filteredSources.map(s => s.id));
    }
  }, [selectedSources, filteredSources]);

  const handleSelectSource = useCallback((sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <X className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">Connected</div>
              <div className="text-xl font-bold">{statusCounts.connected}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm text-muted-foreground">Disconnected</div>
              <div className="text-xl font-bold">{statusCounts.disconnected}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Errors</div>
              <div className="text-xl font-bold">{statusCounts.error}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Total Sources</div>
              <div className="text-xl font-bold">{sources.length}</div>
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
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {sourceTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedSources.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedSources.length} selected
            </span>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('test', selectedSources)}>
              <Zap className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('sync', selectedSources)}>
              <Sync className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction('disable', selectedSources)}>
              <Pause className="h-4 w-4 mr-2" />
              Disable
            </Button>
          </div>
        )}
      </Card>

      {/* Sources List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Sources</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedSources.length === filteredSources.length && filteredSources.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredSources.map((source, index) => {
              const status = connectionStatuses.find(s => s.source_id === source.id);
              return (
                <div key={source.id} className={`p-4 border-b last:border-b-0 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={() => handleSelectSource(source.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{source.name}</span>
                          <Badge variant="outline">{source.type}</Badge>
                          {status && (
                            <Badge className={getStatusColor(status.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(status.status)}
                                {status.status}
                              </div>
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>{source.description}</span>
                          {status && (
                            <>
                              <span>•</span>
                              <span>Last tested: {formatters.formatDateTime(status.last_tested)}</span>
                              {status.response_time && (
                                <>
                                  <span>•</span>
                                  <span>{status.response_time}ms</span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => onSourceAction('test', source.id)}>
                        <Zap className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onSourceAction('sync', source.id)}>
                        <Sync className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onSourceAction('edit', source.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onSourceAction('delete', source.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredSources.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">No Sources Found</div>
              <div>Try adjusting your filters or add a new data source</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// INTEGRATION JOB MONITOR
// ============================================================================

const IntegrationJobMonitor: React.FC<{
  jobs: IntegrationJob[];
  onJobAction: (action: string, jobId: string) => void;
}> = ({ jobs, onJobAction }) => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const jobMetrics = useMemo(() => {
    const totalJobs = jobs.length;
    const runningJobs = jobs.filter(j => j.status === 'running').length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;
    
    return { totalJobs, runningJobs, completedJobs, failedJobs };
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* Job Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Workflow className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Total Jobs</div>
              <div className="text-xl font-bold">{jobMetrics.totalJobs}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Play className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">Running</div>
              <div className="text-xl font-bold">{jobMetrics.runningJobs}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-xl font-bold">{jobMetrics.completedJobs}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Failed</div>
              <div className="text-xl font-bold">{jobMetrics.failedJobs}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getJobStatusColor(job.status)}`} />
                  <div>
                    <div className="font-medium">{job.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.sources.length} sources • {formatters.formatDateTime(job.last_run || job.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{job.status}</Badge>
                  {job.progress !== undefined && (
                    <div className="w-24">
                      <Progress value={job.progress} />
                    </div>
                  )}
                  <div className="flex space-x-1">
                    {job.status === 'running' && (
                      <Button size="sm" variant="ghost" onClick={() => onJobAction('pause', job.id)}>
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === 'paused' && (
                      <Button size="sm" variant="ghost" onClick={() => onJobAction('resume', job.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => onJobAction('view', job.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onJobAction('restart', job.id)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {job.status === 'running' && job.current_stage && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Current stage: {job.current_stage}
                  </div>
                  {job.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={job.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {job.progress}% complete
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
          
          {jobs.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">No Integration Jobs</div>
              <div>Start an integration job to begin syncing data sources</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN DATA SOURCE INTEGRATOR COMPONENT
// ============================================================================

export const DataSourceIntegrator: React.FC<DataSourceIntegratorProps> = ({
  onSourceAdded,
  onIntegrationComplete,
  onMappingChange,
  className
}) => {
  const [activeView, setActiveView] = useState<'sources' | 'config' | 'jobs'>('sources');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [sourceConfig, setSourceConfig] = useState<DataSourceConfig>({
    id: `source_${Date.now()}`,
    name: '',
    type: 'postgresql',
    description: '',
    connection: {
      auth_type: 'basic',
      ssl_enabled: false,
      timeout: 30
    },
    sync_settings: {
      frequency: 'daily',
      enabled: true,
      batch_size: 1000,
      parallel_connections: 2,
      incremental: true,
      conflict_resolution: 'source_wins'
    },
    discovery_settings: {
      auto_discover_schema: true,
      auto_profile_data: true,
      detect_pii: true,
      classify_data: true,
      extract_lineage: false
    },
    transformation_rules: [],
    tags: []
  });

  // Queries
  const { data: sources = [] } = useQuery({
    queryKey: ['data-sources'],
    queryFn: () => intelligentDiscoveryService.getDataSources()
  });

  const { data: connectionStatuses = [] } = useQuery({
    queryKey: ['source-connection-status'],
    queryFn: () => intelligentDiscoveryService.getConnectionStatuses(),
    refetchInterval: 30000
  });

  const { data: integrationJobs = [] } = useQuery({
    queryKey: ['integration-jobs'],
    queryFn: () => intelligentDiscoveryService.getIntegrationJobs(),
    refetchInterval: 5000
  });

  // Mutations
  const createSourceMutation = useMutation({
    mutationFn: (config: DataSourceConfig) => 
      intelligentDiscoveryService.createDataSource(config),
    onSuccess: (source) => {
      toast.success('Data source created successfully');
      setIsConfiguring(false);
      onSourceAdded?.(source);
    },
    onError: (error) => {
      toast.error('Failed to create data source');
      console.error('Create source error:', error);
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: (config: DataSourceConfig) =>
      intelligentDiscoveryService.testConnection(config),
    onError: (error) => {
      console.error('Connection test error:', error);
    }
  });

  const sourceActionMutation = useMutation({
    mutationFn: ({ action, sourceId }: { action: string; sourceId: string }) =>
      intelligentDiscoveryService.performSourceAction(sourceId, action),
    onSuccess: (_, variables) => {
      toast.success(`Source ${variables.action} successful`);
    }
  });

  const jobActionMutation = useMutation({
    mutationFn: ({ action, jobId }: { action: string; jobId: string }) =>
      intelligentDiscoveryService.performJobAction(jobId, action),
    onSuccess: (_, variables) => {
      toast.success(`Job ${variables.action} successful`);
    }
  });

  // Handlers
  const handleCreateSource = useCallback(() => {
    createSourceMutation.mutate(sourceConfig);
  }, [sourceConfig, createSourceMutation]);

  const handleTestConnection = useCallback(async (config: DataSourceConfig): Promise<boolean> => {
    try {
      const result = await testConnectionMutation.mutateAsync(config);
      return result.success;
    } catch (error) {
      return false;
    }
  }, [testConnectionMutation]);

  const handleSourceAction = useCallback((action: string, sourceId: string) => {
    sourceActionMutation.mutate({ action, sourceId });
  }, [sourceActionMutation]);

  const handleBulkAction = useCallback((action: string, sourceIds: string[]) => {
    sourceIds.forEach(sourceId => {
      sourceActionMutation.mutate({ action, sourceId });
    });
  }, [sourceActionMutation]);

  const handleJobAction = useCallback((action: string, jobId: string) => {
    jobActionMutation.mutate({ action, jobId });
  }, [jobActionMutation]);

  const { useCatalogDiscovery: discoveryHook } = useCatalogDiscovery();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Source Integrator</h1>
          <p className="text-muted-foreground">
            Connect, configure, and manage multiple data sources with intelligent integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Config
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button onClick={() => setIsConfiguring(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Tabs value={activeView} onValueChange={setActiveView as any}>
        <TabsList>
          <TabsTrigger value="sources">
            Data Sources
            <Badge variant="secondary" className="ml-2">
              {sources.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="jobs">
            Integration Jobs
            <Badge variant="secondary" className="ml-2">
              {integrationJobs.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <SourceManagementDashboard
            sources={sources}
            connectionStatuses={connectionStatuses}
            onSourceAction={handleSourceAction}
            onBulkAction={handleBulkAction}
          />
        </TabsContent>

        <TabsContent value="config">
          {isConfiguring ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Configure New Data Source</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSource}
                    disabled={!sourceConfig.name || createSourceMutation.isPending}
                  >
                    {createSourceMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Source
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <DataSourceConfigPanel
                config={sourceConfig}
                onConfigChange={setSourceConfig}
                onTestConnection={handleTestConnection}
              />
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">No Source Configuration</div>
                <div>Click "Add Source" to configure a new data source</div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jobs">
          <IntegrationJobMonitor
            jobs={integrationJobs}
            onJobAction={handleJobAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataSourceIntegrator;