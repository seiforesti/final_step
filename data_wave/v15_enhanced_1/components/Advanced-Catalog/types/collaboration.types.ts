// ============================================================================
// ADVANCED CATALOG COLLABORATION TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: Collaboration features across multiple backend services
// ============================================================================

import { 
  IntelligentDataAsset, 
  BusinessGlossaryTerm,
  TimePeriod 
} from './catalog-core.types';

// ============================================================================
// COLLABORATION HUB TYPES
// ============================================================================

export interface CatalogCollaborationHub {
  id: string;
  name: string;
  description?: string;
  
  // Hub Configuration
  config: CollaborationHubConfig;
  
  // Teams & Members
  teams: CollaborationTeam[];
  members: CollaborationMember[];
  
  // Workspaces
  workspaces: CollaborationWorkspace[];
  
  // Activities
  activities: CollaborationActivity[];
  
  // Communication
  communications: CommunicationChannel[];
  
  // Knowledge Sharing
  knowledgeSharing: KnowledgeSharingConfig;
  
  // Analytics
  analytics: CollaborationAnalytics;
  
  // Settings
  settings: CollaborationSettings;
}

export interface CollaborationTeam {
  id: string;
  name: string;
  description?: string;
  
  // Team Configuration
  type: TeamType;
  purpose: TeamPurpose;
  
  // Members
  members: TeamMember[];
  leaders: TeamLeader[];
  
  // Permissions
  permissions: TeamPermissions;
  
  // Assets & Responsibilities
  assignedAssets: string[];
  responsibilities: TeamResponsibility[];
  
  // Goals & Metrics
  goals: TeamGoal[];
  metrics: TeamMetrics;
  
  // Communication
  communicationChannels: CommunicationChannel[];
  
  // Status
  status: TeamStatus;
  
  // Timestamps
  createdAt: Date;
  lastActivity: Date;
}

export interface CollaborationWorkspace {
  id: string;
  name: string;
  description?: string;
  
  // Workspace Configuration
  type: WorkspaceType;
  visibility: WorkspaceVisibility;
  
  // Members & Access
  members: WorkspaceMember[];
  accessControl: WorkspaceAccessControl;
  
  // Content
  assets: WorkspaceAsset[];
  documents: WorkspaceDocument[];
  discussions: WorkspaceDiscussion[];
  
  // Tools & Features
  tools: WorkspaceTools;
  features: WorkspaceFeature[];
  
  // Templates
  templates: WorkspaceTemplate[];
  
  // Analytics
  analytics: WorkspaceAnalytics;
  
  // Settings
  settings: WorkspaceSettings;
}

// ============================================================================
// DATA STEWARDSHIP TYPES
// ============================================================================

export interface DataStewardshipCenter {
  id: string;
  name: string;
  
  // Stewardship Configuration
  config: StewardshipConfig;
  
  // Stewards & Roles
  stewards: DataSteward[];
  roles: StewardshipRole[];
  
  // Workflows
  workflows: StewardshipWorkflow[];
  
  // Responsibilities
  responsibilities: StewardshipResponsibility[];
  
  // Quality Management
  qualityManagement: StewardshipQualityManagement;
  
  // Governance
  governance: StewardshipGovernance;
  
  // Metrics & Reporting
  metrics: StewardshipMetrics;
  reporting: StewardshipReporting;
}

export interface DataSteward {
  id: string;
  userId: string;
  name: string;
  email: string;
  
  // Role & Responsibilities
  role: StewardshipRole;
  responsibilities: StewardResponsibility[];
  
  // Areas of Expertise
  expertiseAreas: ExpertiseArea[];
  domains: StewardshipDomain[];
  
  // Assigned Assets
  assignedAssets: string[];
  managedAssets: string[];
  
  // Performance
  performance: StewardPerformance;
  
  // Activity
  activities: StewardActivity[];
  
  // Certification
  certifications: StewardCertification[];
  
  // Status
  status: StewardStatus;
  
  // Timestamps
  assignedAt: Date;
  lastActive: Date;
}

export interface StewardshipWorkflow {
  id: string;
  name: string;
  description?: string;
  
  // Workflow Configuration
  type: WorkflowType;
  steps: WorkflowStep[];
  
  // Triggers
  triggers: WorkflowTrigger[];
  
  // Participants
  participants: WorkflowParticipant[];
  
  // Approval Chain
  approvalChain: ApprovalStep[];
  
  // Business Rules
  businessRules: BusinessRule[];
  
  // SLAs
  slas: WorkflowSLA[];
  
  // Notifications
  notifications: WorkflowNotification[];
  
  // Status
  status: WorkflowStatus;
  
  // Metrics
  metrics: WorkflowMetrics;
}

// ============================================================================
// ANNOTATION & DOCUMENTATION TYPES
// ============================================================================

export interface AnnotationManager {
  id: string;
  
  // Annotation Configuration
  config: AnnotationConfig;
  
  // Annotation Types
  types: AnnotationType[];
  
  // Annotations
  annotations: DataAnnotation[];
  
  // Templates
  templates: AnnotationTemplate[];
  
  // Approval Process
  approvalProcess: AnnotationApprovalProcess;
  
  // Analytics
  analytics: AnnotationAnalytics;
  
  // Search & Discovery
  searchConfig: AnnotationSearchConfig;
}

export interface DataAnnotation {
  id: string;
  
  // Target Information
  targetId: string;
  targetType: AnnotationTargetType;
  
  // Annotation Content
  content: AnnotationContent;
  
  // Author Information
  authorId: string;
  authorName: string;
  
  // Classification
  type: AnnotationType;
  category: AnnotationCategory;
  tags: string[];
  
  // Visibility & Access
  visibility: AnnotationVisibility;
  permissions: AnnotationPermissions;
  
  // Lifecycle
  status: AnnotationStatus;
  approvalStatus: ApprovalStatus;
  
  // Relationships
  parentAnnotation?: string;
  childAnnotations: string[];
  relatedAnnotations: string[];
  
  // Metrics
  metrics: AnnotationMetrics;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

export interface ReviewWorkflowEngine {
  id: string;
  name: string;
  
  // Workflow Configuration
  config: ReviewWorkflowConfig;
  
  // Review Types
  reviewTypes: ReviewType[];
  
  // Active Reviews
  activeReviews: AssetReview[];
  
  // Review Templates
  templates: ReviewTemplate[];
  
  // Reviewers
  reviewers: Reviewer[];
  
  // Escalation Rules
  escalationRules: EscalationRule[];
  
  // Notifications
  notifications: ReviewNotification[];
  
  // Analytics
  analytics: ReviewAnalytics;
}

export interface AssetReview {
  id: string;
  
  // Review Information
  assetId: string;
  reviewType: ReviewType;
  
  // Review Configuration
  config: ReviewConfig;
  
  // Participants
  requester: ReviewParticipant;
  reviewers: ReviewParticipant[];
  approvers: ReviewParticipant[];
  
  // Review Content
  reviewItems: ReviewItem[];
  criteria: ReviewCriteria[];
  
  // Status & Progress
  status: ReviewStatus;
  progress: ReviewProgress;
  
  // Results
  results: ReviewResult[];
  decision: ReviewDecision;
  
  // Comments & Feedback
  comments: ReviewComment[];
  feedback: ReviewFeedback[];
  
  // Timeline
  timeline: ReviewTimeline;
  
  // Metrics
  metrics: ReviewMetrics;
}

// ============================================================================
// COMMUNITY & CROWDSOURCING TYPES
// ============================================================================

export interface CrowdsourcingPlatform {
  id: string;
  name: string;
  
  // Platform Configuration
  config: CrowdsourcingConfig;
  
  // Campaigns
  campaigns: CrowdsourcingCampaign[];
  
  // Contributors
  contributors: CommunityContributor[];
  
  // Contributions
  contributions: CommunityContribution[];
  
  // Incentives & Rewards
  incentives: IncentiveProgram[];
  rewards: RewardSystem;
  
  // Quality Control
  qualityControl: CrowdsourcingQualityControl;
  
  // Analytics
  analytics: CrowdsourcingAnalytics;
  
  // Governance
  governance: CrowdsourcingGovernance;
}

export interface CommunityContributor {
  id: string;
  userId: string;
  
  // Profile Information
  profile: ContributorProfile;
  
  // Reputation
  reputation: ContributorReputation;
  
  // Expertise
  expertise: ContributorExpertise[];
  
  // Contributions
  contributions: CommunityContribution[];
  contributionStats: ContributionStats;
  
  // Rewards & Recognition
  rewards: ContributorReward[];
  badges: ContributorBadge[];
  
  // Activity
  activity: ContributorActivity;
  
  // Status
  status: ContributorStatus;
}

export interface ExpertNetworking {
  id: string;
  name: string;
  
  // Network Configuration
  config: ExpertNetworkConfig;
  
  // Experts
  experts: DomainExpert[];
  
  // Expertise Domains
  domains: ExpertiseDomain[];
  
  // Consultation Requests
  consultationRequests: ConsultationRequest[];
  
  // Knowledge Exchange
  knowledgeExchange: KnowledgeExchangeSession[];
  
  // Matching Algorithm
  matchingAlgorithm: ExpertMatchingAlgorithm;
  
  // Analytics
  analytics: ExpertNetworkAnalytics;
  
  // Quality Assurance
  qualityAssurance: ExpertQualityAssurance;
}

export interface DomainExpert {
  id: string;
  userId: string;
  
  // Expert Profile
  profile: ExpertProfile;
  
  // Expertise
  expertiseDomains: ExpertiseDomain[];
  expertiseLevel: ExpertiseLevel;
  
  // Credentials
  credentials: ExpertCredential[];
  certifications: ExpertCertification[];
  
  // Availability
  availability: ExpertAvailability;
  
  // Performance
  performance: ExpertPerformance;
  
  // Consultation History
  consultationHistory: ConsultationHistory[];
  
  // Reputation
  reputation: ExpertReputation;
  
  // Status
  status: ExpertStatus;
}

// ============================================================================
// KNOWLEDGE SHARING TYPES
// ============================================================================

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  
  // Knowledge Base Configuration
  config: KnowledgeBaseConfig;
  
  // Content Organization
  categories: KnowledgeCategory[];
  topics: KnowledgeTopic[];
  
  // Knowledge Items
  articles: KnowledgeArticle[];
  tutorials: KnowledgeTutorial[];
  faqs: KnowledgeFAQ[];
  
  // Content Management
  contentManagement: KnowledgeContentManagement;
  
  // Search & Discovery
  searchConfig: KnowledgeSearchConfig;
  
  // Collaboration
  collaboration: KnowledgeCollaboration;
  
  // Analytics
  analytics: KnowledgeAnalytics;
  
  // Quality Control
  qualityControl: KnowledgeQualityControl;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  
  // Metadata
  metadata: ArticleMetadata;
  
  // Organization
  category: KnowledgeCategory;
  topics: KnowledgeTopic[];
  tags: string[];
  
  // Authors & Contributors
  authors: ArticleAuthor[];
  contributors: ArticleContributor[];
  
  // Related Content
  relatedAssets: string[];
  relatedArticles: string[];
  
  // Lifecycle
  status: ArticleStatus;
  version: string;
  history: ArticleHistory[];
  
  // Quality & Approval
  qualityScore: number;
  approvalStatus: ApprovalStatus;
  
  // Usage & Feedback
  usage: ArticleUsage;
  feedback: ArticleFeedback[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CommunityForum {
  id: string;
  name: string;
  description?: string;
  
  // Forum Configuration
  config: ForumConfig;
  
  // Forum Structure
  categories: ForumCategory[];
  topics: ForumTopic[];
  
  // Discussions
  discussions: ForumDiscussion[];
  
  // Members
  members: ForumMember[];
  moderators: ForumModerator[];
  
  // Moderation
  moderation: ForumModeration;
  
  // Analytics
  analytics: ForumAnalytics;
  
  // Gamification
  gamification: ForumGamification;
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum TeamType {
  DATA_STEWARDSHIP = 'DATA_STEWARDSHIP',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  COMPLIANCE = 'COMPLIANCE',
  ANALYTICS = 'ANALYTICS',
  ENGINEERING = 'ENGINEERING',
  BUSINESS = 'BUSINESS',
  CROSS_FUNCTIONAL = 'CROSS_FUNCTIONAL'
}

export enum TeamPurpose {
  ASSET_MANAGEMENT = 'ASSET_MANAGEMENT',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
  COMPLIANCE_MONITORING = 'COMPLIANCE_MONITORING',
  INNOVATION = 'INNOVATION',
  OPERATIONAL_SUPPORT = 'OPERATIONAL_SUPPORT',
  STRATEGIC_PLANNING = 'STRATEGIC_PLANNING'
}

export enum WorkspaceType {
  PROJECT = 'PROJECT',
  DOMAIN = 'DOMAIN',
  TEMPORARY = 'TEMPORARY',
  PERMANENT = 'PERMANENT',
  INITIATIVE = 'INITIATIVE'
}

export enum WorkspaceVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  RESTRICTED = 'RESTRICTED',
  TEAM_ONLY = 'TEAM_ONLY'
}

export enum AnnotationTargetType {
  ASSET = 'ASSET',
  COLUMN = 'COLUMN',
  SCHEMA = 'SCHEMA',
  BUSINESS_TERM = 'BUSINESS_TERM',
  RELATIONSHIP = 'RELATIONSHIP',
  TRANSFORMATION = 'TRANSFORMATION'
}

export enum AnnotationType {
  COMMENT = 'COMMENT',
  DOCUMENTATION = 'DOCUMENTATION',
  BUSINESS_CONTEXT = 'BUSINESS_CONTEXT',
  TECHNICAL_NOTE = 'TECHNICAL_NOTE',
  QUALITY_NOTE = 'QUALITY_NOTE',
  COMPLIANCE_NOTE = 'COMPLIANCE_NOTE',
  WARNING = 'WARNING',
  RECOMMENDATION = 'RECOMMENDATION'
}

export enum AnnotationStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

export enum ReviewType {
  QUALITY_REVIEW = 'QUALITY_REVIEW',
  COMPLIANCE_REVIEW = 'COMPLIANCE_REVIEW',
  BUSINESS_REVIEW = 'BUSINESS_REVIEW',
  TECHNICAL_REVIEW = 'TECHNICAL_REVIEW',
  METADATA_REVIEW = 'METADATA_REVIEW',
  CLASSIFICATION_REVIEW = 'CLASSIFICATION_REVIEW'
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum ExpertiseLevel {
  NOVICE = 'NOVICE',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  THOUGHT_LEADER = 'THOUGHT_LEADER'
}

export enum ContributorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  PROBATION = 'PROBATION'
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  DEPRECATED = 'DEPRECATED'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION'
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface CollaborationMember {
  userId: string;
  name: string;
  email: string;
  role: CollaborationRole;
  permissions: CollaborationPermissions;
  joinedAt: Date;
  lastActive: Date;
}

export interface CollaborationActivity {
  id: string;
  type: ActivityType;
  userId: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: ChannelType;
  participants: string[];
  messages: ChannelMessage[];
  settings: ChannelSettings;
}

export interface TeamMember {
  userId: string;
  role: TeamMemberRole;
  permissions: TeamMemberPermissions;
  responsibilities: string[];
  expertise: string[];
  joinedAt: Date;
}

export interface StewardResponsibility {
  id: string;
  name: string;
  description: string;
  scope: ResponsibilityScope;
  priority: ResponsibilityPriority;
  metrics: ResponsibilityMetrics;
}

export interface ReviewItem {
  id: string;
  type: ReviewItemType;
  content: any;
  criteria: ReviewCriteria;
  result: ReviewItemResult;
  comments: string[];
}

export interface CommunityContribution {
  id: string;
  contributorId: string;
  type: ContributionType;
  content: any;
  quality: ContributionQuality;
  impact: ContributionImpact;
  recognition: ContributionRecognition;
  timestamp: Date;
}

export interface ConsultationRequest {
  id: string;
  requesterId: string;
  expertId?: string;
  topic: string;
  description: string;
  urgency: ConsultationUrgency;
  status: ConsultationStatus;
  outcome: ConsultationOutcome;
  feedback: ConsultationFeedback;
}

export interface AnnotationContent {
  text: string;
  format: ContentFormat;
  attachments: Attachment[];
  links: ContentLink[];
  mentions: ContentMention[];
}

export enum CollaborationRole {
  VIEWER = 'VIEWER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  MODERATOR = 'MODERATOR',
  ADMINISTRATOR = 'ADMINISTRATOR',
  OWNER = 'OWNER'
}

export enum ActivityType {
  ASSET_VIEW = 'ASSET_VIEW',
  ASSET_EDIT = 'ASSET_EDIT',
  COMMENT_ADD = 'COMMENT_ADD',
  ANNOTATION_CREATE = 'ANNOTATION_CREATE',
  REVIEW_SUBMIT = 'REVIEW_SUBMIT',
  COLLABORATION_JOIN = 'COLLABORATION_JOIN',
  KNOWLEDGE_SHARE = 'KNOWLEDGE_SHARE'
}

export enum ChannelType {
  DISCUSSION = 'DISCUSSION',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',
  GROUP_CHAT = 'GROUP_CHAT',
  NOTIFICATION = 'NOTIFICATION'
}

export enum ContributionType {
  ANNOTATION = 'ANNOTATION',
  DOCUMENTATION = 'DOCUMENTATION',
  QUALITY_IMPROVEMENT = 'QUALITY_IMPROVEMENT',
  CLASSIFICATION = 'CLASSIFICATION',
  RELATIONSHIP_MAPPING = 'RELATIONSHIP_MAPPING',
  REVIEW = 'REVIEW'
}

export enum ConsultationUrgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum ConsultationStatus {
  REQUESTED = 'REQUESTED',
  MATCHED = 'MATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ContentFormat {
  PLAIN_TEXT = 'PLAIN_TEXT',
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
  RICH_TEXT = 'RICH_TEXT'
}

// ============================================================================
// MISSING TYPES - ADDED FOR COMPATIBILITY
// ============================================================================

export interface CrowdsourcingCampaign {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  participants: string[];
  contributions: any[];
  startDate: Date;
  endDate: Date;
  goals: string[];
  rewards: any[];
  metrics: any;
}

export interface CollaborationComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: Date;
  replies: CollaborationComment[];
  likes: number;
  dislikes: number;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  steps: WorkflowStep[];
  currentStep: number;
  approvers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: string;
  approvers: string[];
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  requesterId: string;
  approvers: string[];
  workflowId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}