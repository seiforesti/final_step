'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Advanced Chart Components for Analytics
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Monaco Editor for Template Code Editing
import Editor from '@monaco-editor/react';

// Icons
import { 
  Template, FileTemplate, Star, StarOff, Heart, HeartOff, Download, Upload, 
  Copy, Share, Share2, Edit, Edit3, Trash2, Plus, Search, Filter, 
  SortAsc, SortDesc, Grid, List, Eye, EyeOff, Settings, Cog,
  Users, User, UserPlus, UserMinus, Crown, Shield, Lock, Unlock,
  Calendar as CalendarIcon, Clock, Timer, History, Bookmark, BookmarkPlus,
  Tag, Tags, Category, Archive, Folder, FolderOpen, File, FileText,
  GitBranch, GitCommit, GitMerge, GitPullRequest, Code, CodeSquare,
  Layers, Component, Puzzle, Workflow, Zap, Activity, TrendingUp,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Target, Gauge, Monitor, Database, Server, Network, Cloud,
  CheckCircle, XCircle, AlertCircle, Info, Warning, HelpCircle,
  ThumbsUp, ThumbsDown, MessageSquare, MessageCircle, Bell, BellOff,
  Maximize, Minimize, Expand, Shrink, MoreVertical, MoreHorizontal,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw,
  RefreshCw, Pause, Play, Stop, FastForward, Rewind, SkipBack, SkipForward,
  Save, SaveAll, Import, Export, ExternalLink, Link, Unlink,
  Package, PackageOpen, Sparkles, Wand2, Magic, Bot, Brain
} from 'lucide-react';

// Racine System Hooks
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import {
  getPipelineTemplates,
  createPipelineTemplate,
  updatePipelineTemplate,
  deletePipelineTemplate,
  cloneTemplate,
  shareTemplate,
  importTemplate,
  exportTemplate,
  validateTemplate,
  getTemplateCategories,
  searchTemplates,
  getTemplateUsageStats,
  generateTemplateFromPipeline,
  customizeTemplate,
  previewTemplate,
  getTemplateVersions,
  createTemplateVersion,
  restoreTemplateVersion,
  forkTemplate,
  mergeTemplateVersions,
  getTemplateCollaborators,
  inviteCollaborator,
  removeCollaborator,
  getTemplateComments,
  addTemplateComment,
  getTemplateRatings,
  rateTemplate,
  getTemplateAnalytics,
  getTemplateMarketplace,
  publishTemplate,
  unpublishTemplate,
  getTemplateDependencies,
  validateTemplateIntegrity,
  optimizeTemplate,
  generateTemplateDocumentation,
  getTemplateRecommendations,
  generateAITemplate,
  enhanceTemplateWithAI,
  getTemplateTags,
  addTemplateTag,
  getTemplateChangelog,
  getTemplateMetrics
} from '../../utils/pipeline-backend-integration';

// Types from racine-core.types
import {
  PipelineTemplate,
  TemplateCategory,
  TemplateMetadata,
  TemplateVersion,
  TemplateCollaborator,
  TemplateComment,
  TemplateRating,
  TemplateAnalytics,
  TemplateMarketplace,
  TemplateDependency,
  TemplateTag,
  TemplateChangelog,
  TemplateValidation,
  TemplateCustomization,
  TemplatePreview,
  TemplateConfiguration,
  TemplateParameter,
  TemplateWorkflow,
  TemplateMetrics,
  TemplateUsageStats,
  TemplateRecommendation,
  AITemplateGeneration,
  TemplateOptimization,
  TemplateDocumentation,
  TemplateIntegration,
  TemplatePermission,
  TemplateAudit,
  TemplateBackup,
  TemplateExport,
  TemplateImport
} from '../../types/racine-core.types';

