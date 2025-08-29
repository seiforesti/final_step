'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  BarChart3,
  FileText,
  Zap,
  Users,
  Calendar,
  Tag
} from 'lucide-react';
import {
  useComplianceRules,
  useDeleteComplianceRule,
  useToggleRuleStatus,
  useExecuteRule,
  useBulkRuleOperation,
  useExportComplianceData,
  useValidateRule
} from '../hooks/useComplianceRules';
import type {
  ComplianceRule,
  ComplianceFilters,
  ComplianceFramework,
  RuleSeverity,
  RuleType,
  ComplianceStatus
} from '@/types/compliance.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, formatRelativeTime, formatNumber, getStatusColor } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

export function ComplianceRulesList() {
  const router = useRouter();
  const { checkPermission } = useAuth();
  
  // State management
  const [filters, setFilters] = useState<ComplianceFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // API hooks
  const { data: rulesResponse, isLoading, error, refetch } = useComplianceRules(filters);
  const deleteRule = useDeleteComplianceRule();
  const toggleRuleStatus = useToggleRuleStatus();
  const executeRule = useExecuteRule();
  const validateRule = useValidateRule();
  const bulkOperation = useBulkRuleOperation();
  const exportData = useExportComplianceData();

  // Computed values
  const rules = rulesResponse?.rules || [];
  const totalCount = rulesResponse?.total || 0;

  const filteredRules = useMemo(() => {
    if (!searchQuery) return rules;
    
    const query = searchQuery.toLowerCase();
    return rules.filter(rule => 
      rule.name.toLowerCase().includes(query) ||
      rule.description?.toLowerCase().includes(query) ||
      rule.framework.toLowerCase().includes(query) ||
      rule.rule_type.toLowerCase().includes(query)
    );
  }, [rules, searchQuery]);

  // Event handlers
  const handleFilterChange = (newFilters: Partial<ComplianceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredRules.map(rule => rule.id) : []);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleToggleStatus = async (rule: ComplianceRule) => {
    try {
      await toggleRuleStatus.mutateAsync({
        id: rule.id,
        enabled: !rule.enabled
      });
    } catch (error) {
      console.error('Failed to toggle rule status:', error);
    }
  };

  const handleExecuteRule = async (rule: ComplianceRule) => {
    try {
      await executeRule.mutateAsync({ id: rule.id });
    } catch (error) {
      console.error('Failed to execute rule:', error);
    }
  };

  const handleValidateRule = async (rule: ComplianceRule) => {
    try {
      await validateRule.mutateAsync({ id: rule.id });
    } catch (error) {
      console.error('Failed to validate rule:', error);
    }
  };

  const handleDeleteRule = async (rule: ComplianceRule) => {
    if (window.confirm(`Are you sure you want to delete "${rule.name}"?`)) {
      try {
        await deleteRule.mutateAsync(rule.id);
      } catch (error) {
        console.error('Failed to delete rule:', error);
      }
    }
  };

  const handleBulkExport = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await exportData.mutateAsync({
        type: 'rules',
        filters: { rule_ids: selectedIds },
        format: 'json'
      });
    } catch (error) {
      console.error('Failed to export rules:', error);
    }
  };

  const handleBulkEnable = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await bulkOperation.mutateAsync({
        operation: 'enable',
        ruleIds: selectedIds
      });
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to enable rules:', error);
    }
  };

  const handleBulkDisable = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await bulkOperation.mutateAsync({
        operation: 'disable',
        ruleIds: selectedIds
      });
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to disable rules:', error);
    }
  };

  const getFrameworkIcon = (framework: ComplianceFramework) => {
    switch (framework) {
      case 'gdpr':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'ccpa':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'hipaa':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'sox':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'pci_dss':
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: RuleSeverity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (rule: ComplianceRule) => {
    if (!rule.enabled) {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    
    const stats = rule.statistics;
    if (!stats) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    
    if (stats.pending_violations > 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading compliance rules..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load compliance rules</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Rules</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your compliance rules ({totalCount} total)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {checkPermission('compliance:import') && (
            <button className="btn-outline flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
          )}
          
          {checkPermission('compliance:create') && (
            <button
              onClick={() => router.push('/compliance-rules/new')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
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
                  placeholder="Search compliance rules..."
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
                  {checkPermission('compliance:edit') && (
                    <>
                      <button
                        onClick={handleBulkEnable}
                        className="btn-outline btn-sm"
                        disabled={bulkOperation.isPending}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Enable
                      </button>
                      
                      <button
                        onClick={handleBulkDisable}
                        className="btn-outline btn-sm"
                        disabled={bulkOperation.isPending}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Disable
                      </button>
                    </>
                  )}
                  
                  {checkPermission('compliance:export') && (
                    <button
                      onClick={handleBulkExport}
                      className="btn-outline btn-sm"
                      disabled={exportData.isPending}
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
                  <label className="form-label">Framework</label>
                  <select
                    value={filters.frameworks?.[0] || ''}
                    onChange={(e) => handleFilterChange({ 
                      frameworks: e.target.value ? [e.target.value as ComplianceFramework] : undefined 
                    })}
                    className="form-input"
                  >
                    <option value="">All Frameworks</option>
                    <option value="gdpr">GDPR</option>
                    <option value="ccpa">CCPA</option>
                    <option value="hipaa">HIPAA</option>
                    <option value="sox">SOX</option>
                    <option value="pci_dss">PCI DSS</option>
                    <option value="iso_27001">ISO 27001</option>
                    <option value="nist">NIST</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Severity</label>
                  <select
                    value={filters.severities?.[0] || ''}
                    onChange={(e) => handleFilterChange({ 
                      severities: e.target.value ? [e.target.value as RuleSeverity] : undefined 
                    })}
                    className="form-input"
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="info">Info</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Rule Type</label>
                  <select
                    value={filters.rule_types?.[0] || ''}
                    onChange={(e) => handleFilterChange({ 
                      rule_types: e.target.value ? [e.target.value as RuleType] : undefined 
                    })}
                    className="form-input"
                  >
                    <option value="">All Types</option>
                    <option value="data_retention">Data Retention</option>
                    <option value="data_encryption">Data Encryption</option>
                    <option value="access_control">Access Control</option>
                    <option value="data_masking">Data Masking</option>
                    <option value="audit_logging">Audit Logging</option>
                    <option value="data_classification">Data Classification</option>
                    <option value="consent_management">Consent Management</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={filters.enabled?.toString() || ''}
                    onChange={(e) => handleFilterChange({ 
                      enabled: e.target.value === '' ? undefined : e.target.value === 'true'
                    })}
                    className="form-input"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rules Table */}
      <div className="card">
        <div className="card-content p-0">
          {filteredRules.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No compliance rules found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first compliance rule'}
              </p>
              {checkPermission('compliance:create') && !searchQuery && (
                <button
                  onClick={() => router.push('/compliance-rules/new')}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Compliance Rule
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
                        checked={selectedIds.length === filteredRules.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="table-head">Name</th>
                    <th className="table-head">Framework</th>
                    <th className="table-head">Type</th>
                    <th className="table-head">Severity</th>
                    <th className="table-head">Status</th>
                    <th className="table-head">Violations</th>
                    <th className="table-head">Last Run</th>
                    <th className="table-head w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="table-row">
                      <td className="table-cell">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(rule.id)}
                          onChange={(e) => handleSelectItem(rule.id, e.target.checked)}
                          className="rounded border-border"
                        />
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(rule)}
                          <div>
                            <button
                              onClick={() => router.push(`/compliance-rules/${rule.id}`)}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {rule.name}
                            </button>
                            {rule.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {rule.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          {getFrameworkIcon(rule.framework)}
                          <span className="uppercase text-sm font-medium">
                            {rule.framework}
                          </span>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <span className="capitalize text-sm">
                          {rule.rule_type.replace('_', ' ')}
                        </span>
                      </td>
                      
                      <td className="table-cell">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border",
                          getSeverityColor(rule.severity)
                        )}>
                          {rule.severity}
                        </span>
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            rule.enabled ? "bg-green-500" : "bg-gray-400"
                          )} />
                          <span className="text-sm">
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        {rule.statistics ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {rule.statistics.pending_violations}
                              </span>
                              <span className="text-xs text-muted-foreground">pending</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                {rule.statistics.resolved_violations}
                              </span>
                              <span className="text-xs text-muted-foreground">resolved</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="table-cell">
                        {rule.statistics?.last_validation ? (
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(rule.statistics.last_validation)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center space-x-1">
                          {checkPermission('compliance:view') && (
                            <button
                              onClick={() => router.push(`/compliance-rules/${rule.id}`)}
                              className="btn-ghost btn-sm p-1"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          {checkPermission('compliance:execute') && (
                            <button
                              onClick={() => handleExecuteRule(rule)}
                              className="btn-ghost btn-sm p-1"
                              title="Execute Rule"
                              disabled={executeRule.isPending}
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          
                          {checkPermission('compliance:edit') && (
                            <button
                              onClick={() => router.push(`/compliance-rules/${rule.id}/edit`)}
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
                                {checkPermission('compliance:edit') && (
                                  <button
                                    onClick={() => handleToggleStatus(rule)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                                    disabled={toggleRuleStatus.isPending}
                                  >
                                    {rule.enabled ? (
                                      <>
                                        <Pause className="h-4 w-4 mr-2 inline" />
                                        Disable
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-4 w-4 mr-2 inline" />
                                        Enable
                                      </>
                                    )}
                                  </button>
                                )}
                                
                                {checkPermission('compliance:validate') && (
                                  <button
                                    onClick={() => handleValidateRule(rule)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                                    disabled={validateRule.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 inline" />
                                    Validate
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => router.push(`/compliance-rules/${rule.id}/violations`)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2 inline" />
                                  View Violations
                                </button>
                                
                                <button
                                  onClick={() => router.push(`/compliance-rules/${rule.id}/reports`)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                                >
                                  <FileText className="h-4 w-4 mr-2 inline" />
                                  Generate Report
                                </button>
                                
                                {checkPermission('compliance:delete') && (
                                  <>
                                    <hr className="my-1 border-border" />
                                    <button
                                      onClick={() => handleDeleteRule(rule)}
                                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                                      disabled={deleteRule.isPending}
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
            Showing {filteredRules.length} of {totalCount} compliance rules
          </p>
          
          {/* Pagination controls would go here */}
        </div>
      )}
    </div>
  );
}