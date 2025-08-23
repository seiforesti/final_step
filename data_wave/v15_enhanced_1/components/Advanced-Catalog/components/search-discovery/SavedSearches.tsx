'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Treemap
} from 'recharts';

import { Bookmark, Search, Save, Share, Star, Heart, Clock, Calendar, Users, User, Eye, EyeOff, Play, Pause, Edit, Trash2, Copy, Download, Upload, RefreshCw, MoreVertical, Plus, Minus, X, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronUp, ChevronDown, ChevronRight, Filter, Tag, Folder, FolderPlus, Settings, Sliders, Target, Zap, Brain, Sparkles, Lightbulb, TrendingUp, Activity, BarChart3, PieChart as PieChartIcon, Database, FileText, Globe, Hash, Layers, Network, Cpu, Bot, AlertCircle, CheckCircle, Info, AlertTriangle, Volume2, VolumeX, FastForward, Rewind, SkipForward, SkipBack, Shuffle, Repeat, ToggleLeft, ToggleRight, Maximize, Minimize, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, Mail, Phone, Map, MapPin, Navigation, Compass, Route, GitBranch, Code, Terminal, Command, History, Bookmark as BookmarkIcon, FolderOpen, Archive, Trash, Link, Shield, Lock, Unlock, Timer } from 'lucide-react';

// Hook imports
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { semanticSearchService } from '../../services/semantic-search.service';

// Type imports
import {
  SearchHistoryItem,
  SearchRequest,
  SearchResponse,
  SearchFilter,
  IntelligentDataAsset
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface SavedSearchesProps {
  userId?: string;
  onSearchExecute?: (search: SavedSearch) => void;
  onSearchSave?: (search: SavedSearch) => void;
  onSearchShare?: (searchId: string, shareOptions: ShareOptions) => void;
  onError?: (error: Error) => void;
}

interface SavedSearchesState {
  currentUserId: string;
  selectedSearches: string[];
  searchFilter: string;
  selectedCategory: string;
  selectedFolder: string;
  sortBy: 'NAME' | 'DATE_CREATED' | 'DATE_MODIFIED' | 'USAGE_COUNT' | 'RATING';
  sortOrder: 'ASC' | 'DESC';
  viewMode: 'GRID' | 'LIST' | 'TABLE';
  showSharedOnly: boolean;
  showFavoritesOnly: boolean;
  showRecentOnly: boolean;
  activeTab: string;
  isAdvancedView: boolean;
  autoSync: boolean;
  showPreview: boolean;
  enableNotifications: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  description: string;
  query: string;
  filters: SearchFilter[];
  owner: string;
  folder: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isFavorite: boolean;
  isShared: boolean;
  sharedWith: string[];
  createdAt: Date;
  lastModified: Date;
  lastExecuted: Date;
  executionCount: number;
  averageExecutionTime: number;
  resultCount: number;
  rating: number;
  ratingCount: number;
  comments: SearchComment[];
  metadata: SearchMetadata;
  schedule?: SearchSchedule;
  notifications: SearchNotification[];
}

interface SearchFolder {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  owner: string;
  isShared: boolean;
  searchCount: number;
  createdAt: Date;
  lastModified: Date;
  color: string;
  icon: string;
}

interface SearchComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  rating: number;
  createdAt: Date;
  isEdited: boolean;
}

interface SearchMetadata {
  complexity: 'SIMPLE' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  performance: SearchPerformance;
  usage: SearchUsage;
  quality: SearchQuality;
}

interface SearchPerformance {
  avgExecutionTime: number;
  successRate: number;
  errorRate: number;
  optimizationSuggestions: string[];
}

interface SearchUsage {
  totalExecutions: number;
  uniqueUsers: number;
  peakUsageTimes: string[];
  popularFilters: string[];
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
}

interface SearchQuality {
  relevanceScore: number;
  userSatisfaction: number;
  resultUtility: number;
  feedbackScore: number;
}

interface SearchSchedule {
  id: string;
  isEnabled: boolean;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time: string;
  timezone: string;
  lastRun: Date;
  nextRun: Date;
  recipients: string[];
  format: 'EMAIL' | 'CSV' | 'JSON' | 'PDF';
}

interface SearchNotification {
  id: string;
  type: 'SCHEDULE' | 'SHARE' | 'COMMENT' | 'RATING' | 'ERROR';
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface ShareOptions {
  users: string[];
  groups: string[];
  permissions: 'VIEW' | 'EDIT' | 'ADMIN';
  expiresAt?: Date;
  message?: string;
  allowComments: boolean;
  allowRating: boolean;
}

interface SearchAnalytics {
  totalSearches: number;
  activeSearches: number;
  sharedSearches: number;
  favoriteSearches: number;
  executionTrends: AnalyticsTrend[];
  popularCategories: CategoryStats[];
  topPerformers: SavedSearch[];
  userEngagement: EngagementStats;
}

interface AnalyticsTrend {
  date: Date;
  executions: number;
  uniqueUsers: number;
  avgExecutionTime: number;
  successRate: number;
}

interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  growth: number;
}

interface EngagementStats {
  totalUsers: number;
  activeUsers: number;
  avgSearchesPerUser: number;
  retentionRate: number;
  satisfactionScore: number;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockSavedSearches = (): SavedSearch[] => {
  const categories = ['Analytics', 'Reports', 'Data Quality', 'Compliance', 'Business Intelligence'];
  const folders = ['Personal', 'Team', 'Projects', 'Templates', 'Archive'];
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: `search_${i + 1}`,
    name: `Saved Search ${i + 1}`,
    description: `Description for saved search ${i + 1} with detailed context and purpose`,
    query: `search query ${i + 1}`,
    filters: [
      {
        id: `filter_${i + 1}`,
        field: 'type',
        operator: 'EQUALS',
        value: 'TABLE',
        type: 'SIMPLE'
      }
    ],
    owner: `user_${(i % 5) + 1}`,
    folder: folders[i % folders.length],
    category: categories[i % categories.length],
    tags: [`tag_${i + 1}`, `category_${(i % 3) + 1}`],
    isPublic: i % 3 === 0,
    isFavorite: i % 4 === 0,
    isShared: i % 2 === 0,
    sharedWith: [`user_${(i % 3) + 2}`, `user_${(i % 3) + 3}`],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    lastExecuted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    executionCount: Math.floor(Math.random() * 100) + 1,
    averageExecutionTime: Math.random() * 5 + 0.5,
    resultCount: Math.floor(Math.random() * 1000) + 10,
    rating: Math.random() * 2 + 3,
    ratingCount: Math.floor(Math.random() * 20) + 1,
    comments: [
      {
        id: `comment_${i + 1}`,
        userId: `user_${(i % 3) + 1}`,
        userName: `User ${(i % 3) + 1}`,
        content: `Great search! Very useful for ${categories[i % categories.length].toLowerCase()}`,
        rating: Math.floor(Math.random() * 2) + 4,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        isEdited: false
      }
    ],
    metadata: {
      complexity: (['SIMPLE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const)[i % 4],
      performance: {
        avgExecutionTime: Math.random() * 3 + 0.5,
        successRate: 90 + Math.random() * 10,
        errorRate: Math.random() * 5,
        optimizationSuggestions: ['Add index on column X', 'Consider filter optimization']
      },
      usage: {
        totalExecutions: Math.floor(Math.random() * 500) + 50,
        uniqueUsers: Math.floor(Math.random() * 50) + 5,
        peakUsageTimes: ['09:00', '14:00', '16:00'],
        popularFilters: ['type', 'department', 'date'],
        trendDirection: (['UP', 'DOWN', 'STABLE'] as const)[i % 3]
      },
      quality: {
        relevanceScore: 70 + Math.random() * 30,
        userSatisfaction: 80 + Math.random() * 20,
        resultUtility: 75 + Math.random() * 25,
        feedbackScore: 3 + Math.random() * 2
      }
    },
    notifications: [
      {
        id: `notif_${i + 1}`,
        type: (['SCHEDULE', 'SHARE', 'COMMENT'] as const)[i % 3],
        message: `Notification message for search ${i + 1}`,
        isRead: i % 2 === 0,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      }
    ]
  }));
};

const generateMockFolders = (): SearchFolder[] => {
  return [
    {
      id: 'folder_1',
      name: 'Personal',
      description: 'Personal saved searches',
      owner: 'current_user',
      isShared: false,
      searchCount: 8,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      color: '#3B82F6',
      icon: 'User'
    },
    {
      id: 'folder_2',
      name: 'Team',
      description: 'Shared team searches',
      owner: 'current_user',
      isShared: true,
      searchCount: 12,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      color: '#10B981',
      icon: 'Users'
    },
    {
      id: 'folder_3',
      name: 'Projects',
      description: 'Project-specific searches',
      owner: 'current_user',
      isShared: true,
      searchCount: 5,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      color: '#F59E0B',
      icon: 'Folder'
    }
  ];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SavedSearches: React.FC<SavedSearchesProps> = ({
  userId = 'current_user',
  onSearchExecute,
  onSearchSave,
  onSearchShare,
  onError
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const discoveryHook = useCatalogDiscovery({
    enableRealTimeUpdates: true,
    autoRefreshInterval: 30000
  });

  // Local State
  const [state, setState] = useState<SavedSearchesState>({
    currentUserId: userId,
    selectedSearches: [],
    searchFilter: '',
    selectedCategory: 'ALL',
    selectedFolder: 'ALL',
    sortBy: 'DATE_MODIFIED',
    sortOrder: 'DESC',
    viewMode: 'GRID',
    showSharedOnly: false,
    showFavoritesOnly: false,
    showRecentOnly: false,
    activeTab: 'searches',
    isAdvancedView: false,
    autoSync: true,
    showPreview: true,
    enableNotifications: true
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState<SavedSearch | null>(null);
  const [searchToDelete, setSearchToDelete] = useState<SavedSearch | null>(null);

  // Mock data (in production, this would come from the hooks)
  const [mockSearches] = useState(() => generateMockSavedSearches());
  const [mockFolders] = useState(() => generateMockFolders());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredSearches = useMemo(() => {
    return mockSearches.filter(search => {
      // Text filter
      if (state.searchFilter && !search.name.toLowerCase().includes(state.searchFilter.toLowerCase()) &&
          !search.description.toLowerCase().includes(state.searchFilter.toLowerCase()) &&
          !search.tags.some(tag => tag.toLowerCase().includes(state.searchFilter.toLowerCase()))) {
        return false;
      }

      // Category filter
      if (state.selectedCategory !== 'ALL' && search.category !== state.selectedCategory) {
        return false;
      }

      // Folder filter
      if (state.selectedFolder !== 'ALL' && search.folder !== state.selectedFolder) {
        return false;
      }

      // Show shared only
      if (state.showSharedOnly && !search.isShared) {
        return false;
      }

      // Show favorites only
      if (state.showFavoritesOnly && !search.isFavorite) {
        return false;
      }

      // Show recent only (last 7 days)
      if (state.showRecentOnly) {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (search.lastExecuted < weekAgo) {
          return false;
        }
      }

      return true;
    });
  }, [mockSearches, state]);

  const sortedSearches = useMemo(() => {
    return [...filteredSearches].sort((a, b) => {
      const direction = state.sortOrder === 'ASC' ? 1 : -1;
      
      switch (state.sortBy) {
        case 'NAME':
          return direction * a.name.localeCompare(b.name);
        case 'DATE_CREATED':
          return direction * (a.createdAt.getTime() - b.createdAt.getTime());
        case 'DATE_MODIFIED':
          return direction * (a.lastModified.getTime() - b.lastModified.getTime());
        case 'USAGE_COUNT':
          return direction * (a.executionCount - b.executionCount);
        case 'RATING':
          return direction * (a.rating - b.rating);
        default:
          return 0;
      }
    });
  }, [filteredSearches, state.sortBy, state.sortOrder]);

  const searchAnalytics = useMemo(() => {
    const totalSearches = mockSearches.length;
    const activeSearches = mockSearches.filter(s => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return s.lastExecuted > weekAgo;
    }).length;
    const sharedSearches = mockSearches.filter(s => s.isShared).length;
    const favoriteSearches = mockSearches.filter(s => s.isFavorite).length;

    return {
      totalSearches,
      activeSearches,
      sharedSearches,
      favoriteSearches,
      executionTrends: [],
      popularCategories: Object.entries(
        mockSearches.reduce((acc, search) => {
          acc[search.category] = (acc[search.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalSearches) * 100,
        growth: Math.random() * 20 - 10
      })),
      topPerformers: mockSearches
        .sort((a, b) => b.executionCount - a.executionCount)
        .slice(0, 5),
      userEngagement: {
        totalUsers: 150,
        activeUsers: 85,
        avgSearchesPerUser: 8.5,
        retentionRate: 78,
        satisfactionScore: 4.2
      }
    };
  }, [mockSearches]);

  const unreadNotifications = useMemo(() => {
    return mockSearches.reduce((count, search) => {
      return count + search.notifications.filter(n => !n.isRead).length;
    }, 0);
  }, [mockSearches]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearchExecute = useCallback((search: SavedSearch) => {
    onSearchExecute?.(search);
    
    // Update last executed time and increment count
    console.log('Executing search:', search.name);
  }, [onSearchExecute]);

  const handleSearchSave = useCallback((search: Partial<SavedSearch>) => {
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name: search.name || '',
      description: search.description || '',
      query: search.query || '',
      filters: search.filters || [],
      owner: state.currentUserId,
      folder: search.folder || 'Personal',
      category: search.category || 'General',
      tags: search.tags || [],
      isPublic: search.isPublic || false,
      isFavorite: false,
      isShared: false,
      sharedWith: [],
      createdAt: new Date(),
      lastModified: new Date(),
      lastExecuted: new Date(),
      executionCount: 0,
      averageExecutionTime: 0,
      resultCount: 0,
      rating: 0,
      ratingCount: 0,
      comments: [],
      metadata: {
        complexity: 'SIMPLE',
        performance: {
          avgExecutionTime: 0,
          successRate: 100,
          errorRate: 0,
          optimizationSuggestions: []
        },
        usage: {
          totalExecutions: 0,
          uniqueUsers: 1,
          peakUsageTimes: [],
          popularFilters: [],
          trendDirection: 'STABLE'
        },
        quality: {
          relevanceScore: 85,
          userSatisfaction: 85,
          resultUtility: 85,
          feedbackScore: 4
        }
      },
      notifications: []
    };
    
    onSearchSave?.(newSearch);
    setIsCreateDialogOpen(false);
  }, [state.currentUserId, onSearchSave]);

  const handleToggleFavorite = useCallback((searchId: string) => {
    console.log('Toggling favorite for search:', searchId);
  }, []);

  const handleShareSearch = useCallback((search: SavedSearch, shareOptions: ShareOptions) => {
    onSearchShare?.(search.id, shareOptions);
    setIsShareDialogOpen(false);
    setSelectedSearch(null);
  }, [onSearchShare]);

  const handleDeleteSearch = useCallback((search: SavedSearch) => {
    console.log('Deleting search:', search.name);
    setIsDeleteDialogOpen(false);
    setSearchToDelete(null);
  }, []);

  const handleDuplicateSearch = useCallback((search: SavedSearch) => {
    const duplicatedSearch = {
      ...search,
      name: `${search.name} (Copy)`,
      id: `search_${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date(),
      executionCount: 0
    };
    
    onSearchSave?.(duplicatedSearch);
  }, [onSearchSave]);

  const handleBulkAction = useCallback((action: string) => {
    console.log(`Performing bulk action ${action} on:`, state.selectedSearches);
  }, [state.selectedSearches]);

  const handleStateChange = useCallback((updates: Partial<SavedSearchesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSearchCard = (search: SavedSearch) => (
    <Card key={search.id} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={state.selectedSearches.includes(search.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setState(prev => ({ ...prev, selectedSearches: [...prev.selectedSearches, search.id] }));
                } else {
                  setState(prev => ({ ...prev, selectedSearches: prev.selectedSearches.filter(id => id !== search.id) }));
                }
              }}
            />
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{search.name}</span>
                {search.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                {search.isShared && <Share className="h-4 w-4 text-blue-500" />}
                {search.isPublic && <Globe className="h-4 w-4 text-green-500" />}
              </CardTitle>
              <CardDescription className="mt-1">{search.description}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSearchExecute(search)}>
                <Play className="h-4 w-4 mr-2" />
                Execute
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleFavorite(search.id)}>
                <Star className="h-4 w-4 mr-2" />
                {search.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedSearch(search); setIsShareDialogOpen(true); }}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicateSearch(search)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => { setSearchToDelete(search); setIsDeleteDialogOpen(true); }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">{search.category}</Badge>
            <Badge variant="secondary" className="text-xs">{search.folder}</Badge>
            <Badge variant="outline" className="text-xs">{search.metadata.complexity}</Badge>
            {search.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Executions</p>
              <p className="font-semibold">{search.executionCount}</p>
            </div>
            <div>
              <p className="text-gray-600">Rating</p>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-semibold">{search.rating.toFixed(1)}</span>
                <span className="text-gray-500">({search.ratingCount})</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Last Executed</p>
              <p className="font-semibold">{search.lastExecuted.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Results</p>
              <p className="font-semibold">{search.resultCount.toLocaleString()}</p>
            </div>
          </div>

          {search.metadata.performance.avgExecutionTime > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Performance</span>
                <span>{search.metadata.performance.avgExecutionTime.toFixed(2)}s</span>
              </div>
              <Progress value={Math.max(0, 100 - (search.metadata.performance.avgExecutionTime * 20))} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span>{search.owner}</span>
              <Clock className="h-3 w-3 ml-2" />
              <span>{search.lastModified.toLocaleDateString()}</span>
            </div>
            <Button size="sm" onClick={() => handleSearchExecute(search)}>
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSearchList = () => (
    <div className="space-y-4">
      {sortedSearches.map((search) => (
        <Card key={search.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Checkbox
                  checked={state.selectedSearches.includes(search.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setState(prev => ({ ...prev, selectedSearches: [...prev.selectedSearches, search.id] }));
                    } else {
                      setState(prev => ({ ...prev, selectedSearches: prev.selectedSearches.filter(id => id !== search.id) }));
                    }
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{search.name}</h3>
                    {search.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    {search.isShared && <Share className="h-4 w-4 text-blue-500" />}
                    {search.isPublic && <Globe className="h-4 w-4 text-green-500" />}
                  </div>
                  <p className="text-sm text-gray-600">{search.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{search.category}</span>
                    <span>{search.folder}</span>
                    <span>{search.executionCount} executions</span>
                    <span>★ {search.rating.toFixed(1)}</span>
                    <span>{search.lastExecuted.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleSearchExecute(search)}>
                  <Play className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSearchExecute(search)}>
                      <Play className="h-4 w-4 mr-2" />
                      Execute
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFavorite(search.id)}>
                      <Star className="h-4 w-4 mr-2" />
                      {search.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelectedSearch(search); setIsShareDialogOpen(true); }}>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateSearch(search)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => { setSearchToDelete(search); setIsDeleteDialogOpen(true); }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSearchTable = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={state.selectedSearches.length === sortedSearches.length && sortedSearches.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setState(prev => ({ ...prev, selectedSearches: sortedSearches.map(s => s.id) }));
                    } else {
                      setState(prev => ({ ...prev, selectedSearches: [] }));
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Executions</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Last Executed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSearches.map((search) => (
              <TableRow key={search.id}>
                <TableCell>
                  <Checkbox
                    checked={state.selectedSearches.includes(search.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setState(prev => ({ ...prev, selectedSearches: [...prev.selectedSearches, search.id] }));
                      } else {
                        setState(prev => ({ ...prev, selectedSearches: prev.selectedSearches.filter(id => id !== search.id) }));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{search.name}</span>
                    {search.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    {search.isShared && <Share className="h-4 w-4 text-blue-500" />}
                    {search.isPublic && <Globe className="h-4 w-4 text-green-500" />}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{search.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{search.folder}</Badge>
                </TableCell>
                <TableCell>{search.executionCount}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{search.rating.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell>{search.lastExecuted.toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleSearchExecute(search)}>
                      <Play className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleSearchExecute(search)}>
                          <Play className="h-4 w-4 mr-2" />
                          Execute
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFavorite(search.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {search.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedSearch(search); setIsShareDialogOpen(true); }}>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateSearch(search)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => { setSearchToDelete(search); setIsDeleteDialogOpen(true); }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderFoldersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Search Folders</h3>
        <Button onClick={() => setIsFolderDialogOpen(true)}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Create Folder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockFolders.map((folder) => (
          <Card key={folder.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
                  >
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{folder.name}</CardTitle>
                    <CardDescription>{folder.description}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Searches</p>
                    <p className="font-semibold">{folder.searchCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Badge variant={folder.isShared ? 'default' : 'secondary'} className="text-xs">
                      {folder.isShared ? 'Shared' : 'Private'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {folder.createdAt.toLocaleDateString()}</span>
                  <span>Modified: {folder.lastModified.toLocaleDateString()}</span>
                </div>

                <Button size="sm" className="w-full">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Folder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchAnalytics.totalSearches}</div>
            <p className="text-xs text-muted-foreground">All saved searches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Searches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchAnalytics.activeSearches}</div>
            <p className="text-xs text-muted-foreground">Used in last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Searches</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchAnalytics.sharedSearches}</div>
            <p className="text-xs text-muted-foreground">Shared with others</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchAnalytics.favoriteSearches}</div>
            <p className="text-xs text-muted-foreground">Marked as favorites</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={searchAnalytics.popularCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {searchAnalytics.popularCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Search Name</TableHead>
                <TableHead>Executions</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchAnalytics.topPerformers.map((search) => (
                <TableRow key={search.id}>
                  <TableCell className="font-medium">{search.name}</TableCell>
                  <TableCell>{search.executionCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{search.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Progress value={Math.max(0, 100 - (search.metadata.performance.avgExecutionTime * 20))} className="w-16" />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{search.category}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Bookmark className="h-8 w-8" />
              <span>Saved Searches</span>
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Manage and organize your saved search queries and filters</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Filters and Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    value={state.searchFilter}
                    onChange={(e) => handleStateChange({ searchFilter: e.target.value })}
                    placeholder="Search saved searches..."
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={state.selectedCategory} onValueChange={(value) => handleStateChange({ selectedCategory: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Reports">Reports</SelectItem>
                    <SelectItem value="Data Quality">Data Quality</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Business Intelligence">Business Intelligence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Folder</Label>
                <Select value={state.selectedFolder} onValueChange={(value) => handleStateChange({ selectedFolder: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Folders</SelectItem>
                    {mockFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.name}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sort By</Label>
                <Select value={state.sortBy} onValueChange={(value: any) => handleStateChange({ sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAME">Name</SelectItem>
                    <SelectItem value="DATE_CREATED">Date Created</SelectItem>
                    <SelectItem value="DATE_MODIFIED">Date Modified</SelectItem>
                    <SelectItem value="USAGE_COUNT">Usage Count</SelectItem>
                    <SelectItem value="RATING">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>View Mode</Label>
                <Select value={state.viewMode} onValueChange={(value: any) => handleStateChange({ viewMode: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRID">Grid</SelectItem>
                    <SelectItem value="LIST">List</SelectItem>
                    <SelectItem value="TABLE">Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Filters</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="shared-only"
                    checked={state.showSharedOnly}
                    onCheckedChange={(checked) => handleStateChange({ showSharedOnly: checked })}
                  />
                  <Label htmlFor="shared-only" className="text-sm">Shared</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="favorites-only"
                    checked={state.showFavoritesOnly}
                    onCheckedChange={(checked) => handleStateChange({ showFavoritesOnly: checked })}
                  />
                  <Label htmlFor="favorites-only" className="text-sm">Favorites</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {state.selectedSearches.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {state.selectedSearches.length} search(es) selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('share')}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('move')}>
                    <Folder className="h-4 w-4 mr-2" />
                    Move
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="searches">
              Searches ({filteredSearches.length})
            </TabsTrigger>
            <TabsTrigger value="folders">
              Folders ({mockFolders.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="searches" className="space-y-6">
            {state.viewMode === 'GRID' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedSearches.map(renderSearchCard)}
              </div>
            )}
            {state.viewMode === 'LIST' && renderSearchList()}
            {state.viewMode === 'TABLE' && renderSearchTable()}
          </TabsContent>

          <TabsContent value="folders">
            {renderFoldersTab()}
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalyticsTab()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-sync"
                    checked={state.autoSync}
                    onCheckedChange={(checked) => handleStateChange({ autoSync: checked })}
                  />
                  <Label htmlFor="auto-sync">Auto-sync saved searches</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-preview"
                    checked={state.showPreview}
                    onCheckedChange={(checked) => handleStateChange({ showPreview: checked })}
                  />
                  <Label htmlFor="show-preview">Show search preview</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-notifications"
                    checked={state.enableNotifications}
                    onCheckedChange={(checked) => handleStateChange({ enableNotifications: checked })}
                  />
                  <Label htmlFor="enable-notifications">Enable notifications</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Search Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save New Search</DialogTitle>
              <DialogDescription>
                Save your current search query and filters for future use
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input placeholder="Enter search name" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe this search" />
              </div>
              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Reports">Reports</SelectItem>
                    <SelectItem value="Data Quality">Data Quality</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Folder</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.name}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="public-search" />
                <Label htmlFor="public-search">Make this search public</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSearchSave({})}>
                Save Search
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Search</DialogTitle>
              <DialogDescription>
                Share "{selectedSearch?.name}" with users or groups
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Users</Label>
                <Input placeholder="Enter user emails" />
              </div>
              <div>
                <Label>Permissions</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEW">View Only</SelectItem>
                    <SelectItem value="EDIT">Edit</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Message (Optional)</Label>
                <Textarea placeholder="Add a message for recipients" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="allow-comments" />
                <Label htmlFor="allow-comments">Allow comments</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => selectedSearch && handleShareSearch(selectedSearch, {
                users: [],
                groups: [],
                permissions: 'VIEW',
                allowComments: true,
                allowRating: true
              })}>
                Share
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Search</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{searchToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => searchToDelete && handleDeleteSearch(searchToDelete)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default SavedSearches;