"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
  Tabs, TabsContent, TabsList, TabsTrigger, Badge, Avatar, AvatarFallback, AvatarImage, ScrollArea, Separator,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
  Switch, Slider, Progress, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Popover, PopoverContent, PopoverTrigger, Alert, AlertDescription, AlertTitle,
  ResizablePanelGroup, ResizablePanel, ResizableHandle
} from '@/components/ui';
import { BookOpen, Library, Search, Filter, Plus, Star, ThumbsUp, ThumbsDown, Share, Download, Upload, Eye, Edit, Trash2, Users, User, MessageCircle, Calendar, Clock, Tag, Tags, Bookmark, BookmarkPlus, Heart, Flag, Copy, ExternalLink, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, Settings, Bell, BellOff, TrendingUp, BarChart3, PieChart, LineChart, Activity, Target, Award, Trophy, Medal, Crown, Zap, Brain, Lightbulb, Compass, Map, Route, Navigation, Microscope, FlaskConical, Beaker, Atom, Dna, Cpu, Database, Server, Cloud, Globe, Building, Factory, Briefcase, GraduationCap, BookMarked, FileText, Folder, FolderOpen, Image, Video, Music, FileImage, FileVideo, FilePlus, FileCheck, FileX, Link, Unlink, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, List, ListOrdered, Quote, Code, Type, Palette, Layers, Grid, Layout, MousePointer, Hand, Grab, Move, CornerDownRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Check, CheckCircle, AlertTriangle, Info, HelpCircle, RefreshCw, Loader2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib copie/utils';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { usePipelineManager } from '../../hooks/usePipelineManager';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Knowledge Platform Types
interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  type: 'article' | 'tutorial' | 'guide' | 'reference' | 'best_practice' | 'case_study';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedReadTime: number;
  language: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  visibility: 'public' | 'team' | 'organization' | 'private';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  shareCount: number;
  rating: KnowledgeRating;
  metadata: KnowledgeMetadata;
  attachments: KnowledgeAttachment[];
  relatedArticles: string[];
  prerequisites: string[];
  learningObjectives: string[];
  isBookmarked: boolean;
  isLiked: boolean;
  isFeatured: boolean;
  isVerified: boolean;
}

interface KnowledgeRating {
  overall: number;
  accuracy: number;
  clarity: number;
  usefulness: number;
  completeness: number;
  totalRatings: number;
}

interface KnowledgeMetadata {
  wordCount: number;
  lastModifiedBy: string;
  version: number;
  reviewStatus: string;
  seoScore: number;
  readabilityScore: number;
}

interface KnowledgeAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'code' | 'dataset';
  url: string;
  size: number;
  mimeType: string;
  description?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  estimatedDuration: number;
  moduleCount: number;
  enrollmentCount: number;
  completionRate: number;
  rating: number;
  totalRatings: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  modules: LearningModule[];
  prerequisites: string[];
  learningObjectives: string[];
  certificationOffered: boolean;
  price?: number;
  currency?: string;
  isEnrolled: boolean;
  progress: number;
}

interface LearningModule {
  id: string;
  pathId: string;
  title: string;
  description: string;
  order: number;
  type: 'reading' | 'video' | 'interactive' | 'quiz' | 'assignment' | 'project';
  content: LearningContent[];
  estimatedDuration: number;
  isCompleted: boolean;
  completedAt?: Date;
  score?: number;
  maxScore?: number;
}

interface LearningContent {
  id: string;
  moduleId: string;
  type: 'text' | 'video' | 'audio' | 'image' | 'code' | 'quiz' | 'interactive';
  title: string;
  content: string;
  url?: string;
  order: number;
  isCompleted: boolean;
  timeSpent: number;
}

interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  children: KnowledgeCategory[];
  articleCount: number;
  pathCount: number;
  isActive: boolean;
}

interface UserProgress {
  userId: string;
  totalArticlesRead: number;
  totalPathsCompleted: number;
  totalTimeSpent: number;
  skillsAcquired: string[];
  certificationsEarned: string[];
  currentLevel: number;
  experiencePoints: number;
  streak: number;
  lastActiveDate: Date;
  achievements: UserAchievement[];
  learningGoals: LearningGoal[];
}

interface UserAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'reading' | 'learning' | 'contribution' | 'collaboration' | 'milestone';
  earnedAt: Date;
  points: number;
}

interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: Date;
  category: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
}

interface KnowledgeComment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  parentId?: string;
  replies: KnowledgeComment[];
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  isLiked: boolean;
  isEdited: boolean;
}

interface KnowledgeSearch {
  query: string;
  filters: {
    category: string;
    type: string;
    difficulty: string;
    language: string;
    dateRange: string;
    author: string;
    tags: string[];
  };
  results: KnowledgeSearchResult[];
  totalResults: number;
  searchTime: number;
}

interface KnowledgeSearchResult {
  article: KnowledgeArticle;
  relevanceScore: number;
  matchingTerms: string[];
  snippet: string;
  highlightedContent: string;
}

interface KnowledgePlatformState {
  articles: KnowledgeArticle[];
  learningPaths: LearningPath[];
  categories: KnowledgeCategory[];
  userProgress: UserProgress | null;
  searchResults: KnowledgeSearchResult[];
  selectedArticle: KnowledgeArticle | null;
  selectedPath: LearningPath | null;
  selectedCategory: KnowledgeCategory | null;
  comments: KnowledgeComment[];
  bookmarkedArticles: KnowledgeArticle[];
  recentlyViewed: KnowledgeArticle[];
  trendingArticles: KnowledgeArticle[];
  recommendedContent: KnowledgeArticle[];
  isLoading: boolean;
  error: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } }
};

export const KnowledgeSharingPlatform: React.FC = () => {
  const {
    collaborationHubs, participants, shareKnowledge, getKnowledgeAnalytics,
    isConnected, refresh
  } = useCollaboration();

  const { orchestrationState, executeOrchestration } = useRacineOrchestration();
  const { integrationStatus, executeIntegration } = useCrossGroupIntegration();
  const { currentUser, userPermissions, teamMembers } = useUserManagement();
  const { activeWorkspace, workspaceMembers } = useWorkspaceManagement();
  const { trackActivity, getActivityAnalytics } = useActivityTracker();
  const { workflows, executeWorkflow } = useJobWorkflow();
  const { pipelines, executePipeline } = usePipelineManager();
  const { aiInsights, getRecommendations, analyzeContent } = useAIAssistant();

  const [platformState, setPlatformState] = useState<KnowledgePlatformState>({
    articles: [], learningPaths: [], categories: [], userProgress: null, searchResults: [],
    selectedArticle: null, selectedPath: null, selectedCategory: null, comments: [],
    bookmarkedArticles: [], recentlyViewed: [], trendingArticles: [], recommendedContent: [],
    isLoading: false, error: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'articles' | 'paths' | 'categories' | 'progress' | 'bookmarks'>('articles');
  const [filterOptions, setFilterOptions] = useState({
    category: 'all', type: 'all', difficulty: 'all', language: 'all', dateRange: 'all', author: 'all'
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showArticleViewer, setShowArticleViewer] = useState(false);
  const [showPathViewer, setShowPathViewer] = useState(false);

  const [articleEditor, setArticleEditor] = useState({
    title: '', content: '', summary: '', category: '', tags: [] as string[], type: 'article' as const,
    difficulty: 'beginner' as const, visibility: 'public' as const, attachments: [] as KnowledgeAttachment[]
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeKnowledgePlatform();
  }, []);

  useEffect(() => {
    if (searchQuery) performKnowledgeSearch(searchQuery);
  }, [searchQuery, filterOptions]);

  const initializeKnowledgePlatform = async () => {
    try {
      setPlatformState(prev => ({ ...prev, isLoading: true }));
      await Promise.all([
        loadKnowledgeArticles(),
        loadLearningPaths(),
        loadKnowledgeCategories(),
        loadUserProgress(),
        loadRecommendedContent()
      ]);
      
      trackActivity({
        type: 'knowledge_platform_initialized', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { component: 'KnowledgeSharingPlatform', workspace: activeWorkspace?.id }
      });
      
      setPlatformState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to initialize knowledge platform:', error);
      setPlatformState(prev => ({ ...prev, isLoading: false, error: 'Failed to initialize knowledge platform' }));
    }
  };

  const loadKnowledgeArticles = async () => {
    try {
      const articles = await generateMockArticles();
      const trending = articles.filter(a => a.viewCount > 1000).slice(0, 10);
      setPlatformState(prev => ({ ...prev, articles, trendingArticles: trending }));
    } catch (error) {
      console.error('Failed to load knowledge articles:', error);
    }
  };

  const loadLearningPaths = async () => {
    try {
      const paths = await generateMockLearningPaths();
      setPlatformState(prev => ({ ...prev, learningPaths: paths }));
    } catch (error) {
      console.error('Failed to load learning paths:', error);
    }
  };

  const loadKnowledgeCategories = async () => {
    try {
      const categories = await generateMockCategories();
      setPlatformState(prev => ({ ...prev, categories }));
    } catch (error) {
      console.error('Failed to load knowledge categories:', error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const progress = await generateMockUserProgress();
      setPlatformState(prev => ({ ...prev, userProgress: progress }));
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  const loadRecommendedContent = async () => {
    try {
      const recommendations = await getRecommendations({
        type: 'knowledge_articles', userId: currentUser?.id, context: 'learning_path',
        preferences: { categories: ['Data Science', 'Machine Learning'], difficulty: 'intermediate' }
      });
      
      const recommendedArticles = platformState.articles.slice(0, 5); // Mock implementation
      setPlatformState(prev => ({ ...prev, recommendedContent: recommendedArticles }));
    } catch (error) {
      console.error('Failed to load recommended content:', error);
    }
  };

  const performKnowledgeSearch = async (query: string) => {
    try {
      const searchTerms = query.toLowerCase().split(' ');
      const results: KnowledgeSearchResult[] = [];

      platformState.articles.forEach(article => {
        const title = article.title.toLowerCase();
        const content = article.content.toLowerCase();
        const summary = article.summary.toLowerCase();
        const tags = article.tags.join(' ').toLowerCase();
        
        const matchScore = searchTerms.reduce((score, term) => {
          let termScore = 0;
          if (title.includes(term)) termScore += 5;
          if (summary.includes(term)) termScore += 3;
          if (tags.includes(term)) termScore += 3;
          if (content.includes(term)) termScore += 1;
          return score + termScore;
        }, 0);

        if (matchScore > 0) {
          const snippet = article.summary.length > 150 ? 
            article.summary.substring(0, 150) + '...' : article.summary;
          
          results.push({
            article, relevanceScore: matchScore,
            matchingTerms: searchTerms.filter(term => 
              title.includes(term) || summary.includes(term) || tags.includes(term)
            ),
            snippet, highlightedContent: snippet
          });
        }
      });

      const sortedResults = results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 20);
      setPlatformState(prev => ({ ...prev, searchResults: sortedResults }));
    } catch (error) {
      console.error('Failed to perform knowledge search:', error);
    }
  };

  const createKnowledgeArticle = async () => {
    try {
      const article: KnowledgeArticle = {
        id: `article-${Date.now()}`, title: articleEditor.title, content: articleEditor.content,
        summary: articleEditor.summary, authorId: currentUser?.id || '', authorName: currentUser?.name || '',
        authorAvatar: currentUser?.avatar || '', category: articleEditor.category, tags: articleEditor.tags,
        type: articleEditor.type, difficulty: articleEditor.difficulty, estimatedReadTime: Math.ceil(articleEditor.content.length / 200),
        language: 'English', status: 'published', visibility: articleEditor.visibility,
        createdAt: new Date(), updatedAt: new Date(), publishedAt: new Date(),
        viewCount: 0, likeCount: 0, bookmarkCount: 0, commentCount: 0, shareCount: 0,
        rating: { overall: 0, accuracy: 0, clarity: 0, usefulness: 0, completeness: 0, totalRatings: 0 },
        metadata: { wordCount: articleEditor.content.split(' ').length, lastModifiedBy: currentUser?.name || '', 
          version: 1, reviewStatus: 'approved', seoScore: 85, readabilityScore: 75 },
        attachments: articleEditor.attachments, relatedArticles: [], prerequisites: [], learningObjectives: [],
        isBookmarked: false, isLiked: false, isFeatured: false, isVerified: false
      };

      await shareKnowledge({
        type: 'article', title: article.title, content: article.content, category: article.category,
        tags: article.tags, visibility: article.visibility
      });

      setPlatformState(prev => ({ ...prev, articles: [article, ...prev.articles] }));
      
      trackActivity({
        type: 'knowledge_article_created', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { articleId: article.id, title: article.title, category: article.category }
      });

      setShowCreateDialog(false);
      resetArticleEditor();
    } catch (error) {
      console.error('Failed to create knowledge article:', error);
    }
  };

  const resetArticleEditor = () => {
    setArticleEditor({
      title: '', content: '', summary: '', category: '', tags: [], type: 'article',
      difficulty: 'beginner', visibility: 'public', attachments: []
    });
  };

  const bookmarkArticle = async (articleId: string) => {
    try {
      const article = platformState.articles.find(a => a.id === articleId);
      if (!article) return;

      const updatedArticle = { ...article, isBookmarked: !article.isBookmarked };
      
      setPlatformState(prev => ({
        ...prev,
        articles: prev.articles.map(a => a.id === articleId ? updatedArticle : a),
        bookmarkedArticles: updatedArticle.isBookmarked ? 
          [...prev.bookmarkedArticles, updatedArticle] :
          prev.bookmarkedArticles.filter(a => a.id !== articleId)
      }));

      trackActivity({
        type: updatedArticle.isBookmarked ? 'article_bookmarked' : 'article_unbookmarked',
        userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { articleId, title: article.title }
      });
    } catch (error) {
      console.error('Failed to bookmark article:', error);
    }
  };

  const likeArticle = async (articleId: string) => {
    try {
      const article = platformState.articles.find(a => a.id === articleId);
      if (!article) return;

      const updatedArticle = { 
        ...article, 
        isLiked: !article.isLiked,
        likeCount: article.isLiked ? article.likeCount - 1 : article.likeCount + 1
      };
      
      setPlatformState(prev => ({
        ...prev,
        articles: prev.articles.map(a => a.id === articleId ? updatedArticle : a)
      }));

      trackActivity({
        type: updatedArticle.isLiked ? 'article_liked' : 'article_unliked',
        userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { articleId, title: article.title }
      });
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  const viewArticle = async (article: KnowledgeArticle) => {
    try {
      const updatedArticle = { ...article, viewCount: article.viewCount + 1 };
      
      setPlatformState(prev => ({
        ...prev,
        selectedArticle: updatedArticle,
        articles: prev.articles.map(a => a.id === article.id ? updatedArticle : a),
        recentlyViewed: [updatedArticle, ...prev.recentlyViewed.filter(a => a.id !== article.id)].slice(0, 10)
      }));

      setShowArticleViewer(true);

      trackActivity({
        type: 'article_viewed', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { articleId: article.id, title: article.title, category: article.category }
      });
    } catch (error) {
      console.error('Failed to view article:', error);
    }
  };

  const generateMockArticles = async (): Promise<KnowledgeArticle[]> => {
    const categories = ['Data Science', 'Machine Learning', 'Cloud Architecture', 'DevOps', 'UI/UX Design'];
    const types = ['article', 'tutorial', 'guide', 'reference', 'best_practice', 'case_study'];
    const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    
    const articles: KnowledgeArticle[] = [];

    for (let i = 0; i < 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      articles.push({
        id: `article-${i}`, title: `${category} ${type} ${i + 1}`,
        content: `Comprehensive ${type} covering ${category} concepts and best practices. This detailed guide provides step-by-step instructions and real-world examples to help you master ${category}.`,
        summary: `Learn ${category} fundamentals through this comprehensive ${type}`,
        authorId: `author-${Math.floor(Math.random() * 10)}`, authorName: `Author ${Math.floor(Math.random() * 10) + 1}`,
        authorAvatar: `/avatars/author-${Math.floor(Math.random() * 10)}.jpg`, category, 
        tags: [category, type, difficulty], type: type as any, difficulty: difficulty as any,
        estimatedReadTime: 5 + Math.floor(Math.random() * 20), language: 'English',
        status: 'published', visibility: 'public', createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        viewCount: Math.floor(Math.random() * 5000), likeCount: Math.floor(Math.random() * 500),
        bookmarkCount: Math.floor(Math.random() * 200), commentCount: Math.floor(Math.random() * 50),
        shareCount: Math.floor(Math.random() * 100),
        rating: {
          overall: 3.5 + Math.random() * 1.5, accuracy: 3.5 + Math.random() * 1.5,
          clarity: 3.5 + Math.random() * 1.5, usefulness: 3.5 + Math.random() * 1.5,
          completeness: 3.5 + Math.random() * 1.5, totalRatings: Math.floor(Math.random() * 100) + 10
        },
        metadata: {
          wordCount: 500 + Math.floor(Math.random() * 2000), lastModifiedBy: `Author ${Math.floor(Math.random() * 10) + 1}`,
          version: Math.floor(Math.random() * 5) + 1, reviewStatus: 'approved',
          seoScore: 70 + Math.floor(Math.random() * 30), readabilityScore: 60 + Math.floor(Math.random() * 40)
        },
        attachments: [], relatedArticles: [], prerequisites: [], learningObjectives: [],
        isBookmarked: Math.random() > 0.8, isLiked: Math.random() > 0.7,
        isFeatured: Math.random() > 0.9, isVerified: Math.random() > 0.3
      });
    }

    return articles;
  };

  const generateMockLearningPaths = async (): Promise<LearningPath[]> => {
    const categories = ['Data Science', 'Machine Learning', 'Cloud Architecture', 'DevOps', 'UI/UX Design'];
    const paths: LearningPath[] = [];

    for (let i = 0; i < 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      paths.push({
        id: `path-${i}`, title: `Complete ${category} Learning Path`,
        description: `Master ${category} from basics to advanced concepts through structured learning modules`,
        authorId: `author-${Math.floor(Math.random() * 5)}`, authorName: `Expert ${Math.floor(Math.random() * 5) + 1}`,
        category, tags: [category, 'learning', 'certification'],
        difficulty: ['beginner', 'intermediate', 'advanced', 'mixed'][Math.floor(Math.random() * 4)] as any,
        estimatedDuration: 20 + Math.floor(Math.random() * 100), moduleCount: 5 + Math.floor(Math.random() * 15),
        enrollmentCount: Math.floor(Math.random() * 1000), completionRate: 60 + Math.random() * 40,
        rating: 3.5 + Math.random() * 1.5, totalRatings: Math.floor(Math.random() * 200) + 20,
        isPublished: true, isFeatured: Math.random() > 0.8,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        modules: [], prerequisites: [], learningObjectives: [],
        certificationOffered: Math.random() > 0.5, price: Math.random() > 0.7 ? 99 + Math.floor(Math.random() * 400) : undefined,
        currency: 'USD', isEnrolled: Math.random() > 0.8, progress: Math.random() * 100
      });
    }

    return paths;
  };

  const generateMockCategories = async (): Promise<KnowledgeCategory[]> => {
    return [
      { id: 'data-science', name: 'Data Science', description: 'Analytics, statistics, and data insights',
        icon: 'BarChart3', color: '#3B82F6', children: [], articleCount: 45, pathCount: 8, isActive: true },
      { id: 'machine-learning', name: 'Machine Learning', description: 'AI algorithms and model development',
        icon: 'Brain', color: '#8B5CF6', children: [], articleCount: 38, pathCount: 6, isActive: true },
      { id: 'cloud-architecture', name: 'Cloud Architecture', description: 'Cloud infrastructure and services',
        icon: 'Cloud', color: '#10B981', children: [], articleCount: 32, pathCount: 5, isActive: true },
      { id: 'devops', name: 'DevOps', description: 'Development and operations integration',
        icon: 'Server', color: '#F59E0B', children: [], articleCount: 28, pathCount: 4, isActive: true },
      { id: 'ui-ux', name: 'UI/UX Design', description: 'User interface and experience design',
        icon: 'Palette', color: '#EF4444', children: [], articleCount: 25, pathCount: 3, isActive: true }
    ];
  };

  const generateMockUserProgress = async (): Promise<UserProgress> => {
    return {
      userId: currentUser?.id || '', totalArticlesRead: 127, totalPathsCompleted: 8,
      totalTimeSpent: 45600, skillsAcquired: ['Data Analysis', 'Python', 'SQL', 'Machine Learning', 'Cloud Architecture'],
      certificationsEarned: ['Data Science Fundamentals', 'Cloud Architecture Basics'], currentLevel: 12,
      experiencePoints: 2450, streak: 7, lastActiveDate: new Date(),
      achievements: [
        { id: 'first-article', title: 'First Reader', description: 'Read your first article',
          icon: 'BookOpen', type: 'reading', earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), points: 10 },
        { id: 'week-streak', title: 'Week Warrior', description: 'Maintained a 7-day learning streak',
          icon: 'Trophy', type: 'milestone', earnedAt: new Date(), points: 50 }
      ],
      learningGoals: [
        { id: 'goal-1', userId: currentUser?.id || '', title: 'Complete ML Path',
          description: 'Finish the Machine Learning fundamentals path', targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          category: 'Machine Learning', progress: 65, isCompleted: false }
      ]
    };
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={cn("h-4 w-4", i < Math.floor(rating) ? "text-yellow-500 fill-current" : "text-gray-300")} />
    ));
  };

  const renderArticleGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(searchQuery ? platformState.searchResults.map(result => result.article) : platformState.articles)
        .slice(0, 12).map((article) => (
          <motion.div key={article.id} variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="group">
            <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getDifficultyColor(article.difficulty)}>
                    {article.difficulty}
                  </Badge>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); bookmarkArticle(article.id); }}>
                      <Bookmark className={cn("h-4 w-4", article.isBookmarked && "fill-current")} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); likeArticle(article.id); }}>
                      <Heart className={cn("h-4 w-4", article.isLiked && "fill-current text-red-500")} />
                    </Button>
                  </div>
                </div>
                
                <CardTitle className="text-lg line-clamp-2 mb-2">{article.title}</CardTitle>
                
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={article.authorAvatar} />
                    <AvatarFallback className="text-xs">{article.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{article.authorName}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">{formatDate(article.publishedAt || article.createdAt)}</span>
                </div>
              </CardHeader>
              
              <CardContent onClick={() => viewArticle(article)}>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{article.summary}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">+{article.tags.length - 3}</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.estimatedReadTime} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{article.viewCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getRatingStars(article.rating.overall)}
                      <span className="ml-1">{article.rating.overall.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{article.likeCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
    </div>
  );

  const renderLearningPathGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {platformState.learningPaths.slice(0, 12).map((path) => (
        <motion.div key={path.id} variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className={getDifficultyColor(path.difficulty)}>
                  {path.difficulty}
                </Badge>
                {path.isFeatured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>
              
              <CardTitle className="text-lg line-clamp-2">{path.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{path.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{path.moduleCount} modules</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(path.estimatedDuration)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getRatingStars(path.rating)}
                    <span className="ml-1">{path.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                {path.isEnrolled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(path.progress)}%</span>
                    </div>
                    <Progress value={path.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span>{path.enrollmentCount} enrolled</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {path.price ? (
                      <span className="font-semibold">${path.price}</span>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                    <Button size="sm" onClick={() => setPlatformState(prev => ({ ...prev, selectedPath: path }))}>
                      {path.isEnrolled ? 'Continue' : 'Enroll'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <TooltipProvider>
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Knowledge Sharing Platform</h1>
                <p className="text-muted-foreground">Discover, learn, and share knowledge across your organization</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
              
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Platform Preferences
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input ref={searchInputRef} placeholder="Search articles, paths, and knowledge..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            
            <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
              <TabsList>
                <TabsTrigger value="articles">
                  <FileText className="h-4 w-4 mr-2" />
                  Articles
                </TabsTrigger>
                <TabsTrigger value="paths">
                  <Route className="h-4 w-4 mr-2" />
                  Learning Paths
                </TabsTrigger>
                <TabsTrigger value="categories">
                  <Folder className="h-4 w-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="progress">
                  <Target className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="bookmarks">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Bookmarks
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-6" ref={contentRef}>
            {platformState.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {selectedView === 'articles' && renderArticleGrid()}
                {selectedView === 'paths' && renderLearningPathGrid()}
                {selectedView === 'categories' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {platformState.categories.map((category) => (
                      <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4 text-center">
                          <div className="mb-3">
                            <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: category.color + '20' }}>
                              <Library className="h-6 w-6" style={{ color: category.color }} />
                            </div>
                          </div>
                          <h3 className="font-semibold mb-1">{category.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <span>{category.articleCount} articles</span> • <span>{category.pathCount} paths</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {selectedView === 'progress' && platformState.userProgress && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Articles Read</p>
                              <p className="text-2xl font-bold">{platformState.userProgress.totalArticlesRead}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Route className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Paths Completed</p>
                              <p className="text-2xl font-bold">{platformState.userProgress.totalPathsCompleted}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <div>
                              <p className="text-sm font-medium">Level</p>
                              <p className="text-2xl font-bold">{platformState.userProgress.currentLevel}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">Streak</p>
                              <p className="text-2xl font-bold">{platformState.userProgress.streak} days</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {platformState.userProgress.achievements.map((achievement) => (
                            <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">{achievement.title}</h4>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              </div>
                              <Badge variant="secondary">+{achievement.points} XP</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {selectedView === 'bookmarks' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {platformState.bookmarkedArticles.map((article) => (
                      <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                            </div>
                            <Button size="sm" onClick={() => viewArticle(article)}>
                              Read
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Knowledge Content</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input value={articleEditor.title} 
                    onChange={(e) => setArticleEditor(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Enter article title..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={articleEditor.category}
                    onValueChange={(value) => setArticleEditor(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformState.categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Summary</label>
                <Textarea value={articleEditor.summary}
                  onChange={(e) => setArticleEditor(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the article..." rows={2} />
              </div>
              
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea value={articleEditor.content}
                  onChange={(e) => setArticleEditor(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content..." rows={10} />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={articleEditor.type}
                    onValueChange={(value: any) => setArticleEditor(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                      <SelectItem value="best_practice">Best Practice</SelectItem>
                      <SelectItem value="case_study">Case Study</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={articleEditor.difficulty}
                    onValueChange={(value: any) => setArticleEditor(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Visibility</label>
                  <Select value={articleEditor.visibility}
                    onValueChange={(value: any) => setArticleEditor(prev => ({ ...prev, visibility: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={createKnowledgeArticle}>Publish Article</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};
