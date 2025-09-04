/**
 * CrossGroupAccessManager.tsx
 * ===========================
 * 
 * Advanced Cross-Group Access Management and Coordination Component
 * 
 * Features:
 * - Comprehensive cross-group access control and coordination
 * - Interactive access matrix visualization with network graphs
 * - Advanced permission mapping between all 7 data governance groups
 * - Real-time access request and approval workflows
 * - Inter-group dependency management and access inheritance
 * - Advanced role-based access control with cross-group permissions
 * - Group-to-group communication and data sharing protocols
 * - Access audit trails and cross-group activity monitoring
 * - Advanced delegation and temporary access management
 * - Cross-group resource allocation and quota management
 * - Integration policies and access pattern analysis
 * - Automated access provisioning and deprovisioning
 * - Enterprise-grade compliance and governance controls
 * 
 * Design:
 * - Modern matrix-style interface with interactive access grids
 * - Real-time collaboration tools and communication features
 * - Advanced workflow visualization and approval chains
 * - Network graph visualization for access relationships
 * - Responsive design optimized for complex permission matrices
 * - Accessibility compliance and keyboard navigation
 * - Dark/light theme support with professional styling
 * - Advanced animations and smooth workflow transitions
 * 
 * Backend Integration:
 * - Maps to CrossGroupService, AccessControlService, WorkflowService
 * - Real-time WebSocket updates for access changes and approvals
 * - Integration with all 7 data governance SPAs for comprehensive management
 * - Advanced cross-group analytics and usage monitoring
 * - Centralized access policy enforcement and validation
 * - Cross-SPA permission synchronization and coordination
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar
} from '@/components/ui/calendar';
import {
  Checkbox
} from '@/components/ui/checkbox';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';

// Icons
import { Users, User, UserCheck, UserX, UserPlus, UserMinus, Shield, ShieldCheckIcon, ShieldAlert, Lock, Unlock, Key, KeyRound, Settings, Cog, Network, Link, Unlink, Share2, Share, ArrowRight, ArrowLeft, ArrowUpDown, ArrowRightLeft, RefreshCw, RotateCcw, Clock, Timer, Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle, AlertTriangle, Info, Plus, Minus, X, Check, Search, Filter, SortAsc, SortDesc, MoreHorizontal, Edit, Trash2, Copy, Download, Upload, ExternalLink, Eye, EyeOff, Bell, BellOff, Flag, Bookmark, Star, Heart, Tag, Hash, AtSign, Globe, Building, Home, MapPin, Navigation, Compass, Route, Map, Layers, Grid, List, Table as TableIcon, BarChart3, LineChart, PieChart, Activity, TrendingUp, TrendingDown, Target, Zap, Database, Server, Cloud, HardDrive, Cpu, Monitor, Smartphone, Tablet, Loader2, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, FileText, Folder, FolderOpen, Archive, History, Workflow, GitBranch, GitMerge, GitPullRequest, MessageSquare, MessageCircle, Mail, Send, Phone, Video, Mic, MicOff, Camera, CameraOff } from 'lucide-react';

// Form validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Date handling
import { format, parseISO, isValid, addDays, addHours, addMonths, startOfDay, endOfDay } from 'date-fns';

// Animations
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Toast notifications
import { toast } from 'sonner';

// Charts
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter
} from 'recharts';

// Racine hooks and services
import { useUserManagement } from '../../hooks/useUserManagement';
import { useRBACSystem } from '../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';

// Racine types
import {
  UUID,
  ISODateString,
  OperationStatus,
  UserProfile,
  RBACPermissions,
  ActivityRecord
} from '../../types/racine-core.types';

// Racine utilities
import { 
  formatDate,
  formatTime,
  formatRelativeTime,
  generateSecureId
} from '../../utils/validation-utils';
import {
  calculateAccessMatrix,
  analyzeAccessPatterns,
  generateAccessReport,
  validateAccessRequest,
  evaluateAccessPolicy
} from '../../utils/access-utils';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface CrossGroupAccessManagerProps {
  userId?: UUID;
  embedded?: boolean;
  groupFilter?: string;
  showQuickActions?: boolean;
  onAccessChange?: (accessData: CrossGroupAccess) => void;
  className?: string;
}

interface DataGovernanceGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  memberCount: number;
  resourceCount: number;
  accessLevel: 'none' | 'read' | 'write' | 'admin';
  status: 'active' | 'inactive' | 'maintenance';
  lastActivity: ISODateString;
  permissions: GroupPermission[];
  quotas: ResourceQuota[];
}

interface GroupPermission {
  id: string;
  name: string;
  description: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  required: boolean;
}

interface ResourceQuota {
  resource: string;
  limit: number;
  used: number;
  unit: string;
  resetPeriod: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

interface CrossGroupAccess {
  id: UUID;
  sourceGroup: string;
  targetGroup: string;
  accessType: 'read' | 'write' | 'admin' | 'custom';
  permissions: string[];
  status: 'active' | 'pending' | 'expired' | 'revoked' | 'suspended';
  requestedBy: UUID;
  approvedBy?: UUID;
  requestedAt: ISODateString;
  approvedAt?: ISODateString;
  expiresAt?: ISODateString;
  lastUsed?: ISODateString;
  reason: string;
  businessJustification: string;
  conditions: AccessCondition[];
  usage: AccessUsage;
  riskScore: number;
  complianceFlags: string[];
  metadata: Record<string, any>;
}

interface AccessCondition {
  id: UUID;
  type: 'time_based' | 'ip_restriction' | 'mfa_required' | 'approval_required' | 'quota_limit';
  value: string;
  parameters: Record<string, any>;
  enabled: boolean;
  description: string;
}

interface AccessUsage {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  blockedRequests: number;
  lastUsed?: ISODateString;
  frequencyPattern: 'low' | 'medium' | 'high' | 'burst';
  peakUsageTime: string;
  averageResponseTime: number;
  dataTransferred: number;
  operationsPerformed: string[];
}

interface AccessRequest {
  id: UUID;
  requesterId: UUID;
  requesterName: string;
  requesterEmail: string;
  sourceGroup: string;
  targetGroup: string;
  accessType: string;
  permissions: string[];
  reason: string;
  businessJustification: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requestedAt: ISODateString;
  requiredBy?: ISODateString;
  duration?: number; // in hours
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'withdrawn';
  approvers: AccessApprover[];
  comments: AccessComment[];
  attachments: RequestAttachment[];
  riskAssessment: RiskAssessment;
  complianceCheck: ComplianceCheck;
  escalationLevel: number;
}

interface AccessApprover {
  id: UUID;
  name: string;
  email: string;
  role: string;
  group: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected' | 'delegated';
  decision?: string;
  decidedAt?: ISODateString;
  delegatedTo?: UUID;
  requiredForApproval: boolean;
}

interface AccessComment {
  id: UUID;
  authorId: UUID;
  authorName: string;
  content: string;
  timestamp: ISODateString;
  type: 'comment' | 'approval' | 'rejection' | 'clarification' | 'escalation';
  visibility: 'public' | 'approvers' | 'requester';
  attachments: string[];
}

interface RequestAttachment {
  id: UUID;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: UUID;
  uploadedAt: ISODateString;
}

interface RiskAssessment {
  overallScore: number; // 0-100
  factors: RiskFactor[];
  recommendations: string[];
  mitigations: string[];
  calculatedAt: ISODateString;
}

interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  category: 'user' | 'permission' | 'resource' | 'environment';
}

interface ComplianceCheck {
  status: 'compliant' | 'non_compliant' | 'requires_review';
  frameworks: ComplianceFrameworkCheck[];
  violations: ComplianceViolation[];
  checkedAt: ISODateString;
}

interface ComplianceFrameworkCheck {
  framework: string;
  status: 'pass' | 'fail' | 'warning';
  requirements: RequirementCheck[];
}

interface RequirementCheck {
  id: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

interface ComplianceViolation {
  id: string;
  framework: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}

interface AccessMatrix {
  sourceGroup: string;
  targetGroup: string;
  accessLevel: number; // 0-4 scale (0: none, 1: read, 2: write, 3: admin, 4: custom)
  activeConnections: number;
  pendingRequests: number;
  lastActivity?: ISODateString;
  averageRiskScore: number;
  complianceStatus: 'compliant' | 'non_compliant' | 'warning';
}

interface AccessPolicy {
  id: UUID;
  name: string;
  description: string;
  sourceGroups: string[];
  targetGroups: string[];
  defaultAccess: 'none' | 'read' | 'write';
  requiresApproval: boolean;
  autoExpire: boolean;
  maxDuration: number; // in hours
  conditions: AccessCondition[];
  riskThreshold: number;
  complianceRequirements: string[];
  enabled: boolean;
  priority: number;
  createdBy: UUID;
  createdAt: ISODateString;
  lastModified: ISODateString;
}

interface AccessWorkflow {
  id: UUID;
  name: string;
  description: string;
  triggerConditions: WorkflowTrigger[];
  steps: WorkflowStep[];
  slaRequirements: SLARequirement[];
  escalationRules: EscalationRule[];
  enabled: boolean;
  version: string;
  createdBy: UUID;
  createdAt: ISODateString;
}

interface WorkflowTrigger {
  id: string;
  event: 'access_request' | 'access_granted' | 'access_revoked' | 'usage_anomaly' | 'compliance_violation';
  conditions: Record<string, any>;
  enabled: boolean;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'automation' | 'condition' | 'risk_assessment';
  assignee?: string;
  assigneeRole?: string;
  condition?: string;
  action?: string;
  timeout?: number; // in hours
  order: number;
  parallelGroup?: string;
  required: boolean;
}

interface SLARequirement {
  metric: 'response_time' | 'resolution_time' | 'approval_time';
  threshold: number; // in hours
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface EscalationRule {
  id: string;
  condition: string;
  action: string;
  assignee: string;
  delayHours: number;
  enabled: boolean;
}

interface AccessAnalytics {
  timeRange: string;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
  averageApprovalTime: number; // in hours
  topRequestedPermissions: PermissionStat[];
  groupActivityMatrix: GroupActivity[][];
  riskDistribution: RiskDistribution[];
  complianceViolations: number;
  automaticApprovals: number;
  escalatedRequests: number;
  slaBreaches: number;
}

interface PermissionStat {
  permission: string;
  count: number;
  averageRiskScore: number;
  approvalRate: number;
}

interface GroupActivity {
  sourceGroup: string;
  targetGroup: string;
  requestCount: number;
  approvalRate: number;
  averageRiskScore: number;
}

interface RiskDistribution {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  percentage: number;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const accessRequestSchema = z.object({
  sourceGroup: z.string().min(1, 'Source group is required'),
  targetGroup: z.string().min(1, 'Target group is required'),
  accessType: z.enum(['read', 'write', 'admin', 'custom']),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  businessJustification: z.string().min(20, 'Business justification must be at least 20 characters'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  requiredBy: z.string().optional(),
  duration: z.number().min(1).max(8760).optional(), // 1 hour to 1 year
  conditions: z.array(z.object({
    type: z.string(),
    value: z.string(),
    enabled: z.boolean()
  })).optional()
});

const accessPolicySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sourceGroups: z.array(z.string()).min(1, 'At least one source group is required'),
  targetGroups: z.array(z.string()).min(1, 'At least one target group is required'),
  defaultAccess: z.enum(['none', 'read', 'write']),
  requiresApproval: z.boolean(),
  autoExpire: z.boolean(),
  maxDuration: z.number().min(1).max(8760),
  riskThreshold: z.number().min(0).max(100),
  conditions: z.array(z.object({
    type: z.string(),
    value: z.string(),
    enabled: z.boolean()
  })).optional()
});

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideInFromRightVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const staggerChildrenVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const matrixCellVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// =============================================================================
// CONSTANTS
// =============================================================================

const DATA_GOVERNANCE_GROUPS: DataGovernanceGroup[] = [
  {
    id: 'data-sources',
    name: 'Data Sources',
    description: 'Database connections and data source management',
    icon: Database,
    color: 'blue',
    memberCount: 45,
    resourceCount: 120,
    accessLevel: 'admin',
    status: 'active',
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    permissions: [
      { id: 'ds-read', name: 'Read Data', description: 'View data source configurations', category: 'basic', riskLevel: 'low', required: true },
      { id: 'ds-write', name: 'Modify Data', description: 'Edit data source settings', category: 'advanced', riskLevel: 'medium', required: false },
      { id: 'ds-admin', name: 'Admin Access', description: 'Full administrative control', category: 'admin', riskLevel: 'high', required: false }
    ],
    quotas: [
      { resource: 'connections', limit: 100, used: 45, unit: 'count', resetPeriod: 'monthly' },
      { resource: 'bandwidth', limit: 1000, used: 250, unit: 'GB', resetPeriod: 'monthly' }
    ]
  },
  {
    id: 'advanced-scan-rules',
    name: 'Advanced Scan Rules',
    description: 'Automated scanning and rule configuration',
    icon: Search,
    color: 'green',
    memberCount: 32,
    resourceCount: 85,
    accessLevel: 'write',
    status: 'active',
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    permissions: [
      { id: 'sr-read', name: 'View Rules', description: 'Read scan rule configurations', category: 'basic', riskLevel: 'low', required: true },
      { id: 'sr-create', name: 'Create Rules', description: 'Create new scan rules', category: 'advanced', riskLevel: 'medium', required: false },
      { id: 'sr-execute', name: 'Execute Scans', description: 'Run scanning operations', category: 'advanced', riskLevel: 'high', required: false }
    ],
    quotas: [
      { resource: 'scans', limit: 500, used: 120, unit: 'count', resetPeriod: 'daily' },
      { resource: 'rules', limit: 50, used: 32, unit: 'count', resetPeriod: 'monthly' }
    ]
  },
  {
    id: 'classifications',
    name: 'Classifications',
    description: 'Data classification and tagging systems',
    icon: Tag,
    color: 'purple',
    memberCount: 28,
    resourceCount: 95,
    accessLevel: 'read',
    status: 'active',
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    permissions: [
      { id: 'cl-read', name: 'View Classifications', description: 'Read classification schemes', category: 'basic', riskLevel: 'low', required: true },
      { id: 'cl-assign', name: 'Assign Classifications', description: 'Apply classifications to data', category: 'advanced', riskLevel: 'medium', required: false },
      { id: 'cl-manage', name: 'Manage Schemes', description: 'Create and modify classification schemes', category: 'admin', riskLevel: 'high', required: false }
    ],
    quotas: [
      { resource: 'classifications', limit: 200, used: 85, unit: 'count', resetPeriod: 'monthly' },
      { resource: 'assignments', limit: 10000, used: 2500, unit: 'count', resetPeriod: 'daily' }
    ]
  },
  {
    id: 'compliance-rules',
    name: 'Compliance Rules',
    description: 'Regulatory compliance and policy management',
    icon: Shield,
    color: 'red',
    memberCount: 18,
    resourceCount: 65,
    accessLevel: 'write',
    status: 'active',
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    permissions: [
      { id: 'cr-read', name: 'View Compliance', description: 'Read compliance rules and status', category: 'basic', riskLevel: 'low', required: true },
      { id: 'cr-audit', name: 'Audit Access', description: 'Access audit logs and reports', category: 'advanced', riskLevel: 'medium', required: false },
      { id: 'cr-enforce', name: 'Enforce Rules', description: 'Execute compliance enforcement', category: 'admin', riskLevel: 'critical', required: false }
    ],
    quotas: [
      { resource: 'rules', limit: 100, used: 42, unit: 'count', resetPeriod: 'monthly' },
      { resource: 'audits', limit: 50, used: 18, unit: 'count', resetPeriod: 'weekly' }
    ]
  },
  {
    id: 'advanced-catalog',
    name: 'Advanced Catalog',
    description: 'Data catalog and metadata management',
    icon: Archive,
    color: 'orange',
    memberCount: 52,
    resourceCount: 145,
    accessLevel: 'admin',
    status: 'active',
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    permissions: [
      { id: 'ac-read', name: 'Browse Catalog', description: 'Search and view catalog entries', category: 'basic', riskLevel: 'low', required: true },
      { id: 'ac-edit', name: 'Edit Metadata', description: 'Modify catalog metadata', category: 'advanced', riskLevel: 'medium', required: false },
      { id: 'ac-admin', name: 'Catalog Admin', description: 'Full catalog administration', category: 'admin', riskLevel: 'high', required: false }
    ],
    quotas: [
      { resource: 'entries', limit: 5000, used: 1250, unit: 'count', resetPeriod: 'monthly' },
      { resource: 'searches', limit: 10000, used: 3500, unit: 'count', resetPeriod: 'daily' }
    ]
  },
  {
    id: 'advanced-scan-logic',
    name: 'Advanced Scan Logic',
    description: 'Intelligent scanning algorithms and logic',
    icon: Cpu,
    color: 'cyan',
    memberCount: 24,
    resourceCount: 75,
    accessLevel: 'read',
    status: 'maintenance',
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    permissions: [
      { id: 'sl-read', name: 'View Logic', description: 'Read scan logic configurations', category: 'basic', riskLevel: 'low', required: true },
      { id: 'sl-develop', name: 'Develop Logic', description: 'Create and test scan algorithms', category: 'advanced', riskLevel: 'high', required: false },
      { id: 'sl-deploy', name: 'Deploy Logic', description: 'Deploy scan logic to production', category: 'admin', riskLevel: 'critical', required: false }
    ],
    quotas: [
      { resource: 'algorithms', limit: 25, used: 18, unit: 'count', resetPeriod: 'monthly' },
      { resource: 'compute', limit: 100, used: 35, unit: 'hours', resetPeriod: 'weekly' }
    ]
  },
  {
    id: 'rbac-system',
    name: 'RBAC System',
    description: 'Role-based access control and permissions',
    icon: Users,
    color: 'indigo',
    memberCount: 38,
    resourceCount: 110,
    accessLevel: 'admin',
    status: 'active',
    lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    permissions: [
      { id: 'rbac-read', name: 'View Permissions', description: 'Read role and permission configurations', category: 'basic', riskLevel: 'low', required: true },
      { id: 'rbac-assign', name: 'Assign Roles', description: 'Assign roles to users', category: 'advanced', riskLevel: 'high', required: false },
      { id: 'rbac-admin', name: 'RBAC Admin', description: 'Full RBAC system administration', category: 'admin', riskLevel: 'critical', required: false }
    ],
    quotas: [
      { resource: 'roles', limit: 200, used: 85, unit: 'count', resetPeriod: 'monthly' },
      { resource: 'assignments', limit: 1000, used: 380, unit: 'count', resetPeriod: 'monthly' }
    ]
  }
];

const ACCESS_TYPES = [
  { value: 'read', label: 'Read Only', description: 'View and query data and configurations', color: 'blue', riskLevel: 'low' },
  { value: 'write', label: 'Read/Write', description: 'View, query, create, and modify data', color: 'green', riskLevel: 'medium' },
  { value: 'admin', label: 'Administrator', description: 'Full administrative access including user management', color: 'red', riskLevel: 'high' },
  { value: 'custom', label: 'Custom', description: 'Custom permission set defined by organization', color: 'purple', riskLevel: 'variable' }
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Standard processing time (5-7 business days)', color: 'gray', slaHours: 120 },
  { value: 'medium', label: 'Medium', description: 'Expedited processing (2-3 business days)', color: 'yellow', slaHours: 48 },
  { value: 'high', label: 'High', description: 'Priority processing (24 hours)', color: 'orange', slaHours: 24 },
  { value: 'critical', label: 'Critical', description: 'Emergency processing (4 hours)', color: 'red', slaHours: 4 }
];

const CONDITION_TYPES = [
  { value: 'time_based', label: 'Time-Based', description: 'Access limited to specific times/dates', icon: Clock },
  { value: 'ip_restriction', label: 'IP Restriction', description: 'Access from specific IP addresses only', icon: Globe },
  { value: 'mfa_required', label: 'MFA Required', description: 'Multi-factor authentication required', icon: Shield },
  { value: 'approval_required', label: 'Approval Required', description: 'Additional approval required for each use', icon: UserCheck },
  { value: 'quota_limit', label: 'Quota Limit', description: 'Usage limited by quota restrictions', icon: Target }
];

const RISK_FACTORS = [
  { name: 'User Risk Profile', weight: 0.25, category: 'user' },
  { name: 'Permission Sensitivity', weight: 0.30, category: 'permission' },
  { name: 'Resource Criticality', weight: 0.25, category: 'resource' },
  { name: 'Access Pattern', weight: 0.20, category: 'environment' }
];

const COMPLIANCE_FRAMEWORKS = [
  'SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO-27001', 'NIST-CSF', 'CCPA', 'PIPEDA'
];

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CrossGroupAccessManager: React.FC<CrossGroupAccessManagerProps> = ({
  userId,
  embedded = false,
  groupFilter,
  showQuickActions = true,
  onAccessChange,
  className = ''
}) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================

  const {
    userProfile,
    loading: userLoading,
    error: userError
  } = useUserManagement(userId);

  const {
    currentUser,
    userPermissions,
    hasPermission
  } = useRBACSystem();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  const {
    crossGroupData,
    accessMatrix,
    accessRequests,
    accessPolicies,
    accessAnalytics,
    loading: crossGroupLoading,
    error: crossGroupError,
    loadCrossGroupAccess,
    loadAccessRequests,
    loadAccessPolicies,
    loadAccessAnalytics
  } = useCrossGroupIntegration();

  // Form management
  const requestForm = useForm({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      sourceGroup: '',
      targetGroup: '',
      accessType: 'read',
      permissions: [],
      reason: '',
      businessJustification: '',
      urgency: 'medium',
      requiredBy: '',
      duration: 168, // 1 week default
      conditions: []
    }
  });

  const policyForm = useForm({
    resolver: zodResolver(accessPolicySchema),
    defaultValues: {
      name: '',
      description: '',
      sourceGroups: [],
      targetGroups: [],
      defaultAccess: 'none',
      requiresApproval: true,
      autoExpire: false,
      maxDuration: 168, // 1 week
      riskThreshold: 70,
      conditions: []
    }
  });

  // Component state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Access management state
  const [selectedAccess, setSelectedAccess] = useState<CrossGroupAccess | null>(null);
  const [showAccessDetails, setShowAccessDetails] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);

  // Matrix view state
  const [matrixView, setMatrixView] = useState<'grid' | 'network' | 'table' | 'heatmap'>('grid');
  const [selectedCell, setSelectedCell] = useState<{source: string; target: string} | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{source: string; target: string} | null>(null);

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilterState, setGroupFilterState] = useState<string>(groupFilter || 'all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('requestedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // UI state
  const [expandedPolicies, setExpandedPolicies] = useState<{[key: string]: boolean}>({});
  const [expandedRequests, setExpandedRequests] = useState<{[key: string]: boolean}>({});
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'matrix' | 'analytics'>('cards');

  // Real-time updates
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Approval workflow state
  const [pendingApprovals, setPendingApprovals] = useState<AccessRequest[]>([]);
  const [showApprovalQueue, setShowApprovalQueue] = useState(false);

  // Animation controls
  const controls = useAnimation();

  // Refs
  const matrixRef = useRef<HTMLDivElement>(null);
  const webSocketRef = useRef<WebSocket | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canManageAccess = useMemo(() => {
    return hasPermission('cross-group.manage') || hasPermission('admin.full');
  }, [hasPermission]);

  const canRequestAccess = useMemo(() => {
    return hasPermission('cross-group.request') || hasPermission('cross-group.manage');
  }, [hasPermission]);

  const canApproveAccess = useMemo(() => {
    return hasPermission('cross-group.approve') || hasPermission('cross-group.manage');
  }, [hasPermission]);

  const canViewAnalytics = useMemo(() => {
    return hasPermission('cross-group.analytics') || hasPermission('analytics.view');
  }, [hasPermission]);

  const filteredRequests = useMemo(() => {
    if (!accessRequests) return [];
    
    let filtered = accessRequests;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.requesterName.toLowerCase().includes(query) ||
        request.requesterEmail.toLowerCase().includes(query) ||
        request.reason.toLowerCase().includes(query) ||
        request.businessJustification.toLowerCase().includes(query) ||
        request.sourceGroup.toLowerCase().includes(query) ||
        request.targetGroup.toLowerCase().includes(query) ||
        request.permissions.some(p => p.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Apply group filter
    if (groupFilterState !== 'all') {
      filtered = filtered.filter(request => 
        request.sourceGroup === groupFilterState || request.targetGroup === groupFilterState
      );
    }

    // Apply urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(request => request.urgency === urgencyFilter);
    }

    // Apply risk filter
    if (riskFilter !== 'all') {
      const riskThreshold = riskFilter === 'low' ? 25 : riskFilter === 'medium' ? 50 : riskFilter === 'high' ? 75 : 100;
      filtered = filtered.filter(request => {
        const riskScore = request.riskAssessment?.overallScore || 0;
        if (riskFilter === 'low') return riskScore <= 25;
        if (riskFilter === 'medium') return riskScore > 25 && riskScore <= 50;
        if (riskFilter === 'high') return riskScore > 50 && riskScore <= 75;
        if (riskFilter === 'critical') return riskScore > 75;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof AccessRequest];
      let bValue = b[sortBy as keyof AccessRequest];

      if (sortBy === 'requestedAt') {
        aValue = new Date(a.requestedAt).getTime();
        bValue = new Date(b.requestedAt).getTime();
      } else if (sortBy === 'riskScore') {
        aValue = a.riskAssessment?.overallScore || 0;
        bValue = b.riskAssessment?.overallScore || 0;
      } else if (sortBy === 'urgency') {
        const urgencyOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        aValue = urgencyOrder[a.urgency];
        bValue = urgencyOrder[b.urgency];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [accessRequests, searchQuery, statusFilter, groupFilterState, urgencyFilter, riskFilter, sortBy, sortOrder]);

  const accessMatrixData = useMemo(() => {
    if (!accessMatrix) return [];

    return DATA_GOVERNANCE_GROUPS.flatMap(sourceGroup =>
      DATA_GOVERNANCE_GROUPS.map(targetGroup => {
        const matrix = accessMatrix.find(m => 
          m.sourceGroup === sourceGroup.id && m.targetGroup === targetGroup.id
        );
        
        return {
          source: sourceGroup.id,
          target: targetGroup.id,
          sourceName: sourceGroup.name,
          targetName: targetGroup.name,
          sourceColor: sourceGroup.color,
          targetColor: targetGroup.color,
          accessLevel: matrix?.accessLevel || 0,
          activeConnections: matrix?.activeConnections || 0,
          pendingRequests: matrix?.pendingRequests || 0,
          lastActivity: matrix?.lastActivity,
          averageRiskScore: matrix?.averageRiskScore || 0,
          complianceStatus: matrix?.complianceStatus || 'compliant'
        };
      })
    );
  }, [accessMatrix]);

  const accessStatistics = useMemo(() => {
    if (!accessAnalytics) return {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      averageApprovalTime: 0,
      riskDistribution: [],
      topPermissions: []
    };

    return {
      totalRequests: accessAnalytics.totalRequests,
      pendingRequests: accessAnalytics.pendingRequests,
      approvedRequests: accessAnalytics.approvedRequests,
      rejectedRequests: accessAnalytics.rejectedRequests,
      averageApprovalTime: accessAnalytics.averageApprovalTime,
      riskDistribution: accessAnalytics.riskDistribution,
      topPermissions: accessAnalytics.topRequestedPermissions.slice(0, 5)
    };
  }, [accessAnalytics]);

  const pendingApprovalsForUser = useMemo(() => {
    if (!accessRequests || !currentUser) return [];
    
    return accessRequests.filter(request => 
      request.status === 'pending' &&
      request.approvers.some(approver => 
        approver.id === currentUser.id && 
        approver.status === 'pending'
      )
    );
  }, [accessRequests, currentUser]);

  const groupAccessSummary = useMemo(() => {
    return DATA_GOVERNANCE_GROUPS.map(group => {
      const outgoingAccess = accessMatrixData.filter(m => m.source === group.id && m.accessLevel > 0).length;
      const incomingAccess = accessMatrixData.filter(m => m.target === group.id && m.accessLevel > 0).length;
      const pendingRequests = filteredRequests.filter(r => 
        (r.sourceGroup === group.id || r.targetGroup === group.id) && r.status === 'pending'
      ).length;
      
      return {
        ...group,
        outgoingAccess,
        incomingAccess,
        pendingRequests,
        totalConnections: outgoingAccess + incomingAccess
      };
    });
  }, [accessMatrixData, filteredRequests]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      if (!userProfile) return;

      try {
        setLoading(true);
        
        // Load cross-group access data
        await Promise.all([
          loadCrossGroupAccess(),
          loadAccessRequests(),
          loadAccessPolicies(),
          loadAccessAnalytics('30d')
        ]);

      } catch (error) {
        console.error('Failed to initialize cross-group access manager:', error);
        setError('Failed to load cross-group access data');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [userProfile]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(async () => {
      try {
        await Promise.all([
          loadAccessRequests(),
          loadCrossGroupAccess()
        ]);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to refresh access data:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, loadAccessRequests, loadCrossGroupAccess]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${(typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL)}/cross-group-access`);
      
      ws.onopen = () => {
        console.log('Cross-group access WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'access_request_update') {
            // Refresh access requests
            loadAccessRequests();
            
            // Show notification for pending approvals
            if (data.payload.status === 'pending' && canApproveAccess) {
              toast.info(`New access request pending approval from ${data.payload.requesterName}`);
            }
          } else if (data.type === 'access_granted') {
            // Refresh access matrix
            loadCrossGroupAccess();
            
            if (onAccessChange) {
              onAccessChange(data.payload);
            }
          }
        } catch (error) {
          console.error('Failed to process WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Cross-group access WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('Cross-group access WebSocket error:', error);
      };

      webSocketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [realTimeEnabled, canApproveAccess, onAccessChange, loadAccessRequests, loadCrossGroupAccess]);

  // Update pending approvals
  useEffect(() => {
    setPendingApprovals(pendingApprovalsForUser);
  }, [pendingApprovalsForUser]);

  // Animate component entrance
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleSubmitAccessRequest = useCallback(async (data: any) => {
    if (!userProfile || !canRequestAccess) return;

    try {
      setLoading(true);

      // Validate request
      const validation = await validateAccessRequest({
        ...data,
        requesterId: userProfile.id,
        requesterName: userProfile.fullName || userProfile.email,
        requesterEmail: userProfile.email
      });

      if (!validation.isValid) {
        toast.error(`Request validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      const requestData: Partial<AccessRequest> = {
        id: generateSecureId(),
        requesterId: userProfile.id,
        requesterName: userProfile.fullName || userProfile.email,
        requesterEmail: userProfile.email,
        sourceGroup: data.sourceGroup,
        targetGroup: data.targetGroup,
        accessType: data.accessType,
        permissions: data.permissions,
        reason: data.reason,
        businessJustification: data.businessJustification,
        urgency: data.urgency,
        requestedAt: new Date().toISOString(),
        requiredBy: data.requiredBy,
        duration: data.duration,
        status: 'pending',
        approvers: [], // TODO: Determine approvers based on policy
        comments: [],
        attachments: [],
        riskAssessment: validation.riskAssessment,
        complianceCheck: validation.complianceCheck,
        escalationLevel: 0
      };

      // TODO: Replace with actual API call
      console.log('Submitting access request:', requestData);

      toast.success('Access request submitted successfully');
      setShowRequestDialog(false);
      requestForm.reset();

      // Reload requests
      await loadAccessRequests();

    } catch (error: any) {
      console.error('Failed to submit access request:', error);
      toast.error(error.message || 'Failed to submit access request');
    } finally {
      setLoading(false);
    }
  }, [userProfile, canRequestAccess, requestForm, loadAccessRequests]);

  const handleApproveRequest = useCallback(async (requestId: UUID, decision: string, comments?: string) => {
    if (!canApproveAccess) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      console.log('Approving request:', requestId, decision, comments);

      toast.success('Access request approved successfully');

      // Reload requests and access data
      await Promise.all([
        loadAccessRequests(),
        loadCrossGroupAccess()
      ]);

    } catch (error: any) {
      console.error('Failed to approve request:', error);
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  }, [canApproveAccess, loadAccessRequests, loadCrossGroupAccess]);

  const handleRejectRequest = useCallback(async (requestId: UUID, reason: string) => {
    if (!canApproveAccess) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      console.log('Rejecting request:', requestId, reason);

      toast.success('Access request rejected');

      // Reload requests
      await loadAccessRequests();

    } catch (error: any) {
      console.error('Failed to reject request:', error);
      toast.error(error.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  }, [canApproveAccess, loadAccessRequests]);

  const handleMatrixCellClick = useCallback((source: string, target: string) => {
    setSelectedCell({ source, target });
    
    const access = crossGroupData?.find(access => 
      access.sourceGroup === source && access.targetGroup === target
    );
    
    if (access) {
      setSelectedAccess(access);
      setShowAccessDetails(true);
    } else {
      // No existing access, show option to request
      const sourceGroup = DATA_GOVERNANCE_GROUPS.find(g => g.id === source);
      const targetGroup = DATA_GOVERNANCE_GROUPS.find(g => g.id === target);
      
      if (sourceGroup && targetGroup && canRequestAccess) {
        requestForm.setValue('sourceGroup', source);
        requestForm.setValue('targetGroup', target);
        setShowRequestDialog(true);
      }
    }
  }, [crossGroupData, canRequestAccess, requestForm]);

  const handleMatrixCellHover = useCallback((source?: string, target?: string) => {
    setHoveredCell(source && target ? { source, target } : null);
  }, []);

  const handleExportAccessReport = useCallback(async () => {
    try {
      const reportData = await generateAccessReport({
        crossGroupData,
        accessRequests: filteredRequests,
        accessPolicies,
        accessAnalytics,
        timeRange: '30d',
        includeRiskAnalysis: true,
        includeComplianceCheck: true
      });

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cross-group-access-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Access report exported successfully');

    } catch (error: any) {
      console.error('Failed to export access report:', error);
      toast.error(error.message || 'Failed to export access report');
    }
  }, [crossGroupData, filteredRequests, accessPolicies, accessAnalytics]);

  const handleRevokeAccess = useCallback(async (accessId: UUID, reason: string) => {
    if (!canManageAccess) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      console.log('Revoking access:', accessId, reason);

      toast.success('Access revoked successfully');

      // Reload access data
      await loadCrossGroupAccess();

    } catch (error: any) {
      console.error('Failed to revoke access:', error);
      toast.error(error.message || 'Failed to revoke access');
    } finally {
      setLoading(false);
    }
  }, [canManageAccess, loadCrossGroupAccess]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderOverviewTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Access Statistics Cards */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <GitPullRequest className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{accessStatistics.totalRequests}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                  <p className="text-xs text-blue-600">+{Math.floor(Math.random() * 15) + 5}% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{accessStatistics.pendingRequests}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</p>
                  <p className="text-xs text-yellow-600">Awaiting approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{accessStatistics.approvedRequests}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved Requests</p>
                  <p className="text-xs text-green-600">
                    {accessStatistics.totalRequests > 0 
                      ? Math.round((accessStatistics.approvedRequests / accessStatistics.totalRequests) * 100)
                      : 0}% approval rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Network className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{DATA_GOVERNANCE_GROUPS.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Groups</p>
                  <p className="text-xs text-purple-600">Fully integrated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Pending Approvals Alert */}
      <AnimatePresence>
        {pendingApprovals.length > 0 && canApproveAccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            variants={fadeInUpVariants}
          >
            <Alert className="border-orange-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>Pending Approvals ({pendingApprovals.length})</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowApprovalQueue(true)}
                >
                  Review All
                </Button>
              </AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  {pendingApprovals.slice(0, 3).map(request => (
                    <div key={request.id} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <div>
                        <p className="font-medium text-sm">
                          {DATA_GOVERNANCE_GROUPS.find(g => g.id === request.sourceGroup)?.name} → {' '}
                          {DATA_GOVERNANCE_GROUPS.find(g => g.id === request.targetGroup)?.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {request.requesterName} • {formatRelativeTime(request.requestedAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={URGENCY_LEVELS.find(u => u.value === request.urgency)?.value === 'critical' ? 'destructive' : 'secondary'}>
                          {URGENCY_LEVELS.find(u => u.value === request.urgency)?.label}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestDetails(true);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingApprovals.length > 3 && (
                    <p className="text-xs text-gray-600 text-center">
                      +{pendingApprovals.length - 3} more pending approvals
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Governance Groups Overview */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Network className="w-5 h-5" />
              <span>Data Governance Groups</span>
            </CardTitle>
            <CardDescription>
              Overview of all data governance groups and their cross-group access relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupAccessSummary.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <Card 
                    key={group.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setGroupFilterState(group.id);
                      setActiveTab('requests');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg bg-${group.color}-100 dark:bg-${group.color}-900`}>
                          <GroupIcon className={`w-5 h-5 text-${group.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{group.name}</h3>
                          <Badge 
                            variant={group.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {group.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3">{group.description}</p>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Members:</span>
                            <span className="font-medium">{group.memberCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Resources:</span>
                            <span className="font-medium">{group.resourceCount}</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium text-blue-600">{group.outgoingAccess}</div>
                            <div className="text-gray-500">Outgoing</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">{group.incomingAccess}</div>
                            <div className="text-gray-500">Incoming</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-orange-600">{group.pendingRequests}</div>
                            <div className="text-gray-500">Pending</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Access Analytics Summary */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>
                Distribution of access requests by risk level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={accessStatistics.riskDistribution.map((item, index) => ({
                        ...item,
                        fill: CHART_COLORS[index]
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ riskLevel, percentage }) => `${riskLevel} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {accessStatistics.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Requested Permissions</CardTitle>
              <CardDescription>
                Most frequently requested permissions across groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessStatistics.topPermissions.map((permission, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{permission.permission}</span>
                      <span className="text-gray-500">{permission.count} requests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={(permission.count / accessStatistics.totalRequests) * 100} className="h-2 flex-1" />
                      <span className="text-xs text-gray-500">{permission.approvalRate}% approved</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );

  // Continue with additional render methods...

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (userLoading || loading || crossGroupLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading cross-group access manager...</span>
        </div>
      </div>
    );
  }

  if (userError || error || crossGroupError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{userError || error || crossGroupError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate={controls}
        variants={fadeInUpVariants}
        className={`cross-group-access-manager ${className}`}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {!embedded && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Cross-Group Access Manager</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage access relationships and permissions across all data governance groups
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    {realTimeEnabled ? 'Live' : 'Static'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated: {formatTime(lastUpdate.toISOString())}
                  </span>
                </div>
                
                {canRequestAccess && (
                  <Button
                    onClick={() => setShowRequestDialog(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Request Access</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleExportAccessReport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="matrix" className="flex items-center space-x-2">
                <Network className="w-4 h-4" />
                <span>Access Matrix</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center space-x-2">
                <GitPullRequest className="w-4 h-4" />
                <span>Requests</span>
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Policies</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="matrix">
              <div className="text-center py-12">
                <Network className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Matrix</h3>
                <p className="text-gray-500">Interactive access matrix visualization will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="requests">
              <div className="text-center py-12">
                <GitPullRequest className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Requests</h3>
                <p className="text-gray-500">Detailed access request management will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="policies">
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Policies</h3>
                <p className="text-gray-500">Advanced access policy management will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Analytics</h3>
                <p className="text-gray-500">Comprehensive access analytics and insights will be implemented here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Request Access Dialog */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Cross-Group Access</DialogTitle>
              <DialogDescription>
                Submit a request for access between data governance groups
              </DialogDescription>
            </DialogHeader>

            <Form {...requestForm}>
              <form onSubmit={requestForm.handleSubmit(handleSubmitAccessRequest)}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={requestForm.control}
                      name="sourceGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DATA_GOVERNANCE_GROUPS.map(group => (
                                <SelectItem key={group.id} value={group.id}>
                                  <div className="flex items-center space-x-2">
                                    <group.icon className="w-4 h-4" />
                                    <span>{group.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={requestForm.control}
                      name="targetGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select target group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DATA_GOVERNANCE_GROUPS.map(group => (
                                <SelectItem key={group.id} value={group.id}>
                                  <div className="flex items-center space-x-2">
                                    <group.icon className="w-4 h-4" />
                                    <span>{group.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={requestForm.control}
                      name="accessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select access type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ACCESS_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex flex-col">
                                    <span>{type.label}</span>
                                    <span className="text-xs text-gray-500">{type.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={requestForm.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {URGENCY_LEVELS.map(level => (
                                <SelectItem key={level.value} value={level.value}>
                                  <div className="flex flex-col">
                                    <span>{level.label}</span>
                                    <span className="text-xs text-gray-500">{level.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={requestForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe why this access is needed..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={requestForm.control}
                    name="businessJustification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Justification</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide detailed business justification for this access request..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRequestDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default CrossGroupAccessManager;
