"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ScrollArea,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Switch,
  Slider,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MessageCircle, Send, Phone, Video, Users, Hash, Plus, Search, Filter, Settings, Bell, BellOff, Pin, Archive, Trash2, Edit, Reply, Forward, Share, Download, Upload, FileText, Image, Paperclip, Smile, AtSign, Calendar, Clock, CheckCheck, Check, X, MoreHorizontal, Star, Flag, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Monitor, PhoneOff, UserPlus, UserMinus, Crown, Shield, Eye, EyeOff, Lock, Unlock, Globe, Building, Zap, Activity, TrendingUp, BarChart3, PieChart, LineChart, Target, Layers, GitBranch, Database, Server, Cloud, Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Info, HelpCircle, ExternalLink, Copy, Bookmark, BookmarkPlus, Tag, Tags, Folder, FolderOpen, FileImage, FileVideo, FilePlus, FileCheck, FileX, Maximize2, Minimize2, CornerDownRight, Quote, Code, Bold, Italic, Underline, List, ListOrdered, Link, Unlink, AlignLeft, AlignCenter, AlignRight, Type, Palette, MousePointer, Hand, Grab } from 'lucide-react';
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
import { 
  CollaborationSpace, 
  CollaborationParticipant, 
  CollaborationMessage, 
  CollaborationSession,
  MessageType,
  MessageStatus,
  ChannelType,
  ParticipantRole,
  PresenceStatus,
  MessagePriority,
  NotificationLevel,
  CommunicationMode,
  ConversationType,
  ThreadStatus,
  CallStatus,
  CallType,
  FileAttachment,
  MessageReaction,
  MessageThread,
  CommunicationChannel,
  TeamCommunicationMetrics,
  CommunicationPreferences,
  CallParticipant,
  ScreenShareSession,
  RecordingSession,
  MeetingRoom,
  CommunicationAnalytics
} from '../../types/racine-core.types';

// Enhanced Communication Types
interface CommunicationState {
  activeChannels: CommunicationChannel[];
  selectedChannel: CommunicationChannel | null;
  messages: CollaborationMessage[];
  threads: MessageThread[];
  onlineParticipants: CollaborationParticipant[];
  activeCalls: CallSession[];
  meetingRooms: MeetingRoom[];
  screenShares: ScreenShareSession[];
  recordings: RecordingSession[];
  communicationMetrics: TeamCommunicationMetrics;
  preferences: CommunicationPreferences;
  analytics: CommunicationAnalytics;
  isConnected: boolean;
  isTyping: { [userId: string]: boolean };
  unreadCounts: { [channelId: string]: number };
  pinnedMessages: CollaborationMessage[];
  starredMessages: CollaborationMessage[];
  drafts: { [channelId: string]: string };
  searchResults: SearchResult[];
}

interface CallSession {
  id: string;
  type: CallType;
  participants: CallParticipant[];
  status: CallStatus;
  startTime: Date;
  duration?: number;
  isRecording: boolean;
  hasScreenShare: boolean;
  settings: CallSettings;
}

interface CallSettings {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  participantLimit: number;
  waitingRoomEnabled: boolean;
  moderatorRequired: boolean;
}

interface SearchResult {
  id: string;
  type: 'message' | 'file' | 'participant' | 'channel';
  content: any;
  relevanceScore: number;
  highlights: string[];
  context: string;
}

interface MessageComposer {
  content: string;
  mentions: string[];
  attachments: FileAttachment[];
  priority: MessagePriority;
  scheduledTime?: Date;
  replyTo?: string;
  formatting: MessageFormatting;
}

interface MessageFormatting {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  code: boolean;
  link?: string;
  color?: string;
  fontSize?: number;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const messageVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const TeamCommunicationCenter: React.FC = () => {
  // Hooks
  const {
    collaborationHubs,
    activeSessions,
    participants,
    onlineParticipants,
    messages,
    sendMessage,
    createHub,
    joinHub,
    startSession,
    getCollaborationAnalytics,
    isConnected,
    refresh,
    disconnect,
    reconnect
  } = useCollaboration();

  const {
    orchestrationState,
    crossGroupActions,
    systemHealth,
    performanceMetrics,
    executeOrchestration,
    monitorHealth
  } = useRacineOrchestration();

  const {
    integrationStatus,
    availableIntegrations,
    executeIntegration,
    monitorIntegrations
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    teamMembers,
    updateUserPreferences,
    getUserAnalytics
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceMembers,
    workspaceSettings,
    switchWorkspace
  } = useWorkspaceManagement();

  const {
    activities,
    trackActivity,
    getActivityAnalytics
  } = useActivityTracker();

  const {
    workflows,
    executeWorkflow,
    getWorkflowMetrics
  } = useJobWorkflow();

  const {
    pipelines,
    executePipeline,
    getPipelineMetrics
  } = usePipelineManager();

  const {
    aiInsights,
    getRecommendations,
    analyzeContent,
    generateSummary
  } = useAIAssistant();

  // State Management
  const [communicationState, setCommunicationState] = useState<CommunicationState>({
    activeChannels: [],
    selectedChannel: null,
    messages: [],
    threads: [],
    onlineParticipants: [],
    activeCalls: [],
    meetingRooms: [],
    screenShares: [],
    recordings: [],
    communicationMetrics: {
      totalMessages: 0,
      activeParticipants: 0,
      averageResponseTime: 0,
      engagementScore: 0,
      collaborationEfficiency: 0,
      communicationTrends: [],
      channelActivity: [],
      participantActivity: [],
      messageAnalytics: {
        sentCount: 0,
        receivedCount: 0,
        readCount: 0,
        responseRate: 0
      }
    },
    preferences: {
      theme: 'system',
      notifications: NotificationLevel.ALL,
      soundEnabled: true,
      desktopNotifications: true,
      emailNotifications: false,
      autoStatus: true,
      showPresence: true,
      compactMode: false,
      fontSize: 14,
      language: 'en'
    },
    analytics: {
      dailyStats: [],
      weeklyTrends: [],
      participationMetrics: [],
      communicationPatterns: [],
      effectivenessScores: []
    },
    isConnected: false,
    isTyping: {},
    unreadCounts: {},
    pinnedMessages: [],
    starredMessages: [],
    drafts: {},
    searchResults: []
  });

  const [messageComposer, setMessageComposer] = useState<MessageComposer>({
    content: '',
    mentions: [],
    attachments: [],
    priority: MessagePriority.NORMAL,
    formatting: {
      bold: false,
      italic: false,
      underline: false,
      code: false
    }
  });

  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'channels' | 'direct' | 'calls' | 'files'>('channels');
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [callSettings, setCallSettings] = useState<CallSettings>({
    audioEnabled: true,
    videoEnabled: false,
    screenShareEnabled: false,
    recordingEnabled: false,
    chatEnabled: true,
    participantLimit: 50,
    waitingRoomEnabled: false,
    moderatorRequired: false
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Effects
  useEffect(() => {
    initializeCommunication();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (communicationState.selectedChannel) {
      loadChannelMessages(communicationState.selectedChannel.id);
      markChannelAsRead(communicationState.selectedChannel.id);
    }
  }, [communicationState.selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [communicationState.messages]);

  useEffect(() => {
    if (isConnected) {
      setupRealtimeListeners();
    }
  }, [isConnected]);

  // Initialization
  const initializeCommunication = async () => {
    try {
      await loadCommunicationChannels();
      await loadCommunicationMetrics();
      await loadUserPreferences();
      await connectToRealtimeService();
      
      setCommunicationState(prev => ({
        ...prev,
        isConnected: true
      }));

      // Track activity
      trackActivity({
        type: 'communication_session_start',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          component: 'TeamCommunicationCenter',
          workspace: activeWorkspace?.id
        }
      });
    } catch (error) {
      console.error('Failed to initialize communication:', error);
      setCommunicationState(prev => ({
        ...prev,
        isConnected: false
      }));
    }
  };

  const cleanup = () => {
    if (activeCall) {
      endCall();
    }
    disconnectFromRealtimeService();
    
    // Track activity
    trackActivity({
      type: 'communication_session_end',
      userId: currentUser?.id || '',
      timestamp: new Date(),
      metadata: {
        component: 'TeamCommunicationCenter',
        duration: Date.now() - (communicationState.analytics.dailyStats[0]?.timestamp || Date.now())
      }
    });
  };

  // Channel Management
  const loadCommunicationChannels = async () => {
    try {
      const channels = await Promise.all([
        loadWorkspaceChannels(),
        loadDirectMessageChannels(),
        loadGroupChannels(),
        loadSystemChannels()
      ]);

      const allChannels = channels.flat();
      setCommunicationState(prev => ({
        ...prev,
        activeChannels: allChannels
      }));
    } catch (error) {
      console.error('Failed to load communication channels:', error);
    }
  };

  const loadWorkspaceChannels = async (): Promise<CommunicationChannel[]> => {
    if (!activeWorkspace) return [];
    
    return [
      {
        id: `workspace-${activeWorkspace.id}-general`,
        name: 'General',
        type: ChannelType.PUBLIC,
        description: 'General workspace discussions',
        participants: workspaceMembers || [],
        isArchived: false,
        isMuted: false,
        lastActivity: new Date(),
        unreadCount: 0,
        pinnedMessages: [],
        settings: {
          allowFileSharing: true,
          allowMentions: true,
          allowReactions: true,
          requireModeration: false
        }
      },
      {
        id: `workspace-${activeWorkspace.id}-announcements`,
        name: 'Announcements',
        type: ChannelType.ANNOUNCEMENT,
        description: 'Important workspace announcements',
        participants: workspaceMembers || [],
        isArchived: false,
        isMuted: false,
        lastActivity: new Date(),
        unreadCount: 0,
        pinnedMessages: [],
        settings: {
          allowFileSharing: true,
          allowMentions: true,
          allowReactions: true,
          requireModeration: true
        }
      }
    ];
  };

  const loadDirectMessageChannels = async (): Promise<CommunicationChannel[]> => {
    if (!teamMembers) return [];
    
    return teamMembers
      .filter(member => member.id !== currentUser?.id)
      .map(member => ({
        id: `dm-${currentUser?.id}-${member.id}`,
        name: member.name,
        type: ChannelType.DIRECT,
        description: `Direct message with ${member.name}`,
        participants: [currentUser!, member],
        isArchived: false,
        isMuted: false,
        lastActivity: new Date(),
        unreadCount: 0,
        pinnedMessages: [],
        settings: {
          allowFileSharing: true,
          allowMentions: true,
          allowReactions: true,
          requireModeration: false
        }
      }));
  };

  const loadGroupChannels = async (): Promise<CommunicationChannel[]> => {
    const groupChannels: CommunicationChannel[] = [];
    
    // Create channels for each SPA group
    const spaGroups = [
      'data-sources',
      'advanced-scan-rule-sets',
      'classifications',
      'compliance-rule',
      'advanced-catalog',
      'advanced-scan-logic',
      'rbac-system'
    ];

    spaGroups.forEach(group => {
      groupChannels.push({
        id: `group-${group}`,
        name: group.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: ChannelType.GROUP,
        description: `Discussions for ${group} SPA`,
        participants: teamMembers?.filter(member => 
          member.permissions?.some(p => p.resource.includes(group))
        ) || [],
        isArchived: false,
        isMuted: false,
        lastActivity: new Date(),
        unreadCount: 0,
        pinnedMessages: [],
        settings: {
          allowFileSharing: true,
          allowMentions: true,
          allowReactions: true,
          requireModeration: false
        }
      });
    });

    return groupChannels;
  };

  const loadSystemChannels = async (): Promise<CommunicationChannel[]> => {
    return [
      {
        id: 'system-alerts',
        name: 'System Alerts',
        type: ChannelType.SYSTEM,
        description: 'System notifications and alerts',
        participants: teamMembers || [],
        isArchived: false,
        isMuted: false,
        lastActivity: new Date(),
        unreadCount: 0,
        pinnedMessages: [],
        settings: {
          allowFileSharing: false,
          allowMentions: false,
          allowReactions: false,
          requireModeration: false
        }
      },
      {
        id: 'system-activities',
        name: 'System Activities',
        type: ChannelType.SYSTEM,
        description: 'System activity logs',
        participants: teamMembers?.filter(member => 
          member.role === ParticipantRole.ADMIN || member.role === ParticipantRole.MODERATOR
        ) || [],
        isArchived: false,
        isMuted: false,
        lastActivity: new Date(),
        unreadCount: 0,
        pinnedMessages: [],
        settings: {
          allowFileSharing: false,
          allowMentions: true,
          allowReactions: false,
          requireModeration: false
        }
      }
    ];
  };

  const createChannel = async (channelData: Partial<CommunicationChannel>) => {
    try {
      const newChannel: CommunicationChannel = {
        id: `channel-${Date.now()}`,
        name: channelData.name || 'New Channel',
        type: channelData.type || ChannelType.PUBLIC,
        description: channelData.description || '',
        participants: channelData.participants || [],
        isArchived: false,
        isMuted: false,
        lastActivity: new Date(),
        unreadCount: 0,
        pinnedMessages: [],
        settings: {
          allowFileSharing: true,
          allowMentions: true,
          allowReactions: true,
          requireModeration: false,
          ...channelData.settings
        }
      };

      setCommunicationState(prev => ({
        ...prev,
        activeChannels: [...prev.activeChannels, newChannel]
      }));

      // Track activity
      trackActivity({
        type: 'channel_created',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          channelId: newChannel.id,
          channelName: newChannel.name,
          channelType: newChannel.type
        }
      });

      return newChannel;
    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  };

  const selectChannel = async (channel: CommunicationChannel) => {
    setCommunicationState(prev => ({
      ...prev,
      selectedChannel: channel,
      messages: [] // Clear messages while loading
    }));

    await loadChannelMessages(channel.id);
    markChannelAsRead(channel.id);
  };

  const loadChannelMessages = async (channelId: string) => {
    try {
      // Simulate loading messages from backend
      const channelMessages: CollaborationMessage[] = await generateMockMessages(channelId);
      
      setCommunicationState(prev => ({
        ...prev,
        messages: channelMessages
      }));
    } catch (error) {
      console.error('Failed to load channel messages:', error);
    }
  };

  const generateMockMessages = async (channelId: string): Promise<CollaborationMessage[]> => {
    // In production, this would call the backend API
    const mockMessages: CollaborationMessage[] = [];
    const participants = communicationState.activeChannels.find(c => c.id === channelId)?.participants || [];
    
    for (let i = 0; i < 20; i++) {
      const sender = participants[Math.floor(Math.random() * participants.length)];
      if (sender) {
        mockMessages.push({
          id: `msg-${channelId}-${i}`,
          content: `Sample message ${i + 1} in channel ${channelId}`,
          senderId: sender.id,
          senderName: sender.name,
          timestamp: new Date(Date.now() - (20 - i) * 60000),
          type: MessageType.TEXT,
          status: MessageStatus.DELIVERED,
          priority: MessagePriority.NORMAL,
          channelId,
          threadId: undefined,
          replyToId: undefined,
          mentions: [],
          reactions: [],
          attachments: [],
          isEdited: false,
          isDeleted: false,
          metadata: {}
        });
      }
    }
    
    return mockMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const markChannelAsRead = (channelId: string) => {
    setCommunicationState(prev => ({
      ...prev,
      unreadCounts: {
        ...prev.unreadCounts,
        [channelId]: 0
      }
    }));
  };

  // Message Management
  const handleSendMessage = async () => {
    if (!messageComposer.content.trim() || !communicationState.selectedChannel) return;

    try {
      const newMessage: CollaborationMessage = {
        id: `msg-${Date.now()}`,
        content: messageComposer.content,
        senderId: currentUser?.id || '',
        senderName: currentUser?.name || '',
        timestamp: new Date(),
        type: MessageType.TEXT,
        status: MessageStatus.SENDING,
        priority: messageComposer.priority,
        channelId: communicationState.selectedChannel.id,
        mentions: messageComposer.mentions,
        reactions: [],
        attachments: messageComposer.attachments,
        isEdited: false,
        isDeleted: false,
        metadata: {
          formatting: messageComposer.formatting
        }
      };

      // Add message to local state immediately
      setCommunicationState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));

      // Send to backend
      await sendMessage(communicationState.selectedChannel.id, {
        content: messageComposer.content,
        type: MessageType.TEXT,
        priority: messageComposer.priority,
        mentions: messageComposer.mentions,
        attachments: messageComposer.attachments
      });

      // Clear composer
      setMessageComposer({
        content: '',
        mentions: [],
        attachments: [],
        priority: MessagePriority.NORMAL,
        formatting: {
          bold: false,
          italic: false,
          underline: false,
          code: false
        }
      });

      // Track activity
      trackActivity({
        type: 'message_sent',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          channelId: communicationState.selectedChannel.id,
          messageType: MessageType.TEXT,
          hasAttachments: messageComposer.attachments.length > 0
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleMessageReaction = async (messageId: string, emoji: string) => {
    try {
      const message = communicationState.messages.find(m => m.id === messageId);
      if (!message) return;

      const existingReaction = message.reactions.find(r => 
        r.emoji === emoji && r.userId === currentUser?.id
      );

      let updatedReactions;
      if (existingReaction) {
        // Remove reaction
        updatedReactions = message.reactions.filter(r => 
          !(r.emoji === emoji && r.userId === currentUser?.id)
        );
      } else {
        // Add reaction
        updatedReactions = [
          ...message.reactions,
          {
            emoji,
            userId: currentUser?.id || '',
            userName: currentUser?.name || '',
            timestamp: new Date()
          }
        ];
      }

      setCommunicationState(prev => ({
        ...prev,
        messages: prev.messages.map(m =>
          m.id === messageId
            ? { ...m, reactions: updatedReactions }
            : m
        )
      }));

      // Track activity
      trackActivity({
        type: 'message_reaction',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          messageId,
          emoji,
          action: existingReaction ? 'remove' : 'add'
        }
      });
    } catch (error) {
      console.error('Failed to handle message reaction:', error);
    }
  };

  // Call Management
  const startCall = async (type: CallType, participants: CollaborationParticipant[]) => {
    try {
      const callSession: CallSession = {
        id: `call-${Date.now()}`,
        type,
        participants: participants.map(p => ({
          ...p,
          isAudioEnabled: true,
          isVideoEnabled: type === CallType.VIDEO,
          isScreenSharing: false,
          joinedAt: new Date()
        })),
        status: CallStatus.CONNECTING,
        startTime: new Date(),
        isRecording: false,
        hasScreenShare: false,
        settings: callSettings
      };

      setActiveCall(callSession);
      setCommunicationState(prev => ({
        ...prev,
        activeCalls: [...prev.activeCalls, callSession]
      }));

      // Track activity
      trackActivity({
        type: 'call_started',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          callId: callSession.id,
          callType: type,
          participantCount: participants.length
        }
      });

      return callSession;
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      const endTime = new Date();
      const duration = endTime.getTime() - activeCall.startTime.getTime();

      setCommunicationState(prev => ({
        ...prev,
        activeCalls: prev.activeCalls.filter(call => call.id !== activeCall.id)
      }));

      // Track activity
      trackActivity({
        type: 'call_ended',
        userId: currentUser?.id || '',
        timestamp: endTime,
        metadata: {
          callId: activeCall.id,
          duration,
          participantCount: activeCall.participants.length
        }
      });

      setActiveCall(null);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  // Search and Filtering
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setCommunicationState(prev => ({
        ...prev,
        searchResults: []
      }));
      return;
    }

    try {
      const results = await performSearch(query);
      setCommunicationState(prev => ({
        ...prev,
        searchResults: results
      }));
    } catch (error) {
      console.error('Failed to perform search:', error);
    }
  };

  const performSearch = async (query: string): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(' ');

    // Search messages
    communicationState.messages.forEach(message => {
      const content = message.content.toLowerCase();
      const matchScore = searchTerms.reduce((score, term) => {
        return content.includes(term) ? score + 1 : score;
      }, 0);

      if (matchScore > 0) {
        results.push({
          id: message.id,
          type: 'message',
          content: message,
          relevanceScore: matchScore / searchTerms.length,
          highlights: searchTerms.filter(term => content.includes(term)),
          context: `In ${communicationState.activeChannels.find(c => c.id === message.channelId)?.name || 'Unknown Channel'}`
        });
      }
    });

    // Search channels
    communicationState.activeChannels.forEach(channel => {
      const name = channel.name.toLowerCase();
      const description = channel.description?.toLowerCase() || '';
      const matchScore = searchTerms.reduce((score, term) => {
        return (name.includes(term) || description.includes(term)) ? score + 1 : score;
      }, 0);

      if (matchScore > 0) {
        results.push({
          id: channel.id,
          type: 'channel',
          content: channel,
          relevanceScore: matchScore / searchTerms.length,
          highlights: searchTerms.filter(term => name.includes(term) || description.includes(term)),
          context: `${channel.type} channel`
        });
      }
    });

    // Search participants
    onlineParticipants.forEach(participant => {
      const name = participant.name.toLowerCase();
      const matchScore = searchTerms.reduce((score, term) => {
        return name.includes(term) ? score + 1 : score;
      }, 0);

      if (matchScore > 0) {
        results.push({
          id: participant.id,
          type: 'participant',
          content: participant,
          relevanceScore: matchScore / searchTerms.length,
          highlights: searchTerms.filter(term => name.includes(term)),
          context: `${participant.role} - ${participant.presenceStatus}`
        });
      }
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  // Utility Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getPresenceColor = (status: PresenceStatus) => {
    switch (status) {
      case PresenceStatus.ONLINE: return 'bg-green-500';
      case PresenceStatus.AWAY: return 'bg-yellow-500';
      case PresenceStatus.BUSY: return 'bg-red-500';
      case PresenceStatus.OFFLINE: return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getChannelIcon = (type: ChannelType) => {
    switch (type) {
      case ChannelType.PUBLIC: return Hash;
      case ChannelType.PRIVATE: return Lock;
      case ChannelType.DIRECT: return MessageCircle;
      case ChannelType.GROUP: return Users;
      case ChannelType.ANNOUNCEMENT: return Bell;
      case ChannelType.SYSTEM: return Settings;
      default: return Hash;
    }
  };

  // Real-time Communication Setup
  const connectToRealtimeService = async () => {
    try {
      // Initialize WebSocket connection for real-time communication
      // This would connect to the backend WebSocket service
      console.log('Connecting to real-time communication service...');
      
      setCommunicationState(prev => ({
        ...prev,
        isConnected: true
      }));
    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
    }
  };

  const disconnectFromRealtimeService = () => {
    setCommunicationState(prev => ({
      ...prev,
      isConnected: false
    }));
  };

  const setupRealtimeListeners = () => {
    // Setup WebSocket event listeners
    // This would handle real-time events from the backend
  };

  const loadCommunicationMetrics = async () => {
    try {
      const analytics = await getCollaborationAnalytics({
        timeRange: 'last_7_days',
        includeChannels: true,
        includeParticipants: true,
        includeMessages: true
      });

      setCommunicationState(prev => ({
        ...prev,
        communicationMetrics: {
          totalMessages: analytics.totalMessages || 0,
          activeParticipants: onlineParticipants.length,
          averageResponseTime: analytics.averageResponseTime || 0,
          engagementScore: analytics.engagementScore || 0,
          collaborationEfficiency: analytics.collaborationEfficiency || 0,
          communicationTrends: analytics.trends || [],
          channelActivity: analytics.channelActivity || [],
          participantActivity: analytics.participantActivity || [],
          messageAnalytics: analytics.messageAnalytics || {
            sentCount: 0,
            receivedCount: 0,
            readCount: 0,
            responseRate: 0
          }
        }
      }));
    } catch (error) {
      console.error('Failed to load communication metrics:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const userPrefs = await getUserAnalytics(currentUser?.id || '');
      
      setCommunicationState(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...userPrefs.communicationPreferences
        }
      }));
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  // Render Functions
  const renderChannelList = () => (
    <div className="space-y-2">
      {communicationState.activeChannels
        .filter(channel => {
          if (selectedView === 'channels') return channel.type !== ChannelType.DIRECT;
          if (selectedView === 'direct') return channel.type === ChannelType.DIRECT;
          return true;
        })
        .map((channel) => {
          const Icon = getChannelIcon(channel.type);
          const unreadCount = communicationState.unreadCounts[channel.id] || 0;
          
          return (
            <motion.div
              key={channel.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={communicationState.selectedChannel?.id === channel.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start p-3 h-auto",
                  communicationState.selectedChannel?.id === channel.id && "bg-primary/10"
                )}
                onClick={() => selectChannel(channel)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{channel.name}</span>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {channel.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {channel.description}
                      </p>
                    )}
                  </div>
                  {channel.isMuted && (
                    <VolumeX className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </Button>
            </motion.div>
          );
        })}
    </div>
  );

  const renderMessageList = () => (
    <ScrollArea className="flex-1 p-4">
      <AnimatePresence>
        {communicationState.messages.map((message, index) => {
          const isOwnMessage = message.senderId === currentUser?.id;
          const showAvatar = index === 0 || 
            communicationState.messages[index - 1].senderId !== message.senderId;
          
          return (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "mb-4 flex",
                isOwnMessage ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex space-x-3 max-w-[70%]",
                isOwnMessage && "flex-row-reverse space-x-reverse"
              )}>
                {showAvatar && !isOwnMessage && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/avatars/${message.senderId}.jpg`} />
                    <AvatarFallback>
                      {message.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "space-y-1",
                  !showAvatar && !isOwnMessage && "ml-11"
                )}>
                  {showAvatar && (
                    <div className={cn(
                      "flex items-center space-x-2 text-xs text-muted-foreground",
                      isOwnMessage && "justify-end"
                    )}>
                      <span className="font-medium">{message.senderName}</span>
                      <span>{formatTimestamp(message.timestamp)}</span>
                    </div>
                  )}
                  
                  <div className={cn(
                    "rounded-lg px-3 py-2 max-w-full break-words",
                    isOwnMessage 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs">
                            <Paperclip className="h-3 w-3" />
                            <span>{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.reactions.reduce((acc, reaction) => {
                          const existing = acc.find(r => r.emoji === reaction.emoji);
                          if (existing) {
                            existing.count++;
                            existing.users.push(reaction.userName);
                          } else {
                            acc.push({
                              emoji: reaction.emoji,
                              count: 1,
                              users: [reaction.userName]
                            });
                          }
                          return acc;
                        }, [] as any[]).map((reaction, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleMessageReaction(message.id, reaction.emoji)}
                          >
                            {reaction.emoji} {reaction.count}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={cn(
                    "flex items-center space-x-2 text-xs text-muted-foreground",
                    isOwnMessage && "justify-end"
                  )}>
                    {message.status === MessageStatus.SENDING && (
                      <Clock className="h-3 w-3" />
                    )}
                    {message.status === MessageStatus.DELIVERED && (
                      <Check className="h-3 w-3" />
                    )}
                    {message.status === MessageStatus.READ && (
                      <CheckCheck className="h-3 w-3" />
                    )}
                    {message.isEdited && (
                      <span>(edited)</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </ScrollArea>
  );

  const renderMessageComposer = () => (
    <div className="border-t p-4 space-y-3">
      {messageComposer.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {messageComposer.attachments.map((attachment, index) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <Paperclip className="h-3 w-3" />
              <span>{attachment.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  setMessageComposer(prev => ({
                    ...prev,
                    attachments: prev.attachments.filter((_, i) => i !== index)
                  }));
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                messageComposer.formatting.bold && "bg-muted"
              )}
              onClick={() => setMessageComposer(prev => ({
                ...prev,
                formatting: {
                  ...prev.formatting,
                  bold: !prev.formatting.bold
                }
              }))}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                messageComposer.formatting.italic && "bg-muted"
              )}
              onClick={() => setMessageComposer(prev => ({
                ...prev,
                formatting: {
                  ...prev.formatting,
                  italic: !prev.formatting.italic
                }
              }))}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                messageComposer.formatting.code && "bg-muted"
              )}
              onClick={() => setMessageComposer(prev => ({
                ...prev,
                formatting: {
                  ...prev.formatting,
                  code: !prev.formatting.code
                }
              }))}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            ref={composerRef}
            placeholder={`Message ${communicationState.selectedChannel?.name || 'channel'}...`}
            value={messageComposer.content}
            onChange={(e) => setMessageComposer(prev => ({
              ...prev,
              content: e.target.value
            }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="min-h-[60px] resize-none"
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleSendMessage}
            disabled={!messageComposer.content.trim() || !communicationState.selectedChannel}
            className="h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          const attachments = files.map(file => ({
            id: `attachment-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploadedAt: new Date()
          }));
          
          setMessageComposer(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...attachments]
          }));
        }}
      />
    </div>
  );

  const renderOnlineParticipants = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Online ({onlineParticipants.length})</h3>
        <Button variant="ghost" size="sm">
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>
      
      {onlineParticipants.map((participant) => (
        <motion.div
          key={participant.id}
          variants={itemVariants}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
        >
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/avatars/${participant.id}.jpg`} />
              <AvatarFallback>
                {participant.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
              getPresenceColor(participant.presenceStatus)
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{participant.name}</p>
            <p className="text-xs text-muted-foreground">{participant.role}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                const dmChannel = communicationState.activeChannels.find(c =>
                  c.type === ChannelType.DIRECT && c.participants.some(p => p.id === participant.id)
                );
                if (dmChannel) selectChannel(dmChannel);
              }}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startCall(CallType.AUDIO, [participant])}>
                <Phone className="h-4 w-4 mr-2" />
                Audio Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startCall(CallType.VIDEO, [participant])}>
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      ))}
    </div>
  );

  const renderActiveCall = () => {
    if (!activeCall) return null;

    return (
      <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {activeCall.type === CallType.VIDEO ? 'Video Call' : 'Audio Call'}
            </CardTitle>
            <Badge variant={activeCall.status === CallStatus.CONNECTED ? "default" : "secondary"}>
              {activeCall.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {Math.floor((Date.now() - activeCall.startTime.getTime()) / 60000)}:
              {String(Math.floor(((Date.now() - activeCall.startTime.getTime()) % 60000) / 1000)).padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{activeCall.participants.length} participants</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={callSettings.audioEnabled ? "default" : "secondary"}
                size="sm"
                onClick={() => setCallSettings(prev => ({
                  ...prev,
                  audioEnabled: !prev.audioEnabled
                }))}
              >
                {callSettings.audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              {activeCall.type === CallType.VIDEO && (
                <Button
                  variant={callSettings.videoEnabled ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setCallSettings(prev => ({
                    ...prev,
                    videoEnabled: !prev.videoEnabled
                  }))}
                >
                  {callSettings.videoEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
              )}
              
              <Button
                variant={callSettings.screenShareEnabled ? "default" : "secondary"}
                size="sm"
                onClick={() => setCallSettings(prev => ({
                  ...prev,
                  screenShareEnabled: !prev.screenShareEnabled
                }))}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={endCall}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery || communicationState.searchResults.length === 0) {
      return null;
    }

    return (
      <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Search Results</CardTitle>
        </CardHeader>
        <ScrollArea className="max-h-80">
          <CardContent className="space-y-2">
            {communicationState.searchResults.map((result) => (
              <div
                key={result.id}
                className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  if (result.type === 'channel') {
                    selectChannel(result.content as CommunicationChannel);
                  } else if (result.type === 'message') {
                    const message = result.content as CollaborationMessage;
                    const channel = communicationState.activeChannels.find(c => c.id === message.channelId);
                    if (channel) selectChannel(channel);
                  }
                  setSearchQuery('');
                }}
              >
                <div className="flex items-center space-x-2">
                  {result.type === 'message' && <MessageCircle className="h-4 w-4" />}
                  {result.type === 'channel' && <Hash className="h-4 w-4" />}
                  {result.type === 'participant' && <Users className="h-4 w-4" />}
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {result.type === 'message' && (result.content as CollaborationMessage).content}
                      {result.type === 'channel' && (result.content as CommunicationChannel).name}
                      {result.type === 'participant' && (result.content as CollaborationParticipant).name}
                    </p>
                    <p className="text-xs text-muted-foreground">{result.context}</p>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {Math.round(result.relevanceScore * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>
    );
  };

  const renderCommunicationMetrics = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Messages</p>
              <p className="text-2xl font-bold">{communicationState.communicationMetrics.totalMessages}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Online</p>
              <p className="text-2xl font-bold">{communicationState.communicationMetrics.activeParticipants}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Avg Response</p>
              <p className="text-2xl font-bold">{Math.round(communicationState.communicationMetrics.averageResponseTime)}m</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Engagement</p>
              <p className="text-2xl font-bold">{Math.round(communicationState.communicationMetrics.engagementScore * 100)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20"
      >
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Team Communication Center</h1>
                <p className="text-muted-foreground">
                  Advanced collaboration hub for cross-SPA communication
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  communicationState.isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-xs text-muted-foreground">
                  {communicationState.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => communicationState.isConnected ? disconnect() : reconnect()}
              >
                {communicationState.isConnected ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Palette className="h-4 w-4 mr-2" />
                    Theme Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Audio Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Communication Metrics */}
          {renderCommunicationMetrics()}
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search messages, channels, and participants..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4"
            />
            {renderSearchResults()}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Sidebar */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="h-full flex flex-col border-r">
                {/* View Tabs */}
                <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)} className="flex-1 flex flex-col">
                  <div className="border-b p-2">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="channels" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        Channels
                      </TabsTrigger>
                      <TabsTrigger value="direct" className="text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Direct
                      </TabsTrigger>
                      <TabsTrigger value="calls" className="text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        Calls
                      </TabsTrigger>
                      <TabsTrigger value="files" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Files
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="channels" className="h-full m-0">
                      <ScrollArea className="h-full p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Channels</h3>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create New Channel</DialogTitle>
                              </DialogHeader>
                              {/* Channel creation form would go here */}
                            </DialogContent>
                          </Dialog>
                        </div>
                        {renderChannelList()}
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="direct" className="h-full m-0">
                      <ScrollArea className="h-full p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Direct Messages</h3>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {renderChannelList()}
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="calls" className="h-full m-0">
                      <ScrollArea className="h-full p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Active Calls</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => startCall(CallType.AUDIO, onlineParticipants)}>
                                <Phone className="h-4 w-4 mr-2" />
                                Audio Call
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => startCall(CallType.VIDEO, onlineParticipants)}>
                                <Video className="h-4 w-4 mr-2" />
                                Video Call
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {communicationState.activeCalls.length === 0 ? (
                          <div className="text-center py-8">
                            <Phone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No active calls</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {communicationState.activeCalls.map((call) => (
                              <Card key={call.id} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {call.type === CallType.VIDEO ? 'Video Call' : 'Audio Call'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {call.participants.length} participants
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveCall(call)}
                                  >
                                    Join
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="files" className="h-full m-0">
                      <ScrollArea className="h-full p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Shared Files</h3>
                          <Button variant="ghost" size="sm">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-center py-8">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No shared files</p>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Chat Area */}
            <ResizablePanel defaultSize={50} minSize={40}>
              <div className="h-full flex flex-col">
                {communicationState.selectedChannel ? (
                  <>
                    {/* Channel Header */}
                    <div className="border-b p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {React.createElement(getChannelIcon(communicationState.selectedChannel.type), {
                            className: "h-5 w-5 text-muted-foreground"
                          })}
                          <div>
                            <h2 className="font-semibold">{communicationState.selectedChannel.name}</h2>
                            <p className="text-sm text-muted-foreground">
                              {communicationState.selectedChannel.participants.length} members
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startCall(CallType.AUDIO, communicationState.selectedChannel!.participants)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startCall(CallType.VIDEO, communicationState.selectedChannel!.participants)}
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pin className="h-4 w-4 mr-2" />
                                Pin Channel
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Bell className="h-4 w-4 mr-2" />
                                Notification Settings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive Channel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    {renderMessageList()}
                    
                    {/* Message Composer */}
                    {renderMessageComposer()}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Welcome to Team Communication</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a channel or start a direct message to begin collaborating
                      </p>
                      <Button onClick={() => {
                        if (communicationState.activeChannels.length > 0) {
                          selectChannel(communicationState.activeChannels[0]);
                        }
                      }}>
                        <Hash className="h-4 w-4 mr-2" />
                        Browse Channels
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Right Sidebar - Participants */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="h-full border-l">
                <ScrollArea className="h-full p-3">
                  {renderOnlineParticipants()}
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* Active Call Overlay */}
        {renderActiveCall()}
      </motion.div>
    </TooltipProvider>
  );
};
