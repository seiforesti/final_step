// ============================================================================
// ADVANCED CATALOG COLLABORATION CONSTANTS - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Constants for catalog collaboration functionality
// ============================================================================

import type {
  TeamType,
  TeamPurpose,
  AnnotationTargetType,
  AnnotationType,
  AnnotationStatus,
  ReviewType,
  ReviewStatus,
  ContributionType,
  ExpertiseLevel
} from '../types/collaboration.types';

// ============================================================================
// COLLABORATION HUB CONSTANTS
// ============================================================================

export const COLLABORATION_HUB_DEFAULTS = {
  GOVERNANCE_ENABLED: true,
  AUTO_APPROVAL_ENABLED: false,
  ESCALATION_ENABLED: true,
  ANALYTICS_ENABLED: true,
  MAX_TEAMS_PER_HUB: 50,
  MAX_MEMBERS_PER_TEAM: 100,
  DEFAULT_TIMEOUT: 30000,
  REFRESH_INTERVAL: 30000,
} as const;

export const COLLABORATION_HUB_FEATURES = {
  TEAM_MANAGEMENT: 'team_management',
  DATA_STEWARDSHIP: 'data_stewardship',
  ANNOTATION_SYSTEM: 'annotation_system',
  REVIEW_WORKFLOWS: 'review_workflows',
  CROWDSOURCING: 'crowdsourcing',
  EXPERT_NETWORKING: 'expert_networking',
  KNOWLEDGE_BASE: 'knowledge_base',
  COMMUNITY_FORUM: 'community_forum',
} as const;

export const COLLABORATION_HUB_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  ARCHIVED: 'archived',
} as const;

// ============================================================================
// TEAM COLLABORATION CONSTANTS
// ============================================================================

export const TEAM_TYPES: Record<string, TeamType> = {
  DATA_STEWARDSHIP: 'data_stewardship',
  GOVERNANCE: 'governance',
  QUALITY_ASSURANCE: 'quality_assurance',
  METADATA_MANAGEMENT: 'metadata_management',
  COMPLIANCE: 'compliance',
  ANALYTICS: 'analytics',
  TECHNICAL: 'technical',
  BUSINESS: 'business',
} as const;

export const TEAM_PURPOSES: Record<string, TeamPurpose> = {
  ASSET_GOVERNANCE: 'asset_governance',
  QUALITY_MONITORING: 'quality_monitoring',
  METADATA_ENRICHMENT: 'metadata_enrichment',
  COMPLIANCE_REVIEW: 'compliance_review',
  KNOWLEDGE_SHARING: 'knowledge_sharing',
  ISSUE_RESOLUTION: 'issue_resolution',
  PROCESS_IMPROVEMENT: 'process_improvement',
  TRAINING: 'training',
} as const;

export const TEAM_ROLES = {
  ADMIN: 'admin',
  LEAD: 'lead',
  MEMBER: 'member',
  CONTRIBUTOR: 'contributor',
  OBSERVER: 'observer',
} as const;

export const TEAM_PERMISSIONS = {
  CREATE_ASSETS: 'create_assets',
  EDIT_ASSETS: 'edit_assets',
  DELETE_ASSETS: 'delete_assets',
  MANAGE_METADATA: 'manage_metadata',
  APPROVE_CHANGES: 'approve_changes',
  MANAGE_MEMBERS: 'manage_members',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
} as const;

// ============================================================================
// DATA STEWARDSHIP CONSTANTS
// ============================================================================

export const STEWARDSHIP_ROLES = {
  CHIEF_DATA_STEWARD: 'chief_data_steward',
  DOMAIN_STEWARD: 'domain_steward',
  DATA_CUSTODIAN: 'data_custodian',
  DATA_OWNER: 'data_owner',
  TECHNICAL_STEWARD: 'technical_steward',
  BUSINESS_STEWARD: 'business_steward',
} as const;

export const STEWARDSHIP_RESPONSIBILITIES = {
  DATA_QUALITY: 'data_quality',
  METADATA_MANAGEMENT: 'metadata_management',
  ACCESS_CONTROL: 'access_control',
  COMPLIANCE_MONITORING: 'compliance_monitoring',
  ISSUE_RESOLUTION: 'issue_resolution',
  DOCUMENTATION: 'documentation',
  TRAINING: 'training',
  GOVERNANCE_POLICY: 'governance_policy',
} as const;

export const STEWARDSHIP_WORKFLOW_STATES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  ESCALATED: 'escalated',
} as const;

// ============================================================================
// ANNOTATION SYSTEM CONSTANTS
// ============================================================================

export const ANNOTATION_TARGET_TYPES: Record<string, AnnotationTargetType> = {
  ASSET: 'asset',
  SCHEMA: 'schema',
  COLUMN: 'column',
  LINEAGE: 'lineage',
  QUALITY_RULE: 'quality_rule',
  POLICY: 'policy',
  WORKFLOW: 'workflow',
  DASHBOARD: 'dashboard',
} as const;

export const ANNOTATION_TYPES: Record<string, AnnotationType> = {
  COMMENT: 'comment',
  ISSUE: 'issue',
  SUGGESTION: 'suggestion',
  APPROVAL: 'approval',
  REJECTION: 'rejection',
  DOCUMENTATION: 'documentation',
  BUSINESS_CONTEXT: 'business_context',
  TECHNICAL_NOTE: 'technical_note',
} as const;

export const ANNOTATION_STATUSES: Record<string, AnnotationStatus> = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
  PENDING: 'pending',
} as const;

export const ANNOTATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const ANNOTATION_CATEGORIES = {
  DATA_QUALITY: 'data_quality',
  BUSINESS_LOGIC: 'business_logic',
  TECHNICAL_DEBT: 'technical_debt',
  COMPLIANCE: 'compliance',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  DOCUMENTATION: 'documentation',
  GENERAL: 'general',
} as const;

// ============================================================================
// REVIEW WORKFLOW CONSTANTS
// ============================================================================

export const REVIEW_TYPES: Record<string, ReviewType> = {
  ASSET_APPROVAL: 'asset_approval',
  METADATA_REVIEW: 'metadata_review',
  QUALITY_ASSESSMENT: 'quality_assessment',
  COMPLIANCE_CHECK: 'compliance_check',
  CHANGE_APPROVAL: 'change_approval',
  DOCUMENTATION_REVIEW: 'documentation_review',
  ACCESS_REQUEST: 'access_request',
  POLICY_REVIEW: 'policy_review',
} as const;

export const REVIEW_STATUSES: Record<string, ReviewStatus> = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CHANGES_REQUESTED: 'changes_requested',
  ESCALATED: 'escalated',
  CANCELLED: 'cancelled',
} as const;

export const REVIEW_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const REVIEW_DEADLINES = {
  STANDARD: 7, // days
  URGENT: 2, // days
  CRITICAL: 1, // days
  ESCALATION_THRESHOLD: 3, // days overdue
} as const;

// ============================================================================
// CROWDSOURCING CONSTANTS
// ============================================================================

export const CONTRIBUTION_TYPES: Record<string, ContributionType> = {
  METADATA_ENHANCEMENT: 'metadata_enhancement',
  QUALITY_FEEDBACK: 'quality_feedback',
  BUSINESS_GLOSSARY: 'business_glossary',
  DOCUMENTATION: 'documentation',
  TAGGING: 'tagging',
  CLASSIFICATION: 'classification',
  ISSUE_REPORTING: 'issue_reporting',
  SUGGESTION: 'suggestion',
} as const;

export const CROWDSOURCING_CAMPAIGN_TYPES = {
  METADATA_ENRICHMENT: 'metadata_enrichment',
  QUALITY_VALIDATION: 'quality_validation',
  BUSINESS_GLOSSARY_BUILD: 'business_glossary_build',
  ASSET_CLASSIFICATION: 'asset_classification',
  DOCUMENTATION_IMPROVEMENT: 'documentation_improvement',
  ISSUE_DISCOVERY: 'issue_discovery',
} as const;

export const CROWDSOURCING_INCENTIVES = {
  POINTS: 'points',
  BADGES: 'badges',
  LEADERBOARD: 'leaderboard',
  RECOGNITION: 'recognition',
  REWARDS: 'rewards',
} as const;

export const CONTRIBUTION_REWARDS = {
  BRONZE: { points: 10, badge: 'bronze_contributor' },
  SILVER: { points: 25, badge: 'silver_contributor' },
  GOLD: { points: 50, badge: 'gold_contributor' },
  PLATINUM: { points: 100, badge: 'platinum_contributor' },
} as const;

// ============================================================================
// EXPERT NETWORKING CONSTANTS
// ============================================================================

export const EXPERTISE_LEVELS: Record<string, ExpertiseLevel> = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  THOUGHT_LEADER: 'thought_leader',
} as const;

export const EXPERTISE_DOMAINS = {
  DATA_MODELING: 'data_modeling',
  DATA_WAREHOUSING: 'data_warehousing',
  DATA_LAKES: 'data_lakes',
  MACHINE_LEARNING: 'machine_learning',
  BUSINESS_INTELLIGENCE: 'business_intelligence',
  DATA_GOVERNANCE: 'data_governance',
  DATA_QUALITY: 'data_quality',
  DATA_SECURITY: 'data_security',
  COMPLIANCE: 'compliance',
  ANALYTICS: 'analytics',
} as const;

export const CONSULTATION_TYPES = {
  QUICK_QUESTION: 'quick_question',
  DETAILED_REVIEW: 'detailed_review',
  ARCHITECTURE_GUIDANCE: 'architecture_guidance',
  BEST_PRACTICES: 'best_practices',
  TROUBLESHOOTING: 'troubleshooting',
  TRAINING: 'training',
} as const;

export const CONSULTATION_PRIORITIES = {
  LOW: { responseTime: 48, escalationTime: 72 }, // hours
  MEDIUM: { responseTime: 24, escalationTime: 48 },
  HIGH: { responseTime: 8, escalationTime: 24 },
  URGENT: { responseTime: 2, escalationTime: 8 },
} as const;

// ============================================================================
// KNOWLEDGE BASE CONSTANTS
// ============================================================================

export const KNOWLEDGE_CATEGORIES = {
  GETTING_STARTED: 'getting_started',
  BEST_PRACTICES: 'best_practices',
  TROUBLESHOOTING: 'troubleshooting',
  API_DOCUMENTATION: 'api_documentation',
  TUTORIALS: 'tutorials',
  FAQ: 'faq',
  GOVERNANCE_POLICIES: 'governance_policies',
  DATA_DICTIONARY: 'data_dictionary',
} as const;

export const ARTICLE_TYPES = {
  GUIDE: 'guide',
  TUTORIAL: 'tutorial',
  REFERENCE: 'reference',
  FAQ: 'faq',
  POLICY: 'policy',
  CASE_STUDY: 'case_study',
  ANNOUNCEMENT: 'announcement',
  BLOG_POST: 'blog_post',
} as const;

export const ARTICLE_STATUSES = {
  DRAFT: 'draft',
  REVIEW: 'review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  OUTDATED: 'outdated',
} as const;

export const CONTENT_FORMATS = {
  MARKDOWN: 'markdown',
  HTML: 'html',
  RICH_TEXT: 'rich_text',
  VIDEO: 'video',
  AUDIO: 'audio',
  PRESENTATION: 'presentation',
  DOCUMENT: 'document',
} as const;

// ============================================================================
// ANALYTICS AND METRICS CONSTANTS
// ============================================================================

export const COLLABORATION_METRICS = {
  ACTIVE_USERS: 'active_users',
  TEAM_PARTICIPATION: 'team_participation',
  ANNOTATION_COUNT: 'annotation_count',
  REVIEW_COMPLETION_RATE: 'review_completion_rate',
  CONTRIBUTION_VOLUME: 'contribution_volume',
  EXPERT_RESPONSE_TIME: 'expert_response_time',
  KNOWLEDGE_ARTICLE_VIEWS: 'knowledge_article_views',
  ISSUE_RESOLUTION_TIME: 'issue_resolution_time',
} as const;

export const TIME_PERIODS = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const;

export const ANALYTICS_DIMENSIONS = {
  USER: 'user',
  TEAM: 'team',
  DOMAIN: 'domain',
  ASSET_TYPE: 'asset_type',
  ACTIVITY_TYPE: 'activity_type',
  TIME: 'time',
} as const;

// ============================================================================
// NOTIFICATION CONSTANTS
// ============================================================================

export const NOTIFICATION_TYPES = {
  MENTION: 'mention',
  ASSIGNMENT: 'assignment',
  REVIEW_REQUEST: 'review_request',
  REVIEW_COMPLETE: 'review_complete',
  COMMENT_REPLY: 'comment_reply',
  ESCALATION: 'escalation',
  DEADLINE_REMINDER: 'deadline_reminder',
  SYSTEM_ALERT: 'system_alert',
} as const;

