'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  MessageSquare, Users, Pin, Lock, Eye, Heart, MessageCircle, Share2, Flag, Shield,
  Search, Filter, SortAsc, SortDesc, Plus, Edit3, Trash2, MoreHorizontal,
  Star, Award, Crown, Zap, ThumbsUp, ThumbsDown, Bookmark, Bell,
  Settings, User, Hash, Clock, TrendingUp, BarChart3, PieChart, Activity,
  FileText, Image, Video, Link, Download, Upload, Calendar as CalendarIcon,
  CheckCircle, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, RefreshCw, ExternalLink, Copy, Send
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { collaborationService } from '../../services/collaboration.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';

// Enhanced Type Definitions for Community Forum
interface CommunityForum {
  id: string;
  name: string;
  description: string;
  category: ForumCategory;
  visibility: ForumVisibility;
  settings: ForumSettings;
  moderators: ForumModerator[];
  statistics: ForumStatistics;
  rules: ForumRule[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  subcategories: ForumCategory[];
  threadCount: number;
  postCount: number;
  lastActivity?: string;
}

interface ForumSettings {
  allowAnonymous: boolean;
  requireApproval: boolean;
  allowAttachments: boolean;
  allowPolls: boolean;
  allowVoting: boolean;
  maxAttachmentSize: number;
  allowedFileTypes: string[];
  moderationLevel: ModerationLevel;
  autoArchiveDays: number;
  pinLimit: number;
  reputationRequired: number;
  notifications: NotificationSettings;
}

interface NotificationSettings {
  newThreads: boolean;
  newReplies: boolean;
  mentions: boolean;
  moderatorActions: boolean;
  emailDigest: boolean;
  pushNotifications: boolean;
}

interface ForumModerator {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  permissions: ModeratorPermission[];
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

interface ModeratorPermission {
  action: ModeratorAction;
  scope: PermissionScope;
  restrictions?: string[];
}

interface ForumRule {
  id: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  autoEnforce: boolean;
  actions: RuleAction[];
  createdAt: string;
  updatedAt: string;
}

interface ForumStatistics {
  totalThreads: number;
  totalPosts: number;
  totalUsers: number;
  activeUsers: number;
  averageResponseTime: number;
  engagementRate: number;
  moderationActions: number;
  reportedContent: number;
  resolvedReports: number;
  userGrowthRate: number;
  contentGrowthRate: number;
  popularTags: TagStatistic[];
  timeDistribution: TimeDistribution[];
  userActivityHeatmap: ActivityHeatmap[];
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: ThreadAuthor;
  category: ForumCategory;
  tags: string[];
  status: ThreadStatus;
  priority: ThreadPriority;
  isPinned: boolean;
  isLocked: boolean;
  isArchived: boolean;
  viewCount: number;
  replyCount: number;
  lastReply?: ThreadPost;
  votes: ThreadVotes;
  attachments: ThreadAttachment[];
  poll?: ThreadPoll;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
}

interface ThreadAuthor {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  reputation: number;
  badges: UserBadge[];
  isVerified: boolean;
  isModerator: boolean;
  joinDate: string;
  postCount: number;
}

interface ThreadPost {
  id: string;
  threadId: string;
  content: string;
  author: ThreadAuthor;
  parentPostId?: string;
  isDeleted: boolean;
  isEdited: boolean;
  editHistory: EditHistory[];
  votes: PostVotes;
  reactions: PostReaction[];
  attachments: ThreadAttachment[];
  mentions: UserMention[];
  createdAt: string;
  updatedAt: string;
  moderationFlags: ModerationFlag[];
}

interface ThreadVotes {
  upvotes: number;
  downvotes: number;
  userVote?: VoteType;
}

interface PostVotes {
  upvotes: number;
  downvotes: number;
  userVote?: VoteType;
}

interface PostReaction {
  type: ReactionType;
  count: number;
  users: string[];
  userReacted: boolean;
}

interface ThreadAttachment {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: AttachmentType;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
}

interface ThreadPoll {
  id: string;
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  allowAddOptions: boolean;
  expiresAt?: string;
  totalVotes: number;
  userVoted: boolean;
  isExpired: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  userVoted: boolean;
}

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  rarity: BadgeRarity;
}

interface EditHistory {
  id: string;
  content: string;
  editedBy: string;
  editedAt: string;
  reason?: string;
}

interface UserMention {
  userId: string;
  username: string;
  position: number;
  length: number;
}

interface ModerationFlag {
  id: string;
  reason: FlagReason;
  reportedBy: string;
  reportedAt: string;
  status: FlagStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  action?: ModerationAction;
  notes?: string;
}

interface TagStatistic {
  tag: string;
  count: number;
  growth: number;
  trending: boolean;
}

interface TimeDistribution {
  hour: number;
  posts: number;
  threads: number;
  users: number;
}

interface ActivityHeatmap {
  day: number;
  hour: number;
  activity: number;
  intensity: number;
}

interface ForumAnalytics {
  overview: AnalyticsOverview;
  engagement: EngagementAnalytics;
  content: ContentAnalytics;
  users: UserAnalytics;
  moderation: ModerationAnalytics;
  trends: TrendAnalytics;
  performance: PerformanceAnalytics;
}

interface AnalyticsOverview {
  totalThreads: number;
  totalPosts: number;
  totalUsers: number;
  activeUsers: number;
  growthRate: number;
  engagementScore: number;
  healthScore: number;
}

interface EngagementAnalytics {
  postsPerThread: number;
  averageResponseTime: number;
  userRetention: number;
  bounceRate: number;
  sessionDuration: number;
  interactionRate: number;
  popularCategories: CategoryStats[];
  topContributors: ContributorStats[];
}

interface ContentAnalytics {
  contentGrowth: ContentGrowthData[];
  contentTypes: ContentTypeStats[];
  qualityMetrics: QualityMetrics;
  topicTrends: TopicTrend[];
  contentLifecycle: LifecycleStats[];
}

interface UserAnalytics {
  userGrowth: UserGrowthData[];
  userSegments: UserSegment[];
  behaviorPatterns: BehaviorPattern[];
  reputationDistribution: ReputationStats[];
  activityPatterns: ActivityPattern[];
}

interface ModerationAnalytics {
  reportMetrics: ReportMetrics;
  actionHistory: ModerationActionHistory[];
  flaggedContent: FlaggedContentStats[];
  moderatorActivity: ModeratorActivityStats[];
  autoModerationEffectiveness: AutoModerationStats;
}

interface TrendAnalytics {
  emergingTopics: EmergingTopic[];
  popularTags: PopularTag[];
  seasonalTrends: SeasonalTrend[];
  predictiveInsights: PredictiveInsight[];
}

interface PerformanceAnalytics {
  responseTimeMetrics: ResponseTimeMetrics;
  loadPerformance: LoadPerformanceMetrics;
  userExperience: UserExperienceMetrics;
  systemHealth: SystemHealthMetrics;
}

// Enums
enum ForumVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted'
}

enum ModerationLevel {
  NONE = 'none',
  LIGHT = 'light',
  MODERATE = 'moderate',
  STRICT = 'strict'
}

enum ModeratorAction {
  DELETE_POST = 'delete_post',
  EDIT_POST = 'edit_post',
  LOCK_THREAD = 'lock_thread',
  PIN_THREAD = 'pin_thread',
  MOVE_THREAD = 'move_thread',
  BAN_USER = 'ban_user',
  WARN_USER = 'warn_user',
  MODERATE_REPORTS = 'moderate_reports'
}

enum PermissionScope {
  GLOBAL = 'global',
  CATEGORY = 'category',
  THREAD = 'thread'
}

enum RuleSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum RuleAction {
  WARN = 'warn',
  DELETE = 'delete',
  LOCK = 'lock',
  BAN = 'ban',
  QUARANTINE = 'quarantine'
}

enum ThreadStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

enum ThreadPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

enum VoteType {
  UP = 'up',
  DOWN = 'down'
}

enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  ANGRY = 'angry',
  SAD = 'sad',
  CONFUSED = 'confused'
}

enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  OTHER = 'other'
}

enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

enum FlagReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  COPYRIGHT = 'copyright',
  MISINFORMATION = 'misinformation',
  OTHER = 'other'
}

enum FlagStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

enum ModerationAction {
  NO_ACTION = 'no_action',
  WARNING = 'warning',
  DELETE = 'delete',
  EDIT = 'edit',
  LOCK = 'lock',
  BAN = 'ban'
}

// Additional interfaces for analytics
interface CategoryStats {
  categoryId: string;
  name: string;
  threadCount: number;
  postCount: number;
  engagement: number;
}

interface ContributorStats {
  userId: string;
  username: string;
  posts: number;
  threads: number;
  reputation: number;
  engagement: number;
}

interface ContentGrowthData {
  date: string;
  threads: number;
  posts: number;
  users: number;
}

interface ContentTypeStats {
  type: string;
  count: number;
  percentage: number;
  engagement: number;
}

interface QualityMetrics {
  averagePostLength: number;
  averageResponseTime: number;
  resolutionRate: number;
  satisfactionScore: number;
}

interface TopicTrend {
  topic: string;
  mentions: number;
  growth: number;
  sentiment: number;
}

interface LifecycleStats {
  stage: string;
  count: number;
  averageDuration: number;
}

interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
}

interface UserSegment {
  segment: string;
  count: number;
  percentage: number;
  engagement: number;
}

interface BehaviorPattern {
  pattern: string;
  frequency: number;
  impact: number;
}

interface ReputationStats {
  range: string;
  count: number;
  percentage: number;
}

interface ActivityPattern {
  timeRange: string;
  activity: number;
  users: number;
}

interface ReportMetrics {
  totalReports: number;
  resolvedReports: number;
  averageResolutionTime: number;
  falsePositiveRate: number;
}

interface ModerationActionHistory {
  date: string;
  action: string;
  count: number;
  moderator: string;
}

interface FlaggedContentStats {
  reason: string;
  count: number;
  resolutionRate: number;
}

interface ModeratorActivityStats {
  moderatorId: string;
  username: string;
  actions: number;
  efficiency: number;
}

interface AutoModerationStats {
  accuracy: number;
  falsePositives: number;
  coverage: number;
  efficiency: number;
}

interface EmergingTopic {
  topic: string;
  growth: number;
  mentions: number;
  sentiment: number;
}

interface PopularTag {
  tag: string;
  usage: number;
  growth: number;
}

interface SeasonalTrend {
  period: string;
  metric: string;
  value: number;
  change: number;
}

interface PredictiveInsight {
  metric: string;
  prediction: number;
  confidence: number;
  timeframe: string;
}

interface ResponseTimeMetrics {
  average: number;
  median: number;
  p95: number;
  p99: number;
}

interface LoadPerformanceMetrics {
  pageLoadTime: number;
  serverResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
}

interface UserExperienceMetrics {
  satisfactionScore: number;
  usabilityScore: number;
  accessibilityScore: number;
  performanceScore: number;
}

interface SystemHealthMetrics {
  uptime: number;
  errorRate: number;
  throughput: number;
  resourceUtilization: number;
}

const CommunityForum: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('discussions');
  const [forums, setForums] = useState<CommunityForum[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedForum, setSelectedForum] = useState<CommunityForum | null>(null);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [analytics, setAnalytics] = useState<ForumAnalytics | null>(null);
  const [moderationQueue, setModerationQueue] = useState<ModerationFlag[]>([]);
  const [currentUser, setCurrentUser] = useState<ThreadAuthor | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showThreadDialog, setShowThreadDialog] = useState(false);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);

  // Form States
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [],
    priority: ThreadPriority.NORMAL,
    allowReplies: true,
    isPoll: false,
    pollOptions: []
  });

  const [newPost, setNewPost] = useState({
    content: '',
    replyToId: null
  });

  // Load forum data
  const loadForumData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load current user
      const user = await collaborationService.getCurrentUser();
      setCurrentUser(user);

      // Load forum data from backend services
      const [
        forumsData,
        threadsData,
        categoriesData,
        analyticsData,
        moderationData
      ] = await Promise.all([
        collaborationService.getCommunityForums(),
        collaborationService.getForumThreads(),
        collaborationService.getForumCategories(),
        collaborationService.getForumAnalytics(),
        collaborationService.getModerationQueue()
      ]);

      setForums(forumsData);
      setThreads(threadsData);
      setCategories(categoriesData);
      setAnalytics(analyticsData);
      setModerationQueue(moderationData);

      if (forumsData.length > 0) {
        setSelectedForum(forumsData[0]);
      }

    } catch (error) {
      console.error('Error loading forum data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    // Polling for updates
    const interval = setInterval(loadForumData, 30000);

    // WebSocket for real-time forum updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/forum');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_thread':
          setThreads(prev => [data.thread, ...prev]);
          break;
        case 'new_post':
          setPosts(prev => [data.post, ...prev]);
          break;
        case 'thread_updated':
          setThreads(prev => prev.map(t => t.id === data.thread.id ? data.thread : t));
          break;
        case 'moderation_action':
          setModerationQueue(prev => prev.filter(item => item.id !== data.flagId));
          break;
        case 'user_joined':
          // Update user count
          break;
      }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [loadForumData]);

  // Initialize component
  useEffect(() => {
    loadForumData();
    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, [loadForumData, setupRealTimeUpdates]);

  // Forum Management Functions
  const createThread = async (threadData: any) => {
    try {
      const thread = await collaborationService.createForumThread({
        ...threadData,
        forumId: selectedForum?.id,
        authorId: currentUser?.userId
      });
      
      setThreads(prev => [thread, ...prev]);
      setShowThreadDialog(false);
      setNewThread({
        title: '',
        content: '',
        categoryId: '',
        tags: [],
        priority: ThreadPriority.NORMAL,
        allowReplies: true,
        isPoll: false,
        pollOptions: []
      });
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const createPost = async (postData: any) => {
    try {
      const post = await collaborationService.createForumPost({
        ...postData,
        threadId: selectedThread?.id,
        authorId: currentUser?.userId
      });
      
      setPosts(prev => [...prev, post]);
      setNewPost({ content: '', replyToId: null });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const voteOnThread = async (threadId: string, voteType: VoteType) => {
    try {
      await collaborationService.voteOnThread(threadId, voteType);
      setThreads(prev => prev.map(thread => {
        if (thread.id === threadId) {
          const votes = { ...thread.votes };
          if (voteType === VoteType.UP) {
            votes.upvotes += votes.userVote === VoteType.UP ? -1 : 1;
            if (votes.userVote === VoteType.DOWN) votes.downvotes -= 1;
          } else {
            votes.downvotes += votes.userVote === VoteType.DOWN ? -1 : 1;
            if (votes.userVote === VoteType.UP) votes.upvotes -= 1;
          }
          votes.userVote = votes.userVote === voteType ? undefined : voteType;
          return { ...thread, votes };
        }
        return thread;
      }));
    } catch (error) {
      console.error('Error voting on thread:', error);
    }
  };

  const moderateContent = async (flagId: string, action: ModerationAction, notes?: string) => {
    try {
      await collaborationService.moderateContent(flagId, action, notes);
      setModerationQueue(prev => prev.filter(item => item.id !== flagId));
    } catch (error) {
      console.error('Error moderating content:', error);
    }
  };

  // Filter and search logic
  const filteredThreads = useMemo(() => {
    let filtered = threads;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(thread =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(thread => thread.category.id === selectedCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(thread => thread.status === filterStatus);
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.votes.upvotes - b.votes.downvotes) - (a.votes.upvotes - a.votes.downvotes));
        break;
      case 'replies':
        filtered.sort((a, b) => b.replyCount - a.replyCount);
        break;
      case 'views':
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
    }

    return filtered;
  }, [threads, searchQuery, selectedCategory, filterStatus, sortBy]);

  // Utility functions
  const getStatusColor = (status: ThreadStatus) => {
    switch (status) {
      case ThreadStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case ThreadStatus.LOCKED: return 'bg-red-100 text-red-800';
      case ThreadStatus.ARCHIVED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ThreadPriority) => {
    switch (priority) {
      case ThreadPriority.URGENT: return 'bg-red-100 text-red-800';
      case ThreadPriority.HIGH: return 'bg-orange-100 text-orange-800';
      case ThreadPriority.NORMAL: return 'bg-blue-100 text-blue-800';
      case ThreadPriority.LOW: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading community forum...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">
            Engage with the data governance community
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalyticsDialog(true)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          {currentUser?.isModerator && (
            <Button
              variant="outline"
              onClick={() => setShowModerationDialog(true)}
            >
              <Shield className="h-4 w-4 mr-2" />
              Moderation
              {moderationQueue.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {moderationQueue.length}
                </Badge>
              )}
            </Button>
          )}
          <Button onClick={() => setShowThreadDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        </div>
      </div>

      {/* Forum Selection and Stats */}
      {selectedForum && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>{selectedForum.name}</span>
                  <Badge variant="outline">{selectedForum.visibility}</Badge>
                </CardTitle>
                <p className="text-muted-foreground">{selectedForum.description}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{selectedForum.statistics.totalThreads}</div>
                  <div className="text-muted-foreground">Threads</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{selectedForum.statistics.totalPosts}</div>
                  <div className="text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{selectedForum.statistics.activeUsers}</div>
                  <div className="text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{selectedForum.statistics.engagementRate.toFixed(1)}%</div>
                  <div className="text-muted-foreground">Engagement</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="replies">Most Replies</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Hash className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.map((thread) => (
          <Card key={thread.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {thread.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                    {thread.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                    <h3 className="font-semibold text-lg hover:text-blue-600">
                      {thread.title}
                    </h3>
                    <Badge className={getPriorityColor(thread.priority)}>
                      {thread.priority}
                    </Badge>
                    <Badge className={getStatusColor(thread.status)}>
                      {thread.status}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {thread.content}
                  </p>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={thread.author.avatar} />
                        <AvatarFallback>
                          {thread.author.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{thread.author.displayName}</span>
                      {thread.author.isModerator && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                      {thread.author.isVerified && (
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(thread.createdAt)}
                    </span>
                    {thread.lastReply && (
                      <span className="text-sm text-muted-foreground">
                        Last reply {formatTimeAgo(thread.lastReply.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteOnThread(thread.id, VoteType.UP)}
                        className={thread.votes.userVote === VoteType.UP ? 'text-green-600' : ''}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="ml-1">{thread.votes.upvotes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteOnThread(thread.id, VoteType.DOWN)}
                        className={thread.votes.userVote === VoteType.DOWN ? 'text-red-600' : ''}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span className="ml-1">{thread.votes.downvotes}</span>
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>{thread.replyCount} replies</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{thread.viewCount} views</span>
                    </div>
                    
                    <Badge variant="outline">
                      {thread.category.name}
                    </Badge>
                  </div>
                  
                  {thread.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      {thread.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
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
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="h-4 w-4 mr-2" />
                        Follow Thread
                      </DropdownMenuItem>
                      {currentUser?.isModerator && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Lock className="h-4 w-4 mr-2" />
                            Lock Thread
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Thread
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Thread Dialog */}
      <Dialog open={showThreadDialog} onOpenChange={setShowThreadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Thread</DialogTitle>
            <DialogDescription>
              Start a new discussion in the community forum
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newThread.title}
                onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                placeholder="Enter thread title"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newThread.categoryId}
                onValueChange={(value) => setNewThread({ ...newThread, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newThread.content}
                onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                placeholder="Write your thread content"
                rows={6}
              />
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newThread.priority}
                onValueChange={(value) => setNewThread({ ...newThread, priority: value as ThreadPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ThreadPriority.LOW}>Low</SelectItem>
                  <SelectItem value={ThreadPriority.NORMAL}>Normal</SelectItem>
                  <SelectItem value={ThreadPriority.HIGH}>High</SelectItem>
                  <SelectItem value={ThreadPriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowReplies"
                checked={newThread.allowReplies}
                onCheckedChange={(checked) => setNewThread({ ...newThread, allowReplies: checked as boolean })}
              />
              <Label htmlFor="allowReplies">Allow replies</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPoll"
                checked={newThread.isPoll}
                onCheckedChange={(checked) => setNewThread({ ...newThread, isPoll: checked as boolean })}
              />
              <Label htmlFor="isPoll">Create as poll</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowThreadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createThread(newThread)}>
                Create Thread
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Forum Analytics</DialogTitle>
            <DialogDescription>
              Comprehensive analytics for forum performance and engagement
            </DialogDescription>
          </DialogHeader>
          
          {analytics && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analytics.overview.totalThreads}</div>
                      <div className="text-sm text-muted-foreground">Total Threads</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analytics.overview.totalPosts}</div>
                      <div className="text-sm text-muted-foreground">Total Posts</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analytics.overview.activeUsers}</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analytics.overview.engagementScore.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Engagement</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.content.contentGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="threads" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="posts" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.users.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newUsers" stroke="#8884d8" />
                        <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="returningUsers" stroke="#ffc658" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Moderation Queue</DialogTitle>
            <DialogDescription>
              Review and moderate flagged content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {moderationQueue.map((flag) => (
              <Card key={flag.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="destructive">{flag.reason}</Badge>
                        <Badge variant="outline">{flag.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Reported {formatTimeAgo(flag.reportedAt)}
                        </span>
                      </div>
                      <p className="text-sm mb-2">Reported by: {flag.reportedBy}</p>
                      {flag.notes && (
                        <p className="text-sm text-muted-foreground">{flag.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderateContent(flag.id, ModerationAction.NO_ACTION)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => moderateContent(flag.id, ModerationAction.DELETE)}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => moderateContent(flag.id, ModerationAction.WARNING)}
                      >
                        Warn User
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {moderationQueue.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No items in the moderation queue.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityForum;