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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

import { 
  Users, Star, Trophy, Target, Gift, Coins, Award, Medal, Crown,
  ThumbsUp, ThumbsDown, Heart, Flag, Share2, MessageCircle, Eye,
  Edit, Trash2, Plus, Search, Filter, MoreHorizontal, RefreshCw,
  TrendingUp, BarChart3, PieChart, Activity, Zap, Lightbulb,
  Brain, Sparkles, Wand2, Magic, Calendar, Clock, User, UserCheck,
  Settings, Download, Upload, ExternalLink, Link, Tag, Hash,
  FileText, File, Image, Video, Mic, Paperclip, Send, Reply,
  Forward, Archive, Bookmark, Pin, Bell, Mail, Phone, Globe,
  Building, MapPin, Verified, Shield, Lock, Unlock, AlertTriangle,
  CheckCircle, XCircle, Info, HelpCircle, BookOpen, GraduationCap,
  GamepadIcon, Gamepad2, Dices, Gem, Flame, Lightning
} from 'lucide-react';

import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadialBarChart,
  RadialBar, ComposedChart, ScatterChart, Scatter
} from 'recharts';

import { format, subDays, parseISO, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

// Import backend services
import { collaborationService } from '../../services/collaboration.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';

// Import types
import { CollaborationTeam, TeamMember } from '../../types/collaboration.types';

// ============================================================================
// CROWDSOURCING PLATFORM TYPES
// ============================================================================

interface CrowdsourcingCampaign {
  id: string;
  title: string;
  description: string;
  type: 'data_validation' | 'metadata_enrichment' | 'quality_assessment' | 'tagging' | 'documentation' | 'classification';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_by: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  target_participants: number;
  current_participants: number;
  completion_percentage: number;
  reward_system: RewardSystem;
  requirements: CampaignRequirement[];
  tasks: CrowdsourcingTask[];
  metrics: CampaignMetrics;
  tags: string[];
  visibility: 'public' | 'team' | 'private';
  approval_required: boolean;
  quality_threshold: number;
}

interface RewardSystem {
  type: 'points' | 'badges' | 'leaderboard' | 'monetary' | 'recognition';
  point_values: { [task_type: string]: number };
  badges: RewardBadge[];
  leaderboard_enabled: boolean;
  monetary_rewards: MonetaryReward[];
  recognition_levels: RecognitionLevel[];
}

interface RewardBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points_value: number;
}

interface MonetaryReward {
  task_type: string;
  amount: number;
  currency: string;
  conditions: string[];
}

interface RecognitionLevel {
  level: string;
  title: string;
  requirements: number;
  benefits: string[];
}

interface BadgeCriteria {
  task_count?: number;
  quality_score?: number;
  contribution_type?: string;
  streak_days?: number;
  special_achievement?: string;
}

interface CampaignRequirement {
  type: 'skill' | 'experience' | 'certification' | 'team_membership';
  description: string;
  required: boolean;
  verification_method: string;
}

interface CrowdsourcingTask {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  type: string;
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'reviewed' | 'approved' | 'rejected';
  assigned_to?: string;
  assigned_at?: string;
  completed_at?: string;
  target_asset: TaskTarget;
  instructions: TaskInstruction[];
  expected_deliverables: string[];
  quality_criteria: QualityCriteria[];
  estimated_time: number; // minutes
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reward_points: number;
  submissions: TaskSubmission[];
  reviews: TaskReview[];
  deadline?: string;
  dependencies: string[];
  metadata: Record<string, any>;
}

interface TaskTarget {
  type: 'asset' | 'column' | 'table' | 'schema' | 'document';
  id: string;
  name: string;
  context: Record<string, any>;
}

interface TaskInstruction {
  step: number;
  description: string;
  examples?: string[];
  resources?: TaskResource[];
}

interface TaskResource {
  type: 'document' | 'video' | 'link' | 'example';
  title: string;
  url: string;
  description: string;
}

interface QualityCriteria {
  criterion: string;
  description: string;
  weight: number;
  validation_method: 'manual' | 'automatic' | 'hybrid';
}

interface TaskSubmission {
  id: string;
  task_id: string;
  submitted_by: string;
  submitted_at: string;
  content: SubmissionContent;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  quality_score?: number;
  feedback?: string;
  attachments: SubmissionAttachment[];
  version: number;
}

interface SubmissionContent {
  type: string;
  data: Record<string, any>;
  confidence_score?: number;
  notes?: string;
}

