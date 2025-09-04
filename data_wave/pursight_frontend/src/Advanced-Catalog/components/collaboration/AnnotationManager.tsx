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
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem
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
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger
} from '@/components/ui/context-menu';
import { 
  HoverCard, HoverCardContent, HoverCardTrigger
} from '@/components/ui/hover-card';

import { MessageSquare, Tag, User, Clock, Edit, Trash2, Plus, Search, Filter, MoreHorizontal, ThumbsUp, ThumbsDown, Reply, Forward, Flag, Archive, Star, Bookmark, Link, Share2, Download, Upload, File, Image, Video, Mic, Paperclip, Eye, EyeOff, Lock, Unlock, Globe, Users, UserCheck, AlertTriangle, CheckCircle, XCircle, Clock3, Activity, TrendingUp, BarChart3, PieChart, LineChart, Target, Zap, Brain, Lightbulb, GitBranch, History, RotateCcw, Copy, Save, ExternalLink, Settings, RefreshCw, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Maximize, Minimize, Grid, List, Layout, Map, Layers, Network, GitMerge, Code, Hash, Calendar as CalendarIcon, FileText, Database, Table as TableIcon, Columns, Workflow, BrainCircuit, Sparkles, Wand2, Robot, MessageCircle, ChatBubbleIcon, Quote, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, ListOrdered, ListTodo, Heading1, Heading2, Heading3, Code2, Quote as QuoteIcon } from 'lucide-react';

import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadialBarChart,
  RadialBar, ComposedChart, ScatterChart, Scatter, TreeMap
} from 'recharts';

import { format, subDays, parseISO, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib copie/utils';

// Import backend services
import { collaborationService } from '../../services';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { advancedLineageService } from '../../services/advanced-lineage.service';

// Import types
import { CollaborationTeam, TeamMember } from '../../types/collaboration.types';

// ============================================================================
// ADVANCED ANNOTATION TYPES
// ============================================================================

interface Annotation {
  id: string;
  content: string;
  type: 'comment' | 'suggestion' | 'question' | 'issue' | 'enhancement' | 'documentation';
  category: 'general' | 'data_quality' | 'business_logic' | 'technical' | 'compliance' | 'usage';
  target_type: 'asset' | 'column' | 'relationship' | 'document' | 'query' | 'visualization';
  target_id: string;
  target_name: string;
  target_path?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'resolved' | 'archived' | 'draft';
  priority: 'low' | 'medium' | 'high' | 'critical';
  visibility: 'public' | 'team' | 'private';
  tags: string[];
  attachments: AnnotationAttachment[];
  replies: AnnotationReply[];
  reactions: AnnotationReaction[];
  mentions: string[];
  version: number;
  parent_id?: string;
  thread_id: string;
  position?: AnnotationPosition;
  context: AnnotationContext;
  metadata: Record<string, any>;
  ai_suggestions?: AISuggestion[];
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
}

interface AnnotationAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'code' | 'data';
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
  thumbnail_url?: string;
  duration?: number; // for video/audio
  dimensions?: { width: number; height: number }; // for images
}

interface AnnotationReply {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  reactions: AnnotationReaction[];
  attachments: AnnotationAttachment[];
  mentions: string[];
}

interface AnnotationReaction {
  id: string;
  type: 'like' | 'dislike' | 'love' | 'laugh' | 'angry' | 'sad' | 'thumbs_up' | 'thumbs_down';
  emoji: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

interface AnnotationPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
  element_selector?: string;
  line_number?: number;
  column_number?: number;
}

interface AnnotationContext {
  asset_id?: string;
  asset_name?: string;
  database?: string;
  schema?: string;
  table?: string;
  column?: string;
  query?: string;
  workflow_id?: string;
  report_id?: string;
  lineage_path?: string[];
  business_context?: string;
  technical_context?: string;
}

interface AISuggestion {
  id: string;
  type: 'improvement' | 'correction' | 'alternative' | 'related' | 'classification';
  content: string;
  confidence: number;
  reasoning: string;
  accepted: boolean;
  created_at: string;
}

interface AnnotationThread {
  id: string;
  title: string;
  description: string;
  target_type: string;
  target_id: string;
  target_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  tags: string[];
  participants: ThreadParticipant[];
  annotations_count: number;
  unread_count: number;
  last_activity: string;
  resolution_summary?: string;
  resolution_date?: string;
  resolved_by?: string;
}

interface ThreadParticipant {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  role: 'author' | 'contributor' | 'reviewer' | 'observer';
  joined_at: string;
  last_read_at: string;
  notifications_enabled: boolean;
}

interface AnnotationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'comment' | 'suggestion' | 'question' | 'issue' | 'enhancement';
  template_content: string;
  variables: TemplateVariable[];
  tags: string[];
  usage_count: number;
  created_by: string;
  created_at: string;
  is_public: boolean;
  team_id?: string;
}

interface TemplateVariable {
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  required: boolean;
  default_value?: any;
  options?: string[];
  validation?: string;
}

interface AnnotationWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'review' | 'approval' | 'escalation' | 'collaboration';
  steps: WorkflowStep[];
  trigger_conditions: TriggerCondition[];
  target_types: string[];
  auto_assignment_rules: AssignmentRule[];
  notification_settings: NotificationSettings;
  status: 'active' | 'inactive' | 'draft';
  created_by: string;
  created_at: string;
  usage_statistics: WorkflowUsageStats;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'review' | 'approval' | 'assignment' | 'notification' | 'automation';
  order: number;
  required: boolean;
  timeout_hours?: number;
  assignee_type: 'user' | 'role' | 'team' | 'auto';
  assignee_value?: string;
  conditions: StepCondition[];
  actions: StepAction[];
}

interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logic_operator?: 'and' | 'or';
}

interface AssignmentRule {
  condition: TriggerCondition[];
  assignee_type: 'user' | 'role' | 'team';
  assignee_value: string;
  priority: number;
}

interface NotificationSettings {
  email_enabled: boolean;
  slack_enabled: boolean;
  in_app_enabled: boolean;
  digest_frequency: 'immediate' | 'daily' | 'weekly';
  notification_types: string[];
}

interface WorkflowUsageStats {
  total_executions: number;
  successful_executions: number;
  average_completion_time: number;
  most_common_triggers: string[];
  bottleneck_steps: string[];
}

interface StepCondition {
  field: string;
  operator: string;
  value: any;
}

interface StepAction {
  type: 'assign' | 'notify' | 'update_status' | 'add_tag' | 'create_task';
  parameters: Record<string, any>;
}

interface AnnotationAnalytics {
  overview: AnnotationOverview;
  trends: AnnotationTrends;
  user_activity: UserActivity[];
  popular_targets: PopularTarget[];
  category_distribution: CategoryDistribution[];
  resolution_metrics: ResolutionMetrics;
  engagement_metrics: EngagementMetrics;
  quality_metrics: QualityMetrics;
}

interface AnnotationOverview {
  total_annotations: number;
  active_annotations: number;
  resolved_annotations: number;
  total_threads: number;
  active_threads: number;
  total_participants: number;
  average_response_time: number;
  resolution_rate: number;
}

interface AnnotationTrends {
  daily_counts: { date: string; count: number; resolved: number }[];
  weekly_counts: { week: string; count: number; resolved: number }[];
  monthly_counts: { month: string; count: number; resolved: number }[];
}

interface UserActivity {
  user_id: string;
  user_name: string;
  annotations_created: number;
  replies_posted: number;
  resolutions_provided: number;
  engagement_score: number;
  last_active: string;
}

interface PopularTarget {
  target_id: string;
  target_name: string;
  target_type: string;
  annotation_count: number;
  unique_contributors: number;
  average_rating: number;
}

interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
  avg_resolution_time: number;
}

interface ResolutionMetrics {
  average_resolution_time: number;
  resolution_rate_by_priority: { priority: string; rate: number }[];
  resolution_rate_by_category: { category: string; rate: number }[];
  top_resolvers: { user_name: string; resolutions: number }[];
}

interface EngagementMetrics {
  average_replies_per_annotation: number;
  average_reactions_per_annotation: number;
  most_active_threads: string[];
  participation_rate: number;
  collaboration_index: number;
}

interface QualityMetrics {
  annotation_quality_score: number;
  helpful_annotations_percentage: number;
  ai_suggestion_acceptance_rate: number;
  template_usage_rate: number;
  duplicate_annotation_rate: number;
}

interface AnnotationManagerProps {
  className?: string;
  targetId?: string;
  targetType?: string;
  teamId?: string;
  mode?: 'embedded' | 'standalone';
  onAnnotationCreated?: (annotation: Annotation) => void;
  onAnnotationResolved?: (annotation: Annotation) => void;
  onThreadStatusChanged?: (thread: AnnotationThread) => void;
}

// Color schemes and constants
const ANNOTATION_TYPE_COLORS = {
  comment: '#3b82f6',
  suggestion: '#10b981',
  question: '#f59e0b',
  issue: '#ef4444',
  enhancement: '#8b5cf6',
  documentation: '#06b6d4'
};

const PRIORITY_COLORS = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444'
};

const STATUS_COLORS = {
  active: '#3b82f6',
  resolved: '#10b981',
  archived: '#6b7280',
  draft: '#f59e0b'
};

const REACTION_EMOJIS = {
  like: '👍',
  dislike: '👎',
  love: '❤️',
  laugh: '😂',
  angry: '😠',
  sad: '😢',
  thumbs_up: '👍',
  thumbs_down: '👎'
};

export default function AnnotationManager({ 
  className, 
  targetId, 
  targetType, 
  teamId, 
  mode = 'standalone',
  onAnnotationCreated, 
  onAnnotationResolved,
  onThreadStatusChanged 
}: AnnotationManagerProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('annotations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [threads, setThreads] = useState<AnnotationThread[]>([]);
  const [templates, setTemplates] = useState<AnnotationTemplate[]>([]);
  const [workflows, setWorkflows] = useState<AnnotationWorkflow[]>([]);
  const [analytics, setAnalytics] = useState<AnnotationAnalytics | null>(null);
  const [teams, setTeams] = useState<CollaborationTeam[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  
  // UI States
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [selectedThread, setSelectedThread] = useState<AnnotationThread | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline' | 'kanban'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'priority' | 'status'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  
  // Form States
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation>>({
    type: 'comment',
    category: 'general',
    priority: 'medium',
    visibility: 'team',
    tags: [],
    content: ''
  });
  const [newTemplate, setNewTemplate] = useState<Partial<AnnotationTemplate>>({
    category: 'general',
    type: 'comment',
    is_public: true,
    variables: []
  });
  const [newWorkflow, setNewWorkflow] = useState<Partial<AnnotationWorkflow>>({
    type: 'review',
    status: 'draft',
    steps: [],
    trigger_conditions: []
  });
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  
  // Editor States
  const [editorMode, setEditorMode] = useState<'rich' | 'markdown'>('rich');
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  
  // Real-time States
  const [liveAnnotations, setLiveAnnotations] = useState<Map<string, boolean>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadAnnotationData();
    setupRealTimeUpdates();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [targetId, targetType, teamId]);

  const loadAnnotationData = async () => {
    setLoading(true);
    try {
      // Load annotations from backend
      const annotationsResponse = await collaborationService.getAnnotations({
        targetId: targetId,
        targetType: targetType,
        teamId: teamId,
        includeReplies: true,
        includeReactions: true,
        includeAISuggestions: true,
        limit: 100
      });
      const annotationsData = annotationsResponse.data || [];
      
      // Load annotation threads from backend
      const threadsResponse = await collaborationService.getAnnotationThreads({
        targetId: targetId,
        targetType: targetType,
        teamId: teamId,
        includeParticipants: true,
        limit: 50
      });
      const threadsData = threadsResponse.data || [];
      
      // Load annotation templates from backend
      const templatesResponse = await collaborationService.getAnnotationTemplates({
        teamId: teamId,
        includePublic: true,
        limit: 100
      });
      const templatesData = templatesResponse.data || [];
      
      // Load annotation workflows from backend
      const workflowsResponse = await collaborationService.getAnnotationWorkflows({
        teamId: teamId,
        status: 'active',
        limit: 50
      });
      const workflowsData = workflowsResponse.data || [];
      
      // Load annotation analytics from backend
      const analyticsResponse = await collaborationService.getAnnotationAnalytics({
        targetId: targetId,
        targetType: targetType,
        teamId: teamId,
        timeRange: { from: subDays(new Date(), 30), to: new Date() }
      });
      const analyticsData = analyticsResponse.data;
      
      // Load collaboration teams from backend
      const teamsResponse = await collaborationService.getCollaborationTeams({
        includeMembers: true,
        limit: 20
      });
      const teamsData = teamsResponse.data || [];
      
      // Load current user from backend
      const userResponse = await collaborationService.getCurrentUser();
      const userData = userResponse.data;
      
      setAnnotations(annotationsData);
      setThreads(threadsData);
      setTemplates(templatesData);
      setWorkflows(workflowsData);
      setAnalytics(analyticsData);
      setTeams(teamsData);
      setCurrentUser(userData);
      
    } catch (err) {
      setError('Failed to load annotation data from backend');
      console.error('Error loading annotation data:', err);
      
      // Fallback to empty states
      setAnnotations([]);
      setThreads([]);
      setTemplates([]);
      setWorkflows([]);
      setAnalytics(null);
      setTeams([]);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadAnnotationData();
    }, 30000);
    
    // WebSocket connection for real-time annotation updates
    try {
      const wsUrl = `${(typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL)}/annotations/${targetId || 'global'}`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };
      
      ws.current.onopen = () => {
        console.log('Annotation WebSocket connected');
        // Join annotation room
        ws.current?.send(JSON.stringify({
          type: 'join_room',
          targetId: targetId,
          targetType: targetType,
          userId: currentUser?.id
        }));
      };
      
      ws.current.onerror = (error) => {
        console.error('Annotation WebSocket error:', error);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'annotation_created':
        setAnnotations(prev => [data.annotation, ...prev]);
        setLiveAnnotations(prev => new Map(prev.set(data.annotation.id, true)));
        break;
      case 'annotation_updated':
        setAnnotations(prev => prev.map(ann => 
          ann.id === data.annotation.id ? { ...ann, ...data.annotation } : ann
        ));
        break;
      case 'annotation_deleted':
        setAnnotations(prev => prev.filter(ann => ann.id !== data.annotationId));
        break;
      case 'reply_added':
        setAnnotations(prev => prev.map(ann => 
          ann.id === data.annotationId 
            ? { ...ann, replies: [...ann.replies, data.reply] }
            : ann
        ));
        break;
      case 'reaction_added':
        setAnnotations(prev => prev.map(ann => 
          ann.id === data.annotationId 
            ? { ...ann, reactions: [...ann.reactions, data.reaction] }
            : ann
        ));
        break;
      case 'thread_updated':
        setThreads(prev => prev.map(thread => 
          thread.id === data.thread.id ? { ...thread, ...data.thread } : thread
        ));
        break;
      case 'user_typing':
        setTypingUsers(prev => {
          const updated = new Map(prev);
          const threadUsers = updated.get(data.threadId) || [];
          if (!threadUsers.includes(data.userName)) {
            updated.set(data.threadId, [...threadUsers, data.userName]);
          }
          return updated;
        });
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = new Map(prev);
            const threadUsers = updated.get(data.threadId) || [];
            updated.set(data.threadId, threadUsers.filter(u => u !== data.userName));
            return updated;
          });
        }, 3000);
        break;
    }
  };

  // Annotation Management Functions
  const createAnnotation = async (annotationData: Partial<Annotation>) => {
    try {
      setIsCreatingAnnotation(true);
      
      const createRequest = {
        content: annotationData.content || '',
        type: annotationData.type || 'comment',
        category: annotationData.category || 'general',
        targetType: annotationData.target_type || targetType || '',
        targetId: annotationData.target_id || targetId || '',
        targetName: annotationData.target_name || '',
        priority: annotationData.priority || 'medium',
        visibility: annotationData.visibility || 'team',
        tags: annotationData.tags || [],
        mentions: annotationData.mentions || [],
        position: annotationData.position,
        context: annotationData.context || {},
        teamId: teamId
      };
      
      const response = await collaborationService.createAnnotation(createRequest);
      const newAnnotation = response.data;
      
      setAnnotations(prev => [newAnnotation, ...prev]);
      setShowCreateDialog(false);
      setNewAnnotation({
        type: 'comment',
        category: 'general',
        priority: 'medium',
        visibility: 'team',
        tags: [],
        content: ''
      });
      
      onAnnotationCreated?.(newAnnotation);
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'annotation_created',
        annotation: newAnnotation
      }));
      
    } catch (err) {
      setError('Failed to create annotation via backend');
      console.error('Annotation creation error:', err);
    } finally {
      setIsCreatingAnnotation(false);
    }
  };

  const updateAnnotation = async (annotationId: string, updates: Partial<Annotation>) => {
    try {
      const updateRequest = {
        annotationId,
        updates: {
          content: updates.content,
          type: updates.type,
          category: updates.category,
          priority: updates.priority,
          status: updates.status,
          tags: updates.tags,
          visibility: updates.visibility
        }
      };
      
      const response = await collaborationService.updateAnnotation(updateRequest);
      const updatedAnnotation = response.data;
      
      setAnnotations(prev => prev.map(ann => 
        ann.id === annotationId ? updatedAnnotation : ann
      ));
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'annotation_updated',
        annotation: updatedAnnotation
      }));
      
    } catch (err) {
      setError('Failed to update annotation via backend');
      console.error('Annotation update error:', err);
    }
  };

  const deleteAnnotation = async (annotationId: string) => {
    try {
      await collaborationService.deleteAnnotation(annotationId);
      
      setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'annotation_deleted',
        annotationId
      }));
      
    } catch (err) {
      setError('Failed to delete annotation via backend');
      console.error('Annotation deletion error:', err);
    }
  };

  const resolveAnnotation = async (annotationId: string, resolutionSummary?: string) => {
    try {
      const resolveRequest = {
        annotationId,
        status: 'resolved',
        resolutionSummary: resolutionSummary || '',
        resolvedBy: currentUser?.id || ''
      };
      
      const response = await collaborationService.resolveAnnotation(resolveRequest);
      const resolvedAnnotation = response.data;
      
      setAnnotations(prev => prev.map(ann => 
        ann.id === annotationId ? resolvedAnnotation : ann
      ));
      
      onAnnotationResolved?.(resolvedAnnotation);
      
    } catch (err) {
      setError('Failed to resolve annotation via backend');
      console.error('Annotation resolution error:', err);
    }
  };

  // Reply Management Functions
  const addReply = async (annotationId: string, content: string, attachments: AnnotationAttachment[] = []) => {
    try {
      const replyRequest = {
        annotationId,
        content,
        attachments,
        mentions: extractMentions(content),
        authorId: currentUser?.id || ''
      };
      
      const response = await collaborationService.addAnnotationReply(replyRequest);
      const newReply = response.data;
      
      setAnnotations(prev => prev.map(ann => 
        ann.id === annotationId 
          ? { ...ann, replies: [...ann.replies, newReply] }
          : ann
      ));
      
      setReplyContent(prev => ({ ...prev, [annotationId]: '' }));
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'reply_added',
        annotationId,
        reply: newReply
      }));
      
    } catch (err) {
      setError('Failed to add reply via backend');
      console.error('Reply creation error:', err);
    }
  };

  // Reaction Management Functions
  const addReaction = async (annotationId: string, reactionType: string) => {
    try {
      const reactionRequest = {
        annotationId,
        type: reactionType,
        emoji: REACTION_EMOJIS[reactionType as keyof typeof REACTION_EMOJIS] || '👍',
        userId: currentUser?.id || ''
      };
      
      const response = await collaborationService.addAnnotationReaction(reactionRequest);
      const newReaction = response.data;
      
      setAnnotations(prev => prev.map(ann => 
        ann.id === annotationId 
          ? { ...ann, reactions: [...ann.reactions, newReaction] }
          : ann
      ));
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'reaction_added',
        annotationId,
        reaction: newReaction
      }));
      
    } catch (err) {
      setError('Failed to add reaction via backend');
      console.error('Reaction creation error:', err);
    }
  };

  // Template Management Functions
  const createTemplate = async (templateData: Partial<AnnotationTemplate>) => {
    try {
      setIsCreatingTemplate(true);
      
      const createRequest = {
        name: templateData.name || '',
        description: templateData.description || '',
        category: templateData.category || 'general',
        type: templateData.type || 'comment',
        templateContent: templateData.template_content || '',
        variables: templateData.variables || [],
        tags: templateData.tags || [],
        isPublic: templateData.is_public || false,
        teamId: teamId
      };
      
      const response = await collaborationService.createAnnotationTemplate(createRequest);
      const newTemplate = response.data;
      
      setTemplates(prev => [newTemplate, ...prev]);
      setShowTemplateDialog(false);
      setNewTemplate({
        category: 'general',
        type: 'comment',
        is_public: true,
        variables: []
      });
      
    } catch (err) {
      setError('Failed to create template via backend');
      console.error('Template creation error:', err);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  // File Upload Functions
  const handleFileUpload = async (files: FileList, annotationId?: string) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileId = `${Date.now()}-${Math.random()}`;
      setUploadingFiles(prev => new Set([...prev, fileId]));
      
      try {
        const uploadRequest = {
          file: file,
          annotationId: annotationId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        };
        
        const response = await collaborationService.uploadAnnotationAttachment(uploadRequest);
        const attachment = response.data;
        
        if (annotationId) {
          setAnnotations(prev => prev.map(ann => 
            ann.id === annotationId 
              ? { ...ann, attachments: [...ann.attachments, attachment] }
              : ann
          ));
        }
        
        return attachment;
      } catch (err) {
        console.error('File upload error:', err);
        return null;
      } finally {
        setUploadingFiles(prev => {
          const updated = new Set(prev);
          updated.delete(fileId);
          return updated;
        });
      }
    });
    
    return Promise.all(uploadPromises);
  };

  // Utility Functions
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const filteredAnnotations = useMemo(() => {
    return annotations.filter(annotation => {
      const matchesType = filterType === 'all' || annotation.type === filterType;
      const matchesStatus = filterStatus === 'all' || annotation.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || annotation.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || annotation.priority === filterPriority;
      const matchesAuthor = filterAuthor === 'all' || annotation.author_id === filterAuthor;
      const matchesSearch = !searchTerm || 
        annotation.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annotation.target_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annotation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesType && matchesStatus && matchesCategory && matchesPriority && matchesAuthor && matchesSearch;
    }).sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [annotations, filterType, filterStatus, filterCategory, filterPriority, filterAuthor, searchTerm, sortBy, sortOrder]);

  const getAnnotationTypeColor = (type: string) => {
    return ANNOTATION_TYPE_COLORS[type as keyof typeof ANNOTATION_TYPE_COLORS] || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280';
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'active':
        return 'secondary';
      case 'archived':
        return 'outline';
      case 'draft':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Render Functions
  const renderAnnotationCard = (annotation: Annotation) => (
    <Card key={annotation.id} className={cn(
      "mb-4 transition-all duration-200 hover:shadow-md",
      selectedAnnotations.has(annotation.id) && "ring-2 ring-blue-500",
      liveAnnotations.get(annotation.id) && "ring-2 ring-green-500 animate-pulse"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selectedAnnotations.has(annotation.id)}
              onCheckedChange={(checked) => {
                const updated = new Set(selectedAnnotations);
                if (checked) {
                  updated.add(annotation.id);
                } else {
                  updated.delete(annotation.id);
                }
                setSelectedAnnotations(updated);
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  style={{ borderColor: getAnnotationTypeColor(annotation.type), color: getAnnotationTypeColor(annotation.type) }}
                >
                  {annotation.type}
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ borderColor: getPriorityColor(annotation.priority), color: getPriorityColor(annotation.priority) }}
                >
                  {annotation.priority}
                </Badge>
                <Badge variant={getStatusBadgeVariant(annotation.status)}>
                  {annotation.status}
                </Badge>
                {annotation.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-base mb-1">
                {annotation.target_name}
              </CardTitle>
              <CardDescription className="text-sm">
                {annotation.category} • by {annotation.author_name} • {formatTimeAgo(annotation.created_at)}
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
              <DropdownMenuItem onClick={() => setSelectedAnnotation(annotation)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => resolveAnnotation(annotation.id)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Resolved
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deleteAnnotation(annotation.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            {annotation.content}
          </div>
          
          {annotation.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {annotation.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  {attachment.type === 'image' ? (
                    <Image className="w-4 h-4" />
                  ) : attachment.type === 'video' ? (
                    <Video className="w-4 h-4" />
                  ) : attachment.type === 'audio' ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <File className="w-4 h-4" />
                  )}
                  <span className="text-sm">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Reactions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Object.entries(
                annotation.reactions.reduce((acc, reaction) => {
                  acc[reaction.type] = (acc[reaction.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => addReaction(annotation.id, type)}
                >
                  {REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]} {count}
                </Button>
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Plus className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                  <DropdownMenuItem key={type} onClick={() => addReaction(annotation.id, type)}>
                    {emoji} {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Replies */}
          {annotation.replies.length > 0 && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              {annotation.replies.map((reply) => (
                <div key={reply.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{reply.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(reply.created_at)}
                        </span>
                      </div>
                      <div className="text-sm">{reply.content}</div>
                    </div>
                  </div>
                  {reply.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {reply.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-1 p-1 bg-muted rounded text-xs">
                          <File className="w-3 h-3" />
                          {attachment.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Reply Input */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Add a reply..."
                value={replyContent[annotation.id] || ''}
                onChange={(e) => setReplyContent(prev => ({ ...prev, [annotation.id]: e.target.value }))}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    addReply(annotation.id, replyContent[annotation.id] || '');
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => addReply(annotation.id, replyContent[annotation.id] || '')}
                disabled={!replyContent[annotation.id]?.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* AI Suggestions */}
          {annotation.ai_suggestions && annotation.ai_suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">AI Suggestions</span>
              </div>
              {annotation.ai_suggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                      {suggestion.type}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-purple-600">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{suggestion.content}</p>
                  <p className="text-xs text-muted-foreground mb-2">{suggestion.reasoning}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Accept
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderAnnotationsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search annotations..."
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
              <SelectItem value="comment">Comments</SelectItem>
              <SelectItem value="suggestion">Suggestions</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
              <SelectItem value="issue">Issues</SelectItem>
              <SelectItem value="enhancement">Enhancements</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              <Clock className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedAnnotations.size > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(true)}
            >
              Actions ({selectedAnnotations.size})
            </Button>
          )}
          <Button variant="outline" onClick={loadAnnotationData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Annotation
          </Button>
        </div>
      </div>

      {/* Annotations List */}
      <div className="space-y-4">
        {filteredAnnotations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Annotations Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No annotations match your current filters' 
                : 'Start the conversation by creating your first annotation'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Annotation
            </Button>
          </div>
        ) : (
          filteredAnnotations.map(renderAnnotationCard)
        )}
      </div>
    </div>
  );

  if (loading && annotations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading annotations...</p>
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
              <MessageSquare className="w-8 h-8 text-blue-500" />
              Annotation Manager
            </h1>
            <p className="text-muted-foreground">
              Collaborative annotation management with multimedia support, AI suggestions, and advanced workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {annotations.length} annotations
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {threads.length} threads
            </Badge>
            <Button variant="outline" onClick={loadAnnotationData} disabled={loading}>
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
            <TabsTrigger value="annotations">Annotations</TabsTrigger>
            <TabsTrigger value="threads">Threads</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="annotations" className="mt-6">
            {renderAnnotationsTab()}
          </TabsContent>

          <TabsContent value="threads" className="mt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Annotation Threads</h3>
              <p className="text-muted-foreground">Thread management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Annotation Templates</h3>
              <p className="text-muted-foreground">Template management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="mt-6">
            <div className="text-center py-12">
              <Workflow className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Annotation Workflows</h3>
              <p className="text-muted-foreground">Workflow management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Annotation Analytics</h3>
              <p className="text-muted-foreground">Analytics features coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Annotation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Annotation</DialogTitle>
              <DialogDescription>
                Add a new annotation to collaborate and share insights
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={newAnnotation.type || ''} 
                    onValueChange={(value) => setNewAnnotation(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="issue">Issue</SelectItem>
                      <SelectItem value="enhancement">Enhancement</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newAnnotation.category || ''} 
                    onValueChange={(value) => setNewAnnotation(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="data_quality">Data Quality</SelectItem>
                      <SelectItem value="business_logic">Business Logic</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="usage">Usage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={newAnnotation.priority || ''} 
                    onValueChange={(value) => setNewAnnotation(prev => ({ ...prev, priority: value as any }))}
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
                  <Label>Visibility</Label>
                  <Select 
                    value={newAnnotation.visibility || ''} 
                    onValueChange={(value) => setNewAnnotation(prev => ({ ...prev, visibility: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newAnnotation.content || ''}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your annotation content..."
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={newAnnotation.tags?.join(', ') || ''}
                  onChange={(e) => setNewAnnotation(prev => ({ 
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
                onClick={() => createAnnotation(newAnnotation)} 
                disabled={isCreatingAnnotation || !newAnnotation.content?.trim()}
              >
                {isCreatingAnnotation ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Annotation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
          }}
        />
      </div>
    </TooltipProvider>
  );
}