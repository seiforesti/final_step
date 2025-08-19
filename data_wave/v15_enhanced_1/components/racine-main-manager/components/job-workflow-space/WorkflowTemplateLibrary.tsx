'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Filter, Download, Upload, Star, Heart, Eye, 
  ThumbsUp, ThumbsDown, Share2, Copy, Edit3, Trash2, Plus, Minus,
  MoreHorizontal, X, RefreshCw, Settings, Save, BookOpen, Tag,
  Users, Clock, Calendar, TrendingUp, Award, Shield, CheckCircle,
  XCircle, AlertTriangle, Info, Zap, Brain, Target, Activity,
  FileText, Code, Database, Network, Globe, Lock, Unlock, Crown,
  Bookmark, History, GitBranch, GitCommit, ExternalLink, Layers
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

// Advanced Chart components
import { LineChart, BarChart, AreaChart, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, Line, Bar, Area, Pie, Cell } from 'recharts';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import { analyzeTemplatePerformance } from '../../utils/workflow-backend-integration';

// Types from racine-core.types
import { 
  WorkflowTemplate,
  TemplateCategory,
  TemplateRating,
  TemplateVersion,
  TemplateUsageStats,
  TemplateMarketplace,
  CommunityContribution,
  TemplateReview,
  TemplateTag,
  TemplateCollection,
  TemplateAuthor,
  TemplateMetrics,
  TemplateValidation
} from '../../types/racine-core.types';

// Comprehensive Template Categories with Advanced Metadata
const TEMPLATE_CATEGORIES = {
  DATA_PROCESSING: {
    id: 'data_processing',
    name: 'Data Processing',
    icon: Database,
    color: '#10b981',
    gradient: 'from-emerald-400 to-emerald-600',
    description: 'End-to-end data ingestion, transformation, and processing workflows',
    subcategories: ['ETL/ELT', 'Stream Processing', 'Batch Processing', 'Data Migration', 'Data Validation'],
    typical_complexity: 'high',
    avg_duration: 45,
    popularity_score: 95
  },
  COMPLIANCE: {
    id: 'compliance',
    name: 'Compliance & Governance',
    icon: Shield,
    color: '#ef4444',
    gradient: 'from-red-400 to-red-600',
    description: 'Regulatory compliance, audit, and governance automation workflows',
    subcategories: ['GDPR Compliance', 'SOX Audit', 'HIPAA Validation', 'Data Retention', 'Privacy Assessment'],
    typical_complexity: 'high',
    avg_duration: 60,
    popularity_score: 88
  },
  DISCOVERY: {
    id: 'discovery',
    name: 'Data Discovery',
    icon: Search,
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-violet-600',
    description: 'Automated data discovery, profiling, and cataloging workflows',
    subcategories: ['Asset Discovery', 'Schema Analysis', 'Data Profiling', 'Lineage Mapping', 'Quality Assessment'],
    typical_complexity: 'medium',
    avg_duration: 30,
    popularity_score: 92
  },
  SECURITY: {
    id: 'security',
    name: 'Security & Privacy',
    icon: Lock,
    color: '#f59e0b',
    gradient: 'from-amber-400 to-amber-600',
    description: 'Security scanning, vulnerability assessment, and privacy protection workflows',
    subcategories: ['Security Scan', 'Vulnerability Assessment', 'Access Review', 'Encryption Audit', 'Privacy Check'],
    typical_complexity: 'high',
    avg_duration: 40,
    popularity_score: 85
  },
  MONITORING: {
    id: 'monitoring',
    name: 'Monitoring & Alerting',
    icon: Activity,
    color: '#06b6d4',
    gradient: 'from-cyan-400 to-cyan-600',
    description: 'Real-time monitoring, alerting, and performance tracking workflows',
    subcategories: ['Performance Monitoring', 'Alert Management', 'Health Checks', 'SLA Monitoring', 'Anomaly Detection'],
    typical_complexity: 'medium',
    avg_duration: 20,
    popularity_score: 90
  },
  INTEGRATION: {
    id: 'integration',
    name: 'System Integration',
    icon: Network,
    color: '#3b82f6',
    gradient: 'from-blue-400 to-blue-600',
    description: 'Cross-system integration, API orchestration, and data synchronization workflows',
    subcategories: ['API Integration', 'Data Sync', 'System Migration', 'Webhook Processing', 'Event Streaming'],
    typical_complexity: 'high',
    avg_duration: 35,
    popularity_score: 87
  },
  UTILITY: {
    id: 'utility',
    name: 'Utilities & Tools',
    icon: Package,
    color: '#6b7280',
    gradient: 'from-gray-400 to-gray-600',
    description: 'General-purpose utilities, maintenance, and administrative workflows',
    subcategories: ['Maintenance', 'Backup & Recovery', 'Cleanup Tasks', 'Report Generation', 'System Admin'],
    typical_complexity: 'low',
    avg_duration: 15,
    popularity_score: 75
  }
};

// Template Complexity Levels with Detailed Characteristics
const COMPLEXITY_LEVELS = {
  beginner: { 
    label: 'Beginner', 
    color: '#10b981', 
    icon: '🟢',
    description: 'Simple workflows with basic operations and minimal configuration',
    typical_steps: '1-3',
    skill_level: 'Entry Level',
    setup_time: '< 5 minutes'
  },
  intermediate: { 
    label: 'Intermediate', 
    color: '#f59e0b', 
    icon: '🟡',
    description: 'Moderate complexity with some advanced features and custom configuration',
    typical_steps: '4-8',
    skill_level: 'Experienced',
    setup_time: '5-15 minutes'
  },
  advanced: { 
    label: 'Advanced', 
    color: '#ef4444', 
    icon: '🔴',
    description: 'Complex workflows requiring deep understanding and extensive configuration',
    typical_steps: '9-15',
    skill_level: 'Expert',
    setup_time: '15-30 minutes'
  },
  expert: { 
    label: 'Expert', 
    color: '#8b5cf6', 
    icon: '🟣',
    description: 'Highly complex enterprise workflows with advanced orchestration',
    typical_steps: '15+',
    skill_level: 'Architect',
    setup_time: '30+ minutes'
  }
};

// Template Marketplace Sorting Options
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular', icon: TrendingUp },
  { value: 'rating', label: 'Highest Rated', icon: Star },
  { value: 'recent', label: 'Recently Added', icon: Clock },
  { value: 'updated', label: 'Recently Updated', icon: RefreshCw },
  { value: 'downloads', label: 'Most Downloaded', icon: Download },
  { value: 'name', label: 'Name (A-Z)', icon: FileText },
  { value: 'author', label: 'Author', icon: Users },
  { value: 'complexity', label: 'Complexity', icon: Target }
];

// Template Filter Options
const FILTER_OPTIONS = {
  categories: Object.values(TEMPLATE_CATEGORIES),
  complexity: Object.entries(COMPLEXITY_LEVELS).map(([key, value]) => ({ id: key, ...value })),
  duration: [
    { id: 'quick', label: '< 15 minutes', min: 0, max: 15 },
    { id: 'medium', label: '15-60 minutes', min: 15, max: 60 },
    { id: 'long', label: '> 60 minutes', min: 60, max: 999 }
  ],
  rating: [
    { id: '5star', label: '5 Stars', min: 4.5, max: 5 },
    { id: '4star', label: '4+ Stars', min: 4, max: 5 },
    { id: '3star', label: '3+ Stars', min: 3, max: 5 },
    { id: '2star', label: '2+ Stars', min: 2, max: 5 }
  ],
  tags: [
    'enterprise', 'cloud', 'on-premises', 'real-time', 'batch', 'ai-powered',
    'automated', 'manual-review', 'high-volume', 'low-latency', 'scalable',
    'secure', 'compliant', 'cost-effective', 'performance-optimized'
  ]
};

interface WorkflowTemplateLibraryProps {
  onTemplateSelect?: (template: WorkflowTemplate) => void;
  onTemplateImport?: (template: WorkflowTemplate) => void;
  onTemplateCreate?: () => void;
  selectedCategory?: string;
  showMyTemplates?: boolean;
  showCommunityTemplates?: boolean;
  allowContributions?: boolean;
  className?: string;
}

const WorkflowTemplateLibrary: React.FC<WorkflowTemplateLibraryProps> = ({
  onTemplateSelect,
  onTemplateImport,
  onTemplateCreate,
  selectedCategory,
  showMyTemplates = true,
  showCommunityTemplates = true,
  allowContributions = true,
  className = ''
}) => {
  // Hooks for Backend Integration
  const { 
    getWorkflowTemplates,
    createWorkflowTemplate,
    updateWorkflowTemplate,
    deleteWorkflowTemplate,
    importWorkflowTemplate,
    exportWorkflowTemplate,
    validateWorkflowTemplate,
    getTemplateUsageStats,
    rateWorkflowTemplate,
    reviewWorkflowTemplate
  } = useJobWorkflow();
  
  const { 
    getMarketplaceTemplates,
    publishTemplateToMarketplace,
    searchMarketplaceTemplates,
    getTemplateRecommendations,
    reportTemplate,
    moderateTemplate
  } = useRacineOrchestration();
  
  const { 
    getCommunityTemplates,
    contributeToCommunity,
    getCommunityStats,
    getCommunityLeaderboard,
    followTemplateAuthor,
    getMyContributions
  } = useCrossGroupIntegration();
  
  const { getCurrentUser, getUserProfile } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    recommendTemplates,
    analyzeTemplatePerformance,
    suggestTemplateImprovements,
    generateTemplateDescription,
    classifyTemplate
  } = useAIAssistant();

  // Core Template State
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [templateStats, setTemplateStats] = useState<Record<string, TemplateUsageStats>>({});
  const [templateReviews, setTemplateReviews] = useState<Record<string, TemplateReview[]>>({});
  const [templateVersions, setTemplateVersions] = useState<Record<string, TemplateVersion[]>>({});
  const [communityStats, setCommunityStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<TemplateAuthor[]>([]);
  const [myContributions, setMyContributions] = useState<WorkflowTemplate[]>([]);
  const [recommendations, setRecommendations] = useState<WorkflowTemplate[]>([]);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(selectedCategory ? [selectedCategory] : []);
  const [selectedComplexity, setSelectedComplexity] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // UI State Management
  const [activeTab, setActiveTab] = useState('marketplace');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedTemplateForReview, setSelectedTemplateForReview] = useState<WorkflowTemplate | null>(null);

  // Loading and Processing State
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Performance State
  const [loadTime, setLoadTime] = useState(0);
  const [searchPerformance, setSearchPerformance] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Load Templates with Enhanced Filtering
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const startTime = Date.now();

    try {
      const [
        workflowTemplates,
        marketplaceTemplates,
        communityTemplates,
        aiRecommendations,
        statsData,
        communityStatsData
      ] = await Promise.all([
        showMyTemplates ? getWorkflowTemplates() : Promise.resolve([]),
        showCommunityTemplates ? getMarketplaceTemplates() : Promise.resolve([]),
        showCommunityTemplates ? getCommunityTemplates() : Promise.resolve([]),
        recommendTemplates(getCurrentUser()?.id || ''),
        Promise.resolve({}), // getTemplateUsageStats would be called per template
        getCommunityStats()
      ]);

      // Combine all templates with enhanced metadata
      const allTemplates = [
        ...workflowTemplates.map((t: WorkflowTemplate) => ({ ...t, source: 'workspace' })),
        ...marketplaceTemplates.map((t: WorkflowTemplate) => ({ ...t, source: 'marketplace' })),
        ...communityTemplates.map((t: WorkflowTemplate) => ({ ...t, source: 'community' }))
      ];

      // Remove duplicates and enhance with AI insights
      const uniqueTemplates = await Promise.all(
        allTemplates.reduce((acc, template) => {
          const existing = acc.find(t => t.id === template.id);
          if (!existing) {
            acc.push(template);
          }
          return acc;
        }, [] as WorkflowTemplate[])
        .map(async (template) => {
          try {
            // Get real AI insights from backend
            const templateAnalysis = await analyzeTemplatePerformance(template.id);
            return {
              ...template,
              ai_insights: templateAnalysis.insights || {
                performance_score: templateAnalysis.performance_score || 0,
                complexity_analysis: templateAnalysis.complexity_analysis || 'Not analyzed',
                optimization_suggestions: templateAnalysis.optimization_suggestions || [],
                usage_predictions: templateAnalysis.usage_predictions || {}
              }
            };
          } catch (error) {
            console.warn('Failed to analyze template:', template.id, error);
            return {
              ...template,
              ai_insights: {
                performance_score: 0,
                complexity_analysis: 'Analysis unavailable',
                optimization_suggestions: [],
                usage_predictions: {}
              }
            };
          }
        })
      );

      setTemplates(uniqueTemplates);
      setRecommendations(aiRecommendations);
      setCommunityStats(communityStatsData);
      setTotalResults(uniqueTemplates.length);

      const loadDuration = Date.now() - startTime;
      setLoadTime(loadDuration);

      // Track template loading activity
      trackActivity({
        action: 'templates_loaded',
        resource_type: 'workflow_template_library',
        resource_id: 'library',
        details: {
          template_count: uniqueTemplates.length,
          load_time: loadDuration,
          sources: {
            workspace: workflowTemplates.length,
            marketplace: marketplaceTemplates.length,
            community: communityTemplates.length
          },
          recommendations: aiRecommendations.length
        }
      });
    } catch (error: any) {
      console.error('❌ Failed to load templates:', error);
      setLoadError(error.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [
    showMyTemplates, showCommunityTemplates, getWorkflowTemplates, getMarketplaceTemplates,
    getCommunityTemplates, recommendTemplates, getCommunityStats, getCurrentUser, trackActivity
  ]);

  // Advanced Template Filtering with AI Enhancement
  const filterTemplates = useCallback(() => {
    const startTime = Date.now();
    
    let filtered = templates.filter(template => {
      // Text search across multiple fields
      const searchText = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        template.name.toLowerCase().includes(searchText) ||
        template.description.toLowerCase().includes(searchText) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchText)) ||
        template.author?.name?.toLowerCase().includes(searchText) ||
        template.category?.toLowerCase().includes(searchText);

      // Category filtering
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(template.category || '');

      // Complexity filtering
      const matchesComplexity = selectedComplexity.length === 0 || 
        selectedComplexity.includes(template.complexity || '');

      // Duration filtering
      const matchesDuration = selectedDuration.length === 0 || 
        selectedDuration.some(durationId => {
          const duration = FILTER_OPTIONS.duration.find(d => d.id === durationId);
          if (!duration) return false;
          const templateDuration = template.estimated_duration || 0;
          return templateDuration >= duration.min && templateDuration <= duration.max;
        });

      // Rating filtering
      const matchesRating = selectedRating.length === 0 || 
        selectedRating.some(ratingId => {
          const rating = FILTER_OPTIONS.rating.find(r => r.id === ratingId);
          if (!rating) return false;
          const templateRating = template.rating?.average || 0;
          return templateRating >= rating.min && templateRating <= rating.max;
        });

      // Tag filtering
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => template.tags?.includes(tag));

      return matchesSearch && matchesCategory && matchesComplexity && 
             matchesDuration && matchesRating && matchesTags;
    });

    // Advanced sorting with AI insights
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.usage_stats?.total_downloads || 0) - (a.usage_stats?.total_downloads || 0);
        case 'rating':
          return (b.rating?.average || 0) - (a.rating?.average || 0);
        case 'recent':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'updated':
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
        case 'downloads':
          return (b.usage_stats?.total_downloads || 0) - (a.usage_stats?.total_downloads || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'author':
          return (a.author?.name || '').localeCompare(b.author?.name || '');
        case 'complexity':
          const complexityOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
          return complexityOrder.indexOf(a.complexity || '') - complexityOrder.indexOf(b.complexity || '');
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
    const searchTime = Date.now() - startTime;
    setSearchPerformance(searchTime);

    // Track search activity
    if (searchQuery) {
      trackActivity({
        action: 'template_search',
        resource_type: 'workflow_template_library',
        resource_id: 'search',
        details: {
          query: searchQuery,
          results_count: filtered.length,
          search_time: searchTime,
          filters: {
            categories: selectedCategories,
            complexity: selectedComplexity,
            duration: selectedDuration,
            rating: selectedRating,
            tags: selectedTags
          },
          sort_by: sortBy
        }
      });
    }
  }, [
    templates, searchQuery, selectedCategories, selectedComplexity, selectedDuration,
    selectedRating, selectedTags, sortBy, trackActivity
  ]);

  // Import Template with Enhanced Processing
  const importTemplate = useCallback(async (template: WorkflowTemplate) => {
    if (!template) return;

    setIsImporting(true);

    try {
      // Validate template before import
      const validation = await validateWorkflowTemplate(template);
      if (!validation.is_valid) {
        throw new Error(`Template validation failed: ${validation.errors?.join(', ')}`);
      }

      // Import with enhanced metadata
      const importedTemplate = await importWorkflowTemplate({
        ...template,
        imported_at: new Date().toISOString(),
        imported_by: getCurrentUser()?.id || '',
        workspace_id: getActiveWorkspace()?.id || '',
        import_source: template.source || 'unknown',
        validation_results: validation
      });

      // Track successful import
      trackActivity({
        action: 'template_imported',
        resource_type: 'workflow_template',
        resource_id: importedTemplate.id,
        details: {
          template_name: importedTemplate.name,
          category: importedTemplate.category,
          complexity: importedTemplate.complexity,
          source: template.source,
          author: template.author?.name,
          validation_score: validation.score
        }
      });

      onTemplateImport?.(importedTemplate);
      
      // Refresh templates
      await loadTemplates();
    } catch (error: any) {
      console.error('❌ Template import failed:', error);
      setLoadError(error.message);
    } finally {
      setIsImporting(false);
    }
  }, [
    validateWorkflowTemplate, importWorkflowTemplate, getCurrentUser, 
    getActiveWorkspace, trackActivity, onTemplateImport, loadTemplates
  ]);

  // Rate Template with Enhanced Feedback
  const rateTemplate = useCallback(async (templateId: string, rating: number, review?: string) => {
    try {
      const ratingData = await rateWorkflowTemplate(templateId, {
        rating,
        review,
        user_id: getCurrentUser()?.id || '',
        created_at: new Date().toISOString(),
        helpful_votes: 0,
        verified_user: true
      });

      // Update local template data
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { 
              ...t, 
              rating: {
                ...t.rating,
                average: ratingData.new_average,
                count: (t.rating?.count || 0) + 1,
                distribution: ratingData.distribution
              }
            }
          : t
      ));

      // Track rating activity
      trackActivity({
        action: 'template_rated',
        resource_type: 'workflow_template',
        resource_id: templateId,
        details: {
          rating,
          has_review: !!review,
          new_average: ratingData.new_average
        }
      });
    } catch (error: any) {
      console.error('❌ Failed to rate template:', error);
    }
  }, [rateWorkflowTemplate, getCurrentUser, trackActivity]);

  // Enhanced Template Card Component
  const renderTemplateCard = useCallback((template: WorkflowTemplate, index: number) => {
    const category = TEMPLATE_CATEGORIES[template.category?.toUpperCase() as keyof typeof TEMPLATE_CATEGORIES];
    const complexity = COMPLEXITY_LEVELS[template.complexity as keyof typeof COMPLEXITY_LEVELS];
    const isRecommended = recommendations.some(r => r.id === template.id);
    const isMyTemplate = template.author?.id === getCurrentUser()?.id;

    return (
      <motion.div
        key={template.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative"
      >
        <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 ${
          isRecommended ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}>
          {/* Template Header */}
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {category && (
                  <div 
                    className="p-2 rounded-lg shadow-sm"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <category.icon 
                      className="h-5 w-5" 
                      style={{ color: category.color }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-lg leading-tight">{template.name}</h3>
                    {isRecommended && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-100">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Pick
                      </Badge>
                    )}
                    {template.featured && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-100">
                        <Crown className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {isMyTemplate && (
                      <Badge variant="outline" className="text-green-600 border-green-300 bg-green-100">
                        Mine
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{template.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreview(true);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => importTemplate(template)}>
                      <Download className="h-4 w-4 mr-2" />
                      Import
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTemplateSelect?.(template)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedTemplateForReview(template)}>
                      <Star className="h-4 w-4 mr-2" />
                      Rate & Review
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save to Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Template Metadata */}
            <div className="space-y-3">
              {/* Author and Source */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {template.author?.name || 'Unknown Author'}
                  </span>
                  {template.author?.verified && (
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.source}
                </Badge>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {template.rating && template.rating.average > 0 ? (
                    <>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= (template.rating?.average || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {template.rating.average.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({template.rating.count} reviews)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No ratings yet</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>{template.usage_stats?.total_downloads || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{template.usage_stats?.total_views || 0}</span>
                  </div>
                </div>
              </div>

              {/* Complexity and Duration */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {complexity && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        color: complexity.color,
                        borderColor: `${complexity.color}40`,
                        backgroundColor: `${complexity.color}10`
                      }}
                    >
                      <span className="mr-1">{complexity.icon}</span>
                      {complexity.label}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>~{template.estimated_duration || 0}m</span>
                </div>
              </div>

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* AI Insights */}
              {template.ai_insights && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Brain className="h-3 w-3 text-purple-500" />
                      <span className="text-purple-600 font-medium">AI Score</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={template.ai_insights.performance_score} 
                        className="w-16 h-1"
                      />
                      <span className="text-purple-600 font-medium">
                        {Math.round(template.ai_insights.performance_score)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                onClick={() => importTemplate(template)}
                disabled={isImporting}
                className="flex-1"
              >
                {isImporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowPreview(true);
                }}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTemplateSelect?.(template)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [
    recommendations, getCurrentUser, importTemplate, isImporting, 
    onTemplateSelect, setSelectedTemplate, setShowPreview, setSelectedTemplateForReview
  ]);

  // Advanced Search and Filter Panel
  const renderAdvancedFilters = () => (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            Advanced Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TEMPLATE_CATEGORIES).map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories(prev => [...prev, category.id]);
                      } else {
                        setSelectedCategories(prev => prev.filter(c => c !== category.id));
                      }
                    }}
                  />
                  <Label htmlFor={category.id} className="text-sm flex items-center space-x-1">
                    <category.icon className="h-3 w-3" style={{ color: category.color }} />
                    <span>{category.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Complexity */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Complexity Level</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COMPLEXITY_LEVELS).map(([key, complexity]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={selectedComplexity.includes(key)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedComplexity(prev => [...prev, key]);
                      } else {
                        setSelectedComplexity(prev => prev.filter(c => c !== key));
                      }
                    }}
                  />
                  <Label htmlFor={key} className="text-sm flex items-center space-x-1">
                    <span>{complexity.icon}</span>
                    <span>{complexity.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Duration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Estimated Duration</Label>
            <div className="space-y-2">
              {FILTER_OPTIONS.duration.map(duration => (
                <div key={duration.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={duration.id}
                    checked={selectedDuration.includes(duration.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDuration(prev => [...prev, duration.id]);
                      } else {
                        setSelectedDuration(prev => prev.filter(d => d !== duration.id));
                      }
                    }}
                  />
                  <Label htmlFor={duration.id} className="text-sm">
                    {duration.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Minimum Rating</Label>
            <div className="space-y-2">
              {FILTER_OPTIONS.rating.map(rating => (
                <div key={rating.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={rating.id}
                    checked={selectedRating.includes(rating.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRating(prev => [...prev, rating.id]);
                      } else {
                        setSelectedRating(prev => prev.filter(r => r !== rating.id));
                      }
                    }}
                  />
                  <Label htmlFor={rating.id} className="text-sm flex items-center space-x-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= rating.min ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span>{rating.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.tags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(prev => prev.filter(t => t !== tag));
                    } else {
                      setSelectedTags(prev => [...prev, tag]);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedComplexity([]);
                setSelectedDuration([]);
                setSelectedRating([]);
                setSelectedTags([]);
              }}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Effects
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    filterTemplates();
  }, [filterTemplates]);

  // Main Render
  return (
    <div className={`flex h-full bg-gradient-to-br from-white to-gray-50 ${className}`}>
      <TooltipProvider>
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Package className="h-8 w-8 text-blue-600" />
                  {totalResults > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {totalResults > 99 ? '99+' : totalResults}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Workflow Template Library</h1>
                  <p className="text-sm text-gray-500">Discover, import, and share workflow templates</p>
                </div>
              </div>
              
              {loadTime > 0 && (
                <div className="text-xs text-gray-500">
                  Loaded in {loadTime}ms • {totalResults} templates
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Performance */}
              {searchPerformance > 0 && (
                <div className="text-xs text-gray-500">
                  Search: {searchPerformance}ms
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                  {(selectedCategories.length + selectedComplexity.length + selectedDuration.length + selectedRating.length + selectedTags.length) > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {selectedCategories.length + selectedComplexity.length + selectedDuration.length + selectedRating.length + selectedTags.length}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTemplates}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Refresh
                </Button>
                
                {allowContributions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowContributeDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Contribute
                  </Button>
                )}
                
                {onTemplateCreate && (
                  <Button
                    onClick={onTemplateCreate}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Template
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Search and Controls Bar */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates by name, description, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10"
                />
              </div>
              
              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-white rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(selectedCategories.length + selectedComplexity.length + selectedDuration.length + selectedRating.length + selectedTags.length) > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedCategories.map(categoryId => {
                  const category = TEMPLATE_CATEGORIES[categoryId.toUpperCase() as keyof typeof TEMPLATE_CATEGORIES];
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="flex items-center space-x-1">
                      <category.icon className="h-3 w-3" />
                      <span>{category.name}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSelectedCategories(prev => prev.filter(c => c !== categoryId))}
                      />
                    </Badge>
                  ) : null;
                })}
                
                {selectedComplexity.map(complexity => (
                  <Badge key={complexity} variant="secondary" className="flex items-center space-x-1">
                    <span>{COMPLEXITY_LEVELS[complexity as keyof typeof COMPLEXITY_LEVELS]?.label}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedComplexity(prev => prev.filter(c => c !== complexity))}
                    />
                  </Badge>
                ))}
                
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex">
            {/* Templates Grid/List */}
            <div className="flex-1 p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Loading Templates...</h3>
                  <p className="text-gray-500">Fetching the latest workflow templates</p>
                </div>
              ) : loadError ? (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-medium text-red-600 mb-2">Loading Failed</h3>
                  <p className="text-gray-500 mb-4">{loadError}</p>
                  <Button onClick={loadTemplates}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Templates Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || selectedCategories.length > 0 || selectedComplexity.length > 0 || selectedTags.length > 0
                      ? 'Try adjusting your search criteria or filters'
                      : 'No templates are available at the moment'
                    }
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <Button variant="outline" onClick={() => {
                      setSearchQuery('');
                      setSelectedCategories([]);
                      setSelectedComplexity([]);
                      setSelectedDuration([]);
                      setSelectedRating([]);
                      setSelectedTags([]);
                    }}>
                      Clear Filters
                    </Button>
                    {onTemplateCreate && (
                      <Button onClick={onTemplateCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Template
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
                }>
                  {filteredTemplates.map((template, index) => renderTemplateCard(template, index))}
                </div>
              )}
            </div>

            {/* Advanced Filters Sidebar */}
            {showFilters && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 350, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l bg-white"
              >
                <div className="p-4 h-full overflow-y-auto">
                  {renderAdvancedFilters()}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default WorkflowTemplateLibrary;