export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SLACK: 'slack',
  TEAMS: 'teams',
  WEBHOOK: 'webhook',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const COLLABORATION_ENDPOINTS = {
  // Hub endpoints
  HUBS: '/catalog/collaboration/hubs',
  HUB_DETAIL: '/catalog/collaboration/hubs/:id',
  
  // Team endpoints
  TEAMS: '/catalog/collaboration/teams',
  TEAM_DETAIL: '/catalog/collaboration/teams/:id',
  TEAM_MEMBERS: '/catalog/collaboration/teams/:id/members',
  
  // Stewardship endpoints
  STEWARDSHIP_CENTERS: '/catalog/collaboration/stewardship',
  STEWARDS: '/catalog/collaboration/stewards',
  STEWARD_ASSIGNMENTS: '/catalog/collaboration/stewards/assignments',
  
  // Annotation endpoints
  ANNOTATIONS: '/catalog/collaboration/annotations',
  ANNOTATION_DETAIL: '/catalog/collaboration/annotations/:id',
  ASSET_ANNOTATIONS: '/catalog/collaboration/annotations/asset/:assetId',
  
  // Review endpoints
  REVIEWS: '/catalog/collaboration/reviews',
  REVIEW_DETAIL: '/catalog/collaboration/reviews/:id',
  REVIEW_COMMENTS: '/catalog/collaboration/reviews/:id/comments',
  
  // Crowdsourcing endpoints
  CAMPAIGNS: '/catalog/collaboration/crowdsourcing/campaigns',
  CONTRIBUTIONS: '/catalog/collaboration/crowdsourcing/contributions',
  
  // Expert networking endpoints
  EXPERT_CONSULTATION: '/catalog/collaboration/expert-consultation',
  CONSULTATION_REQUESTS: '/catalog/collaboration/expert-consultation/requests',
  
  // Knowledge base endpoints
  KNOWLEDGE_ARTICLES: '/catalog/collaboration/knowledge',
  ARTICLE_CATEGORIES: '/catalog/collaboration/knowledge/categories',
  
  // Analytics endpoints
  ANALYTICS: '/catalog/collaboration/analytics/hubs/:hubId',
  INSIGHTS: '/catalog/collaboration/insights/hubs/:hubId',
  COMPLIANCE: '/catalog/collaboration/governance/compliance/:hubId',
  INTEGRATION_STATUS: '/catalog/collaboration/status/integration/:hubId',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const COLLABORATION_ERRORS = {
  HUB_NOT_FOUND: 'Collaboration hub not found',
  TEAM_NOT_FOUND: 'Team not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this operation',
  INVALID_ANNOTATION_TARGET: 'Invalid annotation target type',
  REVIEW_ALREADY_EXISTS: 'Review already exists for this asset',
  EXPERT_NOT_AVAILABLE: 'Expert is not available for consultation',
  ARTICLE_NOT_PUBLISHED: 'Article is not published',
  CAMPAIGN_ENDED: 'Crowdsourcing campaign has ended',
  CONTRIBUTION_REJECTED: 'Contribution was rejected',
  STEWARD_ASSIGNMENT_CONFLICT: 'Data steward assignment conflict',
} as const;

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_COLLABORATION_CONFIG = {
  hubDefaults: COLLABORATION_HUB_DEFAULTS,
  teamLimits: {
    maxTeamsPerHub: 50,
    maxMembersPerTeam: 100,
    maxRolesPerMember: 5,
  },
  annotationLimits: {
    maxAnnotationsPerAsset: 1000,
    maxAttachmentsPerAnnotation: 10,
    maxAnnotationLength: 5000,
  },
  reviewLimits: {
    maxReviewersPerReview: 10,
    maxCommentsPerReview: 500,
    defaultReviewDays: 7,
  },
  crowdsourcingLimits: {
    maxCampaignsPerHub: 20,
    maxContributionsPerUser: 100,
    maxRewardPointsPerDay: 500,
  },
  expertNetworkingLimits: {
    maxConsultationsPerExpert: 10,
    maxConsultationsPerUser: 5,
    responseTimeHours: 24,
  },
  knowledgeBaseLimits: {
    maxArticlesPerCategory: 1000,
    maxCategoriesPerHub: 50,
    maxArticleLength: 50000,
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  COLLABORATION_HUB_DEFAULTS,
  COLLABORATION_HUB_FEATURES,
  COLLABORATION_HUB_STATUSES,
  TEAM_TYPES,
  TEAM_PURPOSES,
  TEAM_ROLES,
  TEAM_PERMISSIONS,
  STEWARDSHIP_ROLES,
  STEWARDSHIP_RESPONSIBILITIES,
  STEWARDSHIP_WORKFLOW_STATES,
  ANNOTATION_TARGET_TYPES,
  ANNOTATION_TYPES,
  ANNOTATION_STATUSES,
  ANNOTATION_PRIORITIES,
  ANNOTATION_CATEGORIES,
  REVIEW_TYPES,
  REVIEW_STATUSES,
  REVIEW_PRIORITIES,
  REVIEW_DEADLINES,
  CONTRIBUTION_TYPES,
  CROWDSOURCING_CAMPAIGN_TYPES,
  CROWDSOURCING_INCENTIVES,
  CONTRIBUTION_REWARDS,
  EXPERTISE_LEVELS,
  EXPERTISE_DOMAINS,
  CONSULTATION_TYPES,
  CONSULTATION_PRIORITIES,
  KNOWLEDGE_CATEGORIES,
  ARTICLE_TYPES,
  ARTICLE_STATUSES,
  CONTENT_FORMATS,
  COLLABORATION_METRICS,
  TIME_PERIODS,
  ANALYTICS_DIMENSIONS,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIORITIES,
  COLLABORATION_ENDPOINTS,
  COLLABORATION_ERRORS,
  DEFAULT_COLLABORATION_CONFIG,
};