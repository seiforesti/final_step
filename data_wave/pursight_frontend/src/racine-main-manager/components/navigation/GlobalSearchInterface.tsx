'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, ArrowRight, Star, Clock, Hash, FileText, Database, Users, Shield, BookOpen, Scan, Activity, BarChart3, Workflow, Zap, Bot, MessageSquare, Settings, Globe, Bookmark, ExternalLink, Copy, Share2, History, TrendingUp, Eye, ChevronDown, ChevronRight, CheckCircle, AlertCircle, Info, Plus, Minus, RotateCcw, Command, Enter, Tab, Loader2, Sparkles, Brain, Target, Layers, Tag, Calendar, MapPin, Type, Image, Video, File, Code, Link2, UserCircle, Building, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib copie/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import racine foundation layers (already implemented)
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration'
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useActivityTracker } from '../../hooks/useActivityTracker'
import { useAIAssistant } from '../../hooks/useAIAssistant'
import { useSearchAnalytics } from '../../hooks/useSearchAnalytics'
import { useUserPreferences } from '../../hooks/useUserPreferences'

// Import types (already implemented)
import {
  SearchQuery,
  SearchResult,
  SearchFilters,
  SearchSuggestion,
  SearchCategory,
  SearchAnalytics,
  UserContext,
  AISearchInsight,
  SearchHistory,
  SavedSearch
} from '../../types/racine-core.types'

// Import utils (already implemented)
import { coordinateSearch, aggregateResults } from '../../utils/cross-group-orchestrator'
import { analyzeSearchIntent, getRankedResults } from '../../utils/ai-integration-utils'
import { formatSearchTime, highlightSearchTerms, getSearchResultIcon } from '../../utils/search-utils'
import { checkPermissions } from '../../utils/security-utils'

// Import constants (already implemented)
import {
  SEARCH_CONFIGS,
  MAX_SEARCH_RESULTS,
  SEARCH_DEBOUNCE_DELAY,
  SUPPORTED_SEARCH_TYPES,
  DEFAULT_SEARCH_FILTERS
} from '../../constants/cross-group-configs'

// Existing SPA search endpoints and metadata
const EXISTING_SPA_SEARCH_ENDPOINTS = {
  'data-sources': {
    endpoint: '/api/data-sources/search',
    icon: Database,
    color: 'bg-blue-500',
    searchableFields: ['name', 'description', 'connectionString', 'type', 'tags'],
    categories: ['connections', 'configurations', 'monitoring', 'performance'],
    weight: 1.0
  },
  'scan-rule-sets': {
    endpoint: '/api/scan-rule-sets/search',
    icon: Shield,
    color: 'bg-purple-500',
    searchableFields: ['name', 'description', 'rules', 'conditions', 'actions'],
    categories: ['rules', 'policies', 'templates', 'validations'],
    weight: 0.9
  },
  'classifications': {
    endpoint: '/api/classifications/search',
    icon: FileText,
    color: 'bg-green-500',
    searchableFields: ['name', 'description', 'labels', 'categories', 'metadata'],
    categories: ['labels', 'categories', 'taxonomies', 'hierarchies'],
    weight: 0.8
  },
  'compliance-rule': {
    endpoint: '/api/compliance-rules/search',
    icon: BookOpen,
    color: 'bg-orange-500',
    searchableFields: ['name', 'description', 'regulations', 'requirements', 'controls'],
    categories: ['regulations', 'audits', 'reports', 'violations'],
    weight: 1.0
  },
  'advanced-catalog': {
    endpoint: '/api/advanced-catalog/search',
    icon: Scan,
    color: 'bg-teal-500',
    searchableFields: ['name', 'description', 'metadata', 'lineage', 'schema'],
    categories: ['assets', 'metadata', 'lineage', 'schemas', 'glossary'],
    weight: 1.0
  },
  'scan-logic': {
    endpoint: '/api/scan-logic/search',
    icon: Activity,
    color: 'bg-indigo-500',
    searchableFields: ['name', 'description', 'workflows', 'jobs', 'results'],
    categories: ['scans', 'jobs', 'workflows', 'results', 'logs'],
    weight: 0.9
  },
  'rbac-system': {
    endpoint: '/api/rbac/search',
    icon: Users,
    color: 'bg-red-500',
    searchableFields: ['users', 'roles', 'permissions', 'groups', 'policies'],
    categories: ['users', 'roles', 'permissions', 'groups', 'policies'],
    weight: 0.7,
    adminOnly: true
  }
} as const

