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
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import { 
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';

import { 
  Users, UserPlus, MessageSquare, FileText, Calendar as CalendarIcon,
  Clock, CheckCircle, XCircle, AlertTriangle, Settings, Search, Filter,
  Plus, Edit, Trash2, Eye, Share2, Download, Upload, RefreshCw,
  MoreHorizontal, Star, Flag, Archive, Bookmark, Tag, Link,
  GitBranch, Network, Activity, Zap, Target, TrendingUp,
  BarChart3, PieChart, LineChart, Bell, Mail, Phone, Video,
  MessageCircle, Send, Paperclip, Image, File, Folder,
  ChevronDown, ChevronRight, ChevronLeft, ChevronUp,
  PlayCircle, PauseCircle, StopCircle, SkipForward,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, 
  Copy, Save, ExternalLink, Minimize, Maximize,
  Grid, List, Layout, Layers, Map, Globe
} from 'lucide-react';

import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

import { format, subDays, parseISO, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

// Import backend services
import { collaborationService } from '../../services/collaboration.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';

// Import types
import { 
  CatalogCollaborationHub,
  CollaborationTeam,
  TeamMember,
  CollaborationActivity,
  TeamType,
  TeamPurpose,
  TeamRole,
  ActivityType,
  PriorityLevel,
  CollaborationProject,
  ProjectStatus,
  ProjectMilestone,
  TaskAssignment,
  TaskStatus,
  CommunicationChannel,
  ChannelType,
  MessageThread,
  Message,
  MessageType,
  Notification,
  NotificationType,
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowStep,
  StepStatus,
  CollaborationMetrics,
  TeamPerformance,
  ProjectMetrics,
  EngagementMetrics
} from '../../types/collaboration.types';

// ============================================================================
// ADVANCED COLLABORATION HUB TYPES
// ============================================================================

interface CollaborationSpace {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'team' | 'initiative' | 'working_group';
  visibility: 'public' | 'private' | 'restricted';
  teams: CollaborationTeam[];
  projects: CollaborationProject[];
  channels: CommunicationChannel[];
  activities: CollaborationActivity[];
  created_at: string;
  updated_at: string;
  created_by: string;
  members_count: number;
  active_projects: number;
  completion_rate: number;
}

interface TeamWorkspace {
  id: string;
  team_id: string;
  configuration: WorkspaceConfig;
  dashboard: TeamDashboard;
  resources: WorkspaceResource[];
  integrations: Integration[];
  permissions: WorkspacePermission[];
}

interface WorkspaceConfig {
  layout: 'grid' | 'list' | 'kanban' | 'timeline';
  widgets: DashboardWidget[];
  filters: WorkspaceFilter[];
  notifications: NotificationConfig;
  automation: AutomationRule[];
}

interface TeamDashboard {
  metrics: TeamPerformance;
  charts: ChartConfig[];
  kpis: KPIWidget[];
  recent_activities: CollaborationActivity[];
  trending_topics: TrendingTopic[];
  alerts: DashboardAlert[];
}

interface WorkspaceResource {
  id: string;
  type: 'document' | 'dataset' | 'model' | 'dashboard' | 'notebook' | 'template';
  name: string;
  description: string;
  url: string;
  tags: string[];
  access_level: 'read' | 'write' | 'admin';
  last_accessed: string;
  popularity_score: number;
}

interface Integration {
  id: string;
  type: 'slack' | 'teams' | 'jira' | 'github' | 'databricks' | 'snowflake';
  name: string;
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  last_sync: string;
  sync_frequency: string;
}

interface WorkspacePermission {
  user_id: string;
  role: TeamRole;
  permissions: Permission[];
  inherited_from?: string;
}

interface Permission {
  action: string;
  resource: string;
  granted: boolean;
  condition?: string;
}

interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data_source: string;
  metrics: string[];
  filters: ChartFilter[];
  time_range: TimeRange;
}

interface KPIWidget {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  target?: number;
  color: string;
}

interface TrendingTopic {
  id: string;
  topic: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  related_assets: string[];
  trending_score: number;
}

interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  action_required: boolean;
  action_url?: string;
  created_at: string;
  dismissed: boolean;
}