// Template Categories Configuration
const TEMPLATE_CATEGORIES = {
  data_ingestion: { label: 'Data Ingestion', icon: Database, color: '#3B82F6' },
  data_processing: { label: 'Data Processing', icon: Cog, color: '#10B981' },
  data_transformation: { label: 'Data Transformation', icon: Workflow, color: '#F59E0B' },
  data_quality: { label: 'Data Quality', icon: Shield, color: '#EF4444' },
  data_governance: { label: 'Data Governance', icon: Crown, color: '#8B5CF6' },
  compliance: { label: 'Compliance', icon: CheckCircle, color: '#059669' },
  analytics: { label: 'Analytics', icon: BarChart3, color: '#06B6D4' },
  ml_ai: { label: 'ML/AI Pipelines', icon: Brain, color: '#EC4899' },
  security: { label: 'Security', icon: Lock, color: '#DC2626' },
  monitoring: { label: 'Monitoring', icon: Monitor, color: '#7C3AED' },
  integration: { label: 'Integration', icon: Link, color: '#0891B2' },
  automation: { label: 'Automation', icon: Zap, color: '#CA8A04' }
};

// Template View Modes
const VIEW_MODES = {
  grid: { label: 'Grid View', icon: Grid },
  list: { label: 'List View', icon: List },
  marketplace: { label: 'Marketplace', icon: Package },
  analytics: { label: 'Analytics', icon: BarChart3 }
};

// Template Sorting Options
const SORT_OPTIONS = {
  name_asc: { label: 'Name (A-Z)', icon: SortAsc },
  name_desc: { label: 'Name (Z-A)', icon: SortDesc },
  created_desc: { label: 'Newest First', icon: Clock },
  created_asc: { label: 'Oldest First', icon: History },
  usage_desc: { label: 'Most Used', icon: TrendingUp },
  rating_desc: { label: 'Highest Rated', icon: Star },
  updated_desc: { label: 'Recently Updated', icon: RefreshCw }
};

// Template Status Types
const TEMPLATE_STATUS = {
  draft: { label: 'Draft', color: '#6B7280', icon: Edit },
  published: { label: 'Published', color: '#10B981', icon: CheckCircle },
  archived: { label: 'Archived', color: '#F59E0B', icon: Archive },
  deprecated: { label: 'Deprecated', color: '#EF4444', icon: XCircle },
  experimental: { label: 'Experimental', color: '#8B5CF6', icon: Sparkles }
};

/**
 * PipelineTemplateManager - Enterprise-Grade Template Management System
 * 
 * Comprehensive template management system that provides advanced features for
 * creating, sharing, versioning, and collaborating on pipeline templates.
 * 
 * Key Features:
 * - Template marketplace with community templates
 * - AI-powered template generation and enhancement
 * - Version control and collaborative editing
 * - Advanced template analytics and metrics
 * - Template validation and optimization
 * - Cross-group template integration
 * - Template documentation and tutorials
 * - Advanced customization and parameterization
 */
