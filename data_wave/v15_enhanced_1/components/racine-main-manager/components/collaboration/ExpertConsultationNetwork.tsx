"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
  Tabs, TabsContent, TabsList, TabsTrigger, Badge, Avatar, AvatarFallback, AvatarImage, ScrollArea, Separator,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
  Switch, Slider, Progress, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Popover, PopoverContent, PopoverTrigger, Alert, AlertDescription, AlertTitle,
  ResizablePanelGroup, ResizablePanel, ResizableHandle
} from '@/components/ui';
import { Users, User, Search, Filter, Star, Calendar, Clock, MessageCircle, Phone, Video, Send, Plus, Settings, Bell, BellOff, BookOpen, Award, Target, TrendingUp, BarChart3, PieChart, LineChart, Activity, Zap, Brain, Lightbulb, Compass, Map, Route, Navigation, Microscope, FlaskConical, Beaker, Atom, Dna, Cpu, Database, Server, Cloud, Globe, Building, Factory, Briefcase, GraduationCap, BookMarked, Library, FileText, Folder, FolderOpen, Tag, Tags, Bookmark, BookmarkPlus, Heart, ThumbsUp, ThumbsDown, Flag, Share, Download, Upload, Copy, ExternalLink, Link, Unlink, Edit, Trash2, Archive, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, X, Check, CheckCircle, AlertTriangle, Info, HelpCircle, RefreshCw, Loader2, PlayCircle, PauseCircle, StopCircle, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Monitor, Smartphone, Tablet, Laptop, MousePointer, Hand, Grab, Move } from 'lucide-react';
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

// Expert Network Types
interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  organization: string;
  location: string;
  timeZone: string;
  skills: string[];
  specializations: string[];
  certifications: string[];
  experience: ExpertExperience;
  rating: ExpertRating;
  availability: ExpertAvailability;
  pricing: ExpertPricing;
  stats: ExpertStats;
  preferences: ExpertPreferences;
  verification: ExpertVerification;
  social: ExpertSocial;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isFeatured: boolean;
}

interface ExpertExperience {
  totalYears: number;
  industries: string[];
  previousRoles: string[];
  education: string[];
}

interface ExpertRating {
  overall: number;
  communication: number;
  expertise: number;
  timeliness: number;
  helpfulness: number;
  totalReviews: number;
}

interface ExpertAvailability {
  status: 'available' | 'busy' | 'away' | 'offline';
  nextAvailable: Date;
  workingHours: { start: string; end: string; timeZone: string };
  preferredDays: string[];
  maxSessionsPerDay: number;
  bufferTime: number;
}

interface ExpertPricing {
  hourlyRate: number;
  currency: string;
  packageDeals: { sessions: number; discount: number }[];
  freeConsultation: boolean;
}

interface ExpertStats {
  totalConsultations: number;
  completedSessions: number;
  averageSessionDuration: number;
  responseTime: number;
  repeatClients: number;
  successRate: number;
}

interface ExpertPreferences {
  sessionTypes: string[];
  languages: string[];
  communicationStyle: string;
  preparationTime: number;
  followUpIncluded: boolean;
}

interface ExpertVerification {
  isVerified: boolean;
  verificationLevel: string;
  verifiedSkills: string[];
  backgroundChecked: boolean;
  identityVerified: boolean;
}

interface ExpertSocial {
  linkedIn?: string;
  twitter?: string;
  website?: string;
  github?: string;
}

interface ConsultationRequest {
  id: string;
  expertId: string;
  requesterId: string;
  requesterName: string;
  title: string;
  description: string;
  type: 'consultation' | 'review' | 'training' | 'mentoring';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledDate: Date;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  attachments: string[];
  requirements: string[];
  expectedOutcome: string;
  budget?: number;
  urgency: string;
  followUpRequired: boolean;
}

interface ExpertSession {
  id: string;
  consultationId: string;
  expertId: string;
  participantIds: string[];
  type: 'video_call' | 'audio_call' | 'chat' | 'screen_share';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  scheduledDuration: number;
  actualDuration: number;
  recording: SessionRecording;
  transcription: SessionTranscription;
  screenShare: ScreenShareSession;
  chat: ChatSession;
  metadata: SessionMetadata;
}

interface SessionRecording {
  isEnabled: boolean;
  isRecording: boolean;
  recordingId?: string;
  recordingUrl?: string;
}

interface SessionTranscription {
  isEnabled: boolean;
  isTranscribing: boolean;
  transcriptId?: string;
  transcript: string;
}

interface ScreenShareSession {
  isActive: boolean;
  sharingUserId?: string;
}

interface ChatSession {
  messages: ChatMessage[];
  isEnabled: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
}

interface SessionMetadata {
  quality: 'low' | 'medium' | 'high';
  bandwidth: number;
  participantCount: number;
}

interface ExpertNetworkState {
  experts: ExpertProfile[];
  consultations: ConsultationRequest[];
  activeSessions: ExpertSession[];
  expertiseAreas: string[];
  consultationRequests: ConsultationRequest[];
  recommendations: ExpertProfile[];
  selectedExpert: ExpertProfile | null;
  selectedConsultation: ConsultationRequest | null;
  activeSession: ExpertSession | null;
  searchResults: ExpertSearchResult[];
  expertMatches: ExpertMatch[];
  isLoading: boolean;
  error: string | null;
}

interface ExpertSearchResult {
  expert: ExpertProfile;
  relevanceScore: number;
  matchingSkills: string[];
  availability: ExpertAvailability;
  rating: number;
  consultationCount: number;
}

interface ExpertMatch {
  expert: ExpertProfile;
  matchPercentage: number;
  matchingSkills: string[];
  availableSlots: number;
  estimatedCost: number;
  confidence: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const expertVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } }
};

export const ExpertConsultationNetwork: React.FC = () => {
  const {
    collaborationHubs, participants, onlineParticipants, requestExpertConsultation,
    getCollaborationAnalytics, isConnected, refresh
  } = useCollaboration();

  const { orchestrationState, executeOrchestration } = useRacineOrchestration();
  const { integrationStatus, executeIntegration } = useCrossGroupIntegration();
  const { currentUser, userPermissions, teamMembers } = useUserManagement();
  const { activeWorkspace, workspaceMembers } = useWorkspaceManagement();
  const { trackActivity, getActivityAnalytics } = useActivityTracker();
  const { workflows, executeWorkflow } = useJobWorkflow();
  const { pipelines, executePipeline } = usePipelineManager();
  const { aiInsights, getRecommendations, analyzeContent } = useAIAssistant();

  const [expertNetworkState, setExpertNetworkState] = useState<ExpertNetworkState>({
    experts: [], consultations: [], activeSessions: [], expertiseAreas: [], consultationRequests: [],
    recommendations: [], selectedExpert: null, selectedConsultation: null, activeSession: null,
    searchResults: [], expertMatches: [], isLoading: false, error: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'experts' | 'consultations' | 'sessions' | 'analytics'>('experts');
  const [filterOptions, setFilterOptions] = useState({
    expertiseArea: 'all', availability: 'all', rating: 'all', location: 'all', certification: 'all', experience: 'all'
  });
  const [showExpertProfile, setShowExpertProfile] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showSessionControls, setShowSessionControls] = useState(false);

  const [consultationScheduler, setConsultationScheduler] = useState({
    selectedDate: new Date(), selectedTime: '09:00', duration: 60, type: 'consultation' as const,
    priority: 'normal' as const, description: '', attachments: [] as string[], invitees: [] as string[]
  });

  const [sessionController, setSessionController] = useState({
    isRecording: false, isTranscribing: false, hasScreenShare: false, participantCount: 0,
    duration: 0, startTime: new Date(), quality: 'high' as const, bandwidth: 0
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeExpertNetwork();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (expertNetworkState.activeSession) startSessionTimer();
  }, [expertNetworkState.activeSession]);

  useEffect(() => {
    if (searchQuery) performExpertSearch(searchQuery);
  }, [searchQuery, filterOptions]);

  const initializeExpertNetwork = async () => {
    try {
      setExpertNetworkState(prev => ({ ...prev, isLoading: true }));
      await Promise.all([loadExperts(), loadExpertiseAreas(), loadConsultations(), loadConsultationAnalytics()]);
      trackActivity({
        type: 'expert_network_initialized', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { component: 'ExpertConsultationNetwork', workspace: activeWorkspace?.id }
      });
      setExpertNetworkState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to initialize expert network:', error);
      setExpertNetworkState(prev => ({ ...prev, isLoading: false, error: 'Failed to initialize expert network' }));
    }
  };

  const cleanup = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
  };

  const loadExperts = async () => {
    try {
      const experts = await generateMockExperts();
      setExpertNetworkState(prev => ({ ...prev, experts }));
    } catch (error) {
      console.error('Failed to load experts:', error);
    }
  };

  const loadExpertiseAreas = async () => {
    try {
      const expertiseAreas = ['Data Science', 'Machine Learning', 'Cloud Architecture', 'Cybersecurity', 'DevOps', 
        'UI/UX Design', 'Product Management', 'Business Strategy', 'Digital Marketing', 'Finance'];
      setExpertNetworkState(prev => ({ ...prev, expertiseAreas }));
    } catch (error) {
      console.error('Failed to load expertise areas:', error);
    }
  };

  const loadConsultations = async () => {
    try {
      const consultations = await generateMockConsultations();
      setExpertNetworkState(prev => ({ ...prev, consultations }));
    } catch (error) {
      console.error('Failed to load consultations:', error);
    }
  };

  const loadConsultationAnalytics = async () => {
    try {
      const analytics = await getCollaborationAnalytics({
        timeRange: 'last_30_days', includeExperts: true, includeConsultations: true, includeRatings: true
      });
      // Process analytics data for expert network metrics
    } catch (error) {
      console.error('Failed to load consultation analytics:', error);
    }
  };

  const performExpertSearch = async (query: string) => {
    try {
      const searchTerms = query.toLowerCase().split(' ');
      const results: ExpertSearchResult[] = [];

      expertNetworkState.experts.forEach(expert => {
        const name = expert.name.toLowerCase();
        const bio = expert.bio.toLowerCase();
        const skills = expert.skills.join(' ').toLowerCase();
        const specializations = expert.specializations.join(' ').toLowerCase();
        
        const matchScore = searchTerms.reduce((score, term) => {
          let termScore = 0;
          if (name.includes(term)) termScore += 5;
          if (skills.includes(term)) termScore += 3;
          if (specializations.includes(term)) termScore += 3;
          if (bio.includes(term)) termScore += 1;
          return score + termScore;
        }, 0);

        if (matchScore > 0) {
          results.push({
            expert, relevanceScore: matchScore,
            matchingSkills: expert.skills.filter(skill => 
              searchTerms.some(term => skill.toLowerCase().includes(term))
            ),
            availability: expert.availability,
            rating: expert.rating.overall,
            consultationCount: expert.stats.totalConsultations
          });
        }
      });

      const sortedResults = results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 20);
      setExpertNetworkState(prev => ({ ...prev, searchResults: sortedResults }));
    } catch (error) {
      console.error('Failed to perform expert search:', error);
    }
  };

  const requestConsultation = async (expertId: string, details: Partial<ConsultationRequest>) => {
    try {
      const expert = expertNetworkState.experts.find(e => e.id === expertId);
      if (!expert) throw new Error('Expert not found');

      const consultationRequest: ConsultationRequest = {
        id: `consultation-${Date.now()}`, expertId, requesterId: currentUser?.id || '', 
        requesterName: currentUser?.name || '', title: details.title || 'Expert Consultation',
        description: details.description || '', type: details.type || 'consultation',
        priority: details.priority || 'normal', scheduledDate: details.scheduledDate || consultationScheduler.selectedDate,
        duration: details.duration || consultationScheduler.duration, status: 'pending',
        createdAt: new Date(), updatedAt: new Date(), attachments: details.attachments || [],
        requirements: details.requirements || [], expectedOutcome: details.expectedOutcome || '',
        budget: details.budget, urgency: details.urgency || 'normal', followUpRequired: details.followUpRequired || false
      };

      await requestExpertConsultation(expertId, {
        title: consultationRequest.title, description: consultationRequest.description,
        scheduledTime: consultationRequest.scheduledDate, duration: consultationRequest.duration,
        priority: consultationRequest.priority
      });

      setExpertNetworkState(prev => ({
        ...prev, consultationRequests: [...prev.consultationRequests, consultationRequest]
      }));

      trackActivity({
        type: 'consultation_requested', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { expertId, consultationType: consultationRequest.type, priority: consultationRequest.priority }
      });

      return consultationRequest;
    } catch (error) {
      console.error('Failed to request consultation:', error);
      throw error;
    }
  };

  const startConsultationSession = async (consultationId: string) => {
    try {
      const consultation = expertNetworkState.consultations.find(c => c.id === consultationId);
      if (!consultation) throw new Error('Consultation not found');

      const session: ExpertSession = {
        id: `session-${Date.now()}`, consultationId, expertId: consultation.expertId,
        participantIds: [consultation.requesterId, consultation.expertId], type: 'video_call',
        status: 'active', startTime: new Date(), scheduledDuration: consultation.duration,
        actualDuration: 0, recording: { isEnabled: true, isRecording: false },
        transcription: { isEnabled: true, isTranscribing: false, transcript: '' },
        screenShare: { isActive: false }, chat: { messages: [], isEnabled: true },
        metadata: { quality: 'high', bandwidth: 1000, participantCount: 2 }
      };

      setExpertNetworkState(prev => ({
        ...prev, activeSessions: [...prev.activeSessions, session], activeSession: session
      }));

      setSessionController({
        isRecording: false, isTranscribing: false, hasScreenShare: false, participantCount: 2,
        duration: 0, startTime: new Date(), quality: 'high', bandwidth: 1000
      });

      trackActivity({
        type: 'consultation_session_started', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { sessionId: session.id, consultationId, expertId: consultation.expertId }
      });

      return session;
    } catch (error) {
      console.error('Failed to start consultation session:', error);
      throw error;
    }
  };

  const endConsultationSession = async () => {
    if (!expertNetworkState.activeSession) return;

    try {
      const endTime = new Date();
      const duration = endTime.getTime() - expertNetworkState.activeSession.startTime.getTime();

      const updatedSession = {
        ...expertNetworkState.activeSession, status: 'completed' as const, endTime,
        actualDuration: Math.floor(duration / 60000)
      };

      setExpertNetworkState(prev => ({
        ...prev,
        activeSessions: prev.activeSessions.map(session =>
          session.id === updatedSession.id ? updatedSession : session
        ),
        activeSession: null
      }));

      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);

      trackActivity({
        type: 'consultation_session_ended', userId: currentUser?.id || '', timestamp: endTime,
        metadata: { sessionId: updatedSession.id, duration: updatedSession.actualDuration, 
          participantCount: sessionController.participantCount }
      });
    } catch (error) {
      console.error('Failed to end consultation session:', error);
    }
  };

  const startSessionTimer = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    sessionTimerRef.current = setInterval(() => {
      setSessionController(prev => ({
        ...prev, duration: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
      }));
    }, 1000);
  };

  const toggleRecording = () => {
    setSessionController(prev => ({ ...prev, isRecording: !prev.isRecording }));
  };

  const toggleScreenShare = () => {
    setSessionController(prev => ({ ...prev, hasScreenShare: !prev.hasScreenShare }));
  };

  const generateMockExperts = async (): Promise<ExpertProfile[]> => {
    const expertiseAreas = ['Data Science', 'Machine Learning', 'Cloud Architecture', 'Cybersecurity', 'DevOps', 
      'UI/UX Design', 'Product Management', 'Business Strategy', 'Digital Marketing', 'Finance'];
    const locations = ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Singapore'];
    const organizations = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Tesla', 'Netflix', 'Spotify'];

    const experts: ExpertProfile[] = [];

    for (let i = 0; i < 50; i++) {
      const randomSkills = expertiseAreas.slice().sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3);
      const randomOrg = organizations[Math.floor(Math.random() * organizations.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];

      experts.push({
        id: `expert-${i}`, name: `Expert ${i + 1}`, title: `Senior ${randomSkills[0]} Specialist`,
        bio: `Experienced professional with ${5 + Math.floor(Math.random() * 15)} years in ${randomSkills.join(', ')}`,
        avatar: `/avatars/expert-${i}.jpg`, organization: randomOrg, location: randomLocation, timeZone: 'UTC-5',
        skills: randomSkills, specializations: randomSkills.slice(0, 2),
        certifications: [`${randomSkills[0]} Certified`, `${randomOrg} Partner`],
        experience: {
          totalYears: 5 + Math.floor(Math.random() * 15),
          industries: ['Technology', 'Finance', 'Healthcare'].slice(0, Math.floor(Math.random() * 3) + 1),
          previousRoles: [`${randomSkills[0]} Engineer`, `${randomSkills[0]} Manager`],
          education: [`MS in ${randomSkills[0]}`, 'BS Computer Science']
        },
        rating: {
          overall: 3.5 + Math.random() * 1.5, communication: 3.5 + Math.random() * 1.5,
          expertise: 4.0 + Math.random() * 1.0, timeliness: 3.5 + Math.random() * 1.5,
          helpfulness: 4.0 + Math.random() * 1.0, totalReviews: Math.floor(Math.random() * 200) + 10
        },
        availability: {
          status: Math.random() > 0.3 ? 'available' : 'busy',
          nextAvailable: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          workingHours: { start: '09:00', end: '17:00', timeZone: 'UTC-5' },
          preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          maxSessionsPerDay: 4, bufferTime: 15
        },
        pricing: {
          hourlyRate: 50 + Math.floor(Math.random() * 200), currency: 'USD',
          packageDeals: [{ sessions: 5, discount: 10 }, { sessions: 10, discount: 20 }],
          freeConsultation: Math.random() > 0.7
        },
        stats: {
          totalConsultations: Math.floor(Math.random() * 500) + 50,
          completedSessions: Math.floor(Math.random() * 450) + 45,
          averageSessionDuration: 45 + Math.floor(Math.random() * 30),
          responseTime: Math.floor(Math.random() * 24) + 1,
          repeatClients: Math.floor(Math.random() * 50) + 10,
          successRate: 85 + Math.random() * 15
        },
        preferences: {
          sessionTypes: ['video_call', 'audio_call', 'chat'],
          languages: ['English', 'Spanish'].slice(0, Math.floor(Math.random() * 2) + 1),
          communicationStyle: 'professional', preparationTime: 15, followUpIncluded: true
        },
        verification: {
          isVerified: Math.random() > 0.2, verificationLevel: 'advanced',
          verifiedSkills: randomSkills.slice(0, 2), backgroundChecked: true, identityVerified: true
        },
        social: {
          linkedIn: `https://linkedin.com/in/expert${i}`, twitter: `@expert${i}`,
          website: `https://expert${i}.com`, github: `https://github.com/expert${i}`
        },
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        isActive: Math.random() > 0.1, isFeatured: Math.random() > 0.8
      });
    }

    return experts;
  };

  const generateMockConsultations = async (): Promise<ConsultationRequest[]> => {
    const consultations: ConsultationRequest[] = [];
    const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    const types = ['consultation', 'review', 'training', 'mentoring'];

    for (let i = 0; i < 20; i++) {
      consultations.push({
        id: `consultation-${i}`, expertId: `expert-${Math.floor(Math.random() * 10)}`,
        requesterId: currentUser?.id || '', requesterName: currentUser?.name || '',
        title: `Consultation ${i + 1}`, description: `Expert consultation on technical matters ${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)] as any,
        priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
        scheduledDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        duration: 60, status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        attachments: [], requirements: [], expectedOutcome: '', urgency: 'normal', followUpRequired: false
      });
    }

    return consultations;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={cn("h-4 w-4", i < Math.floor(rating) ? "text-yellow-500 fill-current" : "text-gray-300")} />
    ));
  };

  const renderExpertGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(searchQuery ? expertNetworkState.searchResults.map(result => result.expert) : expertNetworkState.experts)
        .slice(0, 12).map((expert) => (
          <motion.div key={expert.id} variants={expertVariants} initial="hidden" animate="visible" whileHover="hover" className="group">
            <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/50">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={expert.avatar} />
                      <AvatarFallback className="text-lg">
                        {expert.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background",
                      getAvailabilityColor(expert.availability.status))} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{expert.name}</h3>
                        <p className="text-sm text-muted-foreground">{expert.title}</p>
                        <p className="text-xs text-muted-foreground">{expert.organization}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setExpertNetworkState(prev => ({ ...prev, selectedExpert: expert }))}>
                            <User className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Consultation
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Heart className="h-4 w-4 mr-2" />
                            Add to Favorites
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    {getRatingStars(expert.rating.overall)}
                    <span className="text-sm font-medium ml-1">{expert.rating.overall.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({expert.rating.totalReviews})</span>
                  </div>
                  
                  <Badge variant={expert.verification.isVerified ? "default" : "secondary"}>
                    {expert.verification.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{expert.bio}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {expert.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                      {expert.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">+{expert.skills.length - 4}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{expert.stats.averageSessionDuration}min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>{expert.stats.successRate.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">${expert.pricing.hourlyRate}/hr</p>
                      {expert.pricing.freeConsultation && (
                        <p className="text-xs text-green-600">Free consultation</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span>Next available: {formatDate(expert.availability.nextAvailable)}</span>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button size="sm" onClick={() => {
                        setExpertNetworkState(prev => ({ ...prev, selectedExpert: expert }));
                        setShowScheduleDialog(true);
                      }}>
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
    </div>
  );

  const renderConsultationsList = () => (
    <div className="space-y-4">
      {expertNetworkState.consultations.map((consultation) => {
        const expert = expertNetworkState.experts.find(e => e.id === consultation.expertId);
        
        return (
          <Card key={consultation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={expert?.avatar} />
                    <AvatarFallback>{expert?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{consultation.title}</h3>
                      <Badge variant={
                        consultation.status === 'completed' ? "default" :
                        consultation.status === 'in_progress' ? "secondary" :
                        consultation.status === 'scheduled' ? "outline" : "destructive"
                      }>
                        {consultation.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      with {expert?.name} • {consultation.type}
                    </p>
                    
                    <p className="text-sm mb-3">{consultation.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(consultation.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{consultation.duration} minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {consultation.status === 'scheduled' && (
                    <Button size="sm" onClick={() => startConsultationSession(consultation.id)}>
                      <Video className="h-4 w-4 mr-2" />
                      Join Session
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderActiveSession = () => {
    if (!expertNetworkState.activeSession) return null;

    const expert = expertNetworkState.experts.find(e => e.id === expertNetworkState.activeSession?.expertId);

    return (
      <Card className="fixed bottom-4 right-4 w-96 z-50 bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Active Consultation</CardTitle>
            <Badge variant="default">Live</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={expert?.avatar} />
              <AvatarFallback className="text-xs">{expert?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{expert?.name}</p>
              <p className="text-xs text-muted-foreground">{formatDuration(sessionController.duration)}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant={sessionController.isRecording ? "destructive" : "outline"} size="sm" onClick={toggleRecording}>
                {sessionController.isRecording ? <StopCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              </Button>
              
              <Button variant={sessionController.hasScreenShare ? "default" : "outline"} size="sm" onClick={toggleScreenShare}>
                <Monitor className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="destructive" size="sm" onClick={endConsultationSession}>
              End Session
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Quality: {sessionController.quality}</span>
              <span>Participants: {sessionController.participantCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Expert Consultation Network</h1>
                <p className="text-muted-foreground">Connect with industry experts for professional guidance and consultation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowScheduleDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Request Consultation
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
                    Filter Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Network Preferences
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input ref={searchInputRef} placeholder="Search experts by skills, name, or expertise..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            
            <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
              <TabsList>
                <TabsTrigger value="experts">
                  <Users className="h-4 w-4 mr-2" />
                  Experts
                </TabsTrigger>
                <TabsTrigger value="consultations">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Consultations
                </TabsTrigger>
                <TabsTrigger value="sessions">
                  <Video className="h-4 w-4 mr-2" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-6">
            {expertNetworkState.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {selectedView === 'experts' && renderExpertGrid()}
                {selectedView === 'consultations' && renderConsultationsList()}
                {selectedView === 'sessions' && (
                  <div className="text-center py-12">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
                    <p className="text-muted-foreground">Schedule a consultation to start your first expert session</p>
                  </div>
                )}
                {selectedView === 'analytics' && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Active Experts</p>
                            <p className="text-2xl font-bold">42</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Total Consultations</p>
                            <p className="text-2xl font-bold">156</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <div>
                            <p className="text-sm font-medium">Average Rating</p>
                            <p className="text-2xl font-bold">4.3</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">Success Rate</p>
                            <p className="text-2xl font-bold">94%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </div>
        
        {renderActiveSession()}
        
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Expert Consultation</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={consultationScheduler.selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setConsultationScheduler(prev => ({ ...prev, selectedDate: new Date(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" value={consultationScheduler.selectedTime}
                    onChange={(e) => setConsultationScheduler(prev => ({ ...prev, selectedTime: e.target.value }))} />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Select value={consultationScheduler.duration.toString()}
                  onValueChange={(value) => setConsultationScheduler(prev => ({ ...prev, duration: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Describe what you'd like to discuss..." value={consultationScheduler.description}
                  onChange={(e) => setConsultationScheduler(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
                <Button onClick={() => setShowScheduleDialog(false)}>Schedule Consultation</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};
