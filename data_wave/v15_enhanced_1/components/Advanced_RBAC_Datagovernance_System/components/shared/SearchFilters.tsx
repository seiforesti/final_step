// SearchFilters.tsx - Enterprise-grade search and filter components for RBAC system
// Provides advanced search, filtering, and faceted search capabilities with RBAC integration

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, ChevronUp, Calendar, Check, Minus, Plus, SlidersHorizontal, RefreshCw, Save, BookmarkPlus, Settings, Eye, EyeOff, ArrowUpDown, Hash, Type, ToggleLeft, ToggleRight, Clock, User, Tag, Globe, Lock, Unlock, Star, Heart, MapPin, FileText, Database, Activity, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';

// Core filter types
export interface FilterField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'date' | 'daterange' | 'boolean' | 'number' | 'tags' | 'search';
  placeholder?: string;
  options?: Array<{ label: string; value: any; icon?: React.ReactNode; disabled?: boolean; group?: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  defaultValue?: any;
  permission?: string;
  hidden?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  group?: string;
  order?: number;
  width?: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  description?: string;
  tooltip?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  icon?: React.ReactNode;
  collapsed?: boolean;
  permission?: string;
  order?: number;
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  permission?: string;
}

export interface SearchFiltersProps {
  fields: FilterField[];
  groups?: FilterGroup[];
  values?: Record<string, any>;
  onChange?: (values: Record<string, any>) => void;
  onSearch?: (query: string) => void;
  
  // Search configuration
  searchPlaceholder?: string;
  searchValue?: string;
  enableGlobalSearch?: boolean;
  searchFields?: string[];
  
  // Layout and appearance
  layout?: 'horizontal' | 'vertical' | 'grid' | 'inline';
  variant?: 'default' | 'compact' | 'expanded';
  showGroupHeaders?: boolean;
  collapsible?: boolean;
  
  // Features
  enableSavedFilters?: boolean;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onLoadFilter?: (filterId: string) => void;
  onDeleteFilter?: (filterId: string) => void;
  
  enableQuickFilters?: boolean;
  quickFilters?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    filters: Record<string, any>;
    color?: string;
  }>;
  
  enableBulkActions?: boolean;
  bulkActions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (filters: Record<string, any>) => void;
    permission?: string;
  }>;
  
  // Customization
  className?: string;
  onReset?: () => void;
  resetButtonText?: string;
  submitButtonText?: string;
  
  // RBAC
  permission?: string;
  hideFieldsWithoutPermission?: boolean;
  
  // Advanced
  enableFilterCount?: boolean;
  enableFilterPreview?: boolean;
  enableExport?: boolean;
  maxHeight?: string;
  responsive?: boolean;
}

// Filter value interfaces
interface FilterValue {
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startswith' | 'endswith' | 'in' | 'nin';
  displayValue?: string;
}

interface RangeValue {
  min?: number;
  max?: number;
}

interface DateRangeValue {
  start?: Date;
  end?: Date;
}

// Utility functions
const formatFilterValue = (value: any, field: FilterField): string => {
  if (value === null || value === undefined || value === '') return '';
  
  switch (field.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return value instanceof Date ? value.toLocaleDateString() : String(value);
    case 'daterange':
      if (value.start && value.end) {
        return `${value.start.toLocaleDateString()} - ${value.end.toLocaleDateString()}`;
      }
      return '';
    case 'range':
      if (value.min !== undefined && value.max !== undefined) {
        return `${value.min} - ${value.max}`;
      }
      return '';
    case 'select':
    case 'multiselect':
      if (Array.isArray(value)) {
        const labels = value.map(v => {
          const option = field.options?.find(opt => opt.value === v);
          return option?.label || String(v);
        });
        return labels.join(', ');
      } else {
        const option = field.options?.find(opt => opt.value === value);
        return option?.label || String(value);
      }
    case 'tags':
      return Array.isArray(value) ? value.join(', ') : String(value);
    default:
      return String(value);
  }
};

const validateFilterValue = (value: any, field: FilterField): string | null => {
  const { validation } = field;
  if (!validation) return null;
  
  if (validation.required && (value === null || value === undefined || value === '')) {
    return `${field.label} is required`;
  }
  
  if (field.type === 'number' || field.type === 'range') {
    const numValue = Number(value);
    if (validation.min !== undefined && numValue < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && numValue > validation.max) {
      return `${field.label} must be at most ${validation.max}`;
    }
  }
  
  if (field.type === 'text' && typeof value === 'string') {
    if (validation.min !== undefined && value.length < validation.min) {
      return `${field.label} must be at least ${validation.min} characters`;
    }
    if (validation.max !== undefined && value.length > validation.max) {
      return `${field.label} must be at most ${validation.max} characters`;
    }
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return `${field.label} format is invalid`;
    }
  }
  
  if (validation.custom) {
    return validation.custom(value);
  }
  
  return null;
};