const PipelineTemplateManager: React.FC = () => {
  // Racine System Hooks
  const {
    templates,
    createTemplate,
    updateTemplate: updatePipelineTemplate,
    deleteTemplate,
    getTemplateById
  } = usePipelineManagement();

  const {
    orchestrateTemplateExecution,
    validateTemplateOrchestration
  } = useRacineOrchestration();

  const {
    getTemplateIntegrations,
    validateTemplateCompatibility
  } = useCrossGroupIntegration();

  const { currentUser, userPermissions } = useUserManagement();
  const { currentWorkspace, workspaceTemplates } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    generateTemplate, 
    enhanceTemplate, 
    getTemplateInsights,
    optimizeTemplatePerformance 
  } = useAIAssistant();

  // Core State Management
  const [allTemplates, setAllTemplates] = useState<PipelineTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PipelineTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PipelineTemplate | null>(null);
  const [templateCategories, setTemplateCategories] = useState<TemplateCategory[]>([]);
  const [templateVersions, setTemplateVersions] = useState<TemplateVersion[]>([]);
  const [templateCollaborators, setTemplateCollaborators] = useState<TemplateCollaborator[]>([]);
  const [templateComments, setTemplateComments] = useState<TemplateComment[]>([]);
  const [templateAnalytics, setTemplateAnalytics] = useState<TemplateAnalytics | null>(null);
  const [marketplaceTemplates, setMarketplaceTemplates] = useState<TemplateMarketplace[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState('my-templates');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('created_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Template Creation/Editing State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    parameters: [] as TemplateParameter[],
    workflow: null as TemplateWorkflow | null,
    configuration: {} as TemplateConfiguration,
    documentation: '',
    isPublic: false,
    allowForks: true,
    allowComments: true
  });

  // Advanced Features State
  const [aiGenerationDialog, setAiGenerationDialog] = useState(false);
  const [aiGenerationPrompt, setAiGenerationPrompt] = useState('');
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [templateValidation, setTemplateValidation] = useState<TemplateValidation | null>(null);
  const [templateMetrics, setTemplateMetrics] = useState<TemplateMetrics | null>(null);
  const [templateRecommendations, setTemplateRecommendations] = useState<TemplateRecommendation[]>([]);

  // Filter and Search State
  const [filters, setFilters] = useState({
    categories: [] as string[],
    tags: [] as string[],
    authors: [] as string[],
    dateRange: { start: null as Date | null, end: null as Date | null },
    minRating: 0,
    hasDocumentation: false,
    isVerified: false
  });

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const editorRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load Templates Effect
  useEffect(() => {
    loadTemplates();
    loadTemplateCategories();
    loadMarketplaceTemplates();
  }, []);

  // Filter Templates Effect
  useEffect(() => {
    filterAndSortTemplates();
  }, [allTemplates, searchQuery, selectedCategory, selectedStatus, showFavorites, sortOption, filters]);

  // Load Templates from Backend
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const templates = await getPipelineTemplates();
      setAllTemplates(templates);
      
      // Load template recommendations
      const recommendations = await getTemplateRecommendations();
      setTemplateRecommendations(recommendations);

      trackActivity({
        action: 'templates_loaded',
        details: { count: templates.length }
      });
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [trackActivity]);

  // Load Template Categories
  const loadTemplateCategories = useCallback(async () => {
    try {
      const categories = await getTemplateCategories();
      setTemplateCategories(categories);
    } catch (error) {
      console.error('Error loading template categories:', error);
    }
  }, []);

  // Load Marketplace Templates
  const loadMarketplaceTemplates = useCallback(async () => {
    try {
      const marketplace = await getTemplateMarketplace();
      setMarketplaceTemplates(marketplace);
    } catch (error) {
      console.error('Error loading marketplace templates:', error);
    }
  }, []);

  // Filter and Sort Templates
  const filterAndSortTemplates = useCallback(() => {
    let filtered = [...allTemplates];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(template => template.status === selectedStatus);
    }

    // Apply favorites filter
    if (showFavorites) {
      filtered = filtered.filter(template => template.isFavorite);
    }

    // Apply advanced filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(template => filters.categories.includes(template.category));
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(template => 
        template.tags.some(tag => filters.tags.includes(tag))
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(template => template.rating >= filters.minRating);
    }

    if (filters.hasDocumentation) {
      filtered = filtered.filter(template => template.hasDocumentation);
    }

    if (filters.isVerified) {
      filtered = filtered.filter(template => template.isVerified);
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(template => {
        const templateDate = new Date(template.createdAt);
        return templateDate >= filters.dateRange.start! && templateDate <= filters.dateRange.end!;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'created_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'usage_desc':
          return b.usageCount - a.usageCount;
        case 'rating_desc':
          return b.rating - a.rating;
        case 'updated_desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [allTemplates, searchQuery, selectedCategory, selectedStatus, showFavorites, sortOption, filters]);

  // Create New Template
  const handleCreateTemplate = useCallback(async () => {
    setIsCreating(true);
    try {
      const newTemplate = await createPipelineTemplate({
        ...templateForm,
        authorId: currentUser.id,
        workspaceId: currentWorkspace.id
      });
      
      setAllTemplates(prev => [newTemplate, ...prev]);
      setTemplateForm({
        name: '',
        description: '',
        category: '',
        tags: [],
        parameters: [],
        workflow: null,
        configuration: {},
        documentation: '',
        isPublic: false,
        allowForks: true,
        allowComments: true
      });
      setIsCreating(false);

      trackActivity({
        action: 'template_created',
        details: { templateId: newTemplate.id, name: newTemplate.name }
      });
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
    } finally {
      setIsCreating(false);
    }
  }, [templateForm, currentUser.id, currentWorkspace.id, trackActivity]);

  // Update Template
  const handleUpdateTemplate = useCallback(async (templateId: string, updates: Partial<PipelineTemplate>) => {
    try {
      const updatedTemplate = await updatePipelineTemplate(templateId, updates);
      setAllTemplates(prev => prev.map(template => 
        template.id === templateId ? updatedTemplate : template
      ));

      trackActivity({
        action: 'template_updated',
        details: { templateId, updates: Object.keys(updates) }
      });
    } catch (error) {
      console.error('Error updating template:', error);
      setError('Failed to update template');
    }
  }, [trackActivity]);

  // Delete Template
  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    try {
      await deletePipelineTemplate(templateId);
      setAllTemplates(prev => prev.filter(template => template.id !== templateId));

      trackActivity({
        action: 'template_deleted',
        details: { templateId }
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template');
    }
  }, [trackActivity]);

  // Clone Template
  const handleCloneTemplate = useCallback(async (templateId: string) => {
    try {
      const clonedTemplate = await cloneTemplate(templateId);
      setAllTemplates(prev => [clonedTemplate, ...prev]);

      trackActivity({
        action: 'template_cloned',
        details: { originalId: templateId, clonedId: clonedTemplate.id }
      });
    } catch (error) {
      console.error('Error cloning template:', error);
      setError('Failed to clone template');
    }
  }, [trackActivity]);

  // Generate Template with AI
  const handleAIGeneration = useCallback(async () => {
    setIsGeneratingWithAI(true);
    try {
      const aiTemplate = await generateAITemplate(aiGenerationPrompt);
      
      setTemplateForm({
        ...templateForm,
        name: aiTemplate.name,
        description: aiTemplate.description,
        category: aiTemplate.category,
        tags: aiTemplate.tags,
        parameters: aiTemplate.parameters,
        workflow: aiTemplate.workflow,
        configuration: aiTemplate.configuration,
        documentation: aiTemplate.documentation
      });

      setAiGenerationDialog(false);
      setAiGenerationPrompt('');

      trackActivity({
        action: 'ai_template_generated',
        details: { prompt: aiGenerationPrompt }
      });
    } catch (error) {
      console.error('Error generating AI template:', error);
      setError('Failed to generate template with AI');
    } finally {
      setIsGeneratingWithAI(false);
    }
  }, [aiGenerationPrompt, templateForm, trackActivity]);

  // Load Template Details
  const loadTemplateDetails = useCallback(async (templateId: string) => {
    try {
      const [
        template,
        versions,
        collaborators,
        comments,
        analytics,
        metrics
      ] = await Promise.all([
        getTemplateById(templateId),
        getTemplateVersions(templateId),
        getTemplateCollaborators(templateId),
        getTemplateComments(templateId),
        getTemplateAnalytics(templateId),
        getTemplateMetrics(templateId)
      ]);

      setSelectedTemplate(template);
      setTemplateVersions(versions);
      setTemplateCollaborators(collaborators);
      setTemplateComments(comments);
      setTemplateAnalytics(analytics);
      setTemplateMetrics(metrics);
    } catch (error) {
      console.error('Error loading template details:', error);
      setError('Failed to load template details');
    }
  }, []);

  // Validate Template
  const handleValidateTemplate = useCallback(async (templateId: string) => {
    try {
      const validation = await validateTemplate(templateId);
      setTemplateValidation(validation);
    } catch (error) {
      console.error('Error validating template:', error);
      setError('Failed to validate template');
    }
  }, []);

  // Render Template Card
  const renderTemplateCard = useCallback((template: PipelineTemplate) => {
    const categoryConfig = TEMPLATE_CATEGORIES[template.category as keyof typeof TEMPLATE_CATEGORIES];
    const statusConfig = TEMPLATE_STATUS[template.status as keyof typeof TEMPLATE_STATUS];

    return (
      <ContextMenu key={template.id}>
        <ContextMenuTrigger>
          <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {categoryConfig && <categoryConfig.icon className="h-5 w-5" style={{ color: categoryConfig.color }} />}
                  <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateTemplate(template.id, { isFavorite: !template.isFavorite });
                    }}
                  >
                    {template.isFavorite ? 
                      <Heart className="h-4 w-4 text-red-500 fill-current" /> : 
                      <HeartOff className="h-4 w-4" />
                    }
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => loadTemplateDetails(template.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCloneTemplate(template.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription className="line-clamp-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" style={{ borderColor: statusConfig.color }}>
                    <statusConfig.icon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{template.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{template.author.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>{template.usageCount}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => loadTemplateDetails(template.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleCloneTemplate(template.id)}>
            <Copy className="h-4 w-4 mr-2" />
            Clone Template
          </ContextMenuItem>
          <ContextMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            Edit Template
          </ContextMenuItem>
          <ContextMenuItem>
            <GitBranch className="h-4 w-4 mr-2" />
            Create Version
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Share2 className="h-4 w-4 mr-2" />
            Share Template
          </ContextMenuItem>
          <ContextMenuItem>
            <Export className="h-4 w-4 mr-2" />
            Export Template
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={() => handleDeleteTemplate(template.id)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Template
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }, [handleUpdateTemplate, loadTemplateDetails, handleCloneTemplate, handleDeleteTemplate]);

  // Render Template List View
  const renderTemplateList = () => (
    <div className="space-y-2">
      {filteredTemplates.map((template) => {
        const categoryConfig = TEMPLATE_CATEGORIES[template.category as keyof typeof TEMPLATE_CATEGORIES];
        const statusConfig = TEMPLATE_STATUS[template.status as keyof typeof TEMPLATE_STATUS];

        return (
          <Card key={template.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center space-x-2">
                  {categoryConfig && <categoryConfig.icon className="h-5 w-5" style={{ color: categoryConfig.color }} />}
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{template.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" style={{ borderColor: statusConfig.color }}>
                    <statusConfig.icon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm">{template.rating.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Download className="h-3 w-3" />
                  <span>{template.usageCount}</span>
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => loadTemplateDetails(template.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCloneTemplate(template.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  // Render Template Grid View
  const renderTemplateGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredTemplates.map(renderTemplateCard)}
    </div>
  );

  // Render Template Analytics
  const renderTemplateAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTemplates.length}</div>
            <div className="text-xs text-gray-500">
              {allTemplates.filter(t => t.status === 'published').length} Published
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allTemplates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
            <div className="text-xs text-gray-500">
              Downloads & Executions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(allTemplates.reduce((sum, t) => sum + t.rating, 0) / allTemplates.length || 0).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">
              Based on {allTemplates.length} templates
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(
                allTemplates.reduce((acc, t) => {
                  acc[t.category] = (acc[t.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              Most templates created
            </div>
          </CardContent>
        </Card>
      </div>

      {templateAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={templateAnalytics.usageTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="usage" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="downloads" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={templateAnalytics.categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {templateAnalytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  // Render Create Template Dialog
  const renderCreateTemplateDialog = () => (
    <Dialog open={isCreating} onOpenChange={setIsCreating}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Template</span>
          </DialogTitle>
          <DialogDescription>
            Create a new pipeline template for reuse across your organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="template-category">Category</Label>
              <Select 
                value={templateForm.category} 
                onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <config.icon className="h-4 w-4" style={{ color: config.color }} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={templateForm.description}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this template does"
              rows={3}
            />
          </div>

          <div>
            <Label>Template Configuration</Label>
            <div className="border rounded-lg">
              <Editor
                ref={editorRef}
                height="300px"
                defaultLanguage="json"
                value={JSON.stringify(templateForm.configuration, null, 2)}
                onChange={(value) => {
                  try {
                    const config = JSON.parse(value || '{}');
                    setTemplateForm(prev => ({ ...prev, configuration: config }));
                  } catch (error) {
                    // Handle JSON parse error
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="template-public"
                checked={templateForm.isPublic}
                onCheckedChange={(checked) => 
                  setTemplateForm(prev => ({ ...prev, isPublic: checked as boolean }))
                }
              />
              <Label htmlFor="template-public">Make template public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="template-forks"
                checked={templateForm.allowForks}
                onCheckedChange={(checked) => 
                  setTemplateForm(prev => ({ ...prev, allowForks: checked as boolean }))
                }
              />
              <Label htmlFor="template-forks">Allow forks</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setAiGenerationDialog(true)}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate with AI</span>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTemplate} disabled={!templateForm.name || !templateForm.category}>
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render AI Generation Dialog
  const renderAIGenerationDialog = () => (
    <Dialog open={aiGenerationDialog} onOpenChange={setAiGenerationDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Generate Template with AI</span>
          </DialogTitle>
          <DialogDescription>
            Describe what kind of pipeline template you want to create and our AI will generate it for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-prompt">Template Description</Label>
            <Textarea
              id="ai-prompt"
              value={aiGenerationPrompt}
              onChange={(e) => setAiGenerationPrompt(e.target.value)}
              placeholder="Describe the pipeline template you want to create (e.g., 'Create a data ingestion template for processing CSV files from S3, validating data quality, and storing in a data warehouse')"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setAiGenerationDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAIGeneration} 
            disabled={!aiGenerationPrompt || isGeneratingWithAI}
          >
            {isGeneratingWithAI ? (
              <div className="flex items-center space-x-2">
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Generate Template</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Main Component Render
  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Template className="h-6 w-6 text-blue-500" />
                <h1 className="text-2xl font-bold">Template Manager</h1>
              </div>
              <Badge variant="outline">
                {filteredTemplates.length} templates
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Import className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Export className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={75}>
              <div className="h-full flex flex-col">
                {/* Filters and Controls */}
                <div className="p-4 bg-white border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-80"
                        />
                      </div>

                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {Object.entries(TEMPLATE_CATEGORIES).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <config.icon className="h-4 w-4" style={{ color: config.color }} />
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <option.icon className="h-4 w-4" />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant={showFavorites ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowFavorites(!showFavorites)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Button>

                      <div className="flex items-center border rounded-md">
                        {Object.entries(VIEW_MODES).map(([key, mode]) => (
                          <Button
                            key={key}
                            variant={viewMode === key ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode(key)}
                            className="rounded-none border-0"
                          >
                            <mode.icon className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="my-templates">My Templates</TabsTrigger>
                      <TabsTrigger value="shared">Shared</TabsTrigger>
                      <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Template Content */}
                <div className="flex-1 p-6 overflow-auto">
                  <Tabs value={activeTab} className="h-full">
                    <TabsContent value="my-templates" className="h-full">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <RotateCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-lg font-medium">Loading templates...</p>
                          </div>
                        </div>
                      ) : filteredTemplates.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <Template className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium mb-2">No templates found</h3>
                            <p className="text-gray-600 mb-4">
                              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first template'}
                            </p>
                            <Button onClick={() => setIsCreating(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Template
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {viewMode === 'grid' && renderTemplateGrid()}
                          {viewMode === 'list' && renderTemplateList()}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="shared" className="h-full">
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">Shared Templates</h3>
                        <p className="text-gray-600">Templates shared with you by other users</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="marketplace" className="h-full">
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">Template Marketplace</h3>
                        <p className="text-gray-600">Discover and use community templates</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="h-full">
                      {renderTemplateAnalytics()}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full p-4 bg-white border-l">
                <h3 className="font-semibold mb-4">Template Recommendations</h3>
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {templateRecommendations.map((recommendation, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start space-x-2">
                          <Target className="h-4 w-4 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{recommendation.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{recommendation.description}</div>
                            <div className="text-xs text-gray-400 mt-2">
                              Score: {recommendation.score}/100
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Dialogs */}
        {renderCreateTemplateDialog()}
        {renderAIGenerationDialog()}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 max-w-sm"
            >
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Template Manager Error</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setError(null)}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default PipelineTemplateManager;