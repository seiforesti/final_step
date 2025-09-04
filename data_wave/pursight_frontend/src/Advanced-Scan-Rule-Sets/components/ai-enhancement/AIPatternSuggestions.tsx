/**
 * AIPatternSuggestions Component
 * 
 * Advanced enterprise-grade ML-powered pattern recommendation system with
 * context-aware suggestions, performance-based optimization, and continuous
 * learning from user behavior patterns.
 * 
 * Features:
 * - ML-powered pattern recommendations with confidence scoring
 * - Context-aware suggestions based on rule content and environment
 * - Performance-based optimization with execution time prediction
 * - Learning from user behavior and feedback loops
 * - Real-time pattern matching and similarity analysis
 * - Advanced filtering and categorization
 * - Pattern effectiveness tracking and analytics
 * - Integration with rule designer and validation engine
 * - Collaborative pattern sharing and community insights
 * - Advanced visualization and pattern exploration
 * - Custom pattern generation with AI assistance
 * - Multi-language pattern support with cross-language insights
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

// Icons
import { Brain, Sparkles, Target, TrendingUp, TrendingDown, Zap, Star, ThumbsUp, ThumbsDown, BookOpen, Search, Filter, SortAsc, SortDesc, Eye, EyeOff, Copy, Share2, Download, Upload, Settings, MoreHorizontal, ChevronDown, ChevronRight, ChevronUp, Play, Pause, Square, RefreshCw, Clock, Timer, Activity, BarChart3, LineChart, PieChart, Gauge, Cpu, HardDrive, Network, Code, Database, Globe, FileText, Layers, Workflow, Puzzle, Link, Unlink, Lock, Unlock, Shield, AlertTriangle, AlertCircle, Info, CheckCircle, XCircle, Plus, Minus, Edit, Save, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize2, Minimize2, RotateCcw, History, GitBranch, Users, MessageSquare, Flag, Bookmark, Heart, Award, Lightbulb, Crosshair, Radar, Microscope, MapPin, Navigation, Compass, Route, Package, Box, Container, Server, Cloud, Smartphone, Tablet, Monitor, Laptop } from 'lucide-react';

// Hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { usePatternLibrary } from '../../hooks/usePatternLibrary';
import { useScanRules } from '../../hooks/useScanRules';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useValidation } from '../../hooks/useValidation';

// RBAC Integration
import { useScanRuleRBAC } from '../../utils/rbac-integration';

// Types
import type {
  Pattern,
  PatternSuggestion,
  PatternAnalysis,
  PatternMetrics,
  PatternCategory,
  PatternContext,
  PatternFeedback,
  PatternRecommendation,
  PatternOptimization,
  PatternInsight,
  PatternTrend,
  PatternUsage,
  PatternPerformance,
  PatternSimilarity,
  PatternCluster,
  PatternEvolution,
  MLModel,
  LearningFeedback,
  ContextualSuggestion,
  PerformanceOptimization,
  BehaviorAnalysis
} from '../../types/intelligence.types';

import type {
  ScanRule,
  RuleMetadata,
  RuleContext
} from '../../types/scan-rules.types';

// AI Pattern Suggestions Props
interface AIPatternSuggestionsProps {
  ruleContent?: string;
  language?: 'sql' | 'python' | 'javascript' | 'regex' | 'xpath' | 'jsonpath' | 'custom';
  context?: RuleContext;
  maxSuggestions?: number;
  enableLearning?: boolean;
  enablePerformanceOptimization?: boolean;
  enableCollaboration?: boolean;
  showAnalytics?: boolean;
  showInsights?: boolean;
  onPatternSelect?: (pattern: Pattern) => void;
  onPatternApply?: (pattern: Pattern) => void;
  onFeedback?: (feedback: PatternFeedback) => void;
  className?: string;
  // RBAC props
  rbac?: any;
  userContext?: any;
  accessLevel?: string;
}

// Pattern Suggestion State
interface PatternSuggestionState {
  // Core suggestion data
  suggestions: PatternSuggestion[];
  filteredSuggestions: PatternSuggestion[];
  selectedSuggestion: PatternSuggestion | null;
  appliedPatterns: Pattern[];
  
  // ML and analysis
  mlRecommendations: PatternRecommendation[];
  contextualSuggestions: ContextualSuggestion[];
  performanceOptimizations: PerformanceOptimization[];
  patternAnalysis: PatternAnalysis | null;
  patternMetrics: PatternMetrics | null;
  
  // Learning and feedback
  userFeedback: PatternFeedback[];
  behaviorAnalysis: BehaviorAnalysis | null;
  learningInsights: any[];
  adaptedSuggestions: PatternSuggestion[];
  
  // Pattern insights
  patternTrends: PatternTrend[];
  patternClusters: PatternCluster[];
  patternEvolution: PatternEvolution[];
  patternSimilarity: PatternSimilarity[];
  
  // Loading states
  isLoadingSuggestions: boolean;
  isAnalyzing: boolean;
  isOptimizing: boolean;
  isLearning: boolean;
  
  // UI state
  activeTab: string;
  searchQuery: string;
  selectedCategories: PatternCategory[];
  confidenceThreshold: number;
  performanceThreshold: number;
  sortBy: 'confidence' | 'performance' | 'usage' | 'recent' | 'similarity';
  sortOrder: 'asc' | 'desc';
  showAdvanced: boolean;
  expandedSections: Set<string>;
  
  // Filters
  languageFilter: string[];
  complexityFilter: 'all' | 'simple' | 'moderate' | 'complex' | 'advanced';
  usageFilter: 'all' | 'popular' | 'trending' | 'new' | 'recommended';
  performanceFilter: 'all' | 'fast' | 'optimized' | 'balanced' | 'comprehensive';
  
  // Analytics
  suggestionMetrics: {
    totalSuggestions: number;
    appliedCount: number;
    successRate: number;
    averageConfidence: number;
    averagePerformance: number;
    topCategories: PatternCategory[];
    trendingPatterns: Pattern[];
  };
  
  // Real-time updates
  realTimeMode: boolean;
  autoApply: boolean;
  continuousLearning: boolean;
  adaptiveThreshold: boolean;
}

// Pattern Suggestion Card Component
interface PatternSuggestionCardProps {
  suggestion: PatternSuggestion;
  isSelected?: boolean;
  onSelect?: (suggestion: PatternSuggestion) => void;
  onApply?: (suggestion: PatternSuggestion) => void;
  onFeedback?: (suggestion: PatternSuggestion, feedback: 'positive' | 'negative') => void;
  onView?: (suggestion: PatternSuggestion) => void;
  showDetails?: boolean;
}

const PatternSuggestionCard: React.FC<PatternSuggestionCardProps> = ({
  suggestion,
  isSelected = false,
  onSelect,
  onApply,
  onFeedback,
  onView,
  showDetails = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPerformanceIcon = (performance: number) => {
    if (performance >= 90) return <Zap className="h-4 w-4 text-green-500" />;
    if (performance >= 75) return <TrendingUp className="h-4 w-4 text-blue-500" />;
    if (performance >= 60) return <Activity className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${isHovered ? 'transform scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(suggestion)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                <Badge className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                  {suggestion.confidence}% confidence
                </Badge>
                {suggestion.isNew && (
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {suggestion.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {suggestion.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {suggestion.language}
                </Badge>
                <Badge variant="outline" className="text-xs flex items-center">
                  {getPerformanceIcon(suggestion.performanceScore)}
                  <span className="ml-1">{suggestion.performanceScore}%</span>
                </Badge>
                {suggestion.usage && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {suggestion.usage.count} uses
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 ml-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(suggestion);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onApply?.(suggestion)}>
                    <Play className="h-4 w-4 mr-2" />
                    Apply Pattern
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFeedback?.(suggestion, 'positive')}>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFeedback?.(suggestion, 'negative')}>
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Dislike
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Pattern
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save to Library
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Pattern Preview */}
          {suggestion.pattern && (
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Pattern:</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className={`bg-background p-2 rounded text-xs font-mono overflow-x-auto ${
                isExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'
              }`}>
                {suggestion.pattern.content}
              </div>
            </div>
          )}

          {/* Detailed Information */}
          {showDetails && isExpanded && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleContent className="space-y-3 mt-3 pt-3 border-t">
                {/* Performance Metrics */}
                {suggestion.metrics && (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Performance Metrics:</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Execution Time:</span>
                        <span>{suggestion.metrics.executionTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HardDrive Usage:</span>
                        <span>{suggestion.metrics.memoryUsage}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span>{suggestion.metrics.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complexity:</span>
                        <span>{suggestion.metrics.complexity}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Context Information */}
                {suggestion.context && (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Context:</Label>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {suggestion.context.dataTypes && (
                        <div>
                          <span className="font-medium">Data Types:</span>{' '}
                          {suggestion.context.dataTypes.join(', ')}
                        </div>
                      )}
                      {suggestion.context.useCase && (
                        <div>
                          <span className="font-medium">Use Case:</span>{' '}
                          {suggestion.context.useCase}
                        </div>
                      )}
                      {suggestion.context.domain && (
                        <div>
                          <span className="font-medium">Domain:</span>{' '}
                          {suggestion.context.domain}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Similar Patterns */}
                {suggestion.similarPatterns && suggestion.similarPatterns.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Similar Patterns:</Label>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.similarPatterns.slice(0, 3).map((similar, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {similar.title} ({Math.round(similar.similarity * 100)}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                {suggestion.aiInsights && suggestion.aiInsights.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">AI Insights:</Label>
                    <div className="space-y-1">
                      {suggestion.aiInsights.slice(0, 2).map((insight, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-start space-x-1">
                          <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFeedback?.(suggestion, 'positive');
                }}
                className="text-xs"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {suggestion.feedback?.likes || 0}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFeedback?.(suggestion, 'negative');
                }}
                className="text-xs"
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                {suggestion.feedback?.dislikes || 0}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {suggestion.lastUpdated ? new Date(suggestion.lastUpdated).toLocaleDateString() : 'Recent'}
              </span>
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply?.(suggestion);
                }}
                className="text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * AIPatternSuggestions Component Implementation
 */
export const AIPatternSuggestions: React.FC<AIPatternSuggestionsProps> = ({
  ruleContent = '',
  language = 'sql',
  context,
  maxSuggestions = 20,
  enableLearning = true,
  enablePerformanceOptimization = true,
  enableCollaboration = true,
  showAnalytics = true,
  showInsights = true,
  onPatternSelect,
  onPatternApply,
  onFeedback,
  className,
  rbac: propRbac,
  userContext: propUserContext,
  accessLevel: propAccessLevel
}) => {
  // RBAC Integration - use prop or hook
  const hookRbac = useScanRuleRBAC();
  const rbac = propRbac || hookRbac;
  const userContext = propUserContext || rbac.getUserContext();
  const accessLevel = propAccessLevel || rbac.getAccessLevel();
  // Hooks
  const {
    generatePatternSuggestions,
    analyzePatternContext,
    optimizePatternPerformance,
    getPatternInsights,
    getPatternTrends,
    clusterPatterns,
    learnFromFeedback,
    adaptSuggestions,
    mlRecommendations,
    contextualSuggestions,
    performanceOptimizations,
    patternAnalysis,
    behaviorAnalysis,
    loading: intelligenceLoading,
    error: intelligenceError
  } = useIntelligence();

  const {
    patterns,
    searchPatterns,
    getPatternsByCategory,
    analyzePatternSimilarity,
    getPatternMetrics,
    getPatternUsage,
    addPatternFeedback,
    getPatternEvolution,
    loading: patternsLoading
  } = usePatternLibrary();

  const {
    sharePattern,
    getPatternComments,
    addPatternComment,
    getPatternRatings,
    collaborationSession,
    loading: collabLoading
  } = useCollaboration();

  const {
    validatePattern,
    getValidationHistory,
    loading: validationLoading
  } = useValidation({
    enableRealtime: true,
    enableMetrics: true,
    enableCompliance: true,
    enableQuality: true
  });

  // State Management
  const [state, setState] = useState<PatternSuggestionState>({
    // Core suggestion data
    suggestions: [],
    filteredSuggestions: [],
    selectedSuggestion: null,
    appliedPatterns: [],
    
    // ML and analysis
    mlRecommendations: [],
    contextualSuggestions: [],
    performanceOptimizations: [],
    patternAnalysis: null,
    patternMetrics: null,
    
    // Learning and feedback
    userFeedback: [],
    behaviorAnalysis: null,
    learningInsights: [],
    adaptedSuggestions: [],
    
    // Pattern insights
    patternTrends: [],
    patternClusters: [],
    patternEvolution: [],
    patternSimilarity: [],
    
    // Loading states
    isLoadingSuggestions: false,
    isAnalyzing: false,
    isOptimizing: false,
    isLearning: false,
    
    // UI state
    activeTab: 'suggestions',
    searchQuery: '',
    selectedCategories: [],
    confidenceThreshold: 70,
    performanceThreshold: 60,
    sortBy: 'confidence',
    sortOrder: 'desc',
    showAdvanced: false,
    expandedSections: new Set(['filters']),
    
    // Filters
    languageFilter: [language],
    complexityFilter: 'all',
    usageFilter: 'all',
    performanceFilter: 'all',
    
    // Analytics
    suggestionMetrics: {
      totalSuggestions: 0,
      appliedCount: 0,
      successRate: 0,
      averageConfidence: 0,
      averagePerformance: 0,
      topCategories: [],
      trendingPatterns: []
    },
    
    // Real-time updates
    realTimeMode: true,
    autoApply: false,
    continuousLearning: enableLearning,
    adaptiveThreshold: true
  });

  // Refs
  const suggestionCacheRef = useRef<Map<string, PatternSuggestion[]>>(new Map());
  const learningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optimizationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Computed values
  const filteredAndSortedSuggestions = useMemo(() => {
    let filtered = state.suggestions;

    // Apply search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.pattern?.content.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter(s => 
        state.selectedCategories.some(cat => cat === s.category)
      );
    }

    // Apply confidence threshold
    filtered = filtered.filter(s => s.confidence >= state.confidenceThreshold);

    // Apply performance threshold
    filtered = filtered.filter(s => s.performanceScore >= state.performanceThreshold);

    // Apply language filter
    if (state.languageFilter.length > 0 && !state.languageFilter.includes('all')) {
      filtered = filtered.filter(s => state.languageFilter.includes(s.language));
    }

    // Apply complexity filter
    if (state.complexityFilter !== 'all') {
      filtered = filtered.filter(s => s.complexity === state.complexityFilter);
    }

    // Apply usage filter
    if (state.usageFilter !== 'all') {
      switch (state.usageFilter) {
        case 'popular':
          filtered = filtered.filter(s => s.usage && s.usage.count > 100);
          break;
        case 'trending':
          filtered = filtered.filter(s => s.isTrending);
          break;
        case 'new':
          filtered = filtered.filter(s => s.isNew);
          break;
        case 'recommended':
          filtered = filtered.filter(s => s.isRecommended);
          break;
      }
    }

    // Apply performance filter
    if (state.performanceFilter !== 'all') {
      switch (state.performanceFilter) {
        case 'fast':
          filtered = filtered.filter(s => s.performanceScore >= 90);
          break;
        case 'optimized':
          filtered = filtered.filter(s => s.performanceScore >= 80);
          break;
        case 'balanced':
          filtered = filtered.filter(s => s.performanceScore >= 70 && s.performanceScore < 80);
          break;
        case 'comprehensive':
          filtered = filtered.filter(s => s.performanceScore >= 60 && s.performanceScore < 70);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'performance':
          aValue = a.performanceScore;
          bValue = b.performanceScore;
          break;
        case 'usage':
          aValue = a.usage?.count || 0;
          bValue = b.usage?.count || 0;
          break;
        case 'recent':
          aValue = new Date(a.lastUpdated || 0).getTime();
          bValue = new Date(b.lastUpdated || 0).getTime();
          break;
        case 'similarity':
          aValue = a.similarity || 0;
          bValue = b.similarity || 0;
          break;
        default:
          aValue = a.confidence;
          bValue = b.confidence;
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Limit results
    return filtered.slice(0, maxSuggestions);
  }, [
    state.suggestions,
    state.searchQuery,
    state.selectedCategories,
    state.confidenceThreshold,
    state.performanceThreshold,
    state.languageFilter,
    state.complexityFilter,
    state.usageFilter,
    state.performanceFilter,
    state.sortBy,
    state.sortOrder,
    maxSuggestions
  ]);

  // Event Handlers
  const handleLoadSuggestions = useCallback(async (content?: string, forceRefresh = false) => {
    const currentContent = content || ruleContent;
    if (!currentContent.trim()) return;

    // Check cache first
    const cacheKey = `${language}-${hashContent(currentContent)}-${JSON.stringify(context)}`;
    if (!forceRefresh && suggestionCacheRef.current.has(cacheKey)) {
      const cached = suggestionCacheRef.current.get(cacheKey)!;
      setState(prev => ({
        ...prev,
        suggestions: cached,
        filteredSuggestions: cached
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoadingSuggestions: true }));

    try {
      // Generate ML-powered suggestions
      const suggestions = await generatePatternSuggestions({
        content: currentContent,
        language,
        context: context || {},
        maxSuggestions,
        confidenceThreshold: state.confidenceThreshold / 100,
        includePerformanceMetrics: enablePerformanceOptimization,
        includeContextualInfo: true,
        includeSimilarPatterns: true,
        includeAIInsights: showInsights
      });

      // Analyze pattern context
      const analysis = await analyzePatternContext({
        content: currentContent,
        language,
        suggestions,
        context: context || {}
      });

      // Get performance optimizations if enabled
      let optimizations: PerformanceOptimization[] = [];
      if (enablePerformanceOptimization) {
        optimizations = await optimizePatternPerformance({
          patterns: suggestions.map(s => s.pattern).filter(Boolean),
          context: context || {},
          targetMetrics: {
            executionTime: state.performanceThreshold,
            memoryUsage: 100,
            throughput: 1000
          }
        });
      }

      // Get contextual suggestions
      const contextual = await contextualSuggestions({
        content: currentContent,
        language,
        context: context || {},
        userBehavior: state.behaviorAnalysis
      });

      // Cache results
      suggestionCacheRef.current.set(cacheKey, suggestions);

      // Update state
      setState(prev => ({
        ...prev,
        suggestions,
        filteredSuggestions: suggestions,
        patternAnalysis: analysis,
        performanceOptimizations: optimizations,
        contextualSuggestions: contextual,
        isLoadingSuggestions: false,
        suggestionMetrics: {
          ...prev.suggestionMetrics,
          totalSuggestions: suggestions.length,
          averageConfidence: suggestions.length > 0 
            ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length 
            : 0,
          averagePerformance: suggestions.length > 0 
            ? suggestions.reduce((sum, s) => sum + s.performanceScore, 0) / suggestions.length 
            : 0
        }
      }));

      // Learn from user behavior if enabled
      if (enableLearning && state.behaviorAnalysis) {
        learnFromFeedback({
          suggestions,
          userBehavior: state.behaviorAnalysis,
          context: context || {}
        });
      }

    } catch (error) {
      setState(prev => ({ ...prev, isLoadingSuggestions: false }));
      console.error('Failed to load pattern suggestions:', error);
    }
  }, [
    ruleContent,
    language,
    context,
    maxSuggestions,
    state.confidenceThreshold,
    state.performanceThreshold,
    state.behaviorAnalysis,
    enablePerformanceOptimization,
    enableLearning,
    showInsights,
    generatePatternSuggestions,
    analyzePatternContext,
    optimizePatternPerformance,
    contextualSuggestions,
    learnFromFeedback
  ]);

  const handleSelectSuggestion = useCallback((suggestion: PatternSuggestion) => {
    setState(prev => ({ ...prev, selectedSuggestion: suggestion }));
    onPatternSelect?.(suggestion.pattern);

    // Track selection for learning
    if (enableLearning) {
      trackUserBehavior('select', suggestion);
    }
  }, [onPatternSelect, enableLearning]);

  const handleApplyPattern = useCallback(async (suggestion: PatternSuggestion) => {
    if (!suggestion.pattern) return;

    try {
      // Validate pattern before applying
      const validationResult = await validatePattern({
        pattern: suggestion.pattern,
        context: context || {}
      });

      if (validationResult.isValid) {
        setState(prev => ({
          ...prev,
          appliedPatterns: [...prev.appliedPatterns, suggestion.pattern],
          suggestionMetrics: {
            ...prev.suggestionMetrics,
            appliedCount: prev.suggestionMetrics.appliedCount + 1,
            successRate: ((prev.suggestionMetrics.appliedCount + 1) / prev.suggestionMetrics.totalSuggestions) * 100
          }
        }));

        onPatternApply?.(suggestion.pattern);

        // Provide positive feedback for successful application
        await handleFeedback(suggestion, 'positive');
        
        showNotification('success', `Pattern "${suggestion.title}" applied successfully`);
      } else {
        showNotification('error', `Pattern validation failed: ${validationResult.errors?.join(', ')}`);
      }
    } catch (error) {
      showNotification('error', 'Failed to apply pattern');
      console.error('Apply pattern error:', error);
    }

    // Track application for learning
    if (enableLearning) {
      trackUserBehavior('apply', suggestion);
    }
  }, [context, onPatternApply, validatePattern, enableLearning]);

  const handleFeedback = useCallback(async (
    suggestion: PatternSuggestion, 
    feedbackType: 'positive' | 'negative'
  ) => {
    try {
      const feedback: PatternFeedback = {
        suggestionId: suggestion.id,
        patternId: suggestion.pattern?.id || '',
        type: feedbackType,
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        context: {
          language,
          ruleContent,
          appliedSuccessfully: feedbackType === 'positive'
        }
      };

      // Add feedback to pattern library
      await addPatternFeedback(feedback);

      // Update local state
      setState(prev => ({
        ...prev,
        userFeedback: [...prev.userFeedback, feedback],
        suggestions: prev.suggestions.map(s => 
          s.id === suggestion.id 
            ? {
                ...s,
                feedback: {
                  ...s.feedback,
                  likes: (s.feedback?.likes || 0) + (feedbackType === 'positive' ? 1 : 0),
                  dislikes: (s.feedback?.dislikes || 0) + (feedbackType === 'negative' ? 1 : 0)
                }
              }
            : s
        )
      }));

      onFeedback?.(feedback);

      // Learn from feedback if enabled
      if (enableLearning) {
        setTimeout(() => {
          learnFromFeedback({
            feedback: [feedback],
            suggestions: [suggestion],
            context: context || {}
          });
        }, 100);
      }

      showNotification('info', `Feedback recorded for "${suggestion.title}"`);
    } catch (error) {
      showNotification('error', 'Failed to record feedback');
      console.error('Feedback error:', error);
    }
  }, [
    language, 
    ruleContent, 
    context, 
    addPatternFeedback, 
    onFeedback, 
    enableLearning, 
    learnFromFeedback
  ]);

  const handleSearchPatterns = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, searchQuery: '', filteredSuggestions: prev.suggestions }));
      return;
    }

    setState(prev => ({ ...prev, searchQuery: query, isLoadingSuggestions: true }));

    try {
      // Search in pattern library
      const searchResults = await searchPatterns({
        query,
        language,
        categories: state.selectedCategories,
        limit: maxSuggestions
      });

      // Convert search results to suggestions
      const suggestions: PatternSuggestion[] = searchResults.map(pattern => ({
        id: pattern.id,
        title: pattern.name,
        description: pattern.description,
        pattern,
        confidence: pattern.confidence || 80,
        performanceScore: pattern.performanceMetrics?.score || 70,
        category: pattern.category,
        language: pattern.language,
        complexity: pattern.complexity,
        usage: pattern.usage,
        similarity: pattern.similarity,
        lastUpdated: pattern.updatedAt,
        isRecommended: pattern.isRecommended,
        isTrending: pattern.isTrending,
        isNew: pattern.isNew
      }));

      setState(prev => ({
        ...prev,
        suggestions,
        filteredSuggestions: suggestions,
        isLoadingSuggestions: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoadingSuggestions: false }));
      console.error('Search patterns error:', error);
    }
  }, [language, state.selectedCategories, maxSuggestions, searchPatterns]);

  const handleAnalyzePatterns = useCallback(async () => {
    if (state.suggestions.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      // Get pattern insights
      const insights = await getPatternInsights({
        patterns: state.suggestions.map(s => s.pattern).filter(Boolean),
        context: context || {}
      });

      // Get pattern trends
      const trends = await getPatternTrends({
        language,
        timeRange: '30d',
        categories: state.selectedCategories
      });

      // Cluster similar patterns
      const clusters = await clusterPatterns({
        patterns: state.suggestions.map(s => s.pattern).filter(Boolean),
        algorithm: 'kmeans',
        numClusters: Math.min(5, Math.floor(state.suggestions.length / 3))
      });

      // Analyze pattern similarities
      const similarities = await analyzePatternSimilarity({
        patterns: state.suggestions.map(s => s.pattern).filter(Boolean),
        threshold: 0.7
      });

      setState(prev => ({
        ...prev,
        learningInsights: insights,
        patternTrends: trends,
        patternClusters: clusters,
        patternSimilarity: similarities,
        isAnalyzing: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isAnalyzing: false }));
      console.error('Pattern analysis error:', error);
    }
  }, [
    state.suggestions,
    state.selectedCategories,
    context,
    language,
    getPatternInsights,
    getPatternTrends,
    clusterPatterns,
    analyzePatternSimilarity
  ]);

  const handleOptimizePerformance = useCallback(async () => {
    if (!enablePerformanceOptimization || state.suggestions.length === 0) return;

    setState(prev => ({ ...prev, isOptimizing: true }));

    try {
      const optimizations = await optimizePatternPerformance({
        patterns: state.suggestions.map(s => s.pattern).filter(Boolean),
        context: context || {},
        targetMetrics: {
          executionTime: state.performanceThreshold,
          memoryUsage: 100,
          throughput: 1000
        }
      });

      setState(prev => ({
        ...prev,
        performanceOptimizations: optimizations,
        isOptimizing: false
      }));

      showNotification('success', `Generated ${optimizations.length} performance optimizations`);
    } catch (error) {
      setState(prev => ({ ...prev, isOptimizing: false }));
      showNotification('error', 'Failed to optimize performance');
      console.error('Performance optimization error:', error);
    }
  }, [
    enablePerformanceOptimization,
    state.suggestions,
    state.performanceThreshold,
    context,
    optimizePatternPerformance
  ]);

  // Utility functions
  const trackUserBehavior = async (action: string, suggestion: PatternSuggestion) => {
    // Implementation would track user behavior for ML learning
    console.log(`Tracking behavior: ${action} on suggestion ${suggestion.id}`);
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const hashContent = (content: string): string => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  // Effects
  useEffect(() => {
    if (ruleContent.trim() && state.realTimeMode) {
      // Debounce suggestions loading
      if (learningTimeoutRef.current) {
        clearTimeout(learningTimeoutRef.current);
      }

      learningTimeoutRef.current = setTimeout(() => {
        handleLoadSuggestions(ruleContent);
      }, 1000);
    }

    return () => {
      if (learningTimeoutRef.current) {
        clearTimeout(learningTimeoutRef.current);
      }
    };
  }, [ruleContent, state.realTimeMode, handleLoadSuggestions]);

  useEffect(() => {
    setState(prev => ({ ...prev, filteredSuggestions: filteredAndSortedSuggestions }));
  }, [filteredAndSortedSuggestions]);

  useEffect(() => {
    return () => {
      if (learningTimeoutRef.current) {
        clearTimeout(learningTimeoutRef.current);
      }
      if (optimizationTimeoutRef.current) {
        clearTimeout(optimizationTimeoutRef.current);
      }
    };
  }, []);

  // Main Render
  return (
    <TooltipProvider>
      <div className={`ai-pattern-suggestions h-full w-full ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">AI Pattern Suggestions</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>ML-Powered</span>
              </Badge>
              
              {state.suggestions.length > 0 && (
                <Badge variant="secondary">
                  {filteredAndSortedSuggestions.length} of {state.suggestions.length} suggestions
                </Badge>
              )}
              
              {enableLearning && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>Adaptive Learning</span>
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Real-time Toggle */}
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Real-time</Label>
              <Switch
                checked={state.realTimeMode}
                onCheckedChange={(checked) => 
                  setState(prev => ({ ...prev, realTimeMode: checked }))
                }
              />
            </div>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadSuggestions(ruleContent, true)}
              disabled={state.isLoadingSuggestions}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoadingSuggestions ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzePatterns}
              disabled={state.isAnalyzing || state.suggestions.length === 0}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze
            </Button>

            {enablePerformanceOptimization && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimizePerformance}
                disabled={state.isOptimizing || state.suggestions.length === 0}
              >
                <Zap className="h-4 w-4 mr-2" />
                Optimize
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Filters & Controls */}
          <div className="w-80 border-r bg-muted/10 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Search */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Patterns</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patterns..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearchPatterns(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Quick Filters</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={state.usageFilter === 'recommended' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      usageFilter: prev.usageFilter === 'recommended' ? 'all' : 'recommended' 
                    }))}
                    className="text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Recommended
                  </Button>
                  
                  <Button
                    variant={state.usageFilter === 'trending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      usageFilter: prev.usageFilter === 'trending' ? 'all' : 'trending' 
                    }))}
                    className="text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Button>
                  
                  <Button
                    variant={state.usageFilter === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      usageFilter: prev.usageFilter === 'popular' ? 'all' : 'popular' 
                    }))}
                    className="text-xs"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Popular
                  </Button>
                  
                  <Button
                    variant={state.usageFilter === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      usageFilter: prev.usageFilter === 'new' ? 'all' : 'new' 
                    }))}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    New
                  </Button>
                </div>
              </div>

              {/* Confidence Threshold */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Confidence Threshold: {state.confidenceThreshold}%
                </Label>
                <Slider
                  value={[state.confidenceThreshold]}
                  onValueChange={([value]) => setState(prev => ({ ...prev, confidenceThreshold: value }))}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Performance Threshold */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Performance Threshold: {state.performanceThreshold}%
                </Label>
                <Slider
                  value={[state.performanceThreshold]}
                  onValueChange={([value]) => setState(prev => ({ ...prev, performanceThreshold: value }))}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Language Filter */}
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

              {/* Complexity Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Complexity</Label>
                <Select
                  value={state.complexityFilter}
                  onValueChange={(value: any) => setState(prev => ({ ...prev, complexityFilter: value }))}
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

              {/* Performance Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Performance</Label>
                <Select
                  value={state.performanceFilter}
                  onValueChange={(value: any) => setState(prev => ({ ...prev, performanceFilter: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Performance</SelectItem>
                    <SelectItem value="fast">Fast (90%+)</SelectItem>
                    <SelectItem value="optimized">Optimized (80%+)</SelectItem>
                    <SelectItem value="balanced">Balanced (70%+)</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive (60%+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <div className="flex space-x-2">
                  <Select
                    value={state.sortBy}
                    onValueChange={(value: any) => setState(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidence">Confidence</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="usage">Usage</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="similarity">Similarity</SelectItem>
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

              {/* Advanced Options */}
              <Collapsible 
                open={state.showAdvanced} 
                onOpenChange={(open) => setState(prev => ({ ...prev, showAdvanced: open }))}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0">
                    <span className="text-sm font-medium">Advanced Options</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${state.showAdvanced ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto Apply</Label>
                      <Switch
                        checked={state.autoApply}
                        onCheckedChange={(checked) => setState(prev => ({ ...prev, autoApply: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Continuous Learning</Label>
                      <Switch
                        checked={state.continuousLearning}
                        onCheckedChange={(checked) => setState(prev => ({ ...prev, continuousLearning: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Adaptive Threshold</Label>
                      <Switch
                        checked={state.adaptiveThreshold}
                        onCheckedChange={(checked) => setState(prev => ({ ...prev, adaptiveThreshold: checked }))}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="suggestions">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="performance">
                  <Zap className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions" className="flex-1 p-4">
                <div className="h-full">
                  {/* Loading State */}
                  {state.isLoadingSuggestions && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold mb-2">Generating AI Suggestions</h3>
                        <p className="text-muted-foreground">
                          Analyzing patterns and generating recommendations...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Suggestions List */}
                  {!state.isLoadingSuggestions && filteredAndSortedSuggestions.length > 0 && (
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        {filteredAndSortedSuggestions.map((suggestion) => (
                          <PatternSuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            isSelected={state.selectedSuggestion?.id === suggestion.id}
                            onSelect={handleSelectSuggestion}
                            onApply={handleApplyPattern}
                            onFeedback={(s, feedback) => handleFeedback(s, feedback)}
                            onView={(s) => setState(prev => ({ ...prev, selectedSuggestion: s }))}
                            showDetails={true}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {/* Empty State */}
                  {!state.isLoadingSuggestions && filteredAndSortedSuggestions.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-md">
                        {state.suggestions.length === 0 ? (
                          <>
                            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Suggestions Available</h3>
                            <p className="text-muted-foreground mb-4">
                              {ruleContent.trim() 
                                ? "We couldn't find any pattern suggestions for the current rule content." 
                                : "Enter some rule content to get AI-powered pattern suggestions."
                              }
                            </p>
                            {ruleContent.trim() && (
                              <Button onClick={() => handleLoadSuggestions(ruleContent, true)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Results Match Filters</h3>
                            <p className="text-muted-foreground mb-4">
                              Try adjusting your filters to see more suggestions.
                            </p>
                            <Button 
                              variant="outline"
                              onClick={() => setState(prev => ({
                                ...prev,
                                searchQuery: '',
                                selectedCategories: [],
                                confidenceThreshold: 0,
                                performanceThreshold: 0,
                                languageFilter: [language],
                                complexityFilter: 'all',
                                usageFilter: 'all',
                                performanceFilter: 'all'
                              }))}
                            >
                              Clear Filters
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="insights" className="flex-1 p-4">
                <div className="space-y-6">
                  {/* ML Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Brain className="h-5 w-5 mr-2" />
                        ML Recommendations
                      </CardTitle>
                      <CardDescription>
                        Machine learning-powered pattern recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {state.mlRecommendations.length > 0 ? (
                        <div className="space-y-3">
                          {state.mlRecommendations.slice(0, 5).map((rec, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">{rec.title}</h4>
                                <Badge variant="outline">
                                  {Math.round(rec.confidence * 100)}% confidence
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {rec.description}
                              </p>
                              {rec.reasoning && (
                                <div className="text-xs text-muted-foreground">
                                  <strong>Reasoning:</strong> {rec.reasoning}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No ML Recommendations</h3>
                          <p className="text-muted-foreground">
                            Load suggestions to get ML-powered recommendations
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contextual Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Contextual Suggestions
                      </CardTitle>
                      <CardDescription>
                        Context-aware pattern suggestions based on your current work
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {state.contextualSuggestions.length > 0 ? (
                        <div className="space-y-3">
                          {state.contextualSuggestions.slice(0, 5).map((suggestion, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">{suggestion.title}</h4>
                                <Badge variant="secondary">
                                  {suggestion.contextScore}% match
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {suggestion.description}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                <strong>Context:</strong> {suggestion.contextReason}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Contextual Suggestions</h3>
                          <p className="text-muted-foreground">
                            Contextual suggestions will appear based on your rule content
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pattern Analysis */}
                  {state.patternAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Microscope className="h-5 w-5 mr-2" />
                          Pattern Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold">
                              {state.patternAnalysis.complexity}
                            </div>
                            <div className="text-sm text-muted-foreground">Complexity</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold">
                              {state.patternAnalysis.maintainability}%
                            </div>
                            <div className="text-sm text-muted-foreground">Maintainability</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold">
                              {state.patternAnalysis.reusability}%
                            </div>
                            <div className="text-sm text-muted-foreground">Reusability</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold">
                              {state.patternAnalysis.effectiveness}%
                            </div>
                            <div className="text-sm text-muted-foreground">Effectiveness</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="flex-1 p-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        Performance Optimizations
                      </CardTitle>
                      <CardDescription>
                        AI-generated performance improvements for patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {state.performanceOptimizations.length > 0 ? (
                        <div className="space-y-4">
                          {state.performanceOptimizations.map((opt, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold">{opt.title}</h4>
                                <Badge variant={opt.impact === 'high' ? 'default' : 'secondary'}>
                                  {opt.impact} impact
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">
                                {opt.description}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <span className="font-medium">Execution Time:</span>
                                  <div className="text-green-600">
                                    -{opt.improvements.executionTime}ms
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">HardDrive Usage:</span>
                                  <div className="text-green-600">
                                    -{opt.improvements.memoryUsage}MB
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">Throughput:</span>
                                  <div className="text-green-600">
                                    +{opt.improvements.throughput}%
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">Efficiency:</span>
                                  <div className="text-green-600">
                                    +{opt.improvements.efficiency}%
                                  </div>
                                </div>
                              </div>
                              
                              {opt.recommendations && opt.recommendations.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <span className="text-sm font-medium">Recommendations:</span>
                                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                    {opt.recommendations.map((rec, recIndex) => (
                                      <li key={recIndex} className="flex items-start space-x-2">
                                        <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Performance Optimizations</h3>
                          <p className="text-muted-foreground mb-4">
                            Load patterns and click "Optimize" to get performance improvements
                          </p>
                          <Button 
                            onClick={handleOptimizePerformance}
                            disabled={state.suggestions.length === 0}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Generate Optimizations
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Suggestion Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Suggestions</p>
                            <p className="text-2xl font-bold">{state.suggestionMetrics.totalSuggestions}</p>
                          </div>
                          <Sparkles className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Applied Count</p>
                            <p className="text-2xl font-bold">{state.suggestionMetrics.appliedCount}</p>
                          </div>
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                            <p className="text-2xl font-bold">{state.suggestionMetrics.successRate.toFixed(1)}%</p>
                          </div>
                          <Target className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                            <p className="text-2xl font-bold">{state.suggestionMetrics.averageConfidence.toFixed(0)}%</p>
                          </div>
                          <Brain className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pattern Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Pattern Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {state.patternTrends.length > 0 ? (
                        <div className="space-y-3">
                          {state.patternTrends.slice(0, 5).map((trend, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-semibold">{trend.category}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {trend.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-medium ${
                                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {trend.direction === 'up' ? '↗' : '↘'} {trend.change}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {trend.usage} uses
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Trend Data</h3>
                          <p className="text-muted-foreground">
                            Pattern trend analysis will appear here
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pattern Clusters */}
                  {state.patternClusters.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Layers className="h-5 w-5 mr-2" />
                          Pattern Clusters
                        </CardTitle>
                        <CardDescription>
                          Similar patterns grouped by AI clustering
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {state.patternClusters.map((cluster, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold">Cluster {index + 1}</h4>
                                <Badge variant="outline">
                                  {cluster.patterns.length} patterns
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">
                                {cluster.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-2">
                                {cluster.patterns.slice(0, 5).map((pattern, patternIndex) => (
                                  <Badge key={patternIndex} variant="secondary">
                                    {pattern.name}
                                  </Badge>
                                ))}
                                {cluster.patterns.length > 5 && (
                                  <Badge variant="outline">
                                    +{cluster.patterns.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="flex-1 p-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="h-5 w-5 mr-2" />
                      Suggestion History
                    </CardTitle>
                    <CardDescription>
                      Your pattern suggestion and application history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {state.appliedPatterns.length > 0 || state.userFeedback.length > 0 ? (
                      <div className="space-y-4">
                        {/* Applied Patterns */}
                        {state.appliedPatterns.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Applied Patterns</h4>
                            <div className="space-y-2">
                              {state.appliedPatterns.slice(-10).reverse().map((pattern, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div>
                                    <h5 className="font-medium">{pattern.name}</h5>
                                    <p className="text-sm text-muted-foreground">
                                      {pattern.description}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline">{pattern.language}</Badge>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Applied recently
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Feedback History */}
                        {state.userFeedback.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Feedback History</h4>
                            <div className="space-y-2">
                              {state.userFeedback.slice(-10).reverse().map((feedback, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    {feedback.type === 'positive' ? (
                                      <ThumbsUp className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <ThumbsDown className="h-4 w-4 text-red-500" />
                                    )}
                                    <div>
                                      <div className="font-medium">
                                        {feedback.type === 'positive' ? 'Liked' : 'Disliked'} suggestion
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Pattern ID: {feedback.patternId}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(feedback.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No History Available</h3>
                        <p className="text-muted-foreground">
                          Your pattern application and feedback history will appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AIPatternSuggestions;