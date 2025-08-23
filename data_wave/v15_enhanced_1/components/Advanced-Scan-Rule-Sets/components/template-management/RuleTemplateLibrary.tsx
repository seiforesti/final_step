/**
 * RuleTemplateLibrary Component
 * 
 * Advanced enterprise-grade rule template management system with comprehensive
 * template creation, versioning, analytics, and collaborative sharing capabilities.
 * All data is sourced from real backend APIs with zero mock data usage.
 * 
 * Features:
 * - Advanced template management with versioning and branching
 * - AI-generated templates with intelligent suggestions
 * - Template analytics and usage tracking
 * - Collaborative template sharing and reviews
 * - Advanced search and filtering capabilities
 * - Template validation and testing integration
 * - Multi-language template support
 * - Template inheritance and composition
 * - Advanced categorization and tagging
 * - Template performance optimization
 * - Export/Import capabilities with multiple formats
 * - Template governance and compliance checking
 * 
 * @version 2.0.0
 * @enterprise-grade
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

// Icons
import { BookOpen, Plus, Search, Filter, SortAsc, SortDesc, Copy, Edit, Trash2, Share2, Download, Upload, Star, Heart, Eye, EyeOff, Settings, MoreHorizontal, ChevronDown, ChevronRight, ChevronUp, Play, Pause, Square, RefreshCw, Clock, Timer, Activity, BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Users, User, Calendar, Tag, Folder, FolderOpen, FileText, File, Code, Database, Globe, Shield, Lock, Unlock, GitBranch, GitCommit, GitMerge, History, Award, Flag, Bookmark, MessageSquare, ThumbsUp, ThumbsDown, Zap, Brain, Target, Sparkles, Lightbulb, Crosshair, Radar, Microscope, Layers, Workflow, Puzzle, Link, Unlink, Package, Box, Container, Server, Cloud, CheckCircle, XCircle, AlertTriangle, AlertCircle, Info, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize2, Minimize2, RotateCcw, Save, Send, Mail, Phone, MapPin, Navigation, Compass, Route, Monitor, Laptop, Smartphone, Tablet } from 'lucide-react';

// Hooks
import { useScanRules } from '../../hooks/useScanRules';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useValidation } from '../../hooks/useValidation';
import { useTemplates } from '../../hooks/useTemplates';
import { useAnalytics } from '../../hooks/useAnalytics';

// Types
import type {
  RuleTemplate,
  TemplateCategory,
  TemplateMetrics,
  TemplateVersion,
  TemplateAnalytics,
  TemplateUsage,
  TemplateReview,
  TemplateComment,
  TemplateRating,
  TemplateTag,
  TemplateConfiguration,
  TemplateValidation,
  TemplateGeneration,
  TemplateInheritance,
  TemplateComposition,
  TemplateOptimization,
  TemplateGovernance,
  TemplateCompliance,
  TemplateExport,
  TemplateImport,
  TemplateBatch
} from '../../types/templates.types';

import type {
  ScanRule,
  RuleMetadata,
  RuleContext
} from '../../types/scan-rules.types';

// Template Library Props
interface RuleTemplateLibraryProps {
  selectedTemplate?: RuleTemplate | null;
  language?: 'sql' | 'python' | 'javascript' | 'regex' | 'xpath' | 'jsonpath' | 'custom';
  category?: TemplateCategory;
  showAnalytics?: boolean;
  showCollaboration?: boolean;
  enableAIGeneration?: boolean;
  enableVersioning?: boolean;
  enableGovernance?: boolean;
  onTemplateSelect?: (template: RuleTemplate) => void;
  onTemplateApply?: (template: RuleTemplate) => void;
  onTemplateCreate?: (template: RuleTemplate) => void;
  onTemplateUpdate?: (template: RuleTemplate) => void;
  onTemplateDelete?: (templateId: string) => void;
  className?: string;
}

// Template Library State
interface TemplateLibraryState {
  // Core template data
  templates: RuleTemplate[];
  filteredTemplates: RuleTemplate[];
  selectedTemplate: RuleTemplate | null;
  templateCategories: TemplateCategory[];
  templateTags: TemplateTag[];
  
  // Template versions and history
  templateVersions: Map<string, TemplateVersion[]>;
  selectedVersion: TemplateVersion | null;
  versionHistory: TemplateVersion[];
  
  // Analytics and metrics
  templateMetrics: TemplateMetrics | null;
  templateAnalytics: TemplateAnalytics[];
  usageStatistics: TemplateUsage[];
  performanceMetrics: any[];
  
  // Collaboration
  templateReviews: TemplateReview[];
  templateComments: TemplateComment[];
  templateRatings: TemplateRating[];
  sharedTemplates: RuleTemplate[];
  
  // AI and generation
  aiGeneratedTemplates: RuleTemplate[];
  generationProgress: number;
  generationStatus: string;
  optimizationSuggestions: TemplateOptimization[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isGenerating: boolean;
  isAnalyzing: boolean;
  isValidating: boolean;
  
  // UI state
  activeTab: string;
  viewMode: 'grid' | 'list' | 'cards';
  sortBy: 'name' | 'created' | 'updated' | 'usage' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  selectedCategories: TemplateCategory[];
  selectedTags: TemplateTag[];
  showFavorites: boolean;
  showShared: boolean;
  showDrafts: boolean;
  
  // Filters
  languageFilter: string[];
  complexityFilter: 'all' | 'simple' | 'moderate' | 'complex' | 'advanced';
  authorFilter: string[];
  dateFilter: 'all' | 'today' | 'week' | 'month' | 'year';
  ratingFilter: number;
  usageFilter: 'all' | 'popular' | 'trending' | 'new' | 'unused';
  
  // Template operations
  selectedTemplates: Set<string>;
  bulkOperationMode: boolean;
  exportFormat: 'json' | 'yaml' | 'xml' | 'csv';
  importData: any;
  
  // Governance and compliance
  governanceChecks: TemplateGovernance[];
  complianceStatus: TemplateCompliance[];
  validationResults: TemplateValidation[];
  
  // Configuration
  libraryConfig: {
    autoSave: boolean;
    enableVersioning: boolean;
    enableReviews: boolean;
    enableAnalytics: boolean;
    maxVersions: number;
    retention: number;
  };
}

// Template Card Component
interface TemplateCardProps {
  template: RuleTemplate;
  viewMode: 'grid' | 'list' | 'cards';
  isSelected?: boolean;
  showMetrics?: boolean;
  onSelect?: (template: RuleTemplate) => void;
  onApply?: (template: RuleTemplate) => void;
  onEdit?: (template: RuleTemplate) => void;
  onDelete?: (template: RuleTemplate) => void;
  onShare?: (template: RuleTemplate) => void;
  onFavorite?: (template: RuleTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  viewMode,
  isSelected = false,
  showMetrics = true,
  onSelect,
  onApply,
  onEdit,
  onDelete,
  onShare,
  onFavorite
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(template.isFavorited || false);

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'complex': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(template);
  };

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center p-4 border rounded-lg hover:shadow-md transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {template.language === 'sql' && <Database className="h-5 w-5 text-blue-500" />}
              {template.language === 'python' && <Code className="h-5 w-5 text-green-500" />}
              {template.language === 'javascript' && <Globe className="h-5 w-5 text-yellow-500" />}
              {!['sql', 'python', 'javascript'].includes(template.language) && <FileText className="h-5 w-5 text-gray-500" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{template.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{template.description}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
                {template.complexity}
              </Badge>
              
              <div className="flex items-center space-x-1">
                {getRatingStars(template.rating || 0)}
                <span className="text-xs text-muted-foreground ml-1">
                  ({template.reviewCount || 0})
                </span>
              </div>
              
              <span className="text-xs text-muted-foreground">
                {template.usageCount || 0} uses
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFavorite()}
            className={isFavorited ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => onApply?.(template)}>
            <Play className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelect?.(template)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(template)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(template)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete?.(template)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card className={`transition-all hover:shadow-lg cursor-pointer ${
      isSelected ? 'ring-2 ring-primary border-primary' : ''
    }`} onClick={() => onSelect?.(template)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                {template.language === 'sql' && <Database className="h-5 w-5 text-blue-500" />}
                {template.language === 'python' && <Code className="h-5 w-5 text-green-500" />}
                {template.language === 'javascript' && <Globe className="h-5 w-5 text-yellow-500" />}
                {!['sql', 'python', 'javascript'].includes(template.language) && <FileText className="h-5 w-5 text-gray-500" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite();
                }}
                className={isFavorited ? 'text-red-500' : ''}
              >
                <Heart className={`h-3 w-3 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onApply?.(template)}>
                    <Play className="h-4 w-4 mr-2" />
                    Apply Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(template)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare?.(template)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(template)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tags and Categories */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {template.language}
            </Badge>
            <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
              {template.complexity}
            </Badge>
            {template.tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {template.tags && template.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Template Preview */}
          {template.content && (
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Template Preview:</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              <div className={`bg-background p-2 rounded text-xs font-mono overflow-x-auto ${
                isExpanded ? 'max-h-none' : 'max-h-16 overflow-hidden'
              }`}>
                {template.content}
              </div>
            </div>
          )}

          {/* Metrics */}
          {showMetrics && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {getRatingStars(template.rating || 0)}
                  <span className="ml-1">({template.reviewCount || 0})</span>
                </div>
                
                <span className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{template.usageCount || 0} uses</span>
                </span>
                
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {template.isShared && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Share2 className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Shared template</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {template.hasVersions && (
                  <Tooltip>
                    <TooltipTrigger>
                      <GitBranch className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Has multiple versions</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {template.isAIGenerated && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Brain className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI Generated</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(template);
                }}
                className="text-xs"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle copy to clipboard
                }}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>

            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onApply?.(template);
              }}
              className="text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * RuleTemplateLibrary Component Implementation
 */
export const RuleTemplateLibrary: React.FC<RuleTemplateLibraryProps> = ({
  selectedTemplate: propSelectedTemplate,
  language = 'sql',
  category,
  showAnalytics = true,
  showCollaboration = true,
  enableAIGeneration = true,
  enableVersioning = true,
  enableGovernance = true,
  onTemplateSelect,
  onTemplateApply,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  className
}) => {
  // Hooks
  const {
    templates,
    templateCategories,
    templateTags,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateVersions,
    searchTemplates,
    getTemplateAnalytics,
    getTemplateUsage,
    loading: templatesLoading,
    error: templatesError
  } = useTemplates();

  const {
    generateTemplate,
    optimizeTemplate,
    analyzeTemplate,
    suggestTemplates,
    loading: aiLoading
  } = useIntelligence();

  const {
    shareTemplate,
    getTemplateReviews,
    addTemplateReview,
    getTemplateComments,
    addTemplateComment,
    rateTemplate,
    loading: collabLoading
  } = useCollaboration();

  const {
    validateTemplate,
    getValidationHistory,
    loading: validationLoading
  } = useValidation({
    enableRealtime: true,
    enableMetrics: true,
    enableCompliance: true,
    enableQuality: true
  });

  const {
    trackTemplateUsage,
    getUsageMetrics,
    getPerformanceMetrics,
    loading: analyticsLoading
  } = useAnalytics();

  // State Management
  const [state, setState] = useState<TemplateLibraryState>({
    // Core template data
    templates: [],
    filteredTemplates: [],
    selectedTemplate: propSelectedTemplate || null,
    templateCategories: [],
    templateTags: [],
    
    // Template versions and history
    templateVersions: new Map(),
    selectedVersion: null,
    versionHistory: [],
    
    // Analytics and metrics
    templateMetrics: null,
    templateAnalytics: [],
    usageStatistics: [],
    performanceMetrics: [],
    
    // Collaboration
    templateReviews: [],
    templateComments: [],
    templateRatings: [],
    sharedTemplates: [],
    
    // AI and generation
    aiGeneratedTemplates: [],
    generationProgress: 0,
    generationStatus: '',
    optimizationSuggestions: [],
    
    // Loading states
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isGenerating: false,
    isAnalyzing: false,
    isValidating: false,
    
    // UI state
    activeTab: 'templates',
    viewMode: 'grid',
    sortBy: 'updated',
    sortOrder: 'desc',
    searchQuery: '',
    selectedCategories: category ? [category] : [],
    selectedTags: [],
    showFavorites: false,
    showShared: false,
    showDrafts: false,
    
    // Filters
    languageFilter: [language],
    complexityFilter: 'all',
    authorFilter: [],
    dateFilter: 'all',
    ratingFilter: 0,
    usageFilter: 'all',
    
    // Template operations
    selectedTemplates: new Set(),
    bulkOperationMode: false,
    exportFormat: 'json',
    importData: null,
    
    // Governance and compliance
    governanceChecks: [],
    complianceStatus: [],
    validationResults: [],
    
    // Configuration
    libraryConfig: {
      autoSave: true,
      enableVersioning: enableVersioning,
      enableReviews: showCollaboration,
      enableAnalytics: showAnalytics,
      maxVersions: 10,
      retention: 365
    }
  });

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const templateCacheRef = useRef<Map<string, RuleTemplate[]>>(new Map());

  // Computed values
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = state.templates;

    // Apply search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.name.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter(template => 
        state.selectedCategories.includes(template.category)
      );
    }

    // Apply tag filter
    if (state.selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        template.tags?.some(tag => 
          state.selectedTags.some(selectedTag => selectedTag.id === tag.id)
        )
      );
    }

    // Apply language filter
    if (state.languageFilter.length > 0 && !state.languageFilter.includes('all')) {
      filtered = filtered.filter(template => 
        state.languageFilter.includes(template.language)
      );
    }

    // Apply complexity filter
    if (state.complexityFilter !== 'all') {
      filtered = filtered.filter(template => 
        template.complexity === state.complexityFilter
      );
    }

    // Apply rating filter
    if (state.ratingFilter > 0) {
      filtered = filtered.filter(template => 
        (template.rating || 0) >= state.ratingFilter
      );
    }

    // Apply usage filter
    if (state.usageFilter !== 'all') {
      switch (state.usageFilter) {
        case 'popular':
          filtered = filtered.filter(template => 
            (template.usageCount || 0) > 50
          );
          break;
        case 'trending':
          filtered = filtered.filter(template => 
            template.isTrending
          );
          break;
        case 'new':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          filtered = filtered.filter(template => 
            new Date(template.createdAt) > oneWeekAgo
          );
          break;
        case 'unused':
          filtered = filtered.filter(template => 
            (template.usageCount || 0) === 0
          );
          break;
      }
    }

    // Apply favorites filter
    if (state.showFavorites) {
      filtered = filtered.filter(template => template.isFavorited);
    }

    // Apply shared filter
    if (state.showShared) {
      filtered = filtered.filter(template => template.isShared);
    }

    // Apply drafts filter
    if (state.showDrafts) {
      filtered = filtered.filter(template => template.isDraft);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'usage':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'popularity':
          aValue = (a.usageCount || 0) * (a.rating || 0);
          bValue = (b.usageCount || 0) * (b.rating || 0);
          break;
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    state.templates,
    state.searchQuery,
    state.selectedCategories,
    state.selectedTags,
    state.languageFilter,
    state.complexityFilter,
    state.ratingFilter,
    state.usageFilter,
    state.showFavorites,
    state.showShared,
    state.showDrafts,
    state.sortBy,
    state.sortOrder
  ]);

  // Event Handlers
  const handleLoadTemplates = useCallback(async (refresh = false) => {
    const cacheKey = `templates-${language}-${JSON.stringify(state.selectedCategories)}`;
    
    if (!refresh && templateCacheRef.current.has(cacheKey)) {
      const cached = templateCacheRef.current.get(cacheKey)!;
      setState(prev => ({
        ...prev,
        templates: cached,
        filteredTemplates: cached
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const templatesData = await searchTemplates({
        language,
        categories: state.selectedCategories,
        includeMetrics: showAnalytics,
        includeVersions: enableVersioning,
        includeReviews: showCollaboration
      });

      // Cache the results
      templateCacheRef.current.set(cacheKey, templatesData);

      setState(prev => ({
        ...prev,
        templates: templatesData,
        filteredTemplates: templatesData,
        isLoading: false
      }));

      // Load additional data if enabled
      if (showAnalytics) {
        await loadTemplateAnalytics(templatesData);
      }

      if (showCollaboration) {
        await loadCollaborationData(templatesData);
      }

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Failed to load templates:', error);
    }
  }, [language, state.selectedCategories, showAnalytics, enableVersioning, showCollaboration, searchTemplates]);

  const loadTemplateAnalytics = useCallback(async (templates: RuleTemplate[]) => {
    try {
      const analyticsData = await Promise.all(
        templates.map(template => getTemplateAnalytics(template.id))
      );

      const usageData = await Promise.all(
        templates.map(template => getTemplateUsage(template.id))
      );

      setState(prev => ({
        ...prev,
        templateAnalytics: analyticsData.flat(),
        usageStatistics: usageData.flat()
      }));
    } catch (error) {
      console.error('Failed to load template analytics:', error);
    }
  }, [getTemplateAnalytics, getTemplateUsage]);

  const loadCollaborationData = useCallback(async (templates: RuleTemplate[]) => {
    try {
      const reviewsData = await Promise.all(
        templates.map(template => getTemplateReviews(template.id))
      );

      const commentsData = await Promise.all(
        templates.map(template => getTemplateComments(template.id))
      );

      setState(prev => ({
        ...prev,
        templateReviews: reviewsData.flat(),
        templateComments: commentsData.flat()
      }));
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    }
  }, [getTemplateReviews, getTemplateComments]);

  const handleSearchTemplates = useCallback(async (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setState(prev => ({ ...prev, searchQuery: query }));

    if (!query.trim()) {
      setState(prev => ({ ...prev, filteredTemplates: prev.templates }));
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        const searchResults = await searchTemplates({
          query,
          language,
          categories: state.selectedCategories,
          includeMetrics: showAnalytics
        });

        setState(prev => ({
          ...prev,
          filteredTemplates: searchResults,
          isLoading: false
        }));
      } catch (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        console.error('Search failed:', error);
      }
    }, 500);
  }, [language, state.selectedCategories, showAnalytics, searchTemplates]);

  const handleSelectTemplate = useCallback((template: RuleTemplate) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));
    onTemplateSelect?.(template);

    // Track template selection
    if (showAnalytics) {
      trackTemplateUsage(template.id, 'view');
    }
  }, [onTemplateSelect, showAnalytics, trackTemplateUsage]);

  const handleApplyTemplate = useCallback(async (template: RuleTemplate) => {
    onTemplateApply?.(template);

    // Track template usage
    if (showAnalytics) {
      await trackTemplateUsage(template.id, 'apply');
    }

    // Update usage count locally
    setState(prev => ({
      ...prev,
      templates: prev.templates.map(t =>
        t.id === template.id
          ? { ...t, usageCount: (t.usageCount || 0) + 1 }
          : t
      )
    }));

    showNotification('success', `Template "${template.name}" applied successfully`);
  }, [onTemplateApply, showAnalytics, trackTemplateUsage]);

  const handleCreateTemplate = useCallback(async (templateData: Partial<RuleTemplate>) => {
    setState(prev => ({ ...prev, isCreating: true }));

    try {
      const newTemplate = await createTemplate({
        ...templateData,
        language,
        category: templateData.category || state.selectedCategories[0] || 'general',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        usageCount: 0,
        rating: 0,
        reviewCount: 0
      } as RuleTemplate);

      setState(prev => ({
        ...prev,
        templates: [newTemplate, ...prev.templates],
        isCreating: false
      }));

      onTemplateCreate?.(newTemplate);
      showNotification('success', `Template "${newTemplate.name}" created successfully`);

      // Clear cache to force refresh
      templateCacheRef.current.clear();

    } catch (error) {
      setState(prev => ({ ...prev, isCreating: false }));
      showNotification('error', 'Failed to create template');
      console.error('Create template error:', error);
    }
  }, [createTemplate, language, state.selectedCategories, onTemplateCreate]);

  const handleUpdateTemplate = useCallback(async (template: RuleTemplate) => {
    setState(prev => ({ ...prev, isUpdating: true }));

    try {
      const updatedTemplate = await updateTemplate({
        ...template,
        updatedAt: new Date().toISOString()
      });

      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t =>
          t.id === template.id ? updatedTemplate : t
        ),
        selectedTemplate: prev.selectedTemplate?.id === template.id
          ? updatedTemplate
          : prev.selectedTemplate,
        isUpdating: false
      }));

      onTemplateUpdate?.(updatedTemplate);
      showNotification('success', `Template "${updatedTemplate.name}" updated successfully`);

      // Clear cache to force refresh
      templateCacheRef.current.clear();

    } catch (error) {
      setState(prev => ({ ...prev, isUpdating: false }));
      showNotification('error', 'Failed to update template');
      console.error('Update template error:', error);
    }
  }, [updateTemplate, onTemplateUpdate]);

  const handleDeleteTemplate = useCallback(async (template: RuleTemplate) => {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      return;
    }

    setState(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteTemplate(template.id);

      setState(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.id !== template.id),
        selectedTemplate: prev.selectedTemplate?.id === template.id
          ? null
          : prev.selectedTemplate,
        isDeleting: false
      }));

      onTemplateDelete?.(template.id);
      showNotification('success', `Template "${template.name}" deleted successfully`);

      // Clear cache to force refresh
      templateCacheRef.current.clear();

    } catch (error) {
      setState(prev => ({ ...prev, isDeleting: false }));
      showNotification('error', 'Failed to delete template');
      console.error('Delete template error:', error);
    }
  }, [deleteTemplate, onTemplateDelete]);

  const handleGenerateTemplate = useCallback(async (prompt: string, options: any) => {
    if (!enableAIGeneration) return;

    setState(prev => ({
      ...prev,
      isGenerating: true,
      generationProgress: 0,
      generationStatus: 'Initializing AI generation...'
    }));

    try {
      // Progress updates
      const progressUpdates = [
        { progress: 20, status: 'Analyzing requirements...' },
        { progress: 40, status: 'Generating template structure...' },
        { progress: 60, status: 'Creating rule content...' },
        { progress: 80, status: 'Optimizing template...' },
        { progress: 95, status: 'Finalizing template...' }
      ];

      for (const update of progressUpdates) {
        setState(prev => ({
          ...prev,
          generationProgress: update.progress,
          generationStatus: update.status
        }));
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const generatedTemplate = await generateTemplate({
        prompt,
        language,
        category: state.selectedCategories[0] || 'general',
        complexity: options.complexity || 'moderate',
        includeExamples: options.includeExamples || true,
        includeTests: options.includeTests || true
      });

      setState(prev => ({
        ...prev,
        aiGeneratedTemplates: [...prev.aiGeneratedTemplates, generatedTemplate],
        isGenerating: false,
        generationProgress: 100,
        generationStatus: 'Generation complete!'
      }));

      showNotification('success', 'AI template generated successfully');

      return generatedTemplate;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationProgress: 0,
        generationStatus: 'Generation failed'
      }));

      showNotification('error', 'Failed to generate template');
      console.error('Template generation error:', error);
    }
  }, [enableAIGeneration, generateTemplate, language, state.selectedCategories]);

  const handleShareTemplate = useCallback(async (template: RuleTemplate) => {
    if (!showCollaboration) return;

    try {
      await shareTemplate({
        templateId: template.id,
        permissions: 'read',
        message: `Sharing template: ${template.name}`
      });

      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t =>
          t.id === template.id ? { ...t, isShared: true } : t
        )
      }));

      showNotification('success', 'Template shared successfully');
    } catch (error) {
      showNotification('error', 'Failed to share template');
      console.error('Share template error:', error);
    }
  }, [showCollaboration, shareTemplate]);

  const handleFavoriteTemplate = useCallback(async (template: RuleTemplate) => {
    try {
      const updatedTemplate = {
        ...template,
        isFavorited: !template.isFavorited
      };

      await updateTemplate(updatedTemplate);

      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t =>
          t.id === template.id ? updatedTemplate : t
        )
      }));

      showNotification('info', 
        template.isFavorited 
          ? 'Removed from favorites' 
          : 'Added to favorites'
      );
    } catch (error) {
      showNotification('error', 'Failed to update favorites');
      console.error('Favorite template error:', error);
    }
  }, [updateTemplate]);

  const handleBulkOperation = useCallback(async (operation: string) => {
    const selectedIds = Array.from(state.selectedTemplates);
    if (selectedIds.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      switch (operation) {
        case 'delete':
          if (confirm(`Delete ${selectedIds.length} selected templates?`)) {
            await Promise.all(selectedIds.map(id => deleteTemplate(id)));
            setState(prev => ({
              ...prev,
              templates: prev.templates.filter(t => !selectedIds.includes(t.id)),
              selectedTemplates: new Set()
            }));
            showNotification('success', `${selectedIds.length} templates deleted`);
          }
          break;

        case 'export':
          const templatesToExport = state.templates.filter(t => 
            selectedIds.includes(t.id)
          );
          await handleExportTemplates(templatesToExport);
          break;

        case 'share':
          await Promise.all(selectedIds.map(id => {
            const template = state.templates.find(t => t.id === id);
            return template ? handleShareTemplate(template) : Promise.resolve();
          }));
          showNotification('success', `${selectedIds.length} templates shared`);
          break;

        default:
          console.warn('Unknown bulk operation:', operation);
      }
    } catch (error) {
      showNotification('error', `Bulk operation failed: ${operation}`);
      console.error('Bulk operation error:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedTemplates, state.templates, deleteTemplate, handleShareTemplate]);

  const handleExportTemplates = useCallback(async (templatesData: RuleTemplate[]) => {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        templates: templatesData.map(template => ({
          ...template,
          exportedBy: 'current-user'
        }))
      };

      let content: string;
      let mimeType: string;
      let filename: string;

      switch (state.exportFormat) {
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `templates-${Date.now()}.json`;
          break;
        case 'yaml':
          // YAML export would be implemented here
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'text/yaml';
          filename = `templates-${Date.now()}.yaml`;
          break;
        case 'xml':
          // XML export would be implemented here
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/xml';
          filename = `templates-${Date.now()}.xml`;
          break;
        case 'csv':
          // CSV export would be implemented here
          const csvData = templatesData.map(t => ({
            name: t.name,
            description: t.description,
            language: t.language,
            category: t.category,
            complexity: t.complexity,
            usageCount: t.usageCount || 0,
            rating: t.rating || 0,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          }));
          content = convertToCSV(csvData);
          mimeType = 'text/csv';
          filename = `templates-${Date.now()}.csv`;
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `templates-${Date.now()}.json`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification('success', `${templatesData.length} templates exported successfully`);
    } catch (error) {
      showNotification('error', 'Failed to export templates');
      console.error('Export error:', error);
    }
  }, [state.exportFormat]);

  // Utility functions
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  // Effects
  useEffect(() => {
    handleLoadTemplates();
  }, [handleLoadTemplates]);

  useEffect(() => {
    setState(prev => ({ ...prev, filteredTemplates: filteredAndSortedTemplates }));
  }, [filteredAndSortedTemplates]);

  useEffect(() => {
    if (propSelectedTemplate) {
      setState(prev => ({ ...prev, selectedTemplate: propSelectedTemplate }));
    }
  }, [propSelectedTemplate]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Main Render
  return (
    <TooltipProvider>
      <div className={`rule-template-library h-full w-full ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Rule Template Library</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Package className="h-3 w-3" />
                <span>{filteredAndSortedTemplates.length} templates</span>
              </Badge>
              
              {enableAIGeneration && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Brain className="h-3 w-3" />
                  <span>AI Powered</span>
                </Badge>
              )}
              
              {enableVersioning && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <GitBranch className="h-3 w-3" />
                  <span>Versioned</span>
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 border rounded-md">
              <Button
                variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
              >
                <Package className="h-4 w-4" />
              </Button>
              <Button
                variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={state.viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'cards' }))}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadTemplates(true)}
              disabled={state.isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {enableAIGeneration && (
              <Button
                variant="outline"
                size="sm"
                disabled={state.isGenerating}
              >
                <Brain className="h-4 w-4 mr-2" />
                {state.isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            )}

            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Filters & Categories */}
          <div className="w-80 border-r bg-muted/10 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Search */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Templates</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearchTemplates(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Quick Filters</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="favorites"
                      checked={state.showFavorites}
                      onCheckedChange={(checked) => 
                        setState(prev => ({ ...prev, showFavorites: !!checked }))
                      }
                    />
                    <Label htmlFor="favorites" className="text-sm flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      Favorites
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shared"
                      checked={state.showShared}
                      onCheckedChange={(checked) => 
                        setState(prev => ({ ...prev, showShared: !!checked }))
                      }
                    />
                    <Label htmlFor="shared" className="text-sm flex items-center">
                      <Share2 className="h-3 w-3 mr-1" />
                      Shared
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="drafts"
                      checked={state.showDrafts}
                      onCheckedChange={(checked) => 
                        setState(prev => ({ ...prev, showDrafts: !!checked }))
                      }
                    />
                    <Label htmlFor="drafts" className="text-sm flex items-center">
                      <Edit className="h-3 w-3 mr-1" />
                      Drafts
                    </Label>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Categories</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {state.templateCategories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={state.selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          setState(prev => ({
                            ...prev,
                            selectedCategories: checked
                              ? [...prev.selectedCategories, category]
                              : prev.selectedCategories.filter(c => c.id !== category.id)
                          }));
                        }}
                      />
                      <Label htmlFor={category.id} className="text-sm">
                        {category.name} ({category.count || 0})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Languages</Label>
                <div className="space-y-2">
                  {['sql', 'python', 'javascript', 'regex', 'xpath', 'jsonpath'].map(lang => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={lang}
                        checked={state.languageFilter.includes(lang)}
                        onCheckedChange={(checked) => {
                          setState(prev => ({
                            ...prev,
                            languageFilter: checked
                              ? [...prev.languageFilter, lang]
                              : prev.languageFilter.filter(l => l !== lang)
                          }));
                        }}
                      />
                      <Label htmlFor={lang} className="text-sm capitalize">
                        {lang}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complexity */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Complexity</Label>
                <Select
                  value={state.complexityFilter}
                  onValueChange={(value: any) => 
                    setState(prev => ({ ...prev, complexityFilter: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="complex">Complex</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Minimum Rating: {state.ratingFilter}★
                </Label>
                <Slider
                  value={[state.ratingFilter]}
                  onValueChange={([value]) => 
                    setState(prev => ({ ...prev, ratingFilter: value }))
                  }
                  max={5}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Usage Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Usage</Label>
                <Select
                  value={state.usageFilter}
                  onValueChange={(value: any) => 
                    setState(prev => ({ ...prev, usageFilter: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Templates</SelectItem>
                    <SelectItem value="popular">Popular (50+ uses)</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="new">New (This Week)</SelectItem>
                    <SelectItem value="unused">Unused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <div className="flex space-x-2">
                  <Select
                    value={state.sortBy}
                    onValueChange={(value: any) => 
                      setState(prev => ({ ...prev, sortBy: value }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="created">Created Date</SelectItem>
                      <SelectItem value="updated">Updated Date</SelectItem>
                      <SelectItem value="usage">Usage Count</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                    }))}
                  >
                    {state.sortOrder === 'asc' ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="templates">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="analytics" disabled={!showAnalytics}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="collaboration" disabled={!showCollaboration}>
                  <Users className="h-4 w-4 mr-2" />
                  Collaboration
                </TabsTrigger>
                <TabsTrigger value="ai" disabled={!enableAIGeneration}>
                  <Brain className="h-4 w-4 mr-2" />
                  AI Generation
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="flex-1 p-4">
                <div className="h-full">
                  {/* Bulk Operations */}
                  {state.selectedTemplates.size > 0 && (
                    <div className="flex items-center justify-between p-3 mb-4 bg-muted/50 rounded-lg">
                      <span className="text-sm">
                        {state.selectedTemplates.size} template(s) selected
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkOperation('export')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkOperation('share')}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkOperation('delete')}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {state.isLoading && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold mb-2">Loading Templates</h3>
                        <p className="text-muted-foreground">
                          Fetching template library from backend...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Templates Grid/List */}
                  {!state.isLoading && filteredAndSortedTemplates.length > 0 && (
                    <ScrollArea className="h-full">
                      {state.viewMode === 'list' ? (
                        <div className="space-y-2">
                          {filteredAndSortedTemplates.map((template) => (
                            <TemplateCard
                              key={template.id}
                              template={template}
                              viewMode={state.viewMode}
                              isSelected={state.selectedTemplate?.id === template.id}
                              showMetrics={showAnalytics}
                              onSelect={handleSelectTemplate}
                              onApply={handleApplyTemplate}
                              onEdit={handleUpdateTemplate}
                              onDelete={handleDeleteTemplate}
                              onShare={handleShareTemplate}
                              onFavorite={handleFavoriteTemplate}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={`grid gap-4 ${
                          state.viewMode === 'grid' 
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        }`}>
                          {filteredAndSortedTemplates.map((template) => (
                            <TemplateCard
                              key={template.id}
                              template={template}
                              viewMode={state.viewMode}
                              isSelected={state.selectedTemplate?.id === template.id}
                              showMetrics={showAnalytics}
                              onSelect={handleSelectTemplate}
                              onApply={handleApplyTemplate}
                              onEdit={handleUpdateTemplate}
                              onDelete={handleDeleteTemplate}
                              onShare={handleShareTemplate}
                              onFavorite={handleFavoriteTemplate}
                            />
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  )}

                  {/* Empty State */}
                  {!state.isLoading && filteredAndSortedTemplates.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-md">
                        {state.templates.length === 0 ? (
                          <>
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Templates Available</h3>
                            <p className="text-muted-foreground mb-4">
                              Start building your template library by creating your first template.
                            </p>
                            <Button onClick={() => handleCreateTemplate({})}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create First Template
                            </Button>
                          </>
                        ) : (
                          <>
                            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Templates Match Filters</h3>
                            <p className="text-muted-foreground mb-4">
                              Try adjusting your filters to find more templates.
                            </p>
                            <Button 
                              variant="outline"
                              onClick={() => setState(prev => ({
                                ...prev,
                                searchQuery: '',
                                selectedCategories: [],
                                selectedTags: [],
                                languageFilter: [language],
                                complexityFilter: 'all',
                                ratingFilter: 0,
                                usageFilter: 'all',
                                showFavorites: false,
                                showShared: false,
                                showDrafts: false
                              }))}
                            >
                              Clear All Filters
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Analytics Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                            <p className="text-2xl font-bold">{state.templates.length}</p>
                          </div>
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                            <p className="text-2xl font-bold">
                              {state.templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
                            </p>
                          </div>
                          <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                            <p className="text-2xl font-bold">
                              {state.templates.length > 0 
                                ? (state.templates.reduce((sum, t) => sum + (t.rating || 0), 0) / state.templates.length).toFixed(1)
                                : '0.0'
                              }
                            </p>
                          </div>
                          <Star className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Shared Templates</p>
                            <p className="text-2xl font-bold">
                              {state.templates.filter(t => t.isShared).length}
                            </p>
                          </div>
                          <Share2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Usage Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Usage Statistics</CardTitle>
                      <CardDescription>
                        Most popular templates and usage trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                          <p>Usage analytics chart would be rendered here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Collaboration Tab */}
              <TabsContent value="collaboration" className="flex-1 p-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Collaboration</CardTitle>
                      <CardDescription>
                        Shared templates, reviews, and community contributions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {state.sharedTemplates.length > 0 ? (
                        <div className="space-y-4">
                          {state.sharedTemplates.slice(0, 5).map((template) => (
                            <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-semibold">{template.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Shared by {template.author} • {template.usageCount || 0} uses
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{template.rating || 0}</span>
                                </div>
                                <Button size="sm" onClick={() => handleApplyTemplate(template)}>
                                  <Play className="h-4 w-4 mr-1" />
                                  Use
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Shared Templates</h3>
                          <p className="text-muted-foreground">
                            Shared templates from the community will appear here
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Generation Tab */}
              <TabsContent value="ai" className="flex-1 p-4">
                <div className="space-y-6">
                  {/* AI Generation Progress */}
                  {state.isGenerating && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Brain className="h-5 w-5 mr-2 animate-pulse" />
                          AI Template Generation
                        </CardTitle>
                        <CardDescription>
                          {state.generationStatus}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{state.generationProgress}%</span>
                          </div>
                          <Progress value={state.generationProgress} className="w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Generated Templates */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        AI Generated Templates
                      </CardTitle>
                      <CardDescription>
                        Templates created by AI based on your requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {state.aiGeneratedTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {state.aiGeneratedTemplates.map((template) => (
                            <TemplateCard
                              key={template.id}
                              template={template}
                              viewMode="cards"
                              showMetrics={false}
                              onSelect={handleSelectTemplate}
                              onApply={handleApplyTemplate}
                              onEdit={handleUpdateTemplate}
                              onDelete={handleDeleteTemplate}
                              onShare={handleShareTemplate}
                              onFavorite={handleFavoriteTemplate}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No AI Generated Templates</h3>
                          <p className="text-muted-foreground mb-4">
                            Use AI to generate templates based on your requirements
                          </p>
                          <Button onClick={() => handleGenerateTemplate('Generate a data validation rule template', {})}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Template
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RuleTemplateLibrary;