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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';

import { 
  Users, UserCheck, Star, MapPin, Calendar, Clock, Mail, Phone, MessageSquare,
  Video, Mic, FileText, Award, Trophy, Target, Zap, Brain, Lightbulb,
  Search, Filter, Plus, Edit, MoreHorizontal, RefreshCw, Settings,
  Network, Globe, Building, GraduationCap, Briefcase, Heart, BookOpen,
  CheckCircle, XCircle, AlertTriangle, Eye, Send, Link, ExternalLink
} from 'lucide-react';

import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

import { format, subDays, parseISO, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Import backend services
import { collaborationService } from '../../services/collaboration.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';

// Import types
import { CollaborationTeam, TeamMember } from '../../types/collaboration.types';

// ============================================================================
// EXPERT NETWORKING TYPES
// ============================================================================

interface ExpertProfile {
  id: string;
  user_id: string;
  display_name: string;
  title: string;
  organization: string;
  avatar_url?: string;
  bio: string;
  location: string;
  timezone: string;
  expertise_areas: ExpertiseArea[];
  skills: Skill[];
  certifications: Certification[];
  experience_years: number;
  reputation_score: number;
  availability_status: 'available' | 'busy' | 'away' | 'offline';
  consultation_rate?: number;
  languages: string[];
  social_links: SocialLink[];
  statistics: ExpertStatistics;
  preferences: ExpertPreferences;
  verification_status: 'pending' | 'verified' | 'expert' | 'authority';
  joined_at: string;
  last_active: string;
}

interface ExpertiseArea {
  id: string;
  name: string;
  category: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience: number;
  endorsements: number;
  verified: boolean;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 1-10
  endorsements: Endorsement[];
  projects: string[];
  certifications: string[];
}

interface Endorsement {
  id: string;
  endorser_id: string;
  endorser_name: string;
  skill_id: string;
  message: string;
  created_at: string;
  verified: boolean;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issued_date: string;
  expiry_date?: string;
  credential_id?: string;
  verification_url?: string;
  status: 'active' | 'expired' | 'pending';
}

interface SocialLink {
  platform: string;
  url: string;
  verified: boolean;
}

interface ExpertStatistics {
  consultations_completed: number;
  average_rating: number;
  total_reviews: number;
  response_time: number; // average hours
  expertise_requests: number;
  knowledge_contributions: number;
  mentorship_sessions: number;
  collaboration_projects: number;
}

interface ExpertPreferences {
  consultation_types: string[];
  availability_hours: AvailabilityHours;
  notification_settings: NotificationSettings;
  communication_channels: string[];
  expertise_sharing: boolean;
  mentorship_availability: boolean;
  project_collaboration: boolean;
}

interface AvailabilityHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

interface TimeSlot {
  start: string;
  end: string;
  timezone: string;
}

interface NotificationSettings {
  consultation_requests: boolean;
  expertise_matches: boolean;
  endorsement_requests: boolean;
  project_invitations: boolean;
  community_updates: boolean;
}

interface ConsultationRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  expert_id: string;
  expert_name: string;
  title: string;
  description: string;
  expertise_area: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'quick_question' | 'consultation' | 'mentorship' | 'project_collaboration';
  duration: number; // minutes
  preferred_times: string[];
  budget?: number;
  status: 'pending' | 'accepted' | 'declined' | 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  scheduled_at?: string;
  meeting_link?: string;
  notes?: string;
  outcome?: ConsultationOutcome;
}

interface ConsultationOutcome {
  rating: number;
  feedback: string;
  follow_up_required: boolean;
  deliverables: string[];
  knowledge_shared: string[];
  next_steps: string[];
}

interface ExpertMatch {
  expert: ExpertProfile;
  match_score: number;
  matching_skills: string[];
  availability: boolean;
  response_probability: number;
  consultation_fit: number;
  expertise_relevance: number;
  location_proximity?: number;
  language_compatibility: boolean;
  timezone_alignment: number;
}

interface KnowledgeExchange {
  id: string;
  title: string;
  description: string;
  type: 'question' | 'discussion' | 'tutorial' | 'case_study' | 'best_practice';
  expertise_areas: string[];
  participants: KnowledgeParticipant[];
  status: 'open' | 'in_progress' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  last_activity: string;
  content: KnowledgeContent[];
  resources: KnowledgeResource[];
  tags: string[];
  rating: number;
  views: number;
}

interface KnowledgeParticipant {
  user_id: string;
  role: 'moderator' | 'expert' | 'contributor' | 'observer';
  joined_at: string;
  contribution_score: number;
}

interface KnowledgeContent {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  type: 'text' | 'code' | 'diagram' | 'video' | 'document';
  created_at: string;
  reactions: ContentReaction[];
  replies: KnowledgeContent[];
}

interface ContentReaction {
  type: 'helpful' | 'insightful' | 'thanks' | 'question';
  user_id: string;
  created_at: string;
}

interface KnowledgeResource {
  id: string;
  title: string;
  type: 'document' | 'link' | 'video' | 'tool' | 'dataset';
  url: string;
  description: string;
  contributed_by: string;
  created_at: string;
}

interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  mentor_name: string;
  mentee_capacity: number;
  current_mentees: number;
  duration_weeks: number;
  expertise_focus: string[];
  program_type: 'structured' | 'flexible' | 'project_based';
  commitment_level: 'light' | 'moderate' | 'intensive';
  application_deadline: string;
  start_date: string;
  status: 'open' | 'full' | 'in_progress' | 'completed';
  requirements: string[];
  benefits: string[];
  application_count: number;
  success_stories: number;
}

interface ExpertNetworkingProps {
  className?: string;
  teamId?: string;
  userId?: string;
  mode?: 'expert' | 'seeker' | 'admin';
  onConsultationBooked?: (consultation: ConsultationRequest) => void;
  onExpertMatched?: (match: ExpertMatch) => void;
}

// Color schemes and constants
const PROFICIENCY_COLORS = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#f97316',
  expert: '#ef4444'
};

const STATUS_COLORS = {
  available: '#10b981',
  busy: '#f59e0b',
  away: '#f97316',
  offline: '#6b7280'
};

const CONSULTATION_STATUS_COLORS = {
  pending: '#f59e0b',
  accepted: '#10b981',
  declined: '#ef4444',
  scheduled: '#3b82f6',
  completed: '#059669',
  cancelled: '#6b7280'
};

export default function ExpertNetworking({ 
  className, 
  teamId, 
  userId, 
  mode = 'seeker',
  onConsultationBooked,
  onExpertMatched
}: ExpertNetworkingProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('experts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [knowledgeExchanges, setKnowledgeExchanges] = useState<KnowledgeExchange[]>([]);
  const [mentorshipPrograms, setMentorshipPrograms] = useState<MentorshipProgram[]>([]);
  const [expertMatches, setExpertMatches] = useState<ExpertMatch[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<ExpertProfile | null>(null);
  
  // UI States
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [showConsultationDialog, setShowConsultationDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [filterExpertise, setFilterExpertise] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'response_time' | 'availability'>('relevance');
  const [isRequestingConsultation, setIsRequestingConsultation] = useState(false);
  
  // Form States
  const [consultationRequest, setConsultationRequest] = useState<Partial<ConsultationRequest>>({
    type: 'consultation',
    priority: 'medium',
    duration: 60
  });
  
  // Real-time States
  const [liveUpdates, setLiveUpdates] = useState<Map<string, boolean>>(new Map());
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadNetworkingData();
    setupRealTimeUpdates();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [teamId, userId]);

  const loadNetworkingData = async () => {
    setLoading(true);
    try {
      // Load expert profiles from backend
      const expertsResponse = await collaborationService.getExpertProfiles({
        teamId: teamId,
        includeStatistics: true,
        includeSkills: true,
        includeAvailability: true,
        limit: 100
      });
      const expertsData = expertsResponse.data || [];
      
      // Load consultation requests from backend
      const consultationsResponse = await collaborationService.getConsultationRequests({
        userId: userId,
        includeOutcomes: true,
        status: ['pending', 'accepted', 'scheduled', 'completed'],
        limit: 50
      });
      const consultationsData = consultationsResponse.data || [];
      
      // Load knowledge exchanges from backend
      const knowledgeResponse = await collaborationService.getKnowledgeExchanges({
        teamId: teamId,
        includeParticipants: true,
        includeContent: true,
        status: ['open', 'in_progress'],
        limit: 30
      });
      const knowledgeData = knowledgeResponse.data || [];
      
      // Load mentorship programs from backend
      const mentorshipResponse = await collaborationService.getMentorshipPrograms({
        teamId: teamId,
        includeApplications: true,
        status: ['open', 'in_progress'],
        limit: 20
      });
      const mentorshipData = mentorshipResponse.data || [];
      
      // Load expert matches for current user from backend
      if (userId) {
        const matchesResponse = await intelligentDiscoveryService.getExpertMatches({
          userId: userId,
          includeAvailability: true,
          includeCompatibility: true,
          limit: 10
        });
        const matchesData = matchesResponse.data || [];
        setExpertMatches(matchesData);
        
        // Load current user's expert profile if exists
        try {
          const profileResponse = await collaborationService.getExpertProfile(userId);
          const profileData = profileResponse.data;
          setCurrentUserProfile(profileData);
        } catch (err) {
          // User might not have an expert profile yet
          console.log('No expert profile found for user');
        }
      }
      
      setExperts(expertsData);
      setConsultations(consultationsData);
      setKnowledgeExchanges(knowledgeData);
      setMentorshipPrograms(mentorshipData);
      
    } catch (err) {
      setError('Failed to load expert networking data from backend');
      console.error('Error loading networking data:', err);
      
      // Fallback to empty states
      setExperts([]);
      setConsultations([]);
      setKnowledgeExchanges([]);
      setMentorshipPrograms([]);
      setExpertMatches([]);
      setCurrentUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadNetworkingData();
    }, 30000);
    
    // WebSocket connection for real-time updates
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/expert-networking/${teamId || 'global'}`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };
      
      ws.current.onopen = () => {
        console.log('Expert Networking WebSocket connected');
        ws.current?.send(JSON.stringify({
          type: 'join_room',
          teamId: teamId,
          userId: userId
        }));
      };
      
      ws.current.onerror = (error) => {
        console.error('Expert Networking WebSocket error:', error);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'expert_status_updated':
        setExperts(prev => prev.map(expert => 
          expert.id === data.expertId ? { ...expert, availability_status: data.status } : expert
        ));
        break;
      case 'consultation_requested':
        setConsultations(prev => [data.consultation, ...prev]);
        setLiveUpdates(prev => new Map(prev.set(data.consultation.id, true)));
        break;
      case 'consultation_updated':
        setConsultations(prev => prev.map(cons => 
          cons.id === data.consultation.id ? { ...cons, ...data.consultation } : cons
        ));
        break;
      case 'expert_match_found':
        if (data.userId === userId) {
          setExpertMatches(prev => [data.match, ...prev]);
          onExpertMatched?.(data.match);
        }
        break;
      case 'knowledge_exchange_updated':
        setKnowledgeExchanges(prev => prev.map(ke => 
          ke.id === data.exchange.id ? { ...ke, ...data.exchange } : ke
        ));
        break;
    }
  };

  // Consultation Management Functions
  const requestConsultation = async (expertId: string, requestData: Partial<ConsultationRequest>) => {
    try {
      setIsRequestingConsultation(true);
      
      const request = {
        expertId,
        requesterId: userId || '',
        title: requestData.title || '',
        description: requestData.description || '',
        expertiseArea: requestData.expertise_area || '',
        type: requestData.type || 'consultation',
        priority: requestData.priority || 'medium',
        duration: requestData.duration || 60,
        preferredTimes: requestData.preferred_times || [],
        budget: requestData.budget,
        teamId: teamId
      };
      
      const response = await collaborationService.createConsultationRequest(request);
      const newConsultation = response.data;
      
      setConsultations(prev => [newConsultation, ...prev]);
      setShowConsultationDialog(false);
      setConsultationRequest({
        type: 'consultation',
        priority: 'medium',
        duration: 60
      });
      
      onConsultationBooked?.(newConsultation);
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'consultation_requested',
        consultation: newConsultation
      }));
      
    } catch (err) {
      setError('Failed to request consultation via backend');
      console.error('Consultation request error:', err);
    } finally {
      setIsRequestingConsultation(false);
    }
  };

  const updateConsultationStatus = async (consultationId: string, status: string, notes?: string) => {
    try {
      const updateRequest = {
        consultationId,
        status,
        notes: notes || '',
        updatedBy: userId || ''
      };
      
      const response = await collaborationService.updateConsultationStatus(updateRequest);
      const updatedConsultation = response.data;
      
      setConsultations(prev => prev.map(cons => 
        cons.id === consultationId ? updatedConsultation : cons
      ));
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'consultation_updated',
        consultation: updatedConsultation
      }));
      
    } catch (err) {
      setError('Failed to update consultation status via backend');
      console.error('Consultation update error:', err);
    }
  };

  // Expert Discovery Functions
  const findExpertMatches = async (query: string, expertiseAreas: string[]) => {
    try {
      const searchRequest = {
        query,
        expertiseAreas,
        userId: userId || '',
        includeAvailability: true,
        includeCompatibility: true,
        maxResults: 20
      };
      
      const response = await intelligentDiscoveryService.findExpertMatches(searchRequest);
      const matches = response.data || [];
      
      setExpertMatches(matches);
      
      if (matches.length > 0) {
        onExpertMatched?.(matches[0]);
      }
      
    } catch (err) {
      setError('Failed to find expert matches via backend');
      console.error('Expert matching error:', err);
    }
  };

  // Utility Functions
  const filteredExperts = useMemo(() => {
    return experts.filter(expert => {
      const matchesExpertise = filterExpertise === 'all' || 
        expert.expertise_areas.some(area => area.name.toLowerCase().includes(filterExpertise.toLowerCase()));
      const matchesLocation = filterLocation === 'all' || expert.location === filterLocation;
      const matchesAvailability = filterAvailability === 'all' || expert.availability_status === filterAvailability;
      const matchesSearch = !searchTerm || 
        expert.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.expertise_areas.some(area => area.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesExpertise && matchesLocation && matchesAvailability && matchesSearch;
    });
  }, [experts, filterExpertise, filterLocation, filterAvailability, searchTerm]);

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280';
  };

  const getProficiencyColor = (level: string) => {
    return PROFICIENCY_COLORS[level as keyof typeof PROFICIENCY_COLORS] || '#6b7280';
  };

  const getConsultationStatusColor = (status: string) => {
    return CONSULTATION_STATUS_COLORS[status as keyof typeof CONSULTATION_STATUS_COLORS] || '#6b7280';
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  // Render Functions
  const renderExpertCard = (expert: ExpertProfile) => (
    <Card key={expert.id} className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={expert.avatar_url} />
              <AvatarFallback>{expert.display_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{expert.display_name}</h3>
                {expert.verification_status === 'verified' && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: getStatusColor(expert.availability_status),
                    color: getStatusColor(expert.availability_status)
                  }}
                >
                  {expert.availability_status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{expert.title}</p>
              <p className="text-xs text-muted-foreground">{expert.organization}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedExpert(expert)}>
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedExpert(expert);
                setShowConsultationDialog(true);
              }}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Consultation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Bio */}
          <p className="text-sm line-clamp-2">{expert.bio}</p>
          
          {/* Expertise Areas */}
          <div>
            <div className="text-sm font-medium mb-2">Expertise Areas</div>
            <div className="flex flex-wrap gap-1">
              {expert.expertise_areas.slice(0, 3).map((area) => (
                <Badge 
                  key={area.id} 
                  variant="secondary"
                  style={{ 
                    backgroundColor: getProficiencyColor(area.proficiency_level) + '20',
                    color: getProficiencyColor(area.proficiency_level)
                  }}
                  className="text-xs"
                >
                  {area.name}
                </Badge>
              ))}
              {expert.expertise_areas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{expert.expertise_areas.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {expert.statistics.average_rating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {expert.statistics.consultations_completed}
              </div>
              <div className="text-xs text-muted-foreground">Consultations</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {expert.statistics.response_time}h
              </div>
              <div className="text-xs text-muted-foreground">Response Time</div>
            </div>
          </div>
          
          {/* Location & Languages */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {expert.location}
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {expert.languages.join(', ')}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => {
                setSelectedExpert(expert);
                setShowConsultationDialog(true);
              }}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Consult
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderConsultationCard = (consultation: ConsultationRequest) => (
    <Card key={consultation.id} className={cn(
      "transition-all duration-200",
      liveUpdates.get(consultation.id) && "ring-2 ring-green-500 animate-pulse"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: getConsultationStatusColor(consultation.status),
                  color: getConsultationStatusColor(consultation.status)
                }}
              >
                {consultation.status}
              </Badge>
              <Badge variant="secondary">{consultation.type.replace('_', ' ')}</Badge>
              <Badge variant="outline">{consultation.priority}</Badge>
            </div>
            <CardTitle className="text-base">{consultation.title}</CardTitle>
            <CardDescription className="text-sm">
              {consultation.expertise_area} • {consultation.duration} minutes
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {consultation.status === 'pending' && consultation.expert_id === userId && (
                <>
                  <DropdownMenuItem 
                    onClick={() => updateConsultationStatus(consultation.id, 'accepted')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateConsultationStatus(consultation.id, 'declined')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm">{consultation.description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Requested {formatTimeAgo(consultation.created_at)}</span>
            </div>
            {consultation.scheduled_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Scheduled for {format(parseISO(consultation.scheduled_at), 'MMM dd, HH:mm')}</span>
              </div>
            )}
          </div>
          
          {consultation.meeting_link && (
            <Button variant="outline" size="sm" className="w-full">
              <Video className="w-4 h-4 mr-2" />
              Join Meeting
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderExpertsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterExpertise} onValueChange={setFilterExpertise}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Expertise Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Expertise</SelectItem>
              <SelectItem value="data science">Data Science</SelectItem>
              <SelectItem value="machine learning">Machine Learning</SelectItem>
              <SelectItem value="data engineering">Data Engineering</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="governance">Data Governance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAvailability} onValueChange={setFilterAvailability}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="away">Away</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadNetworkingData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expert Matches */}
      {expertMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recommended Experts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertMatches.slice(0, 3).map((match) => (
              <Card key={match.expert.id} className="border-blue-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      {Math.round(match.match_score * 100)}% Match
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{match.expert.statistics.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardHeader>
                {renderExpertCard(match.expert)}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Experts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Experts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Experts Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterExpertise !== 'all' || filterAvailability !== 'all' 
                  ? 'No experts match your current filters' 
                  : 'No experts are available at the moment'}
              </p>
            </div>
          ) : (
            filteredExperts.map(renderExpertCard)
          )}
        </div>
      </div>
    </div>
  );

  const renderConsultationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consultations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Consultations</h3>
            <p className="text-muted-foreground mb-4">You haven't requested any consultations yet</p>
            <Button onClick={() => setActiveTab('experts')}>
              Find Experts
            </Button>
          </div>
        ) : (
          consultations.map(renderConsultationCard)
        )}
      </div>
    </div>
  );

  if (loading && experts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading expert network...</p>
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
              <Network className="w-8 h-8 text-blue-500" />
              Expert Networking
            </h1>
            <p className="text-muted-foreground">
              Expert discovery and networking with skill-based matching and consultation management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {experts.length} experts
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {consultations.filter(c => c.status === 'pending').length} pending
            </Badge>
            <Button variant="outline" onClick={loadNetworkingData} disabled={loading}>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="experts">Experts</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
          </TabsList>

          <TabsContent value="experts" className="mt-6">
            {renderExpertsTab()}
          </TabsContent>

          <TabsContent value="consultations" className="mt-6">
            {renderConsultationsTab()}
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Knowledge Exchange</h3>
              <p className="text-muted-foreground">Knowledge sharing features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="mentorship" className="mt-6">
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Mentorship Programs</h3>
              <p className="text-muted-foreground">Mentorship features coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Request Consultation Dialog */}
        <Dialog open={showConsultationDialog} onOpenChange={setShowConsultationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Consultation</DialogTitle>
              <DialogDescription>
                Request a consultation with {selectedExpert?.display_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={consultationRequest.title || ''}
                    onChange={(e) => setConsultationRequest(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief title for consultation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={consultationRequest.type || ''} 
                    onValueChange={(value) => setConsultationRequest(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick_question">Quick Question</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="mentorship">Mentorship</SelectItem>
                      <SelectItem value="project_collaboration">Project Collaboration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={consultationRequest.description || ''}
                  onChange={(e) => setConsultationRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you need help with..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={consultationRequest.duration || ''}
                    onChange={(e) => setConsultationRequest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={consultationRequest.priority || ''} 
                    onValueChange={(value) => setConsultationRequest(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget (optional)</Label>
                  <Input
                    type="number"
                    value={consultationRequest.budget || ''}
                    onChange={(e) => setConsultationRequest(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                    placeholder="$100"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConsultationDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => requestConsultation(selectedExpert?.id || '', consultationRequest)} 
                disabled={isRequestingConsultation || !consultationRequest.title || !consultationRequest.description}
              >
                {isRequestingConsultation ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}