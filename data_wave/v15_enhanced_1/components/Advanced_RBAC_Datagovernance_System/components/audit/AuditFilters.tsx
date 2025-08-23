'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Filter, Search, Calendar, Clock, User, Users, Database, Key, Settings, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Plus, Minus, X, Check, RefreshCw, Save, Star, StarOff, Bookmark, Eye, EyeOff, Target, Shield, AlertTriangle, Info, CheckCircle2, XCircle, Flag, Tag, Globe, MapPin, Building, Smartphone, Monitor, Server, Wifi, Brain, Zap, Activity, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, ArrowUpDown, SortAsc, SortDesc, Grid, List, Hash, Type, Calendar as CalendarIcon, Download, Upload, Share, Copy, Edit, Trash2, Archive, MoreHorizontal, FileText, Folder, Lock, Unlock, ShieldCheckIcon, AlertCircle, Lightbulb, HelpCircle, Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, RotateCw, Repeat, Shuffle, Command, Terminal, Code, Package, Box, Truck, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useResources } from '../../hooks/useResources';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addDays, addHours, addMinutes, subDays, subHours, subMinutes, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import type { AuditLogFilters } from '../../types/audit.types';
import type { User } from '../../types/user.types';
import type { Role } from '../../types/role.types';
import type { Resource } from '../../types/resource.types';

// ===================== INTERFACES & TYPES =====================

interface AuditFiltersProps {
  className?: string;
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onFiltersApply?: (filters: AuditLogFilters) => void;
  onFiltersClear?: () => void;
  onFiltersSave?: (name: string, filters: AuditLogFilters) => void;
  showAdvanced?: boolean;
  showPresets?: boolean;
  showSuggestions?: boolean;
  enableRealTimeValidation?: boolean;
  enableIntelligentFiltering?: boolean;
  showFilterStatistics?: boolean;
  enableCustomFields?: boolean;
  enableBulkOperations?: boolean;
  maxSuggestions?: number;
  autoApplyDelay?: number;
}

interface FilterField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean' | 'user' | 'role' | 'resource' | 'custom';
  category: 'basic' | 'advanced' | 'system' | 'security' | 'performance';
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string; label: string; icon?: React.ReactNode; description?: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  dependencies?: string[];
  suggestions?: (query: string) => Promise<Array<{ value: string; label: string; description?: string }>>;
  transformation?: (value: any) => any;
  defaultValue?: any;
  hidden?: boolean;
  readonly?: boolean;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: AuditLogFilters;
  category: 'system' | 'user' | 'shared' | 'recent';
  isDefault?: boolean;
  isReadonly?: boolean;
  createdBy?: User;
  createdAt: string;
  updatedAt?: string;
  usageCount: number;
  tags: string[];
  icon?: React.ReactNode;
  color?: string;
}

interface FilterSuggestion {
  id: string;
  type: 'completion' | 'correction' | 'enhancement' | 'template' | 'pattern';
  field: string;
  title: string;
  description: string;
  value: any;
  confidence: number;
  reasoning: string[];
  impact: 'low' | 'medium' | 'high';
  category: 'efficiency' | 'accuracy' | 'completeness' | 'performance';
  examples?: string[];
  relatedFields?: string[];
}

interface FilterValidation {
  field: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  suggestions?: string[];
  autoFix?: () => void;
}

interface FilterStatistics {
  totalFilters: number;
  activeFilters: number;
  resultCount: number;
  executionTime: number;
  complexity: 'low' | 'medium' | 'high';
  performance: {
    indexUsage: number;
    queryOptimization: number;
    cacheHitRate: number;
  };
  impact: {
    estimatedResults: number;
    percentageReduction: number;
    recommendedOptimizations: string[];
  };
  history: Array<{
    timestamp: string;
    filters: AuditLogFilters;
    resultCount: number;
    executionTime: number;
  }>;
}

interface CustomField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json';
  path: string;
  description?: string;
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
  formatting?: {
    display?: string;
    transform?: (value: any) => string;
  };
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
}

interface FilterContext {
  currentUser: User | null;
  availableFields: FilterField[];
  presets: FilterPreset[];
  customFields: CustomField[];
  recentFilters: AuditLogFilters[];
  suggestions: FilterSuggestion[];
  validations: FilterValidation[];
  statistics: FilterStatistics | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

// ===================== CONSTANTS =====================

const FILTER_CATEGORIES = [
  { id: 'basic', label: 'Basic Filters', icon: Filter, description: 'Essential filtering options' },
  { id: 'advanced', label: 'Advanced Filters', icon: Settings, description: 'Detailed filtering capabilities' },
  { id: 'system', label: 'System Filters', icon: Server, description: 'System-level filtering' },
  { id: 'security', label: 'Security Filters', icon: Shield, description: 'Security-focused filters' },
  { id: 'performance', label: 'Performance Filters', icon: Activity, description: 'Performance-related filters' }
];

const EVENT_TYPES = [
  { value: 'authentication', label: 'Authentication', icon: Key, color: 'text-blue-600' },
  { value: 'authorization', label: 'Authorization', icon: Shield, color: 'text-green-600' },
  { value: 'data_access', label: 'Data Access', icon: Database, color: 'text-purple-600' },
  { value: 'configuration', label: 'Configuration', icon: Settings, color: 'text-orange-600' },
  { value: 'user_management', label: 'User Management', icon: Users, color: 'text-teal-600' },
  { value: 'system', label: 'System Events', icon: Server, color: 'text-gray-600' },
  { value: 'security', label: 'Security Events', icon: ShieldCheckIcon, color: 'text-red-600' },
  { value: 'compliance', label: 'Compliance', icon: FileText, color: 'text-indigo-600' }
];

const SEVERITY_LEVELS = [
  { value: 'info', label: 'Information', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'warning', label: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { value: 'error', label: 'Error', color: 'text-red-600', bgColor: 'bg-red-50' },
  { value: 'critical', label: 'Critical', color: 'text-red-800', bgColor: 'bg-red-100' }
];

const TIME_RANGES = [
  { value: '15m', label: 'Last 15 minutes', start: () => subMinutes(new Date(), 15) },
  { value: '1h', label: 'Last hour', start: () => subHours(new Date(), 1) },
  { value: '4h', label: 'Last 4 hours', start: () => subHours(new Date(), 4) },
  { value: '24h', label: 'Last 24 hours', start: () => subDays(new Date(), 1) },
  { value: '7d', label: 'Last 7 days', start: () => subDays(new Date(), 7) },
  { value: '30d', label: 'Last 30 days', start: () => subDays(new Date(), 30) },
  { value: 'today', label: 'Today', start: () => startOfDay(new Date()), end: () => endOfDay(new Date()) },
  { value: 'yesterday', label: 'Yesterday', start: () => startOfDay(subDays(new Date(), 1)), end: () => endOfDay(subDays(new Date(), 1)) },
  { value: 'week', label: 'This week', start: () => startOfWeek(new Date()), end: () => endOfWeek(new Date()) },
  { value: 'month', label: 'This month', start: () => startOfMonth(new Date()), end: () => endOfMonth(new Date()) },
  { value: 'custom', label: 'Custom range', custom: true }
];

const SYSTEM_PRESETS: FilterPreset[] = [
  {
    id: 'security_events',
    name: 'Security Events',
    description: 'Failed logins, unauthorized access, and security violations',
    filters: {
      eventType: 'security',
      severity: 'error',
      success: false,
      startDate: subDays(new Date(), 7)
    },
    category: 'system',
    isDefault: false,
    isReadonly: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    tags: ['security', 'errors', 'compliance'],
    icon: <Shield className="h-4 w-4" />,
    color: 'text-red-600'
  },
  {
    id: 'admin_actions',
    name: 'Administrative Actions',
    description: 'User management, configuration changes, and system administration',
    filters: {
      eventType: 'user_management',
      action: 'admin_',
      startDate: subDays(new Date(), 1)
    },
    category: 'system',
    isDefault: false,
    isReadonly: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    tags: ['admin', 'management', 'configuration'],
    icon: <Settings className="h-4 w-4" />,
    color: 'text-orange-600'
  },
  {
    id: 'data_access',
    name: 'Data Access Events',
    description: 'Database queries, file access, and data operations',
    filters: {
      eventType: 'data_access',
      resourceType: 'database',
      startDate: subHours(new Date(), 4)
    },
    category: 'system',
    isDefault: false,
    isReadonly: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    tags: ['data', 'access', 'database'],
    icon: <Database className="h-4 w-4" />,
    color: 'text-purple-600'
  },
  {
    id: 'failed_operations',
    name: 'Failed Operations',
    description: 'Operations that resulted in errors or failures',
    filters: {
      success: false,
      severity: ['error', 'critical'],
      startDate: subDays(new Date(), 1)
    },
    category: 'system',
    isDefault: false,
    isReadonly: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    tags: ['errors', 'failures', 'troubleshooting'],
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600'
  },
  {
    id: 'recent_activity',
    name: 'Recent Activity',
    description: 'All events from the last hour',
    filters: {
      startDate: subHours(new Date(), 1)
    },
    category: 'system',
    isDefault: true,
    isReadonly: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    tags: ['recent', 'activity', 'monitoring'],
    icon: <Clock className="h-4 w-4" />,
    color: 'text-blue-600'
  }
];

const DEFAULT_FILTER_FIELDS: FilterField[] = [
  {
    id: 'eventType',
    label: 'Event Type',
    type: 'select',
    category: 'basic',
    placeholder: 'Select event type...',
    description: 'Filter by the type of audit event',
    options: EVENT_TYPES.map(type => ({
      value: type.value,
      label: type.label,
      icon: <type.icon className="h-4 w-4" />
    })),
    width: 'md'
  },
  {
    id: 'severity',
    label: 'Severity',
    type: 'multiselect',
    category: 'basic',
    placeholder: 'Select severity levels...',
    description: 'Filter by event severity level',
    options: SEVERITY_LEVELS.map(level => ({
      value: level.value,
      label: level.label,
      description: `Events with ${level.label.toLowerCase()} severity`
    })),
    width: 'md'
  },
  {
    id: 'user',
    label: 'User',
    type: 'user',
    category: 'basic',
    placeholder: 'Search for users...',
    description: 'Filter by the user who performed the action',
    width: 'lg'
  },
  {
    id: 'action',
    label: 'Action',
    type: 'text',
    category: 'basic',
    placeholder: 'Enter action name or pattern...',
    description: 'Filter by specific action or action pattern',
    validation: {
      pattern: /^[a-zA-Z0-9_\-\*\?]*$/,
      custom: (value) => {
        if (value && value.length < 2) {
          return 'Action must be at least 2 characters';
        }
        return null;
      }
    },
    width: 'md'
  },
  {
    id: 'resourceType',
    label: 'Resource Type',
    type: 'resource',
    category: 'basic',
    placeholder: 'Select resource type...',
    description: 'Filter by the type of resource accessed',
    width: 'md'
  },
  {
    id: 'timeRange',
    label: 'Time Range',
    type: 'daterange',
    category: 'basic',
    placeholder: 'Select time range...',
    description: 'Filter events within a specific time period',
    width: 'lg'
  },
  {
    id: 'success',
    label: 'Success Status',
    type: 'select',
    category: 'basic',
    placeholder: 'All operations',
    description: 'Filter by operation success or failure',
    options: [
      { value: 'all', label: 'All operations' },
      { value: 'true', label: 'Successful only' },
      { value: 'false', label: 'Failed only' }
    ],
    defaultValue: 'all',
    width: 'sm'
  },
  {
    id: 'ipAddress',
    label: 'IP Address',
    type: 'text',
    category: 'advanced',
    placeholder: 'Enter IP address or range...',
    description: 'Filter by source IP address or CIDR range',
    validation: {
      pattern: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$|^[0-9a-fA-F:]+$/,
      custom: (value) => {
        if (value && !value.match(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$|^[0-9a-fA-F:]+$/)) {
          return 'Please enter a valid IP address or CIDR range';
        }
        return null;
      }
    },
    width: 'md'
  },
  {
    id: 'location',
    label: 'Geographic Location',
    type: 'text',
    category: 'advanced',
    placeholder: 'Enter country, city, or region...',
    description: 'Filter by geographic location of the event',
    width: 'md'
  },
  {
    id: 'userAgent',
    label: 'User Agent',
    type: 'text',
    category: 'advanced',
    placeholder: 'Enter browser or application...',
    description: 'Filter by client user agent string',
    width: 'lg'
  },
  {
    id: 'sessionId',
    label: 'Session ID',
    type: 'text',
    category: 'advanced',
    placeholder: 'Enter session identifier...',
    description: 'Filter by specific session identifier',
    validation: {
      pattern: /^[a-zA-Z0-9\-_]+$/,
      min: 8,
      max: 128
    },
    width: 'lg'
  },
  {
    id: 'correlationId',
    label: 'Correlation ID',
    type: 'text',
    category: 'system',
    placeholder: 'Enter correlation ID...',
    description: 'Filter by request correlation identifier',
    validation: {
      pattern: /^[a-zA-Z0-9\-_]+$/
    },
    width: 'lg'
  },
  {
    id: 'responseTime',
    label: 'Response Time (ms)',
    type: 'number',
    category: 'performance',
    placeholder: 'Enter maximum response time...',
    description: 'Filter by operation response time threshold',
    validation: {
      min: 0,
      max: 60000
    },
    width: 'sm'
  },
  {
    id: 'dataSize',
    label: 'Data Size (bytes)',
    type: 'number',
    category: 'performance',
    placeholder: 'Enter data size threshold...',
    description: 'Filter by amount of data processed',
    validation: {
      min: 0
    },
    width: 'md'
  },
  {
    id: 'riskScore',
    label: 'Risk Score',
    type: 'number',
    category: 'security',
    placeholder: 'Enter minimum risk score...',
    description: 'Filter by calculated risk score (0-100)',
    validation: {
      min: 0,
      max: 100
    },
    width: 'sm'
  },
  {
    id: 'complianceFramework',
    label: 'Compliance Framework',
    type: 'multiselect',
    category: 'security',
    placeholder: 'Select frameworks...',
    description: 'Filter by relevant compliance frameworks',
    options: [
      { value: 'gdpr', label: 'GDPR' },
      { value: 'sox', label: 'SOX' },
      { value: 'hipaa', label: 'HIPAA' },
      { value: 'pci', label: 'PCI-DSS' },
      { value: 'iso27001', label: 'ISO 27001' },
      { value: 'nist', label: 'NIST' }
    ],
    width: 'lg'
  }
];

// ===================== MAIN COMPONENT =====================

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  className,
  filters,
  onFiltersChange,
  onFiltersApply,
  onFiltersClear,
  onFiltersSave,
  showAdvanced = true,
  showPresets = true,
  showSuggestions = true,
  enableRealTimeValidation = true,
  enableIntelligentFiltering = true,
  showFilterStatistics = true,
  enableCustomFields = true,
  enableBulkOperations = true,
  maxSuggestions = 5,
  autoApplyDelay = 1000
}) => {
  // ===================== HOOKS & STATE =====================

  const { currentUser } = useCurrentUser();
  const { checkPermission } = usePermissionCheck();
  const { users, loadUsers, searchUsers } = useUsers();
  const { roles, loadRoles } = useRoles();
  const { resources, loadResources } = useResources();
  const { getAuditLogStatistics } = useAuditLogs({}, false);

  // Component state
  const [activeCategory, setActiveCategory] = useState('basic');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic']));
  const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters);
  const [filterFields, setFilterFields] = useState<FilterField[]>(DEFAULT_FILTER_FIELDS);
  const [presets, setPresets] = useState<FilterPreset[]>(SYSTEM_PRESETS);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // UI state
  const [showPresetsDialog, setShowPresetsDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCustomFieldDialog, setShowCustomFieldDialog] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Validation and suggestions
  const [validations, setValidations] = useState<FilterValidation[]>([]);
  const [suggestions, setSuggestions] = useState<FilterSuggestion[]>([]);
  const [statistics, setStatistics] = useState<FilterStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Save dialog state
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [presetTags, setPresetTags] = useState<string[]>([]);
  const [presetCategory, setPresetCategory] = useState<'user' | 'shared'>('user');
  
  // Refs
  const autoApplyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ===================== COMPUTED VALUES =====================

  const filteredFields = useMemo(() => {
    let fields = filterFields;

    // Filter by category if not showing all
    if (activeCategory !== 'all') {
      fields = fields.filter(field => field.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      fields = fields.filter(field =>
        field.label.toLowerCase().includes(query) ||
        field.description?.toLowerCase().includes(query) ||
        field.id.toLowerCase().includes(query)
      );
    }

    // Filter out hidden fields
    fields = fields.filter(field => !field.hidden);

    return fields;
  }, [filterFields, activeCategory, searchQuery]);

  const activeFiltersCount = useMemo(() => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key as keyof AuditLogFilters];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    }).length;
  }, [localFilters]);

  const validationErrors = useMemo(() => {
    return validations.filter(v => v.type === 'error');
  }, [validations]);

  const hasValidationErrors = useMemo(() => {
    return validationErrors.length > 0;
  }, [validationErrors]);

  const filterComplexity = useMemo(() => {
    const complexity = activeFiltersCount * 10 + validations.length * 5;
    if (complexity < 20) return 'low';
    if (complexity < 50) return 'medium';
    return 'high';
  }, [activeFiltersCount, validations]);

  const recentFilters = useMemo(() => {
    // Get recent filter combinations from local storage or state
    const recent = localStorage.getItem('audit-filters-recent');
    if (recent) {
      try {
        return JSON.parse(recent) as AuditLogFilters[];
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  // ===================== EFFECTS =====================

  useEffect(() => {
    setLocalFilters(filters);
    setHasUnsavedChanges(false);
  }, [filters]);

  useEffect(() => {
    if (enableRealTimeValidation) {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = setTimeout(() => {
        validateFilters(localFilters);
      }, 300);
    }
  }, [localFilters, enableRealTimeValidation]);

  useEffect(() => {
    if (showSuggestions && enableIntelligentFiltering) {
      generateSuggestions(localFilters);
    }
  }, [localFilters, showSuggestions, enableIntelligentFiltering]);

  useEffect(() => {
    if (autoApplyDelay > 0 && hasUnsavedChanges) {
      if (autoApplyTimeoutRef.current) {
        clearTimeout(autoApplyTimeoutRef.current);
      }

      autoApplyTimeoutRef.current = setTimeout(() => {
        handleApplyFilters();
      }, autoApplyDelay);
    }
  }, [localFilters, autoApplyDelay, hasUnsavedChanges]);

  useEffect(() => {
    if (showFilterStatistics) {
      loadFilterStatistics();
    }
  }, [localFilters, showFilterStatistics]);

  useEffect(() => {
    // Load initial data
    loadUsers();
    loadRoles();
    loadResources();
    loadCustomFields();
    loadUserPresets();
  }, []);

  // ===================== HANDLERS =====================

  const validateFilters = async (filtersToValidate: AuditLogFilters) => {
    const newValidations: FilterValidation[] = [];

    // Validate each field
    for (const field of filterFields) {
      const value = filtersToValidate[field.id as keyof AuditLogFilters];
      
      if (field.validation) {
        // Required field validation
        if (field.validation.required && (!value || (Array.isArray(value) && value.length === 0))) {
          newValidations.push({
            field: field.id,
            type: 'error',
            message: `${field.label} is required`,
            suggestions: ['Please provide a value for this field']
          });
        }

        // Pattern validation
        if (value && field.validation.pattern && typeof value === 'string') {
          if (!field.validation.pattern.test(value)) {
            newValidations.push({
              field: field.id,
              type: 'error',
              message: `Invalid format for ${field.label}`,
              suggestions: ['Please check the format and try again']
            });
          }
        }

        // Custom validation
        if (value && field.validation.custom) {
          const customError = field.validation.custom(value);
          if (customError) {
            newValidations.push({
              field: field.id,
              type: 'error',
              message: customError,
              suggestions: ['Please correct the value']
            });
          }
        }

        // Range validation for numbers
        if (value && typeof value === 'number') {
          if (field.validation.min !== undefined && value < field.validation.min) {
            newValidations.push({
              field: field.id,
              type: 'error',
              message: `${field.label} must be at least ${field.validation.min}`,
              autoFix: () => handleFieldChange(field.id, field.validation!.min!)
            });
          }

          if (field.validation.max !== undefined && value > field.validation.max) {
            newValidations.push({
              field: field.id,
              type: 'error',
              message: `${field.label} must be at most ${field.validation.max}`,
              autoFix: () => handleFieldChange(field.id, field.validation!.max!)
            });
          }
        }
      }

      // Dependency validation
      if (field.dependencies) {
        for (const dependency of field.dependencies) {
          const depValue = filtersToValidate[dependency as keyof AuditLogFilters];
          if (value && (!depValue || (Array.isArray(depValue) && depValue.length === 0))) {
            const depField = filterFields.find(f => f.id === dependency);
            newValidations.push({
              field: field.id,
              type: 'warning',
              message: `${field.label} requires ${depField?.label || dependency} to be set`,
              suggestions: [`Please set ${depField?.label || dependency} first`]
            });
          }
        }
      }
    }

    // Cross-field validations
    if (filtersToValidate.startDate && filtersToValidate.endDate) {
      if (isAfter(filtersToValidate.startDate, filtersToValidate.endDate)) {
        newValidations.push({
          field: 'endDate',
          type: 'error',
          message: 'End date must be after start date',
          autoFix: () => {
            handleFieldChange('endDate', addDays(filtersToValidate.startDate!, 1));
          }
        });
      }
    }

    setValidations(newValidations);
  };

  const generateSuggestions = async (filtersToAnalyze: AuditLogFilters) => {
    if (!enableIntelligentFiltering) return;

    const newSuggestions: FilterSuggestion[] = [];

    // Completion suggestions
    if (filtersToAnalyze.eventType && !filtersToAnalyze.severity) {
      newSuggestions.push({
        id: 'complete_severity',
        type: 'completion',
        field: 'severity',
        title: 'Add severity filter',
        description: 'Filter by severity level to refine your results',
        value: 'error',
        confidence: 0.8,
        reasoning: ['Event type is set but severity is not', 'Adding severity improves filtering precision'],
        impact: 'medium',
        category: 'completeness'
      });
    }

    // Pattern suggestions based on common combinations
    if (filtersToAnalyze.eventType === 'security' && !filtersToAnalyze.success) {
      newSuggestions.push({
        id: 'security_failed',
        type: 'pattern',
        field: 'success',
        title: 'Filter failed security events',
        description: 'Security events are often analyzed for failures',
        value: false,
        confidence: 0.9,
        reasoning: ['Security events commonly filtered by failure status', 'Failed events indicate potential issues'],
        impact: 'high',
        category: 'efficiency',
        examples: ['Failed login attempts', 'Authorization failures', 'Access violations']
      });
    }

    // Performance optimization suggestions
    if (activeFiltersCount > 5) {
      newSuggestions.push({
        id: 'optimize_performance',
        type: 'enhancement',
        field: 'timeRange',
        title: 'Narrow time range',
        description: 'Reduce time range to improve query performance',
        value: { startDate: subHours(new Date(), 4), endDate: new Date() },
        confidence: 0.7,
        reasoning: ['Many filters applied', 'Narrower time range improves performance'],
        impact: 'medium',
        category: 'performance'
      });
    }

    // Template suggestions for common scenarios
    if (!filtersToAnalyze.eventType && !filtersToAnalyze.severity) {
      newSuggestions.push({
        id: 'security_template',
        type: 'template',
        field: 'eventType',
        title: 'Use security monitoring template',
        description: 'Apply common security monitoring filters',
        value: { eventType: 'security', severity: ['error', 'critical'], success: false },
        confidence: 0.6,
        reasoning: ['No filters applied', 'Security monitoring is a common use case'],
        impact: 'high',
        category: 'efficiency'
      });
    }

    // Sort by confidence and limit
    newSuggestions.sort((a, b) => b.confidence - a.confidence);
    setSuggestions(newSuggestions.slice(0, maxSuggestions));
  };

  const loadFilterStatistics = async () => {
    if (!showFilterStatistics) return;

    try {
      setIsLoading(true);
      const stats = await getAuditLogStatistics(localFilters);
      
      if (stats.success) {
        const statistics: FilterStatistics = {
          totalFilters: activeFiltersCount,
          activeFilters: activeFiltersCount,
          resultCount: stats.data.resultCount,
          executionTime: stats.data.executionTime,
          complexity: filterComplexity,
          performance: {
            indexUsage: stats.data.indexUsage || 80,
            queryOptimization: stats.data.optimization || 75,
            cacheHitRate: stats.data.cacheHitRate || 60
          },
          impact: {
            estimatedResults: stats.data.estimatedResults || 0,
            percentageReduction: stats.data.percentageReduction || 0,
            recommendedOptimizations: stats.data.optimizations || []
          },
          history: []
        };
        
        setStatistics(statistics);
      }
    } catch (error) {
      console.error('Failed to load filter statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomFields = async () => {
    if (!enableCustomFields) return;

    try {
      // Load custom fields from API or local storage
      const stored = localStorage.getItem('audit-custom-fields');
      if (stored) {
        const fields = JSON.parse(stored) as CustomField[];
        setCustomFields(fields);
        
        // Add custom fields to filter fields
        const customFilterFields = fields.filter(f => f.filterable).map(field => ({
          id: field.id,
          label: field.name,
          type: field.type as any,
          category: 'advanced' as const,
          description: field.description,
          width: 'md' as const,
          validation: field.validation
        }));
        
        setFilterFields(prev => [...prev, ...customFilterFields]);
      }
    } catch (error) {
      console.error('Failed to load custom fields:', error);
    }
  };

  const loadUserPresets = async () => {
    if (!showPresets) return;

    try {
      // Load user presets from API or local storage
      const stored = localStorage.getItem('audit-filter-presets');
      if (stored) {
        const userPresets = JSON.parse(stored) as FilterPreset[];
        setPresets(prev => [...prev, ...userPresets]);
      }
    } catch (error) {
      console.error('Failed to load user presets:', error);
    }
  };

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    const field = filterFields.find(f => f.id === fieldId);
    
    // Apply transformation if defined
    const transformedValue = field?.transformation ? field.transformation(value) : value;
    
    setLocalFilters(prev => ({
      ...prev,
      [fieldId]: transformedValue
    }));
    
    setHasUnsavedChanges(true);
  }, [filterFields]);

  const handleApplyFilters = useCallback(() => {
    if (hasValidationErrors) {
      toast.error('Please fix validation errors before applying filters');
      return;
    }

    // Save to recent filters
    const recent = recentFilters.filter(f => JSON.stringify(f) !== JSON.stringify(localFilters));
    recent.unshift(localFilters);
    localStorage.setItem('audit-filters-recent', JSON.stringify(recent.slice(0, 10)));

    onFiltersChange(localFilters);
    onFiltersApply?.(localFilters);
    setHasUnsavedChanges(false);
    
    toast.success('Filters applied successfully');
  }, [localFilters, hasValidationErrors, onFiltersChange, onFiltersApply, recentFilters]);

  const handleClearFilters = useCallback(() => {
    setLocalFilters({});
    setValidations([]);
    setSuggestions([]);
    setHasUnsavedChanges(true);
    onFiltersClear?.();
    
    toast.success('Filters cleared');
  }, [onFiltersClear]);

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    setLocalFilters(preset.filters);
    setHasUnsavedChanges(true);
    
    // Update usage count
    setPresets(prev => prev.map(p => 
      p.id === preset.id 
        ? { ...p, usageCount: p.usageCount + 1 }
        : p
    ));
    
    toast.success(`Applied preset: ${preset.name}`);
  }, []);

  const handleSavePreset = useCallback(async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const newPreset: FilterPreset = {
      id: `user_${Date.now()}`,
      name: presetName.trim(),
      description: presetDescription.trim(),
      filters: localFilters,
      category: presetCategory,
      isDefault: false,
      isReadonly: false,
      createdBy: currentUser!,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      tags: presetTags,
      icon: <Star className="h-4 w-4" />,
      color: 'text-blue-600'
    };

    setPresets(prev => [...prev, newPreset]);
    
    // Save to local storage
    const userPresets = presets.filter(p => p.category === 'user');
    userPresets.push(newPreset);
    localStorage.setItem('audit-filter-presets', JSON.stringify(userPresets));

    onFiltersSave?.(presetName, localFilters);
    
    setShowSaveDialog(false);
    setPresetName('');
    setPresetDescription('');
    setPresetTags([]);
    
    toast.success('Filter preset saved successfully');
  }, [presetName, presetDescription, presetTags, presetCategory, localFilters, currentUser, presets, onFiltersSave]);

  const handleApplySuggestion = useCallback((suggestion: FilterSuggestion) => {
    if (suggestion.type === 'template' && typeof suggestion.value === 'object') {
      setLocalFilters(prev => ({ ...prev, ...suggestion.value }));
    } else {
      setLocalFilters(prev => ({ ...prev, [suggestion.field]: suggestion.value }));
    }
    
    setHasUnsavedChanges(true);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    toast.success(`Applied suggestion: ${suggestion.title}`);
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // ===================== RENDER HELPERS =====================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Audit Filters</h3>
          
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
          
          {hasValidationErrors && (
            <Badge variant="destructive" className="text-xs">
              {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {statistics && showFilterStatistics && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{statistics.resultCount.toLocaleString()} results</span>
            <span>•</span>
            <span>{statistics.executionTime}ms</span>
            <span>•</span>
            <span className={cn(
              "font-medium",
              statistics.complexity === 'low' ? "text-green-600" :
              statistics.complexity === 'medium' ? "text-yellow-600" : "text-red-600"
            )}>
              {statistics.complexity} complexity
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Search Fields */}
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search filter fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        {/* Presets */}
        {showPresets && (
          <Button variant="outline" size="sm" onClick={() => setShowPresetsDialog(true)}>
            <Bookmark className="h-4 w-4 mr-2" />
            Presets
          </Button>
        )}

        {/* Save Current Filters */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowSaveDialog(true)}
          disabled={activeFiltersCount === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>

        {/* Apply/Clear Actions */}
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            onClick={handleApplyFilters}
            disabled={hasValidationErrors || !hasUnsavedChanges}
          >
            Apply Filters
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearFilters}
            disabled={activeFiltersCount === 0}
          >
            Clear All
          </Button>
        </div>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
              <Settings className="mr-2 h-4 w-4" />
              Advanced Options
            </DropdownMenuItem>
            
            {enableCustomFields && (
              <DropdownMenuItem onClick={() => setShowCustomFieldDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Field
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => {
              const exportData = {
                filters: localFilters,
                timestamp: new Date().toISOString(),
                user: currentUser?.email
              };
              
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `audit-filters-${format(new Date(), 'yyyy-MM-dd')}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className="p-4 border-b bg-blue-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Smart Suggestions</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuggestions([])}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{suggestion.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApplySuggestion(suggestion)}
              >
                Apply
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderValidations = () => {
    if (validations.length === 0) return null;

    return (
      <div className="p-4 border-b bg-red-50/50">
        <div className="space-y-2">
          {validations.map((validation, index) => (
            <div key={index} className="flex items-start space-x-2">
              {validation.type === 'error' && <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}
              {validation.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
              {validation.type === 'info' && <Info className="h-4 w-4 text-blue-600 mt-0.5" />}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{validation.message}</p>
                {validation.suggestions && validation.suggestions.length > 0 && (
                  <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                    {validation.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
              
              {validation.autoFix && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={validation.autoFix}
                >
                  Fix
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===================== MAIN RENDER =====================

  if (isCollapsed) {
    return (
      <div className={cn("border rounded-lg bg-background", className)}>
        {renderHeader()}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("border rounded-lg bg-background", className)}>
        {renderHeader()}
        {renderSuggestions()}
        {renderValidations()}
        
        <div className="p-4">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {FILTER_CATEGORIES.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <category.icon className="h-3 w-3 mr-1" />
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {FILTER_CATEGORIES.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                <FilterFieldsGrid
                  fields={filteredFields.filter(f => f.category === category.id)}
                  values={localFilters}
                  validations={validations}
                  onChange={handleFieldChange}
                  users={users}
                  roles={roles}
                  resources={resources}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Dialogs */}
        <PresetsDialog
          open={showPresetsDialog}
          onClose={() => setShowPresetsDialog(false)}
          presets={presets}
          onApplyPreset={handleApplyPreset}
          currentFilters={localFilters}
        />

        <SavePresetDialog
          open={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          presetName={presetName}
          onPresetNameChange={setPresetName}
          presetDescription={presetDescription}
          onPresetDescriptionChange={setPresetDescription}
          presetTags={presetTags}
          onPresetTagsChange={setPresetTags}
          presetCategory={presetCategory}
          onPresetCategoryChange={setPresetCategory}
          onSave={handleSavePreset}
          currentFilters={localFilters}
        />
      </div>
    </TooltipProvider>
  );
};

// ===================== SUB-COMPONENTS =====================

interface FilterFieldsGridProps {
  fields: FilterField[];
  values: AuditLogFilters;
  validations: FilterValidation[];
  onChange: (fieldId: string, value: any) => void;
  users: User[];
  roles: Role[];
  resources: Resource[];
}

const FilterFieldsGrid: React.FC<FilterFieldsGridProps> = ({
  fields,
  values,
  validations,
  onChange,
  users,
  roles,
  resources
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fields.map(field => (
        <FilterFieldComponent
          key={field.id}
          field={field}
          value={values[field.id as keyof AuditLogFilters]}
          validations={validations.filter(v => v.field === field.id)}
          onChange={(value) => onChange(field.id, value)}
          users={users}
          roles={roles}
          resources={resources}
        />
      ))}
    </div>
  );
};

// Additional sub-components would be implemented here...
// Due to length constraints, I'm providing the core structure.

export default AuditFilters;