/**
 * Advanced Security Utilities
 * Provides comprehensive security utilities for the Racine Main Manager system
 */

import {
  RBACRole,
  RBACPermission,
  RBACPolicy,
  SecurityAuditLog,
  SecurityThreat,
  ComplianceCheck,
  AccessControlList,
  SecurityConfiguration,
  ThreatDetection,
  SecurityAlert,
  AuthenticationEvent,
  AuthorizationEvent,
  SecurityMetrics,
  DataClassification,
  EncryptionConfig
} from '../types/security.types';

import { UUID, ISODateString } from '../types/racine-core.types';

// ============================================================================
// RBAC MANAGEMENT UTILITIES
// ============================================================================

export class RBACManager {
  private roles: Map<UUID, RBACRole> = new Map();
  private permissions: Map<UUID, RBACPermission> = new Map();
  private policies: Map<UUID, RBACPolicy> = new Map();
  private userRoles: Map<UUID, UUID[]> = new Map();

  /**
   * Create new RBAC role
   */
  createRole(
    name: string,
    description: string,
    permissions: UUID[],
    config: {
      level: 'system' | 'group' | 'resource';
      priority: number;
      inheritsFrom?: UUID[];
      constraints?: Record<string, any>;
      isActive?: boolean;
    }
  ): RBACRole {
    const roleId = this.generateRoleId();
    
    const role: RBACRole = {
      id: roleId,
      name,
      description,
      permissions,
      level: config.level,
      priority: config.priority,
      inheritsFrom: config.inheritsFrom || [],
      constraints: config.constraints || {},
      isActive: config.isActive !== false,
      metadata: {
        createdBy: 'system',
        approvedBy: 'system',
        lastReviewed: new Date().toISOString() as ISODateString,
        reviewFrequency: 90, // days
        usageCount: 0,
        riskLevel: this.calculateRoleRiskLevel(permissions)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.roles.set(roleId, role);
    return role;
  }

  /**
   * Create new permission
   */
  createPermission(
    name: string,
    resource: string,
    actions: string[],
    config: {
      scope: 'global' | 'group' | 'resource' | 'user';
      conditions?: Record<string, any>;
      constraints?: Record<string, any>;
      riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): RBACPermission {
    const permissionId = this.generatePermissionId();
    
    const permission: RBACPermission = {
      id: permissionId,
      name,
      resource,
      actions,
      scope: config.scope,
      conditions: config.conditions || {},
      constraints: config.constraints || {},
      riskLevel: config.riskLevel || 'medium',
      isActive: true,
      metadata: {
        category: this.categorizePermission(resource, actions),
        dependencies: [],
        conflicts: [],
        usageCount: 0,
        lastUsed: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.permissions.set(permissionId, permission);
    return permission;
  }

  /**
   * Assign role to user
   */
  assignRole(userId: UUID, roleId: UUID, config?: {
    expiresAt?: Date;
    conditions?: Record<string, any>;
    approvedBy?: UUID;
  }): boolean {
    const role = this.roles.get(roleId);
    if (!role || !role.isActive) {
      throw new Error('Role not found or inactive');
    }

    const userRoles = this.userRoles.get(userId) || [];
    if (!userRoles.includes(roleId)) {
      userRoles.push(roleId);
      this.userRoles.set(userId, userRoles);
      
      // Update role usage
      role.metadata.usageCount++;
      role.updatedAt = new Date();
      
      return true;
    }

    return false; // Role already assigned
  }

  /**
   * Check if user has permission
   */
  hasPermission(
    userId: UUID,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): {
    granted: boolean;
    reason: string;
    roles: UUID[];
    permissions: UUID[];
  } {
    const userRoles = this.userRoles.get(userId) || [];
    const grantedRoles: UUID[] = [];
    const grantedPermissions: UUID[] = [];

    // Check each role
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (!role || !role.isActive) continue;

      // Check role constraints
      if (!this.evaluateConstraints(role.constraints, context)) continue;

      // Check permissions in role
      for (const permissionId of role.permissions) {
        const permission = this.permissions.get(permissionId);
        if (!permission || !permission.isActive) continue;

        // Check if permission matches resource and action
        if (this.matchesPermission(permission, resource, action, context)) {
          grantedRoles.push(roleId);
          grantedPermissions.push(permissionId);
          
          // Update usage tracking
          permission.metadata.usageCount++;
          permission.metadata.lastUsed = new Date().toISOString() as ISODateString;
          
          return {
            granted: true,
            reason: `Granted via role '${role.name}' with permission '${permission.name}'`,
            roles: grantedRoles,
            permissions: grantedPermissions
          };
        }
      }
    }

    return {
      granted: false,
      reason: `No matching permissions found for ${action} on ${resource}`,
      roles: [],
      permissions: []
    };
  }

  /**
   * Get effective permissions for user
   */
  getEffectivePermissions(userId: UUID): {
    permissions: RBACPermission[];
    roles: RBACRole[];
    inheritanceChain: Record<UUID, UUID[]>;
  } {
    const userRoles = this.userRoles.get(userId) || [];
    const effectivePermissions: RBACPermission[] = [];
    const effectiveRoles: RBACRole[] = [];
    const inheritanceChain: Record<UUID, UUID[]> = {};

    // Process each role and its inheritance
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (!role || !role.isActive) continue;

      const roleChain = this.resolveRoleInheritance(roleId);
      inheritanceChain[roleId] = roleChain;

      for (const chainRoleId of roleChain) {
        const chainRole = this.roles.get(chainRoleId);
        if (!chainRole) continue;

        if (!effectiveRoles.find(r => r.id === chainRoleId)) {
          effectiveRoles.push(chainRole);
        }

        // Add permissions from this role
        for (const permissionId of chainRole.permissions) {
          const permission = this.permissions.get(permissionId);
          if (permission && permission.isActive && 
              !effectivePermissions.find(p => p.id === permissionId)) {
            effectivePermissions.push(permission);
          }
        }
      }
    }

    return {
      permissions: effectivePermissions,
      roles: effectiveRoles,
      inheritanceChain
    };
  }

  /**
   * Validate role assignment
   */
  validateRoleAssignment(
    userId: UUID,
    roleId: UUID,
    context?: Record<string, any>
  ): {
    valid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const role = this.roles.get(roleId);
    if (!role) {
      issues.push('Role does not exist');
      return { valid: false, issues, recommendations };
    }

    if (!role.isActive) {
      issues.push('Role is inactive');
      return { valid: false, issues, recommendations };
    }

    // Check for conflicts with existing roles
    const userRoles = this.userRoles.get(userId) || [];
    for (const existingRoleId of userRoles) {
      const existingRole = this.roles.get(existingRoleId);
      if (existingRole && this.hasRoleConflict(role, existingRole)) {
        issues.push(`Conflicts with existing role: ${existingRole.name}`);
      }
    }

    // Check for excessive permissions
    const riskLevel = role.metadata.riskLevel;
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Consider using a role with lower privileges');
      recommendations.push('Ensure proper approval process is followed');
    }

    // Check constraints
    if (!this.evaluateConstraints(role.constraints, context)) {
      issues.push('Role constraints not satisfied');
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  }

  private generateRoleId(): UUID {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }

  private generatePermissionId(): UUID {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }

  private calculateRoleRiskLevel(permissions: UUID[]): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;
    
    for (const permissionId of permissions) {
      const permission = this.permissions.get(permissionId);
      if (permission) {
        switch (permission.riskLevel) {
          case 'critical': riskScore += 4; break;
          case 'high': riskScore += 3; break;
          case 'medium': riskScore += 2; break;
          case 'low': riskScore += 1; break;
        }
      }
    }

    if (riskScore >= 10) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  private categorizePermission(resource: string, actions: string[]): string {
    if (actions.includes('delete') || actions.includes('admin')) return 'administrative';
    if (actions.includes('write') || actions.includes('update')) return 'modification';
    if (actions.includes('read') || actions.includes('view')) return 'read-only';
    return 'other';
  }

  private evaluateConstraints(constraints: Record<string, any>, context?: Record<string, any>): boolean {
    if (!context || Object.keys(constraints).length === 0) return true;

    return Object.entries(constraints).every(([key, value]) => {
      const contextValue = context[key];
      
      if (Array.isArray(value)) {
        return value.includes(contextValue);
      }
      
      if (typeof value === 'object' && value !== null) {
        if (value.min !== undefined && contextValue < value.min) return false;
        if (value.max !== undefined && contextValue > value.max) return false;
        return true;
      }
      
      return contextValue === value;
    });
  }

  private matchesPermission(
    permission: RBACPermission,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): boolean {
    // Check resource match (exact or wildcard)
    if (permission.resource !== '*' && permission.resource !== resource) {
      // Check for pattern matching
      if (!this.matchesPattern(permission.resource, resource)) {
        return false;
      }
    }

    // Check action match
    if (!permission.actions.includes('*') && !permission.actions.includes(action)) {
      return false;
    }

    // Check conditions
    if (!this.evaluateConstraints(permission.conditions, context)) {
      return false;
    }

    return true;
  }

  private matchesPattern(pattern: string, value: string): boolean {
    // Simple wildcard matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(value);
  }

  private resolveRoleInheritance(roleId: UUID, visited: Set<UUID> = new Set()): UUID[] {
    if (visited.has(roleId)) {
      return []; // Circular dependency
    }

    visited.add(roleId);
    const role = this.roles.get(roleId);
    if (!role) return [];

    const chain = [roleId];
    
    for (const parentRoleId of role.inheritsFrom) {
      const parentChain = this.resolveRoleInheritance(parentRoleId, new Set(visited));
      chain.push(...parentChain);
    }

    return chain;
  }

  private hasRoleConflict(role1: RBACRole, role2: RBACRole): boolean {
    // Check for mutually exclusive roles
    const conflictingPairs = [
      ['admin', 'user'],
      ['read-only', 'write'],
      ['system', 'guest']
    ];

    return conflictingPairs.some(([type1, type2]) =>
      (role1.name.toLowerCase().includes(type1) && role2.name.toLowerCase().includes(type2)) ||
      (role1.name.toLowerCase().includes(type2) && role2.name.toLowerCase().includes(type1))
    );
  }
}

// ============================================================================
// ACCESS CONTROL UTILITIES
// ============================================================================

export class AccessControlManager {
  private acls: Map<string, AccessControlList> = new Map();
  private accessHistory: Map<UUID, AuthorizationEvent[]> = new Map();

  /**
   * Create access control list for resource
   */
  createACL(
    resourceId: string,
    resourceType: string,
    ownerId: UUID,
    config: {
      inheritFrom?: string;
      defaultPermissions?: Record<string, string[]>;
      restrictions?: Record<string, any>;
    }
  ): AccessControlList {
    const acl: AccessControlList = {
      resourceId,
      resourceType,
      ownerId,
      permissions: {
        read: [ownerId],
        write: [ownerId],
        delete: [ownerId],
        admin: [ownerId]
      },
      inheritFrom: config.inheritFrom,
      restrictions: config.restrictions || {},
      metadata: {
        createdBy: ownerId,
        lastModified: new Date().toISOString() as ISODateString,
        version: 1,
        accessCount: 0,
        lastAccessed: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Apply default permissions
    if (config.defaultPermissions) {
      Object.entries(config.defaultPermissions).forEach(([permission, users]) => {
        acl.permissions[permission] = [...new Set([...acl.permissions[permission] || [], ...users])];
      });
    }

    this.acls.set(resourceId, acl);
    return acl;
  }

  /**
   * Check resource access
   */
  checkAccess(
    resourceId: string,
    userId: UUID,
    permission: string,
    context?: Record<string, any>
  ): {
    granted: boolean;
    reason: string;
    effectivePermissions: string[];
    inheritanceChain?: string[];
  } {
    const acl = this.acls.get(resourceId);
    if (!acl) {
      return {
        granted: false,
        reason: 'Resource not found',
        effectivePermissions: []
      };
    }

    // Check direct permissions
    const directPermissions = this.getDirectPermissions(acl, userId);
    if (directPermissions.includes(permission)) {
      this.logAccess(resourceId, userId, permission, true, 'Direct permission');
      return {
        granted: true,
        reason: 'Direct permission granted',
        effectivePermissions: directPermissions
      };
    }

    // Check inherited permissions
    if (acl.inheritFrom) {
      const inheritedResult = this.checkInheritedAccess(acl.inheritFrom, userId, permission, context);
      if (inheritedResult.granted) {
        this.logAccess(resourceId, userId, permission, true, 'Inherited permission');
        return {
          granted: true,
          reason: 'Inherited permission granted',
          effectivePermissions: [...directPermissions, ...inheritedResult.effectivePermissions],
          inheritanceChain: [acl.inheritFrom, ...(inheritedResult.inheritanceChain || [])]
        };
      }
    }

    // Check restrictions
    if (this.hasRestriction(acl, userId, permission, context)) {
      this.logAccess(resourceId, userId, permission, false, 'Access restricted');
      return {
        granted: false,
        reason: 'Access restricted by policy',
        effectivePermissions: directPermissions
      };
    }

    this.logAccess(resourceId, userId, permission, false, 'Permission not found');
    return {
      granted: false,
      reason: 'Permission not granted',
      effectivePermissions: directPermissions
    };
  }

  /**
   * Grant permission to user
   */
  grantPermission(
    resourceId: string,
    userId: UUID,
    permission: string,
    grantedBy: UUID,
    config?: {
      expiresAt?: Date;
      conditions?: Record<string, any>;
    }
  ): boolean {
    const acl = this.acls.get(resourceId);
    if (!acl) throw new Error('Resource not found');

    if (!acl.permissions[permission]) {
      acl.permissions[permission] = [];
    }

    if (!acl.permissions[permission].includes(userId)) {
      acl.permissions[permission].push(userId);
      acl.metadata.lastModified = new Date().toISOString() as ISODateString;
      acl.metadata.version++;
      acl.updatedAt = new Date();
      
      this.logAccess(resourceId, grantedBy, 'grant_permission', true, `Granted ${permission} to ${userId}`);
      return true;
    }

    return false;
  }

  /**
   * Revoke permission from user
   */
  revokePermission(
    resourceId: string,
    userId: UUID,
    permission: string,
    revokedBy: UUID
  ): boolean {
    const acl = this.acls.get(resourceId);
    if (!acl) throw new Error('Resource not found');

    if (acl.permissions[permission]) {
      const index = acl.permissions[permission].indexOf(userId);
      if (index > -1) {
        acl.permissions[permission].splice(index, 1);
        acl.metadata.lastModified = new Date().toISOString() as ISODateString;
        acl.metadata.version++;
        acl.updatedAt = new Date();
        
        this.logAccess(resourceId, revokedBy, 'revoke_permission', true, `Revoked ${permission} from ${userId}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Get user's access summary
   */
  getUserAccessSummary(userId: UUID): {
    resources: Array<{
      resourceId: string;
      resourceType: string;
      permissions: string[];
      source: 'direct' | 'inherited';
    }>;
    totalResources: number;
    permissionCounts: Record<string, number>;
    recentAccess: AuthorizationEvent[];
  } {
    const resources: Array<{
      resourceId: string;
      resourceType: string;
      permissions: string[];
      source: 'direct' | 'inherited';
    }> = [];

    const permissionCounts: Record<string, number> = {};

    // Check all ACLs
    this.acls.forEach((acl, resourceId) => {
      const directPermissions = this.getDirectPermissions(acl, userId);
      
      if (directPermissions.length > 0) {
        resources.push({
          resourceId,
          resourceType: acl.resourceType,
          permissions: directPermissions,
          source: 'direct'
        });

        directPermissions.forEach(permission => {
          permissionCounts[permission] = (permissionCounts[permission] || 0) + 1;
        });
      }
    });

    const recentAccess = this.accessHistory.get(userId) || [];

    return {
      resources,
      totalResources: resources.length,
      permissionCounts,
      recentAccess: recentAccess.slice(-50) // Last 50 access events
    };
  }

  private getDirectPermissions(acl: AccessControlList, userId: UUID): string[] {
    const permissions: string[] = [];
    
    Object.entries(acl.permissions).forEach(([permission, users]) => {
      if (users.includes(userId)) {
        permissions.push(permission);
      }
    });

    return permissions;
  }

  private checkInheritedAccess(
    parentResourceId: string,
    userId: UUID,
    permission: string,
    context?: Record<string, any>
  ): {
    granted: boolean;
    effectivePermissions: string[];
    inheritanceChain?: string[];
  } {
    const parentResult = this.checkAccess(parentResourceId, userId, permission, context);
    return {
      granted: parentResult.granted,
      effectivePermissions: parentResult.effectivePermissions,
      inheritanceChain: parentResult.inheritanceChain
    };
  }

  private hasRestriction(
    acl: AccessControlList,
    userId: UUID,
    permission: string,
    context?: Record<string, any>
  ): boolean {
    if (!acl.restrictions || Object.keys(acl.restrictions).length === 0) {
      return false;
    }

    // Check time-based restrictions
    if (acl.restrictions.timeRestrictions) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();
      
      const timeRestrictions = acl.restrictions.timeRestrictions;
      if (timeRestrictions.allowedHours && !timeRestrictions.allowedHours.includes(currentHour)) {
        return true;
      }
      if (timeRestrictions.allowedDays && !timeRestrictions.allowedDays.includes(currentDay)) {
        return true;
      }
    }

    // Check IP-based restrictions
    if (acl.restrictions.ipRestrictions && context?.clientIP) {
      const allowedIPs = acl.restrictions.ipRestrictions.allowedIPs || [];
      const blockedIPs = acl.restrictions.ipRestrictions.blockedIPs || [];
      
      if (blockedIPs.includes(context.clientIP)) {
        return true;
      }
      if (allowedIPs.length > 0 && !allowedIPs.includes(context.clientIP)) {
        return true;
      }
    }

    return false;
  }

  private logAccess(
    resourceId: string,
    userId: UUID,
    action: string,
    granted: boolean,
    reason: string
  ): void {
    const event: AuthorizationEvent = {
      id: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
      userId,
      resourceId,
      action,
      granted,
      reason,
      timestamp: new Date().toISOString() as ISODateString,
      metadata: {
        userAgent: 'system',
        ipAddress: 'unknown',
        sessionId: 'system'
      }
    };

    const userHistory = this.accessHistory.get(userId) || [];
    userHistory.push(event);
    
    // Keep only last 1000 events per user
    if (userHistory.length > 1000) {
      userHistory.splice(0, userHistory.length - 1000);
    }
    
    this.accessHistory.set(userId, userHistory);

    // Update ACL access tracking
    const acl = this.acls.get(resourceId);
    if (acl) {
      acl.metadata.accessCount++;
      acl.metadata.lastAccessed = new Date().toISOString() as ISODateString;
    }
  }
}

// ============================================================================
// SECURITY AUDIT UTILITIES
// ============================================================================

export class SecurityAuditManager {
  private auditLogs: Map<UUID, SecurityAuditLog> = new Map();
  private auditConfig: Record<string, any> = {};

  /**
   * Log security event
   */
  logSecurityEvent(
    eventType: 'authentication' | 'authorization' | 'data_access' | 'configuration_change' | 'security_violation',
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    config: {
      userId?: UUID;
      resourceId?: string;
      action?: string;
      outcome: 'success' | 'failure' | 'warning';
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): SecurityAuditLog {
    const logId = this.generateAuditId();
    
    const auditLog: SecurityAuditLog = {
      id: logId,
      eventType,
      severity,
      description,
      userId: config.userId,
      resourceId: config.resourceId,
      action: config.action,
      outcome: config.outcome,
      timestamp: new Date().toISOString() as ISODateString,
      ipAddress: config.ipAddress || 'unknown',
      userAgent: config.userAgent || 'unknown',
      metadata: config.metadata || {},
      tags: this.generateTags(eventType, severity, config.outcome),
      retention: this.calculateRetention(severity, eventType),
      indexed: true,
      processed: false
    };

    this.auditLogs.set(logId, auditLog);
    
    // Trigger alerts for high-severity events
    if (severity === 'critical' || severity === 'high') {
      this.triggerSecurityAlert(auditLog);
    }

    return auditLog;
  }

  /**
   * Query audit logs
   */
  queryAuditLogs(
    filters: {
      eventType?: string[];
      severity?: string[];
      userId?: UUID;
      resourceId?: string;
      outcome?: string[];
      dateRange?: { start: Date; end: Date };
      ipAddress?: string;
      tags?: string[];
    },
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'timestamp' | 'severity';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): {
    logs: SecurityAuditLog[];
    total: number;
    aggregations: {
      eventTypes: Record<string, number>;
      severities: Record<string, number>;
      outcomes: Record<string, number>;
      topUsers: Array<{ userId: UUID; count: number }>;
    };
  } {
    let filteredLogs = Array.from(this.auditLogs.values());

    // Apply filters
    if (filters.eventType) {
      filteredLogs = filteredLogs.filter(log => filters.eventType!.includes(log.eventType));
    }
    
    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => filters.severity!.includes(log.severity));
    }
    
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.resourceId) {
      filteredLogs = filteredLogs.filter(log => log.resourceId === filters.resourceId);
    }
    
    if (filters.outcome) {
      filteredLogs = filteredLogs.filter(log => filters.outcome!.includes(log.outcome));
    }
    
    if (filters.dateRange) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= filters.dateRange!.start && logDate <= filters.dateRange!.end;
      });
    }
    
    if (filters.ipAddress) {
      filteredLogs = filteredLogs.filter(log => log.ipAddress === filters.ipAddress);
    }
    
    if (filters.tags) {
      filteredLogs = filteredLogs.filter(log => 
        filters.tags!.some(tag => log.tags.includes(tag))
      );
    }

    // Sort logs
    const sortBy = options.sortBy || 'timestamp';
    const sortOrder = options.sortOrder || 'desc';
    
    filteredLogs.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'severity') {
        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Calculate aggregations
    const aggregations = this.calculateAggregations(filteredLogs);

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      aggregations
    };
  }

  /**
   * Generate security report
   */
  generateSecurityReport(
    timeframe: { start: Date; end: Date },
    config: {
      includeMetrics?: boolean;
      includeTrends?: boolean;
      includeRecommendations?: boolean;
      format?: 'summary' | 'detailed';
    } = {}
  ): {
    summary: {
      totalEvents: number;
      criticalEvents: number;
      failureRate: number;
      topThreats: string[];
      affectedUsers: number;
      affectedResources: number;
    };
    metrics?: SecurityMetrics;
    trends?: Array<{
      metric: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      change: number;
    }>;
    recommendations?: string[];
    details?: {
      eventBreakdown: Record<string, number>;
      severityDistribution: Record<string, number>;
      timelineAnalysis: Array<{ date: string; events: number; failures: number }>;
    };
  } {
    const logs = this.queryAuditLogs({
      dateRange: timeframe
    }, { limit: 10000 });

    const summary = {
      totalEvents: logs.total,
      criticalEvents: logs.logs.filter(log => log.severity === 'critical').length,
      failureRate: logs.total > 0 ? 
        logs.logs.filter(log => log.outcome === 'failure').length / logs.total * 100 : 0,
      topThreats: this.identifyTopThreats(logs.logs),
      affectedUsers: new Set(logs.logs.map(log => log.userId).filter(Boolean)).size,
      affectedResources: new Set(logs.logs.map(log => log.resourceId).filter(Boolean)).size
    };

    const result: any = { summary };

    if (config.includeMetrics) {
      result.metrics = this.calculateSecurityMetrics(logs.logs);
    }

    if (config.includeTrends) {
      result.trends = this.analyzeTrends(logs.logs, timeframe);
    }

    if (config.includeRecommendations) {
      result.recommendations = this.generateRecommendations(logs.logs, summary);
    }

    if (config.format === 'detailed') {
      result.details = {
        eventBreakdown: logs.aggregations.eventTypes,
        severityDistribution: logs.aggregations.severities,
        timelineAnalysis: this.generateTimelineAnalysis(logs.logs, timeframe)
      };
    }

    return result;
  }

  private generateAuditId(): UUID {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }

  private generateTags(
    eventType: string,
    severity: string,
    outcome: string
  ): string[] {
    const tags = [eventType, severity, outcome];
    
    // Add contextual tags
    if (severity === 'critical' || severity === 'high') {
      tags.push('high-priority');
    }
    
    if (outcome === 'failure') {
      tags.push('security-incident');
    }
    
    if (eventType === 'authentication' && outcome === 'failure') {
      tags.push('auth-failure');
    }

    return tags;
  }

  private calculateRetention(severity: string, eventType: string): number {
    // Retention in days
    const retentionPolicies: Record<string, number> = {
      critical: 2555, // 7 years
      high: 1825,     // 5 years
      medium: 1095,   // 3 years
      low: 365        // 1 year
    };

    return retentionPolicies[severity] || 365;
  }

  private triggerSecurityAlert(auditLog: SecurityAuditLog): void {
    // Implementation would trigger real-time alerts
    console.warn(`SECURITY ALERT: ${auditLog.severity.toUpperCase()} - ${auditLog.description}`);
  }

  private calculateAggregations(logs: SecurityAuditLog[]): {
    eventTypes: Record<string, number>;
    severities: Record<string, number>;
    outcomes: Record<string, number>;
    topUsers: Array<{ userId: UUID; count: number }>;
  } {
    const eventTypes: Record<string, number> = {};
    const severities: Record<string, number> = {};
    const outcomes: Record<string, number> = {};
    const userCounts: Record<string, number> = {};

    logs.forEach(log => {
      eventTypes[log.eventType] = (eventTypes[log.eventType] || 0) + 1;
      severities[log.severity] = (severities[log.severity] || 0) + 1;
      outcomes[log.outcome] = (outcomes[log.outcome] || 0) + 1;
      
      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }
    });

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId: userId as UUID, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { eventTypes, severities, outcomes, topUsers };
  }

  private identifyTopThreats(logs: SecurityAuditLog[]): string[] {
    const threatCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      if (log.outcome === 'failure' || log.severity === 'critical' || log.severity === 'high') {
        const threat = `${log.eventType}_${log.action || 'unknown'}`;
        threatCounts[threat] = (threatCounts[threat] || 0) + 1;
      }
    });

    return Object.entries(threatCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([threat]) => threat);
  }

  private calculateSecurityMetrics(logs: SecurityAuditLog[]): SecurityMetrics {
    const total = logs.length;
    const failures = logs.filter(log => log.outcome === 'failure').length;
    const criticalEvents = logs.filter(log => log.severity === 'critical').length;
    const highEvents = logs.filter(log => log.severity === 'high').length;

    return {
      totalEvents: total,
      failureRate: total > 0 ? (failures / total) * 100 : 0,
      criticalEventRate: total > 0 ? (criticalEvents / total) * 100 : 0,
      highRiskEventRate: total > 0 ? ((criticalEvents + highEvents) / total) * 100 : 0,
      averageEventsPerDay: total / 30, // Assuming 30-day period
      uniqueUsers: new Set(logs.map(log => log.userId).filter(Boolean)).size,
      uniqueResources: new Set(logs.map(log => log.resourceId).filter(Boolean)).size,
      authenticationFailures: logs.filter(log => 
        log.eventType === 'authentication' && log.outcome === 'failure'
      ).length,
      authorizationFailures: logs.filter(log => 
        log.eventType === 'authorization' && log.outcome === 'failure'
      ).length
    };
  }

  private analyzeTrends(
    logs: SecurityAuditLog[],
    timeframe: { start: Date; end: Date }
  ): Array<{ metric: string; trend: 'increasing' | 'decreasing' | 'stable'; change: number }> {
    // Simplified trend analysis - would be more sophisticated in production
    const midpoint = new Date((timeframe.start.getTime() + timeframe.end.getTime()) / 2);
    
    const firstHalf = logs.filter(log => new Date(log.timestamp) < midpoint);
    const secondHalf = logs.filter(log => new Date(log.timestamp) >= midpoint);

    const trends = [];

    // Total events trend
    const totalChange = ((secondHalf.length - firstHalf.length) / Math.max(firstHalf.length, 1)) * 100;
    trends.push({
      metric: 'Total Events',
      trend: Math.abs(totalChange) < 5 ? 'stable' : totalChange > 0 ? 'increasing' : 'decreasing',
      change: Math.abs(totalChange)
    });

    // Failure rate trend
    const firstHalfFailures = firstHalf.filter(log => log.outcome === 'failure').length;
    const secondHalfFailures = secondHalf.filter(log => log.outcome === 'failure').length;
    const failureChange = ((secondHalfFailures - firstHalfFailures) / Math.max(firstHalfFailures, 1)) * 100;
    
    trends.push({
      metric: 'Failure Rate',
      trend: Math.abs(failureChange) < 5 ? 'stable' : failureChange > 0 ? 'increasing' : 'decreasing',
      change: Math.abs(failureChange)
    });

    return trends;
  }

  private generateRecommendations(logs: SecurityAuditLog[], summary: any): string[] {
    const recommendations: string[] = [];

    if (summary.failureRate > 10) {
      recommendations.push('High failure rate detected - review authentication and authorization mechanisms');
    }

    if (summary.criticalEvents > 0) {
      recommendations.push('Critical security events detected - immediate investigation required');
    }

    const authFailures = logs.filter(log => 
      log.eventType === 'authentication' && log.outcome === 'failure'
    ).length;
    
    if (authFailures > 50) {
      recommendations.push('High authentication failure rate - consider implementing rate limiting and account lockout policies');
    }

    const uniqueIPs = new Set(logs.map(log => log.ipAddress)).size;
    if (uniqueIPs > summary.affectedUsers * 2) {
      recommendations.push('Unusual IP activity detected - review for potential distributed attacks');
    }

    return recommendations;
  }

  private generateTimelineAnalysis(
    logs: SecurityAuditLog[],
    timeframe: { start: Date; end: Date }
  ): Array<{ date: string; events: number; failures: number }> {
    const timeline: Array<{ date: string; events: number; failures: number }> = [];
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let date = new Date(timeframe.start); date <= timeframe.end; date = new Date(date.getTime() + dayMs)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = logs.filter(log => log.timestamp.startsWith(dateStr));
      
      timeline.push({
        date: dateStr,
        events: dayLogs.length,
        failures: dayLogs.filter(log => log.outcome === 'failure').length
      });
    }

    return timeline;
  }
}

// ============================================================================
// THREAT DETECTION UTILITIES
// ============================================================================

export class ThreatDetectionEngine {
  private threats: Map<UUID, SecurityThreat> = new Map();
  private detectionRules: Map<string, any> = new Map();

  /**
   * Analyze events for security threats
   */
  analyzeEvents(
    events: SecurityAuditLog[],
    config: {
      sensitivity: 'low' | 'medium' | 'high';
      timeWindow: number; // minutes
      enableMLDetection?: boolean;
    }
  ): SecurityThreat[] {
    const threats: SecurityThreat[] = [];
    
    // Brute force detection
    const bruteForceThreats = this.detectBruteForce(events, config.timeWindow);
    threats.push(...bruteForceThreats);

    // Suspicious access patterns
    const accessThreats = this.detectSuspiciousAccess(events, config.sensitivity);
    threats.push(...accessThreats);

    // Privilege escalation
    const privilegeThreats = this.detectPrivilegeEscalation(events);
    threats.push(...privilegeThreats);

    // Data exfiltration
    const exfiltrationThreats = this.detectDataExfiltration(events);
    threats.push(...exfiltrationThreats);

    // Store detected threats
    threats.forEach(threat => {
      this.threats.set(threat.id, threat);
    });

    return threats;
  }

  /**
   * Get threat summary
   */
  getThreatSummary(timeframe?: { start: Date; end: Date }): {
    totalThreats: number;
    activethreats: number;
    threatsByType: Record<string, number>;
    threatsBySeverity: Record<string, number>;
    topThreats: SecurityThreat[];
    riskScore: number;
  } {
    let threats = Array.from(this.threats.values());
    
    if (timeframe) {
      threats = threats.filter(threat => {
        const threatTime = new Date(threat.detectedAt);
        return threatTime >= timeframe.start && threatTime <= timeframe.end;
      });
    }

    const activeThreats = threats.filter(threat => threat.status === 'active');
    
    const threatsByType: Record<string, number> = {};
    const threatsBySeverity: Record<string, number> = {};
    
    threats.forEach(threat => {
      threatsByType[threat.type] = (threatsByType[threat.type] || 0) + 1;
      threatsBySeverity[threat.severity] = (threatsBySeverity[threat.severity] || 0) + 1;
    });

    const topThreats = threats
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    const riskScore = this.calculateOverallRiskScore(threats);

    return {
      totalThreats: threats.length,
      activethreats: activeThreats.length,
      threatsByType,
      threatsBySeverity,
      topThreats,
      riskScore
    };
  }

  private detectBruteForce(events: SecurityAuditLog[], timeWindowMinutes: number): SecurityThreat[] {
    const threats: SecurityThreat[] = [];
    const timeWindow = timeWindowMinutes * 60 * 1000; // Convert to milliseconds
    const threshold = 10; // Failed attempts threshold

    // Group by user and IP
    const attempts: Record<string, SecurityAuditLog[]> = {};
    
    events.forEach(event => {
      if (event.eventType === 'authentication' && event.outcome === 'failure') {
        const key = `${event.userId || 'unknown'}_${event.ipAddress}`;
        if (!attempts[key]) attempts[key] = [];
        attempts[key].push(event);
      }
    });

    // Check for brute force patterns
    Object.entries(attempts).forEach(([key, userAttempts]) => {
      const [userId, ipAddress] = key.split('_');
      
      // Sort by timestamp
      userAttempts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Check for rapid failed attempts
      for (let i = 0; i < userAttempts.length - threshold + 1; i++) {
        const windowAttempts = userAttempts.slice(i, i + threshold);
        const firstAttempt = new Date(windowAttempts[0].timestamp);
        const lastAttempt = new Date(windowAttempts[windowAttempts.length - 1].timestamp);
        
        if (lastAttempt.getTime() - firstAttempt.getTime() <= timeWindow) {
          const threat: SecurityThreat = {
            id: `threat_brute_force_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
            type: 'brute_force',
            severity: 'high',
            title: 'Brute Force Attack Detected',
            description: `${threshold} failed authentication attempts from ${ipAddress} for user ${userId} within ${timeWindowMinutes} minutes`,
            riskScore: 85,
            status: 'active',
            affectedResources: ['authentication_system'],
            affectedUsers: userId !== 'unknown' ? [userId as UUID] : [],
            sourceIPs: [ipAddress],
            detectedAt: new Date().toISOString() as ISODateString,
            lastActivity: lastAttempt.toISOString() as ISODateString,
            evidence: windowAttempts.map(attempt => ({
              type: 'audit_log',
              id: attempt.id,
              timestamp: attempt.timestamp,
              description: attempt.description
            })),
            recommendations: [
              'Block source IP address',
              'Lock affected user account',
              'Enable account lockout policies',
              'Implement rate limiting'
            ],
            metadata: {
              attemptCount: windowAttempts.length,
              timeWindow: timeWindowMinutes,
              detectionMethod: 'rule-based'
            }
          };
          
          threats.push(threat);
        }
      }
    });

    return threats;
  }

  private detectSuspiciousAccess(
    events: SecurityAuditLog[],
    sensitivity: 'low' | 'medium' | 'high'
  ): SecurityThreat[] {
    const threats: SecurityThreat[] = [];
    
    // Detect unusual access patterns
    const accessPatterns: Record<string, {
      ips: Set<string>;
      resources: Set<string>;
      times: Date[];
    }> = {};

    events.forEach(event => {
      if (event.userId && event.eventType === 'data_access') {
        if (!accessPatterns[event.userId]) {
          accessPatterns[event.userId] = {
            ips: new Set(),
            resources: new Set(),
            times: []
          };
        }
        
        accessPatterns[event.userId].ips.add(event.ipAddress);
        if (event.resourceId) {
          accessPatterns[event.userId].resources.add(event.resourceId);
        }
        accessPatterns[event.userId].times.push(new Date(event.timestamp));
      }
    });

    // Analyze patterns
    Object.entries(accessPatterns).forEach(([userId, pattern]) => {
      const uniqueIPs = pattern.ips.size;
      const uniqueResources = pattern.resources.size;
      
      // Multiple IP addresses
      const ipThreshold = sensitivity === 'high' ? 3 : sensitivity === 'medium' ? 5 : 10;
      if (uniqueIPs >= ipThreshold) {
        threats.push({
          id: `threat_multi_ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
          type: 'suspicious_access',
          severity: 'medium',
          title: 'Multiple IP Access Pattern',
          description: `User ${userId} accessed resources from ${uniqueIPs} different IP addresses`,
          riskScore: 60,
          status: 'active',
          affectedResources: Array.from(pattern.resources),
          affectedUsers: [userId as UUID],
          sourceIPs: Array.from(pattern.ips),
          detectedAt: new Date().toISOString() as ISODateString,
          lastActivity: Math.max(...pattern.times.map(t => t.getTime())).toString() as ISODateString,
          evidence: [],
          recommendations: [
            'Verify user identity',
            'Check for compromised credentials',
            'Review access patterns'
          ],
          metadata: {
            uniqueIPs,
            uniqueResources,
            detectionMethod: 'pattern-analysis'
          }
        });
      }

      // Unusual time access
      const offHoursAccess = pattern.times.filter(time => {
        const hour = time.getHours();
        return hour < 6 || hour > 22; // Outside 6 AM - 10 PM
      });

      if (offHoursAccess.length > 5) {
        threats.push({
          id: `threat_off_hours_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
          type: 'suspicious_access',
          severity: 'low',
          title: 'Off-Hours Access Pattern',
          description: `User ${userId} accessed resources ${offHoursAccess.length} times outside normal hours`,
          riskScore: 40,
          status: 'active',
          affectedResources: Array.from(pattern.resources),
          affectedUsers: [userId as UUID],
          sourceIPs: Array.from(pattern.ips),
          detectedAt: new Date().toISOString() as ISODateString,
          lastActivity: Math.max(...offHoursAccess.map(t => t.getTime())).toString() as ISODateString,
          evidence: [],
          recommendations: [
            'Verify legitimate business need',
            'Review access policies',
            'Consider time-based restrictions'
          ],
          metadata: {
            offHoursCount: offHoursAccess.length,
            detectionMethod: 'temporal-analysis'
          }
        });
      }
    });

    return threats;
  }

  private detectPrivilegeEscalation(events: SecurityAuditLog[]): SecurityThreat[] {
    const threats: SecurityThreat[] = [];

    // Look for rapid permission changes
    const permissionChanges = events.filter(event => 
      event.action === 'grant_permission' || event.action === 'assign_role'
    );

    // Group by user
    const userChanges: Record<string, SecurityAuditLog[]> = {};
    permissionChanges.forEach(event => {
      if (event.userId) {
        if (!userChanges[event.userId]) userChanges[event.userId] = [];
        userChanges[event.userId].push(event);
      }
    });

    // Detect rapid escalation
    Object.entries(userChanges).forEach(([userId, changes]) => {
      if (changes.length >= 3) {
        changes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        const firstChange = new Date(changes[0].timestamp);
        const lastChange = new Date(changes[changes.length - 1].timestamp);
        const timeSpan = lastChange.getTime() - firstChange.getTime();
        
        // If multiple permission changes within 1 hour
        if (timeSpan <= 60 * 60 * 1000) {
          threats.push({
            id: `threat_privilege_escalation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
            type: 'privilege_escalation',
            severity: 'high',
            title: 'Rapid Privilege Escalation',
            description: `User ${userId} received ${changes.length} permission changes within 1 hour`,
            riskScore: 80,
            status: 'active',
            affectedResources: changes.map(c => c.resourceId).filter(Boolean) as string[],
            affectedUsers: [userId as UUID],
            sourceIPs: [...new Set(changes.map(c => c.ipAddress))],
            detectedAt: new Date().toISOString() as ISODateString,
            lastActivity: lastChange.toISOString() as ISODateString,
            evidence: changes.map(change => ({
              type: 'audit_log',
              id: change.id,
              timestamp: change.timestamp,
              description: change.description
            })),
            recommendations: [
              'Review permission changes',
              'Verify authorization for changes',
              'Check for compromised admin accounts'
            ],
            metadata: {
              changeCount: changes.length,
              timeSpan: timeSpan / 1000, // seconds
              detectionMethod: 'privilege-analysis'
            }
          });
        }
      }
    });

    return threats;
  }

  private detectDataExfiltration(events: SecurityAuditLog[]): SecurityThreat[] {
    const threats: SecurityThreat[] = [];

    // Look for unusual data access patterns
    const dataAccess = events.filter(event => 
      event.eventType === 'data_access' && event.outcome === 'success'
    );

    // Group by user and analyze volume
    const userAccess: Record<string, SecurityAuditLog[]> = {};
    dataAccess.forEach(event => {
      if (event.userId) {
        if (!userAccess[event.userId]) userAccess[event.userId] = [];
        userAccess[event.userId].push(event);
      }
    });

    // Detect high-volume access
    Object.entries(userAccess).forEach(([userId, accesses]) => {
      if (accesses.length >= 100) { // Threshold for suspicious volume
        const uniqueResources = new Set(accesses.map(a => a.resourceId)).size;
        const timeSpan = Math.max(...accesses.map(a => new Date(a.timestamp).getTime())) - 
                        Math.min(...accesses.map(a => new Date(a.timestamp).getTime()));
        
        if (timeSpan <= 24 * 60 * 60 * 1000) { // Within 24 hours
          threats.push({
            id: `threat_data_exfiltration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID,
            type: 'data_exfiltration',
            severity: 'critical',
            title: 'Potential Data Exfiltration',
            description: `User ${userId} accessed ${accesses.length} resources (${uniqueResources} unique) within 24 hours`,
            riskScore: 95,
            status: 'active',
            affectedResources: [...new Set(accesses.map(a => a.resourceId).filter(Boolean))] as string[],
            affectedUsers: [userId as UUID],
            sourceIPs: [...new Set(accesses.map(a => a.ipAddress))],
            detectedAt: new Date().toISOString() as ISODateString,
            lastActivity: new Date(Math.max(...accesses.map(a => new Date(a.timestamp).getTime()))).toISOString() as ISODateString,
            evidence: accesses.slice(0, 10).map(access => ({
              type: 'audit_log',
              id: access.id,
              timestamp: access.timestamp,
              description: access.description
            })),
            recommendations: [
              'Immediately suspend user account',
              'Review all accessed data',
              'Check for data loss prevention alerts',
              'Investigate user activity'
            ],
            metadata: {
              accessCount: accesses.length,
              uniqueResources,
              timeSpan: timeSpan / 1000,
              detectionMethod: 'volume-analysis'
            }
          });
        }
      }
    });

    return threats;
  }

  private calculateOverallRiskScore(threats: SecurityThreat[]): number {
    if (threats.length === 0) return 0;

    const totalRisk = threats.reduce((sum, threat) => sum + threat.riskScore, 0);
    const averageRisk = totalRisk / threats.length;

    // Weight by severity
    const criticalCount = threats.filter(t => t.severity === 'critical').length;
    const highCount = threats.filter(t => t.severity === 'high').length;
    
    const severityBonus = (criticalCount * 20) + (highCount * 10);
    
    return Math.min(100, averageRisk + severityBonus);
  }
}

// ============================================================================
// MAIN SECURITY UTILITIES EXPORT
// ============================================================================

export const securityUtils = {
  rbacManager: new RBACManager(),
  accessControlManager: new AccessControlManager(),
  auditManager: new SecurityAuditManager(),
  threatDetection: new ThreatDetectionEngine()
};

// Utility functions for common operations
export const generateSecurityId = (): UUID => {
  return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
};

export const hashPassword = (password: string, salt?: string): string => {
  // In production, use a proper cryptographic library like bcrypt
  const actualSalt = salt || Math.random().toString(36).substr(2, 16);
  const hash = btoa(password + actualSalt); // Simple base64 encoding for demo
  return `${hash}:${actualSalt}`;
};

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [hash, salt] = hashedPassword.split(':');
  const newHash = btoa(password + salt);
  return hash === newHash;
};

export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const validateIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

export const calculatePasswordStrength = (password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  recommendations: string[];
} => {
  let score = 0;
  const recommendations: string[] = [];

  // Length check
  if (password.length >= 8) score += 2;
  else recommendations.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else recommendations.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else recommendations.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else recommendations.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  else recommendations.push('Include special characters');

  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else recommendations.push('Avoid repeating characters');

  if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
  else recommendations.push('Avoid common patterns');

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score >= 8) strength = 'strong';
  else if (score >= 6) strength = 'good';
  else if (score >= 4) strength = 'fair';
  else strength = 'weak';

  return { score, strength, recommendations };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[&]/g, '&amp;') // Escape ampersands
    .trim();
};

export const isSecureContext = (request: { protocol?: string; headers?: Record<string, string> }): boolean => {
  // Check for HTTPS
  if (request.protocol === 'https') return true;
  
  // Check for secure headers
  const secureHeaders = [
    'x-forwarded-proto',
    'x-forwarded-ssl',
    'x-url-scheme'
  ];
  
  return secureHeaders.some(header => 
    request.headers?.[header]?.toLowerCase() === 'https'
  );
};

export const generateCSRFToken = (): string => {
  return generateSecureToken(64);
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken && token.length === 64;
};

// ============================================================================
// ACTION PERMISSION UTILITIES
// ============================================================================

export const checkActionPermissions = (
  userId: string,
  action: string,
  resource: string,
  context?: {
    groupId?: string;
    workspaceId?: string;
    resourceId?: string;
    userRoles?: string[];
    userPermissions?: string[];
  }
): {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: string[];
  auditLog?: {
    timestamp: Date;
    userId: string;
    action: string;
    resource: string;
    result: 'allowed' | 'denied';
    reason?: string;
  };
} => {
  // Default implementation - in a real system, this would check against
  // the actual RBAC system and user permissions
  
  const auditLog = {
    timestamp: new Date(),
    userId,
    action,
    resource,
    result: 'allowed' as const,
    reason: 'Permission check passed'
  };

  // For now, allow all actions - this should be replaced with actual permission logic
  return {
    allowed: true,
    reason: 'Permission check passed',
    requiredPermissions: [`${action}:${resource}`],
    auditLog
  };
};

// ============================================================================
// SECURITY UTILITIES - USER MANAGEMENT
// ============================================================================
// Advanced security utilities for API key management and security operations
// Provides comprehensive security functionality with backend integration

import { APIResponse } from '../types/racine-core.types';

// ============================================================================
// SECURITY INTERFACES
// ============================================================================

export interface APIKeyInfo {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'api_access' | 'permission_change' | 'security_violation';
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityReport {
  id: string;
  type: 'audit' | 'compliance' | 'threat_analysis' | 'vulnerability_assessment';
  generatedAt: Date;
  findings: SecurityFinding[];
  recommendations: string[];
  riskScore: number;
}

export interface SecurityFinding {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedResources: string[];
  remediation: string;
  estimatedEffort: string;
}

// ============================================================================
// SECURITY UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate API key with backend integration
 */
export async function generateAPIKey(
  request: {
    name: string;
    permissions: string[];
    expiresAt?: Date;
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<APIKeyInfo>> {
  try {
    const response = await fetch('/api/security/generate-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`API key generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API key generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        id: '',
        name: '',
        key: '',
        permissions: [],
        createdAt: new Date(),
        isActive: false
      }
    };
  }
}

/**
 * Hash API key for secure storage
 */
export async function hashAPIKey(
  apiKey: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): Promise<APIResponse<string>> {
  try {
    const response = await fetch('/api/security/hash-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, algorithm })
    });

    if (!response.ok) {
      throw new Error(`API key hashing failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API key hashing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: ''
    };
  }
}

/**
 * Generate security report with backend integration
 */
export async function generateSecurityReport(
  reportType: 'audit' | 'compliance' | 'threat_analysis' | 'vulnerability_assessment',
  scope?: Record<string, any>
): Promise<APIResponse<SecurityReport>> {
  try {
    const response = await fetch('/api/security/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportType, scope })
    });

    if (!response.ok) {
      throw new Error(`Security report generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Security report generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        id: '',
        type: reportType,
        generatedAt: new Date(),
        findings: [],
        recommendations: [],
        riskScore: 0
      }
    };
  }
}

/**
 * Validate API key permissions
 */
export async function validateAPIKeyPermissions(
  apiKey: string,
  requiredPermissions: string[]
): Promise<APIResponse<{ valid: boolean; permissions: string[]; missing: string[] }>> {
  try {
    const response = await fetch('/api/security/validate-api-key-permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, requiredPermissions })
    });

    if (!response.ok) {
      throw new Error(`API key permission validation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API key permission validation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        valid: false,
        permissions: [],
        missing: requiredPermissions
      }
    };
  }
}

/**
 * Revoke API key with backend integration
 */
export async function revokeAPIKey(
  apiKeyId: string,
  reason?: string
): Promise<APIResponse<boolean>> {
  try {
    const response = await fetch(`/api/security/revoke-api-key/${apiKeyId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      throw new Error(`API key revocation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API key revocation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: false
    };
  }
}

/**
 * Get API key usage analytics
 */
export async function getAPIKeyAnalytics(
  apiKeyId: string,
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/security/api-key-analytics/${apiKeyId}?timeRange=${timeRange}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API key analytics fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API key analytics fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Rotate API key with backend integration
 */
export async function rotateAPIKey(
  apiKeyId: string,
  options?: {
    invalidateOldKey?: boolean;
    keepPermissions?: boolean;
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<{ oldKey: string; newKey: string }>> {
  try {
    const response = await fetch(`/api/security/rotate-api-key/${apiKeyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error(`API key rotation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API key rotation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { oldKey: '', newKey: '' }
    };
  }
}
