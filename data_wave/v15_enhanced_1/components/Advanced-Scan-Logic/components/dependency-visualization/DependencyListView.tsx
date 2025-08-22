"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Download, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';

interface DependencyListItem {
  id: string;
  name: string;
  type: 'workflow' | 'task' | 'resource' | 'service';
  status: 'active' | 'inactive' | 'pending' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  dependents: string[];
  lastUpdated: Date;
  metadata?: Record<string, any>;
}

interface DependencyListViewProps {
  dependencies: DependencyListItem[];
  onDependencySelect?: (dependencyId: string) => void;
  selectedDependencyId?: string;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  showMetadata?: boolean;
  maxItems?: number;
}

type SortField = 'name' | 'type' | 'status' | 'priority' | 'lastUpdated' | 'dependencies' | 'dependents';
type SortDirection = 'asc' | 'desc';

export const DependencyListView: React.FC<DependencyListViewProps> = ({
  dependencies,
  onDependencySelect,
  selectedDependencyId,
  enableSearch = true,
  enableFiltering = true,
  enableSorting = true,
  showMetadata = false,
  maxItems = 100
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { hasPermission } = usePermissionCheck();

  const canViewDependencies = hasPermission({ action: 'read', resource: 'dependency' });
  const canManageDependencies = hasPermission({ action: 'manage', resource: 'dependency' });

  // Filter and search dependencies
  const filteredDependencies = useMemo(() => {
    let filtered = dependencies;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(dep => dep.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(dep => dep.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(dep => dep.priority === filterPriority);
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(dep => 
        dep.name.toLowerCase().includes(searchLower) ||
        dep.type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [dependencies, filterType, filterStatus, filterPriority, searchTerm]);

  // Sort dependencies
  const sortedDependencies = useMemo(() => {
    if (!enableSorting) return filteredDependencies;

    return [...filteredDependencies].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'lastUpdated':
          aValue = a.lastUpdated.getTime();
          bValue = b.lastUpdated.getTime();
          break;
        case 'dependencies':
          aValue = a.dependencies.length;
          bValue = b.dependencies.length;
          break;
        case 'dependents':
          aValue = a.dependents.length;
          bValue = b.dependents.length;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDependencies, sortField, sortDirection, enableSorting]);

  // Paginate dependencies
  const paginatedDependencies = useMemo(() => {
    const startIndex = (currentPage - 1) * maxItems;
    return sortedDependencies.slice(startIndex, startIndex + maxItems);
  }, [sortedDependencies, currentPage, maxItems]);

  // Handle sorting
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortField]);

  // Get sort icon
  const getSortIcon = useCallback((field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  }, [sortField, sortDirection]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Get priority color
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Export dependencies
  const exportDependencies = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalDependencies: dependencies.length,
      filteredCount: filteredDependencies.length,
      filters: {
        type: filterType,
        status: filterStatus,
        priority: filterPriority,
        searchTerm
      },
      sort: {
        field: sortField,
        direction: sortDirection
      },
      dependencies: paginatedDependencies
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dependencies-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Dependencies Exported",
      description: "Dependency list has been exported successfully.",
      variant: "default"
    });
  }, [dependencies, filteredDependencies, filterType, filterStatus, filterPriority, searchTerm, sortField, sortDirection, paginatedDependencies, toast]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterPriority('all');
    setCurrentPage(1);
  }, []);

  if (!canViewDependencies) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to view dependencies.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Dependency List View</h3>
          <p className="text-sm text-muted-foreground">
            Tabular view of workflow dependencies with advanced filtering and sorting
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <Filter className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportDependencies}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              {enableSearch && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search dependencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Type Filter */}
              {enableFiltering && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter by Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="workflow">Workflows</SelectItem>
                      <SelectItem value="task">Tasks</SelectItem>
                      <SelectItem value="resource">Resources</SelectItem>
                      <SelectItem value="service">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              {enableFiltering && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Priority Filter */}
              {enableFiltering && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter by Priority</label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependencies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dependencies</span>
            <div className="text-sm text-muted-foreground">
              {paginatedDependencies.length} of {filteredDependencies.length} dependencies
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedDependencies.length > 0 ? (
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-semibold"
                      >
                        Name {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('type')}
                        className="h-auto p-0 font-semibold"
                      >
                        Type {getSortIcon('type')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('status')}
                        className="h-auto p-0 font-semibold"
                      >
                        Status {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('priority')}
                        className="h-auto p-0 font-semibold"
                      >
                        Priority {getSortIcon('priority')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('dependencies')}
                        className="h-auto p-0 font-semibold"
                      >
                        Dependencies {getSortIcon('dependencies')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('dependents')}
                        className="h-auto p-0 font-semibold"
                      >
                        Dependents {getSortIcon('dependents')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('lastUpdated')}
                        className="h-auto p-0 font-semibold"
                      >
                        Last Updated {getSortIcon('lastUpdated')}
                      </Button>
                    </TableHead>
                    {showMetadata && <TableHead>Metadata</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDependencies.map((dependency) => (
                    <TableRow
                      key={dependency.id}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        selectedDependencyId === dependency.id ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => onDependencySelect?.(dependency.id)}
                    >
                      <TableCell className="font-medium">{dependency.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dependency.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(dependency.status)}`}>
                          {dependency.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getPriorityColor(dependency.priority)}`}>
                          {dependency.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {dependency.dependencies.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {dependency.dependents.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {dependency.lastUpdated.toLocaleDateString()}
                      </TableCell>
                      {showMetadata && (
                        <TableCell>
                          {dependency.metadata && Object.keys(dependency.metadata).length > 0 ? (
                            <div className="text-xs text-muted-foreground">
                              {Object.entries(dependency.metadata).slice(0, 2).map(([key, value]) => (
                                <div key={key}>
                                  {key}: {String(value)}
                                </div>
                              ))}
                              {Object.keys(dependency.metadata).length > 2 && (
                                <div>+{Object.keys(dependency.metadata).length - 2} more</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <p className="text-lg mb-2">No dependencies found</p>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create some workflow dependencies to see them here'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredDependencies.length > maxItems && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(filteredDependencies.length / maxItems)}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredDependencies.length / maxItems), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredDependencies.length / maxItems)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Summary Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dependencies.length}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dependencies.filter(d => d.status === 'active').length}
                </div>
                <div className="text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {dependencies.filter(d => d.status === 'pending').length}
                </div>
                <div className="text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {dependencies.filter(d => d.status === 'failed').length}
                </div>
                <div className="text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

