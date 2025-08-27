'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, SortAsc, SortDesc, Plus, Edit3, Trash2, MoreHorizontal, Star, Award, Crown, Zap, ThumbsUp, ThumbsDown, Bookmark, Bell, Settings, User, Hash, Clock, TrendingUp, BarChart3, PieChart, Activity, FileText, Image, Video, Link, Download, Upload, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, RefreshCw, ExternalLink, Copy, Send, Database, FolderOpen, Globe, Map, Layers, Grid3X3, List, Eye, EyeOff, Heart, MessageSquare, Share2, Flag, Shield, Mic, MicOff, Camera, Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Loader2, Sparkles, Target, Crosshair, Navigation, Compass, MapPin, Route, Building, Users, UserCheck, UserPlus, UserMinus, UserX, AtSign, Mail, Phone, Calendar1, CalendarDays, CalendarRange, Timer, Stopwatch, History, TrendingDown, BarChart4, Radar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter } from 'recharts';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { collaborationService } from '../../services';
import { advancedLineageService } from '../../services/advanced-lineage.service';

// Enhanced Type Definitions for Unified Search Interface
interface UnifiedSearchInterface {
  id: string;
  name: string;
  description: string;
  version: string;
  configuration: SearchConfiguration;
  analytics: SearchAnalytics;
  personalizations: SearchPersonalization[];
  savedSearches: SavedSearch[];
  searchHistory: SearchHistoryEntry[];
  performance: SearchPerformance;
  createdAt: string;
  updatedAt: string;
}

interface SearchConfiguration {
  enabledEngines: SearchEngine[];
  defaultEngine: SearchEngineType;
  searchSources: SearchSource[];
  indexingSettings: IndexingSettings;
  nlpSettings: NLPSettings;
  semanticSettings: SemanticSettings;
  filterSettings: FilterSettings;
  rankingSettings: RankingSettings;
  autoComplete: AutoCompleteSettings;
  searchSuggestions: SuggestionSettings;
  caching: CacheSettings;
  security: SearchSecuritySettings;
}

interface SearchEngine {
  type: SearchEngineType;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  configuration: EngineConfiguration;
  performance: EnginePerformance;
  status: EngineStatus;
  endpoints: SearchEndpoint[];
}

interface SearchSource {
  id: string;
  name: string;
  type: SearchSourceType;
  enabled: boolean;
  weight: number;
  configuration: SourceConfiguration;
  indexStatus: IndexStatus;
  lastIndexed: string;
  itemCount: number;
  metadata: SourceMetadata;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  source: SearchSource;
  type: ResultType;
  relevanceScore: number;
  semanticScore: number;
  popularityScore: number;
  freshnessScore: number;
  qualityScore: number;
  compositeScore: number;
  rank: number;
  url: string;
  thumbnail?: string;
  preview?: string;
  metadata: ResultMetadata;
  highlights: SearchHighlight[];
  facets: SearchFacet[];
  relatedResults: RelatedResult[];
  actions: ResultAction[];
  analytics: ResultAnalytics;
  createdAt: string;
  updatedAt: string;
  lastAccessed: string;
}

interface SearchQuery {
  id: string;
  originalQuery: string;
  processedQuery: string;
  naturalLanguageQuery?: string;
  structuredQuery?: StructuredQuery;
  semanticQuery?: SemanticQuery;
  intent: QueryIntent;
  entityRecognition: EntityRecognition[];
  queryExpansion: QueryExpansion;
  filters: SearchFilter[];
  facets: SearchFacet[];
  sorting: SearchSorting;
  pagination: SearchPagination;
  preferences: QueryPreferences;
  context: SearchContext;
  timestamp: string;
}

interface SearchResponse {
  query: SearchQuery;
  results: SearchResult[];
  totalResults: number;
  executionTime: number;
  searchEngines: SearchEngineResult[];
  aggregatedFacets: AggregatedFacet[];
  suggestions: SearchSuggestion[];
  corrections: QueryCorrection[];
  relatedQueries: RelatedQuery[];
  analytics: ResponseAnalytics;
  performance: ResponsePerformance;
  metadata: ResponseMetadata;
}

interface SearchFilter {
  id: string;
  name: string;
  type: FilterType;
  operator: FilterOperator;
  value: any;
  values: any[];
  displayName: string;
  description: string;
  enabled: boolean;
  required: boolean;
  defaultValue?: any;
  options: FilterOption[];
  constraints: FilterConstraint[];
  dependencies: FilterDependency[];
}

interface SearchFacet {
  id: string;
  name: string;
  displayName: string;
  type: FacetType;
  values: FacetValue[];
  multiSelect: boolean;
  hierarchical: boolean;
  searchable: boolean;
  sortable: boolean;
  collapsible: boolean;
  defaultExpanded: boolean;
  showCount: boolean;
  minCount: number;
  maxValues: number;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: SuggestionType;
  source: SuggestionSource;
  confidence: number;
  popularity: number;
  context: SuggestionContext;
  metadata: SuggestionMetadata;
}

interface AutoCompleteResult {
  id: string;
  text: string;
  displayText: string;
  type: AutoCompleteType;
  source: string;
  score: number;
  highlight: string;
  category: string;
  metadata: AutoCompleteMetadata;
}

interface SearchPersonalization {
  userId: string;
  preferences: PersonalizationPreferences;
  behaviorProfile: BehaviorProfile;
  searchHistory: PersonalSearchHistory[];
  recommendations: PersonalizedRecommendation[];
  customFilters: CustomFilter[];
  savedQueries: SavedQuery[];
  bookmarks: SearchBookmark[];
  analytics: PersonalizationAnalytics;
}

interface SearchAnalytics {
  overview: SearchOverview;
  queryAnalytics: QueryAnalytics;
  resultAnalytics: ResultAnalytics;
  userAnalytics: UserAnalytics;
  performanceAnalytics: PerformanceAnalytics;
  sourceAnalytics: SourceAnalytics;
  engagementAnalytics: EngagementAnalytics;
  trendsAnalytics: TrendsAnalytics;
  qualityAnalytics: QualityAnalytics;
  businessAnalytics: BusinessAnalytics;
}

// Enums
enum SearchEngineType {
  ELASTICSEARCH = 'elasticsearch',
  SOLR = 'solr',
  LUCENE = 'lucene',
  SEMANTIC = 'semantic',
  NEURAL = 'neural',
  HYBRID = 'hybrid',
  VECTOR = 'vector',
  GRAPH = 'graph'
}

enum SearchSourceType {
  DATABASE = 'database',
  FILE_SYSTEM = 'file_system',
  WEB_SERVICE = 'web_service',
  DOCUMENT_STORE = 'document_store',
  KNOWLEDGE_BASE = 'knowledge_base',
  DATA_LAKE = 'data_lake',
  DATA_WAREHOUSE = 'data_warehouse',
  API = 'api',
  STREAMING = 'streaming'
}

enum ResultType {
  DOCUMENT = 'document',
  DATASET = 'dataset',
  SCHEMA = 'schema',
  TABLE = 'table',
  COLUMN = 'column',
  DASHBOARD = 'dashboard',
  REPORT = 'report',
  VISUALIZATION = 'visualization',
  PERSON = 'person',
  TERM = 'term',
  POLICY = 'policy',
  WORKFLOW = 'workflow'
}

enum QueryIntent {
  SEARCH = 'search',
  BROWSE = 'browse',
  EXPLORE = 'explore',
  ANALYZE = 'analyze',
  COMPARE = 'compare',
  DISCOVER = 'discover',
  INVESTIGATE = 'investigate',
  MONITOR = 'monitor'
}

enum FilterType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ENUM = 'enum',
  RANGE = 'range',
  GEO = 'geo',
  TAG = 'tag'
}

enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in'
}

enum FacetType {
  TERMS = 'terms',
  RANGE = 'range',
  DATE_HISTOGRAM = 'date_histogram',
  HISTOGRAM = 'histogram',
  NESTED = 'nested',
  FILTER = 'filter',
  SIGNIFICANT_TERMS = 'significant_terms'
}

enum SuggestionType {
  QUERY_COMPLETION = 'query_completion',
  QUERY_CORRECTION = 'query_correction',
  ENTITY_SUGGESTION = 'entity_suggestion',
  FILTER_SUGGESTION = 'filter_suggestion',
  RELATED_SEARCH = 'related_search',
  TRENDING_SEARCH = 'trending_search'
}

// Additional interfaces
interface IndexingSettings {
  autoIndex: boolean;
  indexingFrequency: string;
  batchSize: number;
  parallel: boolean;
  incrementalUpdate: boolean;
  fullRebuild: boolean;
  excludePatterns: string[];
  includePatterns: string[];
}

interface NLPSettings {
  enabled: boolean;
  language: string;
  entityRecognition: boolean;
  intentClassification: boolean;
  sentimentAnalysis: boolean;
  keywordExtraction: boolean;
  summaryGeneration: boolean;
  questionAnswering: boolean;
}

interface SemanticSettings {
  enabled: boolean;
  model: string;
  vectorDimensions: number;
  similarityThreshold: number;
  conceptExpansion: boolean;
  synonymExpansion: boolean;
  contextualSearch: boolean;
  knowledgeGraph: boolean;
}

interface RankingSettings {
  algorithm: string;
  features: RankingFeature[];
  weights: RankingWeight[];
  learningToRank: boolean;
  personalizedRanking: boolean;
  businessRules: BusinessRule[];
  boostingRules: BoostingRule[];
}

interface AutoCompleteSettings {
  enabled: boolean;
  minCharacters: number;
  maxSuggestions: number;
  includePopularQueries: boolean;
  includeEntities: boolean;
  includeFilters: boolean;
  fuzzyMatching: boolean;
  phonetic: boolean;
}

interface SearchOverview {
  totalQueries: number;
  uniqueUsers: number;
  averageResultsPerQuery: number;
  averageQueryTime: number;
  topQueries: TopQuery[];
  queryTrends: QueryTrend[];
  userSatisfaction: number;
  conversionRate: number;
}

interface QueryAnalytics {
  queryDistribution: QueryDistribution[];
  queryTypes: QueryTypeStats[];
  queryLength: QueryLengthStats[];
  queryComplexity: QueryComplexityStats[];
  querySuccess: QuerySuccessStats[];
  queryIntents: QueryIntentStats[];
  popularTerms: PopularTerm[];
  failedQueries: FailedQuery[];
}

const UnifiedSearchInterface: React.FC = () => {
  // State Management
  const [searchInterface, setSearchInterface] = useState<UnifiedSearchInterface | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<Map<string, string[]>>(new Map());
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [autoCompleteResults, setAutoCompleteResults] = useState<AutoCompleteResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [personalization, setPersonalization] = useState<SearchPersonalization | null>(null);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced' | 'natural'>('simple');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'cards' | 'table'>('list');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [resultsPerPage, setResultsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [showFacets, setShowFacets] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showPersonalization, setShowPersonalization] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Form State
  const [advancedQuery, setAdvancedQuery] = useState({
    allWords: '',
    exactPhrase: '',
    anyWords: '',
    excludeWords: '',
    fileType: '',
    dateRange: { from: '', to: '' },
    source: '',
    language: ''
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoCompleteTimeoutRef = useRef<NodeJS.Timeout>();

  // Load search interface data
  const loadSearchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load search interface configuration and data
      const [
        interfaceData,
        historyData,
        savedData,
        personalizationData,
        analyticsData
      ] = await Promise.all([
        intelligentDiscoveryService.getSearchInterface(),
        intelligentDiscoveryService.getSearchHistory(),
        intelligentDiscoveryService.getSavedSearches(),
        intelligentDiscoveryService.getSearchPersonalization(),
        intelligentDiscoveryService.getSearchAnalytics()
      ]);

      setSearchInterface(interfaceData);
      setSearchHistory(historyData);
      setSavedSearches(savedData);
      setPersonalization(personalizationData);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading search data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    // Polling for updates
    const interval = setInterval(loadSearchData, 60000);

    // WebSocket for real-time search updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/search');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'search_completed':
          if (data.results) {
            setSearchResults(data.results);
            setSearchResponse(data.response);
          }
          break;
        case 'suggestions_updated':
          setSearchSuggestions(data.suggestions);
          break;
        case 'autocomplete_updated':
          setAutoCompleteResults(data.autocomplete);
          break;
        case 'personalization_updated':
          setPersonalization(data.personalization);
          break;
      }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [loadSearchData]);

  // Initialize component
  useEffect(() => {
    loadSearchData();
    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, [loadSearchData, setupRealTimeUpdates]);

  // Auto-complete functionality
  const handleSearchInputChange = useCallback(async (value: string) => {
    setSearchQuery(value);

    if (autoCompleteTimeoutRef.current) {
      clearTimeout(autoCompleteTimeoutRef.current);
    }

    if (value.length >= 2) {
      autoCompleteTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await intelligentDiscoveryService.getAutoComplete(value);
          setAutoCompleteResults(suggestions);
        } catch (error) {
          console.error('Error fetching autocomplete:', error);
        }
      }, 300);
    } else {
      setAutoCompleteResults([]);
    }
  }, []);

  // Search execution
  const executeSearch = useCallback(async (query?: string, options?: any) => {
    try {
      setIsSearching(true);
      const searchText = query || searchQuery;
      
      if (!searchText.trim()) return;

      const searchRequest = {
        query: searchText,
        mode: searchMode,
        filters: activeFilters,
        facets: Array.from(selectedFacets.entries()).map(([key, values]) => ({ key, values })),
        sorting: sortBy,
        page: currentPage,
        size: resultsPerPage,
        ...options
      };

      const response = await intelligentDiscoveryService.executeSearch(searchRequest);
      
      setSearchResults(response.results);
      setSearchResponse(response);
      
      // Update search history
      const historyEntry = {
        query: searchText,
        timestamp: new Date().toISOString(),
        resultCount: response.totalResults,
        executionTime: response.executionTime
      };
      
      await intelligentDiscoveryService.addSearchHistory(historyEntry);
      setSearchHistory(prev => [historyEntry, ...prev.slice(0, 49)]);

    } catch (error) {
      console.error('Error executing search:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchMode, activeFilters, selectedFacets, sortBy, currentPage, resultsPerPage]);

  // Natural language search
  const executeNaturalLanguageSearch = useCallback(async () => {
    try {
      setIsSearching(true);
      
      const response = await intelligentDiscoveryService.executeNaturalLanguageSearch({
        query: naturalLanguageQuery,
        context: 'data_catalog',
        intent: 'discovery'
      });
      
      setSearchResults(response.results);
      setSearchResponse(response);
      
    } catch (error) {
      console.error('Error executing natural language search:', error);
    } finally {
      setIsSearching(false);
    }
  }, [naturalLanguageQuery]);

  // Advanced search
  const executeAdvancedSearch = useCallback(async () => {
    try {
      setIsSearching(true);
      
      const response = await intelligentDiscoveryService.executeAdvancedSearch(advancedQuery);
      
      setSearchResults(response.results);
      setSearchResponse(response);
      
    } catch (error) {
      console.error('Error executing advanced search:', error);
    } finally {
      setIsSearching(false);
    }
  }, [advancedQuery]);

  // Save search
  const saveSearch = useCallback(async (name: string, query: string) => {
    try {
      const savedSearch = await intelligentDiscoveryService.saveSearch({
        name,
        query,
        filters: activeFilters,
        facets: Array.from(selectedFacets.entries()),
        configuration: {
          sortBy,
          resultsPerPage,
          searchMode
        }
      });
      
      setSavedSearches(prev => [savedSearch, ...prev]);
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }, [activeFilters, selectedFacets, sortBy, resultsPerPage, searchMode]);

  // Load saved search
  const loadSavedSearch = useCallback(async (savedSearch: SavedSearch) => {
    try {
      setSearchQuery(savedSearch.query);
      setActiveFilters(savedSearch.filters);
      setSelectedFacets(new Map(savedSearch.facets));
      setSortBy(savedSearch.configuration.sortBy);
      setResultsPerPage(savedSearch.configuration.resultsPerPage);
      setSearchMode(savedSearch.configuration.searchMode);
      
      await executeSearch(savedSearch.query);
    } catch (error) {
      console.error('Error loading saved search:', error);
    }
  }, [executeSearch]);

  // Filter management
  const addFilter = useCallback((filter: SearchFilter) => {
    setActiveFilters(prev => [...prev, filter]);
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const updateFilter = useCallback((filterId: string, value: any) => {
    setActiveFilters(prev => prev.map(f => 
      f.id === filterId ? { ...f, value } : f
    ));
  }, []);

  // Facet management
  const toggleFacetValue = useCallback((facetId: string, value: string) => {
    setSelectedFacets(prev => {
      const newMap = new Map(prev);
      const currentValues = newMap.get(facetId) || [];
      
      if (currentValues.includes(value)) {
        const updatedValues = currentValues.filter(v => v !== value);
        if (updatedValues.length === 0) {
          newMap.delete(facetId);
        } else {
          newMap.set(facetId, updatedValues);
        }
      } else {
        newMap.set(facetId, [...currentValues, value]);
      }
      
      return newMap;
    });
  }, []);

  // Result actions
  const viewResult = useCallback(async (result: SearchResult) => {
    try {
      setSelectedResult(result);
      setShowPreview(true);
      
      // Track result view
      await intelligentDiscoveryService.trackResultView({
        resultId: result.id,
        query: searchQuery,
        position: result.rank,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error viewing result:', error);
    }
  }, [searchQuery]);

  const bookmarkResult = useCallback(async (result: SearchResult) => {
    try {
      await intelligentDiscoveryService.bookmarkResult(result.id);
      // Update local state to show bookmark status
    } catch (error) {
      console.error('Error bookmarking result:', error);
    }
  }, []);

  // Utility functions
  const formatExecutionTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const getResultTypeIcon = (type: ResultType) => {
    switch (type) {
      case ResultType.DATABASE: return <Database className="h-4 w-4" />;
      case ResultType.DOCUMENT: return <FileText className="h-4 w-4" />;
      case ResultType.DATASET: return <BarChart3 className="h-4 w-4" />;
      case ResultType.SCHEMA: return <Layers className="h-4 w-4" />;
      case ResultType.TABLE: return <Grid3X3 className="h-4 w-4" />;
      case ResultType.DASHBOARD: return <PieChart className="h-4 w-4" />;
      case ResultType.PERSON: return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResultTypeColor = (type: ResultType) => {
    switch (type) {
      case ResultType.DATABASE: return 'bg-blue-100 text-blue-800';
      case ResultType.DOCUMENT: return 'bg-green-100 text-green-800';
      case ResultType.DATASET: return 'bg-purple-100 text-purple-800';
      case ResultType.SCHEMA: return 'bg-yellow-100 text-yellow-800';
      case ResultType.TABLE: return 'bg-red-100 text-red-800';
      case ResultType.DASHBOARD: return 'bg-indigo-100 text-indigo-800';
      case ResultType.PERSON: return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading search interface...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Search className="h-8 w-8" />
            <span>Unified Search</span>
          </h1>
          <p className="text-muted-foreground">
            Intelligent discovery across all data sources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPersonalization(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Personalization
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(true)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced
          </Button>
        </div>
      </div>

      {/* Search Interface */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simple">Simple Search</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Search</TabsTrigger>
              <TabsTrigger value="natural">Natural Language</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search across all data sources..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && executeSearch()}
                    className="pl-10 pr-20"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                  <Button
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => executeSearch()}
                    disabled={isSearching}
                  >
                    Search
                  </Button>
                </div>
                <Button variant="outline" size="icon">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Auto-complete dropdown */}
              {autoCompleteResults.length > 0 && (
                <Card className="absolute z-50 w-full mt-1">
                  <CardContent className="p-2">
                    {autoCompleteResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => {
                          setSearchQuery(result.text);
                          setAutoCompleteResults([]);
                          executeSearch(result.text);
                        }}
                      >
                        <Search className="h-3 w-3 text-muted-foreground" />
                        <span dangerouslySetInnerHTML={{ __html: result.highlight }} />
                        <Badge variant="outline" className="text-xs">
                          {result.category}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allWords">All of these words</Label>
                  <Input
                    id="allWords"
                    value={advancedQuery.allWords}
                    onChange={(e) => setAdvancedQuery({ ...advancedQuery, allWords: e.target.value })}
                    placeholder="Enter words that must appear"
                  />
                </div>
                <div>
                  <Label htmlFor="exactPhrase">This exact word or phrase</Label>
                  <Input
                    id="exactPhrase"
                    value={advancedQuery.exactPhrase}
                    onChange={(e) => setAdvancedQuery({ ...advancedQuery, exactPhrase: e.target.value })}
                    placeholder="Enter exact phrase"
                  />
                </div>
                <div>
                  <Label htmlFor="anyWords">Any of these words</Label>
                  <Input
                    id="anyWords"
                    value={advancedQuery.anyWords}
                    onChange={(e) => setAdvancedQuery({ ...advancedQuery, anyWords: e.target.value })}
                    placeholder="Enter alternative words"
                  />
                </div>
                <div>
                  <Label htmlFor="excludeWords">None of these words</Label>
                  <Input
                    id="excludeWords"
                    value={advancedQuery.excludeWords}
                    onChange={(e) => setAdvancedQuery({ ...advancedQuery, excludeWords: e.target.value })}
                    placeholder="Enter words to exclude"
                  />
                </div>
                <div>
                  <Label htmlFor="fileType">File type</Label>
                  <Select
                    value={advancedQuery.fileType}
                    onValueChange={(value) => setAdvancedQuery({ ...advancedQuery, fileType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any file type</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="doc">Document</SelectItem>
                      <SelectItem value="xls">Spreadsheet</SelectItem>
                      <SelectItem value="ppt">Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={advancedQuery.source}
                    onValueChange={(value) => setAdvancedQuery({ ...advancedQuery, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any source</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="file_system">File System</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="streaming">Streaming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={executeAdvancedSearch} disabled={isSearching}>
                  {isSearching && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Advanced Search
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="natural" className="space-y-4">
              <div>
                <Label htmlFor="naturalQuery">Ask a question in natural language</Label>
                <Textarea
                  id="naturalQuery"
                  value={naturalLanguageQuery}
                  onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                  placeholder="e.g., 'Show me all customer data tables created in the last month'"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={executeNaturalLanguageSearch} disabled={isSearching}>
                  {isSearching && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResponse && (
        <div className="grid grid-cols-12 gap-6">
          {/* Filters and Facets */}
          {showFilters && (
            <div className="col-span-3 space-y-4">
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Active Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {activeFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center justify-between">
                        <span className="text-sm">{filter.displayName}: {filter.value}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {/* Facets */}
              {searchResponse.aggregatedFacets.map((facet) => (
                <Card key={facet.id}>
                  <CardHeader>
                    <CardTitle className="text-sm">{facet.displayName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {facet.values.slice(0, 10).map((value) => (
                      <div key={value.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedFacets.get(facet.id)?.includes(value.value) || false}
                          onCheckedChange={() => toggleFacetValue(facet.id, value.value)}
                        />
                        <span className="text-sm flex-1">{value.displayValue}</span>
                        <Badge variant="outline" className="text-xs">
                          {value.count}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Results */}
          <div className={`${showFilters ? 'col-span-9' : 'col-span-12'} space-y-4`}>
            {/* Results Header */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      {searchResponse.totalResults.toLocaleString()} results
                      in {formatExecutionTime(searchResponse.executionTime)}
                    </span>
                    {searchResponse.corrections.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Did you mean:</span>
                        {searchResponse.corrections.map((correction, index) => (
                          <Button
                            key={index}
                            variant="link"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() => executeSearch(correction.suggestion)}
                          >
                            {correction.suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Results List */}
            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getResultTypeIcon(result.type)}
                          <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                            {result.title}
                          </h3>
                          <Badge className={getResultTypeColor(result.type)}>
                            {result.type}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(result.qualityScore / 20)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {result.description}
                        </p>
                        
                        {result.highlights.length > 0 && (
                          <div className="mb-3">
                            {result.highlights.map((highlight, index) => (
                              <p key={index} className="text-sm">
                                ...
                                <span dangerouslySetInnerHTML={{ __html: highlight.fragment }} />
                                ...
                              </p>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Source: {result.source.name}</span>
                          <span>•</span>
                          <span>Relevance: {(result.relevanceScore * 100).toFixed(1)}%</span>
                          <span>•</span>
                          <span>Updated: {new Date(result.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        {result.facets.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            {result.facets.slice(0, 5).map((facet, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {facet.displayName}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewResult(result)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => bookmarkResult(result)}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Source
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Flag className="h-4 w-4 mr-2" />
                              Report Issue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {searchResponse.totalResults > resultsPerPage && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * resultsPerPage) + 1} to{' '}
                      {Math.min(currentPage * resultsPerPage, searchResponse.totalResults)} of{' '}
                      {searchResponse.totalResults.toLocaleString()} results
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {[...Array(Math.min(5, Math.ceil(searchResponse.totalResults / resultsPerPage)))].map((_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= Math.ceil(searchResponse.totalResults / resultsPerPage)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Quick Search Suggestions */}
      {!searchResponse && searchSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {searchSuggestions.slice(0, 8).map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  className="justify-start"
                  onClick={() => executeSearch(suggestion.text)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search History and Saved Searches */}
      {!searchResponse && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Recent Searches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchHistory.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => executeSearch(entry.query)}
                  >
                    <span className="text-sm">{entry.query}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bookmark className="h-5 w-5" />
                <span>Saved Searches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedSearches.slice(0, 10).map((savedSearch) => (
                  <div
                    key={savedSearch.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => loadSavedSearch(savedSearch)}
                  >
                    <div>
                      <div className="text-sm font-medium">{savedSearch.name}</div>
                      <div className="text-xs text-muted-foreground">{savedSearch.query}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchInterface;