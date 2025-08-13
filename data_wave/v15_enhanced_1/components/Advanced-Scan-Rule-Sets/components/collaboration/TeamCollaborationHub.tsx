import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Share,
  Link,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Search,
  Filter,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  User,
  MessageSquare,
  Bell,
  BellOff,
  Mail,
  Phone,
  Video,
  FileText,
  Code,
  Database,
  Activity,
  Target,
  Zap,
  Brain,
  GitBranch,
  Layers,
  Network,
  Shuffle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreHorizontal,
  MoreVertical,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Bookmark,
  Flag,
  Tag,
  Maximize,
  Minimize,
  ExternalLink,
  Send,
  Paperclip,
  Smile,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Coffee,
  Lightbulb
} from 'lucide-react';

// Hooks and Services
import { useCollaboration } from '../../hooks/useCollaboration';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';
import { collaborationAPI } from '../../services/collaboration-apis';

// RBAC Integration
import { useScanRuleRBAC } from '../../utils/rbac-integration';

// Types
import {
  TeamMember,
  CollaborationSession,
  WorkspaceRole,
  Permission,
  TeamActivity,
  CollaborationMetrics,
  NotificationPreference,
  TeamInvitation,
  WorkspaceSettings,
  RealTimeUpdate,
  CollaborationEvent,
  TeamProject,
  SharedResource,
  MeetingSchedule,
  TaskAssignment,
  TeamPerformance,
  CollaborationInsight,
  WorkspaceAnalytics
} from '../../types/collaboration.types';

// Constants
import { ROLE_PERMISSIONS, ACTIVITY_TYPES, NOTIFICATION_TYPES } from '../../constants/ui-constants';

interface TeamCollaborationHubProps {
  workspaceId?: string;
  userId?: string;
  initialMembers?: TeamMember[];
  enableRealTime?: boolean;
  showMetrics?: boolean;
  allowInvitations?: boolean;
  onMemberAdded?: (member: TeamMember) => void;
  onSessionStarted?: (session: CollaborationSession) => void;
  onActivityUpdate?: (activity: TeamActivity) => void;
  // RBAC props
  rbac?: any;
  userContext?: any;
  accessLevel?: string;
}

const TeamCollaborationHub: React.FC<TeamCollaborationHubProps> = ({
  workspaceId,
  userId,
  initialMembers = [],
  enableRealTime = true,
  showMetrics = true,
  allowInvitations = true,
  onMemberAdded,
  onSessionStarted,
  onActivityUpdate,
  rbac: propRbac,
  userContext: propUserContext,
  accessLevel: propAccessLevel
}) => {
  // RBAC Integration - use prop or hook
  const hookRbac = useScanRuleRBAC();
  const rbac = propRbac || hookRbac;
  const userContext = propUserContext || rbac.getUserContext();
  const accessLevel = propAccessLevel || rbac.getAccessLevel();
  // Hooks
  const {
    collaborationSessions,
    teamMembers,
    shareWorkspace,
    inviteTeamMember,
    getCollaborationHistory,
    isLoading,
    error
  } = useCollaboration();

  const {
    scanRules,
    activeScanRules,
    createScanRule,
    updateScanRule
  } = useScanRules();

  const {
    generateReport,
    exportData
  } = useReporting();

  // State Management
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [collaborationMetrics, setCollaborationMetrics] = useState<CollaborationMetrics>({
    totalMembers: 0,
    activeMembers: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalActivities: 0,
    collaborationScore: 0,
    responseTime: 0,
    engagementRate: 0
  });
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [sharedProjects, setSharedProjects] = useState<TeamProject[]>([]);
  const [meetingSchedules, setMeetingSchedules] = useState<MeetingSchedule[]>([]);
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedProject, setSelectedProject] = useState<TeamProject | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as WorkspaceRole,
    message: '',
    permissions: [] as Permission[]
  });
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    attendees: [] as string[],
    type: 'review' as 'review' | 'planning' | 'standup' | 'demo'
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    dueDate: '',
    category: 'development' as string
  });
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    role: 'all',
    status: 'all',
    activity: 'all',
    timeRange: '7d'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(enableRealTime);
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreference>({
    email: true,
    inApp: true,
    desktop: false,
    mentions: true,
    assignments: true,
    meetings: true,
    updates: false
  });

  // Refs
  const chatRef = useRef<HTMLDivElement>(null);
  const realTimeRef = useRef<WebSocket | null>(null);
  const activityUpdateRef = useRef<NodeJS.Timeout>();

  // Initialize real-time connection
  useEffect(() => {
    if (realTimeEnabled && workspaceId) {
      initializeRealTimeConnection();
    }

    return () => {
      if (realTimeRef.current) {
        realTimeRef.current.close();
      }
    };
  }, [realTimeEnabled, workspaceId]);

  // Update activity periodically
  useEffect(() => {
    if (enableRealTime) {
      activityUpdateRef.current = setInterval(() => {
        updateTeamActivity();
      }, 30000); // Update every 30 seconds

      return () => {
        if (activityUpdateRef.current) {
          clearInterval(activityUpdateRef.current);
        }
      };
    }
  }, [enableRealTime]);

  // Initialize real-time WebSocket connection
  const initializeRealTimeConnection = useCallback(() => {
    try {
      const wsUrl = `ws://localhost:8000/ws/collaboration/${workspaceId}/${userId}`;
      realTimeRef.current = new WebSocket(wsUrl);

      realTimeRef.current.onopen = () => {
        console.log('Real-time collaboration connected');
      };

      realTimeRef.current.onmessage = (event) => {
        const update: RealTimeUpdate = JSON.parse(event.data);
        handleRealTimeUpdate(update);
      };

      realTimeRef.current.onclose = () => {
        console.log('Real-time collaboration disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeRealTimeConnection, 5000);
      };

      realTimeRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
    }
  }, [workspaceId, userId]);

  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((update: RealTimeUpdate) => {
    switch (update.type) {
      case 'member_joined':
        setMembers(prev => [...prev, update.data as TeamMember]);
        break;
      case 'member_left':
        setMembers(prev => prev.filter(m => m.id !== update.data.memberId));
        break;
      case 'activity_update':
        setTeamActivities(prev => [update.data as TeamActivity, ...prev.slice(0, 99)]);
        if (onActivityUpdate) {
          onActivityUpdate(update.data as TeamActivity);
        }
        break;
      case 'session_started':
        setActiveSession(update.data as CollaborationSession);
        if (onSessionStarted) {
          onSessionStarted(update.data as CollaborationSession);
        }
        break;
      case 'chat_message':
        setChatMessages(prev => [...prev, update.data]);
        break;
      case 'task_assigned':
        setTaskAssignments(prev => [update.data as TaskAssignment, ...prev]);
        break;
      case 'meeting_scheduled':
        setMeetingSchedules(prev => [update.data as MeetingSchedule, ...prev]);
        break;
    }
  }, [onActivityUpdate, onSessionStarted]);

  // Update team activity
  const updateTeamActivity = useCallback(async () => {
    try {
      const activities = await collaborationAPI.getTeamActivities({
        workspaceId,
        limit: 50,
        since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });
      setTeamActivities(activities);

      const metrics = await collaborationAPI.getCollaborationMetrics({ workspaceId });
      setCollaborationMetrics(metrics);
    } catch (error) {
      console.error('Failed to update team activity:', error);
    }
  }, [workspaceId]);

  // Handle invite team member
  const handleInviteTeamMember = useCallback(async () => {
    try {
      const invitation = await inviteTeamMember({
        workspaceId,
        email: inviteForm.email,
        role: inviteForm.role,
        message: inviteForm.message,
        permissions: inviteForm.permissions
      });

      setPendingInvitations(prev => [invitation, ...prev]);
      setShowInviteDialog(false);
      setInviteForm({ email: '', role: 'member', message: '', permissions: [] });

      // Show success notification
      // TODO: Add notification system
    } catch (error) {
      console.error('Failed to invite team member:', error);
    }
  }, [inviteForm, inviteTeamMember, workspaceId]);

  // Handle schedule meeting
  const handleScheduleMeeting = useCallback(async () => {
    try {
      const meeting = await collaborationAPI.scheduleMeeting({
        workspaceId,
        ...meetingForm,
        scheduledBy: userId
      });

      setMeetingSchedules(prev => [meeting, ...prev]);
      setShowMeetingDialog(false);
      setMeetingForm({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        attendees: [],
        type: 'review'
      });
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
  }, [meetingForm, workspaceId, userId]);

  // Handle assign task
  const handleAssignTask = useCallback(async () => {
    try {
      const task = await collaborationAPI.assignTask({
        workspaceId,
        ...taskForm,
        assignedBy: userId,
        status: 'pending'
      });

      setTaskAssignments(prev => [task, ...prev]);
      setShowTaskDialog(false);
      setTaskForm({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        dueDate: '',
        category: 'development'
      });
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  }, [taskForm, workspaceId, userId]);

  // Handle send chat message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      author: userId,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    if (realTimeRef.current?.readyState === WebSocket.OPEN) {
      realTimeRef.current.send(JSON.stringify({
        type: 'chat_message',
        data: message
      }));
    }

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  }, [newMessage, userId]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = searchTerm === '' ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterOptions.role === 'all' || member.role === filterOptions.role;
      const matchesStatus = filterOptions.status === 'all' || member.status === filterOptions.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchTerm, filterOptions]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return teamActivities.filter(activity => {
      const matchesActivity = filterOptions.activity === 'all' || activity.type === filterOptions.activity;

      const matchesTimeRange = (() => {
        const now = new Date();
        const activityTime = new Date(activity.timestamp);
        const diffHours = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);

        switch (filterOptions.timeRange) {
          case '1h': return diffHours <= 1;
          case '6h': return diffHours <= 6;
          case '24h': return diffHours <= 24;
          case '7d': return diffHours <= 24 * 7;
          default: return true;
        }
      })();

      return matchesActivity && matchesTimeRange;
    });
  }, [teamActivities, filterOptions]);

  // Render role badge
  const renderRoleBadge = (role: WorkspaceRole) => {
    const colorMap = {
      'owner': 'destructive',
      'admin': 'default',
      'editor': 'success',
      'member': 'secondary',
      'viewer': 'outline'
    };

    return (
      <Badge variant={colorMap[role] as any} className="capitalize">
        {role}
      </Badge>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const colorMap = {
      'online': 'success',
      'busy': 'destructive',
      'away': 'default',
      'offline': 'secondary'
    };

    return (
      <Badge variant={colorMap[status] as any} className="capitalize">
        {status}
      </Badge>
    );
  };

  // Render metrics dashboard
  const renderMetricsDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Team Members</div>
              <div className="text-2xl font-bold mt-1">{collaborationMetrics.totalMembers}</div>
              <div className="text-xs text-green-600 mt-1">
                {collaborationMetrics.activeMembers} active
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Active Sessions</div>
              <div className="text-2xl font-bold mt-1">{collaborationMetrics.activeSessions}</div>
              <div className="text-xs text-blue-600 mt-1">
                {collaborationMetrics.totalSessions} total
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Collaboration Score</div>
              <div className="text-2xl font-bold mt-1">
                {(collaborationMetrics.collaborationScore * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {(collaborationMetrics.engagementRate * 100).toFixed(0)}% engagement
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Response Time</div>
              <div className="text-2xl font-bold mt-1">
                {collaborationMetrics.responseTime.toFixed(1)}h
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {collaborationMetrics.totalActivities} activities
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team Collaboration Hub
          </h2>
          <p className="text-gray-600">Centralized workspace for team coordination and collaboration</p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                >
                  {realTimeEnabled ? <Activity className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {realTimeEnabled ? 'Real-time enabled' : 'Real-time disabled'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {allowInvitations && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMeetingDialog(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {showMetrics && renderMetricsDashboard()}

      {/* Real-time Status */}
      {realTimeEnabled && (
        <Alert>
          <Activity className="w-4 h-4" />
          <AlertTitle>Real-time Collaboration Active</AlertTitle>
          <AlertDescription>
            Live updates, chat, and presence indicators are enabled. 
            {collaborationMetrics.activeMembers} members currently online.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {filteredActivities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No recent activity</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredActivities.slice(0, 10).map((activity, index) => {
                            const member = members.find(m => m.id === activity.userId);
                            return (
                              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={member?.avatar} />
                                  <AvatarFallback>
                                    {member?.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm">
                                    <span className="font-medium">{member?.name}</span> {activity.description}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(activity.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Upcoming Meetings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Upcoming Meetings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {meetingSchedules.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No scheduled meetings</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {meetingSchedules.slice(0, 5).map((meeting, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="font-medium">{meeting.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{meeting.description}</div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{meeting.date} at {meeting.time}</span>
                                <span>{meeting.duration} min</span>
                                <Badge variant="outline">{meeting.type}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Team Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Team Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {taskAssignments.filter(t => t.status === 'completed').length}
                      </div>
                      <div className="text-sm text-blue-700">Tasks Completed</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(collaborationMetrics.collaborationScore * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-green-700">Collaboration Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {collaborationMetrics.responseTime.toFixed(1)}h
                      </div>
                      <div className="text-sm text-purple-700">Avg Response Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    
                    <Select value={filterOptions.role} onValueChange={(value) =>
                      setFilterOptions(prev => ({ ...prev, role: value }))
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterOptions.status} onValueChange={(value) =>
                      setFilterOptions(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="away">Away</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedMember(member)}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            member.status === 'online' ? 'bg-green-500' :
                            member.status === 'busy' ? 'bg-red-500' :
                            member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{member.name}</div>
                          <div className="text-sm text-gray-600 truncate">{member.email}</div>
                          <div className="flex items-center gap-2 mt-2">
                            {renderRoleBadge(member.role)}
                            {renderStatusBadge(member.status)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Last Active</div>
                          <div className="font-medium">
                            {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Tasks</div>
                          <div className="font-medium">
                            {taskAssignments.filter(t => t.assignee === member.id).length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingInvitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <div className="font-medium">{invitation.email}</div>
                            <div className="text-sm text-gray-600">
                              Invited as {invitation.role} • {new Date(invitation.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Pending</Badge>
                            <Button variant="ghost" size="sm">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Shared Projects
                    </CardTitle>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {sharedProjects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No shared projects yet</p>
                      <p className="text-sm mt-1">Create your first collaborative project</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sharedProjects.map((project) => (
                        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setSelectedProject(project)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-medium">{project.name}</div>
                              <Badge variant="outline">{project.status}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-3">{project.description}</div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{project.collaborators.length} collaborators</span>
                              <span>{project.files?.length || 0} files</span>
                              <span>Updated {new Date(project.lastModified).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Task Assignments
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowTaskDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskAssignments.map((task) => {
                        const assignee = members.find(m => m.id === task.assignee);
                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-gray-600 truncate max-w-xs">
                                  {task.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {assignee && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={assignee.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {assignee.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{assignee.name}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                task.priority === 'critical' ? 'destructive' :
                                task.priority === 'high' ? 'default' :
                                task.priority === 'medium' ? 'secondary' : 'outline'
                              }>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                task.status === 'completed' ? 'success' :
                                task.status === 'in-progress' ? 'default' :
                                task.status === 'pending' ? 'secondary' : 'outline'
                              }>
                                {task.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Team Activity Feed
                    </CardTitle>
                    <Select value={filterOptions.timeRange} onValueChange={(value) =>
                      setFilterOptions(prev => ({ ...prev, timeRange: value }))
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last Hour</SelectItem>
                        <SelectItem value="6h">Last 6 Hours</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filteredActivities.map((activity, index) => {
                        const member = members.find(m => m.id === activity.userId);
                        return (
                          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={member?.avatar} />
                              <AvatarFallback>
                                {member?.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="text-sm">
                                <span className="font-medium">{member?.name}</span> {activity.description}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(activity.timestamp).toLocaleString()}
                              </div>
                              {activity.metadata && (
                                <div className="mt-2 text-xs text-gray-600">
                                  {JSON.stringify(activity.metadata)}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Live Chat */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Team Chat
                </CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-48 p-4" ref={chatRef}>
                <div className="space-y-3">
                  {chatMessages.map((message, index) => {
                    const author = members.find(m => m.id === message.author);
                    const isCurrentUser = message.author === userId;
                    
                    return (
                      <div key={index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg ${
                          isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'
                        }`}>
                          {!isCurrentUser && (
                            <div className="text-xs font-medium mb-1">{author?.name}</div>
                          )}
                          <div className="text-sm">{message.content}</div>
                          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="sm" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share Workspace
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Activity
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Workspace Settings
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif">Email</Label>
                <Switch
                  id="email-notif"
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inapp-notif">In-App</Label>
                <Switch
                  id="inapp-notif"
                  checked={notificationSettings.inApp}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, inApp: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mentions-notif">Mentions</Label>
                <Switch
                  id="mentions-notif"
                  checked={notificationSettings.mentions}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, mentions: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="meetings-notif">Meetings</Label>
                <Switch
                  id="meetings-notif"
                  checked={notificationSettings.meetings}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, meetings: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join this workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="Enter email address"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteForm.role} onValueChange={(value: WorkspaceRole) => 
                setInviteForm(prev => ({ ...prev, role: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invite-message">Personal Message (Optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Add a personal message..."
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteTeamMember}>
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>
              Schedule a team meeting or collaboration session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-title">Meeting Title</Label>
                <Input
                  id="meeting-title"
                  placeholder="Enter meeting title"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="meeting-type">Meeting Type</Label>
                <Select value={meetingForm.type} onValueChange={(value: any) => 
                  setMeetingForm(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="standup">Standup</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                placeholder="Meeting agenda and details..."
                value={meetingForm.description}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="meeting-time">Time</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingForm.time}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="meeting-duration">Duration (minutes)</Label>
                <Input
                  id="meeting-duration"
                  type="number"
                  value={meetingForm.duration}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMeetingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleMeeting}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Create and assign a new task to a team member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Task details and requirements..."
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={taskForm.assignee} onValueChange={(value) => 
                  setTaskForm(prev => ({ ...prev, assignee: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value: any) => 
                  setTaskForm(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="task-due-date">Due Date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTask}>
                <Target className="w-4 h-4 mr-2" />
                Assign Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Member Details Modal */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback>
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{selectedMember.name}</div>
                  <div className="text-sm text-gray-600">{selectedMember.email}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <div className="mt-1">
                    {renderRoleBadge(selectedMember.role)}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {renderStatusBadge(selectedMember.status)}
                  </div>
                </div>
                <div>
                  <Label>Joined</Label>
                  <div className="mt-1 text-sm">
                    {selectedMember.joinedAt ? new Date(selectedMember.joinedAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
                <div>
                  <Label>Last Active</Label>
                  <div className="mt-1 text-sm">
                    {selectedMember.lastActive ? new Date(selectedMember.lastActive).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedMember.permissions?.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Recent Activity</Label>
                <Card className="mt-2">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {teamActivities
                        .filter(activity => activity.userId === selectedMember.id)
                        .slice(0, 5)
                        .map((activity, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-gray-600">{activity.description}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedMember(null)}>
                  Close
                </Button>
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamCollaborationHub;