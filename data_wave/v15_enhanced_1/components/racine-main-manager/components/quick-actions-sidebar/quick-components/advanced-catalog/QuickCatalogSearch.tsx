'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, Star, Database, Table, FileText, BarChart3, Eye, Download, Share, Clock, User, Tag, Layers, GitBranch, Activity, TrendingUp, Heart, Bookmark, ExternalLink, RefreshCw, Zap, Brain, Sparkles, Target, Grid, List, Calendar, MapPin, Globe, Network, Shield, Lock, Unlock, Settings, MoreHorizontal, ChevronDown, ChevronRight, ArrowUpRight, Copy, Edit, Trash, Plus, Minus, Check, AlertCircle, Info, HelpCircle,  } from 'lucide-react';

// Import hooks and services
import { useAdvancedCatalog } from '../../../../hooks/useAdvancedCatalog';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

// Import types
import {
  CatalogAsset,
  CatalogSearchRequest,
  CatalogSearchResult,
  CatalogFilter,
  AssetType,
  AssetCategory,
  SearchSuggestion,
  AssetMetadata,
} from '../../../types/racine-core.types';

interface QuickCatalogSearchProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface SearchConfiguration {
  query: string;
  filters: {
    assetTypes: AssetType[];
    categories: AssetCategory[];
    tags: string[];
    owners: string[];
    dateRange: {
      start?: Date;
      end?: Date;
    };
    classification: string[];
    sensitivity: string[];
    compliance: string[];
  };
  sortBy: 'relevance' | 'name' | 'created' | 'modified' | 'popularity';
  sortOrder: 'asc' | 'desc';
  includeArchived: boolean;
  exactMatch: boolean;
  fuzzySearch: boolean;
  aiEnhanced: boolean;
}

interface SearchStats {
  totalResults: number;
  searchTime: number;
  indexedAssets: number;
  coverage: number;
}

const QuickCatalogSearch: React.FC<QuickCatalogSearchProps> = ({
  isVisible,
  onClose,
  className = '',
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('search');
  const [searchConfig, setSearchConfig] = useState<SearchConfiguration>({
    query: '',
    filters: {
      assetTypes: [],
      categories: [],
      tags: [],
      owners: [],
      dateRange: {},
      classification: [],
      sensitivity: [],
      compliance: [],
    },
    sortBy: 'relevance',
    sortOrder: 'desc',
    includeArchived: false,
    exactMatch: false,
    fuzzySearch: true,
    aiEnhanced: true,
  });
  const [searchResults, setSearchResults] = useState<CatalogSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favoriteAssets, setFavoriteAssets] = useState<string[]>([]);

  // Hooks
  const {
    catalogAssets,
    searchCatalog,
    getAssetSuggestions,
    getAssetDetails,
    addToFavorites,
    removeFromFavorites,
    getPopularAssets,
    getCatalogStats,
    loading: catalogLoading,
    error: catalogError,
  } = useAdvancedCatalog();

  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser, hasPermission } = useUserManagement();
  const { generateSearchSuggestions, enhanceQuery } = useAIAssistant();
  const { getDataSources, getClassifications } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  // Computed values
  const hasActiveFilters = useMemo(() => {
    const { filters } = searchConfig;
    return (
      filters.assetTypes.length > 0 ||
      filters.categories.length > 0 ||
      filters.tags.length > 0 ||
      filters.owners.length > 0 ||
      filters.classification.length > 0 ||
      filters.sensitivity.length > 0 ||
      filters.compliance.length > 0 ||
      filters.dateRange.start ||
      filters.dateRange.end
    );
  }, [searchConfig.filters]);

  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.assets.filter(asset => 
      !searchConfig.includeArchived ? !asset.archived : true
    );
  }, [searchResults, searchConfig.includeArchived]);

  const assetTypeIcons = {
    table: Database,
    view: Table,
    dashboard: BarChart3,
    report: FileText,
    dataset: Layers,
    pipeline: GitBranch,
    model: Brain,
    api: Network,
  };

  // Effects
  useEffect(() => {
    if (isVisible && currentUser) {
      trackActivity({
        action: 'quick_catalog_search_opened',
        component: 'QuickCatalogSearch',
        metadata: { workspace: currentWorkspace?.id },
      });
      loadInitialData();
    }
  }, [isVisible, currentUser, trackActivity, currentWorkspace]);

  useEffect(() => {
    if (searchConfig.query && searchConfig.aiEnhanced) {
      generateAutoSuggestions();
    }
  }, [searchConfig.query, searchConfig.aiEnhanced]);

  // Handlers
  const loadInitialData = useCallback(async () => {
    try {
      const [stats, popular] = await Promise.all([
        getCatalogStats(),
        getPopularAssets({ limit: 5 }),
      ]);
      
      setSearchStats({
        totalResults: 0,
        searchTime: 0,
        indexedAssets: stats.totalAssets,
        coverage: stats.coverage,
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, [getCatalogStats, getPopularAssets]);

  const generateAutoSuggestions = useCallback(async () => {
    if (!searchConfig.query || searchConfig.query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const aiSuggestions = await generateSearchSuggestions({
        query: searchConfig.query,
        context: {
          workspace: currentWorkspace?.id,
          recentSearches,
          userRole: currentUser?.role,
        },
      });
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  }, [searchConfig.query, generateSearchSuggestions, currentWorkspace, recentSearches, currentUser]);

  const handleSearch = useCallback(async () => {
    if (!currentWorkspace) return;

    setIsSearching(true);
    const startTime = Date.now();

    try {
      const searchRequest: CatalogSearchRequest = {
        workspaceId: currentWorkspace.id,
        query: searchConfig.query,
        filters: searchConfig.filters,
        sortBy: searchConfig.sortBy,
        sortOrder: searchConfig.sortOrder,
        includeArchived: searchConfig.includeArchived,
        exactMatch: searchConfig.exactMatch,
        fuzzySearch: searchConfig.fuzzySearch,
        aiEnhanced: searchConfig.aiEnhanced,
        page: 1,
        limit: 50,
      };

      const result = await searchCatalog(searchRequest);
      const searchTime = Date.now() - startTime;

      setSearchResults(result);
      setSearchStats(prev => prev ? {
        ...prev,
        totalResults: result.totalCount,
        searchTime,
      } : null);

      // Add to recent searches
      if (searchConfig.query) {
        setRecentSearches(prev => {
          const updated = [searchConfig.query, ...prev.filter(q => q !== searchConfig.query)];
          return updated.slice(0, 10);
        });
      }

      // Track search activity
      trackActivity({
        action: 'catalog_search_executed',
        component: 'QuickCatalogSearch',
        metadata: {
          workspace: currentWorkspace.id,
          query: searchConfig.query,
          resultsCount: result.totalCount,
          searchTime,
          hasFilters: hasActiveFilters,
        },
      });

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [currentWorkspace, searchConfig, searchCatalog, trackActivity, hasActiveFilters]);

  const handleConfigChange = useCallback((key: keyof SearchConfiguration, value: any) => {
    setSearchConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFilterChange = useCallback((filterKey: string, value: any) => {
    setSearchConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterKey]: value,
      },
    }));
  }, []);

  const handleAssetSelect = useCallback((assetId: string, selected: boolean) => {
    setSelectedAssets(prev => 
      selected 
        ? [...prev, assetId]
        : prev.filter(id => id !== assetId)
    );
  }, []);

  const handleToggleFavorite = useCallback(async (assetId: string) => {
    try {
      const isFavorite = favoriteAssets.includes(assetId);
      
      if (isFavorite) {
        await removeFromFavorites(assetId);
        setFavoriteAssets(prev => prev.filter(id => id !== assetId));
      } else {
        await addToFavorites(assetId);
        setFavoriteAssets(prev => [...prev, assetId]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [favoriteAssets, addToFavorites, removeFromFavorites]);

  const clearFilters = useCallback(() => {
    setSearchConfig(prev => ({
      ...prev,
      filters: {
        assetTypes: [],
        categories: [],
        tags: [],
        owners: [],
        dateRange: {},
        classification: [],
        sensitivity: [],
        compliance: [],
      },
    }));
  }, []);

  const renderSearchTab = () => (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Search Input with AI Enhancement */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets, tables, reports, dashboards..."
                  value={searchConfig.query}
                  onChange={(e) => handleConfigChange('query', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {searchConfig.aiEnhanced && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1 bg-purple-100 rounded">
                          <Brain className="h-3 w-3 text-purple-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>AI Enhanced Search</TooltipContent>
                    </Tooltip>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    disabled={isSearching || !searchConfig.query}
                    className="h-8"
                  >
                    {isSearching ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Search className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ai-enhanced"
                      checked={searchConfig.aiEnhanced}
                      onCheckedChange={(checked) => handleConfigChange('aiEnhanced', checked)}
                    />
                    <Label htmlFor="ai-enhanced" className="text-xs">AI Enhanced</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fuzzy-search"
                      checked={searchConfig.fuzzySearch}
                      onCheckedChange={(checked) => handleConfigChange('fuzzySearch', checked)}
                    />
                    <Label htmlFor="fuzzy-search" className="text-xs">Fuzzy Search</Label>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-8"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="destructive" className="ml-1 h-4 w-4 text-xs rounded-full p-0">
                      !
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigChange('query', suggestion.query)}
                    className="h-7 text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search Stats */}
      {searchStats && searchResults && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between text-sm text-gray-500 px-2">
            <span>
              {searchStats.totalResults.toLocaleString()} results in {searchStats.searchTime}ms
            </span>
            <div className="flex items-center space-x-4">
              <span>{searchStats.indexedAssets.toLocaleString()} indexed assets</span>
              <span>{searchStats.coverage}% coverage</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {filteredResults.length > 0 ? (
                <div className="p-4 space-y-3">
                  {filteredResults.map((asset, index) => {
                    const IconComponent = assetTypeIcons[asset.type] || Database;
                    const isFavorite = favoriteAssets.includes(asset.id);
                    const isSelected = selectedAssets.includes(asset.id);
                    
                    return (
                      <motion.div
                        key={asset.id}
                        variants={itemVariants}
                        className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handleAssetSelect(asset.id, checked as boolean)
                              }
                            />
                            <div className="flex items-center space-x-2">
                              <div className="p-1 bg-gray-100 rounded">
                                <IconComponent className="h-4 w-4 text-gray-600" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {asset.type}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-sm truncate">{asset.name}</h4>
                                {asset.verified && (
                                  <Check className="h-3 w-3 text-green-500" />
                                )}
                                {asset.classification && (
                                  <Badge variant="secondary" className="text-xs">
                                    {asset.classification}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {asset.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{asset.owner}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(asset.lastModified).toLocaleDateString()}</span>
                                </div>
                                {asset.tags && asset.tags.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Tag className="h-3 w-3" />
                                    <span>{asset.tags.slice(0, 2).join(', ')}</span>
                                    {asset.tags.length > 2 && <span>+{asset.tags.length - 2}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleFavorite(asset.id)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Heart className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open asset</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No assets found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderFiltersTab = () => (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Asset Types */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Asset Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {['table', 'view', 'dashboard', 'report', 'dataset', 'pipeline'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={searchConfig.filters.assetTypes.includes(type as AssetType)}
                    onCheckedChange={(checked) => {
                      const current = searchConfig.filters.assetTypes;
                      const updated = checked
                        ? [...current, type as AssetType]
                        : current.filter(t => t !== type);
                      handleFilterChange('assetTypes', updated);
                    }}
                  />
                  <Label htmlFor={type} className="text-sm capitalize">{type}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {['finance', 'sales', 'marketing', 'operations', 'hr', 'analytics'].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={searchConfig.filters.categories.includes(category as AssetCategory)}
                    onCheckedChange={(checked) => {
                      const current = searchConfig.filters.categories;
                      const updated = checked
                        ? [...current, category as AssetCategory]
                        : current.filter(c => c !== category);
                      handleFilterChange('categories', updated);
                    }}
                  />
                  <Label htmlFor={category} className="text-sm capitalize">{category}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Classification & Sensitivity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Classification</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {['public', 'internal', 'confidential', 'restricted'].map((level) => (
                  <Button
                    key={level}
                    variant={searchConfig.filters.classification.includes(level) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const current = searchConfig.filters.classification;
                      const updated = current.includes(level)
                        ? current.filter(c => c !== level)
                        : [...current, level];
                      handleFilterChange('classification', updated);
                    }}
                    className="h-6 text-xs"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Sensitivity</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {['low', 'medium', 'high', 'critical'].map((level) => (
                  <Button
                    key={level}
                    variant={searchConfig.filters.sensitivity.includes(level) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const current = searchConfig.filters.sensitivity;
                      const updated = current.includes(level)
                        ? current.filter(s => s !== level)
                        : [...current, level];
                      handleFilterChange('sensitivity', updated);
                    }}
                    className="h-6 text-xs"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.div variants={itemVariants}>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </motion.div>
      )}
    </motion.div>
  );

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
        style={{ width: '420px', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Catalog Search
              </h2>
              <p className="text-sm text-gray-500">
                Find assets with AI-powered search
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedAssets.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedAssets.length} selected
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" className="text-xs">Search & Results</TabsTrigger>
              <TabsTrigger value="filters" className="text-xs">Advanced Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              {renderSearchTab()}
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              {renderFiltersTab()}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickCatalogSearch;