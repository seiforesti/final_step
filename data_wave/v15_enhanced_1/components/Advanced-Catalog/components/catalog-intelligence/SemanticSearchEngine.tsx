"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, SortAsc, SortDesc, BookOpen, Tag, Target, 
  Brain, Zap, TrendingUp, Clock, Star, Share2, Download, 
  Settings, RefreshCw, AlertCircle, CheckCircle, XCircle,
  ChevronDown, ChevronRight, Eye, EyeOff, Grid, List,
  BarChart3, PieChart, LineChart, Activity, Users, Database,
  FileText, Image, Video, Music, Code, Archive, Folder,
  Calendar, MapPin, Link, Hash, Layers, Network, Globe,
  Sparkles, Lightbulb, Compass, Crosshair, Telescope
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { semanticSearchService } from '../../services/semantic-search.service'
import { useToast } from '@/components/ui/use-toast'

// Types for semantic search functionality
interface SearchQuery {
  id: string
  query: string
  type: 'natural_language' | 'semantic' | 'vector' | 'hybrid'
  filters: SearchFilter[]
  boost_fields: string[]
  similarity_threshold: number
  max_results: number
  include_embeddings: boolean
  created_at: Date
  user_id: string
}

interface SearchFilter {
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'range' | 'in' | 'not_in'
  value: any
  boost?: number
}

interface SearchResult {
  id: string
  title: string
  description: string
  type: string
  category: string
  tags: string[]
  score: number
  similarity_score: number
  metadata: Record<string, any>
  content_preview: string
  embedding_vector?: number[]
  related_items: RelatedItem[]
  usage_stats: UsageStats
  quality_metrics: QualityMetrics
  lineage_info: LineageInfo
  created_at: Date
  updated_at: Date
  owner: string
  access_level: string
}

interface RelatedItem {
  id: string
  title: string
  type: string
  similarity_score: number
  relationship_type: string
}

interface UsageStats {
  view_count: number
  download_count: number
  share_count: number
  bookmark_count: number
  last_accessed: Date
  popularity_score: number
}

interface QualityMetrics {
  completeness: number
  accuracy: number
  consistency: number
  timeliness: number
  overall_score: number
}

interface LineageInfo {
  upstream_count: number
  downstream_count: number
  depth_level: number
  critical_path: boolean
}

interface SearchSuggestion {
  text: string
  type: 'query' | 'filter' | 'field' | 'value'
  score: number
  category: string
  metadata?: Record<string, any>
}

interface SavedSearch {
  id: string
  name: string
  query: SearchQuery
  results_count: number
  created_at: Date
  last_executed: Date
  is_favorite: boolean
  alerts_enabled: boolean
}

interface SearchAnalytics {
  total_searches: number
  unique_users: number
  avg_results_per_search: number
  top_queries: Array<{ query: string; count: number }>
  search_trends: Array<{ date: Date; count: number }>
  popular_filters: Array<{ filter: string; usage_count: number }>
  user_engagement: {
    click_through_rate: number
    avg_session_duration: number
    bounce_rate: number
  }
}

interface SearchPersonalization {
  user_preferences: {
    preferred_result_types: string[]
    boost_recent_items: boolean
    include_team_content: boolean
    personalization_strength: number
  }
  search_history: Array<{
    query: string
    timestamp: Date
    results_clicked: string[]
  }>
  content_interactions: Array<{
    item_id: string
    interaction_type: string
    timestamp: Date
    duration?: number
  }>
}