interface SubmissionAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploaded_at: string;
}

interface TaskReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  reviewed_at: string;
  rating: number;
  feedback: string;
  criteria_scores: { [criterion: string]: number };
  recommendation: 'approve' | 'reject' | 'request_revision';
  comments: ReviewComment[];
}

interface ReviewComment {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  type: 'general' | 'suggestion' | 'question' | 'praise' | 'concern';
}

interface CampaignMetrics {
  total_tasks: number;
  completed_tasks: number;
  total_submissions: number;
  approved_submissions: number;
  average_quality_score: number;
  participant_engagement: number;
  completion_rate: number;
  time_to_completion: number;
  contributor_satisfaction: number;
}

interface ContributorProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  expertise_areas: string[];
  reputation_score: number;
  total_points: number;
  level: number;
  badges: EarnedBadge[];
  statistics: ContributorStats;
  preferences: ContributorPreferences;
  achievements: Achievement[];
  social_links: SocialLink[];
  verification_status: 'none' | 'email' | 'expert' | 'certified';
  last_active: string;
  joined_at: string;
}

interface EarnedBadge {
  badge_id: string;
  earned_at: string;
  campaign_id?: string;
  task_id?: string;
}

interface ContributorStats {
  tasks_completed: number;
  campaigns_participated: number;
  total_contributions: number;
  average_quality_score: number;
  streak_days: number;
  favorite_categories: string[];
  completion_rate: number;
  response_time: number;
  collaboration_score: number;
}

interface ContributorPreferences {
  notification_settings: NotificationSettings;
  task_preferences: TaskPreferences;
  privacy_settings: PrivacySettings;
  language: string;
  timezone: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  campaign_updates: boolean;
  task_assignments: boolean;
  achievement_alerts: boolean;
  weekly_digest: boolean;
}

interface TaskPreferences {
  preferred_types: string[];
  difficulty_range: [string, string];
  time_commitment: 'casual' | 'regular' | 'intensive';
  categories_of_interest: string[];
  auto_assign: boolean;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'team' | 'private';
  show_statistics: boolean;
  show_badges: boolean;
  show_leaderboard_position: boolean;
  allow_direct_messages: boolean;
}

interface Achievement {
  id: string;
  type: 'milestone' | 'special' | 'seasonal' | 'collaborative';
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  rarity: string;
  points_awarded: number;
}

interface SocialLink {
  platform: string;
  url: string;
  verified: boolean;
}

interface Leaderboard {
  id: string;
  type: 'global' | 'campaign' | 'category' | 'team';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  last_updated: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  metric_type: 'points' | 'tasks' | 'quality' | 'contributions';
  change_from_previous: number;
  badges_count: number;
  level: number;
}

interface CrowdsourcingAnalytics {
  overview: AnalyticsOverview;
  engagement: EngagementMetrics;
  quality: QualityMetrics;
  trends: TrendAnalytics;
  demographics: DemographicData;
  performance: PerformanceMetrics;
}

interface AnalyticsOverview {
  total_campaigns: number;
  active_campaigns: number;
  total_contributors: number;
  active_contributors: number;
  total_tasks: number;
  completed_tasks: number;
  total_submissions: number;
  approval_rate: number;
}

interface EngagementMetrics {
  daily_active_users: { date: string; count: number }[];
  session_duration: number;
  task_completion_rate: number;
  return_rate: number;
  engagement_score: number;
}

interface QualityMetrics {
  average_submission_quality: number;
  review_accuracy: number;
  inter_reviewer_agreement: number;
  quality_improvement_rate: number;
  rejection_rate: number;
}

interface TrendAnalytics {
  participation_trends: { period: string; participants: number }[];
  task_completion_trends: { period: string; completed: number }[];
  quality_trends: { period: string; quality: number }[];
  category_popularity: { category: string; participation: number }[];
}

interface DemographicData {
  expertise_distribution: { level: string; count: number }[];
  geographic_distribution: { region: string; count: number }[];
  experience_distribution: { range: string; count: number }[];
  activity_patterns: { hour: number; activity: number }[];
}

interface PerformanceMetrics {
  top_performers: { user_id: string; score: number }[];
  category_performance: { category: string; avg_quality: number }[];
  efficiency_metrics: { metric: string; value: number }[];
  reward_effectiveness: { reward_type: string; engagement_impact: number }[];
}

interface CrowdsourcingPlatformProps {
  className?: string;
  teamId?: string;
  userId?: string;
  mode?: 'contributor' | 'manager' | 'admin';
  onCampaignCreated?: (campaign: CrowdsourcingCampaign) => void;
  onTaskCompleted?: (task: CrowdsourcingTask, submission: TaskSubmission) => void;
  onAchievementEarned?: (achievement: Achievement) => void;
}

// Color schemes and constants
const CAMPAIGN_STATUS_COLORS = {
  draft: '#6b7280',
  active: '#10b981',
  paused: '#f59e0b',
  completed: '#3b82f6',
  cancelled: '#ef4444'
};

const TASK_STATUS_COLORS = {
  available: '#10b981',
  assigned: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#8b5cf6',
  reviewed: '#06b6d4',
  approved: '#059669',
  rejected: '#ef4444'
};

const DIFFICULTY_COLORS = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#f97316',
  expert: '#ef4444'
};

const RARITY_COLORS = {
  common: '#6b7280',
  uncommon: '#10b981',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b'
};

export default function CrowdsourcingPlatform({ 
  className, 
  teamId, 
  userId, 
  mode = 'contributor',
  onCampaignCreated, 
  onTaskCompleted,
  onAchievementEarned 
}: CrowdsourcingPlatformProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [campaigns, setCampaigns] = useState<CrowdsourcingCampaign[]>([]);
  const [tasks, setTasks] = useState<CrowdsourcingTask[]>([]);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [contributorProfile, setContributorProfile] = useState<ContributorProfile | null>(null);
  const [analytics, setAnalytics] = useState<CrowdsourcingAnalytics | null>(null);
  const [teams, setTeams] = useState<CollaborationTeam[]>([]);
  
  // UI States
  const [selectedCampaign, setSelectedCampaign] = useState<CrowdsourcingCampaign | null>(null);
  const [selectedTask, setSelectedTask] = useState<CrowdsourcingTask | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'created_at' | 'reward_points' | 'difficulty_level'>('created_at');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  
  // Form States
  const [newCampaign, setNewCampaign] = useState<Partial<CrowdsourcingCampaign>>({
    type: 'data_validation',
    status: 'draft',
    priority: 'medium',
    visibility: 'public',
    approval_required: true,
    quality_threshold: 0.8,
    tags: []
  });
  const [taskSubmission, setTaskSubmission] = useState<Partial<SubmissionContent>>({});
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  
  // Real-time States
  const [liveUpdates, setLiveUpdates] = useState<Map<string, boolean>>(new Map());
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadCrowdsourcingData();
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

  const loadCrowdsourcingData = async () => {
    setLoading(true);
    try {
      // Load crowdsourcing campaigns from backend
      const campaignsResponse = await collaborationService.getCrowdsourcingCampaigns({
        teamId: teamId,
        includeMetrics: true,
        includeTasks: true,
        limit: 100
      });
      const campaignsData = campaignsResponse.data || [];
      
      // Load available tasks from backend
      const tasksResponse = await collaborationService.getCrowdsourcingTasks({
        userId: userId,
        status: ['available', 'assigned', 'in_progress'],
        includeSubmissions: true,
        limit: 200
      });
      const tasksData = tasksResponse.data || [];
      
      // Load leaderboards from backend
      const leaderboardsResponse = await collaborationService.getLeaderboards({
        types: ['global', 'campaign', 'category'],
        timeframes: ['weekly', 'monthly', 'all_time'],
        limit: 10
      });
      const leaderboardsData = leaderboardsResponse.data || [];
      
      // Load contributor profile from backend
      if (userId) {
        const profileResponse = await collaborationService.getContributorProfile(userId);
        const profileData = profileResponse.data;
        setContributorProfile(profileData);
      }
      
      // Load crowdsourcing analytics from backend
      const analyticsResponse = await collaborationService.getCrowdsourcingAnalytics({
        teamId: teamId,
        timeRange: { from: subDays(new Date(), 30), to: new Date() },
        includeDetailedMetrics: true
      });
      const analyticsData = analyticsResponse.data;
      
      // Load collaboration teams from backend
      const teamsResponse = await collaborationService.getCollaborationTeams({
        includeMembers: true,
        limit: 20
      });
      const teamsData = teamsResponse.data || [];
      
      setCampaigns(campaignsData);
      setTasks(tasksData);
      setLeaderboards(leaderboardsData);
      setAnalytics(analyticsData);
      setTeams(teamsData);
      
    } catch (err) {
      setError('Failed to load crowdsourcing data from backend');
      console.error('Error loading crowdsourcing data:', err);
      
      // Fallback to empty states
      setCampaigns([]);
      setTasks([]);
      setLeaderboards([]);
      setContributorProfile(null);
      setAnalytics(null);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadCrowdsourcingData();
    }, 30000);
    
    // WebSocket connection for real-time updates
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/crowdsourcing/${teamId || 'global'}`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };
      
      ws.current.onopen = () => {
        console.log('Crowdsourcing WebSocket connected');
        // Join crowdsourcing room
        ws.current?.send(JSON.stringify({
          type: 'join_room',
          teamId: teamId,
          userId: userId
        }));
      };
      
      ws.current.onerror = (error) => {
        console.error('Crowdsourcing WebSocket error:', error);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'campaign_created':
        setCampaigns(prev => [data.campaign, ...prev]);
        setLiveUpdates(prev => new Map(prev.set(data.campaign.id, true)));
        break;
      case 'campaign_updated':
        setCampaigns(prev => prev.map(camp => 
          camp.id === data.campaign.id ? { ...camp, ...data.campaign } : camp
        ));
        break;
      case 'task_assigned':
        setTasks(prev => prev.map(task => 
          task.id === data.task.id ? { ...task, ...data.task } : task
        ));
        break;
      case 'task_completed':
        setTasks(prev => prev.map(task => 
          task.id === data.task.id ? { ...task, ...data.task } : task
        ));
        onTaskCompleted?.(data.task, data.submission);
        break;
      case 'achievement_earned':
        if (contributorProfile && data.userId === userId) {
          setContributorProfile(prev => prev ? {
            ...prev,
            achievements: [...prev.achievements, data.achievement]
          } : prev);
          onAchievementEarned?.(data.achievement);
        }
        break;
      case 'leaderboard_updated':
        setLeaderboards(prev => prev.map(board => 
          board.id === data.leaderboard.id ? data.leaderboard : board
        ));
        break;
      case 'notification_received':
        setNotifications(prev => [data.notification, ...prev]);
        break;
    }
  };

  // Campaign Management Functions
  const createCampaign = async (campaignData: Partial<CrowdsourcingCampaign>) => {
    try {
      setIsCreatingCampaign(true);
      
      const createRequest = {
        title: campaignData.title || '',
        description: campaignData.description || '',
        type: campaignData.type || 'data_validation',
        category: campaignData.category || '',
        priority: campaignData.priority || 'medium',
        startDate: campaignData.start_date || new Date().toISOString(),
        endDate: campaignData.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetParticipants: campaignData.target_participants || 10,
        rewardSystem: campaignData.reward_system || {},
        requirements: campaignData.requirements || [],
        tags: campaignData.tags || [],
        visibility: campaignData.visibility || 'public',
        approvalRequired: campaignData.approval_required || true,
        qualityThreshold: campaignData.quality_threshold || 0.8,
        createdBy: userId || '',
        teamId: teamId
      };
      
      const response = await collaborationService.createCrowdsourcingCampaign(createRequest);
      const newCampaign = response.data;
      
      setCampaigns(prev => [newCampaign, ...prev]);
      setShowCreateDialog(false);
      setNewCampaign({
        type: 'data_validation',
        status: 'draft',
        priority: 'medium',
        visibility: 'public',
        approval_required: true,
        quality_threshold: 0.8,
        tags: []
      });
      
      onCampaignCreated?.(newCampaign);
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'campaign_created',
        campaign: newCampaign
      }));
      
    } catch (err) {
      setError('Failed to create campaign via backend');
      console.error('Campaign creation error:', err);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Task Management Functions
  const assignTask = async (taskId: string) => {
    try {
      const assignRequest = {
        taskId,
        userId: userId || '',
        assignedAt: new Date().toISOString()
      };
      
      const response = await collaborationService.assignCrowdsourcingTask(assignRequest);
      const updatedTask = response.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'task_assigned',
        task: updatedTask
      }));
      
    } catch (err) {
      setError('Failed to assign task via backend');
      console.error('Task assignment error:', err);
    }
  };

  const submitTask = async (taskId: string, submissionData: Partial<SubmissionContent>, files: File[] = []) => {
    try {
      setIsSubmittingTask(true);
      
      // Upload files first if any
      let attachments: SubmissionAttachment[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const uploadRequest = {
            file: file,
            taskId: taskId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          };
          
          const response = await collaborationService.uploadTaskAttachment(uploadRequest);
          return response.data;
        });
        
        attachments = await Promise.all(uploadPromises);
      }
      
      const submitRequest = {
        taskId,
        submittedBy: userId || '',
        content: submissionData,
        attachments,
        submittedAt: new Date().toISOString()
      };
      
      const response = await collaborationService.submitCrowdsourcingTask(submitRequest);
      const submission = response.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, submissions: [...task.submissions, submission], status: 'completed' }
          : task
      ));
      
      setShowTaskDialog(false);
      setTaskSubmission({});
      setSubmissionFiles([]);
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'task_completed',
        task: tasks.find(t => t.id === taskId),
        submission
      }));
      
    } catch (err) {
      setError('Failed to submit task via backend');
      console.error('Task submission error:', err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Utility Functions
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesType = filterType === 'all' || campaign.type === filterType;
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      const matchesSearch = !searchTerm || 
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [campaigns, filterType, filterStatus, searchTerm]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesType = filterType === 'all' || task.type === filterType;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesDifficulty = filterDifficulty === 'all' || task.difficulty_level === filterDifficulty;
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesDifficulty && matchesSearch;
    });
  }, [tasks, filterType, filterStatus, filterDifficulty, searchTerm]);

  const getStatusColor = (status: string, type: 'campaign' | 'task') => {
    if (type === 'campaign') {
      return CAMPAIGN_STATUS_COLORS[status as keyof typeof CAMPAIGN_STATUS_COLORS] || '#6b7280';
    } else {
      return TASK_STATUS_COLORS[status as keyof typeof TASK_STATUS_COLORS] || '#6b7280';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || '#6b7280';
  };

  const getRarityColor = (rarity: string) => {
    return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#6b7280';
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'default';
      case 'assigned':
      case 'in_progress':
      case 'under_review':
        return 'secondary';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      case 'paused':
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Render Functions
  const renderCampaignCard = (campaign: CrowdsourcingCampaign) => (
    <Card key={campaign.id} className={cn(
      "transition-all duration-200 hover:shadow-lg cursor-pointer",
      liveUpdates.get(campaign.id) && "ring-2 ring-green-500 animate-pulse"
    )} onClick={() => setSelectedCampaign(campaign)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={getStatusBadgeVariant(campaign.status)}
                style={{ backgroundColor: getStatusColor(campaign.status, 'campaign') }}
              >
                {campaign.status}
              </Badge>
              <Badge variant="outline">{campaign.type.replace('_', ' ')}</Badge>
              <Badge variant="secondary">{campaign.priority}</Badge>
              {campaign.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-lg mb-1">{campaign.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {campaign.description}
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
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" />
                Join Campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(campaign.completion_percentage)}%</span>
            </div>
            <Progress value={campaign.completion_percentage} className="h-2" />
          </div>
          
          {/* Participants */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Participants</span>
            </div>
            <span className="font-medium">
              {campaign.current_participants} / {campaign.target_participants}
            </span>
          </div>
          
          {/* Rewards */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>Points Available</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-orange-500" />
              <span>{campaign.reward_system.badges?.length || 0} Badges</span>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="text-xs text-muted-foreground">
            Ends {formatTimeAgo(campaign.end_date)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTaskCard = (task: CrowdsourcingTask) => (
    <Card key={task.id} className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={getStatusBadgeVariant(task.status)}
                style={{ backgroundColor: getStatusColor(task.status, 'task') }}
              >
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: getDifficultyColor(task.difficulty_level),
                  color: getDifficultyColor(task.difficulty_level)
                }}
              >
                {task.difficulty_level}
              </Badge>
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-medium">{task.reward_points}</span>
              </div>
            </div>
            <CardTitle className="text-base mb-1">{task.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {task.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {task.estimated_time}m
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Target Asset */}
          <div className="p-2 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Target</div>
            <div className="text-sm font-medium">{task.target_asset.name}</div>
            <div className="text-xs text-muted-foreground">{task.target_asset.type}</div>
          </div>
          
          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Due {formatTimeAgo(task.deadline)}
              </span>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {task.status === 'available' && (
              <Button 
                size="sm" 
                onClick={() => assignTask(task.id)}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Take Task
              </Button>
            )}
            {task.status === 'assigned' && task.assigned_to === userId && (
              <Button 
                size="sm" 
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskDialog(true);
                }}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Submit Work
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCampaignsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="data_validation">Data Validation</SelectItem>
              <SelectItem value="metadata_enrichment">Metadata Enrichment</SelectItem>
              <SelectItem value="quality_assessment">Quality Assessment</SelectItem>
              <SelectItem value="tagging">Tagging</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="classification">Classification</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadCrowdsourcingData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          {mode !== 'contributor' && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Campaigns Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No campaigns match your current filters' 
                : 'Start contributing to data curation campaigns'}
            </p>
            {mode !== 'contributor' && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            )}
          </div>
        ) : (
          filteredCampaigns.map(renderCampaignCard)
        )}
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadCrowdsourcingData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' || filterDifficulty !== 'all' 
                ? 'No tasks match your current filters' 
                : 'No tasks are currently available'}
            </p>
          </div>
        ) : (
          filteredTasks.map(renderTaskCard)
        )}
      </div>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      {leaderboards.map((leaderboard) => (
        <Card key={leaderboard.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {leaderboard.type} Leaderboard - {leaderboard.timeframe}
            </CardTitle>
            <CardDescription>
              Last updated {formatTimeAgo(leaderboard.last_updated)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.entries.slice(0, 10).map((entry) => (
                <div key={entry.user_id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      entry.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                      entry.rank === 2 ? "bg-gray-100 text-gray-800" :
                      entry.rank === 3 ? "bg-orange-100 text-orange-800" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {entry.rank}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.avatar_url} />
                      <AvatarFallback>{entry.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{entry.display_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Level {entry.level} • {entry.badges_count} badges
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-bold">{entry.score.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.change_from_previous >= 0 ? '+' : ''}{entry.change_from_previous}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading crowdsourcing platform...</p>
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
              <Users className="w-8 h-8 text-blue-500" />
              Crowdsourcing Platform
            </h1>
            <p className="text-muted-foreground">
              Collaborative data curation with community-driven improvements, gamification, and incentive systems
            </p>
          </div>
          <div className="flex items-center gap-2">
            {contributorProfile && (
              <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={contributorProfile.avatar_url} />
                  <AvatarFallback>{contributorProfile.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{contributorProfile.display_name}</div>
                  <div className="text-muted-foreground">
                    Level {contributorProfile.level} • {contributorProfile.total_points} points
                  </div>
                </div>
              </div>
            )}
            <Button variant="outline" onClick={loadCrowdsourcingData} disabled={loading}>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            {renderCampaignsTab()}
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            {renderTasksTab()}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            {renderLeaderboardTab()}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Contributor Profile</h3>
              <p className="text-muted-foreground">Profile management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Platform Analytics</h3>
              <p className="text-muted-foreground">Analytics and insights features coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Crowdsourcing Campaign</DialogTitle>
              <DialogDescription>
                Launch a new campaign to engage the community in data curation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newCampaign.title || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter campaign title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={newCampaign.type || ''} 
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_validation">Data Validation</SelectItem>
                      <SelectItem value="metadata_enrichment">Metadata Enrichment</SelectItem>
                      <SelectItem value="quality_assessment">Quality Assessment</SelectItem>
                      <SelectItem value="tagging">Tagging</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="classification">Classification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newCampaign.description || ''}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the campaign objectives and goals..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={newCampaign.priority || ''} 
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Participants</Label>
                  <Input
                    type="number"
                    value={newCampaign.target_participants || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, target_participants: parseInt(e.target.value) }))}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quality Threshold</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={newCampaign.quality_threshold || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, quality_threshold: parseFloat(e.target.value) }))}
                    placeholder="0.8"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createCampaign(newCampaign)} 
                disabled={isCreatingCampaign || !newCampaign.title}
              >
                {isCreatingCampaign ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Submission Dialog */}
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Task</DialogTitle>
              <DialogDescription>
                Submit your work for: {selectedTask?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Submission Content</Label>
                <Textarea
                  value={taskSubmission.notes || ''}
                  onChange={(e) => setTaskSubmission(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe your submission and findings..."
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Confidence Score (0-1)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={taskSubmission.confidence_score || ''}
                  onChange={(e) => setTaskSubmission(prev => ({ ...prev, confidence_score: parseFloat(e.target.value) }))}
                  placeholder="0.9"
                />
              </div>
              <div className="space-y-2">
                <Label>Attachments</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => submitTask(selectedTask?.id || '', taskSubmission, submissionFiles)} 
                disabled={isSubmittingTask || !taskSubmission.notes}
              >
                {isSubmittingTask ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}