interface CollaborationEvent {
  id: string;
  type: 'meeting' | 'deadline' | 'milestone' | 'review' | 'training';
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  participants: string[];
  location?: string;
  virtual_link?: string;
  agenda: EventAgendaItem[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface EventAgendaItem {
  id: string;
  title: string;
  duration: number;
  presenter?: string;
  type: 'presentation' | 'discussion' | 'demo' | 'break';
  resources: string[];
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  helpful_votes: number;
  status: 'draft' | 'published' | 'archived';
  related_articles: string[];
}

interface DiscussionForum {
  id: string;
  name: string;
  description: string;
  category: string;
  topics: ForumTopic[];
  moderators: string[];
  visibility: 'public' | 'private' | 'team_only';
  activity_level: 'low' | 'medium' | 'high';
  total_posts: number;
  active_participants: number;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  last_activity: string;
  replies_count: number;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  tags: string[];
  category: string;
  status: 'open' | 'resolved' | 'closed';
}

interface CollaborationHubProps {
  className?: string;
  hubId?: string;
  onTeamCreated?: (team: CollaborationTeam) => void;
  onProjectCreated?: (project: CollaborationProject) => void;
  onMemberAdded?: (member: TeamMember) => void;
}

// Color schemes and constants
const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

const TEAM_TYPE_COLORS = {
  DATA_STEWARDSHIP: '#3b82f6',
  DATA_GOVERNANCE: '#10b981', 
  ANALYTICS: '#f59e0b',
  ENGINEERING: '#ef4444',
  BUSINESS: '#8b5cf6',
  QUALITY_ASSURANCE: '#06b6d4'
};

const ACTIVITY_TYPE_ICONS = {
  PROJECT_CREATED: FileText,
  TEAM_JOINED: UserPlus,
  MESSAGE_SENT: MessageSquare,
  TASK_COMPLETED: CheckCircle,
  DOCUMENT_SHARED: Share2,
  MEETING_SCHEDULED: CalendarIcon,
  MILESTONE_REACHED: Target,
  WORKFLOW_APPROVED: CheckCircle,
  ISSUE_REPORTED: AlertTriangle,
  KNOWLEDGE_SHARED: BookOpen
};

export default function CatalogCollaborationHub({ 
  className, 
  hubId, 
  onTeamCreated, 
  onProjectCreated,
  onMemberAdded 
}: CollaborationHubProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [hub, setHub] = useState<CatalogCollaborationHub | null>(null);
  const [spaces, setSpaces] = useState<CollaborationSpace[]>([]);
  const [teams, setTeams] = useState<CollaborationTeam[]>([]);
  const [projects, setProjects] = useState<CollaborationProject[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<CollaborationMetrics | null>(null);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>([]);
  const [forums, setForums] = useState<DiscussionForum[]>([]);
  
  // UI States
  const [selectedSpace, setSelectedSpace] = useState<CollaborationSpace | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<CollaborationTeam | null>(null);
  const [selectedProject, setSelectedProject] = useState<CollaborationProject | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  
  // Form States
  const [newSpace, setNewSpace] = useState<Partial<CollaborationSpace>>({});
  const [newTeam, setNewTeam] = useState<Partial<CollaborationTeam>>({});
  const [newProject, setNewProject] = useState<Partial<CollaborationProject>>({});
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({});
  const [newMessage, setNewMessage] = useState<Partial<Message>>({});
  const [newEvent, setNewEvent] = useState<Partial<CollaborationEvent>>({});
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadCollaborationData();
    setupRealTimeUpdates();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [hubId]);

  const loadCollaborationData = async () => {
    setLoading(true);
    try {
      // Load collaboration hub data from backend
      const hubResponse = hubId 
        ? await collaborationService.getCollaborationHub(hubId)
        : await collaborationService.getDefaultHub();
      const hubData = hubResponse.data;
      
      // Load teams from backend
      const teamsResponse = await collaborationService.getTeamsByHub(hubData.id);
      const teamsData = teamsResponse.data || [];
      
      // Load projects from backend
      const projectsResponse = await collaborationService.getProjectsByHub(hubData.id);
      const projectsData = projectsResponse.data || [];
      
      // Load members from backend
      const membersResponse = await collaborationService.getHubMembers(hubData.id);
      const membersData = membersResponse.data || [];
      
      // Load activities from backend
      const activitiesResponse = await collaborationService.getHubActivities(hubData.id, {
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      const activitiesData = activitiesResponse.data || [];
      
      // Load collaboration metrics from backend
      const metricsResponse = await collaborationService.getHubMetrics(hubData.id);
      const metricsData = metricsResponse.data;
      
      // Load messages from backend
      const messagesResponse = await collaborationService.getHubMessages(hubData.id, {
        limit: 100,
        includeThreads: true
      });
      const messagesData = messagesResponse.data || [];
      
      // Load notifications from backend
      const notificationsResponse = await collaborationService.getUserNotifications({
        hubId: hubData.id,
        limit: 20,
        unreadOnly: false
      });
      const notificationsData = notificationsResponse.data || [];
      
      // Load events from backend
      const eventsResponse = await collaborationService.getHubEvents(hubData.id, {
        startDate: subDays(new Date(), 30).toISOString(),
        endDate: new Date().toISOString()
      });
      const eventsData = eventsResponse.data || [];
      
      // Load knowledge base articles from backend
      const knowledgeResponse = await collaborationService.getKnowledgeArticles({
        hubId: hubData.id,
        status: 'published',
        limit: 50
      });
      const knowledgeData = knowledgeResponse.data || [];
      
      // Load discussion forums from backend
      const forumsResponse = await collaborationService.getDiscussionForums(hubData.id);
      const forumsData = forumsResponse.data || [];
      
      // Create collaboration spaces based on teams and projects
      const spacesData: CollaborationSpace[] = [
        {
          id: 'main-space',
          name: 'Main Collaboration Space',
          description: 'Primary workspace for all collaboration activities',
          type: 'initiative',
          visibility: 'public',
          teams: teamsData,
          projects: projectsData,
          channels: [],
          activities: activitiesData,
          created_at: hubData.created_at,
          updated_at: hubData.updated_at,
          created_by: hubData.created_by,
          members_count: membersData.length,
          active_projects: projectsData.filter(p => p.status === 'active').length,
          completion_rate: projectsData.length > 0 
            ? (projectsData.filter(p => p.status === 'completed').length / projectsData.length) * 100 
            : 0
        }
      ];
      
      setHub(hubData);
      setSpaces(spacesData);
      setTeams(teamsData);
      setProjects(projectsData);
      setMembers(membersData);
      setActivities(activitiesData);
      setMessages(messagesData);
      setNotifications(notificationsData);
      setMetrics(metricsData);
      setEvents(eventsData);
      setKnowledgeBase(knowledgeData);
      setForums(forumsData);
      
    } catch (err) {
      setError('Failed to load collaboration data from backend');
      console.error('Error loading collaboration data:', err);
      
      // Fallback to empty states
      setHub(null);
      setSpaces([]);
      setTeams([]);
      setProjects([]);
      setMembers([]);
      setActivities([]);
      setMessages([]);
      setNotifications([]);
      setMetrics(null);
      setEvents([]);
      setKnowledgeBase([]);
      setForums([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadCollaborationData();
    }, 30000);
    
    // WebSocket connection for real-time collaboration updates
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/collaboration/${hubId || 'default'}`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };
      
      ws.current.onopen = () => {
        console.log('Collaboration WebSocket connected');
      };
      
      ws.current.onerror = (error) => {
        console.error('Collaboration WebSocket error:', error);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        break;
      case 'member_joined':
        setMembers(prev => [...prev, data.member]);
        addActivity({
          type: 'TEAM_JOINED',
          description: `${data.member.name} joined the team`,
          user_id: data.member.user_id
        });
        break;
      case 'project_updated':
        setProjects(prev => prev.map(p => 
          p.id === data.project.id ? { ...p, ...data.project } : p
        ));
        break;
      case 'activity_created':
        setActivities(prev => [data.activity, ...prev.slice(0, 49)]);
        break;
      case 'notification':
        setNotifications(prev => [data.notification, ...prev]);
        break;
    }
  };

  const addActivity = (activity: Partial<CollaborationActivity>) => {
    const newActivity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      type: activity.type || 'MESSAGE_SENT',
      description: activity.description || '',
      user_id: activity.user_id || 'current-user',
      user_name: activity.user_name || 'Current User',
      user_avatar: activity.user_avatar,
      target_type: activity.target_type,
      target_id: activity.target_id,
      metadata: activity.metadata || {},
      created_at: new Date().toISOString(),
      hub_id: hub?.id || '',
      team_id: activity.team_id,
      project_id: activity.project_id
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, 49)]);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Team Management Functions
  const createTeam = async (teamData: Partial<CollaborationTeam>) => {
    try {
      setLoading(true);
      
      const createRequest = {
        hubId: hub?.id || '',
        name: teamData.name || '',
        description: teamData.description || '',
        teamType: teamData.team_type || TeamType.DATA_STEWARDSHIP,
        purpose: teamData.purpose || TeamPurpose.ASSET_MANAGEMENT,
        assignedAssets: teamData.assigned_assets || []
      };
      
      const response = await collaborationService.createCollaborationTeam(
        createRequest.hubId,
        createRequest.name,
        createRequest.description,
        createRequest.teamType,
        createRequest.purpose,
        createRequest.assignedAssets
      );
      
      const newTeam = response.data;
      setTeams(prev => [...prev, newTeam]);
      setShowTeamDialog(false);
      setNewTeam({});
      
      addActivity({
        type: 'PROJECT_CREATED',
        description: `Team "${newTeam.name}" was created`,
        target_type: 'team',
        target_id: newTeam.id
      });
      
      onTeamCreated?.(newTeam);
    } catch (err) {
      setError('Failed to create team via backend');
      console.error('Team creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async (teamId: string, memberData: Partial<TeamMember>) => {
    try {
      const addRequest = {
        userId: memberData.user_id || '',
        name: memberData.name || '',
        email: memberData.email || '',
        role: memberData.role || 'member',
        expertise: memberData.expertise || []
      };
      
      const response = await collaborationService.addTeamMember(
        teamId,
        addRequest.userId,
        addRequest.name,
        addRequest.email,
        addRequest.role,
        addRequest.expertise
      );
      
      const newMember = response.data;
      setMembers(prev => [...prev, newMember]);
      
      // Update team member count
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, members_count: team.members_count + 1 }
          : team
      ));
      
      addActivity({
        type: 'TEAM_JOINED',
        description: `${newMember.name} joined team`,
        user_id: newMember.user_id,
        user_name: newMember.name,
        target_type: 'team',
        target_id: teamId
      });
      
      onMemberAdded?.(newMember);
    } catch (err) {
      setError('Failed to add team member via backend');
      console.error('Member addition error:', err);
    }
  };

  // Project Management Functions
  const createProject = async (projectData: Partial<CollaborationProject>) => {
    try {
      setLoading(true);
      
      const createRequest = {
        name: projectData.name || '',
        description: projectData.description || '',
        teamId: projectData.team_id,
        priority: projectData.priority || PriorityLevel.MEDIUM,
        startDate: projectData.start_date || new Date().toISOString(),
        dueDate: projectData.due_date,
        assignedAssets: projectData.assigned_assets || []
      };
      
      const response = await collaborationService.createProject(createRequest);
      const newProject = response.data;
      
      setProjects(prev => [...prev, newProject]);
      setShowProjectDialog(false);
      setNewProject({});
      
      addActivity({
        type: 'PROJECT_CREATED',
        description: `Project "${newProject.name}" was created`,
        target_type: 'project',
        target_id: newProject.id
      });
      
      onProjectCreated?.(newProject);
    } catch (err) {
      setError('Failed to create project via backend');
      console.error('Project creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Message and Communication Functions
  const sendMessage = async (messageData: Partial<Message>) => {
    try {
      const sendRequest = {
        content: messageData.content || '',
        type: messageData.type || MessageType.TEXT,
        channelId: messageData.channel_id,
        threadId: messageData.thread_id,
        mentions: messageData.mentions || [],
        attachments: messageData.attachments || []
      };
      
      const response = await collaborationService.sendMessage(sendRequest);
      const newMessage = response.data;
      
      setMessages(prev => [...prev, newMessage]);
      setShowMessageDialog(false);
      setNewMessage({});
      
      addActivity({
        type: 'MESSAGE_SENT',
        description: 'New message sent',
        target_type: 'message',
        target_id: newMessage.id
      });
      
      scrollToBottom();
    } catch (err) {
      setError('Failed to send message via backend');
      console.error('Message sending error:', err);
    }
  };

  // Event Management Functions
  const createEvent = async (eventData: Partial<CollaborationEvent>) => {
    try {
      const createRequest = {
        title: eventData.title || '',
        description: eventData.description || '',
        type: eventData.type || 'meeting',
        startTime: eventData.start_time || new Date().toISOString(),
        endTime: eventData.end_time || new Date(Date.now() + 3600000).toISOString(),
        participants: eventData.participants || [],
        location: eventData.location,
        virtualLink: eventData.virtual_link,
        agenda: eventData.agenda || []
      };
      
      const response = await collaborationService.createEvent(createRequest);
      const newEvent = response.data;
      
      setEvents(prev => [...prev, newEvent]);
      setShowEventDialog(false);
      setNewEvent({});
      
      addActivity({
        type: 'MEETING_SCHEDULED',
        description: `Event "${newEvent.title}" was scheduled`,
        target_type: 'event',
        target_id: newEvent.id
      });
    } catch (err) {
      setError('Failed to create event via backend');
      console.error('Event creation error:', err);
    }
  };

  // Filter and Search Functions
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesType = filterType === 'all' || team.team_type === filterType;
      const matchesSearch = !searchTerm || 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [teams, filterType, searchTerm]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesSearch = !searchTerm || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [projects, filterStatus, searchTerm]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesType = filterType === 'all' || activity.type === filterType;
      const matchesSearch = !searchTerm || 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [activities, filterType, searchTerm]);

  // Utility Functions
  const getActivityIcon = (type: ActivityType) => {
    const IconComponent = ACTIVITY_TYPE_ICONS[type] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const getTeamTypeColor = (type: TeamType) => {
    return TEAM_TYPE_COLORS[type] || '#6b7280';
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'online':
        return 'default';
      case 'pending':
      case 'in_progress':
        return 'secondary';
      case 'blocked':
      case 'failed':
      case 'offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Render Functions
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Hub Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{spaces[0]?.completion_rate.toFixed(1) || 0}%</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collaboration Metrics Charts */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity Trends</CardTitle>
              <CardDescription>Daily collaboration activities over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={metrics.activity_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activities" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="messages" stroke="#10b981" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
              <CardDescription>Current status of all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={metrics.project_status_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.project_status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activities Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest collaboration activities across all teams</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredActivities.slice(0, 20).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        by {activity.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                      {activity.team_id && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            {teams.find(t => t.id === activity.team_id)?.name || 'Team'}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeamsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
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
              <SelectItem value="DATA_STEWARDSHIP">Data Stewardship</SelectItem>
              <SelectItem value="DATA_GOVERNANCE">Data Governance</SelectItem>
              <SelectItem value="ANALYTICS">Analytics</SelectItem>
              <SelectItem value="ENGINEERING">Engineering</SelectItem>
              <SelectItem value="BUSINESS">Business</SelectItem>
              <SelectItem value="QUALITY_ASSURANCE">Quality Assurance</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadCollaborationData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setShowTeamDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Teams Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getTeamTypeColor(team.team_type) }}
                    />
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {team.description}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedTeam(team)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setNewMember({ team_id: team.id });
                        setShowMemberDialog(true);
                      }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{team.team_type.replace('_', ' ')}</Badge>
                    <Badge variant={getStatusBadgeVariant(team.status)}>
                      {team.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-medium">{team.members_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Projects</p>
                      <p className="font-medium">{team.projects_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Assets</p>
                      <p className="font-medium">{team.assigned_assets?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Activity</p>
                      <p className="font-medium text-green-600">
                        {team.activity_level || 'Medium'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Created {formatTimeAgo(team.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getTeamTypeColor(team.team_type) }}
                        />
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-sm text-muted-foreground">{team.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{team.team_type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(team.status)}>
                        {team.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{team.members_count}</TableCell>
                    <TableCell>{team.projects_count || 0}</TableCell>
                    <TableCell>
                      <span className="text-green-600">{team.activity_level || 'Medium'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedTeam(team)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setNewMember({ team_id: team.id });
                            setShowMemberDialog(true);
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Teams Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterType !== 'all' 
              ? 'No teams match your current filters' 
              : 'Create your first collaboration team to get started'}
          </p>
          <Button onClick={() => setShowTeamDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>
      )}
    </div>
  );

  if (loading && !hub) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading collaboration hub...</p>
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
              Collaboration Hub
            </h1>
            <p className="text-muted-foreground">
              {hub?.name || 'Advanced team collaboration with workflow management and real-time communication'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {members.filter(m => m.status === 'online').length} online
            </Badge>
            <Button variant="outline" onClick={loadCollaborationData} disabled={loading}>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            {renderTeamsTab()}
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Projects Management</h3>
              <p className="text-muted-foreground">Project collaboration features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Team Messaging</h3>
              <p className="text-muted-foreground">Real-time messaging features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Events & Meetings</h3>
              <p className="text-muted-foreground">Event management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
              <p className="text-muted-foreground">Knowledge sharing features coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Team Dialog */}
        <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Set up a new collaboration team with specific roles and responsibilities
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={newTeam.name || ''}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-type">Team Type</Label>
                  <Select 
                    value={newTeam.team_type || ''} 
                    onValueChange={(value) => setNewTeam(prev => ({ ...prev, team_type: value as TeamType }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DATA_STEWARDSHIP">Data Stewardship</SelectItem>
                      <SelectItem value="DATA_GOVERNANCE">Data Governance</SelectItem>
                      <SelectItem value="ANALYTICS">Analytics</SelectItem>
                      <SelectItem value="ENGINEERING">Engineering</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="QUALITY_ASSURANCE">Quality Assurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-description">Description</Label>
                <Textarea
                  id="team-description"
                  value={newTeam.description || ''}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the team purpose and responsibilities"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-purpose">Purpose</Label>
                <Select 
                  value={newTeam.purpose || ''} 
                  onValueChange={(value) => setNewTeam(prev => ({ ...prev, purpose: value as TeamPurpose }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSET_MANAGEMENT">Asset Management</SelectItem>
                    <SelectItem value="QUALITY_ASSURANCE">Quality Assurance</SelectItem>
                    <SelectItem value="COMPLIANCE_MONITORING">Compliance Monitoring</SelectItem>
                    <SelectItem value="DATA_DISCOVERY">Data Discovery</SelectItem>
                    <SelectItem value="ANALYTICS_DEVELOPMENT">Analytics Development</SelectItem>
                    <SelectItem value="PROCESS_IMPROVEMENT">Process Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTeamDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createTeam(newTeam)} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}