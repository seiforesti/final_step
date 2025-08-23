"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
  Tabs, TabsContent, TabsList, TabsTrigger, Badge, Avatar, AvatarFallback, AvatarImage, ScrollArea, Separator,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
  Switch, Slider, Progress, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Popover, PopoverContent, PopoverTrigger, Alert, AlertDescription, AlertTitle,
  ResizablePanelGroup, ResizablePanel, ResizableHandle
} from '@/components/ui';
import { BarChart3, PieChart, LineChart, TrendingUp, TrendingDown, Activity, Users, MessageCircle, Clock, Calendar, Target, Award, Trophy, Medal, Crown, Zap, Brain, Lightbulb, Eye, ThumbsUp, Share, Download, Upload, Settings, Filter, Search, RefreshCw, Bell, BellOff, Plus, Edit, Trash2, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, X, Check, CheckCircle, AlertTriangle, Info, HelpCircle, Loader2, Star, Heart, Bookmark, Flag, Copy, ExternalLink, FileText, Folder, FolderOpen, Tag, Tags, Globe, Building, Factory, Briefcase, GraduationCap, BookMarked, Library, Database, Server, Cloud, Cpu, Monitor, Smartphone, Tablet, Laptop, MousePointer, Hand, Grab, Move, CornerDownRight, Maximize2, Minimize2, RotateCcw, Play, Pause, StopCircle, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Phone, Video, Navigation, Compass, Map, Route, Microscope, FlaskConical, Beaker, Atom, Dna, Type, Palette, Layers, Grid, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { usePipelineManager } from '../../hooks/usePipelineManager';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Analytics Types
interface CollaborationMetrics {
  id: string;
  workspaceId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retainedUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalDocuments: number;
  documentsCreated: number;
  documentsEdited: number;
  documentsShared: number;
  totalComments: number;
  totalMessages: number;
  totalMeetings: number;
  meetingDuration: number;
  collaborationScore: number;
  engagementRate: number;
  productivityIndex: number;
  knowledgeShareRate: number;
  expertConsultations: number;
  learningPathsCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserAnalytics {
  userId: string;
  userName: string;
  userAvatar: string;
  role: string;
  department: string;
  joinDate: Date;
  lastActiveDate: Date;
  totalSessions: number;
  totalTimeSpent: number;
  documentsCreated: number;
  documentsEdited: number;
  commentsPosted: number;
  messagesExchanged: number;
  meetingsAttended: number;
  knowledgeArticlesRead: number;
  knowledgeArticlesCreated: number;
  expertConsultationsRequested: number;
  expertConsultationsProvided: number;
  collaborationScore: number;
  productivityScore: number;
  knowledgeScore: number;
  engagementLevel: 'low' | 'medium' | 'high' | 'very_high';
  trendDirection: 'up' | 'down' | 'stable';
  achievements: string[];
  skills: string[];
  interests: string[];
}

interface TeamAnalytics {
  teamId: string;
  teamName: string;
  memberCount: number;
  averageCollaborationScore: number;
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  totalDocuments: number;
  sharedDocuments: number;
  totalMeetings: number;
  averageMeetingDuration: number;
  knowledgeShareRate: number;
  crossTeamCollaboration: number;
  performanceMetrics: TeamPerformanceMetrics;
  collaborationPatterns: CollaborationPattern[];
  topContributors: UserAnalytics[];
  recentActivities: TeamActivity[];
}

interface TeamPerformanceMetrics {
  efficiency: number;
  quality: number;
  innovation: number;
  communication: number;
  knowledgeSharing: number;
  problemSolving: number;
  adaptability: number;
  leadership: number;
}

interface CollaborationPattern {
  type: 'document_sharing' | 'meeting_frequency' | 'communication' | 'knowledge_exchange';
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  participants: string[];
  timeDistribution: { [hour: string]: number };
  dayDistribution: { [day: string]: number };
  seasonalTrends: { [month: string]: number };
}

interface TeamActivity {
  id: string;
  type: 'document_created' | 'meeting_held' | 'knowledge_shared' | 'collaboration_initiated';
  description: string;
  participants: string[];
  timestamp: Date;
  impact: 'low' | 'medium' | 'high';
  category: string;
}

interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  teamMembers: string[];
  collaborationMetrics: ProjectCollaborationMetrics;
  milestones: ProjectMilestone[];
  riskFactors: ProjectRisk[];
  recommendations: ProjectRecommendation[];
}

interface ProjectCollaborationMetrics {
  totalInteractions: number;
  documentCollaborations: number;
  meetingFrequency: number;
  knowledgeExchanges: number;
  decisionMakingSpeed: number;
  conflictResolution: number;
  stakeholderEngagement: number;
  crossFunctionalCollaboration: number;
}

interface ProjectMilestone {
  id: string;
  name: string;
  targetDate: Date;
  completionDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  collaborationIntensity: number;
  keyContributors: string[];
}

interface ProjectRisk {
  id: string;
  type: 'communication' | 'collaboration' | 'knowledge_gap' | 'resource' | 'timeline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
}

interface ProjectRecommendation {
  id: string;
  type: 'process_improvement' | 'tool_adoption' | 'skill_development' | 'team_restructure';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  timeline: string;
}

interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'achievement';
  severity: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description: string;
  metrics: { [key: string]: number };
  recommendations: string[];
  affectedEntities: string[];
  confidence: number;
  createdAt: Date;
  isActionable: boolean;
  hasBeenActedUpon: boolean;
}

interface CollaborationAnalyticsState {
  overallMetrics: CollaborationMetrics | null;
  userAnalytics: UserAnalytics[];
  teamAnalytics: TeamAnalytics[];
  projectAnalytics: ProjectAnalytics[];
  insights: AnalyticsInsight[];
  selectedTimeRange: string;
  selectedMetric: string;
  selectedEntity: 'users' | 'teams' | 'projects' | 'overall';
  filters: AnalyticsFilters;
  isLoading: boolean;
  error: string | null;
}

interface AnalyticsFilters {
  department: string;
  role: string;
  team: string;
  project: string;
  dateRange: { start: Date; end: Date };
  metricType: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const chartVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

export const CollaborationAnalytics: React.FC = () => {
  const {
    collaborationHubs, participants, getCollaborationAnalytics, getTeamInsights,
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

  const [analyticsState, setAnalyticsState] = useState<CollaborationAnalyticsState>({
    overallMetrics: null, userAnalytics: [], teamAnalytics: [], projectAnalytics: [], insights: [],
    selectedTimeRange: 'monthly', selectedMetric: 'collaboration_score', selectedEntity: 'overall',
    filters: {
      department: 'all', role: 'all', team: 'all', project: 'all',
      dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      metricType: 'all'
    },
    isLoading: false, error: null
  });

  const [selectedView, setSelectedView] = useState<'overview' | 'users' | 'teams' | 'projects' | 'insights'>('overview');
  const [showInsightDialog, setShowInsightDialog] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AnalyticsInsight | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const insightsPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAnalytics();
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [analyticsState.selectedTimeRange, analyticsState.filters]);

  const initializeAnalytics = async () => {
    try {
      setAnalyticsState(prev => ({ ...prev, isLoading: true }));
      await Promise.all([
        loadOverallMetrics(),
        loadUserAnalytics(),
        loadTeamAnalytics(),
        loadProjectAnalytics(),
        loadAnalyticsInsights()
      ]);
      
      trackActivity({
        type: 'collaboration_analytics_initialized', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { component: 'CollaborationAnalytics', workspace: activeWorkspace?.id }
      });
      
      setAnalyticsState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to initialize collaboration analytics:', error);
      setAnalyticsState(prev => ({ ...prev, isLoading: false, error: 'Failed to initialize analytics' }));
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const analyticsData = await getCollaborationAnalytics({
        timeRange: analyticsState.selectedTimeRange, includeUsers: true, includeTeams: true,
        includeProjects: true, includeInsights: true, filters: analyticsState.filters
      });
      
      // Process and update analytics data
      await Promise.all([
        loadOverallMetrics(),
        loadUserAnalytics(),
        loadTeamAnalytics(),
        loadProjectAnalytics(),
        loadAnalyticsInsights()
      ]);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const loadOverallMetrics = async () => {
    try {
      const metrics = await generateMockOverallMetrics();
      setAnalyticsState(prev => ({ ...prev, overallMetrics: metrics }));
    } catch (error) {
      console.error('Failed to load overall metrics:', error);
    }
  };

  const loadUserAnalytics = async () => {
    try {
      const userAnalytics = await generateMockUserAnalytics();
      setAnalyticsState(prev => ({ ...prev, userAnalytics }));
    } catch (error) {
      console.error('Failed to load user analytics:', error);
    }
  };

  const loadTeamAnalytics = async () => {
    try {
      const teamAnalytics = await generateMockTeamAnalytics();
      setAnalyticsState(prev => ({ ...prev, teamAnalytics }));
    } catch (error) {
      console.error('Failed to load team analytics:', error);
    }
  };

  const loadProjectAnalytics = async () => {
    try {
      const projectAnalytics = await generateMockProjectAnalytics();
      setAnalyticsState(prev => ({ ...prev, projectAnalytics }));
    } catch (error) {
      console.error('Failed to load project analytics:', error);
    }
  };

  const loadAnalyticsInsights = async () => {
    try {
      const insights = await generateMockInsights();
      setAnalyticsState(prev => ({ ...prev, insights }));
    } catch (error) {
      console.error('Failed to load analytics insights:', error);
    }
  };

  const generateMockOverallMetrics = async (): Promise<CollaborationMetrics> => {
    return {
      id: 'overall-metrics', workspaceId: activeWorkspace?.id || '', period: 'monthly',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: new Date(),
      totalUsers: 247, activeUsers: 189, newUsers: 23, retainedUsers: 166,
      totalSessions: 1456, averageSessionDuration: 42, totalDocuments: 892,
      documentsCreated: 156, documentsEdited: 423, documentsShared: 234,
      totalComments: 2341, totalMessages: 5678, totalMeetings: 89,
      meetingDuration: 2340, collaborationScore: 8.7, engagementRate: 76.3,
      productivityIndex: 82.1, knowledgeShareRate: 68.9, expertConsultations: 45,
      learningPathsCompleted: 78, createdAt: new Date(), updatedAt: new Date()
    };
  };

  const generateMockUserAnalytics = async (): Promise<UserAnalytics[]> => {
    const users: UserAnalytics[] = [];
    const roles = ['Developer', 'Designer', 'Manager', 'Analyst', 'Architect'];
    const departments = ['Engineering', 'Design', 'Product', 'Data', 'Marketing'];
    const engagementLevels = ['low', 'medium', 'high', 'very_high'];
    const trends = ['up', 'down', 'stable'];

    for (let i = 0; i < 50; i++) {
      users.push({
        userId: `user-${i}`, userName: `User ${i + 1}`, userAvatar: `/avatars/user-${i}.jpg`,
        role: roles[Math.floor(Math.random() * roles.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActiveDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        totalSessions: Math.floor(Math.random() * 100) + 20,
        totalTimeSpent: Math.floor(Math.random() * 10000) + 1000,
        documentsCreated: Math.floor(Math.random() * 50) + 5,
        documentsEdited: Math.floor(Math.random() * 100) + 10,
        commentsPosted: Math.floor(Math.random() * 200) + 20,
        messagesExchanged: Math.floor(Math.random() * 500) + 50,
        meetingsAttended: Math.floor(Math.random() * 30) + 5,
        knowledgeArticlesRead: Math.floor(Math.random() * 100) + 10,
        knowledgeArticlesCreated: Math.floor(Math.random() * 20) + 2,
        expertConsultationsRequested: Math.floor(Math.random() * 10) + 1,
        expertConsultationsProvided: Math.floor(Math.random() * 15) + 2,
        collaborationScore: 5 + Math.random() * 5,
        productivityScore: 5 + Math.random() * 5,
        knowledgeScore: 5 + Math.random() * 5,
        engagementLevel: engagementLevels[Math.floor(Math.random() * engagementLevels.length)] as any,
        trendDirection: trends[Math.floor(Math.random() * trends.length)] as any,
        achievements: ['First Collaborator', 'Knowledge Sharer', 'Team Player'],
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
        interests: ['Web Development', 'Machine Learning', 'Cloud Architecture']
      });
    }

    return users;
  };

  const generateMockTeamAnalytics = async (): Promise<TeamAnalytics[]> => {
    const teams: TeamAnalytics[] = [];
    const teamNames = ['Frontend Team', 'Backend Team', 'Data Science Team', 'Design Team', 'DevOps Team'];

    for (let i = 0; i < teamNames.length; i++) {
      teams.push({
        teamId: `team-${i}`, teamName: teamNames[i], memberCount: 8 + Math.floor(Math.random() * 12),
        averageCollaborationScore: 6 + Math.random() * 4, totalProjects: Math.floor(Math.random() * 20) + 5,
        completedProjects: Math.floor(Math.random() * 15) + 3, ongoingProjects: Math.floor(Math.random() * 8) + 2,
        totalDocuments: Math.floor(Math.random() * 200) + 50, sharedDocuments: Math.floor(Math.random() * 150) + 30,
        totalMeetings: Math.floor(Math.random() * 50) + 20, averageMeetingDuration: 30 + Math.random() * 60,
        knowledgeShareRate: 60 + Math.random() * 40, crossTeamCollaboration: 40 + Math.random() * 60,
        performanceMetrics: {
          efficiency: 70 + Math.random() * 30, quality: 75 + Math.random() * 25,
          innovation: 60 + Math.random() * 40, communication: 80 + Math.random() * 20,
          knowledgeSharing: 65 + Math.random() * 35, problemSolving: 70 + Math.random() * 30,
          adaptability: 60 + Math.random() * 40, leadership: 55 + Math.random() * 45
        },
        collaborationPatterns: [], topContributors: [], recentActivities: []
      });
    }

    return teams;
  };

  const generateMockProjectAnalytics = async (): Promise<ProjectAnalytics[]> => {
    const projects: ProjectAnalytics[] = [];
    const projectNames = ['Website Redesign', 'Mobile App', 'Data Pipeline', 'API Gateway', 'ML Platform'];
    const statuses = ['planning', 'active', 'completed', 'on_hold'];

    for (let i = 0; i < projectNames.length; i++) {
      projects.push({
        projectId: `project-${i}`, projectName: projectNames[i],
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        startDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        endDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000) : undefined,
        teamMembers: Array.from({ length: 5 + Math.floor(Math.random() * 8) }, (_, j) => `user-${j}`),
        collaborationMetrics: {
          totalInteractions: Math.floor(Math.random() * 1000) + 200,
          documentCollaborations: Math.floor(Math.random() * 100) + 20,
          meetingFrequency: Math.floor(Math.random() * 20) + 5,
          knowledgeExchanges: Math.floor(Math.random() * 50) + 10,
          decisionMakingSpeed: 60 + Math.random() * 40,
          conflictResolution: 70 + Math.random() * 30,
          stakeholderEngagement: 50 + Math.random() * 50,
          crossFunctionalCollaboration: 40 + Math.random() * 60
        },
        milestones: [], riskFactors: [], recommendations: []
      });
    }

    return projects;
  };

  const generateMockInsights = async (): Promise<AnalyticsInsight[]> => {
    const insights: AnalyticsInsight[] = [];
    const types = ['trend', 'anomaly', 'opportunity', 'risk', 'achievement'];
    const severities = ['info', 'warning', 'success', 'error'];

    for (let i = 0; i < 10; i++) {
      insights.push({
        id: `insight-${i}`,
        type: types[Math.floor(Math.random() * types.length)] as any,
        severity: severities[Math.floor(Math.random() * severities.length)] as any,
        title: `Collaboration Insight ${i + 1}`,
        description: `This is an important insight about collaboration patterns and performance metrics.`,
        metrics: { collaborationScore: 8.5, engagementRate: 76.3, productivityIndex: 82.1 },
        recommendations: ['Increase team communication', 'Implement knowledge sharing sessions', 'Optimize meeting frequency'],
        affectedEntities: ['Frontend Team', 'Backend Team', 'Project Alpha'],
        confidence: 80 + Math.random() * 20,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        isActionable: Math.random() > 0.3,
        hasBeenActedUpon: Math.random() > 0.7
      });
    }

    return insights;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold">{analyticsState.overallMetrics?.activeUsers || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    +{analyticsState.overallMetrics?.newUsers || 0} new this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Collaboration Score</p>
                  <p className="text-2xl font-bold">{analyticsState.overallMetrics?.collaborationScore.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(analyticsState.overallMetrics?.engagementRate || 0)} engagement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Documents</p>
                  <p className="text-2xl font-bold">{analyticsState.overallMetrics?.totalDocuments || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {analyticsState.overallMetrics?.documentsShared || 0} shared
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Meetings</p>
                  <p className="text-2xl font-bold">{analyticsState.overallMetrics?.totalMeetings || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(analyticsState.overallMetrics?.meetingDuration || 0)} total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={chartVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Collaboration trend chart would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={chartVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsState.teamAnalytics.slice(0, 5).map((team, index) => (
                  <div key={team.teamId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{team.teamName}</p>
                        <p className="text-sm text-muted-foreground">{team.memberCount} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{team.averageCollaborationScore.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsState.insights.slice(0, 3).map((insight) => (
                <Alert key={insight.id} className={getInsightSeverityColor(insight.severity)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{insight.title}</AlertTitle>
                  <AlertDescription className="mt-2">
                    {insight.description}
                    <Button variant="link" className="p-0 h-auto ml-2" 
                      onClick={() => { setSelectedInsight(insight); setShowInsightDialog(true); }}>
                      View Details
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderUserAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsState.userAnalytics.slice(0, 12).map((user) => (
          <motion.div key={user.userId} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.userAvatar} />
                      <AvatarFallback>{user.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{user.userName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.role} • {user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(user.trendDirection)}
                    <Badge className={getEngagementColor(user.engagementLevel)}>
                      {user.engagementLevel.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold">{user.collaborationScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Collaboration</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{user.productivityScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Productivity</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{user.knowledgeScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Knowledge</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Documents Created:</span>
                      <span className="font-medium">{user.documentsCreated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comments Posted:</span>
                      <span className="font-medium">{user.commentsPosted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meetings Attended:</span>
                      <span className="font-medium">{user.meetingsAttended}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTeamAnalytics = () => (
    <div className="space-y-6">
      {analyticsState.teamAnalytics.map((team) => (
        <motion.div key={team.teamId} variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{team.teamName}</CardTitle>
                  <p className="text-muted-foreground">{team.memberCount} members • {team.ongoingProjects} active projects</p>
                </div>
                <Badge variant="outline">{team.averageCollaborationScore.toFixed(1)} avg score</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-2">
                    {Object.entries(team.performanceMetrics).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={value} className="w-16 h-2" />
                          <span className="text-sm font-medium w-8">{Math.round(value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Project Stats</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Projects:</span>
                      <span className="font-medium">{team.totalProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium">{team.completedProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongoing:</span>
                      <span className="font-medium">{team.ongoingProjects}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Collaboration</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Documents:</span>
                      <span className="font-medium">{team.totalDocuments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shared:</span>
                      <span className="font-medium">{team.sharedDocuments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meetings:</span>
                      <span className="font-medium">{team.totalMeetings}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Knowledge Sharing</h4>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatPercentage(team.knowledgeShareRate)}</div>
                    <p className="text-sm text-muted-foreground">Share Rate</p>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-lg font-semibold">{formatPercentage(team.crossTeamCollaboration)}</div>
                    <p className="text-xs text-muted-foreground">Cross-team</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-4">
      {analyticsState.insights.map((insight) => (
        <motion.div key={insight.id} variants={itemVariants}>
          <Alert className={getInsightSeverityColor(insight.severity)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{insight.title}</AlertTitle>
                  <Badge variant="secondary">{insight.type}</Badge>
                  <Badge variant="outline">{Math.round(insight.confidence)}% confidence</Badge>
                </div>
                <AlertDescription>
                  <p className="mb-2">{insight.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {insight.affectedEntities.map((entity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{entity}</Badge>
                    ))}
                  </div>
                  {insight.recommendations.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-sm mb-1">Recommendations:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {insight.isActionable && !insight.hasBeenActedUpon && (
                  <Button size="sm">Take Action</Button>
                )}
                <Button variant="outline" size="sm" 
                  onClick={() => { setSelectedInsight(insight); setShowInsightDialog(true); }}>
                  Details
                </Button>
              </div>
            </div>
          </Alert>
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
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Collaboration Analytics</h1>
                <p className="text-muted-foreground">Insights and metrics for team collaboration and productivity</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={analyticsState.selectedTimeRange}
                onValueChange={(value) => setAnalyticsState(prev => ({ ...prev, selectedTimeRange: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => setShowExportDialog(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export
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
                    Configure Filters
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Alert Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Analytics Preferences
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
            <TabsList>
              <TabsTrigger value="overview">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Trophy className="h-4 w-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="projects">
                <Target className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Brain className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-6">
            {analyticsState.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {selectedView === 'overview' && renderOverviewDashboard()}
                {selectedView === 'users' && renderUserAnalytics()}
                {selectedView === 'teams' && renderTeamAnalytics()}
                {selectedView === 'projects' && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Project Analytics</h3>
                    <p className="text-muted-foreground">Detailed project collaboration metrics coming soon</p>
                  </div>
                )}
                {selectedView === 'insights' && renderInsights()}
              </>
            )}
          </ScrollArea>
        </div>
        
        <Dialog open={showInsightDialog} onOpenChange={setShowInsightDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedInsight?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedInsight && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className={getInsightSeverityColor(selectedInsight.severity)}>
                    {selectedInsight.type}
                  </Badge>
                  <Badge variant="outline">{Math.round(selectedInsight.confidence)}% confidence</Badge>
                </div>
                
                <p className="text-muted-foreground">{selectedInsight.description}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Affected Entities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInsight.affectedEntities.map((entity, index) => (
                      <Badge key={index} variant="secondary">{entity}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedInsight.metrics).map(([key, value]) => (
                      <div key={key} className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-lg font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {selectedInsight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowInsightDialog(false)}>Close</Button>
                  {selectedInsight.isActionable && !selectedInsight.hasBeenActedUpon && (
                    <Button>Take Action</Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};