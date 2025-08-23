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
import { Users, UserPlus, UserMinus, UserCheck, UserX, Shield, Lock, Unlock, Globe, Building, Factory, Briefcase, Mail, Phone, Calendar, Clock, MessageCircle, Video, FileText, Share, Download, Upload, Eye, Edit, Trash2, Plus, Search, Filter, Settings, Bell, BellOff, RefreshCw, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, X, Check, CheckCircle, AlertTriangle, Info, HelpCircle, Loader2, Star, Heart, Bookmark, Flag, Copy, ExternalLink, Tag, Tags, Folder, FolderOpen, Database, Server, Cloud, Cpu, Monitor, Smartphone, Tablet, Laptop, MousePointer, Hand, Grab, Move, CornerDownRight, Maximize2, Minimize2, RotateCcw, Play, Pause, StopCircle, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Navigation, Compass, Map, Route, Microscope, FlaskConical, Beaker, Atom, Dna, Type, Palette, Layers, Grid, Layout, Activity, TrendingUp, BarChart3, PieChart, LineChart, Target, Award, Trophy, Medal, Crown, Zap, Brain, Lightbulb, GraduationCap, BookMarked, Library } from 'lucide-react';
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

// External Collaborator Types
interface ExternalCollaborator {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  organization: string;
  title: string;
  department?: string;
  phone?: string;
  linkedInProfile?: string;
  status: 'invited' | 'active' | 'suspended' | 'expired' | 'revoked';
  accessLevel: 'read_only' | 'comment' | 'edit' | 'admin';
  invitedBy: string;
  invitedAt: Date;
  lastActiveAt?: Date;
  expiresAt?: Date;
  permissions: ExternalCollaboratorPermissions;
  accessibleResources: AccessibleResource[];
  collaborationHistory: CollaborationActivity[];
  securityProfile: SecurityProfile;
  complianceStatus: ComplianceStatus;
  isVerified: boolean;
  tags: string[];
  notes: string;
}

interface ExternalCollaboratorPermissions {
  canViewDocuments: boolean;
  canEditDocuments: boolean;
  canCreateDocuments: boolean;
  canDeleteDocuments: boolean;
  canShareDocuments: boolean;
  canCommentOnDocuments: boolean;
  canJoinMeetings: boolean;
  canScheduleMeetings: boolean;
  canAccessKnowledgeBase: boolean;
  canRequestExpertConsultation: boolean;
  canViewAnalytics: boolean;
  canInviteOthers: boolean;
  canAccessPrivateChannels: boolean;
  canDownloadFiles: boolean;
  canUploadFiles: boolean;
  restrictedDomains: string[];
  allowedIpRanges: string[];
  timeRestrictions: TimeRestriction[];
}

interface TimeRestriction {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timeZone: string;
}

interface AccessibleResource {
  id: string;
  type: 'document' | 'folder' | 'project' | 'channel' | 'workspace';
  name: string;
  path: string;
  permissions: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

interface CollaborationActivity {
  id: string;
  type: 'document_viewed' | 'document_edited' | 'comment_posted' | 'meeting_joined' | 'file_downloaded' | 'file_uploaded';
  resourceId: string;
  resourceName: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  details: { [key: string]: any };
}

interface SecurityProfile {
  lastSecurityScan: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  threatIndicators: ThreatIndicator[];
  accessViolations: AccessViolation[];
  deviceFingerprints: DeviceFingerprint[];
  loginAttempts: LoginAttempt[];
  twoFactorEnabled: boolean;
  ssoEnabled: boolean;
}

interface ThreatIndicator {
  id: string;
  type: 'suspicious_login' | 'unusual_activity' | 'malware_detection' | 'data_exfiltration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

interface AccessViolation {
  id: string;
  type: 'unauthorized_access' | 'permission_exceeded' | 'time_restriction_violated' | 'ip_restriction_violated';
  description: string;
  timestamp: Date;
  resourceId: string;
  actionTaken: string;
}

interface DeviceFingerprint {
  id: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  firstSeen: Date;
  lastSeen: Date;
  isTrusted: boolean;
}

interface LoginAttempt {
  id: string;
  timestamp: Date;
  ipAddress: string;
  location: string;
  success: boolean;
  failureReason?: string;
  deviceFingerprint: string;
}

interface ComplianceStatus {
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
  sox404Compliant: boolean;
  iso27001Compliant: boolean;
  dataRetentionPolicyAccepted: boolean;
  privacyPolicyAccepted: boolean;
  termsOfServiceAccepted: boolean;
  lastComplianceCheck: Date;
  complianceViolations: ComplianceViolation[];
}

interface ComplianceViolation {
  id: string;
  type: 'data_retention' | 'access_logging' | 'encryption' | 'privacy';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

interface ExternalOrganization {
  id: string;
  name: string;
  domain: string;
  type: 'partner' | 'vendor' | 'client' | 'contractor' | 'consultant';
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location: string;
  website?: string;
  logo?: string;
  primaryContact: string;
  contractStatus: 'active' | 'pending' | 'expired' | 'terminated';
  contractStartDate: Date;
  contractEndDate?: Date;
  collaborators: ExternalCollaborator[];
  securityRating: number;
  complianceCertifications: string[];
  dataProcessingAgreement: boolean;
  ndaSigned: boolean;
  riskAssessmentCompleted: boolean;
  lastSecurityAudit?: Date;
}

interface CollaborationInvitation {
  id: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  organizationName: string;
  accessLevel: string;
  permissions: ExternalCollaboratorPermissions;
  resources: string[];
  message: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sentAt: Date;
  respondedAt?: Date;
  invitationToken: string;
}

interface ExternalCollaboratorState {
  collaborators: ExternalCollaborator[];
  organizations: ExternalOrganization[];
  invitations: CollaborationInvitation[];
  selectedCollaborator: ExternalCollaborator | null;
  selectedOrganization: ExternalOrganization | null;
  securityAlerts: ThreatIndicator[];
  complianceReports: ComplianceStatus[];
  accessLogs: CollaborationActivity[];
  isLoading: boolean;
  error: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } }
};

export const ExternalCollaboratorManager: React.FC = () => {
  const {
    collaborationHubs, participants, inviteExternalCollaborator, manageExternalAccess,
    isConnected, refresh
  } = useCollaboration();

  const { orchestrationState, executeOrchestration } = useRacineOrchestration();
  const { integrationStatus, executeIntegration } = useCrossGroupIntegration();
  const { currentUser, userPermissions, teamMembers } = useUserManagement();
  const { activeWorkspace, workspaceMembers } = useWorkspaceManagement();
  const { trackActivity, getActivityAnalytics } = useActivityTracker();
  const { workflows, executeWorkflow } = useJobWorkflow();
  const { pipelines, executePipeline } = usePipelineManager();
  const { aiInsights, getRecommendations, analyzeContent } = useAIAssistant();

  const [externalState, setExternalState] = useState<ExternalCollaboratorState>({
    collaborators: [], organizations: [], invitations: [], selectedCollaborator: null,
    selectedOrganization: null, securityAlerts: [], complianceReports: [], accessLogs: [],
    isLoading: false, error: null
  });

  const [selectedView, setSelectedView] = useState<'collaborators' | 'organizations' | 'invitations' | 'security' | 'compliance'>('collaborators');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    status: 'all', accessLevel: 'all', organization: 'all', riskLevel: 'all'
  });

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);

  const [invitationForm, setInvitationForm] = useState({
    recipientEmail: '', recipientName: '', organizationName: '', accessLevel: 'read_only' as const,
    message: '', expiresInDays: 30, resources: [] as string[], permissions: {} as ExternalCollaboratorPermissions
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeExternalCollaboratorManager();
  }, []);

  useEffect(() => {
    if (searchQuery) performCollaboratorSearch(searchQuery);
  }, [searchQuery, filterOptions]);

  const initializeExternalCollaboratorManager = async () => {
    try {
      setExternalState(prev => ({ ...prev, isLoading: true }));
      await Promise.all([
        loadExternalCollaborators(),
        loadExternalOrganizations(),
        loadCollaborationInvitations(),
        loadSecurityAlerts(),
        loadAccessLogs()
      ]);
      
      trackActivity({
        type: 'external_collaborator_manager_initialized', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { component: 'ExternalCollaboratorManager', workspace: activeWorkspace?.id }
      });
      
      setExternalState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to initialize external collaborator manager:', error);
      setExternalState(prev => ({ ...prev, isLoading: false, error: 'Failed to initialize external collaborator manager' }));
    }
  };

  const loadExternalCollaborators = async () => {
    try {
      const collaborators = await generateMockExternalCollaborators();
      setExternalState(prev => ({ ...prev, collaborators }));
    } catch (error) {
      console.error('Failed to load external collaborators:', error);
    }
  };

  const loadExternalOrganizations = async () => {
    try {
      const organizations = await generateMockExternalOrganizations();
      setExternalState(prev => ({ ...prev, organizations }));
    } catch (error) {
      console.error('Failed to load external organizations:', error);
    }
  };

  const loadCollaborationInvitations = async () => {
    try {
      const invitations = await generateMockInvitations();
      setExternalState(prev => ({ ...prev, invitations }));
    } catch (error) {
      console.error('Failed to load collaboration invitations:', error);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      const alerts = await generateMockSecurityAlerts();
      setExternalState(prev => ({ ...prev, securityAlerts: alerts }));
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    }
  };

  const loadAccessLogs = async () => {
    try {
      const logs = await generateMockAccessLogs();
      setExternalState(prev => ({ ...prev, accessLogs: logs }));
    } catch (error) {
      console.error('Failed to load access logs:', error);
    }
  };

  const performCollaboratorSearch = async (query: string) => {
    try {
      const searchTerms = query.toLowerCase().split(' ');
      const filteredCollaborators = externalState.collaborators.filter(collaborator => {
        const name = collaborator.name.toLowerCase();
        const email = collaborator.email.toLowerCase();
        const organization = collaborator.organization.toLowerCase();
        
        return searchTerms.some(term => 
          name.includes(term) || email.includes(term) || organization.includes(term)
        );
      });
      
      // Apply additional filters
      const finalResults = filteredCollaborators.filter(collaborator => {
        if (filterOptions.status !== 'all' && collaborator.status !== filterOptions.status) return false;
        if (filterOptions.accessLevel !== 'all' && collaborator.accessLevel !== filterOptions.accessLevel) return false;
        if (filterOptions.organization !== 'all' && collaborator.organization !== filterOptions.organization) return false;
        if (filterOptions.riskLevel !== 'all' && collaborator.securityProfile.riskLevel !== filterOptions.riskLevel) return false;
        return true;
      });
      
      // Update the displayed collaborators
      setExternalState(prev => ({ ...prev, collaborators: finalResults }));
    } catch (error) {
      console.error('Failed to perform collaborator search:', error);
    }
  };

  const sendCollaborationInvitation = async () => {
    try {
      const invitation: CollaborationInvitation = {
        id: `invitation-${Date.now()}`, recipientEmail: invitationForm.recipientEmail,
        recipientName: invitationForm.recipientName, senderName: currentUser?.name || '',
        organizationName: invitationForm.organizationName, accessLevel: invitationForm.accessLevel,
        permissions: invitationForm.permissions, resources: invitationForm.resources,
        message: invitationForm.message, expiresAt: new Date(Date.now() + invitationForm.expiresInDays * 24 * 60 * 60 * 1000),
        status: 'pending', sentAt: new Date(), invitationToken: `token-${Date.now()}`
      };

      await inviteExternalCollaborator({
        email: invitation.recipientEmail, name: invitation.recipientName,
        organization: invitation.organizationName, accessLevel: invitation.accessLevel,
        permissions: invitation.permissions, resources: invitation.resources,
        message: invitation.message, expiresAt: invitation.expiresAt
      });

      setExternalState(prev => ({ ...prev, invitations: [invitation, ...prev.invitations] }));
      
      trackActivity({
        type: 'external_collaborator_invited', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { recipientEmail: invitation.recipientEmail, organization: invitation.organizationName }
      });

      setShowInviteDialog(false);
      resetInvitationForm();
    } catch (error) {
      console.error('Failed to send collaboration invitation:', error);
    }
  };

  const resetInvitationForm = () => {
    setInvitationForm({
      recipientEmail: '', recipientName: '', organizationName: '', accessLevel: 'read_only',
      message: '', expiresInDays: 30, resources: [], permissions: {} as ExternalCollaboratorPermissions
    });
  };

  const revokeCollaboratorAccess = async (collaboratorId: string) => {
    try {
      const collaborator = externalState.collaborators.find(c => c.id === collaboratorId);
      if (!collaborator) return;

      const updatedCollaborator = { ...collaborator, status: 'revoked' as const };
      
      await manageExternalAccess({
        collaboratorId, action: 'revoke', reason: 'Manual revocation by admin'
      });

      setExternalState(prev => ({
        ...prev,
        collaborators: prev.collaborators.map(c => c.id === collaboratorId ? updatedCollaborator : c)
      }));

      trackActivity({
        type: 'external_collaborator_revoked', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { collaboratorId, collaboratorName: collaborator.name, organization: collaborator.organization }
      });
    } catch (error) {
      console.error('Failed to revoke collaborator access:', error);
    }
  };

  const updateCollaboratorPermissions = async (collaboratorId: string, permissions: ExternalCollaboratorPermissions) => {
    try {
      const collaborator = externalState.collaborators.find(c => c.id === collaboratorId);
      if (!collaborator) return;

      const updatedCollaborator = { ...collaborator, permissions };
      
      await manageExternalAccess({
        collaboratorId, action: 'update_permissions', permissions
      });

      setExternalState(prev => ({
        ...prev,
        collaborators: prev.collaborators.map(c => c.id === collaboratorId ? updatedCollaborator : c)
      }));

      trackActivity({
        type: 'external_collaborator_permissions_updated', userId: currentUser?.id || '', timestamp: new Date(),
        metadata: { collaboratorId, collaboratorName: collaborator.name }
      });
    } catch (error) {
      console.error('Failed to update collaborator permissions:', error);
    }
  };

  const generateMockExternalCollaborators = async (): Promise<ExternalCollaborator[]> => {
    const collaborators: ExternalCollaborator[] = [];
    const organizations = ['TechCorp Inc', 'DataSystems LLC', 'CloudPartners', 'InnovateNow', 'DigitalSolutions'];
    const statuses = ['active', 'invited', 'suspended', 'expired'];
    const accessLevels = ['read_only', 'comment', 'edit', 'admin'];
    const riskLevels = ['low', 'medium', 'high'];

    for (let i = 0; i < 25; i++) {
      collaborators.push({
        id: `external-${i}`, email: `external${i}@example.com`, name: `External User ${i + 1}`,
        avatar: `/avatars/external-${i}.jpg`, organization: organizations[Math.floor(Math.random() * organizations.length)],
        title: 'External Consultant', department: 'Engineering', phone: '+1-555-0123',
        linkedInProfile: `https://linkedin.com/in/external${i}`,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        accessLevel: accessLevels[Math.floor(Math.random() * accessLevels.length)] as any,
        invitedBy: currentUser?.id || '', invitedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        permissions: {
          canViewDocuments: true, canEditDocuments: Math.random() > 0.5, canCreateDocuments: Math.random() > 0.7,
          canDeleteDocuments: false, canShareDocuments: Math.random() > 0.6, canCommentOnDocuments: true,
          canJoinMeetings: true, canScheduleMeetings: Math.random() > 0.8, canAccessKnowledgeBase: Math.random() > 0.4,
          canRequestExpertConsultation: Math.random() > 0.6, canViewAnalytics: false, canInviteOthers: false,
          canAccessPrivateChannels: false, canDownloadFiles: Math.random() > 0.5, canUploadFiles: Math.random() > 0.7,
          restrictedDomains: [], allowedIpRanges: [], timeRestrictions: []
        },
        accessibleResources: [], collaborationHistory: [], 
        securityProfile: {
          lastSecurityScan: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)] as any,
          threatIndicators: [], accessViolations: [], deviceFingerprints: [], loginAttempts: [],
          twoFactorEnabled: Math.random() > 0.5, ssoEnabled: Math.random() > 0.3
        },
        complianceStatus: {
          gdprCompliant: true, hipaaCompliant: Math.random() > 0.5, sox404Compliant: Math.random() > 0.7,
          iso27001Compliant: Math.random() > 0.6, dataRetentionPolicyAccepted: true,
          privacyPolicyAccepted: true, termsOfServiceAccepted: true,
          lastComplianceCheck: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          complianceViolations: []
        },
        isVerified: Math.random() > 0.3, tags: ['external', 'contractor'], notes: 'External collaborator notes'
      });
    }

    return collaborators;
  };

  const generateMockExternalOrganizations = async (): Promise<ExternalOrganization[]> => {
    const organizations: ExternalOrganization[] = [];
    const orgTypes = ['partner', 'vendor', 'client', 'contractor', 'consultant'];
    const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Consulting'];
    const sizes = ['startup', 'small', 'medium', 'large', 'enterprise'];

    for (let i = 0; i < 10; i++) {
      organizations.push({
        id: `org-${i}`, name: `Organization ${i + 1}`, domain: `org${i}.com`,
        type: orgTypes[Math.floor(Math.random() * orgTypes.length)] as any,
        industry: industries[Math.floor(Math.random() * industries.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)] as any,
        location: 'San Francisco, CA', website: `https://org${i}.com`, logo: `/logos/org-${i}.png`,
        primaryContact: `contact${i}@org${i}.com`, contractStatus: 'active',
        contractStartDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        contractEndDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
        collaborators: [], securityRating: 7 + Math.random() * 3,
        complianceCertifications: ['ISO 27001', 'SOC 2'], dataProcessingAgreement: true,
        ndaSigned: true, riskAssessmentCompleted: true,
        lastSecurityAudit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      });
    }

    return organizations;
  };

  const generateMockInvitations = async (): Promise<CollaborationInvitation[]> => {
    const invitations: CollaborationInvitation[] = [];
    const statuses = ['pending', 'accepted', 'declined', 'expired'];

    for (let i = 0; i < 15; i++) {
      invitations.push({
        id: `invitation-${i}`, recipientEmail: `invite${i}@example.com`,
        recipientName: `Invited User ${i + 1}`, senderName: currentUser?.name || '',
        organizationName: `Partner Org ${i + 1}`, accessLevel: 'read_only',
        permissions: {} as ExternalCollaboratorPermissions, resources: [],
        message: 'You have been invited to collaborate on our project.',
        expiresAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        respondedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : undefined,
        invitationToken: `token-${i}`
      });
    }

    return invitations;
  };

  const generateMockSecurityAlerts = async (): Promise<ThreatIndicator[]> => {
    const alerts: ThreatIndicator[] = [];
    const types = ['suspicious_login', 'unusual_activity', 'malware_detection', 'data_exfiltration'];
    const severities = ['low', 'medium', 'high', 'critical'];

    for (let i = 0; i < 8; i++) {
      alerts.push({
        id: `alert-${i}`, type: types[Math.floor(Math.random() * types.length)] as any,
        severity: severities[Math.floor(Math.random() * severities.length)] as any,
        description: `Security alert ${i + 1} - Suspicious activity detected`,
        detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        resolved: Math.random() > 0.5,
        resolvedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : undefined
      });
    }

    return alerts;
  };

  const generateMockAccessLogs = async (): Promise<CollaborationActivity[]> => {
    const logs: CollaborationActivity[] = [];
    const types = ['document_viewed', 'document_edited', 'comment_posted', 'meeting_joined', 'file_downloaded', 'file_uploaded'];

    for (let i = 0; i < 50; i++) {
      logs.push({
        id: `log-${i}`, type: types[Math.floor(Math.random() * types.length)] as any,
        resourceId: `resource-${Math.floor(Math.random() * 20)}`, resourceName: `Resource ${Math.floor(Math.random() * 20) + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'San Francisco, CA', details: {}
      });
    }

    return logs;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'revoked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'edit': return 'bg-orange-100 text-orange-800';
      case 'comment': return 'bg-blue-100 text-blue-800';
      case 'read_only': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCollaboratorGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {externalState.collaborators.slice(0, 12).map((collaborator) => (
        <motion.div key={collaborator.id} variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="group">
          <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback>{collaborator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{collaborator.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{collaborator.title}</p>
                    <p className="text-xs text-muted-foreground">{collaborator.organization}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setExternalState(prev => ({ ...prev, selectedCollaborator: collaborator }))}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => revokeCollaboratorAccess(collaborator.id)}>
                      <UserX className="h-4 w-4 mr-2" />
                      Revoke Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getStatusColor(collaborator.status)}>
                  {collaborator.status}
                </Badge>
                <Badge className={getAccessLevelColor(collaborator.accessLevel)}>
                  {collaborator.accessLevel.replace('_', ' ')}
                </Badge>
                {collaborator.isVerified && (
                  <Badge variant="default">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Risk Level:</span>
                  <Badge className={getRiskLevelColor(collaborator.securityProfile.riskLevel)}>
                    {collaborator.securityProfile.riskLevel}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Last Active:</span>
                  <span className="text-muted-foreground">
                    {collaborator.lastActiveAt ? formatDate(collaborator.lastActiveAt) : 'Never'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Expires:</span>
                  <span className="text-muted-foreground">
                    {collaborator.expiresAt ? formatDate(collaborator.expiresAt) : 'Never'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  {collaborator.securityProfile.twoFactorEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      2FA
                    </Badge>
                  )}
                  {collaborator.complianceStatus.gdprCompliant && (
                    <Badge variant="outline" className="text-xs">GDPR</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderOrganizationsList = () => (
    <div className="space-y-4">
      {externalState.organizations.map((org) => (
        <motion.div key={org.id} variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{org.name}</h3>
                      <Badge variant="outline">{org.type}</Badge>
                      <Badge className={org.contractStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {org.contractStatus}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {org.industry} • {org.size} • {org.location}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Collaborators:</span>
                        <span className="font-medium ml-1">{org.collaborators.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Security Rating:</span>
                        <span className="font-medium ml-1">{org.securityRating.toFixed(1)}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contract:</span>
                        <span className="font-medium ml-1">{formatDate(org.contractEndDate || new Date())}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Audit:</span>
                        <span className="font-medium ml-1">
                          {org.lastSecurityAudit ? formatDate(org.lastSecurityAudit) : 'Never'}
                        </span>
                      </div>
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
                    <DropdownMenuItem onClick={() => setExternalState(prev => ({ ...prev, selectedOrganization: org }))}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Collaborator
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      Security Review
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Organization
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  {org.ndaSigned && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      NDA
                    </Badge>
                  )}
                  {org.dataProcessingAgreement && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      DPA
                    </Badge>
                  )}
                  {org.complianceCertifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{cert}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderInvitationsList = () => (
    <div className="space-y-4">
      {externalState.invitations.map((invitation) => (
        <motion.div key={invitation.id} variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">{invitation.recipientName}</h4>
                    <p className="text-sm text-muted-foreground">{invitation.recipientEmail}</p>
                    <p className="text-xs text-muted-foreground">{invitation.organizationName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(invitation.status)}>
                    {invitation.status}
                  </Badge>
                  <Badge className={getAccessLevelColor(invitation.accessLevel)}>
                    {invitation.accessLevel.replace('_', ' ')}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Invitation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <X className="h-4 w-4 mr-2" />
                        Cancel Invitation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Sent: {formatDate(invitation.sentAt)}</span>
                  <span>Expires: {formatDate(invitation.expiresAt)}</span>
                </div>
                {invitation.respondedAt && (
                  <div className="text-muted-foreground mt-1">
                    Responded: {formatDate(invitation.respondedAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

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
                <h1 className="text-2xl font-bold">External Collaborator Manager</h1>
                <p className="text-muted-foreground">Manage external partners, vendors, and guest access with enterprise security</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Collaborator
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
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input ref={searchInputRef} placeholder="Search collaborators, organizations..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            
            <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
              <TabsList>
                <TabsTrigger value="collaborators">
                  <Users className="h-4 w-4 mr-2" />
                  Collaborators
                </TabsTrigger>
                <TabsTrigger value="organizations">
                  <Building className="h-4 w-4 mr-2" />
                  Organizations
                </TabsTrigger>
                <TabsTrigger value="invitations">
                  <Mail className="h-4 w-4 mr-2" />
                  Invitations
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="compliance">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Compliance
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
            {externalState.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {selectedView === 'collaborators' && renderCollaboratorGrid()}
                {selectedView === 'organizations' && renderOrganizationsList()}
                {selectedView === 'invitations' && renderInvitationsList()}
                {selectedView === 'security' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Alerts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {externalState.securityAlerts.slice(0, 5).map((alert) => (
                            <Alert key={alert.id} className={getRiskLevelColor(alert.severity)}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Security Alert</AlertTitle>
                              <AlertDescription>
                                {alert.description}
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="secondary">{alert.type}</Badge>
                                  <Badge className={getRiskLevelColor(alert.severity)}>{alert.severity}</Badge>
                                  {alert.resolved && (
                                    <Badge variant="default">Resolved</Badge>
                                  )}
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {selectedView === 'compliance' && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Compliance Dashboard</h3>
                    <p className="text-muted-foreground">Compliance monitoring and reporting features coming soon</p>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invite External Collaborator</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Recipient Email</label>
                  <Input value={invitationForm.recipientEmail} 
                    onChange={(e) => setInvitationForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="collaborator@company.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Recipient Name</label>
                  <Input value={invitationForm.recipientName}
                    onChange={(e) => setInvitationForm(prev => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="John Doe" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Organization</label>
                <Input value={invitationForm.organizationName}
                  onChange={(e) => setInvitationForm(prev => ({ ...prev, organizationName: e.target.value }))}
                  placeholder="Partner Company Inc." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Access Level</label>
                  <Select value={invitationForm.accessLevel}
                    onValueChange={(value: any) => setInvitationForm(prev => ({ ...prev, accessLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read_only">Read Only</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires In (Days)</label>
                  <Input type="number" value={invitationForm.expiresInDays}
                    onChange={(e) => setInvitationForm(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                    min={1} max={365} />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea value={invitationForm.message}
                  onChange={(e) => setInvitationForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Welcome message for the collaborator..." rows={3} />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
                <Button onClick={sendCollaborationInvitation}>Send Invitation</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};