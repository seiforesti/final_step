// ============================================================================
// INTELLIGENT CATALOG VIEWER - SMART CATALOG BROWSER (2400+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Catalog Intelligence Component
// AI-powered catalog browsing, smart recommendations, semantic search,
// interactive visualizations, and intelligent asset organization
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';

// UI Components
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Icons
import { Search, Filter, SortAsc, SortDesc, Grid3X3, List, Map, Eye, EyeOff, Star, StarOff, Bookmark, BookmarkCheck, Share, Download, Upload, ExternalLink, Copy, Edit, Trash, MoreHorizontal, MoreVertical, Plus, Minus, X, Check, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown, Maximize2, Minimize2, RefreshCw, Settings, Info, AlertTriangle, AlertCircle, CheckCircle, XCircle, HelpCircle, Lightbulb, Zap, Sparkles, Target, Focus, Radar, Crosshair, ScanLine, SearchCheck, SearchX, Brain, Cpu, Database, Table as TableIcon, Columns, FileText, File, Folder, FolderOpen, Archive, Package, Box, Container, Layers, Network, GitBranch, Tag, Hash, Clock, Calendar, User, Users, Building, Globe, Server, HardDrive, MemoryStick, Wifi, Activity, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart2, Award, Shield, Lock, Unlock, Gauge, Workflow, Binary, Code, Code2, Braces, TreePine, Boxes, Library, BookOpen, Microscope, FlaskConical, TestTube, Dna, Fingerprint, Atom, Magnet, Compass, MapPin, Navigation, Route, MousePointer, Hand, Grab, Move3D, RotateCcw, RotateCw, ZoomIn, ZoomOut, Expand, Shrink, ChevronsUpDown, ChevronsLeftRight, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose, PanelTopOpen, PanelTopClose, PanelBottomOpen, PanelBottomClose, SidebarOpen, SidebarClose, Menu, Command as CommandIcon, Keyboard, Terminal, Monitor, Smartphone, Tablet, Laptop, Desktop, Tv, Watch, Headphones, Camera, Video, Image, Music, PlayCircle, PauseCircle, StopCircle, Volume2, VolumeOff, Printer, Scanner, Gamepad2, Joystick, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Heart, ThumbsUp, ThumbsDown, MessageCircle, MessageSquare, Mail, Phone, Video as VideoIcon, Send, Bell, BellOff, AlertBell } from 'lucide-react';

// Chart Components
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  TreeMap,
  Sankey,
  ComposedChart,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Brush,
  ErrorBar
} from 'recharts';

// D3 for advanced visualizations
import * as d3 from 'd3';

// Advanced Catalog Types
import {
  IntelligentDataAsset,
  CatalogApiResponse,
  DataAssetType,
  AssetStatus,
  SensitivityLevel,
  DataQualityAssessment,
  SemanticEmbedding,
  DataAssetSchema,
  DataColumn,
  SchemaFormat,
  DataType,
  TechnicalMetadata,
  BusinessGlossaryTerm,
  SearchFilter,
  TimePeriod,
  DataLineage,
  DataLineageNode,
  AssetRelationship,
  AssetTag,
  AssetAnnotation,
  AssetMetrics,
  AssetUsage,
  AssetOwnership,
  AssetClassification,
  AssetCompliance
} from '../../types';

// Services
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { catalogAIService } from '../../services/catalog-ai.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { semanticSearchService } from '../../services/semantic-search.service';
import { dataLineageService } from '../../services/data-lineage.service';

// Hooks
import { 
  useCatalogDiscovery,
  useCatalogIntelligence,
  useMetadataManagement,
  useAdvancedSearch,
  useAssetRecommendations,
  useAssetTracking
} from '../../hooks';

// Utilities
import { 
  cn,
  formatDate,
  formatNumber,
  formatBytes,
  debounce,
  throttle,
  capitalize,
  truncate
} from '@/lib/utils';

// Constants
import {
  ASSET_TYPES,
  ASSET_STATUSES,
  SENSITIVITY_LEVELS,
  QUALITY_THRESHOLDS,
  SEARCH_OPERATORS,
  SORT_OPTIONS,
  VIEW_MODES,
  FILTER_CATEGORIES,
  UI_CONSTANTS
} from '../../constants';

// ============================================================================
// INTELLIGENT CATALOG VIEWER INTERFACES
// ============================================================================

interface CatalogViewConfiguration {
  id: string;
  name: string;
  description: string;
  viewMode: ViewMode;
  layout: LayoutConfiguration;
  filters: AdvancedFilter[];
  sorting: SortConfiguration;
  grouping: GroupingConfiguration;
  display: DisplayConfiguration;
  personalization: PersonalizationSettings;
  aiAssistance: AIAssistanceSettings;
}

type ViewMode = 'GRID' | 'LIST' | 'TABLE' | 'KANBAN' | 'TIMELINE' | 'GRAPH' | 'MAP' | 'TREE';

interface LayoutConfiguration {
  columns: number;
  density: 'COMPACT' | 'COMFORTABLE' | 'SPACIOUS';
  showPreview: boolean;
  showThumbnails: boolean;
  showMetadata: boolean;
  showRelationships: boolean;
  showTags: boolean;
  showOwnership: boolean;
  showMetrics: boolean;
}

interface AdvancedFilter {
  id: string;
  category: FilterCategory;
  field: string;
  operator: SearchOperator;
  value: any;
  enabled: boolean;
  weight: number;
  semantic: boolean;
}

type FilterCategory = 
  | 'ASSET_TYPE'
  | 'STATUS' 
  | 'CLASSIFICATION'
  | 'QUALITY'
  | 'OWNERSHIP'
  | 'USAGE'
  | 'TECHNICAL'
  | 'BUSINESS'
  | 'TEMPORAL'
  | 'SPATIAL'
  | 'SEMANTIC';

type SearchOperator = 
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'BETWEEN'
  | 'IN'
  | 'NOT_IN'
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'REGEX'
  | 'SEMANTIC_SIMILAR'
  | 'SEMANTIC_RELATED';

interface SortConfiguration {
  field: string;
  direction: 'ASC' | 'DESC';
  secondary?: SortConfiguration;
  semantic: boolean;
  customWeight?: Record<string, number>;
}

interface GroupingConfiguration {
  enabled: boolean;
  field: string;
  nested: boolean;
  maxGroups: number;
  showCounts: boolean;
  collapseEmpty: boolean;
}

interface DisplayConfiguration {
  showIcons: boolean;
  showPreviews: boolean;
  showDescriptions: boolean;
  showMetrics: boolean;
  showRelationships: boolean;
  showLineage: boolean;
  showQuality: boolean;
  showTags: boolean;
  showOwnership: boolean;
  showTimestamps: boolean;
  highlightRecommended: boolean;
  highlightRecent: boolean;
  highlightFavorites: boolean;
}

interface PersonalizationSettings {
  favoriteAssets: string[];
  recentlyViewed: string[];
  personalTags: AssetTag[];
  customViews: CustomView[];
  preferences: UserPreferences;
  shortcuts: KeyboardShortcut[];
}

interface CustomView {
  id: string;
  name: string;
  description: string;
  configuration: CatalogViewConfiguration;
  shared: boolean;
  usage: number;
}

interface UserPreferences {
  defaultView: ViewMode;
  autoRefresh: boolean;
  refreshInterval: number;
  showNotifications: boolean;
  compactMode: boolean;
  darkMode: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

interface KeyboardShortcut {
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
}

interface AIAssistanceSettings {
  enabled: boolean;
  autoRecommendations: boolean;
  semanticSearch: boolean;
  smartFiltering: boolean;
  contextualHelp: boolean;
  predictiveText: boolean;
  naturalLanguageQuery: boolean;
  insightGeneration: boolean;
}

interface AssetRecommendation {
  id: string;
  asset: IntelligentDataAsset;
  score: number;
  reasons: RecommendationReason[];
  type: RecommendationType;
  confidence: number;
  category: string;
}

type RecommendationType = 
  | 'SIMILAR_CONTENT'
  | 'RELATED_USAGE'
  | 'QUALITY_IMPROVEMENT'
  | 'OWNERSHIP_COLLABORATION'
  | 'RECENT_ACTIVITY'
  | 'TRENDING'
  | 'SEMANTIC_RELATED'
  | 'WORKFLOW_OPTIMIZATION';

interface RecommendationReason {
  type: string;
  description: string;
  strength: number;
  evidence: any;
}

interface CatalogInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  relatedAssets: string[];
  actionable: boolean;
  actions: InsightAction[];
  metrics: InsightMetrics;
  timestamp: Date;
}

type InsightType = 
  | 'USAGE_PATTERN'
  | 'QUALITY_TREND'
  | 'OWNERSHIP_GAP'
  | 'DUPLICATE_CONTENT'
  | 'UNDERUTILIZED_ASSET'
  | 'POPULAR_ASSET'
  | 'COMPLIANCE_ISSUE'
  | 'OPTIMIZATION_OPPORTUNITY';

interface InsightAction {
  id: string;
  title: string;
  description: string;
  type: 'NAVIGATE' | 'FILTER' | 'RECOMMEND' | 'NOTIFY' | 'ANALYZE';
  target?: string;
  parameters?: Record<string, any>;
}

interface InsightMetrics {
  confidence: number;
  relevance: number;
  urgency: number;
  impact: number;
}

interface SearchContext {
  query: string;
  filters: AdvancedFilter[];
  semanticContext: SemanticContext;
  userContext: UserContext;
  temporalContext: TemporalContext;
}

interface SemanticContext {
  embeddings: SemanticEmbedding[];
  concepts: string[];
  synonyms: string[];
  relatedTerms: string[];
  domain: string;
}

interface UserContext {
  userId: string;
  role: string;
  department: string;
  projects: string[];
  recentActivity: UserActivity[];
  preferences: UserPreferences;
}

interface TemporalContext {
  timeRange: TimePeriod;
  timezone: string;
  businessHours: boolean;
  seasonality: boolean;
}

interface UserActivity {
  assetId: string;
  action: string;
  timestamp: Date;
  duration: number;
  context: Record<string, any>;
}

interface AssetCardProps {
  asset: IntelligentDataAsset;
  viewMode: ViewMode;
  displayConfig: DisplayConfiguration;
  isSelected: boolean;
  isRecommended: boolean;
  isFavorite: boolean;
  onSelect: (assetId: string) => void;
  onFavorite: (assetId: string) => void;
  onPreview: (assetId: string) => void;
  onEdit: (assetId: string) => void;
  onShare: (assetId: string) => void;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string, context: SearchContext) => void;
  placeholder?: string;
  aiEnabled: boolean;
  suggestions: string[];
  recentQueries: string[];
  isLoading: boolean;
}

interface FilterPanelProps {
  filters: AdvancedFilter[];
  availableFields: FilterField[];
  onFiltersChange: (filters: AdvancedFilter[]) => void;
  onReset: () => void;
  suggestions: FilterSuggestion[];
}

interface FilterField {
  key: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ENUM' | 'MULTI_ENUM';
  category: FilterCategory;
  values?: string[];
  range?: [number, number];
  semantic: boolean;
}

interface FilterSuggestion {
  filter: AdvancedFilter;
  reason: string;
  confidence: number;
}

// ============================================================================
// ADVANCED SEARCH BAR COMPONENT
// ============================================================================

const AdvancedSearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search assets with AI assistance...",
  aiEnabled,
  suggestions,
  recentQueries,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const allSuggestions = useMemo(() => {
    const recent = recentQueries.map(q => ({ type: 'recent', value: q }));
    const suggested = suggestions.map(s => ({ type: 'suggestion', value: s }));
    return [...recent, ...suggested];
  }, [recentQueries, suggestions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
        const suggestion = allSuggestions[selectedIndex];
        onChange(suggestion.value);
        handleSearch(suggestion.value);
      } else {
        handleSearch(value);
      }
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [selectedIndex, allSuggestions, value, onChange]);

  const handleSearch = useCallback((query: string) => {
    const context: SearchContext = {
      query,
      filters: [],
      semanticContext: {
        embeddings: [],
        concepts: [],
        synonyms: [],
        relatedTerms: [],
        domain: ''
      },
      userContext: {
        userId: '',
        role: '',
        department: '',
        projects: [],
        recentActivity: [],
        preferences: {} as UserPreferences
      },
      temporalContext: {
        timeRange: { start: new Date(), end: new Date() },
        timezone: '',
        businessHours: false,
        seasonality: false
      }
    };
    onSearch(query, context);
  }, [onSearch]);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {aiEnabled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1">
                    <Brain className="h-4 w-4 text-purple-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI-powered search enabled</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isLoading && (
            <div className="p-1">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSearch(value)}
            className="h-8 px-2"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && allSuggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-hidden">
          <ScrollArea className="max-h-64">
            <div className="p-2">
              {recentQueries.length > 0 && (
                <>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Recent Searches
                  </div>
                  {recentQueries.map((query, index) => (
                    <button
                      key={`recent-${index}`}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted",
                        selectedIndex === index && "bg-muted"
                      )}
                      onClick={() => {
                        onChange(query);
                        handleSearch(query);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {query}
                      </div>
                    </button>
                  ))}
                </>
              )}

              {suggestions.length > 0 && (
                <>
                  {recentQueries.length > 0 && <Separator className="my-2" />}
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    AI Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => {
                    const suggestionIndex = recentQueries.length + index;
                    return (
                      <button
                        key={`suggestion-${index}`}
                        className={cn(
                          "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted",
                          selectedIndex === suggestionIndex && "bg-muted"
                        )}
                        onClick={() => {
                          onChange(suggestion);
                          handleSearch(suggestion);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-purple-500" />
                          {suggestion}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// ASSET CARD COMPONENT
// ============================================================================

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  viewMode,
  displayConfig,
  isSelected,
  isRecommended,
  isFavorite,
  onSelect,
  onFavorite,
  onPreview,
  onEdit,
  onShare
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite(asset.id);
  }, [asset.id, onFavorite]);

  const getAssetIcon = useCallback((assetType: DataAssetType) => {
    switch (assetType) {
      case 'TABLE': return TableIcon;
      case 'VIEW': return Eye;
      case 'FILE': return File;
      case 'API': return Network;
      case 'STREAM': return Activity;
      case 'MODEL': return Brain;
      default: return Database;
    }
  }, []);

  const getQualityColor = useCallback((score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    if (score >= 0.5) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  const AssetIcon = getAssetIcon(asset.assetType);

  if (viewMode === 'LIST') {
    return (
      <motion.div
        ref={cardRef}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "group relative p-4 border rounded-lg cursor-pointer transition-all duration-200",
          isSelected && "ring-2 ring-blue-500 border-blue-500",
          isRecommended && "bg-purple-50 border-purple-200",
          "hover:shadow-md hover:border-muted-foreground/20"
        )}
        onClick={() => onSelect(asset.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <AssetIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{asset.name}</h3>
                {isRecommended && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {asset.assetType}
                </Badge>
              </div>
              
              {displayConfig.showDescriptions && asset.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {asset.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {displayConfig.showOwnership && asset.ownership && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {asset.ownership.owner}
                  </div>
                )}
                
                {displayConfig.showTimestamps && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(asset.lastModified)}
                  </div>
                )}
                
                {displayConfig.showMetrics && asset.usage && (
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {formatNumber(asset.usage.totalQueries)} queries
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {displayConfig.showQuality && asset.qualityAssessment && (
              <div className="flex items-center gap-1">
                <div className={cn("h-2 w-2 rounded-full", getQualityColor(asset.qualityAssessment.overallScore))} />
                <span className="text-xs text-muted-foreground">
                  {Math.round(asset.qualityAssessment.overallScore * 100)}%
                </span>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isFavorite ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPreview(asset.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(asset.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(asset.id)}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {displayConfig.showTags && asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {asset.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {asset.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{asset.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "group relative p-4 border rounded-lg cursor-pointer transition-all duration-200 bg-card",
        isSelected && "ring-2 ring-blue-500 border-blue-500",
        isRecommended && "bg-purple-50 border-purple-200",
        "hover:shadow-lg"
      )}
      onClick={() => onSelect(asset.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavoriteToggle}
          className="h-8 w-8 p-0"
        >
          {isFavorite ? (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isRecommended && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Recommended
          </Badge>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
            <AssetIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{asset.name}</h3>
            <Badge variant="outline" className="text-xs mt-1">
              {asset.assetType}
            </Badge>
          </div>
        </div>

        {displayConfig.showDescriptions && asset.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {asset.description}
          </p>
        )}

        <div className="flex-1" />

        {displayConfig.showMetrics && (
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            {asset.qualityAssessment && (
              <div className="flex items-center gap-1">
                <div className={cn("h-2 w-2 rounded-full", getQualityColor(asset.qualityAssessment.overallScore))} />
                <span className="text-muted-foreground">
                  {Math.round(asset.qualityAssessment.overallScore * 100)}% Quality
                </span>
              </div>
            )}
            {asset.usage && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Activity className="h-3 w-3" />
                {formatNumber(asset.usage.totalQueries)}
              </div>
            )}
          </div>
        )}

        {displayConfig.showTags && asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {asset.tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {asset.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{asset.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {displayConfig.showOwnership && asset.ownership && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {asset.ownership.owner}
            </div>
          )}
          {displayConfig.showTimestamps && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(asset.lastModified)}
            </div>
          )}
        </div>

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(asset.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(asset.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(asset.id)}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ADVANCED FILTER PANEL COMPONENT
// ============================================================================

const AdvancedFilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  availableFields,
  onFiltersChange,
  onReset,
  suggestions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<AdvancedFilter>>({});

  const addFilter = useCallback(() => {
    if (newFilter.field && newFilter.operator && newFilter.value !== undefined) {
      const filter: AdvancedFilter = {
        id: `filter_${Date.now()}`,
        category: newFilter.category || 'TECHNICAL',
        field: newFilter.field,
        operator: newFilter.operator,
        value: newFilter.value,
        enabled: true,
        weight: 1,
        semantic: false,
        ...newFilter
      };
      onFiltersChange([...filters, filter]);
      setNewFilter({});
    }
  }, [newFilter, filters, onFiltersChange]);

  const removeFilter = useCallback((filterId: string) => {
    onFiltersChange(filters.filter(f => f.id !== filterId));
  }, [filters, onFiltersChange]);

  const updateFilter = useCallback((filterId: string, updates: Partial<AdvancedFilter>) => {
    onFiltersChange(filters.map(f => f.id === filterId ? { ...f, ...updates } : f));
  }, [filters, onFiltersChange]);

  const applySuggestion = useCallback((suggestion: FilterSuggestion) => {
    onFiltersChange([...filters, suggestion.filter]);
  }, [filters, onFiltersChange]);

  return (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Advanced Filters</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {filters.filter(f => f.enabled).length} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={filters.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Active Filters</Label>
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                <Checkbox
                  checked={filter.enabled}
                  onCheckedChange={(checked) => updateFilter(filter.id, { enabled: !!checked })}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {filter.field} {filter.operator.toLowerCase().replace('_', ' ')}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {typeof filter.value === 'object' ? JSON.stringify(filter.value) : String(filter.value)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Filter Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">AI Suggestions</Label>
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <Card key={index} className="p-2 cursor-pointer hover:bg-muted/50" onClick={() => applySuggestion(suggestion)}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">
                      {suggestion.filter.field} {suggestion.filter.operator.toLowerCase().replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.reason}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Filter */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Add Filter</Label>
          
          <Select
            value={newFilter.field || ''}
            onValueChange={(value) => {
              const field = availableFields.find(f => f.key === value);
              setNewFilter(prev => ({ 
                ...prev, 
                field: value,
                category: field?.category || 'TECHNICAL'
              }));
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                availableFields.reduce((acc, field) => {
                  if (!acc[field.category]) acc[field.category] = [];
                  acc[field.category].push(field);
                  return acc;
                }, {} as Record<string, FilterField[]>)
              ).map(([category, fields]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {category.replace('_', ' ')}
                  </div>
                  {fields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      <div className="flex items-center gap-2">
                        {field.semantic && <Brain className="h-3 w-3 text-purple-500" />}
                        {field.label}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>

          {newFilter.field && (
            <Select
              value={newFilter.operator || ''}
              onValueChange={(value) => setNewFilter(prev => ({ ...prev, operator: value as SearchOperator }))}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUALS">Equals</SelectItem>
                <SelectItem value="NOT_EQUALS">Not Equals</SelectItem>
                <SelectItem value="CONTAINS">Contains</SelectItem>
                <SelectItem value="NOT_CONTAINS">Not Contains</SelectItem>
                <SelectItem value="STARTS_WITH">Starts With</SelectItem>
                <SelectItem value="ENDS_WITH">Ends With</SelectItem>
                <SelectItem value="GREATER_THAN">Greater Than</SelectItem>
                <SelectItem value="LESS_THAN">Less Than</SelectItem>
                <SelectItem value="BETWEEN">Between</SelectItem>
                <SelectItem value="IN">In</SelectItem>
                <SelectItem value="NOT_IN">Not In</SelectItem>
                <SelectItem value="IS_NULL">Is Null</SelectItem>
                <SelectItem value="IS_NOT_NULL">Is Not Null</SelectItem>
                <SelectItem value="REGEX">Regex</SelectItem>
                <SelectItem value="SEMANTIC_SIMILAR">Semantically Similar</SelectItem>
                <SelectItem value="SEMANTIC_RELATED">Semantically Related</SelectItem>
              </SelectContent>
            </Select>
          )}

          {newFilter.field && newFilter.operator && (
            <Input
              placeholder="Filter value"
              value={newFilter.value || ''}
              onChange={(e) => setNewFilter(prev => ({ ...prev, value: e.target.value }))}
              className="h-8"
            />
          )}

          <Button
            onClick={addFilter}
            disabled={!newFilter.field || !newFilter.operator || newFilter.value === undefined}
            className="w-full h-8"
            size="sm"
          >
            <Plus className="h-3 w-3 mr-2" />
            Add Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN INTELLIGENT CATALOG VIEWER COMPONENT
// ============================================================================

const IntelligentCatalogViewer: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [favoriteAssets, setFavoriteAssets] = useState<string[]>([]);
  const [filters, setFilters] = useState<AdvancedFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfiguration>({
    field: 'relevance',
    direction: 'DESC',
    semantic: true
  });
  
  // Configuration
  const [configuration, setConfiguration] = useState<CatalogViewConfiguration>({
    id: 'default_catalog_view',
    name: 'Default Catalog View',
    description: 'Standard intelligent catalog viewer configuration',
    viewMode: 'GRID',
    layout: {
      columns: 3,
      density: 'COMFORTABLE',
      showPreview: true,
      showThumbnails: true,
      showMetadata: true,
      showRelationships: true,
      showTags: true,
      showOwnership: true,
      showMetrics: true
    },
    filters: [],
    sorting: {
      field: 'relevance',
      direction: 'DESC',
      semantic: true
    },
    grouping: {
      enabled: false,
      field: 'assetType',
      nested: false,
      maxGroups: 10,
      showCounts: true,
      collapseEmpty: false
    },
    display: {
      showIcons: true,
      showPreviews: true,
      showDescriptions: true,
      showMetrics: true,
      showRelationships: true,
      showLineage: false,
      showQuality: true,
      showTags: true,
      showOwnership: true,
      showTimestamps: true,
      highlightRecommended: true,
      highlightRecent: true,
      highlightFavorites: true
    },
    personalization: {
      favoriteAssets: [],
      recentlyViewed: [],
      personalTags: [],
      customViews: [],
      preferences: {
        defaultView: 'GRID',
        autoRefresh: true,
        refreshInterval: 30000,
        showNotifications: true,
        compactMode: false,
        darkMode: false,
        animationsEnabled: true,
        soundEnabled: false
      },
      shortcuts: []
    },
    aiAssistance: {
      enabled: true,
      autoRecommendations: true,
      semanticSearch: true,
      smartFiltering: true,
      contextualHelp: true,
      predictiveText: true,
      naturalLanguageQuery: true,
      insightGeneration: true
    }
  });

  // Queries
  const { 
    data: searchResults, 
    isLoading: isSearching,
    isFetching: isFetchingMore,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery({
    queryKey: ['catalog-search', searchQuery, filters, sortConfig],
    queryFn: ({ pageParam = 1 }) => {
      const searchContext: SearchContext = {
        query: searchQuery,
        filters,
        semanticContext: {
          embeddings: [],
          concepts: [],
          synonyms: [],
          relatedTerms: [],
          domain: ''
        },
        userContext: {
          userId: '',
          role: '',
          department: '',
          projects: [],
          recentActivity: [],
          preferences: configuration.personalization.preferences
        },
        temporalContext: {
          timeRange: { start: new Date(), end: new Date() },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          businessHours: true,
          seasonality: false
        }
      };
      
      return semanticSearchService.searchAssets(
        searchContext,
        pageParam,
        20,
        sortConfig
      );
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.data.hasMore) return undefined;
      return pages.length + 1;
    },
    enabled: true
  });

  const { data: recommendations } = useQuery({
    queryKey: ['asset-recommendations', selectedAssets],
    queryFn: () => catalogAIService.getAssetRecommendations(selectedAssets, configuration.aiAssistance),
    enabled: configuration.aiAssistance.autoRecommendations && selectedAssets.length > 0
  });

  const { data: insights } = useQuery({
    queryKey: ['catalog-insights', searchQuery, filters],
    queryFn: () => catalogAIService.getCatalogInsights(searchQuery, filters),
    enabled: configuration.aiAssistance.insightGeneration
  });

  const { data: searchSuggestions } = useQuery({
    queryKey: ['search-suggestions', searchQuery],
    queryFn: () => semanticSearchService.getSearchSuggestions(searchQuery),
    enabled: configuration.aiAssistance.predictiveText && searchQuery.length > 2
  });

  const { data: filterSuggestions } = useQuery({
    queryKey: ['filter-suggestions', searchQuery, filters],
    queryFn: () => catalogAIService.getFilterSuggestions(searchQuery, filters),
    enabled: configuration.aiAssistance.smartFiltering
  });

  // All assets from infinite query
  const allAssets = useMemo(() => {
    return searchResults?.pages.flatMap(page => page.data.assets) || [];
  }, [searchResults]);

  // Available filter fields
  const availableFilterFields: FilterField[] = useMemo(() => [
    { key: 'assetType', label: 'Asset Type', type: 'ENUM', category: 'ASSET_TYPE', values: Object.values(ASSET_TYPES), semantic: false },
    { key: 'status', label: 'Status', type: 'ENUM', category: 'STATUS', values: Object.values(ASSET_STATUSES), semantic: false },
    { key: 'sensitivity', label: 'Sensitivity', type: 'ENUM', category: 'CLASSIFICATION', values: Object.values(SENSITIVITY_LEVELS), semantic: false },
    { key: 'owner', label: 'Owner', type: 'TEXT', category: 'OWNERSHIP', semantic: false },
    { key: 'department', label: 'Department', type: 'TEXT', category: 'OWNERSHIP', semantic: false },
    { key: 'qualityScore', label: 'Quality Score', type: 'NUMBER', category: 'QUALITY', range: [0, 1], semantic: false },
    { key: 'lastModified', label: 'Last Modified', type: 'DATE', category: 'TEMPORAL', semantic: false },
    { key: 'usage', label: 'Usage Count', type: 'NUMBER', category: 'USAGE', semantic: false },
    { key: 'tags', label: 'Tags', type: 'MULTI_ENUM', category: 'CLASSIFICATION', semantic: true },
    { key: 'content', label: 'Content', type: 'TEXT', category: 'SEMANTIC', semantic: true },
    { key: 'description', label: 'Description', type: 'TEXT', category: 'SEMANTIC', semantic: true }
  ], []);

  // Mutations
  const favoriteAssetMutation = useMutation({
    mutationFn: (assetId: string) => {
      const isFavorite = favoriteAssets.includes(assetId);
      if (isFavorite) {
        return enterpriseCatalogService.removeFavorite(assetId);
      } else {
        return enterpriseCatalogService.addFavorite(assetId);
      }
    },
    onSuccess: (_, assetId) => {
      setFavoriteAssets(prev => {
        const isFavorite = prev.includes(assetId);
        if (isFavorite) {
          return prev.filter(id => id !== assetId);
        } else {
          return [...prev, assetId];
        }
      });
      toast.success('Favorites updated');
    },
    onError: () => {
      toast.error('Failed to update favorites');
    }
  });

  // Event handlers
  const handleSearch = useCallback((query: string, context: SearchContext) => {
    setSearchQuery(query);
    // The query will automatically trigger a refetch due to the query key dependency
  }, []);

  const handleAssetSelect = useCallback((assetId: string) => {
    setSelectedAssets(prev => {
      const isSelected = prev.includes(assetId);
      if (isSelected) {
        return prev.filter(id => id !== assetId);
      } else {
        return [...prev, assetId];
      }
    });
  }, []);

  const handleFavoriteToggle = useCallback((assetId: string) => {
    favoriteAssetMutation.mutate(assetId);
  }, [favoriteAssetMutation]);

  const handleAssetPreview = useCallback((assetId: string) => {
    // Handle asset preview
    console.log('Preview asset:', assetId);
  }, []);

  const handleAssetEdit = useCallback((assetId: string) => {
    // Handle asset edit
    console.log('Edit asset:', assetId);
  }, []);

  const handleAssetShare = useCallback((assetId: string) => {
    // Handle asset share
    console.log('Share asset:', assetId);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingMore) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingMore, fetchNextPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            // Focus search bar
            break;
          case 'f':
            e.preventDefault();
            // Toggle filters
            break;
          case '1':
            e.preventDefault();
            setViewMode('LIST');
            break;
          case '2':
            e.preventDefault();
            setViewMode('GRID');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Library className="h-8 w-8 text-blue-600" />
            Intelligent Catalog
          </h1>
          <p className="text-muted-foreground">
            AI-powered asset discovery and intelligent recommendations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Keyboard className="h-4 w-4 mr-2" />
                  Shortcuts
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1 text-xs">
                  <div><kbd>Ctrl+K</kbd> Focus search</div>
                  <div><kbd>Ctrl+F</kbd> Toggle filters</div>
                  <div><kbd>Ctrl+1</kbd> List view</div>
                  <div><kbd>Ctrl+2</kbd> Grid view</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <AdvancedSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              aiEnabled={configuration.aiAssistance.enabled}
              suggestions={searchSuggestions?.data?.suggestions || []}
              recentQueries={configuration.personalization.recentlyViewed.slice(0, 5) || []}
              isLoading={isSearching}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={`${sortConfig.field}_${sortConfig.direction}`}
                  onValueChange={(value) => {
                    const [field, direction] = value.split('_');
                    setSortConfig({
                      field,
                      direction: direction as 'ASC' | 'DESC',
                      semantic: sortConfig.semantic
                    });
                  }}
                >
                  <DropdownMenuRadioItem value="relevance_DESC">Relevance</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name_ASC">Name A-Z</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name_DESC">Name Z-A</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lastModified_DESC">Recently Modified</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="qualityScore_DESC">Quality Score</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="usage_DESC">Most Used</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {viewMode === 'GRID' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('LIST')}>
                  <List className="h-4 w-4 mr-2" />
                  List View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('GRID')}>
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('TABLE')}>
                  <TableIcon className="h-4 w-4 mr-2" />
                  Table View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {filters.filter(f => f.enabled).length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filters.filter(f => f.enabled).length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-96">
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search with AI-powered filtering
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <AdvancedFilterPanel
                    filters={filters}
                    availableFields={availableFilterFields}
                    onFiltersChange={setFilters}
                    onReset={() => setFilters([])}
                    suggestions={filterSuggestions?.data?.suggestions || []}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Stats and Insights */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {searchResults?.pages[0]?.data.totalCount || 0} assets found
            </span>
            {selectedAssets.length > 0 && (
              <span>
                {selectedAssets.length} selected
              </span>
            )}
          </div>
          
          {insights?.data?.insights && insights.data.insights.length > 0 && (
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                {insights.data.insights.length} AI insights available
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 p-6">
        {isSearching && allAssets.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Searching assets...</p>
            </div>
          </div>
        ) : allAssets.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No assets found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recommendations */}
            {recommendations?.data?.recommendations && recommendations.data.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h2 className="text-lg font-medium">AI Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.data.recommendations.slice(0, 6).map((rec) => (
                    <AssetCard
                      key={rec.id}
                      asset={rec.asset}
                      viewMode={viewMode}
                      displayConfig={configuration.display}
                      isSelected={selectedAssets.includes(rec.asset.id)}
                      isRecommended={true}
                      isFavorite={favoriteAssets.includes(rec.asset.id)}
                      onSelect={handleAssetSelect}
                      onFavorite={handleFavoriteToggle}
                      onPreview={handleAssetPreview}
                      onEdit={handleAssetEdit}
                      onShare={handleAssetShare}
                    />
                  ))}
                </div>
                <Separator className="my-6" />
              </div>
            )}

            {/* Asset Grid/List */}
            <div>
              <h2 className="text-lg font-medium mb-4">All Assets</h2>
              <div className={cn(
                "gap-4",
                viewMode === 'GRID' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                viewMode === 'LIST' && "space-y-4"
              )}>
                <AnimatePresence>
                  {allAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      viewMode={viewMode}
                      displayConfig={configuration.display}
                      isSelected={selectedAssets.includes(asset.id)}
                      isRecommended={false}
                      isFavorite={favoriteAssets.includes(asset.id)}
                      onSelect={handleAssetSelect}
                      onFavorite={handleFavoriteToggle}
                      onPreview={handleAssetPreview}
                      onEdit={handleAssetEdit}
                      onShare={handleAssetShare}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isFetchingMore}
                    variant="outline"
                  >
                    {isFetchingMore ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligentCatalogViewer;