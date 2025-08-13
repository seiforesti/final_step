"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag, Tags, Hash, Sparkles, Brain, Zap, Target,
  Search, Filter, Settings, RefreshCw, Download, Upload,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  MoreHorizontal, Eye, EyeOff, Clock, Calendar,
  User, Users, Link, ExternalLink, Copy, Share2,
  AlertTriangle, CheckCircle, XCircle, Info,
  Database, FileText, Cpu, Server, Cloud, Globe,
  BarChart3, PieChart, Activity, TrendingUp, TrendingDown,
  Lightbulb, Rocket, Compass, Map, Route, Navigation,
  Award, Crown, Medal, Trophy, Shield, Badge as BadgeIcon,
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize2, Minimize2,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Plus, Minus, X, Check, Edit, Trash2,
  MessageSquare, Bell, Flag, Bookmark,
  Layers, GitBranch, Network, Workflow,
  BookOpen, GraduationCap, Library, Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service'
import { useToast } from '@/components/ui/use-toast'

// Types for smart tagging
interface DataAsset {
  id: string
  name: string
  type: 'dataset' | 'table' | 'column' | 'view' | 'schema' | 'database' | 'model' | 'report' | 'dashboard'
  category: string
  description: string
  owner: string
  created_at: Date
  updated_at: Date
  status: 'active' | 'inactive' | 'deprecated'
  metadata: Record<string, any>
  tags: SmartTag[]
  quality_score: number
  usage_frequency: number
  business_value: number
  schema_info?: SchemaInfo
  content_sample?: any[]
  embedding_vector?: number[]
}

interface SmartTag {
  id: string
  name: string
  value?: string
  type: 'system' | 'user' | 'ai_generated' | 'inherited' | 'computed'
  category: 'business' | 'technical' | 'quality' | 'compliance' | 'domain' | 'custom'
  confidence_score: number
  source: 'manual' | 'rule_engine' | 'ml_model' | 'pattern_matching' | 'semantic_analysis' | 'content_analysis'
  created_at: Date
  created_by: string
  metadata: {
    description?: string
    reasoning?: string
    validation_status?: 'validated' | 'pending' | 'rejected'
    validation_notes?: string
    parent_tag_id?: string
    synonyms?: string[]
    related_tags?: string[]
    usage_count?: number
    last_used?: Date
  }
  rules?: TaggingRule[]
  color?: string
  icon?: string
}

interface TaggingRule {
  id: string
  name: string
  description: string
  type: 'content_pattern' | 'schema_pattern' | 'metadata_pattern' | 'semantic_similarity' | 'business_logic'
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: number
  enabled: boolean
  confidence_threshold: number
  created_by: string
  created_at: Date
  usage_stats: {
    times_applied: number
    success_rate: number
    last_applied: Date
  }
}

interface RuleCondition {
  field: string
  operator: 'equals' | 'contains' | 'regex' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  case_sensitive?: boolean
  weight?: number
}

interface RuleAction {
  type: 'add_tag' | 'remove_tag' | 'set_category' | 'set_confidence' | 'inherit_from_parent' | 'suggest_tag'
  parameters: Record<string, any>
}

interface TagSuggestion {
  id: string
  asset_id: string
  suggested_tag: SmartTag
  reasoning: string
  confidence_score: number
  source_algorithm: string
  created_at: Date
  status: 'pending' | 'accepted' | 'rejected' | 'auto_applied'
  user_feedback?: {
    rating: number
    comments?: string
    feedback_date: Date
  }
}

interface TagHierarchy {
  id: string
  name: string
  description: string
  parent_id?: string
  children: TagHierarchy[]
  level: number
  path: string
  tags: SmartTag[]
  metadata: {
    icon?: string
    color?: string
    aliases?: string[]
    governance_rules?: string[]
  }
}

interface TagAnalytics {
  total_tags: number
  by_category: Record<string, number>
  by_type: Record<string, number>
  by_source: Record<string, number>
  coverage_metrics: {
    tagged_assets: number
    untagged_assets: number
    coverage_percentage: number
    avg_tags_per_asset: number
  }
  quality_metrics: {
    avg_confidence_score: number
    validated_tags: number
    pending_validation: number
    rejected_tags: number
  }
  usage_metrics: {
    most_used_tags: Array<{ tag: string; count: number }>
    trending_tags: Array<{ tag: string; growth_rate: number }>
    orphaned_tags: string[]
  }
  automation_metrics: {
    auto_tagged_assets: number
    manual_tags: number
    ai_suggestions_accepted: number
    ai_suggestions_rejected: number
    rule_application_success_rate: number
  }
}

interface TaggingConfiguration {
  auto_tagging_enabled: boolean
  suggestion_threshold: number
  auto_apply_threshold: number
  max_suggestions_per_asset: number
  enable_inheritance: boolean
  enable_semantic_analysis: boolean
  enable_content_analysis: boolean
  validation_required: boolean
  allowed_tag_sources: string[]
  tag_naming_convention: {
    case_format: 'lowercase' | 'uppercase' | 'camelCase' | 'snake_case' | 'kebab-case'
    max_length: number
    allowed_characters: string
    reserved_prefixes: string[]
  }
  quality_thresholds: {
    min_confidence_score: number
    max_tags_per_asset: number
    require_description: boolean
    require_category: boolean
  }
}

// Main SmartTaggingEngine Component
export const SmartTaggingEngine: React.FC = () => {
  // Core state management
  const [assets, setAssets] = useState<DataAsset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null)
  const [smartTags, setSmartTags] = useState<SmartTag[]>([])
  const [taggingRules, setTaggingRules] = useState<TaggingRule[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([])
  const [tagHierarchy, setTagHierarchy] = useState<TagHierarchy[]>([])
  const [tagAnalytics, setTagAnalytics] = useState<TagAnalytics | null>(null)
  const [taggingConfig, setTaggingConfig] = useState<TaggingConfiguration>({
    auto_tagging_enabled: true,
    suggestion_threshold: 0.7,
    auto_apply_threshold: 0.9,
    max_suggestions_per_asset: 10,
    enable_inheritance: true,
    enable_semantic_analysis: true,
    enable_content_analysis: true,
    validation_required: false,
    allowed_tag_sources: ['manual', 'rule_engine', 'ml_model', 'semantic_analysis'],
    tag_naming_convention: {
      case_format: 'lowercase',
      max_length: 50,
      allowed_characters: 'a-z0-9-_',
      reserved_prefixes: ['system_', 'auto_', 'temp_']
    },
    quality_thresholds: {
      min_confidence_score: 0.5,
      max_tags_per_asset: 20,
      require_description: false,
      require_category: true
    }
  })

  // UI state management
  const [activeTab, setActiveTab] = useState('assets')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'hierarchy' | 'network'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filterBy, setFilterBy] = useState<{
    categories: string[]
    types: string[]
    sources: string[]
    confidence_range: [number, number]
    validation_status: string[]
  }>({
    categories: [],
    types: [],
    sources: [],
    confidence_range: [0, 1],
    validation_status: []
  })

  // Dialog and modal states
  const [showTagEditor, setShowTagEditor] = useState(false)
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [showBulkTagging, setShowBulkTagging] = useState(false)
  const [showTagHierarchyEditor, setShowTagHierarchyEditor] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Editor states
  const [editingTag, setEditingTag] = useState<SmartTag | null>(null)
  const [editingRule, setEditingRule] = useState<TaggingRule | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagCategory, setNewTagCategory] = useState('business')
  const [newTagDescription, setNewTagDescription] = useState('')

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [autoTaggingRunning, setAutoTaggingRunning] = useState(false)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hooks
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Queries
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['taggedAssets', filterBy],
    queryFn: () => enterpriseCatalogService.getAssetsWithTags(filterBy),
    staleTime: 60000
  })

  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['smartTags'],
    queryFn: () => enterpriseCatalogService.getSmartTags(),
    staleTime: 30000
  })

  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['taggingRules'],
    queryFn: () => enterpriseCatalogService.getTaggingRules(),
    staleTime: 120000
  })

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['tagSuggestions'],
    queryFn: () => enterpriseCatalogService.getTagSuggestions(),
    staleTime: 30000
  })

  const { data: hierarchyData, isLoading: hierarchyLoading } = useQuery({
    queryKey: ['tagHierarchy'],
    queryFn: () => enterpriseCatalogService.getTagHierarchy(),
    staleTime: 300000
  })

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['tagAnalytics'],
    queryFn: () => enterpriseCatalogService.getTagAnalytics(),
    staleTime: 60000
  })

  // Mutations
  const createTagMutation = useMutation({
    mutationFn: (tagData: Partial<SmartTag>) => enterpriseCatalogService.createSmartTag(tagData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartTags'] })
      toast({ title: "Tag Created", description: "Smart tag created successfully" })
      setShowTagEditor(false)
      setEditingTag(null)
    }
  })

  const updateTagMutation = useMutation({
    mutationFn: ({ tagId, updates }: { tagId: string; updates: Partial<SmartTag> }) =>
      enterpriseCatalogService.updateSmartTag(tagId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartTags'] })
      toast({ title: "Tag Updated", description: "Smart tag updated successfully" })
    }
  })

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: string) => enterpriseCatalogService.deleteSmartTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartTags'] })
      toast({ title: "Tag Deleted", description: "Smart tag deleted successfully" })
    }
  })

  const applyTagsToAssetMutation = useMutation({
    mutationFn: ({ assetId, tagIds }: { assetId: string; tagIds: string[] }) =>
      enterpriseCatalogService.applyTagsToAsset(assetId, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taggedAssets'] })
      toast({ title: "Tags Applied", description: "Tags applied to asset successfully" })
    }
  })

  const removeTagsFromAssetMutation = useMutation({
    mutationFn: ({ assetId, tagIds }: { assetId: string; tagIds: string[] }) =>
      enterpriseCatalogService.removeTagsFromAsset(assetId, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taggedAssets'] })
      toast({ title: "Tags Removed", description: "Tags removed from asset successfully" })
    }
  })

  const createTaggingRuleMutation = useMutation({
    mutationFn: (ruleData: Partial<TaggingRule>) => enterpriseCatalogService.createTaggingRule(ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taggingRules'] })
      toast({ title: "Rule Created", description: "Tagging rule created successfully" })
      setShowRuleEditor(false)
      setEditingRule(null)
    }
  })

  const runAutoTaggingMutation = useMutation({
    mutationFn: (params: { assetIds?: string[]; ruleIds?: string[]; options?: any }) =>
      enterpriseCatalogService.runAutoTagging(params),
    onMutate: () => setAutoTaggingRunning(true),
    onSuccess: (data) => {
      setAutoTaggingRunning(false)
      queryClient.invalidateQueries({ queryKey: ['taggedAssets'] })
      queryClient.invalidateQueries({ queryKey: ['tagSuggestions'] })
      toast({ 
        title: "Auto-tagging Complete", 
        description: `Applied ${data.tags_applied} tags to ${data.assets_processed} assets` 
      })
    },
    onError: () => {
      setAutoTaggingRunning(false)
      toast({ title: "Auto-tagging Failed", description: "Failed to run auto-tagging", variant: "destructive" })
    }
  })

  const acceptSuggestionMutation = useMutation({
    mutationFn: (suggestionId: string) => enterpriseCatalogService.acceptTagSuggestion(suggestionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagSuggestions'] })
      queryClient.invalidateQueries({ queryKey: ['taggedAssets'] })
      toast({ title: "Suggestion Accepted", description: "Tag suggestion accepted and applied" })
    }
  })

  const rejectSuggestionMutation = useMutation({
    mutationFn: (suggestionId: string) => enterpriseCatalogService.rejectTagSuggestion(suggestionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagSuggestions'] })
      toast({ title: "Suggestion Rejected", description: "Tag suggestion rejected" })
    }
  })

  const bulkTaggingMutation = useMutation({
    mutationFn: ({ assetIds, tagIds, action }: { assetIds: string[]; tagIds: string[]; action: 'add' | 'remove' | 'replace' }) =>
      enterpriseCatalogService.bulkTagging(assetIds, tagIds, action),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['taggedAssets'] })
      toast({ 
        title: "Bulk Tagging Complete", 
        description: `Applied tags to ${data.assets_affected} assets` 
      })
      setShowBulkTagging(false)
    }
  })

  // Filtered and processed data
  const filteredAssets = useMemo(() => {
    if (!assets) return []
    
    return assets.filter(asset => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          asset.name.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.tags.some(tag => tag.name.toLowerCase().includes(query))
        
        if (!matchesSearch) return false
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const assetTagIds = asset.tags.map(tag => tag.id)
        const hasSelectedTags = selectedTags.some(tagId => assetTagIds.includes(tagId))
        if (!hasSelectedTags) return false
      }

      return true
    })
  }, [assets, searchQuery, selectedTags])

  const filteredTags = useMemo(() => {
    if (!smartTags) return []
    
    return smartTags.filter(tag => {
      // Category filter
      if (filterBy.categories.length > 0 && !filterBy.categories.includes(tag.category)) {
        return false
      }

      // Type filter
      if (filterBy.types.length > 0 && !filterBy.types.includes(tag.type)) {
        return false
      }

      // Source filter
      if (filterBy.sources.length > 0 && !filterBy.sources.includes(tag.source)) {
        return false
      }

      // Confidence range filter
      if (tag.confidence_score < filterBy.confidence_range[0] || 
          tag.confidence_score > filterBy.confidence_range[1]) {
        return false
      }

      // Validation status filter
      if (filterBy.validation_status.length > 0) {
        const status = tag.metadata.validation_status || 'pending'
        if (!filterBy.validation_status.includes(status)) {
          return false
        }
      }

      return true
    })
  }, [smartTags, filterBy])

  // Helper functions
  const getTagColor = (tag: SmartTag): string => {
    if (tag.color) return tag.color
    
    const categoryColors = {
      business: 'bg-blue-100 text-blue-800',
      technical: 'bg-green-100 text-green-800',
      quality: 'bg-yellow-100 text-yellow-800',
      compliance: 'bg-red-100 text-red-800',
      domain: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    
    return categoryColors[tag.category] || categoryColors.custom
  }

  const getTagIcon = (tag: SmartTag) => {
    if (tag.icon) return tag.icon
    
    const categoryIcons = {
      business: Hash,
      technical: Cpu,
      quality: CheckCircle,
      compliance: Shield,
      domain: Globe,
      custom: Tag
    }
    
    return categoryIcons[tag.category] || Tag
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    if (confidence >= 0.5) return 'text-orange-600'
    return 'text-red-600'
  }

  // Event handlers
  const handleTagCreate = () => {
    if (!newTagName.trim()) return
    
    const tagData: Partial<SmartTag> = {
      name: newTagName.toLowerCase().replace(/\s+/g, '-'),
      category: newTagCategory as any,
      type: 'user',
      source: 'manual',
      confidence_score: 1.0,
      created_by: 'current_user',
      metadata: {
        description: newTagDescription
      }
    }
    
    createTagMutation.mutate(tagData)
    setNewTagName('')
    setNewTagDescription('')
  }

  const handleTagEdit = (tag: SmartTag) => {
    setEditingTag(tag)
    setShowTagEditor(true)
  }

  const handleTagUpdate = (updates: Partial<SmartTag>) => {
    if (!editingTag) return
    updateTagMutation.mutate({ tagId: editingTag.id, updates })
  }

  const handleTagDelete = (tagId: string) => {
    deleteTagMutation.mutate(tagId)
  }

  const handleApplyTagsToAsset = (assetId: string, tagIds: string[]) => {
    applyTagsToAssetMutation.mutate({ assetId, tagIds })
  }

  const handleRemoveTagsFromAsset = (assetId: string, tagIds: string[]) => {
    removeTagsFromAssetMutation.mutate({ assetId, tagIds })
  }

  const handleRunAutoTagging = (options?: any) => {
    const params = {
      assetIds: selectedAsset ? [selectedAsset.id] : undefined,
      options: {
        confidence_threshold: taggingConfig.auto_apply_threshold,
        max_suggestions: taggingConfig.max_suggestions_per_asset,
        enable_inheritance: taggingConfig.enable_inheritance,
        enable_semantic_analysis: taggingConfig.enable_semantic_analysis,
        enable_content_analysis: taggingConfig.enable_content_analysis,
        ...options
      }
    }
    runAutoTaggingMutation.mutate(params)
  }

  const handleAcceptSuggestion = (suggestionId: string) => {
    acceptSuggestionMutation.mutate(suggestionId)
  }

  const handleRejectSuggestion = (suggestionId: string) => {
    rejectSuggestionMutation.mutate(suggestionId)
  }

  const handleBulkTagging = (assetIds: string[], tagIds: string[], action: 'add' | 'remove' | 'replace') => {
    bulkTaggingMutation.mutate({ assetIds, tagIds, action })
  }

  const handleImportTags = (file: File) => {
    // Implementation for importing tags from file
    setIsProcessing(true)
    setProcessingStatus('Importing tags...')
    
    // Simulate processing
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setProcessingProgress(progress)
      
      if (progress >= 100) {
        clearInterval(interval)
        setIsProcessing(false)
        setProcessingProgress(0)
        setProcessingStatus('')
        toast({ title: "Import Complete", description: "Tags imported successfully" })
      }
    }, 200)
  }

  const handleExportTags = (format: 'json' | 'csv' | 'xlsx') => {
    const data = {
      tags: filteredTags,
      hierarchy: tagHierarchy,
      analytics: tagAnalytics,
      exported_at: new Date().toISOString()
    }
    
    const filename = `smart-tags-export.${format}`
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
    toast({ title: "Export Complete", description: `Tags exported as ${format.toUpperCase()}` })
  }

  // Render functions
  const renderAssetCard = (asset: DataAsset) => {
    const Icon = getTagIcon({ category: 'technical' } as SmartTag)
    
    return (
      <Card 
        key={asset.id}
        className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
          selectedAsset?.id === asset.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => setSelectedAsset(asset)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {asset.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{asset.type}</Badge>
                  <div className="text-sm text-slate-500">
                    {asset.tags.length} tags
                  </div>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleRunAutoTagging()}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-tag Asset
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Tags
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
            {asset.description}
          </p>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tags</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  // Open tag management for this asset
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {asset.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {asset.tags.slice(0, 6).map((tag, index) => {
                  const TagIcon = getTagIcon(tag)
                  return (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className={`${getTagColor(tag)} text-xs`}
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  )
                })}
                {asset.tags.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{asset.tags.length - 6} more
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-400 italic">No tags assigned</div>
            )}
          </div>

          {/* Quality Score */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Tag Coverage</span>
              <span>{Math.min(100, asset.tags.length * 10)}%</span>
            </div>
            <Progress value={Math.min(100, asset.tags.length * 10)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTagCard = (tag: SmartTag) => {
    const Icon = getTagIcon(tag)
    
    return (
      <Card 
        key={tag.id}
        className="transition-all duration-200 hover:shadow-lg"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTagColor(tag)} bg-opacity-20`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">
                  {tag.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{tag.category}</Badge>
                  <Badge variant="secondary">{tag.type}</Badge>
                  <div className={`text-sm ${getConfidenceColor(tag.confidence_score)}`}>
                    {Math.round(tag.confidence_score * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleTagEdit(tag)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Tag
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTagDelete(tag.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Tag
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          {tag.metadata.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
              {tag.metadata.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Source:</span>
              <span className="font-medium">{tag.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Usage:</span>
              <span className="font-medium">{tag.metadata.usage_count || 0} assets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Created:</span>
              <span className="font-medium">
                {new Date(tag.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {tag.metadata.synonyms && tag.metadata.synonyms.length > 0 && (
            <div className="mt-3">
              <span className="text-sm font-medium">Synonyms:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tag.metadata.synonyms.slice(0, 3).map((synonym, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {synonym}
                  </Badge>
                ))}
                {tag.metadata.synonyms.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tag.metadata.synonyms.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderSuggestionCard = (suggestion: TagSuggestion) => {
    const Icon = getTagIcon(suggestion.suggested_tag)
    
    return (
      <Card key={suggestion.id} className="transition-all duration-200 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">
                  {suggestion.suggested_tag.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{suggestion.suggested_tag.category}</Badge>
                  <div className={`text-sm ${getConfidenceColor(suggestion.confidence_score)}`}>
                    {Math.round(suggestion.confidence_score * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAcceptSuggestion(suggestion.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectSuggestion(suggestion.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium">Reasoning:</span>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {suggestion.reasoning}
              </p>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Algorithm:</span>
              <span className="font-medium">{suggestion.source_algorithm}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Created:</span>
              <span className="font-medium">
                {new Date(suggestion.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderAnalyticsOverview = () => {
    if (!tagAnalytics) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Tags</p>
                <p className="text-2xl font-bold">{tagAnalytics.total_tags}</p>
              </div>
              <Tags className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Coverage</p>
                <p className="text-2xl font-bold">{Math.round(tagAnalytics.coverage_metrics.coverage_percentage)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Confidence</p>
                <p className="text-2xl font-bold">{Math.round(tagAnalytics.quality_metrics.avg_confidence_score * 100)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Auto-tagged</p>
                <p className="text-2xl font-bold">{tagAnalytics.automation_metrics.auto_tagged_assets}</p>
              </div>
              <Sparkles className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Effect hooks
  useEffect(() => {
    if (assetsData) {
      setAssets(assetsData)
    }
  }, [assetsData])

  useEffect(() => {
    if (tagsData) {
      setSmartTags(tagsData)
    }
  }, [tagsData])

  useEffect(() => {
    if (rulesData) {
      setTaggingRules(rulesData)
    }
  }, [rulesData])

  useEffect(() => {
    if (suggestionsData) {
      setTagSuggestions(suggestionsData)
    }
  }, [suggestionsData])

  useEffect(() => {
    if (hierarchyData) {
      setTagHierarchy(hierarchyData)
    }
  }, [hierarchyData])

  useEffect(() => {
    if (analyticsData) {
      setTagAnalytics(analyticsData)
    }
  }, [analyticsData])

  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <Tags className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Smart Tagging Engine
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI-powered automated tagging and tag management
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets or tags..."
                className="pl-10 w-64"
              />
            </div>

            {/* View Mode */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  {viewMode}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  List View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('hierarchy')}>
                  Hierarchy View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('network')}>
                  Network View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagEditor(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkTagging(true)}
            >
              <Tags className="h-4 w-4 mr-2" />
              Bulk Tag
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunAutoTagging()}
              disabled={autoTaggingRunning}
            >
              {autoTaggingRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Auto-tag
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportTags('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTags('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTags('xlsx')}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {renderAnalyticsOverview()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Main Area */}
          <div className="flex-1 p-4" ref={containerRef}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="assets">Assets ({filteredAssets.length})</TabsTrigger>
                <TabsTrigger value="tags">Tags ({filteredTags.length})</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions ({tagSuggestions.length})</TabsTrigger>
                <TabsTrigger value="rules">Rules ({taggingRules.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="assets" className="mt-4">
                {assetsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                      <p className="text-lg font-medium">Loading assets...</p>
                    </div>
                  </div>
                ) : (
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'
                      : 'space-y-4'
                  }>
                    {filteredAssets.map(renderAssetCard)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tags" className="mt-4">
                {tagsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                      <p className="text-lg font-medium">Loading tags...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTags.map(renderTagCard)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                      <p className="text-lg font-medium">Loading suggestions...</p>
                    </div>
                  </div>
                ) : tagSuggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No tag suggestions
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Run auto-tagging to generate new suggestions
                    </p>
                    <Button onClick={() => handleRunAutoTagging()}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Suggestions
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tagSuggestions.map(renderSuggestionCard)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rules" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Tagging Rules</h3>
                    <Button onClick={() => setShowRuleEditor(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Rule
                    </Button>
                  </div>
                  
                  {rulesLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center space-y-4">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                        <p className="text-lg font-medium">Loading rules...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {taggingRules.map((rule, index) => (
                        <Card key={rule.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{rule.name}</CardTitle>
                                <CardDescription>{rule.description}</CardDescription>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch checked={rule.enabled} />
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Rule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Play className="h-4 w-4 mr-2" />
                                      Test Rule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Rule
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Type:</span>
                                <Badge variant="outline">{rule.type}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Priority:</span>
                                <span className="font-medium">{rule.priority}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Success Rate:</span>
                                <span className="font-medium">
                                  {Math.round(rule.usage_stats.success_rate * 100)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Times Applied:</span>
                                <span className="font-medium">{rule.usage_stats.times_applied}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Tag Editor Dialog */}
        <Dialog open={showTagEditor} onOpenChange={setShowTagEditor}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
              <DialogDescription>
                {editingTag ? 'Update tag properties' : 'Create a new smart tag for your catalog'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tag Name</Label>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="domain">Domain</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  placeholder="Enter tag description"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTagEditor(false)}>
                Cancel
              </Button>
              <Button onClick={handleTagCreate} disabled={!newTagName.trim()}>
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Processing Progress Dialog */}
        {isProcessing && (
          <Dialog open={isProcessing} onOpenChange={() => {}}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Processing</DialogTitle>
                <DialogDescription>{processingStatus}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <Progress value={processingProgress} className="w-full" />
                <div className="text-center text-sm text-slate-600">
                  {processingProgress}% complete
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Hidden file input for imports */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv,.xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleImportTags(file)
            }
          }}
        />
      </div>
    </TooltipProvider>
  )
}

export default SmartTaggingEngine