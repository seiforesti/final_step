/**
 * 🔍 GLOBAL SEARCH HOOK - ENTERPRISE SEARCH SYSTEM
 * ================================================
 * 
 * Advanced global search hook that provides intelligent search capabilities
 * across all SPAs and data governance groups. Features include:
 * - Cross-SPA unified search
 * - AI-powered search suggestions  
 * - Advanced filtering and faceting
 * - Real-time search with performance optimization
 * - Search history and personalization
 * - Semantic search capabilities
 * - Integration with all backend search endpoints
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

// Backend API Integration
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis';
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis';
import { aiAssistantAPI } from '../services/ai-assistant-apis';

// Type Definitions
import {
  SearchQuery,
  SearchResult,
  SearchFilters,
  SearchSuggestion,
  SearchCategory,
  SearchMetrics,
  SPASearchContext,
  SearchScope,
  SearchSortOption,
  SearchFacet,
  UUID,
  ISODateString
} from '../types/racine-core.types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface GlobalSearchState {
  // Core Search State
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  isSearching: boolean;
  hasSearched: boolean;
  
  // Advanced Search Features
  filters: SearchFilters;
  activeFacets: SearchFacet[];
  sortOption: SearchSortOption;
  searchScope: SearchScope[];
  
  // Performance & Analytics
  searchMetrics: SearchMetrics;
  totalResults: number;
  searchDuration: number;
  
  // History & Personalization
  recentSearches: SearchQuery[];
  savedSearches: SearchQuery[];
  searchHistory: SearchQuery[];
  popularSearches: string[];
  
  // Error Handling
  error: string | null;
  isOffline: boolean;
  
  // Advanced Features
  semanticSearchEnabled: boolean;
  aiSuggestionsEnabled: boolean;
  autoCompleteResults: SearchSuggestion[];
}

export interface GlobalSearchActions {
  // Primary Search Actions
  search: (query: string, options?: SearchOptions) => Promise<SearchResult[]>;
  clearSearch: () => void;
  retrySearch: () => Promise<SearchResult[]>;
  
  // Filter & Scope Management
  applyFilters: (filters: SearchFilters) => Promise<void>;
  clearFilters: () => void;
  setSearchScope: (scope: SearchScope[]) => void;
  toggleScopeItem: (scopeItem: SearchScope) => void;
  
  // Sorting & Organization
  setSortOption: (option: SearchSortOption) => Promise<void>;
  applyFacet: (facet: SearchFacet) => Promise<void>;
  removeFacet: (facetId: string) => void;
  
  // Suggestions & Autocomplete
  getSuggestions: (partial: string) => Promise<SearchSuggestion[]>;
  getAutoComplete: (partial: string) => Promise<SearchSuggestion[]>;
  
  // Cross-SPA Search
  searchAcrossAllSPAs: (query: string) => Promise<SearchResult[]>;
  searchInSPA: (query: string, spaType: string) => Promise<SearchResult[]>;
  searchInCategory: (query: string, category: SearchCategory) => Promise<SearchResult[]>;
  
  // History Management
  addToHistory: (query: SearchQuery) => void;
  clearHistory: () => void;
  removeFromHistory: (queryId: string) => void;
  saveSearch: (query: SearchQuery, name: string) => Promise<void>;
  deleteSavedSearch: (savedSearchId: string) => Promise<void>;
  
  // Advanced Features
  enableSemanticSearch: () => void;
  disableSemanticSearch: () => void;
  getAISuggestions: (context: string) => Promise<SearchSuggestion[]>;
  
  // Performance & Analytics
  getSearchMetrics: () => SearchMetrics;
  trackSearchEvent: (event: SearchEvent) => void;
  optimizeSearch: () => Promise<void>;
}

interface SearchOptions {
  filters?: SearchFilters;
  scope?: SearchScope[];
  sortBy?: SearchSortOption;
  maxResults?: number;
  includeMetadata?: boolean;
  useSemanticSearch?: boolean;
  priority?: 'speed' | 'accuracy' | 'comprehensive';
}

interface SearchEvent {
  type: 'search' | 'filter' | 'facet' | 'sort' | 'suggestion_click' | 'result_click';
  query?: string;
  resultId?: string;
  timestamp: ISODateString;
  metadata?: Record<string, any>;
}

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export const useGlobalSearch = (
  initialScope?: SearchScope[],
  options?: {
    enableAutoComplete?: boolean;
    enableSemanticSearch?: boolean;
    maxHistoryItems?: number;
    debounceMs?: number;
  }
): GlobalSearchState & GlobalSearchActions => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [searchState, setSearchState] = useState<GlobalSearchState>({
    // Core Search State
    query: '',
    results: [],
    suggestions: [],
    isSearching: false,
    hasSearched: false,
    
    // Advanced Search Features
    filters: {
      dateRange: null,
      dataTypes: [],
      sources: [],
      classifications: [],
      compliance: [],
      tags: [],
      customFilters: {}
    },
    activeFacets: [],
    sortOption: { field: 'relevance', direction: 'desc' },
    searchScope: initialScope || ['all'],
    
    // Performance & Analytics
    searchMetrics: {
      totalQueries: 0,
      averageResponseTime: 0,
      popularQueries: [],
      searchEfficiency: 0,
      userSatisfactionScore: 0
    },
    totalResults: 0,
    searchDuration: 0,
    
    // History & Personalization
    recentSearches: [],
    savedSearches: [],
    searchHistory: [],
    popularSearches: [],
    
    // Error Handling
    error: null,
    isOffline: false,
    
    // Advanced Features
    semanticSearchEnabled: options?.enableSemanticSearch ?? true,
    aiSuggestionsEnabled: true,
    autoCompleteResults: []
  });

  // ========================================================================
  // REFS & PERFORMANCE
  // ========================================================================
  
  const searchAbortController = useRef<AbortController | null>(null);
  const searchCache = useRef<Map<string, { results: SearchResult[]; timestamp: number }>>(new Map());
  const searchMetricsRef = useRef<SearchMetrics>(searchState.searchMetrics);

  // ========================================================================
  // DEBOUNCED SEARCH FUNCTIONS
  // ========================================================================

  const debouncedSearch = useCallback(
    debounce(async (query: string, options: SearchOptions = {}) => {
      if (!query.trim()) return [];
      
      try {
        // Cancel previous search
        if (searchAbortController.current) {
          searchAbortController.current.abort();
        }
        
        searchAbortController.current = new AbortController();
        const startTime = performance.now();
        
        setSearchState(prev => ({
          ...prev,
          isSearching: true,
          error: null
        }));

        // Check cache first
        const cacheKey = JSON.stringify({ query, options });
        const cached = searchCache.current.get(cacheKey);
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        if (cached && (Date.now() - cached.timestamp) < cacheExpiry) {
          setSearchState(prev => ({
            ...prev,
            results: cached.results,
            totalResults: cached.results.length,
            isSearching: false,
            hasSearched: true,
            searchDuration: performance.now() - startTime
          }));
          return cached.results;
        }

        // Perform unified search across all systems
        const searchPromise = searchState.semanticSearchEnabled && options.useSemanticSearch !== false
          ? performSemanticSearch(query, options)
          : performStandardSearch(query, options);

        const results = await searchPromise;
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Cache results
        searchCache.current.set(cacheKey, {
          results,
          timestamp: Date.now()
        });

        // Update search state
        setSearchState(prev => ({
          ...prev,
          results,
          totalResults: results.length,
          isSearching: false,
          hasSearched: true,
          searchDuration: duration,
          query
        }));

        // Track search metrics
        trackSearchEvent({
          type: 'search',
          query,
          timestamp: new Date().toISOString(),
          metadata: { duration, resultsCount: results.length }
        });

        // Add to history
        addToHistory({
          id: `search_${Date.now()}`,
          query,
          timestamp: new Date().toISOString(),
          filters: options.filters || searchState.filters,
          scope: options.scope || searchState.searchScope,
          resultsCount: results.length
        });

        return results;
        
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
          setSearchState(prev => ({
            ...prev,
            error: error.message || 'Search failed',
            isSearching: false
          }));
        }
        return [];
      }
    }, options?.debounceMs || 300),
    [searchState.semanticSearchEnabled, searchState.filters, searchState.searchScope]
  );

  const debouncedAutoComplete = useCallback(
    debounce(async (partial: string) => {
      if (!partial.trim() || partial.length < 2) {
        setSearchState(prev => ({ ...prev, autoCompleteResults: [] }));
        return [];
      }

      try {
        const suggestions = await crossGroupIntegrationAPI.getSearchSuggestions({
          partial,
          maxSuggestions: 10,
          includeHistory: true,
          includePopular: true,
          scope: searchState.searchScope
        });

        setSearchState(prev => ({
          ...prev,
          autoCompleteResults: suggestions
        }));

        return suggestions;
      } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
      }
    }, 150),
    [searchState.searchScope]
  );

  // ========================================================================
  // SEARCH IMPLEMENTATION FUNCTIONS
  // ========================================================================

  const performStandardSearch = async (
    query: string,
    options: SearchOptions
  ): Promise<SearchResult[]> => {
    const searchRequest = {
      query,
      filters: { ...searchState.filters, ...options.filters },
      scope: options.scope || searchState.searchScope,
      sortBy: options.sortBy || searchState.sortOption,
      maxResults: options.maxResults || 100,
      includeMetadata: options.includeMetadata ?? true,
      signal: searchAbortController.current?.signal
    };

    // Use appropriate search endpoint based on scope
    if (searchRequest.scope.includes('all') || searchRequest.scope.length > 1) {
      return await crossGroupIntegrationAPI.unifiedSearch(searchRequest);
    } else {
      const spaType = searchRequest.scope[0];
      return await searchInSpecificSPA(query, spaType, searchRequest);
    }
  };

  const performSemanticSearch = async (
    query: string,
    options: SearchOptions
  ): Promise<SearchResult[]> => {
    // Enhanced semantic search using AI
    const semanticRequest = {
      query,
      context: 'data_governance',
      includeRelated: true,
      similarityThreshold: 0.7,
      maxResults: options.maxResults || 100,
      filters: { ...searchState.filters, ...options.filters },
      scope: options.scope || searchState.searchScope
    };

    return await aiAssistantAPI.semanticSearch(semanticRequest);
  };

  const searchInSpecificSPA = async (
    query: string,
    spaType: string,
    searchRequest: any
  ): Promise<SearchResult[]> => {
    switch (spaType) {
      case 'data-sources':
        return await crossGroupIntegrationAPI.searchDataSources(searchRequest);
      case 'scan-rule-sets':
        return await crossGroupIntegrationAPI.searchScanRuleSets(searchRequest);
      case 'classifications':
        return await crossGroupIntegrationAPI.searchClassifications(searchRequest);
      case 'compliance-rules':
        return await crossGroupIntegrationAPI.searchComplianceRules(searchRequest);
      case 'advanced-catalog':
        return await crossGroupIntegrationAPI.searchCatalog(searchRequest);
      case 'scan-logic':
        return await crossGroupIntegrationAPI.searchScanLogic(searchRequest);
      case 'rbac-system':
        return await crossGroupIntegrationAPI.searchRBAC(searchRequest);
      default:
        return await crossGroupIntegrationAPI.unifiedSearch(searchRequest);
    }
  };

  // ========================================================================
  // ACTION IMPLEMENTATIONS
  // ========================================================================

  const search = useCallback(async (
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> => {
    return await debouncedSearch(query, options);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    
    setSearchState(prev => ({
      ...prev,
      query: '',
      results: [],
      suggestions: [],
      autoCompleteResults: [],
      hasSearched: false,
      error: null,
      totalResults: 0
    }));
  }, []);

  const retrySearch = useCallback(async (): Promise<SearchResult[]> => {
    if (!searchState.query) return [];
    return await search(searchState.query, {
      filters: searchState.filters,
      scope: searchState.searchScope,
      sortBy: searchState.sortOption
    });
  }, [search, searchState.query, searchState.filters, searchState.searchScope, searchState.sortOption]);

  const applyFilters = useCallback(async (filters: SearchFilters): Promise<void> => {
    setSearchState(prev => ({ ...prev, filters }));
    
    if (searchState.hasSearched && searchState.query) {
      await search(searchState.query, { filters });
    }
  }, [search, searchState.hasSearched, searchState.query]);

  const clearFilters = useCallback(() => {
    const emptyFilters: SearchFilters = {
      dateRange: null,
      dataTypes: [],
      sources: [],
      classifications: [],
      compliance: [],
      tags: [],
      customFilters: {}
    };
    
    setSearchState(prev => ({ ...prev, filters: emptyFilters, activeFacets: [] }));
  }, []);

  const setSearchScope = useCallback((scope: SearchScope[]) => {
    setSearchState(prev => ({ ...prev, searchScope: scope }));
  }, []);

  const toggleScopeItem = useCallback((scopeItem: SearchScope) => {
    setSearchState(prev => {
      const currentScope = prev.searchScope;
      const hasItem = currentScope.includes(scopeItem);
      
      let newScope: SearchScope[];
      if (hasItem) {
        newScope = currentScope.filter(item => item !== scopeItem);
        if (newScope.length === 0) newScope = ['all'];
      } else {
        newScope = scopeItem === 'all' ? ['all'] : [...currentScope.filter(item => item !== 'all'), scopeItem];
      }
      
      return { ...prev, searchScope: newScope };
    });
  }, []);

  const setSortOption = useCallback(async (option: SearchSortOption): Promise<void> => {
    setSearchState(prev => ({ ...prev, sortOption: option }));
    
    if (searchState.hasSearched && searchState.query) {
      await search(searchState.query, { sortBy: option });
    }
  }, [search, searchState.hasSearched, searchState.query]);

  const getSuggestions = useCallback(async (partial: string): Promise<SearchSuggestion[]> => {
    return await debouncedAutoComplete(partial);
  }, [debouncedAutoComplete]);

  const getAutoComplete = useCallback(async (partial: string): Promise<SearchSuggestion[]> => {
    return await getSuggestions(partial);
  }, [getSuggestions]);

  const searchAcrossAllSPAs = useCallback(async (query: string): Promise<SearchResult[]> => {
    return await search(query, { scope: ['all'] });
  }, [search]);

  const searchInSPA = useCallback(async (query: string, spaType: string): Promise<SearchResult[]> => {
    return await search(query, { scope: [spaType as SearchScope] });
  }, [search]);

  const searchInCategory = useCallback(async (query: string, category: SearchCategory): Promise<SearchResult[]> => {
    const categoryToScope: Record<SearchCategory, SearchScope[]> = {
      'governance': ['compliance-rules', 'rbac-system'],
      'catalog': ['advanced-catalog', 'classifications'],
      'scanning': ['scan-rule-sets', 'scan-logic'],
      'sources': ['data-sources'],
      'all': ['all']
    };
    
    return await search(query, { scope: categoryToScope[category] || ['all'] });
  }, [search]);

  const addToHistory = useCallback((query: SearchQuery) => {
    setSearchState(prev => {
      const maxHistory = options?.maxHistoryItems || 50;
      const newHistory = [query, ...prev.searchHistory.filter(h => h.id !== query.id)].slice(0, maxHistory);
      const newRecent = [query, ...prev.recentSearches.filter(h => h.id !== query.id)].slice(0, 10);
      
      // Store in localStorage
      try {
        localStorage.setItem('racine-search-history', JSON.stringify(newHistory));
        localStorage.setItem('racine-recent-searches', JSON.stringify(newRecent));
      } catch (error) {
        console.warn('Failed to save search history:', error);
      }
      
      return {
        ...prev,
        searchHistory: newHistory,
        recentSearches: newRecent
      };
    });
  }, [options?.maxHistoryItems]);

  const clearHistory = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      searchHistory: [],
      recentSearches: []
    }));
    
    try {
      localStorage.removeItem('racine-search-history');
      localStorage.removeItem('racine-recent-searches');
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  const saveSearch = useCallback(async (query: SearchQuery, name: string): Promise<void> => {
    try {
      const savedSearch = {
        ...query,
        name,
        id: `saved_${Date.now()}`,
        savedAt: new Date().toISOString()
      };
      
      await racineOrchestrationAPI.saveSearchQuery(savedSearch);
      
      setSearchState(prev => ({
        ...prev,
        savedSearches: [...prev.savedSearches, savedSearch]
      }));
    } catch (error) {
      console.error('Failed to save search:', error);
      throw error;
    }
  }, []);

  const trackSearchEvent = useCallback((event: SearchEvent) => {
    // Update metrics
    searchMetricsRef.current = {
      ...searchMetricsRef.current,
      totalQueries: searchMetricsRef.current.totalQueries + 1
    };
    
    // Send analytics
    racineOrchestrationAPI.trackSearchAnalytics(event).catch(error => {
      console.warn('Failed to track search event:', error);
    });
  }, []);

  // ========================================================================
  // LIFECYCLE & EFFECTS
  // ========================================================================

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load from localStorage
        const savedHistory = localStorage.getItem('racine-search-history');
        const savedRecent = localStorage.getItem('racine-recent-searches');
        
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          setSearchState(prev => ({ ...prev, searchHistory: history }));
        }
        
        if (savedRecent) {
          const recent = JSON.parse(savedRecent);
          setSearchState(prev => ({ ...prev, recentSearches: recent }));
        }
        
        // Load saved searches from backend
        const savedSearches = await racineOrchestrationAPI.getSavedSearches();
        const popularSearches = await racineOrchestrationAPI.getPopularSearches();
        
        setSearchState(prev => ({
          ...prev,
          savedSearches,
          popularSearches
        }));
        
      } catch (error) {
        console.warn('Failed to load saved search data:', error);
      }
    };
    
    loadSavedData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  // ========================================================================
  // RETURN HOOK INTERFACE
  // ========================================================================

  return {
    // State
    ...searchState,
    
    // Actions
    search,
    clearSearch,
    retrySearch,
    applyFilters,
    clearFilters,
    setSearchScope,
    toggleScopeItem,
    setSortOption,
    applyFacet: async (facet: SearchFacet) => {
      setSearchState(prev => ({
        ...prev,
        activeFacets: [...prev.activeFacets, facet]
      }));
    },
    removeFacet: (facetId: string) => {
      setSearchState(prev => ({
        ...prev,
        activeFacets: prev.activeFacets.filter(f => f.id !== facetId)
      }));
    },
    getSuggestions,
    getAutoComplete,
    searchAcrossAllSPAs,
    searchInSPA,
    searchInCategory,
    addToHistory,
    clearHistory,
    removeFromHistory: (queryId: string) => {
      setSearchState(prev => ({
        ...prev,
        searchHistory: prev.searchHistory.filter(h => h.id !== queryId),
        recentSearches: prev.recentSearches.filter(h => h.id !== queryId)
      }));
    },
    saveSearch,
    deleteSavedSearch: async (savedSearchId: string) => {
      await racineOrchestrationAPI.deleteSavedSearch(savedSearchId);
      setSearchState(prev => ({
        ...prev,
        savedSearches: prev.savedSearches.filter(s => s.id !== savedSearchId)
      }));
    },
    enableSemanticSearch: () => {
      setSearchState(prev => ({ ...prev, semanticSearchEnabled: true }));
    },
    disableSemanticSearch: () => {
      setSearchState(prev => ({ ...prev, semanticSearchEnabled: false }));
    },
    getAISuggestions: async (context: string) => {
      return await aiAssistantAPI.getSearchSuggestions({ context, query: searchState.query });
    },
    getSearchMetrics: () => searchMetricsRef.current,
    trackSearchEvent,
    optimizeSearch: async () => {
      // Clear old cache entries
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000;
      
      for (const [key, entry] of searchCache.current.entries()) {
        if (now - entry.timestamp > cacheExpiry) {
          searchCache.current.delete(key);
        }
      }
    }
  };
};
// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useGlobalSearch;
