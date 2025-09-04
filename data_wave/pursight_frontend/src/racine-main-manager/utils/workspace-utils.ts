/**
 * Workspace Management Utilities
 * ===============================
 * 
 * Comprehensive utility functions for workspace management operations,
 * resource linking, member management, and workspace analytics.
 * These utilities support the workspace management APIs and hooks.
 */

import {
  RacineWorkspace,
  WorkspaceMember,
  SharedResource,
  ResourceDependency,
  WorkspaceAnalytics,
  WorkspaceTemplate,
  UUID
} from '../types/racine-core.types';

// =============================================================================
// WORKSPACE VALIDATION UTILITIES
// =============================================================================

/**
 * Validates workspace configuration
 */
export function validateWorkspaceConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.name || config.name.trim().length === 0) {
    errors.push('Workspace name is required');
  }

  if (config.name && config.name.length > 100) {
    errors.push('Workspace name must be less than 100 characters');
  }

  if (!config.type || !['project', 'environment', 'department', 'temporary'].includes(config.type)) {
    errors.push('Valid workspace type is required');
  }

  if (config.maxMembers && (config.maxMembers < 1 || config.maxMembers > 1000)) {
    errors.push('Max members must be between 1 and 1000');
  }

  if (config.resourceQuota && config.resourceQuota < 0) {
    errors.push('Resource quota cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates workspace member permissions
 */
export function validateMemberPermissions(permissions: string[]): { isValid: boolean; errors: string[] } {
  const validPermissions = [
    'workspace:read',
    'workspace:write',
    'workspace:admin',
    'resources:read',
    'resources:write',
    'resources:link',
    'resources:unlink',
    'members:read',
    'members:invite',
    'members:remove',
    'analytics:read'
  ];

  const errors: string[] = [];
  const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));

  if (invalidPermissions.length > 0) {
    errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`);
  }

  if (permissions.length === 0) {
    errors.push('At least one permission is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates workspace name format and uniqueness
 */
export function validateWorkspaceName(
  name: string,
  existingNames: string[] = []
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if name is provided
  if (!name || name.trim().length === 0) {
    errors.push('Workspace name is required');
  }

  // Check name length
  if (name && name.length > 100) {
    errors.push('Workspace name must be less than 100 characters');
  }

  // Check for minimum length
  if (name && name.trim().length < 3) {
    errors.push('Workspace name must be at least 3 characters long');
  }

  // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
  if (name && !/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    errors.push('Workspace name can only contain letters, numbers, spaces, hyphens, and underscores');
  }

  // Check for reserved words
  const reservedWords = ['admin', 'root', 'system', 'default', 'temp', 'test'];
  if (name && reservedWords.includes(name.toLowerCase())) {
    errors.push('Workspace name cannot be a reserved word');
  }

  // Check for uniqueness (case-insensitive)
  if (name && existingNames.some(existing => existing.toLowerCase() === name.toLowerCase())) {
    errors.push('Workspace name already exists');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// =============================================================================
// WORKSPACE UTILITIES
// =============================================================================

/**
 * Calculates workspace health score based on various metrics
 */
export function calculateWorkspaceHealth(
  workspace: RacineWorkspace,
  analytics?: WorkspaceAnalytics
): { score: number; factors: { name: string; score: number; weight: number }[] } {
  const factors = [
    {
      name: 'Member Activity',
      score: analytics?.memberActivity || 0.7,
      weight: 0.25
    },
    {
      name: 'Resource Utilization',
      score: analytics?.resourceUtilization || 0.8,
      weight: 0.20
    },
    {
      name: 'Collaboration Frequency',
      score: analytics?.collaborationFrequency || 0.6,
      weight: 0.20
    },
    {
      name: 'Security Compliance',
      score: workspace.securityScore || 0.9,
      weight: 0.15
    },
    {
      name: 'Performance',
      score: analytics?.performanceScore || 0.85,
      weight: 0.20
    }
  ];

  const totalScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);

  return {
    score: Math.round(totalScore * 100) / 100,
    factors
  };
}

/**
 * Generates workspace recommendations based on analytics
 */
export function generateWorkspaceRecommendations(
  workspace: RacineWorkspace,
  analytics: WorkspaceAnalytics
): Array<{ type: string; priority: 'high' | 'medium' | 'low'; message: string; action?: string }> {
  const recommendations = [];

  // Low member activity
  if (analytics.memberActivity < 0.3) {
    recommendations.push({
      type: 'engagement',
      priority: 'high' as const,
      message: 'Low member activity detected. Consider organizing team activities or reviewing workspace purpose.',
      action: 'schedule_team_meeting'
    });
  }

  // High resource utilization
  if (analytics.resourceUtilization > 0.9) {
    recommendations.push({
      type: 'resource_management',
      priority: 'high' as const,
      message: 'Resource utilization is very high. Consider upgrading quota or optimizing resource usage.',
      action: 'increase_quota'
    });
  }

  // Low collaboration
  if (analytics.collaborationFrequency < 0.4) {
    recommendations.push({
      type: 'collaboration',
      priority: 'medium' as const,
      message: 'Low collaboration frequency. Enable more collaboration features or provide training.',
      action: 'enable_collaboration_tools'
    });
  }

  // Security concerns
  if (workspace.securityScore < 0.7) {
    recommendations.push({
      type: 'security',
      priority: 'high' as const,
      message: 'Security score is below threshold. Review access permissions and security policies.',
      action: 'security_audit'
    });
  }

  // Performance issues
  if (analytics.performanceScore < 0.6) {
    recommendations.push({
      type: 'performance',
      priority: 'medium' as const,
      message: 'Performance issues detected. Consider optimizing workflows or infrastructure.',
      action: 'performance_optimization'
    });
  }

  return recommendations.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
}

/**
 * Formats workspace for display
 */
export function formatWorkspaceForDisplay(workspace: RacineWorkspace): any {
  return {
    ...workspace,
    formattedCreatedAt: new Date(workspace.createdAt).toLocaleDateString(),
    formattedUpdatedAt: new Date(workspace.updatedAt).toLocaleDateString(),
    memberCountText: `${workspace.memberCount || 0} member${(workspace.memberCount || 0) !== 1 ? 's' : ''}`,
    resourceCountText: `${workspace.resourceCount || 0} resource${(workspace.resourceCount || 0) !== 1 ? 's' : ''}`,
    statusBadge: {
      active: { color: 'green', text: 'Active' },
      archived: { color: 'gray', text: 'Archived' },
      suspended: { color: 'red', text: 'Suspended' }
    }[workspace.status] || { color: 'gray', text: 'Unknown' }
  };
}

// =============================================================================
// RESOURCE MANAGEMENT UTILITIES
// =============================================================================

/**
 * Validates resource linking request
 */
export function validateResourceLink(
  workspaceId: UUID,
  resourceType: string,
  resourceId: UUID,
  existingResources: SharedResource[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workspaceId) {
    errors.push('Workspace ID is required');
  }

  if (!resourceType) {
    errors.push('Resource type is required');
  }

  if (!resourceId) {
    errors.push('Resource ID is required');
  }

  // Check for duplicate links
  const existingLink = existingResources.find(
    r => r.resourceId === resourceId && r.resourceType === resourceType
  );

  if (existingLink) {
    errors.push('Resource is already linked to this workspace');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Analyzes resource dependencies
 */
export function analyzeResourceDependencies(
  resources: SharedResource[],
  dependencies: ResourceDependency[]
): {
  circularDependencies: string[];
  orphanedResources: SharedResource[];
  dependencyChains: Array<{ resource: SharedResource; dependencies: ResourceDependency[] }>;
} {
  const circularDependencies: string[] = [];
  const orphanedResources: SharedResource[] = [];
  const dependencyChains: Array<{ resource: SharedResource; dependencies: ResourceDependency[] }> = [];

  // Find circular dependencies
  const visited = new Set<UUID>();
  const visiting = new Set<UUID>();

  function detectCircular(resourceId: UUID, path: UUID[] = []): boolean {
    if (visiting.has(resourceId)) {
      circularDependencies.push(`Circular dependency detected: ${path.join(' -> ')} -> ${resourceId}`);
      return true;
    }

    if (visited.has(resourceId)) {
      return false;
    }

    visiting.add(resourceId);
    const resourceDeps = dependencies.filter(d => d.sourceResourceId === resourceId);

    for (const dep of resourceDeps) {
      if (detectCircular(dep.targetResourceId, [...path, resourceId])) {
        return true;
      }
    }

    visiting.delete(resourceId);
    visited.add(resourceId);
    return false;
  }

  resources.forEach(resource => {
    detectCircular(resource.id);
  });

  // Find orphaned resources (no dependencies)
  resources.forEach(resource => {
    const hasIncomingDeps = dependencies.some(d => d.targetResourceId === resource.id);
    const hasOutgoingDeps = dependencies.some(d => d.sourceResourceId === resource.id);

    if (!hasIncomingDeps && !hasOutgoingDeps) {
      orphanedResources.push(resource);
    }
  });

  // Build dependency chains
  resources.forEach(resource => {
    const resourceDeps = dependencies.filter(d => d.sourceResourceId === resource.id);
    if (resourceDeps.length > 0) {
      dependencyChains.push({
        resource,
        dependencies: resourceDeps
      });
    }
  });

  return {
    circularDependencies,
    orphanedResources,
    dependencyChains
  };
}

/**
 * Calculates resource utilization metrics
 */
export function calculateResourceUtilization(
  resources: SharedResource[],
  timeRange: { start: string; end: string }
): {
  totalResources: number;
  activeResources: number;
  utilizationRate: number;
  resourcesByType: Record<string, number>;
  accessFrequency: Record<UUID, number>;
} {
  const now = new Date();
  const startDate = new Date(timeRange.start);
  const endDate = new Date(timeRange.end);

  const activeResources = resources.filter(resource => {
    const lastAccessed = new Date(resource.lastAccessedAt || resource.createdAt);
    return lastAccessed >= startDate && lastAccessed <= endDate;
  });

  const resourcesByType = resources.reduce((acc, resource) => {
    acc[resource.resourceType] = (acc[resource.resourceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const accessFrequency = resources.reduce((acc, resource) => {
    // Simulate access frequency calculation
    acc[resource.id] = resource.accessCount || 0;
    return acc;
  }, {} as Record<UUID, number>);

  return {
    totalResources: resources.length,
    activeResources: activeResources.length,
    utilizationRate: resources.length > 0 ? activeResources.length / resources.length : 0,
    resourcesByType,
    accessFrequency
  };
}

// =============================================================================
// MEMBER MANAGEMENT UTILITIES
// =============================================================================

/**
 * Analyzes member activity patterns
 */
export function analyzeMemberActivity(
  members: WorkspaceMember[],
  timeRange: { start: string; end: string }
): {
  activeMembers: number;
  inactiveMembers: number;
  membersByRole: Record<string, number>;
  activityTrend: 'increasing' | 'decreasing' | 'stable';
  engagementScore: number;
} {
  const now = new Date();
  const startDate = new Date(timeRange.start);
  const endDate = new Date(timeRange.end);

  const activeMembers = members.filter(member => {
    const lastActivity = new Date(member.lastActivityAt || member.joinedAt);
    return lastActivity >= startDate && lastActivity <= endDate;
  }).length;

  const membersByRole = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate engagement score based on activity frequency
  const engagementScore = members.reduce((sum, member) => {
    const activityScore = member.activityScore || 0.5;
    return sum + activityScore;
  }, 0) / members.length;

  return {
    activeMembers,
    inactiveMembers: members.length - activeMembers,
    membersByRole,
    activityTrend: 'stable', // Simplified calculation
    engagementScore
  };
}

/**
 * Generates member role recommendations
 */
export function generateRoleRecommendations(
  member: WorkspaceMember,
  workspace: RacineWorkspace
): Array<{ role: string; confidence: number; reason: string }> {
  const recommendations = [];

  // Based on activity level
  if (member.activityScore > 0.8) {
    recommendations.push({
      role: 'admin',
      confidence: 0.9,
      reason: 'High activity level suggests administrative capabilities'
    });
  }

  // Based on tenure
  const tenure = Date.now() - new Date(member.joinedAt).getTime();
  const tenureMonths = tenure / (1000 * 60 * 60 * 24 * 30);

  if (tenureMonths > 6 && member.activityScore > 0.6) {
    recommendations.push({
      role: 'moderator',
      confidence: 0.7,
      reason: 'Long tenure and moderate activity level'
    });
  }

  // Based on collaboration patterns
  if (member.collaborationScore > 0.7) {
    recommendations.push({
      role: 'collaborator',
      confidence: 0.8,
      reason: 'High collaboration score indicates good teamwork'
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

// =============================================================================
// WORKSPACE TEMPLATE UTILITIES
// =============================================================================

/**
 * Validates workspace template
 */
export function validateWorkspaceTemplate(template: WorkspaceTemplate): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }

  if (!template.configuration) {
    errors.push('Template configuration is required');
  }

  if (template.defaultMembers && template.defaultMembers.length > 50) {
    errors.push('Template cannot have more than 50 default members');
  }

  if (template.defaultResources && template.defaultResources.length > 100) {
    errors.push('Template cannot have more than 100 default resources');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Applies template customizations to workspace configuration
 */
export function applyTemplateCustomizations(
  template: WorkspaceTemplate,
  customizations: Record<string, any>
): any {
  const config = { ...template.configuration };

  // Apply basic customizations
  if (customizations.name) {
    config.name = customizations.name;
  }

  if (customizations.description) {
    config.description = customizations.description;
  }

  if (customizations.type) {
    config.type = customizations.type;
  }

  // Apply advanced customizations
  if (customizations.resourceQuota) {
    config.resourceQuota = customizations.resourceQuota;
  }

  if (customizations.maxMembers) {
    config.maxMembers = customizations.maxMembers;
  }

  if (customizations.securitySettings) {
    config.securitySettings = {
      ...config.securitySettings,
      ...customizations.securitySettings
    };
  }

  if (customizations.integrationSettings) {
    config.integrationSettings = {
      ...config.integrationSettings,
      ...customizations.integrationSettings
    };
  }

  return config;
}

// =============================================================================
// SEARCH AND FILTERING UTILITIES
// =============================================================================

/**
 * Filters workspaces based on criteria
 */
export function filterWorkspaces(
  workspaces: RacineWorkspace[],
  filters: {
    search?: string;
    type?: string;
    status?: string;
    owner?: UUID;
    memberCount?: { min?: number; max?: number };
    createdAfter?: string;
    createdBefore?: string;
  }
): RacineWorkspace[] {
  return workspaces.filter(workspace => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = workspace.name.toLowerCase().includes(searchLower);
      const descMatch = workspace.description?.toLowerCase().includes(searchLower);
      if (!nameMatch && !descMatch) return false;
    }

    // Type filter
    if (filters.type && workspace.type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status && workspace.status !== filters.status) {
      return false;
    }

    // Owner filter
    if (filters.owner && workspace.ownerId !== filters.owner) {
      return false;
    }

    // Member count filter
    if (filters.memberCount) {
      const count = workspace.memberCount || 0;
      if (filters.memberCount.min && count < filters.memberCount.min) return false;
      if (filters.memberCount.max && count > filters.memberCount.max) return false;
    }

    // Date filters
    if (filters.createdAfter) {
      const createdAt = new Date(workspace.createdAt);
      const afterDate = new Date(filters.createdAfter);
      if (createdAt < afterDate) return false;
    }

    if (filters.createdBefore) {
      const createdAt = new Date(workspace.createdAt);
      const beforeDate = new Date(filters.createdBefore);
      if (createdAt > beforeDate) return false;
    }

    return true;
  });
}

/**
 * Sorts workspaces based on criteria
 */
export function sortWorkspaces(
  workspaces: RacineWorkspace[],
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'memberCount' | 'resourceCount',
  sortOrder: 'asc' | 'desc' = 'asc'
): RacineWorkspace[] {
  const sorted = [...workspaces].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'memberCount':
        comparison = (a.memberCount || 0) - (b.memberCount || 0);
        break;
      case 'resourceCount':
        comparison = (a.resourceCount || 0) - (b.resourceCount || 0);
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

/**
 * Exports workspace data for backup or migration
 */
export function exportWorkspaceData(
  workspace: RacineWorkspace,
  includeMembers: boolean = true,
  includeResources: boolean = true,
  includeAnalytics: boolean = false
): any {
  const exportData: any = {
    workspace: {
      ...workspace,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0'
    }
  };

  if (includeMembers) {
    exportData.members = workspace.members || [];
  }

  if (includeResources) {
    exportData.resources = workspace.resources || [];
  }

  if (includeAnalytics) {
    exportData.analytics = workspace.analytics || null;
  }

  return exportData;
}

/**
 * Validates imported workspace data
 */
export function validateImportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.workspace) {
    errors.push('Workspace data is missing');
  } else {
    const workspaceValidation = validateWorkspaceConfig(data.workspace);
    if (!workspaceValidation.isValid) {
      errors.push(...workspaceValidation.errors);
    }
  }

  if (data.members && Array.isArray(data.members)) {
    data.members.forEach((member: any, index: number) => {
      if (!member.userId || !member.role) {
        errors.push(`Invalid member data at index ${index}`);
      }
    });
  }

  if (data.resources && Array.isArray(data.resources)) {
    data.resources.forEach((resource: any, index: number) => {
      if (!resource.resourceId || !resource.resourceType) {
        errors.push(`Invalid resource data at index ${index}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get workspace icon based on type
 */
export function getWorkspaceIcon(workspaceType: string): string {
  switch (workspaceType.toLowerCase()) {
    case 'project':
      return '📁'
    case 'environment':
      return '🌍'
    case 'department':
      return '🏢'
    case 'temporary':
      return '⏰'
    case 'development':
      return '💻'
    case 'staging':
      return '🔧'
    case 'production':
      return '🚀'
    case 'testing':
      return '🧪'
    case 'research':
      return '🔬'
    case 'analytics':
      return '📊'
    default:
      return '📋'
  }
}

// =============================================================================
// TAB MANAGEMENT UTILITIES
// =============================================================================

export const workspaceUtils = {
  validateWorkspaceConfig,
  validateMemberPermissions,
  validateWorkspaceName,
  calculateWorkspaceHealth,
  generateWorkspaceRecommendations,
  formatWorkspaceForDisplay,
  validateResourceLink,
  analyzeResourceDependencies,
  calculateResourceUtilization,
  analyzeMemberActivity,
  generateRoleRecommendations,
  validateWorkspaceTemplate,
  applyTemplateCustomizations,
  filterWorkspaces,
  sortWorkspaces,
  exportWorkspaceData,
  validateImportData,
  getWorkspaceIcon,
  getWorkspaceTabState,
  updateWorkspaceTabState
};

/**
 * Get workspace tab state for tab management
 */
export function getWorkspaceTabState(
  workspaceId: string,
  userId: string
): {
  activeTabs: string[];
  tabGroups: any[];
  tabOrder: string[];
  pinnedTabs: string[];
  favoriteTabs: string[];
} {
  // This would typically fetch from backend
  // For now, return default state
  return {
    activeTabs: [],
    tabGroups: [],
    tabOrder: [],
    pinnedTabs: [],
    favoriteTabs: []
  };
}

/**
 * Update workspace tab state
 */
export function updateWorkspaceTabState(
  workspaceId: string,
  userId: string,
  updates: {
    activeTabs?: string[];
    tabGroups?: any[];
    tabOrder?: string[];
    pinnedTabs?: string[];
    favoriteTabs?: string[];
  }
): Promise<boolean> {
  // This would typically update backend
  // For now, return success
  return Promise.resolve(true);
}
