// DataTable.tsx - Enterprise-grade data table component for RBAC system
// Provides advanced data table with sorting, filtering, pagination, selection, and RBAC integration

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, Download, Upload, MoreHorizontal, Eye, Edit, Trash2, Plus, Minus, Grid, List, Settings, RefreshCw, AlertCircle, CheckCircle2, X, ArrowUpDown, SortAsc, SortDesc, Columns, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib copie/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { LoadingSpinner, Skeleton } from './LoadingStates';

// Core table interfaces
export interface Column<T = any> {
  id: string;
  key: keyof T;
  header: string | React.ReactNode;
  cell?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  hidden?: boolean;
  permission?: string;
  tooltip?: string;
  renderFilter?: (column: Column<T>, value: any, onChange: (value: any) => void) => React.ReactNode;
}

export interface TableAction<T = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  permission?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost';
  onClick: (item: T, index: number) => void;
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
  tooltip?: string;
}

export interface BulkAction<T = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  permission?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  onClick: (selectedItems: T[], selectedIndices: number[]) => void;
  disabled?: (selectedItems: T[]) => boolean;
  confirmMessage?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: any;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  
  // Selection
  selectable?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (selectedItems: T[], selectedIndices: number[]) => void;
  rowKey?: keyof T | ((item: T) => string | number);
  
  // Actions
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  onRowClick?: (item: T, index: number) => void;
  
  // Sorting
  sortable?: boolean;
  defaultSort?: SortConfig;
  onSortChange?: (sort: SortConfig | null) => void;
  
  // Filtering
  filterable?: boolean;
  filters?: FilterConfig;
  onFiltersChange?: (filters: FilterConfig) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  
  // Pagination
  pagination?: PaginationConfig;
  onPaginationChange?: (pagination: PaginationConfig) => void;
  
  // Appearance
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'striped' | 'bordered' | 'minimal';
  density?: 'compact' | 'comfortable' | 'spacious';
  
  // Features
  exportable?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  expandable?: boolean;
  expandedRowRender?: (item: T, index: number) => React.ReactNode;
  
  // Customization
  className?: string;
  rowClassName?: (item: T, index: number) => string;
  emptyMessage?: string;
  title?: string;
  description?: string;
  
  // RBAC
  permission?: string;
  hideActionsWhenNoPermission?: boolean;
  
  // Advanced
  virtualScrolling?: boolean;
  stickyHeader?: boolean;
  contextMenu?: boolean;
  groupBy?: keyof T;
  aggregations?: Record<string, (items: T[]) => any>;
}

// Utility functions
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((value, key) => value?.[key], obj);
};

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getRowKey = <T,>(item: T, index: number, rowKey?: keyof T | ((item: T) => string | number)): string => {
  if (typeof rowKey === 'function') {
    return String(rowKey(item));
  }
  if (rowKey && item[rowKey] !== undefined) {
    return String(item[rowKey]);
  }
  return String(index);
};

// Filter components
const TextFilter: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "Filter..." }) => (
  <div className="relative">
    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
);

const SelectFilter: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}> = ({ value, onChange, options, placeholder = "All" }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Column header component
const ColumnHeader: React.FC<{
  column: Column;
  sortConfig?: SortConfig | null;
  onSort?: (key: string) => void;
  onFilter?: (key: string, value: any) => void;
  filterValue?: any;
}> = ({ column, sortConfig, onSort, onFilter, filterValue }) => {
  const [showFilter, setShowFilter] = useState(false);
  const isSorted = sortConfig?.key === column.key;
  const sortDirection = isSorted ? sortConfig.direction : null;

  const handleSort = () => {
    if (column.sortable && onSort) {
      onSort(String(column.key));
    }
  };

  const renderSortIcon = () => {
    if (!column.sortable) return null;
    
    if (sortDirection === 'asc') {
      return <SortAsc className="w-4 h-4 text-blue-600" />;
    }
    if (sortDirection === 'desc') {
      return <SortDesc className="w-4 h-4 text-blue-600" />;
    }
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <button
          onClick={handleSort}
          disabled={!column.sortable}
          className={cn(
            "flex items-center space-x-1 text-left font-medium",
            column.sortable && "hover:text-blue-600 cursor-pointer",
            !column.sortable && "cursor-default"
          )}
          title={column.tooltip}
        >
          <span>{column.header}</span>
          {renderSortIcon()}
        </button>
        
        {column.filterable && (
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={cn(
              "p-1 rounded hover:bg-gray-100 transition-colors",
              showFilter && "bg-blue-50 text-blue-600",
              filterValue && "text-blue-600"
            )}
            title="Filter column"
          >
            <Filter className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {showFilter && column.filterable && onFilter && (
        <div className="mt-1">
          {column.renderFilter ? (
            column.renderFilter(column, filterValue, (value) => onFilter(String(column.key), value))
          ) : (
            <TextFilter
              value={filterValue || ''}
              onChange={(value) => onFilter(String(column.key), value)}
              placeholder={`Filter ${column.header}...`}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Row actions component
const RowActions: React.FC<{
  item: any;
  index: number;
  actions: TableAction[];
}> = ({ item, index, actions }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { hasPermission } = usePermissionCheck();
  
  const visibleActions = actions.filter(action => {
    if (action.hidden?.(item)) return false;
    if (action.permission && !hasPermission(action.permission)) return false;
    return true;
  });

  if (visibleActions.length === 0) return null;

  const primaryActions = visibleActions.slice(0, 2);
  const secondaryActions = visibleActions.slice(2);

  return (
    <div className="flex items-center space-x-1">
      {primaryActions.map((action) => (
        <button
          key={action.id}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item, index);
          }}
          disabled={action.disabled?.(item)}
          className={cn(
            "p-1 rounded hover:bg-gray-100 transition-colors",
            action.variant === 'destructive' && "hover:bg-red-50 hover:text-red-600",
            action.disabled?.(item) && "opacity-50 cursor-not-allowed"
          )}
          title={action.tooltip || action.label}
        >
          {action.icon || <Eye className="w-4 h-4" />}
        </button>
      ))}
      
      {secondaryActions.length > 0 && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
              {secondaryActions.map((action) => (
                <button
                  key={action.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    action.onClick(item, index);
                  }}
                  disabled={action.disabled?.(item)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2",
                    action.variant === 'destructive' && "hover:bg-red-50 text-red-600",
                    action.disabled?.(item) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {action.icon && <span>{action.icon}</span>}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Bulk actions bar
const BulkActionsBar: React.FC<{
  selectedCount: number;
  bulkActions: BulkAction[];
  selectedItems: any[];
  selectedIndices: number[];
  onClearSelection: () => void;
}> = ({ selectedCount, bulkActions, selectedItems, selectedIndices, onClearSelection }) => {
  const { hasPermission } = usePermissionCheck();
  
  const visibleActions = bulkActions.filter(action => {
    if (action.permission && !hasPermission(action.permission)) return false;
    return true;
  });

  if (selectedCount === 0 || visibleActions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear selection
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {visibleActions.map((action) => (
            <button
              key={action.id}
              onClick={() => action.onClick(selectedItems, selectedIndices)}
              disabled={action.disabled?.(selectedItems)}
              className={cn(
                "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors",
                action.variant === 'destructive' && "bg-red-600 text-white hover:bg-red-700",
                action.variant === 'primary' && "bg-blue-600 text-white hover:bg-blue-700",
                (!action.variant || action.variant === 'default') && "bg-gray-600 text-white hover:bg-gray-700",
                action.disabled?.(selectedItems) && "opacity-50 cursor-not-allowed"
              )}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Pagination component
const TablePagination: React.FC<{
  pagination: PaginationConfig;
  onChange: (pagination: PaginationConfig) => void;
}> = ({ pagination, onChange }) => {
  const { page, pageSize, total, showSizeChanger = true, showQuickJumper = true, showTotal = true, pageSizeOptions = [10, 20, 50, 100] } = pagination;
  
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);
  
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onChange({ ...pagination, page: newPage });
    }
  };
  
  const handlePageSizeChange = (newPageSize: number) => {
    const newPage = Math.min(page, Math.ceil(total / newPageSize));
    onChange({ ...pagination, pageSize: newPageSize, page: newPage });
  };
  
  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (page > 4) {
        pages.push('...');
      }
      
      const start = Math.max(2, page - 2);
      const end = Math.min(totalPages - 1, page + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 3) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex items-center space-x-4">
        {showTotal && (
          <span className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {total} results
          </span>
        )}
        
        {showSizeChanger && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={!canGoPrev}
          className={cn(
            "p-1 rounded border",
            canGoPrev ? "border-gray-300 hover:bg-gray-50" : "border-gray-200 text-gray-400 cursor-not-allowed"
          )}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={!canGoPrev}
          className={cn(
            "p-1 rounded border",
            canGoPrev ? "border-gray-300 hover:bg-gray-50" : "border-gray-200 text-gray-400 cursor-not-allowed"
          )}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(pageNum as number)}
                  className={cn(
                    "px-3 py-1 text-sm rounded border transition-colors",
                    pageNum === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={!canGoNext}
          className={cn(
            "p-1 rounded border",
            canGoNext ? "border-gray-300 hover:bg-gray-50" : "border-gray-200 text-gray-400 cursor-not-allowed"
          )}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={!canGoNext}
          className={cn(
            "p-1 rounded border",
            canGoNext ? "border-gray-300 hover:bg-gray-50" : "border-gray-200 text-gray-400 cursor-not-allowed"
          )}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
        
        {showQuickJumper && totalPages > 10 && (
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-700">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const newPage = parseInt((e.target as HTMLInputElement).value);
                  if (newPage >= 1 && newPage <= totalPages) {
                    handlePageChange(newPage);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              placeholder={String(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Main DataTable component
export const DataTable = <T extends Record<string, any> = any>({
  data,
  columns,
  loading = false,
  error = null,
  
  // Selection
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  rowKey,
  
  // Actions
  actions = [],
  bulkActions = [],
  onRowClick,
  
  // Sorting
  sortable = true,
  defaultSort,
  onSortChange,
  
  // Filtering
  filterable = true,
  filters = {},
  onFiltersChange,
  searchable = true,
  searchPlaceholder = "Search...",
  
  // Pagination
  pagination,
  onPaginationChange,
  
  // Appearance
  size = 'medium',
  variant = 'default',
  density = 'comfortable',
  
  // Features
  exportable = false,
  resizable = false,
  reorderable = false,
  expandable = false,
  expandedRowRender,
  
  // Customization
  className,
  rowClassName,
  emptyMessage = 'No data available',
  title,
  description,
  
  // RBAC
  permission,
  hideActionsWhenNoPermission = false,
  
  // Advanced
  virtualScrolling = false,
  stickyHeader = true,
  contextMenu = false,
  groupBy,
  aggregations
}: DataTableProps<T>): JSX.Element => {
  const { hasPermission } = usePermissionCheck();
  const { user } = useCurrentUser();
  
  // State management
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  
  // Permission check
  if (permission && !hasPermission(permission)) {
    return (
      <div className="text-center p-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium">Access Restricted</h3>
        <p>You don't have permission to view this data.</p>
      </div>
    );
  }
  
  // Filter visible columns based on permissions
  const visibleColumns = useMemo(() => {
    return columns.filter(column => {
      if (column.hidden) return false;
      if (column.permission && !hasPermission(column.permission)) return false;
      return true;
    });
  }, [columns, hasPermission]);
  
  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply search
    if (searchQuery && searchable) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        return visibleColumns.some(column => {
          const value = getNestedValue(item, String(column.key));
          return formatCellValue(value).toLowerCase().includes(query);
        });
      });
    }
    
    // Apply column filters
    Object.entries(localFilters).forEach(([key, filterValue]) => {
      if (filterValue && filterValue !== '') {
        result = result.filter(item => {
          const value = getNestedValue(item, key);
          const stringValue = formatCellValue(value).toLowerCase();
          const filterString = String(filterValue).toLowerCase();
          return stringValue.includes(filterString);
        });
      }
    });
    
    return result;
  }, [data, searchQuery, localFilters, visibleColumns, searchable]);
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortConfig]);
  
  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);
  
  // Event handlers
  const handleSort = useCallback((key: string) => {
    const newSortConfig: SortConfig = {
      key,
      direction: sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    };
    setSortConfig(newSortConfig);
    onSortChange?.(newSortConfig);
  }, [sortConfig, onSortChange]);
  
  const handleFilter = useCallback((key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [localFilters, onFiltersChange]);
  
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIndices = paginatedData.map((_, index) => index);
      setSelectedIndices(allIndices);
      onSelectionChange?.(paginatedData, allIndices);
    } else {
      setSelectedIndices([]);
      onSelectionChange?.([], []);
    }
  }, [paginatedData, onSelectionChange]);
  
  const handleSelectRow = useCallback((index: number, checked: boolean) => {
    let newSelectedIndices: number[];
    if (checked) {
      newSelectedIndices = [...selectedIndices, index];
    } else {
      newSelectedIndices = selectedIndices.filter(i => i !== index);
    }
    
    setSelectedIndices(newSelectedIndices);
    const selectedItems = newSelectedIndices.map(i => paginatedData[i]);
    onSelectionChange?.(selectedItems, newSelectedIndices);
  }, [selectedIndices, paginatedData, onSelectionChange]);
  
  const handleRowClick = useCallback((item: T, index: number) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  }, [onRowClick]);
  
  const handleExpandRow = useCallback((rowKey: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowKey)) {
      newExpandedRows.delete(rowKey);
    } else {
      newExpandedRows.add(rowKey);
    }
    setExpandedRows(newExpandedRows);
  }, [expandedRows]);
  
  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {title && <Skeleton height="2rem" width="200px" />}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)` }}>
              {visibleColumns.map((_, index) => (
                <Skeleton key={index} height="1rem" width="60%" />
              ))}
            </div>
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="p-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)` }}>
                  {visibleColumns.map((_, colIndex) => (
                    <Skeleton key={colIndex} height="1rem" width={`${60 + Math.random() * 30}%`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  // Calculate selection state
  const allSelected = selectedIndices.length === paginatedData.length && paginatedData.length > 0;
  const someSelected = selectedIndices.length > 0 && selectedIndices.length < paginatedData.length;
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {(title || description || searchable || exportable) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          
          <div className="flex items-center space-x-3">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {exportable && (
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Bulk Actions */}
      <AnimatePresence>
        {selectable && bulkActions.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedIndices.length}
            bulkActions={bulkActions}
            selectedItems={selectedIndices.map(i => paginatedData[i])}
            selectedIndices={selectedIndices}
            onClearSelection={() => {
              setSelectedIndices([]);
              onSelectionChange?.([], []);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className={cn(
            "min-w-full divide-y divide-gray-200",
            variant === 'striped' && "divide-y-0",
            size === 'small' && "text-sm",
            size === 'large' && "text-base"
          )}>
            <thead className={cn(
              "bg-gray-50",
              stickyHeader && "sticky top-0 z-10"
            )}>
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                
                {expandable && (
                  <th className="px-6 py-3 w-12"></th>
                )}
                
                {visibleColumns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right",
                      column.sticky && "sticky left-0 bg-gray-50 z-10"
                    )}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth
                    }}
                  >
                    <ColumnHeader
                      column={column}
                      sortConfig={sortConfig}
                      onSort={sortable ? handleSort : undefined}
                      onFilter={filterable ? handleFilter : undefined}
                      filterValue={localFilters[String(column.key)]}
                    />
                  </th>
                ))}
                
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className={cn(
              "bg-white divide-y divide-gray-200",
              variant === 'striped' && "divide-y-0"
            )}>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const rowKeyValue = getRowKey(item, index, rowKey);
                  const isSelected = selectedIndices.includes(index);
                  const isExpanded = expandedRows.has(rowKeyValue);
                  
                  return (
                    <React.Fragment key={rowKeyValue}>
                      <tr
                        className={cn(
                          "hover:bg-gray-50 transition-colors cursor-pointer",
                          variant === 'striped' && index % 2 === 1 && "bg-gray-50",
                          isSelected && "bg-blue-50",
                          rowClassName?.(item, index)
                        )}
                        onClick={() => handleRowClick(item, index)}
                      >
                        {selectable && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectRow(index, e.target.checked);
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                        )}
                        
                        {expandable && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExpandRow(rowKeyValue);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        )}
                        
                        {visibleColumns.map((column) => {
                          const value = getNestedValue(item, String(column.key));
                          const cellContent = column.cell ? column.cell(item, index) : formatCellValue(value);
                          
                          return (
                            <td
                              key={String(column.key)}
                              className={cn(
                                "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                                column.align === 'center' && "text-center",
                                column.align === 'right' && "text-right",
                                column.sticky && "sticky left-0 bg-white",
                                density === 'compact' && "py-2",
                                density === 'spacious' && "py-6"
                              )}
                            >
                              {cellContent}
                            </td>
                          );
                        })}
                        
                        {actions.length > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <RowActions
                              item={item}
                              index={index}
                              actions={actions}
                            />
                          </td>
                        )}
                      </tr>
                      
                      {expandable && isExpanded && expandedRowRender && (
                        <tr>
                          <td
                            colSpan={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                            className="px-6 py-4 bg-gray-50"
                          >
                            {expandedRowRender(item, index)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && onPaginationChange && paginatedData.length > 0 && (
          <TablePagination
            pagination={{
              ...pagination,
              total: filteredData.length
            }}
            onChange={onPaginationChange}
          />
        )}
      </div>
    </div>
  );
};

export default DataTable;