// Individual filter components
const TextFilter: React.FC<{
  field: FilterField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}> = ({ field, value, onChange, error }) => (
  <div className="space-y-1">
    <div className="relative">
      <input
        type="text"
        placeholder={field.placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error && "border-red-500",
          field.clearable && value && "pr-8"
        )}
      />
      {field.clearable && value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const SelectFilter: React.FC<{
  field: FilterField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}> = ({ field, value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOptions = useMemo(() => {
    if (!field.options) return [];
    if (!searchQuery) return field.options;
    
    return field.options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [field.options, searchQuery]);
  
  const selectedOption = field.options?.find(opt => opt.value === value);
  
  return (
    <div className="space-y-1">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-3 py-2 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between",
            error && "border-red-500"
          )}
        >
          <span className={cn(
            selectedOption ? "text-gray-900" : "text-gray-500"
          )}>
            {selectedOption?.label || field.placeholder || 'Select...'}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {field.searchable && (
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search options..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              
              <div className="py-1">
                {field.clearable && value && (
                  <button
                    onClick={() => {
                      onChange(null);
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear selection
                  </button>
                )}
                
                {filteredOptions.map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    disabled={option.disabled}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center",
                      option.value === value && "bg-blue-50 text-blue-700",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                    {option.value === value && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
                
                {filteredOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No options found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

const MultiSelectFilter: React.FC<{
  field: FilterField;
  value: any[];
  onChange: (value: any[]) => void;
  error?: string;
}> = ({ field, value = [], onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOptions = useMemo(() => {
    if (!field.options) return [];
    if (!searchQuery) return field.options;
    
    return field.options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [field.options, searchQuery]);
  
  const selectedOptions = field.options?.filter(opt => value.includes(opt.value)) || [];
  
  const handleToggle = (optionValue: any) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };
  
  return (
    <div className="space-y-1">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-3 py-2 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error && "border-red-500"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 truncate">
              {selectedOptions.length === 0 ? (
                <span className="text-gray-500">{field.placeholder || 'Select...'}</span>
              ) : selectedOptions.length === 1 ? (
                <span>{selectedOptions[0].label}</span>
              ) : (
                <span>{selectedOptions.length} selected</span>
              )}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-400 transition-transform ml-2",
              isOpen && "transform rotate-180"
            )} />
          </div>
        </button>
        
        {selectedOptions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedOptions.map((option) => (
              <span
                key={String(option.value)}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {option.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(option.value);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {field.searchable && (
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search options..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              
              <div className="py-1">
                {field.clearable && value.length > 0 && (
                  <button
                    onClick={() => onChange([])}
                    className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear all
                  </button>
                )}
                
                {filteredOptions.map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => handleToggle(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center",
                      value.includes(option.value) && "bg-blue-50 text-blue-700",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 mr-2 border rounded flex items-center justify-center",
                      value.includes(option.value) ? "bg-blue-600 border-blue-600" : "border-gray-300"
                    )}>
                      {value.includes(option.value) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </button>
                ))}
                
                {filteredOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No options found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

const RangeFilter: React.FC<{
  field: FilterField;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  error?: string;
}> = ({ field, value = {}, onChange, error }) => (
  <div className="space-y-1">
    <div className="flex items-center space-x-2">
      <input
        type="number"
        placeholder="Min"
        value={value.min || ''}
        onChange={(e) => onChange({ ...value, min: e.target.value ? Number(e.target.value) : undefined })}
        className={cn(
          "flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error && "border-red-500"
        )}
      />
      <Minus className="w-4 h-4 text-gray-400" />
      <input
        type="number"
        placeholder="Max"
        value={value.max || ''}
        onChange={(e) => onChange({ ...value, max: e.target.value ? Number(e.target.value) : undefined })}
        className={cn(
          "flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error && "border-red-500"
        )}
      />
    </div>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const DateFilter: React.FC<{
  field: FilterField;
  value: Date | null;
  onChange: (value: Date | null) => void;
  error?: string;
}> = ({ field, value, onChange, error }) => (
  <div className="space-y-1">
    <div className="relative">
      <input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
        className={cn(
          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error && "border-red-500"
        )}
      />
      <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const DateRangeFilter: React.FC<{
  field: FilterField;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  error?: string;
}> = ({ field, value = {}, onChange, error }) => (
  <div className="space-y-1">
    <div className="grid grid-cols-2 gap-2">
      <div className="relative">
        <input
          type="date"
          placeholder="Start date"
          value={value.start ? value.start.toISOString().split('T')[0] : ''}
          onChange={(e) => onChange({ ...value, start: e.target.value ? new Date(e.target.value) : undefined })}
          className={cn(
            "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error && "border-red-500"
          )}
        />
        <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>
      <div className="relative">
        <input
          type="date"
          placeholder="End date"
          value={value.end ? value.end.toISOString().split('T')[0] : ''}
          onChange={(e) => onChange({ ...value, end: e.target.value ? new Date(e.target.value) : undefined })}
          className={cn(
            "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error && "border-red-500"
          )}
        />
        <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>
    </div>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const BooleanFilter: React.FC<{
  field: FilterField;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  error?: string;
}> = ({ field, value, onChange, error }) => (
  <div className="space-y-1">
    <div className="flex items-center space-x-4">
      <label className="flex items-center">
        <input
          type="radio"
          name={field.id}
          checked={value === true}
          onChange={() => onChange(true)}
          className="mr-2 text-blue-600 focus:ring-blue-500"
        />
        Yes
      </label>
      <label className="flex items-center">
        <input
          type="radio"
          name={field.id}
          checked={value === false}
          onChange={() => onChange(false)}
          className="mr-2 text-blue-600 focus:ring-blue-500"
        />
        No
      </label>
      {field.clearable && (
        <label className="flex items-center">
          <input
            type="radio"
            name={field.id}
            checked={value === null}
            onChange={() => onChange(null)}
            className="mr-2 text-blue-600 focus:ring-blue-500"
          />
          Any
        </label>
      )}
    </div>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const TagsFilter: React.FC<{
  field: FilterField;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}> = ({ field, value = [], onChange, error }) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      handleRemoveTag(value[value.length - 1]);
    }
  };
  
  return (
    <div className="space-y-1">
      <div className={cn(
        "min-h-[42px] px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent",
        error && "border-red-500"
      )}>
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={value.length === 0 ? field.placeholder || 'Add tags...' : ''}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) {
                handleAddTag(inputValue);
              }
            }}
            className="flex-1 min-w-24 outline-none"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

// Field wrapper component
const FilterFieldWrapper: React.FC<{
  field: FilterField;
  children: React.ReactNode;
  error?: string;
}> = ({ field, children, error }) => {
  const widthClasses = {
    auto: 'w-auto',
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64',
    xl: 'w-80',
    full: 'w-full'
  };
  
  return (
    <div className={cn(
      'space-y-2',
      field.width ? widthClasses[field.width] : 'w-full'
    )}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {field.label}
          {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.tooltip && (
          <span
            className="text-gray-400 hover:text-gray-600 cursor-help"
            title={field.tooltip}
          >
            <Eye className="w-3 h-3" />
          </span>
        )}
      </div>
      {field.description && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
      {children}
    </div>
  );
};

// Quick filters component
const QuickFilters: React.FC<{
  quickFilters: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    filters: Record<string, any>;
    color?: string;
  }>;
  onApply: (filters: Record<string, any>) => void;
  className?: string;
}> = ({ quickFilters, onApply, className }) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {quickFilters.map((filter) => (
      <button
        key={filter.id}
        onClick={() => onApply(filter.filters)}
        className={cn(
          'inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border transition-colors',
          filter.color === 'blue' && 'border-blue-200 text-blue-700 hover:bg-blue-50',
          filter.color === 'green' && 'border-green-200 text-green-700 hover:bg-green-50',
          filter.color === 'red' && 'border-red-200 text-red-700 hover:bg-red-50',
          filter.color === 'yellow' && 'border-yellow-200 text-yellow-700 hover:bg-yellow-50',
          filter.color === 'purple' && 'border-purple-200 text-purple-700 hover:bg-purple-50',
          !filter.color && 'border-gray-200 text-gray-700 hover:bg-gray-50'
        )}
      >
        {filter.icon && <span className="mr-1.5">{filter.icon}</span>}
        {filter.label}
      </button>
    ))}
  </div>
);

// Saved filters component
const SavedFiltersDropdown: React.FC<{
  savedFilters: SavedFilter[];
  onLoad: (filterId: string) => void;
  onDelete: (filterId: string) => void;
  currentUser: any;
  className?: string;
}> = ({ savedFilters, onLoad, onDelete, currentUser, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <BookmarkPlus className="w-4 h-4 mr-2" />
        Saved Filters
        <ChevronDown className={cn(
          "w-4 h-4 ml-2 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <div className="py-1 max-h-60 overflow-auto">
              {savedFilters.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No saved filters
                </div>
              ) : (
                savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                  >
                    <button
                      onClick={() => {
                        onLoad(filter.id);
                        setIsOpen(false);
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {filter.name}
                        {filter.isDefault && (
                          <Star className="w-3 h-3 inline ml-1 text-yellow-500" />
                        )}
                      </div>
                      {filter.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {filter.description}
                        </div>
                      )}
                    </button>
                    
                    {(filter.createdBy === currentUser?.id || currentUser?.role === 'admin') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(filter.id);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main SearchFilters component
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  fields,
  groups = [],
  values = {},
  onChange,
  onSearch,
  
  // Search configuration
  searchPlaceholder = "Search...",
  searchValue = '',
  enableGlobalSearch = true,
  searchFields = [],
  
  // Layout and appearance
  layout = 'vertical',
  variant = 'default',
  showGroupHeaders = true,
  collapsible = true,
  
  // Features
  enableSavedFilters = false,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  
  enableQuickFilters = false,
  quickFilters = [],
  
  enableBulkActions = false,
  bulkActions = [],
  
  // Customization
  className,
  onReset,
  resetButtonText = 'Reset',
  submitButtonText = 'Apply',
  
  // RBAC
  permission,
  hideFieldsWithoutPermission = true,
  
  // Advanced
  enableFilterCount = true,
  enableFilterPreview = false,
  enableExport = false,
  maxHeight,
  responsive = true
}) => {
  const { hasPermission } = usePermissionCheck();
  const { user } = useCurrentUser();
  
  // State management
  const [localValues, setLocalValues] = useState<Record<string, any>>(values);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [saveFilterDescription, setSaveFilterDescription] = useState('');
  
  // Permission check
  if (permission && !hasPermission(permission)) {
    return null;
  }
  
  // Filter visible fields based on permissions
  const visibleFields = useMemo(() => {
    return fields.filter(field => {
      if (field.hidden) return false;
      if (field.permission && !hasPermission(field.permission)) {
        return !hideFieldsWithoutPermission;
      }
      return true;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [fields, hasPermission, hideFieldsWithoutPermission]);
  
  // Group fields
  const groupedFields = useMemo(() => {
    const grouped: Record<string, FilterField[]> = {};
    const ungrouped: FilterField[] = [];
    
    visibleFields.forEach(field => {
      if (field.group) {
        if (!grouped[field.group]) {
          grouped[field.group] = [];
        }
        grouped[field.group].push(field);
      } else {
        ungrouped.push(field);
      }
    });
    
    return { grouped, ungrouped };
  }, [visibleFields]);
  
  // Update local values when props change
  useEffect(() => {
    setLocalValues(values);
  }, [values]);
  
  // Handle field value change
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    const newValues = { ...localValues, [fieldId]: value };
    setLocalValues(newValues);
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
    
    // Trigger onChange immediately
    onChange?.(newValues);
  }, [localValues, errors, onChange]);
  
  // Validate fields
  const validateFields = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    visibleFields.forEach(field => {
      const value = localValues[field.id];
      const error = validateFilterValue(value, field);
      if (error) {
        newErrors[field.id] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [visibleFields, localValues]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    const resetValues: Record<string, any> = {};
    visibleFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        resetValues[field.id] = field.defaultValue;
      }
    });
    
    setLocalValues(resetValues);
    setErrors({});
    onChange?.(resetValues);
    onReset?.();
  }, [visibleFields, onChange, onReset]);
  
  // Handle save filter
  const handleSaveFilter = useCallback(() => {
    if (!saveFilterName.trim()) return;
    
    const filterData = {
      name: saveFilterName.trim(),
      description: saveFilterDescription.trim() || undefined,
      filters: localValues,
      isDefault: false,
      isPublic: false,
      createdBy: user?.id || 0,
      tags: []
    };
    
    onSaveFilter?.(filterData);
    setShowSaveDialog(false);
    setSaveFilterName('');
    setSaveFilterDescription('');
  }, [saveFilterName, saveFilterDescription, localValues, user, onSaveFilter]);
  
  // Render field component
  const renderField = useCallback((field: FilterField) => {
    const value = localValues[field.id];
    const error = errors[field.id];
    const fieldOnChange = (newValue: any) => handleFieldChange(field.id, newValue);
    
    let fieldComponent: React.ReactNode;
    
    switch (field.type) {
      case 'text':
      case 'search':
        fieldComponent = (
          <TextFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
        break;
      case 'select':
        fieldComponent = (
          <SelectFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
        break;
      case 'multiselect':
        fieldComponent = (
          <MultiSelectFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
        break;
      case 'range':
        fieldComponent = (
          <RangeFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
        break;
      case 'date':
        fieldComponent = (
          <DateFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
        break;
      case 'daterange':
        fieldComponent = (
          <DateRangeFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
        break;
      case 'boolean':
        fieldComponent = (
          <BooleanFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
        break;
      case 'tags':
        fieldComponent = (
          <TagsFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
        break;
      default:
        fieldComponent = (
          <TextFilter
            field={field}
            value={value}
            onChange={fieldOnChange}
            error={error}
          />
        );
    }
    
    return (
      <FilterFieldWrapper key={field.id} field={field} error={error}>
        {fieldComponent}
      </FilterFieldWrapper>
    );
  }, [localValues, errors, handleFieldChange]);
  
  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(localValues).filter(value => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      return true;
    }).length;
  }, [localValues]);
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Global Search */}
      {enableGlobalSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
      
      {/* Quick Filters */}
      {enableQuickFilters && quickFilters.length > 0 && (
        <QuickFilters
          quickFilters={quickFilters}
          onApply={(filters) => {
            setLocalValues(filters);
            onChange?.(filters);
          }}
        />
      )}
      
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {enableFilterCount && activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {enableSavedFilters && (
            <>
              <SavedFiltersDropdown
                savedFilters={savedFilters}
                onLoad={(filterId) => {
                  const filter = savedFilters.find(f => f.id === filterId);
                  if (filter) {
                    setLocalValues(filter.filters);
                    onChange?.(filter.filters);
                  }
                  onLoadFilter?.(filterId);
                }}
                onDelete={onDeleteFilter!}
                currentUser={user}
              />
              
              <button
                onClick={() => setShowSaveDialog(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
            </>
          )}
          
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {resetButtonText}
          </button>
        </div>
      </div>
      
      {/* Filter Fields */}
      <div
        className={cn(
          'space-y-4',
          layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
          layout === 'horizontal' && 'flex flex-wrap gap-4',
          maxHeight && 'overflow-y-auto',
          'bg-white border border-gray-200 rounded-lg p-4'
        )}
        style={{ maxHeight }}
      >
        {/* Ungrouped fields */}
        {groupedFields.ungrouped.length > 0 && (
          <div className={cn(
            layout === 'grid' ? 'contents' : 'space-y-4'
          )}>
            {groupedFields.ungrouped.map(renderField)}
          </div>
        )}
        
        {/* Grouped fields */}
        {Object.entries(groupedFields.grouped).map(([groupId, groupFields]) => {
          const group = groups.find(g => g.id === groupId);
          const isCollapsed = collapsedGroups.has(groupId);
          
          if (group?.permission && !hasPermission(group.permission)) {
            return null;
          }
          
          return (
            <div key={groupId} className="space-y-3">
              {showGroupHeaders && group && (
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    {group.icon && <span className="mr-2">{group.icon}</span>}
                    {group.label}
                  </h4>
                  {collapsible && (
                    <button
                      onClick={() => {
                        const newCollapsed = new Set(collapsedGroups);
                        if (isCollapsed) {
                          newCollapsed.delete(groupId);
                        } else {
                          newCollapsed.add(groupId);
                        }
                        setCollapsedGroups(newCollapsed);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              )}
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      layout === 'grid' ? 'contents' : 'space-y-4'
                    )}
                  >
                    {groupFields.map(renderField)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Bulk Actions */}
      {enableBulkActions && bulkActions.length > 0 && (
        <div className="flex items-center space-x-2">
          {bulkActions.map((action) => (
            <button
              key={action.id}
              onClick={() => action.onClick(localValues)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Save Filter Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Save Filter</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter filter name"
                    value={saveFilterName}
                    onChange={(e) => setSaveFilterName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Optional description"
                    value={saveFilterDescription}
                    onChange={(e) => setSaveFilterDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFilter}
                  disabled={!saveFilterName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Filter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilters;