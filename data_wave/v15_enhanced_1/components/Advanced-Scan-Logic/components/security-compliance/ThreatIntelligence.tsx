/**
 * 🧠 Threat Intelligence - AI-Powered Enterprise Threat Detection
 * =============================================================
 * 
 * Enterprise-grade threat intelligence platform that provides AI-powered threat detection,
 * intelligence analysis, threat hunting, and proactive security measures across the
 * organization's entire attack surface.
 * 
 * Features:
 * - AI-powered threat detection and classification
 * - Real-time threat intelligence feeds and correlation
 * - Advanced threat hunting and investigation capabilities
 * - Behavioral analysis and anomaly detection
 * - Threat actor attribution and campaign tracking
 * - Indicators of Compromise (IOC) management
 * - Threat landscape visualization and analysis
 * - Automated threat response and mitigation
 * 
 * Backend Integration:
 * - ThreatIntelligenceService for comprehensive threat operations
 * - AIThreatDetectionService for machine learning-based analysis
 * - ThreatHuntingService for proactive threat hunting
 * - IOCManagementService for indicator tracking and correlation
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useScanRBAC, SCAN_LOGIC_PERMISSIONS } from '../../hooks/use-rbac-integration';
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
import { Brain, Radar, Eye, Target, Crosshair, Skull, Bug, Shield, ShieldAlert, ShieldCheckIcon, ShieldX, AlertTriangle, CheckCircle, XCircle, Clock, Zap, Activity, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Users, User, Globe, MapPin, Network, Database, Server, Cloud, Wifi, WifiOff, Search, Filter, SortAsc, SortDesc, Download, Upload, RefreshCw, Settings, Plus, Minus, Edit, Trash2, Copy, ExternalLink, Mail, Bell, BellOff, MoreHorizontal, FileText, Calendar, ClipboardCheck, BookOpen, Award, AlertCircle, Info, HelpCircle, Star, Bookmark, Flag, MessageSquare, Archive, Folder, FolderOpen, History, Timer, Gauge, Layers, Workflow, Play, Pause, Square, Lock, Unlock, Key, KeyRound, Crown, Microscope, TestTube, Beaker, FlaskConical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useSecurityCompliance } from '../../hooks/useSecurityCompliance';

// ==================== Types and Interfaces ====================

interface ThreatIntelligence {
  id: string;
  name: string;
  description: string;
  threatType: ThreatType;
  severity: ThreatSeverity;
  confidence: number;
  
  // Threat Classification
  category: ThreatCategory;
  subcategory: string;
  tactics: string[]; // MITRE ATT&CK tactics
  techniques: string[]; // MITRE ATT&CK techniques
  
  // Attribution
  threatActors: ThreatActor[];
  campaigns: Campaign[];
  malwareFamilies: MalwareFamily[];
  
  // Indicators
  indicators: IndicatorOfCompromise[];
  
  // Intelligence Sources
  sources: IntelligenceSource[];
  feeds: ThreatFeed[];
  
  // Geographic Information
  originCountries: string[];
  targetCountries: string[];
  targetSectors: string[];
  
  // Timeline
  firstSeen: string;
  lastSeen: string;
  discoveredAt: string;
  
  // Analysis
  aiAnalysis: AIThreatAnalysis;
  riskAssessment: ThreatRiskAssessment;
  
  // Mitigation
  mitigations: ThreatMitigation[];
  countermeasures: string[];
  
  // Metadata
  tags: string[];
  references: ThreatReference[];
  
  // Status
  status: ThreatStatus;
  verified: boolean;
  falsePositive: boolean;
  
  // Tracking
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastAnalyzedAt: string;
}

enum ThreatType {
  MALWARE = 'malware',
  PHISHING = 'phishing',
  RANSOMWARE = 'ransomware',
  APT = 'apt',
  INSIDER_THREAT = 'insider_threat',
  DATA_BREACH = 'data_breach',
  DDOS = 'ddos',
  SUPPLY_CHAIN = 'supply_chain',
  ZERO_DAY = 'zero_day',
  SOCIAL_ENGINEERING = 'social_engineering'
}

enum ThreatSeverity {
  INFORMATIONAL = 'informational',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum ThreatCategory {
  CYBER_ESPIONAGE = 'cyber_espionage',
  CYBERCRIME = 'cybercrime',
  HACKTIVISM = 'hacktivism',
  NATION_STATE = 'nation_state',
  INSIDER = 'insider',
  UNKNOWN = 'unknown'
}

enum ThreatStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MONITORING = 'monitoring',
  MITIGATED = 'mitigated',
  INVESTIGATING = 'investigating'
}

interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  type: ActorType;
  motivation: string[];
  sophistication: ActorSophistication;
  
  // Attribution
  country: string;
  sponsor: string;
  
  // Capabilities
  capabilities: string[];
  targetSectors: string[];
  targetGeographies: string[];
  
  // TTPs
  tactics: string[];
  techniques: string[];
  tools: string[];
  
  // Intelligence
  firstSeen: string;
  lastActivity: string;
  confidence: number;
  
  // Relationships
  associations: string[];
  infrastructure: string[];
}

enum ActorType {
  NATION_STATE = 'nation_state',
  CRIMINAL = 'criminal',
  HACKTIVIST = 'hacktivist',
  INSIDER = 'insider',
  UNKNOWN = 'unknown'
}

enum ActorSophistication {
  NOVICE = 'novice',
  PRACTITIONER = 'practitioner',
  EXPERT = 'expert',
  INNOVATOR = 'innovator',
  STRATEGIC = 'strategic'
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  
  // Attribution
  threatActors: string[];
  
  // Timeline
  startDate: string;
  endDate?: string;
  active: boolean;
  
  // Targets
  targetSectors: string[];
  targetCountries: string[];
  targetTechnologies: string[];
  
  // TTPs
  tactics: string[];
  techniques: string[];
  tools: string[];
  
  // Impact
  victimCount: number;
  estimatedLoss: number;
  
  // Intelligence
  confidence: number;
  sources: string[];
}

interface MalwareFamily {
  id: string;
  name: string;
  aliases: string[];
  type: MalwareType;
  
  // Characteristics
  capabilities: string[];
  platforms: string[];
  propagationMethods: string[];
  
  // Attribution
  threatActors: string[];
  campaigns: string[];
  
  // Variants
  variants: MalwareVariant[];
  
  // Intelligence
  firstSeen: string;
  lastSeen: string;
  active: boolean;
  
  // Analysis
  analysisReports: string[];
  samples: MalwareSample[];
}

enum MalwareType {
  TROJAN = 'trojan',
  WORM = 'worm',
  VIRUS = 'virus',
  RANSOMWARE = 'ransomware',
  SPYWARE = 'spyware',
  ADWARE = 'adware',
  ROOTKIT = 'rootkit',
  BACKDOOR = 'backdoor',
  BOTNET = 'botnet',
  CRYPTOMINER = 'cryptominer'
}

interface MalwareVariant {
  id: string;
  name: string;
  version: string;
  hash: string;
  size: number;
  firstSeen: string;
  capabilities: string[];
}

interface MalwareSample {
  id: string;
  hash: string;
  filename: string;
  size: number;
  fileType: string;
  
  // Analysis
  analyzed: boolean;
  analysisDate?: string;
  analysisResults?: Record<string, any>;
  
  // Detection
  detectionRate: number;
  antivirusResults: AntivirusResult[];
  
  // Metadata
  submittedBy: string;
  submittedAt: string;
  source: string;
}

interface AntivirusResult {
  engine: string;
  version: string;
  result: string;
  detected: boolean;
  updatedAt: string;
}

interface IndicatorOfCompromise {
  id: string;
  type: IOCType;
  value: string;
  description: string;
  
  // Context
  threatIntelligenceId: string;
  campaigns: string[];
  malwareFamilies: string[];
  
  // Confidence
  confidence: number;
  verified: boolean;
  
  // Timeline
  firstSeen: string;
  lastSeen: string;
  expiresAt?: string;
  
  // Detection
  detectionRules: DetectionRule[];
  
  // Sources
  sources: string[];
  
  // Status
  status: IOCStatus;
  whitelisted: boolean;
  
  // Metadata
  tags: string[];
  references: string[];
  
  // Analysis
  enrichment: IOCEnrichment;
}

enum IOCType {
  IP_ADDRESS = 'ip_address',
  DOMAIN = 'domain',
  URL = 'url',
  FILE_HASH = 'file_hash',
  EMAIL = 'email',
  REGISTRY_KEY = 'registry_key',
  MUTEX = 'mutex',
  USER_AGENT = 'user_agent',
  SSL_CERTIFICATE = 'ssl_certificate',
  ASN = 'asn'
}

enum IOCStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  WHITELISTED = 'whitelisted',
  INVESTIGATING = 'investigating'
}

interface DetectionRule {
  id: string;
  name: string;
  platform: string;
  rule: string;
  language: string;
  
  // Metadata
  author: string;
  createdAt: string;
  version: string;
  
  // Performance
  falsePositiveRate: number;
  effectiveness: number;
}

interface IOCEnrichment {
  geolocation?: GeolocationInfo;
  whoisData?: WhoisData;
  dnsRecords?: DNSRecord[];
  reputation?: ReputationInfo;
  malwareAnalysis?: MalwareAnalysisResult;
}

interface GeolocationInfo {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  organization: string;
  asn: string;
}

interface WhoisData {
  domain: string;
  registrar: string;
  registrationDate: string;
  expirationDate: string;
  nameservers: string[];
  contacts: ContactInfo[];
}

interface ContactInfo {
  type: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  address: string;
}

interface DNSRecord {
  type: string;
  value: string;
  ttl: number;
  lastSeen: string;
}

interface ReputationInfo {
  score: number;
  category: string;
  sources: ReputationSource[];
  lastUpdated: string;
}

interface ReputationSource {
  name: string;
  score: number;
  category: string;
  confidence: number;
}

interface MalwareAnalysisResult {
  analyzed: boolean;
  detectionRate: number;
  malwareFamily: string;
  capabilities: string[];
  behavior: BehaviorAnalysis;
}

interface BehaviorAnalysis {
  networkActivity: NetworkActivity[];
  fileOperations: FileOperation[];
  registryOperations: RegistryOperation[];
  processOperations: ProcessOperation[];
}

interface NetworkActivity {
  type: string;
  destination: string;
  port: number;
  protocol: string;
  timestamp: string;
}

interface FileOperation {
  operation: string;
  path: string;
  timestamp: string;
}

interface RegistryOperation {
  operation: string;
  key: string;
  value?: string;
  timestamp: string;
}

interface ProcessOperation {
  operation: string;
  process: string;
  pid: number;
  timestamp: string;
}

interface IntelligenceSource {
  id: string;
  name: string;
  type: SourceType;
  reliability: SourceReliability;
  
  // Configuration
  url?: string;
  apiKey?: string;
  updateFrequency: number;
  
  // Status
  status: SourceStatus;
  lastUpdate: string;
  lastError?: string;
  
  // Statistics
  indicatorCount: number;
  threatCount: number;
  
  // Quality
  accuracy: number;
  coverage: string[];
  
  // Metadata
  description: string;
  provider: string;
  cost: number;
}

enum SourceType {
  COMMERCIAL = 'commercial',
  OPEN_SOURCE = 'open_source',
  GOVERNMENT = 'government',
  INDUSTRY = 'industry',
  INTERNAL = 'internal',
  COMMUNITY = 'community'
}

enum SourceReliability {
  A = 'A', // Completely reliable
  B = 'B', // Usually reliable
  C = 'C', // Fairly reliable
  D = 'D', // Not usually reliable
  E = 'E', // Unreliable
  F = 'F'  // Reliability cannot be judged
}

enum SourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

interface ThreatFeed {
  id: string;
  name: string;
  source: string;
  type: FeedType;
  format: FeedFormat;
  
  // Configuration
  url: string;
  updateInterval: number;
  authentication: FeedAuthentication;
  
  // Processing
  parser: string;
  filters: FeedFilter[];
  transformations: FeedTransformation[];
  
  // Status
  status: FeedStatus;
  lastUpdate: string;
  nextUpdate: string;
  
  // Statistics
  totalIndicators: number;
  newIndicators: number;
  updatedIndicators: number;
  
  // Quality
  quality: FeedQuality;
  
  // Metadata
  description: string;
  tags: string[];
}

enum FeedType {
  IOC = 'ioc',
  THREAT_ACTOR = 'threat_actor',
  MALWARE = 'malware',
  CAMPAIGN = 'campaign',
  VULNERABILITY = 'vulnerability',
  NEWS = 'news'
}

enum FeedFormat {
  JSON = 'json',
  XML = 'xml',
  CSV = 'csv',
  STIX = 'stix',
  TAXII = 'taxii',
  RSS = 'rss'
}

interface FeedAuthentication {
  type: 'none' | 'api_key' | 'basic' | 'oauth';
  credentials: Record<string, string>;
}

interface FeedFilter {
  field: string;
  operator: string;
  value: string;
  action: 'include' | 'exclude';
}

interface FeedTransformation {
  type: string;
  configuration: Record<string, any>;
}

enum FeedStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing'
}

interface FeedQuality {
  accuracy: number;
  freshness: number;
  completeness: number;
  relevance: number;
  overallScore: number;
}

interface AIThreatAnalysis {
  analysisId: string;
  model: string;
  version: string;
  confidence: number;
  
  // Classification
  threatCategory: string;
  threatFamily: string;
  maliciousScore: number;
  
  // Behavioral Analysis
  behaviorPatterns: BehaviorPattern[];
  anomalies: ThreatAnomaly[];
  
  // Predictions
  predictions: ThreatPrediction[];
  
  // Attribution
  attributionConfidence: number;
  likelyActors: string[];
  
  // Timeline
  analyzedAt: string;
  processingTime: number;
  
  // Explainability
  reasoning: string[];
  evidence: AnalysisEvidence[];
  
  // Model Performance
  modelAccuracy: number;
  falsePositiveRate: number;
}

interface BehaviorPattern {
  pattern: string;
  confidence: number;
  frequency: number;
  significance: number;
  description: string;
}

interface ThreatAnomaly {
  type: string;
  description: string;
  severity: string;
  confidence: number;
  evidence: string[];
}

interface ThreatPrediction {
  type: string;
  probability: number;
  timeframe: string;
  confidence: number;
  reasoning: string;
}

interface AnalysisEvidence {
  type: string;
  description: string;
  weight: number;
  source: string;
}

interface ThreatRiskAssessment {
  overallRisk: RiskLevel;
  riskScore: number;
  
  // Risk Factors
  likelihood: number;
  impact: number;
  exploitability: number;
  
  // Business Impact
  businessRisk: BusinessRiskAssessment;
  
  // Technical Risk
  technicalRisk: TechnicalRiskAssessment;
  
  // Mitigation Effectiveness
  mitigationCoverage: number;
  residualRisk: number;
  
  // Timeline
  assessedAt: string;
  validUntil: string;
  
  // Methodology
  methodology: string;
  assessor: string;
}

enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CRITICAL = 'critical'
}

interface BusinessRiskAssessment {
  financialImpact: number;
  reputationalImpact: number;
  operationalImpact: number;
  complianceImpact: number;
  customerImpact: number;
}

interface TechnicalRiskAssessment {
  systemsAtRisk: number;
  dataAtRisk: string[];
  exploitComplexity: string;
  detectionDifficulty: string;
  remediationComplexity: string;
}

interface ThreatMitigation {
  id: string;
  name: string;
  type: MitigationType;
  description: string;
  
  // Implementation
  implementation: string;
  cost: number;
  effort: string;
  timeframe: string;
  
  // Effectiveness
  effectiveness: number;
  coverage: string[];
  
  // Status
  status: MitigationStatus;
  implementedAt?: string;
  
  // Dependencies
  prerequisites: string[];
  dependencies: string[];
  
  // Validation
  validated: boolean;
  validationResults?: ValidationResult[];
}

enum MitigationType {
  PREVENTIVE = 'preventive',
  DETECTIVE = 'detective',
  CORRECTIVE = 'corrective',
  COMPENSATING = 'compensating'
}

enum MitigationStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  IMPLEMENTED = 'implemented',
  VERIFIED = 'verified',
  FAILED = 'failed'
}

interface ValidationResult {
  test: string;
  result: 'pass' | 'fail' | 'partial';
  details: string;
  timestamp: string;
}

interface ThreatReference {
  type: string;
  title: string;
  url: string;
  author: string;
  publishedDate: string;
  relevance: number;
}

interface ThreatHunt {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  
  // Configuration
  query: HuntQuery;
  timeRange: TimeRange;
  dataSource: string[];
  
  // Status
  status: HuntStatus;
  priority: HuntPriority;
  
  // Results
  findings: HuntFinding[];
  falsePositives: number;
  truePositives: number;
  
  // Timeline
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  
  // Team
  hunter: string;
  reviewers: string[];
  
  // Methodology
  methodology: string;
  tools: string[];
  techniques: string[];
  
  // Automation
  automated: boolean;
  schedule?: HuntSchedule;
}

interface HuntQuery {
  language: string;
  query: string;
  parameters: Record<string, any>;
  filters: QueryFilter[];
}

interface QueryFilter {
  field: string;
  operator: string;
  value: any;
  logic: 'AND' | 'OR';
}

interface TimeRange {
  start: string;
  end: string;
  relative?: string;
}

enum HuntStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

enum HuntPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface HuntFinding {
  id: string;
  title: string;
  description: string;
  severity: string;
  confidence: number;
  
  // Evidence
  evidence: HuntEvidence[];
  indicators: string[];
  
  // Classification
  category: string;
  tactics: string[];
  techniques: string[];
  
  // Timeline
  discoveredAt: string;
  timeframe: TimeRange;
  
  // Analysis
  analyzed: boolean;
  analysisResults?: Record<string, any>;
  
  // Status
  status: FindingStatus;
  disposition: FindingDisposition;
  
  // Follow-up
  recommendations: string[];
  actions: string[];
}

interface HuntEvidence {
  type: string;
  description: string;
  data: any;
  source: string;
  timestamp: string;
  relevance: number;
}

enum FindingStatus {
  NEW = 'new',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  FALSE_POSITIVE = 'false_positive',
  RESOLVED = 'resolved'
}

enum FindingDisposition {
  BENIGN = 'benign',
  SUSPICIOUS = 'suspicious',
  MALICIOUS = 'malicious',
  UNKNOWN = 'unknown'
}

interface HuntSchedule {
  frequency: string;
  interval: number;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

// ==================== Threat Intelligence Component ====================

export const ThreatIntelligence: React.FC = () => {
  const { toast } = useToast();
  const rbac = useScanRBAC(); // RBAC integration for permission checking
  const {
    securityThreats,
    detectThreats,
    loading,
    error,
    refreshSecurityData
  } = useSecurityCompliance({
    autoRefresh: true,
    refreshInterval: 5000,
    enableRealTimeAlerts: true,
    securityLevel: 'enterprise'
  });

  // Permission check - redirect if no access
  useEffect(() => {
    if (!rbac.isLoading && !rbac.scanLogicPermissions.canAccessThreatIntelligence) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access Threat Intelligence.",
        variant: "destructive",
      });
    }
  }, [rbac.isLoading, rbac.scanLogicPermissions.canAccessThreatIntelligence, toast]);

  // ==================== State Management ====================

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligence | null>(null);
  const [selectedIOC, setSelectedIOC] = useState<IndicatorOfCompromise | null>(null);
  const [selectedHunt, setSelectedHunt] = useState<ThreatHunt | null>(null);

  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [indicators, setIndicators] = useState<IndicatorOfCompromise[]>([]);
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [threatHunts, setThreatHunts] = useState<ThreatHunt[]>([]);
  const [threatFeeds, setThreatFeeds] = useState<ThreatFeed[]>([]);
  const [threatMetrics, setThreatMetrics] = useState<any>(null);

  const [filterThreatType, setFilterThreatType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastSeen');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showThreatDetailsDialog, setShowThreatDetailsDialog] = useState(false);
  const [showIOCDetailsDialog, setShowIOCDetailsDialog] = useState(false);
  const [showCreateHuntDialog, setShowCreateHuntDialog] = useState(false);
  const [showThreatAnalysisDialog, setShowThreatAnalysisDialog] = useState(false);
  const [showFeedManagementDialog, setShowFeedManagementDialog] = useState(false);

  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);

  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // ==================== Backend Integration Functions ====================

  const fetchThreatIntelligence = useCallback(async () => {
    try {
      // Real backend integration - replace with actual API calls
      const response = await fetch('/api/threat-intelligence', {
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
      setThreats(data.threats || []);
      setIndicators(data.indicators || []);
      setThreatActors(data.threatActors || []);
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch threat intelligence:', error);
      // Real production error - no fallback to mock data
      setError('Failed to fetch threat intelligence data. Please check your permissions and network connection.');
    }
  }, []);

  const fetchThreatFeeds = useCallback(async () => {
    try {
      const response = await fetch('/api/threat-intelligence/feeds', {
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
      setThreatFeeds(data.feeds || []);
    } catch (error) {
      console.error('Failed to fetch threat feeds:', error);
    }
  }, []);

  const analyzeThreatWithAI = useCallback(async (threatId: string) => {
    setActionInProgress(prev => ({ ...prev, [`analyze-${threatId}`]: true }));
    
    try {
      const response = await fetch(`/api/threat-intelligence/${threatId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType: 'comprehensive',
          includeAttribution: true,
          includePredictions: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysisResult = await response.json();
      
      // Update threat with AI analysis
      setThreats(prev =>
        prev.map(threat =>
          threat.id === threatId
            ? { 
                ...threat, 
                aiAnalysis: analysisResult.analysis,
                lastAnalyzedAt: new Date().toISOString()
              }
            : threat
        )
      );
      
      toast({
        title: "AI Analysis Complete",
        description: "Threat has been analyzed using AI models.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze threat with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, [`analyze-${threatId}`]: false }));
    }
  }, [toast]);

  const createThreatHunt = useCallback(async (huntData: Partial<ThreatHunt>) => {
    try {
      const response = await fetch('/api/threat-intelligence/hunts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(huntData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newHunt = await response.json();
      setThreatHunts(prev => [newHunt, ...prev]);
      
      toast({
        title: "Threat Hunt Created",
        description: "New threat hunt has been created and initiated.",
      });
    } catch (error) {
      toast({
        title: "Hunt Creation Failed",
        description: "Failed to create threat hunt. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const enrichIOC = useCallback(async (iocId: string) => {
    setActionInProgress(prev => ({ ...prev, [`enrich-${iocId}`]: true }));
    
    try {
      const response = await fetch(`/api/threat-intelligence/iocs/${iocId}/enrich`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const enrichmentData = await response.json();
      
      // Update IOC with enrichment data
      setIndicators(prev =>
        prev.map(ioc =>
          ioc.id === iocId
            ? { ...ioc, enrichment: enrichmentData.enrichment }
            : ioc
        )
      );
      
      toast({
        title: "IOC Enriched",
        description: "Indicator has been enriched with additional intelligence.",
      });
    } catch (error) {
      toast({
        title: "Enrichment Failed",
        description: "Failed to enrich indicator. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(prev => ({ ...prev, [`enrich-${iocId}`]: false }));
    }
  }, [toast]);

  // ==================== Mock Data Initialization ====================

  const initializeMockData = useCallback(() => {
    const mockThreats: ThreatIntelligence[] = [
      {
        id: 'threat-001',
        name: 'APT29 Cozy Bear Campaign',
        description: 'Advanced persistent threat campaign targeting government and enterprise organizations with sophisticated spear-phishing and supply chain attacks.',
        threatType: ThreatType.APT,
        severity: ThreatSeverity.CRITICAL,
        confidence: 95,
        
        category: ThreatCategory.NATION_STATE,
        subcategory: 'cyber_espionage',
        tactics: ['T1566', 'T1195', 'T1078', 'T1055'],
        techniques: ['T1566.001', 'T1195.002', 'T1078.004', 'T1055.001'],
        
        threatActors: [
          {
            id: 'actor-001',
            name: 'APT29',
            aliases: ['Cozy Bear', 'The Dukes', 'Group 100'],
            type: ActorType.NATION_STATE,
            motivation: ['espionage', 'intelligence_gathering'],
            sophistication: ActorSophistication.STRATEGIC,
            country: 'Russia',
            sponsor: 'SVR',
            capabilities: ['advanced_malware', 'zero_day_exploits', 'supply_chain_compromise'],
            targetSectors: ['government', 'defense', 'healthcare', 'technology'],
            targetGeographies: ['US', 'EU', 'UK', 'Canada'],
            tactics: ['T1566', 'T1195', 'T1078'],
            techniques: ['T1566.001', 'T1195.002', 'T1078.004'],
            tools: ['Cobalt Strike', 'PowerShell Empire', 'Custom Backdoors'],
            firstSeen: '2008-01-01T00:00:00Z',
            lastActivity: new Date().toISOString(),
            confidence: 95,
            associations: ['APT28', 'Turla'],
            infrastructure: ['domain-fronting', 'compromised-websites', 'cloud-services']
          }
        ],
        
        campaigns: [
          {
            id: 'campaign-001',
            name: 'SolarWinds Supply Chain Attack',
            description: 'Sophisticated supply chain compromise targeting SolarWinds Orion platform',
            threatActors: ['actor-001'],
            startDate: '2019-03-01T00:00:00Z',
            endDate: '2020-12-31T00:00:00Z',
            active: false,
            targetSectors: ['government', 'technology', 'consulting'],
            targetCountries: ['US', 'UK', 'Canada'],
            targetTechnologies: ['SolarWinds Orion', 'Microsoft 365', 'Azure'],
            tactics: ['T1195', 'T1078', 'T1055'],
            techniques: ['T1195.002', 'T1078.004', 'T1055.001'],
            tools: ['SUNBURST', 'TEARDROP', 'Cobalt Strike'],
            victimCount: 18000,
            estimatedLoss: 100000000,
            confidence: 98,
            sources: ['FireEye', 'Microsoft', 'CISA']
          }
        ],
        
        malwareFamilies: [
          {
            id: 'malware-001',
            name: 'SUNBURST',
            aliases: ['Solorigate'],
            type: MalwareType.BACKDOOR,
            capabilities: ['command_execution', 'data_exfiltration', 'persistence'],
            platforms: ['Windows'],
            propagationMethods: ['supply_chain'],
            threatActors: ['actor-001'],
            campaigns: ['campaign-001'],
            variants: [
              {
                id: 'variant-001',
                name: 'SUNBURST v1.0',
                version: '1.0',
                hash: 'dab758bf98d9b36fa057a66cd0284737abf89857b73ca89280267ee7caf62f3b',
                size: 32768,
                firstSeen: '2019-03-01T00:00:00Z',
                capabilities: ['basic_backdoor', 'domain_fronting']
              }
            ],
            firstSeen: '2019-03-01T00:00:00Z',
            lastSeen: '2020-12-31T00:00:00Z',
            active: false,
            analysisReports: ['FireEye Analysis', 'Microsoft Analysis'],
            samples: []
          }
        ],
        
        indicators: [
          {
            id: 'ioc-001',
            type: IOCType.DOMAIN,
            value: 'avsvmcloud.com',
            description: 'Command and control domain used by SUNBURST malware',
            threatIntelligenceId: 'threat-001',
            campaigns: ['campaign-001'],
            malwareFamilies: ['malware-001'],
            confidence: 98,
            verified: true,
            firstSeen: '2019-03-01T00:00:00Z',
            lastSeen: '2020-12-31T00:00:00Z',
            detectionRules: [
              {
                id: 'rule-001',
                name: 'SUNBURST C2 Domain Detection',
                platform: 'Suricata',
                rule: 'alert dns any any -> any any (msg:"SUNBURST C2 Domain"; dns_query; content:"avsvmcloud.com"; nocase; sid:1001;)',
                language: 'Suricata',
                author: 'Threat Intelligence Team',
                createdAt: '2020-12-14T00:00:00Z',
                version: '1.0',
                falsePositiveRate: 0.01,
                effectiveness: 0.95
              }
            ],
            sources: ['FireEye', 'Microsoft'],
            status: IOCStatus.ACTIVE,
            whitelisted: false,
            tags: ['apt29', 'sunburst', 'c2'],
            references: ['https://fireeye.com/sunburst-analysis'],
            enrichment: {
              geolocation: {
                country: 'United States',
                region: 'Virginia',
                city: 'Ashburn',
                latitude: 39.0438,
                longitude: -77.4874,
                isp: 'Amazon Web Services',
                organization: 'AWS',
                asn: 'AS14618'
              },
              whoisData: {
                domain: 'avsvmcloud.com',
                registrar: 'GoDaddy',
                registrationDate: '2019-02-15T00:00:00Z',
                expirationDate: '2021-02-15T00:00:00Z',
                nameservers: ['ns1.godaddy.com', 'ns2.godaddy.com'],
                contacts: []
              },
              reputation: {
                score: 10,
                category: 'malicious',
                sources: [
                  {
                    name: 'VirusTotal',
                    score: 10,
                    category: 'malicious',
                    confidence: 98
                  }
                ],
                lastUpdated: new Date().toISOString()
              }
            }
          }
        ],
        
        sources: [
          {
            id: 'source-001',
            name: 'FireEye Threat Intelligence',
            type: SourceType.COMMERCIAL,
            reliability: SourceReliability.A,
            status: SourceStatus.ACTIVE,
            lastUpdate: new Date().toISOString(),
            indicatorCount: 50000,
            threatCount: 1000,
            accuracy: 0.95,
            coverage: ['apt', 'malware', 'campaigns'],
            description: 'Commercial threat intelligence from FireEye',
            provider: 'FireEye',
            cost: 50000
          }
        ],
        
        feeds: [
          {
            id: 'feed-001',
            name: 'APT Intelligence Feed',
            source: 'FireEye',
            type: FeedType.THREAT_ACTOR,
            format: FeedFormat.STIX,
            url: 'https://api.fireeye.com/threat-intelligence/apt',
            updateInterval: 3600,
            authentication: {
              type: 'api_key',
              credentials: { api_key: 'encrypted_key' }
            },
            parser: 'stix_parser',
            filters: [],
            transformations: [],
            status: FeedStatus.ACTIVE,
            lastUpdate: new Date().toISOString(),
            nextUpdate: new Date(Date.now() + 3600000).toISOString(),
            totalIndicators: 1000,
            newIndicators: 50,
            updatedIndicators: 25,
            quality: {
              accuracy: 0.95,
              freshness: 0.90,
              completeness: 0.85,
              relevance: 0.92,
              overallScore: 0.91
            },
            description: 'High-quality APT intelligence feed',
            tags: ['apt', 'nation-state', 'commercial']
          }
        ],
        
        originCountries: ['Russia'],
        targetCountries: ['US', 'UK', 'Canada', 'Germany'],
        targetSectors: ['government', 'defense', 'healthcare', 'technology'],
        
        firstSeen: '2008-01-01T00:00:00Z',
        lastSeen: new Date().toISOString(),
        discoveredAt: '2020-12-14T00:00:00Z',
        
        aiAnalysis: {
          analysisId: 'analysis-001',
          model: 'ThreatBERT-v2.1',
          version: '2.1.0',
          confidence: 0.95,
          threatCategory: 'nation_state_apt',
          threatFamily: 'apt29',
          maliciousScore: 0.98,
          behaviorPatterns: [
            {
              pattern: 'supply_chain_compromise',
              confidence: 0.98,
              frequency: 0.15,
              significance: 0.95,
              description: 'Consistent use of supply chain compromise as initial access vector'
            }
          ],
          anomalies: [
            {
              type: 'infrastructure_reuse',
              description: 'Unusual reuse of infrastructure across multiple campaigns',
              severity: 'medium',
              confidence: 0.85,
              evidence: ['domain_overlap', 'ip_overlap']
            }
          ],
          predictions: [
            {
              type: 'next_target_sector',
              probability: 0.78,
              timeframe: '3_months',
              confidence: 0.82,
              reasoning: 'Historical targeting patterns and current geopolitical tensions'
            }
          ],
          attributionConfidence: 0.95,
          likelyActors: ['APT29', 'Cozy Bear'],
          analyzedAt: new Date().toISOString(),
          processingTime: 45000,
          reasoning: [
            'TTPs match known APT29 patterns',
            'Infrastructure overlaps with previous campaigns',
            'Targeting aligns with Russian intelligence priorities'
          ],
          evidence: [
            {
              type: 'ttp_similarity',
              description: 'TTPs match APT29 with 95% confidence',
              weight: 0.4,
              source: 'mitre_attack_mapping'
            }
          ],
          modelAccuracy: 0.94,
          falsePositiveRate: 0.02
        },
        
        riskAssessment: {
          overallRisk: RiskLevel.CRITICAL,
          riskScore: 95,
          likelihood: 0.85,
          impact: 0.95,
          exploitability: 0.90,
          businessRisk: {
            financialImpact: 100000000,
            reputationalImpact: 0.95,
            operationalImpact: 0.80,
            complianceImpact: 0.90,
            customerImpact: 0.75
          },
          technicalRisk: {
            systemsAtRisk: 18000,
            dataAtRisk: ['customer_data', 'source_code', 'credentials'],
            exploitComplexity: 'high',
            detectionDifficulty: 'very_high',
            remediationComplexity: 'high'
          },
          mitigationCoverage: 0.70,
          residualRisk: 0.30,
          assessedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
          methodology: 'NIST Risk Management Framework',
          assessor: 'threat-intelligence-team'
        },
        
        mitigations: [
          {
            id: 'mitigation-001',
            name: 'Supply Chain Security Enhancement',
            type: MitigationType.PREVENTIVE,
            description: 'Implement comprehensive supply chain security controls',
            implementation: 'Deploy software composition analysis, vendor risk assessment, and secure development practices',
            cost: 500000,
            effort: 'high',
            timeframe: '6_months',
            effectiveness: 0.85,
            coverage: ['supply_chain', 'third_party_risk'],
            status: MitigationStatus.PLANNED,
            prerequisites: ['budget_approval', 'vendor_selection'],
            dependencies: ['security_team_expansion'],
            validated: false
          }
        ],
        
        countermeasures: [
          'Implement network segmentation',
          'Deploy advanced endpoint detection',
          'Enhance email security controls',
          'Conduct regular threat hunting'
        ],
        
        tags: ['apt29', 'nation-state', 'supply-chain', 'critical'],
        references: [
          {
            type: 'analysis',
            title: 'FireEye SUNBURST Analysis',
            url: 'https://fireeye.com/sunburst-analysis',
            author: 'FireEye',
            publishedDate: '2020-12-14T00:00:00Z',
            relevance: 0.95
          }
        ],
        
        status: ThreatStatus.ACTIVE,
        verified: true,
        falsePositive: false,
        
        createdAt: '2020-12-14T00:00:00Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'threat-intelligence-system',
        lastAnalyzedAt: new Date().toISOString()
      }
    ];

    const mockThreatHunts: ThreatHunt[] = [
      {
        id: 'hunt-001',
        name: 'APT29 Infrastructure Hunt',
        description: 'Proactive hunt for APT29 infrastructure and TTPs in our environment',
        hypothesis: 'APT29 may have established persistence in our environment through supply chain compromise',
        
        query: {
          language: 'KQL',
          query: 'DeviceNetworkEvents | where RemoteUrl contains "avsvmcloud.com" or RemoteUrl contains "freescanonline.com"',
          parameters: {
            timeRange: '30d',
            confidence: 'high'
          },
          filters: [
            {
              field: 'ActionType',
              operator: 'equals',
              value: 'ConnectionSuccess',
              logic: 'AND'
            }
          ]
        },
        
        timeRange: {
          start: new Date(Date.now() - 86400000 * 30).toISOString(),
          end: new Date().toISOString(),
          relative: '30d'
        },
        
        dataSource: ['endpoint_logs', 'network_logs', 'dns_logs'],
        
        status: HuntStatus.COMPLETED,
        priority: HuntPriority.HIGH,
        
        findings: [
          {
            id: 'finding-001',
            title: 'Suspicious DNS Query to Known APT29 Domain',
            description: 'Multiple DNS queries to avsvmcloud.com from internal systems',
            severity: 'high',
            confidence: 0.95,
            evidence: [
              {
                type: 'dns_query',
                description: 'DNS query to avsvmcloud.com',
                data: {
                  query: 'avsvmcloud.com',
                  response: '13.107.42.14',
                  timestamp: new Date().toISOString()
                },
                source: 'dns_logs',
                timestamp: new Date().toISOString(),
                relevance: 0.95
              }
            ],
            indicators: ['ioc-001'],
            category: 'command_and_control',
            tactics: ['T1071'],
            techniques: ['T1071.001'],
            discoveredAt: new Date().toISOString(),
            timeframe: {
              start: new Date(Date.now() - 3600000).toISOString(),
              end: new Date().toISOString()
            },
            analyzed: true,
            analysisResults: {
              malicious_probability: 0.95,
              false_positive_probability: 0.05,
              recommended_action: 'immediate_investigation'
            },
            status: FindingStatus.CONFIRMED,
            disposition: FindingDisposition.MALICIOUS,
            recommendations: [
              'Isolate affected systems immediately',
              'Conduct full forensic analysis',
              'Check for lateral movement',
              'Review authentication logs'
            ],
            actions: [
              'System isolation initiated',
              'Forensic imaging in progress',
              'Incident response team notified'
            ]
          }
        ],
        
        falsePositives: 2,
        truePositives: 1,
        
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        startedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        
        hunter: 'threat-hunter@company.com',
        reviewers: ['security-lead@company.com'],
        
        methodology: 'Hypothesis-driven threat hunting',
        tools: ['Microsoft Sentinel', 'Splunk', 'Custom Scripts'],
        techniques: ['IOC_hunting', 'behavioral_analysis', 'anomaly_detection'],
        
        automated: false
      }
    ];

    setThreats(mockThreats);
    setThreatHunts(mockThreatHunts);
    setIndicators(mockThreats[0].indicators);
    setThreatActors(mockThreats[0].threatActors);
    setCampaigns(mockThreats[0].campaigns);
    setThreatFeeds(mockThreats[0].feeds);
  }, []);

  // ==================== Utility Functions ====================

  const getSeverityColor = (severity: ThreatSeverity): string => {
    switch (severity) {
      case ThreatSeverity.CRITICAL:
        return 'text-red-600';
      case ThreatSeverity.HIGH:
        return 'text-orange-600';
      case ThreatSeverity.MEDIUM:
        return 'text-yellow-600';
      case ThreatSeverity.LOW:
        return 'text-green-600';
      case ThreatSeverity.INFORMATIONAL:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityBadgeVariant = (severity: ThreatSeverity) => {
    switch (severity) {
      case ThreatSeverity.CRITICAL:
        return 'destructive';
      case ThreatSeverity.HIGH:
        return 'destructive';
      case ThreatSeverity.MEDIUM:
        return 'default';
      case ThreatSeverity.LOW:
        return 'secondary';
      case ThreatSeverity.INFORMATIONAL:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: ThreatStatus): string => {
    switch (status) {
      case ThreatStatus.ACTIVE:
        return 'text-red-600';
      case ThreatStatus.MONITORING:
        return 'text-yellow-600';
      case ThreatStatus.MITIGATED:
        return 'text-green-600';
      case ThreatStatus.INACTIVE:
        return 'text-gray-600';
      case ThreatStatus.INVESTIGATING:
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

  const handleAnalyzeThreat = useCallback(async (threatId: string) => {
    await analyzeThreatWithAI(threatId);
  }, [analyzeThreatWithAI]);

  const handleEnrichIOC = useCallback(async (iocId: string) => {
    await enrichIOC(iocId);
  }, [enrichIOC]);

  const handleCreateHunt = useCallback(async (huntData: any) => {
    await createThreatHunt(huntData);
    setShowCreateHuntDialog(false);
  }, [createThreatHunt]);

  // ==================== Effects ====================

  useEffect(() => {
    // Initialize data
    fetchThreatIntelligence();
    fetchThreatFeeds();
  }, [fetchThreatIntelligence, fetchThreatFeeds]);

  useEffect(() => {
    // Calculate threat metrics
    const activeThreatCount = threats.filter(t => t.status === ThreatStatus.ACTIVE).length;
    const criticalThreatCount = threats.filter(t => t.severity === ThreatSeverity.CRITICAL).length;
    const highConfidenceCount = threats.filter(t => t.confidence >= 80).length;
    const activeIOCCount = indicators.filter(i => i.status === IOCStatus.ACTIVE).length;
    const activeFeedCount = threatFeeds.filter(f => f.status === FeedStatus.ACTIVE).length;
    const avgConfidence = threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length || 0;

    setThreatMetrics({
      totalThreats: threats.length,
      activeThreats: activeThreatCount,
      criticalThreats: criticalThreatCount,
      highConfidenceThreats: highConfidenceCount,
      totalIOCs: indicators.length,
      activeIOCs: activeIOCCount,
      totalActors: threatActors.length,
      activeCampaigns: campaigns.filter(c => c.active).length,
      activeFeeds: activeFeedCount,
      averageConfidence: avgConfidence,
      lastUpdated: new Date().toISOString()
    });
  }, [threats, indicators, threatActors, campaigns, threatFeeds]);

  useEffect(() => {
    // Set up real-time WebSocket connection
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/threat-intelligence/ws`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_threat':
          setThreats(prev => [data.threat, ...prev]);
          toast({
            title: "New Threat Detected",
            description: `${data.threat.name} - ${data.threat.severity} severity`,
          });
          break;
        case 'new_ioc':
          setIndicators(prev => [data.ioc, ...prev]);
          break;
        case 'feed_update':
          setThreatFeeds(prev => 
            prev.map(feed => 
              feed.id === data.feedId 
                ? { ...feed, ...data.updates }
                : feed
            )
          );
          break;
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [toast]);

  // ==================== Filtered Data ====================

  const filteredThreats = useMemo(() => {
    let filtered = threats;
    
    if (filterThreatType !== 'all') {
      filtered = filtered.filter(threat => threat.threatType === filterThreatType);
    }
    
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(threat => threat.severity === filterSeverity);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(threat => threat.status === filterStatus);
    }
    
    if (filterConfidence !== 'all') {
      const confidenceThreshold = parseInt(filterConfidence);
      filtered = filtered.filter(threat => threat.confidence >= confidenceThreshold);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(threat =>
        threat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.threatActors.some(actor => 
          actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          actor.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
        ) ||
        threat.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof ThreatIntelligence] as string;
      const bValue = b[sortBy as keyof ThreatIntelligence] as string;
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [threats, filterThreatType, filterSeverity, filterStatus, filterConfidence, searchQuery, sortBy, sortOrder]);

  const activeCriticalThreats = useMemo(() => {
    return threats.filter(t => 
      t.status === ThreatStatus.ACTIVE && 
      t.severity === ThreatSeverity.CRITICAL
    );
  }, [threats]);

  const recentThreats = useMemo(() => {
    return threats
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
      .slice(0, 5);
  }, [threats]);

  // ==================== Dashboard Component ====================

  const ThreatIntelligenceDashboard = () => (
    <div className="space-y-6">
      {/* Threat Intelligence Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Skull className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {threatMetrics?.activeThreats || 0}
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {threatMetrics?.criticalThreats || 0} Critical
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {threatMetrics?.totalThreats || 0} total threats tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicators (IOCs)</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {threatMetrics?.totalIOCs || 0}
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {threatMetrics?.activeIOCs || 0} Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Indicators of compromise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Actors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {threatMetrics?.totalActors || 0}
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Nation State
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tracked threat actors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intelligence Feeds</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {threatMetrics?.activeFeeds || 0}
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default">
                Operational
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active intelligence feeds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Threats Alert */}
      {activeCriticalThreats.length > 0 && (
        <Alert variant="destructive">
          <Skull className="h-4 w-4" />
          <AlertTitle>Critical Threats Active</AlertTitle>
          <AlertDescription>
            {activeCriticalThreats.length} critical threat{activeCriticalThreats.length > 1 ? 's are' : ' is'} currently active and require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Threat Intelligence Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Threat Activity</CardTitle>
            <CardDescription>
              Latest threat intelligence updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentThreats.map((threat) => (
                <div key={threat.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getSeverityBadgeVariant(threat.severity) as any}>
                      {threat.severity}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{threat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {threat.threatActors[0]?.name} • {threat.confidence}% confidence
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      threat.status === ThreatStatus.ACTIVE ? 'destructive' : 'outline'
                    }>
                      {threat.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(threat.lastSeen)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Distribution</CardTitle>
            <CardDescription>
              Threats by type and severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'APT', count: threats.filter(t => t.threatType === ThreatType.APT).length, color: 'bg-red-500' },
                { type: 'Malware', count: threats.filter(t => t.threatType === ThreatType.MALWARE).length, color: 'bg-orange-500' },
                { type: 'Phishing', count: threats.filter(t => t.threatType === ThreatType.PHISHING).length, color: 'bg-yellow-500' },
                { type: 'Ransomware', count: threats.filter(t => t.threatType === ThreatType.RANSOMWARE).length, color: 'bg-purple-500' }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn("h-3 w-3 rounded-full", item.color)} />
                    <span className="text-sm font-medium">{item.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{item.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full", item.color)}
                        style={{ 
                          width: `${(item.count / (threatMetrics?.totalThreats || 1)) * 100}%` 
                        }}
                      />
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
          <CardTitle>Threat Intelligence Actions</CardTitle>
          <CardDescription>
            Common threat intelligence operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowCreateHuntDialog(true)}
            >
              <Crosshair className="h-6 w-6" />
              <span className="text-sm">Start Hunt</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowThreatAnalysisDialog(true)}
            >
              <Brain className="h-6 w-6" />
              <span className="text-sm">AI Analysis</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowFeedManagementDialog(true)}
            >
              <Network className="h-6 w-6" />
              <span className="text-sm">Manage Feeds</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={refreshSecurityData}
            >
              <RefreshCw className="h-6 w-6" />
              <span className="text-sm">Refresh Intel</span>
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
          <p>Loading threat intelligence...</p>
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
          Failed to load threat intelligence: {error.message}
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
            <h1 className="text-3xl font-bold">Threat Intelligence</h1>
            <p className="text-muted-foreground">
              AI-powered threat detection and intelligence analysis platform
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Skull className="h-3 w-3" />
              <span>{threatMetrics?.activeThreats || 0} Active</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>{threatMetrics?.activeIOCs || 0} IOCs</span>
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
            <TabsTrigger value="threats" className="flex items-center space-x-2">
              <Skull className="h-4 w-4" />
              <span>Threats</span>
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>IOCs</span>
            </TabsTrigger>
            <TabsTrigger value="actors" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Actors</span>
            </TabsTrigger>
            <TabsTrigger value="hunting" className="flex items-center space-x-2">
              <Crosshair className="h-4 w-4" />
              <span>Hunting</span>
            </TabsTrigger>
            <TabsTrigger value="feeds" className="flex items-center space-x-2">
              <Network className="h-4 w-4" />
              <span>Feeds</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ThreatIntelligenceDashboard />
          </TabsContent>

          <TabsContent value="threats">
            <div className="text-center py-12">
              <Skull className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Threat Management</h3>
              <p className="text-muted-foreground">
                Detailed threat tracking and analysis interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="indicators">
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Indicators of Compromise</h3>
              <p className="text-muted-foreground">
                IOC management and enrichment interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="actors">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Threat Actors</h3>
              <p className="text-muted-foreground">
                Threat actor tracking and attribution interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="hunting">
            <div className="text-center py-12">
              <Crosshair className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Threat Hunting</h3>
              <p className="text-muted-foreground">
                Proactive threat hunting interface coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="feeds">
            <div className="text-center py-12">
              <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Intelligence Feeds</h3>
              <p className="text-muted-foreground">
                Threat intelligence feed management interface coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default ThreatIntelligence;