// Main SemanticSearchEngine Component
export const SemanticSearchEngine: React.FC = () => {
  // Core state management
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'natural_language' | 'semantic' | 'vector' | 'hybrid'>('hybrid')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics | null>(null)
  const [personalization, setPersonalization] = useState<SearchPersonalization | null>(null)

  // UI state management
  const [activeTab, setActiveTab] = useState('search')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'detailed'>('list')
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity' | 'quality'>('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [qualityThreshold, setQualityThreshold] = useState([70])
  const [similarityThreshold, setSimilarityThreshold] = useState([0.7])
  const [maxResults, setMaxResults] = useState([50])
  const [includeEmbeddings, setIncludeEmbeddings] = useState(false)
  const [enablePersonalization, setEnablePersonalization] = useState(true)
  const [autoSuggest, setAutoSuggest] = useState(true)
  const [showPreview, setShowPreview] = useState(true)

  // Advanced search state
  const [boostFields, setBoostFields] = useState<Array<{ field: string; boost: number }>>([])
  const [excludeTerms, setExcludeTerms] = useState<string[]>([])
  const [mustIncludeTerms, setMustIncludeTerms] = useState<string[]>([])
  const [searchScope, setSearchScope] = useState<'all' | 'my_content' | 'team_content' | 'public'>('all')
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [ownerFilter, setOwnerFilter] = useState<string[]>([])
  const [accessLevelFilter, setAccessLevelFilter] = useState<string[]>([])

  // Dialog and modal state
  const [showSaveSearchDialog, setShowSaveSearchDialog] = useState(false)
  const [showSearchAnalytics, setShowSearchAnalytics] = useState(false)
  const [showPersonalizationSettings, setShowPersonalizationSettings] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showResultDetails, setShowResultDetails] = useState(false)

  // Refs for performance optimization
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const searchHistoryRef = useRef<SearchQuery[]>([])

  // Hooks
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for search suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['searchSuggestions', searchQuery],
    queryFn: () => semanticSearchService.getSearchSuggestions(searchQuery),
    enabled: autoSuggest && searchQuery.length > 2,
    staleTime: 30000
  })

  // Query for saved searches
  const { data: savedSearchesData, isLoading: savedSearchesLoading } = useQuery({
    queryKey: ['savedSearches'],
    queryFn: () => semanticSearchService.getSavedSearches(),
    staleTime: 60000
  })

  // Query for search analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['searchAnalytics'],
    queryFn: () => semanticSearchService.getSearchAnalytics(),
    enabled: showSearchAnalytics,
    staleTime: 300000
  })

  // Query for personalization data
  const { data: personalizationData, isLoading: personalizationLoading } = useQuery({
    queryKey: ['searchPersonalization'],
    queryFn: () => semanticSearchService.getPersonalizationData(),
    enabled: enablePersonalization,
    staleTime: 300000
  })

  // Mutation for performing search
  const searchMutation = useMutation({
    mutationFn: (searchParams: any) => semanticSearchService.performSearch(searchParams),
    onMutate: () => {
      setIsSearching(true)
    },
    onSuccess: (data) => {
      setSearchResults(data.results || [])
      setIsSearching(false)
      // Update search history
      const newQuery: SearchQuery = {
        id: Date.now().toString(),
        query: searchQuery,
        type: searchType,
        filters: searchFilters,
        boost_fields: boostFields.map(b => b.field),
        similarity_threshold: similarityThreshold[0],
        max_results: maxResults[0],
        include_embeddings: includeEmbeddings,
        created_at: new Date(),
        user_id: 'current-user'
      }
      searchHistoryRef.current.unshift(newQuery)
      if (searchHistoryRef.current.length > 100) {
        searchHistoryRef.current = searchHistoryRef.current.slice(0, 100)
      }
    },
    onError: (error) => {
      setIsSearching(false)
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      })
    }
  })

  // Mutation for saving search
  const saveSearchMutation = useMutation({
    mutationFn: (searchData: any) => semanticSearchService.saveSearch(searchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] })
      setShowSaveSearchDialog(false)
      toast({
        title: "Search Saved",
        description: "Your search has been saved successfully."
      })
    }
  })

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      }
    }, 300)
  }, [searchType, searchFilters, boostFields, similarityThreshold, maxResults])

  // Main search function
  const performSearch = useCallback((query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) return

    const searchParams = {
      query: searchTerm,
      type: searchType,
      filters: searchFilters,
      boost_fields: boostFields,
      similarity_threshold: similarityThreshold[0],
      max_results: maxResults[0],
      include_embeddings: includeEmbeddings,
      sort_by: sortBy,
      sort_order: sortOrder,
      categories: selectedCategories,
      types: selectedTypes,
      quality_threshold: qualityThreshold[0],
      exclude_terms: excludeTerms,
      must_include_terms: mustIncludeTerms,
      search_scope: searchScope,
      date_range: dateRange,
      owner_filter: ownerFilter,
      access_level_filter: accessLevelFilter,
      enable_personalization: enablePersonalization
    }

    searchMutation.mutate(searchParams)
  }, [
    searchQuery, searchType, searchFilters, boostFields, similarityThreshold,
    maxResults, includeEmbeddings, sortBy, sortOrder, selectedCategories,
    selectedTypes, qualityThreshold, excludeTerms, mustIncludeTerms,
    searchScope, dateRange, ownerFilter, accessLevelFilter, enablePersonalization
  ])

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value)
    if (autoSuggest && value.length > 2) {
      debouncedSearch(value)
    }
  }

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  // Add search filter
  const addSearchFilter = (filter: SearchFilter) => {
    setSearchFilters(prev => [...prev, filter])
  }

  // Remove search filter
  const removeSearchFilter = (index: number) => {
    setSearchFilters(prev => prev.filter((_, i) => i !== index))
  }

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result)
    setShowResultDetails(true)
    // Track interaction
    semanticSearchService.trackInteraction({
      item_id: result.id,
      interaction_type: 'view',
      timestamp: new Date()
    })
  }

  // Handle result action (download, share, etc.)
  const handleResultAction = async (result: SearchResult, action: string) => {
    try {
      switch (action) {
        case 'download':
          await semanticSearchService.downloadResult(result.id)
          toast({ title: "Download Started", description: `Downloading ${result.title}` })
          break
        case 'bookmark':
          await semanticSearchService.bookmarkResult(result.id)
          toast({ title: "Bookmarked", description: `${result.title} added to bookmarks` })
          break
        case 'share':
          setSelectedResult(result)
          setShowShareDialog(true)
          break
        default:
          break
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action} ${result.title}`,
        variant: "destructive"
      })
    }
  }

  // Execute saved search
  const executeSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query.query)
    setSearchType(savedSearch.query.type)
    setSearchFilters(savedSearch.query.filters)
    setSimilarityThreshold([savedSearch.query.similarity_threshold])
    setMaxResults([savedSearch.query.max_results])
    setIncludeEmbeddings(savedSearch.query.include_embeddings)
    performSearch(savedSearch.query.query)
  }

  // Get search result icon based on type
  const getResultIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'dataset': Database,
      'document': FileText,
      'image': Image,
      'video': Video,
      'audio': Music,
      'code': Code,
      'archive': Archive,
      'folder': Folder,
      'dashboard': BarChart3,
      'report': PieChart,
      'model': Brain,
      'pipeline': Network
    }
    return iconMap[type] || FileText
  }

  // Get quality color based on score
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Format search result content
  const formatResultContent = (result: SearchResult) => {
    return {
      title: result.title,
      description: result.description,
      preview: result.content_preview?.substring(0, 200) + '...',
      metadata: Object.entries(result.metadata).slice(0, 5)
    }
  }

  // Memoized filtered and sorted results
  const processedResults = useMemo(() => {
    let filtered = searchResults

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(result => 
        selectedCategories.includes(result.category)
      )
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(result => 
        selectedTypes.includes(result.type)
      )
    }

    // Apply quality threshold
    if (qualityThreshold[0] > 0) {
      filtered = filtered.filter(result => 
        result.quality_metrics.overall_score >= qualityThreshold[0]
      )
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score
          break
        case 'date':
          comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          break
        case 'popularity':
          comparison = b.usage_stats.popularity_score - a.usage_stats.popularity_score
          break
        case 'quality':
          comparison = b.quality_metrics.overall_score - a.quality_metrics.overall_score
          break
      }
      return sortOrder === 'desc' ? comparison : -comparison
    })

    return filtered
  }, [searchResults, selectedCategories, selectedTypes, qualityThreshold, sortBy, sortOrder])

  // Update suggestions when data changes
  useEffect(() => {
    if (suggestions) {
      setSearchSuggestions(suggestions)
    }
  }, [suggestions])

  // Update saved searches when data changes
  useEffect(() => {
    if (savedSearchesData) {
      setSavedSearches(savedSearchesData)
    }
  }, [savedSearchesData])

  // Update analytics when data changes
  useEffect(() => {
    if (analyticsData) {
      setSearchAnalytics(analyticsData)
    }
  }, [analyticsData])

  // Update personalization when data changes
  useEffect(() => {
    if (personalizationData) {
      setPersonalization(personalizationData)
    }
  }, [personalizationData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Semantic Search Engine
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI-powered intelligent search across your data catalog
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchAnalytics(true)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPersonalizationSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Search Interface */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Search Interface
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {searchType.replace('_', ' ').toUpperCase()}
                </Badge>
                <Switch
                  checked={autoSuggest}
                  onCheckedChange={setAutoSuggest}
                />
                <Label className="text-sm">Auto-suggest</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  placeholder="Enter your search query... (supports natural language)"
                  className="pl-10 pr-20 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="p-2"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSearching ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Type Selection */}
              <div className="flex items-center space-x-4">
                <Label className="text-sm font-medium">Search Type:</Label>
                <RadioGroup
                  value={searchType}
                  onValueChange={(value: any) => setSearchType(value)}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="natural_language" id="natural" />
                    <Label htmlFor="natural" className="text-sm">Natural Language</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="semantic" id="semantic" />
                    <Label htmlFor="semantic" className="text-sm">Semantic</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vector" id="vector" />
                    <Label htmlFor="vector" className="text-sm">Vector</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hybrid" id="hybrid" />
                    <Label htmlFor="hybrid" className="text-sm">Hybrid</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Search Suggestions */}
              <AnimatePresence>
                {autoSuggest && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 space-y-1"
                  >
                    {searchSuggestions.slice(0, 8).map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer"
                        onClick={() => {
                          setSearchQuery(suggestion.text)
                          performSearch(suggestion.text)
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{suggestion.text}</span>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.round(suggestion.score * 100)}%
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Advanced Search Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Similarity Threshold */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Similarity Threshold: {similarityThreshold[0]}
                      </Label>
                      <Slider
                        value={similarityThreshold}
                        onValueChange={setSimilarityThreshold}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Max Results */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Max Results: {maxResults[0]}
                      </Label>
                      <Slider
                        value={maxResults}
                        onValueChange={setMaxResults}
                        min={10}
                        max={200}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Quality Threshold */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Quality Threshold: {qualityThreshold[0]}%
                      </Label>
                      <Slider
                        value={qualityThreshold}
                        onValueChange={setQualityThreshold}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={includeEmbeddings}
                        onCheckedChange={setIncludeEmbeddings}
                      />
                      <Label className="text-sm">Include Embeddings</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={enablePersonalization}
                        onCheckedChange={setEnablePersonalization}
                      />
                      <Label className="text-sm">Personalization</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={showPreview}
                        onCheckedChange={setShowPreview}
                      />
                      <Label className="text-sm">Show Preview</Label>
                    </div>
                  </div>

                  {/* Search Scope */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Search Scope</Label>
                    <Select value={searchScope} onValueChange={(value: any) => setSearchScope(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Content</SelectItem>
                        <SelectItem value="my_content">My Content</SelectItem>
                        <SelectItem value="team_content">Team Content</SelectItem>
                        <SelectItem value="public">Public Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Search Results and Filters */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-indigo-600" />
                  Filters & Refinements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Active Filters */}
                {searchFilters.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Active Filters</Label>
                    <div className="space-y-1">
                      {searchFilters.map((filter, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
                        >
                          <span className="text-xs">
                            {filter.field} {filter.operator} {String(filter.value)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSearchFilter(index)}
                            className="p-1 h-auto"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {['Datasets', 'Documents', 'Models', 'Pipelines', 'Dashboards', 'Reports'].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories(prev => [...prev, category])
                            } else {
                              setSelectedCategories(prev => prev.filter(c => c !== category))
                            }
                          }}
                        />
                        <Label className="text-sm">{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Content Types</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {['CSV', 'JSON', 'Parquet', 'PDF', 'Excel', 'SQL', 'Python', 'R'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes(prev => [...prev, type])
                            } else {
                              setSelectedTypes(prev => prev.filter(t => t !== type))
                            }
                          }}
                        />
                        <Label className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved Searches */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Saved Searches</Label>
                  <ScrollArea className="h-32">
                    <div className="space-y-1">
                      {savedSearches.map((savedSearch) => (
                        <div
                          key={savedSearch.id}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer"
                          onClick={() => executeSavedSearch(savedSearch)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {savedSearch.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {savedSearch.query.query}
                            </div>
                          </div>
                          {savedSearch.is_favorite && (
                            <Star className="h-3 w-3 text-yellow-500 ml-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Results Area */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Telescope className="h-5 w-5 mr-2 text-green-600" />
                    Search Results
                    {searchResults.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {processedResults.length} of {searchResults.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-none border-x border-slate-200 dark:border-slate-700"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('detailed')}
                        className="rounded-l-none"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Sort Controls */}
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
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
                      onClick={() => setShowSaveSearchDialog(true)}
                      disabled={!searchQuery.trim()}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Status */}
                {isSearching && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                        <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Searching...</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          AI is analyzing your query and finding the best matches
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Results */}
                {!isSearching && searchQuery && processedResults.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">No results found</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Try adjusting your search terms or filters
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchFilters([])
                            setSelectedCategories([])
                            setSelectedTypes([])
                            setQualityThreshold([0])
                          }}
                        >
                          Clear Filters
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchType('hybrid')}
                        >
                          Try Hybrid Search
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Display */}
                {!isSearching && processedResults.length > 0 && (
                  <div className="space-y-4">
                    {/* Results Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div>
                        Showing {processedResults.length} results in {searchType.replace('_', ' ')} mode
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          Avg. Score: {(processedResults.reduce((sum, r) => sum + r.score, 0) / processedResults.length).toFixed(2)}
                        </div>
                        <div>
                          Avg. Quality: {(processedResults.reduce((sum, r) => sum + r.quality_metrics.overall_score, 0) / processedResults.length).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Results Grid/List */}
                    <div className={`grid gap-4 ${
                      viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                      viewMode === 'list' ? 'grid-cols-1' :
                      'grid-cols-1'
                    }`}>
                      {processedResults.map((result) => {
                        const IconComponent = getResultIcon(result.type)
                        const formattedContent = formatResultContent(result)
                        
                        return (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all cursor-pointer ${
                              viewMode === 'detailed' ? 'space-y-4' : 'space-y-2'
                            }`}
                            onClick={() => handleResultSelect(result)}
                          >
                            {/* Result Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1 min-w-0">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                  <IconComponent className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                    {formattedContent.title}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {formattedContent.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <Badge variant="outline" className="text-xs">
                                  {result.type}
                                </Badge>
                                <div className="text-xs font-medium text-blue-600">
                                  {Math.round(result.score * 100)}%
                                </div>
                              </div>
                            </div>

                            {/* Result Metadata */}
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(result.updated_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>{result.owner}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{result.usage_stats.view_count}</span>
                                </div>
                              </div>
                              <div className={`font-medium ${getQualityColor(result.quality_metrics.overall_score)}`}>
                                Q: {result.quality_metrics.overall_score}%
                              </div>
                            </div>

                            {/* Tags */}
                            {result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {result.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {result.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{result.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Detailed View Additional Info */}
                            {viewMode === 'detailed' && (
                              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                {/* Content Preview */}
                                {showPreview && formattedContent.preview && (
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                                    <p className="text-slate-700 dark:text-slate-300">
                                      {formattedContent.preview}
                                    </p>
                                  </div>
                                )}

                                {/* Quality Metrics */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="flex justify-between">
                                    <span>Completeness:</span>
                                    <span className="font-medium">{result.quality_metrics.completeness}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Accuracy:</span>
                                    <span className="font-medium">{result.quality_metrics.accuracy}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Consistency:</span>
                                    <span className="font-medium">{result.quality_metrics.consistency}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Timeliness:</span>
                                    <span className="font-medium">{result.quality_metrics.timeliness}%</span>
                                  </div>
                                </div>

                                {/* Lineage Info */}
                                {result.lineage_info && (
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                      <Network className="h-3 w-3" />
                                      <span>Upstream: {result.lineage_info.upstream_count}</span>
                                      <span>Downstream: {result.lineage_info.downstream_count}</span>
                                    </div>
                                    {result.lineage_info.critical_path && (
                                      <Badge variant="destructive" className="text-xs">
                                        Critical Path
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Related Items */}
                                {result.related_items.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                      Related Items:
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {result.related_items.slice(0, 3).map((item, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {item.title} ({Math.round(item.similarity_score * 100)}%)
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleResultAction(result, 'bookmark')
                                  }}
                                  className="p-1 h-auto"
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleResultAction(result, 'share')
                                  }}
                                  className="p-1 h-auto"
                                >
                                  <Share2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleResultAction(result, 'download')
                                  }}
                                  className="p-1 h-auto"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-xs text-slate-500">
                                Similarity: {Math.round(result.similarity_score * 100)}%
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Load More */}
                    {processedResults.length >= maxResults[0] && (
                      <div className="flex justify-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMaxResults([maxResults[0] + 50])
                            performSearch()
                          }}
                          disabled={isSearching}
                        >
                          Load More Results
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs and Modals */}
        
        {/* Save Search Dialog */}
        <Dialog open={showSaveSearchDialog} onOpenChange={setShowSaveSearchDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
              <DialogDescription>
                Save this search query for quick access later
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Name</Label>
                <Input placeholder="Enter a name for this search..." />
              </div>
              <div className="space-y-2">
                <Label>Query</Label>
                <Textarea
                  value={searchQuery}
                  readOnly
                  className="text-sm bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch />
                <Label className="text-sm">Enable alerts for new results</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch />
                <Label className="text-sm">Add to favorites</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSaveSearchDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Save search logic here
                setShowSaveSearchDialog(false)
                toast({ title: "Search Saved", description: "Your search has been saved successfully." })
              }}>
                Save Search
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search Analytics Dialog */}
        <Dialog open={showSearchAnalytics} onOpenChange={setShowSearchAnalytics}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Search Analytics</DialogTitle>
              <DialogDescription>
                Comprehensive analytics for search performance and usage
              </DialogDescription>
            </DialogHeader>
            {searchAnalytics && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Searches</p>
                          <p className="text-2xl font-bold">{searchAnalytics.total_searches.toLocaleString()}</p>
                        </div>
                        <Search className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Unique Users</p>
                          <p className="text-2xl font-bold">{searchAnalytics.unique_users.toLocaleString()}</p>
                        </div>
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Results</p>
                          <p className="text-2xl font-bold">{searchAnalytics.avg_results_per_search.toFixed(1)}</p>
                        </div>
                        <Target className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Click Rate</p>
                          <p className="text-2xl font-bold">{(searchAnalytics.user_engagement.click_through_rate * 100).toFixed(1)}%</p>
                        </div>
                        <Activity className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Queries */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Search Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchAnalytics.top_queries.slice(0, 10).map((query, index) => (
                        <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              #{index + 1}
                            </div>
                            <div className="text-sm">{query.query}</div>
                          </div>
                          <Badge variant="secondary">{query.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchAnalytics.popular_filters.slice(0, 8).map((filter, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded">
                          <div className="text-sm font-medium">{filter.filter}</div>
                          <div className="flex items-center space-x-2">
                            <Progress value={(filter.usage_count / searchAnalytics.popular_filters[0].usage_count) * 100} className="w-16" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">{filter.usage_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Personalization Settings Dialog */}
        <Dialog open={showPersonalizationSettings} onOpenChange={setShowPersonalizationSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Personalization Settings</DialogTitle>
              <DialogDescription>
                Customize your search experience with AI-powered personalization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Personalization Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Personalization</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use AI to personalize search results based on your behavior
                  </p>
                </div>
                <Switch
                  checked={enablePersonalization}
                  onCheckedChange={setEnablePersonalization}
                />
              </div>

              {enablePersonalization && personalization && (
                <>
                  {/* Preferred Content Types */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Preferred Content Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Datasets', 'Documents', 'Models', 'Pipelines', 'Dashboards', 'Reports'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            checked={personalization.user_preferences.preferred_result_types.includes(type)}
                            onCheckedChange={(checked) => {
                              // Update preferences logic here
                            }}
                          />
                          <Label className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personalization Strength */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Personalization Strength: {personalization.user_preferences.personalization_strength}%
                    </Label>
                    <Slider
                      value={[personalization.user_preferences.personalization_strength]}
                      onValueChange={(value) => {
                        // Update personalization strength logic here
                      }}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Aggressive</span>
                    </div>
                  </div>

                  {/* Additional Preferences */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Additional Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Boost recent items</Label>
                        <Switch
                          checked={personalization.user_preferences.boost_recent_items}
                          onCheckedChange={(checked) => {
                            // Update preference logic here
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Include team content</Label>
                        <Switch
                          checked={personalization.user_preferences.include_team_content}
                          onCheckedChange={(checked) => {
                            // Update preference logic here
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search History Summary */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Recent Search Activity</Label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Total Searches:</span>
                          <span className="font-medium ml-2">{personalization.search_history.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Content Interactions:</span>
                          <span className="font-medium ml-2">{personalization.content_interactions.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPersonalizationSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Save personalization settings logic here
                setShowPersonalizationSettings(false)
                toast({ title: "Settings Saved", description: "Your personalization settings have been updated." })
              }}>
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Result Details Dialog */}
        <Dialog open={showResultDetails} onOpenChange={setShowResultDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedResult && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    {React.createElement(getResultIcon(selectedResult.type), { className: "h-5 w-5" })}
                    <span>{selectedResult.title}</span>
                    <Badge variant="outline">{selectedResult.type}</Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedResult.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Detailed Information */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="metadata">Metadata</TabsTrigger>
                      <TabsTrigger value="quality">Quality</TabsTrigger>
                      <TabsTrigger value="lineage">Lineage</TabsTrigger>
                      <TabsTrigger value="usage">Usage</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Content Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                            {selectedResult.content_preview}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Owner:</span>
                              <span className="font-medium">{selectedResult.owner}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Category:</span>
                              <span className="font-medium">{selectedResult.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Access Level:</span>
                              <Badge variant="outline">{selectedResult.access_level}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Created:</span>
                              <span className="font-medium">{new Date(selectedResult.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Updated:</span>
                              <span className="font-medium">{new Date(selectedResult.updated_at).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Search Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Relevance Score:</span>
                              <span className="font-medium">{Math.round(selectedResult.score * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Similarity Score:</span>
                              <span className="font-medium">{Math.round(selectedResult.similarity_score * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Quality Score:</span>
                              <span className={`font-medium ${getQualityColor(selectedResult.quality_metrics.overall_score)}`}>
                                {selectedResult.quality_metrics.overall_score}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Popularity:</span>
                              <span className="font-medium">{selectedResult.usage_stats.popularity_score}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Tags */}
                      {selectedResult.tags.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Tags</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {selectedResult.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="metadata" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(selectedResult.metadata).map(([key, value], index) => (
                              <div key={index} className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">{key}:</span>
                                <span className="text-sm">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="quality" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Quality Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Completeness</span>
                                <span className="text-sm font-medium">{selectedResult.quality_metrics.completeness}%</span>
                              </div>
                              <Progress value={selectedResult.quality_metrics.completeness} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Accuracy</span>
                                <span className="text-sm font-medium">{selectedResult.quality_metrics.accuracy}%</span>
                              </div>
                              <Progress value={selectedResult.quality_metrics.accuracy} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Consistency</span>
                                <span className="text-sm font-medium">{selectedResult.quality_metrics.consistency}%</span>
                              </div>
                              <Progress value={selectedResult.quality_metrics.consistency} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Timeliness</span>
                                <span className="text-sm font-medium">{selectedResult.quality_metrics.timeliness}%</span>
                              </div>
                              <Progress value={selectedResult.quality_metrics.timeliness} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Overall Score</CardTitle>
                          </CardHeader>
                          <CardContent className="flex items-center justify-center">
                            <div className="text-center">
                              <div className={`text-4xl font-bold ${getQualityColor(selectedResult.quality_metrics.overall_score)}`}>
                                {selectedResult.quality_metrics.overall_score}%
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                Overall Quality Score
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="lineage" className="space-y-4">
                      {selectedResult.lineage_info && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Upstream</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                              <div className="text-3xl font-bold text-blue-600">
                                {selectedResult.lineage_info.upstream_count}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Dependencies</p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Downstream</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                              <div className="text-3xl font-bold text-green-600">
                                {selectedResult.lineage_info.downstream_count}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Dependents</p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Depth Level</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                              <div className="text-3xl font-bold text-purple-600">
                                {selectedResult.lineage_info.depth_level}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Levels Deep</p>
                              {selectedResult.lineage_info.critical_path && (
                                <Badge variant="destructive" className="mt-2">
                                  Critical Path
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="usage" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Usage Statistics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Views:</span>
                              <span className="font-medium">{selectedResult.usage_stats.view_count.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Downloads:</span>
                              <span className="font-medium">{selectedResult.usage_stats.download_count.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Shares:</span>
                              <span className="font-medium">{selectedResult.usage_stats.share_count.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Bookmarks:</span>
                              <span className="font-medium">{selectedResult.usage_stats.bookmark_count.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Last Accessed:</span>
                              <span className="font-medium">{new Date(selectedResult.usage_stats.last_accessed).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Popularity Score</CardTitle>
                          </CardHeader>
                          <CardContent className="flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-orange-600">
                                {selectedResult.usage_stats.popularity_score}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                Popularity Index
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Related Items */}
                      {selectedResult.related_items.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Related Items</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedResult.related_items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                                  <div className="flex items-center space-x-3">
                                    {React.createElement(getResultIcon(item.type), { className: "h-4 w-4 text-slate-600 dark:text-slate-400" })}
                                    <div>
                                      <div className="font-medium">{item.title}</div>
                                      <div className="text-xs text-slate-600 dark:text-slate-400">{item.relationship_type}</div>
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-blue-600">
                                    {Math.round(item.similarity_score * 100)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default SemanticSearchEngine