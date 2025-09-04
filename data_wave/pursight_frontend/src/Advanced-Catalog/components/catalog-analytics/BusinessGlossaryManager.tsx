'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Progress 
} from "@/components/ui/progress";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { 
  Checkbox 
} from "@/components/ui/checkbox";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Calendar 
} from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  cn 
} from "@/lib copie/utils";
import { format, subDays, parseISO } from "date-fns";
import { CalendarIcon, Download, FileText, Filter, MoreHorizontal, Plus, RefreshCw, Settings, Share, Upload, Clock, AlertTriangle, CheckCircle, XCircle, Eye, Edit3, Trash2, Copy, Search, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Save, Send, Users, Mail, Printer, ExternalLink, Zap, Target, Layers, Activity, Database, Archive, Globe, Shield, Award, Bookmark, Info, HelpCircle, ChevronDown, ChevronRight, Maximize2, Minimize2, RotateCcw, PlayCircle, StopCircle, PauseCircle, Palette, Layout, Grid3X3, List, MapPin, Tag, Link, Star, Heart, MessageSquare, Bell, Lock, Unlock, Key, UserCheck, UserX, Briefcase, Building, Home, Folder, FolderOpen, File, FileType, Image, Video, Music, Code, Terminal, Cpu, HardDrive, Wifi, WifiOff, Power, PowerOff, BookOpen, GraduationCap, Brain, Network, GitBranch, Workflow, FileCheck, FileX, Clock3, Calendar as CalendarDays, Timer, Fingerprint, Hash, Type, BarChart2, Gauge, Percent, Shuffle, Repeat, SkipBack, SkipForward, Volume2, VolumeX, Mic, Camera, Smartphone, Monitor, Tablet, Watch, Navigation, Compass, Map, Route, Flag, Megaphone, Radio, Headphones, Speaker } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart as RechartsLineChart, 
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart as RechartsScatterChart,
  Scatter,
  ComposedChart,
  Treemap,
  Sankey
} from 'recharts';

// Import types and services
import { 
  BusinessGlossaryTerm,
  BusinessGlossaryAssociation,
  GlossaryCategory,
  TermRelationship,
  ApprovalWorkflow,
  TermUsage,
  TermMetrics,
  GlossaryGovernance,
  SemanticTag,
  TermVersion,
  CatalogApiResponse
} from '../../types';

import { enterpriseCatalogService, catalogAnalyticsService } from '../../services';
import { useCatalogAnalytics } from '../../hooks';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface BusinessGlossaryManagerProps {
  className?: string;
  embedded?: boolean;
  categoryId?: string;
  onTermSelect?: (term: BusinessGlossaryTerm) => void;
  onError?: (error: Error) => void;
}

interface CreateTermRequest {
  name: string;
  definition: string;
  description?: string;
  categoryId: string;
  aliases: string[];
  relatedTerms: string[];
  semanticTags: string[];
  businessOwner: string;
  technicalOwner: string;
  stewards: string[];
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'DEPRECATED';
  confidentiality: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  examples: string[];
  guidelines: string[];
  businessRules: string[];
  dataAssets: string[];
  customAttributes: Record<string, any>;
}

interface UpdateTermRequest extends Partial<CreateTermRequest> {
  id: string;
  versionComment?: string;
}

interface CreateCategoryRequest {
  name: string;
  description: string;
  parentId?: string;
  icon: string;
  color: string;
  governance: {
    approvalRequired: boolean;
    approvers: string[];
    reviewCycle: number; // days
  };
}

interface TermRelationshipRequest {
  sourceTermId: string;
  targetTermId: string;
  relationshipType: 'SYNONYM' | 'ANTONYM' | 'RELATED' | 'PARENT' | 'CHILD' | 'BROADER' | 'NARROWER';
  description?: string;
  strength: number; // 0-1
}

interface BulkImportConfig {
  format: 'CSV' | 'EXCEL' | 'JSON';
  includeRelationships: boolean;
  validateBeforeImport: boolean;
  skipDuplicates: boolean;
  categoryMapping: Record<string, string>;
  fieldMapping: Record<string, string>;
}

interface ExportConfig {
  format: 'PDF' | 'EXCEL' | 'JSON' | 'CSV' | 'XML';
  includeMetadata: boolean;
  includeRelationships: boolean;
  includeUsage: boolean;
  includeVersionHistory: boolean;
  filterByCategory: string[];
  filterByStatus: string[];
}

interface GlossaryMetrics {
  totalTerms: number;
  totalCategories: number;
  termsByStatus: Record<string, number>;
  termsByCategory: Record<string, number>;
  recentlyUpdated: number;
  pendingApproval: number;
  mostUsedTerms: Array<{ term: BusinessGlossaryTerm; usage: number }>;
  qualityScore: number;
  completenessScore: number;
  governanceScore: number;
}

interface WorkflowAction {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'REASSIGN';
  comment?: string;
  assignee?: string;
  dueDate?: Date;
}

interface TermValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
  }>;
  suggestions: Array<{
    field: string;
    suggestion: string;
    confidence: number;
  }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TERM_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'gray' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'orange' },
  { value: 'APPROVED', label: 'Approved', color: 'green' },
  { value: 'DEPRECATED', label: 'Deprecated', color: 'red' }
];

const CONFIDENTIALITY_LEVELS = [
  { value: 'PUBLIC', label: 'Public', color: 'green' },
  { value: 'INTERNAL', label: 'Internal', color: 'blue' },
  { value: 'CONFIDENTIAL', label: 'Confidential', color: 'orange' },
  { value: 'RESTRICTED', label: 'Restricted', color: 'red' }
];

const RELATIONSHIP_TYPES = [
  { value: 'SYNONYM', label: 'Synonym', description: 'Terms with the same meaning' },
  { value: 'ANTONYM', label: 'Antonym', description: 'Terms with opposite meanings' },
  { value: 'RELATED', label: 'Related', description: 'Terms that are conceptually related' },
  { value: 'PARENT', label: 'Parent', description: 'Broader concept' },
  { value: 'CHILD', label: 'Child', description: 'Narrower concept' },
  { value: 'BROADER', label: 'Broader Than', description: 'More general concept' },
  { value: 'NARROWER', label: 'Narrower Than', description: 'More specific concept' }
];

const CATEGORY_ICONS = [
  'Building', 'Users', 'Database', 'BarChart3', 'Target', 'Globe',
  'Shield', 'Award', 'Briefcase', 'GraduationCap', 'Brain', 'Network'
];

