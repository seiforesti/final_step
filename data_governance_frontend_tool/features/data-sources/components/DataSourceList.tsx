'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Database,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Play,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Cloud,
  Server,
  Shield
} from 'lucide-react';
import { 
  useDataSources, 
  useDeleteDataSource, 
  useStartScan, 
  useSyncDataSource,
  useExportDataSource,
  useBulkOperation
} from '../hooks/useDataSources';
import type { 
  DataSource, 
  DataSourceFilters, 
  DataSourceType,
  DataSourceStatus,
  Environment,
  Criticality,
  ScanType
} from '@/types/data-source.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, formatRelativeTime, formatBytes, getStatusColor } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

export function DataSourceList() {
  const router = useRouter();
  const { checkPermission } = useAuth();
  
  // State for filters and selections
  const [filters, setFilters] = useState<DataSourceFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // API hooks
  const { data: dataSourcesResponse, isLoading, error, refetch } = useDataSources(filters);
  const deleteDataSource = useDeleteDataSource();
  const startScan = useStartScan();
  const syncDataSource = useSyncDataSource();
  const exportDataSources = useExportDataSource();
  const bulkOperation = useBulkOperation();

  // Computed values
  const dataSources = dataSourcesResponse?.data_sources || [];
  const totalCount = dataSourcesResponse?.total || 0;

  const filteredDataSources = useMemo(() => {
    if (!searchQuery) return dataSources;
    
    const query = searchQuery.toLowerCase();
    return dataSources.filter(ds => 
      ds.name.toLowerCase().includes(query) ||
      ds.description?.toLowerCase().includes(query) ||
      ds.type.toLowerCase().includes(query) ||
      ds.environment.toLowerCase().includes(query)
    );
  }, [dataSources, searchQuery]);

  // Event handlers
  const handleFilterChange = (newFilters: Partial<DataSourceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredDataSources.map(ds => ds.id) : []);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleStartScan = async (dataSource: DataSource, scanType: ScanType) => {
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

  const handleSync = async (dataSource: DataSource) => {
    try {
      await syncDataSource.mutateAsync(dataSource.id);
    } catch (error) {
      console.error('Failed to sync data source:', error);
    }
  };

  const handleDelete = async (dataSource: DataSource) => {
    if (window.confirm(`Are you sure you want to delete "${dataSource.name}"?`)) {
      try {
        await deleteDataSource.mutateAsync(dataSource.id);
      } catch (error) {
        console.error('Failed to delete data source:', error);
      }
    }
  };

  const handleBulkExport = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await exportDataSources.mutateAsync({
        ids: selectedIds,
        format: 'json'
      });
    } catch (error) {
      console.error('Failed to export data sources:', error);
    }
  };

  const handleBulkScan = async (scanType: ScanType) => {
    if (selectedIds.length === 0) return;
    
    try {
      await bulkOperation.mutateAsync({
        operation: 'scan',
        dataSourceIds: selectedIds,
        config: { scan_type: scanType }
      });
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to start bulk scan:', error);
    }
  };

  const getStatusIcon = (status: DataSourceStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'syncing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: DataSourceType) => {
    switch (type) {
      case 'mysql':
      case 'postgresql':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'mongodb':
        return <Database className="h-4 w-4 text-green-600" />;
      case 'snowflake':
        return <Cloud className="h-4 w-4 text-blue-500" />;
      case 's3':
        return <Cloud className="h-4 w-4 text-orange-500" />;
      case 'redis':
        return <Zap className="h-4 w-4 text-red-500" />;
      default:
        return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCriticalityColor = (criticality: Criticality) => {
    switch (criticality) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading data sources..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load data sources</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Sources</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your data source connections ({totalCount} total)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {checkPermission('datasource:import') && (
            <button className="btn-outline flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
          )}
          
          {checkPermission('datasource:create') && (
            <button
              onClick={() => router.push('/data-sources/new')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Data Source</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search data sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "btn-outline flex items-center space-x-2",
                  showFilters && "bg-accent"
                )}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              
              <button
                onClick={() => refetch()}
                className="btn-ghost p-2"
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length} selected
                </span>
                
                <div className="flex items-center space-x-1">
                  {checkPermission('datasource:scan') && (
                    <>
                      <button
                        onClick={() => handleBulkScan('schema_discovery')}
                        className="btn-outline btn-sm"
                        disabled={bulkOperation.isPending}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Scan
                      </button>
                    </>
                  )}
                  
                  {checkPermission('datasource:export') && (
                    <button
                      onClick={handleBulkExport}
                      className="btn-outline btn-sm"
                      disabled={exportDataSources.isPending}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Type</label>
                  <select
                    value={filters.types?.[0] || ''}
                    onChange={(e) => handleFilterChange({ 
                      types: e.target.value ? [e.target.value as DataSourceType] : undefined 
                    })}
                    className="form-input"
                  >
                    <option value="">All Types</option>
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mongodb">MongoDB</option>
                    <option value="snowflake">Snowflake</option>
                    <option value="s3">Amazon S3</option>
                    <option value="redis">Redis</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={filters.statuses?.[0] || ''}
                    onChange={(e) => handleFilterChange({ 
                      statuses: e.target.value ? [e.target.value as DataSourceStatus] : undefined 
                    })}
                    className="form-input"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                    <option value="pending">Pending</option>
                    <option value="syncing">Syncing</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Environment</label>
                  <select
                    value={filters.environments?.[0] || ''}
                    onChange={(e) => handleFilterChange({ 
                      environments: e.target.value ? [e.target.value as Environment] : undefined 
                    })}
                    className="form-input"
                  >
                    <option value="">All Environments</option>
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="test">Test</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Criticality</label>
                  <select
                    value={filters.criticalities?.[0] || ''}
                    onChange={(e) => handleFilterChange({ 
                      criticalities: e.target.value ? [e.target.value as Criticality] : undefined 
                    })}
                    className="form-input"
                  >
                    <option value="">All Criticalities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Sources Table */}
      <div className="card">
        <div className="card-content p-0">
          {filteredDataSources.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No data sources found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first data source'}
              </p>
              {checkPermission('datasource:create') && !searchQuery && (
                <button
                  onClick={() => router.push('/data-sources/new')}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Data Source
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr className="table-row">
                    <th className="table-head w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredDataSources.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="table-head">Name</th>
                    <th className="table-head">Type</th>
                    <th className="table-head">Status</th>
                    <th className="table-head">Environment</th>
                    <th className="table-head">Criticality</th>
                    <th className="table-head">Last Scan</th>
                    <th className="table-head">Health</th>
                    <th className="table-head w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredDataSources.map((dataSource) => (
                    <tr key={dataSource.id} className="table-row">
                      <td className="table-cell">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(dataSource.id)}
                          onChange={(e) => handleSelectItem(dataSource.id, e.target.checked)}
                          className="rounded border-border"
                        />
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(dataSource.type)}
                          <div>
                            <button
                              onClick={() => router.push(`/data-sources/${dataSource.id}`)}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {dataSource.name}
                            </button>
                            {dataSource.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {dataSource.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <span className="capitalize text-sm font-medium">
                          {dataSource.type}
                        </span>
                        {dataSource.cloud_provider && (
                          <div className="flex items-center mt-1">
                            <Cloud className="h-3 w-3 mr-1" />
                            <span className="text-xs text-muted-foreground uppercase">
                              {dataSource.cloud_provider}
                            </span>
                          </div>
                        )}
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(dataSource.status)}
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            getStatusColor(dataSource.status)
                          )}>
                            {dataSource.status}
                          </span>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <span className="capitalize text-sm">
                          {dataSource.environment}
                        </span>
                      </td>
                      
                      <td className="table-cell">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border",
                          getCriticalityColor(dataSource.criticality)
                        )}>
                          {dataSource.criticality}
                        </span>
                      </td>
                      
                      <td className="table-cell">
                        {dataSource.last_scan ? (
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(dataSource.last_scan)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Never
                          </span>
                        )}
                      </td>
                      
                      <td className="table-cell">
                        {dataSource.health_status ? (
                          <div className="flex items-center space-x-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              dataSource.health_status.overall_status === 'healthy' ? 'bg-green-500' :
                              dataSource.health_status.overall_status === 'warning' ? 'bg-yellow-500' :
                              dataSource.health_status.overall_status === 'critical' ? 'bg-red-500' :
                              'bg-gray-400'
                            )} />
                            <span className="text-sm">
                              {dataSource.health_status.response_time_ms}ms
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center space-x-1">
                          {checkPermission('datasource:view') && (
                            <button
                              onClick={() => router.push(`/data-sources/${dataSource.id}`)}
                              className="btn-ghost btn-sm p-1"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          {checkPermission('datasource:scan') && (
                            <button
                              onClick={() => handleStartScan(dataSource, 'schema_discovery')}
                              className="btn-ghost btn-sm p-1"
                              title="Start Scan"
                              disabled={startScan.isPending}
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          
                          {checkPermission('datasource:edit') && (
                            <button
                              onClick={() => router.push(`/data-sources/${dataSource.id}/edit`)}
                              className="btn-ghost btn-sm p-1"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          
                          <div className="relative group">
                            <button className="btn-ghost btn-sm p-1">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            
                            <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                {checkPermission('datasource:sync') && (
                                  <button
                                    onClick={() => handleSync(dataSource)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                                    disabled={syncDataSource.isPending}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2 inline" />
                                    Sync
                                  </button>
                                )}
                                
                                {checkPermission('datasource:delete') && (
                                  <button
                                    onClick={() => handleDelete(dataSource)}
                                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                                    disabled={deleteDataSource.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2 inline" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredDataSources.length} of {totalCount} data sources
          </p>
          
          {/* Pagination controls would go here */}
        </div>
      )}
    </div>
  );
}