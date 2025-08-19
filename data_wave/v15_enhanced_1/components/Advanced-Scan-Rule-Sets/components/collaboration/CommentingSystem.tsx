import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { 
  MessageCircle,
  Reply,
  Edit,
  Trash2,
  Pin,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Share,
  MoreHorizontal,
  Send,
  Paperclip,
  Image,
  FileText,
  Link,
  Smile,
  At,
  Hash,
  Calendar,
  Clock,
  User,
  Users,
  Eye,
  EyeOff,
  Star,
  Bookmark,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollaboration } from '../../hooks/useCollaboration';
import { collaborationApi } from '../../services/collaboration-apis';
import { Comment, CommentThread, Reaction, Mention, Attachment } from '../../types/collaboration.types';

interface CommentingSystemProps {
  className?: string;
  contextId: string;
  contextType: 'rule' | 'workflow' | 'template' | 'optimization' | 'general';
  onCommentUpdate?: (comments: Comment[]) => void;
  onMention?: (mention: Mention) => void;
}

interface CommentData {
  id: string;
  content: string;
  contentType: 'text' | 'markdown' | 'rich';
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    department: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string;
  threadId: string;
  contextId: string;
  contextType: string;
  status: 'active' | 'resolved' | 'archived' | 'deleted';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'comment' | 'question' | 'suggestion' | 'issue' | 'approval';
  tags: string[];
  mentions: Mention[];
  attachments: Attachment[];
  reactions: Reaction[];
  replies: CommentData[];
  metadata: {
    isEdited: boolean;
    isPinned: boolean;
    isPrivate: boolean;
    visibility: 'public' | 'team' | 'private';
    approvalRequired: boolean;
    isApproved: boolean;
  };
  analytics: {
    views: number;
    engagement: number;
    helpfulness: number;
  };
}

interface CommentFilter {
  status: string[];
  priority: string[];
  type: string[];
  author: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  tags: string[];
  hasAttachments: boolean;
  sortBy: 'date' | 'priority' | 'engagement' | 'helpfulness';
  sortOrder: 'asc' | 'desc';
  showResolved: boolean;
  showArchived: boolean;
}

interface CommentThread {
  id: string;
  title: string;
  description?: string;
  contextId: string;
  contextType: string;
  status: 'open' | 'resolved' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdBy: string;
  assignedTo?: string;
  tags: string[];
  comments: CommentData[];
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  metadata: {
    isLocked: boolean;
    isPublic: boolean;
    requiresApproval: boolean;
    autoResolve: boolean;
  };
}

interface MentionSuggestion {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  isOnline: boolean;
}

const COMMENT_TYPES = [
  { value: 'comment', label: 'Comment', icon: MessageCircle },
  { value: 'question', label: 'Question', icon: HelpCircle },
  { value: 'suggestion', label: 'Suggestion', icon: Star },
  { value: 'issue', label: 'Issue', icon: AlertTriangle },
  { value: 'approval', label: 'Approval', icon: CheckCircle }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-blue-600' },
  { value: 'normal', label: 'Normal', color: 'text-green-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
];

export const CommentingSystem: React.FC<CommentingSystemProps> = ({
  className,
  contextId,
  contextType,
  onCommentUpdate,
  onMention
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'all' | 'unresolved' | 'my-comments' | 'mentions'>('all');
  
  // Comment creation and editing
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'question' | 'suggestion' | 'issue' | 'approval'>('comment');
  const [commentPriority, setCommentPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Mentions and suggestions
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  
  // Filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CommentFilter>({
    status: ['active'],
    priority: [],
    type: [],
    author: [],
    dateRange: {},
    tags: [],
    hasAttachments: false,
    sortBy: 'date',
    sortOrder: 'desc',
    showResolved: false,
    showArchived: false
  });
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  // Refs
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Hooks
  const {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    mentionUser,
    getUsers,
    loading: collaborationLoading,
    error: collaborationError
  } = useCollaboration();

  // Initialize data
  useEffect(() => {
    loadComments();
    loadMentionSuggestions();
  }, [contextId, contextType]);

  // Auto-refresh comments
  useEffect(() => {
    const interval = setInterval(loadComments, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [contextId, contextType]);

  // Data loading functions
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const commentsData = await getComments(contextId, contextType);
      setComments(commentsData);
      
      // Group comments into threads
      const threadsMap = new Map<string, CommentThread>();
      commentsData.forEach(comment => {
        if (!threadsMap.has(comment.threadId)) {
          threadsMap.set(comment.threadId, {
            id: comment.threadId,
            title: `Discussion on ${contextType}`,
            contextId: comment.contextId,
            contextType: comment.contextType,
            status: comment.status === 'resolved' ? 'resolved' : 'open',
            priority: comment.priority,
            createdBy: comment.author.id,
            tags: comment.tags,
            comments: [],
            participants: [],
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt || comment.createdAt,
            metadata: {
              isLocked: false,
              isPublic: !comment.metadata.isPrivate,
              requiresApproval: comment.metadata.approvalRequired,
              autoResolve: false
            }
          });
        }
        
        const thread = threadsMap.get(comment.threadId)!;
        thread.comments.push(comment);
        if (!thread.participants.includes(comment.author.id)) {
          thread.participants.push(comment.author.id);
        }
      });
      
      setThreads(Array.from(threadsMap.values()));
      
      if (onCommentUpdate) {
        onCommentUpdate(commentsData);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  }, [contextId, contextType, getComments, onCommentUpdate]);

  const loadMentionSuggestions = useCallback(async () => {
    try {
      const users = await getUsers();
      setMentionSuggestions(users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        isOnline: user.isOnline || false
      })));
    } catch (error) {
      console.error('Failed to load users for mentions:', error);
    }
  }, [getUsers]);

  // Comment operations
  const handleCreateComment = useCallback(async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      const comment = await createComment({
        content: newComment,
        contextId,
        contextType,
        type: commentType,
        priority: commentPriority,
        isPrivate,
        mentions: extractMentions(newComment),
        attachments: []
      });
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setShowCommentForm(false);
      
      // Notify mentions
      const mentions = extractMentions(newComment);
      mentions.forEach(mention => {
        if (onMention) {
          onMention(mention);
        }
      });
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setLoading(false);
    }
  }, [newComment, contextId, contextType, commentType, commentPriority, isPrivate, createComment, onMention]);

  const handleEditComment = useCallback(async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      setLoading(true);
      const updatedComment = await updateComment(commentId, {
        content: editContent,
        mentions: extractMentions(editContent)
      });
      
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setLoading(false);
    }
  }, [editContent, updateComment]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      setLoading(true);
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setShowDeleteDialog(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setLoading(false);
    }
  }, [deleteComment]);

  const handleReplyToComment = useCallback(async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      setLoading(true);
      const reply = await createComment({
        content: replyContent,
        contextId,
        contextType,
        parentId,
        type: 'comment',
        priority: 'normal',
        isPrivate: false,
        mentions: extractMentions(replyContent),
        attachments: []
      });
      
      setComments(prev => [...prev, reply]);
      setReplyToComment(null);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to reply to comment:', error);
    } finally {
      setLoading(false);
    }
  }, [replyContent, contextId, contextType, createComment]);

  const handleAddReaction = useCallback(async (commentId: string, type: string) => {
    try {
      await addReaction(commentId, type);
      // Update local state optimistically
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const existingReaction = comment.reactions.find(r => r.type === type && r.userId === 'current-user');
          if (existingReaction) {
            return {
              ...comment,
              reactions: comment.reactions.filter(r => r !== existingReaction)
            };
          } else {
            return {
              ...comment,
              reactions: [...comment.reactions, {
                id: Date.now().toString(),
                type,
                userId: 'current-user',
                userName: 'Current User',
                createdAt: new Date()
              }]
            };
          }
        }
        return comment;
      }));
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [addReaction]);

  // Utility functions
  const extractMentions = useCallback((content: string): Mention[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: Mention[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1];
      const user = mentionSuggestions.find(u => u.name.toLowerCase().includes(username.toLowerCase()));
      if (user) {
        mentions.push({
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          position: match.index,
          length: match[0].length,
          createdAt: new Date()
        });
      }
    }
    
    return mentions;
  }, [mentionSuggestions]);

  const handleMentionInput = useCallback((content: string, selectionStart: number) => {
    const beforeCursor = content.substring(0, selectionStart);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionPosition({ start: mentionMatch.index!, end: selectionStart });
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  }, []);

  const insertMention = useCallback((user: MentionSuggestion, inputValue: string, setInputValue: (value: string) => void) => {
    const beforeMention = inputValue.substring(0, mentionPosition.start);
    const afterMention = inputValue.substring(mentionPosition.end);
    const newValue = `${beforeMention}@${user.name} ${afterMention}`;
    
    setInputValue(newValue);
    setShowMentionDropdown(false);
    setMentionQuery('');
  }, [mentionPosition]);

  // Filter and sort comments
  const filteredComments = useMemo(() => {
    let filtered = comments.filter(comment => {
      // Filter by view
      if (activeView === 'unresolved' && comment.status === 'resolved') return false;
      if (activeView === 'my-comments' && comment.author.id !== 'current-user') return false;
      if (activeView === 'mentions' && !comment.mentions.some(m => m.userId === 'current-user')) return false;
      
      // Filter by search query
      if (searchQuery && !comment.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Filter by status
      if (filters.status.length && !filters.status.includes(comment.status)) return false;
      
      // Filter by priority
      if (filters.priority.length && !filters.priority.includes(comment.priority)) return false;
      
      // Filter by type
      if (filters.type.length && !filters.type.includes(comment.type)) return false;
      
      // Filter by author
      if (filters.author.length && !filters.author.includes(comment.author.id)) return false;
      
      // Filter by date range
      if (filters.dateRange.start && comment.createdAt < filters.dateRange.start) return false;
      if (filters.dateRange.end && comment.createdAt > filters.dateRange.end) return false;
      
      // Filter by attachments
      if (filters.hasAttachments && comment.attachments.length === 0) return false;
      
      return true;
    });
    
    // Sort comments
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 3, high: 2, normal: 1, low: 0 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'engagement':
          comparison = a.analytics.engagement - b.analytics.engagement;
          break;
        case 'helpfulness':
          comparison = a.analytics.helpfulness - b.analytics.helpfulness;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [comments, activeView, searchQuery, filters]);

  // Group comments by thread
  const groupedComments = useMemo(() => {
    const groups = new Map<string, CommentData[]>();
    
    filteredComments.forEach(comment => {
      if (!groups.has(comment.threadId)) {
        groups.set(comment.threadId, []);
      }
      groups.get(comment.threadId)!.push(comment);
    });
    
    return Array.from(groups.entries()).map(([threadId, comments]) => ({
      threadId,
      comments: comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    }));
  }, [filteredComments]);

  // Render functions
  const renderComment = (comment: CommentData, isReply = false) => (
    <div key={comment.id} className={cn(
      "border rounded-lg p-4 space-y-3",
      isReply && "ml-8 border-l-2 border-l-blue-200"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>{comment.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <Badge variant="outline" className="text-xs">{comment.author.role}</Badge>
              {comment.type !== 'comment' && (
                <Badge variant="secondary" className="text-xs">
                  {COMMENT_TYPES.find(t => t.value === comment.type)?.label}
                </Badge>
              )}
              {comment.priority !== 'normal' && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", 
                    PRIORITY_LEVELS.find(p => p.value === comment.priority)?.color
                  )}
                >
                  {PRIORITY_LEVELS.find(p => p.value === comment.priority)?.label}
                </Badge>
              )}
              {comment.metadata.isPinned && (
                <Pin className="h-3 w-3 text-orange-500" />
              )}
              {comment.metadata.isPrivate && (
                <EyeOff className="h-3 w-3 text-gray-500" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {comment.createdAt.toLocaleString()}
              {comment.metadata.isEdited && (
                <span className="ml-2">(edited)</span>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setReplyToComment(comment.id)}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
            {comment.author.id === 'current-user' && (
              <DropdownMenuItem onClick={() => {
                setEditingComment(comment.id);
                setEditContent(comment.content);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(comment.content)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              // Toggle pin status
            }}>
              <Pin className="h-4 w-4 mr-2" />
              {comment.metadata.isPinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setCommentToDelete(comment.id);
              setShowDeleteDialog(true);
            }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-2">
        {editingComment === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-20"
            />
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
        )}
        
        {comment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {comment.attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{attachment.name}</span>
                <Button size="sm" variant="ghost">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {comment.mentions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {comment.mentions.map(mention => (
              <Badge key={mention.id} variant="secondary" className="text-xs">
                @{mention.userName}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAddReaction(comment.id, 'like')}
              className={cn(
                comment.reactions.some(r => r.type === 'like' && r.userId === 'current-user') && 
                "text-blue-600 bg-blue-50"
              )}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {comment.reactions.filter(r => r.type === 'like').length || ''}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAddReaction(comment.id, 'love')}
              className={cn(
                comment.reactions.some(r => r.type === 'love' && r.userId === 'current-user') && 
                "text-red-600 bg-red-50"
              )}
            >
              <Heart className="h-3 w-3 mr-1" />
              {comment.reactions.filter(r => r.type === 'love').length || ''}
            </Button>
          </div>
          
          <Button size="sm" variant="ghost" onClick={() => setReplyToComment(comment.id)}>
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
          
          {comment.replies.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {comment.analytics.views > 0 && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {comment.analytics.views}
            </div>
          )}
        </div>
      </div>
      
      {replyToComment === comment.id && (
        <div className="space-y-2 p-3 bg-gray-50 rounded">
          <Textarea
            ref={replyInputRef}
            value={replyContent}
            onChange={(e) => {
              setReplyContent(e.target.value);
              handleMentionInput(e.target.value, e.target.selectionStart || 0);
            }}
            placeholder="Write a reply..."
            className="min-h-16"
          />
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={() => handleReplyToComment(comment.id)}>
              <Send className="h-3 w-3 mr-1" />
              Reply
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setReplyToComment(null);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Comments & Discussions</h3>
          <p className="text-sm text-muted-foreground">
            Collaborate and provide feedback on {contextType}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadComments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCommentForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={activeView} onValueChange={setActiveView}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="my-comments">My Comments</SelectItem>
            <SelectItem value="mentions">Mentions</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "bg-gray-100")}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Sort By</Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="helpfulness">Helpfulness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.showResolved}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showResolved: checked }))}
                />
                <Label className="text-sm">Show resolved</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.hasAttachments}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasAttachments: checked }))}
                />
                <Label className="text-sm">Has attachments</Label>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : groupedComments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No comments yet</h3>
              <p className="text-muted-foreground mb-4">
                Start the conversation by adding the first comment
              </p>
              <Button onClick={() => setShowCommentForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </CardContent>
          </Card>
        ) : (
          groupedComments.map(({ threadId, comments }) => (
            <Card key={threadId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">Discussion Thread</span>
                    <Badge variant="outline">{comments.length} comments</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.map(comment => renderComment(comment))}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <Dialog open={showCommentForm} onOpenChange={setShowCommentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Comment</DialogTitle>
            <DialogDescription>
              Share your thoughts, ask questions, or provide feedback
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="comment-type">Comment Type</Label>
                <Select value={commentType} onValueChange={setCommentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 mr-2" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="comment-priority">Priority</Label>
                <Select value={commentPriority} onValueChange={setCommentPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <span className={level.color}>{level.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment-content">Comment</Label>
              <Textarea
                id="comment-content"
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  handleMentionInput(e.target.value, e.target.selectionStart || 0);
                }}
                placeholder="Type your comment here... Use @username to mention someone"
                className="min-h-32"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Tip: Use @username to mention team members, #tags for categorization
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                <Label className="text-sm">Private comment</Label>
              </div>
              
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCommentForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateComment} disabled={!newComment.trim() || loading}>
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mention Dropdown */}
      {showMentionDropdown && (
        <Popover open={showMentionDropdown} onOpenChange={setShowMentionDropdown}>
          <PopoverContent className="w-64 p-1">
            <div className="space-y-1">
              {mentionSuggestions
                .filter(user => 
                  user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(mentionQuery.toLowerCase())
                )
                .slice(0, 5)
                .map(user => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => insertMention(user, newComment, setNewComment)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.role}</div>
                    </div>
                    {user.isOnline && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentingSystem;