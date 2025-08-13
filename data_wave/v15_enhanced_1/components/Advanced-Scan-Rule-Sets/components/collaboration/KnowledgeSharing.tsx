import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BookOpen,
  Lightbulb,
  Share2,
  Users,
  Star,
  TrendingUp,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  Tag,
  Calendar,
  Clock,
  FileText,
  Video,
  Image,
  Link,
  Code,
  Database,
  Settings,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Zap,
  Target,
  Award,
  Flag,
  PieChart,
  BarChart3,
  Activity,
  Brain,
  Network,
  Layers,
  GitBranch,
  History,
  Timer,
  Mail,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollaboration } from '../../hooks/useCollaboration';
import { collaborationApi } from '../../services/collaboration-apis';

interface KnowledgeSharingProps {
  className?: string;
  onKnowledgeUpdate?: (knowledge: KnowledgeItem) => void;
  onCollectionUpdate?: (collection: KnowledgeCollection) => void;
}

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'article' | 'tutorial' | 'best_practice' | 'troubleshooting' | 'documentation' | 'video' | 'code_snippet' | 'template';
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    expertise: string[];
  };
  status: 'draft' | 'published' | 'archived' | 'under_review';
  visibility: 'public' | 'team' | 'department' | 'private';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedReadTime: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  views: number;
  likes: number;
  dislikes: number;
  bookmarks: number;
  shares: number;
  comments: number;
  attachments: KnowledgeAttachment[];
  relatedItems: string[];
  prerequisites: string[];
  learningObjectives: string[];
  metadata: {
    language: string;
    version: string;
    lastReviewed?: Date;
    reviewers: string[];
    accuracy: number;
    helpfulness: number;
    clarity: number;
  };
  analytics: {
    impressions: number;
    clickThroughRate: number;
    avgTimeOnPage: number;
    bounceRate: number;
    completionRate: number;
  };
}

interface KnowledgeAttachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'code' | 'dataset';
  url: string;
  size: number;
  thumbnailUrl?: string;
  description?: string;
  uploadedAt: Date;
}

interface KnowledgeCollection {
  id: string;
  name: string;
  description: string;
  type: 'learning_path' | 'topic_cluster' | 'best_practices' | 'troubleshooting_guide' | 'project_documentation';
  items: string[];
  curators: string[];
  subscribers: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  estimatedDuration: number;
  completionRate: number;
  rating: number;
}

interface KnowledgeComment {
  id: string;
  knowledgeItemId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  type: 'comment' | 'question' | 'suggestion' | 'correction';
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies: KnowledgeComment[];
  isResolved: boolean;
  markedHelpful: boolean;
}

interface KnowledgeAnalytics {
  totalItems: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  popularCategories: Array<{
    category: string;
    count: number;
    growth: number;
  }>;
  topContributors: Array<{
    userId: string;
    userName: string;
    contributions: number;
    avgRating: number;
    totalViews: number;
  }>;
  engagementTrends: Array<{
    date: string;
    views: number;
    likes: number;
    shares: number;
    comments: number;
  }>;
  mostViewed: KnowledgeItem[];
  trending: KnowledgeItem[];
  recentActivity: Array<{
    type: 'created' | 'updated' | 'viewed' | 'liked' | 'shared' | 'commented';
    itemId: string;
    itemTitle: string;
    userId: string;
    userName: string;
    timestamp: Date;
  }>;
}

interface SearchFilters {
  query: string;
  type: string;
  category: string;
  author: string;
  tags: string[];
  difficulty: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  minRating: number;
  hasAttachments: boolean;
  sortBy: 'relevance' | 'date' | 'popularity' | 'rating';
  sortOrder: 'asc' | 'desc';
}

const KNOWLEDGE_TYPES = [
  { value: 'article', label: 'Article', icon: FileText, description: 'Written content and guides' },
  { value: 'tutorial', label: 'Tutorial', icon: Play, description: 'Step-by-step instructions' },
  { value: 'best_practice', label: 'Best Practice', icon: Star, description: 'Recommended approaches' },
  { value: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle, description: 'Problem-solving guides' },
  { value: 'documentation', label: 'Documentation', icon: BookOpen, description: 'Technical documentation' },
  { value: 'video', label: 'Video', icon: Video, description: 'Video content and tutorials' },
  { value: 'code_snippet', label: 'Code Snippet', icon: Code, description: 'Reusable code examples' },
  { value: 'template', label: 'Template', icon: Copy, description: 'Reusable templates and frameworks' }
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Visible to everyone', icon: Globe },
  { value: 'team', label: 'Team', description: 'Visible to team members', icon: Users },
  { value: 'department', label: 'Department', description: 'Visible to department', icon: Network },
  { value: 'private', label: 'Private', description: 'Only visible to you', icon: Lock }
];

export const KnowledgeSharing: React.FC<KnowledgeSharingProps> = ({
  className,
  onKnowledgeUpdate,
  onCollectionUpdate
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'browse' | 'collections' | 'my_content' | 'analytics' | 'trending'>('browse');
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [analytics, setAnalytics] = useState<KnowledgeAnalytics | null>(null);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<KnowledgeCollection | null>(null);
  
  // Creation and editing
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [showCollectionDetails, setShowCollectionDetails] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<KnowledgeItem> | null>(null);
  
  // Form states
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    content: '',
    type: 'article' as KnowledgeItem['type'],
    category: '',
    tags: [] as string[],
    visibility: 'team' as KnowledgeItem['visibility'],
    difficulty: 'intermediate' as KnowledgeItem['difficulty'],
    prerequisites: [] as string[],
    learningObjectives: [] as string[]
  });
  
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    type: 'topic_cluster' as KnowledgeCollection['type'],
    tags: [] as string[],
    isPublic: true,
    selectedItems: [] as string[]
  });
  
  // Search and filters
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    category: 'all',
    author: 'all',
    tags: [],
    difficulty: 'all',
    dateRange: {},
    minRating: 0,
    hasAttachments: false,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Hooks
  const {
    getKnowledgeItems,
    createKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    getKnowledgeCollections,
    createKnowledgeCollection,
    getKnowledgeAnalytics,
    rateKnowledgeItem,
    bookmarkKnowledgeItem,
    shareKnowledgeItem,
    loading: collaborationLoading,
    error: collaborationError
  } = useCollaboration();

  // Initialize data
  useEffect(() => {
    loadKnowledgeItems();
    loadCollections();
    loadAnalytics();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      loadKnowledgeItems();
      loadAnalytics();
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Data loading functions
  const loadKnowledgeItems = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getKnowledgeItems();
      setKnowledgeItems(items);
    } catch (error) {
      console.error('Failed to load knowledge items:', error);
    } finally {
      setLoading(false);
    }
  }, [getKnowledgeItems]);

  const loadCollections = useCallback(async () => {
    try {
      const collectionsData = await getKnowledgeCollections();
      setCollections(collectionsData);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  }, [getKnowledgeCollections]);

  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await getKnowledgeAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [getKnowledgeAnalytics]);

  // CRUD operations
  const handleCreateItem = useCallback(async () => {
    try {
      setLoading(true);
      const item = await createKnowledgeItem({
        title: itemForm.title,
        description: itemForm.description,
        content: itemForm.content,
        type: itemForm.type,
        category: itemForm.category,
        tags: itemForm.tags,
        visibility: itemForm.visibility,
        difficulty: itemForm.difficulty,
        prerequisites: itemForm.prerequisites,
        learningObjectives: itemForm.learningObjectives
      });
      
      setKnowledgeItems(prev => [...prev, item]);
      setShowCreateItem(false);
      setItemForm({
        title: '',
        description: '',
        content: '',
        type: 'article',
        category: '',
        tags: [],
        visibility: 'team',
        difficulty: 'intermediate',
        prerequisites: [],
        learningObjectives: []
      });
      
      if (onKnowledgeUpdate) {
        onKnowledgeUpdate(item);
      }
    } catch (error) {
      console.error('Failed to create knowledge item:', error);
    } finally {
      setLoading(false);
    }
  }, [itemForm, createKnowledgeItem, onKnowledgeUpdate]);

  const handleCreateCollection = useCallback(async () => {
    try {
      setLoading(true);
      const collection = await createKnowledgeCollection({
        name: collectionForm.name,
        description: collectionForm.description,
        type: collectionForm.type,
        tags: collectionForm.tags,
        isPublic: collectionForm.isPublic,
        items: collectionForm.selectedItems
      });
      
      setCollections(prev => [...prev, collection]);
      setShowCreateCollection(false);
      setCollectionForm({
        name: '',
        description: '',
        type: 'topic_cluster',
        tags: [],
        isPublic: true,
        selectedItems: []
      });
      
      if (onCollectionUpdate) {
        onCollectionUpdate(collection);
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionForm, createKnowledgeCollection, onCollectionUpdate]);

  const handleItemAction = useCallback(async (itemId: string, action: 'like' | 'bookmark' | 'share') => {
    try {
      switch (action) {
        case 'like':
          await rateKnowledgeItem(itemId, 'like');
          break;
        case 'bookmark':
          await bookmarkKnowledgeItem(itemId);
          break;
        case 'share':
          await shareKnowledgeItem(itemId);
          break;
      }
      
      // Update local state
      setKnowledgeItems(prev => prev.map(item => {
        if (item.id === itemId) {
          switch (action) {
            case 'like':
              return { ...item, likes: item.likes + 1 };
            case 'bookmark':
              return { ...item, bookmarks: item.bookmarks + 1 };
            case 'share':
              return { ...item, shares: item.shares + 1 };
            default:
              return item;
          }
        }
        return item;
      }));
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
    }
  }, [rateKnowledgeItem, bookmarkKnowledgeItem, shareKnowledgeItem]);

  const handleDeleteItem = useCallback(async () => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      await deleteKnowledgeItem(itemToDelete);
      setKnowledgeItems(prev => prev.filter(item => item.id !== itemToDelete));
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setLoading(false);
    }
  }, [itemToDelete, deleteKnowledgeItem]);

  // Filter and search
  const filteredItems = useMemo(() => {
    return knowledgeItems.filter(item => {
      if (searchFilters.query && !item.title.toLowerCase().includes(searchFilters.query.toLowerCase()) &&
          !item.description.toLowerCase().includes(searchFilters.query.toLowerCase())) {
        return false;
      }
      if (searchFilters.type !== 'all' && item.type !== searchFilters.type) {
        return false;
      }
      if (searchFilters.category !== 'all' && item.category !== searchFilters.category) {
        return false;
      }
      if (searchFilters.difficulty !== 'all' && item.difficulty !== searchFilters.difficulty) {
        return false;
      }
      if (searchFilters.tags.length > 0 && !searchFilters.tags.some(tag => item.tags.includes(tag))) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      switch (searchFilters.sortBy) {
        case 'date':
          return searchFilters.sortOrder === 'desc' 
            ? b.updatedAt.getTime() - a.updatedAt.getTime()
            : a.updatedAt.getTime() - b.updatedAt.getTime();
        case 'popularity':
          return searchFilters.sortOrder === 'desc' 
            ? (b.views + b.likes) - (a.views + a.likes)
            : (a.views + a.likes) - (b.views + b.likes);
        case 'rating':
          return searchFilters.sortOrder === 'desc' 
            ? b.metadata.helpfulness - a.metadata.helpfulness
            : a.metadata.helpfulness - b.metadata.helpfulness;
        default:
          return 0;
      }
    });
  }, [knowledgeItems, searchFilters]);

  const getDifficultyBadge = (difficulty: string) => {
    const config = DIFFICULTY_LEVELS.find(d => d.value === difficulty);
    return config ? { label: config.label, className: config.color } : { label: difficulty, className: 'bg-gray-100 text-gray-800' };
  };

  const getTypeIcon = (type: string) => {
    const config = KNOWLEDGE_TYPES.find(t => t.value === type);
    return config?.icon || FileText;
  };

  // Render functions
  const renderKnowledgeItem = (item: KnowledgeItem) => {
    const TypeIcon = getTypeIcon(item.type);
    const difficultyBadge = getDifficultyBadge(item.difficulty);
    
    return (
      <Card 
        key={item.id} 
        className="cursor-pointer hover:shadow-md transition-all duration-200 group"
        onClick={() => {
          setSelectedItem(item);
          setShowItemDetails(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TypeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {item.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Badge className={difficultyBadge.className}>
                {difficultyBadge.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{item.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{item.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{item.estimatedReadTime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{item.comments}</span>
              </div>
            </div>
            
            {/* Author */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={item.author.avatar} />
                <AvatarFallback className="text-xs">{item.author.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <span className="font-medium">{item.author.name}</span>
                <span className="text-muted-foreground ml-1">• {item.author.role}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemAction(item.id, 'like');
                  }}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {item.likes}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemAction(item.id, 'bookmark');
                  }}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemAction(item.id, 'share');
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {item.updatedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCollection = (collection: KnowledgeCollection) => (
    <Card 
      key={collection.id} 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        setSelectedCollection(collection);
        setShowCollectionDetails(true);
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{collection.name}</CardTitle>
            <CardDescription>{collection.description}</CardDescription>
          </div>
          <Badge variant={collection.isPublic ? 'default' : 'secondary'}>
            {collection.isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Items:</span>
              <span className="ml-2 font-medium">{collection.items.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Subscribers:</span>
              <span className="ml-2 font-medium">{collection.subscribers}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-medium">{collection.estimatedDuration}h</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="font-medium">{collection.rating.toFixed(1)}</span>
            </div>
          </div>
          
          {collection.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {collection.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {collection.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{collection.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Updated {collection.updatedAt.toLocaleDateString()}
            </div>
            <Progress value={collection.completionRate} className="w-20 h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Knowledge Sharing</h2>
          <p className="text-muted-foreground">
            Share expertise and discover insights from your team
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadKnowledgeItems}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateCollection(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
          <Button onClick={() => setShowCreateItem(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Share Knowledge
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="my_content">My Content</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchFilters.query}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select 
              value={searchFilters.type} 
              onValueChange={(value) => setSearchFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {KNOWLEDGE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={searchFilters.difficulty} 
              onValueChange={(value) => setSearchFilters(prev => ({ ...prev, difficulty: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTY_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button 
                size="sm" 
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select 
                      value={searchFilters.sortBy} 
                      onValueChange={(value) => setSearchFilters(prev => ({ ...prev, sortBy: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="min-rating">Minimum Rating</Label>
                    <Select 
                      value={searchFilters.minRating.toString()} 
                      onValueChange={(value) => setSearchFilters(prev => ({ ...prev, minRating: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={searchFilters.hasAttachments}
                      onCheckedChange={(checked) => setSearchFilters(prev => ({ ...prev, hasAttachments: !!checked }))}
                    />
                    <Label className="text-sm">Has Attachments</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Knowledge Items */}
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "space-y-4"
          )}>
            {filteredItems.map(renderKnowledgeItem)}
          </div>
        </TabsContent>
        
        <TabsContent value="collections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(renderCollection)}
          </div>
        </TabsContent>
        
        <TabsContent value="my_content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeItems
              .filter(item => item.author.id === 'current-user')
              .map(renderKnowledgeItem)}
          </div>
        </TabsContent>
        
        <TabsContent value="trending" className="space-y-6">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Viewed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.mostViewed.slice(0, 5).map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.views.toLocaleString()} views
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.popularCategories.map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {category.count} items
                            </span>
                            <Badge variant={category.growth > 0 ? 'default' : 'secondary'}>
                              {category.growth > 0 ? '+' : ''}{category.growth}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.trending.map(renderKnowledgeItem)}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalItems}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalLikes}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalShares}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                  <CardDescription>Most active knowledge contributors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topContributors.map((contributor, index) => (
                      <div key={contributor.userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{contributor.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {contributor.contributions} contributions
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{contributor.avgRating.toFixed(1)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contributor.totalViews.toLocaleString()} views
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Knowledge Item Dialog */}
      <Dialog open={showCreateItem} onOpenChange={setShowCreateItem}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Share Knowledge</DialogTitle>
            <DialogDescription>
              Create a new knowledge item to share with your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-title">Title</Label>
                <Input
                  id="item-title"
                  value={itemForm.title}
                  onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                />
              </div>
              <div>
                <Label htmlFor="item-type">Type</Label>
                <Select value={itemForm.type} onValueChange={(value) => setItemForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KNOWLEDGE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the content"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="item-category">Category</Label>
                <Input
                  id="item-category"
                  value={itemForm.category}
                  onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Category"
                />
              </div>
              <div>
                <Label htmlFor="item-difficulty">Difficulty</Label>
                <Select value={itemForm.difficulty} onValueChange={(value) => setItemForm(prev => ({ ...prev, difficulty: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-visibility">Visibility</Label>
                <Select value={itemForm.visibility} onValueChange={(value) => setItemForm(prev => ({ ...prev, visibility: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="item-content">Content</Label>
              <Textarea
                id="item-content"
                value={itemForm.content}
                onChange={(e) => setItemForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your knowledge content here..."
                className="min-h-40"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateItem(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} disabled={loading || !itemForm.title}>
              Share Knowledge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this knowledge item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KnowledgeSharing;