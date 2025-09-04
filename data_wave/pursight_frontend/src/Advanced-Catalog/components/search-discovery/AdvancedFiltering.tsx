'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Treemap
} from 'recharts';

import { Filter, Search, Plus, Minus, X, Settings, Sliders, Target, Zap, Brain, Lightbulb, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, MoreVertical, Eye, EyeOff, Copy, Save, Download, Upload, RefreshCw, RotateCcw, Edit, Trash2, BookOpen, Tag, Calendar as CalendarIcon, Clock, Database, FileText, Globe, Hash, Layers, Type, Binary, Percent, DollarSign, BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, Users, Workflow, Network, Cpu, Bot, Sparkles, Star, AlertCircle, CheckCircle, Info, AlertTriangle, Volume2, VolumeX, Play, Pause, FastForward, Rewind, SkipForward, SkipBack, Shuffle, Repeat, ToggleLeft, ToggleRight, Maximize, Minimize, ExternalLink, Share, Bookmark, Heart, ThumbsUp, ThumbsDown, MessageSquare, Mail, Phone, Map, MapPin, Navigation, Compass, Route, GitBranch, Code, Terminal, Command } from 'lucide-react';

// Hook imports
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { semanticSearchService } from '../../services/semantic-search.service';

// Type imports
import {
  SearchFilter,
  FilterOperator,
  FilterType,
  FilterValue,
  ComplexFilter,
  SearchRequest,
  SearchResponse,
  IntelligentDataAsset
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface AdvancedFilteringProps {
  initialFilters?: SearchFilter[];
  onFiltersChange?: (filters: SearchFilter[]) => void;
  onFilterApply?: (filters: SearchFilter[]) => void;
  onFilterSave?: (filterSet: FilterSet) => void;
  onError?: (error: Error) => void;
}

interface FilteringState {
  activeFilters: SearchFilter[];
  filterGroups: FilterGroup[];
  selectedFilterType: FilterType;
  isAdvancedMode: boolean;
  enableAISuggestions: boolean;
  enableSmartValidation: boolean;
  enableFilterOptimization: boolean;
  showFilterPreview: boolean;
  activeTab: string;
  searchMode: 'SIMPLE' | 'ADVANCED' | 'EXPERT';
  filterComplexity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  autoComplete: boolean;
  realTimeFiltering: boolean;
}

interface FilterGroup {
  id: string;
  name: string;
  description: string;
  filters: SearchFilter[];
  operator: 'AND' | 'OR' | 'NOT';
  isNested: boolean;
  parentGroupId?: string;
  color: string;
  isCollapsed: boolean;
  priority: number;
}

interface FilterSet {
  id: string;
  name: string;
  description: string;
  filters: SearchFilter[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  lastUsed: Date;
  usageCount: number;
  tags: string[];
  category: string;
  complexity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

interface FilterTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  filterType: FilterType;
  operator: FilterOperator;
  defaultValue?: FilterValue;
  validation?: FilterValidation;
  suggestions?: string[];
  isPopular: boolean;
  usageCount: number;
}

interface FilterValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  minValue?: number;
  maxValue?: number;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean | string;
}

interface FilterSuggestion {
  id: string;
  type: 'AI_SUGGESTED' | 'POPULAR' | 'RELATED' | 'COMPLETION';
  filter: SearchFilter;
  confidence: number;
  reason: string;
  category: string;
  impact: number;
  examples: string[];
}

interface FilterPerformance {
  filterId: string;
  executionTime: number;
  resultCount: number;
  efficiency: number;
  cacheHitRate: number;
  optimizationSuggestions: string[];
}

interface FilterAnalytics {
  totalFilters: number;
  activeFilters: number;
  avgExecutionTime: number;
  popularFilters: FilterUsage[];
  performanceMetrics: FilterPerformance[];
  errorRate: number;
  userSatisfaction: number;
}

interface FilterUsage {
  filter: SearchFilter;
  usageCount: number;
  avgExecutionTime: number;
  successRate: number;
  lastUsed: Date;
}

interface FilterBuilder {
  currentFilter: Partial<SearchFilter>;
  availableFields: FilterField[];
  availableOperators: FilterOperator[];
  validation: FilterValidation;
  suggestions: FilterSuggestion[];
  isValid: boolean;
  errors: string[];
}

interface FilterField {
  name: string;
  displayName: string;
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
  description: string;
  category: string;
  isIndexed: boolean;
  isSearchable: boolean;
  supportedOperators: FilterOperator[];
  defaultOperator: FilterOperator;
  examples: any[];
  validation?: FilterValidation;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockFilterFields = (): FilterField[] => {
  return [
    {
      name: 'name',
      displayName: 'Asset Name',
      type: 'STRING',
      description: 'Name of the data asset',
      category: 'Basic',
      isIndexed: true,
      isSearchable: true,
      supportedOperators: ['EQUALS', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'REGEX'],
      defaultOperator: 'CONTAINS',
      examples: ['Customer Data', 'Sales Report', 'User Analytics']
    },
    {
      name: 'type',
      displayName: 'Asset Type',
      type: 'STRING',
      description: 'Type of the data asset',
      category: 'Basic',
      isIndexed: true,
      isSearchable: true,
      supportedOperators: ['EQUALS', 'IN', 'NOT_IN'],
      defaultOperator: 'EQUALS',
      examples: ['TABLE', 'VIEW', 'DASHBOARD', 'REPORT']
    },
    {
      name: 'department',
      displayName: 'Department',
      type: 'STRING',
      description: 'Department owning the asset',
      category: 'Organization',
      isIndexed: true,
      isSearchable: true,
      supportedOperators: ['EQUALS', 'IN', 'NOT_IN'],
      defaultOperator: 'EQUALS',
      examples: ['Engineering', 'Marketing', 'Sales', 'Finance']
    },
    {
      name: 'createdAt',
      displayName: 'Created Date',
      type: 'DATE',
      description: 'Date when the asset was created',
      category: 'Temporal',
      isIndexed: true,
      isSearchable: false,
      supportedOperators: ['EQUALS', 'GREATER_THAN', 'LESS_THAN', 'BETWEEN'],
      defaultOperator: 'GREATER_THAN',
      examples: ['2024-01-01', '2023-12-31', '2024-06-15']
    },
    {
      name: 'qualityScore',
      displayName: 'Quality Score',
      type: 'NUMBER',
      description: 'Data quality score (0-100)',
      category: 'Quality',
      isIndexed: true,
      isSearchable: false,
      supportedOperators: ['EQUALS', 'GREATER_THAN', 'LESS_THAN', 'BETWEEN'],
      defaultOperator: 'GREATER_THAN',
      examples: [85, 90, 95],
      validation: { minValue: 0, maxValue: 100 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'ARRAY',
      description: 'Tags associated with the asset',
      category: 'Metadata',
      isIndexed: true,
      isSearchable: true,
      supportedOperators: ['CONTAINS', 'IN', 'NOT_IN', 'ARRAY_CONTAINS'],
      defaultOperator: 'CONTAINS',
      examples: ['customer', 'analytics', 'pii', 'financial']
    },
    {
      name: 'isPublic',
      displayName: 'Is Public',
      type: 'BOOLEAN',
      description: 'Whether the asset is publicly accessible',
      category: 'Access',
      isIndexed: true,
      isSearchable: false,
      supportedOperators: ['EQUALS'],
      defaultOperator: 'EQUALS',
      examples: [true, false]
    }
  ];
};

const generateMockFilterTemplates = (): FilterTemplate[] => {
  return [
    {
      id: 'template_1',
      name: 'High Quality Assets',
      description: 'Filter for assets with quality score above 90',
      category: 'Quality',
      filterType: 'SIMPLE',
      operator: 'GREATER_THAN',
      defaultValue: 90,
      isPopular: true,
      usageCount: 245
    },
    {
      id: 'template_2',
      name: 'Recent Assets',
      description: 'Assets created in the last 30 days',
      category: 'Temporal',
      filterType: 'DATE_RANGE',
      operator: 'GREATER_THAN',
      isPopular: true,
      usageCount: 189
    },
    {
      id: 'template_3',
      name: 'Customer Data',
      description: 'Assets tagged as customer-related',
      category: 'Content',
      filterType: 'SIMPLE',
      operator: 'CONTAINS',
      defaultValue: 'customer',
      isPopular: true,
      usageCount: 156
    },
    {
      id: 'template_4',
      name: 'Public Dashboards',
      description: 'Public dashboard assets',
      category: 'Access',
      filterType: 'SIMPLE',
      operator: 'EQUALS',
      isPopular: false,
      usageCount: 89
    }
  ];
};

const generateMockFilterSuggestions = (): FilterSuggestion[] => {
  return [
    {
      id: 'suggestion_1',
      type: 'AI_SUGGESTED',
      filter: {
        id: 'ai_filter_1',
        field: 'department',
        operator: 'EQUALS',
        value: 'Engineering',
        type: 'SIMPLE'
      },
      confidence: 85,
      reason: 'Based on your previous searches, you often filter by Engineering department',
      category: 'Behavioral',
      impact: 75,
      examples: ['Engineering Tables', 'Dev Dashboards', 'Tech Reports']
    },
    {
      id: 'suggestion_2',
      type: 'POPULAR',
      filter: {
        id: 'popular_filter_1',
        field: 'qualityScore',
        operator: 'GREATER_THAN',
        value: 85,
        type: 'SIMPLE'
      },
      confidence: 92,
      reason: 'Most users filter for high-quality assets',
      category: 'Popular',
      impact: 88,
      examples: ['High Quality Tables', 'Validated Reports', 'Clean Datasets']
    },
    {
      id: 'suggestion_3',
      type: 'RELATED',
      filter: {
        id: 'related_filter_1',
        field: 'tags',
        operator: 'CONTAINS',
        value: 'analytics',
        type: 'SIMPLE'
      },
      confidence: 78,
      reason: 'Related to your current search context',
      category: 'Contextual',
      impact: 65,
      examples: ['Analytics Dashboards', 'Business Intelligence', 'Data Analysis']
    }
  ];
};

const generateMockFilterSets = (): FilterSet[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `filterset_${i + 1}`,
    name: `Filter Set ${i + 1}`,
    description: `Predefined filter configuration for common use case ${i + 1}`,
    filters: [
      {
        id: `filter_${i + 1}_1`,
        field: 'type',
        operator: 'EQUALS',
        value: ['TABLE', 'VIEW', 'DASHBOARD'][i % 3],
        type: 'SIMPLE'
      }
    ],
    isPublic: i % 2 === 0,
    createdBy: `user_${(i % 5) + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    usageCount: Math.floor(Math.random() * 100) + 10,
    tags: [`tag_${i + 1}`, `category_${(i % 3) + 1}`],
    category: ['Quality', 'Content', 'Access', 'Temporal'][i % 4],
    complexity: (['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const)[i % 4]
  }));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdvancedFiltering: React.FC<AdvancedFilteringProps> = ({
  initialFilters = [],
  onFiltersChange,
  onFilterApply,
  onFilterSave,
  onError
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const discoveryHook = useCatalogDiscovery({
    enableRealTimeUpdates: true,
    autoRefreshInterval: 30000
  });

  // Local State
  const [state, setState] = useState<FilteringState>({
    activeFilters: initialFilters,
    filterGroups: [],
    selectedFilterType: 'SIMPLE',
    isAdvancedMode: false,
    enableAISuggestions: true,
    enableSmartValidation: true,
    enableFilterOptimization: true,
    showFilterPreview: true,
    activeTab: 'builder',
    searchMode: 'ADVANCED',
    filterComplexity: 'INTERMEDIATE',
    autoComplete: true,
    realTimeFiltering: false
  });

  const [filterBuilder, setFilterBuilder] = useState<FilterBuilder>({
    currentFilter: {},
    availableFields: [],
    availableOperators: [],
    validation: { required: false },
    suggestions: [],
    isValid: false,
    errors: []
  });

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isFilterSetDialogOpen, setIsFilterSetDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FilterTemplate | null>(null);
  const [selectedFilterSet, setSelectedFilterSet] = useState<FilterSet | null>(null);

  // Mock data (in production, this would come from the hooks)
  const [mockFields] = useState(() => generateMockFilterFields());
  const [mockTemplates] = useState(() => generateMockFilterTemplates());
  const [mockSuggestions] = useState(() => generateMockFilterSuggestions());
  const [mockFilterSets] = useState(() => generateMockFilterSets());

  const draggedFilter = useRef<SearchFilter | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const availableOperators = useMemo(() => {
    if (!filterBuilder.currentFilter.field) return [];
    const field = mockFields.find(f => f.name === filterBuilder.currentFilter.field);
    return field?.supportedOperators || [];
  }, [filterBuilder.currentFilter.field, mockFields]);

  const filterValidation = useMemo(() => {
    const field = mockFields.find(f => f.name === filterBuilder.currentFilter.field);
    return field?.validation || { required: false };
  }, [filterBuilder.currentFilter.field, mockFields]);

  const isFilterValid = useMemo(() => {
    const { field, operator, value } = filterBuilder.currentFilter;
    if (!field || !operator) return false;
    
    if (filterValidation.required && (!value || value === '')) return false;
    
    if (filterValidation.minValue !== undefined && typeof value === 'number' && value < filterValidation.minValue) {
      return false;
    }
    
    if (filterValidation.maxValue !== undefined && typeof value === 'number' && value > filterValidation.maxValue) {
      return false;
    }
    
    return true;
  }, [filterBuilder.currentFilter, filterValidation]);

  const filterPreviewResults = useMemo(() => {
    if (!state.showFilterPreview || state.activeFilters.length === 0) return null;
    
    // Simulate filter preview results
    return {
      totalResults: Math.floor(Math.random() * 1000) + 100,
      estimatedTime: Math.random() * 2 + 0.1,
      qualityScore: Math.random() * 30 + 70,
      topCategories: ['Tables', 'Views', 'Dashboards'].map(cat => ({
        name: cat,
        count: Math.floor(Math.random() * 200) + 10
      }))
    };
  }, [state.activeFilters, state.showFilterPreview]);

  const filteredSuggestions = useMemo(() => {
    return mockSuggestions.filter(suggestion => {
      if (!state.enableAISuggestions) return false;
      return suggestion.confidence > 70;
    });
  }, [mockSuggestions, state.enableAISuggestions]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAddFilter = useCallback(() => {
    if (!isFilterValid) return;
    
    const newFilter: SearchFilter = {
      id: `filter_${Date.now()}`,
      field: filterBuilder.currentFilter.field!,
      operator: filterBuilder.currentFilter.operator!,
      value: filterBuilder.currentFilter.value!,
      type: state.selectedFilterType
    };
    
    const updatedFilters = [...state.activeFilters, newFilter];
    setState(prev => ({ ...prev, activeFilters: updatedFilters }));
    setFilterBuilder(prev => ({ ...prev, currentFilter: {}, isValid: false }));
    
    onFiltersChange?.(updatedFilters);
  }, [filterBuilder.currentFilter, state.selectedFilterType, state.activeFilters, isFilterValid, onFiltersChange]);

  const handleRemoveFilter = useCallback((filterId: string) => {
    const updatedFilters = state.activeFilters.filter(f => f.id !== filterId);
    setState(prev => ({ ...prev, activeFilters: updatedFilters }));
    onFiltersChange?.(updatedFilters);
  }, [state.activeFilters, onFiltersChange]);

  const handleUpdateFilter = useCallback((filterId: string, updates: Partial<SearchFilter>) => {
    const updatedFilters = state.activeFilters.map(filter =>
      filter.id === filterId ? { ...filter, ...updates } : filter
    );
    setState(prev => ({ ...prev, activeFilters: updatedFilters }));
    onFiltersChange?.(updatedFilters);
  }, [state.activeFilters, onFiltersChange]);

  const handleApplyFilters = useCallback(() => {
    onFilterApply?.(state.activeFilters);
  }, [state.activeFilters, onFilterApply]);

  const handleClearFilters = useCallback(() => {
    setState(prev => ({ ...prev, activeFilters: [] }));
    onFiltersChange?.([]);
  }, [onFiltersChange]);

  const handleApplyTemplate = useCallback((template: FilterTemplate) => {
    const newFilter: SearchFilter = {
      id: `template_filter_${Date.now()}`,
      field: template.name.toLowerCase().replace(/\s+/g, '_'),
      operator: template.operator,
      value: template.defaultValue || '',
      type: template.filterType
    };
    
    const updatedFilters = [...state.activeFilters, newFilter];
    setState(prev => ({ ...prev, activeFilters: updatedFilters }));
    setIsTemplateDialogOpen(false);
    onFiltersChange?.(updatedFilters);
  }, [state.activeFilters, onFiltersChange]);

  const handleApplyFilterSet = useCallback((filterSet: FilterSet) => {
    setState(prev => ({ ...prev, activeFilters: filterSet.filters }));
    setIsFilterSetDialogOpen(false);
    onFiltersChange?.(filterSet.filters);
  }, [onFiltersChange]);

  const handleSaveFilterSet = useCallback((name: string, description: string, isPublic: boolean) => {
    const newFilterSet: FilterSet = {
      id: `filterset_${Date.now()}`,
      name,
      description,
      filters: state.activeFilters,
      isPublic,
      createdBy: 'current_user',
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      tags: [],
      category: 'Custom',
      complexity: state.filterComplexity
    };
    
    onFilterSave?.(newFilterSet);
    setIsSaveDialogOpen(false);
  }, [state.activeFilters, state.filterComplexity, onFilterSave]);

  const handleApplySuggestion = useCallback((suggestion: FilterSuggestion) => {
    const updatedFilters = [...state.activeFilters, suggestion.filter];
    setState(prev => ({ ...prev, activeFilters: updatedFilters }));
    onFiltersChange?.(updatedFilters);
  }, [state.activeFilters, onFiltersChange]);

  const handleStateChange = useCallback((updates: Partial<FilteringState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFilterBuilder = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Filter Builder</span>
        </CardTitle>
        <CardDescription>
          Create advanced filters with intelligent suggestions and validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Field</Label>
            <Select
              value={filterBuilder.currentFilter.field || ''}
              onValueChange={(value) => setFilterBuilder(prev => ({ 
                ...prev, 
                currentFilter: { ...prev.currentFilter, field: value, operator: undefined, value: undefined }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {mockFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{field.type}</Badge>
                      <span>{field.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Operator</Label>
            <Select
              value={filterBuilder.currentFilter.operator || ''}
              onValueChange={(value: FilterOperator) => setFilterBuilder(prev => ({ 
                ...prev, 
                currentFilter: { ...prev.currentFilter, operator: value }
              }))}
              disabled={!filterBuilder.currentFilter.field}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {availableOperators.map((operator) => (
                  <SelectItem key={operator} value={operator}>
                    {operator.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Value</Label>
            {renderValueInput()}
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleAddFilter}
              disabled={!isFilterValid}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
        </div>

        {filterBuilder.currentFilter.field && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Field Information</span>
            </div>
            {(() => {
              const field = mockFields.find(f => f.name === filterBuilder.currentFilter.field);
              return field ? (
                <div className="text-sm text-blue-600">
                  <p><strong>Description:</strong> {field.description}</p>
                  <p><strong>Type:</strong> {field.type}</p>
                  <p><strong>Examples:</strong> {field.examples.join(', ')}</p>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {state.enableAISuggestions && filteredSuggestions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Suggestions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSuggestions.slice(0, 4).map((suggestion) => (
                <div key={suggestion.id} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                     onClick={() => handleApplySuggestion(suggestion)}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={
                      suggestion.type === 'AI_SUGGESTED' ? 'default' :
                      suggestion.type === 'POPULAR' ? 'secondary' :
                      'outline'
                    } className="text-xs">
                      {suggestion.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">{Math.round(suggestion.confidence)}% confidence</span>
                  </div>
                  <p className="text-sm font-medium">
                    {suggestion.filter.field} {suggestion.filter.operator} {suggestion.filter.value}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{suggestion.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderValueInput = () => {
    const field = mockFields.find(f => f.name === filterBuilder.currentFilter.field);
    if (!field) return <Input placeholder="Select field first" disabled />;

    switch (field.type) {
      case 'STRING':
        return (
          <Input
            value={filterBuilder.currentFilter.value as string || ''}
            onChange={(e) => setFilterBuilder(prev => ({ 
              ...prev, 
              currentFilter: { ...prev.currentFilter, value: e.target.value }
            }))}
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
          />
        );
      
      case 'NUMBER':
        return (
          <Input
            type="number"
            value={filterBuilder.currentFilter.value as number || ''}
            onChange={(e) => setFilterBuilder(prev => ({ 
              ...prev, 
              currentFilter: { ...prev.currentFilter, value: parseFloat(e.target.value) || 0 }
            }))}
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
            min={field.validation?.minValue}
            max={field.validation?.maxValue}
          />
        );
      
      case 'BOOLEAN':
        return (
          <Select
            value={filterBuilder.currentFilter.value?.toString() || ''}
            onValueChange={(value) => setFilterBuilder(prev => ({ 
              ...prev, 
              currentFilter: { ...prev.currentFilter, value: value === 'true' }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'DATE':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterBuilder.currentFilter.value ? 
                  new Date(filterBuilder.currentFilter.value as string).toLocaleDateString() : 
                  'Select date'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filterBuilder.currentFilter.value ? new Date(filterBuilder.currentFilter.value as string) : undefined}
                onSelect={(date) => setFilterBuilder(prev => ({ 
                  ...prev, 
                  currentFilter: { ...prev.currentFilter, value: date?.toISOString() }
                }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      
      case 'ARRAY':
        return (
          <Input
            value={Array.isArray(filterBuilder.currentFilter.value) ? 
              (filterBuilder.currentFilter.value as string[]).join(', ') : 
              filterBuilder.currentFilter.value as string || ''
            }
            onChange={(e) => setFilterBuilder(prev => ({ 
              ...prev, 
              currentFilter: { 
                ...prev.currentFilter, 
                value: e.target.value.split(',').map(v => v.trim()).filter(v => v)
              }
            }))}
            placeholder="Enter values separated by commas"
          />
        );
      
      default:
        return <Input placeholder="Enter value" />;
    }
  };

  const renderActiveFilters = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Active Filters ({state.activeFilters.length})</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {state.activeFilters.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button size="sm" onClick={handleApplyFilters} disabled={state.activeFilters.length === 0}>
              <Target className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {state.activeFilters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No active filters</p>
            <p className="text-sm">Add filters using the builder above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.activeFilters.map((filter, index) => (
              <div key={filter.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs">{filter.type}</Badge>
                    <span className="font-medium">{filter.field}</span>
                    <span className="text-gray-500">{filter.operator.replace(/_/g, ' ')}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value.toString()}
                    </Badge>
                  </div>
                  {index < state.activeFilters.length - 1 && (
                    <div className="text-xs text-gray-400">AND</div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => {}}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFilter(filter.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filterPreviewResults && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Filter Preview
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Results</p>
                <p className="font-semibold">{filterPreviewResults.totalResults.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Est. Time</p>
                <p className="font-semibold">{filterPreviewResults.estimatedTime.toFixed(2)}s</p>
              </div>
              <div>
                <p className="text-gray-600">Quality Score</p>
                <p className="font-semibold">{Math.round(filterPreviewResults.qualityScore)}%</p>
              </div>
              <div>
                <p className="text-gray-600">Categories</p>
                <p className="font-semibold">{filterPreviewResults.topCategories.length}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filter Templates</h3>
        <Button onClick={() => setIsTemplateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {template.isPopular && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">{template.category}</Badge>
                </div>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Type:</span> {template.filterType}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Operator:</span> {template.operator.replace(/_/g, ' ')}
                </div>
                {template.defaultValue && (
                  <div className="text-sm">
                    <span className="font-medium">Default Value:</span> {template.defaultValue.toString()}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Used {template.usageCount} times
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleApplyTemplate(template)}
                >
                  Apply Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSavedFiltersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Saved Filter Sets</h3>
        <Button onClick={() => setIsSaveDialogOpen(true)} disabled={state.activeFilters.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Save Current Filters
        </Button>
      </div>

      <div className="space-y-4">
        {mockFilterSets.map((filterSet) => (
          <Card key={filterSet.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <CardTitle className="text-lg">{filterSet.name}</CardTitle>
                    <CardDescription>{filterSet.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={filterSet.isPublic ? 'default' : 'secondary'} className="text-xs">
                      {filterSet.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{filterSet.complexity}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Used {filterSet.usageCount} times
                  </div>
                  <div className="text-xs text-gray-400">
                    Last used: {filterSet.lastUsed.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Filters ({filterSet.filters.length})</h4>
                  <div className="space-y-1">
                    {filterSet.filters.slice(0, 3).map((filter, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {filter.field} {filter.operator.replace(/_/g, ' ')} {filter.value}
                      </div>
                    ))}
                    {filterSet.filters.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{filterSet.filters.length - 3} more filters
                      </div>
                    )}
                  </div>
                </div>

                {filterSet.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {filterSet.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleApplyFilterSet(filterSet)}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Filters</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.activeFilters.length}</div>
            <p className="text-xs text-muted-foreground">Active filters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTemplates.length}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Sets</CardTitle>
            <Save className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockFilterSets.length}</div>
            <p className="text-xs text-muted-foreground">Saved filter sets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">Available suggestions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockTemplates.map(t => ({ name: t.name, usage: t.usageCount }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Area type="monotone" dataKey="usage" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filter Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filter Type</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Avg Execution Time</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTemplates.slice(0, 5).map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.usageCount}</TableCell>
                  <TableCell>{(Math.random() * 2 + 0.1).toFixed(2)}s</TableCell>
                  <TableCell>{Math.round(90 + Math.random() * 10)}%</TableCell>
                  <TableCell>
                    <Progress value={70 + Math.random() * 30} className="w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Filtering</h1>
            <p className="text-gray-600 mt-1">Powerful search filtering with AI-powered suggestions and complex logic</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" onClick={() => setIsFilterSetDialogOpen(true)}>
              <Save className="h-4 w-4 mr-2" />
              Saved Filters
            </Button>
            <Button onClick={() => setIsSaveDialogOpen(true)} disabled={state.activeFilters.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Save Current
            </Button>
          </div>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Search Mode</Label>
                  <Select value={state.searchMode} onValueChange={(value: any) => handleStateChange({ searchMode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIMPLE">Simple</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Filter Complexity</Label>
                  <Select value={state.filterComplexity} onValueChange={(value: any) => handleStateChange({ filterComplexity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ai-suggestions"
                    checked={state.enableAISuggestions}
                    onCheckedChange={(checked) => handleStateChange({ enableAISuggestions: checked })}
                  />
                  <Label htmlFor="ai-suggestions">AI Suggestions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smart-validation"
                    checked={state.enableSmartValidation}
                    onCheckedChange={(checked) => handleStateChange({ enableSmartValidation: checked })}
                  />
                  <Label htmlFor="smart-validation">Smart Validation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="filter-optimization"
                    checked={state.enableFilterOptimization}
                    onCheckedChange={(checked) => handleStateChange({ enableFilterOptimization: checked })}
                  />
                  <Label htmlFor="filter-optimization">Filter Optimization</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="filter-preview"
                    checked={state.showFilterPreview}
                    onCheckedChange={(checked) => handleStateChange({ showFilterPreview: checked })}
                  />
                  <Label htmlFor="filter-preview">Filter Preview</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-complete"
                    checked={state.autoComplete}
                    onCheckedChange={(checked) => handleStateChange({ autoComplete: checked })}
                  />
                  <Label htmlFor="auto-complete">Auto Complete</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="real-time-filtering"
                    checked={state.realTimeFiltering}
                    onCheckedChange={(checked) => handleStateChange({ realTimeFiltering: checked })}
                  />
                  <Label htmlFor="real-time-filtering">Real-time Filtering</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Builder */}
        {renderFilterBuilder()}

        {/* Active Filters */}
        {renderActiveFilters()}

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="saved">Saved Filters</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Use the filter builder above to create and manage filters</p>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            {renderTemplatesTab()}
          </TabsContent>

          <TabsContent value="saved">
            {renderSavedFiltersTab()}
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalyticsTab()}
          </TabsContent>
        </Tabs>

        {/* Save Filter Set Dialog */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save Filter Set</DialogTitle>
              <DialogDescription>
                Save your current filters as a reusable set
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input placeholder="Enter filter set name" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe this filter set" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="public-filter-set" />
                <Label htmlFor="public-filter-set">Make this filter set public</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSaveFilterSet('New Filter Set', 'Description', false)}>
                Save Filter Set
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AdvancedFiltering;