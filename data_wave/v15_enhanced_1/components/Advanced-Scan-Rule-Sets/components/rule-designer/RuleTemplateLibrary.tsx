/**
 * Rule Template Library Component for Advanced Data Governance
 * Comprehensive template management system with AI-powered generation and organization
 * Features: Template creation, categorization, versioning, sharing, search, and intelligent recommendations
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Plus, Search, Filter, Grid, List, Star, Download, Upload, Share2, Copy, Edit, Trash2, Eye, Tag, Folder, Clock, User, Users, GitBranch, Code, Database, Shield, Zap, Brain, Wand2, Sparkles, BookOpen, FileText, Settings, MoreHorizontal, ChevronDown, ChevronRight, Heart, MessageSquare, TrendingUp, Award, CheckCircle, AlertTriangle, Info, ExternalLink, RefreshCw, SortAsc, SortDesc, Layers, Bookmark, History, Globe, Lock, Unlock, Flag, Target, Cpu, BarChart3, Activity, Calendar, MapPin, Lightbulb, Puzzle, Network, Workflow, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Types and interfaces
import { 
  RuleTemplate, 
  TemplateCategory, 
  TemplateMetadata, 
  TemplateVersion, 
  TemplateFilter, 
  TemplateSearchOptions, 
  TemplateUsageStats, 
  TemplateValidation, 
  TemplateExport, 
  TemplateImport, 
  TemplateSharing, 
  TemplateRecommendation, 
  TemplateAnalytics, 
  TemplateComparison, 
  TemplateDeployment, 
  TemplateConfiguration,
  TemplatePermission,
  TemplateCollection,
  TemplateTag,
  TemplateComment,
  TemplateRating,
  TemplateSnapshot,
  TemplateBackup,
  TemplateAudit,
  TemplatePreview,
  TemplateVariable,
  TemplateDependency
} from '../../types/patterns.types';
import { ScanRule, RuleType, RuleCategory } from '../../types/scan-rules.types';
import { AIInsight, PatternSuggestion } from '../../types/intelligence.types';

// Services and hooks
import { usePatternLibrary } from '../../hooks/usePatternLibrary';
import { useScanRules } from '../../hooks/useScanRules';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useValidation } from '../../hooks/useValidation';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { patternMatcher } from '../../utils/pattern-matcher';
import { validationEngine } from '../../utils/validation-engine';

// Constants
import { THEME_CONFIG, ANIMATION_CONFIG, COMPONENT_CONFIG } from '../../constants/ui-constants';
import { VALIDATION_RULES } from '../../constants/validation-rules';

// =============================================================================
// RULE TEMPLATE LIBRARY COMPONENT
// =============================================================================

interface RuleTemplateLibraryProps {
  selectedTemplate?: RuleTemplate;
  onTemplateSelect?: (template: RuleTemplate) => void;
  onTemplateApply?: (template: RuleTemplate) => void;
  onTemplateCreate?: (template: RuleTemplate) => void;
  mode?: 'browse' | 'select' | 'manage';
  categories?: TemplateCategory[];
  readonly?: boolean;
  className?: string;
}

export const RuleTemplateLibrary: React.FC<RuleTemplateLibraryProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onTemplateApply,
  onTemplateCreate,
  mode = 'browse',
  categories = [],
  readonly = false,
  className = ''
}) => {
  // State management
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'usage' | 'rating'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<TemplateFilter>({
    categories: [],
    tags: [],
    ruleTypes: [],
    complexity: 'all',
    visibility: 'all',
    author: 'all'
  });
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  
  // Form states
  const [newTemplate, setNewTemplate] = useState<Partial<RuleTemplate>>({
    name: '',
    description: '',
    category: 'data_quality',
    visibility: 'private',
    template: '',
    variables: []
  });
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<RuleTemplate | null>(null);
  
  // Additional states
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<TemplateAnalytics | null>(null);
  const [collections, setCollections] = useState<TemplateCollection[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<RuleTemplate[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const {
    templates: libraryTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    searchTemplates,
    getTemplatesByCategory,
    getPopularTemplates,
    getRecentTemplates: fetchRecentTemplates,
    exportTemplates,
    importTemplates,
    shareTemplate,
    rateTemplate,
    addToFavorites,
    removeFromFavorites,
    getTemplateVersions,
    createTemplateVersion,
    getTemplateAnalytics,
    validateTemplate
  } = usePatternLibrary();

  const { generateSuggestions, getRecommendations } = useIntelligence();
  const { trackUserActivity, getComments, addComment } = useCollaboration();
  const { validateRule } = useValidation();

  // =============================================================================
  // CORE TEMPLATE MANAGEMENT
  // =============================================================================

  /**
   * Load templates based on current filters and search
   */
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      let results: RuleTemplate[] = [];

      if (searchQuery.trim()) {
        // Search mode
        results = await searchTemplates(searchQuery, {
          categories: filters.categories.length > 0 ? filters.categories : undefined,
          tags: filters.tags.length > 0 ? filters.tags : undefined,
          ruleTypes: filters.ruleTypes.length > 0 ? filters.ruleTypes : undefined,
          limit: 100
        });
      } else if (selectedCategory !== 'all') {
        // Category mode
        results = await getTemplatesByCategory(selectedCategory as TemplateCategory);
      } else {
        // All templates mode
        results = libraryTemplates || [];
      }

      // Apply additional filters
      results = applyFilters(results);

      // Sort results
      results = sortTemplates(results);

      setTemplates(results);

      // Track search/browse activity
      await trackUserActivity({
        action: 'template_browse',
        query: searchQuery,
        category: selectedCategory,
        filters,
        resultCount: results.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedCategory,
    filters,
    sortBy,
    sortOrder,
    libraryTemplates,
    searchTemplates,
    getTemplatesByCategory,
    trackUserActivity
  ]);

  /**
   * Apply filters to template list
   */
  const applyFilters = useCallback((templates: RuleTemplate[]): RuleTemplate[] => {
    return templates.filter(template => {
      // Complexity filter
      if (filters.complexity !== 'all') {
        const complexity = template.complexity || 0.5;
        switch (filters.complexity) {
          case 'simple':
            if (complexity > 0.33) return false;
            break;
          case 'moderate':
            if (complexity <= 0.33 || complexity > 0.66) return false;
            break;
          case 'complex':
            if (complexity <= 0.66) return false;
            break;
        }
      }

      // Visibility filter
      if (filters.visibility !== 'all') {
        if (template.visibility !== filters.visibility) return false;
      }

      // Author filter
      if (filters.author !== 'all') {
        if (filters.author === 'mine' && template.authorId !== getCurrentUserId()) return false;
        if (filters.author === 'shared' && template.visibility !== 'public') return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const templateTags = template.tags || [];
        if (!filters.tags.some(tag => templateTags.includes(tag))) return false;
      }

      // Rule types filter
      if (filters.ruleTypes.length > 0) {
        const templateTypes = template.supportedRuleTypes || [];
        if (!filters.ruleTypes.some(type => templateTypes.includes(type))) return false;
      }

      return true;
    });
  }, [filters]);

  /**
   * Sort templates based on current sort criteria
   */
  const sortTemplates = useCallback((templates: RuleTemplate[]): RuleTemplate[] => {
    return [...templates].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt || a.createdAt).getTime() - 
                      new Date(b.updatedAt || b.createdAt).getTime();
          break;
        case 'usage':
          comparison = (a.usageCount || 0) - (b.usageCount || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sortBy, sortOrder]);

  /**
   * Generate AI-powered template recommendations
   */
  const generateRecommendations = useCallback(async () => {
    try {
      const userHistory = await getUserTemplateHistory();
      const contextualRecommendations = await getRecommendations({
        type: 'template',
        context: {
          recentTemplates: recentTemplates.slice(0, 5),
          favoriteCategories: Array.from(expandedCategories),
          userPreferences: await getUserPreferences()
        },
        limit: 10
      });

      setRecommendations(contextualRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }, [recentTemplates, expandedCategories, getRecommendations]);

  // =============================================================================
  // TEMPLATE OPERATIONS
  // =============================================================================

  /**
   * Create new template
   */
  const handleCreateTemplate = useCallback(async (templateData: Partial<RuleTemplate>) => {
    try {
      // Validate template
      const validation = await validateTemplate({
        ...templateData,
        template: templateData.template || ''
      } as RuleTemplate);

      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors?.join(', ')}`);
      }

      // Create template
      const template = await createTemplate({
        ...templateData,
        id: generateTemplateId(),
        authorId: getCurrentUserId(),
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        visibility: templateData.visibility || 'private',
        usageCount: 0,
        rating: 0
      } as RuleTemplate);

      // Update local state
      setTemplates(prev => [template, ...prev]);
      setShowCreateDialog(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'data_quality',
        visibility: 'private',
        template: '',
        variables: []
      });

      // Track creation
      await trackUserActivity({
        action: 'template_created',
        templateId: template.id,
        category: template.category,
        timestamp: new Date().toISOString()
      });

      onTemplateCreate?.(template);

    } catch (error) {
      console.error('Error creating template:', error);
    }
  }, [createTemplate, trackUserActivity, onTemplateCreate]);

  /**
   * Handle template selection
   */
  const handleTemplateSelect = useCallback(async (template: RuleTemplate) => {
    // Update usage count
    try {
      const updatedTemplate = {
        ...template,
        usageCount: (template.usageCount || 0) + 1,
        lastUsed: new Date().toISOString()
      };

      await updateTemplate(updatedTemplate);
      
      // Update local state
      setTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));

      // Update recent templates
      setRecentTemplates(prev => {
        const filtered = prev.filter(t => t.id !== template.id);
        return [updatedTemplate, ...filtered.slice(0, 9)];
      });

      // Track selection
      await trackUserActivity({
        action: 'template_selected',
        templateId: template.id,
        category: template.category,
        timestamp: new Date().toISOString()
      });

      onTemplateSelect?.(updatedTemplate);

    } catch (error) {
      console.error('Error updating template usage:', error);
      onTemplateSelect?.(template);
    }
  }, [updateTemplate, trackUserActivity, onTemplateSelect]);

  /**
   * Apply template to current rule
   */
  const handleTemplateApply = useCallback(async (template: RuleTemplate) => {
    try {
      // Validate template before applying
      const validation = await validateTemplate(template);
      
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors?.join(', ')}`);
      }

      // Track application
      await trackUserActivity({
        action: 'template_applied',
        templateId: template.id,
        category: template.category,
        timestamp: new Date().toISOString()
      });

      onTemplateApply?.(template);

    } catch (error) {
      console.error('Error applying template:', error);
    }
  }, [validateTemplate, trackUserActivity, onTemplateApply]);

  /**
   * Delete template
   */
  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      
      // Update local state
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setSelectedTemplates(prev => {
        const updated = new Set(prev);
        updated.delete(templateId);
        return updated;
      });

      // Track deletion
      await trackUserActivity({
        action: 'template_deleted',
        templateId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error deleting template:', error);
    }
  }, [deleteTemplate, trackUserActivity]);

  /**
   * Toggle favorite status
   */
  const handleToggleFavorite = useCallback(async (templateId: string) => {
    const isFavorite = favoriteTemplates.has(templateId);
    
    try {
      if (isFavorite) {
        await removeFromFavorites(templateId);
        setFavoriteTemplates(prev => {
          const updated = new Set(prev);
          updated.delete(templateId);
          return updated;
        });
      } else {
        await addToFavorites(templateId);
        setFavoriteTemplates(prev => new Set([...prev, templateId]));
      }

      // Track favorite action
      await trackUserActivity({
        action: isFavorite ? 'template_unfavorited' : 'template_favorited',
        templateId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [favoriteTemplates, addToFavorites, removeFromFavorites, trackUserActivity]);

  /**
   * Rate template
   */
  const handleRateTemplate = useCallback(async (templateId: string, rating: number) => {
    try {
      await rateTemplate(templateId, rating);
      
      // Update local state
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, rating: calculateNewRating(t.rating || 0, t.ratingCount || 0, rating) }
          : t
      ));

      // Track rating
      await trackUserActivity({
        action: 'template_rated',
        templateId,
        rating,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error rating template:', error);
    }
  }, [rateTemplate, trackUserActivity]);

  // =============================================================================
  // IMPORT/EXPORT OPERATIONS
  // =============================================================================

  /**
   * Handle template export
   */
  const handleExportTemplates = useCallback(async (templateIds: string[], format: 'json' | 'yaml' | 'csv' = 'json') => {
    try {
      const templatesToExport = templates.filter(t => templateIds.includes(t.id));
      const exportData = await exportTemplates(templatesToExport, format);
      
      // Create download
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 
              format === 'yaml' ? 'text/yaml' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `templates_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Track export
      await trackUserActivity({
        action: 'templates_exported',
        templateIds,
        format,
        count: templatesToExport.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error exporting templates:', error);
    }
  }, [templates, exportTemplates, trackUserActivity]);

  /**
   * Handle template import
   */
  const handleImportTemplates = useCallback(async (file: File) => {
    try {
      const fileContent = await readFileContent(file);
      const importedTemplates = await importTemplates(fileContent, file.type);
      
      // Add imported templates to local state
      setTemplates(prev => [...importedTemplates, ...prev]);
      setShowImportDialog(false);

      // Track import
      await trackUserActivity({
        action: 'templates_imported',
        count: importedTemplates.length,
        fileName: file.name,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error importing templates:', error);
    }
  }, [importTemplates, trackUserActivity]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Get current user ID (placeholder)
   */
  const getCurrentUserId = useCallback((): string => {
    // This would be replaced with actual user authentication
    return 'current-user-id';
  }, []);

  /**
   * Generate unique template ID
   */
  const generateTemplateId = useCallback((): string => {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Calculate new rating with weighted average
   */
  const calculateNewRating = useCallback((currentRating: number, ratingCount: number, newRating: number): number => {
    return ((currentRating * ratingCount) + newRating) / (ratingCount + 1);
  }, []);

  /**
   * Read file content
   */
  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  /**
   * Get user template history (placeholder)
   */
  const getUserTemplateHistory = useCallback(async () => {
    // This would fetch actual user history
    return recentTemplates;
  }, [recentTemplates]);

  /**
   * Get user preferences (placeholder)
   */
  const getUserPreferences = useCallback(async () => {
    // This would fetch actual user preferences
    return {
      preferredCategories: Array.from(expandedCategories),
      complexity: 'moderate',
      sortBy,
      viewMode
    };
  }, [expandedCategories, sortBy, viewMode]);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  /**
   * Filter templates based on search and filters
   */
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return template.name.toLowerCase().includes(query) ||
               template.description.toLowerCase().includes(query) ||
               template.tags?.some(tag => tag.toLowerCase().includes(query)) ||
               template.category.toLowerCase().includes(query);
      }
      return true;
    });
  }, [templates, searchQuery]);

  /**
   * Group templates by category
   */
  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce((groups, template) => {
      const category = template.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(template);
      return groups;
    }, {} as Record<string, RuleTemplate[]>);
  }, [filteredTemplates]);

  /**
   * Get template statistics
   */
  const templateStats = useMemo(() => {
    return {
      total: templates.length,
      filtered: filteredTemplates.length,
      public: templates.filter(t => t.visibility === 'public').length,
      private: templates.filter(t => t.visibility === 'private').length,
      favorites: favoriteTemplates.size,
      categories: Object.keys(groupedTemplates).length,
      averageRating: templates.reduce((sum, t) => sum + (t.rating || 0), 0) / templates.length || 0
    };
  }, [templates, filteredTemplates, favoriteTemplates, groupedTemplates]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  /**
   * Load templates on mount and when dependencies change
   */
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  /**
   * Load recent templates and analytics
   */
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        // Load recent templates
        const recent = await fetchRecentTemplates(10);
        setRecentTemplates(recent);

        // Load analytics
        const analyticsData = await getTemplateAnalytics();
        setAnalytics(analyticsData);

        // Generate recommendations
        await generateRecommendations();

      } catch (error) {
        console.error('Error loading additional data:', error);
      }
    };

    loadAdditionalData();
  }, [fetchRecentTemplates, getTemplateAnalytics, generateRecommendations]);

  /**
   * Auto-focus search input
   */
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render template card
   */
  const renderTemplateCard = useCallback((template: RuleTemplate) => (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <Card 
        className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 ${
          selectedTemplate?.id === template.id ? 'ring-2 ring-primary border-primary' : ''
        } ${readonly ? 'opacity-75' : ''}`}
        onClick={() => !readonly && handleTemplateSelect(template)}
      >
        <CardHeader className="pb-3">
          {/* Header with title and actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary">
                  {template.name}
                </CardTitle>
                {favoriteTemplates.has(template.id) && (
                  <Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {template.description}
              </p>
              
              {/* Metadata badges */}
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {template.category.replace('_', ' ')}
                </Badge>
                <Badge 
                  variant={template.visibility === 'public' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {template.visibility === 'public' ? (
                    <><Globe className="h-3 w-3 mr-1" />Public</>
                  ) : (
                    <><Lock className="h-3 w-3 mr-1" />Private</>
                  )}
                </Badge>
                {template.complexity && (
                  <Badge variant="outline" className="text-xs">
                    {template.complexity > 0.66 ? 'Complex' : 
                     template.complexity > 0.33 ? 'Moderate' : 'Simple'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleTemplateApply(template);
                }}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Apply Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setPreviewTemplate(template);
                  setShowPreviewDialog(true);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(template.template);
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(template.id);
                }}>
                  <Heart className={`h-4 w-4 mr-2 ${favoriteTemplates.has(template.id) ? 'text-red-500 fill-current' : ''}`} />
                  {favoriteTemplates.has(template.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setShowShareDialog(true);
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                {template.authorId === getCurrentUserId() && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Template preview */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Template Code</span>
              <Badge variant="outline" className="text-xs">
                v{template.version}
              </Badge>
            </div>
            <code className="text-xs text-gray-800 font-mono break-all line-clamp-4">
              {template.template}
            </code>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 4 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{template.tags.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{template.usageCount || 0} uses</span>
              </span>
              <span className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>{(template.rating || 0).toFixed(1)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{template.authorName || 'Unknown'}</span>
              </span>
            </div>
            <span className="text-gray-500">
              {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleTemplateApply(template);
              }}
              className="flex-1 h-8 text-xs"
              disabled={readonly}
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewTemplate(template);
                setShowPreviewDialog(true);
              }}
              className="h-8 text-xs px-3"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(template.id);
              }}
              className="h-8 w-8 p-0"
              disabled={readonly}
            >
              <Heart className={`h-3 w-3 ${favoriteTemplates.has(template.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ), [
    selectedTemplate,
    favoriteTemplates,
    readonly,
    handleTemplateSelect,
    handleTemplateApply,
    handleToggleFavorite,
    handleDeleteTemplate,
    getCurrentUserId
  ]);

  /**
   * Render template list item
   */
  const renderTemplateListItem = useCallback((template: RuleTemplate) => (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 ${
          selectedTemplate?.id === template.id ? 'ring-2 ring-primary border-primary' : ''
        } ${readonly ? 'opacity-75' : ''}`}
        onClick={() => !readonly && handleTemplateSelect(template)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Selection checkbox for multi-select */}
              {mode === 'manage' && (
                <Checkbox
                  checked={selectedTemplates.has(template.id)}
                  onCheckedChange={(checked) => {
                    const updated = new Set(selectedTemplates);
                    if (checked) {
                      updated.add(template.id);
                    } else {
                      updated.delete(template.id);
                    }
                    setSelectedTemplates(updated);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {/* Template info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary">
                    {template.name}
                  </h3>
                  {favoriteTemplates.has(template.id) && (
                    <Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                  {template.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Folder className="h-3 w-3" />
                    <span>{template.category.replace('_', ' ')}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{template.usageCount || 0} uses</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{(template.rating || 0).toFixed(1)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(template.updatedAt || template.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Badge 
                variant={template.visibility === 'public' ? 'default' : 'outline'}
                className="text-xs"
              >
                {template.visibility === 'public' ? 'Public' : 'Private'}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateApply(template);
                  }}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Apply Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template);
                    setShowPreviewDialog(true);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(template.id);
                  }}>
                    <Heart className={`h-4 w-4 mr-2 ${favoriteTemplates.has(template.id) ? 'text-red-500 fill-current' : ''}`} />
                    {favoriteTemplates.has(template.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ), [
    selectedTemplate,
    favoriteTemplates,
    selectedTemplates,
    readonly,
    mode,
    handleTemplateSelect,
    handleTemplateApply,
    handleToggleFavorite
  ]);

  /**
   * Render category section
   */
  const renderCategorySection = useCallback((category: string, templates: RuleTemplate[]) => {
    const isExpanded = expandedCategories.has(category);
    
    return (
      <Collapsible
        key={category}
        open={isExpanded}
        onOpenChange={(open) => {
          const updated = new Set(expandedCategories);
          if (open) {
            updated.add(category);
          } else {
            updated.delete(category);
          }
          setExpandedCategories(updated);
        }}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center space-x-3">
              <Folder className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {category.replace('_', ' ')}
                </h3>
                <p className="text-sm text-gray-600">
                  {templates.length} template{templates.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-6 pr-4 pb-4">
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {templates.map(template => 
                viewMode === 'grid' 
                  ? renderTemplateCard(template)
                  : renderTemplateListItem(template)
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }, [expandedCategories, viewMode, renderTemplateCard, renderTemplateListItem]);

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <TooltipProvider>
      <div className={`rule-template-library ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Library className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
              <p className="text-gray-600">
                Reusable rule templates for efficient data governance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!readonly && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(true)}
                  disabled={selectedTemplates.size === 0 && mode === 'manage'}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>

                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search templates by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters and controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="data_quality">Data Quality</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="business_rules">Business Rules</SelectItem>
                      <SelectItem value="transformation">Transformation</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated">Last Updated</SelectItem>
                      <SelectItem value="created">Created Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="usage">Usage Count</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFiltersDialog(true)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {/* View mode toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 px-3"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadTemplates()}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{templateStats.total}</div>
              <div className="text-xs text-gray-600">Total Templates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{templateStats.public}</div>
              <div className="text-xs text-gray-600">Public</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{templateStats.private}</div>
              <div className="text-xs text-gray-600">Private</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{templateStats.favorites}</div>
              <div className="text-xs text-gray-600">Favorites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{templateStats.categories}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{templateStats.averageRating.toFixed(1)}</div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Templates */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-gray-600">Loading templates...</span>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Library className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Create your first template to get started'}
                </p>
                {!readonly && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grouped by category */}
                {Object.entries(groupedTemplates).map(([category, templates]) =>
                  renderCategorySection(category, templates)
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Templates */}
            {recentTemplates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Recently Used
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {recentTemplates.slice(0, 5).map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {template.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {template.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Recommended
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {rec.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {(rec.confidence * 100).toFixed(0)}% match
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse by Category
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popular Templates
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  My Favorites
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  My Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Template Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value as TemplateCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_quality">Data Quality</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="business_rules">Business Rules</SelectItem>
                      <SelectItem value="transformation">Transformation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this template does"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="template-code">Template Code</Label>
                <Textarea
                  id="template-code"
                  value={newTemplate.template}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Enter your template code here"
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="template-public"
                    checked={newTemplate.visibility === 'public'}
                    onCheckedChange={(checked) => 
                      setNewTemplate(prev => ({ 
                        ...prev, 
                        visibility: checked ? 'public' : 'private' 
                      }))
                    }
                  />
                  <Label htmlFor="template-public">Make public</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleCreateTemplate(newTemplate)}
                disabled={!newTemplate.name || !newTemplate.template}
              >
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
            </DialogHeader>
            {previewTemplate && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{previewTemplate.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Template Code</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                      {previewTemplate.template}
                    </pre>
                  </div>
                </div>

                {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Variables</h4>
                    <div className="space-y-2">
                      {previewTemplate.variables.map((variable, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-mono text-sm">${variable.name}</span>
                          <span className="text-sm text-gray-600">{variable.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                Close
              </Button>
              {previewTemplate && (
                <Button onClick={() => handleTemplateApply(previewTemplate)}>
                  Apply Template
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Templates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-file">Select File</Label>
                <Input
                  id="import-file"
                  type="file"
                  ref={fileInputRef}
                  accept=".json,.yaml,.yml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImportTemplates(file);
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Supported formats: JSON, YAML
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Templates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {mode === 'manage' && selectedTemplates.size > 0
                    ? `Export ${selectedTemplates.size} selected templates`
                    : `Export all ${filteredTemplates.length} filtered templates`
                  }
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const templateIds = mode === 'manage' && selectedTemplates.size > 0
                    ? Array.from(selectedTemplates)
                    : filteredTemplates.map(t => t.id);
                  handleExportTemplates(templateIds);
                  setShowExportDialog(false);
                }}
              >
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RuleTemplateLibrary;