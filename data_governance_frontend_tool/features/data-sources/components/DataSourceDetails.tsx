'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Database,
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Cloud,
  Server,
  Shield,
  BarChart3,
  Network,
  FileText,
  Calendar,
  Users,
  Tag,
  ExternalLink
} from 'lucide-react';
import {
  useDataSource,
  useDataSourceScans,
  useDataSourceHealth,
  useStartScan,
  useCancelScan,
  useSyncDataSource,
  useDeleteDataSource,
  useDataSourceRealtime
} from '../hooks/useDataSources';
import type { DataSource, ScanType, DataSourceScan } from '@/types/data-source.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, formatRelativeTime, formatBytes, formatNumber, getStatusColor } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DataSourceDetailsProps {
  id: string;
}

export function DataSourceDetails({ id }: DataSourceDetailsProps) {
  const router = useRouter();
  const { checkPermission } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'schemas' | 'scans' | 'health' | 'lineage' | 'settings'>('overview');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // API hooks
  const { data: dataSource, isLoading, error } = useDataSource(id);
  const { data: scans, isLoading: scansLoading } = useDataSourceScans(id);
  const { data: health, isLoading: healthLoading } = useDataSourceHealth(id);
  const { data: realtimeData } = useDataSourceRealtime(id);

  // Mutations
  const startScan = useStartScan();
  const cancelScan = useCancelScan();
  const syncDataSource = useSyncDataSource();
  const deleteDataSource = useDeleteDataSource();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading data source details..." />
      </div>
    );
  }

  if (error || !dataSource) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load data source details</span>
        </div>
      </div>
    );
  }

  const handleStartScan = async (scanType: ScanType) => {
    try {
      await startScan.mutateAsync({
        id: dataSource.id,
        scanType,
        config: { full_scan: true }
      });
    } catch (error) {
      console.error('Failed to start scan:', error);
    }
  };

  const handleCancelScan = async (scan: DataSourceScan) => {
    try {
      await cancelScan.mutateAsync({
        dataSourceId: dataSource.id,
        scanId: scan.id
      });
    } catch (error) {
      console.error('Failed to cancel scan:', error);
    }
  };

  const handleSync = async () => {
    try {
      await syncDataSource.mutateAsync(dataSource.id);
    } catch (error) {
      console.error('Failed to sync data source:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${dataSource.name}"? This action cannot be undone.`)) {
      try {
        await deleteDataSource.mutateAsync(dataSource.id);
        router.push('/data-sources');
      } catch (error) {
        console.error('Failed to delete data source:', error);
      }
    }
  };

  const getTypeIcon = () => {
    switch (dataSource.type) {
      case 'mysql':
      case 'postgresql':
        return <Database className="h-6 w-6 text-blue-600" />;
      case 'mongodb':
        return <Database className="h-6 w-6 text-green-600" />;
      case 'snowflake':
        return <Cloud className="h-6 w-6 text-blue-500" />;
      case 's3':
        return <Cloud className="h-6 w-6 text-orange-500" />;
      case 'redis':
        return <Zap className="h-6 w-6 text-red-500" />;
      default:
        return <Server className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusIcon = () => {
    switch (dataSource.status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'pending':
      case 'syncing':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'maintenance':
        return <Settings className="h-5 w-5 text-blue-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const runningScans = scans?.filter(scan => scan.status === 'running') || [];
  const recentScans = scans?.slice(0, 5) || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'schemas', label: 'Schemas', icon: Database },
    { id: 'scans', label: 'Scans', icon: Play },
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'lineage', label: 'Lineage', icon: Network },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-muted rounded-lg">
            {getTypeIcon()}
          </div>
          
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-foreground">{dataSource.name}</h1>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium border",
                  getStatusColor(dataSource.status)
                )}>
                  {dataSource.status}
                </span>
              </div>
            </div>
            
            {dataSource.description && (
              <p className="text-muted-foreground mt-1 max-w-2xl">
                {dataSource.description}
              </p>
            )}
            
            <div className="flex items-center space-x-6 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span className="capitalize">{dataSource.type}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span className="capitalize">{dataSource.environment}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span className="capitalize">{dataSource.criticality}</span>
              </div>
              
              {dataSource.cloud_provider && (
                <div className="flex items-center space-x-1">
                  <Cloud className="h-4 w-4" />
                  <span className="uppercase">{dataSource.cloud_provider}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatRelativeTime(dataSource.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {runningScans.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <div className="animate-spin">
                <RefreshCw className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                {runningScans.length} scan{runningScans.length > 1 ? 's' : ''} running
              </span>
            </div>
          )}

          {checkPermission('datasource:scan') && (
            <div className="relative group">
              <button className="btn-primary flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Start Scan</span>
              </button>
              
              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleStartScan('schema_discovery')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    disabled={startScan.isPending}
                  >
                    Schema Discovery
                  </button>
                  <button
                    onClick={() => handleStartScan('data_profiling')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    disabled={startScan.isPending}
                  >
                    Data Profiling
                  </button>
                  <button
                    onClick={() => handleStartScan('sensitivity_detection')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    disabled={startScan.isPending}
                  >
                    Sensitivity Detection
                  </button>
                  <button
                    onClick={() => handleStartScan('quality_assessment')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    disabled={startScan.isPending}
                  >
                    Quality Assessment
                  </button>
                </div>
              </div>
            </div>
          )}

          {checkPermission('datasource:sync') && (
            <button
              onClick={handleSync}
              className="btn-outline flex items-center space-x-2"
              disabled={syncDataSource.isPending}
            >
              <RefreshCw className={cn("h-4 w-4", syncDataSource.isPending && "animate-spin")} />
              <span>Sync</span>
            </button>
          )}

          {checkPermission('datasource:edit') && (
            <button
              onClick={() => router.push(`/data-sources/${dataSource.id}/edit`)}
              className="btn-outline flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}

          <div className="relative group">
            <button className="btn-ghost p-2">
              <Settings className="h-4 w-4" />
            </button>
            
            <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent">
                  <Download className="h-4 w-4 mr-2 inline" />
                  Export Config
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent">
                  <ExternalLink className="h-4 w-4 mr-2 inline" />
                  View in Catalog
                </button>
                {checkPermission('datasource:delete') && (
                  <>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                      disabled={deleteDataSource.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2 inline" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            dataSource={dataSource} 
            health={health}
            recentScans={recentScans}
            realtimeData={realtimeData}
          />
        )}
        
        {activeTab === 'schemas' && (
          <SchemasTab dataSourceId={dataSource.id} />
        )}
        
        {activeTab === 'scans' && (
          <ScansTab 
            dataSourceId={dataSource.id}
            scans={scans || []}
            isLoading={scansLoading}
            onStartScan={handleStartScan}
            onCancelScan={handleCancelScan}
          />
        )}
        
        {activeTab === 'health' && (
          <HealthTab 
            dataSourceId={dataSource.id}
            health={health}
            isLoading={healthLoading}
          />
        )}
        
        {activeTab === 'lineage' && (
          <LineageTab dataSourceId={dataSource.id} />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab 
            dataSource={dataSource}
            showSensitiveData={showSensitiveData}
            onToggleSensitiveData={() => setShowSensitiveData(!showSensitiveData)}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ dataSource, health, recentScans, realtimeData }: any) {
  const statistics = dataSource.statistics;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-2 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tables</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(statistics?.total_tables || 0)}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Columns</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(statistics?.total_columns || 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rows</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(statistics?.total_rows || 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatBytes(statistics?.total_size_bytes || 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Connection Information</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Host</label>
                  <p className="text-foreground">{dataSource.connection_config.host || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Port</label>
                  <p className="text-foreground">{dataSource.connection_config.port || 'Default'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Database</label>
                  <p className="text-foreground">{dataSource.connection_config.database || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SSL Enabled</label>
                  <p className="text-foreground">
                    {dataSource.connection_config.ssl_enabled ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timeout</label>
                  <p className="text-foreground">
                    {dataSource.connection_config.timeout_seconds || 30}s
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pool Size</label>
                  <p className="text-foreground">
                    {dataSource.connection_config.pool_size || 5}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Health Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Health Status</h3>
          </div>
          <div className="card-content">
            {health ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Status</span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    health.overall_status === 'healthy' ? 'bg-green-100 text-green-800' :
                    health.overall_status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    health.overall_status === 'critical' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {health.overall_status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="text-sm font-medium">{health.response_time_ms}ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime (30d)</span>
                  <span className="text-sm font-medium">{health.uptime_percent_30d}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Errors (24h)</span>
                  <span className="text-sm font-medium">{health.error_count_24h}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Health data not available</p>
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Recent Scans</h3>
          </div>
          <div className="card-content">
            {recentScans.length > 0 ? (
              <div className="space-y-3">
                {recentScans.map((scan: DataSourceScan) => (
                  <div key={scan.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {scan.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(scan.started_at)}
                      </p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(scan.status)
                    )}>
                      {scan.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent scans</p>
            )}
          </div>
        </div>

        {/* Tags */}
        {dataSource.tags && dataSource.tags.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Tags</h3>
            </div>
            <div className="card-content">
              <div className="flex flex-wrap gap-2">
                {dataSource.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder components for other tabs
function SchemasTab({ dataSourceId }: { dataSourceId: string }) {
  return (
    <div className="card p-6">
      <p>Schemas tab content for data source {dataSourceId}</p>
    </div>
  );
}

function ScansTab({ dataSourceId, scans, isLoading, onStartScan, onCancelScan }: any) {
  return (
    <div className="card p-6">
      <p>Scans tab content for data source {dataSourceId}</p>
    </div>
  );
}

function HealthTab({ dataSourceId, health, isLoading }: any) {
  return (
    <div className="card p-6">
      <p>Health tab content for data source {dataSourceId}</p>
    </div>
  );
}

function LineageTab({ dataSourceId }: { dataSourceId: string }) {
  return (
    <div className="card p-6">
      <p>Lineage tab content for data source {dataSourceId}</p>
    </div>
  );
}

function SettingsTab({ dataSource, showSensitiveData, onToggleSensitiveData }: any) {
  return (
    <div className="card p-6">
      <p>Settings tab content for data source {dataSource.id}</p>
    </div>
  );
}