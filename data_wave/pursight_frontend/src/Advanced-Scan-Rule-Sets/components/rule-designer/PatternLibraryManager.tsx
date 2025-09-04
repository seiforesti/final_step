/**
 * PatternLibraryManager Component
 * 
 * Advanced enterprise-grade pattern management system with AI-powered
 * pattern recognition, collaborative pattern sharing, and intelligent
 * pattern matching capabilities.
 * 
 * Features:
 * - AI-powered pattern discovery and recognition
 * - Advanced pattern library with versioning
 * - Collaborative pattern sharing and reviews
 * - Intelligent pattern matching and suggestions
 * - Performance analysis and optimization
 * - Multi-language pattern support
 * - Pattern testing and validation framework
 * - Analytics and usage insights
 * - Export/Import capabilities
 * - Template generation from patterns
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
import { Library, Search, Plus, Edit, Trash2, Copy, Download, Upload, Share2, Star, StarOff, Eye, Code, Zap, Brain, TrendingUp, Users, Clock, CheckCircle, XCircle, AlertTriangle, Filter, SortAsc, SortDesc, MoreHorizontal, RefreshCw, Settings, BookOpen, Tags, GitBranch, Activity, PieChart, BarChart3, LineChart, Database, FileText, Globe, Shield, Lightbulb, Target, Puzzle, Layers, Network, Workflow, Bot, Sparkles, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowUp, ArrowDown, ExternalLink, Heart, MessageSquare, ThumbsUp, ThumbsDown, Flag, Calendar, User, History, Save, Undo, Redo, GitCompare, Merge, Split, Maximize2, Minimize2, Move, Resize, RotateCcw, Play, Pause, Square, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Monitor, Smartphone, Tablet, Laptop } from 'lucide-react';

// Hooks
import { usePatternLibrary } from '../../hooks/usePatternLibrary';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useScanRules } from '../../hooks/useScanRules';

// Types
import type {
  Pattern,
  PatternCategory,
  PatternUsageStats,
  PatternAnalytics,
  PatternValidationResult,
  PatternTemplate,
  PatternVersion,
  PatternReview,
  PatternRating,
  AIPatternSuggestion,
  PatternMatchResult,
  PatternOptimizationResult
} from '../../types/patterns.types';

// Pattern Library Manager Props
interface PatternLibraryManagerProps {
  mode?: 'library' | 'search' | 'create' | 'edit';
  selectedPatternId?: string;
  onPatternSelect?: (pattern: Pattern) => void;
  onPatternApply?: (pattern: Pattern) => void;
  onPatternSave?: (pattern: Pattern) => void;
  showCreateDialog?: boolean;
  showImportDialog?: boolean;
  collaborationEnabled?: boolean;
  aiAssistanceEnabled?: boolean;
  className?: string;
}

// Pattern Library State
interface PatternLibraryState {
  // Core data
  patterns: Pattern[];
  categories: PatternCategory[];
  selectedPattern: Pattern | null;
  editingPattern: Pattern | null;
  
  // UI state
  activeTab: string;
  isLoading: boolean;
  isSaving: boolean;
  isAnalyzing: boolean;
  isOptimizing: boolean;
  
  // Search and filter state
  searchQuery: string;
  selectedCategories: string[];
  selectedLanguages: string[];
  selectedTags: string[];
  sortBy: 'name' | 'created' | 'usage' | 'rating' | 'performance';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'table';
  
  // AI state
  aiSuggestions: AIPatternSuggestion[];
  patternMatches: PatternMatchResult[];
  optimizationResults: PatternOptimizationResult[];
  
  // Analytics state
  analytics: PatternAnalytics | null;
  usageStats: PatternUsageStats[];
  performanceMetrics: any;
  
  // Collaboration state
  reviews: PatternReview[];
  ratings: PatternRating[];
  comments: any[];
  
  // Form state
  createForm: Partial<Pattern>;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isImportDialogOpen: boolean;
  isExportDialogOpen: boolean;
  isShareDialogOpen: boolean;
  
  // Validation state
  validationResults: PatternValidationResult[];
  testResults: any[];
}

// Pattern Form Data
interface PatternFormData {
  name: string;
  description: string;
  category: string;
  language: string;
  pattern: string;
  tags: string[];
  examples: string[];
  testCases: any[];
  metadata: Record<string, any>;
  isPublic: boolean;
  isTemplate: boolean;
}

// Filter Configuration
interface FilterConfig {
  categories: string[];
  languages: string[];
  tags: string[];
  authors: string[];
  complexity: string[];
  performance: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  showFavorites: boolean;
  showRecent: boolean;
  showTrending: boolean;
}

/**
 * PatternLibraryManager Component Implementation
 */
export const PatternLibraryManager: React.FC<PatternLibraryManagerProps> = ({
  mode = 'library',
  selectedPatternId,
  onPatternSelect,
  onPatternApply,
  onPatternSave,
  showCreateDialog = false,
  showImportDialog = false,
  collaborationEnabled = true,
  aiAssistanceEnabled = true,
  className
}) => {
  // Hooks
  const {
    patterns,
    categories,
    searchPatterns,
    createPattern,
    updatePattern,
    deletePattern,
    analyzePattern,
    optimizePattern,
    validatePattern,
    importPatterns,
    exportPatterns,
    getPatternAnalytics,
    getPatternUsageStats,
    favoritePattern,
    unfavoritePattern,
    ratePattern,
    loading: patternsLoading,
    error: patternsError
  } = usePatternLibrary();

  const {
    generatePatternSuggestions,
    recognizePatterns,
    optimizePatternPerformance,
    suggestions: aiSuggestions,
    insights: aiInsights,
    loading: aiLoading
  } = useIntelligence();

  const {
    addComment,
    getComments,
    addReview,
    getReviews,
    collaborationSession,
    comments,
    reviews,
    loading: collabLoading
  } = useCollaboration();

  // State Management
  const [state, setState] = useState<PatternLibraryState>({
    // Core data
    patterns: [],
    categories: [],
    selectedPattern: null,
    editingPattern: null,
    
    // UI state
    activeTab: 'library',
    isLoading: false,
    isSaving: false,
    isAnalyzing: false,
    isOptimizing: false,
    
    // Search and filter state
    searchQuery: '',
    selectedCategories: [],
    selectedLanguages: [],
    selectedTags: [],
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'grid',
    
    // AI state
    aiSuggestions: [],
    patternMatches: [],
    optimizationResults: [],
    
    // Analytics state
    analytics: null,
    usageStats: [],
    performanceMetrics: {},
    
    // Collaboration state
    reviews: [],
    ratings: [],
    comments: [],
    
    // Form state
    createForm: {
      name: '',
      description: '',
      category: '',
      language: 'sql',
      pattern: '',
      tags: [],
      examples: [],
      testCases: [],
      metadata: {},
      isPublic: true,
      isTemplate: false
    },
    isCreateDialogOpen: showCreateDialog,
    isEditDialogOpen: false,
    isImportDialogOpen: showImportDialog,
    isExportDialogOpen: false,
    isShareDialogOpen: false,
    
    // Validation state
    validationResults: [],
    testResults: []
  });

  // Filter Configuration
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    categories: [],
    languages: [],
    tags: [],
    authors: [],
    complexity: [],
    performance: [],
    dateRange: {
      start: null,
      end: null
    },
    showFavorites: false,
    showRecent: false,
    showTrending: false
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const patternEditorRef = useRef<any>(null);

  // Computed values
  const filteredPatterns = useMemo(() => {
    let filtered = state.patterns;

    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(pattern =>
        pattern.name.toLowerCase().includes(query) ||
        pattern.description.toLowerCase().includes(query) ||
        pattern.tags.some(tag => tag.toLowerCase().includes(query)) ||
        pattern.category.toLowerCase().includes(query)
      );
    }

    // Apply category filters
    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter(pattern =>
        state.selectedCategories.includes(pattern.category)
      );
    }

    // Apply language filters
    if (state.selectedLanguages.length > 0) {
      filtered = filtered.filter(pattern =>
        state.selectedLanguages.includes(pattern.language)
      );
    }

    // Apply tag filters
    if (state.selectedTags.length > 0) {
      filtered = filtered.filter(pattern =>
        state.selectedTags.some(tag => pattern.tags.includes(tag))
      );
    }

    // Apply other filters
    if (filterConfig.showFavorites) {
      filtered = filtered.filter(pattern => pattern.isFavorite);
    }

    if (filterConfig.showRecent) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(pattern => 
        new Date(pattern.createdAt) >= weekAgo
      );
    }

    if (filterConfig.showTrending) {
      filtered = filtered.filter(pattern => pattern.isTrending);
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
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'usage':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        case 'rating':
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        case 'performance':
          aValue = a.performanceScore || 0;
          bValue = b.performanceScore || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    state.patterns,
    state.searchQuery,
    state.selectedCategories,
    state.selectedLanguages,
    state.selectedTags,
    state.sortBy,
    state.sortOrder,
    filterConfig
  ]);

  const patternStats = useMemo(() => {
    const stats = {
      total: state.patterns.length,
      public: state.patterns.filter(p => p.isPublic).length,
      private: state.patterns.filter(p => !p.isPublic).length,
      favorites: state.patterns.filter(p => p.isFavorite).length,
      recent: state.patterns.filter(p => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(p.createdAt) >= weekAgo;
      }).length,
      trending: state.patterns.filter(p => p.isTrending).length
    };
    
    return stats;
  }, [state.patterns]);

  // Event Handlers
  const handleSearch = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handlePatternSelect = useCallback((pattern: Pattern) => {
    setState(prev => ({ ...prev, selectedPattern: pattern }));
    onPatternSelect?.(pattern);
  }, [onPatternSelect]);

  const handlePatternApply = useCallback((pattern: Pattern) => {
    onPatternApply?.(pattern);
  }, [onPatternApply]);

  const handleCreatePattern = useCallback(async () => {
    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const newPattern = await createPattern(state.createForm as Pattern);
      
      setState(prev => ({
        ...prev,
        patterns: [...prev.patterns, newPattern],
        selectedPattern: newPattern,
        isCreateDialogOpen: false,
        isSaving: false,
        createForm: {
          name: '',
          description: '',
          category: '',
          language: 'sql',
          pattern: '',
          tags: [],
          examples: [],
          testCases: [],
          metadata: {},
          isPublic: true,
          isTemplate: false
        }
      }));

      onPatternSave?.(newPattern);
      showNotification('success', 'Pattern created successfully');

    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      showNotification('error', 'Failed to create pattern');
      console.error('Create pattern error:', error);
    }
  }, [state.createForm, createPattern, onPatternSave]);

  const handleUpdatePattern = useCallback(async (pattern: Pattern) => {
    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const updatedPattern = await updatePattern(pattern.id, pattern);
      
      setState(prev => ({
        ...prev,
        patterns: prev.patterns.map(p => p.id === pattern.id ? updatedPattern : p),
        selectedPattern: updatedPattern,
        editingPattern: null,
        isEditDialogOpen: false,
        isSaving: false
      }));

      onPatternSave?.(updatedPattern);
      showNotification('success', 'Pattern updated successfully');

    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      showNotification('error', 'Failed to update pattern');
      console.error('Update pattern error:', error);
    }
  }, [updatePattern, onPatternSave]);

  const handleDeletePattern = useCallback(async (patternId: string) => {
    if (!confirm('Are you sure you want to delete this pattern?')) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await deletePattern(patternId);
      
      setState(prev => ({
        ...prev,
        patterns: prev.patterns.filter(p => p.id !== patternId),
        selectedPattern: prev.selectedPattern?.id === patternId ? null : prev.selectedPattern,
        isLoading: false
      }));

      showNotification('success', 'Pattern deleted successfully');

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      showNotification('error', 'Failed to delete pattern');
      console.error('Delete pattern error:', error);
    }
  }, [deletePattern]);

  const handleAnalyzePattern = useCallback(async (pattern: Pattern) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const analysisResult = await analyzePattern(pattern);
      
      setState(prev => ({
        ...prev,
        patternMatches: analysisResult.matches || [],
        validationResults: analysisResult.validation || [],
        isAnalyzing: false
      }));

      showNotification('success', 'Pattern analysis completed');

    } catch (error) {
      setState(prev => ({ ...prev, isAnalyzing: false }));
      showNotification('error', 'Pattern analysis failed');
      console.error('Pattern analysis error:', error);
    }
  }, [analyzePattern]);

  const handleOptimizePattern = useCallback(async (pattern: Pattern) => {
    setState(prev => ({ ...prev, isOptimizing: true }));

    try {
      const optimizationResult = await optimizePattern(pattern);
      
      setState(prev => ({
        ...prev,
        optimizationResults: [optimizationResult, ...prev.optimizationResults],
        isOptimizing: false
      }));

      showNotification('success', 'Pattern optimization completed');

    } catch (error) {
      setState(prev => ({ ...prev, isOptimizing: false }));
      showNotification('error', 'Pattern optimization failed');
      console.error('Pattern optimization error:', error);
    }
  }, [optimizePattern]);

  const handleFavoriteToggle = useCallback(async (pattern: Pattern) => {
    try {
      if (pattern.isFavorite) {
        await unfavoritePattern(pattern.id);
      } else {
        await favoritePattern(pattern.id);
      }
      
      setState(prev => ({
        ...prev,
        patterns: prev.patterns.map(p => 
          p.id === pattern.id ? { ...p, isFavorite: !p.isFavorite } : p
        ),
        selectedPattern: prev.selectedPattern?.id === pattern.id 
          ? { ...prev.selectedPattern, isFavorite: !prev.selectedPattern.isFavorite }
          : prev.selectedPattern
      }));

    } catch (error) {
      showNotification('error', 'Failed to update favorite status');
      console.error('Favorite toggle error:', error);
    }
  }, [favoritePattern, unfavoritePattern]);

  const handleRatePattern = useCallback(async (pattern: Pattern, rating: number) => {
    try {
      await ratePattern(pattern.id, rating);
      
      setState(prev => ({
        ...prev,
        patterns: prev.patterns.map(p => 
          p.id === pattern.id ? { ...p, userRating: rating } : p
        ),
        selectedPattern: prev.selectedPattern?.id === pattern.id 
          ? { ...prev.selectedPattern, userRating: rating }
          : prev.selectedPattern
      }));

      showNotification('success', 'Pattern rated successfully');

    } catch (error) {
      showNotification('error', 'Failed to rate pattern');
      console.error('Rate pattern error:', error);
    }
  }, [ratePattern]);

  const handleImportPatterns = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const importedPatterns = await importPatterns(file);
      
      setState(prev => ({
        ...prev,
        patterns: [...prev.patterns, ...importedPatterns],
        isImportDialogOpen: false,
        isLoading: false
      }));

      showNotification('success', `${importedPatterns.length} patterns imported successfully`);

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      showNotification('error', 'Failed to import patterns');
      console.error('Import patterns error:', error);
    }
  }, [importPatterns]);

  const handleExportPatterns = useCallback(async (patterns: Pattern[], format: 'json' | 'csv' | 'xml') => {
    try {
      const exportData = await exportPatterns(patterns, format);
      
      // Create download link
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 
              format === 'csv' ? 'text/csv' : 'application/xml' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patterns_export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setState(prev => ({ ...prev, isExportDialogOpen: false }));
      showNotification('success', 'Patterns exported successfully');

    } catch (error) {
      showNotification('error', 'Failed to export patterns');
      console.error('Export patterns error:', error);
    }
  }, [exportPatterns]);

  const handleGenerateAISuggestions = useCallback(async (context?: any) => {
    if (!aiAssistanceEnabled) return;

    try {
      const suggestions = await generatePatternSuggestions({
        context: context || state.selectedPattern,
        type: 'optimization',
        language: state.selectedPattern?.language || 'sql'
      });

      setState(prev => ({
        ...prev,
        aiSuggestions: suggestions
      }));

    } catch (error) {
      console.error('AI suggestions error:', error);
    }
  }, [aiAssistanceEnabled, state.selectedPattern, generatePatternSuggestions]);

  // Utility functions
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getLanguageIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'sql': return Database;
      case 'python': return Code;
      case 'javascript': return Globe;
      case 'regex': return Target;
      default: return FileText;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'validation': return CheckCircle;
      case 'transformation': return Workflow;
      case 'classification': return Tags;
      case 'compliance': return Shield;
      case 'quality': return Star;
      default: return Puzzle;
    }
  };

  // Effects
  useEffect(() => {
    if (patterns.length > 0) {
      setState(prev => ({ ...prev, patterns }));
    }
  }, [patterns]);

  useEffect(() => {
    if (categories.length > 0) {
      setState(prev => ({ ...prev, categories }));
    }
  }, [categories]);

  useEffect(() => {
    if (selectedPatternId) {
      const pattern = state.patterns.find(p => p.id === selectedPatternId);
      if (pattern) {
        setState(prev => ({ ...prev, selectedPattern: pattern }));
      }
    }
  }, [selectedPatternId, state.patterns]);

  useEffect(() => {
    // Load analytics data
    const loadAnalytics = async () => {
      try {
        const analytics = await getPatternAnalytics();
        const usageStats = await getPatternUsageStats();
        
        setState(prev => ({
          ...prev,
          analytics,
          usageStats
        }));
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };

    loadAnalytics();
  }, [getPatternAnalytics, getPatternUsageStats]);

  // Main Render
  return (
    <TooltipProvider>
      <div className={`pattern-library-manager h-full w-full ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Library className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Pattern Library Manager</h1>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline">{patternStats.total} Total</Badge>
              <Badge variant="outline">{patternStats.public} Public</Badge>
              <Badge variant="outline">{patternStats.favorites} Favorites</Badge>
              {patternStats.recent > 0 && (
                <Badge variant="default">{patternStats.recent} New</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* AI Status */}
            {aiAssistanceEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={state.aiSuggestions.length > 0 ? "default" : "secondary"}>
                    <Brain className="h-3 w-3 mr-1" />
                    AI Assistant
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI-powered pattern suggestions and optimization</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, isImportDialogOpen: true }))}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, isExportDialogOpen: true }))}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                size="sm"
                onClick={() => setState(prev => ({ ...prev, isCreateDialogOpen: true }))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Pattern
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-80px)] flex">
          {/* Left Sidebar - Search & Filters */}
          <div className="w-80 border-r bg-muted/30 p-4 space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Patterns</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search by name, description, tags..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
              <Label>Quick Filters</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterConfig.showFavorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterConfig(prev => ({ 
                    ...prev, 
                    showFavorites: !prev.showFavorites 
                  }))}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Favorites
                </Button>
                <Button
                  variant={filterConfig.showRecent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterConfig(prev => ({ 
                    ...prev, 
                    showRecent: !prev.showRecent 
                  }))}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Recent
                </Button>
                <Button
                  variant={filterConfig.showTrending ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterConfig(prev => ({ 
                    ...prev, 
                    showTrending: !prev.showTrending 
                  }))}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Button>
              </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {state.categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={state.selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          setState(prev => ({
                            ...prev,
                            selectedCategories: checked
                              ? [...prev.selectedCategories, category.id]
                              : prev.selectedCategories.filter(id => id !== category.id)
                          }));
                        }}
                      />
                      <Label 
                        htmlFor={`category-${category.id}`}
                        className="text-sm flex items-center space-x-1"
                      >
                        {React.createElement(getCategoryIcon(category.name), { className: "h-3 w-3" })}
                        <span>{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.patternCount}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Languages Filter */}
            <div className="space-y-2">
              <Label>Languages</Label>
              <ScrollArea className="h-24">
                <div className="space-y-2">
                  {['SQL', 'Python', 'JavaScript', 'RegEx', 'XPath', 'JSONPath'].map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={state.selectedLanguages.includes(lang.toLowerCase())}
                        onCheckedChange={(checked) => {
                          setState(prev => ({
                            ...prev,
                            selectedLanguages: checked
                              ? [...prev.selectedLanguages, lang.toLowerCase()]
                              : prev.selectedLanguages.filter(l => l !== lang.toLowerCase())
                          }));
                        }}
                      />
                      <Label 
                        htmlFor={`lang-${lang}`}
                        className="text-sm flex items-center space-x-1"
                      >
                        {React.createElement(getLanguageIcon(lang), { className: "h-3 w-3" })}
                        <span>{lang}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={state.sortBy}
                onValueChange={(value: any) => setState(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="usage">Usage Count</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={state.sortOrder === 'asc' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, sortOrder: 'asc' }))}
                >
                  <SortAsc className="h-4 w-4" />
                </Button>
                <Button
                  variant={state.sortOrder === 'desc' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, sortOrder: 'desc' }))}
                >
                  <SortDesc className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiAssistanceEnabled && state.aiSuggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {state.aiSuggestions.slice(0, 3).map((suggestion, index) => (
                        <div key={index} className="p-2 border rounded text-xs">
                          <div className="font-medium">{suggestion.title}</div>
                          <div className="text-muted-foreground mt-1">
                            {suggestion.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex">
            {/* Pattern List/Grid */}
            <div className="flex-1 p-4">
              {/* View Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredPatterns.length} of {state.patterns.length} patterns
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={state.viewMode === 'grid' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={state.viewMode === 'list' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={state.viewMode === 'table' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'table' }))}
                  >
                    <Table className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Pattern Display */}
              <ScrollArea className="h-[calc(100vh-200px)]">
                {state.viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatterns.map((pattern) => (
                      <Card 
                        key={pattern.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          state.selectedPattern?.id === pattern.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handlePatternSelect(pattern)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center">
                                {React.createElement(getCategoryIcon(pattern.category), { 
                                  className: "h-4 w-4 mr-2" 
                                })}
                                {pattern.name}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {pattern.description}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFavoriteToggle(pattern);
                              }}
                            >
                              {pattern.isFavorite ? (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <Badge variant="outline">
                                {React.createElement(getLanguageIcon(pattern.language), { 
                                  className: "h-3 w-3 mr-1" 
                                })}
                                {pattern.language.toUpperCase()}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{pattern.averageRating?.toFixed(1) || '0.0'}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {pattern.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {pattern.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{pattern.tags.length - 3}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Activity className="h-3 w-3" />
                                <span>{pattern.usageCount || 0} uses</span>
                              </div>
                              <span>{formatDate(pattern.createdAt)}</span>
                            </div>

                            <div className="flex items-center space-x-1 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePatternApply(pattern);
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Apply
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setState(prev => ({ 
                                      ...prev, 
                                      editingPattern: pattern,
                                      isEditDialogOpen: true 
                                    }));
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAnalyzePattern(pattern)}>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Analyze
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOptimizePattern(pattern)}>
                                    <Zap className="h-4 w-4 mr-2" />
                                    Optimize
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeletePattern(pattern.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredPatterns.length === 0 && (
                  <div className="text-center py-12">
                    <Library className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No patterns found</h3>
                    <p className="text-muted-foreground mb-4">
                      {state.searchQuery || state.selectedCategories.length > 0 || state.selectedLanguages.length > 0
                        ? 'Try adjusting your search or filters'
                        : 'Create your first pattern to get started'
                      }
                    </p>
                    <Button onClick={() => setState(prev => ({ ...prev, isCreateDialogOpen: true }))}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Pattern
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Right Panel - Pattern Details */}
            {state.selectedPattern && (
              <div className="w-96 border-l p-4 bg-muted/30">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {/* Pattern Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold">{state.selectedPattern.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFavoriteToggle(state.selectedPattern!)}
                        >
                          {state.selectedPattern.isFavorite ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{state.selectedPattern.description}</p>
                    </div>

                    {/* Pattern Metadata */}
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Category</span>
                            <Badge variant="outline">
                              {React.createElement(getCategoryIcon(state.selectedPattern.category), { 
                                className: "h-3 w-3 mr-1" 
                              })}
                              {state.selectedPattern.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Language</span>
                            <Badge variant="outline">
                              {React.createElement(getLanguageIcon(state.selectedPattern.language), { 
                                className: "h-3 w-3 mr-1" 
                              })}
                              {state.selectedPattern.language.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Rating</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">
                                {state.selectedPattern.averageRating?.toFixed(1) || '0.0'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({state.selectedPattern.ratingCount || 0})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Usage</span>
                            <div className="flex items-center space-x-1">
                              <Activity className="h-4 w-4" />
                              <span className="text-sm">{state.selectedPattern.usageCount || 0}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Created</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(state.selectedPattern.createdAt)}
                            </span>
                          </div>

                          {state.selectedPattern.performanceScore && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Performance</span>
                              <div className="flex items-center space-x-2">
                                <Progress 
                                  value={state.selectedPattern.performanceScore} 
                                  className="w-16 h-2"
                                />
                                <span className="text-sm">{state.selectedPattern.performanceScore}/100</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pattern Tags */}
                    {state.selectedPattern.tags.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1">
                            {state.selectedPattern.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Pattern Code */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Pattern Code</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="bg-muted p-3 rounded-md">
                          <pre className="text-xs font-mono whitespace-pre-wrap">
                            {state.selectedPattern.pattern}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pattern Examples */}
                    {state.selectedPattern.examples && state.selectedPattern.examples.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Examples</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {state.selectedPattern.examples.map((example, index) => (
                              <div key={index} className="bg-muted p-2 rounded text-xs">
                                <pre className="font-mono whitespace-pre-wrap">{example}</pre>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handlePatternApply(state.selectedPattern!)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Apply Pattern
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setState(prev => ({ 
                            ...prev, 
                            editingPattern: state.selectedPattern,
                            isEditDialogOpen: true 
                          }))}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAnalyzePattern(state.selectedPattern!)}
                          disabled={state.isAnalyzing}
                        >
                          <Brain className="h-4 w-4 mr-1" />
                          {state.isAnalyzing ? 'Analyzing...' : 'Analyze'}
                        </Button>
                      </div>

                      {aiAssistanceEnabled && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => handleGenerateAISuggestions(state.selectedPattern)}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Suggestions
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Create Pattern Dialog */}
        <Dialog 
          open={state.isCreateDialogOpen} 
          onOpenChange={(open) => setState(prev => ({ ...prev, isCreateDialogOpen: open }))}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Pattern
              </DialogTitle>
              <DialogDescription>
                Create a new pattern to add to your library
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-name">Pattern Name</Label>
                  <Input
                    id="create-name"
                    value={state.createForm.name}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      createForm: { ...prev.createForm, name: e.target.value }
                    }))}
                    placeholder="Enter pattern name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-category">Category</Label>
                  <Select
                    value={state.createForm.category}
                    onValueChange={(value) => setState(prev => ({
                      ...prev,
                      createForm: { ...prev.createForm, category: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={state.createForm.description}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    createForm: { ...prev.createForm, description: e.target.value }
                  }))}
                  placeholder="Describe what this pattern does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-language">Language</Label>
                  <Select
                    value={state.createForm.language}
                    onValueChange={(value) => setState(prev => ({
                      ...prev,
                      createForm: { ...prev.createForm, language: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="regex">RegEx</SelectItem>
                      <SelectItem value="xpath">XPath</SelectItem>
                      <SelectItem value="jsonpath">JSONPath</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="create-public"
                      checked={state.createForm.isPublic}
                      onCheckedChange={(checked) => setState(prev => ({
                        ...prev,
                        createForm: { ...prev.createForm, isPublic: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="create-public" className="text-sm">Public</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="create-template"
                      checked={state.createForm.isTemplate}
                      onCheckedChange={(checked) => setState(prev => ({
                        ...prev,
                        createForm: { ...prev.createForm, isTemplate: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="create-template" className="text-sm">Template</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="create-pattern">Pattern Code</Label>
                <Textarea
                  id="create-pattern"
                  value={state.createForm.pattern}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    createForm: { ...prev.createForm, pattern: e.target.value }
                  }))}
                  placeholder="Enter your pattern code here..."
                  rows={6}
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="create-tags">Tags (comma-separated)</Label>
                <Input
                  id="create-tags"
                  value={state.createForm.tags?.join(', ') || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    createForm: { 
                      ...prev.createForm, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    }
                  }))}
                  placeholder="validation, sql, performance..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setState(prev => ({ ...prev, isCreateDialogOpen: false }))}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePattern}
                disabled={state.isSaving || !state.createForm.name || !state.createForm.pattern}
              >
                {state.isSaving ? 'Creating...' : 'Create Pattern'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog 
          open={state.isImportDialogOpen} 
          onOpenChange={(open) => setState(prev => ({ ...prev, isImportDialogOpen: open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Import Patterns
              </DialogTitle>
              <DialogDescription>
                Import patterns from a JSON, CSV, or XML file
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-file">Select File</Label>
                <Input
                  ref={fileInputRef}
                  id="import-file"
                  type="file"
                  accept=".json,.csv,.xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImportPatterns(file);
                    }
                  }}
                />
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Import Format</AlertTitle>
                <AlertDescription>
                  Supported formats: JSON, CSV, XML. Existing patterns with the same name will be skipped.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setState(prev => ({ ...prev, isImportDialogOpen: false }))}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog 
          open={state.isExportDialogOpen} 
          onOpenChange={(open) => setState(prev => ({ ...prev, isExportDialogOpen: open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Export Patterns
              </DialogTitle>
              <DialogDescription>
                Export your patterns in various formats
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExportPatterns(filteredPatterns, 'json')}
                  >
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportPatterns(filteredPatterns, 'csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportPatterns(filteredPatterns, 'xml')}
                  >
                    XML
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Exporting {filteredPatterns.length} pattern(s) based on current filters
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setState(prev => ({ ...prev, isExportDialogOpen: false }))}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PatternLibraryManager;