// Racine feature search metadata
const RACINE_FEATURE_SEARCH = {
  'dashboard': {
    icon: BarChart3,
    color: 'bg-cyan-500',
    searchableFields: ['dashboards', 'widgets', 'metrics', 'kpis'],
    categories: ['dashboards', 'analytics', 'reports', 'insights'],
    weight: 0.8
  },
  'workspace': {
    icon: Globe,
    color: 'bg-emerald-500',
    searchableFields: ['workspaces', 'projects', 'teams', 'resources'],
    categories: ['workspaces', 'projects', 'collaboration'],
    weight: 0.7
  },
  'workflows': {
    icon: Workflow,
    color: 'bg-violet-500',
    searchableFields: ['workflows', 'jobs', 'templates', 'schedules'],
    categories: ['workflows', 'automation', 'templates'],
    weight: 0.9
  },
  'pipelines': {
    icon: Zap,
    color: 'bg-yellow-500',
    searchableFields: ['pipelines', 'stages', 'configurations', 'monitoring'],
    categories: ['pipelines', 'etl', 'processing'],
    weight: 0.9
  },
  'ai': {
    icon: Bot,
    color: 'bg-pink-500',
    searchableFields: ['conversations', 'recommendations', 'insights', 'analysis'],
    categories: ['ai', 'recommendations', 'insights'],
    weight: 0.6
  }
} as const

// Search result types
const SEARCH_RESULT_TYPES = {
  asset: { icon: Database, label: 'Asset', color: 'text-blue-600' },
  rule: { icon: Shield, label: 'Rule', color: 'text-purple-600' },
  policy: { icon: BookOpen, label: 'Policy', color: 'text-orange-600' },
  workflow: { icon: Workflow, label: 'Workflow', color: 'text-violet-600' },
  dashboard: { icon: BarChart3, label: 'Dashboard', color: 'text-cyan-600' },
  user: { icon: Users, label: 'User', color: 'text-red-600' },
  report: { icon: FileText, label: 'Report', color: 'text-green-600' },
  scan: { icon: Activity, label: 'Scan', color: 'text-indigo-600' },
  classification: { icon: Tag, label: 'Classification', color: 'text-green-600' },
  catalog: { icon: Scan, label: 'Catalog Item', color: 'text-teal-600' },
  workspace: { icon: Globe, label: 'Workspace', color: 'text-emerald-600' },
  pipeline: { icon: Zap, label: 'Pipeline', color: 'text-yellow-600' }
} as const

interface GlobalSearchInterfaceProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  className?: string
}

export const GlobalSearchInterface: React.FC<GlobalSearchInterfaceProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  className
}) => {
  // Core state management using foundation hooks
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchHistory,
    savedSearches,
    executeGlobalSearch,
    clearSearch,
    getSearchSuggestions,
    saveSearchQuery,
    getSearchAnalytics,
    addToSearchHistory
  } = useGlobalSearch()

  const {
    aiInsights,
    getSearchRecommendations,
    analyzeSearchContext,
    enhanceSearchResults
  } = useAIAssistant()

  const {
    crossGroupState,
    searchAllExistingSPAs,
    aggregateSearchResults
  } = useCrossGroupIntegration()

  const {
    userContext,
    checkUserAccess,
    getUserPermissions
  } = useUserManagement()

  const {
    trackSearch,
    getSearchPatterns,
    recordSearchClick
  } = useActivityTracker()

  const {
    searchAnalytics,
    trackSearchUsage,
    getPopularSearches,
    getSearchPerformance
  } = useSearchAnalytics()

  const {
    searchPreferences,
    updateSearchPreferences,
    getSavedFilters
  } = useUserPreferences()

  // Local state
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSPA, setSelectedSPA] = useState<string>('all')
  const [selectedResultType, setSelectedResultType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity'>('relevance')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'detailed'>('list')
  const [expandedFilters, setExpandedFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [activeTab, setActiveTab] = useState('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [searchStartTime, setSearchStartTime] = useState<Date | null>(null)

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  const router = useRouter()

  // Filter accessible SPAs based on permissions
  const accessibleSPAs = useMemo(() => {
    return Object.entries(EXISTING_SPA_SEARCH_ENDPOINTS).filter(([spaKey, metadata]) => {
      if (metadata.adminOnly && !checkUserAccess('rbac:admin')) {
        return false
      }
      return checkUserAccess(`spa:${spaKey}`)
    })
  }, [checkUserAccess])

  // Enhanced search results with AI insights
  const enhancedResults = useMemo(() => {
    if (!searchResults?.length) return []

    return searchResults.map(result => ({
      ...result,
      aiScore: aiInsights?.resultScores?.[result.id] || 0,
      aiRecommendation: aiInsights?.recommendations?.[result.id],
      relevanceScore: result.score || 0,
      popularityScore: searchAnalytics?.resultPopularity?.[result.id] || 0
    })).sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.relevanceScore + b.aiScore) - (a.relevanceScore + a.aiScore)
        case 'date':
          return new Date(b.lastModified || b.createdAt).getTime() - new Date(a.lastModified || a.createdAt).getTime()
        case 'popularity':
          return b.popularityScore - a.popularityScore
        default:
          return 0
      }
    })
  }, [searchResults, aiInsights, searchAnalytics, sortBy])

  // Filtered results based on current filters
  const filteredResults = useMemo(() => {
    let results = enhancedResults

    // Filter by SPA
    if (selectedSPA !== 'all') {
      results = results.filter(result => result.source === selectedSPA)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(result => result.category === selectedCategory)
    }

    // Filter by result type
    if (selectedResultType !== 'all') {
      results = results.filter(result => result.type === selectedResultType)
    }

    return results
  }, [enhancedResults, selectedSPA, selectedCategory, selectedResultType])

  // Result categories for tabs
  const resultCategories = useMemo(() => {
    const categories = new Map<string, number>()
    categories.set('all', enhancedResults.length)

    enhancedResults.forEach(result => {
      const current = categories.get(result.source) || 0
      categories.set(result.source, current + 1)
    })

    return Array.from(categories.entries()).map(([key, count]) => ({
      key,
      label: key === 'all' ? 'All Results' : 
             EXISTING_SPA_SEARCH_ENDPOINTS[key as keyof typeof EXISTING_SPA_SEARCH_ENDPOINTS]?.icon ? 
             key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ') : 
             RACINE_FEATURE_SEARCH[key as keyof typeof RACINE_FEATURE_SEARCH] ? 
             key.charAt(0).toUpperCase() + key.slice(1) : key,
      count,
      icon: key === 'all' ? Search : 
            EXISTING_SPA_SEARCH_ENDPOINTS[key as keyof typeof EXISTING_SPA_SEARCH_ENDPOINTS]?.icon ||
            RACINE_FEATURE_SEARCH[key as keyof typeof RACINE_FEATURE_SEARCH]?.icon
    }))
  }, [enhancedResults])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [recent, popular] = await Promise.all([
          getSearchPatterns('recent', 10),
          getPopularSearches(10)
        ])
        setRecentSearches(recent.map(p => p.query))
        setPopularSearches(popular.map(p => p.query))
      } catch (error) {
        console.error('Failed to load search data:', error)
      }
    }

    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen, getSearchPatterns, getPopularSearches])

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      if (initialQuery) {
        setQuery(initialQuery)
      }
    }
  }, [isOpen, initialQuery])

  // Debounced search execution
  const executeSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      clearSearch()
      return
    }

    setSearchStartTime(new Date())

    try {
      // Track search initiation
      trackSearchUsage({
        query: searchTerm,
        filters,
        timestamp: new Date(),
        source: 'global_search'
      })

      // Get AI context analysis
      const context = await analyzeSearchContext({
        query: searchTerm,
        userContext,
        recentActivity: recentSearches,
        currentWorkspace: crossGroupState.activeWorkspace
      })

      // Execute global search with enhanced context
      await executeGlobalSearch({
        query: searchTerm,
        filters: {
          ...filters,
          spas: selectedSPA === 'all' ? accessibleSPAs.map(([key]) => key) : [selectedSPA],
          includeRacineFeatures: true,
          aiEnhanced: true
        },
        context,
        limit: MAX_SEARCH_RESULTS,
        sortBy
      })

      // Add to search history
      addToSearchHistory(searchTerm)

    } catch (error) {
      console.error('Search error:', error)
    }
  }, [
    filters,
    selectedSPA,
    accessibleSPAs,
    sortBy,
    trackSearchUsage,
    analyzeSearchContext,
    userContext,
    recentSearches,
    crossGroupState.activeWorkspace,
    executeGlobalSearch,
    addToSearchHistory,
    clearSearch
  ])

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value)

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      executeSearch(value)
    }, SEARCH_DEBOUNCE_DELAY)
  }, [executeSearch])

  // Get search suggestions
  const handleGetSuggestions = useCallback(async (searchTerm: string) => {
    if (searchTerm.length > 2) {
      try {
        const suggestions = await getSearchSuggestions({
          query: searchTerm,
          limit: 10,
          includeHistory: true,
          includePopular: true,
          contextual: true
        })
        setSuggestions(suggestions)
      } catch (error) {
        console.error('Failed to get suggestions:', error)
      }
    } else {
      setSuggestions([])
    }
  }, [getSearchSuggestions])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1)
        break
      case 'Enter':
        event.preventDefault()
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          const suggestion = suggestions[selectedSuggestionIndex]
          setQuery(suggestion.text)
          executeSearch(suggestion.text)
          setSuggestions([])
          setSelectedSuggestionIndex(-1)
        } else {
          executeSearch(query)
        }
        break
      case 'Escape':
        if (suggestions.length > 0) {
          setSuggestions([])
          setSelectedSuggestionIndex(-1)
        } else {
          onClose()
        }
        break
      case 'Tab':
        if (suggestions.length > 0) {
          event.preventDefault()
        }
        break
    }
  }, [suggestions, selectedSuggestionIndex, query, executeSearch, onClose])

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    // Track result click
    recordSearchClick({
      searchQuery: query,
      resultId: result.id,
      resultSource: result.source,
      position: filteredResults.indexOf(result),
      timestamp: new Date()
    })

    // Navigate to result
    router.push(result.url)
    onClose()
  }, [query, filteredResults, recordSearchClick, router, onClose])

  // Render search suggestions
  const renderSuggestions = () => {
    if (suggestions.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-64 overflow-y-auto"
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
              "hover:bg-muted/50",
              selectedSuggestionIndex === index && "bg-muted"
            )}
            onClick={() => {
              setQuery(suggestion.text)
              executeSearch(suggestion.text)
              setSuggestions([])
            }}
          >
            <div className="flex-shrink-0">
              {suggestion.type === 'history' && <History className="w-4 h-4 text-muted-foreground" />}
              {suggestion.type === 'popular' && <TrendingUp className="w-4 h-4 text-muted-foreground" />}
              {suggestion.type === 'ai' && <Sparkles className="w-4 h-4 text-purple-500" />}
              {suggestion.type === 'contextual' && <Brain className="w-4 h-4 text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{suggestion.text}</p>
              {suggestion.description && (
                <p className="text-xs text-muted-foreground truncate">{suggestion.description}</p>
              )}
            </div>
            {suggestion.count && (
              <Badge variant="outline" className="text-xs">
                {suggestion.count}
              </Badge>
            )}
          </div>
        ))}
      </motion.div>
    )
  }

  // Render search filters
  const renderFilters = () => (
    <Collapsible open={expandedFilters} onOpenChange={setExpandedFilters}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={cn(
            "w-3 h-3 transition-transform",
            expandedFilters && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
          {/* SPA Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedSPA === 'all' ? 'All Sources' : selectedSPA}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuRadioGroup value={selectedSPA} onValueChange={setSelectedSPA}>
                  <DropdownMenuRadioItem value="all">All Sources</DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  {accessibleSPAs.map(([spaKey, metadata]) => (
                    <DropdownMenuRadioItem key={spaKey} value={spaKey}>
                      <div className="flex items-center gap-2">
                        <metadata.icon className="w-4 h-4" />
                        <span>{spaKey.charAt(0).toUpperCase() + spaKey.slice(1).replace('-', ' ')}</span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Result Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedResultType === 'all' ? 'All Types' : 
                   SEARCH_RESULT_TYPES[selectedResultType as keyof typeof SEARCH_RESULT_TYPES]?.label || selectedResultType}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuRadioGroup value={selectedResultType} onValueChange={setSelectedResultType}>
                  <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  {Object.entries(SEARCH_RESULT_TYPES).map(([type, metadata]) => (
                    <DropdownMenuRadioItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <metadata.icon className={cn("w-4 h-4", metadata.color)} />
                        <span>{metadata.label}</span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort by</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <DropdownMenuRadioItem value="relevance">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>Relevance</span>
                    </div>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="date">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Date</span>
                    </div>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="popularity">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Popularity</span>
                    </div>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )

  // Render search result item
  const renderSearchResult = useCallback((result: SearchResult, index: number) => {
    const resultTypeMetadata = SEARCH_RESULT_TYPES[result.type as keyof typeof SEARCH_RESULT_TYPES]
    const sourceMetadata = EXISTING_SPA_SEARCH_ENDPOINTS[result.source as keyof typeof EXISTING_SPA_SEARCH_ENDPOINTS] ||
                          RACINE_FEATURE_SEARCH[result.source as keyof typeof RACINE_FEATURE_SEARCH]

    return (
      <motion.div
        key={result.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group p-4 rounded-lg border cursor-pointer transition-all duration-200",
          "hover:border-primary/30 hover:shadow-md",
          viewMode === 'grid' && "min-h-[160px]"
        )}
        onClick={() => handleResultClick(result)}
      >
        <div className={cn(
          "flex gap-4",
          viewMode === 'grid' && "flex-col"
        )}>
          {/* Result Icon */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              sourceMetadata?.color || "bg-muted"
            )}>
              {resultTypeMetadata ? (
                <resultTypeMetadata.icon className="w-5 h-5 text-white" />
              ) : (
                <File className="w-5 h-5 text-white" />
              )}
            </div>
          </div>

          {/* Result Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {highlightSearchTerms(result.title, query)}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {highlightSearchTerms(result.description, query)}
                </p>
              </div>
              
              {/* Result Score */}
              {result.score && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(result.score * 100)}%
                </Badge>
              )}
            </div>

            {/* Result Metadata */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {sourceMetadata?.icon && <sourceMetadata.icon className="w-3 h-3" />}
                <span>{result.source.replace('-', ' ')}</span>
              </div>
              
              {resultTypeMetadata && (
                <div className="flex items-center gap-1">
                  <resultTypeMetadata.icon className={cn("w-3 h-3", resultTypeMetadata.color)} />
                  <span>{resultTypeMetadata.label}</span>
                </div>
              )}
              
              {result.lastModified && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatSearchTime(result.lastModified)}</span>
                </div>
              )}
              
              {result.category && (
                <Badge variant="secondary" className="text-xs">
                  {result.category}
                </Badge>
              )}
            </div>

            {/* AI Recommendation */}
            {result.aiRecommendation && (
              <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded border-l-2 border-l-purple-500">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">AI Insight</span>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {result.aiRecommendation}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(result.url, '_blank')
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in new tab</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(result.url)
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy link</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }, [query, viewMode, handleResultClick])

  // Render search results
  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Searching across all SPAs...</p>
          {searchStartTime && (
            <p className="text-xs text-muted-foreground mt-1">
              Elapsed: {Math.round((Date.now() - searchStartTime.getTime()) / 1000)}s
            </p>
          )}
        </div>
      )
    }

    if (!query.trim()) {
      return (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => {
                      setQuery(search)
                      executeSearch(search)
                    }}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.slice(0, 5).map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => {
                      setQuery(search)
                      executeSearch(search)
                    }}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Tips */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Search Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use quotes for exact phrases: "data source"</li>
              <li>• Use wildcards: data*</li>
              <li>• Filter by type: type:rule, type:asset</li>
              <li>• Search specific SPAs: in:data-sources</li>
              <li>• Use AI suggestions for better results</li>
            </ul>
          </div>
        </div>
      )
    }

    if (filteredResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Try adjusting your search terms or filters
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters(DEFAULT_SEARCH_FILTERS)
                setSelectedSPA('all')
                setSelectedCategory('all')
                setSelectedResultType('all')
              }}
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            >
              {isAdvancedMode ? 'Simple Search' : 'Advanced Search'}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredResults.length} results for "{query}"
            {searchStartTime && ` (${((Date.now() - searchStartTime.getTime()) / 1000).toFixed(2)}s)`}
          </p>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <DropdownMenuRadioItem value="list">List View</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="grid">Grid View</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="detailed">Detailed View</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Results Grid */}
        <div className={cn(
          "space-y-3",
          viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0"
        )}>
          {filteredResults.map((result, index) => 
            renderSearchResult(result, index)
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl h-[80vh] p-0", className)}>
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <div className="space-y-4">
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Global Search
              </DialogTitle>
              
              {/* Search Input */}
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  placeholder="Search across all SPAs and features..."
                  value={query}
                  onChange={(e) => {
                    handleSearchChange(e.target.value)
                    handleGetSuggestions(e.target.value)
                  }}
                  onKeyDown={handleKeyDown}
                  className="text-base pr-12"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                    <span className="text-xs">ESC</span>
                  </kbd>
                </div>
                
                {/* Search Suggestions */}
                <AnimatePresence>
                  {suggestions.length > 0 && renderSuggestions()}
                </AnimatePresence>
              </div>
              
              {/* Filters */}
              {renderFilters()}
            </div>
          </DialogHeader>

          {/* Results Tabs */}
          {enhancedResults.length > 0 && (
            <div className="px-6 pt-4 border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-auto">
                  {resultCategories.slice(0, 6).map(({ key, label, count, icon: Icon }) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="flex items-center gap-2"
                      onClick={() => setSelectedSPA(key)}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Search Results */}
          <ScrollArea className="flex-1 px-6 py-4">
            <TooltipProvider>
              {renderSearchResults()}
            </TooltipProvider>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GlobalSearchInterface
