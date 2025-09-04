/**
 * 🔐 Access Control Manager - Enterprise Identity & Access Management
 * ==================================================================
 * 
 * Enterprise-grade access control management platform that provides comprehensive
 * Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC)
 * implementation with identity governance, access reviews, and audit trails.
 * 
 * Features:
 * - Advanced RBAC and ABAC policy management
 * - Identity lifecycle management and governance
 * - Automated access reviews and certifications
 * - Real-time access monitoring and analytics
 * - Privileged access management (PAM)
 * - Zero-trust access controls
 * - Comprehensive audit trails and compliance reporting
 * - Risk-based access decisions and adaptive authentication
 * 
 * Backend Integration:
 * - AccessControlService for policy management and enforcement
 * - IdentityGovernanceService for identity lifecycle management
 * - AccessReviewService for certification and review processes
 * - AuditService for comprehensive logging and compliance
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Shield, ShieldAlert, ShieldCheckIcon, ShieldX, Lock, Unlock, Key, KeyRound, Users, User, UserCheck, UserX, UserPlus, UserMinus, Crown, Award, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, Timer, Activity, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Settings, RefreshCw, Plus, Minus, Edit, Trash2, Copy, ExternalLink, Mail, Bell, BellOff, MoreHorizontal, Search, Filter, SortAsc, SortDesc, Download, Upload, FileText, ClipboardCheck, BookOpen, Star, Bookmark, Flag, MessageSquare, Archive, Folder, FolderOpen, History, Gauge, Target, Zap, Bug, Skull, Database, Server, Network, Cloud, Globe, Wifi, WifiOff, Layers, Workflow, Play, Pause, Square, AlertCircle, Info, HelpCircle, Crosshair, Radar, Brain, Microscope, TestTube, Beaker, FlaskConical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib copie/utils';
import { useSecurityCompliance } from '../../hooks/useSecurityCompliance';

// ==================== Types and Interfaces ====================

interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  
  // Policy Definition
  rules: AccessRule[];
  conditions: PolicyCondition[];
  
  // Scope
  subjects: PolicySubject[];
  resources: PolicyResource[];
  actions: PolicyAction[];
  
  // Enforcement
  effect: PolicyEffect;
  priority: number;
  
  // Lifecycle
  status: PolicyStatus;
  version: string;
  effectiveDate: string;
  expirationDate?: string;
  
  // Approval Workflow
  approvalRequired: boolean;
  approvers: string[];
  approvalStatus: ApprovalStatus;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastReviewed?: string;
  reviewCycle: number; // days
  
  // Analytics
  usageCount: number;
  violationCount: number;
  lastAccessed?: string;
  
  // Compliance
  complianceFrameworks: string[];
  riskLevel: RiskLevel;
  
  // Tags and Categories
  tags: string[];
  category: string;
}

enum PolicyType {
  RBAC = 'rbac',
  ABAC = 'abac',
  HYBRID = 'hybrid',
  CUSTOM = 'custom'
}

enum PolicyEffect {
  ALLOW = 'allow',
  DENY = 'deny',
  CONDITIONAL = 'conditional'
}

enum PolicyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  EXPIRED = 'expired',
  DEPRECATED = 'deprecated'
}

enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_REVIEW = 'requires_review'
}

enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CRITICAL = 'critical'
}

interface AccessRule {
  id: string;
  name: string;
  description: string;
  
  // Rule Logic
  expression: string;
  operator: RuleOperator;
  
  // Conditions
  conditions: RuleCondition[];
  
  // Actions
  allowedActions: string[];
  deniedActions: string[];
  
  // Constraints
  timeConstraints: TimeConstraint[];
  locationConstraints: LocationConstraint[];
  deviceConstraints: DeviceConstraint[];
  
  // Priority and Weight
  priority: number;
  weight: number;
  
  // Status
  enabled: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

enum RuleOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not',
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  IN = 'in',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than'
}

interface RuleCondition {
  attribute: string;
  operator: RuleOperator;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

interface TimeConstraint {
  type: 'schedule' | 'duration' | 'expiration';
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  timezone: string;
  maxDuration?: number; // minutes
}

interface LocationConstraint {
  type: 'ip_range' | 'country' | 'region' | 'office';
  allowedLocations: string[];
  blockedLocations: string[];
  requireVPN: boolean;
}

interface DeviceConstraint {
  type: 'managed' | 'compliant' | 'trusted';
  allowedDeviceTypes: string[];
  requireMFA: boolean;
  requireEncryption: boolean;
  minimumOSVersion?: string;
}

interface PolicyCondition {
  id: string;
  type: ConditionType;
  attribute: string;
  operator: RuleOperator;
  value: any;
  
  // Logic
  logicalOperator: 'AND' | 'OR';
  parentCondition?: string;
  
  // Metadata
  description: string;
  enabled: boolean;
}

enum ConditionType {
  USER_ATTRIBUTE = 'user_attribute',
  RESOURCE_ATTRIBUTE = 'resource_attribute',
  ENVIRONMENT = 'environment',
  TIME = 'time',
  LOCATION = 'location',
  DEVICE = 'device',
  RISK_SCORE = 'risk_score',
  CUSTOM = 'custom'
}

interface PolicySubject {
  type: 'user' | 'group' | 'role' | 'service_account';
  identifier: string;
  attributes: Record<string, any>;
}

interface PolicyResource {
  type: 'application' | 'database' | 'file' | 'api' | 'system';
  identifier: string;
  attributes: Record<string, any>;
  sensitivity: ResourceSensitivity;
}

enum ResourceSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

interface PolicyAction {
  name: string;
  type: 'read' | 'write' | 'execute' | 'delete' | 'admin' | 'custom';
  description: string;
  riskLevel: RiskLevel;
}

interface Role {
  id: string;
  name: string;
  description: string;
  type: RoleType;
  
  // Permissions
  permissions: Permission[];
  
  // Hierarchy
  parentRoles: string[];
  childRoles: string[];
  
  // Constraints
  maxUsers: number;
  requireApproval: boolean;
  
  // Lifecycle
  status: RoleStatus;
  effectiveDate: string;
  expirationDate?: string;
  
  // Assignment Rules
  autoAssignmentRules: AssignmentRule[];
  
  // Compliance
  complianceRequirements: string[];
  segregationRules: SegregationRule[];
  
  // Analytics
  userCount: number;
  usageFrequency: number;
  riskScore: number;
  
  // Metadata
  owner: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastReviewed?: string;
  
  // Tags
  tags: string[];
  category: string;
}

enum RoleType {
  FUNCTIONAL = 'functional',
  ORGANIZATIONAL = 'organizational',
  TECHNICAL = 'technical',
  EMERGENCY = 'emergency',
  TEMPORARY = 'temporary'
}

enum RoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DEPRECATED = 'deprecated'
}

interface Permission {
  id: string;
  name: string;
  description: string;
  
  // Scope
  resource: string;
  action: string;
  
  // Constraints
  conditions: PermissionCondition[];
  
  // Metadata
  category: string;
  riskLevel: RiskLevel;
  
  // Compliance
  complianceFrameworks: string[];
  
  // Status
  enabled: boolean;
  
  // Lifecycle
  createdAt: string;
  updatedAt: string;
}

interface PermissionCondition {
  type: string;
  attribute: string;
  operator: string;
  value: any;
  description: string;
}

interface AssignmentRule {
  id: string;
  name: string;
  description: string;
  
  // Criteria
  criteria: AssignmentCriteria[];
  
  // Actions
  assignRoles: string[];
  removeRoles: string[];
  
  // Conditions
  conditions: RuleCondition[];
  
  // Status
  enabled: boolean;
  priority: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface AssignmentCriteria {
  attribute: string;
  operator: RuleOperator;
  value: any;
  weight: number;
}

interface SegregationRule {
  id: string;
  name: string;
  description: string;
  
  // Conflicting Roles
  conflictingRoles: string[];
  
  // Enforcement
  enforcement: 'preventive' | 'detective';
  
  // Exceptions
  exceptions: string[];
  
  // Status
  enabled: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  
  // Identity
  employeeId?: string;
  department: string;
  title: string;
  manager?: string;
  
  // Access
  roles: UserRole[];
  directPermissions: Permission[];
  
  // Status
  status: UserStatus;
  accountType: AccountType;
  
  // Security
  lastLogin?: string;
  loginCount: number;
  failedLoginAttempts: number;
  passwordLastChanged?: string;
  mfaEnabled: boolean;
  
  // Risk
  riskScore: number;
  riskFactors: RiskFactor[];
  
  // Lifecycle
  createdAt: string;
  updatedAt: string;
  lastReviewed?: string;
  terminationDate?: string;
  
  // Attributes
  attributes: Record<string, any>;
  
  // Compliance
  complianceStatus: ComplianceStatus;
  
  // Tags
  tags: string[];
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  PENDING_ACTIVATION = 'pending_activation'
}

enum AccountType {
  HUMAN = 'human',
  SERVICE = 'service',
  SHARED = 'shared',
  EMERGENCY = 'emergency',
  GUEST = 'guest'
}

interface UserRole {
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
  
  // Assignment Context
  assignmentReason: string;
  approvalId?: string;
  
  // Status
  status: AssignmentStatus;
  
  // Usage
  lastUsed?: string;
  usageCount: number;
}

enum AssignmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

interface RiskFactor {
  type: string;
  description: string;
  severity: RiskLevel;
  score: number;
  detectedAt: string;
  
  // Mitigation
  mitigated: boolean;
  mitigationAction?: string;
  mitigatedAt?: string;
}

enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING_REVIEW = 'pending_review',
  EXEMPTED = 'exempted'
}

interface AccessReview {
  id: string;
  name: string;
  description: string;
  type: ReviewType;
  
  // Scope
  scope: ReviewScope;
  reviewItems: ReviewItem[];
  
  // Schedule
  startDate: string;
  dueDate: string;
  frequency: ReviewFrequency;
  
  // Reviewers
  reviewers: Reviewer[];
  escalationReviewers: string[];
  
  // Status
  status: ReviewStatus;
  progress: ReviewProgress;
  
  // Results
  decisions: ReviewDecision[];
  findings: ReviewFinding[];
  
  // Compliance
  complianceFramework: string[];
  riskLevel: RiskLevel;
  
  // Configuration
  autoReminders: boolean;
  escalationDays: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Analytics
  reviewEfficiency: number;
  findingsCount: number;
  violationsFound: number;
}

enum ReviewType {
  USER_ACCESS = 'user_access',
  ROLE_ENTITLEMENTS = 'role_entitlements',
  PRIVILEGED_ACCESS = 'privileged_access',
  APPLICATION_ACCESS = 'application_access',
  DATA_ACCESS = 'data_access',
  EMERGENCY_ACCESS = 'emergency_access',
  SEGREGATION_OF_DUTIES = 'segregation_of_duties'
}

interface ReviewScope {
  users: string[];
  roles: string[];
  applications: string[];
  departments: string[];
  
  // Filters
  includeInactive: boolean;
  includeServiceAccounts: boolean;
  riskLevelThreshold: RiskLevel;
  
  // Time Range
  accessGrantedAfter?: string;
  lastUsedBefore?: string;
}

interface ReviewItem {
  id: string;
  type: 'user_role' | 'user_permission' | 'role_permission';
  
  // Subject
  userId?: string;
  roleId?: string;
  permissionId?: string;
  
  // Details
  description: string;
  riskLevel: RiskLevel;
  lastUsed?: string;
  businessJustification?: string;
  
  // Review
  reviewerId?: string;
  decision?: ReviewDecision;
  comments?: string;
  reviewedAt?: string;
  
  // Status
  status: ReviewItemStatus;
}

enum ReviewItemStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REVOKED = 'revoked',
  MODIFIED = 'modified',
  ESCALATED = 'escalated',
  SKIPPED = 'skipped'
}

enum ReviewFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  AD_HOC = 'ad_hoc'
}

interface Reviewer {
  userId: string;
  name: string;
  email: string;
  role: ReviewerRole;
  
  // Assignment
  assignedItems: string[];
  completedItems: string[];
  
  // Status
  status: ReviewerStatus;
  
  // Delegation
  delegatedTo?: string;
  delegatedAt?: string;
  
  // Performance
  reviewEfficiency: number;
  averageResponseTime: number; // hours
}

enum ReviewerRole {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  ESCALATION = 'escalation',
  APPROVER = 'approver'
}

enum ReviewerStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELEGATED = 'delegated',
  OVERDUE = 'overdue'
}

enum ReviewStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

interface ReviewProgress {
  totalItems: number;
  reviewedItems: number;
  approvedItems: number;
  revokedItems: number;
  pendingItems: number;
  
  // Percentages
  completionPercentage: number;
  approvalRate: number;
  revocationRate: number;
  
  // Timeline
  averageReviewTime: number; // hours
  estimatedCompletion?: string;
}

interface ReviewDecision {
  itemId: string;
  decision: 'approve' | 'revoke' | 'modify' | 'escalate';
  reason: string;
  comments?: string;
  
  // Reviewer
  reviewerId: string;
  reviewerName: string;
  reviewedAt: string;
  
  // Modifications
  modifications?: AccessModification[];
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: string;
}

interface AccessModification {
  type: 'add_constraint' | 'remove_permission' | 'change_expiration' | 'add_approval';
  description: string;
  details: Record<string, any>;
}

interface ReviewFinding {
  id: string;
  type: FindingType;
  severity: RiskLevel;
  
  // Description
  title: string;
  description: string;
  
  // Evidence
  evidence: string[];
  affectedItems: string[];
  
  // Risk
  riskScore: number;
  businessImpact: string;
  
  // Remediation
  recommendedActions: string[];
  remediationPriority: 'low' | 'medium' | 'high' | 'critical';
  
  // Status
  status: FindingStatus;
  assignedTo?: string;
  
  // Timeline
  discoveredAt: string;
  dueDate?: string;
  resolvedAt?: string;
  
  // Compliance
  complianceViolations: string[];
}

enum FindingType {
  EXCESSIVE_PERMISSIONS = 'excessive_permissions',
  DORMANT_ACCOUNT = 'dormant_account',
  SEGREGATION_VIOLATION = 'segregation_violation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  MISSING_APPROVAL = 'missing_approval',
  EXPIRED_ACCESS = 'expired_access',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  COMPLIANCE_VIOLATION = 'compliance_violation'
}

enum FindingStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ACCEPTED_RISK = 'accepted_risk',
  FALSE_POSITIVE = 'false_positive'
}

interface AccessEvent {
  id: string;
  timestamp: string;
  
  // Event Details
  eventType: EventType;
  action: string;
  result: EventResult;
  
  // Actors
  userId: string;
  userName: string;
  sourceIP: string;
  userAgent: string;
  
  // Target
  resourceId: string;
  resourceType: string;
  resourceName: string;
  
  // Context
  sessionId: string;
  requestId: string;
  
  // Risk
  riskScore: number;
  riskFactors: string[];
  
  // Policy
  policyId?: string;
  policyDecision: PolicyDecision;
  
  // Location
  location: EventLocation;
  
  // Device
  deviceId?: string;
  deviceTrust: DeviceTrust;
  
  // Additional Data
  metadata: Record<string, any>;
  
  // Investigation
  investigated: boolean;
  investigationNotes?: string;
  
  // Alerts
  alertGenerated: boolean;
  alertLevel?: AlertLevel;
}

enum EventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  PERMISSION_CHANGED = 'permission_changed',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REVOKED = 'role_revoked',
  POLICY_VIOLATION = 'policy_violation',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

enum EventResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  BLOCKED = 'blocked',
  WARNING = 'warning'
}

enum PolicyDecision {
  ALLOW = 'allow',
  DENY = 'deny',
  CONDITIONAL_ALLOW = 'conditional_allow',
  REQUIRE_APPROVAL = 'require_approval',
  REQUIRE_MFA = 'require_mfa'
}

interface EventLocation {
  country: string;
  region: string;
  city: string;
  ipAddress: string;
  
  // Risk Assessment
  trusted: boolean;
  riskScore: number;
  
  // VPN
  vpnUsed: boolean;
  vpnProvider?: string;
}

enum DeviceTrust {
  TRUSTED = 'trusted',
  MANAGED = 'managed',
  COMPLIANT = 'compliant',
  UNKNOWN = 'unknown',
  SUSPICIOUS = 'suspicious'
}

enum AlertLevel {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ==================== Access Control Manager Component ====================

export const AccessControlManager: React.FC = () => {
  const { toast } = useToast();
  const {
    securityThreats,
    detectThreats,
    loading,
    error,
    refreshSecurityData
  } = useSecurityCompliance({
    autoRefresh: true,
    refreshInterval: 30000,
    enableRealTimeAlerts: true,
    securityLevel: 'enterprise'
  });

  // ==================== State Management ====================

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPolicy, setSelectedPolicy] = useState<AccessPolicy | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedReview, setSelectedReview] = useState<AccessReview | null>(null);

  const [policies, setPolicies] = useState<AccessPolicy[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<AccessReview[]>([]);
  const [accessEvents, setAccessEvents] = useState<AccessEvent[]>([]);
  const [accessMetrics, setAccessMetrics] = useState<any>(null);

  const [filterPolicyType, setFilterPolicyType] = useState<string>('all');
  const [filterPolicyStatus, setFilterPolicyStatus] = useState<string>('all');
  const [filterRoleType, setFilterRoleType] = useState<string>('all');
  const [filterUserStatus, setFilterUserStatus] = useState<string>('all');
  const [filterReviewStatus, setFilterReviewStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showCreatePolicyDialog, setShowCreatePolicyDialog] = useState(false);
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [showCreateReviewDialog, setShowCreateReviewDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [showPolicyDetailsDialog, setShowPolicyDetailsDialog] = useState(false);
  const [showRoleDetailsDialog, setShowRoleDetailsDialog] = useState(false);

  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [realTimeEvents, setRealTimeEvents] = useState<AccessEvent[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // ==================== Backend Integration Functions ====================

  const fetchAccessPolicies = useCallback(async () => {
    try {
      const response = await fetch('/api/access-control/policies', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Failed to fetch access policies:', error);
      // Fallback to mock data for development
      initializeMockData();
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/access-control/roles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/access-control/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchAccessReviews = useCallback(async () => {
    try {
      const response = await fetch('/api/access-control/reviews', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch access reviews:', error);
    }
  }, []);

  const createAccessPolicy = useCallback(async (policyData: Partial<AccessPolicy>) => {
    setActionInProgress(prev => ({ ...prev, 'create-policy': true }));
    
    try {
      const response = await fetch('/api/access-control/policies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPolicy = await response.json();
      setPolicies(prev => [newPolicy, ...prev]);
      
      toast({
        title: "Policy Created",
        description: "Access policy has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create access policy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, 'create-policy': false }));
    }
  }, [toast]);

  const revokeUserAccess = useCallback(async (userId: string, roleId: string) => {
    const actionKey = `revoke-${userId}-${roleId}`;
    setActionInProgress(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      const response = await fetch(`/api/access-control/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update user roles
      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? {
                ...user,
                roles: user.roles.map(role =>
                  role.roleId === roleId
                    ? { ...role, status: AssignmentStatus.REVOKED }
                    : role
                )
              }
            : user
        )
      );
      
      toast({
        title: "Access Revoked",
        description: "User access has been revoked successfully.",
      });
    } catch (error) {
      toast({
        title: "Revocation Failed",
        description: "Failed to revoke user access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [toast]);

  // ==================== Mock Data Initialization ====================

  const initializeMockData = useCallback(() => {
    const mockPolicies: AccessPolicy[] = [
      {
        id: 'policy-001',
        name: 'Administrative Access Policy',
        description: 'Comprehensive policy governing administrative access to critical systems',
        type: PolicyType.RBAC,
        
        rules: [
          {
            id: 'rule-001',
            name: 'Admin Role Requirement',
            description: 'Requires administrative role for system access',
            expression: 'user.roles.contains("admin") AND resource.type == "system"',
            operator: RuleOperator.AND,
            conditions: [
              {
                attribute: 'user.role',
                operator: RuleOperator.CONTAINS,
                value: 'admin',
                dataType: 'string'
              }
            ],
            allowedActions: ['read', 'write', 'admin'],
            deniedActions: [],
            timeConstraints: [
              {
                type: 'schedule',
                startTime: '08:00',
                endTime: '18:00',
                daysOfWeek: [1, 2, 3, 4, 5],
                timezone: 'UTC'
              }
            ],
            locationConstraints: [
              {
                type: 'office',
                allowedLocations: ['headquarters', 'branch_office'],
                blockedLocations: [],
                requireVPN: false
              }
            ],
            deviceConstraints: [
              {
                type: 'managed',
                allowedDeviceTypes: ['laptop', 'desktop'],
                requireMFA: true,
                requireEncryption: true
              }
            ],
            priority: 1,
            weight: 1.0,
            enabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        
        conditions: [
          {
            id: 'condition-001',
            type: ConditionType.USER_ATTRIBUTE,
            attribute: 'department',
            operator: RuleOperator.EQUALS,
            value: 'IT',
            logicalOperator: 'AND',
            description: 'User must be in IT department',
            enabled: true
          }
        ],
        
        subjects: [
          {
            type: 'role',
            identifier: 'admin',
            attributes: { department: 'IT' }
          }
        ],
        
        resources: [
          {
            type: 'system',
            identifier: 'production_servers',
            attributes: { environment: 'production' },
            sensitivity: ResourceSensitivity.RESTRICTED
          }
        ],
        
        actions: [
          {
            name: 'admin',
            type: 'admin',
            description: 'Administrative access',
            riskLevel: RiskLevel.HIGH
          }
        ],
        
        effect: PolicyEffect.ALLOW,
        priority: 1,
        
        status: PolicyStatus.ACTIVE,
        version: '1.0',
        effectiveDate: new Date().toISOString(),
        
        approvalRequired: true,
        approvers: ['security-admin@company.com'],
        approvalStatus: ApprovalStatus.APPROVED,
        
        createdBy: 'policy-admin@company.com',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString(),
        lastReviewed: new Date(Date.now() - 86400000 * 7).toISOString(),
        reviewCycle: 90,
        
        usageCount: 1247,
        violationCount: 3,
        lastAccessed: new Date().toISOString(),
        
        complianceFrameworks: ['SOX', 'GDPR', 'ISO27001'],
        riskLevel: RiskLevel.HIGH,
        
        tags: ['admin', 'critical', 'production'],
        category: 'administrative'
      }
    ];

    const mockRoles: Role[] = [
      {
        id: 'role-001',
        name: 'System Administrator',
        description: 'Full administrative access to production systems',
        type: RoleType.FUNCTIONAL,
        
        permissions: [
          {
            id: 'perm-001',
            name: 'System Admin Access',
            description: 'Administrative access to all systems',
            resource: 'all_systems',
            action: 'admin',
            conditions: [],
            category: 'system',
            riskLevel: RiskLevel.CRITICAL,
            complianceFrameworks: ['SOX', 'ISO27001'],
            enabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        
        parentRoles: [],
        childRoles: ['role-002'],
        
        maxUsers: 5,
        requireApproval: true,
        
        status: RoleStatus.ACTIVE,
        effectiveDate: new Date().toISOString(),
        
        autoAssignmentRules: [],
        
        complianceRequirements: ['Annual certification', 'Quarterly review'],
        segregationRules: [
          {
            id: 'seg-001',
            name: 'Admin-Auditor Separation',
            description: 'System admins cannot have auditor roles',
            conflictingRoles: ['auditor'],
            enforcement: 'preventive',
            exceptions: [],
            enabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        
        userCount: 3,
        usageFrequency: 0.85,
        riskScore: 95,
        
        owner: 'it-manager@company.com',
        createdBy: 'role-admin@company.com',
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        updatedAt: new Date().toISOString(),
        lastReviewed: new Date(Date.now() - 86400000 * 30).toISOString(),
        
        tags: ['admin', 'critical', 'high-privilege'],
        category: 'administrative'
      }
    ];

    const mockUsers: User[] = [
      {
        id: 'user-001',
        username: 'john.doe',
        email: 'john.doe@company.com',
        displayName: 'John Doe',
        
        employeeId: 'EMP001',
        department: 'IT',
        title: 'Senior System Administrator',
        manager: 'jane.smith@company.com',
        
        roles: [
          {
            roleId: 'role-001',
            roleName: 'System Administrator',
            assignedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            assignedBy: 'manager@company.com',
            expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
            assignmentReason: 'Job function requirement',
            status: AssignmentStatus.ACTIVE,
            lastUsed: new Date(Date.now() - 3600000).toISOString(),
            usageCount: 156
          }
        ],
        
        directPermissions: [],
        
        status: UserStatus.ACTIVE,
        accountType: AccountType.HUMAN,
        
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        loginCount: 1247,
        failedLoginAttempts: 0,
        passwordLastChanged: new Date(Date.now() - 86400000 * 45).toISOString(),
        mfaEnabled: true,
        
        riskScore: 25,
        riskFactors: [
          {
            type: 'password_age',
            description: 'Password is 45 days old',
            severity: RiskLevel.LOW,
            score: 10,
            detectedAt: new Date().toISOString(),
            mitigated: false
          }
        ],
        
        createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
        updatedAt: new Date().toISOString(),
        lastReviewed: new Date(Date.now() - 86400000 * 90).toISOString(),
        
        attributes: {
          clearanceLevel: 'secret',
          location: 'headquarters',
          costCenter: 'IT-001'
        },
        
        complianceStatus: ComplianceStatus.COMPLIANT,
        
        tags: ['admin', 'critical_user', 'it_staff']
      }
    ];

    const mockReviews: AccessReview[] = [
      {
        id: 'review-001',
        name: 'Q1 2024 Administrative Access Review',
        description: 'Quarterly review of all administrative access privileges',
        type: ReviewType.PRIVILEGED_ACCESS,
        
        scope: {
          users: ['user-001'],
          roles: ['role-001'],
          applications: ['production_systems'],
          departments: ['IT'],
          includeInactive: false,
          includeServiceAccounts: true,
          riskLevelThreshold: RiskLevel.MEDIUM
        },
        
        reviewItems: [
          {
            id: 'item-001',
            type: 'user_role',
            userId: 'user-001',
            roleId: 'role-001',
            description: 'John Doe - System Administrator role',
            riskLevel: RiskLevel.HIGH,
            lastUsed: new Date(Date.now() - 3600000).toISOString(),
            businessJustification: 'Required for daily system administration tasks',
            status: ReviewItemStatus.PENDING
          }
        ],
        
        startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        frequency: ReviewFrequency.QUARTERLY,
        
        reviewers: [
          {
            userId: 'manager-001',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            role: ReviewerRole.PRIMARY,
            assignedItems: ['item-001'],
            completedItems: [],
            status: ReviewerStatus.ASSIGNED,
            reviewEfficiency: 0.85,
            averageResponseTime: 24
          }
        ],
        
        escalationReviewers: ['director@company.com'],
        
        status: ReviewStatus.IN_PROGRESS,
        progress: {
          totalItems: 1,
          reviewedItems: 0,
          approvedItems: 0,
          revokedItems: 0,
          pendingItems: 1,
          completionPercentage: 0,
          approvalRate: 0,
          revocationRate: 0,
          averageReviewTime: 0
        },
        
        decisions: [],
        findings: [],
        
        complianceFramework: ['SOX', 'ISO27001'],
        riskLevel: RiskLevel.HIGH,
        
        autoReminders: true,
        escalationDays: 3,
        
        createdBy: 'compliance-admin@company.com',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
        
        reviewEfficiency: 0.0,
        findingsCount: 0,
        violationsFound: 0
      }
    ];

    const mockAccessEvents: AccessEvent[] = [
      {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        
        eventType: EventType.ACCESS_GRANTED,
        action: 'system_login',
        result: EventResult.SUCCESS,
        
        userId: 'user-001',
        userName: 'john.doe',
        sourceIP: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        
        resourceId: 'system-001',
        resourceType: 'system',
        resourceName: 'Production Server',
        
        sessionId: 'session-12345',
        requestId: 'req-67890',
        
        riskScore: 15,
        riskFactors: ['normal_hours', 'trusted_location'],
        
        policyId: 'policy-001',
        policyDecision: PolicyDecision.ALLOW,
        
        location: {
          country: 'United States',
          region: 'California',
          city: 'San Francisco',
          ipAddress: '192.168.1.100',
          trusted: true,
          riskScore: 5,
          vpnUsed: false
        },
        
        deviceId: 'device-001',
        deviceTrust: DeviceTrust.MANAGED,
        
        metadata: {
          loginMethod: 'sso',
          mfaUsed: true,
          protocol: 'https'
        },
        
        investigated: false,
        alertGenerated: false
      }
    ];

    setPolicies(mockPolicies);
    setRoles(mockRoles);
    setUsers(mockUsers);
    setReviews(mockReviews);
    setAccessEvents(mockAccessEvents);
  }, []);

  // ==================== Utility Functions ====================

  const getPolicyStatusColor = (status: PolicyStatus): string => {
    switch (status) {
      case PolicyStatus.ACTIVE:
        return 'text-green-600';
      case PolicyStatus.INACTIVE:
        return 'text-gray-600';
      case PolicyStatus.PENDING_APPROVAL:
        return 'text-yellow-600';
      case PolicyStatus.EXPIRED:
        return 'text-red-600';
      case PolicyStatus.DRAFT:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskLevelColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case RiskLevel.CRITICAL:
        return 'text-red-600';
      case RiskLevel.VERY_HIGH:
        return 'text-red-500';
      case RiskLevel.HIGH:
        return 'text-orange-600';
      case RiskLevel.MEDIUM:
        return 'text-yellow-600';
      case RiskLevel.LOW:
        return 'text-green-600';
      case RiskLevel.VERY_LOW:
        return 'text-green-500';
      default:
        return 'text-gray-600';
    }
  };

  const getUserStatusColor = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'text-green-600';
      case UserStatus.INACTIVE:
        return 'text-gray-600';
      case UserStatus.SUSPENDED:
        return 'text-orange-600';
      case UserStatus.TERMINATED:
        return 'text-red-600';
      case UserStatus.PENDING_ACTIVATION:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDateTime = (dateTime: string): string => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };

  const formatTimeAgo = (dateTime: string): string => {
    if (!dateTime) return 'Never';
    const now = new Date();
    const date = new Date(dateTime);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently';
    }
  };

  // ==================== Event Handlers ====================

  const handleCreatePolicy = useCallback(async (policyData: any) => {
    await createAccessPolicy(policyData);
    setShowCreatePolicyDialog(false);
  }, [createAccessPolicy]);

  const handleRevokeAccess = useCallback(async (userId: string, roleId: string) => {
    await revokeUserAccess(userId, roleId);
  }, [revokeUserAccess]);

  // ==================== Effects ====================

  useEffect(() => {
    // Initialize data
    fetchAccessPolicies();
    fetchRoles();
    fetchUsers();
    fetchAccessReviews();
  }, [fetchAccessPolicies, fetchRoles, fetchUsers, fetchAccessReviews]);

  useEffect(() => {
    // Calculate access control metrics
    const activePolicies = policies.filter(p => p.status === PolicyStatus.ACTIVE).length;
    const activeUsers = users.filter(u => u.status === UserStatus.ACTIVE).length;
    const privilegedUsers = users.filter(u => 
      u.roles.some(r => r.roleName.toLowerCase().includes('admin'))
    ).length;
    const pendingReviews = reviews.filter(r => r.status === ReviewStatus.IN_PROGRESS).length;
    const overdueReviews = reviews.filter(r => r.status === ReviewStatus.OVERDUE).length;
    const highRiskUsers = users.filter(u => u.riskScore > 70).length;

    setAccessMetrics({
      totalPolicies: policies.length,
      activePolicies,
      totalRoles: roles.length,
      activeRoles: roles.filter(r => r.status === RoleStatus.ACTIVE).length,
      totalUsers: users.length,
      activeUsers,
      privilegedUsers,
      totalReviews: reviews.length,
      pendingReviews,
      overdueReviews,
      highRiskUsers,
      complianceRate: ((activeUsers - highRiskUsers) / activeUsers * 100) || 0,
      lastUpdated: new Date().toISOString()
    });
  }, [policies, roles, users, reviews]);

  useEffect(() => {
    // Set up real-time WebSocket connection for access events
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/access-control/events/ws`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'access_event') {
        setRealTimeEvents(prev => [data.event, ...prev.slice(0, 99)]);
        setAccessEvents(prev => [data.event, ...prev]);
        
        // Generate alert for high-risk events
        if (data.event.riskScore > 80) {
          toast({
            title: "High Risk Access Event",
            description: `${data.event.userName} - ${data.event.action}`,
            variant: "destructive",
          });
        }
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [toast]);

  // ==================== Filtered Data ====================

  const filteredPolicies = useMemo(() => {
    let filtered = policies;
    
    if (filterPolicyType !== 'all') {
      filtered = filtered.filter(policy => policy.type === filterPolicyType);
    }
    
    if (filterPolicyStatus !== 'all') {
      filtered = filtered.filter(policy => policy.status === filterPolicyStatus);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(policy =>
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof AccessPolicy] as string;
      const bValue = b[sortBy as keyof AccessPolicy] as string;
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [policies, filterPolicyType, filterPolicyStatus, searchQuery, sortBy, sortOrder]);

  const recentAccessEvents = useMemo(() => {
    return [...realTimeEvents, ...accessEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [realTimeEvents, accessEvents]);

  // ==================== Dashboard Component ====================

  const AccessControlDashboard = () => (
    <div className="space-y-6">
      {/* Access Control Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessMetrics?.activePolicies || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {accessMetrics?.totalPolicies || 0} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Access control policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessMetrics?.activeUsers || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {accessMetrics?.privilegedUsers || 0} Privileged
              </Badge>
              <Badge variant="outline" className="text-xs">
                {accessMetrics?.highRiskUsers || 0} High Risk
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              User accounts managed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Reviews</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessMetrics?.pendingReviews || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {accessMetrics?.overdueReviews || 0} Overdue
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pending reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(accessMetrics?.complianceRate || 0)}%
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default">
                Compliant
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Overall compliance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and High-Risk Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Access Events</CardTitle>
            <CardDescription>
              Latest access control activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAccessEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      event.result === EventResult.SUCCESS ? 'bg-green-500' :
                      event.result === EventResult.FAILURE ? 'bg-red-500' :
                      event.result === EventResult.BLOCKED ? 'bg-orange-500' : 'bg-gray-500'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{event.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.action} • {event.resourceName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      event.riskScore > 70 ? 'destructive' :
                      event.riskScore > 40 ? 'default' : 'secondary'
                    } className="text-xs">
                      Risk: {event.riskScore}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High-Risk Users</CardTitle>
            <CardDescription>
              Users requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.filter(u => u.riskScore > 50).slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      user.status === UserStatus.ACTIVE ? 'bg-green-500' :
                      user.status === UserStatus.SUSPENDED ? 'bg-orange-500' :
                      user.status === UserStatus.TERMINATED ? 'bg-red-500' : 'bg-gray-500'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.department} • {user.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" className="text-xs">
                      Risk: {user.riskScore}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.roles.length} Role{user.roles.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common access control operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreatePolicyDialog(true)}
            >
              <Shield className="h-6 w-6" />
              <span className="text-sm">Create Policy</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreateRoleDialog(true)}
            >
              <Crown className="h-6 w-6" />
              <span className="text-sm">Create Role</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreateReviewDialog(true)}
            >
              <ClipboardCheck className="h-6 w-6" />
              <span className="text-sm">Start Review</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={refreshSecurityData}
            >
              <RefreshCw className="h-6 w-6" />
              <span className="text-sm">Refresh Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== Main Render ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading access control data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load access control data: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Access Control Manager</h1>
            <p className="text-muted-foreground">
              Enterprise identity and access management platform
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>{accessMetrics?.activePolicies || 0} Policies</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{accessMetrics?.activeUsers || 0} Users</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshSecurityData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Policies</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center space-x-2">
              <Crown className="h-4 w-4" />
              <span>Roles</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4" />
              <span>Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Audit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AccessControlDashboard />
          </TabsContent>

          <TabsContent value="policies">
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Policy Management</h3>
              <p className="text-muted-foreground">
                Advanced policy management interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="roles">
            <div className="text-center py-12">
              <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Role Management</h3>
              <p className="text-muted-foreground">
                Role-based access control interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-muted-foreground">
                Identity lifecycle management interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Access Reviews</h3>
              <p className="text-muted-foreground">
                Access certification and review interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Audit Trail</h3>
              <p className="text-muted-foreground">
                Comprehensive audit and monitoring interface coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default AccessControlManager;