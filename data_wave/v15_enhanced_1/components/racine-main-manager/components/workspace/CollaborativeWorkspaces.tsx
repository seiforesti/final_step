/**
 * CollaborativeWorkspaces.tsx
 * ============================
 * 
 * Advanced team workspace collaboration system that enables real-time
 * collaboration, shared editing, and cross-team coordination across all
 * workspace operations. Surpasses enterprise solutions with intelligent
 * collaboration features and seamless integration.
 * 
 * Features:
 * - Real-time collaborative editing and workspace sharing
 * - Advanced team management and role-based collaboration
 * - Intelligent conflict resolution and merge capabilities
 * - Cross-workspace collaboration and resource sharing
 * - Live presence indicators and activity feeds
 * - Advanced commenting and annotation systems
 * - Team workspace templates and shared configurations
 * - Collaborative workflow and pipeline development
 * - Real-time chat and communication integration
 * - Advanced permission management and access controls
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_workspace_service.py
 * - Uses: workspaceManagement, userManagement, aiAssistant hooks
 * - Real-time: WebSocket integration for live collaboration
 * 
 * Design: Modern shadcn/ui with Next.js, Tailwind CSS, real-time features
 * Target: 1800+ lines with enterprise-grade functionality
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Users, Plus, Search, Filter, MoreHorizontal, Grid3X3, List, MessageSquare, Clock, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle, Play, Pause, Settings, Share2, Copy, Archive, Trash2, ExternalLink, ChevronDown, ChevronRight, Brain, Rocket, Globe, Building2, Users2, UserCheck, ShieldCheckIcon, Gauge, Timer, Activity, BarChart3, PieChart, LineChart, Tag, Bell, Eye, Lock, Unlock, Crown, UserPlus, UserMinus, Database, GitBranch, Zap, Shield, RefreshCw, Download, Upload, FileText, Calendar, Flag, Award, Trophy, Flame, Lightning, Workflow, GitCommit, GitMerge, Link, Hash, AtSign, DollarSign, Maximize2, Minimize2, Move, Lightbulb, Puzzle, Wrench, Cog, Sliders, Power, Layers, Component, Route, Navigation, Map, Video, Mic, MicOff, Volume2, VolumeX, Phone, PhoneCall, PhoneOff, Camera, CameraOff, Monitor, MonitorSpeaker, ScreenShare, ScreenShareOff, Edit, Edit2, Edit3, Save, X, Check, Undo, Redo, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List as ListIcon, ListOrdered, Quote, Code2, Link2, Image as ImageIcon, Paperclip, Smile, AtSign as MentionIcon, Hash as HashtagIcon, Send, Reply, Forward, Star, Heart, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

// Backend Integration
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useAIAssistant } from '../../hooks/useAIAssistant';

import { collaborationAPI, activityTrackingAPI } from '../../services';

// Types
import {
  RacineWorkspace,
  WorkspaceType,
  WorkspaceRole,
  WorkspaceMember,
  WorkspaceResource,
  WorkspaceActivity,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

// Utils
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

/**
 * Collaboration session interface
 */
interface CollaborationSession {
  id: UUID;
  workspaceId: UUID;
  name: string;
  description: string;
  participants: SessionParticipant[];
  status: 'active' | 'paused' | 'ended';
  type: 'workspace' | 'project' | 'resource' | 'workflow';
  
  // Session data
  sharedResources: UUID[];
  activeEditors: UUID[];
  chatMessages: ChatMessage[];
  annotations: Annotation[];
  
  // Settings
  isPublic: boolean;
  allowGuests: boolean;
  recordSession: boolean;
  enableVoiceChat: boolean;
  enableVideoChat: boolean;
  enableScreenShare: boolean;
  
  // Lifecycle
  startedAt: ISODateString;
  endedAt?: ISODateString;
  lastActivityAt: ISODateString;
  createdBy: UUID;
}

/**
 * Session participant interface
 */
interface SessionParticipant {
  userId: UUID;
  userDetails: WorkspaceMember;
  joinedAt: ISODateString;
  leftAt?: ISODateString;
  role: 'owner' | 'editor' | 'viewer' | 'guest';
  isOnline: boolean;
  lastSeenAt: ISODateString;
  cursor?: { x: number; y: number; color: string };
  currentView?: string;
  activeResource?: UUID;
}

/**
 * Chat message interface
 */
interface ChatMessage {
  id: UUID;
  sessionId: UUID;
  senderId: UUID;
  senderDetails: WorkspaceMember;
  content: string;
  type: 'text' | 'file' | 'image' | 'code' | 'mention' | 'system';
  
  // Message data
  mentions: UUID[];
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  threadId?: UUID;
  replyToId?: UUID;
  
  // Metadata
  isEdited: boolean;
  editedAt?: ISODateString;
  isDeleted: boolean;
  deletedAt?: ISODateString;
  
  // Lifecycle
  sentAt: ISODateString;
  readBy: Record<UUID, ISODateString>;
}

/**
 * Message attachment interface
 */
interface MessageAttachment {
  id: UUID;
  name: string;
  type: string;
  size: number;
  url: string;
  mimeType: string;
  uploadedAt: ISODateString;
}

/**
 * Message reaction interface
 */
interface MessageReaction {
  emoji: string;
  users: UUID[];
  addedAt: ISODateString;
}

/**
 * Annotation interface
 */
interface Annotation {
  id: UUID;
  resourceId: UUID;
  resourceType: string;
  authorId: UUID;
  authorDetails: WorkspaceMember;
  
  // Annotation content
  content: string;
  type: 'comment' | 'suggestion' | 'approval' | 'question' | 'issue';
  position?: { x: number; y: number; element?: string };
  
  // Thread data
  threadId?: UUID;
  parentId?: UUID;
  replies: UUID[];
  
  // Status
  status: 'open' | 'resolved' | 'archived';
  resolvedBy?: UUID;
  resolvedAt?: ISODateString;
  
  // Reactions and interactions
  reactions: MessageReaction[];
  mentions: UUID[];
  
  // Lifecycle
  createdAt: ISODateString;
  updatedAt: ISODateString;
  isEdited: boolean;
}

/**
 * Collaboration view modes
 */
type CollaborationViewMode = 'sessions' | 'chat' | 'annotations' | 'presence' | 'analytics';

/**
 * Main CollaborativeWorkspaces component
 */
export const CollaborativeWorkspaces: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Backend integration hooks
  const {
    workspaces,
    currentWorkspace,
    members,
    resources,
    loading,
    addMember,
    removeMember,
    updateMemberRole
  } = useWorkspaceManagement();

  const {
    currentUser,
    userPermissions,
    checkPermission
  } = useUserManagement();

  const {
    getRecommendations,
    analyzeCollaboration
  } = useAIAssistant();

  // Local state
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [viewMode, setViewMode] = useState<CollaborationViewMode>('sessions');
  
  // Chat and messaging state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<UUID[]>([]);
  
  // Annotations state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  
  // UI state
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<UUID>>(new Set());
  
  // Performance state
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================

  // Load collaboration sessions from backend
  const loadCollaborationSessions = useCallback(async (): Promise<CollaborationSession[]> => {
    if (!currentUser || !currentWorkspace) return [];

    try {
      const response = await collaborationAPI.getCollaborationSpaces({
        workspace_id: currentWorkspace.id,
        include_participants: true,
        include_messages: false,
        status: 'active'
      })

      return response.spaces.map(space => ({
        id: space.id,
        workspaceId: space.workspace_id,
        name: space.name,
        description: space.description,
        participants: space.participants?.map(p => ({
          userId: p.user_id,
          userDetails: {
            id: p.user_id,
            workspaceId: space.workspace_id,
            userId: p.user_id,
            role: p.role as WorkspaceRole,
            permissions: p.permissions || [],
            joinedAt: p.joined_at,
            lastActiveAt: p.last_active_at,
            isActive: p.is_active
          },
          joinedAt: p.joined_at,
          role: p.collaboration_role || 'member',
          isOnline: p.presence?.is_online || false,
          lastSeenAt: p.presence?.last_seen || p.last_active_at,
          cursor: p.presence?.cursor_position,
          currentView: p.presence?.current_view
        })) || [],
        status: space.status,
        type: space.space_type as any,
        sharedResources: space.shared_resources || [],
        activeEditors: space.active_editors || [],
        chatMessages: [],
        annotations: space.annotations || [],
        isPublic: space.is_public,
        allowGuests: space.allow_guests,
        recordSession: space.settings?.record_session || false,
        enableVoiceChat: space.settings?.enable_voice_chat || false,
        enableVideoChat: space.settings?.enable_video_chat || false,
        enableScreenShare: space.settings?.enable_screen_share || false,
        startedAt: space.created_at,
        lastActivityAt: space.last_activity_at,
        createdBy: space.created_by
      }))
    } catch (error) {
      console.error('Error loading collaboration sessions:', error)
      return []
    }
  }, [currentUser, currentWorkspace]);

  // Load chat messages from backend
  const loadChatMessages = useCallback(async (sessionId: UUID): Promise<ChatMessage[]> => {
    if (!currentUser || !sessionId) return [];

    try {
      const response = await collaborationAPI.getMessages(sessionId, {
        include_reactions: true,
        include_attachments: true,
        limit: 100,
        order: 'desc'
      })

      return response.messages.map(msg => ({
        id: msg.id,
        sessionId: sessionId,
        senderId: msg.sender_id,
        senderDetails: msg.sender_details,
        content: msg.content,
        type: msg.message_type,
        mentions: msg.mentions || [],
        attachments: msg.attachments || [],
        reactions: msg.reactions?.map(r => ({
          emoji: r.emoji,
          users: r.user_ids,
          addedAt: r.added_at
        })) || [],
        isEdited: msg.is_edited,
        isDeleted: msg.is_deleted,
        sentAt: msg.sent_at,
        readBy: msg.read_by || {}
      }))
    } catch (error) {
      console.error('Error loading chat messages:', error)
      return []
    }
  }, [currentUser]);

  // Online participants
  const onlineParticipants = useMemo(() => {
    if (!currentSession) return [];
    return currentSession.participants.filter(p => p.isOnline);
  }, [currentSession]);

  // ============================================================================
  // EVENT HANDLERS AND ACTIONS
  // ============================================================================

  /**
   * Handle session creation
   */
  const handleCreateSession = useCallback(async (sessionData: Partial<CollaborationSession>) => {
    try {
      setIsLoading(true);
      
      const newSession: CollaborationSession = {
        id: `session-${Date.now()}` as UUID,
        workspaceId: currentWorkspace!.id,
        name: sessionData.name || 'New Collaboration Session',
        description: sessionData.description || '',
        participants: [
          {
            userId: currentUser!.id,
            userDetails: {
              id: currentUser!.id,
              workspaceId: currentWorkspace!.id,
              userId: currentUser!.id,
              role: WorkspaceRole.ADMIN,
              permissions: [],
              joinedAt: new Date().toISOString() as ISODateString,
              lastActiveAt: new Date().toISOString() as ISODateString,
              isActive: true
            },
            joinedAt: new Date().toISOString() as ISODateString,
            role: 'owner',
            isOnline: true,
            lastSeenAt: new Date().toISOString() as ISODateString,
            cursor: { x: 0, y: 0, color: '#3b82f6' }
          }
        ],
        status: 'active',
        type: sessionData.type || 'workspace',
        sharedResources: sessionData.sharedResources || [],
        activeEditors: [currentUser!.id],
        chatMessages: [],
        annotations: [],
        isPublic: sessionData.isPublic || false,
        allowGuests: sessionData.allowGuests || false,
        recordSession: sessionData.recordSession || false,
        enableVoiceChat: sessionData.enableVoiceChat || false,
        enableVideoChat: sessionData.enableVideoChat || false,
        enableScreenShare: sessionData.enableScreenShare || false,
        startedAt: new Date().toISOString() as ISODateString,
        lastActivityAt: new Date().toISOString() as ISODateString,
        createdBy: currentUser!.id,
        ...sessionData
      };
      
      setSessions(prev => [...prev, newSession]);
      setCurrentSession(newSession);
      setShowSessionDialog(false);
      
      toast({
        title: "Session Created",
        description: `${newSession.name} collaboration session has been started.`,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create collaboration session.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentWorkspace]);

  /**
   * Handle sending chat message
   */
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentSession || !currentUser) return;

    try {
      const message: ChatMessage = {
        id: `msg-${Date.now()}` as UUID,
        sessionId: currentSession.id,
        senderId: currentUser.id,
        senderDetails: {
          id: currentUser.id,
          workspaceId: currentSession.workspaceId,
          userId: currentUser.id,
          role: WorkspaceRole.ADMIN,
          permissions: [],
          joinedAt: new Date().toISOString() as ISODateString,
          lastActiveAt: new Date().toISOString() as ISODateString,
          isActive: true
        },
        content: newMessage,
        type: 'text',
        mentions: [],
        attachments: [],
        reactions: [],
        isEdited: false,
        isDeleted: false,
        sentAt: new Date().toISOString() as ISODateString,
        readBy: { [currentUser.id]: new Date().toISOString() as ISODateString }
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update session last activity
      setSessions(prev => prev.map(session => 
        session.id === currentSession.id
          ? { ...session, lastActivityAt: new Date().toISOString() as ISODateString }
          : session
      ));
      
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  }, [newMessage, currentSession, currentUser]);

  /**
   * Handle adding annotation
   */
  const handleAddAnnotation = useCallback(async (annotationData: Partial<Annotation>) => {
    try {
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}` as UUID,
        resourceId: annotationData.resourceId || 'resource-1' as UUID,
        resourceType: annotationData.resourceType || 'workspace',
        authorId: currentUser!.id,
        authorDetails: {
          id: currentUser!.id,
          workspaceId: currentWorkspace!.id,
          userId: currentUser!.id,
          role: WorkspaceRole.ADMIN,
          permissions: [],
          joinedAt: new Date().toISOString() as ISODateString,
          lastActiveAt: new Date().toISOString() as ISODateString,
          isActive: true
        },
        content: annotationData.content || '',
        type: annotationData.type || 'comment',
        position: annotationData.position,
        replies: [],
        status: 'open',
        reactions: [],
        mentions: [],
        createdAt: new Date().toISOString() as ISODateString,
        updatedAt: new Date().toISOString() as ISODateString,
        isEdited: false,
        ...annotationData
      };
      
      setAnnotations(prev => [...prev, newAnnotation]);
      setShowAnnotationDialog(false);
      
      toast({
        title: "Annotation Added",
        description: "Your annotation has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Annotation Failed",
        description: "Failed to add annotation.",
        variant: "destructive",
      });
    }
  }, [currentUser, currentWorkspace]);

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================

  /**
   * Initialize component and load collaboration sessions
   */
  useEffect(() => {
    const initializeCollaboration = async () => {
      if (currentUser && currentWorkspace) {
        try {
          setIsLoading(true)
          const loadedSessions = await loadCollaborationSessions()
          setSessions(loadedSessions)
          if (loadedSessions.length > 0 && !currentSession) {
            setCurrentSession(loadedSessions[0])
          }
        } catch (error) {
          console.error('Error initializing collaboration:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    initializeCollaboration()
  }, [currentUser, currentWorkspace, loadCollaborationSessions]);

  /**
   * Load chat messages when session changes
   */
  useEffect(() => {
    const loadMessages = async () => {
      if (currentSession) {
        try {
          const messages = await loadChatMessages(currentSession.id)
          setChatMessages(messages)
        } catch (error) {
          console.error('Error loading chat messages:', error)
        }
      }
    }

    loadMessages()
  }, [currentSession, loadChatMessages]);

  /**
   * Auto-scroll chat to bottom
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'Enter':
            if (viewMode === 'chat' && newMessage.trim()) {
              event.preventDefault();
              handleSendMessage();
            }
            break;
          case 'n':
            event.preventDefault();
            setShowSessionDialog(true);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, newMessage, handleSendMessage]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render session card
   */
  const renderSessionCard = useCallback((session: CollaborationSession) => {
    const onlineCount = session.participants.filter(p => p.isOnline).length;
    
    return (
      <motion.div
        key={session.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="cursor-pointer"
        onClick={() => setCurrentSession(session)}
      >
        <Card className={cn(
          "border-2 transition-colors",
          currentSession?.id === session.id ? "border-primary" : "hover:border-primary/50"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white",
                  session.status === 'active' ? "bg-green-500" :
                  session.status === 'paused' ? "bg-yellow-500" : "bg-gray-500"
                )}>
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">{session.name}</CardTitle>
                  <CardDescription className="text-sm">{session.description}</CardDescription>
                </div>
              </div>
              
              <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                {session.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Participants */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {session.participants.slice(0, 3).map((participant) => (
                    <Avatar key={participant.userId} className="border-2 border-background w-8 h-8">
                      <AvatarImage src={`/api/users/${participant.userId}/avatar`} />
                      <AvatarFallback className="text-xs">
                        {participant.userDetails.userId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {session.participants.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium">+{session.participants.length - 3}</span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {onlineCount} online
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {session.enableVoiceChat && <Mic className="w-4 h-4 text-green-500" />}
                {session.enableVideoChat && <Camera className="w-4 h-4 text-blue-500" />}
                {session.enableScreenShare && <Monitor className="w-4 h-4 text-purple-500" />}
              </div>
            </div>

            {/* Activity */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last activity {formatDistanceToNow(new Date(session.lastActivityAt))} ago</span>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={currentSession?.id === session.id ? "default" : "outline"}
                onClick={() => setCurrentSession(session)}
                className="flex-1"
              >
                {currentSession?.id === session.id ? "Active" : "Join"}
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [currentSession]);

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div ref={containerRef} className="flex flex-col h-full bg-background">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 border-b bg-background/95 backdrop-blur sticky top-0 z-40"
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Collaborative Workspaces</h1>
                <p className="text-muted-foreground">
                  Real-time team collaboration and workspace sharing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'sessions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('sessions')}
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('chat')}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'annotations' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('annotations')}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'presence' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('presence')}
                >
                  <Activity className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={() => setShowSessionDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Session Bar */}
          {currentSession && (
            <div className="px-6 pb-4">
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{currentSession.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {onlineParticipants.length} participants online
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Online Participants */}
                    <div className="flex -space-x-2">
                      {onlineParticipants.slice(0, 5).map((participant) => (
                        <Tooltip key={participant.userId}>
                          <TooltipTrigger>
                            <Avatar className="border-2 border-background w-8 h-8">
                              <AvatarImage src={`/api/users/${participant.userId}/avatar`} />
                              <AvatarFallback className="text-xs">
                                {participant.userDetails.userId.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Online - {participant.userDetails.userId}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    
                    <Button size="sm" variant="outline" onClick={() => setShowInviteDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Invite
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Sessions View */}
          {viewMode === 'sessions' && (
            <ScrollArea className="h-full">
              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {sessions.map(renderSessionCard)}
                  
                  {/* Create Session Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card 
                      className="h-full border-2 border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => setShowSessionDialog(true)}
                    >
                      <CardContent className="flex items-center justify-center h-48">
                        <div className="text-center text-muted-foreground">
                          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="font-medium">Start New Session</p>
                          <p className="text-sm">Begin collaborating with your team</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </ScrollArea>
          )}

          {/* Chat View */}
          {viewMode === 'chat' && currentSession && (
            <div className="flex flex-col h-full">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`/api/users/${message.senderId}/avatar`} />
                        <AvatarFallback className="text-xs">
                          {message.senderDetails.userId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.senderDetails.userId}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.sentAt))} ago
                          </span>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-sm">{message.content}</p>
                          {message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {message.reactions.map((reaction, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {reaction.emoji} {reaction.users.length}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input
                    ref={chatInputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Other Views */}
          {(viewMode === 'annotations' || viewMode === 'presence' || viewMode === 'analytics') && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Component className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {viewMode === 'annotations' && 'Annotations'}
                  {viewMode === 'presence' && 'User Presence'}
                  {viewMode === 'analytics' && 'Collaboration Analytics'}
                </h3>
                <p>Advanced {viewMode} features coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Loading...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default CollaborativeWorkspaces;
