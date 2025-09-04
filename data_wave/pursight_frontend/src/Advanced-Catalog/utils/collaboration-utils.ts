// ============================================================================
// ADVANCED CATALOG COLLABORATION UTILITIES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Utility functions for catalog collaboration functionality
// ============================================================================

import type {
  CatalogCollaborationHub,
  CollaborationTeam,
  DataStewardshipCenter,
  DataAnnotation,
  AssetReview,
  CrowdsourcingCampaign,
  ConsultationRequest,
  KnowledgeArticle,
  CollaborationActivity,
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

import {
  TEAM_TYPES,
  TEAM_PURPOSES,
  ANNOTATION_TYPES,
  ANNOTATION_STATUSES,
  REVIEW_TYPES,
  REVIEW_STATUSES,
  CONTRIBUTION_TYPES,
  EXPERTISE_LEVELS,
  REVIEW_DEADLINES,
  CONSULTATION_PRIORITIES,
  COLLABORATION_METRICS,
  COLLABORATION_ERRORS
} from '../constants/collaboration-constants';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate collaboration hub configuration
 */
export function validateHubConfig(config: Record<string, any>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.name || config.name.trim().length === 0) {
    errors.push('Hub name is required');
  }

  if (config.name && config.name.length > 100) {
    errors.push('Hub name must be less than 100 characters');
  }

  if (config.maxTeams && (config.maxTeams < 1 || config.maxTeams > 100)) {
    errors.push('Max teams must be between 1 and 100');
  }

  if (config.maxMembersPerTeam && (config.maxMembersPerTeam < 1 || config.maxMembersPerTeam > 500)) {
    errors.push('Max members per team must be between 1 and 500');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate team configuration
 */
export function validateTeamConfig(team: Partial<CollaborationTeam>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!team.name || team.name.trim().length === 0) {
    errors.push('Team name is required');
  }

  if (team.teamType && !Object.values(TEAM_TYPES).includes(team.teamType)) {
    errors.push('Invalid team type');
  }

  if (team.purpose && !Object.values(TEAM_PURPOSES).includes(team.purpose)) {
    errors.push('Invalid team purpose');
  }

  if (team.maxMembers && (team.maxMembers < 1 || team.maxMembers > 500)) {
    errors.push('Max members must be between 1 and 500');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate annotation data
 */
export function validateAnnotation(annotation: Partial<DataAnnotation>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!annotation.content || annotation.content.trim().length === 0) {
    errors.push('Annotation content is required');
  }

  if (annotation.content && annotation.content.length > 5000) {
    errors.push('Annotation content must be less than 5000 characters');
  }

  if (!annotation.targetId || annotation.targetId.trim().length === 0) {
    errors.push('Target ID is required');
  }

  if (annotation.annotationType && !Object.values(ANNOTATION_TYPES).includes(annotation.annotationType)) {
    errors.push('Invalid annotation type');
  }

  if (annotation.status && !Object.values(ANNOTATION_STATUSES).includes(annotation.status)) {
    errors.push('Invalid annotation status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate review data
 */
export function validateReview(review: Partial<AssetReview>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!review.assetId || review.assetId.trim().length === 0) {
    errors.push('Asset ID is required');
  }

  if (!review.reviewType || !Object.values(REVIEW_TYPES).includes(review.reviewType)) {
    errors.push('Valid review type is required');
  }

  if (review.status && !Object.values(REVIEW_STATUSES).includes(review.status)) {
    errors.push('Invalid review status');
  }

  if (review.priority && !['low', 'medium', 'high', 'urgent'].includes(review.priority)) {
    errors.push('Invalid review priority');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format collaboration hub display name
 */
export function formatHubDisplayName(hub: CatalogCollaborationHub): string {
  if (!hub.name) return 'Unnamed Hub';
  
  const name = hub.name.charAt(0).toUpperCase() + hub.name.slice(1);
  const status = hub.isActive ? '' : ' (Inactive)';
  
  return `${name}${status}`;
}

/**
 * Format team display name with type and purpose
 */
export function formatTeamDisplayName(team: CollaborationTeam): string {
  if (!team.name) return 'Unnamed Team';
  
  const name = team.name;
  const type = team.teamType ? ` (${formatTeamType(team.teamType)})` : '';
  
  return `${name}${type}`;
}

/**
 * Format team type for display
 */
export function formatTeamType(teamType: TeamType): string {
  return teamType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format team purpose for display
 */
export function formatTeamPurpose(purpose: TeamPurpose): string {
  return purpose
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format annotation type for display
 */
export function formatAnnotationType(type: AnnotationType): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format review status for display
 */
export function formatReviewStatus(status: ReviewStatus): string {
  switch (status) {
    case 'in_review':
      return 'In Review';
    case 'changes_requested':
      return 'Changes Requested';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}

/**
 * Format expertise level for display
 */
export function formatExpertiseLevel(level: ExpertiseLevel): string {
  switch (level) {
    case 'thought_leader':
      return 'Thought Leader';
    default:
      return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
  }
}

/**
 * Format contribution type for display
 */
export function formatContributionType(type: ContributionType): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format date for collaboration context
 */
export function formatCollaborationDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate review deadline based on type and priority
 */
export function calculateReviewDeadline(
  reviewType: ReviewType,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  createdAt: Date = new Date()
): Date {
  let days = REVIEW_DEADLINES.STANDARD;

  switch (priority) {
    case 'urgent':
      days = REVIEW_DEADLINES.URGENT;
      break;
    case 'high':
      days = REVIEW_DEADLINES.CRITICAL;
      break;
    case 'medium':
      days = REVIEW_DEADLINES.STANDARD;
      break;
    case 'low':
      days = REVIEW_DEADLINES.STANDARD * 2;
      break;
  }

  // Adjust for specific review types
  if (reviewType === 'compliance_check') {
    days = Math.min(days, REVIEW_DEADLINES.CRITICAL);
  } else if (reviewType === 'documentation_review') {
    days = Math.max(days, REVIEW_DEADLINES.STANDARD);
  }

  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}

/**
 * Calculate consultation response time based on priority
 */
export function calculateConsultationResponseTime(
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): { responseTime: number; escalationTime: number } {
  return CONSULTATION_PRIORITIES[priority.toUpperCase() as keyof typeof CONSULTATION_PRIORITIES];
}

/**
 * Calculate team collaboration score
 */
export function calculateTeamCollaborationScore(team: CollaborationTeam, activities: CollaborationActivity[]): number {
  if (!activities.length) return 0;

  const teamActivities = activities.filter(activity => activity.teamId === team.id);
  const totalActivities = teamActivities.length;
  const uniqueMembers = new Set(teamActivities.map(activity => activity.userId)).size;
  const recentActivities = teamActivities.filter(
    activity => new Date(activity.createdAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
  ).length;

  // Score based on total activities (40%), unique member participation (40%), recent activity (20%)
  const activityScore = Math.min(totalActivities / 100, 1) * 0.4;
  const participationScore = Math.min(uniqueMembers / (team.members?.length || 1), 1) * 0.4;
  const recentScore = Math.min(recentActivities / 20, 1) * 0.2;

  return Math.round((activityScore + participationScore + recentScore) * 100);
}

/**
 * Calculate annotation engagement score
 */
export function calculateAnnotationEngagement(annotation: DataAnnotation): number {
  let score = 0;

  // Base score for annotation existence
  score += 10;

  // Score for content quality (length as proxy)
  if (annotation.content.length > 100) score += 20;
  if (annotation.content.length > 500) score += 10;

  // Score for metadata
  if (annotation.title) score += 10;
  if (annotation.category) score += 10;
  if (annotation.tags && annotation.tags.length > 0) score += annotation.tags.length * 5;

  // Score for interactions (replies, votes if available)
  if (annotation.metadata?.replies) score += annotation.metadata.replies * 5;
  if (annotation.metadata?.votes) score += annotation.metadata.votes * 2;

  // Bonus for resolved issues
  if (annotation.annotationType === 'issue' && annotation.status === 'resolved') {
    score += 30;
  }

  return Math.min(score, 100);
}

// ============================================================================
// TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform raw collaboration data for display
 */
export function transformHubForDisplay(hub: CatalogCollaborationHub): {
  id: number;
  name: string;
  displayName: string;
  status: string;
  statusColor: string;
  teamsCount: number;
  membersCount: number;
  lastActivity: string;
  features: string[];
} {
  return {
    id: hub.id!,
    name: hub.name,
    displayName: formatHubDisplayName(hub),
    status: hub.isActive ? 'Active' : 'Inactive',
    statusColor: hub.isActive ? 'green' : 'gray',
    teamsCount: hub.teams?.length || 0,
    membersCount: hub.teams?.reduce((total, team) => total + (team.members?.length || 0), 0) || 0,
    lastActivity: hub.updatedAt ? formatCollaborationDate(hub.updatedAt) : 'Never',
    features: Object.keys(hub.config?.features || {}).filter(key => hub.config?.features[key])
  };
}

/**
 * Transform team data for display
 */
export function transformTeamForDisplay(team: CollaborationTeam): {
  id: number;
  name: string;
  displayName: string;
  type: string;
  purpose: string;
  membersCount: number;
  isActive: boolean;
  lastActivity: string;
  roles: string[];
} {
  return {
    id: team.id!,
    name: team.name,
    displayName: formatTeamDisplayName(team),
    type: formatTeamType(team.teamType),
    purpose: formatTeamPurpose(team.purpose),
    membersCount: team.members?.length || 0,
    isActive: team.isActive,
    lastActivity: team.updatedAt ? formatCollaborationDate(team.updatedAt) : 'Never',
    roles: team.members?.map(member => member.role).filter((role, index, self) => self.indexOf(role) === index) || []
  };
}

/**
 * Transform annotation data for display
 */
export function transformAnnotationForDisplay(annotation: DataAnnotation): {
  id: number;
  content: string;
  shortContent: string;
  type: string;
  status: string;
  statusColor: string;
  priority: string;
  priorityColor: string;
  author: string;
  createdAt: string;
  engagement: number;
  hasAttachments: boolean;
} {
  const statusColors = {
    active: 'blue',
    resolved: 'green',
    archived: 'gray',
    pending: 'yellow'
  };

  const priorityColors = {
    low: 'gray',
    medium: 'yellow',
    high: 'orange',
    critical: 'red'
  };

  return {
    id: annotation.id!,
    content: annotation.content,
    shortContent: annotation.content.length > 150 ? 
      annotation.content.substring(0, 150) + '...' : annotation.content,
    type: formatAnnotationType(annotation.annotationType),
    status: annotation.status.charAt(0).toUpperCase() + annotation.status.slice(1),
    statusColor: statusColors[annotation.status] || 'gray',
    priority: annotation.metadata?.priority || 'medium',
    priorityColor: priorityColors[annotation.metadata?.priority as keyof typeof priorityColors] || 'gray',
    author: annotation.authorName,
    createdAt: formatCollaborationDate(annotation.createdAt),
    engagement: calculateAnnotationEngagement(annotation),
    hasAttachments: !!(annotation.metadata?.attachments && annotation.metadata.attachments.length > 0)
  };
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Generate collaboration activity summary
 */
export function generateActivitySummary(activities: CollaborationActivity[], timeframe: 'day' | 'week' | 'month' = 'week'): {
  totalActivities: number;
  uniqueUsers: number;
  topActivities: Array<{ type: string; count: number }>;
  trendDirection: 'up' | 'down' | 'stable';
} {
  const timeframeDays = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
  const cutoffDate = new Date(Date.now() - (timeframeDays * 24 * 60 * 60 * 1000));
  
  const recentActivities = activities.filter(activity => 
    new Date(activity.createdAt) >= cutoffDate
  );

  const uniqueUsers = new Set(recentActivities.map(activity => activity.userId)).size;
  
  const activityCounts = recentActivities.reduce((counts, activity) => {
    counts[activity.activityType] = (counts[activity.activityType] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const topActivities = Object.entries(activityCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Simple trend calculation (compare to previous period)
  const previousPeriodStart = new Date(cutoffDate.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
  const previousActivities = activities.filter(activity => 
    new Date(activity.createdAt) >= previousPeriodStart && 
    new Date(activity.createdAt) < cutoffDate
  );

  let trendDirection: 'up' | 'down' | 'stable' = 'stable';
  if (recentActivities.length > previousActivities.length * 1.1) {
    trendDirection = 'up';
  } else if (recentActivities.length < previousActivities.length * 0.9) {
    trendDirection = 'down';
  }

  return {
    totalActivities: recentActivities.length,
    uniqueUsers,
    topActivities,
    trendDirection
  };
}

/**
 * Check if user has permission for collaboration action
 */
export function hasCollaborationPermission(
  userRole: string,
  action: string,
  context: 'hub' | 'team' | 'annotation' | 'review' = 'team'
): boolean {
  const permissions = {
    admin: {
      hub: ['create', 'edit', 'delete', 'manage_teams', 'manage_members', 'view_analytics'],
      team: ['create', 'edit', 'delete', 'manage_members', 'approve', 'review'],
      annotation: ['create', 'edit', 'delete', 'moderate'],
      review: ['create', 'edit', 'delete', 'approve', 'assign_reviewers']
    },
    lead: {
      hub: ['view_analytics'],
      team: ['create', 'edit', 'manage_members', 'approve'],
      annotation: ['create', 'edit', 'moderate'],
      review: ['create', 'edit', 'approve']
    },
    member: {
      hub: [],
      team: ['view'],
      annotation: ['create', 'edit'],
      review: ['create', 'comment']
    },
    contributor: {
      hub: [],
      team: ['view'],
      annotation: ['create'],
      review: ['comment']
    },
    observer: {
      hub: [],
      team: ['view'],
      annotation: ['view'],
      review: ['view']
    }
  };

  const userPermissions = permissions[userRole as keyof typeof permissions];
  if (!userPermissions) return false;

  const contextPermissions = userPermissions[context];
  return contextPermissions.includes(action);
}

/**
 * Generate unique collaboration ID
 */
export function generateCollaborationId(prefix: string = 'collab'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Sanitize collaboration content
 */
export function sanitizeCollaborationContent(content: string): string {
  // Remove HTML tags
  const withoutHtml = content.replace(/<[^>]*>/g, '');
  
  // Remove excessive whitespace
  const withoutExcessiveWhitespace = withoutHtml.replace(/\s+/g, ' ').trim();
  
  // Limit length
  const maxLength = 5000;
  if (withoutExcessiveWhitespace.length > maxLength) {
    return withoutExcessiveWhitespace.substring(0, maxLength) + '...';
  }
  
  return withoutExcessiveWhitespace;
}

/**
 * Extract mentions from collaboration content
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // Remove duplicates
}

/**
 * Calculate collaboration health score
 */
export function calculateCollaborationHealth(
  hub: CatalogCollaborationHub,
  activities: CollaborationActivity[]
): {
  score: number;
  level: 'poor' | 'fair' | 'good' | 'excellent';
  factors: Array<{ factor: string; score: number; weight: number }>;
} {
  const factors = [
    {
      factor: 'Team Activity',
      score: Math.min((activities.length / 100) * 100, 100),
      weight: 0.3
    },
    {
      factor: 'Member Engagement',
      score: hub.teams ? Math.min((hub.teams.length / 10) * 100, 100) : 0,
      weight: 0.25
    },
    {
      factor: 'Recent Activity',
      score: activities.filter(a => 
        new Date(a.createdAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
      ).length > 0 ? 100 : 0,
      weight: 0.25
    },
    {
      factor: 'Governance',
      score: hub.governanceEnabled ? 100 : 0,
      weight: 0.2
    }
  ];

  const weightedScore = factors.reduce((total, factor) => 
    total + (factor.score * factor.weight), 0
  );

  let level: 'poor' | 'fair' | 'good' | 'excellent';
  if (weightedScore >= 80) level = 'excellent';
  else if (weightedScore >= 60) level = 'good';
  else if (weightedScore >= 40) level = 'fair';
  else level = 'poor';

  return {
    score: Math.round(weightedScore),
    level,
    factors
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const collaborationUtils = {
  // Validation
  validateHubConfig,
  validateTeamConfig,
  validateAnnotation,
  validateReview,
  
  // Formatting
  formatHubDisplayName,
  formatTeamDisplayName,
  formatTeamType,
  formatTeamPurpose,
  formatAnnotationType,
  formatReviewStatus,
  formatExpertiseLevel,
  formatContributionType,
  formatCollaborationDate,
  formatDuration,
  
  // Calculations
  calculateReviewDeadline,
  calculateConsultationResponseTime,
  calculateTeamCollaborationScore,
  calculateAnnotationEngagement,
  
  // Transformations
  transformHubForDisplay,
  transformTeamForDisplay,
  transformAnnotationForDisplay,
  
  // Helpers
  generateActivitySummary,
  hasCollaborationPermission,
  generateCollaborationId,
  sanitizeCollaborationContent,
  extractMentions,
  calculateCollaborationHealth
};

export default collaborationUtils;