import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users,
  UserCheck,
  MessageCircle,
  Clock,
  Calendar,
  Star,
  Award,
  Brain,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Send,
  Phone,
  Video,
  Mail,
  Bell,
  Settings,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Unlock,
  ShieldCheck,
  Flag,
  Tag,
  FileText,
  Image,
  Link,
  Code,
  Database,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  History,
  Timer,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Headphones,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  GitBranch,
  Network,
  Layers,
  Workflow,
  Route
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollaboration } from '../../hooks/useCollaboration';
import { collaborationApi } from '../../services/collaboration-apis';

interface ExpertConsultationProps {
  className?: string;
  onConsultationUpdate?: (consultation: ExpertConsultation) => void;
  onExpertAssignment?: (assignment: ExpertAssignment) => void;
}

interface ExpertConsultation {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  requesterRole: string;
  category: string;
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'matched' | 'in_progress' | 'completed' | 'cancelled' | 'escalated';
  type: 'question' | 'review' | 'mentoring' | 'technical_support' | 'strategic_advice' | 'code_review' | 'architecture_review';
  urgency: 'immediate' | 'today' | 'this_week' | 'flexible';
  estimatedDuration: number; // in minutes
  preferredFormat: 'chat' | 'call' | 'video' | 'email' | 'in_person';
  attachments: ConsultationAttachment[];
  requiredExpertise: string[];
  context: {
    projectId?: string;
    projectName?: string;
    relatedItems: string[];
    backgroundInfo: string;
  };
  experts: ExpertAssignment[];
  primaryExpert?: ExpertAssignment;
  sessions: ConsultationSession[];
  feedback: ConsultationFeedback[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  resolvedAt?: Date;
  metadata: {
    isPublic: boolean;
    allowMultipleExperts: boolean;
    requiresNDA: boolean;
    confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
    budgetAllocated?: number;
    costCenter?: string;
  };
  analytics: {
    responseTime: number;
    expertEngagement: number;
    satisfactionScore?: number;
    followUpRequests: number;
    knowledgeBaseContributions: number;
  };
}

interface ExpertAssignment {
  id: string;
  consultationId: string;
  expertId: string;
  expertName: string;
  expertAvatar?: string;
  expertRole: string;
  department: string;
  expertise: string[];
  specializations: string[];
  rating: number;
  responseRate: number;
  assignedAt: Date;
  acceptedAt?: Date;
  status: 'invited' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  estimatedCommitment: number;
  actualTimeSpent?: number;
  isLead: boolean;
  canDelegate: boolean;
  delegatedTo?: string[];
  availability: {
    timezone: string;
    preferredHours: string[];
    nextAvailable: Date;
    maxConcurrentConsultations: number;
    currentLoad: number;
  };
  skills: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    verified: boolean;
    endorsements: number;
  }[];
}

interface ConsultationSession {
  id: string;
  consultationId: string;
  type: 'chat' | 'call' | 'video' | 'screen_share' | 'in_person';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  participants: {
    userId: string;
    userName: string;
    role: 'requester' | 'expert' | 'observer';
    joinedAt?: Date;
    leftAt?: Date;
  }[];
  recording?: {
    url: string;
    duration: number;
    transcript?: string;
    highlights: string[];
  };
  notes: string;
  actionItems: {
    id: string;
    description: string;
    assignee: string;
    dueDate?: Date;
    completed: boolean;
  }[];
  resources: {
    name: string;
    url: string;
    type: 'document' | 'link' | 'tool' | 'code' | 'template';
  }[];
}

interface ConsultationAttachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'code' | 'dataset' | 'diagram';
  url: string;
  size: number;
  thumbnailUrl?: string;
  description?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface ConsultationFeedback {
  id: string;
  consultationId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  type: 'requester_to_expert' | 'expert_to_requester' | 'peer_review';
  rating: number;
  categories: {
    expertise: number;
    communication: number;
    responsiveness: number;
    helpfulness: number;
    professionalism: number;
  };
  comments: string;
  recommendations: string[];
  wouldRecommend: boolean;
  submittedAt: Date;
}

interface ExpertProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  title: string;
  bio: string;
  expertise: string[];
  specializations: string[];
  certifications: {
    name: string;
    issuer: string;
    date: Date;
    expiryDate?: Date;
  }[];
  languages: string[];
  rating: number;
  totalConsultations: number;
  completedConsultations: number;
  averageResponseTime: number;
  successRate: number;
  endorsements: {
    skill: string;
    count: number;
    recentEndorsers: string[];
  }[];
  availability: {
    timezone: string;
    workingHours: string;
    maxHoursPerWeek: number;
    currentLoad: number;
    nextAvailable: Date;
  };
  preferences: {
    consultationTypes: string[];
    maxDuration: number;
    preferredFormats: string[];
    requiresPrerequisites: boolean;
  };
  metrics: {
    totalHours: number;
    avgSessionDuration: number;
    knowledgeBaseContributions: number;
    mentorshipSessions: number;
    satisfaction: number;
  };
}

interface ConsultationAnalytics {
  totalConsultations: number;
  activeConsultations: number;
  completedConsultations: number;
  averageResolutionTime: number;
  satisfactionScore: number;
  expertUtilization: number;
  popularCategories: Array<{
    category: string;
    count: number;
    avgRating: number;
    growth: number;
  }>;
  topExperts: Array<{
    expertId: string;
    expertName: string;
    consultations: number;
    rating: number;
    responseTime: number;
    specializations: string[];
  }>;
  trends: Array<{
    date: string;
    requested: number;
    completed: number;
    satisfaction: number;
    avgDuration: number;
  }>;
  responseTimeMetrics: {
    immediate: number;
    withinHour: number;
    withinDay: number;
    overDay: number;
  };
}

const CONSULTATION_TYPES = [
  { value: 'question', label: 'Question', icon: HelpCircle, description: 'General questions and inquiries' },
  { value: 'review', label: 'Review', icon: Eye, description: 'Code, design, or document review' },
  { value: 'mentoring', label: 'Mentoring', icon: Users, description: 'Ongoing guidance and mentorship' },
  { value: 'technical_support', label: 'Technical Support', icon: Settings, description: 'Technical troubleshooting and support' },
  { value: 'strategic_advice', label: 'Strategic Advice', icon: Target, description: 'Strategic planning and advice' },
  { value: 'code_review', label: 'Code Review', icon: Code, description: 'Code quality and best practices review' },
  { value: 'architecture_review', label: 'Architecture Review', icon: Network, description: 'System architecture review' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

const URGENCY_LEVELS = [
  { value: 'flexible', label: 'Flexible', description: 'No specific timeline' },
  { value: 'this_week', label: 'This Week', description: 'Within the next week' },
  { value: 'today', label: 'Today', description: 'Within 24 hours' },
  { value: 'immediate', label: 'Immediate', description: 'ASAP - urgent response needed' }
];

const CONSULTATION_FORMATS = [
  { value: 'chat', label: 'Chat', icon: MessageCircle, description: 'Text-based conversation' },
  { value: 'call', label: 'Voice Call', icon: Phone, description: 'Audio conversation' },
  { value: 'video', label: 'Video Call', icon: Video, description: 'Video conference' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email correspondence' },
  { value: 'in_person', label: 'In Person', icon: Users, description: 'Face-to-face meeting' }
];

export const ExpertConsultation: React.FC<ExpertConsultationProps> = ({
  className,
  onConsultationUpdate,
  onExpertAssignment
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'requests' | 'my_consultations' | 'experts' | 'sessions' | 'analytics'>('requests');
  const [consultations, setConsultations] = useState<ExpertConsultation[]>([]);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [analytics, setAnalytics] = useState<ConsultationAnalytics | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<ExpertConsultation | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  
  // Creation and editing
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showConsultationDetails, setShowConsultationDetails] = useState(false);
  const [showExpertProfile, setShowExpertProfile] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  
  // Form states
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    type: 'question' as ExpertConsultation['type'],
    priority: 'normal' as ExpertConsultation['priority'],
    urgency: 'flexible' as ExpertConsultation['urgency'],
    estimatedDuration: 30,
    preferredFormat: 'chat' as ExpertConsultation['preferredFormat'],
    requiredExpertise: [] as string[],
    backgroundInfo: '',
    isPublic: false,
    allowMultipleExperts: true,
    requiresNDA: false
  });
  
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    expertise: 5,
    communication: 5,
    responsiveness: 5,
    helpfulness: 5,
    professionalism: 5,
    comments: '',
    wouldRecommend: true,
    recommendations: [] as string[]
  });
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expertiseFilter, setExpertiseFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Hooks
  const {
    getExpertConsultations,
    createExpertConsultation,
    updateExpertConsultation,
    getExpertProfiles,
    assignExpert,
    scheduleConsultationSession,
    submitConsultationFeedback,
    getConsultationAnalytics,
    loading: collaborationLoading,
    error: collaborationError
  } = useCollaboration();

  // Initialize data
  useEffect(() => {
    loadConsultations();
    loadExperts();
    loadAnalytics();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      loadConsultations();
      loadAnalytics();
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  // Data loading functions
  const loadConsultations = useCallback(async () => {
    try {
      setLoading(true);
      const consultationsData = await getExpertConsultations();
      setConsultations(consultationsData);
    } catch (error) {
      console.error('Failed to load consultations:', error);
    } finally {
      setLoading(false);
    }
  }, [getExpertConsultations]);

  const loadExperts = useCallback(async () => {
    try {
      const expertsData = await getExpertProfiles();
      setExperts(expertsData);
    } catch (error) {
      console.error('Failed to load experts:', error);
    }
  }, [getExpertProfiles]);

  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await getConsultationAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [getConsultationAnalytics]);

  // CRUD operations
  const handleCreateRequest = useCallback(async () => {
    try {
      setLoading(true);
      const consultation = await createExpertConsultation({
        title: requestForm.title,
        description: requestForm.description,
        category: requestForm.category,
        tags: requestForm.tags,
        type: requestForm.type,
        priority: requestForm.priority,
        urgency: requestForm.urgency,
        estimatedDuration: requestForm.estimatedDuration,
        preferredFormat: requestForm.preferredFormat,
        requiredExpertise: requestForm.requiredExpertise,
        context: {
          backgroundInfo: requestForm.backgroundInfo,
          relatedItems: []
        },
        metadata: {
          isPublic: requestForm.isPublic,
          allowMultipleExperts: requestForm.allowMultipleExperts,
          requiresNDA: requestForm.requiresNDA,
          confidentialityLevel: requestForm.requiresNDA ? 'confidential' : 'internal'
        }
      });
      
      setConsultations(prev => [...prev, consultation]);
      setShowCreateRequest(false);
      setRequestForm({
        title: '',
        description: '',
        category: '',
        tags: [],
        type: 'question',
        priority: 'normal',
        urgency: 'flexible',
        estimatedDuration: 30,
        preferredFormat: 'chat',
        requiredExpertise: [],
        backgroundInfo: '',
        isPublic: false,
        allowMultipleExperts: true,
        requiresNDA: false
      });
      
      if (onConsultationUpdate) {
        onConsultationUpdate(consultation);
      }
    } catch (error) {
      console.error('Failed to create consultation request:', error);
    } finally {
      setLoading(false);
    }
  }, [requestForm, createExpertConsultation, onConsultationUpdate]);

  const handleAssignExpert = useCallback(async (consultationId: string, expertId: string) => {
    try {
      setLoading(true);
      const assignment = await assignExpert(consultationId, expertId);
      
      // Update consultation state
      setConsultations(prev => prev.map(consultation => {
        if (consultation.id === consultationId) {
          return {
            ...consultation,
            experts: [...consultation.experts, assignment],
            status: 'matched'
          };
        }
        return consultation;
      }));
      
      if (onExpertAssignment) {
        onExpertAssignment(assignment);
      }
    } catch (error) {
      console.error('Failed to assign expert:', error);
    } finally {
      setLoading(false);
    }
  }, [assignExpert, onExpertAssignment]);

  const handleSubmitFeedback = useCallback(async (consultationId: string, expertId: string) => {
    try {
      setLoading(true);
      await submitConsultationFeedback(consultationId, expertId, {
        rating: feedbackForm.rating,
        categories: {
          expertise: feedbackForm.expertise,
          communication: feedbackForm.communication,
          responsiveness: feedbackForm.responsiveness,
          helpfulness: feedbackForm.helpfulness,
          professionalism: feedbackForm.professionalism
        },
        comments: feedbackForm.comments,
        recommendations: feedbackForm.recommendations,
        wouldRecommend: feedbackForm.wouldRecommend
      });
      
      setShowFeedbackDialog(false);
      setFeedbackForm({
        rating: 5,
        expertise: 5,
        communication: 5,
        responsiveness: 5,
        helpfulness: 5,
        professionalism: 5,
        comments: '',
        wouldRecommend: true,
        recommendations: []
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [feedbackForm, submitConsultationFeedback]);

  // Filter consultations
  const filteredConsultations = useMemo(() => {
    return consultations.filter(consultation => {
      if (searchQuery && !consultation.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !consultation.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && consultation.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'all' && consultation.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [consultations, searchQuery, statusFilter, typeFilter]);

  const myConsultations = useMemo(() => {
    return consultations.filter(consultation => 
      consultation.requesterId === 'current-user' || 
      consultation.experts.some(expert => expert.expertId === 'current-user')
    );
  }, [consultations]);

  // Utility functions
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'matched': return 'text-purple-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': case 'escalated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'matched': return UserCheck;
      case 'pending': return Timer;
      case 'cancelled': case 'escalated': return XCircle;
      default: return Clock;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config = PRIORITY_LEVELS.find(p => p.value === priority);
    return config ? { label: config.label, className: config.color } : { label: priority, className: 'bg-gray-100 text-gray-800' };
  };

  const getTypeIcon = (type: string) => {
    const config = CONSULTATION_TYPES.find(t => t.value === type);
    return config?.icon || HelpCircle;
  };

  // Render functions
  const renderConsultationCard = (consultation: ExpertConsultation) => {
    const StatusIcon = getStatusIcon(consultation.status);
    const TypeIcon = getTypeIcon(consultation.type);
    const priorityBadge = getPriorityBadge(consultation.priority);
    
    return (
      <Card 
        key={consultation.id} 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedConsultation(consultation);
          setShowConsultationDetails(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TypeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{consultation.title}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {consultation.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={priorityBadge.className}>
                {priorityBadge.label}
              </Badge>
              <Badge variant={consultation.status === 'completed' ? 'default' : 'outline'}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {consultation.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Tags */}
            {consultation.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {consultation.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {consultation.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{consultation.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Urgency:</span>
                <span className="ml-2 font-medium">{consultation.urgency}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-medium">{consultation.estimatedDuration}min</span>
              </div>
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2 font-medium">{consultation.preferredFormat}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Experts:</span>
                <span className="ml-2 font-medium">{consultation.experts.length}</span>
              </div>
            </div>
            
            {/* Requester */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={consultation.requesterAvatar} />
                <AvatarFallback className="text-xs">{consultation.requesterName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <span className="font-medium">{consultation.requesterName}</span>
                <span className="text-muted-foreground ml-1">• {consultation.requesterRole}</span>
              </div>
            </div>
            
            {/* Experts */}
            {consultation.experts.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Assigned Experts</div>
                <div className="flex -space-x-2">
                  {consultation.experts.slice(0, 3).map((expert, index) => (
                    <Avatar key={index} className="h-6 w-6 border-2 border-white">
                      <AvatarImage src={expert.expertAvatar} />
                      <AvatarFallback className="text-xs">{expert.expertName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {consultation.experts.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-xs">+{consultation.experts.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                {consultation.createdAt.toLocaleDateString()}
              </div>
              
              <div className="flex items-center space-x-2">
                {consultation.status === 'pending' && (
                  <Button size="sm" variant="outline">
                    <Users className="h-4 w-4 mr-1" />
                    Assign Expert
                  </Button>
                )}
                {consultation.status === 'matched' && (
                  <Button size="sm">
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Start Session
                  </Button>
                )}
                {consultation.status === 'completed' && (
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4 mr-1" />
                    Rate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExpertCard = (expert: ExpertProfile) => (
    <Card 
      key={expert.id} 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        setSelectedExpert(expert);
        setShowExpertProfile(true);
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={expert.avatar} />
            <AvatarFallback>{expert.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{expert.name}</CardTitle>
            <CardDescription>{expert.role} • {expert.department}</CardDescription>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{expert.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({expert.totalConsultations} consultations)
              </span>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={expert.availability.currentLoad < expert.availability.maxHoursPerWeek * 0.8 ? 'default' : 'secondary'}>
              {expert.availability.currentLoad < expert.availability.maxHoursPerWeek * 0.8 ? 'Available' : 'Busy'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Expertise */}
          <div>
            <div className="text-sm font-medium mb-1">Expertise</div>
            <div className="flex flex-wrap gap-1">
              {expert.expertise.slice(0, 3).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {expert.expertise.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{expert.expertise.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Response:</span>
              <span className="ml-1 font-medium">{expert.averageResponseTime}h</span>
            </div>
            <div>
              <span className="text-muted-foreground">Success:</span>
              <span className="ml-1 font-medium">{expert.successRate}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Load:</span>
              <span className="ml-1 font-medium">
                {expert.availability.currentLoad}/{expert.availability.maxHoursPerWeek}h
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Satisfaction:</span>
              <span className="ml-1 font-medium">{expert.metrics.satisfaction.toFixed(1)}</span>
            </div>
          </div>
          
          {/* Availability */}
          <div className="text-xs text-muted-foreground">
            Next available: {expert.availability.nextAvailable.toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expert Consultation</h2>
          <p className="text-muted-foreground">
            Connect with experts and get professional guidance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadConsultations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateRequest(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Consultation
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requests">All Requests</TabsTrigger>
          <TabsTrigger value="my_consultations">My Consultations</TabsTrigger>
          <TabsTrigger value="experts">Experts</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search consultations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CONSULTATION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consultation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredConsultations.map(renderConsultationCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="my_consultations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myConsultations.map(renderConsultationCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="experts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map(renderExpertCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Consultation sessions and recordings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No sessions available
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalConsultations}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.activeConsultations}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.satisfactionScore.toFixed(1)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.averageResolutionTime.toFixed(1)}h</div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Experts */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Experts</CardTitle>
                  <CardDescription>Most active and highly rated experts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topExperts.map((expert, index) => (
                      <div key={expert.expertId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{expert.expertName}</div>
                            <div className="text-sm text-muted-foreground">
                              {expert.consultations} consultations
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{expert.rating.toFixed(1)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {expert.responseTime}h response
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Request Dialog */}
      <Dialog open={showCreateRequest} onOpenChange={setShowCreateRequest}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Expert Consultation</DialogTitle>
            <DialogDescription>
              Get professional guidance from our expert network
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="request-title">Title</Label>
                <Input
                  id="request-title"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for your request"
                />
              </div>
              <div>
                <Label htmlFor="request-type">Type</Label>
                <Select value={requestForm.type} onValueChange={(value) => setRequestForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSULTATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="request-description">Description</Label>
              <Textarea
                id="request-description"
                value={requestForm.description}
                onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of what you need help with"
                className="min-h-20"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="request-priority">Priority</Label>
                <Select value={requestForm.priority} onValueChange={(value) => setRequestForm(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="request-urgency">Urgency</Label>
                <Select value={requestForm.urgency} onValueChange={(value) => setRequestForm(prev => ({ ...prev, urgency: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map(urgency => (
                      <SelectItem key={urgency.value} value={urgency.value}>
                        {urgency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="request-duration">Est. Duration (min)</Label>
                <Input
                  id="request-duration"
                  type="number"
                  value={requestForm.estimatedDuration}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 30 }))}
                  min="15"
                  max="480"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="request-format">Preferred Format</Label>
              <Select value={requestForm.preferredFormat} onValueChange={(value) => setRequestForm(prev => ({ ...prev, preferredFormat: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSULTATION_FORMATS.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="request-background">Background Information</Label>
              <Textarea
                id="request-background"
                value={requestForm.backgroundInfo}
                onChange={(e) => setRequestForm(prev => ({ ...prev, backgroundInfo: e.target.value }))}
                placeholder="Any relevant context or background information"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requestForm.allowMultipleExperts}
                  onCheckedChange={(checked) => setRequestForm(prev => ({ ...prev, allowMultipleExperts: !!checked }))}
                />
                <Label className="text-sm">Allow multiple experts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requestForm.requiresNDA}
                  onCheckedChange={(checked) => setRequestForm(prev => ({ ...prev, requiresNDA: !!checked }))}
                />
                <Label className="text-sm">Requires NDA/Confidentiality</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateRequest(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} disabled={loading || !requestForm.title}>
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpertConsultation;