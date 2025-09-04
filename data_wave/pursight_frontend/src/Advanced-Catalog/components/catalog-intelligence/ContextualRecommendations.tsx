"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Brain, Target, TrendingUp, Star, Sparkles, ThumbsUp, ThumbsDown, Heart, Bookmark, Share2, Copy, Filter, Search, Settings, RefreshCw, Download, Upload, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MoreHorizontal, Eye, EyeOff, Clock, Calendar, User, Users, Tag, Hash, Link, ExternalLink, AlertTriangle, CheckCircle, XCircle, Info, Database, FileText, Cpu, Server, Cloud, Globe, BarChart3, PieChart, Activity, TrendingDown, Zap, Rocket, Compass, Map, Route, Navigation, Award, Crown, Medal, Trophy, Shield, Badge as BadgeIcon, Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Plus, Minus, X, Check, Edit, Trash2, MessageSquare, Bell, Flag, Bookmark as BookmarkIcon, Layers, GitBranch, Network, Workflow } from 'lucide-react'
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
import { catalogRecommendationService } from '../../services/catalog-recommendation.service'
import { useToast } from '@/components/ui/use-toast'

// Types for contextual recommendations
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
  tags: string[]
  quality_score: number
  usage_frequency: number
  business_value: number
  technical_debt: number
  relationships: string[]
  embedding_vector?: number[]
}

interface Recommendation {
  id: string
  type: 'asset_discovery' | 'quality_improvement' | 'usage_optimization' | 'relationship_suggestion' | 'governance_compliance' | 'cost_optimization' | 'security_enhancement' | 'performance_optimization'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  reasoning: string
  confidence_score: number
  impact_score: number
  effort_estimate: 'low' | 'medium' | 'high'
  target_asset_id?: string
  target_asset: DataAsset | null
  related_assets: DataAsset[]
  suggested_actions: SuggestedAction[]
  context: RecommendationContext
  metadata: {
    algorithm: string
    data_sources: string[]
    generated_at: Date
    expires_at?: Date
    tags: string[]
    category: string
    subcategory?: string
  }
  user_feedback?: UserFeedback
  implementation_status: 'pending' | 'in_progress' | 'completed' | 'dismissed' | 'rejected'
  created_by: 'ai_engine' | 'ml_model' | 'rule_engine' | 'user_defined'
  personalization_factors: PersonalizationFactor[]
}

interface SuggestedAction {
  id: string
  type: 'create' | 'update' | 'delete' | 'tag' | 'classify' | 'relate' | 'optimize' | 'validate'
  title: string
  description: string
  parameters: Record<string, any>
  estimated_duration: string
  complexity: 'simple' | 'moderate' | 'complex'
  prerequisites: string[]
  expected_outcome: string
  risk_level: 'low' | 'medium' | 'high'
}

interface RecommendationContext {
  user_role: string
  user_department: string
  current_project?: string
  recent_activities: string[]
  search_history: string[]
  usage_patterns: Record<string, any>
  preferences: UserPreferences
  environment: 'development' | 'staging' | 'production'
  time_context: 'immediate' | 'short_term' | 'long_term'
}

interface UserPreferences {
  preferred_asset_types: string[]
  notification_frequency: 'real_time' | 'daily' | 'weekly' | 'monthly'
  recommendation_types: string[]
  complexity_preference: 'simple' | 'balanced' | 'advanced'
  auto_apply_low_risk: boolean
  show_detailed_explanations: boolean
  include_experimental_features: boolean
}

interface UserFeedback {
  rating: 1 | 2 | 3 | 4 | 5
  helpful: boolean
  implemented: boolean
  comments?: string
  feedback_date: Date
  feedback_type: 'thumbs_up' | 'thumbs_down' | 'star_rating' | 'detailed_review'
}

interface PersonalizationFactor {
  factor: string
  weight: number
  value: any
  explanation: string
}

interface RecommendationFilter {
  types: string[]
  priorities: string[]
  confidence_range: [number, number]
  impact_range: [number, number]
  effort_levels: string[]
  status: string[]
  created_by: string[]
  date_range: { start: Date; end: Date }
  asset_types: string[]
  categories: string[]
  include_dismissed: boolean
  only_actionable: boolean
}

interface RecommendationAnalytics {
  total_recommendations: number
  by_type: Record<string, number>
  by_priority: Record<string, number>
  by_status: Record<string, number>
  average_confidence: number
  average_impact: number
  implementation_rate: number
  user_satisfaction: number
  trending_categories: Array<{
    category: string
    count: number
    growth_rate: number
  }>
  performance_metrics: {
    precision: number
    recall: number
    f1_score: number
    user_engagement: number
  }
}

interface RecommendationTemplate {
  id: string
  name: string
  description: string
  type: string
  parameters: Record<string, any>
  conditions: Array<{
    field: string
    operator: string
    value: any
  }>
  actions: SuggestedAction[]
  enabled: boolean
  created_by: string
  usage_count: number
}

// Main ContextualRecommendations Component
export const ContextualRecommendations: React.FC = () => {
  // Core state management
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [recommendationAnalytics, setRecommendationAnalytics] = useState<RecommendationAnalytics | null>(null)
  const [recommendationTemplates, setRecommendationTemplates] = useState<RecommendationTemplate[]>([])
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    preferred_asset_types: [],
    notification_frequency: 'daily',
    recommendation_types: [],
    complexity_preference: 'balanced',
    auto_apply_low_risk: false,
    show_detailed_explanations: true,
    include_experimental_features: false
  })

  // Filter and view state
  const [recommendationFilter, setRecommendationFilter] = useState<RecommendationFilter>({
    types: [],
    priorities: [],
    confidence_range: [0, 1],
    impact_range: [0, 1],
    effort_levels: [],
    status: [],
    created_by: [],
    date_range: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
    asset_types: [],
    categories: [],
    include_dismissed: false,
    only_actionable: true
  })

  // UI state management
  const [activeTab, setActiveTab] = useState('recommendations')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'kanban'>('grid')
  const [sortBy, setSortBy] = useState<'priority' | 'confidence' | 'impact' | 'created_at' | 'relevance'>('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [showImplementationDialog, setShowImplementationDialog] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Personalization state
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true)
  const [learningMode, setLearningMode] = useState<'passive' | 'active' | 'interactive'>('active')
  const [contextAwareness, setContextAwareness] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(300) // 5 minutes

  // Interaction state
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [expandedRecommendations, setExpandedRecommendations] = useState<string[]>([])
  const [bookmarkedRecommendations, setBookmarkedRecommendations] = useState<string[]>([])
  const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>([])

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery({
    queryKey: ['contextualRecommendations', recommendationFilter, userPreferences],
    queryFn: () => catalogRecommendationService.getContextualRecommendations({
      filter: recommendationFilter,
      preferences: userPreferences,
      personalization_enabled: personalizationEnabled,
      context_awareness: contextAwareness
    }),
    staleTime: 60000,
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  })

  // Query for recommendation analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['recommendationAnalytics', recommendationFilter.date_range],
    queryFn: () => catalogRecommendationService.getRecommendationAnalytics(recommendationFilter.date_range),
    staleTime: 300000
  })

  // Query for recommendation templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['recommendationTemplates'],
    queryFn: () => catalogRecommendationService.getRecommendationTemplates(),
    staleTime: 600000
  })

  // Mutations
  const provideFeedbackMutation = useMutation({
    mutationFn: ({ recommendationId, feedback }: { recommendationId: string; feedback: UserFeedback }) =>
      catalogRecommendationService.provideFeedback(recommendationId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contextualRecommendations'] })
      toast({ title: "Feedback Submitted", description: "Thank you for your feedback!" })
    }
  })

  const implementRecommendationMutation = useMutation({
    mutationFn: ({ recommendationId, actionIds }: { recommendationId: string; actionIds: string[] }) =>
      catalogRecommendationService.implementRecommendation(recommendationId, actionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contextualRecommendations'] })
      toast({ title: "Implementation Started", description: "Recommendation implementation has been initiated" })
    }
  })

  const dismissRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) =>
      catalogRecommendationService.dismissRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contextualRecommendations'] })
      toast({ title: "Recommendation Dismissed", description: "Recommendation has been dismissed" })
    }
  })

  const bookmarkRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) =>
      catalogRecommendationService.bookmarkRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contextualRecommendations'] })
      toast({ title: "Recommendation Bookmarked", description: "Recommendation saved to bookmarks" })
    }
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: UserPreferences) =>
      catalogRecommendationService.updateUserPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contextualRecommendations'] })
      toast({ title: "Preferences Updated", description: "Your preferences have been saved" })
    }
  })

  const generateRecommendationsMutation = useMutation({
    mutationFn: (params: any) =>
      catalogRecommendationService.generateRecommendations(params),
    onSuccess: () => {
      refetchRecommendations()
      toast({ title: "Recommendations Generated", description: "New recommendations have been generated" })
    }
  })

  // Filtered and sorted recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations.filter(rec => {
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          rec.title.toLowerCase().includes(query) ||
          rec.description.toLowerCase().includes(query) ||
          rec.reasoning.toLowerCase().includes(query) ||
          rec.metadata.tags.some(tag => tag.toLowerCase().includes(query))
        
        if (!matchesSearch) return false
      }

      // Apply type filter
      if (recommendationFilter.types.length > 0 && !recommendationFilter.types.includes(rec.type)) {
        return false
      }

      // Apply priority filter
      if (recommendationFilter.priorities.length > 0 && !recommendationFilter.priorities.includes(rec.priority)) {
        return false
      }

      // Apply confidence range filter
      if (rec.confidence_score < recommendationFilter.confidence_range[0] || 
          rec.confidence_score > recommendationFilter.confidence_range[1]) {
        return false
      }

      // Apply impact range filter
      if (rec.impact_score < recommendationFilter.impact_range[0] || 
          rec.impact_score > recommendationFilter.impact_range[1]) {
        return false
      }

      // Apply effort filter
      if (recommendationFilter.effort_levels.length > 0 && !recommendationFilter.effort_levels.includes(rec.effort_estimate)) {
        return false
      }

      // Apply status filter
      if (recommendationFilter.status.length > 0 && !recommendationFilter.status.includes(rec.implementation_status)) {
        return false
      }

      // Apply dismissed filter
      if (!recommendationFilter.include_dismissed && rec.implementation_status === 'dismissed') {
        return false
      }

      // Apply actionable filter
      if (recommendationFilter.only_actionable && rec.suggested_actions.length === 0) {
        return false
      }

      return true
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'confidence':
          comparison = a.confidence_score - b.confidence_score
          break
        case 'impact':
          comparison = a.impact_score - b.impact_score
          break
        case 'created_at':
          comparison = new Date(a.metadata.generated_at).getTime() - new Date(b.metadata.generated_at).getTime()
          break
        case 'relevance':
          // Calculate relevance score based on multiple factors
          const aRelevance = calculateRelevanceScore(a)
          const bRelevance = calculateRelevanceScore(b)
          comparison = aRelevance - bRelevance
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [recommendations, searchQuery, recommendationFilter, sortBy, sortOrder])

  // Calculate relevance score for recommendations
  const calculateRelevanceScore = useCallback((recommendation: Recommendation): number => {
    let score = 0
    
    // Base score from confidence and impact
    score += recommendation.confidence_score * 0.3
    score += recommendation.impact_score * 0.3

    // Priority weight
    const priorityWeights = { critical: 1.0, high: 0.8, medium: 0.6, low: 0.4 }
    score += priorityWeights[recommendation.priority] * 0.2

    // Personalization factors
    if (personalizationEnabled) {
      const personalizedScore = recommendation.personalization_factors.reduce((acc, factor) => {
        return acc + (factor.weight * 0.1)
      }, 0)
      score += personalizedScore * 0.2
    }

    // Recency bonus
    const daysSinceGenerated = (Date.now() - new Date(recommendation.metadata.generated_at).getTime()) / (1000 * 60 * 60 * 24)
    const recencyBonus = Math.max(0, 1 - (daysSinceGenerated / 7)) * 0.1
    score += recencyBonus

    return Math.min(1, Math.max(0, score))
  }, [personalizationEnabled])

  // Recommendation type icons and colors
  const getRecommendationIcon = (type: string) => {
    const iconMap = {
      asset_discovery: Database,
      quality_improvement: CheckCircle,
      usage_optimization: TrendingUp,
      relationship_suggestion: Network,
      governance_compliance: Shield,
      cost_optimization: DollarSign,
      security_enhancement: Lock,
      performance_optimization: Zap
    }
    return iconMap[type] || Lightbulb
  }

  const getRecommendationColor = (type: string) => {
    const colorMap = {
      asset_discovery: 'text-blue-600',
      quality_improvement: 'text-green-600',
      usage_optimization: 'text-purple-600',
      relationship_suggestion: 'text-orange-600',
      governance_compliance: 'text-red-600',
      cost_optimization: 'text-yellow-600',
      security_enhancement: 'text-indigo-600',
      performance_optimization: 'text-pink-600'
    }
    return colorMap[type] || 'text-gray-600'
  }

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50'
    }
    return colorMap[priority] || 'text-gray-600 bg-gray-50'
  }

  // Event handlers
  const handleRecommendationSelect = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation)
  }

  const handleRecommendationExpand = (recommendationId: string) => {
    setExpandedRecommendations(prev => 
      prev.includes(recommendationId) 
        ? prev.filter(id => id !== recommendationId)
        : [...prev, recommendationId]
    )
  }

  const handleFeedback = (recommendationId: string, feedback: UserFeedback) => {
    provideFeedbackMutation.mutate({ recommendationId, feedback })
    setShowFeedbackDialog(false)
  }

  const handleImplementation = (recommendationId: string, actionIds: string[]) => {
    implementRecommendationMutation.mutate({ recommendationId, actionIds })
    setShowImplementationDialog(false)
  }

  const handleDismiss = (recommendationId: string) => {
    dismissRecommendationMutation.mutate(recommendationId)
    setDismissedRecommendations(prev => [...prev, recommendationId])
  }

  const handleBookmark = (recommendationId: string) => {
    bookmarkRecommendationMutation.mutate(recommendationId)
    setBookmarkedRecommendations(prev => 
      prev.includes(recommendationId)
        ? prev.filter(id => id !== recommendationId)
        : [...prev, recommendationId]
    )
  }

  const handleBulkAction = (action: string, recommendationIds: string[]) => {
    switch (action) {
      case 'dismiss':
        recommendationIds.forEach(id => dismissRecommendationMutation.mutate(id))
        break
      case 'bookmark':
        recommendationIds.forEach(id => bookmarkRecommendationMutation.mutate(id))
        break
      case 'implement':
        // Open bulk implementation dialog
        break
    }
    setSelectedRecommendations([])
  }

  const handleGenerateRecommendations = () => {
    const params = {
      force_refresh: true,
      include_experimental: userPreferences.include_experimental_features,
      context_window: '7d',
      max_recommendations: 50
    }
    generateRecommendationsMutation.mutate(params)
  }

  const handlePreferencesUpdate = (newPreferences: UserPreferences) => {
    setUserPreferences(newPreferences)
    updatePreferencesMutation.mutate(newPreferences)
  }

  // Render functions
  const renderRecommendationCard = (recommendation: Recommendation) => {
    const Icon = getRecommendationIcon(recommendation.type)
    const isExpanded = expandedRecommendations.includes(recommendation.id)
    const isSelected = selectedRecommendations.includes(recommendation.id)
    const isBookmarked = bookmarkedRecommendations.includes(recommendation.id)

    return (
      <Card 
        key={recommendation.id}
        className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${recommendation.priority === 'critical' ? 'border-red-200' : ''}`}
        onClick={() => handleRecommendationSelect(recommendation)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getRecommendationColor(recommendation.type)} bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${getRecommendationColor(recommendation.type)}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {recommendation.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(recommendation.priority)}
                  >
                    {recommendation.priority}
                  </Badge>
                  <Badge variant="secondary">
                    {recommendation.type.replace('_', ' ')}
                  </Badge>
                  <div className="text-sm text-slate-500">
                    {Math.round(recommendation.confidence_score * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookmark(recommendation.id)
                    }}
                  >
                    <BookmarkIcon 
                      className={`h-4 w-4 ${isBookmarked ? 'fill-current text-yellow-500' : ''}`} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowFeedbackDialog(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Provide Feedback
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowImplementationDialog(true)}>
                    <Play className="h-4 w-4 mr-2" />
                    Implement
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDismiss(recommendation.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-3">
            {recommendation.description}
          </p>

          {/* Impact and Effort Indicators */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-slate-600">
                  Impact: {Math.round(recommendation.impact_score * 100)}%
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-slate-600">
                  Effort: {recommendation.effort_estimate}
                </span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleRecommendationExpand(recommendation.id)
              }}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Progress Bar for Confidence */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Confidence Score</span>
              <span>{Math.round(recommendation.confidence_score * 100)}%</span>
            </div>
            <Progress value={recommendation.confidence_score * 100} className="h-2" />
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                <Separator />
                
                {/* Reasoning */}
                <div>
                  <h4 className="font-medium text-sm mb-2">AI Reasoning</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {recommendation.reasoning}
                  </p>
                </div>

                {/* Suggested Actions */}
                {recommendation.suggested_actions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Suggested Actions</h4>
                    <div className="space-y-2">
                      {recommendation.suggested_actions.slice(0, 3).map((action, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-slate-500">{action.description}</div>
                          </div>
                        </div>
                      ))}
                      {recommendation.suggested_actions.length > 3 && (
                        <div className="text-sm text-slate-500 text-center">
                          +{recommendation.suggested_actions.length - 3} more actions
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Related Assets */}
                {recommendation.related_assets.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Related Assets</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.related_assets.slice(0, 5).map((asset, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {asset.name}
                        </Badge>
                      ))}
                      {recommendation.related_assets.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{recommendation.related_assets.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Personalization Factors */}
                {personalizationEnabled && recommendation.personalization_factors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Why This is Relevant to You</h4>
                    <div className="space-y-1">
                      {recommendation.personalization_factors.slice(0, 3).map((factor, index) => (
                        <div key={index} className="text-xs text-slate-600 dark:text-slate-400">
                          • {factor.explanation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowImplementationDialog(true)
                    }}
                    disabled={recommendation.suggested_actions.length === 0}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Implement
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFeedbackDialog(true)
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Feedback
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDismiss(recommendation.id)
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    )
  }

  const renderAnalyticsOverview = () => {
    if (!recommendationAnalytics) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Recommendations</p>
                <p className="text-2xl font-bold">{recommendationAnalytics.total_recommendations}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Implementation Rate</p>
                <p className="text-2xl font-bold">{Math.round(recommendationAnalytics.implementation_rate * 100)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Confidence</p>
                <p className="text-2xl font-bold">{Math.round(recommendationAnalytics.average_confidence * 100)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">User Satisfaction</p>
                <p className="text-2xl font-bold">{Math.round(recommendationAnalytics.user_satisfaction * 100)}%</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Effect hooks
  useEffect(() => {
    if (recommendationsData) {
      setRecommendations(recommendationsData)
    }
  }, [recommendationsData])

  useEffect(() => {
    if (analyticsData) {
      setRecommendationAnalytics(analyticsData)
    }
  }, [analyticsData])

  useEffect(() => {
    if (templatesData) {
      setRecommendationTemplates(templatesData)
    }
  }, [templatesData])

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refetchRecommendations()
      }, refreshInterval * 1000)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, refetchRecommendations])

  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Contextual Recommendations
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI-powered insights and suggestions for your data catalog
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
                placeholder="Search recommendations..."
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
                <DropdownMenuItem onClick={() => setViewMode('timeline')}>
                  Timeline View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('kanban')}>
                  Kanban View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('relevance')}>
                  Relevance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('priority')}>
                  Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('confidence')}>
                  Confidence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('impact')}>
                  Impact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('created_at')}>
                  Date Created
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

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
              onClick={handleGenerateRecommendations}
              disabled={generateRecommendationsMutation.isPending}
            >
              {generateRecommendationsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate
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
          {/* Sidebar */}
          <AnimatePresence>
            {(showFilters || showSettings) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden"
              >
                <div className="p-4 h-full overflow-y-auto">
                  <Tabs value={showFilters ? 'filters' : 'settings'} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger 
                        value="filters" 
                        onClick={() => { setShowFilters(true); setShowSettings(false) }}
                      >
                        Filters
                      </TabsTrigger>
                      <TabsTrigger 
                        value="settings"
                        onClick={() => { setShowSettings(true); setShowFilters(false) }}
                      >
                        Settings
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="filters" className="space-y-4 mt-4">
                      {/* Recommendation Types */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Recommendation Types</Label>
                        <div className="space-y-1">
                          {['asset_discovery', 'quality_improvement', 'usage_optimization', 'relationship_suggestion', 'governance_compliance'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                checked={recommendationFilter.types.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setRecommendationFilter(prev => ({
                                      ...prev,
                                      types: [...prev.types, type]
                                    }))
                                  } else {
                                    setRecommendationFilter(prev => ({
                                      ...prev,
                                      types: prev.types.filter(t => t !== type)
                                    }))
                                  }
                                }}
                              />
                              <Label className="text-sm capitalize">{type.replace('_', ' ')}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Priority Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Priority</Label>
                        <div className="space-y-1">
                          {['critical', 'high', 'medium', 'low'].map((priority) => (
                            <div key={priority} className="flex items-center space-x-2">
                              <Checkbox
                                checked={recommendationFilter.priorities.includes(priority)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setRecommendationFilter(prev => ({
                                      ...prev,
                                      priorities: [...prev.priorities, priority]
                                    }))
                                  } else {
                                    setRecommendationFilter(prev => ({
                                      ...prev,
                                      priorities: prev.priorities.filter(p => p !== priority)
                                    }))
                                  }
                                }}
                              />
                              <Label className="text-sm capitalize">{priority}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Confidence Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Confidence Range: {Math.round(recommendationFilter.confidence_range[0] * 100)}% - {Math.round(recommendationFilter.confidence_range[1] * 100)}%
                        </Label>
                        <Slider
                          value={recommendationFilter.confidence_range}
                          onValueChange={(value) => 
                            setRecommendationFilter(prev => ({ ...prev, confidence_range: value as [number, number] }))
                          }
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Impact Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Impact Range: {Math.round(recommendationFilter.impact_range[0] * 100)}% - {Math.round(recommendationFilter.impact_range[1] * 100)}%
                        </Label>
                        <Slider
                          value={recommendationFilter.impact_range}
                          onValueChange={(value) => 
                            setRecommendationFilter(prev => ({ ...prev, impact_range: value as [number, number] }))
                          }
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Implementation Status */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="space-y-1">
                          {['pending', 'in_progress', 'completed', 'dismissed'].map((status) => (
                            <div key={status} className="flex items-center space-x-2">
                              <Checkbox
                                checked={recommendationFilter.status.includes(status)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setRecommendationFilter(prev => ({
                                      ...prev,
                                      status: [...prev.status, status]
                                    }))
                                  } else {
                                    setRecommendationFilter(prev => ({
                                      ...prev,
                                      status: prev.status.filter(s => s !== status)
                                    }))
                                  }
                                }}
                              />
                              <Label className="text-sm capitalize">{status.replace('_', ' ')}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Options */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Include Dismissed</Label>
                          <Switch
                            checked={recommendationFilter.include_dismissed}
                            onCheckedChange={(checked) => 
                              setRecommendationFilter(prev => ({ ...prev, include_dismissed: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Only Actionable</Label>
                          <Switch
                            checked={recommendationFilter.only_actionable}
                            onCheckedChange={(checked) => 
                              setRecommendationFilter(prev => ({ ...prev, only_actionable: checked }))
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 mt-4">
                      {/* Personalization Settings */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Personalization</Label>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Enable Personalization</Label>
                          <Switch
                            checked={personalizationEnabled}
                            onCheckedChange={setPersonalizationEnabled}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Context Awareness</Label>
                          <Switch
                            checked={contextAwareness}
                            onCheckedChange={setContextAwareness}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Learning Mode</Label>
                          <Select value={learningMode} onValueChange={(value: any) => setLearningMode(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="passive">Passive</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="interactive">Interactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Notification Settings */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Notifications</Label>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Frequency</Label>
                          <Select 
                            value={userPreferences.notification_frequency} 
                            onValueChange={(value: any) => 
                              handlePreferencesUpdate({ ...userPreferences, notification_frequency: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="real_time">Real-time</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Auto-apply Low Risk</Label>
                          <Switch
                            checked={userPreferences.auto_apply_low_risk}
                            onCheckedChange={(checked) => 
                              handlePreferencesUpdate({ ...userPreferences, auto_apply_low_risk: checked })
                            }
                          />
                        </div>
                      </div>

                      {/* Auto Refresh */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Auto Refresh</Label>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Enable Auto Refresh</Label>
                          <Switch
                            checked={autoRefresh}
                            onCheckedChange={setAutoRefresh}
                          />
                        </div>

                        {autoRefresh && (
                          <div className="space-y-2">
                            <Label className="text-sm">
                              Refresh Interval: {refreshInterval}s
                            </Label>
                            <Slider
                              value={[refreshInterval]}
                              onValueChange={([value]) => setRefreshInterval(value)}
                              min={60}
                              max={3600}
                              step={60}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>

                      {/* Advanced Options */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Advanced</Label>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Detailed Explanations</Label>
                          <Switch
                            checked={userPreferences.show_detailed_explanations}
                            onCheckedChange={(checked) => 
                              handlePreferencesUpdate({ ...userPreferences, show_detailed_explanations: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Experimental Features</Label>
                          <Switch
                            checked={userPreferences.include_experimental_features}
                            onCheckedChange={(checked) => 
                              handlePreferencesUpdate({ ...userPreferences, include_experimental_features: checked })
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Recommendations Area */}
          <div className="flex-1 p-4" ref={containerRef}>
            {/* Bulk Actions */}
            {selectedRecommendations.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedRecommendations.length} recommendation(s) selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleBulkAction('bookmark', selectedRecommendations)}
                    >
                      <BookmarkIcon className="h-4 w-4 mr-1" />
                      Bookmark
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleBulkAction('dismiss', selectedRecommendations)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleBulkAction('implement', selectedRecommendations)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Implement
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {recommendationsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-lg font-medium">Loading recommendations...</p>
                </div>
              </div>
            ) : (
              /* Recommendations Grid */
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-4'
              }>
                {filteredRecommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No recommendations found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Try adjusting your filters or generate new recommendations
                    </p>
                    <Button onClick={handleGenerateRecommendations}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Recommendations
                    </Button>
                  </div>
                ) : (
                  filteredRecommendations.map(renderRecommendationCard)
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Dialog */}
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Feedback</DialogTitle>
              <DialogDescription>
                Help us improve our recommendations by sharing your feedback
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>How helpful was this recommendation?</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant="ghost"
                      size="sm"
                      className="p-1"
                    >
                      <Star className="h-5 w-5" />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Comments</Label>
                <Textarea 
                  placeholder="Share your thoughts about this recommendation..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox />
                <Label className="text-sm">I implemented this recommendation</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Cancel
              </Button>
              <Button>
                Submit Feedback
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Implementation Dialog */}
        <Dialog open={showImplementationDialog} onOpenChange={setShowImplementationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Implement Recommendation</DialogTitle>
              <DialogDescription>
                Select the actions you want to implement
              </DialogDescription>
            </DialogHeader>

            {selectedRecommendation && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedRecommendation.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedRecommendation.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Suggested Actions</Label>
                  {selectedRecommendation.suggested_actions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded">
                      <Checkbox defaultChecked />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {action.description}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>Duration: {action.estimated_duration}</span>
                          <span>Complexity: {action.complexity}</span>
                          <span>Risk: {action.risk_level}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowImplementationDialog(false)}>
                Cancel
              </Button>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Start Implementation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default ContextualRecommendations