const VALIDATION_RULES = {
  NAME: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.]+$/,
    reserved: ['null', 'undefined', 'system', 'admin']
  },
  DEFINITION: {
    minLength: 10,
    maxLength: 1000
  },
  ALIASES: {
    maxCount: 10,
    maxLength: 50
  }
};

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BusinessGlossaryManager: React.FC<BusinessGlossaryManagerProps> = ({
  className,
  embedded = false,
  categoryId,
  onTermSelect,
  onError
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<string>('terms');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || '');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateTermDialog, setShowCreateTermDialog] = useState<boolean>(false);
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState<boolean>(false);
  const [showEditTermDialog, setShowEditTermDialog] = useState<boolean>(false);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState<boolean>(false);
  const [showRelationshipDialog, setShowRelationshipDialog] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree' | 'graph'>('list');
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({ field: 'name', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<{
    status: string[];
    category: string[];
    confidentiality: string[];
    hasDefinition: boolean;
    hasRelationships: boolean;
    recentlyUpdated: boolean;
  }>({
    status: [],
    category: [],
    confidentiality: [],
    hasDefinition: false,
    hasRelationships: false,
    recentlyUpdated: false
  });
  const [newTerm, setNewTerm] = useState<CreateTermRequest>({
    name: '',
    definition: '',
    description: '',
    categoryId: '',
    aliases: [],
    relatedTerms: [],
    semanticTags: [],
    businessOwner: '',
    technicalOwner: '',
    stewards: [],
    status: 'DRAFT',
    confidentiality: 'INTERNAL',
    examples: [],
    guidelines: [],
    businessRules: [],
    dataAssets: [],
    customAttributes: {}
  });
  const [newCategory, setNewCategory] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    parentId: '',
    icon: 'Folder',
    color: '#3b82f6',
    governance: {
      approvalRequired: false,
      approvers: [],
      reviewCycle: 90
    }
  });
  const [newRelationship, setNewRelationship] = useState<TermRelationshipRequest>({
    sourceTermId: '',
    targetTermId: '',
    relationshipType: 'RELATED',
    description: '',
    strength: 0.8
  });
  const [bulkImportConfig, setBulkImportConfig] = useState<BulkImportConfig>({
    format: 'CSV',
    includeRelationships: true,
    validateBeforeImport: true,
    skipDuplicates: true,
    categoryMapping: {},
    fieldMapping: {}
  });
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'PDF',
    includeMetadata: true,
    includeRelationships: true,
    includeUsage: true,
    includeVersionHistory: false,
    filterByCategory: [],
    filterByStatus: []
  });
  const [validationResults, setValidationResults] = useState<TermValidationResult | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTermsForBulkAction, setSelectedTermsForBulkAction] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // HOOKS & API INTEGRATION
  // ============================================================================

  const {
    generateReport,
    exportData,
    isLoading: analyticsLoading
  } = useCatalogAnalytics();

  // Fetch glossary terms
  const { 
    data: glossaryTerms = [], 
    isLoading: termsLoading,
    refetch: refetchTerms 
  } = useQuery({
    queryKey: ['glossary-terms', selectedCategory, searchQuery, filterConfig],
    queryFn: async () => {
      const response = await enterpriseCatalogService.getBusinessGlossaryTerms({
        categoryId: selectedCategory,
        search: searchQuery,
        status: filterConfig.status,
        confidentiality: filterConfig.confidentiality,
        hasDefinition: filterConfig.hasDefinition,
        hasRelationships: filterConfig.hasRelationships,
        recentlyUpdated: filterConfig.recentlyUpdated
      });
      return response.data || [];
    }
  });

  // Fetch glossary categories
  const { 
    data: glossaryCategories = [], 
    isLoading: categoriesLoading,
    refetch: refetchCategories 
  } = useQuery({
    queryKey: ['glossary-categories'],
    queryFn: async () => {
      const response = await enterpriseCatalogService.getGlossaryCategories();
      return response.data || [];
    }
  });

  // Fetch glossary metrics
  const { 
    data: glossaryMetrics,
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ['glossary-metrics'],
    queryFn: async () => {
      const response = await catalogAnalyticsService.getGlossaryMetrics();
      return response.data;
    }
  });

  // Fetch term relationships
  const { 
    data: termRelationships = [],
    refetch: refetchRelationships 
  } = useQuery({
    queryKey: ['term-relationships', selectedTerm],
    queryFn: async () => {
      if (!selectedTerm) return [];
      const response = await enterpriseCatalogService.getTermRelationships(selectedTerm);
      return response.data || [];
    },
    enabled: !!selectedTerm
  });

  // Fetch pending workflows
  const { 
    data: pendingWorkflows = [],
    refetch: refetchWorkflows 
  } = useQuery({
    queryKey: ['glossary-workflows'],
    queryFn: async () => {
      const response = await enterpriseCatalogService.getPendingGlossaryWorkflows();
      return response.data || [];
    }
  });

  // Create term mutation
  const createTermMutation = useMutation({
    mutationFn: async (term: CreateTermRequest) => {
      const response = await enterpriseCatalogService.createBusinessGlossaryTerm(term);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Business term created successfully');
      setShowCreateTermDialog(false);
      setNewTerm({
        name: '',
        definition: '',
        description: '',
        categoryId: '',
        aliases: [],
        relatedTerms: [],
        semanticTags: [],
        businessOwner: '',
        technicalOwner: '',
        stewards: [],
        status: 'DRAFT',
        confidentiality: 'INTERNAL',
        examples: [],
        guidelines: [],
        businessRules: [],
        dataAssets: [],
        customAttributes: {}
      });
      refetchTerms();
      onTermSelect?.(data);
    },
    onError: (error) => {
      toast.error('Failed to create business term');
      onError?.(error as Error);
    }
  });

  // Update term mutation
  const updateTermMutation = useMutation({
    mutationFn: async (term: UpdateTermRequest) => {
      const response = await enterpriseCatalogService.updateBusinessGlossaryTerm(term.id, term);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Business term updated successfully');
      setShowEditTermDialog(false);
      refetchTerms();
      onTermSelect?.(data);
    },
    onError: (error) => {
      toast.error('Failed to update business term');
      onError?.(error as Error);
    }
  });

  // Delete term mutation
  const deleteTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      await enterpriseCatalogService.deleteBusinessGlossaryTerm(termId);
    },
    onSuccess: () => {
      toast.success('Business term deleted successfully');
      setSelectedTerm('');
      refetchTerms();
    },
    onError: (error) => {
      toast.error('Failed to delete business term');
      onError?.(error as Error);
    }
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (category: CreateCategoryRequest) => {
      const response = await enterpriseCatalogService.createGlossaryCategory(category);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Category created successfully');
      setShowCreateCategoryDialog(false);
      setNewCategory({
        name: '',
        description: '',
        parentId: '',
        icon: 'Folder',
        color: '#3b82f6',
        governance: {
          approvalRequired: false,
          approvers: [],
          reviewCycle: 90
        }
      });
      refetchCategories();
    },
    onError: (error) => {
      toast.error('Failed to create category');
      onError?.(error as Error);
    }
  });

  // Create relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: async (relationship: TermRelationshipRequest) => {
      const response = await enterpriseCatalogService.createTermRelationship(relationship);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Term relationship created successfully');
      setShowRelationshipDialog(false);
      refetchRelationships();
    },
    onError: (error) => {
      toast.error('Failed to create relationship');
      onError?.(error as Error);
    }
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify(bulkImportConfig));
      
      const response = await enterpriseCatalogService.bulkImportGlossaryTerms(formData);
      return response.data;
    },
    onSuccess: (result) => {
      toast.success(`Successfully imported ${result.imported} terms (${result.skipped} skipped)`);
      setShowImportDialog(false);
      refetchTerms();
      refetchCategories();
    },
    onError: (error) => {
      toast.error('Failed to import terms');
      onError?.(error as Error);
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (config: ExportConfig) => {
      const response = await enterpriseCatalogService.exportGlossary(config);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Glossary exported successfully');
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      setShowExportDialog(false);
    },
    onError: (error) => {
      toast.error('Failed to export glossary');
      onError?.(error as Error);
    }
  });

  // Workflow action mutation
  const workflowActionMutation = useMutation({
    mutationFn: async (params: { workflowId: string; action: WorkflowAction }) => {
      const response = await enterpriseCatalogService.executeWorkflowAction(
        params.workflowId, 
        params.action
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Workflow action completed');
      setShowWorkflowDialog(false);
      refetchWorkflows();
      refetchTerms();
    },
    onError: (error) => {
      toast.error('Failed to execute workflow action');
      onError?.(error as Error);
    }
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      // Search filter
      if (searchQuery && !term.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !term.definition.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filterConfig.status.length > 0 && !filterConfig.status.includes(term.status)) {
        return false;
      }
      
      // Category filter
      if (filterConfig.category.length > 0 && !filterConfig.category.includes(term.categoryId)) {
        return false;
      }
      
      // Confidentiality filter
      if (filterConfig.confidentiality.length > 0 && 
          !filterConfig.confidentiality.includes(term.confidentiality)) {
        return false;
      }
      
      // Definition filter
      if (filterConfig.hasDefinition && !term.definition) {
        return false;
      }
      
      // Relationships filter
      if (filterConfig.hasRelationships && (!term.relatedTerms || term.relatedTerms.length === 0)) {
        return false;
      }
      
      // Recently updated filter
      if (filterConfig.recentlyUpdated) {
        const weekAgo = subDays(new Date(), 7);
        if (new Date(term.updatedAt) < weekAgo) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      const field = sortConfig.field as keyof BusinessGlossaryTerm;
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [glossaryTerms, searchQuery, filterConfig, sortConfig]);

  const selectedTermData = useMemo(() => {
    return glossaryTerms.find(term => term.id === selectedTerm);
  }, [glossaryTerms, selectedTerm]);

  const categoryHierarchy = useMemo(() => {
    const buildHierarchy = (parentId: string = '') => {
      return glossaryCategories
        .filter(cat => cat.parentId === parentId)
        .map(category => ({
          ...category,
          children: buildHierarchy(category.id),
          termCount: glossaryTerms.filter(term => term.categoryId === category.id).length
        }));
    };
    return buildHierarchy();
  }, [glossaryCategories, glossaryTerms]);

  const canCreateTerm = useMemo(() => {
    return newTerm.name.trim() !== '' && 
           newTerm.definition.trim() !== '' && 
           newTerm.categoryId !== '';
  }, [newTerm]);

  const canCreateCategory = useMemo(() => {
    return newCategory.name.trim() !== '' && newCategory.description.trim() !== '';
  }, [newCategory]);

  // ============================================================================
  // EFFECT HOOKS
  // ============================================================================

  useEffect(() => {
    if (categoryId && categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId, selectedCategory]);

  useEffect(() => {
    // Real-time validation
    if (newTerm.name || newTerm.definition) {
      validateTerm(newTerm);
    }
  }, [newTerm]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const validateTerm = useCallback(async (term: CreateTermRequest) => {
    const errors: TermValidationResult['errors'] = [];
    const suggestions: TermValidationResult['suggestions'] = [];

    // Name validation
    if (term.name.length < VALIDATION_RULES.NAME.minLength) {
      errors.push({
        field: 'name',
        message: `Name must be at least ${VALIDATION_RULES.NAME.minLength} characters`,
        severity: 'ERROR'
      });
    }
    
    if (term.name.length > VALIDATION_RULES.NAME.maxLength) {
      errors.push({
        field: 'name',
        message: `Name must not exceed ${VALIDATION_RULES.NAME.maxLength} characters`,
        severity: 'ERROR'
      });
    }
    
    if (!VALIDATION_RULES.NAME.pattern.test(term.name)) {
      errors.push({
        field: 'name',
        message: 'Name contains invalid characters',
        severity: 'ERROR'
      });
    }
    
    if (VALIDATION_RULES.NAME.reserved.includes(term.name.toLowerCase())) {
      errors.push({
        field: 'name',
        message: 'Name is reserved and cannot be used',
        severity: 'ERROR'
      });
    }

    // Definition validation
    if (term.definition.length < VALIDATION_RULES.DEFINITION.minLength) {
      errors.push({
        field: 'definition',
        message: `Definition must be at least ${VALIDATION_RULES.DEFINITION.minLength} characters`,
        severity: 'ERROR'
      });
    }
    
    if (term.definition.length > VALIDATION_RULES.DEFINITION.maxLength) {
      errors.push({
        field: 'definition',
        message: `Definition must not exceed ${VALIDATION_RULES.DEFINITION.maxLength} characters`,
        severity: 'ERROR'
      });
    }

    // Check for duplicates
    const existingTerm = glossaryTerms.find(t => 
      t.name.toLowerCase() === term.name.toLowerCase() && t.id !== (term as any).id
    );
    if (existingTerm) {
      errors.push({
        field: 'name',
        message: 'A term with this name already exists',
        severity: 'ERROR'
      });
    }

    // Generate suggestions
    if (term.aliases.length === 0) {
      suggestions.push({
        field: 'aliases',
        suggestion: 'Consider adding aliases to improve discoverability',
        confidence: 0.7
      });
    }
    
    if (!term.businessOwner) {
      suggestions.push({
        field: 'businessOwner',
        suggestion: 'Assign a business owner for governance',
        confidence: 0.9
      });
    }

    setValidationResults({
      isValid: errors.filter(e => e.severity === 'ERROR').length === 0,
      errors,
      suggestions
    });
  }, [glossaryTerms]);

  const handleTermSelect = useCallback((termId: string) => {
    setSelectedTerm(termId);
    const term = glossaryTerms.find(t => t.id === termId);
    if (term && onTermSelect) {
      onTermSelect(term);
    }
  }, [glossaryTerms, onTermSelect]);

  const handleCreateTerm = useCallback(async () => {
    if (!canCreateTerm) return;
    
    try {
      await createTermMutation.mutateAsync(newTerm);
    } catch (error) {
      console.error('Failed to create term:', error);
    }
  }, [canCreateTerm, newTerm, createTermMutation]);

  const handleUpdateTerm = useCallback(async (updates: Partial<CreateTermRequest>) => {
    if (!selectedTermData) return;
    
    try {
      await updateTermMutation.mutateAsync({
        id: selectedTermData.id,
        ...updates,
        versionComment: 'Updated via Business Glossary Manager'
      });
    } catch (error) {
      console.error('Failed to update term:', error);
    }
  }, [selectedTermData, updateTermMutation]);

  const handleDeleteTerm = useCallback(async (termId: string) => {
    if (!confirm('Are you sure you want to delete this term? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteTermMutation.mutateAsync(termId);
    } catch (error) {
      console.error('Failed to delete term:', error);
    }
  }, [deleteTermMutation]);

  const handleCreateCategory = useCallback(async () => {
    if (!canCreateCategory) return;
    
    try {
      await createCategoryMutation.mutateAsync(newCategory);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  }, [canCreateCategory, newCategory, createCategoryMutation]);

  const handleCreateRelationship = useCallback(async () => {
    if (!newRelationship.sourceTermId || !newRelationship.targetTermId) return;
    
    try {
      await createRelationshipMutation.mutateAsync(newRelationship);
    } catch (error) {
      console.error('Failed to create relationship:', error);
    }
  }, [newRelationship, createRelationshipMutation]);

  const handleBulkImport = useCallback(async (file: File) => {
    try {
      await bulkImportMutation.mutateAsync(file);
    } catch (error) {
      console.error('Failed to import terms:', error);
    }
  }, [bulkImportMutation]);

  const handleExport = useCallback(async () => {
    try {
      await exportMutation.mutateAsync(exportConfig);
    } catch (error) {
      console.error('Failed to export glossary:', error);
    }
  }, [exportMutation, exportConfig]);

  const handleWorkflowAction = useCallback(async (workflowId: string, action: WorkflowAction) => {
    try {
      await workflowActionMutation.mutateAsync({ workflowId, action });
    } catch (error) {
      console.error('Failed to execute workflow action:', error);
    }
  }, [workflowActionMutation]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
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

  const handleTermSelection = useCallback((termId: string, selected: boolean) => {
    setSelectedTermsForBulkAction(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(termId);
      } else {
        newSet.delete(termId);
      }
      return newSet;
    });
  }, []);

  const handleBulkAction = useCallback(async (action: 'approve' | 'reject' | 'delete' | 'export') => {
    const termIds = Array.from(selectedTermsForBulkAction);
    if (termIds.length === 0) return;

    switch (action) {
      case 'approve':
        // Bulk approve terms
        break;
      case 'reject':
        // Bulk reject terms
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${termIds.length} terms?`)) {
          // Bulk delete terms
        }
        break;
      case 'export':
        // Export selected terms
        break;
    }
    
    setSelectedTermsForBulkAction(new Set());
  }, [selectedTermsForBulkAction]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderGlossaryMetrics = () => {
    if (!glossaryMetrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Terms</p>
                <p className="text-2xl font-bold">{glossaryMetrics.totalTerms}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{glossaryMetrics.totalCategories}</p>
              </div>
              <Folder className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{glossaryMetrics.pendingApproval}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold">{Math.round(glossaryMetrics.qualityScore)}%</p>
              </div>
              <Gauge className={cn(
                "h-8 w-8",
                glossaryMetrics.qualityScore >= 90 ? "text-green-500" :
                glossaryMetrics.qualityScore >= 70 ? "text-orange-500" :
                "text-red-500"
              )} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCategoryTree = () => {
    const renderCategory = (category: any, level: number = 0) => (
      <div key={category.id} className={cn("", level > 0 && "ml-4")}>
        <div 
          className={cn(
            "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50",
            selectedCategory === category.id && "bg-blue-50 border border-blue-200"
          )}
          onClick={() => setSelectedCategory(category.id)}
        >
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryToggle(category.id);
              }}
            >
              {category.children.length > 0 && (
                expandedCategories.has(category.id) ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <Folder className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{category.name}</span>
            <Badge variant="outline" className="text-xs">
              {category.termCount}
            </Badge>
          </div>
        </div>
        
        {expandedCategories.has(category.id) && category.children.map((child: any) => 
          renderCategory(child, level + 1)
        )}
      </div>
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Categories
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateCategoryDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div 
              className={cn(
                "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50",
                selectedCategory === '' && "bg-blue-50 border border-blue-200"
              )}
              onClick={() => setSelectedCategory('')}
            >
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-gray-500" />
                <span className="font-medium">All Terms</span>
                <Badge variant="outline" className="text-xs">
                  {glossaryTerms.length}
                </Badge>
              </div>
            </div>
            {categoryHierarchy.map(category => renderCategory(category))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTermsList = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Business Terms</CardTitle>
          <CardDescription>
            {filteredTerms.length} terms
            {selectedCategory && ` in ${glossaryCategories.find(c => c.id === selectedCategory)?.name}`}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterConfig.hasDefinition}
                onCheckedChange={(checked) => 
                  setFilterConfig(prev => ({ ...prev, hasDefinition: !!checked }))
                }
              >
                Has Definition
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterConfig.hasRelationships}
                onCheckedChange={(checked) => 
                  setFilterConfig(prev => ({ ...prev, hasRelationships: !!checked }))
                }
              >
                Has Relationships
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterConfig.recentlyUpdated}
                onCheckedChange={(checked) => 
                  setFilterConfig(prev => ({ ...prev, recentlyUpdated: !!checked }))
                }
              >
                Recently Updated
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Layout className="h-4 w-4 mr-2" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <DropdownMenuRadioItem value="list">List View</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="grid">Grid View</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="tree">Tree View</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="graph">Graph View</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setShowCreateTermDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Term
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {selectedTermsForBulkAction.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedTermsForBulkAction.size} terms selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('approve')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTermsForBulkAction.size === filteredTerms.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTermsForBulkAction(new Set(filteredTerms.map(t => t.id)));
                        } else {
                          setSelectedTermsForBulkAction(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerms.map((term) => (
                  <TableRow 
                    key={term.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      selectedTerm === term.id && "bg-blue-50"
                    )}
                    onClick={() => handleTermSelect(term.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedTermsForBulkAction.has(term.id)}
                        onCheckedChange={(checked) => handleTermSelection(term.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{term.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {term.definition}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {glossaryCategories.find(c => c.id === term.categoryId)?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          term.status === 'APPROVED' ? 'default' :
                          term.status === 'UNDER_REVIEW' ? 'secondary' :
                          term.status === 'DEPRECATED' ? 'destructive' :
                          'outline'
                        }
                      >
                        {TERM_STATUSES.find(s => s.value === term.status)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {term.businessOwner.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm">{term.businessOwner}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(term.updatedAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Term
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Network className="h-4 w-4 mr-2" />
                            Relationships
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTerm(term.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTerms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No terms found matching the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTerms.map((term) => (
              <Card 
                key={term.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedTerm === term.id && "ring-2 ring-blue-500"
                )}
                onClick={() => handleTermSelect(term.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium line-clamp-1">
                        {term.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {glossaryCategories.find(c => c.id === term.categoryId)?.name}
                        </Badge>
                        <Badge 
                          variant={
                            term.status === 'APPROVED' ? 'default' :
                            term.status === 'UNDER_REVIEW' ? 'secondary' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {TERM_STATUSES.find(s => s.value === term.status)?.label}
                        </Badge>
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedTermsForBulkAction.has(term.id)}
                      onCheckedChange={(checked) => handleTermSelection(term.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {term.definition}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{term.businessOwner}</span>
                    <span>{format(new Date(term.updatedAt), 'MMM dd')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTermDetails = () => {
    if (!selectedTermData) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Term Selected</h3>
          <p className="text-muted-foreground">
            Select a term to view its details and relationships
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedTermData.name}
                </CardTitle>
                <CardDescription>
                  {glossaryCategories.find(c => c.id === selectedTermData.categoryId)?.name}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={
                    selectedTermData.status === 'APPROVED' ? 'default' :
                    selectedTermData.status === 'UNDER_REVIEW' ? 'secondary' :
                    selectedTermData.status === 'DEPRECATED' ? 'destructive' :
                    'outline'
                  }
                >
                  {TERM_STATUSES.find(s => s.value === selectedTermData.status)?.label}
                </Badge>
                <Badge variant="outline">
                  {CONFIDENTIALITY_LEVELS.find(c => c.value === selectedTermData.confidentiality)?.label}
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Definition</Label>
                <p className="mt-1 text-sm">{selectedTermData.definition}</p>
              </div>
              
              {selectedTermData.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedTermData.description}</p>
                </div>
              )}

              {selectedTermData.aliases.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Aliases</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedTermData.aliases.map((alias, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Business Owner</Label>
                  <p className="mt-1 text-sm">{selectedTermData.businessOwner}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Technical Owner</Label>
                  <p className="mt-1 text-sm">{selectedTermData.technicalOwner}</p>
                </div>
              </div>

              {selectedTermData.stewards.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Data Stewards</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedTermData.stewards.map((steward, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {steward}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTermData.examples.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Examples</Label>
                  <ul className="mt-1 text-sm space-y-1">
                    {selectedTermData.examples.map((example, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Relationships */}
        {termRelationships.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Relationships
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRelationshipDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Relationship
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {termRelationships.map((rel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        rel.relationshipType === 'SYNONYM' ? "bg-green-500" :
                        rel.relationshipType === 'ANTONYM' ? "bg-red-500" :
                        rel.relationshipType === 'PARENT' ? "bg-blue-500" :
                        rel.relationshipType === 'CHILD' ? "bg-purple-500" :
                        "bg-gray-500"
                      )} />
                      <div>
                        <p className="font-medium">
                          {RELATIONSHIP_TYPES.find(r => r.value === rel.relationshipType)?.label}
                        </p>
                        <p className="text-sm text-muted-foreground">{rel.targetTerm.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{Math.round(rel.strength * 100)}%</p>
                      <p className="text-xs text-muted-foreground">strength</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={cn("w-full space-y-6", className)}>
        {/* Header */}
        {!embedded && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Business Glossary Manager</h1>
              <p className="text-muted-foreground">
                Manage business terms, definitions, and semantic relationships
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={() => refetchTerms()}
                disabled={termsLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", termsLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Metrics */}
        {renderGlossaryMetrics()}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            {renderCategoryTree()}
            
            {/* Pending Workflows */}
            {pendingWorkflows.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Pending Approvals
                    <Badge variant="secondary">{pendingWorkflows.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pendingWorkflows.slice(0, 5).map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{workflow.termName}</p>
                          <p className="text-xs text-muted-foreground">{workflow.action}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowWorkflowDialog(true)}
                        >
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="terms">Terms</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="terms" className="space-y-6">
                {renderTermsList()}
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                {renderTermDetails()}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Glossary Analytics</CardTitle>
                    <CardDescription>
                      Usage patterns and adoption metrics for business terms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {glossaryMetrics && (
                      <div className="space-y-6">
                        {/* Terms by Status */}
                        <div>
                          <h4 className="font-medium mb-3">Terms by Status</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={Object.entries(glossaryMetrics.termsByStatus).map(([status, count]) => ({
                                    name: TERM_STATUSES.find(s => s.value === status)?.label || status,
                                    value: count
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {Object.keys(glossaryMetrics.termsByStatus).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Most Used Terms */}
                        <div>
                          <h4 className="font-medium mb-3">Most Used Terms</h4>
                          <div className="space-y-2">
                            {glossaryMetrics.mostUsedTerms.slice(0, 5).map((item, index) => (
                              <div key={item.term.id} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.term.name}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {item.term.definition}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{item.usage}</p>
                                  <p className="text-sm text-muted-foreground">uses</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Create Term Dialog */}
        <Dialog open={showCreateTermDialog} onOpenChange={setShowCreateTermDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Business Term</DialogTitle>
              <DialogDescription>
                Add a new term to the business glossary
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="termName">Term Name *</Label>
                  <Input
                    id="termName"
                    value={newTerm.name}
                    onChange={(e) => setNewTerm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter term name..."
                  />
                  {validationResults?.errors.find(e => e.field === 'name') && (
                    <p className="text-sm text-red-600 mt-1">
                      {validationResults.errors.find(e => e.field === 'name')?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newTerm.categoryId}
                    onValueChange={(value) => setNewTerm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {glossaryCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="definition">Definition *</Label>
                <Textarea
                  id="definition"
                  value={newTerm.definition}
                  onChange={(e) => setNewTerm(prev => ({ ...prev, definition: e.target.value }))}
                  placeholder="Enter a clear, concise definition..."
                  rows={3}
                />
                {validationResults?.errors.find(e => e.field === 'definition') && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationResults.errors.find(e => e.field === 'definition')?.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTerm.description}
                  onChange={(e) => setNewTerm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional context or detailed explanation..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessOwner">Business Owner *</Label>
                  <Input
                    id="businessOwner"
                    value={newTerm.businessOwner}
                    onChange={(e) => setNewTerm(prev => ({ ...prev, businessOwner: e.target.value }))}
                    placeholder="Enter business owner..."
                  />
                </div>
                <div>
                  <Label htmlFor="technicalOwner">Technical Owner</Label>
                  <Input
                    id="technicalOwner"
                    value={newTerm.technicalOwner}
                    onChange={(e) => setNewTerm(prev => ({ ...prev, technicalOwner: e.target.value }))}
                    placeholder="Enter technical owner..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={newTerm.status}
                    onValueChange={(value) => setNewTerm(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TERM_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Confidentiality</Label>
                  <Select
                    value={newTerm.confidentiality}
                    onValueChange={(value) => setNewTerm(prev => ({ ...prev, confidentiality: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONFIDENTIALITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Validation Results */}
              {validationResults && (
                <div className="space-y-2">
                  {validationResults.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Validation Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResults.errors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {validationResults.suggestions.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Suggestions</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResults.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion.suggestion}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateTermDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTerm}
                  disabled={!canCreateTerm || createTermMutation.isPending}
                >
                  {createTermMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Term
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Category Dialog */}
        <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize business terms
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name..."
                />
              </div>
              
              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this category..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Parent Category</Label>
                <Select
                  value={newCategory.parentId}
                  onValueChange={(value) => setNewCategory(prev => ({ ...prev, parentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent (Root Category)</SelectItem>
                    {glossaryCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateCategoryDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  disabled={!canCreateCategory || createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Glossary</DialogTitle>
              <DialogDescription>
                Configure export settings for the business glossary
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select
                  value={exportConfig.format}
                  onValueChange={(value) => 
                    setExportConfig(prev => ({ ...prev, format: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF Report</SelectItem>
                    <SelectItem value="EXCEL">Excel Workbook</SelectItem>
                    <SelectItem value="JSON">JSON Data</SelectItem>
                    <SelectItem value="CSV">CSV File</SelectItem>
                    <SelectItem value="XML">XML Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={exportConfig.includeMetadata}
                    onCheckedChange={(checked) => 
                      setExportConfig(prev => ({ ...prev, includeMetadata: !!checked }))
                    }
                  />
                  <Label htmlFor="includeMetadata">Include metadata</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRelationships"
                    checked={exportConfig.includeRelationships}
                    onCheckedChange={(checked) => 
                      setExportConfig(prev => ({ ...prev, includeRelationships: !!checked }))
                    }
                  />
                  <Label htmlFor="includeRelationships">Include relationships</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeUsage"
                    checked={exportConfig.includeUsage}
                    onCheckedChange={(checked) => 
                      setExportConfig(prev => ({ ...prev, includeUsage: !!checked }))
                    }
                  />
                  <Label htmlFor="includeUsage">Include usage statistics</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                >
                  {exportMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default BusinessGlossaryManager;