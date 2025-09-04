'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

// Icons
import { MessageSquare, Users, Send, Plus, Search, Filter, Settings, Phone, Video, Paperclip, Smile, Mic, MicOff, Camera, CameraOff, Share, Edit, Trash, Reply, Forward, Star, Pin, Copy, Download, Upload, X, Check, CheckCheck, Clock, AlertCircle, Info, MoreHorizontal, ChevronDown, ChevronRight, ArrowRight, ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Bell, BellOff, Hash, AtSign, Eye, EyeOff, Lock, Unlock, Globe, Zap, Activity, TrendingUp, BarChart3, PieChart, Calendar, Clock3, UserPlus, UserMinus, Shield, ShieldCheckIcon, FileText, Image, FileVideo, FileAudio, File, Link, ExternalLink, Workflow, GitBranch, Target, Flag, Bookmark, Tag, Archive, RefreshCw, Download as DownloadIcon, Upload as UploadIcon, Save, Share2, Heart, ThumbsUp, ThumbsDown, Laugh, Angry, Frown,  } from 'lucide-react';

// Racine hooks and services
import { useWorkspaceManagement } from '@/components/racine-main-manager/hooks/useWorkspaceManagement';
import { useUserManagement } from '@/components/racine-main-manager/hooks/useUserManagement';
import { useAIAssistant } from '@/components/racine-main-manager/hooks/useAIAssistant';
import { useCrossGroupIntegration } from '@/components/racine-main-manager/hooks/useCrossGroupIntegration';
import { useActivityTracking } from '@/components/racine-main-manager/hooks/useActivityTracking';
import { useCollaboration } from '@/components/racine-main-manager/hooks/useCollaboration';

// SPA hooks for cross-group functionality (wired via Racine orchestrator hooks)
import { useDataSources } from '@/components/racine-main-manager/hooks/useDataSources';
import { useScanRuleSets } from '@/components/racine-main-manager/hooks/useScanRuleSets';
import { useClassifications } from '@/components/racine-main-manager/hooks/useClassifications';
import { useComplianceRules as useComplianceRule } from '@/components/racine-main-manager/hooks/useComplianceRules';
import { useAdvancedCatalog } from '@/components/racine-main-manager/hooks/useAdvancedCatalog';
import { useScanLogic } from '@/components/racine-main-manager/hooks/useScanLogic';
import { useRBACSystem } from '@/components/racine-main-manager/hooks/useRBACSystem';

// Types
interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'file' | 'video' | 'audio' | 'system' | 'workflow' | 'mention' | 'reply' | 'reaction';
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: string;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  replyTo?: string;
  mentions?: string[];
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  attachments?: ChatAttachment[];
  metadata?: {
    workflowId?: string;
    spaComponent?: string;
    dataSourceId?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    category?: string;
    priority?: number;
    status?: 'read' | 'unread' | 'acknowledged' | 'archived';
    readBy?: {
      userId: string;
      readAt: string;
    }[];
    deliveryStatus?: 'sent' | 'delivered' | 'failed';
    encryption?: boolean;
    retention?: number;
  };
  thread?: {
    id: string;
    messageCount: number;
    lastActivity: string;
    participants: string[];
  };
}

interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'link' | 'workflow' | 'dashboard' | 'report';
  size: number;
  url: string;
  thumbnail?: string;
  metadata?: {
    duration?: number;
    dimensions?: { width: number; height: number };
    encoding?: string;
    description?: string;
    workflowData?: any;
    spaData?: any;
  };
  uploadedBy: string;
  uploadedAt: string;
  securityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';
  scanStatus?: 'pending' | 'clean' | 'suspicious' | 'blocked';
}

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct' | 'group' | 'announcement' | 'workspace' | 'project' | 'department';
  members: ChatMember[];
  admins: string[];
  owners: string[];
  settings: {
    allowFileSharing: boolean;
    allowMentions: boolean;
    allowReactions: boolean;
    allowThreads: boolean;
    allowBots: boolean;
    messageRetention: number;
    readReceipts: boolean;
    typing_indicators: boolean;
    encryption: boolean;
    moderation: 'none' | 'basic' | 'strict';
    external_access: boolean;
    invite_permissions: 'admin' | 'members' | 'anyone';
  };
  integrations: {
    spaIntegrations: string[];
    workflowIntegrations: string[];
    aiAssistant: boolean;
    notifications: {
      desktop: boolean;
      mobile: boolean;
      email: boolean;
      slack: boolean;
      teams: boolean;
    };
    webhooks: {
      url: string;
      events: string[];
      active: boolean;
    }[];
  };
  createdAt: string;
  createdBy: string;
  lastActivity: string;
  messageCount: number;
  unreadCount?: number;
  isMuted?: boolean;
  isArchived?: boolean;
  tags?: string[];
  category?: string;
  workspaceId?: string;
  projectId?: string;
}

interface ChatMember {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: string;
  permissions: string[];
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  joinedAt: string;
  isBot?: boolean;
  timezone?: string;
  preferences?: {
    notifications: boolean;
    soundEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
  };
}

interface ChatThread {
  id: string;
  parentMessageId: string;
  channelId: string;
  title?: string;
  messages: ChatMessage[];
  participants: string[];
  createdAt: string;
  lastActivity: string;
  isResolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

interface VoiceCall {
  id: string;
  channelId: string;
  participants: {
    userId: string;
    joinedAt: string;
    isMuted: boolean;
    isDeafened: boolean;
    isSpeaking: boolean;
    quality: 'good' | 'fair' | 'poor';
  }[];
  startedAt: string;
  endedAt?: string;
  duration?: number;
  quality: 'good' | 'fair' | 'poor';
  recording?: {
    enabled: boolean;
    url?: string;
    transcription?: string;
  };
  screen_sharing?: {
    userId: string;
    startedAt: string;
    quality: 'good' | 'fair' | 'poor';
  };
}

interface VideoCall {
  id: string;
  channelId: string;
  participants: {
    userId: string;
    joinedAt: string;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isSpeaking: boolean;
    quality: 'good' | 'fair' | 'poor';
  }[];
  startedAt: string;
  endedAt?: string;
  duration?: number;
  quality: 'good' | 'fair' | 'poor';
  recording?: {
    enabled: boolean;
    url?: string;
    transcription?: string;
  };
  screen_sharing?: {
    userId: string;
    startedAt: string;
    app?: string;
    quality: 'good' | 'fair' | 'poor';
  };
  layout: 'grid' | 'speaker' | 'gallery' | 'sidebar';
}

interface ChatBot {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  type: 'ai-assistant' | 'workflow-bot' | 'notification-bot' | 'integration-bot' | 'compliance-bot';
  capabilities: string[];
  permissions: string[];
  isActive: boolean;
  settings: {
    autoRespond: boolean;
    learningEnabled: boolean;
    contextAware: boolean;
    crossSpaIntegration: boolean;
  };
  createdBy: string;
  createdAt: string;
  lastActive?: string;
  usage_stats?: {
    messagesProcessed: number;
    responsesGenerated: number;
    accuracy: number;
    userSatisfaction: number;
  };
}

interface ChatAnalytics {
  channelId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    messageCount: number;
    activeUsers: number;
    avgResponseTime: number;
    engagementScore: number;
    collaborationIndex: number;
    productivityScore: number;
  };
  trends: {
    messageTrends: { date: string; count: number }[];
    userActivityTrends: { date: string; activeUsers: number }[];
    engagementTrends: { date: string; score: number }[];
  };
  topUsers: {
    userId: string;
    messageCount: number;
    engagementScore: number;
  }[];
  frequentTopics: {
    topic: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  integrationUsage: {
    spaType: string;
    usageCount: number;
    lastUsed: string;
  }[];
}

interface ChatWorkflowIntegration {
  id: string;
  name: string;
  description: string;
  type: 'trigger' | 'action' | 'condition' | 'template';
  spaIntegration: {
    spaType: 'data-sources' | 'scan-rule-sets' | 'classifications' | 'compliance-rule' | 'advanced-catalog' | 'scan-logic' | 'rbac-system';
    component: string;
    action: string;
    parameters: Record<string, any>;
  };
  trigger: {
    event: 'message' | 'mention' | 'keyword' | 'reaction' | 'file_upload' | 'user_join' | 'user_leave';
    conditions: {
      keywords?: string[];
      users?: string[];
      channels?: string[];
      file_types?: string[];
      reactions?: string[];
    };
  };
  actions: {
    type: 'send_message' | 'create_thread' | 'notify_users' | 'trigger_workflow' | 'update_spa' | 'generate_report';
    config: Record<string, any>;
  }[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  usage_stats?: {
    triggeredCount: number;
    successRate: number;
    avgExecutionTime: number;
  };
}

interface ChatNotification {
  id: string;
  type: 'message' | 'mention' | 'reaction' | 'thread' | 'call' | 'system' | 'workflow' | 'integration';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channelId: string;
  messageId?: string;
  userId: string;
  timestamp: string;
  isRead: boolean;
  readAt?: string;
  actions?: {
    label: string;
    action: string;
    parameters?: Record<string, any>;
  }[];
  metadata?: {
    workflowId?: string;
    spaComponent?: string;
    urgency?: boolean;
    autoExpire?: string;
  };
}

interface ChatSettings {
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
    showAvatars: boolean;
    showTimestamps: boolean;
    showReadReceipts: boolean;
    showTypingIndicators: boolean;
    animationsEnabled: boolean;
  };
  notifications: {
    desktop: boolean;
    sound: boolean;
    email: boolean;
    mobile: boolean;
    mentions: boolean;
    directMessages: boolean;
    channelMessages: boolean;
    reactions: boolean;
    threads: boolean;
    calls: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowDirectMessages: boolean;
    allowMentions: boolean;
    messageHistory: boolean;
    dataRetention: number;
    encryption: boolean;
  };
  integrations: {
    spaIntegrations: string[];
    workflowIntegrations: string[];
    aiAssistant: boolean;
    bots: string[];
    externalServices: Record<string, boolean>;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  };
}

const QuickTeamChat: React.FC = () => {
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('channels');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<ChatChannel[]>([]);
  const [activeCall, setActiveCall] = useState<VoiceCall | VideoCall | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Racine hooks for backend integration
  const {
    currentWorkspace,
    getWorkspaceMembers,
    getWorkspaceProjects,
    getWorkspaceMetrics,
    getWorkspaceResources
  } = useWorkspaceManagement();

  const {
    currentUser,
    users,
    getUserProfile,
    updateUserStatus,
    getUserPermissions,
    getUserPreferences,
    updateUserPreferences
  } = useUserManagement();

  const {
    aiContext,
    getAIRecommendations,
    processNaturalLanguage,
    generateInsights,
    analyzeConversation,
    suggestResponses,
    detectSentiment,
    extractEntities,
    summarizeConversation,
    generateTranscription,
    translateMessage,
    moderateContent,
    getContextualHelp
  } = useAIAssistant();

  const {
    integrationContext,
    getSPAContext,
    triggerCrossGroupAction,
    getIntegrationData,
    synchronizeData,
    getGlobalInsights,
    orchestrateWorkflow,
    getPerformanceMetrics
  } = useCrossGroupIntegration();

  const {
    trackActivity,
    getActivityFeed,
    getActivityMetrics,
    getActivityInsights,
    trackUserAction,
    trackSystemEvent,
    generateActivityReport
  } = useActivityTracking();

  const {
    channels,
    currentChannel,
    loading: collaborationLoading,
    error: collaborationError,
    createChannel,
    updateChannel,
    deleteChannel,
    joinChannel,
    leaveChannel,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    createThread,
    markAsRead,
    getChannelHistory,
    getChannelMembers,
    inviteToChannel,
    removeFromChannel,
    startVoiceCall,
    startVideoCall,
    endCall,
    shareScreen,
    recordCall,
    muteUser,
    unmuteUser,
    banUser,
    unbanUser,
    getChannelAnalytics,
    exportChannelData,
    searchMessages,
    getNotifications,
    updateSettings,
    getSettings,
    syncWithExternalServices,
    generateReport,
    getPresenceData,
    updatePresence,
    getTypingIndicators,
    setTypingIndicator,
    getMessageDeliveryStatus,
    encryptMessage,
    decryptMessage,
    validateMessage,
    moderateMessage,
    archiveChannel,
    restoreChannel,
    getChannelInsights,
    optimizePerformance,
    getIntegrationStatus,
    triggerWebhook,
    processCommand
  } = useCollaboration();

  // SPA hooks for cross-group functionality
  const { dataSources, getDataSourceMetrics } = useDataSources();
  const { scanRuleSets, getScanRuleMetrics } = useScanRuleSets();
  const { classifications, getClassificationMetrics } = useClassifications();
  const { complianceRules, getComplianceMetrics } = useComplianceRule();
  const { catalogItems, getCatalogMetrics } = useAdvancedCatalog();
  const { scanLogic, getScanLogicMetrics } = useScanLogic();
  const { rbacRoles, rbacUsers, getRBACMetrics } = useRBACSystem();

  // Animation controls
  const dragControls = useDragControls();

  // Memoized values
  const currentChannelData = useMemo(() => {
    return channels.find(channel => channel.id === selectedChannel);
  }, [channels, selectedChannel]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    return messages.filter(message =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const channelMembers = useMemo(() => {
    return currentChannelData?.members || [];
  }, [currentChannelData]);

  const unreadMessages = useMemo(() => {
    return messages.filter(message => 
      message.metadata?.status === 'unread' && 
      message.senderId !== currentUser?.id
    );
  }, [messages, currentUser]);

  const aiSuggestions = useMemo(() => {
    if (!newMessage) return [];
    return suggestResponses?.(newMessage, messages.slice(-5)) || [];
  }, [newMessage, messages, suggestResponses]);

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setUnreadCount(unreadMessages.length);
  }, [unreadMessages]);

  useEffect(() => {
    if (selectedChannel && currentChannelData) {
      loadChannelMessages();
      markChannelAsRead();
    }
  }, [selectedChannel, currentChannelData]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateOnlineStatus();
      syncPresenceData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setTypingIndicator?.(selectedChannel || '', true);
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setTypingIndicator?.(selectedChannel || '', false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, selectedChannel, setTypingIndicator]);

  // Callback functions
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadChannelMessages = useCallback(async () => {
    if (!selectedChannel) return;
    
    try {
      setLoading(true);
      const history = await getChannelHistory?.(selectedChannel, 50);
      if (history) {
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading channel messages:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, getChannelHistory]);

  const markChannelAsRead = useCallback(async () => {
    if (!selectedChannel) return;
    
    try {
      await markAsRead?.(selectedChannel);
    } catch (error) {
      console.error('Error marking channel as read:', error);
    }
  }, [selectedChannel, markAsRead]);

  const updateOnlineStatus = useCallback(() => {
    if (channelMembers.length > 0) {
      const online = channelMembers
        .filter(member => member.status === 'online')
        .map(member => member.userId);
      setOnlineUsers(online);
    }
  }, [channelMembers]);

  const syncPresenceData = useCallback(async () => {
    try {
      const presenceData = await getPresenceData?.();
      if (presenceData) {
        // Update user presence status
        updatePresence?.('online');
      }
    } catch (error) {
      console.error('Error syncing presence data:', error);
    }
  }, [getPresenceData, updatePresence]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      setLoading(true);
      
      // Track activity
      trackUserAction?.('chat_message_sent', {
        channelId: selectedChannel,
        messageLength: newMessage.length,
        mentions: extractMentions(newMessage),
        hasAttachments: false,
        isReply: !!replyToMessage
      });

      // Process with AI for enhancement
      let processedMessage = newMessage;
      if (aiContext?.enhanceMessages) {
        const enhanced = await processNaturalLanguage?.(newMessage, {
          context: 'team_chat',
          enhance: true,
          detectIntent: true
        });
        if (enhanced?.enhancedText) {
          processedMessage = enhanced.enhancedText;
        }
      }

      // Send message
      const messageData: Partial<ChatMessage> = {
        type: 'text',
        content: processedMessage,
        replyTo: replyToMessage || undefined,
        mentions: extractMentions(newMessage),
        metadata: {
          urgency: detectUrgency(newMessage),
          tags: extractTags(newMessage),
          category: 'general',
          status: 'unread'
        }
      };

      await sendMessage?.(selectedChannel, messageData);
      
      // Clear input and reset state
      setNewMessage('');
      setReplyToMessage(null);
      setIsTyping(false);
      
      // Focus back to input
      messageInputRef.current?.focus();

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }, [newMessage, selectedChannel, replyToMessage, trackUserAction, processNaturalLanguage, sendMessage, aiContext]);

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await editMessage?.(messageId, newContent);
      setEditingMessage(null);
      
      trackUserAction?.('chat_message_edited', {
        messageId,
        newLength: newContent.length
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }, [editMessage, trackUserAction]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage?.(messageId);
      
      trackUserAction?.('chat_message_deleted', {
        messageId
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [deleteMessage, trackUserAction]);

  const handleAddReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await addReaction?.(messageId, emoji);
      
      trackUserAction?.('chat_reaction_added', {
        messageId,
        emoji
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, [addReaction, trackUserAction]);

  const handleCreateThread = useCallback(async (messageId: string) => {
    try {
      const threadId = await createThread?.(messageId);
      if (threadId) {
        setSelectedThread(threadId);
        setShowThreads(true);
      }
      
      trackUserAction?.('chat_thread_created', {
        messageId,
        threadId
      });
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  }, [createThread, trackUserAction]);

  const handleStartVoiceCall = useCallback(async () => {
    if (!selectedChannel) return;
    
    try {
      const callId = await startVoiceCall?.(selectedChannel);
      if (callId) {
        // Handle voice call setup
        trackUserAction?.('voice_call_started', {
          channelId: selectedChannel,
          callId
        });
      }
    } catch (error) {
      console.error('Error starting voice call:', error);
    }
  }, [selectedChannel, startVoiceCall, trackUserAction]);

  const handleStartVideoCall = useCallback(async () => {
    if (!selectedChannel) return;
    
    try {
      const callId = await startVideoCall?.(selectedChannel);
      if (callId) {
        // Handle video call setup
        trackUserAction?.('video_call_started', {
          channelId: selectedChannel,
          callId
        });
      }
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  }, [selectedChannel, startVideoCall, trackUserAction]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!selectedChannel || files.length === 0) return;

    try {
      setLoading(true);
      
      for (const file of Array.from(files)) {
        // Validate file
        const isValid = await validateFile(file);
        if (!isValid) continue;

        // Upload file
        const attachment = await uploadFile(file);
        if (attachment) {
          // Send message with attachment
          const messageData: Partial<ChatMessage> = {
            type: getFileMessageType(file.type) as any,
            content: `Shared ${file.name}`,
            attachments: [attachment],
            metadata: {
              category: 'file_share',
              status: 'unread'
            }
          };

          await sendMessage?.(selectedChannel, messageData);
        }
      }

      trackUserAction?.('files_uploaded', {
        channelId: selectedChannel,
        fileCount: files.length
      });

    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, sendMessage, trackUserAction]);

  const handleChannelSelect = useCallback((channelId: string) => {
    setSelectedChannel(channelId);
    setSelectedThread(null);
    setReplyToMessage(null);
    setEditingMessage(null);
    
    trackUserAction?.('channel_selected', {
      channelId
    });
  }, [trackUserAction]);

  const handleCreateChannel = useCallback(async (channelData: Partial<ChatChannel>) => {
    try {
      const channelId = await createChannel?.(channelData);
      if (channelId) {
        setSelectedChannel(channelId);
        
        trackUserAction?.('channel_created', {
          channelId,
          channelType: channelData.type
        });
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }, [createChannel, trackUserAction]);

  const handleInviteUser = useCallback(async (userId: string) => {
    if (!selectedChannel) return;
    
    try {
      await inviteToChannel?.(selectedChannel, userId);
      
      trackUserAction?.('user_invited', {
        channelId: selectedChannel,
        invitedUserId: userId
      });
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  }, [selectedChannel, inviteToChannel, trackUserAction]);

  // Utility functions
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const extractTags = (text: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  };

  const detectUrgency = (text: string): 'low' | 'medium' | 'high' | 'critical' => {
    const urgentKeywords = ['urgent', 'asap', 'critical', 'emergency', 'immediate'];
    const highKeywords = ['important', 'priority', 'needed'];
    
    const lowerText = text.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'critical';
    } else if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    } else if (text.includes('!')) {
      return 'medium';
    }
    
    return 'low';
  };

  const validateFile = async (file: File): Promise<boolean> => {
    // File size validation (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return false;
    }

    // File type validation
    const allowedTypes = [
      'image/', 'video/', 'audio/', 'text/', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument'
    ];
    
    return allowedTypes.some(type => file.type.startsWith(type));
  };

  const uploadFile = async (file: File): Promise<ChatAttachment | null> => {
    // Simulate file upload - in real implementation, this would upload to server
    return {
      id: `attachment_${Date.now()}`,
      name: file.name,
      type: getFileMessageType(file.type) as any,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedBy: currentUser?.id || '',
      uploadedAt: new Date().toISOString(),
      securityLevel: 'internal',
      scanStatus: 'clean'
    };
  };

  const getFileMessageType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  const getChannelIcon = (channel: ChatChannel) => {
    switch (channel.type) {
      case 'public': return <Hash className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'direct': return <AtSign className="w-4 h-4" />;
      case 'group': return <Users className="w-4 h-4" />;
      case 'announcement': return <Bell className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'away': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'busy': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const emojiList = ['👍', '❤️', '😂', '😢', '😡', '👏', '🎉', '🔥', '💯', '🚀'];

  return (
    <TooltipProvider>
      <motion.div
        className="fixed right-4 top-20 z-50"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`transition-all duration-300 ${
          isExpanded 
            ? 'w-96 h-[600px]' 
            : 'w-80 h-14'
        } bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-lg border-blue-200/20 shadow-xl`}>
          {/* Header */}
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-blue-900">Team Chat</CardTitle>
                  {selectedChannel && currentChannelData && (
                    <p className="text-sm text-blue-600 flex items-center space-x-1">
                      {getChannelIcon(currentChannelData)}
                      <span>{currentChannelData.name}</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-1">
                          {unreadCount}
                        </Badge>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      {isExpanded ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isExpanded ? 'Minimize' : 'Expand'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="p-4 pt-0 h-[540px] flex flex-col">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                      <TabsTrigger value="channels" className="text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        Channels
                      </TabsTrigger>
                      <TabsTrigger value="chat" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="calls" className="text-xs">
                        <Phone className="w-3 h-3 mr-1" />
                        Calls
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="text-xs">
                        <Settings className="w-3 h-3 mr-1" />
                        Settings
                      </TabsTrigger>
                    </TabsList>

                    {/* Channels Tab */}
                    <TabsContent value="channels" className="flex-1 flex flex-col space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search channels..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 text-sm"
                          />
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Channel</DialogTitle>
                              <DialogDescription>
                                Create a new channel for team collaboration
                              </DialogDescription>
                            </DialogHeader>
                            {/* Channel creation form would go here */}
                          </DialogContent>
                        </Dialog>
                      </div>

                      <ScrollArea className="flex-1">
                        <div className="space-y-2">
                          {channels.map((channel) => (
                            <motion.div
                              key={channel.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card
                                className={`p-3 cursor-pointer transition-all border-l-4 ${
                                  selectedChannel === channel.id
                                    ? 'bg-blue-50 border-l-blue-500 shadow-md'
                                    : 'bg-white/50 border-l-transparent hover:bg-blue-25'
                                }`}
                                onClick={() => handleChannelSelect(channel.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 flex-1">
                                    {getChannelIcon(channel)}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {channel.name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {channel.members.length} members
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    {channel.unreadCount && channel.unreadCount > 0 && (
                                      <Badge variant="destructive" className="text-xs px-1">
                                        {channel.unreadCount}
                                      </Badge>
                                    )}
                                    
                                    {onlineUsers.filter(userId => 
                                      channel.members.some(member => member.userId === userId)
                                    ).length > 0 && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Chat Tab */}
                    <TabsContent value="chat" className="flex-1 flex flex-col">
                      {selectedChannel && currentChannelData ? (
                        <div className="flex-1 flex flex-col">
                          {/* Chat Header */}
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg mb-3">
                            <div className="flex items-center space-x-2">
                              {getChannelIcon(currentChannelData)}
                              <div>
                                <p className="font-medium text-sm">{currentChannelData.name}</p>
                                <p className="text-xs text-gray-500">
                                  {onlineUsers.length} online
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleStartVoiceCall}
                                    className="text-blue-600 hover:bg-blue-100"
                                  >
                                    <Phone className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Start Voice Call</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleStartVideoCall}
                                    className="text-blue-600 hover:bg-blue-100"
                                  >
                                    <Video className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Start Video Call</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowUserList(!showUserList)}
                                    className="text-blue-600 hover:bg-blue-100"
                                  >
                                    <Users className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Member List</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>

                          {/* Messages Area */}
                          <ScrollArea className="flex-1 mb-3">
                            <div className="space-y-2">
                              {loading ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                                </div>
                              ) : filteredMessages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No messages yet</p>
                                  <p className="text-xs">Start the conversation!</p>
                                </div>
                              ) : (
                                filteredMessages.map((message) => (
                                  <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex space-x-2 ${
                                      message.senderId === currentUser?.id 
                                        ? 'flex-row-reverse space-x-reverse' 
                                        : 'flex-row'
                                    }`}
                                  >
                                    {message.senderId !== currentUser?.id && (
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage src={message.senderAvatar} />
                                        <AvatarFallback className="text-xs">
                                          {message.senderName.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    
                                    <div className={`flex-1 max-w-[80%] ${
                                      message.senderId === currentUser?.id 
                                        ? 'items-end' 
                                        : 'items-start'
                                    }`}>
                                      <div className={`p-2 rounded-lg ${
                                        message.senderId === currentUser?.id
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-white border border-gray-200'
                                      }`}>
                                        {message.senderId !== currentUser?.id && (
                                          <p className="text-xs font-medium mb-1">
                                            {message.senderName}
                                          </p>
                                        )}
                                        
                                        {message.replyTo && (
                                          <div className="mb-2 p-2 bg-black/10 rounded text-xs">
                                            <p className="opacity-75">Replying to:</p>
                                            <p className="truncate">
                                              {messages.find(m => m.id === message.replyTo)?.content}
                                            </p>
                                          </div>
                                        )}
                                        
                                        <p className="text-sm">{message.content}</p>
                                        
                                        {message.attachments && message.attachments.length > 0 && (
                                          <div className="mt-2 space-y-1">
                                            {message.attachments.map((attachment) => (
                                              <div
                                                key={attachment.id}
                                                className="flex items-center space-x-2 p-2 bg-black/10 rounded"
                                              >
                                                <Paperclip className="w-4 h-4" />
                                                <span className="text-xs truncate">
                                                  {attachment.name}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        
                                        {message.reactions && message.reactions.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {message.reactions.map((reaction, index) => (
                                              <Badge
                                                key={index}
                                                variant="secondary"
                                                className="text-xs px-1 cursor-pointer"
                                                onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                              >
                                                {reaction.emoji} {reaction.count}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mt-1">
                                          <p className="text-xs opacity-60">
                                            {formatTimestamp(message.timestamp)}
                                            {message.edited && ' (edited)'}
                                          </p>
                                          
                                          <div className="flex items-center space-x-1">
                                            {message.metadata?.status === 'read' && (
                                              <CheckCheck className="w-3 h-3 opacity-60" />
                                            )}
                                            
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-auto p-0 opacity-60 hover:opacity-100"
                                                >
                                                  <MoreHorizontal className="w-3 h-3" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                  onClick={() => setReplyToMessage(message.id)}
                                                >
                                                  <Reply className="w-4 h-4 mr-2" />
                                                  Reply
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem
                                                  onClick={() => handleCreateThread(message.id)}
                                                >
                                                  <MessageSquare className="w-4 h-4 mr-2" />
                                                  Start Thread
                                                </DropdownMenuItem>
                                                
                                                {message.senderId === currentUser?.id && (
                                                  <>
                                                    <DropdownMenuItem
                                                      onClick={() => setEditingMessage(message.id)}
                                                    >
                                                      <Edit className="w-4 h-4 mr-2" />
                                                      Edit
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem
                                                      onClick={() => handleDeleteMessage(message.id)}
                                                      className="text-red-600"
                                                    >
                                                      <Trash className="w-4 h-4 mr-2" />
                                                      Delete
                                                    </DropdownMenuItem>
                                                  </>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                
                                                <DropdownMenuItem>
                                                  <Copy className="w-4 h-4 mr-2" />
                                                  Copy
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem>
                                                  <Pin className="w-4 h-4 mr-2" />
                                                  Pin
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Quick Reactions */}
                                      <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {emojiList.slice(0, 3).map((emoji) => (
                                          <Button
                                            key={emoji}
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-1 text-xs"
                                            onClick={() => handleAddReaction(message.id, emoji)}
                                          >
                                            {emoji}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                              <div ref={messagesEndRef} />
                            </div>
                          </ScrollArea>

                          {/* Reply Preview */}
                          {replyToMessage && (
                            <div className="mb-2 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-xs text-blue-600 font-medium">
                                    Replying to {messages.find(m => m.id === replyToMessage)?.senderName}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate">
                                    {messages.find(m => m.id === replyToMessage)?.content}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setReplyToMessage(null)}
                                  className="h-auto p-1"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* AI Suggestions */}
                          {aiSuggestions.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 mb-1">AI Suggestions:</p>
                              <div className="flex flex-wrap gap-1">
                                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs cursor-pointer hover:bg-blue-50"
                                    onClick={() => setNewMessage(suggestion)}
                                  >
                                    {suggestion}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Message Input */}
                          <div className="space-y-2">
                            <div className="flex items-end space-x-2">
                              <div className="flex-1">
                                <Textarea
                                  ref={messageInputRef}
                                  placeholder="Type a message..."
                                  value={newMessage}
                                  onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    setIsTyping(true);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendMessage();
                                    }
                                  }}
                                  className="min-h-[40px] max-h-24 resize-none text-sm"
                                  disabled={loading}
                                />
                              </div>
                              
                              <div className="flex items-center space-x-1">
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
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => fileInputRef.current?.click()}
                                      className="text-gray-500 hover:text-blue-600"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Attach File</TooltipContent>
                                </Tooltip>

                                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-500 hover:text-blue-600"
                                    >
                                      <Smile className="w-4 h-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-2">
                                    <div className="grid grid-cols-5 gap-1">
                                      {emojiList.map((emoji) => (
                                        <Button
                                          key={emoji}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setNewMessage(prev => prev + emoji);
                                            setShowEmojiPicker(false);
                                          }}
                                          className="h-auto p-2 text-lg"
                                        >
                                          {emoji}
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        // Toggle voice recording
                                        setIsRecording(!isRecording);
                                      }}
                                      className={`${
                                        isRecording 
                                          ? 'text-red-600 bg-red-50' 
                                          : 'text-gray-500 hover:text-blue-600'
                                      }`}
                                    >
                                      {isRecording ? (
                                        <MicOff className="w-4 h-4" />
                                      ) : (
                                        <Mic className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isRecording ? 'Stop Recording' : 'Voice Message'}
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={handleSendMessage}
                                      disabled={!newMessage.trim() || loading}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                      ) : (
                                        <Send className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Send Message</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>

                            {/* Typing Indicators */}
                            {isTyping && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <div className="flex space-x-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100" />
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200" />
                                </div>
                                <span>Someone is typing...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Select a channel</p>
                            <p className="text-xs">Choose a channel to start chatting</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Calls Tab */}
                    <TabsContent value="calls" className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Active Calls</h3>
                        <div className="flex space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleStartVoiceCall}
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Start Voice Call</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleStartVideoCall}
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                <Video className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Start Video Call</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {activeCall ? (
                        <Card className="p-4 bg-green-50 border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {'participants' in activeCall && activeCall.participants.some(p => 'isVideoEnabled' in p) ? (
                                <Video className="w-5 h-5 text-green-600" />
                              ) : (
                                <Phone className="w-5 h-5 text-green-600" />
                              )}
                              <div>
                                <p className="font-medium text-sm">Active Call</p>
                                <p className="text-xs text-gray-600">
                                  {activeCall.participants.length} participant(s)
                                </p>
                              </div>
                            </div>
                            
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {activeCall.quality}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            {activeCall.participants.map((participant, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs">
                                      U{index + 1}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">User {index + 1}</span>
                                  {participant.isSpeaking && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  {'isVideoEnabled' in participant && participant.isVideoEnabled && (
                                    <Camera className="w-4 h-4 text-blue-600" />
                                  )}
                                  {'isMuted' in participant && participant.isMuted && (
                                    <MicOff className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-100"
                              onClick={() => endCall?.(activeCall.id)}
                            >
                              <Phone className="w-4 h-4" />
                              End Call
                            </Button>
                            
                            {activeCall.recording?.enabled && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                                Recording
                              </Button>
                            )}
                          </div>
                        </Card>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">No active calls</p>
                            <p className="text-xs">Start a voice or video call</p>
                          </div>
                        </div>
                      )}

                      {/* Recent Calls */}
                      <div className="mt-6">
                        <h4 className="font-medium text-sm mb-2">Recent Calls</h4>
                        <div className="text-center text-gray-500 text-sm">
                          No recent calls
                        </div>
                      </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="flex-1 flex flex-col space-y-4">
                      <div>
                        <h3 className="font-medium mb-3">Chat Settings</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Notifications</p>
                              <p className="text-xs text-gray-500">Enable chat notifications</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Sound</p>
                              <p className="text-xs text-gray-500">Play notification sounds</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Read Receipts</p>
                              <p className="text-xs text-gray-500">Show when messages are read</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Typing Indicators</p>
                              <p className="text-xs text-gray-500">Show when others are typing</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">AI Assistant</p>
                              <p className="text-xs text-gray-500">Enable AI suggestions</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <Label htmlFor="theme" className="text-sm">Theme</Label>
                            <Select defaultValue="auto">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="auto">Auto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="font-size" className="text-sm">Font Size</Label>
                            <Select defaultValue="medium">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Show Online Status</p>
                              <p className="text-xs text-gray-500">Let others see when you're online</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Allow Direct Messages</p>
                              <p className="text-xs text-gray-500">Allow anyone to message you directly</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export Chat Data
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archived Channels
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-red-600 hover:text-red-700"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Clear Chat History
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Member List Sidebar */}
        <AnimatePresence>
          {showUserList && isExpanded && selectedChannel && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed right-[400px] top-20 z-40"
            >
              <Card className="w-64 h-[600px] bg-white/95 backdrop-blur-lg border-gray-200/20 shadow-xl">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Members</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUserList(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="h-[520px]">
                    <div className="space-y-2">
                      {channelMembers.map((member) => (
                        <div
                          key={member.userId}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                        >
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-xs">
                                {member.displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1">
                              {getStatusIcon(member.status)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.displayName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {member.role}
                            </p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-1">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed right-4 top-[640px] z-40"
            >
              <Card className="w-80 max-h-96 bg-white/95 backdrop-blur-lg border-gray-200/20 shadow-xl">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Notifications</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <div className="text-center text-gray-500 text-sm py-8">
                    No new notifications
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickTeamChat;
