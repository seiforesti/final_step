import React, { useState, useEffect, useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Search, Filter, Download, Upload, RefreshCw, MoreVertical, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, Edit, Trash2, Plus, Minus, Copy, Share, Star, Flag, Tag, Calendar, Clock,
  Users, Award, Target, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle,
  XCircle, Info, Settings, Grid, List, Columns, SortAsc, SortDesc, FilterX, X,
  Maximize, Minimize, RotateCcw, Save, FileText, Image, Database, Server, Zap,
  Brain, Bot, Network, GitBranch, Layers, Package, Monitor, Cpu, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FixedSizeList as List } from 'react-window';

// Advanced TypeScript interfaces
interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  description?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  groupable?: boolean;
  exportable?: boolean;
  virtualScrolling?: boolean;
  realTimeUpdates?: boolean;
  batchActions?: BatchAction<T>[];
  contextActions?: ContextAction<T>[];
  pagination?: PaginationConfig;
  defaultSort?: SortConfig;
  defaultFilters?: FilterConfig[];
  defaultGroupBy?: string;
  rowHeight?: number;
  maxHeight?: number;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  onSelectionChange?: (selectedRows: T[], selectedIds: string[]) => void;
  onSortChange?: (sort: SortConfig) => void;
  onFilterChange?: (filters: FilterConfig[]) => void;
  onGroupChange?: (groupBy: string | null) => void;
  onExport?: (format: 'csv' | 'xlsx' | 'json', data: T[]) => void;
  onRefresh?: () => void;
}

interface DataTableColumn<T = any> {
  id: string;
  header: string | React.ReactNode;
  accessor?: keyof T | ((row: T) => any);
  cell?: (value: any, row: T, index: number) => React.ReactNode;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  resizable?: boolean;
  sticky?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'progress' | 'actions' | 'custom';
  format?: (value: any) => string;
  filterType?: 'text' | 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  filterOptions?: FilterOption[];
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface FilterOption {
  label: string;
  value: any;
  count?: number;
}

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  column: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn';
  value: any;
  values?: any[];
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  pageSizeOptions?: number[];
}

interface BatchAction<T = any> {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  action: (selectedRows: T[]) => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (selectedRows: T[]) => boolean;
  confirmation?: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
  };
}

interface ContextAction<T = any> {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  action: (row: T, index: number) => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (row: T, index: number) => boolean;
  separator?: boolean;
}

interface GroupedData<T = any> {
  key: string;
  label: string;
  count: number;
  items: T[];
  collapsed?: boolean;
}

export interface DataTableRef {
  refresh: () => void;
  clearSelection: () => void;
  selectAll: () => void;
  exportData: (format: 'csv' | 'xlsx' | 'json') => void;
  resetFilters: () => void;
  resetSort: () => void;
  scrollToRow: (index: number) => void;
}

const DataTable = forwardRef<DataTableRef, DataTableProps>(({
  data,
  columns,
  loading = false,
  error = null,
  title,
  description,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  groupable = false,
  exportable = true,
  virtualScrolling = false,
  realTimeUpdates = false,
  batchActions = [],
  contextActions = [],
  pagination,
  defaultSort,
  defaultFilters = [],
  defaultGroupBy,
  rowHeight = 48,
  maxHeight = 600,
  className,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onGroupChange,
  onExport,
  onRefresh
}, ref) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [filters, setFilters] = useState<FilterConfig[]>(defaultFilters);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<string | null>(defaultGroupBy || null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [contextMenuOpen, setContextMenuOpen] = useState<{ row: any; index: number; x: number; y: number } | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [exportPanelOpen, setExportPanelOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState<BatchAction | null>(null);
  
  // Advanced enterprise features state
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'kanban'>('table');
  const [pinnedColumns, setPinnedColumns] = useState<Set<string>>(new Set());
  const [customViews, setCustomViews] = useState<Record<string, any>>({});
  const [activeView, setActiveView] = useState<string>('default');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    dataProcessingTime: 0,
    totalRows: data.length,
    visibleRows: 0,
    lastUpdate: new Date().toISOString(),
    memoryUsage: 0,
    scrollPosition: 0
  });
  const [intelligentSuggestions, setIntelligentSuggestions] = useState<Array<{
    type: 'filter' | 'sort' | 'group' | 'column' | 'optimization';
    suggestion: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    action: () => void;
  }>>([]);
  const [dataQualityMetrics, setDataQualityMetrics] = useState({
    completeness: 0,
    accuracy: 0,
    consistency: 0,
    timeliness: 0,
    validity: 0,
    duplicates: 0,
    outliers: 0
  });
  const [realTimeConnection, setRealTimeConnection] = useState<WebSocket | null>(null);
  const [auditTrail, setAuditTrail] = useState<Array<{
    timestamp: string;
    action: string;
    user: string;
    details: any;
  }>>([]);

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  const virtualListRef = useRef<List>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  // Computed values
  const visibleColumns = useMemo(() => {
    return columns.filter(col => columnVisibility[col.id]);
  }, [columns, columnVisibility]);

  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery && searchable) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row => {
        return columns.some(col => {
          if (!col.accessor) return false;
          const value = typeof col.accessor === 'function' 
            ? col.accessor(row) 
            : row[col.accessor];
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply column filters
    filters.forEach(filter => {
      const column = columns.find(col => col.id === filter.column);
      if (!column || !column.accessor) return;

      result = result.filter(row => {
        const value = typeof column.accessor === 'function' 
          ? column.accessor(row) 
          : row[column.accessor];

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'gte':
            return Number(value) >= Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          case 'lte':
            return Number(value) <= Number(filter.value);
          case 'between':
            return Number(value) >= Number(filter.values?.[0]) && Number(value) <= Number(filter.values?.[1]);
          case 'in':
            return filter.values?.includes(value);
          case 'notIn':
            return !filter.values?.includes(value);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (sortConfig) {
      const column = columns.find(col => col.id === sortConfig.column);
      if (column && column.accessor) {
        result.sort((a, b) => {
          const aValue = typeof column.accessor === 'function' 
            ? column.accessor(a) 
            : a[column.accessor];
          const bValue = typeof column.accessor === 'function' 
            ? column.accessor(b) 
            : b[column.accessor];

          if (aValue === bValue) return 0;
          
          const comparison = aValue < bValue ? -1 : 1;
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, searchQuery, filters, sortConfig, columns, searchable]);

  const groupedData = useMemo(() => {
    if (!groupBy) return null;

    const column = columns.find(col => col.id === groupBy);
    if (!column || !column.accessor) return null;

    const groups = new Map<string, any[]>();
    
    processedData.forEach(row => {
      const value = typeof column.accessor === 'function' 
        ? column.accessor(row) 
        : row[column.accessor];
      const key = String(value);
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: key || 'Ungrouped',
      count: items.length,
      items,
      collapsed: !expandedGroups.has(key)
    }));
  }, [processedData, groupBy, columns, expandedGroups]);

  const selectedRowsData = useMemo(() => {
    return processedData.filter((_, index) => selectedRows.has(String(index)));
  }, [processedData, selectedRows]);

  // Effects
  useEffect(() => {
    onSelectionChange?.(selectedRowsData, Array.from(selectedRows));
  }, [selectedRowsData, selectedRows, onSelectionChange]);

  useEffect(() => {
    onSortChange?.(sortConfig!);
  }, [sortConfig, onSortChange]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  useEffect(() => {
    onGroupChange?.(groupBy);
  }, [groupBy, onGroupChange]);

  useEffect(() => {
    // Set up resize observer for responsive columns
    if (tableRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        // Handle responsive column adjustments
      });
      resizeObserverRef.current.observe(tableRef.current);
    }

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  // Event handlers
  const handleSort = useCallback((columnId: string) => {
    if (!sortable) return;
    
    const column = columns.find(col => col.id === columnId);
    if (!column || column.sortable === false) return;

    setSortConfig(prev => {
      if (prev?.column === columnId) {
        return prev.direction === 'asc' 
          ? { column: columnId, direction: 'desc' }
          : null;
      } else {
        return { column: columnId, direction: 'asc' };
      }
    });
  }, [sortable, columns]);

  const handleRowSelection = useCallback((rowIndex: string, checked: boolean) => {
    if (!selectable) return;

    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowIndex);
      } else {
        newSet.delete(rowIndex);
      }
      return newSet;
    });
  }, [selectable]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!selectable) return;

    if (checked) {
      const allIndices = processedData.map((_, index) => String(index));
      setSelectedRows(new Set(allIndices));
    } else {
      setSelectedRows(new Set());
    }
  }, [selectable, processedData]);

  const handleGroupToggle = useCallback((groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }, []);

  const handleBatchAction = useCallback(async (action: BatchAction) => {
    try {
      if (action.confirmation) {
        setBulkActionDialogOpen(action);
        return;
      }

      await action.action(selectedRowsData);
      setSelectedRows(new Set());
      toast.success(`${action.label} completed successfully`);
      onRefresh?.();
    } catch (error) {
      toast.error(`${action.label} failed`, {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [selectedRowsData, onRefresh]);

  const handleContextAction = useCallback(async (action: ContextAction, row: any, index: number) => {
    try {
      await action.action(row, index);
      toast.success(`${action.label} completed successfully`);
      onRefresh?.();
    } catch (error) {
      toast.error(`${action.label} failed`, {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [onRefresh]);

  const handleExport = useCallback((format: 'csv' | 'xlsx' | 'json') => {
    onExport?.(format, processedData);
    setExportPanelOpen(false);
    toast.success(`Data exported as ${format.toUpperCase()}`);
  }, [processedData, onExport]);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
    toast.success('Data refreshed');
  }, [onRefresh]);

  // Imperative handle
  useImperativeHandle(ref, () => ({
    refresh: handleRefresh,
    clearSelection: () => setSelectedRows(new Set()),
    selectAll: () => handleSelectAll(true),
    exportData: handleExport,
    resetFilters: () => setFilters([]),
    resetSort: () => setSortConfig(null),
    scrollToRow: (index: number) => {
      if (virtualScrolling && virtualListRef.current) {
        virtualListRef.current.scrollToItem(index);
      }
    }
  }), [handleRefresh, handleSelectAll, handleExport]);

  // Render helpers
  const renderCellContent = useCallback((column: DataTableColumn, value: any, row: any, index: number) => {
    if (column.cell) {
      return column.cell(value, row, index);
    }

    switch (column.type) {
      case 'badge':
        return (
          <Badge variant={value?.variant || 'default'} className={value?.className}>
            {value?.label || String(value)}
          </Badge>
        );
      
      case 'progress':
        return (
          <div className="flex items-center space-x-2">
            <Progress value={Number(value)} className="flex-1" />
            <span className="text-xs text-muted-foreground">{value}%</span>
          </div>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center justify-center">
            {value ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        );
      
      case 'actions':
        return (
          <div className="flex items-center space-x-1">
            {contextActions.map(action => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={action.variant || 'ghost'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextAction(action, row, index);
                    }}
                    disabled={action.disabled?.(row, index)}
                  >
                    {action.icon && <action.icon className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{action.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        );
      
      case 'date':
        return column.format ? column.format(value) : new Date(value).toLocaleDateString();
      
      case 'number':
        return column.format ? column.format(value) : Number(value).toLocaleString();
      
      default:
        return column.format ? column.format(value) : String(value || '');
    }
  }, [contextActions, handleContextAction]);

  const renderTableHeader = () => (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center space-x-4">
        {title && (
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        
        {selectedRows.size > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {selectedRows.size} selected
            </Badge>
            {batchActions.map(action => (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={() => handleBatchAction(action)}
                disabled={action.disabled?.(selectedRowsData)}
              >
                {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        )}
        
        {filterable && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilterPanelOpen(true)}
          >
            <Filter className="h-4 w-4" />
            {filters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filters.length}
              </Badge>
            )}
          </Button>
        )}
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setColumnsPanelOpen(true)}
        >
          <Columns className="h-4 w-4" />
        </Button>
        
        {exportable && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExportPanelOpen(true)}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        
        {onRefresh && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        )}
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-sm text-destructive mb-2">Error loading data</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            {onRefresh && (
              <Button size="sm" variant="outline" onClick={handleRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (processedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Database className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No data available</p>
            {(searchQuery || filters.length > 0) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilters([]);
                }}
                className="mt-4"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === processedData.length && processedData.length > 0}
                    indeterminate={selectedRows.size > 0 && selectedRows.size < processedData.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {visibleColumns.map(column => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "relative group",
                    column.headerClassName,
                    column.sortable !== false && sortable && "cursor-pointer hover:bg-muted/50",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.header}</span>
                    {column.sortable !== false && sortable && (
                      <div className="flex flex-col">
                        {sortConfig?.column === column.id ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData ? (
              groupedData.map(group => (
                <React.Fragment key={group.key}>
                  <TableRow className="bg-muted/25">
                    <TableCell
                      colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                      className="font-medium"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGroupToggle(group.key)}
                        className="h-auto p-1"
                      >
                        {group.collapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="ml-2">
                          {group.label} ({group.count})
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                  {!group.collapsed && group.items.map((row, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        "hover:bg-muted/50 cursor-pointer",
                        selectedRows.has(String(index)) && "bg-muted"
                      )}
                      onClick={() => onRowClick?.(row, index)}
                      onDoubleClick={() => onRowDoubleClick?.(row, index)}
                    >
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(String(index))}
                            onCheckedChange={(checked) => handleRowSelection(String(index), !!checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map(column => {
                        const value = column.accessor
                          ? typeof column.accessor === 'function'
                            ? column.accessor(row)
                            : row[column.accessor]
                          : '';
                        
                        return (
                          <TableCell
                            key={column.id}
                            className={cn(
                              column.cellClassName,
                              column.align === 'center' && "text-center",
                              column.align === 'right' && "text-right"
                            )}
                          >
                            {renderCellContent(column, value, row, index)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            ) : (
              processedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "hover:bg-muted/50 cursor-pointer",
                    selectedRows.has(String(index)) && "bg-muted"
                  )}
                  onClick={() => onRowClick?.(row, index)}
                  onDoubleClick={() => onRowDoubleClick?.(row, index)}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(String(index))}
                        onCheckedChange={(checked) => handleRowSelection(String(index), !!checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map(column => {
                    const value = column.accessor
                      ? typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : row[column.accessor]
                      : '';
                    
                    return (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.cellClassName,
                          column.align === 'center' && "text-center",
                          column.align === 'right' && "text-right"
                        )}
                      >
                        {renderCellContent(column, value, row, index)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Card className={cn("w-full", className)}>
        {renderTableHeader()}
        
        <div ref={tableRef} style={{ maxHeight }}>
          <ScrollArea className="h-full">
            {renderTable()}
          </ScrollArea>
        </div>

        {/* Filter Panel */}
        <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
          <SheetContent side="right" className="w-96">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Apply filters to refine your data view
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-4 mt-6">
              {columns.filter(col => col.filterable !== false).map(column => (
                <div key={column.id} className="space-y-2">
                  <Label className="text-sm font-medium">{String(column.header)}</Label>
                  <Input
                    placeholder={`Filter by ${String(column.header).toLowerCase()}...`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        setFilters(prev => [
                          ...prev.filter(f => f.column !== column.id),
                          { column: column.id, operator: 'contains', value }
                        ]);
                      } else {
                        setFilters(prev => prev.filter(f => f.column !== column.id));
                      }
                    }}
                  />
                </div>
              ))}
              
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setFilters([])}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setFilterPanelOpen(false)}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Columns Panel */}
        <Sheet open={columnsPanelOpen} onOpenChange={setColumnsPanelOpen}>
          <SheetContent side="right" className="w-96">
            <SheetHeader>
              <SheetTitle>Columns</SheetTitle>
              <SheetDescription>
                Show or hide table columns
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-4 mt-6">
              {columns.map(column => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={columnVisibility[column.id]}
                    onCheckedChange={(checked) => {
                      setColumnVisibility(prev => ({
                        ...prev,
                        [column.id]: !!checked
                      }));
                    }}
                  />
                  <Label htmlFor={column.id} className="text-sm">
                    {String(column.header)}
                  </Label>
                </div>
              ))}
              
              {groupable && (
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Group By</Label>
                  <Select value={groupBy || ''} onValueChange={(value) => setGroupBy(value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column to group by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No grouping</SelectItem>
                      {columns
                        .filter(col => col.groupable !== false)
                        .map(column => (
                          <SelectItem key={column.id} value={column.id}>
                            {String(column.header)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Export Panel */}
        <Dialog open={exportPanelOpen} onOpenChange={setExportPanelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>
                Choose the format to export your data
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="h-20 flex-col"
              >
                <FileText className="h-8 w-8 mb-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('xlsx')}
                className="h-20 flex-col"
              >
                <FileText className="h-8 w-8 mb-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                className="h-20 flex-col"
              >
                <Database className="h-8 w-8 mb-2" />
                JSON
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Action Confirmation Dialog */}
        {bulkActionDialogOpen && (
          <Dialog open={!!bulkActionDialogOpen} onOpenChange={() => setBulkActionDialogOpen(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{bulkActionDialogOpen.confirmation?.title}</DialogTitle>
                <DialogDescription>
                  {bulkActionDialogOpen.confirmation?.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setBulkActionDialogOpen(null)}
                >
                  {bulkActionDialogOpen.confirmation?.cancelText || 'Cancel'}
                </Button>
                <Button
                  variant={bulkActionDialogOpen.variant === 'destructive' ? 'destructive' : 'default'}
                  onClick={async () => {
                    await bulkActionDialogOpen.action(selectedRowsData);
                    setBulkActionDialogOpen(null);
                    setSelectedRows(new Set());
                    toast.success(`${bulkActionDialogOpen.label} completed successfully`);
                    onRefresh?.();
                  }}
                >
                  {bulkActionDialogOpen.confirmation?.confirmText || 'Confirm'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    </TooltipProvider>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;