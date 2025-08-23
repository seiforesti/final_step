'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Command, Filter, History, Star, Database, Shield, FileText, BookOpen, Scan, Users, Activity, Zap, ArrowRight, Clock, TrendingUp, Loader2, Bot, Sparkles, ExternalLink, ChevronRight, Tags, Globe, AlertCircle, CheckCircle2, BarChart3, Settings, Eye, Bookmark, Hash, Calendar, User, Folder, Code, Play, Pause, Square, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// Import racine foundation layers (already implemented)
import { useGlobalSearch } from '../../../hooks/useGlobalSearch'
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration'
import { useUserManagement } from '../../../hooks/useUserManagement'
import { useAIAssistant } from '../../../hooks/useAIAssistant'
import { useActivityTracker } from '../../../hooks/useActivityTracker'

// Import types (already implemented)
import {
  SearchQuery,
  SearchResult,
  SearchFilter,
  SearchSuggestion,
  AISearchInsight,
  CrossGroupSearchResult,
  UserContext,
  SPAContext,
  SearchAnalytics,
  SearchCategory,
  SearchHistory
} from '../../../types/racine-core.types'

// Import utils (already implemented)
import { performCrossGroupSearch, analyzeSearchContext } from '../../../utils/search-utils'
import { formatSearchTime, getSearchResultIcon } from '../../../utils/formatting-utils'

// Import constants (already implemented)
import { SEARCH_CATEGORIES, SEARCH_HOTKEYS, SPA_SEARCH_ENDPOINTS } from '../../../constants/search-constants'

interface QuickSearchProps {
  isOpen?: boolean
  onClose?: () => void
  onResultSelect?: (result: SearchResult) => void
  defaultQuery?: string
  focusOnMount?: boolean
  showCategories?: boolean
  enableAIInsights?: boolean
  className?: string
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  isOpen = false,
  onClose,
  onResultSelect,
  defaultQuery = '',
  focusOnMount = true,
  showCategories = true,
  enableAIInsights = true,
  className
}) => {
  // State management
  const [query, setQuery] = useState(defaultQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [aiInsights, setAIInsights] = useState<AISearchInsight[]>([])
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [searchStartTime, setSearchStartTime] = useState<number>(0)

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Custom hooks (already implemented)
  const { 
    executeGlobalSearch, 
    getSearchSuggestions, 
    getSearchHistory,
    getPopularSearches,
    trackSearchAnalytics
  } = useGlobalSearch()
  
  const { 
    getActiveSPAContext, 
    getAllSPAStatuses,
    searchAcrossAllSPAs 
  } = useCrossGroupIntegration()
  
  const { getCurrentUser, getUserPreferences } = useUserManagement()
  const { getSearchInsights, analyzeSearchIntent } = useAIAssistant()
  const { trackEvent } = useActivityTracker()

  // Get current context
  const currentUser = getCurrentUser()
  const userPreferences = getUserPreferences()
  const activeSPAContext = getActiveSPAContext()
  const allSPAStatuses = getAllSPAStatuses()

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      searchTimeoutRef.current = setTimeout(async () => {
        if (searchQuery.trim()) {
          setIsSearching(true)
          setSearchStartTime(Date.now())

          try {
            // Execute cross-SPA search
            const searchPromises = [
              executeGlobalSearch({
                query: searchQuery,
                filters: activeFilters,
                context: activeSPAContext,
                includeAI: enableAIInsights,
                limit: 20
              }),
              searchAcrossAllSPAs(searchQuery, activeFilters),
              enableAIInsights ? getSearchInsights(searchQuery, activeSPAContext) : Promise.resolve([])
            ]

            const [globalResults, crossSPAResults, insights] = await Promise.all(searchPromises)

            // Merge and deduplicate results
            const allResults = [
              ...globalResults.results,
              ...crossSPAResults.flatMap(spa => spa.results)
            ]

            const uniqueResults = allResults.filter((result, index, self) => 
              index === self.findIndex(r => r.id === result.id)
            )

            setResults(uniqueResults.slice(0, 50)) // Limit to 50 results
            setAIInsights(insights)

            // Track search analytics
            trackSearchAnalytics({
              query: searchQuery,
              resultCount: uniqueResults.length,
              searchTime: Date.now() - searchStartTime,
              filters: activeFilters,
              context: activeSPAContext
            })

            trackEvent('search_executed', {
              query: searchQuery,
              resultCount: uniqueResults.length,
              hasFilters: activeFilters.length > 0
            })

          } catch (error) {
            console.error('Search error:', error)
            setResults([])
            setAIInsights([])
          } finally {
            setIsSearching(false)
          }
        } else {
          setResults([])
          setAIInsights([])
          setIsSearching(false)
        }
      }, 300)
    },
    [
      activeFilters, 
      activeSPAContext, 
      enableAIInsights, 
      executeGlobalSearch, 
      searchAcrossAllSPAs, 
      getSearchInsights,
      trackSearchAnalytics,
      trackEvent,
      searchStartTime
    ]
  )

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [history, popular, initialSuggestions] = await Promise.all([
          getSearchHistory(10),
          getPopularSearches(10),
          getSearchSuggestions('')
        ])

        setSearchHistory(history)
        setPopularSearches(popular)
        setSuggestions(initialSuggestions)
      } catch (error) {
        console.error('Failed to load initial search data:', error)
      }
    }

    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen, getSearchHistory, getPopularSearches, getSearchSuggestions])

  // Handle query changes
  useEffect(() => {
    if (query) {
      debouncedSearch(query)
      
      // Get dynamic suggestions
      getSearchSuggestions(query).then(setSuggestions).catch(console.error)
    } else {
      setResults([])
      setAIInsights([])
      setSelectedIndex(-1)
    }
  }, [query, debouncedSearch, getSearchSuggestions])

  // Handle focus on mount
  useEffect(() => {
    if (isOpen && focusOnMount && inputRef.current) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [isOpen, focusOnMount])

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalItems = results.length + suggestions.length

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
        break
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0) {
          if (selectedIndex < results.length) {
            handleResultSelect(results[selectedIndex])
          } else {
            const suggestionIndex = selectedIndex - results.length
            if (suggestions[suggestionIndex]) {
              setQuery(suggestions[suggestionIndex].text)
            }
          }
        }
        break
      case 'Escape':
        event.preventDefault()
        if (query) {
          setQuery('')
        } else {
          onClose?.()
        }
        break
      case 'Tab':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          setShowAdvancedFilters(prev => !prev)
        }
        break
    }
  }, [results, suggestions, selectedIndex, query, onClose])

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    trackEvent('search_result_selected', {
      resultId: result.id,
      resultType: result.type,
      resultSPA: result.spa,
      query: query,
      position: results.indexOf(result)
    })

    onResultSelect?.(result)
    onClose?.()
  }, [onResultSelect, onClose, trackEvent, query, results])

  // Handle filter toggle
  const handleFilterToggle = useCallback((filter: SearchFilter) => {
    setActiveFilters(prev => {
      const existing = prev.find(f => f.key === filter.key)
      if (existing) {
        return prev.filter(f => f.key !== filter.key)
      } else {
        return [...prev, filter]
      }
    })
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters([])
  }, [])

  // Memoized filter categories
  const filterCategories = useMemo(() => {
    return SEARCH_CATEGORIES.map(category => ({
      ...category,
      isActive: activeFilters.some(f => f.category === category.id),
      count: results.filter(r => r.category === category.id).length
    }))
  }, [activeFilters, results])

  // Render search suggestions
  const renderSuggestions = () => {
    if (!query && searchHistory.length === 0 && popularSearches.length === 0) return null

    return (
      <div className="space-y-4">
        {!query && searchHistory.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
              <History className="w-3 h-3" />
              Recent Searches
            </div>
            <div className="space-y-1">
              {searchHistory.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors rounded-sm",
                    "hover:bg-muted/50",
                    selectedIndex === index + results.length && "bg-muted"
                  )}
                  onClick={() => setQuery(item.query)}
                >
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{item.query}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatSearchTime(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!query && popularSearches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              Popular Searches
            </div>
            <div className="space-y-1">
              {popularSearches.slice(0, 5).map((search, index) => (
                <div
                  key={search}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors rounded-sm",
                    "hover:bg-muted/50",
                    selectedIndex === index + results.length + searchHistory.length && "bg-muted"
                  )}
                  onClick={() => setQuery(search)}
                >
                  <Star className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{search}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              Suggestions
            </div>
            <div className="space-y-1">
              {suggestions.slice(0, 5).map((suggestion, index) => {
                const Icon = getSearchResultIcon(suggestion.type)
                return (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors rounded-sm",
                      "hover:bg-muted/50",
                      selectedIndex === index + results.length && "bg-muted"
                    )}
                    onClick={() => setQuery(suggestion.text)}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{suggestion.text}</span>
                      {suggestion.description && (
                        <span className="text-xs text-muted-foreground truncate block">
                          {suggestion.description}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render search results
  const renderResults = () => {
    if (!query || results.length === 0) return null

    return (
      <div className="space-y-4">
        {enableAIInsights && aiInsights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
              <Bot className="w-3 h-3" />
              AI Insights
            </div>
            <div className="space-y-2">
              {aiInsights.map((insight, index) => (
                <Card key={insight.id} className="bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                        {insight.actions && insight.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {insight.actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => action.handler()}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Search className="w-3 h-3" />
              Results ({results.length})
            </div>
            {isSearching && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            {results.map((result, index) => {
              const Icon = getSearchResultIcon(result.type)
              const isSelected = selectedIndex === index

              return (
                <div
                  key={result.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors rounded-sm",
                    "hover:bg-muted/50",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{result.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.spa}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {result.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{result.category}</span>
                      {result.lastModified && (
                        <span>Modified {formatSearchTime(result.lastModified)}</span>
                      )}
                      {result.relevanceScore && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{Math.round(result.relevanceScore * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {result.hasQuickActions && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Zap className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Quick Actions Available</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20",
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.()
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl mx-4"
      >
        <Card className="shadow-2xl border-2">
          <CardContent className="p-0">
            {/* Search Header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search across all SPAs... (⌘K)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-12 h-12 text-base border-0 focus-visible:ring-0"
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setQuery('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Filter Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filterCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.id}
                      checked={category.isActive}
                      onCheckedChange={() => handleFilterToggle({
                        key: category.id,
                        category: category.id,
                        label: category.name,
                        value: category.id
                      })}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <category.icon className="w-4 h-4" />
                        <span>{category.name}</span>
                        {category.count > 0 && (
                          <Badge variant="outline" className="ml-auto">
                            {category.count}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                  {activeFilters.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearFilters}>
                        Clear All Filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 border-b bg-muted/30">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="gap-1"
                  >
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleFilterToggle(filter)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Results Area */}
            <ScrollArea className="max-h-96">
              <div ref={resultsRef} className="p-4">
                {query ? renderResults() : renderSuggestions()}
                
                {query && !isSearching && results.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No results found for "{query}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search terms or removing filters
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">⏎</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>Powered by AI</span>
                <Bot className="w-3 h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default QuickSearch