'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import { BookOpen, FileText, Search, Tag, Users, Star, Eye, Edit, Share2, Plus, MoreHorizontal, RefreshCw, Settings, Filter, Clock, User, Bookmark, Heart, MessageSquare, ThumbsUp, ThumbsDown, Flag, Download, Upload, Link, ExternalLink, Copy, Archive, Trash2, ChevronRight, ChevronDown, Folder, File, Image, Video, Code, Database, Table, BarChart3, PieChart, TrendingUp, Target, Lightbulb, Brain, Zap, Award, Trophy, CheckCircle, XCircle, AlertTriangle, Info, HelpCircle, Globe, Lock, Unlock, Crown } from 'lucide-react';

import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

import { format, subDays, parseISO, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Import backend services
import { collaborationService } from '../../services';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';

// Import types
import { CollaborationTeam, TeamMember } from '../../types/collaboration.types';

// ============================================================================
// KNOWLEDGE BASE TYPES
// ============================================================================

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  type: 'documentation' | 'tutorial' | 'best_practice' | 'faq' | 'troubleshooting' | 'reference';
  category: string;
  subcategory?: string;
  tags: string[];
  author_id: string;
  author_name: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  visibility: 'public' | 'team' | 'private';
  version: number;
  language: string;
  reading_time: number; // minutes
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
  updated_at: string;
  published_at?: string;
  views: number;
  likes: number;
  bookmarks: number;
  comments_count: number;
  rating: number;
  review_count: number;
  attachments: KnowledgeAttachment[];
  related_articles: string[];
  prerequisites: string[];
  external_links: ExternalLink[];
  metadata: ArticleMetadata;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
}

interface KnowledgeAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'code' | 'dataset' | 'diagram';
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
  description?: string;
  thumbnail_url?: string;
}

interface ExternalLink {
  title: string;
  url: string;
  description?: string;
  type: 'reference' | 'tool' | 'documentation' | 'tutorial';
}

interface ArticleMetadata {
  keywords: string[];
  last_reviewer?: string;
  review_date?: string;
  quality_score: number;
  completeness_score: number;
  accuracy_verified: boolean;
  expert_reviewed: boolean;
  usage_statistics: UsageStats;
}

interface UsageStats {
  daily_views: { date: string; views: number }[];
  top_referrers: string[];
  search_terms: string[];
  user_ratings: { rating: number; count: number }[];
  feedback_summary: FeedbackSummary;
}

interface FeedbackSummary {
  helpful_count: number;
  not_helpful_count: number;
  common_suggestions: string[];
  improvement_areas: string[];
}

interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  parent_id?: string;
  icon: string;
  color: string;
  order: number;
  article_count: number;
  subcategories: KnowledgeCategory[];
  permissions: CategoryPermission[];
  moderators: string[];
}

interface CategoryPermission {
  user_id?: string;
  role?: string;
  team_id?: string;
  permissions: string[];
}

interface KnowledgeComment {
  id: string;
  article_id: string;
  author_id: string;
  author_name: string;
  content: string;
  type: 'comment' | 'suggestion' | 'correction' | 'question';
  status: 'active' | 'resolved' | 'hidden';
  created_at: string;
  updated_at: string;
  likes: number;
  replies: KnowledgeComment[];
  parent_id?: string;
  mentioned_users: string[];
  attachments: string[];
}

interface KnowledgeSearch {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  total_results: number;
  search_time: number;
  suggestions: string[];
  facets: SearchFacet[];
}

interface SearchFilters {
  types: string[];
  categories: string[];
  tags: string[];
  authors: string[];
  date_range: { start: string; end: string };
  difficulty_levels: string[];
  languages: string[];
  status: string[];
}

interface SearchResult {
  article: KnowledgeArticle;
  relevance_score: number;
  highlighted_content: string;
  matching_sections: string[];
  similarity_articles: string[];
}

interface SearchFacet {
  field: string;
  values: { value: string; count: number }[];
}

interface KnowledgeTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  content_template: string;
  required_sections: TemplateSection[];
  optional_sections: TemplateSection[];
  metadata_fields: TemplateField[];
  usage_count: number;
  created_by: string;
  created_at: string;
  is_public: boolean;
}

interface TemplateSection {
  name: string;
  description: string;
  placeholder: string;
  required: boolean;
  order: number;
}

interface TemplateField {
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'date';
  options?: string[];
  required: boolean;
  default_value?: any;
}

interface KnowledgeReview {
  id: string;
  article_id: string;
  reviewer_id: string;
  reviewer_name: string;
  review_type: 'technical' | 'editorial' | 'expert' | 'peer';
  status: 'in_progress' | 'completed' | 'rejected';
  rating: number;
  feedback: string;
  suggestions: ReviewSuggestion[];
  checklist_items: ChecklistItem[];
  created_at: string;
  completed_at?: string;
}

interface ReviewSuggestion {
  section: string;
  type: 'addition' | 'modification' | 'deletion' | 'clarification';
  current_text?: string;
  suggested_text: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

interface ChecklistItem {
  item: string;
  completed: boolean;
  notes?: string;
}

interface KnowledgeAnalytics {
  overview: AnalyticsOverview;
  content: ContentAnalytics;
  usage: UsageAnalytics;
  quality: QualityAnalytics;
  collaboration: CollaborationAnalytics;
  trends: TrendAnalytics;
}

interface AnalyticsOverview {
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  total_views: number;
  unique_visitors: number;
  average_rating: number;
  total_comments: number;
  active_contributors: number;
}

interface ContentAnalytics {
  articles_by_type: { type: string; count: number }[];
  articles_by_category: { category: string; count: number }[];
  content_quality_distribution: { quality: string; count: number }[];
  language_distribution: { language: string; count: number }[];
  difficulty_distribution: { level: string; count: number }[];
}

interface UsageAnalytics {
  page_views: { date: string; views: number }[];
  popular_articles: { title: string; views: number; rating: number }[];
  search_trends: { query: string; frequency: number }[];
  user_engagement: { metric: string; value: number }[];
  referral_sources: { source: string; visits: number }[];
}

interface QualityAnalytics {
  average_quality_score: number;
  quality_trends: { date: string; score: number }[];
  review_completion_rate: number;
  accuracy_metrics: { metric: string; score: number }[];
  content_freshness: { category: string; avg_age_days: number }[];
}

interface CollaborationAnalytics {
  contributor_activity: { user: string; contributions: number; quality: number }[];
  review_metrics: { reviewer: string; reviews: number; avg_rating: number }[];
  collaboration_patterns: { pattern: string; frequency: number }[];
  knowledge_sharing_score: number;
}

interface TrendAnalytics {
  emerging_topics: { topic: string; growth_rate: number }[];
  declining_topics: { topic: string; decline_rate: number }[];
  seasonal_patterns: { period: string; activity: number }[];
  prediction_insights: PredictionInsight[];
}

interface PredictionInsight {
  type: 'content_gap' | 'popular_topic' | 'quality_issue' | 'collaboration_opportunity';
  description: string;
  confidence: number;
  suggested_actions: string[];
}

interface KnowledgeBaseProps {
  className?: string;
  teamId?: string;
  userId?: string;
  mode?: 'reader' | 'contributor' | 'admin';
  onArticleCreated?: (article: KnowledgeArticle) => void;
  onArticleUpdated?: (article: KnowledgeArticle) => void;
}

// Color schemes and constants
const ARTICLE_TYPE_COLORS = {
  documentation: '#3b82f6',
  tutorial: '#10b981',
  best_practice: '#f59e0b',
  faq: '#8b5cf6',
  troubleshooting: '#ef4444',
  reference: '#06b6d4'
};

const STATUS_COLORS = {
  draft: '#6b7280',
  published: '#10b981',
  archived: '#64748b',
  under_review: '#f59e0b'
};

const DIFFICULTY_COLORS = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#f97316',
  expert: '#ef4444'
};

export default function KnowledgeBase({ 
  className, 
  teamId, 
  userId, 
  mode = 'reader',
  onArticleCreated,
  onArticleUpdated
}: KnowledgeBaseProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [templates, setTemplates] = useState<KnowledgeTemplate[]>([]);
  const [analytics, setAnalytics] = useState<KnowledgeAnalytics | null>(null);
  const [searchResults, setSearchResults] = useState<KnowledgeSearch | null>(null);
  
  // UI States
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('published');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'views' | 'rating'>('updated_at');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  
  // Form States
  const [newArticle, setNewArticle] = useState<Partial<KnowledgeArticle>>({
    type: 'documentation',
    visibility: 'team',
    difficulty_level: 'intermediate',
    language: 'en',
    status: 'draft',
    tags: []
  });
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    types: [],
    categories: [],
    tags: [],
    authors: [],
    date_range: { start: '', end: '' },
    difficulty_levels: [],
    languages: [],
    status: ['published']
  });
  
  // Real-time States
  const [liveUpdates, setLiveUpdates] = useState<Map<string, boolean>>(new Map());
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadKnowledgeBaseData();
    setupRealTimeUpdates();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [teamId, userId]);

  const loadKnowledgeBaseData = async () => {
    setLoading(true);
    try {
      // Load knowledge articles from backend
      const articlesResponse = await collaborationService.getKnowledgeArticles({
        teamId: teamId,
        includeMetadata: true,
        includeAttachments: true,
        includeComments: false,
        status: ['published', 'draft'],
        limit: 100
      });
      const articlesData = articlesResponse.data || [];
      
      // Load knowledge categories from backend
      const categoriesResponse = await collaborationService.getKnowledgeCategories({
        teamId: teamId,
        includeSubcategories: true,
        includeArticleCounts: true
      });
      const categoriesData = categoriesResponse.data || [];
      
      // Load knowledge templates from backend
      const templatesResponse = await collaborationService.getKnowledgeTemplates({
        teamId: teamId,
        includePublic: true,
        limit: 50
      });
      const templatesData = templatesResponse.data || [];
      
      // Load knowledge base analytics from backend
      const analyticsResponse = await collaborationService.getKnowledgeAnalytics({
        teamId: teamId,
        timeRange: { from: subDays(new Date(), 30), to: new Date() },
        includeDetailedMetrics: true
      });
      const analyticsData = analyticsResponse.data;
      
      setArticles(articlesData);
      setCategories(categoriesData);
      setTemplates(templatesData);
      setAnalytics(analyticsData);
      
    } catch (err) {
      setError('Failed to load knowledge base data from backend');
      console.error('Error loading knowledge base data:', err);
      
      // Fallback to empty states
      setArticles([]);
      setCategories([]);
      setTemplates([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadKnowledgeBaseData();
    }, 30000);
    
    // WebSocket connection for real-time updates
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/knowledge-base/${teamId || 'global'}`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };
      
      ws.current.onopen = () => {
        console.log('Knowledge Base WebSocket connected');
        ws.current?.send(JSON.stringify({
          type: 'join_room',
          teamId: teamId,
          userId: userId
        }));
      };
      
      ws.current.onerror = (error) => {
        console.error('Knowledge Base WebSocket error:', error);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'article_created':
        setArticles(prev => [data.article, ...prev]);
        setLiveUpdates(prev => new Map(prev.set(data.article.id, true)));
        break;
      case 'article_updated':
        setArticles(prev => prev.map(article => 
          article.id === data.article.id ? { ...article, ...data.article } : article
        ));
        break;
      case 'article_viewed':
        setArticles(prev => prev.map(article => 
          article.id === data.articleId 
            ? { ...article, views: article.views + 1 }
            : article
        ));
        break;
      case 'comment_added':
        setArticles(prev => prev.map(article => 
          article.id === data.articleId 
            ? { ...article, comments_count: article.comments_count + 1 }
            : article
        ));
        break;
    }
  };

  // Article Management Functions
  const createArticle = async (articleData: Partial<KnowledgeArticle>) => {
    try {
      setIsCreatingArticle(true);
      
      const createRequest = {
        title: articleData.title || '',
        content: articleData.content || '',
        summary: articleData.summary || '',
        type: articleData.type || 'documentation',
        category: articleData.category || '',
        subcategory: articleData.subcategory,
        tags: articleData.tags || [],
        visibility: articleData.visibility || 'team',
        difficultyLevel: articleData.difficulty_level || 'intermediate',
        language: articleData.language || 'en',
        status: articleData.status || 'draft',
        authorId: userId || '',
        teamId: teamId,
        metadata: {
          keywords: articleData.tags || [],
          quality_score: 0.5,
          completeness_score: 0.5,
          accuracy_verified: false,
          expert_reviewed: false,
          usage_statistics: {
            daily_views: [],
            top_referrers: [],
            search_terms: [],
            user_ratings: [],
            feedback_summary: {
              helpful_count: 0,
              not_helpful_count: 0,
              common_suggestions: [],
              improvement_areas: []
            }
          }
        }
      };
      
      const response = await collaborationService.createKnowledgeArticle(createRequest);
      const newArticle = response.data;
      
      setArticles(prev => [newArticle, ...prev]);
      setShowCreateDialog(false);
      setNewArticle({
        type: 'documentation',
        visibility: 'team',
        difficulty_level: 'intermediate',
        language: 'en',
        status: 'draft',
        tags: []
      });
      
      onArticleCreated?.(newArticle);
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'article_created',
        article: newArticle
      }));
      
    } catch (err) {
      setError('Failed to create article via backend');
      console.error('Article creation error:', err);
    } finally {
      setIsCreatingArticle(false);
    }
  };

  const updateArticle = async (articleId: string, updates: Partial<KnowledgeArticle>) => {
    try {
      const updateRequest = {
        articleId,
        updates: {
          title: updates.title,
          content: updates.content,
          summary: updates.summary,
          type: updates.type,
          category: updates.category,
          tags: updates.tags,
          status: updates.status,
          visibility: updates.visibility,
          difficultyLevel: updates.difficulty_level
        }
      };
      
      const response = await collaborationService.updateKnowledgeArticle(updateRequest);
      const updatedArticle = response.data;
      
      setArticles(prev => prev.map(article => 
        article.id === articleId ? updatedArticle : article
      ));
      
      onArticleUpdated?.(updatedArticle);
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'article_updated',
        article: updatedArticle
      }));
      
    } catch (err) {
      setError('Failed to update article via backend');
      console.error('Article update error:', err);
    }
  };

  // Search Functions
  const searchKnowledge = async (query: string, filters: SearchFilters) => {
    try {
      const searchRequest = {
        query,
        filters: {
          types: filters.types,
          categories: filters.categories,
          tags: filters.tags,
          authors: filters.authors,
          dateRange: filters.date_range,
          difficultyLevels: filters.difficulty_levels,
          languages: filters.languages,
          status: filters.status
        },
        teamId: teamId,
        userId: userId,
        includeHighlighting: true,
        includeSimilar: true,
        limit: 50
      };
      
      const response = await intelligentDiscoveryService.searchKnowledgeBase(searchRequest);
      const searchData = response.data;
      
      setSearchResults(searchData);
      
    } catch (err) {
      setError('Failed to search knowledge base via backend');
      console.error('Knowledge search error:', err);
    }
  };

  const trackArticleView = async (articleId: string) => {
    try {
      await collaborationService.trackKnowledgeArticleView({
        articleId,
        userId: userId || '',
        viewedAt: new Date().toISOString()
      });
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'article_viewed',
        articleId
      }));
      
    } catch (err) {
      console.warn('Failed to track article view:', err);
    }
  };

  // Utility Functions
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesType = filterType === 'all' || article.type === filterType;
      const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
      const matchesSearch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesType && matchesCategory && matchesStatus && matchesSearch;
    }).sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      
      return aValue > bValue ? -1 : 1;
    });
  }, [articles, filterType, filterCategory, filterStatus, searchTerm, sortBy]);

  const getTypeColor = (type: string) => {
    return ARTICLE_TYPE_COLORS[type as keyof typeof ARTICLE_TYPE_COLORS] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280';
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || '#6b7280';
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'under_review':
        return 'outline';
      case 'archived':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Render Functions
  const renderArticleCard = (article: KnowledgeArticle) => (
    <Card key={article.id} className={cn(
      "transition-all duration-200 hover:shadow-lg cursor-pointer",
      liveUpdates.get(article.id) && "ring-2 ring-green-500 animate-pulse"
    )} onClick={() => {
      setSelectedArticle(article);
      trackArticleView(article.id);
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: getTypeColor(article.type),
                  color: getTypeColor(article.type)
                }}
              >
                {article.type.replace('_', ' ')}
              </Badge>
              <Badge variant={getStatusBadgeVariant(article.status)}>
                {article.status.replace('_', ' ')}
              </Badge>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: getDifficultyColor(article.difficulty_level),
                  color: getDifficultyColor(article.difficulty_level)
                }}
                className="text-xs"
              >
                {article.difficulty_level}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-1 line-clamp-2">{article.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {article.summary}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Article
              </DropdownMenuItem>
              {mode !== 'reader' && (
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Article
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{article.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{article.views}</div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {article.rating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {article.reading_time}m
              </div>
              <div className="text-xs text-muted-foreground">Read Time</div>
            </div>
          </div>
          
          {/* Author and Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              <span>{article.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Updated {formatTimeAgo(article.updated_at)}</span>
            </div>
          </div>
          
          {/* Engagement */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{article.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>{article.comments_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="w-4 h-4 text-green-500" />
              <span>{article.bookmarks}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBrowseTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
              <SelectItem value="best_practice">Best Practice</SelectItem>
              <SelectItem value="faq">FAQ</SelectItem>
              <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
              <SelectItem value="reference">Reference</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadKnowledgeBaseData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          {mode !== 'reader' && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                ? 'No articles match your current filters' 
                : 'Start building your knowledge base by creating your first article'}
            </p>
            {mode !== 'reader' && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            )}
          </div>
        ) : (
          filteredArticles.map(renderArticleCard)
        )}
      </div>
    </div>
  );

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("h-full flex flex-col space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-500" />
              Knowledge Base
            </h1>
            <p className="text-muted-foreground">
              Centralized knowledge management with documentation, search, and collaborative editing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {articles.filter(a => a.status === 'published').length} published
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Edit className="w-3 h-3" />
              {articles.filter(a => a.status === 'draft').length} drafts
            </Badge>
            <Button variant="outline" onClick={loadKnowledgeBaseData} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            {renderBrowseTab()}
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
              <p className="text-muted-foreground">Advanced search features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Article Templates</h3>
              <p className="text-muted-foreground">Template management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Knowledge Analytics</h3>
              <p className="text-muted-foreground">Analytics and insights features coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Article Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Article</DialogTitle>
              <DialogDescription>
                Add a new article to the knowledge base
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newArticle.title || ''}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter article title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={newArticle.type || ''} 
                    onValueChange={(value) => setNewArticle(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="best_practice">Best Practice</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  value={newArticle.summary || ''}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the article..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newArticle.content || ''}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Article content..."
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newArticle.category || ''} 
                    onValueChange={(value) => setNewArticle(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select 
                    value={newArticle.difficulty_level || ''} 
                    onValueChange={(value) => setNewArticle(prev => ({ ...prev, difficulty_level: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={newArticle.tags?.join(', ') || ''}
                  onChange={(e) => setNewArticle(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createArticle(newArticle)} 
                disabled={isCreatingArticle || !newArticle.title || !newArticle.content}
              >
                {isCreatingArticle ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}