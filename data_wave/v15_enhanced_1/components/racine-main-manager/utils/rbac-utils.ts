// rbac-utils.ts - Advanced RBAC Utilities for Racine Integration
// Integrates with existing Advanced_RBAC_Datagovernance_System SPA utilities for enhanced functionality

import type {
  RBACUser,
  RBACRole,
  RBACPermission,
  RBACGroup,
  RBACResource,
  RBACPolicy,
  RBACCondition,
  RBACAccessRequest,
  RBACAuditLog,
  RBACConfiguration,
  RBACMetrics,
  RBACAnalytics,
  RBACCoordination,
  WorkspaceContext,
  UserPermissions
} from '../types';

/**
 * RBAC Permission Management Utilities
 */
export class RBACPermissionUtils {
  
  /**
   * Checks if user has specific permission for a resource and action
   */
  static checkUserPermission(
    userPermissions: RBACPermission[],
    resource: string,
    action: string
  ): boolean {
    return userPermissions.some(permission => {
      return this.matchesPermission(permission, resource, action);
    });
  }

  /**
   * Checks if user can access a resource (any action)
   */
  static checkResourceAccess(
    userPermissions: RBACPermission[],
    resource: string
  ): boolean {
    return userPermissions.some(permission => {
      return permission.resource === resource || 
             permission.resource === '*' ||
             this.matchesResourcePattern(permission.resource, resource);
    });
  }

  /**
   * Matches permission against resource and action with wildcard support
   */
  static matchesPermission(
    permission: RBACPermission,
    resource: string,
    action: string
  ): boolean {
    const resourceMatch = permission.resource === '*' || 
                         permission.resource === resource ||
                         this.matchesResourcePattern(permission.resource, resource);
    
    const actionMatch = permission.action === '*' || 
                       permission.action === action ||
                       this.matchesActionPattern(permission.action, action);
    
    return resourceMatch && actionMatch;
  }

  /**
   * Matches resource patterns with wildcards
   */
  static matchesResourcePattern(pattern: string, resource: string): boolean {
    if (pattern === '*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(resource);
    }
    return pattern === resource;
  }

  /**
   * Matches action patterns with wildcards
   */
  static matchesActionPattern(pattern: string, action: string): boolean {
    if (pattern === '*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(action);
    }
    return pattern === action;
  }

  /**
   * Combines multiple permission sets
   */
  static combinePermissions(
    ...permissionSets: RBACPermission[][]
  ): RBACPermission[] {
    const combined = new Map<string, RBACPermission>();
    
    permissionSets.flat().forEach(permission => {
      const key = `${permission.resource}:${permission.action}`;
      if (!combined.has(key)) {
        combined.set(key, permission);
      }
    });
    
    return Array.from(combined.values());
  }

  /**
   * Filters permissions by resource
   */
  static filterPermissionsByResource(
    permissions: RBACPermission[],
    resource: string
  ): RBACPermission[] {
    return permissions.filter(permission => 
      this.matchesResourcePattern(permission.resource, resource)
    );
  }

  /**
   * Gets all actions available for a resource
   */
  static getActionsForResource(
    permissions: RBACPermission[],
    resource: string
  ): string[] {
    const actions = new Set<string>();
    
    permissions
      .filter(permission => this.matchesResourcePattern(permission.resource, resource))
      .forEach(permission => {
        if (permission.action === '*') {
          actions.add('*');
        } else {
          actions.add(permission.action);
        }
      });
    
    return Array.from(actions);
  }

  /**
   * Validates permission format
   */
  static validatePermission(permission: Partial<RBACPermission>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!permission.resource || permission.resource.trim() === '') {
      errors.push('Resource is required');
    }
    
    if (!permission.action || permission.action.trim() === '') {
      errors.push('Action is required');
    }
    
    if (permission.resource && !/^[a-zA-Z0-9_\-\*\.]+$/.test(permission.resource)) {
      errors.push('Resource contains invalid characters');
    }
    
    if (permission.action && !/^[a-zA-Z0-9_\-\*\.]+$/.test(permission.action)) {
      errors.push('Action contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * RBAC Role Management Utilities
 */
export class RBACRoleUtils {
  
  /**
   * Calculates effective permissions for a role
   */
  static calculateEffectivePermissions(
    role: RBACRole,
    allRoles: RBACRole[]
  ): RBACPermission[] {
    const permissions = new Map<string, RBACPermission>();
    
    // Add direct permissions
    role.permissions.forEach(permission => {
      const key = `${permission.resource}:${permission.action}`;
      permissions.set(key, permission);
    });
    
    // Add permissions from inherited roles
    if (role.inheritedRoles) {
      role.inheritedRoles.forEach(inheritedRoleId => {
        const inheritedRole = allRoles.find(r => r.id === inheritedRoleId);
        if (inheritedRole) {
          const inheritedPermissions = this.calculateEffectivePermissions(inheritedRole, allRoles);
          inheritedPermissions.forEach(permission => {
            const key = `${permission.resource}:${permission.action}`;
            permissions.set(key, permission);
          });
        }
      });
    }
    
    return Array.from(permissions.values());
  }

  /**
   * Checks for circular role inheritance
   */
  static hasCircularInheritance(
    roleId: string,
    targetRoleId: string,
    allRoles: RBACRole[],
    visited = new Set<string>()
  ): boolean {
    if (visited.has(roleId)) {
      return true;
    }
    
    if (roleId === targetRoleId) {
      return true;
    }
    
    visited.add(roleId);
    
    const role = allRoles.find(r => r.id === roleId);
    if (!role || !role.inheritedRoles) {
      return false;
    }
    
    return role.inheritedRoles.some(inheritedRoleId => 
      this.hasCircularInheritance(inheritedRoleId, targetRoleId, allRoles, new Set(visited))
    );
  }

  /**
   * Gets role hierarchy
   */
  static getRoleHierarchy(
    roleId: string,
    allRoles: RBACRole[]
  ): { level: number; role: RBACRole }[] {
    const hierarchy: { level: number; role: RBACRole }[] = [];
    const visited = new Set<string>();
    
    const buildHierarchy = (currentRoleId: string, level: number) => {
      if (visited.has(currentRoleId)) return;
      visited.add(currentRoleId);
      
      const role = allRoles.find(r => r.id === currentRoleId);
      if (!role) return;
      
      hierarchy.push({ level, role });
      
      if (role.inheritedRoles) {
        role.inheritedRoles.forEach(inheritedRoleId => {
          buildHierarchy(inheritedRoleId, level + 1);
        });
      }
    };
    
    buildHierarchy(roleId, 0);
    return hierarchy;
  }

  /**
   * Optimizes role permissions by removing redundant ones
   */
  static optimizeRolePermissions(role: RBACRole): RBACRole {
    const optimized = { ...role };
    const uniquePermissions = new Map<string, RBACPermission>();
    
    role.permissions.forEach(permission => {
      const key = `${permission.resource}:${permission.action}`;
      
      // Check if we already have a more general permission
      const existingWildcard = Array.from(uniquePermissions.values()).find(p => 
        (p.resource === '*' && permission.resource !== '*') ||
        (p.action === '*' && permission.action !== '*' && p.resource === permission.resource)
      );
      
      if (!existingWildcard) {
        // Remove more specific permissions if we're adding a wildcard
        if (permission.resource === '*' || permission.action === '*') {
          Array.from(uniquePermissions.keys()).forEach(existingKey => {
            const existing = uniquePermissions.get(existingKey)!;
            if (
              (permission.resource === '*') ||
              (permission.action === '*' && existing.resource === permission.resource)
            ) {
              uniquePermissions.delete(existingKey);
            }
          });
        }
        
        uniquePermissions.set(key, permission);
      }
    });
    
    optimized.permissions = Array.from(uniquePermissions.values());
    return optimized;
  }

  /**
   * Validates role configuration
   */
  static validateRole(
    role: Partial<RBACRole>,
    allRoles: RBACRole[] = []
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!role.name || role.name.trim() === '') {
      errors.push('Role name is required');
    }
    
    if (role.name && !/^[a-zA-Z0-9_\-\.]+$/.test(role.name)) {
      errors.push('Role name contains invalid characters');
    }
    
    if (role.inheritedRoles && role.id) {
      role.inheritedRoles.forEach(inheritedRoleId => {
        if (this.hasCircularInheritance(role.id!, inheritedRoleId, allRoles)) {
          errors.push(`Circular inheritance detected with role: ${inheritedRoleId}`);
        }
      });
    }
    
    if (role.permissions) {
      role.permissions.forEach((permission, index) => {
        const validation = RBACPermissionUtils.validatePermission(permission);
        if (!validation.isValid) {
          errors.push(`Permission ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * RBAC User Management Utilities
 */
export class RBACUserUtils {
  
  /**
   * Calculates effective permissions for a user
   */
  static calculateUserEffectivePermissions(
    user: RBACUser,
    allRoles: RBACRole[]
  ): RBACPermission[] {
    const permissions = new Map<string, RBACPermission>();
    
    // Add direct permissions
    if (user.permissions) {
      user.permissions.forEach(permission => {
        const key = `${permission.resource}:${permission.action}`;
        permissions.set(key, permission);
      });
    }
    
    // Add permissions from roles
    if (user.roles) {
      user.roles.forEach(role => {
        const roleObj = allRoles.find(r => r.id === role.id);
        if (roleObj) {
          const rolePermissions = RBACRoleUtils.calculateEffectivePermissions(roleObj, allRoles);
          rolePermissions.forEach(permission => {
            const key = `${permission.resource}:${permission.action}`;
            permissions.set(key, permission);
          });
        }
      });
    }
    
    return Array.from(permissions.values());
  }

  /**
   * Gets user's access level for a resource
   */
  static getUserAccessLevel(
    user: RBACUser,
    resource: string,
    allRoles: RBACRole[]
  ): 'none' | 'read' | 'write' | 'admin' | 'full' {
    const permissions = this.calculateUserEffectivePermissions(user, allRoles);
    const resourcePermissions = RBACPermissionUtils.filterPermissionsByResource(permissions, resource);
    
    if (resourcePermissions.length === 0) return 'none';
    
    const actions = resourcePermissions.map(p => p.action);
    
    if (actions.includes('*')) return 'full';
    if (actions.includes('admin')) return 'admin';
    if (actions.includes('write') || actions.includes('update') || actions.includes('delete')) return 'write';
    if (actions.includes('read')) return 'read';
    
    return 'none';
  }

  /**
   * Checks if user is in a specific group
   */
  static isUserInGroup(user: RBACUser, groupId: string): boolean {
    return user.groups?.some(group => group.id === groupId) || false;
  }

  /**
   * Gets user's workspace access
   */
  static getUserWorkspaceAccess(
    user: RBACUser,
    workspaceId: string,
    allRoles: RBACRole[]
  ): {
    hasAccess: boolean;
    accessLevel: string;
    permissions: RBACPermission[];
  } {
    const permissions = this.calculateUserEffectivePermissions(user, allRoles);
    const workspacePermissions = permissions.filter(p => 
      p.resource === `workspace:${workspaceId}` || 
      p.resource === 'workspace:*' ||
      p.resource === '*'
    );
    
    const hasAccess = workspacePermissions.length > 0;
    const accessLevel = this.getUserAccessLevel(user, `workspace:${workspaceId}`, allRoles);
    
    return {
      hasAccess,
      accessLevel,
      permissions: workspacePermissions
    };
  }

  /**
   * Validates user configuration
   */
  static validateUser(user: Partial<RBACUser>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!user.username || user.username.trim() === '') {
      errors.push('Username is required');
    }
    
    if (!user.email || user.email.trim() === '') {
      errors.push('Email is required');
    }
    
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.push('Invalid email format');
    }
    
    if (user.username && !/^[a-zA-Z0-9_\-\.]+$/.test(user.username)) {
      errors.push('Username contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * RBAC Policy Management Utilities
 */
export class RBACPolicyUtils {
  
  /**
   * Evaluates a policy condition
   */
  static evaluateCondition(
    condition: RBACCondition,
    context: any
  ): boolean {
    switch (condition.type) {
      case 'time_based':
        return this.evaluateTimeCondition(condition, context);
      case 'location_based':
        return this.evaluateLocationCondition(condition, context);
      case 'attribute_based':
        return this.evaluateAttributeCondition(condition, context);
      case 'resource_based':
        return this.evaluateResourceCondition(condition, context);
      default:
        return true;
    }
  }

  /**
   * Evaluates time-based conditions
   */
  static evaluateTimeCondition(
    condition: RBACCondition,
    context: any
  ): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    if (condition.timeRange) {
      const start = parseInt(condition.timeRange.start.replace(':', ''));
      const end = parseInt(condition.timeRange.end.replace(':', ''));
      return currentTime >= start && currentTime <= end;
    }
    
    if (condition.allowedDays) {
      const today = now.getDay();
      return condition.allowedDays.includes(today);
    }
    
    return true;
  }

  /**
   * Evaluates location-based conditions
   */
  static evaluateLocationCondition(
    condition: RBACCondition,
    context: any
  ): boolean {
    if (!context.location) return false;
    
    if (condition.allowedLocations) {
      return condition.allowedLocations.some(location => 
        this.matchesLocation(location, context.location)
      );
    }
    
    if (condition.blockedLocations) {
      return !condition.blockedLocations.some(location => 
        this.matchesLocation(location, context.location)
      );
    }
    
    return true;
  }

  /**
   * Evaluates attribute-based conditions
   */
  static evaluateAttributeCondition(
    condition: RBACCondition,
    context: any
  ): boolean {
    if (!condition.attributes) return true;
    
    return condition.attributes.every(attr => {
      const contextValue = this.getNestedValue(context, attr.name);
      return this.compareValues(contextValue, attr.value, attr.operator);
    });
  }

  /**
   * Evaluates resource-based conditions
   */
  static evaluateResourceCondition(
    condition: RBACCondition,
    context: any
  ): boolean {
    if (!context.resource) return false;
    
    if (condition.resourceConstraints) {
      return condition.resourceConstraints.every(constraint => {
        return this.evaluateResourceConstraint(constraint, context.resource);
      });
    }
    
    return true;
  }

  /**
   * Matches location patterns
   */
  static matchesLocation(pattern: string, location: string): boolean {
    if (pattern === '*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(location);
    }
    return pattern === location;
  }

  /**
   * Gets nested object value by path
   */
  static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Compares values based on operator
   */
  static compareValues(contextValue: any, expectedValue: any, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return contextValue === expectedValue;
      case 'not_equals':
        return contextValue !== expectedValue;
      case 'greater_than':
        return contextValue > expectedValue;
      case 'less_than':
        return contextValue < expectedValue;
      case 'contains':
        return String(contextValue).includes(String(expectedValue));
      case 'starts_with':
        return String(contextValue).startsWith(String(expectedValue));
      case 'ends_with':
        return String(contextValue).endsWith(String(expectedValue));
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(contextValue);
      default:
        return false;
    }
  }

  /**
   * Evaluates resource constraint
   */
  static evaluateResourceConstraint(constraint: any, resource: any): boolean {
    // Implementation depends on specific constraint types
    return true; // Placeholder
  }
}

/**
 * RBAC Analytics and Reporting Utilities
 */
export class RBACAnalyticsUtils {
  
  /**
   * Analyzes permission usage patterns
   */
  static analyzePermissionUsage(
    auditLogs: RBACAuditLog[],
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): {
    mostUsedPermissions: Array<{ permission: string; count: number }>;
    leastUsedPermissions: Array<{ permission: string; count: number }>;
    unusedPermissions: string[];
    trends: Array<{ date: Date; usage: number }>;
  } {
    const now = new Date();
    const timeframeDays = { day: 1, week: 7, month: 30 }[timeframe];
    const startDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
    
    const relevantLogs = auditLogs.filter(log => 
      log.timestamp >= startDate && log.action.startsWith('permission_')
    );
    
    const permissionCounts = new Map<string, number>();
    
    relevantLogs.forEach(log => {
      const permission = `${log.resource}:${log.action}`;
      permissionCounts.set(permission, (permissionCounts.get(permission) || 0) + 1);
    });
    
    const sortedPermissions = Array.from(permissionCounts.entries())
      .map(([permission, count]) => ({ permission, count }))
      .sort((a, b) => b.count - a.count);
    
    const mostUsedPermissions = sortedPermissions.slice(0, 10);
    const leastUsedPermissions = sortedPermissions.slice(-10).reverse();
    const unusedPermissions: string[] = []; // Calculate based on available permissions
    
    // Calculate trends
    const trends = this.calculateUsageTrends(relevantLogs, timeframeDays);
    
    return {
      mostUsedPermissions,
      leastUsedPermissions,
      unusedPermissions,
      trends
    };
  }

  /**
   * Analyzes user access patterns
   */
  static analyzeUserAccessPatterns(
    users: RBACUser[],
    auditLogs: RBACAuditLog[]
  ): {
    activeUsers: RBACUser[];
    inactiveUsers: RBACUser[];
    accessFrequency: Array<{ userId: string; frequency: number }>;
    riskUsers: Array<{ user: RBACUser; riskScore: number; reasons: string[] }>;
  } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentLogs = auditLogs.filter(log => log.timestamp >= thirtyDaysAgo);
    const userActivity = new Map<string, number>();
    
    recentLogs.forEach(log => {
      userActivity.set(log.userId, (userActivity.get(log.userId) || 0) + 1);
    });
    
    const activeUsers = users.filter(user => userActivity.has(user.id));
    const inactiveUsers = users.filter(user => !userActivity.has(user.id));
    
    const accessFrequency = Array.from(userActivity.entries())
      .map(([userId, frequency]) => ({ userId, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
    
    const riskUsers = this.identifyRiskUsers(users, auditLogs);
    
    return {
      activeUsers,
      inactiveUsers,
      accessFrequency,
      riskUsers
    };
  }

  /**
   * Calculates usage trends over time
   */
  static calculateUsageTrends(
    logs: RBACAuditLog[],
    days: number
  ): Array<{ date: Date; usage: number }> {
    const trends: Array<{ date: Date; usage: number }> = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayUsage = logs.filter(log => 
        log.timestamp >= dayStart && log.timestamp < dayEnd
      ).length;
      
      trends.push({ date: dayStart, usage: dayUsage });
    }
    
    return trends;
  }

  /**
   * Identifies users with potential security risks
   */
  static identifyRiskUsers(
    users: RBACUser[],
    auditLogs: RBACAuditLog[]
  ): Array<{ user: RBACUser; riskScore: number; reasons: string[] }> {
    return users.map(user => {
      const userLogs = auditLogs.filter(log => log.userId === user.id);
      const reasons: string[] = [];
      let riskScore = 0;
      
      // Check for excessive permissions
      if (user.roles && user.roles.length > 5) {
        reasons.push('User has excessive number of roles');
        riskScore += 20;
      }
      
      // Check for failed access attempts
      const failedAttempts = userLogs.filter(log => 
        log.action === 'access_denied' || log.status === 'failed'
      ).length;
      
      if (failedAttempts > 10) {
        reasons.push('High number of failed access attempts');
        riskScore += 30;
      }
      
      // Check for unusual access patterns
      const accessHours = userLogs.map(log => log.timestamp.getHours());
      const nightAccess = accessHours.filter(hour => hour < 6 || hour > 22).length;
      
      if (nightAccess > userLogs.length * 0.3) {
        reasons.push('Unusual access times detected');
        riskScore += 15;
      }
      
      // Check for dormant account with recent activity
      const lastActivity = Math.max(...userLogs.map(log => log.timestamp.getTime()));
      const daysSinceActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
      
      if (daysSinceActivity > 90 && userLogs.length > 0) {
        reasons.push('Dormant account with recent activity');
        riskScore += 25;
      }
      
      return { user, riskScore, reasons };
    }).filter(result => result.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore);
  }
}

/**
 * RBAC Configuration Management Utilities
 */
export class RBACConfigurationUtils {
  
  /**
   * Extracts workspace configurations from policies
   */
  static extractWorkspaceConfigs(policies: RBACPolicy[]): Record<string, RBACConfiguration> {
    const configs: Record<string, RBACConfiguration> = {};
    
    policies.forEach(policy => {
      if (policy.scope === 'workspace' && policy.workspaceId) {
        if (!configs[policy.workspaceId]) {
          configs[policy.workspaceId] = {
            workspaceId: policy.workspaceId,
            policies: [],
            settings: {}
          };
        }
        configs[policy.workspaceId].policies.push(policy);
      }
    });
    
    return configs;
  }

  /**
   * Validates RBAC configuration consistency
   */
  static validateConfiguration(
    users: RBACUser[],
    roles: RBACRole[],
    permissions: RBACPermission[],
    policies: RBACPolicy[]
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for orphaned roles
    const roleIds = new Set(roles.map(r => r.id));
    users.forEach(user => {
      user.roles?.forEach(role => {
        if (!roleIds.has(role.id)) {
          errors.push(`User ${user.username} has orphaned role: ${role.id}`);
        }
      });
    });
    
    // Check for circular role inheritance
    roles.forEach(role => {
      if (role.inheritedRoles) {
        role.inheritedRoles.forEach(inheritedRoleId => {
          if (RBACRoleUtils.hasCircularInheritance(role.id, inheritedRoleId, roles)) {
            errors.push(`Circular inheritance detected in role: ${role.name}`);
          }
        });
      }
    });
    
    // Check for unused permissions
    const usedPermissions = new Set<string>();
    roles.forEach(role => {
      role.permissions.forEach(permission => {
        usedPermissions.add(`${permission.resource}:${permission.action}`);
      });
    });
    
    permissions.forEach(permission => {
      const key = `${permission.resource}:${permission.action}`;
      if (!usedPermissions.has(key)) {
        warnings.push(`Unused permission: ${key}`);
      }
    });
    
    // Check for overly permissive wildcards
    permissions.forEach(permission => {
      if (permission.resource === '*' && permission.action === '*') {
        warnings.push('Super admin permission detected - ensure this is intentional');
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generates RBAC configuration report
   */
  static generateConfigurationReport(
    users: RBACUser[],
    roles: RBACRole[],
    permissions: RBACPermission[],
    policies: RBACPolicy[]
  ): {
    summary: {
      totalUsers: number;
      totalRoles: number;
      totalPermissions: number;
      totalPolicies: number;
    };
    details: {
      roleDistribution: Array<{ role: string; userCount: number }>;
      permissionDistribution: Array<{ permission: string; roleCount: number }>;
      policyTypes: Array<{ type: string; count: number }>;
    };
    validation: ReturnType<typeof RBACConfigurationUtils.validateConfiguration>;
  } {
    const validation = this.validateConfiguration(users, roles, permissions, policies);
    
    // Calculate role distribution
    const roleUsage = new Map<string, number>();
    users.forEach(user => {
      user.roles?.forEach(role => {
        roleUsage.set(role.name, (roleUsage.get(role.name) || 0) + 1);
      });
    });
    
    const roleDistribution = Array.from(roleUsage.entries())
      .map(([role, userCount]) => ({ role, userCount }))
      .sort((a, b) => b.userCount - a.userCount);
    
    // Calculate permission distribution
    const permissionUsage = new Map<string, number>();
    roles.forEach(role => {
      role.permissions.forEach(permission => {
        const key = `${permission.resource}:${permission.action}`;
        permissionUsage.set(key, (permissionUsage.get(key) || 0) + 1);
      });
    });
    
    const permissionDistribution = Array.from(permissionUsage.entries())
      .map(([permission, roleCount]) => ({ permission, roleCount }))
      .sort((a, b) => b.roleCount - a.roleCount);
    
    // Calculate policy types
    const policyTypes = new Map<string, number>();
    policies.forEach(policy => {
      policyTypes.set(policy.type, (policyTypes.get(policy.type) || 0) + 1);
    });
    
    const policyTypeArray = Array.from(policyTypes.entries())
      .map(([type, count]) => ({ type, count }));
    
    return {
      summary: {
        totalUsers: users.length,
        totalRoles: roles.length,
        totalPermissions: permissions.length,
        totalPolicies: policies.length
      },
      details: {
        roleDistribution,
        permissionDistribution,
        policyTypes: policyTypeArray
      },
      validation
    };
  }
}

/**
 * Main export object with all RBAC utilities
 */
export const rbacUtils = {
  permission: RBACPermissionUtils,
  role: RBACRoleUtils,
  user: RBACUserUtils,
  policy: RBACPolicyUtils,
  analytics: RBACAnalyticsUtils,
  configuration: RBACConfigurationUtils,

  // Convenience methods
  checkUserPermission: RBACPermissionUtils.checkUserPermission.bind(RBACPermissionUtils),
  checkResourceAccess: RBACPermissionUtils.checkResourceAccess.bind(RBACPermissionUtils),
  calculateUserEffectivePermissions: RBACUserUtils.calculateUserEffectivePermissions.bind(RBACUserUtils),
  getUserAccessLevel: RBACUserUtils.getUserAccessLevel.bind(RBACUserUtils),
  evaluateCondition: RBACPolicyUtils.evaluateCondition.bind(RBACPolicyUtils),
  extractWorkspaceConfigs: RBACConfigurationUtils.extractWorkspaceConfigs.bind(RBACConfigurationUtils),
  validateConfiguration: RBACConfigurationUtils.validateConfiguration.bind(RBACConfigurationUtils),
  analyzePermissionUsage: RBACAnalyticsUtils.analyzePermissionUsage.bind(RBACAnalyticsUtils),
  analyzeUserAccessPatterns: RBACAnalyticsUtils.analyzeUserAccessPatterns.bind(RBACAnalyticsUtils)
};

export default rbacUtils;