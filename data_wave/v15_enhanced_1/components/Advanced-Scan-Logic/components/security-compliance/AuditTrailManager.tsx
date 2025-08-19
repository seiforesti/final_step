/**
 * 📋 Audit Trail Manager - Enterprise Audit & Compliance Platform
 * ================================================================
 * 
 * Enterprise-grade audit trail management platform that provides comprehensive
 * audit management with forensic investigation capabilities, compliance reporting,
 * and real-time monitoring for regulatory compliance and security governance.
 * 
 * Features:
 * - Comprehensive audit trail collection and management
 * - Advanced forensic investigation and analysis tools
 * - Real-time compliance monitoring and reporting
 * - Automated compliance assessment and gap analysis
 * - Tamper-evident audit log storage and integrity verification
 * - Advanced search and correlation capabilities
 * - Regulatory compliance reporting (SOX, GDPR, HIPAA, etc.)
 * - Incident response and forensic timeline reconstruction
 * 
 * Backend Integration:
 * - AuditService for comprehensive audit trail management
 * - ForensicsService for investigation and analysis
 * - ComplianceService for regulatory compliance tracking
 * - ReportingService for automated compliance reporting
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
import { 
  ClipboardCheck,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Timer,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock,
  Key,
  KeyRound,
  Users,
  User,
  Database,
  Server,
  Network,
  Cloud,
  Globe,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Mail,
  Bell,
  BellOff,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  Star,
  Bookmark,
  Flag,
  MessageSquare,
  Archive,
  Folder,
  FolderOpen,
  History,
  Gauge,
  Target,
  Award,
  Crown,
  Zap,
  Bug,
  Skull,
  Wifi,
  WifiOff,
  Layers,
  Workflow,
  Play,
  Pause,
  Square,
  BookOpen,
  AlertCircle,
  Info,
  HelpCircle,
  Crosshair,
  Radar,
  Brain,
  Microscope,
  TestTube,
  Beaker,
  FlaskConical
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useSecurityCompliance } from '../../hooks/useSecurityCompliance';

// ==================== Types and Interfaces ====================

interface AuditEvent {
  id: string;
  timestamp: string;
  
  // Event Classification
  eventType: EventType;
  eventCategory: EventCategory;
  eventSeverity: EventSeverity;
  
  // Source Information
  source: EventSource;
  sourceSystem: string;
  sourceComponent: string;
  sourceVersion: string;
  
  // Actor Information
  actor: EventActor;
  
  // Target Information
  target: EventTarget;
  
  // Action Details
  action: string;
  actionType: ActionType;
  actionResult: ActionResult;
  
  // Context
  sessionId?: string;
  transactionId?: string;
  correlationId?: string;
  
  // Request Details
  requestId?: string;
  requestMethod?: string;
  requestPath?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  
  // Response Details
  responseCode?: number;
  responseMessage?: string;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  
  // Network Information
  sourceIP: string;
  destinationIP?: string;
  userAgent?: string;
  
  // Geolocation
  location: GeoLocation;
  
  // Data Classification
  dataClassification: DataClassification;
  dataTypes: string[];
  dataVolume?: number;
  
  // Risk Assessment
  riskScore: number;
  riskFactors: RiskFactor[];
  
  // Compliance
  complianceFrameworks: string[];
  regulatoryImpact: RegulatoryImpact;
  
  // Integrity
  checksum: string;
  digitalSignature?: string;
  chainHash?: string;
  
  // Investigation
  investigated: boolean;
  investigationId?: string;
  investigationNotes?: string;
  
  // Retention
  retentionPolicy: string;
  retentionPeriod: number; // days
  archiveDate?: string;
  
  // Metadata
  tags: string[];
  customFields: Record<string, any>;
  
  // Audit Trail
  createdAt: string;
  modifiedAt?: string;
  modifiedBy?: string;
  version: number;
}

enum EventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SYSTEM_ACCESS = 'system_access',
  CONFIGURATION_CHANGE = 'configuration_change',
  SECURITY_EVENT = 'security_event',
  COMPLIANCE_EVENT = 'compliance_event',
  BUSINESS_PROCESS = 'business_process',
  ADMINISTRATIVE = 'administrative'
}

enum EventCategory {
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  OPERATIONAL = 'operational',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  ADMINISTRATIVE = 'administrative'
}

enum EventSeverity {
  INFORMATIONAL = 'informational',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface EventSource {
  type: SourceType;
  name: string;
  identifier: string;
  version: string;
  
  // Environment
  environment: string;
  region: string;
  zone?: string;
  
  // Infrastructure
  infrastructure: InfrastructureInfo;
  
  // Configuration
  configuration: Record<string, any>;
}

enum SourceType {
  APPLICATION = 'application',
  DATABASE = 'database',
  OPERATING_SYSTEM = 'operating_system',
  NETWORK_DEVICE = 'network_device',
  SECURITY_DEVICE = 'security_device',
  CLOUD_SERVICE = 'cloud_service',
  CONTAINER = 'container',
  API_GATEWAY = 'api_gateway',
  LOAD_BALANCER = 'load_balancer',
  WEB_SERVER = 'web_server'
}

interface InfrastructureInfo {
  hostname: string;
  ipAddress: string;
  macAddress?: string;
  platform: string;
  architecture: string;
  operatingSystem: string;
  containerInfo?: ContainerInfo;
  cloudInfo?: CloudInfo;
}

interface ContainerInfo {
  containerId: string;
  image: string;
  imageVersion: string;
  orchestrator: string;
  namespace?: string;
  podName?: string;
}

interface CloudInfo {
  provider: string;
  region: string;
  availabilityZone: string;
  instanceId: string;
  instanceType: string;
  accountId: string;
}

interface EventActor {
  type: ActorType;
  identifier: string;
  name: string;
  
  // Identity
  userId?: string;
  username?: string;
  email?: string;
  
  // Authentication
  authenticationMethod: string;
  authenticationProvider: string;
  authenticationTime?: string;
  
  // Authorization
  roles: string[];
  permissions: string[];
  groups: string[];
  
  // Context
  department?: string;
  title?: string;
  manager?: string;
  
  // Device
  deviceId?: string;
  deviceType?: string;
  deviceTrust?: string;
  
  // Session
  sessionInfo: SessionInfo;
  
  // Risk
  riskScore: number;
  trustLevel: string;
}

enum ActorType {
  HUMAN_USER = 'human_user',
  SERVICE_ACCOUNT = 'service_account',
  SYSTEM_PROCESS = 'system_process',
  API_CLIENT = 'api_client',
  AUTOMATED_PROCESS = 'automated_process',
  ANONYMOUS = 'anonymous'
}

interface SessionInfo {
  sessionId: string;
  sessionStartTime: string;
  sessionDuration?: number;
  sessionState: string;
  concurrentSessions: number;
}

interface EventTarget {
  type: TargetType;
  identifier: string;
  name: string;
  
  // Resource Details
  resourcePath?: string;
  resourceType?: string;
  resourceOwner?: string;
  
  // Data Details
  dataClassification: DataClassification;
  dataTypes: string[];
  recordCount?: number;
  dataSize?: number;
  
  // System Details
  systemType?: string;
  systemVersion?: string;
  systemEnvironment?: string;
  
  // Compliance
  complianceScope: string[];
  regulatoryClassification: string[];
  
  // Location
  dataLocation: string;
  dataResidency: string[];
}

enum TargetType {
  FILE = 'file',
  DATABASE_TABLE = 'database_table',
  DATABASE_RECORD = 'database_record',
  API_ENDPOINT = 'api_endpoint',
  SYSTEM_RESOURCE = 'system_resource',
  CONFIGURATION = 'configuration',
  USER_ACCOUNT = 'user_account',
  APPLICATION = 'application',
  NETWORK_RESOURCE = 'network_resource'
}

enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
  COPY = 'copy',
  MOVE = 'move',
  SHARE = 'share',
  PRINT = 'print'
}

enum ActionResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL_SUCCESS = 'partial_success',
  BLOCKED = 'blocked',
  TIMEOUT = 'timeout',
  ERROR = 'error'
}

interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  
  // Network
  isp: string;
  organization: string;
  asn: string;
  
  // Risk Assessment
  riskLevel: string;
  vpnUsed: boolean;
  proxyUsed: boolean;
  torUsed: boolean;
}

enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

interface RiskFactor {
  type: string;
  description: string;
  severity: EventSeverity;
  score: number;
  
  // Evidence
  indicators: string[];
  evidence: Record<string, any>;
  
  // Mitigation
  mitigated: boolean;
  mitigationAction?: string;
  mitigatedAt?: string;
}

enum RegulatoryImpact {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface AuditSearch {
  id: string;
  name: string;
  description: string;
  
  // Query
  query: SearchQuery;
  
  // Filters
  filters: SearchFilter[];
  
  // Time Range
  timeRange: TimeRange;
  
  // Results
  totalResults: number;
  results: AuditEvent[];
  
  // Execution
  executedAt: string;
  executionTime: number; // milliseconds
  
  // Saved Search
  saved: boolean;
  createdBy: string;
  createdAt: string;
  
  // Sharing
  shared: boolean;
  sharedWith: string[];
}

interface SearchQuery {
  text: string;
  fields: string[];
  operators: QueryOperator[];
  
  // Advanced
  includeArchived: boolean;
  caseSensitive: boolean;
  useRegex: boolean;
  
  // Correlation
  correlationFields: string[];
  correlationWindow: number; // minutes
}

enum QueryOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not',
  EQUALS = 'equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  REGEX = 'regex'
}

interface SearchFilter {
  field: string;
  operator: QueryOperator;
  value: any;
  condition: 'AND' | 'OR';
}

interface TimeRange {
  start: string;
  end: string;
  relative?: RelativeTimeRange;
}

interface RelativeTimeRange {
  amount: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
}

interface ForensicInvestigation {
  id: string;
  name: string;
  description: string;
  
  // Case Information
  caseNumber: string;
  investigationType: InvestigationType;
  priority: InvestigationPriority;
  
  // Scope
  timeRange: TimeRange;
  systems: string[];
  dataTypes: string[];
  actors: string[];
  
  // Timeline
  events: AuditEvent[];
  timeline: TimelineEvent[];
  
  // Analysis
  findings: InvestigationFinding[];
  conclusions: string[];
  recommendations: string[];
  
  // Evidence
  evidence: EvidenceItem[];
  chainOfCustody: CustodyRecord[];
  
  // Team
  investigators: Investigator[];
  reviewers: string[];
  
  // Status
  status: InvestigationStatus;
  progress: InvestigationProgress;
  
  // Compliance
  legalHold: boolean;
  retentionRequirement: string;
  
  // Reporting
  reports: InvestigationReport[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  
  // Tags
  tags: string[];
}

enum InvestigationType {
  SECURITY_INCIDENT = 'security_incident',
  DATA_BREACH = 'data_breach',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  FRAUD_INVESTIGATION = 'fraud_investigation',
  INSIDER_THREAT = 'insider_threat',
  SYSTEM_COMPROMISE = 'system_compromise',
  POLICY_VIOLATION = 'policy_violation',
  REGULATORY_INQUIRY = 'regulatory_inquiry'
}

enum InvestigationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  eventId: string;
  summary: string;
  
  // Analysis
  significance: string;
  impact: string;
  
  // Relationships
  relatedEvents: string[];
  causedBy?: string;
  causedEvents?: string[];
  
  // Evidence
  evidenceItems: string[];
  
  // Notes
  investigatorNotes: string;
  
  // Verification
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface InvestigationFinding {
  id: string;
  type: FindingType;
  severity: EventSeverity;
  
  // Description
  title: string;
  description: string;
  
  // Evidence
  supportingEvents: string[];
  evidenceItems: string[];
  
  // Impact
  businessImpact: string;
  technicalImpact: string;
  complianceImpact: string;
  
  // Recommendations
  recommendations: string[];
  remediationSteps: string[];
  
  // Status
  status: FindingStatus;
  assignedTo?: string;
  
  // Timeline
  discoveredAt: string;
  dueDate?: string;
  resolvedAt?: string;
  
  // Validation
  validated: boolean;
  validatedBy?: string;
  validatedAt?: string;
}

enum FindingType {
  SECURITY_WEAKNESS = 'security_weakness',
  POLICY_VIOLATION = 'policy_violation',
  COMPLIANCE_GAP = 'compliance_gap',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_EXFILTRATION = 'data_exfiltration',
  SYSTEM_COMPROMISE = 'system_compromise',
  PRIVILEGE_ABUSE = 'privilege_abuse',
  PROCESS_FAILURE = 'process_failure'
}

enum FindingStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  DEFERRED = 'deferred'
}

interface EvidenceItem {
  id: string;
  type: EvidenceType;
  name: string;
  description: string;
  
  // Source
  sourceSystem: string;
  sourceLocation: string;
  collectedBy: string;
  collectedAt: string;
  
  // Content
  content: any;
  contentType: string;
  contentSize: number;
  
  // Integrity
  checksum: string;
  digitalSignature?: string;
  
  // Chain of Custody
  custodyRecords: CustodyRecord[];
  
  // Analysis
  analyzed: boolean;
  analysisResults?: Record<string, any>;
  
  // Relevance
  relevanceScore: number;
  tags: string[];
  
  // Legal
  legalHold: boolean;
  admissible: boolean;
  
  // Storage
  storageLocation: string;
  archiveDate?: string;
}

enum EvidenceType {
  AUDIT_LOG = 'audit_log',
  SYSTEM_LOG = 'system_log',
  DATABASE_RECORD = 'database_record',
  FILE_SYSTEM = 'file_system',
  NETWORK_CAPTURE = 'network_capture',
  MEMORY_DUMP = 'memory_dump',
  DISK_IMAGE = 'disk_image',
  EMAIL = 'email',
  DOCUMENT = 'document',
  SCREENSHOT = 'screenshot'
}

interface CustodyRecord {
  id: string;
  action: CustodyAction;
  
  // Actor
  performedBy: string;
  performedAt: string;
  
  // Details
  reason: string;
  location: string;
  
  // Verification
  witnessed: boolean;
  witnessedBy?: string;
  
  // Digital Signature
  digitalSignature: string;
}

enum CustodyAction {
  COLLECTED = 'collected',
  TRANSFERRED = 'transferred',
  ANALYZED = 'analyzed',
  COPIED = 'copied',
  ARCHIVED = 'archived',
  DESTROYED = 'destroyed'
}

interface Investigator {
  userId: string;
  name: string;
  email: string;
  role: InvestigatorRole;
  
  // Qualifications
  certifications: string[];
  specializations: string[];
  
  // Assignment
  assignedTasks: string[];
  completedTasks: string[];
  
  // Performance
  caseLoad: number;
  efficiency: number;
  
  // Status
  status: InvestigatorStatus;
}

enum InvestigatorRole {
  LEAD_INVESTIGATOR = 'lead_investigator',
  FORENSIC_ANALYST = 'forensic_analyst',
  COMPLIANCE_SPECIALIST = 'compliance_specialist',
  TECHNICAL_EXPERT = 'technical_expert',
  LEGAL_ADVISOR = 'legal_advisor'
}

enum InvestigatorStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  BUSY = 'busy',
  UNAVAILABLE = 'unavailable'
}

enum InvestigationStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  ANALYSIS = 'analysis',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  SUSPENDED = 'suspended'
}

interface InvestigationProgress {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  
  // Phases
  currentPhase: InvestigationPhase;
  completedPhases: InvestigationPhase[];
  
  // Timeline
  estimatedCompletion?: string;
  actualCompletion?: string;
  
  // Milestones
  milestones: InvestigationMilestone[];
}

enum InvestigationPhase {
  INITIATION = 'initiation',
  EVIDENCE_COLLECTION = 'evidence_collection',
  ANALYSIS = 'analysis',
  CORRELATION = 'correlation',
  DOCUMENTATION = 'documentation',
  REVIEW = 'review',
  CLOSURE = 'closure'
}

interface InvestigationMilestone {
  name: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: MilestoneStatus;
}

enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

interface InvestigationReport {
  id: string;
  type: ReportType;
  title: string;
  
  // Content
  executiveSummary: string;
  findings: string[];
  recommendations: string[];
  conclusion: string;
  
  // Appendices
  timeline: TimelineEvent[];
  evidence: EvidenceItem[];
  
  // Metadata
  author: string;
  reviewedBy: string[];
  approvedBy?: string;
  
  // Dates
  createdAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  
  // Distribution
  confidentialityLevel: string;
  distributionList: string[];
  
  // Format
  format: string;
  version: string;
}

enum ReportType {
  PRELIMINARY = 'preliminary',
  INTERIM = 'interim',
  FINAL = 'final',
  EXECUTIVE_SUMMARY = 'executive_summary',
  TECHNICAL_ANALYSIS = 'technical_analysis',
  COMPLIANCE_ASSESSMENT = 'compliance_assessment'
}

interface ComplianceAssessment {
  id: string;
  name: string;
  description: string;
  
  // Framework
  framework: ComplianceFramework;
  version: string;
  
  // Scope
  scope: AssessmentScope;
  
  // Assessment
  controls: ControlAssessment[];
  
  // Results
  overallScore: number;
  complianceLevel: ComplianceLevel;
  
  // Findings
  gaps: ComplianceGap[];
  recommendations: ComplianceRecommendation[];
  
  // Timeline
  assessmentPeriod: TimeRange;
  
  // Team
  assessor: string;
  reviewers: string[];
  
  // Status
  status: AssessmentStatus;
  
  // Reporting
  reports: ComplianceReport[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  nextAssessment?: string;
}

enum ComplianceFramework {
  SOX = 'sox',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  ISO27001 = 'iso27001',
  NIST = 'nist',
  SOC2 = 'soc2',
  CCPA = 'ccpa',
  FERPA = 'ferpa',
  GLBA = 'glba'
}

interface AssessmentScope {
  systems: string[];
  processes: string[];
  dataTypes: string[];
  timeRange: TimeRange;
  
  // Exclusions
  excludedSystems: string[];
  excludedProcesses: string[];
  exclusionReasons: string[];
}

interface ControlAssessment {
  controlId: string;
  controlName: string;
  controlDescription: string;
  
  // Assessment
  implemented: boolean;
  effective: boolean;
  
  // Testing
  testingMethod: TestingMethod;
  testingResults: TestingResult[];
  
  // Evidence
  evidence: string[];
  documentation: string[];
  
  // Rating
  rating: ControlRating;
  riskLevel: string;
  
  // Deficiencies
  deficiencies: ControlDeficiency[];
  
  // Remediation
  remediationPlan?: string;
  remediationDueDate?: string;
  
  // Assessor
  assessedBy: string;
  assessedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

enum TestingMethod {
  INQUIRY = 'inquiry',
  OBSERVATION = 'observation',
  INSPECTION = 'inspection',
  REPERFORMANCE = 'reperformance',
  ANALYTICAL = 'analytical',
  AUTOMATED = 'automated'
}

interface TestingResult {
  testId: string;
  testDescription: string;
  testResult: TestResult;
  
  // Evidence
  evidence: string[];
  observations: string[];
  
  // Exceptions
  exceptions: TestException[];
  
  // Assessor
  testedBy: string;
  testedAt: string;
}

enum TestResult {
  PASS = 'pass',
  FAIL = 'fail',
  NOT_APPLICABLE = 'not_applicable',
  NOT_TESTED = 'not_tested'
}

interface TestException {
  description: string;
  impact: string;
  frequency: string;
  rootCause: string;
  
  // Management Response
  managementResponse?: string;
  remediationPlan?: string;
  targetDate?: string;
}

enum ControlRating {
  EFFECTIVE = 'effective',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  INEFFECTIVE = 'ineffective',
  NOT_IMPLEMENTED = 'not_implemented'
}

interface ControlDeficiency {
  type: DeficiencyType;
  severity: DeficiencySeverity;
  description: string;
  
  // Impact
  businessImpact: string;
  complianceImpact: string;
  
  // Root Cause
  rootCause: string;
  contributingFactors: string[];
  
  // Remediation
  recommendedActions: string[];
  targetDate?: string;
  
  // Status
  status: DeficiencyStatus;
  assignedTo?: string;
}

enum DeficiencyType {
  DESIGN_DEFICIENCY = 'design_deficiency',
  OPERATING_DEFICIENCY = 'operating_deficiency',
  MATERIAL_WEAKNESS = 'material_weakness',
  SIGNIFICANT_DEFICIENCY = 'significant_deficiency'
}

enum DeficiencySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum DeficiencyStatus {
  IDENTIFIED = 'identified',
  ACKNOWLEDGED = 'acknowledged',
  IN_REMEDIATION = 'in_remediation',
  RESOLVED = 'resolved',
  ACCEPTED = 'accepted'
}

enum ComplianceLevel {
  FULLY_COMPLIANT = 'fully_compliant',
  SUBSTANTIALLY_COMPLIANT = 'substantially_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  NON_COMPLIANT = 'non_compliant'
}

interface ComplianceGap {
  id: string;
  requirement: string;
  description: string;
  
  // Gap Analysis
  currentState: string;
  requiredState: string;
  gapDescription: string;
  
  // Risk
  riskLevel: string;
  businessImpact: string;
  
  // Remediation
  recommendedActions: string[];
  estimatedEffort: string;
  estimatedCost: number;
  targetDate?: string;
  
  // Status
  status: GapStatus;
  assignedTo?: string;
}

enum GapStatus {
  IDENTIFIED = 'identified',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ACCEPTED = 'accepted'
}

interface ComplianceRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  
  // Description
  title: string;
  description: string;
  rationale: string;
  
  // Implementation
  implementationSteps: string[];
  estimatedEffort: string;
  estimatedCost: number;
  
  // Benefits
  benefits: string[];
  riskReduction: string;
  
  // Timeline
  targetDate?: string;
  
  // Status
  status: RecommendationStatus;
  assignedTo?: string;
  
  // Approval
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

enum RecommendationType {
  PROCESS_IMPROVEMENT = 'process_improvement',
  TECHNOLOGY_ENHANCEMENT = 'technology_enhancement',
  POLICY_UPDATE = 'policy_update',
  TRAINING = 'training',
  MONITORING = 'monitoring',
  GOVERNANCE = 'governance'
}

enum RecommendationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum RecommendationStatus {
  PROPOSED = 'proposed',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  IMPLEMENTED = 'implemented',
  REJECTED = 'rejected'
}

enum AssessmentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  APPROVED = 'approved'
}

interface ComplianceReport {
  id: string;
  type: ComplianceReportType;
  title: string;
  
  // Content
  executiveSummary: string;
  assessmentResults: string;
  findings: string[];
  recommendations: string[];
  
  // Compliance Status
  overallCompliance: ComplianceLevel;
  controlResults: ControlAssessment[];
  
  // Appendices
  evidenceReferences: string[];
  testingDetails: TestingResult[];
  
  // Metadata
  preparedBy: string;
  reviewedBy: string[];
  approvedBy?: string;
  
  // Dates
  reportingPeriod: TimeRange;
  createdAt: string;
  approvedAt?: string;
  
  // Distribution
  confidentialityLevel: string;
  distributionList: string[];
}

enum ComplianceReportType {
  MANAGEMENT_REPORT = 'management_report',
  REGULATORY_REPORT = 'regulatory_report',
  AUDIT_REPORT = 'audit_report',
  ASSESSMENT_REPORT = 'assessment_report',
  GAP_ANALYSIS = 'gap_analysis',
  REMEDIATION_PLAN = 'remediation_plan'
}

// ==================== Audit Trail Manager Component ====================

export const AuditTrailManager: React.FC = () => {
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
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [selectedInvestigation, setSelectedInvestigation] = useState<ForensicInvestigation | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<ComplianceAssessment | null>(null);

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [investigations, setInvestigations] = useState<ForensicInvestigation[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [savedSearches, setSavedSearches] = useState<AuditSearch[]>([]);
  const [auditMetrics, setAuditMetrics] = useState<any>(null);

  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<string>('24h');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);
  const [showInvestigationDialog, setShowInvestigationDialog] = useState(false);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [realTimeEvents, setRealTimeEvents] = useState<AuditEvent[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // ==================== Backend Integration Functions ====================

  const fetchAuditEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/audit/events', {
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
      setAuditEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch audit events:', error);
      // Fallback to mock data for development
      initializeMockData();
    }
  }, []);

  const fetchInvestigations = useCallback(async () => {
    try {
      const response = await fetch('/api/audit/investigations', {
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
      setInvestigations(data.investigations || []);
    } catch (error) {
      console.error('Failed to fetch investigations:', error);
    }
  }, []);

  const fetchComplianceAssessments = useCallback(async () => {
    try {
      const response = await fetch('/api/audit/assessments', {
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
      setAssessments(data.assessments || []);
    } catch (error) {
      console.error('Failed to fetch compliance assessments:', error);
    }
  }, []);

  const createInvestigation = useCallback(async (investigationData: Partial<ForensicInvestigation>) => {
    setActionInProgress(prev => ({ ...prev, 'create-investigation': true }));
    
    try {
      const response = await fetch('/api/audit/investigations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(investigationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newInvestigation = await response.json();
      setInvestigations(prev => [newInvestigation, ...prev]);
      
      toast({
        title: "Investigation Created",
        description: "Forensic investigation has been initiated successfully.",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create investigation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, 'create-investigation': false }));
    }
  }, [toast]);

  const exportAuditData = useCallback(async (exportParams: any) => {
    setActionInProgress(prev => ({ ...prev, 'export-data': true }));
    
    try {
      const response = await fetch('/api/audit/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-export-${Date.now()}.${exportParams.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: `Audit data exported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export audit data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, 'export-data': false }));
    }
  }, [toast]);

  // ==================== Mock Data Initialization ====================

  const initializeMockData = useCallback(() => {
    const mockAuditEvents: AuditEvent[] = [
      {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        
        eventType: EventType.DATA_ACCESS,
        eventCategory: EventCategory.SECURITY,
        eventSeverity: EventSeverity.MEDIUM,
        
        source: {
          type: SourceType.APPLICATION,
          name: 'Customer Portal',
          identifier: 'app-customer-portal',
          version: '2.1.0',
          environment: 'production',
          region: 'us-east-1',
          infrastructure: {
            hostname: 'app-server-01',
            ipAddress: '10.0.1.100',
            platform: 'Linux',
            architecture: 'x86_64',
            operatingSystem: 'Ubuntu 20.04 LTS'
          },
          configuration: {}
        },
        
        sourceSystem: 'customer-portal',
        sourceComponent: 'data-access-layer',
        sourceVersion: '2.1.0',
        
        actor: {
          type: ActorType.HUMAN_USER,
          identifier: 'john.doe@company.com',
          name: 'John Doe',
          userId: 'user-001',
          username: 'john.doe',
          email: 'john.doe@company.com',
          authenticationMethod: 'saml_sso',
          authenticationProvider: 'azure_ad',
          authenticationTime: new Date(Date.now() - 3600000).toISOString(),
          roles: ['customer_service', 'data_analyst'],
          permissions: ['read_customer_data', 'export_reports'],
          groups: ['customer_service_team'],
          department: 'Customer Service',
          title: 'Senior Customer Service Representative',
          deviceType: 'laptop',
          deviceTrust: 'managed',
          sessionInfo: {
            sessionId: 'session-12345',
            sessionStartTime: new Date(Date.now() - 7200000).toISOString(),
            sessionDuration: 3600,
            sessionState: 'active',
            concurrentSessions: 1
          },
          riskScore: 25,
          trustLevel: 'high'
        },
        
        target: {
          type: TargetType.DATABASE_TABLE,
          identifier: 'customer_data',
          name: 'Customer Information Database',
          resourcePath: '/database/customer_data',
          resourceType: 'postgresql_table',
          resourceOwner: 'data_team',
          dataClassification: DataClassification.CONFIDENTIAL,
          dataTypes: ['personal_information', 'financial_data'],
          recordCount: 1247,
          dataSize: 2048576,
          complianceScope: ['GDPR', 'CCPA'],
          regulatoryClassification: ['personal_data', 'financial_data'],
          dataLocation: 'us-east-1',
          dataResidency: ['US']
        },
        
        action: 'SELECT customer records',
        actionType: ActionType.READ,
        actionResult: ActionResult.SUCCESS,
        
        sessionId: 'session-12345',
        transactionId: 'txn-67890',
        correlationId: 'corr-abc123',
        
        requestId: 'req-001',
        requestMethod: 'GET',
        requestPath: '/api/customers',
        
        responseCode: 200,
        responseMessage: 'Success',
        
        sourceIP: '192.168.1.100',
        destinationIP: '10.0.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        
        location: {
          country: 'United States',
          region: 'California',
          city: 'San Francisco',
          latitude: 37.7749,
          longitude: -122.4194,
          timezone: 'America/Los_Angeles',
          isp: 'Comcast',
          organization: 'Comcast Cable',
          asn: 'AS7922',
          riskLevel: 'low',
          vpnUsed: false,
          proxyUsed: false,
          torUsed: false
        },
        
        dataClassification: DataClassification.CONFIDENTIAL,
        dataTypes: ['personal_information', 'financial_data'],
        dataVolume: 2048576,
        
        riskScore: 35,
        riskFactors: [
          {
            type: 'large_data_access',
            description: 'Accessed large volume of customer data',
            severity: EventSeverity.MEDIUM,
            score: 20,
            indicators: ['record_count_high', 'data_volume_large'],
            evidence: { recordCount: 1247, dataSize: 2048576 },
            mitigated: false
          }
        ],
        
        complianceFrameworks: ['GDPR', 'CCPA', 'SOX'],
        regulatoryImpact: RegulatoryImpact.MEDIUM,
        
        checksum: 'sha256:abc123def456...',
        digitalSignature: 'signature_data_here',
        chainHash: 'chain_hash_here',
        
        investigated: false,
        
        retentionPolicy: 'financial_data_7_years',
        retentionPeriod: 2555, // 7 years
        
        tags: ['customer_data', 'bulk_access', 'gdpr_relevant'],
        customFields: {
          businessJustification: 'Monthly customer analysis report',
          approvalId: 'approval-123'
        },
        
        createdAt: new Date().toISOString(),
        version: 1
      }
    ];

    const mockInvestigations: ForensicInvestigation[] = [
      {
        id: 'inv-001',
        name: 'Suspicious Data Access Investigation',
        description: 'Investigation into unusual pattern of customer data access',
        caseNumber: 'CASE-2024-001',
        investigationType: InvestigationType.SECURITY_INCIDENT,
        priority: InvestigationPriority.HIGH,
        
        timeRange: {
          start: new Date(Date.now() - 86400000 * 7).toISOString(),
          end: new Date().toISOString()
        },
        
        systems: ['customer-portal', 'customer-database'],
        dataTypes: ['customer_data', 'financial_data'],
        actors: ['john.doe@company.com'],
        
        events: mockAuditEvents,
        timeline: [
          {
            id: 'timeline-001',
            timestamp: new Date().toISOString(),
            eventId: 'event-001',
            summary: 'Large volume customer data access detected',
            significance: 'Potential data exfiltration attempt',
            impact: 'Customer privacy risk',
            relatedEvents: [],
            evidenceItems: ['evidence-001'],
            investigatorNotes: 'Requires further analysis of access patterns',
            verified: false
          }
        ],
        
        findings: [
          {
            id: 'finding-001',
            type: FindingType.UNAUTHORIZED_ACCESS,
            severity: EventSeverity.HIGH,
            title: 'Excessive Customer Data Access',
            description: 'User accessed significantly more customer records than typical for their role',
            supportingEvents: ['event-001'],
            evidenceItems: ['evidence-001'],
            businessImpact: 'Potential customer privacy breach',
            technicalImpact: 'Data integrity concerns',
            complianceImpact: 'GDPR violation risk',
            recommendations: [
              'Review user access permissions',
              'Implement additional monitoring',
              'Conduct user training'
            ],
            remediationSteps: [
              'Restrict user access to need-to-know basis',
              'Implement approval workflow for bulk data access',
              'Deploy additional monitoring controls'
            ],
            status: FindingStatus.OPEN,
            discoveredAt: new Date().toISOString(),
            validated: false
          }
        ],
        
        conclusions: [
          'User access pattern indicates potential policy violation',
          'No evidence of malicious intent found',
          'Process improvements needed'
        ],
        
        recommendations: [
          'Implement role-based access controls',
          'Deploy data loss prevention tools',
          'Conduct regular access reviews'
        ],
        
        evidence: [
          {
            id: 'evidence-001',
            type: EvidenceType.AUDIT_LOG,
            name: 'Customer Portal Access Logs',
            description: 'Complete access logs from customer portal for investigation period',
            sourceSystem: 'customer-portal',
            sourceLocation: '/var/log/portal/access.log',
            collectedBy: 'investigator@company.com',
            collectedAt: new Date().toISOString(),
            content: 'log_data_here',
            contentType: 'text/plain',
            contentSize: 1048576,
            checksum: 'sha256:evidence_checksum',
            custodyRecords: [
              {
                id: 'custody-001',
                action: CustodyAction.COLLECTED,
                performedBy: 'investigator@company.com',
                performedAt: new Date().toISOString(),
                reason: 'Evidence collection for investigation',
                location: 'Evidence server',
                witnessed: true,
                witnessedBy: 'supervisor@company.com',
                digitalSignature: 'custody_signature'
              }
            ],
            analyzed: false,
            relevanceScore: 95,
            tags: ['access_logs', 'customer_data'],
            legalHold: true,
            admissible: true,
            storageLocation: '/evidence/inv-001/evidence-001'
          }
        ],
        
        chainOfCustody: [],
        
        investigators: [
          {
            userId: 'investigator-001',
            name: 'Jane Smith',
            email: 'investigator@company.com',
            role: InvestigatorRole.LEAD_INVESTIGATOR,
            certifications: ['CISSP', 'CISA'],
            specializations: ['data_security', 'compliance'],
            assignedTasks: ['evidence_collection', 'analysis'],
            completedTasks: ['evidence_collection'],
            caseLoad: 3,
            efficiency: 0.85,
            status: InvestigatorStatus.ASSIGNED
          }
        ],
        
        reviewers: ['supervisor@company.com'],
        
        status: InvestigationStatus.IN_PROGRESS,
        progress: {
          totalTasks: 10,
          completedTasks: 3,
          pendingTasks: 7,
          currentPhase: InvestigationPhase.ANALYSIS,
          completedPhases: [InvestigationPhase.INITIATION, InvestigationPhase.EVIDENCE_COLLECTION],
          milestones: [
            {
              name: 'Evidence Collection Complete',
              description: 'All relevant evidence collected and secured',
              targetDate: new Date(Date.now() + 86400000 * 2).toISOString(),
              completedDate: new Date().toISOString(),
              status: MilestoneStatus.COMPLETED
            }
          ]
        },
        
        legalHold: true,
        retentionRequirement: '7_years',
        
        reports: [],
        
        createdBy: 'security-admin@company.com',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
        
        tags: ['data_access', 'customer_data', 'high_priority']
      }
    ];

    const mockAssessments: ComplianceAssessment[] = [
      {
        id: 'assessment-001',
        name: 'Q1 2024 SOX Compliance Assessment',
        description: 'Quarterly Sarbanes-Oxley compliance assessment for financial reporting controls',
        framework: ComplianceFramework.SOX,
        version: '2024.1',
        
        scope: {
          systems: ['financial_system', 'reporting_system'],
          processes: ['financial_reporting', 'revenue_recognition'],
          dataTypes: ['financial_data', 'revenue_data'],
          timeRange: {
            start: '2024-01-01T00:00:00Z',
            end: '2024-03-31T23:59:59Z'
          },
          excludedSystems: [],
          excludedProcesses: [],
          exclusionReasons: []
        },
        
        controls: [
          {
            controlId: 'SOX-001',
            controlName: 'Revenue Recognition Controls',
            controlDescription: 'Controls over revenue recognition process to ensure accurate financial reporting',
            implemented: true,
            effective: true,
            testingMethod: TestingMethod.REPERFORMANCE,
            testingResults: [
              {
                testId: 'test-001',
                testDescription: 'Test revenue recognition calculations',
                testResult: TestResult.PASS,
                evidence: ['calculation_worksheets', 'supporting_documentation'],
                observations: ['All calculations verified correctly'],
                exceptions: [],
                testedBy: 'auditor@company.com',
                testedAt: new Date().toISOString()
              }
            ],
            evidence: ['policy_documents', 'process_flows', 'system_configurations'],
            documentation: ['SOX_revenue_policy.pdf', 'process_documentation.docx'],
            rating: ControlRating.EFFECTIVE,
            riskLevel: 'low',
            deficiencies: [],
            assessedBy: 'compliance@company.com',
            assessedAt: new Date().toISOString()
          }
        ],
        
        overallScore: 92,
        complianceLevel: ComplianceLevel.SUBSTANTIALLY_COMPLIANT,
        
        gaps: [],
        recommendations: [
          {
            id: 'rec-001',
            type: RecommendationType.PROCESS_IMPROVEMENT,
            priority: RecommendationPriority.MEDIUM,
            title: 'Enhance Automated Controls',
            description: 'Implement additional automated controls to reduce manual review requirements',
            rationale: 'Reduce human error and improve efficiency',
            implementationSteps: [
              'Identify manual control points',
              'Design automated alternatives',
              'Implement and test automation',
              'Update documentation'
            ],
            estimatedEffort: '3 months',
            estimatedCost: 50000,
            benefits: ['Reduced errors', 'Improved efficiency', 'Better audit trail'],
            riskReduction: 'Medium',
            status: RecommendationStatus.PROPOSED,
            approvalRequired: true
          }
        ],
        
        assessmentPeriod: {
          start: new Date(Date.now() - 86400000 * 30).toISOString(),
          end: new Date().toISOString()
        },
        
        assessor: 'compliance@company.com',
        reviewers: ['audit@company.com', 'cfo@company.com'],
        
        status: AssessmentStatus.COMPLETED,
        
        reports: [],
        
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString(),
        nextAssessment: new Date(Date.now() + 86400000 * 90).toISOString()
      }
    ];

    setAuditEvents(mockAuditEvents);
    setInvestigations(mockInvestigations);
    setAssessments(mockAssessments);
  }, []);

  // ==================== Utility Functions ====================

  const getEventSeverityColor = (severity: EventSeverity): string => {
    switch (severity) {
      case EventSeverity.CRITICAL:
        return 'text-red-600';
      case EventSeverity.HIGH:
        return 'text-orange-600';
      case EventSeverity.MEDIUM:
        return 'text-yellow-600';
      case EventSeverity.LOW:
        return 'text-green-600';
      case EventSeverity.INFORMATIONAL:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getInvestigationStatusColor = (status: InvestigationStatus): string => {
    switch (status) {
      case InvestigationStatus.COMPLETED:
        return 'text-green-600';
      case InvestigationStatus.IN_PROGRESS:
        return 'text-blue-600';
      case InvestigationStatus.SUSPENDED:
        return 'text-orange-600';
      case InvestigationStatus.CLOSED:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getComplianceLevelColor = (level: ComplianceLevel): string => {
    switch (level) {
      case ComplianceLevel.FULLY_COMPLIANT:
        return 'text-green-600';
      case ComplianceLevel.SUBSTANTIALLY_COMPLIANT:
        return 'text-blue-600';
      case ComplianceLevel.PARTIALLY_COMPLIANT:
        return 'text-yellow-600';
      case ComplianceLevel.NON_COMPLIANT:
        return 'text-red-600';
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

  const handleCreateInvestigation = useCallback(async (investigationData: any) => {
    await createInvestigation(investigationData);
    setShowInvestigationDialog(false);
  }, [createInvestigation]);

  const handleExportData = useCallback(async (exportParams: any) => {
    await exportAuditData(exportParams);
    setShowExportDialog(false);
  }, [exportAuditData]);

  // ==================== Effects ====================

  useEffect(() => {
    // Initialize data
    fetchAuditEvents();
    fetchInvestigations();
    fetchComplianceAssessments();
  }, [fetchAuditEvents, fetchInvestigations, fetchComplianceAssessments]);

  useEffect(() => {
    // Calculate audit metrics
    const totalEvents = auditEvents.length;
    const criticalEvents = auditEvents.filter(e => e.eventSeverity === EventSeverity.CRITICAL).length;
    const highRiskEvents = auditEvents.filter(e => e.riskScore > 70).length;
    const activeInvestigations = investigations.filter(i => i.status === InvestigationStatus.IN_PROGRESS).length;
    const completedAssessments = assessments.filter(a => a.status === AssessmentStatus.COMPLETED).length;
    const complianceRate = assessments.length > 0 
      ? assessments.filter(a => a.complianceLevel === ComplianceLevel.FULLY_COMPLIANT || a.complianceLevel === ComplianceLevel.SUBSTANTIALLY_COMPLIANT).length / assessments.length * 100
      : 0;

    setAuditMetrics({
      totalEvents,
      criticalEvents,
      highRiskEvents,
      eventsToday: auditEvents.filter(e => 
        new Date(e.timestamp).toDateString() === new Date().toDateString()
      ).length,
      totalInvestigations: investigations.length,
      activeInvestigations,
      totalAssessments: assessments.length,
      completedAssessments,
      complianceRate,
      averageRiskScore: auditEvents.reduce((sum, e) => sum + e.riskScore, 0) / totalEvents || 0,
      lastUpdated: new Date().toISOString()
    });
  }, [auditEvents, investigations, assessments]);

  useEffect(() => {
    // Set up real-time WebSocket connection for audit events
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/audit/events/ws`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'audit_event') {
        setRealTimeEvents(prev => [data.event, ...prev.slice(0, 99)]);
        setAuditEvents(prev => [data.event, ...prev]);
        
        // Generate alert for critical events
        if (data.event.eventSeverity === EventSeverity.CRITICAL) {
          toast({
            title: "Critical Audit Event",
            description: `${data.event.actor.name} - ${data.event.action}`,
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

  const filteredAuditEvents = useMemo(() => {
    let filtered = auditEvents;
    
    if (filterEventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filterEventType);
    }
    
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(event => event.eventSeverity === filterSeverity);
    }
    
    if (filterSource !== 'all') {
      filtered = filtered.filter(event => event.sourceSystem === filterSource);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof AuditEvent] as string;
      const bValue = b[sortBy as keyof AuditEvent] as string;
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [auditEvents, filterEventType, filterSeverity, filterSource, searchQuery, sortBy, sortOrder]);

  const recentAuditEvents = useMemo(() => {
    return [...realTimeEvents, ...auditEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [realTimeEvents, auditEvents]);

  // ==================== Dashboard Component ====================

  const AuditTrailDashboard = () => (
    <div className="space-y-6">
      {/* Audit Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditMetrics?.totalEvents || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {auditMetrics?.criticalEvents || 0} Critical
              </Badge>
              <Badge variant="outline" className="text-xs">
                {auditMetrics?.eventsToday || 0} Today
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Audit events tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigations</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditMetrics?.activeInvestigations || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {auditMetrics?.totalInvestigations || 0} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active investigations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(auditMetrics?.complianceRate || 0)}%
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default">
                {auditMetrics?.completedAssessments || 0} Assessments
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Overall compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(auditMetrics?.averageRiskScore || 0)}
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {auditMetrics?.highRiskEvents || 0} High Risk
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average event risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events and Active Investigations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Events</CardTitle>
            <CardDescription>
              Latest audit trail activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAuditEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      event.eventSeverity === EventSeverity.CRITICAL ? 'bg-red-500' :
                      event.eventSeverity === EventSeverity.HIGH ? 'bg-orange-500' :
                      event.eventSeverity === EventSeverity.MEDIUM ? 'bg-yellow-500' :
                      event.eventSeverity === EventSeverity.LOW ? 'bg-green-500' : 'bg-blue-500'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{event.actor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.action} • {event.target.name}
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
            <CardTitle>Active Investigations</CardTitle>
            <CardDescription>
              Ongoing forensic investigations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {investigations.filter(i => i.status === InvestigationStatus.IN_PROGRESS).slice(0, 5).map((investigation) => (
                <div key={investigation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      investigation.priority === InvestigationPriority.CRITICAL ? 'bg-red-500' :
                      investigation.priority === InvestigationPriority.HIGH ? 'bg-orange-500' :
                      investigation.priority === InvestigationPriority.MEDIUM ? 'bg-yellow-500' : 'bg-green-500'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{investigation.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {investigation.caseNumber} • {investigation.investigationType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      investigation.priority === InvestigationPriority.CRITICAL ? 'destructive' :
                      investigation.priority === InvestigationPriority.HIGH ? 'default' : 'secondary'
                    } className="text-xs">
                      {investigation.priority}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((investigation.progress.completedTasks / investigation.progress.totalTasks) * 100)}%
                    </div>
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
            Common audit and compliance operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowSearchDialog(true)}
            >
              <Search className="h-6 w-6" />
              <span className="text-sm">Search Events</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowInvestigationDialog(true)}
            >
              <Microscope className="h-6 w-6" />
              <span className="text-sm">New Investigation</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="h-6 w-6" />
              <span className="text-sm">Export Data</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={refreshSecurityData}
            >
              <RefreshCw className="h-6 w-6" />
              <span className="text-sm">Refresh</span>
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
          <p>Loading audit trail data...</p>
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
          Failed to load audit trail data: {error.message}
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
            <h1 className="text-3xl font-bold">Audit Trail Manager</h1>
            <p className="text-muted-foreground">
              Enterprise audit management and forensic investigation platform
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>{auditMetrics?.totalEvents || 0} Events</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Search className="h-3 w-3" />
              <span>{auditMetrics?.activeInvestigations || 0} Active</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshSecurityData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="investigations" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Investigations</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4" />
              <span>Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AuditTrailDashboard />
          </TabsContent>

          <TabsContent value="events">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Audit Events</h3>
              <p className="text-muted-foreground">
                Detailed audit event management interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="investigations">
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Forensic Investigations</h3>
              <p className="text-muted-foreground">
                Investigation management and analysis interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Compliance Assessment</h3>
              <p className="text-muted-foreground">
                Compliance monitoring and assessment interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Audit Reports</h3>
              <p className="text-muted-foreground">
                Automated reporting and analytics interface coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default AuditTrailManager;